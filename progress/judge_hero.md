# Review — feature 4 (hero)

**Veredicto:** APPROVED

Ronda revisada: 1 (`progress/tdd_hero.md`, ciclos 1-12 + refactor final). Único
fichero de producción: `src/components/Hero.tsx`. Único fichero de test:
`src/components/Hero.test.tsx`. No reviso solo el relato del `tdd_craftsman`:
releo los dos ficheros completos contra `features/hero.feature` y hago
verificación independiente de mutación manual sobre los puntos de riesgo
(detalle abajo).

## Cobertura de escenarios (@s ↔ test)

- @s1: [x] `Hero.test.tsx:11-21` — h1 con nombre accesible exacto, texto
  "Galapagar · Madrid" presente, "Miraflores de la Sierra" ausente.
- @s2: [x] `Hero.test.tsx:23-39` — los 5 servicios reales presentes,
  "urgencias"/"24 h" ausentes.
- @s3: [x] `Hero.test.tsx:41-47` — `href="#reservar"` exacto.
- @s4: [x] `Hero.test.tsx:49-55` — `href="tel:+34910829267"` exacto.
- @s5: [x] `Hero.test.tsx:57-68` — dígitos del nombre accesible y del `href`
  coinciden en `'910829267'`.
- @s6: [x] `Hero.test.tsx:70-83` — exactamente 3 `term`, con las tres franjas
  literales del contrato.
- @s7: [x] `Hero.test.tsx:85-93` — ausencia de las 7 cifras/marcas del
  prototipo heredado.
- @s8: [x] `Hero.test.tsx:95-105` — ausencia de "24 h"/"Urgencias" y de
  cualquier enlace a `tel:+34918511393`.
- @s9: [x] `Hero.test.tsx:107-116` — `telefono: null` ⇒ 0 enlaces `tel:`,
  "Reservar cita" sigue existiendo.
- @s10: [x] `Hero.test.tsx:118-128` — `horario: null` ⇒ 0 `term`, h1 y
  "Reservar cita" siguen existiendo.
- @s11: [x] `Hero.test.tsx:130-135` — teléfono no normalizable lanza con el
  literal exacto en el mensaje, 0 `a[href^="tel:"]` en el documento.
- @s13: [x] `Hero.test.tsx:137-150` — 0 `src`/`srcset` que empiecen por
  "http", todo `href` empieza por "#" o "tel:".
- @s14: [ ] sin test de Vitest — **no bloqueante, por diseño explícito del
  proyecto**. El propio escenario (`features/hero.feature:170-176`) declara
  su `Given` como "cargada en un navegador real, fuera del gate de
  Vitest/Stryker (Decisión 11)" (`project-spec.md`, fila 11: cláusulas no
  medibles en jsdom —origen real de una hoja de estilo— se verifican con
  navegador real, declarado explícitamente en el escenario). Además hoy es
  irrealizable en la práctica: no existe ningún `App`/`main.tsx` que ensamble
  `Hero` en una página navegable (mismo pendiente ya aceptado para
  `cabecera_y_navegacion`). `Hero` no renderiza ningún `<img>` ni referencia
  ninguna imagen de fondo, así que no hay contradicción oculta con lo que
  @s13 sí cubre. Mismo criterio que el proyecto ya aplicó a otras cláusulas
  de Decisión 11 en features previas — no es una laguna que este `tdd_craftsman`
  haya introducido, es la política del proyecto.

12/13 escenarios cubiertos por Vitest (todos los que el contrato asigna al
gate), 1 fuera de gate por decisión de proyecto explícitamente declarada en
el propio `.feature`. Ningún `@s` queda sin cobertura y sin justificación.

## Disciplina TDD

- ¿Producción sin test que la pida? **NO.** `Hero.tsx` no tiene ninguna línea
  sin un `@s` que la exija: `UBICACION`/`TITULAR` (@s1), `TEXTO_DESCRIPTIVO`
  (@s2), enlace `#reservar` (@s3), enlace `tel:` derivado (@s4/@s5/@s11),
  guarda `telefono !== null` (@s9), `<dl>` de horario (@s6), guarda
  `horario !== null` (@s10). Sin `Hero.module.scss` (ningún test lo pide, sin
  aserciones CSS en el proyecto — `vite.config.ts` tiene `test.css: false`),
  sin fichero `Hero-logica.ts` (ningún escenario exige una derivación nueva
  más allá de reusar `enlaceLlamada`, ya mordido al 100% en `datos_negocio`).
