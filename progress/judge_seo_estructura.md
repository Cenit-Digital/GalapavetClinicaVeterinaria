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

---

## Enmienda PENDIENTE 7 -- og:image absoluto (25/08/2026)

**Veredicto:** APPROVED

Revision puntual del encargo de `craftsman_lead` sobre `progress/tdd_seo_estructura.md`
(seccion "Ronda 2... Enmienda PENDIENTE 7 -- og:image absoluto (25/08/2026)",
al final del fichero). No es una ronda nueva de la feature (sigue `done`,
`feature_list.json:353`): es la correccion puntual del PENDIENTE 7 anotado por
`identidad_visual` (feature 22, `done`).

### Alcance del diff (verificado, sin fugas)

`git diff --stat` sobre los 4 ficheros citados por `tdd_craftsman` -- y solo esos:

```
features/seo_estructura.feature         | 13 +++++++++++--
src/components/MetadatosPagina.test.tsx |  9 ++++++---
src/components/MetadatosPagina.tsx      | 23 ++++++++++++++++++++++-
tests/e2e/imagenes.spec.ts              | 13 ++++++++++---
```

Leido cada diff completo. Coincide caracter a caracter con lo descrito en la
bitacora: nueva constante `DOMINIO_SITIO` (`MetadatosPagina.tsx:36`) mas
renombrado `IMAGEN_OPEN_GRAPH` a `RUTA_IMAGEN_OPEN_GRAPH` compuesto
(`MetadatosPagina.tsx:43-44`); `@s20` cambia sus dos aserciones de
`startsWith('/')`/`not.toMatch(/^https?:\/\//)` a
`toMatch(/^https:\/\//)`/`startsWith('https://cenit-digital.github.io/')`
(`MetadatosPagina.test.tsx:89-90`); `@s29` (heredado de `identidad_visual`)
adapta solo la mecanica de la peticion con `new URL(contenidoOgImage).pathname`
(`tests/e2e/imagenes.spec.ts:114`), ninguna asercion nueva ni eliminada. Otros
ficheros presentes en `git status` (`feature_list.json`, `project-spec.md`,
`progress/judge_accesibilidad.md`, `tests/e2e/accesibilidad.spec.ts`,
`tests/e2e/movimiento.spec.ts`, y lo nuevo de `despliegue_github_pages`)
pertenecen a la feature 23 en paralelo, fuera del alcance de esta enmienda --
confirmado que ninguno modifica `og:image`/`IMAGEN_OPEN_GRAPH`/`DOMINIO_SITIO`
salvo las referencias de contexto en `feature_list.json`/`project-spec.md` al
propio PENDIENTE 7 (esperable, es la motivacion de la feature 23).

### Verificacion independiente de la decision "dominio sin subpath"

No acepte la afirmacion por herencia. Repliqué la mecanica exacta con la que
un lector futuro razonaria sobre el codigo, en tres pasos:

1. **Estado real hoy**: `vite.config.ts` no declara `base`; `package.json:13`
   (`"build": "tsc -b && vite build && ..."`) no lleva `--base`. `git status`
   confirma `package.json` sin modificar. `pnpm run build` real, `dist/`
   servido con `vite preview` en `http://localhost:4174`: `GET
   /img/og/galapavet.png` responde 200, `image/png`, PNG real 1200x630
   (verificado con `curl -D -`).
2. **Sabotaje propio** (independiente del de `tdd_craftsman`): edite a mano
   `DOMINIO_SITIO` a
   `'https://cenit-digital.github.io/GalapavetClinicaVeterinaria'`, reconstrui
   (`pnpm run build`) y corri el test real `@s29`
   (`pnpm exec playwright test tests/e2e/imagenes.spec.ts -g "@s29"`): falla,
   confirmando que incluir el subpath hoy rompe el escenario heredado. La
   decision de diseno de `tdd_craftsman` (declarar solo el origen, sin
   subpath) es correcta y queda verificada de forma independiente.
