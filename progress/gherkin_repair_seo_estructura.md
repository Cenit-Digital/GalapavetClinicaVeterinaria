# Reparación de features/seo_estructura.feature — hallazgos CONFIRMADOS

Fuente: `progress/revision/VEREDICTO_seo_estructura.md`. Directiva de alcance
aplicada primero: Decisión 13 de `project-spec.md` (4 → 6 páginas, incluidas
`ficha de campaña` y `artículo del blog`), que también era la vía correcta
para cerrar los dos hallazgos sobre @s4/@s5.

## Hallazgos CONFIRMADOS atendidos

1. **@s10 (`telephone`), grave.** Antes el `Then` de la línea ~267 hablaba en
   singular de "el nombre accesible del enlace de teléfono visible" sin
   decidir cuál de los tres teléfonos de `docs/datos-galapavet.md` §2
   alimenta la propiedad. Ahora (línea ~294-295) fija que es el PRIMERO de
   los dos teléfonos de la clínica, "91 082 92 67", y añade un `And` que
   prohíbe explícitamente que coincida con el segundo teléfono o con el de
   urgencias. También se reescribió el bloque de comentario "DATOS QUE
   ALIMENTAN EL BLOQUE" (línea ~124-130) para documentar la misma decisión.

2. **@s10 (correspondencia de tramos), grave.** La cláusula ambigua "cada
   tramo... se corresponde con un tramo del horario visible, sin sobrar ni
   faltar ninguno" (antigua línea 268) no distinguía cardinalidad de
   subcadena. Se sustituyó (línea ~296-297) por dos `And` que fijan
   explícitamente los tres tramos por su día y hora exactos y exigen que
   cada uno aparezca como subcadena del texto visible del horario —aunque
   el texto visible junte los dos tramos de lunes a viernes en una sola
   línea, como ya hace `informacion_contacto.feature` @s4— más una guarda de
   que no hay horas visibles sin respaldo en el bloque.

3. **@s19 (cribado del reclamo de urgencias), grave.** Se amplió el cribado
   (línea ~383) con una nueva cláusula que prohíbe "todos los días del año"
   y "desde 2013" en título y descripción, replicando el cribado que
   `datos_negocio.feature` @s14 ya hace a nivel de fuente y citando el
   literal «desde 2013» ya usado en `pie_de_pagina.feature` e
   `informacion_contacto.feature`. No se añadió "24/7" ni "siempre abierto"
   por no ser literales establecidos en ningún fichero ni en
   `docs/datos-galapavet.md`; habría sido invención.

4. **@s5 (descripciones: Then-que-solo-cuenta), grave.** Reescrito el
   escenario completo (línea ~227-241): añade una tabla de seis fragmentos
   exclusivos por página ("Galapagar", "prevención", "Ficha", "Blog",
   "Artículo", "Tienda" — el primero ya usado como dato de localidad, el
   segundo tomado del propio título de `pagina_campanas.feature`
   ("Página de campañas de prevención..."), el resto son las palabras que ya
   nombran cada página en el propio `Given`) y una guarda de exclusividad
   cruzada que impide que el fragmento de una página aparezca en la de otra
   — cierra el hueco de "cuatro cadenas basura distintas satisfacen el
   escenario" y el de "mutante que baraja las descripciones".

5. **@s4 (títulos: sin ancla por página), grave.** Mismo tratamiento que el
   punto 4, aplicado al escenario de títulos (línea ~210-225): se conserva
   el ancla compartida "Galapavet" y se añade la misma tabla de seis
   fragmentos exclusivos con su guarda de no-cruce, cerrando el hueco del
   mutante que intercambia qué título va a qué página.

6. **@s20 (Open Graph: existencia sin valor), grave.** Se añadió (línea 396)
   `And ninguno de esos cuatro valores es una cadena vacía ni solo espacios`
   inmediatamente después del `Then` de existencia, replicando literalmente
   el patrón anti-vacuidad que ya usan @s4/@s5. No se fijó un valor concreto
   de `og:type` por no haber ninguna fuente que lo determine (no es un dato
   de negocio de `docs/datos-galapavet.md`); fijarlo habría sido inventar.

7. **@s15/@s16 (guarda de omisión: hueco de mutación LogicalOperator),
   grave.** Se añadieron dos escenarios nuevos al final del fichero,
   `@s21` y `@s22` (líneas ~407-421), en vez de intercalar tags fuera de
   orden en medio del fichero (aquí no hay precedente de tags con sufijo
   como `@s15b` en ningún otro `.feature` del proyecto, así que se
   respetó la numeración secuencial estable):
   - `@s21` prueba que con solo UNA de las dos coordenadas verificada
     (latitud sin longitud) la geolocalización se sigue omitiendo entera —
     cierra el hueco entre el operador `||` real y un mutante `&&` en la
     condición de omisión de `geo`.
   - `@s22` prueba que un dato opcional presente (email) no impide que
     otro dato opcional distinto (redes) se siga omitiendo — cierra el
     hueco de una condición de omisión indebidamente acoplada entre dos
     propiedades independientes.
   Ambos son Given hipotéticos sobre la fuente única (mismo patrón que ya
   usan @s11/@s15/@s16/@s17), no afirman ningún dato real nuevo de
   Galapavet.

## Aplicación de la Decisión 13 (alcance 4 → 6 páginas)

Se amplió el `Given` de página de @s4, @s5, @s12 y @s19 de "las cuatro
páginas publicadas: inicio, campañas, blog y tienda" a "las seis páginas
publicadas: inicio, campañas, ficha de campaña, blog, artículo del blog y
tienda" (nombres literales alineados con `accesibilidad.feature` @s1: "Landing",
"Campañas", "Ficha de campaña", "Blog", "Artículo del blog", "Tienda"), y los
conteos "cuatro"/"los cuatro" a "seis"/"los seis" en las mismas cuatro
escenas. Se añadió una entrada nueva en la tabla de decisiones del
encabezado del fichero (línea ~19-24) citando la Decisión 13 y remitiendo a
los cuatro escenarios afectados.

## Hallazgos REFUTADOS — no tocados

- **@s2 (orden del `charset`).** El propio veredicto lo descarta: no hay
  divergencia práctica posible en este proyecto (`index.html` ya declara
  `<meta charset>` antes de `<body>`, sin gestor dinámico de `<head>`). No se
  modificó nada.
- **@s8 (`@context`: sin literal exacto).** El veredicto lo descarta
  explícitamente por ser un matiz de formato del estándar, no del negocio, y
  advierte que fijarlo podría sobre-especificar. No se modificó nada.

## Resumen

7 hallazgos CONFIRMADOS atendidos (contando @s10-teléfono y @s10-tramos como
dos hallazgos distintos, tal y como los separa la tabla del veredicto).
2 hallazgos REFUTADOS respetados sin cambios. Alcance del fichero ampliado de
4 a 6 páginas según Decisión 13, con dos escenarios nuevos (@s21, @s22)
añadidos al final para no romper la numeración estable existente.
