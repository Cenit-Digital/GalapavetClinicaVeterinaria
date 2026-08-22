# Review — feature seo_estructura (id 15)

## Ronda 1 — 22/08/2026

**Veredicto:** APPROVED

## Metodología de esta revisión

Lectura completa de `features/seo_estructura.feature` (421 líneas, @s1-@s22),
`progress/tdd_seo_estructura.md` y del código real en disco (no solo la
bitácora): `src/lib/seo-logica.ts` (+ test), `src/lib/site.ts` (+ test),
`src/lib/datosEstructuradosNegocio.ts` (+ test), `src/components/MetadatosPagina.tsx`
(+ test), `src/documento.test.ts`, `src/paginasSeo.test.tsx`,
`src/pages/Landing.tsx`, `src/pages/PaginaCampanas.tsx`, `src/pages/PaginaBlog.tsx`,
`src/pages/PaginaTienda.tsx`, `src/App.tsx`, `docs/datos-galapavet.md` (§1-§3, §8-§9).

**Sabotaje manual propio** (independiente del ya documentado por
`tdd_craftsman`): edité a mano `src/lib/site.ts:66`
(`calle: 'Carretera de Torrelodones, 11'` → `'CALLE SABOTAJE JUEZ XYZ'`) y
rendericé `<Landing />` SIN override (ruta por defecto, la que usa
producción) en un test temporal. Confirmado con `pnpm exec vitest run` +
`console.log`:
- Antes del sabotaje: `document.body` NO contiene el literal de sabotaje;
  `direccion.streetAddress` del JSON-LD = `"Carretera de Torrelodones, 11"`.
- Con el sabotaje activo: `document.body.textContent` SÍ contiene
  `"CALLE SABOTAJE JUEZ XYZ"` Y `direccion.streetAddress` del JSON-LD también
  vale `"CALLE SABOTAJE JUEZ XYZ"` — ambos cambian juntos.
Revertido el fichero (`git diff --stat src/lib/site.ts` solo muestra el diff
real de la feature, sin resto del sabotaje) y borrado el test temporal
(`git status` limpio de ficheros temporales). Confirma estructuralmente el
punto (e) del encargo: bloque y texto visible derivan del MISMO campo de
`site.ts`, sin caso feliz simulado.

## Cobertura de escenarios (@s ↔ test)

- @s1: [x] `src/documento.test.ts` (`lang="es-ES"`, minúscula/MAYÚSCULA, guion)
- @s2: [x] `src/documento.test.ts` (`utf-8` antes de `<body>`)
- @s3: [x] `src/documento.test.ts` (`width=device-width`, `initial-scale=1`, sin `user-scalable=no`/`maximum-scale=1`)
- @s4: [x] `src/lib/seo-logica.test.ts` (6 títulos, únicos, contienen "Galapavet", fragmento exclusivo) + `src/paginasSeo.test.tsx` (integración sobre las 6 rutas reales)
- @s5: [x] `src/lib/seo-logica.test.ts` (6 descripciones, únicas, fragmento exclusivo)
- @s6: [x] `src/lib/seo-logica.test.ts` (mensaje nombra descripción + "blog"/"tienda"; catálogo real también validado)
- @s7: [x] `src/lib/seo-logica.test.ts` + `src/components/MetadatosPagina.test.tsx` (exactamente 1 `<script>`, upsert tras navegar)
- @s8: [x] `src/lib/seo-logica.test.ts` (`@type` === `["VeterinaryCare","LocalBusiness"]` exacto, `toEqual`)
- @s9: [x] `src/lib/seo-logica.test.ts` + `src/lib/site.test.tsx` (describe `seo_estructura @s9`) — 5 propiedades exactas
- @s10: [x] `src/paginasSeo.test.tsx` — nombre, calle, CP/localidad, teléfono (dígitos, ignorando prefijo, ni 2º ni urgencias), 3 tramos como subcadena del panel visible
- @s11: [x] `src/paginasSeo.test.tsx` (override `calleDireccion`) + sabotaje propio de esta ronda sobre la ruta por defecto (ver arriba)
- @s12: [x] `src/paginasSeo.test.tsx` (6 rutas reales, mismo nombre/dirección/teléfono/horario) + `src/lib/datosEstructuradosNegocio.test.ts`
- @s13: [x] `src/lib/seo-logica.test.ts` (3 tramos exactos, `OpeningHoursSpecification`)
- @s14: [x] `src/lib/seo-logica.test.ts` (sin "Sunday" bajo ninguna forma, ningún `opens===closes`)
- @s15: [x] `src/lib/seo-logica.test.ts` (`'geo' in bloque` es falso, sin `latitude`/`longitude`, dirección completa)
- @s16: [x] `src/lib/seo-logica.test.ts` (sin `email`/`sameAs`, sin vacíos/nulos vía `valoresVaciosOnulos`)
- @s17: [x] `src/lib/seo-logica.test.ts` (horario `[]` ⇒ sin `openingHoursSpecification`, `name`/`address` siguen)
- @s18: [x] `src/lib/seo-logica.test.ts` (sin `aggregateRating`/`ratingValue`/`reviewCount`/"registro"/"fund")
- @s19: [x] `src/lib/seo-logica.test.ts` (sin tramo 00:00-00:00 ni 7 días; sin "24 h"/"24 horas"/"todos los días del año"/"desde 2013" en título/descripción)
- @s20: [x] `src/components/MetadatosPagina.test.tsx` (og:title/type/image/url no vacíos, `es_ES` ≠ `lang`, imagen local)
- @s21: [x] `src/lib/seo-logica.test.ts` (solo latitud, sin longitud ⇒ `geo` se sigue omitiendo entero)
- @s22: [x] `src/lib/seo-logica.test.ts` (email presente, redes ausentes ⇒ `email` sí, `sameAs` no, sin vacíos)

