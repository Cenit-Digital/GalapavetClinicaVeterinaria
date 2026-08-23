# Estudio de la arquitectura visual del prototipo de referencia

> **Para el implementador de la feature 22.** Este documento destila SOLO la
> arquitectura visual de los 4 ficheros `.dc.html` del prototipo
> "Veterinaria La Sierra". **Su contenido (servicios, profesionales,
> teléfonos, urgencias 24 h, valoraciones, registro sanitario) está PROHIBIDO
> y no aparece aquí más que como ejemplo de lo que NO se copia.** La única
> fuente de verdad del contenido es `docs/datos-galapavet.md` y `src/data/`.
> Los colores tampoco salen del prototipo (Decisión 8): todo rol nuevo se
> deriva de `#77286B` / `#B4C718` / `#48704B` (`src/lib/tokens.ts:8-12`) y se
> verifica con la fórmula de `src/lib/contraste.ts`.

## 0. Método y trazabilidad

- Ficheros leídos (en el directorio temporal `…/scratchpad/diseno/`):
  `Veterinaria La Sierra.dc.html` (829 líneas), `Blog.dc.html` (383),
  `Campanas.dc.html` (339), `Tienda.dc.html` (308), `github.md` (25).
  Las citas sin prefijo de fichero son de `Veterinaria La Sierra.dc.html`.
- El prototipo es HTML con estilos **en línea** (atributo `style=`) más un
  único bloque `<style>` por página con los tokens y el reset; la parte
  dinámica (responsive, estados abierto/cerrado) vive en objetos de estilo JS
  dentro de `renderVals()`. Por eso las citas apuntan tanto a marcado como a JS.
- Todos los ratios de contraste de este informe están **calculados**, no
  estimados, con la fórmula oficial de luminancia relativa de WCAG 2.2
  (<https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum>), que es
  literalmente la implementada en `src/lib/contraste.ts:1-75`.
- Lo que no he podido verificar aparece marcado **NO VERIFICADO**.

---

## 1. Sistema de roles de color

### 1.1 Los 18 roles del prototipo, su semántica y su matriz de uso

Declaración completa: `:18-25` (tema por defecto `clinica`), con tres
variantes más en `:26-33` (`calida`), `:34-41` (`tech`) y `:42-49` (`eco`).
El conmutador es `document.documentElement.setAttribute('data-tema', id)`
(`:640`), persistido en `localStorage` con `try/catch` (`:641`, `:626`) —
**exactamente el mismo mecanismo que Galapavet ya tiene** con `data-variante`
(`index.html:17-31`).

| Rol | Qué representa | Dónde se usa (cita) | Se pinta SOBRE | Qué lleva ENCIMA |
|---|---|---|---|---|
| `--bg` | Lienzo de página; también fondo de las secciones "impares" | `body` `:52`; secciones `#servicios` `:142`, `#equipo` `:209`, `#galeria` `:317`, `#faq` `:424`; columna de mensajes del chat `:282` | — | `--text`, `--ink`, `--muted` |
| `--bg-2` | Fondo de sección **alterna**, para bandear verticalmente la página | `#campanas` `:183`, `#reservar` `:254`, `#contacto` `:345`; hero de listado `Campanas:71`; caja de garantías `Tienda:110`; caja CTA de artículo `Blog:157`; caja de letra pequeña `Campanas:146`; *placeholder* de imágenes `:151`, `:194`, `:333` | `--bg` | `--ink`, `--muted`, `--text` |
| `--card` | Superficie de tarjeta / panel elevado | `article` de servicio `:150`, ficha de equipo `:219`, tarjeta de campaña `:193`, panel del chat `:273`, `figure` de galería `:332`, caja de formulario `:354`, caja de mapa `:407`, `footer` `:444`, panel del selector `:480`, ficha de producto `Tienda:86`, tarjeta de artículo `Blog:109` | `--bg` / `--bg-2` | `--ink`, `--text`, `--muted` |
| `--surface` | Superficie **secundaria dentro** de una tarjeta: cabecera y pie del chat, campos de formulario, botones circulares del carrito | `:274`, `:288`, `:368`, `:371`, `:375`, `:378`, `:387`, `Tienda:124`, `:139`, `:141`, `:147` | `--card` | `--ink` |
| `--border` | Línea de 1 px: perímetro de tarjeta, separadores internos, borde de campo, borde de botón fantasma | 27 usos `1px solid var(--border)` y 8 `1.5px solid var(--border)` | `--card`, `--bg`, `--surface` | — |
| `--ink` | Tinta **máxima**: titulares, nombres, precios, valores de `<dd>` | `h1`-`h3` de sección `:145`, `:156`, `:213`; precios `Tienda:98`, `Campanas:153` | `--bg`, `--card`, `--surface` | — |
| `--text` | Texto de **cuerpo** | `body` `:52`, párrafos de detalle `:161`, `:234`, ítems de lista `:164`, cuerpo de artículo `Blog:323` | `--bg`, `--card` | — |
| `--muted` | Texto **secundario**: entradillas de sección, descripciones de tarjeta, metadatos, pies de foto, enlaces del pie | `:146`, `:157`, `:188`, `:227`, `:338`, `:454`, `:461`, `Blog:96`, `Tienda:96` | `--bg`, `--bg-2`, `--card` | — |
| `--primary` | Color de **acción**: fondo del botón primario, cuadro del logotipo, burbuja propia del chat, énfasis `<em>` en titular, avatar de autor, número de paso | `:80`, `:126`, `:145`, `:189`, `:275`, `:300`, `:393`, `Campanas:135`, `Blog:98` | `--bg`, `--card` | `--on-primary` |
| `--primary-strong` | Variante oscura del primario, teóricamente para hover | `:21`, `:29`, `:37`, `:45` | — | — |
| `--on-primary` | Texto/icono **sobre** `--primary` | `:81-82`, `:126`, `:189`, `:275`, `:300`, `:393` | `--primary` | — |
| `--accent` | Acento **decorativo puro** (nunca texto) | solo 3 usos: punto "en línea" `:278`, borde izquierdo de cita `Blog:321`, sector del gradiente cónico `:498` | `--card` | — |
| `--accent-ink` | Tinta del acento: **es el rol que lleva todo el texto de acento**. Rótulos *eyebrow*, categorías, checks, rótulo del desplegable, enlaces en hover | `:144`, `:153`, `:165`, `:172`, `:186`, `:197`, `:212`, `:412`, `Tienda:94`, `Blog:114`, y el `a:hover` global `:56` | `--card`, `--bg`, `--bg-2`, `--accent-soft` | — |
| `--accent-soft` | Fondo suave del acento: píldoras, círculos de check, fondo del botón `+`, hover de la navegación | `:92`, `:110`, `:165`, `:197`, `:244`, `:267`, `:357`, `:435`, `:726`, `:745`, `:819` | `--card`, `--bg` | `--accent-ink` |
| `--urg` | Rojo de **urgencias 24 h** | barra superior `:67`, CTA de cabecera `:94`, botón del menú móvil `:113`, tarjeta de urgencias `:399` | `--bg`, `--card` | `#fff` literal |
| `--urg-soft` | Fondo suave de urgencias | **declarado en `:23`, `:31`, `:39`, `:47` y usado 0 veces** | — | — |
| `--shadow` | Sombra **elevada** (hover de tarjeta, panel flotante, imagen de artículo) | `:150` (hover), `:273`, `:480`, `:497`, `Blog:149`, `Campanas:150` | — | — |
| `--shadow-sm` | Sombra **de reposo** de tarjeta | `:150`, `:193`, `:219`, `:332`, `:354`, `:407`, `Tienda:86`, `Blog:109` | — | — |

Valores de sombra (`:24`): `--shadow: 0 18px 45px rgba(15,32,60,.10)` y
`--shadow-sm: 0 6px 18px rgba(15,32,60,.07)`. Es decir: **una sola sombra
teñida con el color de la tinta**, no gris neutro, con dos escalones (reposo /
elevado). En el tema oscuro se refuerza a `.45` / `.35` (`:40`).

### 1.2 Roles ESTRICTAMENTE NECESARIOS para Galapavet

