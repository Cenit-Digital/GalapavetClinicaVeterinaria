# TDD — selector_paleta (id 14)

> Bitácora de ciclos Rojo→Verde→Refactor y mapa de trazabilidad `@s → test`.
> Feature implementada de cero: no existía ningún fichero suyo en disco al
> arrancar esta sesión (confirmado por `git status` al inicio).

## Entregables

- `src/data/variantesPaleta.ts` — catálogo literal de las 4 variantes
  (`marca`/`lima`/`verde`/`noche`), reutilizando `coloresDeMarca` de
  `src/lib/tokens.ts` (morado `#77286B`, lima `#B4C718`, verde profundo
  `#48704B`) como las 3 muestras decorativas de cada variante — incluida
  "noche", que no tiene tokens propios verificados todavía (PENDIENTE de
  `tokens_marca`, según la cabecera del propio `.feature`).
- `src/components/SelectorPaleta-logica.ts` — lógica pura mordible por
  mutación:
  - `CLAVE_ALMACENAMIENTO_VARIANTE` = `"galapavet-variante"`,
    `VARIANTE_POR_DEFECTO` = `"marca"`.
  - `resolverVarianteInicial(stored, catalogo)` — el **gemelo puro** del
    script anti-destello (patrón
    `logica-pre-pintado-inline-se-espeja-en-gemelo-puro-testeable`).
  - `leerVarianteAlmacenada(almacenamiento)` — lectura de `localStorage`
    envuelta en `try/catch`, nunca lanza (@s14).
  - `guardarVarianteElegida(almacenamiento, id)` — escritura envuelta en
    `try/catch`, nunca lanza (@s15).
- `src/components/SelectorPaleta.tsx` — solo cablea: botón flotante +
  `fieldset` con los botones de variante; toda decisión vive en el módulo de
  lógica.
- `index.html` — script inline en `<head>`, **espejo literal escrito a
  mano** de `resolverVarianteInicial` (mismas ramas, mismo catch defensivo),
  con comentario que apunta por nombre a la función que espeja.
- `src/components/SelectorPaleta-logica.test.ts` y
  `src/components/SelectorPaleta.test.tsx` — 16 tests, uno por escenario (más
  la interfaz de apoyo `extraerScripts`/`ScriptEncontrado` para @s10).

## Trazabilidad `@s → test`

| Escenario | Test | Fichero |
| --- | --- | --- |
| @s1 (selector cerrado al cargar) | `existe el botón "Cambiar paleta de color" con aria-expanded "false" y sin panel abierto` | `SelectorPaleta.test.tsx` |
| @s2 (abrir lista las 4 variantes) | `el botón pasa a aria-expanded "true" y el grupo lista los 4 nombres esperados` | `SelectorPaleta.test.tsx` |
| @s3 (reabrir cierra el panel) | `aria-expanded vuelve a "false" y el grupo deja de existir` | `SelectorPaleta.test.tsx` |
| @s4 (muestras no ensucian el nombre accesible) | `cada botón de variante trae 3 muestras aria-hidden y su nombre accesible empieza por el nombre de la variante` | `SelectorPaleta.test.tsx` |
| @s5 (sin preferencia → "marca" activa) | `data-variante vale "marca", el botón "Marca Galapavet" está presionado y los otros 3 no` | `SelectorPaleta.test.tsx` |
| @s6 (elegir variante la aplica de inmediato) | `data-variante pasa a "noche", el botón "Marca en oscuro" queda presionado y es el único` | `SelectorPaleta.test.tsx` |
| @s7 (elegir variante la persiste) | `el almacenamiento local contiene solo la clave "galapavet-variante" con el texto exacto "noche"` | `SelectorPaleta.test.tsx` |
| @s8 (se recuerda en la siguiente visita) | `con "verde" ya guardado, data-variante vale "verde" y "Verde profundo" queda presionado al abrir` | `SelectorPaleta.test.tsx` |
| @s9 (resolución antes del primer pintado) | `con "noche" guardado bajo la clave del selector, resuelve exactamente "noche" y ese valor es el que se escribiría en data-variante` | `SelectorPaleta-logica.test.ts` |
| @s10 (script de arranque precede al bundle) | `el script en línea que escribe data-variante aparece antes que el módulo de la app, sin defer/async/src` | `SelectorPaleta-logica.test.ts` |
| @s11 (id desconocido → "marca") | `con "tech" guardado, resuelve exactamente "marca" y nunca "tech"` | `SelectorPaleta-logica.test.ts` |
| @s12 (cadena vacía → "marca") | `con cadena vacía guardada, resuelve exactamente "marca"` | `SelectorPaleta-logica.test.ts` |
| @s13 (valor corrupto nunca llega al atributo) | `con texto corrupto guardado, resuelve exactamente "marca", uno de los 4 identificadores del catálogo` | `SelectorPaleta-logica.test.ts` |
| @s14 (almacenamiento que lanza al leer) | `leerVarianteAlmacenada no propaga la excepción y resolverVarianteInicial resuelve "marca"` | `SelectorPaleta-logica.test.ts` |
| @s15 (almacenamiento que lanza al escribir) | `data-variante cambia, el botón queda presionado y la interacción no lanza` | `SelectorPaleta.test.tsx` |
| @s16 (catálogo vacío → no se renderiza) | `no existe el botón "Cambiar paleta de color" y data-variante vale "marca"` | `SelectorPaleta.test.tsx` |

