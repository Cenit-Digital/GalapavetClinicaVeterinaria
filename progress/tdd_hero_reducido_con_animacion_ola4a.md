# TDD — feature 48 `hero_reducido_con_animacion`, ola 4a: la comprobación estática de @s10

> `tdd_craftsman`, 14/10/2026. Ola de CORRECCIÓN tras el panel de revisión (el `judge` y cuatro
> revisores independientes). Ficheros míos: `src/lib/diseno/medicionEstable.ts`,
> `src/lib/diseno/medicionEstable.test.ts` y `src/lib/diseno/medicionEstableSpecsReales.test.ts`.
> No he tocado `features/`, `feature_list.json`, `progress/current.md`, `project-spec.md`, ni los
> ficheros de los otros dos agentes (`lectorDeEstilos*`, `movimientoRespetuoso*`, `escalaMovimiento*`,
> `accesibilidad-movimiento*`, `tests/e2e/**`, `playwright.config.ts`, `src/components/**`). No hay
> `git add/commit/stash/...`: todo queda en el árbol de trabajo. No marco nada `done`.

## 0. Resultado en una tabla (MEDIDO)

| Qué | Antes | Después |
| --- | --- | --- |
| Pruebas de mis dos ficheros de prueba (Vitest) | 139 (135 + 4) | **425** (419 + 6), todas en verde |
| Veredictos sobre los 31 specs reales (instantánea 09:42) | 11 pasa · 185 exento · 0 incumple | **11 · 185 · 0**, ni un bloque cambia de veredicto |
| El mismo recuento con los 31 specs convertidos a CRLF | — | **11 · 185 · 0**, idéntico |
| Árbol vivo al terminar (otro agente ha editado `tests/e2e`) | — | 11 pasa · 196 exento · 0 incumple: **0 veredictos cambiados** y 11 bloques nuevos, todos `exento`, de `esperar-entrada-terminada`, `hero-reducido` y `movimiento` |
| Mutantes de `medicionEstable.ts` (StrykerJS) | 437 (predicción del panel sobre el módulo anterior; la ola 1B no ejecutó Stryker, hizo sabotaje a mano) | **791, todos muertos (100 %)**, 0 Timeout, 0 NoCoverage, 0 RuntimeError; ver el apartado 6 |
| Bucles que avanzan un índice a mano | 5 (`while` ×3, `for` por índice ×2) | **0**: solo quedan dos `for…of` sobre iterables finitos |
| Lint (`oxlint --deny-warnings`) y `tsc` sobre mis tres ficheros | 0 | **0 errores y 0 avisos** (`tsc -p tsconfig.app.json`, `tsc -p tsconfig.e2e.json --noEmit`) |
| Las sondas del PANEL (94 entradas de sus guiones, antiguo contra nuevo) | — | 40 cambian de veredicto (a `incumple`, lo esperado, entre ellas el sabotaje REAL de `tipografia.spec.ts` @s23: `pasa` → `incumple`) y 54 no (controles y límites del contrato); ver el apartado 6b |
| Globales, con el estado de los otros agentes a las 15:44 (módulo y pruebas ya congelados) | — | `pnpm run lint` salida 0 · `pnpm run typecheck` (`tsc -b`) salida 0 · `tsc -p tsconfig.e2e.json --noEmit` salida 0 · `pnpm test`: 90 ficheros y 2388 pruebas en verde |

## 1. Lo que se ha cambiado en el módulo

`medicionEstable.ts` se ha REESCRITO por dentro (de 385 a 800 líneas, con la cabecera y los límites al día);
la API pública es la misma más dos añadidos que el contrato no prohíbe y que piden los hallazgos A5 y A8:

- `InformeDeMedicionEstable.bloquesConOnly` (títulos de los bloques declarados con `test.only(`), y
  `pasa` pasa a ser `false` si hay alguno.
- `esFicheroDeTestDePlaywright(ruta)`: el `testMatch` por defecto de Playwright (`**/*.@(spec|test).?(c|m)[jt]s?(x)`),
  que el cableado usa para comprobar que ningún fichero que Playwright ejecuta queda sin leer.

Por qué una reescritura y no un parche: A7 exige que ningún mutante pueda dejar un bucle sin terminar, y los
cinco recorridos por índice (`finDeLaCadena`, `finDeLaExpresionRegular`, `enmascarar`, `posicionDelCierre`,
`aperturaDelCuerpo`) eran el problema. El texto se lee ahora con UNA expresión regular global y `replace`
(los comentarios, las cadenas y las expresiones regulares), con una pila para emparejar `()`, `[]` y `{}`
(`for…of` sobre `estructura.split('').entries()`) y con `matchAll`. A1, A2 y A3 piden además asociar espera,
emulación, navegación y medición por la VARIABLE de página, y eso no cabía en el modelo anterior
(«posición del primer evento de cada tipo en todo el bloque»).

