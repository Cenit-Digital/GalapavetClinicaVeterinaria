# Matriz de deltas -- rediseno visual Galapavet

> **Regla de este documento.** Cada celda es rastreable a una linea concreta de
> un fichero concreto, citada como `fichero:linea`. Lo que no esta en ninguna
> fuente se escribe **NO CONSTA EN LA FUENTE** y, cuando hace falta una
> propuesta, se marca como **PROPUESTA** y se dice de que se deriva y con que
> se ha verificado. Nada esta escrito de memoria.
>
> **Fecha:** 26/08/2026. **Rama:** `main`, commit de partida `3cb93ec`.

## Fuentes de esta sintesis

| Alias | Fichero | Que aporta |
|---|---|---|
| `TOK` | `progress/rediseno/analisis_tokens_geometria.md` | 38 hallazgos: paleta, radios, sombras, tipografia, espaciado, rejillas, breakpoints del prototipo |
| `LAN` | `progress/rediseno/analisis_landing_secciones.md` | 36 hallazgos: anatomia seccion a seccion de la landing del diseno |
| `SUB` | `progress/rediseno/analisis_subpaginas.md` | 38 hallazgos (H-01..H-38): Tienda, Campanas y Blog del diseno |
| `MOD` | `progress/rediseno/analisis_modulos_actuales.md` | 18 hallazgos: inventario de la implementacion real (18 modulos) |
| `TES` | `progress/rediseno/analisis_impacto_tests.md` | 53 hallazgos: 27 roturas ciertas, 16 condicionales, 8 huecos, 2 colaterales |
| `CON` | `progress/rediseno/analisis_contraste_paletas.md` | 6 hallazgos (H1-H6): contraste WCAG de las 5 paletas |
| `NAV` | `progress/rediseno_mediciones_navegador.md` | Medicion independiente en Chromium real (Playwright 1.62.1, 1440x900) del diseno y del sitio desplegado |

Prototipo (`docs/diseno-claude-design/`): `VLS` = `Veterinaria La Sierra.dc.html`,
`TIE` = `Tienda.dc.html`, `CAM` = `Campanas.dc.html`, `BLO` = `Blog.dc.html`.

---

## 0. Correcciones aplicadas de la fase de refutacion

Las 37 correcciones de los refutadores adversariales. En las 37 la version del
refutador es la correcta: se ha comprobado en la fuente y **ninguna refutacion
es erronea**. Los valores de la columna «corregido» son los que se usan en el
resto de esta matriz.

### 0.1 `analisis_tokens_geometria.md` (14)

| # | Afirmacion original | Corregido |
|---|---|---|
| C-01 | §4.4 fila `12px` incluye los labels `VLS:367,370,374,377,386` | Esas 5 lineas son `font-size:13px`; la fila `12px` se queda sin ellos |
| C-02 | `gap:12px` incluye `VLS:364` | `VLS:364` es `gap:16px`; la lista de `gap:12px` en VLS es `125,172,224,260,274` |
| C-03 | `gap:14px` incluye `VLS:398` | `VLS:398` es `gap:16px`; la lista de `gap:14px` en VLS es `191,223,366,399` |
| C-04 | `border-radius:50%`: 18 usos en VLS | **19** usos: falta `VLS:278` (punto verde «en linea») |
| C-05 | El FAQ es «la unica seccion de la landing que no usa 1220px» | Son **dos**: hero `max-width:900px` (`VLS:119`) y FAQ `max-width:860px` (`VLS:425`) |
| C-06 | H19: 17 techos de `clamp` vertical | **18** techos: falta `140px` (`VLS:119`); lista 140/104/100/92/90/84/80/76/72/64/60/56/48/44/40/36/32/30 |
| C-07 | H14: `19px TIE:123` es un H2 y las subpaginas tienen H2 fijos | `TIE:123` es un `<span>`; TIE tiene un unico `<h2>`, `TIE:95` a 18px. Y `BLO:315` es fluido: `clamp(21px,2.8vw,26px)` |
| C-08 | `VLS:121` es un punto de pulso | Los puntos de pulso son `VLS:69,95,128,401`; `VLS:121` es estatico, hex literal `#4ADE80` |
| C-09 | §4.4 fila `11px`: todas con `uppercase` y `letter-spacing` | `VLS:165` es 11px/700 **sin** `uppercase` ni `letter-spacing`; solo aplican a `VLS:458`, `CAM:151`, `BLO:114`, `BLO:134` |
| C-10 | §5.5 listas de `gap` completas | Faltaban: `gap:9px` +`VLS:164`; `gap:7px` +`VLS:482`; `gap:11px` +`VLS:447`; `gap:10px` +`VLS:389`; `gap:22px` +`TIE:84` |
| C-11 | §4.4 listas de tamanos completas | Faltaban: 10.5px +`BLO:92`; 12.5px +`CAM:146`; 13px +`TIE:136`,`CAM:179`; 13.5px +`TIE:287`,`BLO:97`; 14px +`TIE:60`; 14.5px +`CAM:96` |
| C-12 | `padding:20px 22px 22px` solo en `BLO:113` | Tambien en `VLS:409` |
| C-13 | H35: la cabecera sticky mide 63px | **63px en escritorio; 71px en movil** (boton hamburguesa de 46px, `VLS:696`). Sigue sin coincidir con `scroll-padding-top:88px` (`VLS:51`) |
| C-14 | El inventario de color de §1 es completo | Faltan colores fuera del sistema de tokens: `#0B1B33` (`VLS:118`, `CAM:108`), `#4ADE80` (`VLS:121`), `#F87171` (`VLS:128`) y los `rgba(6,16,32,...)` de `VLS:118`, `CAM:316`, `TIE:120`. **El hero no responde al conmutador de paleta** |

### 0.2 `analisis_impacto_tests.md` (13)

