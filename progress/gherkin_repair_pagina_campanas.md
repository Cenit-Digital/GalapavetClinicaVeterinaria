# Reparación de features/pagina_campanas.feature — hallazgos CONFIRMADOS de VEREDICTO_pagina_campanas.md

Fuente del veredicto: `progress/revision/VEREDICTO_pagina_campanas.md`. Se atienden los
**4 hallazgos CONFIRMADO**. Los 2 REFUTADO (`@s16` tel: E.164 derivado; nota de coherencia
con `campanas_portada.feature`) no se tocan, como indica la nota de la tarea.

## 1. CABECERA / @s15 / @s34 / @s35 (`duracion` sin cobertura) — grave — CONFIRMADO

- **Qué cambié:** añadido `@s40`, escenario nuevo al final del fichero (líneas ~523-529),
  que replica el patrón fallo-cerrado de `@s34`/`@s35` para el campo `duracion`, con el
  valor literal `"30 min · una sola visita"` ya citado en la propia cabecera (línea 45) y
  el mensaje de error `"duración no confirmada"`, consistente por género con
  `"vigencia no confirmada"` (`@s34`).
- Actualizada la cita de la cabecera en el punto 2 de "QUÉ SE APARTA DEL PROTOTIPO" (línea
  ~47): `(@s34, @s35)` → `(@s34, @s35, @s40)`.
- Actualizada la cita del bloque PENDIENTE (línea ~131): `@s33-@s35` → `@s33-@s35 y @s40`.
- No toqué `@s15` (panel de datos pendientes): el hallazgo confirmado es sobre la ausencia
  de un fallo cerrado para `duracion` en la construcción del catálogo, no sobre el rótulo
  visible del panel (que ya cubre Precio/Vigencia/Plazas y no promete una fila de Duración
  en el aviso literal ni en la tabla `@s15`).

## 2. @s5 / @s14 / CABECERA (aviso "Galapavet no publica ninguna campaña") — grave — CONFIRMADO

- **Qué cambié:** sustituido el literal "Galapavet no publica ninguna campaña" por
  "Galapavet no ha confirmado ninguna campaña" en las 4 apariciones:
  - `@s5` (línea ~205, `Then el contenido principal muestra el texto exacto "..."`).
  - `@s14` (línea ~291, `And el contenido principal muestra el texto exacto "..."`).
  - Bloque TEXTOS LITERALES / AVISO DE DEMOSTRACIÓN (líneas ~110-113).
  - Prosa de la cabecera, bullet DATOS (líneas ~14-20), reescrita para que la cita quede
    proporcionada a lo que realmente sostiene: docs/datos-galapavet.md no recoge ninguna
    entrada de campaña (por su propia regla de "solo entra lo verificado"), §7 marca los
    precios de campaña heredados como NO VERIFICABLE, y §9 dejaba precios/condiciones como
    pendientes — ya no se afirma como hecho sobre lo que Galapavet publica en su sitio real
    (que no está verificado), sino sobre lo que este proyecto tiene confirmado por el
    cliente (que sí es trivialmente cierto por construcción del propio `docs-datos-galapavet.md`).
- El resto de la frase (precio/vigencia/plazas/condiciones pendientes de confirmar) no
  cambia: ya estaba correctamente acotado.

## 3. @s20 (imágenes, verde por vacuidad) — grave — CONFIRMADO

- **Qué cambié:** añadida una guarda anti-vacuidad como primer `Then` de `@s20` (línea
  ~348): `Then hay exactamente 3 imágenes en el contenido principal, una por cada tarjeta
  de campaña`. El número 3 es consecuencia mecánica del Background/`@s3` (el catálogo de
  demo declara exactamente 3 campañas, una tarjeta cada una). Con esta línea, vaciar el
  array de imágenes ya no deja los tres `Then` originales en verde.

## 4. @s21 / @s22 / @s23 (rama de movimiento reducido sin módulo puro) — grave — CONFIRMADO

- **Qué cambié:** añadido `@s41`, escenario nuevo al final del fichero (líneas ~531-540),
  que contrata la decisión de tres vías (reducir movimiento / sin preferencia / no
  consultable → `auto`/`smooth`/`auto`) como cálculo puro, calcado del patrón ya usado en
  `features/pagina_blog.feature` `@s29` (`Given la lógica de desplazamiento ... consulta la
  preferencia ... When se calcula el comportamiento de desplazamiento para cada preferencia
  ... Then el resultado es, respectivamente, exactamente: | tabla |`), extendido a la
  tercera rama (preferencia no consultable) que `pagina_blog` no necesitaba pero
  `pagina_campanas` sí contrata explícitamente en `@s23`.
- Actualizada la cita de la cabecera en el punto 11 (líneas ~87-92) para dejar explícito
  que `@s21-@s23` cubren la interacción DOM y `@s41` ancla la misma decisión como función
  pura del módulo `*-logica.ts`, de forma que la mutación no dependa de un `.tsx` que
  StrykerJS no muta.
- No toqué `@s21`, `@s22` ni `@s23`: siguen siendo válidos como contrato de interacción
  (foco, `smooth`, consola sin error); el hueco de protección por mutación se cierra con el
  nuevo `@s41`, sin reescribir escenarios que no estaban en la lista CONFIRMADO.

## Hallazgos REFUTADO (no tocados)

- `@s16` (`tel:+34910829267`): refutado — cubierto por el Invariante 2 de `project-spec.md`
  (formas derivadas calculadas de la fuente única). Sin cambios.
- CABECERA (nota de coherencia con `campanas_portada.feature`): refutado — su alcance
  declarado (literales compartidos sin cambios) es correcto. Sin cambios.

## Nota sobre Decisión 12 (prohibición de «€» para el dato pendiente §9)

La cabecera de este fichero no menciona ninguna posible inconsistencia con
`pagina_tienda.feature` respecto al símbolo «€», así que no había nada que aclarar por esa
vía. La prohibición de «€»/«%» en `@s15` y `@s24` (precio real de campaña, dato pendiente)
se deja intacta, tal como confirma la Decisión 12 de `project-spec.md`.
