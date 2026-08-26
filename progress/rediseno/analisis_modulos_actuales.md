# Inventario de la implementación actual — módulos de Galapavet

Fecha del inventario: 26/08/2026. Rama `main`, árbol limpio.

Todo lo que sigue está medido sobre el código real del repositorio y citado como
`fichero:linea`. Cuando un dato no aparece en la fuente se escribe
**NO CONSTA EN LA FUENTE**; nunca se rellena con un valor plausible.

Ficheros leídos: `src/pages/Landing.tsx`, `src/pages/Landing.module.scss`, los 13
componentes de `src/components/*.tsx` (12 con `.module.scss` hermano, más
`MetadatosPagina.tsx`, que no tiene hoja), las 4 páginas `src/pages/Pagina*.tsx`
con sus `.module.scss`, `src/styles/_api.scss`, `src/styles/_tokens.scss`,
`src/styles/global.scss` y los 10 catálogos de `src/data/`.

---

## 0. La capa de sistema: qué ofrece hoy `_api.scss`

### 0.1 Escalas

- Escala tipográfica, 8 pasos fijos en px (no `clamp`): `-2: 10.24px`, `-1: 12.8px`,
  `0: 16px`, `1: 20px`, `2: 25px`, `3: 31.25px`, `4: 39.06px`, `5: 48.83px`
  — `src/styles/_api.scss:28-37`. Función de acceso `paso-tipografico($paso)`
  en `src/styles/_api.scss:39-41`.
- Escala de espaciado, 9 pasos: `4, 8, 12, 16, 24, 32, 48, 64, 96`
  — `src/styles/_api.scss:46-56`. Función `espaciado($paso)` en
  `src/styles/_api.scss:58-60`. **No existen los pasos 20 ni 56** (ver hallazgos
  H3/H4/H5).
- Radios, 5 pasos: `$radio-pequeno: espaciado(4)` = 4px
  (`src/styles/_api.scss:106`), `$radio-medio: espaciado(12)` = 12px (`:107`),
  `$radio-grande: espaciado(24)` = 24px (`:108`), `$radio-completo: 999px`
  (`:109`), `$radio-circulo: 50%` (`:110`).
- Bordes, 2 pasos: `$ancho-borde-fino` = 1px (`src/styles/_api.scss:117`),
  `$ancho-borde-control` = 1.5px (`:118`). Más `$grosor-foco: 2px` (`:71`).
- Alturas de control, 3 pasos: `$altura-control-pequena` = 40px
  (`src/styles/_api.scss:123`), `$altura-control-media` = 48px (`:124`),
  `$altura-control-grande` = 56px (`:125`).
- Ancho máximo de contenedor: `$ancho-maximo-contenedor: 1024px`
  — `src/styles/_api.scss:133`.

### 0.2 Sombras y color

Las dos sombras son custom properties conmutadas por variante, no valores de
Sass: `--sombra-reposo: 0 6px 18px rgba(83, 28, 75, 0.07)` y
`--sombra-elevada: 0 18px 45px rgba(83, 28, 75, 0.1)` en la variante `marca`
— `src/styles/_tokens.scss:77-78`. En `lima` valen lo mismo (`:102-103`), en
`verde` cambian el tinte a `rgba(50, 78, 53, …)` (`:133-134`) y en `noche` pasan
a negro puro con opacidad reforzada `0.35`/`0.45` (`:173-174`).

### 0.3 Los 10 mixins de patrón y su uso real medido

Recuento obtenido con `grep -rn "@include …" --include="*.scss" src/`:

| Mixin | Definición | Usos en `.module.scss` |
|---|---|---|
| `contenedor` | `_api.scss:135-151` | 8 (`Landing:24`, `Landing:34`, `CampanasPortada:6`, `PieDePagina:18`, `PaginaBlog:2`, `PaginaCampanas:2`, `PaginaTienda:2`, `PaginaNoEncontrada:2`) |
| `tarjeta` | `_api.scss:171-187` | 13 |
| `boton-primario` | `_api.scss:216-241` | 10 |
| `boton-fantasma` | `_api.scss:246-271` | 10 |
| `hueco-de-imagen` | `_api.scss:203-210` | 7 |
| `pildora-etiqueta` | `_api.scss:275-287` | 5 |
| `pildora-filtro` | `_api.scss:292-319` | 3 |
| `eyebrow` | `_api.scss:324-332` | **2** (`Hero:14`, `PaginaTienda:64`) |
| `prosa` | `_api.scss:337-359` | **1** (`PaginaBlog:77`) |
| `fila-de-accion-de-tarjeta` | `_api.scss:193-197` | **0** |

`base` de `tarjeta` (`src/styles/_api.scss:171-187`): `display:flex` +
`flex-direction:column`, fondo `--color-superficie`, borde 1px
`--color-borde`, `border-radius: $radio-grande` (24px),
`box-shadow: var(--sombra-reposo)`, `overflow:hidden` y hover a
`--sombra-elevada` (`:184-186`).

`boton-primario` (`:216-241`): `min-height: $altura-control-grande` (56px),
`padding-inline: espaciado(24)` (24px), `border-radius: $radio-completo`
(999px), `font-size: paso-tipografico(0)` (16px), `font-weight: 700`.

`boton-fantasma` (`:246-271`): `min-height: $altura-control-media` (48px),
borde 1.5px `--color-borde-control`, `border-radius: 999px`,
`font-size: 16px`, `font-weight: 600`, y `padding-inline: espaciado(20)`
(`:254`) **que no llega a emitirse** (H3).

`pildora-etiqueta` (`:275-287`): `padding-inline: 12px`, `padding-block: 4px`,
radio 999px, fondo `--color-acento-suave`, `font-size: 12.8px`, peso 700,
`letter-spacing: 0.08em`, mayúsculas.

`pildora-filtro` (`:292-319`): `min-height: 40px`, `padding-inline: 16px`,
radio 999px, borde 1px `--color-borde`, `font-size: 12.8px`, peso 600, y el
estado activo en `[aria-pressed='true']` (`:314-318`).

`eyebrow` (`:324-332`): `margin-block-end: 4px`, `font-size: 12.8px`, peso 700,
`letter-spacing: 0.12em`, mayúsculas, color `--color-acento-tinta`.

`hueco-de-imagen($ancho,$alto)` (`:203-210`): `aspect-ratio`, `width:100%`,
`height:auto`, fondo `--color-fondo-alterno`, `object-fit:cover`, `display:block`.

`prosa` (`:337-359`): `font-size: paso-tipografico(1)` (20px),
`line-height: 1.8`, `p { margin-block-end: 16px }`, `h2` en
`paso-tipografico(3)` (31.25px) con `margin-block: 32px 16px`, `blockquote` con
borde inicial de 1.5px `--color-acento-tinta`.

### 0.4 La capa de documento (`global.scss`)

- `--fuente-titulares: 'Outfit', 'Outfit Fallback', 'Arial', sans-serif`
  (`src/styles/global.scss:41`) y
  `--fuente-texto: 'DM Sans', 'DM Sans Fallback', 'Arial', sans-serif` (`:42`).
- `--altura-cabecera: espaciado(64)` = 64px (`src/styles/global.scss:49`).
- `body`: `line-height: 1.5`, fondo `--color-fondo`, color `--color-texto`,
  familia `--fuente-texto` (`src/styles/global.scss:117-123`).
- `#root`: contenedor flex en columna, `min-height:100svh`,
  `padding-block-start: var(--altura-cabecera)`
  (`src/styles/global.scss:143-149`).
- Anillo de foco global 2px con `outline-offset: 2px`
  (`src/styles/global.scss:192-195`).

---

## 1. `Landing` (envoltorio de la ruta `/`)

**Ficheros:** `src/pages/Landing.tsx`, `src/pages/Landing.module.scss`.

**Qué renderiza hoy.** Un fragmento con `MetadatosPagina` (sin DOM) y 8
envoltorios `<div>` con `id` propio, cada uno con un componente de sección dentro
— `src/pages/Landing.tsx:48-75`. Orden real: `<div id="inicio">`>`Hero` (`:51-53`),
`<div id="servicios">`>`Servicios` (`:54-56`), `CampanasPortada` **sin `<div>` ni
`id`** (`:57`), `<div id="equipo">`>`Equipo` (`:58-60`),
`<div id="reservar">`>`ReservaChat` (`:61-63`), `<div id="galeria">`>`Galeria`
(`:64-66`), `<div id="contacto">` con **dos** hijos, `FormularioContacto` e
`InformacionContacto` (`:67-70`), y `<div id="faq">`>`Faq` (`:71-73`).

**Mixins de `_api.scss` que usa.** `contenedor`, aplicado al **hijo directo** de
cada envoltorio: `src/pages/Landing.module.scss:24` (`.seccion > *`) y `:34`
(`.seccionAlterna > *`).

**Mixins que NO usa y le vendrían bien.** Ninguno: es un envoltorio de bandeado,
no un módulo de contenido. `tarjeta`, `boton-*`, `pildora-*`, `eyebrow`,
`hueco-de-imagen`, `fila-de-accion-de-tarjeta` y `prosa` no tienen sitio aquí.

**Hueco de imagen.** No. Este fichero no renderiza ninguna imagen.

**Props y datos.** Un único prop, `calleDireccion?: string`
(`src/pages/Landing.tsx:25`), con valor por defecto
`datosNegocio.direccion.calle` (`:34`), procedente de `src/lib/site.ts:66`
(`'Carretera de Torrelodones, 11'`). Existe solo para la prueba de coherencia
entre texto visible y JSON-LD (`src/pages/Landing.tsx:18-24`).

**Valores que aplica hoy.**
- Radio: ninguno.
- Sombra: ninguna.
- Tipografía: ninguna (hereda de `body`).
- Espaciado: `scroll-margin-block-start: espaciado(96)` = 96px en las dos clases
  (`src/pages/Landing.module.scss:19` y `:29`); el `padding-inline: espaciado(24)`
  del contenedor llega vía el mixin (`src/styles/_api.scss:150`).
- Color: `.seccion` usa `--color-fondo` (`:20`), `.seccionAlterna` usa
  `--color-fondo-alterno` (`:30`).
- Ancho de contenedor: 1024px al hijo directo.

---

## 2. `Cabecera`

**Ficheros:** `src/components/Cabecera.tsx`, `src/components/Cabecera.module.scss`.

**Qué renderiza hoy.** `<header>` (`src/components/Cabecera.tsx:77`) con:
`<div>` > `<a href="#inicio">` con el nombre comercial + `<p>` con el descriptor
(`:78-81`); `<nav aria-label="Navegación principal">` > `<ul>` > `<li>` > `<a>`
por enlace (`:82-86`, lista en `:33-47`); `<button type="button">` de menú móvil
(`:87-98`); y el panel `<div id>` con la misma `<ul>`/`<li>`/`<a>` (`:99-113`).
No hay ningún `<img>` de logotipo: la marca es texto.

**Mixins que usa.** `boton-fantasma` en `.botonMenu`
(`src/components/Cabecera.module.scss:109`). Además los dos utilitarios
`foco-visible` (`:37`, `:81`, `:107`, `:137`) y `area-tactil-minima` (`:82`,
`:108`, `:138`).

