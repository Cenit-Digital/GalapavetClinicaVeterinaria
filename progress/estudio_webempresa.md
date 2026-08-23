# Estudio de la arquitectura de estilos de WebEmpresa (repo de referencia)

> **Propósito.** Galapavet copió `_tokens.scss` de este repo "a medias" y se dejó la
> capa global entera. Este documento destila, fichero a fichero y línea a línea, QUÉ
> más hay en WebEmpresa y CÓMO encaja, para poder adaptarlo **entero** y no a trozos.
>
> **Alcance y método.** Solo lectura. Todo lo que sigue está citado con
> `fichero:línea` sobre el clon de referencia en
> `…/scratchpad/org/WebEmpresa` (rutas abreviadas a partir de la raíz del repo).
> Lo que no se pudo verificar va marcado **NO VERIFICADO**.
>
> **Regla de portabilidad.** Se porta la **ESTRUCTURA** (qué ficheros existen, qué
> regla vive en cuál, cómo se enganchan, cómo se prueban). **NO** se portan los
> **VALORES** de marca: WebEmpresa es verde bosque `#1e7a4f` + limón `#e3d34a`
> (Cénit Digital); Galapavet es morado `#77286B` + lima `#B4C718`, ya verificados en
> `src/lib/tokens.ts` y en `src/styles/_tokens.scss` de Galapavet.

---

## 0 · Mapa de un vistazo

```
index.html:10-28              script inline anti-FOUC → data-theme en <html>
   │
src/main.tsx:1-8              @fontsource/outfit + @fontsource/dm-sans (8 CSS)
src/main.tsx:11               import './styles/main.scss'      ← LA LÍNEA QUE FALTA EN GALAPAVET
   │
src/styles/main.scss:1-4      @use 'tokens'; @use 'reset'; @use 'base'; @use 'logo-draw';
   ├── _tokens.scss   126 l.  :root { … } + :root[data-theme='dark'] { … }
   ├── _reset.scss     38 l.  box-sizing, márgenes, html, body, img, button, ul
   ├── _base.scss      70 l.  body/h1-h3/main/a/:focus-visible/.skip-link/.prose
   └── _logo-draw.scss 67 l.  8 @keyframes + reglas por data-attribute + reduced-motion
   │
*.module.scss (13)            Un módulo por componente; consumen var(--…) del global
```

Peso total del SCSS de WebEmpresa: **1926 líneas** en 18 ficheros
(`wc -l src/styles/*.scss src/components/*.module.scss`), de las cuales **301** son
la capa global (`main` 4 + `_tokens` 126 + `_reset` 38 + `_base` 70 + `_logo-draw` 67).

**Diagnóstico directo para Galapavet:** el proyecto tiene hoy `src/styles/_tokens.scss`
(134 líneas) y **nada más**; su `src/main.tsx:1-22` no importa ninguna hoja global,
y no hay dependencia de fuentes en `package.json` (solo `react`, `react-dom`,
`react-router`). Los cuatro huecos —`main.scss`, `_reset.scss`, `_base.scss` y la
línea de `main.tsx`— más las fuentes son exactamente lo que falta.

---

## 1 · La capa global, fichero a fichero

### 1.1 `src/main.tsx` — el enganche

```
src/main.tsx:1-4    import '@fontsource/outfit/400.css' … /700.css
src/main.tsx:5-8    import '@fontsource/dm-sans/400.css' … /700.css
src/main.tsx:9      import { ViteReactSSG } from 'vite-react-ssg'
src/main.tsx:10     import { routes } from './App'
src/main.tsx:11     import './styles/main.scss'
src/main.tsx:13     export const createRoot = ViteReactSSG({ routes })
```

- **Líneas 1-8 · Fuentes por paquete npm, no por CDN.** Los `@font-face` no se
  escriben a mano ni se enlazan a `fonts.googleapis.com`: se importan los CSS que
  publica `@fontsource` (`package.json:30-31`: `@fontsource/dm-sans` y
  `@fontsource/outfit`, ambos `^5.0.0`). Verificado: **no existe ni un `@font-face`
  ni una referencia a Google Fonts en todo `src/` ni en `index.html`** — el único
  origen de las fuentes son esas 8 líneas. Se cargan **4 pesos por familia**
  (400/500/600/700) porque el sistema usa 400 (texto), 500 (enlaces de nav,
  `HeaderNav.module.scss:14`), 600 (titulares y botones) y 700 (etiquetas
  `Servicios.module.scss:84`).
- **Línea 11 · La hoja global.** Un único `import` de SCSS en el punto de entrada.
  Este es el mecanismo, y es **la línea que Galapavet no tiene**. Sin ella, Vite no
  emite ninguna regla global: el `additionalData` de `vite.config.ts` de Galapavet
  (`vite.config.ts:31`, `@use "tokens" as *;`) solo inyecta el parcial **dentro** de
  cada `.module.scss`, lo que da acceso a variables/mixins de Sass pero **no emite
  el bloque `:root`** salvo que ese parcial se compile como parte de una entrada
  real. Es la causa raíz ya identificada, confirmada aquí desde el lado del patrón.
- **Orden.** Las fuentes se importan **antes** que `main.scss`, de modo que los
  `@font-face` quedan en el bundle CSS antes de la primera regla que los usa
  (`_base.scss:3`, `font-family: var(--font-sans)`).

### 1.2 `src/styles/main.scss` — el barril (4 líneas)

```scss
@use 'tokens';     // 1
@use 'reset';      // 2
@use 'base';       // 3
@use 'logo-draw';  // 4
```

- **Qué hace:** único punto de composición de la capa global. Nada más; ni una regla
  propia.
- **Por qué está:** ordena la cascada de forma explícita y auditable —
  tokens → reset → base → animaciones—, y da un único fichero que importar desde
  `main.tsx`. El orden importa: `_base.scss` consume `var(--font-sans)` etc., que
  `_tokens.scss` declara; y `_base.scss:2-13` (`body`) debe ganar a
  `_reset.scss:17-21` (`body`) donde ambos declaran `line-height` y
  `-webkit-font-smoothing` (ver §7, duplicación).
- **`@use` sin `as`**: los parciales solo emiten CSS, no exportan símbolos Sass, así
  que no hace falta namespace.
- **Es contrato testeado**: `src/styles/logo-draw.test.ts:40` asevera
  `expect(read('src/styles/main.scss')).toMatch(/@use\s+['"]logo-draw['"]/)` — es
  decir, "el parcial existe **y está enganchado**" es un escenario de aceptación
  (@s8), no una casualidad. **Este es el test que Galapavet más necesita**: es
  precisamente la comprobación que habría detectado el fallo.

### 1.3 `src/styles/_reset.scss` (38 líneas) — regla a regla

| Líneas | Regla | Qué hace | Por qué está |
| --- | --- | --- | --- |
| 1 | `/* Reset moderno y mínimo. */` | — | Declara la intención: no es Normalize ni Meyer; es el reset corto tipo Andy Bell. |
| 2-6 | `*, *::before, *::after { box-sizing: border-box }` | Padding y borde entran en el ancho declarado | Sin esto, `padding: … var(--gutter)` sobre un `.inner` con `max-width` desbordaría. Es la base del contrato de contenedor (§2). |
| 8-10 | `* { margin: 0 }` | Mata todos los márgenes por defecto | El ritmo vertical lo fija el sistema (`--section-y`, `gap` de flex/grid), no el navegador. Elimina de un plumazo los márgenes colapsantes de `h1`/`p`/`ul`. **Es lo que arregla el "margen de 8px del navegador" que hoy conserva el `body` de Galapavet** — junto con el hecho de que la regla aplique realmente. |
| 12-15 | `html { -webkit-text-size-adjust: 100%; scroll-behavior: smooth }` | Impide el inflado automático de texto en iOS al rotar; hace suave el salto de los anclas `#servicios`… | El `text-size-adjust` es higiene estándar. El `scroll-behavior` sirve a la nav de ancla (`src/lib/nav.ts`). **Ver la alerta de §1.3.1.** |
| 17-21 | `body { min-height: 100vh; line-height: 1.6; -webkit-font-smoothing: antialiased }` | Altura mínima de viewport; interlineado de lectura; suavizado | `min-height:100vh` evita que un footer "suba" en páginas cortas (p. ej. `aviso-legal`). El `line-height` y el suavizado se **redeclaran** en `_base.scss:6-7` con 1.65 (duplicación declarada en §7). |
| 23-28 | `img, picture, svg { display: block; max-width: 100% }` | Quita el hueco de línea base del `inline` y hace las imágenes fluidas | Sin `max-width:100%` cualquier imagen ancha genera scroll horizontal — el mismo invariante de "0 scroll horizontal" que persiguen `Servicios.module.scss:4` y `Hero.module.scss:3`. |
| 30-33 | `button { font: inherit; cursor: pointer }` | El botón hereda la tipografía del sistema y muestra la mano | Sin `font: inherit` el botón cae a la fuente del UA (el mismo síntoma que hoy sufre todo el `body` de Galapavet). Nótese que `Contacto.module.scss:110,166` vuelve a poner `font: inherit` en `.input` y `.submit`: los `input`/`select`/`textarea` **no** están cubiertos por este reset. |
| 35-38 | `ul { list-style: none; padding: 0 }` | Listas sin viñeta ni sangría | Todas las listas del sitio son estructuras de layout (`.features`, `.links`, `.nav`), no prosa. **Ojo:** esto también afecta a `.prose` (§1.4), donde una lista de aviso legal perdería sus viñetas — no hay regla que las restaure. Deuda menor no declarada. |

#### 1.3.1 ⚠ `scroll-behavior: smooth` NO tiene guarda de `prefers-reduced-motion`

**Verificado exhaustivamente.** Búsqueda en todo el repo
(`*.scss`, `*.ts`, `*.tsx`, `*.html`, `*.md`, excluyendo `node_modules`):

- `scroll-behavior` aparece **una sola vez en todo el repo**: `src/styles/_reset.scss:14`.
- Los únicos bloques `prefers-reduced-motion` del repo son cuatro y ninguno lo toca:
  - `src/styles/_logo-draw.scss:56` — `reduce` → `animation: none` sobre 8 selectores del logo.
  - `src/components/ServiceMockup.module.scss:539` — `reduce` → `animation: none` sobre 3 puntos animados.
  - `src/components/Servicios.module.scss:179` — `no-preference` (todo el revelado).
  - `src/components/Servicios.module.scss:237` — `no-preference` and `max-width: 880px`.