3. **Revertido** el sabotaje (copia desde backup), reconstruido: el hash del
   bundle (`dist/assets/index-D6CE4i3M.js`) es identico al de la build previa
   al sabotaje -- confirma reversion exacta. `pnpm exec playwright test
   tests/e2e/imagenes.spec.ts` completo tras revertir: 16/16 verde, incluido
   `@s29`.

**Hallazgo NO bloqueante (correccion de bitacora recomendada, no de codigo):**
`progress/tdd_seo_estructura.md` (seccion de esta enmienda, "Decision de
diseno...") afirma que con el subpath `request.get()` "devolvia 404". Mi
verificacion empirica (`curl -D -` y la corrida real de Playwright arriba)
muestra que la respuesta real es 200 con `Content-Type: text/html`, no 404:
`vite preview` cae al SPA fallback (sirve `index.html`) para cualquier ruta
no estatica que no coincide con un fichero real, en vez de devolver 404. El
test SI falla igualmente, pero en la asercion
`expect(respuesta.headers()['content-type']).toBe('image/png')`
(`imagenes.spec.ts:117`), no en `expect(respuesta.status()).toBe(200)` (esa
asercion de hecho pasaria con el subpath puesto, porque el fallback tambien
responde 200). La CONCLUSION de `tdd_craftsman` (declarar el dominio sin
subpath es la decision correcta hoy) es correcta y queda confirmada por mi
de forma independiente; el MECANISMO citado en la bitacora ("404") es
inexacto. No afecta al codigo de produccion ni a los tests entregados (el
"404" nunca aparece en `MetadatosPagina.tsx` ni en `imagenes.spec.ts`, solo
en la prosa de `progress/tdd_seo_estructura.md`) -- no bloquea esta
aprobacion, pero se deja constancia para que se corrija la prosa de la
bitacora la proxima vez que se toque ese fichero, dado el estandar de rigor
empirico que el propio proyecto se exige en cada ronda.

### @s20 enmendado -- fidelidad a ogp.me

`features/seo_estructura.feature:390-412`: el `Then` ahora exige "una URL
absoluta, con esquema y dominio, tal y como exige https://ogp.me/ para el
tipo og:image" y "esa URL absoluta usa el dominio real de publicacion del
sitio". Cita el estandar correctamente (ogp.me define `og:image` como tipo
`URL`, es decir absoluta). La nota de cabecera (lineas 390-400) documenta el
motivo de la enmienda, cita el PENDIENTE 7 de `identidad_visual.feature`
(feature 22, `done`) y aclara explicitamente que el subpath queda fuera --
no es una reescritura silenciosa de un contrato ya cerrado: la enmienda esta
justificada, fechada y trazada a su origen.

### og:url -- confirmado sin cambios

`grep -n "og:url" src/components/MetadatosPagina.tsx` devuelve la linea 86:
`fijarMeta('property', 'og:url', window.location.href)`. Sin diff en esa
linea. `window.location.href` es absoluta por construccion tanto en jsdom
como en cualquier navegador real -- no necesitaba tocarse. Confirmado.

### Tests y bin/harness init

- `pnpm exec vitest run src/components/MetadatosPagina.test.tsx` (corrida
  propia, aislada): 4/4 verde.
- `pnpm exec vitest run src/accesibilidad-teclado.test.tsx` (corrida propia,
  aislada, para descartar que el patron de fallo que reporta `tdd_craftsman`
  sea real): 5/5 verde. Confirma que el fichero no tiene ningun defecto
  propio; el patron de fallo que describe la bitacora a concurrencia por
  defecto es coherente con contencion de CPU de la maquina (`tasklist`
  durante esta revision: 2 `claude.exe` + 42 `node.exe` concurrentes), no un
  bug introducido por esta enmienda.
- `bash bin/harness init` (corrida propia, independiente, concurrencia por
  defecto, sin `--maxWorkers`): verde de punta a punta -- lint
  (`oxlint --deny-warnings`) limpio, `tsc -b` limpio, 916/916 tests en 70
  ficheros. Mismo numero que reporta `tdd_craftsman` con `--maxWorkers=2`;
  en esta corrida, sin forzar el flag, tambien fue limpia (la contencion de
  CPU que describia la bitacora no se reprodujo en esta ejecucion).
