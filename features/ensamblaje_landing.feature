# =============================================================================
# features/ensamblaje_landing.feature — Punto de entrada, shell y landing
# =============================================================================
#
# FUENTE DEL COMPORTAMIENTO
#   - project-spec.md → sección "Ensamblaje — nueva feature: ensamblaje_landing"
#     (Propósito, Comportamiento, Contrato, Casos límite 1-7, PREGUNTA ABIERTA
#     1-3) y Decisiones 15-22.
#   - feature_list.json → feature 20 `ensamblaje_landing`, sus 6 criterios de
#     aceptación.
#   - docs/contrato-heredado/README_TRASPASO.md — única fuente que fija el
#     orden Equipo → ReservaChat → Galería (tabla "Ficheros generados", filas
#     equipo.feature / reserva_chat.feature / galeria.feature, en ese orden).
#     Ver PENDIENTE más abajo: NO hay una segunda cita independiente para ese
#     tramo, a diferencia del resto del orden.
#   - Los 12 componentes ya `done` y sus propios `.feature` ya aprobados, como
#     fuente de cada nombre/rol accesible que este contrato reutiliza SIN
#     redefinirlo: `hero.feature` @s1 (encabezado de nivel 1 "Cuidamos la salud
#     y la felicidad de tu mascota"), `servicios.feature` @s1 (encabezado de
#     nivel 2 "Servicios"), `campanas_portada.feature` @s1/@s11/@s12 (región
#     "Campañas de prevención", tarjetas y botón con destino "/campanas", sin
#     ancla propia), `equipo.feature` @s1 (región "Equipo"), `reserva_chat.feature`
#     @s1 (grupo "Asistente de reserva de Galapavet"), `galeria.feature` @s3
#     (región cuyo nombre accesible contiene "Galería"), `formulario_contacto.feature`
#     @s1 (formulario "Escríbenos") e `informacion_contacto.feature` @s1 (región
#     "Información de contacto") como las dos mitades de la sección Contacto
#     (Decisión 18), `faq.feature` @s1 (sección "Preguntas frecuentes"),
#     `cabecera_y_navegacion.feature` (región "Navegación principal", enlace de
#     logotipo a "#inicio", punto de corte declarado en @s1, rama móvil/escritorio
#     según `ancho`, caída a móvil sin medición en @s14) y `pie_de_pagina.feature`
#     (rol "contentinfo") y `selector_paleta.feature` @s1 (botón "Cambiar paleta
#     de color").
#   - src/data/navegacion.ts (`ENLACES_NAVEGACION`) — única fuente de las tres
#     rutas de subpágina "/campanas", "/blog" y "/tienda" (Decisión 20), las
#     mismas que ya contrata `cabecera_y_navegacion.feature` @s5 como destino de
#     los enlaces "Campañas", "Blog" y "Tienda".
#
# DECISIONES APLICADAS (project-spec.md)
#   15 (nace la feature: main.tsx → App.tsx → Landing.tsx) · 16 (orden de la
#   landing, verificado contra el prototipo heredado) · 17 (el id de cada ancla
#   lo asigna Landing.tsx, nunca el propio componente) · 18 (Contacto es UNA
#   sola sección: FormularioContacto + InformacionContacto) · 19 (BrowserRouter,
#   no HashRouter) · 20 (rutas de subpágina derivadas de navegacion.ts, no
#   retipeadas) · 21 (excepción nombrada si falta #root) · 22 (Cabecera recibe
#   un ancho real y vivo de window.innerWidth).
#
# QUÉ CUBRE Y QUÉ NO CUBRE ESTE CONTRATO
#   Cubre: src/main.tsx (punto de entrada), src/App.tsx (shell común a TODAS las
#   rutas: Cabecera + enrutado + PieDePagina + SelectorPaleta) y
#   src/pages/Landing.tsx (orden de sus 8 secciones, los 7 id de ancla, y el
#   catch-all de las rutas de subpágina que todavía no aterrizan contenido
#   propio). NO repite ningún escenario ya cubierto por el `.feature` de cada
#   componente aislado (p. ej. que Servicios expanda sus 5 tarjetas, o que
#   ReservaChat derive al teléfono de urgencias): eso ya está `done` y probado
#   en su propio fichero.
#   Fuera de alcance (declarado también en project-spec.md §Contrato): el
#   contenido propio de /campanas, /blog y /tienda (features 16-18, ya
#   `spec_ready`); el `<title>`/metadatos por ruta (`seo_estructura`, feature 15).
#
# TEXTO DE INTERFAZ QUE NO ES UN DATO DE NEGOCIO (redactado aquí, sustituible
# sin tocar ningún dato de docs/datos-galapavet.md — mismo patrón que el aviso
# del mapa en `informacion_contacto.feature` y el rótulo de demo en
# `campanas_portada.feature`)
#   - Encabezado del catch-all de subpágina: "Página no encontrada".
#   - Enlace de vuelta del catch-all: "Volver al inicio", destino "/".
#
# FUERA DEL GATE DE STRYKER
#   `main.tsx`, `App.tsx` y `Landing.tsx` quedan fuera del glob de mutación
#   (`stryker.config.json`: `src/lib/**/*.ts` + `src/**/*-logica.ts`), igual que
#   el resto de `.tsx` del proyecto. El orden de las secciones, los 7 id de
#   ancla y las rutas se verifican por los tests de integración de este fichero
#   (renderizar el árbol completo y comprobar el árbol accesible) y por
#   sabotaje manual del `judge` — así fija el propio §Contrato de esta feature
#   en project-spec.md, en particular para la parte de "quién declara el id"
#   (Decisión 17) y "de dónde salen las rutas" (Decisión 20), que un test de
#   caja negra no puede distinguir de una coincidencia si alguien retipeara el
#   mismo literal en dos sitios.
#
# PENDIENTE
#   - PENDIENTE — A CONFIRMAR POR EL HUMANO EN ESTA MISMA PUERTA DE APROBACIÓN,
#     NO UNA CERTEZA YA CERRADA: el orden Equipo → ReservaChat → Galería (@s3)
#     solo tiene UNA fuente en todo el repositorio, la tabla de
#     docs/contrato-heredado/README_TRASPASO.md. A diferencia de
#     Hero→Servicios→Campañas y de que Contacto es una sola sección —que tienen
#     cada una una segunda cita independiente que las confirma (ver el porqué de
#     la Decisión 16 y de la Decisión 18 en project-spec.md)—, este tramo no la
#     tiene: el `.dc.html` original de "Veterinaria La Sierra" no está archivado
#     en este repositorio, solo su destilado en Gherkin. Se toma como orden de
#     TRABAJO en @s3 — mismo criterio de prudencia que el PENDIENTE ya existente
#     sobre el orden de los 5 bloques de `servicios.feature` — y NO como un
#     hecho ya verificado dos veces. Si el humano no lo confirma en esta puerta,
#     @s3 se reabre antes de que `tdd_craftsman` toque código.
#   - PENDIENTE (PREGUNTA ABIERTA 2 de project-spec.md, cerrada por el humano en
#     la conversación que originó este fichero): las rutas de subpágina sin
#     página propia sirven un ÚNICO catch-all genérico "página no encontrada"
#     (@s12, @s13), no un placeholder a medida por ruta, hasta que sus propias
#     features (16, 17, 18, ya `spec_ready`) aterricen su propia `<Route>` por
#     encima. RESUELTO PARCIALMENTE (21/08/2026): `pagina_campanas` (id 16,
#     `done`) ya aterrizó su propia `<Route>` real sobre "/campanas" — esa ruta
#     YA NO forma parte del catch-all. @s12 se actualizó en consecuencia para
#     cubrir solo "/blog" y "/tienda", las dos que siguen pendientes (17, 18).
#     Cambio de código pre-aprobado por esta misma PREGUNTA ABIERTA 2 y por el
#     criterio de aceptación de esta propia feature (feature_list.json:307);
#     esta nota documenta que el TEXTO del contrato ya se sincronizó con él.
#   - PENDIENTE (PREGUNTA ABIERTA 3 de project-spec.md, cerrada por el humano en
#     esa misma conversación): el contenedor id="contacto" no lleva landmark ni
#     nombre accesible propio; basta con el id desnudo (@s6). Sus dos hijos
#     conservan intactos sus propios `aria-label` ya aprobados ("Escríbenos" e
#     "Información de contacto").
#   - Fuera de alcance por no ser medible en jsdom/Vitest (Decisión 11 de
#     project-spec.md): el build real (`vite build`) y el arranque
#     (`vite dev`/`preview`). @s15 lo declara explícitamente como verificación
#     con línea de comandos / navegador real, fuera del gate de Vitest/Stryker.
#   - No se repite aquí el matiz de "resize con el menú móvil abierto o
#     cerrado" (caso límite 4 de project-spec.md): ya lo prueba
#     `cabecera_y_navegacion.feature` @s11 sobre el propio componente. Aquí solo
#     se añade la capa que ese fichero no podía probar por sí solo: que el
#     evento de `resize` sea REAL (de `window`), no una prop inyectada a mano
#     (@s10).
# =============================================================================

