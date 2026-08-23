# Plan de imágenes — inventario de huecos y material a producir

> Documento de planificación de la feature 22 (diseño visual completo).
> Nada de lo que hay aquí toca `src/`: es el mapa que el `tdd_craftsman`
> necesita para saber **qué fichero tiene que existir en qué ruta**.
>
> Regla de trazabilidad de este documento: cada ruta, cada dimensión y cada
> afirmación técnica se cita como `fichero:línea` del repositorio, como
> fórmula, o como documentación oficial con URL. Lo que no he podido
> verificar aparece marcado **NO VERIFICADO**.

---

## 0. Resumen ejecutivo

- **26 huecos de imagen** están referenciados HOY por el código y todos dan
  404, porque **la carpeta `public/` no existe**. Vite sirve `public/` en `/`
  por defecto (`publicDir` = `"public"`, y sus ficheros «are served at `/`
  during dev and copied to the root of `outDir` during build, and are always
  served or copied as-is without transform» —
  https://vite.dev/config/shared-options.html). `vite.config.ts` **no**
  declara `publicDir` (verificado: el fichero entero, líneas 1-84, no
  contiene la clave), así que el default aplica: basta crear `public/` en la
  raíz.
- `.gitignore` **no** ignora `public/` (verificado leyendo el fichero
  completo): los binarios se versionan. Presupuesto total objetivo ≈ 4-5 MB.
- **El logo del cliente SÍ existe** y es el único material gráfico real:
  `logo galapavet.webp` en la raíz, **201×201 px**, WebP extendido
  (`VP8X` + `ALPH` + `VP8`, con canal alfa), 4 744 bytes. Coincide con lo que
  ya declara `docs/datos-galapavet.md:132` («201×201 px»).
- **No hay ningún hueco de fotografía de equipo**, y es deliberado:
  `src/components/Equipo.test.tsx:184` exige `queryAllByRole('img')` de
  longitud 0 en la sección. **No se debe "arreglar" metiendo retratos de
  stock**: sería exactamente la mentira que el contrato evita.
- **Tres trampas de contrato** que el implementador debe conocer antes de
  tocar nada: §6.

---

## 1. Inventario exacto de huecos

Barrido sobre `src/data/*.ts`, `src/components/*.tsx`, `src/pages/*.tsx` e
`index.html` (comando: `grep -rn -E "\.(webp|jpg|jpeg|png|svg|avif|ico|gif)"`
sobre esos árboles, excluyendo `*.test.*`).

### 1.1 Tabla maestra

| # | Ruta esperada (URL) | Se declara en | Se pinta en | `alt` actual | Rel. de aspecto | Intrínseco propuesto | ¿srcset? |
|---|---|---|---|---|---|---|---|
| 1 | `/favicon.svg` | `index.html:6` | `<link rel="icon">` | — | 1:1 | ver §3 | no |
| 2 | `/img/og/galapavet.webp` | `src/components/MetadatosPagina.tsx:18` (`IMAGEN_OPEN_GRAPH`) | `<meta property="og:image">`, `MetadatosPagina.tsx:59` | — (no es `<img>`) | 1.91:1 | **1200×630** | no |
| 3 | `/img/logo-galapavet.webp` | `src/components/PieDePagina.tsx:12` (`SRC_LOGO`) | `PieDePagina.tsx:67`, bloque de marca del pie | `""` (decorativo, el nombre lo aporta el texto contiguo — @s1) | 1:1 | **201×201** (copia literal) | no |
| 4 | `/img/campanas/vacunaciones.webp` | `src/data/campanas.ts:67` | `CampanasPortada.tsx:47` **y** `PaginaCampanas.tsx:43` | `""` en ambos | 16:9 | **800×450** | sí |
| 5 | `/img/campanas/chequeo.webp` | `src/data/campanas.ts:74` | ídem | `""` | 16:9 | 800×450 | sí |
| 6 | `/img/campanas/odontologia.webp` | `src/data/campanas.ts:81` | ídem | `""` | 16:9 | 800×450 | sí |
| 7 | `/img/galeria/nala-y-coco.webp` | `src/data/galeria.ts:21` | `Galeria.tsx:69` | `"Nala y Coco"` (= `entrada.nombre`) | 4:3 | **800×600** | sí |
| 8 | `/img/galeria/bruno.webp` | `src/data/galeria.ts:22` | ídem | `"Bruno"` | 4:3 | 800×600 | sí |
| 9 | `/img/galeria/luna.webp` | `src/data/galeria.ts:23` | ídem | `"Luna"` | 4:3 | 800×600 | sí |
| 10 | `/img/galeria/toby.webp` | `src/data/galeria.ts:24` | ídem | `"Toby"` | 4:3 | 800×600 | sí |
| 11 | `/img/galeria/milo.webp` | `src/data/galeria.ts:25` | ídem | `"Milo"` | 4:3 | 800×600 | sí |
| 12 | `/img/galeria/kira.webp` | `src/data/galeria.ts:26` | ídem | `"Kira"` | 4:3 | 800×600 | sí |
| 13 | `/img/blog/demo-1.webp` | `src/data/blog.ts:61` | `PaginaBlog.tsx:215` (cuerpo, `alt` = `textoAlternativoImagen`) **y** `PaginaBlog.tsx:173` (miniatura «Sigue leyendo», `alt=""`) | `"Fotografía de un perro tumbado sobre una manta en una sala de consulta."` | 16:9 | **1600×900** | sí |
| 14 | `/img/blog/demo-2.webp` | `src/data/blog.ts:76` | ídem | `"Fotografía de un gato sentado junto a una ventana."` | 16:9 | 1600×900 | sí |
| 15 | `/img/blog/demo-3.webp` | `src/data/blog.ts:87` | ídem | `"Fotografía de un cachorro jugando con una pelota en un jardín."` | 16:9 | 1600×900 | sí |
| 16 | `/img/blog/demo-4.webp` | `src/data/blog.ts:100` | ídem | `"Fotografía de un tubo de muestra sobre una mesa de laboratorio."` | 16:9 | 1600×900 | sí |
| 17 | `/img/blog/demo-5.webp` | `src/data/blog.ts:113` | ídem | `"Fotografía de un microscopio sobre una mesa de trabajo."` | 16:9 | 1600×900 | sí |
| 18 | `/img/blog/demo-6.webp` | `src/data/blog.ts:124` | ídem | `"Fotografía de una radiografía sobre una pantalla iluminada."` | 16:9 | 1600×900 | sí |
| 19 | `/img/tienda/pienso-perro-adulto.webp` | `src/data/tienda.ts:39` | `PaginaTienda.tsx:95` | `""` | 4:3 | **800×600** | sí |
| 20 | `/img/tienda/pienso-gato-esterilizado.webp` | `src/data/tienda.ts:45` | ídem | `""` | 4:3 | 800×600 | sí |
| 21 | `/img/tienda/arnes-talla-m.webp` | `src/data/tienda.ts:51` | ídem | `""` | 4:3 | 800×600 | sí |
| 22 | `/img/tienda/correa-2m.webp` | `src/data/tienda.ts:57` | ídem | `""` | 4:3 | 800×600 | sí |
| 23 | `/img/tienda/cama-talla-m.webp` | `src/data/tienda.ts:63` | ídem | `""` | 4:3 | 800×600 | sí |
| 24 | `/img/tienda/manta-60x40.webp` | `src/data/tienda.ts:69` | ídem | `""` | 4:3 | 800×600 | sí |
| 25 | `/img/tienda/mordedor-caucho.webp` | `src/data/tienda.ts:75` | ídem | `""` | 4:3 | 800×600 | sí |
| 26 | `/img/tienda/pelota-con-sonido.webp` | `src/data/tienda.ts:81` | ídem | `""` | 4:3 | 800×600 | sí |

**Total: 26 huecos** (1 favicon + 1 Open Graph + 1 logo + 3 campañas +
6 galería + 6 blog + 8 tienda).

Con variantes de `srcset` y derivados de favicon, los ficheros físicos a
producir son ≈ 60 (aritmética en §2.3 y §3.3).

### 1.2 Lo que NO es un hueco de imagen (comprobado, para que nadie lo "arregle")

| Sección | Estado | Prueba que lo congela |
|---|---|---|
| **Equipo** | **Cero fotografías, a propósito.** `src/data/equipo.ts` no declara ningún campo de imagen (interfaz `Profesional`, líneas 8-12: solo `nombre`, `rol`, `formacion?`). | `src/components/Equipo.test.tsx:184` → `expect(screen.queryAllByRole('img')).toHaveLength(0)` (@s11: «Sin retratos verificados ninguna tarjeta muestra una fotografía del profesional»). |
| **Servicios** | Cero imágenes hoy. El prototipo SÍ las pone (`Veterinaria La Sierra.dc.html:152`, tarjetas 16/10 con `width=800 height=500`); **este repo lo prohíbe**. | `src/components/Servicios.test.tsx:402` → `expect(container.querySelectorAll('img')).toHaveLength(0)` (@s19). |
| **Listado del blog** | Las tarjetas del listado **no** llevan imagen (solo la vista de artículo y las miniaturas de «Sigue leyendo»). El prototipo sí las lleva (`Blog.dc.html:110`, 16/10). | `src/pages/PaginaBlog.test.tsx:164` → `expect(main.querySelectorAll('img')).toHaveLength(0)` (@s6). |
| **Hero** | `src/components/Hero.tsx` (59 líneas) no renderiza ninguna imagen. El prototipo usa un fondo fotográfico a sangre (`Veterinaria La Sierra.dc.html:118`). Ver §5: hueco **opcional** propuesto. | Ninguna prueba lo prohíbe (verificado: `Hero.test.tsx` no contiene ninguna aserción sobre `img`). |
| **Cabecera** | `src/components/Cabecera.tsx:78` pone el nombre como texto, sin logo. Ver §5: hueco **opcional** propuesto. | Ninguna prueba lo prohíbe. |
| **Mapa de contacto** | `src/components/InformacionContacto.tsx:60-67` es un `<iframe>` de tercero declarado (única excepción de la Decisión 9), con `aspect-ratio: 16 / 9` ya escrito en `InformacionContacto.module.scss:12`. **No es una imagen.** | — |

---

## 2. Dimensiones y `srcset`

### 2.1 De dónde salen los anchos

Arquitectura tomada del prototipo (la arquitectura visual SÍ se toma; el
contenido NO):

- Contenedor máximo: `max-width:1220px` (`Veterinaria La Sierra.dc.html:150`
  y hermanos; `Blog.dc.html:148` usa 1080 para la imagen grande del artículo
  y 760 para la columna de texto).
- Rejillas: `repeat(auto-fit, minmax(min(300px,100%),1fr))` con `gap` de
  22-26 px para tarjetas grandes; `minmax(min(260px,100%),1fr)` con `gap:22px`
  para la tienda (`Tienda.dc.html:85`); `flex:0 0 clamp(240px,32vw,360px)`
  para las figuras de la galería (`Veterinaria La Sierra.dc.html:332`).
- El punto de corte del proyecto es **1024 px**
  (`src/components/Cabecera-logica.ts:10`, `PUNTO_DE_CORTE_NAVEGACION_PX`), y
  la escala tipográfica fluida va de 320 a 1024 px
  (`src/lib/diseno/escalaTipografica.ts:21` y `:28`).

Ancho CSS máximo por tarjeta = `(1220 − gaps) / columnas`, y el intrínseco es
ese ancho × 2 (DPR 2) redondeado hacia arriba:

| Hueco | Cálculo del ancho CSS máximo | CSS máx | ×2 (DPR2) | Intrínseco fijado |
|---|---|---|---|---|
| Campañas | `(1220 − 2×24) / 3` | 390,7 px | 781 | **800×450** (16:9) |
| Galería | `clamp(240px, 32vw, 360px)` → tope | 360 px | 720 | **800×600** (4:3) |
| Tienda | `(1220 − 3×22) / 4` | 288,5 px | 577 | **800×600** (4:3) |
| Blog (artículo) | `max-width:1080px` (`Blog.dc.html:148`) | 1080 px | 2160 | **1600×900** (16:9) — ver nota |
| Blog (miniatura «Sigue leyendo») | ~300 px | 300 px | 600 | mismo fichero, variante 400w/800w |

**Nota sobre el blog:** servir 2160 px de ancho para cumplir DPR 2 a 1080 CSS
es un despilfarro (≈4× los bytes de 1600w). Se fija **1600w como tope
deliberado**: DPR 2 pleno hasta 800 px CSS y ligera pérdida por encima, que en
una foto editorial no se aprecia. Es una decisión de este plan, no una medición.

### 2.2 `sizes` recomendado por familia

```
Campañas   sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 390px"
Galería    sizes="(max-width: 640px) 78vw, 360px"
Tienda     sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 290px"
Blog art.  sizes="(max-width: 1120px) calc(100vw - 40px), 1080px"
Blog mini. sizes="(max-width: 640px) 40vw, 300px"
```

### 2.3 Variantes a generar

| Familia | Huecos | Anchos del `srcset` | Ficheros |
|---|---|---|---|
| Campañas (16:9) | 3 | 400w, 800w, 1200w | 9 |
| Galería (4:3) | 6 | 400w, 800w | 12 |
| Tienda (4:3) | 8 | 400w, 800w | 16 |
| Blog (16:9) | 6 | 400w, 800w, 1600w | 18 |
| Open Graph | 1 | — (1200×630 fijo) | 1 |
| Logo | 1 | — (201×201) | 1 |
| Favicon | 1 hueco → varios ficheros | ver §3.3 | 3-4 |
| **Total** | **26** | | **≈60** |

Convención de nombre para las variantes (elección de este plan, no impuesta
por nada existente): `<nombre>-<ancho>w.webp`, y el fichero SIN sufijo es el
`src` de respaldo que ya espera el código (p. ej. `bruno.webp` = 800w). Así el
`src` actual de `src/data/*.ts` sigue siendo válido tal cual y `srcset` se
añade encima, sin tocar el dato.

**Presupuesto de bytes** (objetivo elegido por este plan, no una medición):
WebP calidad ~80. ≤45 KB para 400w, ≤90 KB para 800w, ≤160 KB para 1200w,
≤220 KB para 1600w, ≤120 KB para el OG. Total esperado ≈ 3,5-4,5 MB.

---

## 3. El logo y el favicon

### 3.1 Lo que hay, medido

Fichero: `logo galapavet.webp` en la **raíz del repositorio** (ojo: el nombre
lleva un espacio, hay que citarlo entre comillas en cualquier comando).

Medido leyendo las cabeceras del contenedor RIFF/WEBP:

| Propiedad | Valor |
|---|---|
| Tamaño | 4 744 bytes |
| Contenedor | `RIFF` … `WEBP` |
| Chunks | `VP8X` (10 B) + `ALPH` (1 293 B) + `VP8 ` (3 404 B) |
| Dimensiones | **201 × 201 px** (cuadrado) |
| Transparencia | **Sí** (bit `ALPHA` del `VP8X` activo, y chunk `ALPH` presente) |
| Codificación | WebP **con pérdida** + canal alfa separado |

Concuerda con `docs/datos-galapavet.md:131-139`, que además fija los colores
muestreados del propio logo: morado **#77286B**, lima **#B4C718**, verde
profundo **#48704B**, fondo blanco del disco.

### 3.2 A dónde va

```
logo galapavet.webp   →   public/img/logo-galapavet.webp    (copia literal, byte a byte)
```

Esa es exactamente la ruta que espera `src/components/PieDePagina.tsx:12`.
**No re-comprimir**: ya es WebP con pérdida; una segunda pasada solo añade
artefactos sobre los bordes duros del logotipo. Copiar y ya.

Tamaño de pintado en el pie: el logo se renderiza pequeño (≈40-56 px CSS en
el bloque de marca), así que 201 px de origen cubre DPR 2 hasta 100 px CSS.
Suficiente. **No hace falta ninguna variante.**

### 3.3 Favicon: el problema real y qué hacer

`index.html:6` declara hoy:

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

Ese fichero no existe → 404. Y **no se puede derivar un `.svg` fiel de un
raster de 201×201**: vectorizar automáticamente un logo con degradados y
solapes (el verde #48704B nace de la superposición lima/morado, según
`docs/datos-galapavet.md:138`) produce un SVG con cientos de trazados y un
resultado sucio. Dos caminos honestos:

**Camino A (preferido) — pedir el vector al cliente.** Galapavet debe tener el
original en `.ai`/`.svg`/`.pdf` de quien le hizo la marca. Con él, `favicon.svg`
sale limpio y el `<link>` actual queda correcto sin tocar `index.html`.
**Acción para el humano:** pedirlo. Hasta entonces, camino B.

**Camino B (puente, mientras no haya vector) — favicon raster derivado del
WebP de 201 px.** Ficheros a generar en `public/`:

| Fichero | Tamaños | Formato | Para qué |
|---|---|---|---|
| `public/favicon.ico` | 16×16 + 32×32 + 48×48 (multi-imagen) | ICO | Pestaña del navegador. Es el nombre que los navegadores buscan por convención aunque no haya `<link>`. |
| `public/favicon-32.png` | 32×32 | PNG-32 (con alfa) | `<link rel="icon" type="image/png" sizes="32x32">` |
| `public/apple-touch-icon.png` | **180×180** | PNG-24 **sin alfa**, fondo blanco sólido | iOS. MDN: «Apple's iOS does not use the link type or sizes attribute, like other mobile browsers do, to select a webpage icon […] Instead it uses the non-standard `apple-touch-icon`» (https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel). iOS no respeta transparencia: sale negra. Por eso, fondo blanco. |

El origen de 201 px alcanza para los tres (180 ≤ 201). **No** alcanza para un
icono de 512×512 de manifiesto PWA: si algún día se añade `manifest.json`,
hace falta sí o sí el vector (camino A). Marcado como límite duro.

Sobre la selección entre varios iconos, MDN es explícito: «If there are
multiple `<link rel="icon">`s, the browser uses their `media`, `type`, and
`sizes` attributes to select the most appropriate icon […] If the most
appropriate icon is later found to be inappropriate, for example because it
uses an unsupported format, the browser proceeds to the next-most
appropriate» (misma URL). Es decir: declarar el `.svg` **y** el `.png`/`.ico`
es progresivo y seguro. Cabecera propuesta para `index.html` en el camino B:

```html
<link rel="icon" href="/favicon.ico" sizes="32x32" />
<link rel="icon" type="image/png" href="/favicon-32.png" sizes="32x32" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<!-- cuando llegue el vector del cliente: -->
<!-- <link rel="icon" type="image/svg+xml" href="/favicon.svg" sizes="any" /> -->
```

(`sizes="any"` es el valor que MDN documenta para vectoriales: «"any", meaning
that the icon can be scaled to any size as it is in a vector format, like
image/svg+xml».)

**Editar `index.html` NO es tarea del `tdd_craftsman`**: está fuera de `src/`
y de los tests, así que lo puede hacer el `craftsman_lead` directamente
(CLAUDE.md, «Cuándo NO aplica el rol de orquestador»).

---

## 4. Plan de material de stock

### 4.1 Banco elegido y licencia verificada

**Pexels — https://www.pexels.com/license/ (verificado hoy leyendo la página
oficial, no de memoria).** Lo que dice literalmente:

> Permitido: «All photos and videos on Pexels are free to use.» ·
> «You can modify the photos and videos from Pexels.» ·
> «Giving credit to the photographer or Pexels is not necessary but always
> appreciated.»
>
> Prohibido: personas identificables en contextos ofensivos o negativos ·
> vender copias sin alterar como pósters/impresiones · dar a entender que una
> persona o marca de la foto respalda algo · redistribuir o vender las
> imágenes en plataformas de stock competidoras · usar las fotos como marca
> comercial, marca de diseño o nombre de negocio.

Uso comercial: **sí**. Atribución: **no obligatoria**. Ninguna de las cinco
prohibiciones toca lo que hace esta web (mostrar la foto como contenido
dentro de una página). Compatible.

**Alternativa verificada, por si falta algún encuadre:** Unsplash —
https://unsplash.com/license. Permite «commercial and non-commercial
purposes» sin permiso previo, atribución no obligatoria, con dos
restricciones: no vender las imágenes sin modificación significativa y no
«compil[ar] images from Unsplash to replicate a similar or competing
service». También compatible.

**Recomendación firme: usar UN SOLO banco (Pexels) para los 24 huecos
fotográficos.** Mezclar bancos es la vía rápida a que el conjunto parezca un
collage: cada banco tiene su sesgo de tratamiento (contraste, temperatura,
grano) y se nota al ponerlos en la misma rejilla.

