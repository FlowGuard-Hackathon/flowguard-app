import { FuenteDatosMemoria, FuenteDatosPostgres, FuenteDatosSupabase, type FuenteDatosEjecuciones, type InstantaneaPolitica } from "flowguard-src";

// ATENCIÓN: NO es persistencia final (contratos-api.md § 3) salvo en el modo
// "supabase" (ver abajo). Con DATABASE_URL definido (docker-compose.yml,
// servicio `db`) sin SUPABASE_DB_URL, los datos sobreviven a un reinicio de
// `npm run dev` pero contra un esquema simplificado — ver docker/init.sql.
// Compartido por las rutas de la API y por las páginas (Server Components)
// para que todas vean las mismas ejecuciones.
//
// Tres modos, elegidos por variables de entorno (de más a menos real):
// 1. SUPABASE_DB_URL definida: FuenteDatosSupabase contra el esquema real de
//    flowguard-supabase/migrations (idempotencia real, investigación
//    asíncrona con worker, rate limiting) — ver flowguard-src/src/servidor/
//    persistencia/fuenteDatosSupabase.ts. Requiere que esa migración (001 +
//    002) esté aplicada en el Postgres al que apunta (docker/init.sql ya la
//    aplica para el Postgres local de docker-compose.yml).
// 2. DATABASE_URL definida (sin SUPABASE_DB_URL): FuenteDatosPostgres, el
//    esquema simplificado histórico (sin idempotencia real ni worker).
// 3. Ninguna de las dos: FuenteDatosMemoria, se pierde al reiniciar.
//
// Se guarda en `globalThis` y no en una simple constante de módulo: Next.js
// compila cada route.ts y cada page.tsx como su propio paquete, así que un
// `export const almacen = new FuenteDatosMemoria()` normal termina creando
// una instancia distinta por cada archivo que lo importa (se comprobó: la
// lista, que vive en el mismo route.ts que el POST, sí veía los datos; el
// detalle, en otro archivo, no). `globalThis` es lo único realmente único
// por proceso de Node, sin importar cuántos paquetes separados lo importen.

export type TipoAlmacen = "supabase" | "postgres_simple" | "memoria";

function crearAlmacen(): { almacen: FuenteDatosEjecuciones; tipo: TipoAlmacen } {
  if (process.env.SUPABASE_DB_URL) {
    return { almacen: new FuenteDatosSupabase(process.env.SUPABASE_DB_URL), tipo: "supabase" };
  }
  if (process.env.DATABASE_URL) {
    return { almacen: new FuenteDatosPostgres(process.env.DATABASE_URL), tipo: "postgres_simple" };
  }
  return { almacen: new FuenteDatosMemoria(), tipo: "memoria" };
}

const g = globalThis as unknown as { __flowguardAlmacen?: { almacen: FuenteDatosEjecuciones; tipo: TipoAlmacen } };
const instancia = g.__flowguardAlmacen ?? (g.__flowguardAlmacen = crearAlmacen());

export const almacen: FuenteDatosEjecuciones = instancia.almacen;
export const tipoAlmacen: TipoAlmacen = instancia.tipo;

// Ámbito de unicidad de la idempotencia (contratos-api.md § 2.2). Un solo
// escenario de demo por ahora — igual que arquitectura.md § "Decisiones que
// deben quedar congeladas el día 1".
export const ESCENARIO_ID = "aprobacion-pago-v1";

export const politica: InstantaneaPolitica = {
  version_politica: "politica-pagos-v1",
  version_motor: "1.0.0",
  "PAG-001": { umbral_aprobacion_centavos: 1_000_000 }, // $10,000 MXN
  "PAG-002": { categorias_permitidas: ["OPERACIONES", "SOFTWARE", "VIAJES"] },
};
