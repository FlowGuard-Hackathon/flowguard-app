import type { ReactNode } from "react";
import Sidebar from "../componentes/Sidebar";
import { metadataBase } from "../metadata";
import "../globals.css";

export const metadata = metadataBase;

// Layout raíz de las vistas internas (panel, solicitudes, simulador,
// evidencias, historial): son las que necesitan la barra lateral. El login
// (app/(auth)/layout.tsx) es su propio layout raíz separado, sin ella — ver
// la nota de ese archivo. metadata y children los exige Next.js con esos
// nombres.
export default function LayoutApp({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div className="estructura">
          <Sidebar />
          <main className="contenido">{children}</main>
        </div>
      </body>
    </html>
  );
}
