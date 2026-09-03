# Delta de fidelidad — Campañas en portada

Sección: `CampanasPortada` (portada, entre `#servicios` y `#equipo`, sin ancla propia).
Prototipo: `docs/diseno-claude-design/Veterinaria La Sierra.dc.html`, `<section id="campanas" data-screen-label="Campañas">`, líneas 183-206, y el array `campanas` del runtime, líneas 732-736.
Web: `src/components/CampanasPortada.tsx`, `CampanasPortada.module.scss`, `CampanasPortada-logica.ts`, `src/data/campanas.ts`.
Capturas comparadas a 1280 px: `scratchpad/shots/diseno_02.png` (sección en y ≈ 255-985 de la franja) y `scratchpad/shots/web_01.png` (sección en y ≈ 440-1140 de la franja). El CSS real servido se ha leído de `dist/assets/index-CCVUwotx.css`.

Fecha: 03/09/2026. Autor: subagente de fidelidad (solo lectura sobre `src/`, `tests/`, `features/`).

---

## Anatomía del prototipo

Todo lo que sigue está leído del HTML (estilos inline) y de los tokens de `:root` (líneas 18-25). Los valores "a 1280" son el resultado de resolver cada `clamp()` a ese ancho de ventana, que es el de las capturas.

### 1. La sección (`<section id="campanas">`, línea 183)

| Propiedad | Valor literal | A 1280 px |
| --- | --- | --- |
| `padding` (bloque) | `clamp(56px, 8vw, 90px)` | 8vw = 102,4 → **90 px** arriba y abajo |
| `padding` (inline) | `clamp(18px, 5vw, 28px)` | 5vw = 64 → **28 px** |
| `background` | `var(--bg-2)` (fondo **alterno**: `#EDF2F9` en la paleta base) | — |
| sin `color` propio | hereda `--text` del `body` | — |

Es la única sección de la portada con el relleno vertical "de apoyo" (las demás usan `clamp(64px, 9vw, 104px)`, líneas 142/209/254/317/345/424). Es la única sección que en el prototipo va con fondo `--bg-2` justo después de `#servicios` (`--bg`): el bandeado del prototipo es hero(foto) → servicios `--bg` → campañas `--bg-2` → equipo `--bg` → reservar `--bg-2` → galería `--bg` → contacto `--bg-2` → faq `--bg`.

### 2. El contenedor de dos columnas (línea 184)

```
max-width: 1220px; margin: 0 auto;
display: grid;
grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
gap: clamp(24px, 4vw, 44px);
align-items: center;
```

- A 1280: ventana 1280 − 2 × 28 = 1224 disponibles → contenedor **1220 px**; gap 4vw = 51,2 → **44 px**; dos columnas de **(1220 − 44) / 2 = 588 px**.
- `align-items: center`: la columna de texto (más baja) queda **centrada verticalmente** respecto a la rejilla de tarjetas (más alta). En la captura: tarjetas y = 342-893 (centro 617), bloque de texto y = 515-726 (centro 620).
- Sin `@media`: el paso a una columna lo hace el `auto-fit` cuando el contenedor baja de 300 × 2 + gap ≈ **644-668 px** de ancho útil (ventana ≈ 680-700 px).
- Sin `data-screen-label` ni id en el DOM de la web (ver contrato `ensamblaje_landing` @s5).

### 3. Columna izquierda: presentación (líneas 185-190)

Cuatro hijos, en este orden, todos alineados a la **izquierda** (nada centrado):

| # | Elemento | Estilos literales | A 1280 |
| --- | --- | --- | --- |
| 1 | `<p>` cintillo | `font-size: 12px; letter-spacing: .22em; text-transform: uppercase; color: var(--accent-ink); font-weight: 700; margin: 0 0 13px` | 12 px |
| 2 | `<h2>` | `font-family: 'Outfit'; font-size: clamp(26px, 3.6vw, 40px); line-height: 1.1; letter-spacing: -.015em; font-weight: 600; color: var(--ink); margin: 0` | 3,6vw = 46,08 → **40 px** |
| 3 | `<p>` intro | `font-size: 16.5px; line-height: 1.7; color: var(--muted); max-width: 52ch; margin: 14px 0 26px` | ancho de línea limitado a **52ch** (≈ 480 px), dos líneas en la captura |
| 4 | `<a>` CTA **primario** | `display: inline-flex; align-items: center; gap: 10px; min-height: 48px; padding: 14px 26px; border-radius: 999px; background: var(--primary); color: var(--on-primary); font-weight: 700; font-size: 15px; transition: filter .3s ease, transform .3s ease` · hover `filter: brightness(1.1); transform: translateY(-2px)` | píldora rellena de 49 × 230 px en la captura |

Texto del prototipo (NO se copia; ver límites): "Campañas" · "Prevención a precio de campaña" · "Cada trimestre abrimos una campaña…" · "Ver campañas activas →". El destino es `./Campanas.dc.html`.

