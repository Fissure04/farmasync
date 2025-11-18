from http.server import BaseHTTPRequestHandler, HTTPServer
import json
from datetime import datetime

class SimpleHandler(BaseHTTPRequestHandler):
    def _set_cors_headers(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_cors_headers()

    def do_POST(self):
        if self.path != '/query':
            self.send_response(404)
            self.end_headers()
            return
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else ''
        try:
            data = json.loads(body) if body else {}
        except Exception:
            data = {}
        consulta = data.get('consulta') if isinstance(data, dict) else None
        
        # Handle ping
        if isinstance(consulta, str) and consulta.lower().strip() == 'ping':
            self._set_cors_headers()
            self.wfile.write(json.dumps({'data': 'pong'}).encode('utf-8'))
            return
        
        # Handle product queries
        if isinstance(consulta, str):
            q_lower = consulta.lower()
            # Return sample products for generic product queries
            if any(word in q_lower for word in ['producto', 'medicina', 'farmaco', 'medicamento', 'producto']):
                products = [
                    {
                        'id': 1,
                        'nombre': 'Ibuprofeno 400mg',
                        'descripcion': 'Analgésico y antiinflamatorio',
                        'precio': 12.50,
                        'stock': 45,
                        'imagen_url': '/public/images/product/product-default.png'
                    },
                    {
                        'id': 2,
                        'nombre': 'Paracetamol 500mg',
                        'descripcion': 'Analgésico para dolor y fiebre',
                        'precio': 8.90,
                        'stock': 120,
                        'imagen_url': '/public/images/product/product-default.png'
                    },
                    {
                        'id': 3,
                        'nombre': 'Vitamina C 1000mg',
                        'descripcion': 'Suplemento vitamínico',
                        'precio': 15.00,
                        'stock': 89,
                        'imagen_url': '/public/images/product/product-default.png'
                    }
                ]
                self._set_cors_headers()
                self.wfile.write(json.dumps({'data': products}).encode('utf-8'))
                return
            
            # Return sample sales for sales/venta queries
            if any(word in q_lower for word in ['venta', 'ventas', 'reporte', 'vend', 'historial']):
                sales = [
                    {
                        'id_venta': 1,
                        'id_vendedor': 10,
                        'id_cliente': 20,
                        'fecha_venta': '2025-11-15 14:30:00',
                        'total': 45.50,
                        'tipo': 'Venta'
                    },
                    {
                        'id_venta': 2,
                        'id_vendedor': 10,
                        'id_cliente': 21,
                        'fecha_venta': '2025-11-16 10:15:00',
                        'total': 78.90,
                        'tipo': 'Venta'
                    },
                    {
                        'id_venta': 3,
                        'id_vendedor': 11,
                        'id_cliente': 22,
                        'fecha_venta': '2025-11-16 16:45:00',
                        'total': 120.00,
                        'tipo': 'Venta'
                    }
                ]
                self._set_cors_headers()
                self.wfile.write(json.dumps({'data': sales}).encode('utf-8'))
                return
        
        # default: echo back for debugging
        self._set_cors_headers()
        self.wfile.write(json.dumps({'data': 'Consulta recibida: ' + str(consulta)}).encode('utf-8'))

    def log_message(self, format, *args):
        # keep server quieter
        print(format % args)

if __name__ == '__main__':
    server_address = ('', 5000)
    httpd = HTTPServer(server_address, SimpleHandler)
    print('Test server listening on port 5000')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('Shutting down')
        httpd.server_close()
