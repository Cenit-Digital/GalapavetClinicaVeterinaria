# Fix — el enlace «Saltar al contenido principal» y la puerta @s40

Feature 24 `rediseno_visual`. Ámbito cerrado: **dos ficheros**,
`src/styles/global.scss` y `tests/e2e/accesibilidad.spec.ts`. Ni `src/App.tsx`,
ni `src/components/Cabecera.module.scss`, ni ningún otro (verificado con
`git diff --stat`: 2 ficheros, 52 inserciones, 6 supresiones).

## 1. El fallo

```
tests/e2e/accesibilidad.spec.ts:272 -> @s40 "al tabular por la página entera
ningún control enfocado queda tapado por la cabecera fija"
Error: "/GalapavetClinicaVeterinaria/": control fuera del área visible —
<a class="salto-contenido" href="#contenido-principal">Saltar al contenido principal</a>
```

El enlace de salto es nuevo en este rediseño (`src/App.tsx:53-55`, junto a
`BarraUrgencias`). Detrás de un único mensaje de error había **dos defectos
distintos superpuestos**, los dos medidos en navegador real (Chromium, `dist/`
servido con `vite preview`, viewport 1280x720, `reducedMotion: 'reduce'`).

## 2. Defecto (A) — carrera de medición en la puerta

Bajo `prefers-reduced-motion: reduce`, `global.scss` (sección D) fija
`transition-duration: 0.01ms` para `*`, `*::before` y `*::after`. La propiedad
de transición efectiva es `all`, así que **también el `transform`** del enlace
transiciona durante ese instante. Medido justo después de
`page.keyboard.press('Tab')`, sin esperar un fotograma:

| lectura | valor medido |
| --- | --- |
| `matches(':focus-visible')` | `true` |
| `getComputedStyle(el).transform` | `matrix(1, 0, 0, 1, 0, -80)` (el valor **anterior**) |
| `getBoundingClientRect()` | `y = -40`, `height = 40` → `y + height = 0` |
| aserción `dentroDelViewport` (`caja.y + caja.height > 0`) | **falla** |

Es decir: la puerta estaba midiendo el estado **previo** a la transición, no el
que percibe la persona usuaria. El defecto no era exclusivo del enlace de
salto: afectaba potencialmente a cualquier parada de tabulación.

### Corrección

Antes de leer el rectángulo de cada parada se espera a la **condición real** —
que no quede ninguna animación en curso —, la misma espera determinista que
`tests/e2e/movimiento.spec.ts:44-45` ya usa y justifica por escrito para @s42:

```ts
await page.waitForFunction(() => document.getAnimations().every((animacion) => animacion.playState !== 'running'))
```

No es un `waitForTimeout` a ciegas, y **no debilita la puerta**: las dos
aserciones (`integramenteBajoLaCabecera === false` y `dentroDelViewport ===
true`) siguen exigiendo exactamente lo mismo; solo dejan de disparar a mitad de
una transición de 0.01ms. Sin reintentos, sin `test.skip`/`test.fixme`, sin
tolerancias nuevas y sin `expect.soft` — `playwright.config.ts` mantiene
`retries: 0`.

## 3. Defecto (B) — solape geométrico real con la cabecera fija

Esperando al estado asentado, el enlace enfocado caía **íntegramente dentro**
del rectángulo de la cabecera fija:

| elemento | x | y | ancho | alto | rango vertical | z-index |
| --- | --- | --- | --- | --- | --- | --- |
| enlace de salto (enfocado) | 8 | 40 | 231.23 | 40 | 40 … 80 | 100 |
| cabecera fija (`<header>`) | 0 | 32 | 1280 | 64 | 32 … 96 | 10 |

`integramenteBajoLaCabecera = true`. Que se pinte por encima (100 > 10) no
arregla nada: la puerta es **geométrica** y el criterio que automatiza es
**WCAG 2.2 SC 2.4.11 Focus Not Obscured (Minimum), nivel AA**, cuyo documento
de entendimiento nombra literalmente las cabeceras fijas («sticky headers»)
como el caso a evitar. Un enlace de salto que aterriza encima de la cabecera es
exactamente ese patrón.

