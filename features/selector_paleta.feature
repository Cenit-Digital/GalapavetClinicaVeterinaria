# FUENTE DEL COMPORTAMIENTO
# - Interacción: docs/contrato-heredado/selector_paleta.feature (destilado del
#   prototipo Claude Design «Veterinaria La Sierra.dc.html», bloque
#   `mostrarSelector` + constante `PALETAS`; el .dc.html original no está
#   archivado en este repositorio, solo su destilado en Gherkin, que es la
#   única fuente citable).
#   La INTERACCIÓN heredada está aprobada y se respeta en lo que ese destilado
#   fija: un botón circular flotante en la esquina inferior derecha «para
#   cambiar de paleta» (su @s1, línea 23) que abre un panel rotulado «Paleta
#   de color» (su @s3, línea 35) con una fila por variante con su nota y tres
#   muestras de color, marca de variante activa, aplicación inmediata a toda
#   la página mediante un atributo en el elemento raíz y persistencia en el
#   almacenamiento local del navegador. El nombre accesible «Cambiar paleta de
#   color» del botón flotante es NUEVO de este contrato: el destilado heredado
#   no fija un nombre accesible formal para ese botón, solo la descripción
#   visual citada arriba.
# - Decisión 8 de project-spec.md (variantes de la marca real + anti-destello).
# - Criterios de aceptación de la feature 14 de feature_list.json.
# - Colores de marca: docs/datos-galapavet.md §10 (muestreo de píxeles del logo).
#
# QUÉ CAMBIA RESPECTO AL CONTRATO HEREDADO (docs/contrato-heredado/selector_paleta.feature)
# 1. DATOS. Las 4 paletas heredadas («Confianza clínica», «Orgánica y cálida»,
#    «Alta gama» y «Relax & eco» — su @s3, líneas 36-37; ese destilado NO fija
#    qué matiz de color tiene cada una, así que aquí no se inventa ninguno) NO
#    son la marca del cliente y desaparecen por completo. En su lugar, 4
#    variantes de la marca REAL de Galapavet, incluida una oscura:
#      | id      | nombre               | nota                                    |
#      | marca   | Marca Galapavet      | Morado sobre claro                      |  ← por defecto
#      | lima    | Lima de superficie   | Superficie lima, texto oscuro encima    |
#      | verde   | Verde profundo       | Verde profundo sobre claro               |
#      | noche   | Marca en oscuro      | Marca sobre fondo oscuro (roles y tokens exactos: PENDIENTE, ver abajo) |
#    Los únicos colores admitidos son los verificados en datos-galapavet.md §10:
#    morado #77286B, lima #B4C718, verde profundo #48704B y blanco #FFFFFF.
#    La nota de «lima» sigue datos-galapavet.md §10.1: el lima NO alcanza 3:1
#    como texto ni como borde sobre blanco (1,89:1); su único uso apto es como
#    color de relleno/superficie, con texto oscuro encima (11,12:1 negro sobre
#    lima). «Lima protagonista» se descarta como nombre porque connota
#    precisamente el uso prohibido (texto o borde destacado).
#    La nota de «noche» no fija qué color hace de texto y cuál de fondo: esa
#    aritmética la cierra la puerta de contraste de `tokens_marca` (@s16), no
#    este fichero — ver PENDIENTE más abajo.
# 2. IDENTIFICADORES. El atributo del documento pasa de `data-tema` a
#    `data-variante` y la clave de almacenamiento de `vls-tema` a
#    `galapavet-variante`: los identificadores heredados nombran a la clínica
#    ficticia y quedarían escritos en el navegador de cada visitante real.
# 3. SE ELIMINA el escenario heredado @s2 («el selector puede desactivarse desde
#    la configuración»). Esa propiedad de diseño no tiene ningún consumidor en
#    esta web: es herencia muerta (patrón
#    `herencia-del-repo-base-es-deuda-muerta-hasta-que-un-uso-la-justifica`).
#    En su lugar se contrata el caso degenerado equivalente y sí observable:
#    catálogo de variantes vacío → no se renderiza el selector (@s16), coherente
#    con «dato ausente → no se renderiza el bloque» de project-spec.md.
# 4. MARCA DE ESTADO. El prototipo señalaba la variante activa con estilo en
#    línea (borde y fondo). Aquí el estado vive en atributos ARIA consultables
#    (`aria-expanded` en el botón flotante, `aria-pressed` en cada variante),
#    nunca en una clase CSS ni en un estilo: invariante 5 de project-spec.md, y
#    además los tests corren con los módulos CSS desactivados.
# 5. SE AÑADE el anti-destello (@s9 y @s10), ausente del contrato heredado:
#    la variante guardada se aplica ANTES del primer pintado con un script en
#    línea, espejado por una función pura testeable (patrón
#    `logica-pre-pintado-inline-se-espeja-en-gemelo-puro-testeable`).
# 6. SE AÑADEN los caminos de error que el contrato heredado no cubría:
#    valor desconocido (@s11), cadena vacía (@s12) y texto basura (@s13) en el
#    almacenamiento; almacenamiento que lanza al leer (@s14) y al escribir
#    (@s15). El atributo del documento nunca recibe un valor fuera del catálogo.
# 7. La nota heredada «confirmar con Pablo si el selector llega a producción»
#    queda RESUELTA por la Decisión 8: se conserva, porque como variaciones de
#    la marca del cliente sí tiene función en la web piloto.
#
# PENDIENTE
# - Los valores concretos de token de cada variante (fondo oscuro, superficies,
#   texto) y sus ratios de contraste NO se fijan aquí: los fija ÚNICAMENTE la
#   feature `tokens_marca`, con el contraste WCAG 2.2 AA calculado, no supuesto,
#   antes de dar la variante "noche" por completa. Este contrato solo fija
#   identificadores, rótulos y comportamiento, y no delega de vuelta ninguna
#   decisión de color a `tokens_marca` ni espera que esta se la remita a él: la
#   referencia entre ambos ficheros es de una sola dirección, de aquí hacia
#   `tokens_marca`, no circular. En particular, el hexadecimal del fondo de la
#   variante oscura no está verificado en docs/datos-galapavet.md y NO se
#   inventa en este fichero.
# - Consecuencia mecánica de la aritmética de contraste de docs/datos-galapavet.md
#   §10.1 aplicada al morado #77286B: contra el fondo más oscuro posible (negro
#   puro) el ratio máximo que alcanza es 2,30:1, por debajo del mínimo de 3:1 de
#   componente de interfaz; no existe ningún fondo más oscuro que el propio
#   morado contra el que este llegue a 3:1. La variante "noche" por tanto NO
#   puede usar el morado como texto ni como borde legible sobre el fondo
#   oscuro; solo como fondo o como superficie, igual que el lima. Los tokens
#   exactos que cumplan esto los fija `tokens_marca` @s16, no este fichero.
# - Cuál de las cuatro variantes adopta el cliente como definitiva es una
#   decisión suya posterior a la entrega del piloto; fuera del alcance.

