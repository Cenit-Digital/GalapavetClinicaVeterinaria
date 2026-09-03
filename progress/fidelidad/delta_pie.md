# Delta de fidelidad — Pie de página

> Sección: `<footer>` del prototipo (`docs/diseno-claude-design/Veterinaria La Sierra.dc.html`, líneas 444-475)
> frente a `src/components/PieDePagina.tsx` + `PieDePagina.module.scss` + `PieDePagina-logica.ts`.
> Medidas tomadas en Chromium real (Playwright) a 1280 px de ancho sobre los DOS documentos
> (prototipo servido por `file://` con su `support.js`; web = `dist/` servido por
> `vite preview` bajo `/GalapavetClinicaVeterinaria/`). Capturas: `shots/diseno_05.png`
> + `diseno_06.png` (prototipo) y `shots/web_04.png` (web); recortes ampliados del pie:
> `shots/diseno_pie_zoom.png` y `shots/web_pie_zoom.png`; reproducción del logotipo vacío:
> `shots/repro_original.png`. Todo en el scratchpad de la sesión.
>
> Fecha: 03/09/2026.

## Anatomía del prototipo

### Árbol DOM (literal del HTML, sin el runtime)

```
footer                                   background: var(--card); border-top: 1px solid var(--border);
│                                        padding: clamp(48px,7vw,72px) clamp(18px,5vw,28px) 28px
├─ div  [fila superior]                  max-width: 1220px; margin: 0 auto; display: flex; flex-wrap: wrap; gap: 32px
│  ├─ div  [bloque de marca]             flex: 1 1 260px; min-width: 0
│  │  ├─ div [fila logotipo + nombre]    display: flex; align-items: center; gap: 11px; margin-bottom: 14px
│  │  │  ├─ span [marca gráfica]         position: relative; width: 36px; height: 36px; border-radius: 11px;
│  │  │  │                               background: var(--primary); display: flex; align-items: center; justify-content: center
│  │  │  │  ├─ span                      position: absolute; width: 16px; height: 4px; border-radius: 3px; background: var(--on-primary)
│  │  │  │  └─ span                      position: absolute; width: 4px; height: 16px; border-radius: 3px; background: var(--on-primary)
│  │  │  └─ span [nombre]                font-family: 'Outfit'; font-weight: 600; font-size: 17px; color: var(--ink)
│  │  └─ p   [descripción]               font-size: 14px; line-height: 1.7; color: var(--muted); margin: 0; max-width: 34ch
│  └─ ×3 div [columna]  (sc-for columnasPie)      flex: 1 1 170px; min-width: 0
│     ├─ div [título de columna]         font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
│     │                                  color: var(--ink); margin-bottom: 14px      (NO es un heading: es un div)
│     └─ ul                              list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 9px
│        └─ ×4 li > a                    font-size: 14px; color: var(--muted); hover → color: var(--primary)
└─ div  [barra inferior]                 max-width: 1220px; margin: 36px auto 0; padding-top: 20px; border-top: 1px solid var(--border);
   │                                     display: flex; flex-wrap: wrap; gap: 10px 22px; align-items: center;
   │                                     justify-content: space-between; font-size: 12.5px; color: var(--muted)
   ├─ span [©]                           "© 2026 Veterinaria La Sierra · Centro veterinario registrado nº 28/0791"
   └─ span [enlaces legales]             display: flex; flex-wrap: wrap; gap: 16px
      └─ ×3 a                            color: var(--muted); hover → color: var(--primary)   (Aviso legal · Privacidad · Cookies; los tres a "#faq")
```

Reglas globales del prototipo que afectan al pie: `a{color:var(--primary);text-decoration:none;transition:color .3s ease}`
(los enlaces del pie sobrescriben el color a `--muted`; **ningún enlace va subrayado**), `body{font-family:'DM Sans'}`
(los títulos de columna, la descripción, los enlaces y la barra inferior van en DM Sans; solo el nombre va en Outfit).
Tokens del tema por defecto (`:root`, línea 18): `--card:#FFFFFF`, `--border:rgba(15,32,60,.13)`, `--ink:#0B1B33`,
`--muted:#5E6E88`, `--primary:#1E40AF`, `--on-primary:#FFFFFF`. Equivalencias ya declaradas en `src/styles/_tokens.scss`:
`--card→--color-superficie`, `--border→--color-borde`, `--ink→--color-tinta`, `--muted→--color-texto-suave`,
`--primary→--color-primario`, `--on-primary→--color-sobre-primario`.

### Geometría medida a 1280 px (Chromium, `getBoundingClientRect`)

| Elemento | x | y (doc) | ancho | alto | Notas computadas |
| --- | ---: | ---: | ---: | ---: | --- |
| `footer` | 0 | 8313 | 1280 | **313** | `padding: 72px 28px 28px` (el `clamp` resuelve 72/28 a 1280); borde superior 1px |
| fila superior | 30 | 8386 | 1220 | 139 | `gap: 32px` |
| bloque de marca | 30 | 8386 | **349** | 139 | `flex: 1 1 260px` |
| columna «Clínica» | 411 | 8386 | **259** | 139 | `flex: 1 1 170px` |
| columna «Contenido» | 701 | 8386 | 259 | 139 | idem |
| columna «Contacto» | 992 | 8386 | 259 | 139 | idem (las 4 cajas comparten la misma `y` y el mismo alto) |
| marca gráfica (cuadrado) | 30 | 8386 | 36 | 36 | `border-radius: 11px`, fondo `rgb(30,64,175)` = `--primary` |
| barra horizontal de la cruz | 40 | 8402 | 16 | 4 | `radius 3px`, blanco |
| barra vertical de la cruz | 46 | 8396 | 4 | 16 | `radius 3px`, blanco |
| nombre «Veterinaria La Sierra» | 77 | 8394 | 160 | 21 | Outfit 600 17px `--ink`, alineado al centro vertical del cuadrado |
| descripción | 30 | 8436 | 326 | 71 | 14px, `line-height: 23.8px` (1.7), `max-width: 325.58px` (= 34ch), `--muted`, 3 líneas |
| título de columna | 411 | 8386 | 259 | 14 | 11px 700, `letter-spacing: 1.54px` (.14em), uppercase, `--ink`, `margin-bottom: 14px`, DM Sans |
| cada `li` | 411 | 8414 / 8444 / 8474 / 8504 | 259 | 21 | paso vertical **30 px** (21 de línea + 9 de `gap`); `a` 14px `--muted`, sin subrayado |
| barra inferior | 30 | 8561 | 1220 | 37 | `margin-top: 36px` (8525→8561), `padding-top: 20px`, borde 1px, `gap: 10px 22px`, `align-items: center` |
| span © | 30 | 8582 | 405 | 16 | 12.5px `--muted`, pegado a la izquierda |
| span enlaces legales | 1050 | 8582 | 200 | 16 | `display:flex; gap:16px`, pegado a la derecha, **una sola fila**, misma `y` que el © |
| `a` «Aviso legal» / «Privacidad» / «Cookies» | 1050 / 1127 / 1204 | 8582 | 61 / 61 / 47 | 16 | 12.5px `--muted`, sin subrayado |