Con las secciones que Galapavet ya tiene, el mínimo real es de **13 roles de
color + 2 de sombra**. Nombres semánticos propuestos, coherentes con
`--color-fondo`/`--color-texto`/`--color-foco`, que ya existen
(`src/styles/_tokens.scss:39-64`):

| Rol propuesto | Equivalente | Por qué es necesario |
|---|---|---|
| `--color-fondo` *(ya existe)* | `--bg` | lienzo |
| `--color-fondo-alterno` | `--bg-2` | sin él, 8 secciones seguidas con el mismo fondo: la página "no tiene ritmo" (es el síntoma actual) |
| `--color-superficie` | `--card` | tarjetas de servicios, equipo, campañas, galería, blog, tienda |
| `--color-superficie-elevada` | `--surface` | cabecera/pie del chat, campos de formulario, botones ± de la cesta |
| `--color-borde` | `--border` | perímetro de tarjeta y separadores (decorativo) |
| `--color-borde-control` | *(el prototipo NO lo tiene: su `--border` está a 1.30:1)* | SC 1.4.11: el borde de un campo o de un botón fantasma **es** lo que identifica el control |
| `--color-tinta` | `--ink` | titulares y precios; hoy todo el texto usa el mismo `--color-texto` y no hay jerarquía |
| `--color-texto` *(ya existe)* | `--text` | cuerpo |
| `--color-texto-suave` | `--muted` | entradillas, metadatos, pies de foto |
| `--color-primario` | `--primary` | acción |
| `--color-sobre-primario` | `--on-primary` | texto sobre acción |
| `--color-acento-tinta` | `--accent-ink` | *eyebrows*, categorías, checks: **es el rol de acento que de verdad se usa** |
| `--color-acento-suave` | `--accent-soft` | píldoras y círculos de check |
| `--color-foco` *(ya existe)* | *(el prototipo NO lo tiene)* | SC 2.4.7 |
| `--sombra-reposo` / `--sombra-elevada` | `--shadow-sm` / `--shadow` | los `rgba()` NO pueden vivir en un `.module.scss` (§9.1) |

### 1.3 Roles que SOBRAN para Galapavet — descártalos

1. **`--urg` y `--urg-soft`.** Son el color de "Urgencias 24 h". **Galapavet
   no presta urgencias 24 h.** Todo lo que los usa (barra superior `:66-75`,
   CTA rojo de cabecera `:94-96`, botón rojo del menú móvil `:113`, tarjeta
   roja de contacto `:399-405`) **no se porta**. Galapavet sí tiene un teléfono
   de urgencias fuera de horario (`InformacionContacto.tsx`,
   `datosNegocio.telefonoUrgencias`), pero eso es un enlace más, no una marca
   de servicio 24 h, y no justifica un rol de color propio ni un punto que late.
2. **`--primary-strong`.** Declarado 4 veces y **usado 0 veces**: todos los
   hovers usan `filter:brightness(1.1)` (`:126`, `:189`, `:393`,
   `Tienda:152`…). Ojo: `brightness(1.1)` sobre el morado de Galapavet lo
   **aclara**, y el contraste del blanco encima **baja**. Si quieres un hover
   más oscuro (recomendado), hazlo con un token real
   `--color-primario-fuerte`, no con un filtro. Verificado: blanco sobre morado
   10 % oscurecido (`#6B2460`) = **10.26:1**, mejor que el 9.13:1 base.
3. **`--accent` "a secas"** es casi descartable: 3 usos, todos decorativos. Con
   el lima de Galapavet (**1.89:1** sobre blanco) jamás puede llevar texto.
   Consérvalo solo si quieres el punto/borde decorativo; el rol que hace el
   trabajo es `--color-acento-tinta`.
4. Las **4 paletas del prototipo** (`clinica`/`calida`/`tech`/`eco`, `:601-606`)
   no se portan: Galapavet ya tiene las suyas (`marca`/`lima`/`verde`/`noche`,
   `src/data/variantesPaleta.ts` y `_tokens.scss:39-64`), que son de marca.

### 1.4 Punto de partida VERIFICADO para las variantes de Galapavet

Todos los valores derivan por mezcla en sRGB de los 3 colores de marca con
blanco/negro. **Todos los ratios están calculados con la fórmula de
`src/lib/contraste.ts`.** El implementador debe re-verificarlos con un test que
lea el texto real de `_tokens.scss` (patrón ya establecido en
`src/lib/diseno/tokensColor.ts:50-58`), no fiarse de esta tabla.

**Variante `marca` (fondo blanco):**

| Rol | Valor propuesto | Derivación | Verificación |
|---|---|---|---|
| `--color-fondo` | `#FFFFFF` | ya fijado | — |
| `--color-fondo-alterno` | `#F4EEF3` | blanco + 8 % morado | morado encima = **7.99** ✓ |
| `--color-superficie` | `#FFFFFF` | — | tinta encima = 12.84 ✓ |
| `--color-superficie-elevada` | `#FAF6F9` | blanco + 4 % morado | morado encima = **8.53** ✓ |
| `--color-tinta` | `#531C4B` | morado + 30 % negro | sobre blanco **12.84**, sobre `#F4EEF3` **11.23** ✓ |
| `--color-texto` | `#77286B` | morado de marca (ya fijado) | sobre blanco **9.13**, sobre `#F4EEF3` **7.99** ✓ |
| `--color-texto-suave` | `#925389` | morado + 20 % blanco | sobre blanco **5.50**, sobre `#F4EEF3` ≈5.0 ✓ (≥4.5) |
| `--color-primario` | `#77286B` | morado de marca | blanco encima **9.13** ✓ |
| `--color-sobre-primario` | `#FFFFFF` | — | ✓ |
| `--color-acento-tinta` | `#48704B` | **verde profundo de marca, ya verificado** (`tokens.ts:11`) | sobre blanco **5.68**, sobre `#F6F8E3` **5.27**, sobre `#F4EEF3` **4.97** ✓ |
| `--color-acento-suave` | `#F6F8E3` | blanco + 12 % lima | verde encima **5.27** ✓ |
| `--color-borde-control` | `#A06997` | blanco + 70 % morado | sobre blanco **4.23**, sobre `#F4EEF3` **3.70** ✓ (≥3, SC 1.4.11) |
| `--color-borde` | `#DDC9DA` | blanco + 25 % morado | decorativo (1.56): **solo** donde el borde no identifica un control |
| `--color-foco` | `#77286B` | ya fijado | ≥7.99 sobre todas las superficies claras ✓ |

**Aviso para la variante `noche` (`--color-fondo: #000000`):** todo rol nuevo
debe redefinirse ahí, y el morado **no sirve** (2.30:1 sobre negro, ya
documentado en `_tokens.scss:62`). Valores verificados que sí funcionan:
superficie `#1A1A1A` (blanco encima 17.40, lima encima 9.22), acento-suave
`#1B1E04` = negro + 15 % lima (lima encima 9.01), acento-tinta = lima
`#B4C718` (11.12 sobre negro), borde-control `#737373` (4.43 sobre negro, 3.67
sobre `#1A1A1A`). Las variantes `lima` (`#F8F9E8`) y `verde` (`#F0F4F1`)
admiten los mismos valores que `marca` con margen: morado sobre `#F8F9E8` =
8.57, sobre `#F0F4F1` = 8.22.

---

## 2. Layout

### 2.1 Contenedor

- **Ancho máximo: `1220px`, `margin:0 auto`.** El mismo número en las 4 páginas
  y en todas las secciones (`:78`, `:143`, `:184`, `:210`, `:255`, `:318`,
  `:346`, `:445`, `:467`, `Tienda:44`, `Blog:44`, `Campanas:44`). **Sin
  excepciones.**
- **Gutter de sección: `clamp(18px,5vw,28px)`** — 27 apariciones, el valor más
  repetido de todo el prototipo. La cabecera usa uno ligeramente menor,
  `clamp(16px,4vw,28px)` (`:78`).
- **Contenedores estrechos por tipo de contenido**, no por *breakpoint*: FAQ
  `max-width:860px` (`:425`), cuerpo de artículo `760px` (`Blog:132`, `:152`),
  imagen grande de artículo `1080px` (`Blog:148`), hero `900px` (`:119`).
