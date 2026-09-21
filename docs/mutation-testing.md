# Prueba de mutación — validar que los tests muerden

> "Mutation testing is resource-heavy, but the ROI on code correctness is
> worth every cycle." / "We are shifting from a bottleneck of human typing
> speed to a bottleneck of compute-driven validation."

## El problema que resuelve

Una suite verde dice "el código no explota con estas entradas". **No** dice
"los tests fallarían si el código estuviera mal". Un test sin asserts fuertes
pasa siempre y no protege nada.

La prueba de mutación lo mide al revés: introduce un defecto pequeño en el
código (un *mutante*) y observa la suite.

- Si **algún test falla** → el mutante está **muerto** (killed). Bien: la red
  atrapó el defecto.
- Si **todos los tests pasan** → el mutante **sobrevive** (survived). Mal: hay
  un agujero. Falta un assert o un caso.

**Puntuación de mutación** = `killed / total`. Cuanto más alta, más muerden
los tests. El umbral vive en `harness.config.json` → `mutation.threshold`
(por defecto `0.8`).

## Cómo se corre (agnóstico)

Siempre a través del arnés, que ejecuta el comando declarado en tu config:

```bash
bin/harness mutate            # mutación del proyecto según config.commands.mutate
bin/harness mutate src/cli.py # el token {{target}} recibe este argumento
```

## Adaptadores de mutación por stack

El arnés no impone un mutador: cada stack declara el suyo en
`commands.mutate`. Los ejemplos traen dos, ambos **sin dependencias
externas**:

### Python — `tools/mutate.py` (mutador propio, cero dependencias)

`"mutate": "{{py}} tools/mutate.py {{target}}"`. El script:

1. Lee un archivo de `src/`.
2. Aplica, **uno a uno**, un catálogo de mutaciones textuales:

   | Categoría   | Ejemplo de mutación                 |
   | ----------- | ----------------------------------- |
   | Comparación | `<=` → `<`, `==` → `!=`, `>` → `>=` |
   | Aritmética  | `+` → `-`, `- 1` → `+ 1`            |
   | Booleano    | `and` → `or`, `True` → `False`      |
   | Constantes  | `0` → `1`, `1` → `0`                |
   | Retorno     | `return <expr>` → `return None`     |

3. Por cada mutante: escribe el archivo mutado, corre la suite, restaura el
   original (siempre, incluso si lo interrumpes: limpieza en `finally`).
4. Reporta `total`, `killed`, `survived`, `score` y la lista de
   sobrevivientes (`archivo:línea` + mutación). Sale != 0 si `score` está por
   debajo del umbral.

### Node/TypeScript — `tools/mutate.mjs` (mutador propio, cero dependencias)

`"mutate": "node tools/mutate.mjs {{target}}"`. Mismo contrato de salida que
el de Python, con un escáner que respeta strings y comentarios y valida cada
mutante con `node --check` antes de correr la suite (`node --test`).

### Node/TypeScript de producción — StrykerJS

Para proyectos reales (como la web corporativa que inspiró esta plantilla) el
mutador recomendado es **StrykerJS** con `@stryker-mutator/vitest-runner`:
`"mutate": "stryker run"`, umbral en `stryker.config.json`. Es más potente
(cobertura, incremental, informe HTML) a cambio de añadir dependencias.

## El umbral y los mutantes equivalentes

- Por defecto se exige superar `mutation.threshold` sobre las líneas nuevas o
  tocadas por la feature.
- Un mutante **equivalente** (no cambia el comportamiento observable) puede
  excluirse, pero **solo** con justificación explícita escrita en
  `progress/mutation_<name>.md`. Abusar de esta vía es hacer trampa al juez.

## Qué tests enfrenta de verdad cada mutante (`vitest.related`)

**Importa para leer CUALQUIER informe de mutación de este repositorio, no solo
el último.**

`@stryker-mutator/vitest-runner` v10 trae la opción `vitest.related` **en `true`
por defecto** — lo declara su propio esquema, en
`node_modules/@stryker-mutator/vitest-runner/dist/schema/vitest-runner-options.json`,
y remite al [modo `related` de Vitest](https://vitest.dev/guide/cli.html#vitest-related).
Consecuencia: **cada mutante NO se enfrenta a la suite entera**, sino solo a los
ficheros de test que Vitest considera relacionados con el fichero mutado.

Ejemplo real, medido el 21/09/2026 en la feature 39: la corrida de dos módulos
enfrentó **3 ficheros de test y 80 `it`**, no los 88 ficheros y 1422 `it` de la
suite. Por tanto **la frase «la suite de 1422 tests mató estos mutantes» es
falsa** y no debe escribirse en ningún informe.

### Por qué esto NO debilita un 100 %

Al contrario: lo hace más fuerte, y el argumento tiene tres patas. Las tres
hacen falta.

1. **Sesgo hacia más supervivientes.** Restringir el conjunto de verdugos solo
   puede quitar oportunidades de matar, nunca añadirlas. Un mutante que muere
   con `related` habría muerto igual con la suite entera.
2. **Ningún falso muerto.** La pata que el sesgo no cubre es la simétrica: un
   mutante marcado muerto por un test que falla por motivos ajenos. Lo descarta
   el `Initial test run succeeded` que Stryker imprime **antes** de mutar: si
   esos mismos tests pasan en verde sobre las fuentes intactas, cualquier rojo
   posterior es atribuible al mutante. **Léase ese número y déjese escrito.**
3. **Ningún mutante sin verdugo.** Si `related` hubiera dejado un mutante sin
   ningún test, Stryker lo marcaría `NoCoverage`, que **cuenta en contra** del
   score. Compruébese que son **0** en `reports/mutation/mutation.json`, no en
   la tabla de texto.

### Qué escribir en `progress/mutation_<name>.md`

- El reparto de estados leído del **JSON**, no de la tabla: `Killed`,
  `Survived`, `Timeout`, `NoCoverage`, `RuntimeError`. Si aparece una categoría
  que no se esperaba, decirlo.
- **`# timeout` ANTES que el score.** Un `Timeout` no es un mutante muerto: es
  una medición que no se hizo. Si la máquina se suspendió a mitad de la corrida,
  el `timeoutMS` no sobrevive al reloj y los `Timeout` son artefactos: la
  corrida se **descarta entera y se repite**, y se cuenta que se descartó.
- Cuántos ficheros y cuántos `it` enfrentó cada mutante, por lo de arriba.

## Quién hace qué

- El `mutation_tester` **mide** y reporta. No edita código.
- Un mutante sobreviviente es trabajo del `tdd_craftsman`: escribe el test
  rojo que lo mata y vuelve a pasar por el `judge`. Es el ciclo de mejora
  compute-bound: el CPU encuentra el hueco, el artesano lo tapa con un test.
