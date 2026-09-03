# Handoff — Convergencia visual v2 (Galapavet ↔ prototipo Claude Design)

> **Para:** `craftsman_lead` de Claude Code en `Cenit-Digital/GalapavetClinicaVeterinaria`.
> **De:** Pablo (humano) con Claude (Cowork), 03/09/2026.
> **Estado:** este documento ES la especificación aprobada por el humano. El
> `.feature` adjunto (`features/convergencia_visual_v2.feature`) ES el contrato
> Gherkin aprobado. No hace falta reabrir conversación de spec ni puerta humana:
> ya se han hecho aquí. Ve directo a `tdd_craftsman` tramo a tramo.

---

## 0. Por qué existe este documento

La feature 24 `rediseno_visual` está `done` (judge + mutación 100 %) y, sin
embargo, la web publicada **no se parece al diseño**. El 03/09/2026 se
construyó `dist/` en local (idéntico al desplegado en GitHub Pages), se
renderizó `docs/diseno-claude-design/Veterinaria La Sierra.dc.html` en Chromium
real (1440×900) y se compararon los dos a página completa
(`progress/rediseno/comparativa_diseno_vs_web_2026-09-03.png`).

Conclusión: **las puertas del arnés validan tokens, contraste y lógica, pero
nadie ha mirado la página pintada**. Hay dos bugs de raíz que anulan parte del
CSS que la feature 24 creyó haber aplicado, y varias secciones cuya anatomía
nunca se llegó a rehacer.

### Bugs de raíz (verificados en el DOM y en `dist/assets/*.css`)

| # | Bug | Evidencia | Efecto visible |
|---|-----|-----------|----------------|
| **R1** | `src/pages/Landing.module.scss` usa los selectores `#inicio` y `#contacto`. CSS Modules **hashea también los ids** → en `dist/` salen como `#_inicio_1yq0o_1` / `#_contacto_dj8i3_1` y nunca casan con `id="inicio"` / `id="contacto"` del DOM. | `getComputedStyle` del hijo de `#inicio`: `max-width: 1220px; padding-inline: 24px` (debería ser `none; 0`). `#contacto`: `display: block`, `grid-template-columns: none`. | El hero **no va a sangre** (queda en 1220 px con márgenes). La sección de contacto **no se pone a dos columnas** y cada uno de sus dos hijos recibe su propio `padding-block: var(--ritmo-seccion)` (doble ritmo vertical). |
| **R2** | `Hero.module.scss` fija `aspect-ratio: 16/9` + `overflow: hidden` en `.hero`. | Caja del hero: 686 px de alto. Contenido (`.contenido`): 836 px. | La banda inferior del hero (horario + cifras) **se corta**. |
| **R3** | `espaciado(20)` no existe en `$escala-espaciado` (`_api.scss`, 9 pasos: 4/8/12/16/24/32/48/64/96; `escalaEspaciado.test.ts` los bloquea). `map.get` devuelve `null` y la declaración se omite. Se invoca en **11 sitios**: `_api.scss:254` (`boton-fantasma`), `Equipo.module.scss:49`, `InformacionContacto.module.scss:59,72`, `Servicios.module.scss:45,51,65,69,70`, `PaginaBlog.module.scss:70`. | Botón fantasma de la galería: `padding-inline: 12px`, ancho 33 px. | Botones ‹ › minúsculos, tarjetas de contacto y servicios sin el relleno previsto. |

### Lo que NO está roto (no perder tiempo ahí)

- Las 25 imágenes (hero, servicios, campañas, galería, logo) cargan con 200 y
  `naturalWidth > 0`. Los comentarios «PENDIENTE: los ficheros no existen» de
  `src/data/galeria.ts:10-12` y `PieDePagina.tsx:9-13` son **obsoletos**:
  bórralos.
- Los 20 tokens de color, las 5 variantes, la tipografía autoalojada
  (Outfit / DM Sans), la escala tipográfica fluida y el contenedor de 1220 px
  ya existen y son correctos. Este trabajo **no toca `_tokens.scss`**.

---

## 1. Límites innegociables (heredados de `PLAN_DE_CONVERGENCIA.md`)

1. **Los datos de negocio salen solo de `src/lib/site.ts` y `src/data/`.**
   Del prototipo se copia la *forma*, nunca el *contenido*: ni «12 años», ni
   «8.400 mascotas», ni «4,9 ★», ni «seis profesionales», ni precios de
   campaña, ni «confirmamos en menos de 2 horas», ni «te contestamos el mismo
   día». Donde el prototipo pone una cifra o promesa y el repo no tiene el dato,
   se usa el dato real equivalente (horario, teléfonos, nº real de bloques de
   servicio, nº real de miembros del equipo) o se omite.
