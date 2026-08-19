# =============================================================================
# FUENTE DEL COMPORTAMIENTO
# =============================================================================
# Interacción heredada del prototipo de Claude Design "Veterinaria La Sierra.dc.html"
# (cabecera y menú móvil, líneas 76-121 del prototipo; decisión de rama en
# `renderVals()`: `const esMovil = s.ancho < 1120`). De ese prototipo se hereda
# SOLO la interacción (cabecera fija, fila horizontal de enlaces, botón
# hamburguesa con aria-expanded, panel desplegable que se cierra al navegar).
# Los DATOS del prototipo son de una clínica FICTICIA y no se implementan.
# Datos de negocio: docs/datos-galapavet.md §1 (nombre "Galapavet", descriptor
# "Centro integral veterinario"). Decisiones: project-spec.md, Decisión 2.
# Criterios de aceptación: feature_list.json, feature id 3.
#
# =============================================================================
# QUÉ CAMBIA RESPECTO AL CONTRATO HEREDADO (docs/contrato-heredado/, 7 escenarios)
# =============================================================================
# 1. NOMBRE REAL. "Veterinaria La Sierra" → "Galapavet", con el descriptor real
#    "Centro integral veterinario" (docs/datos-galapavet.md §1). El heredado @s7
#    afirmaba el nombre ficticio.
#
# 2. DESAPARECE TODO RASTRO DE URGENCIAS EN LA CABECERA (Decisión 2 del cliente,
#    17/08/2026). Se eliminan el botón rojo "Urgencias" de la navegación de
#    escritorio y el botón "Urgencias 24 h · 640 22 11 90" del menú móvil. Con
#    ellos caen los escenarios heredados @s5 y @s6, y la línea de @s1 y @s3 que
#    los afirmaba. Motivo doble: (a) Galapavet cierra los domingos y no presta
#    urgencias 24 h — anunciarlo sería falso (docs/datos-galapavet.md §3 y §7);
#    (b) el teléfono `640 22 11 90` del heredado es un número inventado que no
#    pertenece al cliente. El teléfono real de urgencias fuera de horario vive
#    en la feature `informacion_contacto` y en el pie, con su rótulo real, NUNCA
#    en la cabecera. @s13 es la regresión que lo vigila.
#
# 3. QUÉ OCUPA EL HUECO DEL BOTÓN ROJO: nada. La navegación NO gana un acceso
#    nuevo a contacto, porque ya lo tenía: en el prototipo, el botón rojo
#    "Urgencias" apuntaba a `#contacto` (href="#contacto"), exactamente el mismo
#    destino que el enlace "Contacto" que ya está en la lista de navegación.
#    Suprimirlo no pierde ni un destino: solo elimina un reclamo duplicado y
#    falso. Añadir en su lugar un CTA nuevo (p. ej. "Reservar cita" destacado)
#    sería inventar interacción que el humano no ha aprobado; "Reservar" ya es
#    el primer enlace de la navegación. La cabecera queda con 8 destinos y cero
#    botones de acción.
#
# 4. DESTINOS DE ESTE PROYECTO. Las tres subpáginas dejan de ser ficheros
#    sueltos del prototipo (`./Campanas.dc.html`, `./Blog.dc.html`,
#    `./Tienda.dc.html`) y pasan a ser rutas de esta web: `/campanas`, `/blog`,
#    `/tienda`. Las secciones de la landing conservan sus anclas.
#
# 5. EL PUNTO DE CORTE (BREAKPOINT) NO SE HEREDA. El valor 1120 px del heredado
#    es una medida tomada sobre una fila de 9 elementos de una web ajena, y esta
#    cabecera tiene 8 (desapareció el botón rojo) y un rótulo de marca distinto.
#    La memoria organizacional de la agencia documenta que un punto de corte
#    heredado sin volver a medir ya partió titulares en móvil en un proyecto
#    anterior. Por eso: @s1 ancla contra un LITERAL el valor que declara ESTE
#    proyecto (y afirma explícitamente que no es 1120), y todos los demás
#    escenarios de rama se expresan respecto a "el valor declarado", nunca
#    repitiendo la cifra. Si al medir hay que mover el valor, cambia UN literal
#    en UN escenario y el resto del contrato sigue en pie.
#
# 6. CASO LÍMITE EXACTO, QUE EL HEREDADO DEJABA AMBIGUO (decía "1120 o más" y
#    "menor de 1120" en escenarios distintos, sin nombrar la frontera): la regla
#    de este contrato es UNA y sin ambigüedad — es rama MÓVIL si y solo si el
#    ancho es ESTRICTAMENTE MENOR que el valor declarado. En el valor exacto se
#    muestra la rama de ESCRITORIO (@s2), y un píxel por debajo la de MÓVIL
#    (@s3). Coincide con la decisión del prototipo (`ancho < 1120`).
#
# 7. AFIRMACIONES SOBRE PRESENCIA, NO SOBRE ESTILO. Las ramas se afirman como
#    "está / no está presente en el árbol accesible", nunca como "se ve" ni
#    sobre clases CSS: este repositorio corre los tests con los CSS Modules
#    desactivados, así que una rama ocultada solo por media query sería
#    indistinguible de una visible y el contrato no sería verificable. En
#    consecuencia, la cabecera renderiza UNA sola rama cada vez.
#
# 8. AÑADIDO DE ACCESIBILIDAD SOBRE EL HEREDADO: el botón de menú declara
#    `aria-controls` apuntando al panel (@s7). El heredado solo exigía
#    `aria-expanded`. Es un atributo ARIA consultable, no un cambio de
#    interacción.
#
# =============================================================================
# PENDIENTE
# =============================================================================
# - PENDIENTE: el valor de 1024 px de @s1 es una DECLARACIÓN PROVISIONAL de este
#   proyecto, no una medida. Debe MEDIRSE en navegador real durante la
#   implementación, con la fila definitiva (logotipo + descriptor + 8 enlaces) y
#   con la tipografía de marca ya cargada, buscando el ancho mínimo al que la
#   fila no se parte ni desborda. Si la medida no da 1024, se corrige el literal
#   de @s1 y solo ese; ningún otro escenario repite la cifra.
# - PENDIENTE: el nombre accesible exacto del enlace del logotipo depende de si
#   el descriptor queda dentro del enlace o fuera. El contrato exige (@s12) que
#   el nombre accesible contenga "Galapavet" y que el destino sea el inicio; el
#   texto exacto se cierra en implementación.
# - No se contrata la posición fija/sticky de la cabecera: es estilo puro y con
#   los CSS desactivados en test no es afirmable. Se verifica a ojo en la puerta
#   de accesibilidad, no aquí.

