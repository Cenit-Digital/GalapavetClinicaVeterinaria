# TDD — feature 48 `hero_reducido_con_animacion`, ola 1B: las puertas de movimiento

> `tdd_craftsman`, 14/10/2026. Contrato firmado por Pablo el 13/10/2026:
> `hero_reducido_con_animacion.feature` @s8 y @s10 (su parte pura),
> `identidad_visual.feature` @s16 y `accesibilidad.feature` @s20 (más lo que de
> @s19, @s21 y @s22 toca a esta puerta).
>
> **Estado: PARCIAL**, por tres cosas que se dicen en las secciones 7 y 8: las
> guardas «mayor que 0» sobre las 20 hojas REALES no pueden pasar hasta que la ola
> 2 escriba la animación (esta ola no toca SCSS); la excepción por etiqueta de la
> feature 49 no está implementada (no tiene fila en la tabla, sus specs no
> existen y el contrato no dice de dónde se lee la etiqueta); y el cableado del
> módulo de @s10 a `tests/e2e` es de la ola 2, como pidió el lead.
>
> **No he ejecutado Stryker** (regla de la ola). He escrito los tests pensando en
> la mutación y los he sometido a un SABOTAJE A MANO (sección 5), que NO es una
> prueba de mutación y no la sustituye.

---

## 0. Estado final, medido en esta máquina

| Puerta | Resultado |
| --- | --- |
| `pnpm run lint` (oxlint --deny-warnings) | **exit 0**, 0 errores y 0 avisos |
| `pnpm run typecheck` (tsc -b, incluye los tests) | **exit 0** |
| Vitest sobre MIS 6 ficheros de prueba | **306 tests, 306 pasan** (eran 44 en 4 ficheros: +262) |
| `pnpm test` completo | **89 ficheros · 1716 tests · 1716 pasan**, exit 0 (con el otro agente a medias en sus ficheros; en esta pasada no había rojos) |
| Playwright / `test:e2e` | NO ejecutado (regla de la ola) |
| Stryker | NO ejecutado (regla de la ola) |

Tests por fichero: `lectorDeEstilos.test.ts` 29 (nuevo) · `movimientoRespetuoso.test.ts`
43 (eran 9) · `escalaMovimiento.test.ts` 58 (eran 12) ·
`accesibilidad-movimiento.test.ts` 38 (eran 21) · `medicionEstable.test.ts` 135
(nuevo) · `movimiento-global.test.ts` 3 (eran 2).

**Una lección de la pasada completa:** la primera dio 1 rojo en
`puertaTelefonoHardcodeado.test.ts`, y era MÍO: un comentario de
`escalaMovimiento.ts` escribía `70.00000000000001`, una secuencia con forma de
teléfono español que esa puerta busca en todo `src/**/*.ts` no-test. Reescrito el
comentario, queda verde. La verificación conjunta final sigue siendo del
`craftsman_lead` (el otro agente edita `Hero.*`, `datosDelSitio.*` y `tests/e2e`).

## 1. Ficheros

**Nuevos** (ambos bajo la superficie de mutación `src/lib/**`):
`src/lib/diseno/lectorDeEstilos.ts` (+ `.test.ts`) y
`src/lib/diseno/medicionEstable.ts` (+ `.test.ts`).

**Reescritos o ampliados:** `src/lib/diseno/escalaMovimiento.ts` (+ test),
`src/lib/diseno/movimientoRespetuoso.ts` (+ test), `src/lib/accesibilidad-movimiento.ts`
(+ test), `src/styles/movimiento-global.test.ts`.

**No tocados:** ninguna hoja SCSS; `inventarioModulos.test.ts` (el glob de 17 y
sus recuentos se conservan tal cual: la puerta de 20 es una invocación PROPIA);
`features/`, `feature_list.json`, `progress/current.md`, `project-spec.md`. Los
ficheros del otro agente (`Hero*`, `Faq.test.tsx`, `datosDelSitio.*`, `tests/e2e/**`)
solo los he LEÍDO.

## 2. La decisión de diseño que ordena todo: UN lector de hojas compartido

La lectura línea a línea de la que partían las tres puertas tenía agujeros
MEDIDOS, no teóricos:

1. **Un bloque que abre y cierra en una línea** (`from { opacity: 0; }`) dejaba una
   llave abierta en la pila: una `animation` escrita DESPUÉS de un `@media
   (…no-preference)` se daba por cubierta. Reproducido con un test que estaba
   ROJO contra la puerta @s33 existente antes de tocar nada.
