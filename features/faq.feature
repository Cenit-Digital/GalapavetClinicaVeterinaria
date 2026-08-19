# ---------------------------------------------------------------------------
# FUENTE DEL COMPORTAMIENTO
# ---------------------------------------------------------------------------
# Interacción heredada del prototipo de Claude Design "Veterinaria La Sierra.dc.html",
# sección id="faq" (~líneas 424-442): un acordeón donde cada pregunta es un control
# pulsable con la pregunta como rótulo y un indicador decorativo "+", todas las
# preguntas colapsadas al cargar, y comportamiento EXCLUYENTE (en el prototipo, vía
# el atributo name compartido de <details>: abrir una cierra la que estuviera abierta).
# Esa interacción está aprobada y se conserva íntegra.
#
# Decisiones aplicadas: project-spec.md Decisión 1 (dos clases de contenido) y
# Decisión 2 (se elimina todo el reclamo «Urgencias 24 h»).
# Datos: docs/datos-galapavet.md §2 (teléfonos), §3 (horario), §5 (servicios).
#
# ---------------------------------------------------------------------------
# QUÉ CAMBIA RESPECTO AL CONTRATO HEREDADO (docs/contrato-heredado/faq.feature)
# ---------------------------------------------------------------------------
# 1. Se ELIMINA el escenario heredado @s4 («¿Tenéis planes de salud o financiación?»)
#    y su pregunta del catálogo. Afirmaba un plan anual en doce cuotas y pago aplazado
#    sin intereses desde 400 €: son condiciones COMERCIALES inventadas sobre un negocio
#    real. Galapavet no publica ni un precio ni un plan (datos-galapavet.md §6 y §9).
# 2. Se REESCRIBE la pregunta de urgencias. El contrato heredado preguntaba «¿Cómo
#    funcionan las urgencias 24 h?» y respondía con el teléfono inventado 640 22 11 90
#    y un «recargo de urgencia» no publicado. Galapavet cierra los domingos y rotula
#    literalmente «Urgencias fuera de horario. Tlf: 91 851 13 93»: la pregunta pasa a
#    ser qué hacer fuera del horario, con ese teléfono real y sin ninguna promesa de
#    disponibilidad permanente ni de tarifa.
# 3. Las 6 preguntas heredadas (todas con datos inventados: calendario impreso, aviso
#    por WhatsApp, plan de salud escrito, consulta de exóticos de la Dra. Olmo los lunes
#    y miércoles) se sustituyen por 5: cuatro respondibles con hechos VERIFICADOS
#    (horario, cómo pedir cita, servicios publicados, urgencias fuera de horario) y una
#    DIVULGATIVA general que no afirma nada específico sobre Galapavet. @s6 y @s10 fijan
#    esa frontera de forma ejecutable.
# 4. Se AÑADE el caso límite de cerrar la pregunta que ya estaba abierta (@s8), que el
#    contrato heredado no cubría, más los caminos de error de catálogo vacío (@s11) y
#    entrada corrupta (@s12).
# 5. Los Then se afirman sobre ROL accesible, NOMBRE accesible y ATRIBUTOS ARIA. El
#    contrato heredado hablaba de «colapsada» y «expandida» sin anclarlo a nada
#    consultable; aquí el estado vive en aria-expanded (invariante 5 del project-spec)
#    y el indicador "+" queda como adorno sin valor semántico.
#
# ---------------------------------------------------------------------------
# PENDIENTE
# ---------------------------------------------------------------------------
# - PENDIENTE: canal de cita distinto del teléfono. El cliente no publica email, ni
#   WhatsApp, ni reserva online verificables (datos-galapavet.md §9), así que la
#   respuesta de «¿Cómo pido cita?» solo puede ofrecer los dos teléfonos verificados.
#   Si el cliente confirma otro canal, se amplía esa respuesta.
# - PENDIENTE: el texto exacto de la respuesta divulgativa (@s6) debe revisarlo un
#   veterinario del cliente antes de publicar. Este contrato solo fija que no puede
#   afirmar nada concreto sobre Galapavet; no valida su contenido clínico.
# - PENDIENTE: número de preguntas. Se fija en 5 por lo que hoy es verificable; si el
#   cliente aporta más hechos, se añaden preguntas y se actualiza el recuento de @s1.
# ---------------------------------------------------------------------------

