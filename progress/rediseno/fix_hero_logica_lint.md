# Fix — variables/imports sin usar en `Hero-logica.test.ts` (@s51)

Feature `rediseno_visual` (id 24). Ámbito cerrado: **únicamente**
`src/components/Hero-logica.test.ts`. Ningún otro fichero se ha tocado
(`Hero-logica.ts`, `Hero.tsx` y todo lo demás quedan byte a byte igual).

**Veredicto: VERDE.**

---

## 0. Diagnóstico exacto (comandos ejecutados antes de tocar nada)

### `pnpm exec tsc -b --pretty false`

```
src/components/Hero-logica.test.ts(1,1): error TS6133: 'createElement' is declared but its value is never read.
src/components/Hero-logica.test.ts(2,1): error TS6192: All imports in import declaration are unused.
src/components/Hero-logica.test.ts(9,1): error TS6133: 'Hero' is declared but its value is never read.
src/components/Hero-logica.test.ts(29,7): error TS6133: 'FUENTES_EN_ORDEN' is declared but its value is never read.
src/components/Hero-logica.test.ts(44,10): error TS6133: 'leerCifraPublicada' is declared but its value is never read.
src/components/Hero-logica.test.ts(61,10): error TS6133: 'identificadoresDeLosArgumentos' is declared but its value is never read.
src/lib/diseno/bundleDeDiseno.test.ts(8,3): error TS2305: Module '"./bundleDeDiseno"' has no exported member 'PANTALLAS_DEL_BUNDLE'.
src/lib/diseno/matrizDeContraste.test.ts(381,29): error TS2304: Cannot find name 'FicheroDeTexto'.
src/lib/diseno/matrizDeContraste.test.ts(397,21): error TS2304: Cannot find name 'ejecutarPuertaDeReconciliacionDeMatriz'.
```

Los 3 últimos errores (`bundleDeDiseno.test.ts`, `matrizDeContraste.test.ts`)
son de **otro ámbito** (otros artesanos trabajando en otras features del
árbol en paralelo). No se tocan y siguen presentes después del fix: son
esperados y quedan fuera de esta tarea.

### `pnpm exec oxlint --deny-warnings src/components/Hero-logica.test.ts`

```
src/components/Hero-logica.test.ts:1:10: error eslint(no-unused-vars): Identifier 'createElement' is imported but never used.
src/components/Hero-logica.test.ts:2:10: error eslint(no-unused-vars): Identifier 'render' is imported but never used.
src/components/Hero-logica.test.ts:2:18: error eslint(no-unused-vars): Identifier 'screen' is imported but never used.
src/components/Hero-logica.test.ts:2:26: error eslint(no-unused-vars): Identifier 'within' is imported but never used.
src/components/Hero-logica.test.ts:9:10: error eslint(no-unused-vars): Identifier 'Hero' is imported but never used.
src/components/Hero-logica.test.ts:29:7: error eslint(no-unused-vars): Variable 'FUENTES_EN_ORDEN' is declared but never used.
src/components/Hero-logica.test.ts:44:10: error eslint(no-unused-vars): Function 'leerCifraPublicada' is declared but never used.
src/components/Hero-logica.test.ts:61:10: error eslint(no-unused-vars): Function 'identificadoresDeLosArgumentos' is declared but never used.
```

Coincide exactamente con los 8 símbolos señalados en el encargo.

---

## 1. Por qué cada símbolo era seguro de borrar

Búsqueda (`grep`) de cada identificador en el fichero completo, **antes**
de tocarlo: ninguno de los 8 aparece fuera de su propia declaración/import.
Los 4 tests presentes (1 histórico de `@s51` + 3 añadidos en la ronda
`tdd_datos-reales.md` para `@s51`) verifican la cláusula íntegra del
escenario:

- *Then* cada cifra se calcula a partir de esos datos → test 1 y 2.
- *And* cambiar un dato en la fuente única cambia la cifra correspondiente
  → test 3 (sabotaje por fuente, contador `[0,1,2,3]`).
- *And* ninguna cifra está escrita a mano en el componente → test 4, que lee
  el **texto fuente real** de `Hero.tsx` con `import.meta.glob(..., {query:
  '?raw'})` y comprueba con `digitosDe`/`extraerFragmento` (de
  `src/lib/diseno/datosDelSitio.ts`) que ni la banda de cifras ni la llamada
  a `construirCifrasBienvenida` contienen un solo dígito.