Qué va a la izquierda y qué a la derecha: todo el contenido del pie está alineado a la izquierda dentro de cada columna;
la única distribución es la barra inferior (`space-between`): © a la izquierda, enlaces legales a la derecha, ambos centrados
verticalmente entre sí. Nada va centrado horizontalmente. No hay sombras ni píldoras ni botones en esta sección.

Breakpoints: el pie no declara ninguna media query. Su respuesta al ancho es solo `flex-wrap` + `clamp()`:
relleno lateral `clamp(18px,5vw,28px)` (18 px por debajo de 360 px, 28 px desde 560 px), relleno superior
`clamp(48px,7vw,72px)` (48 px por debajo de ~686 px, 72 px desde ~1029 px). Con `flex-basis` 260/170/170/170 y `gap` 32,
las cuatro cajas caben en una fila desde ~866 px de contenido; por debajo van pasando a dos filas y, en 320 px, a una caja
por fila.

## Estado actual de la web

### DOM que pinta `PieDePagina.tsx` (líneas 76-100)

```
footer.pie                                  margin-block-start: auto; border-block-start: 1px solid var(--color-borde);
│                                           background: var(--color-superficie); color: var(--color-texto); font-size: 12.8px
└─ div.interior [data-contenedor-principal] @include contenedor (width 100%; max-width 1220px; margin-inline auto; padding-inline 24px);
   │                                        display: flex; flex-wrap: wrap; gap: 32px; padding-block: 48px 24px
   ├─ div.marca                             flex: 1 1 260px
   │  ├─ img (src=hrefDeDestino('/img/logo-galapavet.webp') alt="" width=201 height=201 loading=lazy decoding=async)
   │  │                                     @include hueco-de-imagen(1,1) → aspect-ratio 1/1, background var(--color-fondo-alterno),
   │  │                                     object-fit cover; width/height 48px; border-radius 12px; margin-block-end 8px
   │  ├─ p  «Galapavet»                     Outfit 700, 12.8px (hereda), var(--color-tinta)
   │  └─ p  «Centro integral veterinario en Galapagar, Madrid.»   12.8px, var(--color-texto-suave)
   ├─ ×3 div  (ColumnaEnlaces, SIN clase)   flex: 0 1 auto  ← no declara nada
   │  ├─ h3  «Clínica» / «Contenido» / «Contacto»   16px 700, letter-spacing .06em, uppercase, tinta, margin-block-end 12px, Outfit
   │  └─ ul  (.interior ul)                 list-style none; display flex; flex-direction: column; gap 8px
   │     └─ ×4 li > a                       @include foco-visible + area-tactil-minima; display inline-flex; align-items center;
   │                                        color: inherit (= var(--color-texto)); SUBRAYADO por defecto del navegador
   └─ div.barraInferior                     flex-basis 100%; display flex; flex-wrap wrap; justify-content space-between; gap 16px;
      │                                     margin-block-start 16px; padding-block-start 16px; border-block-start 1px; color texto-suave
      ├─ p  «© 2026 Galapavet»
      └─ ul[aria-label="Enlaces legales"]   .barraInferior ul → display flex; gap 16px  (NO declara flex-direction)
         └─ ×3 li > a[target=_blank rel="noopener noreferrer"]   texto = "Aviso legal (se abre en una ventana nueva)", etc.
```

### Geometría medida a 1280 px (misma herramienta, `dist/` de hoy)

| Elemento | x | y (doc) | ancho | alto | Qué se ve |
| --- | ---: | ---: | ---: | ---: | --- |
| `footer` | 0 | 6508 | 1280 | **391** | 78 px más alto que el prototipo (313) |
| `.interior` | 30 | 6509 | 1220 | 390 | contenido real de x=54 a x=1226 (**1172 px**) por el `padding-inline: 24px` del mixin `contenedor` |
| `.marca` | 54 | 6557 | **638** | 149 | se lleva más de la mitad de la fila |
| columna «Clínica» | 724 | 6557 | **77** | 149 | `flex: 0 1 auto`: mide lo que mide su texto |
| columna «Contenido» | 833 | 6557 | **127** | 149 | idem |
| columna «Contacto» | 992 | 6557 | **234** | 149 | idem — las tres columnas quedan apiñadas contra el borde derecho |
| `img` logotipo | 54 | 6557 | 48 | 48 | radio 12 px; fondo `rgb(237,242,249)` = `--color-fondo-alterno` |
| p «Galapavet» | 54 | 6613 | 638 | 19 | 12.8px Outfit 700, DEBAJO de la imagen (no en fila) |
| p descripción | 54 | 6633 | 638 | 19 | 12.8px, `line-height` 19.2px (1.5), sin `max-width` |
| h3 | 724 / 833 / 992 | 6557 | — | 17 | 16px Outfit 700, `letter-spacing` 0.96px, `line-height` 17.28px |
| cada `a` de columna | — | 6587 / 6619 / 6651 / 6683 | — | 24 | paso vertical **32 px** (24 de `min-height` + 8 de `gap`); 12.8px, `rgb(60,76,102)` (`--color-texto`), **subrayado** |
| `.barraInferior` | 54 | 6755 | 1172 | **121** | margen 16 + relleno 16 (= 32 frente a 56 del prototipo) |
| p © | 54 | 6772 | 108 | 104 | 12.8px, texto-suave; su caja mide 104 de alto porque la lista de al lado se apila |
| `ul` legal | 917 | 6772 | 309 | 104 | `display:flex` **pero hereda `flex-direction: column` de `.interior ul`** (misma especificidad 0,1,1; `.barraInferior ul` solo declara `display` y `gap`) |
| `a` legales | 917 | 6772 / 6812 / 6852 | 251 / 299 / 309 | 24 | **apilados en vertical**, paso 40 px, subrayados, con el sufijo «(se abre en una ventana nueva)» visible |

