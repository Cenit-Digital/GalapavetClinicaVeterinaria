# Mutación — feature 39, ronda 3

> `mutation_tester`, 21/09/2026. Tercera ronda **por un error de alcance del
> encargo**, no por una regresión del código. Las rondas 1 y 2 midieron TRES
> módulos porque el encargo del `craftsman_lead` decía «los tres módulos de
> lógica que esta feature toca». El `judge` de la ronda 3
> (`progress/judge_39_ronda3.md` §4.1) lo cazó: la superficie mutable declarada
> en `stryker.config.json` es `src/lib/**/*.ts` + `src/**/*-logica.ts`, y la
> feature toca **CINCO** ficheros dentro de ella. Este informe mide los **dos
> que faltaban**.

**Veredicto:** PASS
**Score bruto:** killed/total = 485/487 = **99,59 %**
**Score sobre mutantes NO equivalentes:** 485/485 = **100 %** (umbral: 100 %)

---

## 1. Primero la columna que manda: `# timeout`

Regla de `feature_list.json` -> `rules.notas` («antes de leer el mutation score
se lee la columna `# timeout`; si no es 0, el informe no vale: repetir a
`--concurrency 1`»), aplicada antes que nada:

**`# timeout` = 0 en los dos ficheros y en la fila `All files`.**
El informe es **válido**. La corrida fue a `concurrency: 1` (valor fijado en
`stryker.config.json`, no por bandera).

Verificado **sobre el JSON**, no solo sobre la tabla de texto: el reparto de
estados de los 487 mutantes es **exactamente** `{ Killed: 485, Survived: 2 }`.
Cero `Timeout`, cero `NoCoverage`, cero `RuntimeError`, cero `CompileError`,
cero `Ignored`. No hay ninguna categoría escondida inflando el score.

### 1bis. Hubo una primera corrida y se DESCARTÓ. Se dice.

La corrida de las 07:49 llegó a `234/487 tested (2 survived, 1 timed out)` y se
**abortó y descartó**, sin leerle el score, por la regla de arriba. Causa
diagnosticada: la máquina quedó **suspendida durante horas** en mitad de la
corrida (arrancó a las 07:49 y a las 20:29 seguía en el mutante 234, con el
contador de Stryker marcando «elapsed ~12 h 39 m, remaining ~161 h»). Un
`timeoutMS: 60000` no sobrevive a una suspensión: ese timeout era un artefacto
del reloj, no un mutante lento. Log conservado en el scratchpad de la sesión
como `stryker_r3_CONTAMINADA.log`. **Ese informe no existe; el que cuenta es el
de las 20:30.**

---

## 2. Línea base de la suite, antes de mutar

`pnpm run test` -> **88 ficheros · 1422 tests · 1422 pasan**, exit 0, 216,10 s,
medido a las 20:54 del 21/09/2026, con las fuentes intactas. Coincide
**exactamente** con la referencia del encargo y con la del `judge`. Se volvió a
medir en vez de heredarla porque entre el encargo y esta corrida pasaron ~13 h
de reloj.

`Initial test run succeeded` de la propia corrida: **80 tests, 0 fallos**
(sobre por qué son 80 y no 1422, ver §8 — no es un defecto, pero tampoco se
oculta).

---

## 3. La tabla por fichero

Salida literal de `clear-text`. Corrida de **20:30:35 -> 20:50:02**, «Done in 19
minutes and 23 seconds», 7,80 tests por mutante de media:

| File                     | % score total | % covered | # killed | # timeout | # survived | # no cov | # errors |
| ------------------------ | ------------- | --------- | -------- | --------- | ---------- | -------- | -------- |
| **All files**            | **99.59**     | 99.59     | **485**  | **0**     | **2**      | 0        | 0        |
| · `datosDelSitio.ts`     | **100.00**    | 100.00    | **172**  | **0**     | **0**      | 0        | 0        |
| · `matrizDeContraste.ts` | 99.37         | 99.37     | 313      | **0**     | **2**      | 0        | 0        |

Denominador: **487 mutantes** (172 + 315). Acotado confirmado por la propia
herramienta: `Found 2 of 1136 file(s) to be mutated` ->
`Instrumented 2 source file(s) with 487 mutant(s)`.

