# Fix @s25 — "Los controles de formulario alcanzan la altura del diseño"

Feature: `rediseno_visual` (id 24). Escenario `@s25`
(`features/rediseno_visual.feature:428-434`). Dos defectos reales e
independientes, en dos componentes distintos, encontrados por
`tests/e2e/geometria-escalas.spec.ts` contra un build de producción fresco.

## Cláusula del escenario → aserción de test

```
@s25
Scenario: Los controles de formulario alcanzan la altura del diseño
  Given el sitio construido y servido
  When se mide el alto real de cada campo de texto, desplegable y botón del
       formulario de contacto y del chat de reserva
  Then ninguno mide menos de 44 píxeles de alto
  And la casilla de consentimiento queda alineada con la primera línea de
      su etiqueta
  And todos siguen cumpliendo el mínimo de área táctil que ya exigía el
      contrato anterior
```

| Cláusula | Test e2e (autoridad final) | Test unitario de blindaje |
|---|---|---|
| "ninguno [del formulario de contacto] mide menos de 44px" | `geometria-escalas.spec.ts:492` | ya en verde antes de esta sesión (sin cambios) |
| "ninguno [del chat de reserva] mide menos de 44px" | `geometria-escalas.spec.ts:518` | `ReservaChat.test.tsx` → `describe('@s25 los botones de "Respuestas rápidas" alcanzan la altura mínima de control (44px)')` |
| "la casilla de consentimiento queda alineada con la primera línea de su etiqueta" | `geometria-escalas.spec.ts:562` | `FormularioContacto.test.tsx` → `describe('@s25 la casilla de consentimiento y su etiqueta viven en la misma fila')`, primer `it` (estructura) |
| "todos siguen cumpliendo el mínimo de área táctil" (24px, heredado) | `geometria-escalas.spec.ts:562` (ya pasaba) y, de rebote, `accesibilidad.spec.ts:75` (@s37, contrato anterior) | `FormularioContacto.test.tsx`, segundo `it` de ese mismo `describe` (CSS del enlace "Aviso legal") |

---

## Defecto 1 — botones de "Respuestas rápidas" del chat de reserva, por debajo de 44px

### Causa

`ReservaChat.module.scss`, regla `[aria-label='Respuestas rápidas'] button`,
usaba solo `@include pildora-filtro;` (`_api.scss`), un mixin de "chip" sin
`min-height` de 44px — correcto para filtros decorativos, pero estos botones
son la interacción primaria de cada paso del guion del chat.

### Ciclo TDD

**ROJO** — test añadido en `src/components/ReservaChat.test.tsx` (nuevo
`describe('@s25 ...')`), que lee el texto real de `ReservaChat.module.scss`
con `?raw` (mismo patrón que `InformacionContacto.test.tsx` @s36) y comprueba
que el bloque `[aria-label='Respuestas rápidas'] button` contiene
`min-height: $altura-control-media;` (el mismo token que ya usa `input` en
ese fichero, línea ~143).

Mensaje de fallo real (`pnpm exec vitest run src/components/ReservaChat.test.tsx -t "@s25"`):

```
AssertionError: expected '\n    @include pildora-filtro;\n    m…' to contain 'min-height: $altura-control-media;'

- Expected
+ Received

- min-height: $altura-control-media;
+
+     @include pildora-filtro;
+     margin-inline-end: espaciado(8);
+     margin-block-end: espaciado(8);
```

**VERDE** — se añadió `min-height: $altura-control-media;` a esa regla local
(dentro de `.reservaChat`), sin tocar `pildora-filtro` en `_api.scss` (otros
usos del mixin — filtros de la Tienda, píldora de categoría de Servicios —
quedan intactos, confirmado por la suite completa en verde).

`pnpm exec vitest run src/components/ReservaChat.test.tsx` → **23/23 tests
verdes**.

**REFACTOR** — ninguno necesario: el cambio es una única línea, coherente
con el patrón ya usado por `input` en el mismo fichero.

### Confirmación con navegador real

`pnpm run build` (fresco) + `pnpm exec playwright test --workers=1 --reporter=list -g "ningún botón ni campo de texto del chat de reserva"`:

```
✓  tests\e2e\geometria-escalas.spec.ts:518:3 › @s25 ... › ningún botón ni campo de texto del chat de reserva mide menos de 44px (255ms)
```

(antes del fix: `Error: control #0 del chat de reserva — Expected: >= 44, Received: 40`)

---

## Defecto 2 — casilla de consentimiento del formulario de contacto, desalineada con su etiqueta

