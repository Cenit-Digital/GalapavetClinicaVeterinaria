# AGENTS.md — instrucciones para agentes de IA

> Punto de entrada para cualquier agente (Claude Code, Codex, Copilot, OpenCode, Gemini). Corto a propósito (menos de 200 líneas):
> lo detallado vive en `docs/`, léelo solo cuando lo necesites. Las cinco secciones son del proyecto; el bloque final lo gestiona la plantilla.

## 1. Resumen del proyecto

Web de **Galapavet**, centro integral veterinario de Galapagar (Madrid): landing con Campañas, Blog y Tienda. Es una web piloto para enseñar al cliente: sin backend, sin pasarela de pago y sin CMS (`project-spec.md`, «Propósito del proyecto»). Se publica en GitHub Pages en cada push a `main` (`.github/workflows/deploy-pages.yml`).

Stack: pnpm + Vite + React 19 + react-router + TypeScript + SCSS Modules. Tests: Vitest + Testing Library; Playwright + axe en navegador real (e2e); oxlint; StrykerJS para la mutación. Derivado de la plantilla SSD: la política de trabajo es la del bloque final y `node scripts/harness-upgrade.mjs --check` dice si el arnés está al día.

Los datos de negocio solo salen de `docs/datos-galapavet.md`, con su fuente. En código, el NAP, el horario y los enlaces tienen una única fuente, `src/lib/site.ts`; los catálogos (servicios, equipo, FAQ, blog, tienda, campañas), sus ficheros de `src/data/`.

## 2. Ficheros clave

| Ruta | Qué contiene |
| --- | --- |
| `harness.config.json` | Los comandos del arnés para este stack (instalar, lint, test, mutación, build); el umbral de mutación y las rutas (`docs/configuration.md`) |
| `project-spec.md` | La spec conversada: propósito, invariantes y decisiones con su porqué |
| `features/<capacidad>.feature` | Spec viva de una capacidad (Given/When/Then), uno por capacidad; el PR que cambia la capacidad actualiza su `.feature` |
| `docs/datos-galapavet.md` | Datos del cliente verificados y con su fuente: la única fuente de datos de negocio |
| `docs/contrato-heredado/` | **No es el contrato vigente.** Viene del prototipo ficticio «Veterinaria La Sierra» (datos inventados). Antes de usarlo, lee en `project-spec.md` «El punto de partida y por qué se rehizo el contrato» |
| `src/` | La aplicación. Los tests unitarios van junto al código. `src/lib/` y los `*-logica.ts` son lógica pura; los `.tsx` solo cablean; `src/data/` son los catálogos estáticos tipados |
| `tests/e2e/` · `playwright.config.ts` | Specs de Playwright + axe contra el build de producción (dist/) servido con `vite preview`; `bin/harness init` no los ejecuta, pero `tsc -b` y oxlint sí los revisan |
| `tools/puerta-terceros.ts` | Puerta del build: falla si el CSS o el HTML de `dist/` referencian alguno de los dominios de terceros de una lista fija (`src/lib/diseno/puertaTerceros.ts`); no mira el JS |
| `stryker.config.json` · `docs/mutacion-vitest-related.md` | Superficie mutable (`src/lib/**/*.ts` y `src/**/*-logica.ts`). Lee el segundo antes de interpretar un informe: explica qué tests enfrenta de verdad cada mutante |
| `.github/workflows/` | CI y despliegue; entre otros, `deploy-pages.yml` (build y publicación), `harness-ci.yml` (su job raíz: build, `init` y `test:config`) y `pr-body.yml` (cuerpo del PR) |
| `feature_list.json` · `progress/` | **Registro histórico** de las features ya hechas. El motor del arnés ya no los lee y no se actualizan: el trabajo nuevo va por issue + PR. La 48 (`in_progress`, con trabajo parcial en `progress/` y en `main`) y la 49 (`spec_ready`) se retomarán como tarea nueva con su propio issue, que aún no existe |
| `docs/` | Detalle por tema: `tdd`, `gherkin`, `verification`, `conventions`, `architecture`, `mutation-testing`, `configuration`, `tooling` y `modelos` (qué modelo es cada nivel en cada herramienta) |
| `CHECKPOINTS.md` | Criterios objetivos de «estado final correcto», para autoevaluarte |
| `.claude/agents/` | Agentes de nivel (`worker_fast`, `worker_balanced`, `reviewer_frontier`) y especialistas opt-in de solo lectura |
| `.github/agents/` · `.codex/agents/` · `.opencode/agents/` | Los tres agentes de nivel para Copilot, Codex y OpenCode, con el mismo cuerpo que los de `.claude/agents/` |
| `harness.manifest.json` · `scripts/harness-upgrade.mjs` | Qué es de la plantilla y qué del proyecto; `--check` y `--diff` miran la deriva, `--apply` la reemplaza |
| `.harness/impacto-tareas.mjs` | Candidatos de «Impacto en tareas anteriores»: PR e issues previos que tocaron los mismos ficheros (sin LLM, con tope fijo) |
| `docs/memoria-organizacional.md` | Memoria de la organización: patrones validados compartidos entre proyectos |

