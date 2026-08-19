# FUENTE DEL COMPORTAMIENTO
# - Prototipo Claude Design «Veterinaria La Sierra.dc.html», sección id="galeria"
#   (marcado del carrusel), array GALERIA (9 entradas) y método desplazarGaleria(dir):
#   pista con overflow-x + scroll-snap y dos botones cuyo NOMBRE ACCESIBLE es
#   "Foto anterior" / "Foto siguiente", que desplazan la pista el ancho de una
#   tarjeta más la separación entre tarjetas. Esa INTERACCIÓN está aprobada y se
#   conserva íntegra.
# - project-spec.md, decisiones 1b (contenido de demo rotulado) y 9 (imágenes
#   locales, no de terceros); invariantes 3, 4 y 5 y modo de error «dato ausente →
#   no se renderiza el bloque».
# - feature_list.json, feature 8 «galeria» (4 criterios de aceptación).
# - docs/datos-galapavet.md: única fuente admitida de datos de negocio.
#
# QUÉ CAMBIA RESPECTO AL CONTRATO HEREDADO (docs/contrato-heredado/galeria.feature)
# 1. Origen de las imágenes. El prototipo servía las 9 fotos desde
#    images.pexels.com. Cada una es una petición automática a un tercero que filtra
#    la IP del visitante (RGPD/LSSI) y un punto de fallo ajeno. Decisión 9: pasan a
#    ser locales. Lo fija @s11, de forma medible sobre el origen declarado por cada
#    imagen.
# 2. Rotulado de demo. Los pies del prototipo («Nala y Coco · Primera vacunación»,
#    «Bruno · Alta tras cirugía de rodilla»…) describen pacientes inventados. Como
#    contenido de catálogo de la demo está permitido (decisión 1b), pero deja de
#    poder pasar por real: @s12 exige un aviso de demostración inequívoco y
#    asociado a la región, y @s13 exige que no quede en la sección ninguna
#    afirmación de que sean pacientes de Galapavet.
# 3. Se elimina el copy heredado «Pacientes reales que han pasado por consulta.
#    Publicadas siempre con permiso de sus familias.» Es una afirmación sobre el
#    negocio (decisión 1a) y no está verificada: el cliente no ha cedido ninguna
#    fotografía ni consta consentimiento de ninguna familia.
# 4. Se retira la aserción heredada «deben verse exactamente 9 fotografías». El 9
#    era el tamaño de un catálogo de demo, no un dato de negocio; clavarlo obliga a
#    tocar el contrato cuando el cliente sustituya las fotos. @s1 afirma la
#    correspondencia exacta catálogo ↔ figuras mostradas, que sí es medible y no
#    caduca.
# 5. Los pies de demo no pueden mencionar servicios que el cliente no publica
#    (el prototipo tenía «Peluquería y revisión de piel»; peluquería y exóticos son
#    invención del prototipo, y «urgencias 24 h» es falso: Galapavet cierra los
#    domingos). Lo fija @s14.
# 6. Los dos escenarios heredados de desplazamiento exigían «desplazamiento suave»
#    sin excepción. Se conservan (@s5, @s6) y se les añade el caso de
#    prefers-reduced-motion (@s7) y el de preferencia no consultable (@s8).
# 7. El prototipo, cuando no podía medir la tarjeta, desplazaba 300 px inventados.
#    Se sustituye por fallar cerrado: sin medida no hay desplazamiento (@s10).
# 8. La pista del prototipo era una zona desplazable sin foco de teclado ni nombre
#    accesible. @s3 y @s4 lo corrigen: es requisito de teclado, no de estilo.
# 9. Ningún Then se afirma sobre clases CSS ni sobre estilos: los tests corren con
#    los CSS Modules desactivados. Todo se afirma sobre rol accesible, nombre
#    accesible, atributos ARIA y estado observable de la pista.
#
# PENDIENTE
# - PENDIENTE: el cliente no ha cedido ni una sola fotografía real ni consentimiento
#   de las familias fotografiadas. Hasta que lo haga, la galería entera es
#   contenido de demostración y así debe leerse en pantalla.
# - PENDIENTE: los ficheros de imagen locales concretos (nombre, dimensiones y
#   textos alternativos definitivos) no existen aún en el repositorio; el catálogo
#   de demo se declara en la implementación y debe sustituirse antes de publicar.
# - PENDIENTE: la separación exacta entre tarjetas (18 px en el prototipo) se
#   re-mide en la feature tokens_marca. Este contrato solo exige que el paso de
#   desplazamiento sea «ancho de tarjeta + separación efectiva», nunca un literal.
#
# CORRECCIONES TRAS REVISIÓN ADVERSARIAL (18/08/2026)
# Ver progress/revision/VEREDICTO_galeria.md. Hallazgos CONFIRMADOS reparados:
# - @s9, @s10: las aserciones sobre el desplazamiento horizontal FÍSICO de la
#   pista (scrollLeft) no son medibles en jsdom (scrollBy con behavior:'smooth'
#   no llega a mover scrollLeft ahí, se implemente bien o mal). Por Decisión 11
#   de project-spec.md, esas cláusulas quedan declaradas explícitamente como
#   verificadas con navegador real (extensión Claude in Chrome / skill
#   browser-automation), fuera del gate de Vitest/Stryker.
# - @s12: el aviso de demostración pasa de paráfrasis a literal cerrado, con el
#   mismo patrón que campanas_portada.feature:108 y pagina_tienda.feature:191.
# - @s14: la cuarta cláusula (criterio no determinista pie→bloque) se sustituye
#   por dos negaciones literales más, citando los mismos rótulos de servicio
#   inventado que ya usa servicios.feature:255-256.
# - @s4: el When deja de acoplarse al recorrido de tabulador desde el inicio de
#   toda la landing; se acota a la pista, como accesibilidad.feature:276.
# - @s5: el When nombra explícitamente el cálculo del desplazamiento, para que
#   la aritmética no pueda quedar atrapada solo en el .tsx (Invariante 6).
# - @s1, @s2: el cuantificador del Given pasa de "al menos una entrada" a "al
#   menos dos", para que las comprobaciones de unicidad no pasen vacuamente.
# - @s16 (nuevo): cierra el hueco de que ningún escenario ejercitaba el
#   catálogo real de producción, sin doble — guarda anti-vacuidad mínima.
# - @s17 (nuevo): caso límite de entrada con nombre en blanco, análogo a
#   equipo.feature @s9, servicios.feature @s16 y faq.feature @s12.