- ¿Evidencia de Rojo→Verde→Refactor? **SÍ**, ciclo a ciclo en
  `progress/tdd_hero.md`. Para los ciclos que "pasaron a la primera" (@s5,
  @s7, @s8, @s11) el `tdd_craftsman` cita el motivo estructural (el mismo
  cableado ya ejercitado por un ciclo previo) y, en @s5/@s11, verificación
  manual de no-vacuidad documentada. Para @s7/@s8 el log solo invoca
  precedente sin mutar a mano — **verificado de forma independiente por este
  `judge`, ver abajo**.

## Patrón `doble-de-test-anclado-al-literal-no-al-simbolo`: sin violaciones

Releído `Hero.test.tsx` completo: el único `import` es `{ Hero }` desde
`./Hero` (`Hero.test.tsx:4`). Ningún test importa `TITULAR`, `UBICACION`,
`TEXTO_DESCRIPTIVO` ni `datosNegocio`/`enlaceLlamada` para compararlos
consigo mismos. Todos los valores esperados están escritos a mano:
`'Cuidamos la salud y la felicidad de tu mascota'` (:16),
`'Galapagar · Madrid'` (:18), los 5 nombres de servicio (:28-32), `'#reservar'`
(:45), `'tel:+34910829267'` (:53), `'910829267'` (:65-66), las 3 franjas
horarias literales (:77-81), las 7 cifras prohibidas (:89), `'91 082 92'`
(:132). `enlaceLlamada` se usa dentro del componente, no dentro del test —
el test nunca reconstruye el doble con el símbolo de producción. Sin
violación.

## Patrón `verde-por-vacuidad-en-puerta-de-verificacion`: sin violaciones — verificado con mutación manual, no solo leído

Ninguno de los `Then` de `hero.feature` deriva un conjunto de producción y
concluye sobre su tamaño con riesgo de colapsar a vacío sin que nadie lo
note (el patrón, ver `.memoria-cache/patterns/testing/verde-por-vacuidad-en-puerta-de-verificacion.md`,
es sobre **puertas** que leen un artefacto construido, derivan un conjunto y
fallan solo si encuentran algo — con conjunto vacío pasando en verde por
descarte). Aquí las guardas de ausencia (@s7, @s8, @s13) son aserciones
escalares directas sobre literales fijos ("cuándo NO aplica" del propio
patrón), no cuantificadores sobre una colección que production pudiera
vaciar. Aun así, dado que @s7/@s8 "pasaron a la primera" sin verificación
manual documentada por el `tdd_craftsman` (a diferencia de @s5/@s11, que sí
la documentan), este `judge` la hizo de forma independiente antes de
aprobar:

1. Mutado a mano `TEXTO_DESCRIPTIVO` (`Hero.tsx:29-30`) añadiendo
   `' 12 años · 4,9 ★ · 327 reseñas · Urgencias 24 h'` → `pnpm exec vitest run
   src/components/Hero.test.tsx` → **3 failed de 12**: @s2 (`not.toHaveTextContent('24 h')`),
   @s7 (`not.toHaveTextContent('12 años')`) y @s8 (`not.toHaveTextContent('24 h')`),
   los otros 9 siguen verdes. Revertido byte a byte (confirmado releyendo el
   fichero completo tras el revert: idéntico al original).
2. Mutado a mano el guarda `telefono !== null` y `horario !== null`
   (`Hero.tsx:44,46`) a un fallback incondicional (`telefono ?? datosNegocio.telefonoClinica.textoVisible`
   / `horario ?? datosNegocio.horario`, sin condicional) → **2 failed de 12**:
   exactamente @s9 (`expected 'tel:+34910829267' not to match /^tel:/`) y
   @s10 (`expected [...] to have a length of +0 but got 3`), los otros 10
   siguen verdes. Revertido.
3. Mutado a mano el enlace de llamada (`Hero.tsx:44`) envolviendo
   `enlaceLlamada(telefono)` en un `try/catch` que cae a
   `'tel:+34000000000'` en vez de dejar propagar el error → **1 failed de
   12**: exactamente @s11 (`expected [Function] to throw an error` /
   `Received: undefined`). Revertido. Esto reproduce de forma independiente
   la verificación que el `tdd_craftsman` ya documentó para @s11 en
   `progress/tdd_hero.md` (ciclo 11), no me fío solo de su relato.
