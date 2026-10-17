import Link from "next/link";

export default function PaginaInicio() {
  return (
    <main>
      <h1>FlowGuard</h1>
      <p>Esqueleto inicial de la aplicación. Cada sección está pendiente de implementarse.</p>
      <nav>
        <ul>
          <li>
            <Link href="/panel">Panel de control</Link>
          </li>
          <li>
            <Link href="/simulador">Simulador de pagos</Link>
          </li>
          <li>
            <Link href="/evidencias">Centro de evidencias</Link>
          </li>
        </ul>
      </nav>
    </main>
  );
}
