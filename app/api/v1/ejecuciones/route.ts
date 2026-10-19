import { NextResponse } from "next/server";
import {
  crearEjecucion,
  FuenteDatosMemoria,
  investigarEjecucion,
  type ContextoConfiable,
  type DatosPago,
  type InstantaneaPolitica,
} from "flowguard-src";

// ATENCIÓN: esta NO es la ruta final de contratos-api.md § 3. Esa ruta real
// resuelve `adjuntos`/`contexto` contra el contexto confiable del backend
// (Supabase), que todavía no existe (ver flowguard-src/README.md § "Estado
// actual"). Esta es una ruta de PRUEBA para Dev 1/Dev 2, que acepta el
// contexto confiable directo en el body porque no hay otra fuente todavía.
// No debe quedar así para producción ni para la demo final.

// Estado en memoria del proceso de desarrollo: se pierde al reiniciar
// `npm run dev`/`npm run start`. Suficiente para probar el flujo localmente.
const almacen = new FuenteDatosMemoria();

const politica: InstantaneaPolitica = {
  version_politica: "politica-pagos-v1",
  version_motor: "1.0.0",
  "PAG-001": { umbral_aprobacion_centavos: 1_000_000 }, // $10,000 MXN
  "PAG-002": { categorias_permitidas: ["OPERACIONES", "SOFTWARE", "VIAJES"] },
};

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

  const resultado = crearEjecucion(almacen, cuerpo.pago, cuerpo.contexto, politica);
  const investigacion = await investigarEjecucion(almacen, resultado);

  return NextResponse.json({ resultado, investigacion });
}