## Cómo se cubrió @s9 (gemelo puro)

`@s9` no monta ningún componente ni toca el DOM más que para la aserción
final: llama directamente a `resolverVarianteInicial` (la réplica pura del
script anti-destello) con el valor crudo que devuelve
`window.localStorage.getItem('galapavet-variante')` tras guardar `"noche"`, y
comprueba que resuelve exactamente `"noche"`. La segunda cláusula del
escenario ("ese es el valor que se escribe en el atributo data-variante")
se verifica escribiendo ese valor resuelto en
`document.documentElement.setAttribute('data-variante', resuelto)` y
releyendo el atributo — sin depender de que el componente React haga esa
escritura (que es justo lo que jsdom no puede probar para el script inline
real): la garantía que realmente importa es que la FUNCIÓN devuelve el valor
correcto, listo para escribirse.

Confirmado con sabotaje manual (no solo "verde a la primera"): se sustituyó
temporalmente el cuerpo de `resolverVarianteInicial` por
`return VARIANTE_POR_DEFECTO` ignorando sus argumentos → el test de @s9 pasó
de verde a rojo (`resuelto` = `"marca"` en vez de `"noche"`), confirmando que
mide comportamiento real. Revertido antes de continuar.

## Cómo se cubrió @s10 (test de integridad sobre `index.html`)

jsdom no ejecuta scripts inline de `index.html` (confirmado por el propio
patrón organizacional citado en la tarea), así que @s10 no intenta montar ni
ejecutar el documento: lee `index.html` como **texto**, vía un import
`?raw` de Vite (`import htmlIndice from '../../index.html?raw'`) — sin tocar
`node:fs`, coherente con que este es un proyecto de navegador, no un script
de Node, y sin necesidad de compilar con `vite build` ni de leer `dist/`.

El test:

1. Extrae todos los `<script>` del documento con sus atributos crudos y su
   posición (`extraerScripts`).
2. Localiza el índice de `<script type="module" src="/src/main.tsx">`.
3. Busca, entre los scripts extraídos, el que contiene `data-variante` en su
   cuerpo — el script anti-destello.
4. Aserta que ese script existe, que su posición es **anterior** a la del
   script de módulo, y que sus atributos no incluyen `defer`, `async` ni
   `src`.

Antes de escribir el script real, se confirmó el ROJO: `index.html` no tenía
ningún script (el `<head>` original solo traía `meta`/`link`/`title`), así
que `scriptAntiDestello` quedaba `undefined` y la primera aserción fallaba.
Se implementó el script inline en `index.html` como **espejo literal escrito
a mano** de `resolverVarianteInicial` (mismo catálogo `['marca', 'lima',
'verde', 'noche']`, mismo `try/catch` defensivo, mismo valor por defecto
`'marca'`), con un comentario que apunta por nombre a la función que espeja
y a los escenarios `@s9`/`@s10`. El test pasó a VERDE sin tocar ningún otro
fichero.

## Ciclos Rojo→Verde→Refactor (en orden)

1. **@s1** — ROJO: `SelectorPaleta.test.tsx` no podía importar
   `./SelectorPaleta` (no existía). VERDE: componente mínimo con solo el
   botón flotante y `aria-expanded`.
2. **@s2** — ROJO: no había grupo ni botones de variante. Se creó
   `src/data/variantesPaleta.ts` (catálogo completo, las 4 variantes exigidas
   por el escenario) y se añadió el `fieldset`/mapa de botones. VERDE.
3. **@s3** — "verde a la primera" (el toggle ya alternaba desde @s1).
   Verificado con sabotaje: se forzó `onClick={() => setAbierto(true)}`
   (nunca cierra) → el test de @s3 pasó a rojo, y solo ese; revertido.
4. **@s4** — ROJO: los botones de variante no traían muestras. VERDE: 3
   `<span aria-hidden="true">` por variante, coloreados con
   `variante.muestras`.
5. **@s5** — ROJO: no existía `data-variante` en el documento ni
   `aria-pressed`. Se creó `SelectorPaleta-logica.ts` con
   `resolverVarianteInicial` y se cableó el estado inicial + un
   `useEffect` que fija el atributo. VERDE.
