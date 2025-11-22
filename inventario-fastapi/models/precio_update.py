from pydantic import BaseModel, Field

class PrecioUpdate(BaseModel):
    precio: float = Field(..., gt=0, description="Nuevo precio del producto")
