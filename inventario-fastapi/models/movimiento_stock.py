from pydantic import BaseModel, Field

class MovimientoStock(BaseModel):
    cantidad: int = Field(..., gt=0, description="Cantidad del movimiento de stock")