2. **Las interpolaciones `#{…}`** (hay 17 líneas en 9 hojas reales, p. ej. `Cabecera`,
   `Galeria`, `Hero`, `ReservaChat`, `SelectorPaleta`, `FormularioContacto`) apilaban
   un bloque que nadie desapilaba. Hoy no cambia ningún veredicto sobre las
   hojas reales (comprobado: las 17 y las 3 globales siguen pasando @s33), pero
   dejaba la pila desordenada.
3. **Una declaración repartida en varias líneas** solo se leía en la primera.
4. **Los comentarios** (`//` con `;` o `{`, `/* … */` de varias líneas) no se
   descartaban, y un comentario antes de un `@media` impedía reconocerlo.

`lectorDeEstilos.ts` recorre el texto carácter a carácter con una pila de
bloques y devuelve cada declaración con la lista de bloques que la contienen
(`no-preference`, `reduce`, `media-ajena`, `keyframes`, `regla`) y cada
`@keyframes` con la suya. Lo usan las cuatro puertas: @s33 (migrada, con el
agujero arreglado también para ella), @s8, @s16 y @s20. Un solo lector se
muerde una vez; tres lectores a medida se habrían mordido tres.

Una `//` solo abre un comentario al principio de la hoja o tras un blanco: la de
`url(http://…)` no lo es.

## 3. Trazabilidad `@s` → test (fichero · test; nunca números de línea)

### identidad_visual @s16 — `escalaMovimiento.test.ts`

| Cláusula del contrato | Test |
| --- | --- |
| Literal escrito a mano: duraciones 150/300/700, retardos 0/120/240, curva `ease-out` | «la escala contiene exactamente 150, 300 y 700 ms de duración, 0, 120 y 240 ms de retardo, y la curva es exactamente "ease-out"» |
| Recuento de ficheros exactamente 20 (3 + 12 + 5) | «el inventario son exactamente 20 ficheros: 3 de src/styles, 12 de src/components y 5 de src/pages» |
| Ninguna duración ni retardo fuera de escala sobre las 20 reales; fallo cerrado | «ninguna declaración de movimiento de los 20 ficheros reales usa una duración o un retardo fuera de la escala ni un valor no verificable» |
| Ninguna declaración anima `all` | «ninguna declaración real anima la palabra clave "all"» y el `describe` «ninguna declaración anima la palabra clave "all"» (8 casos) |
| La tabla de 30 filas | `describe` «(tabla de 30 filas del contrato)…» (`it.each` de 30 + el de «las 30 filas»); cada fila afirma el TIPO y el VALOR EXACTO del hallazgo (duración / retardo / no verificable), su ruta y su línea |
| Segundos, `.7s`, retardos, orden duración/retardo, varias líneas, listas, negativos | filas de la tabla + `describe` «la lectura de los tiempos, más allá de la tabla» |
| 0 ficheros no pasa | «con 0 ficheros la puerta falla cerrada, nunca "pasa" por vacuidad» |
| El caso que fijaba que `animation-delay` quedaba fuera se INVIERTE | «el caso que fijaba que un "animation-delay" quedaba fuera del análisis se INVIERTE…» |

### hero_reducido_con_animacion @s8 — `movimientoRespetuoso.test.ts`

| Cláusula | Test |
| --- | --- |
| La tabla de 22 filas (el contrato tiene 22, no 21) | `describe` «@s8 (tabla de 22 filas del contrato)…»; cada fila afirma veredicto, línea y propiedad señaladas, `ficherosLeidos`, `recuentoDeFotogramas` y `recuentoDeDeclaracionesDeEntradaEnNoPreference` |
| 20 ficheros leídos (3 + 12 + 5), ninguna hoja real incumple | «lee exactamente 20 ficheros (3 + 12 + 5) y ninguno declara entrada fuera de "no-preference" ni fotogramas fuera de sitio» |
| La regla global de `reduce` no se señala | la fila «"animation-duration: 0.01ms" y "animation-iteration-count: 1" dentro de "reduce", como la regla global» y el test de las 20 reales |
| Las guardas «> 0» NO se aplican al veredicto de cada hoja sintética | filas de la tabla con 0 `@keyframes` o 0 declaraciones que dan «pasa» |
| El agujero de la pila de llaves | fila «lo anterior, seguido de una "animation"… DESPUÉS del cierre de "no-preference", en la raíz»; en @s33: «un bloque que abre y cierra en la MISMA línea no deja una llave abierta…» y «una interpolación "#{…}" dentro de un valor no desordena la pila de bloques» |
| @s33 sigue ciego a la entrada dentro de `reduce` y @s8 no | `movimiento-global.test.ts`: «un mixin de ENTRADA escrito dentro de "reduce" en una hoja global pasa @s33 y lo señala la puerta de entrada de la feature 48 (@s8)» |
| 0 ficheros no pasa | «con 0 ficheros la puerta falla cerrada: no "pasa" por vacuidad» |