**Conclusión: NO se puede portar `_reset.scss:14` tal cual a Galapavet.** Incumpliría
un contrato ya cerrado, y por partida doble:

1. **Decisión 31 de `project-spec.md:113` de Galapavet**, literal: *"`scroll-behavior:
   smooth` vive **dentro** de `@media (prefers-reduced-motion: no-preference)`, no se
   declara y se revoca después"*. La decisión está razonada y cerrada, y cita como
   contraejemplo explícito la forma del prototipo.
2. **La puerta @s33** de `features/sistema_de_diseno_visual.feature:511-516`,
   implementada por `src/lib/diseno/movimientoRespetuoso.ts`, que recorre el texto
   real de cada fichero de estilos siguiendo la profundidad de bloques.

   *Matiz importante y honesto:* esa puerta solo vigila las propiedades `animation` y
   `transition` (`movimientoRespetuoso.ts:22`,
   `PATRON_PROPIEDAD_DE_MOVIMIENTO = /^\s*(animation|transition)\s*:/`), así que
   **un `scroll-behavior: smooth` suelto pasaría el test sin fallar**. Es decir: el
   arnés automático no lo cazaría, pero la Decisión 31 sí lo prohíbe. Portarlo sería
   introducir una violación de contrato invisible para los tests.

**Forma correcta para Galapavet** (la que el propio repo ya usa en
`src/components/Galeria.module.scss:44-46`, donde `scroll-behavior: smooth` está
**dentro** de un bloque `no-preference`):

```scss
html {
  -webkit-text-size-adjust: 100%;
}

@media (prefers-reduced-motion: no-preference) {
  html {
    scroll-behavior: smooth;
  }
}
```

### 1.4 `src/styles/_base.scss` (70 líneas) — regla a regla

| Líneas | Regla | Qué hace | Por qué está |
| --- | --- | --- | --- |
| 2-13 | `body { font-family: var(--font-sans); background-color: var(--color-bg); color: var(--color-text); line-height: 1.65; -webkit-font-smoothing; -moz-osx-font-smoothing; text-rendering; transition: background-color .2s, color .2s }` | **La regla más importante del repo.** Fija tipografía, fondo y color del documento entero desde tokens | Es exactamente la regla que Galapavet no tiene y por la que su `body` computa a "Times New Roman" con 0 `font-family` en el CSS emitido. La `transition` de 0.2 s existe para que el cambio de tema no sea un salto brusco. |
| 15-22 | `h1, h2, h3 { font-family: var(--font-display); font-weight: 600; line-height: 1.08; letter-spacing: -.01em }` | Titulares en la display, apretados | Un solo sitio fija el carácter de los titulares; luego cada módulo solo aporta `font-size` (`Hero.module.scss:44-48`, `Servicios.module.scss:22-27`). Nótese que **`h4`-`h6` quedan fuera**: no hay ninguno en el sitio. |
| 24-28 | Comentario de intención sobre `main` | — | Ver §1.4.1. |
| 29-31 | `main { display: block }` | Nada más que garantizar el `display` | Ver §1.4.1. |
| 33-36 | `a { color: inherit; text-decoration: none }` | Los enlaces heredan el color y no se subrayan | El sistema colorea los enlaces por contexto (`Footer.module.scss:30`, `HeaderNav.module.scss:19-22`), no globalmente. |
| 38-40 | `a:hover { text-decoration: underline }` | Subrayado al pasar | Afordancia mínima sin JS. Los módulos que no la quieren la anulan explícitamente: `Header.module.scss:20-22` (`.brand:hover`), `HeaderNav.module.scss:25-27` (`.cta:hover`). Ese patrón "global permisivo + opt-out local" es reutilizable. |
| 42-45 | `:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px }` | Anillo de foco global de teclado | **Patrón clave.** Un único anillo para todo el sitio, desde token, y con `:focus-visible` (no `:focus`), de modo que el ratón no lo dispara. `outline-offset: 2px` lo despega del borde del control para que se vea sobre fondos oscuros. Los módulos solo lo **ajustan** cuando hace falta: `ThemeToggle.module.scss:18-21` lo repite (redundante) y `Contacto.module.scss:120-123` lo aprieta a `offset: 1px` dentro del input. `DESIGN_SYSTEM.md:219-220` lo declara objetivo explícito. |
| 47-56 | `.skip-link { position: absolute; left: -9999px; top: 0; z-index: 100; padding: .5rem 1rem; background: var(--color-primary); color: var(--color-on-primary); border-radius: 0 0 var(--radius-sm) 0 }` | Enlace "saltar al contenido", fuera de pantalla | Ver §1.4.2. |
| 58-60 | `.skip-link:focus { left: 0 }` | Aparece al recibir foco | Ver §1.4.2. |
| 62-66 | `.prose { max-width: 72ch; margin: 0 auto; padding: 3.5rem var(--gutter) 5rem }` | Contenedor de lectura para páginas de texto | Ver §1.4.3. |
| 68-70 | `.prose h1 { margin-bottom: 1rem }` | Devuelve un margen que el reset mató | Consecuencia directa de `_reset.scss:8-10` (`* { margin: 0 }`): en prosa hay que reponer el ritmo a mano. |

#### 1.4.1 `main` no restringe ancho — el comentario y su razón

Literal, `_base.scss:24-31`:

```scss
/* `main#contenido` es el landmark y el destino del enlace "saltar al contenido":
   NO restringe ancho ni añade sangrado. La home son secciones a sangre completa,
   cada una con su propio `.inner` (max-width + gutter); si `main` añadiera
   max-width/padding duplicaría el gutter y recortaría las bandas de color de
   sección. Las páginas de texto (aviso legal) se maquetan con `.prose`. */
