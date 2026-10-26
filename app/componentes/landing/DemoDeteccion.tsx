"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { IconoAlerta, IconoDocumento, IconoEscudo, IconoX } from "../Icono";
import { useMovimientoReducido } from "./hooks";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Caso de ejemplo tomado de flowguard-docs/arquitectura.md § "El MVP se
// considera funcional cuando...": un pago de $15,000 MXN sin aprobación
// válida queda bloqueado por PAG-001 (flowguard-docs/reglas.md § 2). No es
// un dato de producción: es el escenario de referencia del propio proyecto.
const LINEA = [
  { Icono: IconoDocumento, titulo: "Solicitud recibida", detalle: "$15,000.00 MXN · Grupo Industrial ABC", estado: "neutro" as const },
  { Icono: IconoEscudo, titulo: "Validación de reglas", detalle: "PAG-001 · límite de autorización", estado: "neutro" as const },
  { Icono: IconoAlerta, titulo: "Riesgo detectado", detalle: "Monto mayor a $10,000 sin aprobación válida", estado: "no-cumple" as const },
  { Icono: IconoX, titulo: "Decisión", detalle: "Pago bloqueado, con evidencia y justificación", estado: "no-cumple" as const },
];

export default function DemoDeteccion() {
  const seccionRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const reducido = useMovimientoReducido();
  const [pasoActivo, setPasoActivo] = useState(-1);

  useEffect(() => {
    if (reducido) {
      // Sin movimiento: la secuencia completa queda visible de inmediato,
      // el contenido sigue siendo legible sin depender de la animación.
      setPasoActivo(LINEA.length - 1);
      return;
    }

    const tl = gsap.timeline({ paused: true });
    LINEA.forEach((_, i) => {
      tl.call(() => setPasoActivo(i)).to({}, { duration: 0.85 });
    });
    timelineRef.current = tl;

    const disparador = ScrollTrigger.create({
      trigger: seccionRef.current,
      start: "top 70%",
      once: true,
      onEnter: () => tl.play(),
    });

    return () => {
      disparador.kill();
      tl.kill();
    };
  }, [reducido]);

  const reproducirDeNuevo = () => {
    setPasoActivo(-1);
    timelineRef.current?.restart();
  };

  return (
    <section id="deteccion" className="lp-seccion" ref={seccionRef}>
      <div className="lp-contenedor">
        <div className="lp-seccion-cabecera">
          <span className="lp-sobretitulo">Detección en vivo</span>
          <h2 className="lp-seccion-titulo">Así bloquea FlowGuard una infracción</h2>
          <p className="lp-seccion-texto">
            Una secuencia real del motor de reglas: la solicitud entra, el motor la evalúa, y la decisión
            se explica con evidencia, no con una suposición.
          </p>
        </div>

        <div className="lp-demo">
          <div className="lp-demo-grid">
            <div className="lp-demo-ticket">
              <div className="lp-demo-ticket-cabecera">
                <span>Ejemplo de detección de riesgo</span>
                <span className="lp-estado-pastilla bloquear">BLOQUEADA</span>
              </div>
              <dl>
                <dt>Solicitud de pago</dt>
                <dd>EJE-2026-0158</dd>
                <dt>Proveedor</dt>
                <dd>Grupo Industrial ABC</dd>
                <dt>Monto</dt>
                <dd>$15,000.00 MXN</dd>
                <dt>Regla</dt>
                <dd>PAG-001</dd>
              </dl>
              <p className="lp-demo-ticket-motivo">
                <IconoAlerta tamano={14} /> El pago excede el límite permitido sin autorización de supervisor.
              </p>
            </div>

            <div className="lp-demo-texto">
              <h3>Detecta problemas antes de que se conviertan en pérdidas.</h3>
              <p>
                FlowGuard analiza cada solicitud, valida reglas, investiga con IA y te da una decisión
                clara con evidencia. La IA investiga y explica; el motor determinista es el único que
                decide.
              </p>
              <button type="button" className="lp-boton lp-boton-secundario lp-boton-chico" onClick={reproducirDeNuevo}>
                ↻ Reproducir secuencia de nuevo
              </button>
            </div>

            <ol className="lp-demo-linea">
              {LINEA.map((paso, i) => (
                <li key={paso.titulo} className="lp-demo-linea-item" data-activo={pasoActivo >= i} data-estado={paso.estado}>
                  <span className="lp-demo-linea-icono">
                    <paso.Icono tamano={14} />
                  </span>
                  <span>
                    <strong>{paso.titulo}</strong>
                    <span>{paso.detalle}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <p className="lp-demo-nota-separacion">
            <strong style={{ color: "var(--texto)" }}>Decisión vs. investigación:</strong>&nbsp;el motor
            determinista ya bloqueó el pago. La IA investiga por separado y produce un informe
            explicativo, pero nunca puede revertir esta decisión.
          </p>
        </div>
      </div>
    </section>
  );
}
