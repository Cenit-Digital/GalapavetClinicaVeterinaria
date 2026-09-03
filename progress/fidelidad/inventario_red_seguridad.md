# Inventario de la red de seguridad — fidelidad al prototipo

Fecha: 03/09/2026. Alcance: solo lectura de `tests/e2e/`, `playwright.config.ts`,
`stryker.config.json`, `vite.config.ts`, `src/lib/diseno/*.ts` (y sus tests),
los tests de componente que leen SCSS como texto, `.claude/`, `.github/` y
`progress/`. No se ha tocado nada de `src/`, `tests/` ni `features/`.

Cifras verificadas hoy (no heredadas de bitácoras):

- `pnpm exec playwright test --list` → **112 tests en 14 ficheros** de `tests/e2e/`.
- `dist/assets/index-CCVUwotx.css` → **60 706 B en crudo**; `gzip -6` local →
  7 523 B; **servido por `vite preview` con `Accept-Encoding: gzip, deflate, br, zstd`
  (lo que anuncia Chromium) → 7 489 B en el cable, `content-encoding: gzip`**
  (medido con `http.get` crudo contra un `vite preview` levantado en el 4199; sin
  brotli: `br` a secas devuelve identity de 60 706 B).
- Techo declarado (`tests/e2e/css-presupuesto.spec.ts:21`): **8 000 B** →
  **margen actual: 511 B (6,4 %)**.
- Node v22.15.0, pnpm 10.21.0, Playwright 1.62.1 con `chromium_headless_shell-1234`
  ya instalado en `%LOCALAPPDATA%\ms-playwright`.

---

## 1. Specs E2E (Playwright, `dist/` servido bajo `/GalapavetClinicaVeterinaria/`)

Todas navegan por `RUTAS_DEL_INVENTARIO` (`tests/e2e/rutas.ts`): `/`,
`/campanas`, `/campanas?campana=vacunaciones`, `/blog`, `/blog/demo-1`,
`/tienda` (6 rutas, recuento afirmado como 6 en casi todos los specs). Viewport
por defecto `Desktop Chrome` (1280×720) salvo donde se indica. `retries: 0`,
timeout 60 s por test, `webServer` = `pnpm run build && vite preview --base=... --port 4173 --strictPort`
con `reuseExistingServer: !CI`.

