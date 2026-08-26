# Medición del sistema visual completo — diseño vs. desplegado

> Fecha: **26/08/2026**. Analista: frente «sistema visual».
> Método: Chromium real vía Playwright 1.62.1, `chromium.launch()`,
> viewport 1440×900 y `deviceScaleFactor: 1` salvo donde se indique otro ancho.
> Carga con `goto(..., { waitUntil: 'networkidle', timeout: 60000 })` + 3 s de
> espera (el runtime del prototipo pinta en dos pasadas), y **scroll al fondo +
> 2 s + vuelta arriba** antes de medir, porque en el desplegado las imágenes son
> `loading="lazy"`.
>
> **Ninguna cifra de este documento está estimada, deducida del SCSS ni copiada
> de otro informe.** Todas salen de `getComputedStyle()` y
> `getBoundingClientRect()` sobre las 8 páginas cargadas de verdad
> (4 del prototipo + 4 del sitio público).
>
> Instrumentos (no versionados, viven en `.experimentos-tmp/`):
> `sv-sonda.mjs`, `sv-inventario.mjs`, `sv-cortes.mjs`, `sv-biseccion.mjs`,
> `sv-fondos.mjs`, `sv-cta.mjs`, `sv-nav.mjs`, `sv-bandas.mjs`, `sv-anclas.mjs`,
> `sv-borde-15.mjs`.

## 0. Alcance y universo medido

Se recorre `#dc-root` (diseño) o `#root` (desplegado) entero, elemento a
elemento, descartando `script`/`style`/`br`, lo que tenga
`display:none`/`visibility:hidden` y lo que mida 0×0. Universo real:

| Página | Diseño (elementos visibles) | Desplegado | Δ |
| --- | ---: | ---: | ---: |
| Landing | **908** | **232** | −676 (−74 %) |
| Campañas | 120 | 100 | −20 |
| Blog | 150 | 108 | −42 |
| Tienda | 261 | 134 | −127 |

El landing del prototipo tiene **3,9× más elementos pintados** que el
desplegado. Todo lo que sigue hay que leerlo con ese denominador delante: parte
de los recuentos más bajos del desplegado no es «menos sistema», es **menos
página**.

---

## 1. RADIOS (`border-radius` computado, en uso)

Suma de las 4 páginas, a 1440 px.

| Radio | Diseño (nº elementos) | Desplegado (nº elementos) | Veredicto |
| --- | ---: | ---: | --- |
| `999px` (píldora) | 95 | 86 | rol compartido |
| `50%` (círculo) | **77** | **0** | **rol ausente** |
| `20px` (tarjeta) | 46 | 0 | sustituido |
| `24px` (tarjeta) | 1 | 36 | el desplegado usa este |
| `30px` | 18 | 0 | ausente |
| `12px` | 9 | 18 | rol compartido |
| `3px` | 10 | 0 | ausente (aspas del logo) |
| `22px` | 6 | 0 | ausente |
| `16px` | 3 | 0 | ausente |
| `18px` | 3 | 0 | ausente |
| `11px` | 1 | 0 | ausente |
| `16px 16px 16px 5px` | 1 | 0 | ausente (burbuja de chat) |
| **Valores distintos** | **12** | **3** | **−9** |

Por página (valores distintos en uso):

| Página | Diseño | Desplegado |
| --- | ---: | ---: |
| Landing | 10 | 3 |
| Campañas | 5 | 3 |
| Blog | 6 | 3 |
| Tienda | 5 | 3 |

**Cómo se midió**: `getComputedStyle(el).borderRadius` para todo elemento con
caja, agregado en un histograma (`sv-inventario.mjs`).

### 1.1 El hallazgo que se ve a un metro: no hay ni un solo círculo

Contando elementos con radio `50%` o `999px` **cuyo ancho y alto difieren en
≤2 px** (es decir, que se pintan como un círculo perfecto y no como una píldora):

| Ancho | Diseño: círculos | Diseño: píldoras | Desplegado: círculos | Desplegado: píldoras |
| --- | ---: | ---: | ---: | ---: |
| 1440 px | **74** | 36 | **0** | 26 |
| 390 px | **73** | — | **0** | — |

El prototipo apoya toda su textura en formas redondas —avatares del equipo,
chapas de icono, puntos de pulso, marcas de verificación, flechas circulares de
galería—. El sitio desplegado no pinta **ninguna**. Es la diferencia de forma
más visible para alguien que no mira el código, y no depende de ningún color.

