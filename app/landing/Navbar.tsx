"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import styles from "./landing.module.css";

const ENLACES = [
  { id: "capacidades", etiqueta: "Producto" },
  { id: "beneficios", etiqueta: "Beneficios" },
  { id: "como-funciona", etiqueta: "Cómo funciona" },
  { id: "benchmark", etiqueta: "Benchmark" },
  { id: "casos-de-uso", etiqueta: "Casos de uso" },
];

const URL_RECURSOS = "https://github.com/FlowGuard-Hackathon/flowguard-docs";

export default function Navbar() {
  const [abierto, setAbierto] = useState(false);

  function irA(id: string) {
    setAbierto(false);
    document.getElementById(id)?.scrollIntoView({ block: "start" });
  }

  return (
    <header className={styles.navbar}>
      <div className={`${styles.container} ${styles.navbarInner}`}>
        <Link href="/" className={styles.navLogo}>
          <Image src="/logo-nombre.png" alt="FlowGuard" width={150} height={48} priority />
        </Link>

        <nav className={styles.navLinks} aria-label="Secciones de la página">
          {ENLACES.map((e) => (
            <button key={e.id} type="button" onClick={() => irA(e.id)}>
              {e.etiqueta}
            </button>
          ))}
          <a href={URL_RECURSOS} target="_blank" rel="noreferrer noopener">
            Recursos
          </a>
        </nav>

        <div className={styles.navActions}>
          {/* <a>, no next/link: cruzan a otra raíz ((auth)/(app)) — ver nota en Benchmark.tsx. */}
          <a href="/login" className="boton boton-secundario">
            Iniciar sesión
          </a>
          <a href="/panel" className="boton boton-primario">
            Solicitar demo
          </a>
          <button
            type="button"
            className={styles.navMenuBtn}
            aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={abierto}
            onClick={() => setAbierto((v) => !v)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {abierto ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </div>

      <nav className={`${styles.container} ${styles.navMobile} ${abierto ? styles.navMobileOpen : ""}`} aria-label="Secciones de la página (móvil)">
        {ENLACES.map((e) => (
          <button key={e.id} type="button" onClick={() => irA(e.id)}>
            {e.etiqueta}
          </button>
        ))}
        <a href={URL_RECURSOS} target="_blank" rel="noreferrer noopener" onClick={() => setAbierto(false)}>
          Recursos
        </a>
      </nav>
    </header>
  );
}