| Spec | Qué comprueba | Selectores / textos literales del DOM que se rompen si cambia la maquetación | Umbrales numéricos |
| --- | --- | --- | --- |
| `accesibilidad.spec.ts` | @s36 axe sin violaciones (6 rutas, variante por defecto); @s37 área táctil de todo control visible; @s38 anillo de foco (perímetro, contraste foco/sin foco, ningún `outline: none`); @s39 anillo vs fondo propio y vs contenedor; @s40 tabular 60 paradas sin que la cabecera fija tape el control; punto de corte 1024/1023 de la cabecera; @s41 jerarquía de encabezados; **@s45 axe en 30 combinaciones (5 variantes × 6 rutas)**. | `SELECTOR_INTERACTIVO` (`a[href], button:not([disabled]), input…, select, textarea, [role="button"], [tabindex]`); `header` (caja de la cabecera y sus **hijos directos** `header > *:visible`, que no pueden solaparse ni desbordar); `getByRole('navigation', {name: 'Navegación principal'})`; `getByRole('button', {name: 'Abrir menú'})`; `getByRole('button', {name: 'Cambiar paleta de color'})`; botones exactos `Clínica`, `Cálida`, `Tech`, `Eco`, `Marca Galapavet`; `html[data-variante=<id>]`; `h1…h6` (exactamente 1 `h1`, sin saltos, sin texto vacío). | 24×24 px CSS; `outline-width` ≥ 2 px; ratio ≥ 3 (dos veces); 20 primeros objetivos por ruta; 60 paradas máx.; tolerancia 0,5 px; 1024/1023 px; @s45 `test.setTimeout(180_000)`. |
| `css-presupuesto.spec.ts` | @s49 (identidad_visual) suma de `encodedBodySize` de recursos `initiatorType === 'link'` acabados en `.css` en la portada; @s48 (rediseno_visual) el techo se declara **una sola vez** en `src/` + `tests/`. | Ninguno del DOM. Lee de disco todos los `.ts/.tsx` de `src/` y `tests/` y exige que `/TECHO_BYTES_CSS\s*=\s*8000\b/` case **solo** en este fichero. | `TECHO_BYTES_CSS = 8000` (B en el cable); suma > 0. **Cambiar el techo obliga a cambiar el literal Y la regex del mismo fichero.** |
| `datos-reales.spec.ts` | @s49 ningún literal de la clínica ficticia en `dist/**/*.{html,css,js}` ni en `page.content()` de las 6 rutas; @s50 recuentos reales; @s52 sin afirmaciones de 24 h/365 y único cualificador de urgencias. | `#servicios article` (= `SERVICIOS.length`), `#equipo article` (= `EQUIPO.length`), `#galeria figure` (= `GALERIA.length`); `document.body.innerText` de las 6 rutas; literales prohibidos: `Veterinaria La Sierra`, `Miraflores de la Sierra`, `918 44 21 60`, `640 22 11 90`, `hola@veterinarialasierra.es` (y sus formas sin espacios); frases `24 h`, `24h`, `24 horas`, `veinticuatro horas`, `todos los días del año`, `los 365 días`, `365 días al año`; tras la palabra "urgencias" solo puede seguir `fuera de horario`. | Viewport 1600×1000; recuentos ≠ 12/6/9 (prototipo) y ≠ `hint-placeholder-count` del prototipo; 5 literales / 9 formas; 6 rutas. |
| `despliegue-subpath.spec.ts` | @s13 el árbol monta bajo el subpath; @s14 favicons y 2 preloads de fuente; @s15 `dist/404.html` == `public/404.html`; @s16 puerta de terceros sobre `dist/` (CSS+HTML) y literal del script `build`; @s23 24 rutas de imagen + `og:image` responden 200 y ninguna `<img>` queda con `naturalWidth 0`. | `#root` con hijos; **las 7 anclas** `#inicio #servicios #equipo #reservar #galeria #contacto #faq`; `meta[property="og:image"]`; `img[loading="lazy"]` (se fuerzan a eager); lista **escrita a mano** de 24 rutas `/img/...` (logo, 6 galería, 3 campañas, 6 blog, 8 tienda — borrar cualquiera la rompe; añadir no). | `baseURL` exacto `http://localhost:4173/GalapavetClinicaVeterinaria/`; 5 ficheros; 25 rutas; `scripts.build` debe contener `tsc -b && vite build --base=/GalapavetClinicaVeterinaria/ && node`. |
| `fidelidad.spec.ts` | @s42 5 variantes × 20 tokens resueltos por el navegador == declarados en `_tokens.scss`, y `body` pinta fondo/texto de la variante; @s43 **exactamente una** imagen de fondo en la sección de bienvenida, responde 200 `image/*` y está en el inventario declarado; todas las rutas del inventario responden 200; @s44 320 px sin desborde (con excepción de carruseles). | Bienvenida = primera `section` que contiene el `h1`; su fondo se busca en `background-image` del elemento y `::before/::after` **o** en `<img>` con `position: absolute|fixed` y `z-index < 0`; inventario = literales `/img/….(webp|png|jpe?g|svg)` en `src/data`, `src/components`, `src/pages` (no tests); `[data-variante]`; `document.getAnimations()`; excepción de desborde: ancestro con `overflow-x: auto|scroll`. | 5 × 20 = 100 tokens; 320×640; tolerancia 1 px; `emulateMedia reducedMotion: reduce`. |
| `geometria-escalas.spec.ts` | @s17 ancho único del contenedor; @s19 ritmo vertical fluido de Equipo; @s20 escala tipográfica (2 pasos fluidos + 6 fijos); @s21 peso/tracking de titulares; @s22 interlineados; @s23 vocabulario de radios; @s24 sombras reposo/elevada + hover; @s25 alturas de controles del formulario y del chat + casilla. | `[data-contenedor-principal]` (first) en las 6 rutas; `#equipo > *` (first); `h1` first; `getByRole('heading', {level: 2})` first; **pasos fijos**: `header p` first, `aside` first, `header`, `header a[href="#inicio"]`, `#servicios article h3` first, `heading level 2 'Datos pendientes de confirmar'` (ficha de campaña); `heading level 3` first; radios: `button 'Enviar mensaje'`, `#equipo span[aria-hidden="true"]` first (avatar), `#servicios article` first (tarjeta), `#formulario-contacto-nombre`, `#servicios article span` first (píldora de categoría); sombras: `#servicios article` first y nth(1), `#equipo article` first, `fieldset[aria-label="Asistente de reserva de Galapavet"]`, hover sobre `#servicios article` first; controles: `#formulario-contacto-{nombre,telefono,email,motivo,mensaje}`, `button 'Enviar mensaje'`, `fieldset[aria-label="Respuestas rápidas"] button` (recuento `SERVICIOS.length + 1`), botón con `SERVICIOS[0].titulo`, `textbox 'Tu respuesta'`, `button 'Enviar respuesta'`, `#formulario-contacto-acepta-aviso-legal` y `label[for=…]`. También lee `_api.scss` (`$radio-pequeno: espaciado(4)`, `$radio-medio: espaciado(12)`, `$radio-grande: espaciado(24)`, `$radio-completo: 999px`, `$radio-circulo: 50%`) y `_tokens.scss` (`--sombra-reposo: 0 6px 18px rgba(15, 32, 60, 0.07)`, `--sombra-elevada: 0 18px 45px rgba(15, 32, 60, 0.1)`). | Contenedor **1220 px** exactos a 1600; padding-block Equipo ≈ 72 a 320 y ≈ 103,68 a 1440 (nunca 64); `h1` 33 px a 320 / 68 px a 1220; `h2` 28/46; pasos fijos 10,24 / 12,8 / 16 / 20 / 25 / 31,25 px; `font-weight` `600` (no 700); tracking h1 −0,02 em, h2 −0,015 em; line-height body 1,5, h1 portada 1,05, h2/h3 1,08; radios 999px / 50% / 24px / 12px (> 3 distintos); sombra reposo α 0,07 blur 18, elevada α 0,1 blur 45; controles ≥ **44 px**; casilla ≥ 24×24 y su centro dentro de la caja de la etiqueta. |
| `imagenes.spec.ts` | @s27 sin imágenes rotas ni remotas; @s28 favicons; @s29 `og:image`; @s30 **toda** `<img>` declara `width`, `height`, `loading="lazy"`, `decoding="async"` y CLS; @s31 con `/img/**` bloqueado cada hueco conserva alto, relación de aspecto y color de reserva. | `document.images` (todas, incluida la del hero); `link[rel~="icon"], link[rel="apple-touch-icon"]`; el `index.html` debe contener literalmente `<!-- <link rel="icon" type="image/svg+xml"`; `src` sin `http`, `https`, `//` ni `unsplash`; `background-color` de cada `<img>` == `--color-fondo-alterno` computado del `body`. | apple-touch-icon 180×180; og:image 1200×630 `image/png`; CLS ≤ 0,1; relación de aspecto ±0,05. |
| `layout.spec.ts` | @s44 320 px: `scrollWidth <= clientWidth` (6 rutas); @s45 un solo ancho de contenedor; @s46 el pie cierra la ventana en la 404; @s47 pies de tarjeta alineados por fila y ninguna tarjeta con altura fija. | `[data-contenedor-principal]` first; `footer`; **`section[data-contenedor-principal] > article`** (tarjetas de la portada, hoy Servicios y Equipo) y **`section[aria-label='Catálogo'] li`** (tienda), en cada una el `button` o el primer `button, a`; `@mixin tarjeta {…}` de `_api.scss` sin `height:` (permite `min-`/`max-`). | 320×640; 1600 (ancho < 1600 e idéntico en 6 rutas); 1280×1000 (pie ≥ 999); 1280×900, tolerancia 1 px (agrupación 3 px). |
| `movimiento.spec.ts` | @s42 con `reduce`: 0 animaciones en curso en 6 rutas y tras interactuar; ninguna transición > 0,01 ms; lo abierto sigue visible; @s43 `scroll-behavior` auto/smooth. | `button 'Cambiar paleta de color'` → `button 'Marca Galapavet'` (exact); **`page.locator('section', {hasText: 'Servicios'}).getByRole('button').first()`** (debe tener `aria-expanded`; ojo: casa con CUALQUIER `section` cuyo texto contenga "Servicios", incluido el hero con su cifra "Servicios"); `button '¿Qué horario tiene la clínica?'` (`aria-expanded`); `button 'Foto siguiente'`; `section hasText 'Servicios'` first → `ul` first visible. | 0,02 ms de tolerancia; elementos con transición > 0. |
| `red-limpia.spec.ts` | @s32 cero terceros salvo el mapa; @s33 ninguna respuesta ≥ 400; @s34 0 errores, 0 avisos, 0 excepciones tras recorrer 6 rutas e interactuar. | Dominios prohibidos `fonts.googleapis.com`, `fonts.gstatic.com`, `unsplash.com`; único externo permitido `openstreetmap.org`; imágenes (`webp|png|jpe?g|svg`) solo del propio origen; interacciones: `button 'Cambiar paleta de color'`, `button 'Marca Galapavet'`, `section hasText 'Servicios'` primer `button`, **`section hasText 'Equipo'` primer `button`**, `button '¿Qué horario tiene la clínica?'`. Filtra por texto los mensajes de consola que casan `/openstreetmap\.org/i`. | 0 / 0 / 0. |
| `rediseno-visual.spec.ts` | 6 rutas a 1600×1000 sin desborde, sin `<img>` completada con `naturalWidth 0`, **sin errores de consola (SIN filtro del mapa)**; portada: hero + barra de urgencias + 5 fotos locales de servicios; 5 variantes a 1440×900 sin desborde. | `#inicio` y su `heading level 1` (`font-weight` `600`); **`#inicio img` count 1**; **`#servicios img` count 5** con `src` `/img/servicios/`; **`aside[aria-label="Urgencias fuera de horario"] a`** con `href` `^tel:`; botones de variante exactos; `html[data-variante]`. | 1600×1000; 1440×900; 1 / 5 imágenes. |
| `tipografia.spec.ts` | @s20 `body` en DM Sans y `h1` en Outfit (6 rutas); @s21 controles de `#contacto` y `#reservar` con familia de marca; @s22 exactamente 2 `.woff2` locales; @s23 alto de `h1` y primer `p` igual con y sin fuente. | `h1` first; `p` first; `#contacto` y `#reservar` → `input, textarea, select, button`; ruta `**/fuentes/**`. | 2 ficheros; suma ≤ **69 224 B**; tolerancia 1 px; sin `latin-ext|italic`. |
| `tokens-aplicados.spec.ts` | @s24 `body` sin margen y con fondo; @s25 5 variantes pintan fondo/texto declarados; @s26 ritmo de fondos de la landing. | `#inicio #servicios #equipo #reservar #galeria #contacto #faq` + **`#servicios` → `xpath=following-sibling::*[1]`** (campañas, sin ancla): 8 fondos, ninguno transparente, ≥ 2 distintos, **nunca 3 consecutivos iguales** (orden actual: fondo, alterno, fondo, alterno, fondo, alterno, fondo, alterno). | 8 secciones. |
| `urgencias.spec.ts` | @s14 en las 6 rutas todo texto que diga "urgencias" lleva el rótulo real y no el teléfono de clínica/móvil; **todo `aria-label` que contenga "urgencias" es EXACTAMENTE `datosNegocio.telefonoUrgencias.rotulo`**; todo `a[href^="tel:"]` cuyo nombre (propio + `closest('[aria-label]')`) mencione urgencias apunta a `enlaceLlamada(telefonoUrgencias.textoVisible)`. | `TreeWalker` de texto; `[aria-label]`; `a[href^="tel:"]`. Importa `src/lib/site.ts` y `src/lib/telefono.ts`. | 1600×1000; 3 teléfonos distintos; ≥ 1 mención y ≥ 1 enlace por ruta. |

