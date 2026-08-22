# Mutacion - feature seo_estructura (id 15)

## Ronda 1 - 22/08/2026

**Veredicto:** FAIL

**Score (bruto, 3 ficheros):** 133/140 = 95.00% (umbral: 1.0 / 100%,
harness.config.json -> mutation.threshold; stryker.config.json ->
thresholds.break = 100)

**Score (excluidos mutantes equivalentes):** igual, 133/140 = 95.00% - 0
mutantes excluidos por equivalencia (los 7 supervivientes se verificaron
como huecos reales, ver abajo).

Timeouts: 0 en las 3 corridas. Columna "# timeout" leida antes que el score
en cada una: 0/0, 0/0, 0/0. Errors: 0 en las 3. No cov: 2 (todos en
seo-logica.ts, contados como no matados en el score, ver detalle).

## Alcance - identificacion de ficheros

Leido progress/tdd_seo_estructura.md (seccion "Ficheros") y confirmado con
git status el diff real de esta sesion. Filtrado por el glob mutable fijo de
stryker.config.json (src/lib/**/*.ts + src/**/*-logica.ts, sin .tsx, sin
ficheros de test):

- src/lib/seo-logica.ts (nuevo) - modulo puro de la feature, JSON-LD y
  validacion de metadatos. Objetivo principal.
- src/lib/datosEstructuradosNegocio.ts (nuevo) - constante calculada una vez
  a partir de datosNegocio; dentro del glob mutable (src/lib/**/*.ts) aunque
  es ensamblaje sin ramas propias.
- src/lib/site.ts (modificado) - crearDireccion reestructurado para recibir
  {calle, codigoPostal, localidad, region} y derivar lineas/unaLinea (antes
  al reves). Codigo compartido con otras features ya cerradas
  (datos_negocio, 100% previo); se re-mide integro por el cambio real de
  esta sesion, mismo criterio que la re-medicion de App-logica.ts en
  pagina_blog.

Fuera de alcance, por no estar en el diff de esta feature ni en el glob
mutable: src/lib/telefono.ts (ya done, 100% mutado, no tocado por esta
sesion, confirmado con git status sin cambios), src/components/MetadatosPagina.tsx
y las 4 paginas (.tsx, fuera del glob mutable por decision explicita del
proyecto, ver cabecera de stryker.config.json), src/documento.test.ts y
src/paginasSeo.test.tsx (son tests, no produccion).

## Verificacion de entorno antes de cada corrida

tasklist filtrado por node.exe antes de cada corrida: sin ningun proceso de
Stryker vivo en ninguna de las 3 comprobaciones (solo procesos ajenos del
IDE, identificados por linea de comandos via Get-CimInstance Win32_Process).
Nunca hubo dos corridas de Stryker vivas a la vez, cada una se lanzo y se
espero a su finalizacion (caida del proceso node.exe de Stryker) antes de
lanzar la siguiente. --concurrency 1 ya fijado en stryker.config.json.
Ningun fichero de src/ ni de test fue editado durante esta medicion.

## Como se corrio (3 corridas independientes, secuenciales, nunca en paralelo)

    pnpm exec stryker run --mutate src/lib/seo-logica.ts --plugins @stryker-mutator/vitest-runner
    pnpm exec stryker run --mutate src/lib/datosEstructuradosNegocio.ts --plugins @stryker-mutator/vitest-runner
    pnpm exec stryker run --mutate src/lib/site.ts --plugins @stryker-mutator/vitest-runner

Duracion: seo-logica.ts 23 min 47 s (101 mutantes, 21.19 tests/mutante de
media); datosEstructuradosNegocio.ts 1 min 18 s (1 mutante, 1.00
tests/mutante); site.ts 6 min 4 s (38 mutantes, 16.21 tests/mutante).

## Resultado por fichero

| Fichero | total | killed | survived | # timeout | # no cov | # errors | score |
| --- | --- | --- | --- | --- | --- | --- | --- |
| src/lib/seo-logica.ts | 101 | 94 | 5 | 0 | 2 | 0 | 93.07% |
| src/lib/datosEstructuradosNegocio.ts | 1 | 1 | 0 | 0 | 0 | 0 | 100.00% |
| src/lib/site.ts | 38 | 38 | 0 | 0 | 0 | 0 | 100.00% |
| Total feature (bruto) | 140 | 133 | 5 | 0 | 2 | 0 | 95.00% |

---

## src/lib/datosEstructuradosNegocio.ts - 1/1 = 100%

Unico mutante generado (el fichero es ensamblaje puro, sin ramas: una
llamada a construirDatosEstructurados con los campos de datosNegocio),
matado. Sin no-cov, sin timeout, sin errors.

