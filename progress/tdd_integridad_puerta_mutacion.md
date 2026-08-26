# TDD - integridad_puerta_mutacion

Estado inicial: EN CURSO. La enmienda `@s6`-`@s9` fue aprobada por el humano. No se
modifica produccion web, tests de producto ni los patrones inclusivos de la
superficie mutable.

## Ciclo 1 - @s1

- Rojo: se creo `.harness/test/project-config.test.mjs` con la asercion
  literal de que `commands.mutate` debe ser `pnpm exec stryker run`, sin
  `--mutate` ni `{{target}}`, y que `mutation.targets` es `[]`.
  `node --test .harness/test/project-config.test.mjs` fallo como esperaba:
  el valor real era `pnpm exec stryker run --mutate {{target}}`.
- Verde: se sustituyo exclusivamente `commands.mutate` en
  `harness.config.json` por `pnpm exec stryker run`.
  La misma prueba termino con 1/1 verde.
- Refactor: no necesario; el test lee los ficheros reales con la stdlib de
  Node y no introduce una capa de produccion.

## Hallazgo de ejecucion real (fuera del cambio aplicado)

Al comprobar que el motor ya emitia el comando sin el argumento vacio, se
lanzo por error `bin/harness mutate --help`: el motor interpreta `--help` como
target explicito, por lo que ejecuto una corrida de Stryker. El error original
de argumento ausente de `--mutate` no reaparecio. Stryker avanzo hasta
instrumentar 43 archivos y 2099 mutantes, pero aborto antes de medir por:

`Cannot find TestRunner plugin "vitest". In fact, no TestRunner plugins were loaded.`

Tambien emitio los avisos de opcion desconocida `_comment_concurrency` y de
que `!src/**/*.d.ts` no excluye archivos. Son hechos documentados, no se han
corregido porque el contrato prohíbe cambiar `stryker.config.json`; queda a
revision de `craftsman_lead` antes de continuar `@s2`-`@s5`.

## Reanudacion aprobada - @s2 y @s6-@s9

Fuente tecnica consultada: documentacion oficial de StrykerJS, "Configuration"
y "Vitest Runner". La primera especifica que una opcion CLI reemplaza por
completo su valor en el fichero y que `plugins` admite una lista explicita; la
segunda prescribe `testRunner: "vitest"` para el runner instalado. Referencias:
<https://stryker-mutator.io/docs/stryker-js/configuration/> y
<https://stryker-mutator.io/docs/stryker-js/vitest-runner/>.

### Ciclo 2 - @s2 enmendado y @s7 (patrones efectivos)

- Rojo: se anadio una unica prueba literal con la lista final de cuatro
  patrones: las dos inclusiones aprobadas y solo las dos exclusiones de test.
  Fallo porque aun estaba `!src/**/*.d.ts`.
- Verde: se elimino exclusivamente esa exclusion inerte. Las inclusiones y
  `thresholds.break: 100` permanecieron sin cambios; la prueba termino verde.
- Refactor: no necesario. La clausula original de @s2 sobre `.d.ts` queda
  sustituida por la enmienda humana @s7, que exige su ausencia.

### Ciclo 3 - @s6 (carga explicita del runner)

- Rojo: la prueba literal confirmo `testRunner: "vitest"` y exigio el unico
  plugin `@stryker-mutator/vitest-runner`; fallo porque `plugins` no existia.
- Verde: se anadio exactamente `"plugins": ["@stryker-mutator/vitest-runner"]`
  a `stryker.config.json`; la prueba termino verde.
- Refactor: no necesario.

### Ciclo 4 - @s7 (opcion desconocida)

- Rojo: la prueba literal fallo porque `_comment_concurrency` seguia siendo
  una propiedad del JSON de Stryker.
- Verde: se elimino exclusivamente esa propiedad; la exclusion inerte ya se
  habia eliminado en el Ciclo 2. La prueba termino verde.
- Refactor: no necesario. La justificacion de concurrencia 1 permanece en
  esta bitacora, y los valores operativos no cambian.

### Ciclo 5 - @s8 (invariantes de ejecucion)

- Rojo de calibracion: para verificar que la nueva asercion observa el fichero
  real, se contrasto temporalmente `concurrency: 2`; fallo frente al valor real
  1, sin editar produccion ni configuracion.
