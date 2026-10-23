import { FuenteDatosMemoria, FuenteDatosPostgres, type FuenteDatosEjecuciones, type InstantaneaPolitica } from "flowguard-src";

// ATENCIÓN: NO es persistencia final (contratos-api.md § 3), aunque con
// DATABASE_URL definido (docker-compose.yml, servicio `db`) los datos sí
// sobreviven a un reinicio de `npm run dev` — ver docker/init.sql para por
// qué ese esquema no es todavía el de flowguard-supabase/migrations.
// Compartido por las rutas de la API y por las páginas (Server Components)
// para que todas vean las mismas ejecuciones.
//
// Se guarda en `globalThis` y no en una simple constante de módulo: Next.js
// compila cada route.ts y cada page.tsx como su propio paquete, así que un
// `export const almacen = new FuenteDatosMemoria()` normal termina creando
// una instancia distinta por cada archivo que lo importa (se comprobó: la
// lista, que vive en el mismo route.ts que el POST, sí veía los datos; el
// detalle, en otro archivo, no). `globalThis` es lo único realmente único
// por proceso de Node, sin importar cuántos paquetes separados lo importen.
const g = globalThis as unknown as { __flowguardAlmacen?: FuenteDatosEjecuciones };
export const almacen: FuenteDatosEjecuciones =
  g.__flowguardAlmacen ??
  (g.__flowguardAlmacen = process.env.DATABASE_URL
    ? new FuenteDatosPostgres(process.env.DATABASE_URL)
    : new FuenteDatosMemoria());

export const politica: InstantaneaPolitica = {
  version_politica: "politica-pagos-v1",
  version_motor: "1.0.0",
  "PAG-001": { umbral_aprobacion_centavos: 1_000_000 }, // $10,000 MXN
  "PAG-002": { categorias_permitidas: ["OPERACIONES", "SOFTWARE", "VIAJES"] },
};
