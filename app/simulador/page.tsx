"use client";

import { useState } from "react";
import Link from "next/link";
import { claseChipDecision, claseChipEstadoRegla, claseChipInvestigacion } from "../lib/formato";

// Vista "Simulador de aprobación" (requisitos-vistas.md § 5). Llama a la ruta
// de prueba POST /api/v1/ejecuciones (ver app/api/v1/ejecuciones/route.ts):
// no es la ruta final de contratos-api.md § 3, así que este formulario envía
// el "contexto confiable" directo — algo que en producción nunca haría el
// cliente (el backend lo resolvería contra Supabase). Aviso visible abajo.

type ReglaResultado = {
  regla_id: string;
  estado: "CUMPLE" | "NO_CUMPLE" | "INDETERMINADO";
  observado: Record<string, unknown>;
  esperado: Record<string, unknown>;
  mensaje: string | null;
};

type RespuestaSimulacion = {
  resultado: { ejecucion_id: string; decision: "PERMITIR" | "BLOQUEAR"; resultados: ReglaResultado[] };
  investigacion: { estado: string; informe?: { investigacion: { titular: string; explicacion: string } } };
};

const valoresIniciales = {
  pagoId: "",
  montoMxn: "15000",
  categoria: "OPERACIONES",
  solicitanteId: "USU-001",
  presupuestoId: "PRE-OPERACIONES-01",
  presupuestoDisponibleMxn: "10000",
  facturaVerificada: "SI" as "SI" | "NO" | "SIN_VERIFICAR",
  existeAutorizacion: false,
  aprobadorId: "USU-002",
};

