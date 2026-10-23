import type { Metadata } from "next";
import type { ReactNode } from "react";
import Sidebar from "./componentes/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlowGuard",
  description: "Supervisión de aprobación de pagos simulados",
};

// metadata y children los exige Next.js con esos nombres
export default function LayoutRaiz({ children }: { children: ReactNode }) {
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
