"use client";

import type { ReactNode } from "react";
import { useEnVista } from "./hooks";

// Envoltorio genérico para el nivel 2 (estructural) del sistema de
// movimiento: aplica [data-revelar] + useEnVista y añade .lp-visible la
// primera vez que el nodo entra en el viewport. Es siempre un <div>; el
// contenido semántico (article, etc.) va dentro, como hijo.
export default function Revelar({
  children,
  retraso,
  className,
}: Readonly<{
  children: ReactNode;
  retraso?: 1 | 2 | 3 | 4;
  className?: string;
}>) {
  const { ref, visible } = useEnVista<HTMLDivElement>();
  const clases = ["", visible ? "lp-visible" : "", className ?? ""].filter(Boolean).join(" ");

  return (
    <div ref={ref} data-revelar data-retraso={retraso} className={clases || undefined}>
      {children}
    </div>
  );
}
