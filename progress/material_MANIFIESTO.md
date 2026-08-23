# MANIFIESTO — material de imagen listo para la feature 22

> **Qué es esto.** El paso 6 del checklist de `progress/plan_imagenes.md` §8:
> recorte, ajuste de color, escalado a los anchos de `srcset` y conversión a
> WebP de las 24 fotografías descargadas, más el material de marca ya
> producido. **Aquí termina la preparación**: lo que sigue es una copia.
>
> **El repositorio no se ha tocado.** De él solo se ha LEÍDO
> (`progress/plan_imagenes.md`, `src/data/*.ts`, `src/components/*.tsx`,
> `src/pages/*.tsx`, `index.html`). No existe ni se ha creado `public/`: eso es
> implementación de la feature 22 y la hace el `tdd_craftsman` guiado por un
> test rojo.
>
> **Trazabilidad.** Cada dimensión y cada byte de las tablas está **medido**
> con `ffprobe` / `stat` sobre el fichero real. Cada juicio de recorte y de
> calidad se emitió **mirando** la imagen. Lo no verificable aparece marcado
> **NO VERIFICADO**.

---

## 0. Resumen

| | |
|---|---|
| Huecos del inventario cubiertos | **26 / 26** (24 con la ruta exacta; 2 por sustitución ya prevista en el contrato — §6) |
| Ficheros preparados para copiar | **60** (57 en `public/img/` + 3 en la raíz de `public/`) |
| Peso total a versionar | **1 609,4 kB ≈ 1,53 MiB** |
| Ficheros a 0 bytes o corruptos | **0** (verificado por decodificación completa y en navegador real, §7) |
| Calidad WebP elegida | **80** (`libwebp`, `-preset picture -compression_level 6`) — justificación medida en §3 |
| Techo por página propuesto | portada 350 kB · tienda 320 kB · blog-artículo 250 kB · campañas 120 kB (§5) |

Estructura entregada:

```
material/
├── webp/          → se copia a  public/img/     (57 ficheros, 1 579,3 kB)
│   ├── campanas/ 9    galeria/ 12    tienda/ 16    blog/ 18
│   ├── og/galapavet.png
│   └── logo-galapavet.webp
├── raiz/          → se copia a  public/         (3 ficheros, 30,2 kB)
│   └── favicon.ico  favicon-32.png  apple-touch-icon.png
├── opcional/      → NO se copia sin decisión explícita (§8)
└── _proceso_webp/ → guiones reproducibles y hojas de evidencia visual (§9)
```

La copia posterior es literalmente:

```sh
mkdir -p public/img
cp -r material/webp/.  public/img/
cp    material/raiz/*  public/
```

---

## 1. Convención de nombres del `srcset`

**`<nombre>.webp` es el ancho por defecto de su familia; las demás variantes
llevan sufijo `-<ancho>w.webp`. No hay ficheros duplicados.**

| Familia | Ancho por defecto (fichero sin sufijo) | Otras variantes |
|---|---|---|
| Campañas | **800w** → `vacunaciones.webp` | `-400w`, `-1200w` |
| Galería | **800w** → `bruno.webp` | `-400w` |
| Tienda | **800w** → `correa-2m.webp` | `-400w` |
| Blog | **1600w** → `demo-1.webp` | `-400w`, `-800w` |

Por qué así, y no `<nombre>-800w.webp` para todas:

1. El fichero **sin sufijo es exactamente la ruta que ya declara el dato**
   (`src/data/campanas.ts:67`, `src/data/galeria.ts:21-26`, `src/data/blog.ts`,
   `src/data/tienda.ts:39-81`). El `src` actual sigue siendo válido tal cual y
   el `srcset` se añade encima **sin tocar el dato**, que es lo que pide
   `plan_imagenes.md` §2.3.
2. **No se duplica ningún byte.** La alternativa —dejar el fichero sin sufijo
   *y además* una copia `-800w`— añadiría ~590 kB al repositorio que **ningún
   navegador llegaría a pedir nunca**: con `srcset` presente el candidato
   elegido sale siempre de la lista del `srcset`, y `src` solo actúa de
   respaldo para un navegador sin soporte (ninguno actual lo es).

`srcset` resultante, listo para pegar, con los `sizes` de `plan_imagenes.md` §2.2:

```html
<!-- campañas -->
srcset="/img/campanas/vacunaciones-400w.webp 400w,
        /img/campanas/vacunaciones.webp 800w,
        /img/campanas/vacunaciones-1200w.webp 1200w"
sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 390px"
width="800" height="450"

<!-- galería y tienda -->
srcset="/img/galeria/bruno-400w.webp 400w, /img/galeria/bruno.webp 800w"
sizes="(max-width: 640px) 78vw, 360px"
width="800" height="600"

<!-- blog, imagen del artículo -->
srcset="/img/blog/demo-1-400w.webp 400w,
        /img/blog/demo-1-800w.webp 800w,
        /img/blog/demo-1.webp 1600w"
sizes="(max-width: 1120px) calc(100vw - 40px), 1080px"
width="1600" height="900"

<!-- blog, miniatura de «Sigue leyendo»: mismo srcset, otro sizes -->
sizes="(max-width: 640px) 40vw, 300px"
```

`width`/`height` en cada `<img>` no es cosmético: es lo que evita el CLS
(paso 8 del checklist del plan).

---

## 2. Recortes: dónde se puso el encuadre y por qué

Se generaron los 24 recortes **centrados** y se miraron uno a uno.
**13 valen centrados. 11 no**, y de esos 11 **ocho no estaban señalados** en
`informe_descarga.md` §4 —que solo detectó tres—: se detectaron mirando el
recorte, no la descripción.

Fórmula: se toma el mayor rectángulo de la relación de aspecto de destino que
cabe en el original (`crop=cw:ch:x:y`, `x` siempre centrado horizontalmente) y
solo se desplaza el eje vertical. **En ningún hueco se escala hacia arriba**:
el ancho del recorte iguala o supera el mayor ancho de su `srcset`.