6. **@s6** — ROJO: pulsar un botón de variante no cambiaba `activa`. VERDE:
   `onClick` llama a `setActiva(variante.id)`.
7. **@s7** — ROJO: no se escribía en `localStorage`. VERDE (mínimo, sin
   guarda todavía): `window.localStorage.setItem(CLAVE_ALMACENAMIENTO_VARIANTE,
   variante.id)` directo en el `onClick`.
8. **@s8** — "verde a la primera" (la lectura inicial ya usaba
   `resolverVarianteInicial` + `localStorage.getItem`, genérica desde @s5).
   Verificado con sabotaje: se forzó el estado inicial a
   `resolverVarianteInicial(null, catalogo)` (ignora lo guardado) → @s8 pasó
   a rojo (esperaba `"verde"`, obtuvo `"marca"`); revertido.
9. **@s9** — ROJO: no existía `SelectorPaleta-logica.test.ts`; el primer test
   creado ya pasó porque `resolverVarianteInicial` ya era genérica desde el
   ciclo de @s5 (mismo patrón "verde a la primera"). Confirmado con sabotaje
   descrito arriba.
10. **REFACTOR** (barra verde): se cambió la lectura inicial del componente
    de `window.localStorage.getItem(...)` directo a
    `leerVarianteAlmacenada(window.localStorage)` (recién extraída como
    parte del ciclo @s14 más abajo, adelantado aquí por orden de edición) —
    ver nota de reordenación más abajo.
11. **@s11/@s12/@s13** — los tres "verdes a la primera": `resolverVarianteInicial`
    ya cubría genéricamente id desconocido, cadena vacía y texto corrupto
    (todo lo que no es un id exacto del catálogo cae a `VARIANTE_POR_DEFECTO`).
    Cubiertos por la misma rama que @s9 ya verificó con sabotaje; no se
    repitió el sabotaje escenario a escenario porque es literalmente la
    misma línea de código (`idsDelCatalogo(catalogo).includes(stored)`).
12. **@s14** — ROJO real: `leerVarianteAlmacenada` no existía (`TypeError:
    ... is not a function`). VERDE: se añadió la función con `try/catch`
    devolviendo `null` en el catch. REFACTOR (barra verde): se sustituyó la
    lectura inicial del componente por esta función (paso 10 de esta lista).
    Al hacerlo se rompió momentáneamente la importación de
    `CLAVE_ALMACENAMIENTO_VARIANTE` en el componente (usada también por el
    `onClick` de guardado) — detectado de inmediato por los propios tests
    (`ReferenceError`), corregido reponiendo el import antes de seguir: "si
    algo se pone rojo durante el refactor, no es refactor, es cambio de
    comportamiento; se arregla".
13. **@s15** — ROJO detectado en dos pasadas. La primera versión del test
    usaba `vi.spyOn(window.localStorage, 'setItem')`, que en este runtime
    (jsdom 30 + Vitest 4) **no intercepta la llamada real** — `Storage` se
    implementa como objeto con semántica de propiedades indexadas/heredadas
    del prototipo, así que sobreescribir el método en la instancia no
    afecta a `window.localStorage.setItem(...)` invocado desde producción.
    Verificado con un test de diagnóstico aislado (descartado, no forma
    parte de la feature) que confirmó que el mock nunca se invocaba.
    Corregido a `vi.spyOn(Storage.prototype, 'setItem')`, que sí intercepta.
    Con el spy correcto, el ROJO fue real: el `onClick` sin guarda dejaba
    escapar la excepción como error no controlado de React
    (`executeDispatch` → `dispatchEvent`), reportado por Vitest como
    "Unhandled Exception" con código de salida 1 (confirmado explícitamente
    con `echo $?`, no solo por el resumen de la consola). VERDE: se añadió
    `guardarVarianteElegida` (mismo patrón `try/catch` silencioso que
    `leerVarianteAlmacenada`) y se cableó en el `onClick` en lugar de la
    llamada directa a `setItem`.
14. **@s16** — ROJO: el botón flotante se renderizaba incluso con catálogo
    vacío. VERDE: guarda `if (catalogo.length === 0) return null` **después**
    de los hooks (para no violar `react/rules-of-hooks`), de forma que
    `data-variante` se sigue fijando a `"marca"` vía el `useEffect` aunque no
    haya UI.
15. **REFACTOR final (barra verde)**: 2 correcciones de lint
    (`jsx-a11y/prefer-tag-over-role`: `<div role="group">` → `<fieldset
    aria-label>`; `react/no-array-index-key`: `key={indice}` → `key={color}`
    en las muestras, únicas dentro de cada variante) y reordenación de ambos
    ficheros de test para que las `describe` sigan el orden `@s1..@s16` (se
    habían ido insertando cada nuevo escenario al principio del bloque
    existente durante el propio ciclo TDD). Ningún cambio de comportamiento;
    reconfirmado verde tras cada paso.

