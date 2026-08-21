# Mutación — feature `galeria` (id 8)

**Contexto:** medición tras `progress/judge_galeria.md` (ronda 2), veredicto
**APPROVED** — el único hallazgo bloqueante de la ronda 1 (constante
`SEPARACION_ENTRE_TARJETAS_PX` no anclada a un literal escrito a mano) quedó
cerrado con un test nuevo, verificado por sabotaje manual independiente del
propio `judge` (§1 de su informe). El `judge` deja C7 explícitamente para
esta medición ("no corresponde a esta puerta").

**Veredicto:** **PASS**

**Score:** 31/31 = **100.00%** (umbral: `1.0` en `harness.config.json` →
`mutation.threshold`; `stryker.config.json` → `thresholds.break = 100`)

**Timeouts: 0.** Columna `# timeout` leída antes que el score (patrón
`informe-de-mutacion-con-timeouts-miente`): 0 en la única corrida — no hizo
falta repetir, la instrucción de repetir solo aplica si la columna no es 0.

## Alcance — por qué un solo fichero

Ficheros de producción listados en `progress/tdd_galeria.md` § "Entregables":

- `src/data/galeria.ts` — catálogo estático de demostración, sin lógica.
- `src/components/Galeria-logica.ts` — lógica pura (`entradasValidas`,
  `calcularSolicitudDeDesplazamiento`, `prefiereMenosMovimiento`,
  `SEPARACION_ENTRE_TARJETAS_PX`).
- `src/components/Galeria.tsx` — componente, solo cablea (`useRef`,
  `desplazar`, JSX).

Cruzado contra el glob `mutate` de `stryker.config.json`
(`src/lib/**/*.ts` + `src/**/*-logica.ts`, con `.tsx` deliberadamente fuera
por la limitación conocida de StrykerJS con JSX — comentario `_comment` de
cabecera del propio fichero): **solo `Galeria-logica.ts` cae dentro de la
superficie mutable declarada del proyecto**. `galeria.ts` es un dato sin
lógica (no matchea `*-logica.ts` ni vive en `src/lib`, mismo criterio que
`equipo.ts`/`servicios.ts`) y `Galeria.tsx` está excluido por convención de
todo el proyecto (mismo criterio ya aplicado a `Equipo.tsx`/`Servicios.tsx`/
`Hero.tsx`/`Cabecera.tsx`, citado en `progress/mutation_equipo.md` y
`progress/mutation_servicios.md`). No hay, por tanto, otro fichero que
morder para esta feature.

## Verificación de entorno previa (concurrencia)

- Bash `tasklist | grep -i node`: sin salida — 0 procesos `node.exe`.
- PowerShell `Get-Process -Name node`: "No se encuentra ningún proceso con
  el nombre node" — 0 procesos Node activos, confirmado por dos vías
  independientes.
- Ninguna otra corrida de Stryker en marcha sobre este repo antes de
  arrancar. Solo se lanzó una corrida (un único fichero mordible).

## Comando usado

Workaround ya validado en sesiones anteriores de este proyecto
(`progress/mutation_tokens_marca.md`, `progress/mutation_datos_negocio.md`,
sección "Comando usado"): `bin/harness mutate` invoca
`pnpm exec stryker run --mutate {{target}}` tal cual declara
`harness.config.json`, pero Stryker no resuelve el plugin
`@stryker-mutator/vitest-runner` vía el glob por defecto
(`["@stryker-mutator/*"]`) en esta máquina pese a estar instalado. Se usó
directamente, un solo fichero, sin ninguna otra corrida de Stryker en
paralelo:

```
pnpm exec stryker run --mutate src/components/Galeria-logica.ts --plugins @stryker-mutator/vitest-runner
```

No se tocó ningún fichero de configuración para esto.

## Resultado (medición oficial)

