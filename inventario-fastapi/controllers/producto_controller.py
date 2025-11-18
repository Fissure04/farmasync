from typing import List
from fastapi import APIRouter, HTTPException
from models.producto import Producto
from models.movimiento_stock import MovimientoStock
from models.precio_update import PrecioUpdate
from repositories.producto_repository import ProductoRepository
from services.producto_service import ProductoService

# Crear instancia del repositorio y del servicio
producto_repository = ProductoRepository()
producto_service = ProductoService(producto_repository)

router = APIRouter(prefix="/farmasync/inventario", tags=["Inventario"])

@router.get("/", response_model=List[Producto], summary="Listar productos")
def listar_productos():
    return producto_service.listar_productos()

@router.get("/buscar", summary="Buscar productos por nombre", response_model=List[Producto])
def buscar_producto_por_nombre(nombre: str):
    productos = producto_service.buscar_por_nombre(nombre)

    if not productos:
        raise HTTPException(status_code=404, detail="No se encontraron productos con ese nombre")

    return productos

@router.get("/{id}", response_model=Producto, summary="Obtener producto por ID")
def obtener_producto(id: str):
    producto = producto_service.obtener_producto(id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto

@router.post("/", response_model=Producto, summary="Crear producto")
def crear_producto(producto: Producto):
    try:
        return producto_service.crear_producto(producto)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{id}", response_model=Producto, summary="Actualizar producto")
def actualizar_producto(id: str, producto: Producto):
    try:
        updated = producto_service.actualizar_producto(id, producto)
        if not updated:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.patch("/{id}/precio", summary="Actualizar solo el precio de un producto")
def actualizar_precio(id: str, data: PrecioUpdate):
    try:
        actualizado = producto_service.actualizar_precio(id, data.precio)
        if not actualizado:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        return actualizado
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{id}", summary="Eliminar producto")
def eliminar_producto(id: str):
    deleted = producto_service.eliminar_producto(id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return {"detalle": "Producto eliminado correctamente"}

@router.post("/{id}/entrada", summary="Agregar stock")
def agregar_stock(id: str, movimiento: MovimientoStock):
    return producto_service.agregar_stock(id, movimiento.cantidad)


@router.post("/{id}/salida", summary="Descontar stock")
def descontar_stock(id: str, movimiento: MovimientoStock):
    return producto_service.descontar_stock(id, movimiento.cantidad)
