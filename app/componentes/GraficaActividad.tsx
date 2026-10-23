// Barras apiladas en SVG plano (sin librería de gráficas) con datos reales de
// los últimos 7 días. Solo dos series, PERMITIR/BLOQUEAR: `decision` nunca
// vale INDETERMINADO (ese estado existe por regla, no a nivel de ejecución
// — ver requisitos-vistas.md § 2), así que no hay una tercera serie honesta
// que mostrar aquí.
export type PuntoActividad = { etiqueta: string; fechaCompleta: string; permitidas: number; bloqueadas: number; pendientes: number };

export function MiniGrafica({ datos, color, etiqueta }: { datos: number[]; color: string; etiqueta: string }) {
  const maximo = Math.max(0, ...datos);
  if (maximo === 0 || datos.length < 2) return null;

  const puntos = datos.map((valor, i) => {
    const x = (i / (datos.length - 1)) * 72;
    const y = 34 - (valor / maximo) * 28;
    return `${x},${y}`;
  });
  const linea = puntos.join(" ");

  return (
    <svg className="mini-grafica" viewBox="0 0 72 42" role="img" aria-label={etiqueta} style={{ color }}>
      <polygon points={`0,40 ${linea} 72,40`} fill="currentColor" opacity="0.12" />
      <polyline points={linea} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const RADIO = 6;

// Un segmento rectangular con las esquinas de ARRIBA redondeadas y las de
// abajo cuadradas (así el punto donde se apilan permitidas/bloqueadas queda
// a filo, como una sola barra continua, no dos cápsulas separadas).
function segmentoConTopeRedondo(x: number, y: number, ancho: number, alto: number, radio: number): string {
  const r = Math.min(radio, ancho / 2, Math.max(alto, 0));
  if (alto <= 0) return "";
  if (r <= 0) return `M${x},${y} h${ancho} v${alto} h${-ancho} Z`;
  return `M${x},${y + r} a${r},${r} 0 0 1 ${r},${-r} h${ancho - 2 * r} a${r},${r} 0 0 1 ${r},${r} v${alto - r} h${-ancho} Z`;
}

export default function GraficaActividad({ datos }: { datos: PuntoActividad[] }) {
  const altoChart = 178;
  const margenIzq = 42;
  const anchoBarra = 48;
  // Reparte las siete barras a lo ancho del panel. El viewBox amplio evita
  // que el gráfico quede como una miniatura centrada en tarjetas grandes.
  const espacio = datos.length > 1 ? (700 - datos.length * anchoBarra) / (datos.length - 1) : 0;
  const anchoTotal = 760;

  // Eje Y con 4 divisiones parejas (0, paso, 2×paso, 3×paso, 4×paso), siempre
  // enteras: el truco anterior (tope/4 como fracción) no daba pasos parejos.
  const maxReal = Math.max(1, ...datos.map((d) => d.permitidas + d.bloqueadas));
  const paso = Math.max(1, Math.ceil(maxReal / 4));
  const topeEje = paso * 4;
  const marcas = [0, paso, paso * 2, paso * 3, topeEje];

  return (
    <svg
      width="100%"
      height={altoChart + 30}
      viewBox={`0 0 ${anchoTotal} ${altoChart + 30}`}
      role="img"
      aria-label="Actividad de los últimos 7 días"
    >
      {marcas.map((valor) => {
        const y = altoChart - (valor / topeEje) * altoChart;
        return (
          <g key={valor}>
            <line x1={margenIzq} y1={y} x2={anchoTotal} y2={y} stroke="var(--borde)" strokeWidth="1" />
            <text x={margenIzq - 8} y={y + 3} textAnchor="end" fontSize="10" fill="var(--texto-suave)">
              {valor}
            </text>
          </g>
        );
      })}

      {datos.map((d, i) => {
        const x = margenIzq + i * (anchoBarra + espacio);
        const alturaPermitidas = (d.permitidas / topeEje) * altoChart;
        const alturaBloqueadas = (d.bloqueadas / topeEje) * altoChart;
        const yBase = altoChart;
        const yPermitidas = yBase - alturaPermitidas;
        const yBloqueadas = yPermitidas - alturaBloqueadas;
        // Redondeado arriba: del segmento bloqueadas si existe, si no del de
        // permitidas (para que el tope de la barra siempre se vea curvo).
        const permitidasRedondo = alturaBloqueadas === 0;
        const total = d.permitidas + d.bloqueadas;
        const textoTooltip = `${d.fechaCompleta}: ${total} evaluación(es) — ${d.permitidas} PERMITIR, ${d.bloqueadas} BLOQUEAR`;
        return (
          <g key={d.etiqueta}>
            {/* Área invisible de toda la columna: así hay tooltip (nativo, sin
                librería) incluso en los días sin actividad, donde no hay
                barra visible que pasar el cursor encima. */}
            <rect x={x} y={0} width={anchoBarra} height={altoChart} fill="transparent">
              <title>{textoTooltip}</title>
            </rect>
            {alturaPermitidas > 0 && (
              <path
                d={segmentoConTopeRedondo(x, yPermitidas, anchoBarra, alturaPermitidas, permitidasRedondo ? RADIO : 0)}
                fill="var(--permitir)"
                pointerEvents="none"
              />
            )}
            {alturaBloqueadas > 0 && (
              <path
                d={segmentoConTopeRedondo(x, yBloqueadas, anchoBarra, alturaBloqueadas, RADIO)}
                fill="var(--bloquear)"
                pointerEvents="none"
              />
            )}
            <text x={x + anchoBarra / 2} y={altoChart + 18} textAnchor="middle" fontSize="11" fill="var(--texto-suave)">
              {d.etiqueta}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
