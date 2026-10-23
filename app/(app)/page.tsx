import Link from "next/link";

export default function PaginaInicio() {
  return (
    <>
      <h1>FlowGuard</h1>
      <p className="descripcion-vista">
        Supervisa aprobaciones de pago, detecta infracciones de reglas y explica cada decisión con evidencia
        verificable.
      </p>
      <div className="cuadricula">
        <Link href="/panel" className="tarjeta">
          Panel de supervisión
        </Link>
        <Link href="/solicitudes" className="tarjeta">
          Solicitudes de pago
        </Link>
        <Link href="/simulador" className="tarjeta">
          Simulador de aprobación
        </Link>
        <Link href="/evidencias" className="tarjeta">
          Centro de evidencias
        </Link>
      </div>
    </>
  );
}
