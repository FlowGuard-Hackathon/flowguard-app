import Link from "next/link";
import { IconoBuscar, IconoEscudo } from "../Icono";
import { IconoCapas, IconoChip } from "./IconoLanding";
import Revelar from "./Revelar";

const CAPACIDADES = [
  {
    href: "/panel",
    Icono: IconoBuscar,
    titulo: "Supervisión de pagos",
    texto: "Analiza cada solicitud en tiempo real y detecta patrones y desviaciones frente a las reglas vigentes.",
  },
  {
    href: "/simulador",
    Icono: IconoEscudo,
    titulo: "Validación determinista",
    texto: "Aplica las 5 reglas de negocio verificables; el motor decide, nunca un criterio subjetivo.",
  },
  {
    href: "/evidencias",
    Icono: IconoChip,
    titulo: "Investigación con IA",
    texto: "La IA busca y analiza evidencia relevante para explicar cada bloqueo con contexto claro.",
  },
  {
    href: "/historial",
    Icono: IconoCapas,
    titulo: "Trazabilidad completa",
    texto: "Conserva decisión, evidencia y estado de investigación de cada ejecución, listos para auditoría.",
  },
];

export default function Capacidades() {
  return (
    <section id="capacidades" className="lp-seccion">
      <div className="lp-contenedor">
        <Revelar className="lp-seccion-cabecera lp-seccion-cabecera-fila">
          <div>
            <span className="lp-sobretitulo">Capacidades</span>
            <h2 className="lp-seccion-titulo">Capacidades que protegen tu operación financiera</h2>
            <p className="lp-seccion-texto">Una plataforma diseñada para supervisar cada decisión con reglas verificables y evidencia a la mano.</p>
          </div>
          <Link href="/panel" className="lp-enlace-seccion">
            Conoce todas las funcionalidades <span className="lp-flecha">→</span>
          </Link>
        </Revelar>

        <div className="lp-capacidades-grid lp-capacidades-grid-pareja">
          {CAPACIDADES.map(({ href, Icono, titulo, texto }, i) => (
            <Revelar key={href} retraso={((i % 4) + 1) as 1 | 2 | 3 | 4}>
              <Link href={href} className="lp-tarjeta-capacidad">
                <span className="lp-icono-capacidad">
                  <Icono tamano={20} />
                </span>
                <h3>{titulo}</h3>
                <p>{texto}</p>
              </Link>
            </Revelar>
          ))}
        </div>
      </div>
    </section>
  );
}