| # | Afirmacion original | Corregido |
|---|---|---|
| C-15 | `test` en `package.json:20`, `test:e2e` en `:22` | `vitest run` en **`package.json:18`**; `test:e2e` en **`package.json:21`** |
| C-16 | 9 tests leen `lima`/`verde`/`noche` y lanzan | **11** bloques `it`: `tokensColor.test.ts` L65, L88, L100, L122, L136, L150, L164, L179, L345, **L445** y L549 |
| C-17 | A2: ratios 8.57 y 1.77 en L47 y L59 | **`tokensColor.test.ts:82`** (8.57) y **`:94`** (1.77) |
| C-18 | A5: itera en L130, `toEqual` en L136 | Iteracion en **`:165`**, `toEqual([9.13, 8.57, 8.22])` en **`:171`** |
| C-19 | A6: itera en L149, asercion 1.89 en L145-147 | Iteracion en **`:184`**, asercion del 1.89 en **`:180-182`** |
| C-20 | B8 incluye `escalaTipografica.test.ts:23` (@s14) | @s14 es **inmune** (compara la constante importada consigo misma). El que rompe es **`escalaTipografica.test.ts:18`** (@s13, literal `1024` a mano en `:11`) |
| C-21 | `Cabecera.test.tsx:6` + 11 usos | `:6` + **14** usos: L35, 44, 53, 76, 85, 96, 120, 136, 154, 172, 180, 195, 206, 232 |
| C-22 | Fuera de `src/`, `1024` solo en 6 sitios | **+18 apariciones**: `features/cabecera_y_navegacion.feature:80,84,106` (`:106` es la linea que FIJA el valor) y `features/sistema_de_diseno_visual.feature:24,36,176,318,323,328,363,365,434,443,444,445,446,452,453` |
| C-23 | Rangos @s3..@s10 de `tokensColor.test.ts` | Cada `describe` cierra una linea antes: @s3 L64-85, @s4 L87-97, @s5 L99-119, @s6 L121-133, @s7 L135-147, @s8 L149-161, @s9 L163-176, @s10 L178-188 |
| C-24 | B10: `PieDePagina.test.tsx:18` es el `it` de @s1 | El `it` esta en **`PieDePagina.test.tsx:15`** (`describe` en `:14`). La asercion de `:28` si es correcta |
| C-25 | B15: la regex inspecciona hasta `_api.scss:180` | Hasta **`_api.scss:181`**; lo primero que queda fuera es la `}` de `:182`. La conclusion (el `&:hover` de `:184-186` queda fuera) sigue en pie |
| C-26 | B7: L81-87 ancla el paso -2 y el ancho 672 | El paso -2 esta en **`escalaTipografica.test.ts:80`**; el rango correcto es **L80-87** |
| C-27 | F9: la funcion ocupa `escenariosHeredados.ts:46-59` | **`:46-61`**, y su condicion de paso (`:57`) exige ademas que el recuento sea **exactamente 12** (`DOCE`, `:28`) |

### 0.3 `analisis_contraste_paletas.md` (10)

| # | Afirmacion original | Corregido |
|---|---|---|
| C-28 | `#886A44` sobre `#FEF3C7` = 4.50, aprueba al filo | **4.4989 -> SUSPENDE** (reverificado en esta sesion: `4.498905020248144`). Se descarta por suspender, no por empatar con el umbral |
| C-29 | H5: cuatro margenes al filo, el critico es `tech` on-primary/primary-strong (4.54) | **Cinco**. El critico es `--urg` `#F87171` sobre `--urg-soft` compuesto `#3A2F47` = **4.5257 (+0.026)**; el de `tech` es 4.5352 (+0.035). Reverificado: `4.525657563829305` |
| C-30 | `tech`: 15 pares evaluados + 2 exentos | **16 + 2 exentos** (accent-ink/accent-soft se evalua dos veces: compuesto sobre `card` y sobre `bg`) |
| C-31 | §0.3: `clinica` en `:601`, `calida` `:602`, `tech` `:603`, `eco` `:604` | Desplazadas +1: `clinica` `VLS:602`, `calida` `:603`, `tech` `:604`, `eco` `:605`. `VLS:601` es la apertura del array |
| C-32 | El swatch `#D97706` de `calida` esta en `:602` | En **`VLS:603`** |
| C-33 | `mezclar()` en `mezclaDeColor.ts:57-70` | **`mezclaDeColor.ts:56-68`** (el fichero tiene 68 lineas) |
| C-34 | `marca`: 14 roles, ningun token con `rgba()` | **15 tokens de color** (`_tokens.scss:60-74`, incluido `--color-foco`) mas **2 con `rgba()`** (`:77-78`, las sombras). Lo defendible es «ningun **rol de color** lleva `rgba()`» |
| C-35 | Los **tres** tonos oscuros de `tech` son indistinguibles | **Dos**: `--bg-2` `#152242` y `--card` `#16233F` (1.005 entre si). `--bg` `#0F172A` si se distingue de ambos (1.14) |
| C-36 | El par blanco<->`--urg` se usa 5 veces en la maqueta | **8** en el bundle completo: `VLS:67,94,113,399,404` + `BLO:59` + `CAM:59,111` |
| C-37 | `marca` es la unica sin ningun par al filo | Verificado: 0 suspensos y minimo **4.8082 (+0.31)**. Pero «sin par al filo» es un juicio sin umbral declarado, incoherente con el +0.29 que el propio informe si llama «al filo» |

### 0.4 Correcciones adicionales detectadas al sintetizar (3)

Verificadas en la fuente en esta sesion; no venian de la fase de refutacion.

| # | Donde | Correccion |
|---|---|---|
| C-38 | `NAV` §6.3 cita `$escala-tipografica` en `src/styles/_api.scss:37-46` | El mapa real es **`_api.scss:28-37`** (`:28` abre `$escala-tipografica: (`, `:37` cierra `);`). `:46-56` es `$escala-espaciado`, como cita bien `MOD` §0.1 |
| C-39 | `MOD` §0.1, §4, §5 y §16 citan «H3/H4/H5» para `espaciado(20)`, `espaciado(56)` y los shorthand | La numeracion canonica es la de `MOD` §20: **H1** = `espaciado(20)`, **H2** = `espaciado(56)`, **H3** = shorthands colapsados, **H4** = `.bloquePublicado` sin CSS, **H5** = `fila-de-accion-de-tarjeta` sin usos. Las citas del cuerpo van desplazadas +2 |
| C-40 | `CON` §5 enumera 14 roles de `marca` de `:60` a `:73` | Son **15** (`:60`-`:74`): omite `--color-foco: #77286B` (`src/styles/_tokens.scss:74`) |