Feature: Ensamblaje de la aplicación: punto de entrada, shell y landing
  Como visitante que llega a la web de Galapavet
  Quiero que la landing exista de verdad en una única URL, con un shell común y
  navegación real entre secciones y subpáginas
  Para conocer la clínica sin toparme con una página en blanco, una ruta rota o
  un enlace que no lleva a ningún sitio.

  @s1
  Scenario: El punto de entrada monta la aplicación en el elemento #root
    Given un documento HTML que contiene un elemento vacío con id "root", igual que el index.html real del proyecto
    When se ejecuta el punto de entrada "src/main.tsx"
    Then dentro de ese elemento se monta el árbol de la aplicación
    And el elemento con id "root" deja de estar vacío

  @s2
  Scenario: Sin #root en el documento, el punto de entrada falla con una excepción nombrada
    Given un documento HTML que no contiene ningún elemento con id "root"
    When se ejecuta el punto de entrada "src/main.tsx"
    Then la ejecución lanza una excepción
    And el mensaje de la excepción menciona la palabra "root"
    And no se monta ningún nodo de la aplicación en el documento

  @s3
  Scenario: Las 8 secciones siguen el orden de trabajo del contrato heredado y las 7 anclas existen una única vez (orden PENDIENTE de confirmar en el tramo Equipo→ReservaChat→Galería, ver cabecera de este fichero)
    Given el visitante navega a la ruta "/"
    When recorre el documento en el orden real de aparición
    Then los siguientes elementos aparecen en este orden:
      | orden | sección                                             | identificador                            |
      | 1     | Hero                                                | id="inicio"                              |
      | 2     | Servicios                                           | id="servicios"                           |
      | 3     | CampanasPortada                                     | región "Campañas de prevención" (sin id) |
      | 4     | Equipo                                              | id="equipo"                              |
      | 5     | ReservaChat                                         | id="reservar"                            |
      | 6     | Galeria                                             | id="galeria"                             |
      | 7     | Contacto (FormularioContacto + InformacionContacto) | id="contacto"                            |
      | 8     | Faq                                                 | id="faq"                                 |
    And cada uno de los 7 id "inicio", "servicios", "equipo", "reservar", "galeria", "contacto" y "faq" existe exactamente una vez en todo el documento
    And ninguno de esos 7 id está duplicado ni ausente

  @s4
  Scenario: El id de cada ancla lo asigna Landing.tsx, nunca los propios componentes de sección
    Given Hero, Servicios, Equipo, ReservaChat, Galeria, FormularioContacto, InformacionContacto y Faq se renderizan cada uno por separado, exactamente como en su propio archivo de test ya aprobado, sin pasar por Landing.tsx
    When se inspecciona el árbol de cada uno de esos 8 renders aislados
    Then ninguno de esos árboles contiene un elemento con id "inicio", "servicios", "equipo", "reservar", "galeria", "contacto" ni "faq"
    And al montar la ruta "/" completa esos mismos 7 id sí existen, uno por sección, según fija @s3
    And es por tanto Landing.tsx quien los añade, no los propios componentes

  @s5
  Scenario: CampanasPortada se renderiza sin ancla propia y sigue enlazando a la página de campañas, no a un ancla de la landing
    Given el visitante navega a la ruta "/"
    When recorre la sección identificada por la región "Campañas de prevención"
    Then no existe en todo el documento ningún elemento con id "campanas"
    And el destino de sus tarjetas y del enlace "Ver campañas" sigue siendo exactamente "/campanas", ninguno empieza por "#"

  @s6
  Scenario: La sección Contacto agrupa el formulario y el panel de información sin nombre accesible propio de su contenedor
    Given el visitante navega a la ruta "/"
    When recorre el elemento con id "contacto"
    Then dentro de él aparece, en este orden, primero el formulario cuyo nombre accesible es "Escríbenos" y después la región cuyo nombre accesible es "Información de contacto"
    And el elemento con id "contacto" no declara ningún atributo "aria-label" ni "aria-labelledby"
    And no existe en todo el documento ninguna región, landmark ni encabezado adicional cuyo nombre accesible sea "Contacto"

  @s7
  Scenario: Cabecera, PieDePagina y SelectorPaleta forman un shell común a todas las rutas
    Given el visitante navega, una tras otra, a las rutas "/", "/campanas", "/blog" y "/tienda"
    When recorre el documento en cada una de esas cuatro rutas
    Then en las cuatro existe exactamente un elemento con rol "contentinfo"
    And en las cuatro existe un botón cuyo nombre accesible es "Cambiar paleta de color"
    And en las cuatro existe el enlace del logotipo de la cabecera cuyo destino es "#inicio"
    And en las cuatro ese enlace del logotipo aparece antes que el elemento con rol "contentinfo" en el orden del documento

  @s8
  Scenario: BrowserRouter mantiene las anclas de sección como navegación dentro de la misma página, no como rutas del enrutador
    Given el visitante navega a la ruta "/"
    When pulsa el enlace de la cabecera cuyo destino es "#servicios"
    Then el pathname de la URL sigue siendo exactamente "/"
    And el fragmento de la URL pasa a ser exactamente "#servicios"
    And Landing.tsx sigue montado: no se desmonta ni se sustituye por el contenido de ninguna otra ruta

  @s9
  Scenario: Cabecera arranca con la rama correspondiente al ancho real de la ventana en el momento del montaje
    Given "window.innerWidth" vale un ancho de escritorio, igual o mayor que el punto de corte que declara "cabecera_y_navegacion.feature" @s1, antes de montar la aplicación
    When se monta la aplicación completa
    Then la cabecera muestra la región "Navegación principal" con sus 8 enlaces
    And no existe ningún botón con nombre accesible "Abrir menú"

  @s10
  Scenario: Redimensionar la ventana real actualiza la rama de Cabecera sin recargar la página
    Given la aplicación está montada con "window.innerWidth" en un ancho de escritorio y la región "Navegación principal" visible
    When "window.innerWidth" pasa a un ancho menor que el punto de corte declarado y el navegador dispara el evento "resize"
    Then la región "Navegación principal" deja de existir
    And aparece un botón cuyo nombre accesible es "Abrir menú"

  @s11
  Scenario: Antes de la primera medición, Cabecera recibe un ancho inicial que cae en la rama móvil
    Given la aplicación se monta en un entorno donde "window.innerWidth" todavía no se ha leído ni una sola vez
    When se renderiza la cabecera con el primer ancho que App.tsx le pasa, antes de cualquier evento "resize"
    Then la cabecera muestra la rama móvil: existe el botón "Abrir menú"
    And no existe la región "Navegación principal"

  @s12
  Scenario: Las rutas de subpágina sin página propia todavía sirven el catch-all "página no encontrada" con enlace de vuelta
    Given "/blog" y "/tienda" son destinos de subpágina que "src/data/navegacion.ts" declara en "ENLACES_NAVEGACION" y que "cabecera_y_navegacion.feature" @s5 ya contrata como destino de los enlaces "Blog" y "Tienda", y que todavía no tienen su propia página (features 17 y 18, `spec_ready`); "/campanas" comparte esa misma fuente pero queda fuera de este escenario porque `pagina_campanas` (id 16, `done`) ya le dio su propia `<Route>` real
    When el visitante navega a cada una de esas dos rutas, una por una
    Then en las dos se muestra exactamente un encabezado cuyo nombre accesible es "Página no encontrada"
    And en las dos existe un enlace cuyo nombre accesible es "Volver al inicio" y cuyo destino es exactamente "/"
    And en las dos siguen presentes el elemento con rol "contentinfo" y el enlace del logotipo del shell común

  @s13
  Scenario: Cualquier otra ruta no registrada por deep-link recibe el mismo catch-all, nunca una pantalla en blanco
    Given el visitante llega directamente, por enlace externo o recarga, a una ruta que el enrutador no registra, por ejemplo "/esto-no-existe"
    When se monta la aplicación en esa ruta
    Then se muestra el mismo encabezado "Página no encontrada" que en @s12
    And existe el mismo enlace "Volver al inicio" con destino "/"
    And el documento no queda vacío: el elemento con rol "contentinfo" y el enlace del logotipo del shell común siguen presentes

  @s14
  Scenario: SelectorPaleta no altera el orden de las 8 secciones ancladas de la landing
    Given SelectorPaleta se renderiza en cualquier punto del árbol del shell común
    When se recorre el documento de la ruta "/" en el orden real de aparición
    Then el orden relativo de los 7 id de ancla y de la región "Campañas de prevención" fijado en @s3 no cambia
    And ni el botón "Cambiar paleta de color" ni su panel se interponen entre dos de esas 8 secciones en el orden de lectura

  @s15
  Scenario: El proyecto compila y arranca con el ensamblaje en su sitio
    Given "src/main.tsx", "src/App.tsx" y "src/pages/Landing.tsx" existen tal como fija este contrato
    When se ejecutan "pnpm run build" y, por separado, "pnpm run preview" sobre su resultado
    Then [Decisión 11 — no medible dentro de jsdom/Vitest: no hay proceso de build ni servidor real en ese entorno; verificado con línea de comandos y navegador real, fuera del gate de Vitest/Stryker] "pnpm run build" termina con código de salida 0, sin errores de TypeScript ni de Vite
    And [misma nota de la Decisión 11] la ruta "/" servida por "pnpm run preview" carga sin ningún error en la consola del navegador
