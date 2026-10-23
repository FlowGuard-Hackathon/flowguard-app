import Link from "next/link";
import { almacen } from "../lib/almacenPrueba";
import { claseChipDecision, claseChipInvestigacion, formatoFecha } from "../lib/formato";

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

  const filas = resumen.map((r, i) => {
    const reglaDeterminante =
      r.ejecucion.decision === "BLOQUEAR" ? reglasPorEjecucion[i]?.find((x) => x.estado === "NO_CUMPLE") : undefined;
    return { ...r, reglaDeterminante };
  });

  return (
    <>
      <h1>Historial de ejecuciones</h1>
      <p className="descripcion-vista">
        Consulta las evaluaciones anteriores y su trazabilidad: decisión, regla determinante y estado de la
        investigación del agente.
      </p>

      <div className="tarjeta">
        {filas.length === 0 ? (
          <p className="estado-vacio">
            Todavía no hay ejecuciones. Crea una desde el <Link href="/simulador">simulador</Link>.
          </p>
        ) : (
          <div className="tabla-contenedor">
            <table>
              <thead>
                <tr>
                  <th>Ejecución</th>
                  <th>Solicitante</th>
                  <th>Decisión</th>
                  <th>Regla determinante</th>
                  <th>Investigación</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filas.map(({ ejecucion, contextoPago, reglaDeterminante }) => (
                  <tr key={ejecucion.ejecucion_id}>
                    <td>{ejecucion.ejecucion_id}</td>
                    <td>{contextoPago.solicitante_id}</td>
                    <td>
                      <span className={claseChipDecision(ejecucion.decision)}>{ejecucion.decision}</span>
                    </td>
                    <td>{reglaDeterminante ? reglaDeterminante.regla_id : "—"}</td>
                    <td>
                      <span className={claseChipInvestigacion(ejecucion.estado_investigacion)}>
                        {ejecucion.estado_investigacion}
                      </span>
                    </td>
                    <td>{formatoFecha(ejecucion.creado_en)}</td>
                    <td>
                      <Link href={`/solicitudes/${ejecucion.ejecucion_id}`}>Ver detalle</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
