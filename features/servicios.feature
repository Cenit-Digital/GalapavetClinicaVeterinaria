# =============================================================================
# features/servicios.feature — Catálogo de servicios de Galapavet
# =============================================================================
#
# FUENTE DEL COMPORTAMIENTO
#
# - INTERACCIÓN (heredada y aprobada): prototipo de Claude Design
#   «Veterinaria La Sierra.dc.html», sección id="servicios" (líneas 142-181) y su
#   estado en renderVals() (líneas 717-729). Cada tarjeta guarda su propio
#   abierto/cerrado en un objeto indexado por posición (`serviciosAbiertos`), de
#   modo que la expansión de una tarjeta es INDEPENDIENTE del resto: NO es un
#   acordeón excluyente. El botón alterna, expone `aria-expanded` y cambia de
#   rótulo (`abierto ? 'Ocultar detalle' : 'Ver qué incluye'`). Todo eso se
#   conserva intacto.
# - DATOS: docs/datos-galapavet.md §5 — los CINCO bloques que Galapavet publica
#   realmente, con su desglose literal (verificado el 17/08/2026 contra
#   galapavet.com). Ningún otro dato de servicio existe.
# - DECISIONES: project-spec.md — Decisión 3 (12 servicios inventados → 5 reales),
#   Decisión 2 (fuera todo reclamo de «Urgencias 24 h»), Decisión 9 (nada de
#   imágenes remotas de terceros) e Invariantes 1, 3 y 5.
#
# QUÉ CAMBIA RESPECTO AL CONTRATO HEREDADO
# (docs/contrato-heredado/servicios.feature, 6 escenarios) Y POR QUÉ
#
# 1. Las 12 tarjetas se sustituyen por los 5 bloques reales. Cae el @s1 heredado
#    («exactamente 12 tarjetas») y cae entero el @s6 heredado, que exigía ver
#    entre los títulos «Urgencias 24 h» y «Microchip y viajes»: Galapavet cierra
#    los domingos y no presta urgencias 24 h (docs/datos-galapavet.md §3 y §7).
#    «Identificación con microchip» sí existe, pero como PUNTO dentro del bloque
#    «Medicina general», no como servicio propio.
# 2. El @s2 heredado afirmaba «exactamente 3 elementos incluidos» para CUALQUIER
#    tarjeta. Es FALSO para el catálogo real: el desglose publicado tiene 7, 4, 5,
#    6 y 4 puntos según el bloque. Se sustituye por un escenario por bloque con su
#    lista literal completa (@s4-@s8), que es lo único verificable.
# 3. Se suprimen la etiqueta de categoría, la descripción breve, el párrafo de
#    detalle ampliado y la fotografía por tarjeta que exigía el @s1 heredado: el
#    cliente NO publica nada de eso para ningún bloque. Escribirlos sería
#    inventar una afirmación sobre el negocio (Invariante 1 y Decisión 1).
# 4. Queda prohibido el copy heredado «Doce especialidades bajo el mismo techo»:
#    anuncia un recuento falso.
# 5. El estado colapsado debe ser observable SIN CSS. El prototipo colapsaba con
#    `max-height:0; opacity:0`, que deja el contenido dentro del árbol de
#    accesibilidad (defecto real de accesibilidad, además). Este repositorio corre
#    los tests con los CSS Modules desactivados y prohíbe aseverar sobre clases,
#    así que «colapsado» se contrata como: `aria-expanded="false"` en el botón Y
#    desglose ausente del árbol de accesibilidad.
# 6. Se exige que el nombre accesible de cada botón identifique su bloque. El
#    prototipo repetía «Ver qué incluye» en las 12 tarjetas, dejando botones
#    indistinguibles para quien navega por lista de controles. El RÓTULO VISIBLE
#    no cambia: sigue siendo «Ver qué incluye» / «Ocultar detalle».
# 7. Casos límite nuevos, que el contrato heredado no cubría: bloque con desglose
#    vacío (@s15), punto en blanco dentro del desglose (@s16) y catálogo vacío
#    (@s17).
#
# AVISOS SOBRE LA FUENTE (no son erratas: se transcriben tal cual)
#
# - «Odontología» aparece en DOS bloques («Cirugía y anestesia» y
#   «Especialidades») y «Endoscopia» también («Diagnóstico de imagen» y
#   «Especialidades»). Es así en la fuente del cliente: NO se deduplica. Con dos
#   de esos bloques abiertos a la vez, el mismo texto aparece dos veces en la
#   sección, así que toda aserción se acota a la tarjeta.
# - El punto «Enfermedades infecciosas y parasitarias (leishmania, leucemia
#   felina…)» incluye los puntos suspensivos «…» tal y como los publica el
#   cliente.
#
# PENDIENTE
#
# - PENDIENTE: fotografías de la sección. El cliente no publica ninguna. Si se
#   decide ilustrar las tarjetas, la imagen debe ser LOCAL (Decisión 9) y su
#   texto alternativo describir la foto, nunca afirmar un servicio. Falta que el
#   cliente aporte fotos reales de la clínica. Hasta entonces el contrato solo
#   fija el invariante anti-terceros (@s17).
# - PENDIENTE: confirmar con el cliente el orden de los cinco bloques. Aquí se
#   respeta el de docs/datos-galapavet.md §5, que es el orden en que él los
#   publica. El rótulo de la sección se fija en «Servicios» por ser el destino
#   del ancla de navegación; no es una afirmación sobre el negocio.
# =============================================================================

