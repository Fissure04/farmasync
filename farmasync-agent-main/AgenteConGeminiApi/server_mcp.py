

import asyncio
import os
from contextlib import asynccontextmanager
from dataclasses import dataclass
from typing import AsyncIterator, List, Optional, Dict, Any
from datetime import datetime

import mariadb
from pymongo import MongoClient
from pydantic import BaseModel, Field
from mcp.server.fastmcp import FastMCP, Context
import sys
import requests
from bson import ObjectId

sys.stdout.reconfigure(encoding='utf-8')

# --- 1. Modelos de Datos (Pydantic) para Salida Estructurada ---
# Reflejan la estructura de nuestras tablas de la base de datos.




class Producto(BaseModel):
    id: Optional[str] = None
    nombre: str
    descripcion: Optional[str] = None
    precio: float
    stock: int
    provedor_id: str
    imagen_url: Optional[str] = None

class Venta(BaseModel):
    id_venta: str
    id_cliente: str
    fecha_venta: datetime
    total: float

class DetalleVenta(BaseModel):
    id_detalle_venta: str
    id_venta: str
    id_producto: str
    cantidad: int
    precio_unitario: float
    subtotal: float

class HistorialVentas(BaseModel):
    id_historial_venta: str
    id_venta: str
    fecha_evento: datetime
    tipo_evento: str
    id_usuario: str
    observacion: str

# --- 2. Contexto y Ciclo de Vida del Servidor con MongoDB y MariaDB ---
# Esto gestiona las conexiones a las bases de datos.
@dataclass
class AppContext:
    mongo_client: MongoClient
    mariadb_conn: mariadb.Connection

@asynccontextmanager
async def app_lifespan(server: FastMCP) -> AsyncIterator[AppContext]:
    print("Conectando a MongoDB y MariaDB...")
    mongo_client = None
    mariadb_conn = None
    try:
        mongo_client = MongoClient('mongodb://localhost:27017/')
        print("Conexión a MongoDB creada.")
        
        mariadb_conn = mariadb.connect(
            host="localhost",
            user="root",
            password="12345",
            database="ventas_db",
        )
        print("Conexión a MariaDB creada.")
        
        yield AppContext(mongo_client=mongo_client, mariadb_conn=mariadb_conn)
    finally:
        if mongo_client:
            mongo_client.close()
            print("🔌 Conexión a MongoDB cerrada.")
        if mariadb_conn:
            mariadb_conn.close()
            print("🔌 Conexión a MariaDB cerrada.")

# --- 3. Creación del Servidor MCP ---
# Le pasamos el nuevo gestor de ciclo de vida.
mcp = FastMCP("BankTransactionServer", lifespan=app_lifespan)

# --- Herramientas para MongoDB (PRODUCTO) ---
@mcp.tool()
async def get_all_products(ctx: Context) -> List[Producto]:
    """
    Devuelve todos los productos.
    """
    mongo_client: MongoClient = ctx.request_context.lifespan_context.mongo_client
    db = mongo_client['farmasync_producto']
    collection = db['productos']
    products = list(collection.find({}))
    for p in products:
        p['id'] = str(p['_id'])
        del p['_id']
    return [Producto(**p) for p in products]

@mcp.tool()
async def get_product_by_name(product_name: str, ctx: Context) -> Optional[Producto]:
    """
    Busca y devuelve un producto específico por su nombre.
    """
    mongo_client: MongoClient = ctx.request_context.lifespan_context.mongo_client
    db = mongo_client['farmasync_producto']
    collection = db['productos']
    product = collection.find_one({'nombre': product_name})
    if product:
        product['id'] = str(product['_id'])
        del product['_id']
        return Producto(**product)
    return None


