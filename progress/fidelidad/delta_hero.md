# Delta de fidelidad — Hero (sección de bienvenida)

Sección: `Hero` (portada, ancla `#inicio`, primera sección bajo la cabecera).
Prototipo: `docs/diseno-claude-design/Veterinaria La Sierra.dc.html`, `<section id="inicio" data-screen-label="Hero">`, líneas 118-140; tokens de `:root`, líneas 18-25; animación `vlsPulso`, línea 59.
Web: `src/components/Hero.tsx` (84 líneas), `Hero.module.scss` (171 líneas), `Hero-logica.ts` (19 líneas), `Hero.test.tsx`, `Hero-logica.test.ts`, envoltorio `src/pages/Landing.tsx:50-52` + `src/pages/Landing.module.scss:18-37`, datos `src/lib/site.ts`, `src/data/{servicios,equipo,galeria}.ts`.
Capturas comparadas a 1280 px: `scratchpad/shots/diseno_00.png` (hero en y ≈ 99-855) y `scratchpad/shots/web_00.png` (hero en y ≈ 103-783). El CSS real servido se ha leído de `dist/assets/index-CCVUwotx.css`. Los ratios de contraste de este informe se han calculado con `src/lib/contraste.ts` (`calcularRatioContraste`) y `src/lib/diseno/mezclaDeColor.ts` (`mezclar`), no a ojo.

Fecha: 03/09/2026. Autor: subagente de fidelidad (solo lectura sobre `src/`, `tests/`, `features/`).

---

## Anatomía del prototipo

Todo lo que sigue está leído del HTML (estilos inline). Los valores "a 1280" resuelven cada `clamp()` al ancho de las capturas; el alto de ventana con el que se renderizó el prototipo es 900 px (el hero mide 756 = 84vh).

### 1. La sección (`<section id="inicio">`, línea 118)

| Propiedad | Valor literal | A 1280 px |
| --- | --- | --- |
| `position` | `relative` | — |
| `min-height` | `clamp(540px, 84vh, 780px)` | 84vh de 900 = **756 px** (la sección NO tiene `aspect-ratio`; el alto lo dan `min-height` y el contenido) |
| `display` / alineación | `flex; align-items: center; justify-content: center` | el bloque de contenido queda **centrado vertical y horizontalmente** |
| `overflow` | `hidden` | — |
| `background-color` | `#0B1B33` (= `--ink` de la paleta base) | color de respaldo mientras carga la foto |
| `background-image` | `linear-gradient(180deg, rgba(6,16,32,.62) 0%, rgba(6,16,32,.46) 42%, rgba(6,16,32,.78) 100%), url(pexels 1108099, w=1800)` | velo **vertical** (180deg): más claro en el 42 % del alto (donde cae el titular), más oscuro abajo (donde cae la banda de cifras) |
| `background-size` / `-position` | `cover` / `center 42%` | la foto se ancla ligeramente por encima del centro |
| `padding` propio | ninguno | **va a sangre**: de borde a borde de la ventana, sin gutter, sin contenedor de 1220 |
| sin `@media` | — | el hero del prototipo no tiene ni un solo punto de corte CSS; todo es `clamp()` + `auto-fit` |

Colores FUERA del sistema de tokens que el prototipo usa aquí y que en la web se sustituyen por tokens (`progress/rediseno/matriz_delta.md` T-13, C-14): `#0B1B33`, los tres `rgba(6,16,32,…)`, `#4ADE80` (punto de la píldora), `#F87171` (punto del botón de urgencias), `rgba(255,255,255,…)` (píldora, botón fantasma, línea de la banda, etiquetas), y las dos `text-shadow`. Ninguno responde al conmutador `data-tema`.

### 2. El bloque de contenido (línea 119)

```
position: relative; z-index: 2;
max-width: 900px; margin: 0 auto;
padding: clamp(84px,13vw,140px) clamp(18px,6vw,32px) clamp(60px,9vw,92px);
text-align: center;
display: flex; flex-direction: column; align-items: center;
```

- A 1280: 13vw = 166,4 → **140 px arriba**; 9vw = 115,2 → **92 px abajo**; 6vw = 76,8 → **32 px a cada lado**. Ancho del bloque **900 px** (836 útiles).
- Relleno **asimétrico**: arriba casi el doble que abajo. Es el segundo contenedor "estrecho" de la portada (900) junto al FAQ (860): `rediseno_visual.feature` @s18.
- TODO centrado: la píldora, el `h1`, el párrafo, la botonera y la banda.

### 3. Píldora de localidad (líneas 120-122)

`<span>` inline-flex, hijo directo del bloque:

```
display: inline-flex; align-items: center; gap: 9px;
padding: 7px 16px; border-radius: 999px;
background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.28);
backdrop-filter: blur(6px);
color: #fff; font-size: 12.5px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase;
```

- Punto interior (línea 121): `<span>` vacío, `width: 7px; height: 7px; border-radius: 50%; background: #4ADE80`. **Sin animación** (a diferencia de los puntos de urgencias).
- Texto: "Miraflores de la Sierra · Madrid" (ficticio; en la web es `Galapagar · Madrid`, derivado de `datosNegocio.direccion`).
- En la captura: caja de **306 × 28 px**, y = 250-278, centrada en x.
- Es un "cristal" translúcido: más claro que el velo que lo rodea, con borde también translúcido.

### 4. Titular `<h1>` (línea 123)

```
font-family: 'Outfit'; font-weight: 600;
font-size: clamp(33px,6.4vw,68px); line-height: 1.05; letter-spacing: -.02em;
color: #fff; margin: 22px 0 0;
text-shadow: 0 2px 24px rgba(0,0,0,.35);
max-width: 16ch;
```

- A 1280: 6.4vw = 81,9 → **68 px**; interlineado 71,4 px; tracking −1,36 px. `max-width: 16ch` fuerza **dos líneas** ("Cuidamos la salud y la / felicidad de tu mascota"), centradas. En la captura y = 313-440, x = 300-980 (680 de ancho).
- El `text-shadow` NO se porta: `matriz_delta.md` G-06 decide resolverlo con el velo, no con una sombra de texto.

### 5. Párrafo (línea 124)

```
font-size: clamp(16px,2.2vw,19.5px); line-height: 1.65;
color: rgba(255,255,255,.9); max-width: 58ch; margin: 20px 0 0;
text-shadow: 0 1px 12px rgba(0,0,0,.35);
```

- A 1280: 2.2vw = 28,2 → **19,5 px**; interlineado 32,2 px; **58ch ≈ 756 px** (captura x = 262-1018), dos líneas, centradas. Margen superior 20.

### 6. Botonera (líneas 125-130)

Contenedor: `display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-top: 32px`.

| Botón | Estilos literales | En la captura |
| --- | --- | --- |
| Primario `<a href="#reservar">` "Reservar cita" | `inline-flex; center; min-height: 50px; padding: 15px 30px; border-radius: 999px; background: var(--primary); color: var(--on-primary); font-weight: 700; font-size: 15.5px; box-shadow: 0 12px 30px rgba(0,0,0,.28); transition: transform .3s, filter .3s`; hover `filter: brightness(1.1); transform: translateY(-2px)` | 157 × 50, x = 464-621, y = 562-612 |
| Secundario `<a href="tel:…">` "Urgencias 24 h" | `inline-flex; center; gap: 9px; min-height: 50px; padding: 15px 26px; border-radius: 999px; background: rgba(255,255,255,.12); border: 1.5px solid rgba(255,255,255,.55); backdrop-filter: blur(6px); color: #fff; font-weight: 600; font-size: 15.5px; transition: background .3s`; hover `background: rgba(255,255,255,.24)`. Punto interior 8 × 8 `#F87171` con `animation: vlsPulso 1.6s infinite` | 182 × 50, x = 634-816 |

