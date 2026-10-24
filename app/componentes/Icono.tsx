// Íconos en SVG plano, sin librería nueva (ver no-new-technologies). Solo los
// que usan las vistas reales; no es un set genérico para "por si acaso".
type Props = { tamano?: number };

export function IconoDocumento({ tamano = 20 }: Props) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

export function IconoCheck({ tamano = 20 }: Props) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function IconoX({ tamano = 20 }: Props) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6M9 9l6 6" />
    </svg>
  );
}

export function IconoAlerta({ tamano = 20 }: Props) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.3 3.9 1.8 18a1.8 1.8 0 0 0 1.5 2.7h17.4a1.8 1.8 0 0 0 1.5-2.7L13.7 3.9a1.8 1.8 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 16.5h.01" />
    </svg>
  );
}

export function IconoEscudo({ tamano = 22 }: Props) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function IconoInicio({ tamano = 20 }: Props) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}

export function IconoPlay({ tamano = 20 }: Props) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M10 8.5v7l6-3.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconoCarpeta({ tamano = 20 }: Props) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  );
}

export function IconoReloj({ tamano = 16 }: Props) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

export function IconoFlechaArriba({ tamano = 12 }: Props) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M17 7 7 17M17 7H9M17 7v8" />
    </svg>
  );
}

export function IconoChevronDerecha({ tamano = 18 }: Props) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconoLimpiar({ tamano = 18 }: Props) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </svg>
  );
}

export function IconoMas({ tamano = 18 }: Props) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}

export function IconoSuma({ tamano = 18 }: Props) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconoBuscar({ tamano = 18 }: Props) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function IconoCalendario({ tamano = 18 }: Props) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

export function IconoEtiqueta({ tamano = 18 }: Props) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11.5 3H5a2 2 0 0 0-2 2v6.5a2 2 0 0 0 .6 1.4l9.5 9.5a2 2 0 0 0 2.8 0l6.1-6.1a2 2 0 0 0 0-2.8l-9.5-9.5A2 2 0 0 0 11.5 3Z" />
      <circle cx="8" cy="8" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconoInfo({ tamano = 20 }: Props) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  );
}

export function IconoMoneda({ tamano = 18 }: Props) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9.5 9.3c0-1 1-1.8 2.5-1.8s2.5.7 2.5 1.6c0 2.2-5 1-5 3.2 0 .9 1 1.7 2.5 1.7s2.5-.8 2.5-1.8" />
    </svg>
  );
}

export function IconoChevronIzquierda({ tamano = 18 }: Props) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="m15 6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconoSobre({ tamano = 18 }: Props) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2.5 5.5 9.5 7 9.5-7" />
    </svg>
  );
}

export function IconoCandado({ tamano = 18 }: Props) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function IconoOjo({ tamano = 18 }: Props) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconoOjoTachado({ tamano = 18 }: Props) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.9 4.6A10.4 10.4 0 0 1 12 4.4c6.4 0 10 7 10 7a18 18 0 0 1-3.2 4.2M6.5 6.6C3.7 8.4 2 11.4 2 11.4s3.6 6.6 10 6.6a9.9 9.9 0 0 0 3.4-.6" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      <path d="M2 2l20 20" />
    </svg>
  );
}

export function IconoCerebro({ tamano = 20 }: Props) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2.5A2.5 2.5 0 0 1 12 5v14a2.5 2.5 0 0 1-4.9.7A2.5 2.5 0 0 1 4 17.3 2.5 2.5 0 0 1 3.3 13 2.5 2.5 0 0 1 4 8.7 2.5 2.5 0 0 1 7.1 3.2a2.5 2.5 0 0 1 2.4-.7Z" />
      <path d="M14.5 2.5A2.5 2.5 0 0 0 12 5v14a2.5 2.5 0 0 0 4.9.7A2.5 2.5 0 0 0 20 17.3 2.5 2.5 0 0 0 20.7 13 2.5 2.5 0 0 0 20 8.7 2.5 2.5 0 0 0 16.9 3.2a2.5 2.5 0 0 0-2.4-.7Z" />
    </svg>
  );
}

export function IconoEdificio({ tamano = 18 }: Props) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="10" height="18" rx="1" />
      <rect x="14" y="9" width="6" height="12" rx="1" />
      <path d="M7 7h1M10 7h1M7 11h1M10 11h1M7 15h1M10 15h1" />
    </svg>
  );
}
