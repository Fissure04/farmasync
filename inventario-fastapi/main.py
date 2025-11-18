from fastapi import FastAPI
from controllers import producto_controller

app = FastAPI(
    title="API Inventario - Arquitectura Multicapa",
    description="Microservicio de inventario de productos con FastAPI",
    version="1.0.0"
)

# Registrar router de productos
app.include_router(producto_controller.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8016, reload=True)
