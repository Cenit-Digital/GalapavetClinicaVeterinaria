# FUENTE DEL COMPORTAMIENTO
# - feature_list.json, feature 19 «accesibilidad» (5 criterios de aceptación),
#   declarada PUERTA TRANSVERSAL DE CIERRE del proyecto.
# - project-spec.md → «Transversales»: «Criterios WCAG 2.2 AA verificables:
#   contraste, área táctil mínima, foco visible, prefers-reduced-motion, y cero
#   violaciones de axe en cada página». Invariante 4 (el estado base en CSS es el
#   estado final visible), invariante 5 (el estado condicional vive en un atributo
#   ARIA consultable, nunca en un className) e invariante 7 (cero errores y cero
#   warnings).
# - docs/datos-galapavet.md: única fuente admitida de datos de negocio. Esta
#   feature NO introduce ni un solo dato de negocio: no nombra teléfonos,
#   direcciones, horarios, profesionales, precios ni valoraciones. Solo mide
#   propiedades observables de la interfaz.
#
# NORMA CITADA (documentación oficial del W3C, consultada el 17/08/2026)
# Los umbrales de esta feature NO son estimaciones: se transcriben de las páginas
# «Understanding» normativas del W3C. Cada literal que aparece más abajo procede
# de una de estas fuentes:
# - SC 2.5.8 Target Size (Minimum), nivel AA:
#   https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
#   Texto normativo: «The size of the target for pointer inputs is at least
#   24 by 24 CSS pixels». VALOR EXACTO: 24 × 24 píxeles CSS. Excepciones
#   literales: (a) Spacing — «Undersized targets … are positioned so that if a
#   24 CSS pixel diameter circle is centered on the bounding box of each, the
#   circles do not intersect another target or the circle for another undersized
#   target»; (b) Equivalent — «The function can be achieved through a different
#   control on the same page that meets this criterion»; (c) Inline — «The target
#   is in a sentence or its size is otherwise constrained by the line-height of
#   non-target text»; (d) User Agent Control; (e) Essential.
#   ALCANCE DE ESTE PROYECTO: de las cinco excepciones citadas, el módulo puro
#   solo implementa y evalúa (a) Spacing (@s14) y (c) Inline (@s13).
#   (b) Equivalent, (d) User Agent Control y (e) Essential NO se implementan
#   como excepciones evaluables aquí: ningún control depende de ellas para
#   aprobar, así que el módulo puro no declara ninguna rama de decisión para
#   ellas (evita superficie mutable sin escenario que la ejercite, contra
#   `thresholds.break: 100` de `stryker.config.json`).
# - SC 1.4.3 Contrast (Minimum), nivel AA:
#   https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
#   «a contrast ratio of at least 4.5:1» para texto normal y «at least 3:1» para
#   texto grande. Texto grande = «at least 18 point or 14 point bold». La misma
#   página fija la conversión «1pt = 1.333px», de donde 18 pt = 24 px y
#   14 pt negrita = 18.66 px. Los tres números (4.5, 3, 24 / 18.66) se anclan.
# - SC 1.4.11 Non-text Contrast, nivel AA:
#   https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
#   «a contrast ratio of at least 3:1 against adjacent color(s)» para la
#   información visual necesaria para identificar componentes de interfaz y sus
#   ESTADOS, y para las partes de un gráfico necesarias para entenderlo.
# - SC 2.4.7 Focus Visible, nivel AA:
#   https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html
#   «Any keyboard operable user interface has a mode of operation where the
#   keyboard focus indicator is visible».
# - SC 2.4.11 Focus Not Obscured (Minimum), nivel AA:
#   https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html
#   «When a user interface component receives keyboard focus, the component is
#   not entirely hidden due to author-created content». (La variante 2.4.12
#   Enhanced —nada del componente queda tapado— es nivel AAA.)
# - SC 2.4.13 Focus Appearance, nivel AAA (NO es AA; se adopta como objetivo
#   propio del proyecto y así se rotula):
#   https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html
#   El indicador «is at least as large as the area of a 2 CSS pixel thick
#   perimeter of the unfocused component» y «has a contrast ratio of at least
#   3:1 between the same pixels in the focused and unfocused states».
# - SC 2.3.3 Animation from Interactions, nivel AAA, y su técnica suficiente
#   C39 «Using the CSS prefers-reduced-motion query to prevent motion»:
#   https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html
#   https://www.w3.org/WAI/WCAG22/Techniques/css/C39
#   La consulta es `prefers-reduced-motion: reduce`; C39 admite también la forma
#   inversa (`no-preference` envolviendo el movimiento), que es exactamente el
#   patrón `estado-base-visible-ssg-reduced-motion` del invariante 4.
#
# CONTRATO HEREDADO
# NINGUNO. No existe `docs/contrato-heredado/accesibilidad.feature`: el prototipo
# «Veterinaria La Sierra» no traía puerta de accesibilidad. Esta feature es nueva
# de principio a fin y no hereda ni interacción ni datos.
# Lo único que toma del resto del proyecto es QUÉ hay que auditar, y ahí sí
# manda la Decisión 2: NO existe barra superior de urgencias ni bloque rojo
# destacado de urgencias, así que el único contenido creado por el autor que
# puede tapar el foco es la CABECERA FIJA (@s17). Si alguien reintroduce una
# barra superior, @s17 deja de describir el sitio y hay que rehacerlo.
#
# POR QUÉ LOS ESCENARIOS DE VACUIDAD (@s4, @s5, @s6, @s15, @s33, @s35, @s36)
# Patrón de la memoria organizacional `verde-por-vacuidad-en-puerta-de-verificacion`:
# una puerta que deriva el conjunto vacío no emite ninguna violación y PASA EN
# VERDE habiendo mirado cero cosas; «0 fallos sobre 0 elementos» no es estar
# protegido, es no haber mirado. El mismo patrón documenta que LA PRUEBA DE
# MUTACIÓN NO DELATA ESE HUECO (en el repo de origen la brecha convivió con
# mutación al 100 %), y que la guarda va POR CADA EXTRACTOR INDEPENDIENTE, no una
# sola para toda la puerta. Aquí hay seis extractores independientes —el
# inventario de páginas, el conjunto de reglas aplicadas, el inventario de
# controles interactivos, y los TRES inventarios de color del bloque F (texto
# normal de @s29, texto grande de @s30, componentes de interfaz de @s31, cada
# uno con su propia extracción)— y cada uno tiene la suya: por eso @s33, @s35 y
# @s36 no colapsan en una sola guarda genérica de «parejas de color». @s5 añade
# la segunda mitad del veredicto según
# `medicion-de-verificacion-lleva-su-propio-control-y-cuenta-lo-ejecutado`: se
# cuenta lo REALMENTE ANALIZADO y se exige > 0, y el veredicto se lee del informe,
# nunca del código de salida del proceso.
# @s1, @s7, @s9 y @s28 son los ANCLAS POSITIVOS exigidos por el mismo patrón:
# fijan el inventario y los umbrales contra un LITERAL ESCRITO A MANO
# (patrón `doble-de-test-anclado-al-literal-no-al-simbolo`), no derivándolos de
# la constante de producción. Sin ellos, el mutador que vacía un array
# (`[...]` → `[]`) dejaría la guarda satisfecha de forma VACUA y el mutante sería
# inmortal: vaciar la lista de páginas pasaría @s4 sin que nadie note que ya no
# se audita nada.
#
# POR QUÉ NINGÚN Then HABLA DE CLASES CSS
# Este repositorio corre los tests con los CSS Modules desactivados y prohíbe
# aseverar sobre clases. Todo Then de esta feature se afirma sobre: el rol
# accesible, el nombre accesible, los atributos ARIA, el recuento de violaciones
# del análisis, o una MAGNITUD CALCULADA (píxeles CSS declarados para el área de
# contacto, ratio de contraste calculado a partir de dos colores). Ninguna
# aserción lee un `className` ni compara nombres de clase.
#
# QUÉ SE VERIFICA CON NAVEGADOR REAL Y QUÉ SE VERIFICA CON MÓDULO PURO
# (Decisión 11, project-spec.md, 18/08/2026)
# Cuatro cláusulas de esta puerta no son mensurables en jsdom: la regla
# `target-size` de axe-core que arrastra @s7 (WCAG 2.2 AA) dentro de @s2, la
# geometría de la cabecera fija de @s17, la geometría y el contraste de
# píxeles renderizados del indicador de foco de @s18, y la animación CSS en
# curso de @s19. Las cuatro se verifican con NAVEGADOR REAL (extensión Claude
# in Chrome / skill `browser-automation`), fuera del gate de Vitest/Stryker, y
# cada una de ellas lo declara en su propio escenario.
# El área de contacto de @s9-@s15, en cambio, SÍ se resuelve como lógica pura
# consultable, igual que el inventario de parejas de color de @s29: @s10 mide
# un valor DECLARADO en el módulo puro que calcula el layout de cada control
# (Invariante 6), no un píxel efectivamente renderizado. Por eso @s10-@s15 no
# llevan la cláusula de navegador real y @s2/@s17/@s18/@s19 sí.
#
# DÓNDE VIVE LA LÓGICA DE ESTA PUERTA
# El inventario, los umbrales anclados y el veredicto de cada bloque (páginas,
# reglas, controles interactivos, excepciones de área táctil, parejas de
# color) viven en un módulo puro bajo `src/lib/**/*.ts` o `*-logica.ts`
# (Invariante 6, project-spec.md). `stryker.config.json` limita `mutate` a
# esos mismos globs: si esta lógica se escribe en el `.tsx` o en el propio
# fichero de test, StrykerJS no genera mutantes para ella y la puerta "cierra"
# con mutación al 100 % sobre una superficie vacía.
#
# PENDIENTE
# - PENDIENTE: las RUTAS (URL) concretas de las seis páginas no están decididas
#   todavía. El ancla @s1 fija por tanto los seis NOMBRES de página del inventario,
#   que sí están decididos por project-spec.md y feature_list.json (features 16,
#   17 y 18). Cuando las rutas existan, el literal de @s1 debe pasar a incluirlas
#   en el mismo commit; añadir una página sin ampliar ese literal es exactamente
#   el agujero que @s4 y @s5 intentan cerrar.
# - PENDIENTE: la lista de parejas de color realmente usadas en la interfaz la
#   fija la feature `tokens_marca` (feature 1), que es quien CALCULA los ratios.
#   Esta puerta no recalcula la paleta: comprueba que ninguna pareja usada en la
#   interfaz baja de los umbrales anclados aquí. Si `tokens_marca` cambia una
#   pareja, la puerta debe volverse roja sola.
# - PENDIENTE: el valor concreto del grosor y el color del indicador de foco no
#   está decidido; @s18 fija la EXIGENCIA (área ≥ perímetro de 2 px CSS y
#   contraste ≥ 3:1 entre estado con foco y sin foco), no el valor elegido.
# - PENDIENTE: SC 2.4.13 y SC 2.3.3 son nivel AAA. Se adoptan como objetivo del
#   proyecto y así quedan rotulados; el nivel de conformidad declarado del sitio
#   sigue siendo AA.