El modelo nuevo, en cinco líneas: cada evento (`espera`, `navega`, `emula-reduce`, `emula-otra`, `congela`,
`coloca`, `mide-*`) lleva la página sobre la que actúa (el receptor de `.goto(`, de `.emulateMedia(`, el primer
argumento de la espera, el `{ page }` de `AxeBuilder`, o, en una medición, la variable de página nombrada más
cerca antes); una función local del fichero que el test llama aporta sus eventos en el sitio de la llamada, con
sus parámetros traducidos a los argumentos (`medirAltos(paginaSinFuente)` hace de `pagina` → `paginaSinFuente`);
una función declarada DENTRO del test cuenta donde se escribe (y traduce con su primera llamada); y el veredicto
se calcula POR PÁGINA MEDIDA (incumple si alguna incumple).

## 2. Mapa HALLAZGO → test (fichero `src/lib/diseno/medicionEstable.test.ts` salvo que se diga)

Los nombres son el `describe` y el título; no cito números de línea.

| Hallazgo | Test que lo fija |
| --- | --- |
| **A1** flecha de expresión | `@s10: funciones locales del mismo fichero (un nivel)` › «una función flecha de expresión (sin llaves) SÍ se resuelve…» (el test que fijaba el error como correcto se invirtió a `incumple`); `@s10, A1 de la revisión…` › `it.each` «%s se resuelve: el bloque que la llama mide el titular, incumple sin esperar y pasa si espera antes» (9 formas: flecha de expresión, con `await`, objeto entre paréntesis, con `;`, cadena de llamadas en varias líneas, parámetro por defecto con llamada, flecha con parámetros desestructurados, `(): () => Promise<void>` y `function` con parámetros desestructurados), «una flecha de expresión termina donde acaba la expresión…», «…que acaba en un operador sigue en la línea de abajo…», «…dentro de una llamada acaba donde se cierra esa llamada» |
| **A1** referencia (`evaluate(cajaDe)`) y `=>` como ángulo | mismo `describe` › «una función pasada por referencia ("locator.evaluate(cajaDe)") cuenta como uso…», «una referencia a una función con otro nombre que lo contiene…»; `A2 de la revisión: los parámetros…` › «una función pasada por referencia ("ejecutar(esperarPortada)") conserva sus nombres…» y «…se sitúa con la página que el bloque nombra a su altura…» |
| **A2 (a)** sin `await`, `void`, `.catch(`, `.then(`, `try` | `A2 y A3 de la revisión…` › `it.each(FILAS_DE_LA_REVISION)` filas «A2a: …» (7); `A6 …: las coincidencias de cada patrón con cualquier espaciado` › «una espera con %s y "catch" o "then" detrás se traga», «una espera dentro de un "try" escrito %s se traga», «un ".then(" o un ".catch(" de OTRA llamada, más adelante en el fichero, no traga la espera» |
| **A2 (b)** otra página (`context.newPage()`, tipografía @s23) | mismas filas «A2b: …» (9: emulación sobre otra página, espera sobre otra, dos páginas con la segunda sin emular —la forma exacta de `tipografia.spec.ts` @s23, medida por una función local—, y las mismas con la emulación puesta), `A2 de la revisión: los parámetros…` (correspondencia parámetro → argumento con comas dentro de `[]`, `{}`, `()` y cadenas, con espacios, valores por defecto, parámetros opcionales, desestructurados, sin paréntesis, con `$`, menos argumentos que parámetros…) |
| **A2 (c)** la última emulación antes del `goto` | filas «A2c: …» (6: `reduce` y luego `no-preference`, el orden inverso, `reducedMotion: null`, otra emulación que no toca el movimiento, `reduce` + `goto` + `no-preference` + `reload`, emulación sin `await`) |
| **A2 (d)** una navegación posterior invalida | filas «A2d: …» (8: `goto`, `reload`, `goBack`, `goForward` tras la espera; espera ANTES del `goto`; dos `goto` y espera tras el último; navegación de OTRA página que no invalida; `reduce` + `goto` + `reload`) y `A6 …: las coincidencias…` › «una navegación con %s invalida la espera anterior» |
| **A2 (e)** `.include(` por llamada | filas «A2e: …» (7) y `A6 …: dónde acaba una expresión…` › «un ".include(" de lo que sigue a la cadena del AxeBuilder, tras su cierre, no la acota» |
| **A3** las cadenas no son código | filas «A3: …» (14: el nombre de la espera en un mensaje, en una plantilla y ENTERO con su `await` en una cadena; la emulación entera en una cadena; `page.goto(` en una cadena; congelar y colocar en una cadena; `Animation.setPlaybackRate` como segundo argumento de `send(` o en un `console.log`; `send(` con plantilla y con espacios; `reducedMotion` con variable; una cadena con la forma de la emulación dentro de OTRA opción; `/Reservar cita/` en una expresión regular) y `A6 …: las cadenas, los comentarios y los alias` › «congelar y colocar: solo la colocación es código…» |
| **A4** ámbito de las funciones | `A4 de la revisión: una función declarada dentro de un test es de ese test` (6 pruebas + el sub-`describe` «dos funciones del fichero con el mismo nombre (dos "describe"): el bloque ve la declarada más cerca ANTES de él»: contaminación en los dos órdenes, `function` dentro de un test vista desde otro, flecha propia que cuenta donde se escribe, la del fichero oculta por una homónima del bloque, homónimas del fichero por cercanía, antes y después del bloque, flecha y `function` ordenadas por dónde se declaran); `A6 …: lo que la primera corrida de StrykerJS dejó vivo` › «la función del fichero se ve aunque OTRO test declare dentro una con el mismo nombre», «una función del fichero pegada al test que la llama ("}test(") es la más cercana ANTES de él»; `A6 …: las coincidencias de cada patrón con cualquier espaciado` › «una función declarada en el bloque y que nadie usa no aporta nada: ni su espera, aunque su parámetro se llame "page"» y «…solo pasada por referencia SÍ se usa» |
| **A5** `test.only`, `fail`, `fixme`, `skip`, alias | `A5 de la revisión: test.only, test.fail, test.fixme, test.skip y los alias también son bloques` (los cuatro modificadores con espaciados, `only` hace que el fichero NO pase y se nombre, los condicionales sin función de cuerpo no son bloques, `test.describe.only(`/`test.step(`/`test.use(` no lo son, alias `const t = test` con `let`/`var`/tipo/`.extend(`, alias que no lo son, alias con `$`); en `medicionEstableSpecsReales.test.ts` › «ningún test.only() olvidado deja pasar la batería ejecutando un solo test» y «todos los ficheros leídos pasan la comprobación…» (`pasa` es falso con un `only`) |
| **A6** espaciados, comentario final, `.some`/`.every`, parámetros con llaves | `A6 de la revisión: cada patrón se lee con cualquier espaciado…` (`currentTime=0`, `.cancel (`, `.screenshot (`, `toHaveScreenshot (`, `page.screenshot (`, `expect (page)`, `) .toHaveScreenshot`, `level : 1`, `function  f`, `function f (`, `const  f =`, `=async(`, `async  (`, comentario final sin salto de línea y bloque sin cerrar, función con la espera declarada dentro de un test y llamada desde otro, parámetros desestructurados); `A6 y A7…`, `A6 …: dónde acaba una expresión y cómo se juntan las líneas` y `A6 …: las coincidencias de cada patrón con cualquier espaciado` (cada patrón con espacio antes y después del punto, salto de línea, `await` doble) |
| **A7** sin bucles que no terminen | estructural: `grep` de `while` y `for (` por índice sobre el módulo = 0 (solo `for…of` sobre iterables finitos) y **0 mutantes en Timeout** en las cinco corridas de StrykerJS (en la primera, con el diseño nuevo ya hecho, había 0; la revisión predecía 22) |
| **A8** glob ampliado | `medicionEstableSpecsReales.test.ts` › «se leen TODOS los ficheros de test que Playwright ejecuta bajo tests/e2e, también los de subcarpetas, ".test" y módulos» (compara el glob `**/*.{spec,test}.{ts,tsx,js,jsx,mts,cts,mjs,cjs}` con TODO lo que hay bajo `tests/e2e`, filtrado por `esFicheroDeTestDePlaywright`) y `A8 de la revisión…` (28 filas de nombres que se leen y que no) |
| **A9** equivalentes | ver el apartado 7: el código redundante se ha QUITADO; no queda ningún mutante equivalente que justificar |