**Mixins que NO usa y le vendrían bien.**
- `contenedor` — **es el único bloque de banda completa del sitio que no lo usa**.
  Resuelve su margen con `padding-inline: espaciado(24)`
  (`src/components/Cabecera.module.scss:22`) sin `max-width`, así que en
  pantallas anchas el nombre comercial y la navegación se van a los bordes
  mientras todo el contenido de debajo queda recortado a 1024px.
- `eyebrow` — el `<p>` del descriptor (`src/components/Cabecera.tsx:80`) reescribe
  a mano exactamente el patrón del mixin: versalitas, peso, `letter-spacing`
  (`src/components/Cabecera.module.scss:45-52`), pero con valores propios
  (`paso-tipografico(-2)` y `0.14em` en vez de `-1` y `0.12em`).
- `pildora-filtro` — los enlaces de navegación ya llevan radio 999px (`:86`) y un
  estado marcado por atributo `[aria-current='page']` (`:100-102`): son una
  píldora escrita a mano.

**Hueco de imagen.** No. `src/data/navegacion.ts:9-12` declara solo `nombre` y
`destino`: **NO CONSTA EN LA FUENTE** ninguna ruta de imagen ni de logotipo.

**Props y datos.** `ancho: number` (obligatorio, medido por el integrador),
`enlaces?: readonly EnlaceNavegacion[]` y `rutaActual?: string`
(`src/components/Cabecera.tsx:8-20`). Por defecto `ENLACES_NAVEGACION`
(`:52`), los 8 destinos de `src/data/navegacion.ts:14-23`. El nombre comercial y
el descriptor salen de `datosNegocio.identidad` (`src/components/Cabecera.tsx:79-80`),
definido en `src/lib/site.ts:76-80`.

**Valores que aplica hoy.**
- Radio: 999px en los enlaces de escritorio
  (`src/components/Cabecera.module.scss:86`); 12px en los del panel móvil (`:142`).
- Sombra: `--sombra-elevada` solo en `.panelMovil` (`:125`). La cabecera en sí no
  tiene sombra, se separa con `border-block-end` de 1px `--color-borde` (`:25`).
- Tipografía: base `paso-tipografico(0)` = 16px (`:26`); marca en
  `--fuente-titulares`, peso 700, `paso-tipografico(1)` = 20px (`:38-40`);
  descriptor en `paso-tipografico(-2)` = 10.24px, peso 600,
  `letter-spacing: 0.14em`, mayúsculas (`:47-50`).
- Espaciado: `min-height: var(--altura-cabecera)` = 64px (`:13`),
  `gap: espaciado(16)` (`:20`), `padding-block: espaciado(12)` (`:21`),
  `padding-inline: espaciado(24)` (`:22`); `gap: espaciado(8)` en la lista de
  escritorio (`:75`) y `espaciado(4)` en la móvil (`:130`).
- Ancho de contenedor: **ninguno** (banda completa, `inset-inline: 0`, `:15`).

---

## 3. `Hero`

**Ficheros:** `src/components/Hero.tsx`, `src/components/Hero.module.scss`.

**Qué renderiza hoy.** `<section>` (`src/components/Hero.tsx:39`) con `<p>` de
ubicación (`:40`), `<h1>` con el titular (`:41`), `<p>` descriptivo (`:42`),
`<div>` con dos `<a>` — «Reservar cita» y «Llamar …» (`:43-46`) — y una `<dl>`
con un `<div>` > `<dt>` + `<dd>` por tramo horario (`:47-56`).

**Mixins que usa.** `eyebrow` sobre `> p:first-child`
(`src/components/Hero.module.scss:14`), `boton-primario` sobre `a:first-child`
(`:53`) y `boton-fantasma` sobre `a:not(:first-child)` (`:61`).

**Mixins que NO usa y le vendrían bien.**
- `hueco-de-imagen` — el hero es la única sección de portada sin ninguna imagen,
  aunque es el bloque que más peso visual necesita.
- `tarjeta` — la `<dl>` de horario (`:65-89`) es un bloque de datos separado por
  un `border-block-start` a mano (`:70`); una tarjeta lo cerraría.
- `pildora-etiqueta` — el eyebrow «Galapagar · Madrid» es un dato de ubicación,
  candidato natural a píldora.

**Hueco de imagen.** No. El titular, la ubicación y el texto descriptivo son
constantes literales del propio `.tsx`
(`src/components/Hero.tsx:28-31`); **no hay fichero en `src/data/` para el hero**
y por tanto **NO CONSTA EN LA FUENTE** ninguna ruta de imagen.

**Props y datos.** `telefono?: string | null` y
`horario?: readonly FranjaHorario[] | null`
(`src/components/Hero.tsx:12-26`). Por defecto
`datosNegocio.telefonoClinica.textoVisible` = `'91 082 92 67'`
(`src/lib/site.ts:10`) y `datosNegocio.horario`, los 3 tramos de
`src/lib/site.ts:31-35`. `null` es la sentinela de «la fuente única no lo
declara» (`src/components/Hero.tsx:16-25`).

**Valores que aplica hoy.**
- Radio: solo el heredado de los dos mixins de botón (999px).
- Sombra: ninguna propia.
- Tipografía: `h1` en `--fuente-titulares`, `paso-tipografico(5)` = 48.83px,
  `line-height: 1.1` (`src/components/Hero.module.scss:18-20`); párrafo
  descriptivo en `paso-tipografico(1)` = 20px con `--color-texto-suave` (`:31-33`);
  `dt` en peso 700 con `--color-tinta` (`:80-81`); `dd` en
  `paso-tipografico(-1)` = 12.8px (`:87`).
- Espaciado: `padding-block: espaciado(64)` (`:5`),
  `margin-block: espaciado(8) espaciado(16)` en el `h1` (`:21`),
  `margin-block-end: espaciado(24)` en el párrafo (`:34`),
  `gap: espaciado(16)` y `margin-block-end: espaciado(32)` en la fila de botones
  (`:41-42`), `gap: espaciado(16)` y `padding-block-start: espaciado(24)` en la
  `<dl>` (`:68-69`).
- Ancho de contenedor: 1024px del wrapper, pero con **tres recortes internos a
  640px** (`:26`, `:31`, `:72`).

---

## 4. `Servicios`

**Ficheros:** `src/components/Servicios.tsx`, `src/components/Servicios.module.scss`.

**Qué renderiza hoy.** `<section>` (`src/components/Servicios.tsx:50`) con `<h2>`
(`:51`) y N `<article>` hermanos (`:52-54`). Cada `<article>` lleva `<h3>`
(`:22`), un `<button type="button">` con `aria-expanded` (`:23-32`) y, al
abrirse, una `<ul>` > `<li>` con los puntos (`:33-39`).

**Mixins que usa.** `tarjeta` sobre `.tarjeta`
(`src/components/Servicios.module.scss:21`). Nada más de la familia de patrón.

**Mixins que NO usa y le vendrían bien.**
- `fila-de-accion-de-tarjeta` — el botón reimplementa a mano su mitad
  (`margin-block-start: auto`, `:32`) pero **sin el `padding-block-start` ni el
  borde superior** del mixin: los pies de tarjeta de la fila no quedan separados
  del texto.
- `boton-fantasma` — el botón «Ver más» es hoy texto plano sin ninguna afordancia
  de control: `border: none`, `background: none`, solo color de acento
  (`src/components/Servicios.module.scss:30-41`).
- `hueco-de-imagen` — las 5 tarjetas de servicio son las únicas tarjetas de
  la landing sin ningún elemento visual.
- `eyebrow` / `pildora-etiqueta` — no hay ningún rótulo de categoría sobre el
  `<h3>`.

**Hueco de imagen.** No. `src/data/servicios.ts:11-14` declara `titulo` y
`puntos` y nada más: **NO CONSTA EN LA FUENTE** ninguna ruta de imagen para los
bloques de servicio.

**Props y datos.** `catalogo?: readonly BloqueServicio[]`
(`src/components/Servicios.tsx:6-9`), por defecto `SERVICIOS` (`:45`), los 5
bloques reales de `src/data/servicios.ts:16-52`. Si el catálogo está vacío el
componente devuelve `null` (`src/components/Servicios.tsx:46-48`).

**Valores que aplica hoy.**
- Radio: 24px vía `tarjeta`.
- Sombra: `--sombra-reposo` → `--sombra-elevada` en hover, vía `tarjeta`.
- Tipografía: `h2` en `--fuente-titulares`, `paso-tipografico(4)` = 39.06px
  (`src/components/Servicios.module.scss:14-15`); `h3` en `--fuente-titulares`,
  `paso-tipografico(2)` = 25px (`:25-26`); botón en peso 600 con
  `--color-acento-tinta` (`:38-39`); lista en `--color-texto-suave` (`:46`).
- Espaciado: rejilla `minmax(min(280px, 100%), 1fr)` con `gap: espaciado(24)`
  y `padding-block: espaciado(64)` (`:7-10`); `padding: espaciado(24)` en la
  tarjeta (`:22`); `margin-block-end: espaciado(12)` en el `h3` (`:27`).
  **`padding-inline-start: espaciado(20)` de la `<ul>` (`:45`) no se emite** (H3).
- Ancho de contenedor: 1024px del wrapper `.seccionAlterna`.

---

## 5. `CampanasPortada`

**Ficheros:** `src/components/CampanasPortada.tsx`,
`src/components/CampanasPortada.module.scss`.

**Qué renderiza hoy.** `<section>` (`src/components/CampanasPortada.tsx:33-38`)
con `<h2>` (`:39`), `<p>` de aviso de demostración (`:40-44`), `<ul>` > `<li>` >
`<a>` que contiene `<img>` condicional + `<span>` («Demostración») + `<h3>`
(`:45-57`), y un `<a>` final «Ver campañas» (`:58`).

**Mixins que usa.** `contenedor` (`src/components/CampanasPortada.module.scss:6`),
`tarjeta` sobre `li` (`:32`), `hueco-de-imagen(16, 9)` sobre la `img` (`:46`),
`pildora-etiqueta` sobre el `span` (`:50`) y `boton-fantasma` sobre el `> a`
final (`:63`).

**Mixins que NO usa y le vendrían bien.**
- `fila-de-accion-de-tarjeta` — el `<h3>` cierra la tarjeta sin ninguna fila de
  acción: la tarjeta entera es el enlace, así que no hay pie alineado.
- `eyebrow` — el aviso de demostración (`> p`, `:17-20`) podría llevar rótulo.

Es el único módulo que cablea su propio fondo y su propio contenedor porque
`Landing.tsx:57` lo renderiza **sin envoltorio** (comentario justificándolo en
`src/components/CampanasPortada.module.scss:1-4`).

**Hueco de imagen.** **Sí**, 16/9 (`:46`). El dato **sí trae ruta**:
`src/data/campanas.ts:21` declara `imagen?: string` y las 3 entradas reales la
rellenan — `/img/campanas/vacunaciones.webp` (`src/data/campanas.ts:67`),
`/img/campanas/chequeo.webp` (`:74`), `/img/campanas/odontologia.webp` (`:81`).
Los tres ficheros existen en `public/img/campanas/`.

