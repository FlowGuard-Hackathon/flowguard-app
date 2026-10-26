"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Avatar from "./Avatar";
import { IconoBuscar, IconoCarpeta, IconoChevronDerecha, IconoChevronIzquierda } from "./Icono";
import { claseChipDecision, claseChipInvestigacion, formatoFechaCorta, formatoHora, formatoMoneda } from "../lib/formato";

export type FilaEvidencias = {
  ejecucion_id: string;
  decision: "PERMITIR" | "BLOQUEAR";
  estado_investigacion: string;
  creado_en: string;
  solicitante_id: string;
  categoria: string;
  monto_centavos: number;
};

const TAMANO_PAGINA = 8;

const OPCIONES_DECISION: { valor: FilaEvidencias["decision"] | ""; etiqueta: string }[] = [
  { valor: "", etiqueta: "Todas las decisiones" },
  { valor: "PERMITIR", etiqueta: "PERMITIR" },
  { valor: "BLOQUEAR", etiqueta: "BLOQUEAR" },
];

const OPCIONES_INVESTIGACION: { valor: string; etiqueta: string }[] = [
  { valor: "", etiqueta: "Todos los estados de investigación" },
  { valor: "NO_INICIADA", etiqueta: "NO_INICIADA" },
  { valor: "PENDIENTE", etiqueta: "PENDIENTE" },
  { valor: "EN_CURSO", etiqueta: "EN_CURSO" },
  { valor: "COMPLETADA", etiqueta: "COMPLETADA" },
  { valor: "PARCIAL", etiqueta: "PARCIAL" },
  { valor: "FALLIDA", etiqueta: "FALLIDA" },
];

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

// contratos-api.md solo define evidencias POR ejecución (GET
// /ejecuciones/:id/evidencias) — no existe un endpoint que liste evidencias
// de todas las ejecuciones juntas (a diferencia del mockup, que muestra una
// tabla plana de evidencias individuales). Esta vista es, a propósito, el
// índice real disponible: una ejecución por fila, que entra al detalle de
// evidencias de esa ejecución — mismo nivel de diseño que historial/
// solicitudes, sin inventar un listado global que el backend no tiene.
export default function TablaCentroEvidencias({ filas }: { filas: FilaEvidencias[] }) {
  const [decision, setDecision] = useState<FilaEvidencias["decision"] | "">("");
  const [investigacion, setInvestigacion] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return filas.filter((f) => {
      if (decision && f.decision !== decision) return false;
      if (investigacion && f.estado_investigacion !== investigacion) return false;
      if (q) {
        const campos = [f.ejecucion_id, f.solicitante_id, f.categoria];
        if (!campos.some((c) => c.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [filas, decision, investigacion, busqueda]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / TAMANO_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const paginadas = filtradas.slice((paginaSegura - 1) * TAMANO_PAGINA, paginaSegura * TAMANO_PAGINA);
  const hayFiltros = decision !== "" || investigacion !== "" || busqueda !== "";

  function actualizar<T>(setter: (v: T) => void) {
    return (valor: T) => {
      setter(valor);
      setPagina(1);
    };
  }

  function limpiarFiltros() {
    setDecision("");
    setInvestigacion("");
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
            placeholder="Buscar por ejecución, solicitante o categoría..."
            aria-label="Buscar evidencias"
            value={busqueda}
            onChange={(e) => actualizar(setBusqueda)(e.target.value)}
          />
        </label>

        <select className="selector" aria-label="Filtrar por decisión" value={decision} onChange={(e) => actualizar(setDecision)(e.target.value as FilaEvidencias["decision"] | "")}>
          {OPCIONES_DECISION.map((o) => (
            <option key={o.valor} value={o.valor}>{o.etiqueta}</option>
          ))}
        </select>

        <select className="selector" aria-label="Filtrar por estado de investigación" value={investigacion} onChange={(e) => actualizar(setInvestigacion)(e.target.value)}>
          {OPCIONES_INVESTIGACION.map((o) => (
            <option key={o.valor} value={o.valor}>{o.etiqueta}</option>
          ))}
        </select>
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
                    <th>Ejecución</th>
                    <th>Solicitante</th>
                    <th>Categoría</th>
                    <th>Importe</th>
                    <th>Decisión</th>
                    <th>Evidencia</th>
                    <th>Fecha</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {paginadas.map((f) => (
                    <tr key={f.ejecucion_id}>
                      <td className="celda-id">
                        <Link href={`/evidencias/${f.ejecucion_id}`}>{f.ejecucion_id}</Link>
                      </td>
                      <td>
                        <span className="celda-con-avatar">
                          <Avatar id={f.solicitante_id} /> {f.solicitante_id}
                        </span>
                      </td>
                      <td>{f.categoria}</td>
                      <td className="celda-importe">
                        <strong>{formatoMoneda(f.monto_centavos)}</strong>
                      </td>
                      <td>
                        <span className={claseChipDecision(f.decision)}>{f.decision}</span>
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
                        <Link href={`/evidencias/${f.ejecucion_id}`} className="boton boton-secundario boton-compacto">
                          <IconoCarpeta tamano={14} />
                          Ver evidencias
                          <IconoChevronDerecha tamano={13} />
                        </Link>
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
