import { NextResponse } from "next/server";
import { almacen } from "../../../../lib/almacenPrueba";

// Simplificado respecto a contratos-api.md § 5: no incluye `attempts` real
// (el almacén en memoria no numera reintentos todavía) ni `last_updated_at`
// propio; usa `creado_en` de la ejecución como aproximación.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const ejecucion = await almacen.obtenerEjecucion(id);
  if (!ejecucion) {
    return NextResponse.json({ error: { codigo: "EJECUCION_NO_ENCONTRADA" } }, { status: 404 });
  }

  const [reglas, pago, informeAgente] = await Promise.all([
    almacen.obtenerResultadosReglas(id),
    almacen.obtenerContextoPago(id),
    almacen.obtenerInformeAgente(id),
  ]);

  return NextResponse.json({
    ...ejecucion,
    pago,
    reglas,
    investigacion: {
      estado: ejecucion.estado_investigacion,
      intento_id: informeAgente?.intento_id ?? null,
      actualizado_en: ejecucion.creado_en,
    },
  });
}
