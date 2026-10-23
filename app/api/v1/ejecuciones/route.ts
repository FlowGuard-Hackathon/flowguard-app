import { NextResponse } from "next/server";
import { crearEjecucion, investigarEjecucion, type ContextoConfiable, type DatosPago } from "flowguard-src";
import { almacen, politica } from "../../../lib/almacenPrueba";

// ATENCIÓN: esta NO es la ruta final de contratos-api.md § 3. Esa ruta real
// resuelve `adjuntos`/`contexto` contra el contexto confiable del backend
// (Supabase), que todavía no existe (ver flowguard-src/README.md § "Estado
// actual"). Esta es una ruta de PRUEBA para Dev 1/Dev 2, que acepta el
// contexto confiable directo en el body porque no hay otra fuente todavía.
// No debe quedar así para producción ni para la demo final.

type CuerpoPrueba = {
  pago: DatosPago;
  contexto: ContextoConfiable;
};

export async function POST(request: Request) {
  let cuerpo: CuerpoPrueba;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!cuerpo?.pago || !cuerpo?.contexto) {
    return NextResponse.json({ error: "Faltan 'pago' o 'contexto' en el body" }, { status: 400 });
  }

  const resultado = await crearEjecucion(almacen, cuerpo.pago, cuerpo.contexto, politica);
  const investigacion = await investigarEjecucion(almacen, resultado);

  return NextResponse.json({ resultado, investigacion });
}

// Simplificado respecto a contratos-api.md § 4: no implementa paginación completa
// (pagina/tamano_pagina) ni el rango desde/hasta. Solo filtra por `decision`.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filtroDecision = searchParams.get("decision");

  let resumen = await almacen.listarResumenEjecuciones();
  if (filtroDecision === "PERMITIR" || filtroDecision === "BLOQUEAR") {
    resumen = resumen.filter((r) => r.ejecucion.decision === filtroDecision);
  }

  return NextResponse.json({
    total_elementos: resumen.length,
    ejecuciones: resumen.map((r) => ({ ...r.ejecucion, pago: r.contextoPago })),
  });
}
