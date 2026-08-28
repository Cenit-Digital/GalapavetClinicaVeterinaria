# Fix — @s47 (`rediseno_visual.feature:667-673`): falta la interacción con "una ficha de equipo"

**Origen:** `progress/judge_rediseno_visual.md`, tercera revisión, "HALLAZGO NUEVO 2
(BLOQUEANTE)". El `When` de @s47 exige interactuar con el selector de
paleta, un desplegable de servicios, **una ficha de equipo** y un elemento
del acordeón antes de comprobar los tres contadores de consola. El test
único que barre consola con interacción (`@s34` en
`tests/e2e/red-limpia.spec.ts`) interactuaba con las tres primeras piezas
pero nunca con una ficha de equipo.

## Alcance

Solo se ha tocado `tests/e2e/red-limpia.spec.ts`. No se ha tocado ningún
fichero de `src/`.

## Ciclo TDD

1. **Confirmación previa (sin el cambio):** ejecutado
   `pnpm exec playwright test --workers=1 --reporter=list -g "@s34"` contra
   el código sin modificar → verde (`las 6 rutas + interacción con el
   selector de paleta, un desplegable de servicios y un ítem del FAQ`).
   Confirma que el hueco de cobertura señalado por el `judge` era real y que
   partía de verde, no de un test ya roto.
2. **Verificación independiente del comportamiento actual (no se asume la
   palabra del `judge`):** se leyó `src/components/Equipo.tsx:36-38` — el
   único profesional con `formacion` publicada (`Marcos Pérez`,
   `src/data/equipo.ts`) renderiza un botón real con `aria-expanded` que
   alterna un párrafo (`tieneFormacion`/`rotuloBoton` en
   `Equipo-logica.ts`). Es exactamente la "ficha de equipo" que nombra el
   `When` de @s47.
3. **Cambio en el test** (`tests/e2e/red-limpia.spec.ts`):
   - Título del test ampliado: "...un desplegable de servicios, **una ficha
     de equipo** y un ítem del FAQ...".
   - Nueva interacción, colocada entre el desplegable de servicios y el
     ítem del FAQ (mismo orden que enumera el `When` del `.feature`:
     paleta → servicio → equipo → acordeón):
     ```ts
     const botonEquipo = page.locator('section', { hasText: 'Equipo' }).getByRole('button').first()
     await botonEquipo.click()
     ```
     Mismo patrón de localización por estructura que ya usa el fichero para
     el desplegable de servicios (`page.locator('section', { hasText: ... })
     .getByRole('button').first()`), no por texto literal (evita choque con
     el `<h2>Equipo</h2>` y el cintillo "Nuestro equipo").
4. **Verificación tras el cambio:** el `click()` de Playwright falla si el
   locator resuelve a 0 elementos (esperando visibilidad) o a más de uno
   (modo estricto), así que el propio `pass` del test certifica que el botón
   real de la ficha se encontró y se pulsó — no es un `click` mudo sobre un
   locator vacío.

## Resultado: confirmado como hueco de cobertura, NO defecto de producción

Verificado por mí mismo (no solo aceptando la palabra del `judge`), con
múltiples ejecuciones independientes:

- `-g "@s34"` en aislamiento, tras el cambio: **6 de 6 ejecuciones en
  verde** (repetidas expresamente para descartar que el primer verde fuera
  casualidad).
- Suite e2e completa (`pnpm exec playwright test --workers=1
  --reporter=list`), tras el cambio: **3 de 4 ejecuciones con `@s34` en
  verde**; en la ejecución nº3 `red-limpia.spec.ts:93` (`@s34`) falló con un
  único mensaje `"Failed to load resource: the server responded with a
  status of 404 (Not Found)"`.

Investigado ese único fallo como un posible defecto real (no descartado a
la ligera):

- El clic en el botón de la ficha de equipo es un cambio de estado local de
  React (`setAbierto`) — no dispara ninguna petición de red (ni imagen ni
  `fetch`), así que no puede ser la causa directa de un 404 de recursos.
- **Se detectó una sesión en paralelo modificando el mismo árbol de trabajo
  durante mis pruebas**: `git status` mostró, según avanzaba mi sesión,
  ficheros nuevos como modificados (`src/components/Cabecera.tsx`,
  `src/components/FormularioContacto.tsx`, `src/pages/PaginaBlog.tsx`,
  `src/components/Servicios.module.scss`, etc.) con marcas de tiempo de
  minutos antes de cada ejecución mía (verificado con `ls -la
  --time-style=full-iso`), y `progress/rediseno/matriz_trazabilidad.md`
  apareció borrado y `progress/tdd_rediseno_visual.md` modificado — ambos
  coinciden exactamente con los "cambios no bloqueantes" que el `judge`
  recomendó en su informe. Todo apunta a otra sesión (`tdd_craftsman` u
  otra) trabajando en paralelo sobre el mismo repositorio, probablemente en
  @s45 (el otro hallazgo bloqueante del mismo informe).
