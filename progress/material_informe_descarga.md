# Informe de descarga y verificación — 24 fotografías de banco (feature 22)

> **Alcance.** Ejecución del paso 4 del checklist de `progress/plan_imagenes.md` §8:
> descargar y verificar el material fotográfico de stock. **No se ha tocado el
> repositorio**: todo vive en este directorio de scratchpad. La creación de
> `public/` es implementación de la feature 22 y la hace el `tdd_craftsman`
> guiado por un test rojo.
>
> **Trazabilidad.** Cada URL se comprobó con `curl -I` (código y `content-type`)
> antes de descargar y con `curl -fL` al descargar. Cada dimensión se midió con
> `ffprobe` sobre el fichero real. Cada juicio visual se emitió mirando la
> imagen, no su descripción. Lo no verificado se marca **NO VERIFICADO**.

- **Descargadas: 24 / 24.** Fallos de descarga: **0**.
- **Resolución suficiente para el ancho mayor de su `srcset`: 24 / 24.** Nadie
  necesita escalar hacia arriba.
- Ficheros en `originales/`, formato JPEG (`codec_name = mjpeg`), 6 521 417 bytes
  en total.
- **Sustituciones respecto al plan: 7** (§3). Ninguna al azar; todas con motivo.

---

## 1. Licencia — transcripción literal

Releída hoy en la página oficial **https://www.pexels.com/license/** (no de
memoria). Coincide con lo que declara `plan_imagenes.md` §4.1: **no ha cambiado
nada**, no hay que parar.

**Permitido (cláusulas literales):**

> «All photos and videos on Pexels are free to use.»
>
> «Attribution is not required. Giving credit to the photographer or Pexels is
> not necessary but always appreciated.»
>
> «You can modify the photos and videos from Pexels. Be creative and edit them
> as you like.»

**Prohibido (cláusulas literales):**

> «Identifiable people may not appear in a bad light or in a way that is
> offensive.»
>
> «Don't sell unaltered copies of a photo or video, e.g. as a poster, print or
> on a physical product without modifying it first.»
>
> «Don't imply endorsement of your product by people or brands on the imagery.»
>
> «Don't redistribute or sell the photos and videos on other stock photo or
> wallpaper platforms.»
>
> «Don't use the photos or videos as part of your trade-mark, design-mark,
> trade-name, business name or service mark.»

**Lectura para este proyecto:**

| Cuestión | Respuesta | Por qué |
|---|---|---|
| ¿Uso comercial? | **Sí** | «free to use» sin distinción comercial/no comercial, y ninguna de las cinco prohibiciones excluye el uso comercial en una web. |
| ¿Atribución obligatoria? | **No** | «Attribution is not required». |
| ¿Se pueden recortar y convertir a WebP? | **Sí** | «You can modify the photos […] edit them as you like». Cubre el recorte, el ajuste de color de §4.2 del plan y la conversión a WebP. |

**Riesgo residual, y es real:** la cláusula «Don't imply endorsement of your
product by people or brands on the imagery» y la de personas identificables.
Las 3 fotos de campañas muestran a un **profesional veterinario identificable**
que no trabaja en Galapavet. Ponerlas bajo el rótulo de una clínica concreta se
acerca a dar a entender que esa persona presta ese servicio. No aparece «in a
bad light», así que no hay incumplimiento de la letra, pero **es exactamente el
motivo por el que los avisos de demostración en pantalla no se pueden quitar**
(`CampanasPortada.tsx:38-42`). Es un riesgo reputacional antes que legal.

**Ninguna foto lleva marca de agua ni logotipo de tercero** (comprobado mirando
las 24).

---

## 2. Tabla de material verificado

Las 24 se descargaron con el patrón que ya funcionaba
(`images.pexels.com`; `www.pexels.com` responde 403 a `curl`). Todas
devolvieron `200` con `content-type: image/jpeg` en el `curl -I` previo.