@mcp.tool()
async def create_product(
    nombre: str,
    descripcion: Optional[str],
    precio: float,
    stock: int,
    provedor_id: str,
    imagen_url: Optional[str],
    ctx: Context
) -> Dict[str, Any]:
    """
    Crea un producto en la base de datos del agente (MongoDB) y opcionalmente lo publica
    en el microservicio de inventario. Devuelve el producto creado y un fragmento HTML
    con la card para mostrar en la interfaz de admin.
    """
    mongo_client: MongoClient = ctx.request_context.lifespan_context.mongo_client
    db = mongo_client['farmasync_producto']
    collection = db['productos']

    producto_doc = {
        'nombre': nombre,
        'descripcion': descripcion or '',
        'precio': float(precio),
        'stock': int(stock),
        'provedor_id': provedor_id,
        'imagen_url': imagen_url or ''
    }

    # Insertar en la colección local del agente
    res = collection.insert_one(producto_doc)
    producto_doc['id'] = str(res.inserted_id)

    # Intentar crear también en el microservicio de inventario (si está disponible)
    inventario_response = None
    try:
        inv_url = 'http://localhost:8016/farmasync/inventario'
        payload = {
            'nombre': producto_doc['nombre'],
            'descripcion': producto_doc['descripcion'],
            'precio': producto_doc['precio'],
            'stock': producto_doc['stock'],
            'provedor_id': producto_doc['provedor_id'],
            'imagen_url': producto_doc['imagen_url']
        }
        r = requests.post(inv_url, json=payload, timeout=5)
        if r.status_code in (200,201):
            inventario_response = r.json()
        else:
            inventario_response = {'error': f'status {r.status_code}', 'body': r.text}
    except Exception as e:
        inventario_response = {'error': str(e)}

    # Construir un pequeño card HTML para la vista del admin
    card_html = f"""
    <div style='border:1px solid #e5e7eb;padding:12px;border-radius:8px;max-width:320px;'>
      <img src='{producto_doc['imagen_url'] or ''}' alt='{producto_doc['nombre']}' style='width:100%;height:160px;object-fit:cover;border-radius:6px;margin-bottom:8px;' />
      <h3 style='margin:0 0 6px 0;font-size:16px'>{producto_doc['nombre']}</h3>
      <p style='margin:0 0 6px 0;color:#6b7280'>{producto_doc['descripcion']}</p>
      <div style='font-weight:600;'>Precio: ${producto_doc['precio']:.2f}</div>
      <div style='color:#6b7280;'>Stock: {producto_doc['stock']}</div>
    </div>
    """

    return {'producto': producto_doc, 'inventario': inventario_response, 'cardHtml': card_html}


# ----- Herramientas para crear producto de forma interactiva (sesión paso a paso) -----
@mcp.tool()
async def start_product_creation_session(ctx: Context) -> Dict[str, Any]:
    """
    Inicia una sesión interactiva de creación de producto. Devuelve sessionId y la primera pregunta.
    """
    mongo_client: MongoClient = ctx.request_context.lifespan_context.mongo_client
    db = mongo_client['farmasync_producto']
    sessions = db['product_creation_sessions']

    session = {
        'state': {},
        'step': 'nombre',
        'created_at': datetime.utcnow(),
        'completed': False,
    }
    res = sessions.insert_one(session)
    session_id = str(res.inserted_id)
    question = '¿Cuál es el nombre del producto?'
    return {'sessionId': session_id, 'question': question}


