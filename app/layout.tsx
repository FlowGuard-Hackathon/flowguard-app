import type { ReactNode } from "react";
import { metadataBase } from "./metadata";
import "./globals.css";

export const metadata = metadataBase;

// Root layout separado (sin <Sidebar>, sin .estructura/.contenido): la
// landing pública (app/page.tsx) vive fuera de la barra lateral del
// dashboard, igual que el login ((auth)/layout.tsx) — mismo patrón de
// "multiple root layouts" que ya documenta ese archivo. Ahora hay tres
// raíces de nivel superior: esta (/), (app)/ (/panel, /solicitudes, etc.) y
// (auth)/ (/login).
export default function LayoutRaiz({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