La tabla firmada de 16 filas de @s10 sigue entera y en verde (`@s10 (tabla de 16 filas del contrato)…`, con la guarda «la tabla tiene
exactamente las 16 filas del contrato»); las 51 filas nuevas de `FILAS_DE_LA_REVISION` la AMPLÍAN.

## 3. Ciclos Rojo → Verde → Refactor (con honestidad sobre el ritmo)

| # | Qué | ROJO | VERDE | REFACTOR |
| --- | --- | --- | --- | --- |
| 1 | A1 (el test que fijaba el error) | `expected 'exento' to be 'incumple'` (1 rojo de 135) | — (entra en la reescritura del 3) | — |
| 2 | A1–A6 y A8 en bloque | 88 rojos de 293; fallan por la razón escrita (veredicto equivocado, `bloquesConOnly` inexistente, `esFicheroDeTestDePlaywright` sin exportar) y no por un error de sintaxis | — | — |
| 3 | La reescritura de A7 que da verde | — | `medicionEstable.ts` nuevo: 293/293 en verde, 0 veredictos cambiados en los 31 specs | `finDelPar`, `Coincidencia`, `rangoContiene`; lint (`toSorted`, `consistent-function-scoping`) |
| 4 | Corrida 1 de StrykerJS: 858 mutantes, 122 supervivientes, 1 sin cobertura, 0 Timeout | los 123 son los rojos | de 293 a 414 pruebas, en tablas por familias (espaciados de cada patrón, `\S*` en lugar de `\s*`, flechas con `=>` interior, `;`, CRLF, argumentos con comas dentro de `[]`/`{}`/`()`, referencias, páginas por parámetro, función con página propia…) y quitar lo redundante (apartado 7) | `argumentosDe` con `.slice(1, -1)`, `Traduccion` que acepta `undefined`, constantes `PASA/INCUMPLE/EXENTO` |
| 5 | Una sonda del `advisor` (dos funciones del fichero con el mismo nombre) | `pasa` donde tocaba `incumple`: el módulo expandía las DOS | desempate por cercanía (`laQueVeElBloque`) | cabecera corregida: la frase «gana la última declaración» era falsa |
| 6 | Corrida 2: 804 mutantes, 18 supervivientes | los 18 | 9 pruebas nuevas y 5 simplificaciones | `esReduce` fuera de la función |
| 7 | Corrida 3: 790 mutantes, 1 superviviente (`paginaPorOmision`) | el mutante | una prueba cuyo bloque no nombra NINGUNA página (ni en la firma) | — |
| 8 | Las sondas del panel y la consulta final: una función declarada en el test con el parámetro `page` que NADIE usa aportaba su espera (`pasa`) | `expected 'pasa' to be 'incumple'` (la sonda, medida antes de escribir la prueba) | una función declarada en el bloque aporta eventos solo si el bloque la usa (llamada o referencia) | `usadasEnElBloque` en vez de dos ternarios `primeraLlamada === undefined` |

