from models.producto import Producto
from config.database import producto_collection
from bson import ObjectId

class ProductoRepository:
    def listar(self):
        productos = []
        for p in producto_collection.find():
            p["id"] = str(p["_id"])
            del p["_id"]  # eliminamos el _id interno de Mongo para no duplicar
            productos.append(Producto(**p))
        return productos

    def obtener(self, producto_id: str):
        # Intentar interpretar como ObjectId sólo si tiene formato válido
        try:
            if isinstance(producto_id, str) and len(producto_id) == 24:
                # posible ObjectId hex string
                try:
                    p = producto_collection.find_one({"_id": ObjectId(producto_id)})
                except Exception:
                    p = None
                if p:
                    p["id"] = str(p["_id"])
                    del p["_id"]
                    return Producto(**p)
        except Exception:
            # cualquier error al interpretar ObjectId, continuar con búsqueda por nombre
            pass

        # Si no se encontró por ObjectId, intentar buscar por nombre o por campo 'id' alternativo
        p = producto_collection.find_one({"nombre": producto_id})
        if not p:
            p = producto_collection.find_one({"id": producto_id})
        if p:
            p["id"] = str(p["_id"])
            del p["_id"]
            return Producto(**p)
        return None

    def crear(self, producto: Producto):
        result = producto_collection.insert_one(producto.to_dict())
        producto.id = str(result.inserted_id)
        return producto

    def actualizar(self, producto_id: str, producto: Producto):
        data = producto.to_dict()

        # 🔒 No permitir modificar el ID bajo ningún caso
        if "id" in data:
            del data["id"]

        if "_id" in data:
            del data["_id"]
        
        producto_collection.update_one(
            {"_id": ObjectId(producto_id)},
            {"$set": producto.to_dict()}
        )
        return self.obtener(producto_id)

    def eliminar(self, producto_id: str):
        result = producto_collection.delete_one({"_id": ObjectId(producto_id)})
        return result.deleted_count > 0


    def obtener_por_nombre(self, nombre: str):
        p = producto_collection.find_one({"nombre": nombre})
        if p:
            p["id"] = str(p["_id"])
            del p["_id"]
            return Producto(**p)
        return None

    def buscar_por_nombre(self, nombre: str):
    # Buscar coincidencias parciales (case-insensitive)
        query = {"nombre": {"$regex": nombre, "$options": "i"}}

        productos = []
        for p in producto_collection.find(query):
            p["id"] = str(p["_id"])
            del p["_id"]
            productos.append(Producto(**p))

        return productos