### accesibilidad @s20 (y @s19, @s21, @s22 en lo que toca a esta puerta) — `accesibilidad-movimiento.test.ts`

| Cláusula | Test |
| --- | --- |
| La tabla de 8 filas, con «bloques señalados como invisibles» | `describe` «@s20 (tabla de 8 filas del contrato)…»; cada fila afirma el veredicto de la puerta ENTERA (inventario + visibilidad) y el nº de invisibles |
| Lista de hojas autorizadas escrita a mano, solo la del hero | «la lista de hojas autorizadas a declarar una animación de entrada es exactamente la del hero (literal escrito a mano)» y «solo el fichero del hero está autorizado: otro con el mismo nombre en otra carpeta, o con el nombre como sufijo, no» |
| Cualquier otra hoja con animación pone la puerta en rojo | «una animación fuera de la hoja del hero se caza y nombra la hoja y la línea…» |
| `recuento > 0` «declarado por escrito» | «una hoja del hero sin ninguna animación NO pasa: el recuento "mayor que 0" se declara por escrito…» (sobre hoja SINTÉTICA) |
| Estado de partida (`@keyframes`) ≠ estado base invisible | «una opacidad 0 o una visibilidad oculta DENTRO de unos fotogramas no es un estado base…» |
| El caso escrito en UNA línea y repartido en varias | fila 5 de la tabla; «una opacidad 0 FUERA de los fotogramas señala el bloque aunque esté dentro de una consulta, de otro bloque o repartida en varias líneas» |
| Inventario real de 20 hojas, sin hoja ajena y sin invisibles | «sobre las hojas reales ninguna aparición animada queda fuera de la hoja del hero ni queda invisible sin su animación» |
| La prueba que fijaba «el recuento es 0» se retira (el contrato ya la retiró) | desaparecen «desde el 20/09/2026 el recuento… es exactamente 0» y su compañera |
| Partes puras de @s19, @s21, @s22 | intactas: «@s19 (parcial, pura)…», «@s21 (parcial, pura)…», «@s22 (parcial, pura)…» |
| Comentarios que citaban `accesibilidad.feature:501-503` por línea | reescritos en `accesibilidad-movimiento.ts` y `.test.ts` citando la etiqueta y el texto de la cláusula |

### hero_reducido_con_animacion @s10 (parte pura) — `medicionEstable.test.ts`

| Cláusula | Test |
| --- | --- |
| La tabla de 16 filas | `describe` «@s10 (tabla de 16 filas del contrato)…» (escrita con las MISMAS formas que los specs reales: `cargarPortada()`, `cajaDe()`, bucle por rutas con `AxeBuilder`, `boundingBox`) |
| Recuento de bloques inspeccionados > 0 | «un fichero sin ningún "test(" no inspecciona nada y NO pasa: la guarda anti-vacuidad» |
| Por bloque y no por fichero | «cada bloque se juzga por separado: el informe nombra solo los que incumplen y el fichero no pasa» |
| Lista cerrada de llamadas, ámbito del hero, `documentElement.scrollWidth`, tipográficos | `describe` «qué cuenta como medir (la lista cerrada del contrato)» |
| Las dos vías y la excepción de congelar + colocar | `describe` «las dos vías y la excepción» |
| Resolución de UN nivel por función local | `describe` «funciones locales del mismo fichero (un nivel)» y «otras formas de escribir las funciones locales» |

## 4. Ciclos Rojo → Verde → Refactor

Honestidad sobre el ritmo: las TABLAS se escribieron enteras antes del primer
verde, no fila a fila; la Ley 3 se respetó por FAMILIAS de filas y no por fila.
Cada fila que nació verde se validó con sabotaje a mano (sección 5).