2. **Nunca «urgencias 24 h» ni «365 días».** El rótulo real es
   `datosNegocio.telefonoUrgencias.rotulo` («Urgencias fuera de horario») con
   `91 851 13 93`.
3. **Sin fotos de personas reales** en Equipo (@s32 de `rediseno_visual`):
   avatar de iniciales, pero maquetado como el diseño.
4. **Sin peticiones a terceros** salvo el iframe del mapa. Imágenes desde
   `public/`.
5. Se conservan: 5 variantes de paleta, WCAG (axe 0 violaciones en 30
   combinaciones), las 6 rutas, `tests/e2e` en verde, techo de CSS.
6. Los textos de interfaz nuevos (eyebrows, titulares de sección, rótulos de
   botón) se pueden adoptar del prototipo **si no afirman nada sobre la
   clínica**. En cada tramo se indica cuál sí y cuál no.

---

## 2. Cómo trabajar (para `craftsman_lead`)

- **Un tramo = un ciclo TDD + una captura.** Tras cada tramo, ejecuta
  `pnpm run build && node tools/captura-comparativa.mjs` y **mira**
  `progress/rediseno/capturas/<tramo>.png` junto al prototipo. Si no se parece,
  el tramo no está terminado aunque los tests pasen. Esto es lo que faltó en la
  feature 24.
- Orden de tramos: **T0 → T1 → T7 → T2 → T3 → T4 → T6 → T9 → T5 → T8 → T10**
  (primero lo roto, luego lo de más impacto visual). Si se acaba el tiempo,
  cada tramo cerrado ya es un despliegue mejor que el actual: **haz commit y
  push al final de cada tramo**.
- `judge` y `mutation_tester` una sola vez al final (o al cerrar la sesión si
  no se llega a T10), no por tramo.
- Mapa de tokens prototipo → repo (úsalo siempre, nunca hex literales):

| Prototipo | Repo |
|-----------|------|
| `--bg` / `--bg-2` | `--color-fondo` / `--color-fondo-alterno` |
| `--card` / `--surface` | `--color-superficie` / `--color-superficie-elevada` |
| `--border` | `--color-borde` (decorativo) · `--color-borde-control` (inputs, botones fantasma) |
| `--ink` / `--text` / `--muted` | `--color-tinta` / `--color-texto` / `--color-texto-suave` |
| `--primary` / `--primary-strong` / `--on-primary` | `--color-primario` / `--color-primario-fuerte` / `--color-sobre-primario` |
| `--accent` (solo relleno) / `--accent-ink` / `--accent-soft` | `--color-acento` / `--color-acento-tinta` / `--color-acento-suave` |
| `--urg` / `--urg-soft` | `--color-urgencia` / `--color-urgencia-suave` |
| `--shadow-sm` / `--shadow` | `--sombra-reposo` / `--sombra-elevada` |
| radio 20–22 px | `$radio-grande` (24 px) |
| radio 12–16 px | `$radio-medio` (12 px) |
| `999px` / `50%` | `$radio-completo` / `$radio-circulo` |
| `'Outfit'` | `var(--fuente-titulares)` |
| `clamp(28px,4.2vw,46px)` (h2) | `paso-tipografico(4)` |
| `clamp(33px,6.4vw,68px)` (h1) | `paso-tipografico(5)` |

- Ritmo de sección: el wrapper de `Landing.module.scss` ya aplica
  `--ritmo-seccion` (`clamp(72px,7.2vw,104px)`) y `contenedor`. Los
  `.module.scss` de sección **no** declaran `padding-block` ni `max-width`.

---

## 3. Tramos

Referencias «proto L###» = líneas de
`docs/diseno-claude-design/Veterinaria La Sierra.dc.html`.

### T0 — Cimientos: matar los tres bugs de raíz

**Ficheros:** `src/pages/Landing.tsx`, `src/pages/Landing.module.scss`,
`src/components/Hero.module.scss`, `src/components/InformacionContacto.module.scss`,
`src/styles/_api.scss`, `src/components/{Equipo,Servicios}.module.scss`,
`src/pages/PaginaBlog.module.scss`, `tests/e2e/geometria-escalas.spec.ts:151`,
`tests/e2e/layout.spec.ts:49`.

