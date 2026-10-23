import Link from "next/link";
import Avatar from "../../componentes/Avatar";
import GraficaActividad, { MiniGrafica, type PuntoActividad } from "../../componentes/GraficaActividad";
import AccionesEjecucion from "../../componentes/AccionesEjecucion";
import {
  IconoAlerta,
  IconoChevronDerecha,
  IconoCheck,
  IconoDocumento,
  IconoFlechaArriba,
  IconoPlay,
  IconoReloj,
  IconoX,
} from "../../componentes/Icono";
import { almacen } from "../../lib/almacenPrueba";
import { NOMBRE_REGLA, claseChipDecision, formatoFecha, formatoMoneda, formatoTiempoRelativo } from "../../lib/formato";

// Sin esto, Next.js la generaría estática en `npm run build` (congelada con
// el almacén vacío del momento del build) y no reflejaría ejecuciones nuevas
// bajo `npm run start`. En `npm run dev` no se nota la diferencia.
export const dynamic = "force-dynamic";

const MS_DIA = 86_400_000;

// Solo la tarjeta de total lleva tendencia semana-contra-semana (como el
// mockup); solo se muestra si hay datos reales de la semana previa, si no
// se omite en vez de inventar un "+12%".
function tendencia(actual: number, anterior: number): string | null {
  if (anterior === 0) return null;
  const cambio = Math.round(((actual - anterior) / anterior) * 100);
  return `${cambio >= 0 ? "+" : ""}${cambio}% vs. semana anterior`;
}

// Las otras 3 tarjetas (PERMITIR/BLOQUEAR/pendientes) muestran su parte del
// total, como el mockup — no una tendencia semanal (subir en BLOQUEAR no es
// "positivo", así que no tiene sentido pintarlo de verde con una flecha).
function porcentajeDelTotal(parte: number, total: number): string | null {
  if (total === 0) return null;
  return `${Math.round((parte / total) * 100)}% del total`;
}