## 3. Desarrollo y validación

**Cómo se ejecuta.** Empieza siempre por el entorno: `./init.sh` (POSIX), `pwsh ./init.ps1` (Windows) o `bin/harness init` (`bin\harness.ps1 init` en Windows). Si falla, **para** y resuelve el entorno antes de tocar código. Requiere Node `^20.19` o `>=22.12` y pnpm (versión fijada en `packageManager`). En un clon limpio, antes de `init` corre `pnpm install` y `pnpm run build` (como `harness-ci.yml`): `init` no instala y un test de Vitest lee el dist/ real. `init` corre lint, typecheck y la suite de Vitest y tarda ≈ 4-5 min: lánzalo en segundo plano. Los comandos del arnés viven en `harness.config.json` y se invocan siempre a través de `bin/harness`; los scripts de pnpm de la segunda tabla son los del trabajo diario y no lo sustituyen.

| Comando | Para qué |
| --- | --- |
| `bin/harness init` | Verifica el entorno y el arnés |
| `bin/harness test` | La suite de tests (`pnpm run test`) |
| `bin/harness mutate [objetivo]` | Prueba de mutación; solo nivel crítico. El comando no usa `{{target}}`, así que el objetivo no acota nada: para un módulo, `pnpm exec stryker run --mutate <ruta>` |
| `bin/harness verify` | `init` + mutación completa; solo antes de una entrega (el cierre ordinario es `init` + `test`) |

| Script de pnpm | Qué hace |
| --- | --- |
| `pnpm run dev` | Servidor de desarrollo de Vite |
| `pnpm run verificar` | `lint` + `typecheck` encadenados (el `commands.lint` del arnés ejecuta esos dos) |
| `pnpm run lint` | oxlint con `--deny-warnings` |
| `pnpm run typecheck` | `tsc -b` sobre los tres proyectos (`app`, `node`, `e2e`) |
| `pnpm run test` | Vitest (`vitest run`) |
| `pnpm run test:e2e` | Playwright + axe sobre el build de producción; córrelo cuando el cambio toque maquetación, CSS, rutas o accesibilidad. Antes de la primera vez: `pnpm exec playwright install --only-shell chromium`. Deja libre el puerto 4173: fuera de CI Playwright reutiliza lo que escuche allí y podría probar un build viejo |
| `pnpm run test:config` | Regresión de la configuración de mutación (`harness.config.json` y `stryker.config.json`) |
| `pnpm run build` | `tsc -b`, `vite build` con la base de GitHub Pages y la puerta anti-terceros |
| `pnpm run mutate` | StrykerJS sobre la superficie de `stryker.config.json` |

También existen `preview`, `test:watch` y `test:cobertura`.

**Al empezar una tarea.** Lee el issue (objetivo, criterios y plan) o lo que pida la persona, y la «Política de trabajo» del final de este fichero. Opcional y no bloqueante, para cualquier herramienta y si tu repo conserva `scripts/sync-memoria.*`: sincroniza la memoria de la organización con `scripts/sync-memoria.sh` (`pwsh scripts/sync-memoria.ps1` en Windows) y revisa en `.memoria-cache/patterns/` los patrones de la categoría de tu tarea antes de diseñar desde cero, respetando su «Cuándo NO aplica»; si falla (sin red o sin acceso), sigue sin ella y anótalo en el PR (`docs/memoria-organizacional.md`).

