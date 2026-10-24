"use client";

import { useRef } from "react";
import IntelligentBackground from "../(auth)/login/IntelligentBackground";
import GraficaActividad, { type PuntoActividad } from "../componentes/GraficaActividad";
import { IconoCerebro, IconoEscudo, IconoFlechaArriba } from "../componentes/Icono";
import { NOMBRE_REGLA, claseChipDecision, formatoFechaCorta, formatoMoneda } from "../lib/formato";
import ContadorAnimado from "./ContadorAnimado";
import styles from "./landing.module.css";

type Resumen = {
  ejecucion: { ejecucion_id: string; decision: "PERMITIR" | "BLOQUEAR"; creado_en: string };
  contextoPago: { categoria: string; monto_centavos: number; solicitante_id: string };
};

export default function Hero({
  total,
  permitidas,
  bloqueadas,
  pendientes,
  grafica,
  rendimientoPorRegla,
  recientes,
  rangoEtiqueta,
}: {
  total: number;
  permitidas: number;
  bloqueadas: number;
  pendientes: number;
  grafica: PuntoActividad[];
  rendimientoPorRegla: { regla_id: string; porcentaje: number }[];
  recientes: Resumen[];
  rangoEtiqueta: string;
}) {
  const safeRef = useRef<HTMLDivElement>(null);

  return (
    <section className={styles.hero}>
      <div className={styles.heroBgWrap}>
        <IntelligentBackground avoidRef={safeRef} />
      </div>

      <div className={`${styles.container} ${styles.heroInner}`}>
        <div ref={safeRef}>
          <span className={styles.heroBadge}>Fintech · Inteligencia artificial · Control de pagos</span>
          <h1 className={styles.heroTitle}>
            El guardián inteligente de tus <span className={styles.heroAccent}>procesos financieros</span>.
          </h1>
          <p className={styles.heroDesc}>
            Supervisa, valida y protege cada aprobación de pago con inteligencia artificial y reglas verificables.
            Detecta riesgos antes de que se propaguen y toma decisiones más seguras, rápidas y transparentes.
          </p>
          <div className={styles.heroCtas}>
            {/* <a>, no next/link: cruza a la raíz del grupo (app) — ver nota en Benchmark.tsx. */}
            <a href="/panel" className="boton boton-primario">
              Explorar demo
              <IconoFlechaArriba tamano={12} />
            </a>
            <a
              href="#capacidades"
              className="boton boton-secundario"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("capacidades")?.scrollIntoView();
              }}
            >
              Ver producto
            </a>
          </div>

          <div className={styles.heroChips}>
            <div className={styles.heroChip}>
              <span className={styles.heroChipIcon}>
                <IconoEscudo tamano={17} />
              </span>
              <span>
                <span className={styles.heroChipTitle}>Menos riesgos</span>
                <span className={styles.heroChipDesc}>Detecta incumplimientos de política antes de aprobar.</span>
              </span>
            </div>
            <div className={styles.heroChip}>
              <span className={styles.heroChipIcon}>
                <IconoCerebro tamano={17} />
              </span>
              <span>
                <span className={styles.heroChipTitle}>Decisiones confiables</span>
                <span className={styles.heroChipDesc}>Reglas deterministas y evidencia verificable.</span>
              </span>
            </div>
            <div className={styles.heroChip}>
              <span className={styles.heroChipIcon}>
                <IconoFlechaArriba tamano={17} />
              </span>
              <span>
                <span className={styles.heroChipTitle}>Mayor eficiencia</span>
                <span className={styles.heroChipDesc}>Evaluación inmediata, sin comprometer el control.</span>
              </span>
            </div>
          </div>
        </div>

        <div className={styles.dashboardMock} aria-label="Vista de muestra del panel de supervisión, con datos reales de esta instancia">
          <div className={styles.dashboardHeader}>
            <div className={styles.dashboardHeaderLeft}>
              <h3>Panel de supervisión</h3>
              <p>Resumen de la actividad de aprobaciones</p>
            </div>
            <span className={styles.dashboardRange}>{rangoEtiqueta}</span>
          </div>

          <div className={styles.dashboardKpis}>
            <div className={styles.dashboardKpiCard}>
              <span className={styles.dashboardKpiLabel}>Solicitudes evaluadas</span>
              <span className={styles.dashboardKpiValue}>
                <ContadorAnimado valor={total} />
              </span>
            </div>
            <div className={styles.dashboardKpiCard}>
              <span className={styles.dashboardKpiLabel}>Permitidas</span>
              <span className={styles.dashboardKpiValue} style={{ color: "var(--permitir)" }}>
                <ContadorAnimado valor={permitidas} />
              </span>
            </div>
            <div className={styles.dashboardKpiCard}>
              <span className={styles.dashboardKpiLabel}>Bloqueadas</span>
              <span className={styles.dashboardKpiValue} style={{ color: "var(--bloquear)" }}>
                <ContadorAnimado valor={bloqueadas} />
              </span>
            </div>
            <div className={styles.dashboardKpiCard}>
              <span className={styles.dashboardKpiLabel}>En revisión</span>
              <span className={styles.dashboardKpiValue} style={{ color: "var(--indeterminado)" }}>
                <ContadorAnimado valor={pendientes} />
              </span>
            </div>
          </div>

          <div className={styles.dashboardChartCard}>
            <div className={styles.dashboardChartHeader}>
              <h4>Evolución de solicitudes</h4>
            </div>
            {grafica.every((p) => p.permitidas + p.bloqueadas === 0) ? (
              <p className="estado-vacio" style={{ padding: "1.5rem 0", fontSize: "0.78rem" }}>
                Sin evaluaciones registradas todavía en esta instancia.
              </p>
            ) : (
              <GraficaActividad datos={grafica} etiqueta="Evolución reciente de solicitudes" />
            )}
          </div>

          <div className={styles.dashboardTableCard}>
            <h4>Solicitudes recientes</h4>
            {recientes.length === 0 ? (
              <p className="estado-vacio" style={{ padding: "0.75rem 0", fontSize: "0.78rem" }}>
                Todavía no hay solicitudes en esta instancia.
              </p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Categoría</th>
                    <th>Importe</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {recientes.map((r) => (
                    <tr key={r.ejecucion.ejecucion_id}>
                      <td>{r.ejecucion.ejecucion_id}</td>
                      <td>{r.contextoPago.categoria}</td>
                      <td>{formatoMoneda(r.contextoPago.monto_centavos)}</td>
                      <td>
                        <span className={claseChipDecision(r.ejecucion.decision)}>{r.ejecucion.decision}</span>
                      </td>
                      <td>{formatoFechaCorta(r.ejecucion.creado_en)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {rendimientoPorRegla.length > 0 && (
            <div className={styles.dashboardTableCard} style={{ marginTop: "0.9rem" }}>
              <h4>Rendimiento por regla</h4>
              <ul className="lista-reglas" style={{ gap: "0.5rem" }}>
                {rendimientoPorRegla.slice(0, 3).map((r) => (
                  <li key={r.regla_id} style={{ gridTemplateColumns: "1fr 36px" }}>
                    <div className="regla-info">
                      <span className="regla-fila-titulo" style={{ fontSize: "0.68rem" }}>
                        <span>{r.regla_id}</span>
                        <small>{NOMBRE_REGLA[r.regla_id] ?? ""}</small>
                      </span>
                      <div className="barra-progreso">
                        <div className="barra-progreso-relleno" style={{ width: `${r.porcentaje}%` }} />
                      </div>
                    </div>
                    <span className="regla-porcentaje">{r.porcentaje}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
