# FUENTE DEL COMPORTAMIENTO
#   - project-spec.md → Invariante 2 («el dato de negocio se escribe una sola vez y todas sus
#     formas derivadas se calculan de él») y Modos de error comunes («dato de negocio ausente →
#     no se renderiza el bloque»; «teléfono que no normaliza → el normalizador lanza, falla cerrado»).
#   - project-spec.md → Decisión 1 (una afirmación sobre el negocio solo se publica si está
#     verificada) y Decisión 2 (no existe «Urgencias 24 h»).
#   - feature_list.json → feature 2 `datos_negocio`, sus 4 criterios de aceptación.
#   - Patrón organizacional `dato-de-negocio-en-fuente-unica-canonica` (NailsLashStudioWeb/F-02):
#     el dato legible es la fuente, los enlaces son las derivaciones, nunca al revés.
#   - Patrón organizacional `doble-de-test-anclado-al-literal-no-al-simbolo`: por eso CADA valor
#     esperado de este contrato está escrito a mano aquí abajo y el `tdd_craftsman` debe copiarlo
#     literal al test, sin re-derivarlo de la constante de producción.
#
# DATOS: todos salen de docs/datos-galapavet.md §1 (identidad), §2 (NAP), §3 (horario)
#   y §9 (lo que NO existe).
#   Nombre comercial .......... Galapavet                     (rótulo de cabecera de galapavet.com)
#   Descriptor ................ Centro integral veterinario   (rótulo bajo el nombre en galapavet.com)
#   Localidad ................. Galapagar (Madrid)             (frase «Tú clínica veterinaria en Galapagar.»)
#   Teléfono clínica ......... 91 082 92 67   (enlace tel: de la cabecera de galapavet.com)
#   Teléfono móvil ........... 685 34 31 49   (enlace tel: de la cabecera de galapavet.com)
#   Urgencias fuera de horario 91 851 13 93   (enlace tel: del pie, rótulo literal del cliente)
#   Dirección ................ Carretera de Torrelodones, 11 · 28260 Galapagar, Madrid
#
# QUÉ CAMBIA RESPECTO AL CONTRATO HEREDADO
#   Esta feature es NUEVA: en docs/contrato-heredado/ no hay ningún `datos_negocio.feature`.
#   Precisamente ese es el problema que viene a cerrar. El prototipo «Veterinaria La Sierra»
#   NO tenía fuente única: escribía cada teléfono a mano en cada sección, texto y href por
#   separado (contrato heredado: informacion_contacto @s1/@s3, reserva_chat @s7/@s11,
#   pie_de_pagina, hero). Ese reparto es exactamente la divergencia silenciosa que el patrón
#   organizacional documenta.
#   La INTERACCIÓN heredada no se toca (esta feature no tiene interacción propia: es el módulo
#   del que beben las demás). Lo que se sustituye son los DATOS, y desaparecen por falsos:
#     +34640221190 · +34918442160 · hola@veterinarialasierra.es · «Urgencias 24 h»
#     Ctra. de la Sierra, 42 · 28792 Miraflores de la Sierra
#
# PENDIENTE (no verificado — no se afirma en ningún escenario como hecho del negocio)
#   - RESUELTO el 03/09/2026 con `fidelidad_reserva` (32), Decisión 66 (docs/datos-galapavet.md
#     §2bis): el cliente confirmó que el móvil 685 34 31 49 atiende WhatsApp. @s5, @s6 y @s12 siguen
#     fijando el FORMATO de la derivación; la reserva «ninguna sección muestra botón de mensajería
#     hasta que el cliente lo confirme» queda derogada y la sección Reservar publica el enlace wa.me.
#     Antes/después literal en progress/fidelidad/enmiendas_fidelidad_reserva.md.
#   - PENDIENTE: el host de mensajería (`wa.me` frente a `api.whatsapp.com/send`) se ancla aquí a
#     `wa.me` para que el contrato sea medible, pero debe verificarse a mano en dispositivo real
#     antes de publicar (el patrón organizacional avisa de no fijar hosts sin comprobarlos).
#   - PENDIENTE: coordenadas geográficas exactas (datos-galapavet.md §9). Por eso @s18 exige que
#     la fuente única NO declare latitud ni longitud: el mapa y el dato estructurado se centran
#     por dirección postal hasta que el cliente las facilite.
#   - PENDIENTE: email de contacto y perfiles de redes sociales (datos-galapavet.md §9). @s15 y
#     @s16 los fijan como AUSENCIA exigible, no como hueco a rellenar.
#   - Fuera de alcance deliberado: la valoración de Google (datos-galapavet.md §8) es un dato vivo
#     y no se hornea en la fuente única; su tratamiento pertenece a la feature que decida mostrarla.
#
# NOTA DE FORMA: el horario del cliente se publica como una frase por tramo («De lunes a viernes de
# 11:00 a 14:00 y de 16:30 a 20:00»). La fuente única lo guarda separado en «días» y «horas» para
# poder presentarlo en tabla; las palabras son las del cliente y no se añade ni se quita ningún
# tramo. Separar días de horas es presentación, no un cambio de dato.