Honestidad: las TABLAS de los pasos 2 y 4 se escribieron enteras antes del primer verde, no fila a fila, como en las olas 1B y 2B; el
tope de la Ley 3 se respetó por FAMILIAS. El paso 5 es una excepción real: el código del desempate se escribió antes que sus tres
pruebas, que por eso nacieron en verde; las protege el sabotaje S18 (5 rojos), no un rojo previo. Tras el paso 8 hubo que repetir la corrida de StrykerJS entera (cambió el módulo): la FINAL es la quinta.

## 4. Sabotajes reales (aplicar, correr Vitest, ver el rojo por la razón correcta, restaurar con copia previa y `cmp`)

Script en el scratchpad (`ola4a/sabotaje.mjs`): hace copia, aplica UN cambio, ejecuta `vitest run` sobre mis dos ficheros de prueba,
anota los tests en rojo y restaura SIEMPRE (`finally`), comprobando byte a byte contra la copia («MODULO_RESTAURADO_IDENTICO» en cada lote).

| id | Hallazgo | Cambio | Rojos | Se pone en rojo… |
| --- | --- | --- | --- | --- |
| S1 | A1 | la flecha de expresión vuelve a registrarse con cuerpo vacío | 55 | «una función flecha de expresión (sin llaves) SÍ se resuelve…» y todas las filas de la A1 |
| S2 | A1 | solo cuenta como uso `nombre(` y no la referencia | 3 | las dos de «función pasada por referencia» |
| S3 | A2a | la espera cuenta sin `await` ni `return` delante | 3 | «A2a: la espera SIN "await"…» y «…"void"» |
| S4 | A2a | la espera cuenta aunque se trague (`catch`/`then`/`try`) | 10 | las tres filas A2a y las de espaciado de `catch`/`then`/`try` |
| S5 | A2b | la espera, la emulación y la medición no se atan a la página | 16 | las filas A2b, A2d «otra página» y «un argumento que no es un identificador» |
| S6 | A2c | la última emulación antes de medir ya no tiene que ser `reduce` | 1 | «A2c: "reduce", "goto", "no-preference" y "reload"» |
| S7 | A2c | la emulación ya no tiene que estar vigente antes del primer `goto` | 4 | fila de la tabla firmada «emula "reduce" con "emulateMedia" después del "goto"» y las de varios `goto` |
| S8 | A2d | una navegación posterior ya no invalida la espera | 13 | las filas A2d |
| S9 | A2e | el `.include(` se busca en todo lo que sigue | 2 | «A2e: un AxeBuilder con ".include(" y otro sin él…» y el de «tras su cierre» |
| S11 | A3 | la navegación se busca en el texto con cadenas | 387 | tabla de 16 filas entera y casi todo lo demás |
| S12 | A3 | colocar y congelar valen aunque empiecen en una cadena | 1 | «congelar y colocar: solo la colocación es código…» |
| S22 | A3 | la estructura vuelve a conservar las cadenas | 15 | «un "test(" escrito dentro de una cadena…», la fila «A3: la espera…» y las de cadenas |
| S13 | A4 | una función declarada dentro de un test se registra como del fichero | 9 | la contaminación, en los dos órdenes, y «una función declarada DENTRO de un bloque…» |
| S18 | A4 | dos funciones del fichero con el mismo nombre se expanden las dos | 5 | las del sub-`describe` y «la función del fichero se ve aunque OTRO test declare…» |
| S19 | A4 | una función declarada en el bloque ya no oculta la del fichero | 3 | «una función local del fichero NO se resuelve en un test que declara otra…» |
| S14 | A5 | `test.only` deja de marcar | 2 | «un "test.only(" hace que el fichero NO pase…» y el alias con `.only` (el cableado no puede ponerse en rojo con esto: hoy no hay ningún `test.only` en `tests/e2e`) |
| S15 | A5 | `only|fail|fixme|skip` dejan de reconocerse | 10 | los cuatro modificadores |
| S16 | A8 | `esFicheroDeTestDePlaywright` pierde `mts/cts/mjs/cjs` | 4 | las filas de módulo |
| S20 | A1 | el `>` de un `=>` cuenta como ángulo | 1 | «una función con un tipo de retorno que es una función…» |
| S17 | A2 | la espera no se reconoce nunca | 77 | tabla de 16 filas y todo lo de la espera, TODOS en `medicionEstable.test.ts`; el cableado a los specs reales da 0 rojos: ningún bloque real `pasa` por la espera (los 11 `pasa` van por la emulación; las esperas de accesibilidad @s37–@s39 y de `hero-entrada-cls` están en bloques `exento`, como ya señaló el `judge` en su H4) |
| S24 | cableado | la emulación de `reduce` no se reconoce nunca | 3 | los tres del cableado: «ningún bloque test() de ningún spec mide la portada recién cargada…», «todos los ficheros leídos pasan la comprobación…» y «la obligación alcanza AL MENOS a los cuatro ficheros…» |
| S25 | A4 | una función declarada en el bloque que nadie usa vuelve a aportar sus eventos | 1 | «una función declarada en el bloque y que nadie usa no aporta nada: ni su espera, aunque su parámetro se llame "page"» |
| S23 | A6 | sin ninguna página nombrada, la medición ya no se ata a `page` | 1 | «una medición que no nombra ninguna página, tras una función…» |
| S10, S21 | A3 | la espera y la emulación se buscan en el texto con cadenas | **0** | NO se ponen en rojo, y lo digo: la espera y la emulación se validan en CAPAS (el patrón, su argumento y su clave de `reducedMotion` se leen en la estructura), así que cambiar solo la primera capa es un sabotaje neutralizado por las demás. La prueba real del A3 es S22 (que cambia la estructura) |