1. **R1:** en `Landing.module.scss` sustituye `#inicio {…}` por una clase
   `.seccionHero` y crea `.seccionContacto`; `Landing.tsx` las aplica junto a
   `.seccion`/`.seccionAlterna` en los `<div id="inicio">` y `<div id="contacto">`.
   `.seccionHero > *` → `max-width: none; padding-inline: 0; padding-block: 0`.
   `.seccionContacto` → un **único hijo directo** contenedor (mueve el `<div>`
   envolvente a `Landing.tsx` o a un componente `Contacto.tsx` que agrupe
   cabecera de sección + formulario + panel; ver T7). Elimina la regla de
   `#contacto`/`@media` de `InformacionContacto.module.scss:93-100` (también
   está hasheada).
   ⚠️ Los specs e2e @s17 (`geometria-escalas.spec.ts:151`) y @s45
   (`layout.spec.ts:49`) miden el **primer** `[data-contenedor-principal]`,
   que hoy es el hero (y pasan a 1220 px *porque* el bug existe). Cambia el
   locator a `[data-contenedor-principal]:not([data-a-sangre])` y marca el
   `<section>` del hero con `data-a-sangre`. Mismo commit.
2. **R2:** en `Hero.module.scss` quita `aspect-ratio` y `overflow: hidden` de
   `.hero`; pon `min-height: clamp(540px, 84vh, 780px)` (proto L118) y deja que
   la altura la dé el contenido. La imagen de fondo sigue `position: absolute;
   inset: 0; object-fit: cover`.
3. **R3:** reemplaza los 11 `espaciado(20)` por `espaciado(24)` (o `16` donde
   24 sea claramente excesivo: `Servicios.module.scss:45,51`). No añadas el
   paso 20 a la escala (`escalaEspaciado.test.ts` la bloquea a 9 pasos).
4. Borra los comentarios «PENDIENTE» obsoletos de `galeria.ts` y
   `PieDePagina.tsx`.

**Aceptación:** `.feature` @s1–@s4. Captura: hero de borde a borde, sin corte
abajo; contacto en dos columnas a 1440 px; botones ‹ › de la galería ≥ 48 px.

### T1 — Hero (proto L118-140)

**Ficheros:** `Hero.tsx`, `Hero.module.scss`, `Hero.test.tsx`.

- Sección: `min-height: clamp(540px,84vh,780px)`, `display:flex;
  align-items:center; justify-content:center`. Velo sobre la foto:
  degradado vertical `180deg` de `color-mix(in srgb, var(--color-tinta) 62%,
  transparent)` → `46%` al 42 % → `78%` (hoy es un degradado lateral a 105°).
- `.contenido`: **centrado** (`text-align:center; align-items:center`),
  `max-width: 900px`, `padding: clamp(84px,13vw,140px) clamp(18px,6vw,32px)
  clamp(60px,9vw,92px)`.
- Píldora de ubicación (hoy es un `<p>` eyebrow con borde): `inline-flex`,
  `padding: 7px 16px`, `$radio-completo`, fondo
  `color-mix(in srgb, var(--color-sobre-primario) 14%, transparent)`, borde
  `1px solid color-mix(… 28%)`, punto de 7 px `var(--color-acento)` delante,
  `12.5px / 600 / .1em / uppercase`. Texto: `Galapagar · Madrid` (ya real).
- `h1`: `paso-tipografico(5)`, `600`, `line-height 1.05`, `-.02em`,
  `max-width: 16ch`, `margin: 22px 0 0`, `text-shadow: 0 2px 24px rgba(0,0,0,.35)`.
- Párrafo: `clamp(16px,2.2vw,19.5px)`, `1.65`, `max-width: 58ch`, `margin-top 20px`,
  color `color-mix(in srgb, var(--color-sobre-primario) 90%, transparent)`.
  Texto: el actual (real).
- Botones (`margin-top 32px`, `gap 12px`, centrados): «Reservar cita»
  primario con `box-shadow: 0 12px 30px rgba(0,0,0,.28)`, `min-height 50px`,
  `padding 15px 30px`; segundo botón **fantasma translúcido**
  (`background: color-mix(… 12%)`, `border: 1.5px solid color-mix(… 55%)`)
  con punto rojo `var(--color-urgencia)` pulsante y texto
  `{rotulo de urgencias}` → `tel:` de urgencias (hoy es «Llamar 91 082 92 67»
  a la clínica; el diseño pone urgencias ahí).
- **Quitar el `<dl>` de horario del hero.** El diseño no lo tiene y el horario
  ya vive en Reserva, Contacto y FAQ. Actualiza `Hero.test.tsx` @s6/@s10 (o
  muévelos a la banda de cifras: una de las cuatro cifras puede ser el horario
  de L-V, ver abajo).
- Banda de cifras (proto L131-138): `grid auto-fit minmax(130px,1fr)`,
  `gap 18px 26px`, `max-width 720px`, `margin-top clamp(38px,6vw,58px)`,
  `padding-top 26px`, `border-top 1px solid color-mix(… 24%)`; valor
  `Outfit clamp(24px,3.4vw,32px) 600`, etiqueta `12.5px` al 78 %. Las 4 cifras
  siguen saliendo de `construirCifrasBienvenida` (reales: nº de bloques de
  servicio, nº de miembros, nº de fotos, horario). **Sin** `text-transform:
  uppercase` en la etiqueta.

