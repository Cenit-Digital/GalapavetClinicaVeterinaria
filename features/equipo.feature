# FUENTE DEL COMPORTAMIENTO
#   Interacción: prototipo de Claude Design "Veterinaria La Sierra.dc.html",
#   sección id="equipo" (tarjeta con botón "+", estado propio por tarjeta en
#   `equipoAbierto` indexado por posición, `aria-expanded` en el botón y
#   `aria-label` que se recalcula según el estado). Esa interacción está
#   aprobada y se conserva íntegra.
#   Datos: docs/datos-galapavet.md §4 (los DOS únicos profesionales publicados
#   por el cliente) y project-spec.md, Decisión 1 (solo dato verificado) y
#   Decisión 4 (el equipo pasa de 6 inventados a los 2 reales).
#
# QUÉ CAMBIA RESPECTO AL CONTRATO HEREDADO (docs/contrato-heredado/equipo.feature)
#   1. Los 6 profesionales del prototipo eran inventados. Se sustituyen por los
#      2 reales: "Marcos Pérez" (Veterinario) y "Joaquín Herranz" (Auxiliar).
#      El heredado @s1 exigía "exactamente 6 tarjetas"; ahora son 2.
#   2. ELIMINADO el heredado @s2: exigía mostrar "Colegiada/o nº 28-7412" e
#      "Idiomas · Español · Inglés". Ni el número de colegiado ni los idiomas
#      están publicados por Galapavet (datos-galapavet.md §7 los marca FALSOS).
#      En su lugar, @s2 de este contrato PROHÍBE que aparezcan.
#   3. ELIMINADO el heredado @s5 ("hasta tres etiquetas de especialidad":
#      "Exóticos", "Aves", "Reptiles"). El cliente no publica especialidades por
#      profesional; asignarlas sería inventar credenciales.
#   4. ELIMINADO el copy heredado de la sección ("Seis profesionales colegiados
#      que verás siempre por aquí"): es falso y afirma colegiación no publicada.
#   5. El heredado @s4 probaba la independencia entre dos tarjetas desplegables.
#      Con los datos reales solo UNA tarjeta es desplegable (solo un profesional
#      tiene formación publicada), así que la independencia se contrata sobre un
#      listado de prueba (@s8) y con los datos reales se afirma el hecho
#      medible que la sustituye: en toda la sección existe un único botón (@s7).
#   6. El nombre accesible del botón pasa de "…la biografía de X" a "…la
#      formación de X". La interacción (un nombre accesible que cambia con el
#      estado) es la heredada; cambia el sustantivo porque lo único que el
#      cliente publica es una titulación, y anunciar una "biografía" prometería
#      un texto que no existe.
#   7. AÑADIDO el caso límite que el heredado no contemplaba: un profesional SIN
#      formación publicada. Decisión sin ambigüedad (invariante "dato de negocio
#      ausente → no se renderiza el bloque, no se rellena con un valor
#      plausible"): su tarjeta NO ofrece botón de desplegar y NO muestra ningún
#      texto de sustitución.
#
# PENDIENTE (no verificado, decidido de forma conservadora hasta que el cliente
# lo aporte)
#   - RETRATOS DEL EQUIPO: docs/datos-galapavet.md no recoge ninguna fotografía
#     de los dos profesionales. El prototipo mostraba un retrato por tarjeta con
#     `alt` que atribuye una cara a un nombre; hacerlo con una foto de banco
#     sobre personas reales sería una afirmación falsa. Contrato provisional:
#     ninguna tarjeta muestra imagen (@s11). Cuando el cliente entregue sus
#     retratos, @s11 se sustituye por el escenario que exija el `alt` con el
#     nombre del profesional.
#   - La formación de "Joaquín Herranz" está PENDIENTE del cliente: hoy no hay
#     ninguna publicada y por eso su tarjeta se contrata sin botón.
#   - No se afirma antigüedad, número de pacientes ni valoración: nada de eso
#     está verificado (datos-galapavet.md §7).