### 1.2 Radio de tarjeta: `20px` frente a `24px`

`20px` en el diseño (46 elementos: tarjeta de servicio, de equipo, figura de
galería, caja de urgencias, caja del mapa, tarjeta de producto, tarjeta de
artículo) contra `24px` en el desplegado (36 elementos). **Δ +4 px**, en sentido
contrario al esperado: el desplegado redondea *más*.

### 1.3 Geometría que solo existe en móvil

A 390 px el diseño sube a **11 radios distintos**: aparece `2px` ×3, las tres
barras del icono hamburguesa, que a 1440 px están en `display:none`. El
desplegado sigue en **3** a cualquier ancho.

---

## 2. SOMBRAS (`box-shadow` computada, en uso)

| Sombra computada | Diseño | Desplegado |
| --- | ---: | ---: |
| `rgba(15,32,60,.07) 0 6px 18px 0` (reposo) | **54** | — |
| `rgba(83,28,75,.07) 0 6px 18px 0` (reposo) | — | **29** |
| `rgba(15,32,60,.10) 0 18px 45px 0` (elevada) | **2** | **0** |
| `rgba(0,0,0,.28) 0 12px 30px 0` (fuera de token) | **1** | **0** |
| **Valores distintos** | **3** | **1** |

Landing sola: **35 elementos con sombra** en el diseño (32 en reposo + 2
elevados + 1 fuera de token) contra **12** en el desplegado.

**El desplegado no tiene escala de elevación: tiene un único plano.** La sombra
elevada (`0 18px 45px`) existe como token en el repo (`--sombra-elevada`, ya
verificado en la medición previa §1) pero **cero elementos la usan en reposo**.
El prototipo la usa para despegar el panel del asistente y el selector flotante
del fondo; sin ella, todo el sitio queda pegado a la misma altura.

La sombra `rgba(0,0,0,.28) 0 12px 30px` del CTA «Reservar cita» del hero está
**fuera del sistema de tokens** — es un literal. Confirma en navegador el
hallazgo H11 de `analisis_tokens_geometria.md` §3. **No debe portarse.**

---

## 3. BORDES (ancho, estilo y color computados, por lado)

| Borde computado | Diseño | Desplegado |
| --- | ---: | ---: |
| `1px solid rgba(15,32,60,.13)` (neutro) | **425** | — |
| `1px solid rgb(221,201,218)` = `#DDC9DA` (neutro) | — | **201** |
| `1px solid rgb(30,64,175)` = `#1E40AF` (primario) | **56** | — |
| `1px solid rgb(160,105,151)` = `#A06997` (control) | — | **56** |
| `1px solid rgb(119,40,107)` = `#77286B` | — | **8** |
| `1px solid rgba(255,255,255,.28)` | 4 | 0 |
| `1px solid rgba(255,255,255,.55)` | 4 | 0 |
| `1px solid rgba(255,255,255,.24)` | 1 | 0 |
| **Valores distintos** | **5** | **3** |

Dos lecturas:

1. **El borde de control mapea 1:1**: 56 lados en el diseño con el primario
   `#1E40AF`, 56 lados en el desplegado con `#A06997`. Mismo recuento exacto.
   Los controles de formulario ya se corresponden uno a uno entre las dos
   fuentes; solo cambia el color.
2. **Al desplegado le faltan los 9 bordes claros sobre fondo oscuro**
   (`rgba(255,255,255,.24/.28/.55)`). Es una consecuencia directa de no tener
   ninguna banda oscura (apartado 5.3), no un fallo de tokens.

### 3.1 Discrepancia resuelta: el `1.5px` del prototipo no existe al pintarse

`analisis_tokens_geometria.md` §9 documenta bordes de **`1.5px`** en 7 elementos
del prototipo (enlace «Tienda» del nav, CTA secundario del hero, «Llamar a la
clínica», flechas de galería…). **Mi medición en vivo no encuentra ni un solo
borde de 1,5 px: los 7 computan `1px`.**

Comprobado con un caso sintético aislado (`sv-borde-15.mjs`):

```
<div style="border:1.5px solid red">  →  getComputedStyle(...).borderTopWidth === "1px"
```

