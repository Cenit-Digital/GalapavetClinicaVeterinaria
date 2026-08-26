# Análisis de geometría y tokens — prototipos Claude Design

Fecha del análisis: 2026-08-26.

## 0. Alcance, fuentes y convención de citas

Ficheros leídos íntegramente (cabecera `<helmet><style>`, cuerpo con `style=` inline y el
`<script type="text/x-dc">` con los arrays de datos y los estilos calculados en JS):

| Alias | Ruta absoluta | Líneas |
|---|---|---|
| `VLS` | `C:/Users/User/Desktop/CenitDigitalProyectosCodigo/GalapavetClinicaVeterinaria/docs/diseno-claude-design/Veterinaria La Sierra.dc.html` | 829 |
| `TIE` | `C:/Users/User/Desktop/CenitDigitalProyectosCodigo/GalapavetClinicaVeterinaria/docs/diseno-claude-design/Tienda.dc.html` | 308 |
| `CAM` | `C:/Users/User/Desktop/CenitDigitalProyectosCodigo/GalapavetClinicaVeterinaria/docs/diseno-claude-design/Campanas.dc.html` | 339 |
| `BLO` | `C:/Users/User/Desktop/CenitDigitalProyectosCodigo/GalapavetClinicaVeterinaria/docs/diseno-claude-design/Blog.dc.html` | 383 |
| `SUP` | `C:/Users/User/Desktop/CenitDigitalProyectosCodigo/GalapavetClinicaVeterinaria/docs/diseno-claude-design/support.js` | 1911 |

Toda cita tiene la forma `ALIAS:línea`. Los estilos viven en tres sitios distintos y hay que
mirar los tres: (a) el `<style>` de `<helmet>` — solo tokens y reset, (b) los atributos
`style="…"` inline del cuerpo, (c) los objetos de estilo devueltos por `renderVals()` dentro
del `<script type="text/x-dc">` (notación camelCase: `borderRadius`, `minHeight`…), que son los
que se inyectan en los `style="{{ … }}"`.

Solo hay **un único bloque `<style>` por fichero**: `VLS:16-61`, `TIE:16-38`, `CAM:16-38`,
`BLO:16-38`. Todo lo demás es inline. No hay hoja CSS externa.

---

## 1. Los 4 temas de paleta y sus 18 roles

Declaración canónica y completa: `VLS:18-49` (`:root` en `VLS:18-25`, `calida` en `VLS:26-33`,
`tech` en `VLS:34-41`, `eco` en `VLS:42-49`).

| # | Rol | clinica (defecto) | calida | tech | eco |
|---|---|---|---|---|---|
| 1 | `--bg` | `#F8FAFC` | `#FFFBF2` | `#0F172A` | `#FFFFFF` |
| 2 | `--bg-2` | `#EDF2F9` | `#FEF3C7` | `#152242` | `#EFFDF7` |
| 3 | `--card` | `#FFFFFF` | `#FFFDF8` | `#16233F` | `#FFFFFF` |
| 4 | `--surface` | `#FBFDFF` | `#FFFDF6` | `#111C34` | `#F7FEFB` |
| 5 | `--border` | `rgba(15,32,60,.13)` | `rgba(120,53,15,.16)` | `rgba(148,197,255,.18)` | `rgba(4,120,87,.16)` |
| 6 | `--ink` | `#0B1B33` | `#3B2A12` | `#F1F5F9` | `#06301F` |
| 7 | `--text` | `#3C4C66` | `#5C4626` | `#C6D2E2` | `#35544A` |
| 8 | `--muted` | `#5E6E88` | `#8A6C45` | `#94A3B8` | `#557368` |
| 9 | `--primary` | `#1E40AF` | `#B45309` | `#06B6D4` | `#047857` |
| 10 | `--primary-strong` | `#1B3796` | `#92400E` | `#0891B2` | `#036049` |
| 11 | `--on-primary` | `#FFFFFF` | `#FFFFFF` | `#04212B` | `#FFFFFF` |
| 12 | `--accent` | `#10B981` | `#4D7C0F` | `#22D3EE` | `#0EA97B` |
| 13 | `--accent-ink` | `#047857` | `#3F6212` | `#67E8F9` | `#065F46` |
| 14 | `--accent-soft` | `#E7F8F1` | `#F1F7E3` | `rgba(6,182,212,.14)` | `#D6FBEA` |
| 15 | `--urg` | `#DC2626` | `#C2410C` | `#F87171` | `#DC2626` |
| 16 | `--urg-soft` | `#FEE9E9` | `#FDEBE0` | `rgba(248,113,113,.16)` | `#FDE9E9` |
| 17 | `--shadow` | `0 18px 45px rgba(15,32,60,.10)` | `0 18px 45px rgba(120,53,15,.12)` | `0 22px 55px rgba(0,0,0,.45)` | `0 18px 45px rgba(4,120,87,.12)` |
| 18 | `--shadow-sm` | `0 6px 18px rgba(15,32,60,.07)` | `0 6px 18px rgba(120,53,15,.08)` | `0 8px 22px rgba(0,0,0,.35)` | `0 6px 18px rgba(4,120,87,.08)` |

### 1.1 Las subpáginas solo declaran 16 de los 18 roles

`TIE:17-27`, `CAM:17-27` y `BLO:17-27` repiten la misma paleta **omitiendo `--primary-strong`
y `--urg-soft`**. Comprobado con `grep -c "primary-strong"`: `VLS` 4, `TIE` 0, `CAM` 0, `BLO` 0;
idéntico resultado para `urg-soft`. Los valores de los 16 roles restantes coinciden literalmente
con los de `VLS` (mismos hexadecimales, mismas alfas); solo cambia el formato (una línea por tema
en lugar de bloque multilínea).

### 1.2 Roles declarados que nadie consume

| Rol | Usos reales en markup | Evidencia |
|---|---|---|
| `--primary-strong` | **0** en las 4 páginas | las 4 apariciones en `VLS` son las 4 declaraciones de tema (`VLS:21,29,37,45`) |
| `--urg-soft` | **0** en las 4 páginas | las 4 apariciones en `VLS` son `VLS:23,31,39,47` |
| `--surface` | 7 líneas en `VLS` (`VLS:274,288,368,371,375,378,387`), 4 en `TIE` (`TIE:124,139,141,147`), **0** en `CAM`, **0** en `BLO` | grep `var(--surface)` |
| `--accent` | 2 en `VLS` (`VLS:278` punto "en línea", `VLS:498` conic-gradient del selector), 1 en `BLO` (`BLO:321` borde de la cita), **0** en `TIE`, **0** en `CAM` | grep `var(--accent)` |

El color de acento que realmente se ve en pantalla es `--accent-ink`, no `--accent`:
`--accent-ink` pinta los eyebrows (`VLS:144,186,212,257,320,348,427`), los checks
(`VLS:165,267`), las etiquetas de categoría (`VLS:153`, `TIE:94`, `BLO:114`) y los botones
verdes (`VLS:261,306`).

### 1.3 Los swatches del selector no coinciden con los tokens

`VLS:601-606` define los 3 colores de muestra por tema; `VLS:813` los pinta como círculos de
14×14. Comparado con la tabla del apartado 1:

| Tema | Swatches declarados (`VLS:602-605`) | Discrepancia |
|---|---|---|
| clinica | `#1E40AF`, `#10B981`, `#F8FAFC` | ninguna (= `--primary`, `--accent`, `--bg`) |
| calida | `#D97706`, `#4D7C0F`, `#FEF3C7` | `#D97706` **no es** el `--primary` de calida (`#B45309`, `VLS:29`) |
| tech | `#0F172A`, `#06B6D4`, `#64748B` | `#64748B` **no existe en ningún tema** de `VLS:18-49` |
| eco | `#047857`, `#A7F3D0`, `#FFFFFF` | `#A7F3D0` **no es** el `--accent` de eco (`#0EA97B`, `VLS:46`) |