- **Medida de línea acotada en `ch`, no en px**: `16ch` en el h1 (`:123`),
  `58ch` en la entradilla del hero (`:124`), `62ch` (`:146`), `52ch` (`:188`,
  `:259`), `56ch` (`:322`), `70ch` en la respuesta de FAQ (`:437`), `34ch` en
  el pie (`:454`), `20ch`/`18ch`/`19ch` en h1/h2. **Es el detalle que más
  aporta a que "parezca diseñado" y es gratis.**

### 2.2 Rejillas por sección

Todas usan el mismo idioma: `repeat(auto-fit, minmax(min(<X>, 100%), 1fr))`.
El `min(X,100%)` evita el desbordamiento en móvil sin ningún *media query*.

| Sección | Rejilla | Gap | Cita |
|---|---|---|---|
| Servicios | `auto-fit` / `minmax(min(310px,100%),1fr)` | `22px` | `:148` |
| Campañas (portada) | 2 columnas `minmax(min(300px,100%),1fr)`, con rejilla anidada `minmax(min(210px,100%),1fr)` gap `14px` | `clamp(24px,4vw,44px)` | `:184`, `:191` |
| Equipo | `minmax(min(300px,100%),1fr)`, `align-items:start` | `26px` | `:217` |
| Reservar (chat) | 2 columnas `minmax(min(320px,100%),1fr)`, `align-items:center` | `clamp(28px,4vw,52px)` | `:255` |
| Galería | **no es rejilla**: `flex` + `overflow-x:auto` + `scroll-snap-type:x mandatory`, tarjetas `flex:0 0 clamp(240px,32vw,360px)` | `18px` | `:330`, `:332` |
| Contacto | 2 columnas `minmax(min(320px,100%),1fr)`, `align-items:start` | `clamp(24px,3vw,34px)` | `:353` |
| Datos de contacto (bajo el mapa) | `minmax(min(200px,100%),1fr)` | `18px` | `:409` |
| FAQ | columna única `max-width:860px` | — | `:425` |
| Pie | `flex-wrap`: marca `flex:1 1 260px`, columnas `flex:1 1 170px` | `32px` | `:445-457` |
| Tienda · catálogo | `minmax(min(260px,100%),1fr)` | `22px` | `Tienda:84` |
| Tienda · garantías | `minmax(min(240px,100%),1fr)` | `18px` | `Tienda:108` |
| Blog · listado | `minmax(min(300px,100%),1fr)` | `24px` | `Blog:107` |
| Blog · destacado | `1.1fr 1fr` si ancho ≥ 900, si no `1fr` | — | `Blog:329`, `:366` |
| Blog · relacionados | `minmax(min(230px,100%),1fr)` | `14px` | `Blog:166` |
| Campañas · listado | `minmax(min(300px,100%),1fr)` | `24px` | `Campanas:81` |
| Campañas · ficha | `1.6fr 1fr` si ancho ≥ 940, si no `1fr`; el `aside` es `position:sticky; top:104px` | `clamp(28px,4vw,48px)` | `Campanas:293`, `:313`, `:314`, `:117` |
| Formulario | pares de campos en `minmax(min(180px,100%),1fr)`, gap `14px` | `16px` en columna | `:364`, `:366` |

### 2.3 Comportamiento en móvil

- Solo **dos** decisiones dependen de JS, y son las de la navegación:
  `esMovil = ancho < 1120` en la portada (`:684`) y `ancho < 1080` en las
  subpáginas (`Tienda:238`, `Blog:328`, `Campanas:292`). **Eso es una
  incoherencia del prototipo**, no un patrón a copiar: Galapavet ya tiene un
  único `PUNTO_DE_CORTE_NAVEGACION_PX = 1024` (`Cabecera-logica.ts`) usado a la
  vez por JS y por CSS (`Cabecera.module.scss:34`), lo cual es mejor.
- Todo lo demás es *intrínsecamente* responsive: `auto-fit` + `min()` +
  `clamp()`. **En las 4 páginas hay CERO `@media (min-width:…)`**; el único
  `@media` es el de `prefers-reduced-motion` (`:60`). Es la lección de layout
  más importante del prototipo.
- Menú móvil: panel desplegable bajo la cabecera con `max-height:70vh;
  overflow-y:auto` y enlaces de `min-height:46px` (`:108-114`).

### 2.4 Ritmo vertical

- Patrón dominante de sección: `padding: clamp(64px,9vw,104px) clamp(18px,5vw,28px)`
  (`:142`, `:209`, `:254`, `:317`, `:345`, `:424`).
- Sección "de apoyo" (campañas en portada): `clamp(56px,8vw,90px)` (`:183`).
- Pie: `clamp(48px,7vw,72px) … 28px` (`:444`).
- Separación cabecera-de-sección → contenido: `clamp(36px,5vw,54px)` (`:148`),
  `clamp(36px,5vw,52px)` (`:217`), `clamp(28px,4vw,42px)` (`:330`),
  `clamp(32px,4.5vw,48px)` (`:353`), `clamp(28px,4vw,40px)` (`:430`).
- `scroll-padding-top:88px` en `html` (`:51`) para que el ancla no quede bajo
  la cabecera fija — Galapavet ya lo resuelve con
  `scroll-margin-block-start: espaciado(96)` (`Landing.module.scss:7`).

---

## 3. Escalas: cuántos pasos hacen falta y para qué

**No copies estos valores** (Decisión 24 los prohíbe, y con razón: ver §7.1).
Lo que sigue es el **recuento de pasos distintos** que el sistema necesita.

### 3.1 Radios (12 valores distintos → bastan 5)

| Paso necesario | Uso real | Valores que usa |
|---|---|---|
| **completo** (`999px`) | botones, píldoras, campo del chat, avisos de estado | 36 usos |
| **círculo** (`50%`) | avatares, círculos de check, botones ± e iconos redondos | 25 usos |
| **grande** | tarjeta, panel, caja de formulario, imagen de artículo | `20px` ×8, `22px` ×5, `24px` ×1 |
| **medio** | tarjeta pequeña, caja de garantía, campo de formulario, botón hamburguesa | `12px` ×12, `16px` ×3, `18px` ×2, `14px` ×2, `11px` ×3 |
| **pequeño** | barritas del logotipo y del icono hamburguesa | `3px` ×10, `2px` ×3 |

Los 12 se reducen sin pérdida a **5 pasos**. La escala de 8 px que Galapavet ya
tiene (`_tokens.scss:94-104`) da `4/8/12/16/24`, que cubre pequeño/medio/grande;
hacen falta añadir `--radio-completo: 999px` y el `50%`.

### 3.2 Sombras: **2 pasos y ni uno más**

Reposo (`--shadow-sm`) y elevado (`--shadow`), `:24`. La elevada solo aparece
en hover de tarjeta, panel del chat, panel flotante del selector e imagen de
artículo. **Es sombra teñida con el color de la tinta, no gris.** Los dos
valores tienen desplazamiento vertical grande (18 px / 6 px), difuminado muy
grande (45 px / 18 px) y alfa muy bajo (.10 / .07). Esa proporción —*mucho*
difuminado, *poca* opacidad— es lo que hace que se lea como profundidad y no
como suciedad.

### 3.3 Anchos de borde: **2 pasos**

`1px` (27 usos: perímetro y separadores) y `1.5px` (8 usos: **solo** botones
fantasma y píldoras seleccionables, para que se lean como control). Galapavet
ya fija `$grosor-foco: 2px` (`_tokens.scss:119`), que es un tercer grosor
**exclusivo del foco** y debe seguir siéndolo.

### 3.4 Alturas de control: el prototipo usa **6** (40/44/46/48/50/52) → bastan 3

- `44px` — píldoras de filtro y botones secundarios (`Tienda:271`, `Blog:358`,
  `:133`).
- `46-48px` — campos de formulario y botones normales (`:368`, `:189`, `:262`).
- `50-52px` — CTA principal (`:126`, `:393`, `Campanas:162`).

Recomendación: **3 pasos (44 / 48 / 52)**. Galapavet ya exige
`$area-tactil-minima: 24px` por SC 2.5.8 (`_tokens.scss:129`); 44 px es el
objetivo de SC 2.5.5 (AAA) y es lo que el prototipo respeta en casi todo.

