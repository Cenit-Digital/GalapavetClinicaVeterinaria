# Mutación — feature `campanas_portada` (id 9)

**Contexto:** medición tras `progress/judge_campanas_portada.md` (ronda 1),
veredicto **APPROVED**, "Cambios requeridos: Ninguno", verificado por el
`judge` con 7 sabotajes manuales propios (independientes de los del
`tdd_craftsman`), todos revertidos.

**Veredicto:** **FAIL**

**Score:** 18/21 = **85.71%** (umbral: `1.0` en `harness.config.json` -> `mutation.threshold`; `stryker.config.json` -> `thresholds.break = 100`)

**Timeouts: 0.** Columna `# timeout` leída antes que el score (patrón
`informe-de-mutacion-con-timeouts-miente`): 0 en la única corrida — no hizo
falta repetir, la instrucción de repetir solo aplica si la columna no es 0.
Confirmado también contra `reports/mutation/mutation.json`: los únicos
`status` presentes en el objeto agregado son `Killed` (18) y `Survived` (3) —
ni `Timeout`, ni `NoCoverage`, ni `RuntimeError` aparecen.

## Alcance — por qué un solo fichero

Ficheros de producción tocados por esta feature, según
`progress/tdd_campanas_portada.md` § "Diseño previo al primer ciclo" y
§ "Refactor final":

- `src/data/campanas.ts` — catálogo estático de demostración (`CAMPANAS_DEMO`,
  `interface CampanaDemo`), sin lógica de decisión.
- `src/components/CampanasPortada-logica.ts` — módulo puro
  (`construirModeloCampanas`, `errorPrecioNoConfirmado`,
  `errorVigenciaNoConfirmada`), 33 líneas.
- `src/components/CampanasPortada.tsx` — componente, solo cablea
  (`construirModeloSeguro` + JSX), 52 líneas.

Cruzado contra el glob `mutate` de `stryker.config.json`
(`src/lib/**/*.ts` + `src/**/*-logica.ts`, con `.tsx` deliberadamente fuera
por la limitación conocida de StrykerJS con JSX — comentario `_comment` de
cabecera del propio fichero, mismo criterio ya aplicado y confirmado en
`progress/mutation_equipo.md`, `progress/mutation_servicios.md` y
`progress/mutation_galeria.md`): **solo `CampanasPortada-logica.ts` cae
dentro de la superficie mutable declarada del proyecto**.
`src/data/campanas.ts` es un dato sin lógica (no matchea `*-logica.ts` ni
vive en `src/lib`, mismo criterio que `equipo.ts`/`servicios.ts`/
`galeria.ts`) y `CampanasPortada.tsx` está excluido por convención de todo
el proyecto. No hay, por tanto, otro fichero que morder para esta feature.

## Verificación de entorno previa (concurrencia)

- `Get-CimInstance Win32_Process` filtrado por `CommandLine -match stryker`
  antes de arrancar: 0 procesos reales de Stryker/`node.exe` activos (los
  procesos listados eran la propia consulta bash/powershell en curso, que
  contiene la palabra "stryker" en el texto del comando que se estaba
  ejecutando — no un `pnpm exec stryker` real).
- Solo se lanzó una corrida (un único fichero mordible).
- Tras el fin del proceso: `Get-Process -Name node` sin resultados — 0
  procesos Node activos, ninguna corrida colgada.

## Comando usado

Workaround ya validado en sesiones anteriores de este proyecto
(`progress/mutation_galeria.md`, `progress/mutation_tokens_marca.md`,
`progress/mutation_datos_negocio.md`, sección "Comando usado"): `bin/harness
mutate` invoca `pnpm exec stryker run --mutate {{target}}` tal cual declara
`harness.config.json`, pero Stryker no resuelve el plugin
`@stryker-mutator/vitest-runner` vía el glob por defecto en esta máquina
pese a estar instalado. Se usó directamente, un solo fichero, sin ninguna
otra corrida de Stryker en paralelo:

```
pnpm exec stryker run --mutate src/components/CampanasPortada-logica.ts --plugins @stryker-mutator/vitest-runner
```

`--concurrency 1` ya fijado en `stryker.config.json`. No se tocó ningún
fichero de configuración para esto.

