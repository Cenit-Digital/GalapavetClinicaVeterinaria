# ============================================================================
# POR QUÉ EXISTE ESTE FICHERO
# ============================================================================
# `identidad_visual` (22) y `sistema_de_diseno_visual` (21) cerraron `done` el
# 25/08/2026. Al intentar resolver el PENDIENTE 7 de `identidad_visual`
# (`og:image` debe ser una URL absoluta según OGP, hace falta el dominio
# final), el humano fijó el hosting: **GitHub Pages**, sirviendo el
# repositorio `Cenit-Digital/GalapavetClinicaVeterinaria` como sitio de
# proyecto en `https://cenit-digital.github.io/GalapavetClinicaVeterinaria/`
# (Decisiones 44-46, `project-spec.md`).
#
# `craftsman_lead` detectó, antes de tocar nada, que el proyecto no tiene
# configurado ni el `base` de Vite ni el `basename` de `BrowserRouter` — sin
# ellos el sitio se rompe en producción bajo el subpath
# `/GalapavetClinicaVeterinaria/`: los assets de un `vite build` sin `base` se
# referencian desde la raíz del dominio y dan 404; las rutas internas de
# `react-router` no coinciden con el subpath real; y GitHub Pages, al no
# reescribir nada en el servidor, devuelve su propio 404 real ante cualquier
# URL directa a una ruta interna o ante un simple refresco de página estando
# en ella — el catch-all de React Router nunca llega a ejecutarse porque el
# documento nunca se sirve. Un `tdd_craftsman` lanzado directamente para
# resolverlo se negó, correctamente: no había ninguna feature `in_progress`
# ni ningún `.feature` aprobado del que derivar tests. Este fichero formaliza
# ese contrato.
#
# Propósito medible: que la web de Galapavet, publicada en
# `https://cenit-digital.github.io/GalapavetClinicaVeterinaria/`, funcione
# exactamente igual que en local — ningún asset en 404, ninguna ruta interna
# en 404 al refrescar o al enlazar directamente, y **ni un solo test
# existente roto por el cambio** (916 tests de Vitest + 65 tests de
# Playwright heredados de `identidad_visual`, a la fecha de esta conversación).
#
# ============================================================================
# DE DÓNDE SALE CADA VALOR DE ESTE FICHERO
# ============================================================================
# - **Owner/repo/subpath**: `Cenit-Digital/GalapavetClinicaVeterinaria`,
#   verificados con `gh api` por `craftsman_lead` (Decisión 44). El subpath
#   `/GalapavetClinicaVeterinaria/` es literalmente el nombre del repositorio.
# - **El flag `--base` vive SOLO en el script `build` de `package.json`**,
#   nunca como clave `base` en `vite.config.ts` (Decisión 47): así
#   `import.meta.env.BASE_URL` sigue siendo `/` en `pnpm run dev` y en
#   `vitest run`, y ningún test ya `done` que afirme un `href` literal
#   (`Cabecera.test.tsx:79`, `PieDePagina.test.tsx:84`,
#   `CampanasPortada.test.tsx:156,171`) necesita reescribirse.
# - **`hrefDeDestino(destino, base)`**: la función pura nueva que reemplaza
#   la concatenación a mano en los 4 puntos con enlaces internos literales
#   (`Cabecera`, `PieDePagina`, `CampanasPortada`, `PaginaNoEncontrada`),
#   reutilizando `esAncla` de `Cabecera-logica.ts` (ya `done`) para no tocar
#   los destinos de tipo ancla (Decisión 48).
# - **La técnica de SPA en GitHub Pages es la de `rafgraph/spa-github-pages`**
#   (<https://github.com/rafgraph/spa-github-pages>), no una inventada
#   (Decisión 49): `public/404.html` codifica `pathname`/`search`/`hash` y
#   redirige a la raíz; un segundo script en `index.html`, ANTES de cargar el
#   módulo de la aplicación, decodifica con `history.replaceState` — mismo
#   patrón ya usado en este repositorio para scripts inline que no pueden
#   importar código: «espejado por un gemelo puro testeable»
#   (`SelectorPaleta-logica.ts`/`resolverVarianteInicial`, Decisión 8). El
#   literal `pathSegmentsToKeep = 1` es el único punto del mecanismo que no
#   necesita conocer el NOMBRE del repositorio, solo su profundidad (sitio de
#   proyecto, un único segmento de subpath).
# - **`%BASE_URL%` para las rutas de `public/` escritas dentro de
#   `index.html`** (favicon, `apple-touch-icon`, los dos `preload` de fuente):
#   Decisión 50, citando la documentación de Vite
#   (<https://vite.dev/guide/assets.html#the-public-directory>) sobre la
#   diferencia entre lo que Vite reescribe solo y lo que exige la variable de
#   sustitución a mano.
# - **Verificación en dos niveles** (Decisión 51): `vite build
#   --base=/GalapavetClinicaVeterinaria/ && vite preview
#   --base=/GalapavetClinicaVeterinaria/` sobre el `dist/` real para el
#   prefijo de los assets; tests puros + lectura `?raw` de
#   `public/404.html`/`index.html` para la lógica de redirección — **nunca
#   simulando el HTTP exacto de GitHub Pages**, porque eso no está verificado
#   (ver PENDIENTE 1, más abajo).
# - **El inventario de 65 tests de navegador real heredados**: notas de
#   cierre de `identidad_visual` (feature 22, `done`) en `feature_list.json`
#   — 8 ficheros bajo `tests/e2e/`.
# - **El recuento de 24 rutas de imagen + `og:image` (25 referencias) de la
#   enmienda del 25/08/2026 (Decisiones 52-55)**: el propio Comportamiento 2
#   de la enmienda (`project-spec.md`) las desglosa fichero a fichero —
#   `PieDePagina.tsx` (1) + `Galeria.tsx`/`galeria.ts` (6) +
#   `CampanasPortada.tsx`/`PaginaCampanas.tsx`/`campanas.ts` (3) +
#   `PaginaBlog.tsx`/`blog.ts` (6) + `PaginaTienda.tsx`/`tienda.ts` (8) = 24,
#   verificado el 25/08/2026 por `gherkin_author` con un grep en vivo del
#   literal `/img/...` sobre todo `src/**/*.{ts,tsx}` (excluidos tests) —
#   más `RUTA_IMAGEN_OPEN_GRAPH` (1) = 25. **NOTA**: el resto del texto de la
#   enmienda (Enmienda, Propósito, Casos límite 1, Criterio de aceptación 1)
#   dice «27 rutas + `og:image`, 28 referencias», una cifra que NO coincide
#   con el desglose fichero a fichero del propio documento ni con el código
#   real. Los escenarios @s18-@s24 usan el recuento verificado (24+1=25),
#   trazable al desglose y al repositorio; queda pendiente que
#   `craftsman_lead` reconcilie el texto de `project-spec.md` — mismo patrón
#   que la reconciliación de @s12 ("4"→"5") ya documentada en
#   `progress/tdd_despliegue_github_pages.md`.
#
# ============================================================================
# LAS TRES HERRAMIENTAS DE VERIFICACIÓN, Y CUÁNDO USA CADA UNA
# ============================================================================
# Mismo reparto explícito que ya usan `identidad_visual.feature` y
# `sistema_de_diseno_visual.feature`:
#
# (a) **MÓDULO PURO + Vitest, mordible por StrykerJS** (`stryker.config.json`,
#     glob `src/lib/**` + `src/**/*-logica.ts`) — la función `hrefDeDestino`
#     de la Decisión 48 y el gemelo puro de la técnica de codificación/
#     decodificación de la Decisión 49. Es el ÚNICO alcance mordible de esta
#     feature (Contrato → "Mordible por Stryker"); el resto (config de build,
#     `index.html`, `public/404.html`) queda fuera, como el resto del proyecto.
#     La enmienda del 25/08/2026 (Decisiones 52-55, @s18-@s24) NO añade
#     ninguna función nueva mordible: reutiliza literalmente `hrefDeDestino`
#     (Decisión 53), así que su cobertura de mutación sigue siendo la misma
#     suite de 16 tests ya `done`, con puntos de llamada adicionales en
#     `.tsx` (fuera del glob de mutación, igual que el resto de componentes).
# (b) **LECTURA DEL TEXTO REAL con `?raw` + Vitest** — para afirmar que una
#     declaración existe literalmente en `package.json`, `vite.config.ts`,
#     `App.tsx`, `index.html`, `public/404.html` o en los 4 componentes con
#     enlaces internos, y (desde la enmienda del 25/08/2026) en los 6
#     ficheros que pintan una imagen local y en `MetadatosPagina.tsx`. Es la
#     vía preferente para todo lo que no es cómputo.
# (c) **NAVEGADOR REAL (Playwright sobre `dist/` real)** — únicamente para el
#     prefijo de los assets y de los ficheros de `public/` bajo el subpath, y
#     (desde la enmienda) para las 24 rutas de imagen + `og:image`, y para
#     confirmar que la puerta de navegador real completa sigue en verde.
#     Igual que en `identidad_visual.feature`, mide SIEMPRE `dist/` de
#     producción, nunca el servidor de desarrollo.
#
# Reparto de los 17 escenarios originales: (a) MÓDULO PURO — @s2, @s4, @s5,
# @s6, @s9, @s10 (6). (b) LECTURA "?raw" — @s1, @s3, @s7, @s8, @s11, @s12
# (6). (c) NAVEGADOR REAL / lectura del artefacto real de "dist/" — @s13,
# @s14, @s15, @s16, @s17 (5).
#
# Reparto de los 7 escenarios de la ENMIENDA del 25/08/2026 (@s18-@s24,
# Decisiones 52-55): (a) MÓDULO PURO — @s18, @s22 (2). (b) LECTURA "?raw" —
# @s19, @s20, @s21 (3). (c) NAVEGADOR REAL — @s23, @s24 (2). Total del
# `.feature` tras la ampliación: 24 escenarios.
#
# ============================================================================
# QUÉ NO ES RESPONSABILIDAD DE ESTA FEATURE
# ============================================================================
# - **El contenido de `.github/workflows/deploy-pages.yml`**: ya creado por
#   `craftsman_lead`, fuera de `src/` y fuera de esta feature (Decisión 46).
# - **Ningún escenario de las features 1-22 se reabre.** Esta feature no
#   cambia el árbol accesible, los atributos ARIA, los textos, los datos ni
#   el patrón de interacción de ningún componente ya `done`: los enlaces
#   internos siguen siendo `<a>` de navegación de página completa, no migran
#   a `<Link>`/`<NavLink>` de `react-router` (mismo límite que Decisión 25
#   traza para `identidad_visual`: «ningún componente cambia de patrón»).
#   La enmienda del 25/08/2026 mantiene esta misma regla, explícita para las
#   6 features que toca: `pie_de_pagina`, `galeria`, `campanas_portada`,
#   `pagina_campanas`, `pagina_blog` y `pagina_tienda` no reabren ningún
#   escenario propio — @s18-@s24 viven íntegros en este mismo fichero.
# - **Sustituir las 24 fotografías de banco por material real de Galapavet**
#   (Riesgo abierto 5 de `project-spec.md`): sin cambios por esta enmienda —
#   lo único que cambia es el prefijo del `src` calculado, nunca a qué
#   fichero apunta.
# - **Investigar o reparar la animación de «hueco de imagen cargando» de la
#   ruta de campañas** (`tests/e2e/movimiento.spec.ts`), motivación adicional
#   de la Decisión 52: queda anotada como motivación, no como alcance de esta
#   enmienda — ver PENDIENTE 3, más abajo.
# - **`og:image` como URL absoluta** ya NO es responsabilidad de otra
#   feature: la enmienda del 25/08/2026 (Decisión 55, @s21/@s22) la resuelve
#   aquí mismo — ver PENDIENTE 2, más abajo, ya resuelto.
#
# ============================================================================
# PENDIENTES (a quién le toca fijar cada uno)
# ============================================================================
# 1. **PREGUNTA ABIERTA 1 — fidelidad de `vite preview` al 404 real de
#    GitHub Pages.** NO VERIFICADO que el servidor interno de `vite preview`
#    (`sirv`) sirva `404.html` con el mismo criterio que Pages ante una ruta
#    no encontrada. Por eso @s10 verifica el viaje codificar→decodificar como
#    MÓDULO PURO, sin depender de ese servidor. Si `tdd_craftsman` confirma
#    (o descarta) esa fidelidad durante la implementación, debe dejarlo
#    escrito con la medición, no dado por hecho; si la confirma, puede sumar
#    un tercer nivel de verificación end-to-end como REFUERZO, nunca como
#    sustituto de @s9/@s10/@s11.
# 2. ~~PREGUNTA ABIERTA 2 — coordinación con el PENDIENTE 7 de
#    `identidad_visual` (`og:image` absoluto).~~ **RESUELTA (25/08/2026,
#    Decisión 55)**: `og:image` compone `DOMINIO_SITIO +
#    hrefDeDestino(RUTA_IMAGEN_OPEN_GRAPH)`, el mismo mecanismo que el resto
#    de las 24 rutas de imagen de esta ampliación, no una segunda copia del
#    literal del subpath. Ver @s21/@s22, más abajo.
# 3. **PENDIENTE nuevo (enmienda 25/08/2026) — la animación de «hueco de
#    imagen cargando» de la ruta de campañas** (`tests/e2e/movimiento.spec.ts`),
#    motivación adicional de la Decisión 52: NO VERIFICADO si arreglar el 404
#    de imagen (@s23) basta para que ese test heredado vuelva a verde por sí
#    solo, o si queda un defecto propio de la animación más allá del 404. Si
#    `tdd_craftsman` lo confirma (o lo descarta) al implementar @s23/@s24,
#    debe dejarlo escrito con la medición, no dado por hecho — mismo criterio
#    que el PENDIENTE 1. Investigarlo o repararlo si hiciera falta NO es
#    responsabilidad de esta enmienda (ver «QUÉ NO ES RESPONSABILIDAD»,
#    arriba).
# ============================================================================

