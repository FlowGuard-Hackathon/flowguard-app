import RedAnimada from "./RedAnimada";

// Fondo ambiental para TODA la landing (hero incluido): la misma animación
// del login (RedAnimada.tsx), una sola instancia fija al viewport detrás de
// todo el contenido — no una por sección. Con eso el hero ya no necesita su
// propio canvas de partículas (ver FondoHero.tsx): esta instancia se ve a
// través de él.
export default function FondoAmbiental() {
  return (
    <div className="lp-fondo-ambiental" aria-hidden="true">
      <RedAnimada className="lp-red-canvas" />
    </div>
  );
}
