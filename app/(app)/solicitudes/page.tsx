"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import AccionesEjecucion from "../../componentes/AccionesEjecucion";
import Avatar from "../../componentes/Avatar";
import { IconoBuscar, IconoCalendario, IconoCheck, IconoChevronIzquierda, IconoChevronDerecha, IconoSuma, IconoX } from "../../componentes/Icono";
import { formatoFechaCorta, formatoHora, formatoMoneda } from "../../lib/formato";

// Shape real de GET /api/v1/ejecuciones (app/api/v1/ejecuciones/route.ts):
// la ejecución y su contexto de pago aplanados en un solo objeto bajo `pago`.
type Decision = "PERMITIR" | "BLOQUEAR";
type Ejecucion = {
  ejecucion_id: string;
  decision: Decision;
  estado_investigacion?: string;
  creado_en: string;
  pago: {
    pago_id: string;
    monto_centavos: number;
    moneda: string;
    categoria: string;
    solicitante_id: string;
  };
};

const TAMANO_PAGINA = 8; // sin tamaño de página previo en esta vista; 8 según la referencia.

// El modelo real solo tiene dos decisiones a nivel de ejecución (PERMITIR/
// BLOQUEAR) — ver servidor/reglas/tipos.ts Decision. INDETERMINADO existe
// por regla individual (ver panel), no como estado final de una ejecución,
// así que el filtro de estado no ofrece una tercera opción que no existe.
const OPCIONES_ESTADO: { valor: Decision | ""; etiqueta: string }[] = [
  { valor: "", etiqueta: "Todos los estados" },
  { valor: "PERMITIR", etiqueta: "PERMITIR" },
  { valor: "BLOQUEAR", etiqueta: "BLOQUEAR" },
];