---

## 1. Tokens de color

### 1.1 Correspondencia de nombres (prototipo <-> repo)

Fuente de la equivalencia: `NAV` §1 (volcado de custom properties **resueltas**
en navegador real sobre las dos paginas) y `CON` §0.4.

| Rol del sistema unificado | Token del prototipo | Token actual del repo |
|---|---|---|
| `--color-fondo` | `--bg` (`VLS:19`) | `--color-fondo` (`_tokens.scss:60`) |
| `--color-fondo-alterno` | `--bg-2` (`VLS:19`) | `--color-fondo-alterno` (`:61`) |
| `--color-superficie` | `--card` (`VLS:19`) | `--color-superficie` (`:62`) |
| `--color-superficie-elevada` | `--surface` (`VLS:20`) | `--color-superficie-elevada` (`:63`) |
| `--color-tinta` | `--ink` (`VLS:20`) | `--color-tinta` (`:64`) |
| `--color-texto` | `--text` (`VLS:20`) | `--color-texto` (`:65`) |
| `--color-texto-suave` | `--muted` (`VLS:20`) | `--color-texto-suave` (`:66`) |
| `--color-primario` | `--primary` (`VLS:21`) | `--color-primario` (`:67`) |
| `--color-primario-fuerte` | `--primary-strong` (`VLS:21`) | `--color-primario-fuerte` (`:68`) |
| `--color-sobre-primario` | `--on-primary` (`VLS:21`) | `--color-sobre-primario` (`:69`) |
| **`--color-acento`** (NUEVO) | `--accent` (`VLS:22`) | **NO EXISTE** (`NAV` §1, Hallazgo 1) |
| `--color-acento-tinta` | `--accent-ink` (`VLS:22`) | `--color-acento-tinta` (`:70`) |
| `--color-acento-suave` | `--accent-soft` (`VLS:22`) | `--color-acento-suave` (`:71`) |
| **`--color-urgencia`** (NUEVO) | `--urg` (`VLS:23`) | **NO EXISTE** |
| **`--color-urgencia-suave`** (NUEVO) | `--urg-soft` (`VLS:23`) | **NO EXISTE** |
| `--color-borde` | `--border` (`VLS:20`) | `--color-borde` (`:73`) |
| `--color-borde-control` | **NO CONSTA EN LA FUENTE** (`CON` §6.5: ninguna de las 4 paletas del prototipo desdobla el borde) | `--color-borde-control` (`:72`) |
| `--color-foco` | **NO CONSTA EN LA FUENTE** (`TOK` H38: cero reglas `:focus` en las 4 paginas y `outline:none` explicito en `VLS:299,368,371,375,378,387`) | `--color-foco` (`:74`) |
| `--sombra-reposo` | `--shadow-sm` (`VLS:24`) | `--sombra-reposo` (`:77`) |
| `--sombra-elevada` | `--shadow` (`VLS:24`) | `--sombra-elevada` (`:78`) |

**20 roles = 18 de color + 2 de sombra** (`NAV` §1, Hallazgo 2; coincide con
`TES` A10: `rolesDeColor` pasa de 15 a 18 y `rolesDeSombra` sigue en 2).

### 1.2 La matriz: 20 roles x 5 variantes

Origen de cada columna: `clinica` = `:root` de `VLS:18-25` (no tiene selector
propio, `LAN` §0.2); `calida` = `VLS:26-33`; `tech` = `VLS:34-41`; `eco` =
`VLS:42-49`; `marca` = `src/styles/_tokens.scss:59-79`.

Marcas: **[S]** = suspende segun `CON`; **[F]** = aprueba al filo (< +0.10);
**[P]** = PROPUESTA calculada en esta sesion (no consta en la fuente);
**[N]** = rol nuevo.

