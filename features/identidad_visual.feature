# ============================================================================
# POR QUÉ EXISTE ESTE FICHERO
# ============================================================================
# El 23/08/2026 se midió el `dist/` de producción con un navegador real. El
# diagnóstico, medido y no estimado (`project-spec.md` → Decisión 25 y sección
# «Identidad visual — nueva feature: `identidad_visual` (feature 22)»):
#
#   - **0 apariciones de `font-family` en todo el CSS generado.**
#     `getComputedStyle(body).fontFamily` devuelve «Times New Roman», la de la
#     hoja del agente de usuario.
#   - **0 reglas para `html` o `body`.** El `body` conserva el margen de 8 px
#     que la propia especificación HTML fija como valor por defecto
#     (<https://html.spec.whatwg.org/multipage/rendering.html>), fondo
#     transparente y color negro.
#   - 124 reglas CSS en todo el sitio y solo 3 roles de color
#     (`--color-fondo`, `--color-texto`, `--color-foco`), que SÍ existen y SÍ
#     resuelven (el `h1` computa a `rgb(119,40,107)` = `#77286B`): el problema
#     no es que falten, es que nada los aplica al documento.
#   - **La carpeta `public/` no existe**, así que los 26 huecos de imagen del
#     código, el logo del pie y el favicon dan 404
#     (`progress/plan_imagenes.md` §1.1, tabla maestra de 26 filas).
#
# Y ninguna de las 712 pruebas verdes podía verlo: **corren en jsdom, que no
# calcula layout**; los CSS Modules devuelven un proxy y solo
# `import.meta.glob(..., { query: '?raw' })` recibe texto real
# (`vite.config.ts:46-65`). Los 712 tests dicen la verdad sobre lo que se les
# pidió mirar; nadie les pidió mirar esto.
#
# EL RETO DE ESTE CONTRATO, y su razón de ser: los escenarios de la feature 21
# solo podían afirmar cosas que jsdom sabe medir, y por eso se entregó un sitio
# sin diseño con todos los tests en verde. **Aquí no puede volver a pasar.**
# Cada `Then` de este fichero afirma algo que, si se rompe, DELATA que la web
# se ve mal: una familia tipográfica computada, un rectángulo real, un
# `naturalWidth`, un código de respuesta HTTP, un ratio calculado con la
# fórmula real, un desbordamiento horizontal.
#
# ============================================================================
# DE DÓNDE SALE CADA VALOR DE ESTE FICHERO
# ============================================================================
# Ningún número de este contrato está inventado. Cada uno se traza a:
#
# - **Roles y valores de color de la variante `marca`**: la tabla «Roles de
#   color — variante `marca` (fondo blanco)» de `project-spec.md`, con los
#   ratios recalculados el 23/08/2026 con la fórmula de `src/lib/contraste.ts`.
#   Sus valores de control (morado/blanco 9,13 · verde/blanco 5,68 ·
#   lima/blanco 1,89) coinciden dígito a dígito con los ya aprobados por
#   `tokens_marca.feature`, lo que confirma que es la misma fórmula.
#   Derivación: mezcla en sRGB de `#77286B` / `#B4C718` / `#48704B`
#   (`src/lib/tokens.ts:8-12`) con blanco o negro puro. Decisiones 26 y 27.
# - **Punto de partida verificado de la variante `noche`**: misma sección del
#   spec y `progress/estudio_diseno_referencia.md` §1.4.
# - **Umbrales de contraste**: `src/lib/contraste.ts:83-86` — 4,5 para «texto
#   normal», 3 para «texto grande» y 3 para «componente de interfaz o borde de
#   foco». Son SC 1.4.3 y SC 1.4.11 de WCAG 2.2 AA.
# - **Área táctil 24×24 px CSS**: SC 2.5.8 Target Size (Minimum), AA
#   (<https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html>),
#   ya modelado en `src/lib/accesibilidad-areaTactil.ts` y en
#   `$area-tactil-minima: 24px` (`src/styles/_tokens.scss`).
# - **Perímetro de 2 px CSS y 3:1 entre estado con foco y sin foco**: SC 2.4.13
#   Focus Appearance, que es **nivel AAA, no AA** (Decisión 40). Se cumple
#   igualmente, pero **se rotula como AAA**. Lo obligatorio en AA es SC 2.4.7
#   más SC 1.4.11 para el contraste del propio indicador.
# - **Foco no tapado por la cabecera fija**: SC 2.4.11 Focus Not Obscured
#   (Minimum), AA, y su técnica suficiente C43
#   (<https://www.w3.org/WAI/WCAG22/Techniques/css/C43>). **No existe ninguna
#   regla de axe para 2.4.11**: se escribe a mano (Decisión 30).
# - **Las cinco etiquetas de axe** `['wcag2a','wcag2aa','wcag21a','wcag21aa',
#   'wcag22aa']` y la prohibición de `.options()`: Decisión 39. `target-size`
#   viene `enabled: false` por defecto en axe-core 4.13.0 y solo `wcag22aa` la
#   activa; y `wcag22aa` es la única etiqueta que la trae, de ahí la lista
#   acumulativa.
# - **Tipografía**: Outfit (titulares y datos numéricos) + DM Sans (texto
#   corrido), variables, subconjunto `latin`, autoalojadas en `public/fuentes/`
#   (Decisión 32). Pesos MEDIDOS: Outfit `latin` variable **32 292 B** + DM Sans
#   `latin` variable **36 932 B** = **69 224 B**
#   (`progress/investigacion_tecnica_visual.md` §3.2). Ambas SIL OFL 1.1,
#   verificado leyendo el `LICENSE` de los ficheros descargados.
# - **Los seis valores de métricas ajustadas** (Capsize): Outfit
#   `size-adjust: 99.8204%`, `ascent-override: 100.18%`,
#   `descent-override: 26.0468%`; DM Sans `size-adjust: 104.531%`,
#   `ascent-override: 94.9001%`, `descent-override: 29.6563%` (Decisión 33).
# - **`crossorigin` obligatorio en la precarga aunque el fichero sea del mismo
#   origen**: cita literal de MDN, «The attribute needs to be set to match the
#   resource's CORS and credentials mode, **even when the fetch is not
#   cross-origin**». Sin él el navegador descarga el fichero **dos veces**.
# - **Reset explícito, regla a regla**: Decisión 29.
# - **Movimiento: dos duraciones (150 ms / 300 ms), curva `ease-out`, corte en
#   `reduce` con `0.01ms` y no `0`**: Decisión 31, apoyada en Material Design 3
#   (<https://m3.material.io/styles/motion/easing-and-duration/tokens-specs>).
# - **Imágenes**: `progress/plan_imagenes.md` §1.1 (26 huecos), §2.3 (anchos de
#   `srcset`), §3 (logo de 201×201 px y favicon), Decisiones 34, 35 y 36.
# - **Open Graph 1200×630**: Meta, «Use images that are at least 1200 x 630
#   pixels» (<https://developers.facebook.com/docs/sharing/webmasters/images/>),
#   y Decisión 35 (PNG, no WebP; logo real sobre el morado de marca, nunca una
#   foto de banco).
# - **Motor de verificación**: Playwright 1.62.1 + `@axe-core/playwright`
#   4.13.0, e2e en `tests/e2e/`, `tsconfig.e2e.json` como tercer proyecto,
#   `retries: 0`, midiendo SIEMPRE `dist/` vía
#   `vite preview --port 4173 --strictPort` (Decisiones 37, 38).
# - **El punto de corte 1024**: `PUNTO_DE_CORTE_NAVEGACION_PX`
#   (`src/components/Cabecera-logica.ts`), ya `done`. El viewport mínimo 320 es
#   el de la escala fluida ya fijada (`src/lib/diseno/escalaTipografica.ts:21`).
# - **El inventario de 6 páginas**: `INVENTARIO_DE_PAGINAS`
#   (`src/lib/accesibilidad-analisis.ts:16-23`), ya `done`, y sus rutas reales
#   registradas en `src/App.tsx:54-62` y `src/pages/PaginaCampanas.tsx:47`:
#   `/` · `/campanas` · `/campanas?campana=vacunaciones` · `/blog` ·
#   `/blog/demo-1` · `/tienda`.
# - **Las 8 secciones ancladas de la landing y su orden**: Decisión 16,
#   ejecutada por `ensamblaje_landing` (feature 20, ya `done`).
#
# ============================================================================
# UNA DISCREPANCIA DEL SPEC QUE ESTE FICHERO NO TAPA
# ============================================================================
# La Decisión 26 titula «de 3 a 15 (13 de color + 2 de sombra)», y
# `progress/estudio_diseno_referencia.md` §1.2 repite «13 roles de color + 2 de
# sombra». Pero **ninguna de las dos cuadra con su propia enumeración**: la
# tabla de §1.2 enumera 14 roles de color, y la tabla «Roles de color —
# variante `marca`» de `project-spec.md` enumera **15 roles de color** (los 14
# de §1.2 más `--color-primario-fuerte`, que nace en la Decisión 27, posterior
# a §1.2) **+ 2 de sombra = 17 tokens**.
#
# Este contrato resuelve la discrepancia **a favor de la enumeración con
# valores**, que es la única que se puede verificar: 15 roles de color + 2 de
# sombra, enumerados a mano en @s1. El titular «13 + 2» de la Decisión 26 es un
# recuento equivocado y **le toca al `craftsman_lead` corregirlo en
# `project-spec.md`**; no se corrige a escondidas desde aquí ni se finge que
# nunca existió.
#
# ============================================================================
# LAS TRES HERRAMIENTAS DE VERIFICACIÓN, Y CUÁNDO USA CADA UNA
# ============================================================================
# Cada escenario declara EXPLÍCITAMENTE con cuál se verifica, igual que hace
# `features/sistema_de_diseno_visual.feature`:
#
# (a) **MÓDULO PURO + Vitest** — toda derivación de valores (mezcla de color,
#     ratios, escalas, inventarios, veredictos de puerta). Sigue siendo la vía
#     PREFERENTE porque además la muerde StrykerJS
#     (`stryker.config.json`, glob `src/lib/**` + `src/**/*-logica.ts`).
# (b) **LECTURA DEL TEXTO REAL con `?raw` + Vitest** — para afirmar que una
#     declaración existe literalmente en un `.scss` o en `index.html`. Es la
#     única forma de leer CSS de verdad bajo jsdom (`vite.config.ts:46-65`).
# (c) **NAVEGADOR REAL (Playwright + axe-core sobre `dist/`)** — todo lo que
#     sea layout, tipografía computada, rectángulos, foco, contraste medido,
#     peticiones de red y códigos de respuesta. **Es la herramienta nueva y es
#     la que cierra el agujero**: es lo único que ve si la web se ve mal.
#
# Reparto de los 51 escenarios, contado uno a uno:
#   - **(a) MÓDULO PURO + Vitest — 12**: @s1, @s4, @s5, @s6, @s7, @s8, @s9,
#     @s10, @s16, @s35, @s50, @s51.
#   - **(b) LECTURA "?raw" + Vitest — 11**: @s2, @s3, @s11, @s12, @s13, @s14,
#     @s15, @s17, @s18, @s19, @s48.
#   - **(c) NAVEGADOR REAL — 28**: @s20-@s34 (15), @s36-@s47 (12) y @s49.
# Es decir: **más de la mitad del contrato solo puede pasar si la web se ve de
# verdad**, que es exactamente lo que le faltaba a la feature 21.
#
# ============================================================================
# POR QUÉ NINGÚN THEN HABLA DE CLASES CSS
# ============================================================================
# Regla dura de este repositorio, heredada de `tokens_marca.feature` y
# `sistema_de_diseno_visual.feature`: los tests corren con los CSS Modules
# desactivados, así que un `className` no significa nada. Todo `Then` de este
# fichero se afirma sobre: un valor leído del texto real de un fichero, un
# ratio calculado con la fórmula real, un valor de `getComputedStyle`, un
# rectángulo medido, un `naturalWidth`, un código de respuesta HTTP, un
# recuento de peticiones o un recuento de violaciones de axe. **Ninguna
# aserción lee ni compara un `className`.**
#
# ============================================================================
# QUÉ CIERRA ESTA FEATURE (LO EJECUTA; NO LO POSEE NI LO REDEFINE)
# ============================================================================
# Decisión 41: «La feature 22 no reabre ni un solo escenario de la 21 ni de la
# 19: construye la maquetación real que hace que [sus 12 escenarios de
# navegador real] puedan pasar de verdad, y los automatiza.» La 22 los
# **ejecuta**; la 21 y la 19 los **poseen**. Copiarlos aquí sería duplicar un
# contrato ya aprobado por la puerta humana, que es la vía conocida a que las
# dos copias diverjan.
#
# Los 12, uno a uno, y qué escenario de ESTE fichero los ejecuta:
#
#   `sistema_de_diseno_visual.feature` (feature 21) — 8 escenarios:
#     @s12  cambiar de variante cambia el color computado  →  ejecutado por @s25
#     @s27  1024 px escritorio / 1023 px móvil en la cabecera real → por @s50
#     @s28  axe `target-size` sin violaciones en la portada  →  por @s36 y @s37
#     @s29  enlaces de nav/pie/teléfono ≥ 24×24 px CSS       →  por @s37
#     @s30  área del indicador de foco ≥ perímetro de 2 px   →  por @s38
#     @s31  contraste real del foco ≥ 3:1 entre estados      →  por @s38
#     @s32  la cabecera fija no tapa el control enfocado     →  por @s40
#     @s34  con menos movimiento, ninguna animación en curso →  por @s42 y @s43
#
#   `accesibilidad.feature` (feature 19) — 4 escenarios:
#     @s2   cero violaciones de axe en las 6 páginas          →  ejecutado por @s36
#           (incluye @s7, los cinco niveles de conformidad, dentro de @s35)
#     @s17  la cabecera fija no oculta el control enfocado    →  por @s40
#     @s18  área y contraste del indicador de foco            →  por @s38 y @s39
#     @s19  con menos movimiento ninguna animación se reproduce → por @s42 y @s43
#
# @s50 de este fichero convierte ese cierre en algo MEDIBLE: exige que el
# informe de la suite e2e nombre los 12 tags heredados, uno a uno, y que el
# recuento sea exactamente 12. Sin eso, «cierra la 19 y la 21» sería una
# afirmación de chat, no una puerta.
#
# Orden de cierre (Decisión 41): 21 `done` con sus puertas unitarias → 22
# construye maquetación y capa base → los 12 escenarios de navegador real se
# ejecutan como e2e de Playwright → 19 sale de `blocked`.
#
# ============================================================================
# QUÉ NO SE REABRE
# ============================================================================
# - **Ningún Given/When/Then de las features 1-21.** Esta feature no cambia el
#   árbol accesible, los atributos ARIA, los textos, los datos ni el patrón de
#   interacción de ningún componente ya `done`.
# - **Los 3 roles de color ya fijados** por `sistema_de_diseno_visual.feature`
#   @s2-@s10 (`--color-fondo`, `--color-texto`, `--color-foco` en las 4
#   variantes, `src/styles/_tokens.scss:39-64`) se CONSERVAN tal cual. Esta
#   feature **añade** roles; no retoca los tres existentes.
# - **`calcularRatioContraste` y `esAptoParaUso`** (`src/lib/contraste.ts`) se
#   REUTILIZAN tal cual, ya probadas al 100 % por `tokens_marca.feature`.
#   Ningún escenario de aquí vuelve a probarlas en abstracto.
# - **Las escalas tipográfica y de espaciado** ya fijadas por la feature 21
#   (`$escala-tipografica`, `$escala-espaciado`, `paso-tipografico()`,
#   `espaciado()`) se consumen; no se redefinen.
# - **El punto de corte único 1024** y el mecanismo `[data-variante]` de
#   `selector_paleta` (feature 14, `done`) se consumen; no se tocan.
# - **`MetadatosPagina`** sigue fuera del inventario de módulos con estilos
#   (`return null`, sin representación visual).
#
# ============================================================================
# ALCANCE EXCLUIDO, EXPLÍCITO (`project-spec.md` → «Qué NO entra»)
# ============================================================================
# 1. **Ningún dato ni contenido del prototipo de referencia**: ni sus 12
#    servicios, ni sus 6 profesionales con colegiaciones, ni su número de
#    registro sanitario, ni su valoración de Google, ni sus teléfonos, ni su
#    servicio de urgencias 24 h. Se toma **solo la arquitectura visual**. La
#    única fuente de contenido es `docs/datos-galapavet.md` y `src/data/`.
#    Que Galapavet tenga 5 servicios y 2 profesionales, y no 12 y 6, **no es un
#    hueco: es lo correcto**.
# 2. **Ningún color del prototipo** (Decisión 8). Todo rol nuevo se deriva de
#    los tres hexadecimales de marca.
# 3. **Fotografías del equipo.** `src/data/equipo.ts` no declara campo de
#    imagen y `Equipo.test.tsx:184` exige cero `img` en la sección. Poner caras
#    de banco junto a los nombres de dos personas reales sería suplantación.
# 4. **Imágenes en Servicios y en el listado del blog**, prohibidas por prueba
#    (`Servicios.test.tsx:402`, `PaginaBlog.test.tsx:164`).
# 5. **Rediseño de la interacción**: el FAQ sigue siendo
#    `<button aria-expanded aria-controls>`; las tarjetas de blog y campañas
#    siguen siendo `<Link>` y no vuelven a `<button>`.
# 6. **Iconografía a medida, ilustración original y animación decorativa
#    nueva** más allá de las transiciones funcionales de la Decisión 31.
# 7. **Manifiesto PWA** (exigiría un icono de 512×512 y por tanto el vector que
#    aún no tenemos).
# 8. **El `logo`/`image` del JSON-LD**: ampliaría el contrato de
#    `seo_estructura` (feature 15, ya `done`). Anotado, no hecho de tapadillo.
#
# ============================================================================
# PENDIENTES (a quién le toca fijar cada uno)
# ============================================================================
# 1. **La tabla completa de roles de color de `lima`, `verde` y `noche`.** Solo
#    hay punto de partida verificado (`noche`: superficie `#1A1A1A` con blanco
#    encima 17,40 y lima encima 9,22; acento suave `#1B1E04` = negro + 15 %
#    lima, con lima encima 9,01; acento tinta = lima `#B4C718`, 11,12 sobre
#    negro; borde de control `#737373`, 4,43 sobre negro y 3,67 sobre
#    `#1A1A1A`. `lima` `#F8F9E8` y `verde` `#F0F4F1` admiten los valores de
#    `marca` con margen: morado sobre `#F8F9E8` = 8,57 y sobre `#F0F4F1` =
#    8,22). **Le toca al `tdd_craftsman`**, con la misma puerta de contraste de
#    @s5, nunca a ojo. @s2 exige que los 17 tokens existan en las 4 variantes;
#    @s5 exige que la matriz pase en las 4. Los hexadecimales concretos de las
#    tres variantes no se fijan aquí.
# 2. **El techo de peso del CSS servido en `dist/`.** No está fijado en ningún
#    sitio del repositorio (hoy son 124 reglas, cifra de diagnóstico, no un
#    presupuesto). **Le toca al `tdd_craftsman`**: mide el primer `dist/` verde
#    y escribe el número a mano como literal del contrato de @s49, que a partir
#    de ahí funciona como trinquete anti-regresión. El techo de las fuentes SÍ
#    está fijado y medido: 69 224 B (@s22).
# 3. **El ancho máximo del contenedor de contenido.** El prototipo usa 1220 px,
#    pero la Decisión 24 solo autoriza tomar su ARQUITECTURA, no sus números, y
#    1220 no está verificado como valor de este proyecto. @s45 exige la
#    propiedad estructural (que exista **un solo** ancho máximo compartido por
#    las 6 rutas y que el contenido no llegue al borde en una ventana ancha);
#    **el valor concreto lo fija el `tdd_craftsman`**.
# 4. **Los pasos concretos de radio, sombra, ancho de borde y altura de
#    control.** El estudio fija CUÁNTOS hacen falta (5 radios, 2 sombras,
#    2 anchos de borde, 3 alturas de control —
#    `progress/estudio_diseno_referencia.md` §3.1-3.4), no sus valores. Los
#    valores los fija el `tdd_craftsman` sobre las escalas ya existentes; los
#    dos tokens de sombra sí quedan exigidos por @s1 porque los `rgba()` están
#    prohibidos en los `.module.scss`.
# 5. **El parque de navegadores objetivo** (PREGUNTA ABIERTA 2 del spec). **NO
#    VERIFICADO** y no declarado en ningún sitio del repositorio. Afecta a
#    `color-mix(in srgb, …)`, `backdrop-filter` (la cabecera translúcida: **sin
#    soporte queda translúcida e ilegible**), `text-wrap: pretty` e
#    `interpolate-size: allow-keywords`. **Debe fijarlo el humano** antes de que
#    el `tdd_craftsman` los use; mientras no esté fijado, cada uno lleva su
#    respaldo sólido. Ningún escenario de este fichero depende de ellos.
# 6. **`-webkit-font-smoothing: antialiased`** (PREGUNTA ABIERTA 3). No está
#    estandarizada, solo funciona en macOS y adelgaza el texto. Se decide **con
#    la fuente ya instalada y mirándolo**; por defecto, no se pone.
# 7. **`og:image` relativo contra la especificación de Open Graph** (PREGUNTA
#    ABIERTA 1). `MetadatosPagina.tsx:18` emite una ruta relativa y
#    `MetadatosPagina.test.tsx:82-83` la EXIGE relativa, pero <https://ogp.me/>
#    define el tipo `URL` como absoluta. Es una contradicción real entre el
#    contrato escrito y el estándar. **No se arregla a escondidas dentro de esta
#    feature**: exige enmendar un escenario de `seo_estructura` (feature 15, ya
#    `done`) y conocer el dominio final de publicación. **Le toca al
#    `craftsman_lead`.** @s29 solo exige que el fichero exista, responda 200 y
#    mida 1200×630.
# 8. **`favicon.svg`.** No se puede derivar un SVG fiel de un raster de 201×201
#    con degradados y solapes (el verde `#48704B` nace de la superposición
#    lima/morado, `docs/datos-galapavet.md:138`). **Camino A: pedirle el vector
#    al cliente — le toca al humano.** Hasta entonces, juego raster (@s28) y el
#    `<link>` del SVG comentado. Límite duro anotado: un icono de 512×512 de
#    manifiesto PWA exige sí o sí el vector.
# 9. **Peso real de `chromium --only-shell` en disco** (PREGUNTA ABIERTA 4).
#    **NO VERIFICADO**: el Chromium completo mide 416 MB medidos en esta
#    máquina; el shell headless será menor. Solo afecta al coste, no al diseño.
# 10. **Las 24 fotografías de banco son contenido de demostración** y deben
#    sustituirse por material propio del cliente antes de publicar, en el orden
#    de urgencia de `progress/plan_imagenes.md` §7 (galería primero: rotula
#    nombres propios y episodios clínicos). **Le toca al humano con el
#    cliente.** Los avisos de demo que ya hay en pantalla **no se quitan**.
# 11. **Las cursivas de DM Sans** (+39 712 B medidos) solo se añaden si el
#    diseño final las usa. Outfit no publica cursiva. Hoy no se sirven, y @s22
#    lo fija con su techo de peso.
# 12. **Lectura de los dos tokens de sombra desde el texto de tokens.**
#    `leerTokenDeVariante` (`src/lib/diseno/tokensColor.ts:50-58`) solo acepta
#    hexadecimales de 6 dígitos, así que no puede leer un `rgba()`. **Le toca al
#    `tdd_craftsman`** extender el lector (o añadir uno hermano) para que @s1 y
#    @s2 puedan comprobar `--sombra-reposo` y `--sombra-elevada`; y recordar que
#    `extraerBloqueDeVariante` usa `[^}]*`, así que **un bloque de variante no
#    puede contener llaves anidadas**.
# ============================================================================

