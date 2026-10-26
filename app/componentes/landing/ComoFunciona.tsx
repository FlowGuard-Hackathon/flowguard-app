"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Link from "next/link";
import { IconoBuscar, IconoEscudo } from "../Icono";
import { IconoCapas, IconoRayo } from "./IconoLanding";
import { useMovimientoReducido } from "./hooks";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const PASOS = [
  { Icono: IconoBuscar, titulo: "Analiza", texto: "Recibe la solicitud de pago y los datos de contexto confiable del backend." },
  { Icono: IconoEscudo, titulo: "Valida", texto: "Evalúa las 5 reglas deterministas en un orden estable, cada una con su propia evidencia." },
  { Icono: IconoRayo, titulo: "Decide", texto: "Calcula PERMITIR o BLOQUEAR. Ninguna investigación posterior puede cambiar esta decisión." },
  { Icono: IconoCapas, titulo: "Registra", texto: "Persiste la decisión y la evidencia; la IA puede investigar y explicar, nunca decidir." },
];

// La sección no depende del scroll para transmitir la información: los 4
// pasos y su texto están siempre visibles. El scroll solo añade una mejora
// progresiva (resaltar el paso activo), por eso el estado inicial ya marca
// el primer paso como activo en vez de arrancar en cero.
export default function ComoFunciona() {
  const seccionRef = useRef<HTMLDivElement | null>(null);
  const reducido = useMovimientoReducido();
  const [pasoActivo, setPasoActivo] = useState(0);

  useEffect(() => {
    if (reducido || !seccionRef.current) return;

    const disparador = ScrollTrigger.create({
      trigger: seccionRef.current,
      start: "top 60%",
      end: "bottom 60%",
      scrub: 0.4,
      onUpdate: (self) => {
        setPasoActivo(Math.min(PASOS.length - 1, Math.floor(self.progress * PASOS.length)));
      },
    });

    return () => disparador.kill();
  }, [reducido]);

  return (
    <section id="como-funciona" className="lp-seccion" ref={seccionRef}>
      <div className="lp-contenedor">
        <div className="lp-seccion-cabecera lp-seccion-cabecera-fila">
          <div>
            <span className="lp-sobretitulo">Cómo funciona</span>
            <h2 className="lp-seccion-titulo">De la solicitud a la decisión, en cuatro pasos</h2>
            <p className="lp-seccion-texto">El mismo recorrido para toda solicitud, sin excepciones de criterio humano a mitad de camino.</p>
          </div>
          <Link href="/historial" className="lp-enlace-seccion">
            Ver historial de ejecuciones <span className="lp-flecha">→</span>
          </Link>
        </div>

        <div className="lp-pasos-wrap">
          {PASOS.map((paso, i) => (
            <div key={paso.titulo} className="lp-paso-tarjeta" data-activo={i <= pasoActivo} data-numero={i + 1}>
              <div className="lp-paso-cabecera">
                <span className="lp-paso-indice">{i + 1}</span>
                <span className="lp-paso-icono">
                  <paso.Icono tamano={16} />
                </span>
              </div>
              <h3>{paso.titulo}</h3>
              <p>{paso.texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
