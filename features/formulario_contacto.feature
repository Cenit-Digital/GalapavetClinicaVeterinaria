# =============================================================================
# FUENTE DEL COMPORTAMIENTO
# =============================================================================
# INTERACCIÓN (aprobada, se respeta): prototipo de Claude Design
# "Veterinaria La Sierra.dc.html", sección id="contacto" (líneas 346-390) y los
# manejadores enviarContacto / reiniciarContacto de renderVals (líneas 786-788).
# Del prototipo se hereda: un formulario "Escríbenos" con cinco campos y una
# casilla obligatoria, botón "Enviar mensaje", cambio a un panel de confirmación
# que sustituye al formulario, y un control "Enviar otro mensaje" que devuelve al
# formulario. El envío solo hace preventDefault(): no hay servidor, ni petición,
# ni almacenamiento.
#
# DATOS: docs/datos-galapavet.md (única fuente admitida) — §2 NAP, §9 datos que el
# cliente NO publica, §11 enlaces legales reales.
# DECISIONES: project-spec.md → Decisión 2 (nada de "urgencias 24 h"),
# Decisión 6 (el formulario no envía nada y lo dice), Decisión 7 (enlaces legales
# reales), Invariantes 1, 2 y 5.
# CRITERIOS: feature_list.json → feature 11 "formulario_contacto".
#
# =============================================================================
# QUÉ CAMBIA RESPECTO AL CONTRATO HEREDADO (docs/contrato-heredado/) Y POR QUÉ
# =============================================================================
# 1. AVISO EXPLÍCITO DE QUE NO SE ENVÍA NADA — NUEVO (@s3).
#    El contrato heredado dejó la incoherencia anotada como "A CONFIRMAR CON
#    PABLO": el chat de reserva sí avisa de que nada se envía y el formulario no,
#    teniendo el mismo comportamiento. CONFIRMADO por el cliente el 17/08/2026
#    (Decisión 6, opción (a)): se añade el aviso, simétrico al del chat. El aviso
#    es además la descripción accesible del botón de envío, para que quien navega
#    con lector de pantalla lo oiga ANTES de pulsar, no después.
#
# 2. TELÉFONO DE LA CONFIRMACIÓN — DATO SUSTITUIDO (@s7, @s8).
#    El heredado (@s4) exigía literalmente "Si es una urgencia, llama al
#    640 22 11 90". Ese número es FALSO para este cliente (datos §7) y el rótulo
#    "urgencias 24 h" también (Galapavet cierra los domingos). Se sustituye por el
#    dato real con su rótulo real: "Urgencias fuera de horario" · 91 851 13 93
#    (datos §2). @s8 es la guarda que impide que el reclamo 24 h vuelva a entrar.
#
# 3. TEXTO DE LA CONFIRMACIÓN — REESCRITO (@s7, @s8).
#    Se eliminan "Mensaje recibido" y "Te responderemos hoy mismo en horario de
#    clínica". Ambas son falsas por partida doble: nadie recibe nada (no hay
#    servidor ni destinatario) y el cliente no publica ningún plazo de respuesta
#    (datos §9). La confirmación pasa a decir lo único cierto —el formulario está
#    completo y el mensaje no ha salido de la pantalla— y a ofrecer los canales
#    reales de contacto.
#
# 4. "ENVIAR OTRO MENSAJE" LIMPIA LOS CAMPOS — AMBIGÜEDAD RESUELTA (@s13).
#    El contrato heredado declaró expresamente NO VERIFICADO si los campos se
#    conservan o se limpian, y por eso su @s5 no afirmaba nada al respecto. Un
#    contrato ambiguo es un bug del contrato, así que aquí se decide: SE LIMPIAN
#    (todos los campos vacíos y la casilla desmarcada). Tres motivos:
#      (a) Coherencia con lo que acaba de leer el visitante: si se le ha dicho que
#          su mensaje no ha salido, dejarle el texto intacto en pantalla sugiere
#          que sigue "en curso" y le invita a volver a pulsar creyendo que esta
#          vez sí sale. Limpiar cierra el ciclo sin ambigüedad.
#      (b) Simetría con el gemelo de esta misma interacción: reiniciarChat, en el
#          chat de reserva, devuelve el flujo a su estado inicial completo (paso 0,
#          respuestas y borrador vacíos). El control equivalente del formulario
#          hace lo mismo.
#      (c) Testabilidad: "todos los campos vacíos" es un estado único y observable;
#          "se conservan" obligaría a definir cuáles y con qué valor, y eso es
#          justo la ambigüedad que estamos eliminando.
#
# 5. ETIQUETAS ASOCIADAS PROGRAMÁTICAMENTE — NUEVO (@s2).
#    El heredado (@s1) solo enumeraba los rótulos visibles. Aquí se exige que cada
#    control se pueda localizar POR SU ETIQUETA, es decir, que tenga ese nombre
#    accesible. Es el criterio 1 de aceptación de la feature 11 y lo que hace
#    utilizable el formulario con lector de pantalla.
#
# 6. CASOS LÍMITE NUEVOS: email con formato inválido (@s11), casilla del aviso
#    legal sin marcar (@s12) y nombre relleno solo con espacios (@s10). El
#    heredado solo cubría el campo vacío. Además, un intento de envío bloqueado
#    marca el control culpable con aria-invalid="true" (Invariante 5: el estado
#    condicional vive en un atributo ARIA consultable, no en una clase CSS): la
#    burbuja nativa del navegador no es observable ni anunciable.
#
# 7. OPCIÓN "Campañas y precios" → "Campañas" (@s4). Galapavet no publica ni un
#    solo precio (datos §6); ofrecer "y precios" da a entender que existe una lista
#    de precios que consultar. El resto de las cinco opciones se conserva.
#
# 8. CASILLA: "política de privacidad" → "aviso legal" (@s2, @s5, @s12).
#    Galapavet publica aviso-legal, politica-de-cookies y personalizar-cookies
#    (datos §11); NO publica una política de privacidad. Enlazar a una página que
#    no existe sería inventar un dato. Se apunta al aviso legal real.
#
# 9. SE PROHÍBE CUALQUIER DIRECCIÓN DE CORREO (@s14). El cliente no publica email
#    (datos §9) y una primera extracción automática llegó a devolver un
#    info@galapavet.com que NO está en su web. Guarda explícita para que no se
#    cuele por la puerta de atrás en el bloque del formulario.
#
# 10. "el navegador debe impedir el envío" (heredado @s2) → se afirma el resultado
#     observable (no aparece la confirmación, el formulario sigue en pantalla, el
#     campo queda marcado inválido). Cómo se consiga —validación nativa, evento
#     invalid, validación propia— es decisión del tdd_craftsman, no del contrato.
#
# =============================================================================
# PENDIENTE
# =============================================================================
# - PENDIENTE: destinatario real del formulario. El cliente no publica email ni
#   redes (datos §9) y no ha elegido proveedor de envío. Mientras no lo haga, el
#   aviso de @s3 y la confirmación de @s7 SON el contrato. El día que haya
#   destinatario, @s3, @s7 y @s8 se rehacen antes de tocar código.
# - PENDIENTE: confirmar con el cliente que el aviso legal cubre el consentimiento
#   de la casilla, o que publique una política de privacidad propia (ver cambio 8).
# - PENDIENTE: no está verificado ningún plazo de respuesta ("mismo día",
#   "24 horas"…). Hasta que el cliente lo confirme, ningún texto de esta sección
#   promete plazos (@s8).