Feature: Presentación del equipo de Galapavet
  Como visitante que va a confiar la salud de su mascota a la clínica
  Quiero saber quién me va a atender y qué formación tiene
  Para decidir con información real, sin credenciales inventadas.

  Background:
    Given el visitante ha abierto la landing de Galapavet

  @s1
  Scenario: Se muestran exactamente los dos profesionales publicados, con su nombre y su rol
    Given la sección se alimenta del listado real de profesionales de Galapavet
    When el visitante llega a la sección "Equipo"
    Then la sección tiene un encabezado de nivel 2 cuyo nombre accesible es "Equipo"
    And existe una región cuyo nombre accesible es "Equipo"
    And la sección contiene exactamente 2 encabezados de nivel 3
    And existe un encabezado de nivel 3 cuyo nombre accesible es "Marcos Pérez"
    And existe un encabezado de nivel 3 cuyo nombre accesible es "Joaquín Herranz"
    And dentro de la tarjeta de "Marcos Pérez" se muestra el texto "Veterinario"
    And dentro de la tarjeta de "Joaquín Herranz" se muestra el texto "Auxiliar"

  @s2
  Scenario: Ningún dato de colegiación ni de idiomas aparece en la sección
    Given la sección se alimenta del listado real de profesionales de Galapavet
    When el visitante llega a la sección "Equipo"
    Then el texto de la sección no contiene "Colegiad"
    And el texto de la sección no contiene "Idiomas"
    And el texto de la sección no contiene "nº"

  @s3
  Scenario: La tarjeta de un profesional con formación publicada arranca colapsada
    Given la sección se alimenta del listado real de profesionales de Galapavet
    When el visitante llega a la sección "Equipo"
    Then existe un elemento con rol de botón cuyo nombre accesible es "Ver la formación de Marcos Pérez"
    And el atributo "aria-expanded" de ese botón vale "false"
    And no existe ningún elemento accesible con el texto "Licenciado en veterinaria por la Universidad Complutense de Madrid"

  @s4
  Scenario: Desplegar la tarjeta muestra exactamente la formación publicada
    Given la tarjeta de "Marcos Pérez" está colapsada
    When el visitante activa el botón "Ver la formación de Marcos Pérez"
    Then se muestra el texto "Licenciado en veterinaria por la Universidad Complutense de Madrid"
    And el atributo "aria-expanded" del botón de "Marcos Pérez" vale "true"

  @s5
  Scenario: El nombre accesible del botón cambia al desplegar
    Given la tarjeta de "Marcos Pérez" está colapsada
    When el visitante activa el botón "Ver la formación de Marcos Pérez"
    Then existe un elemento con rol de botón cuyo nombre accesible es "Ocultar la formación de Marcos Pérez"
    And no existe ningún elemento con rol de botón cuyo nombre accesible sea "Ver la formación de Marcos Pérez"

  @s6
  Scenario: Volver a pulsar colapsa la tarjeta y restituye el nombre accesible
    Given la tarjeta de "Marcos Pérez" está desplegada
    When el visitante activa el botón "Ocultar la formación de Marcos Pérez"
    Then el atributo "aria-expanded" del botón de "Marcos Pérez" vale "false"
    And no existe ningún elemento accesible con el texto "Licenciado en veterinaria por la Universidad Complutense de Madrid"
    And existe un elemento con rol de botón cuyo nombre accesible es "Ver la formación de Marcos Pérez"

  @s7
  Scenario: Un profesional sin formación publicada no ofrece botón de desplegar
    Given la sección se alimenta del listado real de profesionales de Galapavet
    When el visitante llega a la sección "Equipo"
    Then la sección contiene exactamente 1 elemento con rol de botón
    And ese único botón tiene el nombre accesible "Ver la formación de Marcos Pérez"
    And el texto accesible de la tarjeta de "Joaquín Herranz" se limita a "Joaquín Herranz" y "Auxiliar"

  @s8
  Scenario: Cada tarjeta con formación se despliega de forma independiente de las demás
    Given la sección se alimenta de un listado de prueba con tres profesionales con formación publicada, llamados "Ana Uno", "Bea Dos" y "Ciro Tres"
    When el visitante activa el botón "Ver la formación de Bea Dos"
    Then el atributo "aria-expanded" del botón de "Bea Dos" vale "true"
    And el atributo "aria-expanded" del botón de "Ana Uno" vale "false"
    And el atributo "aria-expanded" del botón de "Ciro Tres" vale "false"

  @s9
  Scenario: Un profesional sin nombre no se renderiza y no arrastra al resto
    Given la sección se alimenta de un listado de prueba con "Marcos Pérez", "Joaquín Herranz" y un tercer profesional cuyo nombre es la cadena vacía
    When el visitante llega a la sección "Equipo"
    Then la sección contiene exactamente 2 encabezados de nivel 3
    And existe un encabezado de nivel 3 cuyo nombre accesible es "Marcos Pérez"
    And existe un encabezado de nivel 3 cuyo nombre accesible es "Joaquín Herranz"
    And la sección contiene exactamente 2 tarjetas de profesional

  @s10
  Scenario: Con el listado de profesionales vacío la sección no se renderiza
    Given la sección se alimenta de un listado de prueba vacío
    When el visitante llega al lugar de la landing donde iría la sección "Equipo"
    Then no existe ningún encabezado de nivel 2 cuyo nombre accesible sea "Equipo"
    And no existe ninguna región cuyo nombre accesible sea "Equipo"

  @s11
  Scenario: Sin retratos verificados ninguna tarjeta muestra una fotografía del profesional
    Given la sección se alimenta del listado real de profesionales de Galapavet
    When el visitante llega a la sección "Equipo"
    Then la sección no contiene ningún elemento con rol de imagen