Feature: Galería de fotografías de demostración
  Como visitante que quiere hacerse una idea del trato de la clínica
  Quiero recorrer la galería de fotografías
  Para ver el ambiente del centro antes de reservar, sabiendo qué es demostración.

  Background:
    Given la landing de Galapavet está renderizada

  @s1
  Scenario: Cada entrada del catálogo se muestra como una fotografía con texto alternativo
    Given un catálogo de galería con al menos dos entradas
    When el visitante llega a la sección "Galería"
    Then el número de figuras mostradas es exactamente el número de entradas del catálogo
    And cada figura contiene exactamente una imagen
    And el nombre accesible de cada imagen no está vacío
    And ninguna imagen tiene el mismo nombre accesible que otra

  @s2
  Scenario: Cada figura muestra el nombre y el pie de su entrada
    Given un catálogo de galería con al menos dos entradas
    When el visitante llega a la sección "Galería"
    Then el texto de cada figura contiene el nombre de su entrada del catálogo
    And el texto de cada figura contiene el pie de su entrada del catálogo
    And el pie de cada figura es el de su propia entrada y no el de otra

  @s3
  Scenario: La región y sus controles exponen nombre accesible
    Given un catálogo de galería con al menos una entrada
    When el visitante llega a la sección "Galería"
    Then existe una región cuyo nombre accesible contiene "Galería"
    And existe un botón cuyo nombre accesible es exactamente "Foto anterior"
    And existe un botón cuyo nombre accesible es exactamente "Foto siguiente"
    And ninguno de esos dos botones toma su nombre accesible únicamente del glifo visible

  @s4
  Scenario: La pista desplazable es alcanzable con el teclado
    Given un catálogo de galería con al menos una entrada
    When el visitante mueve el foco por teclado hasta la pista de fotografías
    Then la pista de fotografías recibe el foco
    And la pista de fotografías expone un nombre accesible no vacío

  @s5
  Scenario: El botón "Foto siguiente" desplaza la pista una tarjeta hacia el final
    Given una pista de fotografías cuya primera tarjeta tiene un ancho medible mayor que 0
    And el visitante no ha pedido menos movimiento
    When el visitante pulsa el botón "Foto siguiente" y se calcula el desplazamiento que este solicita a la pista
    Then se solicita a la pista un desplazamiento horizontal de exactamente el ancho de una tarjeta más la separación entre tarjetas
    And el signo del desplazamiento solicitado es positivo
    And el desplazamiento solicitado es suavizado

  @s6
  Scenario: El botón "Foto anterior" desplaza la pista una tarjeta hacia el principio
    Given una pista de fotografías cuya primera tarjeta tiene un ancho medible mayor que 0
    And la pista está desplazada al menos una tarjeta desde el principio
    And el visitante no ha pedido menos movimiento
    When el visitante pulsa el botón "Foto anterior"
    Then se solicita a la pista un desplazamiento horizontal de exactamente el ancho de una tarjeta más la separación entre tarjetas
    And el signo del desplazamiento solicitado es negativo
    And el desplazamiento solicitado es suavizado

  @s7
  Scenario: Con la preferencia de menos movimiento el desplazamiento es instantáneo
    Given una pista de fotografías cuya primera tarjeta tiene un ancho medible mayor que 0
    And el visitante ha pedido menos movimiento en su sistema
    When el visitante pulsa el botón "Foto siguiente"
    Then el desplazamiento solicitado no es suavizado
    And la distancia solicitada sigue siendo exactamente el ancho de una tarjeta más la separación entre tarjetas

  @s8
  Scenario: Si la preferencia de movimiento no se puede consultar se desplaza sin suavizado
    Given un entorno en el que la consulta de la preferencia de movimiento no está disponible
    And una pista de fotografías cuya primera tarjeta tiene un ancho medible mayor que 0
    When el visitante pulsa el botón "Foto siguiente"
    Then el desplazamiento solicitado no es suavizado
    And no se produce ningún error en la consola

  @s9
  Scenario: Pulsar "Foto anterior" estando ya al principio no mueve la pista ni inutiliza el control
    Given una pista de fotografías con su desplazamiento horizontal en 0
    When el visitante pulsa el botón "Foto anterior"
    Then el botón "Foto anterior" sigue habilitado y conserva su nombre accesible
    # Decisión 11 (project-spec.md): el desplazamiento horizontal FÍSICO de la
    # pista (scrollLeft) no es medible en jsdom -- scrollBy con
    # behavior:'smooth' no llega a moverlo, exista o no guarda correcta en la
    # implementación. Las tres cláusulas siguientes se verifican con
    # navegador real (extensión Claude in Chrome / skill browser-automation),
    # fuera del gate de Vitest/Stryker.
    And el desplazamiento horizontal de la pista sigue siendo 0
    And el desplazamiento horizontal de la pista nunca toma un valor negativo
    And la pista no salta al final del carrusel

  @s10
  Scenario: Sin tarjeta medible no se solicita ningún desplazamiento
    Given una pista de fotografías cuya primera tarjeta mide 0 de ancho
    When el visitante pulsa el botón "Foto siguiente"
    Then no se solicita ningún desplazamiento a la pista
    # Decisión 11 (project-spec.md): el desplazamiento horizontal FÍSICO de la
    # pista (scrollLeft) no es medible en jsdom. Esta cláusula se verifica con
    # navegador real (extensión Claude in Chrome / skill browser-automation),
    # fuera del gate de Vitest/Stryker.
    And el desplazamiento horizontal de la pista no cambia

  @s11
  Scenario: Todas las fotografías se sirven desde el propio sitio
    Given un catálogo de galería con al menos una entrada
    When el visitante llega a la sección "Galería"
    Then el origen declarado por cada imagen no empieza por "http://", por "https://" ni por "//"
    And ningún origen declarado por una imagen contiene "images.pexels.com"
    And ninguna imagen declara un conjunto de orígenes alternativos que apunte a otro dominio
    And la sección no contiene ningún marco embebido

  @s12
  Scenario: El contenido de la galería está rotulado como demostración
    Given un catálogo de galería con al menos una entrada
    When el visitante llega a la sección "Galería"
    Then la sección muestra un aviso visible cuyo texto es exactamente "Contenido de demostración. Estas fotografías y sus pies son de ejemplo, no fotografías reales de pacientes de Galapavet: la clínica todavía no ha cedido fotografías propias ni el consentimiento de las familias fotografiadas."
    And ese aviso es la descripción accesible de la región de la galería
    And el aviso se muestra siempre, sin que el visitante tenga que interactuar con nada

  @s13
  Scenario: La sección no afirma que las fotografías sean pacientes de Galapavet
    Given un catálogo de galería con al menos una entrada
    When el visitante llega a la sección "Galería"
    Then el texto de la sección no contiene "pacientes reales"
    And el texto de la sección no contiene "con permiso de sus familias"
    And ningún texto de la sección atribuye las fotografías a personas o animales concretos atendidos por Galapavet

  @s14
  Scenario: Los pies de demostración no mencionan servicios que el cliente no publica
    Given un catálogo de galería con al menos una entrada
    When el visitante llega a la sección "Galería"
    Then ningún pie de foto menciona "peluquería"
    And ningún pie de foto menciona "exóticos"
    And ningún pie de foto menciona "urgencias 24 h"
    And ningún pie de foto menciona "nutrición y etología"
    And ningún pie de foto menciona "microchip y viajes"

  @s15
  Scenario: Con el catálogo vacío la sección no se renderiza
    Given un catálogo de galería sin ninguna entrada
    When el visitante recorre la landing entera
    Then no existe ninguna región cuyo nombre accesible contenga "Galería"
    And no existe ningún botón llamado "Foto anterior" ni "Foto siguiente"
    And no se muestra ninguna figura de galería vacía ni ningún hueco reservado

  @s16
  Scenario: El catálogo de galería de producción no está vacío
    Given el catálogo de galería que exporta el módulo de producción, sin sustituirlo por ningún doble de test
    When el visitante llega a la sección "Galería"
    Then el número de entradas de ese catálogo de producción es mayor que 0
    And el número de figuras mostradas coincide con ese número de entradas

  @s17
  Scenario: Una entrada del catálogo con el nombre en blanco no se renderiza y no arrastra a las demás
    Given un catálogo de galería con tres entradas, la segunda de las cuales tiene el nombre accesible en blanco
    When el visitante llega a la sección "Galería"
    Then el número de figuras mostradas es exactamente 2
    And ninguna figura mostrada corresponde a la entrada con el nombre en blanco
    And las otras dos entradas se muestran con su nombre y su pie