| # | Rol | clinica | calida | tech | eco | marca |
|---|---|---|---|---|---|---|
| 1 | `--color-fondo` | `#F8FAFC` | `#FFFBF2` | `#0F172A` | `#FFFFFF` | `#FFFFFF` |
| 2 | `--color-fondo-alterno` | `#EDF2F9` | `#FEF3C7` | `#152242` | `#EFFDF7` | `#F4EEF3` |
| 3 | `--color-superficie` | `#FFFFFF` | `#FFFDF8` | `#16233F` | `#FFFFFF` | `#FFFFFF` |
| 4 | `--color-superficie-elevada` | `#FBFDFF` | `#FFFDF6` | `#111C34` | `#F7FEFB` | `#FAF6F9` |
| 5 | `--color-tinta` | `#0B1B33` | `#3B2A12` | `#F1F5F9` | `#06301F` | `#531C4B` |
| 6 | `--color-texto` | `#3C4C66` | `#5C4626` | `#C6D2E2` | `#35544A` | `#77286B` |
| 7 | `--color-texto-suave` | `#5E6E88` **[F]** (4.60 sobre fondo-alterno) | ~~`#8A6C45`~~ **[S]** 4.37 -> **`#876A44`** (4.52) | `#94A3B8` | `#557368` | `#925389` (minimo 4.81) |
| 8 | `--color-primario` | `#1E40AF` | `#B45309` | `#06B6D4` | `#047857` | `#77286B` |
| 9 | `--color-primario-fuerte` | `#1B3796` | `#92400E` | `#0891B2` **[F]** 4.5352 | `#036049` | `#6B2460` |
| 10 | `--color-sobre-primario` | `#FFFFFF` | `#FFFFFF` | `#04212B` | `#FFFFFF` | `#FFFFFF` |
| 11 | **`--color-acento`** **[N]** | `#10B981` | `#4D7C0F` | `#22D3EE` | `#0EA97B` | **`#B4C718`** (lima de marca) **[P]** |
| 12 | `--color-acento-tinta` | `#047857` | `#3F6212` | `#67E8F9` | `#065F46` | `#48704B` |
| 13 | `--color-acento-suave` | `#E7F8F1` | `#F1F7E3` | `rgba(6,182,212,.14)` -> `#143854` sobre card | `#D6FBEA` | `#F6F8E3` |
| 14 | **`--color-urgencia`** **[N]** | `#DC2626` | `#C2410C` | `#F87171` **[S]** 2.77 con blanco | `#DC2626` | **NO CONSTA EN LA FUENTE** -> `#6B2460` **[P]** |
| 15 | **`--color-urgencia-suave`** **[N]** | `#FEE9E9` | `#FDEBE0` | `rgba(248,113,113,.16)` -> `#3A2F47` sobre card **[F]** 4.5257 | `#FDE9E9` | **NO CONSTA EN LA FUENTE** -> `#F4EEF3` **[P]** |
| 16 | `--color-borde` | `rgba(15,32,60,.13)` (1.30, exento) | `rgba(120,53,15,.16)` (1.31, exento) | `rgba(148,197,255,.18)` (1.50, exento) | `rgba(4,120,87,.16)` (1.26, exento) | `#DDC9DA` (1.56, exento) |
| 17 | `--color-borde-control` | NO CONSTA -> **`#3F5CBB`** (5.80 / 6.07) **[P]** | NO CONSTA -> **`#BF6C2C`** (3.77 / 3.83) **[P]** | NO CONSTA -> **`#079EBB`** (5.63 / 4.92) **[P]** | NO CONSTA -> **`#2A8C70`** (4.13) **[P]** | `#A06997` (4.23) |
| 18 | `--color-foco` | NO CONSTA -> **`#1E40AF`** (8.34 sobre fondo) **[P]** | NO CONSTA -> **`#B45309`** (4.86) **[P]** | NO CONSTA -> **`#06B6D4`** (7.35) **[P]** | NO CONSTA -> **`#047857`** (5.48) **[P]** | `#77286B` |
| 19 | `--sombra-reposo` | `0 6px 18px rgba(15,32,60,.07)` | `0 6px 18px rgba(120,53,15,.08)` | `0 8px 22px rgba(0,0,0,.35)` | `0 6px 18px rgba(4,120,87,.08)` | `0 6px 18px rgba(83,28,75,.07)` |
| 20 | `--sombra-elevada` | `0 18px 45px rgba(15,32,60,.10)` | `0 18px 45px rgba(120,53,15,.12)` | `0 22px 55px rgba(0,0,0,.45)` | `0 18px 45px rgba(4,120,87,.12)` | `0 18px 45px rgba(83,28,75,.10)` |

Citas de los valores del prototipo: filas 1-4 en `VLS:19-20, 27-28, 35-36, 43-44`;
5-7 en `VLS:20, 28, 36, 44`; 8-10 en `VLS:21, 29, 37, 45`; 11-13 en
`VLS:22, 30, 38, 46`; 14-15 en `VLS:23, 31, 39, 47`; 16 en `VLS:20, 28, 36, 44`;
19-20 en `VLS:24, 32, 40, 48`. Valores de `marca`: `_tokens.scss:60-74` y `:77-78`.
Composiciones de los `rgba()` de `tech` (`mezclar()`, `mezclaDeColor.ts:56-68`):
`CON` §3, reverificadas en esta sesion.

**Aviso de portabilidad (`SUB` H-23):** las tres subpaginas del prototipo solo
declaran 16 de los 18 roles — omiten `--primary-strong` y `--urg-soft`
(`TIE:17-27`, `CAM:17-27`, `BLO:17-27`). En el repo eso no se replica: el
sistema es un unico `_tokens.scss` para las 6 rutas.

### 1.3 Deltas de token, numerados

