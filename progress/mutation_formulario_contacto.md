# Mutación — feature `formulario_contacto` (id 11)

**Contexto:** medición tras `progress/judge_formulario_contacto.md` (ronda
1), veredicto **APPROVED**, "Cambios requeridos: Ninguno".

**Veredicto:** **FAIL**

**Score:** 34/36 = **94.44%** (umbral: `1.0` en `harness.config.json` ->
`mutation.threshold`; `stryker.config.json` -> `thresholds.break = 100`)

**Timeouts: 0.** Columna `# timeout` leída antes que el score (patrón
`informe-de-mutacion-con-timeouts-miente`, recordado en el
`_comment_concurrency` de `stryker.config.json`): 0 en la única corrida — no
hizo falta repetir, la instrucción de repetir solo aplica si la columna no es
0. Confirmado también contra `reports/mutation/mutation.json`: conteo crudo
por `status` es `{ Killed: 34, Survived: 2 }` sobre 36 mutantes totales — ni
`Timeout`, ni `NoCoverage`, ni `RuntimeError` aparecen. Coincide exactamente
con el resumen `clear-text`.

## Alcance — por qué un solo fichero

Ficheros de producción entregados por esta feature, según
`progress/tdd_formulario_contacto.md` § "Ficheros de producción entregados":

- `src/components/FormularioContacto-logica.ts` — módulo puro:
  `CamposFormulario`, `ValidezCampos`, `emailTieneFormatoValido`,
  `validarCampos`, `formularioEsValido`.
- `src/components/FormularioContacto.tsx` — el formulario + la vista de
  confirmación, solo cablea (reutiliza `datosNegocio` y
  `construirEnlaceTelefono`, ningún `tel:` escrito a mano).