| hueco | ruta destino en el repo | ID de Pexels | URL | dimensiones reales | bytes | familia |
|---|---|---|---|---|---|---|
| `campanas-vacunaciones` | `/img/campanas/vacunaciones.webp` | 6235238 | `https://images.pexels.com/photos/6235238/pexels-photo-6235238.jpeg?auto=compress&cs=tinysrgb&w=1600` | 1600×2400 | 280946 | A |
| `campanas-chequeo` | `/img/campanas/chequeo.webp` | 6235650 | `https://images.pexels.com/photos/6235650/pexels-photo-6235650.jpeg?auto=compress&cs=tinysrgb&w=1600` | 1600×1067 | 98832 | A |
| `campanas-odontologia` | `/img/campanas/odontologia.webp` | 6234622 | `https://images.pexels.com/photos/6234622/pexels-photo-6234622.jpeg?auto=compress&cs=tinysrgb&w=1600` | 1600×1067 | 91102 | A |
| `galeria-nala-y-coco` | `/img/galeria/nala-y-coco.webp` | 16764535 | `https://images.pexels.com/photos/16764535/pexels-photo-16764535.jpeg?auto=compress&cs=tinysrgb&w=1600` | 1600×2428 | 714078 | B |
| `galeria-bruno` | `/img/galeria/bruno.webp` | 10117515 | `https://images.pexels.com/photos/10117515/pexels-photo-10117515.jpeg?auto=compress&cs=tinysrgb&w=1600` | 1600×2400 | 373285 | B |
| `galeria-luna` | `/img/galeria/luna.webp` | 16587667 | `https://images.pexels.com/photos/16587667/pexels-photo-16587667.jpeg?auto=compress&cs=tinysrgb&w=1600` | 1600×1067 | 144830 | B |
| `galeria-toby` | `/img/galeria/toby.webp` | 20229531 | `https://images.pexels.com/photos/20229531/pexels-photo-20229531.jpeg?auto=compress&cs=tinysrgb&w=1600` | 1600×2133 | 238964 | B |
| `galeria-milo` | `/img/galeria/milo.webp` | 33284863 | `https://images.pexels.com/photos/33284863/pexels-photo-33284863.jpeg?auto=compress&cs=tinysrgb&w=1600` | 1600×2000 | 236756 | B |
| `galeria-kira` | `/img/galeria/kira.webp` | 8191847 | `https://images.pexels.com/photos/8191847/pexels-photo-8191847.jpeg?auto=compress&cs=tinysrgb&w=1600` | 1600×1288 | 233857 | B |
| `tienda-pienso-perro-adulto` | `/img/tienda/pienso-perro-adulto.webp` | 8434635 | `https://images.pexels.com/photos/8434635/pexels-photo-8434635.jpeg?auto=compress&cs=tinysrgb&w=1600` | 1600×2400 | 300737 | B |
| `tienda-pienso-gato-esterilizado` | `/img/tienda/pienso-gato-esterilizado.webp` | 16618557 | `https://images.pexels.com/photos/16618557/pexels-photo-16618557.jpeg?auto=compress&cs=tinysrgb&w=1600` | 1600×2407 | 343808 | B |
| `tienda-arnes-talla-m` | `/img/tienda/arnes-talla-m.webp` | 18741745 | `https://images.pexels.com/photos/18741745/pexels-photo-18741745.jpeg?auto=compress&cs=tinysrgb&w=1600` | 1600×1715 | 234867 | B |
| `tienda-correa-2m` | `/img/tienda/correa-2m.webp` | 10875173 | `https://images.pexels.com/photos/10875173/pexels-photo-10875173.jpeg?auto=compress&cs=tinysrgb&w=1600` | 1600×2400 | 299091 | B |
| `tienda-cama-talla-m` | `/img/tienda/cama-talla-m.webp` | 19027991 | `https://images.pexels.com/photos/19027991/pexels-photo-19027991.jpeg?auto=compress&cs=tinysrgb&w=1600` | 1600×1067 | 202821 | B |
| `tienda-manta-60x40` | `/img/tienda/manta-60x40.webp` | 230128 | `https://images.pexels.com/photos/230128/pexels-photo-230128.jpeg?auto=compress&cs=tinysrgb&w=1600` | 1600×2133 | 460133 | B |
| `tienda-mordedor-caucho` | `/img/tienda/mordedor-caucho.webp` | 30401679 | `https://images.pexels.com/photos/30401679/pexels-photo-30401679.jpeg?auto=compress&cs=tinysrgb&w=1600` | 1600×900 | 114778 | B |
| `tienda-pelota-con-sonido` | `/img/tienda/pelota-con-sonido.webp` | 3860306 | `https://images.pexels.com/photos/3860306/pexels-photo-3860306.jpeg?auto=compress&cs=tinysrgb&w=1600` | 1600×1068 | 266730 | B |
| `blog-demo-1` | `/img/blog/demo-1.webp` | 37388025 | `https://images.pexels.com/photos/37388025/pexels-photo-37388025.jpeg?auto=compress&cs=tinysrgb&w=1600` | 1600×2400 | 433945 | B |
| `blog-demo-2` | `/img/blog/demo-2.webp` | 24877434 | `https://images.pexels.com/photos/24877434/pexels-photo-24877434.jpeg?auto=compress&cs=tinysrgb&w=1600` | 1600×2401 | 373018 | B |
| `blog-demo-3` | `/img/blog/demo-3.webp` | 20534816 | `https://images.pexels.com/photos/20534816/pexels-photo-20534816.jpeg?auto=compress&cs=tinysrgb&w=1600` | 1600×2416 | 600309 | B |
| `blog-demo-4` | `/img/blog/demo-4.webp` | 4047150 | `https://images.pexels.com/photos/4047150/pexels-photo-4047150.jpeg?auto=compress&cs=tinysrgb&w=1600` | 1600×2400 | 83841 | C |
| `blog-demo-5` | `/img/blog/demo-5.webp` | 8539726 | `https://images.pexels.com/photos/8539726/pexels-photo-8539726.jpeg?auto=compress&cs=tinysrgb&w=1600` | 1600×1067 | 94741 | C |
| `blog-demo-6` | `/img/blog/demo-6.webp` | 6235234 | `https://images.pexels.com/photos/6235234/pexels-photo-6235234.jpeg?auto=compress&cs=tinysrgb&w=1600` | 1600×1067 | 72956 | C |
| `hero-fondo` | `(propuesto) Hero.module.scss background-image` | 1108099 | `https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=1920` | 1920×1440 | 226992 | B |