**Props y datos.** `catalogo?: readonly CampanaDemo[]`
(`src/components/CampanasPortada.tsx:7-10`), por defecto `CAMPANAS_DEMO`
(`:26`), las 3 entradas de `src/data/campanas.ts:63-85`. El modelo se construye
con `construirModeloSeguro`, que falla cerrado a `[]` si un dato es inválido
(`src/components/CampanasPortada.tsx:17-23`), y devuelve `null` si queda vacío
(`:28-30`). La imagen se resuelve con `hrefDeDestino` (`:50`), y el `<img>` lleva
`width={800} height={450} loading="lazy" decoding="async"` (`:50`).

**Valores que aplica hoy.**
- Radio: 24px vía `tarjeta`; 999px en la píldora y en el botón fantasma.
- Sombra: reposo → elevada, vía `tarjeta`.
- Tipografía: `h2` en `--fuente-titulares`, `paso-tipografico(4)` = 39.06px
  (`src/components/CampanasPortada.module.scss:12-13`); `h3` de tarjeta en
  `--fuente-titulares`, `paso-tipografico(1)` = 20px (`:57-58`); párrafo en
  `--color-texto-suave` (`:18`).
- Espaciado: `margin-block-end: espaciado(8)` en `h2` (`:14`) y `espaciado(24)`
  en el párrafo (`:19`); rejilla `minmax(min(280px, 100%), 1fr)`,
  `gap: espaciado(24)`, `margin: 0 0 espaciado(32)` (`:24-27`); píldora con
  `margin: espaciado(16) espaciado(16) espaciado(8)` (`:52`); `h3` con
  `margin: 0 espaciado(16) espaciado(16)` (`:56`).
  **`padding-block: espaciado(56)` (`:7`) no se emite** (H4): la sección queda
  sin separación vertical propia.
- Ancho de contenedor: 1024px, aplicado por sí misma (`:6`).

---

## 6. `Equipo`

**Ficheros:** `src/components/Equipo.tsx`, `src/components/Equipo.module.scss`.

**Qué renderiza hoy.** `<section aria-label="Equipo">`
(`src/components/Equipo.tsx:41`) con `<h2>` (`:42`) y N `<article>` (`:43-45`).
Cada `<article>` (`:21-30`): `<h3>` con el nombre (`:22`), `<p>` con el rol
(`:23`), `<button aria-expanded>` (`:24-28`) y `<p>` con la formación al abrirse
(`:29`).

**Mixins que usa.** `tarjeta` (`src/components/Equipo.module.scss:20`).

**Mixins que NO usa y le vendrían bien.**
- `eyebrow` — el `<p>` del rol (`:29-33`) reescribe a mano el patrón (color de
  acento + peso 600) pero sin las mayúsculas, el `letter-spacing` ni el tamaño
  del mixin.
- `hueco-de-imagen` — no hay retrato de ningún profesional; una tarjeta de
  equipo sin foto es la ausencia más visible de toda la landing.
- `fila-de-accion-de-tarjeta` — mismo caso que `Servicios`: solo el
  `margin-block-start: auto` (`:38`), sin borde ni separación superior.
- `boton-fantasma` — el botón «Ver formación» es texto plano (`:35-46`).

**Hueco de imagen.** No. `src/data/equipo.ts:8-12` declara `nombre`, `rol` y
`formacion?`: **NO CONSTA EN LA FUENTE** ninguna ruta de imagen ni de retrato.

**Props y datos.** `listado?: readonly Profesional[]`
(`src/components/Equipo.tsx:6-9`), por defecto `EQUIPO` (`:35`), las 2 entradas
reales de `src/data/equipo.ts:14-24` (Marcos Pérez con formación, Joaquín
Herranz sin ella — `formacion` queda `undefined` a propósito, `src/data/equipo.ts:4-6`).
Se filtra con `profesionalesValidos` y devuelve `null` si no queda ninguno
(`src/components/Equipo.tsx:36-39`).

**Valores que aplica hoy.**
- Radio: 24px vía `tarjeta`.
- Sombra: reposo → elevada, vía `tarjeta`.
- Tipografía: `h2` en `--fuente-titulares`, 39.06px
  (`src/components/Equipo.module.scss:13-14`); `h3` en `--fuente-titulares`,
  25px (`:24-25`); rol en peso 600 con `--color-acento-tinta` (`:30-31`);
  formación en `--color-texto-suave` (`:50`).
- Espaciado: rejilla `minmax(min(280px, 100%), 1fr)`, `gap: espaciado(24)`,
  `padding-block: espaciado(64)`, `align-items: start` (`:5-9`);
  `padding: espaciado(24)` en la tarjeta (`:21`); `margin-block-end: espaciado(4)`
  en `h3` (`:26`) y `espaciado(12)` en el rol (`:32`);
  `margin-block-start: espaciado(12)` en la formación (`:49`).
- Ancho de contenedor: 1024px del wrapper `.seccionAlterna`.

---

## 7. `ReservaChat`

**Ficheros:** `src/components/ReservaChat.tsx`, `src/components/ReservaChat.module.scss`.

**Qué renderiza hoy.** `<section>` (`src/components/ReservaChat.tsx:121`) con dos
columnas. Columna izquierda: `<div>` > dos `<a>` de llamada (`:123-124`) + `<ul>`
> `<li>` por tramo horario (`:125-129`). Columna derecha: `<fieldset>` (`:131`) >
`<div role="log" aria-live="polite">` > `<p>` por mensaje (`:132-136`), y según
el paso: `<fieldset aria-label="Respuestas rápidas">` > `<button>` por opción
(`:137-145`, `:159-167`), `<input type="text">` + `<button>` (`:146-158`,
`:168-182`), `<fieldset aria-label="Resumen de tu solicitud">` > `<ul>` > `<li>`
+ `<a>` + `<button>` (`:183-198`), o dos `<a>` + `<button>` en urgencia
(`:199-207`); cierra con un `<p>` de aviso (`:208`).

**Mixins que usa.** `boton-fantasma` en los enlaces de llamada de la columna
izquierda (`src/components/ReservaChat.module.scss:23`), `tarjeta` en el
`> fieldset` del panel (`:43`), `boton-primario` en el `button` por defecto
(`:84`) y `pildora-filtro` en los botones de respuesta rápida (`:90`).

**Mixins que NO usa y le vendrían bien.**
- `eyebrow` / `pildora-etiqueta` — el aviso de demostración (`<p>`, `:208` del
  `.tsx`) no recibe ninguna regla propia en la hoja: es texto corrido sin
  distinción visual, pese a ser la advertencia legal del módulo.
- `hueco-de-imagen` — sin ningún elemento visual.
- `fila-de-accion-de-tarjeta` — el panel del chat no ancla su fila de acción.
- `contenedor` — no lo necesita: lo recibe del wrapper.

**Hueco de imagen.** No. No hay fichero en `src/data/` para este módulo (consume
`SERVICIOS` y `datosNegocio`, `src/components/ReservaChat.tsx:2-3`):
**NO CONSTA EN LA FUENTE** ninguna ruta de imagen.

**Props y datos.** **Ninguna prop**: la firma es
`export function ReservaChat(): React.JSX.Element`
(`src/components/ReservaChat.tsx:59`). Las opciones de servicio salen de
`SERVICIOS` más `OPCION_URGENCIA` (`:22`), las de «cuándo» son literales del
propio fichero (`:23-28`), y los teléfonos y el horario de `datosNegocio`
(`:19`, `:123-127`).

**Valores que aplica hoy.**
- Radio: 24px vía `tarjeta`; 12px en las burbujas del `role="log"`
  (`src/components/ReservaChat.module.scss:63`) y en el `input` (`:76`);
  999px vía los mixins de botón y píldora.
- Sombra: `tarjeta` da reposo, y el hover se **revierte a reposo** a propósito
  (`:47-49`), porque el panel no es un enlace.
- Tipografía: no declara ningún `font-size` ni `font-family` propio; todo viene
  de los mixins (16px en botones, 12.8px en píldoras) y del `body`. El listado de
  horario usa `--color-texto-suave` (`:30`).
- Espaciado: rejilla `minmax(min(320px, 100%), 1fr)`, `gap: espaciado(32)`,
  `padding-block: espaciado(64)` (`:6-9`); `gap: espaciado(12)` en la columna
  izquierda (`:20`); `padding: espaciado(24)` + `gap: espaciado(16)` en el panel
  (`:44-45`); burbujas con `padding: espaciado(8) espaciado(12)` (`:62`);
  `max-height: 320px` con `overflow-y: auto` en el log (`:57-58`).
- Ancho de contenedor: 1024px del wrapper `.seccion`.

---

## 8. `Galeria`

**Ficheros:** `src/components/Galeria.tsx`, `src/components/Galeria.module.scss`.

**Qué renderiza hoy.** `<section aria-label="Galería">`
(`src/components/Galeria.tsx:51-56`) con 4 hijos directos: `<p>` de aviso
(`:57-61`), `<button>` > `<span aria-hidden>` «‹» (`:62-64`),
`<div role="group" tabIndex={0}>` con N `<figure>` > `<img>` + `<figcaption>`
(`:72-79`), y `<button>` > `<span>` «›» (`:80-82`).

**Mixins que usa.** `boton-fantasma` en los dos `> button`
(`src/components/Galeria.module.scss:28`) y `hueco-de-imagen(4, 3)` en la `img`
(`:56`).

**Mixins que NO usa y le vendrían bien.**
- `pildora-etiqueta` — es contenido de demostración explícito
  (`src/components/Galeria.tsx:57-61`) y, a diferencia de `CampanasPortada`,
  `PaginaBlog`, `PaginaCampanas` y `PaginaTienda`, **no lleva ninguna píldora
  «Demostración»**: el aviso es solo un párrafo gris.
- `tarjeta` — cada `<figure>` es una tarjeta sin superficie, sin borde y sin
  sombra: solo la imagen con radio propio.
- `eyebrow` — no hay `<h2>` ni rótulo de sección; la galería entra sin titular.

**Hueco de imagen.** **Sí**, 4/3 (`:56`), más `border-radius: $radio-grande`
(24px) a mano (`:57`). El dato **sí trae ruta**: `src/data/galeria.ts:17` declara
`src` y las 6 entradas la rellenan — `/img/galeria/nala-y-coco.webp` … `/kira.webp`
(`src/data/galeria.ts:21-26`). Los 6 ficheros existen en `public/img/galeria/`.
El `.tsx` los pinta con `width={800} height={600} loading="lazy" decoding="async"`
(`src/components/Galeria.tsx:75`).

**Props y datos.** `catalogo?: readonly EntradaGaleria[]`
(`src/components/Galeria.tsx:12-15`), por defecto `GALERIA` (`:18`). Se filtra
con `entradasValidas` y devuelve `null` si no queda ninguna (`:28-30`).

**Valores que aplica hoy.**
- Radio: 24px en la imagen (`:57`); 999px en los dos botones vía `boton-fantasma`.
- Sombra: ninguna.
- Tipografía: botones en `paso-tipografico(2)` = 25px (`:30`); `figcaption` en
  `paso-tipografico(-1)` = 12.8px con `--color-texto-suave` (`:61-62`); aviso en
  `--color-texto-suave` (`:24`). No usa `--fuente-titulares` en ningún sitio.
