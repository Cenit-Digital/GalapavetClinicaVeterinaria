# Restricciones que la memoria organizacional impone a la identidad visual de Galapavet

> **Fecha del análisis:** 23/08/2026
> **Fuente:** `.memoria-cache/patterns/` (21 patrones, 6 categorías) sincronizada por
> `scripts/sync-memoria.ps1` (paso 2bis del Protocolo de arranque, `CLAUDE.md`).
> **Alcance:** SOLO LECTURA. No se ha modificado nada en Galapavet ni en los clones de
> referencia. Todo lo afirmado se cita con `fichero:línea`; lo que no se ha podido
> comprobar se marca **NO VERIFICADO**.
> **Objeto:** feature 21 `sistema_de_diseno_visual` (`feature_list.json:312-327`,
> `status: "in_progress"`) y la reparación de la causa raíz documentada en
> `progress/arquitectura_organizacional_scss.md`.

---

## 0. Estado de la caché: fresca en el disco, quieta en el contenido

| Señal | Valor medido | Lectura |
| --- | --- | --- |
| Fecha de los ficheros de `.memoria-cache/` | **23/08/2026 00:32** (todos, idéntica) | El clon es de **hoy**. `scripts/sync-memoria.ps1:33` hace `Remove-Item` + `git clone --depth 1`, así que el mtime uniforme ES la fecha de sincronización. |
| Nº de patrones | **21** | Coincide con lo que el script reporta (`sync-memoria.ps1:53-56`). |
| Fecha `Origen` más reciente entre los 21 | **2026-07-25** (`tooling/valor-guardado-por-puerta-que-lee-config-como-texto-debe-ser-literal.md`) | La memoria **no ha destilado nada en ~4 semanas**. |
| `Validado en:` | 15 × NailsLashStudioWeb · 3 × WebEmpresa · 3 × ambos | **0 patrones validados en Galapavet.** |
| Menciones de «Galapavet» en los 21 patrones | **0** (`grep -rli galapavet .memoria-cache/patterns` → vacío) | Ninguna lección de este proyecto ha vuelto todavía al tercer bucle. |
| Fecha de sincronización explícita en `.memoria-cache/README.md` | **no existe** | El README es la cara humana del repo de memoria; no lleva marca de tiempo. La única señal de frescura es el mtime. |

**Veredicto:** la caché **sí está al día** (clonada hoy). Lo que está viejo es el
**contenido**: no hay ningún patrón fusionado desde el 25/07/2026, y el `.git` que
permitiría datar el último commit lo borra el propio script (`sync-memoria.ps1:51`), así
que **NO VERIFICADO**: si esa quietud es «no hubo nada que destilar» (guarda 2) o «hay un
PR sin revisar» (guarda 1, `.memoria-cache/README.md` § Cadencia y guardas). Consecuencia
práctica: **la memoria no contiene todavía ningún patrón sobre la capa global de estilos**,
que es justo el hueco de Galapavet. Hay que diseñarlo con los principios de los patrones
existentes, no esperar una regla hecha.

---

## 1. Los patrones que ATAN esta feature

Ocho de los 21. Para cada uno: la regla, su límite, y **qué obliga o prohíbe en concreto**.

### 1.1 `tokens/contraste-de-tokens-verificado-por-matriz-de-uso.md` — ATA, y es el más duro

**Regla (1 línea):** el contraste se verifica recorriendo una **matriz de uso declarada**
—la lista explícita de pares `(fg, bg, rol, uso)` que la página pinta de verdad— y
**recalculando cada ratio desde el texto real del SCSS de tokens**, alcanzando cada color
**por su token, nunca por su hexadecimal literal**.

**Cuándo NO aplica (literal del patrón):** paletas dinámicas en runtime (tema de usuario,
colores de un CMS); texto sobre imagen de fondo arbitraria; proyectos sin tokens
centralizados; texto grande (3:1 por tamaño), rama que el patrón deja fuera a propósito.

**Sobre el límite «paletas dinámicas»:** el `SelectorPaleta` de Galapavet **no** dispara esa
exención. Las 4 variantes son **estáticas en el SCSS**
(`src/styles/_tokens.scss:39,45,52,59`) y lo dinámico es solo **cuál** se activa vía
`data-variante` (`index.html:30`). El SCSS existe en build → la puerta puede leerlo.

**Qué OBLIGA en Galapavet:**
- Todo rol de color **nuevo** que la capa global introduzca (`--color-superficie`,
  `--color-borde`, `--color-texto-suave`, el fondo de un `.skip-link`…) debe declararse en
  `src/styles/_tokens.scss` **dentro de los cuatro bloques `[data-variante]`**, y su
  contraste verificarse por la vía de `src/lib/diseno/tokensColor.ts:50-58`
  (`leerTokenDeVariante`, que hace `match` sobre el texto crudo del fichero), **no** por un
  hexadecimal escrito a mano.
