# Fuente: Claude Design — "Veterinaria La Sierra.dc.html"
# Punto de corte responsive verificado en el código: 1120px de ancho de viewport (variable "esMovil").
# navPrincipal (7 enlaces): Reservar(#reservar) · Servicios(#servicios) · Campañas(./Campanas.dc.html)
#   · Equipo(#equipo) · Blog(./Blog.dc.html) · Contacto(#contacto) · FAQ(#faq)
# Nota: "Campañas" y "Blog" son páginas externas al fichero implementado; solo se valida el enlace, no su contenido.

Feature: Cabecera con navegación principal y menú móvil
  Como visitante de la web de Veterinaria La Sierra
  Quiero acceder a las secciones principales desde cualquier punto de la página
  Para moverme por la web sin perder tiempo haciendo scroll manual

  Background:
    Given el visitante está en cualquier punto de la landing de Veterinaria La Sierra

  @s1
  Scenario: En escritorio se muestra la navegación horizontal completa
    Given el ancho de la ventana es 1120 píxeles o más
    When el visitante mira la cabecera
    Then deben verse los 7 enlaces de navegación en horizontal: "Reservar", "Servicios", "Campañas", "Equipo", "Blog", "Contacto" y "FAQ"
    And debe verse el botón "Urgencias" junto a la navegación
    And debe verse el enlace "Tienda"
    And el botón de menú hamburguesa no debe mostrarse

  @s2
  Scenario: En móvil se oculta la navegación horizontal y aparece el botón de menú
    Given el ancho de la ventana es menor de 1120 píxeles
    When el visitante mira la cabecera
    Then la navegación horizontal no debe mostrarse
    And debe verse el botón de menú con el atributo "aria-expanded" en "false"

  @s3
  Scenario: Abrir el menú móvil despliega los mismos enlaces más el acceso a urgencias
    Given el ancho de la ventana es menor de 1120 píxeles
    And el menú móvil está cerrado
    When el visitante pulsa el botón de menú
    Then el atributo "aria-expanded" del botón debe pasar a "true"
    And debe desplegarse un panel con los 7 enlaces de navegación, el enlace "Tienda" y un botón "Urgencias 24 h · 640 22 11 90"

  @s4
  Scenario: Pulsar un enlace del menú móvil navega y cierra el menú
    Given el menú móvil está abierto
    When el visitante pulsa el enlace "Servicios" dentro del menú móvil
    Then la página debe desplazarse hasta la sección "Servicios"
    And el menú móvil debe cerrarse

  @s5
  Scenario: El botón de urgencias del menú móvil llama directamente por teléfono
    Given el menú móvil está abierto
    When el visitante pulsa el botón "Urgencias 24 h · 640 22 11 90" del menú móvil
    Then el dispositivo debe iniciar una llamada al número "+34640221190"

  @s6
  Scenario: El botón de urgencias de la navegación de escritorio lleva al formulario de contacto
    Given el ancho de la ventana es 1120 píxeles o más
    When el visitante pulsa el botón "Urgencias" de la navegación de escritorio
    Then la página debe desplazarse hasta la sección "Contacto"

  @s7
  Scenario: El logotipo enlaza siempre al inicio de la página
    When el visitante pulsa el logotipo "Veterinaria La Sierra" de la cabecera
    Then la página debe desplazarse hasta la sección "Inicio"
