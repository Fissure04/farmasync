from pydantic import BaseModel
from typing import Optional

class Producto(BaseModel):
    id: Optional[str] = None
    nombre: str
    descripcion: Optional[str] = None
    precio: float
    stock: int
    provedor_id: str
    imagen_url: Optional[str] = None

    def to_dict(self):
        return {
            "nombre": self.nombre,
            "descripcion": self.descripcion,
            "precio": self.precio,
            "stock": self.stock,
            "provedor_id": self.provedor_id,
            "imagen_url": self.imagen_url
        }