### 4. Columna derecha: rejilla compacta de tarjetas (líneas 191-205)

```
display: grid;
grid-template-columns: repeat(auto-fit, minmax(min(210px, 100%), 1fr));
gap: 14px;
```

- A 1280: columna de 588 px → dos columnas de **(588 − 14) / 2 = 287 px**. Con **3** entradas del array `campanas` → 2 filas: dos tarjetas arriba, una abajo a la izquierda, **la cuarta celda queda vacía** (así se ve en la captura: x = 663-948 y 964-1249; y = 342-610 y 626-893). Es una rejilla "2 × 2" por geometría, no porque haya 4 campañas.
- Se colapsa a una columna cuando la columna baja de 210 × 2 + 14 = **434 px**.

Cada tarjeta es **un único `<a>`** (toda la tarjeta enlaza, línea 193):

| Capa | Estilos literales | A 1280 |
| --- | --- | --- |
| `<a>` tarjeta | `display: block; background: var(--card); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; box-shadow: var(--shadow-sm); transition: transform .3s ease` · hover `transform: translateY(-3px)` | 287 × 268 px |
| `<div>` medio | `aspect-ratio: 16/9; background: var(--bg-2); overflow: hidden` | 287 × 161 px |
| `<img>` | `display: block; width: 100%; height: 100%; object-fit: cover; loading="lazy"`; `alt` con texto | foto de banco (Pexels) |
| `<div>` cuerpo | `padding: 14px 16px 16px` | — |
| fila de meta | `display: flex; align-items: center; gap: 8px; flex-wrap: wrap` | — |
| `<span>` píldora de estado | `padding: 4px 10px; border-radius: 999px; background: var(--accent-soft); color: var(--accent-ink); font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase` | "ACTIVA" / "PLAZAS LIMITADAS" |
| `<span>` texto junto a la píldora | `font-size: 12px; color: var(--muted)` | vigencia ("Hasta el 30 de septiembre") |
| `<h3>` | `font-family: 'Outfit'; font-size: 17px; font-weight: 600; color: var(--ink); margin: 10px 0 4px` | — |
| `<p>` línea de detalle | `font-size: 13.5px; color: var(--muted); margin: 0` con `<strong style="color: var(--primary); font-size: 16px">` | "**49 €** con revisión incluida" |

Tokens implicados y su equivalente en la web (`src/styles/_tokens.scss`): `--bg-2` → `--color-fondo-alterno`; `--card` → `--color-superficie`; `--border` → `--color-borde`; `--ink` → `--color-tinta`; `--muted` → `--color-texto-suave`; `--primary` / `--on-primary` → `--color-primario` / `--color-sobre-primario`; `--accent-soft` / `--accent-ink` → `--color-acento-suave` / `--color-acento-tinta`; `--shadow-sm` → `--sombra-reposo`; `--shadow` → `--sombra-elevada`.

---

## Estado actual de la web

### DOM que pinta `CampanasPortada.tsx`

```
section[aria-label="Campañas de prevención"][aria-describedby="campanas-aviso-demostracion"][data-contenedor-principal].campanasPortada
  p.eyebrow                      "Prevención"
  h2                             "Campañas de prevención"
  p#campanas-aviso-demostracion  aviso literal de demo (@s4)
  ul
    li × 3
      a[href=/campanas]
        img[alt=""][width=800][height=450][loading=lazy][decoding=async]   (si hay imagen)
        span                     "Demostración"
        h3                       "Vacunaciones" | "Chequeo" | "Odontología"
  a[href=/campanas]              "Ver campañas"
```

Modelo: `construirModeloCampanas(CAMPANAS_DEMO)` (filtra títulos en blanco y falla cerrado ante `precio`/`vigencia`), envuelto en `construirModeloSeguro` que devuelve `[]` si lanza. El catálogo real trae `id`, `bloque` y `puntos` por campaña, pero el componente **solo usa `titulo` e `imagen`**.

### CSS real servido (`dist/assets/index-CCVUwotx.css`, resumido)