Feature: Despliegue en GitHub Pages: la web funciona bajo su subpath real igual que en local
  Como equipo del proyecto quiero que Galapavet publicada en
  `https://cenit-digital.github.io/GalapavetClinicaVeterinaria/` sirva sus
  assets, sus rutas internas y sus enlaces exactamente como en local, para
  que ni el catálogo de servicios ni la reserva de cita ni ninguna subpágina
  se rompan por vivir bajo un subpath en vez de en la raíz del dominio.

  # ---------------------------------------------------------------------------
  # A. EL LITERAL DEL SUBPATH VIVE EN UN SOLO SITIO (Decisión 47, Comportamiento 1)
  #    Herramienta: lectura del TEXTO REAL con "?raw" + Vitest.
  # ---------------------------------------------------------------------------

  @s1
  Scenario: El script de build fija el subpath con el flag de Vite, y solo ahí
    Given el texto real de "package.json" y el texto real de "vite.config.ts"
    And esta verificación se ejecuta leyendo el TEXTO REAL de los ficheros con "?raw" en Vitest, porque afirma qué comando ejecuta qué
    When se lee el script "build" de "package.json" y se busca la clave "base" en "vite.config.ts"
    Then el script "build" invoca "vite build" con el flag "--base=/GalapavetClinicaVeterinaria/"
    And "vite.config.ts" no declara ninguna clave "base" en su configuración
    And ese flag de "package.json" es el único sitio del repositorio donde se fija el "base" de Vite para producción

  # ---------------------------------------------------------------------------
  # B. FUERA DE PRODUCCIÓN, BASE_URL SIGUE SIENDO LA RAÍZ (Caso límite 7)
  #    Herramienta: MÓDULO PURO + Vitest.
  # ---------------------------------------------------------------------------

  @s2
  Scenario: La suite de Vitest no necesita ningún cambio porque su BASE_URL sigue siendo la raíz
    Given el entorno real en el que corre Vitest, que no pasa por el flag "vite build --base"
    And esta verificación se ejecuta como MÓDULO PURO en Vitest, porque lee una variable de entorno ya expuesta por Vite
    When se lee "import.meta.env.BASE_URL" dentro de un test y se calcula "hrefDeDestino" para los destinos "/campanas", "/blog" y "/tienda" con ese valor como base
    Then "import.meta.env.BASE_URL" vale exactamente "/"
    And "hrefDeDestino" devuelve exactamente "/campanas", "/blog" y "/tienda", el mismo literal que ya afirman los tests "done" de Cabecera, PieDePagina y CampanasPortada
    And ningún test ya "done" necesita reescribir su aserción de "href" por esta feature

  # ---------------------------------------------------------------------------
  # C. BrowserRouter RESUELVE SU basename DESDE BASE_URL (Decisión 47/48, Comportamiento 2)
  #    Herramienta: lectura del TEXTO REAL con "?raw" + Vitest.
  # ---------------------------------------------------------------------------

  @s3
  Scenario: App.tsx monta BrowserRouter con el basename derivado de BASE_URL
    Given el texto real de "src/App.tsx"
    And esta verificación se ejecuta leyendo el TEXTO REAL del fichero con "?raw" en Vitest
    When se lee la declaración del elemento "BrowserRouter"
    Then declara el atributo "basename={import.meta.env.BASE_URL}"
    And no existe ninguna declaración de "<BrowserRouter>" sin ese atributo

  # ---------------------------------------------------------------------------
  # D. hrefDeDestino: LA FUNCIÓN PURA PARAMETRIZADA POR LA BASE (Decisión 48, Comportamiento 3)
  #    Herramienta: MÓDULO PURO + Vitest, mordible por StrykerJS.
  # ---------------------------------------------------------------------------

  @s4
  Scenario: hrefDeDestino concatena la base y un destino de ruta, en la base de producción y en la de test
    Given la función pura "hrefDeDestino(destino, base)"
    And esta verificación se ejecuta como MÓDULO PURO en Vitest, mordible por StrykerJS, porque es una derivación determinista de dos cadenas
    When se calcula para los destinos "/campanas", "/blog" y "/tienda" con la base "/GalapavetClinicaVeterinaria/" y, por separado, con la base "/"
    Then con la base "/GalapavetClinicaVeterinaria/" devuelve exactamente "/GalapavetClinicaVeterinaria/campanas", "/GalapavetClinicaVeterinaria/blog" y "/GalapavetClinicaVeterinaria/tienda"
    And con la base "/" devuelve exactamente "/campanas", "/blog" y "/tienda", igual que hoy
    And el recuento de pares (destino, base) efectivamente comprobados es exactamente 6

  @s5
  Scenario: La concatenación de base y destino nunca produce una doble barra
    Given la función pura "hrefDeDestino(destino, base)", una base que termina en "/" y un destino que empieza por "/"
    And esta verificación se ejecuta como MÓDULO PURO en Vitest, mordible por StrykerJS
    When se calcula "hrefDeDestino('/campanas', '/GalapavetClinicaVeterinaria/')"
    Then el resultado es exactamente "/GalapavetClinicaVeterinaria/campanas"
    And el resultado no contiene la subcadena "//" en ningún punto

  @s6
  Scenario: Un destino de tipo ancla nunca pasa por el prefijo de la base
    Given la función pura "hrefDeDestino(destino, base)" y los destinos ancla "#servicios", "#equipo" y "#contacto"
    And esta verificación se ejecuta como MÓDULO PURO en Vitest, mordible por StrykerJS, reutilizando "esAncla" de "Cabecera-logica.ts", ya "done"
    When se calcula "hrefDeDestino" para cada uno de esos tres destinos, con la base "/GalapavetClinicaVeterinaria/" y, por separado, con la base "/"
    Then el resultado es idéntico al destino original en los dos casos, sin ningún prefijo añadido
    And el recuento de destinos ancla efectivamente comprobados es exactamente 3

  # ---------------------------------------------------------------------------
  # E. LOS CUATRO PUNTOS DE ENLACE LITERAL ADOPTAN hrefDeDestino (Decisión 48, Comportamiento 3)
  #    Herramienta: lectura del TEXTO REAL con "?raw" + Vitest.
  # ---------------------------------------------------------------------------

  @s7
  Scenario: Cabecera, PieDePagina, CampanasPortada y PaginaNoEncontrada resuelven su href de ruta con hrefDeDestino
    Given el texto real de "src/components/Cabecera.tsx", "src/components/PieDePagina.tsx", "src/components/CampanasPortada.tsx" y "src/pages/PaginaNoEncontrada.tsx"
    And esta verificación se ejecuta leyendo el TEXTO REAL de los ficheros con "?raw" en Vitest
    When se busca, en cada uno, cómo calculan el "href" de un destino de tipo ruta
    Then los cuatro ficheros llaman a "hrefDeDestino" para resolver ese "href"
    And ninguno de los cuatro concatena a mano el literal "/GalapavetClinicaVeterinaria/"
    And los enlaces legales del pie de página (destinos "https://galapavet.com/…", con "target=_blank"), que ya son externos, no pasan por esa función porque no la necesitan
    And el recuento de ficheros efectivamente inspeccionados es exactamente 4

  @s8
  Scenario: El panel móvil de la cabecera actualiza la URL visible con la ruta ya resuelta por la base
    Given el texto real de "src/components/Cabecera.tsx"
    And esta verificación se ejecuta leyendo el TEXTO REAL del fichero con "?raw" en Vitest, porque el panel móvil no navega con un "<a>" normal sino con "window.history.pushState"
    When se lee el manejador de clic del panel móvil para un destino de tipo ruta
    Then ese manejador pasa a "window.history.pushState" el "href" ya resuelto por "hrefDeDestino", no el destino crudo sin la base
    And para un destino de tipo ancla el manejador sigue sin llamar a "pushState", exactamente como hoy

  # ---------------------------------------------------------------------------
  # F. LA TÉCNICA DE SPA EN GITHUB PAGES, COMO MÓDULO PURO (Decisión 49, Comportamiento 4)
  #    Herramienta: MÓDULO PURO + Vitest, mordible por StrykerJS.
  # ---------------------------------------------------------------------------

  @s9
  Scenario: El gemelo puro de la codificación conserva el único segmento de subpath declarado
    Given el módulo puro que replica la codificación de ruta del script de "public/404.html" (técnica de rafgraph/spa-github-pages), con "pathSegmentsToKeep" fijado a 1
    And esta verificación se ejecuta como MÓDULO PURO en Vitest, mordible por StrykerJS, porque es la lógica que se espeja del script inline
    When se codifica la ruta completa "/GalapavetClinicaVeterinaria/campanas" tal como el navegador la reporta tras el 404 de GitHub Pages
    Then el primer segmento de la ruta, "GalapavetClinicaVeterinaria", se conserva como parte de la ruta real de la redirección a la raíz, no como parte de la porción codificada
    And el literal "pathSegmentsToKeep" vale exactamente 1 en el módulo, coherente con que este es un sitio de proyecto con un único segmento de subpath
    And ese literal no necesita conocer el nombre del repositorio, solo su profundidad

  @s10
  Scenario: El viaje de codificar y decodificar una ruta reconstruye pathname, query string y hash intactos
    Given el módulo puro de codificación de "public/404.html" y el módulo puro de decodificación de "index.html" (Decisión 49), encadenados
    And esta verificación se ejecuta como MÓDULO PURO en Vitest, mordible por StrykerJS, SIN simular el servidor real de GitHub Pages (PENDIENTE 1)
    When se codifica y a continuación se decodifica cada una de estas tres rutas completas: "/GalapavetClinicaVeterinaria/campanas" (recarga de una ruta interna registrada), "/GalapavetClinicaVeterinaria/blog/demo-1?ref=externo#seccion-comentarios" (deep-link externo con query string y hash) y "/GalapavetClinicaVeterinaria/no-existe" (ruta no registrada)
    Then el pathname, el query string y el hash reconstruidos son idénticos, carácter a carácter, a los originales en las tres rutas
    And para "/GalapavetClinicaVeterinaria/campanas", ese es exactamente el caso de refrescar el navegador estando en una ruta interna registrada: el viaje no pierde ni un carácter de la ruta que había que servir
    And para la ruta con query string y hash, tanto "?ref=externo" como "#seccion-comentarios" sobreviven íntegros
    And para "/GalapavetClinicaVeterinaria/no-existe", el pathname reconstruido es exactamente el que App.tsx compara contra sus rutas registradas; al no coincidir con ninguna, cae en el "*" que ya renderiza PaginaNoEncontrada (ensamblaje_landing.feature, ya "done") — esta feature no reabre esa comprobación, solo garantiza que la ruta le llega intacta
    And el recuento de rutas efectivamente comprobadas en esta cadena es exactamente 3

  # ---------------------------------------------------------------------------
  # G. LA TÉCNICA ESTÁ REALMENTE EN LOS FICHEROS, NO SOLO EN SU GEMELO (Decisión 49)
  #    Herramienta: lectura del TEXTO REAL con "?raw" + Vitest.
  # ---------------------------------------------------------------------------

  @s11
  Scenario: public/404.html y el script de decodificación de index.html contienen la técnica real
    Given el texto real de "public/404.html" y el texto real de "index.html"
    And esta verificación se ejecuta leyendo el TEXTO REAL de los ficheros con "?raw" en Vitest, contrastado contra el algoritmo que comprueban @s9 y @s10
    When se busca el script de redirección en cada uno de los dos ficheros
    Then "public/404.html" declara "pathSegmentsToKeep" con el valor 1
    And "public/404.html" codifica "pathname", "search" y "hash" antes de redirigir a la raíz
    And "index.html" contiene un segundo script que llama a "window.history.replaceState"
    And ese script de "index.html" aparece ANTES de la etiqueta "<script type=module src=/src/main.tsx>" que carga la aplicación
    And "public/404.html" no es una entrada de Vite: no se declara en ningún "input" de "vite.config.ts", igual que el resto de "public/"

  # ---------------------------------------------------------------------------
  # H. LAS REFERENCIAS A public/ EN index.html USAN %BASE_URL% (Decisión 50, Comportamiento 5)
  #    Herramienta: lectura del TEXTO REAL con "?raw" + Vitest.
  # ---------------------------------------------------------------------------

  @s12
  Scenario: El favicon, el apple-touch-icon y los dos preloads de fuente usan la variable de sustitución de Vite
    Given el texto real de "index.html"
    And esta verificación se ejecuta leyendo el TEXTO REAL del fichero con "?raw" en Vitest, porque "%BASE_URL%" no es JavaScript: lo sustituye Vite al compilar "index.html"
    When se leen las etiquetas "link" de icono y de precarga de fuente del documento
    Then el "href" de "rel=icon" y de "rel=apple-touch-icon" empieza por "%BASE_URL%", no por "/" a secas
    And el "href" de los dos "rel=preload as=font" empieza por "%BASE_URL%", no por "/" a secas
    And ninguna de esas rutas es una ruta absoluta literal que empiece por "/" sin pasar por "%BASE_URL%"
    And el recuento de referencias a "public/" efectivamente comprobadas en "index.html" es exactamente 5 (favicon.ico, favicon-32.png, apple-touch-icon.png, y los dos preloads de fuente)

  # ---------------------------------------------------------------------------
  # I. EL PREFIJO DE LOS ASSETS Y DE public/, SOBRE EL dist/ REAL (Decisión 51 nivel 1, Comportamiento 6)
  #    Herramienta: NAVEGADOR REAL (Playwright) y lectura del artefacto real de "dist/".
  # ---------------------------------------------------------------------------

  @s13
  Scenario: El sitio construido y servido bajo el subpath real carga el mismo árbol que en local
    Given el sitio de Galapavet construido con "vite build --base=/GalapavetClinicaVeterinaria/" y servido con "vite preview --base=/GalapavetClinicaVeterinaria/ --port 4173 --strictPort"
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, porque solo el motor de render resuelve si el bundle de JS y de CSS cargan bajo el subpath o dan 404
    When se carga "http://localhost:4173/GalapavetClinicaVeterinaria/"
    Then el documento monta la aplicación dentro de "#root" y las 7 anclas de la landing ("#inicio", "#servicios", "#equipo", "#reservar", "#galeria", "#contacto", "#faq") existen, el mismo árbol que sirve hoy sin subpath
    And la respuesta del documento principal y la de cada fichero de "assets/" referenciado tienen código de estado 200
    And no se registra ningún mensaje de error en la consola del navegador
    And el recuento de peticiones de "assets/" efectivamente comprobadas es mayor que 0

  @s14
  Scenario: El favicon, el apple-touch-icon y los dos preloads de fuente resuelven bajo el subpath
    Given el sitio de Galapavet construido con "vite build --base=/GalapavetClinicaVeterinaria/" y servido con "vite preview --base=/GalapavetClinicaVeterinaria/"
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, pidiendo los ficheros directamente al servidor
    When se piden "/GalapavetClinicaVeterinaria/favicon.ico", "/GalapavetClinicaVeterinaria/favicon-32.png", "/GalapavetClinicaVeterinaria/apple-touch-icon.png" y los dos ficheros de fuente ".woff2" precargados, todos bajo el subpath
    Then las cinco respuestas tienen código de estado 200
    And ninguna petición equivalente sin el subpath (p. ej. "/favicon.ico" a secas) es la que el documento efectivamente solicita
    And el recuento de ficheros efectivamente comprobados es exactamente 5

  @s15
  Scenario: dist/404.html es una copia verbatim de public/404.html, sin pasar por el procesamiento de Vite
    Given el texto real de "public/404.html" antes del build
    And el sitio construido con "vite build --base=/GalapavetClinicaVeterinaria/" en "dist/"
    And esta verificación lee el ARTEFACTO REAL de "dist/" del sistema de ficheros, sin servidor de por medio, porque afirma sobre el contenido del artefacto, no sobre cómo lo sirve ningún servidor
    When se compara el contenido de "dist/404.html" con el contenido de "public/404.html"
    Then son idénticos, carácter a carácter
    And este escenario no depende de cómo "vite preview" ni GitHub Pages sirvan ese fichero (PENDIENTE 1): solo del contenido del artefacto que "vite build" produce

  # ---------------------------------------------------------------------------
  # J. LA PUERTA DE TERCEROS SIGUE SIN EXCEPCIONES NUEVAS (Decisión 46, Caso límite 8)
  #    Herramienta: lectura del ARTEFACTO REAL de "dist/" tras el build.
  # ---------------------------------------------------------------------------

  @s16
  Scenario: El build completo con el nuevo --base sigue pasando la puerta de terceros sin hallazgos
    Given el sitio construido con "pnpm run build" (que ya incluye "--base=/GalapavetClinicaVeterinaria/", Decisión 47) y "tools/puerta-terceros.ts" ejecutándose sobre ese mismo "dist/"
    And esta verificación lee el ARTEFACTO REAL de "dist/" (ficheros ".css" y ".html"), igual que hace la propia puerta
    When se ejecuta "pnpm run build" de punta a punta
    Then el proceso termina con código de salida 0
    And el informe de la puerta de terceros declara 0 hallazgos
    And ni "dist/404.html" ni el script de decodificación de "dist/index.html" añaden ninguna referencia a un dominio de terceros que no existiera antes de esta feature

  # ---------------------------------------------------------------------------
  # K. NINGÚN TEST EXISTENTE SE ROMPE POR EL CAMBIO (Propósito, Contrato)
  #    Herramienta: NAVEGADOR REAL (Playwright), ejecutando la puerta completa.
  # ---------------------------------------------------------------------------

  @s17
  Scenario: La puerta completa de navegador real, ya heredada de identidad_visual, sigue en verde tras fijar el subpath de producción
    Given el repositorio con el flag "--base" de la Decisión 47 ya aplicado en el script "build"
    And esta verificación se ejecuta en NAVEGADOR REAL, ejecutando la puerta completa "pnpm run test:e2e"
    When se ejecuta esa puerta completa
    Then el código de salida es 0
    And el recuento de tests que fallan es exactamente 0
    And ninguno de los 65 tests de navegador real ya heredados de identidad_visual (feature 22, ya "done") necesita reescribir su Given/When/Then ya aprobado; como mucho, adapta la infraestructura que los sirve (el comando que arranca "vite preview" y la URL base de Playwright) para seguir midiendo el mismo "dist/", ahora bajo el subpath

  # ===========================================================================
  # ENMIENDA (25/08/2026): RESOLUCIÓN DE RUTAS DE IMAGEN BAJO EL SUBPATH
  # (Decisiones 52-55, `project-spec.md`). Nace del hallazgo bloqueante que
  # `tdd_craftsman` documentó al recorrer @s13-@s17 en navegador real contra
  # el `dist/` real con el `--base` real (Decisión 51): 24 rutas de imagen
  # (más `og:image`) nunca pasan por `hrefDeDestino` y dan 404 de mismo
  # origen bajo el subpath — ver `progress/tdd_despliegue_github_pages.md`,
  # sección «HALLAZGO BLOQUEANTE», y la nota de recuento verificado (24+1=25,
  # no «27/28») en la cabecera de este fichero, arriba. Generaliza el MISMO
  # mecanismo que @s4-@s8 ya aprobaron para `<a href>` — ninguna función
  # nueva, ningún escenario de las 6 features `done` que reabra su propio
  # `.feature`.
  # ===========================================================================

  # ---------------------------------------------------------------------------
  # L. hrefDeDestino SE GENERALIZA A LAS RUTAS DE IMAGEN, SIN FUNCIÓN HERMANA (Decisión 53)
  #    Herramienta: MÓDULO PURO + Vitest, mordible por StrykerJS.
  # ---------------------------------------------------------------------------

  @s18
  Scenario: hrefDeDestino calcula igual para una ruta de imagen que para una ruta de enlace, en producción y en test
    Given la función pura "hrefDeDestino(destino, base)", ya cubierta por 16 tests (Decisión 48), y las 24 rutas de imagen reales declaradas en "PieDePagina.tsx", "galeria.ts", "campanas.ts", "blog.ts" y "tienda.ts", más "RUTA_IMAGEN_OPEN_GRAPH"
    And esta verificación se ejecuta como MÓDULO PURO en Vitest, mordible por StrykerJS, sin crear ninguna función nueva: "esAncla" devuelve "false" para las 25 rutas, igual que para cualquier destino de ruta ya cubierto por @s4
    When se calcula "hrefDeDestino" para cada una de esas 25 rutas con la base de producción "/GalapavetClinicaVeterinaria/" y, por separado, con la base "/" de test
    Then con la base de producción, cada resultado tiene el subpath "/GalapavetClinicaVeterinaria" como único prefijo, sin ninguna doble barra "//" en ningún punto — la misma garantía que ya prueba @s5, sin necesitar un caso nuevo para ella
    And con la base "/" (Vitest), cada resultado es idéntico, carácter a carácter, al literal crudo original que ya afirman los tests "done" de "pie_de_pagina", "galeria", "campanas_portada"/"pagina_campanas", "pagina_blog" y "pagina_tienda" — ningún test existente necesita reescribir su aserción por esta enmienda
    And el recuento de rutas efectivamente comprobadas es exactamente 25

  # ---------------------------------------------------------------------------
  # M. LA RESOLUCIÓN SE APLICA EN EL PUNTO DE RENDERIZADO, NUNCA EN src/data/*.ts (Decisión 54)
  #    Herramienta: lectura del TEXTO REAL con "?raw" + Vitest.
  # ---------------------------------------------------------------------------

  @s19
  Scenario: Los seis componentes que pintan una imagen local llaman a hrefDeDestino para resolver su src
    Given el texto real de "src/components/PieDePagina.tsx", "src/components/Galeria.tsx", "src/components/CampanasPortada.tsx", "src/pages/PaginaCampanas.tsx", "src/pages/PaginaBlog.tsx" y "src/pages/PaginaTienda.tsx"
    And esta verificación se ejecuta leyendo el TEXTO REAL de los ficheros con "?raw" en Vitest
    When se busca, en cada uno, cómo calculan el "src" del elemento "<img>" que pintan
    Then los seis llaman a "hrefDeDestino" para resolver ese "src"
    And "CampanasPortada.tsx", que ya llama a "hrefDeDestino" para el "href" de la tarjeta (@s7), lo llama una segunda vez para el "src" de la imagen que esa misma tarjeta contiene
    And "PaginaBlog.tsx" lo llama en sus dos puntos de renderizado de imagen: el bloque "Sigue leyendo" del listado y la imagen de cabecera del artículo
    And ninguno de los seis concatena a mano el literal del subpath
    And ninguno de los seis cambia el "alt", el "width", el "height" ni los atributos "loading"/"decoding" de ningún "<img>" ya "done" — el único campo que cambia es cómo se calcula el "src"
    And el recuento de ficheros efectivamente inspeccionados es exactamente 6

  @s20
  Scenario: Los cuatro ficheros de datos de imagen siguen declarando la ruta cruda, sin importar hrefDeDestino
    Given el texto real de "src/data/galeria.ts", "src/data/campanas.ts", "src/data/blog.ts" y "src/data/tienda.ts"
    And esta verificación se ejecuta leyendo el TEXTO REAL de los ficheros con "?raw" en Vitest, porque estos catálogos son "as const satisfies" sin dependencia del entorno de build (Decisión 54)
    When se busca si alguno de los cuatro importa o llama a "hrefDeDestino"
    Then ninguno de los cuatro importa "hrefDeDestino"
    And cada uno sigue declarando el literal crudo "/img/..." exactamente igual que antes de esta enmienda
    And el recuento de ficheros de datos efectivamente inspeccionados es exactamente 4

  # ---------------------------------------------------------------------------
  # N. og:image COMPONE DOMINIO + hrefDeDestino(RUTA), NO CONCATENACIÓN LITERAL
  #    (Decisión 55, resuelve la PREGUNTA ABIERTA 2 original de este .feature)
  # ---------------------------------------------------------------------------

  @s21
  Scenario: MetadatosPagina.tsx compone IMAGEN_OPEN_GRAPH con hrefDeDestino, no con una concatenación cruda
    Given el texto real de "src/components/MetadatosPagina.tsx"
    And esta verificación se ejecuta leyendo el TEXTO REAL del fichero con "?raw" en Vitest
    When se busca cómo se construye la constante "IMAGEN_OPEN_GRAPH"
    Then declara "IMAGEN_OPEN_GRAPH" como "DOMINIO_SITIO" concatenado con "hrefDeDestino(RUTA_IMAGEN_OPEN_GRAPH)", no con "RUTA_IMAGEN_OPEN_GRAPH" a secas
    And "DOMINIO_SITIO" sigue siendo el literal "https://cenit-digital.github.io", sin el subpath añadido a mano dentro de este fichero
    And no existe ninguna concatenación de "DOMINIO_SITIO" con "RUTA_IMAGEN_OPEN_GRAPH" que no pase por "hrefDeDestino"

  @s22
  Scenario: og:image resuelve como URL absoluta con esquema, host y subpath en producción, y sigue siendo invisible en test
    Given "hrefDeDestino(RUTA_IMAGEN_OPEN_GRAPH, base)" y "DOMINIO_SITIO" igual a "https://cenit-digital.github.io"
    And esta verificación se ejecuta como MÓDULO PURO en Vitest, calculando el mismo literal que compone "MetadatosPagina.tsx"
    When se calcula "IMAGEN_OPEN_GRAPH" con la base de producción "/GalapavetClinicaVeterinaria/" y, por separado, con la base "/" de test
    Then con la base de producción, "IMAGEN_OPEN_GRAPH" es exactamente "https://cenit-digital.github.io/GalapavetClinicaVeterinaria/img/og/galapavet.png" — URL absoluta con esquema, host y subpath, cumpliendo el tipo "URL" de OGP
    And con la base "/" (Vitest), "IMAGEN_OPEN_GRAPH" es exactamente "https://cenit-digital.github.io/img/og/galapavet.png", el mismo literal que ya afirma "seo_estructura.feature" — ningún test "done" se reescribe por esta enmienda
    And este escenario resuelve la PREGUNTA ABIERTA 2 original de este ".feature", citada en su cabecera

  # ---------------------------------------------------------------------------
  # O. EL PREFIJO DE LAS IMÁGENES Y DE og:image, SOBRE EL dist/ REAL (Casos límite 1/5, Criterio 1)
  #    Herramienta: NAVEGADOR REAL (Playwright sobre dist/ real), mismo nivel que @s13.
  # ---------------------------------------------------------------------------

  @s23
  Scenario: Las imágenes de las 6 features y og:image resuelven con 200 bajo el subpath real
    Given el sitio de Galapavet construido con "vite build --base=/GalapavetClinicaVeterinaria/" y servido con "vite preview --base=/GalapavetClinicaVeterinaria/ --port 4173 --strictPort"
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, mismo nivel de verificación que @s13/@s14 (Decisión 51)
    When se recorren las 6 rutas del inventario y se piden, bajo el subpath, las 24 rutas de imagen declaradas en "pie_de_pagina", "galeria", "campanas_portada"/"pagina_campanas", "pagina_blog" y "pagina_tienda", más la URL de "og:image" leída de la etiqueta "meta[property=og:image]"
    Then las 25 respuestas tienen código de estado 200
    And ninguna imagen renderizada en esas 6 rutas queda con "naturalWidth" igual a 0
    And no se registra ningún mensaje de error de red en la consola del navegador por ninguna de esas 25 peticiones
    And el recuento de rutas de imagen efectivamente comprobadas es exactamente 25

  # ---------------------------------------------------------------------------
  # P. LOS 5 TESTS HEREDADOS EN ROJO POR ESTE HALLAZGO QUEDAN EN VERDE COMO CONSECUENCIA
  #    Herramienta: NAVEGADOR REAL, ejecutando la puerta completa "pnpm run test:e2e".
  # ---------------------------------------------------------------------------

  @s24
  Scenario: La puerta completa de navegador real, con los 5 tests que este hallazgo rompía, vuelve a estar en verde
    Given los 5 tests heredados en rojo por esta misma causa antes de esta enmienda: "tests/e2e/despliegue-subpath.spec.ts" @s13 (propio de esta feature), "tests/e2e/imagenes.spec.ts" @s27 y @s29, "tests/e2e/red-limpia.spec.ts" @s33 y @s34 (progress/tdd_despliegue_github_pages.md, sección «HALLAZGO BLOQUEANTE»)
    And esta verificación se ejecuta en NAVEGADOR REAL, ejecutando la puerta completa "pnpm run test:e2e", sin reabrir el Given/When/Then ya aprobado de ninguno de esos 5 tests
    When se ejecuta esa puerta completa tras implementar @s18-@s23
    Then los 5 tests pasan a verde como consecuencia directa de que las imágenes y "og:image" ya resuelven bajo el subpath, sin que ninguno de los 5 reescriba su aserción original
    And el código de salida es 0 y el recuento de tests que fallan en toda la puerta es exactamente 0
    And ninguno de los tests de la puerta que ya estaban en verde antes de esta enmienda pasa a rojo por ella
