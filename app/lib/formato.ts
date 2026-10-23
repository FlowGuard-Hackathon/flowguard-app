export function formatoMoneda(centavos: number): string {
  return (centavos / 100).toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

export function formatoFecha(iso: string): string {
  return new Date(iso).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });
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
