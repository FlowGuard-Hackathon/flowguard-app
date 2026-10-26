import { NextResponse } from "next/server";
import { FuenteDatosSupabase } from "flowguard-src";
import { almacen, tipoAlmacen } from "../../../../../lib/almacenPrueba";
import { LIMITE_INVESTIGAR, limiteSolicitudesExcedido } from "../../../../../lib/limiteSolicitudes";
import { requerirSesion } from "../../../../../lib/requerirSesion";

// contratos-api.md § 7. Solo funciona en modo "supabase" (ver
// app/lib/almacenPrueba.ts): en memoria/postgres_simple no existe el
// mecanismo de intentos_investigacion ni el worker que los procesa.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const noAutenticado = await requerirSesion();
  if (noAutenticado) return noAutenticado;

  const limiteExcedido = await limiteSolicitudesExcedido(request, LIMITE_INVESTIGAR);
  if (limiteExcedido) return limiteExcedido;

  const { id } = await params;

  if (tipoAlmacen !== "supabase") {
    return NextResponse.json(
      { error: { codigo: "DEPENDENCIA_NO_DISPONIBLE", mensaje: "Investigación asíncrona no disponible: configure SUPABASE_DB_URL." } },
      { status: 503 },
    );
  }

  const resultado = await (almacen as FuenteDatosSupabase).programarIntentoInvestigacion(id);

  switch (resultado.resultado) {
    case "CREADO":
      return NextResponse.json(
        { version_esquema: "1.0", ejecucion_id: id, estado_investigacion: "PENDIENTE", intento_id: resultado.intento_id },
        { status: 202 },
      );
    case "EN_PROGRESO":
      return NextResponse.json({ error: { codigo: "INVESTIGACION_EN_CURSO" } }, { status: 409 });
    case "YA_COMPLETADA":
      return NextResponse.json({ error: { codigo: "INVESTIGACION_YA_COMPLETADA" } }, { status: 409 });
    case "EJECUCION_NO_ENCONTRADA":
      return NextResponse.json({ error: { codigo: "EJECUCION_NO_ENCONTRADA" } }, { status: 404 });
  }
}