| # | Delta | Detalle y fuente |
|---|---|---|
| **T-01** | La variante por defecto pasa de `marca` a `clinica` | Hay que tocar `src/data/variantesPaleta.ts:24-29`, `SelectorPaleta-logica.ts:16` e `index.html:34-35` **a la vez**: el catalogo esta duplicado a mano en 3 sitios y **nada los ata** (`TES` C2) |
| **T-02** | `calida`: `--color-texto-suave` `#8A6C45` -> `#876A44` | Unico suspenso corregible con un solo hexadecimal: 4.37 -> **4.52** (`CON` §2.1). `#886A44` **no** vale: 4.4989 (C-28). Colateral verificado: sobre `--bg` y `--card` sube desde 4.72 / 4.79 y sigue aprobando |
| **T-03** | `tech`: la tinta sobre `--color-urgencia` NO puede ser blanca | `#FFFFFF` sobre `#F87171` = **2.77**, ni llega al 3.0 de texto grande (`CON` §3.1). Regla derivada: **la tinta sobre `--color-urgencia` es siempre `--color-sobre-primario`** -> clinica 4.83, calida 5.18, eco 4.83 y tech `#04212B` sobre `#F87171` = **6.04** (reverificado). Coste: cero colores nuevos, `#04212B` ya esta en la paleta (`VLS:37`) |
| **T-04** | `--color-borde-control` no existe en el prototipo: hay que derivarlo en las 4 paletas | Regla propuesta, la misma que ya usa `marca` (`_tokens.scss:72`, «blanco + 70% morado»), recalibrada al **85%** para que las cuatro pasen SC 1.4.11 con margen: `mezclar(fondo, primario, 0.85)`. Calculado con `mezclaDeColor.ts:56-68` y `contraste.ts:63-72`. Al 70% `calida` daria `#CB854F` = **2.90 -> suspenderia** |
| **T-05** | `--color-foco` no existe en el prototipo (`TOK` H38) | Propuesta: `--color-foco = --color-primario` de cada variante, que es la regla que ya aplica `marca` (`_tokens.scss:74` = `:67`). Ratios contra el propio fondo: clinica 8.34, calida 4.86, tech 7.35, eco 5.48 — las cuatro sobre el 3:1 de SC 2.4.13 |
| **T-06** | Tres roles nuevos: `--color-acento`, `--color-urgencia`, `--color-urgencia-suave` | Hoy **no existen** en el sitio desplegado (`NAV` §1, Hallazgo 1: «no es que valgan otra cosa: no existen»). Con 20 roles x 5 variantes los pares de `comprobarInventarioDeTokens` pasan de 68 a **100** (`TES` A11), y cada variante debe declarar los 20 **sin heredar** (`tokensColor.ts:213`) |
| **T-07** | `marca`: `--color-acento` = `#B4C718` (lima) **solo como relleno** | `docs/datos-galapavet.md:137` declara el lima como color de marca; `:170-176` prohibe su uso como texto o borde sobre claro (1.89 con blanco, reverificado). Usos legitimos, calculados: tinta `#531C4B` sobre lima = **6.80**; negro sobre lima = **11.12** (`docs/datos-galapavet.md:158`). Verde `#48704B` sobre lima = **3.01**, ya descartado por pasar por 0.01 (`docs/datos-galapavet.md:175-176`) |
| **T-08** | `marca`: **no hay ningun rojo en la marca** | `docs/datos-galapavet.md:129-142` declara 4 colores: morado `#77286B` (`:136`), lima `#B4C718` (`:137`), verde profundo `#48704B` (`:138`) y blanco (`:139`). Inventar un rojo seria inventar marca. **Propuesta**: `--color-urgencia` = `#6B2460` (= `--color-primario-fuerte`, `_tokens.scss:68`; blanco encima **10.26**) y `--color-urgencia-suave` = `#F4EEF3` (= `--color-fondo-alterno`, `:61`; texto encima **7.99**). Precedente en el propio repo de dos roles con el mismo hexadecimal a proposito: la variante `verde` declara `--color-texto-suave` = `--color-texto` con motivo razonado en `_tokens.scss` |
| **T-09** | El rol se llama «urgencia» pero Galapavet **no presta urgencias 24 h** | `docs/datos-galapavet.md:40-43` y `:94`. En `marca` el color no puede leerse como alarma roja: es un aviso de marca. El modulo que lo consuma solo puede rotular «Urgencias fuera de horario» con el telefono real `91 851 13 93` (`docs/datos-galapavet.md:29`, `src/lib/site.ts:12`). Ver X-01 |
| **T-10** | Contradiccion de contrato **bloqueante** | `src/lib/diseno/rolesDescartados.ts:30` (`/--[\w-]*urg[\w-]*/gi`) y `:32` (`/--color-acento(?!-tinta\|-suave)\b/`) **prohiben por nombre exactamente los tres roles nuevos**, y `features/identidad_visual.feature:465-474` (@s11, feature `done` segun `feature_list.json:354`) lo fija como contrato. No se resuelve tocando tests (`TES` D2): lo decide el humano |
| **T-11** | `tech` mete `rgba()` en tres roles de color | `--border`, `--accent-soft` y `--urg-soft` (`VLS:36,38,39`). Es admisible en `_tokens.scss` (`marca` ya lleva `rgba()` en las dos sombras, `:77-78`), pero **obliga a componer antes de medir**: un translucido no tiene ratio propio (`CON` §3) |
| **T-12** | Los swatches del selector no son los tokens | `calida` declara `#D97706` (`VLS:603`) frente a su `--primary` `#B45309` (`VLS:29`); `tech` declara `#64748B` (`VLS:604`), que **no existe en ninguna de las 4 paletas**; `eco` declara `#A7F3D0` (`VLS:605`) frente a su `--accent` `#0EA97B` (`VLS:46`). Las muestras del selector se leen de los tokens, nunca del array (`TOK` H06) |
| **T-13** | Colores fuera del sistema que el hero usa | `#0B1B33` (`VLS:118`, `CAM:108`), `#4ADE80` (`VLS:121`), `#F87171` (`VLS:128`) y los degradados `rgba(6,16,32,...)` (`VLS:118`, `CAM:316`, `TIE:120`). **Ninguno cambia con `data-tema`** (C-14). En el rediseno el velo del hero sale de un token: lo exige ademas `ejecutarPuertaDeLiteralesColor` (`src/lib/puertaLiteralesColor.ts:38-55`, `TES` B13), que ademas **no filtra comentarios** (`:71-77`) |
| **T-14** | `--color-acento` casi no se ve en el prototipo | 2 usos en `VLS` (`:278`, `:498`), 1 en `BLO` (`:321`), 0 en `TIE` y `CAM` (`TOK` H05). El acento visible del sistema es `--accent-ink`. Si el rol nuevo entra, entra con un uso declarado, no «por simetria» |

### 1.4 Suspensos y margenes al filo, tras aplicar C-28 y C-29

| Paleta | Par | Ratio | Estado |
|---|---|---|---|
| `calida` | texto-suave `#8A6C45` / fondo-alterno `#FEF3C7` | **4.37** | **SUSPENDE** -> T-02 |
| `tech` | blanco / urgencia `#F87171` | **2.77** | **SUSPENDE** -> T-03 |
| `tech` | urgencia `#F87171` / blanco | **2.77** | **SUSPENDE** (mismo par: la formula es simetrica, `src/lib/contraste.ts:58-62`) |
| `tech` | urgencia `#F87171` / urgencia-suave `#3A2F47` | 4.5257 | al filo **+0.026** — el mas estrecho del catalogo |
| `tech` | sobre-primario `#04212B` / primario-fuerte `#0891B2` | 4.5352 | al filo +0.035 |
| `clinica` | texto-suave `#5E6E88` / fondo-alterno `#EDF2F9` | 4.60 | al filo +0.10 |
| `calida` | texto-suave `#8A6C45` / fondo `#FFFBF2` | 4.72 | al filo +0.22 |
| `calida` | texto-suave `#8A6C45` / superficie `#FFFDF8` | 4.79 | al filo +0.29 |
| `marca` | texto-suave `#925389` / fondo-alterno `#F4EEF3` | **4.8082** | minimo de la paleta; **0 suspensos** |