Nombre del fichero en disco: `originales/<hueco>_id<ID>.jpg`. **Ninguno contiene
la cadena `pexels`**, a propósito: `plan_imagenes.md` §6.3 recuerda que las
pruebas revientan si esa cadena aparece en una ruta servida
(`PaginaTienda.test.tsx:167-181`, `PaginaBlog.test.tsx:566-581`).

El `hero-fondo` es el hueco **propuesto** de `plan_imagenes.md` §5, que hoy no
existe en el código. Se descarga porque el plan cuenta 24 fotografías en §7
(23 huecos vivos + el hero). Si la feature 22 decide no añadir el hero, sobra
esa foto y quedan 23.

### Margen de resolución (lo que se midió, no lo que se supone)

Para cada foto: `crop_max` = ancho máximo obtenible recortando a su relación de
aspecto sin escalar hacia arriba, es decir `min(W, H × AR)`.

| hueco | AR destino | ancho mayor del `srcset` | `crop_max` medido | margen |
|---|---|---|---|---|
| campañas (×3) | 16:9 | 1200w | 1600w | +400 |
| galería `luna` | 4:3 | 800w | 1422w | +622 |
| galería (otras ×5) | 4:3 | 800w | 1600w | +800 |
| tienda `cama-talla-m` | 4:3 | 800w | 1422w | +622 |
| tienda `pelota-con-sonido` | 4:3 | 800w | 1424w | +624 |
| tienda `mordedor-caucho` | 4:3 | 800w | 1200w | +400 |
| tienda (otras ×5) | 4:3 | 800w | 1600w | +800 |
| blog (×6) | 16:9 | 1600w | 1600w | **+0 (justo)** |
| hero | 16:9 | 1920w | 1920w | **+0 (justo)** |

**Las 24 llegan.** Dos avisos honestos:

