# FUENTE DEL COMPORTAMIENTO
# - Interacción: Claude Design — "Veterinaria La Sierra.dc.html", sección id="inicio"
#   (líneas 125-149): píldora de ubicación, titular, párrafo descriptivo, dos
#   botones (primario ancla a #reservar, secundario enlace tel:) y una franja
#   inferior separada por una línea. Esa ESTRUCTURA y esa INTERACCIÓN están
#   aprobadas y se conservan.
# - Datos: docs/datos-galapavet.md §1 (localidad), §2 (teléfono 1), §3 (horario),
#   §5 (los cinco bloques de servicio reales), §7 (lo que NO existe).
# - Decisiones: project-spec.md Decisión 1 (dos clases de contenido), Decisión 2
#   (se elimina todo el reclamo «Urgencias 24 h»), Decisión 9 (nada de terceros),
#   Decisión 11 (cláusulas no medibles en jsdom se verifican con navegador real,
#   fuera del gate de Vitest/Stryker, declarado explícitamente en el escenario),
#   invariantes 2 (fuente única), 4 (estado base visible) y feature_list.json id 4.
#
# QUÉ CAMBIA RESPECTO AL CONTRATO HEREDADO (docs/contrato-heredado/hero.feature)
# 1. @s1 heredado — la ubicación "Miraflores de la Sierra · Madrid" es de una
#    clínica FICTICIA (§7). Se sustituye por la localidad real: "Galapagar · Madrid".
#    El titular "Cuidamos la salud y la felicidad de tu mascota" se conserva: no
#    afirma ningún hecho sobre el negocio ni ningún servicio, así que no cae en la
#    clase (a) de la Decisión 1.
# 2. @s1 heredado — el texto descriptivo prometía "urgencias 24 h". FALSO (§3, §7:
#    Galapavet cierra domingos). Se reescribe con los cinco bloques que el cliente
#    sí publica (§5) y se prohíbe explícitamente la palabra "urgencias" y el
#    literal "24 h" dentro del hero.
# 3. @s3 heredado — el botón secundario "Urgencias 24 h" hacia tel:+34640221190
#    desaparece por partida doble: el número es falso (§7) y el reclamo también
#    (Decisión 2). Se sustituye por el acceso telefónico real al teléfono 1
#    verificado, 91 082 92 67, rotulado como lo que es: una llamada a la clínica.
#    El teléfono de urgencias fuera de horario (91 851 13 93) NO aparece aquí:
#    vive en `informacion_contacto` con su rótulo real, y sacarlo al hero
#    reconstruiría el bloque destacado que la Decisión 2 suprime.
# 4. @s4 heredado — ELIMINADO POR COMPLETO. "+12 años cuidando la sierra",
#    "8.400 mascotas en ficha", "24 h urgencias" y "4,9 ★ · 327 reseñas" son las
#    cuatro inventadas o falsas (§7); la valoración real es 4,6 ★ · 189 reseñas y
#    es un dato VIVO que §8 desaconseja hornear. En su lugar, la misma franja
#    inferior muestra el HORARIO REAL (§3), transcrito literalmente: es el único
#    hecho verificado que responde a la pregunta que un visitante trae al hero
#    ("¿cuándo puedo ir?"), refuerza el «dónde y cuándo» que pide project-spec.md
#    para esta sección y, al decir "Domingos: Cerrado", cierra por diseño la
#    puerta al reclamo de 24 h.
# 5. Se añaden los caminos de error que el heredado no cubría (dato ausente, dato
#    no normalizable, franja vacía) y la puerta anti-terceros de la Decisión 9.
# 6. REPARACIÓN 18/08/2026 (revisión adversarial, ver
#    progress/revision/VEREDICTO_hero.md):
#    (a) Se retira el antiguo @s12 «con movimiento reducido el contenido del hero
#    sigue siendo accesible»: su Given activaba prefers-reduced-motion pero
#    ningún Then dependía de esa preferencia, así que repetía en vacío las
#    aserciones de contenido de @s1/@s4-@s5/@s6. El hero no cablea ninguna
#    lógica propia que ramifique por movimiento reducido (a diferencia del
#    carrusel de `galeria.feature`, que sí decide «suavizado» frente a
#    «instantáneo» en un módulo puro): el invariante 4 (estado base visible)
#    para esta sección ya lo audita de forma transversal
#    `accesibilidad.feature` @s19-@s22 sobre las seis páginas, Landing incluida.
#    (b) @s13 solo inspeccionaba atributos DOM "src"/"srcset", un hueco real
#    para la futura imagen de fondo si llega como `background-image` de una
#    hoja de estilos: con `test.css: false` (vite.config.ts) esa hoja no se
#    evalúa nunca en Vitest, así que ni el Then original ni una variante sobre
#    "style" la detectarían. Se añade @s14, sobre el origen de la propiedad CSS
#    calculada, declarada explícitamente como verificación en navegador real,
#    fuera del gate de Vitest/Stryker, según la Decisión 11.
#
# PENDIENTE
# - PENDIENTE: la imagen de fondo del hero. El prototipo usa una foto remota de
#   images.pexels.com, prohibida por la Decisión 9; falta que el cliente aporte
#   una fotografía propia (o que se licencie una) y se sirva en local. Mientras no
#   exista, ningún escenario de este fichero afirma nada sobre esa imagen salvo
#   que no puede venir de un tercero, ni por atributo DOM (@s13) ni por el fondo
#   de una hoja de estilo (@s14, verificada en navegador real por la Decisión 11).
# - PENDIENTE: no hay ni un solo dato verificado de antigüedad, volumen de
#   pacientes ni número de registro del centro (§9). Por eso ninguna cifra de ese
#   tipo entra en el hero, ni siquiera "desde 2020" (el pie del proveedor actual
#   no es fuente del cliente, §12).