Origen del número: `global.scss` declaraba
`inset-block-start: calc(var(--altura-barra-urgencias) + espaciado(8))` =
32 + 8 = **40px**, y la cabecera ocupa de 32px a 96px
(`--altura-barra-urgencias` 32px + `--altura-cabecera` 64px).

### Corrección

El enlace se coloca **por debajo de la cabecera**, derivando la posición de las
**mismas variables** que ya dimensionan el documento — nunca de un número
escrito a mano, la misma disciplina que `scroll-padding-top` (sección D,
técnica C43 del W3C) y que el `padding-block-start` de `#root`:

```scss
.salto-contenido {
  --desplazamiento-al-enfocar: calc(var(--altura-barra-urgencias) + var(--altura-cabecera) + #{espaciado(8)});

  inset-block-start: 0;
  transform: translateY(-100%);

  &:focus-visible { transform: translateY(var(--desplazamiento-al-enfocar)); }
  &:focus         { transform: translateY(var(--desplazamiento-al-enfocar)); }
}
```

32px de barra + 64px de cabecera + 8px de hueco = **104px**, justo por debajo
de los 96px en los que la cabecera termina.

**Por qué cambia también la ocultación.** El estado oculto era
`translateY(-200%)` sobre un anclaje de 40px: solo escondía el enlace porque
40px de anclaje y 40px de altura casualmente cuadraban (40 − 80 = −40, borde
inferior exactamente en 0). Movido el anclaje a 104px, ese mismo `-200%` lo
habría dejado **visible** en `24 … 64`. Se ancla el enlace al borde superior
del área visible (`inset-block-start: 0`) y se esconde con
`translateY(-100%)`: así el estado oculto es exactamente su propia altura por
encima del área visible, **mida lo que mida el enlace**, y el estado enfocado
es un desplazamiento que sale de las variables. Un solo valor
(`--desplazamiento-al-enfocar`) alimenta las dos reglas de foco, para no
escribir dos veces el mismo cálculo.

Lo prohibido, no hecho: no se ha tocado el z-index, ni la cabecera, ni ningún
fichero fuera de los dos del ámbito.

## 4. Antes / después medidos (navegador real, estado asentado)

Cabecera fija en las tres mediciones: `x = 0, y = 32, w = 1280, h = 64`
(rango vertical **32 … 96**).

| estado del enlace | ANTES | DESPUÉS |
| --- | --- | --- |
| en reposo (sin foco) | `x=8, y=-40, w=231.23, h=40` → −40 … 0 (oculto) | `x=8, y=-40, w=231.23, h=40` → −40 … 0 (oculto) |
| enfocado, medido SIN esperar | `transform: matrix(…, -80)`; `y=-40, h=40` → −40 … 0 | `transform: matrix(…, -40)`; `y=-40, h=40` → −40 … 0 |
| enfocado, ASENTADO | `transform: matrix(…, 0)`; `x=8, y=40, w=231.23, h=40` → **40 … 80** | `transform: matrix(…, 104)`; `x=8, y=104, w=231.23, h=40` → **104 … 144** |
| `integramenteBajoLaCabecera` (asentado) | **`true`** (fallo) | **`false`** (correcto) |
| `dentroDelViewport` (asentado) | — | `true` |
| tras `blur()` (asentado) | — | `transform: matrix(…, -40)`; `y=-40` → vuelve a ocultarse |

Invariantes que se conservan, comprobadas en la misma sesión de medida:

- sigue **oculto** hasta recibir el foco (y vuelve a ocultarse al perderlo);
- sigue siendo el **primer tabulable** del documento (la primera pulsación de
  `Tab` en la portada lo enfoca: `document.activeElement` es
  `<a class="salto-contenido" …>`);
- sigue **sin superponerse a la barra de aviso superior** (esta ocupa 0 … 32;
  el enlace enfocado empieza en 104).

CSS realmente generado (`dist/assets/index-BkHKufXS.css`, tras
`pnpm run build`):

```css
.salto-contenido{--desplazamiento-al-enfocar:calc(var(--altura-barra-urgencias) + var(--altura-cabecera) + 8px);z-index:100;background-color:var(--color-fondo);color:var(--color-tinta);border-radius:12px;padding:8px 12px;position:fixed;inset-block-start:0;inset-inline-start:8px;transform:translateY(-100%)}
.salto-contenido:focus-visible,.salto-contenido:focus{transform:translateY(var(--desplazamiento-al-enfocar))}
```