| Hueco | Original | Recorte | `y` | Por qué no vale el centro |
|---|---|---|---|---|
| `campanas/vacunaciones` | 1600×2400 | 1600×900 | **950** | Centrado (750) deja un torso sin cabeza con el pomerania pisando el borde inferior. A 950 el perro entra entero y se lee el acto clínico. En 16:9 desde un vertical **no caben a la vez la cara del profesional y el animal**: se elige el animal (`alt=""`, y el título de la tarjeta ya dice «Vacunaciones»). |
| `campanas/odontologia` | 1600×1067 | 1600×900 | **0** | Centrado (83) corta la cabeza del veterinario. A 0 entra la persona completa abriendo la boca del perro. Una persona entera se lee mejor que una decapitada. |
| `blog/demo-2` | 1600×2401 | 1600×900 | **350** | Centrado (750) corta al gato por la barbilla, y el `alt` habla de «un gato sentado junto a una ventana». A 350 entran orejas, cara y marco de ventana. **Corrige el valor 500** de `informe_descarga.md` §4, medido sobre otro candidato. |
| `blog/demo-3` | 1600×2416 | 1600×900 | **900** | Centrado (758) deja **la pelota fuera del encuadre** bajo un `alt` que habla de una pelota. A 900 entran ojos, hocico, pata y pelota. (El informe proponía 860; 900 encuadra mejor la pelota completa.) |
| `blog/demo-4` | 1600×2400 | 1600×900 | **900** | Centrado (750) parte el segundo tubo. A 900 los **dos** tubos entran completos, que es lo que dirá el `alt` corregido. |
| `blog/demo-5` | 1600×1067 | 1600×900 | **167** | Baja el encuadre todo lo que permite el original para reducir la mascarilla azul de la esquina superior izquierda. **No la elimina** —solo hay 167 px de juego—: queda un fragmento pequeño. Avisado, no resuelto. |
| `galeria/nala-y-coco` | 1600×2428 | 1600×1200 | **800** | Centrado (614) parte al perro por la mitad. El pie exige **dos** animales («Nala y Coco»): a 800 entran el gato y el teckel enteros. |
| `tienda/pienso-gato-esterilizado` | 1600×2407 | 1600×1200 | **400** | Centrado (603) corta las orejas del gato. A 400 entran cabeza y cuenco. |
| `tienda/arnes-talla-m` | 1600×1715 | 1600×1200 | **60** | Centrado (257) corta la parte alta de la cabeza. A 60 el perro y el arnés —que es el producto— entran completos. |
| `tienda/correa-2m` | 1600×2400 | 1600×1200 | **400** | Centrado (600) roza las orejas. A 400 entran cabeza, collar rojo y correa. |
| `tienda/manta-60x40` | 1600×2133 | 1600×1200 | **250** | Centrado (466) corta la cabeza del cachorro. A 250 entra entera con la manta. |

Los otros trece van centrados: `campanas/chequeo`, `galeria/bruno`,
`galeria/luna`, `galeria/toby`, `galeria/milo`, `galeria/kira`,
`tienda/pienso-perro-adulto`, `tienda/cama-talla-m`, `tienda/mordedor-caucho`,
`tienda/pelota-con-sonido`, `blog/demo-1`, `blog/demo-6` y el hero opcional.

Hojas de evidencia, decodificadas **del `.webp` entregado** y no del JPEG
intermedio: `_proceso_webp/evidencia-final-16-9.png`,
`evidencia-final-galeria.png`, `evidencia-final-tienda.png`,
`evidencia-og.png`.

### 2.1 Ajuste de color (§4.2 del plan), el mismo a las 24

```
eq=saturation=0.92,
colorbalance=rs=0.015:gs=0.004:bs=-0.015:rm=0.008:bm=-0.008,
curves=all='0/0.016 0.5/0.5 1/1'
```

Saturación −8 %, temperatura levemente cálida (rojos arriba, azules abajo) y
negros levantados 4/255: literalmente lo que pide el plan. Ningún tinte morado
ni lima sobre las fotos, como el plan prohíbe.

**Una excepción, la que ya recomendaba `informe_descarga.md` §5:**
`tienda/arnes-talla-m` y `tienda/mordedor-caucho` eran claramente más oscuras
que las otras seis de la rejilla y llevan una curva con más levantamiento de
sombras (`curves=all='0/0.045 0.35/0.41 1/1'`). Mirado en la rejilla de 8:
dejan de destacar y siguen leyéndose como interiores cálidos, no como otra
estética.

---

## 3. Calidad: por qué 80

Se probaron **siete** valores (62, 70, 76, 80, 84, 90, 95) sobre cuatro fotos
representativas —pelo fino, foto grande de blog, foto oscura y fondo plano
propenso a bandeado—, **a resolución final real** y con el mismo ajuste de
color. Bytes medidos y SSIM contra el PNG sin pérdida del mismo recorte:

| calidad | `galeria/bruno` 800w | `blog/demo-1` 1600w | `tienda/mordedor` 800w (oscura) | `blog/demo-4` 1600w (fondo plano) |
|---|---|---|---|---|
| 62 | 14 352 B · SSIM 0,9673 | 91 872 B · 0,9499 | 21 860 B · 0,9764 | 16 336 B · 0,9933 |
| 70 | 16 442 B · 0,9703 | 108 670 B · 0,9568 | 24 280 B · 0,9792 | 17 984 B · 0,9938 |
| 76 | 18 162 B · 0,9728 | 122 392 B · 0,9613 | 26 894 B · 0,9815 | 19 566 B · 0,9943 |
| **80** | **22 808 B · 0,9764** | **154 632 B · 0,9695** | **31 880 B · 0,9848** | **23 104 B · 0,9950** |
| 84 | 27 462 B · 0,9794 | 193 244 B · 0,9770 | 38 490 B · 0,9882 | 27 996 B · 0,9956 |
| 90 | 44 626 B · 0,9857 | 284 800 B · 0,9880 | 54 442 B · 0,9922 | 43 664 B · 0,9969 |
| 95 | 88 572 B · 0,9931 | 407 312 B · 0,9940 | 82 494 B · 0,9958 | 66 390 B · 0,9980 |

**Lo que se vio al mirarlo a 1:1** (`_proceso_webp/evidencia-calidad-bruno.png`
y `evidencia-calidad-blog.png`, ambas con 70 · 76 · 80 · 84 · 90 en fila):

