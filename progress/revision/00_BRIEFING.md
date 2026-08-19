# Briefing — Revisión adversarial del contrato Gherkin (Galapavet)

> Lo lee TODO agente de la revisión. Objetivo: **refutar** el contrato, no
> confirmarlo. Un informe sin hallazgos solo vale si demuestra QUÉ miró.

## Qué se revisa

Los 19 `features/*.feature` (387 escenarios) re-destilados el 17/08/2026.
Todavía NO existe una línea de producción ni un test. Reparar aquí cuesta una
edición de texto; reparar aguas abajo cuesta un ciclo TDD entero más su mutación.

## Fuentes de verdad (por orden de autoridad)

1. `docs/datos-galapavet.md` — **único** origen admitido de datos de negocio.
   Todo dato de la UI debe rastrearse hasta aquí con su fuente citada. §7 lista
   los datos del prototipo ficticio «Veterinaria La Sierra» que están PROHIBIDOS.
2. `project-spec.md` — las decisiones y su porqué.
3. `feature_list.json` — los criterios de aceptación por feature.
4. `docs/contrato-heredado/` — el contrato del prototipo FICTICIO. Es material
   de contraste, NUNCA fuente de verdad.

## El stack real (decide qué es asertable)

- Tests: **Vitest 4 + jsdom 30 + Testing Library**. `vite.config.ts` fija
  `test.css: false` → **los CSS Modules devuelven un proxy**: aseverar sobre un
  nombre de clase, un estilo computado o un selector es imposible.
- **jsdom no calcula layout**: no hay `getBoundingClientRect` real (todo 0),
  ni media queries resueltas, ni `scrollTo` físico, ni tamaño de fuente
  computado. Un `Then` que dependa de geometría, de un breakpoint aplicado o de
  un scroll real **no es verificable en esta suite**.
- Mutación: **StrykerJS 10, `break: 100`**, `concurrency: 1`. `mutate` cubre
  **solo** `src/lib/**/*.ts` y `src/**/*-logica.ts`. Stryker **no muta texto ni
  atributos de JSX**. Consecuencia: todo lo que un escenario quiera proteger por
  mutación tiene que vivir en un módulo puro `.ts`, no en el `.tsx`.
- Estado condicional en **atributo ARIA consultable**, nunca en `className`.

## Formato del hallazgo

Cada hallazgo se escribe con estos campos, sin excepción:

- `fichero` — `features/<name>.feature`
- `ancla` — el tag `@sN` afectado (o `CABECERA` si es del bloque de comentarios)
- `severidad` — `bloqueante` | `grave` | `menor`
- `lente` — la tuya
- `defecto` — una frase: qué está mal
- `evidencia` — **cita literal** de la línea del `.feature` y, si aplica, la
  línea de la fuente primaria que la contradice
- `consecuencia` — qué pasa aguas abajo si no se repara
- `reparacion` — la edición concreta propuesta

## Reglas duras

- **Cita literal siempre.** Un hallazgo sin la línea copiada del fichero se
  descarta por construcción.
- **No inventes datos.** Si un dato no está en `docs/datos-galapavet.md`, el
  hallazgo es «dato no verificado», no «dato incorrecto».
- **No propongas escribir producción.** Solo se repara el contrato.
- **Declara tu cobertura**: cuántos escenarios miraste de cuántos. Un informe que
  no la declara es un verde por vacuidad y se descarta.
