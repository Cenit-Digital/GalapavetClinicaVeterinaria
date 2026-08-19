# Reparación — features/datos_negocio.feature

Fuente del veredicto: `progress/revision/VEREDICTO_datos_negocio.md` (3 CONFIRMADO,
4 REFUTADO). Se repararon únicamente los 3 CONFIRMADO. Los REFUTADO no se tocan.

## Hallazgos CONFIRMADO atendidos

1. **`@s19` (líneas 198-203 originales) — L1, grave — Given no excluye los
   ficheros de test.**
   Cambio: línea ~204 (`Given todos los ficheros de código de la web, salvo los
   ficheros de test`). Se añade la exclusión mirando el precedente ya usado en
   `tokens_marca.feature:224` ("salvo el fichero de tokens de marca"), que es la
   misma familia de puerta anti-literal-hardcodeado del proyecto. Resuelve la
   autocontradicción con la cabecera (líneas 10-12), que exige copiar cada
   teléfono literal a mano en los tests: sin la exclusión, esos mismos tests
   habrían sido señalados como una fuga del dato fuera de la fuente única.

2. **`@s19` — L3, grave — sin escenario gemelo de conjunto vacío de ficheros.**
   Cambio: escenario nuevo `@s20` insertado justo después de `@s19` (líneas
   ~209-215), calcado del patrón ya usado en `tokens_marca.feature` @s17/@s21
   (falla, y el motivo del fallo declara "0 ficheros inspeccionados", sin
   informar falsamente de que "no encontró ningún teléfono"). Cierra el hueco:
   un glob que devuelva 0 ficheros por error ya no puede pasar la puerta en
   silencio.

3. **CABECERA — L2 y L3, grave — el §1 Identidad (nombre comercial, descriptor,
   localidad) queda fuera del alcance declarado y ningún escenario lo cubre.**
   Cambios:
   - Cabecera del fichero (líneas 14-18): el alcance declarado ahora dice
     "§1 (identidad), §2 (NAP), §3 (horario) y §9 (lo que NO existe)" y se
     añaden las tres filas de datos de identidad (Nombre comercial "Galapavet",
     Descriptor "Centro integral veterinario", Localidad "Galapagar (Madrid)"),
     copiadas literal de `docs/datos-galapavet.md` §1.
   - Escenario nuevo `@s21` al final del fichero (líneas ~217-223): declara la
     identidad una sola vez en la fuente única y exige que el descriptor "por
     sí solo" ("Centro integral veterinario") y su "forma compuesta" ("Centro
     integral veterinario en Galapagar, Madrid.") no puedan divergir. Ambos
     literales no son inventados: son citas exactas de los que ya escriben a
     mano `features/cabecera_y_navegacion.feature:203` y
     `features/pie_de_pagina.feature:88` respectivamente — el hallazgo señalaba
     justo esa divergencia silenciosa entre esos dos ficheros; este escenario
     les da, dentro de este contrato, un origen común frente al que
     verificarse.

## Hallazgos NO tocados (REFUTADO, no forman parte de esta reparación)

- `@s5` · `@s6` · `@s12` (mensajería/WhatsApp) — REFUTADO, es PENDIENTE
  declarado a propósito.
- `@s19` línea 203 (cribado de dirección/CP/email) — REFUTADO, cubierto en
  otros ficheros.
- CABECERA (años de actividad / nº de registro) — REFUTADO, cubierto en otros
  ficheros.
- `@s15` (cláusula débil "no se obtiene ningún valor") — REFUTADO, ya
  compensado por sus hermanos en el mismo escenario.