- El secundario del prototipo es el reclamo de urgencias 24 h y NO se porta como tal (`hero.feature` cabecera, punto 3; Decisión 2). En la web es el enlace de llamada a la clínica ("Llamar 91 082 92 67"), y por eso **sin punto pulsante**: el punto significa "urgencia" y aquí no la hay.
- Lo que SÍ se porta del secundario es su forma: píldora fantasma "de cristal" (fondo translúcido + borde translúcido + blur), misma altura que el primario.

### 7. Banda de cifras (líneas 131-138)

```
display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
gap: 18px 26px; width: 100%; max-width: 720px;
margin-top: clamp(38px,6vw,58px); padding-top: 26px;
border-top: 1px solid rgba(255,255,255,.24);
```

- A 1280: 6vw = 76,8 → **58 px** de margen superior; **720 px** de ancho (captura: línea en y = 670, x = 280-1000); 4 columnas de (720 − 3 × 26) / 4 = **160,5 px**.
- Cada celda (`text-align: center`):
  - Valor (línea 134): `font-family: 'Outfit'; font-size: clamp(24px,3.4vw,32px); font-weight: 600; color: #fff; line-height: 1` → a 1280, 3.4vw = 43,5 → **32 px**. Captura y ≈ 700-730.
  - Etiqueta (línea 135): `font-size: 12.5px; color: rgba(255,255,255,.78); margin-top: 6px; letter-spacing: .02em` → minúsculas, **no** versalitas. Captura y ≈ 738-750.
- **Una sola línea separadora** en todo el hero: la de esta banda. No hay franja de horario en el prototipo.
- Datos del prototipo (líneas 713-716 del runtime): "+12 años / cuidando la sierra", "8.400 / mascotas en ficha", "24 h / urgencias los 365 días", "4,9 ★ / 327 reseñas en Google". Los cuatro son falsos o no verificables (`docs/datos-galapavet.md` §7-§8) y en la web se sustituyen por los cuatro recuentos derivados de la fuente única (@s51).

### 8. Lo que rodea al hero y le da la proporción

- El `<header>` es `position: sticky` (línea 77) y el hero empieza inmediatamente debajo, a sangre: no hay banda de color entre cabecera y foto.
- La barra de urgencias del prototipo (líneas 66-75) va ENCIMA de la cabecera y no es fija; en la web sí es fija (`BarraUrgencias.module.scss:2`) y `#root` reserva 96 px (`global.scss`, `--altura-barra-urgencias` + `--altura-cabecera`). No afecta al hero salvo en que su borde superior cae en y = 96 (web) frente a y = 99 (prototipo).

---

## Estado actual de la web

### 1. DOM que pinta `Hero.tsx` (líneas 46-83)

```
<section class="hero" data-contenedor-principal>
  <img src="/img/hero/clinica.webp" alt="Perro con su familia al aire libre" width=1600 height=900 loading="lazy" decoding="async">
  <div class="contenido">
    <p>Galapagar · Madrid</p>                      ← píldora (derivada de datosNegocio.direccion, @s30)
    <h1>Cuidamos la salud y la felicidad de tu mascota</h1>
    <p>En Galapavet cuidamos a tu mascota con medicina general, cirugía y anestesia, diagnóstico de imagen, análisis clínicos y especialidades como oftalmología o traumatología.</p>
    <div>
      <a href="#reservar">Reservar cita</a>
      <a href="tel:+34910829267">Llamar 91 082 92 67</a>
    </div>
    <dl> 3 × <div><dt>{dias}</dt><dd>{horas}</dd></div> </dl>       ← horario (hero.feature @s6)
    <ul class="cifras" aria-label="Resumen de Galapavet"> 4 × <li><strong>{valor}</strong><span>{etiqueta}</span></li> </ul>
  </div>
</section>
```

Envoltorio (`Landing.tsx:50-52`): `<div id="inicio" class="seccion"><Hero /></div>`.

### 2. CSS que llega de verdad al navegador

**a) El envoltorio.** `Landing.module.scss:29-37` declara `#inicio { … > * { width: 100%; max-width: none; padding-inline: 0 } }` con la intención de sacar el hero del contenedor. **Esa regla nunca se aplica**: CSS Modules localiza también los selectores de `id`, y en `dist/assets/index-CCVUwotx.css` sale como `#_inicio_1yq0o_1{…}`, que no casa con `<div id="inicio">`. Lo que gobierna al hero es `.seccion > *` (`Landing.module.scss:18-27`): `@include contenedor` (ancho 100 %, `max-width: 1220px`, `margin-inline: auto`, `padding-inline: 24px`) más `padding-block: var(--ritmo-seccion)` (= 92,16 px a 1280). Consecuencias medidas en la captura:

- La caja del hero mide **1220 × 686** (x = 30-1250, y = 103-783): **30 px de fondo de página a cada lado de la foto**. No va a sangre.
- Dentro de esa caja, 24 px de gutter y 92 px de relleno vertical arriba y abajo que el hero no pide, restando 184 px de alto útil.

**b) La sección** (`Hero.module.scss:1-31`): `display: grid; aspect-ratio: 16 / 9; min-height: 560px; overflow: hidden; color: var(--color-sobre-primario); isolation: isolate`. Con 1220 de ancho, `aspect-ratio` fija el alto en **686 px** y `overflow: hidden` **recorta** todo lo que no cabe. Velo `&::after` en **105deg** (diagonal): `color-mix(--color-tinta 92%) 0% → 72% 48% → 22% 100%` — pensado para texto alineado a la izquierda: el lado derecho de la foto apenas se vela. `<img>` absoluta, `inset: 0`, `object-fit: cover`, sin `object-position`, `z-index: -2`, `background-color: var(--color-fondo-alterno)`.

**c) El contenido** (`.contenido`, líneas 34-56): `flex column; align-items: flex-start` (TODO a la izquierda), `width: min(100% − 48px, 900px)`, `margin-inline: auto`, `padding-block: clamp(80px, 9vw, 144px)` (= 115 px a 1280, simétrico). El bloque empieza en x = 190 (30 + 24 + (1172 − 900) / 2) y en y = 310 (103 + 92 + 115).

**d) La píldora** (líneas 57-61): `@include eyebrow` + `border-color: currentColor; color: inherit` → texto plano en versalitas (12,8 px, peso 700, tracking .12em, `display: block`, margen inferior 4 px), **sin fondo, sin borde, sin radio, sin punto**. En la captura: "GALAPAGAR · MADRID" en y = 312, x = 190.

**e) `h1`** (líneas 63-72): 68 px / 600 / −0,02em / 1,05, `max-width: 820px`, `margin-block: 16px`, alineado a la izquierda. Dos líneas, y = 345-480. Coincide con el prototipo en tamaño, peso, tracking e interlineado (@s20-@s22 en verde); difiere en alineación y ancho máximo.

**f) Párrafo** (líneas 74-79): 19,5 px / 1,65, `max-width: 700px`, color 100 % (`inherit`), izquierda. **Tres líneas** (el texto real es más largo que el del prototipo: 190 caracteres frente a 155), y = 505-590.

**g) Botonera** (líneas 81-99): `gap: 12px; margin-block: 32px`. Primario `boton-primario` (56 px de alto, `padding-inline: 24px`, sin sombra): 150 × 56 en x = 190-340. Fantasma `boton-fantasma` (56 px, `padding-inline: 20px`, borde 1,5 px al 75 % de `--color-sobre-primario`, **fondo transparente**, sin blur): x = 352-506. Ambos y = 630-686.