**Flujo.**
- Trabaja en una **rama nueva** desde la rama por defecto y usa **commits convencionales** (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`).
- Antes de pedir revisión, **revisa tu propio diff**: `/code-review` (Claude Code), `/review` (Codex y Copilot CLI) o, si tu herramienta no trae un comando de revisión, pide el diff a otro agente (`reviewer_frontier` o el equivalente).
- El PR sigue la plantilla de `.github/`; si el cambio es visual, adjunta imágenes o vídeo de antes y después.

## 4. Guardarraíles

- **No saltes la puerta humana:** plan aprobado antes de implementar y diff revisado en local antes de cualquier `git push`.
- **Un test por criterio** del issue; TDD estricto (`docs/tdd.md`) y mutación solo en nivel crítico.
- **Un tema por tarea y por PR**, pequeño y fácil de revisar.
- **Una tarea, una sesión:** el traspaso es el issue y el PR, no el chat. Si lo que te piden se sale del objetivo de la sesión, avisa y propón abrir una sesión nueva con un título; no la sigas aquí. Gasta poco contexto: lee solo lo necesario y resume en vez de pegar.
- **Si no sabes algo, busca en `docs/`** antes de inventarlo.
- **Si te bloqueas** (una herramienta no hace lo que esperas), no inventes un workaround: documenta el bloqueo en el issue o en el PR y para.
- **No edites el bloque `harness:begin`/`harness:end` ni los ficheros de plantilla** de `harness.manifest.json`: se actualizan con `node scripts/harness-upgrade.mjs`.

Invariantes del proyecto (resumen de `project-spec.md`, «Invariantes del proyecto»):
- **Ningún dato de negocio en la UI** que no esté en `docs/datos-galapavet.md` con su fuente. Se escribe una sola vez, en `src/lib/site.ts`; `tel:`, `wa.me`, JSON-LD y texto visible se calculan de ahí.
- **Cero peticiones automáticas a terceros** en el artefacto publicable (fuentes e imágenes, en local). Lo vigilan la puerta del build (`tools/puerta-terceros.ts`, solo CSS y HTML) y `tests/e2e/red-limpia.spec.ts` (la red, en navegador real).
- **El estado base en CSS es el estado final visible:** el estado oculto vive solo dentro del ámbito de la animación.
- **El estado condicional vive en un atributo ARIA consultable**, nunca en un `className` ternario. Enmienda propuesta por la feature 49, que `project-spec.md` marca pendiente de firma (confirma su estado con el titular antes de aplicarla): si el estado es puramente visual y no hay un atributo ARIA con esa semántica, vive en un `data-*` consultable.
- **La lógica de decisión vive en módulos puros** (`*-logica.ts`); el `.tsx` solo cablea.
- **Cero errores y cero warnings** en `pnpm run verificar`, `pnpm run build`, `pnpm run test`, `pnpm run test:e2e` y la consola del navegador. El linter es oxlint y el typecheck, `tsc -b`: `project-spec.md` aún cita `eslint` y `tsc --noEmit`.
## 5. Definición de hecho

Una tarea está hecha cuando se cumple todo esto:

- `bin/harness init` y `bin/harness test` en verde. En nivel crítico, además, la mutación sobre los módulos del plan (Stryker solo muta `src/lib` y los `*-logica.ts`) al 100 %: el umbral real es `thresholds.break` de `stryker.config.json`; el `mutation.threshold` (1,0) de `harness.config.json` no lo cambia, y qué hacer con las claves de ese fichero está pendiente de decisión del titular.
- Cada criterio del issue tiene su test; si cambió una capacidad, su `features/<capacidad>.feature` está actualizado en el mismo diff.
- El diff está revisado (por ti y, en local, por la persona) y el PR rellena sus bloques y marca la casilla de revisión local.
- El issue tiene las casillas del plan marcadas y «Resultados de la ejecución» rellena.
- El repo queda limpio: sin logs de debug, sin ficheros temporales, sin TODOs sin contexto.

<!-- harness:begin — bloque gestionado por la plantilla: no lo edites aquí; lo reemplaza scripts/harness-upgrade.mjs al aplicar -->
## Arnés SSD (gestionado por la plantilla)

- Entorno y arnés: `bin/harness init` · tests: `bin/harness test` · mutación: `bin/harness mutate [target]`.
- ¿Al día con la plantilla? `node scripts/harness-upgrade.mjs --check` (solo lectura); `--diff` enseña los cambios.
- Qué es de la plantilla y qué del proyecto: `harness.manifest.json`.

### Política de trabajo

**Niveles.** El planificador clasifica cada tarea por juicio (las pistas no son exhaustivas; ante la duda, el nivel superior) y escribe el nivel y su motivo en el plan; la persona lo corrige al aprobarlo.
- **trivial:** cambio local y evidente. Un solo contexto, sin subagentes obligatorios.
- **pequeño:** acotado a pocos ficheros y sin decisiones de diseño. Se planifica con `frontier` y se implementa con `balanced`, en la misma sesión.
- **estándar:** varias piezas o un comportamiento nuevo. Mismo mecanismo; el plan fija los artefactos que exige.
- **crítico:** seguridad, datos, dinero o un contrato público. El planificador sigue como orquestador y revisor: delega, puede reasignar y revisa. Exige además TDD estricto y mutación sobre los módulos que fija el plan (`docs/verification.md`); en los demás niveles no se corre mutación.

**Puerta humana (dos puntos, todos los niveles).** 1) La persona aprueba el plan antes de implementar (en trivial basta uno de 1-2 líneas con el nivel y el motivo). 2) La persona revisa el diff en local antes de cualquier `git push`; un agente interactivo no empuja sin esa revisión.

**Delegación.** Por capacidad, no por proveedor: `frontier` (planificar, revisar, lo crítico), `balanced` (implementar), `fast` (tareas mecánicas y exploración). Salvo en trivial, el plan lleva una tabla «Delegación»: ejecutor, nivel, esfuerzo, motivo, «escalar si…» y verificación automática. Qué modelo es cada nivel en cada herramienta: `docs/modelos.md`.

**Issues y PR.** Plantillas en `.github/`. Toda tarea tiene su issue (objetivo, nivel, criterios Given/When/Then, plan en casillas, tareas relacionadas, resultados); en trivial es mínimo: objetivo y plan de 1-2 líneas con el nivel y el motivo. El PR lo enlaza con `Closes #N`, lleva siempre cuatro bloques (qué, por qué, cómo se probó, pendiente), «Impacto en tareas anteriores» y la casilla de revisión local; el workflow «Plantilla del PR» comprueba esas secciones y la casilla (`node .harness/pr-body.mjs`).

**Bucle de aprendizaje (fase de cierre).** Una tarea nueva puede dejar obsoletas otras anteriores; el nivel trivial no ejecuta esta fase.
- Al planificar, anota en «Tareas relacionadas» del issue las anteriores que tocan lo mismo: `node .harness/impacto-tareas.mjs --files <rutas del plan>` da los candidatos.
- Al cerrar, `node .harness/impacto-tareas.mjs` sobre la rama lista, con tope fijo y sin LLM, los PR e issues previos que tocaron los mismos ficheros. Alimenta «Impacto en tareas anteriores»: cada candidato se marca «afecta» o «no afecta», con el motivo en una línea.
- Cada tarea afectada (su issue; si solo existe el PR, el PR) recibe la etiqueta `revisit` y un comentario con el motivo y el enlace al PR. Si el impacto exige cambiar algo, un agente en modo plan abre un issue `revisit` nuevo con el plan de enmienda ya redactado; se enlaza desde el comentario, desde «Resultados de la ejecución» y desde el bloque del PR, y la persona lo aprueba como cualquier plan. Comentar, etiquetar, crear la etiqueta si falta y abrir ese issue se hace con el OK de la persona; ningún issue se reabre por su cuenta.
- Lo aprendido que valga para tareas futuras va a `AGENTS.md` en el mismo PR. No hay bot retrospectivo.
- «Todo criterio de aceptación tiene un test» es la mitad determinista del bucle.
<!-- harness:end -->
