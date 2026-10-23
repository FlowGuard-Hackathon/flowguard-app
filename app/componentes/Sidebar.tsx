"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconoCarpeta, IconoDocumento, IconoInicio, IconoPlay, IconoReloj } from "./Icono";

const enlaces = [
  { href: "/panel", texto: "Dashboard", Icono: IconoInicio },
  { href: "/solicitudes", texto: "Solicitudes de pago", Icono: IconoDocumento },
  { href: "/simulador", texto: "Simulador", Icono: IconoPlay },
  { href: "/evidencias", texto: "Centro de evidencias", Icono: IconoCarpeta },
  { href: "/historial", texto: "Historial de ejecuciones", Icono: IconoReloj },
];

export default function Sidebar() {
  const rutaActual = usePathname();

  return (
    <aside className="barra-lateral">
      <Link href="/" className="marca">
        <Image src="/logo-nombre.png" alt="FlowGuard" width={185} height={60} priority />
        <small>DETECT · VERIFY · PROTECT</small>
      </Link>
      <nav aria-label="Principal" className="navegacion">
        {enlaces.map(({ href, texto, Icono }) => {
          const activo = rutaActual === href || rutaActual.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={activo ? "enlace activo" : "enlace"}
              aria-current={activo ? "page" : undefined}
            >
              <Icono tamano={18} /> {texto}
            </Link>
          );
        })}
      </nav>
      {/* Sin usuario logueado abajo (como en flowguard-mockups): no hay
          autenticación implementada (requisitos-vistas.md § 1, fuera del
          MVP). Mostrar un nombre fijo simularía una sesión que no existe. */}
      <p className="nota-sidebar"><span className="estado-demo" /> Sesión de demostración<br /><small>Sin autenticación</small></p>
    </aside>
  );
}