### 1.4 Asimetría del tema `tech`

`tech` es el único tema oscuro (`--bg:#0F172A`, `VLS:35`) y el único que resuelve `--accent-soft`
y `--urg-soft` con alfa (`rgba(6,182,212,.14)` y `rgba(248,113,113,.16)`, `VLS:38-39`) en lugar
de hex sólido. También es el único con `--on-primary` distinto de blanco (`#04212B`, `VLS:37`).
Su sombra es de otra escala: `0 22px 55px` / `0 8px 22px` frente a `0 18px 45px` / `0 6px 18px`
del resto (`VLS:40` vs `VLS:24,32,48`).

### 1.5 Persistencia y aplicación del tema

`data-tema` se escribe sobre `document.documentElement` desde JS, no desde el HTML:
`VLS:640` (`aplicarTema`), con lectura y escritura en `localStorage` bajo la clave `'vls-tema'`
(`VLS:626,641`). Las subpáginas solo leen: `TIE:216-217`, `CAM:274-275`, `BLO:300-301`.
Fallback en las tres: `'clinica'`.

---

## 2. Escala de RADIOS (`border-radius`)

13 valores simples distintos + 2 compuestos. No hay progresión regular.

| Valor | Dónde aparece (cita) |
|---|---|
| `2px` | barras del icono hamburguesa: `VLS:101,102,103` |
| `3px` | aspas del logotipo (cabecera y pie): `VLS:81,82,449,450`; `TIE:47,48`; `CAM:47,48`; `BLO:47,48` |
| `11px` | cuadro del logo del pie `VLS:448`; miniatura de "otras campañas" `CAM:176`; miniatura de relacionados `BLO:169` |
| `12px` | cuadro del logo de cabecera `VLS:80`, `TIE:46`, `CAM:46`, `BLO:46`; enlaces del menú móvil `VLS:110,112`; campos del formulario `VLS:368,371,375,378,387`; miniatura de la cesta `TIE:133`; botón hamburguesa `VLS:697` (JS); fila del selector de paleta `VLS:818` (JS) |
| `14px` | ítems de "qué incluye" `CAM:125`; caja de letra pequeña `CAM:146` |
| `16px` | tarjeta de campaña en la landing `VLS:193`; tarjeta de "otras campañas" `CAM:175`; tarjeta de relacionados `BLO:168` |
| `18px` | panel del selector de paleta `VLS:480`; tarjeta de garantías `TIE:110` |
| `20px` | tarjeta de servicio `VLS:150`; tarjeta de equipo `VLS:219`; figura de galería `VLS:332`; caja de urgencias `VLS:399`; caja del mapa `VLS:407`; tarjeta de producto `TIE:86`; tarjeta de artículo `BLO:109`; caja CTA del artículo `BLO:157` |
| `22px` | panel del asistente `VLS:273`; tarjeta del formulario `VLS:354`; tarjeta de campaña `CAM:83`; caja de precio `CAM:150`; imagen grande del artículo `BLO:149` |
| `24px` | tarjeta destacada del blog `BLO:367` (JS) |
| `30px` | píldoras de especialidad del equipo `VLS:244` |
| `50%` | 18 usos en `VLS` (puntos de pulso `VLS:69,95,121,128,401`; checks `VLS:165,267`; avatar `VLS:275`; botones circulares `VLS:300,325,326,357,497,498`; icono `+` `VLS:435`; y `VLS:726,745,813` en JS); `TIE:124,139,141`; `CAM:60,126,135`; `BLO:60,98,138` |
| `999px` | píldora universal: `VLS:92,94,97,113,120,126,127,153,189,197,261,262,292,299,306,393,404`; `TIE:57,60,90,152,259,271,286`; `CAM:57,59,62,96,110,111,156,162,163,299,323`; `BLO:57,59,62,92,133,162,341,358` |
| `16px 16px 16px 5px` | burbuja de chat del bot `VLS:764` (JS) |
| `16px 16px 5px 16px` | burbuja de chat del usuario `VLS:764` (JS) |

---

## 3. Escala de SOMBRAS

Solo hay 2 tokens (`--shadow`, `--shadow-sm`; valores por tema en la tabla del apartado 1),
más 4 sombras escritas a mano fuera del sistema.

| Sombra | Dónde |
|---|---|
| `var(--shadow-sm)` (reposo) | `VLS:150,193,219,332,354,407`; `TIE:86`; `CAM:83`; `BLO:109`; `BLO:368` (JS, tarjeta destacada) |
| `var(--shadow)` (hover) | `style-hover` de tarjeta: `VLS:150,219`; `TIE:86`; `CAM:83`; `BLO:109` |
| `var(--shadow)` (elevación fija) | panel del asistente `VLS:273`; panel del selector `VLS:480`; botón flotante `VLS:497`; cajón de la cesta `TIE:121`; caja de precio `CAM:150`; imagen del artículo `BLO:149` |
| `0 12px 30px rgba(0,0,0,.28)` | **literal, fuera de token** — CTA "Reservar cita" del hero `VLS:126` |
| `text-shadow: 0 2px 24px rgba(0,0,0,.35)` | H1 del hero `VLS:123` |
| `text-shadow: 0 1px 12px rgba(0,0,0,.35)` | párrafo del hero `VLS:124` |
| `text-shadow: 0 2px 22px rgba(0,0,0,.4)` | H1 de la ficha de campaña `CAM:112` |

Patrón: `--shadow-sm` en reposo → `--shadow` en hover, siempre acompañado de
`transform:translateY(-4px)` (`VLS:150`, `TIE:86`, `CAM:83`, `BLO:109`).

---

## 4. Escala TIPOGRÁFICA

### 4.1 Familias

Ambas se cargan de Google Fonts en una sola petición: `VLS:15`, `TIE:15`, `CAM:15`, `BLO:15`:
`family=Outfit:wght@400;500;600;700` + `family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700`,
con `display=swap` y `preconnect` en `VLS:13-14`.

- **DM Sans** es la familia por defecto del documento:
  `body{font-family:'DM Sans',system-ui,-apple-system,sans-serif}` (`VLS:52`, `TIE:30`, `CAM:30`, `BLO:30`).
- **Outfit** se aplica siempre inline, elemento a elemento, nunca por selector. Líneas exactas:
  `VLS:85,123,134,145,156,187,200,213,226,258,275,321,337,349,358,365,402,428,433,452`;
  `TIE:51,70,95,98,111,123,150,161`; `CAM:51,75,90,93,112,122,131,135,144,153,172,178,191`;
  `BLO:51,74,95,115,135,159,165,171,183` y, en JS, `BLO:315,319`.

Outfit cubre: wordmark, H1, H2, H3, cifras del hero, precios, avatares/iniciales, títulos de
tarjeta y los `summary` del FAQ. DM Sans cubre: cuerpo, eyebrows, píldoras, formularios,
etiquetas, pies y navegación.

### 4.2 Pesos realmente usados

`400` (6 usos, todos en `VLS:368,371,375,378,387,389`, para neutralizar el `600` heredado del
`<label>`), `500`, `600`, `700`. Recuento por fichero (inline + JS):

| Fichero | 400 | 500 | 600 | 700 |
|---|---|---|---|---|
| `VLS` | 6 | 5 | 34 | 29 |
| `TIE` | 0 | 1 | 13 | 6 |
| `CAM` | 0 | 2 | 20 | 12 |
| `BLO` | 0 | 2 | 15 | 9 |

**Peso 600 sobre DM Sans**: el enlace de fuentes declara para DM Sans solo `400;500;700`
(`VLS:15`), pero hay 34 elementos con `font-weight:600` que **no** llevan `font-family:'Outfit'`
y por tanto heredan DM Sans: `VLS:86,97,120,127,236,237,244,262,292,307,360,367,370,374,377,386`
(16), `TIE:52,60,69,135,272` (5), `CAM:52,62,73,110,158,159,160,163` (8),
`BLO:52,62,73,133,359` (5). Qué renderiza el navegador en ese caso (instancia variable
interpolada, peso sintético o caída a 500/700) **NO CONSTA EN LA FUENTE**: hay que verificarlo
en navegador.

