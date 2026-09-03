# Delta de fidelidad — Lienzo global de la portada

> Sección analizada: **lienzo global** — ancho de contenido, sangrados laterales,
> ritmo vertical, fondos alternos, contenedor de la portada
> (`src/pages/Landing.tsx` + `src/pages/Landing.module.scss`), hoja global
> (`src/styles/global.scss`), API de Sass (`src/styles/_api.scss`) y tokens
> (`src/styles/_tokens.scss`).
>
> Prototipo leído: `docs/diseno-claude-design/Veterinaria La Sierra.dc.html`
> (se cita como `VLS:línea`). Capturas comparadas a 1280 px: `diseno_00..06.png`
> y `web_00..04.png` del scratchpad de la sesión. Producción comprobada sobre
> `dist/assets/index-CCVUwotx.css` (build actual).
>
> Convención: los valores del prototipo se dan tal cual los escribe el HTML;
> los del sitio, tal cual los escriben los `.scss` y tal cual los compila
> Lightning CSS en `dist/`.

---

## Anatomía del prototipo

### 1. Documento y hoja global (`VLS:16-61`)

| Regla | Valor exacto |
|---|---|
| Tipografías | `Outfit` 400-700 (titulares) y `DM Sans` 400/500/700 (texto), Google Fonts `display=swap` (`VLS:15`) |
| `*` | `box-sizing: border-box` (`VLS:50`) |
| `html` | `scroll-behavior: smooth; scroll-padding-top: 88px` (`VLS:51`) |
| `body` | `margin: 0; background: var(--bg); color: var(--text); font-family: 'DM Sans', system-ui, -apple-system, sans-serif; -webkit-font-smoothing: antialiased; overflow-x: hidden` (`VLS:52`) |
| `img` | `max-width: 100%` (`VLS:53`) |
| `p` | `text-wrap: pretty` (`VLS:54`) |
| `a` | `color: var(--primary); text-decoration: none; transition: color .3s ease`; `a:hover { color: var(--accent-ink) }` (`VLS:55-56`) |
| Controles | `input, select, textarea, button { font: inherit }` (`VLS:57`) |
| `summary::-webkit-details-marker` | `display: none` (`VLS:58`) |
| Animación | `@keyframes vlsPulso` (opacidad 1 → .35, escala 1 → .78, 1.6 s) (`VLS:59`) |
| Movimiento reducido | `html { scroll-behavior: auto }` y `* { animation-duration: .01ms !important; transition-duration: .01ms !important }` (`VLS:60`) |

Tokens (`VLS:18-25`, tema `clinica` = `:root`): `--bg #F8FAFC`, `--bg-2 #EDF2F9`,
`--card #FFFFFF`, `--surface #FBFDFF`, `--border rgba(15,32,60,.13)`,
`--ink #0B1B33`, `--text #3C4C66`, `--muted #5E6E88`, `--primary #1E40AF`,
`--primary-strong #1B3796`, `--on-primary #FFFFFF`, `--accent #10B981`,
`--accent-ink #047857`, `--accent-soft #E7F8F1`, `--urg #DC2626`,
`--urg-soft #FEE9E9`, `--shadow 0 18px 45px rgba(15,32,60,.10)`,
`--shadow-sm 0 6px 18px rgba(15,32,60,.07)`. Equivalencia con el sistema:
`--bg → --color-fondo`, `--bg-2 → --color-fondo-alterno`, `--card →
--color-superficie`, `--surface → --color-superficie-elevada`, `--shadow →
--sombra-elevada`, `--shadow-sm → --sombra-reposo` (ya verificada por @s3 de
`rediseno_visual.feature`; los tokens NO son objeto de este informe).

### 2. Raíz y flujo vertical (`VLS:64`)

`<div style="background:var(--bg);color:var(--text);min-height:100vh;overflow-x:hidden">`
contiene, en este orden y todo **en flujo normal** (nada `position: fixed`):