**h) Franja de horario** (`dl`, líneas 101-124): `grid auto-fit minmax(132px, 1fr)`, `max-width: 700px`, **su propia línea superior** (1 px, 45 % de `--color-sobre-primario`) en y = 718, `padding-block-start: 24px`. Defectos:
- Las reglas `dl strong` y `dl span` (líneas 115-124) están **muertas**: el DOM usa `dt`/`dd`, no `strong`/`span`. Ni el rótulo va en negrita ni la hora en tinta suave.
- `dd` arrastra el `margin-inline-start: 40px` de la hoja del agente de usuario (`global.scss` solo resetea `margin-block` de `dd`, familia 3): en la captura "11:00 a 14:00 y 16:30 a" sale **sangrado 40 px** respecto a "Lunes a viernes".
- Y todo ello **cortado** por el `overflow: hidden` de la sección: se ve el `dt` (y = 754) y media línea del `dd` (y = 775-783).

**i) Banda de cifras** (`.cifras`, líneas 126-158): **no llega a verse nunca** (queda por debajo del recorte). Si se viera, pintaría 4 columnas fijas (`repeat(4, …)`) de hasta 820 px, con segunda línea separadora (45 %), valor Outfit 25 px (`paso-tipografico(2)`) en negrita 700 (la del `strong` del navegador) y etiqueta 10,24 px en versalitas con tracking .08em. A ≤ 560 px un `@media` la pasa a 2 columnas.

**j) BUG de datos, invisible hoy solo porque la banda está recortada.** `Hero.tsx:45` llama `construirCifrasBienvenida(EQUIPO, SERVICIOS, GALERIA, horario ?? [])` y la firma de `Hero-logica.ts:6-11` es `(servicios, profesionales, fotos, franjasHorarias)`. Los dos primeros argumentos van **cruzados**: la banda diría **"2 Servicios" y "5 Profesionales"**. Ningún test lo detecta: `Hero-logica.test.ts` llama a la función con el orden correcto, y su comprobación de "las cuatro fuentes pasadas" (`:107-111`) filtra la lista fija `['SERVICIOS','EQUIPO','GALERIA','horario']` contra el texto de la llamada, así que es insensible al orden; `Hero.test.tsx` @s30 (`:296`) solo cuenta 4 `listitem`.

**k) La foto.** `public/img/hero/clinica.webp` (83 076 B, 1600 × 900) es la misma fotografía que usa el prototipo (Pexels 1108099, cachorros de golden en un campo de flores; `progress/plan_imagenes.md:438`, licencia Pexels verificada en §4.1), servida en local: cumple @s13/@s14/@s43/@s46. Su `alt` ("Perro con su familia al aire libre") no describe la imagen (no hay familia) y, siendo un fondo decorativo, debería ser `alt=""`. Se declara `loading="lazy"`, que contradice la cláusula de `identidad_visual.feature` @s30 para la imagen del encabezado principal (ver Conflictos).

### 3. Resumen de lo que se ve en `web_00.png`

Foto con márgenes laterales de 30 px; todo el texto alineado a la izquierda a partir de x = 190; píldora que no es píldora; tres líneas de párrafo; dos botones a la izquierda; una línea, el horario a medias con la hora sangrada, y **el corte a y = 783**: ni banda de cifras ni parte inferior del horario. El hero mide 680 px de alto donde el prototipo mide 756 y contiene menos.

---

## Diferencias

| id | Qué cambia | Tipo | Prioridad |
| --- | --- | --- | --- |
| hero-1 | El hero no va a sangre: la regla `#inicio` de `Landing.module.scss` se hashea (`#_inicio_1yq0o_1`) y nunca aplica; el envoltorio le impone contenedor de 1220 + 24 px de gutter + `--ritmo-seccion`. Sustituir por una clase de envoltorio propia (`.seccionSangrada`) sin contenedor ni ritmo, con fondo de token (@s26). | bug | alta |
| hero-2 | `aspect-ratio: 16 / 9` + `overflow: hidden` recortan el contenido: el horario sale a medias y la banda de cifras no existe visualmente. Sustituir por `min-height: clamp(560px, 84svh, 784px)` y alto gobernado por el contenido (como el prototipo: `min-height`, sin `aspect-ratio`). | bug | alta |
| hero-3 | Alineación: en el prototipo TODO está centrado (`text-align: center; align-items: center; justify-content: center`, `h1 max-width: 16ch`, `p max-width: 58ch`, botonera `justify-content: center`); en la web todo va a la izquierda con `max-width` en píxeles. | estructura | alta |
| hero-4 | Píldora de localidad: cristal translúcido con borde, radio completo, `backdrop-filter`, punto verde de acento y texto 12,8 px/600/.1em; hoy es un eyebrow de texto plano (`@include eyebrow`) sin fondo ni punto. | estructura | alta |
| hero-5 | Banda de cifras: `max-width: 720px`, `auto-fit minmax(min(128px, 100%), 1fr)`, `gap: 16px 24px`, `margin-block-start: clamp(40px, 6vw, 56px)`, `padding-block-start: 24px`, celdas centradas, valor Outfit `paso-tipografico(3)` (31,25 px) peso 600 interlineado 1, etiqueta `paso-tipografico(-1)` (12,8 px) en minúsculas, tracking .02em, tinta al 78 %; hoy: 4 columnas fijas de 820 px, valor 25 px en 700, etiqueta 10,24 px en versalitas, y una SEGUNDA línea separadora (la del `dl`). | estilo | alta |
| hero-6 | Cifras cruzadas: `Hero.tsx:45` pasa `(EQUIPO, SERVICIOS, …)` a una firma `(servicios, profesionales, …)` → "2 Servicios / 5 Profesionales". Corregir y blindar con un parámetro con nombre y un test que lea los valores del DOM. | bug | alta |
| hero-7 | Velo: vertical (180deg) con la parada más clara al 42 % del alto y la más oscura abajo, en vez del diagonal de 105deg pensado para texto a la izquierda. Paradas propuestas 84 % → 72 % (42 %) → 92 % de `--color-tinta` (el prototipo usa .62/.46/.78 pero esas paradas suspenden el 4,5 de @s29 con la foto más clara: 2,98 · 2,68 · 3,41 · 2,76 · 2,67 al 46 %). `object-position: center 42%` en la `<img>`. | estilo | media |
| hero-8 | La sección pasa a `display: flex; align-items: center; justify-content: center` con `min-height` fluido: en ventanas altas el bloque queda centrado en la foto, como en el prototipo. | estilo | media |
| hero-9 | Relleno interior asimétrico del bloque: `padding-block: clamp(80px, 13vw, 144px) clamp(56px, 9vw, 96px)` (prototipo 84/140 arriba, 60/92 abajo, llevado a la rejilla de 8); `padding-inline` se mantiene en los 24 px del `min(100% − 48px, 900px)` actual (@s18). Deja de aplicarse el `--ritmo-seccion` del envoltorio. | estilo | media |
| hero-10 | Botones: primario con `padding-inline: espaciado(32)` y `box-shadow: var(--sombra-elevada)` (el prototipo lleva sombra propia bajo el CTA sobre foto; G-06 permite usar el token existente); fantasma con fondo de cristal, `backdrop-filter`, `padding-inline: espaciado(24)`, borde al 75 % (se mantiene: al 55 % del prototipo el borde da 2,88-3,02 contra el velo en 4 variantes, por debajo del 3:1 de SC 1.4.11) y hover con borde a `--color-sobre-primario`. Sin punto pulsante (no es urgencias). | estilo | media |
| hero-11 | Franja de horario: pasa a una fila compacta centrada (`flex-wrap`, `gap: 8px 24px`, 12,8 px, `dt` en 700, `dd` al 84 %) SIN línea propia (la única línea del hero es la de la banda de cifras, como en el prototipo), y se corrige el `margin-inline-start: 40px` del `dd` que pone el navegador; se retiran las reglas muertas `dl strong` / `dl span`. | bug | media |
| hero-12 | Ritmo vertical del bloque: `h1 margin-block: espaciado(24) 0`, párrafo `margin-block-start: espaciado(24)`, botonera `margin-block-start: espaciado(32)` sin margen inferior (prototipo 22/20/32). | estilo | baja |
| hero-13 | `<img>` del hero: `loading="eager"` + `fetchpriority="high"` (es el elemento de mayor contenido pintado; `identidad_visual.feature` @s30 lo pide literalmente y hoy se incumple) y `alt=""` (fondo decorativo; el `alt` actual no describe la foto). | bug | media |
| hero-14 | Rejilla de cifras responsiva por `auto-fit minmax(min(128px, 100%), 1fr)` en vez del `@media (max-width: 560px)` con 2 columnas fijas: a 320 px da 2 columnas igual (288 útiles ≥ 2 × 128 + 24), a 1280 da 4, y hace innecesaria esa regla. | estilo | baja |
| hero-15 | Cosas del prototipo que NO se portan, y por qué: `text-shadow` del `h1` y del párrafo (G-06: lo resuelve el velo), punto pulsante rojo del secundario (Decisión 2), `#0B1B33`/`rgba` literales (puerta `puertaLiteralesColor.ts`), ancho de línea de la banda al 24 % (se mantiene el 45 % que exige literalmente `Hero.test.tsx:221-230`), `font-size: 15.5px` de los botones (se queda el paso 0 = 16 px de los mixins), `min-height: 50px` de los botones (se queda `$altura-control-grande` = 56, ya en uso). | estilo | baja |

