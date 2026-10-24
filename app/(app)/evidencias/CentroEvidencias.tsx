"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  IconoBuscar,
  IconoCandado,
  IconoCarpeta,
  IconoChevronDerecha,
  IconoChevronIzquierda,
  IconoDocumento,
  IconoEtiqueta,
  IconoMoneda,
  IconoOjo,
} from "../../componentes/Icono";
import {
  DESCRIPCION_REGLA,
  ETIQUETA_ESTADO_EVIDENCIA,
  ETIQUETA_TIPO_EVIDENCIA,
  NOMBRE_REGLA,
  claseChipEstadoRegla,
  formatoFecha,
  formatoFechaCorta,
  formatoHora,
  formatoMoneda,
} from "../../lib/formato";

type EstadoRegla = "CUMPLE" | "NO_CUMPLE" | "INDETERMINADO";

// Evidencia real (RegistroEvidencia de flowguard-src) + los datos de su
// ejecución que hacen falta para filtrar/mostrar: a qué solicitud pertenece,
// qué regla la citó y con qué estado (una evidencia nace ligada a una sola
// regla, ver crearEjecucion.ts). Nada de esto se inventa: se arma en
// page.tsx a partir de almacen.obtenerEvidencias()/obtenerResultadosReglas().
export type EvidenciaEnriquecida = {
  ref_evidencia: string;
  tipo_evidencia: string;
  origen: string;
  contenido: Record<string, unknown>;
  ejecucion_id: string;
  pago_id: string;
  regla_id: string | null;
  estado_regla: EstadoRegla | null;
  creado_en: string;
};

const TAMANO_PAGINA = 8;

// first/last visibles + vecinos de la página actual, con "…" entre huecos
// (mismo criterio que app/(app)/solicitudes/page.tsx).
function paginasVisibles(total: number, actual: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const paginas = new Set([1, total, actual, actual - 1, actual + 1]);
  const ordenadas = [...paginas].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const resultado: (number | "...")[] = [];
  let anterior = 0;
  for (const p of ordenadas) {
    if (anterior && p - anterior > 1) resultado.push("...");
    resultado.push(p);
    anterior = p;
  }
  return resultado;
}

function IconoTipoEvidencia({ tipo, tamano = 18 }: { tipo: string; tamano?: number }) {
  switch (tipo) {
    case "REGISTRO_APROBACION":
      return <IconoCandado tamano={tamano} />;
    case "REGISTRO_CATEGORIA":
      return <IconoEtiqueta tamano={tamano} />;
    case "REGISTRO_FACTURA":
      return <IconoDocumento tamano={tamano} />;
    case "SALDO_PRESUPUESTO":
      return <IconoMoneda tamano={tamano} />;
    default:
      return <IconoCarpeta tamano={tamano} />;
  }
}

// Traduce las claves reales de `contenido` (las que construirEvidenciaParaRegla
// pone en flowguard-src/crearEjecucion.ts) a una etiqueta legible. No cubre
// claves que no existen hoy; una clave nueva simplemente se muestra tal cual.
const ETIQUETA_CAMPO_CONTENIDO: Record<string, string> = {
  monto_centavos: "Monto",
  estado_aprobacion: "Estado de aprobación",
  categoria: "Categoría",
  factura_verificada: "Factura verificada",
  presupuesto_disponible_centavos: "Presupuesto disponible",
};

function valorCampoContenido(clave: string, valor: unknown): string {
  if (valor === null || valor === undefined) return "—";
  if (clave.endsWith("_centavos") && typeof valor === "number") return formatoMoneda(valor);
  if (typeof valor === "boolean") return valor ? "Sí" : "No";
  return String(valor);
}

