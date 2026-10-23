import type { ReactNode } from "react";
import { metadataBase } from "../metadata";
import "../globals.css";

export const metadata = metadataBase;

// Root layout separado (sin <Sidebar>, sin .estructura/.contenido): el login
// vive fuera de la barra lateral porque todavía no hay sesión. Next.js
// permite esto con "multiple root layouts" — cada grupo de nivel superior
// ((app)/ y (auth)/) define su propio <html>/<body>; por eso ya no existe un
// app/layout.tsx único compartido. Las URLs no cambian: los paréntesis no
// entran en la ruta (/panel sigue siendo /panel, no /(app)/panel).
export default function LayoutAuth({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