`marca` es la unica de las cinco que llega sin ninguna correccion (`CON` §7).

---

## 2. Geometria

Columna «valor actual del repo»: leido de `src/styles/_api.scss`,
`src/styles/global.scss` y los `.module.scss` (`MOD` §0.1), y **medido en
navegador** sobre el sitio desplegado (`NAV` §2). Columna «valor del diseno»:
`TOK` §2-§10 y `NAV` §2, sobre los cuatro `.dc.html`.

| # | Propiedad | Valor actual del repo | Valor del diseno | Accion |
|---|---|---|---|---|
| **G-01** | Ancho maximo de contenedor | `1024px` — `$ancho-maximo-contenedor` (`_api.scss:133`), un solo punto de consumo (`@mixin contenedor`, `:135-151`) usado por 8 hojas; medido 1024 (`NAV` §2) | `1220px`, identico en las 4 paginas (`VLS:78,143,184,210,255,318,346,445,467`; `TIE:44,68,76,84,108,160`; `CAM:44,72,81,109,117,171,190`; `BLO:44,72,85,107,182`) | Cambiar **una linea** (`_api.scss:133`). No rompe ningun test (`TES` §2.3 rama 1, F10), pero deja **falso** el comentario de `:127-132` («el MISMO numero que `PUNTO_DE_CORTE_NAVEGACION_PX`»): hay que reescribirlo o cerrar el hueco C1 con un test |
| **G-02** | Contenedores secundarios | Ninguno declarado en el sistema; **cuatro anchos conviviendo de facto**: 1024 / 860 (`Faq.module.scss:6`) / 760 (`PaginaBlog.module.scss:82`) / 640 (`Hero.module.scss:26,31,72`) — `MOD` H7 | 1220 general + **900** hero (`VLS:119`), **860** FAQ (`VLS:425`), **1080** imagen del articulo (`BLO:148`), **760** columna de lectura (`BLO:132,152`), **720** banda de cifras (`VLS:131`), **640** cabecera centrada (`VLS:211`, `VLS:347`) | Declarar la familia como tokens del sistema (`$ancho-lectura: 760px`, `$ancho-estrecho: 860px`, `$ancho-hero: 900px`) en vez de literales sueltos por hoja. El 860 del FAQ del repo **ya coincide** con el del diseno |
| **G-03** | Gutter lateral | Uno solo: `padding-inline: espaciado(24)` = 24px dentro de `@mixin contenedor` (`_api.scss:150`); medido 24px (`NAV` §2) | **Cuatro**: `clamp(18px,5vw,28px)` estandar, `clamp(16px,4vw,28px)` cabecera, `clamp(18px,6vw,32px)` hero, `clamp(14px,3vw,26px)` selector (`TOK` §5.2, H18) | Adoptar **uno** fluido, `clamp(18px,5vw,28px)`, en `@mixin contenedor`. No copiar los otros tres: el propio informe senala que por eso la cabecera del diseno nunca alinea con las secciones (`TOK` H18) |
| **G-04** | Espaciado vertical de seccion | `padding-block: espaciado(64)` = **64px plano** en todas las secciones (`Servicios:7-10`, `Equipo:5-9`, `ReservaChat:6-9`, `Galeria:16-20`, `Faq:5`, `PaginaBlog:3`, `PaginaCampanas:3`, `PaginaTienda:3`); 96px solo en `PaginaNoEncontrada:3`; medido «64 px, plano, sin ritmo» (`NAV` §2) | Canonico `clamp(64px,9vw,104px)` (`VLS:142,209,254,317,345,424`), con `clamp(56px,8vw,90px)` en Campanas (`VLS:183`) y **18 techos distintos** en total (C-06) | Adoptar **dos** pasos fluidos, no 18: `seccion` = `clamp(64px,9vw,104px)` y `seccion-corta` = `clamp(56px,8vw,90px)`. Requiere pasos nuevos en `$escala-espaciado` o una funcion aparte -> rompe `escalaEspaciado.test.ts` (`TES` B6: literal a mano de 9 pasos y techo de 96) |
| **G-05** | Radios | 5 pasos declarados (`_api.scss:106-110`), **4 en uso**: `$radio-pequeno` (4px) tiene **0 usos** (`MOD` H11). Radio de tarjeta **24px**; medidos **3** radios distintos en el sitio (`NAV` §2) | **13 valores simples + 2 compuestos** (`TOK` §2, H08); radio de tarjeta **20px** (`VLS:150`, `TIE:86`, `BLO:109`) pero **22px** en `CAM:83` y **24px** en `BLO:367` para el mismo rol (H09); medidos **9** en uso (`NAV` §2) | Bajar `$radio-grande` de 24px a **20px** y anadir un paso intermedio de 16px (mini-tarjeta, `VLS:193`). **No** importar los 13: `NAV` §6.1 lo declara expresamente («copiar sus 34 tamanos seria importar su desorden», Decision 24). Ningun test comprueba valores de radio -> hueco **C5** |
| **G-06** | Sombras | 2 tokens (`--sombra-reposo`, `--sombra-elevada`), teñidos con `--color-tinta` (`_tokens.scss:77-78`); medidos **12** elementos con sombra (`NAV` §2) | 2 tokens + **4 sombras a mano fuera del sistema**: `0 12px 30px rgba(0,0,0,.28)` (`VLS:126`) y tres `text-shadow` (`VLS:123,124`; `CAM:112`) — `TOK` H11; medidos **32** elementos con sombra y 3 niveles (`NAV` §2) | Mantener los 2 tokens y **anadir un tercero** solo si el CTA sobre foto lo exige. Los `text-shadow` del hero son consecuencia de poner texto sobre foto: se resuelven con el velo (G-13), no con un token nuevo |
| **G-07** | Rejillas | 6 umbrales `minmax(min(N,100%),1fr)`: 320 (`ReservaChat:6`), 300 (`PaginaBlog:41`, `PaginaCampanas:52`), 280 (`Servicios:7`, `Equipo:5`, `CampanasPortada:24`, `InformacionContacto:6`), 260 (`PaginaTienda:38`), 230 (`PaginaBlog:130`), 160 (`PaginaCampanas:102`) | **13 definiciones, 10 umbrales**: 320, 310, 300, 260, 240, 230, 210, 200, 180 y **130 sin `min(...,100%)`** (`TOK` §7, H22, H23) | Consolidar a **tres** umbrales (320 / 280 / 230). El `minmax(130px,1fr)` de las cifras del hero (`VLS:131`) es el unico que puede desbordar: si se porta, va con `min(...,100%)` (H23) |
| **G-08** | Alturas de control | 3 pasos derivados del area tactil minima: 40 / 48 / **56px** (`_api.scss:123-125`, `$area-tactil-minima: 24px` en `:81`). Medido: `input` **28px**, `select` **25px** (`NAV` §4) | **Seis**: 40 / 44 / 46 / 48 / 50 / 52 (`TOK` §8, H24), con `min-height:40px` en un solo control (`VLS:307`, H25). Medido: `input` y `select` **46px** (`NAV` §4) | El delta real **no esta en la escala** sino en que los campos del formulario no la aplican: 28px medidos frente a 48px declarados. Aplicar `$altura-control-media` a `input`/`select` en `FormularioContacto.module.scss:30-40`. No anadir pasos nuevos |
| **G-09** | Anchos de borde | 2 pasos: `$ancho-borde-fino` 1px, `$ancho-borde-control` 1.5px (`_api.scss:117-118`), derivados del paso base; `$grosor-foco` 2px (`:71`) | Los mismos dos valores, pero **mezclados en controles equivalentes** (1.5px en `VLS:97` frente a 1px en `VLS:292`; `TOK` H26) | **Sin delta**: la escala del repo ya es la del diseno, y ademas con la regla que el diseno no tiene (1.5px = «esto es un control»). Se mantiene |
| **G-10** | Puntos de corte | Uno: `PUNTO_DE_CORTE_NAVEGACION_PX = 1024` (`Cabecera-logica.ts:10`), con cobertura CSS en `Cabecera.module.scss:67` y `:111`; `puntoDeCorte.test.ts:18` exige que la cabecera declare **un unico** punto de corte | **Cero `@media` de maquetacion** en los 4 ficheros (`TOK` H27); todo se decide en JS con **cuatro** umbrales distintos: 1120 (`VLS:684`), 1080 (`TIE:238`, `CAM:292`, `BLO:328`), 940 (`CAM:293`) y 900 (`BLO:329`) — H28, H29 | **Mantener 1024** (rama 1 de `TES` §2.3): desacoplar el ancho de contenedor del punto de corte. Mover el punto de corte a 1220 (rama 2) rompe `Cabecera-logica.test.ts:6`, `puntoDeCorte.test.ts:19`, `escalaTipografica.test.ts:18` y `tests/e2e/accesibilidad.spec.ts:377-393`. **No anadir un segundo `@media` a la cabecera**: tumbaria `puntoDeCorte.test.ts:18` aunque el numero no cambie |
| **G-11** | Altura de cabecera y `scroll-padding` | `--altura-cabecera: espaciado(64)` = 64px (`global.scss:49`), consumida por `#root` (`:148`) y por `scroll-padding-top: calc(var(--altura-cabecera) + espaciado(16))` = **80px derivado** (`global.scss:213`) | Cabecera de **63px** en escritorio y **71px** en movil (C-13) contra `scroll-padding-top:88px` **literal** (`VLS:51`): no coincide con ninguno de los dos (`TOK` H35) | **Sin delta de mecanismo**: el repo ya deriva lo que el diseno escribe a mano mal. Si la cabecera crece (barra de urgencias encima, N-01), `--altura-cabecera` se recalcula y `scroll-padding` la sigue solo |
| **G-12** | Relaciones de aspecto de imagen | 4 en uso: 16/9 (`CampanasPortada:46`, `PaginaBlog:92,146`, `PaginaCampanas:67`), 4/3 (`Galeria:56`, `PaginaTienda:52`), 1/1 (`PieDePagina:57`), y el `<iframe>` 16/9 a mano (`InformacionContacto:13-14`, `MOD` H15) | **Cinco** familias que ni siquiera coinciden entre si: 4/3, 16/9, 16/10, 1/1 y dos miniaturas fijas distintas (74x66 y 70x62) — `SUB` H-29 | Fijar **tres**: 16/9 (medios anchos), 4/3 (retratos y producto), 1/1 (avatar/logo). Portar `hueco-de-imagen(16,9)` al `<iframe>` del mapa (`MOD` H15) |
| **G-13** | Velo sobre imagen de fondo | **No existe**: ningun modulo pinta texto sobre foto | `linear-gradient` de tres paradas sobre la foto del hero (`VLS:118`) y de dos en la ficha de campana (`CAM:316`), mas `background-color:#0B1B33` de respaldo | Necesario si entra el hero con imagen (N-02). El velo se declara con tokens, no con los `rgba(6,16,32,...)` literales (T-13) |
| **G-14** | Movimiento | Escala de 3 duraciones vigilada por puerta: `{150, 300, 0.01}` ms y prohibicion de animar `all` (`escalaMovimiento.test.ts:50,56`, `TES` B12) | **Una sola duracion y un solo easing en todo el sistema**: `.3s ease` (`TOK` §11.1, H33); `prefers-reduced-motion` no neutraliza los `transform` de hover (H37) | **Sin delta**: 300ms ya esta en la escala del repo. Cualquier valor nuevo que traiga un modulo portado (por ejemplo `1.6s` del pulso, `VLS:69`) **tumba la puerta** — el glob la recoge automaticamente |