- La lectura del texto crudo solo funciona por `import.meta.glob(..., { query: '?raw' })`:
  `vite.config.ts:65` ancla `test.css.include` a `/\?raw/` **a propósito**. Cualquier
  puerta nueva sobre la hoja global debe usar esa misma vía, nunca una importación normal.
- Cada par nuevo lleva su campo `uso` y su `rol` (texto 4,5:1 / componente 3:1), como ya
  hace `catalogoDeContraste` (`src/lib/tokens.ts:23-29`).

**Qué PROHÍBE:**
- **Copiar los 20 roles de `WebEmpresa/src/styles/_tokens.scss` con sus valores.** El
  patrón lo dice explícitamente: *«Frente a copiar `_tokens.scss` de WebEmpresa: el
  contrato lo prohíbe explícitamente (T-1); cada proyecto declara su propia matriz porque
  las combinaciones que pinta son suyas»*. La **estructura** de roles se adapta; los verdes
  y limones de Cénit no entran.
- **Declarar un rol nuevo sin fila en la matriz.** Un token que existe y no se verifica es
  el bloqueante de 4,37:1 del botón «Reservar» repitiéndose.

**Deuda propia ya existente que este patrón condena:** `src/lib/tokens.ts:23-29` construye
`catalogoDeContraste` con los **hexadecimales literales** de `coloresDeMarca` (`:8-12`), no
leyendo `_tokens.scss`. Es exactamente el caso que el patrón nombra («con el hex clavado en
la matriz, no se enteraría»): si alguien cambiara `--color-texto` en el SCSS, esa puerta
seguiría verde. La feature nueva **sí** cumple (`src/lib/diseno/tokensColor.ts:1-11` cita el
patrón por nombre). No ampliar la deuda: todo rol nuevo va por `tokensColor.ts`.

---

### 1.2 `testing/verificacion-en-vivo-en-navegador-real-caza-el-verde-que-no-funciona.md` — ATA; es literalmente el mismo defecto

**Regla:** para toda feature cuyo entregable dependa del render (qué fuente PINTA, layout,
reflow, animación), hay una fase de verificación en vivo sobre el `dist/` de producción en
un navegador real, **después** de las puertas unitarias, nunca en su lugar.

**Cuándo NO aplica:** features sin salida visible (lógica pura, puertas de build, JSON-LD);
cuando no hay navegador real disponible (se declara pendiente, no se simula con jsdom);
y **nunca** como excusa para saltarse las puertas unitarias.

**Por qué ata con fuerza excepcional:** el origen del patrón es
**NailsLashStudioWeb/F-07 `hero_marca`**, donde con TODAS las puertas en verde el titular
pintaba en **Times New Roman** porque *«`hero.module.scss` no declaraba `font-family` para
el titular, que heredaba la del cuerpo»*. Galapavet tiene **la misma avería, un nivel más
arriba**: `grep -rn "font-family" src/` da **0 resultados** en todo el proyecto, y
`src/styles/_tokens.scss` no declara ningún token `--font-*`. NailsLash lo cerró con
`src/styles/_tipografia.scss:10-12` (`body { font-family: 'Manrope', system-ui, sans-serif }`),
declarando en su cabecera que *«arregla la deuda de F-07 (el cuerpo caía en la serif por
defecto del UA)»*. **Esa deuda es la de Galapavet hoy, ya diagnosticada y resuelta en la
casa hace un mes.**

**Qué OBLIGA:**
- Servir **`dist/` con `vite preview`**, no el dev server, y medir con Chrome real. El
  contrato ya lo tiene interiorizado: @s12, @s27, @s28, @s29, @s30, @s31, @s32 y @s34 de
  `features/sistema_de_diseno_visual.feature` lo declaran escenario a escenario.
- Aseverar **lo que el render decide**, con la API del navegador:
  `getComputedStyle(document.body).fontFamily`, `document.fonts.check(...)`,
  `getComputedStyle(document.body).margin` (el margen de 8 px del UA),
  `scrollWidth === clientWidth`. **No** leyendo el SCSS.
- **Límite de rol, explícito en el patrón:** *«si la fase en vivo destapa que falta un
  criterio de aceptación, eso es ampliar el contrato → puerta humana … el agente reporta y
  escala; no decide la spec por su cuenta»*. Es exactamente la situación actual (§3.1).

**Qué PROHÍBE:** dar por buena la identidad visual porque los 34 escenarios pasen. Un test
que lee texto SCSS no puede saber qué fuente pinta el `<body>` tras cascada y herencia.

---

### 1.3 `testing/verde-por-vacuidad-en-puerta-de-verificacion.md` — ATA; es la trampa estructural de esta feature

**Regla:** toda puerta que derive un conjunto de trabajo y concluya sobre él lleva una
guarda de no-vacuidad que **falla cerrada**, y **una guarda por cada extractor
independiente**, no una para toda la puerta.

