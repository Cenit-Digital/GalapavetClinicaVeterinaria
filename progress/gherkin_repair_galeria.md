# Reparación de features/galeria.feature — hallazgos CONFIRMADO

Fuente de hallazgos: `progress/revision/VEREDICTO_galeria.md` (8 CONFIRMADO, 2
REFUTADO). Los REFUTADO (@s5/@s6/@s7 separación sin literal, @s13 "atendidos
por Galapavet") no se han tocado.

## Hallazgos CONFIRMADO atendidos

1. **@s9, @s10 — Then sobre `scrollLeft` físico verde por vacuidad en jsdom**
   (bloqueante). Directiva humana: aplicar Decisión 11 de `project-spec.md`
   literalmente (declarar navegador real, no eliminar, no forzar verde vacío).
   - `@s9` (líneas ~161-174): reordenado el `Then`/`And` habilitado+nombre
     accesible primero (jsdom-decidible), y las tres cláusulas sobre
     `scrollLeft` físico ("sigue siendo 0", "nunca negativo", "no salta al
     final") ahora llevan un comentario explícito citando Decisión 11:
     verificadas con navegador real (Claude in Chrome / skill
     browser-automation), fuera del gate de Vitest/Stryker.
   - `@s10` (líneas ~176-185): la cláusula "no se solicita ningún
     desplazamiento a la pista" queda en el gate automático (es un chequeo de
     la llamada solicitada, decidible con un espía); "el desplazamiento
     horizontal de la pista no cambia" (scrollLeft físico) lleva el mismo
     comentario de Decisión 11.

2. **@s14 — cuarta cláusula con criterio no determinista pie→bloque**
   (bloqueante, reencuadrado). Línea ~219-220 (antes 185): se elimina "cada
   pie de foto que cita un servicio cita uno de los cinco bloques publicados
   por el cliente" (no mecánicamente decidible) y se sustituye por dos
   negaciones literales más, mismo patrón que las tres ya existentes,
   citando los rótulos de servicio inventado ya establecidos en
   `servicios.feature:255-256` ("Nutrición y etología", "Microchip y
   viajes"): `ningún pie de foto menciona "nutrición y etología"` / `"microchip y viajes"`.

3. **@s12 — aviso de demostración descrito por paráfrasis, sin literal**
   (grave). Línea ~200: el `Then` pasa de "declara que… son contenido de
   demostración" a un literal cerrado ("…es exactamente «Contenido de
   demostración. …»"), mismo patrón que `campanas_portada.feature:108` y
   `pagina_tienda.feature:191`. El texto reutiliza, sin inventar datos
   nuevos, la propia nota PENDIENTE ya presente en la cabecera del fichero
   (líneas 51-53: "el cliente no ha cedido ni una sola fotografía real ni
   consentimiento de las familias").

4. **@s4 — recorrido de tabulador acoplado al orden global de la landing**
   (grave). Línea ~122: el `When` pasa de "el visitante recorre la página con
   el tabulador hasta la sección «Galería»" a "el visitante mueve el foco por
   teclado hasta la pista de fotografías", igual de local que el patrón ya
   usado en `accesibilidad.feature:276` ("cada control interactivo recibe el
   foco por teclado"). Ya no depende del orden de secciones ajenas (hero,
   servicios, equipo…).

5. **CABECERA / @s1-@s4, @s11-@s14 — ningún escenario ejercita el catálogo
   real de producción** (bloqueante, matizado). Añadido `@s16` (nuevo, líneas
   ~230-235): usa explícitamente "el catálogo de galería que exporta el
   módulo de producción, sin sustituirlo por ningún doble de test" y exige
   `número de entradas > 0` — guarda anti-vacuidad mínima contra un catálogo
   de producción vaciado o corrompido, sin fijar una cifra (Decisión de no
   clavar el 9 del prototipo se respeta).

6. **@s1, @s2 — "al menos una entrada" vacía las comprobaciones de
   unicidad** (grave). Líneas ~95 y ~104: el cuantificador del `Given` pasa
   de "al menos una entrada" a "al menos dos entradas" solo en estos dos
   escenarios (los que comparan una entrada contra otra); el resto de
   escenarios no necesita el cambio y se ha dejado igual.

7. **@s1 — falta caso límite de entrada con nombre/pie en blanco** (grave).
   Añadido `@s17` (nuevo, líneas ~237-243): catálogo de 3 entradas con la
   segunda en blanco de nombre accesible, exige exactamente 2 figuras
   mostradas y que ninguna corresponda a la entrada en blanco — mismo patrón
   que `equipo.feature @s9`, `servicios.feature @s16` y `faq.feature @s12`.

8. **@s5 — aritmética de desplazamiento sin ancla a módulo puro** (grave).
   Línea ~130: el `When` pasa de "el visitante pulsa el botón «Foto
   siguiente»" a "el visitante pulsa el botón «Foto siguiente» y se calcula
   el desplazamiento que este solicita a la pista", nombrando explícitamente
   el cálculo (verbo ausente que señalaba el veredicto, contrastado con
   `campanas_portada.feature:147` "se construye el modelo…"). Cambio
   confinado a `@s5`: no se ha tocado `@s6`/`@s7`/`@s8`, que comparten
   estructura pero no están en la lista CONFIRMADO.

## Hallazgos CONFIRMADO no tocados aparte (ya cubiertos por lo anterior)

- Ninguno. Los 8 CONFIRMADO de la tabla del veredicto (colapsando @s9/@s10 en
  una sola entrada de la tabla, tratados arriba como los puntos 1) quedan
  todos atendidos.

## Cambios adicionales de trazabilidad

- Se añadió un bloque de cabecera "CORRECCIONES TRAS REVISIÓN ADVERSARIAL
  (18/08/2026)" (antes de `Feature:`) que resume estos 8 cambios y cita el
  veredicto, siguiendo el estilo ya usado por el resto de la cabecera del
  fichero (comentarios `#` numerados).
- El fichero pasa de 15 a 17 escenarios (`@s1`…`@s17`); ningún tag existente
  se ha renumerado.