## src/lib/site.ts - 38/38 = 100%

Cero supervivientes. crearDireccion reestructurado (recibe la forma
estructurada, deriva lineas/unaLinea) sigue 100% matado - el refuerzo de
site.test.tsx (describe "seo_estructura @s9 ...", documentado en
progress/tdd_seo_estructura.md) cubre la nueva forma sin dejar huecos.
Confirma que el cambio de datos_negocio (100% previo) no introdujo
regresion de mutacion al reestructurarse para esta feature.

## src/lib/seo-logica.ts - 94/101 = 93.07% bruto (7 no matados: 5 survived + 2 no cov)

### Verificacion empirica de los 7 supervivientes/no-cov (ninguno es equivalente)

Para cada grupo se reprodujo la logica exacta (original vs mutante) en un
script desechable fuera del repo (node, sin tocar src/ ni tests) y se
comparo la salida sobre inputs concretos. Detalle:

#### Grupo A - guarda de etiqueta de dia desconocida (2 supervivientes, linea 157)

    [Survived] ConditionalExpression  src/lib/seo-logica.ts:157:9
    -       if (diasSemana === undefined) {
    +       if (false) {

    [Survived] BlockStatement         src/lib/seo-logica.ts:157:35
    -       if (diasSemana === undefined) {
    -         return []
    -       }
    +       if (diasSemana === undefined) {}

Con el horario real de produccion (Lunes a viernes / Sabados / Domingos con
"Cerrado"), la entrada Domingos es la unica con diasSemana undefined, y su
horas ("Cerrado") no contiene ningun patron HH:MM a HH:MM -
extraerTramosDeHoras devuelve [] para ella, asi que .map(...) (donde se
leeria diasSemana) nunca se invoca. Con o sin la guarda, la salida es
identica (3 tramos) para ese input - por eso Stryker los reporta Survived
con la suite actual.

Verificacion empirica (input que ningun test actual usa): anadiendo una
entrada con etiqueta NO reconocida y horas SI parseables (dias: "Festivos",
horas: "10:00 a 12:00"):
- Original: 3 tramos, sin excepcion (la entrada Festivos se omite
  correctamente por etiqueta desconocida).
- Ambos mutantes: lanzan TypeError: diasSemana is not iterable (al llegar a
  [...diasSemana] con diasSemana undefined, porque la guarda ya no impide
  seguir).

Comportamiento observable distinto confirmado empiricamente => no son
equivalentes. Falta un test que use una entrada de horario con una etiqueta
de dia no reconocida por DIAS_SEMANA_POR_ETIQUETA (por ejemplo "Festivos") Y
una cadena horas con un tramo HH:MM a HH:MM real, verificando que
construirDatosEstructurados no lanza y que esa entrada no produce ningun
OpeningHoursSpecification (el @s14 actual solo prueba "Domingos"/"Cerrado",
donde la ausencia de match en horas ya haria irrelevante la guarda incluso
sin ella).

#### Grupo B - email siempre incluido (1 superviviente, linea 189)

    [Survived] ConditionalExpression  src/lib/seo-logica.ts:189:9
    -       ...(datos.email !== undefined && { email: datos.email }),
    +       ...(true && { email: datos.email }),

Verificacion empirica: con email undefined, el original produce un objeto
SIN la clave email (email in bloque === false); el mutante produce un
objeto CON la clave email valiendo undefined (email in bloque === true) -
diferencia observable directa confirmada. Sin embargo, todos los tests de
seo-logica.test.ts que comprueban esto (@s15, @s16, @s21, @s22) pasan el
resultado por el helper local comoJsonLd
(JSON.parse(JSON.stringify(construirDatosEstructurados(...)))) antes de
mirar "email in bloque". JSON.stringify elimina las claves cuyo valor es
undefined, asi que tras el ida-y-vuelta de JSON el mutante y el original son
indistinguibles (email in bloque da false en ambos tras pasar por
comoJsonLd) - confirmado empiricamente en el script de verificacion. Por eso
sobrevive con la suite actual.

=> No es equivalente (hay una diferencia observable real y verificada
directamente sobre el objeto sin serializar). Falta un test que llame a
construirDatosEstructurados directamente (sin pasar por
JSON.stringify/JSON.parse) y compruebe que "email" no esta presente en el
objeto cuando datos.email es undefined.

#### Grupo C - sameAs con redesSociales no vacio (4 no matados, linea 190: 2 survived + 2 no cov)

    [Survived]   ConditionalExpression  src/lib/seo-logica.ts:190:9   ...(true)
    [Survived]   ConditionalExpression  src/lib/seo-logica.ts:190:9   ...(false)
    [NoCoverage] ObjectLiteral          src/lib/seo-logica.ts:190:43  { sameAs: [...] } -> {}
    [NoCoverage] ArrayDeclaration       src/lib/seo-logica.ts:190:53  [...datos.redesSociales] -> []

Los 4 mutan la misma linea: ...(datos.redesSociales.length > 0 && { sameAs:
[...datos.redesSociales] }). Ningun fixture de seo-logica.test.ts usa
redesSociales no vacio (DATOS_SEO_BASE.redesSociales: [], y todas las
variantes derivadas conservan [] o no la tocan) - coherente con que el
cliente no publica redes (docs/datos-galapavet.md §9, citado en
site.ts:92), pero @s16/@s22 solo prueban la AUSENCIA, nunca la PRESENCIA.

Verificacion empirica:
- Con redesSociales: [] (unico caso que prueba la suite actual): original y
  los 4 mutantes producen exactamente el mismo JSON
  ({"name":"Galapavet"}, sin sameAs) - confirma por que sobreviven/no
  tienen cobertura.
- Con redesSociales no vacio (dos URLs de ejemplo, input que ningun test
  actual construye): el original produce sameAs con las dos URLs reales;
  los 4 mutantes producen, respectivamente, sin sameAs (...(true),
  ...(false), {sameAs:[...]} -> {}) o sameAs: [] (array vaciado) - los
  cuatro JSON resultantes son distintos del original, confirmado
  empiricamente.

=> Ninguno de los 4 es equivalente. Falta un test con redesSociales no
vacio (por ejemplo 2 URLs de ejemplo) que compruebe que sameAs en el bloque
es exactamente esa lista (mismos valores, mismo orden, ni vacia ni ausente).

### Resumen de huecos para tdd_craftsman

3 tests nuevos matarian los 7 mutantes no matados de seo-logica.ts:

1. Horario con una etiqueta de dia no reconocida ("Festivos" u otra fuera de
   DIAS_SEMANA_POR_ETIQUETA) CON una cadena horas que si contenga un tramo
   HH:MM a HH:MM real -> verificar que no lanza y que esa entrada no aporta
   ningun OpeningHoursSpecification (mata los 2 del Grupo A).
2. Verificar que la clave "email" no esta presente en
   construirDatosEstructurados(datosSinEmail) SIN pasar el resultado por
   JSON.stringify/JSON.parse (mata el del Grupo B).
3. redesSociales no vacio (2+ entradas) -> verificar que sameAs del bloque
   es exactamente esa lista, no ausente ni vacia (mata los 4 del Grupo C).

## Conclusion

FAIL. Score bruto de la feature: 133/140 = 95.00%; sin mutantes equivalentes
que excluir (los 7 se verificaron empiricamente como huecos reales, no
equivalentes) - el score excluyendo equivalentes es el mismo, 95.00%. Muy
por debajo del umbral de harness.config.json -> mutation.threshold (1.0 /
100%; stryker.config.json -> thresholds.break = 100). 0 timeouts en las 3
corridas, asi que el resultado es de fiar tal cual.

Corresponde a tdd_craftsman escribir los 3 tests rojos descritos arriba
(concentrados enteramente en src/lib/seo-logica.ts, lineas 157 y 189-190) y
volver a pasar por judge antes de la siguiente medicion de este rol.
src/lib/datosEstructuradosNegocio.ts (100%) y src/lib/site.ts (100%) no
requieren ninguna accion.

No he tocado ningun fichero de src/ ni de test durante esta medicion (regla
dura de este rol: mide, no talla). Verificacion empirica realizada en
scripts desechables fuera del repositorio (directorio de scratchpad de la
sesion), nunca en src/ ni en los ficheros de test reales.

---

## Ronda 3 — Re-medición tras refuerzo de tdd_craftsman (22/08/2026)

**Veredicto:** PASS

**Score:** killed/total = 140/140 = 100.00% (umbral: 1.0 / 100%)

## Contexto

`progress/tdd_seo_estructura.md` (Ronda 2 — Refuerzo de mutación) y
`progress/judge_seo_estructura.md` (Ronda 2, APPROVED) documentan 3 tests
nuevos añadidos únicamente a `src/lib/seo-logica.test.ts`, dirigidos a los 7
mutantes no matados de la Ronda 1 de este informe (grupos A/B/C, líneas 157 y
189-190 de `seo-logica.ts`). Cero producción tocada, verificado de forma
independiente por `judge` (comparación línea a línea del fichero no
trackeado, más `git diff --stat` sin cambios adicionales en los ficheros sí
trackeados). `site.ts` y `datosEstructuradosNegocio.ts` (y sus tests) no se
tocaron en la Ronda 2: ya estaban al 100% en la Ronda 1 de este informe.

## Verificación de entorno antes de cada corrida

`Get-CimInstance Win32_Process -Filter "name='node.exe'"` filtrado por línea
de comandos que contenga `stryker` antes de cada una de las 3 corridas: sin
ningún proceso de Stryker vivo en ninguna de las 3 comprobaciones (solo
procesos ajenos del IDE — `codex-acp`/`acp-agents`, identificados por su
línea de comandos completa, sin relación con Stryker). Cada corrida se lanzó
en segundo plano y se esperó su finalización real (`Wait-Process` sobre el
PID exacto del proceso `stryker.js run` localizado tras el lanzamiento, no
un `sleep` a ciegas) antes de lanzar la siguiente — nunca dos corridas vivas
a la vez. `--concurrency 1` ya fijado en `stryker.config.json`. Ningún
fichero de `src/` ni de test fue editado durante esta medición.

## Cómo se corrió (3 corridas independientes, secuenciales, nunca en paralelo)

    pnpm exec stryker run --mutate src/lib/seo-logica.ts --plugins @stryker-mutator/vitest-runner
    pnpm exec stryker run --mutate src/lib/site.ts --plugins @stryker-mutator/vitest-runner
    pnpm exec stryker run --mutate src/lib/datosEstructuradosNegocio.ts --plugins @stryker-mutator/vitest-runner

Duración: `seo-logica.ts` 7 min 57 s (101 mutantes, 172 tests en la corrida
inicial, 6.93 tests/mutante de media); `site.ts` 8 min 45 s (38 mutantes, 148
tests en la corrida inicial, 16.47 tests/mutante de media);
`datosEstructuradosNegocio.ts` 2 min 8 s (1 mutante, 148 tests en la corrida
inicial, 1.00 tests/mutante). Columna "# timeout" leída ANTES que el score en
las 3 corridas: 0/0, 0/0, 0/0 — los 3 informes son de fiar tal cual, sin
necesidad de repetir ninguna corrida.

## Resultado por fichero

| Fichero | total | killed | survived | # timeout | # no cov | # errors | score |
| --- | --- | --- | --- | --- | --- | --- | --- |
| src/lib/seo-logica.ts | 101 | 101 | 0 | 0 | 0 | 0 | 100.00% |
| src/lib/site.ts | 38 | 38 | 0 | 0 | 0 | 0 | 100.00% |
| src/lib/datosEstructuradosNegocio.ts | 1 | 1 | 0 | 0 | 0 | 0 | 100.00% |
| **Total feature** | **140** | **140** | **0** | **0** | **0** | **0** | **100.00%** |

## Mutantes supervivientes

Ninguno. Los 7 no matados de la Ronda 1 (Grupo A: `seo-logica.ts:157`
`ConditionalExpression`+`BlockStatement`, 2 mutantes; Grupo B:
`seo-logica.ts:189` `ConditionalExpression`, 1 mutante; Grupo C:
`seo-logica.ts:190` `ConditionalExpression`×2 + `ObjectLiteral` +
`ArrayDeclaration`, 4 mutantes) aparecen ahora como `killed` en el reporte de
Stryker de esta ronda, exactamente los matados por los 3 tests nuevos
descritos en `progress/tdd_seo_estructura.md` (confirmado por el listado
`All tests` de la corrida: `@s14 refuerzo mutación: …` con 2 kills, `@s16
refuerzo mutación: sin email, …` con 3 kills, `@s16 refuerzo mutación: con
redes sociales presentes, …` con 4 kills — 9 kills entre los 3 tests nuevos,
más que los 7 mutantes que motivaron su escritura, coherente con que cada
test puede matar mutantes adicionales de la misma línea no desglosados
individualmente en la Ronda 1).

## Mutantes equivalentes excluidos

Ninguno. Score real 140/140 = 100.00% sin necesidad de exclusión.

## Conclusión

PASS. Score de la feature: 140/140 = 100.00%, igual al umbral de
`harness.config.json` → `mutation.threshold` (1.0 / 100%;
`stryker.config.json` → `thresholds.break` = 100). 0 timeouts en las 3
corridas, resultado de fiar. El refuerzo de `tdd_craftsman` (Ronda 2) cerró
íntegramente los 7 huecos reportados en la Ronda 1 de este informe, sin
tocar producción. No quedan mutantes supervivientes ni no cubiertos en
ninguno de los 3 ficheros del alcance de esta feature.

No he tocado ningún fichero de `src/` ni de test durante esta medición
(regla dura de este rol: mide, no talla).
