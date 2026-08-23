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

### 1.1 `src/main.tsx` — LA LÍNEA QUE FALTA (no es fichero nuevo, es la causa raíz)

**Origen:** `WebEmpresa/src/main.tsx:11` y `NailsLashStudioWeb/src/main.tsx:43`, idénticos.

**Qué se añade** — tres imports al principio del fichero, antes de `import { App }`:

```tsx
import './styles/main.scss'
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

### 1.2 `src/styles/main.scss` — el barril

**Origen:** `WebEmpresa/src/styles/main.scss:1-4` (4 líneas) y
`NailsLashStudioWeb/src/styles/main.scss:1-13`.

**Contenido decidido:**

```scss
// Punto de entrada de los estilos globales. Único fichero que `src/main.tsx`
// importa: el orden de estos `@use` ES la cascada, y es auditable.
//   tokens     → declara las custom properties de las 4 variantes (:root[data-variante])
//   fuentes    → los @font-face autoalojados (ningún color, ninguna regla de elemento)
//   reset      → normaliza el user-agent
//   base       → aplica los tokens al documento (body, encabezados, foco, .prose)
//   tipografia → suelo heredable de familia tipográfica (fichero aparte: ver 1.5)
@use 'tokens';
@use 'fuentes';
@use 'reset';
@use 'base';
@use 'tipografia';
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
  scroll-padding-block-start: calc(var(--altura-cabecera) + #{espaciado(16)});
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
// Solo familias YA horneadas por `_fuentes.scss`: ni @import ni @font-face nuevos,
// ningún tercero (Decisión 9).
body {
  font-family: 'DM Sans', 'DM Sans Fallback', Arial, sans-serif;
}

// Suelo de TIPO de los encabezados. Regla CONJUNTA (una sola, seis selectores), no seis
// reglas: es un selector de TIPO (0,0,1), el más débil que existe tras la herencia, así
// que CUALQUIER clase de cualquier módulo lo derrota. Es un SUELO, no un techo.
h1, h2, h3, h4, h5, h6 {
  font-family: 'Outfit', 'Outfit Fallback', Arial, sans-serif;
}
```

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
| `src/lib/diseno/hojaGlobal.ts` | A (puro, mutado) | Inventario declarado de la capa global + comprobación de enganche (`main.tsx` → `main.scss` → cada parcial), con **guarda de no-vacuidad propia**. Es la puerta que hoy no existe y que habría cazado el fallo de raíz. |
| `src/lib/diseno/hojaGlobal.test.ts` | A | Su test, con literales escritos a mano. |
| `src/lib/diseno/mezclaDeColor.ts` | A (puro, mutado) | `mezclar(base, otro, porcentaje) → '#RRGGBB'`: la derivación canal a canal con redondeo estándar. **Toda la tabla del §3 se recalcula con esto**, ningún hexadecimal se duplica a mano en el test. |
| `src/lib/diseno/mezclaDeColor.test.ts` | A | Su test. Ancla los porcentajes y los hexadecimales resultantes por separado (anti-tautología). |
| `src/styles/hoja-global.test.ts` | A | Aserciones sobre el TEXTO de `main.scss`/`_reset.scss`/`_base.scss`/`_tipografia.scss` con el parser de llaves de NailsLash. |
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

### 2.1 `src/styles/_tokens.scss` — de 3 roles a 14

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

**B. Los 11 roles nuevos van en los cinco bloques** (el desnudo + los cuatro), con los
valores del §3.

**C. Restricción dura de formato, medida en el código de la puerta:**
`extraerBloqueDeVariante` (`tokensColor.ts:35`) usa `[^}]*` → **un bloque de variante no
puede contener llaves anidadas**; y `leerTokenDeVariante` (`:52`) exige literalmente
`--color-<rol>: #RRGGBB;` con **hex de 6 dígitos**. Consecuencia: los 14 roles de color
son hex de 6 dígitos, sin `color-mix()`, sin `rgba()`, sin `var()` encadenado.

