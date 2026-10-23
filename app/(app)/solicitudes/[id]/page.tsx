import Link from "next/link";
import { notFound } from "next/navigation";
import Avatar from "../../../componentes/Avatar";
import AccionesEjecucion from "../../../componentes/AccionesEjecucion";
import {
  IconoAlerta,
  IconoCarpeta,
  IconoCheck,
  IconoChevronDerecha,
  IconoEtiqueta,
  IconoInfo,
  IconoMoneda,
  IconoX,
} from "../../../componentes/Icono";
import { almacen } from "../../../lib/almacenPrueba";
import {
  DESCRIPCION_REGLA,
  ETIQUETA_TIPO_EVIDENCIA,
  NOMBRE_REGLA,
  formatoFecha,
  formatoMoneda,
  motivoRegla,
  resumenDecision,
} from "../../../lib/formato";

// Vista "Detalle de solicitud" (requisitos-vistas.md § 4). El arreglo de
// reglas siempre trae las cinco, en orden PAG-001..005 (contratos-api.md § 3).
//
// El modelo real (RegistroContextoPago en servidor/herramientas/tipos.ts) no
// tiene campos de "proveedor" ni "concepto" — solo categoria/solicitante_id/
// presupuesto_id/monto. La tarjeta-resumen de abajo usa esos cuatro campos
// reales en vez de inventar un proveedor o un RFC que no existen.
export default async function PaginaDetalleSolicitud({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const ejecucion = await almacen.obtenerEjecucion(id);
  if (!ejecucion) notFound();

  const [reglas, pago, evidencias] = await Promise.all([
    almacen.obtenerResultadosReglas(id),
    almacen.obtenerContextoPago(id),
    almacen.obtenerEvidencias(id),
  ]);

  const bloqueada = ejecucion.decision === "BLOQUEAR";
  const evidenciasPorRef = new Map((evidencias ?? []).map((e) => [e.ref_evidencia, e]));

  return (
    <>
      <Link href="/solicitudes" className="detalle-volver">
        &larr; Volver a solicitudes
      </Link>

      <div className="detalle-titulo-fila">
        <h1>{ejecucion.ejecucion_id}</h1>
        <span className={`insignia-estado ${bloqueada ? "insignia-bloquear" : "insignia-permitir"}`}>
          {bloqueada ? <IconoX tamano={14} /> : <IconoCheck tamano={14} />}
          {ejecucion.decision}
        </span>
        <div className="detalle-acciones">
          <Link href={`/evidencias/${ejecucion.ejecucion_id}`} className="boton boton-secundario">
            <IconoCarpeta tamano={16} />
            Ver evidencias
          </Link>
          <AccionesEjecucion id={ejecucion.ejecucion_id} />
        </div>
      </div>
      <p className="descripcion-vista">Evaluación completada el {formatoFecha(ejecucion.creado_en)}.</p>

      {pago && (
        <div className="tarjeta resumen-solicitud">
          <div className="resumen-columna">
            <span className="resumen-etiqueta">Solicitante</span>
            <div className="resumen-valor">
              <Avatar id={pago.solicitante_id} />
              <div className="resumen-valor-texto">
                <strong>{pago.solicitante_id}</strong>
              </div>
            </div>
          </div>
          <div className="resumen-columna">
            <span className="resumen-etiqueta">Categoría</span>
            <div className="resumen-valor">
              <span className="resumen-valor-icono"><IconoEtiqueta tamano={16} /></span>
              <div className="resumen-valor-texto">
                <strong>{pago.categoria}</strong>
                <span>{pago.pago_id}</span>
              </div>
            </div>
          </div>
          <div className="resumen-columna">
            <span className="resumen-etiqueta">Presupuesto</span>
            <div className="resumen-valor">
              <span className="resumen-valor-icono"><IconoCarpeta tamano={16} /></span>
              <div className="resumen-valor-texto">
                <strong>{pago.presupuesto_id}</strong>
                {pago.presupuesto_disponible_centavos !== null && (
                  <span>{formatoMoneda(pago.presupuesto_disponible_centavos)} disponibles</span>
                )}
              </div>
            </div>
          </div>
          <div className="resumen-columna">
            <span className="resumen-etiqueta">Importe</span>
            <div className="resumen-valor">
              <span className="resumen-valor-icono"><IconoMoneda tamano={16} /></span>
              <div className="resumen-valor-texto">
                <strong className="resumen-importe">{formatoMoneda(pago.monto_centavos)}</strong>
                <span>{pago.moneda}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {bloqueada ? (
        <div className="banner-decision banner-bloqueado">
          <IconoX tamano={22} />
          <div>
            <h2>Solicitud bloqueada por el motor determinista</h2>
            <p>La solicitud no cumple con una o más reglas de negocio. No se puede autorizar el pago.</p>
          </div>
        </div>
      ) : (
        <div className="banner-decision banner-permitido">
          <IconoCheck tamano={22} />
          <div>
            <h2>Solicitud permitida por el motor determinista</h2>
            <p>Las reglas deterministas permitieron continuar con esta solicitud. Esto no confirma que el pago ya se haya ejecutado.</p>
          </div>
        </div>
      )}

      <div className="tarjeta" style={{ marginBottom: 0 }}>
        <h2 style={{ marginTop: 0 }}>Evaluación de reglas</h2>
        <div className="tabla-contenedor">
          <table className="tabla-reglas">
            <thead>
              <tr>
                <th>Estado</th>
                <th>Regla</th>
                <th>Descripción</th>
                <th>Motivo</th>
                <th>Evidencia</th>
              </tr>
            </thead>
            <tbody>
              {reglas?.map((r) => {
                const refs = r.refs_evidencia.map((ref) => evidenciasPorRef.get(ref)).filter((e) => e !== undefined);
                return (
                  <tr
                    key={r.regla_id}
                    className={r.estado === "NO_CUMPLE" ? "fila-incumple" : r.estado === "INDETERMINADO" ? "fila-indeterminada" : undefined}
                  >
                    <td>
                      <span
                        className={`celda-estado-regla ${r.estado === "CUMPLE" ? "permitir" : r.estado === "NO_CUMPLE" ? "bloquear" : "indeterminado"}`}
                        title={r.estado}
                      >
                        {r.estado === "CUMPLE" ? <IconoCheck tamano={16} /> : r.estado === "NO_CUMPLE" ? <IconoX tamano={16} /> : <IconoAlerta tamano={16} />}
                      </span>
                    </td>
                    <td>
                      <span className="celda-regla-id">{r.regla_id}</span>
                      <span className="celda-regla-nombre">{NOMBRE_REGLA[r.regla_id] ?? r.regla_id}</span>
                    </td>
                    <td>{DESCRIPCION_REGLA[r.regla_id] ?? "—"}</td>
                    <td>{motivoRegla(r)}</td>
                    <td>
                      {refs.length === 0 ? (
                        <span className="estado-vacio" style={{ padding: 0 }}>Sin evidencia asociada</span>
                      ) : (
                        <ul className="lista-evidencia-fila">
                          {refs.map((e) => (
                            <li key={e.ref_evidencia}>
                              <Link href={`/evidencias/${ejecucion.ejecucion_id}`} className="evidencia-item">
                                {ETIQUETA_TIPO_EVIDENCIA[e.tipo_evidencia] ?? e.tipo_evidencia}
                                <IconoChevronDerecha tamano={13} />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {reglas && (
        <div className="banner-decision banner-info">
          <IconoInfo tamano={22} />
          <div>
            <h2>Resumen de decisión</h2>
            <p>{resumenDecision(ejecucion.decision, reglas)}</p>
          </div>
        </div>
      )}
    </>
  );
}
