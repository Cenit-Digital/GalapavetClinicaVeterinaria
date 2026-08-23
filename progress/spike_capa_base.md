# Spike — la capa base (23/08/2026)

> **Qué es esto.** Un *spike* en el sentido de Uncle Bob: un experimento
> desechable, hecho fuera del pipeline, cuyo único fin es responder a una
> pregunta. La pregunta era: **¿cuánto de la fealdad actual se debe a la
> ausencia de capa base, y no a la ausencia de diseño de componente?**
>
> **Este fichero NO es código de producción y no se copia tal cual.** Nada de
> lo que hay aquí ha pasado por un test rojo. Es material de partida para el
> `tdd_craftsman` de la feature 22 (`identidad_visual`), que tendrá que
> reconstruirlo por TDD estricto contra `features/identidad_visual.feature`.

## Método

1. `pnpm run build` → `vite preview` sobre el `dist/` de producción real (no el
   dev server).
2. Inspección del DOM y del CSS computado con navegador real.
3. Inyección de una hoja de estilos en la página viva vía la consola, sin tocar
   ni un fichero del repositorio.
4. Captura antes y después.

## Punto de partida medido (antes del spike)

| Medición | Valor real |
| --- | --- |
| `font-family` en todo el CSS generado | 0 apariciones |
| Reglas para `html` o `body` | 0 |
| `getComputedStyle(body).fontFamily` | `"Times New Roman"` |
| `getComputedStyle(body).backgroundColor` | `rgba(0, 0, 0, 0)` |
| `getComputedStyle(body).margin` | `8px` (el del navegador) |
| Reglas CSS totales del sitio | 124 |
| Roles de color declarados | 3 |
| Imágenes que cargan | 0 de 20 (`public/` no existe) |

Los tokens **sí** existen y **sí** resuelven: `--color-texto` vale `#77286B` y
el `<h1>` computa a `rgb(119, 40, 107)`. El fallo no es que falten los tokens,
es que **solo hay tres** y que **nada los aplica al documento**.

## Hallazgo 1 — la escala tipográfica no es fluida

`src/styles/_tokens.scss` lo admite en su propio comentario: con un único ratio
(1.25) y una única base (16px) para los dos extremos del viewport,
`base * ratio^paso` da **el mismo valor** en 320px y en 1024px. La Decisión 24
pidió la metodología Utopia, que es fluida por definición; los parámetros que se
le dieron la colapsan a una escala fija. Para que sea fluida de verdad hace
falta un segundo par (base y ratio del extremo máximo), que la Decisión 24 no
fija. **Pendiente para la feature 22.**

## Hallazgo 2 — un botón invisible que ningún test podía ver

El enlace «Reservar» de la cabecera renderizaba como una píldora morada vacía:

```
color:      rgb(119, 40, 107)   // --color-texto
background: rgb(119, 40, 107)   // --primario
ratio de contraste: 1:1
```

Texto morado sobre fondo morado. Invisible. Es el ejemplo perfecto de por qué la
feature 22 necesita Playwright + axe-core: jsdom no computa la cascada de un
elemento pintado, así que **ninguna de las 712 pruebas actuales podía detectarlo**,
ni podría detectarlo ninguna prueba futura escrita con las herramientas de hoy.

## Roles de color propuestos, verificados con la fórmula WCAG real

Calculados con la misma fórmula de `src/lib/contraste.ts`. Control de la
implementación: `#77286B` sobre `#FFFFFF` da **9.13**, que coincide dígito a
dígito con el valor ya fijado en la cabecera de
`features/sistema_de_diseno_visual.feature` (línea 63).

Todos derivados del morado `#77286B` y el lima `#B4C718` de `src/lib/tokens.ts`,
mezclados con blanco o negro puro. Ninguno elegido a ojo.

| Rol | Par (color / fondo) | Ratio | Exigido | Criterio |
| --- | --- | --- | --- | --- |
| `--tinta` (titulares) | `#2B1027` / `#FFFFFF` | 17.41 | 7.0 | 1.4.6 AAA |
| `--texto` (cuerpo) | `#4A3B47` / `#FFFFFF` | 10.46 | 4.5 | 1.4.3 AA |
| `--texto` sobre superficie | `#4A3B47` / `#FAF6F9` | 9.77 | 4.5 | 1.4.3 AA |
| `--apagado` (secundario) | `#6B5A66` / `#FFFFFF` | 6.40 | 4.5 | 1.4.3 AA |
| `--sobre-primario` | `#FFFFFF` / `#77286B` | 9.13 | 4.5 | 1.4.3 AA |
| `--sobre-acento` | `#2B1027` / `#B4C718` | 9.22 | 4.5 | 1.4.3 AA |
| `--borde` | `#D9CBD6` / `#FFFFFF` | 1.56 | 1.5 | decorativo |
| `--borde-fuerte` (controles) | `#9E8398` / `#FFFFFF` | 3.41 | 3.0 | 1.4.11 AA |
| `--color-foco` | `#77286B` / `#FFFFFF` | 9.13 | 3.0 | 1.4.11 AA |
| `--superficie` | `#FAF6F9` / `#FFFFFF` | 1.07 | — | fondo |

**Solo cubren la variante `marca`.** Faltan por derivar y verificar las otras
tres (`lima`, `verde`, `noche`), y `noche` es la delicada: hoy usa negro puro
`#000000`, que además de duro obliga a recalcular todos los roles.

## Lo que el spike SÍ demuestra

Que la mayor parte del salto visual la da la capa base —reset, `font-family`,
`body` consumiendo los tokens, contenedor y ritmo vertical— y no el diseño fino
de cada componente. Son del orden de 100 líneas.

## Lo que el spike NO demuestra ni resuelve

- Las **imágenes siguen sin existir**: `public/` no está creado y las 20 rutas
  siguen dando 404. El spike no las toca.
- Las **fuentes vienen de `fonts.googleapis.com`**, lo que en producción
  **viola la Decisión 9** (peticiones a terceros que filtran la IP del
  visitante). En la implementación real van autoalojadas como `.woff2`.
- Los selectores son de elemento y de atributo (`#root>div[id]>section`,
  `article`, `a[href='#reservar']`) porque desde la consola no se puede tocar el
  nombre de clase con hash de los CSS Modules. La implementación real va en cada
  `<X>.module.scss` co-localizado, como manda `docs/architecture.md`.
- **No hay ni un test detrás.** Ni uno.
- No cubre las 4 variantes de paleta, ni el modo oscuro, ni las 4 páginas
  interiores (blog, tienda, campañas, 404), ni el chat de reserva, ni el
  formulario, ni el acordeón de FAQ, ni la galería.
- No se ha pasado axe-core: es previsible que aparezcan violaciones de
  `target-size` y de foco que el spike no ve.

## Estructura real del DOM (útil para el implementador)

```
#root
├── header._cabecera_          (logo + p descriptivo + nav > ul > li × 8)
├── div#inicio._seccion_       > section._hero_      (p, h1, p, div>a×2, dl)
├── div#servicios._seccion_    > section._servicios_ (h2, article._tarjeta_ × 5)
├── div#... (una por ancla)    > section._<nombre>_
└── footer
```

Las anclas de la Decisión 16 (`#inicio`, `#servicios`, `#equipo`, `#reservar`,
`#galeria`, `#contacto`, `#faq`) están en los `div` contenedores, **no** en los
`<section>`. Conviene saberlo antes de escribir un selector.
