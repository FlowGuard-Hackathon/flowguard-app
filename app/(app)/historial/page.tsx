import Link from "next/link";
import { almacen } from "../../lib/almacenPrueba";
import HistorialContenido, { type FilaHistorial } from "./HistorialContenido";

// Ver nota en app/panel/page.tsx: fuerza render por solicitud.
export const dynamic = "force-dynamic";

// Vista "Historial de ejecuciones". Usa los mismos datos que "Solicitudes de
// pago" (/solicitudes), pero con otro recorte: ahí se ve el pago (importe,
// categoría, solicitante); aquí se ve el proceso de evaluación e
// investigación (decisión, regla que determinó el bloqueo, estado de la
// investigación del agente). No se duplica contenido idéntico entre las dos
// vistas — eran casi lo mismo en la lista original de 9 vistas; esta es la
// resolución documentada de esa ambigüedad (requisitos-vistas.md § conflicto 5).
export default async function PaginaHistorial() {
  const resumen = await almacen.listarResumenEjecuciones();
  const reglasPorEjecucion = await Promise.all(
    resumen.map((r) => almacen.obtenerResultadosReglas(r.ejecucion.ejecucion_id)),
  );

  const filas: FilaHistorial[] = resumen.map((r, i) => {
    const noCumplidas = (reglasPorEjecucion[i] ?? []).filter((x) => x.estado === "NO_CUMPLE").map((x) => x.regla_id);
    return {
      ejecucion_id: r.ejecucion.ejecucion_id,
      decision: r.ejecucion.decision,
      estado_investigacion: r.ejecucion.estado_investigacion,
      creado_en: r.ejecucion.creado_en,
      solicitante_id: r.contextoPago.solicitante_id,
      // Regla determinante: solo tiene sentido si la ejecución fue bloqueada
      // por incumplimiento de regla (decisión de negocio) — una investigación
      // FALLIDA (error técnico del agente) no cambia esto, son conceptos
      // separados (ver estado_investigacion, columna propia en la tabla).
      reglaDeterminante: r.ejecucion.decision === "BLOQUEAR" ? noCumplidas[0] ?? null : null,
      reglasNoCumplidas: noCumplidas,
    };
  });

  return (
    <>
      <h1>Historial de ejecuciones</h1>
      <p className="descripcion-vista">
        Consulta las evaluaciones anteriores y su trazabilidad: decisión, regla determinante y estado de la
        investigación del agente.
      </p>

      {filas.length === 0 ? (
        <div className="tarjeta">
          <p className="estado-vacio">
            Todavía no hay ejecuciones. Crea una desde el <Link href="/simulador">simulador</Link>.
          </p>
        </div>
      ) : (
        <HistorialContenido filas={filas} />
      )}
    </>
  );
}
