# Fuente: Claude Design — "Veterinaria La Sierra.dc.html", sección id="galeria"
# 9 fotografías verificadas en el array GALERIA (hint-placeholder-count del editor decía 5;
# el contenido real son 9 — ver misma advertencia que en servicios.feature).
# El carrusel es de scroll físico (scroll-snap), no de índice: los botones "anterior"/"siguiente"
# desplazan la pista una tarjeta (ancho de tarjeta + 18px de separación), no saltan a una posición fija.

Feature: Galería de pacientes
  Como visitante que quiere ver pruebas reales del trato de la clínica
  Quiero recorrer fotos de mascotas atendidas
  Para reforzar la confianza antes de reservar

  Background:
    Given el visitante está en la sección "Galería" de la landing

  @s1
  Scenario: Se muestran las nueve fotografías con nombre y descripción
    When el visitante mira la sección Galería
    Then deben verse exactamente 9 fotografías
    And cada fotografía debe mostrar el nombre de la mascota y una descripción breve del motivo de la visita

  @s2
  Scenario: El botón "siguiente" desplaza el carrusel hacia adelante
    Given la galería muestra sus fotografías desde el principio
    When el visitante pulsa el botón "Foto siguiente"
    Then la pista de fotografías debe desplazarse hacia la derecha el ancho de una tarjeta con desplazamiento suave

  @s3
  Scenario: El botón "anterior" desplaza el carrusel hacia atrás
    Given el visitante ha avanzado el carrusel al menos una vez
    When el visitante pulsa el botón "Foto anterior"
    Then la pista de fotografías debe desplazarse hacia la izquierda el ancho de una tarjeta con desplazamiento suave