function aIsoFecha(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// first/last visibles + vecinos de la página actual, con "…" entre huecos.
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

export default function PaginaSolicitudes() {
  return (
    <Suspense fallback={<p className="estado-vacio">Cargando solicitudes…</p>}>
      <ContenidoSolicitudes />
    </Suspense>
  );
}

// useSearchParams() exige un límite de Suspense (si no, Next.js de-optimiza
// toda la página a client-only con un warning en build) — PaginaSolicitudes
// de arriba es ese límite.
function ContenidoSolicitudes() {
  const searchParams = useSearchParams();

  const [datos, setDatos] = useState<Ejecucion[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [estado, setEstado] = useState<Decision | "">("");
  const [categoria, setCategoria] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);

  // Semilla inicial desde ?decision= (enlace de las alertas del panel) —
  // mismo punto de integración que ya existía, ahora leído del lado cliente.
  useEffect(() => {
    const decisionUrl = searchParams.get("decision");
    if (decisionUrl === "PERMITIR" || decisionUrl === "BLOQUEAR") setEstado(decisionUrl);
    // eslint: solo al montar, como el searchParams inicial.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelado = false;
    fetch("/api/v1/ejecuciones")
      .then((r) => r.json())
      .then((cuerpo) => {
        if (cancelado) return;
        setDatos(cuerpo.ejecuciones ?? []);
      })
      .catch(() => {
        if (!cancelado) setError("No se pudieron cargar las solicitudes.");
      });
    return () => {
      cancelado = true;
    };
  }, []);

  const categorias = useMemo(() => {
    if (!datos) return [];
    return [...new Set(datos.map((e) => e.pago.categoria))].sort();
  }, [datos]);

  // Rango de fechas por defecto: el que realmente cubren los datos, no uno
  // fijo inventado (p. ej. "16 abr – 22 abr 2026" de la referencia visual).
  const rangoDatos = useMemo(() => {
    if (!datos || datos.length === 0) return null;
    const fechas = datos.map((e) => new Date(e.creado_en).getTime());
    return { min: aIsoFecha(new Date(Math.min(...fechas))), max: aIsoFecha(new Date(Math.max(...fechas))) };
  }, [datos]);

  const desdeEfectivo = desde || rangoDatos?.min || "";
  const hastaEfectivo = hasta || rangoDatos?.max || "";

  const filtrados = useMemo(() => {
    if (!datos) return [];
    const q = busqueda.trim().toLowerCase();
    return datos.filter((e) => {
      if (estado && e.decision !== estado) return false;
      if (categoria && e.pago.categoria !== categoria) return false;
      if (desdeEfectivo && e.creado_en.slice(0, 10) < desdeEfectivo) return false;
      if (hastaEfectivo && e.creado_en.slice(0, 10) > hastaEfectivo) return false;
      if (q) {
        // "ID, solicitante o proveedor": el modelo no tiene proveedor, así
        // que se busca también en categoría (lo más cercano que hay).
        const campos = [e.ejecucion_id, e.pago.pago_id, e.pago.solicitante_id, e.pago.categoria];
        if (!campos.some((c) => c.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [datos, estado, categoria, desdeEfectivo, hastaEfectivo, busqueda]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / TAMANO_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const paginados = filtrados.slice((paginaSegura - 1) * TAMANO_PAGINA, paginaSegura * TAMANO_PAGINA);

  const hayFiltros = estado !== "" || categoria !== "" || !!desde || !!hasta || busqueda !== "";

  function actualizar<T>(setter: (v: T) => void) {
    return (valor: T) => {
      setter(valor);
      setPagina(1);
    };
  }

  function limpiarFiltros() {
    setEstado("");
    setCategoria("");
    setDesde("");
    setHasta("");
    setBusqueda("");
    setPagina(1);
  }

  return (
    <>
      <div className="encabezado-vista">
        <div>
          <h1>Solicitudes de pago</h1>
          <p className="descripcion-vista">Consulta, filtra y revisa el estado de todas las solicitudes.</p>
        </div>
        <div className="acciones-encabezado">
          <Link href="/simulador" className="boton boton-primario">
            <IconoSuma tamano={16} />
            Nueva solicitud
          </Link>
        </div>
      </div>

      <div className="solicitudes-filtros">
        <select className="selector" aria-label="Filtrar por estado" value={estado} onChange={(e) => actualizar(setEstado)(e.target.value as Decision | "")}>
          {OPCIONES_ESTADO.map((o) => (
            <option key={o.valor} value={o.valor}>{o.etiqueta}</option>
          ))}
        </select>

        <select className="selector" aria-label="Filtrar por categoría" value={categoria} onChange={(e) => actualizar(setCategoria)(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <div className="rango-fechas">
          <IconoCalendario tamano={16} />
          <input type="date" aria-label="Desde" value={desdeEfectivo} max={hastaEfectivo || undefined} onChange={(e) => actualizar(setDesde)(e.target.value)} />
          <span>–</span>
          <input type="date" aria-label="Hasta" value={hastaEfectivo} min={desdeEfectivo || undefined} onChange={(e) => actualizar(setHasta)(e.target.value)} />
        </div>

        <label className="campo-busqueda">
          <IconoBuscar tamano={16} />
          <input
            type="search"
            placeholder="Buscar por ID, solicitante o proveedor..."
            aria-label="Buscar solicitudes"
            value={busqueda}
            onChange={(e) => actualizar(setBusqueda)(e.target.value)}
          />
        </label>
      </div>

      <div className="tarjeta">
        {error ? (
          <p className="estado-error">{error}</p>
        ) : !datos ? (
          <p className="estado-vacio">Cargando solicitudes…</p>
        ) : datos.length === 0 ? (
          <p className="estado-vacio">
            Todavía no hay solicitudes. Crea una desde el <Link href="/simulador">simulador</Link>.
          </p>
        ) : filtrados.length === 0 ? (
          <p className="estado-vacio">
            Ninguna solicitud coincide con estos filtros.{" "}
            {hayFiltros && <button type="button" onClick={limpiarFiltros} className="boton boton-secundario" style={{ marginTop: "0.75rem" }}>Mostrar todas</button>}
          </p>
        ) : (
          <>
            <div className="tabla-contenedor">
              <table className="solicitudes-tabla">
                <thead>
                  <tr>
                    <th>ID de solicitud</th>
                    <th>Solicitante</th>
                    <th>Categoría / ID de pago</th>
                    <th>Importe</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginados.map((e) => (
                    <tr key={e.ejecucion_id}>
                      <td className="celda-id">
                        <Link href={`/solicitudes/${e.ejecucion_id}`}>{e.ejecucion_id}</Link>
                      </td>
                      <td>
                        <span className="celda-con-avatar">
                          <Avatar id={e.pago.solicitante_id} /> {e.pago.solicitante_id}
                        </span>
                      </td>
                      <td>
                        <div className="celda-doble">
                          <strong>{e.pago.categoria}</strong>
                          <span>{e.pago.pago_id}</span>
                        </div>
                      </td>
                      <td className="celda-importe">
                        <strong>{formatoMoneda(e.pago.monto_centavos)}</strong>
                        <span>{e.pago.moneda}</span>
                      </td>
                      <td>
                        <span className={`insignia-estado ${e.decision === "PERMITIR" ? "insignia-permitir" : "insignia-bloquear"}`}>
                          {e.decision === "PERMITIR" ? <IconoCheck tamano={14} /> : <IconoX tamano={14} />}
                          {e.decision}
                        </span>
                      </td>
                      <td>
                        <div className="celda-doble">
                          <strong>{formatoFechaCorta(e.creado_en)}</strong>
                          <span>{formatoHora(e.creado_en)}</span>
                        </div>
                      </td>
                      <td>
                        <AccionesEjecucion id={e.ejecucion_id} estadoInvestigacion={e.estado_investigacion} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="paginacion">
              <span>
                Mostrando {(paginaSegura - 1) * TAMANO_PAGINA + 1}–{Math.min(paginaSegura * TAMANO_PAGINA, filtrados.length)} de {filtrados.length}
                {hayFiltros && ` (de ${datos.length} en total — `}
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
