# TDD — feature 48 `hero_reducido_con_animacion`, ola 2B: el ayudante `esperarEntradaTerminada`, su cableado estático y el resto de specs

> `tdd_craftsman`, 14/10/2026. Contrato firmado por Pablo el 13/10/2026:
> `hero_reducido_con_animacion.feature` @s10 entero y @s9 (solo las dos cláusulas de CLS
> «sin congelar el reloj»), `accesibilidad.feature` @s19 y @s22 (cláusulas añadidas con la entrada
> del hero) y el endurecimiento de @s36/@s45 (`identidad_visual`) en `accesibilidad.spec.ts`.
>
> **Estado: VERDE.** La animación del hero (ola 2A) ya existía en `Hero.module.scss` cuando
> ejecuté la batería: `pnpm run test:e2e` literal, en el estado FINAL de mis ficheros, **247 pasadas,
> 0 fallos, exit 0**. No ejecuté
> Stryker (regla de la ola): los tests están escritos pensando en la mutación y sometidos a
> SABOTAJE A MANO (secciones 6 y 7), que NO es una prueba de mutación y no la sustituye.

---

## 0. Estado final, medido en esta máquina

| Puerta | Resultado |
| --- | --- |
| `pnpm run test:e2e` (build + `vite preview` propios, bajo el candado), **última ejecución, con mis ficheros ya en su estado final** | **247 pasadas · 0 fallos · exit 0** (56 s) con la animación del hero ya presente |
| Mis tres specs nuevos/ampliados (`movimiento`, `hero-entrada-cls`, `esperar-entrada-terminada`), `--repeat-each=3`, estado final | **57 pasadas · 0 fallos · exit 0** |
| Mis specs y los adaptados, `--repeat-each=3`, ronda anterior a los últimos retoques (movimiento) | 198 pasadas · 0 fallos · exit 0 (movimiento, hero-entrada-cls, esperar-entrada-terminada, fidelidad-responsive-integral, fidelidad-hero, tipografia, fidelidad, accesibilidad) |
| `pnpm test` (Vitest, todo) | **90 ficheros · 1748 pruebas · exit 0** |
| `pnpm run lint` (oxlint --deny-warnings) | exit 0, 0 errores y 0 avisos |
| `pnpm run typecheck` (`tsc -b`) y `tsc -p tsconfig.e2e.json --noEmit` | exit 0 |
| Stryker | NO ejecutado (regla de la ola). Superficie de mutación tocada por esta ola: **ninguna** (`medicionEstable.ts` no se ha cambiado; el test de cableado es un `*.test.ts`, excluido) |
| Procesos | el candado se tomó SOLO durante cada ejecución y se liberó; 4173 libre al terminar; ninguna copia de `dist/` ni servidor mío queda |

Tests nuevos: **16 de navegador** (8 en `esperar-entrada-terminada.spec.ts`, 4 en `hero-entrada-cls.spec.ts`,
4 en `movimiento.spec.ts`) y **4 de Vitest** (`medicionEstableSpecsReales.test.ts`).

## 1. Ficheros

**Nuevos:** `tests/e2e/entrada-del-hero.ts` (el ayudante) · `tests/e2e/esperar-entrada-terminada.spec.ts` ·
`tests/e2e/hero-entrada-cls.spec.ts` · `src/lib/diseno/medicionEstableSpecsReales.test.ts` (el cableado).

**Modificados:** `tests/e2e/movimiento.spec.ts` (sección nueva al final + dos comentarios que habían
quedado falsos) · `tests/e2e/accesibilidad.spec.ts` (@s36, @s38, @s39, @s45) ·
`tests/e2e/fidelidad-responsive-integral.spec.ts` (`cargarPortada`) · `tests/e2e/fidelidad.spec.ts` (@s43).

**No tocados:** `utilidades.ts` (el ayudante vive en un módulo nuevo), `rutas.ts`, `medicionEstable.ts` y su
test (no hizo falta ningún ajuste), `src/components/**`, `hero-reducido.spec.ts` y todo lo del otro agente,
`features/`, `feature_list.json`, `progress/current.md`, `project-spec.md`. Sin `git add/commit`.

