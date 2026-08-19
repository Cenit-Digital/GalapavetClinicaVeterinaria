# TDD — cabecera_y_navegacion (id 3)

> Bitácora en vivo, un ciclo Rojo→Verde→Refactor a la vez. `tdd_craftsman`.

## Pre-condiciones verificadas

- `feature_list.json`: id 3 `cabecera_y_navegacion`, status `in_progress`. ✔
- `features/cabecera_y_navegacion.feature` existe, aprobado por el humano (puerta
  humana superada para las 19 features, ver `progress/current.md`). ✔
- `node .harness/harness.mjs init`: **verde** antes del primer test rojo (58/58
  tests, lint+typecheck sin avisos). Sin problemas de configuración nuevos
  detectados en este arranque.
- Primer componente de UI del proyecto: no existe todavía `src/components/` ni
  `src/data/`. Los creo en este ciclo.

## Decisiones de diseño tomadas antes del primer test (justificadas contra el contrato)

1. **`ancho` es una prop explícita de `Cabecera`, no una medición interna vía
   hook de `window.resize`.** Las cláusulas Given ("el ancho de la ventana es
   X") describen comportamiento observable, no mecanismo (`docs/gherkin.md`:
   "Sin detalles de implementación"). Un hook con `useEffect` que lea
   `window.innerWidth` no es aislable de "antes de medir" bajo
   `render()` de Testing Library (los efectos se vacían síncronamente dentro
   de `act()`), así que @s14 ("el ancho no es un número positivo, por no
   haberse medido todavía") sería imposible de disparar con un hook real sin
   trucos. La prop explícita hace las 15 escenarios triviales de expresar y
   deja la medición real (wiring a `window.innerWidth`/`resize`) para cuando
   exista `App`/`main.tsx`, que no es objeto de este `.feature`. Anotado como
   pendiente explícito más abajo, no escondido.
2. **La lógica de decisión (`esMovil`, el punto de corte, `esAncla`) vive en
   `src/components/Cabecera-logica.ts`** (patrón `*-logica.ts`,
   `docs/architecture.md` principio 6), la única superficie que
   `stryker.config.json` muta junto a `src/lib/**/*.ts`. El `.tsx` solo
   cablea.
3. **Los 8 destinos de navegación viven en `src/data/navegacion.ts`** como
   catálogo estático tipado (`docs/architecture.md`: "datos (src/data/)"),
   con `enlaces` como prop opcional de `Cabecera` (default = el catálogo
   real) para poder inyectar una lista vacía en @s15 sin tocar el dato de
   producción.
4. **Destinos internos de subpágina (no empiezan por "#") se interceptan en
   el panel móvil con `preventDefault` + `history.pushState`.** Un `<a
   href="/tienda">` real, clicado en jsdom, dispara el algoritmo de
   navegación completo de jsdom, que NO está implementado
   (`lib/jsdom/living/window/navigation.js:79`, `notImplemented(window,
   "navigation to another Document")`) y emite un `jsdomError` que
   `src/test/setup.ts` convierte en test rojo. Los destinos ancla (empiezan
   por "#") se dejan con comportamiento nativo del navegador (jsdom sí
   implementa la navegación de fragmento). La decisión de cuál rama tomar
   (`esAncla`) es la única lógica nueva de esta feature aparte de `esMovil`.
5. **El botón del menú móvil nunca cambia su nombre accesible** ("Abrir
   menú" fijo en @s7 Y en @s8, que lo referencia también estando abierto).
   El estado vive solo en `aria-expanded` (patrón
   `estado-condicional-en-atributo-aria-no-en-clase-css` extendido a
   nombres).
6. **Sin `Cabecera.module.scss` en este ciclo.** Ningún escenario del
   `.feature` aprobado ejercita estilo (el propio fichero lo declara
   explícitamente como fuera de alcance: "No se contrata la posición
   fija/sticky... es estilo puro"). Añadir un módulo SCSS vacío o con clases
   no usadas sería producción sin test rojo que la pida (Ley 1). Queda
   pendiente para un futuro pase de diseño visual, no escondido.
7. **Anti-tautología (`doble-de-test-anclado-al-literal-no-al-simbolo`,
   extendido a datos):** los tests de @s4/@s5 usan la prop `enlaces` por
   defecto (el catálogo real `ENLACES_NAVEGACION`, sin re-importarlo en el
   test) y comparan contra literales escritos a mano, igual que
   `site.test.tsx` hace con `datosNegocio`.

## Pendiente explícito (no bloqueante, documentado)

- La medición real de `window.innerWidth` (hook + listener de `resize`) y el
  ensamblaje de `App`/`main.tsx` que la inyecte en `<Cabecera>` no son objeto
  de este `.feature` (ningún escenario lo pide) y quedan para cuando exista
  esa pieza de integración.
- Estilo visual (posición fija, aspecto del botón hamburguesa, etc.) fuera de
  alcance por decisión explícita del propio contrato.

## Ciclos

### Ciclo 1 — @s1 (punto de corte declarado)
- ROJO: `src/components/Cabecera-logica.test.ts` importa
  `PUNTO_DE_CORTE_NAVEGACION_PX` de un módulo inexistente → falla al
  resolver el import (cuenta como rojo, Ley 2).
- VERDE: creado `src/components/Cabecera-logica.ts` con
  `export const PUNTO_DE_CORTE_NAVEGACION_PX = 1024`.
- REFACTOR: ninguno necesario (trivial).

### Ciclo 2 — @s2 (rama de escritorio en el ancho exacto)
- ROJO: `src/components/Cabecera.test.tsx` importa `Cabecera` (inexistente)
  → falla al resolver el import.
- VERDE: creados `src/components/Cabecera.tsx` (primer componente del
  proyecto) y `esMovil()` en `Cabecera-logica.ts` (`ancho <
  PUNTO_DE_CORTE_NAVEGACION_PX`). Render mínimo: `<nav aria-label="Navegación
  principal" />` vacío cuando `!movil`, nada más (trampa deliberada: el
  siguiente ciclo fuerza la rama móvil).
- REFACTOR: ninguno.

### Ciclo 3 — @s3 (rama móvil un píxel por debajo)
- ROJO: nuevo test pide `getByRole('button', {name: 'Abrir menú'})` con
  `ancho = PUNTO_DE_CORTE_NAVEGACION_PX - 1`; falla (`Unable to find...
  button`), confirmando que el componente aún no distingue rama móvil.
- VERDE: añadido `{movil && <button type="button">Abrir menú</button>}`.
- REFACTOR: ninguno.

### Ciclo 4 — @s4 (ocho destinos en orden en escritorio)
- ROJO: test pide los `link` dentro de `nav` y compara contra el array
  literal `['Reservar', 'Servicios', 'Campañas', 'Equipo', 'Blog',
  'Contacto', 'FAQ', 'Tienda']`; falla porque `<nav>` estaba vacío
  (`Unable to find an accessible element with the role "link"`).
- VERDE: creado `src/data/navegacion.ts` (catálogo estático
  `ENLACES_NAVEGACION`, primer fichero de `src/data/`) y `Cabecera` ahora
  acepta `enlaces` (prop opcional, por defecto el catálogo real) y mapea
  cada uno a `<li><a href={destino}>{nombre}</a></li>` dentro del `<nav>`.
- REFACTOR: `pnpm run lint` reveló que oxlint (`react/react-in-jsx-scope`)
  exige `React` en el ámbito de todo fichero con JSX **aunque el proyecto usa
  el runtime automático** (precedente ya visible en `src/lib/site.test.tsx`).
  Añadido `import React from 'react'` a `Cabecera.tsx` y
  `Cabecera.test.tsx`; como TypeScript (`noUnusedLocals`) exige que ese
  import se **use** de verdad, se le da un uso real: tipo de retorno
  `React.JSX.Element` en `Cabecera` y un helper de test
  `renderizarCabecera(props: React.ComponentProps<typeof Cabecera>)` que
  además elimina la duplicación de `render(<Cabecera .../>)` que ya
  aparecía 3 veces. `pnpm run lint && pnpm run typecheck` verdes tras el
  cambio; los 4 tests de este fichero + el de `Cabecera-logica.test.ts`
  siguen en verde.

### Ciclo 5 — @s5 (cada enlace de escritorio apunta a su destino)
- Test tabla (`it.each`) contra los 8 pares `[nombre, destino]` (literal,
  no importado de `src/data/navegacion.ts`). Al ejecutarlo pasó **a la
  primera** (el `href={enlace.destino}` del ciclo 4 ya lo satisfacía).
  Siguiendo `docs/tdd.md` ("un test que pasa a la primera no demuestra
  nada"), lo verifiqué de verdad: corrompí a mano el destino de "Tienda" en
  `src/data/navegacion.ts` (`/tienda` → `/tienda-rota`), confirmé que
  **ese** subtest concreto se pone rojo, y revertí el literal. Verificación
  retroactiva explícita, sin producción nueva (Ley 3: nada que escribir, ya
  estaba ahí).

### Ciclo 6 — @s6 (móvil cerrado: sin nav, botón con aria-expanded="false", sin enlaces de navegación)
- ROJO: `getByRole('button',{name:'Abrir menú'})` sin `aria-expanded`
  todavía → `toHaveAttribute('aria-expanded','false')` falla
  (`Received: null`).
- VERDE: añadido `aria-expanded={abierto}` con `const abierto = false`
  (sin `useState` todavía — no hay test que exija alternar el estado en
  este ciclo, Ley 3).
- Añadido helper de test `enlacesDeNavegacion()` que filtra por los 8
  nombres reales de navegación (excluye a propósito el futuro enlace del
  logotipo, que @s12 añadirá y que NO es "navegación" según el propio
  `.feature`). Refactor menor de @s4 para reusar `NOMBRES_EN_ORDEN` en vez
  de repetir el array literal.

### Ciclo 7 — @s7 (abrir el menú móvil despliega los 8 destinos)
- ROJO: tras `userEvent.click(boton)`, `aria-expanded` seguía en `"false"`
  (el ciclo anterior lo dejó fijo).
- VERDE: `useState(false)` + `useId()` para `idPanel`; el botón gana
  `aria-controls={idPanel}` y `onClick` que alterna el estado; nuevo `<div
  id={idPanel}>` con la misma lista de enlaces, montado solo cuando `movil
  && abierto` (el panel deja de existir en el documento al cerrar, no se
  oculta con CSS — exigencia explícita del propio `.feature`, comentario
  #7).
- REFACTOR: valorado extraer la lista `<ul>{enlaces.map(...)}</ul>` a un
  helper único para escritorio y panel (hoy son idénticas). Decidido **no
  hacerlo todavía**: @s9/@s10 van a añadir `onClick` (cerrar + interceptar
  navegación) SOLO a los enlaces del panel, así que abstraerlas ahora se
  desharía dos ciclos después. Duplicación aceptada conscientemente,
  anotada aquí en vez de escondida.

### Ciclo 8 — @s8 (pulsar de nuevo cierra el menú)
- Escrito el test (abrir, luego pulsar otra vez) y **pasó a la primera**:
  consecuencia directa y genérica del `setAbierto(prev => !prev)` ya
  construido en el ciclo 7 (no hay rama especial para "cerrar"). Verificado
  que no es vacuo: mutado a mano `setAbierto(prev => !prev)` →
  `setAbierto(true)`, confirmado que ESTE test concreto se pone rojo
  (`Received: aria-expanded="true"`), revertido. Ningún cambio de
  producción en este ciclo (Ley 3).

### Ciclo 9 — @s9 (enlace de sección en el panel: navega y cierra)
- ROJO: tras abrir el panel y pulsar "Servicios", `window.location.hash` ya
  valía `"#servicios"` (comportamiento nativo de jsdom para navegación de
  fragmento, sin código nuevo), pero `aria-expanded` seguía en `"true"` y el
  panel seguía en el documento → falla ahí.
- VERDE: los `<a>` del panel ganan `onClick={() => setAbierto(false)}`
  (solo el panel; los enlaces de escritorio no lo necesitan, ningún
  escenario lo pide).
- Añadido `beforeEach` en el fichero de test que resetea
  `window.history.pushState(null, '', '/')`: `window` es un singleton por
  fichero de test en Vitest/jsdom, así que sin este reset la URL que deja
  un test contaminaría al siguiente.

### Ciclo 10 — @s10 (enlace de subpágina en el panel: navega y cierra)
- ROJO: pulsar "Tienda" (href="/tienda") con el `onClick` genérico del
  ciclo 9 (que no intercepta nada) dispara el algoritmo de navegación
  completo de jsdom, que **no está implementado**
  (`node_modules/jsdom/lib/jsdom/living/window/navigation.js:79`,
  `notImplemented(window, "navigation to another Document")` — verificado
  leyendo el fuente de jsdom antes de diseñar el componente). El mensaje se
  imprime a la consola de Node pero, a diferencia de lo anotado en
  `src/test/setup.ts` para otros casos, **no** pasa por el `console.error`
  espiado (la guarda de `afterEach` no lo captura), así que el test falló
  limpiamente por la aserción: `window.location.pathname` se quedó en
  `"/"` en vez de `"/tienda"`.
- VERDE: nueva función pura `esAncla(destino)` en `Cabecera-logica.ts`
  (`destino.startsWith('#')`). El `onClick` del panel ahora: si el destino
  NO es ancla, `evento.preventDefault()` +
  `window.history.pushState(null, '', destino)`; si lo es, deja el
  comportamiento nativo del navegador. Después, siempre cierra el menú.
- `pnpm run lint && pnpm run typecheck`: limpios tras el ciclo.

### Ciclo 11 — @s11 (ensanchar la ventana con el menú abierto no deja el panel colgado)
- Test: abre el panel, luego `rerender(<Cabecera ancho={PUNTO_DE_CORTE...} />)`
  (misma instancia, prop nueva). **Pasó a la primera**: consecuencia directa
  de que `movil`/`hayEnlaces` se recalculan en cada render a partir de la
  prop `ancho` (nunca se congelan), así que el panel/botón dejan de
  cumplir su condición de render aunque `abierto` siga en `true`
  internamente — no hace falta ningún efecto que "cierre" el menú al
  ensanchar. Verificado que no es vacuo: mutado a mano `const movil =
  esMovil(ancho)` → `const [movil] = useState(() => esMovil(ancho))`
  (congela el valor en el primer render, el bug real que este escenario
  existe para prevenir), confirmado que el test se pone rojo (el botón
  seguía en el documento tras el rerender), revertido. Ningún cambio de
  producción en este ciclo.

### Ciclo 12 — @s12 (el logotipo lleva al inicio y rotula al cliente real)
- ROJO: `getByRole('link', {name: /Galapavet/})` no encontraba nada (la
  cabecera no tenía bloque de marca todavía).
- VERDE: añadido `<div><a href="#inicio">{datosNegocio.identidad.
  nombreComercial}</a><p>{datosNegocio.identidad.descriptor}</p></div>`
  antes de las ramas condicionales (visible en cualquier ancho y con
  `enlaces` vacío, tal como exige @s15 más adelante). Dato importado de
  `../lib/site` (fuente única, feature `datos_negocio` ya cerrada), nunca
  escrito a mano.

### Ciclo 13 — @s13 (la cabecera no anuncia urgencias ni contiene teléfonos)
- Test de regresión (mismo estilo que `site.test.tsx`: comprobar la
  AUSENCIA de un texto/atributo). Pasó a la primera porque la cabecera
  nunca ha renderizado ese contenido — es exactamente el comportamiento que
  la Decisión 2 de `project-spec.md` exige. No se fuerza un rojo artificial:
  el propio proyecto ya acepta este patrón para guardas de ausencia (ver
  `src/lib/site.test.tsx` @s3/@s14).

### Ciclo 14 — @s14 (ancho no medible cae a rama móvil)
- ROJO: `renderizarCabecera({ ancho: NaN })` mostraba la rama de
  escritorio (`NaN < 1024` es `false`, así que `esMovil` devolvía `false`).
- VERDE: `esMovil` gana una guarda previa: `if (!(anchoVentana > 0)) return
  true`.
- Reforzado con `it.each` para NaN, `0` y `-100` (los tres leen "no es un
  número positivo" tal cual lo dice el escenario). Análisis de mutación
  hecho a mano para no sorprender al `mutation_tester`: el mutante que
  cambia `anchoVentana > 0` por `anchoVentana >= 0` es **equivalente
  genuino** para este código — el único valor donde ambas expresiones
  difieren es exactamente `0`, y en ambos casos el resultado final de
  `esMovil(0)` es `true` (con `>`, por la guarda explícita; con `>=`,
  porque cae al `return anchoVentana < 1024` de todas formas, que también
  da `true` en `0`). Ninguna entrada real distingue las dos versiones.
  Documentado aquí para no reabrir la investigación si Stryker lo reporta
  superviviente.

### Ciclo 15 — @s15 (lista de destinos vacía no renderiza navegación vacía)
- ROJO: con `enlaces: []` y ancho móvil, el botón "Abrir menú" existía
  igualmente (no había guarda de vacuidad).
- VERDE: `const hayEnlaces = enlaces.length > 0`, añadido como condición
  extra a las tres ramas (`nav`, botón, panel). El bloque de marca queda
  fuera de esa guarda a propósito (ya lo pedía @s12, y @s15 lo confirma
  explícitamente).

### Refactor final (en verde, tras el ciclo 15)
- Extraído `ListaDeEnlaces` (componente interno, no exportado) para
  eliminar la duplicación entre la lista de escritorio y la del panel
  móvil, que ya habían convergido de nuevo tras el ciclo 10 (ambas
  `<ul><li><a>`, la única diferencia es el `onClick` opcional `alPulsar`).
  `pnpm exec vitest run src/components` y `pnpm run lint && pnpm run
  typecheck` verdes tras el cambio.
- `pnpm exec vitest run` (suite completa) y `node .harness/harness.mjs
  init`: verdes de punta a punta — 82/82 tests, lint y typecheck sin
  avisos.

## Trazabilidad (@s → test)

Todos en `src/components/Cabecera.test.tsx` salvo donde se indica.

- @s1 → `src/components/Cabecera-logica.test.ts` › `describe('@s1...')`
- @s2 → `describe('@s2...')`
- @s3 → `describe('@s3...')`
- @s4 → `describe('@s4...')`
- @s5 → `describe('@s5...')` (8 casos `it.each`, uno por par nombre/destino)
- @s6 → `describe('@s6...')`
- @s7 → `describe('@s7...')`
- @s8 → `describe('@s8...')`
- @s9 → `describe('@s9...')`
- @s10 → `describe('@s10...')`
- @s11 → `describe('@s11...')`
- @s12 → `describe('@s12...')`
- @s13 → `describe('@s13...')`
- @s14 → `describe('@s14...')` (3 casos `it.each`: NaN, 0, negativo)
- @s15 → `describe('@s15...')`

Total: 15/15 escenarios cubiertos, 24 tests concretos (2 ficheros: 23 en
`Cabecera.test.tsx` + 1 en `Cabecera-logica.test.ts`; `it.each` cuenta cada
caso como un test).

## Ficheros de producción creados en esta sesión

- `src/components/Cabecera-logica.ts` — `PUNTO_DE_CORTE_NAVEGACION_PX`,
  `esMovil`, `esAncla` (mordibles por mutación).
- `src/components/Cabecera.tsx` — el componente (`Cabecera` exportado,
  `ListaDeEnlaces` interno).
- `src/data/navegacion.ts` — catálogo `ENLACES_NAVEGACION` (primer fichero
  de `src/data/`).

## Estado final

- `pnpm exec vitest run`: **82/82 verdes** (58 previos de `tokens_marca` +
  `datos_negocio`, 24 nuevos de esta feature: 23 en `Cabecera.test.tsx` + 1
  en `Cabecera-logica.test.ts`).
- `pnpm run lint && pnpm run typecheck`: sin errores ni avisos.
- `node .harness/harness.mjs init`: verde de punta a punta.
- No se marca `done` en `feature_list.json`: falta `judge` y
  `mutation_tester` (regla dura del propio rol).
- Nada pendiente escondido: los dos puntos "Pendiente explícito" de la
  cabecera de este documento siguen abiertos y documentados, no son un
  bloqueo para esta feature.

## Ronda 2 — corrección por `progress/judge_cabecera_y_navegacion.md` (CHANGES_REQUESTED)

Único cambio requerido por el `judge`: @s11 no verificaba su propia razón de
ser (el panel debe dejar de existir en el documento tras ensanchar, no solo
el botón). No hay `progress/mutation_cabecera_y_navegacion.md` de esta
ronda — el `judge` paró antes de mutación.

### Ciclo 16 — @s11 reforzado (el panel deja de existir, no solo el botón)
- Añadida en `src/components/Cabecera.test.tsx` (`describe('@s11...')`):
  captura de `idPanel` (`aria-controls` del botón) **antes** del `rerender`,
  y tras el `rerender` la aserción que faltaba:
  `expect(idPanel === null ? null : document.getElementById(idPanel)).toBeNull()`
  (mismo patrón ya usado en @s8/@s9/@s10). No se tocó producción: el bug que
  este escenario previene no existe en el código actual (ver ciclo 11).
- Ejecutado solo este test contra la producción sin tocar:
  `pnpm exec vitest run src/components/Cabecera.test.tsx -t "@s11"` → **verde**
  (1 passed), como se esperaba.
- **Verificación de no-vacuidad, reproduciendo el mutante exacto que el
  `judge` documentó**: mutado a mano `Cabecera.tsx:61` de
  `{hayEnlaces && movil && abierto && (` a `{hayEnlaces && abierto && (`
  (desacopla el panel de `movil`) y corrido de nuevo el mismo test aislado →
  **rojo real**: `expect(idPanel === null ? null : document.getElementById(idPanel))…`
  falla porque el panel (con sus 8 enlaces, incluida "Tienda" → `/tienda`)
  seguía en el documento tras el rerender a escritorio. Revertida la
  mutación (`Cabecera.tsx` vuelve exactamente a
  `{hayEnlaces && movil && abierto && (`), sin diff de producción.
- VERDE de nuevo tras el revert: `pnpm exec vitest run` → **82/82 verdes**
  (mismo conteo que la ronda 1; ningún test nuevo, se reforzó uno
  existente). `pnpm run lint && pnpm run typecheck` limpios.
- `node .harness/harness.mjs init`: verde de punta a punta (entorno, ficheros
  base, `feature_list.json`, lint+typecheck, 82/82 tests).

### Estado tras la ronda 2
- C6 del `judge` (ronda 1) queda cerrado: @s11 ahora verifica sus tres
  cláusulas (panel inexistente, botón inexistente, navegación de escritorio
  completa).
- Sigue sin marcarse `done` en `feature_list.json`: falta nueva aprobación
  de `judge` y, tras ella, `mutation_tester` por encima del umbral.

## Ronda 3 — corrección por `progress/mutation_cabecera_y_navegacion.md` (FAIL)

Contexto: el `judge` aprobó la ronda 2 (`APPROVED`, sin cambios requeridos) y
delegó C7 al `mutation_tester`. Esa medición corrió sobre el único fichero
mordible de la feature (`src/components/Cabecera-logica.ts`, patrón
`*-logica.ts` de `stryker.config.json`) y dio **FAIL**: 14/16 sobre mutantes
no equivalentes (87.50%, umbral 100%). De los 3 supervivientes, la línea 18
(`esMovil`, `> 0` vs `>= 0`) es un mutante equivalente ya documentado en el
Ciclo 14 y reverificado de forma independiente por el `mutation_tester` con
una prueba exhaustiva sobre todo el dominio — no requiere corrección. Los
otros 2 (líneas 33-34, dentro de `esAncla`) son **huecos reales de
aserción**: `esAncla` solo se ejercitaba indirectamente a través de
`Cabecera.tsx` (@s9/@s10), y para un destino tipo `#servicios` ambas rutas
posibles (navegación nativa de fragmento vs `preventDefault` +
`history.pushState`) terminan en el mismo `window.location.hash` final, así
que un mutante que rompe `esAncla` por dentro puede sobrevivir sin que
@s9/@s10 lo detecten. El propio informe de mutación proponía dos vías de
cierre; se eligió la más directa y menos frágil: un test unitario que
ejercita `esAncla` en sí, sin pasar por `Cabecera.tsx` ni por el
comportamiento de navegación de jsdom.

### Ciclo 17 — test directo de `esAncla` (cierra los 2 supervivientes reales de mutación)
- Añadido en `src/components/Cabecera-logica.test.ts` un nuevo `describe`
  ("esAncla distingue un destino de sección... de uno de subpágina") con dos
  `it`: `esAncla('#servicios')` debe ser `true`; `esAncla('/tienda')` y
  `esAncla('tienda#')` deben ser `false` (el segundo caso, un destino que
  termina en "#" pero no empieza por él, es el que distingue explícitamente
  `startsWith` de `endsWith` en la dirección "falso positivo", no solo en la
  dirección que ya cubría el primer caso).
- Ejecutado solo contra la producción sin tocar
  (`pnpm exec vitest run src/components/Cabecera-logica.test.ts`): **3/3
  verdes a la primera** (la implementación de `esAncla` ya era correcta;
  ningún cambio de producción en este ciclo, Ley 3).
- **Verificación de no-vacuidad, reproduciendo los dos mutantes exactos que
  documentó `mutation_tester`:**
  1. Mutado a mano `Cabecera-logica.ts:34` de `return destino.startsWith('#')`
     a `return destino.endsWith('#')` (mutante `MethodExpression`, id 15 en
     `mutation.json`). Corridos los 2 tests nuevos en aislado
     (`-t "esAncla"`) → **rojo real en ambos**: `esAncla('#servicios')`
     devuelve `false` en vez de `true`; `esAncla('tienda#')` devuelve `true`
     en vez de `false`.
  2. Revertido. Mutado a mano el cuerpo completo de la función a `{}`
     (mutante `BlockStatement`, id 14 en `mutation.json`, la función pasa a
     devolver `undefined` siempre). Corridos los mismos 2 tests → **rojo
     real en ambos**: `expected undefined to be true` / `expected undefined
     to be false`.
  3. Revertido a la versión original (`return destino.startsWith('#')`).
     `git status --porcelain` sobre `Cabecera-logica.ts` sin diferencias
     residuales tras el revert (fichero aún no trackeado por git en esta
     sesión, así que se comparó el contenido restaurado línea a línea contra
     el original leído al inicio del ciclo).
- VERDE de nuevo tras el revert final: `pnpm exec vitest run` (suite
  completa) → **84/84 verdes** (82 previos + 2 tests nuevos de este ciclo).
  `pnpm run lint && pnpm run typecheck`: sin errores ni avisos.
- `node .harness/harness.mjs init`: verde de punta a punta (entorno, ficheros
  base, `feature_list.json` con 19 features, lint+typecheck limpios, 84/84
  tests).
- No se tocó `src/components/Cabecera.tsx` ni `src/data/navegacion.ts`: el
  informe de mutación señalaba exclusivamente `Cabecera-logica.ts` (única
  superficie mordible) y el hueco vivía enteramente en el test, no en la
  producción.

### Estado tras la ronda 3
- Los 2 huecos reales de mutación (`esAncla`, líneas 33-34) quedan cerrados
  con test directo, sin tocar producción. El superviviente restante (línea
  18, `esMovil`) sigue documentado como mutante equivalente genuino desde el
  Ciclo 14, reconfirmado independientemente por `mutation_tester` en la
  ronda 2 de mutación.
- Cambio limitado a `src/components/Cabecera-logica.test.ts` (2 tests
  nuevos). Nada fuera de lo señalado en
  `progress/mutation_cabecera_y_navegacion.md` fue tocado.
- Sigue sin marcarse `done` en `feature_list.json`: corresponde a
  `craftsman_lead` pedir nueva revisión del `judge` sobre este cambio de
  test y, tras su aprobación, una nueva medición de `mutation_tester` antes
  de cerrar la feature id 3.


