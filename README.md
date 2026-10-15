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

Este repo todavía no tiene código; está preparado para que Dev 2 empiece a trabajar siguiendo el Bloque 1 de [flowguard-docs/implementation-checklist.md](https://github.com/FlowGuard-Hackathon/flowguard-docs/blob/main/implementation-checklist.md).