### 4.2 Dirección de arte (la regla que hace que el conjunto sea uno, no 24 fotos)

Tres familias visuales, y cada hueco pertenece a UNA:

| Familia | Dónde se usa | Reglas duras |
|---|---|---|
| **A — Clínica** | campañas (3) | Un **único reportaje**: misma sala, misma luz, mismo profesional. Luz clara y fría-neutra, batas/uniforme azul, fondo blanco. **Sin mascarillas** (fechan la foto en 2020-2021). |
| **B — Mascota en casa** | galería (6), tienda (8) | Luz natural cálida, interior doméstico, madera/textil claro, poca profundidad de campo. Animal en calma, nunca de acción. Sin fondos de estudio negros (rompen la calidez). |
| **C — Laboratorio** | blog 4, 5, 6 | Bodegón limpio, fondo claro y desenfocado, azules fríos como único acento. Objetos, no personas. |

Ajuste de color común a las tres, obligatorio para que peguen con la marca
(#77286B / #B4C718): temperatura ligeramente cálida, saturación bajada ~8 %,
negros levantados un pelín. **Nunca** un filtro de color morado o lima sobre
la foto: el color de marca debe vivir en la UI (bordes, etiquetas, botones),
no teñido sobre las fotografías. Y **nunca** un tratamiento distinto por
sección.

### 4.3 Asignación concreta, hueco por hueco

Formato de la URL de descarga directa (la que sirve el CDN de Pexels; se
descarga sin bloqueo, comprobado con `curl`; la web `www.pexels.com` sí
responde 403 a `curl`, así que hay que usar `images.pexels.com`):

```
https://images.pexels.com/photos/<ID>/pexels-photo-<ID>.jpeg?auto=compress&cs=tinysrgb&w=1600
```

Todos los IDs de abajo se comprobaron con `curl -o /dev/null -w "%{http_code}"`
y devuelven **200**. Las descripciones entre comillas son las que la propia
ficha de Pexels publica.

#### Familia A — Clínica (campañas)

Los tres salen del **mismo reportaje** (IDs contiguos `62346xx`/`62356xx`),
que es lo que garantiza la coherencia. Los tres se pintan con `alt=""`
(`CampanasPortada.tsx:47`, `PaginaCampanas.tsx:43`): son decorativos, el
título de la tarjeta es quien dice de qué va. Por eso no hace falta que la
foto ilustre literalmente el acto.

| Hueco | ID | Qué se ve | Alternativa |
|---|---|---|---|
| `campanas/vacunaciones.webp` | **6235238** | «A veterinarian in blue scrubs attentively examines a fluffy dog in a clinic» | 7469223 (sí muestra la inyección, pero el veterinario lleva mascarilla) |
| `campanas/chequeo.webp` | **6235650** | «A veterinarian checks a Pomeranian dog using a stethoscope in a clinic setting» | 6235648 |
| `campanas/odontologia.webp` | **6234622** | «A veterinarian examines a dog's teeth […] dental check-up in a clinic setting» | 6816865 (limpieza dental en primer plano, otro reportaje: rompe la coherencia) |

#### Familia B — Mascota en casa (galería)

`alt` = el nombre del animal (`Galeria.tsx:69` usa `entrada.nombre`). Los pies
ya existen en `src/data/galeria.ts:21-26` y describen un acto clínico
("Primera vacunación", "Alta tras cirugía de rodilla"…), así que la foto solo
tiene que ser un retrato tranquilo y creíble del animal, **nunca** una escena
médica: una foto de quirófano bajo el pie "Alta tras cirugía de rodilla"
afirmaría que esa cirugía la hizo Galapavet.

| Hueco | ID | Qué se ve |
|---|---|---|
| `galeria/nala-y-coco.webp` (son dos) | **16764535** | «A cat and dog resting on a sunlit bed indoors with blankets and toys» |
| `galeria/bruno.webp` | **10117515** | «Graceful greyhound lounging on a comfortable bed with soft cushions» |
| `galeria/luna.webp` | **5202144** | «A ginger tabby cat sits on a windowsill enjoying sunlight against brick» |
| `galeria/toby.webp` (geriátrico) | **20229531** | «A cute dachshund lying on a cozy bed» |
| `galeria/milo.webp` | **33284863** | «A peaceful Chihuahua snuggled under a soft blanket enjoying sunlight indoors» |
| `galeria/kira.webp` | **8191847** | «A peaceful dog sleeps under a floral blanket» |

#### Familia B — Mascota en casa (tienda)

`alt=""` (`PaginaTienda.tsx:95`): decorativas. Los nombres de producto ya
dicen «de ejemplo» en el propio texto (`src/data/tienda.ts:36-82`).

| Hueco | ID | Qué se ve |
|---|---|---|
| `tienda/pienso-perro-adulto.webp` | **8434635** | «A bowl filled with dog food placed on a wooden floor» |
| `tienda/pienso-gato-esterilizado.webp` | **34952073** | «A detailed close-up of brown dry dog food kibble» — genérico, sirve como pienso; **si se quiere un gato explícito hay que buscar y verificar otro ID** |
| `tienda/arnes-talla-m.webp` | **18741745** | «Cute terrier dog sitting on the porch wearing a black harness» |
| `tienda/correa-2m.webp` | **32390806** | «Adorable beagle on a leash enjoying a sunny day outdoors» |
| `tienda/cama-talla-m.webp` | **19027991** | «A Weimaraner dog peacefully sleeping on a fluffy dog bed in a cozy living room» |
| `tienda/manta-60x40.webp` | **230128** | «Cute black and brown puppy snuggled in a beige blanket on a bed» |
| `tienda/mordedor-caucho.webp` | **30401679** | «Adorable Boston Terrier puppy playing with a yellow chew toy on a carpet indoors» |
| `tienda/pelota-con-sonido.webp` | **11908217** | «Adorable puppy playing with a red ball on a lush green lawn» |

#### Blog (familias B y C)

**Importante:** el `alt` del blog **describe lo que se ve** y va en el dato
(`textoAlternativoImagen`, `src/data/blog.ts`). El contrato lo deja abierto a
propósito: `features/pagina_blog.feature:137-139` dice «PENDIENTE: las
FOTOGRAFÍAS. El cliente no publica ninguna. El contrato solo exige que sean
locales y que su alternativo no esté vacío ni afirme ningún servicio (@s28);
**qué se ve en ellas y cómo se describe es decisión de diseño**». Así que el
orden correcto es: **elegir la foto, y después ajustar el `alt` para que
describa la foto de verdad** — no al revés, y nunca dejar un `alt` que
describa algo que no está en la imagen.

| Hueco | ID | Qué se ve | `textoAlternativoImagen` propuesto |
|---|---|---|---|
| `blog/demo-1.webp` | **8191847** ó **37388025** | perro dormido bajo una manta | `"Fotografía de un perro dormido sobre una manta."` (hoy dice «en una sala de consulta»: **hay que quitar esa parte**, la foto no lo muestra) |
| `blog/demo-2.webp` | **5528422** ó **16662783** | gatos junto a una ventana | `"Fotografía de un gato sentado junto a una ventana."` (encaja tal cual; si se usa 16662783, que son dos, ponerlo en plural) |
| `blog/demo-3.webp` | **20534816** ó **11740844** | cachorro sobre hierba con una pelota | `"Fotografía de un cachorro jugando con una pelota sobre la hierba."` |
| `blog/demo-4.webp` | **4047150** | «Two blood sample test tubes on a light background» | `"Fotografía de dos tubos de muestra sobre un fondo claro."` |
| `blog/demo-5.webp` | **8539726** | «Detailed photo of a microscope on a laboratory desk» | `"Fotografía de un microscopio sobre una mesa de laboratorio."` (encaja tal cual) |
| `blog/demo-6.webp` | **6234978** | «A veterinarian prepares a Pomeranian dog for an x-ray in a medical facility» | `"Fotografía de un perro pequeño preparado para una radiografía en una clínica veterinaria."` — **el `alt` actual («una radiografía sobre una pantalla iluminada») no se corresponde con ninguna foto de stock veterinaria decente que haya encontrado; se cambia el `alt`, no se busca una radiografía humana** |

Nota de riesgo sobre `demo-6`: usar una radiografía **humana** (hay muchas en
el banco: 4225877, 5723874, 7723513) en el blog de una clínica **veterinaria**
sería un error de contenido. Por eso la propuesta es cambiar el texto.

#### Open Graph (`/img/og/galapavet.webp`)

**Aquí NO se usa stock.** Esta es la imagen que representa al negocio cuando
alguien comparte el enlace por WhatsApp o Facebook: poner la foto de la
clínica de otro es la mentira más cara del inventario. Composición propuesta,
hecha solo con material propio:

- Lienzo **1200×630 px**. Meta lo documenta oficialmente: «Use images that are
  at least 1200 x 630 pixels for the best display on high resolution devices»,
  «Try to keep your images as close to 1.91:1 aspect ratio as possible», «The
  minimum allowed image dimension is 200 x 200 pixels», «The size of the image
  file must not exceed 8 MB»
  (https://developers.facebook.com/docs/sharing/webmasters/images/).
- Fondo: morado de marca **#77286B** (verificado en `src/lib/tokens.ts` y
  `docs/datos-galapavet.md:136`), con el lima **#B4C718** solo como acento.
- Encima: el **logo real** (`logo galapavet.webp`, 201×201 — hay que
  escalarlo; a 201 px de origen sobre un lienzo de 1200 conviene no pasar de
  ~300 px de destino, o pedir el vector), el nombre «Galapavet» y el
  descriptor que ya existe como dato:
  `datosNegocio.identidad.descriptorConLocalidad` (usado en
  `PieDePagina.tsx:69`).
- Zona segura: no poner texto en los 60 px del borde (los recortes cuadrados
  de algunas apps comen los laterales).

**Formato:** la documentación oficial de Meta enlazada arriba **no declara
qué formatos acepta** — no aparece ninguna lista de formatos en la página
(**NO VERIFICADO** que WebP funcione como `og:image` en los rastreadores de
Meta/WhatsApp/LinkedIn). Lo prudente es generar **PNG o JPEG**, lo que obliga
a cambiar `MetadatosPagina.tsx:18` de `.webp` a `.png`. Eso **es** código de
`src/`, así que lo hace el `tdd_craftsman`, no a mano. Ver §6.

---

## 5. Huecos que el diseño va a querer y que HOY no existen en el código

No están en la tabla de §1 porque nadie los referencia todavía. Añadirlos es
una decisión de la feature 22, no un 404 que arreglar.

| Propuesta | Dónde | Dimensión | Candidato | Riesgo |
|---|---|---|---|---|
| **Fondo del hero** | `Hero.module.scss`, como `background-image` (no `<img>`: así no altera ningún recuento de imágenes) | 1920×1080 (16:9) + variante 960w; el prototipo pide `w=1800` en `Veterinaria La Sierra.dc.html:118` | **1108099** — «Adorable golden retriever puppies sitting in a field of flowers», que es literalmente la que usa el prototipo (verificada: existe y devuelve 200). Alternativa clínica: 6235238 | Un interior de clínica en el hero se lee como «esta es NUESTRA clínica». Con un exterior/mascota no se afirma nada. **Preferir el exterior.** |
| **Logo en la cabecera** | `Cabecera.tsx:77-80`, junto al nombre | el mismo `201×201`, sin variante | material real del cliente | Ninguno. Comprobado que no rompe recuentos: `PaginaTienda.test.tsx:171` cuenta `document.querySelectorAll('img')` = 8, pero `renderizarPaginaTienda` (`PaginaTienda.test.tsx:15-20`) monta `<PaginaTienda/>` **sin** `Cabecera`. |
| **`logo` / `image` en el JSON-LD** | `src/lib/seo-logica.ts:179-192` (`construirDatosEstructurados`) no emite hoy ninguna de las dos propiedades | URL absoluta del logo | material real del cliente | Requiere ampliar el contrato de la feature 15 `seo_estructura`. Fuera del alcance de este plan; se deja anotado. |

---

## 6. Trampas de contrato (leer antes de tocar nada)

1. **`og:image` relativo vs. la especificación.** `MetadatosPagina.tsx:18`
   emite `/img/og/galapavet.webp`, una ruta relativa. La especificación de
   Open Graph define el tipo `URL` como «A sequence of Unicode characters that
   identify an Internet resource. **All valid URLs that utilize the http:// or
   https:// protocols**» (https://ogp.me/), es decir, absoluta. Pero
   `src/components/MetadatosPagina.test.tsx:82-83` **exige lo contrario**:
   ```
   expect(ogImagen.startsWith('/')).toBe(true)
   expect(ogImagen).not.toMatch(/^https?:\/\//)
   ```
   Es una contradicción real entre el contrato escrito y el estándar. **No se
   arregla a escondidas**: hay que llevarlo a la conversación de spec y
   enmendar el escenario de `seo_estructura`, porque hoy la imagen de
   compartición probablemente no se resuelve en ningún rastreador.

2. **Cambiar la extensión del OG a `.png` toca `src/`.** Es una línea
   (`MetadatosPagina.tsx:18`) pero está dentro de `src/`: la hace el
   `tdd_craftsman` por TDD, no el orquestador (CLAUDE.md, «Reglas duras»).

3. **Las pruebas ya vigilan que nada sea remoto.** Cualquier ruta que empiece
   por `http://`/`https://`/`//` o que contenga la cadena `pexels` revienta la
   suite: `PaginaTienda.test.tsx:167-181` (@s5, y además fija **exactamente 8**
   imágenes de producto con `alt=""`), `PaginaBlog.test.tsx:566-581` (@s28,
   exactamente 3 imágenes en el artículo), `CampanasPortada.test.tsx:178-192`
   (exactamente 3, con rol `presentation` por el `alt=""`),
   `Servicios.test.tsx:398-416` (@s19). Esto es justo lo que se quiere: los
   ficheros se **descargan y se sirven en local**, y **el nombre del fichero
   no puede contener "pexels"** (por eso los nombres de la tabla de §1 son los
   que ya están en el dato, y no hay que renombrarlos).

4. **El logo del pie tiene `alt=""` a propósito** (`PieDePagina.tsx:66-67`), y
   `PieDePagina.test.tsx:28` comprueba `queryAllByRole('img')` = 0 dentro del
   pie. Una imagen con `alt=""` no expone rol `img`: la prueba pasa **con** el
   logo puesto. No cambiar ese `alt` a un texto: rompería la prueba y
   duplicaría el nombre accesible que ya da el texto contiguo.

---

## 7. Aviso honesto para el inventario de contenido demo

> Texto listo para pegar donde vaya el inventario de contenido de
> demostración (`project-spec.md`, «Riesgos abiertos», o el documento de
> entrega al cliente).

### Fotografías: contenido de demostración pendiente de sustitución

Ninguna de las 24 fotografías de esta web es de Galapavet. Son imágenes de
banco (Pexels, licencia de uso comercial sin atribución obligatoria, verificada
en https://www.pexels.com/license/), elegidas para que el diseño se pueda ver
terminado. **No muestran las instalaciones de Galapagar, ni a su equipo, ni a
sus pacientes, ni sus productos.** Todas deben sustituirse por material propio
del cliente antes de publicar.

El único material gráfico real que la web contiene hoy es **el logotipo**, que
sí es de Galapavet.

Las secciones que muestran estas fotos ya lo dicen en pantalla, no solo aquí:
la galería lleva su aviso en `Galeria.tsx:51-55`, las campañas en
`CampanasPortada.tsx:38-42`, y la tienda y el blog llevan el suyo. **Esos
avisos no se quitan hasta que llegue el material real**: son lo que evita que
una foto de banco se lea como una afirmación sobre el negocio.

**Orden de sustitución, de más urgente a menos:**

1. **Galería (6 fotos) — URGENTE.** Es el peor caso del inventario: cada foto
   va rotulada con un nombre propio y un episodio clínico
   («Bruno · Alta tras cirugía de rodilla», «Nala y Coco · Primera
   vacunación»). Una foto de banco ahí pone la mascota de un desconocido bajo
   una historia clínica inventada, atribuida a una clínica real. Además, las
   fotos reales de pacientes exigen **el consentimiento expreso de cada
   familia**, que hoy no consta (`src/data/galeria.ts:2-8`). Sustituir con
   fotos cedidas y consentidas, o **retirar la sección entera**. Retirarla es
   una opción perfectamente válida.
2. **Campañas (3 fotos) — ALTA.** Se leen como «así trabajamos nosotros»:
   muestran una consulta y un profesional que no son los de Galapagar.
   Sustituir a la vez que se confirmen las campañas reales (precio, vigencia y
   condiciones también están pendientes,
   `src/data/campanas.ts:1-16`).
3. **Imagen de compartición / Open Graph (1) — ALTA, pero ya resuelta de raíz.**
   Es la que sale en WhatsApp y en Facebook al compartir el enlace, así que es
   la que más se lee como «esto es Galapavet». Por eso **no lleva foto de
   banco**: se compone con el logo real sobre el morado de marca. Mejorable a
   futuro con una foto real de la fachada, pero hoy no miente.
4. **Fondo del hero (1, si se añade) — MEDIA.** Ambiente. El riesgo depende
   del encuadre: un **exterior** con una mascota no afirma nada; un
   **interior de clínica** se lee como «nuestras instalaciones» y sube a ALTA.
   Elegir exterior mientras no haya fotos propias.
5. **Blog (6 fotos) — MEDIA.** Son ilustraciones editoriales de artículos que
   ya están rotulados como «Artículo de demostración» y no afirman nada sobre
   el negocio. Se sustituyen cuando llegue el texto editorial real, que
   además necesita revisión veterinaria
   (`features/pagina_blog.feature:137-139`).
6. **Tienda (8 fotos) — BAJA.** Los propios nombres de producto dicen «de
   ejemplo» y los precios están marcados como demostración
   (`src/data/tienda.ts:10-14`). Son objetos genéricos: no hay personas ni
   instalaciones que suplantar. Se sustituyen cuando exista catálogo real.

**Lo que NO hay que "arreglar", y es deliberado:** la sección de equipo no
tiene ninguna fotografía. Galapavet publica dos profesionales
(`src/data/equipo.ts:14-24`) y no ha cedido retratos. Poner caras de banco
junto a los nombres de dos personas reales sería suplantación de identidad, y
el contrato lo impide por prueba (`src/components/Equipo.test.tsx:180-186`).
La ausencia de retratos es la conducta correcta, no un hueco pendiente.

---

## 8. Checklist de ejecución para el implementador

1. `mkdir -p public/img/{campanas,galeria,blog,tienda,og}`.
2. Copiar `"logo galapavet.webp"` → `public/img/logo-galapavet.webp` **sin
   recomprimir**.
3. Generar `favicon.ico` (16/32/48), `favicon-32.png` y
   `apple-touch-icon.png` (180×180, fondo blanco sólido) desde el logo; el
   `<link>` de `index.html:6` deja de ser válido tal cual → ver §3.3.
4. Descargar los 24 JPEG de Pexels por su URL directa de `images.pexels.com`
   (`www.pexels.com` responde 403 a `curl`), con `?w=1600`.
5. Aplicar el ajuste de color común de §4.2 (**el mismo a las 24**).
6. Recortar a la relación de aspecto de la tabla de §1 (16:9, 4:3 o 1.91:1) y
   exportar las variantes de §2.3 a WebP.
7. Componer el OG a mano (1200×630, PNG) — no es una foto de banco.
8. Añadir `srcset`/`sizes` y `width`/`height` en los `<img>` (evita CLS) por
   TDD; el `src` sin sufijo sigue siendo el que ya está en `src/data/*.ts`.
9. Ajustar los `textoAlternativoImagen` del blog a lo que realmente muestra
   cada foto elegida (§4.3), por TDD.
10. Verificar en navegador real (Playwright) que **cero** peticiones a
    `images.pexels.com` salen de la página y **cero** respuestas 404 de
    imagen — que es lo que ningún test de jsdom podía ver.
