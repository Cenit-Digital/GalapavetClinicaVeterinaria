# ============================================================================
# FUENTE DEL COMPORTAMIENTO
# ----------------------------------------------------------------------------
# - project-spec.md → «Cimientos → tokens_marca»: la paleta real derivada del
#   logo con la «verificación de contraste WCAG AA calculada, no supuesta».
# - project-spec.md → Decisión 8: la identidad visual es la del cliente
#   (morado #77286B + lima #B4C718). El selector de paletas se conserva pero
#   como variaciones de ESA marca, no como catálogo de propuestas ajenas.
# - docs/datos-galapavet.md §10 «Marca visual»: LOS TRES HEXADECIMALES, con su
#   método de obtención (muestreo de píxeles sobre `logo galapavet.webp`,
#   201×201 px, píxeles opacos, recuento por frecuencia, 17/08/2026). Es la
#   única fuente admitida; no hay ningún otro color de marca.
# - feature_list.json id 1: los cuatro criterios de aceptación.
#
# QUÉ CAMBIA RESPECTO AL CONTRATO HEREDADO
# ----------------------------------------------------------------------------
# NADA: esta feature NO hereda contrato. `docs/contrato-heredado/` archiva 13
# ficheros del prototipo «Veterinaria La Sierra» y ninguno cubre tokens ni
# contraste — el prototipo nunca midió un ratio. Lo que sí se descarta de forma
# explícita es su paleta: azul cobalto, terracota, cian neón y esmeralda no son
# colores de Galapavet y no aparecen aquí (Decisión 8).
#
# POR QUÉ ESTA FEATURE NO AFIRMA SOBRE ROLES NI ATRIBUTOS ARIA
# ----------------------------------------------------------------------------
# El resto del contrato del repo se afirma sobre el rol accesible, el nombre
# accesible y los atributos ARIA, nunca sobre clases CSS. Esta feature no pinta
# DOM: su superficie observable son valores declarados, ratios calculados,
# errores lanzados e informes de puerta. Ningún Then de este fichero depende de
# una clase CSS, de un estilo computado ni de un selector, precisamente porque
# los tests corren con los CSS Modules desactivados.
#
# LOS RATIOS SON LITERALES ESCRITOS A MANO
# ----------------------------------------------------------------------------
# Cada ratio de este fichero se calculó a mano el 17/08/2026 con la fórmula
# oficial de luminancia relativa de WCAG 2.2 y se escribe aquí como literal, no
# como referencia a la constante de producción (patrón
# doble-de-test-anclado-al-literal-no-al-simbolo). Redondeo a dos decimales.
#
#   #000000 sobre #FFFFFF → 21.00     #77286B sobre #FFFFFF → 9.13
#   #B4C718 sobre #FFFFFF →  1.89     #48704B sobre #FFFFFF → 5.68
#   #B4C718 sobre #77286B →  4.84     #48704B sobre #B4C718 → 3.01
#
# MÍNIMOS EXIGIDOS (WCAG 2.2 nivel AA)
# ----------------------------------------------------------------------------
#   texto normal ................................. 4.5:1  (1.4.3)
#   texto grande (≥ 24 px, o ≥ 18.66 px en negrita) 3:1   (1.4.3)
#   componente de interfaz y borde de foco ......... 3:1   (1.4.11 / 2.4.11)
# Un color que no alcanza el mínimo de un uso NO se usa para ese uso.
# EXCEPCIÓN DECIDIDA: #48704B sobre #B4C718 (3.01) cumple aritméticamente el
# mínimo de "texto grande" y "componente" por 0.01, pero
# docs/datos-galapavet.md:175 cierra la pregunta sin condicional — "No se usa":
# el margen se pierde con cualquier ajuste posterior del tono. @s16 exige que
# el catálogo no declare esta pareja para ningún uso, pese a que @s8 confirma
# que matemáticamente pasaría.
#
# PENDIENTE (no verificado, no se fija aquí)
# ----------------------------------------------------------------------------
# - PENDIENTE: la escala tipográfica y el espaciado que menciona el título de la
#   feature. No hay ni un valor de origen verificado ni medido para ellos en
#   docs/datos-galapavet.md ni en el estudio de prospección. Fijarlos ahora sería
#   inventar. Este contrato cubre color y contraste; la escala tipográfica y el
#   espaciado se miden sobre el diseño y se añaden a este mismo fichero antes de
#   implementarlos.
# - PENDIENTE: el cliente no publica manual de marca. Los tres hexadecimales
#   provienen de muestreo del logo, no de una declaración del cliente. Si
#   aparece un manual, los valores de @s1 se re-verifican contra él.
# - RESUELTO (ya no pendiente): la pareja #48704B sobre #B4C718 — ver la
#   EXCEPCIÓN DECIDIDA en MÍNIMOS EXIGIDOS, arriba. No se reabre.
# - PENDIENTE: los tokens exactos de la variante oscura de la Decisión 8 (fondo,
#   superficies y qué color hace de texto) se fijan ÚNICAMENTE en este fichero,
#   no en `selector_paleta` — que solo fija identificadores, rótulos y
#   comportamiento de conmutación, sin proponer ni remitir ningún valor de color
#   de vuelta aquí. Consecuencia mecánica ya verificada (datos-galapavet.md
#   §10.1): el morado #77286B no alcanza 3:1 contra ningún fondo más oscuro que
#   él mismo (2,30:1 máximo contra negro puro), así que la variante "noche" no
#   puede usar el morado como texto ni como borde legible sobre el fondo oscuro;
#   solo como fondo o superficie, igual que el lima. Hasta que un escenario de
#   este fichero fije el hexadecimal del fondo oscuro y las parejas resultantes,
#   la variante "noche" no está completa.
# ============================================================================