**Chromium redondea el ancho de borde a píxeles de layout enteros.** A
`deviceScaleFactor: 1` —es decir, en la pantalla de cualquier socio con un
monitor normal— el `1.5px` del prototipo **se pinta como `1px`**.

No es un error de la lectura de código: es que la distinción que el prototipo
declara **no llega al cristal**. Consecuencia para el contrato: **no hay que
modelar un ancho de borde de 1,5 px**. El sistema unificado necesita un único
ancho de borde, `1px`, y si se quiere diferenciar un control acentuado hay que
hacerlo con **color**, no con grosor.

---

## 4. ESPACIADO: aquí la relación se invierte

Éste es el resultado que contradice la intuición del proyecto, y conviene
enseñárselo a los socios tal cual.

### 4.1 `gap` — valores distintos en uso (suma de las 4 páginas)

| Diseño (**19 valores**) | Desplegado (**5 valores**) |
| --- | --- |
| `9px`×90, `12px`×72, `10px`×41, `8px`×34, `7px`×28, `14px`×21, `18px`×15, `20px`×15, `16px`×12, `11px`×12, `6px`×9, `2px`×8, `22px`×5, `32px`×5, `24px`×4, `26px`×3, `44px`×2, `52px`×2, `34px`×2 | `8px`×118, `16px`×46, `24px`×12, `32px`×10, `12px`×4 |

### 4.2 `padding` — valores distintos en uso (suma de las 4 páginas)

| Diseño (**38 valores**) | Desplegado (**9 valores**) |
| --- | --- |
| `11px`×112, `20px`×85, `14px`×78, `18px`×73, `22px`×71, `16px`×62, `9px`×56, `4px`×54, `28px`×51, `12px`×50, `6px`×49, `5px`×44, `10px`×38, `24px`×30, `15px`×24, `1px`×16, `104px`×12, `13px`×12, `26px`×10, `8px`×6, `32px`×6, `2px`×6, `44px`×5, `7px`×4, `30px`×3, `90px`×3, `100px`×3, `60px`×3, `25px`×2, `76px`×2, y 8 valores de un solo uso (`140`, `92`, `84`, `72`, `56`, `48`, `40`, `36`) | `12px`×114, `24px`×109, `1px`×84, `16px`×48, `4px`×32, `64px`×22, `6px`×10, `8px`×4, `48px`×4 |

### 4.3 Lectura

**El desplegado sí tiene una escala de espaciado; el prototipo no.** Los 5 gaps
del desplegado son `8·1, 8·2, 8·3, 8·4` más un único intruso (`12px`, 4 usos), y
sus 9 paddings son todos múltiplos de 4 salvo el `1px` (que son separadores de
1 px, no espaciado). El prototipo reparte 19 gaps y 38 paddings sin ninguna
progresión: `7`, `9`, `10`, `11`, `13`, `14`, `15`, `22`, `25`, `26`…

Esto **confirma en navegador el hallazgo H20** de
`analisis_tokens_geometria.md` §5.5 («19 valores fijos distintos de `gap`»):
medidos, exactamente **19**. Coincidencia perfecta entre lectura de código y
medición.

**Consecuencia para el rediseño, y es importante**: la escala de espaciado del
repo **se conserva tal cual**. Portar el espaciado del prototipo sería sustituir
un sistema de 5 pasos por un ruido de 19. Lo único que hay que traer del
prototipo es el **ritmo vertical de sección** (apartado 5.2), que es otra cosa.

---

## 5. ANCHOS Y BANDAS

### 5.1 La columna de contenido real

Medido con `getBoundingClientRect().width` sobre el contenedor de cada sección
a 1440 px:

| | Diseño | Desplegado | Δ |
| --- | ---: | ---: | ---: |
| `max-width` declarado del contenedor | `1220px` (×24 elementos) | `1024px` (×16) | −196 px |
| **Ancho real del contenido** | **1220 px** | **976 px** | **−244 px (−20,0 %)** |
| Ancho de la `<section>` | 1440 px (a sangre) | 1024 px | −416 px |
| Contenedores secundarios | `900px` hero (real 843,3), `860px` FAQ (real 860), `720px` cifras, `640px`×2 | `640px`×3, `678,5px`×3 | — |

