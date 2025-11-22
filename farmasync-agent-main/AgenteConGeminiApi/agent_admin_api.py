from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import requests
import os
import re

app = Flask(__name__)
CORS(app)

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
INV_URL = os.environ.get('INVENTORY_URL', 'http://localhost:8016/farmasync/inventario')


def get_db():
    client = MongoClient(MONGO_URL)
    db = client['farmasync_producto']
    return client, db


def build_card_html(product):
    return f"""
    <div style='border:1px solid #e5e7eb;padding:12px;border-radius:8px;max-width:320px;'>
      <img src='{product.get('imagen_url','') or ''}' alt='{product.get('nombre','')}' style='width:100%;height:160px;object-fit:cover;border-radius:6px;margin-bottom:8px;' />
      <h3 style='margin:0 0 6px 0;font-size:16px'>{product.get('nombre','')}</h3>
      <p style='margin:0 0 6px 0;color:#6b7280'>{product.get('descripcion','')}</p>
      <div style='font-weight:600;'>Precio: ${product.get('precio',0):.2f}</div>
      <div style='color:#6b7280;'>Stock: {product.get('stock',0)}</div>
    </div>
    """


@app.route('/admin/product-session/start', methods=['POST'])
def start_session():
    """Inicia una sesión interactiva de creación de producto."""
    client, db = get_db()
    sessions = db['product_creation_sessions']
    session = {
        'state': {},
        'step': 'nombre',
        'created_at': datetime.utcnow(),
        'completed': False,
    }
    res = sessions.insert_one(session)
    session_id = str(res.inserted_id)
    client.close()
    return jsonify({'sessionId': session_id, 'question': '¿Cuál es el nombre del producto?'}), 201


