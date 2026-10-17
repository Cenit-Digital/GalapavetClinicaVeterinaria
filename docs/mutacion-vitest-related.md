# Mutación con Stryker + Vitest: qué tests enfrenta de verdad cada mutante (`vitest.related`)

> Sección propia de este proyecto, movida desde `docs/mutation-testing.md`. Ese
> fichero es de la plantilla y `scripts/harness-upgrade.mjs` lo reemplaza al
> actualizar el arnés; lo que sea específico de Galapavet vive aquí.

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

## Por qué esto NO debilita un 100 %

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

## Qué escribir en `progress/mutation_<name>.md`

- El reparto de estados leído del **JSON**, no de la tabla: `Killed`,
  `Survived`, `Timeout`, `NoCoverage`, `RuntimeError`. Si aparece una categoría
  que no se esperaba, decirlo.
- **`# timeout` ANTES que el score.** Un `Timeout` no es un mutante muerto: es
  una medición que no se hizo. Si la máquina se suspendió a mitad de la corrida,
  el `timeoutMS` no sobrevive al reloj y los `Timeout` son artefactos: la
  corrida se **descarta entera y se repite**, y se cuenta que se descartó.
- Cuántos ficheros y cuántos `it` enfrentó cada mutante, por lo de arriba.
