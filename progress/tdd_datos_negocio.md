# Bitácora TDD — `datos_negocio` (id 2)

> Contrato: `features/datos_negocio.feature` (21 escenarios). Entregable
> central: `src/lib/site.ts`. Disciplina: `docs/tdd.md` (Rojo-Verde-Refactor,
> un test a la vez). Convenciones heredadas de `tokens_marca`
> (`src/lib/contraste.ts`, `tokens.ts`, `puertaLiteralesColor.ts`).

## Diseño de módulos (decidido antes del primer ciclo)

- `src/lib/telefono.ts` — lógica pura de teléfono, probada de forma genérica
  con valores ad-hoc: `normalizarTelefono`, `enlaceLlamada`,
  `enlaceMensajeria`. Falla cerrado (lanza) ante cualquier valor que no
  normaliza — Invariante 2 / Modos de error comunes de `project-spec.md`.
- `src/lib/site.ts` — `datosNegocio`, la fuente única. Cada dato de negocio se
  declara una sola vez como constante con nombre; los teléfonos se derivan
  con `telefono.ts` (`crearTelefono`), la dirección deriva su forma de una
  línea de las líneas visibles (`crearDireccion`), la identidad deriva su
  forma compuesta de sus tres constantes.
- `src/lib/puertaTelefonoHardcodeado.ts` — puerta anti-teléfono-hardcodeado,
  análoga a `puertaLiteralesColor.ts`: recibe `FicheroCodigo[]`, busca
  secuencias con forma de teléfono español y falla cerrada con 0 ficheros.
- Los escenarios @s7-@s12 prueban `telefono.ts` de forma genérica (no los
  datos reales de `site.ts`); @s1-@s6, @s13-@s18, @s21 prueban `site.ts`;
  @s19-@s20 prueban `puertaTelefonoHardcodeado.ts`. El orden de creación de
  ficheros no es 1:1 con el orden numérico de los `@s`, pero cada ciclo se
  ejecutó exactamente en el orden del `.feature` (@s1 → @s21).

## Ciclos Rojo-Verde-Refactor

### @s1 — texto visible y `tel:` del teléfono de la clínica
- ROJO: `site.test.tsx` importa `datosNegocio` de `./site` (no existe) →
  falla al resolver el import.
- VERDE mínimo: `site.ts` con `datosNegocio.telefonoClinica` como objeto
  literal con `textoVisible`/`enlaceLlamada` hardcodeados (permitido por
  `docs/tdd.md`: "hacer trampa" cuando aún no hay test que lo desmienta).
- REFACTOR: ninguno (caso único, nada que deduplicar todavía).

### @s2 — segundo teléfono, mismo modo de derivación
- ROJO: test para `telefonoMovil` → `Cannot read properties of undefined`.
- VERDE: introducida la función `enlaceLlamada(textoVisible)` (quita
  espacios + prefijo `tel:+34`) y `crearTelefono`, usada para `telefonoMovil`
  (mantuve `telefonoClinica` hardcodeado un instante).
- REFACTOR (en verde): `telefonoClinica` pasa también a usar `crearTelefono`,
  eliminando la duplicación entre los dos literales — la generalización que
  `docs/tdd.md` anticipa.

### @s3 — teléfono de urgencias con rótulo real, nunca "24 h"
- ROJO: test con `telefonoUrgencias.rotulo` → `undefined`.
- VERDE: `crearTelefono` acepta `rotulo?` opcional (spread condicional para
  cumplir `exactOptionalPropertyTypes`); se declara `TELEFONO_URGENCIAS` y
  `ROTULO_URGENCIAS`.

### @s4 — el enlace renderizado expone el número derivado, no uno a mano
- ROJO: `React` no importado (oxlint `react-in-jsx-scope`) tras escribir el
  test → fallo de lint, que cuenta como "no compila" (Ley 2 de `docs/tdd.md`).
- Primer intento de test con `.replace(/\D/g, '')` sobre el `href` fue
  erróneo (comparaba `34910829267` contra `910829267`): confirma la máxima de
  `docs/tdd.md` — "un test que pasa a la primera no demuestra nada, ajústalo
  o sospecha". Corregido a `.replace('tel:+34', '')`, con lo que sí quedó en
  rojo genuino antes de arreglarlo.