**D. Los tokens que NO son color** (sombras, medidas, radios, alturas de control) también
viven aquí, porque `puertaLiteralesColor.ts:27-30` señala **cualquier** `rgba()` en
`src/components/*.module.scss` y `src/pages/*.module.scss`, y `_tokens.scss` **no está en
ese glob** (`inventarioModulos.test.ts:88-89`). Es el único sitio legal para un `rgba()`:

```scss
--sombra-reposo:   0 6px 18px rgba(…);   // difuminado grande, alfa muy bajo
--sombra-elevada:  0 18px 45px rgba(…);
--maxw: 1220px;                          // el mismo número en las 5 páginas del prototipo
--gutter: clamp(18px, 5vw, 28px);
--seccion-y: clamp(64px, 9vw, 104px);
--radio-completo: 999px;
--altura-cabecera: …;                    // la consume `scroll-padding-block-start`
```

**Re-medición obligatoria, no herencia:** `--maxw` de WebEmpresa es **1180px**
(`_tokens.scss:26-27`) y el del prototipo de diseño es **1220px** en las 4 páginas y sin
excepciones. Gana el prototipo, que es el diseño aprobado de ESTE cliente. Igual con
`--gutter`: WebEmpresa `clamp(18px,5vw,26px)`, prototipo `clamp(18px,5vw,28px)`
(27 apariciones, el valor más repetido). El patrón
`herencia-del-repo-base-es-deuda-muerta` pide además **anclar el rechazo**:
`expect(scss).not.toContain('1180px')`.

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
                            Se `@use`a UNA sola vez, desde `main.scss`.
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
`tokens`. **Verificado en M-4** que el caso `main.scss` (que sí recibe el `additionalData`
por ser entrada) no produce ningún bucle.

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

- `INVENTARIO_HOJAS_GLOBALES = ['main.scss', '_reset.scss', '_base.scss',
  '_tipografia.scss', '_fuentes.scss']` — **`_tokens.scss` queda fuera del glob de
  literales de color**, porque es el único sitio donde los hexadecimales y los `rgba()`
  pueden vivir (y su contenido ya lo vigila `tokensColor.ts`).
- @s33 (movimiento) **sí** cubre las cinco, `_tokens.scss` incluido.

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

**`theme-color` queda pendiente y declarado NO VERIFICADO**: con 4 variantes conmutadas
por atributo no sirve la forma `media` de WebEmpresa (`index.html:7-9`); habría que
escribirlo desde JS al cambiar de variante, y **no hay decisión tomada** en
`project-spec.md`.

---

## 3 · LA TABLA DE ROLES DE COLOR COMPLETA

### 3.1 Los 14 roles y su semántica

Nombres en español, coherentes con los tres que ya existen. Reducidos desde los 18 del
prototipo y los 20 de WebEmpresa: **13 roles de color + 2 de sombra es el mínimo real**
para las secciones que Galapavet tiene (`estudio_diseno_referencia.md` §1.2).