| Selector | Declaraciones | A 1280 |
| --- | --- | --- |
| `.campanasPortada` | `width: 100%; max-width: 1220px; margin-inline: auto; padding-inline: 24px; padding-block: var(--ritmo-seccion-compacto); background-color: var(--color-fondo); color: var(--color-texto)` | contenido 1172 px; `--ritmo-seccion-compacto = clamp(56px, 6.2vw, 90px)` → **79,4 px**; fondo **base**, no alterno |
| `.eyebrow` | mixin `eyebrow`: 12,8 px · 700 · `.12em` · mayúsculas · `--color-acento-tinta` · `margin-block-end: 4px` | — |
| `h2` | `paso-tipografico(4) = clamp(28px, 4.2vw, 46px)`; `margin-block-end: 8px`; global 600 / −.015em / lh 1.08 | **46 px** |
| `> p` (aviso) | `color: var(--color-texto-suave); margin-block-end: 24px`; **sin `max-width`** | dos líneas de ≈ 1172 px (≈ 150 caracteres por línea) |
| `ul` | `display: grid; grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr)); gap: 24px; margin: 0 0 32px` | **3 columnas** de (1172 − 48) / 3 ≈ **375 px** |
| `li` | mixin `tarjeta`: `--color-superficie`, borde 1 px `--color-borde`, radio **24 px**, `--sombra-reposo`, hover `--sombra-elevada` (transición solo en `no-preference`) | tarjetas de 375 × 300 px |
| `li > a` | `display: flex; flex-direction: column; height: 100%; color: inherit; text-decoration: none` + foco visible | — |
| `li > a img` | `hueco-de-imagen(16, 9)`: `aspect-ratio: 16/9; width: 100%; background: --color-fondo-alterno; object-fit: cover` | 375 × 211 px |
| `li > a span` | mixin `pildora-etiqueta` (12/4 px, 12,8 px, 700, `.08em`, mayúsculas) + `margin: 16px 16px 8px` | — |
| `li > a h3` | `paso-tipografico(1) = 20px`; `margin: 0 16px 16px` | — |
| `> a` (CTA) | mixin `boton-fantasma`: borde 1,5 px `--color-borde-control`, fondo transparente, radio 999 px, `min-height: 48px`, 600, 16 px. **En el CSS compilado no hay ningún `padding-inline`** | píldora de 48 × ≈ 112 px |

### Lo que se ve en `web_01.png` (franja 2, y relativas)

- y ≈ 440: cambio de fondo alterno → base (empieza la sección). y ≈ 533 cintillo "PREVENCIÓN"; y ≈ 575 titular a 46 px; y ≈ 617-642 el aviso en dos líneas a todo el ancho; y ≈ 678-977 tres tarjetas grandes en una fila; y ≈ 1010-1058 el botón fantasma; y ≈ 1140 fin de la sección.
- La anatomía es **una sola columna apilada**: cintillo, titular, aviso, rejilla ancha de 3 tarjetas, botón. No hay dos columnas ni centrado vertical.
- Las tarjetas son grandes (375 px) y **casi vacías** bajo la foto: píldora + título y ~60 px de hueco; no hay fila de meta ni línea de detalle.
- **Defecto visible**: el botón "Ver campañas" tiene el texto **pegado al borde de la píldora** por los dos lados (zoom en `web_01_boton_zoom.png`). Causa verificada: `boton-fantasma` (`src/styles/_api.scss:254`) declara `padding-inline: espaciado(20)`, pero `20` **no existe** en `$escala-espaciado` (`_api.scss:46-56`: 4, 8, 12, 16, 24, 32, 48, 64, 96); `map.get` devuelve `null` y Sass **omite la declaración sin avisar**. El mismo `espaciado(20)` aparece en 16 sitios más (`Servicios.module.scss:45,51,65,69,70`, `Equipo.module.scss:49`, `InformacionContacto.module.scss:59,72`, `PaginaBlog.module.scss:70,80,86`, `PaginaCampanas.module.scss:67,84,90,96`, `PaginaTienda.module.scss:55`) — p. ej. en `dist` la píldora de Servicios sale como `margin: 16px 0` y por eso "Ver qué incluye" aparece pegado al borde izquierdo de las tarjetas de servicios en la misma captura.
- El aviso a todo el ancho (150 caracteres por línea) es ilegible como intro; en el prototipo el texto equivalente va a 52ch.
- No hay imágenes rotas, ni textos cortados, ni bloques vacíos; las tres fotos locales (`public/img/campanas/*.webp`, 800 × 450) cargan.

---

## Diferencias