### 4.3 Tamaños fluidos (`clamp`)

| `font-size` | Peso | `line-height` | `letter-spacing` | Familia | Elemento y cita |
|---|---|---|---|---|---|
| `clamp(33px,6.4vw,68px)` | 600 | `1.05` | `-.02em` | Outfit | H1 del hero `VLS:123` |
| `clamp(30px,5.4vw,56px)` | 600 | `1.05` | `-.02em` | Outfit | H1 de la ficha de campaña `CAM:112` |
| `clamp(30px,5vw,54px)` | 600 | `1.06` | `-.02em` | Outfit | H1 de subpágina: `TIE:70`, `CAM:75`, `BLO:74` |
| `clamp(28px,4.6vw,48px)` | 600 | `1.08` | `-.02em` | Outfit | H1 del artículo `BLO:135` |
| `clamp(28px,4.2vw,46px)` | 600 | `1.08` | `-.015em` | Outfit | H2 de sección de la landing: `VLS:145,213,258,321,349,428` |
| `clamp(26px,3.6vw,40px)` | 600 | `1.1` | `-.015em` | Outfit | H2 de campañas en la landing `VLS:187` |
| `clamp(24px,3.4vw,32px)` | 600 | `1` | — | Outfit | cifras del hero `VLS:134` |
| `clamp(23px,3.2vw,34px)` | 600 | `1.15` | — | Outfit | título de la tarjeta destacada `BLO:95` |
| `clamp(21px,2.8vw,26px)` | 600 | `1.2` | — | Outfit | H2 dentro del cuerpo del artículo `BLO:315` (JS) |
| `clamp(19px,2.5vw,23px)` | 500 | `1.45` | — | Outfit | cita destacada del artículo `BLO:319` (JS) |
| `clamp(17px,2.2vw,20px)` | 500 / heredado | `1.65` | — | DM Sans | entradilla: `CAM:119` (weight 500), `BLO:136` (sin weight) |
| `clamp(16px,2.2vw,19.5px)` | heredado | `1.65` | — | DM Sans | párrafo del hero `VLS:124` |
| `clamp(16px,2.1vw,19px)` | 500 | — | — | Outfit | `summary` del FAQ `VLS:433` |

### 4.4 Tamaños fijos (26 valores, 9 de ellos con medio píxel)

| `font-size` | Peso / familia | `line-height` | `letter-spacing` | Elemento y cita |
|---|---|---|---|---|
| `10px` | 700 DM Sans | — | `.08em` | estado de campaña en la landing `VLS:197` |
| `10.5px` | 600/700 DM Sans, `uppercase` | — | `.16em` / `.1em` / `.12em` / `.14em` | subtítulo del wordmark `VLS:86`, `TIE:52`, `CAM:52`, `BLO:52`; categoría sobre imagen `VLS:153`, `TIE:90,94`; rótulo de contacto `VLS:412`; título del selector `VLS:481`; badge de campaña `CAM:111,326` |
| `11px` | 700 DM Sans, `uppercase` | — | `.14em` / `.12em` | check `VLS:165`; título de columna del pie `VLS:458`; rótulo de precio `CAM:151`; categoría de tarjeta `BLO:114`; categoría del artículo `BLO:134` |
| `11.5px` | 400/700 DM Sans | `1.5` | `.14em` (solo `VLS:401`) | aviso del asistente `VLS:311`; rótulo "Urgencias 24 h" `VLS:401`; nota del selector `VLS:490` |
| `12px` | 700 DM Sans, `uppercase` | — | `.22em` | **eyebrow de sección**: `VLS:144,186,212,257,320,348,427`, `CAM:74`. Sin `uppercase` ni 700: vigencia `VLS:198`, tags `VLS:244`, check `VLS:267`, "en línea" `VLS:278`, labels `VLS:367,370,374,377,386`, notas `TIE:153`, `CAM:89,126,164`, iniciales `BLO:98` |
| `12.5px` | 600/400 | — | `.1em` (`VLS:120`) | píldora del hero `VLS:120`; etiqueta de cifra `VLS:135`; consentimiento `VLS:389`; línea legal del pie `VLS:467`, `TIE:168`, `CAM:198`, `BLO:190`; contador de cesta `TIE:262`; píldora de ahorro `CAM:156`; metadatos `BLO:93,117,172` |
| `13px` | 400/600 | `1.6` (`VLS:413`) | — | rol del profesional `VLS:227`; `dl` de equipo `VLS:235`; pie de galería `VLS:338`; labels del formulario `VLS:367,370,374,377,386`; migas `TIE:69`, `CAM:73`, `BLO:73`; precio tachado `CAM:94`; autor `BLO:141,143` |
| `13.5px` | 600/700 | `1.55` (`CAM:125`) | — | barra de urgencias `VLS:67`; CTA de urgencias del nav `VLS:94`, `CAM:59`, `BLO:59`; enlace "Tienda" `VLS:97`, `CAM:62`, `BLO:62`; check de servicio `VLS:164`; botón "Ver qué incluye" `VLS:172`; precio de campaña `VLS:201`; chips del asistente `VLS:292`; "Pedir otra cita" `VLS:307`; línea 2 de contacto `VLS:414`; nombre de paleta `VLS:489`; descripción de producto `TIE:96`; filtros `TIE:272`, `BLO:359`; botón volver `CAM:110`, `BLO:133` |
| `14px` | 400/500/700 | `1.7` (`VLS:454`) | — | enlaces del nav `VLS:92`, `TIE:57`, `CAM:57`, `BLO:57`; detalle de servicio `VLS:161`; bio `VLS:234`; avatar "LS" `VLS:275`; "Enviar otro mensaje" `VLS:360`; texto del pie `VLS:454,461`; garantías `TIE:112`; contador `TIE:140`; total `TIE:149`; enlaces del pie `TIE:162`, `CAM:192`, `BLO:184`; numeración de pasos `CAM:135`; `dl` de la ficha `CAM:157`; CTA móvil `CAM:300`, `BLO:342`; avatar del autor `BLO:138` |
| `14.5px` | 400/600/700 | `1.55`–`1.7` | — | descripción de servicio `VLS:157`; ventajas `VLS:266`; nombre del asistente `VLS:277`; input del chat `VLS:299`; CTA de WhatsApp `VLS:306`; texto de confirmación `VLS:359`; **todos los campos del formulario** `VLS:368,371,375,378,387`; "Llamar ahora" `VLS:404`; línea 1 de contacto `VLS:413`; burbujas de chat `VLS:759`; cesta `TIE:129,135`; ítems de "incluye" `CAM:125`; texto de paso `CAM:138`; botón de llamada `CAM:163`; entradilla de tarjeta `BLO:116`; nombre del autor `BLO:140`; texto del CTA `BLO:160` |
| `15px` | 600/700 | — | — | CTA "Ver campañas" `VLS:189`; WhatsApp / Llamar `VLS:261,262`; "Enviar mensaje" `VLS:393`; CTA de la cesta `TIE:152`; resumen de campaña `CAM:91`; precio tachado `CAM:154`; CTA del artículo `BLO:162`; título de relacionado `BLO:171` |
| `15.5px` | 600/700 | `1.75` (`VLS:437`) | — | CTAs del hero `VLS:126,127`; respuesta del FAQ `VLS:437`; título de paso `CAM:137`; CTA "Reservar esta campaña" `CAM:162` |
| `16px` | 500 | `1.7` | — | enlaces del menú móvil `VLS:110,112`; precio en negrita `VLS:201`; nombre en galería `VLS:337`; botón ✕ de la cesta `TIE:124`; cuerpo de la ficha `CAM:120,145`; título de otra campaña `CAM:178`; entradilla del destacado `BLO:96` |
| `16.5px` | heredado | `1.7` | — | párrafo de campañas `VLS:188`; párrafo de galería `VLS:322` |
| `17px` | heredado / 600 Outfit | `1.7` / `1.8` | `-.01em` (wordmark) | **párrafo de sección** `VLS:146,214,259,350`; wordmark `VLS:85,452`, `TIE:51,161`, `CAM:51,191`, `BLO:51,183`; H3 de campaña `VLS:200`; botones de galería `VLS:325,326`; título de garantía `TIE:111`; **párrafo del artículo** `BLO:323` (JS, `line-height:1.8`) |
| `17.5px` | heredado | `1.7` | — | subtítulo de subpágina `TIE:71`, `CAM:76`, `BLO:75` |
| `18px` | 600 Outfit / — | `1.2` | — | flecha de envío del chat `VLS:300`; nombre de producto `TIE:95` |
| `19px` | 600 Outfit | `1` | — | icono `+` del FAQ `VLS:435`; icono `+` de servicio `VLS:727` (JS); título "Tu cesta" `TIE:123`; título del CTA `BLO:159` |
| `19.5px` | 600 Outfit | `1.2` | — | título de tarjeta de artículo `BLO:115` |
| `20px` | 600 Outfit | `1.2` | — | nombre del profesional `VLS:226`; "Escríbenos" `VLS:365` |
| `21px` | 600 Outfit | `1.15` | — | título de servicio `VLS:156`; "Mensaje recibido" `VLS:358` |
| `22px` | 600 Outfit | `1` | — | icono `+` de equipo `VLS:747` (JS); precio de producto `TIE:98`; "Sigue leyendo" `BLO:165` |
| `24px` | 600 Outfit | `1.15` | — | título de tarjeta de campaña `CAM:90`; H2 de la ficha `CAM:122,131,144,172` |
| `26px` | 600 Outfit | — | — | check de confirmación `VLS:357`; teléfono de urgencias `VLS:402`; total de la cesta `TIE:150` |
| `30px` | 600 Outfit | `1` | — | precio en la tarjeta de campaña `CAM:93` |
| `46px` | 600 Outfit | `1` | — | precio grande de la ficha `CAM:153` |

