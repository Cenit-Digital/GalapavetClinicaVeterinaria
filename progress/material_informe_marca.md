# Informe de marca — logo real, Open Graph y favicon

> Material producido para la feature 22 (`identidad_visual`). **Nada de esto se
> ha copiado al repositorio**: todo vive en
> `…/scratchpad/material/marca/`. Del repositorio solo se ha LEÍDO.
>
> Regla del documento: cada dimensión está **medida** sobre el fichero real,
> cada cita de documentación está **leída hoy** en su página oficial, y lo que
> no se ha podido comprobar aparece marcado **NO VERIFICADO**.

---

## 0. Qué hay entregado

`…/scratchpad/material/marca/`

| Fichero | Bytes | Formato medido | sha256 |
|---|---|---|---|
| `logo-galapavet.webp` | 4 744 | WebP 201×201 `yuva420p` | `4880afabcf8713913fd6100c246c5e67b4e0e0c71f222e86cb503578e1ae8833` |
| `og-galapavet.png` | 60 580 | PNG 1200×630 `rgb24` | `484c165d68d58159cea6781be3f45f3af1f5c0bd764bed67d7ea5c92dc7177cc` |
| `og-galapavet.webp` | 35 598 | WebP 1200×630 `argb`, sin pérdida | `16c41dbd3144c1362a45d91834a37858c3a33cd406f32a67690489769b78bae1` |
| `favicon.ico` | 15 086 | ICO 16+32+48, BMP/DIB 32 bpp | `8bffa188a7a412abb8e3fd8a552b850a95b2f248814c7927b738435a95b0427f` |
| `favicon-32.png` | 2 110 | PNG 32×32 `rgba` | `751f703c202d78d77bb0bad01222fac8ba81d867947a8cfd42481436a1daf3ef` |
| `favicon-16.png` | 798 | PNG 16×16 `rgba` | `ec4f943ca25c1fd142cb8f1939f547112f9ff97d9648f0df840ebc4707d2f1fc` |
| `apple-touch-icon.png` | 12 990 | PNG 180×180 `rgb24` (**sin alfa**) | `fc0a4807b3778ea107df7378d1e2a7c7acae2a049a125e59ad893649af5694a3` |

`marca/alternativa-recorte/` — **variante NO por defecto**, ver §7:

| Fichero | Bytes | sha256 |
|---|---|---|
| `favicon.ico` | 15 086 | `ef58a304138d35cd9a86d622d49c3b84e5fa1176cb4f20840f6a7e11f73eee38` |
| `favicon-32.png` | 2 047 | `d40ef2b278d420152444f57b0218e06b3f944441b2bf2266030618f3e4728a9e` |
| `favicon-16.png` | 815 | `e74bcd3e6257a48835482a6adae119df311ea832ceed75611003fb66081a30d6` |
| `apple-touch-icon.png` | 23 449 | `b5cb0d891ba4bacd61fc796d3c4acb2bfbf67e53c56b6ed9e15a33522df39f81` |

`marca/_proceso/` — guiones reproducibles y evidencia visual (§10).

---

## 1. El logo real: verificado

Origen: `logo galapavet.webp`, **en la raíz del repositorio** (el nombre lleva
un espacio; hay que citarlo entre comillas en cualquier comando).

Medido hoy, no supuesto:

| Propiedad | Cómo se comprobó | Valor |
|---|---|---|
| Tamaño | `ls -la` | **4 744 bytes** |
| Contenedor | `xxd -l 64` → `RIFF` `80 12 00 00` `WEBP` | RIFF de 0x1280 = 4 736 + 8 = 4 744 ✔ |
| Chunks | mismo volcado: `VP8X` (10 B) → `ALPH` (0x50d = 1 293 B) → `VP8 ` | WebP extendido con alfa separado |
| Bandera de alfa | byte de flags del `VP8X` = `0x10` | bit `ALPHA` activo ✔ |
| Dimensiones | `VP8X`: ancho-1 = `c8 00 00` = 200, alto-1 = 200; y `ffprobe` | **201 × 201 px** |
| Píxeles | `ffprobe -show_streams` | `codec=webp`, `pix_fmt=yuva420p` (con alfa) |
| Codificación | `VP8 ` (no `VP8L`) | **con pérdida** + canal alfa |

