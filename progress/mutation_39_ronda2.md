# Mutación — feature 39, ronda 2

> `mutation_tester`, 21/09/2026. Re-medición exigida porque desde la ronda 1
> (`progress/mutation_39.md`) entraron **99 líneas de lógica pura nueva** en
> `src/lib/accesibilidad-movimiento.ts`, que `stryker.config.json` muta con
> `break = 100` y que la ronda 1 **no midió** (su corrida solo abarcaba los dos
> módulos `*-logica.ts`).

**Veredicto:** PASS
**Score bruto:** killed/total = 94/95 = **98,95 %**
**Score sobre mutantes NO equivalentes:** 94/94 = **100 %** (umbral: 100 %)

---

## 1. Primero la columna que manda: `# timeout`

Regla de `feature_list.json` -> `rules.notas` («antes de leer el mutation
score se lee la columna `# timeout`; si no es 0, el informe no vale»), aplicada
antes que nada:

**`# timeout` = 0 en los tres ficheros y en la fila `All files`.**
El informe es **válido** y no hay que repetir. La corrida fue a
`concurrency: 1` (valor fijado en `stryker.config.json`, no por bandera).

Verificado además sobre el JSON, no solo sobre la tabla de texto: el reparto de
estados de los 95 mutantes es **exactamente** `{ Killed: 94, Survived: 1 }`.
Cero `Timeout`, cero `NoCoverage`, cero `RuntimeError`, cero
`CompileError`, cero `Ignored`. No hay ninguna categoría escondida
inflando el score.

**Higiene previa:** se comprobó que no quedara ningún proceso de stryker/vitest
vivo antes de arrancar (regla «jamás dos corridas a la vez»). Solo había shells
propios.

---

## 2. Línea base de la suite, antes de mutar

`pnpm run test` -> **88 ficheros · 1422 tests · 1422 pasan**, exit 0, 245,67 s.
Coincide exactamente con la referencia del encargo. Una suite roja habría
invalidado la medición entera.

---

## 3. La tabla por fichero

Salida literal de `clear-text`. Corrida terminada en **6 min 47 s**, 12,66
tests por mutante de media:

| File                              | % score total | % covered | # killed | # timeout | # survived | # no cov | # errors |
| --------------------------------- | ------------- | --------- | -------- | --------- | ---------- | -------- | -------- |
| **All files**                     | **98.95**     | 98.95     | **94**   | **0**     | **1**      | 0        | 0        |
| components                        | 97.78         | 97.78     | 44       | 0         | 1          | 0        | 0        |
| · Cabecera-logica.ts              | 96.77         | 96.77     | 30       | 0         | 1          | 0        | 0        |
| · PieDePagina-logica.ts           | 100.00        | 100.00    | 14       | 0         | 0          | 0        | 0        |
| lib                               | 100.00        | 100.00    | 50       | 0         | 0          | 0        | 0        |
| · **accesibilidad-movimiento.ts** | **100.00**    | 100.00    | **50**   | **0**     | **0**      | 0        | 0        |

Denominador: **95 mutantes** (31 + 14 + 50). La ronda 1 medía 45; los **50
nuevos** son íntegramente de la lógica nueva de `accesibilidad-movimiento.ts`.
Los otros dos módulos dan el mismo resultado que en la ronda 1 (31 y 14), lo que
confirma que no se movieron.

---

## 4. La lógica nueva: la palabra del artesano, comprobada

`progress/tdd_39_oleada5_movimiento.md` §3 afirmaba 26 mutantes a mano, 26
muertos. **Comprobado con Stryker de verdad: 50 mutantes, 50 muertos, 100 %.**

Stryker generó casi el doble de mutantes que la perturbación manual y ninguno
sobrevivió. Reparto por mutador en ese fichero:

| Mutador               | #   | Mutador             | #   |
| --------------------- | --- | ------------------- | --- |
| StringLiteral         | 11  | ObjectLiteral       | 4   |
| ArrowFunction         | 7   | EqualityOperator    | 4   |
| BlockStatement        | 6   | ArrayDeclaration    | 2   |
| MethodExpression      | 6   | BooleanLiteral      | 2   |
| ConditionalExpression | 6   | ArithmeticOperator  | 1   |
|                       |     | LogicalOperator     | 1   |

Los tres puntos que el artesano señaló como los que miraría primero salen
muertos, y con ellos su razonamiento queda sostenido por la máquina:

- **Los literales de cadena** (`':'`, `';'`, `' '`, `''`): los
  `StringLiteral` sobre las constantes de las líneas 66, 77 y 79-83 mueren,
  incluido `SIN_ESPACIO -> "Stryker was here!"` (L83).
- **`BooleanLiteral` sobre `!declaraUnEstadoBaseOculto(hoja)`** (L107): muerto.
- **El `.trim()` de `declaracionNormalizadaEn`** (L90,
  `MethodExpression -> linea`): **muerto**. Es la confirmación independiente de
  lo que más pesaba de su relato: ese mutante sobrevivió en su primera pasada y
  lo cerró con el `it` de finales de línea CRLF, razonando sobre
  `core.autocrlf = true`, **en vez de borrar la línea**. La máquina confirma que
  la decisión fue la correcta: el `.trim()` es carga útil y ahora está mordido.

También mueren los dos `some -> every` (L95, L101), el
`startsWith -> endsWith` (L96) y el `indice + PRIMERA_LINEA`
(ArithmeticOperator). **No hay ningún test que pedir en este módulo.**

---

## 5. Mutantes supervivientes

Uno solo en los tres ficheros, y es el **equivalente ya catalogado**. No hay
ningún hueco real de test en la feature 39.

### 5.1 `src/components/Cabecera-logica.ts:19:9` — EqualityOperator — EXCLUIDO por equivalente

```
-     if (!(anchoVentana > 0)) {
+     if (!(anchoVentana >= 0)) {
```

- **Estado:** Survived. Cubierto y ejercitado (132 tests lo recorren); ninguno
  puede fallar.
- **Qué test falta para matarlo: NINGUNO. No existe.**
  **No se pide nada al `tdd_craftsman` por este mutante.**

**Justificación de la exclusión** (exigida por `docs/mutation-testing.md`): las
dos guardas solo pueden diferir donde `x > 0` es distinto de `x >= 0`, es
decir únicamente en `x === 0`, y ahí ambas devuelven `true` (original:
`!(0 > 0)` = `true` -> entra y devuelve `true`; mutante:
`!(0 >= 0)` = `false` -> cae a `return 0 < 1024` = `true`). Para
`x > 0`, `x < 0` y `NaN` ambas versiones recorren el mismo camino.

**Decisión firme, no re-litigada aquí.** Está verificada dos veces
—analíticamente y empíricamente sobre 20.001 valores más `NaN`,
`±Infinity` y los extremos, con **0 casos de diferencia observable**— y
documentada en:

1. `progress/decision_mutante_esmovil_20260920.md` — decisión del
   `craftsman_lead`: mutante equivalente, excluido del cómputo, no se toca el
   código.
2. `progress/mutation_cabecera_y_navegacion.md` — precedente: **mismo fichero,
   misma línea, mismo mutador**, catalogado desde la feature 3 y con aquella
   feature cerrada `done` sobre esa base.

La feature 39 no lo introduce: su diff sobre ese fichero es una eliminación pura
y `esMovil` queda byte a byte igual. La equivalencia depende de que
`PUNTO_DE_CORTE_NAVEGACION_PX` sea > 0 (vale 1024); si algún día valiera 0,
habría que reevaluarlo.

---

## 6. Por qué PASS con Stryker saliendo en código 1

