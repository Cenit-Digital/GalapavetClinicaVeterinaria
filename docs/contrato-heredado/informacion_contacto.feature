# Fuente: Claude Design — "Veterinaria La Sierra.dc.html", sección id="contacto"
# Panel de información: es la tarjeta que aparece junto al formulario (informacion_contacto),
# no el propio formulario (ver formulario_contacto.feature). Datos verificados en el array
# datosContacto (4 elementos). Mapa embebido de OpenStreetMap centrado en Miraflores de la Sierra.
# Dos números de teléfono distintos y verificados: 918 44 21 60 (clínica, línea fija) y
# 640 22 11 90 (urgencias 24 h, móvil) — no deben confundirse entre sí en la implementación.

Feature: Panel de información de contacto
  Como visitante que necesita llamar o ir en persona
  Quiero ver de un vistazo la dirección, teléfonos, horario y email de la clínica
  Para elegir el canal de contacto que mejor me venga

  Background:
    Given el visitante está en la sección "Contacto" de la landing

  @s1
  Scenario: Se muestra el aviso destacado de urgencias con llamada directa
    When el visitante mira el panel de información de contacto
    Then debe verse un bloque destacado "Urgencias 24 h" con el teléfono "640 22 11 90"
    And debe verse un botón "Llamar ahora" que inicia una llamada al número "+34640221190"

  @s2
  Scenario: Se muestra un mapa centrado en la ubicación de la clínica
    When el visitante mira el panel de información de contacto
    Then debe verse un mapa embebido con el título "Mapa de Veterinaria La Sierra"

  @s3
  Scenario: Se muestran los cuatro bloques de datos de contacto
    When el visitante mira el panel de información de contacto
    Then deben verse exactamente 4 bloques de datos: "Dirección", "Teléfonos", "Horario" y "Email"
    And el bloque "Dirección" debe mostrar "Ctra. de la Sierra, 42" y "28792 Miraflores de la Sierra, Madrid"
    And el bloque "Teléfonos" debe distinguir "918 44 21 60 · clínica" de "640 22 11 90 · urgencias 24 h"
    And el bloque "Horario" debe mostrar "L–V 9:00–14:00 y 16:30–20:30" y "Sábados 10:00–14:00 · domingos urgencias"
    And el bloque "Email" debe mostrar "hola@veterinarialasierra.es" y "Respondemos el mismo día"
