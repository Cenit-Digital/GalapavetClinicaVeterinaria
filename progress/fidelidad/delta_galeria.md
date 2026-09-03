# Delta de fidelidad — Galería

> Sección: `#galeria` de la portada. Prototipo: `docs/diseno-claude-design/Veterinaria La Sierra.dc.html` (`VLS`), líneas 317-343 (marcado), 580-590 (array `GALERIA`), 674-680 (`desplazarGaleria`), 18-25 (tokens del tema por defecto). Web: `src/components/Galeria.tsx`, `Galeria.module.scss`, `Galeria-logica.ts`, `src/data/galeria.ts`, `src/pages/Landing.tsx:64-66`, `Landing.module.scss:39-48`.
> Capturas a 1280 px: prototipo `shots/diseno_04.png` (galería entre y≈165 y y≈930); web `shots/web_02.png` (galería entre y≈865 y y≈1400). Recortes a tamaño real: `shots/diseno_galeria_crop.png`, `shots/web_galeria_crop.png`.
> Equivalencia de tokens prototipo → repo usada en todo el informe: `--bg`→`--color-fondo`, `--bg-2`→`--color-fondo-alterno`, `--card`→`--color-superficie`, `--border`→`--color-borde`, `--ink`→`--color-tinta`, `--muted`→`--color-texto-suave`, `--accent-ink`→`--color-acento-tinta`, `--primary`→`--color-primario`, `--shadow-sm`→`--sombra-reposo`, `'Outfit'`→`var(--fuente-titulares)`.

## Anatomía del prototipo

### DOM (VLS:317-343)

```
section#galeria[data-screen-label="Galería"]
├─ div (cabecera de sección, contenedor 1220)
│  ├─ div (bloque de texto, izquierda)
│  │  ├─ p      "Galería"                                   ← cintillo
│  │  ├─ h2     "Galería · Nuestros peludos"                ← titular
│  │  └─ p      "Pacientes reales que han pasado por…"      ← párrafo (PROHIBIDO por @s13, ver §5)
│  └─ div (controles, derecha)
│     ├─ button[aria-label="Foto anterior"]  "←"
│     └─ button[aria-label="Foto siguiente"] "→"
└─ div (pista, A SANGRE: sin max-width, ocupa todo el ancho de la ventana)
   └─ figure × 9 (array GALERIA; el hint-placeholder-count="5" es solo del editor)
      ├─ div (hueco 4/3)
      │  └─ img[loading=lazy]
      └─ figcaption
         ├─ span  nombre   (negrita, Outfit)
         └─ span  pie      (suave, pequeño)
```

### Estilos, valor a valor