Cruzado contra el glob `mutate` de `stryker.config.json`
(`src/lib/**/*.ts` + `src/**/*-logica.ts`, con `.tsx` deliberadamente fuera
por la limitación conocida de StrykerJS con JSX — comentario `_comment` de
cabecera del propio fichero de configuración: "Los .tsx solo cablean, y
StrykerJS no muta ni el texto ni los atributos de JSX (issue abierto
stryker-mutator/stryker-js#4375), así que incluirlos daría una métrica
engañosa"; mismo criterio ya aplicado y confirmado en
`progress/mutation_informacion_contacto.md`, `progress/mutation_equipo.md`,
`progress/mutation_servicios.md`, `progress/mutation_galeria.md` y
`progress/mutation_campanas_portada.md`): **solo
`FormularioContacto-logica.ts` cae dentro de la superficie mutable declarada
del proyecto**. Confirmado además por el propio comentario de cabecera del
fichero fuente (`FormularioContacto-logica.ts:1-5`): "Lógica de decisión de
`FormularioContacto`, mordible por mutación (`stryker.config.json` muta
`src/**/*-logica.ts`). El componente `.tsx` solo cablea esta lógica; nada
aquí toca el DOM." `FormularioContacto.tsx` queda excluido por convención de
todo el proyecto (no matchea ningún patrón del glob `mutate`, ni tiene
sufijo `-logica.ts` ni vive en `src/lib`). No hay, por tanto, otro fichero
que morder para esta feature.

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
(`progress/mutation_informacion_contacto.md`,
`progress/mutation_campanas_portada.md`, `progress/mutation_galeria.md`,
sección "Comando usado"): `bin/harness mutate` invoca `pnpm exec stryker run
--mutate {{target}}` tal cual declara `harness.config.json`, pero Stryker no
resuelve el plugin `@stryker-mutator/vitest-runner` vía el glob por defecto
en esta máquina pese a estar instalado. Se usó directamente, un solo
fichero, sin ninguna otra corrida de Stryker en paralelo:

```
pnpm exec stryker run --mutate src/components/FormularioContacto-logica.ts --plugins @stryker-mutator/vitest-runner
```

## Resultado (medición oficial)

```
23:02:53 WARN OptionsValidator Unknown stryker config option "_comment_concurrency".
23:02:53 INFO ProjectReader Found 1 of 601 file(s) to be mutated.
23:02:53 INFO Instrumenter Instrumented 1 source file(s) with 36 mutant(s)
23:02:58 INFO DryRunExecutor Starting initial test run (vitest test runner with "perTest" coverage analysis). This may take a while.
23:03:13 INFO DryRunExecutor Initial test run succeeded. Ran 22 tests in 14 seconds.

[Survived] Regex
src/components/FormularioContacto-logica.ts:27:22
-   const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
+   const PATRON_EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+$/
Ran all tests for this mutant.

[Survived] Regex
src/components/FormularioContacto-logica.ts:27:22
-   const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
+   const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+/
Ran all tests for this mutant.

Ran 4.56 tests per mutant on average.
------------------------------|------------------|----------|-----------|------------|----------|----------|
                              | % Mutation score |          |           |            |          |          |
File                          |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
------------------------------|--------|---------|----------|-----------|------------|----------|----------|
All files                     |  94.44 |   94.44 |       34 |         0 |          2 |        0 |        0 |
 FormularioContacto-logica.ts |  94.44 |   94.44 |       34 |         0 |          2 |        0 |        0 |
------------------------------|--------|---------|----------|-----------|------------|----------|----------|
23:06:32 ERROR MutationTestReportHelper Final mutation score 94.44 under breaking threshold 100, setting exit code to 1 (failure).
23:06:32 INFO MutationTestExecutor Done in 3 minutes and 39 seconds.
```

Instrumentados 36 mutantes sobre 1 fichero fuente. Ran 4.56 tests per mutant
on average. Duración: 3 minutos 39 segundos.

**Verificación independiente**, no fiada solo del resumen `clear-text`: se
leyó `reports/mutation/mutation.json` directamente con un script Node.js que
recorre `files['src/components/FormularioContacto-logica.ts'].mutants` y
agrega por `status`.

Resultado del conteo crudo: `{ Killed: 34, Survived: 2 }` — 36 mutantes en
total, 0 en `Timeout`, `NoCoverage` ni `RuntimeError`. Coincide exactamente
con el resumen `clear-text`.

## Mutantes sobrevivientes

Ambos en la misma línea, sobre el mismo literal regex
`PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/` (`emailTieneFormatoValido`,
@s11):

- **`src/components/FormularioContacto-logica.ts:27`** — mutante id `5`,
  `Regex`: elimina el ancla de inicio `^`
  (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/` a `/[^\s@]+@[^\s@]+\.[^\s@]+$/`).
  Con el ancla eliminada, test ya no exige
  que el patrón arranque en la posición 0: basta con que exista en algún
  punto del string una subcadena con forma de email terminada en el final
  del string. Ningún test del proyecto usa un valor de Email con basura
  antes de un email valido, ejemplo espacio inicial seguido de ana arroba
  correo punto es.
  Falta: un test directo en FormularioContacto-logica.test.ts que llame a
  emailTieneFormatoValido con un espacio inicial antes de un email por lo
  demas valido, y espere false.


Con el ancla real, no hay ninguna posición de inicio válida (la posición 0
es un espacio, que falla [^\s@]); con el ancla eliminada, el motor de
regex prueba otras posiciones de inicio y encuentra el match a partir del
índice 1, dando true — precisamente la discrepancia que un test así
expondría.

- **`src/components/FormularioContacto-logica.ts:27`** — mutante id `6`,
  `Regex`: elimina el ancla de fin `$`
  (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/` a `/^[^\s@]+@[^\s@]+\.[^\s@]+/`).
  Con el ancla eliminada, basta con que el string empiece con forma de
  email; cualquier basura final ya no invalida el match. Ningún test del
  proyecto prueba un valor con basura después de un email por lo demás
  válido.
  Falta: un test directo que llame a emailTieneFormatoValido con
  ana arroba correo punto es seguido de espacio y basura, y espere false.
  Con el ancla $ real, el grupo final [^\s@]+ no puede extenderse hasta el
  final del string porque hay un espacio en medio, así que no hay ninguna
  posición de inicio que produzca un match que llegue exactamente al final
  -> false correcto; con el ancla eliminada, el match se detiene en
  ana arroba correo punto es y el resto del string se ignora -> true (bug
  expuesto).

Nota: un único test con basura simultánea antes y después (espacio, email,
espacio) NO basta para matar ambos mutantes a la vez — con espacio final y
solo el ancla de inicio eliminada (mutante 5, ancla de fin real intacta),
el grupo final seguiría sin poder alcanzar el espacio final y el resultado
sería false igual que el patrón real, sin diferenciar. Hacen falta dos
tests independientes, uno por ancla, tal como se detalla arriba.

## Conclusión

`src/components/FormularioContacto-logica.ts` — único fichero de la feature
`formulario_contacto` (id 11) dentro del glob mordible de
`stryker.config.json` — alcanza 34/36 = **94.44%** de mutación, **por
debajo** del umbral `1.0` de `harness.config.json` -> `mutation.threshold`
(`stryker.config.json` -> `thresholds.break = 100`). **C7 no queda
satisfecho.** No se editó ningún fichero de `src/` ni de test durante esta
medición (regla dura de este rol: mide, no talla). Feature
`formulario_contacto` (id 11) NO puede marcarse `done` en
`feature_list.json` hasta que el `tdd_craftsman` añada los 2 tests directos
descritos arriba (uno por mutante sobreviviente, ambos contra
`emailTieneFormatoValido` en `FormularioContacto-logica.test.ts`), vuelva a
pasar por `judge`, y esta medición se repita.

---

# Mutación — feature `formulario_contacto` (id 11), ronda 2

**Contexto:** medición tras `progress/judge_formulario_contacto.md` (ronda
2), veredicto **APPROVED**, "Cambios requeridos: Ninguno". El `tdd_craftsman`
respondió a los 2 mutantes sobrevivientes de la ronda 1 (ambos sobre
`PATRON_EMAIL` en `FormularioContacto-logica.ts:27`) con 2 tests nuevos
directos en `FormularioContacto-logica.test.ts` (Ciclo 15,
`progress/tdd_formulario_contacto.md`), sin tocar ningún fichero de
producción.

**Veredicto:** **PASS**

**Score:** 36/36 = **100%** (umbral: `1.0` en `harness.config.json` ->
`mutation.threshold`; `stryker.config.json` -> `thresholds.break = 100`)

**Timeouts: 0.** Columna `# timeout` leída antes que el score (patrón
`informe-de-mutacion-con-timeouts-miente`, recordado en el
`_comment_concurrency` de `stryker.config.json`): 0 en la única corrida — no
hizo falta repetir, la instrucción de repetir solo aplica si la columna no es
0. Confirmado también contra `reports/mutation/mutation.json`, leído con un
script Node.js propio que recorre
`files['src/components/FormularioContacto-logica.ts'].mutants` y agrega por
`status`: conteo crudo `{ Killed: 36 }` sobre 36 mutantes totales — ni
`Survived`, ni `Timeout`, ni `NoCoverage`, ni `RuntimeError` aparecen.
Coincide exactamente con el resumen `clear-text`.

## Alcance — por qué un solo fichero

Sin cambios respecto a la ronda 1: según
`progress/tdd_formulario_contacto.md` § "Ficheros de producción entregados",
la feature entrega `src/components/FormularioContacto-logica.ts` (módulo
puro) y `src/components/FormularioContacto.tsx` (solo cablea). Cruzado contra
el glob `mutate` de `stryker.config.json` (`src/lib/**/*.ts` +
`src/**/*-logica.ts`, con `.tsx` deliberadamente fuera por la limitación
conocida de StrykerJS con JSX — comentario `_comment` de cabecera del propio
fichero de configuración; mismo criterio ya aplicado en
`progress/mutation_informacion_contacto.md`,
`progress/mutation_equipo.md`, `progress/mutation_servicios.md`,
`progress/mutation_galeria.md` y `progress/mutation_campanas_portada.md`):
**solo `FormularioContacto-logica.ts` cae dentro de la superficie mutable
declarada del proyecto**. `FormularioContacto.tsx` queda excluido por
convención de todo el proyecto (no matchea ningún patrón del glob `mutate`,
ni tiene sufijo `-logica.ts` ni vive en `src/lib`). El diff de esta ronda
(2 tests nuevos en `FormularioContacto-logica.test.ts`, sin tocar
`FormularioContacto-logica.ts` ni `FormularioContacto.tsx`) no cambia el
alcance mordible respecto a la ronda 1: sigue siendo un único fichero, con el
mismo número de mutantes instrumentados (36).

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

Mismo workaround ya validado en rondas y features anteriores de este
proyecto (`progress/mutation_formulario_contacto.md` ronda 1,
`progress/mutation_informacion_contacto.md`, sección "Comando usado"):
`bin/harness mutate` invoca `pnpm exec stryker run --mutate {{target}}` tal
cual declara `harness.config.json`, pero Stryker no resuelve el plugin
`@stryker-mutator/vitest-runner` vía el glob por defecto en esta máquina pese
a estar instalado. Se usó directamente, un solo fichero, sin ninguna otra
corrida de Stryker en paralelo:

```
pnpm exec stryker run --mutate src/components/FormularioContacto-logica.ts --plugins @stryker-mutator/vitest-runner
```

## Resultado (medición oficial)

```
23:26:19 WARN OptionsValidator Unknown stryker config option "_comment_concurrency".
23:26:19 INFO ProjectReader Found 1 of 602 file(s) to be mutated.
23:26:19 INFO Instrumenter Instrumented 1 source file(s) with 36 mutant(s)
23:26:26 INFO DryRunExecutor Starting initial test run (vitest test runner with "perTest" coverage analysis). This may take a while.
23:26:45 INFO DryRunExecutor Initial test run succeeded. Ran 24 tests in 18 seconds (net 7119.0898 ms, overhead 11478.9102 ms).

Ran 3.28 tests per mutant on average.
------------------------------|------------------|----------|-----------|------------|----------|----------|
                              | % Mutation score |          |           |            |          |          |
File                          |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
------------------------------|--------|---------|----------|-----------|------------|----------|----------|
All files                     | 100.00 |  100.00 |       36 |         0 |          0 |        0 |        0 |
 FormularioContacto-logica.ts | 100.00 |  100.00 |       36 |         0 |          0 |        0 |        0 |
------------------------------|--------|---------|----------|-----------|------------|----------|----------|
23:31:07 INFO MutationTestReportHelper Final mutation score of 100.00 is greater than or equal to break threshold 100
23:31:07 INFO JsonReporter Your report can be found at: file:///C:/Users/vhurt/OneDrive/Escritorio/Proyectos/CenitDigitalProyectosCodigo/GalapavetClinicaVeterinaria/reports/mutation/mutation.json
23:31:07 INFO HtmlReporter Your report can be found at: file:///C:/Users/vhurt/OneDrive/Escritorio/Proyectos/CenitDigitalProyectosCodigo/GalapavetClinicaVeterinaria/reports/mutation/index.html
23:31:07 INFO MutationTestExecutor Done in 4 minutes and 49 seconds.
```

Instrumentados 36 mutantes sobre 1 fichero fuente (mismo número que la ronda
1: los 2 tests nuevos no añaden ni quitan superficie mordible, solo cubren
mutantes ya existentes). Ran 3.28 tests per mutant on average (baja respecto
a la ronda 1 porque `FormularioContacto.test.tsx` completo — 14 tests — sale
`covered` a 0/25 en la mayoría de mutantes de esta corrida, ya que los 2
mutantes que antes solo mataban tests de `-logica.test.ts` ahora también
mueren ahí, sin necesitar el camino largo vía DOM). Duración: 4 minutos 49
segundos.

Los 2 mutantes que sobrevivieron en la ronda 1 (id 5, elimina `^`; id 6,
elimina `$`, ambos en `FormularioContacto-logica.ts:27`, literal
`PATRON_EMAIL`) aparecen ahora como `killed` en el log detallado por los 2
tests nuevos de refuerzo:

- `@s11 ... refuerzo mutación (ancla de inicio): basura antes de un email
  por lo demás válido es inválido (killed 1)`
- `@s11 ... refuerzo mutación (ancla de fin): basura después de un email por
  lo demás válido es inválido (killed 1)`

**Verificación independiente**, no fiada solo del resumen `clear-text`: se
leyó `reports/mutation/mutation.json` directamente con un script Node.js que
recorre `files['src/components/FormularioContacto-logica.ts'].mutants` y
agrega por `status`.

Resultado del conteo crudo: `{ Killed: 36 }` — 36 mutantes en total, ningún
mutante en `Survived`, `Timeout`, `NoCoverage` ni `RuntimeError`. Coincide
exactamente con el resumen `clear-text`. `file.mutants.filter(m => m.status === 'Survived')`
devuelve `[]`.

## Mutantes sobrevivientes

Ninguno. Los 2 mutantes sobrevivientes de la ronda 1 (id 5 y id 6, ambos
sobre `PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/`) quedan muertos por los 2
tests nuevos de `FormularioContacto-logica.test.ts` (Ciclo 15,
`progress/tdd_formulario_contacto.md`), ya reproducido de forma independiente
por el `judge` en su ronda 2 (`progress/judge_formulario_contacto.md`,
"Verificación propia").

## Conclusión

`src/components/FormularioContacto-logica.ts` — único fichero de la feature
`formulario_contacto` (id 11) dentro del glob mordible de
`stryker.config.json` — alcanza 36/36 = **100%** de mutación, igualando el
umbral `1.0` de `harness.config.json` -> `mutation.threshold`
(`stryker.config.json` -> `thresholds.break = 100`). **C7 queda
satisfecho.** No se editó ningún fichero de `src/` ni de test durante esta
medición (regla dura de este rol: mide, no talla). Feature
`formulario_contacto` (id 11) lista para que `craftsman_lead` la marque
`done` en `feature_list.json`.
