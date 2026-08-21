# Review — feature informacion_contacto (id 10), ronda 1

**Veredicto:** APPROVED

## Cobertura de escenarios (@s ↔ test)
- @s1: [x] `InformacionContacto.test.tsx:13-29` — 4 grupos exactos, orden exacto, ausencia de "Email".
- @s2: [x] `InformacionContacto.test.tsx:31-42` — 2 lineas exactas + negativos del prototipo heredado.
- @s3: [x] `InformacionContacto.test.tsx:44-61` — 2 enlaces, nombre/href exactos, negativos de telefonos inventados.
- @s4: [x] `InformacionContacto.test.tsx:63-80` — 3 tramos exactos via dt/dd, negativos "urgencias"/"24".
- @s5: [x] `InformacionContacto.test.tsx:82-97` — 1 enlace, nombre/href exactos, negativos, nombre de grupo exacto.
- @s6: [x] `InformacionContacto.test.tsx:99-116` — sin "Llamar ahora", sin "24 h"/"24h"/"24 horas", sin guardia falsa, 1 sola ocurrencia del numero de urgencias.
- @s7: [x] `InformacionContacto.test.tsx:118-136` — sin grupo Email/Correo, sin mailto:, sin patron de email, sin literales heredados.
- @s8: [x] `InformacionContacto.test.tsx:138-154` — 1 iframe, titulo exacto, posicion previa a "Direccion" (que ya es el primer grupo por @s1).
- @s9: [x] `InformacionContacto.test.tsx:162-183` — img/script sin origen externo, aria-describedby real, aviso como nodo de texto real dentro de la region, sin aria-hidden/hidden. Clausula de tipografia/hoja de estilo declarada [Decision 11 — fuera del gate] en el propio comentario del test (lineas 159-161), NO simulada.
- @s10: [x] `InformacionContacto.test.tsx:191-200` — loading="lazy". Clausula de peticion diferida real declarada [Decision 11 — fuera del gate] (comentario lineas 185-190), NO simulada.
- @s11: [x] `InformacionContacto.test.tsx:202-219` — doble de test inyectado por prop, primer enlace refleja el doble, numero real ausente. Literal esperado (tel:+34600000000) escrito a mano, no derivado del simbolo de produccion.
- @s12: [x] `InformacionContacto.test.tsx:221-245` — grupo desaparece, 3 restantes en orden, sin placeholders, tel: completos.
- @s13: [x] `InformacionContacto.test.tsx:247-264` — grupo desaparece, orden de los demas, sin dl vacio.
- @s14: [x] `InformacionContacto.test.tsx:266-278` — sin grupo Direccion, sin iframe, sin [src] externo.
- @s15: [x] `InformacionContacto.test.tsx:280-295` — sin valoracion/registro/antiguedad/precio.
- @s16: [x] `InformacionContacto.test.tsx:297-302` — lanza con el valor recibido en el mensaje, sin enlace tel:+34 a medias.

16/16 escenarios con al menos un test concreto, uno a uno contra el .feature real (no solo contra el relato de la bitacora).

## Disciplina TDD
- Produccion sin test que la pida? NO. Cada linea de InformacionContacto.tsx / InformacionContacto-logica.ts se rastrea a un ciclo Rojo-Verde-Refactor concreto en progress/tdd_informacion_contacto.md (ciclos 1-16). Verificado con sabotaje propio (ver abajo) que ninguna guarda esta de mas ni de menos.
- Evidencia de Rojo-Verde-Refactor? SI, y verificada con evidencia propia, no solo con el relato:
  - Ciclos 6, 7, 15 y 16 pasaron a la primera (sin codigo nuevo que los hiciera fallar) — la bitacora documenta sabotaje manual + reversion para cada uno. Reproduje independientemente el sabotaje de @s16 (bypaseando enlaceLlamada con una concatenacion manual de tel:+34 mas digitos, en InformacionContacto-logica.ts): 1 test cae (@s16), el resto (15/16) sigue verde. Revertido; diff contra el original resulto identico.
  - Verifique ademas, con sabotaje propio no descrito en la bitacora, la independencia de los tres bloques que fallan cerrado (@s12/@s13/@s14): forzando cada guarda (enlaceUrgencias !== null en linea 93, horario.length > 0 en linea 81, direccion !== null en linea 53 de InformacionContacto.tsx) a verdadero incondicional, una a la vez, cae exactamente 1 test cada vez (el propio @s12, @s13 o @s14), sin arrastrar a los otros dos ni a los 13 restantes. Confirma que cada bloque falla cerrado de forma independiente, y que no hay una guarda compartida disfrazando cobertura. Los tres sabotajes se revirtieron; diff contra el original resulto identico en cada caso.
  - node .harness/harness.mjs init corrido por mi de forma independiente tras cada reversion: verde, 232/232 tests, lint (oxlint --deny-warnings) y tsc -b limpios — mismo recuento que reporta la bitacora (216 previos + 16 nuevos).

