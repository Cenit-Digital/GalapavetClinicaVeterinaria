# Reparación de features/faq.feature — hallazgos CONFIRMADOS

Fuente: progress/revision/VEREDICTO_faq.md (1 hallazgo CONFIRMADO de 4 veredictos).

## @s12 (L172-175, fixture sin nombrar / Then ciego a mutación / caso "pregunta vacía" sin cubrir) — CONFIRMADO

Reparado en `features/faq.feature`, escenario `@s12` (ahora ~líneas 170-179).

Cambios aplicados en una sola pasada coherente (los tres defectos citados en el
veredicto tocaban el mismo `Given`/`Then` del mismo escenario):

1. **Fixture sin nombrar → nombrado explícitamente.** El `Given` pasa de
   "tiene 3 entradas y una de ellas tiene la respuesta vacía" (no decía cuáles)
   a una tabla de 4 entradas con columnas `pregunta` / `respuesta`, cada fila
   concreta. El implementador ya no tiene que inventar el fixture: dos filas
   válidas (pregunta y respuesta reales, reutilizando literales ya usados en
   este mismo fichero: la franja horaria de `@s2` línea 84, y el teléfono de
   urgencias de `@s5` línea 113), una fila con la celda `respuesta` vacía, y
   una fila con la celda `pregunta` vacía (usando como respuesta el listado de
   los 5 bloques de servicio de `@s4` líneas 102-106, ya citado en este
   fichero).
2. **Then ciego a mutación → corregido.** Se sustituye la aserción negativa
   ("ninguno de esos controles tiene el nombre accesible de la entrada con
   respuesta vacía", que no fijaba ningún nombre positivo) por
   "sus nombres accesibles son, en este orden, «¿Qué horario tiene la
   clínica?» y «¿Qué hago si mi animal necesita atención fuera del horario?»"
   — mismo patrón exhaustivo ordenado que ya usa `@s1` línea 69. Un mutante
   que deje 2 controles con nombres erróneos-pero-no-vacíos ya no pasa: la
   lista completa y ordenada de los 2 supervivientes debe coincidir
   exactamente.
3. **Caso "pregunta vacía" sin ejercitar → cubierto.** La tabla de 4 entradas
   incluye ahora una fila con la celda `pregunta` en blanco (además de la fila
   con `respuesta` en blanco), así que el título del escenario ("Una entrada
   con pregunta o respuesta vacía se omite del acordeón") queda íntegramente
   cubierto por el propio `Given`, sin necesidad de duplicar el escenario ni
   renumerar las etiquetas `@s13` en adelante.

## Hallazgos NO tocados (REFUTADO en el veredicto, no se modifican)

- @s10 (L155/L160, "cinco respuestas simultáneas") — REFUTADO, sin cambios.
- @s10 (L160, choque con @s6 por "vacuna") — REFUTADO, sin cambios.
- @s2 (L86, "domingos cerrado" vs fuente) — REFUTADO, sin cambios.

Ningún otro escenario del fichero fue tocado.
