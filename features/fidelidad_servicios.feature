Feature: Fidelidad visual de los servicios
  Como visitante quiero poder escanear los servicios y abrir su detalle en
  tarjetas completas para comprender la oferta real de la clínica.

  @s1
  Scenario: La cabecera de servicios presenta la jerarquía del diseño con datos reales
    Given la portada renderizada a 1440 píxeles de ancho
    When se visualiza la sección de servicios
    Then aparece el cintillo "Lo que hacemos"
    And aparece un titular de dos partes cuya segunda parte usa la localidad real de la fuente única
    And aparece un texto de apoyo que deriva el recuento real de servicios
    And el texto no atribuye a Galapavet servicios que no estén en su catálogo publicado

  @s2
  Scenario: Cada servicio se muestra como una tarjeta con imagen, contexto y resumen verificable
    Given los cinco servicios publicados por Galapavet
    When se renderiza su rejilla en escritorio
    Then se muestran exactamente cinco tarjetas
    And cada tarjeta contiene una imagen local, una píldora de categoría, un título y un resumen derivado de sus puntos publicados
    And la imagen ocupa la parte superior de la tarjeta y el contenido textual queda dentro de su superficie con borde y radio visibles

  @s3
  Scenario: El detalle de un servicio se abre desde un control con estado accesible
    Given una tarjeta de servicio cerrada
    When el visitante activa "Ver qué incluye"
    Then se muestran los puntos publicados de ese servicio
    And el control comunica "aria-expanded" como "true"
    And el control muestra un círculo decorativo con "+" que indica visualmente el estado abierto
    And abrir una tarjeta no altera el estado de las demás tarjetas

  @s4
  Scenario: La rejilla de servicios se adapta sin comprimir las tarjetas fuera de la ventana
    Given una ventana de 320 píxeles de ancho
    When se visualiza la sección de servicios
    Then las tarjetas se organizan en una sola columna legible
    And el documento no tiene desbordamiento horizontal