Feature: Puerta de accesibilidad WCAG 2.2 AA
  Como visitante que navega con teclado, con lector de pantalla, con baja visión
  o con sensibilidad al movimiento
  Quiero que cada página del sitio de Galapavet sea perceptible y operable
  Para poder informarme y pedir cita sin depender de ver ni de usar un ratón.

  # ---------------------------------------------------------------------------
  # A. LA PUERTA DE ANÁLISIS AUTOMÁTICO
  # ---------------------------------------------------------------------------

  @s1
  Scenario: El inventario de páginas auditadas es exactamente la lista escrita a mano
    Given un literal escrito a mano en el propio escenario con seis nombres de página: "Landing", "Campañas", "Ficha de campaña", "Blog", "Artículo del blog" y "Tienda"
    When se consulta el inventario de páginas que la puerta de accesibilidad debe auditar
    Then el inventario contiene exactamente 6 páginas
    And el inventario contiene cada uno de los seis nombres del literal escrito a mano
    And el inventario no contiene ningún nombre que no esté en ese literal
    And el literal del escenario está escrito carácter a carácter y no se obtiene del inventario que comprueba

  @s2
  Scenario: Cada página del inventario pasa el análisis automático sin ninguna violación
    Given el sitio de Galapavet construido y las seis páginas del inventario disponibles
    And esta verificación se ejecuta con navegador real (Claude in Chrome / skill browser-automation), fuera del gate de Vitest/Stryker, según la Decisión 11 de project-spec.md, porque la regla target-size de axe-core exige layout real que jsdom no calcula
    When se ejecuta el análisis automático de accesibilidad sobre el inventario completo
    Then el recuento total de violaciones es exactamente 0
    And el recuento de páginas efectivamente analizadas es exactamente 6
    And el veredicto se lee del informe del análisis y no del código de salida del proceso

  @s3
  Scenario: Una sola violación en una sola página suspende la puerta y la identifica
    Given un inventario de seis páginas en el que una tiene un control interactivo sin nombre accesible
    When se ejecuta el análisis automático de accesibilidad sobre el inventario completo
    Then el veredicto de la puerta es suspenso
    And el informe nombra la página donde está la violación
    And el informe nombra el criterio de conformidad incumplido
    And el informe identifica el elemento concreto que la provoca
    And el recuento de páginas efectivamente analizadas sigue siendo exactamente 6

  @s4
  Scenario: Con el inventario de páginas vacío la puerta falla cerrada
    Given un inventario de páginas sin ninguna entrada
    When se ejecuta la puerta de accesibilidad
    Then el veredicto de la puerta es suspenso
    And el informe declara que el inventario de páginas está vacío y que no hay nada que auditar
    And el veredicto no es aprobado en ningún caso
    And el informe no afirma en ningún momento que no haya violaciones

  @s5
  Scenario: Si no se analiza ninguna página de verdad la puerta falla cerrada aunque el inventario no esté vacío
    Given un inventario con seis páginas cuyo análisis no llega a ejecutarse sobre ninguna de ellas
    When se ejecuta la puerta de accesibilidad
    Then el recuento de páginas efectivamente analizadas es 0
    And el veredicto de la puerta es suspenso
    And el informe declara que se analizaron 0 páginas de las 6 esperadas
    And el veredicto no es aprobado en ningún caso

  @s6
  Scenario: Si el análisis no aplica ninguna regla la puerta falla cerrada
    Given un análisis configurado con un conjunto de reglas de conformidad vacío
    When se ejecuta la puerta de accesibilidad sobre el inventario completo
    Then el recuento de reglas aplicadas es 0
    And el veredicto de la puerta es suspenso
    And el informe declara que no se aplicó ninguna regla
    And el veredicto no es aprobado pese a que el recuento de violaciones también sea 0

  @s7
  Scenario: El conjunto de niveles de conformidad exigidos es exactamente el escrito a mano
    Given un literal escrito a mano en el propio escenario con cinco niveles de conformidad: WCAG 2.0 A, WCAG 2.0 AA, WCAG 2.1 A, WCAG 2.1 AA y WCAG 2.2 AA
    When se consulta el conjunto de niveles de conformidad que la puerta exige al análisis
    Then el conjunto contiene exactamente 5 niveles
    And el conjunto contiene cada uno de los cinco niveles del literal escrito a mano
    And el conjunto no contiene ningún nivel que no esté en ese literal
    And el literal del escenario está escrito carácter a carácter y no se obtiene del conjunto que comprueba

  @s8
  Scenario: Una página que no se puede cargar suspende la puerta en vez de contarse como limpia
    Given un inventario de seis páginas en el que una no llega a cargarse
    When se ejecuta el análisis automático de accesibilidad sobre el inventario completo
    Then el veredicto de la puerta es suspenso
    And el informe nombra la página que no se pudo cargar
    And esa página no se cuenta entre las páginas efectivamente analizadas
    And esa página no se cuenta como página sin violaciones

  # ---------------------------------------------------------------------------
  # B. ÁREA TÁCTIL MÍNIMA — SC 2.5.8 Target Size (Minimum), nivel AA
  # ---------------------------------------------------------------------------

  @s9
  Scenario: El área táctil mínima exigida es exactamente 24 píxeles CSS en ambos lados
    Given el literal 24 escrito a mano en el propio escenario, transcrito de «at least 24 by 24 CSS pixels» del criterio 2.5.8
    When se consulta el mínimo de área táctil que la puerta exige a un control interactivo
    Then el mínimo de ancho exigido es exactamente 24
    And el mínimo de alto exigido es exactamente 24
    And ese literal está escrito carácter a carácter y no se obtiene del valor que comprueba

  @s10
  Scenario: Todo control interactivo alcanza el área táctil mínima
    Given el inventario de controles interactivos de las seis páginas
    When se mide el área de contacto declarada de cada control interactivo
    Then el ancho medido de cada control es mayor o igual que 24 píxeles CSS
    And el alto medido de cada control es mayor o igual que 24 píxeles CSS
    And esa área sale de un valor declarado en el módulo puro que calcula el layout de cada control (Invariante 6 de project-spec.md), no de una medición del render
    And el recuento de controles efectivamente medidos es mayor que 0
    And ningún control queda sin medir por no reconocerse su tipo

  @s11
  Scenario: Un control que se queda un píxel por debajo del mínimo suspende la puerta
    Given un control interactivo cuya área de contacto medida es de 23 por 24 píxeles CSS
    And ese control no está en línea dentro de una frase
    And ese control no cumple la excepción de espaciado
    When se evalúa ese control contra el criterio de área táctil mínima
    Then el veredicto para ese control es suspenso
    And el informe indica el valor medido 23 y el valor exigido 24

  @s12
  Scenario: Un control que mide exactamente el mínimo aprueba la puerta
    Given un control interactivo cuya área de contacto medida es de exactamente 24 por 24 píxeles CSS
    When se evalúa ese control contra el criterio de área táctil mínima
    Then el veredicto para ese control es aprobado
    And el informe no emite ninguna violación de área táctil para ese control

  @s13
  Scenario: Un enlace dentro de una frase queda exento por la excepción «en línea»
    Given un enlace cuya área de contacto medida es menor de 24 por 24 píxeles CSS
    And ese enlace está contenido dentro de una frase de texto corrido
    When se evalúa ese enlace contra el criterio de área táctil mínima
    Then el veredicto para ese enlace es aprobado por la excepción «en línea»
    And el informe declara qué excepción se aplicó
    And esa excepción no se aplica a ningún control que no esté dentro de una frase

  @s14
  Scenario: Un control pequeño con separación suficiente queda exento por la excepción de espaciado
    Given un control interactivo cuya área de contacto medida es menor de 24 por 24 píxeles CSS
    And al centrar sobre su rectángulo un círculo de 24 píxeles CSS de diámetro ese círculo no interseca ningún otro control ni el círculo de otro control pequeño
    When se evalúa ese control contra el criterio de área táctil mínima
    Then el veredicto para ese control es aprobado por la excepción de espaciado
    And el informe declara qué excepción se aplicó
    And el diámetro empleado en la comprobación es exactamente 24 píxeles CSS

  @s15
  Scenario: Con el inventario de controles interactivos vacío la puerta falla cerrada
    Given un inventario de controles interactivos sin ninguna entrada
    When se ejecuta la comprobación de área táctil mínima
    Then el recuento de controles efectivamente medidos es 0
    And el veredicto de la puerta es suspenso
    And el informe declara que no se midió ningún control interactivo
    And el veredicto no es aprobado pese a que el recuento de violaciones de área táctil sea 0

  # ---------------------------------------------------------------------------
  # C. FOCO — SC 2.4.7 (AA), SC 2.4.11 (AA) y SC 2.4.13 (AAA, objetivo propio)
  # ---------------------------------------------------------------------------

  @s16
  Scenario: El foco es visible en todos los controles interactivos
    Given el inventario de controles interactivos de las seis páginas
    When cada control interactivo recibe el foco por teclado
    Then cada control expone un indicador de foco distinguible de su estado sin foco
    And ningún control suprime el indicador de foco sin sustituirlo por otro
    And el recuento de controles a los que se dio foco es mayor que 0
    And el control que tiene el foco es el mismo que el navegador declara como elemento activo

  @s17
  Scenario: La cabecera fija no oculta por completo el control que recibe el foco
    Given una página desplazada de modo que el siguiente control enfocable quedaría bajo la cabecera fija
    And esta verificación se ejecuta con navegador real (Claude in Chrome / skill browser-automation), fuera del gate de Vitest/Stryker, según la Decisión 11 de project-spec.md, porque depende del rectángulo real de la cabecera fija y del control
    When ese control recibe el foco por teclado
    Then el control enfocado no queda enteramente tapado por la cabecera fija
    And al menos parte del control enfocado queda dentro del área visible
    And no existe ninguna barra superior adicional que pueda taparlo

  @s18
  Scenario: El indicador de foco alcanza el área y el contraste exigidos
    Given el inventario de controles interactivos de las seis páginas
    And esta verificación se ejecuta con navegador real (Claude in Chrome / skill browser-automation), fuera del gate de Vitest/Stryker, según la Decisión 11 de project-spec.md, porque exige píxeles efectivamente renderizados en dos estados
    When cada control interactivo recibe el foco por teclado
    Then el área del indicador de foco de cada control es al menos la de un perímetro de 2 píxeles CSS de grosor alrededor del control sin foco
    And el ratio de contraste calculado entre los mismos píxeles en estado con foco y sin foco es mayor o igual que 3
    And ese umbral 3 está escrito a mano en el escenario y no se obtiene del valor que comprueba
    And el recuento de controles a los que se comprobó el área y el contraste del indicador de foco es mayor que 0

  # ---------------------------------------------------------------------------
  # D. MOVIMIENTO — SC 2.3.3 y técnica C39 (`prefers-reduced-motion`)
  # ---------------------------------------------------------------------------

  @s19
  Scenario: Con la preferencia de menos movimiento ninguna animación se reproduce
    Given un visitante que ha pedido menos movimiento en su sistema
    And esta verificación se ejecuta con navegador real (Claude in Chrome / skill browser-automation), fuera del gate de Vitest/Stryker, según la Decisión 11 de project-spec.md, porque exige interrogar el motor de animaciones CSS con las hojas de estilo aplicadas
    When se carga cualquiera de las seis páginas del inventario
    Then ningún elemento de la página tiene una animación en curso
    And ninguna transición de aparición se ejecuta
    And ningún desplazamiento solicitado por la página es suavizado
    And el recuento de elementos comprobados es mayor que 0

  @s20
  Scenario: Con la preferencia de menos movimiento el contenido que se revelaba animándose está visible
    Given un visitante que ha pedido menos movimiento en su sistema
    When se carga cualquiera de las seis páginas del inventario
    Then todo el contenido que en condiciones normales aparece mediante una animación está visible desde el primer momento
    And ningún bloque queda invisible por no haberse ejecutado su animación
    And el análisis automático de accesibilidad de esa página sigue devolviendo 0 violaciones
    And el recuento de bloques que en condiciones normales aparecen mediante una animación es mayor que 0

  @s21
  Scenario: Si la preferencia de movimiento no se puede consultar se actúa como si se hubiera pedido menos movimiento
    Given un entorno en el que la consulta de la preferencia de movimiento no está disponible
    When se carga cualquiera de las seis páginas del inventario
    Then ninguna animación se reproduce
    And todo el contenido está visible desde el primer momento
    And no se produce ningún error en la consola
    And el recuento de elementos comprobados es mayor que 0

  @s22
  Scenario: Sin la preferencia de menos movimiento la animación sí se reproduce
    Given un visitante que no ha pedido menos movimiento en su sistema
    When se carga la página del inventario que contiene un elemento animado
    Then ese elemento tiene una animación en curso
    And el recuento de elementos con animación en curso es mayor que 0
    And ese contenido queda igualmente visible al terminar la animación

  # ---------------------------------------------------------------------------
  # E. OPERACIÓN CON TECLADO
  # ---------------------------------------------------------------------------

  @s23
  Scenario: La página entera se recorre con el tabulador en el orden de lectura
    Given cualquiera de las seis páginas del inventario
    When el visitante recorre la página entera pulsando el tabulador
    Then todos los controles interactivos de la página reciben el foco en algún momento del recorrido
    And el orden en que reciben el foco coincide con el orden en que aparecen en el contenido
    And el foco nunca queda atrapado en un control sin poder avanzar
    And el número de paradas del recorrido es mayor que 0

  @s24
  Scenario: El menú móvil se abre con el teclado y anuncia su estado
    Given una página mostrada por debajo del breakpoint del menú móvil
    And el botón de menú tiene el foco y su atributo aria-expanded vale "false"
    When el visitante activa el botón de menú con el teclado
    Then el atributo aria-expanded del botón de menú pasa a valer "true"
    And los enlaces de navegación pasan a ser alcanzables con el tabulador
    And el nombre accesible del botón de menú sigue sin estar vacío

  @s25
  Scenario: El menú móvil se cierra con Escape y devuelve el foco al botón que lo abrió
    Given un menú móvil abierto cuyo botón tiene el atributo aria-expanded a "true"
    When el visitante pulsa la tecla Escape
    Then el atributo aria-expanded del botón de menú pasa a valer "false"
    And el foco vuelve al botón de menú
    And los enlaces del menú dejan de ser alcanzables con el tabulador

  @s26
  Scenario: Un panel del acordeón se expande con el teclado y anuncia su estado
    Given un acordeón cuyo primer control de cabecera tiene el atributo aria-expanded a "false"
    When el visitante activa ese control de cabecera con el teclado
    Then el atributo aria-expanded de ese control pasa a valer "true"
    And el contenido asociado a ese control queda visible
    And el foco permanece en el control de cabecera que se acaba de activar

  @s27
  Scenario: El contenido colapsado del acordeón no es alcanzable con el tabulador
    Given un acordeón con todos sus controles de cabecera con aria-expanded a "false"
    When el visitante recorre el acordeón pulsando el tabulador
    Then el foco solo se detiene en los controles de cabecera
    And ningún control situado dentro de un panel colapsado recibe el foco
    And el recuento de paradas en los controles de cabecera es mayor que 0
    And el recuento de paradas dentro de los paneles colapsados es exactamente 0

  # ---------------------------------------------------------------------------
  # F. CONTRASTE — SC 1.4.3 (AA) y SC 1.4.11 (AA)
  # ---------------------------------------------------------------------------

  @s28
  Scenario: Los umbrales de contraste exigidos son exactamente los del criterio
    Given los literales 4.5, 3, 24 y 18.66 escritos a mano en el propio escenario, transcritos de «at least 4.5:1», «at least 3:1» y «at least 18 point or 14 point bold» con la conversión 1 pt = 1.333 px
    When se consultan los umbrales de contraste que la puerta exige
    Then el umbral exigido a texto normal es exactamente 4.5
    And el umbral exigido a texto grande es exactamente 3
    And el tamaño a partir del cual un texto se considera grande es exactamente 24 píxeles CSS
    And el tamaño a partir del cual un texto en negrita se considera grande es exactamente 18.66 píxeles CSS
    And esos literales están escritos carácter a carácter y no se obtienen de los valores que comprueban

  @s29
  Scenario: Todo texto normal alcanza el contraste mínimo frente a su fondo
    Given el inventario de parejas de color usadas para texto normal en las seis páginas
    When se calcula el ratio de contraste de cada pareja
    Then el ratio calculado de cada pareja es mayor o igual que 4.5
    And el recuento de parejas efectivamente calculadas es mayor que 0
    And ninguna pareja queda sin calcular por no reconocerse su fondo

  @s30
  Scenario: Todo texto grande alcanza el contraste mínimo frente a su fondo
    Given el inventario de parejas de color usadas para texto de al menos 24 píxeles CSS, o de al menos 18.66 píxeles CSS en negrita
    When se calcula el ratio de contraste de cada pareja
    Then el ratio calculado de cada pareja es mayor o igual que 3
    And un texto de 23 píxeles CSS sin negrita no se clasifica como texto grande
    And un texto de 18 píxeles CSS en negrita no se clasifica como texto grande
    And un texto de exactamente 24 píxeles CSS sin negrita sí se clasifica como texto grande
    And un texto de exactamente 18.66 píxeles CSS en negrita sí se clasifica como texto grande
    And el recuento de parejas efectivamente calculadas es mayor que 0

  @s31
  Scenario: Los componentes de interfaz y sus estados alcanzan el contraste mínimo frente a lo que los rodea
    Given el inventario de bordes, iconos e indicadores de estado necesarios para identificar los controles de las seis páginas
    When se calcula el ratio de contraste de cada uno frente a su color adyacente
    Then el ratio calculado de cada uno es mayor o igual que 3
    And la información visual que distingue un control activo de uno inactivo alcanza también ese ratio
    And el recuento de elementos efectivamente calculados es mayor que 0

  @s32
  Scenario: Una pareja que se queda justo por debajo del umbral suspende la puerta
    Given una pareja de colores usada para texto normal cuyo ratio de contraste calculado es 4.49
    When se evalúa esa pareja contra el umbral de texto normal
    Then el veredicto para esa pareja es suspenso
    And el informe indica el ratio calculado 4.49 y el umbral exigido 4.5
    And el informe nombra la pareja de colores implicada

  @s34
  Scenario: Una pareja que alcanza exactamente el umbral exigido aprueba la puerta
    Given una pareja de colores usada para texto normal cuyo ratio de contraste calculado es exactamente 4.5
    And una pareja de colores usada para texto grande cuyo ratio de contraste calculado es exactamente 3
    When se evalúa cada pareja contra el umbral que le corresponde
    Then el veredicto para la pareja de texto normal es aprobado
    And el veredicto para la pareja de texto grande es aprobado
    And ninguna de las dos parejas genera una violación de contraste

  @s33
  Scenario: Con el inventario de parejas de color de texto normal vacío la puerta falla cerrada
    Given un inventario de parejas de color usadas para texto normal sin ninguna entrada
    When se ejecuta la comprobación de contraste de texto normal
    Then el recuento de parejas efectivamente calculadas es 0
    And el veredicto de la puerta es suspenso
    And el informe declara que no se calculó ninguna pareja de color de texto normal
    And el veredicto no es aprobado pese a que el recuento de violaciones de contraste sea 0

  @s35
  Scenario: Con el inventario de parejas de color de texto grande vacío la puerta falla cerrada
    Given un inventario de parejas de color usadas para texto grande sin ninguna entrada
    When se ejecuta la comprobación de contraste de texto grande
    Then el recuento de parejas efectivamente calculadas es 0
    And el veredicto de la puerta es suspenso
    And el informe declara que no se calculó ninguna pareja de color de texto grande
    And el veredicto no es aprobado pese a que el recuento de violaciones de contraste sea 0

  @s36
  Scenario: Con el inventario de componentes de interfaz vacío la puerta falla cerrada
    Given un inventario de bordes, iconos e indicadores de estado sin ninguna entrada
    When se ejecuta la comprobación de contraste de componentes de interfaz
    Then el recuento de elementos efectivamente calculados es 0
    And el veredicto de la puerta es suspenso
    And el informe declara que no se calculó ningún componente de interfaz
    And el veredicto no es aprobado pese a que el recuento de violaciones de contraste sea 0
