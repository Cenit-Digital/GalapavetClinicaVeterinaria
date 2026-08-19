# Reparación de features/campanas_portada.feature — hallazgos CONFIRMADOS

Fuente: `progress/revision/VEREDICTO_campanas_portada.md` (G3). 4 hallazgos CONFIRMADO,
2 REFUTADO (no tocados, tal y como pide el encargo).

## 1. @s9, @s10 (líneas 144-149 originales) — Then mezcla el plano de render sin `When` que lo invoque

CONFIRMADO. El `Then` de ambos escenarios afirmaba, además del error de construcción,
"no se renderiza ninguna tarjeta de campaña" — un hecho de la capa de render sin que el
`When` ("se construye el modelo...") lo invocara, rompiendo la disciplina de plano único
del fichero (docs/gherkin.md: "un solo `When` por escenario").

- **Qué cambié:** eliminé la línea `And no se renderiza ninguna tarjeta de campaña` de
  `@s9` (ahora línea ~148) y de `@s10` (ahora línea ~154). Cada escenario queda puro:
  un único `When` de construcción, un único `Then` sobre el error de construcción.
- **Dónde se recupera la cobertura perdida:** el hecho de render ("nada se pinta si la
  construcción falla") se traslada a un escenario nuevo, propio de su plano — ver
  hallazgo 4 más abajo, `@s18` (líneas ~207-212).

## 2. @s13 (líneas 173-178 originales) — puerta anti-terceros más débil que `galeria.feature`

CONFIRMADO. `galeria.feature:157` rechaza cualquier origen que no empiece por
`"http://"`, `"https://"` ni por `"//"`; `campanas_portada.feature` solo comprobaba que
el origen no *contuviera* `"http://"`/`"https://"`, dejando pasar un origen
protocolo-relativo como `"//cdn.otrohost.com/foto.jpg"`.

- **Qué cambié (línea ~175):** `Then ningún origen contiene "http://" ni "https://"` →
  `Then ningún origen empieza por "http://", por "https://" ni por "//"`, literal
  calcado de `features/galeria.feature:157` (mismo patrón `puerta-anti-terceros-prohibe-peticiones-no-cadenas-externas`,
  Decisión 9 / Invariante 3). La línea `And ningún origen contiene "pexels"` no estaba
  señalada en el veredicto y se deja igual.

## 3. @s16 (líneas 194-199 originales) — `Then` ciego a la identidad de los supervivientes

CONFIRMADO. Solo se afirmaba "hay exactamente 2 tarjetas" y "ninguna vacía"; ningún
escenario anclaba **qué** 2 títulos debían sobrevivir, así que un mutante que descartara
la campaña equivocada (o duplicara una superviviente) seguía pasando el escenario.

- **Qué cambié (líneas ~192-198):** el `Given` pasa de "una de las tres campañas..." a
  nombrar la campaña concreta: `Given la campaña "Chequeo" del catálogo de demo tiene el
  título vacío` (literal ya usado en el Background/`@s2`), y se añade
  `And sus títulos son exactamente "Vacunaciones" y "Odontología", en ese orden` antes de
  la aserción de nombre accesible ya existente.

## 4. @s16/@s17 vs @s9/@s10 — asimetría de verbo "construye el modelo" / "renderiza"

CONFIRMADO. `stryker.config.json` solo muta `*.ts`/`*-logica.ts`, no `.tsx`. Al exigir
`@s9`/`@s10` el verbo "se construye el modelo" (plano puro, mutado) pero `@s16`/`@s17`
solo "se renderiza" (plano DOM, no mutado), nada en el contrato impedía que el filtro de
título vacío viviera entero en el `.tsx`, fuera de la superficie que Stryker certifica.

- **Qué cambié:** en vez de reescribir `@s16`/`@s17` (que ya eran internamente
  consistentes en su propio plano de render, y no estaban señalados por identidad de
  plano interno), añadí **tres escenarios nuevos** al final del fichero que cierran la
  simetría en ambas direcciones, reutilizando verbos y literales ya presentes en el
  fichero:
  - `@s18` (líneas ~207-212): compañero de plano-render para `@s9`/`@s10` — reutiliza el
    `Given` de precio inválido de `@s9` y el `When`/`Then` literal de `@s17`
    ("se renderiza la portada" → "no existe ninguna región..." / "no existe ninguna
    tarjeta de campaña"). Cierra también la pérdida de cobertura del hallazgo 1.
  - `@s19` (líneas ~214-219): compañero de plano-puro para `@s16` — mismo `Given`
    ("Chequeo" con título vacío) pero `When se construye el modelo de la sección de
    campañas`, forzando que el filtro de título vacío sea observable en el módulo puro.
  - `@s20` (líneas ~221-224): compañero de plano-puro para `@s17` — las tres campañas
    con título vacío, mismo verbo "se construye el modelo", `Then el modelo no contiene
    ninguna entrada`.
  Con esto, cada comportamiento de filtrado/validación de campañas queda exigido tanto
  en el plano puro (`*-logica.ts`, mutado por Stryker) como en el plano de render
  (`.tsx`), simétricamente para los dos ejes (dato inválido y título vacío).

## Hallazgos REFUTADOS — no tocados

- Background (líneas 78-80) vs @s9/@s10/@s15 — REFUTADO, patrón "base + anulación
  puntual" ya usado sin objeción por @s15. Sin cambios.
- @s16 "falla a medias" vs política fail-closed — REFUTADO, son dos reglas distintas
  (dato ausente → se omite el bloque; dato inválido → falla cerrado) y cada escenario
  aplica la que le corresponde. Sin cambios.

## Resultado

Escenarios totales: 17 → 20 (`@s1`-`@s20`). Tags `@s1`-`@s8`, `@s11`-`@s12`, `@s14`-`@s15`
no se tocaron (no estaban en el alcance de ningún hallazgo CONFIRMADO). `feature_list.json`
no se modificó (queda fuera del alcance de esta reparación puntual).

## Corrección posterior (verificación de solo lectura)

Una verificación posterior de solo lectura encontró 2 problemas que esta reparación no
había cerrado. Ambos corregidos ahora en `features/campanas_portada.feature`:

1. **Divergencia de copy entre ficheros hermanos.** `features/pagina_campanas.feature`
   (reparado en su propia pasada) cambió el aviso de demo de "Galapavet no publica
   ninguna campaña" a "Galapavet no ha confirmado ninguna campaña", porque
   `docs/datos-galapavet.md` §7 solo marca como NO VERIFICABLE las campañas **con
   precio**, no "ninguna campaña" en general: "no publica" era una afirmación
   categórica que la fuente no sostiene en esa amplitud; "no ha confirmado" sí es fiel
   a lo que dice la fuente. `campanas_portada.feature` tenía el mismo defecto de fondo
   y no se corrigió en esta pasada (no estaba señalado en su propio VEREDICTO, pero es
   el mismo hallazgo). Se corrigió el verbo en las 3 apariciones del literal:
   - Línea ~32 (comentario de cabecera, prosa, "QUÉ CAMBIA RESPECTO AL CONTRATO
     HEREDADO").
   - Línea ~55 (comentario "TEXTO LITERAL DEL AVISO DE DEMO").
   - Línea ~108 (`@s4`, `Then el aviso visible es exactamente "..."`).
   El resto de la frase de `@s4` (incluida la mención a "Precio, vigencia y
   condiciones") se deja igual: es propia de este fichero y distinta de
   `pagina_campanas.feature`, no forma parte de este hallazgo.

2. **Cobertura perdida en el eje de vigencia inválida (plano de render).** El
   hallazgo 4 de este mismo documento afirmaba que `@s18` cerraba la simetría de
   plano-render/plano-puro para "cada eje" de dato inválido. Eso era **incorrecto**:
   `@s18` solo reutiliza el `Given` de precio inválido de `@s9`; el eje de vigencia
   inválida (el mismo dato que usa `@s10`, vigencia "Hasta el 30 de septiembre") nunca
   tuvo un compañero en el plano de render, solo existía en el plano puro (`@s10`,
   `When se construye el modelo...`). Se añadió `@s21` al final del fichero,
   simétrico a `@s18` pero para vigencia, reutilizando el `Given` literal exacto de
   `@s10`:
   ```
   @s21
   Scenario: Una vigencia inválida deja la portada sin ninguna tarjeta de campaña
     Given una campaña del catálogo de demo declara la vigencia "Hasta el 30 de septiembre"
     When se renderiza la portada
     Then no existe ninguna región cuyo nombre accesible sea "Campañas de prevención"
     And no existe ninguna tarjeta de campaña
   ```
   Con esto, tanto el eje de precio como el de vigencia quedan cerrados en ambos
   planos (puro y render). Escenarios totales tras esta corrección: 20 → 21
   (`@s1`-`@s21`).