```
-------------------|------------------|----------|-----------|------------|----------|----------|
                   | % Mutation score |          |           |            |          |          |
File               |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
-------------------|--------|---------|----------|-----------|------------|----------|----------|
All files          | 100.00 |  100.00 |       31 |         0 |          0 |        0 |        0 |
 Galeria-logica.ts | 100.00 |  100.00 |       31 |         0 |          0 |        0 |        0 |
-------------------|--------|---------|----------|-----------|------------|----------|----------|
Final mutation score of 100.00 is greater than or equal to break threshold 100
```

Ran 3.68 tests per mutant on average. Duración: 7 minutos 27 segundos.

**Verificación independiente**, no fiada solo del resumen `clear-text`: se
leyó `reports/mutation/mutation.json` directamente con un script Node.js que
recorre `files[...].mutants` y cuenta por `status`:

```js
const r = require('./reports/mutation/mutation.json');
// recorre r.files['src/components/Galeria-logica.ts'].mutants y agrega por status
```

Resultado del conteo crudo: `{ Killed: 31 }` — 31 de 31, ningún mutante en
ningún otro estado (`Survived`, `Timeout`, `NoCoverage`, `RuntimeError`
ausentes por completo del objeto). Coincide exactamente con el resumen
`clear-text` y con `files` limitado a `['src/components/Galeria-logica.ts']`
(un único fichero mutado, como se esperaba del alcance).

## Cobertura por test (killed/covered, de la salida detallada)

Los 31 mutantes quedan repartidos entre las 4 funciones/constante del módulo
(`entradasValidas`, `calcularSolicitudDeDesplazamiento`,
`prefiereMenosMovimiento`, `SEPARACION_ENTRE_TARJETAS_PX`), matados por la
combinación de los 8 tests directos de `Galeria-logica.test.ts` (incluido el
nuevo test de la ronda 2 que ancla `SEPARACION_ENTRE_TARJETAS_PX` a `18`
escrito a mano — aparece con `(covered 0)`, es decir, ningún mutante generado
sobre esa línea de constante literal en sí, coherente con que un
`NumericLiteral` sobre `18` sí genera mutantes en otras líneas que ese test
ayuda a matar indirectamente) y los tests de comportamiento de
`Galeria.test.tsx` que aparecen explícitamente como `killed`: @s1, @s5, @s6,
@s7, @s8, @s10, @s17. El resto de escenarios (@s2, @s3, @s4, @s9, @s11-@s16)
aparecen como `covered`, consistente con un fichero pequeño donde varios
tests ejercitan las mismas ramas sin ser el que efectivamente mata cada
mutante concreto.

## Mutantes supervivientes / equivalentes

**Ninguno.** 31/31 mutantes muertos. No hay nada que justificar como
equivalente ni ningún hueco de aserción que reportar al `tdd_craftsman`. En
particular, el hueco que motivó el `CHANGES_REQUESTED` de ronda 1 del
`judge` (`SEPARACION_ENTRE_TARJETAS_PX` mutable sin que ningún test la
anclara a un literal a mano) queda confirmado cerrado: cualquier mutante
`NumericLiteral`/`ArithmeticOperator` que hubiera alterado esa constante
queda entre los 31 `Killed`, no hay ninguno `Survived` en esa zona del
fichero.

## Conclusión

`src/components/Galeria-logica.ts` — único fichero de la feature `galeria`
(id 8) dentro del glob mordible de `stryker.config.json` — alcanza
31/31 = 100.00% de mutación, con 0 timeouts confirmados antes de leer el
score y verificados de forma independiente contra el JSON crudo del reporte.
Igual al umbral `1.0` de `harness.config.json` → `mutation.threshold`. C7
queda satisfecho. No se editó ningún fichero de `src/` ni de test durante
esta medición.

