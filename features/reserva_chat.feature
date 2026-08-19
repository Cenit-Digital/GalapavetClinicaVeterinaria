# FUENTE DEL COMPORTAMIENTO
#   - Prototipo Claude Design «Veterinaria La Sierra.dc.html», sección id="reservar": array FLUJO,
#     métodos avanzar() / enviarTexto() / reiniciarChat() y los tres estados excluyentes del pie
#     del widget (hayOpciones = paso con opciones · hayInput = paso sin opciones · chatHecho).
#     De ahí se hereda la INTERACCIÓN: guion por pasos, respuestas rápidas, un único paso de texto
#     libre con botón de enviar y tecla Intro, resumen final, reinicio y aviso de que no hay envío.
#   - project-spec.md → Decisión 5 (el chat se conserva íntegro, el guion se adapta a los servicios
#     reales y la incoherencia de «Es una urgencia» SE CORRIGE), Decisión 1 (afirmación sobre el
#     negocio = solo dato verificado), Decisión 2 (no existe «Urgencias 24 h»).
#   - project-spec.md → Invariante 2 (el dato de negocio se escribe una vez y se deriva),
#     Invariante 5 (el estado condicional vive en un atributo ARIA, no en una clase CSS),
#     Invariante 6 (la decisión vive en módulo puro; el .tsx solo cablea).
#   - feature_list.json → feature 7 `reserva_chat` y sus 6 criterios de aceptación.
#   - docs/datos-galapavet.md → §1 (nombre), §2 (teléfonos), §3 (horario), §5 (los 5 servicios),
#     §7 (lo que es falso), §9 (lo que el cliente no publica).
#
# DATOS REALES QUE USA ESTE CONTRATO (todos de docs/datos-galapavet.md, ninguno inventado)
#   Nombre .................... Galapavet                     (§1)
#   Teléfono clínica .......... 91 082 92 67  → tel:+34910829267   (§2)
#   Teléfono móvil ............ 685 34 31 49  → tel:+34685343149   (§2)
#   Urgencias fuera de horario  91 851 13 93  → tel:+34918511393   (§2, rótulo literal del cliente)
#   Horario ................... L–V 11:00 a 14:00 y 16:30 a 20:00 · Sábados 11:00 a 14:00 ·
#                               Domingos cerrado                    (§3)
#   Servicios publicados ...... Cirugía y anestesia · Diagnóstico de imagen · Medicina general ·
#                               Análisis · Especialidades           (§5)
#   Los literales de este fichero se copian A MANO al test (patrón
#   `doble-de-test-anclado-al-literal-no-al-simbolo`); no se re-derivan de la constante de producción.
#
# QUÉ CAMBIA RESPECTO AL CONTRATO HEREDADO (docs/contrato-heredado/reserva_chat.feature, 11 escenarios)
#   La interacción aprobada se respeta. Lo que se sustituye son los DATOS y las tres decisiones de
#   producto que el propio contrato heredado dejó marcadas o que afirmaban cosas falsas:
#
#   1. Nombre y teléfonos reales. Desaparecen «Veterinaria La Sierra», +34640221190 y +34918442160
#      (§7: FALSOS, no son de Galapavet).
#   2. Las opciones del paso «servicio» pasan a ser los 5 bloques que el cliente publica (§5) más
#      «Es una urgencia». Desaparece «Peluquería»: §7 la marca como servicio inventado del prototipo
#      y el cliente NO la publica. «Vacunación» tampoco es opción propia: el cliente la publica
#      dentro de «Medicina general» (§5.3), y ahí queda.
#   3. El paso «especie» pierde sus opciones cerradas «Perro / Gato / Exótico» y pasa a texto libre
#      con la MISMA pregunta. Motivo: el cliente no publica qué especies atiende (§9, verificado por
#      ausencia; §7 marca «animales exóticos» como servicio inventado del prototipo, y el propio
#      propósito del proyecto señala «no explica qué animales atienden» como carencia de la web
#      actual). Una lista cerrada afirmaría qué especies se atienden y cuáles no; preguntarlo en
#      abierto no afirma nada. La mecánica de texto libre ya es la heredada (paso sin opciones).
#   4. Los pasos «dia» y «franja» se funden en un único paso «cuándo». Las TRES primeras opciones son
#      ventanas en las que la clínica ABRE de verdad (§3); la cuarta, «Lo antes posible», no es una
#      ventana horaria sino la opción sin preferencia, y no se presenta como si lo fuera. Motivo: con
#      el horario real, la combinación heredada «Este fin de semana» + «Por la tarde» describe un
#      momento en que la clínica está cerrada (los sábados cierran a las 14:00 y los domingos no
#      abren). Es el mismo defecto de producto que la Decisión 5 corrige en la rama de urgencia:
#      ofrecer al visitante algo que no existe. Se elimina en origen en vez de documentarse.
#   5. CORRECCIÓN CONFIRMADA (Decisión 5). El heredado @s9 —«Elegir "Es una urgencia" no altera las
#      preguntas posteriores del guion»— queda DEROGADO. Elegir urgencia corta el guion de inmediato
#      y deriva al teléfono de urgencias fuera de horario: ya no se pregunta el animal, ni el cuándo,
#      ni el nombre, y no se genera resumen (@s14, @s15, @s16).
#   6. Desaparece el botón «Enviar la solicitud por WhatsApp» (heredado @s7) y el botón «WhatsApp»
#      de la sección (heredado @s11). Motivo: el cliente NO publica canal de mensajería (§9) y
#      features/datos_negocio.feature deja escrito que, mientras no lo confirme, NINGUNA sección
#      muestra un botón de mensajería. El canal humano pasa a ser la LLAMADA a los teléfonos
#      verificados, y el resumen se deja a la vista para que el visitante lo dicte por teléfono
#      (@s12). Ver PENDIENTE.
#   7. Desaparecen las tres «ventajas» heredadas —«Confirmamos la hora exacta en menos de 2 horas»,
#      «Recordatorio por WhatsApp la víspera de la cita», «Cambios y cancelaciones sin coste hasta
#      6 h antes»— y también la promesa «en menos de 2 horas» del mensaje resumen (heredado @s6).
#      Son compromisos de servicio que el cliente no publica en ninguna parte: afirmarlos sobre un
#      negocio real es inventar. En su lugar se muestra el horario real (@s19), que sí está
#      verificado y responde a la misma pregunta del visitante: cuándo me pueden atender.
#   8. Desaparece el indicador «en línea» de la cabecera del widget: afirma una presencia humana en
#      tiempo real que no existe, y contradice al propio aviso de que nada se envía a ningún
#      servidor (@s17).
#
#   AÑADIDOS QUE IMPONE EL CONTRATO DE ESTE REPOSITORIO (no son adorno):
#   9. Cada mensaje del historial declara su autor en el propio texto («Asistente:» / «Tú:»). El
#      prototipo distinguía al hablante SOLO por color de burbuja y alineación: aquí los tests corren
#      con los CSS Modules desactivados y está prohibido aseverar sobre clases, así que un contrato
#      basado en el color sería inimplementable; además, distinguir al hablante solo por color
#      incumple WCAG 1.4.1 (@s20).
#  10. Se fijan nombres accesibles estables para el grupo del chat, el grupo de respuestas rápidas,
#      el campo de texto y el botón de enviar, y un `role="log"` con `aria-live="polite"` para el
#      historial. Es la única forma de que los escenarios sean localizables sin clases CSS.
#  11. El botón de enviar comunica su estado con `aria-disabled`, nunca con una clase (Invariante 5).
#  12. Casos límite nuevos, exigidos al re-destilar: respuesta hecha solo de espacios (@s7), Intro
#      con el campo en blanco (@s9) y recorte de espacios sobrantes al registrar la respuesta (@s10).
#  13. Se añaden @s21, @s22 y @s23: ejercitan la guarda de envío (incluido el recorte de espacios),
#      la composición del resumen "A · B · C" y el corte de guion en urgencia directamente contra el
#      módulo puro (*-logica.ts), sin DOM, para que el Invariante 6 tenga superficie de test que un
#      `mutation_tester` pueda de verdad matar (los @s1-@s20 solo observan el resultado en pantalla).
#
#   MAPA DEL CONTRATO HEREDADO A ESTE
#     heredado @s1 → @s1 (datos nuevos)      heredado @s7  → @s12 (reescrito: llamada, no WhatsApp)
#     heredado @s2 → @s2 (datos nuevos)      heredado @s8  → @s13
#     heredado @s3 → @s5                     heredado @s9  → DEROGADO; lo sustituyen @s14 @s15 @s16
#     heredado @s4 → @s6                     heredado @s10 → @s17
#     heredado @s5 → @s8                     heredado @s11 → @s18 y @s19 (reescritos)
#     heredado @s6 → @s11 (sin la promesa de plazo)
#
# PENDIENTE (no verificado; ningún escenario lo afirma como hecho del negocio)
#   - PENDIENTE: canal de mensajería — DOS incógnitas distintas, no una (project-spec.md Decisión 14):
#     (a) si el cliente usa WhatsApp en absoluto (no publica ningún enlace de mensajería, §9) y
#     (b) en caso afirmativo, cuál es el número correcto del canal. El 685 34 31 49 es HOY solo el
#     número de voz verificado (§2, «enlace tel: de la cabecera»); ninguna fuente lo confirma también
#     como número de WhatsApp Business, así que no se asume que sea el mismo. La Decisión 14 confirma
#     WhatsApp como canal humano de cierre para CUANDO ambas incógnitas se resuelvan; hasta entonces
#     @s12 y @s18 exigen su AUSENCIA, no la dejan a criterio del implementador. Si algún día se
#     resuelven (a) y (b), el resumen de @s12 pasa a ser el texto prellenado del enlace de mensajería
#     que features/datos_negocio.feature @s5/@s6 ya deja formateado.
#   - PENDIENTE: qué especies atiende la clínica. Por eso el paso del animal es texto libre (cambio 3).
#   - PENDIENTE: plazo de respuesta, recordatorios y política de cancelación. No publicados: por eso
#     @s19 exige que no aparezca ninguna promesa de ese tipo.
#   - PENDIENTE: que la cita se cierre efectivamente por teléfono es lo único que el cliente publica
#     (dos `tel:` en su cabecera y uno en su pie, §2); no hay ningún otro canal verificado. Si el
#     cliente abre un canal distinto, cambia el destino final del guion, no su interacción.
#   - Fuera de alcance: el detalle de cada bloque de servicio vive en `features/servicios.feature`;
#     aquí los cinco nombres solo se usan como opciones del primer paso.