---

## Datos reales necesarios

| Campo de la anatomía | ¿Existe? | Dónde | Nota |
| --- | --- | --- | --- |
| Localidad · provincia de la píldora | Sí | `src/lib/site.ts` `datosNegocio.direccion.localidad` / `.region` (`Galapagar`, `Madrid`) | Ya derivada en `Hero.tsx:35` (@s30). No retipear. |
| Titular `h1` | Sí | Literal aprobado en `hero.feature` @s1 (no afirma ningún hecho del negocio) | Se conserva tal cual. |
| Párrafo descriptivo | Sí | Literal aprobado en `hero.feature` @s2, con los cinco bloques reales de `docs/datos-galapavet.md` §5 | Más largo que el del prototipo (3 líneas a 1280 en vez de 2). No se recorta ni se "vende" nada: si se quisiera acortar, solo quitando adjetivos, nunca añadiendo promesas. |
| CTA primario | Sí | `#reservar` (`hero.feature` @s3) | — |
| CTA secundario | Sí | `datosNegocio.telefonoClinica` → `enlaceLlamada` (`hero.feature` @s4/@s5) | Rótulo "Llamar 91 082 92 67". El teléfono de urgencias NO entra aquí (@s8). |
| Horario de la franja | Sí | `datosNegocio.horario` (3 tramos, `site.ts:31-35`) | `hero.feature` @s6/@s10. |
| Cuatro cifras | Sí, derivadas | `SERVICIOS.length` = 5, `EQUIPO.length` = 2, `GALERIA.length` = 6, `datosNegocio.horario.length` = 3 (`Hero-logica.ts`, @s51) | La de "Fotos de galería" cuenta **contenido de demostración** (`src/data/galeria.ts:1-13`); no afirma nada falso, pero es la más débil de las cuatro. Si el cliente aporta fotos reales, el recuento se actualiza solo. |
| Fotografía a sangre | Sí | `public/img/hero/clinica.webp` (Pexels 1108099, la misma del prototipo, licencia verificada en `progress/plan_imagenes.md` §4.1) | Servida en local (@s13/@s14/@s43/@s46). Es un exterior con mascota, elegido a propósito para no afirmar "esta es nuestra clínica" (`plan_imagenes.md:438`). |
| Cifras de reputación / antigüedad / volumen del prototipo | **NO** | `docs/datos-galapavet.md` §7 (no verificables o falsas) y §8 (4,6 ★ · 189 reseñas es un dato VIVO que no se hornea) | Alternativa honesta ya contratada: los cuatro recuentos derivados (@s30/@s51). Si el cliente quisiera "confianza", la vía es enlazar a la ficha de Google sin cifra (§8), fuera de este hero. Nunca "+12 años", "8.400", "24 h", "365", "4,9 ★". |
| Registro del centro, años de actividad | **NO** | §9 | No hay hueco para ellos en esta anatomía: no se inventa ni un "desde 2020" (§12). |

No hace falta ningún dato nuevo para implementar el prototipo con la anatomía completa: todo lo que la anatomía pide o existe en la fuente única o está contratado como derivación.

---

## Conflictos con el contrato vigente

1. **`hero.feature` @s6/@s10 (horario en la franja inferior) frente a `rediseno_visual.feature` @s30 (banda de cuatro cifras separada por una línea).** Los dos están aprobados y los dos se cumplen hoy, pero el prototipo tiene UNA banda y la web apila dos (horario + cifras), que es parte de por qué el bloque no cabe. Propuesta: **respetar ambos** — el horario se convierte en una fila compacta centrada, sin línea propia, entre la botonera y la banda; la banda de cifras conserva su línea y su anatomía. Las cláusulas `Then` de @s6/@s10 (3 `term`, textos exactos; 0 `term` con `horario: null`) no cambian. La prosa de la cabecera de `hero.feature` ("la misma franja inferior muestra el HORARIO REAL") queda desfasada en su literalidad pero no es un `Then`. **Alternativa que exige aprobación humana** (no recomendada ahora): enmendar `hero.feature` para retirar el horario del hero (ya vive en `InformacionContacto` y en el FAQ) y dejar el hero exactamente como el prototipo; rompería @s6 y @s10 y sus tests.

2. **`rediseno_visual.feature` @s29, cláusula "la sección reserva su alto antes de que la imagen decodifique".** La implementación la cerró con `aspect-ratio: 16 / 9` + `min-height: 560px`, y `Hero.test.tsx:287-294` exige literalmente `aspect-ratio`. El contrato no pide `aspect-ratio`: pide que el alto esté reservado y que nada de debajo se desplace. Con la `<img>` fuera de flujo (`position: absolute`) y un `min-height` fluido, la sección nunca depende de la imagen (CLS = 0 por construcción; lo mide además `imagenes.spec.ts` @s30 con techo 0,1). Propuesta: respetar el contrato, **cambiar el test** para exigir `min-height: clamp(…)` y `position: absolute` en `> img`.

3. **`rediseno_visual.feature` @s29 / Enmienda 2 de @s33: los ratios del velo están medidos "sobre la parada del 92 %".** `Hero.test.tsx:257-285` acota el contraste solo en esa parada (la más oscura). Con el velo vertical propuesto la parada del 92 % se conserva (abajo, bajo la banda), así que las diez cifras de @s33 siguen siendo literalmente ciertas y la excepción del cintillo sigue justificada a fortiori (si `--color-acento-tinta` suspende al 92 %, suspende al 72 %). Pero el titular y la píldora pasan a caer sobre las paradas del 72-84 %, y la puerta debe acotar la **parada más clara**. Medido con `contraste.ts` + `mezclar` al 72 %, `--color-sobre-primario` sobre foto negra / blanca: clinica **18,58 / 6,90** · calida **16,28 / 5,61** · tech **7,68 / 15,67** · eco **16,70 / 5,95** · marca **15,61 / 5,54** — aprueba el 4,5 en las cinco. Propuesta: sin enmienda del contrato; el test lee las tres paradas del texto real de la hoja y acota la mínima; el comentario de `Hero.module.scss:44-56` se actualiza con estas cifras.

4. **Píldora y botón fantasma "de cristal blanco" (prototipo: `rgba(255,255,255,.14)` y `.12`).** Un fondo de `--color-sobre-primario` al 14 % SOBRE el velo reduce el contraste del texto que va encima: medido al 72 %, foto blanca, da clinica 4,87 · calida **4,15** · tech 11,81 · eco **4,33** · marca **4,11** → suspende en tres variantes. Propuesta: el cristal se deriva de `--color-tinta` (28 % en la píldora, 24 % en el fantasma), que solo puede SUBIR el contraste (acerca el fondo a la tinta del velo) y no introduce ningún par nuevo en `matrizDeContraste.ts`. Visualmente es un cristal un punto más oscuro que el del prototipo en vez de un punto más claro; el borde translúcido al 28 % de `--color-sobre-primario` y el `backdrop-filter` mantienen la lectura de "píldora de cristal".