Sobre las estimaciones del `judge` (§4.1: 174 y 307): `datosDelSitio.ts` sale
**172** (la feature borró dos constantes, que es justo el delta) y
`matrizDeContraste.ts` sale **315**, ocho más que el 307 de
`mutation_rediseno_visual.md` — ese fichero ha recibido trabajo de otras
features desde aquel informe. Diferencias menores y en la dirección esperable;
ninguna esconde mutantes sin medir.

---

## 4. Mutantes supervivientes

**Son 2, los dos en `matrizDeContraste.ts`, y los dos son EQUIVALENTES ya
catalogados.** Ninguno es un hueco de test nuevo.

### 4.1 `src/lib/diseno/matrizDeContraste.ts:44:12` — mutador `Regex`

```
-     return /:root(?!\[)\s*/
+     return /:root(?!\[)\S*/
```

**En qué consiste:** el cuantificador de cero-o-más ESPACIOS del final del
patrón de encabezado del tema por defecto pasa a cero-o-más caracteres
NO-espacio.

**Equivalente. Ya justificado** en `progress/mutation_rediseno_visual.md`
**§4.6 (a)**, donde figuraba como `matrizDeContraste.ts:40:12` con esta misma
descripción.

**Razón, recomprobada sobre el código de hoy:** en
`extraerBloqueDeTemaDelPrototipo` solo se lee `encabezado.index`
(`matrizDeContraste.ts:62`); el texto capturado por la coincidencia entera
—incluida la cola del cuantificador— **nunca se usa**. Ambos cuantificadores
pueden casar cero caracteres, así que ninguno desplaza el punto de **inicio**
de la coincidencia. No hay comportamiento observable que los distinga.

**Qué test falta para matarlo:** ninguno. **No existe test que pueda matarlo.**

### 4.2 `src/lib/diseno/matrizDeContraste.ts:58:22` — mutador `ConditionalExpression`

```
-     if (!encabezado || encabezado.index === undefined) {
+     if (!encabezado || false) {
```

**En qué consiste:** la segunda mitad de la guarda de fallo ruidoso del lector
del prototipo se sustituye por la constante `false`.

**Equivalente. Ya justificado** en `progress/mutation_rediseno_visual.md`
**§4.6 (b)**, donde figuraba como `matrizDeContraste.ts:54:22`, con el mismo
argumento que `tokensColor.ts:125:34` (§4.4a de ese informe):
`patronDeEncabezadoDeTema` **no lleva la bandera `g`**, así que por
especificación de `String.prototype.match`, si `encabezado` es verdadero su
`index` **nunca** es `undefined`. La rama mutada es inalcanzable.

**Qué test falta para matarlo:** ninguno. **No existe test que pueda matarlo.**

### 4.3 Por qué los números de línea no coinciden con el catálogo

El catálogo los fija en `:40:12` y `:54:22`; hoy salen en `:44:12` y `:58:22`.
**Desplazamiento de +4 líneas, no mutantes distintos**: esta misma feature 39
amplió el comentario de cabecera del fichero (`matrizDeContraste.ts:1-16`, que
ahora explica la retirada de la cartelería de urgencias del 20/09/2026), y ese
bloque está **por encima** de las dos líneas. El texto mutado, el mutador y la
sustitución son **idénticos** a los catalogados. El borrado de las dos filas de
la matriz (línea 345 y siguientes) queda **por debajo** y no afecta a estas
coordenadas.

---

## 5. Lo que el encargo mandaba mirar de frente: la vacuidad de `.every()`

**Sospecha del encargo, textual:** «`.every()` sobre una lista vacía devuelve
`true`, y esta misma feature dejó esa lista VACÍA en las seis rutas. Es
exactamente la familia de mutante que sobrevive escondido detrás de un conjunto
vacío».

**La sospecha era razonable y la medición la REFUTA.** `datosDelSitio.ts` cierra
a **172/172 = 100,00 %**, sin un solo superviviente. Los **cinco** mutantes que
Stryker genera sobre la línea del `.every()` (`datosDelSitio.ts:437`) están
**todos muertos**:

| Mutador                 | Sustitución                               | Estado     |
| ----------------------- | ----------------------------------------- | ---------- |
| `MethodExpression`      | `.every(...)` -> `.some(...)`             | **Killed** |
| `ArrowFunction`         | callback -> `() => undefined`             | **Killed** |
| `ConditionalExpression` | callback -> `true`                        | **Killed** |
| `ConditionalExpression` | callback -> `false`                       | **Killed** |
| `EqualityOperator`      | `compromiso ===` -> `compromiso !==`      | **Killed** |