**Cuándo NO aplica:** cuando el conjunto vacío es un estado legítimo («la lista vacía ES el
cerrado»); verificaciones escalares sin conjunto; proyectos sin mutación al 100 %.

**Qué OBLIGA (y Galapavet ya cumple en lo escrito):**
- `src/lib/diseno/inventarioModulos.ts:65-67`, `src/lib/diseno/tokensColor.ts:68-77` y
  `src/lib/puertaLiteralesColor.ts:80` ya tienen su guarda `length === 0` → **correcto**.
- El contrato ya destila la guarda: @s11 (catálogo de variantes vacío) y @s23 (inventario
  vacío) fallan cerradas; @s24 exige *«el número de ficheros inspeccionados es exactamente
  17»*; @s29/@s30/@s33 exigen *«el recuento … es mayor que 0»*.
- **Cualquier puerta nueva sobre la hoja global** (p. ej. «toda regla `transition` del CSS
  emitido vive bajo `prefers-reduced-motion`») necesita **su propia** guarda: extractor que
  deriva 0 reglas ⇒ rojo, no verde.

**Qué PROHÍBE — y aquí está el agujero real:**
- **El conjunto vigilado por las puertas de esta feature es una lista cerrada de 17
  `<X>.module.scss`** (`src/lib/diseno/inventarioModulos.ts:16-31`, @s21). Una hoja
  **global** (`src/styles/main.scss`, `_reset.scss`, `_base.scss`) **no está en ese
  inventario**, así que:
  - **@s24** (ningún literal de color fuera de tokens) **no la inspeccionaría**.
  - **@s33** (toda `animation`/`transition` bajo `prefers-reduced-motion`) **no la
    inspeccionaría** — y `WebEmpresa/src/styles/_base.scss:10-13` declara justamente un
    `transition: background-color .2s, color .2s` en `body` **sin ninguna guarda de
    movimiento** (verificado: `prefers-reduced-motion` solo aparece en
    `WebEmpresa/src/styles/_logo-draw.scss:56` y en su test).
  - No hay **ninguna** puerta que compruebe que la hoja global existe, que está `@use`-ada
    ni que `src/main.tsx` la importa.
  - `src/main.tsx` está fuera de **todas** las mediciones: excluido de cobertura
    (`vite.config.ts:77`) y fuera de la lista `mutate` de Stryker
    (`stryker.config.json:11-13`: solo `src/lib/**/*.ts` y `src/**/*-logica.ts`).

  Resultado: **se puede añadir la hoja global entera y no habrá una sola puerta que rompa
  si mañana alguien borra la línea de `main.tsx`.** Es el «0 fallos sobre 0 elementos» del
  patrón con otro disfraz. **El inventario tiene que crecer para incluir las hojas
  globales, o hay que añadir una puerta hermana que las cubra con su propia guarda.**

---

### 1.4 `arquitectura/logica-pre-pintado-inline-se-espeja-en-gemelo-puro-testeable.md` — ATA; ya aplicado, y la capa global no debe romperlo

**Regla:** la lógica que debe correr inline antes del primer pintado no se testea
directamente: se le pone un **gemelo puro** cubierto al 100 %, el inline se declara espejo
literal, y un **test de integridad ancla el ORDEN** (el inline antes del `type="module"`).

**Cuándo NO aplica:** si el código no tiene que correr antes del primer pintado; si la app
no es SSG/prerender **y el primer pintado ya ocurre tras el bundle** (medir antes de
duplicar); si el gemelo no es trivial; el test de orden es específico de un `index.html`
con bundle en `type="module"`.

**Estado en Galapavet: ya cumplido.** `index.html:8-32` es el script anti-FOUC y su
comentario `:12-16` declara textualmente que es *«un ESPEJO LITERAL, escrito a mano, de
`resolverVarianteInicial` en `src/components/SelectorPaleta-logica.ts`»*, con la caída a
`'marca'` ante id ausente/vacío/desconocido/corrupto. El bundle va después
(`index.html:36`). **Sobre el límite:** Galapavet es CSR puro (`src/main.tsx:22`,
`ReactDOM.createRoot`), pero el destello **sí existe** porque el atributo se pinta antes del
bundle; el patrón se justifica igual y ya está aplicado.

**Qué OBLIGA a la capa global:**
- Cualquier decisión que la identidad visual necesite **antes del primer pintado** (un
  `color-scheme` derivado de la variante, una clase de «fuente cargada») entra por esta
  misma disciplina: gemelo puro + espejo literal + test de orden. **No** se añade una
  segunda pasada de lógica inline sin gemelo.
- La hoja global **no puede** ser el sitio donde se decida la variante: eso lo decide
  `index.html:30` y `_tokens.scss` solo **consume** el atributo — así lo declara la propia
  cabecera del fichero (`src/styles/_tokens.scss:5-7`: *«este fichero CONSUME ese mecanismo,
  no lo reimplementa»*).

