# Delta de fidelidad — Selector de paleta

> Informe de análisis (03/09/2026) para la feature `fidelidad_selector_paleta`.
> Sección: el conmutador flotante de variantes de color.
>
> Fuentes leídas (nunca estimadas):
> - Prototipo: `docs/diseno-claude-design/Veterinaria La Sierra.dc.html` (en
>   adelante `VLS`), líneas 17-49 (tokens), 477-501 (DOM del selector),
>   601-606 (`PALETAS`), 617-642 (estado y `aplicarTema`), 809-820
>   (`alternarSelector`, `paletas` y el estilo de cada fila).
> - Web: `src/components/SelectorPaleta.tsx`, `SelectorPaleta.module.scss`,
>   `SelectorPaleta-logica.ts`, sus dos tests, `src/App.tsx:70`, `index.html`
>   y el CSS compilado real `dist/assets/index-CCVUwotx.css`.
> - Capturas a 1280 px: `scratchpad/shots/diseno_00.png` (botón redondo en
>   x≈1202-1254, y≈822-874) y `scratchpad/shots/web_00.png` (píldora en
>   x≈1065-1263, y≈838-882).
>
> Nota sobre las capturas: los dos selectores son `position: fixed` y la
> captura a página completa los pinta en la esquina inferior derecha del
> PRIMER viewport, que en la web cae sobre el arranque de «Servicios». No está
> incrustado en Servicios: es la misma técnica de anclaje que el prototipo. La
> diferencia real es la FORMA del disparador y la anatomía del panel.

## Anatomía del prototipo

### Contenedor flotante (`VLS:478`)

| Propiedad | Valor |
| --- | --- |
| `position` | `fixed` |
| `right` / `bottom` | `clamp(14px, 3vw, 26px)` → 26 px a 1280 px de ancho; 14 px por debajo de 467 px; 3vw entre medias |
| `z-index` | `90` (la cabecera fija del prototipo lleva `60`, `VLS:77`; el único otro es `2`) |
| `display` | `flex`; `flex-direction: column`; `align-items: flex-end`; `gap: 10px` |
| Orden en el DOM | primero el panel (solo si `selectorAbierto`), después el botón redondo |
| Resultado visual | panel ENCIMA del botón, los dos pegados al borde derecho; el botón es lo único visible al cargar |
| `@media` | ninguno: todo se resuelve con `clamp()` y `min()` |

### Botón burbuja (`VLS:497`)

| Propiedad | Valor |
| --- | --- |
| Elemento | `<button type="button" aria-label="Cambiar paleta de color">` sin texto visible |
| Tamaño | `width: 52px; height: 52px` |
| Forma | `border-radius: 50%` |
| Borde | `1px solid var(--border)` |
| Fondo | `var(--card)` |
| Sombra | `var(--shadow)` (la ELEVADA del prototipo, `0 18px 45px rgba(15,32,60,.10)`; no `--shadow-sm`) |
| Maquetación | `display: flex; align-items: center; justify-content: center; padding: 0; cursor: pointer` |
| Estados | sin `:hover`, sin `aria-expanded` (`analisis_landing_secciones.md` §12 ya lo anota como carencia del prototipo) |

### Disco tricolor (`VLS:498`)

| Propiedad | Valor |
| --- | --- |
| Elemento | `<span>` decorativo dentro del botón |
| Tamaño | `24px × 24px`, `border-radius: 50%` |
| Relleno | `conic-gradient(var(--primary) 0 33%, var(--accent) 33% 66%, var(--urg) 66% 100%)` |
| Comportamiento | se recolorea solo al cambiar el tema porque lee los tres tokens del tema activo |

### Panel (`VLS:480`)

| Propiedad | Valor |
| --- | --- |
| Fondo | `var(--card)` |
| Borde | `1px solid var(--border)` |
| Radio | `18px` |
| Sombra | `var(--shadow)` (elevada, fija: no cambia con el puntero) |
| Relleno interior | `padding: 14px` |
| Ancho | `width: min(268px, calc(100vw - 32px))` (268 px en escritorio; 32 px de aire total en móvil) |

### Rótulo del panel (`VLS:481`)

| Propiedad | Valor |
| --- | --- |
| Texto | «Paleta de color» (visible, alineado a la izquierda) |
| Tipografía | `10.5px`, `font-weight: 700`, `letter-spacing: .14em`, `text-transform: uppercase`, DM Sans (herencia del `body`, `VLS:52`) |
| Color | `var(--muted)` |
| Margen | `margin-bottom: 10px` |

### Lista de filas (`VLS:482-492`, estilo en `VLS:816-820`)

| Propiedad | Valor |
| --- | --- |
| Contenedor | `display: flex; flex-direction: column; gap: 7px` |
| Recuento real | 4 filas (`PALETAS`, `VLS:601-606`; el `hint-placeholder-count="4"` coincide) |
| Fila | `<button type="button">`, `display: flex; align-items: center; gap: 11px; width: 100%; padding: 10px 12px; border-radius: 12px; min-height: 48px; text-align: left; cursor: pointer` |
| Fila inactiva | `background: transparent; border: 1.5px solid var(--border)` |
| Fila activa | `background: var(--accent-soft); border: 1.5px solid var(--primary)` |
| Transición | `background .3s ease, border-color .3s ease` |
| Estado accesible | ninguno (`aria-pressed` ausente; la selección solo se ve) |

