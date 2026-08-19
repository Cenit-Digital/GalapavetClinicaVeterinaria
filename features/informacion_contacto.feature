# FUENTE DEL COMPORTAMIENTO
#   - Prototipo Claude Design «Veterinaria La Sierra.dc.html», sección id="contacto", columna
#     derecha (líneas 401-425): tarjeta con el marco del mapa arriba y, debajo, una rejilla de
#     bloques de datos, cada uno con un rótulo en versalitas y dos líneas de valor
#     (`datosContacto`, 4 elementos, líneas 787-792). ESA es la interacción aprobada y se respeta:
#     mapa primero, rejilla de bloques rotulados después, dentro de una sola tarjeta.
#   - project-spec.md → Decisión 2 (se suprime todo el reclamo «Urgencias 24 h»; el teléfono de
#     urgencias fuera de horario se conserva DENTRO de los datos de contacto con su rótulo real),
#     Decisión 9 (las peticiones automáticas a terceros se eliminan y «el mapa embebido es la
#     ÚNICA excepción, y se declara»), Invariante 2 (todo dato se deriva de la fuente única) e
#     Invariante «dato de negocio ausente → no se renderiza el bloque».
#   - feature_list.json → feature 10 `informacion_contacto`, sus 4 criterios de aceptación.
#   - docs/datos-galapavet.md §2 (NAP), §3 (horario), §7 (lo falso del prototipo), §9 (lo que el
#     cliente NO publica).
#
# DATOS REALES QUE FIJA ESTE CONTRATO (docs/datos-galapavet.md §2 y §3)
#   Dirección ................ "Carretera de Torrelodones, 11" · "28260 Galapagar, Madrid"
#   Teléfono clínica ......... "91 082 92 67"   → tel:+34910829267
#   Teléfono móvil ........... "685 34 31 49"   → tel:+34685343149
#   Urgencias fuera de horario "91 851 13 93"   → tel:+34918511393  (rótulo literal del cliente)
#   Horario .................. "Lunes a viernes" / "11:00 a 14:00 y 16:30 a 20:00"
#                              "Sábados"        / "11:00 a 14:00"
#                              "Domingos"       / "Cerrado"
#   Los tramos y sus palabras son los mismos que fija features/datos_negocio.feature @s10, del que
#   este panel se limita a beber: aquí no se reescribe ni un dígito a mano (ver @s11).
#
# QUÉ CAMBIA RESPECTO AL CONTRATO HEREDADO (docs/contrato-heredado/informacion_contacto.feature)
#   1. ELIMINADO el @s1 heredado por completo: el bloque rojo destacado «Urgencias 24 h ·
#      640 22 11 90 · Llamar ahora». Motivo doble: la afirmación «24 h» es FALSA para Galapavet
#      (§7: cierra los domingos) y el cliente pidió expresamente el 17/08/2026 suprimir el
#      destacado. Aquí no se sustituye por un destacado equivalente: se convierte en @s6, que
#      exige su AUSENCIA, para que nadie lo reintroduzca al implementar.
#   2. El @s3 heredado («4 bloques: Dirección, Teléfonos, Horario y Email») conserva su forma —
#      cuatro bloques rotulados en la misma rejilla— y cambia sus DATOS:
#        · «Dirección» → la real de Galapagar, no la de Miraflores de la Sierra.
#        · «Teléfonos» → los dos publicados por el cliente, no los dos inventados.
#        · «Horario»   → los tres tramos publicados, con «Domingos / Cerrado». Desaparece el
#                        «domingos urgencias» heredado, que era la misma mentira del 24 h.
#        · «Email»     → SE ELIMINA. El cliente no publica ni un solo correo (§9: no hay ningún
#                        `mailto:` en galapavet.com; `info@galapavet.com` se descartó por no
#                        verificado). Un bloque «Email» solo podría rellenarse inventando.
#      SUSTITUCIÓN DECIDIDA Y SU PORQUÉ: el cuarto bloque pasa a ser «Urgencias fuera de horario»
#      con el teléfono 91 851 13 93. No es reintroducir el destacado suprimido: es un bloque de
#      datos idéntico en peso, tipografía y tratamiento a los otros tres, sin color de alarma, sin
#      punto pulsante, sin botón «Llamar ahora» y sin la palabra «24». Se prefiere a dejarlo como
#      segunda línea del bloque «Teléfonos» porque ahí quedaría en el tratamiento secundario y
#      apagado de la línea 2, y ese es justamente el número que alguien necesita encontrar de un
#      vistazo un sábado a las 22:00. La Decisión 2 ordena literalmente conservarlo «dentro de los
#      datos de contacto con su rótulo real»: esto es exactamente eso, y mantiene los 4 bloques que
#      la interacción aprobada disponía en la rejilla.
#   3. El @s2 heredado (mapa) se conserva y su título accesible pasa a llevar el nombre real:
#      «Mapa de Galapavet» en vez de «Mapa de Veterinaria La Sierra». Se le añaden @s9 y @s10, que
#      fijan lo que el prototipo daba por supuesto: el mapa es la ÚNICA petición a un tercero
#      admitida en toda la página, va declarada al visitante y no se solicita hasta que hace falta.
#      Por Decisión 11 de project-spec.md, dos cláusulas que jsdom no puede medir con
#      `vite.config.ts` en `css: false` (origen real de tipografía/hoja de estilo en @s9, disparo
#      real de la petición diferida en @s10) quedan declaradas en el propio escenario como
#      verificadas con navegador real, fuera del gate de Vitest/Stryker. El resto de ambos
#      escenarios (origen de imagen/script, atributo de carga diferida) se sigue verificando por
#      Vitest. El aviso visible de @s9 tampoco se afirma por CSS —«visible» no es medible con
#      `css:false`—: se afirma por su presencia como texto real del documento y la ausencia de
#      `aria-hidden`/`hidden`, que sí son atributos consultables sin CSS (Invariante 5). La
#      distinción fina entre «visible a la vista» y «solo accesible» (p. ej. una clase `.sr-only`)
#      queda para la puerta de accesibilidad.
#   4. Los teléfonos del panel pasan a ser enlaces de llamada. El prototipo los pintaba como texto
#      muerto porque el único afordance de llamada vivía en el bloque rojo suprimido; al quitar el
#      bloque se retira la afirmación falsa, no la capacidad de llamar. La interacción aprobada
#      («poder llamar desde el panel con un toque») se conserva, cambiando dónde vive.
#   5. Los escenarios nuevos @s12, @s13, @s14 y @s16 no tienen equivalente heredado: el contrato
#      del prototipo solo describía el camino feliz sobre datos horneados. @s16 ejercita el modo de
#      error común del proyecto (teléfono que no normaliza → el normalizador lanza, falla cerrado),
#      el mismo que ya prueba pie_de_pagina.feature @s15 sobre su propio teléfono de urgencias:
#      aquí faltaba, porque este panel también renderiza 3 enlaces `tel:` (2 en @s3, 1 en @s5) y
#      ninguno se ejercitaba con un valor presente pero inválido.
#
# ÁMBITO DE LOS ESCENARIOS
#   «El panel» = la región de información de contacto (mapa + bloques de datos), objeto de esta
#   feature. «La sección de contacto» incluye además el formulario, que es de
#   features/formulario_contacto.feature. Las guardas @s6 y @s15 se afirman sobre la SECCIÓN
#   entera a propósito: impiden que el reclamo suprimido vuelva por la puerta del texto de
#   introducción. @s7 en cambio se afirma sobre el PANEL, porque el formulario sí puede pedirle al
#   visitante SU correo — lo prohibido es publicar un correo de Galapavet, que no existe.
#
# TEXTO DE INTERFAZ QUE NO ES UN DATO DE NEGOCIO (redactado aquí, sustituible sin tocar los datos)
#   - El nombre accesible de la región: «Información de contacto».
#   - El aviso del mapa: «El mapa lo sirve un proveedor externo. Es la única conexión con un
#     tercero de esta web.» Es una afirmación sobre esta página, no sobre el negocio.
#
# PENDIENTE (no verificado — ningún escenario lo afirma como hecho)
#   - PENDIENTE: coordenadas geográficas exactas (datos-galapavet.md §9). Por eso ningún escenario
#     fija encuadre, marcador ni nivel de zoom del mapa: se centra por la dirección postal hasta
#     que el cliente las facilite, y @s14 hace que sin dirección no haya mapa (falla cerrado).
#   - PENDIENTE: el proveedor concreto del mapa. El prototipo usaba el embebido de OpenStreetMap;
#     este contrato NO fija el host, solo exige que sea UNO, que sea el único tercero de la página
#     y que esté declarado (@s9). La elección definitiva —y su encaje en RGPD/LSSI— se confirma
#     con el cliente antes de publicar.
#   - PENDIENTE: el texto de introducción heredado de la sección dice «siempre hay alguien de
#     guardia». Es FALSO para Galapavet (§3 y §7) y no se implementa; @s15 lo deja prohibido, pero
#     su redacción sustitutiva pertenece a la feature de la sección, no a esta.
#   - Fuera de alcance deliberado: la valoración de Google (§8) es un dato vivo y no se muestra en
#     este panel; @s15 exige su ausencia aquí.