- Espaciado: rejilla `auto 1fr auto` con `gap: espaciado(16)` y
  `padding-block: espaciado(64)` (`:16-20`); botones con
  `padding-inline: espaciado(12)` (`:29`); pista con `gap: espaciado(16)` (`:36`)
  y `figure` con `flex: 0 0 clamp(240px, 32vw, 360px)` (`:47`);
  `margin-block-start: espaciado(8)` en el pie (`:63`).
- Ancho de contenedor: 1024px del wrapper `.seccionAlterna`.

---

## 9. `FormularioContacto`

**Ficheros:** `src/components/FormularioContacto.tsx`,
`src/components/FormularioContacto.module.scss`.

**Qué renderiza hoy.** Dos vistas. Formulario
(`src/components/FormularioContacto.tsx:80-121`): `<form aria-label="Escríbenos">`
con `<label>`+`<input type="text">` (`:88-89`), `<label>`+`<input type="tel">`
(`:91-92`), `<label>`+`<input type="email">` (`:94-95`),
`<label>`+`<select>`>`<option>` (`:97-102`), `<label>`+`<textarea>` (`:104-105`),
`<label>`+`<input type="checkbox">` (`:107-114`), `<a>` al aviso legal (`:115`),
`<p>` de aviso de no envío (`:117`) y `<button type="submit">` (`:118-120`).
Confirmación (`:63-77`): `<output>` con `<h2>` (`:65`), dos `<p>` con `<a>` de
teléfono (`:66-72`) y un `<button>` de vuelta (`:73-75`).

**Mixins que usa.** `tarjeta` en `.formulario`
(`src/components/FormularioContacto.module.scss:8`) y en `.confirmacion` (`:60`);
`boton-primario` en el submit (`:53`) y `boton-fantasma` en el botón de la
confirmación (`:75`).

**Mixins que NO usa y le vendrían bien.**
- `eyebrow` — el formulario no tiene titular visible (el nombre es solo
  `aria-label`, `src/components/FormularioContacto.tsx:82`): entra sin ningún
  rótulo, a diferencia del resto de secciones.
- `fila-de-accion-de-tarjeta` — el botón de envío es la fila de acción de la
  tarjeta y no lleva borde ni separación superior propia (solo
  `margin-block-start: espaciado(8)`, `:55`).
- `pildora-etiqueta` — el aviso «Esta maqueta no envía tu mensaje…»
  (`src/components/FormularioContacto.tsx:117`) no recibe ninguna regla en la
  hoja.
- `hueco-de-imagen` — sin elemento visual.

**Hueco de imagen.** No. No hay fichero en `src/data/` para este módulo (todo son
constantes del `.tsx`, `src/components/FormularioContacto.tsx:7-32`):
**NO CONSTA EN LA FUENTE** ninguna ruta de imagen.

**Props y datos.** **Ninguna prop**:
`export function FormularioContacto(): React.JSX.Element`
(`src/components/FormularioContacto.tsx:37`). Las 5 opciones de motivo son
literales del fichero (`:7-13`), la URL del aviso legal también (`:15`), y los
teléfonos de la confirmación salen de `datosNegocio` (`:61-62`).

**Valores que aplica hoy.**
- Radio: 24px vía `tarjeta`; **12px** en `input`/`select`/`textarea`
  (`src/components/FormularioContacto.module.scss:32`); 999px en los botones.
- Sombra: reposo vía `tarjeta`, con el hover **revertido a reposo** a propósito
  (`:15-18`, comentario: «un formulario no es una tarjeta clicable»).
- Tipografía: `label` en `paso-tipografico(0)` = 16px, peso 600 (`:21-22`);
  campos en `paso-tipografico(0)` = 16px (`:35`); `h2` de confirmación en
  `--fuente-titulares`, `paso-tipografico(3)` = 31.25px (`:65-66`).
- Espaciado: `padding: espaciado(24)` y `gap: espaciado(12)` (`:9`, `:12`),
  `margin-block-end: espaciado(32)` (`:13`); campos con
  `padding-inline: espaciado(12)` (`:30`); `textarea` con
  `padding-block: espaciado(8)` y `min-height: espaciado(96)` (`:39-40`).
- Borde de control: 1.5px `--color-borde-control` en los campos (`:31`).
- Ancho de contenedor: 1024px del wrapper `.seccion` (compartido con
  `InformacionContacto`, ambos hijos directos de `#contacto`).

---

## 10. `InformacionContacto`

**Ficheros:** `src/components/InformacionContacto.tsx`,
`src/components/InformacionContacto.module.scss`.

**Qué renderiza hoy.** `<section aria-label="Información de contacto">`
(`src/components/InformacionContacto.tsx:53`) con: `<iframe>` del mapa
(`:61-67`), `<p>` de aviso de terceros (`:68`),
`<fieldset aria-label="Dirección">` > dos `<p>` (`:69-72`),
`<fieldset aria-label="Teléfonos">` > dos `<a>` (`:75-81`),
`<fieldset aria-label="Horario">` > `<dl>` > `<div>` > `<dt>`+`<dd>` (`:82-93`) y
`<fieldset aria-label="Urgencias fuera de horario">` > `<a>` (`:94-98`).

**Mixins que usa.** **Ninguno de los 10 de patrón.** Solo los utilitarios
`foco-visible` (`src/components/InformacionContacto.module.scss:26`) y
`area-tactil-minima` (`:27`).

**Mixins que NO usa y le vendrían bien.**
- `hueco-de-imagen(16, 9)` — el `<iframe>` del mapa reimplementa a mano
  exactamente lo que hace el mixin: `width: 100%`, `aspect-ratio: 16 / 9`
  (`:13-14`), y además le añade borde 1px y radio 24px (`:15-16`). Lo único que
  le falta del mixin es el fondo `--color-fondo-alterno` mientras carga.
- `tarjeta` — los 4 `<fieldset>` de datos (`:19-23`) están completamente
  desnudos: `border: none; padding: 0; margin: 0`.
- `eyebrow` — los `aria-label` de los `<fieldset>` («Dirección», «Teléfonos»,
  «Horario», «Urgencias fuera de horario») **no tienen contrapartida visible**:
  el bloque se lee como una lista de datos sin encabezados.
- `boton-fantasma` / `boton-primario` — los enlaces de teléfono son texto
  subrayado, no controles, a diferencia de `ReservaChat`, que sí los hace
  botones fantasma (`src/components/ReservaChat.module.scss:23`).

**Hueco de imagen.** No hay `<img>`. Sí hay un marco 16/9 para el mapa
(`:11-17`), pero declarado a mano. **NO CONSTA EN LA FUENTE** ninguna ruta de
imagen: este módulo no tiene fichero en `src/data/`; consume `datosNegocio`
(`src/components/InformacionContacto.tsx:2`) y una URL de OpenStreetMap literal
(`:14`).

**Props y datos.** `telefonoClinica?: string`, `telefonoUrgencias?: string | null`,
`horario?: readonly TramoHorario[]`, `direccion?: readonly [string, string] | null`
(`src/components/InformacionContacto.tsx:19-36`). Por defecto todos de
`datosNegocio` (`:40-43`). Desde la landing recibe además `direccion` explícita
(`src/pages/Landing.tsx:69`).

**Valores que aplica hoy.**
- Radio: 24px solo en el `<iframe>` (`:16`).
- Sombra: **ninguna**. Es el único bloque de datos de la landing sin superficie
  elevada.
- Tipografía: `font-size: paso-tipografico(0)` = 16px en la sección (`:9`);
  `dt` en peso 600 (`:44`); `dd` en `--color-texto-suave` (`:49`); el enlace de
  urgencias en `--color-acento-tinta` y peso 700 (`:53-56`).
- Espaciado: rejilla `minmax(min(280px, 100%), 1fr)` con `gap: espaciado(16)`
  (`:6-8`); filas de horario con `gap: espaciado(8)` y
  `padding-block: espaciado(4)` (`:38-39`), separadas por `border-block-end` de
  1px `--color-borde` (`:40`).
- Ancho de contenedor: 1024px del wrapper `.seccion`.

---

## 11. `Faq`

**Ficheros:** `src/components/Faq.tsx`, `src/components/Faq.module.scss`.

**Qué renderiza hoy.** `<section aria-label="Preguntas frecuentes">`
(`src/components/Faq.tsx:77`) con `<h2>` (`:78`) y, por entrada, un
`<button aria-expanded aria-controls>` (`:83-90`) seguido — solo si está abierta —
de un `<section id aria-label>` con el texto y los `<a href="tel:…">` incrustados
(`:91`, componente en `:27-41`).

**Mixins que usa.** **Ninguno de los 10 de patrón.** Solo `foco-visible`
(`src/components/Faq.module.scss:15`, `:52`) y `area-tactil-minima` (`:16`).

**Mixins que NO usa y le vendrían bien.**
- `boton-fantasma` — los botones de acordeón son texto plano con `border: none`
  y `background: none` (`:26-28`); su única afordancia es un
  `border-block-end` de 1px (`:27`) y un desplazamiento de 8px en hover
  (`:39-41`).
- `tarjeta` — las respuestas abiertas (`section`, `:44-49`) no tienen superficie
  propia: se distinguen solo por color y `line-height`.
- `pildora-etiqueta` / `eyebrow` — sin ningún rótulo por encima del `<h2>`.
- `contenedor` — lo recibe del wrapper, pero luego lo **recorta a 860px** por su
  cuenta (`:6`), introduciendo un segundo ancho máximo en la landing.
- `prosa` — las respuestas son lectura larga con enlaces incrustados; hoy usan un
  `line-height: 1.7` propio (`:48`) en vez del 1.8 del mixin.

**Hueco de imagen.** No. Este módulo no tiene fichero en `src/data/`: el catálogo
se construye en tiempo de render con `construirCatalogoFaq` a partir de
`datosNegocio` y `SERVICIOS` (`src/components/Faq.tsx:56-64`).
**NO CONSTA EN LA FUENTE** ninguna ruta de imagen.

**Props y datos.** `catalogo?: readonly EntradaFaq[]` y
`telefonoUrgencias?: string` (`src/components/Faq.tsx:43-48`). Por defecto el
catálogo se deriva de `datosNegocio.horario`, los tres teléfonos y `SERVICIOS`
(`:56-64`), y el teléfono de urgencias de
`datosNegocio.telefonoUrgencias.textoVisible` (`:53`) =
`'91 851 13 93'` (`src/lib/site.ts:12`). Devuelve `null` si no queda ninguna
entrada válida (`src/components/Faq.tsx:72-74`).

**Valores que aplica hoy.**
- Radio: **ninguno**. Es el único módulo de la landing sin ningún `border-radius`.
- Sombra: ninguna.
- Tipografía: `h2` en `--fuente-titulares`, `paso-tipografico(4)` = 39.06px
  (`src/components/Faq.module.scss:9-10`); botones en `paso-tipografico(1)` =
  20px, peso 600 (`:24-25`); respuestas en `--color-texto-suave` con
  `line-height: 1.7` (`:47-48`).
- Espaciado: `padding-block: espaciado(64)` (`:5`);
  `margin-block-end: espaciado(24)` en el `h2` (`:11`); botones con
  `gap: espaciado(16)` y `padding-block: espaciado(16)` (`:22-23`); respuestas
  con `padding-block: espaciado(16)` (`:46`).
- Ancho de contenedor: 1024px del wrapper, **recortado a 860px** (`:6`), y las
  respuestas además a `70ch` (`:45`).

