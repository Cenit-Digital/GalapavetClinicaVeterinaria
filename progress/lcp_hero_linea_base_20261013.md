# LCP y CLS del hero — línea base «ANTES» (13/10/2026)

> `craftsman_lead`. Medida de referencia para las features 48 y 49. Es el estado
> del sitio en `ee805ae` / `8f80dbe` (el hero «de hoy»: con píldora, dos botones,
> horario y cifras, cabecera sólida). Tras los cambios hay que **remedir con el
> mismo método** y escribir el resultado en `progress/lcp_hero_despues_<fecha>.md`.

## 1. Método

- Playwright 1.62.1, Chromium headless, sin limitación de red ni de CPU.
- Contexto nuevo por pasada (sin caché), `goto` con `waitUntil: 'networkidle'`,
  espera de 1,5 s y lectura de dos `PerformanceObserver` registrados con
  `addInitScript` y `buffered: true`: `largest-contentful-paint` (se toma el
  ÚLTIMO candidato) y `layout-shift` (suma de los que no llevan `hadRecentInput`).
- 5 pasadas por tamaño y **mediana**.
- Es una medida de laboratorio, no de campo.

## 2. Resultado sobre la web desplegada (`https://cenit-digital.github.io/GalapavetClinicaVeterinaria/`)

| Tamaño | LCP por pasada (ms) | Mediana | Elemento LCP | CLS |
| --- | --- | --- | --- | --- |
| Escritorio 1440×900 | 3156 · 220 · 296 · 220 · 264 | **264 ms** | `IMG` (la foto del hero) | 0 en las 5 |
| Móvil 390×844 | 208 · 300 · 304 · 236 · 236 | **236 ms** | `IMG` | 0 en las 5 |

La primera pasada de escritorio (3156 ms) es **probablemente** un arranque en frío
de la CDN de GitHub Pages (una sola muestra; causa NO verificada). La mediana la
descarta, pero conviene recordar que el LCP de una carga totalmente fría puede ser
mucho mayor.

## 2 bis. Línea base LOCAL (el entorno en el que se medirá el «después»)

Mismo método, sobre el `dist/` actual servido con `vite preview` en `localhost`
(mismo equipo, Chromium headless, sin red real). **Esta es la línea base con la
que se comparan las cifras locales; las de la web desplegada (arriba) NO se
comparan con ellas: son otro entorno.**

| Tamaño | LCP por pasada (ms) | Mediana | Elemento LCP | CLS |
| --- | --- | --- | --- | --- |
| Escritorio 1440×900 | 132 · 136 · 152 · 104 · 96 | **132 ms** | `IMG` | 0 en las 5 |
| Móvil 390×844 | 132 · 112 · 120 · 116 · 132 | **120 ms** | `IMG` | 0 en las 5 |

## 3. Segunda medida independiente (revisor del panel, sobre el `dist/` local servido)

| Tamaño | LCP | Elemento | Área del candidato |
| --- | --- | --- | --- |
| 1440×900 | 116 ms | `IMG` `clinica.webp` | 1 203 840 px² (= 1440 × 836) |
| 375×812 | 92 ms | `IMG` `clinica.webp` | 280 500 px² |

El área 1440 × 836 confirma que **hoy la foto empieza bajo la cabecera** (64 px) y
por eso la spec de LCP (§4.3 paso 7: «si el área visible es igual a la del
viewport, se descarta») no la excluye.

## 4. Qué cambia con la decisión P5 (hero a pantalla completa)

Con la foto cubriendo el viewport entero (cabecera encima), la spec la descarta
como candidata y el LCP pasa al titular o al párrafo. Por eso el contrato vigila
el **tiempo** de LCP y no el elemento:

- mediana de 5 cargas **≤ 2500 ms** (umbral «bueno» oficial de campo, p75,
  https://web.dev/articles/lcp), y
- se muestra el «antes» y el «después» a Pablo, que decide si hay una regresión
  inaceptable. **Ninguna fuente oficial da una tolerancia de regresión**: no se
  inventa un margen.

**CORRECCIÓN (revisión independiente, 13/10/2026).** Este documento decía que el
titular animado cuenta como LCP «en el primer fotograma de su animación, porque su
opacidad pasa a ser mayor que 0». **Es falso en Chromium 151**, medido sobre una
página sintética con la foto real a pantalla completa y una cabecera `fixed` encima
(3 cargas por caso, último candidato): sin animación el candidato H1 llega a
36-80 ms; con animación de opacidad y desplazamiento de 300 ms, a 324-344 ms; de
700 ms, a 724-740 ms; de 1400 ms, a 1428-1440 ms; **con solo desplazamiento (sin
opacidad) de 700 ms, a 32-36 ms**. O sea: el texto con animación de opacidad cuenta
al TERMINAR la animación (duración + retardo + ~30-40 ms), no al empezar. Con el
hero de la 48 (titular a 0 ms, párrafo a +120 ms, 700 ms cada uno) y la foto
descartada por cubrir el viewport (feature 49), el LCP esperado es de **~0,8 s**:
en escritorio el candidato es el **titular** (~770-820 ms; el párrafo no llega a ser
candidato por tamaño) y en móvil el **párrafo** (~860 ms). Frente a la línea base
de HOY: **132 ms** en local (≈ 6 veces) o **264 ms** en la web desplegada (≈ 3
veces); la comparación debe hacerse SIEMPRE dentro del mismo entorno. Sigue muy por
debajo del umbral «bueno» de 2,5 s. (Reproducido por un segundo revisor sobre una
página sintética con la foto real, textos reales y retardos 0/120/240 ms.) Es una consecuencia de animar con
opacidad el elemento que pasa a ser el candidato, y es una decisión de Pablo si la
acepta (la alternativa técnica es animar solo el desplazamiento, sin fundido). En la
48 sola, con el hero empezando a 64 px bajo la cabecera, la foto sigue siendo el
candidato y el LCP no cambia; solo la 49 lo expone.

**Trampa de medición (segundo revisor).** El titular solo se registra como candidato
si la animación TERMINA y se retira del elemento: con `animation-fill-mode: backwards`
(y el estado base ya visible, como exige el contrato) funciona; con `both` o
`forwards` la animación de opacidad queda compuesta y el titular **nunca** llegó a ser
candidato en 2 s (el LCP se quedó en el texto de la cabecera, ~50 ms): la métrica
saldría artificialmente buena. La medición del «después» depende de ese detalle y
debe hacerse con el relleno `backwards`.

## 5. Cómo repetirlo

Las pasadas se hicieron con un script de un solo uso fuera del repositorio
(scratchpad de la sesión): resolver `playwright` con `createRequire` contra el
`package.json` del proyecto, y lanzar 5 contextos por tamaño. La extensión de
Chrome NO sirve para esto: su pestaña corre en segundo plano
(`document.hidden === true`) y Chrome no emite LCP en páginas ocultas.