**Total: 39 tamaños distintos** (26 fijos + 13 `clamp`).

### 4.5 `line-height` — 17 valores distintos

`1` (`VLS:134,435,727,747`; `CAM:93,153`) · `1.05` (wordmark `VLS:84`; H1 hero `VLS:123`;
H1 ficha `CAM:112`) · `1.06` (H1 subpágina `TIE:70`, `CAM:75`, `BLO:74`) · `1.08` (H2 landing
`VLS:145,213,258,321,349,428`; H1 artículo `BLO:135`) · `1.1` (`VLS:187`) · `1.15`
(`VLS:156`, `CAM:90`, `BLO:95`) · `1.2` (`VLS:226`, `TIE:95`, `CAM:178`, `BLO:115,316`) ·
`1.25` (`BLO:171`) · `1.3` (`TIE:135`) · `1.45` (cita `BLO:320`) · `1.5` (`VLS:311,389`) ·
`1.55` (burbujas `VLS:759`; ítems `CAM:125`) · `1.6` (`VLS:359,413,414`; `TIE:96,153`;
`CAM:164`) · `1.65` (`VLS:124,157`; `TIE:112`; `CAM:91,119,138`; `BLO:116,136`) · `1.7`
(cuerpo estándar: `VLS:146,161,188,214,234,259,322,350,454`; `TIE:71,129`; `CAM:76,146`;
`BLO:75,96`) · `1.75` (`VLS:437`) · `1.8` (`CAM:120,145`; `BLO:323`).

### 4.6 `letter-spacing` — 11 valores distintos

`-.02em` (H1: `VLS:123`, `TIE:70`, `CAM:75,112`, `BLO:74,135`) · `-.015em` (H2 de sección:
`VLS:145,187,213,258,321,349,428`) · `-.01em` (wordmark: `VLS:85`, `TIE:51`, `CAM:51`,
`BLO:51`) · `.02em` (`VLS:135`) · `.04em` (`VLS:275`) · `.08em` (`VLS:197`) · `.1em`
(`VLS:120,153`; `CAM:326`; `BLO:92`) · `.12em` (`TIE:94`; `CAM:111`; `BLO:114`) · `.14em`
(`VLS:401,412,458,481`; `CAM:151`; `BLO:134`) · `.16em` (subtítulo del wordmark: `VLS:86`,
`TIE:52`, `CAM:52`, `BLO:52`) · `.22em` (**eyebrow**: `VLS:144,186,212,257,320,348,427`;
`CAM:74`).

---

## 5. Escala de ESPACIADO

### 5.1 `padding` de sección — clamps verticales

| Clamp vertical | Sección y cita |
|---|---|
| `clamp(84px,13vw,140px)` / `clamp(60px,9vw,92px)` | hero (top/bottom) `VLS:119` |
| `clamp(64px,9vw,104px)` | Servicios `VLS:142`, Equipo `VLS:209`, Reservar `VLS:254`, Galería `VLS:317`, Contacto `VLS:345`, FAQ `VLS:424` |
| `clamp(56px,8vw,90px)` | Campañas de la landing `VLS:183`; cierre del grid de producto `TIE:83` |
| `clamp(64px,9vw,100px)` | cierre de garantías `TIE:107`; listado y ficha de campañas `CAM:80,116,170`; grid de artículos `BLO:106` |
| `clamp(48px,7vw,72px)` … `28px` | pie de la landing `VLS:444` |
| `clamp(40px,6vw,60px)` … `26px` | pie de las 3 subpáginas `TIE:159`, `CAM:189`, `BLO:181` |
| `clamp(48px,7vw,84px)` / `clamp(32px,4vw,48px)` | cabecera del listado de campañas `CAM:71` |
| `clamp(44px,6vw,76px)` / `clamp(24px,3vw,36px)` | cabecera de Tienda `TIE:67` |
| `clamp(44px,6vw,76px)` / `clamp(28px,4vw,40px)` | cabecera del Blog `BLO:71` |
| `clamp(36px,5vw,56px)` | inicio del grid de campañas `CAM:80` |
| `clamp(40px,6vw,64px)` | hero de la ficha de campaña `CAM:109` |
| `clamp(40px,6vw,72px)` | cuerpo de la ficha `CAM:116` |
| `clamp(20px,3vw,30px)` | filtros de Tienda `TIE:75` |
| `clamp(28px,4vw,44px)` | destacado del blog `BLO:84`; cabecera del artículo `BLO:131` |
| `clamp(30px,4vw,48px)` / `clamp(48px,7vw,80px)` | cuerpo del artículo `BLO:152` |
| `clamp(24px,4vw,44px)` | relleno interno de la tarjeta destacada `BLO:90` |
| `clamp(22px,3vw,32px)` | tarjeta del formulario de contacto `VLS:354` |

### 5.2 Gutter lateral — 4 valores, no uno

| Gutter | Dónde |
|---|---|
| `clamp(18px,5vw,28px)` | **estándar** de todas las secciones: `VLS:142,183,209,254,318,330,345,424,444`; `TIE:67,75,83,107,159`; `CAM:71,80,109,116,170,189`; `BLO:71,84,106,131,148,152,181` |
| `clamp(16px,4vw,28px)` | cabecera sticky `VLS:78`, `TIE:44`, `CAM:44`, `BLO:44`; menú móvil `VLS:108` |
| `clamp(18px,6vw,32px)` | hero `VLS:119` |
| `clamp(14px,3vw,26px)` | `right` / `bottom` del selector flotante `VLS:478` |

### 5.3 `gap` fluidos