### Muestras de color de cada fila (`VLS:485-487`, `sw()` en `VLS:813`)

| Propiedad | Valor |
| --- | --- |
| Contenedor | `display: flex; gap: 4px; flex-shrink: 0` |
| Cada muestra (×3) | `14px × 14px`, `border-radius: 50%`, `border: 1px solid rgba(0,0,0,.12)`, `background: <hex del array>` |
| Origen del color | literales del array `PALETAS.c` (`VLS:602-605`), NO los tokens del tema. `matriz_delta.md` T-12: `calida` declara `#D97706` frente a su `--primary` `#B45309`; `tech` declara `#64748B`, que no existe en ninguna paleta; `eco` declara `#A7F3D0` frente a su `--accent` `#0EA97B` |

### Textos de cada fila (`VLS:488-491`)

| Propiedad | Valor |
| --- | --- |
| Contenedor | `display: flex; flex-direction: column; text-align: left; min-width: 0` |
| Nombre | `13.5px`, `font-weight: 700`, `color: var(--ink)` |
| Nota | `11.5px`, `color: var(--muted)` (p. ej. «Azul cobalto · verde menta») |

### Comportamiento (`VLS:617-642`, `809-815`)

- `selectorAbierto` arranca en `false`; `alternarSelector` lo invierte.
- `elegir` → `aplicarTema(id)`: escribe `data-tema` en `<html>` y persiste en
  `localStorage['vls-tema']`; al cargar, lee esa clave o `props.tema`
  (`'clinica'` por defecto).
- El panel NO se cierra al elegir; no hay cierre con Escape ni al pulsar fuera.

### Correspondencia de tokens prototipo → repositorio

| Prototipo | Repositorio (`src/styles/_tokens.scss`) |
| --- | --- |
| `--card` | `--color-superficie` |
| `--surface` | `--color-superficie-elevada` |
| `--border` | `--color-borde` |
| `--shadow` | `--sombra-elevada` |
| `--shadow-sm` | `--sombra-reposo` |
| `--muted` | `--color-texto-suave` |
| `--ink` | `--color-tinta` |
| `--accent-soft` | `--color-acento-suave` |
| `--primary` | `--color-primario` |
| `--accent` | `--color-acento` |
| `--urg` | `--color-urgencia` |

## Estado actual de la web

### DOM (`src/components/SelectorPaleta.tsx:30-58`)

```
div.selector
├─ button[type=button][aria-expanded]           ← texto VISIBLE «Cambiar paleta de color»
└─ (si abierto) fieldset.panel[aria-label="Paleta de color"]
   └─ button[type=button][aria-pressed] × 5
      ├─ span.muestras[aria-hidden][data-muestra-variante=<id>]
      │  └─ span.muestra × 3
      └─ texto: nombre de la variante
```

- Montaje: `src/App.tsx:70`, después de `PieDePagina`, shell común a las 6
  rutas (`ensamblaje_landing` @s7/@s14).
- Orden DOM botón → panel (al revés que el prototipo). El panel se posiciona
  encima con `position: absolute`.
- Sin rótulo visible (solo `aria-label` en el `fieldset`), sin nota por
  variante, sin disco tricolor, sin borde en las filas.
- Lógica (`SelectorPaleta-logica.ts`): leer/guardar `galapavet-variante`,
  resolver la inicial; `index.html:53-91` anti-destello. Nada de esto cambia.

### CSS compilado real (`dist/assets/index-CCVUwotx.css`, clases `_1lcmf_*`)

| Pieza | Declaraciones efectivas |
| --- | --- |
| `.selector` | `position: fixed; inset-block-end: 16px; inset-inline-end: 16px; z-index: 20` |
| Disparador (`> button`, mixin `boton-fantasma` + overrides) | `display: inline-flex; min-height: 48px; min-width: 24px; border: 1.5px solid var(--color-borde-control); border-radius: 999px; background-color: var(--color-superficie-elevada); box-shadow: var(--sombra-reposo); color: var(--color-texto); font-size: 16px; font-weight: 600; gap: 8px; transition: border-color .15s ease-out; :hover → border-color: var(--color-primario)`. **Sin `padding-inline`**: el mixin escribe `padding-inline: espaciado(20)` (`_api.scss`) y la escala no tiene paso 20 → `map.get` devuelve `null` y Sass omite la declaración; queda el `6px` del agente de usuario |
| `.panel` (mixin `tarjeta` + overrides) | `position: absolute; inset-block-end: calc(100% + 8px); inset-inline-end: 0; display: flex; flex-direction: column; gap: 4px; padding: 12px; min-width: 220px; background-color: var(--color-superficie); border: 1px solid var(--color-borde); border-radius: 24px; box-shadow: var(--sombra-reposo); overflow: hidden; transition: box-shadow .3s ease-out; :hover → sombra reposo (revierte la elevación del mixin)` |
| Fila (`.panel button`) | `display: inline-flex; align-items: center; gap: 8px; padding-inline: 12px; min-width: 24px; min-height: 24px; border: none; border-radius: 12px; background: none; color: inherit; font-size: 12.8px; [aria-pressed=true] → background-color: var(--color-acento-suave); color: var(--color-acento-tinta); font-weight: 700` |
| `.muestras` / `.muestra` | `inline-flex; gap: 2px`; cada muestra `12px × 12px; border-radius: 50%`; sin borde; colores `var(--color-primario)` / `var(--color-acento)` / `var(--color-urgencia)` resueltos por `[data-muestra-variante='<id>']` (`_tokens.scss`, bloque de cada variante) |

