"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { IconoAlerta, IconoCheck, IconoDocumento, IconoInfo, IconoLimpiar, IconoX } from "../../componentes/Icono";
import { ETIQUETA_TIPO_EVIDENCIA, NOMBRE_REGLA } from "../../lib/formato";

// Vista "Simulador de aprobación" (requisitos-vistas.md § 5). Llama a la ruta
// de prueba POST /api/v1/ejecuciones (ver app/api/v1/ejecuciones/route.ts):
// no es la ruta final de contratos-api.md § 3, así que este formulario envía
// el "contexto confiable" directo — algo que en producción nunca haría el
// cliente (el backend lo resolvería contra Supabase).
//
// El modelo real (DatosPago/ContextoConfiable en flowguard-src) no tiene
// "proveedor", "concepto" ni "identificador de factura" — solo los campos
// de abajo. No se agregan campos que el backend no admite.

type ReglaResultado = {
  regla_id: string;
  estado: "CUMPLE" | "NO_CUMPLE" | "INDETERMINADO";
  observado: Record<string, unknown>;
  esperado: Record<string, unknown>;
  mensaje: string | null;
  refs_evidencia: string[];
};

type RespuestaSimulacion = {
  resultado: { ejecucion_id: string; decision: "PERMITIR" | "BLOQUEAR"; resultados: ReglaResultado[] };
  investigacion: { estado: string; informe?: { investigacion: { titular: string; explicacion: string } } };
};

type RegistroEvidencia = { ref_evidencia: string; tipo_evidencia: string; origen: string; contenido: Record<string, unknown> };

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

function buscarRegla(resultados: ReglaResultado[], ref: string): ReglaResultado | undefined {
  return resultados.find((r) => r.refs_evidencia.includes(ref));
}

// "Verificado"/"No disponible" se deriva del resultado real de la regla que
// generó esa evidencia (crearEjecucion.ts: construirEvidenciaParaRegla), no
// de un indicador aparte — no existe un servicio externo que confirme nada.
function estadoEvidencia(regla: ReglaResultado | undefined): { texto: string; clase: string } {
  if (!regla) return { texto: "Sin regla asociada", clase: "neutro" };
  if (regla.estado === "CUMPLE") return { texto: "Verificado", clase: "permitir" };
  if (regla.estado === "INDETERMINADO") return { texto: "No disponible", clase: "indeterminado" };
  return { texto: "No verificada", clase: "bloquear" };
}