| # | Bloque | Etiqueta | Fondo | Relleno vertical | Relleno lateral | Contenedor interior | Alineación del texto |
|---|---|---|---|---|---|---|---|
| 0 | Barra de urgencias (`VLS:66-75`) | `div` | `var(--urg)` | `9px` | `18px` | ninguno: `flex; justify-content:center; flex-wrap:wrap; gap:6px 14px` | centrado |
| 1 | Cabecera (`VLS:77-113`) | `header` **`position: sticky; top: 0; z-index: 60`** | `color-mix(in srgb, var(--bg) 88%, transparent)` + `backdrop-filter: blur(14px)` + `border-bottom: 1px solid var(--border)` | `12px` | `clamp(16px, 4vw, 28px)` | `max-width: 1220px; margin: 0 auto; display:flex; align-items:center; justify-content:space-between; gap:16px` (`VLS:78`) | logo izquierda, nav derecha |
| 2 | Hero `#inicio` (`VLS:115-141`) | `section` | `#0B1B33` + gradiente `linear-gradient(180deg, rgba(6,16,32,.62) 0%, rgba(6,16,32,.46) 42%, rgba(6,16,32,.78) 100%)` + foto `background-size: cover; background-position: center 42%` | **`min-height: clamp(540px, 84vh, 780px)`**, `display:flex; align-items:center; justify-content:center; overflow:hidden` — **sin** relleno en la `section` | ninguno en la `section` | `max-width: 900px; margin: 0 auto; padding: clamp(84px,13vw,140px) clamp(18px,6vw,32px) clamp(60px,9vw,92px); text-align:center; display:flex; flex-direction:column; align-items:center` (`VLS:116`) | centrado |
| 3 | Servicios `#servicios` (`VLS:143`) | `section` | `var(--bg)` | `clamp(64px, 9vw, 104px)` | `clamp(18px, 5vw, 28px)` | `max-width: 1220px; margin: 0 auto` (`VLS:144`) | izquierda |
| 4 | Campañas `#campanas` (`VLS:184`) | `section` | `var(--bg-2)` | **`clamp(56px, 8vw, 90px)`** (la compacta) | `clamp(18px, 5vw, 28px)` | `max-width: 1220px; margin: 0 auto; display:grid; grid-template-columns: repeat(auto-fit, minmax(min(300px,100%), 1fr)); gap: clamp(24px,4vw,44px); align-items:center` (`VLS:185`) | izquierda |
| 5 | Equipo `#equipo` (`VLS:210`) | `section` | `var(--bg)` | `clamp(64px, 9vw, 104px)` | `clamp(18px, 5vw, 28px)` | `max-width: 1220px; margin: 0 auto` + cabecera de sección `max-width: 640px; margin: 0 auto; text-align:center` (`VLS:211-212`) | cabecera centrada, rejilla completa |
| 6 | Reservar `#reservar` (`VLS:255`) | `section` | `var(--bg-2)` | `clamp(64px, 9vw, 104px)` | `clamp(18px, 5vw, 28px)` | `max-width: 1220px; margin: 0 auto; display:grid; grid-template-columns: repeat(auto-fit, minmax(min(320px,100%),1fr)); gap: clamp(28px,4vw,52px); align-items:center` (`VLS:256`) | izquierda |
| 7 | Galería `#galeria` (`VLS:318`) | `section` `overflow: hidden` | `var(--bg)` | `clamp(64px, 9vw, 104px)` | **`0`** en la `section` | cabecera `max-width: 1220px; margin: 0 auto; padding: 0 clamp(18px,5vw,28px); display:flex; flex-wrap:wrap; align-items:flex-end; justify-content:space-between; gap:18px` (`VLS:319`); **pista a sangre** `display:flex; gap:18px; margin-top: clamp(28px,4vw,42px); padding: 6px clamp(18px,5vw,28px) 22px; overflow-x:auto; scroll-snap-type:x mandatory; scrollbar-width:none` (`VLS:330`) | izquierda |
| 8 | Contacto `#contacto` (`VLS:346`) | `section` | `var(--bg-2)` | `clamp(64px, 9vw, 104px)` | `clamp(18px, 5vw, 28px)` | `max-width: 1220px; margin: 0 auto` + cabecera `max-width: 640px` + rejilla `grid-template-columns: repeat(auto-fit, minmax(min(320px,100%),1fr)); gap: clamp(24px,3vw,34px); margin-top: clamp(32px,4.5vw,48px); align-items:start` (`VLS:347-354`) | izquierda |
| 9 | FAQ `#faq` (`VLS:424`) | `section` | `var(--bg)` | `clamp(64px, 9vw, 104px)` | `clamp(18px, 5vw, 28px)` | **`max-width: 860px; margin: 0 auto`** (`VLS:425`) + cabecera `text-align:center` | cabecera centrada, acordeón a 860 |
| 10 | Pie (`VLS:445-475`) | `footer` | `var(--card)` + `border-top: 1px solid var(--border)` | `clamp(48px, 7vw, 72px)` arriba, `28px` abajo | `clamp(18px, 5vw, 28px)` | `max-width: 1220px; margin: 0 auto; display:flex; flex-wrap:wrap; gap:32px` (`VLS:446`); barra legal `max-width: 1220px; margin: 36px auto 0; padding-top: 20px; border-top: 1px solid var(--border); display:flex; justify-content:space-between; font-size: 12.5px; color: var(--muted)` (`VLS:467`) | logo/columnas izquierda, legal repartido |
| 11 | Selector de paleta (`VLS:477-501`) | `div` **`position: fixed; right: clamp(14px,3vw,26px); bottom: clamp(14px,3vw,26px); z-index: 90`** | botón `52×52px; border-radius:50%; border:1px solid var(--border); background:var(--card); box-shadow:var(--shadow)` con muestra `conic-gradient` de 24 px; panel `width: min(268px, calc(100vw - 32px)); border-radius:18px; padding:14px` | — | — | — | — |

**Patrón de banda, uno solo para las 7 secciones de contenido**: la `<section>` pinta
el fondo a todo el ancho de la ventana y lleva el relleno (`padding: <vertical> <lateral>`);
un `<div style="max-width:1220px;margin:0 auto">` **sin relleno propio** acota el
contenido. Por tanto **1220 px es ancho de contenido**, no de caja con relleno.

**Alternancia de fondos (de arriba abajo)**: hero (oscuro sobre foto) → `--bg` →
`--bg-2` → `--bg` → `--bg-2` → `--bg` → `--bg-2` → `--bg` → pie `--card`.
Servicios, Equipo, Galería y FAQ van sobre `--bg`; Campañas, Reservar y Contacto
sobre `--bg-2`. Nunca hay dos bandas seguidas del mismo color salvo hero/servicios
(que no se parecen porque el hero va sobre foto).

**Anchos secundarios declarados**: 900 px (hero, `VLS:116`), 860 px (FAQ, `VLS:425`),
720 px (banda de cifras del hero, `VLS:131`), 640 px (cabeceras centradas de Equipo y
Contacto, `VLS:211`, `VLS:347`), 268 px (panel del selector).

### 3. Valores resueltos a los anchos de referencia

| Magnitud | 320 px | 1024 px | 1280 px (capturas) | 1440 px | 1600 px |
|---|---|---|---|---|---|
| Sangrado lateral de sección `clamp(18px,5vw,28px)` | 18 | 28 | 28 | 28 | 28 |
| Ancho de contenido (`min(1220, ancho − 2·sangrado)`) | 284 | 968 | **1220** (x = 30 → 1250) | 1220 | 1220 |
| Relleno vertical normal `clamp(64px,9vw,104px)` | 64 | 92.16 | **104** | 104 | 104 |
| Relleno vertical compacto (Campañas) `clamp(56px,8vw,90px)` | 56 | 81.92 | **90** | 90 | 90 |
| Sangrado de la cabecera `clamp(16px,4vw,28px)` | 16 | 28 | 28 (logo en x = 58, "Tienda" acaba en x = 1222) | 28 | 28 |
| Alto del hero `clamp(540px,84vh,780px)` (ventana de 900 de alto) | 540 | 756 | 756 (≈ 755 medidos en `diseno_00.png`, y = 100 → 855) | 756 | 756 |
| Relleno superior del pie `clamp(48px,7vw,72px)` | 48 | 71.68 | 72 | 72 | 72 |

### 4. Puntos de corte

No hay **ningún `@media` de maquetación** en el prototipo: la respuesta al ancho la
hacen los `clamp()` y las rejillas `repeat(auto-fit, minmax(min(N px,100%),1fr))`
(N = 310 servicios, 300 campañas y equipo, 320 reservar y contacto, 210 fichas de
campaña, 180 campos del formulario, 200 datos de contacto). El único umbral es de
JavaScript: `esMovil = ancho < 1120` (`VLS:684`) para conmutar nav ↔ botón de menú.

### 5. Desplazamiento a un ancla

