# =============================================================================
# POR QUÉ CAMBIA ESTE CONTRATO (20/09/2026) — E1: FUERA LA TARJETA ROJA
# =============================================================================
# Decisión de Pablo del 20/09/2026, tras ver capturas del sitio, CORROBORADA en
# la grabación de la reunión con su socio Roberto Alonso del 16/08/2026
# (`2026-08-16 16-14-50.mkv`; transcripción literal con marcas de tiempo en
# `progress/transcripcion_reunion_rober_20260816.txt`, tabla en
# `progress/decisiones_reunion_rober_20260816.md`). Hablando de ESTA sección:
#
#   [06:52] «La urgencia se va afuera.»
#   [06:53] «Esto es fuera, sí, esto de urgencia se va.»
#   [06:55] «Y el resto se queda como está.»
#   [06:58] «Vale, tu nombre y esto de dirección que está guapo.»
#   [07:03] (del FAQ) «Correcto, esto se ve como está. Está perfecto, sí.»
#
# QUÉ SE VA Y QUÉ SE QUEDA — el criterio de Pablo, literal: fuera la CARTELERÍA
# roja, se queda el TEXTO útil.
#   FUERA  la tarjeta roja de urgencias de este panel: el rótulo con su punto
#          pulsante, el teléfono grande y la píldora blanca "Llamar ahora"
#          (`InformacionContacto.tsx:151-176`, `.module.scss:141-271`).
#   SE QUEDAN, sin tocar: el formulario, el mapa y los bloques de datos; la
#          pregunta de urgencias del FAQ; la línea de urgencias de la
#          confirmación del formulario; el paso de urgencia del chat de
#          reserva; y `datosNegocio.telefonoUrgencias` en la fuente única, que
#          NO se toca (sigue con consumidores vivos).
#
# AVISO AÑADIDO EL 20/09/2026 (TERCERA TANDA) — EL PUNTO PULSANTE SE LLEVA POR
# DELANTE LA ÚLTIMA ANIMACIÓN DEL PROYECTO, Y UN TEST QUE NO FALLA SUAVEMENTE.
# `.pulso` (`InformacionContacto.module.scss:197-200`) y su `@keyframes pulso`
# (`:267`) son, junto al pulso del CTA de urgencias de la cabecera que borra D1
# (`Cabecera.module.scss:188` y `:294`), las DOS ÚNICAS declaraciones
# `animation:` de todo `src/`. Al retirarlos el sitio se queda sin ninguna
# animación por fotogramas clave. Dos consecuencias que el artesano tiene que
# tener delante:
#   1. `src/components/InformacionContacto.test.tsx:496-511` es el ÚNICO test del
#      repositorio que afirma que existe una declaración `animation:`, y NO falla
#      suavemente: su ayudante `cuerpoDelBloque('.pulso {')` LANZA cuando el
#      bloque desaparece. Hay que borrarlo en el MISMO commit que el SCSS, o la
#      suite revienta con un error de infraestructura en vez de un fallo legible.
#   2. Este módulo no tiene ninguna `transition`, así que al perder su
#      `animation` cae ENTERO del censo de `movimientoRespetuoso`: 7 → 6
#      ficheros con movimiento. La puerta sigue en verde y con margen.
# La política de movimiento resultante —qué se pierde, qué sigue mordiendo, y
# que el socio había pedido animaciones para la galería en la reunión del
# 16/08/2026 (06:34-06:42)— está escrita en UN SOLO SITIO, en la sección D de
# `features/accesibilidad.feature`. No se repite aquí a propósito.
#
# -----------------------------------------------------------------------------
# CONSECUENCIA QUE ESTE CONTRATO NO ESCONDE
# -----------------------------------------------------------------------------
# Esta tanda va junto con la retirada del enlace de urgencias del PIE (E2,
# `features/pie_de_pagina.feature`) y con la retirada del CTA de urgencias de
# la CABECERA (D1, `features/fidelidad_cabecera.feature`, tanda anterior).
# MEDIDO, no supuesto: después de las tres, NINGUNA de las seis rutas contiene
# la palabra "urgencias" en su texto visible INICIAL. El FAQ dice «atención
# fuera del horario de la clínica» —sin la palabra— y además arranca cerrado;
# el chat ofrece «Es una urgencia» (singular) y solo dice «urgencias fuera de
# horario» DESPUÉS de pulsar; la confirmación del formulario solo aparece
# DESPUÉS de enviar. El dato sigue publicado, pero deja de estar a la vista sin
# interactuar. Eso pone en rojo dos puertas de agregado global
# (`tests/e2e/urgencias.spec.ts:140-141` y `tests/e2e/datos-reales.spec.ts:254`,
# @s52) y es una decisión de PUBLICACIÓN que el humano tiene que aprobar con
# los ojos abiertos: ver `progress/contacto_pie_contrato_20260920.md` §3.
# =============================================================================

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
#      ------------------------------------------------------------------------------------------
#      ACTUALIZACIÓN (20/09/2026) — ESTA «SUSTITUCIÓN DECIDIDA» QUEDA DEROGADA. Pablo retira el
#      cuarto bloque entero (reunión del 16/08/2026, minutos 06:52-07:00). El recorrido completo,
#      para que la puerta humana vea que Pablo NO cambia de criterio sobre el DATO sino sobre la
#      CARTELERÍA, es este:
#         (a) prototipo heredado: bloque rojo «Urgencias 24 h · 640 22 11 90 · Llamar ahora»
#             → suprimido el 17/08/2026 por FALSO (Galapavet cierra los domingos);
#         (b) contrato del 17/08/2026: cuarto bloque de datos «Urgencias fuera de horario», con
#             el rótulo literal del cliente y sin ningún reclamo;
#         (c) enmienda del 03/09/2026 (`fidelidad_contacto` @s3): ese bloque recupera el fondo de
#             urgencia, el punto pulsante y la píldora «Llamar ahora» —vuelve a ser cartelería—;
#         (d) HOY, 20/09/2026: fuera del todo. El DATO no se pierde: sigue en la fuente única, en
#             el FAQ, en la confirmación del formulario y en el chat de reserva (E3), y este
#             contrato lo dice por escrito en la nota de @s5.
#      Lo que decae de esta nota es el argumento «es el número que alguien necesita encontrar de
#      un vistazo un sábado a las 22:00»: a partir de hoy ya NO se encuentra de un vistazo en esta
#      sección. Esa es exactamente la contrapartida que el humano aprueba.
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
#      ACTUALIZACIÓN (20/09/2026): con E1 este panel renderiza 2 enlaces `tel:`, los del @s3. El
#      @s16 NO se toca: sigue inyectando el teléfono de la CLÍNICA, que sobrevive. Ojo al leer el
#      precedente que esta nota cita: `pie_de_pagina.feature` @s15 inyectaba su valor inválido por
#      el teléfono de URGENCIAS, y E2 le quita ese punto de inyección; allí el escenario se
#      reapunta al teléfono de la clínica, sin perder el modo de error.
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

  # TÍTULO Y DOS CLÁUSULAS ENMENDADOS (20/09/2026, Pablo; reunión con Roberto Alonso del
  # 16/08/2026, minutos 06:52-07:00). Decían literalmente: «El panel muestra exactamente los
  # cuatro bloques de datos reales, en orden» / «Then dentro de esa región hay exactamente 4
  # grupos de datos» / «And sus nombres accesibles son, en este orden, "Dirección", "Teléfonos",
  # "Horario" y "Urgencias fuera de horario"». El cuarto grupo ERA la tarjeta roja que E1 retira
  # (el `<fieldset aria-label="Urgencias fuera de horario">` de `InformacionContacto.tsx:159`),
  # así que el recuento baja de 4 a 3. La cláusula del "Email" NO se toca: sigue siendo cierta y
  # sigue siendo la guarda contra el bloque inventado del prototipo.
  @s1
  Scenario: El panel muestra exactamente los tres bloques de datos reales, en orden
    When el visitante recorre la región cuyo nombre accesible es "Información de contacto"
    Then dentro de esa región hay exactamente 3 grupos de datos
    And sus nombres accesibles son, en este orden, "Dirección", "Teléfonos" y "Horario"
    And ningún grupo tiene el nombre accesible "Email"
    And ningún grupo tiene el nombre accesible "Urgencias fuera de horario"

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

  # @s5 ELIMINADO (20/09/2026). Decía literalmente:
  #
  #   # ENMENDADO el 03/09/2026 con `fidelidad_contacto` (34): la acción visual
  #   # aprobada no implica disponibilidad 24 h. Antes/después literal en
  #   # `progress/fidelidad/enmiendas_fidelidad_contacto.md`.
  #   @s5
  #   Scenario: El teléfono de urgencias aparece con el rótulo real de fuera de horario
  #     When el visitante lee el grupo cuyo nombre accesible es "Urgencias fuera de horario"
  #     Then dentro de ese grupo hay exactamente 1 enlace
  #     And ese enlace tiene el nombre accesible exacto "Llamar ahora" y su destino es exactamente "tel:+34918511393"
  #     And el número real "91 851 13 93" se muestra junto a la acción de llamada
  #     And el texto del grupo no contiene "24" ni "todos los días"
  #     And el nombre accesible del grupo es exactamente "Urgencias fuera de horario", sin ninguna palabra añadida
  #
  # POR QUÉ SE RETIRA: decisión de Pablo del 20/09/2026, corroborada por Roberto
  # Alonso en la grabación del 16/08/2026, minutos 06:52-07:00 («La urgencia se
  # va afuera... y el resto se queda como está»). Se retira la CARTELERÍA, no el
  # DATO: `datosNegocio.telefonoUrgencias` sigue declarado en la fuente única
  # (`features/datos_negocio.feature` @s3, intacto) y sigue publicado en tres
  # sitios que esta tanda NO toca —la respuesta del FAQ
  # (`features/faq.feature` @s5), la confirmación del formulario
  # (`features/formulario_contacto.feature` @s14) y la derivación del chat de
  # reserva (`features/reserva_chat.feature` @s21)—.
  #
  # LO QUE SÍ SE PIERDE, dicho sin maquillar: los tres sitios que lo conservan
  # exigen una INTERACCIÓN previa (abrir el acordeón, enviar el formulario,
  # pulsar «Es una urgencia»). Tras E1 + E2 + D1 el teléfono de urgencias deja
  # de estar a la vista sin interactuar en cualquiera de las seis rutas. Eso lo
  # aprueba el humano a sabiendas: ver el bloque de cabecera de este fichero y
  # `progress/contacto_pie_contrato_20260920.md` §3.
  #
  # LO QUE NO SE PIERDE, porque se reubica: la última cláusula de este @s5 —«el
  # nombre accesible del grupo es exactamente "Urgencias fuera de horario", sin
  # ninguna palabra añadida»— sigue viva y es EXACTAMENTE lo que afirma @s14 de
  # `features/rediseno_visual.feature` para todo el sitio: todo rótulo accesible
  # que mencione urgencias, allí donde exista, es el rótulo real y nada más.

  # ENMENDADO el 03/09/2026 con `fidelidad_contacto` (34): se permite una
  # única acción de llamada, pero no ningún reclamo de disponibilidad continua.
  # Antes/después literal en `progress/fidelidad/enmiendas_fidelidad_contacto.md`.
  #
  # ENMENDADO OTRA VEZ el 20/09/2026 (Pablo; reunión con Roberto Alonso del
  # 16/08/2026, minutos 06:52-07:00). ESTE ESCENARIO NO SE BORRA: SE INVIERTE.
  # Las dos primeras cláusulas decían literalmente «Then existe exactamente una
  # acción cuyo nombre accesible es "Llamar ahora" y apunta al teléfono real de
  # urgencias fuera de horario» y «And el número "91 851 13 93" aparece
  # exactamente una vez en toda la sección». Con E1 la píldora desaparece, así
  # que pasan a exigir CERO: mantener el escenario invertido es lo que impide
  # que la tarjeta vuelva a entrar por la puerta de atrás, que es exactamente el
  # papel que este @s6 lleva teniendo desde el 17/08/2026.
  #
  # LAS CINCO PROHIBICIONES DE RECLAMO NO SE TOCAN: son el corazón de @s6, no
  # dependían de la tarjeta y siguen siendo la guarda de la Decisión 2.
  #
  # El «sin haber enviado el formulario» del When no es un adorno: la
  # confirmación de `formulario_contacto` @s14 —que E3 conserva— sí muestra el
  # rótulo y el número dentro de esta misma sección DESPUÉS de enviar. Sin esa
  # precisión el contrato sería falso en cuanto alguien enviara el formulario.
  @s6
  Scenario: No existe ningún bloque ni reclamo que anuncie urgencias 24 h
    When el visitante recorre la sección de contacto entera, sin haber enviado el formulario
    Then no existe ninguna acción cuyo nombre accesible sea "Llamar ahora"
    And el texto de la sección no contiene "24 h" ni "24h" ni "24 horas"
    And el texto de la sección no contiene "todos los días del año" ni "siempre hay alguien de guardia"
    And el número "91 851 13 93" no aparece ninguna vez en toda la sección
    And ningún enlace de la sección tiene como destino "tel:+34918511393"

  @s7
  Scenario: No existe bloque de email porque el cliente no publica ninguna dirección de correo
    When el visitante recorre la región cuyo nombre accesible es "Información de contacto"
    Then no hay ningún grupo cuyo nombre accesible sea "Email" ni "Correo"
    And no hay ningún enlace cuyo destino empiece por "mailto:"
    And el texto de la región no contiene ninguna dirección de correo electrónico
    And el texto de la región no contiene "hola@veterinarialasierra.es" ni "info@galapavet.com"

  # ENMENDADO el 03/09/2026 con `fidelidad_contacto` (34), Decisión 63 (mapa estático local):
  # antes/después literal en `progress/fidelidad/enmiendas_fidelidad_contacto.md`.
  @s8
  Scenario: El mapa es una imagen local con el nombre accesible derivado y encabeza el panel
    When el visitante recorre la región cuyo nombre accesible es "Información de contacto"
    Then hay exactamente 1 imagen de mapa y ningún marco embebido
    And su texto alternativo es exactamente "Mapa con la ubicación de Galapavet en Carretera de Torrelodones, 11, 28260 Galapagar, Madrid", derivado del nombre comercial y de la dirección de la fuente única
    And su texto alternativo no contiene "La Sierra" ni "Miraflores"
    And la imagen declara ancho y alto, y lleva encima un pin decorativo cuya posición deriva de las coordenadas de la fuente única
    And esa imagen aparece antes que los grupos de datos en el orden de lectura

  # ENMENDADO el 03/09/2026 con `fidelidad_contacto` (34), Decisión 63 (mapa estático local):
  # antes/después literal en `progress/fidelidad/enmiendas_fidelidad_contacto.md`.
  @s9
  Scenario: La sección no declara ningún origen ajeno y atribuye el mapa a OpenStreetMap de forma visible
    When el visitante recorre la sección de contacto entera
    Then ningún elemento con atributo "src" de la sección declara un origen ajeno al propio sitio, y no hay ningún marco embebido ni script
    And [Decisión 11 — verificado con navegador real (Playwright, `tests/e2e/red-limpia.spec.ts` @s32 y `tests/e2e/fidelidad-contacto.spec.ts` @s4), fuera del gate de Vitest/Stryker] la portada no realiza ninguna petición a un dominio externo
    And la atribución "© OpenStreetMap contributors" existe como texto del documento dentro de la región "Información de contacto", enlazada a "https://www.openstreetmap.org/copyright"
    And el elemento que contiene ese texto no declara el atributo "aria-hidden" a "true" ni el atributo "hidden"

  # ENMENDADO el 03/09/2026 con `fidelidad_contacto` (34), Decisión 63 (mapa estático local):
  # antes/después literal en `progress/fidelidad/enmiendas_fidelidad_contacto.md`.
  @s10
  Scenario: La imagen del mapa no se descarga hasta que hace falta
    When el visitante abre la página con la sección de contacto todavía fuera de la ventana visible
    Then la imagen del mapa declara carga diferida
    And [Decisión 11 — verificado con navegador real (`tests/e2e/imagenes.spec.ts` @s30), fuera del gate de Vitest/Stryker] la imagen declara sus dimensiones y decodificación asíncrona, y la portada no desplaza contenido al cargarla

  @s11
  Scenario: El panel no reescribe a mano ningún teléfono, lo deriva de la fuente única
    Given la fuente única declara el teléfono de la clínica con el valor legible "600 000 000", que es un doble de test y no un dato de Galapavet
    When el visitante lee el grupo cuyo nombre accesible es "Teléfonos"
    Then el nombre accesible del primer enlace es exactamente "600 000 000"
    And su destino es exactamente "tel:+34600000000"
    And en toda la región "Información de contacto" no aparece el valor "91 082 92 67" ni el destino "tel:+34910829267"

  # @s12 ELIMINADO (20/09/2026) — Y SUS DOS CLÁUSULAS ÚNICAS REUBICADAS, NO PERDIDAS.
  # Decía literalmente:
  #
  #   @s12
  #   Scenario: Un dato de contacto ausente hace desaparecer su bloque, sin rellenarlo con nada
  #     Given la fuente única no declara teléfono de urgencias
  #     When el visitante recorre la región cuyo nombre accesible es "Información de contacto"
  #     Then no hay ningún grupo cuyo nombre accesible sea "Urgencias fuera de horario"
  #     And quedan exactamente 3 grupos, con los nombres accesibles "Dirección", "Teléfonos" y "Horario" en ese orden
  #     And el texto de la región no contiene "—" ni "Próximamente" ni "Consultar" ni "Pendiente"
  #     And no hay ningún enlace cuyo destino empiece por "tel:" y no termine en un número completo
  #
  # POR QUÉ SE RETIRA: SE QUEDA SIN SUJETO. Su Given inyectaba el ÚNICO dato
  # opcional que este panel declaraba anulable (`telefonoUrgencias?: string |
  # null`, `InformacionContacto.tsx:56-61`), y E1 se lleva la prop junto con la
  # tarjeta. Un escenario cuyo Given ya no se puede dar no es un contrato: es
  # una frase.
  #
  # CÓMO SE EVITA LA PÉRDIDA NETA DE COBERTURA. @s12 aportaba dos cláusulas que
  # NINGÚN otro escenario de este fichero afirmaba —«sin placeholder» y «sin
  # `tel:` a medias»—, y son las que hacen del patrón «dato ausente → el bloque
  # desaparece» algo más que un recuento. Se REUBICAN, palabra por palabra, en
  # @s13, que ejercita el otro dato opcional que sobrevive (`horario` sin
  # tramos). Si el artesano borra @s12 SIN escribirlas en @s13, el saldo neto de
  # E1 es MENOS cobertura de la que había: es el mismo defecto que la tanda
  # anterior documentó para @s13 de `cabecera_y_navegacion`.
  #
  # QUEDA PARA LA PUERTA HUMANA: tras E1 este panel se queda con DOS datos
  # opcionales (`horario` vacío en @s13, `direccion` nula en @s14) y ninguno de
  # los dos es un TELÉFONO. El modo de error «teléfono ausente» deja de estar
  # ejercitado en este panel; el modo «teléfono presente pero inválido» sí sigue
  # ejercitado, en @s16, con el de la clínica.

  # DOS CLÁUSULAS AÑADIDAS a @s13 (20/09/2026): las que @s12 aportaba en
  # exclusiva, reubicadas al dato opcional que sí sobrevive. La tercera, el
  # recuento y el orden de los grupos que quedan, baja de 3 a 2 porque el cuarto
  # grupo era la tarjeta que retira E1.
  @s13
  Scenario: Un horario sin ningún tramo hace desaparecer el bloque de horario
    Given la fuente única declara el horario sin ningún tramo
    When el visitante recorre la región cuyo nombre accesible es "Información de contacto"
    Then no hay ningún grupo cuyo nombre accesible sea "Horario"
    And quedan exactamente 2 grupos, con los nombres accesibles "Dirección" y "Teléfonos" en ese orden
    And los demás grupos conservan sus nombres accesibles y su orden relativo
    And no se muestra ninguna lista de tramos vacía
    And el texto de la región no contiene "—" ni "Próximamente" ni "Consultar" ni "Pendiente"
    And no hay ningún enlace cuyo destino empiece por "tel:" y no termine en un número completo

  # ENMENDADO el 03/09/2026 con `fidelidad_contacto` (34), Decisión 63 (mapa estático local):
  # antes/después literal en `progress/fidelidad/enmiendas_fidelidad_contacto.md`.
  @s14
  Scenario: Sin dirección no se muestra el mapa, porque el mapa describe y sitúa la dirección postal
    Given la fuente única no declara dirección postal
    When el visitante recorre la región cuyo nombre accesible es "Información de contacto"
    Then no hay ningún grupo cuyo nombre accesible sea "Dirección"
    And no hay ninguna imagen de mapa, ningún marco embebido ni la atribución del mapa
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