- **70 y 76 pierden pelo.** En el pecho del galgo y en la oreja del perro del
  blog los mechones finos se emplastan, y en el tejido azul de `demo-1` asoma
  bloqueo. Es visible sin esfuerzo.
- **80 los recupera.** Es donde el detalle fino vuelve.
- **84 no se distingue de 80** por más que se mire, y cuesta **+20 %** de bytes
  (bruno 22 808 → 27 462; demo-1 154 632 → 193 244, **+25 %**).
- **90 y 95 no aportan nada visible** y cuestan +96 % y +288 % sobre 80 en
  `bruno`.

**Elegido: `-quality 80`, uniforme para toda la escalera de anchos.** Se
comprobó también en la variante de 400w (bruno: q74 → 6 364 B, q80 → 8 222 B,
q86 → 10 642 B): a 400w, q74 emplasta el fleco de la oreja y q86 es
indistinguible de q80. No hace falta una tabla de calidad por ancho.

Codificador: `ffmpeg -c:v libwebp -preset picture -compression_level 6
-quality 80`, escalado con `flags=lanczos`. Es la Decisión 34 de
`project-spec.md` (ffmpeg/libwebp, sin añadir `sharp` como dependencia).

**Corrección honesta:** la primera pasada de este experimento se hizo por error
sobre vistas previas de 480 px reescaladas a 800/1600, lo que hacía las fotos
artificialmente blandas y falseaba los bytes. Se repitió entera a resolución
real; los números de arriba son los de la segunda pasada. La conclusión (80) no
cambió; los bytes sí.

---

## 4. Tabla definitiva

### Campañas — 16:9, `srcset` 400/800/1200

| ruta destino en el repo | fichero preparado | dimensiones | bytes | origen |
|---|---|---|---|---|
| `public/img/campanas/vacunaciones-400w.webp` | `material/webp/campanas/vacunaciones-400w.webp` | 400x225 | 6.670 | Pexels 6235238 |
| `public/img/campanas/vacunaciones.webp` | `material/webp/campanas/vacunaciones.webp` | 800x450 | 16.958 | Pexels 6235238 |
| `public/img/campanas/vacunaciones-1200w.webp` | `material/webp/campanas/vacunaciones-1200w.webp` | 1200x675 | 29.918 | Pexels 6235238 |
| `public/img/campanas/chequeo-400w.webp` | `material/webp/campanas/chequeo-400w.webp` | 400x225 | 5.548 | Pexels 6235650 |
| `public/img/campanas/chequeo.webp` | `material/webp/campanas/chequeo.webp` | 800x450 | 14.566 | Pexels 6235650 |
| `public/img/campanas/chequeo-1200w.webp` | `material/webp/campanas/chequeo-1200w.webp` | 1200x675 | 26.334 | Pexels 6235650 |
| `public/img/campanas/odontologia-400w.webp` | `material/webp/campanas/odontologia-400w.webp` | 400x225 | 6.092 | Pexels 6234622 |
| `public/img/campanas/odontologia.webp` | `material/webp/campanas/odontologia.webp` | 800x450 | 13.762 | Pexels 6234622 |
| `public/img/campanas/odontologia-1200w.webp` | `material/webp/campanas/odontologia-1200w.webp` | 1200x675 | 23.048 | Pexels 6234622 |

### Galería — 4:3, `srcset` 400/800

| ruta destino en el repo | fichero preparado | dimensiones | bytes | origen |
|---|---|---|---|---|
| `public/img/galeria/nala-y-coco-400w.webp` | `material/webp/galeria/nala-y-coco-400w.webp` | 400x300 | 14.826 | Pexels 16764535 |
| `public/img/galeria/nala-y-coco.webp` | `material/webp/galeria/nala-y-coco.webp` | 800x600 | 55.828 | Pexels 16764535 |
| `public/img/galeria/bruno-400w.webp` | `material/webp/galeria/bruno-400w.webp` | 400x300 | 8.422 | Pexels 10117515 |
| `public/img/galeria/bruno.webp` | `material/webp/galeria/bruno.webp` | 800x600 | 22.808 | Pexels 10117515 |
| `public/img/galeria/luna-400w.webp` | `material/webp/galeria/luna-400w.webp` | 400x300 | 9.908 | Pexels 16587667 |
| `public/img/galeria/luna.webp` | `material/webp/galeria/luna.webp` | 800x600 | 27.904 | Pexels 16587667 |
| `public/img/galeria/toby-400w.webp` | `material/webp/galeria/toby-400w.webp` | 400x300 | 12.172 | Pexels 20229531 |
| `public/img/galeria/toby.webp` | `material/webp/galeria/toby.webp` | 800x600 | 30.746 | Pexels 20229531 |
| `public/img/galeria/milo-400w.webp` | `material/webp/galeria/milo-400w.webp` | 400x300 | 15.340 | Pexels 33284863 |
| `public/img/galeria/milo.webp` | `material/webp/galeria/milo.webp` | 800x600 | 40.108 | Pexels 33284863 |
| `public/img/galeria/kira-400w.webp` | `material/webp/galeria/kira-400w.webp` | 400x300 | 12.910 | Pexels 8191847 |
| `public/img/galeria/kira.webp` | `material/webp/galeria/kira.webp` | 800x600 | 37.836 | Pexels 8191847 |

### Tienda — 4:3, `srcset` 400/800

