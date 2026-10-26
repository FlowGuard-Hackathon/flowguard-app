import Benchmark from "../componentes/landing/Benchmark";
import Capacidades from "../componentes/landing/Capacidades";
import CasosDeUso from "../componentes/landing/CasosDeUso";
import ComoFunciona from "../componentes/landing/ComoFunciona";
import CTAFinal from "../componentes/landing/CTAFinal";
import DemoDeteccion from "../componentes/landing/DemoDeteccion";
import Encabezado from "../componentes/landing/Encabezado";
import FondoAmbiental from "../componentes/landing/FondoAmbiental";
import Hero from "../componentes/landing/Hero";
import Pie from "../componentes/landing/Pie";

export default function PaginaLanding() {
  return (
    <div className="lp">
      <FondoAmbiental />
      <Encabezado />
      <main>
        <Hero />
        <Capacidades />
        <DemoDeteccion />
        <Benchmark />
        <ComoFunciona />
        <CasosDeUso />
        <CTAFinal />
      </main>
      <Pie />
    </div>
  );
}
