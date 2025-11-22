from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controllers import producto_controller

app = FastAPI(
    title="API Inventario - Arquitectura Multicapa",
    description="Microservicio de inventario de productos con FastAPI",
    version="1.0.0"
)


# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://localhost:53364"],  # URLs del frontend Angular
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Registrar router de productos
app.include_router(producto_controller.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8016, reload=True)
