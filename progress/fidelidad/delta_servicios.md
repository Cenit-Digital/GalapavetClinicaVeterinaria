# Delta de fidelidad — sección «Servicios»

> Informe de convergencia visual de la sección `#servicios` de la portada
> contra el prototipo aprobado por el cliente
> (`docs/diseno-claude-design/Veterinaria La Sierra.dc.html`, líneas 142-181
> y `renderVals()` 719-729). Fecha: 03/09/2026. Escrito para que el
> `tdd_craftsman` implemente sin volver a abrir el prototipo.
>
> Fuentes leídas: el HTML del prototipo (sección `id="servicios"`, los
> tokens de `:root` en las líneas 18-46, el array `SERVICIOS` en 508-556 y
> `panel()` en 649-652), las capturas `shots/diseno_00.png`–`diseno_02.png`
> y `shots/web_00.png`–`web_01.png` a 1280 px, `src/components/Servicios.tsx`,
> `Servicios.module.scss`, `Servicios-logica.ts`, sus dos tests,
> `src/data/servicios.ts`, `docs/datos-galapavet.md` §5, `src/styles/_api.scss`,
> `_tokens.scss`, `global.scss`, `src/pages/Landing.tsx` + `.module.scss`, el
> CSS compilado real `dist/assets/index-*.css`, `features/servicios.feature`,
> `features/rediseno_visual.feature` (@s31, @s33, @s11, @s15, @s48),
> `features/identidad_visual.feature` (@s47) y los E2E de `tests/e2e/` que
> tocan la sección.
>
> Tabla de correspondencia de tokens usada en todo el informe (prototipo →
> sistema, `src/styles/_tokens.scss`): `--bg` → `--color-fondo` · `--bg-2` →
> `--color-fondo-alterno` · `--card` → `--color-superficie` · `--surface` →
> `--color-superficie-elevada` · `--border` → `--color-borde` · `--ink` →
> `--color-tinta` · `--text` → `--color-texto` · `--muted` →
> `--color-texto-suave` · `--primary` → `--color-primario` · `--accent-ink` →
> `--color-acento-tinta` · `--accent-soft` → `--color-acento-suave` ·
> `--shadow-sm` → `--sombra-reposo` · `--shadow` → `--sombra-elevada`.

## Anatomía del prototipo

### Sección (`<section id="servicios">`, VLS:142)

| Elemento | Valor literal del prototipo |
| --- | --- |
| `section` | `padding: clamp(64px, 9vw, 104px) clamp(18px, 5vw, 28px)`; `background: var(--bg)` (fondo **base**, no el alterno) |
| `div` contenedor | `max-width: 1220px; margin: 0 auto` |
| `p` cintillo (VLS:144) | texto **«Lo que hacemos»**; `font-size: 12px; letter-spacing: .22em; text-transform: uppercase; color: var(--accent-ink); font-weight: 700; margin: 0 0 13px`. Alineado a la **izquierda** |
| `h2` (VLS:145) | `font-family: 'Outfit'; font-size: clamp(28px, 4.2vw, 46px); line-height: 1.08; letter-spacing: -.015em; font-weight: 600; color: var(--ink); margin: 0; max-width: 20ch`. Contenido: `Servicios veterinarios <em style="font-style:normal;color:var(--primary)">de principio a fin</em>`. El `max-width: 20ch` fuerza **dos líneas**: «Servicios veterinarios» / «de principio a fin» (segunda línea en `--primary`). Alineado a la izquierda |
| `p` de apoyo (VLS:146) | `font-size: 17px; line-height: 1.7; color: var(--muted); max-width: 62ch; margin: 16px 0 0`. Contenido: «Doce especialidades bajo el mismo techo, con historia clínica compartida. Pulsa el `<strong style="color:var(--accent-ink)">+</strong>` de cada tarjeta para ver qué incluye exactamente.» |
| `div` rejilla (VLS:148) | `display: grid; grid-template-columns: repeat(auto-fit, minmax(min(310px, 100%), 1fr)); gap: 22px; margin-top: clamp(36px, 5vw, 54px)`. A 1280 px de ventana (contenedor 1220 − 2×28 = 1164 px útiles) da **3 columnas de ≈373 px**; el prototipo tiene 12 tarjetas → 4 filas completas de 3 |

No hay `@media` propio en la sección: la respuesta es toda por `auto-fit` +
`clamp()`.

### Tarjeta (`<article>`, VLS:150)

Orden del DOM de cada tarjeta, de arriba abajo: **foto con píldora superpuesta
→ cuerpo (h3, descripción, panel desplegable) → botón anclado al pie**. Nótese
que el panel va **antes** del botón: el botón es siempre lo último y queda
pegado al borde inferior.