**Qué PROHÍBE:** mover el `<link>`/import de la hoja global por delante del inline, o
introducir una hoja que pinte antes de que `data-variante` esté puesto — devolvería el FOUC
que @s9/@s10 de `selector_paleta` ya cerraron.

**Riesgo colateral medido, NO cubierto por ningún patrón de la memoria:**
`src/styles/_tokens.scss` declara los colores **únicamente** bajo
`:root[data-variante='…']` (`:39,:45,:52,:59`) — **no existe ningún bloque `:root` desnudo**
(son las 4 únicas apariciones de `:root` en el fichero). Si el atributo no llega a ponerse
(JS deshabilitado, el `<script>` no se ejecuta), **ningún token de color se define** y toda
la hoja global quedaría con `var(--color-fondo)` sin valor. Es el mismo razonamiento del
patrón de animación (§1.5): *el estado base debe ser correcto sin JS*. La capa global
**debe** declarar la variante «marca» también en un `:root` sin atributo, o el `body` sin JS
queda sin colores.

---

### 1.5 `animacion/estado-base-visible-ssg-reduced-motion.md` — ATA parcialmente: por los frentes (2) y (3), no por el (1)

**Regla:** el estado base en CSS es **siempre** el estado final visible; el estado oculto
vive solo dentro del ámbito de la animación (el `0 %` del keyframe, o un selector acotado a
que el hook haya armado en cliente).

**Cuándo NO aplica (literal):** *«Apps 100 % CSR sin prerender (no SSG): el frente (1)
desaparece; sigue valiendo por reduced-motion y robustez, pero deja de ser
imprescindible»*; adornos sin contenido semántico; cuando el oculto ES el estado esperado
(skeleton). **Galapavet es CSR puro** (`src/main.tsx:22`; el propio contrato lo declara en
`features/sistema_de_diseno_visual.feature:105`), así que el frente (1) —HTML prerenderizado
con el estado oculto horneado— **no aplica**. Los frentes (2) `prefers-reduced-motion` y (3)
sin-JS/hidratación pendiente **sí**.

**Qué OBLIGA:**
- Todo `@keyframes` que la maquetación introduzca arranca su estado oculto en el `0 %`; la
  regla base es la visible. Con `animation: none` el contenido se ve entero.
- **Matiz de aplicación que el patrón añade de NailsLash y que aquí muerde:** *«la animación
  va en la hoja, nunca inline (un `animation` inline gana en especificidad al
  `@media(reduce){animation:none}` y derrotaría reduced-motion)»*. Con 17 `.module.scss`
  nuevos, ninguna animación puede acabar en un `style=` del TSX.
- El cierre del patrón: *«no sustituye a gatear la animación en `prefers-reduced-motion`»*.
  @s33/@s34 ya lo exigen, y `src/styles/_tokens.scss:112-115` lo declara regla del proyecto
  (toda `animation`/`transition` **directamente** dentro de su propio `@media`, nunca a
  través de un mixin, *«porque @s33 lee el texto REAL de cada `.module.scss`»*).

**Qué PROHÍBE — con nombre y apellidos:**
- **Copiar `WebEmpresa/src/styles/_reset.scss:12-15` tal cual.** Declara
  `html { scroll-behavior: smooth }` **sin ninguna guarda de `prefers-reduced-motion`**
  (verificado por grep en todo `WebEmpresa/src/styles/`). Rompería el contrato ya cerrado
  de movimiento respetuoso (`src/lib/diseno/movimientoRespetuoso.ts`) y @s34.
- **Copiar `WebEmpresa/src/styles/_base.scss:10-13`** (`transition` de `background-color` y
  `color` en `body`) sin envolverla: misma razón. Y, peor, viviría en una hoja **fuera del
  inventario de @s33** (§1.3), así que entraría **sin que ninguna puerta se entere**.

---

### 1.6 `arquitectura/herencia-del-repo-base-es-deuda-muerta-hasta-que-un-uso-la-justifica.md` — ATA; gobierna todo el trasvase

**Regla:** trata cada artefacto heredado del base como **hipótesis, no como hecho**;
dependencia declarada ⇒ import real o baja; valor heredado (breakpoint, token, umbral) ⇒ se
**re-mide para ESTE proyecto** y el literal correcto se ancla **negando explícitamente el
heredado** (`expect(scss).not.toContain('767px')`).

**Cuándo NO aplica:** herencia que **sí** se usa tal cual y es correcta (el patrón pide
re-verificar, no cambiar por cambiar); infra deliberadamente centralizada
(`harness.config.json`); fuera de un stack con puerta/mutación al 100 %.