@app.route('/admin/product-session/<session_id>/continue', methods=['POST'])
def continue_session(session_id):
    """Continúa la sesión con la respuesta del admin.
    Body: {"answer": "..."}
    """
    data = request.get_json() or {}
    answer = data.get('answer', '')
    client, db = get_db()
    sessions = db['product_creation_sessions']
    doc = sessions.find_one({'_id': ObjectId(session_id)})
    if not doc:
        client.close()
        return jsonify({'ok': False, 'error': 'Sesión no encontrada'}), 404
    if doc.get('completed'):
        client.close()
        return jsonify({'ok': False, 'error': 'Sesión ya completada'}), 400

    state = doc.get('state', {})
    step = doc.get('step', 'nombre')

    def save_state(new_state, next_step):
        sessions.update_one({'_id': ObjectId(session_id)}, {'$set': {'state': new_state, 'step': next_step}})

    step_lower = step.lower()
    if step_lower == 'nombre':
        val = answer.strip()
        if not val:
            client.close()
            return jsonify({'ok': False, 'error': 'El nombre no puede estar vacío', 'question': '¿Cuál es el nombre del producto?'}), 400
        state['nombre'] = val
        save_state(state, 'descripcion')
        client.close()
        return jsonify({'ok': True, 'question': 'Escribe una descripción (puedes dejarla vacía):'})

    if step_lower == 'descripcion':
        state['descripcion'] = answer.strip() if answer is not None else ''
        save_state(state, 'precio')
        client.close()
        return jsonify({'ok': True, 'question': 'Indica el precio (número mayor a 0):'})

    if step_lower == 'precio':
        try:
            precio = float(answer)
            if precio <= 0:
                raise ValueError('Precio debe ser mayor a 0')
        except Exception:
            client.close()
            return jsonify({'ok': False, 'error': 'Precio inválido. Ingresa un número mayor a 0.', 'question': 'Indica el precio (número mayor a 0):'}), 400
        state['precio'] = precio
        save_state(state, 'stock')
        client.close()
        return jsonify({'ok': True, 'question': 'Indica la cantidad de stock (entero >= 0):'})

    if step_lower == 'stock':
        try:
            stock = int(float(answer))
            if stock < 0:
                raise ValueError('Stock debe ser >= 0')
        except Exception:
            client.close()
            return jsonify({'ok': False, 'error': 'Stock inválido. Ingresa un entero mayor o igual a 0.', 'question': 'Indica la cantidad de stock (entero >= 0):'}), 400
        state['stock'] = stock
        save_state(state, 'provedor_id')
        client.close()
        return jsonify({'ok': True, 'question': 'Indica el id del proveedor (provedor_id):'})

    if step_lower == 'provedor_id':
        pid = answer.strip()
        if not pid:
            client.close()
            return jsonify({'ok': False, 'error': 'provedor_id no puede estar vacío', 'question': 'Indica el id del proveedor (provedor_id):'}), 400
        state['provedor_id'] = pid
        save_state(state, 'imagen_url')
        client.close()
        return jsonify({'ok': True, 'question': 'Opcional: indica URL de imagen o deja en blanco:'})

    if step_lower == 'imagen_url':
        state['imagen_url'] = answer.strip() if answer is not None else ''
        save_state(state, 'confirm')
        summary = (
            f"Resumen:\nNombre: {state.get('nombre')}\nDescripcion: {state.get('descripcion')}\n"
            f"Precio: {state.get('precio')}\nStock: {state.get('stock')}\nProveedor: {state.get('provedor_id')}\nImagen: {state.get('imagen_url')}\n\n"
            "¿Confirmas la creación del producto? (si/no)"
        )
        client.close()
        return jsonify({'ok': True, 'question': summary})

    if step_lower == 'confirm':
        ans = answer.strip().lower()
        if ans not in ('si', 'sí', 's', 'yes', 'y'):
            sessions.update_one({'_id': ObjectId(session_id)}, {'$set': {'completed': True, 'canceled': True}})
            client.close()
            return jsonify({'ok': True, 'canceled': True, 'message': 'Creación cancelada por el usuario.'})

        # create product (same logic as create endpoint)
        producto_doc = {
            'nombre': state.get('nombre'),
            'descripcion': state.get('descripcion') or '',
            'precio': float(state.get('precio') or 0),
            'stock': int(state.get('stock') or 0),
            'provedor_id': state.get('provedor_id') or '',
            'imagen_url': state.get('imagen_url') or ''
        }

        collection = db['productos']
        res = collection.insert_one(producto_doc)
        producto_doc['id'] = str(res.inserted_id)

        inventario_response = None
        try:
            payload = {
                'nombre': producto_doc['nombre'],
                'descripcion': producto_doc['descripcion'],
                'precio': producto_doc['precio'],
                'stock': producto_doc['stock'],
                'provedor_id': producto_doc['provedor_id'],
                'imagen_url': producto_doc['imagen_url']
            }
            r = requests.post(INV_URL, json=payload, timeout=5)
            if r.status_code in (200, 201):
                inventario_response = r.json()
            else:
                inventario_response = {'error': f'status {r.status_code}', 'body': r.text}
        except Exception as e:
            inventario_response = {'error': str(e)}

        card_html = build_card_html(producto_doc)

        sessions.update_one({'_id': ObjectId(session_id)}, {'$set': {'completed': True, 'result': {'producto': producto_doc}}})
        client.close()
        return jsonify({'ok': True, 'created': True, 'producto': producto_doc, 'inventario': inventario_response, 'cardHtml': card_html})

    client.close()
    return jsonify({'ok': False, 'error': 'Paso desconocido en la sesión'}), 400


@app.route('/admin/product/create', methods=['POST'])
def http_create_product():
    """Crea el producto inmediatamente. Body JSON with keys: nombre, descripcion, precio, stock, provedor_id, imagen_url"""
    body = request.get_json() or {}
    nombre = body.get('nombre')
    if not nombre:
        return jsonify({'ok': False, 'error': 'nombre es requerido'}), 400
    descripcion = body.get('descripcion', '')
    try:
        precio = float(body.get('precio', 0))
    except Exception:
        return jsonify({'ok': False, 'error': 'precio inválido'}), 400
    try:
        stock = int(float(body.get('stock', 0)))
    except Exception:
        return jsonify({'ok': False, 'error': 'stock inválido'}), 400
    provedor_id = body.get('provedor_id', '')
    imagen_url = body.get('imagen_url', '')

    client, db = get_db()
    collection = db['productos']
    producto_doc = {
        'nombre': nombre,
        'descripcion': descripcion,
        'precio': precio,
        'stock': stock,
        'provedor_id': provedor_id,
        'imagen_url': imagen_url
    }
    res = collection.insert_one(producto_doc)
    producto_doc['id'] = str(res.inserted_id)

    inventario_response = None
    try:
        payload = {
            'nombre': producto_doc['nombre'],
            'descripcion': producto_doc['descripcion'],
            'precio': producto_doc['precio'],
            'stock': producto_doc['stock'],
            'provedor_id': producto_doc['provedor_id'],
            'imagen_url': producto_doc['imagen_url']
        }
        r = requests.post(INV_URL, json=payload, timeout=5)
        if r.status_code in (200, 201):
            inventario_response = r.json()
        else:
            inventario_response = {'error': f'status {r.status_code}', 'body': r.text}
    except Exception as e:
        inventario_response = {'error': str(e)}

    card_html = build_card_html(producto_doc)
    client.close()
    return jsonify({'ok': True, 'producto': producto_doc, 'inventario': inventario_response, 'cardHtml': card_html}), 201


