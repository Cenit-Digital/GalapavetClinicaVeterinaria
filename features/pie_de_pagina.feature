# FUENTE DEL COMPORTAMIENTO
#   - Prototipo Claude Design «Veterinaria La Sierra.dc.html», elemento <footer> (líneas 444-478):
#     de ahí se hereda la INTERACCIÓN, que está aprobada y NO se toca:
#       (a) bloque de marca (logotipo + nombre + una frase corta de descripción),
#       (b) tres columnas de enlaces, cada una con su encabezado y cuatro enlaces,
#       (c) barra inferior con el aviso de copyright a un lado y los enlaces legales al otro.
#   - project-spec.md → Decisión 1 (solo dato verificado en toda afirmación sobre el negocio),
#     Decisión 2 (no existe «Urgencias 24 h»), Decisión 7 (los enlaces legales apuntan a las
#     páginas legales REALES del cliente), Invariante 2 (fuente única) y Modos de error comunes
#     («dato ausente → no se renderiza el bloque»; «teléfono que no normaliza → falla cerrado»).
#   - feature_list.json → feature 13 `pie_de_pagina`, sus 4 criterios de aceptación.
#   - features/datos_negocio.feature: TODO teléfono de este pie se pide a la fuente única; los
#     literales de abajo son los mismos que fija allí @s1, @s2 y @s3 (patrón organizacional
#     `doble-de-test-anclado-al-literal-no-al-simbolo`: se copian a mano al test, no se re-derivan).
#
# DATOS (docs/datos-galapavet.md — única fuente admitida)
#   §1  Nombre «Galapavet» · descriptor «Centro integral veterinario» · localidad Galapagar
#   §2  Teléfono clínica 91 082 92 67 · segundo teléfono 685 34 31 49
#       Urgencias fuera de horario 91 851 13 93 · CP y localidad 28260 Galapagar, Madrid
#   §9  El cliente NO publica email ni redes sociales (verificado por ausencia)
#   §11 Páginas legales reales: /aviso-legal · /politica-de-cookies · /personalizar-cookies
#
# QUÉ CAMBIA RESPECTO AL CONTRATO HEREDADO (docs/contrato-heredado/pie_de_pagina.feature, 4 escenarios)
#   La estructura y la interacción se conservan íntegras. Cambian los DATOS y las incoherencias:
#   1) @s1 heredado afirmaba el nombre «Veterinaria La Sierra» y la frase «Clínica veterinaria en
#      Miraflores de la Sierra. Medicina preventiva, cirugía y urgencias 24 h desde 2013.» Cada
#      una de sus cuatro afirmaciones es falsa o no verificable para este cliente: la localidad
#      (§7), las urgencias 24 h (§3 y §7) y «desde 2013» (§7: el pie del cliente dice «2020», que
#      tampoco es una fecha de fundación publicada). La frase se reduce a lo verificado:
#      descriptor + localidad. No se inventa antigüedad, ni volumen, ni especialidades de relleno.
#   2) @s2 heredado exigía en la columna «Contacto» un enlace a «918 44 21 60» y otro a
#      «Urgencias 24 h», más un `mailto:` a hola@veterinarialasierra.es. Los tres teléfonos falsos
#      se sustituyen por los reales, el rótulo «Urgencias 24 h» pasa a ser el rótulo literal del
#      cliente «Urgencias fuera de horario», y el enlace de correo DESAPARECE en vez de sustituirse
#      por otro correo: el cliente no publica ninguno (§9). La columna sigue teniendo 4 enlaces
#      porque el hueco lo ocupa el segundo teléfono real publicado, no un dato inventado (@s5).
#   3) @s3 heredado documentaba como incoherencia «a confirmar con Pablo» que los tres enlaces
#      legales apuntaran los tres a «#faq». RESUELTO por la Decisión 7: apuntan a las tres páginas
#      legales que el cliente ya publica (§11). Consecuencia: el rótulo «Privacidad» del prototipo
#      DESAPARECE —no hay política de privacidad publicada y hacerlo apuntar a la de cookies sería
#      afirmar que existe— y en su lugar quedan los rótulos de las páginas que sí existen:
#      «Aviso legal», «Política de cookies» y «Personalizar cookies» (@s9).
#   4) @s4 heredado exigía el texto «© 2026 Veterinaria La Sierra · Centro veterinario registrado
#      nº 28/0791». El número de registro es INVENTADO (§7: no publicado, no verificable) y se
#      elimina por completo del aviso (@s12). El aviso queda con el nombre real y el año, y el año
#      se calcula de la fecha vigente en vez de quedar horneado (@s13).
#
# DECISIÓN DE ESTE CONTRATO — los enlaces legales se abren en una ventana nueva (@s10)
#   Porque salen del sitio: apuntan a galapavet.com, que es OTRO sitio (la web vigente del
#   cliente), no una ruta de esta web piloto. Navegar fuera en la misma pestaña destruiría el
#   estado local que el visitante haya acumulado en la landing —conversación del chat de reserva
#   a medias, formulario escrito, variante de paleta elegida—, que no vive en ninguna URL y no se
#   recupera al volver. Como abrir ventana nueva sin avisar es una trampa de usabilidad, cada
#   enlace lo anuncia en su propio nombre accesible y lleva el `rel` que evita que la página
#   destino manipule a la de origen. Los enlaces internos del pie NO cambian de pestaña (@s3, @s4).
#
# PENDIENTE (no verificado — no se afirma como hecho del negocio en ningún escenario)
#   - PENDIENTE: el cliente no publica política de PRIVACIDAD. Solo aviso legal y las dos de
#     cookies (§11). Mientras no la publique, el pie no ofrece ese enlace; @s11 fija que una
#     página legal no declarada no se pinta como enlace muerto.
#   - PENDIENTE: las tres páginas legales enlazadas describen la web VIGENTE del cliente
#     (proveedor `oglobalservices.es`, §12), no esta web piloto. Antes de publicar hay que
#     confirmar con el cliente que siguen siendo válidas para el sitio nuevo.
#   - PENDIENTE: el año «2026» de @s12 es la fecha vigente de la sesión (17/08/2026), no una fecha
#     de fundación ni de propiedad intelectual acordada con el cliente. Si el cliente confirma
#     alguna vez su año de constitución, es dato nuevo y entra por docs/datos-galapavet.md.
#   - PENDIENTE: las rutas internas de las subpáginas se fijan aquí como «/campanas», «/blog» y
#     «/tienda» (@s4) para que el contrato sea medible. Son el mismo destino que deben usar la
#     cabecera y las features de subpágina; si el enrutado adopta otros slugs, se corrige aquí,
#     que es donde quedan escritos.
#   - Fuera de alcance deliberado: la valoración de Google (§8) es un dato vivo y el pie no la
#     muestra; la dirección, el horario y el mapa son de `informacion_contacto`, no de esta feature.

