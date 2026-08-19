# Fuente: Claude Design — "Veterinaria La Sierra.dc.html", sección id="equipo"
# 6 profesionales verificados en el array EQUIPO. Cada tarjeta guarda su propio estado
# abierto/cerrado (objeto equipoAbierto indexado por posición): igual que en Servicios, la
# expansión es independiente por tarjeta, no es un acordeón excluyente.

Feature: Presentación del equipo veterinario
  Como visitante que va a confiar la salud de su mascota a la clínica
  Quiero conocer quién forma el equipo y su experiencia
  Para generar confianza antes de la primera visita

  Background:
    Given el visitante está en la sección "Equipo" de la landing

  @s1
  Scenario: Se muestran las seis tarjetas del equipo con nombre y rol
    When el visitante mira la sección Equipo
    Then deben verse exactamente 6 tarjetas de profesional
    And cada tarjeta debe mostrar la foto, el nombre y el rol, aunque esté colapsada
    And todas las tarjetas deben estar colapsadas por defecto

  @s2
  Scenario: Expandir una tarjeta revela la biografía, la colegiación y los idiomas
    Given la tarjeta de "Dra. Elena Vargas" está colapsada
    When el visitante pulsa el botón "+" de la tarjeta de "Dra. Elena Vargas"
    Then debe mostrarse su biografía completa
    And debe mostrarse el dato "Colegiada/o" con el valor "nº 28-7412"
    And debe mostrarse el dato "Idiomas" con el valor "Español · Inglés"

  @s3
  Scenario: El texto accesible del botón cambia según el estado de la tarjeta
    Given la tarjeta de "Dr. Marcos Nieto" está colapsada
    When el visitante expande la tarjeta de "Dr. Marcos Nieto"
    Then el "aria-label" del botón debe pasar a "Ocultar la biografía de Dr. Marcos Nieto"

  @s4
  Scenario: Cada tarjeta del equipo se expande de forma independiente
    Given las tarjetas de "Dra. Lucía Ferrer" y "Sergio Ibáñez" están colapsadas
    When el visitante expande la tarjeta de "Dra. Lucía Ferrer"
    Then la tarjeta de "Sergio Ibáñez" debe permanecer colapsada

  @s5
  Scenario: Cada profesional muestra hasta tres etiquetas de especialidad
    When el visitante mira la tarjeta de "Dra. Nadia Olmo"
    Then deben verse exactamente 3 etiquetas
    And entre ellas deben figurar "Exóticos", "Aves" y "Reptiles"