| ruta destino en el repo | fichero preparado | dimensiones | bytes | origen |
|---|---|---|---|---|
| `public/img/tienda/pienso-perro-adulto-400w.webp` | `material/webp/tienda/pienso-perro-adulto-400w.webp` | 400x300 | 10.566 | Pexels 8434635 |
| `public/img/tienda/pienso-perro-adulto.webp` | `material/webp/tienda/pienso-perro-adulto.webp` | 800x600 | 26.694 | Pexels 8434635 |
| `public/img/tienda/pienso-gato-esterilizado-400w.webp` | `material/webp/tienda/pienso-gato-esterilizado-400w.webp` | 400x300 | 12.598 | Pexels 16618557 |
| `public/img/tienda/pienso-gato-esterilizado.webp` | `material/webp/tienda/pienso-gato-esterilizado.webp` | 800x600 | 39.294 | Pexels 16618557 |
| `public/img/tienda/arnes-talla-m-400w.webp` | `material/webp/tienda/arnes-talla-m-400w.webp` | 400x300 | 10.332 | Pexels 18741745 |
| `public/img/tienda/arnes-talla-m.webp` | `material/webp/tienda/arnes-talla-m.webp` | 800x600 | 31.048 | Pexels 18741745 |
| `public/img/tienda/correa-2m-400w.webp` | `material/webp/tienda/correa-2m-400w.webp` | 400x300 | 10.640 | Pexels 10875173 |
| `public/img/tienda/correa-2m.webp` | `material/webp/tienda/correa-2m.webp` | 800x600 | 26.266 | Pexels 10875173 |
| `public/img/tienda/cama-talla-m-400w.webp` | `material/webp/tienda/cama-talla-m-400w.webp` | 400x300 | 16.284 | Pexels 19027991 |
| `public/img/tienda/cama-talla-m.webp` | `material/webp/tienda/cama-talla-m.webp` | 800x600 | 48.012 | Pexels 19027991 |
| `public/img/tienda/manta-60x40-400w.webp` | `material/webp/tienda/manta-60x40-400w.webp` | 400x300 | 13.132 | Pexels 230128 |
| `public/img/tienda/manta-60x40.webp` | `material/webp/tienda/manta-60x40.webp` | 800x600 | 39.280 | Pexels 230128 |
| `public/img/tienda/mordedor-caucho-400w.webp` | `material/webp/tienda/mordedor-caucho-400w.webp` | 400x300 | 11.300 | Pexels 30401679 |
| `public/img/tienda/mordedor-caucho.webp` | `material/webp/tienda/mordedor-caucho.webp` | 800x600 | 31.880 | Pexels 30401679 |
| `public/img/tienda/pelota-con-sonido-400w.webp` | `material/webp/tienda/pelota-con-sonido-400w.webp` | 400x300 | 9.696 | Pexels 3860306 |
| `public/img/tienda/pelota-con-sonido.webp` | `material/webp/tienda/pelota-con-sonido.webp` | 800x600 | 40.280 | Pexels 3860306 |

### Blog — 16:9, `srcset` 400/800/1600

| ruta destino en el repo | fichero preparado | dimensiones | bytes | origen |
|---|---|---|---|---|
| `public/img/blog/demo-1-400w.webp` | `material/webp/blog/demo-1-400w.webp` | 400x225 | 11.308 | Pexels 37388025 |
| `public/img/blog/demo-1-800w.webp` | `material/webp/blog/demo-1-800w.webp` | 800x450 | 34.924 | Pexels 37388025 |
| `public/img/blog/demo-1.webp` | `material/webp/blog/demo-1.webp` | 1600x900 | 154.632 | Pexels 37388025 |
| `public/img/blog/demo-2-400w.webp` | `material/webp/blog/demo-2-400w.webp` | 400x225 | 7.644 | Pexels 24877434 |
| `public/img/blog/demo-2-800w.webp` | `material/webp/blog/demo-2-800w.webp` | 800x450 | 22.936 | Pexels 24877434 |
| `public/img/blog/demo-2.webp` | `material/webp/blog/demo-2.webp` | 1600x900 | 84.584 | Pexels 24877434 |
| `public/img/blog/demo-3-400w.webp` | `material/webp/blog/demo-3-400w.webp` | 400x225 | 16.336 | Pexels 20534816 |
| `public/img/blog/demo-3-800w.webp` | `material/webp/blog/demo-3-800w.webp` | 800x450 | 54.380 | Pexels 20534816 |
| `public/img/blog/demo-3.webp` | `material/webp/blog/demo-3.webp` | 1600x900 | 182.830 | Pexels 20534816 |
| `public/img/blog/demo-4-400w.webp` | `material/webp/blog/demo-4-400w.webp` | 400x225 | 3.296 | Pexels 4047150 |
| `public/img/blog/demo-4-800w.webp` | `material/webp/blog/demo-4-800w.webp` | 800x450 | 8.330 | Pexels 4047150 |
| `public/img/blog/demo-4.webp` | `material/webp/blog/demo-4.webp` | 1600x900 | 23.104 | Pexels 4047150 |
| `public/img/blog/demo-5-400w.webp` | `material/webp/blog/demo-5-400w.webp` | 400x225 | 6.770 | Pexels 8539726 |
| `public/img/blog/demo-5-800w.webp` | `material/webp/blog/demo-5-800w.webp` | 800x450 | 16.022 | Pexels 8539726 |
| `public/img/blog/demo-5.webp` | `material/webp/blog/demo-5.webp` | 1600x900 | 40.160 | Pexels 8539726 |
| `public/img/blog/demo-6-400w.webp` | `material/webp/blog/demo-6-400w.webp` | 400x225 | 3.388 | Pexels 6235234 |
| `public/img/blog/demo-6-800w.webp` | `material/webp/blog/demo-6-800w.webp` | 800x450 | 8.940 | Pexels 6235234 |
| `public/img/blog/demo-6.webp` | `material/webp/blog/demo-6.webp` | 1600x900 | 25.346 | Pexels 6235234 |

### Marca — sin variantes, copias literales de `material/marca/`

| ruta destino en el repo | fichero preparado | dimensiones | bytes | origen |
|---|---|---|---|---|
| `public/img/logo-galapavet.webp` | `material/webp/logo-galapavet.webp` | 201x201 | 4.744 | logo real del cliente |
| `public/img/og/galapavet.png` | `material/webp/og/galapavet.png` | 1200x630 | 60.580 | compuesto sobre el logo real |
| `public/favicon.ico` | `material/raiz/favicon.ico` | 16x16 | 15.086 | derivado del logo real |
| `public/favicon-32.png` | `material/raiz/favicon-32.png` | 32x32 | 2.110 | derivado del logo real |
| `public/apple-touch-icon.png` | `material/raiz/apple-touch-icon.png` | 180x180 | 12.990 | derivado del logo real |

### Extras que NO se copian salvo decisión explícita