5. **`rediseno_visual.feature` @s17 y `identidad_visual` @s45 (un único ancho de contenedor, 1220).** `layout.spec.ts:49` y `geometria-escalas.spec.ts:151` miden `[data-contenedor-principal]` `.first()`, y en la portada ese primero es la `<section>` del hero (`Hero.tsx:47`). A sangre mediría 1600 y rompería los dos. El hero no es "el contenedor" (su contenido va a 900 por @s18): propuesta, **retirar `data-contenedor-principal` de la sección del hero**; el primero pasa a ser `Servicios` (1220 vía envoltorio). Ningún test unitario usa ese atributo en el hero (verificado con grep en `src/`).

6. **`identidad_visual.feature` @s31 (una imagen que no ha cargado reserva su hueco, con su relación de aspecto).** `imagenes.spec.ts:186-224` recorre `document.images` y exige `|ancho/alto medido − 1600/900| ≤ 0,05` para la `<img>` del hero. Hoy pasa solo porque la sección está forzada a 16/9; con alto gobernado por el contenido la caja de la `<img>` (que es la de la sección) deja de ser 16/9. Mantener la caja de la imagen a 16/9 desbordando la sección no es viable: `fidelidad.spec.ts:332-370` (@s44) marca culpable cualquier elemento cuyo borde derecho pase de la ventana salvo bajo un contenedor con `overflow-x: auto|scroll`. Propuesta: **enmendar el test** para excluir las imágenes fuera de flujo que hacen de fondo (`position: absolute|fixed` y `z-index < 0`, el MISMO criterio que ya usa `fidelidad.spec.ts:236-262` para localizar la foto del hero), afirmando que se excluye exactamente 1 y que la sección que la aloja mide alto ≥ 540 con `/img/` bloqueado (el hueco reservado). El contrato ("reserva su hueco en vez de colapsar") se respeta: una imagen fuera de flujo no puede colapsar nada.

7. **`identidad_visual.feature` @s30 (la imagen del encabezado principal, si existe, declara carga inmediata y prioridad alta).** `imagenes.spec.ts:150-179` exige `loading="lazy"` en TODAS las imágenes y su comentario (`:173-174`) dice que "Hero no declara `<img>`", lo que ya no es cierto. Hoy el hero es lazy y la cláusula se incumple sin que nada lo vea. Propuesta: `loading="eager"` + `fetchPriority="high"` en la `<img>` del hero y enmendar el test para eximir de `lazy` a las imágenes con `fetchpriority="high"` exigiendo que sean exactamente 1 en la portada y `eager`. Independiente del resto del plan; puede ir en un paso aparte.

8. **`rediseno_visual.feature` @s26 (bandeado: fondo computado del propio `#inicio`, no transparente).** La nueva clase de envoltorio debe seguir pintando `background-color: var(--color-fondo)`; `tokens-aplicados.spec.ts:103-136` lo mide.

9. **`rediseno_visual.feature` @s19 (ritmo vertical fluido en cada sección).** El hero deja de recibir `--ritmo-seccion` del envoltorio y pasa a su propio relleno fluido (`clamp(80px, 13vw, 144px)` / `clamp(56px, 9vw, 96px)`), como hace el prototipo (`padding: clamp(84px,13vw,140px) … clamp(60px,9vw,92px)`). El test de @s19 mide solo `#equipo`, así que no rompe; se declara la desviación en la hoja.

10. **`rediseno_visual.feature` @s48 / `identidad_visual` @s49 (techo de CSS: 8000 B).** El último `dist/` verde pesa 7,51 kB gzip (`progress/judge_rediseno_visual.md:54`): quedan ~490 B. Este cambio añade reglas (píldora, cristal, banda) y retira otras (regla `#inicio` muerta, `dl strong/span`, `@media` de cifras, `@include eyebrow`). Hay que medir. Si se supera, primero se recorta; si no basta, subir el techo es una decisión de contrato (el número está "escrito a mano" y su único punto de declaración es `css-presupuesto.spec.ts:21` + la regex de `:57`) que debe justificarse con la medición, no colarse.

11. **`rediseno_visual.feature` @s51 (cifras derivadas sin retipear).** Se cumple en la lógica pero el cableado está cruzado (hero-6). Propuesta: la firma de `construirCifrasBienvenida` pasa a un objeto con nombre (`{ servicios, profesionales, fotos, franjasHorarias }`) para que un cruce de argumentos sea imposible por construcción, y un test de `Hero.test.tsx` lee del DOM que el `strong` junto a "Servicios" vale `SERVICIOS.length` y el de "Profesionales" `EQUIPO.length`.

12. **`sistema_de_diseno_visual.feature` @s33 (movimiento respetuoso).** Toda `transition`/`animation` nueva en `Hero.module.scss` va dentro de `@media (prefers-reduced-motion: no-preference)` (`movimientoRespetuoso.ts:21` lee el texto real). Los mixins `boton-primario`/`boton-fantasma` ya lo hacen; el hover del fantasma con fondo debe seguir el mismo patrón.

13. **`rediseno_visual.feature` @s15 (acento solo como relleno).** El punto de la píldora usa `--color-acento` como `background-color` de un `::before` decorativo: permitido (relleno). Nunca como `color` ni `border-color`. Es decorativo (sin texto), así que no entra en la matriz de contraste; se anota.

14. **`puertaLiteralesColor.ts`.** Nada de `#hex`, `rgb()`, `hsl()` ni nombres: todos los translúcidos van con `color-mix(in srgb, var(--token) N%, transparent)`, como ya hace la hoja.

---

## Tests que romperán

### Unitarios (`src/**/*.test.ts(x)`)

| Test | Por qué |
| --- | --- |
| `Hero.test.tsx:287` — `@s29 … ".hero" fija "aspect-ratio" y un "min-height" en píxeles` | Desaparece `aspect-ratio: 16 / 9` y `min-height` pasa a `clamp(…)`, que no casa con `/min-height:\s*\d+px;/`. Reescribir: `min-height: clamp(560px, 84svh, 784px)` (regex sobre `clamp\(\s*\d+px`) y `> img { position: absolute }`. |
| `Hero.test.tsx:257` — `@s29 "--color-sobre-primario" contra el velo … al 92 %` | No rompe si se conserva la parada del 92 %, pero deja de medir lo que importa. Reescribir para leer las paradas reales del bloque `&::after` (`/var\(--color-tinta\)\s+(\d+)%/g`), exigir 3 paradas y acotar la MÍNIMA (72 %) en los dos extremos de foto (cifras en Conflictos §3). |
| `Hero-logica.test.ts:26` — `@s51 deriva cada cifra … construirCifrasBienvenida(['a','b'], ['c'], …)` y `:35`, `:52` | Rompen si la firma pasa a objeto con nombre (propuesta hero-6). Adaptar las llamadas; la lógica y las aserciones no cambian. |
| `Hero-logica.test.ts:81` — `@s51 ninguna cifra está escrita a mano en el componente` | NO rompe (el fragmento `construirCifrasBienvenida(` … `)` sigue sin dígitos y con las cuatro fuentes), siempre que el objeto literal no contenga paréntesis. Comprobar que `extraerFragmento` sigue encontrando `aria-label="Resumen de Galapavet">` … `</ul>`: la `<ul>` debe conservar ese `aria-label` y seguir siendo `<ul>`. |
| `Hero.test.tsx:221` — `@s30 … ".cifras" declara su propio "border-block-start"` | NO rompe si la declaración se mantiene carácter a carácter: `border-block-start: $ancho-borde-fino solid color-mix(in srgb, var(--color-sobre-primario) 45%, transparent);` y el bloque sigue abriéndose con `.cifras {`. |
| `Hero.test.tsx:232` — `@s18 ".contenido" fija un máximo en píxeles` | NO rompe si `width: min(100% - #{espaciado(48)}, 900px)` sigue siendo la primera `width: min(` dentro del bloque `.contenido {` (la banda usa `max-width`, no `width: min`). |
| `Hero.test.tsx:296` — `@s30 píldora, dos botones y cuatro cifras` | NO rompe: el punto de la píldora va en `::before` (sin DOM), `getByText('Galapagar · Madrid')` sigue casando; 2 enlaces; 4 `listitem`. Rompería si el punto se hiciera con un `<span>` CON texto, o si se añadiera cualquier otro `<a>`. |
| `Hero.test.tsx:172` — `@s30 … Hero.tsx no contiene "Galapagar" ni "Madrid"` | NO rompe mientras la píldora siga derivándose de `datosNegocio.direccion`. |
| `src/pages/Landing.test.tsx` @s3/@s4 | NO rompe: solo cuenta `id`s y su orden; no afirma clases. |
| `src/lib/diseno/inventarioModulos.test.ts`, `usoDelAcento.test.ts`, `rolesDescartados.test.ts`, `puertaLiteralesColor.test.ts`, `movimientoRespetuoso.test.ts` | NO rompen si se respetan Conflictos §12-§14 (sin literales de color, acento solo como relleno, transiciones dentro del `@media`). |