### Causa

`FormularioContacto.tsx` maquetaba `<label>`, `<input type="checkbox">` y
`<a>Aviso legal</a>` como tres hijos directos y sucesivos de un
`<form>` con `display:flex; flex-direction:column`: tres filas distintas.
Ninguna alineación por centro vertical es posible entre dos elementos que
viven en filas distintas del mismo flex-column.

### Ciclo TDD (1/2): reestructurar el marcado — casilla y etiqueta en la misma fila

**ROJO** — test estructural en `FormularioContacto.test.tsx`
(`describe('@s25 la casilla de consentimiento y su etiqueta viven en la
misma fila')`, primer `it`): la casilla y el texto de su `<label>` deben
compartir el mismo `parentElement`, y ese contenedor no puede ser el propio
`<form>`.

Mensaje de fallo real:

```
AssertionError: expected <form …(4)>…(15)</form> not to be <form …(4)>…(15)</form> // Object.is equality
 ❯ expect(casilla.parentElement).not.toBe(formulario)
```

**VERDE** — se agrupó `<input type="checkbox">` + `<label>` (con el
`<a>Aviso legal</a>` ahora dentro del `<label>`, tras el texto) en un
`<div className={styles.grupoConsentimiento}>` propio. `htmlFor`/`id` se
mantienen intactos (misma asociación de accesibilidad).

`pnpm exec vitest run src/components/FormularioContacto.test.tsx` → **16/16
tests verdes** (los 13 preexistentes + el nuevo), confirmando que ningún
`@s1..@s14` de ese fichero se rompió (nombre accesible de la casilla, href
del enlace, validación `aria-invalid`, reinicio del formulario, etc.).

### Ciclo TDD (2/2): centrar la fila por CSS

**ROJO** — segundo `it` del mismo `describe`, leyendo `FormularioContacto.module.scss` con `?raw`: el bloque `.grupoConsentimiento` debe declarar
`display: flex;` y `align-items: center;`.

Mensaje de fallo real:

```
Error: no se encontró la cabecera ".grupoConsentimiento {" en el texto
 ❯ cuerpoDelBloque src/components/FormularioContacto.test.tsx:34:11
```

(falla por ausencia del bloque — "no compila/no se encuentra" cuenta como
rojo, Ley 2 de `docs/tdd.md`.)

**VERDE** — se añadió la regla `.grupoConsentimiento { display: flex;
align-items: center; gap: espaciado(8); }` dentro de `.formulario`.

`pnpm exec vitest run src/components/FormularioContacto.test.tsx` → **16/16
verdes**.

### Regresión real descubierta y corregida (mismo lote, mismo escenario @s25)

Al mover el `<a>Aviso legal</a>` a vivir **inline** dentro del texto del
`<label>` (en vez de ser su propia fila a ancho completo), su caja de layout
colapsó al tamaño de su propio texto. La suite completa de Playwright reveló
la regresión real:

```
✘ tests\e2e\accesibilidad.spec.ts:75:3 › @s37 todo objetivo táctil del sitio
  real alcanza el mínimo medido con su rectángulo real › las 6 rutas: cada
  control visible mide >= 24×24 px CSS

Error: [{"ruta":"/GalapavetClinicaVeterinaria/","nombre":"Aviso legal","ancho":81.265625,"alto":21}]
expect(received).toEqual(expected)
- Expected  - 1
+ Received  + 8
+   Object { "alto": 21, "ancho": 81.265625, "nombre": "Aviso legal", ... }
```

Antes del cambio, el enlace "cumplía" el mínimo de 24px solo por accidente
de maquetación (era un elemento de bloque a ancho completo dentro del
flex-column); nunca llevó `area-tactil-minima` explícito. Al pasar a texto
inline dentro de una frase, ese accidente desapareció y el objetivo táctil
real bajó a 81×21px.

**ROJO (tercer ciclo)** — tercer `it` del `describe` @s25: el bloque
`.grupoConsentimiento`, en su regla anidada `a { ... }`, debe incluir
`@include area-tactil-minima` y `display: inline-block;` (el `min-width`/
`min-height` de ese mixin no surte efecto en un elemento puramente inline
sin `display: inline-block`).

Mensaje de fallo real:

```
Error: no se encontró la cabecera "a {" en el texto
 ❯ cuerpoDelBloque src/components/FormularioContacto.test.tsx:34:11
```

**VERDE** — se añadió, anidada dentro de `.grupoConsentimiento`:

```scss
a {
  @include area-tactil-minima;
  display: inline-block;
}
```

`pnpm exec vitest run src/components/FormularioContacto.test.tsx` → **17/17
verdes**.

### Confirmación con navegador real (los 3 aspectos a la vez)

`pnpm run build` (fresco) + `pnpm exec playwright test --workers=1 --reporter=list -g "@s25|@s37"`:

```
✓  tests\e2e\accesibilidad.spec.ts:75:3 › @s37 ... cada control visible mide >= 24×24 px CSS
✓  tests\e2e\geometria-escalas.spec.ts:492:3 › @s25 ... formulario de contacto mide menos de 44px
✓  tests\e2e\geometria-escalas.spec.ts:518:3 › @s25 ... chat de reserva mide menos de 44px
✓  tests\e2e\geometria-escalas.spec.ts:562:3 › @s25 ... casilla de consentimiento ... alineada con la primera línea de su etiqueta
✓  tests\e2e\tokens-aplicados.spec.ts:54:3 › @s25 ...
```

(antes del fix, línea 562: `Error: casilla y=[4821.921875, 4845.921875],
etiqueta y=[4782.921875, 4806.921875] — Expected: <= 4806.921875, Received:
4833.921875`.)

---

## Trazabilidad @s25 → test

- @s25 cláusula "ninguno [chat de reserva] < 44px" → `ReservaChat.test.tsx` describe `@s25 los botones de "Respuestas rápidas" alcanzan la altura mínima de control (44px)` (unitario) + `geometria-escalas.spec.ts:518` (e2e, autoridad final)
- @s25 cláusula "ninguno [formulario de contacto] < 44px" → ya cubierta antes de esta sesión; sigue verde, sin cambios de código
- @s25 cláusula "casilla alineada con la primera línea de su etiqueta" → `FormularioContacto.test.tsx` describe `@s25 la casilla de consentimiento y su etiqueta viven en la misma fila`, its 1 y 2 (unitario, estructura + CSS) + `geometria-escalas.spec.ts:562` (e2e, autoridad final)
- @s25 cláusula "mínimo de área táctil (24px) heredado" → `FormularioContacto.test.tsx`, mismo describe, it 3 (unitario, CSS del enlace) + `accesibilidad.spec.ts:75` (@s37, e2e, autoridad final — regresión detectada y corregida en este mismo lote)

## Alcance respetado

- `src/components/ReservaChat.module.scss` — 1 línea añadida (`min-height`).
- `src/components/ReservaChat.test.tsx` — 1 bloque de test nuevo (`?raw` + `cuerpoDelBloque`).
- `src/components/FormularioContacto.tsx` — restructuración del bloque de consentimiento (casilla + etiqueta + enlace agrupados).
- `src/components/FormularioContacto.module.scss` — nueva regla `.grupoConsentimiento` (con su `a` anidada).
- `src/components/FormularioContacto.test.tsx` — 3 tests nuevos bajo `@s25` (más el helper `?raw`/`cuerpoDelBloque`, ya usado en otros ficheros del repo).

No se tocó `_api.scss` ni el mixin compartido `pildora-filtro`: no hizo
falta — el fix de Defecto 1 vive enteramente en la regla local de
`ReservaChat.module.scss`, y ningún otro uso de `pildora-filtro` (filtros de
Tienda, píldora de categoría de Servicios) quedó afectado (confirmado por
`pnpm exec vitest run` completo en verde).

## Verificación final (evidencia real)

1. `pnpm run build` — verde. CSS servido y comprimido: **7.51 kB** (techo
   8000 B / 7.8125 kB; partía de 7.47 kB, sube 0.04 kB con los 3 defectos
   corregidos).
2. `pnpm exec playwright test --workers=1 --reporter=list` (suite completa,
   109 tests) — **109/109 verdes**, incluida la regresión de `@s37` que este
   mismo lote detectó y corrigió.
3. `pnpm exec vitest run` (suite completa) — **88/88 ficheros, 1227/1227
   tests verdes** (1223 preexistentes + 4 nuevos: 1 en `ReservaChat.test.tsx`,
   3 en `FormularioContacto.test.tsx`).
4. `pnpm run lint` (`oxlint --deny-warnings`) — limpio, sin salida.
5. `pnpm run typecheck` (`tsc -b`) — limpio, sin salida.

Ningún fichero fuera del alcance declarado fue tocado. No hizo falta tocar
`_api.scss` ni `pildora-filtro`, según lo previsto.
