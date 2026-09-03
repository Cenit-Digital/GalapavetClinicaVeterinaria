# ============================================================================
# convergencia_visual_v2 — la página PINTADA coincide con el prototipo
# ============================================================================
# Contrato aprobado por el humano el 03/09/2026. Especificación completa en
# progress/rediseno/HANDOFF_CONVERGENCIA_V2.md (tramos T0–T10). Cada `Then`
# se mide en Chromium real contra `dist/` servido bajo
# /GalapavetClinicaVeterinaria/ a 1440×900 salvo que se indique otro ancho.
# Los datos citados (teléfonos, rótulos, recuentos) son los de src/lib/site.ts
# y src/data/; nunca los del prototipo.

Feature: Convergencia visual v2
  Como responsable de Galapavet quiero que la portada publicada se vea como el
  prototipo aprobado en Claude Design, para dejar de pagar por un diseño que no
  llega a la pantalla.

  # --------------------------------------------------------------------------
  # T0 — Cimientos
  # --------------------------------------------------------------------------

  @s1
  Scenario: Ningún módulo SCSS depende de un selector de id
    Given el código fuente de src/
    When se buscan selectores que empiecen por "#" en todos los *.module.scss
    Then el número de coincidencias es exactamente 0
    And el CSS de dist/ no contiene ningún selector "#_inicio_" ni "#_contacto_"

  @s2
  Scenario: El hero va a sangre y no recorta su contenido
    Given la portada cargada a 1440 px
    When se mide la sección "inicio"
    Then el ancho de su primer hijo es igual al ancho del viewport
    And su padding-inline computado es 0px
    And la altura de la sección es mayor o igual que la altura de su contenido
    And el último elemento de la banda de cifras está completamente dentro de la sección

  @s3
  Scenario: El contenedor único sigue midiendo 1220 px fuera de las secciones a sangre
    Given la portada cargada a 1440 px
    When se miden los [data-contenedor-principal] que no llevan data-a-sangre
    Then todos miden exactamente 1220 px de ancho

  @s4
  Scenario: La escala de espaciado no se invoca con pasos inexistentes
    Given el código fuente de src/
    When se buscan las llamadas espaciado(N) en *.scss
    Then cada N pertenece a {4, 8, 12, 16, 24, 32, 48, 64, 96}
    And el botón "Foto anterior" de la galería mide al menos 48 px de ancho y de alto

  # --------------------------------------------------------------------------
  # T1 — Hero
  # --------------------------------------------------------------------------

  @s5
  Scenario: El hero está centrado y lleva la píldora de ubicación
    Given la portada cargada a 1440 px
    When se inspecciona la sección "inicio"
    Then el h1 tiene text-align "center"
    And existe un elemento con el texto "Galapagar · Madrid" cuyo border-radius computado es 999px
    And ese elemento contiene un punto de 7×7 px con el color --color-acento

  @s6
  Scenario: El hero no muestra el horario como lista de definición
    Given la portada cargada
    When se inspecciona la sección "inicio"
    Then no contiene ningún elemento dl
    And la banda de cifras contiene exactamente 4 elementos li

  @s7
  Scenario: Las cifras del hero siguen siendo reales
    Given la portada cargada
    When se leen los 4 valores de la banda de cifras
    Then ninguno es "+12 años", "8.400", "24 h" ni "4,9 ★"
    And ninguna etiqueta está en mayúsculas forzadas (text-transform "none")

  @s8
  Scenario: El segundo botón del hero enlaza con urgencias reales
    Given la portada cargada
    When se inspecciona el segundo enlace del bloque de botones del hero
    Then su href es el tel: de datosNegocio.telefonoUrgencias
    And su texto contiene "Urgencias fuera de horario"
    And no contiene "24 h"

  # --------------------------------------------------------------------------
  # T7 — Contacto
  # --------------------------------------------------------------------------

  @s9
  Scenario: Contacto se maqueta en dos columnas en escritorio
    Given la portada cargada a 1440 px
    When se mide la rejilla de la sección "contacto"
    Then la tarjeta del formulario y la columna derecha comparten la misma coordenada superior (±2 px)
    And la tarjeta del formulario está completamente a la izquierda de la columna derecha

  @s10
  Scenario: Contacto se apila en móvil
    Given la portada cargada a 390 px
    When se mide la rejilla de la sección "contacto"
    Then la columna derecha empieza por debajo del final de la tarjeta del formulario
    And ningún elemento desborda el viewport en horizontal

  @s11
  Scenario: La tarjeta de urgencias es roja, con el rótulo real y un botón blanco
    Given la portada cargada
    When se inspecciona la tarjeta de urgencias de contacto
    Then su background-color computado es igual a --color-urgencia
    And contiene el texto "Urgencias fuera de horario" y "91 851 13 93"
    And contiene un enlace "Llamar ahora" con background-color igual a --color-sobre-primario y href tel: de urgencias
    And no tiene border-inline-start de 4 px

  @s12
  Scenario: La tarjeta de datos lleva mapa y tres bloques
    Given la portada cargada
    When se inspecciona la tarjeta de datos de contacto
    Then el iframe del mapa mide 240 px de alto
    And debajo hay exactamente 3 bloques rotulados "Dirección", "Teléfonos" y "Horario"
    And los rótulos usan text-transform "uppercase" y el color --color-acento-tinta

  # --------------------------------------------------------------------------
  # T2 — Servicios
  # --------------------------------------------------------------------------

  @s13
  Scenario: El titular de servicios es bicolor y el párrafo cita el recuento real
    Given la portada cargada
    When se inspecciona la sección "servicios"
    Then el h2 contiene un em con color computado igual a --color-primario y font-style "normal"
    And el párrafo bajo el h2 contiene el número de bloques de SERVICIOS escrito en letra
    And no contiene "Doce"

  @s14
  Scenario: Cada tarjeta de servicio lleva la píldora superpuesta y el botón con círculo
    Given la portada cargada
    When se inspeccionan las tarjetas de servicios
    Then en cada una la píldora de categoría está posicionada absolute dentro de la imagen, a 14 px del borde izquierdo y superior
    And cada botón "Ver qué incluye" contiene un elemento circular de 30×30 px con fondo --color-acento-suave
    And cada botón está pegado al borde inferior del cuerpo de la tarjeta (margin-top auto)

  @s15
  Scenario: Abrir una tarjeta rota el "+" y muestra los puntos con marca
    Given la portada cargada
    When se pulsa el botón de la primera tarjeta de servicio
    Then su aria-expanded pasa a "true"
    And el círculo del "+" tiene transform rotate(45deg)
    And aparece una lista con tantos li como puntos tiene el bloque, cada uno con un "✓" en círculo de 17 px

  # --------------------------------------------------------------------------
  # T3 — Campañas y alternancia de fondos
  # --------------------------------------------------------------------------

  @s16
  Scenario: Los fondos de la portada siguen la secuencia del prototipo
    Given la portada cargada
    When se lee el background-color computado de las 8 bandas en orden
    Then servicios, equipo, galería y FAQ usan --color-fondo
    And campañas, reservar y contacto usan --color-fondo-alterno
    And no hay tres bandas consecutivas con el mismo color

  @s17
  Scenario: Campañas se maqueta en dos columnas con el aviso de demostración
    Given la portada cargada a 1440 px
    When se inspecciona la banda de campañas
    Then el bloque de texto y la rejilla de tarjetas comparten fila
    And el bloque de texto contiene el aviso de demostración íntegro
    And el enlace "Ver campañas" tiene background-color igual a --color-primario

  @s18
  Scenario: Las tarjetas de campaña son compactas y no declaran precio
    Given la portada cargada
    When se inspeccionan las tarjetas de campaña
    Then cada tarjeta contiene una píldora "Demostración" y un h3
    And ninguna contiene "€" ni "%"
    And cada imagen tiene aspect-ratio 16 / 9

  # --------------------------------------------------------------------------
  # T4 — Equipo
  # --------------------------------------------------------------------------

  @s19
  Scenario: La cabecera de equipo está centrada y cita el recuento real
    Given la portada cargada
    When se inspecciona la sección "equipo"
    Then el h2 tiene text-align "center"
    And el párrafo contiene el número de miembros de EQUIPO escrito en letra
    And no contiene "Seis" ni "colegiados"

  @s20
  Scenario: Cada tarjeta de equipo lleva zona superior 4:3 con avatar grande y sin foto
    Given la portada cargada
    When se inspeccionan las tarjetas de equipo
    Then cada tarjeta tiene una zona superior con aspect-ratio 4 / 3 y fondo --color-acento-suave
    And dentro hay un avatar circular de 96×96 px con las iniciales
    And no hay ningún elemento img dentro de la sección

  @s21
  Scenario: El botón "+" de equipo mide 44 px y solo existe si hay formación
    Given la portada cargada
    When se inspeccionan las tarjetas de equipo
    Then las tarjetas con formación tienen un botón circular de 44×44 px con aria-expanded
    And las tarjetas sin formación no tienen botón

  # --------------------------------------------------------------------------
  # T6 — Galería
  # --------------------------------------------------------------------------

  @s22
  Scenario: La galería tiene cabecera con titular y controles circulares
    Given la portada cargada
    When se inspecciona la sección "galeria"
    Then existe un h2 con el texto "Galería"
    And el aviso de demostración sigue presente
    And los dos botones de desplazamiento miden 48×48 px y tienen border-radius 50%
    And ambos botones están alineados a la derecha de la cabecera, en la misma fila que el h2

  @s23
  Scenario: Las figuras de la galería son tarjetas y la barra de scroll está oculta
    Given la portada cargada
    When se inspeccionan las figuras de la galería
    Then cada figure tiene background-color --color-superficie, borde de 1 px y border-radius 24px
    And cada figcaption contiene dos líneas: nombre y pie en elementos distintos
    And la pista tiene scrollbar-width "none"

  @s24
  Scenario: La pista de la galería sale a sangre pero la cabecera no
    Given la portada cargada a 1440 px
    When se mide la sección "galeria"
    Then la pista ocupa el ancho del viewport
    And el h2 empieza en la misma coordenada x que el h2 de la sección "servicios"

  # --------------------------------------------------------------------------
  # T9 — Pie de página
  # --------------------------------------------------------------------------

  @s25
  Scenario: El pie lleva marca con logo en línea y tres columnas
    Given la portada cargada a 1440 px
    When se inspecciona el footer
    Then el logo mide 36×36 px y comparte fila con el texto "Galapavet"
    And hay exactamente 3 columnas de enlaces con rótulo en mayúsculas
    And ningún enlace de columna tiene text-decoration "underline" en reposo

  @s26
  Scenario: La barra inferior del pie va en una sola fila
    Given la portada cargada a 1440 px
    When se mide la barra inferior del footer
    Then el copyright y la lista de enlaces legales comparten la misma coordenada superior (±2 px)
    And los enlaces legales están en línea (la lista mide una sola línea de alto)
    And la barra tiene border-top de 1 px

  # --------------------------------------------------------------------------
  # T5 — Reserva por chat
  # --------------------------------------------------------------------------

  @s27
  Scenario: La reserva ofrece WhatsApp como acción primaria con el móvil real
    Given la portada cargada
    When se inspecciona el bloque de botones de "reservar"
    Then el primer enlace tiene texto "WhatsApp", href hacia wa.me con el número de datosNegocio.telefonoMovil y background-color --color-acento-tinta
    And el segundo enlace es "Llamar a la clínica" con href tel: de datosNegocio.telefonoClinica
    And no existe ningún texto "Confirmamos la hora exacta" ni "2 horas"

  @s28
  Scenario: La tarjeta del chat tiene cabecera, historial y pie del prototipo
    Given la portada cargada
    When se inspecciona la tarjeta del asistente
    Then su border-radius computado es 24px y su box-shadow es --sombra-elevada
    And la cabecera contiene un avatar circular de 40×40 px con fondo --color-primario
    And cada chip de respuesta rápida mide al menos 44 px de alto y tiene border-radius 999px
    And el mensaje del asistente tiene border-radius "16px 16px 16px 5px"

  # --------------------------------------------------------------------------
  # T8 — FAQ
  # --------------------------------------------------------------------------

  @s29
  Scenario: La FAQ va centrada, estrecha y con el "+" circular
    Given la portada cargada a 1440 px
    When se inspecciona la sección "faq"
    Then el contenido mide como máximo 860 px de ancho y está centrado
    And el h2 tiene text-align "center"
    And cada botón de pregunta contiene un círculo de 30×30 px con fondo --color-acento-suave
    And al pulsar la primera pregunta su círculo tiene transform rotate(45deg)

  # --------------------------------------------------------------------------
  # T10 — Barra, cabecera y selector
  # --------------------------------------------------------------------------

  @s30
  Scenario: La cabecera usa el logo real y la píldora roja de urgencias
    Given la portada cargada a 1440 px
    When se inspecciona el header
    Then contiene un img cuyo src termina en "logo-galapavet.webp" de 38×38 px
    And contiene un enlace "Urgencias" con background-color --color-urgencia y href tel: de urgencias
    And contiene un enlace "Tienda" con border de 1.5 px
    And su backdrop-filter computado contiene "blur"

  @s31
  Scenario: Los enlaces de navegación son píldoras con hover de acento
    Given la portada cargada a 1440 px
    When se pasa el ratón por el enlace "Servicios" de la navegación
    Then su border-radius computado es 999px
    And su background-color pasa a --color-acento-suave

  @s32
  Scenario: El selector de paleta es un botón circular con disco cónico
    Given la portada cargada
    When se inspecciona el botón del selector de paleta
    Then mide 52×52 px, tiene border-radius 50% y aria-label "Cambiar paleta de color"
    And no tiene texto visible
    And su hijo tiene background-image con "conic-gradient"

  @s33
  Scenario: El panel del selector muestra las cinco variantes con tres muestras cada una
    Given la portada cargada
    When se pulsa el botón del selector de paleta
    Then aparece un panel de como máximo 268 px de ancho con el rótulo "Paleta de color"
    And contiene exactamente 5 opciones, cada una con 3 muestras de color y aria-pressed
    And la opción activa tiene background-color --color-acento-suave

  # --------------------------------------------------------------------------
  # Puertas transversales (se heredan y se vuelven a exigir)
  # --------------------------------------------------------------------------

  @s34
  Scenario: Todas las puertas del arnés siguen en verde
    Given el repositorio tras el último tramo
    When se ejecutan lint, typecheck, test, build, test:e2e y mutate
    Then todos terminan con código de salida 0
    And axe reporta 0 violaciones en las 30 combinaciones ruta/variante
    And no hay ninguna petición a terceros salvo el mapa
    And el CSS servido respeta el techo declarado

  @s35
  Scenario: Existe una captura revisada por cada tramo
    Given el directorio progress/rediseno/capturas/
    When se listan los ficheros
    Then hay una captura de portada completa a 1440 px y otra a 390 px por cada tramo cerrado
    And progress/rediseno/HANDOFF_CONVERGENCIA_V2.md registra la fecha y el veredicto visual de cada una