**Finales de línea** (medidos con `git ls-files --eol` y contando `
`): todos mis ficheros nuevos y todos los
modificados están en **LF**, salvo `tests/e2e/fidelidad-responsive-integral.spec.ts`, que está en **CRLF en la
working copy** (índice y HEAD en LF, `.gitattributes` con `eol=lf`) y ya lo estaba antes de mi edición (mi primer
intento de sustituirlo por texto falló justo por eso). Git lo normaliza a LF al añadirlo; se lo dejo anotado al
`craftsman_lead` para el commit.

## 2. Decisión de diseño del ayudante

**Dónde:** `tests/e2e/entrada-del-hero.ts`, no `utilidades.ts` (esa es pura, sin importar Playwright) ni un
`*.spec.ts`. Mismo criterio de «infraestructura de prueba, fuera de la superficie de Stryker».

**API de DOS FASES** (la otra posibilidad del contrato era el `goto` dentro del ayudante):

1. `registrarEntradaDelHero(page | context)` ANTES del `goto`: `addInitScript` con un registro de
   `animationstart` y `animationend` en `window` (listeners de captura). Acepta un `BrowserContext`
   (`Pick<Page, 'addInitScript'>`), así cubre `context.newPage()`.
2. `esperarEntradaTerminada(page, { topeMs? })` DESPUÉS del `goto` y ANTES de la primera medición.

Si la fase 1 se olvida (o se instala después del `goto`), la 2 **falla en voz alta y de inmediato**
(`exigirElRegistro`), no mide a ciegas ni espera al tope.

La espera lee el REGISTRO, nunca `document.getAnimations()`, en dos pasos y en este orden: (1) el ANCLA: existe
el titular y el registro muestra el arranque de las 3; (2) que `fines >= arranques`. Con TOPE (por defecto
10 s): si vence, **lanza** un `Error` que dice el tope y el estado del registro (`titular`, `arranques`,
`fines`) y el test falla en vez de medir. `topeMs <= 0` se rechaza: en Playwright `timeout: 0` es «espera para
siempre», que es exactamente el mutante «tope inexistente».

Decisión mía, no escrita en el contrato: **el tope vale para cada una de las dos esperas**, no es un total (la
primera versión repartía un tope total con `queda()` y un suelo de 1 ms; el sabotaje demostró que ese suelo
dependía de la granularidad de `Date.now()` y no lo podía fijar ningún test; ver sección 5, ciclo 8).

## 3. Trazabilidad `@s` → test (fichero · nombre del test; nunca números de línea)

### hero_reducido_con_animacion @s10

| Cláusula del contrato | Test |
| --- | --- |
| Página de **animaciones ya terminadas**: devuelve con titular y 3 `animationend` | `esperar-entrada-terminada.spec.ts` · «con las animaciones YA terminadas al llamarlo, devuelve con el titular presente y tres "animationend" registrados» (con la precondición `getAnimations() === 0`) |
| Página del **hero tardío** (1,2 s tras `load`): no vuelve antes de titular + 3 fines | «con el hero montado un segundo o más DESPUÉS de "load", no vuelve antes de que exista el titular y hayan terminado las tres» (lectura SIN reintentos: `evaluate`, no `toHaveCount`) |
| Página de **30 s**: falla por el tope | «con una animación de 30 segundos presente al cargar, falla por el tope en vez de esperar o medir» (mensaje del tope + `arranques: 3, fines: 0` + no se pasa del tope) |
| Página que **nunca monta** el hero: falla por el tope | «con un hero que NUNCA se monta, falla por el tope: …» (`titular: false, arranques: 0, fines: 0`) |
| El registro se instala **antes del `goto`**; si no, no se mide | «sin la primera fase, o con ella DESPUÉS del goto, falla en voz alta y de inmediato …» |
| También con `context.newPage()` / `context.addInitScript` | «el registro instalado en el CONTEXTO cubre la página abierta con context.newPage(), y instalarlo también en la página no cuenta cada evento dos veces» |
| «Primero el titular y el arranque de las tres» (el titular es parte del ancla) | «el titular es parte del ancla: con las tres animaciones ya terminadas pero sin titular todavía, espera a que exista» (**5.ª página, no contratada**; ver desvíos) |
| El tope es mayor que 0 | «un tope que no sea mayor que 0 se rechaza de inmediato: …» |
| La tabla de 16 filas de la comprobación estática | `src/lib/diseno/medicionEstable.test.ts` (ola 1B, sin cambios) |
| Cableado a los specs reales: bloques > 0, 0 incumplimientos, lista mínima | `src/lib/diseno/medicionEstableSpecsReales.test.ts` · «se leen specs de verdad y se inspecciona al menos un bloque test(): la guarda anti-vacuidad» · «ningún bloque test() de ningún spec mide la portada recién cargada con la entrada en curso» · «todos los ficheros leídos pasan la comprobación, ninguno por vacuidad (cada uno tiene bloques)» · «la obligación alcanza AL MENOS a los cuatro ficheros de la lista mínima, con algún bloque que la cumple» |
| `accesibilidad` @s45 emula `reduce` antes de su `goto` | `accesibilidad.spec.ts` · @s45 (`emulateMedia` movido antes del bucle) + `W4` de la sección 6 |
| Specs que miden la portada recién cargada, adaptados | ver la tabla de la sección 4 |