**Corrección a la medición previa.** `progress/rediseno_mediciones_navegador.md`
§2 registra «1220 px vs 1024 px, Δ −196 px». Eso compara los `max-width`
*declarados*. El ancho **real** del contenido del desplegado es **976 px**,
porque el `padding` lateral de 24 px va **dentro** del contenedor de 1024 px.
La diferencia efectiva es de **244 px, no 196**: un cuarto más de lo registrado.

### 5.2 Estructura de banda y ritmo vertical (landing, 1440 px)

El prototipo usa `section` a sangre (1440 px) con un contenedor de 1220 px
dentro. El desplegado usa un `div` envolvente a sangre con una `section` de
1024 px dentro. **La arquitectura de banda es equivalente**, salvo una
excepción (5.4).

| Banda | Diseño: ancho×alto, fondo | Desplegado: ancho×alto, fondo |
| --- | --- | --- |
| `inicio` | 1440×**756**, `#0B1B33` + `linear-gradient` sobre foto | 1440×**553**, `#FFFFFF`, sin imagen |
| `servicios` | 1440×2197, `#F8FAFC` | 1440×531, `#F4EEF3` |
| campañas | 1440×733, `#EDF2F9` | **sin banda** (ver 5.4) |
| `equipo` | 1440×1303, `#F8FAFC` | 1440×372, `#F4EEF3` |
| `reservar` | 1440×678, `#EDF2F9` | 1440×498, `#FFFFFF` |
| `galeria` | 1440×767, `#F8FAFC` | 1440×489, `#F4EEF3` |
| `contacto` | 1440×1027, `#EDF2F9` | 1440×**1517**, `#FFFFFF` |
| `faq` | 1440×754, `#F8FAFC` | 1440×526, `#F4EEF3` |
| Cabecera | 63 px, `sticky`, fondo al 88 % + `backdrop-filter: blur(14px)` | 64 px, `fixed`, fondo sólido, **sin blur** |

**Padding vertical de sección**:

| | Diseño | Desplegado |
| --- | --- | --- |
| Landing | `104px` en 6 secciones, `90px` en campañas | `64px` en 6 bandas, **`0px` en 2** (campañas y contacto) |
| Subpáginas | 12 combinaciones distintas (`84/48`, `56/100`, `76/40`, `0/44`, `0/100`, `76/36`, `0/30`, `0/90`…) | plano |

Δ = **−40 px por borde de sección**. Sobre 8 secciones son **−640 px** de aire
vertical solo en el landing, y explica buena parte de los 8626 px vs 5438 px de
altura de documento.

### 5.3 El hero es la diferencia que verá primero un socio

Es la única fila de este informe que un no técnico juzga en un segundo:

- **Diseño**: banda de 1440×**756 px**, fondo `rgb(11,27,51)` (azul noche) con
  `linear-gradient(rgba(6,16,32,.62) → …)` **sobre una fotografía**, titular en
  blanco con `text-shadow`, dos CTA de 52 px de alto (uno relleno `#1E40AF`,
  otro translúcido `rgba(255,255,255,.12)`).
- **Desplegado**: banda de 1440×**553 px**, fondo `rgb(255,255,255)`,
  `background-image: none`. **No hay imagen, no hay banda oscura, no hay
  contraste de apertura.**

El sitio abre con un bloque blanco. El prototipo abre con una fotografía a
sangre. Δ de altura: **−203 px**. Y es la causa raíz de que al desplegado le
falten los 9 bordes claros del apartado 3: no tiene ninguna superficie oscura
sobre la que pintarlos.

### 5.4 La banda de campañas del desplegado está rota respecto al patrón

Hijos directos de `#root` en el desplegado, medidos:

```
header · div#inicio · div#servicios · section(SIN id) · div#equipo ·
div#reservar · div#galeria · div#contacto · div#faq · footer · div
```

Siete de las ocho bandas tienen envoltorio a sangre con `id`. **Campañas no
tiene ninguno**: es una `section` suelta de 1024 px, sin `id`, sin fondo propio
y con `padding` vertical `0px`. Es la única sección del landing que rompe el
patrón, en las tres dimensiones a la vez.

**Discrepancia con el contexto de arranque.** El encargo daba por establecido
que «las 8 secciones del landing tienen los mismos ids en las dos fuentes
(inicio, servicios, **campanas**, equipo, reservar, galeria, contacto, faq)».
Medido: `document.getElementById('campanas')` devuelve **`null`** en el
desplegado. Son **7 de 8**, no 8 de 8.