### E2E (`tests/e2e/*.spec.ts`, contra `dist/`)

| Test | Por qué |
| --- | --- |
| `imagenes.spec.ts:187` — `@s31 con "/img/" bloqueado, cada hueco … respeta su relación de aspecto` | **ROMPE**: la caja de la `<img>` del hero deja de ser 16/9 al dejar de forzarse la sección. Enmienda propuesta en Conflictos §6 (excluir imágenes fuera de flujo con `z-index < 0`, exigir que sea exactamente 1 y que su sección mida ≥ 540 con las imágenes bloqueadas). |
| `imagenes.spec.ts:152` — `@s30 … lazy+async salvo el encabezado, CLS <= 0.1` (× 6 rutas) | **ROMPE** solo si se aplica hero-13 (`loading="eager"`). Enmienda propuesta en Conflictos §7. Si hero-13 se pospone, no rompe. |
| `layout.spec.ts:43` — `@s45 a 1600px … el mismo ancho en las 6` y `geometria-escalas.spec.ts:143` — `@s17 … 1220px exactos` | **ROMPEN** si la sección del hero conserva `data-contenedor-principal` (mediría 1600). Se evita retirando el atributo (Conflictos §5); los tests no cambian. |
| `tokens-aplicados.spec.ts:106` — `@s26 8 secciones, … ninguna transparente` | Rompe si la nueva clase de envoltorio no pinta `background-color`. Se evita declarándolo (Conflictos §8). |
| `fidelidad.spec.ts:265` — `@s43 la imagen de fondo de la bienvenida responde 200` | NO rompe si la `<img>` sigue `position: absolute` con `z-index` negativo (es cómo la localiza). |
| `fidelidad.spec.ts:373` y `layout.spec.ts:16` — `@s44 a 320px nada sobresale` | Riesgo bajo: la píldora (~180 px), los botones (`flex-wrap`) y la banda (`auto-fit` con `min(128px, 100%)`) caben en 288 px útiles. Verificar en navegador. |
| `rediseno-visual.spec.ts:53` — `la portada materializa hero …` | NO rompe: `#inicio img` sigue siendo 1 y el `h1` sigue en 600. Añadir aquí (o en `fidelidad.spec.ts`) la aserción nueva de sangre: a 1600 px, `#inicio > section` mide `getBoundingClientRect().width === 1600` y `left === 0`. |
| `geometria-escalas.spec.ts:245/360/409` — @s20/@s21/@s22 sobre el `h1` | NO rompen: tamaño, peso, tracking e interlineado del `h1` no cambian. |
| `css-presupuesto.spec.ts:24` — `@s49 la portada: suma de bytes de hoja de estilo <= techo` | **RIESGO REAL**: 7,51 kB gzip medidos frente a 8000 B. Medir tras el cambio (Conflictos §10). |
| `accesibilidad.spec.ts` @s45 (axe, 30 combinaciones) | NO debería romper: axe no evalúa contraste sobre degradados/imágenes (lo marca "incomplete", no violación); `alt=""` en una imagen decorativa es correcto. Verificar. |
| `movimiento.spec.ts` | NO rompe si no hay animaciones nuevas y las transiciones van bajo `no-preference`. |

---

## Plan de cambio

Orden pensado para que cada paso deje la suite en verde antes del siguiente. La lógica pura va en `Hero-logica.ts`; `Hero.tsx` solo cablea; los `.scss` no llevan literales de color. Los valores de abajo son los que hay que escribir: no hace falta volver al prototipo.

### Paso 0 — Línea base

`bin\harness.ps1 test`, `pnpm run build`, anotar los bytes gzip de `dist/assets/index-*.css` (última medida: 7,51 kB) y correr `pnpm exec playwright test --workers=1` para tener la referencia. Nada se edita aún.

### Paso 1 — Bug de cifras cruzadas (hero-6) — `Hero-logica.ts`, `Hero.tsx`, `Hero-logica.test.ts`, `Hero.test.tsx`

1. TDD, rojo primero en `Hero.test.tsx` (nuevo `describe('@s51 la banda rotula cada cifra con el recuento de SU fuente, no de otra')`): renderizar `Hero`, `within(getByRole('list', { name: 'Resumen de Galapavet' }))`, y para cada etiqueta exigir que el `strong` hermano de `getByText('Servicios')` valga `String(SERVICIOS.length)`, el de `Profesionales` `String(EQUIPO.length)`, el de `Fotos de galería` `String(GALERIA.length)` y el de `Franjas horarias` `String(datosNegocio.horario.length)`. Hoy falla (dice 2 y 5).
2. `Hero-logica.ts`: cambiar la firma a un objeto con nombre — `construirCifrasBienvenida({ servicios, profesionales, fotos, franjasHorarias }: FuentesDeCifras)` — devolviendo la misma lista de cuatro `{ valor, etiqueta }`. Un cruce posicional deja de poder compilar.
3. `Hero.tsx:45`: `construirCifrasBienvenida({ servicios: SERVICIOS, profesionales: EQUIPO, fotos: GALERIA, franjasHorarias: horario ?? [] })`. Sin paréntesis dentro del objeto y sin dígitos (el test `:81` de `Hero-logica.test.ts` extrae hasta el primer `)`).
4. Adaptar las tres llamadas posicionales de `Hero-logica.test.ts` (`:27`, `:36`, `:66-71`) al objeto. Las aserciones (incluido el literal `[5, 2, 6, 3]`) no cambian.
5. `bin\harness.ps1 mutate src/components/Hero-logica.ts` → 100 %.

### Paso 2 — El envoltorio a sangre (hero-1) — `Landing.module.scss`, `Landing.tsx`, `Landing.test.tsx`, `rediseno-visual.spec.ts`

1. Test rojo (Vitest, texto real con `?raw`, en `Landing.test.tsx`): `Landing.module.scss` no contiene ningún selector `#inicio` (CSS Modules lo hashea: `#_inicio_…` en `dist/`), y declara un bloque `.seccionSangrada {` con `background-color: var(--color-fondo)` y `scroll-margin-block-start`, que NO contiene `@include contenedor` ni `--ritmo-seccion`. Anclar la razón en el comentario del test con la línea de `dist/` medida.
2. `Landing.module.scss`: borrar el bloque `#inicio { … }` (:29-37) y añadir:

```scss
// La ÚNICA sección a sangre de la portada (@s29): el envoltorio NO aplica
// el contenedor ni el ritmo — el propio Hero maqueta su interior a 900 px
// (@s18) y su relleno vertical (hero-9). Un selector "#inicio" aquí NO
// funciona: CSS Modules también localiza los id (medido en dist/:
// "#_inicio_1yq0o_1"). El fondo se pinta igualmente porque @s26 mide el color
// computado del propio <div id="inicio">.
.seccionSangrada {
  scroll-margin-block-start: espaciado(96);
  background-color: var(--color-fondo);
  color: var(--color-texto);
}
```

3. `Landing.tsx:50`: `<div id="inicio" className={styles.seccionSangrada}>`.
4. `Hero.tsx:47`: retirar `data-contenedor-principal` de la `<section>` (Conflictos §5).
5. E2E nuevo en `rediseno-visual.spec.ts` (dentro del test de la portada, viewport 1600): `#inicio > section` → `getBoundingClientRect()` con `left === 0` y `width === 1600`; y `[data-contenedor-principal]` `.first()` sigue midiendo 1220 (ya lo afirman @s17/@s45).

### Paso 3 — La sección: alto, centrado, velo, foto (hero-2, hero-7, hero-8) — `Hero.module.scss`, `Hero.test.tsx`

1. Tests rojos (texto real de la hoja, mismo `extraerBloqueCss` que ya existe):
   - `@s29 reserva su alto`: el bloque `.hero {` contiene `min-height: clamp(560px, 84svh, 784px);` (regex `/min-height:\s*clamp\(\s*\d+px,\s*\d+s?vh,\s*\d+px\s*\);/`), NO contiene `aspect-ratio`, y el bloque `> img {` contiene `position: absolute;` (fuera de flujo: el alto nunca depende de la imagen).
   - `@s29 contraste`: leer todas las paradas de `&::after {` con `/var\(--color-tinta\)\s+(\d+)%,\s*transparent\)\s+(\d+)%/g`, exigir exactamente 3, que la del 100 % sea la mayor (la banda va sobre la más oscura), y acotar la MÍNIMA (0.72) contra `mezclar(NEGRO|BLANCO, tinta, minima)` ≥ 4.5 en las cinco variantes. Documentar en el test las diez cifras de Conflictos §3.
2. Hoja:

```scss
.hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  // Prototipo: clamp(540px, 84vh, 780px) (VLS:118). 540/780 no caen en la
  // rejilla de 8: se declaran 560/784 (desviación declarada, Decisión 24).
  // "svh" y no "vh" por el mismo motivo que "100svh" en global.scss.
  min-height: clamp(560px, 84svh, 784px);
  overflow: hidden;
  color: var(--color-sobre-primario);
  isolation: isolate;

  // Velo VERTICAL como el del prototipo (180deg, VLS:118: .62 → .46 al 42 % →
  // .78): la parada más clara cae donde va el titular y la más oscura bajo la
  // banda. Las paradas del prototipo suspenden el 4,5 de @s29 con la foto más
  // clara (al 46 %: 2,98 · 2,68 · 3,41 · 2,76 · 2,67); estas aprueban en la
  // parada MÍNIMA (72 %): 18,58/6,90 · 16,28/5,61 · 7,68/15,67 · 16,70/5,95 ·
  // 15,61/5,54 (clinica · calida · tech · eco · marca, foto negra/blanca).
  &::after {
    position: absolute;
    z-index: -1;
    inset: 0;
    content: '';
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--color-tinta) 84%, transparent) 0%,
      color-mix(in srgb, var(--color-tinta) 72%, transparent) 42%,
      color-mix(in srgb, var(--color-tinta) 92%, transparent) 100%
    );
  }

  > img {
    position: absolute;
    z-index: -2;
    inset: 0;
    width: 100%;
    height: 100%;
    background-color: var(--color-fondo-alterno);
    object-fit: cover;
    object-position: center 42%; // VLS:118 "background-position: center 42%"
  }
}
```

3. Actualizar el bloque de comentario de la Enmienda 2 (`Hero.module.scss:44-56`): la píldora ya no cae sobre el 92 % sino sobre 84→72 %; las cifras del 92 % siguen siendo ciertas para la banda; añadir las del 72 %.

### Paso 4 — El bloque centrado y su ritmo (hero-3, hero-9, hero-12) — `Hero.module.scss`, `Hero.test.tsx`

1. Test rojo (texto real): el bloque `.contenido {` declara `text-align: center;` y `align-items: center;`, `padding-block` con DOS `clamp(` (asimétrico), y `h1` con `max-width: 16ch;` y `> p:nth-of-type(2)` con `max-width: 58ch;`. Mantener @s18 intacto.
2. Hoja:

```scss
.contenido {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: min(100% - #{espaciado(48)}, 900px); // @s18: primera "width: min(" del bloque
  margin-inline: auto;
  // Prototipo: clamp(84px,13vw,140px) arriba / clamp(60px,9vw,92px) abajo
  // (VLS:119), llevado a la rejilla de 8. El envoltorio ya no aporta ritmo.
  padding-block: clamp(80px, 13vw, 144px) clamp(56px, 9vw, 96px);

  h1 {
    max-width: 16ch;           // VLS:123 — fuerza las dos líneas del diseño
    margin-block: espaciado(24) 0; // prototipo 22 → 24
    color: inherit;
    font-family: var(--fuente-titulares);
    font-size: paso-tipografico(5);
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.05;
  }

  > p:nth-of-type(2) {
    max-width: 58ch;           // VLS:124
    margin-block-start: espaciado(24); // prototipo 20 → 24
    color: inherit;            // prototipo .9: se queda al 100 % para no abrir un par nuevo en la matriz
    font-size: clamp(16px, 2.2vw, 19.5px);
    line-height: 1.65;
  }
}
```

### Paso 5 — La píldora (hero-4) — `Hero.module.scss`, `Hero.test.tsx`

1. Test rojo (texto real, bloque `> p:first-child {`): contiene `border-radius: $radio-completo;`, `display: inline-flex;`, `text-transform: uppercase;`, `letter-spacing:`, `color: inherit;` (Enmienda 2), `backdrop-filter:`, NO contiene `@include eyebrow` ni `#`, y su `&::before {` declara `background-color: var(--color-acento);` (relleno, @s15) y `border-radius: $radio-circulo;`. @s30 (`getByText('Galapagar · Madrid')`) sigue en verde porque el punto no añade DOM.
2. Hoja (sustituye a `:57-61`):

```scss
  // Píldora de localidad (VLS:120-122): cristal translúcido con borde, punto
  // de acento y versalitas. La tinta es --color-sobre-primario (Enmienda 2 de
  // @s33: acento tinta suspende sobre el velo en las cinco variantes). El
  // cristal se deriva de --color-tinta y NO de --color-sobre-primario como en
  // el prototipo (rgba(255,255,255,.14)): un cristal claro baja el contraste
  // del texto (medido al 72 %, foto blanca: 4,87 · 4,15 · 11,81 · 4,33 · 4,11,
  // suspende en calida/eco/marca); uno de tinta solo puede subirlo.
  > p:first-child {
    display: inline-flex;
    align-items: center;
    gap: espaciado(8);
    margin: 0;
    padding: espaciado(8) espaciado(16);          // prototipo 7/16
    border: $ancho-borde-fino solid color-mix(in srgb, var(--color-sobre-primario) 28%, transparent);
    border-radius: $radio-completo;
    background-color: color-mix(in srgb, var(--color-tinta) 28%, transparent);
    backdrop-filter: blur(8px);                   // prototipo 6 → 8
    color: inherit;
    font-size: paso-tipografico(-1);              // 12,8 ≈ 12,5
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;

    &::before {
      content: '';
      width: espaciado(8);                        // prototipo 7 → 8
      height: espaciado(8);
      border-radius: $radio-circulo;
      background-color: var(--color-acento);      // solo relleno (@s15); decorativo
    }
  }
```

### Paso 6 — La botonera (hero-10) — `Hero.module.scss`, `Hero.test.tsx`

