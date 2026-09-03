Feature: Fidelidad visual del selector de paleta
  Como visitante quiero abrir el selector desde un botón discreto y circular
  para cambiar la variante sin que un control grande tape el contenido de la portada.

  @s1
  Scenario: El selector se activa desde un botón circular sin texto visible
    Given la portada con una variante de paleta activa
    When se inspecciona el disparador del selector
    Then su nombre accesible exacto es "Cambiar paleta de color"
    And no tiene texto visible
    And es circular, está fijado a la esquina inferior derecha y mide 52 por 52 píxeles con una tolerancia de 1 píxel
    And contiene un disco decorativo tricolor construido a partir de los tokens primario, acento y urgencia de la variante activa

  @s2
  Scenario: El panel abierto muestra las cinco opciones con información comprensible
    Given el selector cerrado
    When el visitante activa el disparador
    Then aparece un grupo rotulado visiblemente "Paleta de color"
    And el grupo contiene exactamente las cinco variantes disponibles
    And cada variante muestra su nombre, tres muestras de color y un estado "aria-pressed"
    And las tres muestras se derivan de tokens de esa variante y no de hexadecimales escritos en el componente

  @s3
  Scenario: La variante activa se distingue sin depender de una clase de estado
    Given el panel de paleta abierto
    When el visitante elige una variante distinta
    Then la nueva variante se aplica de inmediato a toda la página
    And solo su fila comunica "aria-pressed" como "true"
    And la fila activa tiene una superficie de acento suave y un contorno perceptible
    And la elección continúa persistida entre visitas válidas

  @s4
  Scenario: El selector conserva espacio en móvil y respeta el movimiento reducido
    Given una ventana de 320 píxeles de ancho y el panel abierto
    When se mide el panel y se activa "prefers-reduced-motion"
    Then el panel queda encima del disparador y dentro de los bordes de la ventana
    And el documento no tiene desbordamiento horizontal
    And las transiciones visuales del selector no se reproducen