main {
  display: block;
}
```

Tres cosas que este comentario documenta y que **son la decisión arquitectónica
central del sistema de layout**:

1. `main` es **solo** landmark ARIA y destino del skip-link — `Layout.tsx:28`,
   `<main id="contenido" tabIndex={-1}>`.
2. Si `main` pusiera `max-width` + `padding`, el gutter se **duplicaría** (el de
   `main` más el del `.inner` de cada sección) y, peor, **las bandas de color de
   sección se recortarían**: `Sectores.module.scss:1-3` y `Contacto.module.scss:1-3`
   pintan `background: var(--color-bg-2)` sobre el elemento de sección esperando que
   llene el ancho del viewport. Un `main` con `max-width` dejaría franjas del color
   del `body` a los lados.
3. `display: block` es una salvaguarda: `main` es `block` por defecto en navegadores
   modernos, pero no en IE ni bajo ciertos resets. Es una regla **de valor casi nulo
   que existe para que el bloque tenga cuerpo** y el comentario tenga dónde vivir.

**Esta decisión no es original del handoff: es una CORRECCIÓN posterior.** El diff
contra `design/fundamentos/styles/_base.scss` lo prueba (ver §6): el paquete de
diseño entregaba `main { max-width: var(--maxw); margin: 0 auto; padding: 2rem
var(--gutter) 4rem }` y el repo lo **sustituyó** por `display: block` añadiendo el
comentario explicativo. Es decir: **el patrón bueno es el de `src/`, no el de
`design/fundamentos/`.** Portar el de `design/` reintroduciría el bug que este repo
ya arregló.

#### 1.4.2 `.skip-link` — el mecanismo completo

La técnica: **`left: -9999px` + `:focus { left: 0 }`**, no `display:none` ni
`visibility:hidden` (que sacarían el enlace del orden de tabulación y lo harían
inalcanzable). Detalles:

- `position: absolute` + `top: 0` → cuando aparece, se ancla arriba a la izquierda.
- `z-index: 100` → por encima de la cabecera sticky, que está en `z-index: 50`
  (`Header.module.scss:4`). Ese "100 > 50" es el mismo escalón que usa el drawer
  móvil (`MobileMenu.module.scss:17-22,29`) y que un test vigila (§5).
- Colores desde tokens (`--color-primary` / `--color-on-primary`), así que el enlace
  es legible en ambos temas sin código extra.
- `border-radius: 0 0 var(--radius-sm) 0` → solo la esquina inferior derecha, porque
  las otras tres tocan el borde de la ventana.
- **Uso obligado del `:focus` clásico, no `:focus-visible`.** Correcto: el skip-link
  debe revelarse siempre que reciba foco.
- **La mitad de JS**: `Layout.tsx:9-12,24-26` — el `onClick` hace
  `preventDefault()` y `document.getElementById('contenido')?.focus()`, en lugar de
  fiarse del salto de ancla. Sin ese `focus()` explícito el lector de pantalla
  seguiría "donde estaba" en muchos navegadores. Requiere `tabIndex={-1}` en el
  `<main>` (`Layout.tsx:28`) para que sea enfocable por programa.

**Patrón 100% reutilizable en Galapavet**, cambiando solo los tokens de color.
Galapavet ya tiene tests de foco (`src/accesibilidad-foco.test.tsx`) y de teclado
(`src/accesibilidad-teclado.test.tsx`) donde encajaría la comprobación.

#### 1.4.3 `.prose` — el otro contenedor

`.prose` es la **única** excepción al patrón `.inner`: en vez de `max-width: var(--maxw)`
(1180px, un ancho de layout) usa `max-width: 72ch` (un ancho de **lectura**, ~72
caracteres). Aporta él mismo el gutter (`padding: 3.5rem var(--gutter) 5rem`) y el
centrado (`margin: 0 auto`), porque en las páginas de texto no hay una sección
envolvente que los ponga. Se aplica en `src/pages/aviso-legal.tsx:7`
(`<article className="prose">`).

Es la respuesta a "¿y las páginas que **no** son bandas a sangre completa?": no se
toca `main`, se le pone una clase al artículo. **Directamente aplicable a las páginas
de Galapavet** (`PaginaBlog`, `PaginaNoEncontrada`), que son de texto.

### 1.5 `src/styles/_logo-draw.scss` (67 líneas)

Parcial global de **animación de marca** (feature #14). Es el único parcial global
que no es "fundacional".

- **Líneas 11-19 · 8 `@keyframes`, uno por línea física.** Deliberado: el test los
  localiza por nombre buscando la línea que empieza por `@keyframes <nombre> `
  (`logo-draw.test.ts:17-22`) y luego asevera subcadenas; si estuvieran multilínea, los
  `%` anidarían llaves y el parseo se complicaría. **Patrón de testabilidad, no de
  estilo.**
- **Líneas 21-54 · Las reglas cuelgan de `data-attributes`, no de clases**
  (`[data-logo-anim]`, `[data-hero-arc]`, `[data-orbit-ring]`, `[data-orbit-wave]`,
  `[data-orbit-dot-outline]`, `[data-orbit-dot-fill]`, `[data-orbit-cenit]`,
  `[data-orbit-digital]`). Por eso vive en el global y no en un `.module.scss`: los
  CSS Modules hashean nombres de clase, pero los selectores de atributo cruzan
  componentes intactos (el mismo CSS sirve al `Logo` de la cabecera y al arco del
  `Hero`). **Patrón reutilizable: cuando una regla debe aplicar a más de un
  componente, se cuelga de un `data-*` y se declara en el global.**
- **Líneas 23-25 · `@media (max-width: 820px)` que solo cambia `animation-name`**
  a `heroCycleOpacityMobile`. Recicla el shorthand entero (duración, easing,
  `infinite`) cambiando una sola propiedad. Elegante y reutilizable.
- **Líneas 56-67 · `@media (prefers-reduced-motion: reduce) { … animation: none }`**
  sobre los 8 selectores.
- **La regla de oro, en el comentario de las líneas 5-8: "R1 · Estado BASE =
  DIBUJADO. El estado OCULTO vive en el 0% de cada keyframe, nunca en el CSS base".**
  Consecuencia: con `animation: none` (reduced-motion, o navegador sin soporte) y en
  el prerender SSG, el logo se ve **completo**. Es exactamente el mismo invariante
  que Galapavet llama *Invariante 4 · `estado-base-visible-ssg-reduced-motion`*
  (`src/lib/accesibilidad-movimiento.ts:5-8`). **Coincidencia total de doctrina entre
  los dos repos** — con la diferencia de que WebEmpresa lo verifica sobre el texto del
  SCSS (`logo-draw.test.ts:119-137`) y Galapavet sobre un inventario declarado.
- **Línea 7-8 + test @s17 (`logo-draw.test.ts:151-159`): el parcial no declara ni un
  token nuevo ni un hex.** `expect(scss).not.toMatch(/--color-[\w-]+\s*:/)` y
  `expect(scss).not.toMatch(/#[0-9a-fA-F]{3,6}/)`. Puerta de disciplina automatizada.

**Portabilidad a Galapavet:** el **mecanismo** es portable (parcial global +
`data-*` + reduced-motion + estado base visible). El **contenido** no: es la órbita
de Cénit Digital. Galapavet no tiene una animación de logo equivalente
(**NO VERIFICADO** si la quiere).

---

## 2 · El sistema de contenedor: el contrato de `.inner`

### 2.1 El contrato, en una frase

> **La sección pone el color a sangre completa; el `.inner` de dentro pone el ancho
> máximo, el centrado y los dos gutters. `main` no pone nada.**

### 2.2 La forma canónica

```scss
/* Elemento de sección: solo color de fondo, ancho = viewport */
.services {
  background: var(--color-bg);
}

/* Hijo directo: ancho máximo + centrado + gutter horizontal + ritmo vertical */
.inner {
  max-width: var(--maxw);   /* 1180px */
  margin: 0 auto;           /* centrado */
  padding: var(--section-y) var(--gutter);  /* 84px vertical, 26px horizontal (escritorio) */
}
```

Está declarada así, **literalmente idéntica**, en:

| Fichero | Sección (fondo) | `.inner` |
| --- | --- | --- |
| `Servicios.module.scss` | `:1-5` `.services` `--color-bg` + `overflow-x: clip` | `:7-11` |
| `Paquetes.module.scss` | `:1-3` `.packages` `--color-bg` | `:5-9` |
| `Sectores.module.scss` | `:1-3` `.sectors` `--color-bg-2` | `:5-9` |
| `Contacto.module.scss` | `:1-3` `.contact` `--color-bg-2` | `:5-13` (+ `display:grid` 2 col) |

Y con **variantes justificadas** en:

| Fichero | Variación | Por qué |
| --- | --- | --- |
| `Hero.module.scss:26-32` | `padding: clamp(56px,12vw,92px) var(--gutter) clamp(52px,10vw,80px)` en vez de `var(--section-y)`; + `position: relative; z-index: 2` | El hero respira más arriba que abajo (no es simétrico) y su `.inner` debe pintar **sobre** el arco decorativo absoluto (`:7-16`, `z-index: 1`). |
| `Header.module.scss:10-18` | `padding: 14px var(--gutter)` (vertical minúsculo) + `display:flex; justify-content: space-between` | Es una barra, no una sección: el ritmo vertical de sección no aplica. |
| `Footer.module.scss:1-16` | El **padding vertical vive en `.footer` (`44px 0`)** y el `.inner` solo pone `padding: 0 var(--gutter)` | Ver §2.4: es la única forma correcta de que el borde superior (`border-top`, `:3`) llegue a sangre completa. |

### 2.3 Quién pone qué — respuesta explícita

| Responsabilidad | Quién | Cita |
| --- | --- | --- |
| **`max-width`** | Siempre el `.inner`, nunca la sección, nunca `main` | `Servicios.module.scss:8`, `Paquetes.module.scss:6`, `Sectores.module.scss:6`, `Contacto.module.scss:6`, `Hero.module.scss:27`, `Header.module.scss:11`, `Footer.module.scss:8` |
| **Centrado** | El `.inner`, con `margin: 0 auto` | mismas líneas +1 |
| **Gutter horizontal** | El `.inner`, con `padding: … var(--gutter)` — **una sola vez en toda la cadena** | mismas líneas +2 |
| **Ritmo vertical** | El `.inner` con `var(--section-y)` (excepto Footer y Header) | `Servicios.module.scss:10` etc. |
| **Color de banda a sangre completa** | El **elemento de sección**, que no lleva `max-width` | `Servicios.module.scss:2`, `Sectores.module.scss:2`, `Contacto.module.scss:2`, `Footer.module.scss:2` |
| **Nada en absoluto** | `main` | `_base.scss:29-31` |

### 2.4 Cómo se consiguen las bandas de color a sangre completa

Tres piezas encajadas:

1. **El elemento de sección no tiene `max-width`.** Su ancho es el del bloque
   contenedor, que es `main` (`_base.scss:29-31`, sin restricción), que a su vez es
   el `body` (`_reset.scss:17`, sin restricción). Por tanto llega de borde a borde.
2. **El fondo se pinta en ese elemento.** `background: var(--color-bg)` o
   `var(--color-bg-2)`.
3. **La alternancia es intencional y está documentada:** `DESIGN_SYSTEM.md:156-158` —
   *"Las secciones son a sangre completa (su fondo llena el ancho de viewport) con
   este contenedor interior. Alternancia de fondo: `--color-bg` ⇄ `--color-bg-2`
   (hero/servicios/paquetes usan `bg`; sectores/contacto usan `bg-2`)"*. Verificado
   contra el orden real de `pages/home.tsx:41-45`: Hero(`bg`) → Servicios(`bg`) →
   Sectores(`bg-2`) → Paquetes(`bg`) → Contacto(`bg-2`).

**El caso del Footer es el que enseña la regla.** `Footer.module.scss:1-5` pone
`background: var(--color-band)`, `border-top: 1px solid var(--color-band-border)` **y
`padding: 44px 0`** — el padding vertical arriba, el horizontal (`0`) también, y es el
`.inner` (`:7-16`) el que aporta `padding: 0 var(--gutter)`. Si el padding vertical
viviera en el `.inner`, el `border-top` seguiría a sangre completa (está en `.footer`)
pero la banda de color quedaría con el mismo alto — o sea: aquí da igual. Lo que **no**
da igual es lo contrario: si el `background` viviera en el `.inner`, la banda gris del
footer sería un rectángulo de 1180px centrado con dos franjas del color del `body` a
los lados. Ese es el fallo que el patrón previene.

La cabecera aplica el mismo principio con un extra: `Header.module.scss:1-8` lleva
`position: sticky`, `backdrop-filter: blur(8px)` y
`background: color-mix(in srgb, var(--color-band) 86%, transparent)` — la
translucidez y el desenfoque se pintan sobre **todo** el ancho, mientras el contenido
(logo + nav) se alinea al mismo `--maxw` que el resto del sitio. Ese "la barra fija
llega a los bordes pero su contenido se alinea con el grid" es exactamente el efecto
que hace que un sitio parezca profesional.

### 2.5 Qué pasa si se anida mal

Tres modos de fallo, y los tres son consecuencia mecánica del contrato:

1. **`.inner` dentro de `.inner` → doble gutter y ancho recortado.** Cada nivel suma
   su `padding: var(--gutter)`. Con `box-sizing: border-box` (`_reset.scss:2-6`) el
   contenido útil pasa de 1180−52 = 1128px a 1128−52 = 1076px, y en móvil de 320−36
   a 320−72 = 248px, que es cuando se nota de verdad. Este es **exactamente** el fallo
   que el comentario de `_base.scss:24-28` documenta y previene: *"si `main`
   añadiera max-width/padding duplicaría el gutter"*.
2. **`max-width` o `padding` en el elemento de sección → se pierde la banda de
   color.** El fondo deja de llenar el viewport y aparecen franjas del `body` a los
   lados. Es lo que ocurriría al portar el `_base.scss` de `design/fundamentos/`
   (que sí ponía `max-width` en `main`).
3. **Fondo en el `.inner` en vez de en la sección → banda flotante.** Un rectángulo
   de color de 1180px centrado, con los bordes cortados. El síntoma visual clásico
   de "esto no parece una web de verdad".

**Salvaguarda declarada contra el desbordamiento horizontal:** `Servicios.module.scss:3-4`
añade `overflow-x: clip` a la sección con el comentario *"Blinda el 0-scroll-horizontal
ante los transforms transitorios del reveal"*, y `Hero.module.scss:3` usa
`overflow: hidden` para recortar el arco decorativo, que está deliberadamente fuera
del viewport (`right: -120px; top: -80px`). Ambos están **testeados**
(`Hero.test.tsx:33-40`, `Servicios.reveal.test.tsx:216-231`).

### 2.6 Cómo se refleja en el JSX

Siempre igual — sección semántica + un único `<div className={styles.inner}>`:

`Contacto.tsx:63`, `Footer.tsx:10`, `Header.tsx:9`, `Hero.tsx:46`, `Paquetes.tsx:53`,
`Sectores.tsx:35`, `Servicios.tsx:72`. Siete componentes, cero excepciones.

Y hay un test que vigila la **estructura** del anidamiento:
`Header.test.tsx:42-52` comprueba que el `banner` tiene un `firstElementChild` con
exactamente 2 hijos (marca + nav). Es una comprobación de "el `.inner` existe y es
el hijo directo", sin aseverar sobre el nombre de clase hasheado.

---

## 3 · Patrones de componente

> **Nota sobre `github.md`.** El enunciado cita un `github.md` "del zip de diseño"
> que nombra expresamente `Servicios.module.scss`, `Hero.module.scss` y
> `Paquetes.module.scss`. **NO VERIFICADO**: no existe ningún `github.md` en el clon
> de WebEmpresa (`find . -iname "github.md"` → 0 resultados). Lo que sí existe y
> cumple ese papel es `design/HANDOFF.md` (§1, líneas 19-42: lista de rutas) y
> `docs/DESIGN_SYSTEM.md`. El zip original (`Implementar diseño system en
> Github- Listo.zip`, 2,4 MB en la raíz) no se descomprimió (regla de solo lectura).

### 3.1 Anatomía compartida — la "plantilla de sección"

Cinco de los siete componentes de sección comparten un esqueleto **idéntico salvo
valores**, que es el patrón más reutilizable de todo el repo:

```
.<seccion>   → background: var(--color-bg | --color-bg-2)
.inner       → max-width / margin auto / padding section-y gutter
.eyebrow     → 12px · letter-spacing .22em · uppercase · var(--color-accent) · 600 · margin-bottom 14px
.title       → var(--font-display) · clamp(28px, 4vw, 44px) · line-height 1.08 · ls -.01em · 600 · var(--color-text)
.highlight   → font-style: normal · color: var(--color-primary)   ← <em> recoloreado, no cursiva
.intro       → 17px · line-height 1.7 · var(--color-text-soft) · max-width 58ch · margin-top 18px
```

Verificado idéntico en `Servicios.module.scss:13-43`, `Paquetes.module.scss:11-40`,
`Contacto.module.scss:19-47` (aquí `.intro` sin `max-width`, porque el `.header`
padre ya lo acota a `46ch`, `:15-17`) y `Sectores.module.scss:16-20`. El `Hero`
usa la misma familia con valores mayores (`:34-60`: eyebrow 12px igual, title
`clamp(34px, 5.4vw, 62px)`, lead `clamp(16px, 4.4vw, 19px)`).

Detalles que merecen copiarse:

- **`.highlight { font-style: normal; color: var(--color-primary) }`** — el titular
  se escribe con un `<em>` alrededor de la palabra destacada (semántica correcta) y
  el CSS le quita la cursiva y le pone el color de marca. Recolorear una palabra del
  h1 sin meter un `<span>` sin significado.
- **`max-width` en `ch`, no en `px`**: `18ch` (título de Servicios), `58ch` (intro),
  `54ch` (lead del hero), `17ch` (título del hero), `46ch` (cabecera de contacto),
  `62ch` (cabecera de sectores), `72ch` (`.prose`). La medida de línea se expresa en
  la unidad correcta: caracteres.
- **`clamp()` para todo tamaño de texto grande**, nunca media queries de tipografía.
  Ver §3.7.

### 3.2 `Servicios.module.scss` (244 líneas) — el más rico

**Estructura:** sección → `.inner` → cabecera (eyebrow/title/intro) → `.rows` (flex
column, `gap: 34px`, `margin-top: 54px`, `:45-50`) → N × `.row`.

**El zig-zag, en 3 reglas y sin JS** (`:52-67`):

```scss
.row                       { display: grid; grid-template-columns: 1.05fr 1.15fr; gap: 30px; align-items: center; }
.row:nth-child(even) .card { order: 2; }                             /* la tarjeta pasa a la derecha */
.row:nth-child(even)       { grid-template-columns: 1.15fr 1.05fr; } /* y el ratio se invierte con ella */
```

Es el patrón estrella: la alternancia visual sale entera de `:nth-child(even)`, sin
un solo atributo en el HTML. Y se **reutiliza gratis** para la coreografía de
entrada (`:222-231`), con el comentario *"Zig-zag GRATIS: las filas pares ya
invierten columnas en el layout, así que invertimos también su dirección horizontal
apoyándonos en el mismo `:nth-child(even)` → cada fila difiere de la de arriba sin
código extra"*. Hay un test que **prohíbe** la alternativa peor:
`Servicios.reveal.test.tsx:191-206` (@s11) asevera `expect(scss).not.toMatch(/data-dir/)`
y lo mismo sobre `Servicios.tsx`.

**Tarjeta** (`:69-75`): `var(--color-card-bg)` + `1px solid var(--color-border)` +
`var(--radius)` + `padding: 36px 32px` + `var(--shadow)`. Los cuatro ejes
(superficie, borde, radio, elevación) desde token.

**Lista de características** (`:105-121`): `.features` es un `<ul>` con
`border-top: 1px solid var(--color-border)` y `padding-top: 18px` — el separador
horizontal se consigue con el borde superior de la lista, no con un `<hr>`. Cada
`.feature` es `display:flex; gap: 9px` con un `CheckIcon` cuyo único estilo es
`CheckIcon.module.scss:1-5` (`flex-shrink: 0; stroke: var(--color-primary)`).
`flex-shrink: 0` es la línea que evita que el icono se aplaste cuando el texto es
largo — detalle pequeño, error frecuente.

**Revelado en scroll** (`:176-244`): ver §3.8.

### 3.3 `Hero.module.scss` (129 líneas)

**Estructura:** `.hero` (relative + `overflow: hidden` + bg) → `.arc` (absolute,
z-1) → `.inner` (relative, z-2) → eyebrow / title / lead / `.actions` / `.stats`.

Patrones destacables:

- **Decoración fuera de flujo y recortada** (`:7-16` + `:3`): el arco está a
  `right: -120px; top: -80px`, 540×540, `opacity: .42`, `pointer-events: none`
  (para que no robe clics) y `z-index: 1`. El `overflow: hidden` del padre lo
  recorta. En móvil (`:18-24`) baja a `opacity: .1` y se aleja más
  (`right: -160px; top: -130px`).
- **Par de botones** (`:68-95`): `.primary` y `.secondary` comparten en una regla
  conjunta `font-weight: 600; font-size: 15px; border-radius: var(--radius-pill)`, y
  luego difieren solo en fondo/color/borde. El `padding` del secundario es `13px 27px`
  frente a `14px 28px` del primario: **compensa exactamente el borde de 1.5px** para
  que ambos botones midan lo mismo. Detalle de oficio, copiable tal cual.
- **`.stats`** (`:97-118`): flex con `gap: 46px` + `border-top` + `padding-top: 32px`;
  en ≤560px (`:120-128`) pasa a `grid-template-columns: 1fr 1fr` con el comentario
  *"las 4 estadísticas en una rejilla 2×2 alineada (en vez de flex-wrap con anchos
  irregulares)"*. Ejemplo canónico de **cuándo cambiar de flex a grid en el
  breakpoint**: flex-wrap deja columnas desalineadas, grid no.