`scroll-padding-top: 88px` con una cabecera pegajosa de ≈ 63-65 px (medida en
`diseno_00.png`: 35 → 100): el titular de la sección aterriza ≈ 24 px por debajo del
borde inferior de la cabecera. La barra de urgencias **no** es fija: se va con el
desplazamiento.

---

## Estado actual de la web

### 1. Lo que declara el código

**`src/styles/global.scss`** (única hoja global, importada por `src/main.tsx`):

- `:root { --fuente-titulares; --fuente-texto; --altura-cabecera: 64px; --altura-barra-urgencias: 32px; --ritmo-seccion: clamp(72px, 7.2vw, 104px); --ritmo-seccion-compacto: clamp(56px, 6.2vw, 90px) }`.
- Reset de 9 familias (Decisión 29): `body { margin: 0; min-height: 100svh; line-height: 1.5; background-color: var(--color-fondo); color: var(--color-texto); font-family: var(--fuente-texto) }`, `h1-h6 { font-weight: 600; letter-spacing: -0.015em; line-height: 1.08; text-wrap: balance }`, `h1 { letter-spacing: -0.02em }`.
- **`#root { isolation: isolate; display: flex; flex-direction: column; min-height: 100svh; padding-block-start: calc(var(--altura-cabecera) + var(--altura-barra-urgencias)) }`** = 96 px reservados porque barra y cabecera son `position: fixed`.
- `html { scroll-padding-top: calc(var(--altura-cabecera) + 16px) }` = **80 px** (solo la cabecera, sin la barra).
- `a { color: inherit }` (corrección de @s45 para la variante `tech`; el prototipo usa `--primary`).
- Sin `overflow-x: hidden` en `body` (el prototipo lo declara; el sitio lo cubre con la puerta @s44).

**`src/styles/_api.scss`**:

- `$ancho-maximo-contenedor: 1220px`.
- `@mixin contenedor { width: 100%; max-width: 1220px; margin-inline: auto; padding-inline: espaciado(24) }` → con `box-sizing: border-box`, **el 1220 incluye los 48 px de relleno: el contenido útil mide 1172 px**, no 1220. Sangrado **fijo** de 24 px a cualquier ancho (el prototipo: 18 → 28 fluido).

**`src/pages/Landing.tsx`** (DOM real de la ruta `/`):

```
main#contenido-principal
├─ div#inicio.seccion          > section.hero[data-contenedor-principal]
├─ div#servicios.seccionAlterna > section.servicios[data-contenedor-principal]
├─ section.campanasPortada[data-contenedor-principal]   ← sin wrapper, pinta su propio fondo
├─ div#equipo.seccionAlterna    > section.equipo
├─ div#reservar.seccion         > section.reservaChat
├─ div#galeria.seccionAlterna   > section.galeria
├─ div#contacto.seccion         > form.formulario[data-contenedor-principal]
│                               > section.informacionContacto      ← DOS hijos directos
└─ div#faq.seccionAlterna       > section.faq
```

**`src/pages/Landing.module.scss`**:

- `.seccion { scroll-margin-block-start: 96px; background-color: var(--color-fondo); color: var(--color-texto); > * { @include contenedor; padding-block: var(--ritmo-seccion) } }`.
- `.seccionAlterna` idéntica con `--color-fondo-alterno`.
- `#inicio { background-color: var(--color-fondo); > * { width: 100%; max-width: none; padding-inline: 0 } }` — **pensada para que el hero sangre a toda la ventana**.

**Lo que compila de verdad** (`dist/assets/index-CCVUwotx.css`, extraído hoy):

```
#_inicio_1yq0o_1{background-color:var(--color-fondo)}
#_inicio_1yq0o_1>*{width:100%;max-width:none;padding-inline:0}
#_contacto_dj8i3_1{grid-template-columns:repeat(auto-fit,minmax(min(400px,100%),1fr));align-items:start;gap:32px;display:grid}
._seccion_1yq0o_1>*{width:100%;max-width:1220px;padding-inline:24px;padding-block:var(--ritmo-seccion);margin-inline:auto}
```

CSS Modules **también localiza los selectores de `id`**: `#inicio` se emite como
`#_inicio_1yq0o_1` y `#contacto` (declarado en
`src/components/InformacionContacto.module.scss:93-100`) como `#_contacto_dj8i3_1`.
Ningún elemento del DOM lleva esos ids, así que **las dos reglas son código muerto**:
el hero recibe el contenedor de 1220 px + 24 px de relleno lateral + `--ritmo-seccion`
arriba y abajo, y la sección de contacto nunca pasa a dos columnas.

**`src/components/CampanasPortada.module.scss`**: `@include contenedor; padding-block:
var(--ritmo-seccion-compacto); background-color: var(--color-fondo)` (sin wrapper).

**Shell** (`src/App.tsx`): `BarraUrgencias` (`position: fixed; top: 0; min-height: 32px;
padding-inline: 16px`), `Cabecera` (`position: fixed; top: 32px; min-height: 64px;
padding: 12px 24px; background-color: var(--color-fondo)` opaca, **sin contenedor
interior de 1220 px**: `display:flex; justify-content:space-between` sobre todo el
ancho de la ventana), `PieDePagina` (`.pie { background: var(--color-superficie);
border-top }` + `.interior { @include contenedor; padding-block: 48px 24px }`),
`SelectorPaleta` (`position: fixed; bottom: 16px; right: 16px`, botón **píldora con
texto** "Cambiar paleta de color", `boton-fantasma` + `--sombra-reposo`).

### 2. Valores medidos a 1280 px (captura `web_00..04.png`)