**Qué OBLIGA al portar la capa global:**
- Cada valor que venga de WebEmpresa se **re-mide** para Galapavet antes de fijarse:
  `--maxw: 1180px`, `--gutter: clamp(18px,5vw,26px)`, `--section-y`, los 4 radios, el
  `line-height: 1.65`. Ninguno entra «porque venía así».
- Si un valor heredado se descarta, se **ancla el rechazo** con un
  `not.toContain(<valor viejo>)` y el comentario con su procedencia — la forma canónica.
- Los nombres de token de Galapavet van **en español** y ya hay tres fijados
  (`--color-fondo`, `--color-texto`, `--color-foco`): `--font-display`/`--font-sans` de
  WebEmpresa (`_tokens.scss:18-19`) entran, si entran, con nombre propio.

**Qué PROHÍBE, con lo ya medido en el clon:**
- **Los 3 alias deprecados de WebEmpresa**: `--color-soft`, `--color-brand`,
  `--color-brand-mint` (`WebEmpresa/src/styles/_tokens.scss:80-82`, meros
  `var(--color-secondary)`/`var(--color-primary)`). Deuda muerta declarada en el propio
  fichero de origen; copiarlos es el error exacto del patrón.
- **La capa `_demo.scss` de NailsLash** (`NailsLashStudioWeb/src/styles/main.scss:8`,
  `@use 'demo'`): su cabecera (`_demo.scss:1-2`) la rotula *«rama `demo/lunes-prototipo` ·
  NO es una feature del pipeline»*. **Se replica la estructura de 3 capas
  (`tokens`/`reset`/`base`), no la de 4 de NailsLash.**
- **La forma de importar `@fontsource` de WebEmpresa** (§3.3): medida y condenada por el
  propio NailsLash.

---

### 1.7 `arquitectura/logica-de-decision-en-modulo-puro-no-en-el-jsx.md` + `testing/estado-condicional-en-atributo-aria-no-en-clase-css.md` — ATAN la forma de cablear los 17 módulos

**Reglas (1 línea cada una):**
- Toda **decisión o derivación** (qué clase, qué clave, qué subconjunto) se saca del JSX a
  un módulo puro `*-logica.ts` con su test; el `.tsx` solo cablea.
- Todo **estado binario de UI** (abierto/cerrado, seleccionado) vive en un **atributo ARIA
  consultable** (`aria-expanded`, `aria-pressed`), y **el CSS deriva el color desde
  `&[aria-pressed='true']`**, no de un `className` condicional.

**Cuándo NO aplican:** el primero, cuando lo condicional es genuinamente estado de UI en el
DOM (→ va al ARIA) o cuando la extracción crearía una guarda infalible (mutante
equivalente). El segundo, cuando el valor no es estado semántico (→ módulo puro), cuando no
existe un ARIA que corresponda de verdad (**no inventar `aria-*` no estándar** ni `data-*`
disfrazado de ARIA), y fuera de la intersección Stryker + regla anti-`toHaveClass`.

**Por qué atan aquí:** esta feature añade **17 hojas de estilo** y con ellas la tentación de
`className={activo ? estilos.a : estilos.b}` en cada componente. La configuración de
Galapavet lo hace inmatable por construcción: `vite.config.ts:46-48` declara que los CSS
Modules devuelven un proxy y que *«el contrato de este repo prohíbe aseverar sobre clases
CSS»*; `stryker.config.json:3` declara que los `.tsx` no se mutan.

**Qué OBLIGA:** el color de los estados seleccionados/expandidos de la maquetación nueva se
deriva en el SCSS desde el atributo ARIA que el componente **ya** expone
(`&[aria-expanded='true']`, `&[aria-pressed='true']`), reutilizando el estado que ya existe
por accesibilidad.

**Qué PROHÍBE:** introducir un `className` condicional nuevo en cualquiera de los 17
componentes. No se puede matar por mutación ni aseverar por `toHaveClass`, y crearía un
superviviente que bloquearía el cierre (`break: 100`, `stryker.config.json:22`).

---

### 1.8 `testing/informe-de-mutacion-con-timeouts-miente.md` (+ `testing/medicion-de-verificacion-lleva-su-propio-control-y-cuenta-lo-ejecutado.md`) — ATAN la medición de cierre

**Regla:** antes de leer el score se lee la columna `# timeout`; si no es 0, el informe no
vale y se repite a `--concurrency 1`. Nunca dos Stryker a la vez sobre el mismo repo. Se
mide fichero a fichero. Se verifica por sabotaje.

**Cuándo NO aplica:** timeouts legítimos (código que **puede** colgarse: bucles cuya
condición muta, esperas); proyectos sin umbral 100; otros modos de mentira del informe
tienen otra cura.

**Estado en Galapavet: ya interiorizado.** `stryker.config.json:25-26` fija
`"concurrency": 1` citando el patrón por su contenido. **Qué OBLIGA de todas formas:** los
módulos nuevos (`src/lib/diseno/*.ts`) son aritmética pura y transformación de texto — **un
`Timeout` ahí es imposible por construcción**, así que un `# timeout ≠ 0` en el informe de
cierre es señal automática de informe inválido, no de mutante muerto.

