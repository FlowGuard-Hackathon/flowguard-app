"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./landing.module.css";

// Entrada progresiva al hacer scroll (IntersectionObserver, sin librería).
// Recibe Server Components reales como children (composición permitida en
// Next.js: un Client Component puede renderizar hijos renderizados por un
// Server Component padre). Respeta prefers-reduced-motion: si el usuario lo
// pide, se muestra de inmediato, sin observar ni animar nada.
export default function RevealAlEntrar({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entradas) => {
        if (entradas[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`${styles.reveal} ${visible ? styles.revealVisible : ""} ${className}`}>
      {children}
    </div>
  );
}