## Resultado (medición oficial)

```
---------------------------|------------------|----------|-----------|------------|----------|----------|
                           | % Mutation score |          |           |            |          |          |
File                       |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
---------------------------|--------|---------|----------|-----------|------------|----------|----------|
All files                  |  85.71 |   85.71 |       18 |         0 |          3 |        0 |        0 |
 CampanasPortada-logica.ts |  85.71 |   85.71 |       18 |         0 |          3 |        0 |        0 |
---------------------------|--------|---------|----------|-----------|------------|----------|----------|
Final mutation score 85.71 under breaking threshold 100, setting exit code to 1 (failure).
```

Instrumentados 21 mutantes sobre 1 fichero fuente. Ran 2.57 tests per mutant
on average. Duración: 2 minutos 11 segundos.

**Verificación independiente**, no fiada solo del resumen `clear-text`: se
leyó `reports/mutation/mutation.json` directamente con un script Node.js que
recorre `files['src/components/CampanasPortada-logica.ts'].mutants` y
agrega por `status`.

Resultado del conteo crudo: `{ Survived: 3, Killed: 18 }` — 21 mutantes en
total, ningún mutante en `Timeout`, `NoCoverage` ni `RuntimeError`. Coincide
exactamente con el resumen `clear-text`.

## Mutantes sobrevivientes

### 1. src/components/CampanasPortada-logica.ts:9 (mutante id 0, BlockStatement)

```
- function errorPrecioNoConfirmado(titulo: string, precio: string): Error {
-   return new Error(`La campaña "${titulo}" declara un precio no confirmado: "${precio}"`)
- }
+ function errorPrecioNoConfirmado(titulo: string, precio: string): Error {}
```

Con este mutante, `errorPrecioNoConfirmado(...)` devuelve `undefined`, así
que `throw errorPrecioNoConfirmado(...)` pasa a ejecutar `throw undefined`.
Los tests que cubren esta línea (@s9 de CampanasPortada-logica.test.ts:6-9 y
@s18 de CampanasPortada.test.tsx) siguen en verde con el mutante aplicado.

Causa raíz confirmada leyendo la implementación real del matcher
(node_modules/.pnpm/chai@6.2.2/.../index.js, función assertThrows, usada
internamente por toThrowError(regex) de @vitest/expect): el bloque que
compara el mensaje capturado contra el RegExp esperado está guardado tras
la condición "si hay un valor capturado y hay un matcher de mensaje". Cuando
el valor lanzado es undefined (falsy), el valor capturado es undefined, la
condición es falsa y el chequeo de mensaje se salta por completo: la
aserción solo verifica que "algo se lanzó", no qué se lanzó ni con qué
texto. Por eso toThrowError con una expresión regular sigue pasando aunque
el error real ya no exista.

Falta: un test que verifique que lo lanzado es una instancia real de Error
(capturar el valor vía try/catch y aserir explícitamente que es instancia de
Error, además de comprobar el mensaje), en vez de confiar únicamente en
toThrowError(regex), que no distingue "lanzó un Error con mensaje X" de
"lanzó undefined".

### 2. src/components/CampanasPortada-logica.ts:13 (mutante id 2, BlockStatement)

```
- function errorVigenciaNoConfirmada(titulo: string, vigencia: string): Error {
-   return new Error(`La campaña "${titulo}" declara una vigencia no confirmada: "${vigencia}"`)
- }
+ function errorVigenciaNoConfirmada(titulo: string, vigencia: string): Error {}
```

Simétrico al mutante 1, sobre errorVigenciaNoConfirmada. Cubierto por @s10
(CampanasPortada-logica.test.ts:14-17) y @s21 (CampanasPortada.test.tsx),
ambos con el mismo patrón toThrowError(regex) y la misma causa raíz.

Falta: mismo tipo de test que el mutante 1, pero para la rama de vigencia:
capturar el error lanzado y aserir explícitamente que es instancia de
Error, no solo el patrón del mensaje.

### 3. src/components/CampanasPortada-logica.ts:33 (mutante id 19, MethodExpression)

```
- return catalogo.filter((campana) => campana.titulo.trim() !== "")
+ return catalogo.filter((campana) => campana.titulo !== "")
```

