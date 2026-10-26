"use client";

import { motion, type Variants } from "motion/react";
import FondoHero from "./FondoHero";
import ImagenHero from "./ImagenHero";
import { IconoRayo } from "./IconoLanding";
import { IconoBuscar, IconoEscudo } from "../Icono";
import { useMovimientoReducido } from "./hooks";

const SUAVE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const contenedor: Variants = {
  oculto: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
const item: Variants = {
  oculto: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: SUAVE } },
};

const RASGOS = [
  { Icono: IconoBuscar, titulo: "Menos falsos positivos", texto: "Bloquea lo que incumple una regla real, no un criterio subjetivo." },
  { Icono: IconoEscudo, titulo: "Decisiones deterministas", texto: "Mismo pago, mismas reglas, misma decisión — siempre." },
  { Icono: IconoRayo, titulo: "Evidencia inmediata", texto: "Cada bloqueo deja un informe trazable, sin esperar una auditoría." },
];

// Entrada escalonada del copy del hero (nivel 3, al cargar — no depende de
// scroll: es lo primero que se ve). La imagen del dashboard (ImagenHero) ya
// tiene su propia entrada.
export default function Hero() {
  const reducido = useMovimientoReducido();

  return (
    <section className="lp-hero">
      <FondoHero />
      <div className="lp-contenedor lp-hero-grid">
        <motion.div
          initial={reducido ? false : "oculto"}
          animate="visible"
          variants={reducido ? undefined : contenedor}
        >
          <motion.span className="lp-pastilla" variants={reducido ? undefined : item}>
            <span className="lp-punto" /> FINTECH · MOTOR DETERMINISTA · EVIDENCIA VERIFICABLE
          </motion.span>
          <motion.h1 className="lp-titular" variants={reducido ? undefined : item}>
            Cada pago, <em>evaluado contra reglas</em>,<br />no contra el criterio de quien lo aprueba
          </motion.h1>
          <motion.p className="lp-subtitulo" variants={reducido ? undefined : item}>
            FlowGuard corre cada solicitud de pago contra reglas deterministas y configurables, bloquea
            lo que las incumple y deja un informe de evidencia trazable. La IA investiga y explica; el
            motor de reglas es el único que decide.
          </motion.p>
          <motion.div className="lp-hero-acciones" variants={reducido ? undefined : item}>
            <a href="/simulador" className="lp-boton lp-boton-primario">
              Abrir el simulador <span className="lp-flecha">→</span>
            </a>
            <a href="#deteccion" className="lp-boton lp-boton-secundario">
              <span className="lp-boton-play" aria-hidden="true">▶</span> Ver detección en vivo
            </a>
          </motion.div>
          <motion.ul className="lp-hero-rasgos" variants={reducido ? undefined : item}>
            {RASGOS.map(({ Icono, titulo, texto }) => (
              <li key={titulo}>
                <span className="lp-hero-rasgo-icono">
                  <Icono tamano={17} />
                </span>
                <span>
                  <strong>{titulo}</strong>
                  <span>{texto}</span>
                </span>
              </li>
            ))}
          </motion.ul>
        </motion.div>
        <ImagenHero />
      </div>
    </section>
  );
}
