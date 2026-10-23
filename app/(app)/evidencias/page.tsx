import Link from "next/link";
import { almacen } from "../../lib/almacenPrueba";
import { claseChipDecision, formatoFecha } from "../../lib/formato";

// Ver nota en app/panel/page.tsx: fuerza render por solicitud.
export const dynamic = "force-dynamic";

// Vista "Centro de evidencias" (requisitos-vistas.md § 6). Simplificado: los
// mockups muestran una tabla global y filtrable de evidencias individuales,
// pero contratos-api.md solo define evidencias por ejecución (GET
// /ejecuciones/:id/evidencias) — no existe un endpoint que liste evidencias
// de todas las ejecuciones juntas. Esta vista lista las ejecuciones y entra
// al detalle de evidencias de cada una.
export default async function PaginaEvidencias() {
  const resumen = await almacen.listarResumenEjecuciones();

  return (
    <>
      <h1>Centro de evidencias</h1>
      <p className="descripcion-vista">Elige una ejecución para consultar las evidencias que respaldan su decisión.</p>

      <div className="tarjeta">
        {resumen.length === 0 ? (
          <p className="estado-vacio">
            Todavía no hay ejecuciones. Crea una desde el <Link href="/simulador">simulador</Link>.
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Ejecución</th>
                <th>Decisión</th>
                <th>Fecha</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {resumen.map(({ ejecucion }) => (
                <tr key={ejecucion.ejecucion_id}>
                  <td>{ejecucion.ejecucion_id}</td>
                  <td>
                    <span className={claseChipDecision(ejecucion.decision)}>{ejecucion.decision}</span>
                  </td>
                  <td>{formatoFecha(ejecucion.creado_en)}</td>
                  <td>
                    <Link href={`/evidencias/${ejecucion.ejecucion_id}`}>Ver evidencias</Link>
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
