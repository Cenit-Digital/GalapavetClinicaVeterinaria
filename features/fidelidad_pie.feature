Feature: Fidelidad visual del pie de página
  Como visitante quiero encontrar marca, navegación, contacto y legales en
  un pie ordenado para que la página termine con la misma claridad que el diseño aprobado.

  @s1
  Scenario: En escritorio el pie organiza la marca y tres columnas en una misma fila
    Given la portada renderizada a 1440 píxeles de ancho
    When se mide el contenido superior del pie
    Then la marca y las tres columnas "Clínica", "Contenido" y "Contacto" comparten una fila
    And la columna de marca es más ancha que cada una de las tres columnas de enlaces
    And el logotipo real y el texto "Galapavet" se alinean en una misma línea

  @s2
  Scenario: Los enlaces de las columnas se presentan sin subrayado en reposo
    Given el pie de página visible en escritorio
    When el visitante inspecciona un enlace de sus columnas
    Then el enlace no está subrayado en reposo
    And al pasar el puntero cambia al color primario de la variante activa
    And los enlaces de contacto derivan de la fuente única

  @s3
  Scenario: La barra inferior mantiene los enlaces legales en una fila a la derecha
    Given el pie de página renderizado a 1440 píxeles de ancho
    When se mide la barra inferior
    Then el aviso de copyright queda a la izquierda
    And los tres enlaces legales quedan en una sola fila a su derecha
    And cada enlace conserva en su nombre accesible el aviso de apertura en nueva ventana
    And ese aviso no aparece como texto visible que rompa la fila

  @s4
  Scenario: El pie conserva el logotipo real y se adapta a móvil
    Given una ventana de 320 píxeles de ancho
    When se desplaza la página hasta el pie y terminan de cargar sus imágenes diferidas
    Then el logotipo local tiene ancho natural mayor que cero
    And la marca y las columnas se apilan sin desbordamiento horizontal

