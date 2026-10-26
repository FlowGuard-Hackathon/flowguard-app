"use client";

import { useEffect, useRef, useState } from "react";

// Único punto de verdad para prefers-reduced-motion en toda la landing: los
// fondos animados, GSAP y motion lo consultan aquí en vez de cada uno
// repetir su propio matchMedia.
export function useMovimientoReducido(): boolean {
  const [reducido, setReducido] = useState(false);

  useEffect(() => {
    const medio = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducido(medio.matches);
    const al_cambiar = (e: MediaQueryListEvent) => setReducido(e.matches);
    medio.addEventListener("change", al_cambiar);
    return () => medio.removeEventListener("change", al_cambiar);
  }, []);

  return reducido;
}

// Revela una sección la primera vez que entra en el viewport (IntersectionObserver
// nativo, sin depender de GSAP ScrollTrigger para esto). Úsalo para el nivel
// 2 (estructural) del sistema de movimiento: entrada de secciones/paneles.
export function useEnVista<T extends HTMLElement>(umbral = 0.2) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo) return;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada?.isIntersecting) {
          setVisible(true);
          observador.disconnect();
        }
      },
      { threshold: umbral },
    );
    observador.observe(nodo);
    return () => observador.disconnect();
  }, [umbral]);

  return { ref, visible };
}

// Detiene trabajo (rAF, timers) cuando la pestaña no está visible — para no
// mantener el fondo de canvas ni timelines de GSAP corriendo en segundo plano.
export function usePestanaVisible(): boolean {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const al_cambiar = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", al_cambiar);
    return () => document.removeEventListener("visibilitychange", al_cambiar);
  }, []);
  return visible;
}
