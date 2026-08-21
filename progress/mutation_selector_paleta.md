# Mutación — feature `selector_paleta` (id 14)

**Contexto:** medición tras `progress/judge_selector_paleta.md` (ronda 2),
veredicto **APPROVED**, "Cambios requeridos: Ninguno".

**Veredicto:** **PASS**

**Score:** 16/16 = **100.00%** (umbral: `1.0` en `harness.config.json` ->
`mutation.threshold`; `stryker.config.json` -> `thresholds.break = 100`)

Score bruto reportado por Stryker: 16/17 = 94.12%. El unico mutante que no
quedo `Killed` (id `14`, linea 64) se documenta abajo como equivalente
genuino con justificacion explicita y verificacion empirica independiente
(no solo argumentada). Descontado ese mutante, el score efectivo sobre
comportamiento observable real es 16/16 = 100%, que cumple el umbral.

**Timeouts: 0.** Columna `# timeout` leida antes que el score (patron
informe-de-mutacion-con-timeouts-miente, recordado en el
`_comment_concurrency` de `stryker.config.json`): 0 en la unica corrida - no
hizo falta repetir a `--concurrency 1` (ademas `stryker.config.json` ya trae
`"concurrency": 1` por defecto en todo el proyecto: la corrida creo
"1 test runner process(es)"). Confirmado tambien contra
`reports/mutation/mutation.json`: de los 17 mutantes de
`src/components/SelectorPaleta-logica.ts`, `status` es `Killed` en 16 y
`Survived` en 1 - cero `Timeout`, `NoCoverage` o `RuntimeError`.

## Alcance - por que un solo fichero

Ficheros de produccion listados en `progress/tdd_selector_paleta.md` seccion
"Entregables":

- `src/data/variantesPaleta.ts` - catalogo literal de las 4 variantes.
- `src/components/SelectorPaleta-logica.ts` - logica pura: `resolverVarianteInicial`
  (gemelo puro del script anti-destello), `leerVarianteAlmacenada`,
  `guardarVarianteElegida`, `idsDelCatalogo` (privada).
- `src/components/SelectorPaleta.tsx` - solo cablea (presentacion).
- `index.html` - script inline anti-FOUC, espejo manual de `resolverVarianteInicial`.

Contrastados contra el glob mordible declarado en `stryker.config.json`:

```
"mutate": [
  "src/lib/**/*.ts",
  "src/**/*-logica.ts",
  "!src/**/*.test.ts",
  "!src/**/*.test.tsx",
  "!src/**/*.d.ts"
]
```