- Verde: se fijo la expectativa contractual en `concurrency: 1`, con
  `timeoutMS: 60000` y los tres umbrales `high`, `low` y `break` en 100. La
  prueba literal termino verde.
- Refactor: no necesario.

### Ciclo 6 - @s9 (ejecucion seca, sin mutantes)

Se lanzo una sola vez `pnpm exec stryker run --dryRunOnly`. La salida observada
confirmo: 43 archivos seleccionados, 2099 mutantes instrumentables,
concurrencia 1 y `Starting initial test run (vitest test runner with "perTest"
coverage analysis)`. No aparecieron los avisos anteriores de plugin,
`_comment_concurrency` ni patron sin coincidencias. La ejecucion no alcanzo la
fase de probar mutantes (`dry-run only`). El ejecutor de esta sesion corto la
captura a los 30 segundos; los cuatro procesos Node de Stryker siguieron hasta
finalizar, pero su codigo final y las ultimas lineas no quedaron disponibles en
la captura. Una repeticion independiente y controlada por `craftsman_lead`
concluyo despues con codigo 0: `Initial test run succeeded. Ran 970 tests in 2
minutes and 27 seconds` y `The dry-run has been completed successfully. No
mutations have been executed.` No emitio los avisos anteriores.

## Trazabilidad actual

- @s1 -> `.harness/test/project-config.test.mjs`:
  `configuracion: la mutacion global delega la superficie a Stryker sin argumentos vacios`.
- @s2 -> la prueba `@s2/@s7 ... superficie efectiva ...`; sus inclusiones y
  `break: 100` siguen verificadas; su exclusion `.d.ts` fue sustituida por @s7.
- @s3 -> pendiente: requiere mutacion global real, prohibida en esta fase.
- @s4 -> pendiente: requiere `bin/harness verify` completo.
- @s5 -> pendiente: red del motor y E2E, fuera de esta comprobacion seca.
- @s6 -> la prueba `@s6 ... carga explicitamente el runner de Vitest`.
- @s7 -> las pruebas `@s2/@s7 ... superficie efectiva ...` y
  `@s7 ... elimina las dos fuentes conocidas de avisos`.
- @s8 -> la prueba `@s8 ... conserva limites y umbrales exactos`.
- @s9 -> `pnpm exec stryker run --dryRunOnly`: salida 0, runner Vitest
  alcanzado y 0 avisos de configuracion conocidos.

## Recuperación posterior a la medición global fallida

No se ejecutó una segunda mutación global en esta fase. Se leyó
`reports/mutation/mutation.json` y se trató cada familia de mutantes con una
prueba de resultado literal o con el refactor mínimo que elimina una rama
inalcanzable sin cambiar el contrato.

### Ciclo 7 — límites, listas vacías y persistencia

- Rojo calibrado desde el informe: #19 (`Cabecera-logica`) cambiaba el límite
  estricto de ancho positivo; #104 (`Faq-logica`) no tenía caso de lista vacía;
  #301 (`SelectorPaleta-logica`) carecía del `null` explícito; #467
  (`contraste`) no alcanzaba el byte 10, frontera inclusiva de gamma lineal;
  #1687 (`telefono`) contenía una forma de regex sustituible.
- Verde: se añadieron literales independientes: `esMovil(0) === true`,
  `textoServicios([]) === "Ofrecemos ."`, resolución de `null` a `marca`,
  ratio `#0A0A0A/#FFFFFF === 19.80`, y normalización de tabulación/salto de
  línea. `sinEspacios` usa ahora `split(/\\s/).join('')`, equivalente para
  cada carácter de espacio pero sin el mutante de cuantificador original.
- Verificación: las once suites implicadas terminaron 222/222 verdes.

### Ciclo 8 — informe de contraste y bloque de tokens

- Rojo: el test literal de una pareja `#B4C718` sobre blanco para texto normal
  recibió `"aprobado"`; descubrió un defecto real: `ejecutarPuertaDeContraste`
  aprobaba todo catálogo no vacío sin comprobar sus umbrales.
- Verde: la puerta calcula `pasa` con `every(esAptoParaUso)`. El mismo test da
  literalmente `"suspenso"`; los catálogos reales siguen dando `"aprobado"`.
  Esto cubre #1420 de `tokensColor` y evita que el veredicto sea verde por
  mera no-vacuidad.