**Quién los mata, y por qué la vacuidad no cuela:** `datosDelSitio.test.ts` no
se queda en el caso de lista vacía. Ejercita también listas **NO vacías**
(`:504-510` con `['permanentes']`, y `:512-527` con
`['fuera de horario', '24 h']` y con `['todos los días del año',
'todos los días']`), que es lo que obliga a **invocar el callback** y deja al
descubierto los mutantes que se esconderían tras el conjunto vacío. El caso
vacío (`:541-553`, que exige `pasa === true`) es además el que mata al mutante
`some`, porque sobre lista vacía `some` devuelve `false` donde `every` devuelve
`true`.

**Y las guardas de fallo cerrado de los INSUMOS siguen mordiendo.** Los ocho
mutantes de las dos guardas de la cabecera de la función están **todos
muertos**:

| Línea                                              | Mutantes                                         | Estado         |
| -------------------------------------------------- | ------------------------------------------------ | -------------- |
| `:413` `textos.length === COLECCION_VACIA`         | `true`, `false`, `!==`, cuerpo del `if` -> `{}`   | **4/4 Killed** |
| `:422` `cualificadores.length === COLECCION_VACIA` | `true`, `false`, `!==`, cuerpo del `if` -> `{}`   | **4/4 Killed** |

Es decir: la puerta @s52 **no está aprobando por vacuidad**. Sigue
distinguiendo «no hay ninguno» de «no se ha buscado», y los tests lo demuestran
por valor, no por lectura.

---

## 6. El umbral, y por qué esto es PASS

`stryker.config.json` fija `break = 100`, así que Stryker **salió con código 1**
contando los dos equivalentes. `docs/mutation-testing.md` y
`harness.config.json` (`mutation.threshold = 1.0`) exigen el umbral **sobre los
mutantes no equivalentes**, permitiendo excluir los equivalentes con
justificación escrita — y estos dos **ya venían justificados** de
`mutation_rediseno_visual.md` §4.6, no se inventan aquí.

**485/485 no equivalentes muertos = 100 % = umbral. PASS.**

El código 1 seguirá apareciendo en CI mientras esos dos equivalentes sigan
vivos. Es una decisión abierta del orquestador, no de este informe.

---

## 7. Alcance: ¿son cinco, o hay más?

El encargo pedía avisar si aparecían **más** ficheros mutables tocados de los
cinco. **Se comprobó y son exactamente cinco. La lista del encargo, esta vez,
es correcta.**

Método: `git diff --name-only` + `git diff --cached --name-only` + los no
seguidos (`git status --porcelain`), cruzados contra los globs de
`stryker.config.json` (`src/lib/**/*.ts`, `src/**/*-logica.ts`, menos
`*.test.ts` y `*.test.tsx`):

| Fichero tocado por la feature 39          | ¿En la superficie mutable? | ¿Medido? |
| ----------------------------------------- | -------------------------- | -------- |
| `src/components/Cabecera-logica.ts`       | sí                         | ronda 2  |
| `src/components/PieDePagina-logica.ts`    | sí                         | ronda 2  |
| `src/lib/accesibilidad-movimiento.ts`     | sí                         | ronda 2  |
| **`src/lib/diseno/datosDelSitio.ts`**     | **sí**                     | **AQUÍ** |
| **`src/lib/diseno/matrizDeContraste.ts`** | **sí**                     | **AQUÍ** |

Ni un sexto. Los demás ficheros tocados son `.tsx`, `.scss`, `.feature`, `.md`,
tests (`*.test.ts(x)`) y specs de Playwright (`tests/e2e/**`), todos fuera de
los globs. **No hay ningún fichero nuevo sin seguir dentro de `src/`.**

Con la ronda 2, el estado consolidado de la feature 39 es:

| Fichero                       | Total   | Killed  | Survived | Equivalentes  | No equiv.           |
| ----------------------------- | ------- | ------- | -------- | ------------- | ------------------- |
| `Cabecera-logica.ts`          | 31      | 30      | 1        | 1 (`esMovil`) | 30/30               |
| `PieDePagina-logica.ts`       | 14      | 14      | 0        | 0             | 14/14               |
| `accesibilidad-movimiento.ts` | 50      | 50      | 0        | 0             | 50/50               |
| `datosDelSitio.ts`            | 172     | 172     | 0        | 0             | 172/172             |
| `matrizDeContraste.ts`        | 315     | 313     | 2        | 2 (§4.1-4.2)  | 313/313             |
| **TOTAL feature 39**          | **582** | **579** | **3**    | **3**         | **579/579 = 100 %** |

