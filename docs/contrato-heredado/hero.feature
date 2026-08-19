# Fuente: Claude Design — "Veterinaria La Sierra.dc.html", sección id="inicio"

Feature: Sección de bienvenida (Hero)
  Como visitante que llega por primera vez a la web
  Quiero entender en segundos qué ofrece la clínica y cómo actuar
  Para decidir si reservo cita o llamo directamente

  Background:
    Given el visitante carga la página de inicio

  @s1
  Scenario: Se muestra el mensaje principal de bienvenida
    When el visitante mira la sección Hero
    Then debe verse la ubicación "Miraflores de la Sierra · Madrid"
    And debe verse el titular "Cuidamos la salud y la felicidad de tu mascota"
    And debe verse el texto descriptivo sobre medicina preventiva, cirugía y urgencias 24 h

  @s2
  Scenario: El botón "Reservar cita" lleva a la sección de reserva
    When el visitante pulsa el botón "Reservar cita"
    Then la página debe desplazarse hasta la sección "Reservar"

  @s3
  Scenario: El botón "Urgencias 24 h" del Hero inicia una llamada
    When el visitante pulsa el botón "Urgencias 24 h" del Hero
    Then el dispositivo debe iniciar una llamada al número "+34640221190"

  @s4
  Scenario: Se muestran las cuatro cifras de confianza
    When el visitante mira la franja inferior del Hero
    Then deben verse exactamente 4 cifras
    And entre ellas deben figurar "+12 años" con la etiqueta "cuidando la sierra" y "4,9 ★" con la etiqueta "327 reseñas en Google"
