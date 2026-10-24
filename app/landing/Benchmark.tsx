import { IconoAlerta, IconoCheck, IconoChevronDerecha, IconoDocumento, IconoX } from "../componentes/Icono";
import { NOMBRE_REGLA } from "../lib/formato";
import styles from "./landing.module.css";

// Solo KPIs reales (los mismos que ya calcula /panel): no existen en el
// modelo conceptos como "tasa de acierto" o "tiempo de validación" — el
// motor es determinista y síncrono, sin ground truth contra el cual medir
// aciertos ni temporizadores de evaluación. "Rendimiento por regla" es
// % de evaluaciones CUMPLE sobre el total de esa regla, dato real.
export default function Benchmark({
  total,
  permitidas,
  bloqueadas,
  pendientes,
  rendimientoPorRegla,
}: {
  total: number;
  permitidas: number;
  bloqueadas: number;
  pendientes: number;
  rendimientoPorRegla: { regla_id: string; porcentaje: number }[];
}) {
  const tasaAprobacion = total ? Math.round((permitidas / total) * 100) : 0;

  return (
    <section id="benchmark" className={`${styles.section} ${styles.sectionAlt} ${styles.container}`}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Benchmark: conoce el desempeño de tus reglas</h2>
          <p className={styles.sectionSubtitle}>Compara resultados, identifica áreas de mejora y optimiza tu operación.</p>
        </div>
        {/* <a>, no next/link: cruza a la raíz del grupo (app) (otro
            <html>/<body> — ver app/layout.tsx), así que necesita navegación
            completa del navegador, no una transición cliente. */}
        <a href="/historial" className={styles.sectionLink}>
          Explorar benchmark <IconoChevronDerecha tamano={15} />
        </a>
      </div>

      {total === 0 ? (
        <p className="estado-vacio">Todavía no hay evaluaciones registradas en esta instancia.</p>
      ) : (
        <div className={styles.benchmarkGrid}>
          <div className={styles.benchmarkKpis}>
            <div className={styles.benchmarkKpiCard}>
              <span className={styles.benchmarkKpiIcon} style={{ color: "var(--acento)", background: "var(--acento-suave)" }}>
                <IconoDocumento tamano={18} />
              </span>
              <span className={styles.benchmarkKpiLabel}>Solicitudes evaluadas</span>
              <span className={styles.benchmarkKpiValue}>{total}</span>
            </div>
            <div className={styles.benchmarkKpiCard}>
              <span className={styles.benchmarkKpiIcon} style={{ color: "var(--permitir)", background: "color-mix(in srgb, var(--permitir) 16%, transparent)" }}>
                <IconoCheck tamano={18} />
              </span>
              <span className={styles.benchmarkKpiLabel}>Tasa de aprobación</span>
              <span className={styles.benchmarkKpiValue}>{tasaAprobacion}%</span>
            </div>
            <div className={styles.benchmarkKpiCard}>
              <span className={styles.benchmarkKpiIcon} style={{ color: "var(--bloquear)", background: "color-mix(in srgb, var(--bloquear) 16%, transparent)" }}>
                <IconoX tamano={18} />
              </span>
              <span className={styles.benchmarkKpiLabel}>Pagos bloqueados</span>
              <span className={styles.benchmarkKpiValue}>{bloqueadas}</span>
            </div>
            <div className={styles.benchmarkKpiCard}>
              <span className={styles.benchmarkKpiIcon} style={{ color: "var(--indeterminado)", background: "color-mix(in srgb, var(--indeterminado) 16%, transparent)" }}>
                <IconoAlerta tamano={18} />
              </span>
              <span className={styles.benchmarkKpiLabel}>Pendientes de revisión</span>
              <span className={styles.benchmarkKpiValue}>{pendientes}</span>
            </div>
          </div>

          <div className={styles.benchmarkPanel}>
            <h3>Rendimiento por regla (% de cumplimiento)</h3>
            {rendimientoPorRegla.map((r) => (
              <div key={r.regla_id} className={styles.benchmarkRuleRow}>
                <span className={styles.benchmarkRuleId}>{r.regla_id}</span>
                <span className={styles.benchmarkRuleBar}>
                  <span className={styles.benchmarkRuleFill} style={{ width: `${r.porcentaje}%` }} />
                </span>
                <span className={styles.benchmarkRulePct}>{r.porcentaje}%</span>
              </div>
            ))}
            <p style={{ marginTop: "0.75rem", fontSize: "0.72rem", color: "var(--texto-suave)" }}>
              {Object.values(NOMBRE_REGLA).length} reglas evaluadas en cada solicitud (PAG-001 a PAG-005).
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