| Elemento | Valor literal del prototipo |
| --- | --- |
| `article` | `display: flex; flex-direction: column; background: var(--card); border: 1px solid var(--border); border-radius: 20px; overflow: hidden; box-shadow: var(--shadow-sm); transition: transform .3s ease, box-shadow .3s ease`. Hover: `transform: translateY(-4px); box-shadow: var(--shadow)` |
| `div` zona de imagen (VLS:151) | `position: relative; aspect-ratio: 16/10; background: var(--bg-2); overflow: hidden` |
| `img` (VLS:152) | `display: block; width: 100%; height: 100%; object-fit: cover`; atributos `loading="lazy" width="800" height="500"` y `alt` descriptivo de la foto |
| `span` píldora (VLS:153) | **superpuesta sobre la foto**: `position: absolute; left: 14px; top: 14px; padding: 6px 12px; border-radius: 999px; background: var(--card)` (blanca, no acento-suave); `color: var(--accent-ink); font-size: 10.5px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase`. Texto: `s.cat` («Medicina», «Prevención», «Quirófano», «Diagnóstico», «Laboratorio», «Especialidad»…) |
| `div` cuerpo (VLS:155) | `display: flex; flex-direction: column; flex: 1; padding: 22px 22px 20px` |
| `h3` (VLS:156) | `font-family: 'Outfit'; font-size: 21px; font-weight: 600; line-height: 1.15; color: var(--ink); margin: 0`. Izquierda |
| `p` descripción (VLS:157) | `font-size: 14.5px; line-height: 1.65; color: var(--muted); margin: 9px 0 0`. Una frase de 1-2 líneas (`s.desc`) |
| `div` panel (VLS:159, `estiloPanel` = `panel()` VLS:649) | `overflow: hidden; max-height: 0 → 620px; opacity: 0 → 1; transition: max-height .3s ease, opacity .3s ease` (colapsa por CSS, dejando el contenido en el árbol: defecto de accesibilidad ya descartado por el contrato, ver `features/servicios.feature` nota 5) |
| `div` interior del panel (VLS:160) | `padding-top: 16px; margin-top: 16px; border-top: 1px solid var(--border)` → **línea separadora** entre la descripción y el desglose |
| `p` detalle (VLS:161) | `font-size: 14px; line-height: 1.7; color: var(--text); margin: 0 0 12px` (`s.detalle`, párrafo ampliado) |
| `ul` (VLS:162) | `list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px` |
| `li` (VLS:164) | `display: flex; align-items: flex-start; gap: 9px; font-size: 13.5px; color: var(--text)` |
| `span` marca ✓ (VLS:165) | `flex-shrink: 0; width: 17px; height: 17px; margin-top: 1px; border-radius: 50%; background: var(--accent-soft); color: var(--accent-ink); font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center`; contenido literal `✓` |
| `button` (VLS:172) | `display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; margin-top: auto; padding: 14px 4px 0; background: none; border: none; border-top: 1px solid var(--border); cursor: pointer; color: var(--accent-ink); font-size: 13.5px; font-weight: 700; text-align: left; min-height: 48px`; `aria-expanded` = abierto. Rótulo `s.rotuloBoton` = `'Ocultar detalle'` / `'Ver qué incluye'` a la **izquierda** |
| `span` «+» (VLS:174, `estiloMas` VLS:726-728) | a la **derecha** del botón: `flex-shrink: 0; width: 30px; height: 30px; border-radius: 50%; background: var(--accent-soft); color: var(--accent-ink); font-size: 19px; line-height: 1; display: flex; align-items: center; justify-content: center; transition: transform .3s ease; transform: rotate(45deg)` si abierto, `rotate(0deg)` si cerrado. Contenido literal `+` (un solo carácter; girado 45° se lee como ×) |

Lo que se ve en `diseno_00.png`/`diseno_01.png` a 1280 px: cintillo verde
«LO QUE HACEMOS» a la izquierda (y≈965), titular en dos líneas con la segunda
en azul, párrafo gris de dos líneas, y a partir de y≈1215 las tarjetas de
≈390 px con la foto arriba (píldora blanca en la esquina superior izquierda),
título, dos líneas de descripción, **línea fina**, y el pie «Ver qué incluye»
a la izquierda con el círculo verde claro «+» a la derecha. Los pies de las
tres tarjetas de cada fila están a la misma altura.

## Estado actual de la web

### DOM que pinta hoy `src/components/Servicios.tsx`

```
section.servicios[data-contenedor-principal]          ← ES la rejilla (grid)
  p.eyebrow           «Servicios»
  h2                  «Servicios»                     ← duplica el cintillo
  article.tarjeta ×5
    img (alt="", 800×500, lazy, /img/servicios/*.webp)
    span              categoríaDeServicio(titulo)     ← DEBAJO de la foto
    h3                titulo
    button[aria-expanded][aria-label]  rótulo          ← sin «+», sin línea
    ul > li ×N        (solo si abierto)                ← DESPUÉS del botón
```

El wrapper `<div id="servicios" class="seccionAlterna">` (`Landing.tsx:55`)
pinta el fondo `--color-fondo-alterno`, aplica `contenedor` (1220 px,
`padding-inline` 24 px) y `padding-block: var(--ritmo-seccion)` =
`clamp(72px, 7.2vw, 104px)` al `section`.

### Estilos que pinta hoy `Servicios.module.scss` (verificado sobre el CSS compilado `dist/assets/index-CCVUwotx.css`)

| Selector | Declarado en SCSS | Lo que **realmente** emite el build |
| --- | --- | --- |
| `.servicios` | `grid; repeat(auto-fit, minmax(min(280px,100%),1fr)); gap: espaciado(24)` | igual (24 px) |
| `.eyebrow` | `@include eyebrow` (12.8 px, `.12em`, `margin-block-end: 4px`, acento-tinta) + `grid-column: 1/-1` | igual |
| `h2` | `paso-tipografico(4)`; `margin-block-end: espaciado(8)` | igual. Distancia h2 → tarjetas = 8 + 24 (gap) = 32 px |
| `.tarjeta` | `@include tarjeta` (superficie, borde 1 px, radio 24 px, sombra reposo → elevada en hover) | igual |
| `.tarjeta img` | `hueco-de-imagen(8, 5)` | `aspect-ratio: 8/5` ✓ (= 16/10 del prototipo) |
| `.tarjeta > span` | `pildora-etiqueta` + `margin: espaciado(16) espaciado(20) 0` | **`margin: 16px 0`** |
| `.tarjeta h3` | `paso-tipografico(2)`; `margin: espaciado(8) espaciado(20) espaciado(12)` | **`margin: 8px 12px`** |
| `.tarjeta button` | `margin-block-start: auto; align-self: flex-start; padding-inline: 0; margin: 0 espaciado(20) espaciado(20)`; sin borde; 16 px heredados, peso 600 | **`margin: 0`** |
| `.tarjeta ul` | `margin: 0 espaciado(20) espaciado(20); padding-inline-start: espaciado(20)` | **`margin: 0`** y **sin `padding-inline-start`** (queda el de la hoja del navegador, 40 px, con viñetas) |

