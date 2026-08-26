# TDD — `despliegue_github_pages` (feature 23)

> Recorrido de `features/despliegue_github_pages.feature`, `@s1`..`@s17`, en
> orden, TDD estricto (un test a la vez, verificado en rojo antes de cada
> implementación mínima). Contrato aprobado el 25/08/2026.
>
> **Estado: BLOQUEADO.** Los 17 escenarios están implementados y verificados
> tal y como el `.feature` los describe literalmente (@s1-@s16 en verde,
> @s17 es la propia ejecución completa de la puerta). Pero al verificar en
> navegador real sobre el `dist/` con el `--base` REAL (Decisión 51, el nivel
> de verificación que el propio contrato exige), aparece un hallazgo real que
> **ningún escenario aprobado cubre**: las imágenes servidas desde `public/img/`
> con un `src` literal (`/img/...`), fuera de los 4 ficheros de enlace que
> cubre la Decisión 48, dan 404 bajo el subpath — rompiendo 10 tests del
> propio gate de navegador real, entre ellos 4 de los "65 heredados de
> `identidad_visual`" que el encargo exige mantener en verde. Ver la sección
> "HALLAZGO BLOQUEANTE", más abajo, antes de nada.

## Escenarios recorridos

`@s1` build fija `--base` | `@s2` `BASE_URL` sigue en `/` en test | `@s3`
`App.tsx` `basename` | `@s4`/`@s5`/`@s6` `hrefDeDestino` (módulo puro) |
`@s7`/`@s8` los 4 ficheros con enlaces literales adoptan `hrefDeDestino` |
`@s9`/`@s10` gemelo puro de la técnica `rafgraph/spa-github-pages` | `@s11`
`public/404.html` + `index.html` contienen la técnica real | `@s12`
`%BASE_URL%` en `index.html` | `@s13`-`@s16` navegador real / artefacto
`dist/` | `@s17` la puerta completa `pnpm run test:e2e` (no añade un test
propio: es la ejecución completa la evidencia).

## Nota de coordinación de procesos (antes de empezar)

Verificado con `Get-CimInstance Win32_Process` que había procesos activos de
OTRO agente (`playwright test tests/e2e/accesibilidad.spec.ts
tests/e2e/movimiento.spec.ts` + `vite preview --port 4173 --strictPort` + un
`vitest run`) trabajando la feature `accesibilidad` en paralelo. Todo el
trabajo de Vitest puro (@s1-@s12) no toca `dist/` ni el puerto 4173, así que
procedió sin colisión. Antes de tocar `dist/`/Playwright (@s13-@s17) se
repitió la comprobación de procesos y de `git status` — sin procesos activos
de otro agente — y se procedió. `tests/e2e/accesibilidad.spec.ts` y
`tests/e2e/movimiento.spec.ts` seguían con cambios sin commitear de esa otra
sesión (columna "M" en `git status`): los edité igualmente, con ediciones
quirúrgicas mínimas (una línea de import + sustituir el literal `'/'` por la
constante del subpath en cada `page.goto`), no reescrituras completas, para
minimizar la superficie de colisión si esa sesión retoma el fichero. Repetido
el chequeo de procesos justo antes de cada corrida real de Playwright.

## Ciclos Rojo-Verde-Refactor

### @s1 — el script "build" fija el subpath, y solo ahí
- **ROJO**: `src/configuracion-build.test.ts` nuevo, lee `package.json`/`vite.config.ts`
  con `?raw`. Falla: `scripts.build` no contiene `--base=...`.
- **VERDE**: `package.json` → `"build": "tsc -b && vite build --base=/GalapavetClinicaVeterinaria/ && node ..."`.
  `vite.config.ts` NO se toca (verificado en el propio test: no declara `base:`).
- Verificado en vivo el caso límite 7 del encargo: `vite.config.ts` nunca
  declara `base`, así que `pnpm run dev`/`vitest run` no cambian.

### @s2/@s4/@s5/@s6 — `hrefDeDestino(destino, base)`
- **ROJO**: `src/lib/hrefDeDestino.test.ts` nuevo — import falla (módulo no
  existe, cuenta como rojo).
- **VERDE**: `src/lib/hrefDeDestino.ts` — reutiliza `esAncla` de
  `Cabecera-logica.ts`; `base` por defecto lee `import.meta.env.BASE_URL`
  **una sola vez, en este módulo** (Decisión 48 descarta leerlo dentro de
  cada componente). `sinBarraFinal(base)` evita la doble barra sin
  necesidad de tocar `destino` (que siempre empieza por `/`).
- 16/16 tests verdes: los 6 pares (destino, base) de @s4, la ausencia de
  `//` de @s5, los 3 destinos ancla de @s6, y @s2 confirmando
  `import.meta.env.BASE_URL === '/'` en Vitest.

### @s3 — `App.tsx` monta `BrowserRouter` con `basename`
- **ROJO**: `src/App-basename.test.ts` nuevo, lee `App.tsx` con `?raw`.
  **Primer intento con regex ingenua dio un falso rojo persistente**: el
  propio comentario JSDoc de `App.tsx:42` contiene el literal
  `` `<BrowserRouter>` `` en prosa, y el regex lo contaba como una segunda
  declaración sin `basename`. Corregido stripando comentarios de bloque
  antes de matchear (mismo patrón que `documento-iconos.test.ts` con
  comentarios HTML).
- **VERDE**: `App.tsx` → `<BrowserRouter basename={import.meta.env.BASE_URL}>`.
- **Verificación explícita pedida por el encargo**: re-corrida completa de
  `src/App.test.tsx` (17 tests, `<App/>` real con `BrowserRouter` real, no
  `MemoryRouter`) tras el cambio — **17/17 verdes**, confirmando en vivo que
  `basename="/"` en jsdom es equivalente a no declarar `basename` (no dado
  por hecho).
- oxlint no resuelve el *export* por defecto de un `import ... from
  './App.tsx?raw'` estático (sí lo resuelve para `.html`/`.ts`, verificado
  con `documento.test.ts`/`configuracion-build.test.ts`, que pasan lint tal
  cual) — cambiado a `import.meta.glob(..., {query:'?raw', import:'default'})`,
  mismo patrón que `src/styles/tokens-api.test.ts`.