1. **El blog va justo.** El tope de 1600w del plan (§2.1, «decisión de este
   plan, no una medición») se cumple **exactamente**, sin margen. Si alguien
   sube el tope a 2160w para dar DPR 2 pleno a 1080 px CSS, **hay que volver a
   descargar** con `?w=2400`, no escalar estas. Comprobado que el CDN sirve
   anchos mayores: `?w=1920` devolvió 1920 px reales en el hero.
2. **El hero también va justo** a 1920w y sale de un original 4:3
   (1920×1440), así que el recorte 16:9 no pierde ancho pero sí un 37 % del alto.

---

## 3. Sustituciones respecto al plan (7), con su motivo

Ninguna es un cambio al azar: cada una respeta la familia visual que el plan
asigna a ese hueco, y cada sustituta se verificó con `curl -I` (200) y se miró.

| # | Hueco | ID del plan | ID usado | Motivo |
|---|---|---|---|---|
| 1 | `blog/demo-1.webp` | 8191847 **ó** 37388025 | **37388025** | **Colisión en el propio plan:** 8191847 estaba asignado a la vez a `galeria/kira.webp` (§4.3, familia B) y a `blog/demo-1.webp`. La misma foto no puede salir en dos secciones. Se conserva 8191847 en la galería (donde el plan no ofrecía alternativa) y el blog usa la alternativa que el plan ya proponía. Sin coste. |
| 2 | `galeria/luna.webp` | 5202144 | **16587667** | **El animal no se ve.** 5202144 («ginger tabby on a windowsill against brick») es un plano general de una fachada de ladrillo blanco: el gato ocupa ≈5 % del encuadre y queda a la derecha; en una tarjeta de 800×600 rotulada «Luna · Revisión anual» no se distingue. Además es **exterior**, y la familia B del plan exige «interior doméstico». Sustituta: gato atigrado naranja tumbado sobre ropa de cama blanca, despierto y mirando a cámara, luz natural cálida — encaja con las otras cinco de la galería (todas sobre textil de cama) y con «Revisión anual» (animal alerta, no dormido). |
| 3 | `blog/demo-2.webp` | 5528422 **ó** 16662783 | **24877434** | **La foto no contiene lo que dice el `alt`.** 5528422 es la **fachada exterior** de un edificio con dos ventanas de contraventanas verdes; hay gatos, pero diminutos y medio ocultos tras el cristal y las cortinas — invisibles a 1600×900. El `alt` «un gato sentado junto a una ventana» sería falso. Sustituta: gato blanco y naranja sentado junto a una ventana **desde dentro**, grande en el encuadre, con lo que el `alt` actual queda **exacto sin tocarlo**. (Se probó también 762984, un gato junto a una ventana con pared **turquesa**: descartado porque ese color saturado no aparece en ningún otro sitio de la web y era lo único del conjunto que se leía como «de otro banco».) |
| 4 | `blog/demo-6.webp` | 6234978 | **6235234** | **Es en blanco y negro.** 6234978 («veterinarian prepares a Pomeranian for an x-ray») es monocroma. Entre cinco fotos en color rompe el conjunto entero, y el ajuste de color común de §4.2 del plan es inaplicable a una imagen sin color. Además muestra **una persona**, y la familia C del plan pide «objetos, no personas». Sustituta: **un ecógrafo sobre una mesa en una sala de consulta, sin personas** — y, mejor aún, **pertenece al mismo reportaje que las tres fotos de campañas** (serie `62352xx`), lo que ata el blog con la portada. |
| 5 | `tienda/pienso-gato-esterilizado.webp` | 34952073 | **16618557** | El propio plan marcaba 34952073 como provisional: es una **macro de pienso de perro** bajo una etiqueta de producto para gato, y el plan escribía «si se quiere un gato explícito hay que buscar y verificar otro ID». Se buscó y se verificó. Sustituta: gato gris comiendo pienso seco de un cuenco sobre suelo claro, interior. Con recorte centrado se ven la cara del gato y el pienso. |
| 6 | `tienda/correa-2m.webp` | 32390806 | **10875173** | **Rompía la familia B.** 32390806 (beagle con correa) es exterior, a contraluz y con fondo casi negro: en la rejilla de 8 productos era el tile más oscuro y contrastado con diferencia, y se leía como de otra sesión. Sustituta: Shiba Inu tumbado en un suelo de madera **en interior**, con collar rojo y correa visible subiendo del encuadre, luz natural cálida y poca profundidad de campo — el enunciado literal de la familia B. |
| 7 | `tienda/pelota-con-sonido.webp` | 11908217 | **3860306** | Dos motivos. (a) **Duplicaba un concepto**: 11908217 es «cachorro con pelota sobre césped», y `blog/demo-3` (20534816) es también un cachorro con una pelota sobre césped — la misma escena en dos secciones de la misma web. (b) Es exterior con verde muy saturado, fuera de la familia B. Sustituta: cachorro Samoyedo sobre una alfombra clara **en interior** con una pelota amarilla; mantiene el producto legible y deja el «cachorro sobre hierba» como exclusivo del blog. |