| # | `@s` | ROJO | VERDE (mínimo) | REFACTOR |
| --- | --- | --- | --- | --- |
| 1 | @s8 | 3 tests de `animation` (raíz / `no-preference` / `none`): `ejecutarPuertaDeEntradaSoloEnNoPreference is not a function` | primera versión del lector (pila de bloques, declaraciones) y la función | — |
| 2 | @s8 | tabla de 22 filas + recuentos: 22 rojos (faltaban `ficherosLeidos` y los dos recuentos) | `@keyframes`, consulta ajena, recuentos | tipos de bloque separados: `reduce` ≠ `media-ajena` ≠ `regla` |
| 3 | @s33 | 2 rojos contra la puerta EXISTENTE: bloque en una línea e interpolación | @s33 migrada al lector | la cabecera del módulo reescrita |
| 4 | lector | tras migrar @s33: 3 rojos de `reduce` y 1 de las hojas reales; después 5 del lector (comentarios, interpolación) | tipo `reduce`; comentarios fuera; interpolación opaca | `lineaDe` sin aritmética (`split.length`) |
| 5 | @s8 | «con 0 ficheros no pasa» | `ficheros.length > 0 &&` | — |
| 6 | @s16 | tabla de 30 filas + escala: 33 rojos | `escalaMovimiento.ts` reescrito sobre el lector | `partirEnNivelSuperior` sin `trim`/`filter` redundantes (equivalentes) |
| 7 | @s16 | `transition: 150ms ease-out all` (la propiedad puede ir DETRÁS del tiempo) | `includes` en vez de «primer token» | — |
| 8 | @s20 | tabla de 8 filas + hojas autorizadas: 14 rojos | `HOJAS_AUTORIZADAS_A_ANIMAR_LA_ENTRADA`, estado base fuera de `@keyframes`, guarda «> 0» | quitada la guarda `hojas.length > 0` (redundante) |
| 9 | @s10 | tabla de 16 filas: módulo inexistente | `medicionEstable.ts` entero | `tituloConComillas` (menos aritmética), `AxeBuilder` sin `new`, `undefined` en vez de `-1` |
| 10 | @s10 | 4 rojos derivados: título solo si es lo primero tras el paréntesis; regex con comillas; flecha con tipo de retorno genérico | corregidos | constantes con nombre para los desplazamientos de 2 caracteres |

## 5. Sabotaje a mano (NO es Stryker)

Un script en el scratchpad aplica un mutante textual a UN fichero fuente, corre
Vitest sobre sus tests, anota MUERTO/SOBREVIVE y SIEMPRE restaura el original.
Ejecuciones de mutantes: 432 (lector 77, `escalaMovimiento` 60, `movimientoRespetuoso`
26, `accesibilidad-movimiento` 35, `medicionEstable` 234 en cuatro rondas).
Cubren, entre otros, los de la lista del encargo: «solo ms», «sin retardos»,
«solo primera línea», «solo primera entrada de una lista», «fallar abierto»,
«`.7s` leído como 7s», «retardo negativo admitido», «reduce cubre todo», «otra
@media cubre», «@keyframes admitido dentro de reduce». Cada superviviente se
resolvió añadiendo un test (la mayoría) o simplificando el código redundante
(sin `trim`/`filter` de más, sin `new\s+` de más, sin `hojas.length > 0` de más).

**Transparencia para el lead.** El sabotaje muta EN SU SITIO, de forma
transitoria (segundos), `lectorDeEstilos.ts`, `escalaMovimiento.ts`,
`movimientoRespetuoso.ts`, `accesibilidad-movimiento.ts` y `medicionEstable.ts`.
Si el otro agente corrió Vitest sobre esos tests en esas ventanas, pudo ver rojos
falsos. Todos los ficheros quedaron restaurados (el script lo hace en `finally`).

## 6. Mutantes que considero EQUIVALENTES (para el `mutation_tester`)

No he podido demostrarlos con Stryker; los razono:

`medicionEstable.ts`
- Los cuatro `<` → `<=` de `veredictoDelBloque` (espera, emula, congela, coloca contra
  la primera medición o navegación): dos eventos nunca comparten posición (cada
  uno nace en el índice de una coincidencia distinta o en un desplazamiento
  fraccionario distinto dentro de una función).
- El `+ 1` de `fin` en `bloquesDeTest`: solo recorta el `)` final, que ningún
  patrón mira.
- El límite inferior `>=` de `estaDentroDeUnTest`: una palabra `function` no puede
  empezar en el mismo índice que `test(`. (El superior SÍ está matado: «una función
  declarada justo tras el cierre de un test (sin separación)…».)