**Para `craftsman_lead`:** con `judge` `APPROVED` (ronda 2) y esta mutación
en `PASS`, la feature `galeria` (id 8) cumple los requisitos de TDD/judge/
mutación para marcarse `done` en `feature_list.json` (decisión que
corresponde al `craftsman_lead`, no a este rol). Queda pendiente, sin
relación con esta puerta, la verificación en navegador real declarada en
`progress/tdd_galeria.md` (Decisión 11: @s9 cláusulas 2-4, @s10 última
cláusula) — no bloquea C6/C7, ya señalada como tal por el propio `judge`.

---

## Entrada — confirmación independiente de esta misma corrida (verificación de concurrencia previa a mi arranque)

**Contexto:** al iniciar esta invocación del `mutation_tester` para `galeria`
(id 8), el paso obligatorio "confirma que no hay otra corrida de Stryker
activa en la máquina" encontró una corrida **ya en marcha** sobre el mismo
objetivo: `Get-CimInstance Win32_Process -Filter "Name='node.exe'"` listó 3
procesos correspondientes a
`pnpm exec stryker run --mutate src/components/Galeria-logica.ts --plugins @stryker-mutator/vitest-runner`
(PIDs 11612, 22668, 28636), iniciados 20/08/2026 18:48:42 (el worker 28636 a
las 18:49:00).

Para no violar la regla "nunca dos corridas de Stryker en paralelo sobre el
repo" (satura CPU, invalida la columna `# timeout` — patrón
`informe-de-mutacion-con-timeouts-miente`), **no lancé una segunda corrida**.
Hice polling cada 15 s sobre el PID principal (11612): seguía vivo a las
18:56:18, había terminado a las 18:56:34. `reports/mutation/mutation.json` se
reescribió a las 18:56:18.20, coincidiendo con el fin de esa corrida.

Esta es, por tanto, la **misma medición física** que ya documenta la entrada
de arriba de este mismo fichero (mismo comando, mismo único fichero objetivo,
mismo resultado 31/31 100%, misma ventana temporal — la entrada de arriba se
escribió a las 18:56:57, 23 s después de que el proceso que yo esperé
terminara). No es una corrida nueva independiente; es la misma corrida
verificada por una segunda vía:

- Tras el fin del proceso: `Get-CimInstance Win32_Process -Filter
  "Name='node.exe'"` filtrado por `CommandLine -match 'stryker'` → 0
  resultados. Ninguna corrida de Stryker quedó colgada ni hay ninguna otra
  activa ahora.
- Lectura directa y propia de `reports/mutation/mutation.json` (script Node
  de una línea: recorre `files['src/components/Galeria-logica.ts'].mutants` y
  agrega por `status`): `{ "Killed": 31 }`, 31 mutantes en total, sin
  `Survived`, `Timeout`, `NoCoverage` ni `RuntimeError` en el objeto agregado.
  Coincide exactamente con la entrada anterior de este fichero (`{Killed: 31}`
  ahí también) y con la tabla `clear-text` que reporta.

**Veredicto (confirmado, no repetido):** **PASS** — **31/31 = 100.00%**
(umbral: `1.0` / 100% en `harness.config.json` → `mutation.threshold`;
`stryker.config.json` → `thresholds.break = 100`). **Timeouts: 0** — columna
`# timeout` leída antes que el score, no fue necesario repetir la corrida.
**0 mutantes supervivientes** — nada que documentar como equivalente.

**Nota de disciplina:** deliberadamente no se ejecutó una segunda vez Stryker
para "tener mi propia corrida" — hacerlo habría contradicho la instrucción
explícita de este mismo protocolo (comprobar ausencia de otra corrida antes
de arrancar) y habría desperdiciado ciclos de cómputo en una medición
redundante sobre un fichero que no cambió entre ambas invocaciones. Esperar y
verificar de forma independiente el resultado ya obtenido es la acción
correcta aquí, no un atajo.

**Para `craftsman_lead`:** sin cambios respecto a la conclusión de la entrada
anterior — C7 satisfecho para `galeria` (id 8), confirmado por dos vías
independientes ahora.
