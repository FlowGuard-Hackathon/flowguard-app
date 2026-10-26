"use client";

import { useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useMovimientoReducido } from "./hooks";

// Mockup del dashboard ya renderizado como imagen (public/hero-lp.png, con
// la perspectiva 3D y el brillo ya "horneados" en el PNG) en vez del panel
// construido en HTML/CSS/SVG que había antes — reemplaza a PanelHero.tsx.
// Como la inclinación ya viene en la imagen, aquí solo se anima la entrada,
// un parallax ligero al cursor (traslación, no rotación — rotar encima de
// una perspectiva que ya está dibujada se vería doble) y un balanceo
// continuo muy sutil para que no se sienta una foto estática.
export default function ImagenHero() {
  const reducido = useMovimientoReducido();
  const envoltorioRef = useRef<HTMLDivElement | null>(null);
  const [esTactil, setEsTactil] = useState(true);

  const x = useSpring(useMotionValue(0), { stiffness: 80, damping: 16 });
  const y = useSpring(useMotionValue(0), { stiffness: 80, damping: 16 });

  const alMoverCursor = (e: MouseEvent<HTMLDivElement>) => {
    if (reducido) return;
    const nodo = envoltorioRef.current;
    if (!nodo) return;
    if (esTactil && window.matchMedia("(pointer: coarse)").matches) return;
    setEsTactil(false);
    const rect = nodo.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(px * 14);
    y.set(py * 10);
  };

  const alSalirCursor = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={envoltorioRef}
      className="lp-imagen-hero"
      onMouseMove={alMoverCursor}
      onMouseLeave={alSalirCursor}
      style={reducido ? undefined : { x, y }}
      initial={reducido ? false : { opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="lp-imagen-hero-flotar"
        animate={reducido ? undefined : { y: [0, -10, 0] }}
        transition={reducido ? undefined : { duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src="/hero-lp.png"
          alt="Panel de supervisión de FlowGuard: solicitudes recientes, decisiones PERMITIR/BLOQUEAR y evolución de decisiones"
          width={1671}
          height={941}
          priority
          quality={100}
          sizes="(min-width: 1400px) 76vw, (min-width: 980px) 70vw, 100vw"
        />
      </motion.div>
    </motion.div>
  );
}
