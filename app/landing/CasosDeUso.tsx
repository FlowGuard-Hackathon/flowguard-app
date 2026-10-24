import { IconoCandado, IconoDocumento, IconoFlechaArriba, IconoMoneda } from "../componentes/Icono";
import styles from "./landing.module.css";

const CASOS = [
  { icono: <IconoMoneda tamano={19} />, titulo: "Cuentas por pagar", desc: "Aprueba pagos más seguros y sin fraudes." },
  { icono: <IconoFlechaArriba tamano={19} />, titulo: "Tesorería", desc: "Control y visibilidad total de egresos." },
  { icono: <IconoDocumento tamano={19} />, titulo: "Auditoría interna", desc: "Evidencia verificable y trazabilidad completa." },
  { icono: <IconoCandado tamano={19} />, titulo: "Cumplimiento", desc: "Alineación con políticas y regulación interna." },
];

export default function CasosDeUso() {
  return (
    <section id="casos-de-uso" className={`${styles.section} ${styles.container}`}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Casos de uso</h2>
          <p className={styles.sectionSubtitle}>Útil para distintos equipos dentro de tu organización.</p>
        </div>
      </div>
      <div className={styles.useGrid}>
        {CASOS.map((c) => (
          <div key={c.titulo} className={styles.useCard}>
            <span className={styles.useIcon}>{c.icono}</span>
            <div>
              <h3 className={styles.useTitle}>{c.titulo}</h3>
              <p className={styles.useDesc}>{c.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
