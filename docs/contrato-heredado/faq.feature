# Fuente: Claude Design — "Veterinaria La Sierra.dc.html", sección id="faq"
# 6 preguntas verificadas en el array FAQ (hint-placeholder-count del editor decía 5; el
# contenido real son 6 — ver misma advertencia que en servicios.feature y galeria.feature).
# Implementado con <details name="faq">: a diferencia de Servicios y Equipo, este acordeón SÍ es
# excluyente por comportamiento nativo del navegador (mismo atributo "name" en todos los <details>):
# abrir una pregunta cierra automáticamente cualquier otra que estuviera abierta.

Feature: Preguntas frecuentes
  Como visitante con dudas antes de reservar o de la primera visita
  Quiero consultar las preguntas más habituales sin tener que llamar
  Para resolver mis dudas por mi cuenta cuando me venga bien

  Background:
    Given el visitante está en la sección "FAQ" de la landing

  @s1
  Scenario: Se muestran las seis preguntas colapsadas por defecto
    When el visitante mira la sección FAQ
    Then deben verse exactamente 6 preguntas
    And todas deben estar colapsadas por defecto

  @s2
  Scenario: Expandir una pregunta muestra su respuesta completa
    Given la pregunta "¿Cómo funcionan las urgencias 24 h?" está colapsada
    When el visitante pulsa esa pregunta
    Then debe mostrarse su respuesta completa, incluyendo el teléfono "640 22 11 90"

  @s3
  Scenario: Abrir una pregunta nueva cierra automáticamente la que estuviera abierta
    Given la pregunta "¿Cada cuánto tengo que vacunar a mi perro o gato?" está expandida
    When el visitante pulsa la pregunta "¿Tenéis planes de salud o financiación?"
    Then la pregunta "¿Tenéis planes de salud o financiación?" debe expandirse
    And la pregunta "¿Cada cuánto tengo que vacunar a mi perro o gato?" debe colapsarse automáticamente

  @s4
  Scenario: La respuesta sobre financiación detalla las condiciones de pago
    Given la pregunta "¿Tenéis planes de salud o financiación?" está colapsada
    When el visitante pulsa esa pregunta
    Then su respuesta debe mencionar el plan anual en doce cuotas y el pago aplazado sin intereses en tres meses para intervenciones a partir de 400 €
