# =============================================================================
# features/pagina_campanas.feature — Página de campañas: listado y ficha
# =============================================================================
#
# FUENTE DEL COMPORTAMIENTO
#
# - INTERACCIÓN (heredada del prototipo y aprobada): análisis forense completo de
#   «Campanas.dc.html» del proyecto de Claude Design (339 líneas, leídas enteras;
#   informe en scratchpad/research/10-diseno-campanas.md). De ahí se conserva la
#   arquitectura de la página: DOS VISTAS MUTUAMENTE EXCLUYENTES sobre la misma
#   dirección —listado y ficha—, rejilla de tarjetas con distintivo de estado,
#   ficha con encabezado propio, columna lateral de datos, bloque de «otras
#   campañas» que excluye la abierta, y migas de pan.
# - DATOS: docs/datos-galapavet.md §5 (los cinco bloques de servicio publicados y
#   sus puntos literales) y §2 (teléfono de la clínica). Nada más. Galapavet NO
#   HA CONFIRMADO ninguna campaña: docs/datos-galapavet.md no recoge ninguna
#   entrada de campaña (su propia regla exige que solo entre lo verificado
#   contra fuente primaria), §7 marca «Campañas con precios (49 €, −25 %, 75 €)»
#   como NO VERIFICABLE, y §9 deja precios y condiciones como pendientes de
#   reunión con el cliente.
# - DECISIONES: project-spec.md — Decisión 1(a) (un precio, una fecha o un número
#   de plazas es una AFIRMACIÓN SOBRE EL NEGOCIO: sin dato verificado no se
#   publica), Decisión 1(b) (el catálogo de campañas es DEMO y va ROTULADA COMO
#   TAL), Decisión 2 (fuera todo reclamo de «Urgencias 24 h»), Decisión 9 e
#   Invariante 3 (imágenes locales, cero peticiones a terceros), Invariantes 1, 2
#   y 5 (dato verificado, fuente única, estado condicional en atributo ARIA).
# - feature_list.json → feature 16 `pagina_campanas`, sus 4 criterios de
#   aceptación.
# - COHERENCIA CON features/campanas_portada.feature: esa feature ya fija la ruta
#   «/campanas» como destino del bloque de portada, el catálogo de demo de TRES
#   campañas tituladas "Vacunaciones", "Chequeo" y "Odontología", el distintivo
#   único "Demostración" y los literales de error "precio no confirmado" y
#   "vigencia no confirmada". Esta feature los reutiliza sin cambiarlos.
#
# QUÉ SE APARTA DEL PROTOTIPO Y POR QUÉ
#
#  1. LOS PRECIOS DESAPARECEN. El prototipo declaraba `precio` ('49 €', '−25 %',
#     '75 €', '119 €'), `antes` ('78 €', '132 €', '164 €', 'sobre tarifa'),
#     `ahorro` ('Ahorras 29 € sobre tarifa') y un aside titulado «Precio de
#     campaña». Todo inventado. Se sustituye por un panel «Datos pendientes de
#     confirmar» cuyo único valor admitido es el literal de pendiente (@s15), y
#     por escenarios que FALLAN CERRADO si alguien mete un precio (@s33).
#  2. LAS VIGENCIAS Y LAS PLAZAS DESAPARECEN. `vigencia` ('Hasta el 30 de
#     septiembre', 'Todo octubre', 'De marzo a noviembre'), `plazas` ('40 plazas
#     al mes', '12 intervenciones/semana') y `duracion` ('30 min · una sola
#     visita') son invención. Igual tratamiento: pendiente rotulado y fallo
#     cerrado (@s34, @s35, @s40).
#  3. LOS ESTADOS COMERCIALES DESAPARECEN. 'Activa', 'Plazas limitadas' y
#     'Empieza en marzo' anuncian disponibilidad de algo que no existe. El
#     distintivo de estado se conserva como pieza de interacción, pero su único
#     valor admitido pasa a ser "Demostración" (@s4, @s14, @s26), igual que en
#     campanas_portada.
#  4. CAE EL H1 DEL PROTOTIPO. «Prevenir cuesta menos que curar» es una
#     afirmación de coste, y el subtítulo «Cuatro campañas abiertas ahora mismo,
#     con precio cerrado, plazas limitadas y todo incluido» es falso tres veces
#     (recuento, apertura y precio; el propio prototipo solo tenía 2 de 4
#     'Activa' — hallazgo H-02 del informe forense). El encabezado pasa a ser
#     "Campañas de prevención", el mismo nombre que la región de portada.
#  5. CAEN «CÓMO FUNCIONA» Y «PARA QUIÉN ES». Los `pasos` del prototipo prometen
#     plazos («Te damos hora en menos de 2 horas»), gratuidades («Valoración
#     previa gratuita») y políticas de precio («aplazamos la vacuna sin coste»);
#     `paraQuien` y `letraPequena` fijan protocolos clínicos y condiciones
#     económicas. Nada de eso lo publica el cliente. En su lugar la ficha
#     TRANSCRIBE lo único verificable: los puntos que Galapavet publica del
#     bloque de servicios del que procede la campaña (@s12, @s13), y exige que
#     cada punto exista literalmente en docs/datos-galapavet.md §5 (@s36).
#  6. SE CORRIGE H-06 (sin deep-link). El prototipo guardaba la ficha abierta en
#     `state.activa` sin tocar la URL: no se podía compartir una ficha, el botón
#     Atrás sacaba de la página y recargar perdía la vista. Aquí la campaña
#     abierta viaja en la dirección «/campanas?campana=<id>» (@s8, @s10, @s11).
#     Se elige un PARÁMETRO sobre la misma ruta, y no una ruta nueva por ficha,
#     para no contradecir features/seo_estructura.feature @s4-@s5, que fija
#     exactamente CUATRO páginas publicadas (inicio, campañas, blog y tienda).
#  7. SE CORRIGE H-13 (cuatro botones con el mismo texto «Ver la ficha de la
#     campaña», indistinguibles en una lista de controles). Cada tarjeta ofrece
#     ahora un ENLACE con nombre accesible propio (@s6), que además es enlace y
#     no botón: se puede abrir en otra pestaña y copiar su destino.
#  8. SE CORRIGE EL CAMBIO DE VISTA MUDO (§12.2 del informe: sin gestión de foco,
#     sin aria-live, sin cambio de título). Al abrir una ficha el foco pasa a su
#     encabezado de nivel 1 (@s9).
#  9. SE CORRIGE H-11 («Otras campañas abiertas» listaba sin distintivo una
#     campaña que no había empezado). El rótulo pierde «abiertas» y cada tarjeta
#     relacionada lleva su distintivo "Demostración" (@s19).
# 10. SE CORRIGE EL ASIDE SIN NOMBRE ACCESIBLE (§12.2: «Precio de campaña» era un
#     <div> suelto). El panel es una región con nombre accesible y encabezado
#     (@s15).
# 11. SE CORRIGE H-09 (`window.scrollTo({behavior:'smooth'})` ignoraba
#     prefers-reduced-motion). @s21, @s22 y @s23 contratan las tres ramas por
#     interacción DOM, incluida la de preferencia no consultable, que falla
#     cerrada sin suavizado. @s41 ancla la misma decisión de tres vías como
#     función pura del módulo `*-logica.ts`, para que la mordida por mutación
#     no dependa de un `.tsx` que StrykerJS no muta.
# 12. SE CORRIGE EL FALLBACK SILENCIOSO (§5.2: un id inexistente devolvía el
#     listado sin decir nada). Ahora hay aviso de estado explícito (@s27), que
#     además no reproduce el valor recibido (@s28).
# 13. Las imágenes de Pexels (12 URLs remotas) se sustituyen por imágenes locales
#     (@s20), Decisión 9.
# 14. Ningún Then se afirma sobre clases CSS ni sobre estilos: los tests corren
#     con los CSS Modules desactivados. Todo se afirma sobre rol accesible,
#     nombre accesible, atributo ARIA, texto visible o destino de enlace.
#
# ALCANCE Y FRONTERAS
#
# - La cabecera y el pie son los de la landing y tienen su propio contrato
#   (features/cabecera_y_navegacion.feature y features/pie_de_pagina.feature).
#   Aquí solo se verifica que la página los comparte y que marca su enlace de
#   navegación como página actual (@s1).
# - Por eso TODAS las prohibiciones de contenido (@s24, @s25, @s26) se acotan al
#   CONTENIDO PRINCIPAL de la página: el pie sí contiene, legítimamente, el
#   rótulo real "Urgencias fuera de horario" y el año del aviso de copyright.
#
# TEXTOS LITERALES (el `tdd_craftsman` los copia tal cual al test, patrón
# `doble-de-test-anclado-al-literal-no-al-simbolo`)
#
#   AVISO DE DEMOSTRACIÓN:
#   "Contenido de demostración. Galapavet no ha confirmado ninguna campaña: esta
#   página muestra el formato sobre servicios que la clínica sí presta. Precio,
#   vigencia, plazas y condiciones están pendientes de confirmar con la clínica."
#
#   VALOR DE TODO DATO PENDIENTE: "Pendiente de confirmar con la clínica"
#   AVISO DE CAMPAÑA NO ENCONTRADA: "No encontramos esa campaña de demostración."
#   AVISO DE CATÁLOGO VACÍO: "No hay ninguna campaña de demostración que mostrar."
#
# DATOS DEL CATÁLOGO DE DEMO (los tres títulos son literales de
# docs/datos-galapavet.md §5, es decir, servicios que Galapavet SÍ presta)
#
#   | id           | título       | bloque publicado del que procede (§5) |
#   | vacunaciones | Vacunaciones | Medicina general                      |
#   | chequeo      | Chequeo      | Medicina general                      |
#   | odontologia  | Odontología  | Especialidades                        |
#
# PENDIENTE (nada de esto se afirma como hecho del negocio en ningún escenario)
#
# - PENDIENTE: el cliente NO ha confirmado ninguna campaña, ni su precio, ni su
#   vigencia, ni sus plazas, ni su duración, ni sus condiciones. Mientras siga
#   así, @s33-@s35 y @s40 obligan a fallar cerrado si alguien mete uno de esos
#   datos en el catálogo. El día que el cliente confirme una campaña real, este
#   contrato se reabre: hoy la prohibición es deliberada, no un olvido.
# - PENDIENTE: las fotografías de cada campaña y sus textos alternativos. El
#   contrato solo exige que su origen sea local (@s20); qué se ve en la foto es
#   decisión de diseño y el cliente aún no ha aportado imágenes propias.
# - PENDIENTE: la forma de la dirección de la ficha, «/campanas?campana=<id>», es
#   convención de ESTE proyecto, no un dato del cliente. Si el enrutado cambia,
#   se actualizan @s8, @s10, @s11, @s27, @s28 y @s29.
# - PENDIENTE: el destino "/#reservar" (@s17) depende de que la landing conserve
#   el ancla "#reservar" que fija cabecera_y_navegacion.feature @s5.
# - PENDIENTE: «Odontología» aparece en DOS bloques publicados («Cirugía y
#   anestesia» y «Especialidades», docs/datos-galapavet.md §5). Aquí se ancla a
#   «Especialidades», igual que en campanas_portada.feature. Falta que el cliente
#   confirme cuál es el encuadre que prefiere.
# - PENDIENTE: el aviso de demostración es texto de proyecto, no del cliente.
#   Debe revisarlo antes de publicar, junto con todo el catálogo de demo.
# =============================================================================