---

## 12. `PieDePagina`

**Ficheros:** `src/components/PieDePagina.tsx`, `src/components/PieDePagina.module.scss`.

**Qué renderiza hoy.** `<footer>` (`src/components/PieDePagina.tsx:76`) >
`<div class=interior>` (`:77`) con: `<div class=marca>` > `<img alt="">` + dos
`<p>` (`:78-83`); tres bloques `<div>` > `<h3>` + `<ul>` > `<li>` > `<a>`
(`:84-86`, componente en `:32-45`); y `<div class=barraInferior>` > `<p>` del
copyright + `<ul aria-label="Enlaces legales">` > `<li>` > `<a target="_blank">`
(`:87-98`).

**Mixins que usa.** `contenedor` en `.interior`
(`src/components/PieDePagina.module.scss:18`) y `hueco-de-imagen(1, 1)` en el
logotipo (`:57`).

**Mixins que NO usa y le vendrían bien.**
- `eyebrow` — los `<h3>` de columna (`:24-31`) reescriben el patrón a mano
  (mayúsculas, peso 700, `letter-spacing: 0.06em`) con valores propios distintos
  a los del mixin (`0.12em`, `--color-acento-tinta`).
- `boton-fantasma` — no hay ninguna acción destacada en el pie.
- `tarjeta` — el bloque de marca no tiene superficie propia.

**Hueco de imagen.** **Sí**, 1/1 (`:57`), recortado a 48×48px (`:58-59`) con
radio 12px (`:60`). La ruta **no viene de `src/data/`**: es una constante literal
del `.tsx`, `const SRC_LOGO = '/img/logo-galapavet.webp'`
(`src/components/PieDePagina.tsx:13`), marcada como PENDIENTE en el comentario
(`:9-12`) aunque el fichero **sí existe** hoy en `public/img/logo-galapavet.webp`.
Los dos catálogos que sí consume (`src/data/pieDePaginaEnlaces.ts:10-13` y
`src/data/paginasLegales.ts:10-13`) declaran solo `nombre` y `destino`:
**NO CONSTA EN LA FUENTE** ninguna ruta de imagen en ellos.

**Props y datos.** `paginasLegales?: readonly PaginaLegal[]`, `fecha?: Date`,
`telefonoUrgencias?: string` (`src/components/PieDePagina.tsx:47-58`). Por
defecto `PAGINAS_LEGALES` (`:62`, 3 entradas en `src/data/paginasLegales.ts:15-19`)
y `datosNegocio.telefonoUrgencias.textoVisible` (`:64`). Las columnas «Clínica» y
«Contenido» salen de `ENLACES_CLINICA` (4 anclas,
`src/data/pieDePaginaEnlaces.ts:16-21`) y `ENLACES_CONTENIDO` (4 destinos,
`:24-29`); la de «Contacto» se construye con `construirEnlacesContacto`
(`src/components/PieDePagina.tsx:66-71`).

**Valores que aplica hoy.**
- Radio: 12px en el logotipo (`:60`).
- Sombra: ninguna. Se separa con `border-block-start` de 1px `--color-borde`
  (`:11`).
- Tipografía: `font-size: paso-tipografico(-1)` = 12.8px en toda la banda
  (`:14`); `h3` en `paso-tipografico(0)` = 16px, peso 700,
  `letter-spacing: 0.06em`, mayúsculas, `--color-tinta` (`:25-29`); nombre
  comercial en `--fuente-titulares`, peso 700, `--color-tinta` (`:69-71`);
  descriptor en `--color-texto-suave` (`:75`).
- Espaciado: `gap: espaciado(32)` y `padding-block: espaciado(48) espaciado(24)`
  en `.interior` (`:21-22`); `gap: espaciado(8)` en las listas (`:39`);
  `margin-block-end: espaciado(8)` bajo el logotipo (`:61`); barra inferior con
  `gap: espaciado(16)`, `margin-block-start: espaciado(16)` y
  `padding-block-start: espaciado(16)` (`:84-86`).
- Ancho de contenedor: 1024px en `.interior` (`:18`); el `<footer>` es banda
  completa con fondo `--color-superficie` (`:12`).

---

## 13. `SelectorPaleta`

**Ficheros:** `src/components/SelectorPaleta.tsx`,
`src/components/SelectorPaleta.module.scss`.

**Qué renderiza hoy.** `<div>` flotante (`src/components/SelectorPaleta.tsx:30`)
con `<button aria-expanded>` (`:31-33`) y, al abrirse, un
`<fieldset aria-label="Paleta de color">` (`:35`) con un
`<button aria-pressed>` por variante (`:36-51`); cada botón lleva tres
`<span aria-hidden>` de muestra de color (`:46-48`) más el nombre.

**Mixins que usa.** `boton-primario` en el disparador
(`src/components/SelectorPaleta.module.scss:9`) y `tarjeta` en el panel (`:15`).

**Mixins que NO usa y le vendrían bien.**
- `pildora-filtro` — los botones de variante son exactamente un filtro
  seleccionable por `[aria-pressed]`, y hoy reescriben ese estado a mano
  (`:43-47`) con `border-radius: $radio-medio` (`:37`) en vez del radio completo
  del mixin.
- `eyebrow` — el panel no tiene título visible (solo `aria-label`,
  `src/components/SelectorPaleta.tsx:35`).
- `hueco-de-imagen` — no aplica: las muestras son `<span>` con
  `background-color` inline (`:47` del `.tsx`).

**Hueco de imagen.** No. `src/data/variantesPaleta.ts:12-16` declara `id`,
`nombre` y `muestras` (tres hexadecimales): **NO CONSTA EN LA FUENTE** ninguna
ruta de imagen.

**Props y datos.** `catalogo?: readonly VariantePaleta[]`
(`src/components/SelectorPaleta.tsx:9-12`), por defecto `VARIANTES_PALETA`
(`:15`), las 4 variantes de `src/data/variantesPaleta.ts:24-29`. Las muestras
reutilizan los 3 colores verificados de `coloresDeMarca`
(`src/data/variantesPaleta.ts:18-22`). La variante activa se lee de
`localStorage` (`src/components/SelectorPaleta.tsx:17-19`) y se aplica como
`data-variante` sobre `<html>` (`:21-23`).

**Valores que aplica hoy.**
- Radio: 24px en el panel vía `tarjeta`; 12px en los botones de variante (`:37`);
  **50% (`$radio-circulo`) en las muestras (`:55`) — el único uso de este radio
  en todo el repositorio**; 999px en el disparador vía `boton-primario`.
- Sombra: reposo vía `tarjeta`, con el hover **revertido a reposo** (`:25-27`).
- Tipografía: botones de variante en `paso-tipografico(-1)` = 12.8px (`:40`),
  peso 700 cuando están activos (`:46`). El disparador hereda 16px del mixin.
- Espaciado: `inset-block-end`/`inset-inline-end: espaciado(16)` (`:3-4`);
  panel a `calc(100% + espaciado(8))` (`:17`) con `gap: espaciado(4)` (`:21`),
  `padding: espaciado(12)` (`:22`) y `min-width: 220px` (`:23`); botones con
  `gap: espaciado(8)` y `padding-inline: espaciado(12)` (`:34-35`); muestras de
  12×12px (`:53-54`).
- Altura de control: el disparador baja de 56px a `$altura-control-media` = 48px
  (`:10`).
- Ancho de contenedor: ninguno (`position: fixed`, `z-index: 20`, `:2-5`).

---

## 14. `MetadatosPagina`

**Fichero:** `src/components/MetadatosPagina.tsx`. **No tiene `.module.scss`.**

**Qué renderiza hoy.** Nada: `return null`
(`src/components/MetadatosPagina.tsx:89`), firma `: null` (`:77`). En un
`useEffect` fija `document.title`, la `meta description` y cinco propiedades Open
Graph, más el `<script type="application/ld+json">` (`:78-87`).

**Mixins.** Ninguno, y **ninguno le vendría bien**: no emite DOM visible.

**Hueco de imagen.** No en el documento, pero **sí declara una imagen social**:
`RUTA_IMAGEN_OPEN_GRAPH = '/img/og/galapavet.png'`
(`src/components/MetadatosPagina.tsx:41`), compuesta con el dominio
`https://cenit-digital.github.io` (`:34`) en `IMAGEN_OPEN_GRAPH` (`:42`). El
fichero existe en `public/img/og/galapavet.png`. La ruta es una constante del
`.tsx`, **no** un dato de `src/data/`.

**Props y datos.** `metadatos: DatosMetadatosPagina` y
`datosEstructurados: Record<string, unknown>`
(`src/components/MetadatosPagina.tsx:69-74`), ambos obligatorios. Los rellenan
las páginas: `METADATOS_INICIO` + `DATOS_ESTRUCTURADOS_NEGOCIO`
(`src/pages/Landing.tsx:50`), `METADATOS_BLOG`/`METADATOS_ARTICULO_BLOG`
(`src/pages/PaginaBlog.tsx:247`), `METADATOS_CAMPANAS`/`METADATOS_FICHA_CAMPANA`
(`src/pages/PaginaCampanas.tsx:256`) y `METADATOS_TIENDA`
(`src/pages/PaginaTienda.tsx:310`).

**Valores que aplica hoy.** Ninguno de radio, sombra, tipografía ni espaciado.

---

## 15. `PaginaBlog` (`/blog` y `/blog/:identificador`)

**Ficheros:** `src/pages/PaginaBlog.tsx`, `src/pages/PaginaBlog.module.scss`.

**Qué renderiza hoy.** `<main>` (`src/pages/PaginaBlog.tsx:245`) con dos vistas.

Listado (`:103-124`): `<h1>` (`:105`), `<p>` de aviso (`:106`),
`<fieldset aria-label="Filtrar por categoría">` > `<button aria-pressed>` por
categoría (`:69-84`), y `<ul aria-label="Listado de artículos">` > `<li>` >
`<a>`(Link) > `<span>` «Demostración» + `<h2>` (`:52-61`, `:115-119`).

Artículo (`:210-230`): `<a>` de vuelta (`:212`), `<p>` de aviso (`:213`),
`<article>` con `<h1>` (`:215`), `<img>` (`:216-223`), `<div>` del tiempo de
lectura (`:224`) y el cuerpo — `<p>`, `<h2>` o `<blockquote>` según el bloque
(`:131-146`); después `<section class=cierreArticulo>` > `<h2>` + `<a>`
(`:149-156`) y `<section class=sigueLeyendo>` > `<h2>` + `<ul>` > `<li>` > `<a>`
> `<img>` + título (`:163-182`).

**Mixins que usa.** `contenedor` (`src/pages/PaginaBlog.module.scss:2`),
`pildora-filtro` en el filtro (`:35`), `tarjeta` en `li` del listado (`:48`) y en
`.cierreArticulo` (`:106`), `pildora-etiqueta` en el `span` (`:62`), `prosa` en
`> article` (`:77` — **único uso de `prosa` en el repositorio**),
`hueco-de-imagen(16, 9)` en la imagen del artículo (`:92`) y en la de «Sigue
leyendo» (`:146`), y `boton-primario` en el enlace de cierre (`:117`).