`clamp(24px,4vw,44px)` `VLS:184` · `clamp(28px,4vw,52px)` `VLS:255` ·
`clamp(24px,3vw,34px)` `VLS:353` · `clamp(28px,4vw,48px)` `CAM:117`.

### 5.4 `margin-top` fluidos

`clamp(38px,6vw,58px)` `VLS:131` · `clamp(36px,5vw,54px)` `VLS:148` ·
`clamp(36px,5vw,52px)` `VLS:217` · `clamp(32px,4.5vw,48px)` `VLS:353` ·
`clamp(28px,4vw,42px)` `VLS:330` · `clamp(28px,4vw,40px)` `VLS:430` ·
`clamp(26px,4vw,40px)` `BLO:148`.

### 5.5 `gap` fijos — 19 valores distintos

`2px` (nav: `VLS:695`, `TIE:249`, `CAM:297`, `BLO:339`) · `4px` (`VLS:108,485`) ·
`5px` (hamburguesa `VLS:697`) · `6px` (`VLS:278`) · `7px` (`VLS:94,242,367,370,374,377,386`;
`TIE:138`; `CAM:59`; `BLO:59`) · `8px` (`VLS:68,162,196,290,298`; `CAM:110`; `BLO:133`) ·
`9px` (`VLS:120,127,305,401,459`; `TIE:60,76`; `BLO:76`) · `10px` (`VLS:189,266,282,288,324,478`;
`CAM:92`; `BLO:91,97,117`) · `11px` (`VLS:79,264,817`; `TIE:45`; `CAM:45,125`; `BLO:45`) ·
`12px` (`VLS:125,172,224,260,274,364`; `TIE:97,122`; `CAM:123,152`; `BLO:137`) ·
`13px` (`TIE:132`; `BLO:168`) · `14px` (`VLS:191,223,366,398,399`; `TIE:44,127`;
`CAM:132,134,175`; `BLO:166`) · `16px` (`VLS:78,364,398,469`; `CAM:44,173`; `BLO:44,157`) ·
`18px` (`VLS:318,330,409`; `TIE:108,162`; `CAM:192`; `BLO:184`) · `20px` (`VLS:433`) ·
`22px` (`VLS:148`) · `24px` (`CAM:81`; `BLO:107`) · `26px` (`VLS:217`) · `32px` (`VLS:445`).

Compuestos: `6px 14px` `VLS:67` · `18px 26px` `VLS:131` · `6px 12px` `VLS:235` ·
`10px 22px` `VLS:467` · `20px 32px` `TIE:160`, `CAM:190`, `BLO:182` · `10px 14px` `CAM:157`.

### 5.6 `padding` de control (fijos, más frecuentes)

`9px 11px` enlaces del nav (`VLS:92`, `TIE:57`, `CAM:57`, `BLO:57`) · `9px 15px` CTA de
urgencias (`VLS:94`, `CAM:59`, `BLO:59`) · `8px 15px` enlace "Tienda" (`VLS:97`, `CAM:62`,
`BLO:62`) · `13px 12px` menú móvil (`VLS:110,112`) · `15px 30px` y `15px 26px` CTAs del hero
(`VLS:126,127`) · `14px 26px` CTA de sección (`VLS:189,261`, `BLO:162`) · `13px 25px` CTA
secundario (`VLS:262`) · `12px 14px` campos del formulario (`VLS:368,371,375,378,387`) ·
`12px 15px` input del chat (`VLS:299`) · `10px 16px` chips (`VLS:292`) · `10px 18px` filtros
(`TIE:271`, `BLO:358`) y botón volver (`CAM:110`, `BLO:133`) · `11px 18px` botón cesta y botón
"Añadir" (`TIE:60,286`) · `11px 20px` CTA móvil (`CAM:299`, `BLO:341`) · `11px 15px` burbujas de
chat (`VLS:759`) · `6px 12px` / `6px 13px` / `5px 12px` / `4px 10px` badges
(`VLS:153,197`, `TIE:90`, `CAM:111,156,323`, `BLO:92`) · `22px 22px 20px` tarjeta de servicio
(`VLS:155`) · `20px 20px 22px` tarjeta de equipo (`VLS:223`) · `18px 20px 20px` tarjeta de
producto (`TIE:93`) · `20px 22px 22px` tarjeta de artículo (`BLO:113`) · `24px` tarjeta de
campaña (`CAM:88`) y caja CTA (`BLO:157`) · `26px` caja de precio (`CAM:150`).

---

## 6. Anchos máximos de contenedor

| `max-width` | Sección y cita |
|---|---|
| `1220px` | **contenedor maestro**, idéntico en las 4 páginas: `VLS:78,143,184,210,255,318,346,445,467`; `TIE:44,68,76,84,108,160`; `CAM:44,72,81,109,117,171,190`; `BLO:44,72,85,107,182` |
| `900px` | contenido del hero `VLS:119` |
| `860px` | contenedor del FAQ `VLS:425` (**única sección de la landing que no usa 1220px**) |
| `720px` | fila de cifras del hero `VLS:131` |
| `640px` | cabecera centrada de Equipo `VLS:211`; intro de Contacto `VLS:347` |
| `1080px` | imagen grande del artículo `BLO:148` |
| `760px` | columna de lectura del artículo `BLO:132,152` |
| `min(420px,100%)` | cajón lateral de la cesta `TIE:121` |
| `min(268px,calc(100vw - 32px))` | panel del selector de paleta `VLS:480` |

Medidas de línea en `ch` (limitan el texto, no el contenedor): `16ch` H1 hero `VLS:123` ·
`58ch` párrafo hero `VLS:124` · `20ch` H2 `VLS:145` y H1 blog `BLO:74` · `62ch` `VLS:146`,
`BLO:75` · `52ch` `VLS:188,259` · `56ch` `VLS:322` · `70ch` respuesta FAQ `VLS:437` ·
`34ch` texto del pie `VLS:454` · `19ch` H1 tienda `TIE:70` · `60ch` `TIE:71`, `CAM:76` ·
`18ch` `CAM:75,112`.

---

## 7. Rejillas (`grid-template-columns`)

13 definiciones distintas; 10 umbrales `minmax` diferentes.

| Definición | Uso y cita |
|---|---|
| `repeat(auto-fit,minmax(130px,1fr))` | cifras del hero `VLS:131` — **único `minmax` sin `min(…,100%)`** |
| `repeat(auto-fit,minmax(min(310px,100%),1fr))` | tarjetas de servicio `VLS:148` |
| `repeat(auto-fit,minmax(min(300px,100%),1fr))` | bloque de campañas `VLS:184`; tarjetas de equipo `VLS:217`; tarjetas de campaña `CAM:81`; tarjetas de artículo `BLO:107` |
| `repeat(auto-fit,minmax(min(320px,100%),1fr))` | Reservar `VLS:255`; Contacto `VLS:353` |
| `repeat(auto-fit,minmax(min(260px,100%),1fr))` | productos `TIE:84`; lista "qué incluye" `CAM:123` |
| `repeat(auto-fit,minmax(min(240px,100%),1fr))` | garantías `TIE:108`; otras campañas `CAM:173` |
| `repeat(auto-fit,minmax(min(230px,100%),1fr))` | relacionados `BLO:166` |
| `repeat(auto-fit,minmax(min(210px,100%),1fr))` | mini-tarjetas de campaña `VLS:191` |
| `repeat(auto-fit,minmax(min(200px,100%),1fr))` | datos de contacto `VLS:409` |
| `repeat(auto-fit,minmax(min(180px,100%),1fr))` | fila nombre/teléfono del formulario `VLS:366` |
| `auto 1fr` | `dl` de equipo `VLS:235`; `dl` de la ficha `CAM:157` |
| `1.6fr 1fr` \| `1fr` | ficha de campaña, decidido en JS: `CAM:117` ← `CAM:313` (umbral `ancho >= 940`) |
| `1.1fr 1fr` \| `1fr` | tarjeta destacada del blog `BLO:366` (umbral `ancho >= 900`) |

