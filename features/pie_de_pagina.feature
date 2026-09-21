# =============================================================================
# POR QUÉ CAMBIA ESTE CONTRATO (20/09/2026) — E2: FUERA EL ENLACE DE URGENCIAS
# =============================================================================
# Decisión de Pablo del 20/09/2026, CORROBORADA en la grabación de la reunión
# con su socio Roberto Alonso del 16/08/2026 (transcripción literal con marcas
# de tiempo en `progress/transcripcion_reunion_rober_20260816.txt`; tabla en
# `progress/decisiones_reunion_rober_20260816.md`), minutos 06:52-07:00: «La
# urgencia se va afuera... y el resto se queda como está».
#
# QUÉ SE VA: el tercer enlace de la columna "Contacto", el de nombre accesible
# «Urgencias fuera de horario · 91 851 13 93» (`PieDePagina-logica.ts:46-49` y
# `:77`, `PieDePagina.tsx:53-70`).
# QUÉ SE QUEDA: todo lo demás de la columna —los dos teléfonos de la clínica y
# «Cómo llegar»—, las otras dos columnas, la barra legal y el aviso.
#
# -----------------------------------------------------------------------------
# ESTE CAMBIO TOCA ESTRUCTURA APROBADA, NO SOLO UN DATO — Y YA ESTÁ DECIDIDO
# -----------------------------------------------------------------------------
# La simetría «tres columnas de CUATRO enlaces» viene del <footer> del
# prototipo versionado y este mismo fichero explica más abajo (§2) por qué son
# cuatro: «el hueco lo ocupa el segundo teléfono real publicado, no un dato
# inventado». Quitar el de urgencias deja la columna "Contacto" en TRES y rompe
# esa simetría.
#
# RESUELTO (20/09/2026, TERCERA TANDA). Esta nota nació diciendo que era «una
# DECISIÓN DE DISEÑO que la puerta humana tiene que ratificar explícitamente: o
# la columna se queda en 3 (pie asimétrico), o entra un cuarto dato real ya
# publicado». Pablo la ratificó el mismo día, con la medición delante: LA
# COLUMNA SE QUEDA EN 3 Y NO SE RELLENA. El pie queda 4-4-3.
#
# POR QUÉ NO HAY QUE AJUSTAR NADA DEL SCSS, MEDIDO Y NO OPINADO. El análisis
# completo, con las tablas, está en
# `progress/pie_4-4-3_leyes_uiux_20260920.md` (encargo literal de Pablo: «se
# puede quitar, pero ajustas los SCSS o lo que haga falta para que cumpla las 30
# leyes UI/UX»). Resumen de lo que se comprobó:
#   · Ley de Proximidad — los tres anchos los fija la rejilla
#     (`grid-template-columns: minmax(280px, 2fr) repeat(3, minmax(0, 1fr))`),
#     no el contenido. Medido en 320, 700, 701, 1023, 1024 y 1440 px: los anchos
#     de columna son IDÉNTICOS antes y después, y no hay desbordamiento en
#     ninguno. El `gap` interno sigue siendo `espaciado(8)`.
#   · Ley de Conectividad Uniforme — lo que conecta cada columna es su
#     encabezado y la alineación compartida (`align-items: start`), no el número
#     de filas: la más corta simplemente termina antes. Y esta misma ley
#     DESACONSEJA rellenar con un cuarto enlace cualquiera: un ítem que no
#     pertenece al grupo debilita la conexión visual en vez de reforzarla.
#   · Ley de la Semejanza — no existe ninguna regla posicional (`:nth-child(4)`,
#     `:last-child`) que diera un estilo distinto al cuarto ítem; los enlaces de
#     las tres columnas comparten tamaño y color antes y después.
#   · Ley de Fitts — el alto mínimo de los enlaces del pie sigue siendo 24 px.
#   · Ley de Hick — el pie pasa de 12 a 11 enlaces: por esta ley MEJORA.
#   · Efecto Von Restorff — va a favor: el de urgencias era el único de su
#     columna con rótulo largo y papel distinto, y se llevaba la atención.
# Y no hay con qué rellenar aunque se quisiera: `src/lib/site.ts` declara
# `email: undefined` y `redesSociales: []` porque el cliente no publica ninguno.
# Inventar un enlace es exactamente lo que @s7 prohíbe.
#
# EL SCSS DEL PIE NO SE TOCA EN ESTA TANDA.
#
# Recuentos que bajan, TODOS localizados: columna "Contacto" 4 → 3 (@s2, @s5,
# @s7) y total de enlaces del pie 15 → 14 (`fidelidad_responsive_integral`,
# cuyo Gherkin no cita el número: solo cambia su test, en los cuatro anchos).
# NO bajan: el número de COLUMNAS (3) ni el de enlaces LEGALES (3).
#
# -----------------------------------------------------------------------------
# CONSECUENCIA QUE ESTE CONTRATO NO ESCONDE
# -----------------------------------------------------------------------------
# El pie es el ÚNICO sitio del armazón común de las seis rutas donde vivía el
# rótulo de urgencias, desde que D1 lo quitó de la cabecera. MEDIDO: con E2 +
# E1 + D1, el texto visible INICIAL de las seis rutas se queda sin una sola
# aparición de la palabra "urgencias". Eso pone en rojo dos agregados globales
# (`urgencias.spec.ts:140-141` y `datos-reales.spec.ts:254`, @s52 de
# `rediseno_visual`) y obliga a enmendarlos: ver
# `progress/contacto_pie_contrato_20260920.md` §3.
# =============================================================================