- `finDelTitulo + 1` y `aperturaDelTitulo + 1` al recomponer el texto del bloque:
  descartan o conservan una coma o una comilla que ningún patrón mira.
- `profundidad === 0` → `<= 0` en `posicionDelCierre` y el `texto.length - 1` del
  caso «sin cerrar».

`lectorDeEstilos.ts`
- `posicionDeInicio = indice + 2` en lugar de `+ 1` (dos sitios): desplaza la
  posición de arranque en UN carácter hacia dentro de la sentencia; como el
  primer carácter significativo nunca es un salto de línea, el número de línea no
  cambia.
- `texto.length` en lugar de `texto.length - 1` en una interpolación sin cerrar.

## 7. Lo que la ola 2 tiene que hacer (aserciones y reglas exactas)

**A. Las guardas «> 0» sobre las 20 hojas reales (hoy NO pueden pasar):**
- `movimientoRespetuoso.test.ts`, test «lee exactamente 20 ficheros…»: añadir
  `expect(informe.recuentoDeFotogramas).toBeGreaterThan(0)` y
  `expect(informe.recuentoDeDeclaracionesDeEntradaEnNoPreference).toBeGreaterThan(0)`.
- `accesibilidad-movimiento.test.ts`, test «sobre las hojas reales ninguna
  aparición animada queda fuera…»: añadir
  `expect(inventario.recuentoDeBloquesQueAparecenAnimando).toBeGreaterThan(0)`,
  `expect(inventario.pasa).toBe(true)` y `expect(visibilidad.pasa).toBe(true)`.
  La guarda ya vive DENTRO del módulo (`pasa` exige al menos una aparición); lo
  único que falta es afirmarla sobre las hojas reales.
- No las escribí rojas a propósito: serían rojas por una hoja que esta ola no
  puede tocar, y @s4 prohíbe pruebas fallidas u omitidas.

**B. Reglas que su SCSS tiene que cumplir para que estas puertas den verde:**
1. La animación va en `src/components/Hero.module.scss` (la ÚNICA hoja
   autorizada, casada por el final de ruta `/components/Hero.module.scss`).
2. `animation`, `animation-name` y `animation-delay` SOLO dentro de
   `@media (prefers-reduced-motion: no-preference)`; los `@keyframes`, dentro de
   `no-preference` o en la raíz, NUNCA dentro de `reduce` ni de otra consulta.
3. **Los tiempos de `animation`, `animation-duration`, `animation-delay`,
   `transition*` tienen que ir en LITERAL** (`700ms`, `0.7s`, `120ms`…). La puerta de
   escala falla CERRADO ante `var(--…)`, `$variable` y `calc()`: un
   `animation: entrada var(--duracion-entrada) …` la pone roja. Cualquier token con
   paréntesis (también `cubic-bezier(…)`) falla cerrado. Las propiedades que no
   llevan tiempo (`-iteration-count`, `-fill-mode`, `-timing-function`, `-name`)
   no se validan.
4. En esa hoja ni una `opacity: 0` ni una `visibility: hidden` FUERA de un
   `@keyframes` (el sesgo es por HOJA: vale para cualquier regla, no solo la que
   anima).
5. Duraciones permitidas 150/300/700 ms (y `0.01ms` solo como duración); retardos
   0/120/240 ms; curva `ease-out`; nunca `all`.

**C. El cableado de la comprobación estática (@s10) a los specs reales:**

```ts
const SPECS = import.meta.glob('../../../tests/e2e/*.spec.ts', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>
const informes = Object.entries(SPECS).map(([ruta, texto]) => ({ ruta, informe: comprobarMedicionEstable(texto) }))
// bloques inspeccionados (suma) > 0 · ningún informe con incumplimientos · lista mínima de ficheros alcanzados
```

(un fichero sin bloques `test(` daría `pasa = false`: leer solo `*.spec.ts`.)

**D. Marcadores textuales que la ola 2 debe respetar (constantes del módulo):**
- El ayudante se llama `esperarEntradaTerminada(`; se reconoce también por una
  función local del mismo fichero.