### Defectos visibles en `web_04.png` (franja que empieza en y=5600; el pie arranca en y≈908 de la franja)

1. **Logotipo como cuadro vacío**: a la izquierda hay un cuadrado gris-azulado de 48×48 con esquinas de 12 px y nada dentro.
2. **Columnas apiñadas a la derecha**: «CLÍNICA» (77 px), «CONTENIDO» (127 px) y «CONTACTO» (234 px) empiezan en x=724 y quedan
   pegadas al borde derecho; el bloque de marca ocupa 638 px de aire vacío.
3. **Enlaces legales apilados** en tres filas a la derecha, cada uno con el texto «(se abre en una ventana nueva)» a la vista,
   subrayados; el © queda a la izquierda pero la barra mide 121 px de alto (37 en el prototipo).
4. **Todos los enlaces subrayados y en `--color-texto`** (no `--color-texto-suave`), sin cambio de color al pasar el ratón.
5. **Títulos de columna a 16 px en Outfit** con tracking corto: pesan más que los 11 px/.14em del prototipo y compiten con el nombre
   de marca, que a su vez sale a 12.8 px (más pequeño que sus propios encabezados de columna).
6. **Nombre de marca debajo de la imagen**, no a su lado; descripción sin ancho máximo ni interlineado 1.7.
7. En `web_pie_zoom.png` (captura del elemento con la página ya asentada) se ve además que el botón fijo «Cambiar paleta de color»
   (`SelectorPaleta`) tapa el tercer enlace legal en la esquina inferior derecha. Es cosa del selector (otra sección), se anota
   solo para que el tdd_craftsman no lo confunda con un defecto del pie.

### Por qué el logotipo no se pinta en `web_04.png` — diagnóstico verificado, no supuesto

- **Ruta y base**: `PieDePagina.tsx:13` declara `SRC_LOGO = '/img/logo-galapavet.webp'` y lo resuelve con
  `hrefDeDestino(SRC_LOGO)` (línea 81) → `src="/GalapavetClinicaVeterinaria/img/logo-galapavet.webp"`. El servidor responde
  **200, `image/webp`**; el fichero existe en `public/img/` y en `dist/img/` (4.744 B, WebP con alfa, **201×201**). Ni la ruta ni la
  base de GitHub Pages fallan.
- **Tamaño**: la caja mide 48×48 (no 0): `width/height: espaciado(48)` sobrescriben el `width:100%; height:auto` del mixin.
- **Causa real: `loading="lazy"` + `decoding="async"` frente al guion de captura.** Medido con la página asentada (scroll al final +
  1,5 s): `img.complete === true`, `naturalWidth === 201`, y el recorte `web_pie_zoom.png` muestra el logotipo real (disco blanco con
  la cruz morada y la silueta lima). Reproduciendo el guion exacto de `render.mjs` (scroll en saltos de 700 px con 120 ms de espera,
  vuelta al principio, 1,2 s y captura `fullPage` con `clip`), el recorte `repro_original.png` vuelve a dar el cuadro vacío: la
  imagen diferida aún no había decodificado cuando Chromium rasterizó la captura, y lo que se pinta mientras tanto es el hueco
  reservado por `hueco-de-imagen` (`background-color: var(--color-fondo-alterno)` = `#EDF2F9`, exactamente el color del cuadro).
  `progress/current.md` ya había anotado lo mismo en Chrome real («lo que parecía roto era el lazy-load en una pestaña oculta»).
- **Consecuencia para el diseño**: los atributos `loading="lazy"` / `decoding="async"` NO se pueden quitar (los exige
  `imagenes.spec.ts` @s30 en las 6 rutas y `despliegue_github_pages.feature` @s19 congela los atributos del `<img>`), y el hueco de
  `--color-fondo-alterno` lo exige @s31. Lo que sí se puede corregir es la **forma** del hueco: hoy es un cuadrado de radio 12 px y
  el logotipo real es un disco con esquinas transparentes, así que incluso cargado se ve un cuadrado gris detrás del disco (visible
  en `web_pie_zoom.png`). Con `border-radius: $radio-circulo` el hueco y el disco coinciden y el marcador de carga deja de parecer
  un «cuadro vacío».

## Diferencias