### @s7/@s8 — los 4 ficheros adoptan `hrefDeDestino`
- **ROJO**: `src/enlaces-internos-hrefDeDestino.test.ts` nuevo — 5/12 tests
  rojos (ninguno de los 4 ficheros llama a `hrefDeDestino` todavía; el
  manejador del panel móvil sigue pasando `destino` crudo a `pushState`).
- **VERDE**: `Cabecera.tsx` (nav de escritorio + panel móvil), `CampanasPortada.tsx`
  (las 2 apariciones de `"/campanas"`), `PaginaNoEncontrada.tsx` (`"/"`)
  llaman a `hrefDeDestino` directamente. `PieDePagina.tsx` añade
  `resolverDestinos(enlaces)` y lo aplica **solo** a `ENLACES_CLINICA`/
  `ENLACES_CONTENIDO` — **decisión de diseño explícita**: la columna
  "Contacto" (`enlacesContacto`, construida por `construirEnlacesContacto`)
  mezcla `tel:+34...` ya resueltos con el ancla `#contacto`; un `tel:` no
  es ancla (`esAncla` devuelve `false`) así que aplicarle `hrefDeDestino`
  lo habría prefijado con el subpath, rompiendo `PieDePagina.test.tsx:105-107`
  (`tel:+34910829267` ya `done`, no debía reescribirse — Decisión 47). Los
  enlaces legales (externos, `target=_blank`) tampoco pasan por la función,
  verificado con test propio.
- Verificado sin regresión: `Cabecera.test.tsx`, `PieDePagina.test.tsx`,
  `CampanasPortada.test.tsx`, `App.test.tsx` — **80/80 verdes** (base sigue
  siendo `/` en test, así que `hrefDeDestino` es la identidad para todo
  destino no-ancla: ningún `href` literal ya `done` cambia).

### @s9/@s10 — gemelo puro de la técnica `rafgraph/spa-github-pages`
- **Antes de escribir nada**: se descargó el script REAL del repositorio
  público (`gh-pages` es su rama por defecto, no `main`) —
  `https://raw.githubusercontent.com/rafgraph/spa-github-pages/gh-pages/404.html`
  e `.../index.html` — para no inventar el algoritmo de memoria, tal y como
  exige el encargo. Verificado a mano con 3 rutas (aritmética completa en el
  historial de esta sesión) antes de escribir el primer test.
- **ROJO**: `src/lib/tecnicaSpaGithubPages.test.ts` nuevo — import falla.
- **VERDE**: `src/lib/tecnicaSpaGithubPages.ts` — `codificarRedireccion404`/
  `decodificarRedireccion404`, `SEGMENTOS_DE_SUBPATH_A_CONSERVAR = 1`. La
  decodificación usa el `URL` global (disponible en Node/jsdom/navegador,
  sin I/O) para reparsear pathname/search/hash del string final — el mismo
  reparseo implícito que hace el navegador cuando `history.replaceState`
  recibe una cadena.
- 8/8 tests verdes: @s9 (conserva el segmento), @s10 con las 3 rutas
  literales del `.feature` (recarga simple, deep-link con query+hash, ruta
  inexistente) — **más 2 tests de generalización dentro del mismo escenario**
  (TDD: "un escenario con varias aristas puede necesitar más de un ciclo"):
  una query con dos parámetros unidos por `&` (verifica que el
  `~and~`/`replace` no confunde el separador interno de la query con el que
  añade la propia codificación) y el caso "sin marca de codificación no
  cambia nada" (la guarda `search[1] === '/'`, que protege cualquier carga
  normal que no venga de un 404).

### @s11 — `public/404.html` e `index.html` contienen la técnica real
- **ROJO**: `src/documento-github-pages.test.ts` nuevo — `public/404.html`
  no existe (falla el import `?raw`).
- **VERDE**: `public/404.html` creado, puerto a puerto igual al script
  descargado de la fuente real salvo `pathSegmentsToKeep = 1` (era `0` en
  el ejemplo genérico del README, la propia fuente documenta que un sitio
  de proyecto usa `1`). `index.html` recibe el segundo script (decodificación),
  colocado ANTES de `<script type="module" src="/src/main.tsx">`.
- 5/5 tests verdes, incluida la comprobación de que `public/404.html` no
  aparece como `input` de ningún `vite.config.ts`.

### @s12 — `%BASE_URL%` en `index.html`
- **ROJO**: `src/documento-base-url.test.ts` nuevo — 3/4 rojos (favicon,
  apple-touch-icon y los 2 preloads seguían con ruta absoluta literal).
- **VERDE**: los 5 `href` de `index.html` (favicon.ico, favicon-32.png,
  apple-touch-icon.png, 2 preloads de fuente) pasan a `%BASE_URL%...`.