# FUENTE DEL COMPORTAMIENTO
#   - Prototipo Claude Design «Veterinaria La Sierra.dc.html», elemento <footer> (líneas 444-478):
#     de ahí se hereda la INTERACCIÓN, que está aprobada y NO se toca:
#       (a) bloque de marca (logotipo + nombre + una frase corta de descripción),
#       (b) tres columnas de enlaces, cada una con su encabezado y cuatro enlaces
#           — ACTUALIZACIÓN (20/09/2026): la columna "Contacto" pasa a TRES con E2;
#           las otras dos conservan sus cuatro. Ver el bloque de cabecera,
#           «ESTE CAMBIO TOCA ESTRUCTURA APROBADA» —,
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
#      ------------------------------------------------------------------------------------------
#      ACTUALIZACIÓN (20/09/2026) — ESTE PÁRRAFO YA NO DESCRIBE EL PIE. Pablo retira el enlace de
#      urgencias (E2; reunión con Roberto Alonso del 16/08/2026, minutos 06:52-07:00) y la columna
#      "Contacto" baja a TRES enlaces: los dos teléfonos reales y «Cómo llegar». El rótulo
#      «Urgencias fuera de horario» que este párrafo celebraba como corrección del «Urgencias
#      24 h» heredado desaparece del pie; el DATO no se pierde —sigue en la fuente única y en el
#      FAQ, la confirmación del formulario y el chat de reserva, que E3 conserva—, pero deja de
#      estar en el armazón común de las seis rutas. Se corrige el texto en vez de dejarlo: una
#      nota que documenta algo falso es justo el defecto que estas notas existen para evitar
#      (mismo criterio que la tanda anterior aplicó a la nota de @s27 de `rediseno_visual`).
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

  # El Background NO cambia (20/09/2026): la fuente única SIGUE declarando el
  # teléfono de urgencias con su rótulo (E3 lo deja intacto,
  # `features/datos_negocio.feature` @s3). Lo que cambia es que el pie ya no lo
  # consume. Se deja escrito aquí para que nadie lea la retirada del enlace como
  # una retirada del dato.
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

  # TÍTULO Y DOS CLÁUSULAS ENMENDADOS (20/09/2026, E2). Decían literalmente:
  # «El pie presenta tres columnas encabezadas, de cuatro enlaces cada una» /
  # «And cada una de esas 3 listas contiene exactamente 4 elementos con rol
  # "listitem"» / «And cada uno de esos 12 elementos de lista contiene
  # exactamente un elemento con rol "link"».
  #
  # ESTO NO ES UN NÚMERO DE TEST, ES CONTRATO: la simetría de cuatro por columna
  # viene del <footer> del prototipo versionado. La retirada del enlace de
  # urgencias la rompe. El recuento pasa a declararse COLUMNA A COLUMNA en vez
  # de con un único número para las tres, porque escribir «cada una contiene 3»
  # sería falso para "Clínica" y "Contenido", y escribir «cada una contiene 4»
  # sería falso para "Contacto".
  #
  # ACTUALIZACIÓN (20/09/2026, TERCERA TANDA): esta nota decía «Ver el bloque de
  # cabecera: la puerta humana tiene que ratificar la asimetría o meter un cuarto
  # dato real publicado». Ya está ratificada: Pablo decidió el mismo día que la
  # columna se queda en 3 y NO se rellena, con las mediciones de
  # `progress/pie_4-4-3_leyes_uiux_20260920.md` delante. El 4-4-3 no es un
  # accidente que haya que corregir: es el estado aprobado del pie, y el SCSS no
  # se toca.
  #
  # TRES CLÁUSULAS AÑADIDAS (20/09/2026, TANDA DE CORRECCIONES; hallazgo A-4 de
  # `progress/auditoria_orquestador_20260920.md`). Los recuentos 4-4-3 y los 11
  # `listitem` NO se tocan: siguen mordiendo. Lo que faltaba es que el escenario
  # REGISTRABA la asimetría sin proteger nada de lo que la hace aceptable. Si
  # mañana alguien «arregla» el 4-4-3 estrechando la columna corta, cambiándole
  # el espaciado interno o dando otro estilo a los tres enlaces que quedan, los
  # recuentos seguirían en verde y la maquetación se rompería igual.
  #
  # Pablo ratificó el 4-4-3 CON UNA CONDICIÓN EXPLÍCITA: que cumpla las leyes de
  # UI/UX (https://lawsofux.com/es/). `progress/pie_4-4-3_leyes_uiux_20260920.md`
  # demuestra que hoy las cumple, con mediciones en 320 / 700 / 701 / 1023 /
  # 1024 / 1440 px —los dos lados de cada punto de corte del pie
  # (`PieDePagina.module.scss:139` y `:156`) y sus extremos—. Las tres cláusulas
  # nuevas convierten esa demostración en PUERTA:
  #   · Ley de Proximidad + Ley de Conectividad Uniforme → mismo ancho de
  #     columna y mismo espaciado interno entre enlaces, en los seis anchos.
  #   · Ley de la Semejanza → un único par tamaño-color para los 11 enlaces;
  #     ninguna regla posicional distingue a uno por su sitio en la lista.
  #   · Ley de Fitts → el alto mínimo de los enlaces no baja al perder un ítem.
  #
  # SE REDACTAN COMPARATIVAS —una columna contra sus hermanas, un estado contra
  # otro— y NUNCA contra un número escrito a mano: el ancho no se compara con
  # «215 px», se compara con el de sus columnas hermanas, porque ese número
  # cambia con el viewport y con la tipografía y un test que lo congele miente.
  #
  # EL SCSS DEL PIE NO SE TOCA: ya cumple, y está medido. Estas cláusulas son
  # una red para que siga cumpliendo, no un encargo de cambio.
  @s2
  Scenario: El pie presenta tres columnas encabezadas, con cuatro, cuatro y tres enlaces
    Given el visitante llega al final de la landing
    When se renderiza el pie de página
    Then dentro del rol "contentinfo" hay exactamente 3 elementos con rol "heading", con los nombres accesibles "Clínica", "Contenido" y "Contacto", en ese orden
    And cada uno de esos encabezados va seguido de un elemento con rol "list"
    And la lista encabezada por "Clínica" contiene exactamente 4 elementos con rol "listitem"
    And la lista encabezada por "Contenido" contiene exactamente 4 elementos con rol "listitem"
    And la lista encabezada por "Contacto" contiene exactamente 3 elementos con rol "listitem"
    And cada uno de esos 11 elementos de lista contiene exactamente un elemento con rol "link"
    And en los dos lados de cada punto de corte del pie y en sus extremos —320, 700, 701, 1023, 1024 y 1440 px de ancho de ventana— las tres columnas miden entre sí exactamente el mismo ancho, ninguna desborda el suyo y la separación vertical entre dos enlaces consecutivos es idéntica en las tres: el ancho lo fija la rejilla y no el contenido, porque la columna de 3 elementos mide lo mismo que sus dos hermanas de 4
    And entre los 11 enlaces de las tres columnas hay exactamente una combinación distinta de tamaño de letra y de color, y el último elemento de cada lista se dibuja igual que el primero de esa misma lista: ningún enlace recibe un estilo propio por su posición
    And el alto mínimo es el mismo para los 11 enlaces, y el de los tres de la columna corta no es menor que el de los de sus columnas hermanas de 4 elementos: perder un ítem no encoge el objetivo

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

  # CLÁUSULA ELIMINADA de @s5 (20/09/2026, E2; Pablo, corroborado por Roberto
  # Alonso en la grabación del 16/08/2026, minutos 06:52-07:00). Decía
  # literalmente: «And contiene un enlace de nombre accesible exactamente
  # "Urgencias fuera de horario · 91 851 13 93" con destino exactamente
  # "tel:+34918511393"». Con ella cae el «esos TRES enlaces de llamada» de la
  # última cláusula, que pasa a DOS. La comprobación de consistencia
  # dígitos-del-nombre contra dígitos-del-destino NO se relaja: sigue
  # recorriendo todos los enlaces de llamada que queden, que son los dos de la
  # clínica, y sigue siendo lo que impide retipear un teléfono a mano.
  @s5
  Scenario: La columna "Contacto" muestra los teléfonos reales y su destino sale del mismo dato
    Given el visitante llega al final de la landing
    When se renderiza el pie de página
    Then la lista encabezada por "Contacto" contiene un enlace de nombre accesible exactamente "91 082 92 67" con destino exactamente "tel:+34910829267"
    And contiene un enlace de nombre accesible exactamente "685 34 31 49" con destino exactamente "tel:+34685343149"
    And contiene un enlace de nombre accesible exactamente "Cómo llegar" con destino exactamente "#contacto"
    And no contiene ningún otro enlace: son exactamente esos 3
    And para cada uno de esos dos enlaces de llamada, los dígitos de su nombre accesible son los mismos dígitos, en el mismo orden, que los del final de su destino

  # @s6 ENMENDADO (20/09/2026, E2). NO SE BORRA EL ESCENARIO ENTERO: se retiran
  # sus dos primeras cláusulas y se conserva la tercera, que sigue siendo verdad
  # y que E2 no deroga. El título se reescribe en consecuencia.
  #
  # Cláusulas eliminadas, literales:
  #   Then el nombre accesible del enlace cuyo destino es "tel:+34918511393" empieza por "Urgencias fuera de horario"
  #   And ese nombre accesible no contiene "24 h", ni "24h", ni "365", ni "todos los días"
  #
  # Título eliminado, literal: «El enlace de urgencias del pie conserva el
  # rótulo real del cliente y no anuncia 24 horas».
  #
  # POR QUÉ NO BASTA CON BORRARLO: la tercera cláusula («el pie no contiene
  # ningún heading ni banner que mencione urgencias») es una afirmación de
  # AUSENCIA, es la que impide que el pie reintroduzca una cartelería de
  # urgencias por la puerta de un encabezado, y no dependía del enlace. Borrar
  # el escenario entero dejaría MENOS cobertura de la que había. Se le añade,
  # por E2, la ausencia del propio enlace: la puerta que antes vigilaba CÓMO se
  # rotulaba ahora vigila que NO esté.
  @s6
  Scenario: El pie no ofrece ningún acceso a urgencias ni lo anuncia en ningún encabezado
    Given el visitante llega al final de la landing
    When se renderiza el pie de página
    Then no existe en el pie ningún elemento con rol "link" cuyo destino sea "tel:+34918511393"
    And no existe en el pie ningún elemento con rol "link" cuyo nombre accesible contenga "Urgencias"
    And el pie no contiene ningún elemento con rol "heading" ni con rol "banner" cuyo nombre accesible mencione urgencias
    And en todo el texto del pie no aparece "91 851 13 93"

  @s7
  Scenario: Sin email publicado, el pie no ofrece ningún enlace de correo
    Given la fuente única no declara ningún correo electrónico del negocio, porque el cliente no publica ninguno
    When se renderiza el pie de página
    Then ningún elemento con rol "link" del pie tiene un destino que empiece por "mailto:"
    And en todo el texto del pie no aparece ningún carácter "@"
    And no se renderiza en su lugar ningún enlace de relleno: la columna "Contacto" sigue teniendo exactamente 3 enlaces, y los 3 son los del escenario @s5

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

  # @s15 REAPUNTADO, NO RETIRADO (20/09/2026, E2). El Given decía literalmente:
  # «Given la fuente única declara el teléfono de urgencias con el valor
  # "91 851 13", que tiene ocho dígitos», y el mensaje esperado era ese mismo
  # valor.
  #
  # POR QUÉ SE REAPUNTA: el COMPORTAMIENTO que este escenario prueba —el pie
  # falla CERRADO ante un teléfono que no normaliza, en vez de pintar un `tel:`
  # a medias— sigue vivo: los dos teléfonos de la clínica siguen pasando por el
  # mismo normalizador. Lo que E2 se lleva es el PUNTO DE INYECCIÓN, porque el
  # teléfono de urgencias era el único dato que el pie aceptaba por parámetro.
  # Retirar el escenario en vez de reapuntarlo perdería un modo de error que
  # `features/informacion_contacto.feature` cita como PRECEDENTE de su propio
  # @s16, así que el efecto colateral saldría de este fichero.
  #
  # PARA EL ARTESANO: el Given exige un punto de inyección para el teléfono de
  # la CLÍNICA. Dos caminos válidos, y la elección es suya: (a) dar al
  # componente una prop `telefonoClinica` equivalente a la que se retira, o
  # (b) llevar el escenario a la lógica pura, llamando a
  # `construirEnlacesContacto` con un teléfono inválido. Lo que NO vale es
  # dejarlo sin puerta.
  @s15
  Scenario: Un teléfono que no valida hace fallar al pie en vez de pintar un enlace a medias
    Given la fuente única declara el teléfono de la clínica con el valor "91 082 92", que tiene siete dígitos
    When se renderiza el pie de página
    Then la operación falla lanzando un error
    And el mensaje del error contiene el valor recibido "91 082 92"
    And no se renderiza ningún elemento con rol "link" cuyo destino empiece por "tel:+34"