1. Test rojo (texto real, bloque `> div {`): `justify-content: center;`, `margin-block-start: espaciado(32);` sin `margin-block:`; `a:first-child` contiene `box-shadow: var(--sombra-elevada);`; `a:not(:first-child)` contiene `backdrop-filter:` y `background-color: color-mix(in srgb, var(--color-tinta)`; cualquier `transition` del bloque va dentro de `prefers-reduced-motion: no-preference` (lo vigila además `movimientoRespetuoso`).
2. Hoja:

```scss
  > div {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: espaciado(12);
    margin-block-start: espaciado(32);

    a:first-child {
      @include boton-primario;
      min-height: $altura-control-grande;
      padding-inline: espaciado(32);              // prototipo 30
      box-shadow: var(--sombra-elevada);          // VLS:126 lleva sombra propia; G-06: token existente
    }

    a:not(:first-child) {
      @include boton-fantasma;
      min-height: $altura-control-grande;
      padding-inline: espaciado(24);              // prototipo 26
      // 75 % y no el 55 % del prototipo: al 55 % el borde da 2,88-3,02 contra
      // el velo (72 %, foto blanca) en calida/eco/marca, bajo el 3:1 de SC 1.4.11.
      border-color: color-mix(in srgb, var(--color-sobre-primario) 75%, transparent);
      background-color: color-mix(in srgb, var(--color-tinta) 24%, transparent);
      backdrop-filter: blur(8px);
      color: inherit;

      &:hover {
        border-color: var(--color-sobre-primario);
        background-color: color-mix(in srgb, var(--color-tinta) 40%, transparent);
      }
    }
  }
```

### Paso 7 — La fila de horario (hero-11) — `Hero.module.scss`, `Hero.test.tsx`

1. Test rojo (texto real, bloque `dl {`): NO contiene `border-block-start`, NO contiene `strong {` ni `span {` (reglas muertas), contiene `dd {` con `margin-inline-start: 0;` y `dt {` con `font-weight: 700;`. @s6/@s10 siguen igual.
2. Hoja (sustituye a `:101-124`):

```scss
  // Horario real (hero.feature @s6). El prototipo no lo tiene: aquí va como
  // fila compacta centrada, SIN línea propia — la única línea del hero es la
  // de la banda de cifras (@s30), como en el diseño.
  dl {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: espaciado(8) espaciado(24);
    margin-block-start: espaciado(24);
    font-size: paso-tipografico(-1);

    div {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    dt {
      font-weight: 700;
    }

    dd {
      margin-inline-start: 0;   // el UA pone 40px; global.scss solo resetea margin-block
      color: color-mix(in srgb, var(--color-sobre-primario) 84%, transparent);
    }
  }
```

### Paso 8 — La banda de cifras (hero-5, hero-14) — `Hero.module.scss`, `Hero.test.tsx`

1. Test rojo (texto real, bloque `.cifras {`): `max-width: 720px;`, `grid-template-columns: repeat(auto-fit, minmax(min(128px, 100%), 1fr));`, `strong` con `font-weight: 600;` y `font-size: paso-tipografico(3);`, `span` SIN `text-transform: uppercase`, y la hoja completa SIN `@media` que toque `.cifras`. La aserción existente de `border-block-start` (@s30) se conserva sin tocar.
2. Hoja (sustituye a `:126-158` y al `.contenido .cifras` del `@media`):

```scss
  // Banda de cuatro cifras (VLS:131-138, @s30/@s51): 720 de ancho, cuatro
  // celdas centradas, valor grande en 600 y etiqueta en minúsculas.
  .cifras {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(128px, 100%), 1fr)); // prototipo 130, con el min(…,100%) de H23
    gap: espaciado(16) espaciado(24);            // prototipo 18/26
    width: 100%;
    max-width: 720px;
    margin: clamp(40px, 6vw, 56px) 0 0;          // prototipo clamp(38px,6vw,58px)
    padding-inline-start: 0;
    list-style: none;
    // @s30: "debajo hay una banda separada por una línea" — declaración
    // literal exigida por Hero.test.tsx (45 %; el prototipo usa .24).
    border-block-start: $ancho-borde-fino solid color-mix(in srgb, var(--color-sobre-primario) 45%, transparent);
    padding-block-start: espaciado(24);          // prototipo 26

    li {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    strong {
      font-family: var(--fuente-titulares);
      font-size: paso-tipografico(3);            // 31,25 ≈ 32 del prototipo (clamp(24px,3.4vw,32px))
      font-weight: 600;
      line-height: 1;
    }

    span {
      margin-block-start: espaciado(8);          // prototipo 6
      font-size: paso-tipografico(-1);           // 12,8 ≈ 12,5
      letter-spacing: 0.02em;
      color: color-mix(in srgb, var(--color-sobre-primario) 78%, transparent); // VLS:135
    }
  }
}

@media (max-width: 560px) {
  .contenido {
    width: min(100% - #{espaciado(32)}, 900px);
  }
}
```

### Paso 9 — Enmienda de `imagenes.spec.ts` @s31 (Conflictos §6) — `tests/e2e/imagenes.spec.ts`

Dentro del `page.evaluate` de `:195-213`, saltar las imágenes cuyo `getComputedStyle` dé `position: absolute|fixed` y `Number(zIndex) < 0`, contándolas en `fondosFueraDeFlujo`; fuera del `evaluate`, `expect(fondosFueraDeFlujo).toBe(1)` (anti-vacuidad: la del hero, y solo esa) y, con `/img/` bloqueado, `expect(alto de '#inicio > section').toBeGreaterThanOrEqual(540)` (el hueco reservado por `min-height`). Comentar que es el mismo criterio que `fidelidad.spec.ts:236-262`.

### Paso 10 (opcional, media; independiente) — La imagen del encabezado (hero-13) — `Hero.tsx`, `tests/e2e/imagenes.spec.ts`

1. `Hero.tsx:48-55`: `loading="eager"`, `fetchPriority="high"` (React 19 lo serializa como `fetchpriority`), `alt=""`. Mantener `width`/`height`/`decoding="async"`.
2. `imagenes.spec.ts:152-179`: eximir de `loading === 'lazy'` a las imágenes con `fetchpriority="high"`, exigir que en la portada haya exactamente 1 y que sea `eager`; en las otras 5 rutas, 0. Corregir el comentario `:173-174`.
3. `Hero.test.tsx` @s13 sigue en verde (no hay `src` remoto). `rediseno-visual.spec.ts` (`imagenesRotas`) y `fidelidad.spec.ts` @s43 siguen en verde.

### Paso 11 — Cierre

1. `bin\harness.ps1 test`, lint, typecheck, `pnpm run build`.
2. Medir bytes gzip de la hoja frente a 8000 B (`css-presupuesto.spec.ts`). Si se supera: recortar antes de tocar el techo (candidatos: `backdrop-filter` × 2, el hover del fantasma); si aun así no cabe, proponer la subida del techo como decisión explícita con la medición (único punto: `css-presupuesto.spec.ts:21` + regex `:57`).
3. `pnpm exec playwright test --workers=1 --reporter=list` completa: @s17/@s45 (contenedor), @s26 (fondo de `#inicio`), @s30/@s31 (imágenes), @s43, @s44 a 320, @s45 axe × 30, la aserción nueva de sangre, `css-presupuesto`.
4. `bin\harness.ps1 mutate src/components/Hero-logica.ts` → 100 %.
5. Captura a 1280 y comparación con `diseno_00.png`: píldora centrada en y ≈ 250, `h1` en dos líneas, dos botones centrados, UNA línea, cuatro cifras visibles con "5 Servicios · 2 Profesionales · 6 Fotos de galería · 3 Franjas horarias", foto de borde a borde, sin recorte.
6. `progress/tdd_hero_fidelidad.md` con la medición y las diez cifras de contraste del paso 3; enlazar desde `progress/current.md`.