- VERDE: sin cambio de producción — `VistaTelefonoClinica` es un doble de
  test local (no hay página real todavía; el entregable de esta feature es
  `site.ts`) que solo consume `datosNegocio.telefonoClinica`.

### @s5 — enlace de mensajería sin texto previo
- ROJO: `datosNegocio.telefonoMovil.enlaceMensajeria is not a function`.
- VERDE: añadida `enlaceMensajeria(textoVisible)` en `site.ts`, expuesta solo
  en `telefonoMovil` (único teléfono que la necesita — Ley 3).
- REFACTOR (en verde): extraída `numeroNacional()` compartida entre
  `enlaceLlamada` y `enlaceMensajeria`, eliminando la duplicación del
  `replace(/\s/g, '')`.

### @s6 — el texto de mensajería viaja codificado
- ROJO: `enlaceMensajeria('685 34 31 49', 'Hola...')` ignoraba el segundo
  argumento.
- VERDE: `enlaceMensajeria` acepta `texto?` y añade `?text=` con
  `encodeURIComponent` cuando se indica.

### @s7 — tres escrituras del mismo teléfono normalizan igual
- Punto de extracción: nace `src/lib/telefono.ts` como módulo probado de
  forma genérica (independiente de `site.ts`), igual que `contraste.ts` lo
  fue para `tokens.ts`.
- ROJO: import de `./telefono` (no existe).
- VERDE mínimo: `normalizarTelefono` sin validación (solo quita espacios y
  gestiona el prefijo `+34`).

### @s8 — menos de nueve dígitos hace fallar al normalizador
- ROJO: `enlaceLlamada('91 082 92')` no lanzaba (no existía `enlaceLlamada`
  en `telefono.ts` — `TypeError: ... is not a function`).
- VERDE: añadida validación `PATRON_NUMERO_NACIONAL = /^\d{9}$/` +
  `errorTelefonoNoValido`, y `enlaceLlamada` exportada en `telefono.ts`.
- Refuerzo mutación (mismo ciclo): añadida comprobación de que el mensaje
  también contiene "9 dígitos", y un test extra para un teléfono con **más**
  de nueve dígitos — cierra el flanco superior del `{9}` exacto que ningún
  `@s` del contrato ejercita literalmente pero que un mutante `{8,}` picaría.

### @s9 — teléfono vacío falla con mensaje explícito
- ROJO: el test exigía `/vac[íi]o/i` en el mensaje; el código ya lanzaba pero
  con el mensaje genérico "no tiene 9 dígitos" → falla real.
- VERDE: rama dedicada `if (compacto === '') throw errorTelefonoNoValido(valor, 'está vacío')`.

### @s10 — teléfono con letras falla
- Ya en VERDE al escribir el test (la regex `\d{9}` ya rechaza letras por
  construcción, generalización natural de @s8/@s9). Verificado que es una
  aserción real (no vacía): si `PATRON_NUMERO_NACIONAL` solo comprobara la
  longitud sin `\d`, este test fallaría. Documentado aquí en vez de forzar un
  ciclo rojo artificial.

### @s11 — prefijo internacional distinto del español falla
- Ya en VERDE al escribir el test, por el mismo motivo (el `+` que no forma
  parte de "+34" queda dentro de `digitos` y `\d{9}` lo rechaza). Ajustado el
  matcher de `.toThrow()` a `.toThrow(/no válido/i)` porque el lint
  (`vitest/require-to-throw-message`) exige mensaje en `toThrow`.

### @s12 — el enlace de mensajería también falla cerrado
- Primer intento con `.toThrow()` sin argumento pasó **vacíamente**: el
  error real era `enlaceMensajeria is not a function` (no exportada aún), no
  un error de validación — exactamente el caso que `docs/tdd.md` avisa
  ("ajústalo o sospecha"). Corregido a `.toThrow('685 34 31')`, quedando en
  rojo genuino.
- VERDE: `enlaceMensajeria` exportada en `telefono.ts`, reutilizando
  `normalizarTelefono` (falla cerrado igual que `enlaceLlamada`).