Feature: Formulario de contacto
  Como visitante que prefiere escribir antes que llamar
  Quiero rellenar mis datos y mi consulta sabiendo exactamente qué pasa al pulsar enviar
  Para no quedarme esperando una respuesta que nadie ha recibido

  Background:
    Given el visitante está en la sección de contacto de la landing

  @s1
  Scenario: El formulario se muestra por defecto y la confirmación no está presente
    When el visitante mira el bloque del formulario
    Then existe un formulario cuyo nombre accesible es "Escríbenos"
    And dentro del formulario hay un botón cuyo nombre accesible es "Enviar mensaje"
    And no existe ningún encabezado cuyo nombre accesible sea "Formulario completado"

  @s2
  Scenario: Cada campo se localiza por su etiqueta
    When el visitante mira el formulario "Escríbenos"
    Then existe un cuadro de texto cuyo nombre accesible es "Tu nombre"
    And existe un cuadro de texto cuyo nombre accesible es "Teléfono"
    And existe un cuadro de texto cuyo nombre accesible es "Email"
    And existe un desplegable cuyo nombre accesible es "Motivo"
    And existe un área de texto multilínea cuyo nombre accesible es "Cuéntanos"
    And existe una casilla de verificación cuyo nombre accesible contiene "acepto el aviso legal"
    And existe un enlace cuyo nombre accesible es "Aviso legal" y cuyo destino es "https://galapavet.com/aviso-legal"

  @s3
  Scenario: El formulario avisa de que no envía nada a ningún servidor
    When el visitante mira el formulario "Escríbenos"
    Then se muestra el texto "Esta maqueta no envía tu mensaje a ningún servidor"
    And la descripción accesible del botón "Enviar mensaje" contiene ese mismo texto

  @s4
  Scenario: El desplegable Motivo ofrece exactamente cinco opciones
    When el visitante mira el desplegable "Motivo"
    Then sus opciones son exactamente "Pedir cita", "Consulta sobre un tratamiento", "Campañas", "Historial y documentación" y "Otro"

  @s5
  Scenario: Solo el nombre, el teléfono, el email y la casilla se anuncian como obligatorios
    When el visitante mira el formulario "Escríbenos"
    Then los controles "Tu nombre", "Teléfono", "Email" y la casilla del aviso legal se anuncian como obligatorios
    And los controles "Motivo" y "Cuéntanos" no se anuncian como obligatorios

  @s6
  Scenario: Se puede enviar dejando vacíos los campos no obligatorios
    Given el visitante ha escrito "Ana Martín" en "Tu nombre", "600000000" en "Teléfono" y "ana@correo.es" en "Email"
    And ha marcado la casilla del aviso legal
    And ha dejado "Cuéntanos" vacío y "Motivo" en su opción inicial
    When el visitante pulsa el botón "Enviar mensaje"
    Then aparece un encabezado cuyo nombre accesible es "Formulario completado"
    And ya no existe ningún formulario cuyo nombre accesible sea "Escríbenos"

  @s7
  Scenario: La confirmación declara que nada se ha enviado y ofrece los canales reales
    Given el visitante ha rellenado todos los campos obligatorios y ha marcado la casilla del aviso legal
    When el visitante pulsa el botón "Enviar mensaje"
    Then el bloque de confirmación tiene rol de estado, para que se anuncie sin mover el foco
    And contiene el texto "Tu mensaje no se ha enviado a ningún servidor"
    And contiene un enlace cuyo nombre accesible es "91 082 92 67" y cuyo destino es "tel:+34910829267"
    And contiene el rótulo "Urgencias fuera de horario" acompañado de un enlace cuyo nombre accesible es "91 851 13 93" y cuyo destino es "tel:+34918511393"
    And contiene un botón cuyo nombre accesible es "Enviar otro mensaje"

  @s8
  Scenario: La confirmación no promete recepción, ni plazo de respuesta, ni urgencias 24 h
    Given el visitante ha rellenado todos los campos obligatorios y ha marcado la casilla del aviso legal
    When el visitante pulsa el botón "Enviar mensaje"
    Then el texto del bloque de confirmación no contiene "24 h"
    And no contiene "Mensaje recibido"
    And no contiene "hoy mismo"
    And no contiene "Te responderemos"
    And los únicos números de teléfono que aparecen en él son "91 082 92 67" y "91 851 13 93"

  @s9
  Scenario: Enviar con el nombre vacío no completa el formulario
    Given el visitante ha rellenado "Teléfono" y "Email" y ha marcado la casilla del aviso legal
    And ha dejado "Tu nombre" vacío
    When el visitante pulsa el botón "Enviar mensaje"
    Then no aparece ningún encabezado cuyo nombre accesible sea "Formulario completado"
    And el formulario "Escríbenos" sigue mostrándose
    And el control "Tu nombre" queda marcado como inválido

  @s10
  Scenario: Un nombre formado solo por espacios no completa el formulario
    Given el visitante ha rellenado "Teléfono" y "Email" y ha marcado la casilla del aviso legal
    And ha escrito "   " en "Tu nombre"
    When el visitante pulsa el botón "Enviar mensaje"
    Then no aparece ningún encabezado cuyo nombre accesible sea "Formulario completado"
    And el control "Tu nombre" queda marcado como inválido

  @s11
  Scenario: Un email con formato inválido no completa el formulario
    Given el visitante ha rellenado "Tu nombre" y "Teléfono" y ha marcado la casilla del aviso legal
    And ha escrito "ana@" en "Email"
    When el visitante pulsa el botón "Enviar mensaje"
    Then no aparece ningún encabezado cuyo nombre accesible sea "Formulario completado"
    And el control "Email" queda marcado como inválido
    And los controles "Tu nombre" y "Teléfono" no quedan marcados como inválidos

  @s12
  Scenario: Enviar sin marcar la casilla del aviso legal no completa el formulario
    Given el visitante ha rellenado "Tu nombre", "Teléfono" y "Email"
    And no ha marcado la casilla del aviso legal
    When el visitante pulsa el botón "Enviar mensaje"
    Then no aparece ningún encabezado cuyo nombre accesible sea "Formulario completado"
    And la casilla del aviso legal queda marcada como inválida

  @s13
  Scenario: "Enviar otro mensaje" devuelve un formulario limpio
    Given el visitante ha enviado el formulario con "Ana Martín" en "Tu nombre", "600000000" en "Teléfono", "ana@correo.es" en "Email" y "Mi perra cojea" en "Cuéntanos"
    And se muestra el encabezado "Formulario completado"
    When el visitante pulsa el botón "Enviar otro mensaje"
    Then vuelve a mostrarse el formulario "Escríbenos"
    And los controles "Tu nombre", "Teléfono", "Email" y "Cuéntanos" están vacíos
    And la casilla del aviso legal está desmarcada
    And ya no existe ningún encabezado cuyo nombre accesible sea "Formulario completado"

  @s14
  Scenario: El bloque del formulario no publica ninguna dirección de correo
    When el visitante recorre el bloque del formulario y su confirmación
    Then no existe ningún enlace cuyo destino empiece por "mailto:"
    And no aparece ningún texto que contenga una arroba entre dos palabras, salvo lo que el propio visitante haya escrito en "Email"