### hero_reducido_con_animacion @s9 (solo las dos cláusulas «sin congelar el reloj»)

| Cláusula | Test |
| --- | --- |
| CLS de la portada ≤ 0,1 con `no-preference` explícito, leído con el registro de `esperarEntradaTerminada` + un fotograma (y como mínimo 1500 ms tras `load`) | `hero-entrada-cls.spec.ts` · «las 6 rutas: la portada, con "no-preference" explícito y la entrada terminada, y las otras 5, 1500 ms después de "load" y un fotograma más» |
| CLS de cada una de las 5 rutas sin hero, 1500 ms tras `load` y un fotograma | el mismo test (un solo test para que el recuento sea de verdad: `medidas` tiene exactamente 6 rutas, 1 + 5, en el orden del inventario) |
| Anti-vacuidad: el observador estaba instalado, y con `no-preference` la entrada SE EJECUTÓ | el mismo test: `observadorInstalado === true` en las 6; el registro de la portada tiene `arranques === 3` y `fines === 3` |
| La medida muerde | `hero-entrada-cls.spec.ts` · «una página que no se mueve da 0, y el acumulador estaba instalado» · «un salto de maquetación grande mucho antes de la lectura supera el techo de 0,1» · «un salto que llega 1200 ms después de "load", cuando acaba la entrada, también lo ve la lectura de 1500 ms (una de load + 956 ms lo perdería)» |
| «El de instantes medidos por ancho es exactamente 3» | NO es de este spec: vive con la medida de los tres instantes en `hero-reducido.spec.ts` (otra ola) |

### accesibilidad @s19 y @s22 (hoy viven en `tests/e2e/movimiento.spec.ts`)

| Cláusula | Test |
| --- | --- |
| @s19: con `reduce`, en el PRIMER fotograma y sin esperar, `animation-name` de los tres es `none` y no hay ningún objeto de animación por fotogramas clave, **tampoco los ya terminados** | `movimiento.spec.ts` · «con "reduce" emulado antes de navegar, en el primer fotograma con el titular los tres elementos tienen animation-name "none" y no hay ninguna animación por fotogramas clave, ni en curso ni terminada» (observador por `requestAnimationFrame` instalado antes del `goto`; «ya terminados» = el registro de `animationstart` sigue en 0 pasados 1500 ms) |
| @s19: «la misma medida sin la preferencia, con el reloj congelado, encuentra 3 animaciones» | «con el reloj congelado antes de navegar la portada tiene exactamente las 3 animaciones por fotogramas clave del hero: titular, párrafo y botón, con movimiento declarado en los tres» |
| @s22: exactamente las 3 animaciones, solo la portada | el mismo test (recuento = 3, objetivos = titular, párrafo y botón) |
| @s22: ninguna de las otras 5 rutas, con el reloj congelado ANTES de navegar en cada una | «con el reloj congelado antes de navegar en cada una de las 5 rutas sin hero, ninguna tiene una animación por fotogramas clave; la portada, medida igual, sí tiene 3» (control en la MISMA sesión congelada: 3 animaciones con `currentTime` 0 dos fotogramas después, `rutasSinHero` exactamente 5, y al volver a la portada tras las 5 navegaciones siguen en `currentTime` 0: prueba, dentro del propio test, de que el reloj estaba congelado) |
| @s22: en `endTime − 1 ms`, opacidad efectiva ≥ 0,999 y desplazamiento < 0,5 px; último fotograma (offset 1 con `getKeyframes()`) con `opacity "1"` y `transform "none"`; todo visible al cancelar | «en el último instante de su fase activa (endTime − 1 ms) los tres tienen opacidad efectiva >= 0,999 y desplazamiento < 0,5 px, y su último fotograma declara opacity "1" y transform "none"» |

