"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconoCarpeta, IconoDocumento, IconoInicio, IconoPlay, IconoReloj, IconoSalir } from "./Icono";

const enlaces = [
  { href: "/panel", texto: "Dashboard", Icono: IconoInicio },
  { href: "/solicitudes", texto: "Solicitudes de pago", Icono: IconoDocumento },
  { href: "/simulador", texto: "Simulador", Icono: IconoPlay },
  { href: "/evidencias", texto: "Centro de evidencias", Icono: IconoCarpeta },
  { href: "/historial", texto: "Historial de ejecuciones", Icono: IconoReloj },
];

export default function Sidebar({
  correo,
  accionCerrarSesion,
}: Readonly<{
  correo: string;
  accionCerrarSesion: () => Promise<void>;
}>) {
  const rutaActual = usePathname();
  const inicial = correo.trim().charAt(0).toUpperCase() || "?";

  return (
    <aside className="barra-lateral">
      <Link href="/panel" className="marca">
        <Image src="/logo-nombre.png" alt="FlowGuard" width={185} height={60} priority />
        <small>DETECT · VERIFY · PROTECT</small>
      </Link>

      <nav aria-label="Principal" className="navegacion">
        <span className="navegacion-etiqueta">Menú</span>
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

      <div className="tarjeta-sesion">
        <div className="tarjeta-sesion-usuario">
          <span className="avatar-sesion" aria-hidden="true">{inicial}</span>
          <p className="nota-sidebar" title={correo}>
            <span className="correo-sesion">{correo}</span>
            <small><span className="estado-demo" /> Sesión activa</small>
          </p>
        </div>
        <form action={accionCerrarSesion}>
          <button type="submit" className="boton-cerrar-sesion">
            <IconoSalir tamano={15} /> <span className="texto-cerrar-sesion">Cerrar sesión</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
