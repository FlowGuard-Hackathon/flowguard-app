import Link from "next/link";
import { IconoCandado } from "../componentes/Icono";
import styles from "./landing.module.css";

export default function CtaFinal() {
  return (
    <section className={styles.container} style={{ marginBottom: "clamp(3rem, 5vw, 4.5rem)" }}>
      <div className={styles.ctaFinal}>
        <div className={styles.ctaFinalGlow} aria-hidden="true" />
        <div className={styles.ctaFinalInner}>
          <div>
            <span className={styles.ctaFinalOverline}>Transforma la forma en que supervisas tus pagos</span>
            <h2 className={styles.ctaFinalTitle}>Descubre el potencial de FlowGuard</h2>
            <p className={styles.ctaFinalDesc}>
              Explora cómo la supervisión inteligente, las reglas verificables y la evidencia trazable pueden
              fortalecer tus procesos de aprobación.
            </p>
          </div>
          <div className={styles.ctaFinalBtns}>
            {/* <a>, no next/link: cruza a la raíz del grupo (app) — ver nota en Benchmark.tsx. */}
            <a href="/panel" className="boton boton-primario">
              Explorar demo
            </a>
            <Link
              href="https://github.com/FlowGuard-Hackathon/flowguard-docs/blob/main/arquitectura.md"
              target="_blank"
              rel="noreferrer noopener"
              className="boton boton-secundario"
            >
              Ver arquitectura
            </Link>
            <span className={styles.ctaFinalNote}>
              <IconoCandado tamano={12} /> MVP de supervisión; no ejecuta transferencias bancarias reales.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