| id | Qué cambia | Tipo | Prioridad |
| --- | --- | --- | --- |
| campanas-1 | La sección pasa de **una columna apilada** a **dos columnas** (`repeat(auto-fit, minmax(min(320px, 100%), 1fr))`, gap `espaciado(48)`, `align-items: center`): a la izquierda cintillo + h2 + aviso + CTA, a la derecha la rejilla de tarjetas. Hace falta un `<div>` envolvente de la columna izquierda. | estructura | alta |
| campanas-2 | La rejilla de tarjetas deja de ocupar todo el ancho en 3 columnas (375 px) y pasa a ser **compacta, anidada en la columna derecha**: `repeat(auto-fit, minmax(min(230px, 100%), 1fr))`, gap `espaciado(16)` → 2 columnas de ≈ 279 px, 3 tarjetas en 2 + 1 (la cuarta celda vacía, como en el prototipo). | estructura | alta |
| campanas-3 | El CTA "Ver campañas" pasa de botón **fantasma** a botón **primario relleno** (`@include boton-primario`: `--color-primario` / `--color-sobre-primario`, radio 999 px, 700) y se coloca en la columna izquierda, debajo del aviso, antes de las tarjetas en el DOM. | estilo | alta |
| campanas-4 | El botón fantasma actual no tiene relleno horizontal: `espaciado(20)` no existe en la escala y Sass descarta la declaración (`_api.scss:254`). Al pasar el CTA a `boton-primario` (`padding-inline: espaciado(24)`, válido) el defecto desaparece de **esta** sección; el bug de raíz sigue vivo en `_api.scss` y en los 16 usos listados arriba (fuera del ámbito de estos ficheros; lo debe planificar `craftsman_lead`). | bug | alta |
| campanas-5 | Cada tarjeta gana una **línea de detalle** bajo el título (`<p>`, `paso-tipografico(-1)`, `--color-texto-suave`). Sin precio: el único dato real disponible es el bloque de servicios de origen → texto "Bloque de servicios: Medicina general" / "…: Especialidades" (misma redacción que ya usa `PaginaCampanas.tsx:48`). Se omite si la campaña no declara `bloque`. | estructura | media |
| campanas-6 | Cuerpo de tarjeta: las tres piezas (píldora, h3, detalle) pasan a vivir en un `<div>` de cuerpo con `padding: espaciado(16)` y `gap: espaciado(4)` en columna, en vez de márgenes sueltos en `span`/`h3`. La fila de meta queda con la píldora sola (el texto de vigencia del prototipo no existe; se deja el hueco). | estructura | media |
| campanas-7 | El aviso de demo (que hace de texto intro) se limita a `max-width: 52ch` y queda en la columna izquierda; espaciados cintillo → h2 → aviso → CTA con `espaciado(12)` / `espaciado(24)` (prototipo 13 / 14 / 26 px). | estilo | media |
| campanas-8 | La rejilla `ul` pierde el `margin-block-end: espaciado(32)` (ya no hay nada debajo). | estilo | baja |
| campanas-9 | Radio de tarjeta: prototipo 16 px, web 24 px (`$radio-grande` del mixin `tarjeta`). Se **mantiene** el mixin (Decisión 24: no copiar valores; una sola familia de tarjeta en el sistema, @s47 la lee como única fuente). | estilo | baja |
| campanas-10 | Hover de tarjeta: prototipo `translateY(-3px)`, web solo cambio de sombra. Se mantiene el mixin (el movimiento solo se admite dentro de `prefers-reduced-motion: no-preference`, @s33 de identidad). | estilo | baja |
| campanas-11 | Tamaño del h2: prototipo `clamp(26px, 3.6vw, 40px)` (40 px), web `paso-tipografico(4)` (46 px). Se mantiene el paso 4 (es el titular de sección de la escala, @s20). | estilo | baja |
| campanas-12 | Relleno vertical: prototipo `clamp(56px, 8vw, 90px)` (90 px a 1280), web `clamp(56px, 6.2vw, 90px)` (79 px). Se mantiene el token (`@s19` lee el literal de `global.scss:52`). | estilo | baja |
| campanas-13 | Flecha decorativa "→" del CTA: no se dibuja (contrato @s12: no entra en el nombre accesible; el test comprueba `textContent`). Si se quisiera, solo vía `::after { content: "→" / ""; }` (texto alternativo vacío, fuera del nombre accesible). | estilo | baja |
| campanas-14 | Fondo de banda: prototipo `--bg-2` (alterno) tras un `#servicios` en `--bg`; web `--color-fondo` tras un `#servicios` alterno. Es una decisión de bandeado de **toda** la portada (`Landing.tsx` invierte la secuencia del prototipo desde servicios). No se toca aquí; si el delta de Servicios devuelve `#servicios` a `--color-fondo`, esta sección debe pasar a `--color-fondo-alterno` para no romper @s26 (nunca 3 seguidas iguales). | estilo | baja |
| campanas-15 | Píldora: prototipo 10 px / `4px 10px`; web mixin `pildora-etiqueta` 12,8 px / `4px 12px`. Se mantiene el mixin (una sola píldora en el sistema). | estilo | baja |
| campanas-16 | Textos: cintillo "Prevención" (web) frente a "Campañas" (prototipo); h2 "Campañas de prevención" frente a "Prevención a precio de campaña". Se mantienen los de la web: el h2 lo fija @s1 y el del prototipo afirma precio; el cintillo está anclado en el test @s33 y cambiarlo no aporta fidelidad visual. | dato | baja |

---

## Datos reales necesarios

