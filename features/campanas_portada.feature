# FUENTE DEL COMPORTAMIENTO
#   - Prototipo Claude Design «Veterinaria La Sierra.dc.html», sección id="campanas" (líneas
#     ~183-206 del prototipo y el array `campanas` del script, líneas ~731-735). De ahí se hereda
#     LA INTERACCIÓN, que está aprobada: bloque de portada con antetítulo, encabezado, texto
#     introductorio y un enlace de acción a la página de campañas, junto a una rejilla de tarjetas
#     en la que CADA TARJETA ENTERA es un enlace a esa misma página, con imagen, distintivo de
#     estado y título.
#   - project-spec.md → Decisión 1(b): las tarjetas de campaña son «contenido editorial y de
#     catálogo de la demo», se construyen como DEMO ROTULADA COMO TAL, sin precios fabricados.
#   - project-spec.md → Decisión 1(a): un PRECIO es una afirmación sobre el negocio. Sin dato
#     verificado, no se publica.
#   - project-spec.md → «Modos de error comunes»: dato ausente → no se renderiza el bloque, no se
#     rellena con un valor plausible; dato inválido en la fuente → se falla cerrado, no a medias.
#   - project-spec.md → Decisión 9 e Invariante 3: cero peticiones automáticas a terceros; las
#     imágenes se sirven en local.
#   - feature_list.json → feature 9 `campanas_portada`, sus 4 criterios de aceptación.
#   - Contrato heredado: docs/contrato-heredado/campanas.feature (5 escenarios).
#
# DATOS: los títulos de las tres tarjetas son literales de docs/datos-galapavet.md §5, es decir,
# servicios que Galapavet SÍ presta y publica:
#   «Vacunaciones» ... §5.3 Medicina general
#   «Chequeo» ....... §5.3 Medicina general
#   «Odontología» ... §5.5 Especialidades (y también §5.1 Cirugía y anestesia)
# No se usa ningún otro dato de negocio en esta sección: ni precio, ni fecha, ni plazas, ni
# teléfono, ni valoración.
#
# QUÉ CAMBIA RESPECTO AL CONTRATO HEREDADO Y POR QUÉ
#   La INTERACCIÓN se conserva íntegra: tarjeta-enlace + enlace de acción, ambos a la página de
#   campañas (heredado @s4 y @s5 → aquí @s11 y @s12). Lo que se sustituye son los DATOS.
#   - Heredado @s1 («cada tarjeta debe mostrar su imagen, su estado, su vigencia, su título y su
#     precio») se REESCRIBE: desaparecen los campos «vigencia» y «precio». Galapavet no ha
#     confirmado ninguna campaña (docs/datos-galapavet.md §7: «Campañas con precios (49 €, −25 %, 75 €) → NO
#     VERIFICABLE, no publicadas»; §9: precios pendientes del cliente). Publicar un precio sobre un
#     negocio real sin que el negocio lo haya fijado es exactamente lo que prohíbe la Decisión 1.
#   - Heredado @s2 (precio «49 €» con la nota «con revisión incluida») se ELIMINA: los dos datos
#     son invención del prototipo. En su lugar, @s6 y @s9 convierten la ausencia de precio en una
#     condición exigible y falible.
#   - Heredado @s3 (estado «Plazas limitadas», vigencia «Mayores de 8 años») se ELIMINA: anunciar
#     escasez de plazas de una campaña inexistente es una afirmación comercial falsa. El campo
#     «estado» de la interacción SE CONSERVA, pero su único valor admitido pasa a ser la marca de
#     demostración, que es lo único cierto que ese distintivo puede decir hoy.
#   - Del texto de cabecera heredado desaparecen «Prevención a precio de campaña» y «Cada trimestre
#     abrimos una campaña de salud con precio cerrado y plazas limitadas»: ambas afirman una
#     política comercial (periodicidad, precio cerrado, plazas) que el cliente no ha declarado.
#   - El rótulo del enlace de acción deja de ser «Ver campañas activas →»: «activas» afirma que hay
#     campañas en vigor. Pasa a ser «Ver campañas», y la flecha, si se dibuja, es decorativa y no
#     entra en el nombre accesible.
#   - El destino «./Campanas.dc.html» del prototipo (un fichero suelto de Claude Design) se
#     sustituye por la ruta «/campanas» de esta web, que es la que implementa la feature 16
#     `pagina_campanas`. Es una convención de ruta del proyecto, no un dato del cliente.
#   - Las imágenes remotas de Pexels del prototipo se sustituyen por imágenes locales (Decisión 9).
#
# TEXTO LITERAL DEL AVISO DE DEMO (el `tdd_craftsman` lo copia tal cual al test, patrón
# `doble-de-test-anclado-al-literal-no-al-simbolo`):
#   "Contenido de demostración. Galapavet no ha confirmado ninguna campaña: estas tarjetas muestran el
#   formato sobre servicios que la clínica sí presta. Precio, vigencia y condiciones están
#   pendientes de confirmar con la clínica."
#
# PENDIENTE (no verificado — ningún escenario lo afirma como hecho del negocio)
#   - PENDIENTE: el cliente NO ha confirmado ninguna campaña, ni su precio, ni su vigencia, ni sus
#     condiciones, ni el número de plazas. Mientras siga así, @s9 y @s10 obligan a fallar cerrado si
#     alguien mete un precio o una fecha en el catálogo. El día que el cliente confirme una campaña
#     real, este contrato se reabre: hoy la prohibición es deliberada, no un olvido.
#   - PENDIENTE: las fotografías concretas de cada tarjeta. El contrato solo exige que su origen sea
#     local (@s13) y que la imagen no aporte texto al nombre accesible del enlace (@s5); qué se ve
#     en la foto queda a decisión de diseño.
#   - PENDIENTE: la ruta «/campanas» es convención de este proyecto (feature 16). Si el proyecto
#     cambia el enrutado, @s11 y @s12 se actualizan con él.
#   - Fuera de alcance: el contenido de la propia página de campañas, que pertenece a la feature 16
#     `pagina_campanas`. Aquí solo se verifica el destino del enlace.