### 3.5 Espaciado: ~20 gaps distintos → la rejilla de 8 ya vale

Gaps más frecuentes: `7,8,9,10,11,12,13,14,16,18,20,22,24,26,32px`. La rejilla
de 8 con medio paso (`4/8/12/16/24/32/48/64/96` — exactamente la que ya está en
`_tokens.scss:94-104` y `escalaEspaciado.ts:6`) los cubre todos salvo los
"impares de ajuste óptico" (7, 9, 11, 13), que **no aportan nada**.

### 3.6 Relaciones de aspecto de imagen: **3**

`16/10` (tarjeta de servicio `:151`, tarjeta de artículo `Blog:110`), `16/9`
(campaña `:194`, ficha `Campanas:84`, imagen grande de artículo `Blog:149`),
`4/3` (retrato de equipo `:220`, galería `:333`, producto `Tienda:87`).
Van siempre con `object-fit:cover` y con un fondo `--bg-2` bajo la imagen como
*placeholder* de carga.

---

## 4. Patrones de componente

### 4.1 Tarjeta (el patrón madre)

`article` en `display:flex; flex-direction:column`, `background:var(--card)`,
`border:1px solid var(--border)`, `border-radius:20px`, `overflow:hidden`,
`box-shadow:var(--shadow-sm)` (`:150`). Estructura invariable:

1. **Zona de medio**: `position:relative`, `aspect-ratio` fijo, fondo `--bg-2`,
   `overflow:hidden`; dentro, `img` a
   `width:100%;height:100%;object-fit:cover;display:block` con `loading="lazy"`
   y `width`/`height` explícitos (`:152`).
2. **Distintivo flotante** sobre el medio, `position:absolute` a 14-16 px de dos
   bordes, píldora `999px` (`:153`, `Tienda:90`, `Campanas:86`).
3. **Cuerpo**: `flex:1`, `padding:22px 22px 20px`, con `h3` en Outfit,
   descripción en `--muted`, y **la fila de acción anclada abajo con
   `margin-top:auto` + `padding-top` + `border-top:1px solid var(--border)`**
   (`:172`, `Tienda:97`, `Blog:117`). Ese `margin-top:auto` es lo que alinea los
   pies de todas las tarjetas de una fila aunque el texto sea desigual.

Hover: `transform:translateY(-4px)` **y** `box-shadow:var(--shadow)`, ambos
`.3s ease` (`:150`). Variantes: solo sombra en equipo (`:219`), solo
`translateY(-3px)` en la tarjeta pequeña de campaña (`:193`), solo
`border-color` en las tarjetas-lista de "sigue leyendo" (`Blog:168`,
`Campanas:175`).

### 4.2 Botón primario

`display:inline-flex; align-items:center; justify-content:center`,
`min-height:48-52px`, `padding:14-15px 26-30px`, `border-radius:999px`,
`background:var(--primary)`, `color:var(--on-primary)`, `font-weight:700`,
`font-size:15-15.5px`, `border:none`, `cursor:pointer` (`:126`, `:189`, `:393`,
`Campanas:162`). Hover: `filter:brightness(1.1)` y a veces
`transform:translateY(-2px)`. En el hero lleva además una sombra propia
`0 12px 30px rgba(0,0,0,.28)` para separarse de la foto (`:126`).

### 4.3 Botón secundario / fantasma

Mismo esqueleto, pero fondo transparente o `--card`,
`border:1.5px solid var(--border)`, `color:var(--ink)`, `font-weight:600` (uno
menos que el primario), y hover que cambia **solo** `border-color` a
`var(--primary)` (`:97`, `:262`, `:325`, `Tienda:60`, `Campanas:163`). El
`padding` es 1 px menor que el del primario para compensar el borde de 1.5 px y
que las dos alturas coincidan (`:189` vs `:262`).

### 4.4 Píldora

Tres usos distintos, misma forma (`border-radius:999px`):

- **Etiqueta estática**: `padding:5-6px 12px`, `font-size:10.5px`,
  `font-weight:700`, `letter-spacing:.1em`, `text-transform:uppercase`, fondo
  `--accent-soft` o `--card`, texto `--accent-ink` (`:153`, `:197`, `Blog:92`).
- **Filtro seleccionable**: `padding:10px 18px`, `min-height:44px`,
  `font-size:13.5px`, `font-weight:600`; activo = fondo `--primary` + texto
  `--on-primary` + `border:1px solid var(--primary)`; inactivo = fondo `--card`
  + texto `--text` + `border:1px solid var(--border)`; transición de
  `background`, `color` y `border-color` (`Tienda:268-277`, `Blog:355-364`).
- **Enlace de navegación**: `padding:9px 11px`, `font-size:14px`,
  `font-weight:500`, sin fondo; hover pinta `--accent-soft` + `--accent-ink`
  (`:92`).

### 4.5 Hero

`position:relative`, `min-height:clamp(540px,84vh,780px)`, centrado con flex,
`overflow:hidden`. Fondo: **color sólido oscuro de respaldo** +
`background-image: linear-gradient(180deg, rgba(6,16,32,.62) 0%, rgba(6,16,32,.46) 42%, rgba(6,16,32,.78) 100%), url(<foto>)`,
`background-size:cover`, `background-position:center 42%` (`:118`). El gradiente
de 3 paradas —oscuro arriba, **más claro en el centro donde va el texto**, muy
oscuro abajo— es lo que hace legible el titular sobre cualquier foto. Contenido
en `max-width:900px`, `text-align:center`,
`padding: clamp(84px,13vw,140px) clamp(18px,6vw,32px) clamp(60px,9vw,92px)`.

Composición vertical: **píldora de ubicación** con `rgba(255,255,255,.14)` +
borde `rgba(255,255,255,.28)` + `backdrop-filter:blur(6px)` (`:120`) → **h1**
`clamp(33px,6.4vw,68px)`, `line-height:1.05`, `letter-spacing:-.02em`,
`text-shadow:0 2px 24px rgba(0,0,0,.35)`, `max-width:16ch` (`:123`) →
**entradilla** `clamp(16px,2.2vw,19.5px)`, `line-height:1.65`, blanco al 90 %,
`max-width:58ch` (`:124`) → **par de CTA** (`:125-130`) → **franja de cifras**
en `grid auto-fit minmax(130px,1fr)` separada por
`border-top:1px solid rgba(255,255,255,.24)` (`:131-138`).
La franja de cifras **no se porta**: sus 4 datos son inventados (`:712-717`).

### 4.6 Cabecera fija

`position:sticky; top:0; z-index:60` y —el detalle bueno—
`background: color-mix(in srgb, var(--bg) 88%, transparent)` +
`backdrop-filter:blur(14px)` + `-webkit-backdrop-filter` +
`border-bottom:1px solid var(--border)` (`:77`). Interior: contenedor de
1220 px, `padding:12px clamp(16px,4vw,28px)`, `flex` con
`justify-content:space-between`.

Marca: cuadro de 38×38 `border-radius:12px` con fondo `--primary` y una cruz
formada por dos `span` absolutos de 17×4.5 px y 4.5×17 px (`:80-83`), junto a un
bloque de dos líneas: nombre en Outfit 17px/600 con `letter-spacing:-.01em` y
**descriptor en 10.5px, `letter-spacing:.16em`, `uppercase`, `--muted`, weight
600** (`:85-86`). Ese descriptor en versalitas espaciadas es lo que convierte
"un enlace con el nombre" en "un logotipo".

Botón hamburguesa: 46×46, `border-radius:12px`,
`border:1px solid var(--border)`, fondo `--card`, tres barritas de 19×2 px con
`gap:5px` (`:100-104`, `:696-698`).

### 4.7 Pie

`background:var(--card)` (más claro que el `--bg` de la última sección, para
cerrar la página), `border-top:1px solid var(--border)`,
`padding:clamp(48px,7vw,72px) clamp(18px,5vw,28px) 28px` (`:444`). Dos bloques:
rejilla flexible de columnas (marca `flex:1 1 260px`, columnas de enlaces
`flex:1 1 170px`, `gap:32px`) y **barra inferior** separada por
`margin:36px auto 0; padding-top:20px; border-top:1px solid var(--border)`, con
copyright a la izquierda y enlaces legales a la derecha, todo a 12.5px `--muted`
(`:467-474`). Títulos de columna: 11px, weight 700, `letter-spacing:.14em`,
`uppercase`, color `--ink` (`:458`).

