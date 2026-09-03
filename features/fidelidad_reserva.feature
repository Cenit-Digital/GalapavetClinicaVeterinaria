Feature: Fidelidad visual de la reserva por chat
  Como visitante quiero encontrar los canales reales de cita y un chat claro
  para poder iniciar una reserva sin promesas comerciales que la clínica no ha publicado.

  @s1
  Scenario: En escritorio la información de reserva y el chat forman dos columnas equilibradas
    Given la portada renderizada a 1440 píxeles de ancho
    When se mide la sección de reserva
    Then el bloque informativo y la tarjeta de chat comparten una fila
    And la tarjeta de chat tiene una altura mínima de 470 píxeles
    And la tarjeta se alinea verticalmente con el bloque informativo

  @s2
  Scenario: Los dos canales de contacto usan los destinos confirmados de la fuente única
    Given el número móvil confirmado para WhatsApp y el teléfono de la clínica en la fuente única
    When el visitante visualiza las acciones de reserva
    Then el primer enlace se llama exactamente "WhatsApp" y apunta al "wa.me" del móvil confirmado
    And el segundo enlace se llama exactamente "Llamar a la clínica" y apunta al "tel:" de la clínica
    And ambos controles muestran relleno, tienen al menos 44 por 44 píxeles y no desbordan su texto

  @s3
  Scenario: La lista de apoyo reproduce solo los tres tramos de horario reales
    Given los horarios publicados por Galapavet
    When se muestra la información bajo las acciones de reserva
    Then se muestran exactamente los tres tramos de horario publicados
    And cada tramo lleva una marca decorativa que no altera su texto accesible
    And no se promete confirmación en un plazo ni disponibilidad que no esté publicada

  @s4
  Scenario: La tarjeta de chat conserva sus tres bandas y sus controles accesibles
    Given la reserva por chat en su estado inicial
    When el visitante inspecciona la tarjeta
    Then existe una cabecera con avatar, nombre y estado disponible
    And existe un historial con burbujas distinguibles por autor
    And existe un pie con chips de respuesta, campo de texto y el botón "Enviar respuesta"
    And los chips y el botón de envío alcanzan al menos 44 por 44 píxeles

  @s5
  Scenario: La reserva se apila en móvil sin perder los canales ni el chat
    Given una ventana de 320 píxeles de ancho
    When se renderiza la sección de reserva
    Then los canales reales aparecen antes de la tarjeta de chat en el orden de lectura
    And el documento no tiene desbordamiento horizontal