// Server Component: lee el almacén en memoria directo (mismo proceso), sin
// pasar por fetch — ver app/lib/almacenPrueba.ts. Todo lo que se muestra sale
// de ejecuciones reales; nada se simula: lo que no puede calcularse con lo
// que hay (p. ej. "Historial" o "Configuración" del mockup, que no tienen
// vista propia) se omite en vez de mostrarse vacío.
export default async function PaginaPanel() {
  const resumen = await almacen.listarResumenEjecuciones();
  const reglasPorEjecucion = await Promise.all(
    resumen.map((r) => almacen.obtenerResultadosReglas(r.ejecucion.ejecucion_id)),
  );

  const hace7d = Date.now() - 7 * MS_DIA;
  const hace14d = Date.now() - 14 * MS_DIA;
  const estaSemana = resumen.filter((r) => new Date(r.ejecucion.creado_en).getTime() >= hace7d);
  const semanaAnterior = resumen.filter((r) => {
    const t = new Date(r.ejecucion.creado_en).getTime();
    return t >= hace14d && t < hace7d;
  });

  const permitidas = resumen.filter((r) => r.ejecucion.decision === "PERMITIR").length;
  const bloqueadas = resumen.filter((r) => r.ejecucion.decision === "BLOQUEAR").length;
  const pendientesInvestigacion = resumen.filter((r) =>
    ["PENDIENTE", "EN_CURSO"].includes(r.ejecucion.estado_investigacion),
  ).length;

  const tendenciaTotal = tendencia(estaSemana.length, semanaAnterior.length);

  // Actividad de los últimos 7 días (datos reales, agrupados por fecha de creación).
  const hoy = new Date();
  const grafica: PuntoActividad[] = Array.from({ length: 7 }).map((_, i) => {
    const dia = new Date(hoy);
    dia.setDate(hoy.getDate() - (6 - i));
    const clave = dia.toDateString();
    const delDia = resumen.filter((r) => new Date(r.ejecucion.creado_en).toDateString() === clave);
    return {
      etiqueta: dia.toLocaleDateString("es-MX", { day: "numeric", month: "short" }),
      fechaCompleta: dia.toLocaleDateString("es-MX", { day: "numeric", month: "short" }),
      permitidas: delDia.filter((r) => r.ejecucion.decision === "PERMITIR").length,
      bloqueadas: delDia.filter((r) => r.ejecucion.decision === "BLOQUEAR").length,
      pendientes: delDia.filter((r) => ["PENDIENTE", "EN_CURSO"].includes(r.ejecucion.estado_investigacion)).length,
    };
  });

  // Alertas reales: las ejecuciones bloqueadas más recientes, con la primera
  // regla que no se cumplió y su mensaje (no se inventa ningún texto: es el
  // que ya generó el motor de reglas).
  const alertas = resumen
    .map((r, i) => ({ r, reglaFallida: reglasPorEjecucion[i]?.find((regla) => regla.estado === "NO_CUMPLE") }))
    .filter((a) => a.r.ejecucion.decision === "BLOQUEAR" && a.reglaFallida)
    .slice(0, 4);

  // Reglas con más incumplimientos: % de ejecuciones donde esa regla falló,
  // sobre el total de ejecuciones evaluadas. Solo cuenta lo que de verdad pasó.
  const conteoPorRegla = new Map<string, number>();
  for (const reglas of reglasPorEjecucion) {
    for (const regla of reglas ?? []) {
      if (regla.estado === "NO_CUMPLE") conteoPorRegla.set(regla.regla_id, (conteoPorRegla.get(regla.regla_id) ?? 0) + 1);
    }
  }
  const topReglas = Object.keys(NOMBRE_REGLA)
    .map((regla_id) => ({ regla_id, conteo: conteoPorRegla.get(regla_id) ?? 0 }))
    .sort((a, b) => b.conteo - a.conteo || a.regla_id.localeCompare(b.regla_id))
    .map((regla) => ({ ...regla, porcentaje: resumen.length ? Math.round((regla.conteo / resumen.length) * 100) : 0 }));

  const recientes = resumen.slice(0, 5);

  return (
    <div className="panel-shell">
      <div className="encabezado-vista panel-encabezado">
        <div>
          <h1>Panel de supervisión</h1>
          <p className="descripcion-vista">Monitorea las aprobaciones y detecta riesgos antes de ejecutar un pago.</p>
        </div>
        <div className="acciones-encabezado">
          <Link href="/simulador" className="boton boton-primario">
            <IconoPlay tamano={16} />
            Simular aprobación
          </Link>
          <Link href="/solicitudes" className="boton boton-secundario">
            <IconoReloj tamano={16} />
            Ver historial
          </Link>
        </div>
      </div>

      <div className="cuadricula panel-metricas">
        <TarjetaMetrica icono={<IconoDocumento />} numero={resumen.length} etiqueta="Solicitudes supervisadas" pie={tendenciaTotal} color="var(--acento)" miniDatos={grafica.map((d) => d.permitidas + d.bloqueadas)} miniEtiqueta="Evaluaciones por día" />
        <TarjetaMetrica
          icono={<IconoCheck />}
          numero={permitidas}
          etiqueta="Aprobaciones permitidas"
          color="var(--permitir)"
          pie={porcentajeDelTotal(permitidas, resumen.length)}
          miniDatos={grafica.map((d) => d.permitidas)}
          miniEtiqueta="Aprobaciones por día"
        />
        <TarjetaMetrica
          icono={<IconoX />}
          numero={bloqueadas}
          etiqueta="Pagos bloqueados"
          color="var(--bloquear)"
          pie={porcentajeDelTotal(bloqueadas, resumen.length)}
          miniDatos={grafica.map((d) => d.bloqueadas)}
          miniEtiqueta="Bloqueos por día"
        />
        <TarjetaMetrica
          icono={<IconoAlerta />}
          numero={pendientesInvestigacion}
          etiqueta="Pendientes de revisión"
          color="var(--indeterminado)"
          pie={porcentajeDelTotal(pendientesInvestigacion, resumen.length)}
          miniDatos={grafica.map((d) => d.pendientes)}
          miniEtiqueta="Investigaciones pendientes iniciadas por día"
        />
      </div>

      <div className="fila-dos-columnas">
        <div className="tarjeta panel-grafica">
          <div className="encabezado-tarjeta">
            <h2 style={{ margin: 0 }}>Actividad de las solicitudes (últimos 7 días)</h2>
            <div className="leyenda-grafica">
              <span>
                <i className="punto" style={{ background: "var(--permitir)" }} /> PERMITIR
              </span>
              <span>
                <i className="punto" style={{ background: "var(--bloquear)" }} /> BLOQUEAR
              </span>
            </div>
          </div>
          {estaSemana.length === 0 ? <p className="estado-vacio">Sin evaluaciones en los últimos siete días. Se mostrarán aquí cuando haya actividad.</p> : <GraficaActividad datos={grafica} />}
        </div>

        <div className="tarjeta panel-alertas">
          <div className="encabezado-tarjeta">
            <h2 style={{ margin: 0 }}>Alertas recientes</h2>
            {alertas.length > 0 && <Link href="/solicitudes?decision=BLOQUEAR">Ver todas</Link>}
          </div>
          {alertas.length === 0 ? (
            <p className="estado-vacio">No hay bloqueos recientes.</p>
          ) : (
            <ul className="lista-alertas">
              {alertas.map(({ r, reglaFallida }) => (
                <li key={r.ejecucion.ejecucion_id}>
                  <Link className="alerta-enlace" href={`/solicitudes/${r.ejecucion.ejecucion_id}`}>
                    <IconoX tamano={16} />
                    <div>
                      <div className="fila-alerta-titulo">
                        <span className="alerta-titulo">Pago bloqueado: {NOMBRE_REGLA[reglaFallida?.regla_id ?? ""] ?? reglaFallida?.regla_id ?? "Regla no especificada"}</span>
                        <span className="hora-alerta">{formatoTiempoRelativo(r.ejecucion.creado_en)}</span>
                      </div>
                      <p>{r.ejecucion.ejecucion_id} · Importe: {formatoMoneda(r.contextoPago.monto_centavos)}</p>
                    </div>
                    <span className="alerta-chevron" aria-hidden="true"><IconoChevronDerecha tamano={16} /></span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="fila-dos-columnas fila-dos-columnas-invertida">
        <div className="tarjeta panel-recientes">
          <div className="encabezado-tarjeta">
            <h2 style={{ margin: 0 }}>Actividad reciente</h2>
            {resumen.length > 5 && <Link href="/historial">Ver todas</Link>}
          </div>
          {recientes.length === 0 ? (
            <p className="estado-vacio">
              Todavía no hay ejecuciones. Crea una desde el <Link href="/simulador">simulador</Link>.
            </p>
          ) : (
            <div className="tabla-contenedor">
              <table>
                <thead>
                  <tr>
                    <th>ID de solicitud</th>
                    <th>Solicitante</th>
                    <th>Concepto</th>
                    <th>Importe</th>
                    <th>Estado</th>
                    <th>Fecha y hora</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {recientes.map(({ ejecucion, contextoPago }) => (
                    <tr key={ejecucion.ejecucion_id}>
                      <td>
                        <Link href={`/solicitudes/${ejecucion.ejecucion_id}`}>{ejecucion.ejecucion_id}</Link>
                      </td>
                      <td>
                        <span className="celda-con-avatar">
                          <Avatar id={contextoPago.solicitante_id} /> {contextoPago.solicitante_id}
                        </span>
                      </td>
                      <td>{contextoPago.categoria}</td>
                      <td>{formatoMoneda(contextoPago.monto_centavos)}</td>
                      <td>
                        <span className={claseChipDecision(ejecucion.decision)}>
                          {ejecucion.decision === "PERMITIR" ? <IconoCheck tamano={14} /> : <IconoX tamano={14} />}
                          {ejecucion.decision}
                        </span>
                      </td>
                      <td>{formatoFecha(ejecucion.creado_en)}</td>
                      <td>
                        <AccionesEjecucion id={ejecucion.ejecucion_id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="tarjeta panel-reglas">
          <h2 style={{ marginTop: 0 }}>Reglas con más incumplimientos</h2>
          {
            <ul className="lista-reglas">
              {topReglas.map((t, i) => (
                <li key={t.regla_id}>
                  <span className="regla-posicion">{i + 1}</span>
                  <div className="regla-info">
                    <span className="regla-fila-titulo"><span>{t.regla_id}</span><small>{NOMBRE_REGLA[t.regla_id] ?? ""}</small></span>
                    <div className="barra-progreso" aria-label={`${t.conteo} incumplimientos, ${t.porcentaje}% de ejecuciones`}>
                      <div className="barra-progreso-relleno" style={{ width: `${Math.max(t.conteo === 0 ? 0 : 2, t.porcentaje)}%` }} />
                    </div>
                  </div>
                  <span className="regla-porcentaje">{t.porcentaje}%</span>
                </li>
              ))}
            </ul>
          }
        </div>
      </div>
    </div>
  );
}

function TarjetaMetrica({
  icono,
  numero,
  etiqueta,
  color,
  pie,
  miniDatos,
  miniEtiqueta,
}: {
  icono: React.ReactNode;
  numero: number;
  etiqueta: string;
  color?: string;
  // Texto corto bajo el número: tendencia semanal (solo la tarjeta de total,
  // sin color de juicio de valor) o "% del total" (las otras 3, con el color
  // de su propia categoría — no es un "bien/mal", solo de qué se habla).
  pie?: string | null;
  miniDatos: number[];
  miniEtiqueta: string;
}) {
  return (
    <div className="tarjeta metrica">
      <span className="icono-metrica" style={color ? { color, background: `color-mix(in srgb, ${color} 16%, transparent)` } : undefined}>{icono}</span>
      <div className="metrica-contenido">
        <span className="numero">{numero}</span>
        <span className="etiqueta">{etiqueta}</span>
        {pie && <span className="tendencia" style={{ color: color ?? "var(--texto-suave)" }}>{!color && <IconoFlechaArriba tamano={11} />} {pie}</span>}
      </div>
      <MiniGrafica datos={miniDatos} color={color ?? "var(--acento)"} etiqueta={miniEtiqueta} />
    </div>
  );
}
