"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function AccionesEjecucion({ id }: { id: string }) {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const cerrarAlHacerClicFuera = (evento: PointerEvent) => {
      if (!contenedor.current?.contains(evento.target as Node)) setAbierto(false);
    };
    const cerrarConEscape = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setAbierto(false);
    };
    document.addEventListener("pointerdown", cerrarAlHacerClicFuera);
    document.addEventListener("keydown", cerrarConEscape);
    return () => {
      document.removeEventListener("pointerdown", cerrarAlHacerClicFuera);
      document.removeEventListener("keydown", cerrarConEscape);
    };
  }, [abierto]);

  return (
    <div className="menu-acciones" ref={contenedor}>
      <button
        type="button"
        className="accion-menu-boton"
        aria-label={`Acciones para ${id}`}
        aria-haspopup="menu"
        aria-expanded={abierto}
        onClick={() => setAbierto((valor) => !valor)}
      >
        ···
      </button>
      {abierto && (
        <div className="menu-acciones-lista" role="menu" aria-label={`Acciones para ${id}`}>
          <Link role="menuitem" href={`/solicitudes/${id}`} onClick={() => setAbierto(false)}>Ver solicitud</Link>
          <Link role="menuitem" href={`/evidencias/${id}`} onClick={() => setAbierto(false)}>Ver evidencias</Link>
        </div>
      )}
    </div>
  );
}
