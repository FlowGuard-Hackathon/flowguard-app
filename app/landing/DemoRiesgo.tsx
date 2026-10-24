import { IconoAlerta, IconoDocumento, IconoSuma, IconoX } from "../componentes/Icono";
import styles from "./landing.module.css";

// Caso ilustrativo fijo (no viene de la base de datos): los valores exactos
// los pide el prompt de la landing — $15,000 MXN, umbral $10,000 MXN, sin
// autorización de supervisor, PAG-001, resultado BLOQUEAR. Es el mismo caso
// que ya prueban los tests de flowguard-src (flujoCompleto.test.ts). Se
// etiqueta "Ejemplo ilustrativo" explícitamente: no es una ejecución real
// de esta instancia ni una transferencia bancaria ejecutada.
export default function DemoRiesgo() {
  return (
    <section className={`${styles.section} ${styles.container}`}>
      <div className={styles.riskGrid}>
        <div className={styles.riskCard}>
          <span className={styles.riskBadgeDemo}>Ejemplo ilustrativo</span>
          <div className={styles.riskCardHeader}>
            <div>
              <strong style={{ fontSize: "0.9rem" }}>Solicitud de pago</strong>
            </div>
            <span className="chip chip-bloquear">
              <IconoX tamano={12} /> BLOQUEAR
            </span>
          </div>
          <div className={styles.riskRows}>
            <div className={styles.riskRow}>
              <span>Importe</span>
              <span>$15,000 MXN</span>
            </div>
            <div className={styles.riskRow}>
              <span>Umbral de autorización</span>
              <span>$10,000 MXN</span>
            </div>
            <div className={styles.riskRow}>
              <span>Autorización de supervisor</span>
              <span>No disponible</span>
            </div>
            <div className={styles.riskRow}>
              <span>Regla determinante</span>
              <span>PAG-001</span>
            </div>
          </div>
          <div className={styles.riskWarning}>
            <IconoAlerta tamano={16} />
            <span>El importe supera el umbral de autorización y no tiene una aprobación de supervisor registrada.</span>
          </div>
        </div>

        <div>
          <h3 className={styles.riskTextTitle}>
            Detecta problemas antes de que se conviertan en pérdidas.
          </h3>
          <p className={styles.riskTextDesc}>
            FlowGuard evalúa cada solicitud contra reglas verificables, investiga con IA y entrega una decisión
            clara con evidencia. Las infracciones de política se detectan antes de aprobar, no después.
          </p>
          {/* <a>, no next/link: cruza a la raíz del grupo (app) — ver nota en Benchmark.tsx. */}
          <a href="/simulador" className={styles.sectionLink}>
            Probar un caso en el simulador →
          </a>
        </div>

        <div className={styles.riskSteps}>
          <div className={styles.riskStep}>
            <span className={styles.riskStepIcon}>
              <IconoSuma tamano={14} />
            </span>
            <span>
              <span className={styles.riskStepTitle}>Solicitud recibida</span>
              <span className={styles.riskStepDesc}>$15,000 MXN</span>
            </span>
          </div>
          <div className={styles.riskStep}>
            <span className={styles.riskStepIcon}>
              <IconoDocumento tamano={14} />
            </span>
            <span>
              <span className={styles.riskStepTitle}>Reglas de negocio evaluadas</span>
              <span className={styles.riskStepDesc}>PAG-001 · Límite de autorización</span>
            </span>
          </div>
          <div className={styles.riskStep}>
            <span className={`${styles.riskStepIcon} ${styles.riskStepIconBloquear}`}>
              <IconoAlerta tamano={14} />
            </span>
            <span>
              <span className={styles.riskStepTitle}>Riesgo detectado</span>
              <span className={styles.riskStepDesc}>Monto mayor al umbral permitido</span>
            </span>
          </div>
          <div className={styles.riskStep}>
            <span className={`${styles.riskStepIcon} ${styles.riskStepIconBloquear}`}>
              <IconoX tamano={14} />
            </span>
            <span>
              <span className={styles.riskStepTitle}>Decisión: pago bloqueado</span>
              <span className={styles.riskStepDesc}>Con evidencia y justificación</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