export default function PaginaSimulador() {
  const [form, setForm] = useState(valoresIniciales);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<RespuestaSimulacion | null>(null);
  const [evidencias, setEvidencias] = useState<RegistroEvidencia[] | null>(null);
  const [evaluadoEn, setEvaluadoEn] = useState<string | null>(null);
  const [desactualizado, setDesactualizado] = useState(false);

  function actualizar<K extends keyof typeof valoresIniciales>(campo: K, valor: (typeof valoresIniciales)[K]) {
    setForm((f) => ({ ...f, [campo]: valor }));
    if (resultado) setDesactualizado(true);
  }

  function limpiar() {
    setForm(valoresIniciales);
    setResultado(null);
    setEvidencias(null);
    setEvaluadoEn(null);
    setError(null);
    setDesactualizado(false);
  }

  async function evaluar(e: FormEvent) {
    e.preventDefault();
    if (cargando) return;
    setCargando(true);
    setError(null);

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
      const cuerpoRespuesta: RespuestaSimulacion = await res.json();
      setResultado(cuerpoRespuesta);
      setEvaluadoEn(new Date().toISOString());
      setDesactualizado(false);

      // Evidencias: la ruta de evaluación (POST) no las devuelve, solo los
      // refs — se reutiliza la ruta de lectura que ya existe
      // (GET /api/v1/ejecuciones/[id]/evidencias) en vez de duplicar esa
      // consulta a mano contra el almacén.
      const resEvidencias = await fetch(`/api/v1/ejecuciones/${cuerpoRespuesta.resultado.ejecucion_id}/evidencias`);
      if (resEvidencias.ok) {
        const cuerpoEvidencias = await resEvidencias.json();
        setEvidencias(cuerpoEvidencias.registros_evidencia ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido al evaluar la solicitud.");
    } finally {
      setCargando(false);
    }
  }

  const bloqueada = resultado?.resultado.decision === "BLOQUEAR";

  return (
    <>
      <h1>Simulador de aprobación</h1>
      <div className="aviso aviso-info">
        <IconoInfo tamano={18} />
        Prueba cómo FlowGuard evalúa una solicitud de pago. No se transfiere dinero ni se ejecuta ningún pago real.
      </div>

      <div className="simulador-grid">
        <form className="tarjeta simulador-formulario" onSubmit={evaluar}>
          <h2 style={{ marginTop: 0, marginBottom: "0.2rem" }}>Datos de la solicitud</h2>
          <p className="descripcion-vista" style={{ marginBottom: "1.25rem" }}>
            Completa la información para simular la evaluación de reglas.
          </p>

          <div className="formulario">
            <label className="campo">
              Solicitante
              <input value={form.solicitanteId} onChange={(e) => actualizar("solicitanteId", e.target.value)} required disabled={cargando} />
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
                disabled={cargando}
              />
            </label>
            <label className="campo">
              Categoría
              <select value={form.categoria} onChange={(e) => actualizar("categoria", e.target.value)} disabled={cargando}>
                <option value="OPERACIONES">OPERACIONES</option>
                <option value="SOFTWARE">SOFTWARE</option>
                <option value="VIAJES">VIAJES</option>
              </select>
            </label>
            <label className="campo">
              Identificador de pago (opcional)
              <input value={form.pagoId} onChange={(e) => actualizar("pagoId", e.target.value)} placeholder="se genera solo" disabled={cargando} />
            </label>
            <label className="campo">
              ID de presupuesto
              <input value={form.presupuestoId} onChange={(e) => actualizar("presupuestoId", e.target.value)} required disabled={cargando} />
            </label>
            <label className="campo">
              Presupuesto disponible (MXN)
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.presupuestoDisponibleMxn}
                onChange={(e) => actualizar("presupuestoDisponibleMxn", e.target.value)}
                disabled={cargando}
              />
            </label>
            <label className="campo">
              Factura verificada
              <select
                value={form.facturaVerificada}
                onChange={(e) => actualizar("facturaVerificada", e.target.value as typeof form.facturaVerificada)}
                disabled={cargando}
              >
                <option value="SI">Sí</option>
                <option value="NO">No</option>
                <option value="SIN_VERIFICAR">Sin verificar (indeterminado)</option>
              </select>
            </label>
            <label className="campo campo-checkbox campo-ancho-completo">
              <input
                type="checkbox"
                checked={form.existeAutorizacion}
                onChange={(e) => actualizar("existeAutorizacion", e.target.checked)}
                disabled={cargando}
              />
              Existe autorización de supervisor
            </label>
            {form.existeAutorizacion && (
              <label className="campo">
                Aprobador
                <input value={form.aprobadorId} onChange={(e) => actualizar("aprobadorId", e.target.value)} disabled={cargando} />
              </label>
            )}
          </div>

          <p className="descripcion-vista" style={{ marginTop: "1.1rem", marginBottom: "1.1rem" }}>
            Umbral de autorización de supervisor: $10,000 MXN (configuración del sistema).
          </p>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button type="submit" className="boton boton-primario" disabled={cargando}>
              <IconoCheck tamano={16} />
              {cargando ? "Evaluando…" : "Evaluar solicitud"}
            </button>
            <button type="button" className="boton boton-secundario" onClick={limpiar} disabled={cargando}>
              <IconoLimpiar tamano={16} />
              Limpiar formulario
            </button>
          </div>
        </form>

        <div className="tarjeta simulador-resultado">
          <h2 style={{ marginTop: 0 }}>Resultado de la simulación</h2>

          {error ? (
            <div className="panel-error">
              <IconoAlerta tamano={20} />
              <div>
                <h3>Error al evaluar la solicitud</h3>
                <p>{error}</p>
              </div>
            </div>
          ) : !resultado ? (
            <div className="panel-resultado-vacio">
              <IconoDocumento tamano={32} />
              <h3>Sin evaluación</h3>
              <p>Completa los datos y selecciona &quot;Evaluar solicitud&quot; para consultar el resultado.</p>
            </div>
          ) : (
            <>
              {desactualizado && (
                <p className="resultado-desactualizado">
                  <IconoAlerta tamano={14} />
                  Los datos del formulario cambiaron — este resultado corresponde a la evaluación anterior.
                </p>
              )}

              <span className={`insignia-estado ${bloqueada ? "insignia-bloquear" : "insignia-permitir"}`}>
                {bloqueada ? <IconoX tamano={14} /> : <IconoCheck tamano={14} />}
                {resultado.resultado.decision}
              </span>
              <p className="descripcion-vista" style={{ margin: "0.6rem 0 0" }}>
                {bloqueada
                  ? "La solicitud no cumple con una o más reglas de negocio. No se puede autorizar el pago."
                  : "Las reglas deterministas permitieron continuar con esta solicitud. Esto no confirma que el pago ya se haya ejecutado."}
              </p>

              <div className="resultado-meta">
                <span className="resultado-meta-item">
                  ID de ejecución: <strong>{resultado.resultado.ejecucion_id}</strong>
                </span>
                {evaluadoEn && (
                  <span className="resultado-meta-item">
                    Fecha: <strong>{new Date(evaluadoEn).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })}</strong>
                  </span>
                )}
              </div>
              <p style={{ marginTop: "-0.4rem", marginBottom: "1.1rem" }}>
                <Link href={`/solicitudes/${resultado.resultado.ejecucion_id}`}>Ver detalle completo</Link>
              </p>

              <h3 className="simulador-subtitulo">Evaluación de reglas</h3>
              {resultado.resultado.resultados.map((r) => (
                <div
                  key={r.regla_id}
                  className={`fila-regla-sim ${r.estado === "NO_CUMPLE" ? "bloquear" : r.estado === "INDETERMINADO" ? "indeterminado" : ""}`}
                >
                  <span className={`celda-estado-regla ${r.estado === "CUMPLE" ? "permitir" : r.estado === "NO_CUMPLE" ? "bloquear" : "indeterminado"}`}>
                    {r.estado === "CUMPLE" ? <IconoCheck tamano={14} /> : r.estado === "NO_CUMPLE" ? <IconoX tamano={14} /> : <IconoAlerta tamano={14} />}
                  </span>
                  <div className="fila-regla-sim-info">
                    <span className="fila-regla-sim-id">{r.regla_id}</span>
                    <span className="fila-regla-sim-nombre">{NOMBRE_REGLA[r.regla_id] ?? r.regla_id}</span>
                  </div>
                  <span className={`chip ${r.estado === "CUMPLE" ? "chip-permitir" : r.estado === "NO_CUMPLE" ? "chip-bloquear" : "chip-indeterminado"}`}>
                    {r.estado}
                  </span>
                </div>
              ))}

              <h3 className="simulador-subtitulo">Evidencias utilizadas</h3>
              {evidencias === null ? (
                <p className="estado-vacio" style={{ padding: "0.5rem 0" }}>Cargando evidencias…</p>
              ) : evidencias.length === 0 ? (
                <p className="estado-vacio" style={{ padding: "0.5rem 0" }}>Esta ejecución no generó registros de evidencia.</p>
              ) : (
                <ul className="lista-evidencias-sim">
                  {evidencias.map((ev) => {
                    const regla = buscarRegla(resultado.resultado.resultados, ev.ref_evidencia);
                    const estado = estadoEvidencia(regla);
                    return (
                      <li key={ev.ref_evidencia} className="evidencia-sim-fila">
                        <IconoDocumento tamano={16} />
                        <div className="evidencia-sim-info">
                          <span className="evidencia-sim-tipo">{ETIQUETA_TIPO_EVIDENCIA[ev.tipo_evidencia] ?? ev.tipo_evidencia}</span>
                          <span className="evidencia-sim-desc">Regla {regla?.regla_id ?? "—"} · {ev.ref_evidencia}</span>
                        </div>
                        <span className={`chip chip-${estado.clase === "permitir" ? "permitir" : estado.clase === "bloquear" ? "bloquear" : estado.clase === "indeterminado" ? "indeterminado" : "neutro"}`}>
                          {estado.texto}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
