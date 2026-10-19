# Galapavet — web del centro veterinario

Web de **Galapavet**, centro veterinario de Galapagar (Madrid): una landing one-page más las páginas Campañas, Blog y Tienda. Es un sitio estático: sin backend, sin pasarela de pago y sin CMS. Publicada en https://cenit-digital.github.io/GalapavetClinicaVeterinaria/

## Stack

- **App:** pnpm + Vite + React 19 + react-router + TypeScript + SCSS Modules.
- **Calidad:** Vitest + Testing Library, Playwright + axe (navegador real y accesibilidad), oxlint y StrykerJS (mutación).
- **Requisitos:** Node ^20.19 o >=22.12 y pnpm (la versión exacta, en `packageManager` de `package.json`).

## Arranque rápido

```
pnpm install
pnpm dev
```

| Comando | Para qué |
| --- | --- |
| `pnpm run verificar` | oxlint y comprobación de tipos |
| `pnpm run test` | tests unitarios y de componentes (Vitest) |
| `pnpm run test:e2e` | navegador real y axe (Playwright); construye el sitio y lo sirve en el puerto 4173, que debe estar libre. La primera vez: `pnpm exec playwright install --only-shell chromium` |
| `pnpm run build` | compilación de producción con la base de GitHub Pages |
| `pnpm run mutate` | prueba de mutación (StrykerJS) |
| `bin/harness init` | verifica el entorno y el arnés (`bin\harness.ps1 init` en Windows); tarda unos 4-5 minutos y, en un clon limpio, necesita antes `pnpm run build` |

## Cómo se trabaja

Este repo es un derivado de la plantilla de desarrollo guiado por especificaciones (SSD) de Cenit Digital, [TemplateSSDUncleBob](https://github.com/Cenit-Digital/TemplateSSDUncleBob), en la versión v0.4.0. En corto:

- Cada tarea tiene un nivel (trivial, pequeño, estándar o crítico) que decide cuánto proceso lleva.
- La persona aprueba el plan antes de implementar.
- El diff se revisa en local antes de cualquier `git push`.
- Un tema por tarea y un PR pequeño.

El texto completo es la «Política de trabajo» de `AGENTS.md`; el detalle por tema, `docs/`.

## Estructura

```
src/                código de la app, con sus tests al lado (src/lib: lógica pura)
tests/              tests de navegador real (Playwright)
features/           spec viva por capacidad (Given/When/Then)
docs/               datos del negocio y documentación del arnés
progress/           histórico de las features hechas
public/             fuentes, imágenes y recursos estáticos
tools/              puerta de build anti-terceros y utilidades
scripts/            actualización del arnés
.github/workflows/  CI y despliegue
.harness/ · bin/    motor del arnés y su lanzador
```

## Datos y contrato

- Los datos de negocio salen de `docs/datos-galapavet.md`; la spec y las decisiones, de `project-spec.md`; la spec viva, de `features/`.
- **Aviso:** `docs/contrato-heredado/` viene de un prototipo ficticio («Veterinaria La Sierra», con datos inventados) y **no** es el contrato vigente. Lee la sección «El punto de partida y por qué se rehizo el contrato» de `project-spec.md`.

## Despliegue

GitHub Pages, en cada push a main (`.github/workflows/deploy-pages.yml`). El build falla si el CSS o el HTML publicables referencian una fuente o una imagen de terceros de su lista (`tools/puerta-terceros.ts`).

## Actualizar el arnés

`node scripts/harness-upgrade.mjs --check` compara con la plantilla sin tocar nada (solo lectura) y `--diff` enseña los cambios. `harness.manifest.json` dice qué es de la plantilla y qué del proyecto.

## Licencia y créditos

MIT License, Copyright (c) 2026 Cenit Digital (ver `LICENSE`). El método es una adaptación del de [BettaTech](https://github.com/betta-tech/harness-sdd/tree/uncle-bob-harness) y la plantilla que lo aplica es de Cenit Digital; el detalle de lo que se debe a cada fuente está en el README de la plantilla.
