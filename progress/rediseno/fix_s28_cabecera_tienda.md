# Cierre de @s28 en `Cabecera*` — TDD real, retomado tras interrupción de sesión

Alcance de esta sesión: **solo** `src/components/Cabecera.tsx`,
`Cabecera.module.scss`, `Cabecera-logica.ts`, `Cabecera.test.tsx`,
`Cabecera-logica.test.ts`. Ningún otro fichero tocado.

## 1. Razonamiento sobre "muestra un control de urgencias..."

`Cabecera.test.tsx` tiene, desde antes de `rediseno_visual` (contrato
`cabecera_y_navegacion.feature`, ya `done`), el test `@s13` ("la cabecera no
anuncia urgencias ni contiene teléfonos", líneas 205-216) que exige que
`<Cabecera/>` **nunca** muestre el texto "Urgencias" ni teléfonos ni enlaces
`tel:`. Ese test sigue vigente y **no lo he tocado ni debilitado**.

La cláusula de `@s28` "muestra un control de urgencias con el color de
urgencia de la variante activa" la satisface el componente **separado**
`<BarraUrgencias/>` (`src/components/BarraUrgencias.tsx`), que ya existe, ya
tiene su propia cobertura (`@s27`, `BarraUrgencias.test.tsx`) y ya se monta
en `App.tsx` justo antes de `<Cabecera/>`:

```tsx
// App.tsx
<BarraUrgencias />
<Cabecera ancho={ancho} rutaActual={pathname} />
```

Las dos, juntas, forman una única franja fija visual (`Cabecera.module.scss`:
`inset-block-start: var(--altura-barra-urgencias)`, el `<header>` arranca
justo debajo de la barra). No hay tensión de contrato real: `@s28` describe
"la cabecera" en sentido de conjunto de la franja superior, no exige que el
control de urgencias viva dentro del `<header>` semántico. No he añadido
ningún control de urgencias nuevo dentro de `<header>`.

## 2. "muestra un acceso a la tienda con borde y sin relleno"

### Ciclo TDD 1 — el hook de estilo en el marcado

**ROJO** (`Cabecera.test.tsx`, describe `@s28 el acceso a la Tienda...`):
dos tests nuevos comprobando que el enlace "Tienda" (y solo él) lleva un
atributo `data-enlace-tienda`, en escritorio y en el panel móvil. Fallo real
capturado:

```
Expected the element to have attribute:
  data-enlace-tienda
Received:
  null
```

**VERDE**: importé `esDestinoTienda` (ya existía, sin usar, en
`Cabecera-logica.ts`) en `Cabecera.tsx` y añadí en `ListaDeEnlaces`:

```tsx
data-enlace-tienda={esDestinoTienda(enlace.destino) ? '' : undefined}
```

Como `ListaDeEnlaces` es la misma para escritorio y panel móvil, ambos
quedaron cubiertos por el mismo cambio mínimo.

### Ciclo TDD 2 — el estilo real ("botón fantasma") en la hoja de estilos

Nada en `.test.tsx` puede aseverar sobre nombres de clase CSS Modules (regla
explícita del proyecto, `vite.config.ts:61-79`: en test, un `.module.scss`
importado normalmente es un proxy opaco). Por eso, siguiendo el patrón ya
establecido en `InformacionContacto.test.tsx` (`cuerpoDelBloque` +
`import.meta.glob(..., { query: '?raw' })`), añadí en `Cabecera.test.tsx` una
copia local de ese mismo patrón (no puedo importarlo del otro fichero de
test, no es un módulo compartido) para leer el texto REAL de
`Cabecera.module.scss` y comprobar que el selector del enlace de Tienda
incluye el mixin compartido `boton-fantasma` (el mismo que ya usa
`InformacionContacto.module.scss` para el teléfono de urgencias y
`CampanasPortada.module.scss` para su CTA).

**ROJO**:

```
Error: no se encontró la cabecera "a[data-enlace-tienda] {" en el texto
```//(x2, escritorio y panel móvil)

**VERDE**: en `Cabecera.module.scss`, dentro de `.navPrincipal { ... }` y de
`.panelMovil { ... }`, añadí:

```scss
a[data-enlace-tienda] {
  @include boton-fantasma;
}
```

La mayor especificidad de `a[data-enlace-tienda]` frente a `a` ya existente
en el mismo bloque hace que el estilo de botón fantasma (borde +
`background-color: transparent`) gane sobre el resto de reglas de enlace de
navegación, sin ningún `!important`.

## 3. "el sitio del ancla de destino... se calcula desde la altura real..., no desde un número escrito a mano"

`Cabecera-logica.ts` ya tenía, de una oleada TDD interrumpida, la función
pura `posicionDeScrollParaAncla` (con su propia cobertura completa en
`Cabecera-logica.test.ts`) pero **sin ningún punto de llamada real**.
Confirmé con un test real (no lo di por hecho) que el `<header>` arranca
justo debajo de `BarraUrgencias`, así que `getBoundingClientRect().bottom`
del propio `<header>` ya es la altura de la franja fija completa (barra +
cabecera) — ver el test "llama a `window.scrollTo` con el scroll ya
acumulado..." más abajo, que fija `bottom: 96` a mano y comprueba que ese
único número entra en la fórmula.

Decisión de diseño (dentro del `Given` de `@s28`, que fija explícitamente
"una ventana más ancha que el punto de corte"): el nuevo manejador de clic
**solo** se conecta a la navegación de ESCRITORIO
(`<nav aria-label="Navegación principal">`). El panel móvil, que ya tenía su
propio `alPulsar` (cierra el menú + `pushState` para subpáginas, cubierto por
`@s9`/`@s10` de `cabecera_y_navegacion.feature`, ya `done`), **no lo toqué**:
interceptar también ahí el clic de un ancla con `preventDefault` sin más
habría roto `@s9` (que comprueba `window.location.hash` tras un salto
nativo). No hay ningún escenario que pida este comportamiento en móvil
todavía, así que no lo adelanté (regla "un `@s` a la vez").

### Ciclo TDD 3 — cálculo del scroll (caso feliz)

**ROJO**:

```
AssertionError: expected "vi.fn()" to be called with arguments: [ { top: 604, behavior: 'smooth' } ]
Number of calls: 0
```

**VERDE**: añadí `refCabecera` (`useRef<HTMLElement>(null)`, colgado del
`<header>`) y `desplazarAAncla`, conectado como `alPulsar` de la
`ListaDeEnlaces` de escritorio. Reutiliza `posicionDeScrollParaAncla`
(`Cabecera-logica.ts`) y `decidirComportamientoDesplazamiento`
(`src/lib/desplazamiento.ts`, ya existente — no se reinventó ese cálculo).

### Ciclo TDD 4 — rama de "menos movimiento" (`behavior: 'auto'`)

**ROJO**: mismo mensaje que arriba, con `behavior: 'auto'` esperado y 0
llamadas reales. **VERDE**: ya cubierto por el mismo `desplazarAAncla` de
arriba (rama ya implementada por `decidirComportamientoDesplazamiento`); el
test solo necesitó fijar la preferencia con
`vi.stubGlobal('matchMedia', ...)` (mismo patrón que
`PaginaCampanas.test.tsx`, `fijarPreferenciaDeMovimiento`).

### Ciclo TDD 5 — guarda de "el elemento de destino no existe todavía"

Aquí hice explícito un paso de sabotaje/rigor: implementé primero la lógica
**sin** la comprobación `elementoDestino === null` y corrí el test nuevo
("si la sección de destino no existe..."). Falló de verdad, no por la
aserción sino por una excepción no controlada — la prueba de que la guarda
hace falta de verdad, no es defensiva de adorno:

```
AssertionError: expected '' to be '#contacto'
...
⎯⎯⎯⎯⎯⎯ Unhandled Errors ⎯⎯⎯⎯⎯⎯
TypeError: Cannot read properties of null (reading 'getBoundingClientRect')
 ❯ desplazarAAncla src/components/Cabecera.tsx:78:62
```

**VERDE**: añadí `if (elementoDestino === null) { return }` antes de leer
cualquier rect. La navegación nativa del ancla (jsdom sí la implementa, ver
doc-comment de `esAncla`) sigue su curso sin interceptar.

### Regresión real encontrada y corregida (fuera de mi test file, dentro de mi ficha de producción)

Al correr la batería más amplia del repo (fuera de mi alcance de EDICIÓN,
pero necesaria para no dejar nada roto), `src/App.test.tsx` (`@s8`, contrato
ya `done`, "BrowserRouter mantiene las anclas de sección como navegación
dentro de la misma página") se puso en rojo: mi `preventDefault` en
escritorio, sin más, dejaba de actualizar `window.location.hash` cuando el
elemento de destino SÍ existe (a diferencia de mi test aislado en
`Cabecera.test.tsx`, donde no hay secciones reales en el DOM salvo las que
yo creo a mano). Mensaje real:

```
AssertionError: expected '' to be '#servicios' // Object.is equality
 ❯ src/App.test.tsx:76:34
```

Arreglo, **dentro de `Cabecera.tsx`** (no toqué `App.test.tsx`): tras
`window.scrollTo(...)`, `window.history.pushState(null, '', destino)` — el
mismo mecanismo que el panel móvil ya usa para subpáginas, que actualiza el
hash sin que el propio cambio de historial dispare ningún salto de scroll
(a diferencia de asignar `window.location.hash` directamente). Añadí también
mi propio test en `Cabecera.test.tsx` para esta rama y confirmé su rojo real
revirtiendo la línea `pushState` momentáneamente:

```
AssertionError: expected '' to be '#servicios' // Object.is equality
 ❯ src/components/Cabecera.test.tsx:395:34
```

y restauré el fix a continuación. Reconfirmé después con la suite completa
del repo (`pnpm exec vitest run`, 88 ficheros / 1223 tests, todos en verde) y
`pnpm run typecheck` / `pnpm run lint` (sin salida, ambos limpios) que no
quedó ninguna otra regresión.

## 4. Limpieza de lint (`Cabecera.test.tsx`)

De los 4 imports sin usar heredados de la sesión interrumpida:

- `afterEach` → **usado**: limpia del DOM los elementos de destino que creo a
  mano (`document.body.appendChild`, que `cleanup()` de `src/test/setup.ts`
  no toca).
- `vi` → **usado**: `vi.spyOn(...).mockReturnValue(...)` para los rects,
  `vi.spyOn(window, 'scrollY', 'get')`, `vi.stubGlobal('matchMedia', ...)`.
- `datosNegocio` → **eliminado**. Ningún test nuevo lo necesitaba (los
  existentes ya usan literales escritos a mano, patrón ya establecido en
  `@s12`).
- `posicionDeScrollParaAncla` → **eliminado** del import de test. Los
  valores esperados de `window.scrollTo` se escriben como literal calculado
  a mano (`604`), igual que hace `Cabecera-logica.test.ts` consigo misma —
  para no acoplar el test de integración de `Cabecera.tsx` a la propia
  fórmula de producción que ya se prueba en aislado.

`pnpm exec oxlint --deny-warnings src/components/Cabecera.test.tsx
src/components/Cabecera.tsx src/components/Cabecera-logica.ts
src/components/Cabecera-logica.test.ts` → **sin avisos**.

## 5. Cobertura de `Cabecera-logica.ts`

Revisé `Cabecera-logica.test.ts`: `esDestinoTienda` ya tenía caso
verdadero (con la constante `DESTINO_TIENDA` y con el literal `'/tienda'`) y
caso falso (tres destinos distintos, incluida un ancla). `posicionDeScrollParaAncla`
ya tenía dos casos con literales distintos (`96` y `150` de altura fija) que
descartan mutantes de intercambio de operandos y de signo. No encontré hueco
real que añadir; no toqué el fichero.

## 6. Cláusula @s28 → test (trazabilidad)

| Cláusula del `Then`/`And` de `@s28` | Test(s) | Estado |
|---|---|---|
| "muestra los enlaces de navegación del catálogo" | `@s4`/`@s5` (ya existentes, sin tocar) | ya cubierto |
| "muestra un control de urgencias con el color de urgencia de la variante activa" | fuera de `Cabecera*`: `BarraUrgencias.test.tsx` `@s27`; `@s13` de `Cabecera.test.tsx` sigue vigilando que NO esté dentro de `<header>` | ya cubierto (ver §1) |
| "muestra un acceso a la tienda con borde y sin relleno" | `Cabecera.test.tsx`: describe `@s28 el acceso a la Tienda lleva un estilo...` (2 tests, atributo) + describe `@s28 el estilo de borde sin relleno... vive de verdad en la hoja de estilos...` (3 tests, corpus no vacío + escritorio + panel móvil) | **nuevo, verde** |
| "la cabecera se mantiene visible al desplazar la página" | `Cabecera.module.scss:12` (`position: fixed`), ya presente antes de esta sesión; sin test dedicado en `Cabecera.test.tsx` (jsdom no hace layout/scroll real) | fuera del alcance asignado a esta sesión — ver nota abajo |
| "el sitio del ancla de destino... se calcula desde la altura real..., no desde un número escrito a mano" | `Cabecera.test.tsx`: describe `@s28 el salto a una sección desde la navegación de escritorio...` (4 tests: cálculo correcto, actualización del hash, rama "auto", elemento inexistente) + `Cabecera-logica.test.ts` (`posicionDeScrollParaAncla`, ya cubierta) | **nuevo, verde** |

Nota sobre "la cabecera se mantiene visible al desplazar la página": la regla
CSS (`position: fixed`) ya estaba en `Cabecera.module.scss` antes de esta
sesión (no es un cambio mío) y no forma parte de los puntos 1-5 que se me
asignaron explícitamente. Verificar que un elemento *de verdad* permanece
visible tras un scroll real excede lo que jsdom puede medir (no hace layout);
el patrón que sigue el resto del proyecto para afirmaciones de este tipo es
navegador real fuera del gate de Vitest (ver `accesibilidad.feature` `@s17`,
mismo mecanismo de "cabecera fija"). No añadí nada para esta cláusula por
estar fuera de mi encargo explícito; si el `judge` la considera descubierta,
recomiendo cerrarla con Playwright (`tests/e2e/`), fuera de mi alcance de
ficheros.

## 7. Verificación final

```
pnpm exec vitest run src/components/Cabecera.test.tsx src/components/Cabecera-logica.test.ts
  → 2 test files passed, 42 tests passed

pnpm exec oxlint --deny-warnings src/components/Cabecera.test.tsx src/components/Cabecera.tsx \
  src/components/Cabecera-logica.ts src/components/Cabecera-logica.test.ts
  → sin salida, 0 avisos

pnpm exec vitest run   (suite completa del repo)
  → 88 test files passed, 1223 tests passed

pnpm run typecheck (tsc -b) → sin salida
pnpm run lint (oxlint --deny-warnings, todo el repo) → sin salida
```

Ningún fichero fuera de `src/components/Cabecera*` fue editado. `App.tsx` se
leyó (para confirmar el orden de montaje `BarraUrgencias`/`Cabecera`) pero no
se tocó. No se ejecutó ningún comando `git` de escritura.
