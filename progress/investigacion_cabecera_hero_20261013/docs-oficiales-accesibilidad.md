# docs-oficiales-accesibilidad

## Resumen
Todo lo citado se abrió con WebFetch (las páginas de w3.org, MDN, web.dev, developer.chrome.com y drafts.csswg.org). Lo que solo salió de resúmenes de WebSearch se descartó. Los contenidos de WebFetch los extrae un modelo pequeño, así que las citas son literales cuando van entrecomilladas y paráfrasis cuando no. Tres hallazgos cambian el diseño:
- El SC 1.4.3 no dice qué zona de la imagen se mide. La regla sale de F83 y de G18/G145.
- Ni 2.2.2 ni 2.3.3 obligan a nada para un fundido de entrada de ~1 s al cargar. El `prefers-reduced-motion` aquí es buena práctica y política del propio proyecto, no un requisito WCAG.
- No hay guía oficial específica para una cabecera que pasa de transparente a sólida (punto 8: NO ENCONTRADO).

## 1. SC 1.4.3 Contraste (mínimo) y 1.4.11 Contraste no textual
**Regla 1.4.3.** El texto debe tener 4,5:1, y el texto grande 3:1. «Large scale» significa «at least 18 point or 14 point bold». La propia página lo equivale a «approximately 18.5px and 24px» (1pt = 1,333px). Fuente: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html (Intent, Note y Key Terms).
- 14pt son 18,67px por aritmética, pero la página oficial dice ≈18,5px. Se cita la cifra oficial, no la de 18,66px del encargo.
- «Bold» significa peso computado ≥700 según la regla ACT afw4f7: https://www.w3.org/WAI/standards-guidelines/act/rules/afw4f7/ («at least 14 points and a computed font weight CSS property of 700 or higher»). Un peso 500 o 600 no cuenta como negrita, así que solo el tamaño lo hace grande.

**Qué zona de la imagen se toma.**
- La página Understanding 1.4.3 NO lo especifica. No contiene «gradient», «overlay», «opacity» ni «transparent». Solo dice que el contraste se mide «with respect to the specified background over which the text is rendered in normal usage» (Key Terms, contrast ratio, Nota 3). Nombra F83 como fallo.
- F83 es la regla operativa: https://www.w3.org/WAI/WCAG22/Techniques/failures/F83. Procedimiento: (1) «Quickcheck»: comparar el texto con el área MÁS OSCURA de la imagen si el texto es oscuro, o con la MÁS CLARA si el texto es claro. Si eso cumple, no hay fallo. (2) Si no cumple, comprobar letra a letra el fondo detrás de cada letra.
- Los tests de G18 y G145 miden la luminancia de cada letra y de los píxeles de fondo «immediately next to the letter»: https://www.w3.org/WAI/WCAG22/Techniques/general/G18 y https://www.w3.org/WAI/WCAG22/Techniques/general/G145.
- La ACT afw4f7 comprueba los píxeles alrededor de cada carácter y avisa: «There is no clear method for determining legibility when some but not all pixels have sufficient contrast».

**Regla 1.4.11.** Pide 3:1 «against adjacent color(s)» para los componentes de interfaz y los objetos gráficos. NO regula el texto: «Text within a graphic must meet 1.4.3». Fuente: https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html.
- El indicador de foco debe contrastar 3:1 con el fondo adyacente.
- No se exige un borde visible si hay otra forma de identificar el control.
- La frase «choose the least contrasting area to test» (Testing principles) vale para gráficos y componentes, no para texto.
- La página no menciona «background image»; la regla para fondos de fotografía no está ahí.

**Implicación.** Para blanco sobre foto hay que medir contra el píxel MÁS CLARO que quede tras cada texto (F83). Los textos de este hero tienen requisitos distintos:
- H1: `font-size: clamp(33px, …)` y peso 600 (`src/components/Hero.module.scss:86-87`). Es grande por tamaño (≥24px), así que necesita 3:1.
- Párrafo: 16–19,5px (`Hero.module.scss:96`). Es texto normal y necesita 4,5:1. Hoy usa `--color-sobre-primario` al 90% (`Hero.module.scss:95`).
- Enlaces del nav: peso 500 (`src/components/Cabecera.module.scss:140`). Necesitan 4,5:1 salvo que superen ~24px.
- Si se aclara el velo (`Hero.module.scss:16-21`, tinta al 88/76/92%) para que se vea más la foto, hay que remedir todo.