| ruta destino en el repo | fichero preparado | dimensiones | bytes | origen |
|---|---|---|---|---|
| `public/img/hero/fondo-960w.webp` | `material/opcional/hero/fondo-960w.webp` | 960x540 | 38.966 | Pexels 1108099 |
| `public/img/hero/fondo.webp` | `material/opcional/hero/fondo.webp` | 1920x1080 | 114.606 | Pexels 1108099 |
| `opcional/galapavet-og-reserva.webp` | `material/opcional/galapavet-og-reserva.webp` | 1200x630 | 35.598 | reserva WebP del OG |
| `opcional/favicon-16.png` | `material/opcional/favicon-16.png` | 16x16 | 798 | derivado del logo real |

Notas sobre la tabla:

- `favicon.ico` figura como `16x16` porque `ffprobe` reporta la **primera**
  entrada del contenedor. El fichero contiene **tres** imágenes (16+32+48),
  verificadas por parseo del `ICONDIR` en `informe_marca.md` §6. Por eso el
  `<link>` debe declarar `sizes="16x16 32x32 48x48"`.
- Los bytes usan punto como separador de millares.
- Ninguna ruta de destino contiene la cadena `pexels`, a propósito
  (`plan_imagenes.md` §6.3: `PaginaTienda.test.tsx:167-181` y
  `PaginaBlog.test.tsx:566-581` revientan si aparece). Los nombres son los que
  ya están en `src/data/*.ts`: **no hay que renombrar nada**.

---

## 5. Presupuesto de peso

### 5.1 Totales

| Carpeta | Ficheros | Bytes | kB |
|---|---|---|---|
| `public/img/campanas/` | 9 | 142 896 | 142,9 |
| `public/img/galeria/` | 12 | 288 808 | 288,8 |
| `public/img/tienda/` | 16 | 377 302 | 377,3 |
| `public/img/blog/` | 18 | 704 930 | 704,9 |
| `public/img/og/galapavet.png` | 1 | 60 580 | 60,6 |
| `public/img/logo-galapavet.webp` | 1 | 4 744 | 4,7 |
| **`public/img/` total** | **57** | **1 579 260** | **1 579,3** |
| `public/favicon.ico` + `favicon-32.png` + `apple-touch-icon.png` | 3 | 30 186 | 30,2 |
| **TOTAL a versionar** | **60** | **1 609 446** | **1 609,4 kB (1,53 MiB)** |

**Muy por debajo de lo que estimaba el plan** (§2.3: «Total esperado ≈ 3,5-4,5
MB»). La diferencia tiene dos causas medibles: (a) el plan presupuestaba topes
por variante (≤90 kB para 800w, ≤220 kB para 1600w) y los ficheros reales
quedan bastante por debajo; (b) el plan contaba un fichero duplicado sin sufijo
por hueco, que aquí no existe (§1). **No hay que apretar nada.**

### 5.2 Peso de imagen por página, contra el bundle

Bundle actual medido por el encargo: **JS 278,93 kB + CSS 11,45 kB = 290,4 kB**.

Qué imágenes pide cada página, leído del código:
portada = `CampanasPortada` (3) + `Galeria` (6) + logo del pie
(`App.tsx:52-64` monta `Cabecera` y `PieDePagina` en todas las rutas);
`/campanas` = 3 + logo; `/tienda` = 8 + logo; `/blog` (listado) = solo el logo
(`PaginaBlog.test.tsx:164` fija cero imágenes en el listado);
`/blog/:id` = 1 grande + 2 miniaturas + logo.

| Página | Móvil 1× (variantes 400w) | Por defecto (800w) | Peor caso (mayor variante) |
|---|---|---|---|
| **Portada** (9 fotos + logo) | 96,6 kB | 265,3 kB | **299,3 kB** |
| **Tienda** (8 fotos + logo) | 99,3 kB | 287,5 kB | **287,5 kB** (no hay variante mayor) |
| **Blog, artículo** (peor artículo: `demo-3`) | 78,1 kB | — | **206,5 kB** |
| **Campañas** (3 fotos + logo) | 23,1 kB | 50,0 kB | **84,0 kB** |
| **Blog, listado** | 4,7 kB | 4,7 kB | **4,7 kB** |

**Juicio: es razonable, no hay que apretar.** En su peor caso la portada pide
299 kB de imagen frente a 290 kB de bundle — aproximadamente lo mismo. Pero no
son bytes equivalentes: el JS es **render-blocking** y se paga entero en cada
visita nueva; estas nueve fotos son **descargas paralelas, no bloqueantes,
cacheables e inmutables**, y las seis de la galería están bajo el pliegue
(`Galeria` va después de `Servicios`, `CampanasPortada`, `Equipo` y
`ReservaChat` en `Landing.tsx:48-70`), así que con `loading="lazy"` en las de
la galería el coste inicial real de la portada baja a ~60 kB. Como referencia
de orden de magnitud, 33 kB de media por fotografía es un valor bajo para una
foto de 800×600.

**Lo que sí conviene hacer, y es gratis:** `loading="lazy"` +
`decoding="async"` en galería, tienda y miniaturas del blog; y **NO** ponerlo
en la imagen grande del artículo del blog ni en las tarjetas de campañas de la
portada si quedan sobre el pliegue.

### 5.3 Techo por página propuesto para el escenario de la feature 22

Redactado para que sea comprobable **sin navegador**, sumando el tamaño en
disco de los ficheros que cada página puede llegar a pedir. Cada techo deja
entre un 15 % y un 45 % de margen sobre lo medido hoy, de modo que no salta por
una revisión de calidad, pero sí salta si alguien suelta un JPEG de 2 MB.

| Regla | Techo propuesto | Medido hoy | Margen |
|---|---|---|---|
| Ningún fichero suelto de `public/img/` | **≤ 200 kB** | 182,8 kB (`blog/demo-3.webp`) | 9 % |
| Suma de `public/img/` completo | **≤ 2 000 kB** | 1 579,3 kB | 27 % |
| Portada (3 campañas + 6 galería + logo, mayor variante de cada una) | **≤ 350 kB** | 299,3 kB | 17 % |
| Tienda (8 productos + logo) | **≤ 320 kB** | 287,5 kB | 11 % |
| Artículo de blog (1 grande 1600w + 2 miniaturas 400w + logo) | **≤ 250 kB** | 206,5 kB | 21 % |
| Página de campañas (3 + logo) | **≤ 120 kB** | 84,0 kB | 43 % |
| Listado de blog (solo logo) | **≤ 20 kB** | 4,7 kB | — |