**Aceptación:** @s5–@s8.

### T7 — Contacto (proto L345-422) — *antes que T2 porque está roto*

**Ficheros:** `Landing.tsx`, nuevo `src/components/Contacto.tsx` +
`Contacto.module.scss` (⚠️ `inventarioModulos.test.ts` bloquea el recuento a
**18** módulos: si creas uno nuevo, actualiza el inventario en
`src/lib/diseno/inventarioModulos.ts` y el test; alternativa sin nuevo módulo:
que `InformacionContacto.tsx` renderice la cabecera y reciba el formulario
como `children`), `FormularioContacto.module.scss`,
`InformacionContacto.tsx/.module.scss`, `Landing.test.tsx` (@s6: `#contacto`
sigue agrupando formulario + panel sin nombre accesible propio).

- Cabecera de sección (`max-width 640px`, alineada a la izquierda): eyebrow
  «Contacto», `h2` «Estamos a un paseo de casa» (adoptable), párrafo **sin la
  promesa del prototipo**; usa p. ej. «Escríbenos o llámanos en horario de
  clínica. Fuera de horario, usa el teléfono de urgencias.»
- Rejilla: `grid auto-fit minmax(min(320px,100%),1fr)`, `gap clamp(24px,3vw,34px)`,
  `margin-top clamp(32px,4.5vw,48px)`, `align-items: start`.
- **Columna izquierda — tarjeta del formulario:** `--color-superficie`,
  borde fino, `$radio-grande`, `padding clamp(22px,3vw,32px)`,
  `--sombra-reposo`. `h3` «Escríbenos» `20px/600`. Nombre y teléfono en
  subrejilla de 2 columnas (`minmax(180px,1fr)`, `gap 14px`); email, motivo,
  cuéntanos a ancho completo; `gap 16px` entre grupos. Etiquetas `13px/600
  --color-tinta` encima del campo (`gap 7px`). Campos: `min-height 46px`,
  `padding 12px 14px`, `$radio-medio`, `border 1px solid --color-borde-control`,
  fondo `--color-superficie-elevada`, `14.5px`. Textarea `min-height 110px`,
  `resize: vertical`. Checkbox `18px` con `accent-color: var(--color-primario)`,
  texto `12.5px --color-texto-suave`. Botón «Enviar mensaje» **a ancho
  completo**, píldora, `min-height 50px`. Placeholders del prototipo
  («Ana Martín», «600 000 000», «ana@correo.es», «Nombre y edad de tu mascota,
  y qué le pasa.») son adoptables.
- **Columna derecha** (`flex column; gap 16px`):
  1. **Tarjeta de urgencias** (proto L399-405): fondo `--color-urgencia`, texto
     `--color-sobre-primario`, `$radio-grande`, `padding 22px 24px`, `flex wrap
     space-between center gap 14px`. Izquierda: eyebrow `11.5px/700/.14em/
     uppercase` con punto blanco pulsante + `{rotulo}` («Urgencias fuera de
     horario»); debajo el número en `Outfit 26px/600`. Derecha: botón «Llamar
     ahora» píldora **blanca** (`background: --color-sobre-primario; color:
     --color-urgencia`, `min-height 46px`, `padding 13px 22px`). **Elimina** el
     `border-inline-start` rojo de 4 px, el `@include tarjeta` y el `order:-1`.
  2. **Tarjeta de datos**: `--color-superficie`, borde, `$radio-grande`,
     `overflow hidden`, `--sombra-reposo`. Arriba el iframe del mapa a
     `height 240px` (el aviso «el mapa lo sirve un proveedor externo» se
     mantiene debajo del mapa en `12px --color-texto-suave`). Debajo, rejilla
     `auto-fit minmax(200px,1fr)`, `gap 18px`, `padding 20px 22px 22px` con
     **tres** bloques (no cuatro: no hay email): Dirección, Teléfonos, Horario.
     Rótulo de bloque `10.5px/700/.14em/uppercase --color-acento-tinta`,
     línea 1 `14.5px/500 --color-tinta`, línea 2 `13.5px --color-texto-suave`.
     Horario en 3 líneas (`Lunes a viernes 11:00–14:00 y 16:30–20:00`, etc.),
     no en `<dl>` a dos columnas.

**Aceptación:** @s9–@s12.

### T2 — Servicios (proto L142-181)