Los VALORES de las tres animaciones (700 ms, 0/120/240, 40 px, `ease-out`) no se repiten aquí: los fija @s5
en `hero-reducido.spec.ts`, como dice el propio @s22.

## 4. Specs adaptados (vía por test; «cada test declara cuál usa»)

| Spec · test | Vía | Por qué |
| --- | --- | --- |
| `accesibilidad.spec.ts` · @s36 (axe, 6 rutas) | **(b)** `emulateMedia(reduce)` antes del bucle | señalado por la comprobación estática |
| `accesibilidad.spec.ts` · @s45 (axe, 5 variantes × 6 rutas) | **(b)**, antes del bucle | estaba DESPUÉS del `goto` (orden del contrato); además da el mismo estado que antes (ya emulaba `reduce` tras navegar) |
| `accesibilidad.spec.ts` · @s38 (foco) y @s39 (anillo vs fondos) | **(a)** `registrarEntradaDelHero` antes del bucle y `esperarEntradaTerminada` solo en la iteración de la portada | **NO la (b)**: ver la nota de abajo. La comprobación estática no los señala |
| `accesibilidad.spec.ts` · @s37 | sin cambio | mide TAMAÑOS (la entrada solo desplaza); lo probé con `reduce` y pasa, lo devolví a su forma original |
| `fidelidad-responsive-integral.spec.ts` · todos los tests | **(b)** en `cargarPortada()` (la función local que contiene el `goto`) | @s6 lo señala la comprobación; @s1-@s5 usan la misma función y @s2 mide TODOS los `a`, incluido el botón del hero, con `izquierda >= -1` |
| `fidelidad.spec.ts` · @s43 | **(b)** | lo señala la comprobación por leer `getComputedStyle(...).position` (ver desvíos) |
| `fidelidad-hero.spec.ts`, `tipografia.spec.ts` | ya cumplían por la (b) desde la ola 1A | sin cambio |

**NOTA IMPORTANTE (medido): la vía (b) no sirve para medir el foco.** Mi primera versión emulaba `reduce`
también en @s38 y @s39 y la batería dio 2 rojos con ratio **1,1248** (≥ 3 exigido). Causa (la misma medida
que halló el otro agente): bajo `reduce`, `global.scss` deja `transition-duration: 0.01ms` en TODAS las
propiedades, y con `transition-property: all` cada cambio dispara una transición que, leída justo tras
`focus()`, deja `outline-color` en su valor de partida. Se corrigió con la vía (a) (mide con la preferencia por
defecto, como antes, y con la entrada terminada). La batería siguiente, 247 pasadas.

**Aviso para no perseguir un problema ya resuelto:** `progress/tdd_hero_reducido_con_animacion_ola2a.md`, §9
«Pendientes y lo que NO he arreglado (specs ajenos)», lista TRES rojos de `tests/e2e` como ajenos a su ola y dice
«lo habrá de resolver quien lo toca»: los dos de `accesibilidad.spec.ts` @s38/@s39 (ratio 1,1248; los causó una
versión intermedia mía con `emulateMedia(reduce)` y hoy van por la vía (a), con @s37 devuelto a su forma original)
y el de `movimiento.spec.ts` @s22 sobre el nombre de animación del botón (mi prueba lo leía en el enlace y la
animación cuelga de su contenedor). **Los tres están resueltos en esta ola**: la batería final está en verde
con todos ellos.