# Note: This agent will use the Usuarios microservicio HTTP API instead of writing directly to SQL.
USER_MS_URL = os.environ.get('USER_MS_URL', 'http://localhost:8013')
ROLE_PATH = '/farmasync/roles'
USERS_PATH = '/farmasync/usuarios'


@app.route('/admin/user-session/start', methods=['POST'])
def start_user_session():
    """Inicia una sesión interactiva de creación de usuario."""
    client, db = get_db()
    sessions = db['user_creation_sessions']
    session = {
        'state': {},
        'step': 'nombre',
        'created_at': datetime.utcnow(),
        'completed': False,
    }
    res = sessions.insert_one(session)
    session_id = str(res.inserted_id)
    client.close()
    return jsonify({'sessionId': session_id, 'question': '¿Cuál es el nombre del usuario?'}), 201


def _validate_email(email: str) -> bool:
    if not email:
        return False
    # simple email validation
    return re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email) is not None


@app.route('/admin/user-session/<session_id>/continue', methods=['POST'])
def continue_user_session(session_id):
    """Continúa la sesión con la respuesta del admin.
    Body: {"answer": "..."}
    """
    data = request.get_json() or {}
    answer = data.get('answer', '')
    client, db = get_db()
    sessions = db['user_creation_sessions']
    doc = sessions.find_one({'_id': ObjectId(session_id)})
    if not doc:
        client.close()
        return jsonify({'ok': False, 'error': 'Sesión no encontrada'}), 404
    if doc.get('completed'):
        client.close()
        return jsonify({'ok': False, 'error': 'Sesión ya completada'}), 400

    state = doc.get('state', {})
    step = doc.get('step', 'nombre')

    def save_state(new_state, next_step):
        sessions.update_one({'_id': ObjectId(session_id)}, {'$set': {'state': new_state, 'step': next_step}})

    step_lower = step.lower()
    if step_lower == 'nombre':
        val = answer.strip()
        if not val:
            client.close()
            return jsonify({'ok': False, 'error': 'El nombre no puede estar vacío', 'question': '¿Cuál es el nombre del usuario?'}), 400
        state['nombre'] = val
        save_state(state, 'apellido')
        client.close()
        return jsonify({'ok': True, 'question': '¿Cuál es el apellido?'})

    if step_lower == 'apellido':
        val = answer.strip()
        state['apellido'] = val
        save_state(state, 'email')
        client.close()
        return jsonify({'ok': True, 'question': 'Indica el email del usuario:'})

    if step_lower == 'email':
        email = answer.strip()
        if not _validate_email(email):
            client.close()
            return jsonify({'ok': False, 'error': 'Email inválido', 'question': 'Indica el email del usuario:'}), 400
        state['email'] = email
        save_state(state, 'password')
        client.close()
        return jsonify({'ok': True, 'question': 'Indica la contraseña (mínimo 4 caracteres):'})

    if step_lower == 'password':
        pwd = answer.strip()
        if len(pwd) < 4:
            client.close()
            return jsonify({'ok': False, 'error': 'Contraseña demasiado corta', 'question': 'Indica la contraseña (mínimo 4 caracteres):'}), 400
        state['password'] = pwd
        save_state(state, 'telefono')
        client.close()
        return jsonify({'ok': True, 'question': 'Indica el teléfono (opcional, puedes dejar vacío):'})

    if step_lower == 'telefono':
        state['telefono'] = answer.strip() if answer is not None else ''
        save_state(state, 'direccion')
        client.close()
        return jsonify({'ok': True, 'question': 'Indica la dirección (opcional):'})

    if step_lower == 'direccion':
        state['direccion'] = answer.strip() if answer is not None else ''
        save_state(state, 'tipo')
        client.close()
        return jsonify({'ok': True, 'question': '¿Qué tipo de usuario? (cliente/proveedor). No se permiten admins.'})

    if step_lower == 'tipo':
        tipo = answer.strip().lower()
        if tipo not in ('cliente', 'proveedor'):
            client.close()
            return jsonify({'ok': False, 'error': 'Tipo inválido. Debe ser "cliente" o "proveedor".', 'question': '¿Qué tipo de usuario? (cliente/proveedor):'}), 400
        state['tipo'] = tipo
        save_state(state, 'confirm')
        summary = (
            f"Resumen:\nNombre: {state.get('nombre')} {state.get('apellido')}\nEmail: {state.get('email')}\nTelefono: {state.get('telefono')}\nDireccion: {state.get('direccion')}\nTipo: {state.get('tipo')}\n\n¿Confirmas la creación del usuario? (si/no)"
        )
        client.close()
        return jsonify({'ok': True, 'question': summary})

    if step_lower == 'confirm':
        ans = answer.strip().lower()
        if ans not in ('si', 'sí', 's', 'yes', 'y'):
            sessions.update_one({'_id': ObjectId(session_id)}, {'$set': {'completed': True, 'canceled': True}})
            client.close()
            return jsonify({'ok': True, 'canceled': True, 'message': 'Creación cancelada por el usuario.'})

        # Insert user into SQL DB
        usuario_doc = {
            'nombre': state.get('nombre'),
            'apellido': state.get('apellido'),
            'email': state.get('email'),
            'password': state.get('password'),
            'telefono': state.get('telefono') or '',
            'direccion': state.get('direccion') or '',
            'tipo': state.get('tipo')
        }

        # Use Usuarios microservicio to create user.
        try:
            if usuario_doc['tipo'] == 'cliente':
                # use /register which assigns CLIENTE role by default
                payload = {
                    'nombre': usuario_doc['nombre'],
                    'apellido': usuario_doc['apellido'],
                    'telefono': usuario_doc.get('telefono',''),
                    'direccion': usuario_doc.get('direccion',''),
                    'email': usuario_doc['email'],
                    'password': usuario_doc['password']
                }
                r = requests.post(f"{USER_MS_URL}{USERS_PATH}/register", json=payload, timeout=8)
                if r.status_code not in (200,201):
                    raise Exception(f"Usuario MS error: {r.status_code} {r.text}")
                created = r.json()
                user_id = created.get('id')
            else:
                # proveedor: the Usuarios MS does not expose role lookup by name. Use
                # an environment variable `USER_MS_PROVEEDOR_ROLE_ID` with the numeric id
                # of the 'PROVEEDOR' role (the same id the admin UI uses).
                id_rol_env = os.environ.get('USER_MS_PROVEEDOR_ROLE_ID')
                if not id_rol_env:
                    raise Exception('Falta USER_MS_PROVEEDOR_ROLE_ID en el agente. Por favor configura el id del rol PROVEEDOR en la variable de entorno.')
                try:
                    id_rol = int(id_rol_env)
                except Exception:
                    raise Exception('USER_MS_PROVEEDOR_ROLE_ID debe ser un entero válido')

                payload = {
                    'nombre': usuario_doc['nombre'],
                    'apellido': usuario_doc['apellido'],
                    'direccion': usuario_doc.get('direccion',''),
                    'telefono': usuario_doc.get('telefono',''),
                    'password': usuario_doc['password'],
                    'email': usuario_doc['email'],
                    'idRol': id_rol
                }
                r3 = requests.post(f"{USER_MS_URL}{USERS_PATH}", json=payload, timeout=8)
                if r3.status_code not in (200,201):
                    raise Exception(f"Usuario create error: {r3.status_code} {r3.text}")
                created = r3.json()
                user_id = created.get('id')

            sessions.update_one({'_id': ObjectId(session_id)}, {'$set': {'completed': True, 'result': {'usuario': usuario_doc, 'id': user_id}}})
            client.close()
            return jsonify({'ok': True, 'created': True, 'usuario': {**usuario_doc, 'id': user_id}})

        except Exception as e:
            sessions.update_one({'_id': ObjectId(session_id)}, {'$set': {'completed': True, 'error': str(e)}})
            client.close()
            return jsonify({'ok': False, 'error': str(e)}), 500

    client.close()
    return jsonify({'ok': False, 'error': 'Paso desconocido en la sesión de usuario'}), 400


