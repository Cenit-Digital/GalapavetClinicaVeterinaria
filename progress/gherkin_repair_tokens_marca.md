# Reparación de features/tokens_marca.feature — VEREDICTO_tokens_marca.md

Fuente: `progress/revision/VEREDICTO_tokens_marca.md` (4 CONFIRMADO, 3 REFUTADO
no tocados). Cada hallazgo CONFIRMADO se repara aquí; los REFUTADO se dejan
intactos porque el propio veredicto ya explica por qué no son defecto.

## Hallazgos CONFIRMADO atendidos

### 1. `@s18` (grave, L1) — Given sin fixture, escanea el árbol real vacío

`tokens_marca` es la feature id 1, la primera del pipeline, y `src/` solo
tiene `.gitkeep`: el Given original "todos los ficheros SCSS del proyecto
salvo el fichero de tokens de marca" habría escaneado un conjunto vacío por
construcción cuando el `tdd_craftsman` lo implemente de forma autónoma.

- Cambiado el `Given` de `@s18` (línea ~243) de "todos los ficheros SCSS del
  proyecto salvo el fichero de tokens de marca" a un fixture explícito: "un
  conjunto de 3 ficheros SCSS de prueba que consumen tokens de marca y no
  declaran ningún color literal". Ya no depende del estado real de `src/`.
- Ajustado el `And` de conteo (línea ~246) de "es mayor que 0" a "es 3", exacto
  y anclado al tamaño del fixture declarado en el propio Given (precisión
  quirúrgica: mismo defecto, un solo escenario tocado).

### 2. CABECERA / `@s8` / `@s16` (grave, L2) — decisión ya cerrada reabierta como PENDIENTE

`docs/datos-galapavet.md:175` cierra sin condicional la pregunta sobre el par
verde-profundo/lima ("No se usa"), pero la cabecera la presentaba como
PENDIENTE ("Confirmar con diseño...") y `@s16` no excluía ese par del
catálogo, dejando pasar por la puerta exactamente el par que diseño descartó.

- Cabecera, sección MÍNIMOS EXIGIDOS (líneas ~48-54): añadida una nota
  "EXCEPCIÓN DECIDIDA" que cita `docs/datos-galapavet.md:175` y aclara que
  `@s16` excluye la pareja pese a que `@s8` confirma que pasa aritméticamente
  (no hay contradicción: son dos funciones distintas, la aptitud matemática y
  el catálogo de uso).
- Cabecera, sección PENDIENTE (líneas ~67-68): la viñeta "PENDIENTE: la pareja
  #48704B sobre #B4C718... Confirmar con diseño" sustituida por "RESUELTO (ya
  no pendiente)... No se reabre", que remite a la nota anterior en vez de
  duplicarla.
- `@s16` (línea ~226): añadido `And el catálogo no declara ningún uso para la
  pareja formada por el color "#48704B" y el fondo "#B4C718"`. Esta es la
  guarda que faltaba: si el catálogo llegara a incluir ese par para "texto
  grande" o "componente" (ambos matemáticamente aptos según `@s8`), la puerta
  ahora lo rechaza igualmente, honrando la decisión de diseño y no solo el
  umbral aritmético.
- No se tocó `@s8`: el propio veredicto aclara que el escenario en sí mismo no
  es incorrecto (mide la función de aptitud pura, no la decisión de catálogo).

### 3. `@s8` (grave, L3) — "texto grande" nunca se prueba en su límite exacto

`@s9`/`@s10` prueban el límite de "texto normal" (4.5 y 4.49) y `@s11` prueba
el límite de "componente" (3.0), pero "texto grande" comparte el umbral 3:1 y
solo se ejercita en `@s8` con 3.01 — nunca en el propio límite. Un mutante que
cambie `>=` por `>` solo en la rama de "texto grande" no lo mata ningún `Then`
del fichero.

- Insertado un nuevo escenario justo después de `@s11` (línea ~172-176):
  "Un ratio exactamente igual al mínimo de texto grande se considera apto",
  con `Given un ratio de contraste de exactamente 3.0` / `When evalúo su
  aptitud para texto grande` / `Then la respuesta es apta`, mismo patrón
  minimal que `@s11`.
- Etiquetado `@s23` (siguiente tag libre) en vez de renumerar `@s12`-`@s22` en
  cascada: esas anclas ya están citadas por `progress/current.md` y por otros
  `VEREDICTO_*.md`/`CONFIRMADOS.md` como ejemplo de patrón (p. ej. `@s17` y
  `@s21` como guardas anti-vacuidad de referencia). Renumerar en cascada
  habría tocado 11 líneas de escenarios que no están en la lista CONFIRMADO,
  violando la precisión quirúrgica pedida. Se dejó un comentario explicando el
  salto de numeración justo antes del escenario.

### 4. `@s16` (grave, L3) — anti-vacuidad solo global, no por categoría

La única guarda de no-vacuidad de `@s16` era "el número de parejas evaluadas
... es mayor que 0" (conteo GLOBAL). Si la clasificación por uso se rompiera
(p. ej. todo cae en "componente"), las cláusulas "ninguna pareja de uso
texto normal/texto grande" se cumplirían por vacuidad y la puerta pasaría en
verde sin haber comprobado dos de sus tres categorías.

- `@s16` (líneas ~221, 223, 225): añadidas tres cláusulas `And existe al menos
  una pareja de uso "<uso>" evaluada`, una por cada uso ("texto normal",
  "texto grande", "componente de interfaz o borde de foco"), intercaladas
  junto a su respectivo `Then` de umbral. Resuelto en la misma pasada que el
  hallazgo 2 porque ambos tocan el mismo escenario `@s16` (regla de "misma
  zona del fichero → una sola pasada coherente").

## Hallazgos REFUTADO — no tocados

- `@s16` (menor, L1 — lectura ambigua de "del proyecto"): no tocado, el propio
  veredicto explica que el patrón interno del fichero ("del proyecto" para
  artefactos propios) ya desambigua.
- `@s1` (menor, L2 — solo 3 de 4 hexadecimales): no tocado, es una elección
  deliberada ya justificada (blanco es color base/neutro, no de marca).
- CABECERA (menor, L2 — falta el par negro/lima 11.12 en la tabla de la
  cabecera): no tocado, la cabecera declara explícitamente que no es guía
  exhaustiva y ese par no aporta ningún límite nuevo a la función de aptitud.

## Resultado

4/4 hallazgos CONFIRMADO reparados. `features/tokens_marca.feature` queda con
23 escenarios (22 originales + 1 nuevo `@s23`), Gherkin válido, sin tocar
ningún escenario fuera de la lista CONFIRMADO salvo las líneas estrictamente
necesarias para las guardas y el fixture.