**Causa raíz (bug):** `espaciado(20)` **no es un paso de la escala**
(`_api.scss` §C: 4, 8, 12, 16, 24, 32, 48, 64, 96). `map.get` devuelve
`null`, Sass descarta el `null` de la lista y la declaración se compila con un
valor menos (o desaparece entera si era el único). Ninguna puerta lo detecta:
Sass no avisa, y el SCSS no tiene test que lea el CSS emitido. El mismo
`espaciado(20)` está en `Equipo.module.scss` (`.avatar { margin: espaciado(20)
espaciado(20) 0 }` → compila a `margin: 0`), fuera de esta sección.

### Lo que se ve en `web_00.png` / `web_01.png` (1280 px)

- y≈883: «SERVICIOS» en versalitas; y≈925: «Servicios» en 46 px. **Cintillo y
  titular dicen lo mismo**; el titular es de una línea, monocolor.
- **No hay párrafo de apoyo**: las tarjetas empiezan a y≈1003, a 32 px del h2.
- Tres tarjetas de ≈372 px con la foto arriba (16/10, correcta).
- La píldora («CIRUGÍA», «DIAGNÓSTICO», «MEDICINA», «ANÁLISIS»,
  «ESPECIALIDADES») está **debajo** de la foto, en fondo acento-suave, y
  **pegada al borde izquierdo de la tarjeta** (x=55 con la tarjeta empezando en
  x=54): sin margen horizontal por el bug de `espaciado(20)`.
- El h3 tiene 12 px de sangría (x=67) mientras la píldora y el botón tienen 0:
  las tres piezas del cuerpo **no comparten margen**.
- **No hay descripción** bajo el título.
- «Ver qué incluye» está **pegado al borde inferior e izquierdo** de la tarjeta
  (y≈1351 con el borde inferior de la tarjeta en y≈1362, x=55), en 16 px/600,
  **sin línea separadora, sin ancho completo y sin el círculo «+»**.
- Al desplegar (no capturado, pero verificado en el DOM y en el CSS): la
  lista aparece **después** del botón, con viñetas del navegador y 40 px de
  sangría, en `--color-texto-suave`.
- La segunda fila tiene 2 tarjetas y un hueco (5 bloques reales, 3 columnas).
- La sección va sobre `--color-fondo-alterno` (azul-gris) donde el prototipo
  la pinta sobre `--bg` (el bandeado de toda la landing está invertido
  respecto al prototipo: `Landing.tsx` alterna fondo → alterno → … y el
  prototipo alterna `--bg` → `--bg-2` → … empezando por `--bg` en Servicios).
  Es un asunto de `Landing.tsx`/`Landing.module.scss`, transversal a las 8
  secciones: se anota, no se resuelve aquí.
- El botón «Cambiar paleta de color» flota en la esquina superior derecha de
  la sección (y≈860): es `SelectorPaleta` (posicionado fijo), no un defecto
  de esta sección.

No hay imágenes rotas, textos desbordados ni bloques vacíos.

## Diferencias

| id | Qué cambia (web → prototipo) | Tipo | Prioridad |
| --- | --- | --- | --- |
| servicios-1 | Titular: «Servicios» en una línea y un color → titular de **dos líneas** con la segunda mitad en `--color-primario` (`<em>` con `font-style: normal`), `max-width: 20ch`, margen inferior 0 | estructura + dato | alta |
| servicios-2 | Falta el **párrafo de apoyo** bajo el h2 (17 px/1.7, `--muted`, 62ch, `margin-top: 16px`, con el «+» en `<strong>` acento-tinta) | estructura | alta |
| servicios-3 | Píldora de categoría **debajo** de la foto, fondo `--color-acento-suave`, y pegada al borde por el bug → **superpuesta** sobre la foto (`position: absolute; top/left 14px`), fondo `--color-superficie`, 10.5 px/.1em | estructura + bug | alta |
| servicios-4 | Falta la **descripción breve** bajo el h3 (14.5 px/1.65, `--muted`, `margin-top: 9px`) | estructura + dato | alta |
| servicios-5 | Pie de tarjeta: botón a la izquierda, sin separador, sin ancho completo, 16 px/600 → **ancho completo, `space-between`, `border-top: 1px var(--border)`, `padding-top: 14px`, `min-height: 48px`, 13.5 px/700**, anclado abajo con `margin-top: auto` (la cláusula «separado por una línea» de @s31 de `rediseno_visual.feature` **no se cumple hoy** y ningún test lo mide) | estructura + bug | alta |
| servicios-6 | Falta el **círculo «+»** a la derecha del botón (30 px, `--accent-soft`/`--accent-ink`, 19 px, gira 45° al abrir) | estructura | alta |
| servicios-7 | Desglose: `ul` con viñetas del navegador, 40 px de sangría, `--color-texto-suave`, **después** del botón → panel **entre la descripción y el botón**, con `border-top` 1 px + `padding-top`/`margin-top` 16 px, sin viñetas, `gap: 8px`, 13.5 px `--text`, marca **✓ en círculo** de 17 px `--accent-soft`/`--accent-ink` | estructura + bug | alta |
| servicios-8 | Cuerpo de tarjeta sin relleno uniforme (`espaciado(20)` → `null` → píldora 0, h3 12 px, botón 0) → cuerpo con `padding: 22px 22px 20px` (repo: `espaciado(24)`) en un único contenedor | bug | alta |
| servicios-9 | Cintillo «Servicios» (duplica el h2), 12.8 px/.12em, 4 px de margen → «**Lo que hacemos**», 12 px/.22em, 13 px de margen | dato + estilo | media |
| servicios-10 | Ritmo del encabezado: cintillo→h2 28 px, h2→tarjetas 32 px → cintillo→h2 13 px, h2→párrafo 16 px, párrafo→rejilla `clamp(36px, 5vw, 54px)` | estilo | media |
| servicios-11 | Hover de tarjeta: solo sube la sombra → sombra **y** `translateY(-4px)` (transición `transform .3s`) | estilo | baja |
| servicios-12 | Fondo de sección `--color-fondo-alterno` → `--color-fondo` (bandeado invertido en toda la landing; decisión transversal en `Landing.tsx`, fuera de este delta) | estilo | media (transversal) |
| servicios-13 | Rejilla 3 + 2 con hueco (5 bloques reales) frente a 4 × 3 del prototipo (12 inventados). Inherente al dato real: **no se cambia** | estructura | baja |
| servicios-14 | Radio 24 px (repo, `$radio-grande`) frente a 20 px; h3 25 px/1.08 (`paso-tipografico(2)`, anclado por @s20/@s22 de `geometria-escalas.spec.ts`) frente a 21 px/1.15; `minmax(280px)`/`gap 24` frente a `310`/`22` (mismas 3 columnas a 1220 y 1024); `--ritmo-seccion` frente a `clamp(64px,9vw,104px)`. Desviaciones de escala **declaradas y aceptadas** por `rediseno_visual.feature` («manda la escala del repo»): **no se cambian** | estilo | baja |
| servicios-15 | Píldora 12.8 px/.08em (mixin `pildora-etiqueta`) frente a 10.5 px/.1em: se conserva el mixin por coherencia con tienda/blog/campañas (paso `-2` = 10.24 px sería la alternativa más fiel) | estilo | baja |