### 3.4 `Paquetes.module.scss` (156 líneas)

**Estructura:** sección → `.inner` → cabecera → `.grid` (`repeat(3, 1fr)`, gap 22px,
`align-items: start`) → 3 × `.card`.

El patrón que hay que robar aquí es **`:has()` como interruptor de variante**:

```scss
.card:has(.badge)          { border-color: var(--color-primary); box-shadow: var(--shadow); }  /* :61-64 */
.card:has(.badge) .cta     { background: var(--color-primary); color: var(--color-on-primary); border-color: var(--color-primary); }  /* :136-140 */
.card:has(.badge) .cta:hover { filter: brightness(1.08); }  /* :142-144 */
```

La tarjeta destacada **no lleva una clase modificadora**: se distingue porque
contiene un `.badge`. Un solo dato en el JSX (¿hay insignia?) gobierna tres efectos
visuales (borde, sombra, y el CTA que pasa de outline a sólido). Menos props, menos
estados que sincronizar. Los otros dos:

- **`.card { display: flex; flex-direction: column }` + `.cta { margin-top: auto }`**
  (`:50-57`, `:113-117`): los tres CTAs quedan alineados abajo aunque las listas de
  características tengan distinta longitud. La alternativa (alturas fijas) es frágil.
- **`.badge { position: absolute; top: -13px; left: 28px }`** (`:66-78`) sobre un
  `.card { position: relative }`: la insignia monta a caballo del borde superior.

### 3.5 Cabecera: `Header` + `HeaderNav` + `MobileMenu`

**`Header.module.scss` (22 líneas)** — la barra:

- `:1-8` `position: sticky; top: 0; z-index: 50; backdrop-filter: blur(8px);
  background: color-mix(in srgb, var(--color-band) 86%, transparent);
  border-bottom: 1px solid var(--color-band-border)`.
  El `color-mix(… 86%, transparent)` es **la forma correcta de hacer translúcido un
  token de color sin duplicar el valor**: no se escribe un `rgba()` paralelo que
  habría que mantener sincronizado con el token en los dos temas. **Patrón muy
  reutilizable para Galapavet**, que tiene 4 variantes de paleta y donde duplicar
  valores translúcidos sería 4× el mantenimiento.
- `:10-18` el `.inner` (ver §2.2).
- `:20-22` `.brand:hover { text-decoration: none }` — opt-out del subrayado global.

**`HeaderNav.module.scss` (39 líneas)** — enlaces + CTA:

- `:1-5` `.nav` flex, gap 1.25rem; `:7-11` `.mobile` flex, gap .5rem.
- `:17-23` `.cta` píldora sólida (`--radius-pill`), y `:25-27` su opt-out de subrayado.
- **`:29-39` la joya**: un `@media (max-width: 767px) { .nav { display: none } }`
  con un comentario de 5 líneas que explica **por qué CSS y no JS**:
  *"El prerender SSG (vite-react-ssg) no tiene viewport y hornea la nav de escritorio
  en el HTML estático. Esta red CSS la oculta en móvil para que el HTML
  pre-hidratación no desborde sobre el hero. Breakpoint idéntico a MOBILE_QUERY
  ('(max-width: 767px)') de src/lib/useIsMobile.ts."*
  Es decir: la lógica de "¿móvil?" vive en JS (`useIsMobile`), pero hay una **red de
  seguridad CSS con el mismo breakpoint** para la ventana entre el HTML estático y la
  hidratación. Y el enlace entre los dos valores está **testeado**
  (`HeaderNav.test.tsx:76-84`). Patrón reutilizable siempre que un valor viva a la
  vez en CSS y en JS.