### Lo que se ve en `web_00.png`

- Una píldora blanca de ~198 × 44 px con el texto «Cambiar paleta de color» en
  la esquina inferior derecha del primer viewport (sobre el arranque de la
  sección Servicios, a ~40 px del eyebrow «SERVICIOS»). Llama más la atención
  que el propio contenido: es el único control de texto suelto de la página.
- Texto casi pegado a los extremos de la píldora (el `padding-inline` perdido).
- El panel no aparece (cerrado por defecto, igual que en el prototipo).
- No hay rastro del disco tricolor ni de ningún icono.
- Nada cortado ni desbordado; no hay imágenes implicadas.

## Diferencias

| id | Qué cambia | Tipo | Prioridad |
| --- | --- | --- | --- |
| selector_paleta-1 | Disparador: píldora de texto (198 × 48, `border-radius: 999px`, `boton-fantasma`) → botón circular sin texto visible (`aria-label`), 52 px en el prototipo → `$altura-control-grande` (56 px) en la escala del repo, `border-radius: $radio-circulo`, `padding: 0` | estructura | alta |
| selector_paleta-2 | Disco tricolor de 24 px (`espaciado(24)`) con `conic-gradient(var(--color-primario) 0 33%, var(--color-acento) 33% 66%, var(--color-urgencia) 66% 100%)` dentro del disparador: hoy no existe | estilo | alta |
| selector_paleta-3 | Sombra: disparador y panel pasan de `--sombra-reposo` (y hover revertido) a `--sombra-elevada` fija, sin cambio con el puntero | estilo | media |
| selector_paleta-4 | Rótulo visible «Paleta de color» en versalitas espaciadas dentro del panel (hoy solo `aria-label`) | estructura | media |
| selector_paleta-5 | Filas con contorno: inactiva `borde fino var(--color-borde)` + fondo transparente; activa fondo `var(--color-acento-suave)` + borde de control `var(--color-primario)`. Hoy sin borde | estructura | media |
| selector_paleta-6 | Filas de dos líneas: nombre (700, `--color-tinta`) + nota (`--color-texto-suave`). Hoy una línea, color heredado, 700 solo la activa | estructura | media |
| selector_paleta-7 | Panel: `min-width: 220px` → `width: min(268px, calc(100vw - 2 × offset))`; borde `1px` se mantiene; radio 18 px del prototipo → se mantiene `$radio-grande` (24 px) por Decisión 24 y se declara la desviación | estilo | media |
| selector_paleta-8 | Muestras: 12 px sin borde y `gap: 2px` → prototipo 14 px con borde; repo: `espaciado(12)` (se mantiene, desviación 14→12 declarada), `border: $ancho-borde-fino solid var(--color-borde)`, `gap: espaciado(4)` | estilo | baja |
| selector_paleta-9 | Offsets del contenedor: `16px` fijos → prototipo `clamp(14px, 3vw, 26px)`; repo: `clamp(espaciado(16), 3vw, espaciado(24))` (G-03 de `matriz_delta.md` prohíbe copiar el clamp del prototipo tal cual) | estilo | baja |
| selector_paleta-10 | Fila: `min-height` 24 → `$altura-control-media` (48 px, igual que el prototipo); `padding` → `espaciado(8) espaciado(12)` (10→8 declarado); `gap` 8 → `espaciado(12)` (11→12 declarado); `width: 100%`; `text-align: left` | estilo | baja |
| selector_paleta-11 | Panel: `gap` entre filas 4 → `espaciado(8)` (7→8); `padding` 12 → `espaciado(16)` (14→16); separación panel↔botón se queda en `espaciado(8)` (10→8) | estilo | baja |
| selector_paleta-12 | Transición de fila `background-color, border-color 150ms ease-out` dentro de `@media (prefers-reduced-motion: no-preference)` (prototipo `.3s ease`, fuera de la escala del repo) | estilo | baja |
| selector_paleta-13 | `padding-inline: espaciado(20)` del mixin `boton-fantasma` (`_api.scss`) resuelve a `null`: ningún botón fantasma del sitio tiene relleno lateral (hero «Llamar», galería, «Ver campañas», «Tienda» de la cabecera). El selector deja de usar el mixin, pero el bug es transversal y hay que reportarlo al lead (`Equipo.module.scss:48` tiene el mismo `espaciado(20)` y compila a `margin: 0`) | bug | media |
| selector_paleta-14 | Nota por variante: no existe en `VariantePaleta` (ver «Datos reales necesarios») | dato | baja |
| selector_paleta-15 | Tipografía: nombre `paso-tipografico(-1)` (12.8 px, prototipo 13.5) y 700 SIEMPRE, `--color-tinta`; nota `paso-tipografico(-2)` (10.24 px, prototipo 11.5), `--color-texto-suave`; rótulo `paso-tipografico(-2)`, 700, `letter-spacing: .12em` (repo, prototipo .14em), `uppercase`, `--color-texto-suave` | estilo | baja |
| selector_paleta-16 | Disparador: eliminar el `:hover` de borde a primario del mixin (el prototipo no tiene hover); borde `$ancho-borde-fino solid var(--color-borde)` y fondo `var(--color-superficie)` (prototipo `--card`), hoy `--color-superficie-elevada` | estilo | baja |
| selector_paleta-17 | Orden DOM: el prototipo pone el panel ANTES del botón; la web lo pone después. NO se cambia: el orden botón → panel es el correcto para lectores de pantalla (`aria-expanded` precede a lo que controla) y `ensamblaje_landing` @s14 solo exige que no se interponga entre secciones | estructura | baja (sin cambio) |

