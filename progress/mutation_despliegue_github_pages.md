# Mutacion -- feature 23 (despliegue_github_pages)

Veredicto: FAIL
Score combinado: killed/total = 42/46 = 91.30% (umbral: 100%)

Primera medicion de mutacion de esta feature. Cubre los 24 escenarios
(@s1-@s24, ronda original + enmienda de imagenes) porque, segun confirma
progress/judge_despliegue_github_pages.md, el unico alcance mordible
declarado son estos dos modulos puros y la enmienda no anadio superficie
nueva a hrefDeDestino.ts (solo JSDoc) ni toco tecnicaSpaGithubPages.ts en
absoluto. Una sola corrida por fichero cubre las dos rondas.

## Comprobaciones previas

- Antes de arrancar habia una corrida en curso de bin/harness init (PID
  13996) con pnpm run test (PID 28360) y unos 24 workers de Vitest, de
  otra sesion/agente, no un Stryker. Espere (sondeo cada 10s) a que
  terminara por completo antes de arrancar cualquier mutacion, para no
  falsear los tiempos de ejecucion de los mutantes con contencion de CPU
  ajena. Verificado de nuevo justo antes de cada corrida de Stryker: 0
  procesos node.exe en ambos casos.
- pnpm exec vitest run de los dos ficheros de test en aislamiento, antes
  de mutar: 2 ficheros, 77 tests, 77 passed (3.30s).
- Ambas corridas de Stryker con --plugins @stryker-mutator/vitest-runner
  explicito (el glob por defecto no resuelve el plugin en esta maquina).
- Columna de timeouts en ambas corridas: 0. No hizo falta repetir a
  concurrency 1 (ya es el valor por defecto de stryker.config.json).

## Resultado por fichero

| Fichero | total | killed | survived | timeout | score |
| --- | --- | --- | --- | --- | --- |
| src/lib/hrefDeDestino.ts | 10 | 8 | 2 | 0 | 80.00% |
| src/lib/tecnicaSpaGithubPages.ts | 36 | 34 | 2 | 0 | 94.44% |
| Total | 46 | 42 | 4 | 0 | 91.30% |

Veredicto por fichero: FAIL en los dos (ninguno llega al 100%).

## Mutantes sobrevivientes

### src/lib/hrefDeDestino.ts (2)

Ambos en la misma linea, funcion interna sinBarraFinal (linea 5):

    function sinBarraFinal(base: string): string {
      return base.endsWith(BARRA) ? base.slice(0, -1) : base
    }

(BARRA representa el literal de una barra "/" entre comillas simples).

- src/lib/hrefDeDestino.ts:5:10 (mutador MethodExpression)
  endsWith(BARRA) pasa a startsWith(BARRA)
- src/lib/hrefDeDestino.ts:5:24 (mutador StringLiteral)
  endsWith(BARRA) pasa a endsWith de cadena vacia (la cadena vacia
  siempre es "sufijo" de cualquier string, asi que la condicion pasa a
  ser siempre verdadera)

Causa raiz comun: los unicos valores de base que pasa la suite entera
(la base de test, la base de produccion con barra final, y el
BASE_URL real de Vitest) empiezan y terminan los dos en una barra. Con
esos datos, "termina en barra", "empieza por barra" y "siempre
verdadero" son indistinguibles: la rama "else" del ternario (la base no
lleva barra final, no le quites nada) nunca se ejecuta en la suite
actual. No son equivalentes, verificado empiricamente con un script Node
que replica la funcion exacta con y sin cada mutacion:

  sinBarraFinal de una base sin barra final (GalapavetClinicaVeterinaria
  con barra inicial, sin barra final)
    original          -> igual, sin cambios
    MethodExpression  -> le come la letra final
    StringLiteral     -> le come la letra final

Falta: un caso con una base que empiece por barra pero NO termine en
barra (por ejemplo, hrefDeDestino con destino "/campanas" y una base
"/GalapavetClinicaVeterinaria" sin la barra final que si llevan
BASE_PRODUCCION/BASE_TEST en el test actual), afirmando el resultado
exacto "/GalapavetClinicaVeterinaria/campanas". Un unico caso asi mata
los dos mutantes a la vez porque ambos dependen de la misma rama no
cubierta.

### src/lib/tecnicaSpaGithubPages.ts (2)

Los dos en la misma linea de codificarRedireccion404 (linea 55):

    const queryOriginalCodificada = ruta.search === CADENA_VACIA ? CADENA_VACIA : resto

- src/lib/tecnicaSpaGithubPages.ts:55:35 (mutador ConditionalExpression)
  la comparacion "ruta.search === cadena vacia" pasa a ser siempre falsa
- src/lib/tecnicaSpaGithubPages.ts:55:51 (mutador StringLiteral)
  la comparacion pasa a ser contra el literal "Stryker was here!" en vez
  de la cadena vacia

