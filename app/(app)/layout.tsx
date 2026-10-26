import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import Sidebar from "../componentes/Sidebar";
import { metadataBase } from "../metadata";
import { auth, signOut } from "../lib/auth";
import "../globals.css";

export const metadata = metadataBase;

// Layout raíz de las vistas internas (panel, solicitudes, simulador,
// evidencias, historial): son las que necesitan la barra lateral. El login
// (app/(auth)/layout.tsx) es su propio layout raíz separado, sin ella — ver
// la nota de ese archivo. metadata y children los exige Next.js con esos
// nombres.
//
// Protección de sesión (flowguard-docs/requisitos-vistas.md § 1, ampliado):
// se verifica aquí, no en middleware.ts — ese archivo ya tiene su propio
// alcance (límite de solicitudes de /api/v1/*, seguridad.md § 2.4) y está en
// desarrollo activo en otra rama; añadir aquí la verificación de sesión evita
// tocar su matcher y es suficiente porque todas las vistas internas pasan
// por este layout.
export default async function LayoutApp({ children }: { children: ReactNode }) {
  const sesion = await auth();
  if (!sesion) redirect("/login");

  async function cerrarSesion() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <html lang="es">
      <body>
        <div className="estructura">
          <Sidebar
            correo={sesion.user?.email ?? sesion.user?.name ?? "Sesión activa"}
            accionCerrarSesion={cerrarSesion}
          />
          <main className="contenido">{children}</main>
        </div>
      </body>
    </html>
  );
}