## Datos reales necesarios

| Campo que pide la anatomía | ¿Existe? | Dónde | Alternativa si no existe |
| --- | --- | --- | --- |
| Catálogo de variantes (id + orden) | Sí | `src/lib/diseno/contratoRedisenho.ts:24` (`VARIANTES_REDISENO`: `clinica`, `calida`, `tech`, `eco`, `marca`), `src/data/variantesPaleta.ts` | — |
| Nombre visible de cada variante | Sí | `src/data/variantesPaleta.ts` («Clínica», «Cálida», «Tech», «Eco», «Marca Galapavet») | — |
| Colores de las 3 muestras por fila | Sí, y solo de aquí | `src/styles/_tokens.scss` vía `[data-muestra-variante='<id>']` (`--color-primario`, `--color-acento`, `--color-urgencia`) | Nunca el array `PALETAS.c` del prototipo (T-12: no coincide ni con sus propios tokens) |
| Colores del disco del disparador | Sí | Los mismos tres tokens de la variante ACTIVA (`:root[data-variante]`), sin atributo extra | — |
| Nombre accesible del disparador y del grupo | Sí | `SelectorPaleta.tsx:7-8` («Cambiar paleta de color», «Paleta de color») | — |
| Nota descriptiva por variante (2.ª línea) | **No** | Ni en `src/data/*`, ni en `src/lib/site.ts`, ni en `docs/datos-galapavet.md` | Ver abajo |
| Datos de negocio (`site.ts`) | No hacen falta | — | Esta sección no muestra ningún dato de la clínica |

Sobre la nota (segunda línea de cada fila):

- NO se copian las del prototipo («Azul cobalto · verde menta», «Terracota ·
  oliva · crema», «Azul marino · cian neón», «Esmeralda · menta clara»): son
  texto del prototipo, y además describen colores que en el repo se derivaron
  con otra regla (`--color-borde`, `--color-texto-suave` de `calida`…).
- NO se reutiliza la tabla de notas de `features/selector_paleta.feature`
  («Morado sobre claro», «Superficie lima, texto oscuro encima»…): pertenece
  al catálogo derogado `marca/lima/verde/noche`.
- Opción honesta A — dejar el hueco: `nota?: string` opcional; si falta, la
  fila es de una sola línea (patrón «dato ausente → no se renderiza el
  bloque», `project-spec.md`). Se pierde la segunda línea de la anatomía.
- Opción honesta B — texto de PROCEDENCIA, verificable en el repositorio y que
  no afirma nada sobre la clínica: para `clinica`, `calida`, `tech` y `eco`
  «Tema del diseño aprobado» (son los cuatro temas de `VLS:18-49`, que
  `src/lib/diseno/fidelidadPrototipo.ts` compara rol a rol); para `marca`
  «Colores del logotipo» (`docs/datos-galapavet.md` §10: morado, lima y verde
  profundo muestreados del logo). Recomendada, pero es una decisión de copy
  que debe aprobar el humano en el `.feature`; hasta entonces, A.
- En ningún caso la nota puede contener un literal de id de variante escrito
  a mano (`'clinica'`…): `rediseno_visual` @s10 exige que ese identificador se
  declare UNA vez en todo el código ejecutable (`SelectorPaleta-logica.test.ts`
  recorre todos los `.ts`/`.tsx`).

## Conflictos con el contrato vigente