**22/22 escenarios con al menos un test concreto, verificado contra el código
real, no solo contra la trazabilidad de la bitácora.**

## Disciplina TDD

- ¿Producción sin test que la pida? **NO.** Revisado `seo-logica.ts` función a
  función: `METADATOS_PAGINAS`/6 constantes (@s4/@s5), `validarMetadatos`
  (@s6, ejercitada también contra el catálogo real como guarda de regresión
  en CI, no solo contra el fixture del escenario negativo — no es código
  muerto), `construirDireccionPostal` (@s9), `DIAS_SEMANA_POR_ETIQUETA` +
  `PATRON_TRAMO_HORAS` + `extraerTramosDeHoras` + `construirEspecificacionesHorario`
  (@s13/@s14/@s17), `construirDatosEstructurados` (@s7-@s9, @s12-@s22).
  Ninguna rama de código lee `datos.coordenadas` — confirmado con `grep`:
  el campo solo aparece en la firma de tipo (para que compilen los fixtures
  de @s15/@s21/@s22) y en comentarios, nunca en el cuerpo de la función. Es
  la lectura literal de "por qué `geo` se omite hoy", no una guarda
  simulada.
- ¿Evidencia de Rojo→Verde→Refactor? **SÍ.** `progress/tdd_seo_estructura.md`
  documenta 10 ciclos con su Rojo (import inexistente / propiedad ausente) y
  su Verde mínimo, más 6 sabotajes manuales explícitos (guarda de horario
  vacío, rama `geo` ingenua, `lang` con guion bajo, viewport sin zoom, upsert
  de `<script>` desactivado, override de `Landing` ignorado) con resultado
  rojo reproducido y reversión limpia. Sumado el sabotaje independiente de
  esta ronda (arriba), la cobertura de @s10/@s11/@s9 queda verificada dos
  veces por dos agentes distintos.

## Calidad

- **Capas correctas (Invariante 6 / arquitectura):** el JSON-LD y la
  validación de metadatos se construyen íntegramente en
  `src/lib/seo-logica.ts` (módulo puro, sin `import` de React ni de `document`).
  `src/components/MetadatosPagina.tsx` solo cablea: recibe el bloque ya
  construido y hace upsert de `<meta>`/`<script>` sobre `document.head`
  (`MetadatosPagina.tsx:22-43`) — es manipulación de DOM de efecto, no
  decisión de negocio; está cubierta por test (`@s7`, tanto creación como
  no-duplicación al navegar).
- **Ningún dato inventado:** confirmado por `grep` que `coordenadas` nunca se
  lee en `construirDatosEstructurados` (`seo-logica.ts:179-192`); `email`
  (`site.ts:91`) y `redesSociales` (`site.ts:93`) están declarados
  ausentes/vacíos en la fuente real, con cita a `docs/datos-galapavet.md` §9
  en el propio comentario; valoración/registro/fundación no tienen ningún
  camino de código que los produzca (verificado también por `@s18`, que
  hace `grep` de las palabras dentro del JSON serializado).
