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
| Instalar dependencias | `npm install` | Termina sin errores y crea `node_modules/` y `package-lock.json` |
| Desarrollar | `npm run dev` | Sirve en http://localhost:3000 con recarga en caliente. Se detiene con `Ctrl+C` |
| Comprobar tipos | `npm run typecheck` | Sin salida de error y código de salida 0 |
| Compilar | `npm run build` | Termina bien y lista las rutas `/`, `/dashboard`, `/evidence` y `/simulator` |
| Probar la versión compilada | `npm run start -- -p 3055` | Sirve en http://localhost:3055 (requiere `npm run build` antes) |
| Cambiar el puerto en desarrollo | `npm run dev -- -p 3055` | Sirve en http://localhost:3055 |

Comprobación rápida de que una página responde (PowerShell): `curl.exe -s -o NUL -w "%{http_code}" http://localhost:3055/dashboard` → `200`. En Git Bash o Linux: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3055/dashboard`.

No existen scripts de `lint`, `test` ni `e2e`. No los inventes ni los agregues sin acordarlo con Dev 2.

### 3. Antes de dar una tarea por terminada

Ejecuta, en este orden, y ambos deben terminar sin errores:

```
npm run typecheck
npm run build
```

Una tarea no está terminada solo porque el código "debería funcionar": debe existir evidencia verificable ([definition-of-done.md](https://github.com/FlowGuard-Hackathon/flowguard-docs/blob/main/definition-of-done.md)).

### 4. Mapa de archivos

| Ruta | Qué es | Estado |
|---|---|---|
| `app/layout.tsx` | Layout raíz (`<html lang="es">`) | Existe |
| `app/page.tsx` | Inicio con enlaces a las tres secciones | Placeholder |
| `app/dashboard/page.tsx` | Panel de control | Placeholder, sin datos |
| `app/simulator/page.tsx` | Simulador de pagos | Placeholder, sin datos |
| `app/evidence/page.tsx` | Centro de evidencias | Placeholder, sin datos |
| `app/api/v1/executions/`, `rules/`, `health/` | Route Handlers de la API | Carpetas vacías (`.gitkeep`). **No existe ningún endpoint todavía** |
| `next.config.ts`, `tsconfig.json`, `package.json` | Configuración | Mínima |

### 5. Qué hacer ahora (Dev 2, Bloque 1 del plan)

Orden y detalle en [developers/developer-2/work-plan.md](https://github.com/FlowGuard-Hackathon/flowguard-docs/blob/main/developers/developer-2/work-plan.md):

1. **Día 1, base de la app:** el esqueleto ya está. Falta acordar la navegación y el layout definitivos.
2. **Día 2, simulador con mocks:** construir el formulario de solicitud de pago según el contrato de pago de [api-contracts.md § 3](https://github.com/FlowGuard-Hackathon/flowguard-docs/blob/main/api-contracts.md#3-post-apiv1executions), consumiendo fixtures.
3. **Día 3, dashboard con mocks:** panel de ejecuciones con `mocks/payment-approved.json`, `mocks/payment-blocked.json` y `mocks/investigation-failed.json`.
4. **Día 4 en adelante:** conectar al backend real cuando Dev 1 publique `POST /api/v1/executions`.

**Bloqueo conocido:** las fixtures las publica Dev 5 en `flowguard-mocks` y **todavía no existen**. Mientras no existan, no inventes datos de ejemplo: deja el estado vacío y avisa a Dev 5.

### 6. Reglas obligatorias

- **No inventes** endpoints, campos, estados, códigos de error ni formatos de respuesta. La fuente de verdad es [api-contracts.md](https://github.com/FlowGuard-Hackathon/flowguard-docs/blob/main/api-contracts.md) y [error-catalog.md](https://github.com/FlowGuard-Hackathon/flowguard-docs/blob/main/error-catalog.md). Si falta algo, déjalo como pendiente y avisa; no lo supongas.
- **No muestres datos inventados** en la interfaz. Muestra solo lo que devuelve el backend o una fixture oficial, y distingue visualmente "conectado a mocks" de "conectado al backend real".
- **El frontend no decide.** No reimplementes las reglas PAY-001 a PAY-005 y nunca autorices ni bloquees un pago desde la interfaz: la decisión (`ALLOW` o `BLOCK`) viene del backend.
- **Nada de acceso directo a Supabase desde el navegador** ni claves privadas en código del cliente. Solo se leen datos a través de `/api/v1/*` ([security.md § 2.0](https://github.com/FlowGuard-Hackathon/flowguard-docs/blob/main/security.md#20-estrategia-de-seguridad-por-entorno)).
- **Estados de interfaz:** representa carga, error, vacío y éxito, según [architecture.md § 6.4](https://github.com/FlowGuard-Hackathon/flowguard-docs/blob/main/architecture.md#64-estados-de-interfaz).
- **No agregues** dependencias, frameworks, librerías de estilos, lint o pruebas sin acordarlo con Dev 2 y el equipo.
- **No modifiques** contratos, `flowguard-src`, SQL ni documentación técnica de otros puestos desde este repositorio.
- **Secretos:** nunca subas `.env` ni claves. `.gitignore` ya excluye `.env*`, `node_modules/`, `.next/` y `next-env.d.ts`.

### 7. Flujo de Git

- Nadie trabaja sobre `main`: crea una rama corta, abre un Pull Request y pide revisión a los responsables de los módulos afectados.
- No fusiones tu propio PR sin revisión.
- Mensajes de commit descriptivos, en español.
- Convención de este repositorio: no se añaden líneas `Co-Authored-By` ni menciones a herramientas de IA en commits ni en PRs.

## Alcance

Según [flowguard-docs/architecture.md § 3](https://github.com/FlowGuard-Hackathon/flowguard-docs/blob/main/architecture.md#3-estructura-del-repositorio), este repo corresponde a la carpeta `app/` de la estructura completa:

```
app/
├── dashboard/
├── simulator/
├── evidence/
└── api/
    └── v1/
        ├── executions/
        ├── rules/
        └── health/
```

Los Route Handlers de `app/api/v1/` implementan los contratos definidos en [flowguard-docs/api-contracts.md](https://github.com/FlowGuard-Hackathon/flowguard-docs/blob/main/api-contracts.md) — ese documento es la fuente de verdad del contrato, no este README.

## Dependencias de otros repos

- `flowguard-src`: tipos y contratos compartidos (Zod), motor de reglas, cliente del agente.
- `flowguard-mocks`: fixtures para trabajar sin el backend real (las publica Dev 5).
- `flowguard-docs`: especificación completa (arquitectura, contratos, seguridad, reglas).

## Estado actual

Esqueleto inicial de un proyecto Next.js (App Router) con React y TypeScript, **sin datos ni lógica**, listo para que Dev 2 empiece a trabajar siguiendo el Bloque 1 de [flowguard-docs/implementation-checklist.md](https://github.com/FlowGuard-Hackathon/flowguard-docs/blob/main/implementation-checklist.md).

Verificado al crear el esqueleto con Node 20.20: `npm run typecheck` y `npm run build` pasan, y las páginas `/`, `/dashboard`, `/simulator` y `/evidence` responden 200. `/api/v1/health` responde 404 porque el endpoint aún no existe.

### Decisión pendiente (Dev 1 y Dev 2)

[flowguard-docs/architecture.md § 3](https://github.com/FlowGuard-Hackathon/flowguard-docs/blob/main/architecture.md#3-estructura-del-repositorio) describe un repo final `flowguard` con `app/` y `src/` en la raíz, integrados con `git subtree --prefix=app`. Este repo, igual que `flowguard-src`, trae su propio `package.json` en la raíz y la carpeta `app/` dentro, por lo que un `subtree` tal cual los anidaría (`app/app/...`). Cómo consume la app los contratos de `flowguard-src` y cómo se integran ambos en `flowguard` debe decidirse antes de la primera integración (recomendada no antes del día 6).