Causa raiz: los dos mutantes fuerzan la rama "else" incluso cuando
ruta.search es la cadena vacia. Esa rama produce un ampersand suelto en
vez de nada. Ningun test observa esa diferencia por dos motivos
distintos:

1. El test de @s9 que llama a codificarRedireccion404 con search vacio
   (linea 14 de tecnicaSpaGithubPages.test.ts) solo comprueba
   resultado.pathname y que resultado.search no contenga
   "GalapavetClinicaVeterinaria": ninguna de las dos aserciones
   distingue el resultado correcto del resultado con el ampersand
   suelto de mas.
2. Los tests de @s10 que si usan search vacio (lineas 32 y 48) solo
   comprueban el viaje de ida y vuelta (codificar seguido de
   decodificar). El ampersand suelto sobrevive a la codificacion pero
   decodificarRedireccion404 lo absorbe silenciosamente al reconstruir
   la URL con el objeto URL nativo (una query que termina en un
   ampersand vacio se normaliza a search vacio al reconstruir), asi que
   el resultado final coincide con el original pese al defecto
   intermedio.

No son equivalentes, verificado empiricamente (script Node, replica
exacta de codificarRedireccion404/decodificarRedireccion404, con
pathname "/GalapavetClinicaVeterinaria/campanas", search vacio, hash
vacio):

  original              -> resultado.search correcto, sin ampersand
  ConditionalExpression -> resultado.search con un ampersand de mas
  StringLiteral          -> resultado.search con un ampersand de mas
  (el viaje de ida y vuelta con decodificarRedireccion404 da el mismo
  objeto original en los tres casos: por eso @s10 no lo detecta)

Falta: en el "it" de @s9 que codifica con search vacio (lineas 13-18),
una asercion sobre el valor exacto de resultado.search en vez de, o
ademas de, el "not.toContain". Mata los dos mutantes a la vez.

## Mutantes excluidos como equivalentes

Ninguno. Los 4 supervivientes son huecos de test reales, confirmados con
prueba algebraica (lectura del codigo) y verificacion empirica
independiente (scripts Node en el scratchpad de esta sesion, replicas
fieles de la logica mutada, con y sin cada mutacion aplicada).

## Siguiente paso

Trabajo de tdd_craftsman (no de este agente): anadir los dos casos rojos
descritos arriba (uno por fichero, cada uno mata 2 mutantes), volver a
pasar por judge, y remedir con mutation_tester hasta 100/100 antes de que
craftsman_lead marque la feature 23 como done (segun el propio
progress/judge_despliegue_github_pages.md, checkpoint C7).

## Evidencia

- Corridas: "pnpm exec stryker run --mutate src/lib/hrefDeDestino.ts
  --plugins @stryker-mutator/vitest-runner" y "pnpm exec stryker run
  --mutate src/lib/tecnicaSpaGithubPages.ts --plugins
  @stryker-mutator/vitest-runner", ambas con concurrency 1 (de la
  config), columna de timeouts en 0.
- reports/mutation/index.html y reports/mutation/mutation.json en disco
  reflejan la ultima corrida (tecnicaSpaGithubPages.ts) porque
  stryker.config.json fija una ruta de informe fija, no por-target; los
  datos de la corrida de hrefDeDestino.ts (8 killed, 2 survived, 10
  total, 0 timeout) se capturaron y transcribieron aqui directamente del
  mutation.json de esa corrida antes de que la segunda lo sobrescribiera.
- Scripts de verificacion empirica (no forman parte del repo, viven en
  el scratchpad de esta sesion): replicas exactas de sinBarraFinal y de
  codificarRedireccion404/decodificarRedireccion404 con cada mutacion
  activada individualmente, comparadas contra el original.

## Re-medicion tras refuerzo (26/08/2026)

**Veredicto:** PASS
**Score:** killed/total = 46/46 = 100% (umbral: 100%)

Remedicion sobre el mismo alcance exacto de la medicion anterior, tras el
refuerzo quirurgico de `tdd_craftsman` (`progress/tdd_despliegue_github_pages.md`,
seccion "Refuerzo mutacion (26/08/2026)") y su aprobacion por `judge`
(`progress/judge_despliegue_github_pages.md`, misma seccion), que anadio 1
test nuevo en `hrefDeDestino.test.ts` (base que empieza pero no termina en
barra) y 1 asercion exacta en `tecnicaSpaGithubPages.test.ts` (`@s9`,
`resultado.search` con `toBe('?/campanas')`) sin tocar produccion.

### Comprobaciones previas

- Antes de arrancar habia una corrida en curso de `bin/harness init` (PID
  47188) con `pnpm run test` (PID 25720) y unos 24 workers de Vitest, de
  otra sesion/agente, no un Stryker (mismo patron que en la medicion
  anterior). Espere (sondeo cada 10s) a que terminara por completo antes
  de arrancar cualquier mutacion. Verificado de nuevo justo antes de cada
  corrida de Stryker: 0 procesos `node.exe` en los tres casos (antes del
  Vitest de aislamiento, y antes de cada una de las dos corridas de
  Stryker).