| Magnitud | Web | Prototipo | Δ |
|---|---|---|---|
| Contenido de sección (x inicial → final) | **54 → 1226 = 1172 px** (`.seccion > *` 1220 border-box − 48 de relleno) | 30 → 1250 = 1220 px | −48 px de contenido; 24 px de deriva a cada lado |
| Relleno vertical de sección | `7.2vw` = **92.16 px** | 104 px | −12 px por lado |
| Relleno vertical de Campañas | `6.2vw` = **79.36 px** | 90 px | −10.6 px por lado |
| Sangrado lateral | 24 px fijo | 28 px (18 en móvil) | −4 px (+6 en móvil) |
| Caja del hero | **1220 px centrada, con 30 px de fondo `--color-fondo` a cada lado** (`web_00.png`, foto de x = 30 a 1250) y 92 px de relleno vertical interior invisibles | ventana completa (0 → 1280), sin relleno | el hero no sangra |
| Alto del hero | `aspect-ratio 16/9` sobre 1220 = **686 px** (y = 100 → 783) con el contenido **recortado**: la franja de horario acaba en "Lunes a viernes 11:00 a 14:00 y 16:30 a" y desaparece bajo el borde | 756 px, contenido completo y centrado | contenido cortado |
| Cabecera: logo / fin de nav | x = 24 / x = 1256 | x = 58 / x = 1222 | 34 px hacia fuera a cada lado; no alinea con el contenido |
| Franja fija superior | 32 + 64 = 96 px, ambas fijas | barra en flujo (≈ 35) + cabecera pegajosa (≈ 65) | — |
| Aterrizaje de ancla (`#servicios`) | 80 (`scroll-padding-top`) + 96 (`scroll-margin`) = **176 px** desde el borde superior, o sea 80 px de hueco bajo la cabecera | 88 px, ≈ 24 px de hueco bajo la cabecera | +56 px de hueco vacío |
| Sección de contacto | dos cajas **apiladas**, cada una de 1220 px: tarjeta del formulario 30 → 1250 (`web_03.png`, y = 8 → 880) y, tras un hueco de ≈ 125 px, urgencias + mapa | rejilla de 2 columnas (formulario 593 px a la izquierda; urgencias + mapa a la derecha) en un solo contenedor | anatomía distinta |
| Fondos, de arriba abajo | fondo (hero) · **alterno** (Servicios) · **fondo** (Campañas) · **alterno** (Equipo) · **fondo** (Reservar) · **alterno** (Galería) · **fondo** (Contacto) · **alterno** (FAQ) · superficie (pie) | fondo/oscuro · fondo · alterno · fondo · alterno · fondo · alterno · fondo · superficie | **las 7 bandas de contenido van al revés** |

### 3. Defectos visibles en las capturas

1. `web_00.png`: hero recuadrado con 30 px de margen a cada lado y la banda inferior
   de horario **cortada**; el botón flotante "Cambiar paleta de color" aparece como
   una píldora grande de 200 px encima de la sección Servicios (en el prototipo es un
   círculo de 52 px con muestra de color).
2. `web_00.png`: Servicios sobre la banda azulada (`#EDF2F9`) cuando en el prototipo
   va sobre `#F8FAFC`; el cintillo "SERVICIOS" empieza en x = 54 (prototipo x = 30).
3. `web_01.png`: Campañas sobre `#F8FAFC` (prototipo `#EDF2F9`) y Equipo sobre
   `#EDF2F9` (prototipo `#F8FAFC`): la alternancia existe pero está invertida.
4. `web_02.png`: Reservar sobre fondo claro (prototipo banda `--bg-2`); la pista de la
   galería queda encajonada dentro del contenedor (prototipo: sangra hasta el borde
   de la ventana).
5. `web_03.png`: la tarjeta del formulario ocupa los 1220 px; debajo, con ≈ 125 px de
   hueco, la tarjeta de urgencias (rota: solo un filete rojo a la izquierda) y el
   mapa en blanco — la rejilla de dos columnas nunca se aplica.
6. `web_04.png`: FAQ sobre banda alterna (prototipo `--bg`) y alineada a la
   izquierda dentro de sus 860 px (prototipo centrada); pie correcto en color y borde.
7. En toda la página: la cabecera se extiende de borde a borde sin alinearse con la
   columna de contenido, y es opaca (prototipo translúcida con desenfoque).

---

## Diferencias

| id | Qué cambia | Tipo | Prioridad |
|---|---|---|---|
| global-1 | `#inicio` en `Landing.module.scss:29-37` se compila como `#_inicio_1yq0o_1` (CSS Modules localiza los ids) y nunca casa con `id="inicio"`: el hero hereda el contenedor de 1220 px + 24 px de relleno lateral + `--ritmo-seccion` vertical. Debe ser una **clase de wrapper** ("banda a sangre") aplicada desde `Landing.tsx`, y el hero debe sangrar a todo el ancho de la ventana sin relleno del wrapper. | bug | alta |
| global-2 | `#contacto` en `InformacionContacto.module.scss:93-100` se compila como `#_contacto_dj8i3_1`: la rejilla de dos columnas nunca se aplica. Además `#contacto` tiene **dos** hijos directos y el patrón `.seccion > *` (contenedor + ritmo) se aplica a cada uno: dos cajas de 1220 px apiladas y 2 × 92 px de relleno entre ellas. Debe haber **un único hijo** (rejilla `repeat(auto-fit, minmax(min(320px,100%),1fr)); gap: clamp(24px,3vw,34px); align-items:start`) definido en `Landing.module.scss`, y la regla muerta debe desaparecer. | bug | alta |
| global-3 | Alternancia de bandas invertida en las 7 secciones de contenido. Prototipo: Servicios `--bg`, Campañas `--bg-2`, Equipo `--bg`, Reservar `--bg-2`, Galería `--bg`, Contacto `--bg-2`, FAQ `--bg`. Web: justo lo contrario en las 7. Cambia la asignación de clases en `Landing.tsx` y el fondo propio de `CampanasPortada.module.scss` (`--color-fondo` → `--color-fondo-alterno`). | estructura | alta |
| global-4 | El ancho máximo se aplica a la **caja con relleno** (contenido útil 1172 px) en vez de al **contenido** (1220 px): el relleno lateral debe vivir en la banda (wrapper) y el hijo acotado a `max-width: 1220px` sin relleno propio. Sangrado lateral fijo (`espaciado(24)`) frente a fluido: adoptar un token `--sangrado-lateral` fluido de la escala del repo (`clamp(16px, 5vw, 24px)`, desviación declarada respecto al 18/28 del prototipo, que no cae en la rejilla de 8 px). | estilo | media |
| global-5 | La cabecera no tiene contenedor interior alineado con la columna de contenido (`max-width: 1220px; margin: 0 auto; padding: 12px clamp(16px,4vw,28px)` en el prototipo): el logo queda a 24 px del borde de la ventana en cualquier ancho. Pertenece a `cabecera_y_navegacion`; aquí se fija el gancho (mixin `contenedor` con el mismo token de sangrado). | estructura | media |
| global-6 | No existe una variante de wrapper para secciones cuya **cabecera** va acotada a 1220 y cuya **pista** sangra hasta el borde (Galería, `VLS:318-330`, `padding: … 0` en la sección). Hoy `.seccionAlterna > *` acota toda la galería. | estructura | media |
| global-7 | Pendiente del ritmo vertical: `7.2vw` / `6.2vw` en la web frente a `9vw` / `8vw` del prototipo. A 1280 px: 92 vs 104 y 79 vs 90. Los mínimos (72 / 56) se mantienen por @s19 (el contrato prohíbe 64 en el extremo bajo). | estilo | baja |
| global-8 | Aterrizaje de ancla: `scroll-padding-top` = 80 px (solo cabecera, sin barra) + `scroll-margin-block-start: 96px` en cada wrapper = 176 px; el destino queda 80 px por debajo de la franja fija (prototipo ≈ 24 px). `scroll-padding-top` debe sumar barra + cabecera + `espaciado(24)` y el `scroll-margin` de los wrappers desaparecer (@s28 lo exige literalmente: "altura real de la cabecera más la barra de urgencias"). | estilo | baja |
| global-9 | Selector de paleta: píldora con texto (`boton-fantasma`, 200 × 48 px) frente al botón circular de 52 px con muestra `conic-gradient` y panel de 268 px del prototipo (`VLS:477-501`). Fuera del alcance estricto de este informe (`selector_paleta`); se registra para que no se pierda. | estilo | baja |
| global-10 | Cabecera opaca (`background-color: var(--color-fondo)`) frente a translúcida `color-mix(in srgb, var(--bg) 88%, transparent)` + `backdrop-filter: blur(14px)`. Pertenece a `cabecera_y_navegacion`. | estilo | baja |
| global-11 | `a { color: inherit }` frente a `a { color: var(--primary) }` del prototipo. Deliberado (hallazgo de @s45 sobre la variante `tech`, 1,65:1): **no se adopta**; cada componente pinta sus enlaces con un rol medido. | estilo | baja |

