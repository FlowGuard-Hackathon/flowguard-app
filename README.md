# flowguard-app

Frontend monolítico de FlowGuard: Next.js, React y TypeScript. Contiene el panel de control, el simulador de pagos, el centro de evidencias y los Route Handlers de la API (`/api/v1/*`).

**Responsable principal:** Dev 2 (frontend y UX/UI).

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
- `flowguard-docs`: especificación completa (arquitectura, contratos, seguridad, reglas).

## Estado actual

Esqueleto inicial de un proyecto Next.js (App Router) con React y TypeScript, listo para que Dev 2 empiece a trabajar siguiendo el Bloque 1 de [flowguard-docs/implementation-checklist.md](https://github.com/FlowGuard-Hackathon/flowguard-docs/blob/main/implementation-checklist.md):

- Páginas placeholder, **sin datos ni lógica**: `app/page.tsx`, `app/dashboard/`, `app/simulator/` y `app/evidence/`.
- Carpetas vacías (con `.gitkeep`) para los Route Handlers: `app/api/v1/executions/`, `app/api/v1/rules/` y `app/api/v1/health/`. No se creó ningún endpoint: sus formatos de respuesta los define [api-contracts.md](https://github.com/FlowGuard-Hackathon/flowguard-docs/blob/main/api-contracts.md).
- No incluye lint, estilos, pruebas ni conexión a `flowguard-src`: son decisiones del puesto 2 y del equipo.

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm run build
```

Verificado al crear el esqueleto con Node 20.20: `npm run typecheck` y `npm run build` pasan, y las páginas `/`, `/dashboard`, `/simulator` y `/evidence` responden 200.

### Decisión pendiente (Dev 1 y Dev 2)

[flowguard-docs/architecture.md § 3](https://github.com/FlowGuard-Hackathon/flowguard-docs/blob/main/architecture.md#3-estructura-del-repositorio) describe un repo final `flowguard` con `app/` y `src/` en la raíz, integrados con `git subtree --prefix=app`. Este repo, igual que `flowguard-src`, trae su propio `package.json` en la raíz y la carpeta `app/` dentro, por lo que un `subtree` tal cual los anidaría (`app/app/...`). Cómo consume la app los contratos de `flowguard-src` y cómo se integran ambos en `flowguard` debe decidirse antes de la primera integración (recomendada no antes del día 6).