- REFACTOR: `site.ts` se reescribe para importar `enlaceLlamada` y
  `enlaceMensajeria` desde `telefono.ts` en vez de reimplementarlos
  localmente — elimina la duplicación de lógica entre los dos módulos y de
  paso añade validación real (falla cerrado) a los teléfonos reales.
  Verificado: los 51 tests de `src/lib/` siguen en verde tras el refactor.

### @s13 — horario con exactamente 3 tramos, en orden
- ROJO: `datosNegocio.horario` no existe → `Target cannot be null or undefined`.
- VERDE: `HORARIO` como array de 3 `TramoHorario` literales, tal cual los
  transcribe `docs/datos-galapavet.md` §3.

### @s14 — ningún tramo anuncia 24 h ni domingo abierto
- Ya en VERDE al escribir el test (la única fuente de horario ya es la
  literal de @s13, que nunca menciona "24 h" ni abre el domingo). Es un test
  de consistencia real sobre datos ya declarados, no vacío por construcción
  del dato — se documenta aquí en vez de forzar un rojo artificial.

### @s15 — sin email, ni se declara ni se sustituye
- Caso de **ausencia exigible** (ver cabecera de `features/datos_negocio.feature`):
  no hay comportamiento que construir, solo invariante a guardar.
- ROJO real logrado por partida doble: (a) `pnpm run typecheck` falla,
  `Property 'email' does not exist`; (b) para la comprobación de que el
  código fuente no contiene el email ni "mailto:", se usó
  `import.meta.glob('./site.ts', { query: '?raw', ... })` (no `node:fs`:
  `tsconfig.app.json` no incluye tipos de Node y es config, no producción).
- VERDE: `email: undefined as string | undefined` en `datosNegocio`.
- **Verificación retroactiva de no-vacuidad** (patrón
  `verde-por-vacuidad-en-puerta-de-verificacion` de la memoria
  organizacional): inyecté temporalmente `email: 'info@galapavet.com'` en
  `site.ts`, confirmé que el test se pone ROJO (`AssertionError: expected
  'info@galapavet.com' to be undefined`), y revertí. El guardia no es vacío.

### @s16 — sin redes sociales, ni se inventan
- ROJO real (igual patrón que @s15): `typecheck` falla,
  `Property 'redesSociales' does not exist`; y en runtime
  `datosNegocio.redesSociales` era `undefined`, no `[]`.
- VERDE: `redesSociales: [] as readonly string[]`.

### @s17 — la dirección se declara una vez, dos formas coherentes
- ROJO: `datosNegocio.direccion` no existe.
- VERDE: `crearDireccion(lineas)` deriva `unaLinea` con `lineas.join(', ')` —
  las líneas visibles son el único dato declarado, la forma de una línea es
  una derivación real, no un segundo literal.

### @s18 — sin coordenadas, la dirección postal sigue disponible
- ROJO real (mismo patrón): `typecheck` falla, `Property 'coordenadas' does
  not exist`.
- VERDE: `coordenadas: undefined as { latitud: number; longitud: number } | undefined`.

### @s19 — ningún módulo escribe un teléfono a mano fuera de la fuente única
- Nace `src/lib/puertaTelefonoHardcodeado.ts` (análoga a
  `puertaLiteralesColor.ts`).
- ROJO: import de `./puertaTelefonoHardcodeado` (no existe).
- VERDE: `ejecutarPuertaTelefonoHardcodeado(ficheros)` busca con
  `PATRON_TELEFONO_ESPANOL` (9 dígitos empezando por 6/7/8/9, con o sin
  `+34`, con o sin separador simple) en cada `FicheroCodigo`. El test lee los
  ficheros REALES del repo con `import.meta.glob(['/src/**/*.{ts,tsx}',
  '!/src/**/*.test.{ts,tsx}', '!/src/test/**'], { eager: true, query: '?raw' })`
  (de nuevo sin `node:fs`) y verifica que todo hallazgo está en
  `.../lib/site.ts` y que ningún fichero contiene `640221190` ni
  `918442160` (los teléfonos falsos del prototipo heredado).

