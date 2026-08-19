# Fuente: Claude Design — "Veterinaria La Sierra.dc.html" (proyecto ClinicaVeterinariaGalapavet.zip)
# Prop de diseño: mostrarBarraUrgencias (boolean, default true) · telefonoUrgencias (text, default "640 22 11 90")

Feature: Barra de urgencias 24h
  Como visitante de la web de Veterinaria La Sierra
  Quiero ver de inmediato si hay atención de urgencias disponible y su teléfono
  Para poder llamar sin tener que buscar el dato en el resto de la página

  @s1
  Scenario: La barra de urgencias se muestra por defecto al cargar la página
    Given la propiedad "mostrarBarraUrgencias" está activa
    When el visitante carga la página de inicio
    Then debe verse una barra superior con el texto "Urgencias 24 h"
    And debe verse el texto "Atención inmediata todos los días del año"
    And el indicador de estado debe parpadear de forma continua

  @s2
  Scenario: La barra de urgencias puede desactivarse desde la configuración
    Given la propiedad "mostrarBarraUrgencias" está desactivada
    When el visitante carga la página de inicio
    Then la barra de urgencias no debe mostrarse

  @s3
  Scenario: El teléfono mostrado en la barra es configurable
    Given la propiedad "telefonoUrgencias" tiene el valor "640 22 11 90"
    When el visitante carga la página de inicio
    Then la barra de urgencias debe mostrar el texto "640 22 11 90"

  @s4
  Scenario: Pulsar el teléfono de la barra inicia una llamada
    Given la barra de urgencias está visible
    When el visitante pulsa el número de teléfono de la barra
    Then el dispositivo debe iniciar una llamada al número "+34640221190"
