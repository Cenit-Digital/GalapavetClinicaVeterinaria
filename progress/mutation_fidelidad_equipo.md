# Mutación — fidelidad_equipo (31)

## Medición 1 (craftsman_lead, 03/09/2026 20:05) — FAIL

```
pnpm exec stryker run --mutate src/components/Equipo-logica.ts --testFiles src/components/Equipo-logica.test.ts --plugins @stryker-mutator/vitest-runner
```

| Fichero | Mutantes | Eliminados | Supervivientes | Timeouts | Puntuación |
| --- | ---: | ---: | ---: | ---: | ---: |
| `Equipo-logica.ts` | 65 | 53 | **12** | 0 | 81,5 % (umbral 100 %) |

Supervivientes (línea:columna · mutador · sustitución):

- `33:12` Regex `/\s+/` → `/\s/` (`inicialesDe`: separar por un solo espacio da el mismo resultado con los datos probados).
- `51:47` ArrayDeclaration `RECUENTOS_EN_LETRA` → `[]`, y `51:48…51:113` StringLiteral: cada uno de `'Un' … 'Nueve'` → `""`.
- `58:28` StringLiteral `PISTA_DE_FORMACION` → `""`.

Causa: `Equipo-logica.test.ts` no fija esos literales **por valor tecleado a
mano** (patrón `doble-de-test-anclado-al-literal-no-al-simbolo` de
`feature_list.json` → `rules.notas`); el test de `recuentoEnLetra` recorre o
importa la misma tabla y `resumenDelEquipo` solo se muerde con «Dos». Un
segundo intento con `Equipo.test.tsx` incluido no puede matar `'Tres'…'Nueve'`
(los datos reales tienen 2 miembros): se abortó.

Pendiente: un ciclo corto del artesano que añada, en `Equipo-logica.test.ts`,
`expect(recuentoEnLetra(n)).toBe('<literal>')` para n = 1…9 y ≥ 10, un caso de
`inicialesDe` con dos espacios seguidos («Marcos  Pérez» → «MP») y la aserción
del texto exacto de la pista de formación. Después, repetir la medición.

---

## Medición 2 (tdd_craftsman, 03/09/2026 20:26) — PASS

```
pnpm exec stryker run --mutate src/components/Equipo-logica.ts --testFiles src/components/Equipo-logica.test.ts --plugins @stryker-mutator/vitest-runner
```

**Columna `# timeout` leída ANTES que el score** (patrón
`informe-de-mutacion-con-timeouts-miente`, `feature_list.json` → `rules.notas`):
**0**. El informe vale; no hay que repetir la corrida.

| Fichero | Mutantes | Eliminados | Supervivientes | Timeouts | Puntuación |
| --- | ---: | ---: | ---: | ---: | ---: |
| `Equipo-logica.ts` | 65 | **65** | **0** | **0** | **100,00 %** (umbral 100 %) |

Duración 5 min 44 s, `concurrency: 1`, exit 0 («Final mutation score of 100.00
is greater than or equal to break threshold 100»).

**Verificación independiente del JSON crudo** (no fiada del resumen
`clear-text`): recorriendo `files['src/components/Equipo-logica.ts'].mutants` y
agregando por `status`:

```
{"Killed":65}   total 65   score 100.00
mutados: ['src/components/Equipo-logica.ts']   testFiles: ['src/components/Equipo-logica.test.ts']
```

Ni un `Survived`, `Timeout`, `NoCoverage` ni `RuntimeError` en el objeto.

## Por qué sobrevivían los 11 mutantes de constante (causa raíz, no «faltaba un assert»)

La medición 1 lo atribuyó a que los literales no estaban fijados por valor
tecleado a mano. **No era eso**: el fichero de test ya afirmaba
`recuentoEnLetra(2) === 'Dos'` y el párrafo completo con la pista, ambos
tecleados a mano, y aun así los mutantes sobrevivían con los tests
**ejecutados y en verde** (`testsCompleted` > 0 en el JSON).