Feature: Catálogo de servicios expandibles
  Como visitante que quiere saber qué hace Galapavet
  Quiero ver los bloques de servicio que la clínica publica y desplegar cada uno
  Para conocer exactamente qué incluye antes de pedir cita.

  Background:
    Given el visitante ha abierto la landing de Galapavet

  @s1
  Scenario: La sección muestra exactamente los cinco bloques publicados, en orden
    When el visitante mira la sección «Servicios»
    Then la sección tiene un encabezado de nivel 2 cuyo nombre accesible es "Servicios"
    And la sección contiene exactamente 5 encabezados de nivel 3
    And sus nombres accesibles son, en este orden:
      | Cirugía y anestesia   |
      | Diagnóstico de imagen |
      | Medicina general      |
      | Análisis              |
      | Especialidades        |

  @s2
  Scenario: Al cargar la página las cinco tarjetas están colapsadas
    When el visitante mira la sección «Servicios»
    Then hay exactamente 5 botones de desplegar, uno por tarjeta
    And el atributo "aria-expanded" de los 5 botones es "false"
    And el rótulo visible de los 5 botones es "Ver qué incluye"
    And ningún punto de desglose de ninguna de las 5 tarjetas de Servicios es consultable en el árbol de accesibilidad

  @s3
  Scenario: La tarjeta colapsada solo afirma el título del bloque
    When el visitante mira la tarjeta "Medicina general" colapsada
    Then el único texto de la tarjeta es su título "Medicina general" y el rótulo de su botón
    And la tarjeta no muestra ninguna etiqueta de categoría
    And la tarjeta no muestra ninguna descripción breve

  @s4
  Scenario: Desplegar «Cirugía y anestesia» lista sus 7 puntos publicados
    Given la tarjeta "Cirugía y anestesia" está colapsada
    When el visitante pulsa el botón de desplegar de la tarjeta "Cirugía y anestesia"
    Then la tarjeta "Cirugía y anestesia" muestra una lista con exactamente 7 elementos
    And sus nombres accesibles son, en este orden:
      | Cirugía de tejidos blandos |
      | Esterilizaciones           |
      | Cirugía oncológica         |
      | Cirugía digestiva          |
      | Odontología                |
      | Anestesia inhalatoria      |
      | Monitorización             |
    And el nombre accesible de cada elemento no incluye la marca de verificación

  @s5
  Scenario: Desplegar «Diagnóstico de imagen» lista sus 4 puntos publicados
    Given la tarjeta "Diagnóstico de imagen" está colapsada
    When el visitante pulsa el botón de desplegar de la tarjeta "Diagnóstico de imagen"
    Then la tarjeta "Diagnóstico de imagen" muestra una lista con exactamente 4 elementos
    And sus nombres accesibles son, en este orden:
      | Servicios de radiología y ecografía propios |
      | Ecografía                                   |
      | Eco-cardiografía                            |
      | Endoscopia                                  |

  @s6
  Scenario: Desplegar «Medicina general» lista sus 5 puntos publicados
    Given la tarjeta "Medicina general" está colapsada
    When el visitante pulsa el botón de desplegar de la tarjeta "Medicina general"
    Then la tarjeta "Medicina general" muestra una lista con exactamente 5 elementos
    And sus nombres accesibles son, en este orden:
      | Preventiva                  |
      | Vacunaciones                |
      | Desparasitaciones           |
      | Chequeo                     |
      | Identificación con microchip |

  @s7
  Scenario: Desplegar «Análisis» lista sus 6 puntos publicados
    Given la tarjeta "Análisis" está colapsada
    When el visitante pulsa el botón de desplegar de la tarjeta "Análisis"
    Then la tarjeta "Análisis" muestra una lista con exactamente 6 elementos
    And sus nombres accesibles son, en este orden:
      | Laboratorio de análisis clínicos propio                                |
      | Perfiles generales                                                     |
      | Enfermedades infecciosas y parasitarias (leishmania, leucemia felina…) |
      | Cultivos                                                               |
      | Biopsia y citología                                                    |
      | Hormonales                                                             |

  @s8
  Scenario: Desplegar «Especialidades» lista sus 4 puntos publicados
    Given la tarjeta "Especialidades" está colapsada
    When el visitante pulsa el botón de desplegar de la tarjeta "Especialidades"
    Then la tarjeta "Especialidades" muestra una lista con exactamente 4 elementos
    And sus nombres accesibles son, en este orden:
      | Odontología   |
      | Oftalmología  |
      | Traumatología |
      | Endoscopia    |

  @s9
  Scenario: El estado de expansión se comunica con aria-expanded
    Given la tarjeta "Análisis" está colapsada y su botón tiene "aria-expanded" con valor "false"
    When el visitante pulsa el botón de desplegar de la tarjeta "Análisis"
    Then el atributo "aria-expanded" del botón de la tarjeta "Análisis" pasa a valer "true"

  @s10
  Scenario: El rótulo del botón cambia al desplegar
    Given la tarjeta "Especialidades" está colapsada y el rótulo visible de su botón es "Ver qué incluye"
    When el visitante pulsa el botón de desplegar de la tarjeta "Especialidades"
    Then el rótulo visible del botón de la tarjeta "Especialidades" pasa a ser "Ocultar detalle"

  @s11
  Scenario: Plegar una tarjeta desplegada vuelve a ocultar su desglose
    Given la tarjeta "Diagnóstico de imagen" está desplegada
    When el visitante pulsa el botón de plegar de la tarjeta "Diagnóstico de imagen"
    Then el atributo "aria-expanded" del botón de la tarjeta "Diagnóstico de imagen" pasa a valer "false"
    And el rótulo visible de ese botón vuelve a ser "Ver qué incluye"
    And ninguno de los 4 puntos de "Diagnóstico de imagen" es consultable en el árbol de accesibilidad

  @s12
  Scenario: Desplegar una tarjeta no despliega ninguna de las otras cuatro
    Given las cinco tarjetas están colapsadas
    When el visitante pulsa el botón de desplegar de la tarjeta "Medicina general"
    Then el atributo "aria-expanded" del botón de "Medicina general" es "true"
    And el atributo "aria-expanded" de los botones de las otras 4 tarjetas sigue siendo "false"
    And ningún punto de las otras 4 tarjetas es consultable en el árbol de accesibilidad

  @s13
  Scenario: Desplegar una segunda tarjeta no pliega la primera
    Given la tarjeta "Cirugía y anestesia" está desplegada y las otras cuatro colapsadas
    When el visitante pulsa el botón de desplegar de la tarjeta "Especialidades"
    Then el atributo "aria-expanded" de los botones de "Cirugía y anestesia" y "Especialidades" es "true"
    And la tarjeta "Cirugía y anestesia" sigue mostrando sus 7 puntos
    And la tarjeta "Especialidades" muestra sus 4 puntos

  @s14
  Scenario: Cada botón de la sección tiene un nombre accesible distinto
    When el visitante recorre los botones de la sección «Servicios»
    Then no hay dos botones de la sección con el mismo nombre accesible
    And el nombre accesible de cada botón contiene el título de su tarjeta

  @s15
  Scenario: Caso límite — un bloque con el desglose vacío no ofrece botón de desplegar
    Given un catálogo en el que el bloque "Especialidades" tiene el desglose vacío
    When el visitante mira la sección «Servicios»
    Then la tarjeta "Especialidades" se muestra con su título
    And la tarjeta "Especialidades" no contiene ningún botón
    And la tarjeta "Especialidades" no contiene ninguna lista
    And las otras 4 tarjetas siguen ofreciendo su botón de desplegar

  @s16
  Scenario: Caso límite — un punto en blanco no pinta un elemento de lista vacío
    Given un catálogo en el que el bloque "Análisis" tiene un sexto punto que es una cadena en blanco
    When el visitante pulsa el botón de desplegar de la tarjeta "Análisis"
    Then la tarjeta "Análisis" muestra una lista con exactamente 5 elementos
    And sus nombres accesibles son, en este orden:
      | Laboratorio de análisis clínicos propio                                |
      | Perfiles generales                                                     |
      | Enfermedades infecciosas y parasitarias (leishmania, leucemia felina…) |
      | Cultivos                                                               |
      | Biopsia y citología                                                    |
    And ningún elemento de esa lista tiene el nombre accesible vacío

  @s17
  Scenario: Caso límite — un catálogo vacío no renderiza la sección
    Given un catálogo de servicios sin ningún bloque
    When el visitante recorre la landing
    Then no existe ninguna sección cuyo nombre accesible sea "Servicios"
    And no se muestra ningún encabezado ni tarjeta de servicio
    And no se muestra ningún texto de relleno en su lugar

  @s18
  Scenario: La sección no afirma ningún servicio que el cliente no publique
    When el visitante lee todo el texto de la sección «Servicios», con las cinco tarjetas desplegadas
    Then el texto de la sección no contiene "Urgencias 24 h"
    And el texto de la sección no contiene "24 h"
    And el texto de la sección no contiene "Peluquería canina"
    And el texto de la sección no contiene "Animales exóticos"
    And el texto de la sección no contiene "Nutrición y etología"
    And el texto de la sección no contiene "Microchip y viajes"
    And el texto de la sección no contiene "Doce especialidades"
    And el texto de la sección no contiene el símbolo "€"
    And el conjunto de los 26 puntos mostrados en las cinco tarjetas es exactamente la unión de las cinco listas fijadas en @s4, @s5, @s6, @s7 y @s8 de este mismo fichero, con "Odontología" y "Endoscopia" apareciendo cada una en sus dos bloques publicados y ningún otro punto añadido, omitido ni repetido

  @s19
  Scenario: Hoy la sección no publica ninguna imagen; si en el futuro se añade alguna no se pide a un tercero ni suplanta un servicio
    When el visitante mira la sección «Servicios»
    Then el número de imágenes de la sección es 0
    And el atributo "src" de cada imagen de la sección es una ruta del propio sitio
    And ninguna imagen de la sección apunta a un host externo
    And el texto alternativo de cada imagen de la sección no contiene el nombre de ninguno de los cinco bloques de servicio ni de ninguno de sus puntos publicados