Riesgos estructurales concretos para una remaquetación (los que romperán primero):

1. Ids de las 7 anclas y su **orden/alternancia de fondos** (`Landing.tsx` +
   `Landing.module.scss`): `@s26` mide el fondo computado del `<div id>` y exige
   que campañas sea el hermano inmediato de `#servicios`.
2. `data-contenedor-principal` es el único elemento medido para "ancho 1220"
   (`@s17`, `@s45`); hoy lo llevan `Hero`, `Servicios`, `Equipo`, `ReservaChat`,
   `Galeria`, `FormularioContacto`, `Faq`, `CampanasPortada` y el `interior` del
   pie. El primero del DOM de cada ruta debe medir exactamente 1220 px a 1600.
3. `#servicios article` / `#equipo article` / `#galeria figure` son los
   recuentos de `@s50`; `#servicios article span` first debe ser la píldora de
   categoría (radio 999px) y `#servicios article h3` first el paso 2 (25 px).
4. `#equipo span[aria-hidden="true"]` first = avatar circular (50 %).
5. `header p` first = descriptor bajo el logo (10,24 px), `aside` first = barra
   de urgencias (12,8 px) y `header a[href="#inicio"]` = enlace de marca (20 px).
6. `section hasText 'Servicios'` / `'Equipo'` → **primer `button` tiene que ser
   un desplegable con `aria-expanded`** (movimiento + red-limpia). Un botón «+»
   decorativo, el selector de paleta o cualquier botón anterior en una sección
   cuyo texto contenga esas palabras rompe ambos specs.
