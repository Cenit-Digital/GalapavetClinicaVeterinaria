# Reparación de los rótulos de variante en la suite de navegador real

Feature activa: `rediseno_visual` (id 24). Ámbito CERRADO a cuatro specs de
`tests/e2e/`. Cero cambios en `src/`.

## Contexto

El rediseño renombró el catálogo de paletas. Los cinco rótulos vigentes son
los de `src/data/variantesPaleta.ts`:

| id        | nombre accesible  |
| --------- | ----------------- |
| `clinica` | `Clínica`         |
| `calida`  | `Cálida`          |
| `tech`    | `Tech`            |
| `eco`     | `Eco`             |
| `marca`   | `Marca Galapavet` |

`clinica` es la predeterminada (`VARIANTE_PREDETERMINADA` en
`src/lib/diseno/contratoRedisenho.ts`). Tres specs seguían citando rótulos
muertos (`Marca en oscuro`, `Lima de superficie`) o derivándolos del id sin
tildes, y agotaban el timeout de 60 s. Un cuarto había perdido una cita
obligatoria.

## Cambios, uno a uno

### 1. `tests/e2e/movimiento.spec.ts` (@s42, línea 28)

`getByRole('button', { name: 'Marca en oscuro' })` → `{ name: 'Marca
Galapavet', exact: true }`.

Motivo del cambio de rótulo y no de escenario: el clic existe para provocar un
cambio REAL de tokens y disparar las transiciones que @s42 tiene que contar en
0. Por eso se elige una variante DISTINTA de la predeterminada (`Clínica`): si
se clicara la activa, no habría transición que contar y el escenario pasaría
por vacuidad. Comentario en español añadido justificándolo en el propio spec.

### 2. `tests/e2e/red-limpia.spec.ts` (@s34, línea 121)

`getByRole('button', { name: 'Lima de superficie' })` → `{ name: 'Marca
Galapavet', exact: true }`. Mismo razonamiento: la interacción existe para
ejercitar el repintado que podría ensuciar la consola, así que tiene que
cambiar de verdad de variante.

### 3. `tests/e2e/rediseno-visual.spec.ts` (línea 61)

El spec construía el rótulo a partir del id capitalizando la primera letra:
generaba `/^Clinica$/` y `/^Calida$/`, sin tilde, que no casan con ningún
botón. Se elimina esa derivación. `VARIANTES` pasa de `readonly string[]` a
una lista de pares `{ id, nombreAccesible }`, y el bucle usa
`getByRole('button', { name: nombreAccesible, exact: true })` para clicar y el
`id` para afirmar `data-variante`.

**Decisión pedida — a mano, no importado.** El catálogo se declara a mano, con
sus tildes, en vez de importar `VARIANTES_PALETA` de
`src/data/variantesPaleta.ts`. Razón: si el spec leyera los rótulos del mismo
catálogo que pinta los botones, la comprobación sería circular y un renombrado
silencioso seguiría en verde para siempre. El repositorio ya usa este doble
anclado al literal en `tokens-aplicados.spec.ts` (@s25, misma estructura
`{ id, nombreAccesible }`, copiada aquí para que ambos specs se lean igual) y
lo documenta explícitamente en `src/lib/diseno/escenariosHeredados.test.ts`
("Literal escrito a mano — NO se obtiene de la lista que se comprueba").

### 4. `tests/e2e/tokens-aplicados.spec.ts` (@s25, línea 41)

Restituida la cita perdida en el título del `describe`:

```
'@s25 en las 5 variantes el documento pinta de verdad el fondo y el texto de la
 variante activa (ejecuta @s12 de sistema_de_diseno_visual.feature)'
```

`@s12` de `sistema_de_diseno_visual.feature` exige recorrer una a una cada
variante del selector y comprobar el color de fondo EFECTIVAMENTE computado por
el motor de render. Este test es exactamente eso, ahora sobre 5 variantes en
vez de las 4 que el escenario redactó en su día; el comentario que precede al
`describe` deja constancia de esa ampliación. La cita se restituye SOLO en el
título ejecutable: el comentario no repite el literal `@s12` a propósito, para
que la puerta de `escenariosHeredados.test.ts` (que examina el texto crudo de
`tests/e2e/*.spec.ts`) no pueda satisfacerse con un comentario suelto.

## Sobre `exact: true`

Aplicado en los tres puntos tocados. No es cosmético: el emparejamiento por
nombre accesible de Playwright es, sin `exact`, subcadena e insensible a
mayúsculas. `Clínica` casaría con el ítem del FAQ "¿Qué horario tiene la
clínica?" y `Eco` con cualquier rótulo que lo contenga. El repositorio ya
tropezó con esto en `tokens-aplicados.spec.ts`.

## Lo que NO se ha hecho

- Ninguna aserción debilitada, ningún `skip`, ningún `fixme`, ningún reintento
  (`playwright.config.ts` mantiene `retries: 0`).
- Ninguna aserción nueva ni refactor oportunista fuera del ámbito.
- Ningún fichero fuera de los cuatro asignados.

## Comandos ejecutados y salida literal

### Vitest sobre la puerta que sí se puede cerrar aquí

```
$ pnpm exec vitest run src/lib/diseno/escenariosHeredados.test.ts

 Test Files  1 passed (1)
      Tests  8 passed (8)
   Duration  4.48s
```

8/8. VERDE.

### Sabotaje real de esa puerta (prueba de que no pasa por vacuidad)

Retirada temporalmente la coletilla `(ejecuta @s12 de
sistema_de_diseno_visual.feature)` del título del `describe` y relanzado el
mismo comando:

```
 Test Files  1 failed (1)
      Tests  3 failed | 5 passed (8)
```

Confirma que son esos caracteres —y no otra cosa— los que sostienen la puerta.
Fichero restituido byte a byte desde respaldo y revalidado en 8/8 después.

### Grep de los rótulos muertos

```
$ grep -rn "Marca en oscuro\|Lima de superficie\|Verde profundo" tests/
(sin coincidencias, exit 1)
```

### Lint

```
$ pnpm run lint
> oxlint --deny-warnings
===LINT EXIT: 0===
```

### Typecheck

```
$ pnpm run typecheck
> tsc -b
===TYPECHECK EXIT: 0===
```

`tests/e2e` entra en `tsconfig.e2e.json` (`"include": ["tests/e2e",
"playwright.config.ts"]`), referenciado desde el `tsconfig.json` raíz: los
cuatro specs han sido efectivamente comprobados por `tsc -b`.

### Playwright

NO ejecutado, por instrucción expresa del orquestador (4 minutos de suite
completa). Los tres timeouts de 60 s quedan explicados por rótulos inexistentes
y corregidos aquí; la confirmación en navegador real corresponde a la pasada
final del orquestador.

## Aviso al orquestador (fuera de mi ámbito, no lo he tocado)

`git status` reporta modificados tres ficheros que NO son míos y que no he
editado: `src/components/Equipo.test.tsx`, `src/styles/global.scss` y
`tests/e2e/accesibilidad.spec.ts` (este último con una espera
`waitForFunction` añadida en @s40 y con avisos de CRLF). Presumiblemente de
otro agente en paralelo. Se señala para que no se atribuyan a esta reparación.

## Veredicto

VERDE en todo lo verificable en este ámbito: Vitest 8/8 (con sabotaje que lo
avala), lint 0, typecheck 0, cero rótulos muertos en `tests/`.
