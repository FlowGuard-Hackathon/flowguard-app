import { NextResponse } from "next/server";
import {
  crearEjecucion,
  investigarEjecucion,
  EsquemaContextoConfiable,
  EsquemaDatosPago,
  FuenteDatosSupabase,
  type ContextoConfiable,
  type DatosPago,
} from "flowguard-src";
import { almacen, politica, tipoAlmacen, ESCENARIO_ID } from "../../../lib/almacenPrueba";
import { LIMITE_CREAR_EJECUCION, LIMITE_LECTURA, limiteSolicitudesExcedido } from "../../../lib/limiteSolicitudes";
import { requerirSesion } from "../../../lib/requerirSesion";

// ATENCIÓN: esta NO es la ruta final de contratos-api.md § 3. Esa ruta real
// resuelve `adjuntos`/`contexto` contra el contexto confiable del backend
// (Supabase), que todavía no existe (ver flowguard-src/README.md § "Estado
// actual"). Esta es una ruta de PRUEBA para Dev 1/Dev 2, que acepta el
// contexto confiable directo en el body porque no hay otra fuente todavía.
// No debe quedar así para producción ni para la demo final.
//
// `clave_idempotencia` SÍ es obligatoria en modo "supabase" (contratos-api.md
// § 2.2) — antes se generaba una aleatoria cuando faltaba, lo que anulaba en
// la práctica la protección contra duplicados para cualquier cliente que no
// la enviara explícitamente (el simulador no la enviaba). En memoria/
// postgres_simple no hay mecanismo de idempotencia real, así que ahí sigue
// siendo opcional y se ignora.
type CuerpoPrueba = {
  pago: DatosPago;
  contexto: ContextoConfiable;
  clave_idempotencia?: string;
};

function detallesZod(error: { issues: { path: PropertyKey[]; message: string }[] }): Record<string, unknown> {
  return { campos: error.issues.map((i) => ({ campo: i.path.join("."), mensaje: i.message })) };
}

export async function POST(request: Request) {
  const noAutenticado = await requerirSesion();
  if (noAutenticado) return noAutenticado;

  const limiteExcedido = await limiteSolicitudesExcedido(request, LIMITE_CREAR_EJECUCION);
  if (limiteExcedido) return limiteExcedido;

  let cuerpo: CuerpoPrueba;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ error: { codigo: "ERROR_VALIDACION", mensaje: "JSON inválido" } }, { status: 400 });
  }

  // contratos-api.md § 3 "Validación del backend": Zod en el borde, antes de
  // tocar la base de datos — antes solo se comprobaba que 'pago'/'contexto'
  // existieran, no su forma (un monto negativo o un campo del tipo
  // incorrecto llegaba directo a la transacción y, en el mejor caso, lo
  // atrapaba un CHECK de Postgres como un 500 feo en vez de un 400 claro).
  const pagoValidado = EsquemaDatosPago.safeParse(cuerpo?.pago);
  if (!pagoValidado.success) {
    return NextResponse.json({ error: { codigo: "ERROR_VALIDACION", mensaje: "El campo 'pago' no es válido.", detalles: detallesZod(pagoValidado.error) } }, { status: 400 });
  }
  const contextoValidado = EsquemaContextoConfiable.safeParse(cuerpo?.contexto);
  if (!contextoValidado.success) {
    return NextResponse.json({ error: { codigo: "ERROR_VALIDACION", mensaje: "El campo 'contexto' no es válido.", detalles: detallesZod(contextoValidado.error) } }, { status: 400 });
  }

  // Modo real (base-datos.md § 3): transacción única con idempotencia y
  // primer intento de investigación programado; el worker (flowguard-app/
  // instrumentation.ts) lo procesa de forma asíncrona, nunca aquí.
  if (tipoAlmacen === "supabase") {
    if (!cuerpo.clave_idempotencia) {
      return NextResponse.json(
        { error: { codigo: "ERROR_VALIDACION", mensaje: "'clave_idempotencia' es obligatoria.", detalles: { campo: "clave_idempotencia" } } },
        { status: 400 },
      );
    }
    const resultado = await (almacen as FuenteDatosSupabase).crearEjecucionTransaccional(
      pagoValidado.data,
      contextoValidado.data,
      politica,
      cuerpo.clave_idempotencia,
      ESCENARIO_ID,
    );

    switch (resultado.tipo) {
      case "CREADA":
        return NextResponse.json(
          {
            resultado: { ejecucion_id: resultado.ejecucion_id, decision: resultado.decision, resultados: resultado.resultados },
            investigacion: { estado: resultado.estado_investigacion },
          },
          { status: resultado.nueva ? 201 : 200 },
        );
      case "CONFLICTO_HASH":
        return NextResponse.json({ error: { codigo: "CLAVE_IDEMPOTENCIA_REUTILIZADA" } }, { status: 409 });
      case "EN_PROGRESO":
        return NextResponse.json({ error: { codigo: "IDEMPOTENCIA_EN_PROGRESO" } }, { status: 409 });
      case "FALLO_PERSISTENCIA":
        // catalogo-errores.md: "detalles nunca incluye... SQL ni trazas de
        // pila". resultado.error puede ser un mensaje crudo de Postgres
        // (nombres de columna, restricciones) — se registra en el servidor,
        // nunca se devuelve al cliente tal cual.
        console.error("[FALLO_PERSISTENCIA]", resultado.error);
        return NextResponse.json({ error: { codigo: "FALLO_PERSISTENCIA", mensaje: "No se pudo persistir la ejecución." } }, { status: 500 });
    }
  }

  // Modo de prueba (memoria/postgres_simple): síncrono, igual que antes.
  const resultado = await crearEjecucion(almacen, pagoValidado.data, contextoValidado.data, politica);
  const investigacion = await investigarEjecucion(almacen, resultado);

  return NextResponse.json({ resultado, investigacion });
}

// Simplificado respecto a contratos-api.md § 4: no implementa paginación completa
// (pagina/tamano_pagina) ni el rango desde/hasta. Solo filtra por `decision`.
export async function GET(request: Request) {
  const noAutenticado = await requerirSesion();
  if (noAutenticado) return noAutenticado;

  const limiteExcedido = await limiteSolicitudesExcedido(request, LIMITE_LECTURA);
  if (limiteExcedido) return limiteExcedido;

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