Feature: Fuente única canónica de los datos del negocio
  Como responsable de que la web no publique un dato equivocado sobre Galapavet
  Quiero que cada dato del negocio se declare una sola vez y que todas sus formas se calculen de él
  Para que el texto que el visitante lee y el enlace que pulsa no puedan decir cosas distintas.

  @s1
  Scenario: El texto visible del teléfono de la clínica y su enlace de llamada salen del mismo dato
    Given la fuente única declara el teléfono de la clínica una sola vez con el valor legible "91 082 92 67"
    When se piden a la fuente única el texto visible y el enlace de llamada de ese teléfono
    Then el texto visible es exactamente "91 082 92 67"
    And el destino del enlace de llamada es exactamente "tel:+34910829267"
    And al quitar los espacios del texto visible se obtiene exactamente "910829267", que es el número nacional que lleva el destino del enlace

  @s2
  Scenario: El segundo teléfono publicado deriva su enlace del mismo modo
    Given la fuente única declara el segundo teléfono una sola vez con el valor legible "685 34 31 49"
    When se piden a la fuente única el texto visible y el enlace de llamada de ese teléfono
    Then el texto visible es exactamente "685 34 31 49"
    And el destino del enlace de llamada es exactamente "tel:+34685343149"
    And el destino del enlace no contiene ningún espacio ni ningún separador

  @s3
  Scenario: El teléfono de urgencias conserva el rótulo real del cliente y nunca anuncia 24 h
    Given la fuente única declara el teléfono de urgencias una sola vez con el valor legible "91 851 13 93"
    When se piden a la fuente única el rótulo, el texto visible y el enlace de llamada de ese teléfono
    Then el rótulo es exactamente "Urgencias fuera de horario"
    And el texto visible es exactamente "91 851 13 93"
    And el destino del enlace de llamada es exactamente "tel:+34918511393"
    And ni el rótulo ni el texto visible contienen "24 h", ni "24h", ni "todos los días"

  @s4
  Scenario: El enlace de llamada renderizado expone el número derivado y no uno escrito a mano
    Given una vista que muestra el teléfono de la clínica pidiéndoselo a la fuente única
    When esa vista se renderiza
    Then existe un elemento con rol "link" cuyo nombre accesible contiene "91 082 92 67"
    And el destino de ese elemento es exactamente "tel:+34910829267"
    And los dígitos del nombre accesible y los dígitos del destino son la misma secuencia "910829267"

  @s5
  Scenario: El enlace de mensajería deriva del mismo dato con el formato propio de ese canal
    Given la fuente única declara el teléfono móvil una sola vez con el valor legible "685 34 31 49"
    When se pide a la fuente única el enlace de mensajería de ese teléfono sin texto previo
    Then el enlace es exactamente "https://wa.me/34685343149"
    And el enlace no contiene el carácter "+"
    And el enlace no contiene ningún signo de interrogación

  @s6
  Scenario: El texto que acompaña al enlace de mensajería viaja codificado
    Given la fuente única declara el teléfono móvil una sola vez con el valor legible "685 34 31 49"
    When se pide a la fuente única el enlace de mensajería de ese teléfono con el texto "Hola, quiero pedir cita en Galapavet."
    Then el enlace es exactamente "https://wa.me/34685343149?text=Hola%2C%20quiero%20pedir%20cita%20en%20Galapavet."
    And el enlace no contiene ningún espacio literal

  @s7
  Scenario: Tres formas de escribir el mismo número producen el mismo número internacional
    Given las escrituras "91 082 92 67", "910829267" y "+34 910 82 92 67" del mismo teléfono
    When se normaliza cada una de esas tres escrituras
    Then las tres devuelven exactamente "+34910829267"
    And ninguna de las tres devuelve una cadena vacía

  @s8
  Scenario: Un teléfono con menos de nueve dígitos hace fallar al normalizador
    Given un teléfono declarado con el valor "91 082 92", que tiene ocho dígitos
    When se pide el enlace de llamada de ese teléfono
    Then la operación falla lanzando un error
    And el mensaje del error contiene el valor recibido "91 082 92"
    And no se devuelve ninguna cadena que empiece por "tel:"

  @s9
  Scenario: Un teléfono vacío hace fallar al normalizador en vez de emitir un enlace a medias
    Given un teléfono declarado con el valor ""
    When se pide el enlace de llamada de ese teléfono
    Then la operación falla lanzando un error
    And no se devuelve ninguna cadena, en particular no se devuelve "tel:+34"
    And el mensaje del error indica que el teléfono recibido está vacío

  @s10
  Scenario: Un teléfono con letras hace fallar al normalizador
    Given un teléfono declarado con el valor "91O82 92 67", donde el cuarto carácter es la letra O y no un cero
    When se pide el enlace de llamada de ese teléfono
    Then la operación falla lanzando un error
    And el mensaje del error contiene el valor recibido "91O82 92 67"
    And no se devuelve ninguna cadena que empiece por "tel:"

  @s11
  Scenario: Un teléfono con prefijo internacional distinto del español hace fallar al normalizador
    Given un teléfono declarado con el valor "+33 1 23 45 67 89"
    When se pide el enlace de llamada de ese teléfono
    Then la operación falla lanzando un error
    And no se devuelve ninguna cadena que empiece por "tel:+34"

  @s12
  Scenario: El enlace de mensajería también falla cerrado ante un teléfono que no valida
    Given un teléfono declarado con el valor "685 34 31", que tiene ocho dígitos
    When se pide el enlace de mensajería de ese teléfono con el texto "Hola"
    Then la operación falla lanzando un error
    And no se devuelve ninguna cadena que empiece por "https://wa.me/"

  @s13
  Scenario: El horario declarado es exactamente el que publica el cliente, con los domingos cerrados
    Given la fuente única declara el horario del negocio una sola vez
    When se pide a la fuente única el horario completo
    Then se obtienen exactamente 3 tramos, en este orden
    And el primero declara los días "Lunes a viernes" y las horas "11:00 a 14:00 y 16:30 a 20:00"
    And el segundo declara los días "Sábados" y las horas "11:00 a 14:00"
    And el tercero declara los días "Domingos" y las horas "Cerrado"

  @s14
  Scenario: Ningún tramo del horario anuncia 24 horas ni apertura en domingo
    Given la fuente única declara el horario del negocio una sola vez
    When se recorre el texto de todos los tramos del horario
    Then ninguno contiene "24 h", ni "24h", ni "todos los días del año"
    And el único tramo que menciona "Domingos" declara "Cerrado" y no declara ninguna hora de apertura

  @s15
  Scenario: El cliente no publica email, así que la fuente única no lo declara ni lo sustituye
    Given docs/datos-galapavet.md §9 registra que no existe ni un solo email publicado por el cliente
    When se pide a la fuente única el correo electrónico del negocio
    Then no se obtiene ningún valor
    And en toda la fuente única no aparece la cadena "info@galapavet.com"
    And en toda la fuente única no aparece ninguna cadena que contenga el carácter "@" seguido de "galapavet.com"
    And no se deriva ningún destino que empiece por "mailto:"

  @s16
  Scenario: El cliente no publica redes sociales, así que la fuente única no las inventa
    Given docs/datos-galapavet.md §9 registra que el cliente tiene una sección de redes sin ningún enlace
    When se pide a la fuente única la lista de perfiles de redes sociales del negocio
    Then la lista está vacía
    And en toda la fuente única no aparece "facebook.com", ni "instagram.com", ni "x.com", ni "twitter.com", ni "tiktok.com"

  @s17
  Scenario: La dirección se declara una vez y sus dos formas dicen lo mismo
    Given la fuente única declara la dirección del negocio una sola vez
    When se piden a la fuente única las líneas visibles de la dirección y su forma de una sola línea
    Then las líneas visibles son exactamente "Carretera de Torrelodones, 11" y "28260 Galapagar, Madrid"
    And la forma de una sola línea es exactamente "Carretera de Torrelodones, 11, 28260 Galapagar, Madrid"
    And la forma de una sola línea contiene el código postal "28260" y la localidad "Galapagar" que aparecen en las líneas visibles

  # ENMENDADO el 03/09/2026 con `fidelidad_contacto` (34), Decisión 63 (mapa estático local):
  # antes/después literal en `progress/fidelidad/enmiendas_fidelidad_contacto.md`.
  @s18
  Scenario: La fuente única declara las coordenadas del nodo público de OpenStreetMap citado en docs/datos-galapavet.md §2bis
    Given docs/datos-galapavet.md §2bis registra las coordenadas del nodo público de OpenStreetMap sobre la dirección verificada, con su licencia
    When se piden a la fuente única las coordenadas geográficas del negocio
    Then se obtiene exactamente latitud 40.5772872 y longitud -4.0004445
    And la dirección postal sigue estando disponible para describir el mapa y el dato estructurado

  @s19
  Scenario: Ningún módulo de la web escribe un teléfono a mano fuera de la fuente única
    Given todos los ficheros de código de la web, salvo los ficheros de test
    When se buscan en ellos secuencias con forma de teléfono español, con o sin prefijo "+34" y con o sin separadores
    Then la única coincidencia está en el módulo que declara la fuente única
    And no aparece en ningún fichero la cadena "640221190", ni "918442160", que son los teléfonos falsos del prototipo heredado

  @s20
  Scenario: La puerta anti-teléfono-hardcodeado falla si no inspecciona ningún fichero
    Given un conjunto vacío de ficheros de código a inspeccionar
    When se ejecuta sobre ese conjunto la búsqueda de secuencias con forma de teléfono español
    Then la puerta falla
    And el motivo del fallo declara que inspeccionó 0 ficheros
    And la puerta no informa de que no encontró ningún teléfono hardcodeado

  @s21
  Scenario: La identidad del negocio se declara una sola vez y su forma compuesta no diverge
    Given la fuente única declara el nombre comercial "Galapavet", el descriptor "Centro integral veterinario" y la localidad "Galapagar" una sola vez
    When se piden a la fuente única el nombre comercial, el descriptor por sí solo y la forma compuesta de descriptor y localidad
    Then el nombre comercial es exactamente "Galapavet"
    And el descriptor por sí solo es exactamente "Centro integral veterinario"
    And la forma compuesta es exactamente "Centro integral veterinario en Galapagar, Madrid."