Redacción sugerida del escenario, en el estilo del resto del contrato:

```gherkin
Escenario: el peso de las imágenes de cada página tiene un techo
  Dado el conjunto de ficheros de imagen que sirve el sitio
  Entonces ningún fichero de "public/img" supera los 200 kB
  Y la suma de todos los ficheros de "public/img" no supera los 2000 kB
  Y la suma de las imágenes que puede pedir la portada no supera los 350 kB
  Y la suma de las imágenes que puede pedir la tienda no supera los 320 kB
  Y la suma de las imágenes que puede pedir un artículo del blog no supera los 250 kB
  Y la suma de las imágenes que puede pedir la página de campañas no supera los 120 kB
```

---

## 6. Verificación de los 26 huecos, uno por uno

`_proceso_webp/verificar26.sh` recorre la tabla maestra de `plan_imagenes.md`
§1.1 y, para cada hueco, comprueba que el fichero **existe**, que **no pesa 0
bytes** y que **decodifica entero** (no solo su cabecera: se vuelca a
`rawvideo`, que es lo que detecta un fichero truncado).

Resultado: **26 / 26**. Salida completa en §9.

**24 huecos quedan cubiertos con su ruta exacta. Dos no, y ya estaba previsto:**

| # | Hueco declarado hoy | Qué se entrega | Qué cambio hace falta, y quién lo hace |
|---|---|---|---|
| 1 | `/favicon.svg` (`index.html:6`) | `favicon.ico` (16+32+48), `favicon-32.png`, `apple-touch-icon.png` (180×180, sin alfa) | **No se puede derivar un SVG fiel de un raster de 201 px** (`informe_marca.md` §3.1). Es el «camino B» del plan §3.3: sustituir el `<link>` de `index.html` por el bloque de `informe_marca.md` §3.3, dejando **comentada** la línea del vector hasta que llegue. `index.html` está fuera de `src/` ⇒ lo hace el `craftsman_lead`. |
| 2 | `/img/og/galapavet.webp` (`MetadatosPagina.tsx:18`) | `galapavet.png` (1200×630) | La documentación oficial de Meta **no enumera formatos aceptados** ⇒ que WebP funcione como `og:image` queda **NO VERIFICADO**; el contrato ya exige PNG (`identidad_visual.feature:686`). Cambiar `.webp` → `.png` en `MetadatosPagina.tsx:18` es código de `src/` ⇒ lo hace el `tdd_craftsman` por TDD. `MetadatosPagina.test.tsx:82-83` sigue pasando: solo exige ruta relativa, la extensión le da igual. |

---

## 7. Verificación final: que ninguno sea un `.webp` de 0 bytes

Un fichero vacío pasa cualquier comprobación de existencia y sigue dando
`naturalWidth === 0` en el navegador, que es **exactamente** el fallo que se
está arreglando. Por eso se comprobó por tres vías independientes:

1. **Decodificación completa con `ffmpeg`** de los 64 ficheros producidos
   (los 60 entregables + los 4 opcionales), volcando a `rawvideo`:
   **64 / 64 correctos, 0 fallos, 0 ficheros a 0 bytes.** El entregable más
   pequeño es `favicon-32.png` con 2 110 B; la fotografía más pequeña,
   `blog/demo-4-400w.webp` con 3 296 B; la mayor, `blog/demo-3.webp` con
   182 830 B.
2. **Navegador real.** Se sirvieron los 64 por HTTP con su `content-type`
   correcto (`_proceso_webp/servidor.mjs`) y se cargaron todos como `<img>` en
   **Chrome headless
   (`--headless=new`)**, midiendo `naturalWidth`/`naturalHeight` tras
   `window.onload`:

   ```
   total=64 rotos=0 :: TODAS DECODIFICAN
   ```

   Es la misma comprobación que hoy falla en la web (`naturalWidth === 0`), y
   aquí pasa. *(Detalle operativo: el `.ico` se sirvió en `/raiz/favicon.ico`,
   no en `/favicon.ico`. `informe_marca.md` §6 documenta que Chrome devuelve
   `naturalWidth === 0` para un `<img src="/favicon.ico">` aunque el fichero
   sea válido, porque trata esa ruta por su vía especial de icono de pestaña:
   la prueba de `@s28` debe mirar el **código de estado**, no `naturalWidth`.)*
3. **Mirando las imágenes.** Se abrieron y se miraron los 26 destinos
   decodificados **desde el `.webp`/`.png` entregado**, montados en la misma
   rejilla en la que van a aparecer, más el OG a 800×420 y cuatro variantes de
   400w a tamaño nativo. Hojas en `_proceso_webp/evidencia-final-*.png` y
   `evidencia-og.png`. No hay ninguna imagen negra, gris, partida ni con
   artefactos visibles.

### 7.1 Discrepancia detectada con el encargo (no bloqueante)

El encargo dice «las **20** `<img>` de la portada tienen `naturalWidth === 0`».
Contando sobre el código de hoy, la portada renderiza **10** `<img>`:
3 de `CampanasPortada.tsx:47` + 6 de `Galeria.tsx:69` + 1 logo de
`PieDePagina.tsx:67` (`App.tsx:52-64` monta el pie en todas las rutas). No
encuentro de dónde salen las otras diez. **No cambia nada de este entregable**
—las 26 rutas del inventario están cubiertas igual—, pero conviene recontar
sobre el navegador antes de escribir la aserción numérica del escenario de la
feature 22.

---

## 8. Lo que NO se copia, y por qué