4. Tras cada revert, `pnpm exec vitest run` (suite completa): **96/96
   verdes**. Fichero final releído íntegro: byte a byte igual al leído al
   inicio de esta revisión.

No hay vacuidad oculta: cada guarda de ausencia muere ante el mutante que
la desmentiría, y ningún cuantificador universal de este fichero puede
colapsar a "0 elementos examinados" sin que un test lo note (@s9 usa
`getAllByRole('link')`, que **lanza** si no hay ningún enlace — nunca pasa
por descarte silencioso — y "Reservar cita" garantiza al menos 1 enlace
real siempre presente).

## Calidad (lente de artesano)

### `src/components/Hero.tsx`
- Función única (`Hero`), un solo motivo de cambio (renderizar la sección),
  26 líneas de cuerpo. Sin funciones largas.
- Nombres reveladores: `TITULAR`, `UBICACION`, `TEXTO_DESCRIPTIVO`,
  `FranjaHorario`. Sin números mágicos.
- Sin duplicación: reutiliza `enlaceLlamada` de `../lib/telefono` (ya al
  100% de mutación bajo `datos_negocio`) en vez de reimplementar
  normalización de teléfono — respeta el invariante de fuente única
  (`feature_list.json` → `datos_negocio`, invariante 2 de `project-spec.md`).
- Sentinela `null` documentado con JSDoc explicando *por qué* no vale
  `undefined` (parámretro por defecto de JS se dispara igual) — el
  razonamiento no obvio queda por escrito, no solo en la bitácora.