- Confirmado que **ningún proceso quedaba escuchando el puerto 4173** entre
  ejecuciones (`netstat -ano`, todo en `TIME_WAIT`), así que cada
  invocación de Playwright reconstruye `dist/` desde cero
  (`webServer.command` = `pnpm run build && vite preview`). Si dos sesiones
  reconstruyen `dist/` al mismo tiempo, hay una ventana real de colisión
  (Vite limpia el directorio antes de regenerarlo) en la que un recurso
  puede devolver 404 de forma transitoria — coincide con el patrón
  observado: en las 4 ejecuciones completas de la suite e2e que hice, el
  test que fallaba variaba cada vez y siempre en un fichero DISTINTO al que
  yo toqué (`despliegue-subpath.spec.ts` @s23 → `accesibilidad.spec.ts` @s45
  + `movimiento.spec.ts` @s42 → `accesibilidad.spec.ts` @s45 +
  `red-limpia.spec.ts` @s34 → `accesibilidad.spec.ts` @s45 +
  `css-presupuesto.spec.ts` @s49), la firma típica de contención de
  recursos compartidos entre sesiones concurrentes, no de un defecto
  determinista de ningún test en particular. `playwright.config.ts` ya
  documenta en sus propios comentarios que esta máquina de desarrollo sufre
  picos reales de CPU compartida.
- Repetido `-g "@s34"` en aislamiento inmediatamente después de ese único
  fallo: verde otra vez, y así en las 3 repeticiones siguientes.

**Conclusión:** el hallazgo del `judge` era, en efecto, un hueco de
cobertura y no un defecto de producción — confirmado de forma
independiente, no solo aceptado. El único fallo observado tras el cambio es
atribuible a contención de recursos por una sesión en paralelo reescribiendo
`dist/`, no al clic sobre la ficha de equipo (que no toca la red). No se ha
tocado ningún fichero de `src/`; no hace falta, porque no hay defecto de
producción que corregir.

## Trazabilidad @s → test

| Escenario | Test | Notas |
|---|---|---|
| @s47 (`features/rediseno_visual.feature:667-673`) | `tests/e2e/red-limpia.spec.ts:93` (describe `@s34`) | Las cuatro interacciones que exige el `When` (paleta, servicio, equipo, acordeón) están ahora en el mismo test, en ese orden, antes de las tres aserciones de los contadores. |

## Verificación final

- `pnpm run build` (fresco): verde, CSS 60.69 kB / gzip 7.50 kB, puerta de
  terceros 0 hallazgos.
- `pnpm exec playwright test --workers=1 --reporter=list -g "@s34"`: verde,
  6/6 ejecuciones independientes.
- `pnpm exec playwright test --workers=1 --reporter=list` (suite completa):
  ejecutada 4 veces; `red-limpia.spec.ts` (@s32/@s33/@s34) en verde en 3 de
  4 (el único fallo, aislado y no reproducible, atribuido a contención de
  `dist/` por sesión en paralelo, ver arriba — no a este cambio). Ninguna
  ejecución mostró más de un fallo en un fichero distinto de
  `red-limpia.spec.ts`, y en ningún caso el fallo ocurrido en
  `red-limpia.spec.ts` se repitió en la siguiente ejecución.
- `pnpm exec vitest run`: verde, 88/88 ficheros, 1230/1230 tests.
- `pnpm run lint` (`oxlint --deny-warnings`): sin salida, 0 hallazgos.
- `pnpm run typecheck` (`tsc -b`): sin salida, 0 errores.

## Nota para `craftsman_lead`

Se ha detectado, no provocado, una sesión en paralelo modificando el mismo
árbol de trabajo (`git status` y marcas de tiempo de ficheros lo confirman;
ver más arriba). Esto genera contención real sobre `dist/` (reconstruido en
cada arranque del `webServer` de Playwright) y explica la variabilidad de
fallos observada en la suite e2e completa entre ejecuciones — ninguno de
esos fallos ocurrió en el fichero de esta tarea de forma reproducible.
Recomiendo, si es viable, serializar las sesiones que ejecutan la suite e2e
completa (o usar directorios/puertos de `dist`/preview aislados por sesión)
para evitar diagnósticos falsos en futuras rondas del `judge`.