---

## Datos reales necesarios

El lienzo global **no introduce ningún dato de negocio ni ningún texto visible**: solo
anchos, rellenos, fondos y orden de las bandas. En concreto:

| Necesidad de la anatomía | ¿Existe ya? | Fuente | Alternativa honesta si faltara |
|---|---|---|---|
| Orden de las 8 secciones y sus 7 ids | Sí | `src/pages/Landing.tsx`, Decisión 16 (`project-spec.md`), `ensamblaje_landing.feature` @s3 | — |
| Fondo de cada banda (`--bg` / `--bg-2`) | Sí (tokens `--color-fondo` / `--color-fondo-alterno` en las 5 variantes) | `src/styles/_tokens.scss` | — |
| Secuencia de alternancia del prototipo | No está escrita en ningún sitio del repo; se lee del prototipo (`VLS:143, 184, 210, 255, 318, 346, 424`) | Este informe | Escribirla como **literal a mano** en `src/pages/Landing-logica.ts` (es una decisión de maquetación, no un dato del cliente: no afirma nada sobre Galapavet) |
| Ancho máximo 1220 y anchos secundarios 900 / 860 | Sí | `_api.scss` (`$ancho-maximo-contenedor`), `Hero.module.scss` (900), `Faq.module.scss` (860) | — |
| Alturas de barra y cabecera para el ancla | Sí | `global.scss` (`--altura-barra-urgencias`, `--altura-cabecera`) | — |
| Textos de la barra, cabecera, pie | Sí, y no cambian | `src/lib/site.ts`, `src/data/navegacion.ts`, `src/data/pieDePaginaEnlaces.ts` | — |

`docs/datos-galapavet.md` no aporta nada a esta sección y no hace falta leerlo para
implementarla. **Nada del prototipo se copia como dato**: ni "Veterinaria La Sierra",
ni Miraflores, ni cifras, ni teléfonos.

---

## Conflictos con el contrato vigente