| id | Qué cambia | Tipo | Prioridad |
| --- | --- | --- | --- |
| pie-1 | Las tres columnas de enlaces no declaran `flex`: miden 77/127/234 px y se apiñan a la derecha; en el prototipo cada una es `flex: 1 1 170px; min-width: 0` (259 px cada una a 1220 de contenido, la marca 349). | bug | alta |
| pie-2 | Los enlaces legales se apilan en vertical (heredan `flex-direction: column` de `.interior ul`); en el prototipo van en **una fila** (`display:flex; flex-wrap:wrap; gap:16px`) a la derecha, a la misma altura que el ©, con la barra centrada verticalmente (`align-items:center`). | bug | alta |
| pie-3 | El sufijo «(se abre en una ventana nueva)» se ve en pantalla; en el prototipo el texto visible es solo el rótulo. Debe seguir formando parte del nombre accesible (@s10) pero ocultarse visualmente (span oculto solo para lectores). | estilo | alta |
| pie-4 | Bloque de marca: en el prototipo la marca gráfica (36×36) y el nombre (17px/600 Outfit, `--ink`) van **en una fila** (`gap` 11, `align-items:center`, `margin-bottom` 14) y la descripción debajo; hoy la imagen (48×48) va sola arriba, el nombre a 12.8px debajo y la descripción sin `max-width`. | estructura | alta |
| pie-5 | Hueco del logotipo cuadrado (radio 12) bajo un logotipo que es un disco: se ve un cuadrado gris detrás del disco y, mientras el `lazy` decodifica, un «cuadro vacío». Pasar a círculo (`$radio-circulo`) y a un tamaño en la escala cercano a los 36 px del prototipo (`$altura-control-pequena` = 40 px). | bug | media |
| pie-6 | Enlaces de columna subrayados y en `--color-texto`; el prototipo los pinta sin subrayar en `--muted` (`--color-texto-suave`) y `--primary` (`--color-primario`) al pasar el ratón, con transición de color. | estilo | media |
| pie-7 | Títulos de columna a 16px Outfit 700 `.06em`; el prototipo: 11px DM Sans 700 `.14em` uppercase `--ink`, `margin-bottom` 14. En la escala del proyecto: `paso-tipografico(-2)` (10.24px), `var(--fuente-texto)`, `letter-spacing: 0.14em`, `margin-block-end: espaciado(12)`. Mantiene la proporción título/enlace del prototipo (11/14 ≈ 10.24/12.8). | estilo | media |
| pie-8 | Ritmo vertical: relleno superior 48 (prototipo 72 a 1280), barra inferior con 16+16 (prototipo 36+20) y sin `align-items:center`; `gap` de la barra 16 (prototipo `10px 22px`). En la escala: `padding-block: espaciado(64) espaciado(24)`, barra `margin-block-start: espaciado(32)` + `padding-block-start: espaciado(24)`, `gap: espaciado(12) espaciado(24)`. | estilo | media |
| pie-9 | Descripción: 14px/1.7 con `max-width: 34ch` en el prototipo; hoy 12.8px/1.5 sin tope de ancho. Mantener `paso-tipografico(-1)` (el paso de la escala más cercano a 14) y añadir `line-height: 1.7; max-width: 34ch`. | estilo | baja |
| pie-10 | Nombre de marca: 17px/600 Outfit en el prototipo (el mismo tamaño que en su cabecera); hoy 12.8px/700. Usar el mismo paso que el enlace de marca de `Cabecera.module.scss:40` (`paso-tipografico(1)`), peso 600, `line-height: 1.2`. | estilo | baja |
| pie-11 | Paso vertical de los enlaces: 32 px (24 de área táctil + 8) frente a 30 px (21 + 9). Se deja como está: los 24 px de alto son contractuales (@s29 `sistema_de_diseno_visual`, @s37 E2E). | estilo | baja |
| pie-12 | El © del prototipo añade «· Centro veterinario registrado nº 28/0791»; la web muestra «© 2026 Galapavet». El número es NO VERIFICABLE (`docs/datos-galapavet.md` §7) y @s12 lo prohíbe: se respeta, no hay cambio. | dato | baja |
| pie-13 | Rótulos legales: prototipo «Aviso legal · Privacidad · Cookies» (los tres a `#faq`); web «Aviso legal · Política de cookies · Personalizar cookies» a las páginas reales (§11, @s9). «Privacidad» no existe publicada (@s11): se respeta, no hay cambio. | dato | baja |
| pie-14 | Descripción de marca: el prototipo tiene dos frases (3 líneas: localidad + especialidades + «urgencias 24 h desde 2013»); la web una (@s1 fija el texto exacto). No hay dato verificado para una segunda frase: se deja la caja más corta. | dato | baja |
| pie-15 | Ancho de contenido 1172 px frente a 1220: el mixin `contenedor` mete `padding-inline: 24px` DENTRO de la caja de 1220 (el prototipo aplica el relleno lateral fuera de la caja de 1220). Es global a las 8 secciones (@s17/@s45 miden la caja, no el contenido): no se toca en esta sección. | estructura | baja |
| pie-16 | El botón fijo de `SelectorPaleta` tapa el último enlace legal en la esquina inferior derecha a 1280 px. Pertenece a `delta_selector`, no a esta sección. | bug | baja |

## Datos reales necesarios

| Campo de la anatomía | Dónde vive hoy | Estado |
| --- | --- | --- |
| Marca gráfica (36×36 con cruz blanca sobre `--primary` en el prototipo) | `public/img/logo-galapavet.webp` (201×201, disco blanco con cruz morada `#77286B` y silueta lima `#B4C718`, `docs/datos-galapavet.md` §10), ya referenciado como `SRC_LOGO` en `PieDePagina.tsx:13` | **Existe.** Se usa el logotipo real, no se reproduce el «+» genérico del prototipo. La cabecera (`Cabecera.tsx`) NO pinta ninguna imagen: si `delta_cabecera` decide añadir la marca gráfica, debe copiar el mismo `<img src={hrefDeDestino(SRC_LOGO)}>` en su propio `.tsx` (ver «Conflictos»: las puertas leen el texto de `PieDePagina.tsx`). |
| Nombre comercial | `datosNegocio.identidad.nombreComercial` (`src/lib/site.ts:72,77`) = «Galapavet» | Existe. |
| Descripción corta | `datosNegocio.identidad.descriptorConLocalidad` (`site.ts:79`) = «Centro integral veterinario en Galapagar, Madrid.» — texto exacto exigido por `pie_de_pagina.feature` @s1 | Existe (una frase). La segunda frase del prototipo (especialidades + «urgencias 24 h» + «desde 2013») NO tiene dato verificado (§7: «desde 2013» no verificable; «24 h» falso). **Alternativa honesta: dejar una sola frase**; no se rellena con el catálogo de servicios porque @s1 fija el texto exacto. |
| Títulos de las tres columnas | Literales «Clínica», «Contenido», «Contacto» en `PieDePagina.tsx:84-86` (contrato @s2) | Existen. |
| Enlaces de «Clínica» (4) | `ENLACES_CLINICA` (`src/data/pieDePaginaEnlaces.ts:16-21`) | Existen (@s3). |
| Enlaces de «Contenido» (4) | `ENLACES_CONTENIDO` (`pieDePaginaEnlaces.ts:24-29`) | Existen (@s4). |
| Enlaces de «Contacto» (4) | `construirEnlacesContacto` (`PieDePagina-logica.ts:62-78`) a partir de `datosNegocio.telefonoClinica/telefonoMovil/telefonoUrgencias` + «Cómo llegar» | Existen (@s5-@s7). El prototipo ponía «Urgencias 24 h» y un email: el real es «Urgencias fuera de horario · 91 851 13 93» y el segundo teléfono; no hay email (§9). |
| Enlaces legales (fila derecha) | `PAGINAS_LEGALES` (`src/data/paginasLegales.ts:15-19`): 3 páginas reales de galapavet.com (§11) | Existen. Sin «Privacidad» (no publicada). Los rótulos son más largos que los del prototipo; la fila cabe de sobra a 1280 (≈ 350 px). |
| Sufijo «(se abre en una ventana nueva)» | `SUFIJO_VENTANA_NUEVA` (`PieDePagina-logica.ts:11`) | Existe; pasa a ir en un span oculto visualmente (pie-3). |
| Aviso de copyright | `textoCopyright(fecha, nombreComercial)` (`PieDePagina-logica.ts:36-38`) → «© 2026 Galapavet» | Existe. El «Centro veterinario registrado nº 28/0791» del prototipo es NO VERIFICABLE (§7) y @s12 lo prohíbe: **se deja el hueco**, sin texto neutro de relleno. |
| Colores (`--card/--border/--ink/--muted/--primary/--on-primary`) | `src/styles/_tokens.scss` (20 roles × 5 variantes) | Existen todos los equivalentes. El par nuevo `--color-primario` sobre `--color-superficie` (hover de enlace) hay que darlo de alta en `MATRIZ_DE_USO_DEL_SISTEMA` (ver «Conflictos»). |
| Tamaños/espacios (36, 11, 14, 17, 9, 36, 20, 12.5 px…) | `src/styles/_api.scss`: `paso-tipografico(-2..5)`, `espaciado(4..96)`, `$radio-circulo`, `$altura-control-pequena` (40 px) | Existen como escalas; los valores exactos del prototipo NO se copian (Decisión 24, @s20/@s23): se usa el paso más cercano. |