- **HALLAZGO documentado, no silencioso**: el `.feature` dice "el recuento
  de referencias... es exactamente 4", pero el documento real declara DOS
  `rel="icon"` (`favicon.ico` + `favicon-32.png`, Decisión 36) — 5
  referencias reales, no 4. Confirmado que es un desajuste del propio
  `.feature` (no un error mío) porque **@s14, en el mismo contrato**, pide
  explícitamente que las CINCO respondan 200 bajo el subpath ("recuento de
  ficheros... es exactamente 5") — dejar `favicon-32.png` sin `%BASE_URL%`
  lo habría roto en producción, violando el propio @s14. Corregido el
  recuento en mi test (documentado en su cabecera), pendiente de que
  `craftsman_lead`/`gherkin_author` reconcilien el "4" de @s12 a "5" en el
  `.feature`, mismo patrón que otras reconciliaciones de este proyecto
  (`@s34` de `sistema_de_diseno_visual`, "ocho dígitos" de `pie_de_pagina`).
- **Regresión detectada y corregida** (necesaria, no una desviación):
  `src/documento-iconos.test.ts` (ya `done`, de `identidad_visual`) afirmaba
  los 3 `href` como ruta absoluta literal — se rompió en rojo al cambiar
  `index.html` (verificado, no asumido) y se actualizó a los nuevos
  literales `%BASE_URL%...`, con nota explicando el porqué en la cabecera
  del fichero. Mismo criterio que Decisión 47 aplicado correctamente: esa
  decisión protege los `href` COMPUTADOS en tiempo de ejecución (que no
  cambian, `BASE_URL` sigue siendo `/` en test); NO protege el TEXTO FUENTE
  literal de `index.html`, que sí cambia porque ese es exactamente el punto
  de @s12.

### @s13-@s16 — navegador real sobre `dist/` con `--base` real
- Adaptada la infraestructura, no el `Given/When/Then` de ningún test
  heredado (mismo criterio ya usado en `pagina_tienda`/`ensamblaje_landing`
  para ajustes de fontanería):
  - `tests/e2e/rutas.ts`: nace `SUBPATH_DE_PRODUCCION = '/GalapavetClinicaVeterinaria'`,
    único literal de este lado (mismo principio que Decisión 47 para el lado
    de producción); `RUTAS_DEL_INVENTARIO` prefija sus 6 rutas.
  - `playwright.config.ts`: `URL_BASE` pasa a incluir el subpath (con barra
    final, para que el *health check* del propio `webServer` compruebe la
    URL real); `webServer.command` añade `--base=/GalapavetClinicaVeterinaria/`
    a `vite preview` (Decisión 51: verificación en dos niveles, ambos
    comandos con el mismo `--base`).
  - **Verificado en vivo y documentado** (con `node -e "new URL(...)"`) que
    con un `baseURL` que INCLUYE el subpath, un `page.goto('/campanas')`
    (barra inicial) se resuelve contra la RAÍZ del origen, descartando el
    subpath de la base — comportamiento estándar WHATWG URL, no un bug de
    Playwright. Por eso las 8 specs heredadas (`accesibilidad`, `imagenes`,
    `css-presupuesto`, `layout`, `movimiento`, `red-limpia`, `tipografia`,
    `tokens-aplicados`) se editaron para anteponer `SUBPATH_DE_PRODUCCION`
    a cada literal `'/...'` de `page.goto`/`request.get` (23 líneas en 8
    ficheros), sin tocar ningún `expect`/aserción de comportamiento.
- **`src/lib/diseno/puertaNavegadorReal.test.ts` (Vitest, ya `done`)**
  afirmaba el TEXTO REAL antiguo de `playwright.config.ts` (`command:
  'pnpm run build && pnpm exec vite preview --port 4173 --strictPort'`,
  sin `--base`) — detectado por `bash bin/harness init`, no solo por
  Playwright. Corregido el literal esperado, mismo criterio que el ajuste
  de `documento-iconos.test.ts`.
- **`tests/e2e/despliegue-subpath.spec.ts` (nuevo)**: @s13 (árbol completo
  bajo el subpath), @s14 (favicon/apple-touch-icon/2 preloads bajo el
  subpath, y el documento real NO pide la ruta sin subpath), @s15 (`dist/404.html`
  idéntico carácter a carácter a `public/404.html`, leído del sistema de
  ficheros, sin servidor de por medio), @s16 (informe de la puerta de
  terceros sobre ese mismo `dist/`, reutilizando `ejecutarPuertaDeTerceros`
  real — no reinventado — y confirmando que ni `dist/404.html` ni el script
  de `dist/index.html` añaden ningún dominio nuevo).
- **Resultado, corrida aislada de `despliegue-subpath.spec.ts` (7 tests)**:
  @s14 (2/2), @s15 (1/1), @s16 (3/3) **verdes**. @s13 **rojo** — ver
  "HALLAZGO BLOQUEANTE".
- **Resultado, corrida de la puerta COMPLETA (`pnpm run test:e2e`, 73
  tests: 65 heredados + 7 nuevos + 1 ya existente de `identidad_visual`
  reajustado)**: **63 passed, 10 failed**. Los 10 son: `@s13` (nuevo, este
  fichero), `@s27` (`imagenes.spec.ts`, las 6 rutas), `@s29` (`imagenes.spec.ts`,
  og:image), `@s33`/`@s34` (`red-limpia.spec.ts`) — **todos por la MISMA
  causa raíz** (ver abajo), salvo `@s29` que tiene una causa raíz relacionada
  pero distinta (coordinación con `og:image`, ya anticipada por el encargo).

## HALLAZGO BLOQUEANTE — imágenes con `src` literal fuera de alcance de esta feature

**Qué se midió**: al construir con `--base=/GalapavetClinicaVeterinaria/`
real y servir con `vite preview --base=...` real (exactamente el nivel de
verificación que Decisión 51 exige), **cualquier `<img src="/img/...">`
cuyo literal NO pase por `hrefDeDestino`** da 404, porque el fichero real
vive en `dist/img/...` pero ahora se sirve bajo
`/GalapavetClinicaVeterinaria/img/...`. Confirmado con la consola real del
navegador (`"Failed to load resource: the server responded with a status of
404 (Not Found)"`), no una suposición.

**Por qué es bloqueante y no algo que yo pueda arreglar dentro de esta
feature**: el `.feature` aprobado (`features/despliegue_github_pages.feature`)
solo menciona 3 clases de referencia interna que necesitan resolución de
base: (a) el flag `--base` de Vite; (b) los 4 ficheros con `<a href>`
literal (Decisión 48, `hrefDeDestino`); (c) las 4 referencias de `public/`
escritas a mano en `index.html` (Decisión 50, `%BASE_URL%`). Grepeado el
`.feature` completo: la palabra "imagen" aparece **una sola vez**, en la
PREGUNTA ABIERTA 2, y es sobre `og:image` (ya coordinado, ver más abajo) —
ningún escenario de los 17 aprobados menciona `<img src>` de componentes ni
de los ficheros de datos. Este es exactamente el patrón que ya vivió esta
propia feature en su origen ("un `tdd_craftsman` lanzado directamente… se
negó, correctamente: no había ningún `.feature` aprobado del que derivar
tests") y el mismo patrón que dio origen a `sistema_de_diseno_visual`/
`identidad_visual` (un hueco estructural invisible hasta la primera
verificación real en navegador). Inventar aquí el arreglo violaría
exactamente la regla de mi propio rol: "Si un escenario no se puede
satisfacer sin desviarse del `.feature`, paras y pides cambios al contrato —
no inventas comportamiento." Y además, la propia feature en curso exige
explícitamente en su criterio de aceptación ("ni un solo test existente...
roto por el cambio") una condición que **entra en contradicción interna**
con lo que exige @s1 tal cual está escrito: aplicar el flag `--base` (@s1)
rompe 4 de los 65 tests heredados, y la única forma de que ambos convivan es
código de producción que NINGÚN escenario aprobado pide.

**Alcance exacto del hallazgo** (grep exhaustivo de `src/**/*.{ts,tsx}`,
excluidos tests, por el patrón `/img/...` literal):

| Fichero | Campo/atributo | Cuántas rutas | Feature que lo creó (ya `done`) |
| --- | --- | --- | --- |
| `src/components/PieDePagina.tsx:13` | `SRC_LOGO` (`<img src>`) | 1 | `pie_de_pagina` (13) |
| `src/data/galeria.ts:21-26` | `src` (consumido por `Galeria.tsx`) | 6 | `galeria` (8) |
| `src/data/campanas.ts:67,74,81` | `imagen` (consumido por `CampanasPortada.tsx`, ya usa `hrefDeDestino` para el `href` del `<a>` pero NO para el `src` del `<img>` interior) | 3 | `campanas_portada` (9) / `pagina_campanas` (16) |
| `src/data/blog.ts:61-124` | `imagen` (consumido por `PaginaBlog.tsx`) | 6 | `pagina_blog` (17) |
| `src/data/tienda.ts:39-81` | `imagen` (consumido por `PaginaTienda.tsx`) | 8 | `pagina_tienda` (18) |
| `src/components/MetadatosPagina.tsx:43` | `RUTA_IMAGEN_OPEN_GRAPH` (og:image) | 1 | `seo_estructura` (15) — **ya identificado por separado, ver siguiente sección** |

27 rutas de imagen + 1 de `og:image`, repartidas en **6 features ya `done`**.
Arreglarlo bien exige el mismo patrón que Decisión 48 ya estableció para
`<a href>` (una función pura parametrizada por base, o generalizar
`hrefDeDestino` para servir a ambos casos), pero aplicado a un conjunto de
ficheros mucho mayor que los 4 que este `.feature` aprobó — una decisión de
alcance que le corresponde a `craftsman_lead` (posiblemente una enmienda a
este mismo `.feature`, dado que es el mismo mecanismo, o una feature
pequeña dedicada, dado que toca 6 features `done` distintas).

**Qué SÍ verifiqué que sigue correcto**: la puerta de terceros
(`tools/puerta-terceros.ts`) sigue en 0 hallazgos — estos son 404 de
**mismo origen**, no peticiones a terceros, así que `pnpm run build` termina
con código 0 igualmente (verificado en vivo). `bin/harness init` está
**100% verde** (966/966 Vitest, lint y typecheck limpios) porque el arnés
de esta sesión NUNCA ejecuta Playwright como parte de `commands.test`
(Decisión 38 de `identidad_visual`, ya vigente).

**Tests que quedan en rojo por este hallazgo** (ninguno reescrito para
esconderlo — es la puerta haciendo exactamente su trabajo):
- `tests/e2e/despliegue-subpath.spec.ts` @s13 (nuevo, mío): la cláusula "no
  se registra ningún mensaje de error en la consola" es literal del
  `.feature` y no debe suavizarse.
- `tests/e2e/imagenes.spec.ts` @s27 (las 6 rutas — `Galeria`/`CampanasPortada`/
  `PieDePagina` referencian imágenes con `naturalWidth === 0`, evidencia
  del propio 404).
- `tests/e2e/red-limpia.spec.ts` @s33/@s34 (ninguna respuesta >= 400 /
  ningún error de consola) — mismos 404, vistos desde otro ángulo.

## Coordinación con el PENDIENTE 7 de `identidad_visual` / `og:image` (PREGUNTA ABIERTA 2)

Confirmado en vivo: `src/components/MetadatosPagina.tsx:36,43-44` declara
`DOMINIO_SITIO = 'https://cenit-digital.github.io'` (SIN el subpath) y
`RUTA_IMAGEN_OPEN_GRAPH = '/img/og/galapavet.png'`, componiendo
`https://cenit-digital.github.io/img/og/galapavet.png` — **sin el subpath**.
Con `--base` ya real, el fichero físico se sirve (tanto en `vite preview
--base=...` local como en GitHub Pages real) bajo
`/GalapavetClinicaVeterinaria/img/og/galapavet.png`, así que esa URL
absoluta hoy **apunta a un 404 real**, confirmado con
`tests/e2e/imagenes.spec.ts` @s29 en rojo (mismo run que reveló el hallazgo
de arriba). **No he tocado `MetadatosPagina.tsx`/`DOMINIO_SITIO`**, tal y
como me indicó expresamente el encargo — este hallazgo confirma
exactamente lo que el encargo anticipaba como posible ("si detectas que
ahora SÍ haría falta que `og:image` incluyera el subpath... documenta el
hallazgo, no lo toques"). Queda a `craftsman_lead` decidir cómo se
coordina con el hallazgo más amplio de arriba (es el MISMO mecanismo:
`DOMINIO_SITIO` necesitaría convertirse en `DOMINIO_SITIO + subpath`, la
misma resolución de base que el resto de las 27 imágenes).

## Trazabilidad @s → test

| Escenario | Test(s) | Estado |
| --- | --- | --- |
| @s1 | `src/configuracion-build.test.ts` (3 tests) | ✅ verde |
| @s2 | `src/lib/hrefDeDestino.test.ts` — describe `@s2` (4 tests) | ✅ verde |
| @s3 | `src/App-basename.test.ts` (2 tests) + `src/App.test.tsx` (17, sin regresión) | ✅ verde |
| @s4 | `src/lib/hrefDeDestino.test.ts` — describe `@s4` (7 tests) | ✅ verde |
| @s5 | `src/lib/hrefDeDestino.test.ts` — describe `@s5` (1 test) | ✅ verde |
| @s6 | `src/lib/hrefDeDestino.test.ts` — describe `@s6` (4 tests) | ✅ verde |
| @s7 | `src/enlaces-internos-hrefDeDestino.test.ts` — describe `@s7` (9 tests) | ✅ verde |
| @s8 | `src/enlaces-internos-hrefDeDestino.test.ts` — describe `@s8` (2 tests) | ✅ verde |
| @s9 | `src/lib/tecnicaSpaGithubPages.test.ts` — describe `@s9` (2 tests) | ✅ verde |
| @s10 | `src/lib/tecnicaSpaGithubPages.test.ts` — describe `@s10` (6 tests) | ✅ verde |
| @s11 | `src/documento-github-pages.test.ts` (5 tests) | ✅ verde |
| @s12 | `src/documento-base-url.test.ts` (4 tests) — recuento corregido a 5, documentado | ✅ verde |
| @s13 | `tests/e2e/despliegue-subpath.spec.ts` — describe `@s13` (1 test) | 🔴 ROJO — hallazgo bloqueante (imágenes fuera de alcance) |
| @s14 | `tests/e2e/despliegue-subpath.spec.ts` — describe `@s14` (2 tests) | ✅ verde |
| @s15 | `tests/e2e/despliegue-subpath.spec.ts` — describe `@s15` (1 test) | ✅ verde |
| @s16 | `tests/e2e/despliegue-subpath.spec.ts` — describe `@s16` (3 tests) | ✅ verde |
| @s17 | ejecución completa de `pnpm run test:e2e` (no añade test propio) | 🔴 ROJO (10/73, todos rastreados a los 2 hallazgos de arriba) |

## Verificación final (estado real, no aspiracional)

- `pnpm run test` (Vitest): **966/966 verde** (916 base + 50 nuevos: 3+16+2+12+8+5+4).
- `bash bin/harness init`: **VERDE** (lint, typecheck, 966/966 Vitest).
- `pnpm run lint` / `pnpm run typecheck`: limpios, incluido `tests/e2e/**`
  (cubierto por `tsconfig.e2e.json`, proyecto separado ya `done`).
- `pnpm run build` (con `--base` real): **éxito, código 0**, puerta de
  terceros 0 hallazgos.
- `pnpm exec playwright test` (`pnpm run test:e2e`): **63/73 verdes, 10
  rojos** — los 10 rastreados a los dos hallazgos documentados arriba, no a
  ningún error de implementación de los 17 escenarios aprobados.

## Recomendación para `craftsman_lead`

1. Decidir el vehículo para el hallazgo bloqueante (imágenes con `src`
   literal fuera de los 4 ficheros de `hrefDeDestino`): enmienda de este
   mismo `.feature` (2-4 escenarios nuevos, mismo patrón que Decisión 48) o
   una feature dedicada — toca 6 features ya `done`, así que probablemente
   merece su propia conversación de spec, no una implementación silenciosa.
2. Mismo vehículo puede resolver a la vez la PREGUNTA ABIERTA 2 (`og:image`
   con subpath): es el mismo mecanismo aplicado a `MetadatosPagina.tsx`.
3. Reconciliar el recuento de @s12 ("4" → "5") en el texto del `.feature`,
   trazado y documentado arriba — cambio de texto, no de diseño.
4. Todo el código YA escrito en esta ronda (`hrefDeDestino.ts`,
   `tecnicaSpaGithubPages.ts`, `public/404.html`, los 4 ficheros de enlace,
   `App.tsx`, `package.json`, `index.html`, la infraestructura de
   `tests/e2e/`) es correcto, probado y no necesita revertirse — es el
   cimiento sobre el que se resolverá el hallazgo bloqueante, no algo en
   conflicto con él.

## Enmienda -- rutas de imagen bajo el subpath (26/08/2026)

> Recorrido de `@s18`-`@s24` (Decisiones 52-55, sección L-P del `.feature`),
> TDD estricto, un ciclo a la vez, continuando el trabajo de la sección
> anterior de este mismo fichero. Contrato aprobado por el humano el
> 26/08/2026.

### Resumen de lo implementado

1. **`hrefDeDestino(destino, base)`** (`src/lib/hrefDeDestino.ts`) se
   reutiliza LITERALMENTE — cero cambio de firma ni de comportamiento. Único
   cambio: JSDoc ampliado documentando el uso dual (enlaces + imágenes,
   Decisión 53).
2. **Los 6 puntos de renderizado adoptan `hrefDeDestino` en el `src` del
   `<img>`** (Decisión 53/54): `PieDePagina.tsx` (`SRC_LOGO`),
   `Galeria.tsx` (`entrada.src`), `CampanasPortada.tsx` (`campana.imagen`,
   segunda llamada — ya llamaba a `hrefDeDestino` para el `href` del `<a>`),
   `PaginaCampanas.tsx` (`campana.imagen`, import nuevo), `PaginaBlog.tsx`
   (`articulo.imagen`, en sus DOS puntos de renderizado — "Sigue leyendo" y
   la cabecera del artículo —, import nuevo), `PaginaTienda.tsx`
   (`producto.imagen`, import nuevo). Ningún `alt`/`width`/`height`/
   `loading`/`decoding` cambia: verificado línea a línea en cada edición,
   solo se tocó el cálculo del `src`.
3. **Los 4 ficheros `src/data/*.ts` (`galeria.ts`, `campanas.ts`, `blog.ts`,
   `tienda.ts`) NO se tocan** (Decisión 54): siguen declarando el literal
   crudo `/img/...`, verificado con test dedicado (@s20) que además falla si
   alguno llegara a importar `hrefDeDestino`.
4. **`MetadatosPagina.tsx`**: `IMAGEN_OPEN_GRAPH` pasa de
   `` `${DOMINIO_SITIO}${RUTA_IMAGEN_OPEN_GRAPH}` `` (concatenación cruda) a
   `` `${DOMINIO_SITIO}${hrefDeDestino(RUTA_IMAGEN_OPEN_GRAPH)}` `` (Decisión
   55). El comentario que documentaba el subpath como "problema aparte,
   todavía sin resolver" se actualiza para reflejar la resolución real.

### Ciclos Rojo-Verde-Refactor

**@s18** — `hrefDeDestino` calcula igual para una ruta de imagen que para una
de enlace. Al ser la MISMA función genérica ya "done" (no distingue la forma
del destino, solo si es o no un ancla), el test nuevo (25 rutas × 2 bases,
`src/lib/hrefDeDestino.test.ts`) pasó **verde a la primera** — no demuestra
nada por sí solo (docs/tdd.md). Verificado con sabotaje manual real: se
reescribió `hrefDeDestino` a `return destino` (ignorando `base`), se corrió
el fichero completo → **30/69 tests en rojo**, incluidos los 25+2 de
`@s18`/`@s22`; revertido → 69/69 verde de nuevo. Ningún cambio de producción
en este ciclo (Ley 1: nada pedía ninguno).

**@s19/@s20** — los 6 `.tsx` llaman a `hrefDeDestino` para el `src`; los 4
`data/*.ts` no lo importan. **ROJO real confirmado**:
`src/imagenes-hrefDeDestino.test.ts` nuevo, 7/24 tests en rojo (los 6
ficheros sin la llamada + el caso "PaginaBlog llama dos veces"). **VERDE**:
las 6 ediciones de producción descritas arriba (2 arriba). Re-corrida:
24/24 verdes. Sin regresión en `PieDePagina.test.tsx`/`Galeria.test.tsx`/
`CampanasPortada.test.tsx`/`PaginaCampanas.test.tsx`/`PaginaBlog.test.tsx`/
`PaginaTienda.test.tsx` (181/181 verdes en conjunto): ninguno de esos tests
afirma el literal exacto del `src` (todos usan `getByRole('img', {name})`,
`querySelector('img')` o recuentos — nunca comparan contra `/img/...`), así
que la Decisión 47 (ningún test `href`/`src` ya "done" se reescribe) se
cumple sin tocar ni un test heredado.

**@s21** — `MetadatosPagina.tsx` compone `IMAGEN_OPEN_GRAPH` con
`hrefDeDestino`. **ROJO real confirmado**: `src/imagenOpenGraph-hrefDeDestino.test.ts`
nuevo (lectura `?raw`, `import.meta.glob` por la misma razón de oxlint ya
documentada en `App-basename.test.ts`), 3/3 tests en rojo. **VERDE**: el
cambio de una línea en `MetadatosPagina.tsx` descrito arriba. Ajuste del
propio test durante el ciclo: la primera versión de la aserción "sin el
subpath añadido a mano" hacía `not.toContain('GalapavetClinicaVeterinaria')`
sobre el texto COMPLETO del fichero, pero el comentario JSDoc que documenta
la procedencia de `DOMINIO_SITIO` cita el nombre del repositorio en prosa —
falso rojo por sobre-especificación del test, no un defecto de producción.
Corregido despojando comentarios de bloque antes de comparar (mismo criterio
que `documento-base-url.test.ts`); NO se despojan comentarios de línea `//`
porque el propio literal `'https://cenit-digital.github.io'` contiene `//`
dentro de la cadena y el fichero no usa comentarios `//` en ningún otro
punto — un primer intento con esa segunda regex mutilaba el literal real y
producía un rojo falso distinto, diagnosticado y corregido antes de aceptar
el ciclo. Sin regresión en `MetadatosPagina.test.tsx`/`PaginaCampanas.test.tsx`/
`PaginaBlog.test.tsx`/`PaginaTienda.test.tsx` (115/115 verdes): @s20 de ese
fichero ya afirmaba `ogImagen.startsWith('https://cenit-digital.github.io/')`
sin fijar el resto de la URL, así que sigue verde con o sin subpath.

**@s22** — `og:image` resuelve como URL absoluta con subpath en producción y
como el mismo literal de siempre en test. Módulo puro, mismo patrón que
`@s18`: literales de `DOMINIO_SITIO`/`RUTA_IMAGEN_OPEN_GRAPH` escritos a mano
en el test (no importados de `MetadatosPagina.tsx`, que no los exporta —
mismo patrón "doble-de-test-anclado-al-literal-no-al-simbolo"). Cubierto
dentro del mismo ciclo de sabotaje que `@s18` (mismos 2 tests, ambos en rojo
con `hrefDeDestino` saboteado, ambos verdes al revertir).

**@s23** — las 24 rutas de imagen + `og:image` responden 200 bajo el subpath
real, navegador real. Añadido a `tests/e2e/despliegue-subpath.spec.ts` (mismo
fichero de `@s13`-`@s16`, mismo nivel de verificación). **Pasó verde en la
primera corrida** (la implementación de `@s19`/`@s21` ya estaba en verde
cuando se escribió este test) — verificado con sabotaje real: se revirtió
`Galeria.tsx` a `hrefDeDestino('/img/sabotaje-no-existe.webp')` (ruta
inventada, mantiene el import usado para no chocar con `noUnusedLocals` de
`tsc -b`), se reconstruyó `dist/` (`vite build --base=...` real) y se
re-ejecutó `@s23` → **1/2 tests en rojo**, con el error mostrando las 6
imágenes de galería rotas en la ruta `/GalapavetClinicaVeterinaria/`
("imágenes rotas... `/GalapavetClinicaVeterinaria/img/sabotaje-no-existe.webp`"
× 6); revertido el sabotaje, reconstruido `dist/`, re-ejecutado → 2/2 verde.

**@s24** — la puerta completa `pnpm run test:e2e`, con los 5 tests heredados
que este hallazgo rompía, vuelve a estar en verde. No añade test propio
(mismo criterio que `@s17`): la evidencia es la propia ejecución completa.
Ver "Verificación final" más abajo para el resultado exacto, incluido un
hallazgo adicional (bug de infraestructura en `imagenes.spec.ts` @s29, no
del contrato) encontrado y corregido durante esta ronda.

### La hipótesis del test colateral de movimiento (`@s42`) — DESMENTIDA

El encargo pedía confirmar o desmentir que el fallo observado de `@s42`
("3 animaciones en curso" en la ruta de campañas) era un efecto colateral de
las imágenes en 404: una animación de "hueco de imagen cargando" que nunca
se detiene porque el evento `load` nunca llega a dispararse.

**Investigación estática**: `grep -r "@keyframes" src/` → **0 resultados en
todo el proyecto**. No existe ninguna animación CSS de "hueco cargando". El
único `transition` relacionado con una tarjeta que contiene imagen
(`@mixin tarjeta`, `src/styles/_api.scss:180-182`, `box-shadow 300ms
ease-out`) vive DENTRO de `@media (prefers-reduced-motion: no-preference)`:
con `reduce` activo (el modo que mide `@s42`) esa regla ni siquiera se aplica
— mismo patrón "estado-base-visible-ssg-reduced-motion" ya documentado en
`feature_list.json` → `rules.notas`. El mixin `hueco-de-imagen`
(`_api.scss:203-209`) solo declara `aspect-ratio`/`background-color`/
`object-fit`, sin `animation` ni `transition`.

**Investigación empírica, dos experimentos independientes**:
1. Sabotaje real de `CampanasPortada.tsx` (revertido a `campana.imagen` sin
   `hrefDeDestino`, con `--base` de producción ya aplicado — EXACTAMENTE el
   estado que describía el hallazgo bloqueante original) + `dist/` real +
   `pnpm exec playwright test tests/e2e/movimiento.spec.ts -g "@s42"` →
   **2/2 verde, 0 animaciones en curso**, incluida la ruta con
   `CampanasPortada` (`/GalapavetClinicaVeterinaria/`, dentro de las 6 rutas
   del inventario).
2. Test desechable (`tests/e2e/zzz-hipotesis-temporal.spec.ts`, borrado tras
   la medición) con `page.route('**/img/**', ruta => ruta.abort())` — TODAS
   las imágenes bloqueadas de raíz, ni siquiera llegan a pedirse — más
   `page.emulateMedia({ reducedMotion: 'reduce' })` sobre la portada real:
   `document.getAnimations().filter(playState === 'running')` →
   **`[]` (array vacío)**, confirmado por consola (`ANIMACIONES EN CURSO
   (reduce, imágenes bloqueadas): []`).

**Conclusión**: la hipótesis es **FALSA**. No existe ningún mecanismo de
animación de "hueco de imagen cargando" en este código — ni siquiera con
`prefers-reduced-motion: no-preference`, y mucho menos con `reduce`. El fallo
de `@s42` observado durante la corrida COMPLETA de la puerta (9 workers en
paralelo, ver más abajo) fue un **falso rojo por contención de CPU**, no un
defecto de producción: reproducido con la ruta `/GalapavetClinicaVeterinaria/campanas?campana=vacunaciones`
señalando "3 animaciones en curso" en una corrida de 9 workers, pero
**0/0 en dos corridas aisladas de 1 worker** con exactamente el mismo
`dist/`. Mismo patrón de colisión por CPU compartida ya documentado
repetidamente en `progress/current.md` (`pagina_tienda`, `identidad_visual`).
No se toca ningún fichero de producción por esta investigación (queda
descartada como causa, tal y como pedía el PENDIENTE 3 de la cabecera de
este mismo `.feature`).

### Hallazgo adicional: bug de infraestructura en `tests/e2e/imagenes.spec.ts` @s29

Al correr la puerta completa por primera vez con `@s19`/`@s21` ya
implementados, `@s29` (`imagenes.spec.ts`, heredado de `identidad_visual`)
falló con `EncodingError: The source image cannot be decoded` — un fallo
NUEVO, distinto del 404 original que motivó esta enmienda (las aserciones de
`status === 200` y `content-type === 'image/png'`, justo antes en el mismo
test, ya pasaban). Causa raíz: el test calcula
`rutaOgImage = new URL(contenidoOgImage).pathname` y luego decodifica la
imagen con `${baseURL}${rutaOgImage}`. Antes de esta enmienda,
`contenidoOgImage` no llevaba subpath (`/img/og/galapavet.png`), así que
concatenarlo con `baseURL` (que sí lo lleva) daba una URL con el subpath UNA
vez. Tras `@s21`/`@s22`, `contenidoOgImage` YA incluye el subpath
(`/GalapavetClinicaVeterinaria/img/og/galapavet.png`, la consecuencia
correcta y buscada de la Decisión 55) — concatenarlo de nuevo con `baseURL`
duplica el subpath (`.../GalapavetClinicaVeterinaria//GalapavetClinicaVeterinaria/img/...`),
una URL que no existe, de ahí el `EncodingError`. Es exactamente el tipo de
"ajuste de infraestructura, no de Given/When/Then" que la ronda anterior
(`@s13`-`@s16`) ya aplicó a 8 ficheros de `tests/e2e/` al fijar el subpath de
producción: la aserción de comportamiento (200, `image/png`, 1200×630) no
cambia en absoluto. Corregido con el mismo patrón ya usado en
`red-limpia.spec.ts` (`const origenPropio = new URL(baseURL ?? '...').origin`):
se compone la URL de decodificación con el ORIGEN de `baseURL` (sin
subpath) + `rutaOgImage` (que ya lo lleva), en vez de con `baseURL` completo.
Verificado en rojo (reproducido en corrida aislada de 1 worker, no solo en la
corrida paralela) antes del cambio, y en verde (16/16 de `imagenes.spec.ts`)
después.

### Trazabilidad @s → test (enmienda)

| Escenario | Test(s) | Estado |
| --- | --- | --- |
| @s18 | `src/lib/hrefDeDestino.test.ts` — describe `@s18` (51 tests: 25×2 + 1 recuento) | ✅ verde (verificado con sabotaje) |
| @s19 | `src/imagenes-hrefDeDestino.test.ts` — describe `@s19` (15 tests) | ✅ verde |
| @s20 | `src/imagenes-hrefDeDestino.test.ts` — describe `@s20` (9 tests) | ✅ verde |
| @s21 | `src/imagenOpenGraph-hrefDeDestino.test.ts` (3 tests) | ✅ verde |
| @s22 | `src/lib/hrefDeDestino.test.ts` — describe `@s22` (2 tests) | ✅ verde (verificado con sabotaje) |
| @s23 | `tests/e2e/despliegue-subpath.spec.ts` — describe `@s23` (2 tests) | ✅ verde (verificado con sabotaje real + rebuild) |
| @s24 | ejecución completa de `pnpm run test:e2e` (no añade test propio) | ✅ verde — 75/75, dos corridas consecutivas estables |

### Verificación final (estado real, no aspiracional)

- `pnpm run test` (Vitest): **1046/1046 verde** (966 base de la sección
  anterior + 80 nuevos: 51+2 en `hrefDeDestino.test.ts`, 24 en
  `imagenes-hrefDeDestino.test.ts`, 3 en `imagenOpenGraph-hrefDeDestino.test.ts`).
- `pnpm run lint` / `pnpm run typecheck`: limpios.
- `bash bin/harness init`: **VERDE** de punta a punta (lint, typecheck,
  1046/1046 Vitest).
- `pnpm run build` (con `--base=/GalapavetClinicaVeterinaria/` real):
  **éxito, código 0**, puerta de terceros 0 hallazgos (3 ficheros
  inspeccionados).
- `pnpm run test:e2e` (`pnpm exec playwright test`, 9 workers, `retries: 0`):
  **75/75 verde**, dos corridas consecutivas completas sin ningún fallo
  (75 = 73 heredados/originales + 2 tests nuevos de `@s23`). Los 5 tests que
  este hallazgo rompía antes de la enmienda
  (`despliegue-subpath.spec.ts` @s13, `imagenes.spec.ts` @s27/@s29,
  `red-limpia.spec.ts` @s33/@s34) están todos en verde, ninguno con su
  `Given`/`When`/`Then` reescrito — @s29 necesitó el ajuste de
  infraestructura descrito arriba (una línea, patrón `origenPropio` ya
  usado en el propio proyecto), el resto (@s13/@s27/@s33/@s34) pasó a verde
  como consecuencia directa de `@s19`/`@s21`, sin tocarlos.
- Hipótesis de la animación de movimiento colateral (`@s42`):
  **desmentida con evidencia** (ver sección dedicada arriba) — 0 cambios de
  producción por esta causa.

### Limpieza

- `tests/e2e/zzz-hipotesis-temporal.spec.ts` (desechable, usado solo para
  medir la hipótesis de movimiento) **borrado** antes de cerrar la ronda —
  no queda ningún fichero temporal en el árbol.
- Ningún sabotaje manual queda activo: confirmado con
  `grep -r "sabotaje" src/` → 0 resultados, y las dos corridas finales de
  `pnpm run test:e2e` (75/75, dos corridas consecutivas estables — ver
  "Verificación final" arriba) no muestran ningún residuo.

## Refuerzo mutación (26/08/2026)

`mutation_tester` encontró 4 mutantes supervivientes reales (huecos de
cobertura de mutación, no bugs) en los 2 módulos puros mordibles de esta
feature — ver `progress/mutation_despliegue_github_pages.md`. Ronda de
refuerzo quirúrgica, sin tocar producción (verificado con `sha256sum` antes
y después: idéntico en ambos ficheros).

### `src/lib/hrefDeDestino.ts` — `sinBarraFinal` (línea 5)

Causa raíz: toda la suite pasaba solo bases que empiezan Y terminan en "/",
así que "termina en barra" (`endsWith`), "empieza por barra" (`startsWith`,
mutante 1) y "siempre verdadero" (`endsWith('')`, mutante 2) eran
indistinguibles — la rama "else" del ternario nunca se ejercía.

Test añadido en `src/lib/hrefDeDestino.test.ts`, dentro del `describe('@s5
...')`: `hrefDeDestino('/campanas', '/GalapavetClinicaVeterinaria')` (base
que EMPIEZA pero NO TERMINA en barra), con `toBe('/GalapavetClinicaVeterinaria/campanas')`
exacto (sin `toContain`/`toMatch`).

Sabotaje manual, uno a uno, revertido entre cada uno:
- `endsWith('/')` → `startsWith('/')`: rojo confirmado (`'/GalapavetClinicaVeterinari/campanas'`
  recibido vs. `'/GalapavetClinicaVeterinaria/campanas'` esperado — se come
  la última letra de la base). Revertido, verde confirmado (70/70).
- `endsWith('/')` → `endsWith('')`: mismo rojo exacto, misma causa (la
  condición pasa a ser siempre verdadera, entra siempre en la rama que
  recorta el último carácter). Revertido, verde confirmado (70/70).

### `src/lib/tecnicaSpaGithubPages.ts` — `codificarRedireccion404` (línea 55)

Causa raíz: el test de `@s9` con `search` vacío solo comprobaba `pathname`
y un `not.toContain('GalapavetClinicaVeterinaria')` sobre `search`, ninguna
de las dos aserciones distinguía el resultado correcto (`'?/campanas'`) de
un resultado con un `&` residual de más (`'?/campanas&'`) que producen los
dos mutantes al forzar la rama "else" incluso con `search` vacío.

Test reforzado: en el `it` existente de `@s9` (líneas 13-18 originales), se
añadió `expect(resultado.search).toBe('?/campanas')` (valor exacto),
manteniendo el `not.toContain` original.

Sabotaje manual, uno a uno, revertido entre cada uno:
- `ruta.search === ''` → `false` (ConditionalExpression, condición siempre
  falsa): rojo confirmado (`'?/campanas&'` recibido vs. `'?/campanas'`
  esperado). Revertido, verde confirmado.
- `ruta.search === ''` → `ruta.search === 'Stryker was here!'`
  (StringLiteral): mismo rojo exacto, misma causa. Revertido, verde
  confirmado.

### Trazabilidad @s → test (refuerzo)

| Escenario | Test(s) | Estado |
| --- | --- | --- |
| @s5 (mutación) | `src/lib/hrefDeDestino.test.ts` — nuevo `it` en `describe('@s5 ...')`, base sin barra final | ✅ verde (verificado con sabotaje real de los 2 mutantes exactos) |
| @s9 (mutación) | `src/lib/tecnicaSpaGithubPages.test.ts` — aserción añadida al `it` existente de `describe('@s9 ...')` | ✅ verde (verificado con sabotaje real de los 2 mutantes exactos) |

### Verificación final

- Producción intacta: `sha256sum src/lib/hrefDeDestino.ts
  src/lib/tecnicaSpaGithubPages.ts` idéntico antes y después de toda la
  ronda (`e2b79550...` y `bdb14388...` respectivamente). Cero cambios en
  ninguno de los dos ficheros de producción.
- `pnpm run test`: **1047/1047 verde** (1046 + 1 test nuevo; el otro
  refuerzo fue una aserción añadida a un test ya existente, no un `it`
  nuevo).
- `pnpm run lint` / `pnpm run typecheck`: limpios.
- `bash bin/harness init`: **VERDE** de punta a punta (lint, typecheck,
  1047/1047 Vitest).
- Los 4 mutantes verificados uno a uno con sabotaje manual real (aplicar el
  mutante exacto del informe → confirmar rojo → revertir → confirmar
  verde), no una muestra.
- No se remidió con Stryker en esta sesión (corresponde a `mutation_tester`
  en la siguiente ronda).
  `pnpm run test`/`pnpm run test:e2e` ya reflejan el estado limpio.