- **Omisión real, no solo en el caso feliz:** @s15/@s16/@s17 cubren el caso
  de ausencia total; @s21/@s22 cubren específicamente que la omisión de UN
  dato opcional no dependa de que otro dato distinto también esté ausente
  (cierra exactamente el hueco de mutación de operador lógico que motivó su
  redacción, según la cabecera del `.feature`, líneas 402-406). Revisado el
  código: los tres guardas (`especificacionesHorario.length > 0`,
  `datos.email !== undefined`, `datos.redesSociales.length > 0`,
  `seo-logica.ts:188-190`) son independientes entre sí — ningún operador
  lógico los acopla.
- **Separador `es-ES` vs `es_ES` nunca confundido:** `grep -rn` del patrón
  `es[-_]ES` en `src/` confirma que el único guion está en
  `index.html:2`/`documento.test.ts` (BCP 47) y el único guion bajo está en
  `MetadatosPagina.tsx:15`/su test (ogp.me); ninguna otra ocurrencia en el
  repo.
- **Fuente única real (Invariante 2):** `direccion.calle/codigoPostal/localidad/region`
  se declaran una sola vez en `site.ts:65-70` y de ahí derivan tanto
  `lineas`/`unaLinea` (visible, ya existentes) como la forma consumida por
  `seo-logica.ts` — verificado con sabotaje propio, ver arriba. El teléfono
  del JSON-LD pasa por `normalizarTelefono` (`telefono.ts`, ya `done`/100%
  mutado), nunca se reescribe a mano.
- **Nombres reveladores, funciones cortas:** ninguna función de
  `seo-logica.ts` supera ~15 líneas; nombres como
  `construirEspecificacionesHorario`, `mensajeDescripcionDuplicada`,
  `DIAS_SEMANA_POR_ETIQUETA` son autoexplicativos. Sin números mágicos
  sueltos (los HH:MM vienen de datos o de una regex documentada).