## Datos reales necesarios

| Campo que pide la anatomía del prototipo | ¿Existe? | Dónde / alternativa honesta |
| --- | --- | --- |
| Título del bloque (`s.titulo`) | **Sí** | `SERVICIOS[n].titulo` (`src/data/servicios.ts`, 5 bloques literales de `docs/datos-galapavet.md` §5) |
| Píldora de categoría (`s.cat`) | **Sí (derivada)** | `categoriaDeServicio(titulo)` (`Servicios-logica.ts`), ya aprobada por @s31 de `rediseno_visual.feature`: primera palabra del título real |
| Foto + `alt` (`s.img`, `s.alt`) | **Sí** | `SERVICIOS[n].imagen` (`/img/servicios/*.webp`, locales). `alt=""` por contrato (@s19 de `servicios.feature`: el alt nunca afirma un servicio) — se mantiene |
| Lista «incluye» (`s.incluye`) | **Sí** | `SERVICIOS[n].puntos` (7 / 4 / 5 / 6 / 4 puntos literales) |
| Rótulo del botón (`s.rotuloBoton`) | **Sí** | `rotuloBoton(abierto)`: «Ver qué incluye» / «Ocultar detalle» |
| **Descripción breve** (`s.desc`) | **No** | El cliente no publica ninguna (`servicios.feature` nota 3). Alternativas honestas, por orden de preferencia: (a) **resumen derivado de los puntos publicados** — los 3 primeros puntos reales unidos por « · » y «…» si hay más (p. ej. «Cirugía de tejidos blandos · Esterilizaciones · Cirugía oncológica…»); da las 1-2 líneas de texto que la anatomía necesita sin afirmar nada nuevo; (b) **recuento derivado** («7 prestaciones publicadas»); (c) dejar el hueco. Nunca redactar una frase de marketing |
| **Párrafo de detalle** dentro del panel (`s.detalle`) | **No** | Dejar el hueco: el panel muestra solo la lista. No hay dato del que derivarlo |
| **Segunda mitad del titular** («de principio a fin») | **No** (copy del prototipo, promesa no verificable) | Derivar de la fuente única: `datosNegocio.direccion.localidad` → «Servicios veterinarios **en Galapagar**». Dos líneas, dato real, cero promesa. Si no se aprueba: titular de una línea «Servicios» (sin bicolor) |
| **Párrafo de apoyo** («Doce especialidades bajo el mismo techo, con historia clínica compartida») | **No** — «Doce especialidades» está prohibido por @s18 y «historia clínica compartida» no está publicado | Frase derivada del recuento real: `SERVICIOS.length` → «5 áreas de servicio, con el desglose que publica la clínica. Pulsa el **+** de cada tarjeta para ver qué incluye.» (singular/plural por función pura). Evita las frases de `AFIRMACIONES_PROHIBIDAS` (`tests/e2e/datos-reales.spec.ts:69-77`) |
| **Cintillo** («Lo que hacemos») | Texto neutro, no es un dato de negocio | Adoptable tal cual (igual que `Faq.module.scss` adopta el rótulo real del prototipo). Hoy el cintillo repite «Servicios» |
| Recuento de tarjetas (12) | **No** | Se respetan las **5** reales (@s50 de `rediseno_visual.feature`); la rejilla queda 3 + 2 |

## Conflictos con el contrato vigente

1. **`features/servicios.feature` @s1** — «encabezado de nivel 2 cuyo nombre
   accesible es "Servicios"». El titular bicolor de dos líneas exige otro
   texto. **Propuesta: enmendar** a «Servicios veterinarios en Galapagar»,
   donde «Galapagar» se deriva de `datosNegocio.direccion.localidad` (nunca
   retecleado), y fijar en el escenario que la segunda parte es la localidad
   real. Alternativa si el humano no aprueba: **respetar** (h2 «Servicios», sin
   bicolor) y dar por perdida servicios-1.