No provoca ningún enlace roto —lo verifiqué: los 11 anclajes internos
`a[href^="#"]` del desplegado resuelven todos, porque su enlace «Campañas» del
nav apunta a la subpágina `/campanas` y no a `#campanas`—, pero sí significa que
el contrato de rediseño **no puede apoyarse en `#campanas` como punto de anclaje
existente**: hay que crearlo.

---

## 6. ALTURAS DE CONTROL (WCAG 2.2 SC 2.5.8)

Universo: todo `button`, `input`, `select`, `textarea`, `summary` y todo `a` con
pinta de botón (con `padding` vertical y además fondo, borde o radio propios).
Suma de las 4 páginas.

| Control | Diseño (n · mín · máx · moda) | Desplegado (n · mín · máx · moda) |
| --- | --- | --- |
| `button` | 61 · **44** · 486,5 · **44 px** (×34), 48 px (×19) | 44 · **26** · 63 · **40 px** (×17), 56 (×10), 26 (×6), 48 (×6) |
| `a` con pinta de botón | **36** · 35 · 52 · **36 px** (×24) | **0** |
| `summary` | 6 · 70 · 70 · **70 px** | **0** (el FAQ usa `button`) |
| `input[text/tel/email]` | 3 · **46** · 46 | 3 · **28** · 28 |
| `select` | 1 · **46** | 1 · **25** |
| `textarea` | 1 · 110 | 1 · 96 |
| `input[checkbox]` | 1 · **18** | 1 · **24** |
| **TOTAL** | **109** · 18 · 486,5 · moda **44 px** | **50** · 24 · 96 · moda **40 px** |
| Controles < 24 px (**falla SC 2.5.8**) | **1** (el checkbox, 18×18) | **0** |
| Controles < 44 px (SC 2.5.5 AAA) | 31 / 109 (28 %) | 28 / 50 (**56 %**) |

### 6.1 El diseño tiene un suelo de 44 px para botones; el desplegado no

Ni un solo `button` del prototipo baja de 44 px. En el desplegado hay **6
botones de 26 px de alto** —los cinco «Ver qué incluye» de las tarjetas de
servicio y «Ver la formación de Marcos»—: son texto desnudo, `background`
transparente, `border-radius: 0px`. Pasan el mínimo de 24 px por **2 px**, pero
no se leen como controles.

### 6.2 Los enlaces del nav: píldora de 36 px contra texto de 24 px

| | Diseño | Desplegado |
| --- | --- | --- |
| Alto del enlace de nav | **36 px** | **24 px** |
| `padding` | `9px 11px` | `0px` |
| `border-radius` | `999px` | `999px` (sin efecto: no hay caja) |
| Marca / wordmark | 205,4×**38** | 199,3×**24** |
| Anclas con fondo propio (CTA rellenos) | **9** | **1** |
| Anclas con `padding` vertical | **15** | **0** |

En el desplegado **ningún** `<a>` tiene relleno vertical. El radio de `999px`
está declarado pero no se ve, porque sin `padding` no hay caja que redondear.
El único CTA relleno de todo el landing desplegado es «Reservar cita» de la
cabecera (150,6×56, `#77286B`). El prototipo tiene **9**.

Los 24 px del nav desplegado cumplen SC 2.5.8 justo en el límite, sin holgura.

### 6.3 Inversión: en el checkbox el desplegado es el correcto

El `input[checkbox]` del prototipo mide **18×18 px** y **falla WCAG 2.2
SC 2.5.8** (mínimo 24×24). El del desplegado mide **24×24** y pasa.
**Este valor no se porta desde el diseño.** Es el segundo caso, junto con la
escala de espaciado, en que el sitio real es mejor que el prototipo.

---

## 7. PUNTOS DE CORTE REALES

Landing de las dos fuentes cargado a 320, 360, 390, 480, 640, 768, 900, 1024,
1220, 1280 y 1440 px (página nueva en cada ancho, para que el montaje mida bien
desde el principio). El nº de columnas se cuenta **por posición `x` real de los
hijos**, no por `grid-template-columns`, porque `auto-fit` colapsa pistas sin
cambiar la declaración.