Elimina la llamada a .trim() del filtro de títulos vacíos. Cubierto por 16
tests (todos los que ejercitan construirModeloCampanas o el componente con
algún catálogo), pero ninguno lo mata porque ningún catálogo de prueba usa
un título compuesto solo por espacios en blanco (tres espacios, por
ejemplo). Todos los casos de "título vacío" en @s16/@s17/@s19/@s20 usan el
literal de cadena vacía a secas, para el cual titulo.trim() !== "" y
titulo !== "" son indistinguibles.

Falta: un test (extensión natural de @s16/@s19, o un nuevo caso de unidad
si el .feature no lo cubre explícitamente hoy) con una entrada de catálogo
cuyo título sea solo espacios en blanco, que deba descartarse igual que un
título vacío. Ese es el caso mínimo que distingue titulo.trim() !== "" de
titulo !== "" y mata este mutante.

## Conclusión

src/components/CampanasPortada-logica.ts — único fichero de la feature
campanas_portada (id 9) dentro del glob mordible de stryker.config.json —
alcanza 18/21 = 85.71% de mutación, por debajo del umbral 1.0 (100%) de
harness.config.json -> mutation.threshold. **C7 no queda satisfecho.** No
se editó ningún fichero de src/ ni de test durante esta medición (regla
dura de este rol: mide, no talla).

**Para craftsman_lead / tdd_craftsman:** 3 mutantes sobrevivientes, dos con
la misma causa raíz (uso de toThrowError(regex) sin verificar que lo
lanzado sea realmente un Error, lo que deja pasar un throw undefined sin
detectarlo) y uno por ausencia de un caso de título "solo espacios" que
ejercite .trim(). Ninguno es equivalente: los tres cambian comportamiento
observable real (un throw undefined en vez de un Error con mensaje es una
regresión de contrato de error; quitar .trim() cambia qué títulos se
descartan). No se marca done en feature_list.json hasta que tdd_craftsman
añada los tests que faltan y una nueva corrida de mutación alcance 100%.

---

## Ronda 2 — 2026-08-20 (medición oficial tras refuerzo de mutación)

**Contexto:** la ronda 1 de esta bitácora midió **FAIL** (18/21 = 85.71%) sobre
`src/components/CampanasPortada-logica.ts`, con 3 mutantes sobrevivientes no
equivalentes. El `tdd_craftsman` reforzó `CampanasPortada-logica.test.ts` en
`progress/tdd_campanas_portada.md` § "Ronda 3" (3 tests nuevos, **cero
cambios de producción**), y el `judge` re-aprobó en `progress/judge_campanas_portada.md`
§ "Ronda 2 — re-revisión tras refuerzo de mutación" (Veredicto **APPROVED**,
verificación propia de los 3 mutantes exactos, C7 dejado pendiente de esta
medición formal). Esta entrada repite la medición oficial de mutación, tal
como pide `craftsman_lead`.

**Veredicto:** **PASS**

**Score:** 21/21 = **100%** (umbral: `1.0` en `harness.config.json` ->
`mutation.threshold`; `stryker.config.json` -> `thresholds.break = 100`)

### Alcance — mismo fichero que la ronda 1

Confirmado de nuevo contra `stryker.config.json` (glob `mutate`:
`src/lib/**/*.ts` + `src/**/*-logica.ts`, `.tsx` excluido a propósito):
`src/components/CampanasPortada-logica.ts` sigue siendo el único fichero de
la feature `campanas_portada` (id 9) dentro de la superficie mordible.
`src/data/campanas.ts` (dato sin lógica) y `CampanasPortada.tsx` (solo
cablea) quedan fuera, mismo criterio que la ronda 1. Ningún otro fichero de
`src/` fue tocado por el refuerzo de la ronda 3 (confirmado en
`progress/tdd_campanas_portada.md` y `progress/judge_campanas_portada.md`,
ambos documentan `git diff` vacío sobre el fichero de producción).

### Verificación de entorno previa (concurrencia)

