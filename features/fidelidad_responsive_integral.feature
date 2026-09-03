Feature: Fidelidad responsive integral de la portada
  Como visitante quiero que la portada conserve la claridad del diseño aprobado
  en mi pantalla para poder leer, navegar y contactar sin pérdida de contenido.

  @s1
  Scenario: Los teléfonos conservan toda la jerarquía sin desbordar
    Given la portada construida servida bajo su subpath real
    And una ventana de 320, 360, 375, 390 o 414 píxeles de ancho
    When la portada termina de cargar
    Then el documento no tiene desbordamiento horizontal ni errores de consola
    And se ven y son alcanzables la bienvenida, los dos canales de reserva, el formulario, las preguntas y el pie
    And ningún texto ni control de esas secciones queda recortado

  @s2
  Scenario: Las tabletas usan composiciones legibles en vez de encoger el escritorio
    Given la portada construida servida bajo su subpath real
    And una ventana de 480, 600, 768, 820 o 900 píxeles de ancho
    When se visualizan las secciones de tarjetas, reserva, contacto y pie
    Then sus columnas se apilan o redistribuyen sin solaparse
    And el pie contiene como máximo dos columnas legibles desde 701 hasta 1023 píxeles
    And el documento no tiene desbordamiento horizontal ni errores de consola

  @s3
  Scenario: El pie cambia de régimen sin perder información
    Given la portada construida servida bajo su subpath real
    When se mide el pie a 700, 701, 1023 y 1024 píxeles de ancho
    Then a 700 o menos la marca y las columnas se presentan en una columna
    And entre 701 y 1023 se presentan en dos columnas
    And desde 1024 se presentan en cuatro columnas
    And todos los enlaces y sus nombres accesibles permanecen presentes

  @s4
  Scenario: La cabecera cambia exactamente en el borde aprobado
    Given la portada construida servida bajo su subpath real
    When se compara la cabecera a 1023 y a 1024 píxeles de ancho
    Then a 1023 existe el control de menú móvil y no existe la navegación horizontal
    And a 1024 existe la navegación horizontal y no existe el control de menú móvil
    And en ambos anchos la marca y las acciones no se solapan ni desbordan

  @s5
  Scenario: Los controles dinámicos conservan su contenido dentro de la ventana
    Given una ventana de 320, 768 o 1024 píxeles de ancho
    When se abren el menú móvil disponible y el selector de paleta
    Then cada panel queda contenido dentro de la ventana y puede recorrerse por teclado
    And los botones y campos conservan el mínimo táctil exigido por sus contratos
    And la pista de galería es el único desplazamiento horizontal intencional y focalizable

  @s6
  Scenario: Ningún ancho intermedio introduce una franja rota
    Given la portada construida servida bajo su subpath real
    When se recorre cada 16 píxeles el intervalo de 320 a 1600 de ancho
    Then en cada viewport el documento no tiene desbordamiento horizontal ni errores de consola
    And ningún elemento no perteneciente a la pista de galería sobresale de la ventana