| Ancho | Diseño: contenedor · nav · alto doc | Desplegado: contenedor · nav · alto doc |
| ---: | --- | --- |
| 320 | 636 · hamburguesa 46×46 · 15 369 | 272 · hamburguesa 87×52 · 8 064 |
| 360 | 641 · hamburguesa · 15 446 | 312 · hamburguesa 99×52 · 7 795 |
| 390 | 645 · hamburguesa · 15 489 | 342 · hamburguesa 100×48 · 7 624 |
| 480 | 656 · hamburguesa · 16 014 | 432 · hamburguesa · 7 307 |
| 640 | 662 · hamburguesa · **16 608** | 592 · hamburguesa · 6 025 |
| 768 | 768 · hamburguesa · 9 723 | 720 · hamburguesa · 5 984 |
| 900 | 900 · hamburguesa · 10 368 | 852 · hamburguesa · 5 832 |
| 1024 | 1024 · hamburguesa · 9 539 | **976 · nav 709×24** · 5 414 |
| 1220 | **1220 · nav 717×36** · 8 536 | 976 · nav · 5 438 |
| 1280 | 1220 · nav · 8 626 | 976 · nav · 5 438 |
| 1440 | 1220 · nav · 8 626 | 976 · nav · 5 438 |

### 7.1 Cada fuente tiene exactamente UN punto de corte discreto, y no es el mismo

Bisección con paso de 1 px sobre la visibilidad del `nav` de escritorio
(`sv-biseccion.mjs`):

| Fuente | Nav oculto hasta | Nav visible desde | Punto de corte |
| --- | ---: | ---: | ---: |
| **Diseño** | 1119 px | 1120 px | **1120 px** |
| **Desplegado** | 1023 px | 1024 px | **1024 px** |

**Δ = 96 px.** En toda la franja **1024–1119 px** las dos fuentes discrepan: el
sitio real ya muestra el menú completo de escritorio mientras el prototipo
sigue con hamburguesa. Es exactamente el rango de un iPad en horizontal.

El `1120` medido **coincide al píxel** con la lectura de código
(`analisis_tokens_geometria.md` §10.2: `ancho < 1120`, `VLS:684`). Lectura y
medición concuerdan: el valor entra en el contrato.

### 7.2 No hay ningún otro punto de corte: el resto es continuo

Ninguna otra transición ocurre en un ancho fijo. Las rejillas cambian de columna
de forma continua por `auto-fit`/`minmax`, así que solo se puede acotar el
intervalo en que ocurren:

| Transición | Diseño (intervalo) | Desplegado (intervalo) |
| --- | --- | --- |
| Primera rejilla 1 → 2 columnas | entre **480 y 640** | entre **320 y 360** |
| Rejilla secundaria → 3 columnas | — | entre **390 y 480** |
| Rejilla principal 2 → 3 columnas | entre **900 y 1024** | entre **900 y 1024** |
| Segunda rejilla → 3 columnas | entre **1024 y 1220** | ya a 1024 |
| El contenedor deja de crecer | **1220 px** | **1024 px** |

El desplegado empieza a repartir en columnas mucho antes (a 360 px ya tiene una
rejilla de 2 columnas; el diseño espera a 640).

### 7.3 Desborde horizontal: limpio en las dos, en los 11 anchos

`document.documentElement.scrollWidth > window.innerWidth` medido en las **22
cargas** (2 fuentes × 11 anchos): **falso en las 22**. Exceso = 0 px siempre.

**Ninguna de las dos fuentes desborda a ningún ancho.** No hay nada que
arreglar aquí, y conviene decirlo explícitamente: es la única dimensión de este
informe en que las dos fuentes ya están de acuerdo y en el estado correcto.

### 7.4 El prototipo se descontrola en móvil

Altura de documento del prototipo: 15 369 px a 320 px, subiendo hasta **16 608 px
a 640 px**, y luego cayendo a 9 723 px a 768 px. Un documento que **crece** al
ensancharse la ventana entre 320 y 640 px y se desploma un 41 % al pasar de 640
a 768 es una maqueta que nadie revisó en móvil. El desplegado decrece de forma
monótona (8 064 → 5 414), que es el comportamiento sano.

**No hay que portar la maquetación móvil del prototipo.** A 640 px el prototipo
mide 2,75× la altura del sitio real.

---

## 8. Cruce con `analisis_tokens_geometria.md` (lectura de código)

Regla del proyecto: coincidencia → el valor entra en el contrato; discrepancia →
se vuelve a la fuente.

