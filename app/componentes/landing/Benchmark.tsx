"use client";

import { useEffect, useState, type ComponentType } from "react";
import Link from "next/link";
import { IconoCheck, IconoDocumento, IconoEscudo, IconoReloj } from "../Icono";
import Revelar from "./Revelar";
import { useEnVista } from "./hooks";

// Las 5 reglas reales del motor (flowguard-docs/reglas.md § 2). La
// distribución de incumplimientos es un dataset SINTÉTICO de demostración,
// no una medición de producción — se etiqueta como tal en la UI (brief § 7:
// no presentar precisión/reducción de fraude como resultados comprobados).
const REGLAS = [
  { id: "PAG-001", nombre: "Límite de autorización", participacion: 42, tono: 0 },
  { id: "PAG-003", nombre: "Separación de funciones", participacion: 24, tono: 1 },
  { id: "PAG-004", nombre: "Factura verificada", participacion: 18, tono: 2 },
  { id: "PAG-002", nombre: "Categoría permitida", participacion: 11, tono: 3 },
  { id: "PAG-005", nombre: "Presupuesto disponible", participacion: 5, tono: 4 },
];

const PALETA_BARRAS = [
  "var(--acento)",
  "color-mix(in srgb, var(--acento) 70%, #22d3ee)",
  "color-mix(in srgb, var(--acento) 55%, #22d3ee)",
  "color-mix(in srgb, var(--acento) 75%, #a855f7)",
  "color-mix(in srgb, var(--acento) 55%, #a855f7)",
];

const METRICAS: { Icono: ComponentType<{ tamano?: number }>; etiqueta: string; valor: number; sufijo: string; nota: string }[] = [
  { Icono: IconoEscudo, etiqueta: "Reglas deterministas evaluadas", valor: 5, sufijo: "", nota: "por cada solicitud, en orden estable" },
  { Icono: IconoDocumento, etiqueta: "Solicitudes de demostración", valor: 480, sufijo: "", nota: "dataset sintético, no tráfico real" },
  { Icono: IconoCheck, etiqueta: "Bloqueadas por regla incumplida", valor: 97, sufijo: "", nota: "de 480, en el dataset de demostración" },
  { Icono: IconoReloj, etiqueta: "Investigaciones con informe", valor: 91, sufijo: "%", nota: "del subconjunto bloqueado, estado COMPLETADA" },
];

function useConteo(valorFinal: number, activo: boolean, duracionMs = 900) {
  const [valor, setValor] = useState(0);
  useEffect(() => {
    if (!activo) return;
    const inicio = performance.now();
    let cuadro: number;
    const paso = (ahora: number) => {
      const t = Math.min(1, (ahora - inicio) / duracionMs);
      const facilitado = 1 - (1 - t) * (1 - t);
      setValor(Math.round(valorFinal * facilitado));
      if (t < 1) cuadro = requestAnimationFrame(paso);
    };
    cuadro = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(cuadro);
  }, [activo, valorFinal, duracionMs]);
  return valor;
}

function Metrica({ Icono, etiqueta, valor, sufijo, nota, activo }: { Icono: ComponentType<{ tamano?: number }>; etiqueta: string; valor: number; sufijo: string; nota: string; activo: boolean }) {
  const contado = useConteo(valor, activo);
  return (
    <div className="lp-benchmark-metrica">
      <span className="lp-kpi-icono lp-kpi-icono-neutro">
        <Icono tamano={14} />
      </span>
      <dt>{etiqueta}</dt>
      <dd>
        {contado}
        {sufijo}
      </dd>
      <small>{nota}</small>
    </div>
  );
}

export default function Benchmark() {
  const { ref, visible } = useEnVista<HTMLDivElement>(0.3);
  const maximo = Math.max(...REGLAS.map((r) => r.participacion));

  return (
    <section id="benchmark" className="lp-seccion">
      <div className="lp-contenedor">
        <Revelar className="lp-seccion-cabecera lp-seccion-cabecera-fila">
          <div>
            <span className="lp-sobretitulo">Benchmark</span>
            <h2 className="lp-seccion-titulo">Qué regla bloquea más, y por qué</h2>
            <p className="lp-seccion-texto">
              Distribución de incumplimientos por regla sobre un dataset sintético de demostración — no
              son cifras de producción ni una medición de reducción de fraude.
            </p>
          </div>
          <Link href="/historial" className="lp-enlace-seccion">
            Explorar historial real <span className="lp-flecha">→</span>
          </Link>
        </Revelar>

        <div className="lp-benchmark-layout">
          <div ref={ref} className="lp-benchmark-grid">
            {METRICAS.map((m) => (
              <Metrica key={m.etiqueta} {...m} activo={visible} />
            ))}
          </div>

          <Revelar className="lp-benchmark-panel-envoltorio">
            <div className="lp-benchmark-panel">
              <div className="lp-benchmark-panel-cabecera">
                <span className="lp-panel-titulo">Rendimiento por regla</span>
                <span className="lp-estado-pastilla permitir">Top 5</span>
              </div>
              <div className="lp-benchmark-grafica-scroll">
                <svg width="100%" height={5 * 46 + 10} viewBox={`0 0 760 ${5 * 46 + 10}`} role="img" aria-label="Participación de cada regla en los bloqueos, dataset de demostración">
                  {REGLAS.map((r, i) => {
                    const y = i * 46 + 8;
                    const anchoMax = 560;
                    const ancho = (r.participacion / maximo) * anchoMax;
                    return (
                      <g key={r.id} className="lp-benchmark-fila">
                        <text x={0} y={y + 20} fontSize="12" fill="var(--texto-suave)">
                          {r.id}
                        </text>
                        <rect x={70} y={y} width={anchoMax} height={28} rx={6} fill="var(--superficie-alta)" />
                        <rect
                          className="lp-benchmark-barra"
                          x={70}
                          y={y}
                          width={visible ? ancho : 0}
                          height={28}
                          rx={6}
                          fill={PALETA_BARRAS[r.tono]}
                          style={{ transition: "width 0.9s cubic-bezier(0.16,1,0.3,1)", transitionDelay: `${i * 90}ms` }}
                        />
                        <text x={70 + anchoMax + 12} y={y + 20} fontSize="12" fill="var(--texto)" fontWeight={600}>
                          {r.participacion}%
                        </text>
                        <title>{`${r.id} — ${r.nombre}: ${r.participacion}% de los bloqueos (demostración)`}</title>
                      </g>
                    );
                  })}
                </svg>
              </div>
              <div className="lp-benchmark-leyenda">
                {REGLAS.map((r) => (
                  <span key={r.id}>
                    <span className="lp-dot" style={{ background: PALETA_BARRAS[r.tono] }} /> {r.id} · {r.nombre}
                  </span>
                ))}
              </div>
            </div>
          </Revelar>
        </div>
      </div>
    </section>
  );
}