**Descartadas y por qué no se usaron** (para que nadie las reproponga):
`7469223` (el plan ya lo descartaba: mascarilla), `6816865` (otro reportaje,
rompe la coherencia de campañas), `762984` (pared turquesa), `13317322`
(el recorte centrado decapita al gato), `7755249` (fondo de estudio rosa),
`7089029` / `7089012` (equipamiento de clínica **humana**, y `7089029` con suelo
granate), `1350591` (inyección literal, pero de un reportaje distinto: repetiría
el error que el plan evita en §4.3).

**Lo que NO se sustituyó pese a la tentación:** `campanas/vacunaciones.webp`
(6235238). Su problema era el recorte, no la foto (§4). Cambiarla por una
imagen de vacunación literal de otro reportaje habría roto la regla dura de la
familia A —«un único reportaje: misma sala, misma luz, mismo profesional»—, que
es justo lo que sostiene la coherencia de la portada.

---

## 4. Recortes: dónde el recorte centrado NO vale

Se comprobó el recorte a la relación de aspecto de destino de las 24. **21
funcionan centradas.** Tres necesitan desplazamiento vertical, medido probando
offsets y mirando el resultado:

| hueco | original | recorte | offset recomendado | qué se pierde si se centra |
|---|---|---|---|---|
| `campanas/vacunaciones.webp` | 1600×2400 (vertical) | `crop=1600:900` | **`y = 850`** | Centrado (`y=750`) corta al veterinario por el cuello y deja al perro pisando el borde inferior. A `y=850` se ven las manos sujetando al pomerania y el uniforme azul: se lee como acto clínico. **Aviso:** en 16:9 desde un vertical es imposible meter a la vez la cara del profesional y al animal; se eligió al animal, que es lo que la tarjeta necesita (el `alt` es `""` y el título dice «Vacunaciones»). |
| `blog/demo-3.webp` | 1600×2416 (vertical) | `crop=1600:900` | **`y = 860`** | Centrado (`y=758`) deja **la pelota fuera del encuadre**: quedaría un primer plano de cara de cachorro bajo un `alt` que habla de una pelota. A `y=860` entran ojos, hocico, pata y pelota. |
| `blog/demo-2.webp` | 1600×2401 (vertical) | `crop=1600:900` | **`y = 500`** | Centrado corta la cabeza del gato. A `y=500` entran cara, collar y el marco de la ventana. |

Comando de referencia (recorte + escalado), sin escalar hacia arriba en ningún caso:

```
ffmpeg -i originales/<hueco>_id<ID>.jpg -vf "crop=1600:900:0:850,scale=800:450" salida.webp
```

---

## 5. Coherencia de dirección de arte — juicio honesto

Se juzgó **mirando las imágenes recortadas a su relación de aspecto final**,
montadas en la misma rejilla en la que van a aparecer (los montajes están en
este directorio: `final_A_campanas.jpg`, `final_B_galeria.jpg`,
`final_B_tienda.jpg`, `final_blog.jpg`). No se juzgó por las descripciones.

### Familia A — Campañas (3): **coherente, y es el punto fuerte**

Las tres **salen del mismo reportaje**, como exigía el plan, y se nota sin
esfuerzo: mismo uniforme azul marino, misma sala de paredes gris claro, misma
luz difusa y fría-neutra, mismos tonos de madera en la mesa de exploración.
**Ninguna lleva mascarilla.** Puestas en fila parecen tres momentos de la misma
mañana, que es exactamente el efecto buscado.