Los sabotajes de salida están en `scratchpad/ola4a/stryker/sabotajes_salida*.txt`. S6, S7, S10 y S19 dieron «el texto aparece 0 veces» en el primer lote porque
el refactor ya había cambiado el texto; se repitieron con el texto actual.

## 5. Medidas del entorno que ya hice (para no repetirlas)

- Playwright por defecto: `testMatch: "**/*.@(spec|test).?(c|m)[jt]s?(x)"` MEDIDO. `grep -ln "spec|test" node_modules/playwright/lib/common/*.js` imprime
  solo `node_modules/playwright/lib/common/index.js` (y la línea del valor por defecto es `takeFirst(projectConfig.testMatch, config.testMatch, "**/*.@(spec|test).?(c|m)[jt]s?(x)")`),
  y `playwright.config.ts` no lo cambia.
  `forbidOnly` existe en `node_modules/playwright/types/test.d.ts` (`forbidOnly?: boolean`); la configuración ya lo trae a `true`
  (la puso el agente C, no yo).
- Ningún otro fichero consume `comprobarMedicionEstable` ni `InformeDeMedicionEstable` (`grep` sobre `src` y `tests`): el campo nuevo no rompe a nadie.

## 6. Prueba de mutación (StrykerJS 10, `pnpm exec stryker run --mutate "src/lib/diseno/medicionEstable.ts"`, candado del encargo)

**Resultado final (corrida 5): 791 mutantes, 791 MUERTOS, 0 supervivientes, 0 Timeout, 0 NoCoverage, 0 RuntimeError (100,00 %).**
La corrida final se hizo sobre el código y las pruebas CONGELADOS: al terminar, `cmp` confirmó que `medicionEstable.ts`,
`medicionEstable.test.ts` y `medicionEstableSpecsReales.test.ts` eran idénticos a las copias hechas al arrancar. El reparto de estados está
leído de `reports/mutation/mutation.json` (copiado a `scratchpad/ola4a/stryker/mutation5.json`), no de la tabla de texto:
`{"Killed":791}` (`scratchpad/ola4a/stryker/mutation5.json`; la corrida 4 dio `{"Killed":790}` sobre el código anterior al paso 8).

**`# timeout` ANTES que el score** (`docs/mutation-testing.md`): 0 en las cinco corridas completas. No hubo suspensión de la máquina ni repetición
por artefactos de reloj. El diseño sin bucles por índice es lo que lo consigue: la primera corrida (ya con el diseño nuevo) ya tenía 0, frente a los 22 que
predecía la revisión.