| Pieza de la anatomía | Dato necesario | ¿Existe? | Alternativa honesta si no |
| --- | --- | --- | --- |
| Título de cada tarjeta | `titulo` | Sí: `CAMPANAS_DEMO` (`src/data/campanas.ts`), literales de `docs/datos-galapavet.md` §5 ("Vacunaciones", "Chequeo", "Odontología") | — |
| Foto 16/9 de cada tarjeta | `imagen` | Sí: `public/img/campanas/{vacunaciones,chequeo,odontologia}.webp`, 800 × 450, servidas en local (@s13) | Una campaña sin `imagen` sigue mostrando la tarjeta sin `<img>` (@s14) |
| Píldora de estado | estado | Solo "Demostración" (único valor admitido, @s3) | — |
| Texto junto a la píldora (vigencia en el prototipo) | vigencia | **No existe** y está prohibido (`docs/datos-galapavet.md` §7 "NO VERIFICABLE"; @s7, @s10 fallan cerrado) | **Dejar el hueco**: la fila de meta lleva solo la píldora. No se rellena con nada. |
| Línea de detalle (precio + nota en el prototipo) | precio, nota | **No existe** precio (§7, §9; @s6, @s9) | **Derivar de un dato real**: `bloque` de `CAMPANAS_DEMO` ("Medicina general", "Especialidades"), que `puntosDelBloque` garantiza que existe en `SERVICIOS`. Texto: "Bloque de servicios: <bloque>", igual que `PaginaCampanas.tsx:48`. Si `bloque` está ausente o en blanco, la línea se omite (dato ausente → no se pinta). |
| Texto intro de la columna izquierda | — | Sí: es el aviso literal de demo de @s4, que además es la descripción accesible de la región | — |
| Cintillo, titular, rótulo del CTA, destino | — | Sí, en el componente (`"Prevención"`, `"Campañas de prevención"`, `"Ver campañas"`, `hrefDeDestino('/campanas')`) | — |
| Número de tarjetas | — | 3 reales. La rejilla es 2 × 2 por geometría: **no se inventa una cuarta campaña** para llenar la celda | — |
| Fotos de banco como retrato | — | No aplica: las fotos son de acto clínico, no retratos del equipo (@s32) | — |

No hace falta ningún campo nuevo en `src/data/campanas.ts` ni en `src/lib/site.ts`.

---

## Conflictos con el contrato vigente

1. **No hay escenario aprobado para la anatomía de dos columnas de campañas en portada.** `rediseno_visual.feature` cubre servicios (@s31), equipo (@s32), reserva (@s34), galería (@s35) y la **página** de campañas (@s39), pero ninguna cláusula describe la disposición de esta sección de portada. Propuesta: **enmendar** `features/rediseno_visual.feature` (o `campanas_portada.feature`) con un escenario nuevo, redactado en el estilo de @s34: "Las campañas de la portada se presentan en dos columnas: a la izquierda cintillo, titular, el aviso de demostración y un enlace de acción primario; a la derecha una rejilla compacta de tarjetas con imagen, píldora, título y una línea de detalle derivada del bloque de servicios; ninguna tarjeta muestra precio ni vigencia; en una ventana estrecha las dos columnas se apilan". Pasa por la puerta de aprobación humana antes de tocar `src/`.
2. **`rediseno_visual` @s33** ("cada sección abre con su cintillo… por delante"): el Gherkin es compatible (el cintillo sigue precediendo al h2). Lo que choca es el **test**, no el escenario: `CampanasPortada.test.tsx:354` exige `region.firstElementChild === cintillo`, y con el `<div>` de columna izquierda el primer hijo de la región pasa a ser ese `<div>`. Propuesta: **respetar el escenario y enmendar la aserción** para que compruebe que el cintillo es el primer hijo del **mismo contenedor que el h2** (`encabezado.parentElement.firstElementChild === cintillo`), manteniendo la comprobación de orden con `compareDocumentPosition`. Precedente: `ReservaChat` (@s34) ya envuelve su columna en `> div:first-child`.
3. **`campanas_portada` @s12** (nombre accesible exacto "Ver campañas", sin "activas" ni "→"): respetar. Sin flecha en el texto.
4. **`campanas_portada` @s5** (el nombre accesible del enlace-tarjeta contiene el título y "Demostración"): compatible. Al meter la línea de detalle dentro del `<a>` (la tarjeta entera es el enlace, @s11) el nombre pasa a "Demostración Vacunaciones Bloque de servicios: Medicina general". Es más largo pero sigue siendo cierto y cumple "contiene". Se acepta; si el `judge` lo considera ruidoso, la alternativa es dejar el `<p>` fuera del `<a>` pero dentro del `<li>` (rompería "tarjeta entera es un enlace").
5. **`campanas_portada` @s6/@s7/@s8** (sin "€", "%", meses, "20xx", "Activa", "plazas", "descuento", "24 h"): la línea de detalle "Bloque de servicios: Medicina general | Especialidades" no contiene ninguna de esas cadenas. Respetar; el barrido del test ya cubre todo el `textContent` de la región.
6. **`campanas_portada` @s14** (campaña sin imagen sigue mostrando la tarjeta) y los catálogos de test sin `bloque`: la línea de detalle debe ser **opcional** (se omite cuando `bloque` está ausente o en blanco). Respetar.
7. **`rediseno_visual` @s19** (`padding-block: var(--ritmo-seccion-compacto);` literal y ningún `padding-block: espaciado(` en el `.module.scss`): respetar. Ojo: el cuerpo de la tarjeta debe usar `padding: espaciado(16)` (atajo), nunca `padding-block: espaciado(16)`, porque el test lee el texto del fichero entero.
8. **`rediseno_visual` @s26** (`tokens-aplicados.spec.ts`): localiza esta sección como `#servicios + *` y exige fondo no transparente. Respetar: la `<section>` sigue siendo hermana directa de `#servicios` (no se añade ningún envoltorio en `Landing.tsx`) y conserva su `background-color`.
9. **`rediseno_visual` @s30/@s31** (`imagenes.spec.ts`): cada `<img>` con `width`/`height`/`lazy`/`async` y con fondo `--color-fondo-alterno` **en el propio `<img>`**. Respetar: se mantiene `hueco-de-imagen(16, 9)` sobre el `img`, no sobre un `<div>` envolvente como hace el prototipo.
10. **`rediseno_visual` @s44/@s45** (`layout.spec.ts`): sin desborde a 320 px y un único ancho de contenedor. Respetar: `auto-fit` + `min(…, 100%)` en las dos rejillas; la sección conserva `@include contenedor` y `data-contenedor-principal`.
11. **`rediseno_visual` @s47** (`layout.spec.ts`, selector `section[data-contenedor-principal] > article`): no usar `<article>` como hijo directo de la sección (las tarjetas siguen siendo `li`).
12. **`rediseno_visual` @s48** (techo de CSS 8000 B comprimidos, medido 5791 B): el cambio añade ~15 reglas; verificar tras el build. Sin margen de conflicto previsto.
13. **`ensamblaje_landing` @s5** (todos los enlaces de la región → `/campanas`, sin id "campanas"): respetar; la línea de detalle no añade enlaces.
14. **Decisión 24** (`project-spec.md`, "no copiar valores del prototipo"): los gaps 14/44 px, el radio 16 px, la píldora de 10 px y el h3 de 17 px **no se portan**; se usan `espaciado(16)`, `espaciado(48)`, `$radio-grande`, `pildora-etiqueta` y `paso-tipografico(1)`.
15. **Bug transversal `espaciado(20)`** (campanas-4): arreglarlo toca `src/styles/_api.scss` y seis módulos ajenos a esta sección. Está **fuera** del ámbito de este delta; se propone que `craftsman_lead` lo planifique como lote propio con una puerta nueva (ver Plan, paso 8).