Único matiz: `vacunaciones` y `chequeo` muestran **el mismo perro** (un
pomerania naranja) y `odontologia` un pastor alemán. Refuerza la lectura de
«mismo reportaje»; no molesta.

### Familia B — Galería (6): **coherente tras la sustitución**

Las seis son animales en calma sobre textil de cama, en interior, con luz
natural. Ninguna es una escena médica —cumpliendo la advertencia del plan de
que una foto de quirófano bajo el pie «Alta tras cirugía de rodilla» afirmaría
que esa cirugía la hizo Galapavet.

**El eslabón débil, dicho sin adornos:** `nala-y-coco` (16764535) es
técnicamente la peor de las seis — plana, poco contraste, aire de foto de móvil
frente a las otras cinco, que están hechas con óptica luminosa. Se mantiene
porque es la única que muestra **un gato y un perro juntos**, y el pie exige dos
animales («Nala y Coco»). Es el candidato número uno a mejorar si alguien busca
un rato más. El ajuste de color común de §4.2 la acercará al resto, pero no la
igualará.

### Familia B — Tienda (8): **coherente tras las tres sustituciones**

Antes de tocar nada, las 8 **sí** parecían un collage: había una macro de
pienso sin contexto, un beagle a contraluz sobre fondo negro y un cachorro
sobre césped fluorescente conviviendo con cinco interiores cálidos. Tras
sustituir esas tres, **las 8 son interiores domésticos con luz natural**, madera
o textil claro, animal en calma.

Sigue habiendo un gradiente de luminosidad: `arnes-talla-m` (18741745) y
`mordedor-caucho` (30401679) son claramente más oscuras que las demás. **No
desentonan** —son interiores cálidos, no otra estética— pero conviene levantar
los negros de esas dos algo más que del resto al aplicar el ajuste de §4.2. Es
el único sitio donde recomiendo apartarse del «mismo tratamiento a las 24».

### Blog (6): **coherente, y la división es deliberada**

Tres retratos animales cálidos (demo-1, 2, 3) y tres bodegones clínicos de
fondo claro (demo-4, 5, 6). No es incoherencia: es la asignación de familias B
y C que hace el plan (§4.2). Dentro de cada trío el tratamiento es homogéneo.

Dos observaciones:

- `demo-5` (8539726) tiene **una mascarilla quirúrgica azul asomando en la
  esquina superior izquierda**. La regla «sin mascarillas» del plan se escribió
  para la familia A, y aquí es un objeto de fondo, no una persona con
  mascarilla. Es un detalle menor pero **fecha la foto**. El recorte 16:9 tiene
  167 px de juego vertical: no basta para eliminarla del todo. Se deja, avisado.
- `demo-6` (6235234) es una sala de consulta real con un ecógrafo. Es la foto
  más austera del conjunto y, siendo del mismo reportaje que las campañas,
  **refuerza** la unidad del sitio. Contrapartida: como cualquier interior
  clínico, se puede leer como «estas son nuestras instalaciones». El riesgo es
  el mismo que ya asumen las 3 de campañas y está cubierto por los avisos de
  demostración en pantalla.

### Hero (1): sin juicio de conjunto

`1108099` (cachorros golden en un campo de flores) es la que usa el prototipo.
Es **exterior**, que es lo que el plan recomienda para no afirmar nada sobre las
instalaciones. Estéticamente no pertenece a ninguna de las tres familias: es un
plano abierto, muy saturado en verdes. Como fondo a sangre con una capa de
color encima funciona; **si se decide usarla sin velo, desentonará** con todo lo
demás. **NO VERIFICADO** cómo queda con el tratamiento final, porque el hueco no
existe todavía en el código.

### Veredicto global

**Sí, el conjunto se lee como un solo sitio** — pero después de las 7
sustituciones, no antes. Con los IDs tal y como venían en el plan, tres huecos
habrían quedado directamente rotos (un gato invisible, una fachada sin gato, una
foto en blanco y negro) y la rejilla de la tienda habría parecido un collage.
Queda **un eslabón visualmente débil** (`nala-y-coco`) y **un elemento sin
integrar** (el hero, si se añade).