## 5. Ciclos Rojo → Verde → Refactor

Honestidad sobre el ritmo: la animación ya existía cuando escribí los tests de `movimiento` y de CLS, así que
no había producción que los empujara; los escribí por bloques y los validé con SABOTAJE (secciones 6 y 7). El
ayudante sí se hizo test a test, y cada fila que nació verde está marcada.

| # | `@s` | ROJO | VERDE (mínimo) | REFACTOR / nota |
| --- | --- | --- | --- | --- |
| 1 | @s10 cableado | `medicionEstableSpecsReales.test.ts`: 3 rojos de 4, con 5 bloques nombrados (accesibilidad ×2, responsive-integral ×1, fidelidad ×1, hero-reducido ×1 del otro agente) | `emulateMedia(reduce)` antes del `goto` en @s36, @s45, `cargarPortada()` y @s43 | 4 verdes cuando el otro agente cerró su bloque de @s12 |
| 2 | @s10 helper | módulo inexistente (`Cannot find module`) | registro + `fines >= arranques` | página de «ya terminadas» |
| 3 | @s10 helper | hero tardío: `titular` false al volver | el ANCLA (titular + 3 arranques) | |
| 4 | @s10 helper | página de 30 s: el error era el de Playwright, no el del tope | error propio con tope y estado | `errors.TimeoutError`, `cause` (lint `preserve-caught-error`) |
| 5 | @s10 helper | — (**verde de inicio**: «nunca monta») | — | mordida con `sin-ancla`/`tope-inexistente` (sección 6.1) |
| 6 | @s10 helper | sin registro: esperaba al tope con un mensaje confuso | `exigirElRegistro` | |
| 7 | @s10 helper | — (**verde de inicio**: contexto + página) | — | el sabotaje `registro-no-idempotente` SOBREVIVIÓ → se quitó la guarda (código sin test) |
| 8 | @s10 helper | `topeMs: 0` → el mensaje era el del tope, no el de validación | `if (!(topeMs > 0)) throw` | el sabotaje `tope-sin-suelo` SOBREVIVIÓ (dependía de la granularidad de `Date.now()`): se quitó `queda()` y el suelo |
| 9 | @s10 helper | — (**verde de inicio**: titular tardío) | — | el sabotaje `ancla-sin-titular` SOBREVIVÍA sin esta página; ahora muere |
| 10 | @s9 CLS | — (**verde de inicio** sobre la portada real; las 3 pruebas sintéticas, por separado) | acumulador `layout-shift` + lectura a `loadEventEnd + 1500` + un fotograma + `takeRecords()` | |
| 11 | @s19/@s22 | `movimiento`: 1 rojo en el primer intento sobre la portada real (el botón no se anima él: lo hace su contenedor `.acciones`; el nombre de animación se leía en el `a`) | nombre efectivo = el del elemento o el del primer ancestro hasta la sección | también en el observador del primer fotograma |
| 12 | @s22 | — | `expect(page.locator('#inicio h1')).toHaveCount(1)` en el bloque del último instante | para que la comprobación estática pueda JUZGAR ese bloque (sección 7) |
| 13 | @s22 (5 rutas) | — (**verde de inicio**; faltaba una prueba de que la congelación surte efecto) | `currentTime` de las 3 === 0 tras dos fotogramas, antes de recorrer las 5 rutas y otra vez después | mordida con los dos sabotajes de 6.3 (el spec sin `congelarRelojDeAnimaciones` y una animación de 50 ms en el CSS) |

## 6. SABOTAJES a mano (no es Stryker)

Cada uno: se aplica, se ejecuta, se anota el rojo, se restaura y se verifica con `cmp` (ayudante) o con una
copia de `dist/` (nunca el real). Los scripts están en el scratchpad de la sesión (`ola2b/`).

### 6.1 El ayudante: los cuatro mutantes del contrato, cada uno con SU página