### 4.8 Acordeón de FAQ

Usa **`<details name="faq">` nativo** (`:432`): acordeón exclusivo sin JS
(atributo `name` de `<details>`). Cada `details` lleva
`border-bottom:1px solid var(--border)`; el `summary` es
`flex; justify-content:space-between`, `padding:20px 4px`, `min-height:48px`,
Outfit `clamp(16px,2.1vw,19px)` weight 500, `list-style:none` +
`summary::-webkit-details-marker{display:none}` (`:58`), y a la derecha un
círculo de 30×30 con fondo `--accent-soft`, texto `--accent-ink` y un `+` de
19px (`:435`). La respuesta: `padding:0 4px 24px`, `line-height:1.75`,
`font-size:15.5px`, `max-width:70ch` (`:437`).

### 4.9 Ficha de producto (tienda)

Tarjeta estándar con `aspect-ratio:4/3`, distintivo **arriba a la derecha**
(`right:14px;top:14px`) con fondo `--accent-ink` y texto blanco (`Tienda:90`).
Cuerpo: categoría en 10.5px versalitas `--accent-ink` → `h2` Outfit 18px →
descripción 13.5px `--muted` → **fila de pie con `margin-top:auto` y
`border-top`**, con el precio a la izquierda en **Outfit 22px weight 600** (la
tipografía de titular usada como tipografía de dato) y el botón a la derecha
(`Tienda:93-100`). El botón cambia de estado: sin unidades = sólido primario con
rótulo "Añadir"; con unidades = fondo `--accent-soft`, texto y borde
`--accent-ink`, rótulo "En la cesta · N" (`Tienda:286-291`).

El **cajón de cesta**: `position:fixed; inset:0; z-index:80`, con un `button` de
fondo a pantalla completa como *scrim* (`rgba(6,16,32,.45)`) —accesible, porque
es un botón real con `aria-label`— y un `aside` de `width:min(420px,100%)`
pegado a la derecha con `border-left` y `--shadow` (`Tienda:118-157`). Cabecera
/ lista con scroll / pie con total, cada zona separada por `border` y con el pie
en `--surface`.

### 4.10 Entrada de blog

- **Listado**: destacado en `grid 1.1fr 1fr` con radio 24 px (uno más que la
  tarjeta normal) y sin sombra elevada (`Blog:366-368`); el resto, tarjetas
  normales. La tarjeta es un `<button>` con `padding:0` y `text-align:left`, no
  un enlace (**esto es un defecto**: §7.6).
- **Artículo**: ancho de lectura 760 px; sobre el título, categoría en 11px
  versalitas `--accent-ink`; `h1` `clamp(28px,4.6vw,48px)` con
  `letter-spacing:-.02em`; entradilla `clamp(17px,2.2vw,20px)` en `--muted`;
  **fila de autoría entre dos líneas** (`border-top` + `border-bottom`,
  `padding:18px 0`) con avatar circular de 42 px en `--primary` con iniciales,
  nombre/rol apilados y fecha·lectura empujada con `margin-left:auto`
  (`Blog:137-144`). Después, imagen a 1080 px con `border-radius:22px` y
  `--shadow` (`Blog:149`).
- **Prosa** (`Blog:313-324`): párrafo 17px / `line-height:1.8` / `--text` /
  `margin:0 0 18px`; `h2` Outfit `clamp(21px,2.8vw,26px)` con
  `margin:38px 0 14px` (**margen superior 2.7× el inferior**, que es lo que
  agrupa el encabezado con su párrafo); cita Outfit `clamp(19px,2.5vw,23px)`
  weight 500 con `border-left:3px solid var(--accent)` y `padding-left:22px`.
- Cierre: caja `--bg-2` con `border-radius:20px` y CTA (`Blog:157-163`); luego
  "Sigue leyendo" en tarjetas horizontales imagen 70×62 + texto
  (`Blog:168-174`).

### 4.11 Panel de chat (reserva)

Tarjeta de `border-radius:22px` con `min-height:470px` y `--shadow`, en tres
franjas (`:273-313`): **cabecera** en `--surface` con avatar circular de 40 px y
punto verde "en línea"; **cuerpo** con `flex:1; overflow-y:auto;
max-height:330px` y fondo `--bg` (más oscuro que la tarjeta, como una app de
mensajería); **pie** en `--surface` con las respuestas rápidas, el campo y el
aviso legal a 11.5px. Burbujas (`:757-765`): `max-width:84%`,
`padding:11px 15px`, `line-height:1.55`, y **radio asimétrico según emisor** —
`16px 16px 16px 5px` para el bot alineado a la izquierda, `16px 16px 5px 16px`
para el usuario alineado a la derecha con fondo `--primary`.

### 4.12 Formulario

Cada campo es un `<label>` en `flex-direction:column; gap:7px` cuyo texto es
13px weight 600 `--ink` y cuyo control es 14.5px weight **400** (hay que reponer
el peso, porque el `<label>` lo hereda) (`:367-369`). Controles:
`min-height:46px`, `padding:12px 14px`, `border-radius:12px`,
`border:1px solid var(--border)`, `background:var(--surface)`. El `textarea`
lleva `resize:vertical; min-height:110px`. La casilla legal:
`align-items:flex-start`, casilla de 18×18 con `margin-top:3px` y
`accent-color:var(--primary)` (`:390`). Estado enviado: bloque centrado con
círculo de 56 px `--accent-soft` + `✓`, `h3`, texto y un botón de texto
subrayado (`:356-361`).

---

## 5. Movimiento

- **Una sola duración y una sola curva en todo el prototipo: `.3s ease`.** 35
  declaraciones de `transition`, todas con ese valor. Propiedades animadas:
  `border-color` (7), `transform`+`box-shadow` (4), `filter` (4), `color` (4),
  `background` (4), `transform` (2), `box-shadow` (1) y combinaciones.
- **Nunca se anima `all`.** Siempre la lista explícita de propiedades.
- Transformaciones usadas: `translateY(-2px)` (botón), `translateY(-3/-4px)`
  (tarjeta), `scale(1.05)` (imagen de galería en hover, `:334`),
  `rotate(45deg)` (el `+` que se convierte en `×` al abrir, `:728`, `:748`).
- **Un único `@keyframes`**: `vlsPulso` (`:59`), opacidad 1→.35 y escala 1→.78,
  `1.6s ease-in-out infinite`, aplicado a los 5 puntos rojos de urgencias.
  **No se porta**: es exclusivo de urgencias 24 h (§1.3).
- **Despliegue de paneles sin JS de altura**: helper `panel(abierto)`
  (`:649-652`) → `overflow:hidden`, `max-height: 620px | 0px`,
  `opacity: 1 | 0`, `transition: max-height .3s ease, opacity .3s ease`. Truco
  conocido y con coste conocido (§7.5).
- **`prefers-reduced-motion`** (`:60`, idéntico en las 4 páginas):

  ```css
  @media(prefers-reduced-motion:reduce){
    html{scroll-behavior:auto}
    *{animation-duration:.01ms !important;transition-duration:.01ms !important}
  }
  ```

  Es decir: el prototipo **declara el movimiento por defecto y lo anula** en
  `reduce`. Galapavet hace lo contrario y es más estricto: la puerta
  `movimientoRespetuoso.ts:19-21` exige que cada `transition`/`animation` viva
  **dentro** de un `@media (prefers-reduced-motion: no-preference)` o `reduce`.
  **Mantén la disciplina del repo, no la del prototipo** (§9.2).
- Desplazamiento programático: `scrollBy({left, behavior:'smooth'})` calculando
  el paso como `anchoDeLaPrimeraTarjeta + gap` (`:674-680`). Galapavet ya decide
  `smooth` vs `auto` en JS según la preferencia
  (`Galeria-logica.ts` / `Galeria.module.scss:44-46`), lo cual es correcto.

---

## 6. Tipografía