Stryker terminó con `Final mutation score 98.95 under breaking threshold 100,
setting exit code to 1`. **Stryker no sabe distinguir un mutante equivalente:**
cuenta el superviviente y rompe. `docs/mutation-testing.md` y
`harness.config.json` (`mutation.threshold = 1.0`) exigen el umbral **sobre
los mutantes no equivalentes**, permitiendo excluir los equivalentes con
justificación escrita — vía con precedentes en
`mutation_cabecera_y_navegacion.md`, `mutation_accesibilidad.md`
(`contraste.ts:36`) y `mutation_datos_negocio.md` (`telefono.ts:13`).

Sobre esa base: **94/94 no equivalentes muertos = 100 % = umbral. PASS.**

El código 1 seguirá apareciendo en CI mientras el mutante siga vivo. Es una
decisión abierta del orquestador, no de este informe.

---

## 7. Alcance medido y lo que NO se midió

CORRECCIÓN (21/09/2026, judge ronda 3): la frase de abajo **era FALSA** y es la que
impidió preguntarse por los dos módulos que faltaban. La feature 39 toca **CINCO**
ficheros de la superficie mutable declarada (`src/lib/**/*.ts` + `src/**/*-logica.ts`),
no tres: además de los tres medidos aquí, `src/lib/diseno/datosDelSitio.ts` (donde
cambia una decisión booleana pura a un `.every()` sobre una lista que esta misma
feature dejó VACÍA en las seis rutas) y `src/lib/diseno/matrizDeContraste.ts`. El
error vino del encargo del `craftsman_lead`, que listó tres. Medición de los dos que
faltaban: `progress/mutation_39_ronda3.md`.

La corrida se acotó a los tres módulos que el encargo de la ronda 2 nombraba, que la feature 39
toca, con
`--mutate "src/components/Cabecera-logica.ts,src/components/PieDePagina-logica.ts,src/lib/accesibilidad-movimiento.ts"`.
Stryker confirmó el acotado: `Found 3 of 1134 file(s) to be mutated` ->
`Instrumented 3 source file(s) with 95 mutant(s)`.

**Por qué, dicho explícitamente:** una corrida completa no es viable. El
`mutation_tester` de la ronda 1 la arrancó y Stryker instrumentó **50 ficheros
y 3229 mutantes** con un **ETA de ~8 h 14 min a `concurrency: 1`**; la detuvo y
la acotó. Es lo que el protocolo del `mutation_tester` manda («los archivos de
`src/` tocados por la feature en curso») y lo que este repositorio viene
haciendo. Aquí se ha hecho lo mismo, y se dice.

**Nota sobre el arnés:** `bin/harness mutate <fichero>` **no** habría acotado
nada. `harness.config.json` declara `"mutate": "pnpm exec stryker run"`
sin el token `{{target}}`, y el propio `.harness/harness.mjs` lo documenta
(línea 522: mutadores que «corren todo el proyecto, p. ej. Stryker, que no usan
el token `{{target}}`»). Pasarle un target habría lanzado en silencio la
corrida completa de ~8 h. Por eso se invocó el comando declarado con la bandera
de acotado, igual que la ronda 1.

**Lo que este informe NO cubre:** la puerta global del proyecto (50 ficheros,
3229 mutantes, `break = 100`) **sigue sin medirse**. Si el orquestador la
necesita en verde, hace falta una corrida completa de ~8 h, preferiblemente
desatendida.

---

## 8. Integridad de la corrida

- **Fuentes intactas:** los tres módulos conservan `mtime` **anterior** a la
  corrida (22:19, 23:36 y 03:36 frente a la ventana 04:29-04:35) y no contienen
  ningún residuo `Stryker was here!`. Stryker muta en sandbox, no in situ. Los
  `M` de `git status` sobre ellos son trabajo previo de la feature, no de
  esta medición.
- **Informe de la ronda 1 conservado** antes de que Stryker sobrescribiera
  `reports/mutation/mutation.json`.
- **Deuda menor de limpieza (no bloqueante, ajena a esta medición):**
  `.stryker-tmp/` acumula **29 sandboxes** de agosto y septiembre pese a
  `cleanTempDir: true`, restos de corridas anteriores interrumpidas. Conviene
  barrerlo.
