import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import Navegacion from "./componentes/Navegacion";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlowGuard",
  description: "Supervisión de aprobación de pagos simulados",
};

export default function LayoutRaiz({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <header className="encabezado">
          <a href="/" className="marca">FlowGuard</a>
          <Navegacion />
        </header>
        <main className="contenido">{children}</main>
      </body>
    </html>
  );
}