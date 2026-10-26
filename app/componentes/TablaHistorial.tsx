"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import AccionesEjecucion from "./AccionesEjecucion";
import Avatar from "./Avatar";
import { IconoBuscar, IconoCalendario, IconoChevronDerecha, IconoChevronIzquierda } from "./Icono";
import { NOMBRE_REGLA, claseChipDecision, claseChipInvestigacion, formatoFechaCorta, formatoHora } from "../lib/formato";

export type FilaHistorial = {
  ejecucion_id: string;
  decision: "PERMITIR" | "BLOQUEAR";
  estado_investigacion: string;
  creado_en: string;
  solicitante_id: string;
  reglaDeterminanteId: string | null;
};

const TAMANO_PAGINA = 8;

const OPCIONES_DECISION: { valor: FilaHistorial["decision"] | ""; etiqueta: string }[] = [
  { valor: "", etiqueta: "Todas las decisiones" },
  { valor: "PERMITIR", etiqueta: "PERMITIR" },
  { valor: "BLOQUEAR", etiqueta: "BLOQUEAR" },
];

const OPCIONES_INVESTIGACION: { valor: string; etiqueta: string }[] = [
  { valor: "", etiqueta: "Todos los estados" },
  { valor: "NO_INICIADA", etiqueta: "NO_INICIADA" },
  { valor: "PENDIENTE", etiqueta: "PENDIENTE" },
  { valor: "EN_CURSO", etiqueta: "EN_CURSO" },
  { valor: "COMPLETADA", etiqueta: "COMPLETADA" },
  { valor: "PARCIAL", etiqueta: "PARCIAL" },
  { valor: "FALLIDA", etiqueta: "FALLIDA" },
];

function aIsoFecha(d: Date): string {
  return d.toISOString().slice(0, 10);
}

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