- `pnpm run build` (corrida propia): exito, puerta anti-terceros en verde (2
  archivos inspeccionados, ningun dominio de terceros en `dist/`) -- confirma
  que `og:image` absoluto no hornea el dominio en ningun artefacto estatico,
  solo se fija en tiempo de ejecucion via `MetadatosPagina`.
- `pnpm exec playwright test tests/e2e/imagenes.spec.ts` (corrida propia):
  16/16 verde, incluido `@s29`.

### Cobertura de escenarios (@s <-> test), esta enmienda

- @s20 (`seo_estructura`, enmendado): [x] cubierto por
  `src/components/MetadatosPagina.test.tsx` -> describe `@s20 ...` (`ogImagen`
  absoluta con dominio real), verificado en verde de forma independiente.
- @s29 (`identidad_visual`, heredado, mecanica adaptada): [x] cubierto por
  `tests/e2e/imagenes.spec.ts` -> describe `@s29 ...`, verificado en verde
  (16/16, incluido en solitario) y, ademas, verificado que SIGUE fallando si
  se reintroduce el literal relativo o si se antepone el subpath prematuro
  (dos sabotajes propios, ambos en rojo como se esperaba).

### Disciplina TDD

- ¿Produccion sin test que la pida? NO. El unico cambio de produccion
  (`MetadatosPagina.tsx:36-44`) es composicion de dos constantes de cadena,
  sin ninguna rama nueva de decision; esta exigido integramente por las dos
  aserciones nuevas de `@s20` en `MetadatosPagina.test.tsx:89-90`. No anade
  superficie mordible nueva relevante para Stryker (el componente sigue sin
  logica de decision propia, mismo criterio ya aceptado en la Ronda 1/2 de
  esta feature) -- no exige una nueva ronda de `mutation_tester`.
- ¿Evidencia de Rojo->Verde->Refactor? SI, reproducida de forma
  independiente: reversion manual de `IMAGEN_OPEN_GRAPH` al literal relativo
  vuelve a poner `@s20` en rojo (mismo patron que describe la bitacora);
  anteponer el subpath del repo pone `@s29` en rojo (confirmado por mi, con
  el matiz del mecanismo de fallo senalado arriba).

### Checkpoints (esta enmienda)

- C1: [x] `bash bin/harness init` verde de punta a punta (lint + typecheck +
  916/916 tests), corrida independiente de esta revision.
- C2: [x] `seo_estructura` (id 15) sigue `done`; la unica feature
  `in_progress` en `feature_list.json` es `despliegue_github_pages` (id 23),
  que no toca ningun fichero de esta enmienda.
- C3: [x] Sin dependencias nuevas; capas intactas (`MetadatosPagina.tsx`
  sigue siendo solo cableo de `<head>`, sin decision de negocio nueva).
- C4: [x] El cambio de produccion esta co-locado con su test
  (`MetadatosPagina.test.tsx`).
- C5: [ ] No aplica a esta revision puntual (no es cierre de sesion).
- C6: [x] @s20 y @s29 con test concreto verificado; sin produccion sin test
  que la exija.
- C7: [x] No aplica nueva medicion -- el cambio no anade superficie mordible
  nueva a los modulos ya medidos al 100% (`seo-logica.ts`, `site.ts`,
  `datosEstructuradosNegocio.ts`); `MetadatosPagina.tsx` nunca ha sido
  objetivo de Stryker en esta feature (ver Rondas 1-2 de este mismo fichero).

### Cambios requeridos (si aplica)

Ninguno bloqueante. Recomendado (no bloqueante): corregir en
`progress/tdd_seo_estructura.md` la frase "request.get() contra el servidor
local devolvia 404" por una descripcion precisa del fallback real observado
(200, `Content-Type: text/html`, fallo en la asercion de content-type, no en
la de status) -- ver detalle en "Verificacion independiente de la decision
..." arriba.