**Ficheros:** `Servicios.tsx`, `Servicios.module.scss`, `Servicios.test.tsx`,
`src/data/servicios.ts` (solo si añades `resumen`).

- Cabecera: eyebrow «Lo que hacemos» (`12px/700/.22em`), `h2` «Servicios
  veterinarios **de principio a fin**» con el `<em>` en `--color-primario`
  (`font-style: normal`), `max-width 20ch`. Párrafo `17px/1.7
  --color-texto-suave max-width 62ch margin-top 16px` con el **recuento real**
  derivado de `SERVICIOS.length` («Cinco áreas bajo el mismo techo. Pulsa el
  **+** de cada tarjeta para ver qué incluye.»); el «+» en `--color-acento-tinta`.
- Rejilla: `auto-fit minmax(min(310px,100%),1fr)`, `gap 22px`,
  `margin-top clamp(36px,5vw,54px)`.
- Tarjeta: `@include tarjeta` (ya da superficie/borde/radio/sombra/hover).
  Imagen en `aspect-ratio 16/10` con la **píldora de categoría superpuesta**
  arriba-izquierda (`position:absolute; left 14px; top 14px; padding 6px 12px;
  fondo --color-superficie; color --color-acento-tinta; 10.5px/700/.1em`).
  Cuerpo `padding 22px 22px 20px; flex:1; flex-direction: column`. `h3`
  `Outfit 21px/600/1.15`. Párrafo de resumen `14.5px/1.65 --color-texto-suave
  margin-top 9px` — usa el **primer** `punto` del bloque o añade un campo
  `resumen` a `servicios.ts` escrito a partir de los puntos existentes (no
  inventes servicios).
- Panel desplegable (dentro del cuerpo, encima del botón): `padding-top 16px;
  margin-top 16px; border-top 1px solid --color-borde`; lista de puntos con
  «✓» en círculo de 17 px `--color-acento-suave`/`--color-acento-tinta`,
  `13.5px`, `gap 8px`.
- Botón de pie: `margin-top: auto; padding 14px 4px 0; border-top 1px solid
  --color-borde; width 100%; flex space-between; color --color-acento-tinta;
  13.5px/700; min-height 48px`; texto «Ver qué incluye» / «Ocultar detalle»;
  a la derecha un **círculo de 30 px** `--color-acento-suave` con «+» que
  rota 45° al abrir (`aria-expanded` sigue siendo la fuente de verdad).

**Aceptación:** @s13–@s15.

### T3 — Campañas en portada (proto L183-207)

**Ficheros:** `CampanasPortada.tsx`, `CampanasPortada.module.scss`,
`CampanasPortada.test.tsx`, `Landing.tsx`/`Landing.module.scss` (alternancia).

- **Alternancia de fondos** (afecta a toda la portada, hazlo aquí): el
  prototipo va hero(oscuro) → servicios `fondo` → campañas `alterno` → equipo
  `fondo` → reservar `alterno` → galería `fondo` → contacto `alterno` → FAQ
  `fondo` → footer `superficie`. Hoy el repo está **invertido** desde
  servicios. Cambia las clases en `Landing.tsx` y deja que `CampanasPortada`
  reciba wrapper como las demás (hoy se cablea su propio contenedor y fondo
  porque `Landing.tsx:57` no la envuelve). `tokens-aplicados.spec.ts` @s26
  (≥2 fondos, sin 3 consecutivos iguales) sigue cumpliéndose.
- Ritmo compacto: mantiene `--ritmo-seccion-compacto`.
- Rejilla de 2 columnas `auto-fit minmax(min(300px,100%),1fr)`,
  `gap clamp(24px,4vw,44px)`, `align-items: center`.
- Izquierda: eyebrow «Campañas», `h2 clamp(26px,3.6vw,40px)/1.1` («Campañas
  de prevención» — mantén el titular real), párrafo `16.5px/1.7 max-width 52ch
  margin 14px 0 26px` = **el aviso de demostración actual** (obligatorio, no
  lo quites), botón **primario** píldora «Ver campañas →» `min-height 48px
  padding 14px 26px 15px/700` (hoy es fantasma).
- Derecha: rejilla `auto-fit minmax(min(210px,100%),1fr) gap 14px` de
  tarjetas-enlace compactas: `--color-superficie`, borde, `$radio-medio`,
  `--sombra-reposo`, hover `translateY(-3px)`; imagen `16/9`; cuerpo
  `padding 14px 16px 16px`; fila de píldora «Demostración» (`4px 10px; 10px/700/
  .08em; --color-acento-suave`) ; `h3 Outfit 17px/600 margin 10px 0 4px`.
  **Sin precio ni vigencia** (el catálogo lo prohíbe y lanza si se declaran).

**Aceptación:** @s16–@s18.

