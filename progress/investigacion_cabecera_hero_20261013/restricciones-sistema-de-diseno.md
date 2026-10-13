# restricciones-sistema-de-diseno

# Restricciones del sistema de diseño y la arquitectura (cabecera transparente sobre el hero)

Todas las rutas son relativas a la raíz del repositorio. Los valores marcados "medido" salen de `vite dev` en Chromium (Browser pane, `innerWidth` 1024, con scrollbar de 15 px) o de `getComputedStyle`. Los marcados "calculado" salen de la fórmula de `src/lib/contraste.ts:34-72` o de la aritmética de `clamp()`. Los marcados "inferido" salen de leer el código y no los he ejecutado. No he editado nada del repositorio. Apareció `progress/maqueta_cabecera_hero/` sin que yo lo creara.

## Hallazgos que cambian el planteamiento

1. **No existe ninguna animación de aparición que reutilizar. Servicios, Equipo y Galería solo tienen transiciones de estado.**
   - El proyecto está en política de CERO `animation:` y CERO `@keyframes`. Pablo lo decidió el 20/09/2026 (`features/accesibilidad.feature:339-455`, `features/retirada_carteleria_urgencias.feature:63-66`).
   - Comprobado: `grep keyframes dist/assets/*.css` da 0, y en `src/` no hay ningún `@keyframes` ni `animation:`.
   - `accesibilidad-movimiento.test.ts:255-261` exige que el inventario de apariciones animadas sea exactamente 0. Si no, la puerta se pone roja.
   - `features/accesibilidad.feature:503` dice que reintroducir una animación de entrada exige pasar por la puerta humana. Ahí está el escenario @s20, y `:536-546` es @s22, que dice que si se implementan las animaciones de la galería ese escenario es donde vuelven.
   - Excepción: `global.scss:341-342` declara `animation-duration` y `animation-iteration-count` dentro de `reduce`. Eso no cuenta como aparición (`accesibilidad-movimiento.ts:58-66`, test `:300`).
2. **El `fadeInLeft` de 1,25 s del cliente rompe la escala.**
   - La escala solo admite 150 ms y 300 ms con `ease-out`. El techo es 300 ms (`project-spec.md:112`, Decisión 31; `src/lib/diseno/escalaMovimiento.ts:19-20`; `features/identidad_visual.feature:528-537`, @s16).