Todo coincide con `progress/plan_imagenes.md` §3.1 y con
`docs/datos-galapavet.md:131-139`. **No hay ninguna discrepancia.**

**Copia byte a byte, sin recomprimir**, con `cp` (nunca `ffmpeg`):

```
sha256 origen : 4880afabcf8713913fd6100c246c5e67b4e0e0c71f222e86cb503578e1ae8833
sha256 copia  : 4880afabcf8713913fd6100c246c5e67b4e0e0c71f222e86cb503578e1ae8833
cmp           : idénticos byte a byte
```

### 1.1 Qué es el logo, mirándolo

Disco **circular blanco inscrito en el cuadrado** (21,3 % de píxeles con
alfa = 0, y `1 − π/4` = 21,46 %: es exactamente un círculo inscrito). Dentro:
una cruz veterinaria lima `#B4C718` sobre una cruz morada `#77286B`, con el
verde profundo `#48704B` naciendo del solape; una silueta de perro en lima, una
silueta de gato en morado y un cuadradito rosa pálido.

**La marca ocupa solo el recuadro (40,51)–(161,161)**, es decir **122 × 111 px
de los 201** (60,7 % × 55,2 %). El resto es el margen blanco del disco. Este
dato es la causa raíz del problema de legibilidad de §7.

---

## 2. La imagen de Open Graph

Compuesta con `ffmpeg`, **sin una sola foto de banco**, tal como exigen la
Decisión 35 y el escenario `@s29` de `features/identidad_visual.feature:687`.

### 2.1 Composición

Lienzo 1200 × 630 en el morado de marca. Pila centrada:

- disco del logo real escalado a **260 × 260** (1,29× sobre los 201 de origen),
  arriba, con 78 px de margen superior;
- «**Galapavet**» en blanco, 88 px, centrado;
- filete lima `#B4C718` de 120 × 6 px;
- «**Centro integral veterinario en Galapagar, Madrid.**» en blanco, 30 px.

Los dos textos **no están inventados**: salen literalmente de
`src/lib/site.ts` — `NOMBRE_COMERCIAL` (línea 72) y
`IDENTIDAD.descriptorConLocalidad` (línea 79), que es el mismo dato que ya
pinta `PieDePagina.tsx:69`.

Tipografía: **Segoe UI** (Bold para el nombre, Regular para el descriptor), del
sistema. Se eligió porque **el proyecto no declara ninguna**: `grep -rn
"font-family"` sobre `src/` con extensiones `.scss/.css/.ts/.tsx` no devuelve
**ni una sola** coincidencia. Cuando la feature fije la familia tipográfica del
sitio, **hay que regenerar el OG con ella** (una línea del guion de §10).

### 2.2 Medido sobre el fichero producido

| Comprobación | Resultado |
|---|---|
| Dimensiones | **1200 × 630** exactas (`ffprobe`), en PNG y en WebP |
| Color de fondo, esquinas (0,0) y (1199,629) | `#77286B` **exacto** |
| Filete lima | `#B4C718` **exacto** |
| Recuadro de contenido no-fondo | (276, 78) – (922, 555) |
| Márgenes libres | izq 276 · der 278 · sup 78 · inf 75 px — **todos ≥ 60 px**, la zona segura de §4.3 del plan |
| PNG vs WebP | diferencia máxima **0 en los tres canales** (el WebP es sin pérdida) |
| Peso | PNG 59 KB, WebP 35 KB — muy por debajo del presupuesto de 120 KB del plan y de los 8 MB de Meta |

**Mirada al resultado** (§10, se abrió la imagen): el disco queda nítido, no
pixelado; el borde del disco es una transición limpia blanco → morado, **sin
halo verde** y **sin escalones** (ver §5, era el riesgo real); el bloque está
centrado y equilibrado. No hay nada que corregir a ojo.