| Corrida | Mutantes | Muertos | Supervivientes | Timeout | NoCoverage | RuntimeError | `Initial test run succeeded` | Duración |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 (tras la reescritura) | 858 | 735 | 122 | 0 | 1 | 0 | 293 pruebas | 41 min 16 s |
| abortada por mí al 4 % (cambié el módulo y la repetí) | 780 | — | — | — | — | — | — | — |
| 2 | 804 | 786 | 18 | 0 | 0 | 0 | 414 pruebas | 27 min 55 s |
| 3 | 790 | 789 | 1 | 0 | 0 | 0 | 424 pruebas | 26 min 44 s |
| 4 (antes del paso 8) | 790 | 790 | 0 | 0 | 0 | 0 | 424 pruebas | 28 min 1 s |
| **5, FINAL** | **791** | **791** | **0** | **0** | **0** | **0** | **425 pruebas en 5 s** | 26 min 23 s |

- `Initial test run succeeded. Ran 425 tests` sobre las fuentes intactas: ningún falso muerto por una prueba que falle por motivos ajenos (la pata 2 del argumento de
  `docs/mutation-testing.md`). Ningún mutante sin verdugo: 0 `NoCoverage` (la pata 3).
- Qué enfrentó cada mutante (`vitest.related` está en `true` por defecto): **2 ficheros de prueba**, `medicionEstable.test.ts` (418 pruebas en el informe de Stryker) y `medicionEstableSpecsReales.test.ts` (6): 424 en total (Vitest cuenta 419 + 6 = 425: una prueba de más que
  el informe de Stryker no lista; no la he investigado). 783 de los 791 mutantes son ESTÁTICOS (constantes de módulo: patrones, conjuntos), y cada
  uno corre esos dos ficheros enteros; no hay tal cosa como «la suite de 1700 pruebas mató estos mutantes».
- `Found 1 of 1173 file(s) to be mutated`: solo `medicionEstable.ts`.
- La corrida 1 (858 mutantes) tenía 122 supervivientes y 1 sin cobertura (la rama «una firma sin cuerpo»). Las familias: `\s*` → `\S*` de cada patrón (la prueba solo ejercitaba un espaciado),
  `;`, CRLF, `=>` interior, comas dentro de `[]`/`{}`, argumentos que faltan, páginas por parámetro, `ambito`/`ajenos`, centinelas. Todas se mataron con pruebas o quitando la redundancia (apartado 7).

## 6b. Las sondas del panel, contra el módulo antiguo (copia de HEAD) y el nuevo (MEDIDO)

Repetí los guiones de los revisores (`silencios/probes3.mjs` y `probes4.mjs`, `ts/probes.mjs`, `probes5.mjs`, `probes6.mjs` y `exp/sondas.mts`; `probes3.mjs` del revisor de
TypeScript importa el lector de estilos, que no es mío, y no se pudo correr) apuntando cada uno a una copia del módulo antiguo y a otra del nuevo. De sus 94 entradas, **40 cambian
de veredicto y 54 no**. Las tablas completas están en `scratchpad/ola4a/tabla_sondas.md`. Las que importan:

| Sonda del panel | Antes | Ahora |
| --- | --- | --- |
| **El sabotaje REAL de `tipografia.spec.ts` @s23** (el texto del spec sin `paginaSinFuente.emulateMedia`; `scratchpad/exp/sab/tip_sin_segunda_emulacion.ts`, con `altoDe` anidado en `medirAltos` y el `isVisible` antes de medir) | `pasa` | **`incumple`** |
| `tipografia.spec.ts` sin sabotaje (dentro de los 31 specs) y las dos variantes de `accesibilidad.spec.ts` del panel (la original y la sin esperas) | `pasa` y `exento` | igual (0 bloques cambian) |
| Flecha de expresión que mide (M1, M1b, M1c, P1, `probes6`) y flecha con parámetros funcionales o desestructurados (M3, M3b) | `exento` | `incumple` |
| `function f(): () => Promise<T> { … }` (P3, `probes6`) | `exento` | `incumple` |
| Función por referencia, `evaluate(cajaDe)` y `const f = cajaDe; f(page)` (M2, M2b de `probes4`) | `exento` | `incumple` |
| La espera sin `await`, con `void`, con `.catch(`, dentro de `try`, dentro de una cadena (A, M5, M5f, M6, M6b, M6c, D) | `pasa` | `incumple` |
| La emulación sin `await`, sobre OTRA página, `reduce` y luego `no-preference` (M5b, M5g, M5h, M9, M12, B2, C3) | `pasa` | `incumple` |
| Espera en `page` y medición en `context.newPage()` (B), `goto`/`reload` tras la espera o la espera antes del `goto` (C, C2, P7) | `pasa` | `incumple` |
| `AxeBuilder` con `.include(` en una pasada y sin él en otra, o el `.include(` en un comentario (E, M15, M15c) | `exento` | `incumple` |
| `test.only`, `test.fixme`, `test.fail`, alias `const t = test` (F, F2, M4, M4b, M4d, M4e) | 0 bloques, o el bloque ni se inspecciona | bloque inspeccionado y `incumple` |
| Contaminación entre tests por el nombre de una flecha (X1, X2 de `probes5`) | `pasa,pasa` y `pasa,exento` | `incumple,pasa` e `incumple,exento` |
| Función declarada en el test, con la espera, que nadie llama (M5d) | `pasa` | `incumple` |
| **No cambian y no los he cerrado** (declarados en la cabecera o fuera de mi lista): M5c `if (false) { await esperar… }` y P13 espera condicional (precedencia TEXTUAL del contrato) · P8 y el caso 7 de mi propia sonda: la SEGUNDA medición tras otra navegación (el contrato dice «PRIMERA medición») · P2, selector en constante de módulo · P4, P5, P6, M16*, G*: lo que la lista cerrada de medidas no contiene (`getClientRects`, `toBeInViewport`, `toHaveCSS`, `querySelectorAll('*')`…) · M6d, el tope gigante · `ts/probes4`: una regex con comilla tras `=>` hace desaparecer los bloques (falla CERRADO y ruidoso; no está en mi lista) | `pasa`/`exento` | igual |

