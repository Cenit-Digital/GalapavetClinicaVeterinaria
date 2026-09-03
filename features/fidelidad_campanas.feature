Feature: Fidelidad visual de las campañas destacadas
  Como visitante quiero distinguir las campañas demostrativas y abrir su
  listado desde una composición clara sin que se inventen precios ni vigencias.

  @s1
  Scenario: En escritorio el texto de campañas y sus tarjetas comparten una fila
    Given la portada renderizada a 1440 píxeles de ancho
    When se mide la sección de campañas
    Then el bloque de titular, aviso y llamada a la acción ocupa una columna
    And las tarjetas de campaña ocupan una segunda columna a su derecha
    And ambas columnas comparten la misma fila con una tolerancia de 1 píxel

  @s2
  Scenario: Cada campaña conserva el aviso demostrativo y una tarjeta compacta
    Given las campañas destacadas de la portada
    When se renderiza la sección
    Then el aviso de demostración permanece íntegro y describe accesiblemente la región
    And cada tarjeta contiene una imagen, una píldora "Demostración", un título y una línea de detalle derivada de contenido publicado
    And ninguna tarjeta ni la sección muestra un precio, porcentaje o vigencia no confirmados

  @s3
  Scenario: La llamada a la acción y las tarjetas conducen al listado de campañas
    Given la sección de campañas visible
    When el visitante examina sus enlaces
    Then existe un botón primario cuyo nombre accesible exacto es "Ver campañas"
    And el botón y cada tarjeta enlazan a la página de campañas

  @s4
  Scenario: En móvil las dos columnas se apilan sin perder el aviso demostrativo
    Given una ventana de 320 píxeles de ancho
    When se muestra la sección de campañas
    Then el bloque textual precede a las tarjetas en el orden de lectura
    And el documento no tiene desbordamiento horizontal