| Contrato | Escenario | Tensión | Propuesta |
| --- | --- | --- | --- |
| `features/selector_paleta.feature` (feature 14, `done`) | @s2, @s5-@s8, @s11-@s13, @s16 | Hablan de 4 variantes `marca/lima/verde/noche` con `marca` por defecto. Están DEROGADOS de hecho por `rediseno_visual` @s1 (5 variantes en orden), @s10 (por defecto `clinica`) y @s37 (cinco variantes), y los tests actuales (`SelectorPaleta.test.tsx`) ya prueban los 5 ids nuevos. El fichero no se enmendó | Respetar lo vigente (`rediseno_visual`). Anotar en la cabecera de `selector_paleta.feature` la derogación (fuera del alcance de este delta; lo hace el lead) |
| `features/selector_paleta.feature` | @s1 | «botón con nombre accesible “Cambiar paleta de color”, `aria-expanded` false, sin grupo al cargar» | Respetar: el botón circular conserva `aria-label` y `aria-expanded`. Su cabecera (punto 4) exige el estado en ARIA, nunca en clase ni estilo: los estilos activos se cuelgan de `[aria-pressed='true']` y el panel de `aria-expanded` |
| `features/ensamblaje_landing.feature` | @s7, @s14 | Botón en las 4 rutas; botón y panel fuera del rango de las 8 secciones | Respetar: el montaje en `App.tsx:70` no cambia |
| `features/rediseno_visual.feature` | @s37 | «ofrece cinco variantes; la activa es la aplicada; las muestras se leen de los tokens, no de una lista aparte; aplica y recuerda» | Respetar. El test `@s37 las muestras se pintan leyendo los tokens` exige EXACTAMENTE 3 reglas `.muestra:nth-child(n) { background-color: var(--color-…) }` en el orden primario/acento/urgencia y ningún `#RRGGBB` desde `.muestras` hasta el final del fichero: mantener literalmente ese bloque; el disco va en una clase distinta (`.disco`) con `background:` (no `background-color`) y solo tokens |
| `features/rediseno_visual.feature` | @s10, @s12 | Declaración única de la variante por defecto; `:root` de emergencia | Sin tensión: no se toca `index.html`, `contratoRedisenho.ts` ni `variantesPaleta.ts` (salvo el campo opcional `nota`, sin literales de id) |
| `features/rediseno_visual.feature` | @s15 (`usoDelAcento.ts`) | `var(--color-acento)` solo en propiedades `background*`/`fill`, nunca `color:` ni `border*` | El disco usa `background: conic-gradient(...)` → clasificado «relleno». La muestra 2 ya lo cumple |
| `features/rediseno_visual.feature` | @s11 (`matrizDeContraste.ts:341-381`, test `toHaveLength(21)`) | La fila ACTIVA pinta `--color-tinta` (nombre) y `--color-texto-suave` (nota) sobre `--color-acento-suave`: dos pares que la matriz no declara | Enmendar la matriz con 2 filas nuevas y subir el literal 21→23. Ratios calculados con la fórmula WCAG sobre los hex reales de `_tokens.scss` (clinica/calida/tech/eco/marca): tinta sobre acento-suave **15.67 / 12.55 / 11.21 / 12.99 / 11.90**; texto-suave sobre acento-suave **4.70 / 4.85 / 4.79 / 4.67 / 5.09** → las diez aprueban 4.5 (la más justa, `eco` 4.67). Alternativa sin tocar la matriz: nota en `--color-acento-tinta` sobre la fila activa (par ya declarado; 4.99 / 6.46 / 8.47 / 6.90 / 5.27), a costa de apartarse del `--muted` del prototipo |
| `features/identidad_visual.feature` @s7 / SC 1.4.11 | Borde decorativo vs borde de control | El prototipo pone `1.5px var(--border)` en filas inactivas y `1px var(--border)` en el botón; en el repo `--color-borde` nunca identifica un control | Filas inactivas: `$ancho-borde-fino solid var(--color-borde)` (precedente: mixin `pildora-filtro`, `_api.scss`). Fila activa: `$ancho-borde-control solid var(--color-primario)` (primario sobre superficie ≥ 4.94 y sobre acento-suave ≥ 4.58 en las 5 → cumple 3:1). Disparador: `$ancho-borde-fino solid var(--color-borde)` — lo identifican el disco y la sombra, no el borde |
| `features/identidad_visual.feature` @s16 (`escalaMovimiento.ts`) y `sistema_de_diseno_visual` @s33 | Escala 150/300 ms, `ease-out`, nunca `all`; toda transición dentro de `prefers-reduced-motion: no-preference` | La `.3s ease` del prototipo no vale | `transition: background-color 150ms ease-out, border-color 150ms ease-out` dentro del `@media` |
| `rediseno_visual.feature` cabecera (Decisión 24) y `matriz_delta.md` G-03/G-05 | «Donde un valor del prototipo no cae en la rejilla de 8 px o en la escala del repo, manda la escala y la desviación se declara» | 52 → 56 px (`$altura-control-grande`); radio 18 → 24 (`$radio-grande`); muestras 14 → 12; padding 14 → 16; gaps 7 → 8, 11 → 12, 10 → 8; tipografías 10.5/13.5/11.5 → pasos −2/−1/−2; `clamp(14px,3vw,26px)` → `clamp(16px,3vw,24px)` | Declarar cada desviación en un comentario del `.module.scss` y en el `.feature` |
| `src/lib/puertaLiteralesColor.ts` | (puerta de todo `.module.scss`) | Prohíbe hex, `rgb()/rgba()/hsl()` y los 16 nombres CSS de color, TAMBIÉN en comentarios | El `rgba(0,0,0,.12)` del borde de las muestras → `var(--color-borde)`. Ojo con comentarios que digan «white», «black», «red», «blue», «green», «lime», «gray»… |
| `features/rediseno_visual.feature` | @s45 (axe, 30 combinaciones), @s47 (consola), @s48 (CSS ≤ 8000 B) | Botón solo icono; nota dentro del botón; CSS nuevo | `aria-label` en el disparador; nombre accesible de cada fila = SOLO el nombre (`aria-labelledby` al `span` del nombre, `aria-describedby` a la nota); el CSS añade < 1 KB sin comprimir sobre los 5791 B medidos (`css-presupuesto.spec.ts`) |
| `tests/e2e/accesibilidad.spec.ts` @s29 (`sistema_de_diseno_visual`) | Todo control visible ≥ 24 × 24 | Disparador 56 × 56, filas ≥ 48 de alto | Cumple |
| `features/rediseno_visual.feature` | @s44 (320 px sin desbordar) | Ancho del panel | `width: min(268px, calc(100vw - 2 × offset))` + `position: fixed` → no aporta `scrollWidth`; lo verifica el E2E existente |

