import TablaCentroEvidencias, { type FilaEvidencias } from "../../componentes/TablaCentroEvidencias";
import { almacen } from "../../lib/almacenPrueba";

// Ver nota en app/panel/page.tsx: fuerza render por solicitud.
export const dynamic = "force-dynamic";

// Vista "Centro de evidencias" (requisitos-vistas.md § 6,
// mockups/06-centro-evidencias.png). Ver nota completa en
// TablaCentroEvidencias.tsx sobre por qué esta vista lista ejecuciones (no
// evidencias individuales sueltas): contratos-api.md solo define evidencias
// por ejecución, no un listado global.
export default async function PaginaEvidencias() {
  const resumen = await almacen.listarResumenEjecuciones();

  const filas: FilaEvidencias[] = resumen.map(({ ejecucion, contextoPago }) => ({
    ejecucion_id: ejecucion.ejecucion_id,
    decision: ejecucion.decision,
    estado_investigacion: ejecucion.estado_investigacion,
    creado_en: ejecucion.creado_en,
    solicitante_id: contextoPago.solicitante_id,
    categoria: contextoPago.categoria,
    monto_centavos: contextoPago.monto_centavos,
  }));

  return (
    <>
      <div className="encabezado-vista">
        <div>
          <h1>Centro de evidencias</h1>
          <p className="descripcion-vista">Consulta la información que respalda cada decisión.</p>
        </div>
      </div>

      <TablaCentroEvidencias filas={filas} />
    </>
  );
}