2. **`features/servicios.feature` @s3** — «el único texto de la tarjeta es su
   título y el rótulo de su botón» / «no muestra ninguna descripción breve».
   Ya está en tensión con `rediseno_visual.feature` @s31 (la píldora de
   categoría, que el test de @s3 acabó admitiendo). **Propuesta: enmendar**
   para admitir un resumen **derivado literalmente** de los puntos publicados
   (o del recuento), prohibiendo cualquier texto libre; el test de @s3 debe
   afirmar que el resumen es exactamente `resumenDeServicio(puntos)`. Si no se
   aprueba: **respetar** (sin descripción) y dar por perdida servicios-4.
3. **`features/servicios.feature` cabecera, notas 3 y 4** — «se suprimen la
   etiqueta de categoría, la descripción breve, el párrafo de detalle y la
   fotografía»; «queda prohibido "Doce especialidades bajo el mismo techo"».
   La foto y la píldora ya fueron reintroducidas por @s31 de
   `rediseno_visual.feature`. **Propuesta:** actualizar la nota con la
   derivación aprobada (píldora, resumen, párrafo de apoyo con recuento
   derivado) y mantener intacta la prohibición de «Doce especialidades» (@s18)
   y del párrafo de detalle.
4. **`rediseno_visual.feature` @s33** y su test en `Servicios.test.tsx`
   (`describe('@s33 …')`, primer `it`) — la feature exige «un rótulo corto en
   mayúsculas con espaciado entre letras», sin literal; el **test** ancla el
   literal «Servicios» y que sea `firstElementChild` de la sección.
   **Propuesta: enmendar el test** al literal «Lo que hacemos» (la feature no
   cambia). El segundo `it` (`.eyebrow` sin `color:`/`text-transform:`/
   `letter-spacing:`) se **respeta**: solo se añade `margin-block-end`.
5. **`servicios.feature` @s2, @s10, @s11, @s14** — el rótulo visible del botón
   es exactamente «Ver qué incluye»/«Ocultar detalle» y los tests leen
   `button.textContent`. **Se respeta**: el «+» se pinta como pseudoelemento
   `::after` (no entra en `textContent` ni en el nombre accesible, que ya fija
   `aria-label`), y el giro se ata a `[aria-expanded='true']::after` (estado en
   ARIA, nunca en clase: patrón del repo).
6. **`servicios.feature` @s4** — «el nombre accesible de cada elemento no
   incluye la marca de verificación». **Se respeta**: el ✓ es `li::before`
   con `content: '✓' / ''` (texto alternativo vacío; si Lightning CSS no lo
   conservara, `content: '✓'` a secas sigue sin entrar en `textContent`).
7. **`rediseno_visual.feature` @s31** — «el pie de la tarjeta lleva el control
   de desplegar, separado por una línea y anclado abajo». Hoy **no hay
   línea** y no hay test que lo exija. El cambio lo cumple; se añade test
   (ver plan, paso 7).
8. **`identidad_visual.feature` @s47** (`tests/e2e/layout.spec.ts`) — pies
   alineados por fila, medidos sobre `section[data-contenedor-principal] >
   article` y su `button`. **Se respeta**: `article` sigue siendo hijo directo
   del `section` (por eso el encabezado NO se envuelve en un `div` y la
   sección sigue siendo la rejilla), el botón conserva `margin-block-start:
   auto` y la rejilla no declara `align-items: start`.
9. **`sistema_de_diseno_visual.feature` @s33** (`movimientoRespetuoso.ts`) —
   toda `transition` nueva (`transform` del «+» y `translateY` de la tarjeta)
   va **dentro** de `@media (prefers-reduced-motion: no-preference)`.
10. **`rediseno_visual.feature` @s11** (`src/lib/diseno/matrizDeContraste.ts`)
    — pares nuevos que el cambio pinta y la matriz no declara:
    `primario` sobre `fondo-alterno` (el `<em>` del h2, uso «texto grande»:
    7.75 · 4.51 · 6.46 · 5.24 · 7.99 en clinica · calida · tech · eco · marca,
    todos ≥ 3) y `acento-tinta` sobre `fondo-alterno` (cintillo y `<strong>`
    del párrafo, uso «texto normal»: 4.88 · 6.36 · 10.82 · 7.34 · 4.97, todos
    ≥ 4.5 — hueco **ya existente**: los cintillos de Servicios y Equipo van
    hoy sobre `fondo-alterno` y la matriz solo declara `acento-tinta` sobre
    `fondo`). `acento-tinta`/`superficie` (píldora y botón),
    `acento-tinta`/`acento-suave` («+» y ✓), `texto`/`superficie` y
    `texto-suave`/`superficie` ya están declarados. Ratios calculados con la
    fórmula WCAG sobre los hexadecimales de `_tokens.scss`.
11. **`rediseno_visual.feature` @s48** (`css-presupuesto.spec.ts`, techo
    8000 B comprimidos, medido 5791 B) — el SCSS crece ≈1.2 KB sin comprimir
    (≈250-300 B gzip). Margen suficiente; se verifica en la puerta.
12. **`rediseno_visual.feature` @s15** — `--color-acento` a secas no se usa
    (todo va con `--color-acento-tinta`/`--color-acento-suave`). Sin conflicto.
13. **`servicios.feature` @s15** (bloque sin desglose: sin botón ni lista) —
    se respeta; la descripción derivada de un `puntos` vacío es `''` y no se
    pinta el `<p>`.

## Tests que romperán

Con el plan recomendado (pseudoelementos para «+» y ✓, píldora como primer
`span` de la tarjeta, `article` hijo directo del `section`):

**Unitarios (`src/components/Servicios.test.tsx`)** — solo si se aprueban las
enmiendas 1 y 4:

| Test | Por qué |
| --- | --- |
| helper `obtenerSeccionServicios()` → usado por `@s1` y `@s33` | `getByRole('heading', { level: 2, name: 'Servicios' })` es coincidencia **exacta**; con «Servicios veterinarios en Galapagar» no encuentra el h2. Cambiar el literal (o `name: /^Servicios veterinarios/`) |
| `@s33` primer `it` | `expect(cintillo.textContent).toBe('Servicios')` y `getAllByRole('heading', { level: 2, name: 'Servicios' })` → nuevos literales «Lo que hacemos» y el nuevo h2 |
| `@s17` | `queryByRole('heading', { level: 2, name: 'Servicios' })` sigue devolviendo `null` (nada se renderiza): **no rompe**, pero conviene actualizar el literal por coherencia |
| `@s3` | `toHaveTextContent` es de subcadena: **no rompe** con la descripción añadida; hay que **ampliarlo** para afirmar el resumen derivado (enmienda 2) |
| `@s31` | `tarjeta.querySelector('span')` debe seguir devolviendo la píldora: **no rompe** mientras la píldora sea el primer `span` del `article` y el botón no contenga ningún `span` |
| `@s2`, `@s10`, `@s11`, `@s14` | `button.textContent === 'Ver qué incluye'`: **no rompen** con `::after`. **Romperían** si el «+» se hiciera con `<span aria-hidden>+</span>` dentro del botón (`textContent` pasaría a «Ver qué incluye+») |
| `@s4` | `!nombre.includes('✓')`: **no rompe** con `li::before`; **rompería** con un `<span>✓</span>` dentro del `li` |
| `@s19` | 5 `img`, `alt=""`, `src` bajo `/img/servicios/`: **no rompe** |

`src/pages/Landing.test.tsx`, `src/App.test.tsx`, `Cabecera.test.tsx`,
`PieDePagina.test.tsx`, `Hero-logica.test.ts`: referencian «Servicios» como
**enlace** de navegación o etiqueta de cifra, no como h2 → **no rompen**.
`Servicios-logica.test.ts`: no rompe; se amplía.

**E2E (`tests/e2e/*.spec.ts`)** — ninguno rompe si se cumple el plan; los que
hay que **vigilar** al ejecutar la puerta:

| Test | Riesgo |
| --- | --- |
| `geometria-escalas.spec.ts` @s20 «el h2 de sección mide 28/46» y @s21/@s22 | usan `getByRole('heading', { level: 2 }).first()` = el h2 de Servicios; el `<em>` hereda tamaño, peso, tracking e interlineado → sigue en verde |
| `geometria-escalas.spec.ts` @s20 paso 2 (`#servicios article h3` = 25 px) | el h3 conserva `paso-tipografico(2)` → verde |
| `geometria-escalas.spec.ts` @s23 (`#servicios article span` primero = 999px; `#servicios article` = 24px) | la píldora sigue siendo el primer `span` y conserva `pildora-etiqueta` → verde |
| `geometria-escalas.spec.ts` @s24 (sombra reposo → elevada en hover) | el `translateY` no afecta a la medición del `box-shadow` → verde |
| `layout.spec.ts` @s47 | `section[data-contenedor-principal] > article` + `button`: verde mientras no se envuelvan las tarjetas |
| `movimiento.spec.ts` @s42 | la `ul` ahora precede al botón; `seccionServicios.locator('ul').first()` sigue visible; las transiciones nuevas quedan a 0.01 ms bajo `reduce` por `global.scss` → verde |
| `red-limpia.spec.ts` @s34, `rediseno-visual.spec.ts` (`#servicios img` = 5), `datos-reales.spec.ts` @s50 (`#servicios article` = 5) | sin cambio |
| `datos-reales.spec.ts` @s52 / @s49 | el párrafo de apoyo y el resumen no deben contener «24 h», «todos los días del año», «365», ni literales de la clínica ficticia → verde si se siguen las frases propuestas |
| `accesibilidad.spec.ts` @s36/@s45 (axe, 30 combinaciones) | `content` en `::after`/`::before` con `aria-label` en el botón no genera violación; verificar `aria-valid-attr-value` (no se añade `aria-controls`, a propósito: el panel no existe en el DOM cuando está plegado) |
| `css-presupuesto.spec.ts` @s49/@s48 | +≈300 B gzip sobre 5791 B, techo 8000 B → verde |
| `fidelidad.spec.ts` @s44 (320 px) | el h2 con `max-width: 20ch`, la píldora absoluta dentro de `overflow: hidden` y el botón al 100 % no desbordan → verde |
| `imagenes.spec.ts` @s31 de `identidad_visual` (hueco 8/5 con fondo alterno) | el `img` conserva `hueco-de-imagen(8, 5)` → verde |

## Plan de cambio

Orden de ejecución. Toda decisión o derivación va a `Servicios-logica.ts`
(mutada por Stryker al 100 %); el `.tsx` solo cablea; los valores de estilo
salen de `_api.scss`/`_tokens.scss` (nunca un número copiado del prototipo:
donde el prototipo no cae en la escala, manda la escala y se declara).

1. **Puerta humana (antes de tocar `src/`)** — aprobar las enmiendas 1, 2, 3
   y 4 de la sección anterior en `features/servicios.feature` (@s1, @s3,
   notas 3-4 de la cabecera) y anotarlas en
   `progress/rediseno/enmiendas_contrato.md`. Si se rechaza 1, el h2 se queda
   en «Servicios»; si se rechaza 2, no hay descripción; el resto del plan no
   depende de ellas.

