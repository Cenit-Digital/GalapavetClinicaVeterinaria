# Delta de fidelidad — sección FAQ («Preguntas frecuentes»)

> Análisis de convergencia visual entre el prototipo aprobado
> (`docs/diseno-claude-design/Veterinaria La Sierra.dc.html`, `<section id="faq">`,
> líneas 424-442) y la sección que hoy pinta `src/components/Faq.tsx` +
> `Faq.module.scss` dentro de `src/pages/Landing.tsx:70-72`. Fecha: 03/09/2026.
> Capturas a 1280 px: prototipo `shots/diseno_05.png` (FAQ entre y≈560 y y≈1290),
> web `shots/web_04.png` (FAQ entre y≈310 y y≈910). Todo lo que sigue está
> leído del HTML/SCSS real o medido sobre esas capturas; nada es «parecido a».

## Anatomía del prototipo

### Árbol DOM (`Veterinaria La Sierra.dc.html:424-442`)

```
section#faq[data-screen-label="FAQ"]
└─ div                       (contenedor estrecho: max-width 860px, centrado)
   ├─ div                    (cabecera: text-align center)
   │  ├─ p                   «FAQ»               (cintillo)
   │  └─ h2                  «Preguntas frecuentes»
   └─ div                    (lista: margin-top fluido + border-top 1px)
      └─ details[name="faq"] × N   (hint 5; el array real del prototipo tiene 6)
         ├─ summary          (flex: pregunta a la izquierda, «+» a la derecha)
         │  ├─ {{ f.pregunta }}
         │  └─ span          «+»  (círculo 30×30, acento suave / acento tinta)
         └─ p                {{ f.respuesta }}
```

- El acordeón es **excluyente por el atributo nativo `name="faq"`** de `<details>`
  (un solo panel abierto). En la web ese comportamiento ya vive en
  `button[aria-expanded]` + `siguienteIndiceAbierto` (@s7/@s8 de `faq.feature`)
  y **se conserva** (ver §5).
- No hay ninguna regla `details[open]`/`style-open` en todo el fichero (grep
  `open]`/`style-open`: 0 resultados): **el «+» es constante**, no rota ni
  cambia a «−» al abrir. El marcador nativo del `summary` se oculta con la regla
  global `summary::-webkit-details-marker{display:none}` (línea 56).

### Estilos, valor a valor (token del prototipo → token del sistema según `fidelidadPrototipo.ts:47-64`)

| Elemento | Propiedad | Valor del prototipo | A 1280 px | Token del sistema |
|---|---|---|---|---|
| `section#faq` | `padding` | `clamp(64px,9vw,104px) clamp(18px,5vw,28px)` | 104px / 28px | vertical: `--ritmo-seccion` (ya lo pone el wrapper); horizontal: contenedor (24px) |
| `section#faq` | `background` | `var(--bg)` | #F8FAFC | `--color-fondo` |
| `div` contenedor | `max-width` / `margin` | `860px` / `0 auto` | lista de x=210 a x=1070 (860px) | — (ancho propio de la sección, @s18) |
| `div` cabecera | `text-align` | `center` | cintillo y h2 centrados en x=640 | — |
| `p` cintillo | `font-size` / `letter-spacing` / `text-transform` / `font-weight` | `12px` / `.22em` / `uppercase` / `700` | «F A Q» muy espaciado, y≈670 | mixin `eyebrow` (12.8px / .12em / 700) |
| `p` cintillo | `color` / `margin` | `var(--accent-ink)` / `0 0 13px` | — | `--color-acento-tinta` |
| `h2` | `font-family` / `font-size` | `'Outfit'` / `clamp(28px,4.2vw,46px)` | 46px, y≈718 | `--fuente-titulares` / `paso-tipografico(4)` (idéntico) |
| `h2` | `line-height` / `letter-spacing` / `font-weight` / `color` / `margin` | `1.08` / `-.015em` / `600` / `var(--ink)` / `0` | — | `global.scss:176-178` ya da 1.08 / -.015em / 600; color → `--color-tinta` |
| `div` lista | `margin-top` | `clamp(28px,4vw,40px)` | 40px (h2 termina en y≈743, línea en y≈783) | — |
| `div` lista | `border-top` | `1px solid var(--border)` | línea superior visible en y≈783 | `$ancho-borde-fino solid var(--color-borde)` |
| `details` | `border-bottom` | `1px solid var(--border)` | divisorias en y≈853, 924, 995, 1066, 1137, 1208 | idem |
| `summary` | `display` / `align-items` / `justify-content` / `gap` | `flex` / `center` / `space-between` / `20px` | pregunta pegada a la izquierda, «+» a la derecha | — |
| `summary` | `padding` / `min-height` / `cursor` / `list-style` | `20px 4px` / `48px` / `pointer` / `none` | **paso de fila = 20+30+20+1 = 71px** (medido) | `$altura-control-media` = 48px |
| `summary` | `color` / `font-family` / `font-size` / `font-weight` | `var(--ink)` / `'Outfit'` / `clamp(16px,2.1vw,19px)` / `500` | 19px (máximo desde 905px de ventana) | `--color-tinta` / `--fuente-titulares` |
| `span` «+» | `width` / `height` / `border-radius` / `flex-shrink` | `30px` / `30px` / `50%` / `0` | círculo con borde derecho en x≈1066 (= 1070 − 4px de padding) | `$radio-circulo` |
| `span` «+» | `background` / `color` / `font-size` / `line-height` / `display` | `var(--accent-soft)` / `var(--accent-ink)` / `19px` / `1` / `flex` centrado | «+» centrado | `--color-acento-suave` / `--color-acento-tinta` (par ya en la matriz, `matrizDeContraste.ts:365`) |
| `p` respuesta | `margin` / `padding` / `max-width` | `0` / `0 4px 24px` / `70ch` | — | `espaciado(4)` / `espaciado(24)` |
| `p` respuesta | `color` / `line-height` / `font-size` | `var(--text)` / `1.75` / `15.5px` | — | `--color-texto` |