Feature: Panel de información de contacto
  Como visitante que necesita ir en persona o llamar a Galapavet
  Quiero ver de un vistazo la dirección, los teléfonos, el horario y dónde está la clínica
  Para elegir el canal de contacto que me sirva sin acabar llamando al número equivocado.

  Background:
    Given el visitante está en la sección de contacto de la landing de Galapavet
    And la fuente única declara todos los datos de contacto publicados por el cliente

  @s1
  Scenario: El panel muestra exactamente los cuatro bloques de datos reales, en orden
    When el visitante recorre la región cuyo nombre accesible es "Información de contacto"
    Then dentro de esa región hay exactamente 4 grupos de datos
    And sus nombres accesibles son, en este orden, "Dirección", "Teléfonos", "Horario" y "Urgencias fuera de horario"
    And ningún grupo tiene el nombre accesible "Email"

  @s2
  Scenario: El bloque de dirección muestra la dirección real de Galapagar
    When el visitante lee el grupo cuyo nombre accesible es "Dirección"
    Then su texto contiene exactamente la línea "Carretera de Torrelodones, 11"
    And su texto contiene exactamente la línea "28260 Galapagar, Madrid"
    And su texto no contiene "Miraflores" ni "Ctra. de la Sierra" ni "28792"

  @s3
  Scenario: El bloque de teléfonos ofrece los dos números publicados como enlaces de llamada
    When el visitante lee el grupo cuyo nombre accesible es "Teléfonos"
    Then dentro de ese grupo hay exactamente 2 enlaces
    And el primero tiene el nombre accesible exacto "91 082 92 67" y su destino es exactamente "tel:+34910829267"
    And el segundo tiene el nombre accesible exacto "685 34 31 49" y su destino es exactamente "tel:+34685343149"
    And ninguno de los dos destinos es "tel:+34918442160" ni "tel:+34640221190"

  @s4
  Scenario: El bloque de horario muestra los tres tramos publicados y declara los domingos cerrados
    When el visitante lee el grupo cuyo nombre accesible es "Horario"
    Then su texto muestra exactamente 3 tramos
    And el primer tramo muestra "Lunes a viernes" junto a "11:00 a 14:00 y 16:30 a 20:00"
    And el segundo tramo muestra "Sábados" junto a "11:00 a 14:00"
    And el tercer tramo muestra "Domingos" junto a "Cerrado"
    And su texto no contiene "urgencias" ni "24"

  @s5
  Scenario: El teléfono de urgencias aparece con el rótulo real de fuera de horario
    When el visitante lee el grupo cuyo nombre accesible es "Urgencias fuera de horario"
    Then dentro de ese grupo hay exactamente 1 enlace
    And ese enlace tiene el nombre accesible exacto "91 851 13 93" y su destino es exactamente "tel:+34918511393"
    And el texto del grupo no contiene "24" ni "todos los días"
    And el nombre accesible del grupo es exactamente "Urgencias fuera de horario", sin ninguna palabra añadida

  @s6
  Scenario: No existe ningún bloque ni reclamo que anuncie urgencias 24 h
    When el visitante recorre la sección de contacto entera
    Then no hay ningún elemento cuyo nombre accesible sea "Llamar ahora"
    And el texto de la sección no contiene "24 h" ni "24h" ni "24 horas"
    And el texto de la sección no contiene "todos los días del año" ni "siempre hay alguien de guardia"
    And el número "91 851 13 93" aparece exactamente una vez en toda la sección

  @s7
  Scenario: No existe bloque de email porque el cliente no publica ninguna dirección de correo
    When el visitante recorre la región cuyo nombre accesible es "Información de contacto"
    Then no hay ningún grupo cuyo nombre accesible sea "Email" ni "Correo"
    And no hay ningún enlace cuyo destino empiece por "mailto:"
    And el texto de la región no contiene ninguna dirección de correo electrónico
    And el texto de la región no contiene "hola@veterinarialasierra.es" ni "info@galapavet.com"

  @s8
  Scenario: El mapa se muestra con el título accesible del nombre real y encabeza el panel
    When el visitante recorre la región cuyo nombre accesible es "Información de contacto"
    Then hay exactamente 1 marco embebido
    And su nombre accesible es exactamente "Mapa de Galapavet"
    And su nombre accesible no contiene "La Sierra" ni "Miraflores"
    And ese marco aparece antes que los grupos de datos en el orden de lectura

  @s9
  Scenario: El mapa es la única petición a un tercero de la página y se declara como tal
    When el visitante recorre la sección de contacto entera
    Then el único elemento que declara un origen ajeno al propio sitio es el marco del mapa
    And ninguna imagen ni script de la sección declara un origen ajeno al propio sitio
    And [Decisión 11 — verificado con navegador real (Claude in Chrome / skill browser-automation), fuera del gate de Vitest/Stryker] ninguna tipografía ni hoja de estilo de la sección declara un origen ajeno al propio sitio
    And la descripción accesible del marco del mapa es exactamente "El mapa lo sirve un proveedor externo. Es la única conexión con un tercero de esta web."
    And ese aviso existe como texto del documento dentro de la región "Información de contacto", no solo como valor de un atributo aria-label o aria-describedby
    And el elemento que contiene ese texto no declara el atributo "aria-hidden" a "true" ni el atributo "hidden"

  @s10
  Scenario: El mapa no se solicita al tercero hasta que hace falta
    When el visitante abre la página con la sección de contacto todavía fuera de la ventana visible
    Then el marco del mapa declara carga diferida
    And [Decisión 11 — verificado con navegador real (Claude in Chrome / skill browser-automation), fuera del gate de Vitest/Stryker] no se ha solicitado nada al proveedor externo mientras el marco sigue fuera de la ventana visible

  @s11
  Scenario: El panel no reescribe a mano ningún teléfono, lo deriva de la fuente única
    Given la fuente única declara el teléfono de la clínica con el valor legible "600 000 000", que es un doble de test y no un dato de Galapavet
    When el visitante lee el grupo cuyo nombre accesible es "Teléfonos"
    Then el nombre accesible del primer enlace es exactamente "600 000 000"
    And su destino es exactamente "tel:+34600000000"
    And en toda la región "Información de contacto" no aparece el valor "91 082 92 67" ni el destino "tel:+34910829267"

  @s12
  Scenario: Un dato de contacto ausente hace desaparecer su bloque, sin rellenarlo con nada
    Given la fuente única no declara teléfono de urgencias
    When el visitante recorre la región cuyo nombre accesible es "Información de contacto"
    Then no hay ningún grupo cuyo nombre accesible sea "Urgencias fuera de horario"
    And quedan exactamente 3 grupos, con los nombres accesibles "Dirección", "Teléfonos" y "Horario" en ese orden
    And el texto de la región no contiene "—" ni "Próximamente" ni "Consultar" ni "Pendiente"
    And no hay ningún enlace cuyo destino empiece por "tel:" y no termine en un número completo

  @s13
  Scenario: Un horario sin ningún tramo hace desaparecer el bloque de horario
    Given la fuente única declara el horario sin ningún tramo
    When el visitante recorre la región cuyo nombre accesible es "Información de contacto"
    Then no hay ningún grupo cuyo nombre accesible sea "Horario"
    And los demás grupos conservan sus nombres accesibles y su orden relativo
    And no se muestra ninguna lista de tramos vacía

  @s14
  Scenario: Sin dirección no se muestra el mapa, porque el mapa se centra por la dirección postal
    Given la fuente única no declara dirección postal
    When el visitante recorre la región cuyo nombre accesible es "Información de contacto"
    Then no hay ningún grupo cuyo nombre accesible sea "Dirección"
    And no hay ningún marco embebido
    And no se realiza ninguna petición a ningún proveedor externo

  @s15
  Scenario: El panel no muestra ninguna cifra ni credencial que el cliente no publique
    When el visitante recorre la sección de contacto entera
    Then el texto de la sección no contiene "★" ni ninguna cifra de valoración ni "reseñas"
    And el texto de la sección no contiene "registro" ni "28/0791"
    And el texto de la sección no contiene "desde 2013" ni "+12 años" ni "mascotas en ficha"
    And el texto de la sección no contiene ningún precio

  @s16
  Scenario: Un teléfono que no valida hace fallar al panel en vez de pintar un enlace a medias
    Given la fuente única declara el teléfono de la clínica con el valor "91 082 92", que tiene siete dígitos
    When se renderiza el panel de información de contacto
    Then la operación falla lanzando un error
    And el mensaje del error contiene el valor recibido "91 082 92"
    And no se renderiza ningún elemento con rol "link" cuyo destino empiece por "tel:+34"