- Congelar el reloj: `Animation.setPlaybackRate` (CDP) o `congelarRelojDeAnimaciones`.
- Colocar o cancelar: `currentTime =` (una comparación `===` NO cuenta) o `.cancel(`.
- Vía (b): `page.emulateMedia({ … reducedMotion: 'reduce' … })` ANTES del primer `goto`.
- **RIESGO:** la vía (c) solo se dispara si la congelación y la colocación están
  ESCRITAS en el propio spec o en una función local del mismo fichero. El
  contrato dice que `esperarEntradaTerminada` se resuelve por función local del
  mismo fichero; si la ola 2 pone `congelar…`/`colocar…` en `tests/e2e/utilidades.ts`
  (otro fichero), el módulo no los verá y el bloque de @s5/@s7/@s9/@s12 saldrá
  `incumple`. Dos salidas: escribirlos en línea o en una función local del spec,
  o que el lead amplíe `PATRON_CONGELA` y `PATRON_COLOCA` con los nombres reales
  de los ayudantes. (No he ajustado las constantes a ningún fichero que el otro
  agente está cambiando ahora.)

## 8. Desvíos y ambigüedades del contrato (no inventados: listados)

1. **Excepción por etiqueta de `cabecera_sobre_el_hero` (@s4, @s5, @s8, @s22):
   NO implementada.** No tiene fila en la tabla de @s10, sus specs aún no existen
   y el contrato no dice de dónde se lee la etiqueta (título del `test(` o del
   `test.describe(`). Además, la condición («el spec llama a
   `esperarEntradaTerminada(page)` después del primer fotograma y antes de su
   primera medición de geometría») es la misma regla general de la vía (a). Si la
   49 la necesita, se añade con su propia fila de tabla.
2. **El encargo decía «tabla de 21 filas» para @s8; el `.feature` tiene 22.** Se
   ha ido por el `.feature`.
3. **`fidelidad.spec.ts` @s43 sale obligado** («la imagen de fondo de la sección
   de bienvenida…»): lee `getComputedStyle(…).position` (la propiedad CSS) y
   menciona el `h1`. La regla del contrato dice «getComputedStyle leyendo
   posición», y la ambigüedad es si «posición» es la geométrica o la propiedad
   `position`. Dato, no retoque: con las dos lecturas el módulo lo marca. Quien
   decida lo contrario quita `position` de `PATRON_ESTILO_QUE_SE_LEE`.
4. **Comprobación sobre los 27 specs de HOY** (texto de `tests/e2e`, solo lectura;
   149 bloques `test(` leídos, el mismo número que cuenta un grep): bloques
   obligados en `accesibilidad.spec.ts` (@s36 y @s45: 2 incumplen, sin `emulateMedia`
   antes del bucle), `fidelidad-responsive-integral.spec.ts` (@s6: 1 incumple),
   `fidelidad-hero.spec.ts` y `tipografia.spec.ts` (ya llevan la espera o la
   emulación: pasan), `fidelidad.spec.ts` (el del punto 3) y `hero-reducido.spec.ts`
   (de la ola 1A, el bloque de @s12 sin su congelación todavía). **Salen 5-6
   ficheros, no los 4 del contrato**: dato para el judge, no motivo para retocar
   la heurística hasta que cuadre.
5. **Todo token con paréntesis falla cerrado** en la escala, incluida una función de
   curva (`cubic-bezier(…)`): no es `ease-out` y la escala tiene una sola curva.
   Interpretación mía, no escrita en el contrato.
6. **`animation: none` / `animation-name: none` cuentan como «aparición animada»** en
   @s20 (el inventario cuenta toda declaración `animation` y `animation-name`):
   ninguna hoja real las usa, pero @s8 las admite en cualquier sitio (`animation:
   none`) y @s20 las señalaría en una hoja que no sea la del hero. Latente.
7. **La lista de hojas autorizadas es una constante del módulo**
   (`HOJAS_AUTORIZADAS_A_ANIMAR_LA_ENTRADA`), contrastada en el test con un literal
   escrito a mano, y no un parámetro.
8. **Hojas reales: ningún incumplimiento previo** que no sea la animación nueva
   (comprobado: las 20 pasan @s33, @s8 y @s16 sin parchear nada).

## 9. Consecuencia sobre la puerta @s33 existente

`ejecutarPuertaDeMovimientoRespetuoso` conserva su API y su semántica (cubierta =
dentro de `no-preference` o `reduce`; `ficherosComprobados` cuenta los ficheros
con alguna propiedad de movimiento), pero ahora lee con el lector común: el
agujero de la pila queda arreglado para ella también, y entiende
interpolaciones, comentarios y declaraciones de varias líneas. Sus 9 tests
originales siguen verdes sin tocarlos; se añadieron 3.