**Mixins que NO usa y le vendrían bien.**
- `eyebrow` — la categoría del artículo (`src/data/blog.ts:46`) **no se muestra
  nunca**: ni en la tarjeta del listado ni en la vista de artículo. El único
  rótulo es la píldora genérica «Demostración».
- `hueco-de-imagen` en la tarjeta del listado — las tarjetas del listado del blog
  **no llevan `<img>`** (`src/pages/PaginaBlog.tsx:52-61`) aunque el dato sí trae
  ruta, así que el listado es un muro de texto frente a un bloque «Sigue leyendo»
  que sí es visual.
- `fila-de-accion-de-tarjeta` — ni las tarjetas del listado ni las de «Sigue
  leyendo» anclan un pie.
- `boton-fantasma` — el enlace «Volver al listado» (`:212`) es texto plano.

**Hueco de imagen.** **Sí**, en dos sitios: `> article > img` a 16/9 con radio
24px (`:92-94`) y `.sigueLeyendo img` a 16/9 con radio 12px (`:146-147`). El dato
**sí trae ruta**: `src/data/blog.ts:46` declara `imagen` y `:47`
`textoAlternativoImagen`; las 6 entradas la rellenan con
`/img/blog/demo-1.webp` … `/demo-6.webp` (`src/data/blog.ts:61, 76, 87, 100, 113, 124`).
Los 6 ficheros existen en `public/img/blog/`. Se pintan con
`width={1600} height={900} loading="lazy" decoding="async"`
(`src/pages/PaginaBlog.tsx:174`, `:216-223`).

**Props y datos.** `catalogo?: readonly ArticuloDemo[]`
(`src/pages/PaginaBlog.tsx:233-236`), por defecto `ARTICULOS_DEMO` (`:239`), las
6 entradas de `src/data/blog.ts:56-131`. El identificador viene de `useParams`
(`:241`) y la categoría activa de `useSearchParams` (`:242`, `:95`).

**Valores que aplica hoy.**
- Radio: 24px vía `tarjeta` y en la imagen del artículo (`:94`); 12px en la
  imagen de «Sigue leyendo» (`:147`); 999px en filtros y botón primario.
- Sombra: reposo → elevada vía `tarjeta` (sin revertir el hover en ningún sitio).
- Tipografía: `h1` en `--fuente-titulares`, `paso-tipografico(5)` = 48.83px
  (`:7-8`), reducido a `paso-tipografico(4)` = 39.06px con `line-height: 1.15`
  dentro del artículo (`:82-83`); `h2` de tarjeta en `--fuente-titulares`,
  `paso-tipografico(2)` = 25px (`:67-68`); prosa en `paso-tipografico(1)` = 20px
  con `line-height: 1.8` (`_api.scss:338-339`); tiempo de lectura en
  `paso-tipografico(-1)` = 12.8px (`:99`); `h2` de «Sigue leyendo» en 25px (`:124`).
- Espaciado: `padding-block: espaciado(64)` (`:3`);
  `margin-block-end: espaciado(16)` en `h1` (`:9`) y `espaciado(24)` en el aviso
  (`:15`); filtro con `gap: espaciado(8)` y `margin-block-end: espaciado(32)`
  (`:29-30`); rejilla del listado `minmax(min(300px, 100%), 1fr)` con
  `gap: espaciado(24)` (`:41-42`); «Sigue leyendo» con
  `minmax(min(230px, 100%), 1fr)` y `gap: espaciado(16)` (`:130-131`);
  `.cierreArticulo` con `padding: espaciado(24)` y `margin-block: espaciado(32)`
  (`:107-108`).
  **`padding: espaciado(20)` del enlace de tarjeta (`:55`) no se emite** (H3): las
  tarjetas del listado quedan **sin relleno interior**.
- Ancho de contenedor: 1024px (`:2`), con el `<article>` recortado a **760px**
  (`:82`) y el aviso a `62ch` (`:14`).

---

## 16. `PaginaCampanas` (`/campanas` y `/campanas?campana=<id>`)

**Ficheros:** `src/pages/PaginaCampanas.tsx`, `src/pages/PaginaCampanas.module.scss`.

**Qué renderiza hoy.** `<main>` (`src/pages/PaginaCampanas.tsx:254`) con dos vistas.

Listado (`:64-82`): `<nav aria-label="Ruta">` > `<ol>` > `<li>` (`:24-35`),
`<h1>` (`:68`), `<output>` condicional (`:69`), `<p>` de aviso (`:70`), y
`<ul aria-label="Listado de campañas">` > `<li>` con `<img>` condicional +
`<span>` + `<p>` («Bloque de servicios: …») + `<h2>` + `<a>`(Link) (`:41-53`).

Ficha (`:226-239`): `<nav>` de migas (`:89-103`), `<h1 tabIndex={-1}>` (`:229`),
`<span>` «Demostración» (`:232`), `<p>` de aviso (`:233`),
`<section class=bloquePublicado>` > `<h2>` + `<p>` + `<ul>` > `<li>` (`:117-135`),
`<section aria-label="Datos pendientes de confirmar">` > `<h2>` + `<dl>` con 3
pares `<dt>`/`<dd>` (`:141-155`), `<p class=llamadasAAccion>` > dos enlaces
(`:158-165`) y `<section class=otrasCampanas>` > `<h2>` + `<ul>` > `<li>` >
`<span>` + `<h3>` > `<a>` (`:177-211`).

**Mixins que usa.** `contenedor` (`src/pages/PaginaCampanas.module.scss:2`),
`tarjeta` en `li` del listado (`:59`) y en `li` de «Otras campañas» (`:142`),
`hueco-de-imagen(16, 9)` (`:67`), `pildora-etiqueta` en el `span` de tarjeta
(`:71`) y en el `> span` de la ficha (`:97`), `boton-fantasma` en el enlace de
tarjeta (`:89`) y en la segunda llamada a la acción (`:128`), y `boton-primario`
en la primera llamada a la acción (`:124`).

**Mixins que NO usa y le vendrían bien.**
- `hueco-de-imagen` **en la ficha** — la vista de detalle **no renderiza ninguna
  imagen** (`src/pages/PaginaCampanas.tsx:226-239`) aunque el dato de esa misma
  campaña sí trae ruta (`src/data/campanas.ts:67, 74, 81`): la ficha es texto
  puro mientras su tarjeta del listado sí es visual.
- `hueco-de-imagen` **en «Otras campañas»** — reconocido explícitamente en el
  comentario del propio fichero: «tarjetas reducidas, sin imagen»
  (`src/pages/PaginaCampanas.module.scss:132`).
- `fila-de-accion-de-tarjeta` — el enlace de tarjeta se coloca con
  `align-self: flex-start` y márgenes a mano (`:88-92`), sin borde superior ni
  `margin-block-start: auto`, así que **los pies de las tarjetas de una fila no
  se alinean** aunque el título ocupe distinto número de líneas.
- `eyebrow` — el `<p>` «Bloque de servicios: …» (`src/pages/PaginaCampanas.tsx:48`)
  es exactamente un rótulo de categoría y hoy se estiliza a mano con color suave
  y 12.8px (`:77-81`).
- `tarjeta` en el panel de datos pendientes (`src/pages/PaginaCampanas.tsx:143-154`)
  y en `.bloquePublicado`: ambos van sin superficie.

**Hueco de imagen.** **Sí**, solo en el listado: 16/9 (`:67`). El dato **sí trae
ruta**, la misma que consume `CampanasPortada` (`src/data/campanas.ts:21` y
`:67, 74, 81`), con `width={800} height={450} loading="lazy" decoding="async"`
(`src/pages/PaginaCampanas.tsx:45`).

**Props y datos.** `catalogo?: readonly CampanaDemo[]`
(`src/pages/PaginaCampanas.tsx:242-245`), por defecto `CAMPANAS_DEMO` (`:248`).
El catálogo se valida con `construirCatalogoCampanas` (`:250`) y la vista se
resuelve con `resolverVista` a partir de `searchParams.get('campana')` (`:249-251`).
El teléfono de las llamadas a la acción sale de
`datosNegocio.telefonoClinica` (`:161`).

**Valores que aplica hoy.**
- Radio: 24px vía `tarjeta`; 999px en píldoras y botones.
- Sombra: reposo → elevada vía `tarjeta`.
- Tipografía: `h1` en `--fuente-titulares`, `paso-tipografico(5)` = 48.83px
  (`:7-8`); `h2` general en `--fuente-titulares`, `paso-tipografico(3)` = 31.25px
  (`:13-14`), reducido a `paso-tipografico(2)` = 25px en las tarjetas (`:85`);
  `h3` de «Otras campañas» en `paso-tipografico(1)` = 20px (`:148`); migas en
  `paso-tipografico(-1)` = 12.8px (`:40`); `dt` en peso 600 con
  `--color-texto-suave` y `dd` en peso 700 (`:106-114`).
- Espaciado: `padding-block: espaciado(64)` (`:3`);
  `margin-block: espaciado(16)` en `h1` (`:9`) y
  `espaciado(32) espaciado(16)` en `h2` (`:15`); rejilla del listado
  `minmax(min(300px, 100%), 1fr)` con `gap: espaciado(24)` (`:52-53`); píldora
  absoluta a `espaciado(16)` de las dos esquinas (`:73-74`); `dl` con
  `minmax(min(160px, 100%), 1fr)` y `gap: espaciado(16)` (`:102-103`);
  llamadas a la acción con `gap: espaciado(12)` y `margin-block: espaciado(24)`
  (`:120-121`); «Otras campañas» con `gap: espaciado(12)` (`:135`) y
  `padding: espaciado(16)` por tarjeta (`:143`).
  **Cuatro declaraciones afectadas por `espaciado(20)`** (`:61`, `:78`, `:84`,
  `:90`): la de `:61` desaparece y las tres restantes **colapsan y cambian de
  significado** (H5).
- Ancho de contenedor: 1024px (`:2`), con el aviso a `62ch` (`:20`).

---

## 17. `PaginaTienda` (`/tienda`)

**Ficheros:** `src/pages/PaginaTienda.tsx`, `src/pages/PaginaTienda.module.scss`.

**Qué renderiza hoy.** `<main>` (`src/pages/PaginaTienda.tsx:309`) con `<h1>`
(`:311`), `<p>` de aviso (`:312`),
`<section aria-label="Catálogo" aria-describedby>` (`:313`) que contiene
`<fieldset aria-label="Filtrar por categoría">` > `<button aria-pressed>`
(`:67-85`) y `<ul>` > `<li>` con `<img>` + `<h2>` + `<p>` (categoría) + `<p>`
(importe) + `<button>` (`:93-109`); fuera de la sección, `<output>` con el
contador + `<button>` de cesta (`:256-269`, montado en `:322`); y, al abrirse,
un `<dialog open aria-modal>` con `<h2>`, `<ul>` > `<li>` con tres `<p>` y tres
`<button>`, un `<button>` de vaciar, un `<p>` de total y un `<a>`(Link)
(`:193-248`).

