import Link from "next/link";
import { almacen } from "../../lib/almacenPrueba";
import CentroEvidencias, { type EvidenciaEnriquecida } from "./CentroEvidencias";

// Ver nota en app/panel/page.tsx: fuerza render por solicitud.
export const dynamic = "force-dynamic";

// contratos-api.md solo define evidencias por ejecución (GET
// /ejecuciones/:id/evidencias) — no existe un endpoint que liste evidencias
// de todas las ejecuciones juntas. Esta vista las agrega aquí mismo (Server
// Component), reutilizando los mismos métodos de lectura que ya usa
// app/(app)/evidencias/[id]/page.tsx, sin tocar contratos ni la base de datos.
export default async function PaginaEvidencias() {
  let evidencias: EvidenciaEnriquecida[] = [];
  let error: string | null = null;

  try {
    const resumen = await almacen.listarResumenEjecuciones();
    const porEjecucion = await Promise.all(
      resumen.map(async ({ ejecucion, contextoPago }) => {
        const [registros, reglas] = await Promise.all([
          almacen.obtenerEvidencias(ejecucion.ejecucion_id),
          almacen.obtenerResultadosReglas(ejecucion.ejecucion_id),
        ]);

        const reglaPorRef = new Map<string, { regla_id: string; estado: "CUMPLE" | "NO_CUMPLE" | "INDETERMINADO" }>();
        for (const r of reglas ?? []) {
          for (const ref of r.refs_evidencia) reglaPorRef.set(ref, r);
        }

        return (registros ?? []).map((e): EvidenciaEnriquecida => {
          const regla = reglaPorRef.get(e.ref_evidencia);
          return {
            ...e,
            ejecucion_id: ejecucion.ejecucion_id,
            pago_id: contextoPago.pago_id,
            regla_id: regla?.regla_id ?? null,
            estado_regla: regla?.estado ?? null,
            creado_en: ejecucion.creado_en,
          };
        });
      }),
    );
    evidencias = porEjecucion.flat();
  } catch {
    error = "No se pudieron cargar las evidencias.";
  }

  return (
    <>
      <div className="encabezado-vista">
        <div>
          <h1>Centro de evidencias</h1>
          <p className="descripcion-vista">Consulta la información que respalda las decisiones.</p>
        </div>
      </div>

      {error ? (
        <div className="tarjeta">
          <p className="estado-error">
            {error} <Link href="/evidencias">Reintentar</Link>
          </p>
        </div>
      ) : evidencias.length === 0 ? (
        <div className="tarjeta">
          <p className="estado-vacio">
            Todavía no hay evidencias. Crea una ejecución desde el <Link href="/simulador">simulador</Link>.
          </p>
        </div>
      ) : (
        <CentroEvidencias evidencias={evidencias} />
      )}
    </>
  );
}