- Contrato de errores correcto para @s11: sin `try/catch` alrededor de
  `enlaceLlamada`, comentario explícito en la JSDoc del componente
  ("`enlaceLlamada` falla cerrado... revienta el render entero, sin `tel:` a
  medias") — el canal de error es la excepción propagada, consistente con
  cómo `enlaceLlamada`/`normalizarTelefono` ya fallan cerrado en
  `src/lib/telefono.ts`.
- Guarda `telefono !== null` / `horario !== null`: condicionales triviales
  de presencia, no "lógica de decisión" que el invariante
  `logica-de-decision-en-modulo-puro-no-en-el-jsx` obligue a extraer a un
  `-logica.ts` — no hay derivación nueva propia de `Hero` (a diferencia de
  `esAncla`/`esMovil` en `Cabecera-logica.ts`, que sí son decisiones no
  triviales). Decisión de diseño 3 del `tdd_craftsman` la justifica contra
  el invariante correcto; de acuerdo con la lectura.
- Respeta `stryker.config.json`: no cae en `src/lib/**` ni `*-logica.ts`, así
  que correctamente no aporta superficie mutable propia — confirmado
  leyendo el glob (`mutate: ["src/lib/**/*.ts", "src/**/*-logica.ts", ...]`).

### `src/components/Hero.test.tsx`
- Helper `renderizarHero` centraliza el render (mismo patrón que
  `Cabecera.test.tsx`), evita repetir `render(<Hero {...props} />)` en cada
  `it`.
- Un `describe` por `@s`, nombres de `it` descriptivos y verificables contra
  el `.feature` sin ambigüedad.
- Sin duplicación real entre tests: @s4 y @s5 comparten el mismo enlace pero
  verifican propiedades distintas (destino exacto vs. coherencia de dígitos)
  — no es redundante, es la separación exacta que pide el propio `.feature`.
- `@s5` usa `/^Llamar/` (regex) porque el nombre accesible exacto ya lo fija
  @s4 — evita repetir el literal completo sin perder precisión sobre lo que
  @s5 realmente comprueba (coherencia de dígitos, no el rótulo).

## Verificación de entorno (independiente, no solo leída del informe)

- `powershell.exe -File bin/harness.ps1 init`: **verde** — node v22.15.0,
  6 ficheros base OK, `feature_list.json` válido (19 features), lint
  (oxlint --deny-warnings) sin errores, typecheck (`tsc -b`) sin errores,
  **96/96 tests verdes**.
- `pnpm exec vitest run` ejecutado 3 veces más por este `judge`, entre y
  después de las 3 mutaciones manuales de la sección anterior: **96/96
  verdes** cada vez, con exactamente los fallos esperados durante cada
  mutación (3, luego 2, luego 1 — nunca más ni menos de lo previsto).
- `grep -n "TODO|console\.(log|debug)|debugger"` sobre `Hero.tsx` y
  `Hero.test.tsx`: sin resultados.
- `ls src/components/`: exactamente 6 ficheros (4 de `cabecera_y_navegacion`
  + `Hero.tsx`/`Hero.test.tsx`), sin ficheros sueltos ajenos a las dos
  features.
- `node -e` sobre `feature_list.json`: exactamente 1 feature `in_progress`
  (`4:hero`) — `one_feature_at_a_time` respetado.

## Cambios requeridos

Ninguno.

## Checkpoints (`CHECKPOINTS.md`)

- **C1** — [x] `AGENTS.md`, `CLAUDE.md`, `CHECKPOINTS.md`,
  `harness.config.json`, `feature_list.json`, `progress/current.md`,
  `docs/workflow.md`, `docs/architecture.md`, `docs/conventions.md`,
  `docs/verification.md` — todos presentes (verificado archivo a archivo).
  `bin/harness init` (`bin/harness.ps1` en esta máquina Windows) termina
  exit 0.
- **C2** — [x] Una sola feature `in_progress` (`hero`, id 4, verificado
  programáticamente). Las `done` (ids 1-3) tienen tests que pasan
  (incluidos en los 96/96). `progress/current.md` describe la sesión activa
  sin basura de sesiones previas.
- **C3** — [x] `src/components/` contiene exactamente los ficheros
  esperados de las dos features activas/cerradas de componentes. Sin
  dependencias nuevas (mismos `imports`: `react`, `../lib/site`,
  `../lib/telefono`). Sin TODOs ni logs de debug.
- **C4** — [x] `Hero.tsx` tiene su test co-locado (`Hero.test.tsx`). Tests
  reales sobre DOM vía Testing Library, sin mocks de sistema de ficheros.
  `pnpm run test` → **96/96 verdes**, confirmado por este `judge` en 4
  corridas independientes (init + 3 tras mutaciones manuales revertidas).
- **C5** — [ ] No evaluado: checkpoint de cierre de sesión, feature todavía
  `in_progress` (mismo criterio que en features anteriores).
- **C6** — [x] `features/hero.feature` existe, con cabecera de fuente y
  decisiones documentada, y sección correspondiente en `project-spec.md`
  (fila 11 sobre Decisión 11, invariantes 2 y 4). 12/13 escenarios con test
  concreto (mapa en `progress/tdd_hero.md`), 1 fuera de gate por decisión de
  proyecto explícitamente declarada en el propio escenario — no es una
  laguna. Sin producción sin test que la pida. Sin violaciones de
  `doble-de-test-anclado-al-literal-no-al-simbolo` ni de
  `verde-por-vacuidad-en-puerta-de-verificacion`, ambas verificadas de forma
  independiente por este `judge` con mutación manual (no solo leídas del
  informe del `tdd_craftsman`).
- **C7** — [ ] No evaluado por este rol: corresponde a `mutation_tester`,
  posterior a esta aprobación. Nota para esa ronda: `Hero.tsx` no cae en
  ningún glob de `stryker.config.json` (`src/lib/**/*.ts`,
  `src/**/*-logica.ts`) — correcto por diseño, no una forma de evitar la
  puerta: no hay decisión/derivación propia de `Hero` que mutar más allá de
  `enlaceLlamada`/`normalizarTelefono`, ya al 100% bajo `datos_negocio`. Si
  el `craftsman_lead` relanza `mutation_tester` sobre esta feature, medirá
  superficie 0 propia — se corresponde con documentarlo, no con inventar un
  `Hero-logica.ts` sin test rojo que lo pida (violaría la Ley 1).

## Siguiente paso

`craftsman_lead` puede considerar cerrado el diseño y la cobertura de
escenarios de `hero` (id 4). Antes de marcar `done` en `feature_list.json`
falta, según la regla dura del propio rol y `harness.config.json` →
`mutation.threshold` (1.0): confirmar con `mutation_tester` que no hay
superficie mutable pendiente en esta feature (superficie 0 esperada, ya
cubierta por `datos_negocio`) y que el estado de `src/lib/telefono.ts` /
`src/lib/site.ts` sigue en 100% (no ha habido cambios en esta ronda que lo
pongan en duda — confirmado: `git status` no muestra ningún cambio en
`src/lib/`).
