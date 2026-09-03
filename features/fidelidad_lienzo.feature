Feature: Fidelidad visual del lienzo de la portada
  Como responsable de Galapavet quiero que las bandas y sus contenedores sigan
  el ritmo del diseño aprobado para que todas las secciones partan de una
  geometría coherente y no de reglas CSS que no llegan a aplicarse.

  @s1
  Scenario: Las bandas de la portada ocupan el ancho de la ventana y su contenido queda alineado
    Given la portada renderizada a 1440 píxeles de ancho
    When se miden sus secciones principales y sus contenedores de contenido
    Then las bandas de hero, servicios, campañas, equipo, reserva, galería, contacto y FAQ alcanzan ambos bordes de la ventana
    And el contenido de cada banda salvo la pista de galería no mide más de 1220 píxeles
    And los bordes izquierdos del contenido de cabecera, servicios, campañas, equipo, reserva, contacto y pie coinciden con una tolerancia de 1 píxel

  @s2
  Scenario: La secuencia de fondos respeta la alternancia del prototipo
    Given la portada renderizada con cualquier variante de paleta válida
    When se inspeccionan los fondos computados de las secciones después del hero
    Then servicios, equipo, galería y FAQ usan el fondo principal de la variante
    And campañas, reserva y contacto usan el fondo alterno de la misma variante
    And no hay tres secciones consecutivas con el mismo fondo

  @s3
  Scenario: Las reglas de maquetación no dependen de selectores de id que CSS Modules transforma
    Given todos los archivos "*.module.scss" de la portada
    When se buscan selectores de id y llamadas a la escala de espaciado
    Then ningún selector de id declara la maquetación de una sección
    And cada llamada a "espaciado(n)" usa un paso existente de la escala
    And los controles que antes pedían "espaciado(20)" conservan relleno horizontal visible

  @s4
  Scenario: El lienzo conserva el presupuesto y no crea desbordamiento móvil
    Given la portada construida para producción
    When se abre a 320 píxeles de ancho y se mide el CSS servido
    Then el documento no tiene desbordamiento horizontal
    And el CSS comprimido no supera 12000 bytes