- Antes de arrancar: `Get-CimInstance Win32_Process` (vía PowerShell) sobre
  `node.exe` mostró una corrida activa real de `pnpm run test` con múltiples
  workers `vitest ... forks.js` (no era Stryker, pero sí carga de CPU
  significativa). Se esperó y se repitió la consulta: en la siguiente lectura,
  0 procesos `node.exe` activos — la corrida de test había terminado. Una
  tercera lectura, ya con la consulta lanzada, mostró 4 procesos, pero los 4
  eran la propia cadena de `bash.exe`/`powershell.exe` ejecutando la consulta
  (contienen la palabra "stryker" en el texto del comando que se estaba
  ejecutando), igual que en la ronda 1 — ningún `pnpm exec stryker` ni
  `node.exe` de producción real.
- Solo se lanzó una corrida de Stryker (un único fichero mordible), sin
  ninguna otra corrida en paralelo.

### Comando usado

Mismo workaround validado en rondas y features anteriores de este proyecto
(`harness.config.json` -> `commands.mutate` no resuelve el plugin
`@stryker-mutator/vitest-runner` vía el glob por defecto en esta máquina):

```
pnpm exec stryker run --mutate src/components/CampanasPortada-logica.ts --plugins @stryker-mutator/vitest-runner
```

`--concurrency 1` ya fijado en `stryker.config.json`. No se tocó ningún
fichero de configuración ni de código para esta medición.

### Resultado (medición oficial)

```
---------------------------|------------------|----------|-----------|------------|----------|----------|
                           | % Mutation score |          |           |            |          |          |
File                       |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
---------------------------|--------|---------|----------|-----------|------------|----------|----------|
All files                  | 100.00 |  100.00 |       21 |         0 |          0 |        0 |        0 |
 CampanasPortada-logica.ts | 100.00 |  100.00 |       21 |         0 |          0 |        0 |        0 |
---------------------------|--------|---------|----------|-----------|------------|----------|----------|
Final mutation score of 100.00 is greater than or equal to break threshold 100
```

Instrumentados 21 mutantes sobre 1 fichero fuente (mismo total que la ronda
1: el refuerzo añadió aserciones dentro de `describe` ya existentes, no
código de producción nuevo que generara mutantes adicionales). Ran 1.38
tests per mutant on average. Duración: 3 minutos 37 segundos.

**Columna `# timeout` leída antes que el score** (patrón
`informe-de-mutacion-con-timeouts-miente`, recordado también en el
`_comment_concurrency` de `stryker.config.json`): **0** en la única corrida.
No hizo falta repetir — la instrucción de repetir solo aplica si la columna
no es 0.

**Verificación independiente**, no fiada solo del resumen `clear-text`: leído
`reports/mutation/mutation.json` con un script Node.js que recorre
`files['src/components/CampanasPortada-logica.ts'].mutants` y agrega por
`status`. Resultado del conteo crudo: `{ Killed: 21 }` — 21 mutantes en
total, ningún mutante en `Survived`, `Timeout`, `NoCoverage` ni
`RuntimeError`. Coincide exactamente con el resumen `clear-text`.

### Mutantes sobrevivientes

Ninguno. Los 3 mutantes que sobrevivieron en la ronda 1 (id 0 y id 2 —
cuerpo vacío de `errorPrecioNoConfirmado`/`errorVigenciaNoConfirmada`— e id
19 — `catalogo.filter(titulo.trim() !== "")` sin `.trim()`) aparecen ahora
como `Killed` en la salida verbosa de Stryker, exactamente por los 3 tests
nuevos de la ronda 3 (`@s9 ... lo lanzado es una instancia real de Error...`
con `killed 1`, `@s10 ... lo lanzado es una instancia real de Error...` con
`killed 1`, `@s19 ... descarta también un título compuesto solo por espacios
en blanco...` con `killed 1`).

### Conclusión

`src/components/CampanasPortada-logica.ts` — único fichero de la feature
`campanas_portada` (id 9) dentro del glob mordible de `stryker.config.json`
— alcanza 21/21 = **100%** de mutación, igualando el umbral `1.0` de
`harness.config.json` -> `mutation.threshold`. **C7 queda satisfecho.** No se
editó ningún fichero de `src/` ni de test durante esta medición (regla dura
de este rol: mide, no talla). Feature `campanas_portada` (id 9) lista para
que `craftsman_lead` la marque `done` en `feature_list.json`.
