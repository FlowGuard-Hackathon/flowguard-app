import Link from "next/link";
import { IconoCarpeta, IconoCheck, IconoChevronDerecha, IconoDocumento, IconoEscudo, IconoInfo } from "../componentes/Icono";
import styles from "./landing.module.css";

const PASOS = [
  { num: 1, icono: <IconoDocumento tamano={16} />, titulo: "Analiza", desc: "Revisa la solicitud con reglas de negocio inteligentes." },
  { num: 2, icono: <IconoEscudo tamano={16} />, titulo: "Valida", desc: "Verifica reglas y evidencia en fuentes confiables." },
  { num: 3, icono: <IconoCheck tamano={16} />, titulo: "Decide", desc: "Permite, bloquea o marca como indeterminada según las reglas." },
  { num: 4, icono: <IconoCarpeta tamano={16} />, titulo: "Registra", desc: "Genera trazabilidad completa para auditoría y cumplimiento." },
];

export default function ComoFunciona() {
  return (
    <section id="como-funciona" className={`${styles.section} ${styles.container}`}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>De la solicitud a la decisión, con control en cada paso.</h2>
        </div>
        <Link href="https://github.com/FlowGuard-Hackathon/flowguard-docs/blob/main/reglas.md" target="_blank" rel="noreferrer noopener" className={styles.sectionLink}>
          Ver proceso completo <IconoChevronDerecha tamano={15} />
        </Link>
      </div>

      <div className={styles.howSteps}>
        {PASOS.map((p) => (
          <div key={p.num} className={styles.howStep}>
            <div className={styles.howStepTop}>
              <span className={styles.howStepNum}>{p.num}</span>
              <span className={styles.howStepIcon}>{p.icono}</span>
            </div>
            <h3 className={styles.howStepTitle}>{p.titulo}</h3>
            <p className={styles.howStepDesc}>{p.desc}</p>
            {p.num < 4 && (
              <span className={styles.howConnector}>
                <IconoChevronDerecha tamano={18} />
              </span>
            )}
          </div>
        ))}
      </div>

      <p className={styles.howNote}>
        <IconoInfo tamano={16} />
        La decisión final siempre depende del motor determinista: el agente de IA investiga y reúne evidencia, pero
        no autoriza pagos ni modifica reglas de negocio.
      </p>
    </section>
  );
}