**`MobileMenu.module.scss` (65 líneas)** — el drawer:

- `:1-13` `.trigger`, botón de 2.5rem × 2.5rem (=40px).
- `:15-22` `.overlay` `position: fixed; inset: 0; z-index: 100` con **comentario que
  explica el número**: *"z-index > 50 (Header.module.scss .header) para pintar el
  drawer SOBRE la cabecera sticky; si no, la cabecera oculta el título «Menú» y el
  botón ✕"*. Y hay un **test que vigila la relación**, no el valor (§5).
- `:24-39` `.panel` fixed a la derecha, `width: min(80vw, 320px)` — el `min()` evita
  el media query.

### 3.6 `Footer.module.scss` (35 l.) y `ThemeToggle.module.scss` (21 l.)

**Footer**: ver §2.4. Añade `.inner { flex-wrap: wrap; justify-content:
space-between; gap: 18px }` (`:11-15`) → **responsive sin un solo media query**:
cuando no cabe, el `flex-wrap` apila. Es la razón de que el footer no aparezca en el
recuento de media queries.

**ThemeToggle**: 38×38px, `border: 1px solid var(--color-band-border)`, `background:
transparent`, `color: var(--color-text)` (el SVG usa `stroke="currentColor"`,
`ThemeToggle.tsx:43`), `:hover` → `border-color: var(--color-primary)`. **Deuda:
`border-radius: 10px` literal (`:9`) en vez de un token de la escala** (`--radius-sm`
es 12px) y `:18-21` **repite el `:focus-visible` que `_base.scss:42-45` ya da
globalmente** — redundancia inofensiva pero innecesaria. Ninguna de las dos cosas se
porta.

### 3.7 `Contacto.module.scss` (192 líneas) — el formulario

- `:5-13` el `.inner` **es** el grid de dos columnas (`1fr 1.1fr`, gap 44px,
  `align-items: start`): el contenedor y el layout son el mismo elemento. Ahorra un div.
- `:65-75` `.form` es a su vez un grid de 2 columnas con gap 16px.
- **`:77-85` la regla que hace todo el trabajo:**
  ```scss
  .form .field:has(textarea),
  .submit,
  .success,
  .formError {
    grid-column: 1 / -1;
  }
  ```
  Nombre|Correo y Teléfono|Sector quedan emparejados; el mensaje, el botón y los
  avisos ocupan el ancho completo — **sin clases modificadoras**, porque el campo del
  mensaje se identifica por contener un `<textarea>`. Segunda aparición del patrón
  `:has()` (la primera, `Paquetes`). Muy reutilizable para el
  `FormularioContacto.module.scss` de Galapavet.
- `:130-136` `.honeypot { position: absolute; left: -9999px; width:1px; height:1px;
  overflow: hidden }` — el campo trampa antispam, oculto con la misma técnica que el
  skip-link (fuera de pantalla, no `display:none`, para que los bots lo rellenen).
- `:138-156` `.fieldError` / `.formError` en `var(--color-danger)`, `.success` en
  `var(--color-success)`: los estados de feedback son **tokens de tema**, con valores
  distintos en claro (`#b3261e` / `#1e7a4f`) y oscuro (`#f2b8b5` / `#8fd0a3`,
  `_tokens.scss:121-122`), porque un rojo oscuro sobre fondo noche no se lee.
  **Patrón muy reutilizable**: los colores de estado también se conmutan por tema.
- `:115-123` `.input:focus { outline: none; border-color: var(--color-primary) }` +
  `.input:focus-visible { outline: 2px solid …; outline-offset: 1px }`. El `outline:
  none` **solo** en `:focus` y con un `:focus-visible` que lo repone: el ratón no ve
  anillo, el teclado sí. Correcto.
- **Deuda:** `:109` `border-radius: 11px` literal (el token `--radius-sm` es 12px).
  `DESIGN_SYSTEM.md:151` incluso lo blanquea escribiendo *"Superficies pequeñas,
  notas, inputs (11–12px)"*. No se porta: en Galapavet el radio sale de la escala.

### 3.8 Responsive: cuántos `@media` hay y de qué tipo

**Recuento exacto sobre todo el repo** (`grep -rn "@media" --include="*.scss"`,
excluyendo `node_modules`): **15 media queries en total**, todas en `src/`
(`design/fundamentos/` tiene **0**).

| Tipo | Nº | Dónde |
| --- | --- | --- |
| `max-width: 880px` | 4 | `Contacto:180`, `Paquetes:146`, `Sectores:128`, `Servicios:151` |
| `max-width: 560px` | 4 | `Contacto:187`, `Hero:122`, `Paquetes:152`, `Servicios:162` |
| `max-width: 820px` | 2 | `Hero:18`, `_logo-draw:23` |
| `max-width: 767px` | 1 | `HeaderNav:35` |
| `prefers-reduced-motion: reduce` | 2 | `_logo-draw:56`, `ServiceMockup:539` |
| `prefers-reduced-motion: no-preference` | 1 | `Servicios:179` |
| `no-preference` **and** `max-width: 880px` | 1 | `Servicios:237` |
| **Total** | **15** | |

Hechos que se derivan del recuento:

- **11 breakpoints en 1926 líneas de SCSS**, para un sitio de 5 secciones + cabecera
  + footer + 2 páginas. Densidad bajísima, y es deliberado.
- **Cero `min-width`. Cero container queries. Cero `@supports`.** El sistema es
  **desktop-first** al 100%: se diseña el escritorio y se colapsa hacia abajo.
- **Solo 4 valores de breakpoint** (880 / 820 / 767 / 560), y `DESIGN_SYSTEM.md:210-217`
  documenta qué hace cada uno. El 767 no es arbitrario: es el espejo de
  `MOBILE_QUERY` en `src/lib/useIsMobile.ts`.
- **La razón de que haya tan pocos** es que el trabajo lo hacen, en este orden:
  1. `clamp()` en los tokens: `--gutter: clamp(18px, 5vw, 26px)` y `--section-y:
     clamp(56px, 9vw, 84px)` (`_tokens.scss:26-27`) — **el espaciado del sitio entero
     es fluido sin un solo media query**.
  2. `clamp()` en cada tamaño de texto grande (`Hero:45,55,108`, `Servicios:24`,
     `Paquetes:22`, `Contacto:30`).
  3. `flex-wrap` + `gap` (`Hero .actions:62-66`, `Hero .stats:97-104`,
     `Footer .inner:11-15`).
  4. `min()` / `max-width` en `ch` (`MobileMenu .panel:30`, todos los `max-width: Nch`).

  Los 11 media queries que quedan hacen **solo lo que ninguna de esas cuatro técnicas
  puede hacer**: cambiar el número de columnas de un grid (5 de ellos), cambiar el
  `order`, o cambiar de flex a grid.
- **El comentario de `_tokens.scss:23-25` explica la elección de los clamps:**
  *"En escritorio conservan los valores exactos del diseño (26 / 84) porque el clamp
  los tapa por arriba; en móvil se reducen para no apretar el contenido (responsive
  pro, no invención)"*. Es decir: el clamp se calibra para que **el extremo superior
  reproduzca el diseño 1:1** y solo el extremo inferior sea decisión de ingeniería.
  Ese razonamiento es directamente aplicable a Galapavet, que ya usa escalas fluidas
  Utopia (`src/styles/_tokens.scss:6-11`).

### 3.9 Movimiento (patrón, no valores)

`Servicios.module.scss:176-244` es la implementación de referencia del revelado en
scroll, y su disciplina coincide punto por punto con la de Galapavet:

- **Todo el bloque cuelga de `@media (prefers-reduced-motion: no-preference)`**
  (`:179`) — *opt-in*, no *declarar y revocar*. Es literalmente la Decisión 31 de
  Galapavet (`project-spec.md:113`), que rechaza explícitamente la forma
  "declarar por defecto y anular en `reduce` con `*{transition-duration:.01ms}`".
- **Solo `opacity` y `transform`** (`:186-188`), nunca propiedades que provoquen
  reflow. Hay un test que lo **prohíbe explícitamente**:
  `Servicios.reveal.test.tsx:149-161` (@s9) asevera
  `expect(props).not.toMatch(/\b(top|left|right|bottom|margin|width|height|padding)\b/)`.
- **Estado base = estado final visible** (`:176-178`): el oculto solo existe bajo
  `[data-reveal] .row:not([data-in-view])`, o sea cuando el JS ha armado el
  contenedor. Sin JS, en SSG o con `reduce`: contenido completo. Test @s7,
  `Servicios.reveal.test.tsx:123-131`.
- **Stagger por `transition-delay`** (`:191-202`): 0s / 0.4s / 0.8s.
- **Fallback móvil** (`:234-243`): en ≤880px todo sube (`translateY`) en vez de
  entrar de los lados, *"0 riesgo de scroll horizontal"*.

Los **valores** (2.8s de duración, 44px de desplazamiento, `cubic-bezier(.22,1,.36,1)`)
son de Cénit Digital y **no se portan**: Galapavet fija su propia escala de dos pasos
(150ms/300ms, `ease-out`) en la Decisión 31.

---

## 4 · Conmutación de tema: `[data-theme]` sobre `<html>`

### 4.1 Las cinco piezas

| # | Pieza | Fichero:línea | Qué hace |
| --- | --- | --- | --- |
| 1 | **Declaración CSS** | `_tokens.scss:16-83` (`:root`) y `_tokens.scss:88-126` (`:root[data-theme='dark']`) | Dos bloques de custom properties. El claro es el `:root` desnudo → **es el valor por defecto sin atributo**; el oscuro solo redefine las que cambian. |
| 2 | **Script inline anti-FOUC** | `index.html:10-28` | IIFE **síncrona, sin `src`, sin `defer`/`async`**, en el `<head>`, antes del `<script type="module">` de la línea 32. Lee `localStorage`, resuelve, y hace `document.documentElement.dataset.theme = theme`. |
| 3 | **Réplica pura testeable** | `theme.ts:83-88` (`initialThemeAttribute`) | Función pura que replica la lógica del script inline para poder probarla. Su docstring lo dice: *"Réplica pura de la lógica del script anti-FOUC del index.html (@s8)"*. |
| 4 | **API de tema en runtime** | `theme.ts:11-76` | `systemPrefersDark`, `applyTheme`, `getStoredMode`, `resolveTheme`, `applyInitialTheme`, `setMode`, `nextMode`. |
| 5 | **Control de UI** | `ThemeToggle.tsx:92-123` | Botón que cicla `light → dark → system → light` y, **solo en modo `system`**, registra un listener de `prefers-color-scheme` (`:98-107`). |

