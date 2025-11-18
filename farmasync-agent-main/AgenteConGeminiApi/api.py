from flask import Flask, request
from flask_cors import CORS
from client_mcp import main

app = Flask(__name__)
CORS(app, origins=["*"], allow_headers=["Content-Type"], methods=["GET", "POST", "OPTIONS"])

@app.route("/query", methods=["POST", "OPTIONS"])
async def leer_consulta():
    if request.method == "OPTIONS":
        return {}, 200
    datos = request.get_json()
    if not datos or "consulta" not in datos:
        return {"error": "El cuerpo de la solicitud debe ser un JSON con la clave 'consulta'"}, 400
    # Simple shortcut to allow quick connectivity checks from the frontend
    consulta = datos.get("consulta")
    if isinstance(consulta, str) and consulta.lower().strip() == "ping":
        return {"data": "pong"}

    # For other queries, delegate to the MCP client (may require extra deps)
    resultado = await main(consulta)
    return {"data": resultado}

if __name__ == "__main__":
    app.run(debug=True)