**Complemento obligado** (`medicion-de-verificacion…`): toda medición asevera **cuántos
casos ejecutó** (`> 0`) leyéndolo del **informe**, nunca del exit code, y lleva un **control
sin mutante**. La verificación en vivo con Chrome de @s28-@s34 entra de lleno: un script que
mida el `font-family` del `body` y no encuentre elementos debe **parar en rojo**, no
reportar «sin violaciones». El contrato ya lo destila («el recuento … es mayor que 0» en
@s29, @s30, @s33).

---

## 2. Los patrones que NO atan (y por qué), para que la laguna quede documentada

| Patrón | Por qué no ata |
| --- | --- |
| `responsive/red-css-para-rama-solo-js-en-ssg.md` | Su «Cuándo NO aplica» excluye apps 100 % CSR sin prerender. Galapavet es CSR (`src/main.tsx:22`). **El principio residual sí ata** —breakpoint de CSS ≡ breakpoint de JS— y el contrato ya lo cierra en @s25-@s27 contra `PUNTO_DE_CORTE_NAVEGACION_PX` (1024), razonándolo en `features/sistema_de_diseno_visual.feature:103-112`. |
| `tooling/puerta-anti-terceros-prohibe-peticiones-no-cadenas-externas.md` | **Hoy no ata; atará en cuanto entre una fuente web.** Galapavet no tiene ninguna puerta anti-terceros y su `build` es `tsc -b && vite build` (`package.json:13`), sin puerta encadenada. El patrón exige engancharla **solo al build de producción, no a `dev`**, escanear **solo `(html\|css)`** (nunca el bundle JS ni los `.woff2`, que dan U+FFFD), `allowlist: []` en producción, y **comprobar lo positivo**: que los pares de `@font-face` autohospedados esperados están horneados. Si la identidad visual introduce tipografías, pasa de «no ata» a bloqueante. |
| `tooling/valor-guardado-por-puerta-que-lee-config-como-texto-debe-ser-literal.md` | Ata **solo si** se crea una puerta que lea `vite.config.ts` como texto. Hoy no existe. Si se crea (p. ej. para vigilar `additionalData`), el valor vigilado debe ser **literal**, nunca `process.env.X ?? '/'`. Aviso pertinente: Galapavet no declara `base` en `vite.config.ts`; al desplegar en subruta reaparecerá el caso exacto del patrón. |
| `arquitectura/dato-de-negocio-en-fuente-unica-canonica.md` | Es sobre NAP/teléfono/horario y sus `href` derivados; ya cubierto por `src/lib/site.ts` y `src/lib/puertaTelefonoHardcodeado.ts`. Su límite *«datos que NO son un invariante compartido»* no encaja con los tokens visuales. **Su cláusula final sí ata por analogía**: el patrón de contraste lo cita como prerrequisito (*«proyectos sin tokens centralizados … primero hace falta la fuente única»*). Galapavet ya la tiene: `src/styles/_tokens.scss`. |
| `arquitectura/arbitro-unico-para-instancias-que-compiten-por-un-input-global.md` | Su «Cuándo NO aplica» primero: una sola instancia del componente en la página. Galapavet no tiene dos carruseles compitiendo por `window`. |
| `testing/revision-adversarial-del-contrato-antes-de-la-puerta-humana.md` | Corre **entre destilación y puerta humana**; el contrato de la feature 21 ya pasó la puerta humana el 22/08/2026 (`feature_list.json:326`). **Pero su modo de fallo nº 1 —contrato con un criterio de menos— es exactamente lo que se ha destapado**: §3.1. |
| `testing/superviviente-de-mutacion-en-guarda-defensiva-es-hueco-del-contrato.md`, `testing/mutante-equivalente-se-refactoriza-para-proteger-un-throw-real.md`, `testing/mutante-en-deps-vacias-de-useeffect-solo-montaje-es-equivalente.md`, `testing/doble-de-test-anclado-al-literal-no-al-simbolo.md` | Atan la **fase de mutación**, no el diseño visual. Se aplicarán al medir `src/lib/diseno/*`. El de `deps []` de `useEffect` es previsible si algún componente monta un observer para la maquetación. El del doble anclado al literal ya mordió a este repo (`progress/current.md`, galería id 8, `SEPARACION_ENTRE_TARJETAS_PX`). |
| `testing/checkpoint-a-tiempo-no-multiplo-del-ciclo-en-proceso-periodico.md` | Solo aplica a componentes con comportamiento periódico (autoplay). Hoy no hay ninguno declarado. |

---

## 3. CONFLICTOS: dónde los repos de referencia (o el propio contrato) llevan deuda que la memoria ya condena