### 4.2 Cómo se aplica antes del primer pintado

```html
<!-- index.html:10-28 -->
<script>
  ;(function () {
    try {
      var stored = localStorage.getItem('cenit-theme')
      var theme = stored === 'dark' || stored === 'light'
          ? stored
          : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      document.documentElement.dataset.theme = theme
    } catch (e) {
      document.documentElement.dataset.theme = 'light'
    }
  })()
</script>
```

Cuatro propiedades no negociables, todas presentes:

1. **Inline y síncrono** — el parser se detiene, ejecuta, y solo entonces sigue: el
   atributo está puesto antes de que exista un solo píxel.
2. **En el `<head>`, antes del bundle** (`index.html:32`).
3. **`try/catch` que cae a `'light'`** — `localStorage` lanza en Safari privado y en
   contextos sin origen.
4. **No puede importar código** (corre antes del bundle), por eso es un **espejo
   escrito a mano**, y el comentario de `index.html:11-13` lo declara así:
   *"Espejo de src/lib/theme.ts:initialThemeAttribute"*.

Complemento en `index.html:7-9`: dos `<meta name="theme-color">` con `media` por
esquema, más `<meta name="color-scheme" content="light dark">` — para que el
navegador pinte los controles nativos (scrollbars, inputs) en el esquema correcto.
**Galapavet no tiene ninguno de los tres** (`index.html:1-38`), lo que es una laguna
independiente de la capa de estilos.

### 4.3 Cómo se prueba (4 técnicas)

1. **Aserción sobre el DOM real:** `theme.test.tsx:68-75,140-188` y
   `ThemeToggle.test.tsx:141-205` — `expect(document.documentElement.dataset.theme).toBe('dark')`.
   jsdom sí soporta `dataset`.
2. **Función pura, tabla de casos:** `theme.test.tsx:201-221` — los 5 casos de
   `initialThemeAttribute` (guardado dark/light, sin clave + sistema oscuro/claro,
   valor inválido).
3. **Aserción de ORDEN sobre el HTML crudo:** `theme.test.tsx:222-230`:
   ```js
   const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8')
   const inlineIdx = html.indexOf('documentElement.dataset.theme')
   const moduleIdx = html.indexOf('type="module"')
   expect(inlineIdx).toBeLessThan(moduleIdx)
   ```
   Prueba la propiedad "corre antes del bundle" **sin navegador**, comparando
   posiciones de cadena. Técnica excelente y portable.
4. **Aserción sobre el texto del SCSS:** `tokens.test.ts:22-30` — trocea
   `_tokens.scss` en bloque claro y bloque oscuro y comprueba el valor de
   `--color-primary` en cada uno.
5. **Fallo controlado:** `theme.test.tsx:191-199` — mock de
   `Storage.prototype.setItem` que lanza; el tema se aplica igual.
6. **Higiene:** `Header.test.tsx:28`, `HeaderNav.test.tsx:19`, `ThemeToggle.test.tsx:45`,
   `theme.test.tsx:46` hacen `delete document.documentElement.dataset.theme` en el
   `beforeEach`/`afterEach`, porque el `<html>` es estado global compartido entre tests.

### 4.4 Compatibilidad con el `[data-variante]` de Galapavet — pieza a pieza

| Pieza de WebEmpresa | Equivalente en Galapavet | ¿Compatible? |
| --- | --- | --- |
| `:root { … }` (claro por defecto) + `:root[data-theme='dark'] { … }` (`_tokens.scss:16,88`) | 4 bloques **todos** con atributo: `:root[data-variante='marca'\|'lima'\|'verde'\|'noche']` (`src/styles/_tokens.scss:40,47,54,60`) | **Sí, con un matiz.** Galapavet no tiene bloque `:root` desnudo: **si el atributo faltara, no habría ningún color**. Hoy está cubierto porque el script inline **siempre** escribe el atributo (`index.html:30`, con caída a `'marca'`). Es más estricto y más frágil a la vez; funciona, pero conviene saberlo. |
| Atributo sobre `document.documentElement` | Idéntico: `SelectorPaleta.tsx:22` → `document.documentElement.setAttribute('data-variante', activa)` | **Sí, idéntico.** |
| Script inline síncrono en `<head>` antes del módulo | Idéntico: `index.html:8-32`, IIFE nombrada `aplicarVarianteAntesDelPintado`, `try/catch`, caída a `'marca'` | **Sí, idéntico** — y Galapavet lo hace algo mejor: valida contra un catálogo (`IDS_DEL_CATALOGO`, `index.html:19`) en lugar de contra dos literales. |
| Espejo puro testeable (`theme.ts:83-88`) | Idéntico: `resolverVarianteInicial` en `src/components/SelectorPaleta-logica.ts`, y el comentario de `index.html:12-16` lo declara "ESPEJO LITERAL" | **Sí, idéntico.** |
| Test de orden inline-antes-del-módulo | Ya existe: `SelectorPaleta-logica.test.ts:55-61` (busca el script que contiene `data-variante` y comprueba que va antes, "sin defer/async/src") | **Sí, y más completo.** |
| Tokens de tema consumidos con `var(--…)` desde los módulos | Idéntico, y con puerta automática de contraste (`src/lib/diseno/tokensColor.ts:17,35`, que parsea `:root[data-variante='X']` con regex) | **Sí.** |
| 2 temas | 4 variantes | **Sí, el mecanismo no depende del número.** El único punto donde el número importa es que la matriz de contraste de Galapavet tiene 4 filas en vez de 2. |
| `<meta name="theme-color" media>` × 2 + `color-scheme` | **Ausentes** en `index.html` de Galapavet | **Laguna a cubrir**, no incompatibilidad. Con 4 variantes hará falta escribir `theme-color` desde JS al cambiar de variante, no por `media` (**NO VERIFICADO**: no hay decisión tomada al respecto en `project-spec.md`). |
| `body { transition: background-color .2s, color .2s }` (`_base.scss:10-12`) | **No portable tal cual** | **INCOMPATIBLE.** Una `transition` fuera de un bloque `prefers-reduced-motion` viola la Decisión 31 y **sí la caza** la puerta @s33 (`movimientoRespetuoso.ts` vigila `transition:` a inicio de línea). Debe ir dentro de `@media (prefers-reduced-motion: no-preference)` y con la escala de 150 ms de Galapavet, no 200 ms. |

**Veredicto:** el mecanismo de conmutación es **compatible pieza a pieza**, y de
hecho Galapavet ya lo tiene implementado igual o mejor. Lo que falta no es el
mecanismo: es **la capa global que consume los tokens** (§1.4) y los metadatos del
`<head>`.

---

## 5 · Cómo se prueban los estilos: el catálogo de técnicas de la casa

Búsqueda exhaustiva en `src/**/*.test.*` de `readFileSync`, `getComputedStyle`,
`styleSheets`, `.scss` y `@font-face`.

**Hallazgo capital: `getComputedStyle` NO aparece ni una vez en todo el repo.**
Tampoco `styleSheets`, ni `@font-face` en ningún test. `vitest.config.ts:10` fija
`css: false` — Vitest **no procesa CSS en absoluto**, así que los CSS Modules
devuelven un proxy y no hay hojas de estilo en jsdom. Toda la verificación de estilo
es **estática, sobre el texto fuente**.

La doctrina está escrita en los propios tests, tres veces con las mismas palabras:

- `tokens.test.ts:5-7`: *"jsdom no resuelve custom properties de hojas de estilo con
  getComputedStyle, así que verificamos el contrato de tokens directamente sobre la
  fuente SCSS (mismo patrón que Header.test @s4)"*.
- `logo-draw.test.ts:6-8`: *"jsdom no interpola @keyframes ni aplica CSS externo, así
  que el contrato testeable del CSS es su CONTENIDO"*.
- `Servicios.reveal.test.tsx:8-10`: *"jsdom no interpola `transition` ni conoce el
  layout, así que el contrato testeable del CSS es su CONTENIDO"*.
- `Header.test.tsx:70`: *"jsdom no hace layout; verificamos la propiedad de estilo de
  forma robusta"*.
- `Hero.test.tsx:34`: *"jsdom no hace layout: verificamos la propiedad sobre el
  .module.scss (patrón sticky)"*.

### T1 · Leer el `.scss` y aseverar una propiedad con regex

La técnica base. `readFileSync(resolve(process.cwd(), '<ruta>.scss'), 'utf8')` +
`expect(scss).toMatch(/…/)`.

- `Header.test.tsx:64-74` (@s3): `position: sticky` y `top: 0`.
- `tokens.test.ts:8,23-29`: valores de `--color-primary` por bloque de tema.
- `logo-draw.test.ts:25-173`: 11 escenarios completos sobre `_logo-draw.scss`.

**Funciona sin navegador. Portable a Galapavet tal cual** — de hecho Galapavet ya usa
una variante superior (ver §5.T7).

### T2 · Acotar la búsqueda al bloque correcto (evitar el falso positivo)

Aseverar `/overflow: hidden/` sobre el fichero entero probaría poco: la propiedad
podría estar en cualquier regla. Dos refinamientos:

- **Regex acotada a la regla:** `Hero.test.tsx:36-38` —
  `expect(scss).toMatch(/\.hero\s*\{[^}]*overflow:\s*hidden[^}]*\}/)` con el
  comentario *"El overflow:hidden debe vivir DENTRO de la regla del .hero, no en otra
  cualquiera"*. La clase `[^}]*` no cruza el cierre de bloque.
- **Extractor de bloque con llaves balanceadas:** `Servicios.reveal.test.tsx:21-34`,
  función `block(scss, headerRe)` que cuenta profundidad de `{`/`}` para devolver el
  cuerpo de un `@media` anidado. Necesario porque un `@media` **sí** contiene llaves
  internas y `[^}]*` fallaría.

### T3 · Aseverar una RELACIÓN entre dos ficheros, no un valor

`MobileMenu.test.tsx:8-13,66-79` — helper `zIndexOf(scssPath, selector)` que extrae
el número, y luego:

```js
expect(headerZ).toBe(50)
expect(overlayZ).toBeGreaterThan(headerZ)
expect(panelZ).toBeGreaterThan(headerZ)
```