No hace falta ningún dato nuevo en `docs/datos-galapavet.md` ni en `src/data/*` para esta sección.

## Conflictos con el contrato vigente

| Escenario | Tensión con el prototipo | Propuesta |
| --- | --- | --- |
| `pie_de_pagina.feature` @s10 («el nombre accesible de cada uno termina, exactamente, en "(se abre en una ventana nueva)"», y el primero es exactamente «Aviso legal (se abre en una ventana nueva)») | El prototipo no muestra ningún aviso. | **Respetar.** El aviso sigue en el DOM como texto (`<span>` con clase oculta solo para lectores: `position:absolute; width/height:1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap` — nunca `display:none`, que lo sacaría del nombre accesible). `textContent` y el nombre calculado siguen siendo idénticos a los de hoy. No usar `aria-label` (rompería el test de `textContent` y separaría nombre visible de nombre accesible, SC 2.5.3). |
| `pie_de_pagina.feature` @s9 / @s11 (rótulos y destinos de las páginas legales reales; no existe «Privacidad») | El prototipo muestra «Aviso legal · Privacidad · Cookies». | Respetar: solo cambia la maquetación (una fila), no los rótulos. |
| `pie_de_pagina.feature` @s12 / @s14 (© sin número de registro; ningún literal heredado) | El prototipo lleva «nº 28/0791». | Respetar: se deja la barra con «© 2026 Galapavet» a la izquierda. |
| `pie_de_pagina.feature` @s1 (descripción exacta; logotipo decorativo sin rol `img` con nombre) | El prototipo tiene 2 frases y una marca gráfica CSS. | Respetar: `alt=""` se mantiene; el envoltorio de la fila logotipo+nombre es un `<div>` sin `role`. |
| `pie_de_pagina.feature` @s2 (exactamente 3 `heading` dentro de `contentinfo`, cada uno seguido de un `list`) | El prototipo usa `<div>` para los títulos y `<span>` para el nombre. | Respetar: los títulos siguen siendo `h3` (estilizados como versalitas pequeñas) y el nombre sigue siendo `<p>`; el `ul` sigue siendo el hermano inmediato del `h3` (el test usa `nextElementSibling`). |
| `rediseno_visual.feature` @s20 (los seis pasos inferiores de la escala son fijos) / @s23 (radios derivados de la escala) / Decisión 24 («no copies estos valores») | El prototipo usa 11, 12.5, 14, 17 px y radio 11 px. | Respetar: `paso-tipografico(-2)`, `(-1)`, `(1)`; `$radio-circulo`; `espaciado()`; `$altura-control-pequena`. Diferencias ≤ 4 px. |
| `rediseno_visual.feature` @s11 (ninguna variante suspende su matriz de uso) + `src/lib/diseno/matrizDeContraste.test.ts:437,442` (`toHaveLength(21)`) | El hover `--primary` sobre `--card` del prototipo es un par nuevo para el sistema. | **Enmendar la matriz**: añadir `{ rol: 'primario', fondo: 'superficie', uso: 'texto normal' }` con el comentario `// PieDePagina.module.scss (hover de enlace)` y subir el recuento del test a 22. Ratios calculados con los hexadecimales de `_tokens.scss`: clinica 8.7, calida 4.9, tech 6.4, eco 5.5, marca 9.1 — todos ≥ 4.5. (Alternativa sin tocar la matriz: hover a `--color-tinta`, par ya declarado; menos fiel.) |
| `rediseno_visual.feature` @s30 (`imagenes.spec.ts`: toda imagen `lazy` + `async`, con `width`/`height`) + @s31 (hueco con `--color-fondo-alterno`) + `despliegue_github_pages.feature` @s19 (no cambiar `alt/width/height/loading/decoding` del `<img>`) | El «cuadro vacío» de la captura es este mecanismo funcionando. | Respetar: no se toca ningún atributo del `<img>`. Solo cambia su CSS (círculo, 40 px, en fila con el nombre). |
| `despliegue_github_pages.feature` @s7 (`src/enlaces-internos-hrefDeDestino.test.ts:49`: regex `enlacesLegales\.map[\s\S]*?href=\{enlace\.destino\}`) y @s19 (`src/imagenes-hrefDeDestino.test.ts:53`: `src=\{hrefDeDestino\(`), más `inventarioActivosPublicos.test.ts:103` (extrae `/img/...` del texto de `PieDePagina.tsx`) | Ninguna, pero condicionan cómo se escribe el `.tsx`. | Respetar los nombres: la variable sigue llamándose `enlacesLegales`, el `href` sigue siendo `{enlace.destino}`, el `<img>` y el literal `'/img/logo-galapavet.webp'` siguen dentro de `PieDePagina.tsx` (no extraer la marca a un componente compartido). |
| `sistema_de_diseno_visual.feature` @s29 y `accesibilidad.spec.ts` @s37 (cada enlace del pie ≥ 24×24 px) | El prototipo tiene enlaces de 21 px de alto. | Respetar: se mantiene `@include area-tactil-minima` en los enlaces (paso vertical 32 px, pie-11). |
| `sistema_de_diseno_visual.feature` @s24 / `puertaLiteralesColor` (cero colores literales en `.module.scss`) | La marca gráfica del prototipo usa blanco literal. | Respetar: solo tokens; el logotipo real es una imagen, no hace falta pintar nada. |
| `sistema_de_diseno_visual.feature` @s33 + `identidad_visual.feature` @s16 (`escalaMovimiento.ts`: solo 150/300 ms `ease-out`, dentro de `@media (prefers-reduced-motion: no-preference)`) | El prototipo transiciona el color en `.3s ease`. | Respetar: `transition: color 150ms ease-out` dentro de la media query. |
| `rediseno_visual.feature` @s48 / `identidad_visual.feature` @s49 (`css-presupuesto.spec.ts`: `TECHO_BYTES_CSS = 8000`) | Medido hoy: la hoja de la portada transfiere **7.489 B** comprimidos (`encodedBodySize`); quedan **511 B** de margen. | Respetar con disciplina: la hoja nueva del pie debe ser más corta o igual que la actual (reutilizar selectores, no duplicar mixins). Si tras el cambio la medida supera 8000, el techo NO se sube: se recorta CSS. |
| `rediseno_visual.feature` @s45 (axe 0 violaciones en 30 combinaciones) | Quitar el subrayado. | Compatible: los enlaces del pie viven en listas, no dentro de un bloque de texto, así que la regla `link-in-text-block` no aplica; el color `--color-texto-suave` sobre superficie ya está en la matriz. |
| `ensamblaje_landing.feature` @s7 / `layout.spec.ts` @s46 (pie pegado al fondo) | — | Respetar: `.pie { margin-block-start: auto }` se conserva. |

