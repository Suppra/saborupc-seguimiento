// Micro frontend: SEGUIMIENTO DE PEDIDOS (equipo Pedidos) — Lit cargado desde CDN, sin compilación
// Contrato: define la etiqueta <mfe-seguimiento> (módulo ES: el registro lo marca con "modulo": true)
// Escucha:  'pedido:confirmado' v1.x { version, id, fecha, items, total, [metodoPago] }
// Publica:  'pedido:estado'     v1.0 { version, id, numero, estado, estadoAnterior }
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

const VERSION = '1.0.0';
const TOKENS = 'http://localhost:8085/tokens.css';
const ESTADOS = ['Recibido', 'En preparación', 'En camino', 'Entregado'];
// Cada cuánto avanza un pedido. Se puede cambiar para pruebas: seguimiento.js?intervalo=1000
const INTERVALO_MS = Number(new URL(import.meta.url).searchParams.get('intervalo')) || 5000;
const pesos = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
const hora = new Intl.DateTimeFormat('es-CO', { timeStyle: 'short' });

if (!document.getElementById('tokens-saborupc')) {
  const link = document.createElement('link');
  link.id = 'tokens-saborupc';
  link.rel = 'stylesheet';
  link.href = TOKENS;
  document.head.appendChild(link);
}

// ---- Estado propio del micro frontend (vive mientras el módulo esté cargado)
const pedidos = [];            // [{ id, numero, fecha, items, total, metodoPago, paso }]
const vistas = new Set();      // instancias de <mfe-seguimiento> en pantalla

function publicarEstado(pedido, anterior) {
  window.dispatchEvent(new CustomEvent('pedido:estado', {
    detail: { version: '1.0', id: pedido.id, numero: pedido.numero, estado: ESTADOS[pedido.paso], estadoAnterior: anterior }
  }));
}

function refrescar() {
  vistas.forEach(v => v.requestUpdate());
}

// Escucha desde que se carga el módulo (el registro lo precarga).
// Lector tolerante: usa solo los campos de la v1.0 y muestra metodoPago si viene (v1.1).
window.addEventListener('pedido:confirmado', (e) => {
  const d = e.detail || {};
  const pedido = {
    id: d.id,
    numero: pedidos.length + 1,
    fecha: d.fecha,
    items: Array.isArray(d.items) ? d.items : [],
    total: d.total,
    metodoPago: d.metodoPago || null,
    paso: 0
  };
  pedidos.unshift(pedido);
  publicarEstado(pedido, null);
  refrescar();

  // Los estados avanzan solos con setInterval hasta "Entregado"
  const temporizador = setInterval(() => {
    const anterior = ESTADOS[pedido.paso];
    pedido.paso += 1;
    publicarEstado(pedido, anterior);
    refrescar();
    if (pedido.paso === ESTADOS.length - 1) clearInterval(temporizador);
  }, INTERVALO_MS);
});

class MfeSeguimiento extends LitElement {
  static styles = css`
    :host { display: block; font-family: var(--sabor-fuente, Arial, sans-serif); color: var(--sabor-color-texto, #222); }
    h2 { color: var(--sabor-color-primario, #0b4f8a); margin: 0 0 4px; font-size: var(--sabor-texto-xl, 24px); }
    .version { font-size: var(--sabor-texto-xs, 12px); color: var(--sabor-color-texto-suave, #777); }
    .vacio { color: var(--sabor-color-texto-suave, #777); }
    ul { list-style: none; padding: 0; margin: var(--sabor-espacio-4, 16px) 0; }
    .pedido { background: var(--sabor-color-superficie, #fff); border: 1px solid var(--sabor-color-borde, #dde3ea);
              border-radius: var(--sabor-radio-tarjeta, 8px); padding: var(--sabor-espacio-4, 16px);
              margin-bottom: var(--sabor-espacio-3, 12px); box-shadow: var(--sabor-sombra, none); }
    .cabecera { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; font-weight: bold; }
    .meta { font-weight: normal; font-size: var(--sabor-texto-sm, 14px); color: var(--sabor-color-texto-suave, #777); }
    .detalle { margin: var(--sabor-espacio-2, 8px) 0 var(--sabor-espacio-3, 12px); padding-left: 18px; font-size: var(--sabor-texto-sm, 14px); }
    ol { display: flex; list-style: none; padding: 0; margin: 0; gap: 4px; }
    ol li { flex: 1; text-align: center; font-size: var(--sabor-texto-xs, 12px); padding: 6px 4px;
            border-radius: var(--sabor-radio, 4px); background: #eef1f4; color: var(--sabor-color-texto-suave, #777); }
    ol li.hecho { background: #d8eed6; color: var(--sabor-color-acento-oscuro, #1b7a3e); }
    ol li.actual { background: var(--sabor-color-acento, #3e9f3a); color: #fff; font-weight: bold; }
  `;

  connectedCallback() {
    super.connectedCallback();
    vistas.add(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    vistas.delete(this);
  }

  render() {
    return html`
      <h2>Mis pedidos</h2>
      <span class="version">mfe-seguimiento v${VERSION} · Lit</span>
      ${pedidos.length === 0
        ? html`<p class="vacio">Aún no has confirmado pedidos. Confirma uno desde el carrito.</p>`
        : html`<ul>${pedidos.map(p => this.tarjeta(p))}</ul>`}
    `;
  }

  tarjeta(p) {
    return html`
      <li class="pedido" data-id=${p.id} data-estado=${ESTADOS[p.paso]}>
        <div class="cabecera">
          <span>Pedido #${p.numero}
            <span class="meta">· ${p.fecha ? hora.format(new Date(p.fecha)) : ''}${p.metodoPago ? ` · ${p.metodoPago}` : ''}</span>
          </span>
          <span>${typeof p.total === 'number' ? pesos.format(p.total) : ''}</span>
        </div>
        <ul class="detalle">
          ${p.items.map(it => html`<li>${it.cantidad} × ${it.nombre}</li>`)}
        </ul>
        <ol aria-label="Estado del pedido">
          ${ESTADOS.map((nombre, i) => html`
            <li class=${i < p.paso ? 'hecho' : i === p.paso ? 'actual' : ''}
                aria-current=${i === p.paso ? 'step' : 'false'}>${nombre}</li>`)}
        </ol>
      </li>`;
  }
}

if (!customElements.get('mfe-seguimiento')) {
  customElements.define('mfe-seguimiento', MfeSeguimiento);
}