Los tres supervivientes de la feature son **los tres equivalentes**, cada uno
con justificación escrita y previa. **Cero huecos de test.**

El superviviente de `Cabecera-logica.ts:19` (`esMovil`) **no se re-litiga**
aquí: está catalogado desde la feature 3 y decidido en
`progress/decision_mutante_esmovil_20260920.md`. Queda fuera del alcance de esta
ronda y se cita solo para cuadrar el total.

---

## 8. Honestidad sobre el método: qué tests pudieron matar

Dato que **no** aparecía en los informes de rondas anteriores y conviene fijar:
`@stryker-mutator/vitest-runner` v10 trae `vitest.related` con **`default: true`**
(verificado en `dist/schema/vitest-runner-options.json:18-22` del paquete
instalado). Eso significa que la corrida **no enfrenta los mutantes a los 1422
tests de la suite**, sino solo a los ficheros de test que Vitest considera
relacionados con los módulos mutados. En esta corrida participaron **3**:
`datosDelSitio.test.ts`, `matrizDeContraste.test.ts` y `Hero-logica.test.ts`
(80 tests).

**Dirección del sesgo, dicha claramente:** restringir el conjunto de verdugos
solo puede producir **más** supervivientes, nunca muertes falsas. Un 100 %
medido así es un resultado **más fuerte**, no más débil. Y para los dos
supervivientes da igual: son equivalentes, no los mata ningún test de ninguna
suite. Por tanto el veredicto no cambia — pero la frase «la suite de 1422 tests
mató estos mutantes» sería **falsa** y no se escribe.

---

## 9. Integridad de la corrida

- **Una sola corrida a la vez.** Antes de arrancar se verificó que no quedaba
  ningún proceso de `stryker`/`vitest` vivo. La primera corrida se encontró el
  repo ocupado por un `bin/harness init` ajeno (pid 56932, con su `vitest`
  hijo) y **se esperó a que terminara** (230 s) antes de lanzar nada. La corrida
  contaminada se mató por completo (3 procesos) y se confirmó que no quedaba
  ninguno vivo antes de relanzar.
- **Fuentes intactas:** `datosDelSitio.ts` (mtime 00:49:50) y
  `matrizDeContraste.ts` (mtime 00:34:47) conservan marca de tiempo **anterior**
  a la ventana de corrida (20:30-20:50) y no contienen ningún residuo
  `Stryker was here!`. Stryker muta en sandbox, no in situ. Las marcas `M` de
  `git status` sobre ellos son trabajo previo de la feature, no de esta medición.
- **Informe de la ronda 2 conservado** (copia del `mutation.json`, 628 770 B)
  antes de que Stryker sobrescribiera `reports/mutation/mutation.json`.
- **Ni `src/` ni los tests se han tocado.** Este informe mide; no talla.

---

## 10. Lo que este informe NO cubre

- **La puerta global del proyecto sigue sin medirse**: 50 ficheros y ~3229
  mutantes con `break = 100`. Una corrida completa a `concurrency: 1` se estimó
  en ~8 h 14 min en la ronda 1. Si el orquestador la necesita en verde, hace
  falta una corrida desatendida — y, visto lo de hoy, **con la máquina
  configurada para no suspenderse**.
- **Deuda de limpieza heredada (no bloqueante):** `.stryker-tmp/` sigue
  acumulando sandboxes de corridas interrumpidas pese a `cleanTempDir: true`.
  Conviene barrerlo.

---

## 11. Qué le toca ahora al `tdd_craftsman`

**Nada de esta ronda.** No hay ni un solo mutante superviviente que necesite un
test: los 3 de la feature son equivalentes con justificación previa. No se ha
escrito ningún test aquí, como manda el protocolo.

Lo que sí queda abierto, y es del `craftsman_lead`, no de esta medición: los
avisos de calidad que el `judge` dejó en `judge_39_ronda3.md` (la errata
«cartelíería» en `matrizDeContraste.ts:9`, dentro del mismo comentario de
cabecera que desplazó estas dos líneas, y el resto de notas caducadas).