Además corrí mis propios candidatos a «falla abierto» (`scratchpad/ola4a/casos_abiertos.mjs`): el caso 1 (función declarada en el test con el parámetro `page`, nunca usada,
con la espera dentro) daba `pasa`; lo cerré (ciclo 8) y ahora da `incumple`.

## 7. Código QUITADO por redundante (A9: los equivalentes no se justifican, se eliminan)

Cada línea es un superviviente de la corrida 1 que no se podía matar porque el código era redundante, y lo que se hizo:

- La ordenación previa de los eventos del fichero (`sort` por posición): el orden definitivo lo da `porSitio`; sus mutantes sobrevivían.
- El caso especial de `{` en el cuerpo de una flecha: el cuerpo en llaves y el cuerpo en expresión salen del mismo `finDeLaExpresion`.
- El guardián `parametro === '' || raiz === undefined` de la correspondencia: `Map.get(x) ?? x` ya lo cubre; los parámetros no identificadores son
  `undefined` y no tienen entrada.
- `traducida !== undefined &&`, `mencionada === undefined ? … : …` y `paginasMedidas.size === 0 ? …`: la traducción acepta `undefined`
  y `combinar([])` ya da `exento`.
- La cláusula `evento.tipo === 'lee-estilo'` de la lectura de estilo (cualquier otro tipo que llegara ahí ya estaba descartado) y el filtro
  `uso.funcion.dentroDe === undefined` de las llamadas (lo cubre `laQueVeElBloque`).
- La aritmética `índice + longitud` repetida en cada patrón: ahora `Coincidencia.fin` se calcula una vez; `fin - 1`/`+ 1` de `argumentosDe`
  son `.slice(1, -1)`; los desplazamientos del título, una resta.
- Los centinelas `''` de los parámetros (`?? ''`): `undefined`; y los vectores `[]` que alimentaban `flatMap`: `filter` + `map`.
- `.replaceAll('=>', '')` (un mutante que lo reemplazaba por texto sin ángulos era equivalente): ahora se cuenta `(?<!=)>`.
- Comparaciones entre índices de eventos (`espera > ultimaNavegacion`, `emulacion < primeraNavegacion`): ahora son `slice`.
- Las cadenas `'pasa'` / `'exento'` enmascaradas por `combinar`: constantes `PASA`, `INCUMPLE` y `EXENTO`.
- `SALTO_DE_LINEA` (el `join` del ámbito): el ámbito es una lista de textos y se pregunta con `some`.

## 8. DESVÍOS del contrato y puntos que NO están en la lista del encargo

1. **(d) aplicado a la emulación.** El encargo dice que un `goto`/`reload`/`goBack`/`goForward` posterior invalida la espera Y la emulación.
   Con la letra, `emula(reduce); goto; medir` se invalidaría a sí mismo (el `goto` es posterior a la emulación y anterior a la medición),
   que es el patrón correcto de @s36 y @s45. Lo he leído así: una navegación posterior invalida la ESPERA; a la emulación la invalida una
   RE-EMULACIÓN posterior (`reduce → goto → no-preference → reload → medir`, fila «A2c»), y `emula(reduce); goto; reload; medir` pasa porque
   la emulación sigue en vigor tras recargar. **Sin verificar en documentación oficial** que `page.emulateMedia` persista entre navegaciones: no
   puedo ejecutar Playwright (lo hace el agente C); es lo que sé de la API, no lo he medido.
2. **Dos pruebas fijadas por olas anteriores han cambiado de veredicto** por mandato de los hallazgos: la flecha de expresión (`exento` → `incumple`,
   lo pide A1) y «una función declarada DENTRO de un bloque test(...)» con la espera dentro y declarada ANTES del `goto` (`pasa` → `incumple`: la
   precedencia es textual y el `goto` posterior invalida la espera, A2 (d)). Con la declaración tras el `goto` sigue en `pasa`. Ningún spec real depende de ello.