## Tests que romperán

### Unitarios (`src/**/*.test.ts(x)`)

| Test | Motivo |
| --- | --- |
| `src/lib/diseno/matrizDeContraste.test.ts` → «la matriz declara los veintiún pares…» (`toHaveLength(21)` en las líneas 437 y 442) | Rompe si se añaden las 2 filas (tinta/acento-suave, texto-suave/acento-suave). Enmienda deliberada: 21 → 23, y las filas nuevas citan `SelectorPaleta.module.scss:<línea>` |
| `src/components/SelectorPaleta.test.tsx` → `@s37 las muestras se pintan leyendo los tokens…` | Rompe si el bloque `.muestras { .muestra:nth-child(n) { background-color: var(--color-…) } }` cambia de formato (una llave o un salto de línea distinto ya no casa con la regex) o si aparece un hex/`rgba` después de `.muestras`. Mantener el bloque tal cual, con el borde añadido en `.muestra`, no en las reglas `nth-child` |
| `src/components/SelectorPaleta.test.tsx` → `@s4` (`container.querySelectorAll('[data-muestra-variante]')` = 5) | Rompe si al disco se le pone `data-muestra-variante` para «heredar» tokens (serían 6). No hace falta: el disco lee los tokens de `:root[data-variante]` |
| `src/components/SelectorPaleta-logica.test.ts` → `@s10 … el identificador se declara UNA sola vez` | Rompe si el `.tsx`, el `-logica.ts` o `variantesPaleta.ts` escriben `'clinica'` como literal (p. ej. en un mapa de notas). Indexar por `variante.id` / `VARIANTES_REDISENO[n]` |
| `src/lib/diseno/usoDelAcento.test.ts`, `escalaMovimiento.test.ts`, `movimientoRespetuoso.test.ts`, `rolesDescartados.test.ts`, `src/lib/puertaLiteralesColor.test.ts`, `src/styles/hoja-global.test.ts` | Globan `components/*.module.scss`. No rompen si se respetan las reglas; romperían con `var(--color-acento)` en `border`/`color`, una duración que no sea 150/300 ms, una transición fuera de `prefers-reduced-motion`, `rgba(`/hex/nombre de color (incluidos comentarios) o reglas para `html`/`body`/`#root` |
| `src/components/SelectorPaleta.test.tsx` → `@s1`, `@s2`, `@s3`, `@s5`-`@s8`, `@s15`, `@s16`; `src/App.test.tsx` → `@s7`, `@s14` | NO rompen: localizan por nombre accesible («Cambiar paleta de color» pasa de texto a `aria-label`, mismo nombre) y por `aria-expanded`/`aria-pressed`. `@s2` compara `textContent.includes(nombre)` → sigue siendo 1 por variante mientras ninguna nota contenga el nombre de OTRA variante |

### E2E (`tests/e2e/*.spec.ts`)

| Test | Motivo |
| --- | --- |
| `rediseno-visual.spec.ts:78`, `tokens-aplicados.spec.ts:67`, `accesibilidad.spec.ts:505`, `fidelidad.spec.ts:58` (`getByRole('button', { name: 'Clínica', exact: true })`…) y `movimiento.spec.ts:33`, `red-limpia.spec.ts:126` (`'Marca Galapavet', exact: true`) | ROMPEN si la nota entra en el nombre accesible del botón de fila («Clínica Tema del diseño aprobado» ≠ «Clínica» con `exact: true`). Obligatorio `aria-labelledby` al `span` del nombre (o nota `aria-hidden`, peor para AT) |
| `movimiento.spec.ts` @s42 (transiciones fuera de escala y animaciones en curso tras pulsar el selector) | Rompe si la transición nueva no es 150/300 ms `ease-out` o no queda anulada a 0.01 ms con `reduce` |
| `accesibilidad.spec.ts` @s45 (axe × 30) | Rompería con un botón sin nombre accesible o con `aria-describedby` apuntando a un `id` inexistente (solo referenciar la nota cuando se renderiza) |
| `css-presupuesto.spec.ts` @s48/@s49 | Solo si el CSS servido superase 8000 B comprimidos (hoy 5791 B); verificar tras `build` |
| `geometria-escalas.spec.ts` @s23/@s24, `layout.spec.ts`, `tipografia.spec.ts` | No tocan el selector: no rompen |

