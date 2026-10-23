// Círculo con iniciales a partir de un identificador real (p. ej. "USU-001"),
// no de un nombre inventado: no hay datos de nombre de usuario en el modelo.
// Toma el prefijo (letras) + el número final, para que USU-001/002/003 no se
// vean todos iguales (las primeras 2 letras solas siempre dan "US").
export default function Avatar({ id }: { id: string }) {
  const letras = id.match(/[A-Z]/gi)?.[0] ?? "?";
  const numeros = id.match(/\d+/)?.[0];
  const iniciales = numeros ? `${letras}${numeros.slice(-1)}`.toUpperCase() : id.slice(0, 2).toUpperCase();
  return <span className="avatar">{iniciales}</span>;
}