Todo el resto del layout es flexbox con `flex-wrap:wrap`.

---

## 8. Alturas mínimas de control (`min-height`)

| Valor | Controles y cita |
|---|---|
| `40px` | botón de texto "Pedir otra cita" `VLS:307` |
| `44px` | chips del asistente `VLS:292`; "Enviar otro mensaje" `VLS:360`; botón cesta `TIE:60`; filtros `TIE:271`, `BLO:358`; botón "Añadir" `TIE:286`; botón volver `CAM:110`, `BLO:133`; CTA móvil `CAM:299`, `BLO:341` |
| `46px` | enlaces del menú móvil `VLS:110,112`; botón hamburguesa `VLS:696` (46×46); input del chat `VLS:299`; botón de envío `VLS:300` (46×46); **todos los campos del formulario** `VLS:368,371,375,378`; "Llamar ahora" `VLS:404` |
| `48px` | CTA de urgencias del menú móvil `VLS:113`; botón "Ver qué incluye" `VLS:172`; "Ver campañas activas" `VLS:189`; WhatsApp / Llamar `VLS:261,262`; CTA de WhatsApp `VLS:306`; `summary` del FAQ `VLS:433`; fila del selector `VLS:818`; botón de ficha `CAM:96`; botón de llamada `CAM:163`; CTA del artículo `BLO:162` |
| `50px` | CTAs del hero `VLS:126,127`; "Enviar mensaje" `VLS:393`; CTA de la cesta `TIE:152` |
| `52px` | "Reservar esta campaña" `CAM:162`; botón flotante del selector `VLS:497` (52×52) |
| `110px` | `textarea` `VLS:387` |
| `470px` | panel del asistente `VLS:273` |
| `clamp(540px,84vh,780px)` | hero de la landing `VLS:118` |
| `clamp(320px,42vh,440px)` | hero de la ficha de campaña `CAM:108` |
| `100vh` | envoltorio de página `VLS:64`, `TIE:41`, `CAM:41`, `BLO:41` |

Botones circulares definidos por `width`/`height` (sin `min-height`): `48×48` flechas de galería
`VLS:325,326` · `44×44` botón `+` de equipo `VLS:745` · `40×40` cerrar cesta `TIE:124` ·
`34×34` `−`/`+` de cesta `TIE:139,141` · `30×30` icono `+` de servicio `VLS:726` y del FAQ
`VLS:435` · `32×32` numeración de pasos `CAM:135`.

`max-height`: `70vh` menú móvil `VLS:108` · `330px` scroll del chat `VLS:282` ·
`620px` \| `0px` panel de acordeón `VLS:650` (JS).

---

## 9. Anchos de borde

| Ancho | Dónde |
|---|---|
| `1px` | prácticamente todo: separadores de cabecera y pie (`VLS:77,108,444,467`; `TIE:43,147,159`; `CAM:43,157,189`; `BLO:43,117,137,181`); bordes de tarjeta (`VLS:150,193,219,273,332,354,407,480,497`; `TIE:86,124,139,141`; `CAM:83,125,150,175`; `BLO:109,133,168,367`); campos del formulario (`VLS:368,371,375,378,387`); separadores internos (`VLS:160,172,233,274,288,430,432`; `TIE:97,121,122`; `CAM:92`); píldora del hero (`VLS:120`); botón volver (`CAM:110`); burbujas de chat (`VLS:763`); swatches (`VLS:813`); filtros y botones de estado (`TIE:275,288`; `BLO:362`); hamburguesa (`VLS:698`); `+` de equipo (`VLS:745`) |
| `1.5px` | enlace "Tienda" del nav `VLS:97`, `CAM:62`, `BLO:62`; CTA secundario del hero `VLS:127`; "Llamar a la clínica" `VLS:262`; flechas de galería `VLS:325,326`; botón de cesta `TIE:60`; botón de llamada de la ficha `CAM:163`; fila del selector de paleta `VLS:820` (1.5px tanto activa como inactiva) |
| `3px` | `border-left` de la cita del artículo `BLO:321` (`3px solid var(--accent)`) |
| `0` / `none` | `iframe` del mapa `VLS:408` (`border:0`); botones sin borde `VLS:172,300,307,360,393`, `TIE:120`, `CAM:96` |

Los separadores sobre fondo oscuro usan blanco con alfa en lugar de `--border`:
`1px solid rgba(255,255,255,.24)` `VLS:131`, `1px solid rgba(255,255,255,.28)` `VLS:120`,
`1.5px solid rgba(255,255,255,.55)` `VLS:127`, `1px solid rgba(255,255,255,.45)` `CAM:110`.

---

## 10. Puntos de corte

### 10.1 No hay ningún `@media` de maquetación

El único `@media` de la maqueta en los 4 ficheros es `@media(prefers-reduced-motion:reduce)`
(`VLS:60`, `TIE:37`, `CAM:37`, `BLO:37`). **Cero** `@media (min-width)` / `(max-width)`. Todo el
comportamiento adaptativo se resuelve con `clamp()`, `minmax(min(Npx,100%),1fr)`, `flex-wrap` y
JavaScript.

### 10.2 El nav móvil sí se decide por JS — y con umbrales distintos por página

| Fichero | Umbral | Línea | Qué conmuta |
|---|---|---|---|
| `VLS` | `ancho < 1120` | `VLS:684` | `estiloNav.display` `none`\|`flex` (`VLS:695`) y `estiloBotonMenu.display` `flex`\|`none` (`VLS:696`) |
| `TIE` | `ancho < 1080` | `TIE:238` | `estiloNav.display` (`TIE:249`) — **sin botón hamburguesa ni menú móvil de reemplazo** |
| `CAM` | `ancho < 1080` | `CAM:292` | `estiloNav.display` (`CAM:297`) y `estiloCtaMovil.display` `inline-flex`\|`none` (`CAM:298`) |
| `BLO` | `ancho < 1080` | `BLO:328` | `estiloNav.display` (`BLO:339`) y `estiloCtaMovil.display` (`BLO:340`) |

Umbrales adicionales, distintos de los anteriores:

| Umbral | Línea | Qué decide |
|---|---|---|
| `ancho >= 940` | `CAM:293` | `columnasFicha`: `'1.6fr 1fr'` vs `'1fr'` (`CAM:313`) y `estiloAside`: `position:sticky; top:104px` vs `{}` (`CAM:314`) |
| `ancho >= 900` | `BLO:329` | `gridTemplateColumns` de la tarjeta destacada: `'1.1fr 1fr'` vs `'1fr'` (`BLO:366`) |

Mecánica: `medir()` guarda `window.innerWidth` en el estado (`VLS:637`, `TIE:225`, `CAM:283`,
`BLO:309`), enganchado a `resize` en `componentDidMount` (`VLS:629-630`, `TIE:219-220`,
`CAM:277-278`, `BLO:303-304`) y desenganchado en `componentWillUnmount` (`VLS:634`, `TIE:223`,
`CAM:281`, `BLO:307`).

**El estado inicial es `ancho: 1280` en las 4 páginas** (`VLS:621`, `TIE:212`, `CAM:270`,
`BLO:296`): el primer render es siempre el de escritorio hasta que `componentDidMount` mide.

### 10.3 `support.js`

`support.js` es el runtime de Claude Design, no la maqueta. Su única regla de medio es
`@media print` (`SUP:119-130`), que desactiva `backdrop-filter`, animaciones y transiciones al
imprimir, con `@page { margin: 0.5cm }` (`SUP:120`). **No contiene ningún breakpoint de la
maqueta ni ninguna llamada a `matchMedia`**: el grep de `@media|innerWidth|matchMedia|min-width|max-width`
sobre `SUP` solo devuelve `SUP:114` (un `max-width:60ch` de su overlay de error) y `SUP:119`.

