import Revelar from "./Revelar";

export default function CTAFinal() {
  return (
    <section className="lp-seccion" style={{ borderTop: "none" }}>
      <div className="lp-contenedor">
        <Revelar>
          <div className="lp-cta-final">
            <div className="lp-cta-final-lineas" aria-hidden="true" />
            <span className="lp-sobretitulo">Antes de aprobar el siguiente pago</span>
            <h2>Pregúntale al motor antes de que sea una pérdida</h2>
            <p>
              Simula un escenario, revisa qué regla lo bloquearía y mira la evidencia que FlowGuard
              dejaría detrás de esa decisión.
            </p>
            <div className="lp-hero-acciones">
              <a href="/simulador" className="lp-boton lp-boton-primario">
                Abrir el simulador <span className="lp-flecha">→</span>
              </a>
              <a href="/panel" className="lp-boton lp-boton-secundario">
                Entrar al panel
              </a>
            </div>
            <p className="lp-cta-final-nota">Sin configuración adicional — corre sobre las reglas ya definidas.</p>
          </div>
        </Revelar>
      </div>
    </section>
  );
}
