"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const enlaces = [
  { href: "/panel", texto: "Panel" },
  { href: "/simulador", texto: "Simulador" },
  { href: "/evidencias", texto: "Evidencias" },
];

export default function Navegacion() {
  const rutaActual = usePathname();

  return (
    <nav aria-label="Principal" className="navegacion">
      {enlaces.map(({ href, texto }) => {
        const activo = rutaActual === href || rutaActual.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={activo ? "enlace activo" : "enlace"}
            aria-current={activo ? "page" : undefined}
          >
            {texto}
          </Link>
        );
      })}
    </nav>
  );
}