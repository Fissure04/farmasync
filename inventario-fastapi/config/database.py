from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Cargar variables del archivo .env
load_dotenv()

# Leer credenciales
MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB = os.getenv("MONGO_DB", "farmasync_producto")

# Crear conexión
client = MongoClient(MONGO_URI)
db = client[MONGO_DB]

# Colección de productos
producto_collection = db["productos"]