### 10.4 Otros valores dependientes del viewport

`scroll-padding-top:88px` (`VLS:51`, `TIE:29`, `CAM:29`, `BLO:29`) ·
`min-height:clamp(540px,84vh,780px)` hero `VLS:118` · `min-height:clamp(320px,42vh,440px)`
`CAM:108` · `max-height:70vh` menú móvil `VLS:108` · `flex:0 0 clamp(240px,32vw,360px)` tarjeta
de galería `VLS:332` · `width:min(268px,calc(100vw - 32px))` `VLS:480` · `width:min(420px,100%)`
`TIE:121` · `top:104px` del aside sticky `CAM:314` · `top:0` de la cabecera sticky con
`z-index:60` (`VLS:77`, `TIE:43`, `CAM:43`, `BLO:43`); otros `z-index`: `2` hero `VLS:119`,
`80` cajón de cesta `TIE:119`, `90` selector flotante `VLS:478`.

---

## 11. Transiciones y animaciones

### 11.1 Duraciones y easings

**Una sola duración y un solo easing en todo el sistema: `.3s ease`.** No hay ninguna otra.

| Transición | Dónde |
|---|---|
| `color .3s ease` | regla global `a{}` `VLS:55`, `TIE:33`, `CAM:33`, `BLO:33` |
| `background .3s ease,color .3s ease` | enlaces del nav `VLS:92` |
| `background .3s ease` | nav de subpáginas `TIE:57`, `CAM:57`, `BLO:57`; CTA del hero `VLS:127` |
| `filter .3s ease` | CTA de urgencias `VLS:94`; WhatsApp `VLS:261`; "Enviar mensaje" `VLS:393`; botón de ficha `CAM:96` |
| `border-color .3s ease` | `VLS:97,262,325,326`; `TIE:60`; `CAM:175`; `BLO:168` |
| `transform .3s ease,filter .3s ease` | CTA "Reservar cita" `VLS:126` |
| `filter .3s ease,transform .3s ease` | "Ver campañas activas" `VLS:189` |
| `transform .3s ease,box-shadow .3s ease` | tarjetas elevables `VLS:150`, `TIE:86`, `CAM:83`, `BLO:109` |
| `transform .3s ease` | mini-tarjeta `VLS:193`; zoom de imagen `VLS:334`; icono `+` de servicio `VLS:728` |
| `box-shadow .3s ease` | tarjeta de equipo `VLS:219` |
| `border-color .3s ease,background .3s ease` | chips del asistente `VLS:292` |
| `max-height .3s ease, opacity .3s ease` | acordeón `VLS:651` (JS) |
| `transform .3s ease, background .3s ease, color .3s ease` | icono `+` de equipo `VLS:748` |
| `background .3s ease, color .3s ease, border-color .3s ease` | filtros `TIE:276`, `BLO:363` |
| `background .3s ease, color .3s ease` | botón "Añadir" `TIE:291` |
| `background .3s ease, border-color .3s ease` | fila del selector `VLS:821` |

### 11.2 Transformaciones usadas en hover / estado

`translateY(-2px)` CTAs `VLS:126,189` · `translateY(-3px)` mini-tarjeta `VLS:193` ·
`translateY(-4px)` tarjetas `VLS:150`, `TIE:86`, `CAM:83`, `BLO:109` · `scale(1.05)` imagen de
galería `VLS:334` · `rotate(45deg)` \| `rotate(0deg)` iconos `+` `VLS:728,748` ·
`filter:brightness(1.1)` (`VLS:126,189,261,306,393`; `TIE:152`; `CAM:96,162`; `BLO:162`),
`brightness(1.08)` (`VLS:94`, `CAM:59`, `BLO:59`), `brightness(.95)` (`VLS:404`).

### 11.3 Keyframes

Un único keyframe, declarado idéntico en los 4 ficheros
(`VLS:59`, `TIE:36`, `CAM:36`, `BLO:36`):

```
@keyframes vlsPulso{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.78)}}
```

Invocado siempre como `vlsPulso 1.6s ease-in-out infinite`: barra de urgencias `VLS:69`,
CTA del nav `VLS:95`, CTA del hero `VLS:128`, caja de urgencias `VLS:401`, nav de subpáginas
`CAM:60`, `BLO:60`. **`TIE` declara el keyframe pero no lo usa** (0 apariciones de `animation:`
en `TIE`).

### 11.4 Movimiento reducido

`@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{animation-duration:.01ms !important;transition-duration:.01ms !important}}`
— `VLS:60`, `TIE:37`, `CAM:37`, `BLO:37`. No neutraliza `transform`: el `translateY(-4px)` del
hover sigue ocurriendo, solo que instantáneo.

Otros efectos de movimiento no cubiertos por esa regla: `scroll-behavior:smooth` en `html`
(`VLS:51` y equivalentes) y los `window.scrollTo({behavior:'smooth'})` de JS
(`CAM:287,318`; `BLO:311,374`), además de `pista.scrollBy({behavior:'smooth'})` `VLS:679`.

### 11.5 Desenfoques

`backdrop-filter:blur(14px)` + `-webkit-backdrop-filter` en la cabecera sticky (`VLS:77`,
`TIE:43`, `CAM:43`, `BLO:43`, siempre junto a
`background:color-mix(in srgb, var(--bg) 88%, transparent)`) y `blur(6px)` en píldoras y botones
sobre imagen (`VLS:120,127`; `CAM:110`).

---

## 12. Hallazgos

Cada hallazgo es verificable en la cita indicada.

1. **H01 — Los 3 ficheros secundarios solo declaran 16 de los 18 roles.** Faltan
   `--primary-strong` y `--urg-soft` en `TIE:17-27`, `CAM:17-27`, `BLO:17-27` frente a
   `VLS:18-49`. Cualquier componente que se mueva de la landing a una subpágina y use esos
   tokens quedaría sin color definido.
2. **H02 — `--primary-strong` no se consume en ninguna página.** Sus 4 apariciones en `VLS` son
   las 4 declaraciones de tema (`VLS:21,29,37,45`).
3. **H03 — `--urg-soft` no se consume en ninguna página.** Ídem (`VLS:23,31,39,47`).
4. **H04 — `--surface` está declarado y sin usar en `CAM` y `BLO`** (0 ocurrencias de
   `var(--surface)`); en `VLS` solo lo usan la cabecera/pie del asistente y los campos del
   formulario (`VLS:274,288,368,371,375,378,387`).
5. **H05 — `--accent` es casi decorativo**: 2 usos en `VLS` (`VLS:278,498`), 1 en `BLO`
   (`BLO:321`), 0 en `TIE` y `CAM`. El acento visible del sistema es `--accent-ink`.
6. **H06 — Los swatches del selector de paleta no reflejan los tokens reales**: `#D97706`
   (calida, `VLS:603`) frente a `--primary:#B45309` (`VLS:29`); `#A7F3D0` (eco, `VLS:605`)
   frente a `--accent:#0EA97B` (`VLS:46`); `#64748B` (tech, `VLS:604`) no aparece en ninguna de
   las 4 declaraciones de tema.
7. **H07 — El tema `tech` rompe la simetría de la paleta**: único oscuro, único con
   `--on-primary` no blanco (`#04212B`, `VLS:37`), único con `--accent-soft` / `--urg-soft` en
   `rgba` (`VLS:38-39`) y única escala de sombra distinta (`VLS:40`).
8. **H08 — La escala de radios no es una escala**: 13 valores simples
   (`2,3,11,12,14,16,18,20,22,24,30 px`, `50%`, `999px`) más 2 compuestos (`VLS:764`), sin
   progresión.
9. **H09 — El radio de tarjeta es inconsistente entre páginas**: `20px` (`VLS:150`, `TIE:86`,
   `BLO:109`), `22px` (`CAM:83`) y `24px` (`BLO:367`) para el mismo rol.
