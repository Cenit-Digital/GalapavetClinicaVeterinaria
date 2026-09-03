Feature: Fidelidad visual de la barra y la cabecera
  Como visitante quiero reconocer la marca y llegar a las acciones principales
  desde una cabecera alineada con la portada y fiel al diseño aprobado.

  @s1
  Scenario: En escritorio la barra y la cabecera se alinean con el contenido de la portada
    Given la portada renderizada a 1440 píxeles de ancho
    When se visualizan la barra de urgencias y la cabecera
    Then sus contenidos comparten la columna interior de 1220 píxeles
    And la barra comunica exactamente el rótulo real de urgencias fuera de horario y su teléfono real
    And la marca muestra el logotipo real, el nombre "Galapavet" y su descriptor en un bloque compacto
    And no se anuncia un servicio de urgencias "24 h", "24h" ni equivalente

  @s2
  Scenario: En escritorio se ven las acciones principales con destinos reales
    Given una ventana de escritorio y la cabecera sin el menú móvil
    When el visitante inspecciona sus controles visibles
    Then los enlaces de navegación se muestran en una sola fila
    And existe un botón "Urgencias" que enlaza al teléfono de urgencias de la fuente única
    And existe un enlace "Tienda" hacia la página de tienda
    And los controles conservan un área táctil de al menos 44 por 44 píxeles

  @s3
  Scenario: En móvil el menú conserva navegación y urgencias sin desbordar
    Given una ventana de 320 píxeles de ancho
    When el visitante abre el menú de navegación
    Then el botón comunica "aria-expanded" en estado abierto
    And cada enlace de navegación y el botón de urgencias es alcanzable por teclado
    And activar un enlace cierra el menú
    And el documento no desborda horizontalmente

