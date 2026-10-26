import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { FuenteDatosSupabase } from "flowguard-src";
import { almacen, tipoAlmacen } from "./almacenPrueba";

// seguridad.md § 2.4: límite de solicitudes mediante el contador compartido
// en PostgreSQL (fn_verificar_limite_solicitudes). Se aplica aquí, dentro de
// cada Route Handler, en vez de en middleware.ts: ese archivo intenta
// compilarse también para el runtime Edge (incompatible con `pg`/`fs`) y
// rompía el build por completo — ver la nota en flowguard-src/src/servidor/
// worker/cli.ts para el mismo problema con instrumentation.ts. Un Route
// Handler corre siempre en Node.js, así que no tiene ese inconveniente.
export type GrupoLimite = { clave: string; limite: number; ventanaSegundos: number };

// seguridad.md § 2.4, tabla "Endpoints y límites".
export const LIMITE_CREAR_EJECUCION: GrupoLimite = { clave: "crear-ejecucion", limite: 10, ventanaSegundos: 60 };
export const LIMITE_INVESTIGAR: GrupoLimite = { clave: "investigar", limite: 5, ventanaSegundos: 60 };
export const LIMITE_LECTURA: GrupoLimite = { clave: "lectura", limite: 60, ventanaSegundos: 60 };

// Igual que la nota de la versión anterior de middleware.ts: nunca confiar
// en X-Forwarded-For sin verificar: solo si ENCABEZADO_PROXY_CONFIABLE está
// configurado explícitamente. Request (Route Handler de Next.js) no expone
// el socket TCP directamente, así que sin ese encabezado se usa un
// identificador fijo en vez de desactivar el límite por falta de IP.
function resolverIp(request: Request): string {
  const encabezadoConfiable = process.env.ENCABEZADO_PROXY_CONFIABLE;
  if (encabezadoConfiable) {
    const valor = request.headers.get(encabezadoConfiable);
    const primero = valor?.split(",")[0]?.trim();
    if (primero) return primero;
  }
  return request.headers.get("x-real-ip") ?? "desconocido";
}

// Devuelve una respuesta 429 lista para retornar si se superó el límite, o
// null si la solicitud puede continuar (incluido el caso "límite
// desactivado", LIMITE_SOLICITUDES_ACTIVO != 'true', recomendado para
// desarrollo local por seguridad.md § 2.4).
export async function limiteSolicitudesExcedido(request: Request, grupo: GrupoLimite): Promise<NextResponse | null> {
  if (process.env.LIMITE_SOLICITUDES_ACTIVO !== "true" || tipoAlmacen !== "supabase") return null;

  try {
    const fuente = almacen as FuenteDatosSupabase;
    const claveLimite = `${resolverIp(request)}:${grupo.clave}`;
    const resultado = await fuente.verificarLimiteSolicitudes(claveLimite, grupo.ventanaSegundos, grupo.limite);

    if (!resultado.permitido) {
      return NextResponse.json(
        {
          error: {
            codigo: "LIMITE_SOLICITUDES_EXCEDIDO",
            mensaje: "Se superó el límite de solicitudes para este endpoint.",
            solicitud_id: `req_${randomUUID()}`,
            detalles: { limit: grupo.limite, ventana_segundos: grupo.ventanaSegundos },
          },
        },
        { status: 429, headers: { "Retry-After": String(resultado.reintentarTrasSegundos) } },
      );
    }
    return null;
  } catch (error) {
    // seguridad.md § 2.4 "Comportamiento ante errores del propio almacén de
    // límites": fail-open con registro de advertencia, nunca bloquear
    // tráfico legítimo por un fallo de este control secundario.
    console.warn("[flowguard] límite de solicitudes: fail-open por error", error);
    return null;
  }
}