Feature: Página de campañas de prevención, con listado y ficha
  Como visitante interesado en la prevención
  Quiero recorrer las campañas y abrir el detalle de una de ellas
  Para ver qué formato tendrían, sabiendo en todo momento que es una demostración y sin que se me anuncie ningún precio, fecha ni plaza que la clínica no haya confirmado.

  Background:
    Given el catálogo de demo declara tres campañas construidas sobre puntos que Galapavet publica: "Vacunaciones" y "Chequeo" del bloque "Medicina general", y "Odontología" del bloque "Especialidades"
    And ninguna de las tres campañas declara precio, vigencia, plazas ni duración
    And el ancho de la ventana es igual o mayor que el punto de corte de navegación declarado por el proyecto

  @s1
  Scenario: La página comparte cabecera y pie con la landing y se marca como página actual
    Given el visitante viene de la portada
    When el visitante abre la dirección "/campanas"
    Then existe exactamente un elemento con rol "banner"
    And existe exactamente un elemento con rol "contentinfo"
    And existe exactamente un elemento con rol "main"
    And dentro del rol "banner" hay una región de navegación cuyo nombre accesible es "Navegación principal" con sus 8 enlaces
    And el enlace de esa navegación cuyo nombre accesible es "Campañas" tiene el atributo "aria-current" con valor "page"
    And ningún otro enlace de esa navegación tiene el atributo "aria-current"

  @s2
  Scenario: El listado se presenta con su encabezado y sus migas de pan
    Given el catálogo de demo tiene sus tres campañas
    When el visitante abre la dirección "/campanas"
    Then el contenido principal tiene exactamente un encabezado de nivel 1 cuyo texto es exactamente "Campañas de prevención"
    And existe una región de navegación cuyo nombre accesible es "Ruta"
    And esa región contiene un enlace cuyo nombre accesible es "Inicio" y cuyo destino es exactamente "/"
    And esa región contiene el texto "Campañas" en un elemento con el atributo "aria-current" en "page" que no es un enlace

  @s3
  Scenario: El listado muestra una tarjeta por cada campaña del catálogo de demo
    Given el catálogo de demo tiene sus tres campañas
    When el visitante abre la dirección "/campanas"
    Then el contenido principal contiene exactamente 3 tarjetas de campaña
    And hay exactamente 3 encabezados de nivel 2 dentro de esas tarjetas
    And sus nombres accesibles son, en este orden:
      | Vacunaciones |
      | Chequeo      |
      | Odontología  |
    And cada uno de esos tres títulos aparece literalmente en el catálogo de servicios publicado por el cliente

  @s4
  Scenario: Cada tarjeta se rotula como demostración y nombra el bloque publicado del que procede
    Given el catálogo de demo tiene sus tres campañas
    When el visitante abre la dirección "/campanas"
    Then cada una de las 3 tarjetas muestra el texto exacto "Demostración"
    And ninguna tarjeta muestra un estado distinto de "Demostración"
    And la tarjeta "Vacunaciones" muestra el texto exacto "Bloque de servicios: Medicina general"
    And la tarjeta "Odontología" muestra el texto exacto "Bloque de servicios: Especialidades"

  @s5
  Scenario: El aviso de demostración de la página es visible y literal
    Given el catálogo de demo tiene sus tres campañas
    When el visitante abre la dirección "/campanas"
    Then el contenido principal muestra el texto exacto "Contenido de demostración. Galapavet no ha confirmado ninguna campaña: esta página muestra el formato sobre servicios que la clínica sí presta. Precio, vigencia, plazas y condiciones están pendientes de confirmar con la clínica."
    And ese aviso aparece antes de la primera tarjeta en el orden de lectura del documento
    And ese aviso aparece exactamente una vez en el contenido principal

  @s6
  Scenario: Cada tarjeta ofrece un enlace propio, distinguible, hacia su ficha
    Given el catálogo de demo tiene sus tres campañas
    When el visitante abre la dirección "/campanas"
    Then cada tarjeta contiene exactamente un enlace
    And los nombres accesibles de esos enlaces son, en este orden:
      | Ver la ficha de Vacunaciones |
      | Ver la ficha de Chequeo      |
      | Ver la ficha de Odontología  |
    And no hay dos de esos enlaces con el mismo nombre accesible
    And sus destinos son, en este orden, "/campanas?campana=vacunaciones", "/campanas?campana=chequeo" y "/campanas?campana=odontologia"

  @s7
  Scenario: Abrir una tarjeta muestra la ficha de esa campaña y retira el listado
    Given el visitante está en la dirección "/campanas" con las tres tarjetas a la vista
    When el visitante pulsa el enlace "Ver la ficha de Vacunaciones"
    Then el contenido principal tiene exactamente un encabezado de nivel 1 cuyo texto es exactamente "Vacunaciones"
    And no existe ningún encabezado de nivel 1 cuyo texto sea "Campañas de prevención"
    And no existe ningún enlace cuyo nombre accesible empiece por "Ver la ficha de"

  @s8
  Scenario: Abrir una tarjeta refleja la campaña abierta en la dirección del navegador
    Given el visitante está en la dirección "/campanas" con las tres tarjetas a la vista
    When el visitante pulsa el enlace "Ver la ficha de Chequeo"
    Then la dirección del navegador es exactamente "/campanas?campana=chequeo"
    And la dirección del navegador conserva la ruta "/campanas"

  @s9
  Scenario: Al abrir una ficha el foco pasa a su encabezado de nivel 1
    Given el visitante está en la dirección "/campanas" con las tres tarjetas a la vista
    When el visitante pulsa el enlace "Ver la ficha de Odontología"
    Then el elemento con el foco es el encabezado de nivel 1 cuyo texto es exactamente "Odontología"
    And ese encabezado es enfocable por programa y no entra en el orden de tabulación

  @s10
  Scenario: Entrar directamente por la dirección de una ficha muestra esa ficha
    Given el visitante no ha pasado por el listado
    When el visitante abre la dirección "/campanas?campana=vacunaciones"
    Then el contenido principal tiene exactamente un encabezado de nivel 1 cuyo texto es exactamente "Vacunaciones"
    And no se muestra ningún aviso de campaña no encontrada
    And el contenido principal muestra el texto exacto "Demostración"

  @s11
  Scenario: El botón Atrás del navegador devuelve al listado
    Given el visitante llegó al listado y desde él abrió la ficha "Vacunaciones"
    When el visitante usa el botón Atrás del navegador
    Then la dirección del navegador es exactamente "/campanas"
    And el contenido principal tiene un encabezado de nivel 1 cuyo texto es exactamente "Campañas de prevención"
    And el contenido principal contiene exactamente 3 tarjetas de campaña

  @s12
  Scenario: La ficha de «Vacunaciones» transcribe los cinco puntos publicados de «Medicina general»
    Given el visitante ha abierto la dirección "/campanas?campana=vacunaciones"
    When el visitante lee el bloque encabezado por "Qué publica la clínica"
    Then el bloque tiene un encabezado de nivel 2 cuyo texto es exactamente "Qué publica la clínica"
    And su párrafo introductorio dice exactamente "«Vacunaciones» es uno de los puntos que Galapavet publica dentro del bloque «Medicina general»."
    And el bloque muestra una lista con exactamente 5 elementos
    And sus nombres accesibles son, en este orden:
      | Preventiva                   |
      | Vacunaciones                 |
      | Desparasitaciones            |
      | Chequeo                      |
      | Identificación con microchip |

  @s13
  Scenario: La ficha de «Odontología» transcribe los cuatro puntos publicados de «Especialidades»
    Given el visitante ha abierto la dirección "/campanas?campana=odontologia"
    When el visitante lee el bloque encabezado por "Qué publica la clínica"
    Then su párrafo introductorio dice exactamente "«Odontología» es uno de los puntos que Galapavet publica dentro del bloque «Especialidades»."
    And el bloque muestra una lista con exactamente 4 elementos
    And sus nombres accesibles son, en este orden:
      | Odontología   |
      | Oftalmología  |
      | Traumatología |
      | Endoscopia    |
    And ningún elemento de esa lista añade texto que no esté publicado por el cliente

  @s14
  Scenario: La ficha se rotula como demostración con el mismo aviso literal que el listado
    Given el catálogo de demo tiene sus tres campañas
    When el visitante abre la dirección "/campanas?campana=chequeo"
    Then el contenido principal muestra el texto exacto "Demostración"
    And el contenido principal muestra el texto exacto "Contenido de demostración. Galapavet no ha confirmado ninguna campaña: esta página muestra el formato sobre servicios que la clínica sí presta. Precio, vigencia, plazas y condiciones están pendientes de confirmar con la clínica."
    And ese aviso aparece antes del encabezado de nivel 2 "Qué publica la clínica" en el orden de lectura del documento

  @s15
  Scenario: El panel de datos pendientes nombra precio, vigencia y plazas sin ninguna cifra
    Given el visitante ha abierto la dirección "/campanas?campana=vacunaciones"
    When el visitante lee el panel de datos de la ficha
    Then existe una región cuyo nombre accesible es exactamente "Datos pendientes de confirmar"
    And dentro de ella hay un encabezado de nivel 2 con ese mismo texto
    And esa región asocia cada término con su valor, así:
      | Precio   | Pendiente de confirmar con la clínica |
      | Vigencia | Pendiente de confirmar con la clínica |
      | Plazas   | Pendiente de confirmar con la clínica |
    And el texto de esa región no contiene ningún dígito
    And el texto de esa región no contiene el carácter "€" ni el carácter "%"

  @s16
  Scenario: La ficha ofrece llamar al teléfono real derivado de la fuente única
    Given el visitante ha abierto la dirección "/campanas?campana=vacunaciones"
    When el visitante lee las llamadas a la acción de la ficha
    Then existe un enlace cuyo nombre accesible contiene "91 082 92 67"
    And el destino de ese enlace es exactamente "tel:+34910829267"
    And el contenido principal no contiene ningún destino "tel:" distinto de "tel:+34910829267"

  @s17
  Scenario: La ficha ofrece reservar y lleva a la sección de reserva de la landing
    Given el visitante ha abierto la dirección "/campanas?campana=odontologia"
    When el visitante lee las llamadas a la acción de la ficha
    Then existe un enlace cuyo nombre accesible es exactamente "Reservar cita"
    And su destino es exactamente "/#reservar"
    And su nombre accesible no contiene la palabra "campaña"

  @s18
  Scenario: Las migas de la ficha tienen tres niveles y la actual se marca con aria-current
    Given el visitante ha abierto la dirección "/campanas?campana=chequeo"
    When el visitante lee la región de navegación "Ruta"
    Then esa región contiene exactamente 3 elementos de ruta
    And el primero es un enlace cuyo nombre accesible es "Inicio" y cuyo destino es exactamente "/"
    And el segundo es un enlace cuyo nombre accesible es "Campañas" y cuyo destino es exactamente "/campanas"
    And el tercero muestra el texto "Chequeo", tiene el atributo "aria-current" en "page" y no es un enlace

  @s19
  Scenario: «Otras campañas» lista las demás campañas del catálogo y nunca la abierta
    Given el visitante ha abierto la dirección "/campanas?campana=vacunaciones"
    When el visitante lee el bloque encabezado por "Otras campañas"
    Then el bloque tiene un encabezado de nivel 2 cuyo texto es exactamente "Otras campañas"
    And el bloque contiene exactamente 2 tarjetas
    And sus títulos son, en este orden, "Chequeo" y "Odontología"
    And ninguna de esas tarjetas tiene el título "Vacunaciones"
    And cada una de esas tarjetas muestra el texto exacto "Demostración"
    And sus enlaces tienen los destinos exactos "/campanas?campana=chequeo" y "/campanas?campana=odontologia"
    And el texto del encabezado no contiene la palabra "abiertas"

  @s20
  Scenario: Ninguna imagen de la página se pide a un tercero
    Given el visitante ha abierto la dirección "/campanas"
    When se leen los orígenes de todas las imágenes del contenido principal
    Then hay exactamente 3 imágenes en el contenido principal, una por cada tarjeta de campaña
    And ningún origen contiene "http://" ni "https://"
    And ningún origen contiene "pexels"
    And cada imagen que acompaña a una tarjeta tiene el texto alternativo vacío, de modo que no aporta palabras al nombre accesible de su enlace

  @s21
  Scenario: Con la preferencia de menos movimiento, abrir una ficha no desplaza con suavizado
    Given el visitante ha pedido menos movimiento en su sistema
    And el visitante está en la dirección "/campanas" con las tres tarjetas a la vista
    When el visitante pulsa el enlace "Ver la ficha de Vacunaciones"
    Then el desplazamiento solicitado al principio de la página no es suavizado
    And el contenido principal muestra el encabezado de nivel 1 "Vacunaciones"

  @s22
  Scenario: Sin esa preferencia, abrir una ficha desplaza con suavizado
    Given el visitante no ha pedido menos movimiento
    And el visitante está en la dirección "/campanas" con las tres tarjetas a la vista
    When el visitante pulsa el enlace "Ver la ficha de Vacunaciones"
    Then el desplazamiento solicitado al principio de la página es suavizado
    And el contenido principal muestra el encabezado de nivel 1 "Vacunaciones"

  @s23
  Scenario: Si la preferencia de movimiento no se puede consultar se desplaza sin suavizado
    Given un entorno en el que la consulta de la preferencia de movimiento no está disponible
    And el visitante está en la dirección "/campanas" con las tres tarjetas a la vista
    When el visitante pulsa el enlace "Ver la ficha de Chequeo"
    Then el desplazamiento solicitado al principio de la página no es suavizado
    And no se produce ningún error en la consola

  @s24
  Scenario: Ningún texto del contenido principal muestra un precio
    Given el visitante recorre la página en el listado y en las tres fichas
    When se lee todo el texto del contenido principal en esas cuatro vistas
    Then ese texto no contiene el carácter "€"
    And ese texto no contiene el carácter "%"
    And ese texto no contiene ninguna de las cadenas "EUR", "IVA", "tarifa", "descuento", "precio cerrado", "Ahorras", "ahorro", "gratis" ni "gratuita"
    And la única aparición de la palabra "Precio" es la etiqueta del panel de datos pendientes
    And el valor asociado a esa etiqueta es exactamente "Pendiente de confirmar con la clínica"

  @s25
  Scenario: Ningún texto del contenido principal muestra una fecha ni un periodo de vigencia
    Given el visitante recorre la página en el listado y en las tres fichas
    When se lee todo el texto del contenido principal en esas cuatro vistas
    Then ese texto no contiene ninguno de los doce nombres de mes en español
    And ese texto no contiene ninguna de las cadenas "Hasta el", "Todo el año" ni "Empieza en"
    And ese texto no contiene ninguna secuencia con el formato "dd/mm/aaaa"
    And ese texto no contiene ningún número de cuatro cifras que empiece por "20"
    And la única aparición de las palabras "Vigencia" y "Plazas" es como etiqueta del panel de datos pendientes

  @s26
  Scenario: Ningún texto del contenido principal anuncia urgencias 24 h ni arrastra datos del prototipo ajeno
    Given el visitante recorre la página en el listado y en las tres fichas
    When se lee todo el texto del contenido principal en esas cuatro vistas
    Then ese texto no contiene ninguna de las cadenas "24 h", "24 horas" ni "Urgencias"
    And ese texto no contiene ninguna de las cadenas "Veterinaria La Sierra", "Miraflores" ni "Ctra. de la Sierra"
    And ese texto no contiene ninguna de las cadenas "918 44 21 60" ni "640 22 11 90"
    And ese texto no contiene ninguna de las cadenas "Activa", "Plazas limitadas", "campañas abiertas" ni "Prevenir cuesta menos que curar"
    And el único estado que muestra cualquier tarjeta o ficha es exactamente "Demostración"

  @s27
  Scenario: Un identificador desconocido muestra el listado y avisa de que no existe
    Given el catálogo de demo tiene sus tres campañas
    When el visitante abre la dirección "/campanas?campana=vacunacion-anual-2026"
    Then existe un elemento con rol "status" cuyo texto es exactamente "No encontramos esa campaña de demostración."
    And el contenido principal tiene un encabezado de nivel 1 cuyo texto es exactamente "Campañas de prevención"
    And el contenido principal contiene exactamente 3 tarjetas de campaña
    And no existe ningún encabezado de nivel 2 cuyo texto sea "Qué publica la clínica"

  @s28
  Scenario: El aviso de campaña no encontrada no reproduce el valor recibido
    Given el catálogo de demo tiene sus tres campañas
    When el visitante abre la dirección "/campanas?campana=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E"
    Then el elemento con rol "status" dice exactamente "No encontramos esa campaña de demostración."
    And el texto del contenido principal no contiene la cadena recibida en el parámetro
    And el contenido principal no contiene ninguna imagen añadida por ese valor
    And no se produce ningún error en la consola

  @s29
  Scenario: Un identificador vacío se trata como el listado, sin aviso de error
    Given el catálogo de demo tiene sus tres campañas
    When el visitante abre la dirección "/campanas?campana="
    Then el contenido principal tiene un encabezado de nivel 1 cuyo texto es exactamente "Campañas de prevención"
    And el contenido principal contiene exactamente 3 tarjetas de campaña
    And no existe ningún elemento con rol "status"

  @s30
  Scenario: Caso límite — con el catálogo vacío la página se renderiza sin tarjetas y lo dice
    Given el catálogo de demo no tiene ninguna campaña
    When el visitante abre la dirección "/campanas"
    Then el contenido principal tiene un encabezado de nivel 1 cuyo texto es exactamente "Campañas de prevención"
    And el contenido principal muestra el texto exacto "No hay ninguna campaña de demostración que mostrar."
    And el contenido principal no contiene ninguna tarjeta de campaña
    And no existe ningún encabezado de nivel 2 en el contenido principal
    And sigue existiendo el rol "banner" y el rol "contentinfo"

  @s31
  Scenario: Caso límite — si ninguna campaña del catálogo es válida se muestra el mismo aviso de vacío
    Given las tres campañas del catálogo de demo tienen el título vacío
    When el visitante abre la dirección "/campanas"
    Then el contenido principal muestra el texto exacto "No hay ninguna campaña de demostración que mostrar."
    And el contenido principal no contiene ninguna tarjeta de campaña
    And no existe ningún enlace cuyo nombre accesible empiece por "Ver la ficha de"

  @s32
  Scenario: Caso límite — una campaña sin título se descarta y el resto se sigue mostrando
    Given la campaña "Chequeo" del catálogo de demo tiene el título vacío
    When el visitante abre la dirección "/campanas"
    Then el contenido principal contiene exactamente 2 tarjetas de campaña
    And sus títulos son, en este orden, "Vacunaciones" y "Odontología"
    And ninguna tarjeta tiene el nombre accesible vacío
    And no existe ningún enlace cuyo destino sea "/campanas?campana=chequeo"

  @s33
  Scenario: Una campaña con precio hace fallar cerrada la construcción del catálogo
    Given una campaña del catálogo de demo declara el precio "49 €"
    When se construye el catálogo de campañas de la página
    Then la construcción lanza un error cuyo mensaje contiene "precio no confirmado"
    And el mensaje del error nombra la campaña afectada
    And no se renderiza ninguna tarjeta de campaña
    And no se renderiza ninguna ficha

  @s34
  Scenario: Una campaña con vigencia hace fallar cerrada la construcción del catálogo
    Given una campaña del catálogo de demo declara la vigencia "Hasta el 30 de septiembre"
    When se construye el catálogo de campañas de la página
    Then la construcción lanza un error cuyo mensaje contiene "vigencia no confirmada"
    And el mensaje del error nombra la campaña afectada
    And no se renderiza ninguna tarjeta de campaña

  @s35
  Scenario: Una campaña con plazas hace fallar cerrada la construcción del catálogo
    Given una campaña del catálogo de demo declara las plazas "40 plazas al mes"
    When se construye el catálogo de campañas de la página
    Then la construcción lanza un error cuyo mensaje contiene "plazas no confirmadas"
    And el mensaje del error nombra la campaña afectada
    And no se renderiza ninguna tarjeta de campaña

  @s36
  Scenario: Un punto que el cliente no publica hace fallar cerrada la construcción del catálogo
    Given la campaña "Vacunaciones" declara entre sus puntos "Vacuna polivalente con revisión incluida", que no aparece en el catálogo de servicios publicado por el cliente
    When se construye el catálogo de campañas de la página
    Then la construcción lanza un error cuyo mensaje contiene "punto no publicado"
    And el mensaje del error cita el punto rechazado
    And no se renderiza ninguna ficha

  @s37
  Scenario: Caso límite — un punto en blanco no pinta un elemento de lista vacío
    Given el bloque "Especialidades" declara un quinto punto que es una cadena en blanco
    When el visitante abre la dirección "/campanas?campana=odontologia"
    Then el bloque "Qué publica la clínica" muestra una lista con exactamente 4 elementos
    And ningún elemento de esa lista tiene el nombre accesible vacío

  @s38
  Scenario: Caso límite — una campaña cuyo bloque no publica puntos no muestra encabezado ni lista vacía
    Given el bloque "Especialidades" no publica ningún punto
    When el visitante abre la dirección "/campanas?campana=odontologia"
    Then el contenido principal tiene un encabezado de nivel 1 cuyo texto es exactamente "Odontología"
    And no existe ningún encabezado de nivel 2 cuyo texto sea "Qué publica la clínica"
    And el contenido principal no contiene ninguna lista vacía
    And sigue existiendo la región cuyo nombre accesible es "Datos pendientes de confirmar"

  @s39
  Scenario: Caso límite — una ficha sin otras campañas no muestra la sección «Otras campañas»
    Given el catálogo de demo declara una única campaña, "Vacunaciones"
    When el visitante abre la dirección "/campanas?campana=vacunaciones"
    Then el contenido principal tiene un encabezado de nivel 1 cuyo texto es exactamente "Vacunaciones"
    And no existe ningún encabezado de nivel 2 cuyo texto sea "Otras campañas"
    And el contenido principal no contiene ninguna tarjeta de campaña
    And sigue existiendo la región de navegación cuyo nombre accesible es "Ruta"

  @s40
  Scenario: Una campaña con duración hace fallar cerrada la construcción del catálogo
    Given una campaña del catálogo de demo declara la duración "30 min · una sola visita"
    When se construye el catálogo de campañas de la página
    Then la construcción lanza un error cuyo mensaje contiene "duración no confirmada"
    And el mensaje del error nombra la campaña afectada
    And no se renderiza ninguna tarjeta de campaña

  @s41
  Scenario: La decisión de suavizar el desplazamiento al abrir una ficha es una función pura de la preferencia de movimiento
    Given la lógica de desplazamiento de la ficha consulta la preferencia de movimiento del visitante
    When se calcula el comportamiento de desplazamiento para cada preferencia
    Then el resultado es, respectivamente, exactamente:
      | preferencia declarada      | comportamiento |
      | reducir el movimiento      | auto           |
      | sin preferencia declarada  | smooth         |
      | preferencia no consultable | auto           |
    And en ningún punto de la ficha se pide un desplazamiento con "smooth" sin haber consultado antes esa preferencia