Todo esto asume que se aplica **el mismo ajuste de color a las 24** (§4.2 del
plan). Sin ese paso, el conjunto vuelve a parecerse a lo que es: fotos de 24
autores distintos.

---

## 6. LA GALERÍA — encaje foto por foto, y el aviso que no se puede omitir

> **Estas seis fotografías NO son de Galapavet.** No son sus pacientes, no son
> sus instalaciones y los animales que aparecen no son los de sus clientes. Los
> nombres —Nala, Coco, Bruno, Luna, Toby, Milo, Kira— y los episodios clínicos
> que los acompañan son **contenido inventado de demostración**
> (`src/data/galeria.ts:1-13`). **Sustituirlas es URGENTE antes de publicar**,
> y es el punto 1 del orden de sustitución de `plan_imagenes.md` §7.
>
> Sustituir no basta con «poner otras fotos»: las fotografías reales de
> pacientes exigen **el consentimiento expreso y documentado de cada familia**,
> que hoy no consta. Si ese consentimiento no llega, **retirar la sección entera
> es una decisión perfectamente válida** y preferible a dejar esto publicado.

El humano decidió hoy que la galería lleve fotos de Pexels **relacionadas con su
contenido**. Los seis pies llevan nombre propio y episodio clínico
(`src/data/galeria.ts:21-26`), así que cada foto se eligió para que **encaje con
lo que dice su pie** — respetando a la vez la regla del plan de que la foto sea
un retrato tranquilo del animal y **nunca** una escena médica.

| Hueco | Pie (dato real del repo) | ID | Qué se ve, mirado | Por qué encaja |
|---|---|---|---|---|
| `nala-y-coco.webp` | **Nala y Coco** · «Primera vacunación» | 16764535 | Un gato atigrado naranja y un perro salchicha marrón, **los dos juntos** sobre una cama con un juguete | El pie nombra **dos** animales: es la única del conjunto con dos. Animales jóvenes, coherente con «primera vacunación». |
| `bruno.webp` | **Bruno** · «Alta tras cirugía de rodilla» | 10117515 | Galgo/saluki claro tumbado sobre una cama, en reposo, mirando a cámara | **Perro** (no gato), tumbado y en reposo: es lo que se ve en una convalecencia en casa. No se muestra ninguna cicatriz ni escena quirúrgica: afirmar la cirugía sería mentir sobre quién la hizo. |
| `luna.webp` | **Luna** · «Revisión anual» | **16587667** | Gato atigrado naranja sobre ropa de cama blanca, **despierto y alerta**, mirando a cámara | Una revisión anual es de animal sano: alerta y en buen estado, no dormido ni convaleciente. |
| `toby.webp` | **Toby** · «Chequeo geriátrico» | 20229531 | Teckel marrón, retrato cercano sobre una cama | **Aviso honesto: el perro no se ve viejo.** Es el peor encaje semántico de los seis. Se mantiene porque es la mejor foto del conjunto y porque el pie no está en el `alt` (el `alt` es solo «Toby», `Galeria.tsx:69`), así que la contradicción no llega a un lector de pantalla — pero sí a quien mire. Mejorable. |
| `milo.webp` | **Milo** · «Cita de esterilización» | 33284863 | Chihuahua acurrucado bajo una manta, tranquilo | Animal pequeño en reposo en casa. Ninguna afirmación clínica visible. |
| `kira.webp` | **Kira** · «Curas tras una intervención» | 8191847 | Perro dormido bajo un edredón de flores, solo cabeza y patas | Descanso en casa tras una intervención. **No** se muestran vendajes ni heridas, a propósito. |

**Regla que se siguió y conviene no romper al sustituir:** si el pie habla de un
perro, la foto es un perro. `bruno` (cirugía de rodilla) es un perro; `luna` y
la mitad de `nala-y-coco` son gatos porque nada en sus pies dice lo contrario y
aportan variedad. Y ninguna de las seis muestra un acto médico, porque el pie ya
lo cuenta: la foto solo tiene que hacer creíble al animal.