3. **"Enlaces blancos" no vale en la variante `tech`.**
   - En `tech` el velo del hero es CLARO (`--color-tinta` = #F1F5F9) y el texto del hero es oscuro (`--color-sobre-primario` = #04212B). Lo he comprobado con `getComputedStyle` en las cinco variantes.
   - Un blanco literal da unos 1,0:1 sobre ese velo. Además `puertaLiteralesColor` bloquea cualquier literal de color en los 17 `.module.scss` (`src/lib/puertaLiteralesColor.ts:16-62`, aplicada en `src/lib/diseno/inventarioModulos.test.ts:129-145`).
4. **El inventario de tokens está congelado.**
   - No se puede añadir un token nuevo del tipo `--color-sobre-imagen`: `features/fidelidad_cabecera.feature:437-445` lo llama "CERRADO" y exige otra puerta humana. Hay que usar `--color-sobre-primario` y `color-mix(...)`.
5. **El tamaño de nav del cliente solo cabe en el paso 16 px (paso 0).**
   - 20 px (paso 1) no cabe en 1024 sin comprimir la marca (ver §2).

## 1. Escala de movimiento

### Valores permitidos

- **Duraciones:** `[150, 300]` ms, y `0.01 ms` solo como anulador de `reduce`.
  - Fuente: `escalaMovimiento.ts:19`, `:23`, `:62`. En la tabla de decisiones, 150 ms es para color/borde/fondo y 300 ms para transformaciones y sombras (`project-spec.md:112`).
- **Curva:** única, `ease-out` (`escalaMovimiento.ts:20`).
  - Ninguna puerta lee la curva. `grep cubic-bezier|ease-in` da 0 resultados. Solo la fija el contrato.
- **Duración máxima: 300 ms.**
- **No hay token ni regla para `animation-delay` ni para `animation-fill-mode`.** Las líneas `-delay` quedan fuera del análisis, y un test lo fija (`escalaMovimiento.test.ts:87-93`). Tampoco hay regla de reparto por propiedad como `opacity` (NO ENCONTRADO).
- **Alcance de la puerta de escala:** `global.scss` más los 17 módulos (`escalaMovimiento.test.ts:12-31`). `_api.scss` no entra en esa puerta, pero sí en la de `reduce`.

### Reglas de las puertas

- **Cobertura (`movimientoRespetuoso.ts`)**
  - Toda línea `animation*`/`transition*` (regex `:21`) debe estar anidada en un `@media (prefers-reduced-motion: no-preference)` o en uno `reduce` (`:44`, `:70-83`).
  - El análisis es línea a línea y solo admite una llave por línea. `:46-50` usa `if '{' … else if '}'`, así que `from { opacity: 0 }` en una sola línea desordena la pila. Los `@keyframes` tendrían que escribirse con una llave por línea.
- **Escala (`escalaMovimiento.ts`)**
  - En líneas `animation|transition(-duration)?:` (`:56`) solo mira valores en `ms` (`:58`). Cualquier valor que no sea 150, 300 o 0.01 se marca (`:81`).
  - `animation: x 300ms ease-out 200ms` falla por el 200.
  - `1.25s` NO lo detecta la puerta, pero incumple igualmente el contrato @s16. Es un hueco de la puerta, no una vía.
  - Prohíbe `all` (`:60`).
- **Inventario de apariciones (`accesibilidad-movimiento.ts`)**
  - Cuenta cada línea `animation:` o `animation-name:` (`:66`).
  - Si la hoja contiene en cualquier línea `opacity: 0` o `visibility: hidden` (`:77`, `:100-104`), marca todos los bloques animados de esa hoja como "no visibles sin animación". Un `@keyframes from { opacity: 0; }` normal dispararía esa heurística, que está sesgada a propósito hacia el rojo.
- **Estado base visible:** el estado base en CSS es el estado final visible, y el estado oculto vive solo dentro del ámbito de la animación (`project-spec.md:60-61`, Invariante 4). Bajo `reduce`, la declaración queda fuera por la regla de cobertura.
- **Red de seguridad de `reduce`:** `global.scss:337-343`. Solo pone `animation-duration`, `animation-iteration-count: 1` y `transition-duration` a `0.01ms`. NO anula `animation-delay`.
- **`scroll-behavior: smooth`:** solo dentro de `no-preference` y sobre `html` (`global.scss:320-323`).
- **Desplazamiento del salto de ancla:** `scroll-padding-top` (`global.scss:313`) y `--desplazamiento-al-enfocar` (`:246`) salen de `--altura-cabecera`. Hay que conservar ese token.
- **`project-spec.md:422-423`** deja fuera de alcance de la feature 22 la "animación decorativa nueva más allá de las transiciones funcionales".

### Cómo lo hacen Servicios, Equipo y Galería (transiciones de estado; ninguna es de aparición)

```scss
// Servicios.module.scss:46-56
.tarjeta {
  @include tarjeta;
  @media (prefers-reduced-motion: no-preference) {
    transition: transform 300ms ease-out, box-shadow 300ms ease-out;
  }
  &:hover { transform: translateY(-4px); }
}
// Servicios.module.scss:180-182 — el "+" de cada tarjeta
@media (prefers-reduced-motion: no-preference) { transition: transform 300ms ease-out; }
// Servicios.module.scss:185-187 — &[aria-expanded='true']::after { transform: rotate(45deg); }

// Equipo.module.scss:148-153 (botón de despliegue; estado en [aria-expanded], :155-159)
@media (prefers-reduced-motion: no-preference) {
  transition:
    transform 300ms ease-out,
    background-color 150ms ease-out,
    color 150ms ease-out;
}

// Galeria.module.scss:66-68 (controles) y :164-166 (pista)
@media (prefers-reduced-motion: no-preference) { transition: border-color 150ms ease-out; }
@media (prefers-reduced-motion: no-preference) { scroll-behavior: smooth; }
```

- Los mixins compartidos siguen el mismo patrón: `_api.scss:180-182` (tarjeta), `:234-236` (botón primario), `:264-266` (botón fantasma), `:307-312` (píldora de filtro).
- También `Cabecera.module.scss:143-145` (enlaces del nav, 150 ms) y `global.scss:320-330` (`body`, 150 ms).
- El estado condicional vive en `aria-expanded`/`aria-pressed`, nunca en una clase (`project-spec.md:62-63`).

### Mecánicamente, para una entrada de carga

- Cualquier `animation:` o `animation-name:` pone en rojo `accesibilidad-movimiento.test.ts:255-261` y exige puerta humana.
- Una `transition` de 150/300 ms dentro de `no-preference` sí pasa las puertas de movimiento. No existe precedente de entrada por transición ni uso de `@starting-style` (`grep` sin resultados). Haría falta un estado inicial oculto (atributo/clase puesto tras montar) que respete el Invariante 4.
- Por transición no se pueden reproducir 1,25 s: el techo es 300 ms.

## 2. Escala tipográfica y espaciado

- Es `$escala-tipografica` en `src/styles/_api.scss:28-37`, función `paso-tipografico` en `:39-41`. Ratio 1,25 sobre base 16 px. El modelo TS está en `src/lib/diseno/escalaTipografica.ts:19-21`, `:59-63`, con el viewport máximo importado como 1024.
- **No es fluida en los pasos -2 a 3**, que son valores fijos. Los pasos 4 y 5 son `clamp()` y no salen de la fórmula.

| Paso | Valor en `_api.scss` | 1440 | 1024 |
|---|---|---|---|
| -2 | 10.24px | 10.24 | 10.24 |
| -1 | 12.8px | 12.8 | 12.8 |
| 0 | 16px | 16 | 16 |
| 1 | 20px | 20 | 20 |
| 2 | 25px | 25 | 25 |
| 3 | 31.25px | 31.25 | 31.25 |
| 4 | clamp(28px, 4.2vw, 46px) | 46 | 43.01 (calculado) |
| 5 | clamp(33px, 6.4vw, 68px) | 68 | 65.54 (calculado) |

- El paso 4 está en 28 px por debajo de unos 667 px y en 46 px por encima de unos 1095 px. El paso 5 está en 33 px por debajo de unos 516 px y en 68 px por encima de unos 1062 px.
- **Discrepancia:** `escalaTipografica.ts:59-63` calcula 39,06 y 48,83 para los pasos 4 y 5. El SCSS usa clamps. El e2e fija 33/68 y 28/46 (`tests/e2e/geometria-escalas.spec.ts:239-242`). `global.scss` todavía cita "~48.83px" como si fuera el paso 5 real.
- El H1 repite el clamp como literal en `src/components/Hero.module.scss:86`. El e2e fija su tamaño: 33 px a 320 y 68 a 1220 (`geometria-escalas.spec.ts:247-254`).
- **El 12,8 px de los enlaces del nav** es `font-size: paso-tipografico(-1)` en `src/components/Cabecera.module.scss:138`, que es 16 × 1,25⁻¹. El Tienda tiene el mismo valor en `:180`, fijado por `src/components/Cabecera.test.tsx:433`.
- **Entre 15 y 20 px solo existe el paso 0 (16 px).** El paso 1 es 20 px.
- Hay precedente de `clamp()` literal fuera de escala: `Hero.module.scss:96` (subtítulo `clamp(16px, 2.2vw, 19.5px)`) y `:191` (cifras). Ninguna puerta global prohíbe un literal de `font-size`.
- **Medido:** nav a 1024 con un `<style>` inyectado en `vite dev`.

| Tamaño del nav | Hueco libre entre marca y nav | Estado |
|---|---|---|
| 12,8 px | 156,2 px | cómodo |
| 16 px | 78,2 px | cabe |
| 17 px | 51,8 px | cabe |
| 18 px | 23,6 px | cabe |
| 19 px | 8 px (la marca se comprime a 244,2) | descriptor truncado |
| 20 px | 8 px (la marca se comprime a 216) | descriptor truncado |

- Con 19-20 px choca con la clásula del descriptor visible de `features/fidelidad_cabecera.feature:154-165` (@s1). También hay que mirar @s2 (ocho enlaces en una sola fila) y @s27 (a 1024 el nav presente y sin solapes; `features/sistema_de_diseno_visual.feature:448-455`).
- 17 y 18 px NO son pasos de la escala. Dentro de la cabecera solo el Tienda está obligado a ser un paso de la escala (`tests/e2e/fidelidad-cabecera.spec.ts:345`).
- El e2e fija además tres tamaños de la cabecera: `header` = 16 (paso 0), `strong` de la marca = 20 (paso 1) y el descriptor = 10,24 (paso -2) (`geometria-escalas.spec.ts:293-320`).
- **Punto de corte único:** `Cabecera.module.scss` solo puede declarar `@media` de anchura en 1024 px. Un `min-width: 1280px` rompe `src/lib/diseno/puntoDeCorte.test.ts:11-17` (@s25). No sirve un tamaño distinto por media query en la cabecera. Se podría usar `clamp()` con `vw` sin media query.
- **Espaciado** (`_api.scss:46-56`): 4, 8, 12, 16, 24, 32, 48, 64, 96.
  - `$ancho-maximo-contenedor: 1220px` (`:133`).
  - `--sangrado-lateral: clamp(16px, 5vw, 24px)` (`global.scss:50`). Vale 24 a 1440 y a 1024, y unos 18,75 a 375.
  - `--altura-cabecera` = 64px (`global.scss:49`).
  - `--ritmo-seccion` = `clamp(72px, 7.2vw, 104px)` (`:51`).
  - Alturas de control: pequeña 40, media 48, grande 56 (`_api.scss:123-125`).
  - El comentario `_api.scss:127-132` iguala 1220 con el punto de corte 1024 y está desfasado.
- La cabecera usa la columna de 1220: `Cabecera.module.scss:27` (`padding-inline`) y `:46` (`max-width`). A 1440 su borde izquierdo está en x=110. @s1 exige que la marca coincida con el contenido de las secciones (`fidelidad_cabecera.feature:154-165`). Un H1 alineado a la izquierda debería usar esa columna.

## 3. Paletas y contraste

- **Cinco variantes:** `clinica` (por defecto), `calida`, `tech`, `eco`, `marca` (`src/lib/diseno/contratoRedisenho.ts:24-26`; nombres en `src/data/variantesPaleta.ts:13-19`).
  - Bloques en `src/styles/_tokens.scss:72, 96, 120, 144, 168`, más un `:root` de respaldo igual a `clinica` en `:49`. No es una sexta variante.
  - Se aplican con `data-variante` en `<html>`: script anti-FOUC en `index.html:47-60` y `SelectorPaleta`.
- **Token de texto claro sobre imagen u oscuro:** `--color-sobre-primario`. `.hero` lo usa en `Hero.module.scss:8` y sobre `--color-tinta`, que es el velo.

| Variante | `--color-tinta` | `--color-sobre-primario` | Velo |
|---|---|---|---|
| clinica | #0B1B33 | #FFFFFF | oscuro |
| calida | #3B2A12 | #FFFFFF | oscuro |
| tech | #F1F5F9 | #04212B | CLARO |
| eco | #06301F | #FFFFFF | oscuro |
| marca | #531C4B | #FFFFFF | oscuro |

  (Líneas de `_tokens.scss` para `sobre-primario`: 61, 85, 109, 133, 157, 195.)

- **Degradado `::after` del hero** (`Hero.module.scss:11-22`): `linear-gradient(180deg, ...)` con `--color-tinta` al 88 % en 0 %, al 76 % en 42 % y al 92 % en 100 %, mediante `color-mix(in srgb, ..., transparent)`.
  - Va con `position:absolute; inset:0; z-index:-1`, la imagen con `z-index:-2` (`:24-33`), y el hero con `isolation:isolate`, `overflow:hidden` y fondo `--color-tinta` (`:6-9`).
  - Medido en el navegador: alfa 0.88/0.76/0.92 en las cinco variantes.
  - Franja de la cabecera (0 a 64 px de un hero de 756): alfa entre 0,88 y unos 0,856 (calculado).
- **Contraste calculado** sobre ese velo, con foto del peor caso (blanca o negra):
  - `--color-sobre-primario`: mínimo 8,46:1 (marca sobre foto blanca) y ≥10,96:1 en `tech`. Es un cálculo propio, no medido sobre la foto real.
  - Fallan sobre el velo: `--color-tinta` (brand, `Cabecera.module.scss:60`) con 1,0 a 2,2; `--color-texto-suave` (descriptor, `:95`) con 1,1 a 3,6; `--color-primario` (`aria-current`, `:152-154`) con 1,0 a 3,2.
  - El anillo de foco global `--color-foco` (`:130` etc.) da 1,0 a 2,1, por debajo de 3:1. Necesita el mismo override que `Hero.module.scss:112-127, 138-142` (`outline-color: var(--color-sobre-primario)`), con la misma salvedad de especificidad (`Hero.module.scss:112-119`).
  - `aria-current` solo aparece en subpáginas: `Cabecera-logica.ts:44-46` descarta los anclas, y el nav no tiene destino `/`.
- **Cómo declara los pares `matrizDeContraste`** (`src/lib/diseno/matrizDeContraste.ts`):
  - `MATRIZ_DE_USO_DEL_SISTEMA` (`:345-390`) es una lista de `{ rol, fondo, uso }` con nombres de rol sin `--color-` (los 18 de `tokensColor.ts:52-71`).
  - `uso` ∈ `'texto normal'` (4,5), `'texto grande'` (3), `'componente de interfaz o borde de foco'` (3) (`contraste.ts:75-87`).
  - Cada fila se resuelve con `evaluarParDeVariante` (`:399-410`) contra las cinco variantes leyendo `_tokens.scss`. El recuento sale en `parejasComprobadas` (`:478`).
  - Hoy son 23 filas y 115 parejas, fijadas en `matrizDeContraste.test.ts:518, 535, 581, 603`.
- **Añadir «enlace del nav blanco sobre el hero»:**
  - La pareja natural es `{ rol: 'sobre-primario', fondo: 'tinta', uso: 'texto normal' }`. No existe una fila con ese uso (NO ENCONTRADO).
  - **Choca con una fila existente:** `sobre-primario`/`tinta` ya está en `matrizDeContraste.ts:388` con el uso de foco. El test `:534-535` calcula la clave sin el uso, así que añadir la fila rompe el `Set` de 23, y también `:518` y `:581/:603`.
  - Vías: (a) cambiar el `uso` de la fila existente a `'texto normal'` (4,5 ≥ 3, manteniendo 23/115; habría que ajustar `:519-523`); (b) añadir una fila nueva (24/120), cambiando cuatro asserts y las notas de `features/rediseno_visual.feature`. Esos cambios de recuento se trataron como puerta humana (`features/rediseno_visual.feature:249, 387`).
  - La matriz compara tokens opacos. No modela el velo translúcido ni la foto.
  - `ejecutarPuertaDeReconciliacionDeMatriz` solo lee `background-color: var(--color-*)` (`:508-509`). El velo es `background: linear-gradient` en `::after`, así que no lo ve.
- **Puntos ciegos en e2e:** @s38/@s39 hallan el fondo subiendo por `parentElement`/`elementFromPoint` (`tests/e2e/accesibilidad.spec.ts:119-130`, `:181-197`) y el hero no es ancestro de la cabecera. Una cabecera 100 % transparente se mediría contra `--color-fondo`. Con anillo `--color-foco` podría dar un falso pase. Con anillo `--color-sobre-primario` daría un falso fallo. Inferido, no ejecutado.

## 4. Rutas, renderizado y medición de ancho

- **Una única `<Cabecera>`** en el shell, fuera de `<Routes>` (`src/App.tsx:55`, `:56-66`). Se muestra en las seis rutas del inventario: `/`, `/campanas`, `/campanas?campana=…`, `/blog`, `/blog/:id`, `/tienda`, más el catch-all 404 (`PaginaNoEncontrada`). Solo recibe `ancho` y `rutaActual` (`:48`, `:55`).
- **Solo `/` tiene hero con imagen.** El resto no tiene imagen detrás:
  - Cada `<main>` va con `@include contenedor` y `padding-block` de 64 px (`PaginaBlog.module.scss:1-3`, `PaginaCampanas.module.scss:1-3`, `PaginaTienda.module.scss:1-3`; 96 px en `PaginaNoEncontrada.module.scss:1-3`).
  - Su fondo es `--color-fondo` del `body`.
  - Dependen del hueco de `#root`: `padding-block-start: var(--altura-cabecera)` (`global.scss:146-152`).
- **Con la cabecera sobre el hero, en el resto de rutas debería seguir sólida.** Un enlace claro sobre `--color-fondo` claro es ilegible.
  - En `/`, al hacer scroll por encima de secciones claras ocurre lo mismo.
  - Eso exige estado por ruta y por scroll, que no existe hoy.
- **CSR puro, sin SSG ni prerender.**
  - `ReactDOM.createRoot(...).render(<App />)` (`src/main.tsx:21-23`).
  - `dist/index.html:66` solo trae `<div id="root"></div>`. Sin JS hay página en blanco.
  - El build no tiene paso de prerender (`package.json:12`). Lo declara `features/sistema_de_diseno_visual.feature:105`.
  - Solo hay un script inline antes del primer pintado: la variante de paleta (`index.html:23-61`). Despliegue en GitHub Pages con subpath `/GalapavetClinicaVeterinaria/` y `public/404.html` (técnica SPA).
  - No hay `<link rel="preload">` de la imagen del hero; solo de las dos fuentes (`index.html:20-21`). La animación de carga arranca tras el JS, y también la imagen.
- **Dónde se calcula `ancho`:** `useAnchoDeVentana` en `App.tsx:22-35` (valor inicial `ANCHO_ANTES_DE_MEDIR = 0` en `:19`; `resize` en `:30`).
  - `esMovil` en `Cabecera-logica.ts:18-23`, con `PUNTO_DE_CORTE_NAVEGACION_PX = 1024` en `:11`. Con ancho no medible cae a móvil.
  - Gemelo CSS en `Cabecera.module.scss:116` y `:237`.
  - Inferido: en escritorio el primer render es la rama móvil (hamburguesa) y luego cambia a nav. No lo he medido.
- **Scroll listener o IntersectionObserver en producción:** NO ENCONTRADO.
  - Solo hay lecturas puntuales de `window.scrollY` al hacer clic (`Cabecera.tsx:88`) y `matchMedia`.
  - En jsdom `IntersectionObserver` y `ResizeObserver` son stubs inertes (`src/test/setup.ts:52-67`). Un `console.error`/`warn` pone el test en rojo (`:89-113`).
- **Reglas que condicionan la implementación**
  - La lógica de decisión debe vivir en módulos puros `*-logica.ts` o `src/lib/**` (`project-spec.md:63-64`).
  - Esos módulos están bajo Stryker con umbral 100 % (`stryker.config.json:21-32`, `harness.config.json:mutation.threshold: 1.0`).
  - El estado condicional debe ir en un atributo `data-`/`aria-`, no en una clase CSS (`project-spec.md:62-63`).
  - Ningún `.module.scss` puede declarar reglas para `html`, `body` o `#root` (`src/styles/hoja-global.test.ts:66-73`).
  - `#root` solo se modifica en `global.scss`.
  - El inventario son exactamente 17 módulos con `.module.scss` co-localizado (`inventarioModulos.test.ts:70-75`). Un componente `.tsx` nuevo exige alta.
  - Presupuesto de CSS: 12000 B codificados (`tests/e2e/css-presupuesto.spec.ts:23`). Mi estimación del `dist/` actual: 9736 B con gzip -9 (8481 B con brotli). No es el `encodedBodySize` real de `vite preview`.
  - CLS ≤ 0,1 en las seis rutas (`tests/e2e/imagenes.spec.ts:148, 187`). Los `transform` no cuentan para el CLS.
- **Contratos que fijan el hueco de la cabecera**
  - @s4 (`fidelidad-cabecera.spec.ts:216-232`; `features/fidelidad_cabecera.feature:364-377`) exige que el alto de la cabecera sea igual al relleno de `#root`, que ese relleno sea igual al token, y que `#inicio` arranque en el borde inferior de la cabecera (`< 0,5 px`).
  - Una cabecera sobre el hero choca de frente con esa última cláusula. Es puerta humana.
  - Otras puertas que tocan lo mismo:
    - `Cabecera.test.tsx:374-378` fija `border-block-end: ... var(--color-borde)` y los `min-height` de `.cabecera` e `.interior`.
    - `hoja-global.test.ts:125-131` fija que `scroll-padding-top` use solo `--altura-cabecera`.
    - `tokens-aplicados.spec.ts:104` exige `#inicio` con fondo opaco.
    - `rediseno-visual.spec.ts:65` exige exactamente 1 `img` en `#inicio`.
    - `imagenes.spec.ts:166-176` exige que la imagen del hero sea `eager` y `fetchpriority=high`.

## 5. Panel móvil (`Cabecera.module.scss:256-295`)

Medido a 375 px con el panel abierto:

- `position: fixed; inset-inline: 0; inset-block-start: var(--altura-cabecera)` (64 px), `z-index: 9`, `max-height: 70vh` (568 px), `overflow-y: auto`.
- **Fondo OPACO** `var(--color-fondo)` (rgb 248,250,252), borde inferior `1px var(--color-borde)` y sombra `var(--sombra-elevada)`.
- Enlaces `color: var(--color-tinta)`, 16 px (hereda `.cabecera`), alto 48.
- Vive dentro de `.interior`, en el `<header>` (`Cabecera.tsx:157-171`), y no depende de la transparencia de la barra. Seguiría legible, pero colgaría como bloque sólido de una barra transparente.
- `.botonMenu` (`:223-240`) tiene fondo propio `--color-superficie` y borde `--color-borde-control` (blanco en `clinica`), con las tres líneas en `currentColor`/`--color-tinta`.
- La cabecera actual es `rgba` al 88 % de `--color-fondo` con `backdrop-filter: blur(16px)` (`:31-34`; medido: `color(srgb … / 0.88)`).
- G2: el panel móvil se queda "EXACTAMENTE como está"; acercarlo al prototipo es tarea aparte (`features/fidelidad_cabecera.feature:249-300`).

## 6. Logo

- `public/img/logo-galapavet.webp` es un WebP raster de 201×201 con alfa (`file`: "RIFF WebP, with alpha, 201x201"). Hay una copia byte a byte en `logo galapavet.webp` en la raíz (`cmp`: IDÉNTICOS, 4744 B).
- Es una marca a color (cruz morada, hoja lima, figura morada) sobre un disco blanco opaco (píxel (30,30) = 255,255,255,255). Las esquinas son transparentes: 8623 de 40401 píxeles tienen alfa 0 (medido con PIL).
- No hay versión clara/blanca ni SVG (NO ENCONTRADO). `public/` solo trae `404.html`, iconos y `img/*`. `src/assets` no existe. `index.html:6-10` dice que el vector aún no existe.
- El `<img>` pinta sus esquinas transparentes con `--color-fondo-alterno` (`Cabecera.module.scss:63-72` → `_api.scss:203-210`). Sobre el velo se vería como una baldosa clara con un disco blanco dentro. Mismo logo en las cinco variantes.
- El texto de la marca ("Galapavet" y el descriptor) es HTML (`Cabecera.tsx:129-132`) y puede cambiar de color con los tokens.
- Solo se puede describir lo que hay: no he modificado la imagen.

## Contratos aprobados que la petición toca (solo los cito)

- **Cabecera:** @s4 (hueco) y @s6 (texto Tienda en `--color-tinta`: `Cabecera.module.scss:179`, `Cabecera.test.tsx:437`, `fidelidad-cabecera.spec.ts:342`, `features/fidelidad_cabecera.feature:416-424`).
- **Hero:** `features/fidelidad_hero.feature` @s1-@s3 y `features/hero.feature` @s1, @s4, @s5, @s6, @s9, @s10, @s11. Describen la píldora de ubicación, el botón Llamar, el horario y las cifras, que el cliente pide retirar.
- Las tres decisiones de movimiento (`accesibilidad.feature:503`, @s16, Decisión 31) y `matrizDeContraste.test.ts` (cuatro asserts) también son puertas humanas.

## DUDAS DEL AGENTE
- Decisión humana: reintroducir una animación de entrada con `animation:`. Hoy el recuento exigido es exactamente 0 (`src/lib/accesibilidad-movimiento.test.ts:255-261`) y `features/accesibilidad.feature:503` dice que exige pasar por la puerta humana. Hace falta enmendar @s20/@s22 y ese test.
- Decisión humana: la animación de la referencia (fadeInLeft 1,25 s, retrasos de 150 y 200 ms) supera el techo de 300 ms de la Decisión 31 (`project-spec.md:112`; `features/identidad_visual.feature` @s16). No hay token de retraso (`-delay` queda fuera de la puerta) ni regla de reparto por propiedad.
- Hueco de la puerta de escala, no una vía: `escalaMovimiento.ts:58` solo reconoce `ms`, por lo que `1.25s` pasaría la puerta aunque incumple el contrato. No lo he recomendado.
- La petición de enlaces 'blancos' choca con la variante `tech`. Su velo es claro y su `--color-sobre-primario` es oscuro (#04212B). Un literal blanco está bloqueado por `puertaLiteralesColor` y un token nuevo está 'CERRADO' (`features/fidelidad_cabecera.feature:437-445`). Decidir si en `tech` los enlaces pasan a oscuros (lo coherente con el hero actual) o si se pide otra solución.
- El enlace Tienda está fijado con `--color-tinta` por contrato (@s6), por `Cabecera.test.tsx:437` y por `fidelidad-cabecera.spec.ts:342`. Sobre el velo da 1,0 a 2,2:1. Cambiarlo es puerta humana.
- Decisión humana sobre @s4 de fidelidad_cabecera (`#inicio` arranca en el borde inferior de la cabecera; `#root` reserva el hueco con el token) frente a una cabecera sobre la imagen. No he evaluado si se puede extender visualmente la imagen 64 px hacia arriba manteniendo las cajas.
- Decisión de diseño pendiente: la cabecera debe ser sólida en las cinco rutas sin hero y en `/` pasado el hero. Eso exige un estado por ruta y por scroll, hoy inexistente (sin scroll listener ni IntersectionObserver en producción). La lógica debe ir en un módulo `*-logica.ts` con mutación al 100 %, y el estado en un atributo `data-`/`aria-`.
- Para el par de contraste del nav sobre el hero hay que elegir entre reutilizar la fila `sobre-primario`/`tinta` (cambiando su `uso` a 'texto normal', 23/115) o añadir una fila (24/120). En ambos casos cambian asserts de `matrizDeContraste.test.ts` (`:518`, `:534-535`, `:581`, `:603`). Los cambios de recuento se trataron antes como puerta humana (`features/rediseno_visual.feature:249`, `:387`).
- Ángulo ciego de los e2e de foco (@s38/@s39, `tests/e2e/accesibilidad.spec.ts:119-130`, `:181-197`): resuelven el fondo por ancestros del DOM y no ven la imagen ni el velo. Con cabecera transparente pueden dar falso pase o falso fallo según el color del anillo. Inferido, no ejecutado.
- El contraste sobre el velo es calculado con la fórmula del repositorio y fotos extremas (blanca/negra/gris), no medido sobre la fotografía real `public/img/hero/clinica.webp`.
- Las medidas de ancho del nav se hicieron en `vite dev` (no en `dist/`), a `innerWidth` 1024 con scrollbar clásica de 15 px (clientWidth 1009), inyectando un `<style>` con `!important`. Playwright headless puede usar scrollbar superpuesta, lo que daría 15 px más de holgura. No lo he comprobado.
- No he medido el parpadeo de hamburguesa en escritorio en el primer fotograma (render con `ancho=0`, `App.tsx:19-35`). Es inferido del código.
- No he verificado la referencia https://vetcruzverde.es/ (fadeInLeft 1,25 s, retrasos). Parto de lo que dice el encargo.
- El presupuesto de CSS (12000 B codificados) lo he estimado con gzip/brotli sobre `dist/assets/index-Ck5l2Crc.css`. No he medido el `encodedBodySize` de `vite preview`, así que el margen de unos 2,2 KB es aproximado.
- Durante mi lectura apareció un directorio no rastreado, `progress/maqueta_cabecera_hero/` (con `maqueta.html`, 13:39), que no he creado yo. Supongo que es de otro agente del flujo.
- La lista de hero.feature/fidelidad_hero.feature afectados está dada solo por número de escenario. No he revisado cuántos tests unitarios y e2e dependen de la píldora, el botón Llamar, el horario y las cifras.