## Tests que romperán

Con el plan de abajo aplicado tal cual, **ningún test unitario existente de `PieDePagina` rompe** (todos miden roles, `textContent`
y atributos, no clases). Los que están en riesgo si el craftsman se desvía, y los que rompen a propósito:

| Test | Fichero | Rompe / riesgo | Por qué |
| --- | --- | --- | --- |
| «@s10 … los 3 enlaces declaran target="_blank" … y el nombre accesible termina en el aviso; el primero es exacto» | `src/components/PieDePagina.test.tsx:221-237` | Riesgo | Compara `enlace.textContent` con «Aviso legal (se abre en una ventana nueva)». El span oculto debe contener exactamente ` (se abre en una ventana nueva)` (espacio inicial incluido) y no puede haber ningún espacio/salto de línea de JSX entre `{textoVisible}` y `<span>`. |
| «@s2 … 3 heading … cada uno seguido de una lista de 4 listitems» | `PieDePagina.test.tsx:37-57` | Riesgo | Usa `encabezado.nextElementSibling`: no meter ningún envoltorio entre el `h3` y el `ul`. |
| «@s12/@s13 … la barra inferior muestra exactamente "© 2026 Galapavet"» | `PieDePagina.test.tsx:265-284` | Riesgo | Localiza la barra como `lista.parentElement`: el `<p>` del © y el `ul` legal deben seguir siendo hijos del mismo `div`. |
| «@s1 … logo decorativo …» | `PieDePagina.test.tsx:14-35` | Riesgo | `queryAllByRole('img')` debe seguir dando 0: `alt=""` intacto, sin `role="img"` en el envoltorio. |
| «@s11 con 2 páginas inyectadas … sin "Privacidad"» | `PieDePagina.test.tsx:239-263` | Riesgo | `screen.queryByRole('link', { name: 'Privacidad' })` — no cambia. |
| «declara exactamente 21 pares» / «21 claves únicas» | `src/lib/diseno/matrizDeContraste.test.ts:437,442` | **Rompe a propósito** | Al añadir el par `primario/superficie` para el hover, el recuento pasa a 22 (se actualiza el literal escrito a mano en el test, patrón `doble-de-test-anclado-al-literal`). |
| «@s7 "PieDePagina.tsx" llama a hrefDeDestino» y «los enlaces legales … siguen renderizando enlace.destino» | `src/enlaces-internos-hrefDeDestino.test.ts:37-56` | Riesgo | Solo si se renombra `enlacesLegales` o se cambia `href={enlace.destino}`. |
| «@s19 "PieDePagina.tsx" calcula el src del <img> con hrefDeDestino» | `src/imagenes-hrefDeDestino.test.ts:53-57` | Riesgo | Solo si el `<img>` sale de `PieDePagina.tsx`. |
| «ninguna ruta declarada carece de fichero real» | `src/lib/diseno/inventarioActivosPublicos.test.ts:126-138` | Riesgo | Solo si desaparece el literal `/img/logo-galapavet.webp` de `PieDePagina.tsx`. |
| «@s18 … escala de movimiento» / «@s33 … prefers-reduced-motion» | `src/lib/diseno/escalaMovimiento.test.ts`, `src/lib/diseno/movimientoRespetuoso.test.ts` | Riesgo | Rompen si la transición del hover queda fuera de `@media (prefers-reduced-motion: no-preference)` o usa una duración ≠ 150/300 ms o la palabra `all`. |
| «@s24 ningún fichero de estilos declara un color literal» | `src/lib/puertaLiteralesColor.test.ts` (aplicado a los 17 módulos) | Riesgo | Rompe si el módulo escribe un hexadecimal, `rgb()` o nombre de color. |
| E2E «@s49 la portada: suma de bytes de hoja de estilo <= techo» | `tests/e2e/css-presupuesto.spec.ts:24-40` | **Riesgo alto** | 7.489 B de 8.000 B hoy. Hay que volver a medir tras el cambio; la hoja del pie debe quedar igual o más corta. |
| E2E «@s37 … cada control visible mide >= 24×24 px» | `tests/e2e/accesibilidad.spec.ts:74-96` | Riesgo | Rompe si se quita `area-tactil-minima` de los enlaces del pie. |
| E2E «@s36/@s45 … 0 violaciones» | `tests/e2e/accesibilidad.spec.ts:24-72, 513-560` | Riesgo | Rompe si el span oculto usa `display:none`/`visibility:hidden` (nombre accesible vacío del sufijo no rompe axe, pero sí @s10) o si el hover usa un par sin contraste. |
| E2E «@s27 … toda naturalWidth > 0», «@s30 … lazy+async», «@s31 … hueco --color-fondo-alterno» | `tests/e2e/imagenes.spec.ts:24-50, 150-184, 186-230` | Riesgo | Rompen si se tocan los atributos del `<img>` o se quita `@include hueco-de-imagen(1, 1)`. |
| E2E «@s44 … 320px: ningún elemento sobresale por la derecha» | `tests/e2e/layout.spec.ts:14-40`, `tests/e2e/fidelidad.spec.ts:372-400` | Riesgo bajo | El span oculto es `position:absolute` de 1×1 px dentro del enlace: queda dentro del viewport. `max-width: 34ch` en la descripción no desborda. |
| E2E «@s46 … el pie llega al borde inferior» | `tests/e2e/layout.spec.ts:62-80` | Riesgo bajo | Solo si se quita `margin-block-start: auto`. |
| E2E «@s22 h1, h2 y h3 tienen una razón interlineado/tamaño …» | `tests/e2e/geometria-escalas.spec.ts:408-447` | No rompe | Mide el PRIMER `h3` de la portada (tarjeta de servicio), no los del pie; aun así los `h3` del pie heredan `line-height: 1.08` de `global.scss:178` y no lo cambian. |

