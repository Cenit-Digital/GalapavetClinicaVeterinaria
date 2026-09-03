Feature: Fidelidad visual del equipo
  Como visitante quiero conocer al equipo mediante tarjetas proporcionadas y
  honestas para que la forma del diseño no sustituya datos que la clínica no publica.

  @s1
  Scenario: La cabecera del equipo está centrada y deriva cualquier recuento de la fuente real
    Given la portada renderizada a 1440 píxeles de ancho
    When se visualiza la sección del equipo
    Then el cintillo, el titular y su párrafo están centrados
    And todo recuento mostrado coincide con el número real de miembros publicados
    And el texto no afirma que haya seis profesionales, colegiaciones ni especialidades no publicadas

  @s2
  Scenario: Cada miembro usa la geometría de tarjeta sin atribuirle una fotografía falsa
    Given los miembros publicados por Galapavet
    When se renderizan sus tarjetas
    Then cada tarjeta tiene un panel superior con proporción cuatro a tres
    And el panel no contiene una imagen de persona
    And el avatar de iniciales queda centrado dentro de ese panel
    And el nombre y el cargo publicados aparecen bajo el panel

  @s3
  Scenario: Solo la formación publicada se puede desplegar desde el botón circular
    Given una tarjeta de un miembro con formación publicada y otra sin formación publicada
    When el visitante examina sus controles
    Then solo la tarjeta con formación tiene un botón circular con "+"
    And activar ese botón actualiza "aria-expanded" y revela su formación
    And ninguna tarjeta muestra chips de especialidad mientras el dato no exista en la fuente única

  @s4
  Scenario: Las tarjetas del equipo se apilan en móvil sin desbordar
    Given una ventana de 320 píxeles de ancho
    When se renderiza el equipo
    Then cada tarjeta cabe completamente dentro de la ventana
    And el documento no tiene desbordamiento horizontal