Feature: Campañas de salud destacadas en la portada
  Como visitante que llega a la portada
  Quiero ver qué campañas de prevención puede ofrecer la clínica y llegar a su página
  Para saber qué hay disponible sin que se me anuncie ningún precio ni ninguna fecha que la clínica no haya confirmado.

  Background:
    Given el catálogo de demo declara tres campañas construidas sobre servicios que Galapavet sí presta, tituladas "Vacunaciones", "Chequeo" y "Odontología"
    And ninguna de esas tres campañas declara precio ni vigencia
    And el visitante está en la portada, con la sección de campañas renderizada

  @s1
  Scenario: La sección se anuncia como una región con su encabezado
    Given la portada está renderizada
    When se busca la región cuyo nombre accesible es "Campañas de prevención"
    Then existe exactamente una región con ese nombre accesible
    And dentro de ella hay un encabezado de nivel 2 cuyo texto es exactamente "Campañas de prevención"

  @s2
  Scenario: Se muestra una tarjeta por cada campaña del catálogo de demo
    Given el catálogo de demo tiene tres campañas
    When se listan las tarjetas de campaña de la sección
    Then hay exactamente 3 tarjetas
    And sus títulos son exactamente "Vacunaciones", "Chequeo" y "Odontología", en ese orden
    And cada uno de esos tres títulos es un servicio publicado por el cliente

  @s3
  Scenario: Cada tarjeta muestra su estado, y el único estado admitido es la marca de demostración
    Given las tres tarjetas están renderizadas
    When se lee el estado de cada tarjeta
    Then cada una de las 3 tarjetas muestra el texto exacto "Demostración"
    And ninguna tarjeta muestra un estado distinto de "Demostración"

  @s4
  Scenario: El aviso de contenido de demostración es visible y describe la sección
    Given la sección de campañas está renderizada
    When se lee el aviso de la sección y la descripción accesible de la región
    Then el aviso visible es exactamente "Contenido de demostración. Galapavet no ha confirmado ninguna campaña: estas tarjetas muestran el formato sobre servicios que la clínica sí presta. Precio, vigencia y condiciones están pendientes de confirmar con la clínica."
    And la descripción accesible de la región "Campañas de prevención" es ese mismo texto

  @s5
  Scenario: El nombre accesible de cada tarjeta lleva su título y la marca de demostración
    Given las tres tarjetas están renderizadas
    When se lee el nombre accesible del enlace de la tarjeta "Vacunaciones"
    Then el nombre accesible contiene "Vacunaciones"
    And el nombre accesible contiene "Demostración"
    And la imagen de esa tarjeta tiene texto alternativo vacío, de modo que no aporta ninguna palabra al nombre accesible del enlace

  @s6
  Scenario: Ninguna tarjeta muestra un precio
    Given las tres tarjetas están renderizadas
    When se lee todo el texto de la sección de campañas
    Then ese texto no contiene el carácter "€"
    And ese texto no contiene la cadena "EUR"
    And ese texto no contiene el carácter "%"
    And ninguna tarjeta expone un campo de precio

  @s7
  Scenario: Ninguna tarjeta muestra fecha ni periodo de vigencia
    Given las tres tarjetas están renderizadas
    When se lee todo el texto de la sección de campañas
    Then ese texto no contiene ninguno de los doce nombres de mes en español
    And ese texto no contiene la cadena "Hasta el"
    And ese texto no contiene ninguna secuencia con el formato "dd/mm/aaaa" ni ningún número de cuatro cifras que empiece por "20"
    And ninguna tarjeta expone un campo de vigencia

  @s8
  Scenario: Ninguna tarjeta afirma disponibilidad, escasez ni política comercial
    Given las tres tarjetas están renderizadas
    When se lee todo el texto de la sección de campañas
    Then ese texto no contiene ninguna de las cadenas "Activa", "Plazas limitadas", "plazas", "precio cerrado" ni "descuento"
    And ese texto no contiene la cadena "24 h"

  @s9
  Scenario: Una campaña con precio hace fallar la construcción de la sección
    Given una campaña del catálogo de demo declara el precio "49 €"
    When se construye el modelo de la sección de campañas
    Then la construcción lanza un error cuyo mensaje contiene "precio no confirmado"

  @s10
  Scenario: Una campaña con vigencia hace fallar la construcción de la sección
    Given una campaña del catálogo de demo declara la vigencia "Hasta el 30 de septiembre"
    When se construye el modelo de la sección de campañas
    Then la construcción lanza un error cuyo mensaje contiene "vigencia no confirmada"

  @s11
  Scenario: Cada tarjeta entera enlaza a la página de campañas
    Given las tres tarjetas están renderizadas
    When se lee el destino del enlace de la tarjeta "Odontología"
    Then el destino es exactamente "/campanas"
    And los destinos de las 3 tarjetas son todos exactamente "/campanas"

  @s12
  Scenario: El enlace de acción de la sección lleva a la página de campañas
    Given la sección de campañas está renderizada
    When se lee el enlace cuyo nombre accesible es exactamente "Ver campañas"
    Then su destino es exactamente "/campanas"
    And su nombre accesible no contiene la palabra "activas"
    And su nombre accesible no contiene el carácter "→"

  @s13
  Scenario: Las imágenes de las tarjetas se sirven en local
    Given las tres tarjetas están renderizadas
    When se leen los orígenes de las imágenes de las 3 tarjetas
    Then ningún origen empieza por "http://", por "https://" ni por "//"
    And ningún origen contiene "pexels"

  @s14
  Scenario: Una campaña sin imagen sigue mostrando su tarjeta
    Given una campaña del catálogo de demo no declara imagen
    When se renderiza la sección de campañas
    Then esa tarjeta se muestra con su título y con su estado "Demostración"
    And esa tarjeta no contiene ninguna imagen

  @s15
  Scenario: Con el catálogo de demo vacío no se renderiza la sección
    Given el catálogo de demo no tiene ninguna campaña
    When se renderiza la portada
    Then no existe ninguna región cuyo nombre accesible sea "Campañas de prevención"
    And no existe ningún enlace cuyo nombre accesible sea "Ver campañas"

  @s16
  Scenario: Una campaña sin título se descarta y el resto se sigue mostrando
    Given la campaña "Chequeo" del catálogo de demo tiene el título vacío
    When se renderiza la sección de campañas
    Then hay exactamente 2 tarjetas
    And sus títulos son exactamente "Vacunaciones" y "Odontología", en ese orden
    And ninguna tarjeta tiene el nombre accesible vacío

  @s17
  Scenario: Si ninguna campaña del catálogo es válida no se renderiza la sección
    Given las tres campañas del catálogo de demo tienen el título vacío
    When se renderiza la portada
    Then no existe ninguna región cuyo nombre accesible sea "Campañas de prevención"
    And no existe ninguna tarjeta de campaña

  @s18
  Scenario: Un dato de campaña inválido deja la portada sin ninguna tarjeta de campaña
    Given una campaña del catálogo de demo declara el precio "49 €"
    When se renderiza la portada
    Then no existe ninguna región cuyo nombre accesible sea "Campañas de prevención"
    And no existe ninguna tarjeta de campaña

  @s19
  Scenario: El modelo de la sección de campañas descarta las entradas sin título
    Given la campaña "Chequeo" del catálogo de demo tiene el título vacío
    When se construye el modelo de la sección de campañas
    Then el modelo contiene exactamente 2 entradas
    And sus títulos son exactamente "Vacunaciones" y "Odontología", en ese orden

  @s20
  Scenario: El modelo de la sección de campañas queda vacío si ninguna entrada tiene título
    Given las tres campañas del catálogo de demo tienen el título vacío
    When se construye el modelo de la sección de campañas
    Then el modelo no contiene ninguna entrada

  @s21
  Scenario: Una vigencia inválida deja la portada sin ninguna tarjeta de campaña
    Given una campaña del catálogo de demo declara la vigencia "Hasta el 30 de septiembre"
    When se renderiza la portada
    Then no existe ninguna región cuyo nombre accesible sea "Campañas de prevención"
    And no existe ninguna tarjeta de campaña