> La memoria es la destilación validada; un repo concreto puede arrastrar deuda que la
> memoria ya condena. Los cinco primeros están **medidos en los clones**, no supuestos.

### 3.1 CONFLICTO CON EL PROPIO CONTRATO DE GALAPAVET: el contrato tiene un criterio de menos

**Medido:** en `features/sistema_de_diseno_visual.feature` (525 líneas, 34 escenarios),
`grep -n "main\.tsx\|main\.scss\|font-family\|body\|global\|reset"` devuelve **una sola
línea**: la 105, y es una mención de paso a que el proyecto es CSR. **No hay ni un escenario
sobre la hoja global, sobre `body`, sobre `font-family`, ni sobre que `src/main.tsx` importe
nada.** Los 7 criterios de aceptación de `feature_list.json:316-323` tampoco lo mencionan.

Es decir: **los 34 escenarios pueden pasar en verde con el sitio renderizando en Times New
Roman, con el margen de 8 px del navegador y sin fondo** — porque @s21-@s24 solo comprueban
que los 17 `.module.scss` existan, no declaren literales de color y consuman los tokens. Es
la conjunción exacta de tres patrones de la memoria:

- `testing/verde-por-vacuidad-en-puerta-de-verificacion.md` (el conjunto vigilado no incluye
  lo que falla),
- `testing/verificacion-en-vivo-en-navegador-real-caza-el-verde-que-no-funciona.md` (ninguna
  puerta unitaria mira qué fuente PINTA),
- `testing/superviviente-de-mutacion-en-guarda-defensiva-es-hueco-del-contrato.md` y
  `testing/revision-adversarial-del-contrato-antes-de-la-puerta-humana.md` (el remedio a un
  criterio que falta **no** es código silencioso).

**Lo que la memoria manda hacer, literalmente:** *«ampliar el contrato es añadir un criterio
de aceptación → puerta humana»* y *«el agente reporta y escala; no legisla la spec»*.
**La capa global no se puede añadir como refactor callado: exige una ampliación del contrato
aprobada por el humano**, con escenarios propios (existencia de la hoja, `@use` de sus
parciales, import en `src/main.tsx`, `font-family` heredable en `body`, reset del margen del
UA, `:root` sin atributo, y la verificación en vivo del `font-family` computado).

### 3.2 `WebEmpresa/src/styles/_reset.scss:12-15` y `_base.scss:10-13` violan el patrón de animación de la propia memoria

`scroll-behavior: smooth` (`_reset.scss:14`) y `transition: background-color .2s, color .2s`
en `body` (`_base.scss:10-13`) **sin ninguna guarda `prefers-reduced-motion`** — verificado:
en todo `WebEmpresa/src/styles/` esa media query solo aparece en `_logo-draw.scss:56`. El
patrón `animacion/estado-base-visible-ssg-reduced-motion.md`, **cuyo origen es el propio
WebEmpresa**, cierra diciendo: *«no sustituye a gatear la animación en
`prefers-reduced-motion`: seguir respetando la preferencia de movimiento sigue siendo
obligatorio»*. **Portar esos parciales tal cual metería en Galapavet dos infracciones del
contrato de movimiento ya cerrado, en un fichero que además @s33 no inspecciona.**

### 3.3 `WebEmpresa/src/main.tsx:1-8` importa `@fontsource` en la forma que NailsLash midió y condenó

WebEmpresa importa `@fontsource/outfit/400.css` … `/700.css` y `@fontsource/dm-sans/400.css`
… `/700.css` (8 imports). `NailsLashStudioWeb/src/main.tsx:13-16` documenta, **medido**, que
esa es *«la trampa inversa a la que sugiere el nombre»*: `400.css` **trae los 6 subsets**, y
solo `latin-<peso>.css` trae uno; además `@fontsource/<familia>` a secas **no trae todos los
pesos** y los que faltan caen en faux-bold **sin error en consola**. NailsLash lo resolvió
con `latin-400.css`…`latin-700.css` (`main.tsx:36-41`) y lo blindó con @s29.

Como Galapavet necesita **exactamente esas dos familias** (Outfit + DM Sans, según
`progress/arquitectura_organizacional_scss.md` y la Decisión 24 de `project-spec.md`), la
tentación de copiar el bloque de WebEmpresa es máxima.
`herencia-del-repo-base-es-deuda-muerta` lo prohíbe: **la forma correcta ya medida es la de
NailsLash, no la del repo que el `github.md` declara como fuente de `src/styles`.**

### 3.4 `NailsLashStudioWeb/src/styles/main.scss:8` mete una capa de demo en el punto de entrada global

`@use 'demo'`, y `_demo.scss:1-2` se autorrotula *«rama `demo/lunes-prototipo` · NO es una
feature del pipeline»*. Es una capa que entró por fuera del arnés y vive en `main`. La
estructura a replicar es la de **tres** capas de WebEmpresa (`tokens`/`reset`/`base`,
`WebEmpresa/src/styles/main.scss:1-4`), no la de cuatro de NailsLash.