## 5. Verificación — salida literal de los cuatro comandos

### 1) `pnpm exec vitest run src/styles src/lib/diseno/hojaGlobal.test.ts`

```
===== 1) vitest =====

 RUN  v4.1.10 C:/Users/vhurt/OneDrive/Escritorio/Proyectos/CenitDigitalProyectosCodigo/GalapavetClinicaVeterinaria


 Test Files  4 passed (4)
      Tests  84 passed (84)
   Start at  19:59:10
   Duration  2.35s (transform 666ms, setup 1.33s, import 941ms, tests 53ms, environment 4.51s)

EXIT_1=0
```

### 2) `pnpm run build`

```
===== 2) build =====

> galapavet-web@0.0.0 build C:\Users\vhurt\OneDrive\Escritorio\Proyectos\CenitDigitalProyectosCodigo\GalapavetClinicaVeterinaria
> tsc -b && vite build --base=/GalapavetClinicaVeterinaria/ && node --experimental-strip-types --disable-warning=ExperimentalWarning tools/puerta-terceros.ts

vite v8.2.1 building client environment for production...
transforming...✓ 144 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   4.14 kB │ gzip:  1.90 kB
dist/assets/index-BkHKufXS.css   55.96 kB │ gzip:  7.20 kB
dist/assets/index-D_GO93Dj.js   283.05 kB │ gzip: 89.09 kB

✓ built in 862ms
✓ Puerta de terceros: 3 archivo(s) de "dist/" inspeccionados, ninguna referencia a un dominio de terceros.
EXIT_2=0
```

Exit 0 y sin avisos.

### 3) `pnpm exec playwright test tests/e2e/accesibilidad.spec.ts --workers=1 --reporter=list`