**Mixins que usa.** `contenedor` (`src/pages/PaginaTienda.module.scss:2`),
`pildora-filtro` en el filtro (`:32`), `tarjeta` en `li` del catálogo (`:45`) y
en `.dialogoCesta` (`:99`), `hueco-de-imagen(4, 3)` (`:52`), `eyebrow` en el
`<p>` de categoría (`:64` — **uno de los dos únicos usos de `eyebrow`**),
`boton-primario` en el botón de añadir (`:77`), en el botón de cesta (`:95`) y en
el enlace del diálogo (`:173`), `pildora-etiqueta` en el `<output>` contador
(`:90`), y `boton-fantasma` en los botones de línea (`:155`) y de vaciar (`:163`).

Es el módulo que **más mixins de patrón usa**: 8 de los 10.

**Mixins que NO usa y le vendrían bien.**
- `fila-de-accion-de-tarjeta` — el botón de añadir reimplementa a mano su mitad
  (`margin-block-start: auto`, `:78`) sin el borde superior ni el
  `padding-block-start` del mixin.
- `prosa` — no aplica aquí.

**Hueco de imagen.** **Sí**, 4/3 con radio 12px (`:52-54`). El dato **sí trae
ruta**: `src/data/tienda.ts:29` declara `imagen` y las 8 entradas la rellenan
(`/img/tienda/pienso-perro-adulto.webp` … `/pelota-con-sonido.webp`,
`src/data/tienda.ts:39, 45, 51, 57, 63, 69, 75, 81`). Los 8 ficheros existen en
`public/img/tienda/`. Se pintan con
`width={800} height={600} loading="lazy" decoding="async"`
(`src/pages/PaginaTienda.tsx:96`) y `alt=""` — la imagen es decorativa, el nombre
lo aporta el `<h2>` contiguo.

**Props y datos.** `catalogo?: readonly ProductoDemo[]`
(`src/pages/PaginaTienda.tsx:271-274`), por defecto `PRODUCTOS_DEMO` (`:277`),
las 8 entradas de `src/data/tienda.ts:34-83`. Las categorías del filtro salen de
`CATEGORIAS_TIENDA` (`src/data/tienda.ts:32`, 4 valores) más «Todos»
(`src/pages/PaginaTienda.tsx:59-60`). El catálogo se valida con
`construirCatalogoSeguro`, que falla cerrado a `[]` (`:33-39`). La cesta es
estado local (`:280`).

**Valores que aplica hoy.**
- Radio: 24px vía `tarjeta` en las tarjetas de producto; 12px en la imagen
  (`:54`); **0 en el diálogo, que anula el radio de `tarjeta`**
  (`border-radius: 0`, `:108`); 999px en botones y píldoras.
- Sombra: reposo → elevada vía `tarjeta`; el diálogo **fuerza elevada también en
  hover** (`:115-117`).
- Tipografía: `h1` en `--fuente-titulares`, `paso-tipografico(5)` = 48.83px
  (`:7-8`); `h2` de producto en `--fuente-titulares`, `paso-tipografico(1)` =
  20px (`:58-59`); importe en `--fuente-titulares`, peso 700,
  `paso-tipografico(2)` = 25px, `--color-tinta` (`:69-72`); categoría vía
  `eyebrow` = 12.8px, peso 700, `letter-spacing: 0.12em` (`:64`); `h2` del
  diálogo en 25px (`:122-123`); total en `paso-tipografico(1)` = 20px, peso 700
  (`:168-169`).
- Espaciado: `padding-block: espaciado(64)` (`:3`);
  `margin-block-end: espaciado(8)` en `h1` (`:9`) y `espaciado(24)` en el aviso
  (`:15`); filtro con `gap: espaciado(8)` y `margin-block-end: espaciado(24)`
  (`:26-27`); rejilla `minmax(min(260px, 100%), 1fr)` con `gap: espaciado(24)` y
  `margin: 0 0 espaciado(48)` (`:38-41`); imagen con
  `margin-block-end: espaciado(16)` (`:53`); diálogo con `padding: espaciado(24)`
  (`:109`) y `width: min(420px, 100%)` (`:104`); líneas de cesta con
  `gap: espaciado(8)` y `padding-block: espaciado(12)` (`:144-145`).
  **`padding: espaciado(20)` de la tarjeta de producto (`:47`) no se emite** (H3):
  las tarjetas del catálogo quedan **sin relleno interior**.
- Altura de control: los botones de línea bajan a
  `$altura-control-pequena` = 40px (`:156`).
- Ancho de contenedor: 1024px (`:2`), con el aviso a `62ch` (`:14`).

---

## 18. `PaginaNoEncontrada`

**Ficheros:** `src/pages/PaginaNoEncontrada.tsx`,
`src/pages/PaginaNoEncontrada.module.scss`.

**Qué renderiza hoy.** `<section>` (`src/pages/PaginaNoEncontrada.tsx:12`) con
`<h1>` (`:13`) y un `<a>` «Volver al inicio» (`:14`). Nada más.

**Mixins que usa.** `contenedor` (`src/pages/PaginaNoEncontrada.module.scss:2`) y
`boton-primario` (`:14`).

**Mixins que NO usa y le vendrían bien.** `eyebrow` (un «Error 404» sobre el
titular), `pildora-etiqueta`, `hueco-de-imagen` (una ilustración de estado vacío)
y `tarjeta`. Hoy la página es un titular y un botón sobre el fondo desnudo.

**Hueco de imagen.** No. No hay fichero en `src/data/` asociado:
**NO CONSTA EN LA FUENTE** ninguna ruta de imagen.

**Props y datos.** **Ninguna prop**:
`export function PaginaNoEncontrada(): React.JSX.Element`
(`src/pages/PaginaNoEncontrada.tsx:10`). El único dato es el destino `'/'`
resuelto con `hrefDeDestino` (`:14`).

**Valores que aplica hoy.**
- Radio: 999px vía `boton-primario`.
- Sombra: ninguna.
- Tipografía: `h1` en `--fuente-titulares`, `paso-tipografico(4)` = 39.06px
  (`:8-9`).
- Espaciado: `padding-block: espaciado(96)` = 96px (`:3`) — el mayor de todo el
  repositorio — y `margin-block-end: espaciado(16)` (`:10`).
- Ancho de contenedor: 1024px (`:2`).

---

## 19. Tabla resumen

Criterio de cada columna:
- **tiene imagen**: el módulo renderiza hoy un `<img>` (o un marco de medio) en
  su DOM real.
- **tiene píldora**: usa `pildora-etiqueta` o `pildora-filtro`.
- **tiene eyebrow**: usa el mixin `eyebrow` (no «reescribe algo parecido»).
- **usa mixin tarjeta**: `@include tarjeta`.
- **ancho contenedor**: ancho máximo efectivo del contenido.

| módulo | tiene imagen | tiene píldora | tiene eyebrow | usa mixin tarjeta | ancho contenedor |
|---|---|---|---|---|---|
| `Landing` (envoltorio) | no | no | no | no | 1024px (lo aplica al hijo) |
| `Cabecera` | no | no | no (lo reescribe a mano) | no | **ninguno** (banda completa) |
| `Hero` | no | no | **sí** (`Hero.module.scss:14`) | no | 1024px, recortes a 640px |
| `Servicios` | no | no | no | **sí** (`:21`) | 1024px |
| `CampanasPortada` | **sí** 16/9 (`:46`) | **sí** etiqueta (`:50`) | no | **sí** (`:32`) | 1024px (propio, `:6`) |
| `Equipo` | no | no | no (lo reescribe a mano) | **sí** (`:20`) | 1024px |
| `ReservaChat` | no | **sí** filtro (`:90`) | no | **sí** (`:43`) | 1024px |
| `Galeria` | **sí** 4/3 (`:56`) | no | no | no | 1024px |
| `FormularioContacto` | no | no | no | **sí** (`:8`, `:60`) | 1024px |
| `InformacionContacto` | no (`<iframe>` 16/9 a mano, `:14`) | no | no | no | 1024px |
| `Faq` | no | no | no | no | **860px** (`:6`) |
| `PieDePagina` | **sí** 1/1 (`:57`) | no | no (lo reescribe a mano) | no | 1024px (`:18`) |
| `SelectorPaleta` | no | no (lo reescribe a mano) | no | **sí** (`:15`) | ninguno (flotante) |
| `MetadatosPagina` | no (solo `og:image`) | no | no | no | no aplica |
| `PaginaBlog` | **sí** 16/9 ×2 (`:92`, `:146`) | **sí** etiqueta + filtro (`:62`, `:35`) | no | **sí** (`:48`, `:106`) | 1024px, artículo a **760px** |
| `PaginaCampanas` | **sí** 16/9, solo listado (`:67`) | **sí** etiqueta (`:71`, `:97`) | no | **sí** (`:59`, `:142`) | 1024px |
| `PaginaTienda` | **sí** 4/3 (`:52`) | **sí** etiqueta + filtro (`:90`, `:32`) | **sí** (`:64`) | **sí** (`:45`, `:99`) | 1024px |
| `PaginaNoEncontrada` | no | no | no | no | 1024px (`:2`) |

Recuentos sobre los 18 módulos: 6 con imagen, 5 con píldora, **2 con eyebrow**,
9 con `tarjeta`, 4 anchos de contenido distintos conviviendo (1024 / 860 / 760 /
640) más 2 módulos sin ancho ninguno (`Cabecera`, `SelectorPaleta`).

---

## 20. Hallazgos

Ordenados por impacto. Los cuatro primeros están **verificados compilando** con
`node_modules/.bin/sass --load-path=src/styles`.

### H1 — `espaciado(20)` no existe en la escala: 8 declaraciones se caen del CSS

`$escala-espaciado` (`src/styles/_api.scss:46-56`) define los pasos
`4, 8, 12, 16, 24, 32, 48, 64, 96`. **No define 20.** `map.get` devuelve `null`
y Sass **omite silenciosamente** la declaración entera. Compilado en vivo:
`.p { padding-inline: espaciado(20) }` produce una regla vacía.

Las 8 apariciones de `espaciado(20)` en `src/`: `_api.scss:254`,
`Servicios.module.scss:45`, `PaginaBlog.module.scss:55`,
`PaginaTienda.module.scss:47`, `PaginaCampanas.module.scss:61`, `:78`, `:84` y
`:90` (las tres últimas, dentro de un shorthand — ver H3).

Sitios afectados:
- `src/styles/_api.scss:254` — `padding-inline: espaciado(20)` dentro de
  **`boton-fantasma`**. Compilando el mixin aislado, el CSS resultante **no
  contiene ningún `padding-inline`**: los 10 usos de botón fantasma del sitio
  (`Cabecera:109`, `CampanasPortada:63`, `FormularioContacto:75`, `Galeria:28`,
  `Hero:61`, `ReservaChat:23`, `PaginaCampanas:89` y `:128`, `PaginaTienda:155`
  y `:163`) quedan **sin relleno horizontal**, con el texto pegado al borde de
  999px. Es el hallazgo de mayor alcance del inventario.
- `src/pages/PaginaBlog.module.scss:55` — las tarjetas del listado del blog
  quedan **sin `padding` interior**.
- `src/pages/PaginaTienda.module.scss:47` — las tarjetas del catálogo quedan
  **sin `padding` interior**.
- `src/components/Servicios.module.scss:45` — la lista de puntos pierde su
  sangrado (`padding-inline-start`), así que las viñetas se salen del texto.
- `src/pages/PaginaCampanas.module.scss:61` — la tarjeta pierde su
  `padding-block-end`.

