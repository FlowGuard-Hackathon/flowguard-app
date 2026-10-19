import Link from "next/link";

export default function PaginaInicio() {
  return (
    <>
      <h1>FlowGuard</h1>
      <p>Esqueleto inicial de la aplicación. Cada sección está pendiente de implementarse.</p>
      <p>
        <Link href="/probar-backend">→ Herramienta de desarrollo: probar el backend real</Link> (motor de
        reglas + agente de Dev 3, no es parte del producto final)
      </p>
    </>
  );
}