| # | Rol | Para qué | Umbral WCAG |
| --- | --- | --- | --- |
| 1 | `--color-fondo` *(ya existe)* | lienzo de página | — |
| 2 | `--color-fondo-seccion` | fondo de sección **alterna**: sin él, 8 secciones seguidas con el mismo fondo y la página «no tiene ritmo» | — |
| 3 | `--color-superficie` | tarjeta / panel elevado (servicios, equipo, campañas, galería, blog, tienda, formulario, pie) | — |
| 4 | `--color-superficie-suave` | superficie **secundaria dentro** de una tarjeta: campos del formulario, cabecera y pie del chat, botones ± de la cesta | — |
| 5 | `--color-tinta` | titulares y datos (precios, cifras). Hoy todo el texto usa el mismo `--color-texto` y **no hay jerarquía** | 1.4.3 AA 4.5 (se busca 7, AAA 1.4.6) |
| 6 | `--color-texto` *(ya existe)* | cuerpo | 1.4.3 AA 4.5 |
| 7 | `--color-texto-suave` | entradillas, descripciones de tarjeta, metadatos, pies de foto | 1.4.3 AA 4.5 |
| 8 | `--color-primario` | fondo de acción: botón primario, burbuja propia del chat, cuadro del logotipo | 1.4.11 AA 3.0 contra el fondo |
| 9 | `--color-sobre-primario` | texto/icono **sobre** `--color-primario` | 1.4.3 AA 4.5 |
| 10 | `--color-acento` | el acento que **lleva texto**: eyebrows, categorías, checks, rótulos | 1.4.3 AA 4.5 |
| 11 | `--color-acento-suave` | fondo suave del acento: píldoras, círculos de check, hover de nav | — (lo que importa es el texto encima) |
| 12 | `--color-borde` | línea decorativa de 1px: perímetro de tarjeta, separadores | **exento** (decorativo) |
| 13 | `--color-borde-control` | el borde que **identifica** un control: campo, botón fantasma, píldora seleccionable | 1.4.11 AA 3.0 |
| 14 | `--color-foco` *(ya existe)* | anillo de foco | 1.4.11 AA 3.0 · 2.4.13 AAA |

**Roles que se DESCARTAN a propósito, con su razón:**
`--urg` / `--urg-soft` (Galapavet **no presta urgencias 24 h**; su teléfono fuera de
horario es un enlace, no una marca de servicio), `--primary-strong` (declarado 4 veces y
**usado 0 veces** en el prototipo: todos los hovers usan `filter:brightness(1.1)`, que
sobre el morado lo **aclara** y **baja** el contraste del blanco encima), y `--accent` «a
secas» decorativo (3 usos, y con el lima a 1.89 sobre blanco no puede llevar texto jamás).

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
| `--color-fondo-seccion` | `#F4EEF3` | blanco + 8 % morado | `#FFFFFF` | 1.14 | — | banda decorativa |
| `--color-superficie` | `#FFFFFF` | = fondo | `#FFFFFF` | 1.00 | — | la tarjeta se distingue por borde + sombra |
| `--color-superficie-suave` | `#FAF6F9` | blanco + 4 % morado | `#FFFFFF` | 1.07 | — | superficie |
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
| `--color-sobre-primario` | `#FFFFFF` | blanco puro | `#77286B` | **9.13** | 4.5 | 1.4.3 AA |
| `--color-acento` | `#48704B` | verde profundo de marca | `#FFFFFF` | **5.68** | 4.5 | 1.4.3 AA |
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
| `--color-fondo-seccion` | `#F0F4D1` | blanco + 20 % lima | `#F8F9E8` | 1.06 | — | banda |
| `--color-superficie` | `#FFFFFF` | blanco puro | `#F8F9E8` | 1.07 | — | tarjeta elevada |
| `--color-superficie-suave` | `#F8F9E8` | = fondo | `#FFFFFF` | 1.07 | — | campo dentro de tarjeta |
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
| `--color-sobre-primario` | `#FFFFFF` | blanco | `#77286B` | **9.13** | 4.5 | 1.4.3 AA |
| `--color-acento` | `#48704B` | verde profundo | `#F8F9E8` | **5.33** | 4.5 | 1.4.3 AA |
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

### 3.5 `verde` — fondo `#F0F4F1`. **Aquí el escalón se rompe y hay que decidir.**

**El problema, medido:** el contrato fija hoy `--color-texto: #48704B` con **5.12** sobre
`#F0F4F1` (@s5, `tokensColor.test.ts:99-104`). Un `--color-texto-suave` tiene que ser
**más claro** que el cuerpo y seguir en ≥4.5. La ventana disponible es
**[4.50, 5.12]**, o sea nada: el candidato más claro que cumple es `#517754`
(verde + 5 % blanco) con **4.59**, que es perceptualmente indistinguible de `#48704B`.
Y peor: **ningún** aclarado del verde llega a 3:1 para `--color-borde-control`
(blanco+65 % verde = **2.49** sobre `#F0F4F1`; blanco+60 % = 2.28).

