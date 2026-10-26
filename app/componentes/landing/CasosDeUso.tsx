import { IconoCarpeta, IconoEdificio, IconoEscudo, IconoMoneda } from "../Icono";
import Revelar from "./Revelar";

const CASOS = [
  {
    Icono: IconoMoneda,
    regla: "PAG-002 · OPERACIONES",
    titulo: "Cuentas por pagar",
    texto: "Categoría, factura confirmada y presupuesto disponible, verificados antes de liberar el pago.",
  },
  {
    Icono: IconoEdificio,
    regla: "PAG-002 · SOFTWARE",
    titulo: "Compras de software",
    texto: "Licencias y suscripciones recurrentes se evalúan igual, sin trato preferente por repetirse.",
  },
  {
    Icono: IconoCarpeta,
    regla: "PAG-002 · VIAJES",
    titulo: "Viáticos y viajes",
    texto: "Separación de funciones: quien aprueba el viaje no puede ser quien lo solicitó.",
  },
  {
    Icono: IconoEscudo,
    regla: "Evidencia verificable",
    titulo: "Auditoría y cumplimiento",
    texto: "Cada decisión queda con su evidencia e informe de investigación, listos para revisar.",
  },
];

export default function CasosDeUso() {
  return (
    <section id="casos-de-uso" className="lp-seccion">
      <div className="lp-contenedor">
        <Revelar className="lp-seccion-cabecera">
          <span className="lp-sobretitulo">Casos de uso</span>
          <h2 className="lp-seccion-titulo">Útil para distintos equipos dentro de tu operación</h2>
          <p className="lp-seccion-texto">
            Las mismas 5 reglas deterministas, aplicadas a distintas categorías de gasto — PAG-002 limita
            las categorías permitidas a OPERACIONES, SOFTWARE y VIAJES, las reglas de ejemplo del MVP.
          </p>
        </Revelar>

        <div className="lp-casos-grid lp-casos-grid-4">
          {CASOS.map((caso, i) => (
            <Revelar key={caso.titulo} retraso={((i % 4) + 1) as 1 | 2 | 3 | 4}>
              <article className="lp-tarjeta-caso">
                <span className="lp-icono-capacidad lp-icono-capacidad-chico">
                  <caso.Icono tamano={17} />
                </span>
                <span className="lp-tarjeta-caso-regla">{caso.regla}</span>
                <h3>{caso.titulo}</h3>
                <p>{caso.texto}</p>
              </article>
            </Revelar>
          ))}
        </div>
      </div>
    </section>
  );
}
