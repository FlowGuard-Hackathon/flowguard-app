import Link from "next/link";
import { almacen } from "../lib/almacenPrueba";
import { claseChipDecision, formatoFecha, formatoMoneda } from "../lib/formato";

// Ver nota en app/panel/page.tsx: fuerza render por solicitud.
export const dynamic = "force-dynamic";

// Vista "Solicitudes de pago" (requisitos-vistas.md § 3). Sin buscador ni
// filtro de fecha todavía: GET /api/v1/ejecuciones los admite de forma
// simplificada (ver route.ts); esta vista solo usa el de decisión, vía
// ?decision=PERMITIR|BLOQUEAR (enlazado desde las alertas del panel).
export default async function PaginaSolicitudes({
  searchParams,
}: {
  searchParams: Promise<{ decision?: string }>;
}) {
  const { decision } = await searchParams;
  const filtro = decision === "PERMITIR" || decision === "BLOQUEAR" ? decision : null;

  const todas = await almacen.listarResumenEjecuciones();
  const resumen = filtro ? todas.filter((r) => r.ejecucion.decision === filtro) : todas;

  return (
    <>
      <h1>Solicitudes de pago</h1>
      <p className="descripcion-vista">
        Consulta el estado de evaluación de cada solicitud.
        {filtro && (
          <>
            {" "}
            Filtrando por <span className={claseChipDecision(filtro)}>{filtro}</span>{" "}
            <Link href="/solicitudes">(quitar filtro)</Link>.
          </>
        )}
      </p>

      <div className="tarjeta">
        {resumen.length === 0 ? (
          <p className="estado-vacio">
            {filtro
              ? "Ninguna solicitud coincide con este filtro."
              : <>Todavía no hay solicitudes. Crea una desde el <Link href="/simulador">simulador</Link>.</>}
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID de ejecución</th>
                <th>Solicitante</th>
                <th>Categoría</th>
                <th>Importe</th>
                <th>Decisión</th>
                <th>Fecha</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {resumen.map(({ ejecucion, contextoPago }) => (
                <tr key={ejecucion.ejecucion_id}>
                  <td>{ejecucion.ejecucion_id}</td>
                  <td>{contextoPago.solicitante_id}</td>
                  <td>{contextoPago.categoria}</td>
                  <td>{formatoMoneda(contextoPago.monto_centavos)}</td>
                  <td>
                    <span className={claseChipDecision(ejecucion.decision)}>{ejecucion.decision}</span>
                  </td>
                  <td>{formatoFecha(ejecucion.creado_en)}</td>
                  <td>
                    <Link href={`/solicitudes/${ejecucion.ejecucion_id}`}>Ver detalle</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