## Ronda de refuerzo 2 — remediación tras rechazo del judge

**Veredicto ronda 1:** CHANGES_REQUESTED (`progress/judge_selector_paleta.md`).
Único hallazgo bloqueante: el campo `nota` de `VariantePaleta`
(`src/data/variantesPaleta.ts:15` y sus 4 entradas del catálogo) era código de
producción sin ningún test ni escenario `@s` que lo exigiera — violación de la
Ley 1. Confirmado por el propio judge con sabotaje (removerlo dejaba
`pnpm run typecheck` limpio y `pnpm run test` en 310/310 sin ningún otro
cambio) y por revisión de las 16 escenas del `.feature`: ninguna pide mostrar
una nota o descripción por variante, solo el nombre accesible (@s2/@s4) y las
3 muestras de color (@s4). La tabla de la cabecera (líneas 27-31) es
documentación del contrato heredado, no un escenario Gherkin.

- **Ciclo de remediación (sin test nuevo, es retirada de código muerto, no
  funcionalidad):**
  - Fichero tocado: `src/data/variantesPaleta.ts`.
  - Cambio: eliminado `readonly nota: string` de la interfaz
    `VariantePaleta` y el campo `nota` (con su literal) de las 4 entradas de
    `VARIANTES_PALETA` (`marca`, `lima`, `verde`, `noche`).
  - Motivo: hallazgo del judge, ronda 1, sección "Cambios requeridos" punto 1.
    No hace falta un ciclo Rojo previo porque no se añade comportamiento: se
    retira un dato sin consumidor ni test que lo pidiera (la Ley 1 exige lo
    contrario — que no exista producción sin un test que la pida — así que
    la remediación correcta es la retirada, no la creación de un test que
    "legitime" el dato a posteriori).
  - Verificación: `grep -rn "nota" src/` tras el cambio solo encuentra
    coincidencias no relacionadas (`Anotado:` en `ReservaChat.tsx`/
    `ReservaChat.test.tsx`) y los comentarios de cabecera del propio
    `.feature` (documentación, no código) — cero referencias a
    `variante.nota` en ningún fichero de producción o test.
  - `node .harness/harness.mjs init`: verde de punta a punta — lint sin
    errores, typecheck limpio, **310/310** tests (sin cambio de cantidad
    respecto a la ronda 1, confirmando que ningún test dependía del campo
    retirado).

Trazabilidad `@s → test` sin cambios respecto a la tabla de arriba (16/16):
esta ronda no toca comportamiento, solo retira un dato muerto.

## Notas de diseño

- Las **4 variantes** son literales exactos del `.feature` (líneas 27-31, solo
  `id`/`nombre`): no se retipearon desde ningún otro origen. La columna
  `nota` de esa tabla es documentación del contrato heredado (ver ronda de
  refuerzo 2 arriba) y no se traslada a un campo del catálogo en tiempo de
  ejecución porque ningún `@s` exige mostrarla.
- Las **12 muestras de color** (3 por variante × 4 variantes) reutilizan
  `coloresDeMarca` de `src/lib/tokens.ts` (morado/lima/verde profundo) para
  las 4 variantes por igual, incluida "noche": el `.feature` (@s4) solo
  exige "3 muestras de color" decorativas por botón, no fija cuáles, y
  `tokens_marca` @s16 es quien decide en el futuro los tokens propios de la
  variante oscura — este fichero no se adelanta a esa decisión ni inventa
  un hexadecimal no verificado.
- El **nombre accesible** de cada botón de variante es su texto visible
  (`variante.nombre`); las muestras van marcadas `aria-hidden="true"` así
  que nunca contaminan el cálculo de nombre accesible — no hizo falta
  `aria-label` explícito.
- `AlmacenamientoDeLectura`/`AlmacenamientoDeEscritura` son dos interfaces
  mínimas (no una única `Storage` completa) para que cada función dependa
  solo del método que usa (`getItem`/`setItem`), facilitando los dobles de
  test.

## Verificación final

- `pnpm run lint` (oxlint --deny-warnings): sin errores.
- `pnpm run typecheck` (`tsc -b`): sin errores.
- `pnpm run test` (Vitest): **310/310** tests en verde (294 previos + 16 de
  esta feature).
- `node .harness/harness.mjs init`: **verde de punta a punta**.

Pendiente de las puertas siguientes (no las cierra este agente): `judge` y
`mutation_tester` sobre `src/components/SelectorPaleta-logica.ts` (único
fichero mordible de esta feature; `SelectorPaleta.tsx` queda fuera del glob
de Stryker por diseño del proyecto, mismo criterio que el resto de
componentes).