10. **H10 — Píldora fuera de sistema**: los tags de especialidad usan `border-radius:30px`
    (`VLS:244`) mientras todas las demás píldoras usan `999px`.
11. **H11 — Hay sombra fuera de token**: `box-shadow:0 12px 30px rgba(0,0,0,.28)` en el CTA del
    hero (`VLS:126`), más 3 `text-shadow` literales (`VLS:123,124`; `CAM:112`) que no existen
    como token.
12. **H12 — 39 tamaños de letra distintos**, con 9 medios píxeles (`10.5, 11.5, 12.5, 13.5,
    14.5, 15.5, 16.5, 17.5, 19.5`). No hay escala modular reconocible.
13. **H13 — El H1 usa 4 curvas de escalado distintas**: `clamp(33px,6.4vw,68px)` `VLS:123`,
    `clamp(30px,5.4vw,56px)` `CAM:112`, `clamp(30px,5vw,54px)` `TIE:70`/`CAM:75`/`BLO:74`,
    `clamp(28px,4.6vw,48px)` `BLO:135`.
14. **H14 — La jerarquía de H2 no es homogénea**: fluida en la landing
    (`clamp(28px,4.2vw,46px)`, `VLS:145,213,258,321,349,428`) pero fija en las subpáginas
    (`24px` `CAM:122,131,144,172`; `22px` `BLO:165`; `19px` `TIE:123`; `18px` `TIE:95`).
15. **H15 — 17 valores distintos de `line-height`** (apartado 4.5): no hay escala vertical.
16. **H16 — 11 valores distintos de `letter-spacing`** (apartado 4.6).
17. **H17 — `font-weight:600` sobre DM Sans en 34 elementos** (listados en 4.2) cuando el enlace
    de fuentes declara para DM Sans solo `400;500;700` (`VLS:15`, `TIE:15`, `CAM:15`, `BLO:15`).
    El resultado real de render **NO CONSTA EN LA FUENTE**; requiere verificación en navegador.
18. **H18 — El gutter lateral no es único**: 4 valores en paralelo (`clamp(18px,5vw,28px)`
    general, `clamp(16px,4vw,28px)` en la cabecera, `clamp(18px,6vw,32px)` en el hero,
    `clamp(14px,3vw,26px)` en el selector). La cabecera nunca alinea con las secciones en anchos
    intermedios pese a compartir `max-width:1220px`.
19. **H19 — 17 combinaciones distintas de `clamp` vertical de sección** (apartado 5.1) sin escala
    común: `104/100/92/90/84/80/76/72/64/60/56/48/44/40/36/32/30 px` como techos.
20. **H20 — 19 valores fijos distintos de `gap`** (apartado 5.5), del `2px` al `32px`, más 6
    formas compuestas.
21. **H21 — El contenedor maestro sí es estable (`1220px`)**, con 4 excepciones deliberadas:
    `900px` hero (`VLS:119`), `860px` FAQ (`VLS:425`), `1080px` imagen del artículo (`BLO:148`)
    y `760px` columna de lectura (`BLO:132,152`).
22. **H22 — 13 definiciones de rejilla y 10 umbrales `minmax` distintos**
    (`130,180,200,210,230,240,260,300,310,320`), muchos separados por solo 10-20px (`300` vs
    `310` vs `320`; `230` vs `240` vs `260`).
23. **H23 — `minmax(130px,1fr)` en las cifras del hero (`VLS:131`) es la única rejilla sin
    `min(…,100%)`**: es la única que puede desbordar horizontalmente en pantallas muy estrechas,
    en un `body` que ya lleva `overflow-x:hidden` (`VLS:52`) que lo ocultaría.
24. **H24 — Seis alturas mínimas distintas para el mismo rol de botón**: `40/44/46/48/50/52`
    (apartado 8).
25. **H25 — `min-height:40px` en `VLS:307`** ("Pedir otra cita") queda por debajo del mínimo de
    `44px` que el propio sistema respeta en todos los demás controles.
26. **H26 — Bordes de `1px` y `1.5px` mezclados en controles equivalentes**: "Tienda" `1.5px`
    (`VLS:97`) frente a chips `1px` (`VLS:292`); "Llamar a la clínica" `1.5px` (`VLS:262`)
    frente a filtros `1px` (`TIE:275`, `BLO:362`).
27. **H27 — No existe ningún `@media` de maquetación en los 4 ficheros**: el único es
    `prefers-reduced-motion` (`VLS:60`, `TIE:37`, `CAM:37`, `BLO:37`).
28. **H28 — El breakpoint del nav no coincide entre páginas**: `1120` en `VLS:684` frente a
    `1080` en `TIE:238`, `CAM:292`, `BLO:328`. Entre 1080 y 1120px la landing muestra
    hamburguesa y las subpáginas muestran el nav completo.
29. **H29 — Dos umbrales JS más, sin relación con los anteriores**: `940` (`CAM:293`) y `900`
    (`BLO:329`).
30. **H30 — `TIE` oculta el nav por debajo de 1080px sin ofrecer alternativa**: `TIE:249` pone
    `display:none` al `<nav>` y en `TIE` no hay botón hamburguesa ni menú móvil (no existe
    `estiloBotonMenu` ni bloque equivalente a `VLS:100-115`). En móvil solo quedan el logo y el
    botón "Cesta" (`TIE:60`).
31. **H31 — El primer render es siempre de escritorio**: estado inicial `ancho: 1280` en
    `VLS:621`, `TIE:212`, `CAM:270`, `BLO:296`; la medición real llega en `componentDidMount`
    (`VLS:628`, `TIE:218`, `CAM:276`, `BLO:302`).
32. **H32 — `support.js` no aporta ningún breakpoint de maqueta**: su único medio es
    `@media print` (`SUP:119-130`).
33. **H33 — Una sola duración y un solo easing (`.3s ease`) en todo el sistema**: no hay escala
    de movimiento (corta/media/larga) ni curvas diferenciadas de entrada y salida. La única
    excepción es `ease-in-out` en `vlsPulso` (`VLS:69` y equivalentes).
34. **H34 — `max-height:'620px'` fijo en el acordeón** (`VLS:650`): cualquier panel cuyo
    contenido supere 620px se recorta al abrirse, y el contenido es de longitud variable
    (`detalle` + lista `incluye`, `VLS:511-556`; `bio` + `dl`, `VLS:561-577`).
35. **H35 — `scroll-padding-top:88px` (`VLS:51`) no corresponde a la altura real de la
    cabecera**: la cabecera sticky mide `12 + 38 + 12 = 62px` de contenido (`VLS:78` padding,
    `VLS:80` logo de 38px) más `1px` de borde (`VLS:77`) = 63px, y por encima puede ir la barra
    de urgencias (`VLS:67`, `9px` de padding vertical), condicionada por `mostrarBarraUrgencias`
    (`VLS:66,692`). Ni 63 ni 63 + barra dan 88.
36. **H36 — `TIE` declara `@keyframes vlsPulso` (`TIE:36`) y no lo usa**: no hay ninguna
    propiedad `animation:` en `TIE`.
37. **H37 — `prefers-reduced-motion` no neutraliza los `transform` de hover**: la regla
    (`VLS:60`) solo fuerza `animation-duration` y `transition-duration` a `.01ms`, de modo que
    `translateY(-4px)` (`VLS:150`) y `scale(1.05)` (`VLS:334`) siguen aplicándose, solo que de
    forma instantánea.
38. **H38 — No hay ningún estilo de foco en las 4 páginas**: `grep "focus\|outline"` no devuelve
    ninguna regla `:focus` ni `:focus-visible`, y sí devuelve `outline:none` explícito en los 6
    controles de entrada de `VLS` (`VLS:299,368,371,375,378,387`). Ningún sustituto de indicador
    de foco **CONSTA EN LA FUENTE**.