| # | Lo que dice la lectura de código | Lo medido en navegador | Veredicto |
| --- | --- | --- | --- |
| 1 | §5.5 «19 valores fijos distintos de `gap`» (H20) | Exactamente **19** | ✅ **Confirmado**, entra en contrato |
| 2 | §6 contenedor maestro `1220px` en las 4 páginas | 1220 px reales en las 4 | ✅ **Confirmado** |
| 3 | §10.2 nav del prototipo conmuta en `ancho < 1120` | Bisección: **1120 px** exacto | ✅ **Confirmado al píxel** |
| 4 | §3 sombra literal `0 12px 30px rgba(0,0,0,.28)` fuera de token (H11) | Medida, ×1, en el CTA del hero | ✅ **Confirmado**, no portar |
| 5 | §2 radio `2px` en las barras de la hamburguesa | Invisible a 1440; aparece a 390 px (×3) | ✅ Confirmado, **solo en móvil** |
| 6 | §9 bordes de **`1.5px`** en 7 elementos | **Los 7 computan `1px`**; Chromium redondea a dSF 1 | ⚠️ **Discrepancia real**: el 1,5 px no llega al cristal. **No modelar** |
| 7 | §2 radio `14px` (`CAM:125,146`) | **0 apariciones** en las 4 vistas por defecto | ⚠️ Vive en la ficha de campaña, tras interacción |
| 8 | §2 burbuja `16px 16px 5px 16px` (usuario) | **0 apariciones**; sí la del bot (`…16px 5px`) | ⚠️ Requiere interactuar con el chat |
| 9 | §2 «13 radios simples + 2 compuestos» | **12 distintos** en uso real a 1440; 11 a 390 | ⚠️ El inventario de código **sobrecuenta** lo que un visitante llega a ver |

Y dos discrepancias con el **contexto de arranque**, no con los análisis:

| # | Lo dado por establecido | Lo medido | Veredicto |
| --- | --- | --- | --- |
| 10 | «Las 8 secciones del landing tienen los mismos ids en las dos fuentes» | `#campanas` **no existe** en el desplegado (7 de 8) | ⚠️ **Discrepancia**, ver §5.4 |
| 11 | «`max-width` de contenedor: 1220 vs 1024, Δ −196» | Contenido real **1220 vs 976, Δ −244** | ⚠️ **Corrección**, ver §5.1 |

---

## 9. Orden de cierre propuesto (por impacto visual medido, no por esfuerzo)

1. **Hero** (§5.3). Banda oscura a sangre + fotografía + los dos CTA de 52 px.
   Es lo primero que ve un socio y hoy es un rectángulo blanco. Δ 203 px de alto
   y el 100 % del contraste de apertura.
2. **Ritmo vertical de sección** (§5.2). `64px` → `104px`, y dar padding a las
   dos bandas que hoy tienen `0px`. Δ −640 px de aire en el landing.
3. **Columna de contenido** (§5.1). 976 → 1220 px reales. Δ +244 px, un 25 %
   más de ancho útil.
4. **Círculos** (§1.1). Recuperar el rol `50%`: 74 elementos en el prototipo,
   0 en el sitio. Cambia la textura de toda la página sin tocar un color.
5. **CTA y enlaces de nav como controles** (§6.2). 9 CTA rellenos frente a 1;
   nav de 36 px con píldora frente a 24 px de texto desnudo.
6. **Escala de elevación** (§2). Poner en uso `--sombra-elevada`, hoy con
   0 elementos en reposo.
7. **Banda de campañas** (§5.4). Crear envoltorio, `id="campanas"` y fondo.
8. **Suelo de 44 px en botones** (§6.1). Los 6 botones de 26 px.
9. **Radio de tarjeta** (§1.2). 24 → 20 px. Δ 4 px, el de menor impacto.

### Lo que NO se porta desde el prototipo

- **La escala de espaciado** (§4.3): 19 gaps y 38 paddings frente a los 5 y 9
  del repo. El repo gana.
- **El checkbox de 18 px** (§6.3): falla WCAG 2.2 SC 2.5.8. El repo gana.
- **El borde de 1,5 px** (§3.1): no se pinta a dSF 1.
- **La sombra literal del CTA del hero** (§2): está fuera de token.
- **La maquetación móvil** (§7.4): el prototipo mide 2,75× a 640 px.
