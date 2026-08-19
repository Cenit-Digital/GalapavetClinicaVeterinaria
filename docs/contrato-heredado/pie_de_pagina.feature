# Fuente: Claude Design — "Veterinaria La Sierra.dc.html", elemento <footer>
# 3 columnas de enlaces verificadas en columnasPie, 4 enlaces cada una (coincide con el hint del editor).
#
# ADVERTENCIA A CONFIRMAR CON PABLO: los tres enlaces legales del pie ("Aviso legal", "Privacidad"
# y "Cookies") apuntan actualmente los tres a "#faq" como marcador de posición — no existen
# páginas legales reales todavía en el diseño. Se documenta el comportamiento tal cual está
# implementado (@s3); antes de producción hace falta decidir el destino real de cada enlace.

Feature: Pie de página
  Como visitante que llega al final de la página
  Quiero encontrar enlaces rápidos a las secciones y a los datos legales
  Para volver a lo que me interesa o consultar las condiciones legales

  Background:
    Given el visitante llega al final de la landing

  @s1
  Scenario: Se muestra el bloque de marca con la descripción de la clínica
    When el visitante mira el pie de página
    Then debe verse el logotipo y el nombre "Veterinaria La Sierra"
    And debe verse el texto "Clínica veterinaria en Miraflores de la Sierra. Medicina preventiva, cirugía y urgencias 24 h desde 2013."

  @s2
  Scenario: Se muestran las tres columnas de enlaces
    When el visitante mira el pie de página
    Then deben verse exactamente 3 columnas: "Clínica", "Contenido" y "Contacto"
    And cada columna debe tener exactamente 4 enlaces
    And la columna "Contacto" debe incluir un enlace de llamada a "918 44 21 60" y otro a "Urgencias 24 h"

  @s3
  Scenario: Los enlaces legales existen pero apuntan a un destino provisional
    When el visitante mira la barra inferior del pie de página
    Then deben verse los enlaces "Aviso legal", "Privacidad" y "Cookies"
    And los tres enlaces deben apuntar actualmente a la sección "FAQ" como marcador de posición

  @s4
  Scenario: Se muestra el aviso de copyright con el número de registro
    When el visitante mira la barra inferior del pie de página
    Then debe verse el texto "© 2026 Veterinaria La Sierra · Centro veterinario registrado nº 28/0791"