@mcp.tool()
async def continue_product_creation_session(session_id: str, answer: str, ctx: Context) -> Dict[str, Any]:
    """
    Continúa una sesión de creación de producto con la respuesta del admin.
    Valida la respuesta y avanza al siguiente paso; al confirmar, crea el producto y retorna el card HTML.
    """
    mongo_client: MongoClient = ctx.request_context.lifespan_context.mongo_client
    db = mongo_client['farmasync_producto']
    sessions = db['product_creation_sessions']

    doc = sessions.find_one({'_id': ObjectId(session_id)})
    if not doc:
        return {'ok': False, 'error': 'Sesión no encontrada'}
    if doc.get('completed'):
        return {'ok': False, 'error': 'Sesión ya completada'}

    state = doc.get('state', {})
    step = doc.get('step', 'nombre')

    # Helper to update session
    def save_state(new_state, next_step):
        sessions.update_one({'_id': ObjectId(session_id)}, {'$set': {'state': new_state, 'step': next_step}})

    # Process current step
    step_lower = step.lower()
    # Validation and assignment
    if step_lower == 'nombre':
        val = answer.strip()
        if not val:
            return {'ok': False, 'error': 'El nombre no puede estar vacío', 'question': '¿Cuál es el nombre del producto?'}
        state['nombre'] = val
        save_state(state, 'descripcion')
        return {'ok': True, 'question': 'Escribe una descripción (puedes dejarla vacía):'}

    if step_lower == 'descripcion':
        state['descripcion'] = answer.strip() if answer is not None else ''
        save_state(state, 'precio')
        return {'ok': True, 'question': 'Indica el precio (número mayor a 0):'}

    if step_lower == 'precio':
        try:
            precio = float(answer)
            if precio <= 0:
                raise ValueError('Precio debe ser mayor a 0')
        except Exception:
            return {'ok': False, 'error': 'Precio inválido. Ingresa un número mayor a 0.', 'question': 'Indica el precio (número mayor a 0):'}
        state['precio'] = precio
        save_state(state, 'stock')
        return {'ok': True, 'question': 'Indica la cantidad de stock (entero >= 0):'}

    if step_lower == 'stock':
        try:
            stock = int(float(answer))
            if stock < 0:
                raise ValueError('Stock debe ser >= 0')
        except Exception:
            return {'ok': False, 'error': 'Stock inválido. Ingresa un entero mayor o igual a 0.', 'question': 'Indica la cantidad de stock (entero >= 0):'}
        state['stock'] = stock
        save_state(state, 'provedor_id')
        return {'ok': True, 'question': 'Indica el id del proveedor (provedor_id):'}

    if step_lower == 'provedor_id':
        pid = answer.strip()
        if not pid:
            return {'ok': False, 'error': 'provedor_id no puede estar vacío', 'question': 'Indica el id del proveedor (provedor_id):'}
        state['provedor_id'] = pid
        save_state(state, 'imagen_url')
        return {'ok': True, 'question': 'Opcional: indica URL de imagen o deja en blanco:'}

    if step_lower == 'imagen_url':
        state['imagen_url'] = answer.strip() if answer is not None else ''
        # move to confirmation
        save_state(state, 'confirm')
        summary = f"Resumen:\nNombre: {state.get('nombre')}\nDescripcion: {state.get('descripcion')}\nPrecio: {state.get('precio')}\nStock: {state.get('stock')}\nProveedor: {state.get('provedor_id')}\nImagen: {state.get('imagen_url')}\n\n¿Confirmas la creación del producto? (si/no)"
        return {'ok': True, 'question': summary}

    if step_lower == 'confirm':
        ans = answer.strip().lower()
        if ans not in ('si', 'sí', 's', 'yes', 'y'):
            # cancel session
            sessions.update_one({'_id': ObjectId(session_id)}, {'$set': {'completed': True, 'canceled': True}})
            return {'ok': True, 'canceled': True, 'message': 'Creación cancelada por el usuario.'}

        # create product using existing create_product tool logic
        # Note: call the function directly
        created = await create_product(
            nombre=state.get('nombre'),
            descripcion=state.get('descripcion'),
            precio=state.get('precio'),
            stock=state.get('stock'),
            provedor_id=state.get('provedor_id'),
            imagen_url=state.get('imagen_url'),
            ctx=ctx
        )

        # mark session completed
        sessions.update_one({'_id': ObjectId(session_id)}, {'$set': {'completed': True, 'result': created}})

        return {'ok': True, 'created': True, 'producto': created.get('producto'), 'inventario': created.get('inventario'), 'cardHtml': created.get('cardHtml')}

    return {'ok': False, 'error': 'Paso desconocido en la sesión'}


# --- Herramientas para MariaDB (VENTA, DETALLE_VENTA, HISTORIAL_VENTAS) ---
@mcp.tool()
async def get_all_sales(ctx: Context) -> List[Dict[str, Any]]:
    """
    Devuelve todas las ventas.
    """
    mariadb_conn: mariadb.Connection = ctx.request_context.lifespan_context.mariadb_conn
    with mariadb_conn.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT * FROM ventas ORDER BY fecha_venta DESC")
        rows = cursor.fetchall()
        return rows

@mcp.tool()
async def get_sale_by_id(sale_id: str, ctx: Context) -> Optional[Dict[str, Any]]:
    """
    Busca y devuelve una venta específica por su ID.
    """
    mariadb_conn: mariadb.Connection = ctx.request_context.lifespan_context.mariadb_conn
    with mariadb_conn.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT * FROM ventas WHERE id_venta = %s", (sale_id,))
        row = cursor.fetchone()
        return row

@mcp.tool()
async def get_sale_details(sale_id: str, ctx: Context) -> List[Dict[str, Any]]:
    """
    Devuelve los detalles de una venta específica.
    """
    mariadb_conn: mariadb.Connection = ctx.request_context.lifespan_context.mariadb_conn
    with mariadb_conn.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT * FROM detalles_venta WHERE id_venta = %s", (sale_id,))
        rows = cursor.fetchall()
        return rows

@mcp.tool()
async def get_sales_history(ctx: Context) -> List[Dict[str, Any]]:
    """
    Devuelve el historial de ventas.
    """
    mariadb_conn: mariadb.Connection = ctx.request_context.lifespan_context.mariadb_conn
    with mariadb_conn.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT * FROM historial_venta ORDER BY fecha_evento DESC")
        rows = cursor.fetchall()
        return rows


# --- 5. Ejecución del Servidor ---
if __name__ == "__main__":
    print(" Iniciando servidor MCP con conexiones a MongoDB y MariaDB...")
    mcp.run()