| Mutante (código sustituido) | Página que lo mata (contrato) | Resultado medido |
| --- | --- | --- |
| **tope inexistente** (`{ timeout: topeMs }` → `{ timeout: 0 }`, en las dos esperas) | 30 s | **MUERE** en la de 30 s (resuelve a los 30 s en vez de lanzar) y en la que nunca monta; 6 vivos |
| **sin ancla** (se quita `esperarAlAncla`) | hero tardío | **MUERE** en el hero tardío; también en 30 s, nunca monta, titular tardío y contexto (el contrato lo adelantaba: «un helper sin ancla también falla» en la de 30 s) |
| **espera una sola** (`fines >= arranques` → `fines >= 1`) | hero tardío | **MUERE** en el hero tardío (y en contexto) |
| **lee `getAnimations()`** (las dos esperas leen `document.getAnimations()`) | ya terminadas | **MUERE** en «ya terminadas» (y en titular tardío) |

Mutantes míos, todos MUEREN salvo uno: `tope-cero-sin-validar` (muere en «un tope que no sea mayor que 0…»,
tras 30 s) · `sin-exigir-registro` (muere en «sin la primera fase…») · `ancla-sin-titular` (muere en «el
titular es parte del ancla») · `ancla-con-dos` (muere en hero tardío y en contexto) · `registro-sin-fines`
(4 muertos). **SOBREVIVE** `registro-en-burbuja` (los listeners de `animationstart` con `capture` falso):
equivalente en estas páginas, porque `animationstart` burbujea hasta `window` y ningún script de las páginas
detiene la propagación; se conserva `capture: true` a propósito (robusto frente a un `stopPropagation`).

Las dos supervivientes de la primera ronda (`registro-no-idempotente`, `tope-sin-suelo`) se resolvieron
**quitando código**, no añadiendo tests: eran guardas que ninguna página podía poner en rojo.

### 6.2 El cableado de @s10 (el test `medicionEstableSpecsReales.test.ts` contra los specs REALES)

| Sabotaje (se deshace UNA adaptación) | Resultado |
| --- | --- |
| W1 `fidelidad.spec.ts` @s43 sin `emulateMedia` | ROJO: «fidelidad: la imagen de fondo de la sección de bienvenida…» |
| W2 `fidelidad-responsive-integral.spec.ts`, `cargarPortada()` sin `emulateMedia` | ROJO: «fidelidad-responsive-integral: cada 16px entre 320 y 1600…» |
| W3 `accesibilidad.spec.ts` @s36 sin `emulateMedia` | ROJO: «accesibilidad: las 5 etiquetas acumulativas…» |
| W4 `accesibilidad.spec.ts` @s45 con `emulateMedia` DESPUÉS del `goto` (el orden original) | ROJO: «accesibilidad: las 5 variantes × 6 rutas…» |
| W5 `fidelidad-hero.spec.ts`, `cargarPortada()` sin `emulateMedia` | ROJO: 5 bloques de `fidelidad-hero` |

Los cinco specs quedaron restaurados byte a byte (el script lo comprueba).

### 6.3 Mis specs de `movimiento` y de CLS, contra una COPIA de `dist/` con el CSS saboteado

Línea base sin sabotaje: los 6 tests pasan. (`@s42` aparece en el filtro porque su título cita «@s19 de accesibilidad.feature».)

