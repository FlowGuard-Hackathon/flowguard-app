"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import GraficaActividad from "../../componentes/GraficaActividad";
import { IconoCalendario } from "../../componentes/Icono";
import {
  NOMBRE_REGLA,
  claseChipDecision,
  claseChipInvestigacion,
  construirPuntosActividad,
  fechaLocalDesdeIso,
  formatoFecha,
} from "../../lib/formato";

type Decision = "PERMITIR" | "BLOQUEAR";

// Fila real (ejecución + contexto de pago + reglas incumplidas), construida
// en page.tsx a partir de almacen.listarResumenEjecuciones()/obtenerResultadosReglas() —
// mismas fuentes que ya usaba esta vista, solo que ahora también se agregan
// para la gráfica y el desglose por regla.
export type FilaHistorial = {
  ejecucion_id: string;
  decision: Decision;
  estado_investigacion: string;
  creado_en: string;
  solicitante_id: string;
  reglaDeterminante: string | null;
  reglasNoCumplidas: string[];
};

function aIsoFecha(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function HistorialContenido({ filas }: { filas: FilaHistorial[] }) {
  const [filtroDecision, setFiltroDecision] = useState<Decision | "">("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  // Rango por defecto: el que realmente cubren los datos, no uno inventado
  // (mismo criterio que /solicitudes).
  const rangoDatos = useMemo(() => {
    const fechas = filas.map((f) => new Date(f.creado_en).getTime());
    return { min: aIsoFecha(new Date(Math.min(...fechas))), max: aIsoFecha(new Date(Math.max(...fechas))) };
  }, [filas]);

  const desdeEfectivo = desde || rangoDatos.min;
  const hastaEfectivo = hasta || rangoDatos.max;

  const filtradas = useMemo(() => {
    return filas.filter((f) => {
      if (filtroDecision && f.decision !== filtroDecision) return false;
      if (desdeEfectivo && f.creado_en.slice(0, 10) < desdeEfectivo) return false;
      if (hastaEfectivo && f.creado_en.slice(0, 10) > hastaEfectivo) return false;
      return true;
    });
  }, [filas, filtroDecision, desdeEfectivo, hastaEfectivo]);

  // La gráfica y la tabla leen del mismo array filtrado: nunca se desincronizan.
  const grafica = useMemo(
    () => construirPuntosActividad(filtradas, fechaLocalDesdeIso(desdeEfectivo), fechaLocalDesdeIso(hastaEfectivo)),
    [filtradas, desdeEfectivo, hastaEfectivo],
  );

  // Incumplimientos por regla: cuenta incidencias (una ejecución puede
  // incumplir varias reglas a la vez y suma en cada una), no solicitudes
  // únicas — mismo criterio que ya usa "Reglas con más incumplimientos" en
  // /panel, extendido aquí al rango filtrado completo en vez de solo 7 días.
  const topReglas = useMemo(() => {
    const conteo = new Map<string, number>();
    for (const f of filtradas) {
      for (const regla_id of f.reglasNoCumplidas) conteo.set(regla_id, (conteo.get(regla_id) ?? 0) + 1);
    }
    return Object.keys(NOMBRE_REGLA)
      .map((regla_id) => ({ regla_id, conteo: conteo.get(regla_id) ?? 0 }))
      .sort((a, b) => b.conteo - a.conteo || a.regla_id.localeCompare(b.regla_id))
      .map((r) => ({ ...r, porcentaje: filtradas.length ? Math.round((r.conteo / filtradas.length) * 100) : 0 }));
  }, [filtradas]);

  const hayFiltros = filtroDecision !== "" || !!desde || !!hasta;

  function limpiarFiltros() {
    setFiltroDecision("");
    setDesde("");
    setHasta("");
  }

  return (
    <>
      <div className="solicitudes-filtros">
        <select
          className="selector"
          aria-label="Filtrar por decisión"
          value={filtroDecision}
          onChange={(e) => setFiltroDecision(e.target.value as Decision | "")}
        >
          <option value="">Todos los estados</option>
          <option value="PERMITIR">PERMITIR</option>
          <option value="BLOQUEAR">BLOQUEAR</option>
        </select>

        <div className="rango-fechas">
          <IconoCalendario tamano={16} />
          <input type="date" aria-label="Desde" value={desdeEfectivo} max={hastaEfectivo} onChange={(e) => setDesde(e.target.value)} />
          <span>–</span>
          <input type="date" aria-label="Hasta" value={hastaEfectivo} min={desdeEfectivo} onChange={(e) => setHasta(e.target.value)} />
        </div>
      </div>

      <div className="fila-dos-columnas">
        <div className="tarjeta panel-grafica">
          <div className="encabezado-tarjeta">
            <h2 style={{ margin: 0 }}>Tendencia de decisiones</h2>
            <div className="leyenda-grafica">
              <span>
                <i className="punto" style={{ background: "var(--permitir)" }} /> PERMITIR
              </span>
              <span>
                <i className="punto" style={{ background: "var(--bloquear)" }} /> BLOQUEAR
              </span>
            </div>
          </div>
          {/* Solo dos series: `decision` nunca vale INDETERMINADO a nivel de
              ejecución (ese estado existe por regla individual — ver
              GraficaActividad.tsx). Un pago bloqueado por INDETERMINADO en
              alguna regla sigue siendo BLOQUEAR aquí, no una tercera serie. */}
          {filtradas.length === 0 ? (
            <p className="estado-vacio">Ninguna ejecución coincide con estos filtros.</p>
          ) : (
            <GraficaActividad datos={grafica} etiqueta={`Tendencia de decisiones del ${desdeEfectivo} al ${hastaEfectivo}`} />
          )}
        </div>

        <div className="tarjeta panel-reglas">
          <h2 style={{ marginTop: 0 }}>Incumplimientos por regla</h2>
          {filtradas.length === 0 ? (
            <p className="estado-vacio">Sin datos para este filtro.</p>
          ) : (
            <ul className="lista-reglas">
              {topReglas.map((t, i) => (
                <li key={t.regla_id}>
                  <span className="regla-posicion">{i + 1}</span>
                  <div className="regla-info">
                    <span className="regla-fila-titulo">
                      <span>{t.regla_id}</span>
                      <small>{NOMBRE_REGLA[t.regla_id] ?? ""}</small>
                    </span>
                    <div className="barra-progreso" aria-label={`${t.conteo} incumplimientos, ${t.porcentaje}% de las ejecuciones filtradas`}>
                      <div className="barra-progreso-relleno" style={{ width: `${Math.max(t.conteo === 0 ? 0 : 2, t.porcentaje)}%` }} />
                    </div>
                  </div>
                  <span className="regla-porcentaje">{t.porcentaje}%</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="tarjeta">
        {filtradas.length === 0 ? (
          <p className="estado-vacio">
            Ninguna ejecución coincide con estos filtros.{" "}
            {hayFiltros && (
              <button type="button" className="boton boton-secundario" onClick={limpiarFiltros} style={{ marginTop: "0.75rem" }}>
                Mostrar todas
              </button>
            )}
          </p>
        ) : (
          <div className="tabla-contenedor">
            <table>
              <thead>
                <tr>
                  <th>Ejecución</th>
                  <th>Solicitante</th>
                  <th>Decisión</th>
                  <th>Regla determinante</th>
                  <th>Investigación</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map((f) => (
                  <tr key={f.ejecucion_id}>
                    <td>{f.ejecucion_id}</td>
                    <td>{f.solicitante_id}</td>
                    <td>
                      <span className={claseChipDecision(f.decision)}>{f.decision}</span>
                    </td>
                    <td>{f.reglaDeterminante ?? "—"}</td>
                    <td>
                      <span className={claseChipInvestigacion(f.estado_investigacion)}>{f.estado_investigacion}</span>
                    </td>
                    <td>{formatoFecha(f.creado_en)}</td>
                    <td>
                      <Link href={`/solicitudes/${f.ejecucion_id}`}>Ver detalle</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