Solo `src/components/SelectorPaleta-logica.ts` cae dentro (coincide con
`src/**/*-logica.ts`). `SelectorPaleta.tsx` queda fuera a proposito
(comentario de cabecera de `stryker.config.json`: los `.tsx` solo cablean
presentacion, StrykerJS no muta JSX de forma fiable - issue
stryker-mutator/stryker-js#4375). `src/data/variantesPaleta.ts` tampoco cae
en el glob: vive bajo `src/data/`, no `src/lib/`, y el nombre de fichero no
termina en `-logica.ts` (mismo criterio ya aplicado y aprobado en
servicios.ts/equipo.ts/navegacion.ts/galeria.ts/campanas.ts/
pieDePaginaEnlaces.ts en features previas: catalogos de datos fuera de la
superficie mordible por diseno). `index.html` no es un fichero `.ts`/`.tsx` -
Stryker no lo instrumenta en absoluto; esto es esperado por diseno del
patron logica-pre-pintado-inline-se-espeja-en-gemelo-puro-testeable citado
en `progress/tdd_selector_paleta.md`, no un hueco de cobertura: el gemelo
puro (`resolverVarianteInicial`) es la superficie mordible real, y su
fidelidad frente al inline la ancla el test de integridad de texto (@s10),
no la mutacion.

Por tanto la superficie mutable real de esta feature es en su totalidad
`src/components/SelectorPaleta-logica.ts`, y basta una sola corrida de
Stryker.

## Comando usado

`bin/harness mutate src/components/SelectorPaleta-logica.ts` reprodujo el
fallo de entorno ya documentado en rondas previas (`progress/mutation_tokens_marca.md`,
`progress/mutation_datos_negocio.md`, `progress/mutation_faq.md`,
`progress/mutation_pie_de_pagina.md`, entre otras): Stryker no resuelve el
plugin `@stryker-mutator/vitest-runner` via el glob por defecto pese a estar
instalado en `node_modules/@stryker-mutator/vitest-runner` (mensaje: "Cannot
find TestRunner plugin vitest. In fact, no TestRunner plugins were
loaded."). Repetido con el workaround ya validado, plugin explicito, un
unico fichero, sin corridas de Stryker concurrentes:

```
pnpm exec stryker run --mutate src/components/SelectorPaleta-logica.ts --plugins @stryker-mutator/vitest-runner
```

## Resultado (bruto, tal cual Stryker)

```
--------------------------|------------------|----------|-----------|------------|----------|----------|
                          | % Mutation score |          |           |            |          |          |
File                      |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
--------------------------|--------|---------|----------|-----------|------------|----------|----------|
All files                 |  94.12 |   94.12 |       16 |         0 |          1 |        0 |        0 |
 SelectorPaleta-logica.ts |  94.12 |   94.12 |       16 |         0 |          1 |        0 |        0 |
--------------------------|--------|---------|----------|-----------|------------|----------|----------|
Final mutation score 94.12 under breaking threshold 100, setting exit code to 1 (failure).
```

Ran 5.35 tests per mutant en promedio. Los 16 escenarios `@s1..@s16`
aparecen como "covered" o "killed" segun el reporte de consola de Stryker;
cada uno de los 17 mutantes generados termino con status `Killed` o
`Survived` (nunca `Timeout`/`NoCoverage`/`RuntimeError`).

## Mutantes sobrevivientes

### 1. src/components/SelectorPaleta-logica.ts:64 - ConditionalExpression

```
-     if (stored !== null && idsDelCatalogo(catalogo).includes(stored)) {
+     if (true && idsDelCatalogo(catalogo).includes(stored)) {
```

Excluido por equivalencia genuina, no es un hueco de test.

Justificacion: `catalogo` es `readonly VariantePaleta[]` y `VariantePaleta.id`
es `string` (nunca `null` ni `undefined`) en todo el arbol de produccion -
`idsDelCatalogo` (linea 52) solo hace `catalogo.map(v => v.id)`, asi que
`idsDelCatalogo(catalogo)` es siempre un array de strings reales, nunca
contiene `null`. `Array.prototype.includes` compara por SameValueZero, sin
coercion: el resultado de llamar a `includes(null)` sobre un array de solo
strings es siempre `false`, sea cual sea su contenido (incluido el array
vacio de @s16).

Por tanto, para `stored` igual a `null`:
- Original: la comparacion `stored !== null` es `false`, cortocircuito, nunca
  evalua la llamada a `includes`, devuelve `VARIANTE_POR_DEFECTO`.
- Mutante: la expresion equivale a `idsDelCatalogo(catalogo).includes(null)`,
  que siempre es `false` (nunca hay un id nulo en el catalogo), asi que
  tambien devuelve `VARIANTE_POR_DEFECTO`.

Y para `stored` distinto de `null` (cualquier string, incluida cadena vacia,
"tech" o texto corrupto): ambas ramas evaluan exactamente la misma llamada a
`includes` con el mismo argumento - el mutante no toca esa parte de la
expresion.

Verificacion empirica independiente (no solo argumentada): se ejecuto un
script de Node aparte (no forma parte de src/) replicando ambas
implementaciones linea a linea y probandolas contra 12 combinaciones (stored
en null, cadena vacia, "tech", "noche", texto corrupto, undefined; catalogo
en catalogo completo de 4 variantes o catalogo vacio) - cero diferencias en
los 12 casos, incluidos los casos limite que cubren @s9/@s11/@s12/@s13/@s16.
Se confirmo ademas que llamar a includes con null o con undefined sobre un
array de strings siempre devuelve false.

No existe ningun test legitimo (sin violar el contrato de tipos de
VariantePaleta.id: string con un cast artificial que inyecte un id nulo que
nunca ocurre en produccion) capaz de distinguir ambas implementaciones: son
observacionalmente identicas para todo stored y todo catalogo real. Escribir
un test que fuerce un id nulo en el catalogo no protegeria ningun
comportamiento real de la aplicacion (el catalogo real, src/data/variantesPaleta.ts,
es literal y nunca produce un id nulo), asi que seria un test artificial sin
valor de regresion - justo el abuso que docs/mutation-testing.md pide evitar
en sentido contrario (no fabricar cobertura falsa para matar un mutante que
no representa un defecto real).

Conclusion sobre este mutante: equivalente genuino, excluido del
denominador. No es trabajo de tdd_craftsman.

## Verificacion cruzada

- `reports/mutation/mutation.json`: `files["src/components/SelectorPaleta-logica.ts"].mutants`
  - 17 entradas, 16 con status Killed, 1 con status Survived (id 14,
  mutatorName ConditionalExpression, replacement "true", linea 64), cero
  Timeout, NoCoverage ni RuntimeError.
- Corrida unica de Stryker (no hubo ninguna otra activa en paralelo sobre
  este repo durante esta medicion; se ejecuto un solo fichero, una sola
  vez).
- `stryker.config.json` ya trae `"concurrency": 1` a nivel de proyecto
  (Creating 1 test runner process(es) en el log), asi que no hizo falta
  forzarlo por flag: la corrida ya cumplia la condicion antes incluso de
  leer la columna `# timeout`.

## Conclusion

**PASS.** Score bruto de Stryker 16/17 = 94.12%; con el unico mutante
sobreviviente documentado y verificado como equivalente genuino (linea 64,
`stored !== null` mutado a `true`, indistinguible observacionalmente dado
que `idsDelCatalogo` nunca produce `null`/`undefined`), el score efectivo
sobre comportamiento real es 16/16 = 100% >= umbral 100%
(`harness.config.json` -> `mutation.threshold: 1.0`). Feature
`selector_paleta` (id 14) supera la puerta de mutacion; queda pendiente solo
que el craftsman_lead marque `done` en `feature_list.json` tras leer este
informe y `progress/judge_selector_paleta.md` completos.
