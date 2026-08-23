# Plan de adaptación de la capa SCSS — fichero a fichero

> **Qué es esto.** La lista de ficheros que el `tdd_craftsman` tiene que crear o ampliar
> para que Galapavet deje de renderizarse como HTML plano, con el contenido de cada uno
> ya decidido y justificado. **No es prosa inspiracional y no es código de producción:**
> nada de lo que hay aquí ha pasado todavía por un test rojo.
>
> **Entradas leídas enteras** (23/08/2026): `progress/estudio_webempresa.md`,
> `progress/estudio_nailslash.md`, `progress/restricciones_memoria_organizacional.md`,
> `progress/arquitectura_organizacional_scss.md`, `progress/estudio_diseno_referencia.md`,
> `progress/investigacion_tecnica_visual.md`, `progress/plan_imagenes.md`,
> `progress/spike_capa_base.md`.
>
> **Regla de portabilidad:** se porta la ESTRUCTURA de `WebEmpresa`/`NailsLashStudioWeb`.
> Los VALORES de marca no. Todo hexadecimal de este documento se deriva de `#77286B`,
> `#B4C718` y `#48704B` (`src/lib/tokens.ts:8-12`) mezclados con blanco o negro puro, y
> **todos los ratios están calculados con la fórmula de `src/lib/contraste.ts`**, no a ojo.
>
> Lo que no he podido verificar va marcado **NO VERIFICADO**.

---

## 0 · Lo que se ha MEDIDO hoy para escribir este plan (reproducible)

Cuatro mediciones nuevas, hechas sobre este repositorio en modo solo lectura. Las cito
aquí porque tres decisiones del plan dependen de ellas.

### M-1 · La réplica de la fórmula de contraste es correcta

Diez valores de control, calculados con una réplica exacta de
`src/lib/contraste.ts:34-72` (mismos pesos 0.2126/0.7152/0.0722, mismo umbral 0.03928,
misma compensación 0.05), contra los ya aprobados en
`features/sistema_de_diseno_visual.feature:54-88`:

| par | calculado hoy | ya aprobado |
| --- | --- | --- |
| `#77286B` / `#FFFFFF` | 9.13 | 9.13 |
| `#48704B` / `#FFFFFF` | 5.68 | 5.68 |
| `#B4C718` / `#77286B` | 4.84 | 4.84 |
| `#B4C718` / `#FFFFFF` | 1.89 | 1.89 |
| `#000000` / `#B4C718` | 11.12 | 11.12 |
| `#FFFFFF` / `#000000` | 21.00 | 21.00 |
| `#77286B` / `#F8F9E8` | 8.57 | 8.57 |
| `#48704B` / `#F0F4F1` | 5.12 | 5.12 |
| `#77286B` / `#F0F4F1` | 8.22 | 8.22 |
| `#77286B` / `#000000` | 2.30 | 2.30 |

**Coinciden dígito a dígito los diez.** Toda la tabla del §3 sale de esa misma réplica.

### M-2 · El CSS de producción actual, medido sobre `dist/assets/index-CZIteidN.css`

```
wc -c                                 → 11 455 bytes
grep -o "{" | wc -l                   → 124 reglas
grep -c "font-family"                 → 0
grep -o ":root[^{]*{" | sort | uniq -c → 1 × marca, 1 × lima, 1 × verde, 1 × noche
```

Confirma el diagnóstico de partida y **añade un dato nuevo**: los cuatro bloques de
variante aparecen **una sola vez** en el artefacto, pese a que `additionalData` los
inyecta en los 17 módulos. La explicación está en M-3 y M-4.

### M-3 · Cada `.module.scss` emite los 4 bloques de tokens — medido con Sass real

```js
sass.compileString('@use "tokens" as *;\n' + readFileSync('src/components/Hero.module.scss'),
                   { loadPaths: ['src/styles'] })
→ 4 bloques :root[data-variante] emitidos por UNA sola compilación
```

Con 17 módulos son **68 bloques** en el CSS intermedio. Lo que los colapsa a 4 **no es
Sass: es el minificador**. `node_modules/.pnpm` contiene `lightningcss@1.33.0` (Vite 8 va
sobre `rolldown@1.2.4`), y la huella está en el propio artefacto:
`@media (width>=1024px)` en `dist/assets/index-CZIteidN.css` es sintaxis de rango que
**solo** emite Lightning CSS al modernizar `min-width`. Es decir: hoy la no-duplicación
la garantiza el minificador, no el diseño. Ver §2.2.

### M-4 · `@use` duplicado en la misma entrada es legal y no duplica salida

```js
sass.compileString('@use "tokens" as *;\n@use \'tokens\';\n', { loadPaths: ['src/styles'] })
→ OK, 4 bloques (no 8)
```

