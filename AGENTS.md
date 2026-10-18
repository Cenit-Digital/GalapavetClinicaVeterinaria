# AGENTS.md — Mapa de navegación para agentes de IA

> Punto de entrada para cualquier agente que trabaje en este repositorio.
> NO es una biblia de reglas: es un **mapa**. Lee solo lo que necesites,
> cuando lo necesites (divulgación progresiva).
>
> Proceso: lo fija la «Política de trabajo» del final de este fichero (niveles,
> puerta humana, delegación). El pipeline por fases anterior está retirado.
> Plantilla **agnóstica al lenguaje**: los comandos del stack viven en
> `harness.config.json`.

## 1. Antes de empezar (obligatorio)

1. Ejecuta `./init.sh` (o `bin/harness init`). Si falla, **para** y resuelve
   el entorno antes de tocar código.
2. Lee el issue de la tarea (objetivo, criterios y plan); si no hay issue, lo que pida la persona.
3. Lee la «Política de trabajo» (final de este fichero) antes de planificar.
4. Opcional y no bloqueante: sincroniza la memoria de la organización con
   `scripts/sync-memoria.sh` (`pwsh scripts/sync-memoria.ps1` en Windows) y
   revisa en `.memoria-cache/patterns/` los patrones de la categoría de tu
   tarea antes de diseñar desde cero, respetando su «Cuándo NO aplica»; si
   falla (sin red o sin acceso), sigue sin ella y anótalo en el PR
   (`docs/memoria-organizacional.md`).

## 2. Mapa del repositorio

| Archivo / carpeta          | Qué contiene                                                              | Cuándo leerlo                     |
| -------------------------- | ------------------------------------------------------------------------- | --------------------------------- |
| `harness.config.json`      | ⭐ Comandos de TU stack (test, mutación, lint…). El único punto no-agnóstico | Antes de tocar el arnés           |
| `project-spec.md`          | Spec conversada por feature                                               | Antes de Gherkin o de implementar |
| `features/<name>.feature`  | Escenarios Gherkin (contrato aprobado por el humano)                      | Antes del ciclo TDD               |
| `docs/tdd.md`              | Las Tres Leyes; Rojo-Verde-Refactor                                       | Antes de escribir código          |
| `docs/gherkin.md`          | Cómo escribir `.feature`; de Gherkin a test                               | Antes de redactar escenarios      |
| `docs/mutation-testing.md` | Por qué y cómo; umbral; mutación por stack                                | Antes de validar la suite         |
| `docs/mutacion-vitest-related.md`| Stryker + Vitest: qué tests enfrenta de verdad cada mutante (propio de este proyecto)| Antes de leer un informe de mutación|
| `docs/architecture.md`     | Qué significa "hacer un buen trabajo"                                     | Antes de implementar              |
| `docs/conventions.md`      | Estilo, nombres, estructura                                               | Antes de escribir código          |
| `docs/verification.md`     | Cómo demostrar que funciona                                               | Antes de declarar `done`          |
| `docs/configuration.md`    | Cómo adaptar `harness.config.json` a cualquier stack                      | Al portar a un nuevo lenguaje     |
| `docs/tooling.md`          | Agentes de nivel y especialistas; dónde se verifica (sin hooks de tests)  | Para entender el tooling          |
| `docs/autonomous.md`       | El bot de evolución autónoma (solo-PR) y su puesta en marcha              | Para operar el bot de auto-mejora |
| `docs/memoria-organizacional.md` | Patrones validados compartidos entre proyectos (memoria de la org)  | Al empezar una tarea (§1, paso 4) |
| `scripts/sync-memoria.sh(.ps1)` | Sincroniza la memoria organizacional en `.memoria-cache/`           | Paso 4 de §1 (opcional)           |
| `CHECKPOINTS.md`           | Criterios objetivos de "estado final correcto"                           | Para auto-evaluarte               |
| `.harness/harness.mjs`     | Motor agnóstico (lee la config y ejecuta tus comandos)                    | Si depuras el arnés               |
| `.claude/agents/`          | 3 de nivel y 3 especialistas opt-in                                       | Si delegas                        |
| `examples/`                | Arneses completos y ejecutables (Python y Node/JS) de referencia          | Para ver el método en acción      |
| `src/` · `tests/`          | Código de la aplicación y sus tests                                       | Para implementar / verificar      |

## 3. Reglas duras (no negociables)

- **Una sola feature a la vez.**
- **No declares `done`** sin tests verdes **y** umbral de mutación superado
  (`bin/harness test` y `bin/harness mutate`).
- **No saltes** la conversación de spec ni la destilación Gherkin para
  features `"sdd": true`.
- **No saltes la puerta humana** sobre los `.feature`.
- **TDD estricto: un test a la vez** (`docs/tdd.md`).
- **Documenta** en `progress/current.md` mientras trabajas.
- **Deja el repo limpio** antes de cerrar (sin logs de debug, sin TODOs sin
  contexto).
- **Si no sabes algo, busca en `docs/`** antes de inventarlo.

## 4. Flujo de trabajo

Lo fija la «Política de trabajo» del final de este fichero: nivel de la tarea,
plan aprobado, ejecución delegada por capacidad y diff revisado en local. El
pipeline por fases con agentes propios está retirado.

## 5. Cierre de sesión

Lo rige la «Política de trabajo» del final de este fichero (en particular, la
puerta humana: el diff se revisa en local antes de cualquier `git push`).
Deja el repo limpio: sin archivos temporales, sin logs de debug y sin TODOs sin
contexto.

## 6. Si te bloqueas

- Relee la sección relevante de `docs/`.
- Si una herramienta no hace lo que esperas, **no inventes un workaround**:
  documenta el bloqueo en `progress/current.md` y para la sesión.

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
