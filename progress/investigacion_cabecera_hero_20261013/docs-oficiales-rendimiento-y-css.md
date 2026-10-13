# docs-oficiales-rendimiento-y-css

# Investigación oficial: cabecera transparente sobre hero, nav claro y entrada suave (Galapavet)

Método: cada página se abrió con WebFetch (no de memoria). WebFetch devuelve resúmenes de un modelo pequeño, así que todo va en paráfrasis y no se contrastó contra el HTML crudo. Lo que no está escrito en la fuente se marca **INFERENCIA** o **NO ENCONTRADO**. Las rutas con línea son de este repositorio.

## 1. LCP: opacity 0, texto animado, `<img>` como LCP

**Reglas**
- Candidatos a LCP: `<img>`, `<image>` en SVG, póster de vídeo, fondo con `url()` y elementos de bloque con texto. Chromium excluye por heurística los elementos con opacidad 0, los que cubren todo el viewport y las imágenes de baja entropía. El artículo avisa de que las heurísticas pueden cambiar y difieren de las de FCP. El tamaño computado es la parte visible en el viewport, sin márgenes, rellenos ni bordes. Una imagen reescalada cuenta por el menor entre su tamaño visible y el intrínseco. LCP deja de actualizarse con la primera interacción. Umbral bueno: 2,5 s en p75. Fuente: https://web.dev/articles/lcp
- Spec LCP (W3C WD 26-ago-2026), https://www.w3.org/TR/largest-contentful-paint/:
  - §4.2: un nodo de texto con opacidad <= 0 se salta, salvo que tenga text-shadow o trazo visible. Cada elemento se reporta en el primer pintado en que es "paintable" (tiene opacidad y visibilidad).
  - §4.3 paso 7: si el área visible de la imagen es exactamente la del viewport visual, se descarta (devuelve null).