| Escenario | Tensión | Propuesta |
|---|---|---|
| `rediseno_visual.feature` **@s17** ("el ancho es 1220 píxeles… el mismo en las seis") e `identidad_visual.feature` **@s45** — los tests miden `[data-contenedor-principal]` **`.first()`** y en la portada ese primer elemento es la `<section>` del hero (`Hero.tsx:47`). | Al sangrar el hero a toda la ventana (global-1), medirá 1600 px a 1600 px y los dos tests caerán. | **Respetar el escenario y corregir el marcado**: el hero **no es un contenedor**, es una banda a sangre (en el prototipo el contenedor del hero es el `div` interior de 900 px). Quitar `data-contenedor-principal` de la `<section>` del hero (un atributo; ningún test unitario lo afirma — grep en `src/**/*.test.ts(x)`: 0 resultados). El primer contenedor pasa a ser `section.servicios`, que con la banda nueva mide exactamente 1220 px sin relleno. Coordinar con el informe del hero. |
| `rediseno_visual.feature` **@s18** (hero y FAQ declaran su propio ancho menor que el general). | Ninguna: el hero mantiene `.contenido` a `min(100% − 48px, 900px)` y el FAQ sus 860 px. | Respetar. Que el FAQ quede **centrado** (`margin-inline: auto`) es asunto del informe de FAQ, no de este. |
| `rediseno_visual.feature` **@s19** (ritmo fluido; "ninguna sección conserva 64 px en los dos extremos"; test `geometria-escalas.spec.ts` mide `#equipo > *` y espera 72 a 320 y 103.68 a 1440). | El prototipo baja a **64 px** a 320 px. El contrato lo prohíbe expresamente. | **Respetar el contrato** (mínimos 72 / 56 se quedan) y declarar la desviación (+8 px en móvil). Si se adopta global-7 (`9vw` / `8vw`), el test de navegador sigue verde (104 frente a 103.68 está dentro de la tolerancia `toBeCloseTo(…, 0)`), pero hay que **enmendar el literal** de `CampanasPortada.test.tsx:309-310`. El `padding-block` **tiene que seguir en el hijo** (`#equipo > *`), no en la banda, o el test dejará de medir el relleno. |
| `identidad_visual.feature` **@s26** (8 fondos, ≥ 2 distintos, ninguno transparente, nunca 3 seguidos iguales; test lee `#inicio`… y `#servicios + *` para Campañas). | La secuencia nueva es fondo · fondo · alterno · fondo · alterno · fondo · alterno · fondo: dos seguidas (hero/servicios) pero nunca tres. `CampanasPortada` debe seguir siendo el **hermano inmediato** de `#servicios`. | Respetar; se cumple sin enmienda. Añadir en la puerta nueva la secuencia exacta (ver plan, paso 11). |
| `rediseno_visual.feature` **@s33** (cintillos con `--color-acento-tinta` sobre fondo de token). | Intercambiar `--color-fondo` ↔ `--color-fondo-alterno` mantiene "fondo de token"; la matriz de contraste (`matrizDeContraste.ts`) ya verifica acento-tinta sobre `fondo` y sobre `fondo-alterno` en las 5 variantes. | Respetar. Actualizar solo los **comentarios** de `Servicios.test.tsx:509`, `Equipo.test.tsx:322`, `CampanasPortada.module.scss:14-19` y `CampanasPortada.test.tsx:367`, que citan la clase antigua. |
| `rediseno_visual.feature` **@s36** ("a la izquierda… formulario; a la derecha… urgencias"). | Hoy se **incumple en producción** por la regla muerta `#contacto` (global-2). | La corrección restaura el escenario; no hay enmienda. |
| `rediseno_visual.feature` **@s28** ("el sitio del ancla… se calcula desde la altura real de la cabecera **más la barra de urgencias**"). | `html { scroll-padding-top }` hoy solo suma `--altura-cabecera`; los 96 px de `scroll-margin` de los wrappers compensan a ojo. | Enmendar `global.scss` sección D: `calc(var(--altura-barra-urgencias) + var(--altura-cabecera) + #{espaciado(24)})` y retirar `scroll-margin-block-start` de los wrappers. `hoja-global.test.ts` @s14 sigue verde: exige que el valor use `var(--altura-cabecera)` y que **no** contenga un número en px escrito a mano (`#{espaciado(24)}` no lo es). |
| `identidad_visual.feature` **@s12 / @s13** (solo la hoja global declara `html`, `body`, `#root`; nueve familias exactas del reset). | Añadir `--sangrado-lateral` al `:root` de `global.scss` no toca el reset. Ningún `.module.scss` debe declarar `html`/`body`/`#root`. | Respetar. |
| `identidad_visual.feature` **@s19** (`escalaEspaciado.test.ts`: exactamente 9 pasos en `$escala-espaciado`). | Un sangrado fluido no es un paso de la escala. | Declararlo como **custom property** (`--sangrado-lateral`) compuesta con `espaciado()`, nunca como décimo paso del mapa. |
| Decisión 24 ("no copies estos valores" del prototipo). | El sangrado del prototipo (18 → 28) no cae en la rejilla de 8 px. | Derivar: `clamp(#{espaciado(16)}, 5vw, #{espaciado(24)})` (16 → 24) y escribir la desviación en el comentario. A ≥ 1268 px el contenido mide 1220 exactos igual que el prototipo. |
| `rediseno_visual.feature` **@s48** / `identidad_visual.feature` **@s49** (techo de CSS servido 8000 B, medido 7,51 kB gzip en el cierre de `rediseno_visual`). | El lienzo global es neutro (≈ +150 B de reglas nuevas, −120 B de reglas muertas), pero el programa de fidelidad completo probablemente lo supere. | Respetar en esta feature; si al cerrar la siguiente el `dist/` lo supera, **re-basar el techo** con la medición real, que es lo que el propio escenario prevé ("escrito a mano… trinquete"). Declarar la cifra una sola vez (@s48). |
| `ensamblaje_landing.feature` **@s3–@s6, @s14**. | Los 7 ids siguen en `Landing.tsx`; `#contacto` sigue sin `aria-label`; su nuevo hijo único es un `<div>` sin rol; `CampanasPortada` sigue sin wrapper ni id. | Respetar íntegramente. |
| `accesibilidad.feature` / `rediseno_visual.feature` **@s45** (axe, 30 combinaciones). | Un `<div>` de rejilla no altera el árbol accesible. | Respetar. |

---

## Tests que romperán

**Romperán con el cambio (y cómo se recuperan):**

| Test | Fichero | Por qué |
|---|---|---|
| `@s17 … a 1600px de ventana: 1220px exactos, el mismo en las seis rutas` | `tests/e2e/geometria-escalas.spec.ts` | En la portada `.first()` de `[data-contenedor-principal]` es el hero; al sangrar mide 1600. Se recupera quitando el atributo del hero (pasa a medir `section.servicios` = 1220, ahora sin relleno). |
| `@s45 … a 1600px de ventana: ancho < 1600 en las 6 rutas, y el mismo ancho en las 6` | `tests/e2e/layout.spec.ts` | Mismo motivo y misma recuperación. |
| `"--ritmo-seccion-compacto" es fluido y menor que "--ritmo-seccion"…` | `src/components/CampanasPortada.test.tsx:305-324` | **Solo si se adopta global-7**: fija los literales `clamp(72px, 7.2vw, 104px)` y `clamp(56px, 6.2vw, 90px)`. Se actualizan los dos literales del test (doble anclaje). |
| Puerta nueva `ningún ".module.scss" declara un selector de id` (paso 1 del plan) | `src/styles/modulos-sin-selector-de-id.test.ts` (nuevo) | Nace en **rojo**: `Landing.module.scss:29` (`#inicio`) e `InformacionContacto.module.scss:93` (`#contacto`). Se pone verde al retirar las dos reglas muertas. |
| Puerta nueva de secuencia de bandas (paso 2) | `src/pages/Landing-logica.test.ts` (nuevo) | Nace en rojo hasta que `Landing.tsx` consuma la secuencia del prototipo. |
| Puerta nueva `background-color: var(--color-fondo-alterno)` en `CampanasPortada.module.scss` (paso 6) | `src/components/CampanasPortada.test.tsx` (nuevo `it`) | Nace en rojo: hoy es `--color-fondo`. |

**No romperán, pero condicionan el diseño (verificado leyendo el test):**

