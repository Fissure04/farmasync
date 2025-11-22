from flask import Flask, request
from flask_cors import CORS
from client_mcp import main
import requests
import os
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import re

app = Flask(__name__)
# Allow requests from the frontend and include the Authorization header for preflight
CORS(app,
    origins=["http://localhost:4200", "http://localhost:51764", "http://localhost:4200/", "*"],
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=["Authorization"],
    methods=["GET", "POST", "OPTIONS"],
    supports_credentials=True)

@app.route("/query", methods=["POST", "OPTIONS"])
async def leer_consulta():
    if request.method == "OPTIONS":
        return {}, 200
    datos = request.get_json()
    if not datos or "consulta" not in datos:
        return {"error": "El cuerpo de la solicitud debe ser un JSON con la clave 'consulta'"}, 400
    # Simple shortcut to allow quick connectivity checks from the frontend
    consulta = datos.get("consulta")
    if isinstance(consulta, str) and consulta.lower().strip() == "ping":
        return {"data": "pong"}

    # Basic intent detection for user creation to integrate with admin panel.
    # If the admin types something like "crear usuario" or "necesito crear un usuario",
    # start a user creation session (stored in MongoDB) so the agent can ask fields.
    if isinstance(consulta, str):
        text = consulta.lower()
        if any(k in text for k in ("crear usuario", "crear un usuario", "crear cliente", "necesito crear un usuario")):
            try:
                # create session in local MongoDB
                MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
                client = MongoClient(MONGO_URL)
                db = client['farmasync_producto']
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
                return {"data": {"sessionId": session_id, "question": "¿Cuál es el nombre del usuario?"}}
            except Exception as e:
                import traceback
                tb = traceback.format_exc()
                print("Error iniciando user session en /query:\n", tb)
                return {"error": f"No se pudo iniciar sesión de creación de usuario: {str(e)}", "trace": tb}, 500

    # Support structured proxying for continuing user sessions from frontend.
    # If frontend sends: {"consulta": {"user_session_continue": true, "sessionId": "...", "answer": "..."}}
    if isinstance(consulta, dict) and consulta.get('user_session_continue'):
        session_id = consulta.get('sessionId')
        answer = consulta.get('answer', '')
        if not session_id:
            return {"error": "sessionId es requerido para continuar la sesión"}, 400
        try:
            # Continue session using MongoDB stored session
            MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
            client = MongoClient(MONGO_URL)
            db = client['farmasync_producto']
            sessions = db['user_creation_sessions']
            doc = sessions.find_one({'_id': ObjectId(session_id)})
            if not doc:
                client.close()
                return {"error": "Sesión no encontrada"}, 404
            if doc.get('completed'):
                client.close()
                return {"error": "Sesión ya completada"}, 400

            state = doc.get('state', {})
            step = doc.get('step', 'nombre')

            def save_state(new_state, next_step):
                sessions.update_one({'_id': ObjectId(session_id)}, {'$set': {'state': new_state, 'step': next_step}})

            step_lower = step.lower()
            if step_lower == 'nombre':
                val = (answer or '').strip()
                if not val:
                    client.close()
                    return {"ok": False, "error": 'El nombre no puede estar vacío', 'question': '¿Cuál es el nombre del usuario?'} , 400
                state['nombre'] = val
                save_state(state, 'apellido')
                client.close()
                return {"data": {"ok": True, "question": '¿Cuál es el apellido?'}}

            if step_lower == 'apellido':
                state['apellido'] = (answer or '').strip()
                save_state(state, 'email')
                client.close()
                return {"data": {"ok": True, "question": 'Indica el email del usuario:'}}

            if step_lower == 'email':
                email = (answer or '').strip()
                if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
                    client.close()
                    return {"ok": False, "error": 'Email inválido', 'question': 'Indica el email del usuario:'}, 400
                state['email'] = email
                save_state(state, 'password')
                client.close()
                return {"data": {"ok": True, "question": 'Indica la contraseña (mínimo 4 caracteres):'}}

            if step_lower == 'password':
                pwd = (answer or '').strip()
                if len(pwd) < 4:
                    client.close()
                    return {"ok": False, "error": 'Contraseña demasiado corta', 'question': 'Indica la contraseña (mínimo 4 caracteres):'}, 400
                state['password'] = pwd
                save_state(state, 'telefono')
                client.close()
                return {"data": {"ok": True, "question": 'Indica el teléfono (opcional, puedes dejar vacío):'}}

            if step_lower == 'telefono':
                state['telefono'] = (answer or '').strip()
                save_state(state, 'direccion')
                client.close()
                return {"data": {"ok": True, "question": 'Indica la dirección (opcional):'}}

            if step_lower == 'direccion':
                state['direccion'] = (answer or '').strip()
                save_state(state, 'confirm')
                summary = (
                    f"Resumen:\nNombre: {state.get('nombre')} {state.get('apellido')}\nEmail: {state.get('email')}\nTelefono: {state.get('telefono')}\nDireccion: {state.get('direccion')}\n\n¿Confirmas la creación del usuario (cliente)? (si/no)"
                )
                client.close()
                return {"data": {"ok": True, "question": summary}}

            if step_lower == 'confirm':
                ans = (answer or '').strip().lower()
                if ans not in ('si', 'sí', 's', 'yes', 'y'):
                    sessions.update_one({'_id': ObjectId(session_id)}, {'$set': {'completed': True, 'canceled': True}})
                    client.close()
                    return {"data": {"ok": True, 'canceled': True, 'message': 'Creación cancelada por el usuario.'}}

                usuario_doc = {
                    'nombre': state.get('nombre'),
                    'apellido': state.get('apellido'),
                    'email': state.get('email'),
                    'password': state.get('password'),
                    'telefono': state.get('telefono') or '',
                    'direccion': state.get('direccion') or ''
                }

                try:
                    USER_MS_URL = os.environ.get('USER_MS_URL', 'http://localhost:8013')
                    USERS_PATH = '/farmasync/usuarios'
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

                    sessions.update_one({'_id': ObjectId(session_id)}, {'$set': {'completed': True, 'result': {'usuario': usuario_doc, 'id': user_id}}})
                    client.close()
                    return {"data": {"ok": True, 'created': True, 'usuario': {**usuario_doc, 'id': user_id}}}

                except Exception as e:
                    sessions.update_one({'_id': ObjectId(session_id)}, {'$set': {'completed': True, 'error': str(e)}})
                    client.close()
                    return {"error": str(e)}, 500

            client.close()
            return {"error": 'Paso desconocido en la sesión de usuario'}, 400

        except Exception as e:
            import traceback
            tb = traceback.format_exc()
            print('Error continuando sesión en /query:\n', tb)
            return {"error": str(e), "trace": tb}, 500

    # For other queries, delegate to the MCP client (may require extra deps)
    try:
        resultado = await main(consulta)
        return {"data": resultado}
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        print("Error procesando consulta en /query:\n", tb)
        return {"error": str(e), "trace": tb}, 500

if __name__ == "__main__":
    app.run(debug=True)