> Las familias ya están decididas: **Outfit** (titulares) + **DM Sans**
> (texto), autoalojadas. El prototipo las carga desde `fonts.googleapis.com`
> (`:13-15`) — **eso está PROHIBIDO por la Decisión 9**.

- **Pila del cuerpo**: `'DM Sans', system-ui, -apple-system, sans-serif` en
  `body`, más `-webkit-font-smoothing:antialiased` (`:52`).
- **Outfit se aplica elemento a elemento** con `font-family:'Outfit',sans-serif`
  (~40 usos): `h1`, `h2`, `h3`, nombre de marca en cabecera y pie, cifras del
  hero, precios, iniciales de avatar, número de paso, `summary` del FAQ,
  encabezados y citas de la prosa del blog, total de la cesta. **Regla real:
  Outfit es la tipografía de "titulares y datos numéricos"; DM Sans, la de todo
  lo que se lee en frases.**
- **Pesos: solo 4** — 400 (cuerpo; 6 usos explícitos para reponerlo tras un
  `<label>`), 500 (enlaces de nav, `summary`, entradilla destacada), 600
  (titulares, nombres de marca, subtítulos, precios: 79 usos) y 700 (botones,
  versalitas, énfasis: 51 usos). **Ningún titular usa 700**: la jerarquía de
  titular se hace con tamaño y `letter-spacing`, no con peso.
- **Interlineados** (16 valores distintos → bastan 5): `1.05-1.08` titulares
  grandes, `1.15-1.25` titulares de tarjeta, `1.5-1.6` texto compacto de UI,
  `1.65-1.7` cuerpo (23 usos, el más común), `1.75-1.8` prosa larga de blog.
- **`letter-spacing`** — dos familias claras:
  - **negativo** en titulares: `-.02em` (h1, `:123`, `:135`, `Blog:135`),
    `-.015em` (h2, `:145`, `:187`, `:213`), `-.01em` (nombre de marca, `:85`).
  - **positivo grande** en versalitas: `.22em` en los *eyebrow* de sección
    (8 usos), `.16em` en el descriptor de marca, `.14em` en títulos de columna
    del pie y rótulos de dato, `.12em`/`.1em`/`.08em` en píldoras.
- **El patrón "eyebrow"** (`:144`, `:186`, `:212`, `:257`, `:320`, `:348`,
  `:427`) es el elemento tipográfico más característico del prototipo: `<p>` de
  `font-size:12px`, `letter-spacing:.22em`, `text-transform:uppercase`,
  `font-weight:700`, `color:var(--accent-ink)`, `margin:0 0 13px`. Identifica
  cada sección antes del `h2`, y **Galapavet no tiene nada equivalente hoy**.
- **`text-wrap:pretty` en `p`** (`:54`): evita líneas viudas. Gratis.
- Énfasis en titular: `<em style="font-style:normal;color:var(--primary)">`
  (`:145`) — colorear media frase del `h2` en lugar de ponerla en cursiva.

---

## 7. Lo que el prototipo hace REGULAR, y la mejora concreta

### 7.1 La escala tipográfica no existe (confirmado)

He contado **39 tamaños de fuente distintos** entre marcado y JS: 26 valores
fijos (`10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5, 16, 16.5,
17, 17.5, 18, 19, 19.5, 20, 21, 22, 24, 26, 30, 46px`) y 13 `clamp()` distintos.
No hay ratio: entre 13px y 13.5px no hay diferencia perceptible, solo deuda.
Igual con los espaciados: **50 tripletas `clamp()` distintas**, 12 radios y 6
alturas de control.
**Mejora:** usar la escala Utopia de 8 pasos ya declarada
(`_tokens.scss:76-85`) y las 9 paradas de espaciado (`:94-104`). Cualquier valor
del prototipo se redondea al paso más cercano; ninguno se copia.

### 7.2 El prototipo NO tiene estilos de foco — y además los borra

**Cero apariciones de la cadena `focus` en los 4 ficheros** y **6
`outline:none`** sobre campos de formulario y del chat (`:299`, `:368`, `:371`,
`:375`, `:378`, `:387`). Es un incumplimiento directo de WCAG 2.2 SC 2.4.7
(Focus Visible) y SC 2.4.13 (Focus Appearance).
**Mejora:** no copiar nunca `outline:none`; mantener `@include foco-visible`
(`_tokens.scss:121-126`), que ya da `outline: 2px solid var(--color-foco)` con
`outline-offset: 2px`.

### 7.3 `--border` a 1.30:1 hace invisibles los controles fantasma

`--border: rgba(15,32,60,.13)` sobre blanco da **1.30:1** (calculado sobre su
composición `#DEE2E8`). Cuando ese borde es lo **único** que identifica un
control —botón "Tienda" (`:97`), botón "Llamar a la clínica" (`:262`), flechas
de galería (`:325`), píldoras de filtro inactivas (`Tienda:275`), campos de
formulario (`:368`)— incumple SC 1.4.11 (3:1 para componentes de interfaz).
**Mejora:** dos roles separados, `--color-borde` (decorativo, para el perímetro
de tarjeta, que ya se distingue por sombra y fondo) y `--color-borde-control`
(≥3:1). Valor verificado para `marca`: `#A06997` = 4.23 sobre blanco, 3.70 sobre
`#F4EEF3`.

### 7.4 `--muted` está al límite y carga demasiado peso

`#5E6E88` da 5.17 sobre `--card`, 4.94 sobre `--bg` y **4.60 sobre `--bg-2`**.
Pasa por los pelos, y es el color de: entradillas de sección a 17px,
descripciones de tarjeta a 13.5-14.5px, pies de foto a 13px, metadatos a
12-12.5px y **todos los enlaces del pie** (`:461`). Un enlace a 14px con 4.60:1
es un enlace difícil.
**Mejora:** (a) `--color-texto-suave` con margen real —el `#925389` propuesto da
5.50 sobre blanco—; (b) **los enlaces del pie no usan el rol "suave"**, usan
`--color-texto`; (c) ninguna pieza por debajo de 14px usa el rol suave.

### 7.5 El acordeón `max-height:620px` es frágil