Feature: Cabecera con navegación principal y menú móvil
  Como visitante de la web de Galapavet
  Quiero llegar a cualquier sección o subpágina desde la cabecera, en móvil y en escritorio
  Para moverme por la web sin hacer scroll a ciegas ni volver atrás

  Background:
    Given el visitante está en cualquier punto de la landing de Galapavet

  @s1
  Scenario: Este proyecto declara su propio punto de corte y no hereda el ajeno
    Given que este proyecto declara un único punto de corte para la navegación
    When se consulta el valor declarado del punto de corte
    Then el valor declarado es exactamente 1024 píxeles
    And el valor declarado no es 1120 píxeles, que era el punto de corte del prototipo ajeno

  @s2
  Scenario: En el ancho exacto del punto de corte se muestra la rama de escritorio
    Given el ancho de la ventana es exactamente el valor declarado del punto de corte
    When el visitante mira la cabecera
    Then existe una región de navegación cuyo nombre accesible es "Navegación principal"
    And no existe ningún botón cuyo nombre accesible sea "Abrir menú"

  @s3
  Scenario: Un píxel por debajo del punto de corte se muestra la rama móvil
    Given el ancho de la ventana es exactamente un píxel menor que el valor declarado del punto de corte
    When el visitante mira la cabecera
    Then no existe ninguna región de navegación en la cabecera
    And existe un botón cuyo nombre accesible es "Abrir menú"

  @s4
  Scenario: En escritorio se ofrecen los ocho destinos en horizontal y en orden
    Given el ancho de la ventana es igual o mayor que el valor declarado del punto de corte
    When el visitante mira la cabecera
    Then la región de navegación "Navegación principal" contiene exactamente 8 enlaces
    And los nombres accesibles de esos enlaces, en orden, son "Reservar", "Servicios", "Campañas", "Equipo", "Blog", "Contacto", "FAQ" y "Tienda"
    And no existe ningún botón cuyo nombre accesible sea "Abrir menú"

  @s5
  Scenario: Cada enlace de la navegación de escritorio apunta a su destino
    Given el ancho de la ventana es igual o mayor que el valor declarado del punto de corte
    When el visitante mira los destinos de la navegación principal
    Then cada enlace apunta exactamente al destino indicado
      | enlace    | destino    |
      | Reservar  | #reservar  |
      | Servicios | #servicios |
      | Campañas  | /campanas  |
      | Equipo    | #equipo    |
      | Blog      | /blog      |
      | Contacto  | #contacto  |
      | FAQ       | #faq       |
      | Tienda    | /tienda    |

  @s6
  Scenario: Por debajo del punto de corte no hay fila horizontal y el botón de menú anuncia que está cerrado
    Given el ancho de la ventana es menor que el valor declarado del punto de corte
    When el visitante mira la cabecera
    Then no existe ninguna región de navegación en la cabecera
    And existe un botón cuyo nombre accesible es "Abrir menú" con el atributo "aria-expanded" en "false"
    And no existe ningún enlace de navegación en la cabecera

  @s7
  Scenario: Abrir el menú móvil despliega los mismos ocho destinos
    Given el ancho de la ventana es menor que el valor declarado del punto de corte
    And el menú móvil está cerrado
    When el visitante pulsa el botón "Abrir menú"
    Then el atributo "aria-expanded" del botón pasa a "true"
    And el atributo "aria-controls" del botón identifica al panel desplegado, y ese panel existe en el documento
    And el panel contiene exactamente 8 enlaces, cuyos nombres accesibles y destinos son los mismos que los de la navegación de escritorio, en el mismo orden
    And ningún elemento del panel tiene un nombre accesible que contenga "Urgencias"

  @s8
  Scenario: Volver a pulsar el botón cierra el menú móvil
    Given el ancho de la ventana es menor que el valor declarado del punto de corte
    And el menú móvil está abierto
    When el visitante pulsa el botón "Abrir menú"
    Then el atributo "aria-expanded" del botón vuelve a "false"
    And el panel de enlaces deja de existir en el documento

  @s9
  Scenario: Pulsar un enlace de sección en el menú móvil navega y cierra el menú
    Given el ancho de la ventana es menor que el valor declarado del punto de corte
    And el menú móvil está abierto
    When el visitante pulsa el enlace "Servicios" del panel
    Then el navegador queda situado en el destino "#servicios"
    And el atributo "aria-expanded" del botón vuelve a "false"
    And el panel de enlaces deja de existir en el documento

  @s10
  Scenario: Pulsar un enlace de subpágina en el menú móvil navega y cierra el menú
    Given el ancho de la ventana es menor que el valor declarado del punto de corte
    And el menú móvil está abierto
    When el visitante pulsa el enlace "Tienda" del panel
    Then el navegador queda situado en el destino "/tienda"
    And el atributo "aria-expanded" del botón vuelve a "false"
    And el panel de enlaces deja de existir en el documento

  @s11
  Scenario: Ensanchar la ventana con el menú abierto no deja el panel colgado
    Given el ancho de la ventana es menor que el valor declarado del punto de corte
    And el menú móvil está abierto
    When el visitante ensancha la ventana hasta el valor declarado del punto de corte
    Then el panel de enlaces deja de existir en el documento
    And no existe ningún botón cuyo nombre accesible sea "Abrir menú"
    And existe una región de navegación cuyo nombre accesible es "Navegación principal" con sus 8 enlaces

  @s12
  Scenario: El logotipo lleva al inicio y rotula al cliente real
    When el visitante mira el bloque de marca de la cabecera
    Then existe un enlace cuyo nombre accesible contiene "Galapavet" y cuyo destino es "#inicio"
    And en la cabecera aparece el texto "Centro integral veterinario"
    And en la cabecera no aparece el texto "Veterinaria La Sierra"

  @s13
  Scenario: La cabecera no anuncia urgencias ni contiene teléfonos
    Given el ancho de la ventana es igual o mayor que el valor declarado del punto de corte
    When el visitante mira la cabecera completa
    Then el texto de la cabecera no contiene "Urgencias"
    And el texto de la cabecera no contiene "24 h"
    And el texto de la cabecera no contiene "640 22 11 90"
    And ningún enlace de la cabecera tiene un destino que empiece por "tel:"

  @s14
  Scenario: Si el ancho de la ventana no es medible se cae a la rama móvil
    Given el ancho de la ventana no es un número positivo, por no haberse medido todavía
    When el visitante mira la cabecera
    Then existe un botón cuyo nombre accesible es "Abrir menú" con el atributo "aria-expanded" en "false"
    And no existe ninguna región de navegación en la cabecera

  @s15
  Scenario: Sin destinos de navegación no se renderiza ninguna navegación vacía
    Given la lista de destinos de navegación está vacía
    When el visitante mira la cabecera
    Then no existe ninguna región de navegación en la cabecera
    And no existe ningún botón cuyo nombre accesible sea "Abrir menú"
    And sigue existiendo el enlace del logotipo cuyo destino es "#inicio"