- Para #1270 y los timeouts #1283/#1284/#1290/#1301 se eliminó la comprobación
  imposible de `match.index` (un `RegExpMatchArray` encontrado siempre la
  define) y se añadió una cota de iteraciones igual a la longitud del texto al
  recorrido de llaves. Conserva la extracción de bloques correctos y hace que
  cualquier cursor mutado sin progreso termine en el error de bloque no
  cerrado, no en un timeout. No se cambió `timeoutMS`.
- Verificación: `tokensColor`, `contraste`, `movimientoRespetuoso`,
  `rolesDescartados`, `escalaTipografica` y `escenariosHeredados`: 117/117
  verdes.

### Ciclo 9 — ramas algebraicamente redundantes del informe

- Los 8 `NoCoverage` de `rolesDescartados` provenían de `todos.length === 0`,
  inalcanzable por tipo y por construcción (`todos` siempre contiene
  `tokens`). Se retiró esa rama muerta; el resultado para un tokens vacío
  sigue siendo fallo por ausencia de primario fuerte.
- Se retiraron cálculos condicionales que eran idénticos bajo invariantes ya
  fijados por contrato: escala tipográfica con `minPx === maxPx`; lista vacía
  de escenarios heredados; catálogo real vacío de activos (si hay rutas
  declaradas, todas son faltantes); búsqueda con identificador `undefined`; y
  captura de foco sin elementos. Los tests existentes cubren los resultados
  conservados, incluido `null` de la captura de foco.
- `movimientoRespetuoso` representa un bloque ordinario con `undefined` y crea
  la pila mediante `new Array`, eliminando #1090/#1092 sin cambiar su lectura;
  el test de transición fuera de media query confirma el incumplimiento.
- `hojaGlobal` #894 queda documentado como el único caso aún no transformado:
  convertir una línea vacía en pendiente es observacionalmente idéntico porque
  el troceador descarta fragmentos vacíos. No se lo declara equivalente ni se
  excluye: exige la siguiente medición global para confirmar si el test de
  selector partido ya lo mata.

## Verificación local de este handoff

- `pnpm run lint` — salida 0, 0 warnings.
- `pnpm run typecheck` — salida 0.
- `git diff --check` — salida 0.
- No se ejecutaron Stryker global, `verify`, commit ni push: quedan reservados
  al coordinador tras su revisión y una sola nueva medición oficial.

## Recorte de alcance autorizado (posterior)

El humano autorizó explícitamente detener esta recuperación global. Se han
revertido exclusivamente los cambios de recuperación introducidos en `src/` y
en sus tests durante este handoff. Se conservan sin cambios la configuración,
la spec, el Gherkin, el estado de la feature y los informes previos.

La medición oficial continúa FAIL (35 supervivientes, 4 timeouts y 8 sin
cobertura). No se declaran equivalentes ni se excluye ningún mutante.

## Redefinición final autorizada

El humano autorizó el 26/08/2026 redefinir la entrega como corrección de
configuración, no como recuperación de la mutación global histórica. La
regresión literal se publica como `pnpm run test:config` y el workflow
`Harness CI` la ejecuta inmediatamente después de `bin/harness init`; no se
altera el comando estándar de tests, pues su literal está protegido por una
feature terminada de navegador real. El contrato final se limita a la
configuración, su carga de runner y un `--dryRunOnly` exitoso; no hay cambios
en `src/` ni en pruebas de producto. La evidencia definitiva de esta
redefinición se registra en `progress/judge_integridad_puerta_mutacion.md`.

## Evidencia final de la redefinición

- `pnpm run test:config`: 5/5 verde.
- `node --test .harness/test/engine.test.mjs`: 49/49 verde.
- `bin/harness init`: lint sin warnings, typecheck y 1047/1047 Vitest verdes.
- `pnpm exec playwright test --reporter=dot`: 75/75 verde, tras reiniciar el
  servidor temporal de Playwright que dos ejecuciones truncadas por el
  capturador habían dejado inconsistente.
- `pnpm run build`: salida 0 y puerta de terceros con 0 hallazgos.
- `pnpm exec stryker run --dryRunOnly`: salida 0; 43 ficheros instrumentados,
  un runner Vitest, 970 tests y sin avisos de configuración conocidos.