export default function CentroEvidencias({ evidencias }: { evidencias: EvidenciaEnriquecida[] }) {
  const [filtroSolicitud, setFiltroSolicitud] = useState("");
  const [filtroRegla, setFiltroRegla] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<EstadoRegla | "">("");
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [seleccionado, setSeleccionado] = useState<string | null>(evidencias[0]?.ref_evidencia ?? null);

  const solicitudes = useMemo(() => [...new Set(evidencias.map((e) => e.ejecucion_id))].sort(), [evidencias]);
  const reglas = useMemo(
    () => [...new Set(evidencias.map((e) => e.regla_id).filter((r): r is string => r !== null))].sort(),
    [evidencias],
  );
  const tipos = useMemo(() => [...new Set(evidencias.map((e) => e.tipo_evidencia))].sort(), [evidencias]);

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return evidencias.filter((e) => {
      if (filtroSolicitud && e.ejecucion_id !== filtroSolicitud) return false;
      if (filtroRegla && e.regla_id !== filtroRegla) return false;
      if (filtroTipo && e.tipo_evidencia !== filtroTipo) return false;
      if (filtroEstado && e.estado_regla !== filtroEstado) return false;
      if (q) {
        const campos = [
          e.ref_evidencia,
          e.ejecucion_id,
          e.pago_id,
          e.regla_id ?? "",
          e.tipo_evidencia,
          e.origen,
          ETIQUETA_TIPO_EVIDENCIA[e.tipo_evidencia] ?? "",
        ];
        if (!campos.some((c) => c.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [evidencias, filtroSolicitud, filtroRegla, filtroTipo, filtroEstado, busqueda]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / TAMANO_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const paginadas = filtradas.slice((paginaSegura - 1) * TAMANO_PAGINA, paginaSegura * TAMANO_PAGINA);

  // Si la selección ya no está entre las filas visibles (cambió el filtro o
  // la página), cae a la primera fila visible en vez de apuntar a algo que
  // el usuario ya no ve.
  const evidenciaSeleccionada = paginadas.find((e) => e.ref_evidencia === seleccionado) ?? paginadas[0] ?? null;

  const hayFiltros = filtroSolicitud !== "" || filtroRegla !== "" || filtroTipo !== "" || filtroEstado !== "" || busqueda !== "";

  function actualizar<T>(setter: (v: T) => void) {
    return (valor: T) => {
      setter(valor);
      setPagina(1);
    };
  }

  function limpiarFiltros() {
    setFiltroSolicitud("");
    setFiltroRegla("");
    setFiltroTipo("");
    setFiltroEstado("");
    setBusqueda("");
    setPagina(1);
  }

  return (
    <>
      <div className="solicitudes-filtros">
        <select
          className="selector"
          aria-label="Filtrar por solicitud"
          value={filtroSolicitud}
          onChange={(e) => actualizar(setFiltroSolicitud)(e.target.value)}
        >
          <option value="">Todas las solicitudes</option>
          {solicitudes.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          className="selector"
          aria-label="Filtrar por regla"
          value={filtroRegla}
          onChange={(e) => actualizar(setFiltroRegla)(e.target.value)}
        >
          <option value="">Todas las reglas</option>
          {reglas.map((r) => (
            <option key={r} value={r}>
              {r} — {NOMBRE_REGLA[r] ?? r}
            </option>
          ))}
        </select>

        <select
          className="selector"
          aria-label="Filtrar por tipo"
          value={filtroTipo}
          onChange={(e) => actualizar(setFiltroTipo)(e.target.value)}
        >
          <option value="">Todos los tipos</option>
          {tipos.map((t) => (
            <option key={t} value={t}>{ETIQUETA_TIPO_EVIDENCIA[t] ?? t}</option>
          ))}
        </select>

        <select
          className="selector"
          aria-label="Filtrar por estado"
          value={filtroEstado}
          onChange={(e) => actualizar(setFiltroEstado)(e.target.value as EstadoRegla | "")}
        >
          <option value="">Todos los estados</option>
          <option value="CUMPLE">{ETIQUETA_ESTADO_EVIDENCIA.CUMPLE}</option>
          <option value="NO_CUMPLE">{ETIQUETA_ESTADO_EVIDENCIA.NO_CUMPLE}</option>
          <option value="INDETERMINADO">{ETIQUETA_ESTADO_EVIDENCIA.INDETERMINADO}</option>
        </select>

        <label className="campo-busqueda">
          <IconoBuscar tamano={16} />
          <input
            type="search"
            placeholder="Buscar evidencias..."
            aria-label="Buscar evidencias"
            value={busqueda}
            onChange={(e) => actualizar(setBusqueda)(e.target.value)}
          />
        </label>
      </div>

      <div className="evidencias-grid">
        <div className="tarjeta evidencias-tabla-tarjeta">
          {filtradas.length === 0 ? (
            <p className="estado-vacio">
              Ninguna evidencia coincide con estos filtros.{" "}
              {hayFiltros && (
                <button type="button" className="boton boton-secundario" onClick={limpiarFiltros} style={{ marginTop: "0.75rem" }}>
                  Mostrar todas
                </button>
              )}
            </p>
          ) : (
            <>
              <div className="tabla-contenedor">
                <table className="evidencias-tabla">
                  <thead>
                    <tr>
                      <th>ID de evidencia</th>
                      <th>Solicitud</th>
                      <th>Regla</th>
                      <th>Tipo</th>
                      <th>Fuente</th>
                      <th>Estado</th>
                      <th>Fecha</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginadas.map((e) => {
                      const sel = e.ref_evidencia === evidenciaSeleccionada?.ref_evidencia;
                      return (
                        <tr
                          key={e.ref_evidencia}
                          className={sel ? "fila-seleccionada" : undefined}
                          onClick={() => setSeleccionado(e.ref_evidencia)}
                          style={{ cursor: "pointer" }}
                        >
                          <td className="celda-id">{e.ref_evidencia}</td>
                          <td>
                            <Link href={`/solicitudes/${e.ejecucion_id}`} onClick={(ev) => ev.stopPropagation()}>
                              {e.ejecucion_id}
                            </Link>
                          </td>
                          <td>{e.regla_id ?? "—"}</td>
                          <td>
                            <span className="celda-con-avatar">
                              <IconoTipoEvidencia tipo={e.tipo_evidencia} tamano={15} />
                              {ETIQUETA_TIPO_EVIDENCIA[e.tipo_evidencia] ?? e.tipo_evidencia}
                            </span>
                          </td>
                          <td>{e.origen}</td>
                          <td>
                            {e.estado_regla ? (
                              <span className={claseChipEstadoRegla(e.estado_regla)}>{ETIQUETA_ESTADO_EVIDENCIA[e.estado_regla]}</span>
                            ) : (
                              <span className="chip chip-neutro">—</span>
                            )}
                          </td>
                          <td>
                            <div className="celda-doble">
                              <strong>{formatoFechaCorta(e.creado_en)}</strong>
                              <span>{formatoHora(e.creado_en)}</span>
                            </div>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="accion-menu-boton"
                              aria-label={`Ver detalle de ${e.ref_evidencia}`}
                              onClick={(ev) => {
                                ev.stopPropagation();
                                setSeleccionado(e.ref_evidencia);
                              }}
                            >
                              <IconoChevronDerecha tamano={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="paginacion">
                <span>
                  Mostrando {(paginaSegura - 1) * TAMANO_PAGINA + 1}–{Math.min(paginaSegura * TAMANO_PAGINA, filtradas.length)} de{" "}
                  {filtradas.length}
                  {hayFiltros && ` (de ${evidencias.length} en total — `}
                  {hayFiltros && (
                    <button
                      type="button"
                      onClick={limpiarFiltros}
                      style={{ color: "var(--acento)", background: "none", border: "none", cursor: "pointer", padding: 0, font: "inherit" }}
                    >
                      quitar filtros
                    </button>
                  )}
                  {hayFiltros && ")"}
                </span>
                <div className="paginacion-paginas">
                  <button
                    type="button"
                    className="paginacion-boton"
                    disabled={paginaSegura === 1}
                    onClick={() => setPagina(paginaSegura - 1)}
                    aria-label="Página anterior"
                  >
                    <IconoChevronIzquierda tamano={14} />
                  </button>
                  {paginasVisibles(totalPaginas, paginaSegura).map((p, i) =>
                    p === "..." ? (
                      <span key={`e${i}`} className="paginacion-elipsis">…</span>
                    ) : (
                      <button
                        key={p}
                        type="button"
                        className={`paginacion-boton${p === paginaSegura ? " activo" : ""}`}
                        aria-current={p === paginaSegura ? "page" : undefined}
                        onClick={() => setPagina(p)}
                      >
                        {p}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    className="paginacion-boton"
                    disabled={paginaSegura === totalPaginas}
                    onClick={() => setPagina(paginaSegura + 1)}
                    aria-label="Página siguiente"
                  >
                    <IconoChevronDerecha tamano={14} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="tarjeta panel-detalle-evidencia">
          {!evidenciaSeleccionada ? (
            <div className="panel-resultado-vacio">
              <IconoCarpeta tamano={32} />
              <h3>Sin selección</h3>
              <p>Elige una evidencia de la tabla para ver su detalle.</p>
            </div>
          ) : (
            <DetalleEvidencia evidencia={evidenciaSeleccionada} />
          )}
        </div>
      </div>
    </>
  );
}

function DetalleEvidencia({ evidencia }: { evidencia: EvidenciaEnriquecida }) {
  const entradas = Object.entries(evidencia.contenido);

  return (
    <>
      <div className="vista-previa-evidencia">
        <IconoTipoEvidencia tipo={evidencia.tipo_evidencia} tamano={30} />
      </div>

      <div className="evidencia-detalle-cabecera">
        <h2>{ETIQUETA_TIPO_EVIDENCIA[evidencia.tipo_evidencia] ?? evidencia.tipo_evidencia}</h2>
        {evidencia.estado_regla && (
          <span className={claseChipEstadoRegla(evidencia.estado_regla)}>{ETIQUETA_ESTADO_EVIDENCIA[evidencia.estado_regla]}</span>
        )}
      </div>
      <span className="evidencia-detalle-ref">{evidencia.ref_evidencia}</span>

      <dl className="lista-metadatos">
        <div>
          <dt>Tipo</dt>
          <dd>{ETIQUETA_TIPO_EVIDENCIA[evidencia.tipo_evidencia] ?? evidencia.tipo_evidencia}</dd>
        </div>
        <div>
          <dt>Fuente</dt>
          <dd>{evidencia.origen}</dd>
        </div>
        <div>
          <dt>Fecha de obtención</dt>
          <dd>{formatoFecha(evidencia.creado_en)}</dd>
        </div>
        <div>
          <dt>Solicitud relacionada</dt>
          <dd>
            <Link href={`/solicitudes/${evidencia.ejecucion_id}`}>{evidencia.ejecucion_id}</Link>
          </dd>
        </div>
        <div>
          <dt>Regla relacionada</dt>
          <dd>{evidencia.regla_id ? `${evidencia.regla_id} — ${NOMBRE_REGLA[evidencia.regla_id] ?? ""}` : "—"}</dd>
        </div>
        {evidencia.regla_id && DESCRIPCION_REGLA[evidencia.regla_id] && (
          <div>
            <dt>Descripción</dt>
            <dd>{DESCRIPCION_REGLA[evidencia.regla_id]}</dd>
          </div>
        )}
        <div>
          <dt>Estado de verificación</dt>
          <dd>{evidencia.estado_regla ? ETIQUETA_ESTADO_EVIDENCIA[evidencia.estado_regla] : "Sin evaluar"}</dd>
        </div>
      </dl>

      {entradas.length > 0 && (
        <>
          <h3 className="evidencia-detalle-subtitulo">Datos verificados</h3>
          <dl className="lista-metadatos">
            {entradas.map(([clave, valor]) => (
              <div key={clave}>
                <dt>{ETIQUETA_CAMPO_CONTENIDO[clave] ?? clave}</dt>
                <dd>{valorCampoContenido(clave, valor)}</dd>
              </div>
            ))}
          </dl>
        </>
      )}

      <h3 className="evidencia-detalle-subtitulo">Archivo asociado</h3>
      <p className="estado-vacio" style={{ padding: "0.25rem 0 0.75rem", textAlign: "left" }}>
        No hay un archivo descargable asociado a este registro.
      </p>

      <Link href={`/evidencias/${evidencia.ejecucion_id}`} className="boton boton-primario" style={{ width: "100%" }}>
        <IconoOjo tamano={16} />
        Ver documento
      </Link>
    </>
  );
}
