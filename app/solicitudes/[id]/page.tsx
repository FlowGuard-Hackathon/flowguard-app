import Link from "next/link";
import { notFound } from "next/navigation";
import { almacen } from "../../lib/almacenPrueba";
import { claseChipDecision, claseChipEstadoRegla, formatoFecha, formatoMoneda } from "../../lib/formato";

// Vista "Detalle de solicitud" (requisitos-vistas.md § 4). El arreglo de
// reglas siempre trae las cinco, en orden PAG-001..005 (contratos-api.md § 3).
export default async function PaginaDetalleSolicitud({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const ejecucion = await almacen.obtenerEjecucion(id);
  if (!ejecucion) notFound();

  const [reglas, pago] = await Promise.all([almacen.obtenerResultadosReglas(id), almacen.obtenerContextoPago(id)]);

  return (
    <>
      <p>
        <Link href="/solicitudes">&larr; Volver a solicitudes</Link>
      </p>
      <h1>
        {ejecucion.ejecucion_id} <span className={claseChipDecision(ejecucion.decision)}>{ejecucion.decision}</span>
      </h1>
      <p className="descripcion-vista">Evaluación completada el {formatoFecha(ejecucion.creado_en)}.</p>

      {pago && (
        <div className="cuadricula" style={{ marginBottom: "1.5rem" }}>
          <div className="tarjeta metrica">
            <span className="numero">{formatoMoneda(pago.monto_centavos)}</span>
            <span className="etiqueta">Importe</span>
          </div>
          <div className="tarjeta metrica">
            <span className="numero">{pago.categoria}</span>
            <span className="etiqueta">Categoría</span>
          </div>
          <div className="tarjeta metrica">
            <span className="numero">{pago.solicitante_id}</span>
            <span className="etiqueta">Solicitante</span>
          </div>
          <div className="tarjeta metrica">
            <span className="numero">{pago.presupuesto_id}</span>
            <span className="etiqueta">Presupuesto</span>
          </div>
        </div>
      )}

      <div className="tarjeta" style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ marginTop: 0 }}>Evaluación de reglas</h2>
        <table>
          <thead>
            <tr>
              <th>Estado</th>
              <th>Regla</th>
              <th>Observado</th>
              <th>Esperado</th>
            </tr>
          </thead>
          <tbody>
            {reglas?.map((r) => (
              <tr key={r.regla_id}>
                <td>
                  <span className={claseChipEstadoRegla(r.estado)}>{r.estado}</span>
                </td>
                <td>{r.regla_id}</td>
                <td>
                  <code>{JSON.stringify(r.observado)}</code>
                </td>
                <td>
                  <code>{JSON.stringify(r.esperado)}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Link href={`/evidencias/${ejecucion.ejecucion_id}`} className="boton boton-primario">
        Ver evidencias
      </Link>
    </>
  );
}