**Opción A — RECOMENDADA: bajar la escalera un peldaño.** El verde de marca deja de ser
el cuerpo y pasa a ser el texto suave; el cuerpo y la tinta se oscurecen.

| Rol | Valor | Derivación | Sobre | Ratio | Exigido | Criterio |
| --- | --- | --- | --- | --- | --- | --- |
| `--color-fondo` | `#F0F4F1` | blanco + 8 % verde *(ya fijado)* | — | — | — | — |
| `--color-fondo-seccion` | `#E2E8E2` | blanco + 16 % verde | `#F0F4F1` | 1.12 | — | banda |
| `--color-superficie` | `#FFFFFF` | blanco | `#F0F4F1` | 1.11 | — | tarjeta |
| `--color-superficie-suave` | `#F0F4F1` | = fondo | `#FFFFFF` | 1.11 | — | campo |
| `--color-tinta` | `#324E35` | verde + 30 % negro | `#F0F4F1` | **8.31** | 7.0 | 1.4.6 AAA |
| | | | `#FFFFFF` | **9.22** | 7.0 | 1.4.6 AAA |
| | | | `#E2E8E2` | **7.41** | 7.0 | 1.4.6 AAA |
| `--color-texto` | `#3A5A3C` | verde + 20 % negro | `#F0F4F1` | **6.99** | 4.5 | 1.4.3 AA |
| | | | `#FFFFFF` | **7.76** | 4.5 | 1.4.3 AA |
| | | | `#E2E8E2` | **6.23** | 4.5 | 1.4.3 AA |
| | | | `#F4EEF3` | **6.78** | 4.5 | 1.4.3 AA |
| `--color-texto-suave` | `#48704B` | **verde profundo de marca, sin tocar** | `#F0F4F1` | **5.12** | 4.5 | 1.4.3 AA |
| | | | `#FFFFFF` | **5.68** | 4.5 | 1.4.3 AA |
| | | | `#E2E8E2` | **4.57** | 4.5 | 1.4.3 AA |
| `--color-primario` | `#48704B` | verde profundo | `#F0F4F1` | **5.12** | 3.0 | 1.4.11 AA |
| | | | `#FFFFFF` | **5.68** | 3.0 | 1.4.11 AA |
| `--color-sobre-primario` | `#FFFFFF` | blanco | `#48704B` | **5.68** | 4.5 | 1.4.3 AA |
| `--color-acento` | `#77286B` | morado de marca | `#F0F4F1` | **8.22** | 4.5 | 1.4.3 AA |
| | | | `#FFFFFF` | **9.13** | 4.5 | 1.4.3 AA |
| | | | `#F4EEF3` | **7.99** | 4.5 | 1.4.3 AA |
| | | | `#E2E8E2` | **7.34** | 4.5 | 1.4.3 AA |
| `--color-acento-suave` | `#F4EEF3` | blanco + 8 % morado | `#F0F4F1` | 1.03 | — | píldora |
| `--color-borde` | `#D7E0D7` | blanco + 22 % verde | `#FFFFFF` | 1.35 | **exento** | decorativo |
| | | | `#F0F4F1` | 1.22 | **exento** | decorativo |
| `--color-borde-control` | `#5A7E5D` | verde + 10 % blanco | `#F0F4F1` | **4.13** | 3.0 | 1.4.11 AA |
| | | | `#FFFFFF` | **4.59** | 3.0 | 1.4.11 AA |
| | | | `#E2E8E2` | **3.69** | 3.0 | 1.4.11 AA |
| `--color-foco` | `#77286B` | ya fijado | `#F0F4F1` | **8.22** | 3.0 | 1.4.11 AA |
| | | | `#FFFFFF` | **9.13** | 3.0 | 1.4.11 AA |