## 2. Técnicas W3C para texto sobre imagen (todas verificadas con WebFetch)
- **G18** (https://www.w3.org/WAI/WCAG22/Techniques/general/G18): 4,5:1 entre texto y fondo. Para fondos que varían: oscurecer o aclarar el fondo tras las letras, añadir un contorno de ≥1px, o un «halo». El ejemplo es la foto de un campus con la zona tras el texto «fogged white».
- **G145** (https://www.w3.org/WAI/WCAG22/Techniques/general/G145): 3:1 para texto grande. Admite los mismos recursos: fondo sombreado, ajustar el brillo de las letras y halo.
- **G174** (https://www.w3.org/WAI/WCAG22/Techniques/general/G174): un control que cambia a una presentación con contraste suficiente. Es la vía de «versión alternativa» de 1.4.3 y 1.4.11. No sustituye a un hero que ya cumple.
- **G148** (listada en 1.4.3): no especificar colores de texto ni de fondo, y no usar tecnología que cambie esos valores por defecto.
- **F83** (https://www.w3.org/WAI/WCAG22/Techniques/failures/F83): fallo por imágenes de fondo con contraste insuficiente frente al texto.
- **F24** (listada en 1.4.3): fallo por especificar color de texto sin color de fondo.
- **C40** (https://www.w3.org/WAI/WCAG22/Techniques/css/C40): indicador de foco de dos colores. Si ambos colores tienen ≥9:1 entre sí, uno alcanza 3:1 sobre cualquier fondo SÓLIDO. La propia técnica advierte que sobre «Images, gradients, or overlap with other components» pueden hacer falta comprobaciones píxel a píxel.
- La WAI recomienda un fondo semiopaco bajo texto o botones sobre imágenes: «This can be a challenge when text or buttons are positioned on top of images», bajo el encabezado «Contrast» de https://www.w3.org/WAI/tutorials/carousels/styling/.

**Implicación.** Con foto, nav y H1 en blanco, la forma verificable de cumplir es un velo o degradado de fondo mínimo más medición del peor píxel (F83). El anillo de foco necesita un halo o doble tono (C40) y pruebas sobre la imagen real.

**Foco ya medido en el repo.** El anillo global `--color-foco` daba 1,98:1 sobre el velo del hero (`src/styles/global.scss:276-282` y `Hero.module.scss:112-119`). Los enlaces del nav, al pasar a la cabecera transparente sobre la imagen, heredan ese problema. Cualquier solución debe valer también en el estado sólido de la cabecera.

## 3. SC 2.2.2 Pause, Stop, Hide y SC 2.3.3 Animation from Interactions
**2.2.2** (Nivel A, https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html). Aplica al movimiento que (1) «starts automatically», (2) «lasts more than five seconds» y (3) «is presented in parallel with other content».
- El umbral es MÁS DE 5 s. Un fundido de entrada de 1,25 s no cumple la condición (2), así que no necesita mecanismo de pausa.
- La página no trata expresamente una animación corta única al cargar; se deduce de las tres condiciones.
- Técnicas de la página: G4, SCR33, G11, G152, SCR22, G186 y G191. Fallos: F16, F112, F50 y F7.

**2.3.3** (AAA, https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html). El texto es «Motion animation triggered by interaction can be disabled».
- Cubre la animación disparada por una interacción (parallax, elementos que se mueven al hacer scroll).
- Para la animación que inicia la página sin interacción remite a 2.2.2: «2.2.2 Pause, Stop, Hide applies when the web page initiates animation "automatically" that is not in response to an intentional user activation».
- Definición: «addition of steps between conditions to create the illusion of movement or to give a sense of a smooth transition». Y: «Motion animation does not include changes of color, blurring, or opacity» (la página tiene una errata sobre el desenfoque).
- La técnica C39 (https://www.w3.org/WAI/WCAG22/Techniques/css/C39) declara aplicarse a CSS «which causes motion that is triggered by user interactions».

**Implicación.**
- Ninguno de los dos SC obliga a nada para un fundido de entrada de ~1 s sin interacción.
- `fadeInLeft` incluye un desplazamiento horizontal, que sí es «motion animation». Un fundido solo de opacidad no lo es.
- La obligación de respetar `prefers-reduced-motion` viene aquí de la política del proyecto (`src/styles/_api.scss:65-68`; `features/accesibilidad.feature:63-69`), no de un SC.

## 4. `prefers-reduced-motion`
- **MDN** (https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).
  - Valores: `no-preference` («This keyword value evaluates as false») y `reduce`. `@media (prefers-reduced-motion)` equivale a `reduce`.
  - Estado: «Baseline: Widely available… since January 2020».
  - Advierte de que escalar o desplazar objetos grandes puede desencadenar trastornos vestibulares.
  - Su ejemplo sustituye un `pulse` (escala) por un `dissolve` que solo cambia la opacidad. No quita el efecto, lo reemplaza.
- **Media Queries Level 5, §12.1** (https://drafts.csswg.org/mediaqueries-5/#prefers-reduced-motion). Valores `no-preference | reduce`, tipo discreto. `reduce` significa que el usuario prefiere una interfaz que «removes or replaces the types of motion-based animation that either trigger discomfort for those with vestibular motion sensitivity, or distraction for those with attention deficits». La cabecera de la página decía «W3C Working Draft, 8 October 2026». La sección 12.1 no lleva notas ni ejemplos.
- **web.dev** (https://web.dev/articles/prefers-reduced-motion, actualizado el 2019-03-11). Su ejemplo aplica el movimiento solo dentro de `no-preference` y pone `animation: none` en `reduce`. Define `reduce` como «preferably to the point where all non-essential movement is removed» y cita «parallax scrolling, zooming effects». El artículo no fija una regla general.

**Implicación.** La forma segura es declarar `animation` y `@keyframes` SOLO dentro de `@media (prefers-reduced-motion: no-preference)`, con el estado base ya visible. Si el movimiento horizontal se quita bajo `reduce`, puede quedar un fundido de opacidad (MDN: reemplazar) o nada.

**Repo.**
- El proyecto ya prescribe el movimiento como opt-in dentro de `no-preference` (`src/styles/global.scss:316-317`) y que cada `.module.scss` declare `animation`/`transition` directamente dentro de su propio `@media`, no vía mixin (`src/styles/_api.scss:65-68`).
- El override `reduce` global solo fija `animation-duration`, `animation-iteration-count` y `transition-duration` (`global.scss:337-345`). NO toca `animation-delay`.
- Por tanto, si el retardo de 150/200 ms y un `fill-mode: backwards` se declarasen fuera de `no-preference`, el párrafo y el botón quedarían ocultos durante el retardo bajo `reduce`. Retardos y keyframes deben vivir solo dentro de `no-preference`.

## 5. SC 2.5.8 Target Size (Minimum) y SC 2.5.5 (AAA)
**2.5.8** (AA, https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html). El objetivo mide al menos 24×24 CSS px. Excepciones:
- **Spacing:** los objetivos más pequeños pasan si su círculo de 24px no corta a otro objetivo ni a otro círculo.
- **Equivalent:** hay otro control equivalente en la misma página.
- **Inline:** «The target is in a sentence or its size is otherwise constrained by the line-height of non-target text».
- **User agent control** y **Essential**.
- La medida usa la caja delimitadora. El relleno cuenta: el ejemplo del menú dice «24 CSS pixel height (text and padding)». El requisito no depende del zoom.
- Los enlaces sueltos y los menús NO están exentos; solo lo está el texto corrido.
- La técnica listada es C42 (https://www.w3.org/WAI/WCAG22/Techniques/css/C42). Su descripción menciona «links in navigation or pagination menus».

**2.5.5** (AAA, https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html). El objetivo mide al menos 44×44 CSS px. Excepciones: Equivalent, Inline («in a sentence or block of text»), User Agent Control y Essential. La página no trata los enlaces de navegación; lista C44 como técnica suficiente.

**Implicación.** Un nav de enlaces sueltos no cae en la excepción inline. Los del repo ya miden 48×48 mínimo (`src/styles/_api.scss:124`; `Cabecera.module.scss:133-134`), lo que supera 24 (AA) y 44 (AAA). Con letra más grande se mantiene mientras no se baje `min-height`.

## 6. SC 1.4.12 Text Spacing y SC 1.4.4 Resize Text (más 1.4.10 Reflow)
**1.4.12** (AA, https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html). No debe haber pérdida de contenido ni funcionalidad cuando el usuario pone:
- interlineado ≥1,5
- espaciado de párrafo ≥2
- letter-spacing ≥0,12
- word-spacing ≥0,16

La Nota 1 dice que el contenido «is not required to use these text spacing values». Una contención de ancho con puntos suspensivos solo vale si el texto truncado sigue accesible. Técnicas: C36 y C35 (suficientes); fallo F104 (recorte o solape).

**1.4.4** (AA, https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html). El texto debe poder ampliarse al 200% sin pérdida de contenido ni funcionalidad. No exige una sola línea. Prefiere unidades relativas (C12, C14, C28). Fallos F69 (recorte, truncado u ocultación al 200%) y F94 (https://www.w3.org/WAI/WCAG22/Techniques/failures/F94, uso incorrecto de unidades de viewport para el tamaño del texto; la página cubre `1vw` solo y no menciona `clamp()`).

**1.4.10 Reflow** (AA, https://www.w3.org/WAI/WCAG22/Understanding/reflow.html). Hay que evitar el scroll bidimensional a 320 CSS px. La página admite colapsar el nav en un menú: «More» y luego botón de menú.

**Implicación.**
- Ninguno de los SC impide un nav de una sola línea con letra mayor. Lo que no puede ocurrir es recorte o solape cuando el usuario cambia el espaciado o amplía.
- El `text-wrap: nowrap` actual en los enlaces (`Cabecera.module.scss:141`) es el riesgo (F104 y F69).
- Un zoom de solo texto no cambia el ancho del viewport, así que el punto de corte de 1024px (`Cabecera.module.scss:116`) no protege en ese caso.
- Un zoom de página al 200% en 1280px da 640px, y ahí sí colapsa al menú.

## 7. SC 2.4.11 Focus Not Obscured (Minimum) y cabecera fija
https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html. Nivel AA: «the component is not entirely hidden due to author-created content».
- Se permite el ocultamiento PARCIAL. 2.4.12 (AAA, https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-enhanced.html) exige que ninguna parte quede oculta.
- Un banner fijo falla si tapa por completo el componente enfocado. Pasa con un banner modal o con `scroll-padding`.
- La técnica suficiente es C43 (https://www.w3.org/WAI/WCAG22/Techniques/css/C43), «Using CSS scroll-padding to un-obscure content». Su ejemplo compensa un banner inferior con `scroll-padding-bottom`.
- El fallo F110 (https://www.w3.org/WAI/WCAG22/Techniques/failures/F110) cubre un pie o cabecera fijos que ocultan por completo los elementos enfocados.
- C34 (https://www.w3.org/WAI/WCAG21/Techniques/css/C34) es una técnica advisory de 1.4.10 y habla de «un-fixing» las cabeceras sticky según el viewport.
- Las páginas leídas no tratan las cabeceras translúcidas. Que sea transparente no reduce el solape; es una inferencia.

**Implicación.**
- Para que la imagen suba bajo la cabecera, hay que quitar el `padding-block-start` de `#root` (`src/styles/global.scss:151`) SIN quitar `scroll-padding-top: calc(var(--altura-cabecera) + 24px)` (`global.scss:313`). Lo que sí debe seguir reservando el sitio son el salto a anclas y el foco.
- Tampoco hay que tocar el desplazamiento del enlace de salto (`global.scss:246`).
- Si la altura de los dos estados difiere, `--altura-cabecera` (`global.scss:49`) debe contener la mayor.
- La puerta `src/styles/hoja-global.test.ts:115-131` fija que `scroll-padding-top` consume solo `--altura-cabecera`.

## 8. Cabecera transparente que pasa a sólida
NO ENCONTRADO. No existe en W3C WAI ni en web.dev una guía específica sobre indicar el cambio de estado ni sobre medir el contraste en ambos estados.

Lo que sí hay en documentación oficial, aplicado por mí a este caso:
- 1.4.3 mide «in normal usage» (Key Terms). La Figura 3 de https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html muestra logotipos de bajo contraste por defecto y alto solo al pasar el ratón; el caso se trata con la excepción de logotipo, pero no se aplica a texto de navegación. Mi inferencia: el estado por defecto debe cumplir por sí solo, así que el estado transparente de la carga ha de pasar 4,5:1 sin depender del sólido.
- El estado sólido se mide aparte con un fondo conocido. El fondo semiopaco bajo texto sobre imagen está recomendado en https://www.w3.org/WAI/tutorials/carousels/styling/.
- Para el foco hay que cumplir en ambos estados (1.4.11 y C40; punto 2).
- Ni 4.1.3 Status Messages ni 1.4.1 Use of Color cubren este caso a primera vista. 4.1.3 trata de mensajes sobre el resultado de una acción, el estado de espera o errores (https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), y 1.4.1 de transmitir información solo con el color (https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html). Que no apliquen a un cambio puramente visual es mi inferencia.

**Implementación (no es accesibilidad).**
- Las consultas `scroll-state()` solo evalúan `stuck` si el contenedor tiene `position: sticky` (https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Conditional_rules/Container_scroll-state_queries). El elemento con `container-type` no puede ser el que se estiliza (https://developer.chrome.com/blog/css-scroll-state-queries).
- La cabecera actual es `position: fixed` (`Cabecera.module.scss:20`), así que `scroll-state(stuck)` no se activaría sin cambiar el posicionamiento.
- El soporte entre navegadores no está confirmado; solo Chrome 133 consta en la fuente consultada.

## Consecuencias para el repo
1. Añadir un `@keyframes` revierte el estado documentado «cero `animation:` y cero `@keyframes` en `src/`» (`features/retirada_carteleria_urgencias.feature:62-65`; `features/accesibilidad.feature:342-395`). Eso es un cambio de contrato y pasa por la puerta humana.
2. Las animaciones y transiciones de las hojas globales deben vivir dentro de `prefers-reduced-motion` (`src/styles/movimiento-global.test.ts:11,24`).
3. Los enlaces del nav (`Cabecera.module.scss:129-155`) cambian de color en `:hover` a `--color-acento-tinta` sobre `--color-acento-suave`. Ese par debe recomprobarse sobre la imagen, con la cabecera transparente.

## DUDAS DEL AGENTE
- NO ENCONTRADO: guía oficial W3C WAI o web.dev sobre una cabecera que pasa de transparente a sólida al hacer scroll (indicación del cambio de estado o contraste en ambos estados). Lo escrito en el punto 8 es inferencia mía sobre 1.4.3, la Figura 3 de su Understanding y la tutoría WAI de carruseles.
- INFERENCIA, no cita: que 4.1.3 Status Messages y 1.4.1 Use of Color no apliquen a un cambio puramente visual de fondo de la cabecera. Las páginas Understanding no mencionan ese ejemplo.
- NO ENCONTRADO: ninguna página Understanding leída trata cabeceras translúcidas o semitransparentes respecto a 2.4.11; que 'transparente no reduce el solape' es mi inferencia.
- NO ENCONTRADO: criterio explícito de la página Understanding 1.4.3 sobre qué zona de la imagen se mide. La regla (zona más clara para texto claro, y luego letra a letra) sale de F83; los píxeles inmediatos a cada letra, de G18/G145.
- DISCREPANCIA de cifras: el encargo habla de 18,66px y la documentación oficial (Understanding 1.4.3, G145) dice 'approximately 18.5px and 24px'. El 14pt exacto son 18,67px por aritmética. Se cita la cifra oficial. Para ser conservador conviene tratar como 'grande en negrita' solo texto de peso >=700 y >=19px.
- NO VERIFICADO: soporte entre navegadores de las scroll-state container queries. Solo Chrome 133 consta (developer.chrome.com/blog/css-scroll-state-queries, 15/01/2025). La página MDN consultada no mostraba su estado Baseline en el texto extraído.
- NO ENCONTRADO en la parte leída de MDN: la sección 'Accessibility' de prefers-reduced-motion con enlaces a WCAG 2.3.3. El texto extraído de la página (129.677 caracteres, en gran parte menú lateral) no la incluía. Lo que se cita de MDN es sintaxis, valores, ejemplo, Baseline y la advertencia vestibular.
- ADVERTENCIA de fuente: drafts.csswg.org/mediaqueries-5 se presentaba como 'W3C Working Draft, 8 October 2026' en el texto extraído; la definición de §12.1 (no-preference | reduce) se leyó completa, pero el estado del borrador conviene confirmarlo si hay que citarlo en un contrato.
- La página Understanding 2.3.3 NO trata expresamente el 'page load'. La conclusión de que no aplica a un fundido de entrada sin interacción se apoya en su remisión a 2.2.2 para la animación que inicia la página, y en el alcance declarado de C39 ('triggered by user interactions').
- 2.2.2 no trata expresamente una animación corta única al cargar; la conclusión de que 1,25 s no aplica se deduce de las tres condiciones del texto normativo (más de 5 s, automática, en paralelo con otro contenido).
- No se ha medido ningún contraste real. Los tokens de color y la imagen definitiva no se calcularon aquí; hay que remedir H1 (3:1), párrafo y enlaces del nav (4,5:1) y el anillo de foco (3:1) sobre la imagen real, en el estado transparente y en el sólido, tras cualquier cambio del velo.
