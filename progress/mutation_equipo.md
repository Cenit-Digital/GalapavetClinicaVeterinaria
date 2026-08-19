# Mutación — feature `equipo` (id 6)

**Contexto:** `progress/judge_equipo.md` (ronda 2) — veredicto **APPROVED**. El
único cambio requerido de la ronda 1 (`Equipo.test.tsx:130`, igualdad exacta
en vez de subcadena para el tercer `Then` de `@s7`) quedó cerrado y
verificado por sabotaje manual; el resto de la revisión completa (11/11
escenarios, disciplina TDD, calidad, checkpoints) se repitió desde cero y
salió limpia. El propio informe del `judge` deja el siguiente paso explícito:
*"mutation_tester sobre `src/components/Equipo-logica.ts` (único fichero
mordible bajo `stryker.config.json`, mismo criterio que
`Servicios-logica.ts`/`Cabecera-logica.ts`)"*. Esta es esa medición.

**Veredicto:** **PASS**

**Score:** 17/17 = **100.00%** (umbral: 100% / `1.0` en
`harness.config.json` → `mutation.threshold`). 0 supervivientes, 0
equivalentes que justificar.

## Alcance — por qué un solo fichero

`progress/tdd_equipo.md` § "Entregables" lista tres ficheros de producción
para esta feature:

- `src/data/equipo.ts` (dato estático)
- `src/components/Equipo-logica.ts` (lógica pura)
- `src/components/Equipo.tsx` (cableado)

Cruzado contra el glob `mutate` de `stryker.config.json`
(`src/lib/**/*.ts` + `src/**/*-logica.ts`, con `.tsx` deliberadamente fuera
por la limitación conocida de StrykerJS con JSX — comentario de cabecera del
propio `stryker.config.json`): **solo `Equipo-logica.ts` cae dentro de la
superficie mutable declarada del proyecto**. `equipo.ts` es un dato sin
lógica (no matchea `*-logica.ts` ni vive en `src/lib`) y `Equipo.tsx` está
excluido por convención de todo el proyecto (mismo criterio ya aplicado a
`Servicios`/`Cabecera`, citado explícitamente por el `judge`). No hay,
por tanto, otros ficheros que morder para esta feature.

## Comando usado

Workaround ya validado en sesiones anteriores de este proyecto
(`progress/mutation_tokens_marca.md`, `progress/mutation_datos_negocio.md`):
`node .harness/harness.mjs mutate <target>` falla en esta máquina con
"Cannot find TestRunner plugin vitest" (Stryker no resuelve
`@stryker-mutator/vitest-runner` vía el glob por defecto pese a estar
instalado). Se usó directamente:

```
pnpm exec stryker run --mutate src/components/Equipo-logica.ts --plugins @stryker-mutator/vitest-runner
```

Un único fichero, una única corrida (no hay un segundo ni tercer fichero
mordible que encadenar en esta feature). `concurrency: 1` ya fijado en
`stryker.config.json`. No se tocó ningún fichero de configuración.

## Verificación de entorno (concurrencia)

Antes de arrancar, `tasklist` mostró **17 procesos `node.exe`** ya en
ejecución (a diferencia de mediciones anteriores de este proyecto, donde
`tasklist` estaba limpio antes de cada arranque). Se intentó identificar sus
líneas de comando con `Get-CimInstance Win32_Process` y con `wmic` para
descartar que alguno fuera una corrida de Stryker paralela sobre este mismo
repo — ambos intentos bloqueados por el sandbox de esta sesión (sin salida /
error, sin acceso a `CommandLine`). No pude confirmar por inspección directa
de procesos que ninguno de esos 17 fuera un Stryker concurrente; su huella de
memoria (110-130 KB cada uno, uniforme) es demasiado pequeña para ser un
worker de Stryker+Vitest en marcha (que ronda decenas de MB), lo que apunta a
procesos ajenos (herramientas del IDE, shims, u otras sesiones de este
arnés multiagente) y no a Stryker, pero lo dejo anotado como limitación de
esta medición en vez de darlo por hecho.

Dado que la inspección de procesos no era concluyente, la garantía real de
validez de esta corrida recae en el propio patrón
`informe-de-mutacion-con-timeouts-miente`: se leyó la columna `# timeout`
antes que el score. Resultado: **0 timeouts** en la única corrida. Con
timeouts en cero no hace falta repetir — un Stryker contaminado por
concurrencia externa se manifestaría como timeouts espurios, y no los hay.

## Resultado (medición oficial)

| Fichero | total | killed | survived | # timeout | # no cov | # errors | score |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `src/components/Equipo-logica.ts` | 17 | 17 | 0 | 0 | 0 | 0 | **100.00%** |

Salida de Stryker (`clear-text`):

```
------------------|------------------|----------|-----------|------------|----------|----------|
                  | % Mutation score |          |           |            |          |          |
File              |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
------------------|--------|---------|----------|-----------|------------|----------|----------|
All files         | 100.00 |  100.00 |       17 |         0 |          0 |        0 |        0 |
 Equipo-logica.ts | 100.00 |  100.00 |       17 |         0 |          0 |        0 |        0 |
------------------|--------|---------|----------|-----------|------------|----------|----------|
Final mutation score of 100.00 is greater than or equal to break threshold 100
```

**Verificación independiente**, no fiada solo del resumen `clear-text`: se
leyó `reports/mutation/mutation.json` directamente con un script Node.js que
recorre `files[...].mutants` y cuenta por `status`:

```js
const r = require('./reports/mutation/mutation.json');
// ... conteo por m.status sobre todos los mutantes de todos los ficheros
```

Resultado del conteo crudo: `{ total: 17, killed: 17, survived: 0,
timeout: 0, noCoverage: 0, errors: 0 }` — coincide exactamente con el
resumen `clear-text`. Ningún mutante `Survived`, `Timeout`, `NoCoverage` ni
`RuntimeError`/`CompileError` en el JSON.

## Mutantes supervivientes / equivalentes

**Ninguno.** 17/17 mutantes muertos. No hay nada que justificar como
equivalente ni ningún hueco de aserción que reportar al `tdd_craftsman`.

Los 17 mutantes se reparten sobre las tres funciones de
`Equipo-logica.ts` (`rotuloBoton`, `tieneFormacion`, `profesionalesValidos`)
y quedan todos matados por la combinación de los tests directos de
`Equipo-logica.test.ts` y los tests de comportamiento de `Equipo.test.tsx`
(ver traza `killed by` / `covered by` en la salida detallada por test:
`@s1`, `@s3`, `@s4`, `@s7`, `@s9` aparecen como `killed` explícitos; el resto
de escenarios aparecen como `covered`, consistente con un fichero pequeño
donde varios tests ejercitan las mismas ramas).

## Conclusión

**PASS.** Score 17/17 = 100.00%, igual al umbral `1.0` de
`harness.config.json`. 0 timeouts en la única corrida (columna leída antes
que el score, patrón `informe-de-mutacion-con-timeouts-miente` respetado).
Confirmado por lectura directa de `reports/mutation/mutation.json`, no solo
por el resumen en consola. No se editó ningún fichero de `src/` ni de test
durante esta medición. Única reserva documentada: no se pudo verificar por
inspección de línea de comandos que los 17 procesos `node.exe` preexistentes
no incluyeran una corrida de Stryker paralela (sandbox bloqueó
`Get-CimInstance`/`wmic`); la huella de memoria de esos procesos es
incompatible con un worker de Stryker+Vitest activo, y el resultado de 0
timeouts es consistente con una corrida no contaminada. C7 queda satisfecho
para `equipo` (id 6): no quedan puertas de mutación pendientes.
