# Mutación — feature `informacion_contacto` (id 10)

**Contexto:** medición tras `progress/judge_informacion_contacto.md` (ronda
1), veredicto **APPROVED**, "Cambios requeridos: Ninguno".

**Veredicto:** **PASS**

**Score:** 2/2 = **100%** (umbral: `1.0` en `harness.config.json` ->
`mutation.threshold`; `stryker.config.json` -> `thresholds.break = 100`)

**Timeouts: 0.** Columna `# timeout` leída antes que el score (patrón
`informe-de-mutacion-con-timeouts-miente`, recordado en el
`_comment_concurrency` de `stryker.config.json`): 0 en la única corrida — no
hizo falta repetir, la instrucción de repetir solo aplica si la columna no es
0. Confirmado también contra `reports/mutation/mutation.json`: el único
`status` presente en el objeto agregado es `Killed` (2) — ni `Timeout`, ni
`NoCoverage`, ni `RuntimeError`, ni `Survived` aparecen.

## Alcance — por qué un solo fichero

Ficheros de producción tocados por esta feature, según
`progress/tdd_informacion_contacto.md` § "Diseño previo a la escritura del
primer test" y § "Entregables":

- `src/components/InformacionContacto-logica.ts` — módulo puro
  (`TramoHorario`, `EnlaceTelefono`, `construirEnlaceTelefono`), 27 líneas.
- `src/components/InformacionContacto.tsx` — componente, solo cablea (panel
  con mapa + 4 bloques, props inyectables con sentinela `null`/valor por
  defecto de `datosNegocio`).

Cruzado contra el glob `mutate` de `stryker.config.json`
(`src/lib/**/*.ts` + `src/**/*-logica.ts`, con `.tsx` deliberadamente fuera
por la limitación conocida de StrykerJS con JSX — comentario `_comment` de
cabecera del propio fichero de configuración, mismo criterio ya aplicado y
confirmado en `progress/mutation_equipo.md`, `progress/mutation_servicios.md`,
`progress/mutation_galeria.md` y `progress/mutation_campanas_portada.md`):
**solo `InformacionContacto-logica.ts` cae dentro de la superficie mutable
declarada del proyecto**. Confirmado además por el propio comentario de
cabecera del fichero fuente (`InformacionContacto-logica.ts:4-6`): "Lógica de
decisión de `InformacionContacto`, mordible por mutación (`stryker.config.json`
muta `src/**/*-logica.ts`). El componente `.tsx` solo cablea esta lógica".
`InformacionContacto.tsx` queda excluido por convención de todo el proyecto
(no matchea ningún patrón del glob `mutate`, ni tiene sufijo `-logica.ts` ni
vive en `src/lib`). No hay, por tanto, otro fichero que morder para esta
feature.

## Verificación de entorno previa (concurrencia)

- `Get-CimInstance Win32_Process` (vía PowerShell) filtrado por
  `CommandLine -match "stryker"` antes de arrancar: los 4 procesos listados
  eran la propia cadena `bash.exe`/`powershell.exe` ejecutando la consulta
  (contienen la palabra "stryker" en el texto del comando que se estaba
  ejecutando) — 0 procesos reales de `pnpm exec stryker` o `node.exe` de
  producción activos.
- Solo se lanzó una corrida (un único fichero mordible).
- `--concurrency 1` ya fijado en `stryker.config.json`; no se tocó ningún
  fichero de configuración para esta medición.

## Comando usado

Workaround ya validado en sesiones anteriores de este proyecto
(`progress/mutation_campanas_portada.md`, `progress/mutation_galeria.md`,
sección "Comando usado"): `bin/harness mutate` invoca `pnpm exec stryker run
--mutate {{target}}` tal cual declara `harness.config.json`, pero Stryker no
resuelve el plugin `@stryker-mutator/vitest-runner` vía el glob por defecto en
esta máquina pese a estar instalado. Se usó directamente, un solo fichero,
sin ninguna otra corrida de Stryker en paralelo:

```
pnpm exec stryker run --mutate src/components/InformacionContacto-logica.ts --plugins @stryker-mutator/vitest-runner
```

## Resultado (medición oficial)

```
[33m22:04:46 WARN OptionsValidator[39m Unknown stryker config option "_comment_concurrency".
[32mINFO ProjectReader[39m Found 1 of 594 file(s) to be mutated.
[32mINFO Instrumenter[39m Instrumented 1 source file(s) with 2 mutant(s)
[32mINFO DryRunExecutor[39m Initial test run succeeded. Ran 16 tests in 4 seconds.

-------------------------------|------------------|----------|-----------|------------|----------|----------|
                               | % Mutation score |          |           |            |          |          |
File                           |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
-------------------------------|--------|---------|----------|-----------|------------|----------|----------|
All files                      | 100.00 |  100.00 |        2 |         0 |          0 |        0 |        0 |
 InformacionContacto-logica.ts | 100.00 |  100.00 |        2 |         0 |          0 |        0 |        0 |
-------------------------------|--------|---------|----------|-----------|------------|----------|----------|
Final mutation score of 100.00 is greater than or equal to break threshold 100
```

Instrumentados 2 mutantes sobre 1 fichero fuente (el módulo tiene una sola
función, `construirEnlaceTelefono`, de ahí el conteo bajo respecto a otras
features del proyecto). Ran 1.00 tests per mutant on average. Duración: 16
segundos.

**Verificación independiente**, no fiada solo del resumen `clear-text`: se
leyó `reports/mutation/mutation.json` directamente con un script Node.js que
recorre `files['src/components/InformacionContacto-logica.ts'].mutants` y
agrega por `status`.

Resultado del conteo crudo: `{ Killed: 2 }` — 2 mutantes en total, ningún
mutante en `Survived`, `Timeout`, `NoCoverage` ni `RuntimeError`. Coincide
exactamente con el resumen `clear-text`.

Detalle de los 2 mutantes, ambos `Killed`:

- id 0, `BlockStatement`, línea 25-27 (cuerpo de `construirEnlaceTelefono`
  vaciado a `{}`, forzando `return undefined`). Muerto por los tests que
  exigen la forma exacta del objeto `EnlaceTelefono` devuelto (@s3, @s5,
  @s11, @s12, entre otros que consumen el resultado de esta función a
  través del `.tsx`).
- id 1, `ObjectLiteral`, línea 26 (el objeto literal `{ textoVisible, href:
  enlaceLlamada(textoVisible) }` sustituido por objeto vacío). Muerto por
  los mismos tests: cualquier enlace renderizado pierde `textoVisible`/`href`
  reales y las aserciones de nombre/destino exacto fallan.

## Mutantes sobrevivientes

Ninguno.

## Conclusión

`src/components/InformacionContacto-logica.ts` — único fichero de la feature
`informacion_contacto` (id 10) dentro del glob mordible de
`stryker.config.json` — alcanza 2/2 = **100%** de mutación, igualando el
umbral `1.0` de `harness.config.json` -> `mutation.threshold`. **C7 queda
satisfecho.** No se editó ningún fichero de `src/` ni de test durante esta
medición (regla dura de este rol: mide, no talla). Feature
`informacion_contacto` (id 10) lista para que `craftsman_lead` la marque
`done` en `feature_list.json`, sujeta a las verificaciones pendientes
declaradas explícitamente en `progress/tdd_informacion_contacto.md` §
"Pendiente, no bloqueante para cerrar esta ronda" (Decisión 11, fuera del
gate de Vitest/Stryker por diseño).