### H2 — `espaciado(56)` tampoco existe: `CampanasPortada` se queda sin aire vertical

`src/components/CampanasPortada.module.scss:7` declara
`padding-block: espaciado(56)`. Mismo mecanismo que H1: la declaración **no se
emite**. Es la única sección de la landing que no tiene wrapper propio, así que
tampoco hereda separación de `Landing.module.scss`: queda **pegada** a
`Servicios` por arriba y a `Equipo` por abajo. Todas las demás secciones sí
declaran `padding-block: espaciado(64)`, que sí existe.

### H3 — Tres `margin` abreviados de `PaginaCampanas` colapsan y cambian de significado

Cuando el `null` cae **en medio** de una lista abreviada, Sass no deja hueco:
recompone el shorthand con los valores que quedan, y la propiedad pasa a
significar otra cosa. Compilado en vivo:

| Fuente | Escrito | Compilado | Efecto real |
|---|---|---|---|
| `PaginaCampanas.module.scss:78` | `margin: espaciado(16) espaciado(20) 0` | `margin: 16px 0` | laterales pasan de 20px a **0** y el inferior de 0 a **16px** |
| `PaginaCampanas.module.scss:84` | `margin: espaciado(4) espaciado(20) espaciado(12)` | `margin: 4px 12px` | laterales pasan a **12px**, el inferior a **4px** |
| `PaginaCampanas.module.scss:90` | `margin: 0 espaciado(20) espaciado(4)` | `margin: 0 4px` | laterales pasan a **4px**, el inferior a **0** |

Consecuencia visible: en las tarjetas del listado de campañas el `<p>` de bloque,
el `<h2>` y el enlace **quedan pegados al borde izquierdo de la tarjeta**, cada
uno con un margen distinto y ninguno con el que se pretendía.

### H4 — `styles.bloquePublicado` no tiene regla CSS

`src/pages/PaginaCampanas.tsx:123` renderiza
`<section className={styles.bloquePublicado}>`, pero **`PaginaCampanas.module.scss`
no declara ninguna clase `.bloquePublicado`** (sí declara `.llamadasAAccion`,
`:117`, y `.otrasCampanas`, `:133`). Con CSS Modules ese acceso devuelve
`undefined`, así que la sección «Qué publica la clínica» de cada ficha se
renderiza literalmente **sin clase y sin estilos propios**.

### H5 — `fila-de-accion-de-tarjeta` está definido y **nunca se usa**

`src/styles/_api.scss:193-197` define el mixin que ancla el pie de una tarjeta
(`margin-block-start: auto` + `padding-block-start: espaciado(16)` +
`border-block-start`). `grep` sobre todo `src/` devuelve **una única aparición**:
la propia definición. Cinco módulos reimplementan a mano solo su primera mitad,
perdiendo la separación y el borde: `Servicios.module.scss:32`,
`Equipo.module.scss:38`, `PaginaTienda.module.scss:78`, y sin ni siquiera eso
`PaginaCampanas.module.scss:88-92` y `PaginaBlog.module.scss:51-59`. El síntoma
visible es que los pies de las tarjetas de una misma fila **no se alinean** entre
sí cuando los títulos ocupan distinto número de líneas.

### H6 — `eyebrow` solo se usa en 2 de 18 módulos, y 3 lo reescriben a mano

Usos reales: `Hero.module.scss:14` y `PaginaTienda.module.scss:64`. Lo
reimplementan con valores propios y divergentes:
- `Cabecera.module.scss:45-52` — `paso-tipografico(-2)`, `letter-spacing: 0.14em`,
  `--color-texto-suave`.
- `PieDePagina.module.scss:24-31` — `paso-tipografico(0)`,
  `letter-spacing: 0.06em`, `--color-tinta`.
- `PaginaCampanas.module.scss:77-81` — sin mayúsculas ni `letter-spacing`.

Y lo necesitan sin tenerlo: el rol del profesional
(`Equipo.module.scss:29-33`), la categoría del artículo (que
`PaginaBlog` **ni siquiera muestra**, aunque `src/data/blog.ts:46` la declara), y
los cuatro `aria-label` de `InformacionContacto` que hoy **no tienen ninguna
contrapartida visible** (`src/components/InformacionContacto.tsx:69, 75, 83, 95`).

### H7 — Cuatro anchos de contenido conviven en el sitio

`contenedor` promete «un único ancho máximo compartido por las 6 rutas»
(`src/styles/_api.scss:132`), pero por encima de él se recorta a: **860px** en
`Faq.module.scss:6`, **760px** en el artículo de `PaginaBlog.module.scss:82`, y
**640px** tres veces en `Hero.module.scss:26, 31, 72`. A eso se suman los `62ch`
de los avisos (`PaginaBlog:14`, `PaginaCampanas:20`, `PaginaTienda:14`) y los
`70ch` de las respuestas de FAQ (`Faq.module.scss:45`).

### H8 — `Cabecera` es el único bloque de banda completa sin `contenedor`

`src/components/Cabecera.module.scss:11-26` resuelve su margen con
`padding-inline: espaciado(24)` (`:22`) y **sin `max-width`**. `PieDePagina`, en
la misma situación, sí lo aplica en su interior (`PieDePagina.module.scss:18`).
En una pantalla ancha el nombre comercial y la navegación **no quedan alineados
con ninguna columna del contenido**.

### H9 — Cuatro módulos anulan o alteran el hover de `tarjeta`

`tarjeta` sube la sombra a `--sombra-elevada` en `:hover`
(`src/styles/_api.scss:184-186`). Lo revierten a reposo:
`FormularioContacto.module.scss:15-18`, `ReservaChat.module.scss:47-49` y
`SelectorPaleta.module.scss:25-27`. Y `PaginaTienda.module.scss:115-117` lo fija
a elevada en un diálogo que además anula el radio (`border-radius: 0`, `:108`).
Es decir: de los 13 usos de `tarjeta`, **4 tienen que deshacer parte del mixin**.
El patrón mezcla «superficie» con «afordancia de clic» y quien no es clicable
paga el precio.

### H10 — Tres módulos de la landing tienen botones sin ningún mixin de botón

`Servicios.module.scss:30-41`, `Equipo.module.scss:35-46` y
`Faq.module.scss:14-42` estilizan sus `<button>` como texto plano
(`border: none; background: none`). Son las tres únicas interacciones de la
landing sin forma de control, frente a los 9 botones fantasma y los 8 primarios
del resto del sitio.

### H11 — `$radio-pequeno` (4px) no se usa en ningún `.module.scss`

Definido en `src/styles/_api.scss:106`. `grep '\$radio-'` sobre los
`.module.scss` devuelve 13 apariciones y **ninguna es `$radio-pequeno`**:
`$radio-medio` 8 veces (`Cabecera:142`, `FormularioContacto:32`,
`PieDePagina:60`, `ReservaChat:63` y `:76`, `SelectorPaleta:37`,
`PaginaBlog:147`, `PaginaTienda:54`), `$radio-grande` 3 (`Galeria:57`,
`InformacionContacto:16`, `PaginaBlog:94`), `$radio-completo` 1 literal
(`Cabecera:86`, más los que llegan por mixin) y `$radio-circulo` 1
(`SelectorPaleta:55`). La escala declara 5 pasos y el sistema usa efectivamente 4.

### H12 — `prosa` se usa una sola vez

`src/styles/_api.scss:337-359`, aplicado únicamente en
`src/pages/PaginaBlog.module.scss:77`. Las respuestas de FAQ, que son el otro
bloque de lectura larga del sitio, usan un `line-height: 1.7` propio
(`Faq.module.scss:48`) en vez del 1.8 del mixin.

### H13 — `Servicios` y `Equipo` no pueden llevar imagen: el dato no la declara

`src/data/servicios.ts:11-14` (`BloqueServicio`) declara `titulo` y `puntos`.
`src/data/equipo.ts:8-12` (`Profesional`) declara `nombre`, `rol` y `formacion?`.
**NO CONSTA EN LA FUENTE** ningún campo de imagen en ninguno de los dos. Son las
dos secciones de tarjetas de la landing que hoy no tienen ni pueden tener hueco
de imagen sin tocar antes el modelo de datos.

### H14 — La ficha de `/campanas` no muestra la imagen que su propio dato ya trae

`src/data/campanas.ts:67, 74, 81` declaran una ruta de imagen por campaña, y
`PaginaCampanas` la pinta **solo en el listado** (`src/pages/PaginaCampanas.tsx:45`).
La vista de ficha (`:226-239`) no renderiza ningún `<img>`, y las tarjetas de
«Otras campañas» tampoco (comentario explícito en
`src/pages/PaginaCampanas.module.scss:132`). Mismo caso en el listado del blog:
`src/data/blog.ts:46` declara `imagen` para las 6 entradas y las tarjetas del
listado (`src/pages/PaginaBlog.tsx:52-61`) **no la usan**, aunque «Sigue leyendo»
sí (`:174`).

### H15 — `InformacionContacto` reimplementa `hueco-de-imagen` a mano

`src/components/InformacionContacto.module.scss:11-17` declara `width: 100%` y
`aspect-ratio: 16 / 9` para el `<iframe>` del mapa. Es literalmente lo que hace
`hueco-de-imagen(16, 9)` (`src/styles/_api.scss:203-210`), menos el fondo
`--color-fondo-alterno` mientras el marco carga. Además es, junto con `Faq`, uno
de los **dos únicos módulos del repositorio que no usan ninguno de los 10 mixins
de patrón** (solo `foco-visible` y `area-tactil-minima`):
`InformacionContacto.module.scss:26-27` y `Faq.module.scss:15-16`, `:52`.

### H16 — `Galeria` es contenido de demostración sin píldora que lo diga

Su aviso (`src/components/Galeria.tsx:57-61`) es un `<p>` gris
(`Galeria.module.scss:22-25`). Los otros cuatro módulos de demostración —
`CampanasPortada:50`, `PaginaBlog:62`, `PaginaCampanas:71` y `:97`,
`PaginaTienda:90` — sí llevan `pildora-etiqueta`. `Galeria` además **no tiene
`<h2>` ni titular visible** (solo `aria-label="Galería"`, `.tsx:52`).

### H17 — La ruta del logotipo vive en el `.tsx`, no en `src/data/`

`src/components/PieDePagina.tsx:13` declara
`const SRC_LOGO = '/img/logo-galapavet.webp'` con un comentario que lo marca como
PENDIENTE por «el fichero no existe aún» (`:9-12`); el fichero **sí existe** hoy
en `public/img/logo-galapavet.webp`, así que el comentario está caducado. Mismo
patrón en `src/components/MetadatosPagina.tsx:41` con la imagen Open Graph.
Ninguna de las dos rutas pasa por un catálogo de `src/data/`.

### H18 — `SelectorPaleta` reescribe `pildora-filtro` en vez de usarlo

`src/components/SelectorPaleta.module.scss:29-48` construye a mano un control con
estado en `[aria-pressed='true']` (`:43-47`) — exactamente el contrato de
`pildora-filtro` (`src/styles/_api.scss:314-318`) — pero con
`border-radius: $radio-medio` (`:37`) en vez de 999px, sin borde y con otro
esquema de color activo (`--color-acento-suave` en vez de `--color-primario`).

---

**Total: 18 módulos inventariados, 18 hallazgos.**