Prueba el **invariante de apilado** ("el drawer va sobre la cabecera"), no los
números. Si mañana la cabecera sube a 60, el test sigue siendo correcto y sigue
protegiendo. **La mejor técnica del repo**, y la más transferible.

### T4 · Aseverar la AUSENCIA (prohibiciones)

- `logo-draw.test.ts:154-155` (@s17): el parcial no declara tokens nuevos
  (`not.toMatch(/--color-[\w-]+\s*:/)`) ni hex (`not.toMatch(/#[0-9a-fA-F]{3,6}/)`).
  **Es la "checklist de fidelidad §8: 0 hex en componentes"
  (`DESIGN_SYSTEM.md:226`) convertida en test.**
- `logo-draw.test.ts:132-136` (@s14): filtra las líneas `@keyframes` y asevera que en
  el CSS **base** no aparece `stroke-dashoffset: 300` — prueba el invariante
  "el estado oculto nunca se hornea en base".
- `Servicios.reveal.test.tsx:100-120,123-131` (@s7): función `stripNoPreference()`
  que **borra** todos los bloques `no-preference` y asevera sobre lo que queda:
  `not.toMatch(/opacity:\s*0\s*;/)`, `not.toMatch(/translateX\(/)`. Es decir: prueba
  qué se ve **con `prefers-reduced-motion: reduce`** sin poder evaluar el media query.
  **Técnica brillante y directamente aplicable al Invariante 4 de Galapavet.**
- `Servicios.reveal.test.tsx:157-160` (@s9): las transiciones no mencionan ninguna
  propiedad de reflow (previo `replace(/cubic-bezier\([^)]*\)/g, '')` para que los
  números del easing no confundan al parser).
- `Servicios.reveal.test.tsx:203-205` (@s11): `not.toMatch(/data-dir/)` en el SCSS
  **y** en el `.tsx` — prohíbe una implementación alternativa peor.

### T5 · Aseverar el ORDEN dentro de un fichero (posiciones de cadena)

`theme.test.tsx:222-230` — `indexOf` de dos marcadores en `index.html` y
`expect(a).toBeLessThan(b)`. Prueba "el script anti-FOUC corre antes del bundle".
Ver §4.3.3.

### T6 · Aseverar el ENGANCHE (que el parcial esté importado)

`logo-draw.test.ts:40` —
`expect(read('src/styles/main.scss')).toMatch(/@use\s+['"]logo-draw['"]/)`.

**Este es el test que Galapavet no tiene y que habría detectado el fallo de raíz.**
Su equivalente sería una puerta que asevere:
`src/main.tsx` contiene `import './styles/main.scss'` **y** `src/styles/main.scss`
contiene `@use 'tokens'`, `@use 'reset'`, `@use 'base'`.

### T7 · Sincronía CSS ↔ JS de un mismo valor

`HeaderNav.test.tsx:76-84` (@s4): asevera
`/@media \(max-width: 767px\)[\s\S]*\.nav\s*\{[\s\S]*display:\s*none/` en el SCSS,
y el comentario obliga a que sea *"el mismo breakpoint que MOBILE_QUERY en
src/lib/useIsMobile.ts"*. **NO VERIFICADO / hueco real:** el test asevera el valor
en el SCSS, pero **no compara** contra el valor de `useIsMobile.ts`; si alguien
cambiara solo el TS, el test seguiría verde. Un test superior importaría
`MOBILE_QUERY` y construiría la regex con él.

### T8 · Aseverar estructura del DOM en vez de nombres de clase

