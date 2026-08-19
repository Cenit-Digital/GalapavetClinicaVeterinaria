# Reparación — features/pagina_tienda.feature

Fuente del veredicto: `progress/revision/VEREDICTO_pagina_tienda.md` (6 CONFIRMADO,
3 REFUTADO). Se repararon únicamente los 6 CONFIRMADO, aplicando la Decisión 12
de `project-spec.md` y la directiva específica del humano para este fichero.
Los 3 REFUTADO (#4 `@s41`, #5 `@s4`, #8 Background) ya tienen su justificación
escrita en el propio veredicto y no se tocan.

## Hallazgos CONFIRMADO atendidos

1. **#1 (bloqueante) — `@s14` + Background, `@s3`, `@s12`, `@s19`-`@s34`: cifras
   monetarias concretas para un negocio real sin rótulo suficientemente
   inequívoco.**
   Decisión 12 es explícita: NO se eliminan los precios de demo. Se refuerza en
   su lugar el aviso general de la página para que sea literal e inequívoco
   ("de ejemplo, no reales"), igual que exige el patrón de
   `campanas_portada.feature:108`. Cambios:
   - Cabecera, bloque "TEXTO LITERAL DEL AVISO DE DEMOSTRACIÓN" (líneas ~131-137):
     el texto pasa de "los productos y los importes... son de ejemplo" a "los
     productos y los precios... son de ejemplo, no reales".
   - `@s1` (línea ~191, `And el aviso visible de la página es exactamente...`):
     mismo texto actualizado, palabra por palabra, para que el `Then` siga
     citando el literal real.
   No se tocan `@s3`/`@s12`/`@s14`/`@s19`-`@s34`: sus rótulos por importe
   individual ("Importe de ejemplo", "Subtotal de ejemplo", "Total de
   ejemplo") ya cumplían la nota de diseño #3 de la cabecera (nunca rotular
   "Precio"/"PVP") y siguen intactos; lo que faltaba era el aviso general de
   página, ya corregido.

2. **#2 (grave) — `@s3` permite "€" mientras `pagina_campanas.feature` `@s15`/
   `@s24` lo prohíben para el mismo dato pendiente §9: desacuerdo real entre
   ficheros.**
   Resuelto documentando, no igualando reglas (Decisión 12 lo deja explícito).
   Cambio: cabecera, nuevo bloque "POR QUÉ ESTE FICHERO SÍ PERMITE EL CARÁCTER
   «€» Y pagina_campanas.feature NO" (líneas ~116-129). Explica que el importe
   de la tienda es contenido editorial/catálogo de demo (Decisión 1(b)),
   distinto del precio real de campaña que §9 lista como no publicado y que
   `pagina_campanas.feature` protege prohibiendo "€" por completo. No se toca
   `@s3` ni ningún `Then` de asserciones: el desacuerdo entre ficheros queda
   documentado como decisión deliberada, no como defecto a igualar.

3. **#3 (grave) — `@s33` exige espacio duro U+00A0 pero las 60 apariciones de
   "€" del fichero usaban espacio ASCII U+0020: discrepancia byte a byte.**
   Unificado TODO el fichero a un único carácter: espacio duro U+00A0 antes de
   "€" en los 60 importes de Background/escenarios (incluidas las dos cifras
   de ejemplo del propio comentario de diseño en las líneas ~57-58, que ahora
   coinciden con el "€" que reclaman representar). Verificado
   programáticamente tras el cambio: 60 apariciones con U+00A0 antes de "€", 0
   con U+0020, salvo **una única excepción documentada a propósito**: la cita
   literal del código del prototipo en la cabecera (`n.toFixed(2).replace('.',
   ',') + ' €'`, línea ~52), que debe conservar el espacio ASCII porque
   ilustra el bug histórico que el formato actual corrige — cambiarlo habría
   contradicho la propia frase adyacente ("espacio ASCII (U+0020)"). Se
   documenta la elección y la excepción en la cabecera (líneas ~58-63). Las 5
   apariciones restantes de "€" en el fichero (`«€»` en dos sitios de la
   cabecera, "€" citado entre comillas rectas en `@s33`) no llevan espacio
   delante: son menciones al carácter en sí, no importes, y no están sujetas
   a la regla de `@s33`.

4. **#6 (bloqueante) — `@s5` solo tiene aserciones negativas sobre el origen de
   las imágenes; un conjunto vacío las satisface vacuamente.**
   Cambio: `@s5` (línea ~217), nuevo `Then` de guarda anti-vacuidad antes de
   las negativas: `Then existen exactamente 8 imágenes de producto, una por
   cada tarjeta de la rejilla`. El número 8 es consecuencia mecánica del
   Background (ocho productos de demostración, uno por tarjeta), no un dato
   inventado.

5. **#7 (grave) — `@s27` prueba el tope de 99 unidades solo a nivel de
   interacción de UI; no hay gemelo de lógica pura, y `.tsx` queda fuera del
   objetivo de mutación de Stryker.**
   Cambio: nuevo escenario `@s43` (líneas ~612-618), añadido al final del
   fichero (mismo criterio que usaron reparaciones anteriores del proyecto:
   `progress/gherkin_repair_datos_negocio.md`, `progress/gherkin_repair_pie_de_pagina.md`)
   para no renumerar los tags ya estables `@s1`-`@s42`. Formulado como
   operación pura sobre "un estado de cesta", igual que `@s34`-`@s36`: parte
   de 99 unidades, añade 1 más, y exige que el estado resultante siga en 99
   sin lanzar error. Esto obliga a que el tope viva en el módulo puro
   (`*-logica.ts`), donde sí lo alcanza Stryker.

6. **#9 (menor) — `@s23` prueba la singularización del contador solo a nivel
   de interacción de UI; no hay gemelo de función pura de formateo, a
   diferencia de `@s33` para los importes.**
   Cambio: nuevo escenario `@s44` (líneas ~620-628), añadido al final del
   fichero junto a `@s43`, con el mismo patrón de tabla que `@s33`
   (`Given`/`When`/`Then` con tabla de casos: 0, 1, 2 y 15 artículos) para
   fijar la función pura de pluralización del contador como lógica mordible
   por mutación.

Ambos escenarios nuevos se agrupan bajo una sección `J` explícita al final del
fichero, con un comentario que remite a este informe y a `stryker.config.json`
como motivo de la exigencia.

## Hallazgos NO tocados (REFUTADO, ya justificados en el propio veredicto)

- `@s41` (menor, L2) — CTA de contacto genérico, no una función de inventario;
  el PENDIENTE de la cabecera ya documenta la elección.
- `@s4` (menor, L2) — la guarda de "Veterinaria La Sierra"/teléfonos ajenos ya
  la cubren `cabecera_y_navegacion.feature` y `pie_de_pagina.feature`, que sí
  pertenecen a esta página por composición; repetirla en `@s4` sería
  redundante.
- Background como "mutante inmortal" (menor, L3) — la propia alegación se
  autocalifica de no verificada; el patrón Background=caso base / `Given`
  explícito=override puntual es la convención estándar de BDD, no un defecto
  específico de este fichero.