| Sabotaje del CSS servido | Mueren |
| --- | --- |
| `animation` del titular declarada FUERA de `no-preference` | solo el test de **@s19** (primer fotograma); los otros 5 vivos |
| el hero pierde la animación (`animation: none` en las 3 reglas) | **@s22 ×3** y el de **CLS** (el registro no ve 3 arranques: anti-vacuidad) |
| el último fotograma pasa a `opacity: 0` | solo el de **@s22, último instante** (`opacidad efectiva 0`) |
| el último fotograma deja `transform: translate(-.3px)` | solo el de **@s22, último instante**, por la lectura del **fotograma de offset 1** (`Received: "translate(-0.3px)"`): 0,3 px cabe en la tolerancia de 0,5 px de la caja, como dice el contrato |
| `body { animation: … }` (una animación en otras rutas) | **@s22** (3 tests: el recuento de la portada pasa de 3 a 4 con `otro:BODY`, y el de las otras 5 rutas) y @s19 y CLS (por el recuento del registro) |
| `body { animation: … 50ms }` (una animación MUY corta en todas las rutas, que sin reloj congelado habría desaparecido antes de contarla) | el test de las **5 rutas** de @s22 (con el reloj congelado la ve) |
| el SPEC sin `congelarRelojDeAnimaciones` en ese mismo test (sabotaje del test, no del CSS) | el test de las **5 rutas**: «el reloj de animaciones no está congelado» (las 3 animaciones de la portada ya no están en `currentTime` 0) |
| `#root` anima `padding-top` a los 1200 ms de `load` (salto de maquetación DESPUÉS de la entrada) | el de **CLS**: `/GalapavetClinicaVeterinaria/: desplazamiento acumulado, Received: 0.2469` (una lectura a `load + 956 ms` lo habría perdido) |

### 6.4 Un sabotaje que SOBREVIVE (dicho tal cual)

Quitar `esperarEntradaTerminada` de @s39 (la caja del botón del hero y sus píxeles vecinos): **6 de 6
pasan**. La espera que añadí a @s38/@s39 no está demostrada como necesaria hoy: cuando el recorrido llega al
botón del hero (tras ~10 enlaces de cabecera, cada uno con su `isVisible`), la entrada ya ha terminado. Es
un cinturón de seguridad barato y la comprobación estática no los marca; si el judge prefiere quitarlo,
la batería no lo notará.

## 7. La comprobación estática juzga MIS bloques (órdenes sabotados)

Con la selección literal del titular dentro del bloque (`page.locator('#inicio h1')`, anti-vacuidad), la
comprobación de `medicionEstable.ts` juzga el bloque del último instante de @s22 como `exento` por la
rama «congela antes de navegar Y coloca antes de medir». Sabotajes de orden sobre ese bloque:
**medir antes de colocar → incumple · sin colocar → incumple · sin congelar → incumple · congelar después
del `goto` → incumple.** Sin ese `expect`, los selectores solo estaban en una constante y el bloque salía
`exento` por vacuidad (la trampa que ya había descubierto la ola 2A).

Veredicto de la comprobación sobre los 30 specs de hoy (179 bloques `test(`): **0 incumplimientos**.
Bloques `pasa` en 6 ficheros: accesibilidad (2), fidelidad-hero (5), fidelidad-responsive-integral (1),
fidelidad (1), tipografia (1), hero-reducido (1).

## 8. MEDIDO en Chromium 151.0.7922.34 (no es documentación oficial)

- `Animation.setPlaybackRate` a 0 por CDP, enviado antes del primer `goto`, **sobrevive a tres `goto`
  sucesivos**: las tres animaciones nacen con `currentTime` 0, `playState: running`, opacidad 0, y siguen así
  1,2 s de reloj real después (lo medí CON `Animation.enable`; mi spec no lo envía y el otro agente anota que tampoco hace falta).
- `animationstart` y `animationend` llegan a un listener de captura en `window`: en la portada real el registro
  cuenta `arranques === 3` y `fines === 3` tras `esperarEntradaTerminada`, y en una página sintética con
  retardos 0/120/240 y 60 ms de duración las tres son secuenciales.
- Bajo `reduce`, una transición de 0,01 ms en todas las propiedades deja el color del contorno en su valor
  de partida justo tras `focus()` (ratio 1,1248 en @s38/@s39).
- Una animación de `padding-top` en `#root` produce entradas `layout-shift` (CLS 0,2469 medido) y el acumulador
  las ve; `takeRecords()` vuelca las pendientes antes de leer.
- Con el último fotograma `to { transform: translate(-.3px) }`, `getKeyframes()` devuelve
  `transform: "translate(-0.3px)"` con `computedOffset: 1`.