**`section#galeria`** (VLS:317)
- `padding: clamp(64px, 9vw, 104px) 0` — relleno vertical fluido; **sin relleno horizontal** (la sección va de borde a borde, el contenedor lo aplica solo la cabecera).
- `background: var(--bg)` (#F8FAFC en el tema por defecto). Ojo: en el prototipo la galería va sobre `--bg` y las vecinas (`#reservar` VLS:254 y `#contacto` VLS:345) sobre `--bg-2`. Muestreo de píxel en `diseno_04.png` x=8: y=300 → `#F8FAFC` (galería), y=1000 → `#EDF2F9` (contacto).
- `overflow: hidden` — es lo que permite que la pista sangre por la derecha sin provocar desplazamiento horizontal del documento.

**Cabecera de sección** (`div`, VLS:318)
- `max-width: 1220px; margin: 0 auto; padding: 0 clamp(18px, 5vw, 28px)` → a 1280 px el texto arranca en x = 30 + 28 = **58 px** (coincide con la captura).
- `display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 18px` → texto a la izquierda, botones a la derecha, **alineados por la base** (los botones quedan a la altura de la última línea del párrafo, no del titular). Con `wrap`, en estrecho los botones bajan a una segunda fila, a la izquierda.

**Cintillo** (`p`, VLS:320)
- `font-size: 12px; letter-spacing: .22em; text-transform: uppercase; font-weight: 700; color: var(--accent-ink); margin: 0 0 13px`. Texto: "Galería". No es un encabezado.

**Titular** (`h2`, VLS:321)
- `font-family: 'Outfit'; font-size: clamp(28px, 4.2vw, 46px); line-height: 1.08; letter-spacing: -.015em; font-weight: 600; color: var(--ink); margin: 0`. A 1280 px: 4.2vw = 53.8 → **46 px**. Texto: "Galería · Nuestros peludos" (dos partes separadas por " · "; la segunda parte es copy del prototipo, ver §4).

**Párrafo de introducción** (`p`, VLS:322)
- `font-size: 16.5px; line-height: 1.7; color: var(--muted); max-width: 56ch; margin: 14px 0 0`. En la captura ocupa 2 líneas (x 58 → ≈ 690).

**Controles** (`div` VLS:324, `button` ×2 VLS:325-326)
- Contenedor: `display: flex; gap: 10px`.
- Cada botón: `width: 48px; height: 48px; border-radius: 50%; border: 1.5px solid var(--border); background: var(--card); color: var(--ink); font-size: 17px; cursor: pointer; transition: border-color .3s ease`; hover: `border-color: var(--primary)`. Glifos de texto "←" (U+2190) y "→" (U+2192). `aria-label` "Foto anterior" / "Foto siguiente".
- Posición medida a 1280 px: x 1116-1164 y 1174-1222 (borde derecho del contenido del contenedor = 1280 − 30 − 28 = 1222), y ≈ 370-418, es decir **arriba a la derecha, dentro de la cabecera, con la base alineada al párrafo**.

**Pista** (`div`, VLS:330)
- `display: flex; gap: 18px; margin-top: clamp(28px, 4vw, 42px)` (a 1280 px: 4vw = 51 → **42 px** de separación cabecera→pista).
- `padding: 6px clamp(18px, 5vw, 28px) 22px` → 6 px arriba y 22 px abajo para que la sombra de las tarjetas no quede recortada por el `overflow`; 28 px laterales a 1280.
- `overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -webkit-overflow-scrolling: touch`.
- **Sin `max-width`**: la pista mide el ancho de la ventana. A 1280 px caben 3 tarjetas enteras (0-360, 379-737, 757-1115) y la cuarta **queda cortada por el borde derecho de la ventana** (arranca en 1136).
- Defecto del propio prototipo, visible en la captura: la primera tarjeta arranca en **x = 0** aunque el HTML declara 28 px de relleno. Causa: `scroll-snap-type: x mandatory` sin `scroll-padding` obliga al navegador a alinear el inicio de la primera tarjeta con el borde del scrollport, "comiéndose" el relleno izquierdo. La web NO debe heredarlo: declarar `scroll-padding-inline-start` igual al relleno (ver §7).
- Sin `scroll-padding`, el paso de desplazamiento del JS es `ancho de tarjeta + 18` (VLS:678); con tarjeta no medible, 300 px inventados (VLS:678, ya descartado por `galeria.feature` @s10).

**Tarjeta** (`figure`, VLS:332)
- `flex: 0 0 clamp(240px, 32vw, 360px)` → a 1280 px: 32vw = 409.6 → **360 px**; a 320 px: 240 px.
- `margin: 0; scroll-snap-align: start`.
- `background: var(--card); border: 1px solid var(--border); border-radius: 20px; overflow: hidden; box-shadow: var(--shadow-sm)` → **la tarjeta es la caja redondeada con sombra; la foto va a sangre dentro** (sus esquinas superiores las recorta el `overflow: hidden` de la tarjeta, no un radio propio de la imagen).
- Altura medida a 1280 px: 340 px = 270 (imagen 4/3) + ≈ 70 (pie) + 2 (bordes).

**Hueco de imagen** (`div`, VLS:333) y **imagen** (`img`, VLS:334)
- `aspect-ratio: 4/3; background: var(--bg-2); overflow: hidden`.
- `img`: `display: block; width: 100%; height: 100%; object-fit: cover; transition: transform .3s ease`; hover: `transform: scale(1.05)`; `loading="lazy"`; `alt` propio por entrada ("Dos cachorros golden retriever en la hierba"…), distinto del nombre.

**Pie de tarjeta** (`figcaption`, VLS:336-339)
- `padding: 14px 16px 16px`.
- Nombre (`span`): `display: block; font-family: 'Outfit'; font-size: 16px; font-weight: 600; color: var(--ink)`.
- Pie (`span`): `display: block; font-size: 13px; color: var(--muted); margin-top: 3px`.
- Dos líneas apiladas dentro de la tarjeta; texto alineado a la izquierda.

**Tokens del tema por defecto** (VLS:18-25): `--bg #F8FAFC`, `--bg-2 #EDF2F9`, `--card #FFFFFF`, `--border rgba(15,32,60,.13)`, `--ink #0B1B33`, `--muted #5E6E88`, `--accent-ink #047857`, `--primary #1E40AF`, `--shadow-sm 0 6px 18px rgba(15,32,60,.07)`. Todos tienen su equivalente exacto en `src/styles/_tokens.scss:49-70` (variante `clinica`) salvo `--border`, que en el repo es opaco (`#DADEE3`).

**Breakpoints**: no hay `@media` en la sección; todo es fluido (`clamp`, `flex-wrap`, `vw`). Los únicos puntos de quiebre implícitos son 1276 px (a partir de ahí el contenedor de 1220 deja margen y la pista, que no lo tiene, arranca 30 px más a la izquierda que el texto) y el ancho en que texto + 106 px de botones ya no caben en una fila.

## Estado actual de la web

### DOM que pinta `Galeria.tsx` (líneas 50-84)

```
section[aria-label="Galería"][aria-describedby="galeria-aviso-demostracion"].galeria[data-contenedor-principal]
├─ p#galeria-aviso-demostracion   (aviso @s12, 2 líneas a todo el ancho)
├─ button[aria-label="Foto anterior"]  > span[aria-hidden] "‹"
├─ div[role=group][aria-label="Fotografías de la galería"][tabindex=0].pista
│  └─ figure × 6
│     ├─ img[alt=nombre][width=800][height=600][loading=lazy][decoding=async]
│     └─ figcaption  "{nombre} · {pie}"           (UNA sola cadena)
└─ button[aria-label="Foto siguiente"] > span[aria-hidden] "›"
```

Envoltorio en `Landing.tsx:64-66`: `<div id="galeria" className={styles.seccionAlterna}>` → `Landing.module.scss:39-48` pinta `background-color: var(--color-fondo-alterno)` (#EDF2F9) y aplica al hijo directo `contenedor` (`width: 100%; max-width: 1220px; margin-inline: auto; padding-inline: 24px`, `_api.scss:135-151`) + `padding-block: var(--ritmo-seccion)` (`clamp(72px, 7.2vw, 104px)`).

### Estilos (`Galeria.module.scss`, compilado en `dist/assets/index-*.css`)

- `.galeria`: `display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 16px`. `> p`: `grid-column: 1 / -1; color: var(--color-texto-suave)` (16 px, `line-height 1.5` del body). `> button`: mixin `boton-fantasma` (`inline-flex; min-height 48px; padding-inline 20px; border 1.5px solid var(--color-borde-control); border-radius 999px; background transparent; color var(--color-texto); font-weight 600`) con `padding-inline: 12px; font-size: 25px` (paso 2).
- `.pista`: `display: flex; gap: 16px; overflow-x: auto; min-width: 0; scroll-snap-type: x mandatory`, foco visible, `scroll-behavior: smooth` bajo `no-preference`.
- `.pista figure`: `flex: 0 0 clamp(240px, 32vw, 360px); margin: 0; scroll-snap-align: start`. **Sin fondo, sin borde, sin sombra, sin radio.**
- `.pista img`: `hueco-de-imagen(4, 3)` (`aspect-ratio 4/3; width 100%; height auto; background var(--color-fondo-alterno); object-fit cover; display block`) + `border-radius: 24px` → **el radio va en la foto, no en una tarjeta**.
- `.pista figcaption`: `font-size: 12.8px; color: var(--color-texto-suave); margin-block-start: 8px`.
- No hay cintillo, ni `h2`, ni párrafo de introducción distinto del aviso, ni cabecera en dos columnas, ni sangrado.

### Lo que se ve en `web_02.png` / `web_galeria_crop.png` (1280 px, variante `clinica`)

- Fondo de la sección `#EDF2F9` (alterno). Contenido acotado a 1220 px: texto en x = 54.
- Fila 1 (y ≈ 963-995): el aviso de demostración a 16 px suave ocupando las dos líneas completas del ancho del contenedor (1172 px). Es lo primero y lo único que "rotula" la sección: **no hay titular**, y la sección se lee como un pie de foto largo, no como una sección.
- Fila 2 (y ≈ 1020-1290): píldora "‹" de ≈ 36×48 px en x 52-88, centrada verticalmente respecto a las fotos; pista con 3 fotos de 360×270 con esquinas redondeadas de 24 px y **sin tarjeta**; la tercera foto queda **cortada en x ≈ 1176 por la píldora "›"** (x 1192-1228), que a su vez se pega al borde del contenedor. El sangrado que en el prototipo se produce por el borde de la ventana aquí lo produce un botón que tapa la foto.
- Pies (y ≈ 1307): una sola línea "Nala y Coco · Primera vacunación" a 12.8 px suave, fuera de la foto, sin jerarquía nombre/pie.
- Nada roto: las 6 imágenes locales cargan (`public/img/galeria/*.webp`, 800×600), no hay bloques vacíos ni texto desbordado. El aviso sí desborda en sentido de lectura: es más largo que la línea (2 líneas a 1172 px) porque no tiene `max-width`.
- Incoherencia interna: la separación CSS entre tarjetas es 16 px (`gap: espaciado(16)`) pero `SEPARACION_ENTRE_TARJETAS_PX = 18` en `Galeria-logica.ts:36`, así que el paso de `scrollBy` es 2 px mayor que "ancho + separación efectiva" (lo corrige el `snap`, pero viola la letra del contrato: cabecera de `galeria.feature`, PENDIENTE 3).

## Diferencias

| id | Qué cambia | Tipo | Prioridad |
| --- | --- | --- | --- |
| galeria-1 | Falta la cabecera de sección: cintillo `p` "Galería" (mixin `eyebrow`) + `h2` a `paso-tipografico(4)` / 600 / 1.08 / −.015em. Hoy la sección no tiene titular ni cintillo. | estructura | alta |
| galeria-2 | Los dos controles deben ir **dentro de la cabecera, arriba a la derecha, con la base alineada al párrafo** (`flex; justify-content: space-between; align-items: flex-end`), no flanqueando la pista a media altura. En el DOM pasan a preceder a la pista. | estructura | alta |
| galeria-3 | Botones: círculo de 48×48 (`$altura-control-media`, `$radio-circulo`), fondo `--color-superficie`, borde 1.5 px, color `--color-tinta`, gap 8 px entre ambos, flecha larga (← →) en vez de píldora 36×48 transparente con "‹ ›" a 25 px. El borde se mantiene en `--color-borde-control` (no en `--color-borde` como el prototipo) por SC 1.4.11, ver §5. | estilo | alta |
| galeria-4 | Cada `figure` pasa a ser una **tarjeta** (`@include tarjeta`: superficie + borde 1 px `--color-borde` + `$radio-grande` + `--sombra-reposo` + `overflow: hidden`) con la foto a sangre arriba y el pie dentro. Hoy la foto lleva el radio y no hay caja. | estructura | alta |
| galeria-5 | Pie de tarjeta en dos líneas dentro de la tarjeta: nombre en `var(--fuente-titulares)` 600 / `paso-tipografico(0)` / `--color-tinta` y pie en `paso-tipografico(-1)` / `--color-texto-suave` con 4 px de separación, relleno 12/16/16. Hoy es una sola cadena "nombre · pie" a 12.8 px fuera de la foto. | estructura | alta |
| galeria-6 | La pista sangra por el borde derecho **de la ventana**: la sección deja de estar acotada por `contenedor`; solo la cabecera lo está. Hoy la pista vive dentro de los 1220 px y la corta un botón. Requiere un modificador en el envoltorio de `Landing` (ver §7 paso 5 y riesgo sobre ids localizados). | estructura | alta |
| galeria-7 | El aviso de demostración (@s12, literal intocable) pasa a ocupar el hueco del párrafo de introducción de la cabecera: bajo el `h2`, `max-width: 56ch`, `line-height: 1.7`, `--color-texto-suave`, `margin-block-start: espaciado(12)`; deja de ser una primera fila a todo el ancho. | estructura | media |
| galeria-8 | `gap` CSS (16) y `SEPARACION_ENTRE_TARJETAS_PX` (18) no coinciden: el paso de `scrollBy` no es "ancho + separación efectiva". Igualar los dos lados (recomendado: `espaciado(16)` en CSS y `16` en la constante, o `18px` en ambos). | bug | media |
| galeria-9 | Relleno vertical de la pista `espaciado(8)` arriba / `espaciado(24)` abajo (prototipo 6/22) para que la sombra de reposo no quede recortada por `overflow-x: auto`. Sin esto, al añadir sombra (galeria-4) las tarjetas se ven "cortadas" por abajo. | estilo | media |
| galeria-10 | Separación cabecera → pista: `margin-block-start: espaciado(32)` (prototipo `clamp(28px,4vw,42px)`, 42 a 1280; desviación declarada por la rejilla de 8). Hoy 16 px de `gap`. | estilo | baja |
| galeria-11 | Alineación del primer naipe: `padding-inline-start` de la pista = borde de contenido del contenedor (`max(24px, (100% − 1220px) / 2 + 24px)`) y **`scroll-padding-inline-start` con el mismo valor** para que el `snap mandatory` no arrastre la primera tarjeta a x = 0 (defecto del prototipo que no se copia). | estilo | media |
| galeria-12 | Hueco de imagen con fondo `--color-fondo-alterno` mientras carga (ya lo da `hueco-de-imagen`) y `object-fit: cover` a 4/3 dentro de la tarjeta; el zoom 1.05 al pasar el puntero es opcional (si se pone, dentro de `@media (prefers-reduced-motion: no-preference)`). | estilo | baja |
| galeria-13 | Glifos de flecha: la fuente autoalojada `DM Sans` subconjunto `latin` NO incluye U+2190/U+2192 (sí U+2191/U+2193), así que "← →" caerían en Arial. Usar un `svg` inline `aria-hidden` (16×16, `stroke: currentColor`) o mantener "‹ ›" (U+2039/U+203A, sí en `latin`). | estilo | baja |
| galeria-14 | Barra de desplazamiento de la pista oculta (`scrollbar-width: none`) como en el prototipo. Opcional: la pista es focable y tiene controles, pero ocultarla resta descubribilidad en escritorio. | estilo | baja |
| galeria-15 | Fondo de banda: el prototipo pinta la galería sobre `--bg` (fondo) y la web sobre `--color-fondo-alterno`. Es la fase del bandeado global de `Landing.tsx`, no un defecto de esta sección; se anota, no se toca aquí (@s26 exige alternancia, no cuál). | estilo | baja |
| galeria-16 | Color del `h2`: el prototipo usa `--ink`; `global.scss:165-178` no fija color a los encabezados (heredan `--color-texto`) y ninguna sección lo sobrescribe. Seguir la convención global; si se cambia, hacerlo en `global.scss` para todas las secciones, no aquí. | estilo | baja |

## Datos reales necesarios

Anatomía → campo → dónde vive → qué hacer si no existe:

- **Nombre de la mascota (línea 1 del pie)** → `EntradaGaleria.nombre` (`src/data/galeria.ts:15`). Existe: 6 entradas de demostración ("Nala y Coco", "Bruno", "Luna", "Toby", "Milo", "Kira"). Son catálogo de demo bajo la Decisión 1(b) de `project-spec.md`; **no hay ninguna fotografía ni mascota real**: `docs/datos-galapavet.md` no contiene ni una línea sobre galería, pacientes o fotos (única aparición de "imagen": el servicio "Diagnóstico de imagen", línea 62). PENDIENTE del cliente (cabecera de `galeria.feature`, PENDIENTE 1 y 2).
- **Pie (línea 2)** → `EntradaGaleria.pie`. Existe (6 valores neutros: "Primera vacunación", "Revisión anual"…). No se copian los del prototipo ("9 semanas", "gato de 6 años", "−1,8 kg", "Peluquería y revisión de piel", "11 años"): llevan cifras y servicios no publicados (@s14).
- **Fotografía** → `EntradaGaleria.src` → `public/img/galeria/*.webp` (6 ficheros, 800×600, existen). Servidas en local (@s11, Decisión 9). Se sigue resolviendo con `hrefDeDestino` en el `.tsx` (`imagenes-hrefDeDestino.test.ts` @s19/@s20).
- **Texto alternativo por foto** → el prototipo lleva `alt` descriptivo distinto del nombre; `EntradaGaleria` **no tiene campo `alt`** y hoy `alt = nombre` (@s1 lo acepta: nombre accesible no vacío y único). Alternativa honesta: mantener `alt = nombre`. Si se añade un campo `alt`, debe describir la foto local real (lo que se ve en el `.webp`), no copiar el del prototipo (que describe otra foto), y seguir siendo único (@s1).
- **Cintillo** → literal "Galería" en el `.tsx` (misma práctica que `Servicios.tsx:56` "Servicios" y `Equipo.tsx:12` "Nuestro equipo"). No es dato de negocio.
- **Titular `h2` "Galería · …"** → la segunda parte del prototipo ("Nuestros peludos") atribuye las fotos a la clínica y es copy del prototipo: **no se copia** (límites del plan y @s13, tercera cláusula). Alternativa honesta que conserva la anatomía de dos partes: **"Galería · Fotografías de ejemplo"** (coherente con el aviso @s12). Alternativa mínima: "Galería" a secas. Cuando el cliente ceda fotos y consentimientos, el sufijo cambiará junto con el aviso. Decisión de copy a confirmar por el humano en el `.feature` (no es dato de negocio, pero es texto visible nuevo).
- **Párrafo de introducción** → el del prototipo ("Pacientes reales… con permiso de sus familias") está **prohibido literalmente** por @s13. Su hueco lo ocupa el aviso literal de @s12, que ya existe en `Galeria.tsx:57-61`.
- **Recuento de fichas** → `GALERIA.length` = 6 (nunca las 9 del prototipo; @s50 de `rediseno_visual` y `datos-reales.spec.ts:173-181` lo vigilan).
- **Rótulos de los botones** → "Foto anterior" / "Foto siguiente" (ya en el `.tsx`; interacción aprobada íntegra según la cabecera de `galeria.feature`).
- **Nada de `site.ts`** entra en esta sección: `src/lib/site.ts` no tiene campos de galería (comprobado con `grep`).

## Conflictos con el contrato vigente

- **`galeria.feature` @s4** ("la pista es alcanzable con el teclado"): el contrato NO exige que la pista sea la segunda parada del tabulador; sí lo asume el test (`Galeria.test.tsx:114-131`, dos `tab()` desde el inicio). Con los dos botones delante de la pista en el DOM (galeria-2), la segunda parada es "Foto siguiente". **Respetar el contrato, enmendar el test** (tres `tab()` o enfocar la pista directamente, como pide el `When` enmendado en la cabecera del `.feature`, "acotado a la pista"). El orden de foco resultante (anterior → siguiente → pista) coincide con el orden visual, así que `accesibilidad.feature` @s23 (orden de lectura) sigue cumpliéndose; `src/accesibilidad-teclado.test.tsx:29-52` deriva sus expectativas del DOM y no se rompe.
- **`galeria.feature` @s2 / @s17** ("cada figura muestra su nombre y su pie"): el contrato no fija el formato "nombre · pie". El test de @s17 (`Galeria.test.tsx:333-334`) busca la cadena exacta unida por " · ", que con nombre y pie en elementos separados (galeria-5) deja de existir. **Respetar el contrato, enmendar el test** (afirmar sobre `figure.textContent` o sobre los dos textos dentro de la figura).
- **`galeria.feature` cabecera, PENDIENTE 3** ("paso = ancho de tarjeta + separación efectiva, nunca un literal"): hoy se incumple (galeria-8). Cualquiera de las dos opciones lo repara; la de `espaciado(16)` respeta además la regla de `rediseno_visual.feature` (cabecera, "manda la escala del repo y la desviación se declara"). Si se elige 16, anotar en la cabecera de `galeria.feature` que la separación aprobada de 18 px se ha remedido a 16 px (el propio contrato lo preveía).
- **`galeria.feature` @s12 y @s13**: se respetan tal cual. El `h2` no puede contener "pacientes reales" ni "con permiso de sus familias" ni atribuir las fotos a Galapavet: por eso el sufijo del titular no puede ser el del prototipo.
- **`rediseno_visual.feature` @s33** (cintillo en versalitas en toda sección con titular): hoy la galería queda fuera por no tener titular; tras galeria-1 entra en el recuento y debe cumplir: `p` (no encabezado) antes del `h2`, `@include eyebrow;` sin `color:` propio (fondo de token, no fotografía). Respetar; añadir el test unitario espejo de `Equipo.test.tsx:300-333`.
- **`rediseno_visual.feature` @s35** (carrusel con anclaje y controles propios): se respeta íntegramente. Trampa de implementación: `Galeria.test.tsx:393-410` extrae el bloque literal `.pista {` del SCSS crudo y exige dentro `overflow-x`, `scroll-snap-type` **y `scroll-snap-align`**, y prohíbe el literal `flex-direction: column` dentro de ese bloque. Consecuencias: (a) la regla de la tarjeta debe quedar **anidada dentro de `.pista { … }`**; (b) la tarjeta debe usar `@include tarjeta;` (el `flex-direction: column` vive en el mixin, no en el texto del módulo) y no escribir `flex-direction: column` a mano.
- **`identidad_visual.feature` @s45 / `rediseno_visual.feature` @s17** (un único ancho de contenedor, 1220): la sección pasa a ser a sangre (galeria-6), así que `data-contenedor-principal` debe **moverse de `<section>` al `div` de cabecera**, que es el que mide 1220. Los E2E (`geometria-escalas.spec.ts:142-160`, `layout.spec.ts:42-60`) miden `.first()` de la portada (el Hero), así que no cambian de resultado, pero el atributo debe seguir siendo veraz.
- **`rediseno_visual.feature` @s44** (sin desbordamiento horizontal a 320 px): la pista a sangre no puede ensanchar el documento. Respetar con `overflow-x: clip` en el envoltorio `#galeria` (equivalente al `overflow: hidden` del prototipo, VLS:317, pero sin crear contenedor de scroll ni anular `scroll-margin-block-start`). `fidelidad.spec.ts:327-370` ya exceptúa a los descendientes de un contenedor con `overflow-x: auto`, y la pista en sí termina en el borde de la ventana, no más allá. **No** usar `100vw` con márgenes negativos (la barra de desplazamiento de Chromium desborda unos px y rompe `scrollWidth <= clientWidth`).
- **`identidad_visual.feature` @s7/@s8** (bordes que identifican un control ≥ 3:1; `--color-borde` es decorativo y "queda fuera a propósito", `matrizDeContraste.ts:334-338`): el prototipo bordea los botones con `--border` (rgba .13 → ≈1,3:1 sobre blanco). **Enmendar la fidelidad con justificación**: borde `--color-borde-control` (1.5 px), ya en la matriz para `fondo-alterno` (`matrizDeContraste.ts:371`). Tras el cambio, el botón tiene fondo `--color-superficie`, así que aparecen dos pares nuevos que la matriz no declara: `borde-control` sobre `superficie` y `foco` sobre `fondo-alterno` (el anillo, con `outline-offset` 2 px, tiene la banda por fuera y por dentro). Recomendado añadirlos a `MATRIZ_DE_USO_DEL_SISTEMA` (con cita de línea) y subir el literal `toHaveLength(21)` de `matrizDeContraste.test.ts:437`. Calculado a mano con los hex de `_tokens.scss`, los cinco temas aprueban ambos pares (mínimo 3,9:1 en `marca` para `borde-control` sobre `superficie`). El cintillo es `acento-tinta` sobre `fondo-alterno`, par que tampoco está en la matriz pero que Equipo y FAQ ya pintan: mismo hueco heredado, se anota.
- **`rediseno_visual.feature` @s48 / `identidad_visual.feature` @s49** (techo de CSS 8000 B comprimidos, `css-presupuesto.spec.ts:21`): el módulo crece (cabecera, controles, tarjeta ≈ +900 B sin comprimir). No hay medida reciente del margen: medir tras el primer `build` (riesgo, no conflicto).
- **`ensamblaje_landing.feature` @s3/@s4**: el `id` de ancla sigue en el envoltorio de `Landing.tsx`; el componente puede añadir ids propios no anclados (`galeria-titulo` para `aria-labelledby`, si se usa) sin tocar el contrato.
- **`identidad_visual.feature` @s42/@s43 (movimiento reducido)**: toda transición nueva (borde del botón, zoom opcional de la foto, sombra de la tarjeta) va dentro de `@media (prefers-reduced-motion: no-preference)`, como los mixins `tarjeta` y `boton-fantasma`. `movimiento.spec.ts:24-51` pulsa "Foto siguiente" con `reduce` activo y cuenta transiciones > 0,01 ms.

## Tests que romperán

Unitarios (`src/**`):

- `src/components/Galeria.test.tsx` — `@s4 … tabulando desde el principio del componente el foco llega a la pista` (líneas 114-131): con ambos botones antes de la pista, el segundo `tab()` cae en "Foto siguiente" y fallan `expect(pista?.tagName).not.toBe('BUTTON')` y `not.toBe(botón siguiente)`. Reescribir: tres `tab()` (anterior → siguiente → pista) o enfocar la pista directamente.
- `src/components/Galeria.test.tsx` — `@s17 … solo se muestran 2 figuras, con su nombre y su pie` (líneas 333-334): `getByText('Nala y Coco · Primera vacunación')` y `getByText('Bruno · Alta tras cirugía de rodilla')` no encuentran ningún nodo cuyo texto propio sea esa cadena (nombre y pie pasan a elementos distintos). Sustituir por `within(figura).getByText(nombre)` + `getByText(pie)`.
- `src/components/Galeria-logica.test.ts` — `SEPARACION_ENTRE_TARJETAS_PX … es exactamente 18 píxeles` (línea 12): solo si se elige alinear la constante a `espaciado(16)`; el literal pasa a `16`. Los tests @s5/@s6/@s7/@s8 de `Galeria.test.tsx` usan el símbolo y no se rompen.
- `src/components/Galeria.test.tsx` — `@s35 … la pista declara anclaje de desplazamiento` (líneas 405-410): se rompe **si** `scroll-snap-align` sale del bloque `.pista { }` al mover la regla de la figura a un selector de primer nivel (p. ej. `.tarjeta {}`). Se evita anidando la figura dentro de `.pista`. Idem `las fichas se disponen en una pista…` (401-402) si alguien escribe `flex-direction: column` literal dentro de `.pista`.
- `src/lib/diseno/matrizDeContraste.test.ts` — `expect(MATRIZ_DE_USO_DEL_SISTEMA).toHaveLength(21)` (línea 437): solo si se añaden las dos filas nuevas (→ 23). Las demás aserciones de ese fichero filtran por `fondo`/`rol` y no dependen del total (líneas 110-126, 194-208, 360-374: cuentan 5 variantes, no filas).
- No se rompen, pero hay que verificarlos en verde: `Galeria.test.tsx` @s1/@s2/@s3/@s12/@s13/@s14/@s15/@s16 (el `h2` nuevo no debe contener "pacientes reales" ni "con permiso de sus familias"; los botones no deben tener texto visible igual a su `aria-label`, cosa que un `svg aria-hidden` cumple), `src/imagenes-hrefDeDestino.test.ts` (@s19: `src={hrefDeDestino(` debe seguir en `Galeria.tsx`; @s20: `galeria.ts` no importa `hrefDeDestino`), `src/pages/Landing.test.tsx` @s3/@s4 (ningún id de ancla dentro de `Galeria`), `src/accesibilidad-teclado.test.tsx` @s23 (orden de foco = orden DOM, se autoajusta), `src/lib/diseno/datosDelSitio.test.ts` (recuento 6 vs 9 del prototipo), `src/test/setup.ts` (cualquier `console.warn` de React —p. ej. atributos SVG sin camelCase— pone el test en rojo).

E2E (`tests/e2e/`, contra `dist/`):

- `tests/e2e/fidelidad.spec.ts` — `@s44 … las 6 rutas a 320px: scrollWidth <= clientWidth y ningún elemento sobresale` (líneas 371-399): se rompe si el sangrado se hace con `100vw`/márgenes negativos o si el envoltorio `#galeria` no recorta (`overflow-x: clip`). Con la técnica del §7 pasa.
- `tests/e2e/movimiento.spec.ts` — `@s42 … 0 animaciones en curso, ninguna transición != 0.01ms` (líneas 9-80): se rompe si alguna transición nueva se declara fuera de `@media (prefers-reduced-motion: no-preference)` y sin cobertura del reset global. Sigue pulsando "Foto siguiente" por nombre accesible, que no cambia.
- `tests/e2e/css-presupuesto.spec.ts` — `@s49 … suma de bytes de hoja de estilo <= techo` (líneas 23-40): riesgo si el CSS comprimido supera 8000 B. Medir; si se supera, el techo es un trinquete que solo puede subirse con enmienda de @s48.
- `tests/e2e/geometria-escalas.spec.ts` — `@s17` y `tests/e2e/layout.spec.ts` — `@s45` (`[data-contenedor-principal].first()` = 1220): no cambian de resultado (el primero es el Hero), pero si el atributo se dejara en una `section` a sangre pasaría a ser falso; moverlo al `div` de cabecera.
- `tests/e2e/accesibilidad.spec.ts` — `@s36`/`@s45` (axe, 30 combinaciones), `@s37` (objetivos táctiles ≥ 24 px), `@s38`/`@s39` (anillo de foco vs fondo del control y vs superficie), `@s40` (control enfocado no tapado por la cabecera fija), `@s41` (jerarquía de encabezados, ahora con un `h2` más): deben seguir en verde; ninguno falla por diseño con el §7, pero son la red de seguridad del cambio de DOM.
- `tests/e2e/datos-reales.spec.ts` — `@s50` (`#galeria figure` = 6, ≠ 9): la ficha debe seguir siendo `<figure>` hija directa (o descendiente) de `#galeria`.
- `tests/e2e/imagenes.spec.ts` — `width+height en todas, lazy+async, CLS <= 0.1` y `relación declarada vs medida` (líneas 152-215): mantener `width=800 height=600`, `loading="lazy" decoding="async"` y un hueco 4/3 real (la caja medida de la `img` debe seguir siendo 4/3: si se envuelve en un `div` con `aspect-ratio`, la `img` va a `width: 100%; height: 100%`).
- `tests/e2e/tokens-aplicados.spec.ts` — `@s26` (fondos de `#galeria` computados, alternancia): no cambia mientras el envoltorio conserve `.seccionAlterna`.

## Plan de cambio

Orden TDD: cada paso escribe primero el test que lo cubre (en rojo), luego el mínimo de producción. Ningún dato nuevo entra en `src/data/*`.

1. **Preparación (sin código de producción).** Ejecutar `bin\harness.ps1 test`, `build` y `css-presupuesto.spec.ts` para anotar los bytes de CSS actuales y el margen hasta 8000 B. Leer `progress/judge_galeria.md` y `progress/rediseno/tdd_geometria-escalas.md` (quién retiró el `padding-block` de este módulo y por qué).

2. **`src/components/Galeria-logica.ts` + `Galeria-logica.test.ts` (galeria-8).** Decidir la separación efectiva. Opción recomendada: `SEPARACION_ENTRE_TARJETAS_PX = 16` (rejilla de 8) y en el test de apoyo `expect(SEPARACION_ENTRE_TARJETAS_PX).toBe(16)` escrito a mano; actualizar el comentario de las líneas 18-35 y anotar la remedición en la cabecera de `galeria.feature` (PENDIENTE 3). Opción alternativa: dejar 18 y declarar `gap: 18px` en `.pista` con comentario de desviación. No hace falta ninguna función pura nueva: la anatomía de la cabecera es estática y la única lógica de la sección (filtrado de entradas, cálculo del paso, preferencia de movimiento) ya vive en `-logica.ts` mordida al 100 %; mutación sin cambios más allá del literal.

3. **Tests nuevos en `src/components/Galeria.test.tsx`** (rojo antes del paso 4):
   - `@s33 (rediseno_visual) la galería abre con su cintillo`: hay un `p` con texto "Galería" (literal a mano) que precede al `h2` (`compareDocumentPosition`), no es `heading`; el bloque `.eyebrow { … }` del SCSS crudo contiene `@include eyebrow;` y ningún `color:` (patrón `Equipo.test.tsx:300-333`).
   - `el titular es un h2 de nivel 2 que empieza por "Galería" y no atribuye las fotos a la clínica`: `getByRole('heading', { level: 2, name: /^Galería/ })`; su texto no contiene "Nuestros peludos" ni "pacientes".
   - `los dos controles preceden a la pista y comparten contenedor`: ambos botones aparecen antes del `group` en el documento y `botonAnterior.parentElement === botonSiguiente.parentElement`.
   - `cada figura muestra el nombre y el pie en elementos propios dentro de la figura`: `within(figura).getByText(nombre)` y `getByText(pie)` son elementos distintos, ambos dentro del `figcaption`.
   - `el aviso de demostración es el párrafo de introducción de la cabecera`: el `p#galeria-aviso-demostracion` es descendiente del mismo contenedor que el `h2` y precede a los botones (además de seguir siendo `aria-describedby`, @s12).
   - SCSS crudo (patrón `Servicios.test.tsx:504-514`): dentro del bloque `.pista { }` la figura usa `@include tarjeta;` y `@include hueco-de-imagen(4, 3);` y declara `scroll-snap-align`; el bloque `.controles { }` declara `border-radius: $radio-circulo`, `width: $altura-control-media`, `height: $altura-control-media` y `background-color: var(--color-superficie)`; `.pista` declara `scroll-padding-inline-start`.
   - Reescribir @s4 (tres `tab()` o `pista.focus()`) y @s17 (sin la cadena unida por " · ").

4. **`src/components/Galeria.tsx` (galeria-1, -2, -3, -4, -5, -7, -13).** DOM objetivo:

   ```tsx
   <section aria-label="Galería" aria-describedby="galeria-aviso-demostracion" className={styles.galeria}>
     <div className={styles.encabezado} data-contenedor-principal>
       <div>
         <p className={styles.eyebrow}>Galería</p>
         <h2>Galería · Fotografías de ejemplo</h2>   {/* sufijo a confirmar por el humano; nunca el del prototipo */}
         <p id="galeria-aviso-demostracion">…literal @s12 sin tocar…</p>
       </div>
       <div className={styles.controles}>
         <button type="button" aria-label="Foto anterior" onClick={() => desplazar('anterior')}>
           <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M13 8H3m4-4-4 4 4 4" /></svg>
         </button>
         <button type="button" aria-label="Foto siguiente" onClick={() => desplazar('siguiente')}>
           <svg …><path d="M3 8h10M9 4l4 4-4 4" /></svg>
         </button>
       </div>
     </div>
     {/* comentario oxlint existente sobre role="group" + tabIndex, sin cambios */}
     <div ref={pistaRef} role="group" aria-label="Fotografías de la galería" tabIndex={0} className={styles.pista}>
       {validas.map((entrada) => (
         <figure key={entrada.nombre}>
           <img src={hrefDeDestino(entrada.src)} alt={entrada.nombre} width={800} height={600} loading="lazy" decoding="async" />
           <figcaption>
             <strong>{entrada.nombre}</strong>
             <span>{entrada.pie}</span>
           </figcaption>
         </figure>
       ))}
     </div>
   </section>
   ```
   Invariantes que no se tocan: guardián `validas.length === 0 → null` (@s15/@s17), `desplazar()` y `pista.querySelector('figure')` (la figura sigue siendo el ítem flex cuyo ancho se mide), `hrefDeDestino` en el `src`, `width/height` 800×600, el literal del aviso. Si se prefiere `aria-labelledby` al `aria-label`, el `h2` recibe `id="galeria-titulo"` (no es ancla) y el nombre de la región sigue conteniendo "Galería" (@s3).

5. **`src/pages/Landing.module.scss` + `Landing.tsx` (galeria-6).** Añadir un **modificador por clase** (no por id: CSS Modules localiza los ids, `dist/assets/index-*.css` contiene `#_inicio_1yq0o_1>*{…}`, regla muerta) y aplicarlo al envoltorio de la galería junto a `seccionAlterna`:

   ```scss
   // Sección con una pista a sangre: el contenedor lo aplica el propio hijo
   // a su cabecera; el envoltorio recorta en X para que nada ensanche el documento (@s44).
   .conPistaASangre {
     overflow-x: clip;
     > * { max-width: none; padding-inline: 0; }   // conserva padding-block: var(--ritmo-seccion)
   }
   ```
   `Landing.tsx:64`: `className={`${styles.seccionAlterna} ${styles.conPistaASangre}`}`. Declarar `.conPistaASangre` después de `.seccionAlterna` (misma especificidad, gana el orden). Test en `Landing.test.tsx`: el elemento `#galeria` tiene las dos clases del módulo importado (comparar contra `styles.*`, no contra literales: los CSS Modules están desactivados en Vitest) y ningún otro envoltorio lleva la segunda. Nota al margen para `craftsman_lead`: la regla `#inicio > *` de `Landing.module.scss:29-37` está muerta por el mismo motivo (el Hero se ve acotado a 1220 en `web_00.png`); arreglarlo con la misma clase queda fuera de este delta.

6. **`src/components/Galeria.module.scss`** (valores concretos; todos de la escala del repo, desviaciones respecto al prototipo declaradas en comentario):

   ```scss
   .galeria { display: block; }                                   // ya no es rejilla de 3 columnas

   .encabezado {
     @include contenedor;                                         // 1220 + 24 px laterales (prototipo: 28)
     display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between;
     gap: espaciado(16);                                          // prototipo 18

     > div:first-child {
       .eyebrow { @include eyebrow; }                             // 12.8px/.12em/700/acento-tinta (prototipo 12px/.22em)
       h2 { font-family: var(--fuente-titulares); font-size: paso-tipografico(4); }   // = clamp(28px,4.2vw,46px); 600/1.08/−.015em de global.scss
       > p:last-child { max-width: 56ch; margin-block-start: espaciado(12); line-height: 1.7; color: var(--color-texto-suave); }  // prototipo 14px/16.5px
     }
   }

   .controles {
     display: flex; gap: espaciado(8);                            // prototipo 10
     button {
       @include foco-visible; @include area-tactil-minima;
       display: inline-grid; place-items: center; padding: 0;
       width: $altura-control-media; height: $altura-control-media;   // 48×48 exactos
       border: $ancho-borde-control solid var(--color-borde-control);  // 1.5px; borde-control por SC 1.4.11 (prototipo --border)
       border-radius: $radio-circulo;
       background-color: var(--color-superficie); color: var(--color-tinta); cursor: pointer;
       @media (prefers-reduced-motion: no-preference) { transition: border-color 150ms ease-out; }
       &:hover { border-color: var(--color-primario); }
       svg { width: espaciado(16); height: espaciado(16); }
     }
   }

   .pista {
     display: flex; gap: espaciado(16);                           // = SEPARACION_ENTRE_TARJETAS_PX
     margin-block-start: espaciado(32);                           // prototipo clamp(28px,4vw,42px)
     padding-block: espaciado(8) espaciado(24);                   // prototipo 6/22: sitio para la sombra
     padding-inline-start: max(#{espaciado(24)}, calc((100% - #{$ancho-maximo-contenedor}) / 2 + #{espaciado(24)}));  // alinea con el texto de la cabecera
     padding-inline-end: espaciado(24);
     scroll-padding-inline-start: max(#{espaciado(24)}, calc((100% - #{$ancho-maximo-contenedor}) / 2 + #{espaciado(24)}));  // evita el defecto del prototipo (galeria-11)
     overflow-x: auto; min-width: 0; scroll-snap-type: x mandatory;
     @include foco-visible;
     @media (prefers-reduced-motion: no-preference) { scroll-behavior: smooth; }
     // scrollbar-width: none;  ← opcional (galeria-14)

     figure {                                                     // ANIDADA en .pista: @s35 extrae este bloque
       @include tarjeta;                                          // superficie + borde 1px --color-borde + $radio-grande (24; prototipo 20) + --sombra-reposo + overflow hidden
       flex: 0 0 clamp(240px, 32vw, 360px); margin: 0; scroll-snap-align: start;
       &:hover { box-shadow: var(--sombra-reposo); }             // el prototipo no eleva la ficha (mismo truco que ReservaChat.module.scss:58-60)
       img { @include hueco-de-imagen(4, 3); }                   // 4/3, fondo alterno, cover; SIN border-radius propio
       figcaption {
         padding: espaciado(12) espaciado(16) espaciado(16);     // prototipo 14/16/16
         strong { display: block; font-family: var(--fuente-titulares); font-size: paso-tipografico(0); font-weight: 600; color: var(--color-tinta); }
         span   { display: block; margin-block-start: espaciado(4); font-size: paso-tipografico(-1); color: var(--color-texto-suave); }  // prototipo 3px/13px
       }
     }
   }
   ```
   Retirar la rejilla `auto 1fr auto`, el `> button { @include boton-fantasma }` y el `border-radius` de la `img`. Actualizar los comentarios de cabecera del módulo (la explicación de la rejilla deja de ser cierta) y la cita `Galeria.module.scss:27-28` en `matrizDeContraste.ts:371`.

7. **`src/lib/diseno/matrizDeContraste.ts` + test (opcional, recomendado).** Añadir `{ rol: 'borde-control', fondo: 'superficie', uso: 'componente de interfaz o borde de foco' }` (cita `Galeria.module.scss` → `.controles button`) y `{ rol: 'foco', fondo: 'fondo-alterno', uso: 'componente de interfaz o borde de foco' }`; `matrizDeContraste.test.ts:437` → `toHaveLength(23)`. La puerta de contraste recalcula los cinco temas sola.

8. **E2E nuevo `tests/e2e/galeria-fidelidad.spec.ts`** (navegador real sobre `dist/`, 1440×900 y 320×640), que además cierra las cláusulas de `galeria.feature` @s9/@s10 que quedaron "fuera del gate":
   - la pista termina en el borde derecho de la ventana (`right` de la pista = `innerWidth` ± 1) y `document.scrollWidth <= clientWidth`;
   - el borde izquierdo de la primera `figure` coincide (± 1 px) con el borde izquierdo del contenido de `#galeria [data-contenedor-principal]`;
   - los botones miden 48×48, `border-radius` computado `50%`, y quedan por encima de la pista (`bottom` del botón < `top` de la pista);
   - cada `figure` tiene `box-shadow` con blur 18 y alfa 0,07 (`analizarSombra` de `geometria-escalas.spec.ts:100-110`) y `background-color` = `--color-superficie` resuelto;
   - `#galeria figure` = 6; el `h2` de `#galeria` existe y no contiene "pacientes";
   - con `scrollLeft = 0`, pulsar "Foto anterior" deja `scrollLeft = 0` y el botón habilitado (@s9); pulsar "Foto siguiente" (con `reducedMotion: 'reduce'` para que el salto sea instantáneo) incrementa `scrollLeft` exactamente en `ancho de la primera figura + gap computado` (@s5 físico);
   - a 320 px: ningún elemento sobresale (reutilizar `medirDesbordesPorLaDerecha` o duplicar su criterio).

9. **Verificación y cierre.** `bin\harness.ps1 test`, `build`, Playwright completo (en especial `fidelidad`, `movimiento`, `css-presupuesto`, `accesibilidad` ×30, `datos-reales`, `imagenes`), `bin\harness.ps1 mutate` sobre `Galeria-logica.ts` (100 %), y comparación visual a 1280 px contra `diseno_04.png`: cabecera con cintillo/titular/aviso a la izquierda y dos círculos a la derecha, 3 tarjetas blancas enteras y la cuarta cortada por el borde de la ventana, pie en dos líneas dentro de la tarjeta. Documentar en `progress/tdd_galeria_fidelidad.md` y en la cabecera de `galeria.feature` (separación remedida, sufijo del titular decidido por el humano).