### @s20 — la puerta falla si no inspecciona ningún fichero
- Ya en VERDE al escribir el test: la guarda de 0 ficheros se construyó a la
  vez que @s19 siguiendo el mismo patrón que `puertaLiteralesColor.ts`
  (que ya superó mutación al 100% en `tokens_marca`).
- **Verificación retroactiva de no-vacuidad**: sustituí temporalmente
  `if (ficheros.length === CERO_FICHEROS)` por `if (false)`, confirmé que el
  test se pone ROJO (`expected true to be false`), y revertí. El guardia no
  es vacío.

### @s21 — identidad declarada una vez, forma compuesta no diverge
- ROJO: `datosNegocio.identidad` no existe.
- VERDE: `NOMBRE_COMERCIAL`, `DESCRIPTOR`, `LOCALIDAD`, `PROVINCIA` como
  constantes; `IDENTIDAD.descriptorConLocalidad` derivada por plantilla.
- REFACTOR (en verde): `DIRECCION` (de @s17) se reescribe para reutilizar
  `LOCALIDAD`/`PROVINCIA` en vez de repetir "Galapagar, Madrid" como
  segundo literal independiente — un mismo dato, una sola declaración,
  aunque aparezca en dos formas de negocio distintas (identidad y dirección).

## Ciclos de refuerzo de mutación (tras medición FAIL de `mutation_tester`)