- **Breakpoints:** ninguno propio de la sección; toda la fluidez es por `clamp()`.
  A 320 px: padding lateral 18px → contenido de 284px; h2 28px; pregunta 16px;
  «+» sigue en 30px (`flex-shrink:0`).
- **Sombras:** ninguna en esta sección. **Radios:** solo el círculo del «+».
- **Contexto de bandas** (líneas 345, 424, 443): la sección anterior (`#contacto`)
  pinta `--bg-2`, FAQ pinta `--bg`, y el `footer` que sigue pinta `--card` con
  `border-top: 1px solid var(--border)`.

## Estado actual de la web

### Árbol DOM que pinta hoy (`Landing.tsx:70-72` + `Faq.tsx:76-97`)

```
div#faq.seccionAlterna                         (wrapper: fondo alterno, banda a sangre)
└─ section.faq[aria-label="Preguntas frecuentes"][data-contenedor-principal]
   ├─ p.eyebrow          «FAQ»
   ├─ h2                 «Preguntas frecuentes»
   └─ (React.Fragment) × 5
      ├─ button[type=button][aria-expanded][aria-controls=faq-respuesta-N]   {pregunta}
      └─ section#faq-respuesta-N[aria-label=pregunta]   (solo cuando está abierta)
```

No existe ningún envoltorio interior de 860px, ningún envoltorio de cabecera,
ningún envoltorio por entrada y **ningún indicador «+»**.

### Estilos que se aplican de verdad

