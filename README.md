# flowguard-app

Frontend monolítico de FlowGuard: Next.js, React y TypeScript. Contiene el panel de control, el simulador de pagos, el centro de evidencias y los Route Handlers de la API (`/api/v1/*`).

**Responsable principal:** Dev 2 (frontend y UX/UI).

## Guía rápida para agentes de IA y desarrolladores

Esta sección dice qué comandos ejecutar, qué resultado esperar y qué se puede o no se puede hacer. Si algo aquí contradice a [flowguard-docs](https://github.com/FlowGuard-Hackathon/flowguard-docs), manda `flowguard-docs`.

### 1. Requisitos

| Comprobación | Comando | Resultado esperado |
|---|---|---|
| Node.js | `node -v` | `v20.9.0` o superior (Next.js 16). Verificado con `v20.20.0` |
| npm | `npm -v` | Cualquier versión reciente (verificado con `10.8.2`) |

Stack: Next.js `^16.4.2` (App Router), React `^19.3.1`, TypeScript `^5.7.2`. Puerto por defecto: **3000**.

### 2. Comandos

Ejecútalos desde la raíz del repositorio. Funcionan igual en PowerShell, Git Bash y Linux/macOS, salvo donde se indica.

| Para... | Comando | Resultado esperado |
|---|---|---|
| Instalar dependencias | `npm install` | Termina sin errores y crea `node_modules/` y `package-lock.json`. **Requiere** que `../flowguard-src` exista como carpeta hermana y tenga su `dist/` compilado (`npm run build` allá) — ver § "Dependencia local: flowguard-src" |
| Desarrollar | `npm run dev` | Sirve en http://localhost:3000 con recarga en caliente. Se detiene con `Ctrl+C` |
| Comprobar tipos | `npm run typecheck` | Sin salida de error y código de salida 0 |
| Compilar | `npm run build` | Termina bien y lista las rutas `/`, `/panel`, `/evidencias`, `/simulador` y `/probar-backend` |
| Probar la versión compilada | `npm run start -- -p 3055` | Sirve en http://localhost:3055 (requiere `npm run build` antes) |
| Cambiar el puerto en desarrollo | `npm run dev -- -p 3055` | Sirve en http://localhost:3055 |

Comprobación rápida de que una página responde (PowerShell): `curl.exe -s -o NUL -w "%{http_code}" http://localhost:3055/panel` → `200`. En Git Bash o Linux: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3055/panel`.

No existen scripts de `lint`, `test` ni `e2e`. No los inventes ni los agregues sin acordarlo con Dev 2.

**Nota sobre Turbopack en Windows:** `dev` y `build` fuerzan `--webpack`. Turbopack (el bundler por defecto de Next 16) no resuelve el *junction* que crea `npm install` en Windows para dependencias locales (`file:../flowguard-src`): falla con `Module not found` aunque el paquete exista y esté bien formado. `--webpack` no tiene ese problema. Cuando `flowguard-src` y `flowguard-app` se integren en el repo combinado `flowguard` (sin dependencia `file:` cruzando carpetas), probablemente ya no haga falta — hay que volver a probar sin `--webpack` en ese momento.

### 3. Antes de dar una tarea por terminada

Ejecuta, en este orden, y ambos deben terminar sin errores:

```
npm run typecheck
npm run build
```

Una tarea no está terminada solo porque el código "debería funcionar": debe existir evidencia verificable ([definicion-de-terminado.md](https://github.com/FlowGuard-Hackathon/flowguard-docs/blob/main/definicion-de-terminado.md)).

### 4. Mapa de archivos

| Ruta | Qué es | Estado |
|---|---|---|
| `app/layout.tsx` | Layout raíz (`<html lang="es">`) + header | Diseño real de Dev 2 (colores, tema claro/oscuro vía `prefers-color-scheme`) |
| `app/componentes/Navegacion.tsx` | Nav con enlace activo resaltado (`usePathname()`) | De Dev 2 |
| `app/globals.css` | Variables de color, tipografía, estructura | De Dev 2 |
| `app/page.tsx` | Inicio | Placeholder + enlace a `/probar-backend` (herramienta de desarrollo) |
| `app/panel/page.tsx` | Panel de control | Placeholder, sin datos |
| `app/simulador/page.tsx` | Simulador de pagos | Placeholder, sin datos |
| `app/evidencias/page.tsx` | Centro de evidencias | Placeholder, sin datos |
| `app/probar-backend/page.tsx` | Formulario de desarrollo que llama al backend real | **No es parte del producto.** A propósito sin diseño. Se borra cuando `/simulador` se conecte con el contrato final |
| `app/api/v1/ejecuciones/route.ts` | Ruta de PRUEBA que llama a `flowguard-src` (motor + agente) | **No es el contrato final** de [contratos-api.md § 3](https://github.com/FlowGuard-Hackathon/flowguard-docs/blob/main/contratos-api.md#3-post-apiv1ejecuciones) — acepta el contexto confiable directo en el body porque no hay Supabase real todavía. Estado en memoria del proceso, se pierde al reiniciar |
| `app/api/v1/reglas/`, `salud/` | Route Handlers de la API | Carpetas vacías (`.gitkeep`). **No existen todavía** |
| `next.config.ts`, `tsconfig.json`, `package.json` | Configuración | `package.json` agrega `flowguard-src` como dependencia local (`file:../flowguard-src`) |

### 5. Qué hacer ahora (Dev 2, Bloque 1 del plan)

Orden y detalle en [desarrolladores/desarrollador-2/plan-trabajo.md](https://github.com/FlowGuard-Hackathon/flowguard-docs/blob/main/desarrolladores/desarrollador-2/plan-trabajo.md):

1. **Día 1, base de la app:** la estructura de layout ya está (header con nav compartida en `app/layout.tsx`, una sola región `<main>` por página). Falta el diseño visual definitivo (colores, tipografía, componentes) — `app/globals.css` hoy es solo reset + estructura, a propósito, para no invadir decisiones de Dev 2.
2. **Día 2, simulador con mocks:** construir el formulario de solicitud de pago según el contrato de pago de [contratos-api.md § 3](https://github.com/FlowGuard-Hackathon/flowguard-docs/blob/main/contratos-api.md#3-post-apiv1ejecuciones), consumiendo fixtures.
3. **Día 3, panel con mocks:** panel de ejecuciones con `mocks/pago-aprobado.json`, `mocks/pago-bloqueado.json` y `mocks/investigacion-fallida.json`.
4. **Día 4 en adelante:** conectar al backend real cuando Dev 1 publique `POST /api/v1/ejecuciones`.

**Bloqueo conocido:** las fixtures las publica Dev 5 en `flowguard-mocks` y **todavía no existen**. Mientras no existan, no inventes datos de ejemplo: deja el estado vacío y avisa a Dev 5.

### 6. Reglas obligatorias

- **No inventes** endpoints, campos, estados, códigos de error ni formatos de respuesta. La fuente de verdad es [contratos-api.md](https://github.com/FlowGuard-Hackathon/flowguard-docs/blob/main/contratos-api.md) y [catalogo-errores.md](https://github.com/FlowGuard-Hackathon/flowguard-docs/blob/main/catalogo-errores.md). Si falta algo, déjalo como pendiente y avisa; no lo supongas.
- **No muestres datos inventados** en la interfaz. Muestra solo lo que devuelve el backend o una fixture oficial, y distingue visualmente "conectado a mocks" de "conectado al backend real".
- **El frontend no decide.** No reimplementes las reglas PAG-001 a PAG-005 y nunca autorices ni bloquees un pago desde la interfaz: la decisión (`PERMITIR` o `BLOQUEAR`) viene del backend.
- **Nada de acceso directo a Supabase desde el navegador** ni claves privadas en código del cliente. Solo se leen datos a través de `/api/v1/*` ([seguridad.md § 2.0](https://github.com/FlowGuard-Hackathon/flowguard-docs/blob/main/seguridad.md#20-estrategia-de-seguridad-por-entorno)).
- **Estados de interfaz:** representa carga, error, vacío y éxito, según [arquitectura.md § 6.4](https://github.com/FlowGuard-Hackathon/flowguard-docs/blob/main/arquitectura.md#64-estados-de-interfaz).
- **No agregues** dependencias, frameworks, librerías de estilos, lint o pruebas sin acordarlo con Dev 2 y el equipo.
- **No modifiques** contratos, `flowguard-src`, SQL ni documentación técnica de otros puestos desde este repositorio.
- **Secretos:** nunca subas `.env` ni claves. `.gitignore` ya excluye `.env*`, `node_modules/`, `.next/` y `next-env.d.ts`.

### 7. Flujo de Git

- Nadie trabaja sobre `main`: crea una rama corta, abre un Pull Request y pide revisión a los responsables de los módulos afectados.
- No fusiones tu propio PR sin revisión.
- Mensajes de commit descriptivos, en español.
- Convención de este repositorio: no se añaden líneas `Co-Authored-By` ni menciones a herramientas de IA en commits ni en PRs.

## Alcance

Según [flowguard-docs/arquitectura.md § 3](https://github.com/FlowGuard-Hackathon/flowguard-docs/blob/main/arquitectura.md#3-estructura-del-repositorio), este repo corresponde a la carpeta `app/` de la estructura completa:

```
app/
├── panel/
├── simulador/
├── evidencias/
└── api/
    └── v1/
        ├── ejecuciones/
        ├── reglas/
        └── salud/
```

Los Route Handlers de `app/api/v1/` implementan los contratos definidos en [flowguard-docs/contratos-api.md](https://github.com/FlowGuard-Hackathon/flowguard-docs/blob/main/contratos-api.md) — ese documento es la fuente de verdad del contrato, no este README.

## Dependencia local: flowguard-src

Desde que existe `app/probar-backend/`, este repo depende de `flowguard-src` como paquete local: `"flowguard-src": "file:../flowguard-src"` en `package.json`. Requisitos para que funcione:

1. `flowguard-src` debe existir como carpeta **hermana** de `flowguard-app` (mismo padre), clonada con ese nombre exacto.
2. `flowguard-src` debe estar compilada: `cd ../flowguard-src && npm install && npm run build` (genera `dist/`, que es lo que este repo importa — nunca el `.ts` fuente directo). Si cambias algo en `flowguard-src`, hay que repetir `npm run build` allá y luego `npm install` aquí para que el *junction* de `node_modules/flowguard-src` quede al día (normalmente ni siquiera hace falta reinstalar, el *junction* apunta siempre al mismo `dist/`; alcanza con recompilar allá).
3. Ver la nota de la § 2 sobre por qué `dev`/`build` fuerzan `--webpack`.

Esto es temporal y de desarrollo: la integración definitiva pasa por el repo combinado `flowguard` (ver su README, pendiente de decisión de Dev 1 y Dev 2 sobre cómo conviven `app/` y `src/` ahí). Mientras tanto, `app/api/v1/ejecuciones/route.ts` y `app/probar-backend/` existen solo para poder probar el backend real desde el navegador.

## Dependencias de otros repos

- `flowguard-src`: motor de reglas, persistencia (en memoria todavía) y agente — consumido como dependencia local, ver arriba.
- `flowguard-mocks`: fixtures para trabajar sin el backend real (las publica Dev 5).
- `flowguard-docs`: especificación completa (arquitectura, contratos, seguridad, reglas).

## Estado actual

Esqueleto inicial de un proyecto Next.js (App Router) con React y TypeScript, **sin datos ni lógica**, listo para que Dev 2 empiece a trabajar siguiendo el Bloque 1 de [flowguard-docs/checklist-implementacion.md](https://github.com/FlowGuard-Hackathon/flowguard-docs/blob/main/checklist-implementacion.md).

Verificado con Node 20.20: `npm run typecheck` y `npm run build` pasan, y las páginas `/`, `/panel`, `/simulador`, `/evidencias` y `/probar-backend` responden 200. `/api/v1/salud` responde 404 porque el endpoint aún no existe. `/api/v1/ejecuciones` (`POST`) sí responde — ver § "Dependencia local: flowguard-src" — probado con `curl` contra un pago de $15,000 (resultado `BLOQUEAR` + informe `PARCIAL` del agente) y uno de $8,500 (resultado `PERMITIR` + informe `COMPLETADA`).

### Decisión pendiente (Dev 1 y Dev 2)

[flowguard-docs/arquitectura.md § 3](https://github.com/FlowGuard-Hackathon/flowguard-docs/blob/main/arquitectura.md#3-estructura-del-repositorio) describe un repo final `flowguard` con `app/` y `src/` en la raíz, integrados con `git subtree --prefix=app`. Este repo, igual que `flowguard-src`, trae su propio `package.json` en la raíz y la carpeta `app/` dentro, por lo que un `subtree` tal cual los anidaría (`app/app/...`). Cómo consume la app los contratos de `flowguard-src` y cómo se integran ambos en `flowguard` debe decidirse antes de la primera integración (recomendada no antes del día 6).