> `progress/mutation_datos_negocio.md`: 86/96 = 89.58% (umbral 1.0). 9
> mutantes sobrevivientes reales + 1 equivalente ya verificado y excluido
> (`telefono.ts:13`, **no tocado**). De los 9 reales, 3 (`site.ts:10-12`)
> estaban además marcados `testsCompleted: 0` por una limitación de
> atribución de cobertura de `@stryker-mutator/vitest-runner` sobre mutantes
> estáticos que lanzan durante la carga del módulo — la propia nota del
> `mutation_tester` verificó a mano que la suite sí detecta el defecto en la
> práctica, solo que Stryker no se lo atribuye a ningún test.
>
> Estos ciclos no nacen de un nuevo `@s` del `.feature` (no se reescribe
> `features/datos_negocio.feature`): son refuerzos de mutación sobre
> escenarios ya cubiertos, exactamente el rol que `docs/mutation-testing.md`
> asigna al `tdd_craftsman` ("un mutante sobreviviente es trabajo del
> `tdd_craftsman`: escribe el test rojo que lo mata"). Cada ciclo se verificó
> con el mismo protocolo manual que usó `mutation_tester`: aplicar el mutante
> exacto del informe a mano, confirmar ROJO, revertir, confirmar VERDE — sin
> tocar `stryker.config.json` ni declarar ninguna excepción de umbral en
> `docs/mutation-testing.md`.

### R1 — `telefono.ts:16` `errorTelefonoNoValido` con el cuerpo vaciado
- Test ya presente al empezar este repaso (`telefono.test.ts`, dentro de
  `@s8`): "refuerzo mutación: lo lanzado es una instancia real de Error, no
  un valor vacío" — captura la excepción de `enlaceLlamada('91 082 92')` y
  comprueba `instanceof Error` y `.message`, en vez de solo `.toThrow(string)`
  (que, según documentó `mutation_tester`, pasa igual aunque se lance
  `undefined`).
- **Ajuste de disciplina (este repaso):** la versión original usaba
  `try { ...; expect.unreachable(...) } catch (error) { expect(...) }`, que
  `oxlint` rechaza (`vitest/no-conditional-expect`: el `expect` dentro del
  `catch` es condicional a que se lance o no). Reescrito para declarar
  `let error: unknown` antes del `try` y mover ambos `expect` FUERA del
  `catch`, unívocos: si `enlaceLlamada` no lanzara, `error` seguiría siendo
  `undefined` y `expect(error).toBeInstanceOf(Error)` fallaría igual — mismo
  poder de detección, sin la aserción condicional.
- ROJO reconfirmado a mano: cuerpo de `errorTelefonoNoValido` vaciado
  (`{}`) → `error` queda `undefined` → `expect(error).toBeInstanceOf(Error)`
  falla con "expected undefined to be an instance of Error". Revertido,
  vuelve a VERDE (8/8 en `telefono.test.ts`).
- `pnpm run lint` quedó en verde tras el ajuste (antes fallaba con 2 errores
  `vitest/no-conditional-expect` en esas mismas líneas).

### R2 — `site.ts:22` la condición del `rotulo` opcional se anula
- Test ya presente al empezar este repaso (`site.test.tsx`, dentro de
  `@s1`): "refuerzo mutación: sin rótulo indicado, la clave "rotulo" no
  existe en absoluto (no queda "rotulo: undefined")" —
  `expect('rotulo' in telefonoClinica).toBe(false)`.
- ROJO reconfirmado a mano: `...(rotulo !== undefined && { rotulo })` →
  `...(true && { rotulo })` → `'rotulo' in telefonoClinica` pasa a `true` →
  `expect(...).toBe(false)` falla ("expected true to be false"). Revertido,
  vuelve a VERDE (14/14 en `site.test.tsx`).

### R3 — `puertaTelefonoHardcodeado.ts:55` — dos de los tres mutantes de `pasa`
- Tests ya presentes al empezar este repaso
  (`puertaTelefonoHardcodeado.test.ts`, dentro de `@s19`):
  `expect(informe.hallazgos).toHaveLength(3)` y `expect(informe.pasa).toBe(false)`.
- ROJO reconfirmado a mano para dos de los tres mutantes del informe:
  - `pasa: hallazgos.length === CERO_HALLAZGOS` → `pasa: true` (siempre
    pasa): `expect(informe.pasa).toBe(false)` falla.
  - `=== CERO_HALLAZGOS` → `!== CERO_HALLAZGOS` (invierte el sentido): con 3
    hallazgos reales, `3 !== 0` → `true`, `expect(...).toBe(false)` falla.
  - Revertidos ambos uno a uno, vuelve a VERDE.
- **Hallazgo propio de este repaso:** el tercer mutante del mismo informe
  (`pasa: hallazgos.length === CERO_HALLAZGOS` → `pasa: false`, "nunca pasa")
  **no muere** con `expect(informe.pasa).toBe(false)`: en el escenario de
  `@s19` (ficheros reales, 3 hallazgos) el valor CORRECTO ya es `false`, así
  que un mutante que hardcodea `false` produce el mismo resultado observable
  para ese caso concreto — verificado aplicándolo a mano: los 2 tests
  previos de este fichero siguen en VERDE con el mutante activo. La
  recomendación literal del informe de `mutation_tester` para R3
  ("`expect(informe.pasa).toBe(false)`") no basta por sí sola para los tres
  mutantes que agrupa bajo el mismo punto.

### R4 — `puertaTelefonoHardcodeado.ts:55` el mutante `pasa: false` restante (ciclo TDD nuevo)
- ROJO: nuevo test en `@s19` — "refuerzo mutación: con ficheros inspeccionados
  pero sin ningún hallazgo, la puerta pasa" — construye un `FicheroCodigo`
  sintético sin ningún teléfono y espera `informe.pasa === true` (0
  hallazgos, ficheros.length > 0, la rama de retorno final, no la guarda de
  0 ficheros de `@s20`). Confirmado en rojo aplicando el mutante `pasa: false`
  a mano: "expected false to be true", y solo este test falla (los otros 2
  del fichero siguen en verde).
- VERDE: sin cambio de producción — el código ya calculaba `pasa` correctamente
  (`hallazgos.length === CERO_HALLAZGOS`); el test solo añade el caso que
  faltaba (Ley 1: no se tocó producción sin un test rojo que lo pidiera, y
  aquí el test rojo lo pedía y el código ya lo satisfacía).
- Con este test, los tres mutantes de `puertaTelefonoHardcodeado.ts:55`
  quedan cubiertos: `pasa: true` (R3), `!==` invertido (R3), `pasa: false`
  (R4).

### R5 — `puertaTelefonoHardcodeado.ts:30` el patrón pierde la bandera global
- Test ya presente al empezar este repaso (`puertaTelefonoHardcodeado.test.ts`,
  dentro de `@s19`): `expect(informe.hallazgos).toHaveLength(3)`.
- ROJO reconfirmado a mano: `new RegExp(..., 'g')` → `new RegExp(..., '')` →
  `match()` sin bandera global solo devuelve la primera coincidencia →
  `informe.hallazgos` pasa de longitud 3 a longitud 1 → `toHaveLength(3)`
  falla ("expected [...] to have a length of 3 but got 1"). Revertido,
  vuelve a VERDE.

### R6 — `site.ts:10-12` `TELEFONO_CLINICA` / `TELEFONO_MOVIL` / `TELEFONO_URGENCIAS` vaciados (mutantes estáticos, `testsCompleted: 0`)
- **Diagnóstico de la limitación exacta (antes de escribir el test):**
  reproducido a mano el hallazgo de `mutation_tester` vaciando
  `TELEFONO_CLINICA` en `site.ts` y corriendo `pnpm exec vitest run
  src/lib/site.test.tsx` — el fichero entero falla al cargar ("Failed
  Suites", 0 tests ejecutados), porque `site.test.tsx` importa `datosNegocio`
  de forma **estática** al principio del fichero, y esa importación evalúa
  `crearTelefono(TELEFONO_CLINICA)` → `enlaceLlamada('')` → lanza, ANTES de
  que arranque ningún `it()`. Esto confirma por qué Stryker no logra
  atribuir el mutante a ningún test: no hay ninguna "ventana de test" activa
  todavía cuando el módulo se evalúa.
- Por eso un test dentro de `site.test.tsx` (aunque lea un valor derivado
  exportado como `textoVisible`) **no habría resuelto el problema**: el
  `import` estático de cabecera ya tumba el fichero completo antes de llegar
  a ese test. Confirmado con un intento fallido: añadir un test con
  `vi.resetModules()` + `import('./site')` dentro de `site.test.tsx` seguía
  produciendo "Failed Suites" (0 tests), porque el `import` estático de la
  línea 4 del fichero revienta antes de que Vitest pueda ejecutar ningún
  `it()`, incluido el nuevo.
- ROJO real / VERDE: nuevo fichero **`src/lib/site.reimportacion.test.ts`**,
  que a propósito **no** importa `./site` de forma estática — solo
  `describe/expect/it/vi` de `vitest`. Dentro del único `it()`:
  `vi.resetModules()` seguido de `const { datosNegocio } = await
  import('./site')`, y tres aserciones sobre `textoVisible` de los tres
  teléfonos (valor derivado exportado, no el `throw` en sí). Al no haber
  ningún import estático previo de `./site` en ESTE fichero, la evaluación
  del módulo ocurre POR PRIMERA VEZ dentro del cuerpo del test — dentro de
  la ventana de ejecución que Stryker sí puede atribuir a un test concreto.
- Confirmado ROJO a mano, una constante a la vez (revirtiendo entre cada
  una): `TELEFONO_CLINICA = ""` → falla en `site.ts:60` con "Teléfono no
  válido: "" está vacío", atribuido a un único test que falla
  (`1 test | 1 failed`), no a un fichero entero sin tests. Mismo resultado
  para `TELEFONO_MOVIL = ""` (falla en `site.ts:62`) y `TELEFONO_URGENCIAS =
  ""` (falla en `site.ts:65`). Las tres, revertidas, vuelven a VERDE.
- Esto satisface la instrucción explícita del repaso: preferir un test que
  dependa de un valor derivado exportado antes que depender solo del
  `throw` en tiempo de import, de forma que la atribución de cobertura de
  Stryker recaiga sobre un test real — sin declarar ninguna excepción de
  umbral en `docs/mutation-testing.md`.

## Remedición oficial de Stryker (confirma R1-R6)

Tras los seis ciclos anteriores, se repitió la medición oficial con el mismo
comando que usó `mutation_tester` (`pnpm exec stryker run --mutate <fichero>
--plugins @stryker-mutator/vitest-runner`, un fichero a la vez, nunca dos
corridas a la vez sobre el repo, `# timeout` leído antes que el score en las
tres corridas — patrón `informe-de-mutacion-con-timeouts-miente`):

| Módulo | total | killed | survived | timeout | score |
| --- | --- | --- | --- | --- | --- |
| `src/lib/site.ts` | 37 | 37 | 0 | 0 | **100.00%** |
| `src/lib/telefono.ts` | 37 | 36 | 1 | 0 | 97.30% (el único superviviente es el mutante equivalente ya verificado `telefono.ts:13`, sin tocar) |
| `src/lib/puertaTelefonoHardcodeado.ts` | 22 | 22 | 0 | 0 | **100.00%** |

Sobre los 95 mutantes no equivalentes (96 totales − 1 equivalente excluido):
**95/95 = 100%**, por encima del umbral `1.0` de `harness.config.json`. Los 9
supervivientes reales del informe de `mutation_tester` (R1-R6 arriba) quedan
todos muertos, confirmado por la propia herramienta (no solo por la
verificación manual ciclo a ciclo): en particular, `site.ts` pasa de
`testsCompleted: 0` en los tres mutantes estáticos de las líneas 10-12 a
`site.ts` **100.00%** con el nuevo test atribuido explícitamente en el
reporte de Stryker: `site.reimportacion.test.ts ✓ ... (killed 3)` — los tres
mutantes estáticos, killed por ese único test, confirmando que el diagnóstico
de R6 (aislar el `import` dinámico en un fichero sin import estático de
`./site`) resolvió la limitación de atribución de cobertura, sin declarar
ninguna excepción de umbral en `docs/mutation-testing.md`.

## Verificaciones al cierre

- `pnpm run test` → 58/58 tests en verde (7 ficheros: `contraste.test.ts`,
  `tokens.test.ts`, `puertaLiteralesColor.test.ts` de `tokens_marca`, más
  `site.test.tsx`, `telefono.test.ts`, `puertaTelefonoHardcodeado.test.ts` y
  el nuevo `site.reimportacion.test.ts` de esta feature).
- `pnpm run lint && pnpm run typecheck` → verde, cero warnings (tras el
  ajuste de R1 sobre `vitest/no-conditional-expect`).
- `node .harness/harness.mjs init` → verde de punta a punta (entorno, lint,
  typecheck, tests).

## Trazabilidad — @s → test

| Escenario | Fichero de test | Test |
| --- | --- | --- |
| @s1 | `src/lib/site.test.tsx` | `@s1 el texto visible del teléfono de la clínica...` (+ refuerzo mutación R2: ausencia de la clave `rotulo`) |
| @s2 | `src/lib/site.test.tsx` | `@s2 el segundo teléfono publicado deriva su enlace del mismo modo` |
| @s3 | `src/lib/site.test.tsx` | `@s3 el teléfono de urgencias conserva el rótulo real...` |
| @s4 | `src/lib/site.test.tsx` | `@s4 el enlace de llamada renderizado expone el número derivado...` |
| @s5 | `src/lib/site.test.tsx` | `@s5 el enlace de mensajería deriva del mismo dato...` |
| @s6 | `src/lib/site.test.tsx` | `@s6 el texto que acompaña al enlace de mensajería viaja codificado` |
| @s7 | `src/lib/telefono.test.ts` | `@s7 tres formas de escribir el mismo número producen el mismo número internacional` |
| @s8 | `src/lib/telefono.test.ts` | `@s8 un teléfono con menos de nueve dígitos hace fallar al normalizador` (+ refuerzo mutación: más de 9 dígitos, + refuerzo mutación R1: `instanceof Error`) |
| @s9 | `src/lib/telefono.test.ts` | `@s9 un teléfono vacío hace fallar al normalizador...` |
| @s10 | `src/lib/telefono.test.ts` | `@s10 un teléfono con letras hace fallar al normalizador` |
| @s11 | `src/lib/telefono.test.ts` | `@s11 un teléfono con prefijo internacional distinto del español...` |
| @s12 | `src/lib/telefono.test.ts` | `@s12 el enlace de mensajería también falla cerrado...` |
| @s13 | `src/lib/site.test.tsx` | `@s13 el horario declarado es exactamente el que publica el cliente...` |
| @s14 | `src/lib/site.test.tsx` | `@s14 ningún tramo del horario anuncia 24 horas ni apertura en domingo` |
| @s15 | `src/lib/site.test.tsx` | `@s15 el cliente no publica email...` |
| @s16 | `src/lib/site.test.tsx` | `@s16 el cliente no publica redes sociales...` |
| @s17 | `src/lib/site.test.tsx` | `@s17 la dirección se declara una vez y sus dos formas dicen lo mismo` |
| @s18 | `src/lib/site.test.tsx` | `@s18 la fuente única no declara coordenadas geográficas...` |
| @s19 | `src/lib/puertaTelefonoHardcodeado.test.ts` | `@s19 ningún módulo de la web escribe un teléfono a mano fuera de la fuente única` (+ refuerzo mutación R3: `toHaveLength(3)`, `pasa===false`, + refuerzo mutación R4: `pasa===true` con 0 hallazgos) |
| @s20 | `src/lib/puertaTelefonoHardcodeado.test.ts` | `@s20 la puerta anti-teléfono-hardcodeado falla si no inspecciona ningún fichero` |
| @s21 | `src/lib/site.test.tsx` | `@s21 la identidad del negocio se declara una sola vez y su forma compuesta no diverge` |
| — (refuerzo R6, no ata a un único `@s`) | `src/lib/site.reimportacion.test.ts` | `refuerzo mutación: los tres teléfonos reales siguen siendo el dato real al importar site.ts` — reevalúa `site.ts` dentro del ámbito del test para que Stryker atribuya los mutantes estáticos de `TELEFONO_CLINICA`/`MOVIL`/`URGENCIAS` (`site.ts:10-12`) a un test real; refuerza @s1/@s2/@s3 sin sustituirlos. |

Los 21 escenarios quedan cubiertos por al menos un test concreto. Los 9
mutantes reales que `mutation_tester` reportó como supervivientes
(`progress/mutation_datos_negocio.md`) quedan todos muertos tras R1-R6,
confirmado con una remedición oficial de Stryker (ver tabla arriba): 95/95
sobre mutantes no equivalentes.

## Notas para `judge` / `mutation_tester`

- Tres escenarios (@s10, @s11, @s14) llegaron ya en verde al escribirlos, por
  generalización natural del ciclo anterior — documentado arriba con el
  razonamiento de por qué no son vacíos.
- Dos escenarios de ausencia (@s15, @s20) se verificaron retroactivamente
  inyectando la violación y confirmando el rojo, siguiendo el patrón
  `verde-por-vacuidad-en-puerta-de-verificacion` de la memoria organizacional.
- `src/lib/puertaTelefonoHardcodeado.ts` solo tiene cobertura vía el escaneo
  de ficheros reales (@s19) y el caso de 0 ficheros (@s20); a diferencia de
  `puertaLiteralesColor.ts` (que tuvo tests sintéticos variados @s18-22), el
  `.feature` de `datos_negocio` no pide escenarios sintéticos adicionales
  para esta puerta. Si `mutation_tester` encuentra supervivientes en el
  patrón `PATRON_TELEFONO_ESPANOL` (p. ej. la clase de separadores o el
  límite de 9 dígitos), puede hacer falta un test sintético adicional — no
  añadido aquí por no estar pedido por ningún `@s` (Ley 1).
- **Actualización tras el repaso de mutación (R1-R6, ver sección dedicada
  arriba):** el hueco anticipado en el punto anterior se confirmó en la
  bandera global del patrón (`puertaTelefonoHardcodeado.ts:30`, R5) y se
  añadió además un test sintético para el mutante `pasa: false` de la línea
  55 (R4) que la recomendación literal del informe de `mutation_tester` no
  cubría por sí sola. Los 9 mutantes reales del informe quedan muertos y
  confirmados con Stryker vuelto a correr fichero a fichero: `site.ts`
  100.00% (37/37), `puertaTelefonoHardcodeado.ts` 100.00% (22/22),
  `telefono.ts` 97.30% (36/37, único superviviente el equivalente
  `telefono.ts:13`, sin tocar). No se declaró ninguna excepción de umbral en
  `docs/mutation-testing.md`.