**Coste de la opción A:** rompe **dos aserciones** de `tokensColor.test.ts:99-104`
(`expect(texto).toBe('#48704B')` y `expect(ratio).toBe(5.12)`). El **criterio** de @s5
(«ratio ≥ 4.5») se sigue cumpliendo con margen (6.99 > 5.12); lo que cambia es el
hexadecimal exacto que el escenario clava. **Es una ampliación de contrato → puerta
humana.** Como la capa global ya necesita ampliar el contrato de todas formas
(`restricciones_memoria_organizacional.md` §3.1: los 34 escenarios no mencionan ni una vez
`main.tsx`, `main.scss`, `body` ni `font-family`), entra en el mismo trámite.

**Opción B — sin tocar @s5:** `--color-texto` se queda en `#48704B` y
`--color-texto-suave` es `#517754` (**4.59** sobre `#F0F4F1`). Cumple el número
(≥4.5) y **no cumple el propósito**: la diferencia de luminancia entre 5.12 y 4.59 es de
un 10 %, o sea que el «texto suave» y el «texto» se verán iguales y la jerarquía que el
rol existe para dar no existirá. Además `--color-borde-control` seguiría necesitando un
verde tan oscuro como el cuerpo. **Lo digo sin adornos: la opción B pasa la puerta y no
resuelve el problema.**

### 3.6 `noche` — fondo `#000000`. **La variante donde los roles cambian de verdad.**

El morado da **2.30** contra negro puro: no puede ser texto **ni borde ni relleno de
botón** ahí (un botón relleno a 2.30 contra el fondo incumple SC 1.4.11, que es
justamente lo que exige que el componente sea identificable). Las superficies suben en
escalones de morado sobre negro; el texto baja de blanco a lavanda.

| Rol | Valor | Derivación | Sobre | Ratio | Exigido | Criterio |
| --- | --- | --- | --- | --- | --- | --- |
| `--color-fondo` | `#000000` | negro puro *(ya fijado)* | — | — | — | — |
| `--color-fondo-seccion` | `#180815` | negro + 20 % morado | `#000000` | 1.08 | — | banda |
| `--color-superficie` | `#240C20` | negro + 30 % morado | `#000000` | 1.15 | — | tarjeta elevada |
| `--color-superficie-suave` | `#30102B` | negro + 40 % morado | `#240C20` | 1.08 | — | campo dentro de tarjeta (en oscuro el campo **sube**, no baja) |
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
| `--color-sobre-primario` | `#000000` | **negro, no blanco** | `#B489AE` | **7.13** | 4.5 | 1.4.3 AA |
| `--color-acento` | `#B4C718` | lima de marca | `#000000` | **11.12** | 4.5 | 1.4.3 AA |
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

**Los tres cambios de rol de `noche`, y por qué:**

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
  Stryker no la ve. Extraerla es lo que convierte los 14 roles × 4 variantes en
  verificación mutada.
- `tokensColor.ts` ampliado: `RolDeColor` pasa de 3 a 14 valores, y **cada rol nuevo
  necesita su fila en la matriz de uso** (qué se pinta sobre qué). Un token que existe y
  no se verifica es el bloqueante del botón «Reservar» repitiéndose.
- `hojaGlobal.ts` → el enganche: `main.tsx` importa `./styles/main.scss`, y `main.scss`
  hace `@use` de los cinco parciales. Con **guarda de no-vacuidad propia**.
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
- **Que el parcial esté ENGANCHADO** a `main.scss` — la aserción anti-vacuidad.
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
(`?raw`), que `src/main.tsx` contiene `import './styles/main.scss'` y que
`src/styles/main.scss` hace `@use` de `tokens`, `reset` y `base`. Falla porque no existe
ninguno de los dos.

