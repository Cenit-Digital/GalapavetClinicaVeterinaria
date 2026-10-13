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

  # @s17 REVISADO (13/10/2026, feature 49 `cabecera_sobre_el_hero`): SIN CAMBIO DE
  # LETRA. Una cabecera transparente sigue siendo «la cabecera fija»: el criterio es
  # por RECTÁNGULO, no por opacidad. SC 2.4.11 habla de un componente «entirely
  # hidden due to author-created content», y que la cabecera sea transparente no
  # reduce el solape (inferencia de la investigación del 13/10/2026; ninguna página
  # Understanding leída trata cabeceras translúcidas). El hueco que lo hace cumplir,
  # `scroll-padding-top`, y el desplazamiento del enlace de salto al enfocar no
  # cambian: cabecera_sobre_el_hero @s8. Sigue sin existir «ninguna barra superior
  # adicional»: la cabecera mide 64 px en sus dos estados.
  @s17
  Scenario: La cabecera fija no oculta por completo el control que recibe el foco
    Given una página desplazada de modo que el siguiente control enfocable quedaría bajo la cabecera fija
    And esta verificación se ejecuta con navegador real (Claude in Chrome / skill browser-automation), fuera del gate de Vitest/Stryker, según la Decisión 11 de project-spec.md, porque depende del rectángulo real de la cabecera fija y del control
    When ese control recibe el foco por teclado
    Then el control enfocado no queda enteramente tapado por la cabecera fija
    And al menos parte del control enfocado queda dentro del área visible
    And no existe ninguna barra superior adicional que pueda taparlo

  # @s18, UNA CLÁUSULA ENMENDADA Y UNA AÑADIDA (13/10/2026, feature 49). Texto
  # literal retirado de la segunda cláusula del «Then»: «And el ratio de contraste
  # calculado entre los mismos píxeles en estado con foco y sin foco es mayor o
  # igual que 3».
  # POR QUÉ. El texto ya hablaba de «los mismos píxeles», pero la puerta que lo
  # ejecuta (`tests/e2e/accesibilidad.spec.ts`, las dos funciones que resuelven el
  # fondo subiendo por los ancestros hasta el primer color no transparente) mide
  # contra el color COMPUTADO del primer ancestro con fondo. Con la cabecera
  # transparente sobre la foto ese ancestro es `body`: se mide contra el fondo de la
  # página y no contra la fotografía. Resultado: verde por vacuidad con un anillo que
  # no se ve, o falso rojo con un anillo claro sobre una página clara. Es el defecto
  # que la 39 llamó una puerta que «parece morder y no muerde». Se reescribe para que
  # lea PÍXELES (capturas del navegador); el método y los sabotajes que demuestran
  # que ahora puede ponerse roja son cabecera_sobre_el_hero @s10, @s11 y @s12.
  # AÑADIDA: que la cabecera cuente entre los controles comprobados, porque la
  # puerta solo mira los 20 primeros de cada ruta y un contrato no puede depender de
  # que la cabecera caiga dentro.
  # PUERTA QUE MUERDE: el anillo de los enlaces de la cabecera pasa a `--color-foco`
  # (1,98:1 sobre el velo vertical de antes, medido): la medición sobre la marca, a la
  # izquierda y bajo el tramo más oscuro del velo, lo suspende. La foto no carga:
  # «no se midió» y suspende (cabecera_sobre_el_hero @s12).
  @s18
  Scenario: El indicador de foco alcanza el área y el contraste exigidos
    Given el inventario de controles interactivos de las seis páginas
    And esta verificación se ejecuta con navegador real (Claude in Chrome / skill browser-automation), fuera del gate de Vitest/Stryker, según la Decisión 11 de project-spec.md, porque exige píxeles efectivamente renderizados en dos estados
    When cada control interactivo recibe el foco por teclado
    Then el área del indicador de foco de cada control es al menos la de un perímetro de 2 píxeles CSS de grosor alrededor del control sin foco
    And el ratio de contraste calculado entre los mismos píxeles en estado con foco y sin foco es mayor o igual que 3, leídos de capturas del navegador sobre lo que de verdad hay pintado: sobre la fotografía del hero, con la cabecera transparente, el valor es el del peor píxel de la zona del anillo, nunca el fondo computado de un ancestro, que en esa zona es el de la página
    And ese umbral 3 está escrito a mano en el escenario y no se obtiene del valor que comprueba
    And el recuento de controles a los que se comprobó el área y el contraste del indicador de foco es mayor que 0
    And entre ellos están la marca y los ocho enlaces de la cabecera de la portada con la cabecera transparente, y los de una subpágina con la cabecera sólida

  # ---------------------------------------------------------------------------
  # D. MOVIMIENTO — SC 2.3.3 y técnica C39 (`prefers-reduced-motion`)
  # ---------------------------------------------------------------------------
  #
  # ===========================================================================
  # SEGUNDO CAMBIO DE POLÍTICA DE MOVIMIENTO (13/10/2026) — VUELVE UNA ANIMACIÓN
  # POR FOTOGRAMAS CLAVE, SOLO EN EL HERO. ESTA NOTA SUPERA A LA DE DEBAJO EN LO
  # QUE LA CONTRADICE; LA DE DEBAJO SE CONSERVA COMO HISTORIA Y PARA LO QUE SIGUE
  # SIENDO CIERTO.
  # ===========================================================================
  #
  # QUIÉN LO DECIDIÓ Y CUÁNDO: Pablo, 13/10/2026, respuesta P1 a la pregunta
  # «¿reabrir la política de cero animaciones del 20/09 para la entrada del
  # hero?»: «Sí, 0,7 s escalonada: titular, párrafo (+120 ms) y botón (+240 ms),
  # recorrido de 40 px, se amplía la escala de movimiento con un paso de 0,7 s, sin
  # animación si el sistema pide reducir movimiento»
  # (`progress/decisiones_cabecera_hero_20261013.md` §4). ESA APROBACIÓN ES LA
  # PUERTA HUMANA que exigía @s20 de este fichero y la feature 39 (F2).
  #
  # LO QUE CAMBIA, con nombre y apellidos:
  #   · El sitio vuelve a tener EXACTAMENTE UNA aparición animada: la entrada de
  #     los tres elementos del hero. Sus valores y sus puertas viven en
  #     hero_reducido_con_animacion @s5-@s9. Ya NO es cierto que haya cero
  #     declaraciones `animation:` ni cero `@keyframes` en `src/`.
  #   · La escala de movimiento (150 y 300 ms) se amplía con un paso de 700 ms y
  #     los retardos 0/120/240 ms: identidad_visual @s16.
  #   · @s19 gana un sujeto (los tres elementos del hero deben apagarse con
  #     `reduce`); @s20 pasa de «el recuento es exactamente 0» a «el recuento es
  #     mayor que 0 y todos son del hero»; @s21 conserva su letra; y @s22 recupera
  #     lo que la feature 39 le quitó (la animación por fotogramas clave en curso y
  #     el contenido visible al terminar), tal como esa feature anunciaba: «este
  #     escenario es el sitio donde vuelve».
  #
  # LO QUE NO CAMBIA:
  #   · Con la preferencia de menos movimiento NADA se anima: ni la entrada ni los
  #     retardos. El anulador global de `reduce` NO es una red de seguridad: tiene
  #     especificidad 0 y pierde ante cualquier regla del autor que declare
  #     `animation` o `animation-duration` (medido en Chromium: con la animación
  #     declarada fuera de `no-preference`, bajo `reduce` corre con sus 700 ms y no
  #     con los 0,01 ms), y además no toca `animation-delay`. Por eso `animation`,
  #     `animation-name` y los retardos viven SOLO dentro de `no-preference`
  #     (hero_reducido_con_animacion @s6 y @s8).
  #   · Las demás animaciones del sitio siguen necesitando SU puerta humana. La
  #     aprobación de Pablo cubre la entrada del hero y nada más. Las de la galería
  #     (feature 40) quedan desbloqueadas en la política pero no aprobadas, y @s20
  #     las caza.
  #   · El resto de la nota de debajo (las 13 `transition:` y el desplazamiento
  #     suave) sigue siendo cierto.
  #
  # WCAG, para quien se pregunte si esto exige un control de pausa. SC 2.2.2 (nivel
  # A) alcanza al movimiento que empieza solo, dura MÁS DE 5 SEGUNDOS y se presenta
  # junto a otro contenido: la entrada entera dura 0,94 s. SC 2.3.3 (AAA) trata la
  # animación disparada por una interacción y remite a 2.2.2 para la que inicia la
  # página. La investigación lo concluye DEDUCIENDO de las tres condiciones, porque
  # ninguna de las dos páginas trata expresamente una animación corta única al
  # cargar: queda dicho así, como deducción y no como cita. De ahí que la
  # obligación de respetar `reduce` venga de la política del proyecto y no de un
  # criterio. Fuente: `progress/investigacion_cabecera_hero_20261013/docs-oficiales-accesibilidad.md`
  # §3 y §4. Lo que SÍ aplica es la advertencia de MDN sobre el desplazamiento de
  # objetos grandes: por eso el recorrido es de 40 px y no el 100 % de la referencia.
  #
  # ===========================================================================
  # CAMBIO DE POLÍTICA DE MOVIMIENTO (20/09/2026) — EL SITIO SE QUEDA SIN
  # NINGUNA ANIMACIÓN POR FOTOGRAMAS CLAVE. [SUPERADO EN LO DEL HERO EL 13/10/2026:
  # LEER ANTES LA NOTA DE ARRIBA. TODO LO QUE SIGUE SOBRE «CERO animation: Y CERO
  # @keyframes» ES HISTORIA.] ESTA ES LA NOTA DEL REPOSITORIO QUE CUENTA EL
  # ESTADO DEL 20/09/2026; EL RESTO APUNTAN AQUÍ.
  # ===========================================================================
  #
  # QUÉ SE VA, con nombre y apellidos. Las ÚNICAS dos declaraciones `animation:`
  # de todo `src/` son dos pulsos decorativos de urgencias:
  #   · `Cabecera.module.scss:188` — `.puntoUrgencias`, `animation:
  #     pulso-urgencias 1.6s ease-in-out infinite` dentro de
  #     `@media (prefers-reduced-motion: no-preference)`, más su `@keyframes` de
  #     `:294`. La borra D1 (fuera el CTA de urgencias de la cabecera).
  #   · `InformacionContacto.module.scss:199` — `.pulso`, `animation: pulso 1.6s
  #     ease-in-out infinite`, más su `@keyframes` de `:267`. La borra E1 (fuera
  #     la tarjeta roja de urgencias de contacto).
  # `global.scss:341-342` NO cuenta: es el ANULADOR de
  # `prefers-reduced-motion: reduce` (`animation-duration: 0.01ms`), clavado por
  # `src/styles/hoja-global.test.ts:161` y por `identidad_visual.feature:526`.
  #
  # QUIÉN LO DECIDIÓ: Pablo, 20/09/2026. No decidió «quitar el movimiento»:
  # decidió quitar la CARTELERÍA de urgencias, y las dos únicas animaciones del
  # sitio vivían dentro de ella. La consecuencia sobre el movimiento es un efecto
  # colateral, no un objetivo, y por eso se escribe aquí en vez de dejarse pasar.
  #
  # QUEDA REGISTRADO QUE ESTO DEJA AL SITIO AL OTRO LADO DE LO QUE EL SOCIO PIDIÓ.
  # En la grabación de la reunión del 16/08/2026 con Roberto Alonso
  # (`2026-08-16 16-14-50.mkv`; transcripción literal en
  # `progress/transcripcion_reunion_rober_20260816.txt`), hablando de la galería
  # «nuestros amiguetes», minutos 06:34-06:42:
  #     [06:34] «Vale, simplemente que pase automáticamente.»
  #     [06:37] «Pase automáticamente y ya está.»
  #     [06:38] «Que tenga un par de animaciones, que si algo aquí se haga más
  #             grande, vale un par de animaciones.»
  #     [06:42] «...par de animaciones.»
  # AVISO SOBRE ESTA CITA, para que nadie la repita mal: la frase de las
  # animaciones está en [06:38]-[06:42], NO en [06:37] —en [06:37] lo que se dice
  # es «Pase automáticamente y ya está»—. El rango honesto es 06:34-06:42; la
  # tabla de decisiones lo registra como punto 8, 06:21-06:43. Y la transcripción
  # NO etiqueta al hablante en esas líneas: la atribución a Roberto Alonso viene
  # de `progress/decisiones_reunion_rober_20260816.md`, no del audio transcrito.
  #
  # LAS ANIMACIONES DE LA GALERÍA SON TAREA APARTE, CON SU PROPIO CONTRATO, Y NO
  # SON DE ESTA TANDA. Nunca se han implementado: el punto 8 de la reunión está
  # en la tabla como trabajo pendiente identificado, no hecho. Lo que esta nota
  # registra es que el sitio pasa de «dos animaciones que el socio no pidió» a
  # «cero animaciones, con dos que el socio sí pidió todavía sin escribir».
  #
  # EL SITIO NO SE QUEDA QUIETO, Y AFIRMAR LO CONTRARIO SERÍA PASARSE DE FRENADA.
  # MEDIDO fichero a fichero, tras D1 y E1: quedan 13 declaraciones `transition:`
  # en todo `src/` —8 en 6 módulos (Cabecera:127 · Equipo:149 · Faq:58 y :80 ·
  # Galeria:67 · ReservaChat:294 · Servicios:50 y :181) y 5 en las hojas
  # compartidas (global.scss:326 · _api.scss:181, :235, :265, :308)—, más el
  # desplazamiento suave (`scroll-behavior: smooth` de `global.scss`, dentro de
  # `no-preference`). Cero en `src/pages/*.module.scss`. Lo que el sitio pierde
  # son las animaciones por fotogramas clave, no el movimiento.
  #
  # CORRECCIÓN DE UN NÚMERO PUBLICADO EN ESTE MISMO FICHERO. La nota que la
  # segunda tanda dejó escrita unas líneas más abajo decía «Solo quedan 10
  # `transition` repartidas en 7 módulos». Es FALSO en los dos números: son 8 en
  # 6 módulos (13 contando las hojas compartidas). El error venía de no advertir
  # que `InformacionContacto.module.scss` no tiene NINGUNA `transition`: al
  # perder su `animation` cae ENTERO del censo de `movimientoRespetuoso`, así que
  # el número de módulos BAJA de 7 a 6, no se queda en 7.
  #
  # QUÉ PUERTAS SE PONEN ROJAS Y CUÁLES SIGUEN MORDIENDO (medido):
  #   · ROJO, y no suavemente: `src/components/InformacionContacto.test.tsx:496-511`
  #     es el ÚNICO test del repositorio que afirma que existe una declaración
  #     `animation:`, y su ayudante LANZA cuando el bloque desaparece. Hay que
  #     borrarlo en el MISMO commit que el SCSS.
  #   · SIGUEN MORDIENDO, y son lo que salva este contrato:
  #     `tests/e2e/movimiento.spec.ts:117-120` (@s43: sin preferencia,
  #     `scroll-behavior` computa 'smooth' — la ÚNICA puerta automática viva que
  #     afirma EN POSITIVO que el sitio real se mueve),
  #     `src/lib/accesibilidad-movimiento.test.ts:113-134` (sin preferencia el
  #     desplazamiento SÍ se suaviza) y `src/components/Equipo.test.tsx:498-507`
  #     (un módulo concreto declara su `transition` dentro de `no-preference`).
  #     También `movimientoRespetuoso.test.ts` (censo 7 → 6 ficheros, sigue con
  #     margen sobre su anti-vacuidad) y `movimiento-global.test.ts` (intacto).
  #
  # VACUIDADES QUE ESTO DEJA AL DESCUBIERTO — SON SEIS CLÁUSULAS EN CUATRO
  # ESCENARIOS, no las dos que se habían señalado. @s19 (cláusulas 1 y 4), @s20
  # (las tres primeras), @s21 (cláusula 1) y @s22 entero pasaban a cumplirse
  # sobre el conjunto vacío. TODAS se enmiendan aquí abajo, en su sitio: ninguna
  # se deja en pie recorriendo una lista vacía.
  #
  # Y DOS VACUIDADES QUE SON DEL REPOSITORIO, NO DE ESTA TANDA, Y QUE HAY QUE
  # ARREGLAR AL IMPLEMENTAR:
  #   1. `tests/e2e/movimiento.spec.ts:79-94`: el contador
  #      `elementosConTransicionDeclarada` que presume de ser la anti-vacuidad de
  #      @s19 se mide BAJO `emulateMedia({reducedMotion:'reduce'})`, y bajo
  #      `reduce` el anulador global aplica `transition-duration: 0.01ms` a `*`.
  #      Cuenta TODOS los elementos del documento, siempre, hubiera o no
  #      transiciones de módulo. Su propio comentario (`:73-78`) presume de evitar
  #      el verde-por-vacuidad; no lo evita. Igual `transicionesFueraDeEscala`.
  #   2. `src/lib/accesibilidad-movimiento.test.ts:41-53`: la única puerta del
  #      «recuento de bloques animados > 0» de @s20 la alimenta un literal
  #      sintético de dos entradas del propio test («Tarjeta de campaña 1/2»).
  #      Ninguna tarjeta de campaña ha tenido jamás una `animation:` en `src/`:
  #      esa cláusula no podía ponerse roja ni antes ni después. Lo que cambia hoy
  #      no es el hecho, es que alguien lo ha mirado.
  #   Además, las cinco esperas `getAnimations().every(a => a.playState !==
  #   'running')` (`movimiento.spec.ts:21` y `:54`, `accesibilidad.spec.ts:305` y
  #   `:510`, `fidelidad.spec.ts:63`) son `every` sobre array vacío: tras esta
  #   tanda, al cargar sin interactuar resuelven al instante. Como esperas son
  #   inofensivas y HAY QUE CONSERVARLAS —`fidelidad.spec.ts:152` depende del
  #   `reduce` para que `aplicarVariante` converja—, pero sus comentarios ya no
  #   dicen la verdad y hay que reescribirlos (varios citan `global.scss:290` y
  #   `:301`, que hoy son `:326` y `:339`).
  #
  # DÓNDE VIVE ESTE ESTADO PARA EL RESTO DEL REPOSITORIO. Estos otros escenarios
  # pierden el sujeto de ANIMACIÓN pero conservan el de TRANSICIÓN, así que NO se
  # vuelven falsos y NO se enmiendan; apuntan aquí para que el estado esté en un
  # único sitio y no en cinco versiones distintas: `identidad_visual.feature` @s42
  # («el recuento de animaciones en curso es exactamente 0 en las 6 rutas»,
  # acompañada de la cláusula de transiciones, que sí tiene sujeto) y @s43, y
  # `sistema_de_diseno_visual.feature` @s33 y @s34.
  # ===========================================================================

  # @s19, CLÁUSULAS 1 Y 4 ENMENDADAS (20/09/2026, TERCERA TANDA). Decían
  # literalmente: «Then ningún elemento de la página tiene una animación en
  # curso» / «And ninguna transición de aparición se ejecuta» / «And el recuento
  # de elementos comprobados es mayor que 0». La primera y la segunda pasaban a
  # cumplirse sobre el conjunto vacío de animaciones; la cuarta la satisfacía el
  # anulador global, no ninguna transición de módulo (ver el punto 1 de las
  # vacuidades del repositorio, arriba). Se reescriben para que el sujeto sea el
  # que de verdad queda —las 13 transiciones y el desplazamiento suave— y para
  # que el recuento no pueda salir de contar el documento entero.
  # @s19, DOS CLÁUSULAS AÑADIDAS (13/10/2026, feature 48). Las cinco anteriores
  # conservan su letra, pero cambia lo que significan: «ningún elemento de la
  # página tiene una animación en curso» se cumplía sobre el conjunto vacío desde
  # el 20/09/2026, y desde hoy tiene sujeto —la entrada del hero— que `reduce`
  # tiene que apagar. Los valores computados que lo garantizan (nombre de
  # animación `none`, retardo 0 s, opacidad 1 en el primer fotograma) los fija
  # hero_reducido_con_animacion @s6; aquí solo se añaden las dos cláusulas que
  # impiden que este escenario vuelva a pasar por vacuidad.
  #
  # LO QUE ESTE ESCENARIO NO PROTEGE TAL COMO SE EJECUTA HOY. `movimiento.spec.ts`
  # ESPERA a que no quede movimiento en curso y SOLO DESPUÉS cuenta las animaciones:
  # el predicado de la espera es el de la aserción. Medido: con los fotogramas y la
  # animación declarados fuera de `no-preference`, bajo `reduce`, tras esa espera el
  # recuento sale 0 y el escenario queda VERDE con el defecto; lo que sí falla es
  # el primer fotograma (opacidad 0, nombre de animación distinto de `none` y
  # retardos computados de 0,12 y 0,24 s). Por eso la primera cláusula añadida mide
  # en el PRIMER FOTOGRAMA, sin esperar. La protección completa de la entrada del hero es
  # hero_reducido_con_animacion @s6 (primer fotograma) y @s8 (lectura de las hojas);
  # identidad_visual @s42, que tiene la misma espera, NO la protege y no se
  # presenta como si lo hiciera.
  #
  # PUERTA QUE MUERDE, cláusula por cláusula. La PRIMERA añadida (medida sin
  # esperar): `animation` o fotogramas declarados fuera de `no-preference`: bajo
  # `reduce`, en el primer fotograma, el nombre de animación computado deja de ser
  # `none` o existe algún objeto de animación por fotogramas clave, aunque ya haya
  # terminado. La SEGUNDA (la misma medida sin la preferencia): la consulta
  # `prefers-reduced-motion` MUERTA —un `no-preference` que nunca se cumple, o un
  # anulador que apaga todo con y sin preferencia—: sin la preferencia no se
  # encuentran las 3 animaciones y la cláusula falla, de modo que la primera no puede
  # pasar «porque no hay nada que apagar».
  @s19
  Scenario: Con la preferencia de menos movimiento ninguna animación se reproduce
    Given un visitante que ha pedido menos movimiento en su sistema
    And esta verificación se ejecuta con navegador real (Claude in Chrome / skill browser-automation), fuera del gate de Vitest/Stryker, según la Decisión 11 de project-spec.md, porque exige interrogar el motor de animaciones CSS con las hojas de estilo aplicadas
    When se carga cualquiera de las seis páginas del inventario
    Then ningún elemento de la página tiene una animación en curso
    And ninguna transición se ejecuta con una duración efectiva perceptible: el techo es 0,01 milisegundos
    And ningún desplazamiento solicitado por la página es suavizado
    And el recuento de elementos comprobados es mayor que 0
    And ese recuento se obtiene de los elementos que declaran movimiento en los módulos que lo declaran de verdad, y no de contar los elementos a los que la propia consulta de movimiento reducido les anula la duración, que son todos los del documento
    And entre esos elementos están los tres del hero y en ellos, medido en el PRIMER fotograma pintado y sin esperar a que cese el movimiento, el nombre de animación computado es "none" y no existe ningún objeto de animación por fotogramas clave en ningún estado de reproducción, tampoco los ya terminados
    And la misma medida sin la preferencia, con el reloj de animaciones congelado antes de navegar, encuentra 3 animaciones por fotogramas clave (@s22), lo que demuestra que la consulta discrimina de verdad y no está muerta

  # @s20, TRES CLÁUSULAS ENMENDADAS Y UNA RETIRADA (20/09/2026, TERCERA TANDA).
  # Texto literal de lo que se va:
  #     Then todo el contenido que en condiciones normales aparece mediante una
  #     animación está visible desde el primer momento
  #     And ningún bloque queda invisible por no haberse ejecutado su animación
  #     And el recuento de bloques que en condiciones normales aparecen mediante
  #     una animación es mayor que 0
  # Las dos primeras eran cuantificadores universales («todo...», «ningún...»)
  # sobre un conjunto que tras esta tanda queda vacío: se amplían a las
  # transiciones, que sí tienen sujeto. La tercera se retira porque NO PODÍA
  # PONERSE ROJA NUNCA —su única puerta la alimenta un literal sintético del
  # propio test, ver el punto 2 de las vacuidades del repositorio— y se sustituye
  # por un recuento medido con disparador, que es lo que de verdad vigila la
  # política nueva. Lo que se pierde: nada ejecutable; lo que había no se
  # ejecutaba sobre el sitio.
  # @s20, DOS CLÁUSULAS REEMPLAZADAS Y CINCO AÑADIDAS, LA ÚLTIMA CON SU TABLA
  # (13/10/2026, feature 48).
  # Texto literal de lo que se va:
  #     And desde el 20/09/2026 el recuento de bloques que aparecen mediante una animación es exactamente 0, y la puerta lo declara por escrito en vez de aprobar en silencio sobre una lista vacía
  #     And si ese recuento vuelve a ser mayor que 0, esta puerta lo caza: reintroducir una animación de entrada exige pasar por la puerta humana
  #
  # POR QUÉ SE VAN. La segunda decía que reintroducir una animación de entrada
  # «exige pasar por la puerta humana». PABLO LA PASÓ EL 13/10/2026 (respuesta P1):
  # el hero SÍ tendrá su entrada animada. El recuento deja de ser 0. Pero «exactamente
  # 0» era un DISPARADOR, y el disparador sigue haciendo falta: cambia el umbral,
  # no la función. Pasa de «ninguna animación» a «ninguna animación FUERA DEL HERO»,
  # porque la aprobación cubre la entrada del hero y nada más (las de la galería, de la
  # feature 40, tienen que pasar su propia puerta).
  #
  # LOS DOS AGUJEROS DE LA PUERTA, medidos leyendo `accesibilidad-movimiento.ts`
  # sin ejecutar nada. La puerta decide «invisible sin su animación» así: si la HOJA
  # contiene en alguna línea `opacity: 0` o `visibility: hidden`, marca como
  # invisibles TODOS los bloques animados de esa hoja.
  #   1. FALSO ROJO CONTRA LO LEGÍTIMO. Los fotogramas de una entrada parten de
  #      opacidad 0: `from { opacity: 0 }` escrito en varias líneas contiene la línea
  #      `opacity: 0`, y la puerta marcaría invisible una animación CORRECTA. La salida
  #      fácil es relajar la puerta hasta que no muerda (ignorar `opacity: 0` sin más).
  #      Eso es lo que este escenario impide con las filas de la tabla que dicen
  #      «incumple»: hay que distinguir el estado de PARTIDA de la animación (dentro
  #      de un `@keyframes`) del estado BASE del bloque (fuera de él).
  #   2. FALSO VERDE CONTRA LO REALMENTE INVISIBLE. La puerta compara la línea
  #      entera normalizada con `opacity:0`: un bloque escrito en una sola línea
  #      (`.x { opacity: 0; animation: … }`) no coincide y no se detecta. Hoy no
  #      existe ninguno, así que nadie lo ha visto; en cuanto exista una animación de
  #      entrada, es el patrón clásico (ocultar en CSS y revelar con la animación).
  #
  # QUÉ SE CONSERVA: las cuatro primeras cláusulas, intactas, y el sesgo hacia el
  # rojo de la puerta (una hoja que a la vez anima y oculta se marca para revisión
  # humana, fila 6 de la tabla). QUÉ ENTRA: el sujeto de «todos son del hero» y la
  # tabla, que es la lista de mutaciones que el módulo puro debe ver (se
  # contrasta por StrykerJS: 100 % sobre los mutantes no equivalentes).
  #
  # LA PRUEBA QUE HOY FIJA `recuentoDeBloquesQueAparecenAnimando` = 0
  # (`accesibilidad-movimiento.test.ts`) SE INVIERTE: no se «relaja a > 0», se
  # reescribe contra las hojas reales con la lista de hojas autorizadas escrita a
  # mano.
  #
  # PUERTA QUE MUERDE: una animación de entrada en cualquier hoja que no sea la del
  # hero: el veredicto es «incumple». Se quita la animación del hero: el recuento
  # baja a 0 y la cláusula del «mayor que 0» falla. `opacity: 0` en el estado base
  # del hero: «incumple». La tabla cubre las dos direcciones del error.
  @s20
  Scenario: Con la preferencia de menos movimiento el contenido que se revelaba con movimiento está visible
    Given un visitante que ha pedido menos movimiento en su sistema
    When se carga cualquiera de las seis páginas del inventario
    Then todo el contenido que en condiciones normales aparece con movimiento —animación o transición— está visible desde el primer momento
    And ningún bloque queda invisible por no haberse ejecutado su animación ni su transición
    And el análisis automático de accesibilidad de esa página sigue devolviendo 0 violaciones
    And el inventario de bloques que se recorre se lee del sitio real, nunca de una lista escrita en el propio test
    And desde el 13/10/2026 el recuento de bloques que aparecen mediante una animación es mayor que 0 y TODOS pertenecen a la hoja de estilos del hero, y la puerta lo declara por escrito en vez de aprobar en silencio
    And la lista de hojas autorizadas a declarar una animación de entrada está escrita a mano en este escenario —solo la del hero— y no sale de las hojas que comprueba
    And si el inventario contiene un bloque de cualquier otra hoja, esta puerta se pone roja: cualquier otra animación de entrada exige su propia puerta humana, y la aprobación del 13/10/2026 no la cubre
    And la puerta distingue el estado de partida de una animación del estado base del bloque: una opacidad 0 o una visibilidad oculta DENTRO de un "@keyframes" no cuenta como bloque invisible sin su animación
    And una opacidad 0 o una visibilidad oculta FUERA de todo "@keyframes", en una hoja que además anima ese bloque, sí lo señala como invisible sin su animación, esté repartida en las líneas que esté
    And sobre las hojas reales del sitio el veredicto es "pasa": la animación del hero no queda invisible sin su animación y es la única que existe
    And el veredicto de la puerta sobre cada una de estas hojas sintéticas es el de la tabla:
      | hoja sintética                                                                                                                              | veredicto | bloques señalados como invisibles |
      | hoja del hero con unos fotogramas cuyo "from" parte de opacidad 0, repartidos en varias líneas, y un bloque animado cuyo estado base no oculta nada | pasa      | 0                                 |
      | la misma, con los bloques "from" y "to" de los fotogramas escritos cada uno en una sola línea                                                | pasa      | 0                                 |
      | la primera, pero el bloque animado declara además opacidad 0 en su estado base                                                               | incumple  | 1                                 |
      | la primera, pero el bloque animado declara además visibilidad oculta en su estado base                                                       | incumple  | 1                                 |
      | un bloque animado cuyo estado base declara opacidad 0, todo escrito en una sola línea                                                        | incumple  | 1                                 |
      | la primera, pero otro bloque de la misma hoja, sin animación, declara opacidad 0                                                             | incumple  | 1                                 |
      | la primera, pero declarada en una hoja que no es la del hero                                                                                 | incumple  | 0                                 |
      | hoja del hero con unos fotogramas cuyo "from" parte de visibilidad oculta, y un bloque animado cuyo estado base no oculta nada               | pasa      | 0                                 |

  # @s21, PRIMERA CLÁUSULA ENMENDADA (20/09/2026, TERCERA TANDA). Decía
  # literalmente: «Then ninguna animación se reproduce». Pasaba a cumplirse sobre
  # el conjunto vacío; se amplía a las transiciones, que son las que quedan. Su
  # parte con puerta real —que sin poder consultar la preferencia se actúe como
  # si se hubiera pedido menos movimiento,
  # `src/lib/accesibilidad-movimiento.test.ts:102-104`— sobrevive intacta y no se
  # toca. Nadie había señalado esta cláusula: los avisos anteriores solo
  # mencionaban @s20 y @s22.
  # @s21 REVISADO (13/10/2026, feature 48): SIN CAMBIO DE LETRA. «No se reproduce
  # ninguna animación ni ninguna transición con una duración perceptible» y «todo el
  # contenido está visible desde el primer momento» siguen siendo ciertas, y ahora
  # TIENEN SUJETO: la entrada del hero. En CSS, «la consulta no se puede hacer» es
  # lo que le pasa a un navegador que no entiende `prefers-reduced-motion`: el
  # bloque `@media (prefers-reduced-motion: no-preference)` evalúa a falso y la
  # entrada del hero no se declara; es la razón por la que fotogramas y retardos
  # viven solo ahí. Que el contenido se ve sin la animación lo mide
  # hero_reducido_con_animacion @s7 (cancelar las animaciones y comprobar que todo
  # queda visible). Su parte con puerta pura (`accesibilidad-movimiento.test.ts`:
  # sin poder consultar la preferencia se actúa como si se hubiera pedido menos
  # movimiento) sobrevive intacta.
  @s21
  Scenario: Si la preferencia de movimiento no se puede consultar se actúa como si se hubiera pedido menos movimiento
    Given un entorno en el que la consulta de la preferencia de movimiento no está disponible
    When se carga cualquiera de las seis páginas del inventario
    Then no se reproduce ninguna animación ni ninguna transición con una duración perceptible
    And todo el contenido está visible desde el primer momento
    And no se produce ningún error en la consola
    And el recuento de elementos comprobados es mayor que 0

  # @s22 REESCRITO ENTERO (20/09/2026, TERCERA TANDA). El aviso que la segunda
  # tanda dejó aquí decía que este escenario «deja de ser cierto sobre el sitio,
  # y NO LO DECIDE ESTA TANDA», y lo remitía a una puerta humana propia. Pablo la
  # resolvió el mismo día: ver la nota canónica de la sección D, arriba. Ese
  # aviso queda derogado, y con él su número falso («10 transition en 7 módulos»,
  # que son 8 en 6).
  #
  # TEXTO LITERAL RETIRADO:
  #     Scenario: Sin la preferencia de menos movimiento la animación sí se
  #     reproduce
  #       When se carga la página del inventario que contiene un elemento animado
  #       Then ese elemento tiene una animación en curso
  #       And el recuento de elementos con animación en curso es mayor que 0
  #       And ese contenido queda igualmente visible al terminar la animación
  #
  # POR QUÉ SE RETIRA: ya no existe «la página del inventario que contiene un
  # elemento animado». Las dos únicas `animation:` del proyecto eran los dos
  # pulsos de urgencias, y se van con D1 y E1.
  #
  # POR QUÉ NO SE RETIRA EL ESCENARIO ENTERO, Y ESTE ES EL PUNTO: @s22 NO se
  # queda sin sujeto. Su mitad «parcial, pura»
  # (`src/lib/accesibilidad-movimiento.test.ts:113-134`: sin la preferencia, el
  # desplazamiento SÍ se suaviza) sigue viva y verde, igual que
  # `tests/e2e/movimiento.spec.ts:117-120` en navegador real y
  # `src/components/Equipo.test.tsx:498-507` sobre el texto de un módulo. El
  # escenario PIVOTA de «hay una animación en curso» a «sin la preferencia el
  # sitio sí se mueve», que es verdad, es lo que Pablo ha decidido y tiene TRES
  # puertas existentes. Dejarlo como estaba sería aprobar por vacuidad;
  # retirarlo entero sería afirmar que el sitio se queda quieto, que es falso.
  #
  # COBERTURA QUE SE PIERDE, SIN MAQUILLAR: la comprobación de que una animación
  # por fotogramas clave llega a estar EN CURSO en el navegador, y la de que el
  # contenido sigue visible cuando esa animación termina. A partir de hoy nadie
  # comprueba eso, porque no hay ninguna animación que comprobar. Si el punto 8
  # de la reunión del 16/08/2026 (las animaciones de la galería) llega a
  # implementarse, este escenario es el sitio donde vuelve.
  # @s22, TRES CLÁUSULAS AÑADIDAS (13/10/2026, feature 48). La feature 39 retiró de
  # este escenario tres cláusulas que decían, literalmente: «ese elemento tiene una
  # animación en curso» / «el recuento de elementos con animación en curso es mayor
  # que 0» / «ese contenido queda igualmente visible al terminar la animación», y
  # dejó escrito el aviso, literal: «Si el punto 8 de la reunión del 16/08/2026 (las
  # animaciones de la galería) llega a implementarse, este escenario es el sitio
  # donde vuelve». VUELVE, con otro sujeto del que esperaba aquella nota: la entrada
  # del hero, aprobada por Pablo el 13/10/2026 (P1), y no la galería.
  #
  # QUÉ NO DUPLICA: los valores exactos de esas animaciones (700 ms, 0/120/240 ms,
  # 40 px, `ease-out`) viven en hero_reducido_con_animacion @s5. Aquí se afirma lo
  # que ese escenario no puede afirmar sin repetirse: que sin la preferencia el
  # sitio SÍ tiene animaciones por fotogramas clave, que solo están donde deben
  # estar (la portada) y que terminan con el contenido visible.
  #
  # QUÉ ES «SU FINAL». El último instante de la FASE ACTIVA de cada animación (su
  # `endTime` menos 1 ms), más la lectura de su último fotograma (offset 1) con
  # `effect.getKeyframes()`. NO `currentTime = endTime`: con el relleno «hacia atrás»
  # que necesita el escalonado, en `endTime` la animación ya no se aplica y se lee el
  # estilo BASE, de modo que la cláusula pasaría aunque los fotogramas finales
  # estuvieran mal (medido en Chromium). Ver hero_reducido_con_animacion @s5.
  #
  # TOLERANCIAS EXPLÍCITAS EN ESE INSTANTE. En `endTime − 1 ms` la curva `ease-out`
  # aún no ha llegado a 1 (medido: opacidad 0,999996 y transform de −0,000154 px):
  # una igualdad estricta daría rojo con el código correcto. Se pide opacidad efectiva
  # mayor o igual que 0,999 y desplazamiento horizontal menor que 0,5 px. La
  # EXACTITUD («1», `none` o desplazamiento 0) la fija EN EXCLUSIVA la lectura del
  # fotograma de offset 1 con `getKeyframes()`: un desplazamiento residual de 0,3 px
  # pasa la tolerancia de caja y solo lo caza esa lectura. Con un `to` implícito,
  # `getKeyframes()` devuelve igualmente el offset 1: no obliga a escribir un `to`.
  #
  # LAS OTRAS 5 RUTAS, CON EL RELOJ CONGELADO TAMBIÉN. Una animación corta sin
  # relleno habría terminado y habría desaparecido de `getAnimations()` antes de
  # contarla: sin congelar el reloj ANTES de navegar en cada una de las 5 rutas, el
  # «0» pasaría por vacuidad.
  #
  # PUERTA QUE MUERDE (`tests/e2e/movimiento.spec.ts`, navegador real): la entrada
  # del hero pierde su `animation`: el recuento baja de 3 a 0. Una animación
  # aparece en otra ruta: el recuento de las otras cinco deja de ser 0. Unos
  # fotogramas cuyo último fotograma deja `opacity: 0` o un `transform` distinto de
  # `none`: falla la lectura del fotograma de offset 1 de la última cláusula. La
  # frase «unos fotogramas que terminan en `opacity: 0` hacen fallar la última
  # cláusula», tal como estaba escrita antes de esta corrección, era FALSA con
  # relleno hacia atrás si se leía en `endTime`.
  @s22
  Scenario: Sin la preferencia de menos movimiento el sitio sí se mueve
    Given un visitante que no ha pedido menos movimiento en su sistema
    When se carga la portada y se solicita un desplazamiento hasta una sección
    Then el valor computado de "scroll-behavior" del elemento raíz es exactamente "smooth"
    And la decisión de desplazamiento que toma la lógica del sitio para ese visitante es suave
    And al menos un módulo del inventario declara una transición dentro de un bloque "prefers-reduced-motion: no-preference"
    And el recuento de módulos que declaran movimiento dentro de ese bloque es mayor que 0 y se lee del texto real de las hojas de estilo, nunca de una lista escrita en el test
    And con el reloj de animaciones del navegador congelado ANTES de navegar, como en hero_reducido_con_animacion @s5, la portada tiene exactamente las 3 animaciones por fotogramas clave del hero, con los valores que fija ese escenario: sin congelar, una máquina lenta las daría ya terminadas y el recuento bajaría a 0 con el código correcto
    And con el reloj congelado antes de navegar en cada una de las 5 rutas, las otras 5 rutas del inventario no tienen ninguna animación por fotogramas clave (las transiciones no cuentan)
    And al llevar esas 3 animaciones al último instante de su fase activa, su "endTime" menos 1 milisegundo, el titular, el párrafo y el botón tienen opacidad efectiva mayor o igual que 0,999 y un desplazamiento horizontal menor que 0,5 píxeles, y el último fotograma de cada una, el de desplazamiento 1 leído con "getKeyframes()", declara con exactitud opacidad "1" y transformación "none" o un desplazamiento horizontal de 0
    And ningún contenido queda oculto ni a medio aparecer cuando ese movimiento termina

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