2. **`src/components/Servicios-logica.ts`** — añadir, sin tocar las cinco
   funciones existentes:
   - `resumenDeServicio(puntos: readonly string[], maximo = 3): string` →
     `puntosVisibles(puntos)`, los `maximo` primeros unidos por `' · '`, más
     `'…'` si quedan más; `''` si no hay ninguno.
   - `fraseDeRecuento(recuento: number): string` → «1 área de servicio, con el
     desglose que publica la clínica.» / «N áreas de servicio, con el desglose
     que publica la clínica.» (singular exacto en 1).
   - `construirTitular(localidad: string): { principal: string; destacado: string }`
     → `{ principal: 'Servicios veterinarios', destacado: \`en ${localidad}\` }`
     (solo si se aprueba la enmienda 1).
   - Tests nuevos en `Servicios-logica.test.ts`, por valor, con literales a
     mano: los 5 resúmenes reales (p. ej. «Cirugía y anestesia» → «Cirugía de
     tejidos blandos · Esterilizaciones · Cirugía oncológica…»; «Diagnóstico de
     imagen» → «Servicios de radiología y ecografía propios · Ecografía ·
     Eco-cardiografía…»), `maximo` ≥ recuento (sin «…»), lista vacía (`''`),
     puntos en blanco descartados, `fraseDeRecuento(1)`/`(5)`/`(0)`, y
     `construirTitular('Galapagar')`. Cada mutante (`' · '` → `''`, `'…'`
     omitido, `maximo` ± 1, `>` ↔ `>=`) debe morir.

3. **`src/components/Servicios.tsx`** — nuevo DOM (la sección sigue siendo la
   rejilla y el cintillo su primer hijo; `article` sigue siendo hijo directo):

   ```
   section.servicios[data-contenedor-principal]
     p.eyebrow                 «Lo que hacemos»
     h2                        {principal} <em>{destacado}</em>      ← em con la localidad de datosNegocio
     p.apoyo                   {fraseDeRecuento(catalogo.length)} Pulsa el <strong>+</strong> de cada tarjeta para ver qué incluye.
     article.tarjeta ×N
       div.media
         img (sin cambios: hrefDeDestino(imagen), alt="", 800×500, lazy, async)
         span                  categoriaDeServicio(titulo)             ← sigue siendo el PRIMER span del article
       div.cuerpo
         h3                    titulo
         p                     resumenDeServicio(puntos)               ← solo si !== ''
         ul > li ×N            puntosVisibles(puntos)                  ← solo si conDesglose && abierto, ANTES del botón
         button[aria-expanded][aria-label]  rotuloBoton(abierto)       ← sin hijos; el «+» es ::after
   ```
   Importar `datosNegocio` de `../lib/site` para la localidad. Sin
   `aria-controls`. Ningún literal numérico ni de negocio en el `.tsx`.

4. **`src/components/Servicios.module.scss`** — reescribir el cuerpo de la
   tarjeta y el encabezado (valores exactos; comentar cada desviación):

   ```scss
   .servicios {
     display: grid;
     grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
     gap: espaciado(24);                       // prototipo 22; la rejilla también separa las filas del encabezado (24 frente a 13/16 del prototipo: se declara)

     .eyebrow { @include eyebrow; grid-column: 1 / -1; margin-block-end: 0; }   // sin color/text-transform/letter-spacing (@s33)
     h2 {
       grid-column: 1 / -1; font-family: var(--fuente-titulares); font-size: paso-tipografico(4);
       max-width: 20ch; margin-block-end: 0;                                     // 2 líneas como el prototipo
       em { font-style: normal; color: var(--color-primario); }                  // par nuevo en la matriz (paso 5)
     }
     .apoyo {
       grid-column: 1 / -1; max-width: 62ch; margin-block-end: espaciado(24);    // 24 + gap 24 = 48 ≈ clamp(36,5vw,54)
       font-size: paso-tipografico(0); line-height: 1.7; color: var(--color-texto-suave);   // prototipo 17px → 16px
       strong { color: var(--color-acento-tinta); font-weight: 700; }
     }
   }

   .tarjeta {
     @include tarjeta;                                                          // superficie, borde, radio 24 (prototipo 20), sombra reposo→elevada
     @media (prefers-reduced-motion: no-preference) { transition: box-shadow 300ms ease-out, transform 300ms ease-out; }
     &:hover { transform: translateY(-#{espaciado(4)}); }

     .media {
       position: relative; aspect-ratio: 8 / 5; background-color: var(--color-fondo-alterno); overflow: hidden;
       img { @include hueco-de-imagen(8, 5); }
       > span {
         @include pildora-etiqueta;
         position: absolute; inset-block-start: espaciado(16); inset-inline-start: espaciado(16);   // prototipo 14/14
         background-color: var(--color-superficie);                              // prototipo --card; acento-tinta/superficie ya está en la matriz
       }
     }

     .cuerpo {
       display: flex; flex-direction: column; flex: 1; padding: espaciado(24);   // prototipo 22 22 20; NUNCA espaciado(20): no existe
       h3 { font-family: var(--fuente-titulares); font-size: paso-tipografico(2); }   // 25px/1.08 anclados por @s20/@s22
       > p { margin-block-start: espaciado(8); font-size: paso-tipografico(0); line-height: 1.65; color: var(--color-texto-suave); }   // prototipo 14.5px/9px
       ul {
         display: flex; flex-direction: column; gap: espaciado(8); list-style: none;
         margin: espaciado(16) 0 0; padding: espaciado(16) 0 0;
         border-block-start: $ancho-borde-fino solid var(--color-borde);         // la línea del panel
         li {
           display: flex; align-items: flex-start; gap: espaciado(8); color: var(--color-texto);
           font-size: paso-tipografico(0); line-height: 1.5;                    // prototipo 13.5px
           &::before {
             content: '✓' / '';                                                  // sin nombre accesible (@s4)
             flex-shrink: 0; display: grid; place-items: center;
             width: espaciado(16); height: espaciado(16); margin-block-start: espaciado(4);   // prototipo 17px/1px
             border-radius: $radio-circulo; background-color: var(--color-acento-suave); color: var(--color-acento-tinta);
             font-size: paso-tipografico(-2); font-weight: 700; line-height: 1;  // prototipo 11px
           }
         }
       }
       button {
         @include foco-visible; @include area-tactil-minima;
         @include fila-de-accion-de-tarjeta;                                     // margin-top auto + padding-top 16 + border-top 1px (@s31, @s47)
         display: flex; align-items: center; justify-content: space-between; gap: espaciado(12);
         width: 100%; min-height: $altura-control-media;                          // 48px como el prototipo
         padding-inline: espaciado(4) 0; border-inline: none; border-block-end: none; background: none;
         color: var(--color-acento-tinta); font-size: paso-tipografico(-1); font-weight: 700;   // prototipo 13.5px → 12.8px
         text-align: start; cursor: pointer;
         &::after {
           content: '+' / '';                                                    // no entra en textContent ni en el nombre (aria-label)
           flex-shrink: 0; display: grid; place-items: center;
           width: espaciado(32); height: espaciado(32);                          // prototipo 30px
           border-radius: $radio-circulo; background-color: var(--color-acento-suave); color: var(--color-acento-tinta);
           font-size: paso-tipografico(1); font-weight: 400; line-height: 1;     // prototipo 19px
           @media (prefers-reduced-motion: no-preference) { transition: transform 300ms ease-out; }
         }
         &[aria-expanded='true']::after { transform: rotate(45deg); }            // estado en ARIA, nunca en clase
       }
     }
   }
   ```
   Retirar todas las llamadas a `espaciado(20)`. Mantener el comentario de
   cabecera del fichero (el wrapper de `Landing.module.scss` sigue poniendo
   fondo, contenedor y `padding-block`).