La causa es de planificación de StrykerJS, y está en su propio código
(`@stryker-mutator/core/dist/src/mutants/mutant-test-planner.js`):

- `RECUENTOS_EN_LETRA` y `PISTA_DE_FORMACION` son constantes de módulo: se
  evalúan **al importar**, así que Stryker las marca `static: true` con
  `coveredBy: []`.
- Para un mutante estático con `ignoreStatic: false`, el plan es
  `testFilter = globalTestFilter`; y `globalTestFilter` existe **justo cuando se
  pasa `--testFiles`**. La línea siguiente decide la activación:
  `mutantActivation: testFilter ? 'runtime' : 'static'`.
- Con activación `'runtime'`, `stryker-setup.js` fija el mutante activo en un
  `beforeAll`, es decir **con el módulo ya importado**. El literal vaciado no
  llega a evaluarse nunca: la suite pasa y el mutante sobrevive, aunque
  cualquiera de esas aserciones lo detectaría si el módulo se hubiera evaluado
  con él dentro.

Por eso `progress/mutation_galeria.md` (feature 8, corrida **sin**
`--testFiles`) sí mataba el mutante estático de su fichero: sin `--testFiles`
la activación es `'static'` y el módulo se carga ya mutado.

**Cómo se matan sin renunciar a `--testFiles`:** re-evaluando el módulo
*dentro* del cuerpo del test, con `vi.resetModules()` + `import()` dinámico —
el patrón que este repo ya tenía en `src/lib/site.reimportacion.test.ts` para
los tres teléfonos reales (`progress/mutation_datos_negocio.md`, sección de
mutantes estáticos). Ahora vive en `Equipo-logica.test.ts` como el helper
`recargarEquipoLogica()`: la re-evaluación ocurre con el mutante ya activo y
los 11 pasan de `Survived` a `Killed` (en el JSON, `killedBy` apunta a los
tests nuevos 13–21 y 29).

Comprobado además que la re-importación crea de verdad otra instancia del
módulo (aserción temporal `expect(recargada).not.toBe(...)`, verde y retirada
antes de medir).

## Tests añadidos (anclados al literal tecleado a mano, ninguno a la constante)

| Superviviente de la medición 1 (línea vieja → nueva) | Test que lo mata |
| --- | --- |
| `51:47` ArrayDeclaration `RECUENTOS_EN_LETRA` → `[]` (hoy `59:47`) | `1 se escribe "Un"` (con `[]`, `recuentoEnLetra(1)` cae a `String(1)` → `'1'`) |
| `51:48…51:113` StringLiteral `'Un'…'Nueve'` → `""` (hoy `59:48…59:113`) | nueve `it` independientes, uno por valor: `1 se escribe "Un"` … `9 se escribe "Nueve"` |
| `58:28` StringLiteral `PISTA_DE_FORMACION` → `""` (hoy `66:28`) | `el párrafo completo, pista de formación incluida, es exactamente el texto esperado` |
| `33:12` Regex `/\s+/` → `/\s/` (hoy `42:12`) | `con dos espacios seguidos, la segunda inicial es la del apellido, nunca la de un hueco` y el caso con tabulador — **tras el refactor de abajo** |

La tabla `it.each` de `recuentoEnLetra` se sustituyó por los nueve `it`
explícitos: mismo contrato, sin recorrer ninguna tabla y sobre el módulo
re-evaluado. `recuentoEnLetra(10) === '10'` se mantiene tal cual (no depende de
ninguna constante estática). Los tests previos de `resumenDelEquipo` siguen
donde estaban: muerden los mutantes de la función, que son de tiempo de
ejecución.

## Mutante equivalente demostrado — y el refactor que lo hace mordible

`Equipo-logica.ts:33:12`, `Regex /\s+/ → /\s/`, con la implementación de la
medición 1:

```ts
return nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((palabra) => palabra[0]).join('')
```

**Era equivalente, no un hueco de la suite.** Partir por tandas de blancos y
partir por cada blanco producen exactamente los mismos trozos **no vacíos**; el
`.filter(Boolean)` borraba las cadenas vacías de más que introduce `/\s/`, así
que el resultado coincidía para *cualquier* entrada. Ningún test podía matarlo.
Demostración por fuerza bruta (14.649 entradas: todas las palabras de cuatro
símbolos sobre el alfabeto `a B ñ 0 ' ' '  ' TAB NL NBSP '' ·`, más los casos
reales del test):

```
actual != mutante (/\s/):                     0   -> mutante EQUIVALENTE
actual != propuesta (trim + sin filter):      0   -> refactor sin cambio de comportamiento
propuesta != propuesta mutada con /\s/:    1227   -> ya es mordible ('Marcos  Pérez' -> 'M' en vez de 'MP')
propuesta != propuesta sin trim():          626   -> el nuevo mutante de trim() también es mordible
```

No se excluyó con comentarios `// Stryker disable` (lo prohíbe el encargo y
`docs/mutation-testing.md`): se eliminó la **redundancia** que lo volvía
equivalente. `.trim()` deja al cuantificador `+` como único responsable de
dónde acaba cada palabra, y entonces perder ese `+` sí cambia el resultado:

```ts
return nombre.trim().split(/\s+/).slice(0, PALABRAS_QUE_APORTAN_INICIAL).map((palabra) => palabra[0]).join('')
```

Es el **único** cambio de producción de la sesión, va documentado en el JSDoc
de `inicialesDe` y no altera el comportamiento observable (0 diferencias en
14.649 entradas; los seis tests previos de `inicialesDe` siguen verdes sin
tocarlos). Contabilidad de mutantes: desaparece el `MethodExpression` de
`.filter()` y aparece el de `.trim()` — el fichero sigue teniendo 65 mutantes y
ambos mueren (`40:10` → `nombre` lo mata el caso `'  Ana María'`).

## Puertas verdes con el cambio

- `pnpm exec vitest run src/components/Equipo-logica.test.ts src/components/Galeria-logica.test.ts` → **47/47**.
- `pnpm exec vitest run src/components/Equipo.test.tsx src/components/Galeria.test.tsx` → **59/59** (el componente que consume `inicialesDe`, intacto).
- `pnpm run typecheck` (`tsc -b`) → exit 0; `pnpm exec oxlint --deny-warnings` sobre los ficheros tocados → exit 0.

## Concurrencia

Antes de arrancar: `Get-CimInstance Win32_Process -Filter "Name='node.exe'"`
filtrado por `CommandLine -match 'stryker'` → **0 procesos**. Una sola corrida
de Stryker a la vez (primero equipo, después galería), nunca dos en paralelo.

## Ficheros tocados

- `src/components/Equipo-logica.test.ts` — helper `recargarEquipoLogica()`, nueve `it` por valor, párrafo completo re-evaluado y dos casos de `inicialesDe` (dos espacios y tabulador).
- `src/components/Equipo-logica.ts` — solo `inicialesDe`: `.trim()` y retirada del `.filter(Boolean)` redundante (mutante equivalente demostrado), con el porqué en su JSDoc.

Nada más: ni `feature_list.json`, ni ficheros de otras secciones.

## Verificación final independiente — 03/09/2026 20:59

Se repitió la puerta de mutación sobre el código final, aislada de cualquier
otra medición:

```
pnpm exec stryker run --mutate src/components/Equipo-logica.ts --plugins @stryker-mutator/vitest-runner --concurrency 1
```

Resultado: **65/65 eliminados, 100,00 %, 0 supervivientes, 0 timeouts, 0 sin
cobertura y 0 errores**. La ejecución inicial de Stryker pasó 228 pruebas y
la medición terminó en 4 min 29 s.
