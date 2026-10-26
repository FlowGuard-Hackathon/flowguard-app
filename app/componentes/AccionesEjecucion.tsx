"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IconoMas } from "./Icono";

// Estados desde los que contratos-api.md § 7 permite reintentar la
// investigación (POST /api/v1/ejecuciones/:id/investigar). COMPLETADA y
// EN_CURSO/PENDIENTE quedan fuera porque el backend los rechaza con 409
// (INVESTIGACION_YA_COMPLETADA / INVESTIGACION_EN_CURSO) — no tiene sentido
// ofrecer la acción si ya sabemos que va a fallar.
const ESTADOS_REINTENTABLES = new Set(["NO_INICIADA", "PARCIAL", "FALLIDA"]);

export default function AccionesEjecucion({
  id,
  estadoInvestigacion,
}: {
  id: string;
  estadoInvestigacion?: string;
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const contenedor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const cerrarAlHacerClicFuera = (evento: PointerEvent) => {
      if (!contenedor.current?.contains(evento.target as Node)) setAbierto(false);
    };
    const cerrarConEscape = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setAbierto(false);
    };
    document.addEventListener("pointerdown", cerrarAlHacerClicFuera);
    document.addEventListener("keydown", cerrarConEscape);
    return () => {
      document.removeEventListener("pointerdown", cerrarAlHacerClicFuera);
      document.removeEventListener("keydown", cerrarConEscape);
    };
  }, [abierto]);

  // Al cerrar el menú (clic fuera, Escape o tras una acción) se limpia el
  // error: es un mensaje por intento, no debe sobrevivir a la próxima
  // apertura del menú.
  useEffect(() => {
    if (!abierto) setError("");
  }, [abierto]);

  async function reintentarInvestigacion() {
    setEnviando(true);
    setError("");
    try {
      const respuesta = await fetch(`/api/v1/ejecuciones/${id}/investigar`, { method: "POST" });
      if (respuesta.ok) {
        setAbierto(false);
        router.refresh();
        return;
      }
      const cuerpo = await respuesta.json().catch(() => null);
      const codigo = cuerpo?.error?.codigo as string | undefined;
      const mensajesPorCodigo: Record<string, string> = {
        INVESTIGACION_EN_CURSO: "Ya hay una investigación en curso para esta ejecución.",
        INVESTIGACION_YA_COMPLETADA: "La investigación ya se completó.",
        EJECUCION_NO_ENCONTRADA: "No se encontró la ejecución.",
        DEPENDENCIA_NO_DISPONIBLE: "Investigación asíncrona no disponible en este entorno.",
      };
      setError((codigo && mensajesPorCodigo[codigo]) ?? "No se pudo reintentar la investigación.");
    } catch {
      setError("No se pudo contactar al servidor.");
    } finally {
      setEnviando(false);
    }
  }

  const puedeReintentar = !!estadoInvestigacion && ESTADOS_REINTENTABLES.has(estadoInvestigacion);

  return (
    <div className="menu-acciones" ref={contenedor}>
      <button
        type="button"
        className="accion-menu-boton"
        aria-label={`Acciones para ${id}`}
        aria-haspopup="menu"
        aria-expanded={abierto}
        onClick={() => setAbierto((valor) => !valor)}
      >
        <IconoMas tamano={16} />
      </button>
      {abierto && (
        <div className="menu-acciones-lista" role="menu" aria-label={`Acciones para ${id}`}>
          <Link role="menuitem" href={`/solicitudes/${id}`} onClick={() => setAbierto(false)}>Ver solicitud</Link>
          <Link role="menuitem" href={`/evidencias/${id}`} onClick={() => setAbierto(false)}>Ver evidencias</Link>
          {puedeReintentar && (
            <>
              <div className="menu-acciones-divisor" role="separator" />
              <button type="button" role="menuitem" disabled={enviando} onClick={reintentarInvestigacion}>
                {enviando ? "Reintentando…" : "Reintentar investigación"}
              </button>
            </>
          )}
          {error && <p className="menu-acciones-error" role="alert">{error}</p>}
        </div>
      )}
    </div>
  );
}