Feature: Reserva de cita guiada por chat
  Como visitante que prefiere no llamar de entrada para pedir cita
  Quiero responder unas pocas preguntas guiadas y quedarme con mi solicitud resumida
  Para llamar a Galapavet sabiendo ya qué pedir, o para que me manden a urgencias si lo mío no puede esperar.

  Background:
    Given el visitante está en la sección "Reservar" de la landing

  @s1
  Scenario: El chat arranca en el primer paso con sus respuestas rápidas
    When el visitante mira el widget de reserva recién cargado
    Then existe un grupo cuyo nombre accesible es "Asistente de reserva de Galapavet"
    And dentro de él hay un elemento con rol "log" y con aria-live "polite"
    And ese historial contiene exactamente 1 mensaje, cuyo texto es "Asistente: Hola, soy el asistente de Galapavet. ¿Qué necesita tu mascota?"
    And existe un grupo cuyo nombre accesible es "Respuestas rápidas" con exactamente 6 elementos con rol "button", cuyos nombres accesibles son, en este orden: "Cirugía y anestesia", "Diagnóstico de imagen", "Medicina general", "Análisis", "Especialidades" y "Es una urgencia"
    And no existe ningún elemento con rol "textbox" dentro del widget

  @s2
  Scenario: Elegir una respuesta rápida registra la respuesta y avanza al paso siguiente
    Given el chat está en el primer paso, el del servicio
    When el visitante pulsa el botón "Medicina general"
    Then el historial contiene exactamente 3 mensajes
    And el segundo mensaje del historial es exactamente "Tú: Medicina general"
    And el tercer mensaje del historial es exactamente "Asistente: Entendido. ¿Con qué animal vienes?"
    And existe un elemento con rol "textbox" cuyo nombre accesible es "Tu respuesta"
    And ya no existe ningún grupo cuyo nombre accesible sea "Respuestas rápidas"

  @s3
  Scenario: El chat no ofrece ningún servicio que el cliente no publica
    Given el chat está en el primer paso, el del servicio
    When se recorre todo el texto visible del widget de reserva
    Then ese texto recorrido no está vacío y contiene "Cirugía y anestesia"
    And los nombres accesibles de las cinco primeras respuestas rápidas coinciden, palabra por palabra, con los cinco bloques que el cliente publica: "Cirugía y anestesia", "Diagnóstico de imagen", "Medicina general", "Análisis" y "Especialidades"
    And el texto no contiene "Peluquería"
    And el texto no contiene "Animales exóticos"
    And el texto no contiene "Nutrición"
    And el texto no contiene "24 h" ni "24h"

  @s4
  Scenario: El paso del cuándo solo ofrece momentos en los que la clínica abre
    Given el visitante ha respondido "Medicina general" al servicio y "Una gata de 4 años" al animal
    When el visitante mira las respuestas rápidas del paso del cuándo
    Then el último mensaje del historial es exactamente "Asistente: Perfecto. ¿Cuándo te viene mejor?"
    And hay exactamente 4 elementos con rol "button" en el grupo "Respuestas rápidas", cuyos nombres accesibles son, en este orden: "Entre semana por la mañana", "Entre semana por la tarde", "El sábado por la mañana" y "Lo antes posible"
    And ninguno de esos nombres accesibles contiene "domingo"
    And ninguno de esos nombres accesibles ofrece el sábado por la tarde, franja en la que el horario publicado tiene la clínica cerrada

  @s5
  Scenario: El último paso no ofrece botones, sino un campo de texto libre
    Given el visitante ha respondido "Medicina general", "Una gata de 4 años" y "Entre semana por la mañana" a los tres primeros pasos
    When el visitante mira el pie del widget de chat
    Then el último mensaje del historial es exactamente "Asistente: Ya casi está. ¿Cómo os llamáis tu mascota y tú?"
    And no existe ningún grupo cuyo nombre accesible sea "Respuestas rápidas"
    And existe un elemento con rol "textbox" cuyo nombre accesible es "Tu respuesta" y cuyo marcador es "Ej. Nala y Ana Martín"
    And existe un elemento con rol "button" cuyo nombre accesible es "Enviar respuesta"

  @s6
  Scenario: No se puede enviar el campo de texto vacío
    Given el chat está en el último paso, el del nombre, con el campo de texto vacío y el historial con 7 mensajes
    When el visitante pulsa el botón "Enviar respuesta"
    Then el botón "Enviar respuesta" expone aria-disabled con el valor "true"
    And el historial sigue conteniendo exactamente 7 mensajes
    And el último mensaje del historial sigue siendo exactamente "Asistente: Ya casi está. ¿Cómo os llamáis tu mascota y tú?"
    And en el widget no aparece el texto "Anotado:"

  @s7
  Scenario: Una respuesta hecha solo de espacios en blanco tampoco avanza el guion
    Given el chat está en el paso del animal y el visitante ha escrito "   " en el campo de texto
    When el visitante pulsa el botón "Enviar respuesta"
    Then el botón "Enviar respuesta" expone aria-disabled con el valor "true"
    And no se añade ningún mensaje al historial
    And el último mensaje del historial sigue siendo exactamente "Asistente: Entendido. ¿Con qué animal vienes?"

  @s8
  Scenario: Pulsar Intro en el campo de texto equivale a pulsar enviar
    Given el chat está en el último paso, el del nombre, y el visitante ha escrito "Nala y Ana Martín" en el campo de texto
    When el visitante pulsa la tecla Intro dentro del campo de texto
    Then el historial contiene un mensaje cuyo texto es exactamente "Tú: Nala y Ana Martín"
    And el último mensaje del historial empieza por "Asistente: Gracias, Nala y Ana Martín. Anotado:"

  @s9
  Scenario: Pulsar Intro con el campo en blanco no hace nada
    Given el chat está en el último paso, el del nombre, con el campo de texto vacío y el historial con 7 mensajes
    When el visitante pulsa la tecla Intro dentro del campo de texto
    Then el historial sigue conteniendo exactamente 7 mensajes
    And el campo de texto sigue vacío
    And el chat sigue en el paso del nombre, con su campo de texto y sin respuestas rápidas

  @s10
  Scenario: La respuesta escrita se registra sin los espacios sobrantes
    Given el chat está en el último paso, el del nombre, y el visitante ha escrito "  Nala y Ana Martín  " en el campo de texto
    When el visitante pulsa el botón "Enviar respuesta"
    Then el mensaje añadido al historial es exactamente "Tú: Nala y Ana Martín", sin espacios al principio ni al final
    And el mensaje final del asistente empieza por "Asistente: Gracias, Nala y Ana Martín."

  @s11
  Scenario: Completar el guion genera el resumen final con las respuestas dadas
    Given el visitante ha respondido "Medicina general", "Una gata de 4 años" y "Entre semana por la mañana" a los tres primeros pasos
    When el visitante envía "Nala y Ana Martín" como respuesta al último paso
    Then el último mensaje del historial es exactamente "Asistente: Gracias, Nala y Ana Martín. Anotado: Medicina general · Una gata de 4 años · Entre semana por la mañana. Para cerrar la cita, llámanos al 91 082 92 67 y dinos estos datos."
    And ese mensaje no contiene ningún teléfono distinto de "91 082 92 67"
    And ese mensaje no contiene "WhatsApp"
    And ese mensaje no contiene "2 horas" ni ninguna otra promesa de plazo de respuesta

  @s12
  Scenario: Al terminar el guion se ofrece la llamada con el resumen a la vista
    Given el chat ha llegado al estado final tras responder "Medicina general", "Una gata de 4 años", "Entre semana por la mañana" y "Nala y Ana Martín"
    When el visitante mira el pie del widget de chat
    Then existe un grupo cuyo nombre accesible es "Resumen de tu solicitud" con exactamente estas 4 líneas, en este orden: "Servicio: Medicina general", "Animal: Una gata de 4 años", "Cuándo: Entre semana por la mañana" y "Nombre: Nala y Ana Martín"
    And existe un elemento con rol "link" cuyo nombre accesible es "Llamar para cerrar la cita · 91 082 92 67" y cuyo destino es exactamente "tel:+34910829267"
    And existe un elemento con rol "button" cuyo nombre accesible es "Pedir otra cita"
    And dentro del widget no existe ningún elemento con rol "link" cuyo destino contenga "wa.me" ni "whatsapp"
    And dentro del widget no existe ningún elemento con rol "textbox" ni ningún grupo "Respuestas rápidas"

  @s13
  Scenario: "Pedir otra cita" reinicia el chat desde el primer paso
    Given el chat está en el estado final con las cuatro respuestas del visitante registradas
    When el visitante pulsa el botón "Pedir otra cita"
    Then el historial vuelve a contener exactamente 1 mensaje, cuyo texto es "Asistente: Hola, soy el asistente de Galapavet. ¿Qué necesita tu mascota?"
    And vuelven a verse los 6 botones del grupo "Respuestas rápidas" del primer paso
    And ya no existe ningún grupo cuyo nombre accesible sea "Resumen de tu solicitud"
    And dentro del widget ya no existe ningún elemento con rol "link"

  @s14
  Scenario: Elegir "Es una urgencia" corta el guion y deriva al teléfono de urgencias
    Given el chat está en el primer paso, el del servicio
    When el visitante pulsa el botón "Es una urgencia"
    Then el segundo mensaje del historial es exactamente "Tú: Es una urgencia"
    And el tercer mensaje del historial es exactamente "Asistente: Si es una urgencia, no esperes: llama al 91 851 13 93, el teléfono de urgencias fuera de horario. Dentro del horario de clínica, llama al 91 082 92 67."
    And existe un elemento con rol "link" cuyo nombre accesible es "Llamar a urgencias fuera de horario · 91 851 13 93" y cuyo destino es exactamente "tel:+34918511393"
    And existe también un elemento con rol "link" cuyo nombre accesible es "Llamar a la clínica · 91 082 92 67" y cuyo destino es exactamente "tel:+34910829267"
    And en todo el widget no aparece "24 h", ni "24h", ni "todos los días"

  @s15
  Scenario: Tras derivar a urgencias el chat ya no pregunta el animal, el cuándo ni el nombre
    Given el visitante ha pulsado "Es una urgencia" en el primer paso
    When se repasa el widget entero
    Then el historial contiene exactamente 3 mensajes
    And el historial no contiene "¿Con qué animal vienes?"
    And el historial no contiene "¿Cuándo te viene mejor?"
    And el historial no contiene "¿Cómo os llamáis"
    And no existe ningún grupo cuyo nombre accesible sea "Respuestas rápidas"
    And no existe ningún elemento con rol "textbox" dentro del widget
    And no existe ningún grupo cuyo nombre accesible sea "Resumen de tu solicitud"

  @s16
  Scenario: "Empezar de nuevo" desde la derivación de urgencias devuelve al primer paso
    Given el chat ha derivado a urgencias tras pulsar "Es una urgencia"
    When el visitante pulsa el botón "Empezar de nuevo"
    Then el historial vuelve a contener exactamente 1 mensaje, cuyo texto es "Asistente: Hola, soy el asistente de Galapavet. ¿Qué necesita tu mascota?"
    And vuelven a verse los 6 botones del grupo "Respuestas rápidas" del primer paso
    And dentro del widget ya no existe ningún elemento con rol "link" cuyo destino sea "tel:+34918511393"

  @s17
  Scenario: El aviso de que nada se envía a ningún servidor se ve en todos los estados del chat
    Given el chat está en el primer paso, el del servicio
    When el visitante mira el pie del widget de chat
    Then se ve el texto "Demostración: esta solicitud no se envía a ningún servidor. La cita se cierra por teléfono."
    And ese mismo aviso, palabra por palabra, se ve también cuando el chat ha llegado al estado final y cuando ha derivado a urgencias
    And el widget no muestra ningún indicador de disponibilidad en directo: no aparece el texto "en línea"

  @s18
  Scenario: El visitante puede saltarse el chat y llamar directamente
    When el visitante mira la columna de texto de la sección "Reservar"
    Then existe un elemento con rol "link" cuyo nombre accesible es "Llamar a la clínica · 91 082 92 67" y cuyo destino es exactamente "tel:+34910829267"
    And existe un elemento con rol "link" cuyo nombre accesible es "Llamar al móvil · 685 34 31 49" y cuyo destino es exactamente "tel:+34685343149"
    And en toda la sección no existe ningún elemento con rol "link" cuyo destino contenga "wa.me" ni "whatsapp"
    And en toda la sección ningún nombre accesible contiene "WhatsApp"
    And en toda la sección no existe ningún elemento con rol "link" cuyo destino empiece por "mailto:"

  @s19
  Scenario: La sección informa del horario real y no promete ningún plazo de respuesta
    When el visitante mira la columna de texto de la sección "Reservar"
    Then se ven exactamente 3 tramos de horario, en este orden: "Lunes a viernes: 11:00 a 14:00 y 16:30 a 20:00", "Sábados: 11:00 a 14:00" y "Domingos: Cerrado"
    And el texto de la sección no contiene "en menos de 2 horas"
    And el texto de la sección no contiene "Recordatorio"
    And el texto de la sección no contiene "sin coste"
    And el texto de la sección no contiene "24 h" ni "24h"

  @s20
  Scenario: Cada mensaje del historial dice quién lo dice, sin depender del color
    Given el visitante ha respondido "Medicina general" al primer paso
    When se recorre el historial de mensajes
    Then cada mensaje del historial empieza por "Asistente:" o por "Tú:"
    And hay exactamente 2 mensajes que empiezan por "Asistente:" y exactamente 1 que empieza por "Tú:"

  @s21
  Scenario: La lógica pura decide si una respuesta puede registrarse, sin tocar el DOM
    Given las respuestas candidatas "Nala y Ana Martín", "   " y "  Nala y Ana Martín  "
    When se pide a la lógica del chat si cada una puede registrarse como respuesta válida
    Then la primera y la tercera se aceptan, y la segunda se rechaza por estar hecha solo de espacios
    And el valor que la lógica registra para la tercera es exactamente "Nala y Ana Martín", sin espacios al principio ni al final

  @s22
  Scenario: La lógica pura compone el resumen final a partir de las tres primeras respuestas, sin tocar el DOM
    Given las respuestas "Medicina general", "Una gata de 4 años" y "Entre semana por la mañana" a los tres primeros pasos
    When se pide a la lógica del chat que componga el resumen a partir de esas tres respuestas
    Then el resumen devuelto es exactamente "Medicina general · Una gata de 4 años · Entre semana por la mañana"

  @s23
  Scenario: La lógica pura corta el guion al elegir "Es una urgencia", sin tocar el DOM
    Given el paso actual es el del servicio y la respuesta elegida es "Es una urgencia"
    When se pide a la lógica del chat cuál es el paso siguiente
    Then el paso siguiente devuelto es el estado de derivación a urgencias, no el paso del animal
    And al pedir a la lógica del chat el paso siguiente desde el estado de derivación a urgencias, no devuelve ni el paso del animal, ni el del cuándo, ni el del nombre