7. `aside[aria-label="Urgencias fuera de horario"] a` y la regla de `@s14`: un
   `aria-label` como «Llamar a urgencias» falla (tiene que ser el rótulo exacto).
8. Toda `<img>` nueva: `width` + `height` + `loading="lazy"` + `decoding="async"`
   + fondo `--color-fondo-alterno` (mixin `hueco-de-imagen`), `src` local vía
   `hrefDeDestino`, y **el hero solo puede tener 1 `<img>`** (o 1 `background-image`).
9. Selector de paleta: `button 'Cambiar paleta de color'` y los cinco nombres
   accesibles con tilde son literales en 5 specs.

---

## 2. Puertas de `src/lib/diseno/*.ts` que leen ficheros del repo como texto

Módulos puros (mutados por Stryker al 100 %) cuyo cableado a disco vive en su
`.test.ts` (Vitest, `import.meta.glob(..., { query: '?raw' })` o `node:fs`).
Corren en **cada `Edit|Write`** por el hook `PostToolUse` y en `bin/harness init`.

| Puerta | Qué lee | Invariante que exige | Hay que enmendar si… |
| --- | --- | --- | --- |
| `inventarioModulos.ts` + `.test.ts` | Nombres de `src/components/*.tsx` y `src/pages/*.tsx` (sin tests); rutas de `*.module.scss`; texto de los 18 `.module.scss`. | Cada componente/página con representación visual está en `INVENTARIO_MODULOS_CON_ESTILOS` (13 + 5 = **18**, lista escrita a mano en el test), tiene `<Nombre>.module.scss` co-localizado, y **ningún `.module.scss` contiene un color literal** (`#hex`, `rgb()/hsl()`, ni los 16 nombres CSS — también en comentarios). | **Se añade un componente o página nuevo** → alta en `COMPONENTES`/`PAGINAS` de `inventarioModulos.ts`, en `nombresAMano` del test y en los tres `18` literales (`toBe(18)`). Un componente sin `.module.scss` solo cabe en `MODULOS_SIN_REPRESENTACION_VISUAL`. |
| `hojaGlobal.ts` + `src/styles/hoja-global.test.ts` | `global.scss`, `main.tsx`, **todos** `src/**/*.{ts,tsx}`, todos los `.module.scss`, `Cabecera.module.scss`. | Solo `main.tsx` importa `global.scss`; ningún `.module.scss` declara `html`, `body` ni `#root`; las 9 familias del reset; `html { scroll-padding-top: var(--…) }` con la misma variable que usa la altura de la cabecera; `scroll-behavior: smooth` solo bajo `no-preference`; `reduce` con `0.01ms`; exactamente 4 `@font-face` locales; pilas tipográficas en allowlist; `:focus-visible` con `var(--color-foco)`; nunca `outline: none|0`. | Se intenta estilizar `body`/`html` desde un módulo, o cambiar la altura de la cabecera sin pasar por su variable. |
| `escalaMovimiento.ts` + test | `global.scss` + todos los `.module.scss`. | Toda `transition`/`animation(-duration)` usa solo **150, 300 o 0.01 ms**, curva `ease-out`, y nunca anima `all`. | Se añade cualquier duración nueva (p. ej. 200 ms). |
| `movimientoRespetuoso.ts` + test | Todos los `.module.scss`. | Toda declaración `transition:`/`animation:` vive dentro de `@media (prefers-reduced-motion: no-preference)` o `reduce`. | Se escribe una transición fuera de la media query. |
| `usoDelAcento.ts` + test | Los 18 `.module.scss` + `_api.scss` + `global.scss` (**recuento fijado en 20**). | `var(--color-acento)` nunca en `color:` ni `border*`; al menos un uso en `background*`/`fill`. | Se añade un `.module.scss` (→ 21 en dos `expect`) o se usa el lima como texto/borde. |
| `rolesDescartados.ts` + test | **Todo `src/**/*.{ts,tsx,scss,css}`** (sin tests, sin el propio módulo) y **`dist/**/*.{html,css,js}`**; `_tokens.scss`. | Ninguna palabra suelta `24 h`, `24h`, `365`, `todos los días del año`, `siempre hay alguien de guardia` (comentarios excluidos); `--color-primario-fuerte` declarado en las 5 variantes y **usado** en algún fichero de estilos. | Exige `dist/` fresco (CI hace `pnpm run build` antes de `init`). Un `dist/` viejo con texto prohibido rompe. Nota documentada: una corrida de Stryker con ≥ 365 mutantes deja "365" en `src/` y dispara un falso positivo. |
| `datosDelSitio.ts` + test | Los 4 `docs/diseno-claude-design/*.dc.html`; todo `src/**/*.{ts,tsx,scss}` (sin tests). | Ningún literal de la clínica ficticia en `src/` (única cita permitida: la ruta completa `docs/diseno-claude-design/Veterinaria La Sierra.dc.html`); recuentos del prototipo (12/6/9) ≠ reales. | Se copia cualquier texto/dato del prototipo. |
| `fidelidadPrototipo.ts` + test | `Veterinaria La Sierra.dc.html` y `_tokens.scss`. | 18 roles × 4 temas del prototipo == tokens del sistema (3 desviaciones declaradas; translúcidos compuestos con `mezclar`). | Se cambia un token de color o el prototipo. No afecta a la maquetación. |
| `matrizDeContraste.ts` + test | `_tokens.scss` y el prototipo. | 21 pares (rol, fondo, uso) escritos a mano aprueban WCAG en las 5 variantes. **La reconciliación contra el texto real de los `.module.scss` (`ejecutarPuertaDeReconciliacionDeMatriz`) solo se ejercita con dobles sintéticos**: hoy un par nuevo `color: var(--color-X)` sobre `background-color: var(--color-Y)` en un módulo real NO dispara nada automáticamente. | Solo si se cambia la matriz (longitud 21 afirmada). Recomendación: al añadir pares nuevos, añadirlos a la matriz para que el contraste quede medido. |
| `inventarioActivosPublicos.ts` + test | `src/data/*.ts`, `MetadatosPagina.tsx`, `PieDePagina.tsx`, `global.scss`; árbol real de `public/img` y `public/fuentes`. | Toda ruta `/img/...` declarada en esos ficheros existe en `public/`; exactamente 2 fuentes. | Se añaden imágenes en `src/data` o en esos dos componentes sin el fichero. (Las declaradas en OTROS componentes/páginas las vigila `fidelidad.spec.ts` @s43 en E2E.) |
| `contratoRedisenho.ts` + `SelectorPaleta-logica.test.ts` | Todo `src/**/*.{ts,tsx}` (sin tests) + `index.html`. | `'clinica'` declarado como literal de cadena una sola vez (en `contratoRedisenho.ts`). | Se escribe `'clinica'` (o cualquier id de variante) como literal en un `.tsx` nuevo. |
| `puertaTelefonoHardcodeado.ts` + test | Todo `src/**/*.{ts,tsx}` (sin tests). | Solo `src/lib/site.ts` contiene teléfonos (exactamente 3). | Se escribe un teléfono en un componente. |
| `imagenes-hrefDeDestino.test.ts`, `enlaces-internos-hrefDeDestino.test.ts`, `App-basename.test.ts` | Texto de 6 componentes/páginas y 4 ficheros de datos. | `src={hrefDeDestino(` en cada componente listado; nadie concatena `/GalapavetClinicaVeterinaria/`; los datos declaran rutas crudas. | Un componente nuevo con `<img>` no está vigilado por este test, pero debe seguir el patrón (lo exige `@s23`/`@s43` en E2E vía 200). |
| `puntoDeCorte.ts` + test | `Cabecera.module.scss`. | Único `@media (min-width: …)` = 1024 (`PUNTO_DE_CORTE_NAVEGACION_PX`). | Se añade otro breakpoint a la cabecera. |
| `escenariosHeredados.ts` + test | Texto de `tests/e2e/*.spec.ts`. | Los 12 ids heredados (`@s12 @s27 @s28 @s29 @s30 @s31 @s32 @s34 @s2 @s17 @s18 @s19`) aparecen citados en algún spec. | Se borra/renombra un spec que los cite. |
| `analisisAutomaticoAxe.ts` + test | `tests/e2e/accesibilidad.spec.ts`. | Usa `withTags([...ETIQUETAS_AXE_ACUMULATIVAS])` y nunca `.options(`. | Se cambia la llamada a axe. |
| `puertaNavegadorReal.test.ts` | `package.json`, `harness.config.json`, `playwright.config.ts`. | `test:e2e = playwright test`; `commands.test = pnpm run test`; `testDir './tests/e2e'`; `retries: 0`; comando literal del `webServer`. | Se toca el `webServer` o el puerto. |
| `tokens-api.test.ts` | `_tokens.scss`, `_api.scss`, `vite.config.ts`. | `additionalData: '@use "api" as *;\n'` literal; sin mixins en `_tokens`. | Se toca `vite.config.ts`. |
| `bundleDeDiseno.ts` + test | Directorio `docs/diseno-claude-design/`. | Exactamente 4 `.dc.html` + `support.js` + `README_BUNDLE.md`. | Se añade/borra un fichero en esa carpeta (p. ej. capturas). |
| `puertaTerceros.ts` (+ `tools/puerta-terceros.ts` en `pnpm run build`, y `@s16`) | `dist/**/*.{css,html}`. | Sin `fonts.googleapis.com`, `fonts.gstatic.com`, `images.pexels.com`. | Nunca por una remaquetación. |

