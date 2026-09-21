# =============================================================================
# POR QUÉ CAMBIA ESTE CONTRATO (20/09/2026) — E1 EN NAVEGADOR REAL
# =============================================================================
# Decisión de Pablo del 20/09/2026, corroborada en la grabación de la reunión
# con Roberto Alonso del 16/08/2026 (minutos 06:52-07:00, transcripción en
# `progress/transcripcion_reunion_rober_20260816.txt`): «La urgencia se va
# afuera... y el resto se queda como está». La tarjeta roja de urgencias de la
# sección de contacto desaparece; el formulario, el mapa y los bloques de datos
# se quedan intactos.
#
# ESTE FICHERO ES EL QUE MÁS PIERDE, y conviene que la puerta humana lo sepa:
# su @s3 era la ÚNICA comprobación en NAVEGADOR REAL de que el rojo de urgencia
# se pintaba de verdad en pantalla —leía `--color-urgencia` resuelto por el
# navegador y comparaba fondo y tinta—. Con E1 no queda ninguna lectura viva de
# ese token en Playwright. Ver la nota de @s3 y
# `progress/contacto_pie_contrato_20260920.md` §4.
#
# ACTUALIZACIÓN (20/09/2026, TERCERA TANDA): la consecuencia de esto sobre la
# matriz de uso de color ya NO está pendiente de nadie. Pablo decidió el mismo
# día BORRAR las dos filas de urgencia de la matriz
# (`src/lib/diseno/matrizDeContraste.ts:363` y `:388`), para que la matriz vuelva
# a ser exactamente lo que el sitio pinta. Los recuentos pasan de 25 filas y 125
# parejas a 23 y 115. El detalle, con el coste medido, en la nota de @s7 de
# `features/rediseno_visual.feature` y en
# `progress/reconciliacion_contratos_20260920.md`.
# =============================================================================