- `pnpm exec vitest run src/lib/hrefDeDestino.test.ts
  src/lib/tecnicaSpaGithubPages.test.ts` de los dos ficheros de test en
  aislamiento, antes de mutar: 2 ficheros, **78 tests**, 78 passed (3.29s)
  -- un test mas que la medicion anterior (77), coincide exactamente con
  el unico `it` nuevo que anade el refuerzo.
- Ambas corridas de Stryker con `--plugins @stryker-mutator/vitest-runner`
  explicito (igual que la medicion anterior).
- Columna de timeouts en ambas corridas: 0. No hizo falta repetir a
  `concurrency 1` (ya es el valor por defecto de `stryker.config.json`).
- `sha256sum src/lib/hrefDeDestino.ts src/lib/tecnicaSpaGithubPages.ts`
  verificado por mi antes de mutar: `e2b79550...` y `bdb14388...`,
  identicos a los hashes citados por `tdd_craftsman` y `judge` en sus
  respectivas secciones de refuerzo. Produccion intacta, solo cambiaron
  los dos ficheros de test.

### Resultado por fichero

| Fichero | total | killed | survived | timeout | score |
| --- | --- | --- | --- | --- | --- |
| src/lib/hrefDeDestino.ts | 10 | 10 | 0 | 0 | 100.00% |
| src/lib/tecnicaSpaGithubPages.ts | 36 | 36 | 0 | 0 | 100.00% |
| Total | 46 | 46 | 0 | 0 | 100.00% |

Veredicto por fichero: PASS en los dos (100% en ambos).

### Los 4 mutantes previamente supervivientes, confirmados muertos uno a uno

Verificado leyendo `mutation.json` de cada corrida (no solo el resumen
agregado), identificando cada mutante exacto por `mutatorName` + linea +
columna reportados en la medicion anterior:

- `src/lib/hrefDeDestino.ts:5:10` (MethodExpression, `endsWith`→`startsWith`):
  **Killed** (mutant id 1).
- `src/lib/hrefDeDestino.ts:5:24` (StringLiteral, `endsWith(BARRA)`→
  `endsWith('')`): **Killed** (mutant id 2).
- `src/lib/tecnicaSpaGithubPages.ts:55:35` (ConditionalExpression,
  `ruta.search === CADENA_VACIA`→siempre falso): **Killed** (mutant id 11,
  y su gemelo id 12 con la misma coordenada).
- `src/lib/tecnicaSpaGithubPages.ts:55:51` (StringLiteral, comparacion
  contra `'Stryker was here!'`): **Killed** (mutant id 14).

Los otros 42 mutantes que ya estaban muertos en la medicion anterior siguen
muertos (ningun cambio de comportamiento en produccion entre una medicion y
otra, confirmado por hash identico).

### Mutantes sobrevivientes

Ninguno.

### Mutantes excluidos como equivalentes

Ninguno.

### Evidencia

- Corridas: `pnpm exec stryker run --mutate src/lib/hrefDeDestino.ts
  --plugins @stryker-mutator/vitest-runner` y `pnpm exec stryker run
  --mutate src/lib/tecnicaSpaGithubPages.ts --plugins
  @stryker-mutator/vitest-runner`, ambas con concurrency 1 (de la config),
  columna de timeouts en 0 en las dos.
- `reports/mutation/index.html` y `reports/mutation/mutation.json` en
  disco reflejan la ultima corrida (`tecnicaSpaGithubPages.ts`), misma
  limitacion de ruta fija que en la medicion anterior; los datos de la
  corrida de `hrefDeDestino.ts` (10 killed, 0 survived, 10 total, 0
  timeout) se copiaron a
  `<scratchpad-de-esta-sesion>/mutation-hrefDeDestino.json` antes de que
  la segunda corrida lo sobrescribiera, y se transcriben aqui desde esa
  copia.

### Veredicto sobre la feature 23 completa

Con este PASS al 100% sobre los dos unicos modulos mordibles declarados de
la feature 23, y dado que `judge` ya confirmo de forma independiente
(`progress/judge_despliegue_github_pages.md`) que los 24 escenarios
(`@s1`-`@s24`) estan cubiertos y que no queda produccion sin test, no
queda ningun bloqueo de diseno, cobertura o mutacion pendiente para esta
feature. Quedan unicamente, a cargo de `craftsman_lead` (no de una nueva
ronda de TDD ni de mutacion): los 2 hallazgos textuales y la separacion de
commit ya senalados en `progress/judge_despliegue_github_pages.md`
("Cambios requeridos", puntos 2-4).