- **Wrapper** (`Landing.module.scss:39-48`, `.seccionAlterna`): `background-color:
  var(--color-fondo-alterno)` (#EDF2F9 en «clinica»), `color: var(--color-texto)`;
  y sobre su hijo directo (la `section`): `@include contenedor` → `width: 100%;
  max-width: 1220px; margin-inline: auto; padding-inline: 24px` +
  `padding-block: var(--ritmo-seccion)` (= `clamp(72px, 7.2vw, 104px)`).
- **`.faq { max-width: 860px }`** (`Faq.module.scss:11-12`): **declaración muerta**.
  `.faq` y `.seccionAlterna > *` tienen la misma especificidad (0,1,0) y en el
  bundle real (`dist/assets/index-CCVUwotx.css`) la regla del wrapper va DESPUÉS
  (`._faq_1n2b4_1{max-width:860px}` en el byte 12991;
  `._seccionAlterna_1yq0o_23>*{…max-width:1220px…}` en el byte 33382), así que
  gana 1220px. **Medido en la captura:** las divisorias van de x=54 a x=1226 →
  **1172px de lista** (1220 − 2×24), no 860. El test unitario de @s18
  (`Faq.test.tsx:333-349`) lee el texto del SCSS y aprueba un valor que el
  navegador nunca pinta.
- **Cintillo** (`.eyebrow`, mixin `_api.scss:326-334`): `display:block; margin-block-end: 4px;
  font-size: 12.8px; font-weight: 700; letter-spacing: .12em; uppercase; color:
  var(--color-acento-tinta)`. **Alineado a la izquierda** (x=54, y≈413).
- **h2**: `font-family: var(--fuente-titulares); font-size: paso-tipografico(4)`
  (= el mismo `clamp(28px,4.2vw,46px)`), `margin-block-end: 24px`. **Color heredado
  del wrapper: `--color-texto` (#3C4C66)**, no `--color-tinta` — en la captura se ve
  pizarra, no tinta. Alineado a la izquierda (y≈453).
- **Botón de pregunta** (`Faq.module.scss:25-52`): `display:flex; justify-content:
  space-between` (sin segundo hijo: no hay nada a la derecha), `width: 100%;
  text-align: start; gap: 16px; padding-block: 16px` (padding-inline 0),
  `font-size: 20px` (paso 1), `font-weight: 600`, familia **heredada = DM Sans**
  (`--fuente-texto`, vía `button { font: inherit }` de `global.scss`), `color: inherit`
  (= `--color-texto`), `border-block-end: 1px solid var(--color-borde)`, sin borde
  superior en la lista, `min-width/min-height: 24px`, `:hover { padding-inline-start:
  8px }` con `transition: padding-inline-start 150ms ease-out` dentro de
  `prefers-reduced-motion: no-preference`. **Paso de fila = 16+30+16+1 = 63px**
  (divisorias medidas en y≈563, 626, 689, 752, 815).
- **Región de respuesta** (`section`, `Faq.module.scss:55-60`): `max-width: 70ch;
  padding-block: 16px; color: var(--color-texto-suave); line-height: 1.7`,
  `font-size` heredado 16px. Como el borde está en el botón y no en un envoltorio
  de la entrada, **la respuesta se pinta DEBAJO de la divisoria**, entre la línea
  y la pregunta siguiente (en el prototipo queda encima de la línea, dentro del
  `<details>`).

### Lo que se ve en la captura (`web_04.png`, 1280 px)

- Banda azulada (`--color-fondo-alterno`) donde el prototipo pinta `--bg`
  (la cadena de bandas de la portada está invertida desde Servicios; ver faq-10).
- Cintillo y titular pegados al margen izquierdo; titular en color pizarra.
- Lista a todo el ancho del contenedor (1172px), sin línea superior, sin ningún
  botón «+»: las filas son texto suelto sobre divisorias.
- Cinco preguntas (las reales del contrato) frente a seis del prototipo.
- **Nada cortado, nada desbordado, ninguna imagen (no las hay), ningún bloque
  vacío.** Los defectos son de maquetación, no de rotura.

## Diferencias

| id | Qué cambia | Tipo | Prioridad |
|---|---|---|---|
| faq-1 | Cintillo «FAQ» y titular **centrados** dentro de un envoltorio de cabecera (`text-align: center`); hoy alineados a la izquierda. | estructura | alta |
| faq-2 | **Ancho máximo de 860px efectivo y centrado** (envoltorio interior con `margin-inline: auto`); hoy `.faq{max-width:860px}` está muerta en la cascada y la lista mide 1172px. | bug | alta |
| faq-3 | **Botón redondo «+» a la derecha de cada pregunta**: 30×30 (≈`espaciado(32)`), `$radio-circulo`, relleno `--color-acento-suave`, glifo `--color-acento-tinta` 19px (`paso-tipografico(1)`), `flex-shrink: 0`, decorativo (`aria-hidden`, sin nodo de texto). Hoy no existe. | estructura | alta |
| faq-4 | **Línea superior de la lista** (`border-block-start: 1px solid var(--color-borde)`) y divisoria por **entrada** (envoltorio que agrupa botón + respuesta), no por botón; así la respuesta abierta queda encima de su divisoria como en el prototipo. | estructura | media |
| faq-5 | Tipografía de la pregunta: **Outfit (`--fuente-titulares`), peso 500, `clamp(16px,2.1vw,19px)`, color `--color-tinta`**; hoy DM Sans, 600, 20px, `--color-texto`. El h2 también pasa a `--color-tinta`. | estilo | media |
| faq-6 | Geometría de fila: `padding: 20px 4px` (20 = `espaciado(16)+espaciado(4)`), `gap: 20px`, `min-height: $altura-control-media` (48px) → paso de fila 71px; hoy `padding-block:16px`, inline 0, paso 63px. | estilo | media |
| faq-7 | Separación cabecera→lista: `h2 { margin: 0 }` y `.lista { margin-block-start: clamp(28px,4vw,40px) }`; hoy `h2 { margin-block-end: 24px }`. | estilo | media |
| faq-8 | Respuesta: `padding: 0 espaciado(4) espaciado(24)`, `color: --color-texto`, `line-height: 1.75`; hoy `padding-block:16px`, `--color-texto-suave`, 1.7. | estilo | baja |
| faq-9 | Retirar el `:hover { padding-inline-start: 8px }` y su transición: el prototipo no desplaza la pregunta (solo `cursor: pointer`). | estilo | baja |
| faq-10 | Banda de fondo: el prototipo pinta FAQ con `--bg` (`--color-fondo`); la web usa `.seccionAlterna`. **Decisión de `Landing.tsx`, no de este componente**: toda la cadena servicios→FAQ está invertida respecto al prototipo (prototipo: bg, bg-2, bg, bg-2, bg, bg-2, bg; web: alterno, fondo, alterno, fondo, alterno, fondo, alterno). Coordinar con los deltas de las otras secciones; si se invierte toda la cadena, `CampanasPortada.module.scss:14` debe pasar a `--color-fondo-alterno`. | estilo | media |
| faq-11 | Cintillo: el prototipo usa `12px / .22em / margin-bottom 13px`; el mixin compartido da `12.8px / .12em / 4px`. El tracking es decisión global de `_api.scss` (afecta a las 7 secciones); localmente solo se ajusta `margin-block-end: espaciado(12)`. | estilo | baja |
| faq-12 | Recuento: 6 preguntas en el prototipo, 5 reales. **Se respeta el 5** (@s1 de `faq.feature`); no se copia ninguna pregunta del prototipo (ver §4). | dato | baja |
| faq-13 | El prototipo usa `<details name>`/`<summary>` nativos; la web usa `button[aria-expanded]` + región con nombre. **Se respeta la web**: es el contrato @s1-@s13 y la interacción es la misma (excluyente, «+» decorativo). | estructura | baja |

## Datos reales necesarios

La anatomía del prototipo solo consume **dos campos por entrada**: `pregunta` y
`respuesta`. Ambos existen ya y se derivan de la fuente única, sin retipear nada:

| Campo | Origen real | Estado |
|---|---|---|
| `pregunta` (×5) | literal del catálogo publicado, `Faq-logica.ts:104-110` (`construirCatalogoFaq`) | existe |
| `respuesta` horario | `datosNegocio.horario` (`src/lib/site.ts`) → `textoHorario` | existe (@s2) |
| `respuesta` cita | `datosNegocio.telefonoClinica` + `telefonoMovil` → `textoCita` | existe (@s3) |
| `respuesta` servicios | `SERVICIOS` (`src/data/servicios.ts`) → `textoServicios` | existe (@s4) |
| `respuesta` urgencias | `datosNegocio.telefonoUrgencias` → `textoUrgencias` | existe (@s5) |
| `respuesta` divulgativa | `RESPUESTA_DIVULGATIVA_VACUNACION` (pendiente de revisión veterinaria, cabecera de `faq.feature`) | existe (@s6) |
| indicador «+» | adorno sin dato | no necesita dato |
| cintillo «FAQ» / titular | rótulos fijos del prototipo, sin dato de negocio | existen (@s33) |

- `docs/datos-galapavet.md` **no tiene sección de FAQ**; su única mención (§11) es
  que los enlaces legales reales sustituyen al marcador `#faq` del pie del prototipo.
- **No se copia ninguna de las 6 preguntas del prototipo** (`landing:593-598`):
  «vacunar» (ya cubierta por la divulgativa real), «desparasitar» (sin dato del
  cliente), «primera visita» (sin dato), «urgencias 24 h» (falsa: cierra domingos,
  `datos-galapavet.md:40-43`), «planes de salud o financiación» (inventa precios y
  cuotas), «conejos, hurones o aves» (exóticos no publicados). Las razones ya
  están escritas en la cabecera de `features/faq.feature`.
- **Alternativa honesta para el hueco 5→6:** ninguna. Se deja el recuento en 5;
  ampliar a 6 exige un hecho verificado del cliente (PENDIENTE declarado en
  `faq.feature`). La anatomía no depende del recuento.

## Conflictos con el contrato vigente

| Escenario | Qué exige | Tensión con el cambio | Propuesta |
|---|---|---|---|
| `rediseno_visual` **@s18** | «cada [sección] declara su propio ancho máximo, distinto del general y distinto entre sí», medido «en una ventana de 1600 píxeles» | El contrato NO cambia; el test que lo cierra (`Faq.test.tsx:333-349`) lee el bloque directo de `.faq` y aprobó un `max-width` que el navegador no pinta (bug faq-2). Al mover el 860 al envoltorio interior el regex deja de encontrarlo. | **Respetar** el escenario y **reescribir el test**: leer el bloque del envoltorio interior (`.contenido`) y **añadir la medición en navegador** que el Given/When de @s18 describen y que hoy no existe para FAQ (`geometria-escalas.spec.ts:7-8` delega en «otros artesanos» y solo hay lectura de texto). Patrón de memoria `verde-por-vacuidad-en-puerta-de-verificacion`: aquí fue verde por lectura de texto. |
| `rediseno_visual` **@s33** | cintillo `<p>` en versalitas antes del h2, no encabezado, `--color-acento-tinta` en secciones con fondo de rol de color | Ninguna: centrarlo y envolverlo en un `div` de cabecera no cambia orden, etiqueta ni color. Si la banda pasa a `--color-fondo` sigue siendo «fondo con rol de color del sistema». | Respetar. |
| `rediseno_visual` **@s19** | el relleno vertical lo pone solo el wrapper (`--ritmo-seccion`) | Ninguna, mientras `Faq.module.scss` siga sin declarar `padding-block` sobre la `section`. | Respetar (el envoltorio interior no lleva relleno vertical). |
| `rediseno_visual` **@s17** / `identidad_visual` **@s45** | `[data-contenedor-principal]` = 1220px, el mismo en las 6 rutas | Ninguna: la `section` sigue siendo el contenedor de 1220; el 860 va en un hijo. Nunca poner el 860 sobre el elemento con `data-contenedor-principal`. | Respetar. |
| `identidad_visual` **@s26** (`tokens-aplicados.spec.ts:104-140`) | 8 fondos, ninguno transparente, ≥2 distintos, nunca 3 seguidos iguales | Solo si se toca la banda (faq-10). Cambiar solo FAQ a `.seccion`: galería(alterno)/contacto(fondo)/FAQ(fondo) → 2 seguidas, pasa. Invertir toda la cadena: Campañas debe pasar a alterno o quedarían servicios(fondo)/campañas(fondo)/equipo(fondo). | Respetar; decidir faq-10 en el delta global de Landing. |
| `rediseno_visual` **@s11** (`matrizDeContraste.test.ts:436-437, 487`) | la matriz declara exactamente **21** pares y **105** parejas | Pares nuevos: `acento-tinta/acento-suave` (ya, fila 365) ✓; `tinta/fondo` (ya, fila 349) ✓ **si la banda es `--color-fondo`**. Si la banda sigue en alterno, `tinta/fondo-alterno` no está en la matriz. | Opción A (recomendada): banda `--color-fondo` → sin fila nueva; actualizar el comentario de la fila `texto-suave/fondo-alterno` (`matrizDeContraste.ts:355`) para citar `Galeria.module.scss:29` en vez de `Faq.module.scss:47`. Opción B: añadir `{ rol: 'tinta', fondo: 'fondo-alterno', uso: 'texto normal' }` y subir los literales 21→22 y 105→110. |
| `faq.feature` **@s1 / @s12** (y `Faq.test.tsx:38-40, 297-303`) | nombres accesibles exactos; el test compara `boton.textContent` con la pregunta | Un «+» como nodo de texto rompería `textContent` y el nombre accesible. | El indicador es `<span aria-hidden="true" />` **vacío** con `content: '+'` en `::before`: `textContent` y nombre accesible intactos. |
| `faq.feature` **@s2/@s7/@s8/@s9**, `accesibilidad.feature` @s26/@s27 (`accesibilidad-teclado.test.tsx:92-140`) | `aria-controls` → región hermana, acordeón excluyente, teclado | Ninguna: envolver botón+región en un `div.entrada` no altera roles ni atributos. | Respetar. |
| `accesibilidad` **@s37** (`accesibilidad.spec.ts:74-92`) | todo control visible ≥ 24×24 | Botón ≥ 48px de alto (`$altura-control-media`) ✓; el `span` no es interactivo. | Respetar. |
| `rediseno_visual` **@s45** (axe, 30 combinaciones) | 0 violaciones | `aria-hidden` sobre un `span` decorativo sin foco es válido; el botón conserva su nombre. | Respetar; comprobar en las 5 variantes. |
| `identidad_visual` **@s16/@s42** (`escalaMovimiento.ts`, `movimientoRespetuoso.ts`, `movimiento.spec.ts`) | transiciones solo 150/300ms `ease-out`, dentro de `no-preference`; nunca `all` | Se retira la única transición de FAQ (faq-9): sin declaración, nada que cubrir. `movimiento.spec.ts:38-40` sigue pulsando «¿Qué horario tiene la clínica?»: el nombre no cambia. | Respetar. |
| `rediseno_visual` **@s15** (`usoDelAcento.ts`) | `--color-acento` a secas nunca como texto ni borde | El «+» usa `--color-acento-suave` (relleno) y `--color-acento-tinta` (texto): roles distintos, no el acento a secas. | Respetar. |
| `identidad_visual` **@s24** (`inventarioModulos.test.ts:131-147`, `puertaLiteralesColor`) | ningún literal de color en los `.module.scss` | Solo tokens en la hoja nueva. | Respetar. |
| `rediseno_visual` **@s48** / `identidad_visual` @s49 (`css-presupuesto.spec.ts`, techo 8000 B comprimidos, medido 5791 B) | peso del CSS servido | La hoja crece ≈ +350 B sin comprimir (≈ +60-90 B comprimidos). | Respetar; volver a medir tras el build. |
| Decisión 24 (`_api.scss:100-130`: no copiar radios/bordes/alturas del prototipo) | valores desde la escala | 30px («+»), 20px (padding), 19px (glifo) no están en la escala. | Usar `espaciado(32)`, `espaciado(16)+espaciado(4)`, `paso-tipografico(1)`, `$radio-circulo`, `$altura-control-media`, `$ancho-borde-fino`; los `clamp()` de la pregunta y del margen de lista tienen precedente en `Hero.module.scss:38,73`. Desviación máxima 2px, invisible a ojo. |

## Tests que romperán

### Unitarios (`src/**/*.test.ts(x)`)

| Test | Por qué |
|---|---|
| `src/components/Faq.test.tsx` › describe «@s18 (rediseno_visual) la sección de preguntas frecuentes declara su propio ancho máximo…» › it «el texto real de Faq.module.scss fija max-width en un valor propio, menor que el general y distinto del de Hero» | Su regex `/\.faq\s*\{([^{]*)/` lee solo el bloque directo de `.faq`; al mover `max-width: 860px` al envoltorio interior, `declaracion` es `null` y `expect(...).not.toBeNull()` falla. Hay que reescribirlo contra el nuevo selector (y mantener `860 < 1220` y `≠ 900`). |
| `src/lib/diseno/matrizDeContraste.test.ts` › «la matriz declara los veintiún pares…» y «resuelta contra las cinco variantes… exactamente 5» (`parejasComprobadas === 105`) | **Solo con la Opción B** de faq-10 (banda alterna + fila `tinta/fondo-alterno`): los literales 21 y 105 pasan a 22 y 110. Con la Opción A no rompe. |

**No rompen** (verificado contra el código de cada uno) mientras el «+» sea un
`span` vacío con `aria-hidden`: `Faq.test.tsx` @s1-@s13 y @s33 (`getByText('FAQ')`
sigue siendo un `<p>` que precede al h2; `getAllByRole('button')` y `textContent`
intactos; `closest('section')` sigue devolviendo la sección), `Faq-logica.test.ts`
(la lógica no cambia), `src/accesibilidad-teclado.test.tsx` @s26/@s27,
`src/pages/Landing.test.tsx` @s4 (ids de ancla), `src/lib/diseno/movimientoRespetuoso.test.ts`
y `escalaMovimiento.test.ts` (no queda ninguna transición en la hoja),
`inventarioModulos.test.ts` @s24 (solo tokens), `rolesDescartados.test.ts`
(ningún «24 h»/«365» nuevo), `usoDelAcento.test.ts`.

### E2E (`tests/e2e/*.spec.ts`)

| Test | Por qué |
|---|---|
| Ninguno rompe por la anatomía nueva. | — |
| **Vigilar** `tests/e2e/fidelidad.spec.ts` › «@s44 … las 6 rutas a 320px: scrollWidth <= clientWidth y ningún elemento sobresale» | Nuevo `display:flex` en el botón: la pregunta debe poder envolver (`min-width: 0` en el ítem de texto si se envuelve en `span`) y el «+» llevar `flex-shrink: 0`. Sin eso, la pregunta larga («¿Qué hago si mi animal necesita atención fuera del horario?») podría empujar el círculo fuera del contenedor a 272px. |
| **Vigilar** `tests/e2e/css-presupuesto.spec.ts` › «@s49 … suma de bytes de hoja de estilo <= techo» | Crece unas decenas de bytes comprimidos; margen actual ≈ 2200 B. |
| **Vigilar** `tests/e2e/accesibilidad.spec.ts` › «@s37 … cada control visible mide >= 24×24» y `analisisAutomaticoAxe` (@s45, 30 combinaciones) | Botón ≥ 48px; `span[aria-hidden]` decorativo. |
| **Vigilar** `tests/e2e/tokens-aplicados.spec.ts` › «@s26 … 8 secciones… sin 3 consecutivas iguales» | Solo si se toca la banda (faq-10). |
| `tests/e2e/movimiento.spec.ts` @s42, `tests/e2e/red-limpia.spec.ts` @s34, `tests/e2e/rediseno-visual.spec.ts` (`exact: true`) | Pulsan `getByRole('button', { name: '¿Qué horario tiene la clínica?' })`: el nombre accesible no cambia → siguen en verde. |
| **Nuevo (no rompe, cubre):** `tests/e2e/fidelidad-faq.spec.ts` | Medición en navegador de @s18 (860px a 1600px) que hoy no existe, más la anatomía (centrado, «+», líneas). Ver §7. |

## Plan de cambio

Orden de ejecución (SDD: contrato → aprobación humana → TDD → judge → mutación).
Nada de lógica nueva de datos: el cambio es de DOM y de hoja de estilos; la única
lógica pura (`Faq-logica.ts`) no se toca, salvo el paso 3 opcional.

1. **`features/fidelidad_faq.feature`** (nuevo, `gherkin_author`; puerta humana antes
   de tocar `src/`). Escenarios propuestos, todos medibles:
   - **@s1** la cabecera (cintillo + titular) está centrada: el centro horizontal
     del h2 coincide (±1px) con el centro del envoltorio interior, a 1280 y a 1600px.
   - **@s2** el contenido de la sección mide 860px a 1600px de ventana, es menor
     que 1220 y distinto de los 900 de la bienvenida (cierra de verdad @s18 de
     `rediseno_visual`, en navegador, no solo en texto).
   - **@s3** cada pregunta lleva a su derecha un indicador redondo decorativo: un
     único descendiente `aria-hidden="true"` sin texto, 32×32 (±2px), `border-radius`
     50 %, con borde derecho a 4px (±1) del borde derecho de la lista; el nombre
     accesible del botón sigue siendo exactamente la pregunta.
   - **@s4** la lista abre con una línea superior de 1px y cada entrada cierra con
     una de 1px; la respuesta abierta queda **encima** de la divisoria de su entrada.
   - **@s5** la pregunta usa la familia de titulares (`Outfit`), peso 500 y `--color-tinta`;
     el botón mide ≥ 48px de alto; la fila sin abrir mide 70px (±2) a 1280px.
   - **@s6** ningún estado `:hover` desplaza la pregunta; la hoja no declara
     ninguna transición.
   - **@s7** (solo si se aprueba faq-10) la banda de FAQ es `--color-fondo` y @s26
     sigue cumpliéndose.
2. **`src/components/Faq.tsx`** (`tdd_craftsman`, rojo→verde por escenario):
   ```
   <section aria-label="Preguntas frecuentes" className={styles.faq} data-contenedor-principal>
     <div className={styles.contenido}>
       <div className={styles.cabecera}>
         <p className={styles.eyebrow}>FAQ</p>
         <h2>Preguntas frecuentes</h2>
       </div>
       <div className={styles.lista}>
         {validas.map((entrada, indice) => (
           <div className={styles.entrada} key={entrada.pregunta}>
             <button type="button" aria-expanded={abierto} aria-controls={idRegion(indice)} onClick={…}>
               {entrada.pregunta}
               <span className={styles.indicador} aria-hidden="true" />
             </button>
             {abierto && <RespuestaFaq … />}
           </div>
         ))}
       </div>
     </div>
   </section>
   ```
   Invariantes: `section` conserva `aria-label` y `data-contenedor-principal`;
   el `p` «FAQ» sigue precediendo al h2; el `span` va **vacío** (nunca «+» como
   texto); `React.Fragment` → `div.entrada`; `idRegion` y `RespuestaFaq` sin cambios.
3. **`src/components/Faq-logica.ts`** (opcional, misma oleada): mover `idRegion(indice)`
   desde el `.tsx` (`Faq.tsx:16-18`, fuera de la superficie de Stryker) a la lógica
   pura, con un test directo en `Faq-logica.test.ts` (`idRegion(0) === 'faq-respuesta-0'`,
   `idRegion(4) === 'faq-respuesta-4'`). No hay ninguna otra decisión nueva: el
   «+» es constante (fiel al prototipo, sin rotación) y el estado ya vive en
   `aria-expanded`.
4. **`src/components/Faq.module.scss`** (reescritura completa; solo tokens y escalas):
   ```
   .faq { }                                   // el contenedor 1220 lo pone Landing.module.scss; NO redeclarar max-width aquí
   .contenido { max-width: 860px; margin-inline: auto; }          // @s18: propio, < 1220, ≠ 900 (Hero)
   .cabecera {
     text-align: center;
     .eyebrow { @include eyebrow; margin-block-end: espaciado(12); }
     h2 { font-family: var(--fuente-titulares); font-size: paso-tipografico(4); color: var(--color-tinta); margin: 0; }
   }
   .lista { margin-block-start: clamp(28px, 4vw, 40px); border-block-start: $ancho-borde-fino solid var(--color-borde); }
   .entrada {
     border-block-end: $ancho-borde-fino solid var(--color-borde);
     > button {
       @include foco-visible;
       display: flex; align-items: center; justify-content: space-between;
       gap: espaciado(16) + espaciado(4);                          // 20px
       width: 100%; min-height: $altura-control-media;             // 48px
       padding: (espaciado(16) + espaciado(4)) espaciado(4);       // 20px 4px
       border: 0; background: none; cursor: pointer; text-align: start;
       color: var(--color-tinta);
       font-family: var(--fuente-titulares); font-size: clamp(16px, 2.1vw, 19px); font-weight: 500;
     }
     > section { max-width: 70ch; padding: 0 espaciado(4) espaciado(24); color: var(--color-texto); line-height: 1.75; }
     a { @include foco-visible; }
   }
   .indicador {
     flex-shrink: 0; display: grid; place-items: center;
     width: espaciado(32); aspect-ratio: 1; border-radius: $radio-circulo;
     background-color: var(--color-acento-suave); color: var(--color-acento-tinta);
     font-size: paso-tipografico(1); line-height: 1;
     &::before { content: '+'; }
   }
   ```
   Sin `:hover`, sin `transition`, sin `padding-block` en `.faq`, sin literales de
   color. Conservar la cabecera de comentario que explica que el wrapper pone
   fondo, contenedor y ritmo (@s19/@s44/@s45) y añadir por qué el 860 vive en
   `.contenido` y no en `.faq` (la cascada real del bundle, byte 12991 vs 33382).
5. **`src/pages/Landing.tsx:70`** (solo si se aprueba faq-10, y coordinado con el
   delta global de bandas): `#faq` pasa de `styles.seccionAlterna` a `styles.seccion`;
   actualizar el comentario de `Landing.module.scss:9-11` y el de
   `matrizDeContraste.ts:355` (citar `Galeria.module.scss:29`). Si en su lugar se
   opta por la Opción B, añadir la fila `tinta/fondo-alterno` y subir 21→22 y
   105→110 en `matrizDeContraste.test.ts:437, 441, 487`.
6. **Tests unitarios** (`src/components/Faq.test.tsx`):
   - Reescribir el `it` de @s18 para leer el bloque de `.contenido`
     (`/\.contenido\s*\{([^{]*)/`) y mantener `toBe(860)`, `< 1220`, `≠ 900`; añadir
     la guarda inversa: el bloque directo de `.faq` **no** declara `max-width`
     (evita que vuelva la declaración muerta).
   - Nuevos `describe` con el tag de `fidelidad_faq.feature`: (a) `p` «FAQ» y `h2`
     comparten padre, y ese padre precede al padre de los botones; (b) cada botón
     contiene exactamente un elemento con `aria-hidden="true"` y `textContent === ''`,
     y `boton.textContent === pregunta` (reafirma @s1); (c) tras abrir una pregunta,
     `boton.parentElement === region.parentElement` (la respuesta vive dentro de la
     entrada, encima de su divisoria); (d) lectura del texto real de la hoja, como
     @s18: `.lista` declara `border-block-start`, `.entrada` declara `border-block-end`,
     `.indicador` declara `border-radius: $radio-circulo` y `content: '+'`, y el
     texto no contiene `:hover` ni `transition`.
   - Si se mueve `idRegion`: test directo en `Faq-logica.test.ts`.
7. **Test E2E nuevo** `tests/e2e/fidelidad-faq.spec.ts` (navegador real sobre `dist/`,
   localizadores por estructura/ARIA, nunca por clase): a 1600px, ancho del padre
   del padre del `#faq h2` = 860 (±1) y < 1220 y ≠ ancho del `.contenido` del hero;
   centro del h2 = centro de la sección (±1); para cada uno de los 5 botones,
   `span[aria-hidden]` de 32×32 (±2), `border-radius` 50 %, `right` a 4px (±1) del
   `right` de la lista; botón con `font-family` que incluye «Outfit», `font-weight`
   500, alto ≥ 48; `border-top-width` de la lista = 1px y `border-bottom-width` de
   cada entrada = 1px; `getByRole('button', { name: '¿Qué horario tiene la clínica?', exact: true })`
   visible; contador de entradas medidas = 5 (guarda anti-vacuidad). Repetir la
   comprobación de «+» a 320px para blindar @s44.
8. **Puertas de cierre**: `bin\harness.ps1 test`, `pnpm build`, Playwright completo
   (incluidos `css-presupuesto`, `accesibilidad` 30 combinaciones, `fidelidad` @s44,
   `tokens-aplicados` @s26, `movimiento`, `red-limpia`), `bin\harness.ps1 mutate`
   (la superficie `Faq-logica.ts` no cambia salvo `idRegion`, que entra con su test),
   `judge` y captura a 1280px comparada con `shots/diseno_05.png` (paso de fila 71px,
   lista 210→1070, «+» en x≈1036-1066).