Los 8 símbolos eliminados pertenecían a un enfoque **abandonado y nunca
usado** para esa misma cuarta cláusula: renderizar `Hero` con
`@testing-library/react` (`createElement`, `render`, `screen`, `within`,
`Hero`) y leer las cifras del DOM ya pintado con un parser propio
(`leerCifraPublicada`, la interfaz `CifraPublicada` que solo ella
consumía, `identificadoresDeLosArgumentos`, `FUENTES_EN_ORDEN`). Ese
enfoque fue sustituido por la comprobación directa sobre el texto fuente
(`extraerFragmento` + `digitosDe`), que es estrictamente más fuerte: no
depende de que React pinte nada, inspecciona el literal tal cual está
escrito en `Hero.tsx`. `progress/rediseno/tdd_datos-reales.md` (§2, ciclo
15; §3, tabla `@s51`; §4, `SABOTAJE H/I`) documenta ese ciclo y no
menciona en ningún momento un test basado en render/DOM: el mapa
cláusula→aserción de `@s51` ya estaba completo con las 4 pruebas actuales
antes de este fix.

Por tanto no hay ningún "test a medio escribir" que completar por TDD: son
imports y funciones de un borrador descartado, huérfanos, que no delatan
ninguna aserción pendiente del contrato. Se han eliminado tal cual:

- `import { createElement } from 'react'`
- `import { render, screen, within } from '@testing-library/react'`
- `import { Hero } from './Hero'`
- `const FUENTES_EN_ORDEN = [...]`
- `interface CifraPublicada { ... }` (solo consumida por `leerCifraPublicada`)
- `function leerCifraPublicada(...) { ... }`
- `function identificadoresDeLosArgumentos(...) { ... }` (con su comentario JSDoc)

Ningún test existente se ha tocado: los 4 `it(...)` siguen con el mismo
cuerpo y las mismas aserciones, carácter por carácter (`git diff` solo
añade líneas nuevas antes de `describe`, nunca modifica las que ya
estaban).

---

## 2. Verificación tras el fix

### 2.1 `pnpm exec vitest run src/components/Hero-logica.test.ts`

```
 RUN  v4.1.10 C:/Users/vhurt/OneDrive/Escritorio/Proyectos/CenitDigitalProyectosCodigo/GalapavetClinicaVeterinaria

 Test Files  1 passed (1)
      Tests  4 passed (4)
   Start at  09:52:34
   Duration  1.49s (transform 68ms, setup 279ms, import 61ms, tests 6ms, environment 979ms)
```

Mismos 4 tests que antes del fix (verificado corriendo el mismo comando
antes de editar: también `4 passed (4)`), mismos nombres, mismo cuerpo.

### 2.2 `pnpm exec oxlint --deny-warnings src/components/Hero-logica.test.ts`

Sin salida, `EXIT=0`.

### 2.3 `pnpm exec tsc -b --pretty false`

```
src/lib/diseno/bundleDeDiseno.test.ts(8,3): error TS2305: Module '"./bundleDeDiseno"' has no exported member 'PANTALLAS_DEL_BUNDLE'.
src/lib/diseno/matrizDeContraste.test.ts(381,29): error TS2304: Cannot find name 'FicheroDeTexto'.
src/lib/diseno/matrizDeContraste.test.ts(397,21): error TS2304: Cannot find name 'ejecutarPuertaDeReconciliacionDeMatriz'.
```

Cero errores que citen `Hero-logica.test.ts`. Los 3 restantes son de otro
ámbito (no tocado, fuera de esta tarea) y ya estaban presentes en el
diagnóstico inicial, sin relación con este fichero.

### 2.4 Alcance del cambio (`git status` / `git diff`)

`git status --porcelain` confirma que el único fichero que este fix marca
como modificado adicionalmente es `src/components/Hero-logica.test.ts`;
el resto de entradas `M`/`??` ya existían antes de esta tarea (trabajo de
otros artesanos en curso). `git diff -- src/components/Hero-logica.test.ts`
muestra únicamente la eliminación de los 8 símbolos sin usar; ninguna
línea de los `it(...)` existentes cambia.

---

## 3. Resumen

| Símbolo | Tipo | Acción |
| --- | --- | --- |
| `createElement` (import `react`) | import | eliminado |
| `render`, `screen`, `within` (import `@testing-library/react`) | import | eliminados (import completo) |
| `Hero` (import `./Hero`) | import | eliminado |
| `FUENTES_EN_ORDEN` | const | eliminada |
| `CifraPublicada` | interface (solo consumida por `leerCifraPublicada`) | eliminada |
| `leerCifraPublicada` | función | eliminada |
| `identificadoresDeLosArgumentos` | función | eliminada |

Ningún test se ha borrado ni debilitado. Los 4 tests de
`Hero-logica.test.ts` (`@s51`) siguen verdes con las mismas aserciones.