---

## 3. Tipografia

Familias: identicas en los dos lados — Outfit + DM Sans (`VLS:15` frente a
`global.scss:41-42`, que ademas declara fallbacks). Lo que cambia es la escala,
el peso, el interlineado y el tracking.

| # | Elemento | Actual (repo) | Diseno | Accion |
|---|---|---|---|---|
| **Y-01** | `h1` de portada | Outfit **48.83px** fijo (`paso-tipografico(5)`, `_api.scss:36`), peso **700**, `line-height` **1.5** heredado del `body` (`global.scss:117-123`), tracking `normal`. Medido: 48.83 / lh 53.71 / peso 700 (`NAV` §3) | Outfit `clamp(33px,6.4vw,68px)`, peso **600**, `line-height` **1.05**, `letter-spacing` **-.02em** (`VLS:123`). Medido: 68 / lh 71.4 / tracking -1.36px (`NAV` §3) | Convertir el paso 5 en **fluido** con los extremos del diseno; bajar el peso a 600; declarar `line-height` e `letter-spacing` propios de titular |
| **Y-02** | `h2` de seccion | Outfit **39.06px** fijo (`paso-tipografico(4)`, `_api.scss:35`), peso 700, `line-height` **1.5** heredado -> **58.59px medidos** (`NAV` §3) | Outfit `clamp(28px,4.2vw,46px)`, peso 600, `line-height` **1.08**, `letter-spacing` -.015em (`VLS:145,213,258,321,349,428`) | Idem paso 4. **Es el delta mas visible de los cuatro**: un `h2` de dos lineas ocupa hoy un **39% mas de alto** del que le corresponde (`NAV` §3) |
| **Y-03** | Resto de la escala (pasos -2 a 3) | 10.24 / 12.8 / 16 / 20 / 25 / 31.25 (`_api.scss:29-34`), ratio 1.25 base 16 | Equivalentes del diseno: 10.5 / 12.5-13 / 16 / 19-20 / 24-26 / 32 | **Sin delta**: los seis pasos bajos encajan dentro de 1px (`NAV` §6.3). Solo fallan los pasos 4 y 5 (Y-01, Y-02). No tocar el ratio ni la base: `escalaTipografica.test.ts` los ancla a mano (`TES` B7) |
| **Y-04** | `h3` de tarjeta | Outfit **25px** (`paso-tipografico(2)`), peso 700, lh 37.5 medido (`NAV` §3) | Outfit **21px**, peso 600, `line-height` 1.15 (`VLS:156`); 20px en Equipo (`VLS:226`), 17px en campanas (`VLS:200`) | Bajar a `paso-tipografico(1)` = 20px con peso 600 y `line-height` 1.15-1.2. Queda dentro de la escala existente |
| **Y-05** | Cintillo / eyebrow | `@mixin eyebrow` (`_api.scss:324-332`): 12.8px, peso 700, `letter-spacing` **0.12em**, mayusculas, `--color-acento-tinta`. **Solo 2 de 18 modulos lo usan** y 3 lo reescriben a mano con valores distintos (`MOD` H6) | Cintillo canonico: **12px**, peso 700, `letter-spacing` **.22em**, mayusculas, `--accent-ink` (`VLS:144,186,212,257,320,348,427`; `CAM:74`), mas **8 variantes** de tamano/tracking (`LAN` §15) | Subir el `letter-spacing` del mixin de 0.12em a **0.22em** (es el rasgo que hace legible el cintillo del diseno) y **aplicarlo en los 8 modulos que hoy lo reescriben o lo necesitan** (H6). No portar las 8 variantes |
| **Y-06** | Parrafo de seccion | Hereda `body`: 16px, `line-height` 1.5 (`global.scss:117-123`) | **17px**, `line-height` **1.7**, `--muted`, `max-width:62ch` (`VLS:146,214,259,350`) | Declarar en el patron de seccion: `paso-tipografico(0)` con `line-height:1.7` y medida de linea. 17px no esta en la escala: se usa 16px (delta de 1px, dentro del margen de `NAV` §6.3) |
| **Y-07** | Prosa larga | `@mixin prosa` (`_api.scss:337-359`): 20px, `line-height` **1.8**, `h2` a 31.25px. **Un solo uso** en todo el repo (`PaginaBlog.module.scss:77`, `MOD` H12) | Cuerpo del articulo 17px `line-height` **1.8** (`BLO:323`), `h2` interno `clamp(21px,2.8vw,26px)` (`BLO:315`), cita `clamp(19px,2.5vw,23px)` con borde izquierdo de 3px (`BLO:319-321`) | Aplicar `prosa` tambien a las respuestas del FAQ, que hoy usan un `line-height:1.7` propio (`Faq.module.scss:48`, H12) |
| **Y-08** | Peso de titulares | **700** en todos (`Hero:18-20`, `Servicios:14-15`, `Equipo:13-14`, `Faq:9-10`, `PaginaBlog:7-8`, `PaginaCampanas:7-8`, `PaginaTienda:7-8`) | **600** en todos (`VLS:123,145,156,187,213,226,258,...`) | Bajar a 600. Outfit declara 400;500;600;700 en las dos partes (`VLS:15`; `global.scss:41`): el peso 600 existe de verdad |
| **Y-09** | Peso 600 sobre DM Sans | No se usa | **34 elementos** con `font-weight:600` heredando DM Sans, que solo carga 400;500;700 (`TOK` H17). Que renderiza el navegador: **NO CONSTA EN LA FUENTE** | **No portar ese patron.** Para texto no-titular, peso 500 o 700, que si estan cargados |
| **Y-10** | Numero de tamanos | 8 pasos | **39 tamanos distintos** (26 fijos + 13 `clamp`), 9 de ellos con medio pixel (`TOK` §4.4, H12); **34 medidos en navegador**, sin progresion (`NAV` §6.1) | **No importar.** `NAV` §6.1 lo cierra: «el prototipo es una maqueta, no un sistema». La escala del repo se mantiene y solo se hacen fluidos los pasos 4 y 5 |