3. **API nueva**: `bloquesConOnly` y `esFicheroDeTestDePlaywright` (apartado 1).
4. **A8: la guarda no puede ponerse en rojo hoy.** No existe ningún fichero de test fuera del glob antiguo (los 31 son `*.spec.ts` planos) y no puedo crear
   uno en `tests/e2e` (es del agente C y lo ejecuta Playwright). Lo que SÍ está demostrado: la regla (`esFicheroDeTestDePlaywright`, 28 filas y sabotaje S16 con 4 rojos)
   y que el glob nuevo y la regla coinciden hoy. Si mañana aparece un `tests/e2e/hero/x.spec.ts`, el glob nuevo lo lee; con el glob viejo, la guarda de
   igualdad de conjuntos fallaría. Eso es razonado, no ejecutado.
5. **`test.skip(condicion, 'razón')`** dentro de un test (una sentencia, no un bloque con función de cuerpo) NO cuenta como bloque (si no, inflaría `bloquesInspeccionados`).
6. **Límites nuevos declarados en la cabecera**: una espera dentro de `Promise.all([…])` no cuenta; un `test.beforeEach` con la espera no lo ve el `test(`;
   un selector en una constante de módulo no sitúa la medición en el hero; los tipos genéricos con coma desplazan la correspondencia
   parámetro-argumento; las funciones del fichero con el mismo nombre en dos `describe` se resuelven por cercanía, no por ámbito; la medición se ata a la
   variable de página nombrada más cerca antes (un localizador guardado antes de nombrar otra página se ata a esta última).
   **Falla CERRADO** (da `incumple`) cuando duda de la página en estos casos: una espera o una emulación sin `await` o dentro de `Promise.all([…])`, un parámetro que no
   se corresponde con ninguna página, una espera con un argumento que no es un identificador y un `test.beforeEach` que el `test(` no ve.
   **Falla ABIERTO** (da `pasa` o `exento` donde una persona diría `incumple`) en estos, todos medidos y ninguno nuevo respecto a lo que el contrato fija: (i) un localizador
   guardado en una variable ANTES de que el bloque nombre otra página se ata a la nombrada más cerca antes de medirlo (sonda 4 de `casos_abiertos.mjs`); (ii) la precedencia
   TEXTUAL: una espera dentro de un `if (false)` o de una rama condicional cuenta; (iii) la segunda medición, tras otra navegación, no pide otra espera (el contrato dice «primera
   medición»); (iv) lo que la lista cerrada del contrato no contiene (`toHaveCSS`, `getClientRects`, `toBeInViewport`, `querySelectorAll('*')`, un selector en una constante de
   módulo); (v) dos funciones del fichero con el mismo nombre en dos ámbitos distintos: se elige por cercanía, no por ámbito, y si la más cercana espera y la que de verdad usa el
   bloque no, da `pasa`; (vi) los bloques de `accesibilidad` @s37–@s39 (miden por selectores interactivos que no son del hero) siguen `exento` aunque se quite su espera:
   es el H4 del `judge`, que no estaba en mi lista.
7. **Corrección de una frase falsa mía**: la cabecera decía «gana la última declaración»; el código expandía las dos. Ahora hace lo que dice.
8. `playwright.config.ts`: no lo he tocado; `forbidOnly: true` ya estaba en el árbol cuando lo leí (lo puso el agente C). La mitad de A5 que me tocaba (que `test.only` haga fallar el cableado) está en mis ficheros.
9. La excepción por etiqueta de `cabecera_sobre_el_hero` (punto abierto 5 del índice) sigue sin implementar: no era de esta ola.

## 9. Higiene

- De mis ficheros, `git status` muestra `M` sobre los tres y este informe `??`; sin `add`, commits ni `stash`. Las demás `M` son de los otros agentes.
- `.stryker-tmp`: dejé el sandbox de MI corrida abortada; lo borré (`sandbox-xFO6oJ`). Los demás `sandbox-*` son de sesiones anteriores o de otro agente y NO son míos.
- `reports/mutation/` está en `.gitignore`. Scratchpad propio: `scratchpad/ola4a/` (scripts de auditoría y sabotaje, instantánea de los 31 specs en LF y CRLF,
  informes JSON de las cinco corridas, las sondas del panel y sus tablas). Ningún servidor ni proceso node abierto por mí.
- Stryker, siempre con el candado del encargo (`mkdir` para tomarlo, `rmdir` al terminar, la regla de los 40 minutos metida en el bucle de espera). Maté DOS procesos míos, nunca ajenos: un bucle que esperaba el candado (para cambiar el módulo antes de que arrancara) y una corrida de Stryker recién empezada (al 4 %, para meter un cambio de semántica; el script que la lanzó liberó su propio candado). Ningún candado de otro agente se rompió.