## Plan de cambio

Orden pensado para que cada paso deje la suite en verde y para no gastar presupuesto de CSS a ciegas.

1. **`src/components/PieDePagina-logica.ts` — separar texto visible y aviso del enlace legal (lógica pura).**
   Cambiar `EnlaceLegalRenderable` a `{ readonly textoVisible: string; readonly avisoVentanaNueva: string; readonly destino: string }`
   y `construirEnlacesLegales` a devolver `textoVisible: pagina.nombre`, `avisoVentanaNueva: SUFIJO_VENTANA_NUEVA` (la constante
   ya existe en la línea 11, con su espacio inicial), `destino: pagina.destino`. Sin ninguna otra decisión nueva.
   *Test nuevo* (`PieDePagina-logica.test.ts`, describe «@s10 el aviso de ventana nueva es un campo aparte del rótulo visible»):
   `construirEnlacesLegales([{ nombre: 'Aviso legal', destino: 'https://galapavet.com/aviso-legal' }])` `toEqual` exactamente
   `[{ textoVisible: 'Aviso legal', avisoVentanaNueva: ' (se abre en una ventana nueva)', destino: 'https://galapavet.com/aviso-legal' }]`;
   segundo caso con el catálogo real (3 entradas, `toHaveLength(3)`, ningún `textoVisible` contiene «ventana»). Muerde los mutantes
   de la cadena, del `map` y del espacio inicial.

2. **`src/components/PieDePagina.tsx` — enlaces legales con el aviso oculto visualmente.**
   Dentro de `enlacesLegales.map(...)` (conservar ese nombre y `href={enlace.destino}`, `target="_blank"`, `rel="noopener noreferrer"`):
   `<a …>{enlace.textoVisible}<span className={styles.soloLectores}>{enlace.avisoVentanaNueva}</span></a>` en una sola línea
   (sin espacios de JSX entre las dos expresiones). `key={enlace.destino}` se mantiene.
   *Test nuevo* (`PieDePagina.test.tsx`, describe «fidelidad: el aviso de ventana nueva no forma parte del rótulo visible»):
   el primer enlace legal tiene un único `span` hijo cuyo `textContent` es exactamente ` (se abre en una ventana nueva)`, el texto del
   enlace fuera del span es «Aviso legal», y `screen.getByRole('link', { name: 'Aviso legal (se abre en una ventana nueva)' })` lo encuentra
   (nombre accesible intacto). Los tests @s9/@s10/@s11 existentes siguen pasando sin cambios.

3. **`src/components/PieDePagina.tsx` — bloque de marca en fila + columnas con clase.**
   - `.marca`: `<div className={styles.marca}><div><img …intacto… /><p>{nombreComercial}</p></div><p>{descriptorConLocalidad}</p></div>`.
     El `<img>` se copia carácter a carácter (`src={hrefDeDestino(SRC_LOGO)} alt="" width={201} height={201} loading="lazy" decoding="async"`).
   - `ColumnaEnlaces`: raíz `<div className={styles.columna}>`, y el `h3` sigue inmediatamente seguido del `ul`.
   - `SRC_LOGO` y su comentario «PENDIENTE» (líneas 9-13): el fichero SÍ existe desde el 24/08 (`public/img/logo-galapavet.webp`);
     actualizar el comentario para que no afirme lo contrario (no cambia el literal).
   *Test nuevo* (`PieDePagina.test.tsx`, describe «fidelidad: la marca se lee como logotipo y nombre en una fila, con la descripción debajo»):
   el `<p>` «Galapavet» y la imagen decorativa (`pie.querySelector('img')`) comparten el mismo `parentElement`; ese padre precede
   (`compareDocumentPosition` → `DOCUMENT_POSITION_FOLLOWING`) al `<p>` de la descripción; la imagen es el primer hijo de ese padre y el
   nombre el segundo. Se afirma sobre estructura DOM, nunca sobre `className` (regla del repo, `vite.config.ts`).