---

## 7. Consecuencias para `src/` (las hace el `tdd_craftsman`, por TDD)

Elegida la foto, hay que **ajustar el `alt` a lo que la foto muestra de verdad**,
que es el orden que impone `plan_imagenes.md` §4.3. Cuatro de los seis
`textoAlternativoImagen` del blog **hoy describen algo que no está en la
imagen**:

| Dato | `textoAlternativoImagen` actual (`src/data/blog.ts`) | Propuesto | Motivo |
|---|---|---|---|
| `demo-1` (:61) | «Fotografía de un perro tumbado sobre una manta **en una sala de consulta**.» | «Fotografía de un perro tumbado sobre una cama con mantas.» | La foto es un interior doméstico, no una consulta. Decir «sala de consulta» **afirmaría un espacio clínico que no se ve** — el mismo error que el plan evita en la galería. |
| `demo-2` (:76) | «Fotografía de un gato sentado junto a una ventana.» | **sin cambios** | La sustituta elegida encaja literalmente. |
| `demo-3` (:87) | «Fotografía de un cachorro jugando con una pelota **en un jardín**.» | «Fotografía de un cachorro con una pelota sobre la hierba.» | Se ve hierba; que sea un jardín es una suposición. |
| `demo-4` (:100) | «Fotografía de **un tubo** de muestra sobre **una mesa de laboratorio**.» | «Fotografía de dos tubos de muestra sobre un fondo claro.» | Son **dos** tubos y el fondo es liso, no una mesa reconocible. |
| `demo-5` (:113) | «Fotografía de un microscopio sobre una mesa de trabajo.» | **sin cambios** | Encaja tal cual. |
| `demo-6` (:124) | «Fotografía de **una radiografía sobre una pantalla iluminada**.» | «Fotografía de un equipo de ecografía sobre una mesa en una sala de consulta.» | No hay ninguna radiografía en la foto. El plan ya anticipaba que este `alt` habría que cambiarlo. |

Recordatorio de `plan_imagenes.md` §6: ese fichero está en `src/`, así que **no
lo toca el orquestador**. Y las trampas de contrato siguen vigentes: el
`og:image` relativo (§6.1), el cambio de extensión del OG (§6.2) y la
prohibición de rutas remotas o que contengan `pexels` (§6.3).

---

## 8. Lo que este informe NO cubre

- **La imagen Open Graph** (`/img/og/galapavet.*`): por diseño **no lleva foto
  de banco** (`plan_imagenes.md` §4.3). Se compone con el logo real sobre el
  morado de marca. No es material de stock y no se ha tocado aquí.
- **Logo y favicon**: material real del cliente, §3 del plan. Fuera de esta
  tarea. (Recordatorio del encargo: `magick` **no está instalado** en esta
  máquina; el `.ico` necesitará otra vía.)
- **La conversión a WebP y las variantes de `srcset`**: aquí solo hay
  **originales JPEG verificados**. La conversión con `ffmpeg`/`libwebp`
  (Decisión 34) y el ajuste de color de §4.2 son el paso siguiente.
- **NO VERIFICADO**: cómo quedan las 24 tras el ajuste de color común; el
  encaje del hero; y que ningún rastreador de Meta acepte el formato del OG
  (el plan ya lo marca como no verificado en §4.3).

---

## 9. Inventario del directorio de trabajo

```
material/
├── informe_descarga.md        este documento
├── manifest.tsv               hueco → ID → ancho pedido → ruta destino → familia
├── medidas.tsv                medidas de ffprobe, una línea por foto
├── originales/                LAS 24 FOTOS VERIFICADAS (JPEG)  ← lo que hay que convertir
├── candidatos/                candidatos evaluados y descartados (no usar)
├── previews/                  cada foto recortada a su AR final
├── final_A_campanas.jpg       montajes de juicio visual
├── final_B_galeria.jpg
├── final_B_tienda.jpg
└── final_blog.jpg
```

**El repositorio no se ha tocado.** De él solo se leyó
(`progress/plan_imagenes.md`, `src/data/galeria.ts`, `src/data/blog.ts`).
