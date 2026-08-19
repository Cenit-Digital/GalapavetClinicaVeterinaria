# Fuente: Claude Design — "Veterinaria La Sierra.dc.html", sección id="servicios"
# Datos reales verificados en el array SERVICIOS del propio fichero: 12 servicios (el copy de la
# sección dice explícitamente "Doce especialidades bajo el mismo techo"). El atributo
# hint-placeholder-count="6" del sc-for es solo una pista de vista previa del editor de diseño,
# NO el número real de tarjetas — no debe tomarse como referencia de contenido final.
# Cada tarjeta guarda su propio estado abierto/cerrado (objeto serviciosAbiertos indexado por
# posición): la expansión de una tarjeta es independiente del resto, no es un acordeón excluyente.

Feature: Catálogo de servicios veterinarios expandibles
  Como visitante que quiere saber qué ofrece la clínica
  Quiero ver el catálogo completo de servicios y poder expandir cada uno
  Para conocer exactamente qué incluye antes de decidirme a reservar

  Background:
    Given el visitante está en la sección "Servicios" de la landing

  @s1
  Scenario: Se muestran las 12 tarjetas de servicio
    When el visitante mira la sección Servicios
    Then deben verse exactamente 12 tarjetas de servicio
    And cada tarjeta debe mostrar su imagen, su categoría, su título y su descripción breve
    And todas las tarjetas deben estar colapsadas por defecto

  @s2
  Scenario: Expandir una tarjeta revela el detalle y lo que incluye
    Given la tarjeta "Consulta general" está colapsada
    When el visitante pulsa el botón "Ver qué incluye" de la tarjeta "Consulta general"
    Then el panel de detalle de "Consulta general" debe expandirse
    And debe mostrarse el texto de detalle ampliado
    And deben listarse exactamente 3 elementos incluidos, cada uno con una marca de verificación
    And el botón debe pasar a mostrar el texto "Ocultar detalle"

  @s3
  Scenario: Colapsar una tarjeta expandida oculta de nuevo el detalle
    Given la tarjeta "Consulta general" está expandida
    When el visitante pulsa el botón "Ocultar detalle" de la tarjeta "Consulta general"
    Then el panel de detalle de "Consulta general" debe colapsarse
    And el botón debe volver a mostrar el texto "Ver qué incluye"

  @s4
  Scenario: Cada tarjeta de servicio se expande de forma independiente
    Given las tarjetas "Consulta general" y "Vacunación" están colapsadas
    When el visitante expande la tarjeta "Consulta general"
    Then la tarjeta "Vacunación" debe permanecer colapsada
    And el estado de "Consulta general" no debe verse afectado si más tarde se expande "Vacunación"

  @s5
  Scenario: El estado de expansión se comunica de forma accesible
    Given la tarjeta "Cirugía" está colapsada
    When el visitante expande la tarjeta "Cirugía"
    Then el atributo "aria-expanded" del botón de esa tarjeta debe pasar de "false" a "true"

  @s6
  Scenario: Las doce especialidades cubren desde medicina general hasta trámites de viaje
    When el visitante recorre las 12 tarjetas de servicio
    Then entre los títulos deben figurar al menos "Consulta general", "Vacunación", "Cirugía", "Urgencias 24 h" y "Microchip y viajes"