```
===== 3) playwright accesibilidad =====

Running 14 tests using 1 worker

  ✓   1 tests\e2e\accesibilidad.spec.ts:25:3 › @s36 el análisis automático no reporta ninguna violación en ninguna de las seis rutas del sitio real › las 5 etiquetas acumulativas, sin mecanismo de opciones, 0 violaciones en las 6 rutas (ejecuta @s2 de accesibilidad.feature y @s28 de sistema_de_diseno_visual.feature) (4.1s)
  ✓   2 tests\e2e\accesibilidad.spec.ts:75:3 › @s37 todo objetivo táctil del sitio real alcanza el mínimo medido con su rectángulo real › las 6 rutas: cada control visible mide >= 24×24 px CSS (ejecuta @s29 de sistema_de_diseno_visual.feature) (3.4s)
  ✓   3 tests\e2e\accesibilidad.spec.ts:98:3 › @s38 el indicador de foco del sitio real tiene perímetro y contraste suficientes entre sus dos estados › las 6 rutas: perímetro >= 2px CSS y ratio >= 3 entre foco y sin foco, ningún control suprime el contorno sin sustituto (ejecuta @s30/@s31 de sistema_de_diseno_visual.feature y la 1ª mitad de @s18 de accesibilidad.feature) (3.5s)
  ✓   4 tests\e2e\accesibilidad.spec.ts:218:3 › @s39 el anillo de foco contrasta con los dos fondos que tiene al lado, no solo con uno › las 6 rutas: ratio >= 3 contra el fondo del propio control y contra el de su superficie (ejecuta la 2ª mitad de @s18 de accesibilidad.feature) (2.9s)
  ✓   5 tests\e2e\accesibilidad.spec.ts:272:3 › @s40 al tabular por la página entera ningún control enfocado queda tapado por la cabecera fija › las 6 rutas: en cada parada, parte del control queda fuera de la cabecera y dentro del viewport (ejecuta @s17 de accesibilidad.feature y @s32 de sistema_de_diseno_visual.feature) (9.1s)
  ✓   6 tests\e2e\accesibilidad.spec.ts:390:3 › El punto de corte de la navegación (1024/1023) coincide en JS y CSS en el navegador real (ejecuta @s27 de sistema_de_diseno_visual.feature) › a 1024px la navegación horizontal es visible; a 1023px, el botón de menú (232ms)
  ✓   7 tests\e2e\accesibilidad.spec.ts:401:3 › El punto de corte de la navegación (1024/1023) coincide en JS y CSS en el navegador real (ejecuta @s27 de sistema_de_diseno_visual.feature) › ningún elemento de la cabecera se desborda ni se superpone con otro, ni a 1024px ni a 1023px (308ms)
  ✓   8 tests\e2e\accesibilidad.spec.ts:435:5 › @s41 la jerarquía de encabezados de cada ruta es correcta y sin saltos › Landing (/GalapavetClinicaVeterinaria/): exactamente 1 h1, sin saltos de nivel, sin texto vacío (179ms)
  ✓   9 tests\e2e\accesibilidad.spec.ts:435:5 › @s41 la jerarquía de encabezados de cada ruta es correcta y sin saltos › Campañas (/GalapavetClinicaVeterinaria/campanas): exactamente 1 h1, sin saltos de nivel, sin texto vacío (151ms)
  ✓  10 tests\e2e\accesibilidad.spec.ts:435:5 › @s41 la jerarquía de encabezados de cada ruta es correcta y sin saltos › Ficha de campaña (/GalapavetClinicaVeterinaria/campanas?campana=vacunaciones): exactamente 1 h1, sin saltos de nivel, sin texto vacío (172ms)
  ✓  11 tests\e2e\accesibilidad.spec.ts:435:5 › @s41 la jerarquía de encabezados de cada ruta es correcta y sin saltos › Blog (/GalapavetClinicaVeterinaria/blog): exactamente 1 h1, sin saltos de nivel, sin texto vacío (176ms)
  ✓  12 tests\e2e\accesibilidad.spec.ts:435:5 › @s41 la jerarquía de encabezados de cada ruta es correcta y sin saltos › Artículo del blog (/GalapavetClinicaVeterinaria/blog/demo-1): exactamente 1 h1, sin saltos de nivel, sin texto vacío (172ms)
  ✓  13 tests\e2e\accesibilidad.spec.ts:435:5 › @s41 la jerarquía de encabezados de cada ruta es correcta y sin saltos › Tienda (/GalapavetClinicaVeterinaria/tienda): exactamente 1 h1, sin saltos de nivel, sin texto vacío (170ms)
  ✓  14 tests\e2e\accesibilidad.spec.ts:458:3 › @s41 la jerarquía de encabezados de cada ruta es correcta y sin saltos › el recuento de rutas efectivamente comprobadas es exactamente 6 (1ms)

  14 passed (32.3s)
EXIT_3=0
```

### 4) `pnpm run lint && pnpm run typecheck`

```
===== 4) lint + typecheck =====

> galapavet-web@0.0.0 lint C:\Users\vhurt\OneDrive\Escritorio\Proyectos\CenitDigitalProyectosCodigo\GalapavetClinicaVeterinaria
> oxlint --deny-warnings


> galapavet-web@0.0.0 typecheck C:\Users\vhurt\OneDrive\Escritorio\Proyectos\CenitDigitalProyectosCodigo\GalapavetClinicaVeterinaria
> tsc -b

EXIT_4=0
```

## 6. Comprobaciones adicionales (fuera de las cuatro obligatorias)

Como el cambio toca la hoja **global** del documento, se corrió además todo lo
que podía verse afectado, para descartar regresiones fuera del ámbito del
fallo:

- `pnpm exec vitest run` → **83 ficheros / 1008 tests, todos verdes**.
- `pnpm exec playwright test --workers=1 --reporter=list` (suite e2e completa,
  no solo `accesibilidad.spec.ts`) → **83 tests, todos verdes**. Incluye
  `css-presupuesto.spec.ts` (@s49, techo de 8000 B de CSS servido, que el nuevo
  custom property no compromete), `movimiento.spec.ts` (@s42/@s43),
  `rediseno-visual.spec.ts` y `layout.spec.ts`.

## 7. Veredicto

**VERDE.** Los dos defectos, corregidos por separado y por su causa:
(B) el enlace enfocado ya no solapa la cabecera fija, y su posición sale de
`--altura-barra-urgencias` + `--altura-cabecera`, no de un número a mano;
(A) la puerta @s40 mide el estado asentado, sin haber relajado ni una sola
aserción.