| Test | Fichero | Condición |
|---|---|---|
| `@s19 el relleno vertical de "Equipo"… crece de 320 a 1440px` | `tests/e2e/geometria-escalas.spec.ts:196-223` | Mide `#equipo > *`: el `padding-block: var(--ritmo-seccion)` **debe seguir en el hijo**, no subir a la banda. |
| `@s26 … 8 secciones, ≥ 2 fondos, ninguna transparente, sin 3 consecutivas iguales` | `tests/e2e/tokens-aplicados.spec.ts:103-136` | Los wrappers con id deben seguir pintando un fondo no transparente; Campañas debe seguir siendo `#servicios + *`. La secuencia propuesta cumple. |
| `@s6 … primero "Escríbenos" y después "Información de contacto", sin aria-label` | `src/pages/Landing.test.tsx:104-122` | `within(#contacto)` sigue encontrando ambos dentro del `<div>` nuevo; el `<div>` no lleva `aria-label`. |
| `@s3 / @s4 / @s5` orden e ids | `src/pages/Landing.test.tsx`, `src/App.test.tsx:210-225` | Los 7 ids siguen en los wrappers; ningún componente los declara. |
| `la portada materializa hero, barra de urgencias y fotografías locales de servicios` | `tests/e2e/rediseno-visual.spec.ts:53-67` | Usa `#inicio` (el wrapper, no el atributo): h1 con peso 600 y exactamente 1 `img`; sigue verde. |
| `@s43 la imagen de fondo de la sección de bienvenida…` | `tests/e2e/fidelidad.spec.ts` | Localiza el hero como la `section` que contiene el `h1`; sigue verde. |
| `@s44 las 6 rutas a 320px: scrollWidth <= clientWidth…` | `tests/e2e/fidelidad.spec.ts`, `tests/e2e/layout.spec.ts` | El hero a sangre y la pista de la galería no deben desbordar: `.contenido` del hero ya usa `min(100% − 48px, 900px)`; la pista lleva `overflow-x: auto` (exceptuada por diseño). |
| `@s14 "html" declara "scroll-padding-top"… a partir de una variable` | `src/styles/hoja-global.test.ts:92-127` | El valor nuevo debe seguir usando `var(--altura-cabecera)` y **no** contener `Npx` literal: usar `#{espaciado(24)}`. |
| `@s12 ningún "<Nombre>.module.scss" declara reglas para "html", "body" ni "#root"` | `src/styles/hoja-global.test.ts:66` | Las clases nuevas del wrapper no tocan esos selectores. |
| `@s19 la escala de espaciado declara exactamente los 9 pasos` | `src/lib/diseno/escalaEspaciado.test.ts` | No añadir pasos al mapa; el sangrado va como custom property. |
| `@s47 los pies de las tarjetas de una misma fila quedan alineados` | `tests/e2e/layout.spec.ts` | Usa `section[data-contenedor-principal] > article`: quitar el atributo del hero no le afecta (el hero no tiene `article`). |
| `@s33 …eyebrow usa el mixin compartido` | `Servicios.test.tsx:503-518`, `Equipo.test.tsx:320-330`, `CampanasPortada.test.tsx:357-373` | Solo leen el bloque `.eyebrow`; los comentarios sobre `.seccionAlterna` quedan desfasados y se corrigen. |
| `@s49 el peso del CSS servido no supera el techo` | `tests/e2e/css-presupuesto.spec.ts` | Neutro para esta feature; vigilar la medición tras el build. |
| `@s45 axe sin violaciones (30 combinaciones)` y `accesibilidad-teclado.test.tsx` | `tests/e2e/accesibilidad.spec.ts`, `src/accesibilidad-teclado.test.tsx` | Sin cambios de roles ni de orden de foco. |

---

## Plan de cambio

Orden pensado para que cada paso deje el arnés en verde salvo el test que se acaba de
escribir (TDD). La lógica pura va a módulos `*-logica.ts` / `src/lib/diseno/*.ts`
(dentro del glob de Stryker); los `.tsx` solo cablean.

1. **Puerta anti-selector-de-id en módulos** — `src/lib/diseno/selectoresDeIdEnModulos.ts`
   (nuevo, puro): `selectoresDeIdDeclarados(textoScss): readonly string[]` reutilizando
   `extraerReglas()` de `src/lib/diseno/hojaGlobal.ts`; devuelve, sin repetir y en orden
   de aparición, todo selector que empiece por `#` (`#inicio`, `#contacto`), ignorando
   interpolaciones `#{…}`, colores `#fff` dentro de declaraciones y atributos
   `[href="#inicio"]`. Test `selectoresDeIdEnModulos.test.ts` que muerda cada rama
   (selector simple, lista separada por comas, anidado bajo `@media`, interpolación,
   hexadecimal, atributo, duplicado, texto vacío → `[]`). Puerta
   `src/styles/modulos-sin-selector-de-id.test.ts`: lee **todos** los `*.module.scss`
   con `import.meta.glob(…, { query: '?raw' })`, exige > 0 ficheros y `[]` en cada
   uno. **Rojo hoy** con los dos hallazgos.
2. **Secuencia de bandas como lógica pura** — `src/pages/Landing-logica.ts` (nuevo):
   `type Banda = 'fondo' | 'alterno'`, `type Sangrado = 'acotada' | 'sangrada' | 'a-sangre'`,
   `SECCIONES_DE_PORTADA` literal en el orden de la Decisión 16:
   `inicio/fondo/a-sangre · servicios/fondo/acotada · campanas(null)/alterno/acotada ·
   equipo/fondo/acotada · reservar/alterno/acotada · galeria/fondo/sangrada ·
   contacto/alterno/acotada · faq/fondo/acotada`; `bandaDeSeccion(id)` y
   `sangradoDeSeccion(id)` (lanzan error nombrado si el id no existe);
   `hayTresBandasSeguidas(bandas)`. Test `Landing-logica.test.ts`: literal a mano de
   la secuencia del prototipo (`VLS:143…424`), 8 entradas, los 7 ids en el orden de
   `ensamblaje_landing` @s3, exactamente 2 secciones no acotadas (`inicio`, `galeria`),
   `hayTresBandasSeguidas` falso para la real y verdadero para `['fondo','fondo','fondo']`,
   error con id desconocido.
3. **Token de sangrado y ancla en la hoja global** — `src/styles/global.scss` sección A:
   `--sangrado-lateral: clamp(#{espaciado(16)}, 5vw, #{espaciado(24)});` con el
   comentario de desviación (prototipo 18 → 28, `VLS:143`). Sección D:
   `html { scroll-padding-top: calc(var(--altura-barra-urgencias) + var(--altura-cabecera) + #{espaciado(24)}); }`.
   Test: en `src/styles/hoja-global.test.ts` un `it` nuevo — `--sangrado-lateral`
   declarado en `:root`, compuesto solo con `espaciado()` y `vw`, sin `px` literal — y
   ampliar @s14: `variablesCssUsadas(scrollPaddingTop())` contiene **las dos**
   variables de altura.