5. **`src/lib/diseno/matrizDeContraste.ts`** — añadir a la matriz real:
   `{ rol: 'primario', fondo: 'fondo-alterno', uso: 'texto grande' }` (em del
   h2, `Servicios.module.scss`) y `{ rol: 'acento-tinta', fondo:
   'fondo-alterno', uso: 'texto normal' }` (cintillo y `<strong>` sobre
   `.seccionAlterna`, hueco preexistente). Test: `matrizDeContraste.test.ts`
   ya recorre la matriz real contra las 5 variantes (@s11); confirmar que
   ningún `it` ancla el recuento total de pares reales y, si lo hace,
   actualizarlo con el literal nuevo escrito a mano.

6. **`src/components/Servicios.test.tsx`** — actualizar y ampliar (TDD:
   primero en rojo):
   - `obtenerSeccionServicios()`, `@s33` y `@s17`: nuevos literales
     («Lo que hacemos», «Servicios veterinarios en Galapagar»).
   - `@s1`/titular: el h2 contiene un `<em>` cuyo texto es exactamente
     `en Galapagar` (literal a mano) y el nombre accesible completo.
   - `@s3` (enmendado): el `<p>` de la tarjeta «Medicina general» es
     exactamente «Preventiva · Vacunaciones · Desparasitaciones…» y no hay
     ningún otro texto que no sea píldora, título, resumen y rótulo.
   - Párrafo de apoyo: existe un `<p>` con «5 áreas de servicio», contiene
     `<strong>+</strong>` y **no** contiene «Doce» ni «especialidades»; con un
     catálogo de 1 bloque dice «1 área de servicio».
   - Orden del pie: con la tarjeta desplegada, la `ul` **precede** al botón
     (`compareDocumentPosition`), y el botón sigue sin hijos elementales
     (`button.children.length === 0`, que es lo que protege @s2/@s10/@s11/@s14).
   - Lectura del SCSS real con `?raw` (mismo patrón que el `it` de `.eyebrow`):
     el bloque de `button` contiene `@include fila-de-accion-de-tarjeta;`,
     `width: 100%` y `[aria-expanded='true']::after`; el texto del fichero **no
     contiene** `espaciado(20)`; el bloque `.media > span` contiene
     `position: absolute`.
   - `@s15`/`@s16`/`@s19`/`@s31`: sin cambios (verificar que siguen en verde).

7. **E2E, `tests/e2e/rediseno-visual.spec.ts`** (ampliar el test de la
   portada, @s31 de `rediseno_visual.feature`, navegador real sobre `dist/`):
   `#servicios article button` → `border-top-width` = `1px`, `width` igual al
   ancho interior del `.cuerpo` (tolerancia 1 px), `y + height` a ≤ 25 px del
   borde inferior de la tarjeta; el rectángulo del primer `#servicios article
   span` queda **dentro** del rectángulo de su `img` (píldora superpuesta);
   tras pulsar el primer botón, la `ul` queda **por encima** del botón
   (`ul.y < button.y`); el pseudoelemento `::after` del botón computa
   `content` con «+» (`getComputedStyle(btn, '::after').content`).

8. **Puertas**: `bin\harness.ps1 test` → `pnpm build` → `pnpm run test:e2e`
   (todas las de la tabla anterior, con especial atención a @s45 axe ×30,
   @s47 alineación de pies, @s48/@s49 techo de CSS y @s52 afirmaciones) →
   `bin\harness.ps1 mutate` (100 % en `Servicios-logica.ts`) → `judge` →
   `progress/tdd_servicios.md` / `judge_servicios.md` / `mutation_servicios.md`.

9. **Fuera de este delta, pero detectado aquí (anotar para el lead):**
   `Equipo.module.scss` usa `espaciado(20)` en `.avatar` (compila a
   `margin: 0`); el bandeado de `Landing.tsx` está invertido respecto al
   prototipo (Servicios sobre alterno en vez de sobre fondo); y una puerta
   pura `pasosDeEspaciadoFueraDeEscala(textoScss)` en `src/lib/diseno/`
   (leyendo los 18 `.module.scss` con `?raw`, como `movimientoRespetuoso.ts`)
   evitaría que vuelva a colarse un paso inexistente en silencio.