export default function PaginaSimulador() {
  const [form, setForm] = useState(valoresIniciales);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<RespuestaSimulacion | null>(null);

  function actualizar<K extends keyof typeof valoresIniciales>(campo: K, valor: (typeof valoresIniciales)[K]) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function evaluar(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError(null);
    setResultado(null);

    const cuerpo = {
      pago: {
        pago_id: form.pagoId || `PAG-SIM-${Date.now()}`,
        monto_centavos: Math.round(Number(form.montoMxn) * 100),
        moneda: "MXN",
        categoria: form.categoria,
        solicitante_id: form.solicitanteId,
        presupuesto_id: form.presupuestoId,
      },
      contexto: {
        autorizacion: form.existeAutorizacion
          ? {
              estado_aprobacion: "APROBADO",
              aprobador_id: form.aprobadorId,
              aprobador_activo: true,
              aprobador_tiene_permiso: true,
            }
          : null,
        factura: form.facturaVerificada === "SIN_VERIFICAR" ? null : { estado: form.facturaVerificada === "SI" ? "VERIFICADA" : "NO_VERIFICADA" },
        presupuesto_disponible_centavos:
          form.presupuestoDisponibleMxn === "" ? null : Math.round(Number(form.presupuestoDisponibleMxn) * 100),
      },
    };

    try {
      const res = await fetch("/api/v1/ejecuciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpo),
      });
      if (!res.ok) {
        const cuerpoError = await res.json().catch(() => null);
        throw new Error(cuerpoError?.error ?? `La API respondió ${res.status}`);
      }
      setResultado(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido al evaluar la solicitud.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <>
      <h1>Simulador de aprobación</h1>
      <div className="aviso">
        Prueba cómo FlowGuard evalúa una solicitud de pago. No se ejecuta ningún pago real, y esta ruta todavía no es
        la final del contrato (ver comentario en <code>app/api/v1/ejecuciones/route.ts</code>).
      </div>

      <form className="tarjeta" onSubmit={evaluar} style={{ marginBottom: "1.5rem" }}>
        <div className="formulario">
          <label className="campo">
            Identificador de pago (opcional)
            <input value={form.pagoId} onChange={(e) => actualizar("pagoId", e.target.value)} placeholder="se genera solo" />
          </label>
          <label className="campo">
            Importe (MXN)
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.montoMxn}
              onChange={(e) => actualizar("montoMxn", e.target.value)}
              required
            />
          </label>
          <label className="campo">
            Categoría
            <select value={form.categoria} onChange={(e) => actualizar("categoria", e.target.value)}>
              <option value="OPERACIONES">OPERACIONES</option>
              <option value="SOFTWARE">SOFTWARE</option>
              <option value="VIAJES">VIAJES</option>
            </select>
          </label>
          <label className="campo">
            Solicitante
            <input value={form.solicitanteId} onChange={(e) => actualizar("solicitanteId", e.target.value)} required />
          </label>
          <label className="campo">
            ID de presupuesto
            <input value={form.presupuestoId} onChange={(e) => actualizar("presupuestoId", e.target.value)} required />
          </label>
          <label className="campo">
            Presupuesto disponible (MXN)
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.presupuestoDisponibleMxn}
              onChange={(e) => actualizar("presupuestoDisponibleMxn", e.target.value)}
            />
          </label>
          <label className="campo">
            Factura verificada
            <select
              value={form.facturaVerificada}
              onChange={(e) => actualizar("facturaVerificada", e.target.value as typeof form.facturaVerificada)}
            >
              <option value="SI">Sí</option>
              <option value="NO">No</option>
              <option value="SIN_VERIFICAR">Sin verificar (indeterminado)</option>
            </select>
          </label>
          <label className="campo" style={{ flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="checkbox"
              checked={form.existeAutorizacion}
              onChange={(e) => actualizar("existeAutorizacion", e.target.checked)}
            />
            Existe autorización de supervisor
          </label>
          {form.existeAutorizacion && (
            <label className="campo">
              Aprobador
              <input value={form.aprobadorId} onChange={(e) => actualizar("aprobadorId", e.target.value)} />
            </label>
          )}
        </div>

        <p className="descripcion-vista" style={{ marginTop: "1rem" }}>
          Umbral de autorización de supervisor: $10,000 MXN (configuración del sistema).
        </p>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button type="submit" className="boton boton-primario" disabled={cargando}>
            {cargando ? "Evaluando…" : "Evaluar solicitud"}
          </button>
          <button type="button" className="boton boton-secundario" onClick={() => { setForm(valoresIniciales); setResultado(null); setError(null); }}>
            Limpiar formulario
          </button>
        </div>
      </form>

      {error && <p className="estado-error">{error}</p>}

      {resultado && (
        <div className="tarjeta">
          <h2 style={{ marginTop: 0 }}>
            Resultado: <span className={claseChipDecision(resultado.resultado.decision)}>{resultado.resultado.decision}</span>
          </h2>
          <p>
            ID de ejecución: <strong>{resultado.resultado.ejecucion_id}</strong> —{" "}
            <Link href={`/solicitudes/${resultado.resultado.ejecucion_id}`}>ver detalle completo</Link>
          </p>

          <table>
            <thead>
              <tr>
                <th>Estado</th>
                <th>Regla</th>
                <th>Observado</th>
                <th>Esperado</th>
              </tr>
            </thead>
            <tbody>
              {resultado.resultado.resultados.map((r) => (
                <tr key={r.regla_id}>
                  <td>
                    <span className={claseChipEstadoRegla(r.estado)}>{r.estado}</span>
                  </td>
                  <td>{r.regla_id}</td>
                  <td>
                    <code>{JSON.stringify(r.observado)}</code>
                  </td>
                  <td>
                    <code>{JSON.stringify(r.esperado)}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p style={{ marginTop: "1rem" }}>
            Investigación del agente: <span className={claseChipInvestigacion(resultado.investigacion.estado)}>{resultado.investigacion.estado}</span>
            {resultado.investigacion.informe && <> — {resultado.investigacion.informe.investigacion.titular}</>}
          </p>
        </div>
      )}
    </>
  );
}