## Plan de cambio

Regla general: la lógica pura va a `SelectorPaleta-logica.ts` (Stryker la muta
al 100 %); el `.tsx` solo cablea; los valores visuales viven en el
`.module.scss` y se anclan con tests `?raw` sobre el texto real (patrón ya
usado por `@s37`).

1. **Contrato** — `features/fidelidad_selector_paleta.feature` (lo escribe
   `gherkin_author`, aprueba el humano): escenarios para el disparador
   circular con disco, el panel con rótulo visible, filas con contorno y dos
   líneas, sombra elevada fija, nombre accesible exacto por fila, desviaciones
   de escala declaradas, y la decisión A/B sobre la nota.

2. **`src/data/variantesPaleta.ts`** — añadir `readonly nota?: string` a
   `VariantePaleta`. Rellenarla SOLO si el `.feature` aprueba la opción B, sin
   literales de id (`VARIANTES_REDISENO[n]` ya se usa). Test nuevo en
   `variantesPaleta.test.ts`: cada nota presente no está vacía, no contiene el
   nombre de otra variante ni ninguno de los literales de la clínica ficticia
   (`@s49`), y hay exactamente 5 entradas.

3. **`src/components/SelectorPaleta-logica.ts`** — funciones puras nuevas,
   cada una con test en `SelectorPaleta-logica.test.ts` (valores concretos,
   catálogo sintético y casos degenerados):
   - `idsDeFilaDeVariante(id): { nombre: string; nota: string }` →
     `selector-paleta-nombre-<id>` / `selector-paleta-nota-<id>` (ids
     deterministas para `aria-labelledby` / `aria-describedby`).
   - `modeloDeFila(variante, activa): { id, nombre, nota: string | undefined, activa: boolean, idNombre, idNota: string | undefined }` —
     `idNota` es `undefined` cuando no hay nota (así el `.tsx` nunca referencia
     un `id` que no existe). Tests: con nota / sin nota / activa true y false /
     el `idNombre` termina en el id.

4. **`src/components/SelectorPaleta.tsx`** — solo cableado:
   - Disparador: `<button type="button" aria-label={NOMBRE_ACCESIBLE_BOTON} aria-expanded={abierto} className={styles.disparador}><span aria-hidden="true" className={styles.disco} /></button>`.
     Sin texto visible.
   - Panel: `<fieldset className={styles.panel}><legend className={styles.rotulo}>Paleta de color</legend>…</fieldset>`
     (el `legend` da el nombre accesible del grupo; se retira el `aria-label`
     redundante o se conserva con el mismo texto — en ambos casos
     `getByRole('group', { name: 'Paleta de color' })` sigue funcionando).
   - Fila: `<button type="button" aria-pressed={fila.activa} aria-labelledby={fila.idNombre} aria-describedby={fila.idNota}>` con
     `span.muestras[aria-hidden][data-muestra-variante]` × 3 `span.muestra`
     (sin cambios) + `span.textos` → `span#idNombre.nombre` + (si `fila.nota`)
     `span#idNota.nota`.
   - Tests nuevos en `SelectorPaleta.test.tsx`: (a) el disparador no tiene
     texto visible (`textContent.trim() === ''`) y contiene exactamente un
     `span[aria-hidden]`; (b) el nombre accesible de cada fila es EXACTAMENTE
     el nombre (`getByRole('button', { name: 'Clínica' })` con `exact`), y
     `aria-describedby` apunta a un elemento existente cuyo texto es la nota,
     o está ausente si no hay nota; (c) el rótulo «Paleta de color» es texto
     visible dentro del grupo; (d) con un catálogo sintético sin notas no se
     renderiza ningún `span.nota`.