Tests de componente que leen su propio `.module.scss` (bloques buscados por
**cabecera literal**; refactorizar un nombre de clase los rompe):

- `Hero.test.tsx`: `.cifras` (`border-block-start` con token, nunca `none`),
  `.contenido` (`max-width` en px < 1220), `&::after` (velo con `var(--color-tinta)`
  y `color-mix`, sin `#hex`), `.hero` (`aspect-ratio: 16 / 9` y `min-height: Npx`),
  contraste `--color-sobre-primario` vs velo al 92 % en 5 variantes.
- `Equipo.test.tsx`: `.avatar { background-color: var(--color-acento-suave); }`,
  `.eyebrow { @include eyebrow; }` sin `color:`; sin `<img>` en la sección.
- `Servicios.test.tsx`, `CampanasPortada.test.tsx`: `.eyebrow` con `@include eyebrow;`
  y sin `color:`/`text-transform:`/`letter-spacing:`; CampanasPortada además
  `padding-block: var(--ritmo-seccion-compacto);` y nunca `padding-block: espaciado(`;
  `global.scss` con `--ritmo-seccion: clamp(72px, 7.2vw, 104px);` y
  `--ritmo-seccion-compacto: clamp(56px, 6.2vw, 90px);` literales.
- `Faq.test.tsx`: bloque directo `.faq {` con `max-width: 860px` (< 1220, ≠ 900).
- `Galeria.test.tsx`: `.pista {` con `overflow-x: auto|scroll`, sin
  `flex-direction: column`, con `scroll-snap-type`/`scroll-snap-align`; botones
  `aria-label` `Foto anterior`/`Foto siguiente`.
