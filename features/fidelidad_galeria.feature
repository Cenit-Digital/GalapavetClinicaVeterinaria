Feature: Fidelidad visual de la galería
  Como visitante quiero recorrer la galería mediante tarjetas y controles
  claros para que las imágenes demostrativas no parezcan contenido roto ni material propio de la clínica.

  @s1
  Scenario: La galería tiene una cabecera con aviso demostrativo y controles a la derecha
    Given la portada renderizada a 1440 píxeles de ancho
    When se visualiza la sección de galería
    Then existe el cintillo "Galería" y un titular "Galería"
    And el aviso de demostración actual se conserva completo
    And los botones de foto anterior y siguiente están a la derecha de la cabecera
    And cada uno de los dos botones es circular y mide 48 por 48 píxeles con una tolerancia de 1 píxel

  @s2
  Scenario: Cada fotografía se pinta dentro de una tarjeta con sus dos líneas de contexto
    Given las seis fotografías locales de la galería
    When se renderiza la pista de galería
    Then se muestran las seis fotografías con su texto alternativo publicado
    And cada fotografía queda dentro de una tarjeta con borde, radio y superficie visibles
    And el pie de cada tarjeta separa el nombre de la fotografía y su descripción en elementos distintos
    And la pista se puede recibir foco por teclado

  @s3
  Scenario: Los controles desplazan la pista una tarjeta sin mostrar la barra de scroll nativa
    Given la pista de galería al comienzo y con más de una tarjeta visible
    When el visitante activa "Foto siguiente"
    Then la pista se desplaza exactamente un ancho de tarjeta más su separación
    And al activar "Foto anterior" vuelve el mismo paso en sentido contrario
    And el desplazamiento respeta "prefers-reduced-motion"
    And la barra de desplazamiento nativa no se ve

  @s4
  Scenario: La pista puede sangrar por el borde derecho sin ensanchar el documento móvil
    Given una ventana de 320 píxeles de ancho
    When se visualiza la galería y se abre el foco sobre la pista
    Then la cabecera mantiene la alineación del contenedor principal
    And las tarjetas se pueden desplazar horizontalmente dentro de la pista
    And el documento no tiene desbordamiento horizontal

