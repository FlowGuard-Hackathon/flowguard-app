import { IconoBuscar, IconoCarpeta, IconoCerebro, IconoChevronDerecha, IconoEscudo } from "../componentes/Icono";
import styles from "./landing.module.css";

const CAPACIDADES = [
  {
    icono: <IconoBuscar tamano={22} />,
    titulo: "Supervisión de pagos",
    desc: "Analiza cada solicitud en tiempo real y detecta riesgos, patrones inusuales e incumplimientos.",
  },
  {
    icono: <IconoEscudo tamano={22} />,
    titulo: "Validación determinista",
    desc: "Aplica reglas de negocio verificables. La IA investiga, pero el sistema toma la decisión.",
  },
  {
    icono: <IconoCerebro tamano={22} />,
    titulo: "Investigación con IA",
    desc: "Busca y analiza información relevante para explicar cada resultado con evidencia clara.",
  },
  {
    icono: <IconoCarpeta tamano={22} />,
    titulo: "Trazabilidad completa",
    desc: "Conserva evidencias, decisiones y justificación en un solo lugar, listo para auditoría.",
  },
];

export default function Capacidades() {
  return (
    <section id="capacidades" className={`${styles.section} ${styles.container}`}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Capacidades que protegen tu operación financiera</h2>
          <p className={styles.sectionSubtitle}>Una plataforma diseñada para supervisar cada decisión con inteligencia y control.</p>
        </div>
        {/* <a>, no next/link: cruza a la raíz del grupo (app) — ver nota en Benchmark.tsx. */}
        <a href="/panel" className={styles.sectionLink}>
          Conoce todas las funcionalidades <IconoChevronDerecha tamano={15} />
        </a>
      </div>

      <div className={styles.capGrid}>
        {CAPACIDADES.map((c) => (
          <div key={c.titulo} className={styles.capCard}>
            <span className={styles.capIcon}>{c.icono}</span>
            <h3 className={styles.capTitle}>{c.titulo}</h3>
            <p className={styles.capDesc}>{c.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
