import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { auth } from "./auth";

// El login de sesión (app/lib/auth.ts, next-auth) solo protege el
// renderizado de páginas: app/(app)/layout.tsx llama a auth() y redirige a
// /login, pero las rutas de app/api/v1/* no pasan por ese layout — son
// Route Handlers independientes. Sin esta verificación, cualquiera con
// acceso de red al puerto podía llamar POST/GET /api/v1/ejecuciones* sin
// haber iniciado sesión nunca, aunque la UI pareciera protegida.
//
// catalogo-errores.md: NO_AUTENTICADO, 401, formato uniforme de error
// (contratos-api.md § 1), con un solicitud_id de correlación.
export async function requerirSesion(): Promise<NextResponse | null> {
  const sesion = await auth();
  if (sesion) return null;

  return NextResponse.json(
    {
      error: {
        codigo: "NO_AUTENTICADO",
        mensaje: "Esta operación requiere una sesión iniciada.",
        solicitud_id: `req_${randomUUID()}`,
      },
    },
    { status: 401 },
  );
}