Feature: Selector de variantes de la paleta de marca
  Como visitante o como cliente al que se le enseña el piloto
  Quiero conmutar entre las variantes de color de la marca de Galapavet
  Para ver toda la página con cada aplicación de la marca sin destellos ni
  perder mi elección entre visitas.

  @s1
  Scenario: El selector se ofrece cerrado al cargar la página
    Given un navegador sin ninguna preferencia de variante guardada
    When el visitante carga la página
    Then existe un botón con nombre accesible "Cambiar paleta de color"
    And ese botón tiene aria-expanded igual a "false"
    And no existe ningún grupo con nombre accesible "Paleta de color"

  @s2
  Scenario: Abrir el panel lista exactamente las cuatro variantes de marca
    Given el panel del selector está cerrado
    When el visitante pulsa el botón "Cambiar paleta de color"
    Then el botón "Cambiar paleta de color" pasa a tener aria-expanded igual a "true"
    And existe un grupo con nombre accesible "Paleta de color"
    And dentro de ese grupo hay exactamente 4 botones de variante
    And sus nombres accesibles contienen, uno cada uno, "Marca Galapavet", "Lima de superficie", "Verde profundo" y "Marca en oscuro"

  @s3
  Scenario: Volver a pulsar el botón flotante cierra el panel
    Given el panel del selector está abierto
    When el visitante pulsa el botón "Cambiar paleta de color"
    Then el botón "Cambiar paleta de color" pasa a tener aria-expanded igual a "false"
    And no existe ningún grupo con nombre accesible "Paleta de color"

  @s4
  Scenario: Las muestras de color no ensucian el nombre accesible de la variante
    Given un navegador sin ninguna preferencia de variante guardada
    When el visitante pulsa el botón "Cambiar paleta de color"
    Then cada botón de variante muestra 3 muestras de color
    And las 12 muestras están marcadas con aria-hidden igual a "true"
    And el nombre accesible de cada botón de variante empieza por el nombre de su variante

  @s5
  Scenario: Sin preferencia guardada la variante activa es la de marca
    Given un navegador sin ninguna preferencia de variante guardada
    When el visitante carga la página y abre el panel del selector
    Then el atributo data-variante del elemento raíz del documento vale exactamente "marca"
    And el botón "Marca Galapavet" tiene aria-pressed igual a "true"
    And los otros 3 botones de variante tienen aria-pressed igual a "false"

  @s6
  Scenario: Elegir una variante la aplica de inmediato y traslada la marca de activa
    Given el panel del selector está abierto con la variante "marca" activa
    When el visitante pulsa el botón de variante "Marca en oscuro"
    Then el atributo data-variante del elemento raíz del documento vale exactamente "noche"
    And el botón "Marca en oscuro" tiene aria-pressed igual a "true"
    And exactamente 1 botón de variante tiene aria-pressed igual a "true"

  @s7
  Scenario: Elegir una variante la guarda en el almacenamiento del navegador
    Given el panel del selector está abierto y el almacenamiento local está vacío
    When el visitante pulsa el botón de variante "Marca en oscuro"
    Then el almacenamiento local contiene, bajo la clave "galapavet-variante", el texto exacto "noche"
    And el almacenamiento local no contiene ninguna otra clave escrita por el selector

  @s8
  Scenario: La variante elegida se recuerda en la siguiente visita
    Given el almacenamiento local guarda el texto "verde" bajo la clave "galapavet-variante"
    When el visitante vuelve a cargar la página en el mismo navegador
    Then el atributo data-variante del elemento raíz del documento vale exactamente "verde"
    And al abrir el panel el botón "Verde profundo" tiene aria-pressed igual a "true"

  @s9
  Scenario: La variante guardada se resuelve antes del primer pintado
    Given el almacenamiento local guarda el texto "noche" bajo la clave "galapavet-variante"
    When se resuelve la variante inicial con la misma lógica que ejecuta el arranque previo al primer pintado
    Then el valor resuelto es exactamente "noche"
    And ese es el valor que se escribe en el atributo data-variante del elemento raíz

  @s10
  Scenario: El script de arranque precede al paquete de la aplicación
    Given el documento HTML generado por la construcción del sitio
    When se recorre el documento en orden de aparición
    Then el script en línea que escribe data-variante aparece antes que cualquier script del paquete de la aplicación
    And ese script no declara los atributos defer ni async
    And ese script no declara ningún src ni realiza ninguna petición de red

  @s11
  Scenario: Un identificador desconocido cae a la variante por defecto
    Given el almacenamiento local guarda el texto "tech" bajo la clave "galapavet-variante"
    When se resuelve la variante inicial
    Then el valor resuelto es exactamente "marca"
    And el atributo data-variante del elemento raíz nunca toma el valor "tech"

  @s12
  Scenario: Una preferencia vacía cae a la variante por defecto
    Given el almacenamiento local guarda el texto "" bajo la clave "galapavet-variante"
    When se resuelve la variante inicial
    Then el valor resuelto es exactamente "marca"
    And el atributo data-variante del elemento raíz vale exactamente "marca"

  @s13
  Scenario: Un valor corrupto no llega nunca al atributo del documento
    Given el almacenamiento local guarda el texto '{"tema":"noche' bajo la clave "galapavet-variante"
    When se resuelve la variante inicial
    Then el valor resuelto es exactamente "marca"
    And el valor escrito en el atributo data-variante es uno de los 4 identificadores del catálogo: "marca", "lima", "verde" o "noche"

  @s14
  Scenario: El almacenamiento que lanza al leer no impide cargar la página
    Given un navegador cuyo almacenamiento local lanza una excepción al leer
    When se resuelve la variante inicial
    Then el valor resuelto es exactamente "marca"
    And la resolución no propaga ninguna excepción

  @s15
  Scenario: El almacenamiento que lanza al escribir no rompe el cambio de variante
    Given un navegador cuyo almacenamiento local lanza una excepción al escribir
    And el panel del selector está abierto con la variante "marca" activa
    When el visitante pulsa el botón de variante "Marca en oscuro"
    Then el atributo data-variante del elemento raíz vale exactamente "noche"
    And el botón "Marca en oscuro" tiene aria-pressed igual a "true"
    And la interacción no propaga ninguna excepción
    And no se registra ningún error en la consola del navegador

  @s16
  Scenario: Sin variantes en el catálogo el selector no se renderiza
    Given un catálogo de variantes vacío
    When el visitante carga la página
    Then no existe ningún botón con nombre accesible "Cambiar paleta de color"
    And el atributo data-variante del elemento raíz vale exactamente "marca"
