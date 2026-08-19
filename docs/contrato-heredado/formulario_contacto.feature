# Fuente: Claude Design — "Veterinaria La Sierra.dc.html", sección id="contacto"
# Campos verificados en el <form>: nombre (texto, obligatorio), telefono (tel, obligatorio),
# email (email, obligatorio), motivo (select, NO obligatorio), mensaje (textarea, NO obligatorio),
# casilla de aceptación de política de privacidad (obligatoria). La validación es la nativa de
# HTML5 (atributo required); no hay validación adicional por JavaScript en el prototipo.
# El envío (enviarContacto) solo hace preventDefault() y cambia el estado a "enviado": en este
# prototipo NO hay llamada real a ningún servidor ni almacenamiento del mensaje.
#
# ADVERTENCIA A CONFIRMAR CON PABLO: a diferencia del chat de reserva (que sí incluye el aviso
# "la solicitud no se envía a ningún servidor..."), este formulario NO muestra ningún aviso
# equivalente, pese a tener el mismo comportamiento (nada se envía realmente). Antes de pasar a
# implementación real hay que decidir entre (a) añadir un aviso similar, o (b) conectar el
# formulario a un envío real (email/CRM/HubSpot). No se ha añadido ningún escenario que dé a
# entender que el mensaje se envía de verdad.
#
# No se ha podido verificar con certeza si, al reiniciar el formulario tras un envío, los valores
# previamente escritos se limpian o se conservan (el método reiniciarContacto solo cambia el
# estado "enviado" a falso, sin tocar los valores de los campos) — por eso @s5 solo comprueba que
# el formulario vuelve a mostrarse, sin afirmar nada sobre el contenido de los campos. Confirmar
# el comportamiento deseado antes de implementar.

Feature: Formulario de contacto
  Como visitante que prefiere escribir antes que llamar
  Quiero enviar una consulta con mis datos y el motivo
  Para recibir respuesta el mismo día sin tener que llamar por teléfono

  Background:
    Given el visitante está en la sección "Contacto" de la landing

  @s1
  Scenario: Se muestra el formulario de contacto por defecto
    When el visitante mira la sección Contacto
    Then debe verse el formulario "Escríbenos" con los campos "Tu nombre", "Teléfono", "Email", "Motivo", "Cuéntanos" y la casilla de aceptación de la política de privacidad

  @s2
  Scenario: Nombre, teléfono, email y la casilla de aceptación son obligatorios
    Given el formulario de contacto está vacío
    When el visitante intenta enviar el formulario sin rellenar "Tu nombre"
    Then el navegador debe impedir el envío y señalar el campo "Tu nombre" como obligatorio

  @s3
  Scenario: Motivo y mensaje no son obligatorios para poder enviar
    Given el visitante ha rellenado "Tu nombre", "Teléfono", "Email" y ha marcado la casilla de aceptación
    And ha dejado vacíos "Motivo" y "Cuéntanos"
    When el visitante pulsa "Enviar mensaje"
    Then el formulario debe enviarse sin que el navegador bloquee el envío

  @s4
  Scenario: Enviar el formulario completo muestra la confirmación de recepción
    Given el visitante ha rellenado todos los campos obligatorios y ha marcado la casilla de aceptación
    When el visitante pulsa "Enviar mensaje"
    Then debe mostrarse el mensaje "Mensaje recibido"
    And debe verse el texto "Te responderemos hoy mismo en horario de clínica. Si es una urgencia, llama al 640 22 11 90."
    And el formulario de campos ya no debe mostrarse

  @s5
  Scenario: "Enviar otro mensaje" permite volver a rellenar el formulario
    Given se muestra la confirmación "Mensaje recibido"
    When el visitante pulsa el enlace "Enviar otro mensaje"
    Then debe volver a mostrarse el formulario "Escríbenos"

  @s6
  Scenario: El campo Motivo ofrece cinco opciones predefinidas
    When el visitante abre el desplegable "Motivo"
    Then deben verse exactamente las opciones "Pedir cita", "Consulta sobre un tratamiento", "Campañas y precios", "Historial y documentación" y "Otro"
