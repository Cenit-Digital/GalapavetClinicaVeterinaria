# Mutación — feature 39

> `mutation_tester`, 21/09/2026. Corrida sobre la superficie que la feature 39
> tocó: los dos módulos `*-logica.ts` de los que se retiraron funciones.

**Veredicto:** PASS
**Score bruto:** killed/total = 44/45 = **97,78 %**
**Score sobre mutantes NO equivalentes:** 44/44 = **100 %** (umbral: 100 %)

---

## 1. Primero la columna que manda: `# timeout`

La regla de `feature_list.json` → `rules.notas` («antes de leer el mutation
score se lee la columna `# timeout`; si no es 0, el informe no vale») se aplicó
antes que nada:

**`# timeout` = 0 en todos los ficheros y en la fila `All files`.**
El informe es válido y **no** hay que repetir nada. La corrida ya se hizo a
`concurrency: 1` (valor fijado en `stryker.config.json`, no por bandera).

Comprobación adicional de higiene: se verificó que no hubiera ninguna otra
corrida de Stryker viva sobre el repo antes de arrancar (regla «jamás dos
corridas a la vez»). Ver §5.

---

## 2. La tabla por fichero

Salida literal de `clear-text`, corrida terminada en 5 min 17 s,
21,84 tests por mutante de media:

| File                  | % score total | % covered | # killed | # timeout | # survived | # no cov | # errors |
| --------------------- | ------------- | --------- | -------- | --------- | ---------- | -------- | -------- |
| **All files**         | **97.78**     | 97.78     | **44**   | **0**     | **1**      | 0        | 0        |
| Cabecera-logica.ts    | 96.77         | 96.77     | 30       | 0         | 1          | 0        | 0        |
| PieDePagina-logica.ts | 100.00        | 100.00    | 14       | 0         | 0          | 0        | 0        |

Denominador nuevo tras las retiradas: **45 mutantes** (31 + 14). El informe
anterior del repo (`reports/mutation/mutation.json`, 20/09 23:52) contenía
**solo 14 mutantes de `PieDePagina-logica.ts`**: era una corrida dirigida, no
una línea base comparable. Se conservó copia antes de sobrescribirlo.

**Línea base de la suite antes de mutar:** verde. 88 ficheros · 1410 tests
pasando. Una suite roja habría invalidado la medición entera.

---

## 3. Mutantes supervivientes

Uno solo, y es **equivalente**. No hay ningún hueco real de test.

### 3.1 `src/components/Cabecera-logica.ts:19` — EqualityOperator — EXCLUIDO por equivalente

- **Mutación:** `anchoVentana > 0` → `anchoVentana >= 0`, dentro de la guarda
  `if (!(anchoVentana > 0))` de `esMovil`. Cubierto por 132 tests; ninguno
  puede fallar.
- **Qué test falta para matarlo: NINGUNO. No existe.** No se pide al
  `tdd_craftsman` que escriba nada para este mutante.

**Justificación de la exclusión** (exigida por `docs/mutation-testing.md`),
re-derivada aquí y **no heredada** del documento previo:

Las dos guardas solo pueden diferir donde `x > 0` ≠ `x >= 0`, es decir
**únicamente en `x === 0`**. Y ahí ambas devuelven lo mismo:

| Versión  | Guarda temprana                          | Valor devuelto |
| -------- | ---------------------------------------- | -------------- |
| Original | `!(0 > 0)` = `true` → entra              | **true**       |
| Mutante  | `!(0 >= 0)` = `false` → cae a `0 < 1024`  | **true**      |

Para `x > 0`, `x < 0` y `NaN` las dos versiones recorren el mismo camino.

**Verificación empírica ejecutada en esta sesión** (no solo razonada): se
compararon las dos versiones sobre 20 001 valores muestreados en `[-5000, 5000]`
a paso 0,5 más los especiales `0`, `-0`, `NaN`, `±Infinity`, `±MAX_VALUE`,
`±MIN_VALUE`, `EPSILON`. **Casos con diferencia observable: 0.**

La equivalencia depende de que `PUNTO_DE_CORTE_NAVEGACION_PX` sea > 0 (vale
1024). Si algún día ese punto de corte pasara a valer 0, el mutante dejaría de
ser equivalente y habría que volver a evaluarlo.

**La feature 39 no lo introduce.** `git diff HEAD -- Cabecera-logica.ts` es una
eliminación pura (31 líneas fuera, 0 dentro): `construirControlDeUrgencias`,
`TelefonoDeUrgencias` y `ControlDeUrgencias`. `esMovil` queda byte a byte igual.
Precedente ya catalogado: `progress/mutation_cabecera_y_navegacion.md` (mismo
fichero, misma línea, mismo mutador) y la decisión del orquestador en
`progress/decision_mutante_esmovil_20260920.md`.

### 3.2 `src/components/PieDePagina-logica.ts` — sin supervivientes

14/14 muertos. Las retiradas de `nombreEnlaceUrgencias` y `SEPARADOR_ROTULO`
dejaron el módulo con todas sus ramas mordidas. Su diff solo añade comentarios;
todo lo demás son bajas.

---

## 4. Por qué el veredicto es PASS con `stryker` saliendo en código 1

Stryker terminó con `ERROR ... Final mutation score 97.78 under breaking
threshold 100, setting exit code to 1`. **Stryker no sabe distinguir un mutante
equivalente**: cuenta el superviviente y rompe. La convención del repositorio y
`docs/mutation-testing.md` exigen el umbral **sobre los mutantes no
equivalentes**, permitiendo excluir los equivalentes con justificación escrita
—vía ya usada en `mutation_cabecera_y_navegacion.md`, `mutation_accesibilidad.md`
(`contraste.ts:36`) y `mutation_datos_negocio.md` (`telefono.ts:13`).

Sobre esa base: **44/44 no equivalentes muertos = 100 % = umbral. PASS.**

El código 1 de salida seguirá apareciendo en CI mientras el mutante siga vivo.
Eso es una decisión abierta del orquestador, no de este informe.

---

## 5. Alcance medido y lo que NO se midió (honestidad sobre la corrida)

Se arrancó primero `pnpm exec stryker run` **completo**, tal como pedía el
encargo. Stryker instrumentó **50 ficheros con 3229 mutantes** y, a
`concurrency: 1`, reportó un **ETA de ~8 h 14 min**. Se detuvo a los ~136
mutantes y se relanzó acotado a los dos módulos de la feature con
`--mutate "src/components/Cabecera-logica.ts,src/components/PieDePagina-logica.ts"`.

Motivo: el protocolo del `mutation_tester` mide «la puntuación de mutación **de
la feature**» sobre «los archivos de `src/` tocados por la feature en curso», y
es lo que el propio repo venía haciendo (el informe del 20/09 era dirigido). La
corrida completa se detuvo **antes** de lanzar la acotada, para no violar la
regla de «jamás dos corridas a la vez»; se verificó que quedaran 0 procesos de
stryker/vitest vivos.

**Consecuencia que hay que asumir y que este informe NO cubre:** la puerta
global del proyecto (50 ficheros, 3229 mutantes, `break = 100`) **no está
medida en esta sesión**. El tramo recorrido antes de parar ya acumulaba **1
superviviente** dentro de sus primeros ~136 mutantes, sin atribución de fichero
posible (el reporter de progreso no la da y, al no terminar, no se escribió
informe). No se puede afirmar que sea el de `esMovil` ni que sea otro. Si el
orquestador necesita la puerta global en verde, hace falta una corrida completa
de ~8 h, preferiblemente desatendida.