- **Hallazgo NO bloqueante (nota, no defecto):** la cláusula final de @s10
  ("el texto visible del horario no muestra ningún horario de apertura que
  no esté respaldado por alguno de esos tres tramos declarados") no tiene
  una aserción NUEVA dedicada en `paginasSeo.test.tsx` que compruebe la
  ausencia de tramos extra — solo se comprueba la dirección "declarado
  dentro de visible", no al revés. Verificado que el hueco es solo
  aparente: `InformacionContacto.test.tsx` (`@s4`, feature `informacion_contacto`
  ya `done`, 100% mutado) fija el bloque "Horario" a EXACTAMENTE 3 pares
  término/definición con texto exacto, y ese bloque itera literalmente
  `datosNegocio.horario` — el MISMO array que alimenta
  `construirEspecificacionesHorario`. Un tramo fantasma en el panel visible
  rompería ese test ya existente (parte de la misma suite que gatea
  `bin/harness init`), así que la garantía es real, aunque indirecta y no
  cableada explícitamente en la trazabilidad de esta feature. No bloquea
  esta ronda; se deja constancia para que el `mutation_tester` sepa dónde
  mirar si aparece un superviviente en esa zona.
- **Nota menor no bloqueante:** `addressCountry` (`PAIS_ISO = 'ES'`,
  `seo-logica.ts:120`) es una constante fija, no derivada de `site.ts`. La
  propia cabecera del `.feature` (líneas 143-146) lo declara explícitamente
  como derivación del país ya verificado por la dirección, no como dato de
  negocio nuevo — criterio razonable, no es una invención en el sentido que
  vigila el proyecto (reseñas, colegiaciones, redes, coordenadas).

## Checkpoints

- C1: [x] `node .harness/harness.mjs init` verde de punta a punta (lint +
  typecheck + 621/621 tests, 45 ficheros, sin timeouts de worker en esta
  corrida independiente).
- C2: [x] Única feature `in_progress` en `feature_list.json` es
  `seo_estructura` (id 15).
- C3: [x] Sin dependencias nuevas (no se añadió `react-helmet` ni ninguna
  otra); capas respetadas (`lib` puro → `components`/`pages` cablean).
- C4: [x] Todo módulo nuevo tiene su test co-locado
  (`seo-logica.test.ts`, `datosEstructuradosNegocio.test.ts`,
  `MetadatosPagina.test.tsx`, `documento.test.ts`, `paginasSeo.test.tsx`).
- C5: [ ] Pendiente de cierre de sesión (no bloqueante a mitad de pipeline,
  mismo criterio que otras features en su ronda de `judge`).
- C6: [x] 22/22 `@s` con test concreto y trazabilidad en
  `progress/tdd_seo_estructura.md`; sin producción que ningún test pidiera.
- C7: [ ] Pendiente de `mutation_tester` (corre después de esta aprobación).

## Cambios requeridos (si aplica)

Ninguno bloqueante. Dos notas dejadas en "Calidad" para que el
`mutation_tester` sepa dónde mirar si aparecen supervivientes (extracción de
tramos horarios, ver nota de @s10) — no impiden la aprobación de esta
ronda.

---

## Ronda 2 — Refuerzo de mutación (22/08/2026)

**Veredicto:** APPROVED

Revisión de la Ronda 2 documentada en `progress/tdd_seo_estructura.md`
("Ronda 2 — Refuerzo de mutación"), motivada por el FAIL de
`progress/mutation_seo_estructura.md` (Ronda 1: 133/140 = 95.00 %, 7 no
matados en `src/lib/seo-logica.ts`, líneas 157 y 189-190).

### Verificación de "cero producción tocada"

`git diff --stat` (contra HEAD) muestra exactamente los mismos ficheros
trackeados que ya formaban parte del diff aprobado en Ronda 1: `progress/current.md`,
`src/lib/site.test.tsx`, `src/lib/site.ts`, `src/pages/Landing.tsx`,
`src/pages/PaginaBlog.tsx`, `src/pages/PaginaCampanas.tsx`,
`src/pages/PaginaTienda.tsx` — releído el contenido íntegro de cada diff
(`git diff -- src/lib/site.ts src/pages/Landing.tsx src/pages/PaginaBlog.tsx
src/pages/PaginaCampanas.tsx src/pages/PaginaTienda.tsx`) y contrastado
frase a frase contra lo que la Ronda 1 de esta misma revisión ya citó
(`crearDireccion`/`DireccionEstructurada`, prop `calleDireccion`, cableado de
`<MetadatosPagina>`): ningún cambio nuevo, ningún fichero de producción
adicional aparece en el diff trackeado.

`src/lib/seo-logica.ts` (fichero objetivo del refuerzo) es nuevo y no está
trackeado, así que `git diff` no aporta señal por sí solo. Verificación
independiente por lectura íntegra del fichero y comparación línea a línea
contra las citas textuales de la Ronda 1 de `judge` y de
`progress/mutation_seo_estructura.md`: `seo-logica.ts:120` (`PAIS_ISO = 'ES'`),
`seo-logica.ts:157` (`if (diasSemana === undefined) {`),
`seo-logica.ts:179-192` (`construirDatosEstructurados`, `coordenadas` nunca
leído) y `seo-logica.ts:188-190` (los tres guardas `.length > 0`/`!==
undefined`/`.length > 0`) — **mismos números de línea, mismo código
carácter a carácter** que lo ya medido por `mutation_tester` en Ronda 1. Si
se hubiera insertado o borrado una sola línea antes de la 157 o la 189-190,
los números habrían cambiado; no cambiaron. Confirma "cero cambios de
producción en esta ronda" de forma independiente, sin depender del
`git diff` (trivialmente vacío para un fichero no trackeado, como ya se
señala aquí para que conste: la propia afirmación de la bitácora de
`tdd_craftsman` de que "`git diff src/lib/seo-logica.ts` está vacío" no es
una prueba por sí sola en un fichero nunca añadido al índice — la prueba
real es la comparación línea a línea hecha en esta revisión).

**Ningún fichero de producción fue tocado en esta ronda; no aplica
justificación de bug real.**

### Sabotaje manual independiente de 3 de los 3 tests nuevos (mínimo exigido: 2)

Backup de `src/lib/seo-logica.ts` fuera del repo antes de empezar
(scratchpad de sesión). Baseline: `pnpm exec vitest run
src/lib/seo-logica.test.ts` → 24/24 verde.

1. **Grupo B** (línea 189, guarda de `email`): sabotaje
   `datos.email !== undefined` → `true` (mutante `ConditionalExpression`
   exacto del informe de mutación). Resultado: 1 test falla —
   `@s16 refuerzo mutación: sin email, la clave "email" está ausente incluso
   sin pasar por JSON.stringify/parse` → `expected true to be false`. Mata
   el mutante exacto. Revertido; hash SHA-256 del fichero restaurado
   idéntico al original (`5be3bdb…88bfbde`), confirmado con `certutil`.
2. **Grupo C** (línea 190, guarda de `sameAs`): sabotaje de la expresión
   completa `...(datos.redesSociales.length > 0 && { sameAs: [...] })` →
   `...(false)` (mutante `ConditionalExpression`). Resultado: 1 test falla —
   `@s16 refuerzo mutación: con redes sociales presentes, "sameAs" declara
   exactamente esa lista` → `sameAs` queda `undefined` en vez de las 2 URLs.
   Mata el mutante exacto. Revertido; hash idéntico confirmado de nuevo.
3. **Grupo A** (línea 157, guarda de etiqueta de día): sabotaje
   `if (diasSemana === undefined) {` → `if (false) {` (mutante
   `ConditionalExpression`). Resultado: 1 test falla —
   `@s14 refuerzo mutación: una etiqueta de día no reconocida con horas
   parseables no aporta tramo ni lanza` → `TypeError: diasSemana is not
   iterable`. Mata el mutante exacto. Revertido; hash idéntico confirmado
   una última vez, `git status --short src/lib/seo-logica.ts` muestra solo
   `??` (no trackeado, sin marca de modificación residual) y
   `git diff --stat` vuelve a mostrar exactamente el mismo conjunto de 7
   ficheros trackeados que antes del sabotaje.

En cada uno de los 3 sabotajes, exactamente el test de refuerzo señalado
falla y los otros 23 siguen en verde — sin solape, sin falsos positivos.
Confirma independientemente lo documentado por `tdd_craftsman` en
`progress/tdd_seo_estructura.md` (Ronda 2) para los 7 mutantes de la Ronda 1
de `mutation_tester`.

### `node .harness/harness.mjs init` (corrida independiente)

Verde de punta a punta: `oxlint --deny-warnings` limpio, `tsc -b` limpio,
**624/624** tests en **45** ficheros (mismo resultado exacto que reporta
`tdd_craftsman`, sin timeouts de worker en esta corrida).

### Disciplina TDD de esta ronda

- ¿Producción sin test que la pida? **NO** — 0 líneas de producción nuevas
  o modificadas en esta ronda, verificado arriba por dos vías independientes
  (diff trackeado sin cambios nuevos + comparación línea a línea del
  fichero no trackeado).
- ¿Evidencia de Rojo→Verde→Refactor? **SÍ**, y además con el patrón más
  estricto posible para refuerzo de mutación: cada test nuevo se verifica
  primero en verde contra producción real y luego en rojo contra el
  sabotaje EXACTO reportado por Stryker (no una variación aproximada),
  documentado test a test en `progress/tdd_seo_estructura.md` con el mismo
  rigor que esta revisión acaba de repetir de forma independiente.

### Calidad de los 3 tests nuevos

- Sin duplicación de fixtures: `DATOS_SEO_CON_ETIQUETA_NO_RECONOCIDA`,
  `DATOS_SEO_CON_REDES_SOCIALES` (`src/lib/seo-logica.test.ts:192-195,
  295-298`) derivan por spread de `DATOS_SEO_BASE`, no repiten literales.
  URLs de ejemplo claramente ficticias (`ejemplo-prueba`), mismo criterio ya
  usado en `@s22` (`contacto@ejemplo-de-prueba.test`) — sin dato de negocio
  inventado.
- El test del Grupo B llama a `construirDatosEstructurados` directamente
  (sin el helper `comoJsonLd`) precisamente porque ese helper enmascaraba el
  hueco — decisión de diseño correcta y explícita, no un atajo.
- Nombres de `describe` autoexplicativos y trazables al grupo del informe de
  mutación (`@s14 refuerzo mutación: …`, `@s16 refuerzo mutación: …`), fácil
  de re-auditar en rondas futuras.

## Checkpoints (esta ronda)

- C1: [x] `node .harness/harness.mjs init` verde de punta a punta (lint +
  typecheck + 624/624 tests, 45 ficheros), corrida independiente de esta
  revisión.
- C2: [x] Única feature `in_progress` en `feature_list.json` sigue siendo
  `seo_estructura` (id 15).
- C3: [x] Cero producción nueva; capas intactas.
- C4: [x] Los 3 tests nuevos están co-locados en `seo-logica.test.ts`, junto
  al resto de la suite de la feature.
- C5: [ ] Pendiente de cierre de sesión (no bloqueante a mitad de pipeline).
- C6: [x] 22/22 `@s` siguen con test concreto (sin cambios de trazabilidad
  en esta ronda); los 3 tests nuevos son refuerzo de mutación sobre @s14/@s16,
  no escenarios nuevos.
- C7: [ ] Pendiente de nueva medición de `mutation_tester` sobre
  `src/lib/seo-logica.ts` (objetivo: 101/101 = 100 %).

## Cambios requeridos (si aplica)

Ninguno. Aprobado para pasar de nuevo por `mutation_tester`.
