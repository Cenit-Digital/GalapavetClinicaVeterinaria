# Correcciones de la auditoría del orquestador (A-3 y A-4)

> 20/09/2026, `gherkin_author`. Tanda ACOTADA: dos correcciones sobre contratos
> que otras tandas escribieron hoy. No se tocó `src/`, ni los tests, ni ningún
> otro escenario. Fuentes del encargo:
> `progress/auditoria_orquestador_20260920.md` (A-3, A-4) y
> `progress/pie_4-4-3_leyes_uiux_20260920.md`.

## A-3 — `features/rediseno_visual.feature` @s14: error de hecho corregido

### Texto literal ANTERIOR de la cláusula

```
    And desde el 20/09/2026 el recuento total de menciones en el texto inicial
    de las seis rutas es exactamente 0, porque el rótulo solo aparece tras abrir
    la pregunta del FAQ, enviar el formulario de contacto o elegir la urgencia
    en el chat de reserva
```

Dos de las tres afirmaciones eran falsas: ni el FAQ ni el chat pintan nunca el
rótulo `Urgencias fuera de horario`.

### Texto literal NUEVO

```
    And el recuento total de menciones en el texto inicial de las seis rutas es
    exactamente 0, porque tras la retirada el teléfono de urgencias solo
    reaparece de tres formas distintas y ninguna coincide con las otras: como
    enlace de llamada al abrir la pregunta del FAQ, SIN el rótulo ni la palabra;
    como la palabra "urgencias" al elegir la urgencia en el chat de reserva, SIN
    el rótulo; y como rótulo completo únicamente en la confirmación del
    formulario de contacto
```

### Qué más se hizo

- Se conservó el disparador (recuento 0 en el texto INICIAL), que es lo único
  que este escenario comprueba: su `When` prohíbe interactuar.
- La fecha salió del cuerpo de la aserción —dentro de un `Then` no se mide— y
  pasó a la nota.
- La nota de @s14 lleva ahora la tabla de mediciones del orquestador (Chromium,
  `dist/` servido, estado D1+E1+E2, sobre `document.body.innerText`), con la
  procedencia de cada fila: `Faq-logica.ts:66-67`, `ReservaChat.tsx:24` y
  `:273`, `FormularioContacto.tsx:72`. Queda escrito que el artesano debe
  MEDIRLA, no deducirla del código.

### Qué le queda al `tdd_craftsman`

1. Enmendar `tests/e2e/urgencias.spec.ts` para que el agregado global afirme
   `0` menciones en el texto inicial de las seis rutas, en vez de exigir
   presencia por ruta. Es un cambio de signo: hoy ese agregado espera > 0.
2. Las cláusulas de CORRECCIÓN de @s14 (rótulo exacto, `tel:` derivado, ningún
   nombre accesible con palabras añadidas, teléfono distinto del de clínica y
   del móvil) NO cambian y deben seguir recorriendo las seis rutas.
3. La tabla de la nota es descriptiva del estado esperado tras D1+E1+E2: sirve
   para fijar las expectativas de los tests de los estados interactivos que ya
   existan, no obliga a crear uno nuevo por fila.

## A-4 — `features/pie_de_pagina.feature` @s2: de registrar la asimetría a protegerla

### Qué NO cambió

Los recuentos siguen intactos y siguen mordiendo:

```
    And la lista encabezada por "Clínica" contiene exactamente 4 elementos con rol "listitem"
    And la lista encabezada por "Contenido" contiene exactamente 4 elementos con rol "listitem"
    And la lista encabezada por "Contacto" contiene exactamente 3 elementos con rol "listitem"
    And cada uno de esos 11 elementos de lista contiene exactamente un elemento con rol "link"
```

El defecto no era el recuento: era que el escenario registraba la asimetría sin
proteger nada de lo que la hace aceptable.

### Tres cláusulas AÑADIDAS (literales)

```
    And en los dos lados de cada punto de corte del pie y en sus extremos —320,
    700, 701, 1023, 1024 y 1440 px de ancho de ventana— las tres columnas miden
    entre sí exactamente el mismo ancho, ninguna desborda el suyo y la
    separación vertical entre dos enlaces consecutivos es idéntica en las tres:
    el ancho lo fija la rejilla y no el contenido, porque la columna de 3
    elementos mide lo mismo que sus dos hermanas de 4
    And entre los 11 enlaces de las tres columnas hay exactamente una
    combinación distinta de tamaño de letra y de color, y el último elemento de
    cada lista se dibuja igual que el primero de esa misma lista: ningún enlace
    recibe un estilo propio por su posición
    And el alto mínimo es el mismo para los 11 enlaces, y el de los tres de la
    columna corta no es menor que el de los de sus columnas hermanas de 4
    elementos: perder un ítem no encoge el objetivo
```

Leyes que cubren, en el orden en que están escritas: Proximidad + Conectividad
Uniforme, Semejanza, Fitts (https://lawsofux.com/es/). Todas son COMPARATIVAS
—una columna contra sus hermanas, un estado contra otro— y ninguna congela un
número de píxeles.

### Qué más se hizo

La nota de @s2 cita `progress/pie_4-4-3_leyes_uiux_20260920.md`, explica por qué
no se comparan anchos contra «215 px», y deja escrito que **el SCSS del pie NO
se toca**: `PieDePagina.module.scss` ya cumple y está medido.

### Qué le queda al `tdd_craftsman`

1. Un test de maquetación del pie que, en los seis anchos (320, 700, 701, 1023,
   1024, 1440), compare los tres `getBoundingClientRect().width` entre sí y el
   hueco vertical entre enlaces consecutivos de cada lista, sin literales de px.
   Los puntos de corte reales son `max-width: 700px`
   (`PieDePagina.module.scss:139`) y `min-width: 701px`/`max-width: 1023px`
   (`:156`); a ≤700 px la rejilla colapsa a `1fr`, así que «mismo ancho entre
   sí» sigue valiendo.
2. Un test de estilo computado que agrupe los 11 enlaces por el par
   (`font-size`, `color`) y exija exactamente un grupo.
3. Un test de `min-height` computada que compare los enlaces de "Contacto" (3
   ítems) con los de "Clínica"/"Contenido" (4 ítems): mismo valor.
4. Nada de SCSS. Si alguno de esos tests sale rojo la primera vez, el fallo está
   en el test, no en los estilos: las tres propiedades ya se cumplen hoy según
   las mediciones del documento de las leyes.

## Nota sobre finales de línea

No se comprobó ni se afirma nada sobre CR/LF en esta tanda. Los dos ficheros se
reescribieron conservando el final de línea que ya tenían en el árbol de
trabajo, y `.gitattributes` es quien normaliza al commitear.