@app.route('/admin/user/create', methods=['POST'])
def http_create_user():
    """Crea el usuario inmediatamente en la BD SQL. Body JSON with keys: nombre, apellido, email, password, telefono, direccion, tipo (cliente/proveedor)"""
    body = request.get_json() or {}
    nombre = (body.get('nombre') or '').strip()
    apellido = (body.get('apellido') or '').strip()
    email = (body.get('email') or '').strip()
    password = body.get('password') or ''
    telefono = body.get('telefono') or ''
    direccion = body.get('direccion') or ''
    tipo = (body.get('tipo') or '').strip().lower()

    if not nombre or not apellido:
        return jsonify({'ok': False, 'error': 'nombre y apellido son requeridos'}), 400
    if not _validate_email(email):
        return jsonify({'ok': False, 'error': 'email inválido'}), 400
    if len(password) < 4:
        return jsonify({'ok': False, 'error': 'password demasiado corta'}), 400
    if tipo not in ('cliente', 'proveedor'):
        return jsonify({'ok': False, 'error': 'tipo inválido. Debe ser cliente o proveedor'}), 400

    usuario_doc = {
        'nombre': nombre,
        'apellido': apellido,
        'email': email,
        'password': password,
        'telefono': telefono,
        'direccion': direccion,
        'tipo': tipo
    }

    try:
        if tipo == 'cliente':
            payload = {
                'nombre': usuario_doc['nombre'],
                'apellido': usuario_doc['apellido'],
                'telefono': usuario_doc.get('telefono',''),
                'direccion': usuario_doc.get('direccion',''),
                'email': usuario_doc['email'],
                'password': usuario_doc['password']
            }
            r = requests.post(f"{USER_MS_URL}{USERS_PATH}/register", json=payload, timeout=8)
            if r.status_code not in (200,201):
                return jsonify({'ok': False, 'error': f'Usuario MS error: {r.status_code} {r.text}'}), 500
            created = r.json()
            user_id = created.get('id')
        else:
            # proveedor path: require env var to indicate the role id
            id_rol_env = os.environ.get('USER_MS_PROVEEDOR_ROLE_ID')
            if not id_rol_env:
                return jsonify({'ok': False, 'error': 'Falta USER_MS_PROVEEDOR_ROLE_ID en el agente. Por favor configura el id del rol PROVEEDOR en la variable de entorno.'}), 500
            try:
                id_rol = int(id_rol_env)
            except Exception:
                return jsonify({'ok': False, 'error': 'USER_MS_PROVEEDOR_ROLE_ID debe ser un entero válido'}), 500

            payload = {
                'nombre': usuario_doc['nombre'],
                'apellido': usuario_doc['apellido'],
                'direccion': usuario_doc.get('direccion',''),
                'telefono': usuario_doc.get('telefono',''),
                'password': usuario_doc['password'],
                'email': usuario_doc['email'],
                'idRol': id_rol
            }
            r3 = requests.post(f"{USER_MS_URL}{USERS_PATH}", json=payload, timeout=8)
            if r3.status_code not in (200,201):
                return jsonify({'ok': False, 'error': f'Usuario create error: {r3.status_code} {r3.text}'}), 500
            created = r3.json()
            user_id = created.get('id')

        return jsonify({'ok': True, 'usuario': {**usuario_doc, 'id': user_id}}), 201

    except Exception as e:
        return jsonify({'ok': False, 'error': str(e)}), 500


if __name__ == '__main__':
    print('Agent admin API listening on http://0.0.0.0:8020')
    app.run(host='0.0.0.0', port=8020)