- `InformacionContacto.test.tsx`: `[data-tarjeta-de='datos'] {` → `legend {` con
  `@include eyebrow`; `[data-tarjeta-de='urgencia'] {` con
  `background-color: var(--color-urgencia-suave)`, `border-inline-start: … var(--color-urgencia)`
  y `order`; `[data-tarjeta-de='urgencia'] a {` con `@include boton-fantasma`.
- `ReservaChat.test.tsx`: `[aria-label='Respuestas rápidas'] button {` con
  `min-height: $altura-control-media;`.
- `Cabecera.test.tsx`: `.navPrincipal {` y `.panelMovil {` → `a[data-enlace-tienda] {`
  con `@include boton-fantasma`.
- `FormularioContacto.test.tsx`: `grupoConsentimiento` con `display: flex;` y
  `align-items: center;`; enlace «Aviso legal» con `@include area-tactil-minima`
  y `display: inline-block;`.
- `PaginaCampanas.test.tsx`: cintillo `@include eyebrow;`, tarjetas `li` con
  `@include tarjeta;`.

Resumen operativo para el rediseño: **(a)** módulo nuevo → 4 literales de recuento
(`inventarioModulos.ts`, su test ×3, `usoDelAcento.test.ts` ×2); **(b)** clase
renombrada → los tests de componente de arriba; **(c)** imagen nueva → fichero en
`public/img`, `<img>` con los 4 atributos y `hrefDeDestino`, y si va en `src/data`
o en el pie, `inventarioActivosPublicos.test.ts` la exige en disco; **(d)** ningún
color literal, ninguna duración fuera de {150, 300}, ningún `html/body` en módulos,
ningún texto del prototipo.

---

## 3. El mapa de contacto y `red-limpia.spec.ts`

- `src/components/InformacionContacto.tsx:14`: `<iframe title="Mapa de Galapavet"
  src="https://www.openstreetmap.org/export/embed.html?layer=mapnik" loading="lazy"
  sandbox="" aria-describedby=…>` + `<p id="informacion-contacto-aviso-mapa">El mapa
  lo sirve un proveedor externo. Es la única conexión con un tercero de esta web.</p>`.
  Solo se renderiza si `datosNegocio.direccion.lineas !== null`. **La URL no lleva
  `bbox`/`marker`**, por eso la captura muestra el mapa en blanco: centrarlo con
  las coordenadas de la fuente única es compatible con todas las puertas mientras
  el host siga siendo `openstreetmap.org`.