// Tabla interactiva (búsqueda, filtros, rango de fechas, paginación) sobre
// filas ya calculadas en el servidor (historial/page.tsx: cada fila ya
// incluye la regla determinante, que requiere obtenerResultadosReglas() por
// ejecución — no tiene sentido repetir esa consulta en el cliente). Mismo
// patrón de filtros que app/solicitudes/page.tsx, para que ambas vistas se
// sientan parte del mismo sistema aunque muestren recortes distintos de los
// mismos datos (ver nota en historial/page.tsx).
export default function TablaHistorial({ filas }: { filas: FilaHistorial[] }) {
  const [decision, setDecision] = useState<FilaHistorial["decision"] | "">("");
  const [investigacion, setInvestigacion] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);

  const rangoDatos = useMemo(() => {
    if (filas.length === 0) return null;
    const fechas = filas.map((f) => new Date(f.creado_en).getTime());
    return { min: aIsoFecha(new Date(Math.min(...fechas))), max: aIsoFecha(new Date(Math.max(...fechas))) };
  }, [filas]);

  const desdeEfectivo = desde || rangoDatos?.min || "";
  const hastaEfectivo = hasta || rangoDatos?.max || "";

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return filas.filter((f) => {
      if (decision && f.decision !== decision) return false;
      if (investigacion && f.estado_investigacion !== investigacion) return false;
      if (desdeEfectivo && f.creado_en.slice(0, 10) < desdeEfectivo) return false;
      if (hastaEfectivo && f.creado_en.slice(0, 10) > hastaEfectivo) return false;
      if (q) {
        const campos = [f.ejecucion_id, f.solicitante_id];
        if (!campos.some((c) => c.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [filas, decision, investigacion, desdeEfectivo, hastaEfectivo, busqueda]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / TAMANO_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const paginadas = filtradas.slice((paginaSegura - 1) * TAMANO_PAGINA, paginaSegura * TAMANO_PAGINA);
  const hayFiltros = decision !== "" || investigacion !== "" || !!desde || !!hasta || busqueda !== "";

  function actualizar<T>(setter: (v: T) => void) {
    return (valor: T) => {
      setter(valor);
      setPagina(1);
    };
  }

  function limpiarFiltros() {
    setDecision("");
    setInvestigacion("");
    setDesde("");
    setHasta("");
    setBusqueda("");
    setPagina(1);
  }

  return (
    <>
      <div className="solicitudes-filtros">
        <label className="campo-busqueda">
          <IconoBuscar tamano={16} />
          <input
            type="search"
            placeholder="Buscar por ejecución o solicitante..."
            aria-label="Buscar en el historial"
            value={busqueda}
            onChange={(e) => actualizar(setBusqueda)(e.target.value)}
          />
        </label>

        <select className="selector" aria-label="Filtrar por decisión" value={decision} onChange={(e) => actualizar(setDecision)(e.target.value as FilaHistorial["decision"] | "")}>
          {OPCIONES_DECISION.map((o) => (
            <option key={o.valor} value={o.valor}>{o.etiqueta}</option>
          ))}
        </select>

        <select className="selector" aria-label="Filtrar por estado de investigación" value={investigacion} onChange={(e) => actualizar(setInvestigacion)(e.target.value)}>
          {OPCIONES_INVESTIGACION.map((o) => (
            <option key={o.valor} value={o.valor}>{o.etiqueta}</option>
          ))}
        </select>

        <div className="rango-fechas">
          <IconoCalendario tamano={16} />
          <input type="date" aria-label="Desde" value={desdeEfectivo} max={hastaEfectivo || undefined} onChange={(e) => actualizar(setDesde)(e.target.value)} />
          <span>–</span>
          <input type="date" aria-label="Hasta" value={hastaEfectivo} min={desdeEfectivo || undefined} onChange={(e) => actualizar(setHasta)(e.target.value)} />
        </div>
      </div>

      <div className="tarjeta">
        {filas.length === 0 ? (
          <p className="estado-vacio">
            Todavía no hay ejecuciones. Crea una desde el <Link href="/simulador">simulador</Link>.
          </p>
        ) : filtradas.length === 0 ? (
          <p className="estado-vacio">
            Ninguna ejecución coincide con estos filtros.{" "}
            {hayFiltros && <button type="button" onClick={limpiarFiltros} className="boton boton-secundario" style={{ marginTop: "0.75rem" }}>Mostrar todas</button>}
          </p>
        ) : (
          <>
            <div className="tabla-contenedor">
              <table className="solicitudes-tabla">
                <thead>
                  <tr>
                    <th>ID de ejecución</th>
                    <th>Solicitante</th>
                    <th>Decisión</th>
                    <th>Regla determinante</th>
                    <th>Investigación IA</th>
                    <th>Fecha y hora</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginadas.map((f) => (
                    <tr key={f.ejecucion_id}>
                      <td className="celda-id">
                        <Link href={`/solicitudes/${f.ejecucion_id}`}>{f.ejecucion_id}</Link>
                      </td>
                      <td>
                        <span className="celda-con-avatar">
                          <Avatar id={f.solicitante_id} /> {f.solicitante_id}
                        </span>
                      </td>
                      <td>
                        <span className={claseChipDecision(f.decision)}>{f.decision}</span>
                      </td>
                      <td>
                        {f.reglaDeterminanteId ? (
                          <div className="celda-doble">
                            <strong>{f.reglaDeterminanteId}</strong>
                            <span>{NOMBRE_REGLA[f.reglaDeterminanteId] ?? ""}</span>
                          </div>
                        ) : (
                          <span className="estado-vacio" style={{ padding: 0 }}>—</span>
                        )}
                      </td>
                      <td>
                        <span className={claseChipInvestigacion(f.estado_investigacion)}>{f.estado_investigacion}</span>
                      </td>
                      <td>
                        <div className="celda-doble">
                          <strong>{formatoFechaCorta(f.creado_en)}</strong>
                          <span>{formatoHora(f.creado_en)}</span>
                        </div>
                      </td>
                      <td>
                        <AccionesEjecucion id={f.ejecucion_id} estadoInvestigacion={f.estado_investigacion} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="paginacion">
              <span>
                Mostrando {(paginaSegura - 1) * TAMANO_PAGINA + 1}–{Math.min(paginaSegura * TAMANO_PAGINA, filtradas.length)} de {filtradas.length}
                {hayFiltros && ` (de ${filas.length} en total — `}
                {hayFiltros && <button type="button" onClick={limpiarFiltros} style={{ color: "var(--acento)", background: "none", border: "none", cursor: "pointer", padding: 0, font: "inherit" }}>quitar filtros</button>}
                {hayFiltros && ")"}
              </span>
              <div className="paginacion-paginas">
                <button type="button" className="paginacion-boton" disabled={paginaSegura === 1} onClick={() => setPagina(paginaSegura - 1)} aria-label="Página anterior">
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
                <button type="button" className="paginacion-boton" disabled={paginaSegura === totalPaginas} onClick={() => setPagina(paginaSegura + 1)} aria-label="Página siguiente">
                  <IconoChevronDerecha tamano={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