| Fichero preparado | Por qué queda fuera |
|---|---|
| `opcional/hero/fondo.webp` y `fondo-960w.webp` (1920×1080 y 960×540) | El **hueco del hero no existe en el código**: `Hero.tsx` no renderiza ninguna imagen y ningún fichero lo referencia. Añadirlo es una decisión de la feature 22 (`plan_imagenes.md` §5), no un 404 que arreglar. Se deja hecho por si se aprueba: iría como `background-image` en `Hero.module.scss` —no como `<img>`, para no alterar ningún recuento de imágenes de las pruebas—. **Aviso estético mantenido de `informe_descarga.md` §5:** es un plano abierto muy saturado en verdes que no pertenece a ninguna de las tres familias; **sin un velo de color encima desentonará** con el resto. |
| `opcional/galapavet-og-reserva.webp` (1200×630, 35,6 kB) | Reserva. `identidad_visual.feature:686` **prohíbe** servir WebP como `og:image`. |
| `opcional/favicon-16.png` | El `.ico` ya lleva dentro una imagen de 16 px generada a propósito. Servirlo sería un fichero que nadie declara (`informe_marca.md` §8). |
| `marca/alternativa-recorte/*` | Juego de iconos generado desde un recorte cuadrado de la marca, que a 16 px se lee **mucho** mejor. **No se activa solo**: recortar el logotipo del cliente es una decisión editorial sobre su identidad, no técnica (`informe_marca.md` §7). |
| `originales/`, `candidatos/`, `previews/`, `wk/` | Material de trabajo. No va al repositorio. |

---

## 9. Reproducibilidad

`_proceso_webp/construir.sh` reconstruye **el árbol entero** desde
`originales/` y `marca/` con solo `ffmpeg` y `bash`:

```sh
cd material && bash _proceso_webp/construir.sh
```

Contiene la tabla completa de recortes, offsets y grados de color, así que es
la fuente de verdad de §2. Es determinista.

| Fichero | Para qué |
|---|---|
| `construir.sh` | la cadena completa: recorte + grado + escalado + WebP q80 |
| `crop.sh` | ayudante de recorte a relación de aspecto sin escalar hacia arriba |
| `verificar26.sh` | comprueba los 26 huecos: existe, no vacío, decodifica |
| `servidor.mjs` | servidor HTTP mínimo para la prueba de navegador de §7 |
| `evidencia-calidad-bruno.png` · `evidencia-calidad-blog.png` | q70·76·80·84·90 a 1:1, en fila |
| `evidencia-final-16-9.png` · `-galeria.png` · `-tienda.png` · `evidencia-og.png` | los 26 destinos, decodificados del entregable |
| `../prueba-navegador.html` | la página que carga los 64 ficheros y mide `naturalWidth` |

Herramientas usadas, todas ya presentes en esta máquina: `ffmpeg` 8.1.1 con
`libwebp`, `node` v22.15.0 y Google Chrome (`--headless=new`). **`magick` no
está instalado y no ha hecho falta.**

Salida íntegra de `verificar26.sh`:

```
OK SUSTITUIDO /favicon.svg                              raiz/favicon.ico                          16x16       15086 B
OK SUSTITUIDO /img/og/galapavet.webp                    webp/og/galapavet.png                     1200x630    60580 B
OK EXACTO     /img/logo-galapavet.webp                  webp/logo-galapavet.webp                  201x201      4744 B
OK EXACTO     /img/campanas/vacunaciones.webp           webp/campanas/vacunaciones.webp           800x450     16958 B
OK EXACTO     /img/campanas/chequeo.webp                webp/campanas/chequeo.webp                800x450     14566 B
OK EXACTO     /img/campanas/odontologia.webp            webp/campanas/odontologia.webp            800x450     13762 B
OK EXACTO     /img/galeria/nala-y-coco.webp             webp/galeria/nala-y-coco.webp             800x600     55828 B
OK EXACTO     /img/galeria/bruno.webp                   webp/galeria/bruno.webp                   800x600     22808 B
OK EXACTO     /img/galeria/luna.webp                    webp/galeria/luna.webp                    800x600     27904 B
OK EXACTO     /img/galeria/toby.webp                    webp/galeria/toby.webp                    800x600     30746 B
OK EXACTO     /img/galeria/milo.webp                    webp/galeria/milo.webp                    800x600     40108 B
OK EXACTO     /img/galeria/kira.webp                    webp/galeria/kira.webp                    800x600     37836 B
OK EXACTO     /img/blog/demo-1.webp                     webp/blog/demo-1.webp                     1600x900   154632 B
OK EXACTO     /img/blog/demo-2.webp                     webp/blog/demo-2.webp                     1600x900    84584 B
OK EXACTO     /img/blog/demo-3.webp                     webp/blog/demo-3.webp                     1600x900   182830 B
OK EXACTO     /img/blog/demo-4.webp                     webp/blog/demo-4.webp                     1600x900    23104 B
OK EXACTO     /img/blog/demo-5.webp                     webp/blog/demo-5.webp                     1600x900    40160 B
OK EXACTO     /img/blog/demo-6.webp                     webp/blog/demo-6.webp                     1600x900    25346 B
OK EXACTO     /img/tienda/pienso-perro-adulto.webp      webp/tienda/pienso-perro-adulto.webp      800x600     26694 B
OK EXACTO     /img/tienda/pienso-gato-esterilizado.webp webp/tienda/pienso-gato-esterilizado.webp 800x600     39294 B
OK EXACTO     /img/tienda/arnes-talla-m.webp            webp/tienda/arnes-talla-m.webp            800x600     31048 B
OK EXACTO     /img/tienda/correa-2m.webp                webp/tienda/correa-2m.webp                800x600     26266 B
OK EXACTO     /img/tienda/cama-talla-m.webp             webp/tienda/cama-talla-m.webp             800x600     48012 B
OK EXACTO     /img/tienda/manta-60x40.webp              webp/tienda/manta-60x40.webp              800x600     39280 B
OK EXACTO     /img/tienda/mordedor-caucho.webp          webp/tienda/mordedor-caucho.webp          800x600     31880 B
OK EXACTO     /img/tienda/pelota-con-sonido.webp        webp/tienda/pelota-con-sonido.webp        800x600     40280 B
== 26 / 26 huecos con fichero preparado, no vacio y decodificable ==
```

---

## 10. Lo que sigue pendiente de material real del cliente

Nada de lo de abajo lo puede resolver el arnés. Ordenado por urgencia, siguiendo
`plan_imagenes.md` §7 y `informe_marca.md` §12.

### 10.1 Bloqueante antes de publicar

1. **Las 6 fotografías de la galería — URGENTE.** Van rotuladas con nombre
   propio y episodio clínico («Bruno · Alta tras cirugía de rodilla»). Una foto
   de banco ahí pone la mascota de un desconocido bajo una historia clínica
   inventada, atribuida a una clínica real. Además, las fotos reales de
   pacientes exigen el **consentimiento expreso y documentado de cada familia**,
   que hoy no consta (`src/data/galeria.ts:2-8`). Sustituir con fotos cedidas y
   consentidas, o **retirar la sección entera** —que es una decisión
   perfectamente válida—.
