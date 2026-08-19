# Fuente: Claude Design — "Veterinaria La Sierra.dc.html", sección id="reservar"
# Flujo verificado en el array FLUJO y el método avanzar() del componente:
#   1) servicio  -> opciones: Consulta general / Vacunación / Peluquería / Es una urgencia
#   2) especie   -> opciones: Perro / Gato / Exótico
#   3) dia       -> opciones: Entre semana / Este fin de semana / Lo antes posible
#   4) franja    -> opciones: Por la mañana / Por la tarde / Me da igual
#   5) nombre    -> sin opciones; campo de texto libre (marcador "Ej. Nala y Ana Martín")
# El paso 5 es el único sin "opciones": por eso, y solo por eso, se muestra el campo de texto
# libre en vez de botones de respuesta rápida (hayInput = paso sin opciones; hayOpciones = paso
# con opciones), y ambos estados son excluyentes entre sí y con el estado "hecho".
# El mensaje final de WhatsApp se construye como:
#   "Hola, quiero pedir cita en Veterinaria La Sierra. {servicio} · {especie} · {dia} · {franja}. Soy {nombre}."
#   y se envía al número +34640221190 vía enlace wa.me.
# ADVERTENCIA DE DISEÑO A CONFIRMAR CON PABLO: elegir "Es una urgencia" en el paso 1 NO altera
# el resto del guion — el chat sigue preguntando qué día y franja horaria prefiere el usuario,
# igual que para una cita no urgente. Esto puede no ser el comportamiento deseado en producción
# (lo lógico sería derivar directamente a llamada). Se documenta el comportamiento tal cual está
# implementado (@s9); no se ha "corregido" en la especificación.

Feature: Reserva de cita guiada por chat
  Como visitante que quiere pedir cita sin llamar por teléfono
  Quiero responder unas pocas preguntas guiadas por un chat
  Para recibir la hora exacta confirmada por WhatsApp sin tener que rellenar formularios largos

  Background:
    Given el visitante está en la sección "Reservar" de la landing

  @s1
  Scenario: El chat empieza con el primer mensaje del asistente y sus opciones
    When el visitante mira el widget de reserva
    Then el primer mensaje debe ser "Hola, soy el asistente de Veterinaria La Sierra. ¿Qué necesita tu mascota?"
    And deben verse exactamente 4 botones de respuesta rápida: "Consulta general", "Vacunación", "Peluquería" y "Es una urgencia"
    And no debe verse ningún campo de texto libre

  @s2
  Scenario: Elegir una respuesta rápida avanza al siguiente paso del guion
    Given el chat está en el primer paso ("servicio")
    When el visitante pulsa la opción "Vacunación"
    Then el mensaje "Vacunación" debe añadirse al historial como mensaje del visitante
    And el asistente debe responder "Entendido. ¿Con qué animal vienes?"
    And deben verse exactamente 3 opciones: "Perro", "Gato" y "Exótico"

  @s3
  Scenario: El último paso del guion no ofrece botones, sino un campo de texto libre
    Given el visitante ha respondido a los pasos "servicio", "especie", "dia" y "franja"
    When el asistente pregunta "Ya casi está. ¿Cómo os llamáis tu mascota y tú?"
    Then no deben verse botones de respuesta rápida
    And debe verse un campo de texto con el marcador "Ej. Nala y Ana Martín" y un botón de enviar

  @s4
  Scenario: No se puede enviar el campo de texto libre vacío
    Given el chat está en el último paso ("nombre") con el campo de texto vacío
    When el visitante pulsa el botón de enviar sin escribir nada
    Then el mensaje no debe añadirse al historial
    And el chat debe permanecer en el paso "nombre"

  @s5
  Scenario: Pulsar Intro en el campo de texto equivale a pulsar enviar
    Given el chat está en el último paso ("nombre") y el visitante ha escrito "Nala y Ana Martín"
    When el visitante pulsa la tecla Intro
    Then el mensaje "Nala y Ana Martín" debe añadirse al historial como mensaje del visitante

  @s6
  Scenario: Completar los cinco pasos genera el resumen final del asistente
    Given el visitante ha respondido "Consulta general", "Perro", "Entre semana" y "Por la mañana" a los cuatro primeros pasos
    When el visitante envía "Nala y Ana Martín" como respuesta al último paso
    Then el asistente debe mostrar el mensaje "Gracias, Nala y Ana Martín. Anotado: Consulta general · Perro · Entre semana · Por la mañana. Te confirmamos la hora exacta por WhatsApp en menos de 2 horas."
    And el chat debe pasar al estado "hecho"

  @s7
  Scenario: En el estado "hecho" se ofrece enviar la solicitud por WhatsApp
    Given el chat ha llegado al estado "hecho" con las respuestas del visitante
    When el visitante mira el pie del widget de chat
    Then debe verse el botón "Enviar la solicitud por WhatsApp"
    And el enlace de ese botón debe abrir WhatsApp hacia el número "+34640221190" con un mensaje que incluya las cuatro respuestas y el nombre facilitados
    And debe verse el botón "Pedir otra cita"

  @s8
  Scenario: "Pedir otra cita" reinicia el chat desde el principio
    Given el chat está en el estado "hecho"
    When el visitante pulsa el botón "Pedir otra cita"
    Then el historial de mensajes debe reiniciarse mostrando solo el primer mensaje del asistente
    And el chat debe volver al primer paso ("servicio") con sus 4 opciones iniciales

  @s9
  Scenario: Elegir "Es una urgencia" no altera las preguntas posteriores del guion
    Given el chat está en el primer paso ("servicio")
    When el visitante pulsa la opción "Es una urgencia"
    Then el asistente debe preguntar igualmente "Entendido. ¿Con qué animal vienes?"
    And el guion debe continuar con las preguntas de día y franja horaria exactamente igual que para el resto de opciones

  @s10
  Scenario: Se avisa de que la solicitud no se envía a ningún servidor hasta pulsar WhatsApp
    When el visitante mira el pie del widget de chat en cualquier paso
    Then debe verse el texto "Demostración: la solicitud no se envía a ningún servidor hasta que pulsas WhatsApp."

  @s11
  Scenario: El visitante puede saltarse el chat y contactar directamente
    When el visitante mira la sección Reservar
    Then debe verse un botón "WhatsApp" que abre una conversación directa con el número "+34640221190"
    And debe verse un botón "Llamar a la clínica" que inicia una llamada al número "+34918442160"
    And deben listarse exactamente 3 ventajas de reservar por este medio, incluyendo "Confirmamos la hora exacta en menos de 2 horas"
