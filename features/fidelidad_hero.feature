Feature: Fidelidad visual de la bienvenida
  Como visitante quiero entender desde el primer vistazo dónde estoy y cómo
  contactar para que la bienvenida tenga la jerarquía y presencia del diseño aprobado.

  @s1
  Scenario: El hero centra todos sus elementos y muestra las dos acciones
    Given la portada renderizada a 1440 píxeles de ancho
    When se inspecciona la sección de bienvenida
    Then la localidad real derivada de la fuente única se muestra en una píldora centrada
    And el titular, el subtítulo y la botonera están centrados dentro de la sección
    And existe una acción principal hacia la reserva y una acción secundaria hacia un contacto real
    And los dos botones muestran relleno horizontal y ninguno corta su texto

  @s2
  Scenario: La banda inferior del hero se ve completa y usa solo cifras derivadas
    Given la sección de bienvenida está lista para verse en un navegador de escritorio
    When se mide el último contenido de la sección
    Then las cuatro cifras derivadas por "construirCifrasBienvenida" se ven por completo antes de terminar el hero
    And el hero no recorta contenido verticalmente
    And no se muestra una cifra de antigüedad, reputación, volumen o equipo que no provenga de los datos publicados

  @s3
  Scenario: El hero se adapta a móvil sin ocultar acciones ni crear una barra horizontal
    Given una ventana de 320 píxeles de ancho
    When se carga la portada en su posición inicial
    Then la píldora, el titular, las acciones y la banda de cifras siguen siendo visibles y alcanzables
    And el documento no tiene desbordamiento horizontal

