# Decisión del craftsman_lead — el superviviente de `esMovil` (feature 39)

**Veredicto: mutante EQUIVALENTE, excluido del cómputo. No se toca el código.**

## Qué pasó

La oleada 1 de la feature 39 corrió una mutación dirigida a
`src/components/Cabecera-logica.ts` y reportó **30 muertos, 1 superviviente,
96,77 %** contra un `break = 100`. El superviviente es un `EqualityOperator` en
`esMovil` (línea 18): `!(anchoVentana > 0)` → `!(anchoVentana >= 0)`.

El artesano lo declaró como equivalente y preexistente en vez de disimularlo, y
dejó la decisión al orquestador. Correcto: no era suya.

## Verificación, hecha de nuevo aquí y no heredada

Las dos guardas solo pueden diferir cuando `x > 0` ≠ `x >= 0`, es decir
**únicamente en `x === 0`**. Y ahí:

| | rama temprana | valor devuelto |
| --- | --- | --- |
| Original | `!(0 > 0)` = `true` → entra | **true** |
| Mutante | `!(0 >= 0)` = `false` → NO entra, cae a `return 0 < 1024` | **true** |

Los dos devuelven `true`. Para `x > 0`, `x < 0` y `NaN` las dos versiones toman
exactamente el mismo camino. **Ningún test puede matarlo**: no existe entrada que
distinga las dos versiones.

## Precedente: no es nuevo, ya estaba catalogado

`progress/mutation_cabecera_y_navegacion.md` documenta **este mismo mutante**
—misma línea, mismo mutador, mismo diff— verificado de forma exhaustiva sobre el
dominio completo de `number` en la ronda 1 de la feature 3, arrastrado sin
re-derivar a la ronda 2, y con la feature cerrada `done` sobre esa base. Su
propia conclusión: «el único superviviente es el mutante equivalente ya
verificado exhaustivamente… Excluido del cómputo de huecos reales, conforme a
`docs/mutation-testing.md`».

La feature 39 **no lo introduce**: su diff sobre ese fichero es una eliminación
pura (`construirControlDeUrgencias` y sus dos interfaces) y `esMovil` queda byte
a byte igual. Los cuatro tests retirados no la ejercitaban.

## Convención del repositorio que aplica

El umbral de `harness.config.json` (`mutation.threshold = 1.0`) se exige **sobre
los mutantes NO equivalentes**, y todo equivalente se excluye **solo con
justificación explícita**. Hay al menos tres precedentes escritos:
`mutation_cabecera_y_navegacion.md` (este mismo), `mutation_accesibilidad.md`
(`contraste.ts:36`, verificado sobre los 256 valores del dominio) y
`mutation_datos_negocio.md` (`telefono.ts:13`).

## Instrucción para el `mutation_tester` de esta feature

Si aparece en la corrida final, **no lo cuentes como hueco y no pidas un test
para él**: no existe. Repórtalo en la sección de equivalentes excluidos citando
este documento y el precedente de la feature 3. El score que vale es el de
mutantes no equivalentes, y ese sí tiene que dar 100 %.