### T4 — Equipo (proto L209-252)

**Ficheros:** `Equipo.tsx`, `Equipo.module.scss`, `Equipo.test.tsx`.

- Cabecera **centrada** (`max-width 640px; margin: 0 auto; text-align center`):
  eyebrow «Equipo», `h2` «Nuestro equipo», párrafo `17px/1.7` con el recuento
  real (`EQUIPO.length` → «Dos profesionales que verás siempre por aquí. Pulsa
  el + para conocerlos.»; sin «colegiados» si no consta).
- Rejilla `auto-fit minmax(min(300px,100%),1fr) gap 26px margin-top
  clamp(36px,5vw,52px) align-items start`. Con 2 miembros, limita la rejilla a
  `max-width: 760px; margin-inline: auto` para que no salgan dos tarjetas de
  600 px.
- Tarjeta (`@include tarjeta`): zona superior `aspect-ratio 4/3` con fondo
  `--color-acento-suave` y, **centrado**, el avatar de iniciales actual
  ampliado a **96 px** (`$radio-circulo`, fondo `--color-primario`, iniciales
  `Outfit 32px/700 --color-sobre-primario`). Sin foto (@s32).
  Cuerpo `padding 20px 20px 22px; gap 14px`: fila nombre (`Outfit 20px/600`) +
  rol (`13px --color-texto-suave`) y a la derecha el botón **«+» circular de
  44 px** (`border 1px solid --color-borde; fondo --color-acento-suave; color
  --color-acento-tinta; 22px`; abierto → fondo primario, texto sobre-primario,
  rota 45°). Solo se renderiza si hay `formacion`. Panel: `padding 14px 0 2px;
  border-top` con la formación en `14px/1.7`.
- Sin chips de especialidad (el catálogo no los tiene; no inventar).

**Aceptación:** @s19–@s21.

### T6 — Galería (proto L317-343)

**Ficheros:** `Galeria.tsx`, `Galeria.module.scss`, `Galeria.test.tsx`,
`Landing.module.scss` (esta sección va **a sangre** en horizontal: la pista
sale del contenedor; usa la misma técnica que el hero: clase `.seccionGaleria`
con `> * { max-width:none; padding-inline:0 }` y que la cabecera aplique
`contenedor` por su cuenta).

- Fila de cabecera (`contenedor`; `flex wrap; align-items flex-end;
  space-between; gap 18px`): izquierda eyebrow «Galería», `h2` «Galería»
  (**no** «Nuestros peludos»/«pacientes reales»: son fotos de demostración),
  párrafo = **aviso de demostración actual** (`16.5px/1.7 max-width 56ch`).
  Derecha: dos botones **circulares de 48 px** «←» «→» (`border 1.5px solid
  --color-borde-control; fondo --color-superficie; 17px`; hover borde
  primario), `gap 10px`.
- Pista: `flex; gap 18px; margin-top clamp(28px,4vw,42px); padding: 6px
  <padding-inline-del-contenedor> 22px; overflow-x auto; scroll-snap-type x
  mandatory; scrollbar-width: none` (+ `::-webkit-scrollbar{display:none}`):
  hoy se ve la barra de scroll nativa.
- Figura = **tarjeta**: `flex 0 0 clamp(240px,32vw,360px)`, `--color-superficie`,
  borde, `$radio-grande`, `overflow hidden`, `--sombra-reposo`; imagen `4/3`
  con `hueco-de-imagen`; `figcaption padding 14px 16px 16px` con nombre en
  `Outfit 16px/600 --color-tinta` y pie en `13px --color-texto-suave` en
  **dos líneas** (hoy es «Nala y Coco · Primera vacunación» en una).

**Aceptación:** @s22–@s24.

### T9 — Pie de página (proto L444-474)

**Ficheros:** `PieDePagina.tsx`, `PieDePagina.module.scss`, `PieDePagina.test.tsx`.

- Fondo `--color-superficie`, `border-top 1px solid --color-borde`,
  `padding clamp(48px,7vw,72px) <inline> 28px`.
- Fila superior `flex wrap gap 32px`: columna de marca `flex 1 1 260px` con
  logo real a **36 px** + «Galapavet» `Outfit 17px/600` en la misma línea
  (`gap 11px; margin-bottom 14px`) y descriptor `14px/1.7 --color-texto-suave
  max-width 34ch`. Tres columnas `flex 1 1 170px`: rótulo `11px/700/.14em/
  uppercase --color-tinta margin-bottom 14px`; lista `gap 9px`, enlaces `14px
  --color-texto-suave` (hover primario), **sin subrayado**.
