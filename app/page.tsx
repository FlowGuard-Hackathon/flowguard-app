import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <h1>FlowGuard</h1>
      <p>Esqueleto inicial de la aplicación. Cada sección está pendiente de implementarse.</p>
      <nav>
        <ul>
          <li>
            <Link href="/dashboard">Panel de control</Link>
          </li>
          <li>
            <Link href="/simulator">Simulador de pagos</Link>
          </li>
          <li>
            <Link href="/evidence">Centro de evidencias</Link>
          </li>
        </ul>
      </nav>
    </main>
  );
}
