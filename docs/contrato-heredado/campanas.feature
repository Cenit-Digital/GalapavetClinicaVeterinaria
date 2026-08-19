# Fuente: Claude Design — "Veterinaria La Sierra.dc.html", sección id="campanas"
# Las 3 campañas y el botón "Ver campañas activas" enlazan a "./Campanas.dc.html", un fichero
# aparte del proyecto (fuera del alcance de esta implementación: solo se valida el enlace).

Feature: Campañas de salud destacadas en la portada
  Como visitante interesado en ahorrar en prevención
  Quiero ver de un vistazo las campañas de salud activas
  Para aprovechar el precio cerrado antes de que se acaben las plazas

  Background:
    Given el visitante está en la sección "Campañas" de la landing

  @s1
  Scenario: Se muestran las tres campañas activas
    When el visitante mira la sección Campañas
    Then deben verse exactamente 3 tarjetas de campaña
    And cada tarjeta debe mostrar su imagen, su estado, su vigencia, su título y su precio

  @s2
  Scenario: El precio de cada campaña incluye una nota aclaratoria
    When el visitante mira la tarjeta "Vacunación anual 2026"
    Then debe verse el precio "49 €" junto a la nota "con revisión incluida"

  @s3
  Scenario: Una campaña puede mostrarse con plazas limitadas en lugar de "Activa"
    When el visitante mira la tarjeta "Chequeo senior"
    Then el estado mostrado debe ser "Plazas limitadas"
    And la vigencia mostrada debe ser "Mayores de 8 años"

  @s4
  Scenario: Cada tarjeta de campaña enlaza a la página de campañas
    When el visitante pulsa la tarjeta "Salud dental"
    Then debe navegar a la página de campañas ("./Campanas.dc.html")

  @s5
  Scenario: El botón "Ver campañas activas" enlaza a la página de campañas
    When el visitante pulsa el botón "Ver campañas activas →"
    Then debe navegar a la página de campañas ("./Campanas.dc.html")