Feature: Identidad visual: que la web de Galapavet se vea, y que verse bien sea comprobable
  Como cliente de Galapavet quiero que mi web tenga tipografía, color, ritmo,
  imágenes y foco de un sitio terminado, y como equipo del proyecto quiero que
  esa capa visual la vigile un navegador real sobre el artefacto de producción,
  para que «712 tests en verde» no pueda volver a convivir con un sitio que se
  sirve sin una sola declaración de `font-family`.

  # ---------------------------------------------------------------------------
  # A. EL SISTEMA COMPLETO DE ROLES DE COLOR
  #    Herramienta: módulo puro + Vitest sobre el TEXTO REAL de `_tokens.scss`.
  # ---------------------------------------------------------------------------

  @s1
  Scenario: El inventario de roles del sistema de color es exactamente los 17 tokens enumerados
    Given un literal escrito a mano con los 17 nombres de token del sistema de color: "--color-fondo", "--color-fondo-alterno", "--color-superficie", "--color-superficie-elevada", "--color-tinta", "--color-texto", "--color-texto-suave", "--color-primario", "--color-primario-fuerte", "--color-sobre-primario", "--color-acento-tinta", "--color-acento-suave", "--color-borde-control", "--color-borde", "--color-foco", "--sombra-reposo" y "--sombra-elevada"
    And esta verificación se ejecuta como MÓDULO PURO en Vitest, mordible por StrykerJS, porque es un inventario declarado
    When se consulta el inventario de roles del sistema de color del proyecto
    Then el inventario contiene exactamente esos 17 nombres
    And el inventario no contiene ningún nombre que no esté en ese literal
    And el recuento de roles de color es exactamente 15 y el de roles de sombra exactamente 2
    And ese literal está escrito a mano y no se obtiene del inventario que comprueba

  @s2
  Scenario: Los 17 tokens están declarados en las 4 variantes y ninguno se hereda
    Given el texto real de "src/styles/_tokens.scss" y los 4 identificadores de variante ya fijados por selector_paleta: "marca", "lima", "verde" y "noche"
    And esta verificación se ejecuta leyendo el TEXTO REAL del fichero con "?raw" en Vitest, porque jsdom desactiva los CSS Modules y solo ese texto es el que se compila de verdad
    When se busca cada uno de los 17 tokens del inventario dentro del bloque de cada una de las 4 variantes
    Then los 17 tokens están declarados en las 4 variantes
    And el recuento de pares (variante, token) efectivamente comprobados es exactamente 68
    And un token declarado en "marca" y ausente en "noche" hace fallar la comprobación, en vez de heredarse en silencio
    And el informe nombra qué token falta en qué variante cuando falla

  @s3
  Scenario: Los 12 roles nuevos de la variante "marca" valen exactamente los hexadecimales derivados y verificados
    Given el texto real de los tokens de la variante "marca"
    And esta verificación se ejecuta leyendo el TEXTO REAL del fichero con "?raw" en Vitest
    When leo el valor declarado de cada rol nuevo de esa variante
    Then "--color-fondo-alterno" vale exactamente "#F4EEF3"
    And "--color-superficie" vale exactamente "#FFFFFF"
    And "--color-superficie-elevada" vale exactamente "#FAF6F9"
    And "--color-tinta" vale exactamente "#531C4B"
    And "--color-texto-suave" vale exactamente "#925389"
    And "--color-primario" vale exactamente "#77286B"
    And "--color-primario-fuerte" vale exactamente "#6B2460"
    And "--color-sobre-primario" vale exactamente "#FFFFFF"
    And "--color-acento-tinta" vale exactamente "#48704B"
    And "--color-acento-suave" vale exactamente "#F6F8E3"
    And "--color-borde-control" vale exactamente "#A06997"
    And "--color-borde" vale exactamente "#DDC9DA"
    And los tres roles ya fijados por sistema_de_diseno_visual.feature @s2 ("--color-fondo" #FFFFFF, "--color-texto" #77286B, "--color-foco" #77286B) siguen valiendo lo mismo y no se retocan

  @s4
  Scenario: Cada rol nuevo de "marca" es una mezcla en sRGB de un color de marca con blanco o con negro puro
    Given los tres hexadecimales de marca ya verificados en src/lib/tokens.ts: morado "#77286B", lima "#B4C718" y verde profundo "#48704B"
    And esta verificación se ejecuta como MÓDULO PURO en Vitest, mordible por StrykerJS, porque es una derivación aritmética de valores
    When se recalcula canal a canal, con redondeo estándar, cada mezcla declarada en la tabla de derivaciones
    Then blanco mezclado con un 8% de morado da exactamente "#F4EEF3"
    And blanco mezclado con un 4% de morado da exactamente "#FAF6F9"
    And morado mezclado con un 30% de negro da exactamente "#531C4B"
    And morado mezclado con un 20% de blanco da exactamente "#925389"
    And morado mezclado con un 10% de negro da exactamente "#6B2460"
    And blanco mezclado con un 12% de lima da exactamente "#F6F8E3"
    And blanco mezclado con un 70% de morado da exactamente "#A06997"
    And blanco mezclado con un 25% de morado da exactamente "#DDC9DA"
    And cada uno de esos ocho resultados coincide con el valor que el fichero de tokens declara para ese rol

  @s5
  Scenario: La matriz de uso de la variante "marca" alcanza su mínimo WCAG en todos sus pares
    Given los valores de los roles leídos del texto real de los tokens de la variante "marca", nunca duplicados a mano
    And esta verificación se ejecuta como MÓDULO PURO en Vitest reutilizando calcularRatioContraste y esAptoParaUso de src/lib/contraste.ts, ya probadas al 100% por tokens_marca.feature
    When se calcula el ratio de cada par (color, fondo, uso) de la matriz de uso de esa variante
    Then el ratio de la tinta sobre el fondo, redondeado a dos decimales, es 12.84 y alcanza el mínimo de texto normal
    And el ratio de la tinta sobre el fondo alterno, redondeado a dos decimales, es 11.23
    And el ratio del texto sobre el fondo alterno, redondeado a dos decimales, es 7.99
    And el ratio del texto suave sobre el fondo, redondeado a dos decimales, es 5.50
    And el ratio del texto suave sobre el fondo alterno, redondeado a dos decimales, es 4.81 y sigue siendo mayor o igual que 4.5
    And el ratio del texto sobre la superficie elevada, redondeado a dos decimales, es 8.53
    And el ratio del color sobre primario sobre el primario, redondeado a dos decimales, es 9.13
    And el ratio del acento tinta sobre el acento suave, redondeado a dos decimales, es 5.27
    And el ratio del acento tinta sobre el fondo alterno, redondeado a dos decimales, es 4.97
    And ningún par de la matriz queda por debajo del mínimo que su propio uso declara
    And el recuento de pares efectivamente evaluados es mayor que 0

  @s6
  Scenario: El borde de control alcanza 3:1 contra las dos superficies sobre las que se dibuja
    Given los valores reales de "--color-borde-control", "--color-fondo" y "--color-fondo-alterno" de la variante "marca"
    And esta verificación se ejecuta como MÓDULO PURO en Vitest, porque es un cálculo de ratios
    When se calcula el ratio del borde de control contra cada una de las dos superficies
    Then el ratio contra el fondo, redondeado a dos decimales, es 4.23
    And el ratio contra el fondo alterno, redondeado a dos decimales, es 3.70
    And ambos ratios son mayores o iguales que 3, el mínimo que SC 1.4.11 exige cuando el borde es lo único que identifica el control
    And ese umbral 3 está escrito a mano en el escenario y no se obtiene del valor que comprueba

  @s7
  Scenario: El borde decorativo nunca se declara como identificador de un control
    Given el valor real de "--color-borde" de la variante "marca" y la matriz de uso de esa variante
    And esta verificación se ejecuta como MÓDULO PURO en Vitest, porque combina un cálculo de ratio con una consulta al catálogo declarado
    When se calcula su ratio contra el fondo y se busca el rol en la matriz de uso
    Then el ratio contra el fondo, redondeado a dos decimales, es 1.56
    And ese ratio es menor que 3
    And ningún par de la matriz de uso declara "--color-borde" con el uso "componente de interfaz o borde de foco"
    And ese rol es exactamente la razón por la que el sistema separa borde decorativo de borde de control, en vez de fundirlos en uno como hace el prototipo de referencia a 1.30:1

  @s8
  Scenario: El estado de reposo del botón primario oscurece al pasar el puntero y por tanto mejora el contraste
    Given los valores reales de "--color-primario", "--color-primario-fuerte" y "--color-sobre-primario" de la variante "marca"
    And esta verificación se ejecuta como MÓDULO PURO en Vitest, porque compara dos ratios calculados
    When se calcula el ratio del color sobre primario contra cada uno de los dos fondos de botón
    Then el ratio contra el primario, redondeado a dos decimales, es 9.13
    And el ratio contra el primario fuerte, redondeado a dos decimales, es 10.26
    And el ratio del estado con el puntero encima es estrictamente mayor que el del estado de reposo
    And ese es el motivo por el que el hover usa un token propio y no un filtro de brillo, que aclararía el morado y bajaría el contraste

  @s9
  Scenario: En la variante "noche" el morado de marca no hace de texto, ni de borde de control, ni de foco
    Given los valores reales de los roles de la variante "noche" y el morado de marca "#77286B"
    And esta verificación se ejecuta como MÓDULO PURO en Vitest, porque combina un cálculo de ratio con una consulta a los valores declarados
    When se calcula el ratio del morado de marca contra el fondo de esa variante y se leen los roles que llevan texto o identifican controles
    Then el ratio calculado, redondeado a dos decimales, es 2.30
    And ese ratio es menor que 3
    And ni "--color-texto", ni "--color-tinta", ni "--color-texto-suave", ni "--color-borde-control", ni "--color-foco" de la variante "noche" valen "#77286B"
    And esa consecuencia mecánica ya la predijeron tokens_marca.feature y selector_paleta.feature y la cerró sistema_de_diseno_visual.feature @s8: aquí se cumple, no se reabre

  @s10
  Scenario: Con la matriz de uso vacía la puerta de contraste del sistema de color falla cerrada
    Given una matriz de uso de roles de color sin ninguna entrada
    And esta verificación se ejecuta como MÓDULO PURO en Vitest, mordible por StrykerJS
    When se ejecuta la puerta de contraste del sistema de color
    Then el recuento de pares efectivamente evaluados es 0
    And el veredicto es suspenso
    And el informe declara que no se evaluó ningún par
    And el veredicto no es aprobado pese a que el recuento de pares que incumplen también sea 0

  @s11
  Scenario: Los cuatro roles descartados no entran en el sistema por ninguna puerta
    Given el texto real de "src/styles/_tokens.scss" y el texto real de los ficheros de estilos del inventario de módulos
    And esta verificación se ejecuta leyendo el TEXTO REAL de los ficheros con "?raw" en Vitest
    When se busca en todos ellos cualquier declaración o uso de un rol de urgencia, de un primario fuerte sin uso o de un acento sin tinta
    Then no existe ningún token cuyo nombre contenga "urgencia" ni "urg"
    And no existe ningún token llamado "--color-acento" a secas, distinto de "--color-acento-tinta" y "--color-acento-suave"
    And "--color-primario-fuerte" está declarado y además se usa al menos una vez en algún fichero de estilos del inventario
    And el recuento de ficheros efectivamente inspeccionados es mayor que 0
    And un color de urgencias reintroduciría por la puerta de atrás el servicio de urgencias 24 h que la Decisión 2 suprimió y que Galapavet no presta

  # ---------------------------------------------------------------------------
  # B. LA CAPA BASE DEL DOCUMENTO (`src/styles/global.scss`)
  #    Herramienta: lectura del TEXTO REAL con "?raw" + Vitest.
  # ---------------------------------------------------------------------------

  @s12
  Scenario: Existe una hoja global del documento y se importa exactamente una vez, desde el punto de entrada
    Given el árbol de ficheros del proyecto y el texto real de "src/main.tsx"
    And esta verificación se ejecuta leyendo el TEXTO REAL de los ficheros con "?raw" en Vitest, porque afirma que una declaración existe
    When se busca la hoja global y sus importaciones en todo "src/"
    Then existe el fichero "src/styles/global.scss"
    And "src/main.tsx" lo importa exactamente una vez
    And ningún otro fichero de "src/" lo importa
    And ningún fichero "<Nombre>.module.scss" declara reglas para "html", para "body" ni para "#root", porque la salud del documento no puede depender de que un componente concreto se monte

  @s13
  Scenario: La capa base declara las nueve familias de reglas del reset, cada una justificada
    Given el texto real de "src/styles/global.scss"
    And un literal escrito a mano con las nueve familias de reglas de la Decisión 29
    And esta verificación se ejecuta leyendo el TEXTO REAL del fichero con "?raw" en Vitest
    When se busca cada familia de reglas en el texto
    Then declara "box-sizing: border-box" alcanzando "*", "*::before" y "*::after"
    And declara "margin: 0" para "body"
    And anula el margen de bloque de los encabezados, "p", "blockquote", "figure", "dl" y "dd"
    And declara "font: inherit" y "color: inherit" para "input", "button", "textarea" y "select"
    And declara "display: block" y "max-width: 100%" para "img", "picture", "video", "canvas" y "svg"
    And declara para "body" a la vez "min-height: 100svh", "line-height: 1.5", el fondo tomado de "var(--color-fondo)", el color tomado de "var(--color-texto)" y la familia tomada de la variable de tipografía de texto
    And declara "-webkit-text-size-adjust: 100%" para "html"
    And declara "isolation: isolate" para "#root"
    And declara "text-wrap: balance" en los titulares y "text-wrap: pretty" en "p" y "li", y no declara "text-wrap: pretty" sobre "body"
    And el recuento de familias efectivamente comprobadas es exactamente 9

  @s14
  Scenario: El desplazamiento hasta un ancla reserva sitio para la cabecera fija sin repetir su altura a mano
    Given el texto real de "src/styles/global.scss" y el texto real de "src/components/Cabecera.module.scss"
    And esta verificación se ejecuta leyendo el TEXTO REAL de los ficheros con "?raw" en Vitest
    When se lee la declaración de "scroll-padding-top" de "html"
    Then "html" declara "scroll-padding-top"
    And su valor se calcula a partir de la misma variable que dimensiona la altura de la cabecera, no de un número escrito a mano
    And esa misma variable es la que la maquetación de la cabecera usa para su propia altura
    And esta regla es la técnica suficiente C43 del W3C para SC 2.4.11 Focus Not Obscured (Minimum), nivel AA, no una corrección cosmética

  @s15
  Scenario: El desplazamiento suave se activa por opt-in y nunca se declara fuera de la consulta de movimiento
    Given el texto real de "src/styles/global.scss"
    And esta verificación se ejecuta leyendo el TEXTO REAL del fichero con "?raw" en Vitest, siguiendo la profundidad de llaves línea a línea igual que hace la puerta de movimiento ya existente
    When se busca cada declaración de "scroll-behavior" del fichero
    Then toda declaración de "scroll-behavior: smooth" está contenida dentro de un bloque "@media (prefers-reduced-motion: no-preference)"
    And ninguna declaración de "scroll-behavior: smooth" vive fuera de ese bloque
    And "scroll-behavior" se declara sobre "html" y no sobre "body", porque sobre "body" no se propaga al viewport
    And el bloque "@media (prefers-reduced-motion: reduce)" anula la duración de animación y de transición con "0.01ms" y no con "0", para que "transitionend" y "animationend" sigan disparándose

  @s16
  Scenario: La escala de movimiento declara exactamente dos duraciones y una curva de salida
    Given un literal escrito a mano con los dos pasos de la Decisión 31: 150 milisegundos para cambios de color, borde y fondo, y 300 milisegundos para transformaciones y sombras, con curva "ease-out"
    And esta verificación se ejecuta como MÓDULO PURO en Vitest, mordible por StrykerJS, contrastado contra el texto real de los ficheros de estilos
    When se consulta la escala de movimiento declarada y se leen todas las duraciones de transición escritas en los ficheros de estilos del inventario
    Then la escala contiene exactamente los valores 150 y 300 milisegundos
    And la curva declarada es exactamente "ease-out"
    And ninguna declaración de transición de ningún fichero del inventario usa una duración que no sea uno de esos dos valores o el "0.01ms" del corte por menos movimiento
    And ninguna declaración anima la palabra clave "all"
    And ese literal está escrito a mano y no se obtiene de la escala que comprueba

  # ---------------------------------------------------------------------------
  # C. TIPOGRAFÍA AUTOALOJADA
  #    Herramientas: lectura "?raw" (@s17-@s19) y NAVEGADOR REAL (@s20-@s23).
  # ---------------------------------------------------------------------------

  @s17
  Scenario: Las dos familias se declaran con su fichero local, su rango de pesos y su subconjunto
    Given el texto real de "src/styles/global.scss"
    And esta verificación se ejecuta leyendo el TEXTO REAL del fichero con "?raw" en Vitest
    When se leen las declaraciones "@font-face" de las dos familias de marca
    Then existe una "@font-face" para "Outfit" y otra para "DM Sans"
    And ambas declaran "font-display: swap"
    And el origen de ambas es una ruta local que empieza por "/fuentes/" y termina en ".woff2", nunca una URL de "fonts.googleapis.com" ni de "fonts.gstatic.com"
    And la de "Outfit" declara el rango de pesos "100 900" y la de "DM Sans" el rango "100 1000"
    And ambas declaran "unicode-range", aunque solo se sirva el subconjunto latino, porque sin él el navegador descarga la fuente aunque la página no use ningún glifo suyo
    And la variable de tipografía de titulares nombra "Outfit" y la de texto nombra "DM Sans"

  @s18
  Scenario: Las dos familias de respaldo declaran las seis métricas ajustadas calculadas con Capsize
    Given el texto real de "src/styles/global.scss"
    And un literal escrito a mano con los seis valores de la Decisión 33
    And esta verificación se ejecuta leyendo el TEXTO REAL del fichero con "?raw" en Vitest
    When se leen las declaraciones "@font-face" de respaldo de las dos familias
    Then la de respaldo de "Outfit" declara "size-adjust: 99.8204%", "ascent-override: 100.18%" y "descent-override: 26.0468%"
    And la de respaldo de "DM Sans" declara "size-adjust: 104.531%", "ascent-override: 94.9001%" y "descent-override: 29.6563%"
    And ambas familias de respaldo aparecen en la pila de la variable de tipografía correspondiente, por detrás de la familia de marca
    And esos seis literales están escritos a mano y no se obtienen del fichero que comprueban

  @s19
  Scenario: El documento precarga exactamente las dos fuentes, con crossorigin, y nada más
    Given el texto real de "index.html"
    And esta verificación se ejecuta leyendo el TEXTO REAL del fichero en Vitest, porque "index.html" no pasa por el grafo del empaquetador para esas URL
    When se leen todas sus etiquetas de precarga
    Then existen exactamente 2 etiquetas "link" con "rel=preload" y "as=font"
    And ambas declaran "type=font/woff2" y el atributo "crossorigin", obligatorio aunque el fichero sea del mismo origen porque sin él el navegador lo descarga dos veces
    And no existe ninguna otra etiqueta de precarga en el documento
    And el documento no contiene ninguna referencia a "fonts.googleapis.com" ni a "fonts.gstatic.com"

  @s20
  Scenario: El texto del sitio real se pinta con las tipografías de marca y no con la del navegador
    Given el sitio de Galapavet construido y servido desde "dist/" con "vite build && vite preview --port 4173 --strictPort"
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, fuera del gate de Vitest y de StrykerJS, porque solo el motor de render resuelve la familia efectivamente aplicada
    When se cargan las 6 rutas del inventario y se lee la familia tipográfica computada del cuerpo y la del primer encabezado de nivel 1 de cada una
    Then la familia computada del cuerpo contiene "DM Sans" en las 6 rutas
    And la familia computada del encabezado de nivel 1 contiene "Outfit" en las 6 rutas
    And ninguna de esas familias computadas es "Times New Roman", que es lo que el sitio devolvía el 23/08/2026 antes de esta feature
    And el recuento de rutas efectivamente comprobadas es exactamente 6

  @s21
  Scenario: Los controles de formulario del sitio real también usan la tipografía de marca
    Given el sitio de Galapavet construido y servido desde "dist/"
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, porque la hoja de renderizado del agente de usuario reasigna la familia de los controles a la del sistema y solo el motor de render lo revela
    When se lee la familia tipográfica computada de cada campo de texto, área de texto, lista desplegable y botón del formulario de contacto y del chat de reserva
    Then la familia computada de cada uno de esos controles contiene "DM Sans" o "Outfit"
    And ninguno de esos controles computa una familia genérica del sistema
    And el recuento de controles efectivamente medidos es mayor que 0

  @s22
  Scenario: Los dos ficheros de fuente se sirven en local, responden 200 y no superan su techo de peso medido
    Given el sitio de Galapavet construido y servido desde "dist/"
    And un techo escrito a mano de 69224 bytes, que es la suma medida de los dos subconjuntos latinos variables (Outfit 32292 B + DM Sans 36932 B)
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, interceptando las respuestas de red, porque solo así se ve un 404 de fuente
    When se carga la portada y se recogen las respuestas de los ficheros de fuente
    Then se piden exactamente 2 ficheros ".woff2", ambos del mismo origen que la página
    And ambas respuestas tienen código de estado 200
    And la suma de los bytes de ambos ficheros es menor o igual que 69224
    And no se pide ningún fichero de fuente de un subconjunto distinto del latino ni ninguna cursiva
    And ese techo 69224 está escrito a mano en el escenario y no se obtiene de los ficheros que comprueba

  @s23
  Scenario: Si la fuente de marca no llega, el texto de respaldo ocupa el mismo alto y no salta nada
    Given el sitio de Galapavet construido y servido desde "dist/"
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, bloqueando las peticiones a "/fuentes/", porque exige comparar dos renderizados reales del mismo texto
    When se carga la portada con las fuentes de marca disponibles y, por separado, con sus peticiones bloqueadas, y se mide el rectángulo del encabezado de nivel 1 y el del primer párrafo en ambos casos
    Then el alto medido del encabezado de nivel 1 es el mismo en ambos casos, con una tolerancia máxima de 1 píxel CSS
    And el alto medido del primer párrafo es el mismo en ambos casos, con la misma tolerancia
    And con las fuentes bloqueadas el texto sigue siendo visible desde el primer pintado, porque la declaración usa intercambio y no bloqueo

  # ---------------------------------------------------------------------------
  # D. LOS TOKENS, EFECTIVAMENTE APLICADOS AL DOCUMENTO
  #    Herramienta: NAVEGADOR REAL. Es el corazón del diagnóstico del 23/08/2026.
  # ---------------------------------------------------------------------------

  @s24
  Scenario: El cuerpo del documento deja de arrastrar el margen por defecto del navegador
    Given el sitio de Galapavet construido y servido desde "dist/"
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, porque el margen de 8 px lo aporta la hoja del agente de usuario y jsdom no la aplica
    When se carga cada una de las 6 rutas del inventario y se lee el margen computado del cuerpo del documento
    Then los cuatro márgenes computados del cuerpo son exactamente 0 píxeles en las 6 rutas
    And el fondo computado del cuerpo no es transparente en ninguna de las 6 rutas
    And el recuento de rutas efectivamente comprobadas es exactamente 6

  @s25
  Scenario: En las 4 variantes el documento pinta de verdad el fondo y el texto de la variante activa
    Given el sitio de Galapavet construido y servido desde "dist/"
    And los valores de "--color-fondo" y "--color-texto" leídos del texto real del fichero de tokens para cada una de las 4 variantes, nunca duplicados a mano en la prueba
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, porque exige el valor de una custom property efectivamente resuelto y aplicado por el motor de render
    When se elige, una por una, cada una de las 4 variantes desde el panel del selector de paleta ya implementado
    Then el color de fondo computado del cuerpo del documento equivale al "--color-fondo" declarado para esa variante, en las 4
    And el color de texto computado del cuerpo del documento equivale al "--color-texto" declarado para esa variante, en las 4
    And el recuento de variantes efectivamente verificadas en el navegador es exactamente 4
    And esto ejecuta @s12 de sistema_de_diseno_visual.feature, que esta feature no redefine

  @s26
  Scenario: La landing tiene ritmo: sus secciones no comparten todas el mismo fondo
    Given el sitio de Galapavet construido y servido desde "dist/"
    And las 8 secciones ancladas de la landing en el orden ya fijado por ensamblaje_landing: "#inicio", "#servicios", "#equipo", "#reservar", "#galeria", "#contacto" y "#faq", más la sección de campañas sin ancla propia
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, porque el bandeado solo existe como color efectivamente pintado
    When se lee el color de fondo computado de cada una de esas 8 secciones
    Then existen al menos 2 colores de fondo computados distintos entre las 8 secciones
    And ninguna sección tiene fondo transparente
    And dos secciones consecutivas cualesquiera no comparten el mismo color de fondo más de dos veces seguidas
    And el recuento de secciones efectivamente medidas es exactamente 8

  # ---------------------------------------------------------------------------
  # E. IMÁGENES LOCALES Y LA CARPETA `public/`
  #    Herramienta: NAVEGADOR REAL. Hoy fallarían los 26 huecos.
  # ---------------------------------------------------------------------------

  @s27
  Scenario: No hay ni una sola imagen rota en ninguna ruta del sitio real
    Given el sitio de Galapavet construido y servido desde "dist/"
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, porque "naturalWidth" solo existe cuando el navegador ha decodificado el fichero de verdad
    When se cargan las 6 rutas del inventario, se espera a que la red quede en reposo y se lee el ancho natural de cada imagen del documento
    Then el ancho natural de cada imagen es mayor que 0 en las 6 rutas
    And el recuento de imágenes efectivamente medidas es mayor que 0
    And el informe nombra la ruta y el origen de cada imagen cuyo ancho natural sea 0
    And ninguna imagen tiene un origen que empiece por "http://", por "https://" o por "//", ni que contenga la cadena del banco de imágenes

  @s28
  Scenario: El icono del sitio responde y deja de dar 404
    Given el sitio de Galapavet construido y servido desde "dist/"
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, pidiendo los ficheros directamente al servidor, porque un icono en 404 no aparece en el árbol del documento
    When se piden los ficheros de icono declarados por el documento
    Then la respuesta de "/favicon.ico" tiene código de estado 200
    And la respuesta de "/favicon-32.png" tiene código de estado 200
    And la respuesta de "/apple-touch-icon.png" tiene código de estado 200 y el fichero mide 180 por 180 píxeles
    And ninguna etiqueta activa de icono del documento apunta a un fichero que devuelva 404
    And mientras no exista el vector del cliente, la etiqueta que declara el icono vectorial permanece comentada en vez de apuntar a un fichero inexistente

  @s29
  Scenario: La imagen de compartición existe, tiene el tamaño que exigen las redes y no es una foto de banco
    Given el sitio de Galapavet construido y servido desde "dist/"
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, pidiendo el fichero directamente al servidor y midiéndolo
    When se lee la ruta declarada en la etiqueta de imagen de Open Graph y se pide ese fichero
    Then la respuesta tiene código de estado 200
    And la imagen mide exactamente 1200 por 630 píxeles
    And el fichero servido es un PNG, no un WebP, porque la documentación oficial de Meta no declara qué formatos acepta y el WebP queda NO VERIFICADO en sus rastreadores
    And el fichero no procede del banco de imágenes: se compone con el logotipo real sobre el morado de marca

  @s30
  Scenario: Cada imagen declara sus dimensiones y la carga no desplaza el contenido
    Given el sitio de Galapavet construido y servido desde "dist/"
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, porque el desplazamiento de contenido solo ocurre con layout real
    When se cargan las 6 rutas del inventario midiendo el desplazamiento acumulado del contenido durante la carga
    Then cada imagen del documento declara a la vez un atributo de ancho y uno de alto
    And cada imagen salvo la del encabezado principal declara carga diferida y decodificación asíncrona
    And la imagen del encabezado principal, si existe, declara carga inmediata y prioridad de obtención alta, por ser el elemento de mayor contenido pintado
    And el desplazamiento acumulado del contenido durante la carga de cada ruta es menor o igual que 0.1
    And el recuento de rutas efectivamente medidas es exactamente 6

  @s31
  Scenario: Una imagen que aún no ha cargado reserva su hueco en vez de colapsar
    Given el sitio de Galapavet construido y servido desde "dist/"
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, bloqueando las peticiones a "/img/", porque exige medir el rectángulo de un elemento sin contenido decodificado
    When se carga la portada con las imágenes bloqueadas y se mide el rectángulo de cada imagen del documento
    Then el alto medido de cada hueco es mayor que 0
    And la relación entre el ancho y el alto medidos de cada hueco coincide con la relación de aspecto que su propia maquetación declara, con una tolerancia máxima de 1 píxel CSS
    And el color de fondo computado de cada hueco equivale al "--color-fondo-alterno" de la variante activa
    And el recuento de huecos efectivamente medidos es mayor que 0

  # ---------------------------------------------------------------------------
  # F. RED LIMPIA: CERO TERCEROS, CERO 404, CERO RUIDO EN CONSOLA
  #    Herramienta: NAVEGADOR REAL. Es justo lo que ninguna prueba de jsdom veía.
  # ---------------------------------------------------------------------------

  @s32
  Scenario: Cargar cualquier ruta no dispara ni una sola petición a un tercero
    Given el sitio de Galapavet construido y servido desde "dist/"
    And la única excepción declarada del proyecto: el mapa embebido en un marco de la sección de contacto
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, interceptando TODAS las peticiones de red, porque una petición diferida solo se dispara en un navegador de verdad
    When se cargan las 6 rutas del inventario, se espera a que la red quede en reposo y se recogen los dominios de todas las peticiones salidas del documento
    Then ninguna petición sale hacia "fonts.googleapis.com"
    And ninguna petición sale hacia "fonts.gstatic.com"
    And ninguna petición sale hacia el dominio del banco de imágenes
    And el único dominio distinto del origen de la página al que sale alguna petición es el del mapa embebido ya declarado
    And el recuento de peticiones efectivamente inspeccionadas es mayor que 0
    And cada imagen del visitante se sirve desde el propio origen, porque una imagen remota filtra su dirección IP a un tercero

  @s33
  Scenario: Ninguna ruta produce una respuesta de error al cargarse
    Given el sitio de Galapavet construido y servido desde "dist/"
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, recogiendo el código de estado de cada respuesta, porque jsdom no pide ni un solo recurso estático
    When se cargan las 6 rutas del inventario y se recogen todas las respuestas del mismo origen
    Then ninguna respuesta tiene un código de estado mayor o igual que 400
    And el recuento de respuestas efectivamente inspeccionadas es mayor que 0
    And el informe nombra la ruta, la URL y el código de cada respuesta de error cuando falla

  @s34
  Scenario: Ninguna ruta escribe un error ni un aviso en la consola del navegador
    Given el sitio de Galapavet construido y servido desde "dist/"
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, escuchando los mensajes de consola y las excepciones no capturadas
    When se cargan las 6 rutas del inventario y se interactúa con el selector de paleta, con un desplegable de servicios y con un ítem del acordeón de preguntas frecuentes
    Then el recuento de mensajes de consola de nivel error es exactamente 0
    And el recuento de mensajes de consola de nivel aviso es exactamente 0
    And el recuento de excepciones no capturadas es exactamente 0
    And esto cumple el Invariante 7 del proyecto: cero errores y cero avisos también en la consola del navegador

  # ---------------------------------------------------------------------------
  # G. ACCESIBILIDAD MEDIDA SOBRE EL SITIO REAL
  #    Herramientas: módulo puro (@s35) y NAVEGADOR REAL (@s36-@s41).
  # ---------------------------------------------------------------------------

  @s35
  Scenario: El análisis automático se configura con las cinco etiquetas acumulativas y sin opciones que las anulen
    Given un literal escrito a mano con las cinco etiquetas de la Decisión 39: "wcag2a", "wcag2aa", "wcag21a", "wcag21aa" y "wcag22aa"
    And esta verificación se ejecuta como MÓDULO PURO en Vitest, mordible por StrykerJS, contrastado contra el texto real del fichero de pruebas de navegador
    When se consulta la configuración declarada del análisis automático de accesibilidad
    Then la configuración declara exactamente esas cinco etiquetas
    And no declara ninguna etiqueta que no esté en ese literal
    And la configuración no usa el mecanismo de opciones, porque su propia documentación advierte de que anularía cualquier otra opción configurada, incluidas las etiquetas
    And esas cinco etiquetas se corresponden con los cinco niveles de conformidad que accesibilidad.feature @s7 ya exige
    And "wcag22aa" es imprescindible porque la regla de área táctil viene deshabilitada por defecto y es la única etiqueta que la trae

  @s36
  Scenario: El análisis automático no reporta ninguna violación en ninguna de las seis rutas del sitio real
    Given el sitio de Galapavet construido y servido desde "dist/"
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright y axe-core, porque las reglas de área táctil y de contraste exigen el layout que jsdom no calcula
    When se ejecuta el análisis automático con las cinco etiquetas sobre cada una de las 6 rutas del inventario
    Then el recuento total de violaciones es exactamente 0
    And el recuento de rutas efectivamente analizadas es exactamente 6
    And el veredicto se lee del informe del análisis y no del código de salida del proceso
    And el informe nombra el criterio y el elemento de cada violación cuando falla
    And esto ejecuta @s2 de accesibilidad.feature y @s28 de sistema_de_diseno_visual.feature, que esta feature no redefine

  @s37
  Scenario: Todo objetivo táctil del sitio real alcanza el mínimo medido con su rectángulo real
    Given el sitio de Galapavet construido y servido desde "dist/"
    And un umbral escrito a mano de 24 por 24 píxeles CSS, que es el que fija SC 2.5.8 Target Size (Minimum), nivel AA
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, porque exige el rectángulo delimitador que solo produce el layout
    When se mide el rectángulo delimitador de cada enlace, botón, campo y control interactivo visible de cada una de las 6 rutas
    Then el ancho medido de cada objetivo es mayor o igual que 24 píxeles CSS
    And el alto medido de cada objetivo es mayor o igual que 24 píxeles CSS
    And los objetivos que no lo alcancen solo se aceptan si encajan en una de las cinco excepciones normativas del criterio, y el informe nombra cuál
    And el recuento de objetivos efectivamente medidos es mayor que 0
    And ese umbral 24 está escrito a mano en el escenario y no se obtiene del valor que comprueba
    And esto ejecuta @s29 de sistema_de_diseno_visual.feature, que esta feature no redefine

  @s38
  Scenario: El indicador de foco del sitio real tiene perímetro y contraste suficientes entre sus dos estados
    Given el sitio de Galapavet construido y servido desde "dist/"
    And un umbral escrito a mano de 2 píxeles CSS de perímetro y 3 de ratio, que es el de SC 2.4.13 Focus Appearance, criterio de nivel AAA y no AA, que este proyecto decide cumplir igualmente y rotular como AAA
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, porque exige píxeles efectivamente renderizados en dos estados distintos
    When cada control interactivo de cada una de las 6 rutas recibe el foco por teclado
    Then el área del indicador de foco de cada control es al menos la de un perímetro de 2 píxeles CSS alrededor del control sin foco
    And el ratio de contraste calculado entre los mismos píxeles en estado con foco y sin foco es mayor o igual que 3
    And ningún control declara la supresión del contorno de foco del navegador sin sustituirlo por un indicador propio
    And el recuento de controles efectivamente comprobados es mayor que 0
    And esos umbrales 2 y 3 están escritos a mano en el escenario y no se obtienen de los valores que comprueban
    And esto ejecuta @s30 y @s31 de sistema_de_diseno_visual.feature y la primera mitad de @s18 de accesibilidad.feature

  @s39
  Scenario: El anillo de foco contrasta con los dos fondos que tiene al lado, no solo con uno
    Given el sitio de Galapavet construido y servido desde "dist/"
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, porque el fondo adyacente real de un control depende de sobre qué superficie esté maquetado
    When cada control interactivo de cada una de las 6 rutas recibe el foco por teclado y se leen los colores computados del propio control y de la superficie que lo contiene
    Then el ratio del color del anillo de foco contra el fondo del propio componente es mayor o igual que 3
    And el ratio del color del anillo de foco contra el fondo de la superficie que lo contiene es mayor o igual que 3
    And ambos ratios se calculan con la fórmula real de src/lib/contraste.ts, la misma que ya aprobó tokens_marca.feature
    And el recuento de controles efectivamente comprobados es mayor que 0
    And esto ejecuta la segunda mitad de @s18 de accesibilidad.feature

  @s40
  Scenario: Al tabular por la página entera ningún control enfocado queda tapado por la cabecera fija
    Given el sitio de Galapavet construido y servido desde "dist/"
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, escrita a mano porque NO existe ninguna regla de axe para SC 2.4.11 Focus Not Obscured (Minimum)
    When se recorre con la tecla de tabulación toda la secuencia de controles enfocables de cada una de las 6 rutas, de principio a fin
    Then en cada parada, al menos parte del rectángulo del control enfocado queda fuera del rectángulo de la cabecera fija
    And en cada parada, al menos parte del rectángulo del control enfocado queda dentro del área visible de la ventana
    And ninguna parada queda íntegramente por debajo del borde inferior de la cabecera fija
    And el recuento de paradas efectivamente recorridas es mayor que 0 y el recorrido termina en vez de dar vueltas indefinidamente
    And esto ejecuta @s17 de accesibilidad.feature y @s32 de sistema_de_diseno_visual.feature

  @s41
  Scenario: La jerarquía de encabezados de cada ruta es correcta y sin saltos
    Given el sitio de Galapavet construido y servido desde "dist/"
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, sobre el árbol que el enrutador monta de verdad en cada ruta, porque cada ruta compone la cabecera y el pie del shell común además de su propio contenido
    When se leen, en orden de documento, todos los encabezados de cada una de las 6 rutas
    Then cada ruta contiene exactamente 1 encabezado de nivel 1
    And ningún encabezado salta más de un nivel respecto del anterior
    And ningún encabezado tiene el texto vacío
    And el recuento de rutas efectivamente comprobadas es exactamente 6

  # ---------------------------------------------------------------------------
  # H. MOVIMIENTO EN EL SITIO REAL
  #    Herramienta: NAVEGADOR REAL con la preferencia de menos movimiento activa.
  # ---------------------------------------------------------------------------

  @s42
  Scenario: Con la preferencia de menos movimiento activa no queda ninguna animación ni transición en curso
    Given el sitio de Galapavet construido y servido desde "dist/"
    And un contexto de navegador con la preferencia de movimiento reducido activada
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, porque exige interrogar el motor de animaciones con las hojas de estilo ya aplicadas
    When se carga cada una de las 6 rutas y se interactúa con el selector de paleta, con un desplegable de servicios, con un ítem del acordeón y con las flechas de la galería
    Then el recuento de animaciones en curso en el documento es exactamente 0 en las 6 rutas
    And ninguna transición se ejecuta con una duración efectiva distinta de 0.01 milisegundos
    And ningún contenido que debería estar visible queda oculto por haberse desactivado el movimiento
    And el recuento de rutas efectivamente comprobadas es exactamente 6
    And esto ejecuta @s19 de accesibilidad.feature y @s34 de sistema_de_diseno_visual.feature

  @s43
  Scenario: Con la preferencia de menos movimiento activa el desplazamiento hasta un ancla es instantáneo
    Given el sitio de Galapavet construido y servido desde "dist/"
    And un contexto de navegador con la preferencia de movimiento reducido activada
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, porque el valor efectivo de "scroll-behavior" depende de qué consulta de medios gane la cascada
    When se carga la portada y se lee el valor computado de "scroll-behavior" del elemento raíz
    Then el valor computado es exactamente "auto"
    And el mismo valor computado con la preferencia sin declarar es "smooth", lo que demuestra que la consulta de medios discrimina de verdad y no está muerta

  # ---------------------------------------------------------------------------
  # I. LAYOUT QUE NO SE ROMPE
  #    Herramienta: NAVEGADOR REAL.
  # ---------------------------------------------------------------------------

  @s44
  Scenario: En una ventana de 320 píxeles de ancho ninguna ruta desborda horizontalmente
    Given el sitio de Galapavet construido y servido desde "dist/"
    And un ancho de ventana de 320 píxeles, que es el viewport mínimo que la escala tipográfica del proyecto ya declara
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, porque el desbordamiento horizontal solo existe con layout real
    When se cargan las 6 rutas del inventario a ese ancho y se compara el ancho de desplazamiento del documento con su ancho visible
    Then el ancho de desplazamiento del documento es menor o igual que su ancho visible en las 6 rutas
    And ningún elemento del documento sobresale por el borde derecho del área visible
    And el informe nombra el elemento culpable y su rectángulo cuando falla
    And el recuento de rutas efectivamente comprobadas es exactamente 6

  @s45
  Scenario: El contenido tiene un único ancho máximo de contenedor, el mismo en las seis rutas
    Given el sitio de Galapavet construido y servido desde "dist/"
    And un ancho de ventana de 1600 píxeles, holgadamente por encima del punto de corte de 1024 ya fijado
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, porque exige medir el ancho efectivamente ocupado por el contenido
    When se mide el ancho del contenedor de contenido principal de cada una de las 6 rutas a ese ancho de ventana
    Then el ancho medido es estrictamente menor que 1600 píxeles en las 6 rutas, es decir, el contenido no se pega a los bordes de una pantalla ancha
    And el ancho medido es exactamente el mismo en las 6 rutas
    And el recuento de rutas efectivamente medidas es exactamente 6
    And el valor concreto de ese ancho máximo queda PENDIENTE del tdd_craftsman: este escenario exige que sea uno solo y compartido, no cuál es

  @s46
  Scenario: En una página corta el pie cierra la ventana en vez de quedar flotando a media altura
    Given el sitio de Galapavet construido y servido desde "dist/"
    And la ruta de página no encontrada, que es la más corta del sitio
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, porque depende de la altura real del contenido frente a la de la ventana
    When se carga esa ruta en una ventana de 1000 píxeles de alto y se mide el rectángulo del pie de página
    Then el borde inferior del pie está en el borde inferior del área visible o por debajo de él
    And entre el borde inferior del pie y el borde inferior del área visible no queda ningún hueco vacío
    And esto cierra el PENDIENTE que sistema_de_diseno_visual.feature dejó anotado sobre si el shell común necesita fichero de estilos propio

  @s47
  Scenario: Los pies de las tarjetas de una misma fila quedan alineados aunque su texto sea desigual
    Given el sitio de Galapavet construido y servido desde "dist/"
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, porque la alineación entre hermanos de una rejilla solo existe con layout real
    When se miden los rectángulos de la fila de acción de cada tarjeta de la rejilla de servicios y de la rejilla de productos de la tienda
    Then las tarjetas que comparten fila tienen su fila de acción a la misma coordenada vertical, con una tolerancia máxima de 1 píxel CSS
    And ningún texto de tarjeta queda recortado ni desbordado fuera del rectángulo de su tarjeta
    And ninguna tarjeta declara una altura fija en píxeles
    And el recuento de tarjetas efectivamente medidas es mayor que 0

  # ---------------------------------------------------------------------------
  # J. LAS PUERTAS DEL ARNÉS Y EL CIERRE DE LOS CONTRATOS HEREDADOS
  #    Herramienta: lectura del TEXTO REAL de la configuración + módulo puro.
  # ---------------------------------------------------------------------------

  @s48
  Scenario: La verificación en navegador real es una puerta propia y separada, no un peaje de cada arranque de sesión
    Given el texto real de "package.json", de "harness.config.json" y de "playwright.config.ts"
    And esta verificación se ejecuta leyendo el TEXTO REAL de los ficheros en Vitest, porque afirma qué comando ejecuta qué
    When se leen los comandos declarados del arnés y la configuración del motor de navegador
    Then existe un guion propio "test:e2e" en "package.json"
    And el comando de test del arnés no incluye ese guion, para que la verificación de entorno no exija un navegador de cientos de megas ni un build completo
    And la configuración del motor de navegador ancla su directorio de pruebas a "tests/e2e"
    And declara 0 reintentos, contradiciendo a propósito la recomendación de 2 para integración continua, porque un reintento convierte una prueba inestable en verde y esconde justo lo que esta feature existe para destapar
    And su servidor de pruebas construye y sirve "dist/" con "vite preview" en el puerto 4173, nunca el servidor de desarrollo

  @s49
  Scenario: El peso del CSS servido no supera el techo declarado
    Given el sitio de Galapavet construido y servido desde "dist/"
    And un techo de bytes escrito a mano en el contrato de la prueba
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, sumando los bytes de las respuestas de hoja de estilo
    When se carga la portada y se suman los bytes de todas las respuestas de tipo hoja de estilo
    Then la suma es menor o igual que el techo declarado
    And el techo declarado es un número mayor que 0
    And el techo está escrito a mano y no se recalcula del "dist/" que comprueba, para que funcione como trinquete contra la regresión
    And la cifra concreta del techo queda PENDIENTE del tdd_craftsman, que la fija midiendo el primer "dist/" verde

  @s50
  Scenario: La suite de navegador real declara, uno a uno, los doce escenarios heredados que ejecuta
    Given un literal escrito a mano con los doce identificadores heredados: de sistema_de_diseno_visual.feature "@s12", "@s27", "@s28", "@s29", "@s30", "@s31", "@s32" y "@s34"; y de accesibilidad.feature "@s2", "@s17", "@s18" y "@s19"
    And esta verificación se ejecuta como MÓDULO PURO en Vitest, mordible por StrykerJS, contrastado contra el texto real de los ficheros de pruebas de navegador
    When se consulta qué escenarios heredados declara ejecutar la suite de navegador real
    Then la suite declara exactamente esos doce identificadores
    And el recuento de escenarios heredados declarados es exactamente 12
    And cada uno de los doce está citado desde al menos una prueba de navegador real existente en "tests/e2e"
    And ningún identificador heredado queda declarado sin prueba que lo ejecute
    And ese literal está escrito a mano y no se obtiene de la suite que comprueba
    And esta feature EJECUTA esos doce escenarios; sus contratos siguen viviendo en la feature 21 y en la feature 19, que no se copian aquí ni se redefinen

  @s51
  Scenario: Un componente compartido nuevo entra en el inventario de módulos o la puerta falla
    Given el inventario de módulos que deben tener fichero de estilos co-localizado, ya fijado por sistema_de_diseno_visual.feature @s21 con 17 nombres
    And esta verificación se ejecuta como MÓDULO PURO en Vitest, mordible por StrykerJS
    When la maquetación introduce un componente compartido nuevo en "src/components" con representación visual propia
    Then el inventario contiene ese nombre nuevo
    And el recuento de módulos del inventario coincide con el recuento de componentes visuales de "src/components" más el de páginas de "src/pages"
    And un componente visual presente en el árbol de ficheros y ausente del inventario hace fallar la comprobación
    And "MetadatosPagina" sigue fuera del inventario, por no tener representación visual propia