### 3.5 Deuda interna de Galapavet que el patrón de contraste condena

`src/lib/tokens.ts:23-29` ancla su catálogo a hexadecimales literales en vez de leerlos de
`_tokens.scss`. La feature nueva ya hace lo correcto
(`src/lib/diseno/tokensColor.ts:50-58`). **No propagar la forma vieja**: todo rol de color
nuevo entra por `tokensColor.ts`.

### 3.6 Ninguno de los dos repos de referencia es CSR

Ambos son SSG (`vite-react-ssg`: `WebEmpresa/src/main.tsx:9,13`;
`NailsLashStudioWeb/src/main.tsx:1,49`). Galapavet es CSR puro (`src/main.tsx:22`). Eso
**desactiva** el frente (1) de dos patrones (`estado-base-visible…`,
`red-css-para-rama-solo-js-en-ssg`) por su propio «Cuándo NO aplica», pero **también**
significa que cualquier razonamiento de esos repos que dé por hecho el prerender no se puede
trasplantar sin volver a medirlo. En particular, un FOUC en Galapavet es **más** probable,
no menos: el HTML servido no trae ni una regla, así que el primer pintado ocurre sin estilos
hasta que llega el bundle.

---

## 4. Lagunas declaradas (NO VERIFICADO)

1. **Si el repo de memoria tiene un PR sin fusionar** que explique las 4 semanas sin
   patrones nuevos. `sync-memoria.ps1:51` borra el `.git` del clon, así que desde aquí no se
   puede datar el último commit ni consultar PRs.
2. **Si `@fontsource/outfit` / `@fontsource/dm-sans` publican `latin-<peso>.css`** con los
   pesos necesarios y con cobertura de acentos y eñe (§3.3). Hay que medirlo sobre el
   paquete instalado, como hizo NailsLash, antes de fijar nada.
3. **Dónde se despliega Galapavet** y, por tanto, si hará falta `base` en subruta — y con
   ello el patrón `valor-guardado-por-puerta-que-lee-config-como-texto-debe-ser-literal`.
4. **Si `additionalData` (`vite.config.ts:31`) seguirá haciendo falta** una vez exista una
   hoja global, o si duplicará salida CSS. Con Sass moderno un `@use` repetido no debería
   duplicar, pero hay que **medir el tamaño del bundle antes y después**, no suponerlo. (Ya
   declarado como pendiente en `progress/arquitectura_organizacional_scss.md`.)
5. **Las 26 rutas de imagen en 404 / la ausencia de `public/`**: confirmado que no existe
   `public/` en la raíz, pero **ningún patrón de la memoria cubre la gestión de assets
   estáticos**. Es una laguna real de la memoria, no un descuido de este informe.
6. **Si la maquetación nueva introducirá un segundo componente que compita por un input
   global** (dos carruseles, dos captadores de teclado) — determinaría si
   `arbitro-unico-para-instancias-que-compiten-por-un-input-global` pasa a atar.

---

## 5. Resumen operativo: las 6 restricciones no negociables

1. **La capa global exige ampliar el contrato ante el humano.** No hay ni un escenario sobre
   `main.tsx`, la hoja global, `body` ni `font-family` en los 34 aprobados; la memoria
   prohíbe expresamente que el agente legisle la spec.
2. **Todo rol de color nuevo se declara en los 4 bloques `[data-variante]` de
   `_tokens.scss` y se verifica leyendo ese fichero como texto** (`?raw`), por su token,
   nunca por su hex; con `rol` y `uso` en la fila de la matriz. Y hace falta un `:root` sin
   atributo, o sin JS no hay colores.
3. **El inventario de puertas debe crecer para cubrir las hojas globales**, o se añade una
   puerta hermana con su propia guarda de no-vacuidad: hoy `_reset.scss`/`_base.scss`
   quedarían fuera de @s24 y de @s33, y `main.tsx` está fuera de cobertura y de mutación.
4. **Ningún `className` condicional nuevo**: el estado va a un ARIA consultable y el SCSS
   deriva de `&[aria-*='true']`; toda decisión o derivación, a un `*-logica.ts` puro.
5. **Nada del reset/base de WebEmpresa entra sin re-medirse**, y explícitamente **no**
   entran: `scroll-behavior: smooth` sin guarda, el `transition` del `body` sin guarda, los
   3 alias deprecados, la capa `_demo` de NailsLash, ni la forma
   `@fontsource/<familia>/<peso>.css`.
6. **El veredicto final no lo da la suite**: lo da Chrome sobre `vite preview`, midiendo
   `getComputedStyle(document.body).fontFamily`, `document.fonts.check(...)` y el margen del
   `body` — con recuento de elementos medidos `> 0` y un control sin mutante.
