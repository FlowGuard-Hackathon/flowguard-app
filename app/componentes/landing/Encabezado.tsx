"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";

const enlaces = [
  { href: "#capacidades", texto: "Producto" },
  { href: "#deteccion", texto: "Detección en vivo" },
  { href: "#benchmark", texto: "Benchmark" },
  { href: "#como-funciona", texto: "Cómo funciona" },
  { href: "#casos-de-uso", texto: "Casos de uso" },
];

export default function Encabezado() {
  const [conFondo, setConFondo] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const alDesplazar = () => setConFondo(window.scrollY > 8);
    alDesplazar();
    window.addEventListener("scroll", alDesplazar, { passive: true });
    return () => window.removeEventListener("scroll", alDesplazar);
  }, []);

  // Cierra el menú móvil al pasar a ancho de escritorio (evita que quede
  // "abierto" en estado oculto si el usuario gira la pantalla o agranda la
  // ventana), al hacer clic fuera y con Escape — mismo patrón que
  // AccionesEjecucion.tsx.
  useEffect(() => {
    if (!menuAbierto) return;
    const medio = window.matchMedia("(min-width: 760px)");
    const cerrarSiAncho = () => { if (medio.matches) setMenuAbierto(false); };
    const cerrarAlHacerClicFuera = (evento: PointerEvent) => {
      if (!headerRef.current?.contains(evento.target as Node)) setMenuAbierto(false);
    };
    const cerrarConEscape = (evento: KeyboardEvent) => { if (evento.key === "Escape") setMenuAbierto(false); };
    medio.addEventListener("change", cerrarSiAncho);
    document.addEventListener("pointerdown", cerrarAlHacerClicFuera);
    document.addEventListener("keydown", cerrarConEscape);
    return () => {
      medio.removeEventListener("change", cerrarSiAncho);
      document.removeEventListener("pointerdown", cerrarAlHacerClicFuera);
      document.removeEventListener("keydown", cerrarConEscape);
    };
  }, [menuAbierto]);

  return (
    <motion.header
      ref={headerRef}
      className="lp-header"
      data-con-fondo={conFondo}
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href="/" className="lp-header-marca">
        <Image src="/logo-nombre.png" alt="FlowGuard" width={150} height={48} priority />
      </Link>
      <nav className="lp-header-nav" aria-label="Secciones">
        {enlaces.map((enlace) => (
          <a key={enlace.href} href={enlace.href} className="lp-header-enlace">
            {enlace.texto}
          </a>
        ))}
      </nav>
      <div className="lp-header-acciones">
        <Link href="/panel" className="lp-boton lp-boton-secundario lp-boton-oculto-en-menu">
          Entrar al panel
        </Link>
        <Link href="/simulador" className="lp-boton lp-boton-primario lp-boton-oculto-en-menu">
          Abrir el simulador <span className="lp-flecha">→</span>
        </Link>
        <button
          type="button"
          className="lp-header-movil-boton"
          aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuAbierto}
          aria-controls="lp-menu-movil"
          onClick={() => setMenuAbierto((v) => !v)}
        >
          <span data-abierto={menuAbierto} />
        </button>
      </div>

      {menuAbierto && (
        <motion.div
          id="lp-menu-movil"
          className="lp-header-movil-panel"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <nav aria-label="Secciones (móvil)">
            {enlaces.map((enlace) => (
              <a key={enlace.href} href={enlace.href} onClick={() => setMenuAbierto(false)}>
                {enlace.texto}
              </a>
            ))}
          </nav>
          <div className="lp-header-movil-acciones">
            <Link href="/panel" className="lp-boton lp-boton-secundario" onClick={() => setMenuAbierto(false)}>
              Entrar al panel
            </Link>
            <Link href="/simulador" className="lp-boton lp-boton-primario" onClick={() => setMenuAbierto(false)}>
              Abrir el simulador <span className="lp-flecha">→</span>
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
