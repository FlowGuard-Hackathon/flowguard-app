import Link from "next/link";
import { notFound } from "next/navigation";
import { almacen } from "../../../lib/almacenPrueba";
import { claseChipInvestigacion } from "../../../lib/formato";

// Vista "Centro de evidencias" (detalle), requisitos-vistas.md § 6. Si no
// existe ningún intento de investigación todavía, el informe del agente es
// null y se muestra ese estado explícitamente (arquitectura.md § 6.4): nunca
// se simula un informe que no ocurrió.
export default async function PaginaDetalleEvidencias({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const ejecucion = await almacen.obtenerEjecucion(id);
  if (!ejecucion) notFound();

  const [evidencias, informeAgente] = await Promise.all([
    almacen.obtenerEvidencias(id),
    almacen.obtenerInformeAgente(id),
  ]);

  return (
    <>
      <p>
        <Link href={`/solicitudes/${id}`}>&larr; Volver al detalle de la solicitud</Link>
      </p>
      <h1>Evidencias de {id}</h1>

      <div className="tarjeta" style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ marginTop: 0 }}>Registros de evidencia</h2>
        {!evidencias || evidencias.length === 0 ? (
          <p className="estado-vacio">Esta ejecución no generó registros de evidencia.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Ref.</th>
                <th>Tipo</th>
                <th>Origen</th>
                <th>Contenido</th>
              </tr>
            </thead>
            <tbody>
              {evidencias.map((e) => (
                <tr key={e.ref_evidencia}>
                  <td>{e.ref_evidencia}</td>
                  <td>{e.tipo_evidencia}</td>
                  <td>{e.origen}</td>
                  <td>
                    <code>{JSON.stringify(e.contenido)}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="tarjeta">
        <h2 style={{ marginTop: 0 }}>
          Informe del agente{" "}
          {informeAgente && (
            <span className={claseChipInvestigacion(informeAgente.estado)}>{informeAgente.estado}</span>
          )}
        </h2>
        {!informeAgente ? (
          <p className="estado-vacio">Todavía no hay ningún intento de investigación para esta ejecución.</p>
        ) : informeAgente.estado === "FALLIDA" || !informeAgente.informe ? (
          <p className="estado-error">
            La investigación falló (intento {informeAgente.intento_id}). No hay informe que mostrar; la decisión
            persistida no se vio afectada.
          </p>
        ) : (
          <>
            <p>
              <strong>{informeAgente.informe.investigacion.titular}</strong>
            </p>
            <p>{informeAgente.informe.investigacion.explicacion}</p>
            {informeAgente.informe.investigacion.hallazgos.length > 0 && (
              <table>
                <thead>
                  <tr>
                    <th>Hallazgo</th>
                    <th>Regla</th>
                    <th>Afirmación</th>
                    <th>Evidencias citadas</th>
                  </tr>
                </thead>
                <tbody>
                  {informeAgente.informe.investigacion.hallazgos.map((h) => (
                    <tr key={h.hallazgo_id}>
                      <td>{h.hallazgo_id}</td>
                      <td>{h.regla_id}</td>
                      <td>{h.afirmacion}</td>
                      <td>{h.refs_evidencia.join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {informeAgente.informe.limitaciones.length > 0 && (
              <p className="descripcion-vista">
                Limitaciones: {informeAgente.informe.limitaciones.join(" · ")}
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
}