`panel(abierto)` (`:649-652`) anima `max-height` con un techo **fijo** de
620 px. Si el contenido crece (una biografía larga, o un desglose de 7 puntos
como el de "Cirugía y anestesia" en `src/data/servicios.ts:19-26`) el panel se
recorta. Además la transición de `max-height` no es lineal en el tiempo
percibido: arranca rápido y "espera" al final.
**Mejora:** Galapavet ya no lo necesita — los desplegables montan y desmontan el
nodo (`Servicios.tsx:33-39`, `Equipo.tsx`), que es más robusto y accesible. Si
se quiere animar, `interpolate-size: allow-keywords` + `height: auto`
(<https://developer.mozilla.org/en-US/docs/Web/CSS/interpolate-size>) — **NO
VERIFICADO** su soporte en el parque de navegadores objetivo; comprobar antes.

### 7.6 Tarjetas de contenido implementadas como `<button>`

Las tarjetas del blog (`Blog:86`, `Blog:109`) y de campañas (`Campanas:96`,
`Campanas:175`) son `<button>` que cambian estado interno, no enlaces. Coste
real: no se abren en pestaña nueva, no tienen URL, no las indexa el buscador y
no aparecen en la lista de enlaces de un lector de pantalla.
**Mejora:** Galapavet ya lo hace bien (`<Link>` de React Router en
`PaginaBlog.tsx:54`, `PaginaCampanas.tsx:47`). **No regresar a `<button>` al
portar el aspecto visual.**

### 7.7 Áreas táctiles por debajo de 44 px

Botones `±` de la cesta a 34×34 (`Tienda:139`, `:141`), cerrar cajón a 40×40
(`Tienda:124`), y el `+` de servicios a 30×30 (`:435`, `:726`) —este último está
dentro de un `<button>` de `min-height:48px`, así que se salva.
**Mejora:** mínimo 44×44 en todo control (SC 2.5.5), o 24×24 con separación
(SC 2.5.8), que es lo que ya exige `_tokens.scss:129-134`.

### 7.8 Ritmo vertical irregular entre páginas

La portada usa `clamp(64px,9vw,104px)` por sección; Tienda arranca con
`clamp(44px,6vw,76px)` y cierra con `clamp(64px,9vw,100px)`; Campañas con
`clamp(48px,7vw,84px)` y `clamp(36px,5vw,56px)`. Valores casi iguales pero no
iguales: el resultado es que las subpáginas "no encajan" con la portada.
**Mejora:** **3 pasos de ritmo de sección** y nada más —sección normal, sección
compacta, sección de cierre— usados en las 5 páginas.

### 7.9 Duración única `.3s` para todo

`.3s` está bien para una tarjeta que se eleva, pero es lento para un cambio de
color de enlace o de borde: se percibe como retardo. (Referencia: Material
Design 3 recomienda 100-200 ms para cambios pequeños y 250-400 ms para
transiciones de elementos grandes,
<https://m3.material.io/styles/motion/easing-and-duration/tokens-specs>.)
**Mejora:** 2 duraciones —**150 ms** para color/borde/fondo y **300 ms** para
transformaciones y sombras— y una curva de salida (`ease-out`) en lugar de
`ease`, para que el cambio arranque rápido.

### 7.10 Animaciones gratuitas

Los 5 puntos que laten (`vlsPulso`) existen solo para dramatizar "urgencias
24 h". Galapavet **no tiene ese servicio**, así que el `@keyframes` desaparece
entero. No hace falta sustituirlo por nada.

### 7.11 Jerarquía floja dentro de la tarjeta

En la tarjeta de servicio, `h3` (21px/600 `--ink`) y descripción
(14.5px/`--muted`) están bien, pero el rótulo del botón desplegable (13.5px
**weight 700** `--accent-ink`, `:172`) compite visualmente con el título por ser
el único elemento en 700 dentro de la tarjeta.
**Mejora:** el desplegable a weight 600 con el `+` como ancla visual, o el
título un paso más arriba de la escala.

---

## 8. Cruce sección a sección con lo que YA existe en el repo

> Estado común a **todas** las filas: hoy no hay `font-family` en ninguna parte,
> no hay reglas para `html`/`body` (no existe ninguna hoja global importada:
> `src/main.tsx:1-22` no importa CSS y `src/App.tsx` tampoco), no hay `public/`,
> y solo hay 3 roles de color. No lo repito en cada fila.

| Sección | Qué hay hoy | Qué falta (arquitectura del prototipo) |
|---|---|---|
| **Cabecera** `Cabecera.tsx` + `.module.scss:1-83` | `position:fixed`, flex, `z-index:10`, punto de corte 1024 duplicado bien en CSS y JS, `@include foco-visible` | fondo translúcido con `color-mix` + `backdrop-filter:blur(14px)` y `border-bottom`; contenedor de 1220 px centrado; bloque de marca de dos líneas con logotipo (hoy `datosNegocio.identidad.nombreComercial` va suelto en un `<a>`); enlaces como píldoras con hover; botón hamburguesa de 46×46 con borde y barritas; panel móvil con `max-height:70vh` |
| **Hero** `Hero.tsx` + `.module.scss:1-28` | `<p>` ubicación, `h1`, `<p>`, 2 enlaces, `<dl>` de horario; padding 64/24, `paso-tipografico(5)` | todo el patrón §4.5: `min-height` fluido, imagen de fondo local + gradiente de 3 paradas, píldora de ubicación, `max-width` en `ch`, `text-shadow`, CTA primario/secundario diferenciados, franja inferior separada por línea. **La `<dl>` de horario ocupa el sitio de la "franja de cifras" y es contenido REAL** — buen cambio, mantenlo |
| **Servicios** `Servicios.tsx` + `.module.scss:1-34` | `section` flex-wrap, `article.tarjeta` con borde 1px, radio 8px, `h3`, botón desplegable con `aria-expanded`, `<ul>` de puntos | rejilla `auto-fit/minmax(min(310px,100%),1fr)`; **zona de medio con imagen** (hoy no hay imagen en `src/data/servicios.ts`); píldora de categoría; sombra de reposo + hover elevado; `margin-top:auto`+`border-top` en la fila del botón; círculos de check en los puntos; *eyebrow* + entradilla sobre el `h2`. **5 bloques reales, no 12** |
| **Campañas (portada)** `CampanasPortada.tsx` + `.module.scss:1-38` | `<ul>` flex-wrap, `<li>` con borde y radio 8, imagen opcional, distintivo "Demostración", enlace "Ver campañas" | layout de 2 columnas (texto + rejilla de 3 tarjetas pequeñas); fondo `--color-fondo-alterno` para bandear; `aspect-ratio:16/9` + `object-fit:cover`; píldora de estado; radio 16 + sombra de reposo; CTA primario. **Sin precio ni vigencia** (`campanas.ts` los prohíbe): el hueco del precio del prototipo se queda vacío o lo ocupa el nombre del bloque de servicio |
| **Equipo** `Equipo.tsx` + `.module.scss:1-30` | flex-wrap, `article.tarjeta`, `h3`, `<p>` rol, botón + `<p>` formación | retrato `aspect-ratio:4/3` (no hay fotos); rejilla `auto-fit` con `align-items:start`; botón `+` circular de 44 px que rota 45° al abrir y cambia a `--primary`; `<dl>` de datos; píldoras de especialidad. **2 profesionales reales**, y Joaquín Herranz **no tiene formación publicada**: la tarjeta debe verse bien sin ese dato y sin botón |
| **Reserva/chat** `ReservaChat.tsx` + `.module.scss:1-33` | `section`, enlaces de teléfono, `<ul>` de horario, `fieldset`, `[role=log]` con `<p>`, inputs y botones con foco | layout de 2 columnas; panel de chat como tarjeta de 3 franjas (§4.11); **burbujas con radio asimétrico y alineación por emisor** (hoy todos los mensajes son `<p>` idénticos); cabecera con avatar; respuestas rápidas como píldoras; lista de ventajas con checks |
| **Galería** `Galeria.tsx` + `.module.scss:1-48` | flechas ‹ ›, pista `overflow-x:auto` con `scroll-snap-type:x proximity`, `figure` de 240px fijos, `scroll-behavior` ya dentro de `no-preference` | `scroll-snap-type: x mandatory` y ancho fluido `clamp(240px,32vw,360px)`; `figure` como tarjeta (fondo, borde, radio 20, sombra); `aspect-ratio:4/3` + `object-fit:cover`; flechas circulares de 48 px arriba a la derecha alineadas con el encabezado; `scrollbar-width:none`; padding lateral en la pista para que sangre a los gutters |
| **Contacto** `FormularioContacto.tsx` + `InformacionContacto.tsx` | formulario en columna con labels, `aria-invalid`, `<output>` de confirmación; mapa en `<iframe sandbox="">`, `<fieldset>` de teléfonos/horario/urgencias | 2 columnas (formulario / bloque de datos); formulario como tarjeta con radio 22 y sombra; **pares de campos en subrejilla** `auto-fit minmax(min(180px,100%),1fr)`; labels 13px/600 sobre control 14.5px/400; campos con fondo `--color-superficie-elevada` y radio 12; confirmación con círculo `✓`; datos bajo el mapa en rejilla de 4 con rótulos en versalitas. **La tarjeta roja de urgencias NO se porta** |
| **FAQ** `Faq.tsx` + `.module.scss:1-40` | `<button aria-expanded aria-controls>` + `<section>`, borde inferior, transición de `padding-inline-start` ya dentro de `no-preference` | contenedor de 860 px centrado; encabezado centrado con *eyebrow*; `border-top` en el primer ítem; fila a `justify-content:space-between` con círculo `+` a la derecha que rota; respuesta con `line-height:1.75` y `max-width:70ch`. **Mantener `<button>`+`aria-controls`**, no cambiar a `<details name>` (rompería tests de accesibilidad ya verdes) |
| **Pie** `PieDePagina.tsx` + `.module.scss:1-30` | flex-wrap, logo `<img>` (404 hoy), 3 columnas de enlaces, copyright, enlaces legales | fondo `--color-superficie` + `border-top` que cierra la página; columna de marca `flex:1 1 260px` con descriptor a `34ch`; títulos de columna en versalitas 11px `.14em`; **barra inferior separada por `border-top` con copyright a la izquierda y legales a la derecha** (hoy los dos bloques van seguidos sin separación) |
| **Selector de paleta** `SelectorPaleta.tsx` + `.module.scss:1-35` | `position:fixed` abajo-derecha, `z-index:20`, panel con borde y radio, muestras circulares de 12px | botón lanzador circular de 52 px con sombra y **muestra en `conic-gradient`**; panel de `width:min(268px,calc(100vw - 32px))` con radio 18 y sombra elevada; filas de 48 px con estado activo (fondo `--color-acento-suave` + borde `--color-primario`); rótulo en versalitas. Las muestras a 12px son pequeñas: subir a 14px |
| **Landing** `Landing.module.scss:1-7` | solo `scroll-margin-block-start` | **el bandeado alterno de secciones vive aquí**: `:nth-child` o una clase `.seccionAlterna` que pinte `--color-fondo-alterno`. Sin eso, 8 secciones con el mismo fondo |
| **Tienda** `PaginaTienda.tsx` + `.module.scss:1-53` | `<main>`, `h1`, filtros `<fieldset>` con `aria-pressed`, `<ul>` de productos con `<img>`, `<dialog>` de cesta con foco atrapado | encabezado de página con miga de pan + `h1` a `clamp` + entradilla a `60ch`; filtros como píldoras con estado activo sólido; ficha de producto §4.9 con pie anclado y precio en Outfit; botón que cambia a estado "en la cesta"; **`<dialog>` con estilo de cajón lateral** (`width:min(420px,100%)`, borde izquierdo, 3 franjas, scrim); banda de garantías en `--color-fondo-alterno` |
| **Blog** `PaginaBlog.tsx` + `.module.scss:1-41` | listado con `<ul aria-label>`, filtros, `<article>` con `h1`/`<img>`/cuerpo, `h2`/`blockquote`/`<p>`, "sigue leyendo", cierre con CTA | destacado a 2 columnas (§4.10); tarjetas con medio 16/10 y pie anclado; **estilos de prosa** (17px/1.8, `h2` con `margin:38px 0 14px`, cita con borde izquierdo de 3px) — hoy `<blockquote>` y `<h2>` no tienen ningún estilo propio; fila de autoría entre líneas; imagen del artículo a 1080 px con radio 22 y sombra; ancho de lectura 760 px |
| **404** `PaginaNoEncontrada.module.scss:1-18` | centrado, `h1`, enlace | el prototipo no tiene 404. Reutiliza el encabezado de página de las subpáginas |

---

## 9. Restricciones del repo que NO se pueden romper al implementar

### 9.1 Ningún literal de color en un `.module.scss`

`puertaLiteralesColor.ts:27-30,56` señala **cualquier** `#hex`,
`rgb()/rgba()/hsl()/hsla()` y los 16 nombres de color CSS en cualquier línea de
`src/components/*.module.scss` y `src/pages/*.module.scss`
(`inventarioModulos.test.ts:88-93`). **`src/styles/_tokens.scss` NO está en ese
glob**, así que es el único sitio donde pueden vivir las sombras `rgba()`, los
gradientes del hero y los fondos translúcidos. Consecuencia práctica: **cada
sombra, cada gradiente y cada `color-mix` debe salir como token**
(`--sombra-reposo`, `--sombra-elevada`, `--velo-hero`, …).
Ojo con el falso positivo: `PATRON_NOMBRE_DE_COLOR` usa `\b`, así que una
palabra como `lime` en un comentario en español dispara la puerta.

### 9.2 Todo `transition`/`animation` dentro de `prefers-reduced-motion`

`movimientoRespetuoso.ts:19-21,44` exige que la declaración esté anidada en un
`@media` con `prefers-reduced-motion: no-preference` o `reduce`, y lo comprueba
leyendo el texto real línea a línea siguiendo la profundidad de llaves — **un
bloque que abra y cierre en la misma línea lo despista**. No sirve un mixin: el
patrón busca la propiedad literal dentro del bloque. Nota:
`movimientoRespetuoso.ts:80` exige además que **al menos un** fichero declare
movimiento.

### 9.3 Un `.module.scss` co-localizado por módulo

`inventarioModulos.ts:16-36` fija los 12 componentes + 5 páginas. Si añades un
componente nuevo (por ejemplo un `Boton` compartido), **añádelo al inventario** o
la puerta falla; y `MetadatosPagina` debe seguir fuera.

### 9.4 Los tokens se leen del texto real, no se duplican

`tokensColor.ts:50-58` extrae `--color-<rol>` con la expresión
`--color-<rol>:\s*(#[0-9a-fA-F]{6})\s*;` dentro del bloque
`:root[data-variante='<id>']`, y `extraerBloqueDeVariante` usa `[^}]*`: **un
bloque de variante no puede contener llaves anidadas**. Además el patrón solo
acepta **hex de 6 dígitos**, igual que `contraste.ts:26`. Los roles nuevos
amplían el tipo `RolDeColor` (`tokensColor.ts:15`) y **cada uno necesita su fila
en la matriz de uso** (qué se pinta sobre qué) para poder verificarse.

### 9.5 Los tests corren en jsdom y NO ven CSS

`vite.config.ts:46-65`: los CSS Modules devuelven un proxy y solo
`import.meta.glob(..., {query:'?raw'})` recibe texto real. **Ningún test actual
de este repo puede comprobar que algo se ve bien.** Por eso la feature 22 añade
Playwright + axe: todo lo visual se verifica ahí, y en Vitest solo se verifican
las **puertas de texto** (que el token existe, que su ratio pasa, que no hay
literales, que el movimiento está cubierto).

### 9.6 Un único punto de corte, compartido por JS y CSS

`PUNTO_DE_CORTE_NAVEGACION_PX = 1024` (`Cabecera-logica.ts`) gobierna a la vez
`esMovil` en React y el `@media (min-width: 1024px)` de
`Cabecera.module.scss:34,55,63`, y `puntoDeCorte.ts:6` verifica que no diverjan.
El prototipo usa 1120 y 1080 según la página; **no lo copies**. Y recuerda que
`escalaTipografica.ts:10,28` **importa** ese mismo número como viewport máximo
de la escala fluida: cambiarlo mueve la tipografía entera.

---

## 10. Lagunas y NO VERIFICADO

- **NO VERIFICADO**: los `.dc.html` no llegaron a renderizarse en un navegador
  durante este estudio; todo lo anterior sale de leer el código fuente y de
  calcular los ratios, no de medir píxeles en pantalla.
- **NO VERIFICADO**: el soporte real de `color-mix(in srgb, …)` (`:77`),
  `backdrop-filter` (`:77`, `:120`), `text-wrap:pretty` (`:54`) y
  `<details name>` (`:432`) en el parque de navegadores objetivo del proyecto —
  que además **no está declarado en ningún sitio del repo**. Debe fijarse antes
  de usarlos: los cuatro necesitan plan de degradación (`backdrop-filter` sin
  soporte deja la cabecera translúcida e ilegible).
- **NO VERIFICADO**: si el `-webkit-font-smoothing:antialiased` de `:52` es
  deseable; adelgaza el texto en macOS y puede empeorar la legibilidad de
  DM Sans a 14px. Decidir con la fuente ya instalada.
- **Laguna de contenido, no de diseño**: no existe todavía ninguna imagen en el
  repo. `src/data/galeria.ts:24-29` (6 rutas), `src/data/campanas.ts`,
  `src/data/tienda.ts`, `src/data/blog.ts` y `PieDePagina.tsx` (`SRC_LOGO`)
  apuntan a ficheros inexistentes bajo `/img/…`. Los patrones de tarjeta de este
  informe **dependen todos de tener imagen**: sin ella hay que decidir el
  aspecto del hueco (fondo `--color-fondo-alterno` a la relación de aspecto
  correcta ya lo resuelve dignamente, que es justo lo que hace el prototipo
  mientras carga: `:151`, `:194`, `:333`).
- **Laguna deliberada**: no he propuesto valores de token para las variantes
  `lima`, `verde` y `noche` más allá de los verificados en §1.4. Esa tabla
  completa es trabajo del implementador y debe salir de la puerta de contraste,
  no de este documento.