5. **`src/components/SelectorPaleta.module.scss`** — reescritura, con las
   desviaciones de escala comentadas (sin nombres de color en los comentarios):
   - `.selector`: `position: fixed; inset-block-end: clamp(#{espaciado(16)}, 3vw, #{espaciado(24)}); inset-inline-end: <ídem>; z-index: 20; display: flex; flex-direction: column; align-items: flex-end; gap: espaciado(8)`.
   - `.disparador`: `@include foco-visible; width: $altura-control-grande; height: $altura-control-grande; padding: 0; display: grid; place-items: center; border: $ancho-borde-fino solid var(--color-borde); border-radius: $radio-circulo; background-color: var(--color-superficie); box-shadow: var(--sombra-elevada); cursor: pointer` (sin `:hover`).
   - `.disco`: `width: espaciado(24); height: espaciado(24); border-radius: $radio-circulo; background: conic-gradient(var(--color-primario) 0 33%, var(--color-acento) 33% 66%, var(--color-urgencia) 66% 100%)`.
   - `.panel`: `position: absolute; inset-block-end: calc(100% + #{espaciado(8)}); inset-inline-end: 0; width: min(268px, calc(100vw - 2 * #{espaciado(16)})); margin: 0; padding: espaciado(16); display: flex; flex-direction: column; gap: espaciado(8); background-color: var(--color-superficie); border: $ancho-borde-fino solid var(--color-borde); border-radius: $radio-grande; box-shadow: var(--sombra-elevada)` (sin mixin `tarjeta`: ni hover ni `overflow: hidden`). El 268 px se declara como ancho propio del componente (no cae en la escala; desviación documentada) o se sustituye por `calc(#{espaciado(96)} * 3 - #{espaciado(24)})`.
   - `.rotulo` (`legend`): `padding: 0; margin-block-end: espaciado(8); font-size: paso-tipografico(-2); font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--color-texto-suave)`.
   - `.panel button` (fila): `@include foco-visible; @include area-tactil-minima; display: flex; align-items: center; gap: espaciado(12); width: 100%; min-height: $altura-control-media; padding: espaciado(8) espaciado(12); text-align: left; border: $ancho-borde-fino solid var(--color-borde); border-radius: $radio-medio; background-color: transparent; color: inherit; cursor: pointer; @media (prefers-reduced-motion: no-preference) { transition: background-color 150ms ease-out, border-color 150ms ease-out; } &[aria-pressed='true'] { background-color: var(--color-acento-suave); border-width: $ancho-borde-control; border-color: var(--color-primario); }`.
   - `.textos`: `display: flex; flex-direction: column; min-width: 0`. `.nombre`: `font-size: paso-tipografico(-1); font-weight: 700; color: var(--color-tinta)`. `.nota`: `font-size: paso-tipografico(-2); color: var(--color-texto-suave)`.
   - `.muestras`: mantener el bloque literal de las 3 reglas `nth-child`; cambiar solo `gap: espaciado(4)` y `flex-shrink: 0`. `.muestra`: añadir `border: $ancho-borde-fino solid var(--color-borde)`; tamaño `espaciado(12)` se conserva.
   - Tests `?raw` nuevos en `SelectorPaleta.test.tsx` (mismo patrón que `@s37`): `.disparador` declara `border-radius: $radio-circulo` y `width`/`height: $altura-control-grande`; `.disco` declara `background: conic-gradient(` con `var(--color-primario)`, `var(--color-acento)`, `var(--color-urgencia)` en ese orden y sin hex; `.selector` declara `position: fixed`; `.panel` y `.disparador` usan `var(--sombra-elevada)` y no hay `&:hover` en el fichero; la única transición del fichero está dentro de `prefers-reduced-motion: no-preference` y sus duraciones son 150ms.

6. **`src/lib/diseno/matrizDeContraste.ts`** — añadir
   `{ rol: 'tinta', fondo: 'acento-suave', uso: 'texto normal' }` y
   `{ rol: 'texto-suave', fondo: 'acento-suave', uso: 'texto normal' }` con la
   cita `SelectorPaleta.module.scss:<línea>`; en `matrizDeContraste.test.ts`
   subir 21 → 23 (ambas aserciones). El test `@s11` recalcula los ratios en
   las 5 variantes (valores esperados arriba: mínimo 4.67).

7. **E2E** — `tests/e2e/fidelidad-selector-paleta.spec.ts` (o ampliar
   `rediseno-visual.spec.ts`): (a) el disparador mide 56 × 56 ± 1, su
   `border-radius` computado es `50%`, `position` `fixed`, y su distancia a los
   bordes derecho e inferior del viewport es 24 px a 1440 px y 16 px a 320 px;
   (b) el `background-image` computado del disco contiene `conic-gradient`;
   (c) al abrir, el panel queda encima del botón (`panel.bottom <= boton.top`)
   y alineado a su borde derecho (|Δ| < 1 px), con ancho 268 px a 1440 px y
   `100vw - 32` a 320 px; (d) el nombre accesible de cada fila es exacto
   (reutiliza `VARIANTES_DEL_SELECTOR`); (e) `document.documentElement.scrollWidth <= innerWidth`
   a 320 px con el panel abierto.

8. **Bug transversal (fuera de este delta, reportar al lead)** — `_api.scss`
   `boton-fantasma`: `padding-inline: espaciado(20)` → paso inexistente; y
   `Equipo.module.scss:48` `margin: espaciado(20) espaciado(20) 0` → compila a
   `margin: 0`. Un test sobre `_api.scss`/`_tokens.scss` que compruebe que todo
   `espaciado(n)` usa una clave de `$escala-espaciado` cerraría el hueco.

9. **Cierre** — `judge` sobre el `.feature` nuevo; `bin\harness.ps1 verify`
   (mutación al 100 % sobre `SelectorPaleta-logica.ts` y `matrizDeContraste.ts`);
   captura de comprobación a 1280 px comparada con `diseno_00.png`.
