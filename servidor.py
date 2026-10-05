"""Servidor local de mfe-seguimiento con CORS.

seguimiento.js es un módulo ES (lo exige Lit). A diferencia de un <script> clásico, el navegador
solo ejecuta módulos de otro origen si el servidor responde con Access-Control-Allow-Origin.
`python -m http.server` no envía esa cabecera, por eso este archivo. (GitHub Pages sí la envía.)

Uso: python servidor.py [puerto]   (por defecto 8084)
"""
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class ManejadorCORS(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


if __name__ == '__main__':
    puerto = int(sys.argv[1]) if len(sys.argv) > 1 else 8084
    manejador = partial(ManejadorCORS, directory=str(Path(__file__).parent))
    print(f'mfe-seguimiento en http://localhost:{puerto} (con CORS)')
    ThreadingHTTPServer(('', puerto), manejador).serve_forever()