Feature: Fidelidad visual del contacto
  Como visitante quiero escribir o llamar desde un contacto de dos columnas
  con información verificable para poder distinguir el formulario de la ubicación y los datos.

  # CLÁUSULA AÑADIDA a @s1 (20/09/2026): la prohibición de reclamos que venía
  # dentro de @s3 y que E1 dejaría sin casa. No dependía de la tarjeta —se
  # afirma sobre la SECCIÓN entera— y es la única comprobación en navegador real
  # de los reclamos prohibidos en esta sección: `informacion_contacto` @s6 los
  # comprueba en jsdom, sobre el panel renderizado aislado. Reubicarla aquí es
  # lo que evita que el saldo neto de E1 sea menos cobertura de la que había.
  @s1
  Scenario: La sección de contacto muestra cabecera y dos columnas en escritorio
    Given la portada renderizada a 1440 píxeles de ancho
    When se mide la sección de contacto
    Then aparece un cintillo "Contacto", un titular y un párrafo sin promesas no publicadas
    And la tarjeta del formulario y la columna de información comparten una fila
    And ambas columnas se alinean por su borde superior con una tolerancia de 1 píxel
    And el texto de la sección no anuncia "24 h", ni "24h", ni "24 horas", ni "todos los días", ni "siempre hay alguien de guardia"

  @s2
  Scenario: El formulario vive en una tarjeta y conserva sus campos accesibles
    Given la sección de contacto visible
    When el visitante inspecciona la tarjeta "Escríbenos"
    Then los campos nombre y teléfono comparten una fila en escritorio
    And correo, motivo y mensaje ocupan el ancho de la tarjeta
    And cada campo mantiene una etiqueta asociada y su validación vigente
    And el botón "Enviar mensaje" ocupa todo el ancho de la tarjeta

  # @s3 ELIMINADO (20/09/2026). Decía literalmente:
  #
  #   @s3
  #   Scenario: La tarjeta de urgencias comunica únicamente el servicio real fuera de horario
  #     Given el rótulo y el teléfono de urgencias de la fuente única
  #     When se visualiza la tarjeta de urgencias
  #     Then la tarjeta tiene el fondo de urgencia, el rótulo exacto y el teléfono real
  #     And existe un botón blanco "Llamar ahora" que apunta al "tel:" de urgencias
  #     And no aparece una promesa de urgencias 24 horas
  #
  # POR QUÉ SE RETIRA: Pablo, 20/09/2026, corroborado por Roberto Alonso en la
  # grabación del 16/08/2026, minutos 06:52-07:00. Fuera la cartelería roja.
  # Este escenario, escrito el 03/09/2026, es el que DEVOLVIÓ a la sección el
  # fondo de urgencia, el punto pulsante y la píldora «Llamar ahora» después de
  # que el contrato del 17/08/2026 los hubiera suprimido; hoy se retira de
  # nuevo, y esta vez sin sustituto visual.
  #
  # SU ÚLTIMA CLÁUSULA NO SE PIERDE: «no aparece una promesa de urgencias 24
  # horas» se reubica, ampliada, en @s1 de este mismo fichero. Es lo único de
  # @s3 que no dependía de la tarjeta.
  #
  # LO QUE SÍ SE PIERDE, dicho sin maquillar: @s3 era la ÚNICA puerta del
  # proyecto que leía `--color-urgencia` RESUELTO POR EL NAVEGADOR y comprobaba
  # que algo lo pintaba de verdad en pantalla. Tras E1 el token sigue declarado
  # en las cinco variantes y sigue pintado —pero solo como muestra decorativa
  # del selector de paleta (`fidelidad_selector_paleta` @s1: el disco tricolor)—
  # y ningún módulo pinta ya tinta sobre él.
  #
  # ACTUALIZACIÓN (20/09/2026, TERCERA TANDA): esta nota decía «Las consecuencias
  # sobre la matriz de uso de color están en la nota de @s28 de
  # `rediseno_visual.feature` y son decisión de la puerta humana, no del
  # artesano». La decisión ya está tomada: Pablo, el mismo día, BORRAR las dos
  # filas de urgencia de la matriz (`matrizDeContraste.ts:363` y `:388`), con el
  # coste medido en 6 tests rojos de 1415, todos en un único fichero. Los
  # recuentos quedan en 23 filas, 23 claves únicas y 115 parejas. Ver las notas
  # de @s7, @s11 y @s28 de `rediseno_visual.feature`.

  @s4
  Scenario: La tarjeta de datos usa un mapa local con pin y datos separados
    Given el mapa estático local de Galapavet y los datos publicados de la clínica
    When se visualiza la tarjeta de datos
    Then se muestra un mapa local con pin y la atribución visible de OpenStreetMap
    And se muestran tres bloques rotulados "Dirección", "Teléfonos" y "Horario"
    And cada bloque usa únicamente los datos reales de la fuente única
    And la portada no realiza ninguna petición a un dominio externo

  # CLÁUSULA ENMENDADA en @s5 (20/09/2026, E1). Decía literalmente: «Then el
  # formulario precede a la columna de urgencias y datos en el orden de
  # lectura». Ya no hay columna de urgencias. La comprobación de que ninguna
  # tarjeta desborda a 320 px SE CONSERVA y sigue recorriendo una LISTA de
  # tarjetas —ahora con una sola entrada, la de datos—, para que siga siendo
  # evidente que se recorre un inventario y no una caja suelta. Lo que
  # desaparece con la tarjeta es la comprobación del plegado de su banda
  # estrecha (número encima, píldora debajo, alineados por la izquierda): esa
  # cobertura se pierde entera y no se reubica, porque no queda banda.
  @s5
  Scenario: El contacto se apila en móvil sin desbordar sus tarjetas
    Given una ventana de 320 píxeles de ancho
    When se visualiza el contacto
    Then el formulario precede a la tarjeta de datos en el orden de lectura
    And ninguna de las tarjetas de la sección desborda su propio ancho
    And el recuento de tarjetas comprobadas es mayor que 0
    And el documento no tiene desbordamiento horizontal