Feature: Sección de bienvenida
  Como visitante que llega por primera vez a la web de Galapavet
  Quiero saber en segundos quién es, dónde está, cuándo abre y qué hacer ahora
  Para decidir si reservo cita o llamo por teléfono.

  Background:
    Given el visitante abre la página de inicio

  @s1
  Scenario: Se muestran la ubicación real y el titular principal
    When el visitante mira la sección de bienvenida
    Then existe un encabezado de nivel 1 cuyo nombre accesible es exactamente "Cuidamos la salud y la felicidad de tu mascota"
    And se muestra el texto "Galapagar · Madrid"
    And no se muestra en ningún punto de la sección el texto "Miraflores de la Sierra"

  @s2
  Scenario: El texto descriptivo solo nombra servicios que el cliente presta
    When el visitante lee el texto descriptivo de la sección de bienvenida
    Then el texto contiene "medicina general"
    And el texto contiene "cirugía y anestesia"
    And el texto contiene "diagnóstico de imagen"
    And el texto contiene "análisis"
    And el texto contiene "especialidades"
    And el texto no contiene "urgencias"
    And el texto no contiene "24 h"

  @s3
  Scenario: El botón principal lleva a la sección de reserva
    When el visitante pulsa el enlace cuyo nombre accesible es "Reservar cita"
    Then el destino del enlace es exactamente "#reservar"

  @s4
  Scenario: El botón secundario inicia una llamada al teléfono real de la clínica
    When el visitante pulsa el enlace cuyo nombre accesible es "Llamar 91 082 92 67"
    Then el destino del enlace es exactamente "tel:+34910829267"

  @s5
  Scenario: El número visible y el destino de la llamada no pueden divergir
    When el visitante mira el enlace de llamada de la sección de bienvenida
    Then los dígitos de su nombre accesible son exactamente "910829267"
    And los dígitos de su destino, sin el prefijo internacional "34", son exactamente "910829267"

  @s6
  Scenario: La franja inferior muestra el horario real de atención
    When el visitante mira la franja inferior de la sección de bienvenida
    Then se muestran exactamente 3 entradas de horario
    And una entrada rotulada "Lunes a viernes" muestra "11:00 a 14:00 y 16:30 a 20:00"
    And una entrada rotulada "Sábados" muestra "11:00 a 14:00"
    And una entrada rotulada "Domingos" muestra "Cerrado"

  @s7
  Scenario: No aparece ninguna cifra de reputación, antigüedad ni volumen
    When el visitante mira la sección de bienvenida completa
    Then el texto de la sección no contiene "12 años"
    And el texto de la sección no contiene "8.400"
    And el texto de la sección no contiene "327"
    And el texto de la sección no contiene "4,9"
    And el texto de la sección no contiene "4,6"
    And el texto de la sección no contiene "reseñas"
    And el texto de la sección no contiene el carácter "★"

  @s8
  Scenario: La sección de bienvenida no anuncia urgencias
    When el visitante mira la sección de bienvenida completa
    Then el texto de la sección no contiene "24 h"
    And el texto de la sección no contiene "Urgencias"
    And ningún enlace de la sección tiene por destino "tel:+34918511393"

  @s9
  Scenario: Sin teléfono en la fuente única no se renderiza el botón de llamada
    Given la fuente única de datos de negocio no declara teléfono principal
    When el visitante mira la sección de bienvenida
    Then no existe en la sección ningún enlace cuyo destino empiece por "tel:"
    And sigue existiendo el enlace cuyo nombre accesible es "Reservar cita"

  @s10
  Scenario: Sin horario en la fuente única no se renderiza la franja inferior
    Given la fuente única de datos de negocio no declara ninguna franja horaria
    When el visitante mira la sección de bienvenida
    Then se muestran exactamente 0 entradas de horario
    And sigue existiendo el encabezado de nivel 1 de la sección
    And sigue existiendo el enlace cuyo nombre accesible es "Reservar cita"

  @s11
  Scenario: Un teléfono que no normaliza falla cerrado, sin enlace a medias
    Given la fuente única de datos de negocio declara el teléfono "91 082 92"
    When se intenta renderizar la sección de bienvenida
    Then el renderizado falla con un error
    And no llega a existir ningún enlace cuyo destino empiece por "tel:"

  @s13
  Scenario: La sección de bienvenida no carga recursos de terceros por atributos DOM
    When el visitante mira la sección de bienvenida
    Then ningún elemento de la sección declara un atributo "src" o "srcset" que empiece por "http"
    And el destino de cada enlace de la sección empieza por "#" o por "tel:"

  @s14
  Scenario: Ninguna hoja de estilo de la sección apunta a un fondo de imagen de un tercero
    Given el sitio de Galapavet construido y la sección de bienvenida cargada en un navegador real, fuera del gate de Vitest/Stryker (Decisión 11)
    When se inspeccionan las reglas de estilo aplicadas a la sección, incluida la propiedad CSS "background-image" calculada de cada elemento
    Then ninguna de esas reglas declara un origen que empiece por "http://", por "https://" ni por "//"
    And ninguna de esas reglas declara un origen que contenga "images.pexels.com"
    And el número de hojas de estilo inspeccionadas es mayor que 0