Feature: Preguntas frecuentes
  Como visitante con dudas antes de pedir cita o de la primera visita
  Quiero consultar las preguntas más habituales sin tener que llamar
  Para resolver por mi cuenta lo que ya está publicado, cuando me venga bien

  Background:
    Given el visitante está en la sección de preguntas frecuentes de la landing

  @s1
  Scenario: Las cinco preguntas se muestran colapsadas por defecto
    When el visitante mira la sección de preguntas frecuentes
    Then la sección tiene un encabezado con nombre accesible "Preguntas frecuentes"
    And hay exactamente 5 controles con rol de botón dentro de la sección
    And sus nombres accesibles son, en este orden:
      | ¿Qué horario tiene la clínica?                                        |
      | ¿Cómo pido cita?                                                      |
      | ¿Qué servicios ofrecéis?                                              |
      | ¿Qué hago si mi animal necesita atención fuera del horario?           |
      | ¿Cada cuánto hay que vacunar a un perro o a un gato?                  |
    And cada uno de esos 5 controles tiene aria-expanded="false"
    And no hay ninguna región de respuesta expuesta en el árbol accesible

  @s2
  Scenario: Expandir una pregunta muestra su respuesta con el horario verificado
    Given el control "¿Qué horario tiene la clínica?" tiene aria-expanded="false"
    When el visitante pulsa el control "¿Qué horario tiene la clínica?"
    Then ese control pasa a tener aria-expanded="true"
    And su aria-controls identifica una región con nombre accesible "¿Qué horario tiene la clínica?"
    And el texto de esa región contiene "de lunes a viernes de 11:00 a 14:00 y de 16:30 a 20:00"
    And el texto de esa región contiene "sábados de 11:00 a 14:00"
    And el texto de esa región contiene "domingos cerrado"

  @s3
  Scenario: La respuesta sobre cómo pedir cita ofrece los dos teléfonos verificados
    Given el control "¿Cómo pido cita?" tiene aria-expanded="false"
    When el visitante pulsa el control "¿Cómo pido cita?"
    Then la región asociada a ese control contiene el texto "91 082 92 67"
    And esa región contiene el texto "685 34 31 49"
    And esa región contiene un enlace con rol de enlace por cada uno de esos dos números
    And esa región no menciona ningún correo electrónico ni ningún formulario de reserva online

  @s4
  Scenario: La respuesta sobre servicios enumera los cinco bloques publicados
    Given el control "¿Qué servicios ofrecéis?" tiene aria-expanded="false"
    When el visitante pulsa el control "¿Qué servicios ofrecéis?"
    Then la región asociada a ese control contiene, cada uno una vez, estos cinco textos:
      | Cirugía y anestesia   |
      | Diagnóstico de imagen |
      | Medicina general      |
      | Análisis              |
      | Especialidades        |
    And esa región no contiene ninguno de los textos "peluquería", "exóticos" ni "etología"

  @s5
  Scenario: La respuesta sobre atención fuera del horario da el teléfono real de urgencias
    Given el control "¿Qué hago si mi animal necesita atención fuera del horario?" tiene aria-expanded="false"
    When el visitante pulsa el control "¿Qué hago si mi animal necesita atención fuera del horario?"
    Then la región asociada a ese control contiene el texto "91 851 13 93"
    And esa región contiene un enlace cuyo nombre accesible incluye "91 851 13 93"
    And el texto de esa región no contiene "24 h", ni "24 horas", ni "365", ni "todos los días del año"
    And el texto de esa región no contiene "recargo"

  @s6
  Scenario: La pregunta divulgativa no afirma nada específico sobre la clínica
    Given el control "¿Cada cuánto hay que vacunar a un perro o a un gato?" tiene aria-expanded="false"
    When el visitante pulsa el control "¿Cada cuánto hay que vacunar a un perro o a un gato?"
    Then el texto de la región asociada no contiene ninguna secuencia de 9 dígitos ni ningún número de teléfono
    And ese texto no contiene el símbolo "€"
    And ese texto no contiene ninguna hora en formato "hh:mm"
    And ese texto no contiene ninguna de las palabras "incluido", "gratis", "descuento" ni "plan"
    And ese texto no contiene el nombre "Galapavet"

  @s7
  Scenario: Abrir una pregunta nueva cierra automáticamente la que estuviera abierta
    Given el control "¿Qué horario tiene la clínica?" tiene aria-expanded="true"
    When el visitante pulsa el control "¿Qué servicios ofrecéis?"
    Then el control "¿Qué servicios ofrecéis?" tiene aria-expanded="true"
    And el control "¿Qué horario tiene la clínica?" tiene aria-expanded="false"
    And hay exactamente 1 control con aria-expanded="true" en la sección
    And hay exactamente 1 región de respuesta expuesta en el árbol accesible

  @s8
  Scenario: Cerrar la pregunta que ya estaba abierta deja el acordeón sin ninguna expandida
    Given el control "¿Cómo pido cita?" tiene aria-expanded="true"
    When el visitante pulsa el control "¿Cómo pido cita?"
    Then el control "¿Cómo pido cita?" tiene aria-expanded="false"
    And hay exactamente 0 controles con aria-expanded="true" en la sección
    And no hay ninguna región de respuesta expuesta en el árbol accesible

  @s9
  Scenario: La pregunta se despliega con el teclado
    Given el foco está en el control "¿Qué servicios ofrecéis?" y ese control tiene aria-expanded="false"
    When el visitante pulsa la tecla Enter
    Then el control "¿Qué servicios ofrecéis?" tiene aria-expanded="true"
    And el foco sigue en el control "¿Qué servicios ofrecéis?"

  @s10
  Scenario: Ninguna respuesta publicada afirma precios, planes ni servicios no publicados
    Given el catálogo de preguntas frecuentes tal y como se publica
    When se revisa el texto de las cinco respuestas
    Then ninguna contiene el símbolo "€"
    And ninguna contiene las palabras "financiación", "cuotas", "sin intereses", "plan anual" ni "tarifa"
    And ninguna contiene "24 h", "24 horas" ni "urgencias 24"
    And ninguna contiene un número de teléfono distinto de "91 082 92 67", "685 34 31 49" y "91 851 13 93"
    And ninguna menciona un servicio fuera de los cinco bloques publicados por el cliente

  @s11
  Scenario: Un catálogo de preguntas vacío no renderiza la sección
    Given el catálogo de preguntas frecuentes está vacío
    When se renderiza la landing
    Then no existe ningún encabezado con nombre accesible "Preguntas frecuentes"
    And no existe ningún control de pregunta frecuente en la página
    And no se muestra ningún texto de relleno en lugar de las preguntas

  @s12
  Scenario: Una entrada con pregunta o respuesta vacía se omite del acordeón
    Given el catálogo de preguntas frecuentes tiene estas 4 entradas:
      | pregunta                                                     | respuesta                                                                               |
      | ¿Qué horario tiene la clínica?                               | de lunes a viernes de 11:00 a 14:00 y de 16:30 a 20:00                                  |
      | ¿Cómo pido cita?                                             |                                                                                          |
      |                                                               | Cirugía y anestesia, Diagnóstico de imagen, Medicina general, Análisis y Especialidades |
      | ¿Qué hago si mi animal necesita atención fuera del horario?  | 91 851 13 93                                                                            |
    When se renderiza la sección de preguntas frecuentes
    Then hay exactamente 2 controles con rol de botón dentro de la sección
    And sus nombres accesibles son, en este orden, "¿Qué horario tiene la clínica?" y "¿Qué hago si mi animal necesita atención fuera del horario?"

  @s13
  Scenario: El teléfono de urgencias de la respuesta procede de la fuente única de datos
    Given la fuente única de datos de negocio declara el teléfono de urgencias fuera de horario "91 851 13 93"
    When se cambia ese valor en la fuente única a "900 000 000" y se vuelve a renderizar la respuesta
    Then la región de "¿Qué hago si mi animal necesita atención fuera del horario?" contiene el texto "900 000 000"
    And esa región no contiene el texto "91 851 13 93"
