from typing import List, Optional
from models.producto import Producto
from repositories.producto_repository import ProductoRepository

class ProductoService:
    def __init__(self, repository: ProductoRepository):
        self.repository = repository

    def listar_productos(self) -> List[Producto]:
        return self.repository.listar()

    def obtener_producto(self, producto_id: str) -> Optional[Producto]:
        return self.repository.obtener(producto_id)
    
    def crear_producto(self, producto: Producto) -> Producto:
        if producto.stock < 0:
            raise ValueError("El stock no puede ser negativo")

        existente = self.repository.obtener_por_nombre(producto.nombre)

        if existente:
            # Validamos que el id exista
            if not existente.id:
                raise ValueError("El producto existente no tiene un ID válido")

            existente.stock += producto.stock
            actualizado = self.repository.actualizar(existente.id, existente)
            if actualizado is None:
                raise ValueError("Error al actualizar el producto existente")
            return actualizado

        creado = self.repository.crear(producto)
        if creado is None:
            raise ValueError("Error al crear el producto")
        return creado

    def actualizar_producto(self, producto_id: str, producto: Producto) -> Optional[Producto]:
        if producto.stock < 0:
            raise ValueError("El stock no puede ser negativo")
        return self.repository.actualizar(producto_id, producto)

    def eliminar_producto(self, producto_id: str) -> bool:
        return self.repository.eliminar(producto_id)
    
    def buscar_por_nombre(self, nombre: str):
        return self.repository.buscar_por_nombre(nombre)

    def agregar_stock(self, producto_id: str, cantidad: int):
        if cantidad <= 0:
            raise ValueError("La cantidad debe ser mayor que 0")

        producto = self.repository.obtener(producto_id)
        if not producto:
            return None

        producto.stock += cantidad
        return self.repository.actualizar(producto_id, producto)


    def descontar_stock(self, producto_id: str, cantidad: int):
        if cantidad <= 0:
            raise ValueError("La cantidad debe ser mayor que 0")

        producto = self.repository.obtener(producto_id)
        if not producto:
            return None

        if producto.stock < cantidad:
            raise ValueError("Stock insuficiente para realizar la operación")

        producto.stock -= cantidad
        return self.repository.actualizar(producto_id, producto)

    def actualizar_precio(self, producto_id: str, nuevo_precio: float):
        if nuevo_precio <= 0:
            raise ValueError("El precio debe ser mayor a 0")

        producto = self.repository.obtener(producto_id)
        if not producto:
            return None

        producto.precio = nuevo_precio
        return self.repository.actualizar(producto_id, producto)
