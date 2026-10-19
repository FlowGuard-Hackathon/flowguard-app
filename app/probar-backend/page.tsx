"use client";

import { useState } from "react";

// Página de DESARROLLO para probar el motor de reglas + agente reales desde
// el navegador, mientras /simulador (Dev 2) sigue siendo un placeholder.
// A propósito sin diseño: esto no es una pantalla del producto, es una
// herramienta de prueba. Se puede borrar cuando /simulador esté conectado
// al backend real con el contrato definitivo de contratos-api.md § 3.

type Resultado = {
  resultado: {
    ejecucion_id: string;
    decision: "PERMITIR" | "BLOQUEAR";
    resultados: Array<{ regla_id: string; estado: string; mensaje: string | null }>;
  };
  investigacion: {
    estado: "COMPLETADA" | "PARCIAL" | "FALLIDA";
    informe?: unknown;
    motivo?: string;
  };
};

export default function PaginaProbarBackend() {
  const [montoMxn, setMontoMxn] = useState(15000);
  const [categoria, setCategoria] = useState("OPERACIONES");
  const [solicitanteId, setSolicitanteId] = useState("USU-001");
  const [hayAprobacion, setHayAprobacion] = useState(false);
  const [aprobadorId, setAprobadorId] = useState("USU-002");
  const [factura, setFactura] = useState<"VERIFICADA" | "NO_VERIFICADA" | "INDISPONIBLE">("VERIFICADA");
  const [presupuestoMxn, setPresupuestoMxn] = useState<string>("25000");
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function probar() {
    setCargando(true);
    setError(null);
    setResultado(null);
    try {
      const respuesta = await fetch("/api/v1/ejecuciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pago: {
            pago_id: "PAG-PRUEBA-001",
            monto_centavos: Math.round(montoMxn * 100),
            moneda: "MXN",
            categoria,
            solicitante_id: solicitanteId,
            presupuesto_id: "PRE-PRUEBA-01",
          },
          contexto: {
            autorizacion: hayAprobacion
              ? {
                  estado_aprobacion: "APROBADO",
                  aprobador_id: aprobadorId,
                  aprobador_activo: true,
                  aprobador_tiene_permiso: true,
                }
              : null,
            factura: factura === "INDISPONIBLE" ? null : { estado: factura },
            presupuesto_disponible_centavos:
              presupuestoMxn.trim() === "" ? null : Math.round(Number(presupuestoMxn) * 100),
          },
        }),
      });
      if (!respuesta.ok) {
        const cuerpo = await respuesta.json().catch(() => ({}));
        throw new Error(cuerpo.error ?? `HTTP ${respuesta.status}`);
      }
      setResultado(await respuesta.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setCargando(false);
    }
  }

  return (
    <>
      <h1>Probar backend (herramienta de desarrollo)</h1>
      <p>
        Esta página NO es parte del producto. Llama de verdad a <code>evaluarPago()</code> (motor de
        reglas) y al agente de Dev 3, vía <code>POST /api/v1/ejecuciones</code> — una ruta de prueba,
        no el contrato final.
      </p>

      <fieldset style={{ display: "grid", gap: "0.5rem", maxWidth: 480 }}>
        <label>
          Monto (MXN):{" "}
          <input type="number" value={montoMxn} onChange={(e) => setMontoMxn(Number(e.target.value))} />
        </label>
        <label>
          Categoría:{" "}
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            <option value="OPERACIONES">OPERACIONES</option>
            <option value="SOFTWARE">SOFTWARE</option>
            <option value="VIAJES">VIAJES</option>
            <option value="OTRA">OTRA (debería fallar PAG-002)</option>
          </select>
        </label>
        <label>
          Solicitante ID: <input value={solicitanteId} onChange={(e) => setSolicitanteId(e.target.value)} />
        </label>
        <label>
          <input type="checkbox" checked={hayAprobacion} onChange={(e) => setHayAprobacion(e.target.checked)} />{" "}
          Hay una aprobación registrada
        </label>
        {hayAprobacion && (
          <label>
            Aprobador ID (distinto del solicitante para que pase PAG-003):{" "}
            <input value={aprobadorId} onChange={(e) => setAprobadorId(e.target.value)} />
          </label>
        )}
        <label>
          Factura:{" "}
          <select value={factura} onChange={(e) => setFactura(e.target.value as typeof factura)}>
            <option value="VERIFICADA">Verificada</option>
            <option value="NO_VERIFICADA">No verificada</option>
            <option value="INDISPONIBLE">Fuente no disponible (INDETERMINADO)</option>
          </select>
        </label>
        <label>
          Presupuesto disponible (MXN, vacío = no verificable):{" "}
          <input value={presupuestoMxn} onChange={(e) => setPresupuestoMxn(e.target.value)} />
        </label>
      </fieldset>

      <p>
        <button onClick={probar} disabled={cargando}>
          {cargando ? "Evaluando..." : "Evaluar pago"}
        </button>
      </p>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {resultado && (
        <>
          <h2>
            Decisión del motor: <strong>{resultado.resultado.decision}</strong>
          </h2>
          <ul>
            {resultado.resultado.resultados.map((r) => (
              <li key={r.regla_id}>
                {r.regla_id}: {r.estado} {r.mensaje ? `— ${r.mensaje}` : ""}
              </li>
            ))}
          </ul>
          <h2>Investigación del agente: {resultado.investigacion.estado}</h2>
          <pre style={{ background: "#f0f0f0", padding: "1rem", overflow: "auto" }}>
            {JSON.stringify(resultado.investigacion, null, 2)}
          </pre>
        </>
      )}
    </>
  );
}
