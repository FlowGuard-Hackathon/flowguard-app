import TablaHistorial, { type FilaHistorial } from "../../componentes/TablaHistorial";
import { almacen } from "../../lib/almacenPrueba";

// Ver nota en app/panel/page.tsx: fuerza render por solicitud.
export const dynamic = "force-dynamic";

// Vista "Historial de ejecuciones" (mockups/06-historial-ejecuciones.png).
// Usa los mismos datos que "Solicitudes de pago" (/solicitudes), pero con
// otro recorte: ahí se ve el pago (importe, categoría, solicitante); aquí se
// ve el proceso de evaluación e investigación (decisión, regla que
// determinó el bloqueo, estado de la investigación del agente). No se
// duplica contenido idéntico entre las dos vistas — eran casi lo mismo en la
// lista original de 9 vistas; esta es la resolución documentada de esa
// ambigüedad (requisitos-vistas.md § conflicto 5).
//
// Server Component: calcula la regla determinante de cada fila aquí (una
// consulta por ejecución a obtenerResultadosReglas) y se la pasa ya resuelta
// a <TablaHistorial>, que es la parte interactiva (búsqueda, filtros,
// paginación) — así el cliente no repite esa consulta.
export default async function PaginaHistorial() {
  const resumen = await almacen.listarResumenEjecuciones();
  const reglasPorEjecucion = await Promise.all(
    resumen.map((r) => almacen.obtenerResultadosReglas(r.ejecucion.ejecucion_id)),
  );

  const filas: FilaHistorial[] = resumen.map((r, i) => {
    const reglaDeterminante =
      r.ejecucion.decision === "BLOQUEAR" ? reglasPorEjecucion[i]?.find((x) => x.estado === "NO_CUMPLE") : undefined;
    return {
      ejecucion_id: r.ejecucion.ejecucion_id,
      decision: r.ejecucion.decision,
      estado_investigacion: r.ejecucion.estado_investigacion,
      creado_en: r.ejecucion.creado_en,
      solicitante_id: r.contextoPago.solicitante_id,
      reglaDeterminanteId: reglaDeterminante?.regla_id ?? null,
    };
  });

  return (
    <>
      <div className="encabezado-vista">
        <div>
          <h1>Historial de ejecuciones</h1>
          <p className="descripcion-vista">Revisa las evaluaciones anteriores y su trazabilidad.</p>
        </div>
      </div>

      <TablaHistorial filas={filas} />
    </>
  );
}
