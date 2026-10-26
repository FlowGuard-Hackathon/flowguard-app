import Link from "next/link";
import { notFound } from "next/navigation";
import {
  IconoAlerta,
  IconoCheck,
  IconoDocumento,
  IconoEtiqueta,
  IconoInfo,
  IconoMoneda,
  IconoX,
} from "../../../componentes/Icono";
import { almacen } from "../../../lib/almacenPrueba";
import { ETIQUETA_TIPO_EVIDENCIA, claseChipInvestigacion, formatoFecha } from "../../../lib/formato";

// Vista "Centro de evidencias" (detalle), requisitos-vistas.md § 6,
// mockups/06-centro-evidencias.png. Si no existe ningún intento de
// investigación todavía, el informe del agente es null y se muestra ese
// estado explícitamente (arquitectura.md § 6.4): nunca se simula un informe
// que no ocurrió.

const ICONO_TIPO_EVIDENCIA: Record<string, (props: { tamano?: number }) => React.ReactElement> = {
  REGISTRO_APROBACION: IconoCheck,
  REGISTRO_CATEGORIA: IconoEtiqueta,
  REGISTRO_FACTURA: IconoDocumento,
  SALDO_PRESUPUESTO: IconoMoneda,
};

// Las claves de `contenido` varían por regla (observado/esperado del motor,
// ver reglas/motor.ts); en vez de volcar JSON crudo, se listan como pares
// etiqueta/valor legibles. "snake_case" -> "Texto capitalizado" es una
// transformación genérica, no una traducción por campo — no hay forma de
// mapear de antemano todas las claves posibles sin inventar texto.
function etiquetaCampo(clave: string): string {
  const texto = clave.replace(/_/g, " ");
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function formatoValorCampo(valor: unknown): string {
  if (valor === null || valor === undefined) return "No disponible";
  if (typeof valor === "boolean") return valor ? "Sí" : "No";
  return String(valor);
}

export default async function PaginaDetalleEvidencias({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const ejecucion = await almacen.obtenerEjecucion(id);
  if (!ejecucion) notFound();

  const [evidencias, informeAgente] = await Promise.all([
    almacen.obtenerEvidencias(id),
    almacen.obtenerInformeAgente(id),
  ]);

  const bloqueada = ejecucion.decision === "BLOQUEAR";
  const informe = informeAgente?.informe ?? null;

  return (
    <>
      <Link href="/evidencias" className="detalle-volver">
        &larr; Volver al centro de evidencias
      </Link>

      <div className="detalle-titulo-fila">
        <h1>Evidencias de {id}</h1>
        <span className={`insignia-estado ${bloqueada ? "insignia-bloquear" : "insignia-permitir"}`}>
          {bloqueada ? <IconoX tamano={14} /> : <IconoCheck tamano={14} />}
          {ejecucion.decision}
        </span>
        <div className="detalle-acciones">
          <Link href={`/solicitudes/${id}`} className="boton boton-secundario">
            Ver solicitud
          </Link>
        </div>
      </div>
      <p className="descripcion-vista">Evaluación completada el {formatoFecha(ejecucion.creado_en)}.</p>

      <div className="tarjeta" style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ marginTop: 0 }}>Registros de evidencia</h2>
        {!evidencias || evidencias.length === 0 ? (
          <p className="estado-vacio">Esta ejecución no generó registros de evidencia.</p>
        ) : (
          <div className="cuadricula-evidencias">
            {evidencias.map((e) => {
              const IconoTipo = ICONO_TIPO_EVIDENCIA[e.tipo_evidencia] ?? IconoDocumento;
              const campos = Object.entries(e.contenido);
              return (
                <div key={e.ref_evidencia} className="tarjeta-evidencia">
                  <div className="tarjeta-evidencia-encabezado">
                    <span className="tarjeta-evidencia-icono"><IconoTipo tamano={18} /></span>
                    <div>
                      <strong>{ETIQUETA_TIPO_EVIDENCIA[e.tipo_evidencia] ?? e.tipo_evidencia}</strong>
                      <span className="tarjeta-evidencia-ref">{e.ref_evidencia} · {e.origen}</span>
                    </div>
                  </div>
                  {campos.length > 0 && (
                    <dl className="tarjeta-evidencia-contenido">
                      {campos.map(([clave, valor]) => (
                        <div key={clave}>
                          <dt>{etiquetaCampo(clave)}</dt>
                          <dd>{formatoValorCampo(valor)}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="tarjeta">
        <div className="encabezado-tarjeta">
          <h2 style={{ margin: 0 }}>Informe del agente</h2>
          {informeAgente && <span className={claseChipInvestigacion(informeAgente.estado)}>{informeAgente.estado}</span>}
        </div>

        {!informeAgente ? (
          <p className="estado-vacio">Todavía no hay ningún intento de investigación para esta ejecución.</p>
        ) : !informe ? (
          <div className="panel-error" style={{ marginTop: "0.75rem" }}>
            <IconoAlerta tamano={20} />
            <div>
              <h3>La investigación no produjo un informe</h3>
              <p>
                Intento {informeAgente.intento_id}. La decisión persistida ({ejecucion.decision}) no se vio afectada: una
                investigación fallida nunca cambia el resultado del motor de reglas.
              </p>
            </div>
          </div>
        ) : (
          <>
            <h3 className="simulador-subtitulo" style={{ marginTop: "1.1rem" }}>{informe.investigacion.titular}</h3>
            <p className="descripcion-vista" style={{ marginBottom: "1.1rem" }}>{informe.investigacion.explicacion}</p>

            {informe.investigacion.hallazgos.length > 0 && (
              <>
                <h4 className="simulador-subtitulo" style={{ marginTop: 0 }}>Hallazgos</h4>
                <div className="lista-hallazgos">
                  {informe.investigacion.hallazgos.map((h) => (
                    <div key={h.hallazgo_id} className="tarjeta-hallazgo">
                      <div className="tarjeta-hallazgo-encabezado">
                        <span className="chip chip-neutro">{h.hallazgo_id}</span>
                        <span className="chip chip-indeterminado">{h.regla_id}</span>
                      </div>
                      <p>{h.afirmacion}</p>
                      {h.refs_evidencia.length > 0 && (
                        <div className="tarjeta-hallazgo-refs">
                          {h.refs_evidencia.map((ref) => (
                            <span key={ref} className="chip chip-neutro">{ref}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {informe.investigacion.acciones_recomendadas.length > 0 && (
              <>
                <h4 className="simulador-subtitulo">Acciones recomendadas</h4>
                <div className="lista-acciones-recomendadas">
                  {informe.investigacion.acciones_recomendadas.map((a, i) => (
                    <span key={i} className="chip chip-indeterminado">
                      {a.accion.replace(/_/g, " ")}
                      {a.requiere_accion_humana && " · requiere acción humana"}
                    </span>
                  ))}
                </div>
              </>
            )}

            {informe.limitaciones.length > 0 && (
              <div className="banner-decision banner-info" style={{ marginTop: "1.25rem", marginBottom: 0 }}>
                <IconoInfo tamano={20} />
                <div>
                  <h2>Limitaciones de la investigación</h2>
                  <ul className="lista-limitaciones">
                    {informe.limitaciones.map((l, i) => (
                      <li key={i}>{l}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