Feature: Tokens de marca de Galapavet con contraste WCAG 2.2 AA calculado
  Como equipo del proyecto quiero que los colores de Galapavet vivan en un único
  fichero de tokens y que el contraste de cada pareja se calcule en vez de
  suponerse, para no publicar texto ilegible ni colores que no son del cliente.

  # --------------------------------------------------------------------------
  # Los colores de marca
  # --------------------------------------------------------------------------

  @s1
  Scenario: Los tres colores de marca se declaran con el hexadecimal exacto del logo
    Given el fichero de tokens de marca del proyecto
    When consulto los colores de marca declarados
    Then el morado de marca vale exactamente "#77286B"
    And el verde lima de marca vale exactamente "#B4C718"
    And el verde profundo de marca vale exactamente "#48704B"
    And el número total de colores de marca declarados es exactamente 3

  # --------------------------------------------------------------------------
  # El cálculo del ratio de contraste
  # --------------------------------------------------------------------------

  @s2
  Scenario: El cálculo devuelve el ratio máximo conocido para negro sobre blanco
    Given la pareja formada por el color "#000000" y el fondo "#FFFFFF"
    When calculo su ratio de contraste
    Then el ratio redondeado a dos decimales es 21.00

  @s3
  Scenario: El morado de marca sobre blanco alcanza 9.13
    Given la pareja formada por el color "#77286B" y el fondo "#FFFFFF"
    When calculo su ratio de contraste
    Then el ratio redondeado a dos decimales es 9.13
    And el ratio es mayor o igual que 4.5

  @s4
  Scenario: Invertir color y fondo no cambia el ratio
    Given la pareja formada por el color "#FFFFFF" y el fondo "#77286B"
    When calculo su ratio de contraste
    Then el ratio redondeado a dos decimales es 9.13

  @s5
  Scenario: El hexadecimal en minúsculas produce el mismo ratio que en mayúsculas
    Given la pareja formada por el color "#77286b" y el fondo "#ffffff"
    When calculo su ratio de contraste
    Then el ratio redondeado a dos decimales es 9.13

  # --------------------------------------------------------------------------
  # Aptitud de una pareja para un uso concreto
  # --------------------------------------------------------------------------

  @s6
  Scenario: El verde lima sobre blanco no es apto para ningún uso de texto ni de interfaz
    Given la pareja formada por el color "#B4C718" y el fondo "#FFFFFF"
    When evalúo su aptitud para cada uso
    Then el ratio redondeado a dos decimales es 1.89
    And la pareja se declara NO apta para texto normal
    And la pareja se declara NO apta para texto grande
    And la pareja se declara NO apta para componente de interfaz o borde de foco

  @s7
  Scenario: El verde lima sobre el morado de marca sí es apto para texto normal
    Given la pareja formada por el color "#B4C718" y el fondo "#77286B"
    When evalúo su aptitud para cada uso
    Then el ratio redondeado a dos decimales es 4.84
    And la pareja se declara apta para texto normal

  @s8
  Scenario: El verde profundo sobre lima sirve para texto grande pero no para texto normal
    Given la pareja formada por el color "#48704B" y el fondo "#B4C718"
    When evalúo su aptitud para cada uso
    Then el ratio redondeado a dos decimales es 3.01
    And la pareja se declara apta para texto grande
    And la pareja se declara apta para componente de interfaz o borde de foco
    And la pareja se declara NO apta para texto normal

  @s9
  Scenario: Un ratio exactamente igual al mínimo de texto normal se considera apto
    Given un ratio de contraste de exactamente 4.5
    When evalúo su aptitud para texto normal
    Then la respuesta es apta

  @s10
  Scenario: Un ratio inmediatamente por debajo del mínimo de texto normal no es apto
    Given un ratio de contraste de exactamente 4.49
    When evalúo su aptitud para texto normal
    Then la respuesta es NO apta

  @s11
  Scenario: Un ratio exactamente igual al mínimo de componente de interfaz se considera apto
    Given un ratio de contraste de exactamente 3.0
    When evalúo su aptitud para componente de interfaz o borde de foco
    Then la respuesta es apta

  # Boundary test añadido en reparación de VEREDICTO_tokens_marca.md (ancla @s8):
  # "texto grande" comparte el umbral 3:1 con "componente" pero nunca se probó
  # exactamente en el límite (@s8 solo usa 3.01). Numerado @s23 (siguiente tag
  # libre) para no renumerar @s12-@s22, ya citados por otros documentos.
  @s23
  Scenario: Un ratio exactamente igual al mínimo de texto grande se considera apto
    Given un ratio de contraste de exactamente 3.0
    When evalúo su aptitud para texto grande
    Then la respuesta es apta

  # --------------------------------------------------------------------------
  # Entrada inválida: el cálculo falla cerrado
  # --------------------------------------------------------------------------

  @s12
  Scenario: Un hexadecimal con caracteres no hexadecimales hace fallar el cálculo
    Given el color "#ZZ286B" y el fondo "#FFFFFF"
    When intento calcular su ratio de contraste
    Then el cálculo lanza un error
    And el mensaje del error cita el valor rechazado "#ZZ286B"
    And no se devuelve ningún ratio

  @s13
  Scenario: Un hexadecimal de longitud incorrecta hace fallar el cálculo
    Given el color "#B4C71" y el fondo "#FFFFFF"
    When intento calcular su ratio de contraste
    Then el cálculo lanza un error
    And no se devuelve ningún ratio

  @s14
  Scenario: La forma abreviada de tres dígitos se rechaza en vez de interpretarse
    Given el color "#FFF" y el fondo "#77286B"
    When intento calcular su ratio de contraste
    Then el cálculo lanza un error
    And no se devuelve ningún ratio

  @s15
  Scenario: Una cadena vacía hace fallar el cálculo
    Given el color "" y el fondo "#FFFFFF"
    When intento calcular su ratio de contraste
    Then el cálculo lanza un error
    And no se devuelve ningún ratio

  # --------------------------------------------------------------------------
  # Puerta 1: toda pareja declarada cumple el mínimo de su uso
  # --------------------------------------------------------------------------

  @s16
  Scenario: Toda pareja color/fondo declarada alcanza el mínimo del uso que declara
    Given el catálogo de parejas color/fondo del proyecto, cada una con su uso declarado
    When ejecuto la puerta de contraste sobre el catálogo completo
    Then la puerta informa del ratio calculado de cada pareja
    And ninguna pareja de uso "texto normal" queda por debajo de 4.5
    And existe al menos una pareja de uso "texto normal" evaluada
    And ninguna pareja de uso "texto grande" queda por debajo de 3
    And existe al menos una pareja de uso "texto grande" evaluada
    And ninguna pareja de uso "componente de interfaz o borde de foco" queda por debajo de 3
    And existe al menos una pareja de uso "componente de interfaz o borde de foco" evaluada
    And el catálogo no declara ningún uso para la pareja formada por el color "#48704B" y el fondo "#B4C718"
    And el número de parejas evaluadas que informa la puerta es mayor que 0

  @s17
  Scenario: La puerta de contraste falla si el catálogo de parejas está vacío
    Given un catálogo de parejas color/fondo vacío
    When ejecuto la puerta de contraste sobre ese catálogo
    Then la puerta falla
    And el motivo del fallo declara que evaluó 0 parejas
    And la puerta no informa de ninguna pareja conforme

  # --------------------------------------------------------------------------
  # Puerta 2: ningún módulo SCSS declara un color literal
  # --------------------------------------------------------------------------

  @s18
  Scenario: Con todos los módulos consumiendo tokens la puerta pasa e informa de cuántos ficheros inspeccionó
    Given un conjunto de 3 ficheros SCSS de prueba que consumen tokens de marca y no declaran ningún color literal
    When ejecuto la puerta de literales de color
    Then la puerta no señala ningún fichero
    And el número de ficheros inspeccionados que informa la puerta es 3
    And la puerta pasa

  @s19
  Scenario: Un módulo que declara un color hexadecimal literal es señalado con su ruta y su línea
    Given un módulo SCSS que declara el valor "#B4C718" en su línea 7
    When ejecuto la puerta de literales de color
    Then la puerta señala ese fichero con su ruta y con la línea 7
    And la puerta falla

  @s20
  Scenario: Un color literal escrito en forma funcional o con nombre CSS también es señalado
    Given un módulo SCSS que declara el valor "rgb(180, 199, 24)" y un módulo SCSS que declara el valor "white"
    When ejecuto la puerta de literales de color
    Then la puerta señala los dos ficheros
    And la puerta falla

  @s21
  Scenario: La puerta de literales de color falla si no inspecciona ningún fichero
    Given un conjunto vacío de ficheros SCSS a inspeccionar
    When ejecuto la puerta de literales de color
    Then la puerta falla
    And el motivo del fallo declara que inspeccionó 0 ficheros
    And la puerta no informa de que no encontró literales

  @s22
  Scenario: Las palabras clave que no fijan un color no se señalan como literales
    Given un módulo SCSS que usa "currentColor", "transparent" e "inherit" y ningún valor de color
    When ejecuto la puerta de literales de color
    Then la puerta no señala ese fichero
    And la puerta pasa