4. **`src/components/PieDePagina.module.scss` — reescritura completa, orientada a fidelidad y a presupuesto.** Solo tokens y escalas.
   ```scss
   .pie { margin-block-start: auto; border-block-start: $ancho-borde-fino solid var(--color-borde);
          background-color: var(--color-superficie); color: var(--color-texto); font-size: paso-tipografico(-1); }

   .interior { @include contenedor; display: flex; flex-wrap: wrap; align-items: flex-start; gap: espaciado(32);
               padding-block: espaciado(64) espaciado(24);      // prototipo: 72 / 28 a 1280
               a { @include foco-visible; @include area-tactil-minima; display: inline-flex; align-items: center;
                   color: var(--color-texto-suave); text-decoration: none;
                   @media (prefers-reduced-motion: no-preference) { transition: color 150ms ease-out; }
                   &:hover { color: var(--color-primario); } }
               ul { list-style: none; margin: 0; padding: 0; display: flex; gap: espaciado(8); } }

   .marca { flex: 1 1 260px; min-width: 0;
            > div { display: flex; align-items: center; gap: espaciado(12); margin-block-end: espaciado(12); }   // prototipo: 11 / 14
            img { @include hueco-de-imagen(1, 1); width: $altura-control-pequena; height: $altura-control-pequena;   // 40px (prototipo 36)
                  border-radius: $radio-circulo; }
            p { margin: 0; }
            > div p { font-family: var(--fuente-titulares); font-weight: 600; font-size: paso-tipografico(1); line-height: 1.2;
                      color: var(--color-tinta); }                                                            // prototipo: 17px/600
            > p { line-height: 1.7; max-width: 34ch; color: var(--color-texto-suave); } }

   .columna { flex: 1 1 170px; min-width: 0;
              h3 { font-family: var(--fuente-texto); font-size: paso-tipografico(-2); font-weight: 700; letter-spacing: 0.14em;
                   text-transform: uppercase; color: var(--color-tinta); margin-block-end: espaciado(12); }     // prototipo: 11px / 14
              ul { flex-direction: column; } }

   .barraInferior { flex-basis: 100%; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
                    gap: espaciado(12) espaciado(24); margin-block-start: espaciado(32); padding-block-start: espaciado(24);
                    border-block-start: $ancho-borde-fino solid var(--color-borde); color: var(--color-texto-suave);
                    p { margin: 0; }
                    ul { flex-wrap: wrap; gap: espaciado(16); } }                                             // fila, no columna

   .soloLectores { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
   ```
   Claves: (a) `flex-direction: column` vive SOLO en `.columna ul`, así la lista legal hereda la fila; (b) `.marca`/`.columna` reparten
   la fila 349/259/259/259 a 1220 como el prototipo; (c) la transición cumple `escalaMovimiento` (150 ms, `ease-out`, dentro de la
   media query); (d) ningún literal de color; (e) los `h3` conservan `line-height: 1.08` de `global.scss`.
   Coste estimado: la hoja actual pesa 97 líneas; esta, unas 60. Debe medirse con `pnpm exec playwright test tests/e2e/css-presupuesto.spec.ts`
   tras `pnpm run build` (7.489 B hoy, techo 8.000 B).

5. **`src/lib/diseno/matrizDeContraste.ts` + su test — dar de alta el par del hover.**
   Añadir `{ rol: 'primario', fondo: 'superficie', uso: 'texto normal' }, // PieDePagina.module.scss (enlace con el puntero encima)`
   en el bloque «Texto corrido…» y cambiar `toHaveLength(21)` / `.size).toBe(21)` a 22 en `matrizDeContraste.test.ts:437,442`.
   La puerta de @s11 recalcula los ratios en las 5 variantes (8.7 / 4.9 / 6.4 / 5.5 / 9.1, todos ≥ 4.5).

6. **`tests/e2e/fidelidad-pie.spec.ts` (nuevo) — anatomía medida en navegador real, bajo `SUBPATH_DE_PRODUCCION`.**
   - «cuatro cajas en una fila»: a 1280×900, los 4 hijos directos del contenedor del pie que preceden a la barra inferior comparten la
     misma `y` (tolerancia 1 px); las 3 columnas de enlaces miden lo mismo entre sí (±1 px) y ≥ 170 px; la de marca es más ancha que
     cada columna. Localizadores por rol: `page.getByRole('contentinfo')`, `getByRole('heading', { level: 3 })` y su `closest('div')`.
   - «logotipo y nombre en fila»: el rectángulo de la imagen decorativa (`contentinfo img`) y el del texto «Galapavet» se solapan en
     vertical (centros a ≤ 4 px), y la imagen queda a la izquierda del nombre; la imagen mide 40×40 y su `border-radius` computado es `50%`.
   - «enlaces legales en una fila a la derecha del ©»: los 3 enlaces de `getByRole('list', { name: 'Enlaces legales' })` comparten `y`
     (±1 px); el más a la izquierda empieza a la derecha del borde derecho del texto «© …»; el `innerText` de cada uno NO contiene
     «(se abre en una ventana nueva)» y su nombre accesible SÍ termina en ese texto (`getByRole('link', { name: /se abre en una ventana nueva\)$/ })`
     devuelve 3).
   - «sin subrayado y con hover»: `text-decoration-line` computado `none` en los 15 enlaces del pie; al `hover` sobre «Servicios» el
     color computado pasa a `--color-primario` de la variante activa (leer el token con `getPropertyValue`, comparar tras `page.hover`).
   - «logotipo real cargado»: tras `scrollIntoViewIfNeeded()` y `await img.evaluate(i => i.decode())`, `naturalWidth === 201` y la
     respuesta de `/img/logo-galapavet.webp` es 200 (refuerza @s27/@s43 con el caso concreto del pie).
   - «320 px»: el pie no desborda (`scrollWidth <= clientWidth`) y las 4 cajas se apilan (cada una con `y` distinta).
   Recuentos afirmados a mano: 4 cajas, 3 columnas, 12 enlaces de columna, 3 legales.

7. **Verificación de cierre (sin cambiar nada más):** `bin\harness.ps1 test` (Vitest, incluidas las puertas de texto crudo),
   `pnpm run build` + `pnpm exec playwright test tests/e2e/css-presupuesto.spec.ts tests/e2e/accesibilidad.spec.ts tests/e2e/imagenes.spec.ts tests/e2e/layout.spec.ts tests/e2e/fidelidad-pie.spec.ts`,
   `bin\harness.ps1 mutate src/components/PieDePagina-logica.ts` (100 %), y repetir la captura del pie a 1280 px para compararla
   con `diseno_pie_zoom.png` (esperado: alto del pie ≈ 310-330 px, cuatro cajas alineadas, barra inferior de una línea).

Fuera de este plan, a propósito: el `padding-inline: 24px` del mixin `contenedor` (pie-15, global), el solape del `SelectorPaleta`
(pie-16) y cualquier segunda frase de descripción (pie-14, sin dato).