- Barra inferior: `margin-top 36px; padding-top 20px; border-top; flex wrap
  space-between center; gap 10px 22px; 12.5px --color-texto-suave`. © a la
  izquierda; enlaces legales **en línea** a la derecha (`gap 16px`), hoy
  salen apilados. Mantén `target=_blank rel=noopener` y el aviso «(se abre en
  una ventana nueva)» puede pasar a `visually-hidden` para no romper la línea.

**Aceptación:** @s25–@s26.

### T5 — Reserva por chat (proto L254-315)

**Ficheros:** `ReservaChat.tsx`, `ReservaChat.module.scss`, `ReservaChat.test.tsx`.

- Rejilla `auto-fit minmax(min(320px,100%),1fr) gap clamp(28px,4vw,52px)
  align-items center` (ya es 2 columnas; ajusta medidas).
- Izquierda: eyebrow «Reserva rápida», `h2` «Pide cita en menos de un minuto»
  → **no** (promesa); mantén «Cuéntanos qué necesita tu mascota». Párrafo
  `17px/1.7 max-width 52ch`. Botones `margin-top 28px gap 12px`: **«WhatsApp»
  primario** (`fondo --color-acento-tinta; texto --color-sobre-primario;
  min-height 48px; padding 14px 26px`) usando
  `datosNegocio.telefonoMovil.enlaceMensajeria()`, y «Llamar a la clínica»
  fantasma. La lista de ventajas del prototipo («confirmamos en 2 h»…) **no**
  se copia: en su lugar la lista de horario real con el mismo formato de
  «✓» en círculo de 20 px `--color-acento-suave`, `14.5px`, `gap 11px`.
- Derecha — tarjeta del chat: `$radio-grande`, `--sombra-elevada`,
  `min-height 470px`, `flex column`. Cabecera `padding 15px 18px; border-bottom;
  fondo --color-superficie-elevada`: avatar «G» **40 px** circular primario
  (`Outfit 14px/700 .04em`), nombre `14.5px/700`, estado «Disponible» `12px
  --color-acento-tinta` con punto de 7 px `--color-acento`. Historial `flex:1;
  padding 18px; gap 10px; max-height 330px; overflow-y auto; fondo
  --color-fondo`; burbujas `max-width 84%; padding 11px 15px; 14.5px/1.55`;
  bot: `--color-superficie` + borde, radio `16px 16px 16px 5px`; usuario:
  `--color-primario`/`--color-sobre-primario`, radio `16px 16px 5px 16px`.
  Pie `padding 14px 18px 18px; border-top; fondo --color-superficie-elevada`:
  chips píldora `padding 10px 16px; min-height 44px; 13.5px/600; borde
  --color-borde-control` (hover borde primario + fondo acento-suave); input
  píldora `min-height 46px` + botón «→» circular 46 px primario; aviso de
  demostración `11.5px`.

**Aceptación:** @s27–@s28.

### T8 — FAQ (proto L424-442)

**Ficheros:** `Faq.tsx`, `Faq.module.scss`, `Faq.test.tsx`.

- Contenido estrechado a `max-width 860px; margin-inline auto` (@s18 de
  `rediseno_visual` ya lo contempla). Cabecera **centrada**: eyebrow «FAQ»,
  `h2` «Preguntas frecuentes».
- Lista `margin-top clamp(28px,4vw,40px); border-top 1px solid --color-borde`.
  Cada pregunta: `flex space-between center gap 20px; padding 20px 4px;
  min-height 48px; border-bottom`; texto `Outfit clamp(16px,2.1vw,19px)/500
  --color-tinta`; a la derecha **círculo de 30 px** `--color-acento-suave` con
  «+» `19px` (rota 45° al abrir). Respuesta `padding 0 4px 24px; 15.5px/1.75;
  max-width 70ch`. Mantén el acordeón excluyente y `aria-expanded/aria-controls`.

**Aceptación:** @s29.

### T10 — Barra de urgencias, cabecera y selector de paleta (proto L66-116, L476-500)

**Ficheros:** `BarraUrgencias.*`, `Cabecera.*`, `SelectorPaleta.*` y sus tests,
`global.scss` (`--altura-cabecera`/`--altura-barra-urgencias` si cambian).

- **Barra:** `13.5px`, `padding 9px 18px`, centrada, `gap 6px 14px`; punto
  blanco de 8 px pulsante + `{rotulo}` en `700` + «·» + teléfono subrayado
  `700`. (Ya está casi; ajusta tamaños y elimina cualquier texto de 24 h.)