---

## Tests que romperán

### Unitarios (Vitest)

| Test | Motivo |
| --- | --- |
| `src/components/CampanasPortada.test.tsx` › `@s33 la sección abre con su cintillo en versalitas, delante del h2` › `el cintillo existe, precede al h2 y no es un encabezado` | `expect(region.firstElementChild).toBe(cintillo)` (línea 354): con la columna izquierda envuelta en un `<div>`, el primer hijo de la región es ese `<div>`. Hay que enmendar la aserción (conflicto 2). El resto del `it` (no es heading, precede al h2) sigue en verde. |
| `src/components/CampanasPortada.test.tsx` › `@s19 …` › `".campanasPortada" consume el token compacto y no un relleno fijo` | **Solo** si el nuevo SCSS escribe `padding-block: espaciado(` en cualquier sitio del fichero (p. ej. en el cuerpo de la tarjeta). Evitable con `padding: espaciado(16)`. |
| `src/components/CampanasPortada.test.tsx` › `@s33 …` › `".eyebrow" usa el mixin compartido…` | Solo si el bloque `.eyebrow { … }` añade `color:`, `text-transform:` o `letter-spacing:`. Evitable. |
| `src/imagenes-hrefDeDestino.test.ts` › `"CampanasPortada.tsx" llama a "hrefDeDestino" una segunda vez…` | Solo si al reescribir el `.tsx` se deja de resolver el `src` con `hrefDeDestino(` o quedan menos de 2 llamadas. Evitable. |
| `src/enlaces-internos-hrefDeDestino.test.ts` › `@s7 …` | Solo si el `href` deja de pasar por `hrefDeDestino(` o se concatena la base a mano. Evitable. |

Siguen en verde sin tocar: `@s1`-`@s18`, `@s21` de `CampanasPortada.test.tsx` (la región, los 3 `listitem`, los `heading` h3, `alt=""`, `presentation` × 3, "Ver campañas" → `/campanas`, catálogos sin imagen/sin título), `CampanasPortada-logica.test.ts` (no se toca `construirModeloCampanas`), `src/pages/Landing.test.tsx` @s5.

### E2E (Playwright, contra `dist/`)

Ninguno debería romper si se respetan los puntos 7-13 de Conflictos. Los que hay que **verificar** explícitamente tras el build:

| Test | Por qué mirarlo |
| --- | --- |
| `tests/e2e/tokens-aplicados.spec.ts` › `@s26 …` › `8 secciones (7 anclas + campañas sin ancla)…` | Lee el fondo de `#servicios + *`: la sección debe seguir siendo la hermana directa y pintar fondo. |
| `tests/e2e/imagenes.spec.ts` › `@s31 …` › `con "/img/" bloqueado, cada hueco mide alto > 0…` | El `<img>` conserva `aspect-ratio` y `--color-fondo-alterno`; si el hueco se moviera a un `<div>`, rompe. |
| `tests/e2e/layout.spec.ts` › `@s44 …` y `@s45 …` | Las dos rejillas nuevas no deben desbordar a 320 px; el ancho del primer `[data-contenedor-principal]` sigue en 1220. |
| `tests/e2e/css-presupuesto.spec.ts` › `@s49 …` › `la portada: suma de bytes…` | El CSS crece; comprobar que sigue ≤ 8000 B comprimidos. |
| `tests/e2e/accesibilidad.spec.ts` › `@s36`, `@s45` (axe × 5 variantes), `@s37` (área táctil) | El CTA primario (`--color-primario` / `--color-sobre-primario`) ya está validado en el Hero; el enlace-tarjeta con más texto no cambia el resultado. |
| `tests/e2e/datos-reales.spec.ts` › `@s49`, `@s52` | La línea de detalle no introduce literales del prototipo ni afirmaciones prohibidas. |
| `tests/e2e/rediseno-visual.spec.ts` › `Inicio: no desborda ni emite errores de consola` | Sin overflow a 1600 px con el nuevo grid. |

### Mutación

`bin\harness.ps1 mutate src/components/CampanasPortada-logica.ts`: la función nueva `lineaDeDetalle` debe quedar al 100 % (mutantes de literal de cadena, de condición y de `trim`).

---

## Plan de cambio

Orden pensado para TDD (rojo → verde → refactor) y para que la lógica quede mordible. Ficheros de producción: solo `src/components/CampanasPortada{-logica.ts,.tsx,.module.scss}`; tests: `CampanasPortada-logica.test.ts`, `CampanasPortada.test.tsx`.

0. **Puerta humana previa.** `craftsman_lead` añade el escenario de anatomía (conflicto 1) a `features/rediseno_visual.feature` y obtiene aprobación. Sin esto no se toca `src/`.

1. **`src/components/CampanasPortada-logica.test.ts`** (rojo). Nuevo `describe` para el escenario nuevo: `lineaDeDetalle`:
   - `{ titulo: 'Vacunaciones', bloque: 'Medicina general' }` → exactamente `'Bloque de servicios: Medicina general'`.
   - `{ titulo: 'Vacunaciones' }` → `undefined`.
   - `bloque: ''` y `bloque: '   '` → `undefined` (mata el mutante que quita el `trim` y el que invierte la comparación).
   - Comprobar que el resultado **no** contiene "€", "%" ni "plazas" (doble anclaje con @s6/@s8).

2. **`src/components/CampanasPortada-logica.ts`** (verde). Añadir, sin tocar `construirModeloCampanas`:
   ```ts
   const PREFIJO_DETALLE = 'Bloque de servicios: '
   export function lineaDeDetalle(campana: CampanaDemo): string | undefined {
     const bloque = campana.bloque?.trim() ?? ''
     return bloque === '' ? undefined : `${PREFIJO_DETALLE}${bloque}`
   }
   ```
   Nada de DOM aquí. Documentar en el JSDoc que el bloque es dato real derivado de `SERVICIOS` y que precio/vigencia siguen prohibidos.

3. **`src/components/CampanasPortada.test.tsx`** (rojo):
   - Enmendar `@s33` (línea 354): `expect(encabezado.parentElement?.firstElementChild).toBe(cintillo)` y `expect(cintillo.parentElement).toBe(encabezado.parentElement)`; conservar `compareDocumentPosition` y "no es heading".
   - Nuevo `describe` (escenario nuevo) sobre el DOM: la región tiene exactamente **2** hijos elemento; el primero contiene, en orden, el cintillo, el h2, el aviso (`#campanas-aviso-demostracion`) y el enlace "Ver campañas"; el segundo es el `<ul>`; el enlace "Ver campañas" precede en el DOM a la primera tarjeta.
   - Nuevo `describe` sobre la tarjeta: el `<a>` de "Vacunaciones" contiene, en orden, `img`, `span` "Demostración", `h3`, y un `<p>` con el texto exacto `Bloque de servicios: Medicina general`; con el catálogo `[{ titulo: 'Vacunaciones' }]` no existe ningún `<p>` dentro del `<a>` (extiende @s14); el `<a>` sigue siendo el único enlace del `li`.
   - Nuevo `describe` sobre el texto real del SCSS (`?raw`, patrón ya presente en el fichero): el bloque `.campanasPortada {` contiene `display: grid`, `align-items: center` y `repeat(auto-fit, minmax(min(320px, 100%), 1fr))`; el bloque `ul {` contiene `repeat(auto-fit, minmax(min(230px, 100%), 1fr))`; el fichero contiene `@include boton-primario;` y **no** contiene `boton-fantasma`; el aviso declara `max-width: 52ch`; el fichero sigue sin `padding-block: espaciado(`.

