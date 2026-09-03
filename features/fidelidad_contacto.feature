Feature: Fidelidad visual del contacto
  Como visitante quiero escribir o llamar desde un contacto de dos columnas
  con información verificable para poder distinguir el formulario, las urgencias fuera de horario y la ubicación.

  @s1
  Scenario: La sección de contacto muestra cabecera y dos columnas en escritorio
    Given la portada renderizada a 1440 píxeles de ancho
    When se mide la sección de contacto
    Then aparece un cintillo "Contacto", un titular y un párrafo sin promesas no publicadas
    And la tarjeta del formulario y la columna de información comparten una fila
    And ambas columnas se alinean por su borde superior con una tolerancia de 1 píxel

  @s2
  Scenario: El formulario vive en una tarjeta y conserva sus campos accesibles
    Given la sección de contacto visible
    When el visitante inspecciona la tarjeta "Escríbenos"
    Then los campos nombre y teléfono comparten una fila en escritorio
    And correo, motivo y mensaje ocupan el ancho de la tarjeta
    And cada campo mantiene una etiqueta asociada y su validación vigente
    And el botón "Enviar mensaje" ocupa todo el ancho de la tarjeta

  @s3
  Scenario: La tarjeta de urgencias comunica únicamente el servicio real fuera de horario
    Given el rótulo y el teléfono de urgencias de la fuente única
    When se visualiza la tarjeta de urgencias
    Then la tarjeta tiene el fondo de urgencia, el rótulo exacto y el teléfono real
    And existe un botón blanco "Llamar ahora" que apunta al "tel:" de urgencias
    And no aparece una promesa de urgencias 24 horas

  @s4
  Scenario: La tarjeta de datos usa un mapa local con pin y datos separados
    Given el mapa estático local de Galapavet y los datos publicados de la clínica
    When se visualiza la tarjeta de datos
    Then se muestra un mapa local con pin y la atribución visible de OpenStreetMap
    And se muestran tres bloques rotulados "Dirección", "Teléfonos" y "Horario"
    And cada bloque usa únicamente los datos reales de la fuente única
    And la portada no realiza ninguna petición a un dominio externo

  @s5
  Scenario: El contacto se apila en móvil sin desbordar sus tarjetas
    Given una ventana de 320 píxeles de ancho
    When se visualiza el contacto
    Then el formulario precede a la columna de urgencias y datos en el orden de lectura
    And el documento no tiene desbordamiento horizontal