4. **Mixin `contenedor` con sangrado fluido** — `src/styles/_api.scss`: sustituir
   `padding-inline: espaciado(24)` por `padding-inline: var(--sangrado-lateral)` y
   reescribir el comentario (el 1220 sigue siendo el ancho de la caja para las 5
   subpáginas, `main[data-contenedor-principal]`, y @s17 no cambia). Test: `it` en
   `src/styles/tokens-api.test.ts` que lea el cuerpo de `@mixin contenedor` y exija
   `var(--sangrado-lateral)` y ninguna `padding-inline: espaciado(`.
5. **Wrappers nuevos** — `src/pages/Landing.module.scss`: retirar `.seccion`,
   `.seccionAlterna` y el bloque `#inicio`; escribir
   `.banda { background-color: var(--color-fondo); color: var(--color-texto) }`,
   `.bandaAlterna { … var(--color-fondo-alterno) … }`,
   `.acotada { padding-inline: var(--sangrado-lateral); > * { width: 100%; max-width: $ancho-maximo-contenedor; margin-inline: auto; padding-inline: 0; padding-block: var(--ritmo-seccion) } }`,
   `.sangrada { > * { width: 100%; padding-inline: 0; padding-block: var(--ritmo-seccion) } }` (galería:
   la cabecera se acota dentro del componente con `@include contenedor` y la pista sangra),
   `.aSangre { > * { width: 100%; padding: 0 } }` (hero), y
   `.contacto { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr)); gap: clamp(#{espaciado(24)}, 3vw, #{espaciado(32)}); align-items: start }`.
   Sin `scroll-margin-block-start` (lo hace `scroll-padding-top`). Sin selectores de id.
6. **Cableado** — `src/pages/Landing.tsx`: cada wrapper recibe
   `className={clasesDeSeccion('servicios')}` donde `clasesDeSeccion` (en el propio
   `.tsx`, solo mapeo `Banda/Sangrado → styles.*`) consume `bandaDeSeccion` y
   `sangradoDeSeccion`; `#contacto` pasa a tener **un** hijo
   `<div className={styles.contacto}>` con `FormularioContacto` e
   `InformacionContacto` dentro, sin `aria-*`. El orden de los 8 bloques y los 7 ids no
   cambian. Test existente `Landing.test.tsx` @s3–@s6 sigue verde; añadir un `it`:
   `#contacto` tiene exactamente un hijo directo y ese hijo contiene el formulario y la
   región.
7. **Regla muerta de contacto** — `src/components/InformacionContacto.module.scss:86-100`:
   borrar el bloque `#contacto { @media … }` y su comentario (la rejilla vive ahora en
   `.contacto` de `Landing.module.scss`). Lo verifica la puerta del paso 1.
8. **Fondo de Campañas** — `src/components/CampanasPortada.module.scss:14`:
   `background-color: var(--color-fondo-alterno)`; `padding-inline: var(--sangrado-lateral)`
   llega solo por el mixin; actualizar los comentarios de `:1-4` y `:17-22`. Test: `it`
   nuevo en `CampanasPortada.test.tsx` que exija `background-color: var(--color-fondo-alterno);`
   en el texto real y que `bandaDeSeccion(null)` (Campañas) sea `'alterno'` (doble anclaje
   con el paso 2).
9. **El hero deja de ser "contenedor principal"** — `src/components/Hero.tsx:47`: quitar
   `data-contenedor-principal` de la `<section>` (coordinar con el informe del hero, que
   además debe llevar `min-height: clamp(540px, 84vh, 780px)` en vez de
   `aspect-ratio: 16/9 + min-height: 560px`, y centrar `.contenido`). Ningún test
   unitario lo afirma; los E2E @s17/@s45 pasan a medir Servicios.
10. **Galería y cabecera: solo el gancho** — este informe deja preparado `.sangrada`
    (galería) y `var(--sangrado-lateral)` (cabecera). La cabecera con contenedor
    interior de 1220 px y fondo translúcido (global-5, global-10) y la pista a sangre de
    la galería (global-6) se implementan en sus propios informes usando esos ganchos.
11. **Puerta de navegador real del lienzo** — `tests/e2e/lienzo-portada.spec.ts` (nuevo),
    literales a mano y doble anclaje con `_api.scss`/`_tokens.scss`:
    (a) a 1600 px: `#inicio > *` y `#galeria > *` miden 1600 de ancho; `#servicios > *`
    mide 1220, `padding-left` 0 y `x` = 190; (b) a 1280 px: `#servicios > *` va de x = 30
    a 1250 y su `padding-top` es el de `--ritmo-seccion`; (c) los 8 fondos computados,
    en orden, equivalen a `leerTokenDeVariante(tokens, 'clinica', …)` según la secuencia
    `fondo · fondo · alterno · fondo · alterno · fondo · alterno · fondo` (comparación por
    `colorComputadoAHex`); (d) a ≥ 1024 px `#contacto` tiene un único hijo directo y
    dentro de él el `form` queda a la izquierda de la región "Información de contacto"
    con la misma `y` (± 1 px); (e) tras `page.goto('…/#servicios')`, el borde superior
    de `#servicios` queda a `32 + 64 + 24` px del borde de la ventana (± 1 px);
    (f) el recuento de secciones comprobadas es 8.
12. **Documentación** — actualizar los comentarios que citan `.seccion`/`.seccionAlterna`
    (`Servicios.test.tsx:509`, `Equipo.test.tsx:322`, `FormularioContacto.module.scss:1-6`,
    `Equipo.module.scss:1-5`, `Faq.module.scss:1-9`, `Galeria.module.scss:1-9`,
    `ReservaChat.module.scss:1-5`, `Servicios.module.scss:1-8`) y el bloque de cabecera de
    `Landing.module.scss`. Sin cambios de comportamiento.
13. **Opcional (global-7)** — `global.scss`: `--ritmo-seccion: clamp(72px, 9vw, 104px)` y
    `--ritmo-seccion-compacto: clamp(56px, 8vw, 90px)`; actualizar los dos literales de
    `CampanasPortada.test.tsx:309-310`; el E2E @s19 sigue verde (104 vs 103.68, tolerancia
    0.5). Decidir en la puerta de aprobación humana; a 1280 px acerca 12 px por lado.
14. **Cierre** — `pnpm run build` y `pnpm run test:e2e` completos; anotar en
    `progress/fidelidad/` los bytes de CSS servidos frente al techo de 8000 B (@s48).
