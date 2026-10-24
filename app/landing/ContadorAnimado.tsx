"use client";

import { useEffect, useRef, useState } from "react";

// Cuenta hacia arriba hasta `valor` cuando entra en pantalla — `valor`
// siempre es un número real (ejecuciones, porcentajes ya calculados de
// datos reales), nunca una cifra inventada: este componente solo anima la
// transición visual, no decide qué mostrar. Respeta prefers-reduced-motion.
export default function ContadorAnimado({ valor, sufijo = "", duracionMs = 900 }: { valor: number; sufijo?: string; duracionMs?: number }) {
  const [mostrado, setMostrado] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMostrado(valor);
      return;
    }
    const observer = new IntersectionObserver(
      (entradas) => {
        if (!entradas[0]?.isIntersecting) return;
        observer.disconnect();
        const inicio = performance.now();
        function paso(ahora: number) {
          const progreso = Math.min(1, (ahora - inicio) / duracionMs);
          setMostrado(Math.round(valor * progreso));
          if (progreso < 1) requestAnimationFrame(paso);
        }
        requestAnimationFrame(paso);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [valor, duracionMs]);

  return (
    <span ref={ref}>
      {mostrado.toLocaleString("es-MX")}
      {sufijo}
    </span>
  );
}
