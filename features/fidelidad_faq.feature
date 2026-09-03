Feature: Fidelidad visual de las preguntas frecuentes
  Como visitante quiero encontrar las preguntas en una columna tranquila y
  centrada para poder abrir una respuesta sin perder el comportamiento accesible del acordeón.

  @s1
  Scenario: La cabecera y la lista de FAQ están realmente centradas en escritorio
    Given la portada renderizada a 1440 píxeles de ancho
    When se mide la sección de preguntas frecuentes
    Then el cintillo y el titular están centrados
    And la lista de preguntas mide como máximo 860 píxeles
    And los márgenes izquierdo y derecho de la lista difieren como máximo en 1 píxel

  @s2
  Scenario: Cada pregunta conserva su nombre accesible y muestra el indicador visual de expansión
    Given todas las preguntas frecuentes cerradas
    When el visitante inspecciona una fila de pregunta
    Then la fila tiene una línea superior o divisoria visible
    And el botón conserva su nombre accesible exacto
    And el botón contiene a la derecha un círculo decorativo con "+"

  @s3
  Scenario: El acordeón sigue siendo excluyente y operable con teclado
    Given una pregunta frecuente cerrada y otra abierta
    When el visitante activa la pregunta cerrada con el teclado
    Then la nueva respuesta se muestra y su botón comunica "aria-expanded" como "true"
    And la respuesta que estaba abierta se oculta y su botón comunica "aria-expanded" como "false"
    And el indicador "+" comunica visualmente el estado abierto sin cambiar el nombre accesible del botón

  @s4
  Scenario: La FAQ no inventa preguntas y cabe en móvil
    Given las preguntas publicadas actualmente por Galapavet
    When se renderiza la sección a 320 píxeles de ancho
    Then se muestran exactamente esas preguntas y ninguna del prototipo ficticio
    And el documento no tiene desbordamiento horizontal

