import type { ReactNode } from "react";
import type { Metadata } from "next";
import "../globals.css";
import "../componentes/landing/landing.css";

// Layout raíz propio para la landing pública (sin <Sidebar>, sin
// .estructura/.contenido): igual que app/(auth)/layout.tsx, es su propio
// grupo de nivel superior con su propio <html>/<body> — ver la nota en ese
// archivo sobre "multiple root layouts". La URL sigue siendo "/".
export const metadata: Metadata = {
  title: "FlowGuard — Supervisión determinista de aprobación de pagos",
  description:
    "FlowGuard evalúa cada solicitud de pago contra reglas deterministas, bloquea lo que las incumple y conserva evidencia verificable de cada decisión.",
  icons: { icon: "/logo.png" },
};

export default function LayoutMarketing({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="lp-body">{children}</body>
    </html>
  );
}