## Calidad
- src/components/InformacionContacto-logica.ts — modulo puro de 27 lineas, una sola funcion (construirEnlaceTelefono) que delega en enlaceLlamada de src/lib/telefono.ts:40-42 sin envolver en try/catch: el .tsx nunca traga el error del normalizador (@s16). Verificado con grep que ningun literal tel: aparece en InformacionContacto.tsx (0 coincidencias): el numero siempre se deriva, nunca se reescribe a mano (@s11), coherente con el patron de memoria dato-de-negocio-en-fuente-unica-canonica.
- src/components/InformacionContacto.tsx:38-100 — componente unico que cablea; cada dato tiene su prop opcional con valor por defecto de datosNegocio (src/lib/site.ts) y sentinela null/array vacio para "ausente", mismo patron string-o-null que Hero.tsx (citado y reutilizado, no reinventado). Los tres condicionales de ausencia (direccion !== null, horario.length > 0, enlaceUrgencias !== null) estan desacoplados entre si — confirmado por sabotaje independiente arriba — y el de direccion fusiona correctamente mapa + aviso + bloque bajo un unico guard (@s14: sin direccion no hay por donde centrar el mapa).
- Decision 11 (clausulas fuera del gate de Vitest/Stryker en @s9/@s10): confirme que vite.config.ts:49 fija css: false de verdad (la razon alegada para excluir la clausula de tipografia/hoja de estilo es real, no una excusa), y que progress/gherkin_repair_informacion_contacto.md documenta la directiva humana que autorizo exactamente ese enrutamiento — coherente con lo que hace el .feature (lineas 180, 189) y con los comentarios del test (lineas 159-161, 185-190). Las 4 clausulas Decision-11 (dos por escenario) estan declaradas explicitamente, no simuladas con una asercion que finja medirlas.
- Nombres reveladores, sin numeros magicos, sin duplicacion relevante; comentarios explican el por que (p. ej. sandbox vacio en InformacionContacto.tsx:55-59, motivado por el lint del proyecto).
- Patron doble-de-test-anclado-al-literal-no-al-simbolo: sin hallazgos. El literal de @s11 (600 000 000 / tel:+34600000000) se escribe a mano en el test; no se importa ningun simbolo de produccion para construir el doble.
- Patron verde-por-vacuidad-en-puerta-de-verificacion: sin hallazgos bloqueantes. El unico bucle sobre un conjunto potencialmente vacio por construccion es @s9 (region.querySelectorAll con img y script, 0 elementos hoy) — pero el vacio ahi ES el estado correcto esperado (no debe haber ninguno), no un extractor roto que oculte una verificacion fallida; cualquier img o script con origen externo real que se anadiera haria fallar la asercion. No es el patron de puerta de produccion al que se refiere la memoria (que aplicaria a un extractor de build, inexistente en esta feature).
- node .harness/harness.mjs init: verde, corrido por mi de forma independiente — 232/232 tests, lint y typecheck limpios.

## Checkpoints
- C1: [x] ficheros base presentes, node .harness/harness.mjs init exit 0 (verificado por mi).
- C2: [x] informacion_contacto (id 10) es la unica feature in_progress en feature_list.json.
- C3: [x] src/components/InformacionContacto*.{ts,tsx} respeta la separacion modulo puro / componente; sin dependencias nuevas; git status sin restos de sabotaje ni ficheros de sondeo tras mis pruebas.
- C4: [x] hay test por modulo (InformacionContacto.test.tsx cubre tambien InformacionContacto-logica.ts); 232 > 0, todos verdes.
- C5: N/D a mitad de sesion (ronda de revision, no cierre); git status --porcelain sin sospechosos.
- C6: [x] 16/16 @s con test concreto (tabla arriba), sin produccion sin test que la pida (verificado con sabotaje propio, no solo con la bitacora).
- C7: pendiente de medicion independiente por mutation_tester (no existe todavia progress/mutation_informacion_contacto.md); no corresponde a esta puerta darlo por bueno.

## Cambios requeridos
Ninguno.
