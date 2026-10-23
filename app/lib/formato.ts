export function formatoMoneda(centavos: number): string {
  return (centavos / 100).toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

export function formatoFecha(iso: string): string {
  return new Date(iso).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });
}

// Fecha y hora por separado (celda de dos líneas en tablas), misma fuente
// que formatoFecha — no son valores distintos, solo partidos en dos líneas.
export function formatoFechaCorta(iso: string): string {
  return new Date(iso).toLocaleDateString("es-MX", { dateStyle: "medium" });
}
export function formatoHora(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-MX", { timeStyle: "short" });
}

export function claseChipDecision(decision: "PERMITIR" | "BLOQUEAR"): string {
  return decision === "PERMITIR" ? "chip chip-permitir" : "chip chip-bloquear";
}

export function claseChipEstadoRegla(estado: "CUMPLE" | "NO_CUMPLE" | "INDETERMINADO"): string {
  if (estado === "CUMPLE") return "chip chip-permitir";
  if (estado === "NO_CUMPLE") return "chip chip-bloquear";
  return "chip chip-indeterminado";
}

export function claseChipInvestigacion(estado: string): string {
  if (estado === "COMPLETADA") return "chip chip-permitir";
  if (estado === "FALLIDA") return "chip chip-bloquear";
  if (estado === "PARCIAL" || estado === "PENDIENTE" || estado === "EN_CURSO") return "chip chip-indeterminado";
  return "chip chip-neutro";
}

// Tiempo relativo real (no fabricado): a partir de creado_en.
export function formatoTiempoRelativo(iso: string): string {
  const minutos = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutos < 1) return "hace un momento";
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.round(horas / 24);
  return `hace ${dias} d`;
}

export const NOMBRE_REGLA: Record<string, string> = {
  "PAG-001": "Autorización de supervisor",
  "PAG-002": "Categoría permitida",
  "PAG-003": "Separación de funciones",
  "PAG-004": "Factura verificada",
  "PAG-005": "Presupuesto disponible",
};

// Qué verifica cada regla, independiente de si esta ejecución la cumplió o
// no (a diferencia de `motivoRegla`, que sí depende del resultado real).
export const DESCRIPCION_REGLA: Record<string, string> = {
  "PAG-001": "Los pagos por encima del umbral deben tener autorización de un supervisor.",
  "PAG-002": "La categoría del gasto debe estar dentro de las categorías permitidas por la política.",
  "PAG-003": "El aprobador debe ser una persona distinta del solicitante cuando el monto lo requiere.",
  "PAG-004": "Debe existir una factura confirmada para la solicitud.",
  "PAG-005": "El monto no debe superar el saldo disponible del presupuesto.",
};

type ResultadoRegla = {
  regla_id: string;
  estado: "CUMPLE" | "NO_CUMPLE" | "INDETERMINADO";
  observado: Record<string, unknown>;
  esperado: Record<string, unknown>;
  mensaje: string | null;
};

// Traduce observado/esperado a una frase legible, sin mostrar JSON crudo.
// El motor (flowguard-src/motor.ts) ya genera `mensaje` para NO_CUMPLE e
// INDETERMINADO — eso se usa tal cual (es dato real, no se reescribe). Solo
// CUMPLE llega sin mensaje (motor.ts no genera uno para "todo bien"), así
// que aquí se redacta a partir de observado/esperado reales de esa regla,
// nunca de datos inventados.
export function motivoRegla(r: ResultadoRegla): string {
  if (r.mensaje) return r.mensaje;
  switch (r.regla_id) {
    case "PAG-001":
      return "estado_aprobacion" in r.observado
        ? "El importe supera el umbral, pero cuenta con una autorización de supervisor válida."
        : "El importe no supera el umbral que exige autorización de supervisor.";
    case "PAG-002":
      return `La categoría "${r.observado.categoria}" está permitida por la política configurada.`;
    case "PAG-003":
      return r.esperado.aprobador_requerido_por_monto === false
        ? "Este monto no requiere separación de funciones adicional."
        : "El aprobador registrado es distinto del solicitante, como exige la política.";
    case "PAG-004":
      return "La factura asociada fue verificada.";
    case "PAG-005":
      return "El monto no supera el saldo disponible del presupuesto.";
    default:
      return "La regla se evaluó conforme a la política configurada.";
  }
}

export const ETIQUETA_TIPO_EVIDENCIA: Record<string, string> = {
  REGISTRO_APROBACION: "Autorización de supervisor",
  REGISTRO_CATEGORIA: "Registro de categoría",
  REGISTRO_FACTURA: "Verificación de factura",
  SALDO_PRESUPUESTO: "Saldo de presupuesto",
};

// Resumen final de la decisión (banner de cierre), derivado de las reglas
// reales de esta ejecución — nunca de un texto fijo (reglas.md: INDETERMINADO
// bloquea igual que NO_CUMPLE, así que ambas cuentan como "problemáticas").
export function resumenDecision(decision: "PERMITIR" | "BLOQUEAR", reglas: ResultadoRegla[]): string {
  if (decision === "PERMITIR") {
    return "La evaluación determinista permitió continuar con esta solicitud. Esto no confirma que el pago ya se haya ejecutado.";
  }
  const problematicas = reglas.filter((r) => r.estado !== "CUMPLE");
  const otras = reglas.length - problematicas.length;
  const unica = problematicas.length === 1 ? problematicas[0] : undefined;
  const detalle = unica
    ? `la regla ${unica.regla_id} ${unica.estado === "INDETERMINADO" ? "no se pudo verificar" : "no se cumplió"}`
    : `las reglas ${problematicas.map((r) => r.regla_id).join(", ")} no se cumplieron o no se pudieron verificar`;
  const cola = otras > 0 ? ` Las demás ${otras} ${otras === 1 ? "regla se evaluó" : "reglas se evaluaron"} correctamente.` : "";
  return `La solicitud fue bloqueada debido a que ${detalle}.${cola}`;
}