- Paint Timing (W3C WD 2-oct-2026), https://www.w3.org/TR/paint-timing/ §2: "paintable" exige que el elemento se esté renderizando, que su visibilidad usada sea `visible` y que su opacidad usada **y la de todos sus ancestros** sea > 0.
- Element render delay: se recomienda que sea <10 % del LCP. Causas listadas: contenido oculto por otro código, elemento aún no en el DOM, hilo principal bloqueado. Opacidad y animaciones CSS no figuran como causa. Se recomienda `fetchpriority="high"` y no hacer lazy-load de la imagen LCP. Fuente: https://web.dev/articles/optimize-lcp
- **INFERENCIA** (ninguna fuente lo dice para fundidos): un elemento que anima desde opacity 0 pasa a ser candidato en el primer fotograma con opacidad > 0, no al terminar la animación. Retardos antes de ese primer fotograma sí retrasan la candidatura.
- **NO ENCONTRADO**: afirmación oficial de que un fade-in retrase LCP (no la tratan web.dev/articles/lcp, optimize-lcp, https://web.dev/blog/common-misconceptions-lcp, https://web.dev/articles/css-web-vitals ni la página de Lighthouse). **NO ENCONTRADO** también si un `transform` en el H1 cambia el tamaño reportado.

**Repo:** `Hero.tsx:48-56` ya tiene la imagen con `loading="eager"`, `fetchPriority="high"` y `width/height`. El hero actual mide `clamp(560px, 84svh, 784px)` (`Hero.module.scss:5`), nunca igual al viewport.

**Implicación:** si cabecera y hero con imagen a sangre ocupan exactamente el viewport, la `<img>` puede dejar de ser candidata (§4.3 paso 7) y el LCP pasaría al H1 o al párrafo, justo lo que se anima. Conviene animar los hijos (H1, párrafo, botón) y no el contenedor, porque el contenedor a opacity 0 anularía a todos sus descendientes, y medir el LCP real tras el cambio.

## 2. CLS: transform y cambio de altura de cabecera

**Reglas**
- Hay layout shift cuando un elemento visible cambia de posición entre dos fotogramas. Un elemento que se añade o cambia de tamaño no cuenta si no mueve el punto de inicio de otros elementos visibles. `transform` permite animar sin layout shifts: `translate()` en vez de top/left y `scale()` en vez de width/height. Los shifts a menos de 500 ms de una entrada discreta (clic, toque, tecla) llevan `hadRecentInput`. **El scroll, el arrastre y el pinch no cuentan como esa entrada.** Bueno: <= 0,1 en p75. Fuente: https://web.dev/articles/cls
- Las animaciones compuestas con `translate` no afectan a otros elementos y no cuentan en CLS. Para UI que aparece, se recomienda sacarla del flujo superponiéndola. Fuente: https://web.dev/articles/optimize-cls
- Las animaciones compuestas quedan excluidas de CLS. Fuente: https://developer.chrome.com/docs/lighthouse/performance/non-composited-animations
- Cambio de altura de cabecera al hacer scroll: **NO ENCONTRADO** como caso explícito (ningún artículo menciona cabeceras ni sticky). La regla general de web.dev/articles/cls solo lo penaliza si desplaza el inicio de otros elementos visibles. La spec Layout Instability no está en los dominios permitidos (`w3.org/TR/layout-instability` devolvió 404) y la página MDN de `LayoutShift` no menciona transforms.

**Repo:** la cabecera es `position: fixed` (`Cabecera.module.scss:20`), fuera del flujo. `--altura-cabecera` (`global.scss:49`) tiene 6 consumidores: `global.scss:151, 246, 313` y `Cabecera.module.scss:21, 45, 259`.

**Implicación:** con altura constante (solo cambian colores al hacer scroll) y entrada solo con transform/opacity, el CLS añadido es 0 por la regla de web.dev. Si la altura cambiara, también se movería el panel móvil (`Cabecera.module.scss:259`) y el `scroll-padding-top` (`global.scss:313`).

## 3. Propiedades seguras para animar

**Reglas**
- Restringir las animaciones a `opacity` y `transform` mantiene la animación en la etapa de composición. Mover con otra cosa distinta de `transform` suele ser lento. Evitar propiedades que disparan layout o paint salvo necesidad. Los difuminados y sombras tardan más en pintarse. `will-change` solo con un problema de rendimiento demostrado, no al empezar a optimizar. Fuente: https://web.dev/articles/animations-guide
- Cambiar cualquier propiedad distinta de transform u opacity siempre dispara paint. Fuente: https://web.dev/articles/simplify-paint-complexity-and-reduce-paint-areas
- Solo `transform` y `opacity` son "solo compositor" en https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count (artículo antiguo). En cambio https://web.dev/articles/css-web-vitals nombra también `filter` como alternativa a animaciones que disparan layout.

**Implicación:** la entrada debe usar solo `opacity` y `transform: translateX`, sin `will-change` permanente. Para el cambio transparente a sólido de la cabecera, `transition: background-color` provoca repintado en cada fotograma. Una capa de fondo (pseudoelemento) cuya `opacity` se anima se queda en el compositor.

## 4. `overflow: clip` frente a `overflow: hidden`

**Reglas**
- `hidden` crea un contenedor de scroll: el contenido sigue desplazable por código (`scrollLeft`, `scrollTo()`) y tabulando a elementos enfocables ocultos. `clip` no es contenedor de scroll, no crea contexto de formato nuevo y prohíbe todo scroll, incluido el programático. Con la sintaxis de dos valores, `clip` actúa como `hidden` si el otro eje no es `visible` ni `clip`. Con `clip`, un elemento enfocable recortado recibe foco pero no se desplaza a la vista, por lo que MDN avisa de que no debe recortar contenido interactivo. Fuente: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow
- CSS Overflow 3 (W3C WD 7-oct-2025), https://www.w3.org/TR/css-overflow-3/, y borrador https://drafts.csswg.org/css-overflow-3/ §3.1 dicen lo mismo, incluida la regla de cómputo `visible`/`clip` a `auto`/`hidden`.
- Desbordamiento horizontal: el borrador §2.3 define como "inalcanzable" la región más allá del origen de scroll (inline-start y block-start). El §3.3 dice que los `transform` cuentan para el área de desbordamiento desplazable. **INFERENCIA**: en LTR, un `translateX` hacia la izquierda (como `fadeInLeft`) no crea barra horizontal, y uno hacia la derecha sí.
- Sticky: se ancla al ancestro más cercano con mecanismo de scroll (`hidden`, `scroll`, `auto`, `overlay`), aunque no sea el que realmente desplaza. Fuente: https://developer.mozilla.org/en-US/docs/Web/CSS/position. CSS Position 3 §3.4 habla del "contenedor de scroll ancestro más cercano": https://www.w3.org/TR/css-position-3/. **INFERENCIA**: como `clip` no es contenedor de scroll, no captura al sticky. Una frase oficial que lo diga: **NO ENCONTRADO**.
- Soporte de `clip`: Firefox 81 (https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/81) y Chrome 90 (https://developer.chrome.com/blog/new-in-chrome-90). **Safari y el estado Baseline del valor `clip`: NO ENCONTRADO.** El banner "Widely available desde julio 2015" de MDN es de la propiedad `overflow` entera.

**Repo:** el hero ya recorta con `overflow: hidden` (`Hero.module.scss:6`). No hay ningún `sticky` en `src/` (la búsqueda solo encontró `fixed`).

**Implicación:** basta mantener el `overflow: hidden` del hero. Si se pasa a `clip`, hay que declarar `hidden` justo antes como respaldo, porque el soporte de Safari no se pudo confirmar.

## 5. Unidades `svh`, `lvh`, `dvh`

**Reglas**
- CSS Values 4 §6.1.2 (WD 12-mar-2024 según la página servida), https://www.w3.org/TR/css-values-4/: el viewport grande asume retraídas las interfaces del agente de usuario, el pequeño las asume expandidas y el dinámico las sigue. Los tamaños dinámicos no son estables ni con el viewport quieto. `vh` y compañeras equivalen a las unidades grandes.
- MDN (https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length): las unidades pequeñas son fijas y "más seguras", pero pueden dejar huecos al retraerse la UI. Las grandes pueden quedar tapadas por la UI expandida. Las dinámicas pueden redimensionar el contenido mientras se hace scroll, con degradación y coste de rendimiento.
- Soporte: Chrome 108, Firefox 101 y Safari 15.4; la actualización dinámica se limita y no va a 60 fps. Fuente: https://web.dev/blog/viewport-units (actualizado 29-nov-2022). Definiciones también en https://web.dev/learn/css/sizing
- Baseline: las unidades de viewport pequeñas, grandes y dinámicas pasaron a **Widely available en junio de 2025** (https://web.dev/blog/baseline-digest-jun-2025). El banner de MDN en `<length>` es del tipo entero.
- Recomendación oficial para un hero a pantalla completa: **NO ENCONTRADO** (ninguna de las fuentes la da).

**Repo:** el proyecto ya eligió `svh` (`global.scss:117-121` y `150`; `Hero.module.scss:5`). El panel móvil usa `max-height: 70vh` (`Cabecera.module.scss:261`), que por la regla de MDN equivale a la unidad grande.

**Implicación:** para el hero a pantalla completa, `svh` es la opción estable y coherente con el repo. `dvh` redimensionaría el hero durante el scroll.

## 6. IntersectionObserver frente a listener de scroll

**Reglas**
- MDN (https://developer.mozilla.org/en-US/docs/Web/API/Document/scroll_event): `scroll` se dispara a ritmo alto, así que el manejador no debe hacer operaciones costosas. Limitarlo con `requestAnimationFrame` es inútil, porque ese callback corre al mismo ritmo. Para esto sugiere `IntersectionObserver`, que escucha por umbrales.
- MDN (https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API):
  - Las soluciones antiguas corrían en el hilo principal con `getBoundingClientRect()`.
  - El callback también corre en el hilo principal, así que debe ser rápido y lo costoso va a `requestIdleCallback`.
  - `rootMargin` solo admite `px` o `%`, y los negativos encogen la raíz.
  - No sirve para lógica de píxel exacto.
  - Un borde compartido de área cero no cuenta como intersección.
  - Un ancestro con `overflow` distinto de `visible` recorta el rectángulo de intersección.
- `observe()` dispara siempre el callback en el primer ciclo de render, con el estado inicial (https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/observe).
- Spec IO (WD 18-oct-2023), https://www.w3.org/TR/intersection-observer/: el procesamiento es un subpaso de "update the rendering". Baseline Widely available desde marzo de 2019 según MDN (https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver).

**Repo:** `src/test/setup.ts:52-67` sustituye `IntersectionObserver` por un doble inerte. No hay observadores ni listeners de scroll en `src/` (solo uso puntual de `scrollY` en `Cabecera.tsx:88`).

**Implicación:** el cambio de estado de la cabecera debe hacerse con un `IntersectionObserver` sobre el hero o un centinela. Como `rootMargin` no admite `var(--altura-cabecera)`, **propuesta mía derivada de esas reglas**: un centinela CSS posicionado con esa variable evita escribir un número a mano. Además los tests necesitarán su propio doble, porque el global no emite eventos.

## 7. `animation-fill-mode`, retardo y `prefers-reduced-motion`

**Reglas**
- MDN (https://developer.mozilla.org/en-US/docs/Web/CSS/animation-fill-mode; Baseline Widely available desde septiembre 2015):
  - `none` (por defecto): la animación no aplica estilos cuando no se ejecuta, así que durante el retardo se ve el estilo base.
  - `backwards`: aplica los valores del primer keyframe relevante en cuanto se aplica la animación y los mantiene durante el retardo.
  - `forwards` conserva los del último y `both` hace las dos cosas.
  - Según https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Animations/Using, con `forwards` las propiedades animadas se comportan como con `will-change` y se conserva el contexto de apilamiento.
  - En la misma página: si se omiten `from`/`to`, se usan los valores computados del elemento.
- CSS Animations 1 (W3C WD 2-mar-2023), https://www.w3.org/TR/css-animations-1/: normalmente la animación no afecta al valor computado antes de que expire el retardo (el fill-mode lo puede cambiar); con `backwards`, durante el retardo se aplican los valores del keyframe que inicia la primera iteración; las animaciones anulan las reglas normales salvo `!important`.
- `prefers-reduced-motion` (MDN, https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion; Baseline Widely available desde enero 2020): `no-preference` es "sin preferencia" y `reduce` es "reducir". Escalados y desplazamientos de objetos grandes son disparadores vestibulares. web.dev (https://web.dev/articles/prefers-reduced-motion) recomienda activar la animación solo bajo `no-preference` y, con `reduce`, quitar el movimiento no esencial.
- WCAG: 2.2.2 solo aplica a movimiento automático de más de 5 s (https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html). 2.3.3 (AAA) cubre solo movimiento disparado por interacción (https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html). La técnica C39 se relaciona con 2.3.3 (https://www.w3.org/WAI/WCAG22/Techniques/css/C39).

**Repo:** `global.scss:337-345` acorta la duración a 0.01ms bajo `reduce`, pero no anula `animation-delay`. La puerta `movimientoRespetuoso.ts:19-21` y `43-45` exige que toda declaración `animation*`/`transition*` esté dentro de un bloque `prefers-reduced-motion`. El análisis es por líneas, con una llave por línea.

**Implicación:** declarar `animation`, `animation-delay` y `animation-fill-mode: backwards` solo dentro de `@media (prefers-reduced-motion: no-preference)` deja el estado base visible cuando la animación no corre. Con `backwards` el elemento queda invisible durante el retardo (sin fill-mode saldría el flash de contenido visible que luego salta a opacidad 0). Si el último keyframe coincide con el estado base, `forwards`/`both` sobran.

## 8. `position: fixed` con `backdrop-filter`, y transición de fondo

**Reglas**
- `position` es Baseline Widely available desde julio de 2015 (como propiedad) en https://developer.mozilla.org/en-US/docs/Web/CSS/position.
- Contenedor de `fixed`: el viewport, salvo que un ancestro tenga `filter`, `backdrop-filter`, `transform`, `perspective`, `rotate/scale/translate`, `contain: layout|paint|strict|content`, `will-change` equivalente o `content-visibility: auto`. Entonces es la caja de relleno de ese ancestro. Fuente: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Display/Containing_block. CSS Position 3 §2.1 lo confirma para `transform`, `will-change` y `contain`; `backdrop-filter` no se pudo confirmar en esa spec.
- `backdrop-filter`, según https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter:
  - Baseline 2024, "Newly available" desde septiembre de 2024.
  - El elemento o su fondo debe ser (parcialmente) transparente.
  - Los elementos con `backdrop-filter` u `opacity < 1` son "backdrop roots" y limitan el efecto.
- web.dev (https://web.dev/articles/backdrop-filter, actualizado en 2019): advierte de que puede perjudicar el rendimiento y que hay que probarlo. Recomienda `@supports` con alternativa de imagen. Tabla de soporte: Chrome 76, Edge 79, Firefox 103, Safari 18.
- Coste del desenfoque: crece con el radio y con el tamaño, y es una operación de GPU por fotograma (https://developer.chrome.com/blog/animated-blur, de 2017, sobre animar blur). **NO ENCONTRADO**: cuantificación oficial del coste de `backdrop-filter` en una cabecera fija.
- Transicionar `background-color` provoca paint (ver punto 3).

**Repo:** `Cabecera.module.scss:20, 25, 31-34`: fija, fondo sólido y `color-mix` al 88 % con `blur(16px)` bajo `@supports`. `Cabecera.tsx:157-171` y `Cabecera.module.scss:257-259`: `.panelMovil` es `position: fixed` y **descendiente** de la cabecera. Hoy esa cabecera con `backdrop-filter` es su bloque contenedor. `Hero.module.scss:64-66` y `136-138` usan `blur(8px)` en la píldora y en «Llamar», que se retiran.

**Implicación:** la cabecera transparente no debe llevar `backdrop-filter`; el desenfoque, si se quiere, va solo en el estado sólido. Como alternar `backdrop-filter` cambia el bloque contenedor del panel móvil fijo, conviene que su posición no dependa de ello.

## 9. Scrim/overlay para contraste con texto blanco sobre imagen

**Reglas**
- La palabra "scrim" no aparece en ninguna fuente oficial consultada: **NO ENCONTRADO** con ese nombre.
- WCAG 2.2 SC 1.4.3 (https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html): 4,5:1 en texto normal y 3:1 en texto grande (18 pt ≈ 24 px, o 14 pt negrita ≈ 18,5 px). El contraste se mide contra el fondo sobre el que se renderiza el texto en uso normal. La página no menciona overlays, degradados ni text-shadow.
- G18 (https://www.w3.org/TR/WCAG20-TECHS/G18.html) es lo más cercano: para texto sobre imagen, su ejemplo "vela" la zona tras el texto para que el contraste aguante; también admite sombreado local, contorno fino de al menos 1 px o halo; y define un procedimiento por luminancia relativa letra a letra.
- F83 (https://www.w3.org/TR/WCAG20-TECHS/F83.html): es fallo de 1.4.3 si el texto sobre imagen no contrasta con las partes de la imagen más parecidas al texto. Comprobación rápida: para texto claro se compara con la zona **más clara** de la imagen; si falla, se mide por letra.
- Las guías de MDN (https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Understanding_WCAG/Perceivable/Color_contrast) y de web.dev (https://web.dev/learn/accessibility/color-contrast) no tratan imágenes de fondo ni overlays.

**Repo:** el velo actual es un degradado de `--color-tinta` al 88 % arriba, 76 % al 42 % y 92 % abajo (`Hero.module.scss:11-22`; la imagen va en z-index -2). Ya hubo un hallazgo de anillo de foco con 1,98:1 sobre el velo y se corrigió con un color explícito (`Hero.module.scss:112-127`; `global.scss:276-286`).

**Implicación:** el contraste de los enlaces blancos del nav se debe medir contra el píxel más claro de la franja superior ya con el velo aplicado (la comprobación rápida de F83). Los enlaces y el foco del nav necesitan el mismo tratamiento de anillo que los botones del hero.

## DUDAS DEL AGENTE
- No se encontró ninguna afirmación oficial de que un fade-in o un texto animado con transform retrase el LCP, ni de si un transform en el H1 cambia su tamaño reportado. Lo que se dice sobre cuándo se convierte en candidato un elemento que anima desde opacity 0 es inferencia a partir de las specs de LCP y Paint Timing. Hay que medirlo en un navegador real con PerformanceObserver tras el cambio.
- Riesgo de LCP no resuelto: la spec (LCP §4.3 paso 7) descarta una imagen cuya área visible es exactamente la del viewport, y web.dev describe una heurística similar para elementos que cubren todo el viewport. Con cabecera y hero a pantalla completa, la imagen podría dejar de contar y el LCP pasaría al texto animado. Las fuentes permitidas no dicen si Chrome lo aplica así a un `<img>` ni cómo queda con scrollbars o en móvil con svh.
- Safari y el estado Baseline del valor `overflow: clip`: NO ENCONTRADO. Solo se verificaron Firefox 81 (notas de MDN) y Chrome 90 (blog de Chrome). Tampoco hay frase oficial de que `clip` no capture a un `sticky`; es inferencia a partir de la definición de contenedor de scroll.
- Layout Instability: la spec no está en los dominios permitidos (`w3.org/TR/layout-instability` devolvió 404), así que no hay fuente de primera mano sobre cambios de altura de una cabecera fija. Solo se aplicó la regla general de web.dev/articles/cls.
- No se encontró cuantificación oficial del coste de `backdrop-filter` en una cabecera fija. Solo hay la advertencia de web.dev de probarlo y el artículo de 2017 sobre animar blur. `backdrop-filter` figura en MDN como Baseline 2024 'Newly available' (septiembre de 2024).
- Trampa de bloque contenedor: `.panelMovil` (`position: fixed`) está dentro de la cabecera con `backdrop-filter` (`Cabecera.tsx:157-171`, `Cabecera.module.scss:257-259`). Alternar `backdrop-filter` entre el estado transparente y el sólido cambia el bloque contenedor de ese panel. Hay que decidir si se saca el panel de la cabecera o se asegura que su posición no cambie. Además `Cabecera.module.scss:261` usa `70vh`, que MDN equipara a la unidad grande.
- Conflicto con contratos aprobados: `features/accesibilidad.feature:342-364` y `features/retirada_carteleria_urgencias.feature:62-65` registran que `src/` queda con cero `animation:` y cero `@keyframes`. Una entrada con keyframes exige un contrato Gherkin nuevo con aprobación humana. Además `features/fidelidad_cabecera.feature` tiene 7 referencias a `padding-block-start`/`--altura-cabecera` que habría que reconciliar antes de tocar `#root`.
- Decisión de diseño, no de investigación: `#root` reserva el hueco con `padding-block-start: var(--altura-cabecera)` en TODAS las rutas (`global.scss:146-152`). Quitarlo para superponer la cabecera al hero afecta a las subpáginas (Tienda, Blog, Campañas…), al enlace de salto (`global.scss:246`) y al `scroll-padding-top` (`global.scss:313`). Hay que decidir si el solapamiento es solo de la portada.
- El detector de movimiento del repo (`movimientoRespetuoso.ts:19-21`, `43-45`) analiza por líneas con una llave por línea. Las declaraciones `animation*` nuevas, incluidos `animation-delay` y `animation-fill-mode`, deben ir dentro de `@media (prefers-reduced-motion: no-preference)` con ese formato. Bajo `reduce`, `global.scss:337-345` no anula `animation-delay`.
- Las fechas y estados de las specs W3C son los que mostró la página servida (LCP WD 26-ago-2026, Paint Timing WD 2-oct-2026, CSS Overflow 3 WD 7-oct-2025, CSS Values 4 WD 12-mar-2024, Intersection Observer WD 18-oct-2023). Las páginas se leyeron con WebFetch, que resume con un modelo pequeño. Todo va parafraseado y no se contrastó contra el HTML crudo ni con pruebas en un navegador.