**Sin verificar en documentación oficial** (lo midió o lo supuse; que el lead lo consulte): que Playwright 1.62
entiende `timeout: 0` como «sin tope» en `waitForFunction` (lo medí: con ese valor el mutante esperó 30 s y no
lanzó, pero la frase de la API no la he leído); el comportamiento exacto del dominio `Animation` del protocolo
de depuración de Chrome ante recargas y ante varias sesiones; la semántica de `buffered: true` de
`PerformanceObserver('layout-shift')` en un script de inicio; que `errors.TimeoutError` de `playwright/test`
sea la clase que lanza `waitForFunction` (lo comprobé por ejecución, no por la documentación).

## 9. Desvíos y ambigüedades del contrato (no inventados: listados)

1. **Los ficheros «alcanzados» son 6, no 4.** La comprobación da `pasa` en accesibilidad, fidelidad-hero,
   fidelidad-responsive-integral y tipografia (los 4 del contrato) más `fidelidad.spec.ts` @s43 y
   `hero-reducido.spec.ts`. El primero por leer `position` (la ambigüedad que dejó la ola 1B: «posición» como
   geometría o como la propiedad CSS) y el segundo porque es posterior al conteo del 13/10. No toqué la heurística.
2. **La comprobación es CIEGA a medidas del hero que el contrato nombra.** Accesibilidad @s37-@s39 y
   fidelidad-responsive-integral @s1-@s5 miden la caja del botón del hero (`SELECTOR_INTERACTIVO`, `a, button`,
   `#inicio`: ningún marcador `[data-hero-`, `h1` o «Reservar cita»), y el contrato los nombra en su lista de
   riesgo (A5). Los adapté a mano; la regla textual (i) no los alcanza y sus adaptaciones no tienen puerta
   que las vigile.
3. **La vía (b) NO mide el mismo estado final que la (a) cuando se mide el FOCO** (sección 4). El contrato dice
   que las dos vías «miden el MISMO estado final»: es falso para @s38/@s39 mientras `global.scss` deje
   `transition-duration: 0.01ms` sobre `*` (medido: ratio 1,1248 con `reduce`, ≥ 3 sin él). Hay que decirlo
   en el contrato: la regla de las dos vías no es intercambiable para las medidas de foco.
4. **El tope es por espera, no total**; mi decisión. Con 2 esperas el máximo es 2 × tope.
5. **@s9 pide «el registro… o como mínimo 1500 ms»; lo hago con las DOS** (más estricto, no contradictorio).
6. **Una 5.ª página sintética** (titular tardío) que el contrato no pide: sin ella el mutante `ancla-sin-titular`
   sobrevive, y el contrato dice «espera primero a que exista el titular».
7. **@s22 «con los valores que fija ese escenario»**: solo compruebo recuento 3 y objetivos (titular, párrafo,
   botón); los valores son de @s5 (`hero-reducido.spec.ts`).
8. **El botón no se anima él: se anima su contenedor `.acciones`** (decisión de la ola 2A, que el contrato
   admite: «o el contenedor que lo envuelve»). Mis lecturas de nombre de animación y de opacidad suben por los
   ancestros hasta la sección.
9. **La excepción por etiqueta de `cabecera_sobre_el_hero` (@s4, @s5, @s8, @s22) sigue sin implementarse** (desvío
   1 de la ola 1B): sus specs no existen y el contrato no dice de dónde se lee la etiqueta.
10. **«Instantes medidos por ancho = 3»** no está en mi spec (es de la medida de los tres instantes).
11. **Equivalente `registro-en-burbuja`** (6.1): documentado para el `judge`.

## 10. Pendientes para el `craftsman_lead` / el `judge`

- La mutación Stryker no la he tocado: lo mío no entra en su superficie (`tests/e2e/**` y `*.test.ts` fuera).
- Las cláusulas «lo verifica el judge» de @s10 («cada mutante muere con la página que se dijo», «ningún test
  de la lista mide con una animación en curso y pasa») están respaldadas por las secciones 6.1 y 6.3; la
  segunda no la prueba ninguna puerta automática.
- Decidir si la espera añadida a @s38/@s39 se queda (6.4).
- Un `esperarEntradaTerminada` en la portada real solo lo usan hoy el spec de CLS y @s38/@s39; el resto de las
  adaptaciones van por la vía (b).
- `progress/lcp_hero_despues_<fecha>.md` (@s11) no es de esta ola.