*Verde:* `main.scss` (5 líneas), `_reset.scss` (~35), `_base.scss` con **tres
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

**4. Los 11 roles de color nuevos, variante a variante.**

*Rojo:* `mezclaDeColor.test.ts` primero (la aritmética pura, que Stryker muerde), luego
`tokensColor.test.ts` ampliado: por cada uno de los 14 roles × 4 variantes, leer el valor
del texto real de `_tokens.scss`, recalcular el ratio contra su fondo declarado y exigir
el umbral del §3. Guarda de no-vacuidad por extractor.
*Verde:* los cinco bloques de `_tokens.scss`.
*Puerta humana dentro de este paso:* la opción A del §3.5 (`verde`) rompe dos aserciones
de @s5. No se aplica sin aprobación.

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

**8. `public/img/` — los 26 huecos.**

*Rojo:* una puerta de nivel A que compare las rutas declaradas en `src/data/*.ts` +
`MetadatosPagina.tsx:18` + `PieDePagina.tsx:12` contra los ficheros reales de `public/`.
*Verde:* los ficheros. El logo (`201×201`, ya existe en la raíz) y el resto según
`plan_imagenes.md` §4.3.
*Cuidado:* `PaginaTienda.test.tsx:167-181` fija **exactamente 8** imágenes con `alt=""`;
`PaginaBlog.test.tsx:566-581`, exactamente 3; `CampanasPortada.test.tsx:178-192`,
exactamente 3; `Servicios.test.tsx:398-416`, cero; `Equipo.test.tsx:184`, cero. Añadir una
imagen a una tarjeta rompe la suite, y **eso es lo que se quiere**.

**9. Playwright + axe (nivel C) y los cuatro sondeos del §4.4.**

**10. El diseño fino de los 17 `.module.scss`**: contenedor (`--maxw` + `--gutter` +
`--seccion-y`), bandeado alterno de secciones en `Landing.module.scss`, tarjeta,
botón primario/fantasma, píldora, eyebrow, prosa del blog. Va **al final** a propósito:
sin los pasos 1-6 cada uno de esos ficheros estaría maquetando sobre arena.

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
importa `src/main.tsx` ni `src/styles/main.scss`, y `vite.config.ts:65` ancla la
transformación de CSS a la query `?raw`. Es decir, **la hoja global nunca llega a jsdom**.
Los 712 tests renderizan componentes sueltos, sin capa base. El escenario catastrófico
(«hojas reales en jsdom rompen `getByRole`») **no se dispara** mientras nadie importe
`main.scss` desde un test.

Dicho eso, éstos son los sospechosos concretos, ordenados por probabilidad:

| Test | Por qué es sospechoso | Mitigación |
| --- | --- | --- |
| **`src/lib/diseno/tokensColor.test.ts` @s5** (`:99-104`) | **Rotura segura** si se aplica la opción A del §3.5: `expect(texto).toBe('#48704B')` y `expect(ratio).toBe(5.12)`. | Es el caso que exige puerta humana. Con la opción B no se rompe, pero el rol «texto suave» de `verde` no cumple su propósito. |
| **`tokensColor.test.ts` @s1** (`:24-34`) | Asevera **exactamente** `['marca','lima','verde','noche']` y `toHaveLength(4)`. Añadir el `:root` desnudo del paso 2 podría meterlo en el inventario. | Verificado leyendo `PATRON_SELECTOR_VARIANTE` (`tokensColor.ts:17`): solo matchea `:root[data-variante=…]`, así que el `:root` desnudo **no** entra. Riesgo controlado, pero hay que aseverarlo explícitamente. |
| **`tokensColor.test.ts`, todos** | `extraerBloqueDeVariante` usa `[^}]*`: **una sola llave anidada dentro de un bloque de variante rompe los 10 escenarios de golpe**. Con 14 roles la tentación de meter un `@media` o un `&` dentro crece. | Test explícito: ningún bloque de variante contiene `{` interno. |
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
