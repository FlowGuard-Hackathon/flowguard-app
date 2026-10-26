// Fondo del hero: ya no tiene su propio canvas de partículas — el fondo
// ambiental de toda la landing (FondoAmbiental.tsx, RedAnimada.tsx) corre
// detrás y se ve a través de este div, cuyo único trabajo ahora es aportar
// las capas puramente decorativas y baratas (gradientes radiales, malla
// técnica, líneas luminosas) que le dan profundidad específica al hero sin
// otra instancia de canvas.
export default function FondoHero() {
  return (
    <div className="lp-fondo-hero" aria-hidden="true">
      <div className="lp-fondo-malla" />
      <div className="lp-fondo-lineas" />
    </div>
  );
}