2. **Las 3 de campañas — ALTA.** Se leen como «así trabajamos nosotros» y
   muestran una consulta y un profesional identificable que no son los de
   Galapagar. Sustituir a la vez que se confirmen las campañas reales (precio,
   vigencia y condiciones también están pendientes, `src/data/campanas.ts:1-16`).
3. **El vector del logotipo** (`.svg` / `.ai` / `.pdf`). Es lo que arregla el
   favicon de verdad. Hoy, con solo 201 px de raster: **a 16 px la marca es
   ilegible** —ocupa ≈9,7 × 8,8 px y se ve como una mancha de dos colores
   (`informe_marca.md` §7)—, no se puede generar el icono de 512 px de una
   futura PWA, y el borde llega con artefactos de compresión. Pedirlo a quien
   hizo la marca.
4. **Decisión humana sobre `marca/alternativa-recorte/`**: si se acepta recortar
   la marca para los iconos pequeños mientras no llegue el vector. Mejora real
   (la marca crece 1,55×), pero es una decisión sobre la identidad del cliente.

### 10.2 Se sustituye cuando llegue el contenido real

5. **Fondo del hero (si se añade) — MEDIA.** Ambiente. Mantener un **exterior**
   mientras no haya fotos propias: un interior de clínica se lee como «nuestras
   instalaciones».
6. **Las 6 del blog — MEDIA.** Ilustran artículos ya rotulados como «Artículo de
   demostración». Se sustituyen con el texto editorial real, que además necesita
   revisión veterinaria (`features/pagina_blog.feature:137-139`).
7. **Las 8 de la tienda — BAJA.** Objetos genéricos; los nombres de producto ya
   dicen «de ejemplo». Se sustituyen cuando exista catálogo real.
8. **La imagen Open Graph — ya resuelta de raíz.** No lleva foto de banco: se
   compone con el logo real sobre el morado de marca. Mejorable a futuro con una
   foto real de la fachada, pero **hoy no miente**.

### 10.3 Decisiones y avisos técnicos que hay que llevar a la conversación de spec

- **La tipografía del OG.** Usa Segoe UI porque el proyecto no declara ninguna
  familia (`grep -rn "font-family" src/` → cero coincidencias). Cuando la
  feature fije la tipografía del sitio, **hay que regenerar el OG con ella**
  (`informe_marca.md` §2.1).
- **`og:image` relativo contra el estándar.** `MetadatosPagina.test.tsx:82-83`
  exige ruta relativa; `https://ogp.me/` exige URL absoluta. Contradicción real
  entre contrato y estándar: hoy la imagen de compartición probablemente no se
  resuelve en ningún rastreador. **No se arregla a escondidas.**
- **NO VERIFICADO**, y no se puede verificar desde aquí: que los rastreadores de
  Meta/WhatsApp/LinkedIn acepten el OG (requiere publicar en un dominio real y
  pasarlo por el depurador de cada red); que el icono se **pinte** bien en la
  pestaña de un navegador de escritorio y el `apple-touch-icon` en la pantalla
  de inicio de un iPhone (se verificó la decodificación, no el pintado).

### 10.4 Lo que NO hay que «arreglar», y es deliberado

- **La sección de equipo no tiene ninguna fotografía.** Galapavet publica dos
  profesionales reales (`src/data/equipo.ts:14-24`) y no ha cedido retratos.
  Poner caras de banco junto a los nombres de dos personas reales sería
  suplantación de identidad, y el contrato lo impide por prueba
  (`src/components/Equipo.test.tsx:184`). **La ausencia de retratos es la
  conducta correcta, no un hueco pendiente.**
- **Los avisos de demostración en pantalla no se quitan** hasta que llegue el
  material real (`Galeria.tsx:51-55`, `CampanasPortada.tsx:38-42`, y los de
  tienda y blog). Son lo que evita que una foto de banco se lea como una
  afirmación sobre el negocio.
- **El `alt=""` del logo del pie sigue vacío.** `PieDePagina.test.tsx:28`
  comprueba `queryAllByRole('img')` = 0 en el pie; una imagen con `alt=""` no
  expone rol `img`, así que la prueba pasa **con** el logo puesto. Cambiarlo a
  un texto rompería la prueba y duplicaría el nombre accesible que ya da el
  texto contiguo.

### 10.5 Consecuencias en `src/` que este material obliga (las hace el `tdd_craftsman`)

Cuatro de los seis `textoAlternativoImagen` del blog describen hoy algo que no
está en la imagen elegida. **El orden correcto es elegir la foto y después
ajustar el `alt`**, nunca al revés (`plan_imagenes.md` §4.3):

| Dato | `alt` actual | Propuesto | Motivo |
|---|---|---|---|
| `demo-1` (`blog.ts:61`) | «…sobre una manta **en una sala de consulta**.» | «Fotografía de un perro tumbado sobre una cama con mantas.» | La foto es un interior doméstico, no una consulta. |
| `demo-2` (`:76`) | «…un gato sentado junto a una ventana.» | **sin cambios** | Con el recorte `y=350` la foto lo muestra literalmente. |
| `demo-3` (`:87`) | «…con una pelota **en un jardín**.» | «Fotografía de un cachorro con una pelota sobre la hierba.» | Se ve hierba; que sea un jardín es una suposición. |
| `demo-4` (`:100`) | «**un tubo** de muestra sobre **una mesa de laboratorio**.» | «Fotografía de dos tubos de muestra sobre un fondo claro.» | Son **dos** tubos —los dos entran enteros con `y=900`— y el fondo es liso. |
| `demo-5` (`:113`) | «…un microscopio sobre una mesa de trabajo.» | **sin cambios** | Encaja tal cual. |
| `demo-6` (`:124`) | «**una radiografía sobre una pantalla iluminada**.» | «Fotografía de un equipo de ecografía sobre una mesa en una sala de consulta.» | No hay ninguna radiografía en la foto. |

Y el cambio de extensión del OG: `MetadatosPagina.tsx:18`,
`'/img/og/galapavet.webp'` → `'/img/og/galapavet.png'`.