Feature: Pie de página
  Como visitante que llega al final de la página
  Quiero encontrar los accesos rápidos, los teléfonos reales y las condiciones legales del cliente
  Para volver a lo que me interesa, llamar sin buscar, o leer lo que Galapavet publica legalmente.

  Background:
    Given los datos del negocio se piden a la fuente única, que declara el teléfono de la clínica "91 082 92 67", el segundo teléfono "685 34 31 49" y el de urgencias "91 851 13 93" con el rótulo "Urgencias fuera de horario"

  @s1
  Scenario: El bloque de marca identifica al cliente real sin afirmar nada que no esté publicado
    Given el visitante llega al final de la landing
    When se renderiza el pie de página
    Then existe exactamente un elemento con rol "contentinfo"
    And dentro de él se lee el nombre "Galapavet"
    And dentro de él se lee la descripción, exactamente, "Centro integral veterinario en Galapagar, Madrid."
    And la imagen del logotipo es decorativa: no expone ningún elemento con rol "img" que aporte nombre accesible, porque el nombre "Galapavet" ya lo aporta el texto contiguo
    And en todo el pie no aparece "desde 2013", ni "2013", ni "12 años", ni "8.400", ni "327"
    And en todo el pie no aparece "4,9", ni "4,6", ni "reseñas", ni el carácter "★"

  @s2
  Scenario: El pie presenta tres columnas encabezadas, de cuatro enlaces cada una
    Given el visitante llega al final de la landing
    When se renderiza el pie de página
    Then dentro del rol "contentinfo" hay exactamente 3 elementos con rol "heading", con los nombres accesibles "Clínica", "Contenido" y "Contacto", en ese orden
    And cada uno de esos encabezados va seguido de un elemento con rol "list"
    And cada una de esas 3 listas contiene exactamente 4 elementos con rol "listitem"
    And cada uno de esos 12 elementos de lista contiene exactamente un elemento con rol "link"

  @s3
  Scenario: La columna "Clínica" lleva a las cuatro secciones de la landing sin salir de la página
    Given el visitante llega al final de la landing
    When se renderiza el pie de página
    Then la lista encabezada por "Clínica" contiene enlaces con los nombres accesibles "Servicios", "Equipo", "Reservar cita" y "Galería", en ese orden
    And sus destinos son, respectivamente y exactamente, "#servicios", "#equipo", "#reservar" y "#galeria"
    And ninguno de esos cuatro enlaces declara el atributo target

  @s4
  Scenario: La columna "Contenido" lleva a las tres subpáginas y a las preguntas frecuentes
    Given el visitante llega al final de la landing
    When se renderiza el pie de página
    Then la lista encabezada por "Contenido" contiene enlaces con los nombres accesibles "Blog", "Campañas", "Tienda" y "Preguntas frecuentes", en ese orden
    And sus destinos son, respectivamente y exactamente, "/blog", "/campanas", "/tienda" y "#faq"
    And ninguno de esos cuatro enlaces declara el atributo target

  @s5
  Scenario: La columna "Contacto" muestra los teléfonos reales y su destino sale del mismo dato
    Given el visitante llega al final de la landing
    When se renderiza el pie de página
    Then la lista encabezada por "Contacto" contiene un enlace de nombre accesible exactamente "91 082 92 67" con destino exactamente "tel:+34910829267"
    And contiene un enlace de nombre accesible exactamente "685 34 31 49" con destino exactamente "tel:+34685343149"
    And contiene un enlace de nombre accesible exactamente "Urgencias fuera de horario · 91 851 13 93" con destino exactamente "tel:+34918511393"
    And contiene un enlace de nombre accesible exactamente "Cómo llegar" con destino exactamente "#contacto"
    And para cada uno de esos tres enlaces de llamada, los dígitos de su nombre accesible son los mismos dígitos, en el mismo orden, que los del final de su destino

  @s6
  Scenario: El enlace de urgencias del pie conserva el rótulo real del cliente y no anuncia 24 horas
    Given el visitante llega al final de la landing
    When se renderiza el pie de página
    Then el nombre accesible del enlace cuyo destino es "tel:+34918511393" empieza por "Urgencias fuera de horario"
    And ese nombre accesible no contiene "24 h", ni "24h", ni "365", ni "todos los días"
    And el pie no contiene ningún elemento con rol "heading" ni con rol "banner" cuyo nombre accesible mencione urgencias

  @s7
  Scenario: Sin email publicado, el pie no ofrece ningún enlace de correo
    Given la fuente única no declara ningún correo electrónico del negocio, porque el cliente no publica ninguno
    When se renderiza el pie de página
    Then ningún elemento con rol "link" del pie tiene un destino que empiece por "mailto:"
    And en todo el texto del pie no aparece ningún carácter "@"
    And no se renderiza en su lugar ningún enlace de relleno: la columna "Contacto" sigue teniendo exactamente 4 enlaces, y los 4 son los del escenario @s5

  @s8
  Scenario: Sin perfiles publicados, el pie no renderiza el bloque de redes sociales
    Given la fuente única devuelve una lista vacía de perfiles de redes sociales, porque el cliente no publica ninguno
    When se renderiza el pie de página
    Then no existe en el pie ningún elemento con rol "heading" ni con rol "list" cuyo nombre accesible contenga "redes" o "Síguenos"
    And ningún elemento con rol "link" del pie tiene un destino que contenga "facebook.com", "instagram.com", "x.com", "twitter.com" ni "tiktok.com"
    And el pie sigue mostrando exactamente 3 encabezados de columna, sin dejar un hueco vacío en su lugar

  @s9
  Scenario: Los enlaces legales apuntan a las páginas legales reales que el cliente ya publica
    Given el visitante mira la barra inferior del pie
    When se renderizan los enlaces legales
    Then hay exactamente 3 elementos con rol "link" en la barra inferior
    And el primero tiene un nombre accesible que empieza por "Aviso legal" y su destino es exactamente "https://galapavet.com/aviso-legal"
    And el segundo tiene un nombre accesible que empieza por "Política de cookies" y su destino es exactamente "https://galapavet.com/politica-de-cookies"
    And el tercero tiene un nombre accesible que empieza por "Personalizar cookies" y su destino es exactamente "https://galapavet.com/personalizar-cookies"
    And ninguno de los tres destinos es "#faq", ni "#", ni una cadena vacía

  @s10
  Scenario: Cada enlace legal se abre en una ventana nueva, lo anuncia y no deja manipular la página de origen
    Given el visitante mira la barra inferior del pie
    When se renderizan los enlaces legales
    Then cada uno de los 3 enlaces declara el atributo target con el valor exacto "_blank"
    And el atributo rel de cada uno contiene "noopener" y contiene "noreferrer"
    And el nombre accesible de cada uno termina, exactamente, en "(se abre en una ventana nueva)"
    And el nombre accesible del primero es, exactamente, "Aviso legal (se abre en una ventana nueva)"

  @s11
  Scenario: Una página legal que el cliente no publica no se pinta como enlace muerto
    Given la fuente única declara solo dos páginas legales, "Aviso legal" y "Política de cookies", porque "Personalizar cookies" no está publicada
    When se renderizan los enlaces legales
    Then hay exactamente 2 elementos con rol "link" en la barra inferior
    And el primero tiene un nombre accesible que empieza por "Aviso legal" y su destino es exactamente "https://galapavet.com/aviso-legal"
    And el segundo tiene un nombre accesible que empieza por "Política de cookies" y su destino es exactamente "https://galapavet.com/politica-de-cookies"
    And ninguno de ellos tiene como destino "#", ni una cadena vacía, ni el texto "PENDIENTE"
    And no se renderiza ningún elemento con rol "link" cuyo nombre accesible sea "Privacidad"

  @s12
  Scenario: El aviso de copyright no incluye ningún número de registro
    Given la fecha vigente es el 17 de agosto de 2026
    When se calcula el texto del aviso de copyright para esa fecha
    Then el texto es exactamente "© 2026 Galapavet"
    And el texto no contiene "28/0791", ni "registrado", ni "nº"
    And el texto no contiene "Veterinaria La Sierra"

  @s13
  Scenario: El año del aviso de copyright se calcula de la fecha vigente y no queda horneado
    Given la fecha vigente es el 1 de enero de 2027
    When se calcula el texto del aviso de copyright para esa fecha
    Then el texto es exactamente "© 2027 Galapavet"
    And el texto no contiene "2026"

  @s14
  Scenario: En el pie no sobrevive ningún dato del prototipo heredado
    Given el visitante llega al final de la landing
    When se recorre todo el texto y todos los destinos del pie de página
    Then no aparece "Veterinaria La Sierra", ni "Miraflores", ni "28792", ni "Ctra. de la Sierra"
    And no aparece "918 44 21 60", ni "640 22 11 90", ni "918442160", ni "640221190"
    And no aparece "hola@veterinarialasierra.es"
    And no aparece "24 h", ni "24h", ni "nº 28/0791"

  @s15
  Scenario: Un teléfono que no valida hace fallar al pie en vez de pintar un enlace a medias
    Given la fuente única declara el teléfono de urgencias con el valor "91 851 13", que tiene ocho dígitos
    When se renderiza el pie de página
    Then la operación falla lanzando un error
    And el mensaje del error contiene el valor recibido "91 851 13"
    And no se renderiza ningún elemento con rol "link" cuyo destino empiece por "tel:+34"
