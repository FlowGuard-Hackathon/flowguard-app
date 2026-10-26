import Image from "next/image";

export default function Pie() {
  return (
    <footer className="lp-footer">
      <div className="lp-contenedor">
        <div className="lp-footer-grid">
          <div className="lp-footer-marca">
            <Image src="/logo-nombre.png" alt="FlowGuard" width={150} height={48} />
            <p>Supervisión determinista de aprobación de pagos, con evidencia verificable detrás de
              cada decisión.</p>
          </div>
          <div className="lp-footer-columnas">
            <div className="lp-footer-columna">
              <h4>Producto</h4>
              <ul>
                <li><a href="#capacidades">Capacidades</a></li>
                <li><a href="#deteccion">Detección en vivo</a></li>
                <li><a href="#benchmark">Benchmark</a></li>
              </ul>
            </div>
            <div className="lp-footer-columna">
              <h4>Entrar</h4>
              <ul>
                <li><a href="/panel">Panel de supervisión</a></li>
                <li><a href="/simulador">Simulador</a></li>
                <li><a href="/evidencias">Centro de evidencias</a></li>
              </ul>
            </div>
            <div className="lp-footer-columna">
              <h4>Explora</h4>
              <ul>
                <li><a href="#como-funciona">Cómo funciona</a></li>
                <li><a href="#casos-de-uso">Casos de uso</a></li>
                <li><a href="/historial">Historial de ejecuciones</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="lp-footer-pie">
          <span>FlowGuard — proyecto de demostración</span>
          <span>DETECT · VERIFY · PROTECT</span>
        </div>
      </div>
    </footer>
  );
}
