import { almacen } from "./lib/almacenPrueba";
import { NOMBRE_REGLA, construirPuntosActividad, formatoFechaCorta } from "./lib/formato";
import Navbar from "./landing/Navbar";
import Hero from "./landing/Hero";
import Capacidades from "./landing/Capacidades";
import DemoRiesgo from "./landing/DemoRiesgo";
import Benchmark from "./landing/Benchmark";
import ComoFunciona from "./landing/ComoFunciona";
import CasosDeUso from "./landing/CasosDeUso";
import CtaFinal from "./landing/CtaFinal";
import FooterLanding from "./landing/FooterLanding";
import RevealAlEntrar from "./landing/RevealAlEntrar";
import styles from "./landing/landing.module.css";

// Ver nota en app/(app)/panel/page.tsx: fuerza render por solicitud, para
// que la landing muestre datos reales de esta instancia y no un build
// congelado. Landing pública en "/" — ver app/layout.tsx para por qué este
// grupo de rutas no tiene <Sidebar>.
export const dynamic = "force-dynamic";

export default async function PaginaInicio() {
  const resumen = await almacen.listarResumenEjecuciones();
  const reglasPorEjecucion = await Promise.all(resumen.map((r) => almacen.obtenerResultadosReglas(r.ejecucion.ejecucion_id)));

  const total = resumen.length;
  const permitidas = resumen.filter((r) => r.ejecucion.decision === "PERMITIR").length;
  const bloqueadas = resumen.filter((r) => r.ejecucion.decision === "BLOQUEAR").length;
  const pendientes = resumen.filter((r) => ["PENDIENTE", "EN_CURSO"].includes(r.ejecucion.estado_investigacion)).length;

  // Ventana de la mini-gráfica del hero: los últimos 14 días reales.
  const hoy = new Date();
  const hace14 = new Date(hoy);
  hace14.setDate(hoy.getDate() - 13);
  const grafica = construirPuntosActividad(
    resumen.map((r) => ({
      creado_en: r.ejecucion.creado_en,
      decision: r.ejecucion.decision,
      estado_investigacion: r.ejecucion.estado_investigacion,
    })),
    hace14,
    hoy,
  );

  // Rendimiento por regla: % de evaluaciones CUMPLE sobre el total de esa
  // regla (cada ejecución evalúa las 5 reglas, así que el total es el mismo
  // para todas) — dato real, no una tasa de acierto inventada.
  const conteoPorRegla = new Map<string, { cumple: number; total: number }>();
  for (const reglas of reglasPorEjecucion) {
    for (const regla of reglas ?? []) {
      const actual = conteoPorRegla.get(regla.regla_id) ?? { cumple: 0, total: 0 };
      actual.total += 1;
      if (regla.estado === "CUMPLE") actual.cumple += 1;
      conteoPorRegla.set(regla.regla_id, actual);
    }
  }
  const rendimientoPorRegla = Object.keys(NOMBRE_REGLA).map((regla_id) => {
    const c = conteoPorRegla.get(regla_id) ?? { cumple: 0, total: 0 };
    return { regla_id, porcentaje: c.total ? Math.round((c.cumple / c.total) * 100) : 0 };
  });

  const recientes = resumen.slice(0, 5);
  const rangoEtiqueta =
    total === 0
      ? "Sin datos todavía"
      : `${formatoFechaCorta(resumen[resumen.length - 1]!.ejecucion.creado_en)} – ${formatoFechaCorta(resumen[0]!.ejecucion.creado_en)}`;

  return (
    <div className={styles.pagina}>
      <Navbar />
      <main>
        <Hero
          total={total}
          permitidas={permitidas}
          bloqueadas={bloqueadas}
          pendientes={pendientes}
          grafica={grafica}
          rendimientoPorRegla={rendimientoPorRegla}
          recientes={resumen.slice(0, 3)}
          rangoEtiqueta={rangoEtiqueta}
        />

        <RevealAlEntrar>
          <Capacidades />
        </RevealAlEntrar>

        <RevealAlEntrar>
          <DemoRiesgo />
        </RevealAlEntrar>

        <RevealAlEntrar>
          <Benchmark total={total} permitidas={permitidas} bloqueadas={bloqueadas} pendientes={pendientes} rendimientoPorRegla={rendimientoPorRegla} />
        </RevealAlEntrar>

        <RevealAlEntrar>
          <ComoFunciona />
        </RevealAlEntrar>

        <RevealAlEntrar>
          <CasosDeUso />
        </RevealAlEntrar>

        <RevealAlEntrar>
          <CtaFinal />
        </RevealAlEntrar>
      </main>
      <FooterLanding />
    </div>
  );
}
