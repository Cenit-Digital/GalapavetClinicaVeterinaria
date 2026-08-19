# Fuente: Claude Design — "Veterinaria La Sierra.dc.html", bloque mostrarSelector + PALETAS
# 4 paletas verificadas: "clinica" (Confianza clínica, por defecto), "calida" (Orgánica y cálida),
# "tech" (Alta gama) y "eco" (Relax & eco). La paleta activa se aplica mediante el atributo
# [data-tema] en la raíz del documento y se persiste en localStorage bajo la clave "vls-tema",
# restaurándose automáticamente en visitas posteriores del mismo navegador.
# Props de diseño: mostrarSelectorPaleta (boolean, default true) · tema (enum, default 'clinica').
#
# NOTA: este selector es una herramienta de presentación/demo de las 4 propuestas de marca, no
# una preferencia de accesibilidad del usuario final (no hay indicio en el código de que esté
# pensado como selector de tema claro/oscuro accesible). Confirmar con Pablo si este selector
# debe llegar a producción tal cual o si es solo una ayuda para elegir la paleta definitiva
# durante la fase de diseño.

Feature: Selector de paleta de color
  Como responsable de elegir la identidad visual definitiva de la web
  Quiero poder alternar entre las propuestas de paleta disponibles
  Para comparar cómo se ve toda la página con cada una antes de decidir

  @s1
  Scenario: El botón flotante de paleta se muestra por defecto
    Given la propiedad "mostrarSelectorPaleta" está activa
    When el visitante carga la página
    Then debe verse un botón circular flotante en la esquina inferior derecha para cambiar de paleta

  @s2
  Scenario: El selector de paleta puede desactivarse desde la configuración
    Given la propiedad "mostrarSelectorPaleta" está desactivada
    When el visitante carga la página
    Then el botón flotante de paleta no debe mostrarse

  @s3
  Scenario: Pulsar el botón flotante abre el panel de paletas
    Given el panel de selección de paleta está cerrado
    When el visitante pulsa el botón flotante de paleta
    Then debe abrirse un panel con el título "Paleta de color"
    And deben listarse exactamente las 4 paletas disponibles: "Confianza clínica", "Orgánica y cálida", "Alta gama" y "Relax & eco"
    And cada paleta debe mostrar su nota descriptiva y tres muestras de color

  @s4
  Scenario: La paleta "Confianza clínica" está activa por defecto
    Given no hay ninguna preferencia de paleta guardada en el navegador
    When el visitante carga la página y abre el panel de paletas
    Then la paleta "Confianza clínica" debe aparecer marcada como activa

  @s5
  Scenario: Elegir una paleta la aplica de inmediato a toda la página
    Given el panel de paletas está abierto
    When el visitante elige la paleta "Alta gama"
    Then los colores de toda la página deben cambiar a los de la paleta "Alta gama"
    And la paleta "Alta gama" debe pasar a mostrarse como la activa en el panel

  @s6
  Scenario: La paleta elegida se recuerda en visitas posteriores
    Given el visitante eligió la paleta "Orgánica y cálida" en una visita anterior
    When el visitante vuelve a cargar la página en el mismo navegador
    Then la página debe mostrarse con la paleta "Orgánica y cálida" aplicada desde el primer instante