Es decir: `main.scss` puede escribir `@use 'tokens';` aunque `additionalData` ya le haya
inyectado `@use "tokens" as *;`. No es error de Sass y no duplica CSS. Fundamento
documental, doc oficial de `@use`
(<https://sass-lang.com/documentation/at-rules/use/>, sección *Overview*), literal:

> *"Any styles loaded this way will be included exactly once in the compiled CSS output,
> no matter how many times those styles are loaded."*

El matiz que hay que entender y que M-3 demuestra: **"the compiled CSS output" es POR
COMPILACIÓN**, y Vite compila cada `.module.scss` como su propia entrada. La garantía de
Sass es intra-compilación; entre 17 compilaciones no existe.

---

## 1 · FICHEROS NUEVOS

> ## ⚠ CORRECCIÓN DE ARQUITECTURA — el barril de 5 parciales NO cabe en el contrato
>
> Este bloque proponía `src/styles/main.scss` como barril más cuatro parciales
> (`_reset`, `_base`, `_tipografia`, `_fuentes`). **El contrato aprobado nombra un solo
> fichero, `src/styles/global.scss`, y lee su TEXTO CRUDO con `?raw`** en seis escenarios
> distintos:
>
> | escenario | qué exige encontrar **dentro de `src/styles/global.scss`** |
> | --- | --- |
> | @s12 | que el fichero exista y que `src/main.tsx` lo importe **exactamente una vez** |
> | @s13 | las **nueve familias** del reset, contadas |
> | @s14 | `scroll-padding-top` sobre `html` |
> | @s15 | todo `scroll-behavior: smooth` y el bloque `reduce` |
> | @s17 | las `@font-face` de Outfit y DM Sans |
> | @s18 | las dos `@font-face` de respaldo con las seis métricas de Capsize |
>
> Un `?raw` sobre un barril de cinco `@use` devuelve **cinco líneas de `@use`**: no
> contiene ni una de esas declaraciones, y los seis escenarios fallarían. **No hay forma
> de salvar el barril**: el `?raw` no resuelve `@use`, y escribir un resolvedor de `@use`
> dentro del test sería inventarse una herramienta para eludir un contrato aprobado.
>
> **Decisión: un único `src/styles/global.scss`** que contiene, en este orden y con sus
> rótulos de sección, lo que los §1.3, §1.4, §1.5 y §1.6 describen: `@font-face` →
> reset → capa base → tipografía → movimiento. Se conservan **íntegros** el contenido, las
> siete diferencias con `_base.scss` de WebEmpresa, las seis con su `_reset.scss` y las
> cuatro con `_tipografia.scss` de NailsLash: **lo que cambia es en cuántos ficheros se
> reparte, no una sola de sus reglas**. `src/main.tsx` importa `./styles/global.scss` y
> nada más.
>
> **Lo que NO se funde en `global.scss`, y por qué:**
> - `src/styles/_tokens.scss` — su ruta está anclada por `tokensColor.test.ts:17`, que la
>   globa con `?raw`. Moverla rompe las cuatro puertas de contraste (§6). `global.scss`
>   hace `@use 'tokens';`.
> - `src/styles/_api.scss` — la escisión del §2.2 sigue en pie tal cual: emite **cero
>   CSS**, así que inyectarlo 17 veces por `additionalData` cuesta 0 bytes. Ninguno de los
>   51 escenarios lo nombra.
>
> **Lo que se pierde y hay que reponer.** El barril tenía una virtud real: *«el orden de
> la cascada queda escrito en un único sitio de 5 líneas, y es auditable»*, y habilitaba
> el test T6 (*«el parcial existe **y está enganchado**»*). Con un solo fichero, ese test
> cambia de forma pero **no desaparece**: `hojaGlobal.ts` pasa de aseverar «`main.scss`
> hace `@use` de los cinco parciales» a aseverar **«`global.scss` declara las nueve
> familias de @s13, en su orden»**, que es la misma protección anti-vacuidad —un
> `global.scss` al que alguien le vacíe la mitad se pone rojo— expresada sobre el fichero
> que el contrato sí nombra. La cascada sigue auditable: es el orden de las secciones
> rotuladas dentro del fichero.
>
> **Segundo aviso, sobre el `body`.** @s13 pide dos reglas distintas para `body`:
> `body { margin: 0 }` como familia 2, y una familia 6 que declara **a la vez**
> `min-height: 100svh`, `line-height: 1.5`, `background-color: var(--color-fondo)`,
> `color: var(--color-texto)` y `font-family: var(--fuente-texto)`. El plan repartía esas
> cinco entre `_reset.scss` (min-height, line-height), `_base.scss` (fondo, color) y
> `_tipografia.scss` (familia). **Van juntas en una sola regla**, o el «a la vez» del
> escenario no se puede aseverar.
>
> (§9, divergencias D-4, D-5 y D-18.)

### 1.1 `src/main.tsx` — LA LÍNEA QUE FALTA (no es fichero nuevo, es la causa raíz)

**Origen:** `WebEmpresa/src/main.tsx:11` y `NailsLashStudioWeb/src/main.tsx:43`, idénticos.

**Qué se añade** — tres imports al principio del fichero, antes de `import { App }`:

```tsx
import './styles/global.scss'
```

(y, cuando entre la tipografía, los `@font-face` **antes** que la hoja: §1.6.)

**Qué cambia respecto del original:** nada. Es literalmente la misma línea. `WebEmpresa`
la pone en la 11 y NailsLash en la 43; en Galapavet no existe, y **de ahí se deriva todo
lo demás**. El `additionalData` de `vite.config.ts:31` da acceso a `paso-tipografico()` y
`espaciado()` dentro de cada módulo, pero **no ejecuta ni una regla global**.

**Aviso de cobertura, y es grave:** `src/main.tsx` está excluido de cobertura
(`vite.config.ts:77`) y fuera de la lista `mutate` de Stryker (`stryker.config.json`, solo
`src/lib/**/*.ts` y `src/**/*-logica.ts`). **Si mañana alguien borra esta línea, hoy no
hay una sola puerta que se ponga roja.** Por eso el primer paso del §5 es el test que la
ancla, no el fichero.

---

### 1.2 `src/styles/global.scss` — el fichero único (antes «el barril»)

> **Esta subsección se escribió como barril de 5 `@use` y queda SUPERSEDIDA por la
> corrección de arquitectura de la cabecera del §1: el fichero se llama
> `src/styles/global.scss` y contiene las secciones, no los `@use` a parciales.**
> Lo que sigue conserva su valor y **no se borra**: las tres cosas que NO se portan
> (`logo-draw`, `demo`, el `color-scheme` constante) siguen siendo decisiones vigentes, y
> el orden de la cascada sigue siendo el mismo — solo que ahora es el orden de las
> secciones rotuladas dentro de un fichero, en vez del orden de cinco `@use`.

**Origen:** `WebEmpresa/src/styles/main.scss:1-4` (4 líneas) y
`NailsLashStudioWeb/src/styles/main.scss:1-13`.

**Contenido decidido:**

```scss
// src/styles/global.scss — la capa global del documento. Único fichero que
// `src/main.tsx` importa (@s12). El orden de estas secciones ES la cascada:
//   A. tokens      → @use del parcial de custom properties (ruta anclada: §6)
//   B. fuentes     → los @font-face autoalojados + los 2 de respaldo (@s17, @s18)
//   C. variables de tipografía → --fuente-titulo / --fuente-texto (@s13, @s17)
//   D. reset       → las nueve familias de la Decisión 29 (@s13)
//   E. base        → aplica los tokens al documento (body, encabezados, foco, .prosa)
//   F. shell       → #root: aislamiento + rejilla que ancla el pie (@s13, @s46)
//   G. movimiento  → scroll-padding-top, no-preference y reduce (@s14, @s15)
@use 'tokens';

// ... el contenido de §1.6 (B), §1.5 (C), §1.3 (D), §1.4 (E, F, G), en ese orden ...
```

**Qué cambia respecto del original:**

1. **No se porta `@use 'logo-draw'`** (`WebEmpresa/src/styles/main.scss:4`): es la órbita
   animada de Cénit Digital. Galapavet no tiene animación de logo. **NO VERIFICADO** si
   la quiere.
2. **No se porta `@use 'demo'`** (`NailsLashStudioWeb/src/styles/main.scss:8`): su propio
   fichero se autorrotula *«rama `demo/lunes-prototipo` · NO es una feature del
   pipeline»* (`_demo.scss:1-2`). Es una capa que entró por fuera del arnés.
   `restricciones_memoria_organizacional.md` §3.4 lo prohíbe expresamente.
3. **No se porta el `:root { color-scheme: light }`** de `NailsLash/main.scss:11-13`:
   Galapavet tiene una variante `noche`, así que el `color-scheme` no es constante y no
   puede vivir en el barril. Ver §2.1, punto E.
4. **Se añaden dos parciales que ninguno de los dos repos tiene juntos**: `fuentes`
   (NailsLash lo resuelve por `@fontsource` desde `main.tsx`; aquí va autoalojado en
   `public/`, Decisión D-G/D-K de `investigacion_tecnica_visual.md`) y `tipografia`
   (NailsLash sí lo tiene, `_tipografia.scss`; WebEmpresa no).

**Por qué es un fichero y no cuatro imports sueltos en `main.tsx`:** porque el orden de la
cascada queda escrito en un único sitio de 5 líneas, y porque es lo que permite el test
T6 (`estudio_webempresa.md` §5.T6): *«el parcial existe **y está enganchado»*.

---

### 1.3 `src/styles/_reset.scss`

**Origen:** `WebEmpresa/src/styles/_reset.scss` (38 líneas), corregido con la sección 5 de
`progress/investigacion_tecnica_visual.md` (que cita la spec de rendering de HTML y MDN
regla por regla).

**Contenido decidido:**

```scss
// Reset moderno y mínimo. Cada bloque cita su porqué; no es Normalize ni Meyer.
*,
*::before,
*::after {
  box-sizing: border-box;
}

// El margen de 8px del `body` es la hoja del user-agent
// (https://html.spec.whatwg.org/multipage/rendering.html). Es la causa directa del
// margen espurio medido en `dist/`. Los márgenes de bloque van en `em` y colapsan:
// imposible construir ritmo vertical encima. El ritmo lo gobierna `espaciado()`.
body {
  margin: 0;
}

h1, h2, h3, h4, h5, h6,
p, blockquote, figure, dl, dd, ul, ol {
  margin-block: 0;
}

blockquote,
figure {
  margin-inline: 0;
}

html {
  -webkit-text-size-adjust: 100%;
}

body {
  min-height: 100svh;
  line-height: 1.5;
}

img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
}

// Los controles NO heredan la fuente: la spec de rendering la fija desde el SO. Sin
// esto los botones y los campos del formulario seguirían fuera de la tipografía de
// marca aunque el `body` sí la use.
button, input, select, textarea {
  font: inherit;
  color: inherit;
}

// Las listas del layout van sin viñeta, pero SOLO las marcadas como tal: un
// `ul { list-style: none }` global dejaría la prosa del blog sin viñetas.
ul[role='list'],
ol[role='list'] {
  list-style: none;
  padding-inline: 0;
}

#root {
  isolation: isolate;
}
```

**Qué cambia respecto de `WebEmpresa/_reset.scss`, y por qué — seis diferencias:**

| # | WebEmpresa | Galapavet | Razón |
| --- | --- | --- | --- |
| 1 | `:14` `html { scroll-behavior: smooth }` **sin guarda** | **NO SE PORTA aquí.** Va a `_base.scss` dentro de `@media (prefers-reduced-motion: no-preference)` | Decisión 31 de `project-spec.md:113`, literal: *«vive **dentro** de `no-preference`, no se declara y se revoca después»*. `estudio_webempresa.md` §1.3.1 lo mide: `scroll-behavior` aparece **una sola vez** en todo WebEmpresa y **ningún** bloque `prefers-reduced-motion` lo cubre. Matiz honesto: la puerta @s33 (`movimientoRespetuoso.ts:22`, `PATRON_PROPIEDAD_DE_MOVIMIENTO = /^\s*(animation\|transition)\s*:/`) **no vigila `scroll-behavior`**, así que un despiste aquí pasaría en verde. Es prohibición de contrato, no de arnés. |
| 2 | `:8-10` `* { margin: 0 }` | Lista explícita de elementos | `* { margin: 0 }` alcanza también a los elementos de formulario y a lo que venga en el futuro. La lista explícita es auditable y es lo que la spec de rendering enumera. |
| 3 | `:30-33` `font: inherit` solo en `button` | `button, input, select, textarea` | Deuda nº 6 de `estudio_webempresa.md` §7.3: `Contacto.module.scss:110,166` tiene que repetir `font: inherit` en `.input` y `.submit` porque el reset no los cubre. Galapavet tiene `FormularioContacto` con `input`, `select` y `textarea`: se cubre una vez. |
| 4 | `:35-38` `ul { list-style: none; padding: 0 }` global | `ul[role='list']` / `ol[role='list']` | Deuda nº 4 de §7.3: el reset global mata las viñetas también en la prosa legal y del blog, y **no hay regla que las reponga**. Galapavet SÍ tendrá prosa real (`PaginaBlog`). Coste: hay que poner `role="list"` en los `<ul>` de layout — que es exactamente lo que ya recomienda VoiceOver cuando se les quita `list-style`. |
| 5 | `:17-21` `body { line-height: 1.6 }` **y** `_base.scss:6` `body { line-height: 1.65 }` | **Una sola declaración.** `1.5` en el reset (mínimo de SC 1.4.12 Text Spacing); el interlineado de lectura lo pone `_base.scss` sobre los elementos de texto, no otra vez sobre `body` | Deuda nº 1 de §7.3: el `1.6` del reset de WebEmpresa es **código muerto** que gana `_base` por orden. No se porta la duplicación. |
| 6 | `:17` `min-height: 100vh` | `min-height: 100svh` | `100vh` provoca el salto por la barra de direcciones móvil. `svh` es la unidad correcta (`investigacion_tecnica_visual.md` §5.9). Re-medido, no heredado — patrón `herencia-del-repo-base-es-deuda-muerta`. |

**No se portan tampoco** `-webkit-font-smoothing` ni `-moz-osx-font-smoothing`
(`WebEmpresa/_base.scss:7-8`): MDN los declara **no estandarizados** y **solo macOS**, y
*adelgazan* el texto. `investigacion_tecnica_visual.md` §5.6 lo acota: si se usan, **solo
dentro de la variante `noche`**, que es el único caso «texto claro sobre fondo oscuro»
donde el subpíxel engorda. Fuera de ahí, ninguna.

---

### 1.4 `src/styles/_base.scss`

**Origen:** `WebEmpresa/src/styles/_base.scss` (70 líneas). Es el fichero que contiene
**la regla más importante del repo de referencia** y la que Galapavet no tiene.

**Contenido decidido:**

```scss
// La capa que APLICA los tokens al documento. Sin ella los tokens existen, resuelven,
// y no pintan nada: es exactamente el estado medido el 23/08/2026 (0 `font-family` y
// 0 reglas para html/body en todo el CSS de `dist/`).

// Red de seguridad: si el atributo `data-variante` no llegara a ponerse (JS
// deshabilitado, el <script> anti-FOUC no se ejecuta), NINGÚN token de color estaría
// definido y todo `var(--color-*)` quedaría sin valor. `_tokens.scss` declara los
// cuatro bloques SIEMPRE con atributo (`:root[data-variante='…']`, :39/:45/:52/:59) y
// NO tiene bloque `:root` desnudo. Ver 2.1.A.
body {
  background-color: var(--color-fondo);
  color: var(--color-texto);
}

h1, h2, h3, h4, h5, h6 {
  color: var(--color-tinta);
  line-height: 1.15;
  letter-spacing: -0.01em;
  text-wrap: balance;
}

p, li {
  text-wrap: pretty;
}

// `main` NO restringe ancho ni añade sangrado: las secciones van a sangre completa y
// cada una lleva su propio contenedor con max-width + gutter. Si `main` pusiera
// max-width/padding, el gutter se DUPLICARÍA y las bandas de color de sección
// quedarían recortadas con franjas del fondo del body a los lados.
main {
  display: block;
}

a {
  color: inherit;
}

// Anillo de foco global, uno solo, desde token, con `:focus-visible` (no `:focus`),
// para que el ratón no lo dispare. El `outline-offset` NO es decorativo: ver 3.5.
:focus-visible {
  outline: 2px solid var(--color-foco);
  outline-offset: 2px;
}

.saltarAlContenido { /* fuera de pantalla, NO display:none */ }
.saltarAlContenido:focus { /* left: 0 */ }

// Contenedor de LECTURA para las páginas de texto (blog, 404). Único sitio donde se
// reponen las viñetas que el reset quita.
.prosa { max-width: 72ch; }
.prosa ul, .prosa ol { list-style: revert; padding-inline-start: 1.25em; }

@media (prefers-reduced-motion: no-preference) {
  html {
    scroll-behavior: smooth;
  }

  body {
    transition: background-color 150ms ease-out, color 150ms ease-out;
  }
}
```

**Qué cambia respecto de `WebEmpresa/_base.scss`, y por qué — siete diferencias:**

| # | WebEmpresa | Galapavet | Razón |
| --- | --- | --- | --- |
| 1 | `:2-13` `body { font-family: var(--font-sans); … }` | **La `font-family` NO va aquí**: va en `_tipografia.scss` (§1.5) | Es el patrón de NailsLash (`_tipografia.scss:1-21`), y su razón es de proceso, no estética: la tipografía global es **una feature propia nacida de una deuda declarada**, y meterla dentro de `_base.scss` mezcla dos contratos. Ver §1.5. |
| 2 | `:10-12` `body { transition: background-color .2s, color .2s }` **sin guarda** | La misma idea **dentro de `no-preference`** y a **150 ms**, no 200 | Doble motivo. (a) Una `transition` a inicio de línea fuera de `prefers-reduced-motion` **sí** la caza `movimientoRespetuoso.ts:22` — si la hoja global entra en el inventario, que es lo que este plan propone (§2.3). (b) La escala de dos pasos de Galapavet es 150/300 ms (Decisión 31), no los 200 ms de Cénit. `restricciones_memoria_organizacional.md` §3.2 lo marca como infracción portada. |
| 3 | `:15-22` cubre solo `h1, h2, h3` | Cubre `h1..h6` | Deuda nº 5 de `estudio_webempresa.md` §7.3: en WebEmpresa un `h4` caería a la fuente y el peso del UA. Galapavet tendrá blog con jerarquía profunda (`PaginaBlog.tsx` ya renderiza `h2` y `blockquote` sin ningún estilo). |
| 4 | `:15-22` fija `font-family: var(--font-display)` en los titulares | Aquí solo color/interlineado/`text-wrap`; la familia la fija `_tipografia.scss` con la regla conjunta `h2, h3` | Frontera con lo ya cerrado: ver §1.5 y §6. |
| 5 | `:38-40` `a:hover { text-decoration: underline }` + `a { text-decoration: none }` | **Solo `a { color: inherit }`**; no se quita el subrayado globalmente | «Global permisivo + opt-out local» obliga a un opt-out en cada componente (`Header.module.scss:20-22`, `HeaderNav.module.scss:25-27` en WebEmpresa). Quitar el subrayado por defecto a TODOS los enlaces es además una pérdida de affordance que ninguna decisión de Galapavet respalda. Cada módulo que quiera píldora lo declara. |
| 6 | `:47-60` `.skip-link` / `.prose` (nombres en inglés) | `.saltarAlContenido` / `.prosa` | Los nombres de este repo van en español, como los tokens (`--color-fondo`, `--color-texto`, `--color-foco`). Patrón `herencia-del-repo-base-es-deuda-muerta`: se porta el mecanismo (`left:-9999px` + `:focus { left: 0 }`, **nunca** `display:none`, que sacaría el enlace del orden de tabulación), no el identificador. |
| 7 | `:62-70` `.prose { max-width: 72ch }` **sin restaurar viñetas** | `.prosa` **con** `list-style: revert` | Consecuencia directa del cambio 4 del reset. Deuda nº 4 de §7.3, no portada. |

**Se porta íntegro, palabra por palabra, el comentario de `_base.scss:24-28` sobre `main`.**
Es *la decisión arquitectónica central del sistema de layout* y, según
`estudio_webempresa.md` §6.3, es una **corrección posterior** al handoff de diseño (el
paquete `design/fundamentos/` traía `main { max-width; padding }`, o sea el bug del doble
gutter). Portar la versión de `design/fundamentos/` reintroduciría el bug que el repo de
referencia ya arregló.

**Añadido que no está en ninguno de los dos repos:** `scroll-padding-top` en `html`.
Va aquí, atado a la variable que dimensiona la cabecera, **no** a un número repetido:

```scss
html {
  scroll-padding-top: calc(var(--altura-cabecera) + #{espaciado(16)});
}
```

> ⚠ **CORRECCIÓN — se escribe `scroll-padding-top`, no `scroll-padding-block-start`.**
> @s14 exige literalmente que *«"html" declara "scroll-padding-top"»*, y la comprobación es
> una lectura de texto: `scroll-padding-block-start` **no contiene** esa cadena y el
> escenario fallaría. Son equivalentes en modo de escritura `horizontal-tb`, que es el
> único que este sitio usa, así que no se pierde nada. **Manda el contrato.**
>
> Y @s14 pide una segunda mitad que el plan no cubría: *«esa misma variable es la que la
> maquetación de la cabecera usa para su propia altura»*. `--altura-cabecera` no basta con
> declararla en `_tokens.scss` y consumirla aquí: **`Cabecera.module.scss` tiene que
> dimensionarse con ella** (`height: var(--altura-cabecera)`), o el escenario tiene dos
> números que pueden divergir, que es justo lo que existe para impedir.

**Segundo añadido que el plan no tenía: el bloque `reduce`.** @s15 lo exige por su
contenido exacto: *«el bloque `@media (prefers-reduced-motion: reduce)` anula la duración
de animación y de transición con `0.01ms` y no con `0`, para que `transitionend` y
`animationend` sigan disparándose»*. El `_base.scss` propuesto solo tenía el bloque
`no-preference`. Van los dos:

```scss
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms;
    animation-iteration-count: 1;
    transition-duration: 0.01ms;
  }
}
```

**Y no, esto NO es la forma prohibida del prototipo.** Lo que el §6 prohíbe —y con
razón— es *declarar el movimiento fuera de la consulta y revocarlo después* con
`* { transition-duration: .01ms !important }`. Aquí el movimiento sigue siendo **opt-in**
(se declara **solo** dentro de `no-preference`) y este bloque es una **red de seguridad
sin `!important`** para lo que el navegador o una librería puedan animar por su cuenta.
La puerta existente lo admite explícitamente: `movimientoRespetuoso.ts:8-9` acepta un
bloque `reduce` *«donde se asume que la regla existe para anular la duración»*.
Verificado leyendo `PATRON_REDUCE` (`:20`). Sin este bloque, @s42 —*«ninguna transición se
ejecuta con una duración efectiva distinta de 0.01 milisegundos»*— no puede pasar.

**Tercer añadido: el pie que cierra la ventana (@s46).** El escenario dice que cerrarlo
*«cierra el PENDIENTE que `sistema_de_diseno_visual.feature` dejó anotado sobre si el shell
común necesita fichero de estilos propio»*. La respuesta es **no**: va en `global.scss`,
porque @s12 prohíbe que un `.module.scss` declare reglas para `html`, `body` o `#root`. La
regla del `#root` hace dos cosas a la vez, y las dos son de contrato —`isolation: isolate`
es la familia 8 de @s13—:

```scss
#root {
  isolation: isolate;
  min-height: 100svh;
  display: grid;
  grid-template-rows: auto 1fr auto;   // cabecera · main · pie
}
```

No es cosmética: es la **técnica suficiente C43 del W3C para SC 2.4.11 Focus Not
Obscured (Minimum), nivel AA** (`investigacion_tecnica_visual.md` §5.8 y D-M), y esta web
tiene cabecera fija (`Cabecera.module.scss`, `position: fixed`). NailsLash lo tiene con su
propio test (`src/styles/scroll-padding-cabecera.test.ts`, 3 `it`, que exige `>= 76px`
re-medido y **niega explícitamente** el `5rem` heredado). Ese test se porta.

---

### 1.5 `src/styles/_tipografia.scss` — el suelo heredable, en fichero aparte

**Origen:** `NailsLashStudioWeb/src/styles/_tipografia.scss` (21 líneas, transcrito entero
en `estudio_nailslash.md` §6.1).

**Contenido decidido:**

```scss
// Tipografía GLOBAL del documento. Suelo HEREDABLE: el `body` fija la fuente que todo
// descendiente sin `font-family` propia hereda. Arregla la avería medida el 23/08/2026
// (0 `font-family` en todo el CSS de `dist/`; `getComputedStyle(body).fontFamily` =
// "Times New Roman").
//
// Solo familias YA horneadas por la sección de @font-face de este mismo fichero: ni
// @import ni @font-face nuevos, ningún tercero (Decisión 9).
:root {
  --fuente-titulo: 'Outfit', 'Outfit Fallback', Arial, sans-serif;
  --fuente-texto: 'DM Sans', 'DM Sans Fallback', Arial, sans-serif;
}

body {
  font-family: var(--fuente-texto);
}

// Suelo de TIPO de los encabezados. Regla CONJUNTA (una sola, seis selectores), no seis
// reglas: es un selector de TIPO (0,0,1), el más débil que existe tras la herencia, así
// que CUALQUIER clase de cualquier módulo lo derrota. Es un SUELO, no un techo.
h1, h2, h3, h4, h5, h6 {
  font-family: var(--fuente-titulo);
}
```

> ⚠ **CORRECCIÓN — la familia se consume por VARIABLE, no por literal repetido.** La
> diferencia 2 de la tabla de abajo decidía *«literales, no tokens»*, copiando a NailsLash.
> **El contrato decide lo contrario, dos veces**: @s13 exige que el `body` tome *«la
> familia … de la variable de tipografía de texto»*, y @s17 exige que *«la variable de
> tipografía de titulares nombre "Outfit" y la de texto nombre "DM Sans"»*. Las dos frases
> dicen **variable**, no literal.
>
> **Y el miedo que motivaba el literal no aplica aquí.** La objeción de NailsLash
> (`tipografia-global.test.ts:16-18`) es que importar el token **como símbolo** para
> compararlo consigo mismo es tautología. Cierto — y el contrato la evita por otra vía: el
> test **lee del texto crudo del SCSS** el valor declarado de `--fuente-titulo` y lo
> compara contra el literal `'Outfit'` **escrito a mano en el escenario**. Nada se importa,
> nada se compara consigo mismo, y encima la consistencia deja de depender de una
> *allowlist* que hay que recordar actualizar: hay **un solo sitio** donde cambiar la
> familia. Las dos variables se declaran en un `:root` **sin `[data-variante]`**, porque la
> tipografía no cambia con la paleta; no entran en los 17 tokens de @s1 ni en el recuento
> de 68 pares de @s2 (§9, divergencia D-18).

**Qué cambia respecto del original de NailsLash — cuatro diferencias:**

| # | NailsLash | Galapavet | Razón |
| --- | --- | --- | --- |
| 1 | `h2, h3` (excluye `h1` a propósito) | `h1..h6` | La exclusión de `h1` en NailsLash es una **frontera con una feature `done`** (`features/tipografia_global.feature:188-191`: *«el `<h1>` del hero conserva Great Vibes/Manrope de F-07 sin que esta feature lo roce»*). **En Galapavet esa frontera no existe**: ningún `.module.scss` declara hoy ninguna `font-family` (medido: `grep -rn "font-family" src/` → 0). No hay nada que pisar, así que la exclusión sería cargo cult. |
| 2 | Nombre de familia literal en cada punto de uso, sin token (`_tokens.scss` de NailsLash **no declara ni un `--font-*`**) | Igual: **literales, no tokens** | Es donde estuve tentado de «mejorar el patrón». **No se mejora**, y la razón la da el propio NailsLash (`tipografia-global.test.ts:16-18`): la aserción anti-tautología se ancla contra **el literal escrito a mano**; un token `--fuente-titulo` haría que el test comparase el símbolo consigo mismo. La consistencia la garantiza una **allowlist aseverada** (§4.1), no un token compartido. |
| 3 | `'Manrope', system-ui, sans-serif` | `'DM Sans', 'DM Sans Fallback', Arial, sans-serif` | Las familias son las de la Decisión 24 (Outfit + DM Sans), que además coinciden con el estándar de la casa (`WebEmpresa/_tokens.scss:18-19`). El eslabón `'… Fallback'` es la familia sintética con métricas ajustadas de `investigacion_tecnica_visual.md` §3.5 (§1.6 de este plan): sin ella, `font-display: swap` mueve el layout al intercambiar. |
| 4 | — | **Ninguna regla de este parcial puede llevar `.` ni `#`** | Aserción portada tal cual de `tipografia-global.test.ts:253-260`. Es lo que hace imposible que la capa global suba de especificidad sin que un test se ponga rojo. |

**Por qué es un fichero aparte y no cuatro líneas dentro de `_base.scss`.** Porque es lo
que hace la operación **segura por construcción** sobre 20 features `done`: la herencia
solo rellena donde **ninguna** regla matchea, y `h1..h6` es (0,0,1). No puede pisar nada.
Tener eso aislado en 12 líneas con sus propias aserciones es lo que permite demostrarlo.
`features/tipografia_global.feature:193-207` de NailsLash lo redacta como escenario y es
la mejor plantilla que hay para el Gherkin de esta feature.

---

### 1.6 `src/styles/_fuentes.scss` + `public/fuentes/*.woff2`

**Origen:** **no se porta de ninguno de los dos repos.** Ambos usan `@fontsource` desde
`main.tsx`; aquí las fuentes van a `public/` porque `investigacion_tecnica_visual.md`
D-G/D-J lo exige: el `<link rel="preload">` va escrito a mano en `index.html` y necesita
una URL estable sin hash, garantía que **solo** da `public/`
(<https://vite.dev/guide/assets>).

**Contenido decidido** (valores medidos y calculados en `investigacion_tecnica_visual.md`
§3.2/§3.3/§3.5, no estimados):

```scss
@font-face {
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 100 900;             // variable: un fichero, todo el rango
  font-display: swap;
  src: url('/fuentes/outfit-latin-wght-normal.woff2') format('woff2-variations');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
                 U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122,
                 U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
// + el mismo bloque para 'DM Sans' con font-weight: 100 1000
// + las dos @font-face de respaldo con métricas ajustadas:
//   'Outfit Fallback'  → size-adjust: 99.8204%; ascent-override: 100.18%;  descent-override: 26.0468%
//   'DM Sans Fallback' → size-adjust: 104.531%; ascent-override: 94.9001%; descent-override: 29.6563%
```

**Diferencias deliberadas con los dos repos de referencia:**

1. **No entra `@fontsource` como dependencia.** WebEmpresa importa
   `@fontsource/outfit/400.css` … `/700.css` (`main.tsx:1-8`) — **8 imports**, y
   NailsLash **midió y condenó** esa forma (`main.tsx:13-19`): `400.css` trae los **6
   subsets**, y `@fontsource/<familia>` a secas trae **solo el 400** con los pesos que
   faltan cayendo en faux-bold **sin error en consola**. Galapavet necesita exactamente
   esas dos familias, así que la tentación de copiar el bloque de WebEmpresa es máxima:
   `restricciones_memoria_organizacional.md` §3.3 lo prohíbe con nombre y apellidos.
2. **Variables, no estáticas.** Medido: Outfit `latin` variable = **32 292 B** frente a
   **42 232 B** de tres pesos estáticos (400+600+700); DM Sans variable = **36 932 B**
   frente a 42 852 B. **La variable gana ya a partir de tres pesos** y regala los
   intermedios. Total **≈ 68 KB** para toda la tipografía.
3. **Sí se declara `unicode-range`, y ahí este plan es mejor que NailsLash.** NailsLash
   declara como límite conocido (puerta humana A-28) que sus `latin-<peso>.css`
   **no** lo llevan, y que por eso un `Ł`/`ř`/`ğ` **pinta tofu sin ningún error**. Con
   `unicode-range` declarado el navegador **sí** hace fallback a la siguiente familia del
   stack. Verificado por script en `investigacion_tecnica_visual.md` §3.3: el rango latin
   cubre `ñ Ñ ¿ ¡ « » · — – … " " ' ' € º ª ç` — **ningún carácter del español queda
   fuera**.
4. **`latin-ext` NO se sirve.** Ahorra 33 036 B de peso muerto.
5. **`@capsizecss/*` NO entra como dependencia.** Fue herramienta de investigación; su
   salida son los cuatro números de arriba, que se escriben a mano con su procedencia en
   comentario.

**Nota de licencia, verificada leyendo el `LICENSE` de los ficheros descargados, no un
blog:** ambas son **SIL Open Font License 1.1** (`Outfitio/Outfit-Fonts` y
`googlefonts/dm-fonts`). La OFL permite redistribuir la fuente con la web. Decisión 9
satisfecha: **cero peticiones a `fonts.googleapis.com`**.

---

### 1.7 Los ficheros de verificación nuevos

| Ruta | Nivel | Qué hace |
| --- | --- | --- |
| `src/lib/diseno/hojaGlobal.ts` | A (puro, mutado) | Inventario declarado de las **nueve familias de reglas de @s13**, en su orden, + comprobación de enganche (`main.tsx` → `global.scss`), con **guarda de no-vacuidad propia**. Es la puerta que hoy no existe y que habría cazado el fallo de raíz. |
| `src/lib/diseno/escalaDeMovimiento.ts` | A (puro, mutado) | **@s16**: las dos duraciones (150, 300) y la curva `ease-out` como inventario declarado, más el barrido de todas las duraciones de transición escritas en los ficheros de estilos y la prohibición de animar `all`. No estaba en el plan. |
| `src/lib/diseno/configuracionAxe.ts` | A (puro, mutado) | **@s35**: las cinco etiquetas acumulativas como literal declarado, contrastado contra el texto real de las pruebas de navegador, y la prohibición de `.options()`. No estaba en el plan. |
| `src/lib/diseno/escenariosHeredados.ts` | A (puro, mutado) | **@s50**: los doce identificadores heredados (8 de la feature 21 + 4 de la 19), con el recuento exacto de 12 y la comprobación de que cada uno está citado desde al menos una prueba de `tests/e2e`. No estaba en el plan. |
| `src/lib/diseno/hojaGlobal.test.ts` | A | Su test, con literales escritos a mano. |
| `src/lib/diseno/mezclaDeColor.ts` | A (puro, mutado) | `mezclar(base, otro, porcentaje) → '#RRGGBB'`: la derivación canal a canal con redondeo estándar. **Toda la tabla del §3 se recalcula con esto**, ningún hexadecimal se duplica a mano en el test. |
| `src/lib/diseno/mezclaDeColor.test.ts` | A | Su test. Ancla los porcentajes y los hexadecimales resultantes por separado (anti-tautología). |
| `src/styles/hoja-global.test.ts` | A | Aserciones sobre el TEXTO de `global.scss` con el parser de llaves de NailsLash (@s13, @s14, @s15, @s17, @s18). |
| `playwright.config.ts`, `tsconfig.e2e.json` | C | Config del navegador real contra `vite preview` sobre `dist/`. |
| `tests/e2e/capa-base.spec.ts` | C | Los cuatro síntomas medidos hoy, comprobados en Chrome real (§4.4). |
| `tests/e2e/axe.spec.ts` | C | axe-core con `withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa'])`. |

`mezclaDeColor.ts` merece una nota: es el único sitio donde la aritmética de derivación de
color vive como **código**, y por tanto el único que StrykerJS puede morder. Hoy los
hexadecimales derivados están duplicados a mano dentro de
`tokensColor.test.ts:57-64,93-100` (la mezcla se recalcula **dentro del propio test**).
Extraerla a un módulo puro es lo que la convierte en verificación mutada de verdad.

---

## 2 · FICHEROS QUE SE AMPLÍAN

### 2.1 `src/styles/_tokens.scss` — de 3 roles a 17 tokens (15 de color + 2 de sombra)

Hoy declara 3 roles × 4 variantes (`:39-64`) más las escalas y mixins Sass (`:76-134`).

**A. Se añade un bloque `:root` sin atributo, y NO es opcional.**
Medido: las 4 únicas apariciones de `:root` en el fichero llevan `[data-variante]`. Si el
atributo no llegara a ponerse (JS deshabilitado, el `<script>` de `index.html:17-31` no se
ejecuta), **ningún token de color se define**, y con la capa global activa el `body`
quedaría con `background-color: var(--color-fondo)` sin valor — es decir, hoy no se nota
porque nada consume los tokens, y **en el momento en que `_base.scss` los consuma sí se
notará**. Es el mismo razonamiento del patrón `estado-base-visible-ssg-reduced-motion`
aplicado al color: el estado base debe ser correcto sin JS.
Forma: el bloque `:root` desnudo declara los valores de `marca` y los cuatro
`:root[data-variante='…']` siguen ahí tal cual.
⚠ **Efecto sobre una puerta existente:** `extraerVariantesDeTokens`
(`tokensColor.ts:17`, `PATRON_SELECTOR_VARIANTE`) solo matchea `:root[data-variante=…]`,
así que un `:root` desnudo **no** aparecerá en el inventario y @s1 sigue verde. Verificado
leyendo la regex.

**B. Los 14 tokens nuevos van en los cinco bloques** (el desnudo + los cuatro), con los
valores del §3: los 12 roles de color nuevos de @s3 (§3.3-§3.6) y los 2 de sombra (§3.8).
Con los 3 ya existentes, **17 en cada bloque**. @s2 lo convierte en un recuento exacto:
*«el recuento de pares (variante, token) efectivamente comprobados es exactamente 68»*
= 17 × 4. El `:root` desnudo **no cuenta** para ese 68 (no lo matchea
`PATRON_SELECTOR_VARIANTE`), y eso es correcto: es red de seguridad de runtime, no una
quinta variante.

**C. Restricción dura de formato, medida en el código de la puerta:**
`extraerBloqueDeVariante` (`tokensColor.ts:35`) usa `[^}]*` → **un bloque de variante no
puede contener llaves anidadas**; y `leerTokenDeVariante` (`:52`) exige literalmente
`--color-<rol>: #RRGGBB;` con **hex de 6 dígitos**. Consecuencia: los **15 roles de color**
son hex de 6 dígitos, sin `color-mix()`, sin `rgba()`, sin `var()` encadenado.
Los **2 roles de sombra** no pueden serlo, y por eso el lector se amplía: §2.5.

**D. Los tokens que NO son color** (sombras, medidas, radios, alturas de control) también
viven aquí, porque `puertaLiteralesColor.ts:27-30` señala **cualquier** `rgba()` en
`src/components/*.module.scss` y `src/pages/*.module.scss`, y `_tokens.scss` **no está en
ese glob** (`inventarioModulos.test.ts:88-89`). Es el único sitio legal para un `rgba()`:

```scss
// Los dos de sombra: valores completos y justificados en §3.8, distintos por variante.
--sombra-reposo:   0 6px 18px rgba(83, 28, 75, 0.07);   // difuminado grande, alfa muy bajo
--sombra-elevada:  0 18px 45px rgba(83, 28, 75, 0.10);
// Medidas: NO son color y NO varían por variante -> van en el `:root` desnudo, una vez.
--maxw: …;                               // PENDIENTE del tdd_craftsman: ver el aviso
--gutter: …;
--seccion-y: …;
--radio-completo: 999px;
--altura-cabecera: …;                    // la consume `scroll-padding-top` (§1.4) Y
                                         // `Cabecera.module.scss` para su propia altura
```

⚠ **CORRECCIÓN — `--maxw: 1220px` era un número del prototipo y sale del plan.** Esta
sección decía *«gana el prototipo, que es el diseño aprobado de ESTE cliente»*, y eso
contradice a la vez la regla de portabilidad de este mismo documento (*«se porta la
ESTRUCTURA … los VALORES de marca no»*) y el contrato, cuyo PENDIENTE 3 es explícito:
*«El prototipo usa 1220 px, pero la Decisión 24 solo autoriza tomar su ARQUITECTURA, no
sus números, y 1220 no está verificado como valor de este proyecto … el valor concreto lo
fija el `tdd_craftsman`»*. Lo mismo vale para `--gutter` y `--seccion-y`: se construyen
sobre `$escala-espaciado`, la rejilla de 8 px que el proyecto YA tiene, no sobre las
27 apariciones de un `clamp()` ajeno. Lo que @s45 exige es una **propiedad estructural**
—que exista **un solo** ancho máximo, el mismo en las 6 rutas, y que el contenido no
llegue al borde a 1600 px—, nunca una cifra concreta.
**Lo que sí se conserva de la nota original**, porque es buen criterio y sigue valiendo:
anclar el RECHAZO de lo heredado (`expect(scss).not.toContain('1180px')` y, ahora también,
`not.toContain('1220px')` si el valor elegido no es ése) — patrón
`herencia-del-repo-base-es-deuda-muerta` (§9, divergencia D-24).

**E. `color-scheme` por variante, no en el barril.** `noche` es oscura y las otras tres
claras, así que `color-scheme: light` no puede ser constante: va dentro de cada bloque de
variante (`light` en marca/lima/verde, `dark` en noche) para que el navegador pinte
scrollbars y controles nativos en el esquema correcto. Es la laguna que
`estudio_webempresa.md` §4.2 señala (Galapavet no tiene ni `color-scheme` ni
`theme-color`).

**F. Escisión del API de Sass — ver 2.2.**

**G. Los 3 alias deprecados de WebEmpresa NO entran.** `--color-soft`, `--color-brand`,
`--color-brand-mint` (`WebEmpresa/_tokens.scss:80-82`). El propio fichero de origen los
marca *«no usar en código nuevo»* y `estudio_webempresa.md` §7.1 verifica que **están
muertos**: sus 6 únicas apariciones son las propias declaraciones. Galapavet arranca
limpio; copiarlos es crear la deuda en el minuto cero.

---

### 2.2 `vite.config.ts` — ¿sigue haciendo falta `additionalData`?

**Respuesta corta: sí hace falta, pero NO como está hoy. Hoy duplica salida ×17, y solo
el minificador lo tapa.**

**El razonamiento, con el comportamiento real de `@use` medido:**

1. La doc oficial de Sass (<https://sass-lang.com/documentation/at-rules/use/>, *Overview*)
   dice: *"Any styles loaded this way will be included exactly once in the compiled CSS
   output, no matter how many times those styles are loaded."* Esa garantía es **por
   compilación**.
2. **Vite compila cada `.module.scss` como su propia entrada**, y `additionalData` se
   antepone a **cada** una de ellas. Son 17 compilaciones independientes.
3. Medición M-3: **una** compilación de `Hero.module.scss` con el `additionalData` actual
   emite **4 bloques `:root[data-variante]`**. Por 17 módulos, **68 bloques**.
4. Medición M-2: en `dist/assets/index-CZIteidN.css` hay **4**. Lo que colapsa 68 → 4 es
   **Lightning CSS 1.33.0** (verificado: está en `node_modules/.pnpm`, y la sintaxis de
   rango `@media (width>=1024px)` del artefacto es su firma).
5. Por tanto **la no-duplicación de hoy es una propiedad del minificador, no del
   diseño**. Cambiar de minificador, o mirar el CSS de `vite dev` (sin minificar), la
   destruye. Y en cuanto los tokens pasen de 12 declaraciones a ~60, el coste
   intermedio pasa de anecdótico a real.
6. Medición M-4: un `@use 'tokens';` explícito en `main.scss` **convive** con el
   `@use "tokens" as *;` inyectado y **no** duplica. O sea que el problema no es
   `main.scss`; es que los otros 17 ficheros también emiten los tokens.

**Decisión: escindir el parcial en dos, y que `additionalData` inyecte el que NO emite
CSS.**

```
src/styles/_tokens.scss   → SOLO las custom properties (:root + 4 × :root[data-variante]).
                            La ruta NO cambia: `tokensColor.test.ts:17` la globa con `?raw`
                            y las 4 puertas de contraste dependen de ella.
                            Se `@use`a UNA sola vez, desde `global.scss`.
src/styles/_api.scss      → SOLO Sass: $escala-tipografica, paso-tipografico(),
                            $escala-espaciado, espaciado(), $grosor-foco,
                            @mixin foco-visible, $area-tactil-minima,
                            @mixin area-tactil-minima.
                            Emite CERO CSS → inyectarlo 17 veces cuesta 0 bytes.

vite.config.ts:31   additionalData: '@use "api" as *;\n'
```

Consecuencia para los 17 `.module.scss`: **ninguna**. Siguen escribiendo
`espaciado(24)`, `paso-tipografico(2)` y `@include foco-visible` exactamente igual.

**Se comprueba, no se supone** (es un paso del §5): `pnpm build` antes y después, y
`grep -c ':root\[data-variante' dist/assets/*.css` + el tamaño del CSS. La medición se
escribe en `progress/`.

**Riesgo declarado de esta escisión:** hay un comentario en `_tokens.scss:25-32` que
documenta un error real ya sufrido (*«`additionalData` se inyectaría también sobre sí
mismo y provocaría un `@use` circular … error real de Sass "Module loop"»*). Ese comentario
**queda obsoleto** con la escisión y hay que reescribirlo, no borrarlo: hoy el bucle es
imposible porque `additionalData` inyecta `api`, no `tokens`, y `_api.scss` no usa
`tokens`. **Verificado en M-4** que el caso de la entrada (`global.scss`, que sí recibe el
`additionalData` por serlo) no produce ningún bucle.

**Lo que NO se toca de `vite.config.ts`:** `test.css.include: [/\?raw/]` (`:65`). Sus 20
líneas de comentario (`:46-64`) documentan un fallo medido en vivo —activar la
transformación de CSS para importaciones normales inyecta hojas reales en jsdom, jsdom
aplica `display: none` fuera de un `@media` que no evalúa, y **rompe `getByRole`** en
`Cabecera`—. Ni se toca ni se «mejora».

---

### 2.3 `src/lib/diseno/inventarioModulos.ts` y `movimientoRespetuoso.ts`

Hoy las puertas @s24 (ningún literal de color) y @s33 (todo movimiento bajo
`prefers-reduced-motion`) inspeccionan **exactamente 17 ficheros**:
`components/*.module.scss` + `pages/*.module.scss` (`inventarioModulos.test.ts:88-89`,
`movimientoRespetuoso.test.ts:7-8`).

**Una hoja global no está en ese conjunto.** Es decir: `_base.scss` podría declarar un
`transition` sin guarda o un `#hex` a pelo y **ninguna puerta se enteraría**. Es el patrón
`verde-por-vacuidad-en-puerta-de-verificacion` con otro disfraz, y
`restricciones_memoria_organizacional.md` §1.3 lo señala como *el agujero real*.

**Se amplía el conjunto**, con su propia guarda de no-vacuidad (una por extractor, no una
compartida):

- `INVENTARIO_HOJAS_GLOBALES = ['global.scss', '_api.scss']` para la puerta de literales
  de color — **`_tokens.scss` queda fuera de ese glob**, porque es el único sitio donde
  los hexadecimales y los `rgba()` de las sombras pueden vivir (y su contenido ya lo
  vigila `tokensColor.ts`).
- La puerta de movimiento **sí** cubre las tres, `_tokens.scss` incluido.

⚠ **Se invocan como catálogo SEPARADO, no ampliando el de los 17 módulos.** La versión
anterior decía «se amplía el glob», y eso rompería @s51, que exige que *«el recuento de
módulos del inventario coincida con el recuento de componentes visuales de
`src/components` más el de páginas de `src/pages`»* — 12 + 5 = 17, y una hoja global no es
ni un componente ni una página. Se llama **dos veces a la misma función pura**, una con
los 17 módulos y otra con las hojas globales, **cada llamada con su propia guarda de
no-vacuidad**. Así @s24 conserva su «exactamente 17», @s51 conserva su identidad de
recuentos, y las hojas globales dejan de ser el punto ciego (§9, divergencia D-23).

**Nota de la trampa:** `PATRON_NOMBRE_DE_COLOR` de `puertaLiteralesColor.ts` usa `\b`
sobre los 16 nombres CSS. La palabra inglesa **`lime` está en esa lista**: un comentario
en un fichero inspeccionado que escriba «lime» en vez de «lima» dispara la puerta. Y
`PATRON_HEX` señala cualquier `#77286B` **también dentro de un comentario**.

---

### 2.4 `index.html`

Tres añadidos, ninguno de ellos toca el `<script>` anti-FOUC (`:8-32`) ni su posición:

```html
<link rel="preload" href="/fuentes/outfit-latin-wght-normal.woff2"  as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/fuentes/dm-sans-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin />
<meta name="color-scheme" content="light dark" />
```

`crossorigin` es **obligatorio aunque el fichero sea del mismo origen** — MDN, literal:
*"The attribute needs to be set to match the resource's CORS and credentials mode, **even
when the fetch is not cross-origin**"*. Sin él el navegador **descarga el fichero dos
veces** y la precarga es contraproducente.

**Cuarto añadido, y es un 404 que se sirve hoy en todas las rutas.** `index.html:6`
declara `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />` y **ese fichero no
existe** (`public/` tampoco). @s28 dice qué hacer, y no es inventarse un SVG: *«mientras
no exista el vector del cliente, la etiqueta que declara el icono vectorial permanece
comentada en vez de apuntar a un fichero inexistente»*. Se comenta, y se sirven los tres
rasters que el escenario exige con código 200:

```html
<!-- Icono vectorial: pendiente del vector del cliente (@s28, PENDIENTE 8 del contrato).
     No se apunta a un fichero inexistente: eso es un 404 en cada carga.
<link rel="icon" type="image/svg+xml" href="/favicon.svg" /> -->
<link rel="icon" href="/favicon.ico" sizes="32x32" />
<link rel="icon" type="image/png" href="/favicon-32.png" sizes="32x32" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />   <!-- 180×180 exactos -->
```

Mientras siga como está, **@s33 lo caza** (*«ninguna respuesta tiene un código de estado
mayor o igual que 400»*) y @s28 también, por partida doble.

**`theme-color` queda pendiente y declarado NO VERIFICADO**: con 4 variantes conmutadas
por atributo no sirve la forma `media` de WebEmpresa (`index.html:7-9`); habría que
escribirlo desde JS al cambiar de variante, y **no hay decisión tomada** en
`project-spec.md`.

---

### 2.5 `src/lib/diseno/tokensColor.ts` — el lector, extendido (PENDIENTE 12 del contrato)

**El problema, leído en el código y no supuesto.** Hoy el lector tiene dos límites duros:

1. `leerTokenDeVariante` (`:50-58`) compila un patrón
   `--color-<rol>:\s*(#[0-9a-fA-F]{6})\s*;` — solo lee tokens cuyo nombre empieza por
   `--color-` y cuyo valor es un **hexadecimal de 6 dígitos**. Con eso **no puede leer
   `--sombra-reposo`**: ni el prefijo casa ni el valor es un hex.
2. `extraerBloqueDeVariante` (`:34-41`) usa `([^}]*)`, así que **un bloque de variante no
   puede contener ni una llave anidada**: la primera `}` de un `@media` interior cortaría
   el cuerpo por la mitad y los diez escenarios que dependen del lector caerían a la vez.

@s1 y @s2 necesitan los dos tokens de sombra. Se resuelve **añadiendo hermanos, no
relajando el lector existente**, y la razón es de puertas: si `leerTokenDeVariante`
aceptara cualquier valor, un `#F4EEF` de 5 dígitos pasaría, y
@s3/@s5/@s6/@s7/@s8/@s9 —que ya están aprobados— dejarían de detectar un token mal
escrito. **El lector estricto se queda estricto.**

**A. Los tipos.** `RolDeColor` pasa de 3 a **15** valores (los de @s1 sin el prefijo), y
nace `RolDeSombra`. `leerTokenDeVariante` no cambia ni una línea: hereda los 12 roles
nuevos por el tipo.

```ts
export type RolDeColor =
  | 'fondo' | 'fondo-alterno' | 'superficie' | 'superficie-elevada' | 'tinta'
  | 'texto' | 'texto-suave' | 'primario' | 'primario-fuerte' | 'sobre-primario'
  | 'acento-tinta' | 'acento-suave' | 'borde-control' | 'borde' | 'foco'

/** Los dos roles de sombra (@s1). No son color: no pasan por la puerta de contraste. */
export type RolDeSombra = 'reposo' | 'elevada'

/** Nombre completo de un token del sistema, tal y como se escribe en el SCSS. */
export type NombreDeToken = `--color-${RolDeColor}` | `--sombra-${RolDeSombra}`
```

**B. El lector hermano, que lee el valor SIN interpretarlo.**

```ts
const PRIMERA_CAPTURA = 1

/**
 * Valor declarado de CUALQUIER token dentro del bloque de `variante`, tal cual
 * lo escribe el fichero y sin normalizar. Existe porque `--sombra-reposo` vale
 * una lista con `rgba()` y `leerTokenDeVariante` solo admite `#RRGGBB` (@s1,
 * @s2 — PENDIENTE 12 del contrato). El lector estricto NO se relaja: convive.
 */
export function leerDeclaracionDeVariante(
  textoScss: string,
  variante: string,
  nombreDeToken: NombreDeToken,
): string {
  const bloque = extraerBloqueDeVariante(textoScss, variante)
  const coincidencia = bloque.match(new RegExp(nombreDeToken + ':\\s*([^;]+);'))
  if (!coincidencia) {
    throw new Error(`no se encontró el token "${nombreDeToken}" para la variante "${variante}"`)
  }
  return (coincidencia[PRIMERA_CAPTURA] as string).trim()
}

/** Si `variante` declara `nombreDeToken` en su PROPIO bloque, sin heredarlo (@s2). */
export function declaraTokenEnVariante(
  textoScss: string,
  variante: string,
  nombreDeToken: NombreDeToken,
): boolean {
  const bloque = extraerBloqueDeVariante(textoScss, variante)
  return new RegExp(nombreDeToken + ':\\s*[^;]+;').test(bloque)
}
```

**Por qué los dos puntos del patrón no son decorativos.** `--color-borde:` no casa dentro
de `--color-borde-control: #A06997;`, porque entre `borde` y `:` hay `-control`. Lo mismo
protege a `--color-primario` de `--color-primario-fuerte`, a `--color-fondo` de
`--color-fondo-alterno`, a `--color-superficie` de `--color-superficie-elevada`, a
`--color-texto` de `--color-texto-suave` y a `--color-tinta` de `--color-acento-tinta`.
**Es exactamente la colisión que @s11 evita al prohibir un `--color-acento` a secas**:
el sufijo obligatorio de `--color-acento-tinta` no es cosmética, es lo que mantiene el
espacio de nombres legible por prefijo.

**C. `extraerBloqueDeVariante` cuenta llaves.** Se sustituye `[^}]*` por un recorrido con
profundidad, el mismo mecanismo que `movimientoRespetuoso.ts` ya usa en este repo:

```ts
const LLAVE_ABRE = '{'
const LLAVE_CIERRA = '}'
const SIN_COINCIDENCIA = -1
const UNO = 1
const PROFUNDIDAD_CERRADA = 0

function extraerBloqueDeVariante(textoScss: string, variante: string): string {
  const inicio = textoScss.search(patronDeEncabezadoDeVariante(variante))
  if (inicio === SIN_COINCIDENCIA) {
    throw new Error(`no se encontró ningún bloque ":root[data-variante='${variante}']" en el texto de tokens`)
  }
  const cuerpoEmpieza = textoScss.indexOf(LLAVE_ABRE, inicio) + UNO
  let profundidad = UNO
  let cursor = cuerpoEmpieza
  while (cursor < textoScss.length && profundidad > PROFUNDIDAD_CERRADA) {
    if (textoScss[cursor] === LLAVE_ABRE) { profundidad += UNO }
    if (textoScss[cursor] === LLAVE_CIERRA) { profundidad -= UNO }
    cursor += UNO
  }
  if (profundidad > PROFUNDIDAD_CERRADA) {
    throw new Error(`el bloque ":root[data-variante='${variante}']" no se cierra: falta la llave de cierre`)
  }
  return textoScss.slice(cuerpoEmpieza, cursor - UNO)
}
```

(`patronDeEncabezadoDeVariante` es el mismo selector que hoy, recortado en la llave de
apertura: se extrae a función para que el literal viva **una sola vez** y no haya dos
regex que puedan divergir.)

**D. ⚠ AVISO A GRITOS PARA EL `tdd_craftsman`: este módulo está bajo StrykerJS con
umbral 1.0.** `stryker.config.json` muta `src/lib/**/*.ts` y `break` está en 100: **un
solo mutante superviviente tumba el cierre de la feature**. Cada rama, cada comparación y
cada literal de arriba es un mutante nuevo. La lista de tests que hay que escribir
**antes** de tocar el fichero, con el mutante que mata cada uno:

| test (`it`) | mata el mutante |
| --- | --- |
| devuelve el cuerpo **exacto** de un bloque sin anidamiento (igualdad de string, sin llaves) | `+ UNO` → `- UNO`; `cursor - UNO` → `cursor`; `'{'` → `''` |
| devuelve el cuerpo **entero** de un bloque que contiene un `@media` anidado | `profundidad += UNO` → `-=`; la vuelta a `[^}]*` |
| **no se traga el bloque siguiente** cuando hay dos bloques de variante consecutivos | `profundidad > 0` → `>= 0`; `-=` → `+=` |
| localiza el bloque cuando empieza en el **índice 0** del texto | `inicio === -1` → `inicio <= 0` / `>= -1` |
| lanza con el **mensaje exacto** si la variante no existe | `SIN_COINCIDENCIA` → `0`; el `throw` eliminado |
| lanza con el **mensaje exacto** si el bloque **no se cierra** (falta la `}`) | `cursor < length` → `<=`; la guarda final eliminada |
| `leerDeclaracionDeVariante` lee `--sombra-reposo` con su `rgba()` y sus comas | `[^;]+` → `[^;]*`; la condición del `if` invertida |
| **recorta** los espacios alrededor del valor | `.trim()` eliminado |
| lanza con el mensaje exacto si el token pedido no está en el bloque | `!coincidencia` → `coincidencia` |
| **no confunde** `--color-primario` con `--color-primario-fuerte`, en los dos sentidos | el `:` del patrón eliminado |
| `declaraTokenEnVariante` devuelve `false` para un token ausente **y** `true` para uno presente | `test()` → `true` / `false` constante |
| `leerTokenDeVariante` **sigue rechazando** un hex de 5 dígitos y un `rgba()` | la relajación accidental del lector estricto |

Doce `it`, y ninguno es de adorno: son doce ramas nuevas en un fichero con `break: 100`.

Y la puerta de @s2 lleva **su propia guarda de no-vacuidad**, como todas las de este repo
(patrón `verde-por-vacuidad-en-puerta-de-verificacion`): catálogo de variantes vacío o
inventario de tokens vacío → **suspenso con motivo**, nunca «68 de 68» sobre 0 × 0.

**E. Cinturón y tirantes: la puerta que prohíbe anidar.** Aunque el lector ya cuente
llaves, se escribe además la aserción que el §7.1 de este plan ya pedía —*«ningún
bloque de variante contiene `{` interno»*—. Cuesta tres líneas y hace que un `@media`
dentro de un bloque de variante falle **por su nombre** en vez de por un cuerpo cortado a
la mitad.

---

## 3 · LA TABLA DE ROLES DE COLOR COMPLETA

### 3.1 Los 17 tokens y su semántica

> **Fuente de verdad: `features/identidad_visual.feature` @s1, aprobado por la puerta
> humana el 23/08/2026.** El contrato enumera a mano **17 nombres exactos** y exige
> «el recuento de roles de color es exactamente 15 y el de roles de sombra exactamente 2».
> Esta sección enumeraba antes 14 con tres nombres distintos y sin los dos de sombra:
> **manda el contrato, se corrige el plan** (§9, divergencias D-1, D-2 y D-3).
>
> El titular «13 roles de color + 2 de sombra» de la Decisión 26 y de
> `estudio_diseno_referencia.md` §1.2 es un **recuento equivocado** —ninguna de las dos
> cuadra con su propia enumeración— y el propio contrato lo dice y **le encarga al
> `craftsman_lead` corregirlo en `project-spec.md`**. Aquí ya está corregido: 15 + 2 = 17.

Nombres en español, coherentes con los tres que ya existen. Reducidos desde los 18 del
prototipo y los 20 de WebEmpresa: **15 roles de color + 2 de sombra es el mínimo real**
para las secciones que Galapavet tiene.

| # | Rol | Para qué | Umbral WCAG |
| --- | --- | --- | --- |
| 1 | `--color-fondo` *(ya existe)* | lienzo de página | — |
| 2 | `--color-fondo-alterno` | fondo de sección **alterna**: sin él, 8 secciones seguidas con el mismo fondo y la página «no tiene ritmo» | — |
| 3 | `--color-superficie` | tarjeta / panel elevado (servicios, equipo, campañas, galería, blog, tienda, formulario, pie) | — |
| 4 | `--color-superficie-elevada` | superficie **secundaria dentro** de una tarjeta: campos del formulario, cabecera y pie del chat, botones ± de la cesta | — |
| 5 | `--color-tinta` | titulares y datos (precios, cifras). Hoy todo el texto usa el mismo `--color-texto` y **no hay jerarquía** | 1.4.3 AA 4.5 (se busca 7, AAA 1.4.6) |
| 6 | `--color-texto` *(ya existe)* | cuerpo | 1.4.3 AA 4.5 |
| 7 | `--color-texto-suave` | entradillas, descripciones de tarjeta, metadatos, pies de foto | 1.4.3 AA 4.5 |
| 8 | `--color-primario` | fondo de acción: botón primario, burbuja propia del chat, cuadro del logotipo | 1.4.11 AA 3.0 contra el fondo |
| 9 | `--color-primario-fuerte` | **estado con el puntero encima del botón primario.** Es un token y NO un `filter`, y ésa es toda su razón de ser (@s8) | 1.4.3 AA 4.5 contra `--color-sobre-primario`, y **estrictamente mejor** que el reposo |
| 10 | `--color-sobre-primario` | texto/icono **sobre** `--color-primario` y sobre `--color-primario-fuerte` | 1.4.3 AA 4.5 |
| 11 | `--color-acento-tinta` | el acento que **lleva texto**: eyebrows, categorías, checks, rótulos | 1.4.3 AA 4.5 |
| 12 | `--color-acento-suave` | fondo suave del acento: píldoras, círculos de check, hover de nav | — (lo que importa es el texto encima) |
| 13 | `--color-borde` | línea decorativa de 1px: perímetro de tarjeta, separadores | **exento** (decorativo) |
| 14 | `--color-borde-control` | el borde que **identifica** un control: campo, botón fantasma, píldora seleccionable | 1.4.11 AA 3.0 |
| 15 | `--color-foco` *(ya existe)* | anillo de foco | 1.4.11 AA 3.0 · 2.4.13 AAA |
| 16 | `--sombra-reposo` | sombra de reposo de tarjeta, teñida con la tinta de la variante | **exento** (decorativo) |
| 17 | `--sombra-elevada` | sombra elevada: hover de tarjeta, panel del chat, panel flotante del selector, imagen de artículo | **exento** (decorativo) |

Los dos últimos **no son opcionales ni «para más adelante»**: @s1 los exige por nombre y
@s2 los exige declarados en las 4 variantes. Y hay una razón mecánica, no estética, para
que sean tokens y vivan en `_tokens.scss`: `puertaLiteralesColor.ts:27-30,56` señala
**cualquier** `rgba()` en `src/components/*.module.scss` y `src/pages/*.module.scss`, y
`_tokens.scss` **no está en ese glob**. Escribir la sombra en el módulo es imposible por
puerta. Valores en §3.8.

**Roles que se DESCARTAN a propósito, con su razón:**

- `--urg` / `--urg-soft`: Galapavet **no presta urgencias 24 h**; su teléfono fuera de
  horario es un enlace, no una marca de servicio. @s11 lo convierte en puerta: *«no existe
  ningún token cuyo nombre contenga "urgencia" ni "urg"»*, y lo comprueba **también** sobre
  los ficheros de estilos del inventario, no solo sobre `_tokens.scss`.
- `--accent` «a secas» decorativo del prototipo (3 usos, y con el lima a 1.89 sobre blanco
  no puede llevar texto jamás). @s11 también lo convierte en puerta: *«no existe ningún
  token llamado `--color-acento` a secas, distinto de `--color-acento-tinta` y
  `--color-acento-suave`»*. **Ésta es exactamente la razón por la que el nombre del rol 11
  lleva el sufijo `-tinta`**: sin él, el plan habría creado por su cuenta el token que el
  contrato prohíbe.

**Un descarte RETIRADO — `--primary-strong`.** La versión anterior de este plan lo
descartaba con esta medición del prototipo: *«declarado 4 veces y usado 0 veces: todos los
hovers usan `filter: brightness(1.1)`»*. **La medición es correcta y la conclusión era la
opuesta a la que toca.** Recalculado hoy con la fórmula real: `#77286B × 1.1` da `#832C76`,
y el blanco encima cae de **9.13 a 8.12** — el filtro *aclara* el morado y *empeora* el
contraste, que es justo lo que @s8 exige que no pase. El defecto del prototipo no es tener
el token: es **declararlo y no usarlo**, y taparlo con un filtro. Por eso @s11 no se
conforma con que exista: exige que *«`--color-primario-fuerte` está declarado **y además se
usa al menos una vez** en algún fichero de estilos del inventario»*. Se declara, se usa, y
**ningún módulo puede usar `filter: brightness()` sobre el primario**.

### 3.2 Regla de derivación

Cada variante tiene un **color rector** (el que lleva el texto) y un **color de acento**
(el que rotula). Todos los valores salen de mezclar en sRGB, canal a canal con redondeo
estándar, los tres colores de marca con blanco o negro puro:

| variante | fondo | rector | acento |
| --- | --- | --- | --- |
| `marca` | `#FFFFFF` | morado `#77286B` | verde profundo `#48704B` |
| `lima` | `#F8F9E8` (blanco + 10 % lima) | morado `#77286B` | verde profundo `#48704B` |
| `verde` | `#F0F4F1` (blanco + 8 % verde) | verde profundo `#48704B` | morado `#77286B` |
| `noche` | `#000000` | blanco `#FFFFFF` | lima `#B4C718` |

### 3.3 `marca` — fondo `#FFFFFF`

| Rol | Valor | Derivación | Se pinta sobre | Ratio | Exigido | Criterio |
| --- | --- | --- | --- | --- | --- | --- |
| `--color-fondo` | `#FFFFFF` | ya fijado | — | — | — | — |
| `--color-fondo-alterno` | `#F4EEF3` | blanco + 8 % morado | `#FFFFFF` | 1.14 | — | banda decorativa |
| `--color-superficie` | `#FFFFFF` | = fondo | `#FFFFFF` | 1.00 | — | la tarjeta se distingue por borde + sombra |
| `--color-superficie-elevada` | `#FAF6F9` | blanco + 4 % morado | `#FFFFFF` | 1.07 | — | superficie |
| `--color-tinta` | `#531C4B` | morado + 30 % negro | `#FFFFFF` | **12.84** | 7.0 | 1.4.6 AAA |
| | | | `#F4EEF3` | **11.23** | 7.0 | 1.4.6 AAA |
| | | | `#FAF6F9` | **11.99** | 7.0 | 1.4.6 AAA |
| `--color-texto` | `#77286B` | morado de marca *(ya fijado)* | `#FFFFFF` | **9.13** | 4.5 | 1.4.3 AA |
| | | | `#F4EEF3` | **7.99** | 4.5 | 1.4.3 AA |
| | | | `#FAF6F9` | **8.53** | 4.5 | 1.4.3 AA |
| | | | `#F6F8E3` | **8.46** | 4.5 | 1.4.3 AA |
| `--color-texto-suave` | `#925389` | morado + 20 % blanco | `#FFFFFF` | **5.50** | 4.5 | 1.4.3 AA |
| | | | `#F4EEF3` | **4.81** | 4.5 | 1.4.3 AA |
| | | | `#FAF6F9` | **5.13** | 4.5 | 1.4.3 AA |
| `--color-primario` | `#77286B` | morado de marca | `#FFFFFF` | **9.13** | 3.0 | 1.4.11 AA |
| | | | `#F4EEF3` | **7.99** | 3.0 | 1.4.11 AA |
| `--color-primario-fuerte` | `#6B2460` | morado + 10 % negro | `#FFFFFF` | **10.26** | 4.5 | 1.4.3 AA · @s8 |
| | | | `#F4EEF3` | **8.98** | 3.0 | 1.4.11 AA |
| `--color-sobre-primario` | `#FFFFFF` | blanco puro | `#77286B` | **9.13** | 4.5 | 1.4.3 AA |
| | | | `#6B2460` | **10.26** | 4.5 | 1.4.3 AA · **> 9.13**, @s8 |
| `--color-acento-tinta` | `#48704B` | verde profundo de marca | `#FFFFFF` | **5.68** | 4.5 | 1.4.3 AA |
| | | | `#F4EEF3` | **4.97** | 4.5 | 1.4.3 AA |
| | | | `#FAF6F9` | **5.31** | 4.5 | 1.4.3 AA |
| | | | `#F6F8E3` | **5.27** | 4.5 | 1.4.3 AA |
| `--color-acento-suave` | `#F6F8E3` | blanco + 12 % lima | `#FFFFFF` | 1.08 | — | fondo de píldora |
| `--color-borde` | `#DDC9DA` | blanco + 25 % morado | `#FFFFFF` | 1.56 | **exento** | decorativo: solo donde el borde **no** identifica un control |
| `--color-borde-control` | `#A06997` | blanco + 70 % morado | `#FFFFFF` | **4.23** | 3.0 | 1.4.11 AA |
| | | | `#F4EEF3` | **3.70** | 3.0 | 1.4.11 AA |
| | | | `#FAF6F9` | **3.95** | 3.0 | 1.4.11 AA |
| `--color-foco` | `#77286B` | ya fijado | `#FFFFFF` | **9.13** | 3.0 | 1.4.11 AA · 2.4.13 AAA |
| | | | `#F4EEF3` | **7.99** | 3.0 | 1.4.11 AA |

### 3.4 `lima` — fondo `#F8F9E8`

| Rol | Valor | Derivación | Sobre | Ratio | Exigido | Criterio |
| --- | --- | --- | --- | --- | --- | --- |
| `--color-fondo` | `#F8F9E8` | blanco + 10 % lima *(ya fijado)* | — | — | — | — |
| `--color-fondo-alterno` | `#F0F4D1` | blanco + 20 % lima | `#F8F9E8` | 1.06 | — | banda |
| `--color-superficie` | `#FFFFFF` | blanco puro | `#F8F9E8` | 1.07 | — | tarjeta elevada |
| `--color-superficie-elevada` | `#F8F9E8` | = fondo | `#FFFFFF` | 1.07 | — | campo dentro de tarjeta |
| `--color-tinta` | `#531C4B` | morado + 30 % negro | `#F8F9E8` | **12.05** | 7.0 | 1.4.6 AAA |
| | | | `#FFFFFF` | **12.84** | 7.0 | 1.4.6 AAA |
| | | | `#F0F4D1` | **11.35** | 7.0 | 1.4.6 AAA |
| `--color-texto` | `#77286B` | morado *(ya fijado, 8.57 en el contrato)* | `#F8F9E8` | **8.57** | 4.5 | 1.4.3 AA |
| | | | `#FFFFFF` | **9.13** | 4.5 | 1.4.3 AA |
| | | | `#F0F4D1` | **8.07** | 4.5 | 1.4.3 AA |
| | | | `#EFF3CC` | **7.98** | 4.5 | 1.4.3 AA |
| `--color-texto-suave` | `#925389` | morado + 20 % blanco | `#F8F9E8` | **5.16** | 4.5 | 1.4.3 AA |
| | | | `#FFFFFF` | **5.50** | 4.5 | 1.4.3 AA |
| | | | `#F0F4D1` | **4.86** | 4.5 | 1.4.3 AA |
| `--color-primario` | `#77286B` | morado | `#F8F9E8` | **8.57** | 3.0 | 1.4.11 AA |
| | | | `#FFFFFF` | **9.13** | 3.0 | 1.4.11 AA |
| `--color-primario-fuerte` | `#6B2460` | morado + 10 % negro | `#F8F9E8` | **9.63** | 3.0 | 1.4.11 AA |
| `--color-sobre-primario` | `#FFFFFF` | blanco | `#77286B` | **9.13** | 4.5 | 1.4.3 AA |
| | | | `#6B2460` | **10.26** | 4.5 | 1.4.3 AA · **> 9.13** |
| `--color-acento-tinta` | `#48704B` | verde profundo | `#F8F9E8` | **5.33** | 4.5 | 1.4.3 AA |
| | | | `#FFFFFF` | **5.68** | 4.5 | 1.4.3 AA |
| | | | `#F0F4D1` | **5.02** | 4.5 | 1.4.3 AA |
| | | | `#EFF3CC` | **4.97** | 4.5 | 1.4.3 AA |
| `--color-acento-suave` | `#EFF3CC` | blanco + 22 % lima | `#F8F9E8` | 1.13 | — | píldora, distinguible del fondo pálido |
| `--color-borde` | `#DDC9DA` | blanco + 25 % morado | `#FFFFFF` | 1.56 | **exento** | decorativo |
| | | | `#F8F9E8` | 1.47 | **exento** | decorativo |
| `--color-borde-control` | `#A06997` | blanco + 70 % morado | `#F8F9E8` | **3.97** | 3.0 | 1.4.11 AA |
| | | | `#FFFFFF` | **4.23** | 3.0 | 1.4.11 AA |
| | | | `#F0F4D1` | **3.74** | 3.0 | 1.4.11 AA |
| `--color-foco` | `#77286B` | ya fijado | `#F8F9E8` | **8.57** | 3.0 | 1.4.11 AA |
| | | | `#FFFFFF` | **9.13** | 3.0 | 1.4.11 AA |

Control: el lima de marca sobre el fondo de `lima` da **1.77** — el mismo número que @s4
ya ancla (`tokensColor.test.ts:78`). No se usa como texto en ninguna parte.

### 3.5 `verde` — fondo `#F0F4F1`. **DECIDIDO: el escalón no se baja.**

> **Esta sección decía «aquí el escalón se rompe y hay que decidir» y proponía una
> opción A que cambiaba `--color-texto` de `#48704B` a `#3A5A3C`. Esa opción está
> MUERTA.** El contrato aprobado la prohíbe con todas las letras, en su sección «QUÉ NO
> SE REABRE»: *«Los 3 roles de color ya fijados por `sistema_de_diseno_visual.feature`
> @s2-@s10 (`--color-fondo`, `--color-texto`, `--color-foco` **en las 4 variantes**,
> `src/styles/_tokens.scss:39-64`) se CONSERVAN tal cual. Esta feature **añade** roles;
> no retoca los tres existentes.»* No hay puerta humana que pedir: ya se pidió, y la
> respuesta fue no tocarlos. Se decide, por tanto, **sobre la restricción**, no contra
> ella (§9, divergencia D-13).

**El hecho, medido y no opinado.** Con `--color-texto` clavado en `#48704B`, su ratio
sobre el propio `--color-fondo` de la variante es **5.12**. Un `--color-texto-suave`
tiene que ser, por definición del rol, **más claro** que el cuerpo, y sobre fondo claro
más claro significa **menos ratio**. El mínimo de SC 1.4.3 es 4.5. Luego toda la ventana
disponible es `[4.50, 5.12]`, y aquí está barrida con la fórmula real:

| candidato | derivación | sobre `#F0F4F1` | sobre `#FFFFFF` | sobre `#E9EEE9` |
| --- | --- | --- | --- | --- |
| `#48704B` *(el propio texto)* | verde de marca | **5.12** | 5.68 | 4.84 |
| `#4D7450` | verde + 3 % blanco | 4.81 | 5.34 | 4.55 |
| `#517754` | verde + 5 % blanco | 4.59 | 5.10 | 4.29 ✗ |
| `#577B59` | verde + 8 % blanco | 4.32 ✗ | 4.79 | 4.03 ✗ |

El mejor candidato que sobrevive sobre las tres superficies es `#4D7450`, con **4.81**
frente a **5.12**: una diferencia de ratio del **6 %**, que a 14-17 px no la distingue
nadie. **No es un problema de buscar mejor: es que la ventana no existe.** Y no se puede
abrir moviendo el `--color-fondo-alterno`, porque el techo lo pone el `--color-fondo`
`#F0F4F1`, que también está bloqueado por el contrato.

**LA DECISIÓN: en `verde`, `--color-texto-suave` vale `#48704B`, deliberadamente igual
que `--color-texto`.** La jerarquía del texto secundario la llevan la escala tipográfica
y el peso, no el color. No es una excepción inventada para salir del paso: es
**exactamente el mismo movimiento que este plan ya hace en `noche`**, donde
`--color-tinta` = `--color-texto` = `#FFFFFF` (§3.6, punto 3) por la razón simétrica. Un
`#4D7450` que finge un peldaño que el ojo no ve sería peor: pasaría la puerta de contraste
y **no resolvería el problema**, que es el defecto que este mismo plan le reprocha al
prototipo en `estudio_diseno_referencia.md` §7.4 (*«pasa por los pelos»*).

**Y hay un peldaño real donde sí cabe: el de arriba.** `--color-tinta` `#324E35` da
**8.31** sobre el fondo frente a los 5.12 del cuerpo — un 62 % más de ratio. `verde`
tiene dos peldaños de texto (tinta / cuerpo), no tres. Se declara y se dice.

**PENDIENTE, con destinatario: el HUMANO.** Si se quiere un tercer peldaño de texto en
`verde`, el único camino es **oscurecer `--color-texto` de esa variante**, y eso es
enmendar un escenario de una feature ya `done` (`sistema_de_diseno_visual.feature` @s5,
anclado en `tokensColor.test.ts:99-104` con `expect(texto).toBe('#48704B')` y
`expect(ratio).toBe(5.12)`). **No le toca al `tdd_craftsman` ni a este plan.** La
propuesta concreta, ya calculada por si se pide: `--color-texto` `#3A5A3C` (verde + 20 %
negro, **6.99** sobre `#F0F4F1`), que reabre la ventana a `[4.50, 6.99]` y deja
`#48704B` libre para `--color-texto-suave`.

**Segunda corrección de esta sección.** Decía también: *«ningún aclarado del verde llega
a 3:1 para `--color-borde-control`»*. **Es falso, y el desmentido estaba en su propia
tabla.** Lo que se midió fueron aclarados fuertes (blanco + 65 % verde = 2.49). Pero el
borde de control no tiene por qué ser pálido: `#5A7E5D` (verde + 10 % blanco) da **4.13**
sobre el fondo, **3.90** sobre el alterno y **4.59** sobre la superficie blanca. Los tres
por encima del 3.0 de SC 1.4.11, con margen. No hay nada que decidir aquí tampoco.

**Tercera corrección: `--color-fondo-alterno` baja de `blanco + 16 %` a `blanco + 12 %`.**
Con `#E2E8E2` (16 %) el cuerpo `#48704B` encima daba **4.57**: pasa por 0.07. Con
`#E9EEE9` (12 %) da **4.84**, margen 0.34, y la banda sigue siendo un escalón visible
(1.06 contra el fondo, el mismo escalón que ya se aceptó en `lima`). @s26 solo exige que
los fondos computados sean **distintos**, no un ratio mínimo entre ellos; @s5 sí exige
4.5 duro. Se protege el número que tiene puerta.

| Rol | Valor | Derivación | Sobre | Ratio | Exigido | Criterio |
| --- | --- | --- | --- | --- | --- | --- |
| `--color-fondo` | `#F0F4F1` | blanco + 8 % verde *(ya fijado, NO se toca)* | — | — | — | — |
| `--color-fondo-alterno` | `#E9EEE9` | blanco + 12 % verde | `#F0F4F1` | 1.06 | — | banda |
| `--color-superficie` | `#FFFFFF` | blanco | `#F0F4F1` | 1.11 | — | tarjeta |
| `--color-superficie-elevada` | `#F0F4F1` | = fondo | `#FFFFFF` | 1.11 | — | campo dentro de tarjeta |
| `--color-tinta` | `#324E35` | verde + 30 % negro | `#F0F4F1` | **8.31** | 7.0 | 1.4.6 AAA |
| | | | `#FFFFFF` | **9.22** | 7.0 | 1.4.6 AAA |
| | | | `#E9EEE9` | **7.85** | 7.0 | 1.4.6 AAA |
| `--color-texto` | `#48704B` | verde de marca *(ya fijado, NO se toca)* | `#F0F4F1` | **5.12** | 4.5 | 1.4.3 AA |
| | | | `#FFFFFF` | **5.68** | 4.5 | 1.4.3 AA |
| | | | `#E9EEE9` | **4.84** | 4.5 | 1.4.3 AA |
| `--color-texto-suave` | `#48704B` | **= `--color-texto`, decidido arriba** | `#F0F4F1` | **5.12** | 4.5 | 1.4.3 AA |
| | | | `#E9EEE9` | **4.84** | 4.5 | 1.4.3 AA |
| `--color-primario` | `#48704B` | verde de marca | `#F0F4F1` | **5.12** | 3.0 | 1.4.11 AA |
| `--color-primario-fuerte` | `#416544` | verde + 10 % negro | `#F0F4F1` | **5.97** | 3.0 | 1.4.11 AA |
| `--color-sobre-primario` | `#FFFFFF` | blanco | `#48704B` | **5.68** | 4.5 | 1.4.3 AA |
| | | | `#416544` | **6.63** | 4.5 | 1.4.3 AA · **> 5.68**, @s8 |
| `--color-acento-tinta` | `#77286B` | morado de marca | `#F0F4F1` | **8.22** | 4.5 | 1.4.3 AA |
| | | | `#FFFFFF` | **9.13** | 4.5 | 1.4.3 AA |
| | | | `#E9EEE9` | **7.77** | 4.5 | 1.4.3 AA |
| | | | `#F4EEF3` | **7.99** | 4.5 | 1.4.3 AA |
| `--color-acento-suave` | `#F4EEF3` | blanco + 8 % morado | `#F0F4F1` | 1.03 | — | píldora |
| `--color-borde` | `#D7E0D7` | blanco + 22 % verde | `#FFFFFF` | 1.35 | **exento** | decorativo |
| | | | `#F0F4F1` | 1.22 | **exento** | decorativo |
| `--color-borde-control` | `#5A7E5D` | verde + 10 % blanco | `#F0F4F1` | **4.13** | 3.0 | 1.4.11 AA |
| | | | `#FFFFFF` | **4.59** | 3.0 | 1.4.11 AA |
| | | | `#E9EEE9` | **3.90** | 3.0 | 1.4.11 AA |
| `--color-foco` | `#77286B` | morado *(ya fijado, NO se toca)* | `#F0F4F1` | **8.22** | 3.0 | 1.4.11 AA |
| | | | `#FFFFFF` | **9.13** | 3.0 | 1.4.11 AA |

**Coste de esta decisión sobre los tests existentes: CERO.** `tokensColor.test.ts:99-104`
sigue verde palabra por palabra, porque los tres roles que asevera no se tocan. La opción
A costaba dos aserciones rotas y una puerta humana; esta no cuesta ninguna de las dos.

### 3.6 `noche` — fondo `#000000`. **La variante donde los roles cambian de verdad.**

El morado da **2.30** contra negro puro: no puede ser texto **ni borde ni relleno de
botón** ahí (un botón relleno a 2.30 contra el fondo incumple SC 1.4.11, que es
justamente lo que exige que el componente sea identificable). Las superficies suben en
escalones de morado sobre negro; el texto baja de blanco a lavanda.

| Rol | Valor | Derivación | Sobre | Ratio | Exigido | Criterio |
| --- | --- | --- | --- | --- | --- | --- |
| `--color-fondo` | `#000000` | negro puro *(ya fijado)* | — | — | — | — |
| `--color-fondo-alterno` | `#180815` | negro + 20 % morado | `#000000` | 1.08 | — | banda |
| `--color-superficie` | `#240C20` | negro + 30 % morado | `#000000` | 1.15 | — | tarjeta elevada |
| `--color-superficie-elevada` | `#30102B` | negro + 40 % morado | `#240C20` | 1.08 | — | campo dentro de tarjeta (en oscuro el campo **sube**, no baja) |
| `--color-tinta` | `#FFFFFF` | blanco puro | `#000000` | **21.00** | 7.0 | 1.4.6 AAA |
| | | | `#240C20` | **18.29** | 7.0 | 1.4.6 AAA |
| | | | `#30102B` | **17.01** | 7.0 | 1.4.6 AAA |
| | | | `#180815` | **19.37** | 7.0 | 1.4.6 AAA |
| `--color-texto` | `#FFFFFF` | blanco *(ya fijado, 21.00)* | `#000000` | **21.00** | 4.5 | 1.4.3 AA |
| | | | `#240C20` | **18.29** | 4.5 | 1.4.3 AA |
| `--color-texto-suave` | `#C29EBC` | morado + 55 % blanco | `#000000` | **8.91** | 4.5 | 1.4.3 AA |
| | | | `#240C20` | **7.76** | 4.5 | 1.4.3 AA |
| | | | `#30102B` | **7.22** | 4.5 | 1.4.3 AA |
| | | | `#180815` | **8.22** | 4.5 | 1.4.3 AA |
| `--color-primario` | `#B489AE` | morado + 45 % blanco | `#000000` | **7.13** | 3.0 | 1.4.11 AA |
| | | | `#240C20` | **6.21** | 3.0 | 1.4.11 AA |
| `--color-primario-fuerte` | `#BC95B6` | primario + 10 % **blanco** (aquí se ACLARA: ver el aviso de abajo) | `#000000` | **8.11** | 3.0 | 1.4.11 AA |
| `--color-sobre-primario` | `#000000` | **negro, no blanco** | `#B489AE` | **7.13** | 4.5 | 1.4.3 AA |
| | | | `#BC95B6` | **8.11** | 4.5 | 1.4.3 AA · **> 7.13** |
| `--color-acento-tinta` | `#B4C718` | lima de marca | `#000000` | **11.12** | 4.5 | 1.4.3 AA |
| | | | `#240C20` | **9.69** | 4.5 | 1.4.3 AA |
| | | | `#1B1E04` | **9.01** | 4.5 | 1.4.3 AA |
| | | | `#180815` | **10.26** | 4.5 | 1.4.3 AA |
| `--color-acento-suave` | `#1B1E04` | negro + 15 % lima | `#000000` | 1.23 | — | píldora |
| `--color-borde` | `#471840` | negro + 60 % morado | `#240C20` | 1.28 | **exento** | decorativo |
| | | | `#000000` | 1.47 | **exento** | decorativo |
| `--color-borde-control` | `#A7739F` | morado + 35 % blanco | `#000000` | **5.60** | 3.0 | 1.4.11 AA |
| | | | `#240C20` | **4.87** | 3.0 | 1.4.11 AA |
| | | | `#30102B` | **4.53** | 3.0 | 1.4.11 AA |
| `--color-foco` | `#B4C718` | lima *(ya fijado por @s8)* | `#000000` | **11.12** | 3.0 | 1.4.11 AA |
| | | | `#240C20` | **9.69** | 3.0 | 1.4.11 AA |

**Los CUATRO cambios de rol de `noche`, y por qué:**

1. **`--color-sobre-primario` es NEGRO, no blanco.** Es el único de los cuatro donde el
   texto sobre la acción no es blanco: blanco sobre `#B489AE` da **2.95** (suspenso).
2. **`--color-primario` NO puede ser el lima**, aunque el lima sea el color más legible
   sobre negro (11.12). Motivo decisivo y medido: **`--color-foco` ya es el lima en
   `noche`** (@s8 lo cerró), y un anillo de foco lima alrededor de un botón lima da
   **1.00** — el anillo desaparecería en el control más importante de la página. Es
   literalmente el bug del §3.7 repetido. Por eso el primario es un morado aclarado, que
   conserva la identidad de marca **y** deja el anillo lima a 11.12 contra el fondo.
3. **`--color-tinta` = `--color-texto` = `#FFFFFF`.** En `noche` no hay dos peldaños de
   blanco: la jerarquía la lleva la escala tipográfica, no el color. Se declara
   explícitamente en vez de inventar un «blanco roto» que sería ruido.
4. **`--color-primario-fuerte` se ACLARA, no se oscurece.** En las tres variantes claras
   el hover mezcla el primario con **negro** al 10 %, porque `--color-sobre-primario` es
   blanco y oscurecer el relleno sube el ratio. En `noche` `--color-sobre-primario` es
   **negro**, así que la regla ingenua se da la vuelta: recalculado, `#B489AE` + 10 %
   negro da `#A27B9D` y el ratio contra el negro **cae de 7.13 a 5.86** — el hover
   *empeoraría* el contraste, exactamente el defecto que @s8 existe para prohibir. La
   regla correcta, y la que se escribe, es **invariante**: *el estado con el puntero
   encima mezcla el primario un 10 % con el polo OPUESTO a `--color-sobre-primario`*.
   En `marca`/`lima`/`verde` ese polo es el negro; en `noche` es el blanco.
   Verificado en las cuatro: 9.13→10.26, 9.13→10.26, 5.68→6.63 y 7.13→8.11.
   **Las cuatro mejoran, que es lo que @s8 exige.**

### 3.7 El anillo de foco y el `outline-offset`: por qué 2px es funcional, no estético

Medido: `--color-foco` sobre `--color-primario` da **1.00 en `marca` y `lima`** (son el
mismo morado), **1.61 en `verde`** y **1.56 en `noche`**. Es decir: **el anillo de foco es
invisible contra el relleno del botón primario en las cuatro variantes.**

No es un defecto de la paleta: es la razón de ser del `outline-offset: 2px` de
`_tokens.scss:124`. Con offset, los vecinos del anillo son el hueco de 2px (que muestra el
fondo) y el fondo de la página, y ahí el ratio es 9.13 / 8.57 / 8.22 / 11.12 — todos ≥3.

**Consecuencia dura para el implementador:** ningún módulo puede poner
`outline-offset: 0` ni pintar el anillo *dentro* del control (`box-shadow` interior).
Y esto **no** lo puede comprobar ningún test de texto: es un caso de nivel C (§4.4).

Es además la lección del **botón invisible** del spike: el enlace «Reservar» renderizaba
`color: rgb(119,40,107)` sobre `background: rgb(119,40,107)`, **ratio 1:1**, y ninguna de
las 712 pruebas podía verlo. Con `--color-sobre-primario` como rol propio, ese par pasa a
ser 9.13 **por construcción**, y el par entra en la matriz de uso.

### 3.8 `--sombra-reposo` y `--sombra-elevada`, en las 4 variantes

Los otros dos tokens que este plan no tenía y que @s1/@s2 exigen. Se derivan de tres
piezas, cada una con su procedencia, y ninguna de las tres es un color del prototipo.

**A. La GEOMETRÍA se porta; es arquitectura, no color.** Del prototipo
(`estudio_diseno_referencia.md` §3.2, valores en su `:24`): reposo `0 6px 18px`, elevada
`0 18px 45px`. Es la proporción que el estudio describe y justifica —*«mucho difuminado,
poca opacidad»*, desplazamiento vertical grande, difuminado muy grande— y es la que hace
que se lea como profundidad y no como suciedad. **Dos escalones y ni uno más**: la elevada
solo aparece en hover de tarjeta, panel del chat, panel flotante del selector e imagen de
artículo.

**B. Las OPACIDADES también se portan, y también son geometría.** `.07` en reposo y `.10`
en elevada para las variantes claras. Para la variante oscura el propio prototipo declara
el refuerzo, y es correcto: sobre un fondo negro una sombra a `.07` **no existe**. Se
refuerza a `.35` / `.45`.

**C. El COLOR NO se porta. Se sustituye por la tinta de cada variante.** El prototipo tiñe
con `rgb(15, 32, 60)`, un azul marino que es *su* tinta. La Decisión 8 y la línea roja de
esta feature prohíben tomar un solo color suyo, así que cada variante tiñe su sombra con
**su propio `--color-tinta`**, que es exactamente lo que el estudio dice que hace el
prototipo: *«sombra teñida con el color de la tinta, no gris»*. Se porta la REGLA, no el
valor.

| variante | `--color-tinta` | canales | `--sombra-reposo` | `--sombra-elevada` |
| --- | --- | --- | --- | --- |
| `marca` | `#531C4B` | `83, 28, 75` | `0 6px 18px rgba(83, 28, 75, 0.07)` | `0 18px 45px rgba(83, 28, 75, 0.10)` |
| `lima` | `#531C4B` | `83, 28, 75` | `0 6px 18px rgba(83, 28, 75, 0.07)` | `0 18px 45px rgba(83, 28, 75, 0.10)` |
| `verde` | `#324E35` | `50, 78, 53` | `0 6px 18px rgba(50, 78, 53, 0.07)` | `0 18px 45px rgba(50, 78, 53, 0.10)` |
| `noche` | `#FFFFFF` ⚠ | `0, 0, 0` | `0 6px 18px rgba(0, 0, 0, 0.35)` | `0 18px 45px rgba(0, 0, 0, 0.45)` |

⚠ **La excepción de `noche`, y por qué no es una arbitrariedad.** La regla «tiñe con la
tinta» se rompe sola en `noche`, porque allí `--color-tinta` es `#FFFFFF` (§3.6, punto 3)
y **una sombra blanca sobre negro no es una sombra: es un halo**. La sombra modela una
oclusión de luz; su color no puede ser más claro que la superficie que la recibe. En
`noche` se tiñe con negro puro, que es a la vez el `--color-fondo` de la variante, y el
efecto de profundidad lo lleva **la opacidad reforzada**, no el tono. Escrito aquí para
que nadie lo «arregle» más adelante creyendo que es un despiste.

**Dónde viven, y por qué no pueden vivir en otro sitio.** En los cinco bloques de
`src/styles/_tokens.scss` (el `:root` desnudo + los cuatro de variante).
`puertaLiteralesColor.ts:27-30,56` señala **cualquier** `rgba()` de cualquier línea de
`src/components/*.module.scss` y `src/pages/*.module.scss`; `_tokens.scss` **no está en
ese glob** (`inventarioModulos.test.ts:88-89`). Un módulo que quiera sombra escribe
`box-shadow: var(--sombra-reposo);` y nada más.

**Consecuencia para el lector de tokens, y es la razón del §2.5.** Estos dos valores
**no son hexadecimales de 6 dígitos**, así que `leerTokenDeVariante`
(`tokensColor.ts:50-58`) no puede leerlos hoy. Es el PENDIENTE 12 del contrato, resuelto
en §2.5.

**Lo que estos dos tokens NO llevan.** Ni ratio ni umbral: una sombra es decorativa y no
entra en la matriz de uso de @s5 —igual que `--color-borde`, y por el mismo motivo—.
Tampoco pasan por `calcularRatioContraste`, que exige `#RRGGBB` y **lanzaría** con un
`rgba()`. Si alguien las mete en el catálogo de contraste, la excepción es el aviso.

---

## 4 · LA ESTRATEGIA DE VERIFICACIÓN EN TRES NIVELES

Es lo que impide que esto se repita. El reparto lo tomo de `estudio_nailslash.md` §3.5,
donde ya está probado: A = «la declaración está escrita», B = «lo publicado dice lo que
creemos», C = «el navegador lo pinta».

### 4.1 Nivel A — módulo puro + Vitest (y StrykerJS lo muerde)

**Instrumento:** funciones puras en `src/lib/diseno/*.ts`, con su `*.test.ts`, dentro de
`stryker.config.json` (`mutate: src/lib/**/*.ts`, `break: 100`).

**Qué se lleva a este nivel:** **toda derivación de valores.**

- `mezclaDeColor.ts` → `mezclar('#FFFFFF', '#77286B', 0.08) === '#F4EEF3'`. Hoy esa
  aritmética vive **duplicada dentro del test** (`tokensColor.test.ts:57-64,93-100`), donde
  Stryker no la ve. Extraerla es lo que convierte los 15 roles × 4 variantes en
  verificación mutada.
- `tokensColor.ts` ampliado: `RolDeColor` pasa de 3 a **15** valores, nace `RolDeSombra`
  con 2, y **cada rol nuevo necesita su fila en la matriz de uso** (qué se pinta sobre
  qué). Un token que existe y no se verifica es el bloqueante del botón «Reservar»
  repitiéndose. Los dos lectores hermanos y sus doce tests: §2.5.
- `hojaGlobal.ts` → el enganche: `main.tsx` importa `./styles/global.scss` **exactamente
  una vez**, ningún otro fichero de `src/` lo importa, y `global.scss` declara las nueve
  familias de @s13. Con **guarda de no-vacuidad propia**.
- `contraste.ts` **no se toca**: ya está `done`, probada al 100 % y con las tres puertas
  por uso (texto normal / texto grande / componente) y sus tres guardas separadas
  (`contraste.ts:220-256`).

**Lectura del texto SCSS:** con `import.meta.glob(..., { query: '?raw' })`, **nunca** con
`readFileSync`. WebEmpresa y NailsLash usan `readFileSync(process.cwd() + ruta)`; la vía
de Galapavet es **estrictamente mejor** (resiste cambios de cwd y está calibrada en
`vite.config.ts:65` para no romper jsdom). No se porta `readFileSync`.

**Regla transversal, no negociable:** los esperados van **escritos a mano**, jamás
importados del símbolo que se vigila. `hero-estilos.test.ts:16-18` de NailsLash: *«se LEEN
del SCSS, jamás se importan como símbolo»*. Importar `PARES_ESPERADOS` para compararlo
consigo mismo es tautología; escribirlo a mano es lo que impide que alguien lo vacíe sin
que nada se ponga rojo.

### 4.2 Nivel B — la técnica de NailsLash: **aseverar sobre el CSS sin navegador**

Son **dos técnicas distintas** y el estudio deja claro que NailsLash **nunca** compila
Sass dentro de Vitest (`grep "sass|compileString"` → 0 llamadas reales; `?raw` → 0;
`vitest.config.ts:15` → `css: false`).

**B-1 · El parser de llaves sobre el TEXTO FUENTE del `.scss`.**
El código exacto está en `hero-estilos.test.ts:26-57` y se repite literal en otros cuatro
ficheros: `cuerpoDelBloque(fuente, encabezado)` localiza el primer bloque cuyo encabezado
casa la regex y **cuenta llaves** para devolver su cuerpo respetando el anidamiento
(`@keyframes`, `@media`). Encima se monta una escalera de ayudantes: `reglaBase(clase)`,
`cuerpoKeyframe(nombre)`, `magnitud(cuerpo, prop)` (devuelve un **número**, lo que permite
comparar `<` y `>`), `reglas(fuente)` (enumera **todas** las reglas de nivel superior como
`{selector, cuerpo}`), `selectoresDe(sel)`, `sinComentarios(fuente)`.

Es superior a un `toMatch` sobre el fichero entero, y la diferencia importa: una regex
suelta prueba que la propiedad está *en algún sitio*; el parser prueba que está **dentro
de la regla correcta**.

**Con B-1 se PUEDE afirmar** (lista tomada de `estudio_nailslash.md` §3.3, cada entrada
con su ejemplo real en ese repo):

- **Presencia** de una declaración (`reglaBase('body')` contiene `font-family:`).
- **AUSENCIA** de una declaración — `not.toMatch(/outline:\s*(none|0)/)`.
- **Valor literal** de una propiedad, y **qué token** se usa y no otro.
- **Relaciones numéricas** entre valores (móvil `<` escritorio) y **cotas**.
- **Unidad** de un valor.
- **Estructura del selector**: cuántas reglas hay que nombran `h1..h6`, y que sean
  **exactamente una** regla conjunta y no seis. Un `toMatch` no puede afirmar eso.
- **Especificidad por forma**: `not.toMatch(/[.#]/)` sobre cada selector del parcial
  global → imposible que la capa global suba de especificidad sin ponerse roja.
- **Existencia de un `@media`** y su contenido.
- **Que la hoja global esté ENGANCHADA** desde `main.tsx` — la aserción anti-vacuidad.
- **Higiene**: cero `!important`, cero `@import url(`, cero `url(https:`, cero
  `@font-face` fuera de `_fuentes.scss`.
- **Simular `reduce` sin evaluar el media query**: `stripNoPreference()`
  (`Servicios.reveal.test.tsx:100-120` de WebEmpresa) **borra** todos los bloques
  `no-preference` y asevera sobre lo que queda. Es la técnica para el Invariante 4.

**Con B-1 NO se puede afirmar** —y el repo lo escribe en cada sitio, usando la palabra
**«PROXY»** para que nadie confunda verde con funciona—: qué fuente **pinta** el
navegador; prominencia o tamaño percibido; la **resolución real de especificidad**; gesto
táctil o scroll; que una animación corra y termine; contraste real compuesto; que el
`@font-face` esté **cargado**.

**B-2 · La puerta de build sobre el CSS COMPILADO de `dist/`.**
`tools/puerta-terceros.ts:67-77` hace `readdirSync(dist, {recursive:true})` filtrando
`/\.(html|css)$/i` y `readFileSync` sobre los `.css` que Vite **ya compiló y minificó**.
Extrae los `@font-face` con `/@font-face([^}]*)\}/g` (sirve para `@font-face {` y para la
minificada `@font-face{`), trocea declaraciones con `/([a-z-]+):([^;}]*)/g`, deriva el par
`[familia, peso]` y compara por **igualdad de conjuntos** contra una lista declarada.

Cinco propiedades que lo hacen robusto y que se portan tal cual:
1. **Igualdad de conjuntos, no un mínimo** — crece con el diseño, nadie sube un número.
2. **Se cuentan PARES, no ficheros** — cada `@font-face` emite `woff2` **y** `woff`, y un
   `.woff2` por debajo de `assetsInlineLimit` **no deja fichero** (se inlinea a `data:`).
   Contar ficheros es frágil por razones ajenas a la feature.
3. **Se mide el ARTEFACTO, no los `import` de `src/`** — un test que leyera los imports
   sería ciego a un `@font-face` que entre por otra vía.
4. **Falla cerrada**: cualquier excepción → exit 1. *«Una puerta que se traga su propia
   excepción y devuelve `[]` es PEOR que no tener puerta, porque además da confianza»*.
5. **Sobrevive a la minificación**: `@s37` pega el CSS minificado real de `dist/` en el
   test, con hashes y todo. Vite **quita las comillas**: `font-family:Gilda Display` sin
   comillas y con el espacio. Ese `[I]` se **midió**, no se supuso.
   Más dos guardas anti-vacuidad: lista de pares vacía → exit 1; `dist/` vacío → exit 1
   (*«0 fallos sobre 0 fuentes NO ES ESTAR PROTEGIDO: ES NO HABER MIRADO»*).

El puente entre A y B: `home-horneado.test.ts:23-33` **ejecuta el `pnpm build` real** en
un `beforeAll` y asevera `codigoSalida === 0`. Precio declarado: `fileParallelism: false`
en `vitest.config.ts` (dos builds en paralelo se pisan el artefacto), y ese fichero **no
importa nada de `src/lib/`** o Stryker lo re-ejecutaría por cada mutante.

**Para Galapavet, B-2 pasa de «no ata» a bloqueante en el momento en que entren las
fuentes.** Hoy `package.json:13` es `tsc -b && vite build`, sin ninguna puerta encadenada.
Con `_fuentes.scss` habrá exactamente **4 pares esperados**: `['Outfit', 100 900]`,
`['DM Sans', 100 1000]`, `['Outfit Fallback', …]`, `['DM Sans Fallback', …]`.
⚠ **NO VERIFICADO**: cómo minifica Lightning CSS 1.33.0 un `font-weight: 100 900` (rango)
y un `src: local('Arial')` — hay que medirlo sobre el `dist/` real antes de escribir la
regex, exactamente como NailsLash midió el suyo.

### 4.3 Nivel C — navegador real

**Instrumento:** Playwright 1.62.1 + `@axe-core/playwright` 4.13.0, `testDir: tests/e2e`,
`webServer` = `pnpm build && vite preview --port 4173 --strictPort`, `retries: 0`.
Se mide **`dist/`, nunca el dev server**: es la única forma de que el diagnóstico
(«0 `font-family` en el CSS generado») sea reproducible como test.

**Qué se mide, con la API del navegador** (lista tomada del sondeo real de NailsLash,
`verificacion_viva_hero_marca.md:87-102`):

```
getComputedStyle(document.body).fontFamily
getComputedStyle(document.body).backgroundColor
getComputedStyle(document.body).margin
document.fonts.check('16px "DM Sans"') / ('24px Outfit')
performance.getEntriesByType('resource')  → n_externas === 0 ; ningún status 404
document.scrollingElement.scrollWidth === clientWidth  a 320px
getAnimations() bajo prefers-reduced-motion: reduce → []
consola: 0 errores / 0 warnings
```

Con **recuento de elementos medidos > 0** y un **control**: un script que mida el
`font-family` del `body` y no encuentre elementos debe **parar en rojo**, no reportar «sin
violaciones».

axe con `withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa'])` —`wcag22aa` es
**imprescindible y suficiente** para activar `target-size`, que viene `enabled: false`—.
**No usar `.options()`**: *"Will override any other configured options"* anularía las
etiquetas.

Y lo que axe **no** cubre y hay que escribir a mano: **no hay regla de axe para SC 2.4.11
Focus Not Obscured**. Se escribe: enfocar cada tabulable y comprobar que su caja no queda
íntegramente bajo la cabecera fija.

### 4.4 Los cuatro síntomas medidos hoy → con qué nivel se caza cada uno

| Síntoma medido el 23/08/2026 | Nivel que lo caza | Cómo, exactamente |
| --- | --- | --- |
| **`body` computa a "Times New Roman"** (0 `font-family` en todo el CSS) | **A + B-1 para la causa; C para el efecto** | **A/B-1** cazan la causa: (1) `hojaGlobal.ts` asevera que `src/main.tsx` contiene `import './styles/main.scss'` y que `main.scss` hace `@use 'tipografia'` — *«un `_tipografia.scss` perfecto que nadie importa NO llega al sitio: verde por vacuidad»*; (2) el parser de llaves asevera que `reglaBase('body')` **nombra** su `font-family` y que hay **exactamente una** regla que nombra `h1..h6`. **Pero ninguno de los dos sabe qué fuente pinta el navegador.** Eso es **C**: `getComputedStyle(document.body).fontFamily` y `document.fonts.check('16px "DM Sans"') === true`. Es literalmente el fallo que en NailsLash *«SOLO la verificación en vivo cazó»*, con la suite en verde. |
| **`body` sin fondo** (`rgba(0,0,0,0)`) y **margen de 8px del navegador** | **A/B-1 lo previene; C lo demuestra** | **B-1**: `reglaBase('body')` contiene `background-color: var(--color-fondo)`, `color: var(--color-texto)` y `margin: 0`, y `_reset.scss` no lleva `!important`. **C**: `getComputedStyle(document.body).margin === '0px'` y `backgroundColor` resuelve al hex de la variante activa. El margen de 8px es hoja del user-agent (spec HTML), así que solo el navegador real puede confirmar que se anuló. |
| **26 rutas de imagen en 404** (`public/` no existe) | **C, y solo C** | Ni A ni B lo ven: A lee texto, y B-2 inspecciona `dist/**/*.{html,css}` — un `<img src>` que apunta a un fichero que no existe **está perfectamente escrito**. Se caza con `performance.getEntriesByType('resource')` filtrando `responseStatus === 404`, y con `page.on('response')`. Complemento barato de nivel A: una puerta que compare el inventario de rutas declaradas en `src/data/*.ts` contra los ficheros reales de `public/` — pero eso comprueba que el fichero **existe**, no que se **sirva**. |
| **Botón «Reservar» invisible: `color` y `background` idénticos, ratio 1:1** | **A lo previene; C lo verifica** | **A**: en cuanto `--color-sobre-primario` existe como rol y entra en la matriz de uso, el par `(#FFFFFF, #77286B)` se calcula y da 9.13; un módulo que pinte texto con `var(--color-texto)` sobre `var(--color-primario)` es un error que la matriz **no** ve, porque la matriz vigila tokens, no usos. **C es el que lo cierra**: axe `color-contrast` mide el color computado del elemento pintado contra su fondo real tras la cascada. jsdom **no computa la cascada de un elemento pintado**, así que ninguna de las 712 pruebas actuales podía verlo ni podría verlo ninguna prueba futura escrita con las herramientas de hoy. |

**La frontera se declara en el Gherkin**, no en un comentario: los escenarios de nivel C
llevan etiqueta propia `@verificacion-viva`, **no son puerta unitaria**, y su resultado se
escribe en `progress/`. Plantilla en `features/tipografia_global.feature:218-246`. Y un
matiz que evita un falso negativo: *«se descargan SOLO los pesos realmente USADOS; un peso
horneado que ninguna regla invoque puede NO descargarse, y no descargarlo NO es un
fallo»* — la puerta B-2 exige el `@font-face` **en el CSS**, no la descarga. Son dos cosas
distintas y confundirlas produce alarmas falsas.

---

## 5 · ORDEN DE EJECUCIÓN

Cada paso empieza por su test rojo. El orden va de la causa raíz hacia afuera.

> **Paso 0 (antes de cualquier código): la ampliación del contrato.**
> `features/sistema_de_diseno_visual.feature` (525 líneas, 34 escenarios) **no menciona ni
> una vez** `main.tsx`, `main.scss`, `body`, `font-family` ni la hoja global; los 7
> criterios de `feature_list.json` tampoco. Los 34 escenarios **pueden pasar en verde con
> el sitio en Times New Roman, sin fondo y con el margen de 8px**. La memoria
> organizacional es explícita: *«ampliar el contrato es añadir un criterio de aceptación →
> puerta humana»*, *«el agente reporta y escala; no legisla la spec»*. Sin este paso, todo
> lo demás es código silencioso.

---

**1. El enganche. Es el paso que más fealdad quita por línea escrita.**

*Rojo primero:* `src/lib/diseno/hojaGlobal.test.ts` asevera, leyendo el texto real
(`?raw`), que `src/main.tsx` contiene `import './styles/global.scss'` **exactamente una
vez**, que ningún otro fichero de `src/` lo importa, y que `src/styles/global.scss` declara
las nueve familias de @s13. Falla porque no existe ninguno de los dos.

*Verde:* `global.scss` con su sección de reset (~35 líneas) y **tres
declaraciones que son el 80 % del salto visual** —`body { margin: 0 }`,
`body { background-color: var(--color-fondo); color: var(--color-texto) }`— y
`_tipografia.scss` con `body { font-family: … }` provisional sobre la pila del sistema
(`system-ui, sans-serif`), **sin fuentes todavía**. Más la línea de `main.tsx`.

*Por qué primero:* son ~100 líneas y arreglan de un golpe el margen de 8px, el fondo
transparente, la falta de `box-sizing` y la mitad del problema tipográfico (deja de ser
Times New Roman aunque aún no sea DM Sans). Es exactamente lo que el spike demostró: *«la
mayor parte del salto visual la da la capa base, no el diseño fino de cada componente»*.
Y crea el andamio donde encaja todo lo demás.

**2. La red de seguridad de los tokens: el `:root` sin atributo.**

*Rojo:* un test que asevere que existe un bloque `:root` **sin** `[data-variante]` que
declara los mismos roles que `marca`, y que `extraerVariantesDeTokens` sigue devolviendo
exactamente `['marca','lima','verde','noche']` (@s1 no se rompe).
*Verde:* el bloque. Sin él, en el momento en que el paso 1 hace que el `body` consuma
`var(--color-fondo)`, un navegador sin JS se queda sin ningún color.

**3. La escisión `_tokens.scss` / `_api.scss` y el `additionalData`.**

*Rojo:* un test que asevere que `_tokens.scss` **no** declara ninguna función ni mixin de
Sass, y que `vite.config.ts` inyecta `@use "api" as *;` (valor **literal**, nunca a través
de una variable — patrón `valor-guardado-por-puerta-que-lee-config-como-texto-debe-ser-literal`).
*Verde:* mover `$escala-tipografica`, `paso-tipografico()`, `$escala-espaciado`,
`espaciado()`, `$grosor-foco`, `foco-visible`, `$area-tactil-minima` y
`area-tactil-minima` a `_api.scss`; cambiar la línea 31 de `vite.config.ts`.
*Medición obligatoria en el mismo paso:* `pnpm build` antes y después,
`grep -c ':root\[data-variante' dist/assets/*.css` y `wc -c` del CSS. Se escribe en
`progress/`. Es la comprobación de M-3/M-4 en el artefacto real.

**4. Los 14 tokens nuevos (12 de color + 2 de sombra), variante a variante.**

*Rojo:* `mezclaDeColor.test.ts` primero (la aritmética pura, que Stryker muerde), luego
`tokensColor.test.ts` ampliado: por cada uno de los **17 tokens × 4 variantes = 68
pares** (@s2), comprobar que está declarado en el bloque de su variante; por cada rol de
color, leer el valor del texto real de `_tokens.scss`, recalcular el ratio contra su fondo
declarado y exigir el umbral del §3. Guarda de no-vacuidad por extractor. Antes de tocar
`tokensColor.ts`, los **doce tests del §2.5**: el fichero está bajo Stryker con `break:
100`.
*Verde:* los cinco bloques de `_tokens.scss`.
*Ya NO hay puerta humana dentro de este paso:* la opción A del §3.5 (`verde`) está
descartada por el contrato y la decisión que la sustituye no rompe ninguna aserción
existente. El paso 4 pasa de «bloqueado a la espera de aprobación» a ejecutable.

**5. El movimiento y el foco globales.**

*Rojo:* ampliar el inventario de @s33 a las hojas globales (con su guarda) y aseverar que
`_base.scss` declara `scroll-behavior` y la `transition` del `body` **dentro** de
`@media (prefers-reduced-motion: no-preference)`; que `:focus-visible` existe y **no** es
`outline: none/0`; que `scroll-padding-block-start > 0` y **no** es un número repetido.
*Verde:* el bloque `no-preference` de `_base.scss` y el `scroll-padding`.

**6. La tipografía real: `public/fuentes/` + `_fuentes.scss` + `index.html`.**

*Rojo:* el parser de llaves sobre `_fuentes.scss` (4 `@font-face`, `font-display: swap`,
`unicode-range` presente, `src` empieza por `/fuentes/`, **cero** `url(https:` y cero
`@import url(`); allowlist de familias con guarda anti-vacuidad, con los nombres
`'Outfit'` y `'DM Sans'` **escritos a mano**; y el vector que casi todo el mundo olvida:
*el único identificador SIN comillas admitido es un genérico CSS* (`Georgia` desnudo se
rechaza).
*Verde:* los dos `.woff2` en `public/fuentes/`, el parcial, los dos `preload` con
`crossorigin`, y `_tipografia.scss` con las familias reales.
*Medición al instalar:* `grep -c unicode-range` sobre el fichero descargado y `ls -l` de
los `.woff2` — re-medir, no heredar la cifra de la investigación.

**7. La puerta de build (nivel B-2).**

*Rojo:* `puertaTerceros.ts` puro con sus dos guardas de vacuidad; su test con los 4 pares
escritos a mano y el CSS minificado real de `dist/` pegado literal.
*Verde:* `tools/puerta-terceros.ts` (humilde, cablea `node:fs`) encadenado a
`package.json` → `build`. **Solo en `build`, nunca en `dev`**: *«la puerta separa VER de
PUBLICAR»*.

**8. `public/` — los 26 huecos, los tres iconos y la imagen de compartición.**

*Rojo:* una puerta de nivel A que compare las rutas declaradas en `src/data/*.ts` +
`MetadatosPagina.tsx:18` + `PieDePagina.tsx:12` contra los ficheros reales de `public/`.
*Verde:* los ficheros. El logo (`201×201`, ya existe en la raíz) y el resto según
`plan_imagenes.md` §4.3.

**Y los cinco ficheros que el plan no enumeraba y el contrato sí** (@s28 y @s29):

| fichero | exigencia | escenario |
| --- | --- | --- |
| `public/favicon.ico` | responde 200 | @s28 |
| `public/favicon-32.png` | responde 200 | @s28 |
| `public/apple-touch-icon.png` | 200 y **exactamente 180×180 px** | @s28 |
| `public/favicon.svg` | **NO se crea**: el `<link>` va comentado hasta que llegue el vector | @s28 |
| la imagen de `og:image` | 200, **exactamente 1200×630 px**, **PNG y no WebP** | @s29 |

El PNG no es capricho: la documentación oficial de Meta **no declara** qué formatos
aceptan sus rastreadores, así que el WebP queda **NO VERIFICADO** ahí. Y @s29 exige además
que *«el fichero no proceda del banco de imágenes: se compone con el logotipo real sobre el
morado de marca»* — es de las pocas piezas gráficas de esta feature que se **fabrican**,
no se descargan.
*Cuidado:* `PaginaTienda.test.tsx:167-181` fija **exactamente 8** imágenes con `alt=""`;
`PaginaBlog.test.tsx:566-581`, exactamente 3; `CampanasPortada.test.tsx:178-192`,
exactamente 3; `Servicios.test.tsx:398-416`, cero; `Equipo.test.tsx:184`, cero. Añadir una
imagen a una tarjeta rompe la suite, y **eso es lo que se quiere**.

**9. Playwright + axe (nivel C) y los cuatro sondeos del §4.4.**

**10. El diseño fino de los 17 `.module.scss`**: contenedor (`--maxw` + `--gutter` +
`--seccion-y`), bandeado alterno de secciones en `Landing.module.scss`, tarjeta,
botón primario/fantasma, píldora, eyebrow, prosa del blog. Va **al final** a propósito:
sin los pasos 1-6 cada uno de esos ficheros estaría maquetando sobre arena.

*Tres exigencias concretas del contrato que caen en este paso y son fáciles de olvidar:*

- @s26: **las 8 secciones de la landing declaran fondo explícito**, cada una
  `--color-fondo` o `--color-fondo-alterno`. No basta con alternar unas cuantas: el
  escenario exige que **ninguna** compute transparente.
- @s31: **el hueco de una imagen que aún no ha cargado se pinta con
  `--color-fondo-alterno`** y reserva su `aspect-ratio`. Es maquetación, no imágenes.
- @s11: **`--color-primario-fuerte` tiene que USARSE** al menos una vez en algún fichero
  del inventario — el `:hover` del botón primario— y **ningún módulo puede usar
  `filter: brightness()` sobre el primario** (§3.1).

**11. El techo de bytes del CSS servido (@s49).**

*Rojo:* la prueba de navegador que suma los bytes de todas las respuestas de tipo hoja de
estilo de la portada y los compara contra un **literal escrito a mano**.
*Verde:* se mide el primer `dist/` verde y **se escribe el número a mano**. A partir de
ahí funciona como trinquete anti-regresión. El contrato es explícito en que **no se
recalcula del `dist/` que comprueba**, o deja de ser puerta. Cifra: PENDIENTE del
`tdd_craftsman`, por construcción.

**12. La puerta de navegador, separada del arranque de sesión (@s48).**

*Rojo:* la lectura del texto real de `package.json`, `harness.config.json` y
`playwright.config.ts`.
*Verde:* guion propio `test:e2e` en `package.json`; el comando de test del arnés **no lo
incluye**, para que verificar el entorno no exija descargar un navegador de cientos de
megas ni construir el sitio entero; `testDir: 'tests/e2e'`; **`retries: 0`**, contra la
recomendación de 2 para integración continua y a propósito —*«un reintento convierte una
prueba inestable en verde y esconde justo lo que esta feature existe para destapar»*—; y
`webServer` que construye y sirve `dist/` con `vite preview --port 4173 --strictPort`,
**nunca** el servidor de desarrollo.

---

## 6 · LO QUE NO SE TOCA

Contratos ya cerrados que esta feature **no puede reabrir**, con su razón:

| Qué | Dónde | Por qué no se toca |
| --- | --- | --- |
| **El mecanismo de paleta y su anti-FOUC** | `index.html:8-32`, `SelectorPaleta.tsx:21`, `SelectorPaleta-logica.ts` | Feature 14 `done`. `_tokens.scss:5-7` lo declara: *«este fichero CONSUME ese mecanismo, no lo reimplementa»*. La hoja global **no** decide la variante, y **no** puede pintar antes de que `data-variante` esté puesto: devolvería el FOUC que @s9/@s10 cerraron. Galapavet lo hace incluso mejor que WebEmpresa (valida contra un catálogo, no contra dos literales). |
| **`src/lib/contraste.ts`** | entero | Feature 1 `done`, probada al 100 %, con las tres puertas por uso y sus tres guardas. Es **estrictamente superior** a lo que tienen los dos repos de referencia (WebEmpresa **no tiene ninguna verificación de contraste calculado**: sus ratios se comprueban a ojo contra una tabla). Se reutiliza, no se reescribe. |
| **`PUNTO_DE_CORTE_NAVEGACION_PX = 1024`** | `Cabecera-logica.ts:10`, `Cabecera.module.scss:34,55,63`, `puntoDeCorte.ts:6` | Feature 3 `done` y verificado que CSS y JS no divergen. El prototipo usa 1120 en la portada y 1080 en las subpáginas —**una incoherencia del prototipo, no un patrón**—. Y `escalaTipografica.ts:10,28` **importa ese mismo número** como viewport máximo: cambiarlo mueve la tipografía entera. |
| **El contrato de movimiento respetuoso** | `movimientoRespetuoso.ts`, Decisión 31, @s33/@s34, `accesibilidad-movimiento.ts` | Feature 19. Prohíbe la forma del prototipo (`*{transition-duration:.01ms !important}` declarando y revocando) y la de WebEmpresa (`scroll-behavior` y `transition` del `body` **sin guarda**). El movimiento es **opt-in**, dentro de `no-preference`. |
| **La regla anti-clase-CSS** | `vite.config.ts:46-48`, `stryker.config.json` | Los CSS Modules devuelven un proxy y el contrato **prohíbe aseverar sobre clases CSS**. Consecuencia para las 17 hojas nuevas: **ningún `className` condicional nuevo**. El estado va a un ARIA consultable (`aria-expanded`, `aria-pressed`) y el SCSS deriva el color desde `&[aria-pressed='true']`. Un `className` condicional es **inmatable** por construcción → superviviente que bloquea el cierre (`break: 100`). |
| **`test.css.include: [/\?raw/]`** | `vite.config.ts:65` + 20 líneas de comentario | Documenta un fallo medido en vivo: activar la transformación de CSS para importaciones normales inyecta hojas reales en jsdom, jsdom aplica `display:none` fuera de un `@media` que no evalúa, y **rompe `getByRole`** en `Cabecera`. |
| **La ruta `src/styles/_tokens.scss`** | `tokensColor.test.ts:17` | La globa con `?raw`. Renombrarla o mover los bloques `:root` a otro fichero rompe las 4 puertas de contraste. Por eso la escisión del §2.2 saca el **API de Sass**, no los tokens. |
| **Los recuentos de `<img>` de las páginas** | `Servicios.test.tsx:402` (0), `Equipo.test.tsx:184` (0), `PaginaBlog.test.tsx:164` (0), `PaginaTienda.test.tsx:171` (8), `CampanasPortada.test.tsx:178-192` (3), `PieDePagina.test.tsx:28` (0 por `alt=""`) | El prototipo pone imagen en las tarjetas de servicio y en el listado del blog; **este repo lo prohíbe con test**. Y el cero de Equipo es deliberado: *«sin retratos verificados ninguna tarjeta muestra una fotografía del profesional»*. Meter retratos de stock sería exactamente la mentira que el contrato evita. |
| **`og:image` relativo** | `MetadatosPagina.test.tsx:82-83` | El test **exige** que empiece por `/` y **no** por `http(s)://`, lo que contradice la spec de Open Graph (que pide URL absoluta). Es una contradicción real entre contrato y estándar: **no se arregla a escondidas**, se lleva a la conversación de spec y se enmienda `seo_estructura`. |
| **Los datos de negocio** | `src/lib/site.ts`, `puertaTelefonoHardcodeado.ts`, `docs/datos-galapavet.md` | Fuera del alcance. Esta feature pinta, no cambia lo que dice la web. |
| **`design/fundamentos/` de WebEmpresa como modelo** | — | Es el **scaffold de entrega del diseño**, no la fuente de verdad, y está **desactualizado**: traía `main { max-width; margin; padding }`, el bug del doble gutter que `src/` ya corrigió. Portar esa versión reintroduciría un bug arreglado. |

---

## 7 · RIESGOS

### 7.1 Los tests sospechosos de romperse al activar la hoja global

**El riesgo estructural es MENOR de lo que parece, y conviene decir por qué:** ningún test
importa `src/main.tsx` ni `src/styles/global.scss`, y `vite.config.ts:65` ancla la
transformación de CSS a la query `?raw`. Es decir, **la hoja global nunca llega a jsdom**.
Los 712 tests renderizan componentes sueltos, sin capa base. El escenario catastrófico
(«hojas reales en jsdom rompen `getByRole`») **no se dispara** mientras nadie importe
`global.scss` desde un test.

Dicho eso, éstos son los sospechosos concretos, ordenados por probabilidad:

| Test | Por qué es sospechoso | Mitigación |
| --- | --- | --- |
| **`src/lib/diseno/tokensColor.test.ts` @s5** (`:99-104`) | ~~Rotura segura con la opción A del §3.5~~ **RIESGO CERRADO.** El contrato prohíbe tocar `--color-texto` de `verde`, la opción A está descartada (§3.5) y las dos aserciones `expect(texto).toBe('#48704B')` y `expect(ratio).toBe(5.12)` siguen verdes palabra por palabra. | Ninguna: ya no hay nada que mitigar. El coste queda registrado como PENDIENTE del humano en §3.5, no como riesgo de esta feature. |
| **`tokensColor.test.ts` @s1** (`:24-34`) | Asevera **exactamente** `['marca','lima','verde','noche']` y `toHaveLength(4)`. Añadir el `:root` desnudo del paso 2 podría meterlo en el inventario. | Verificado leyendo `PATRON_SELECTOR_VARIANTE` (`tokensColor.ts:17`): solo matchea `:root[data-variante=…]`, así que el `:root` desnudo **no** entra. Riesgo controlado, pero hay que aseverarlo explícitamente. |
| **`tokensColor.test.ts`, todos** | `extraerBloqueDeVariante` usa `[^}]*`: **una sola llave anidada dentro de un bloque de variante rompe los 10 escenarios de golpe**. Con 17 tokens la tentación de meter un `@media` o un `&` dentro crece. | Resuelto en §2.5.C (el lector cuenta llaves) **y** con la aserción explícita de §2.5.E: ningún bloque de variante contiene `{` interno. |
| **`src/lib/diseno/movimientoRespetuoso.test.ts`** | Al ampliar el inventario a las hojas globales, cualquier `transition`/`animation` de `_base.scss` fuera de `prefers-reduced-motion` la pone roja. Y su parser **cuenta un bloque por línea**: un `@media X { html { … } }` escrito en una sola línea lo despista. | Es el efecto buscado. Formato: una apertura de bloque por línea, como los 17 ficheros actuales. |
| **`inventarioModulos.test.ts` @s24** (`:88-93`) | Al ampliar el glob, un `#hex` o un `rgba()` en `_reset.scss`/`_base.scss` la pone roja — **incluso dentro de un comentario** (`PATRON_HEX` no distingue). Y `PATRON_NOMBRE_DE_COLOR` incluye **`lime`**: escribir «lime» en vez de «lima» en un comentario dispara la puerta. | `_tokens.scss` se queda **fuera** de ese glob; las hojas globales entran con cero literales. |
| **`inventarioModulos.test.ts` @s21/@s22** | Si el diseño fino introduce un componente compartido nuevo (un `Boton`), hay que **añadirlo al inventario** o la puerta falla; @s24 exige además *«el número de ficheros inspeccionados es exactamente 17»*. | Ese número deja de ser 17 en cuanto entren las hojas globales: hay que actualizarlo **y** su aserción de recuento. |
| **`src/accesibilidad-foco.test.tsx` / `accesibilidad-teclado.test.tsx`** | Feature 19 está `blocked`. Si el `.saltarAlContenido` de `_base.scss` entra, es ahí donde encaja su comprobación, y el mecanismo `left:-9999px` + `:focus{left:0}` **no se puede verificar en jsdom** (no hay layout). | El enlace se asevera por estructura y por texto del SCSS (nivel A/B-1); que se **revele** al recibir foco es nivel C. |
| **`src/lib/diseno/escalaTipografica.test.ts` / `escalaEspaciado.test.ts`** | Leen módulos TS, no SCSS: la escisión del §2.2 no los toca. **Pero** si el `--maxw`/`--gutter` re-medidos cambian y algún módulo los consumía, sí. | Verificado: ninguno globa `_tokens.scss`. Riesgo bajo. |
| **`src/lib/diseno/puntoDeCorte.test.ts`** | Lee `Cabecera.module.scss` buscando el 1024. El rediseño de la cabecera (paso 10) lo toca. | El 1024 no se mueve (§6). |
| **Los recuentos de `<img>`** (5 ficheros) | El paso 8 crea `public/img/`, lo que **no** cambia jsdom; pero el paso 10 (diseño de tarjeta) tiene la tentación de añadir imagen a las tarjetas de servicio y del listado del blog, que es lo que hace el prototipo. | Se rompen a propósito si alguien lo intenta. El fondo del hero, si entra, va como `background-image` en el `.module.scss`, **no** como `<img>`, precisamente para no alterar ningún recuento. |

### 7.2 Riesgos que no son tests

1. **La no-duplicación de tokens depende hoy de Lightning CSS** (M-2/M-3). Si el paso 3 se
   pospone y los tokens pasan de 12 a ~60 declaraciones × 4 variantes × 17 módulos, el CSS
   intermedio se hincha y la única defensa es un minificador que nadie ha declarado como
   requisito. **Medir el `dist/` antes y después es parte del paso 3, no un extra.**
2. **`src/main.tsx` está fuera de cobertura y fuera de mutación.** Sin el test del paso 1,
   borrar la línea del import deja la web en Times New Roman con los 712 tests en verde y
   **ninguna puerta roja**. Es la avería de hoy, exactamente.
3. **CSR puro y FOUC.** Los dos repos de referencia son SSG (`vite-react-ssg`); Galapavet
   es CSR (`ReactDOM.createRoot`). El HTML servido no trae ni una regla, así que **el
   primer pintado ocurre sin estilos hasta que llega el bundle**. Activar la hoja global
   hace el destello **más** visible, no menos: hoy no se nota porque no hay nada que
   destellar. Mitigación posible: los dos `preload` de fuente (§2.4) y, si hiciera falta,
   un `<style>` crítico inline — **pero eso sería una segunda pasada de decisión
   pre-pintado y exige el patrón completo (gemelo puro + espejo literal + test de orden)**,
   no una improvisación. **NO VERIFICADO**: cuánto dura el destello real; medirlo en el
   nivel C antes de decidir.
4. **`font-display: swap` mueve el layout** si las `@font-face` de respaldo con métricas
   ajustadas no entran o entran con los números mal copiados. Los cuatro valores del §1.6
   están calculados, no estimados; hay que escribirlos con su procedencia.
5. **El subconjunto latin y el tofu silencioso.** Con `unicode-range` declarado el
   navegador hace fallback; **sin él, no** — y ése es el límite que NailsLash asumió en
   puerta humana. Verificado por script que el rango cubre todo el castellano. Riesgo
   residual: un nombre propio con `Ł`/`ř`/`ğ`.
6. **Playwright descarga navegadores.** Medido en esta máquina: **416 MB** para el
   Chromium completo ya instalado. Con `--only-shell` menos, cifra **NO VERIFICADA**.
   No se descarga solo: hay que documentarlo en `init`.
7. **La memoria organizacional no tiene ningún patrón sobre la capa global de estilos**
   (21 patrones, ninguno posterior al 25/07/2026, **0 validados en Galapavet**). Esto se
   diseña con los principios de los patrones existentes; no hay una regla hecha que
   copiar. Y cuando cierre, **esta feature es candidata a destilar el patrón que falta**.

---

## 8 · Lagunas declaradas (NO VERIFICADO)

1. **No he ejecutado `pnpm test` ni `pnpm build`.** El `dist/` medido en M-2 es el que ya
   estaba en disco (20:17 del 23/08/2026, construido con los 17 `.module.scss` nuevos).
   Las afirmaciones sobre tests son lectura de su código fuente, no de su ejecución.
2. **Cómo minifica Lightning CSS 1.33.0** un `font-weight: 100 900`, un `unicode-range` y
   un `src: local('Arial')`. La regex de la puerta B-2 depende de ello y hay que medirlo
   sobre `dist/` real, como hizo NailsLash con el suyo.
3. **Si `@fontsource` 5.3.0 sigue publicando los `.woff2` variables** con los pesos y el
   `unicode-range` documentados en `investigacion_tecnica_visual.md` §3.2-3.3. Re-medir al
   descargar.
4. **La duración real del FOUC en CSR** (§7.2.3).
5. **`theme-color` con 4 variantes**: no hay decisión en `project-spec.md`.
6. **Si Galapavet quiere una animación de logo** equivalente a `_logo-draw.scss`.
7. **Dónde se despliega**: si va en subruta hará falta `base` en `vite.config.ts`, y con
   ello el patrón `valor-guardado-por-puerta-que-lee-config-como-texto-debe-ser-literal`.
8. **El soporte real** de `color-mix()`, `backdrop-filter`, `text-wrap: pretty/balance` y
   `100svh` en el parque de navegadores objetivo — que **no está declarado en ningún sitio
   del repo**. Debe fijarse antes de usarlos: `backdrop-filter` sin soporte deja la
   cabecera translúcida e ilegible.

---

## 9 · Reconciliación con el contrato aprobado (23/08/2026)

**Qué es esto.** El 23/08/2026 la puerta humana aprobó
`features/identidad_visual.feature` (51 escenarios). Este plan es anterior. Se ha cotejado
**escenario a escenario** contra el contrato y aquí está el resultado completo: primero
las divergencias reales encontradas y cómo se resolvió cada una, después el barrido de los
51 y al final lo que queda pendiente y de quién es.

**La regla que ha decidido todos los empates, sin una sola excepción: MANDA EL CONTRATO.**
Está aprobado por el humano y es lo único que el `tdd_craftsman` va a leer como fuente de
verdad. Cuando el plan y el contrato decían cosas distintas, se ha corregido el plan. En
los tres casos en que el plan tenía una **medición** buena detrás de una **conclusión**
equivocada, se conserva la medición y se rehace la conclusión, en vez de borrar el rastro.

### 9.1 Las divergencias, una por una

| # | Dónde | La divergencia | Cómo se ha resuelto |
| --- | --- | --- | --- |
| **D-1** | §3.1, §3.3-§3.6 | **Tres tokens con nombre equivocado.** El plan decía `--color-fondo-seccion`, `--color-superficie-suave` y `--color-acento`; @s1 enumera a mano `--color-fondo-alterno`, `--color-superficie-elevada` y `--color-acento-tinta`. | Renombrados en **todo** el documento: título, tabla de semántica, las cuatro tablas de contraste y todo fragmento de código. Verificado con `grep`: **0 apariciones** de los tres nombres viejos. Nota: `estudio_diseno_referencia.md` §1.2 ya usaba los nombres correctos — el error nació en el plan, no aguas arriba. |
| **D-2** | §3.1 | **Faltaban tres tokens enteros**: `--color-primario-fuerte`, `--sombra-reposo` y `--sombra-elevada`. El plan enumeraba 14; @s1 exige 17 y los cuenta (*«15 de color y 2 de sombra»*). | Derivados y verificados en las 4 variantes: el primero en §3.3-§3.6, los dos de sombra en el **§3.8 nuevo**. Todos con su fórmula y su ratio recalculado. |
| **D-3** | §3.1 | **`--primary-strong` estaba en la lista de DESCARTES**, con el argumento de que el prototipo lo declara 4 veces y lo usa 0. @s3, @s8 y @s11 lo exigen declarado **y usado**. | Descarte **retirado**, conservando la medición que lo motivaba y dándole la vuelta con la fórmula: `#77286B × 1.1` = `#832C76`, y el blanco encima **cae de 9.13 a 8.12**. El defecto del prototipo no era tener el token: era declararlo, no usarlo y taparlo con un `filter: brightness(1.1)` que **aclara** el morado. Por eso @s11 exige uso real y este plan prohíbe el filtro sobre el primario. |
| **D-4** | §1.2-§1.6 | **Arquitectura de ficheros incompatible.** El plan proponía `main.scss` + 4 parciales; @s12 exige `src/styles/global.scss` y @s13/@s14/@s15/@s17/@s18 leen su **texto crudo** con `?raw`. Un `?raw` sobre un barril devuelve cinco líneas de `@use`: los seis escenarios fallarían. | **Un único `src/styles/global.scss`** con secciones rotuladas en el orden de la cascada. Se conserva íntegro el contenido decidido y las 6+7+4 diferencias razonadas con los repos de referencia: cambia el reparto en ficheros, **no una sola regla**. `_tokens.scss` (ruta anclada por `tokensColor.test.ts:17`) y `_api.scss` (emite 0 CSS) siguen fuera. |
| **D-5** | §1.3 vs §1.4 vs §1.5 | **El `body` estaba repartido en tres ficheros.** @s13 exige que declare *«a la vez»* `min-height: 100svh`, `line-height: 1.5`, fondo, color y familia. | Las cinco, en **una sola regla** de `global.scss`. `body { margin: 0 }` sigue aparte: es la familia 2 de @s13, distinta de la 6. |
| **D-6** | §1.4 | **Faltaba el bloque `@media (prefers-reduced-motion: reduce)`.** @s15 lo exige con `0.01ms` —y no `0`— para que `transitionend`/`animationend` sigan disparándose; sin él **@s42 no puede pasar**. | Añadido, **sin `!important` y sin declarar-y-revocar**: el movimiento sigue siendo opt-in dentro de `no-preference` y este bloque es red de seguridad. Verificado que la puerta existente lo admite: `movimientoRespetuoso.ts:8-9,20` acepta explícitamente un bloque `reduce`. |
| **D-7** | §1.4 | **`scroll-padding-block-start` en vez de `scroll-padding-top`.** @s14 exige la cadena literal `scroll-padding-top`; la comprobación es lectura de texto y la lógica no salva la diferencia. | Corregido. Equivalentes en `horizontal-tb`, que es el único modo que este sitio usa. Añadida además la segunda mitad de @s14 que faltaba: **`Cabecera.module.scss` tiene que dimensionarse con `--altura-cabecera`**, o hay dos números que pueden divergir. |
| **D-8** | §1.5 | **La familia tipográfica iba por literal, no por variable.** El plan copiaba de NailsLash la decisión *«literales, no tokens»*; @s13 y @s17 dicen las dos veces **«la variable de tipografía»**. | Se declaran `--fuente-titulo` y `--fuente-texto`. La objeción anti-tautología de NailsLash **no aplica**: el test lee el valor del texto crudo del SCSS y lo compara contra `'Outfit'` / `'DM Sans'` escritos a mano en el escenario; no importa ningún símbolo. Van en un `:root` **sin** `[data-variante]`: la tipografía no cambia con la paleta, y no cuentan para los 17 de @s1 ni para los 68 pares de @s2. |
| **D-9** | §3.5 | **La opción A de `verde` estaba PROHIBIDA por el contrato** y el plan la marcaba como recomendada: cambiaba `--color-texto` de `#48704B` a `#3A5A3C`. La sección «QUÉ NO SE REABRE» conserva los tres roles ya fijados **en las 4 variantes**. | §3.5 reescrita y **cerrada**: ver §9.2. Coste sobre los tests existentes: **cero**. |
| **D-10** | §2.1 D | **`--maxw: 1220px` era un número del prototipo**, justificado con *«gana el prototipo»*. Contradice la regla de portabilidad de este mismo plan y el PENDIENTE 3 del contrato, que reserva el valor al `tdd_craftsman`. | Retirado, junto con `--gutter` y `--seccion-y`. Se construyen sobre `$escala-espaciado`, la rejilla de 8 px que el proyecto ya tiene. @s45 exige la **propiedad estructural** (un solo ancho, el mismo en las 6 rutas), nunca una cifra. Se conserva la buena idea original: anclar el **rechazo** de lo heredado. |
| **D-11** | §2.3 | **Ampliar el glob de los 17 módulos rompería @s51**, que exige que el recuento del inventario sea el de componentes visuales + páginas (12 + 5 = 17). Una hoja global no es ni lo uno ni lo otro. | Se llama **dos veces a la misma función pura**, con dos catálogos y **dos guardas de no-vacuidad**. @s24 conserva su «exactamente 17», @s51 su identidad de recuentos, y las hojas globales dejan de ser punto ciego. |
| **D-12** | §1.7, §4 | **Faltaban tres módulos puros que el contrato exige como nivel A**: @s16 (escala de movimiento), @s35 (configuración de axe) y @s50 (los doce escenarios heredados). El plan los daba por hechos dentro de los ficheros de Playwright, donde **StrykerJS no llega**. | Añadidos a §1.7: `escalaDeMovimiento.ts`, `configuracionAxe.ts` y `escenariosHeredados.ts`. Los tres son inventarios declarados contrastados contra el texto real, que es exactamente la forma que el contrato pide. |
| **D-13** | §2.5 (nueva) | **El lector de tokens no puede leer un `rgba()`** ni un bloque con llaves anidadas — PENDIENTE 12 del contrato, sin resolver en el plan. | §2.5 nueva, con el código propuesto: dos lectores **hermanos** (`leerDeclaracionDeVariante`, `declaraTokenEnVariante`), `extraerBloqueDeVariante` contando llaves, y **el aviso de StrykerJS con la tabla de doce tests y el mutante que mata cada uno**. El lector estricto NO se relaja: si aceptara cualquier valor, seis escenarios ya aprobados dejarían de detectar un token mal escrito. |
| **D-14** | §2.4 | **`index.html:6` declara `<link rel="icon" href="/favicon.svg">` y ese fichero no existe**: es un 404 activo hoy. @s28 exige que **mientras no exista el vector del cliente esa etiqueta permanezca comentada**, y exige 200 en `/favicon.ico`, `/favicon-32.png` y `/apple-touch-icon.png` (este último de 180×180). | Anotado en §2.4 y en el paso 8 del §5. Es una línea de HTML, pero es un 404 en cada carga de cada ruta y **@s33 la caza**. |
| **D-15** | §5 paso 8 | El paso enumeraba las 26 imágenes pero **no los ficheros de icono ni la imagen de compartición**. @s28 y @s29 los exigen, con `1200×630` y **PNG, no WebP**. | Añadidos al paso 8 con sus tamaños. |
| **D-16** | §5 | **Faltaban dos pasos**: el techo de bytes del CSS (@s49) y la puerta separada de navegador (@s48: guion `test:e2e` propio que el comando de test del arnés **no** incluye, `testDir: tests/e2e`, `retries: 0`, `vite preview` sobre `dist/` en el 4173). | Añadidos al §5. |
| **D-17** | §3.6 | El plan enumeraba **«los tres cambios de rol de `noche`»** y son **cuatro**: el sentido del `--color-primario-fuerte` se invierte en la variante oscura. | Corregido y derivado: ver §9.3. |

### 9.2 La decisión de §3.5 (`verde`), en tres líneas

El contrato conserva `--color-texto: #48704B` en `verde`. Su ratio sobre el propio fondo
es **5.12**, el mínimo de SC 1.4.3 es **4.5**, y un texto «suave» tiene que ser más claro,
o sea de menos ratio. **La ventana entera es `[4.50, 5.12]`** y el mejor candidato que
sobrevive sobre las tres superficies es `#4D7450` con 4.81: un 6 % de diferencia, que
nadie ve. **Decisión: `--color-texto-suave` vale `#48704B`, igual que `--color-texto`**,
y la jerarquía secundaria la llevan la escala tipográfica y el peso — el mismo movimiento
que este plan ya hacía en `noche` con `--color-tinta` = `--color-texto` = `#FFFFFF`.
`verde` tiene dos peldaños de texto (tinta `#324E35` a 8.31 / cuerpo a 5.12), no tres, y
se dice en voz alta en vez de fingir un tercero que el ojo no distingue.
De paso se corrigieron dos afirmaciones falsas de esa sección: el borde de control **sí**
llega (`#5A7E5D`, 4.13/3.90/4.59), y el `--color-fondo-alterno` baja de 16 % a 12 % de
verde para que el cuerpo tenga 4.84 encima en vez de 4.57, que pasaba por 0.07.

### 9.3 Los tres tokens que faltaban, derivados y verificados

Todo lo que sigue está calculado con una réplica exacta de `src/lib/contraste.ts`, la
misma que reprodujo **dígito a dígito** los diez valores de control de M-1 y, ahora
también, **los 14 números que el contrato clava a mano** en @s3, @s4, @s5, @s6, @s7, @s8 y
@s9. Ninguno es una estimación.

**`--color-primario-fuerte` — la regla es invariante, el polo no.** @s8 exige que el
estado con el puntero encima **mejore** el contraste contra `--color-sobre-primario`. La
regla que lo garantiza en las cuatro variantes es: *mezclar el primario un 10 % con el polo
OPUESTO a `--color-sobre-primario`*.

| variante | primario | sobre-primario | polo | **primario-fuerte** | reposo | hover |
| --- | --- | --- | --- | --- | --- | --- |
| `marca` | `#77286B` | `#FFFFFF` | negro | **`#6B2460`** | 9.13 | **10.26** |
| `lima` | `#77286B` | `#FFFFFF` | negro | **`#6B2460`** | 9.13 | **10.26** |
| `verde` | `#48704B` | `#FFFFFF` | negro | **`#416544`** | 5.68 | **6.63** |
| `noche` | `#B489AE` | `#000000` | **blanco** | **`#BC95B6`** | 7.13 | **8.11** |

`marca` coincide dígito a dígito con lo que @s3 y @s8 ya clavan (`#6B2460`, 10.26), lo que
confirma que la regla es la del contrato y no una reconstrucción. **`noche` es la que
enseña por qué la regla se enuncia por polos y no como «10 % de negro»**: allí el
sobre-primario es negro, y oscurecer el relleno da `#A27B9D` con **5.86**, o sea que el
hover *empeoraría* el contraste — el defecto exacto que @s8 existe para prohibir.

**`--sombra-reposo` y `--sombra-elevada` — geometría portada, color derivado.** Se porta
del prototipo la **geometría** (`0 6px 18px` / `0 18px 45px`) y las **opacidades**
(`.07`/`.10` en claro, reforzadas a `.35`/`.45` en oscuro), que son arquitectura. **No se
porta su color** `rgb(15,32,60)`: cada variante tiñe con **su propio `--color-tinta`**,
que es la regla que el propio estudio describe.

| variante | tinta | **`--sombra-reposo`** | **`--sombra-elevada`** |
| --- | --- | --- | --- |
| `marca` | `#531C4B` | `0 6px 18px rgba(83, 28, 75, 0.07)` | `0 18px 45px rgba(83, 28, 75, 0.10)` |
| `lima` | `#531C4B` | `0 6px 18px rgba(83, 28, 75, 0.07)` | `0 18px 45px rgba(83, 28, 75, 0.10)` |
| `verde` | `#324E35` | `0 6px 18px rgba(50, 78, 53, 0.07)` | `0 18px 45px rgba(50, 78, 53, 0.10)` |
| `noche` | `#FFFFFF` ⚠ | `0 6px 18px rgba(0, 0, 0, 0.35)` | `0 18px 45px rgba(0, 0, 0, 0.45)` |

⚠ En `noche` la regla se rompe sola: la tinta es blanca y **una sombra blanca sobre negro
no es una sombra, es un halo**. Se tiñe con negro puro y la profundidad la lleva la
opacidad reforzada. Está escrito para que nadie lo «arregle» creyendo que es un despiste.
Los dos viven obligatoriamente en `_tokens.scss`: `puertaLiteralesColor.ts:27-30,56`
señala **cualquier** `rgba()` en los `.module.scss`, y `_tokens.scss` no está en ese glob.

### 9.4 Barrido de los 51 escenarios

Leídos uno a uno contra lo que el plan (ya corregido) propone escribir.

| escenarios | veredicto |
| --- | --- |
| @s1, @s2, @s3, @s4, @s5, @s6, @s7, @s8, @s9, @s10, @s11 | **Cubiertos tras D-1, D-2, D-3 y D-13.** Los 14 números que el contrato clava a mano se han recalculado con la fórmula real y **coinciden los 14**. |
| @s12, @s13, @s14, @s15, @s17, @s18 | **Cubiertos tras D-4 a D-8.** Antes de la corrección, los seis fallaban por la arquitectura de ficheros. |
| @s16 | **Cubierto tras D-12.** Medido de paso: hoy hay **una sola** declaración de transición en los 17 módulos (`Faq.module.scss:33`, `padding-inline-start 150ms ease`) y **cero** que animen `all`. La duración ya es correcta; la curva es `ease` y la Decisión 31 pide `ease-out`: un carácter, y es la única deuda de movimiento que existe. |
| @s19 | **Cubierto.** Verificado que `index.html` no tiene hoy **ninguna** etiqueta de precarga, así que «exactamente 2 y ninguna otra» se cumple añadiendo solo las dos de fuente. |
| @s20, @s21, @s23 | **Cubiertos.** @s21 depende de la familia 4 del reset (`font: inherit` en los cuatro controles), que el plan ya tenía y que WebEmpresa solo aplicaba a `button`. |
| @s22 | **Cubierto con una condición que hay que escribir.** Son 4 `@font-face` pero el escenario exige *«exactamente 2 ficheros `.woff2`»*: las dos de respaldo **tienen que declararse con `src: local(...)`**, nunca con una URL, o el recuento se rompe y el techo de 69 224 B se dispara. |
| @s24, @s25 | **Cubiertos.** El `:root` desnudo del §2.1.A es justo lo que hace que @s24 (*«el fondo del cuerpo no es transparente»*) aguante sin JS. |
| @s26 | **Cubierto con un añadido.** El escenario exige además que **ninguna** de las 8 secciones tenga fondo transparente: cada una declara explícitamente `--color-fondo` o `--color-fondo-alterno`, no basta con alternar unas cuantas. |
| @s27, @s30, @s32, @s33 | **Cubiertos** por el paso 8 y el nivel C. |
| @s28, @s29 | **Cubiertos tras D-14 y D-15.** |
| @s31 | **Cubierto con un añadido.** El escenario fija el color del hueco de imagen: *«el color de fondo computado de cada hueco equivale al `--color-fondo-alterno` de la variante activa»*. Es un requisito de maquetación, no de imágenes, y va al paso 10. |
| @s34 | **Cubierto, con un riesgo real que hay que medir.** «Cero avisos» es más duro que «cero errores»: un `<link rel=preload>` cuyo recurso no se use en unos segundos hace que Chrome escriba un **warning**. Con texto latino en pantalla las dos fuentes se usan siempre, así que no debería dispararse — pero es **NO VERIFICADO** hasta medirlo en el nivel C, y es la clase de detalle que tumba una puerta el último día. |
| @s35, @s36, @s37, @s38, @s39, @s40, @s41 | **Cubiertos tras D-12.** @s38/@s39 apoyan además en el §3.7, que ya explicaba por qué el `outline-offset: 2px` es funcional y no estético. |
| @s42, @s43 | **Cubiertos tras D-6.** Sin el bloque `reduce` ninguno de los dos podía pasar. |
| @s44, @s45, @s47 | **Cubiertos tras D-10**, con el valor del ancho máximo como pendiente legítimo del `tdd_craftsman`. |
| @s46 | **Cubierto tras D-4.** La respuesta al pendiente que dejó la feature 21 es **no**: el shell no necesita fichero propio, va en `global.scss`, porque @s12 prohíbe que un `.module.scss` toque `html`, `body` o `#root`. |
| @s48, @s49 | **Cubiertos tras D-16.** |
| @s50, @s51 | **Cubiertos tras D-11 y D-12.** |

**Resultado: 51 de 51 con camino escrito.** Ninguno queda sin cubrir; los que dependen de
una cifra que el contrato reserva al `tdd_craftsman` (el ancho máximo de @s45 y el techo de
CSS de @s49) tienen el escenario cubierto y la cifra declarada como pendiente suyo, que es
exactamente lo que el contrato pide.

### 9.5 Lo que sigue PENDIENTE, y de quién es

**Del `tdd_craftsman`** (los que el contrato ya le asigna y este plan no invade): la tabla
completa de `lima`, `verde` y `noche` pasada por la puerta de contraste de @s5 —el §3 le da
los valores derivados, él los ancla en rojo primero—; el techo de bytes del CSS de @s49,
midiendo el primer `dist/` verde; el ancho máximo de contenedor de @s45; y los pasos
concretos de radio, ancho de borde y altura de control.

**Del `craftsman_lead`**: corregir en `project-spec.md` el titular de la Decisión 26
(«de 3 a 15 (13 de color + 2 de sombra)»), que **no cuadra con su propia enumeración**. El
contrato lo dice y le pone nombre: son **15 de color + 2 de sombra = 17**. Y el `og:image`
relativo, que exige enmendar un escenario de `seo_estructura` (feature 15, ya `done`).

**Del HUMANO**, y son tres:

1. **El tercer peldaño de texto de `verde`.** Existe solo si se oscurece `--color-texto`
   de esa variante, y eso es enmendar `sistema_de_diseno_visual.feature` @s5, ya `done`.
   Propuesta calculada por si se pide: `#3A5A3C` (verde + 20 % negro, **6.99**), que
   reabre la ventana a `[4.50, 6.99]` y libera `#48704B` para el texto suave.
   **Mientras no se pida, no se toca**, y esta feature no lo necesita para cerrar.
2. **El parque de navegadores objetivo** (PENDIENTE 5 del contrato, PREGUNTA ABIERTA 2 del
   spec). Afecta a `color-mix()`, `backdrop-filter`, `text-wrap: pretty` e
   `interpolate-size`. Ningún escenario del contrato depende de ellos, así que **no
   bloquea**; mientras no esté fijado, cada uno lleva su respaldo sólido y
   `backdrop-filter` **no se usa** para la cabecera translúcida (sin soporte queda
   translúcida e ilegible).
3. **El `favicon.svg` vectorial del cliente.** Mientras no llegue, `<link>` comentado y
   juego raster, tal y como @s28 permite explícitamente.

**Lo que este documento NO ha podido verificar y sigue NO VERIFICADO**: todo lo del §8
sigue vigente. Se añade uno nuevo, el aviso de precarga de @s34 (§9.4).