- Excepción documentada, en tres sitios: `red-limpia.spec.ts:8`
  `DOMINIO_DEL_MAPA_EMBEBIDO = 'openstreetmap.org'` es el único host externo
  admitido por @s32; @s34 (y `despliegue-subpath.spec.ts` @s13) filtran por texto
  los mensajes de consola que casan `/openstreetmap\.org/i` ("Blocked script
  execution…" del `sandbox=""`); `InformacionContacto.test.tsx` @s9 afirma que es
  el único `iframe`/tercero y su aviso literal. `puertaTerceros.ts` solo prohíbe
  Google Fonts y Pexels, así que la URL en `dist/` no cuenta como hallazgo.
- **Hueco**: `rediseno-visual.spec.ts` recoge errores de consola de las 6 rutas
  **sin** ese filtro. Hoy pasa porque el iframe es `loading="lazy"` y a 1600×1000
  no llega a cargarse en la captura inicial; si la remaquetación hace que el marco
  entre en el viewport inicial (o pasa a `eager`), ese spec se pondrá rojo por el
  aviso del sandbox. Habría que añadirle el mismo filtro (es test, no producción).

---

## 4. El techo de CSS (@s48 / @s49) y el margen

Qué exige exactamente: `css-presupuesto.spec.ts` carga la portada, espera
`networkidle`, suma `encodedBodySize` de las entradas de `performance` con
`initiatorType === 'link'` y nombre acabado en `.css` (hoy una sola hoja,
`dist/assets/index-*.css`), y exige `suma <= 8000` y `suma > 0`; además @s48
exige que `TECHO_BYTES_CSS = 8000` esté declarado en un único fichero de `src/`+`tests/`.
`encodedBodySize` son los **bytes comprimidos en el cable**: `vite preview` sirve
`gzip` (no brotli) cuando el cliente lo acepta, y Chromium siempre lo acepta.
El contrato (`identidad_visual.feature` @s49) solo pide un techo "escrito a mano,
mayor que 0, que no se recalcule del dist y que funcione como trinquete"; el
número concreto lo fijó el `tdd_craftsman` midiendo (5 791 B entonces).

Estado: **7 489 B servidos / 8 000 B → 511 B (6,4 %) de margen**, con 60 706 B
de CSS en crudo (ratio ≈ 8,1:1). Los 18 módulos + `_api` + `global` + `_tokens`
suman 2 849 líneas de SCSS.

Veredicto: **rehacer 10 secciones NO cabe en 8 000 B.** Cada sección del
prototipo añade anatomía (titular bicolor + descripción + botón «+» en
servicios, dos columnas en campañas, tarjetas con geometría propia en equipo,
galería con titular y tarjetas, contacto en tarjetas + urgencias + mapa, FAQ
centrado con «+», pie con logotipo y legales en fila, selector flotante). Con
que los módulos crezcan un 30-50 % (estimación conservadora, 2 849 → 3 700-4 300
líneas), el CSS crudo pasaría a 80-90 KB y el gzip a 10-11,5 KB.

Propuesta de techo nuevo, justificada:

1. Subir `TECHO_BYTES_CSS` a **12 000 B** al abrir la primera feature de
   fidelidad (y la regex de @s48 a `/TECHO_BYTES_CSS\s*=\s*12000\b/`, ambos en
   `tests/e2e/css-presupuesto.spec.ts`, único sitio permitido). Justificación:
   es ~1,6× lo servido hoy y deja sitio a las 10 secciones sin convertir el techo
   en decorativo; sigue siendo una hoja única de < 12 KB comprimida, muy por
   debajo de cualquier presupuesto razonable de CSS crítico (las guías de
   rendimiento habituales sitúan el CSS bloqueante en decenas de KB).
2. Al cerrar la última sección, **volver a apretar** al valor medido × 1,25
   (misma disciplina con la que nació: 5 791 → 8 000 fue +38 %), documentando
   la medición en `progress/fidelidad/`.
3. Mitigaciones que abaratan CSS: reutilizar los mixins de `_api.scss`
   (`contenedor`, `tarjeta`, `fila-de-accion-de-tarjeta`, `hueco-de-imagen`,
   `boton-primario`, `boton-fantasma`, `pildora-etiqueta`, `pildora-filtro`,
   `eyebrow`, `prosa`, `foco-visible`, `area-tactil-minima`) en vez de repetir
   declaraciones; concentrar geometría común de sección en `Landing.module.scss`;
   evitar duplicar bloques `@media (prefers-reduced-motion)` por componente.
   Lightning CSS ya minifica; no hay más compresión que rascar en el servidor.

Si el humano prefiere no tocar el techo hasta medir: cada feature de sección
puede cerrar con la medida real en su `tdd_*.md`, y subirlo solo en el momento
en que la suma lo pida (el spec avisa con exactitud de bytes).

---

## 5. Cómo correr las suites en esta máquina (Windows 11, pnpm 10.21, Node 22.15)

Funciona igual desde Git Bash (`pnpm`) y PowerShell (`pnpm` o `pnpm.cmd`; en
PowerShell 5.1 no hay `&&`, encadenar con `;` o `if ($?) { … }`).

| Suite | Comando exacto | Tiempo aproximado (consta en `progress/`) |
| --- | --- | --- |
| Vitest completo | `pnpm run test` (= `vitest run`, jsdom, 88 ficheros / ~1 300 tests) | ~2,5 min en esta máquina (`mutation_integridad_puerta_mutacion.md`: 970 tests en 2 min 28 s). |
| Vitest un fichero | `pnpm exec vitest run src/components/Hero.test.tsx` · modo watch: `pnpm run test:watch` | segundos |
| oxlint | `pnpm run lint` (= `oxlint --deny-warnings`) | < 5 s |
| tsc | `pnpm run typecheck` (= `tsc -b`) · ambos: `pnpm run verificar` | ~10-20 s |
| Arnés (lint + typecheck + tests + ficheros base) | Git Bash: `bash bin/harness init` · PowerShell: `bin\harness.ps1 init` · directo: `node .harness/harness.mjs init`. **Antes** `pnpm run build`: `rolesDescartados.test.ts` lee `dist/` y `puertaTerceros` corre en el build. | build ~6 s + tests |
| Build | `pnpm run build` (= `tsc -b && vite build --base=/GalapavetClinicaVeterinaria/ && node --experimental-strip-types tools/puerta-terceros.ts`) | ~10 s |
| Playwright completo | `pnpm exec playwright test --workers=1 --reporter=list` (o `pnpm run test:e2e`). El `webServer` reconstruye `dist/` y levanta `vite preview` en 4173; con `reuseExistingServer` activo en local, **matar antes cualquier preview huérfano** (`netstat -ano \| findstr :4173` → `taskkill /F /PID <pid>`; documentado en `fix_s48_techo_css_unico.md` como causa de `ERR_CONNECTION_REFUSED` intermitentes). | 112 tests. Referencias: 75 tests en 27 s con 9 workers (antes de @s45); @s45 solo puede tardar hasta 180 s; con `--workers=1` la suite entera queda en el orden de 3-6 min (no consta una cifra cerrada). |
| Playwright un spec / un escenario | `pnpm exec playwright test tests/e2e/fidelidad.spec.ts` · `pnpm exec playwright test -g "@s48"` · listar sin ejecutar: `pnpm exec playwright test --list` | 17 tests de a11y+movimiento: 32 s (`judge_accesibilidad.md`). |
| Navegador | Ya instalado (`chromium_headless_shell-1234`). Si faltara: `pnpm exec playwright install chromium --only-shell` (114,5 MiB). | — |
| Stryker un fichero | `pnpm exec stryker run --mutate src/lib/diseno/hojaGlobal.ts` (el `stryker.config.json` ya fija runner Vitest, `concurrency: 1`, `timeoutMS: 60000`, umbral `break: 100`; informe en `reports/mutation/index.html`). Un `-logica.ts`: `pnpm exec stryker run --mutate src/components/Hero-logica.ts`. | Por fichero, medido: `puertaTerceros` 1m47, `analisisAutomaticoAxe` 0m46-1m21, `escenariosHeredados` ~2m, `inventarioModulos` ~3m, `inventarioActivosPublicos` 2m33-5m17, `mezclaDeColor` 5m01, `PaginaBlog-logica` 5m14, `rolesDescartados` 1m42-6m15, `escalaMovimiento` 3m37-8m14, `tokensColor` 10m15, `hojaGlobal` 13m42. Corrida global (`bin/harness mutate` / `pnpm exec stryker run`): 75 min (`mutation_integridad_puerta_mutacion.md`). |
| Stryker vía arnés | `bash bin/harness mutate` (toda la superficie: `src/lib/**/*.ts` + `src/**/*-logica.ts`) · `bash bin/harness verify` (init + mutación) | horas |
| Config del arnés | `pnpm run test:config` (congela `stryker.config.json`/`harness.config.json`; también corre en CI) | 1 s |

Avisos prácticos: no lanzar dos Stryker en paralelo (cerrojo documentado en
`mutation_rediseno_visual.md`); una corrida con ≥ 365 mutantes hace que el
contador de Stryker aparezca como texto en la copia de `src/` y dispare el
falso positivo «365» de `rolesDescartados` (mutar fichero a fichero lo evita);
la CI (`harness-ci.yml`, `deploy-pages.yml`) **no ejecuta Playwright** — la
suite E2E es una puerta exclusivamente local, así que hay que dejarla en verde
a mano antes de marcar `done`.

---

## 6. Hooks y guardias sobre rutas

- `.claude/settings.json` (proyecto): hook **`PostToolUse` sobre `Edit|Write` →
  `node .harness/harness.mjs test`** (la suite Vitest completa tras cada edición;
  el arnés lo ejecuta, el agente no puede saltárselo — cuenta 2-3 min por
  edición y hace que un test rojo aparezca inmediatamente); hook **`Stop` →
  `node .harness/harness.mjs init`**. Permisos preaprobados: `./init.sh`,
  `bin/harness:*`, `node .harness/harness.mjs:*`. No hay `settings.local.json`
  ni carpeta `hooks/`.
- `.github/workflows/guard-sensitive-paths.yml`: en cada PR (`pull_request_target`)
  etiqueta `permissions-change` y avisa si se toca
  `.github/workflows/`, `.github/AUTONOMOUS.md`, `.github/CODEOWNERS`,
  `docs/autonomous.md`, `.harness/**/*.{mjs,js,cjs,ts}` o **`.claude/`**
  (renombrados incluidos). **No bloquea** por sí mismo.
- `.github/CODEOWNERS`: `/.github/`, `/.harness/`, `/.claude/` requieren revisión
  de `@PabloHurtadoGonzalo86` o `@PhurtadoCenitDigital` — bloqueante solo con
  la protección de rama «Require review from Code Owners» activa.
- `.github/AUTONOMOUS.md` (límites del bot): nunca bajar el umbral de mutación,
  nunca relajar/borrar tests para pasar la CI, declarar en la primera línea del
  PR cualquier cambio en las rutas sensibles.
- `harness-ci.yml` (push a `main` y PR): `pnpm install --frozen-lockfile` →
  `pnpm run build` → `node .harness/harness.mjs init` → `pnpm run test:config`.
  `deploy-pages.yml`: build → init → publicar `dist/`. Ninguno ejecuta
  Playwright ni Stryker.
- `.harness/test/project-config.test.mjs` congela `stryker.config.json`
  (`mutate` exacto, `thresholds` 100/100/100, `concurrency 1`, `timeoutMS 60000`,
  runner Vitest) y `harness.config.json` (`commands.mutate = pnpm exec stryker run`,
  `mutation.targets = []`).
- No hay hooks de git (`.git/hooks` solo trae samples; sin husky).
- Rutas que ningún fichero de `src/`/`tests/` puede tocar sin enmendar puertas:
  `src/styles/global.scss` (solo desde `main.tsx`), `src/lib/site.ts` (única
  fuente de datos y teléfonos), `docs/diseno-claude-design/` (inventario exacto
  de 6 ficheros), `tests/e2e/css-presupuesto.spec.ts` (única declaración del techo).

---

## Bloqueos y decisiones que necesita el humano antes de la primera sección

1. **Techo de CSS**: 511 B de margen; decidir si se sube a 12 000 B ahora (con
   compromiso de reapretar al final) o sección a sección.
2. **Filtro del mapa en `rediseno-visual.spec.ts`**: añadirlo si la remaquetación
   hace visible el `iframe` en el primer pintado (es test, no producción).
3. **Selectores frágiles por estructura** (`section hasText 'Servicios'/'Equipo'`
   → primer `button` con `aria-expanded`; `section[data-contenedor-principal] > article`;
   `#servicios` + hermano siguiente = campañas; `header p` first; `aside` first):
   aceptarlos como contrato o enmendar los specs junto con cada feature.
4. **Regla de `aria-label` con "urgencias"** (@s14): cualquier rótulo accesible
   nuevo que contenga esa palabra debe ser exactamente `datosNegocio.telefonoUrgencias.rotulo`.
5. **Recuentos literales** al crear componentes/módulos nuevos (18 → N; 20 → N+2).
6. **Reconciliación de la matriz de contraste** no vigila los módulos reales:
   los pares (tinta, fondo) nuevos hay que darlos de alta a mano en
   `MATRIZ_DE_USO_DEL_SISTEMA` (y su `toHaveLength(21)`).
7. **Playwright no corre en CI**: la puerta E2E es local; el `judge` debe
   ejecutarla de forma independiente en cada feature.
