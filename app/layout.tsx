import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "FlowGuard",
  description: "Supervisión de aprobaciones de pago con evidencia verificable.",
};

// metadata y children los exige Next.js con esos nombres
export default function LayoutRaiz({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
