import { NextResponse } from "next/server";
import { almacen } from "../../../../../lib/almacenPrueba";
import { LIMITE_LECTURA, limiteSolicitudesExcedido } from "../../../../../lib/limiteSolicitudes";
import { requerirSesion } from "../../../../../lib/requerirSesion";

// contratos-api.md § 6. Si no hubo investigación todavía, informe_agente es null.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const noAutenticado = await requerirSesion();
  if (noAutenticado) return noAutenticado;

  const limiteExcedido = await limiteSolicitudesExcedido(request, LIMITE_LECTURA);
  if (limiteExcedido) return limiteExcedido;

  const { id } = await params;

  const ejecucion = await almacen.obtenerEjecucion(id);
  if (!ejecucion) {
    return NextResponse.json({ error: { codigo: "EJECUCION_NO_ENCONTRADA" } }, { status: 404 });
  }

  const [reglas, evidencias, informeAgente] = await Promise.all([
    almacen.obtenerResultadosReglas(id),
    almacen.obtenerEvidencias(id),
    almacen.obtenerInformeAgente(id),
  ]);

  return NextResponse.json({
    version_esquema: "1.0",
    ejecucion_id: id,
    decision: ejecucion.decision,
    reglas,
    registros_evidencia: evidencias,
    informe_agente: informeAgente
      ? { intento_id: informeAgente.intento_id, estado: informeAgente.estado, informe: informeAgente.informe }
      : null,
  });
}
