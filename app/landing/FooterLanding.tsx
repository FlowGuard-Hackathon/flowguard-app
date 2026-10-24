import Image from "next/image";
import styles from "./landing.module.css";

const SECCIONES = [
  { id: "capacidades", etiqueta: "Producto" },
  { id: "como-funciona", etiqueta: "Cómo funciona" },
  { id: "benchmark", etiqueta: "Benchmark" },
  { id: "casos-de-uso", etiqueta: "Casos de uso" },
];

export default function FooterLanding() {
  return (
    <footer className={`${styles.footer} ${styles.container}`}>
      <div className={styles.footerInner}>
        <div className={styles.footerBrand}>
          <Image src="/logo-nombre.png" alt="FlowGuard" width={140} height={44} />
          <span className={styles.footerTag}>DETECT · VERIFY · PROTECT</span>
        </div>

        <div className={styles.footerCols}>
          <div className={styles.footerCol}>
            <h4>Secciones</h4>
            <ul>
              {SECCIONES.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>{s.etiqueta}</a>
                </li>
              ))}
            </ul>
          </div>
          {/* <a>, no next/link: todos cruzan a otra raíz ((app) o (auth)) —
              ver nota en Benchmark.tsx. */}
          <div className={styles.footerCol}>
            <h4>Producto</h4>
            <ul>
              <li>
                <a href="/panel">Panel de supervisión</a>
              </li>
              <li>
                <a href="/simulador">Simulador</a>
              </li>
              <li>
                <a href="/evidencias">Centro de evidencias</a>
              </li>
              <li>
                <a href="/login">Iniciar sesión</a>
              </li>
            </ul>
          </div>
          <div className={styles.footerCol}>
            <h4>Recursos</h4>
            <ul>
              <li>
                <a href="https://github.com/FlowGuard-Hackathon/flowguard-docs" target="_blank" rel="noreferrer noopener">
                  Documentación
                </a>
              </li>
              <li>
                <a href="https://github.com/FlowGuard-Hackathon/flowguard-docs/blob/main/reglas.md" target="_blank" rel="noreferrer noopener">
                  Reglas de negocio
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>© {new Date().getFullYear()} FlowGuard — Proyecto de hackathon. MVP de supervisión, sin pagos reales.</div>
    </footer>
  );
}