Un detalle honesto: el ancho del contenido es 646 px, y un recorte cuadrado
central de 630 px (el que hacen algunas apps en la miniatura pequeña) comería
unos 8 px por lado del descriptor. El logo y el nombre sobreviven intactos. Se
consideró aceptable; bajar más el cuerpo del descriptor lo dejaría por debajo
del umbral de lectura en la miniatura, donde de todas formas no se lee.

### 2.3 Formato: **se recomienda PNG**

Leído hoy en la página oficial de Meta
(<https://developers.facebook.com/docs/sharing/webmasters/images/>):

> «Use images that are at least 1200 x 630 pixels for the best display on high
> resolution devices.» · «Try to keep your images as close to 1.91:1 aspect
> ratio as possible to display the full image in Feed without any cropping.» ·
> «The minimum allowed image dimension is 200 x 200 pixels.» · «The size of the
> image file must not exceed 8 MB.»

**Y la página no enumera ningún formato aceptado.** Comprobado hoy leyéndola:
no aparece lista de PNG/JPEG/GIF/WebP por ningún sitio. Que los rastreadores de
Meta, WhatsApp o LinkedIn acepten WebP como `og:image` queda por tanto
**NO VERIFICADO** — y no se puede verificar sin publicar el sitio en un dominio
real y pasarlo por el depurador de cada red.

Conclusión: **se sirve el PNG**. El WebP se entrega solo como reserva (pesa
24 KB menos) y **no debe copiarse a `public/`** mientras el contrato diga lo
contrario. El contrato ya lo dice, y coincide:
`features/identidad_visual.feature:686` → *«el fichero servido es un PNG, no un
WebP, porque la documentación oficial de Meta no declara qué formatos acepta y
el WebP queda NO VERIFICADO en sus rastreadores»*.

---

## 3. El favicon

`index.html:6` declara hoy `<link rel="icon" type="image/svg+xml"
href="/favicon.svg" />` y ese fichero **no existe** → 404.

### 3.1 El vector sigue siendo el camino correcto (camino A)

Se confirma la conclusión del plan §3.3: **no se puede derivar un SVG fiel de un
raster de 201 px**. El logo tiene bordes curvos, solapes con color propio
(`#48704B` nace de lima sobre morado) y un borde antialias de 726 píxeles
semitransparentes; una vectorización automática produce cientos de trazados y un
resultado sucio. **Hay que pedirle el vector al cliente** (`.ai` / `.svg` /
`.pdf` de quien le hizo la marca). Es tarea del humano, no del arnés.

Límite duro confirmado: con 201 px de origen **no se puede** generar un icono de
512×512 para un `manifest.json` de PWA. Eso exige sí o sí el vector.

### 3.2 Lo entregado: juego raster puente (camino B)

| Fichero | Tamaños | Formato | Comprobación |
|---|---|---|---|
| `favicon.ico` | 16+32+48 | ICO multi-imagen, BMP/DIB 32 bpp, sin compresión | cabecera parseada a mano (§6) y decodificado por dos lectores independientes |
| `favicon-32.png` | 32×32 | PNG con alfa | `ffprobe`: `png,32,32,rgba` |
| `favicon-16.png` | 16×16 | PNG con alfa | `ffprobe`: `png,16,16,rgba` — **extra opcional**, ver §8 |
| `apple-touch-icon.png` | 180×180 | PNG **`rgb24`, sin canal alfa**, fondo blanco sólido | `ffprobe`: `png,180,180,rgb24`; las cuatro esquinas miden `(255,255,255)` |

El `apple-touch-icon` va sin alfa y con blanco sólido porque iOS no respeta la
transparencia. MDN, leído hoy
(<https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel>):

> «Apple's iOS does not use this link type, nor the `sizes` attribute, like
> others mobile browsers do, to select a webpage icon for Web Clip or a start-up
> placeholder. Instead it uses the non-standard `apple-touch-icon` […]»

### 3.3 Cabecera propuesta para `index.html`

MDN, misma página, sobre la selección entre varios iconos:

> «If there are multiple `<link rel="icon">`s, the browser uses their `media`,
> `type`, and `sizes` attributes to select the most appropriate icon. If several
> icons are equally appropriate, the last one is used. If the most appropriate
> icon is later found to be inappropriate, for example because it uses an
> unsupported format, the browser proceeds to the next-most appropriate, and so
> on.»

Y sobre `sizes`, en la página del elemento `<link>`
(<https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/link>):

> «`any`, meaning that the icon can be scaled to any size as it is in a vector
> format, like `image/svg+xml`.» · «a white-space separated list of sizes […]
> **Each of these sizes must be contained in the resource.**» · «Microsoft's ICO
> format and Apple's ICNS format can store multiple icon sizes in a single file.
> **ICO has better browser support, so you should use this format if
> cross-browser support is a concern.**»

```html
<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48" />
<link rel="icon" type="image/png" href="/favicon-32.png" sizes="32x32" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<!-- Cuando llegue el vector del cliente (camino A), se descomenta y se borran
     las dos primeras líneas si se quiere:
<link rel="icon" type="image/svg+xml" href="/favicon.svg" sizes="any" /> -->
```

**Corrección al plan:** `plan_imagenes.md:243` propone `sizes="32x32"` para el
`.ico`. Como el fichero entregado contiene **tres** imágenes y MDN exige que
cada tamaño listado esté realmente contenido en el recurso, lo correcto es
`sizes="16x16 32x32 48x48"`. Es la única corrección de fondo a esa sección.

Editar `index.html` **no es tarea del `tdd_craftsman`**: está fuera de `src/` y
de los tests (CLAUDE.md, «Cuándo NO aplica el rol de orquestador»). El escenario
`@s28` exige además que *«mientras no exista el vector del cliente, la etiqueta
que declara el icono vectorial permanece comentada en vez de apuntar a un
fichero inexistente»*: la propuesta de arriba lo cumple.

---

## 4. Mapa exacto: qué fichero acaba en qué ruta

Cruzado con `index.html`, `src/components/MetadatosPagina.tsx`,
`src/components/PieDePagina.tsx` y los escenarios `@s28`/`@s29`.

| Fichero entregado | Ruta EXACTA en el repositorio | URL servida | Quién la exige |
|---|---|---|---|
| `logo-galapavet.webp` | `public/img/logo-galapavet.webp` | `/img/logo-galapavet.webp` | `PieDePagina.tsx:12` (`SRC_LOGO`), pintado en `PieDePagina.tsx:67` con `alt=""` |
| `og-galapavet.png` | `public/img/og/galapavet.png` | `/img/og/galapavet.png` | `MetadatosPagina.tsx:18` **tras cambiar `.webp` → `.png`**, emitido en `MetadatosPagina.tsx:59` |
| `favicon.ico` | `public/favicon.ico` | `/favicon.ico` | `@s28` (`identidad_visual.feature:673`) + `<link>` nuevo en `index.html` |
| `favicon-32.png` | `public/favicon-32.png` | `/favicon-32.png` | `@s28` (`:674`) + `<link>` nuevo |
| `apple-touch-icon.png` | `public/apple-touch-icon.png` | `/apple-touch-icon.png` | `@s28` (`:675`, «mide 180 por 180 píxeles») + `<link>` nuevo |
| `favicon-16.png` | `public/favicon-16.png` **solo si se declara** | `/favicon-16.png` | nadie: extra opcional, ver §8 |
| `og-galapavet.webp` | **NO se copia** | — | reserva; `@s29` prohíbe servir WebP como `og:image` |
| `alternativa-recorte/*` | **NO se copia** salvo decisión humana | — | ver §7 |

Vite sirve `public/` en `/` por defecto y `vite.config.ts` no declara
`publicDir` (verificado: `grep -n publicDir vite.config.ts` no devuelve nada),
así que basta con crear `public/` en la raíz.

### 4.1 Cambios de código que esto exige, y quién los hace

1. **`src/components/MetadatosPagina.tsx:18`**: `'/img/og/galapavet.webp'` →
   `'/img/og/galapavet.png'`. Está dentro de `src/` ⇒ lo hace el
   `tdd_craftsman` guiado por un test rojo, **no a mano**.
   `MetadatosPagina.test.tsx:82-83` seguirá pasando: solo exige que la ruta
   empiece por `/` y no sea absoluta; la extensión le da igual.
2. **`index.html:6`**: sustituir el `<link>` del SVG por el bloque de §3.3. Está
   fuera de `src/` ⇒ lo hace el `craftsman_lead`.
3. **Nada más.** `PieDePagina.tsx` no se toca: la ruta que ya declara es la
   correcta, y su `alt=""` debe seguir vacío —
   `PieDePagina.test.tsx:28` comprueba `queryAllByRole('img')` = 0 dentro del
   pie, y una imagen con `alt=""` no expone rol `img`, así que la prueba pasa
   **con** el logo puesto. Cambiar ese `alt` a un texto rompería la prueba.
4. No hay ninguna otra referencia en el repo: `grep -rn
   "favicon\|apple-touch\|og/galapavet\|logo-galapavet"` sobre `src/`,
   `features/`, `index.html` y `vite.config.ts` devuelve exactamente esas tres
   ubicaciones más los comentarios del propio `.feature`.

---

## 5. Hallazgo 1 — el halo verde del WebP con pérdida (y cómo se ha quitado)

**Esto no está en el plan y es el riesgo técnico real del material de marca.**

El logo es WebP **con pérdida + alfa**. Eso implica dos cosas medidas:

1. Los 8 623 píxeles totalmente transparentes de las esquinas **no son
   neutros**: guardan RGB `(72, 111, 77)` ≈ `#486F4B`, el verde profundo. Al
   reducir de 201 px a 16/32/48 con cualquier filtro (lanczos, bicúbico…) ese
   verde **se mezcla** en el borde del disco y aparece un anillo gris-verdoso.
   Es visible a simple vista en `_proceso/evidencia-halo-premultiply.png`
   (columnas «naive»).
   **Solución aplicada:** escalar en alfa premultiplicado —
   `premultiply=inplace=1,scale=…,unpremultiply=inplace=1`. Comparativa
   incluida: el mismo escalado con y sin premultiplicar, sobre blanco, gris y
   morado.

2. Peor y más sutil: **331 píxeles OPACOS** del anillo exterior del disco (entre
   85 y 100 px del centro) tampoco son blancos, sino que llegan hasta
   `(233, 255, 237)` — una desviación de **22/255**. Es derrame de croma del
   codificador contra el borde duro blanco/transparente. Sobre el fondo blanco
   del `apple-touch-icon` eso dejaba un **anillo verde pálido claramente
   visible**: 462 píxeles del anillo se apartaban más de 4/255 del blanco.
   **Solución aplicada** (`_proceso/limpiar-logo.mjs`): en todo píxel a más de
   88 px del centro, o con alfa < 255, el RGB pasa a blanco puro. El canal alfa
   **no se toca** y **ningún píxel de la marca se altera**: la marca vive en
   (40,51)–(161,161), cuyo punto más lejano está a 86,3 px del centro, por
   debajo del radio de corte. Comprobado por conteo: **0 píxeles opacos de croma
   alta modificados**, diferencia **0** en el canal alfa.
   Resultado tras la limpieza: **0 píxeles** del anillo se apartan más de 2/255
   del blanco (peor caso: 2).

**El fichero del pie (`logo-galapavet.webp`) NO lleva esta limpieza**: es la
copia literal del original, como manda el plan. La limpieza solo alimenta los
derivados (OG, favicons, apple-touch-icon).

Esto es **un argumento más para pedir el vector**: el original del cliente ya
llega con artefactos de compresión en el borde.

---

## 6. Hallazgo 2 — `ffmpeg` sí escribe `.ico`, pero lo escribe mal

El encargo avisaba de que `magick` no está instalado. Se investigó la vía
`ffmpeg` y el resultado tiene matiz:

- `ffmpeg -formats | grep ico` → `DE  ico  Microsoft Windows ICO`. **Sí hay
  muxer.**
- `ffmpeg -i 16.png -i 32.png -i 48.png -map 0:v -map 1:v -map 2:v -f ico
  salida.ico` **funciona** y produce un `ICONDIR` con 3 entradas correctas
  (16/32/48, 32 bpp, BMP/DIB). (La vía `-f image2 -i seq/i%03d.png` **no**
  funciona: falla con `ICO already contains 1 images`.)
- **Pero la máscara AND de cada entrada tiene el tamaño equivocado.** Medido
  restando cabecera DIB (40 B) y datos XOR (`w·h·4`) del tamaño declarado:

  | Entrada | Máscara que escribe ffmpeg | Máscara correcta (filas alineadas a 4 B) |
  |---|---|---|
  | 16×16 | 46 B | **64 B** |
  | 32×32 | 156 B | **128 B** |
  | 48×48 | 330 B | **384 B** |

  Ninguna cuadra. El fichero es estructuralmente incorrecto aunque algunos
  decodificadores lo toleren.

**Decisión: escribir el `.ico` a mano**, con
`_proceso/construir-ico.mjs` (Node, sin dependencias): `ICONDIR` +
`ICONDIRENTRY` + `BITMAPINFOHEADER` de 40 B (`biHeight` = 2× el alto, 32 bpp,
`BI_RGB`) + XOR en BGRA de abajo arriba + máscara AND de 1 bpp con las filas
rellenadas a múltiplo de 4 bytes y el bit a 1 donde el alfa vale 0. Los datos de
píxel se los da `ffmpeg` (`-f rawvideo -pix_fmt bgra`), así que la cadena es
**ffmpeg + node**, sin ImageMagick ni `sharp`.

Verificación del `.ico` entregado, por tres vías independientes:

1. **Parseo a mano** (`_proceso/verifica_ico.mjs`): `reservado=0`, `tipo=1`,
   3 imágenes; tamaños 1 128 / 4 264 / 9 640 B = 40 + XOR + máscara **exactos**;
   todos los desplazamientos caen dentro del fichero.
2. **Decodificador independiente** (Pillow): abre las tres imágenes y cada una
   coincide **píxel a píxel, diferencia 0 en RGBA**, con su PNG de origen.
3. **Navegador real** (Chromium headless, `<img src="…ico">`): decodifica y
   reporta `naturalWidth` **48×48** (elige la entrada mayor), sin errores de
   consola ni peticiones fallidas.

> **Aviso operativo para quien escriba la prueba de `@s28`:** en ese mismo
> Chromium, un fichero **llamado literalmente `favicon.ico`** cargado como
> `<img>` devuelve `naturalWidth === 0` aunque sea byte a byte idéntico a otro
> con distinto nombre que sí decodifica (comprobado: mismo sha256
> `8bffa188…`, `ico_nuevo.ico` → 48×48, `favicon.ico` → 0×0). El navegador
> trata esa ruta por su vía especial de icono de pestaña. **La prueba de `@s28`
> debe comprobar el código de estado de la petición, no `naturalWidth`** — que
> es justamente lo que ya dice el escenario («pidiendo los ficheros directamente
> al servidor, porque un icono en 404 no aparece en el árbol del documento»).

**NO VERIFICADO:** que el icono se pinte correctamente **en la pestaña** de un
navegador de escritorio real, y que el `apple-touch-icon` se vea bien en la
pantalla de inicio de un iPhone. Ninguna de las dos cosas es observable desde
aquí; requieren mirar una pantalla.

---

## 7. Legibilidad a 16 px — el juicio honesto

**Se ha mirado, a tamaño real, sobre pestaña clara y sobre pestaña oscura**
(`_proceso/evidencia-iconos-tamano-real.png`).

### Veredicto: **a 16 px el logo fiel es ILEGIBLE.**

No es una impresión: es aritmética. La marca ocupa 122 × 111 px de los 201 del
disco (§1.1). A 16 px, eso deja la marca en **≈ 9,7 × 8,8 px**, con el resto
gastado en margen blanco. Lo que se ve en la pestaña es **una mancha de dos
colores** —una pizca lima y una pizca morada— sin cruz reconocible, sin siluetas
y sin nada que identifique a Galapavet. Sobre pestaña blanca es aún peor: el
disco blanco desaparece contra el fondo y solo queda la manchita flotando.

- **32 px: aceptable.** Se distinguen las dos cruces y se intuyen las siluetas.
  Es el tamaño en el que el icono todavía dice algo.
- **48 px: bien.** Sin reservas.
- **180 px (`apple-touch-icon`): bien**, aunque con mucho aire blanco alrededor
  de la marca, porque el disco es invisible sobre su propio fondo blanco.

**Esto es un argumento fuerte, y del tamaño que se le quiera dar, para pedirle
el vector al cliente.** Con el `.svg` no se resuelve solo la nitidez: se puede
además hacer una **versión reducida de la marca para tamaños pequeños** (solo la
cruz, sin disco ni margen), que es lo que hace cualquier identidad seria.

### La alternativa que se entrega (y que NO se activa sola)

`marca/alternativa-recorte/` contiene el mismo juego generado desde un **recorte
cuadrado de 130 × 130 px centrado en la marca** (origen 35,41 — el mayor recorte
cuyas cuatro esquinas siguen dentro del disco, comprobado: la más lejana está a
96,3 px del radio 100). Eso agranda la marca **1,55×**: a 16 px pasa de ≈ 9,7 px
a **≈ 15 px**.

Mirándolo: **mejora de verdad**. A 16 px ya se perciben dos formas y la cruz se
insinúa; a 32 px se lee con claridad. Sigue sin ser un icono limpio, pero deja
de ser una mancha.

**No se activa por defecto y no se ha copiado a ningún sitio**, porque recortar
el logotipo del cliente —perdiendo el disco, que es parte de la marca— es una
**decisión editorial sobre su identidad, no una decisión técnica**. Le
corresponde al humano, idealmente en la misma conversación en la que se le pide
el vector. Si se acepta, basta copiar los cuatro ficheros de esa carpeta en
lugar de los de arriba: mismos nombres, mismas rutas, mismas dimensiones.

---

## 8. `favicon-16.png`: extra opcional

El contrato (`@s28`) pide exactamente tres ficheros: `/favicon.ico`,
`/favicon-32.png` y `/apple-touch-icon.png`. `favicon-16.png` se entrega porque
lo pedía el encargo, pero **la recomendación es no copiarlo**: el `.ico` ya
lleva dentro una imagen de 16 px generada a propósito (no un reescalado del
navegador), así que el PNG de 16 sería un fichero servido que nadie declara.
Si aun así se quiere declarar, la línea es:

```html
<link rel="icon" type="image/png" href="/favicon-16.png" sizes="16x16" />
```

---

## 9. Divergencias respecto a `progress/plan_imagenes.md`

Tres, todas menores, todas dichas en voz alta:

1. **`sizes` del `.ico`** (§3.3): el plan propone `sizes="32x32"`; lo correcto es
   `sizes="16x16 32x32 48x48"`, porque MDN exige que cada tamaño listado esté
   contenido en el recurso y el fichero entregado contiene los tres.
2. **El OG lleva texto.** El encargo describía «lienzo de color + overlay del
   logo centrado». El plan §4.3, en cambio, pide explícitamente logo + nombre +
   `descriptorConLocalidad`. Se ha seguido **el plan**: el logo solo, sobre
   1200 × 630 de morado, deja una imagen vacía que no dice quién es. Los dos
   textos salen del dato real, no inventados.
3. **El logo del OG va a 260 px, no a 300.** El plan sugiere «no pasar de ~300».
   260 px (1,29× de ampliación) sale visiblemente más limpio que 300 (1,49×) y
   equilibra mejor la pila; se comprobó mirando ambas.

El resto del plan —tamaño del logo, ruta de destino, copia sin recomprimir,
1200 × 630, PNG en vez de WebP, camino A/B del favicon, `apple-touch-icon` de
180 sin alfa, límite duro del icono de 512 de PWA— **se confirma punto por
punto**.

---

## 10. Reproducibilidad

`marca/_proceso/construir-marca.sh` reconstruye **los siete ficheros
principales** desde `logo galapavet.webp` con solo `ffmpeg` y `node`:

```bash
bash marca/_proceso/construir-marca.sh "<repo>/logo galapavet.webp" <destino>
```

Ejecutado en un directorio desechable, los siete salen con **el sha256 idéntico**
al entregado. Es determinista.

Contenido de `_proceso/`:

| Fichero | Para qué |
|---|---|
| `construir-marca.sh` | la cadena completa, comentada paso a paso |
| `limpiar-logo.mjs` | la limpieza del halo de §5 (RGBA en crudo, sin dependencias) |
| `construir-ico.mjs` | el `.ico` multi-imagen escrito a mano (§6) |
| `verifica_ico.mjs` | parseador de `ICONDIR`/`ICONDIRENTRY`/DIB para auditar cualquier `.ico` |
| `og3.filter`, `nombre.txt`, `descriptor.txt` | el grafo de filtros del OG y sus textos |
| `evidencia-halo-premultiply.png` | 16 y 32 px, con y sin premultiplicar, sobre tres fondos |
| `evidencia-iconos-tamano-real.png` | pestañas simuladas a 16 px reales, 32 px y 180 px; fiel vs recorte |

Herramientas usadas y comprobadas en esta máquina: `ffmpeg` 8.1.1 (con
`libwebp`), `node` v22.15.0, `curl` 8.21.0. **`magick` no está instalado y no ha
hecho falta.** Se ha usado además Python 3.13 con **Pillow 12.3.0** (que sí está
instalado en esta máquina, cosa que el encargo no daba por hecha) **solo para
verificar de forma independiente** —medir píxeles, decodificar el `.ico` con
otro lector, montar las hojas de evidencia—: **ningún fichero entregable pasa
por Pillow**.

---

## 11. Resumen de lo NO VERIFICADO

1. Que los rastreadores de Meta / WhatsApp / LinkedIn acepten **WebP** como
   `og:image`. La documentación oficial de Meta no enumera formatos (leído hoy).
   Por eso se sirve PNG.
2. El **pintado real del icono en la pestaña** de un navegador de escritorio, y
   del `apple-touch-icon` en la pantalla de inicio de un iPhone. Se ha verificado
   la decodificación en Chromium headless, no el pintado en pantalla.
3. La **familia tipográfica final** del sitio. El OG usa Segoe UI porque el
   proyecto no declara ninguna (`grep -rn "font-family" src/` → cero
   coincidencias). Cuando la feature la fije, regenerar el OG.

## 12. Lo que le toca al humano

1. **Pedirle el vector del logotipo a Galapavet** (`.svg` / `.ai` / `.pdf`). Es
   lo que arregla el favicon de verdad, habilita el icono de 512 px de una
   futura PWA y elimina los artefactos de compresión del borde. Con los §5 y §7
   de este informe hay argumentos de sobra para pedirlo.
2. **Decidir sobre `alternativa-recorte/`**: si se acepta recortar la marca para
   los iconos pequeños mientras no llegue el vector. Es una decisión sobre la
   identidad del cliente, no técnica.
3. **Editar `index.html`** con el bloque de §3.3 (fuera de `src/`, le toca al
   `craftsman_lead`).
4. **Llevar a la conversación de spec** la contradicción ya anotada del plan §6.1
   y de `identidad_visual.feature:297-305`: `og:image` es relativo por contrato
   (`MetadatosPagina.test.tsx:82-83`) y absoluto por estándar (<https://ogp.me/>).
   Este informe no la toca.
