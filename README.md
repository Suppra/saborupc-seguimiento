# mfe-seguimiento · SaborUPC 2.0 (equipo Pedidos)

Seguimiento de pedidos (`#/pedidos`) hecho con **Lit** cargado desde CDN (jsDelivr), sin compilación.

- **Contrato:** etiqueta `<mfe-seguimiento>`. Es un módulo ES: el registro lo declara con `"modulo": true`.
- **Escucha:** `pedido:confirmado` v1.0 y v1.1. Usa solo los campos de la v1.0 y muestra `metodoPago` si viene.
- **Publica:** `pedido:estado` v1.0 `{ version, id, numero, estado, estadoAnterior }` cada vez que un pedido avanza
  Recibido → En preparación → En camino → Entregado (cada 5 s, con `setInterval`).
- **Prueba rápida:** `seguimiento.js?intervalo=1000` cambia el intervalo.

## Ejecutar

Los módulos ES de otro origen necesitan CORS, por eso se usa `servidor.py` en lugar de `python -m http.server`:

```bash
python servidor.py 8084
```

- Modo independiente: http://localhost:8084
- Prueba de contrato: http://localhost:8084/contrato.html (13 verificaciones ✓/✗, incluye compatibilidad v1.0/v1.1)

## Publicado en internet

GitHub Pages (Settings → Pages → rama `main`, carpeta raíz): https://suppra.github.io/saborupc-seguimiento/
El contenedor lo usa con http://localhost:8080/?origen=publicado.