`Header.test.tsx:42-52` — `getByRole('banner').firstElementChild` con 2 hijos, sin
tocar el nombre de clase hasheado. Compatible con la regla de Galapavet
(`vite.config.ts:47-48`: *"el contrato de este repo prohíbe aseverar sobre clases
CSS"*). Nótese que `Header.test.tsx:44` sí hace
`expect(header.className).toContain('header')`, que es la versión laxa que Galapavet
no permitiría.

### T9 · Lo que WebEmpresa NO cubre y Galapavet SÍ

- **No hay ninguna verificación de contraste calculado.** Los ratios se comprueban a
  ojo contra la tabla del design system (`judge_marca.md:73-75`). Galapavet tiene
  `src/lib/contraste.ts` + `src/lib/diseno/tokensColor.ts` con matriz de uso: es
  **estrictamente superior**, no se toca.
- **No hay verificación de que toda `transition`/`animation` esté gateada.**
  Galapavet tiene `movimientoRespetuoso.ts` / @s33.
- **No hay inventario de módulos de estilo.** Galapavet tiene
  `src/lib/diseno/inventarioModulos.ts`.
- **No se lee el CSS con `?raw`.** WebEmpresa usa `readFileSync` de Node contra
  `process.cwd()`. Galapavet usa `import.meta.glob(..., { query: '?raw' })` con un
  `css.include: [/\?raw/]` en `vite.config.ts:65` calibrado para no romper jsdom.
  **La solución de Galapavet es mejor** (resiste cambios de cwd, y el comentario de
  `vite.config.ts:46-64` documenta por qué la alternativa rompe `getByRole`). No se
  porta `readFileSync`.

### Resumen de §5

| Técnica | ¿Sin navegador? | ¿Portar a Galapavet? |
| --- | --- | --- |
| T1 leer `.scss` + regex de propiedad | Sí | Sí, con `?raw` (mecanismo Galapavet) |
| T2 acotar al bloque (`[^}]*` / llaves balanceadas) | Sí | **Sí, imprescindible** |
| T3 relación entre valores de dos ficheros (`z-index`) | Sí | **Sí, la mejor** |
| T4 aserción de ausencia / prohibición | Sí | **Sí**, encaja con las puertas actuales |
| T4b `stripNoPreference` (simular `reduce`) | Sí | **Sí**, para el Invariante 4 |
| T5 orden por `indexOf` en el HTML | Sí | Ya existe en Galapavet |
| T6 aseverar el enganche del parcial | Sí | **Sí — es EL test que falta** |
| T7 sincronía CSS↔JS | Sí | Sí, mejorado (importar la constante) |
| T8 estructura del DOM sin clases | Sí | Ya es la regla en Galapavet |
| `getComputedStyle` | — | **No existe en el repo** |
| Navegador real | No | Ya previsto en Galapavet (Decisión 11) para @s19/@s34 |

---

## 6 · Qué es `design/fundamentos/`

**Es un SCAFFOLD DE ENTREGA, no la fuente de verdad — y está DESACTUALIZADO.**

### 6.1 Qué contiene

```
design/fundamentos/main.tsx                 (13 l., idéntico a src/main.tsx)
design/fundamentos/styles/_tokens.scss      (~118 l.)
design/fundamentos/styles/_base.scss        (~68 l.)
design/fundamentos/components/Logo.tsx
design/fundamentos/components/Logo.module.scss
```

Solo **5 ficheros**. No hay `_reset.scss`, no hay `main.scss`, no hay `_logo-draw.scss`,
no hay ningún `.module.scss` de sección.

### 6.2 Qué es

`design/HANDOFF.md:19-42` lo dice sin ambigüedad: es el **paquete de entrega del
diseño** ("Copia cada archivo a la **misma ruta** en `WebEmpresa`"), con una tabla que
marca cada fichero como `← REEMPLAZA` o `← NUEVO`. `HANDOFF.md:1-6` lo enmarca:
*"Este paquete lleva el diseño definitivo … al repo `WebEmpresa` con fidelidad 1:1"*.

Es decir: `design/fundamentos/` es **la instantánea de lo que Claude Design entregó**,
conservada en el repo como referencia histórica. `docs/DESIGN_SYSTEM.md:16-18` señala
la fuente de verdad viva: *"Los tokens viven en `src/styles/_tokens.scss`"*.

Y el `judge` lo trató como tal en su momento: `judge_marca.md:79-81` —
*"Fidelidad 1:1 con el diseño aprobado: diff de los 5 ficheros portados … contra
design/fundamentos/ → IDÉNTICOS"*. Eran idénticos **entonces**; hoy ya no.

### 6.3 En qué difiere hoy de `src/styles/` (diff verificado)

**`_tokens.scss` — 3 diferencias, todas mejoras de `src/`:**

| `design/fundamentos/` | `src/styles/` | Comentario |
| --- | --- | --- |
| `--gutter: 26px` / `--section-y: 84px` (fijos) | `--gutter: clamp(18px, 5vw, 26px)` / `--section-y: clamp(56px, 9vw, 84px)` (`:26-27`) | La **fluidez del espaciado se añadió después**, con el comentario `:23-25` que la justifica. Es la mitad de la razón de que haya tan pocos media queries. |
| — | `--color-danger` / `--color-success` en claro (`:70-71`) y oscuro (`:120-122`) | Añadidos por la feature del formulario de contacto. |
| Alias deprecados presentes (`:73-75`) | Alias deprecados presentes (`:80-82`) | La deuda **sí** se copió, en ambos. Ver §7. |

**`_base.scss` — 2 diferencias, ambas correcciones de `src/`:**

| `design/fundamentos/` | `src/styles/` | Comentario |
| --- | --- | --- |
| `main { max-width: var(--maxw); margin: 0 auto; padding: 2rem var(--gutter) 4rem }` | `main { display: block }` + el comentario de 5 líneas (`:24-31`) | **La corrección más importante del repo.** Ver §1.4.1. El handoff traía el bug del doble gutter / bandas recortadas. |
| `.prose { max-width: 70ch }` | `.prose { max-width: 72ch; margin: 0 auto; padding: 3.5rem var(--gutter) 5rem }` (`:62-66`) | Al quitar el padding de `main`, `.prose` tuvo que asumir el gutter y el centrado. Corrección **consecuencia** de la anterior. |

### 6.4 Veredicto para Galapavet

**No mirar `design/fundamentos/` como modelo.** Contiene la versión anterior al
aprendizaje. La fuente de verdad estructural es `src/styles/`, y la razón está escrita
en el comentario que `src/` añadió y `design/` no tiene.

---

## 7 · Deuda declarada — lo que NO hay que portar

### 7.1 Los alias deprecados (deuda declarada por el propio repo)

`src/styles/_tokens.scss:76-82`, literal:

```scss
/* ---- Alias heredados (DEPRECADOS) ------------------------------------
   Se mantienen solo para no romper el scaffold previo (Logo antiguo,
   home.module.scss placeholder). No usar en código nuevo; migrar a los
   tokens de arriba y eliminar cuando ya no queden referencias. */
--color-soft: var(--color-secondary);
--color-brand: var(--color-primary);
--color-brand-mint: var(--color-secondary);
```

Son **tres**: `--color-soft`, `--color-brand`, `--color-brand-mint`. Corroborado en
`HANDOFF.md:57-59` y `DESIGN_SYSTEM.md:107`.

**Verificación adicional: están MUERTOS.** Búsqueda de `color-soft|color-brand` en
`src/` y `design/` → **las 6 únicas apariciones son las propias declaraciones** (3 en
`src/styles/_tokens.scss:80-82`, 3 en `design/fundamentos/styles/_tokens.scss:73-75`).
Ni un solo consumidor. Los ficheros que los justificaban (`home.module.scss`,
`ContactDialog.module.scss`, citados en `judge_marca.md:118-121`) **ya no existen** en
el repo. Es deuda pura, sin excusa viva.

**→ NO PORTAR.** Galapavet arranca limpio y no tiene ningún "scaffold previo" que
romper. Sus roles de color son `--color-fondo` / `--color-texto` / `--color-foco`, con
la disciplina de matriz de uso (`src/styles/_tokens.scss:20-24`); introducir alias
sería crear la deuda desde el minuto cero.

### 7.2 Deuda declarada por el `judge`

- **Scrim literal duplicado.** `judge_nav.md:77-83`: *"`MobileMenu.module.scss:18`
  usa un scrim literal `rgba(7, 33, 31, 0.55)` … Recomiendo, en una limpieza futura,
  extraer un token `--color-scrim`"*. Verificado que **sigue ahí**, hoy en
  `MobileMenu.module.scss:21`. Junto con `:38`
  (`box-shadow: -20px 0 60px rgba(0,0,0,0.25)`), son **las 2 únicas apariciones de
  color literal en todos los `.module.scss` del repo** — el resto del sitio cumple
  el "0 hex" de `DESIGN_SYSTEM.md:226`.
  **→ NO PORTAR.** Si Galapavet necesita un velo, que sea un token desde el principio.
- **Hex sueltos en el scaffold.** `judge_marca.md:118-123` señalaba `#fff` en
  `home.module.scss:47`, `ContactDialog.module.scss:4` y `HeaderNav.module.scss:14`.
  Verificado: **ya no existe ninguno** (los dos primeros ficheros desaparecieron; el
  tercero es hoy `.nav a { font-weight: 500 }`). Deuda **saldada**, se menciona solo
  para cerrar el rastro.

### 7.3 Deuda NO declarada que he encontrado (mi aportación)

1. **`_reset.scss` y `_base.scss` se pisan en tres propiedades.**
   `line-height` (reset `:19` = 1.6; base `:6` = 1.65) y `-webkit-font-smoothing`
   (reset `:20`; base `:7`) se declaran **dos veces sobre `body`**. Gana `_base` por
   orden en `main.scss`, así que el 1.6 del reset es **código muerto que confunde**.
   **→ NO PORTAR la duplicación:** una sola declaración por propiedad, y el
   `line-height` de lectura en `_base`.
2. **Radios mágicos fuera de la escala.** `ThemeToggle.module.scss:9`
   (`border-radius: 10px`) y `Contacto.module.scss:109` (`border-radius: 11px`),
   habiendo `--radius-sm: 12px`. `DESIGN_SYSTEM.md:151` normaliza la desviación
   escribiendo *"(11–12px)"* en la tabla de tokens, que es peor que la propia
   desviación: legitima el drift en el documento normativo.
   **→ NO PORTAR.** En Galapavet el radio sale de la escala, sin excepciones.
3. **`:focus-visible` duplicado.** `ThemeToggle.module.scss:18-21` repite palabra por
   palabra el `_base.scss:42-45` global. Inofensivo pero es ruido que invita a
   copiar-pegar el anillo de foco en cada componente nuevo — justo lo contrario de
   tener un anillo global.
   **→ NO PORTAR** (sí portar la regla global; sí portar el ajuste **con propósito**
   de `Contacto.module.scss:120-123`, que cambia el `offset` a 1px).
4. **`ul { list-style: none }` global sin restaurar en `.prose`.**
   `_reset.scss:35-38` mata las viñetas en todo el sitio, incluida la prosa legal,
   y no hay regla que las reponga. Hoy no se nota porque `aviso-legal.tsx:14-19` solo
   tiene un `<h1>` y un `<p>` "pendiente de completar". El día que ese texto llegue,
   las listas saldrán sin viñetas.
   **→ Portar el reset, PERO añadiendo la restauración en `.prose`** (Galapavet sí
   tendrá prosa real: blog, aviso legal, política).
5. **`h4`-`h6` sin estilo.** `_base.scss:15-22` cubre `h1,h2,h3`. Un `h4` caería a la
   fuente y el peso del UA — el mismo síntoma que hoy tiene Galapavet en todo el body.
   **NO VERIFICADO** si es deliberado (no hay `h4` en el sitio) o un descuido.
   **→ Cubrir `h1..h6`** en Galapavet, que tendrá blog con jerarquía profunda.
6. **`input`/`select`/`textarea` fuera del reset.** `_reset.scss:30-33` solo hace
   `font: inherit` en `button`; `Contacto.module.scss:110,166` tiene que repetirlo en
   `.input` y `.submit`. **→ Incluir los cuatro** (`button, input, select, textarea`)
   en el reset de Galapavet y ahorrarse la repetición.
7. **`body { transition: … }` sin guarda de movimiento** (`_base.scss:10-12`).
   Ver §4.4, última fila. **INCOMPATIBLE con la Decisión 31**; se porta la idea (el
   cambio de paleta no debe ser un salto brusco) dentro de `no-preference` y con
   150 ms.
8. **`scroll-behavior: smooth` sin guarda** (`_reset.scss:14`). Ver §1.3.1.
   **La incompatibilidad más importante del documento.**
9. **`HeaderNav.test.tsx` no ata realmente CSS y JS.** Ver §5.T7.
   **→ Portar la técnica mejorada**, importando la constante.
10. **El `judge` cita ficheros que ya no existen** (`judge_marca.md:118-121`). No es
    deuda de código, pero avisa de que las notas de `progress/` de un repo de
    referencia **caducan**: siempre verificar contra el código actual, que es lo que
    se ha hecho aquí.

---

## 8 · Plan de adaptación (síntesis operativa, sin ejecutar)

Orden sugerido, de la causa raíz hacia afuera. **No es una instrucción de
implementación**: es el resumen de lo que este estudio concluye que hay que crear.

1. **Fuentes.** Elegir familias para Galapavet y añadir las dependencias
   `@fontsource/*`, con los pesos que el diseño realmente use (WebEmpresa carga 4 por
   familia). Importarlas en `src/main.tsx` **antes** de la hoja global.
   **NO VERIFICADO**: qué familias quiere Galapavet — no aparecen en su
   `_tokens.scss` actual, que no declara ningún `--font-*`.
2. **`src/styles/_tokens.scss`**: añadir los roles que la capa global va a consumir.
   Hoy Galapavet tiene 3 (`--color-fondo`, `--color-texto`, `--color-foco`) × 4
   variantes; la capa global necesitará al menos familia tipográfica y, en cuanto
   haya tarjetas y bandas, superficie/borde. Cada rol nuevo pasa por la matriz de uso
   y la verificación de contraste ya existentes — **esa disciplina no se toca**.
3. **`src/styles/_reset.scss`** — portar `_reset.scss` de WebEmpresa **con las 3
   correcciones**: `scroll-behavior` dentro de `no-preference` (§1.3.1); `font:
   inherit` extendido a `input, select, textarea`; sin duplicar `line-height` ni
   `-webkit-font-smoothing` con `_base`.
4. **`src/styles/_base.scss`** — portar con las correcciones de §7.3: `h1..h6`,
   `transition` del body dentro de `no-preference` a 150 ms, viñetas restauradas en
   `.prose`, `main { display: block }` **con su comentario** (nunca la versión de
   `design/fundamentos/`).
5. **`src/styles/main.scss`** — el barril de 3-4 líneas.
6. **`src/main.tsx`** — la línea `import './styles/main.scss'`.
7. **El contrato `.inner`** (§2) en cada `.module.scss` de sección de Galapavet, que
   ya existen los 17 ficheros pero (según el diagnóstico de partida) sin este patrón.
8. **Los tests**: T6 (enganche) primero — es el que cierra la causa raíz; luego T1/T2
   sobre la existencia de `font-family` y de reglas para `html`/`body`; T3 para
   relaciones de apilado; T4b para el Invariante 4.

---

## 9 · Lagunas declaradas (NO VERIFICADO)

1. **`github.md`**: no existe en el clon de WebEmpresa. Su papel lo cumplen
   `design/HANDOFF.md` y `docs/DESIGN_SYSTEM.md`. El zip
   `Implementar diseño system en Github- Listo.zip` (raíz del repo, 2,4 MB) no se
   abrió por la regla de solo lectura; podría contenerlo.
2. **`ServiceMockup.module.scss` (545 líneas, el 28% del SCSS del repo)** solo se
   revisó en su bloque `prefers-reduced-motion` (`:530-545`). Es el mockup ilustrado
   de cada servicio (una maqueta dibujada en CSS); **NO VERIFICADO** si contiene
   patrones reutilizables. No estaba en el encargo y no parece transferible a
   Galapavet.
3. **`Sectores.module.scss`** se leyó solo en `:1-20` (sección + `.inner` + eyebrow),
   suficiente para el contrato de contenedor. Sus 112 líneas restantes: **NO VERIFICADO**.
4. **`design/system/`** (56 ficheros: `tokens/*.css`, `guidelines/*.html`,
   `components/**`, `SKILL.md`) no se analizó: es el paquete de Claude Design, no la
   arquitectura del repo. Contiene `styles.css` y `tokens/{colors,fonts,spacing,
   typography}.css` que podrían ser una tercera copia de los tokens. **NO VERIFICADO.**
5. **No se ejecutó nada** (`pnpm test`, `pnpm build`): las afirmaciones sobre los
   tests son lecturas de su código fuente, no de su resultado de ejecución.
6. **`theme-color` con 4 variantes** en Galapavet: no hay decisión tomada en su
   `project-spec.md`. **NO VERIFICADO.**
7. **`h4`-`h6` sin estilo en `_base.scss`**: no se pudo determinar si es deliberado.