4. **`src/components/CampanasPortada.tsx`** (verde). DOM objetivo:
   ```
   section[aria-label][aria-describedby][data-contenedor-principal].campanasPortada
     div.presentacion
       p.eyebrow            "Prevención"
       h2                   "Campañas de prevención"
       p#campanas-aviso-demostracion   (aviso literal, sin cambios)
       a[href=hrefDeDestino('/campanas')]   "Ver campañas"
     ul
       li × N
         a[href=hrefDeDestino('/campanas')]
           img[alt=""][width=800][height=450][loading=lazy][decoding=async]  (si imagen)
           div.cuerpo
             span             "Demostración"
             h3               titulo
             p                lineaDeDetalle(campana)   (solo si !== undefined)
   ```
   Importar `lineaDeDetalle`; mantener `construirModeloSeguro`, `hrefDeDestino` para `href` y `src`, y `return null` con modelo vacío. Ningún literal nuevo de datos.

5. **`src/components/CampanasPortada.module.scss`** (verde). Sustituir el cuerpo actual por:
   - `.campanasPortada`: conservar `@include contenedor;`, `padding-block: var(--ritmo-seccion-compacto);`, `background-color: var(--color-fondo);`, `color: var(--color-texto);` y añadir `display: grid; grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr)); gap: espaciado(48); align-items: center;`.
   - `.presentacion` (hijo directo): `display: flex; flex-direction: column; align-items: flex-start;` con `.eyebrow { @include eyebrow; }`, `h2 { font-family: var(--fuente-titulares); font-size: paso-tipografico(4); margin-block-end: espaciado(12); }`, `> p:not(.eyebrow) { max-width: 52ch; color: var(--color-texto-suave); margin-block-end: espaciado(24); }`, `> a { @include boton-primario; }`.
   - `ul`: `display: grid; grid-template-columns: repeat(auto-fit, minmax(min(230px, 100%), 1fr)); gap: espaciado(16); margin: 0; padding: 0; list-style: none;`.
   - `li { @include tarjeta; }` y `li > a { @include foco-visible; display: flex; flex-direction: column; height: 100%; color: inherit; text-decoration: none; img { @include hueco-de-imagen(16, 9); } }`.
   - `.cuerpo`: `display: flex; flex-direction: column; align-items: flex-start; gap: espaciado(4); padding: espaciado(16);` (atajo `padding`, no `padding-block`), con `span { @include pildora-etiqueta; }`, `h3 { margin-block-start: espaciado(8); font-family: var(--fuente-titulares); font-size: paso-tipografico(1); }`, `p { margin: 0; font-size: paso-tipografico(-1); color: var(--color-texto-suave); }`.
   - Eliminar las reglas antiguas `> p`, `> a` (fantasma) y el `margin: 0 0 espaciado(32)` del `ul`. Ningún color literal (puerta `puertaLiteralesColor`), ninguna `transition` fuera de `prefers-reduced-motion` (las traen los mixins).
   - Actualizar el comentario de cabecera del fichero (por qué cablea su propio fondo y contenedor sigue siendo cierto).

6. **Verificación**: `bin\harness.ps1 test`; `pnpm build` + Playwright (`tests/e2e/tokens-aplicados`, `imagenes`, `layout`, `css-presupuesto`, `accesibilidad`, `datos-reales`, `rediseno-visual`); `bin\harness.ps1 mutate src/components/CampanasPortada-logica.ts` al 100 %. Capturar `dist/` a 1280 px y comparar con `diseno_02.png`: dos columnas, texto centrado verticalmente frente a la rejilla 2 + 1, CTA relleno, aviso a 52ch.

7. **`judge`** con este informe y el escenario nuevo como referencia; `progress/judge_campanas_fidelidad.md`.

8. **Lote aparte (fuera de estos ficheros, para `craftsman_lead`)**: bug `espaciado(20)` → `null`. Propuesta: (a) `src/styles/_api.scss:254` → `padding-inline: espaciado(24)` (o 16) y barrido de los 16 usos restantes a 16/24 según el caso; (b) puerta nueva en `src/lib/diseno/` (lógica pura, mutable): `pasosDeEspaciadoInvalidos(textoScss, escala)` que extraiga cada `espaciado(N)` de `src/**/*.scss` y devuelva los N fuera de `ESCALA_DE_ESPACIADO_PX`, con un test `?raw` sobre todos los `.module.scss` y `_api.scss` que exija lista vacía y recuento comprobado > 0. Mientras no se haga, el defecto seguirá visible en Servicios, Equipo, Contacto, Blog, Campañas (página) y Tienda.
