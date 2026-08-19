# Review — feature 5 (servicios)

**Veredicto:** APPROVED

Ronda revisada: 2 (`progress/tdd_servicios.md`, sección "Ronda 2 — corrección
tras `progress/judge_servicios.md`"). Punto de partida: mi propio
`CHANGES_REQUESTED` de la ronda 1 (único hallazgo bloqueante: `id="servicios"`
/ `aria-labelledby="servicios-titulo"` / `id="servicios-titulo"` en
`Servicios.tsx:49-50` sin ningún `@s` ni test que los exigiera). No me fío del
relato de la ronda 2: releí los 5 ficheros de producción/test completos otra
vez, verifiqué el fix de forma independiente y volví a correr el entorno.

## Verificación independiente del fix de ronda 2

- `src/components/Servicios.tsx` releído completo: la sección ahora es
  `<section>` / `<h2>Servicios</h2>` sin ningún atributo. Confirmado con
  `grep -n "servicios-titulo|id=.servicios.|aria-labelledby" src/` (recursivo
  sobre todo `src/`) → **0 coincidencias** en todo el árbol, no solo en el
  fichero tocado.
- El resto del fichero es byte-a-byte idéntico a lo que ya aprobé de diseño en
  la ronda 1 (helpers, `TarjetaServicio`, guardas `conDesglose` /
  `catalogo.length === 0`) — el diff de ronda 2 es una resta pura de 2 líneas,
  sin producción nueva que justificar.
- `bin\harness.ps1 init` no está disponible en esta máquina (sin `pwsh`);
  ejecuté el equivalente documentado, `node .harness/harness.mjs init`:
  **verde** — Node v22.15.0, 6 ficheros base OK, `feature_list.json` válido
  (19 features), `oxlint --deny-warnings` sin errores, `tsc -b` sin errores,
  **121/121 tests verdes** (mismo recuento que ronda 1: la corrección no
  añadió ni quitó ningún test).
- El hallazgo de ronda 1 quedaba respaldado por una mutación manual mía
  (reintroducir los 3 atributos → 19/19 seguían en verde). Con los atributos
  ya retirados en el árbol real, no hace falta repetir esa mutación: la
  ausencia actual es exactamente el estado que la mutación manual demostró
  seguro.

## Cobertura de escenarios (@s ↔ test)

Releídos los 19 escenarios de `features/servicios.feature` contra
`src/components/Servicios.test.tsx` línea a línea (no solo la tabla de
`progress/tdd_servicios.md`):

- @s1: [x] `Servicios.test.tsx:89-98` — h2 "Servicios" localizado por nombre
  accesible (`getByRole('heading', {level:2, name:'Servicios'})`, ahora
  robusto sin depender de `aria-labelledby`), 5 h3 dentro de la sección en el
  orden literal `TITULOS_EN_ORDEN` (línea 18, escrito a mano).
- @s2: [x] `:100-112` — 5 botones, `aria-expanded="false"`, rótulo visible
  "Ver qué incluye", 0 `listitem`.
- @s3: [x] `:114-122` — `textContent` exacto `'Medicina generalVer qué
  incluye'`: prueba fuerte de ausencia de categoría/descripción (si se
  añadiera cualquier texto extra, la igualdad exacta fallaría).
- @s4: [x] `:124-146` — 7 puntos de "Cirugía y anestesia", literal propio, sin
  "✓".
- @s5: [x] `:148-161` — 4 puntos de "Diagnóstico de imagen".
- @s6: [x] `:163-176` — 5 puntos de "Medicina general".
- @s7: [x] `:178-198` — 6 puntos de "Análisis" (con la coma y "…" literales).
- @s8: [x] `:200-213` — 4 puntos de "Especialidades".
- @s9: [x] `:215-227` — `aria-expanded` "false" → "true" tras click.
- @s10: [x] `:229-241` — rótulo "Ver qué incluye" → "Ocultar detalle".
- @s11: [x] `:243-258` — plegar tras desplegar: atributo, rótulo y 0
  `listitem` vuelven al estado colapsado.
- @s12: [x] `:260-274` — las otras 4 tarjetas siguen `aria-expanded="false"`
  y sin `listitem` tras desplegar "Medicina general".
- @s13: [x] `:276-289` — dos tarjetas abiertas a la vez, cada una con su
  propio recuento (7 y 4).
- @s14: [x] `:291-300` — cada uno de los 5 títulos resuelve, por nombre
  accesible (`getByRole('button', {name: RegExp(titulo)})`), exactamente un
  botón; si dos compartieran nombre, `getByRole` lanzaría
  "multiple elements". Rótulo visible verificado como constante ("Ver qué
  incluye") frente al nombre accesible, que sí varía.
- @s15: [x] `:302-314` — bloque "Especialidades" con desglose vacío: sin
  botón (`queryByRole('button')` ausente), sin lista; las otras 4 conservan
  su botón.
- @s16: [x] `:316-353` — sexto punto en blanco en "Análisis": lista con
  exactamente 5 elementos reales, ninguno vacío.
- @s17: [x] `:355-364` — catálogo vacío: sin h2, sin ningún `heading`, sin
  botones, `container` vacío (`toBeEmptyDOMElement`).
- @s18: [x] `:366-396` — 8 textos prohibidos ausentes con las 5 tarjetas
  desplegadas; conjunto exacto de 26 puntos igual a
  `TODOS_LOS_PUNTOS_EN_ORDEN` (literal propio, líneas 21-48), con
  "Odontología" y "Endoscopia" repetidas en sus dos bloques reales.
- @s19: [x] `:398-417` — 0 `<img>`; guardas genéricas sobre `[src]`/`[srcset]`
  y `alt` como red de seguridad a futuro, consistentes con el propio texto de
  @s19 ("si en el futuro se añade alguna...").

19/19 escenarios con test concreto. Sin discrepancias entre la trazabilidad
de `progress/tdd_servicios.md` y el fichero real.

## Disciplina TDD

**Hallazgo de ronda 1, resuelto.** `Servicios.tsx:49-50` ya no contiene
`id="servicios"` / `aria-labelledby="servicios-titulo"` / `id="servicios-titulo"`.
Verificado que no queda ninguna referencia residual a esos atributos en
ningún otro fichero de `src/` (el enlace `href="#servicios"` de
`src/data/navegacion.ts:16` sigue sin destino con `id` en el DOM, tal y como
señalé en la ronda 1 — pendiente legítimo de una feature futura con su propio
test, no de esta).

**Resto de la disciplina TDD, ya sólida en ronda 1 y sin cambios en ronda 2:**

- `src/data/servicios.ts` — catálogo estático transcrito literal de
  `docs/datos-galapavet.md` §5. Comparado dato a dato en esta ronda otra vez:
  los 5 títulos y los 26 puntos (incluida la coma y los puntos suspensivos de
  "leishmania, leucemia felina…") coinciden exactamente, incluida la
  duplicación intencional de "Odontología" y "Endoscopia". Sin dato
  inventado.
- `src/components/Servicios-logica.ts` — 4 funciones puras
  (`rotuloBoton`, `puntosVisibles`, `tieneDesglose`, `nombreAccesibleBoton`),
  cada una con su ciclo Rojo-Verde documentado y su test en
  `Servicios-logica.test.ts`. `ROTULO_CERRADO` es privado del módulo.
- `TarjetaServicio`/`Servicios`: cada rama (`conDesglose`,
  `conDesglose && abierto`, `catalogo.length === 0`) sigue forzada por un
  `@s` (@s15, @s4-@s8/@s11, @s17 respectivamente). Ninguna rama sin test que
  la exija.
- Evidencia de Rojo-Verde-Refactor: sí, ciclo a ciclo, con rojos reales
  documentados (@s14, @s15, y el `id`/`aria-labelledby` retirado en ronda 2
  verificado por la vía inversa correcta: confirmar que quitarlo no rompe
  ningún test, no forzando un rojo artificial donde no lo hay).

## Patrón `doble-de-test-anclado-al-literal-no-al-simbolo`: sin violaciones

Releído `Servicios.test.tsx` completo: el único import de `../data/servicios`
es `import type { BloqueServicio }` (línea 5) — solo tipo, nunca el valor
`SERVICIOS`. La única aparición de la cadena `SERVICIOS` en el fichero es
dentro de un comentario (línea 79), no una referencia de código. Todos los
literales esperados (`TITULOS_EN_ORDEN`, `TODOS_LOS_PUNTOS_EN_ORDEN`, las 5
listas de @s4-@s8, los catálogos de fixture de @s15/@s16) están escritos a
mano en el propio test. `Servicios-logica.test.ts` tampoco importa
`ROTULO_CERRADO`: usa `'Ver qué incluye'` / `'Ocultar detalle'` como
literales propios. Sin violación en ningún fichero.

## Patrón `verde-por-vacuidad-en-puerta-de-verificacion`: no aplica

Releída la definición completa del patrón en
`.memoria-cache/patterns/testing/verde-por-vacuidad-en-puerta-de-verificacion.md`:
es sobre módulos de producción `puerta-*.ts` que leen un artefacto construido,
derivan un conjunto y fallan solo si encuentran algo, con el conjunto vacío
pasando en verde por descarte silencioso ("no miré" disfrazado de "0
violaciones"). `Servicios.tsx` no tiene ningún módulo `puerta-*` ni ningún
código de producción que derive un conjunto de un artefacto para decidir
pasa/no-pasa. Los bucles vacíos hoy en `Servicios.test.tsx:404-406`/`:410-415`
(@s19, 0 imágenes) son aserciones de test declaradas explícitamente por el
propio `@s19` como red de seguridad a futuro, no una puerta de producción —
mismo caso ya revisado y aceptado en `progress/judge_hero.md` para
`Hero.test.tsx` @s13. Sin violación.

## Calidad (lente de artesano)

### `src/data/servicios.ts`
Un solo tipo, una sola constante, `as const satisfies`, mismo patrón que
`src/data/navegacion.ts`. JSDoc cita la fuente exacta con fecha de
verificación.

### `src/components/Servicios-logica.ts`
4 funciones puras, un solo motivo de cambio cada una, nombres reveladores,
sin números mágicos, sin duplicación. Dentro del glob mordible de
`stryker.config.json` (`src/**/*-logica.ts`).

### `src/components/Servicios.tsx`
`TarjetaServicio` con `useState` propio: independencia de @s12/@s13 por
construcción. Colapso real (el `<ul>` no se monta si `abierto` es falso), no
CSS. Sin `className` ternario en el fichero. Sin lógica de decisión en el
JSX: toda rama consulta `Servicios-logica.ts`; el único condicional propio
(`catalogo.length === 0`) es una guarda de presencia trivial, mismo criterio
aplicado a `Hero.tsx` en su revisión. **El hallazgo de la ronda 1 ya no
existe**: el fichero completo, releído de nuevo, no tiene ningún atributo ni
elemento sin un test que lo exija.

### `src/components/Servicios-logica.test.ts` / `Servicios.test.tsx`
Un `describe` por función/escenario, nombres de `it` que dicen la aserción
concreta. Helpers (`renderizarServicios`, `obtenerSeccionServicios`,
`obtenerTarjeta`, `pulsarBoton`) evitan repetir montaje/consulta en los 19
escenarios, mismo patrón que `Cabecera.test.tsx`/`Hero.test.tsx`.

## Verificación de entorno (independiente)

- `node .harness/harness.mjs init`: verde — lint, typecheck, **121/121**
  tests.
- `grep -nE "TODO|FIXME|console\.(log|debug)|debugger"` sobre los 5 ficheros
  de esta feature: sin resultados reales (únicos "matches" son el nombre de
  variable `TODOS_LOS_PUNTOS_EN_ORDEN`, falso positivo de la regex).
- `grep` recursivo sobre `src/` de `servicios-titulo|id=.servicios.|aria-labelledby`:
  0 coincidencias — el hallazgo de ronda 1 no dejó residuo en ningún otro
  fichero.
- `docs/datos-galapavet.md` §5 comparado dato a dato contra
  `src/data/servicios.ts`: coinciden los 5 títulos y los 26 puntos.
- `feature_list.json`: exactamente 1 feature `in_progress` (`5:servicios`),
  `one_feature_at_a_time` respetado; `sdd: true`.
- `project-spec.md` §"Landing" lista `servicios` (línea 135); Decisión 3
  (línea 84) documenta el cambio de 12 tarjetas inventadas a 5 bloques
  reales.
- `progress/current.md`: describe la sesión activa (servicios en curso,
  features 1-4 cerradas), sin basura de sesiones ajenas.

## Checkpoints (`CHECKPOINTS.md`)

- **C1** — [x] `AGENTS.md`, `CLAUDE.md`, `CHECKPOINTS.md`,
  `harness.config.json`, `feature_list.json`, `progress/current.md`,
  `docs/workflow.md`, `docs/architecture.md`, `docs/conventions.md`,
  `docs/verification.md` presentes. `node .harness/harness.mjs init` termina
  exit 0.
- **C2** — [x] Una sola feature `in_progress` (`servicios`, id 5). Las
  `done` (ids 1-4) tienen tests que pasan (incluidos en los 121/121).
  `progress/current.md` describe la sesión activa sin basura previa.
- **C3** — [x] `src/components/Servicios.tsx` ya no contiene atributos sin
  test que los exija (hallazgo de ronda 1 resuelto y verificado por mí de
  forma independiente). El resto de `src/` respeta la arquitectura descrita
  en `project-spec.md` §"Arquitectura" (datos → componentes → lógica pura),
  sin dependencias nuevas ni logs de debug ni TODOs.
- **C4** — [x] Cada módulo de producción de esta feature tiene su test
  co-locado. Tests reales sobre DOM vía Testing Library, sin mocks de
  sistema de ficheros. `pnpm run test` → 121/121 verdes.
- **C5** — [ ] No evaluado: checkpoint de cierre de sesión, la feature sigue
  `in_progress` hasta que `mutation_tester` mida y el `craftsman_lead`
  decida.
- **C6** — [x] `features/servicios.feature` existe con cabecera de fuente y
  decisiones; `servicios` figura en `project-spec.md` §"Landing". 19/19
  escenarios con test concreto (mapa verificado línea a línea contra el
  fichero real). Sin violaciones de `doble-de-test-anclado-al-literal-no-al-simbolo`
  ni de `verde-por-vacuidad-en-puerta-de-verificacion`. Sin producción que
  ningún test rojo haya pedido — el único punto pendiente de ronda 1 quedó
  resuelto.
- **C7** — [ ] No evaluado por este rol: corresponde a `mutation_tester`,
  posterior a esta aprobación. Único fichero dentro del glob mordible de
  `stryker.config.json` para esta feature: `src/components/Servicios-logica.ts`,
  contra el umbral 1.0 de `harness.config.json`, `--concurrency 1`, leyendo
  la columna `# timeout` antes del score (`stryker.config.json` documenta que
  StrykerJS no muta de forma fiable JSX, así que `Servicios.tsx` queda fuera
  del glob por diseño, mismo patrón que `Hero.tsx`/`Cabecera.tsx`).

## Siguiente paso

`craftsman_lead` puede lanzar `mutation_tester` sobre
`src/components/Servicios-logica.ts`. Si supera el umbral 1.0 (con 0
timeouts confirmados antes de leer el score), la feature queda lista para
marcarse `done` en `feature_list.json`.