- **Cabecera:** `position: sticky` (o fixed, como ahora) con fondo
  `color-mix(in srgb, var(--color-fondo) 88%, transparent)` +
  `backdrop-filter: blur(14px)` + `border-bottom 1px solid --color-borde`.
  Interior `padding 12px <inline>`. Marca: **logo real** (`/img/logo-galapavet.webp`)
  a 38 px con `$radio-medio` + bloque de texto (`Outfit 17px/600 -.01em` y
  descriptor `10.5px/600/.16em/uppercase --color-texto-suave`, `line-height 1.05`).
  Enlaces de nav: `padding 9px 11px; $radio-completo; 14px/500 --color-texto`;
  hover `fondo --color-acento-suave; color --color-acento-tinta`; `gap 2px`.
  Tras la lista: botón **«Urgencias»** píldora roja (`fondo --color-urgencia;
  texto --color-sobre-primario; padding 9px 15px; 13.5px/700`, punto blanco
  pulsante de 7 px) → `tel:` de urgencias (`rediseno_visual` @s28 ya lo pide) y
  «Tienda» fantasma `padding 8px 15px; 13.5px/600; border 1.5px`. Menú móvil:
  enlaces `padding 13px 12px; $radio-medio; 16px/500; min-height 46px` y al
  final el botón rojo de urgencias a ancho completo.
- **Selector de paleta:** botón **circular de 52 px** (`--color-superficie`,
  borde, `--sombra-elevada`) con un disco interior de 24 px
  `conic-gradient(var(--color-primario) 0 33%, var(--color-acento) 33% 66%,
  var(--color-urgencia) 66% 100%)` y `aria-label="Cambiar paleta de color"`
  (el texto visible desaparece). Posición `right/bottom clamp(14px,3vw,26px)`.
  Panel: `width min(268px, calc(100vw - 32px)); padding 14px; $radio-grande;
  --sombra-elevada`; rótulo «Paleta de color» `10.5px/700/.14em/uppercase`;
  cada opción `flex; gap 11px; padding 10px 12px; $radio-medio` con las 3
  muestras de 14 px y nombre `13.5px/700`. Estado activo con `aria-pressed`
  (como ahora) y fondo `--color-acento-suave`.

**Aceptación:** @s30–@s33.

---

## 4. Verificación (puerta de cierre)

```bash
bin/harness init
pnpm run verificar          # lint + typecheck
pnpm run test               # vitest
pnpm run build              # incluye la puerta anti-terceros
pnpm run test:e2e           # Playwright contra dist/ (axe, 320px, red limpia, CSS)
node tools/captura-comparativa.mjs   # progress/rediseno/capturas/*.png — MÍRALAS
bin/harness verify          # mutación al umbral
```

`tools/captura-comparativa.mjs` (adjunto) construye el `dist/`, lo sirve bajo
`/GalapavetClinicaVeterinaria/`, hace scroll para forzar las imágenes lazy y
guarda página completa a 1440 px y a 390 px, más un montaje lado a lado con
el prototipo renderizado. Si la captura no se parece al prototipo, el tramo
**no** está hecho.

## 5. Registro en el arnés

Añade a `feature_list.json` (id 26, `status: "in_progress"` al arrancar T0) y
copia `features/convergencia_visual_v2.feature`:

```json
{
  "id": 26,
  "name": "convergencia_visual_v2",
  "title": "Convergencia visual v2: la página pintada coincide con el prototipo",
  "description": "Corrige los tres bugs de raíz que anulaban el CSS de la feature 24 (ids hasheados por CSS Modules, hero recortado por aspect-ratio, espaciado(20) inexistente) y rehace la anatomía de hero, servicios, campañas, equipo, reserva, galería, contacto, FAQ, pie, cabecera y selector de paleta para que la portada publicada reproduzca el prototipo de Claude Design, conservando estrictamente los datos reales de Galapavet.",
  "acceptance": [
    "Ninguna regla de Landing.module.scss ni de un .module.scss depende de un selector de id",
    "El hero va a sangre, no recorta su contenido y presenta píldora, titular centrado, dos botones y banda de cifras reales",
    "Contacto se maqueta en dos columnas con tarjeta de formulario, tarjeta roja de urgencias y tarjeta de datos con mapa",
    "Servicios, campañas, equipo, galería, reserva, FAQ, pie, cabecera y selector adoptan la anatomía del prototipo con los datos del repositorio",
    "Las capturas de tools/captura-comparativa.mjs se han revisado tramo a tramo y se guardan en progress/rediseno/capturas/",
    "Tests, lint, typecheck, build, e2e y mutación superan todas las puertas del arnés"
  ],
  "sdd": true,
  "status": "spec_ready",
  "notas": "Spec y Gherkin aprobados por el humano el 03/09/2026 en progress/rediseno/HANDOFF_CONVERGENCIA_V2.md. Puerta humana superada: pasar a in_progress directamente."
}
```
