import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlowGuard",
  description: "Supervisión de aprobaciones de pago con evidencia verificable.",
};

// Navegación compartida: layout (estructura), no diseño. Colores, tipografía
// y estilo visual quedan pendientes de Dev 2.
const ENLACES_NAV = [
  { href: "/panel", texto: "Panel de control" },
  { href: "/simulador", texto: "Simulador de pagos" },
  { href: "/evidencias", texto: "Centro de evidencias" },
];

// metadata y children los exige Next.js con esos nombres
export default function LayoutRaiz({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <header className="encabezado-sitio">
          <Link href="/">FlowGuard</Link>
          <nav className="nav-principal" aria-label="Navegación principal">
            <ul>
              {ENLACES_NAV.map((enlace) => (
                <li key={enlace.href}>
                  <Link href={enlace.href}>{enlace.texto}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>
        <main className="contenido-principal">{children}</main>
      </body>
    </html>
  );
}
