# TDD — lote `equipo` (rediseno_visual, id 24) — continuación tras interrupción

Ámbito cerrado respetado al 100 %: solo se tocaron
`src/components/Equipo.tsx`, `src/components/Equipo-logica.ts`,
`src/components/Equipo-logica.test.ts` y `src/components/Equipo.test.tsx`.
Ningún otro fichero fue editado ni leído con intención de tocarlo.

## 0. Estado real al arrancar (verificado, no supuesto)

`pnpm vitest run src/components/Equipo.test.tsx` daba **ROJO real**:

```
FAIL src/components/Equipo.test.tsx > @s7 … > la tarjeta de Joaquín trae el avatar de iniciales con texto propio y oculto a la accesibilidad
AssertionError: expected 'J' to be 'JH'
FAIL src/components/Equipo.test.tsx > @s32 … > cada tarjeta muestra un avatar con las iniciales del nombre real, sobre el acento suave de la variante
AssertionError: expected 'M' to be 'MP'

Tests  2 failed | 22 passed (24)
```

Causa raíz leída en `Equipo.tsx` (función `inicialesDe`, definida inline en el
`.tsx`, en contra de la convención del proyecto
"lógica-de-decisión-en-módulo-puro-no-en-el-jsx" que ya sigue
`Equipo-logica.ts` para `rotuloBoton`/`tieneFormacion`/`profesionalesValidos`):

```ts
function inicialesDe(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .map((parte) => parte[0])
    .join('')
    .slice(0, 1)   // <-- recorta TODO el resultado a 1 carácter, no por palabra
}
```

`.map(parte => parte[0])` ya calculaba la inicial de CADA palabra
("MP" para "Marcos Pérez", "JH" para "Joaquín Herranz") y las unía, pero el
`.slice(0, 1)` final descartaba todo menos el primer carácter del resultado
ya unido. Efecto: el avatar mostraba una sola letra en vez de dos.

El resto de @s32 (sin imágenes, avatar sobre `--color-acento-suave`, nombre +
rol reales, ficha ampliada solo con formación publicada, sin colegiado/
idiomas) y @s33 (cintillo eyebrow) ya estaban en verde: no se tocó nada de
eso, solo se confirmó que seguían pasando al final.

## 1. Ciclo Rojo → Verde → Refactor

### C1 — `inicialesDe` no vive donde debería y su algoritmo es incorrecto

**ROJO** (test unitario nuevo, `Equipo-logica.test.ts`, antes de tocar
producción):

```
FAIL src/components/Equipo-logica.test.ts > inicialesDe … > con nombre y un apellido, devuelve las dos iniciales, nunca solo la primera
TypeError: inicialesDe is not a function
 ❯ src/components/Equipo-logica.test.ts:26:12
(4 fallos idénticos: inicialesDe no existe en el módulo `./Equipo-logica`)

Test Files  1 failed (1)
     Tests  4 failed | 5 passed (9)
```

Se escribieron cuatro casos con doble intención (comportamiento correcto +
frontera):
1. `'Marcos Pérez'` → `'MP'` (caso real del catálogo).
2. `'Joaquín Herranz'` → `'JH'` (caso real del catálogo, el que además NO
   tiene botón de formación, así que es el único cuyo avatar se comprueba
   aislado en `Equipo.test.tsx` @s7).
3. `'Ana María López García'` → `'AM'` (frontera importante: con DOS
   apellidos, el requisito es nombre + PRIMER apellido, no los dos últimos
   nombres ni los dos apellidos).
4. `'Fideo'` → `'F'` (una sola palabra no debe reventar ni devolver cadena
   vacía).

**VERDE** — `inicialesDe` nueva en `Equipo-logica.ts`, con una constante
nombrada en vez de un número mágico:

```ts
const PALABRAS_QUE_APORTAN_INICIAL = 2

export function inicialesDe(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, PALABRAS_QUE_APORTAN_INICIAL)
    .map((palabra) => palabra[0])
    .join('')
}
```

La diferencia decisiva frente al código roto: el recorte a "las dos primeras
palabras" se hace ANTES de tomar iniciales y unir (recorta por PALABRA), no
DESPUÉS de unir el resultado completo (que recortaba por CARÁCTER del
string ya construido).

```
> pnpm vitest run src/components/Equipo-logica.test.ts
Test Files  1 passed (1)
     Tests  9 passed (9)
```

### C2 — cablear `Equipo.tsx` a la lógica movida

`Equipo.tsx` seguía definiendo su propia `inicialesDe` local (duplicada,
rota). Se sustituyó el import (`inicialesDe` añadida al import de
`./Equipo-logica`) y se borró la función local completa. Ningún test nuevo
hizo falta aquí: el mismo `Equipo.test.tsx` que ya existía (@s7, @s32) es el
que verifica el resultado a nivel de componente.

```
> pnpm vitest run src/components/Equipo.test.tsx src/components/Equipo-logica.test.ts
Test Files  2 passed (2)
     Tests  28 passed (28)
```

### REFACTOR

Ninguno adicional: la función quedó corta (5 líneas), sin duplicación, con
una única constante nombrada documentando el "por qué" de 2 (nombre + primer
apellido, @s32). `Equipo.tsx` quedó más corto (perdió una función que no le
correspondía) y sin lógica de decisión inline, coherente con
`rotuloBoton`/`tieneFormacion`/`profesionalesValidos`, ya extraídas antes.

## 2. Mapa escenario → test

| Escenario | Test | Nivel |
| --- | --- | --- |
| @s32 (avatar de iniciales con "las iniciales del nombre real") | `Equipo-logica.test.ts` → `describe('inicialesDe toma la primera letra de las dos primeras palabras del nombre real (apoyo de @s32)')`, 4 casos | unitario (lógica pura) |
| @s32 (mismo contrato, confrontado en el DOM real) | `Equipo.test.tsx:167-175` (`@s7`, avatar de "Joaquín Herranz" = `'JH'`) y `Equipo.test.tsx:259-274` (`@s32`, avatares de "Marcos Pérez" = `'MP'` y "Joaquín Herranz" = `'JH'`, con doble anclaje: literal a mano vs. avatar real) | integración (render + accesibilidad) |

Los demás `it` de @s32/@s33 en `Equipo.test.tsx` (imágenes, nombre/rol,
ficha ampliada condicionada a formación, ausencia de colegiado/idiomas,
cintillo eyebrow) no se tocaron: ya estaban verdes antes de empezar y siguen
verdes ahora, sin cambio de comportamiento.

## 3. Sabotaje real (visto en rojo y restaurado palabra por palabra)

**SABOTAJE A** — `PALABRAS_QUE_APORTAN_INICIAL` de `2` a `1` (reproduce el
defecto original: solo una letra por avatar):

```
FAIL Equipo-logica.test.ts > … > con nombre y un apellido, devuelve las dos iniciales, nunca solo la primera
AssertionError: expected 'M' to be 'MP'
FAIL Equipo-logica.test.ts > … > con nombre y apellido distintos, devuelve las iniciales de ambos
AssertionError: expected 'J' to be 'JH'
FAIL Equipo-logica.test.ts > … > con dos apellidos, se queda solo con el nombre y el PRIMER apellido, no con el segundo
AssertionError: expected 'A' to be 'AM'
FAIL Equipo.test.tsx > @s7 … > la tarjeta de Joaquín trae el avatar de iniciales con texto propio y oculto a la accesibilidad
AssertionError: expected 'J' to be 'JH'
FAIL Equipo.test.tsx > @s32 … > cada tarjeta muestra un avatar con las iniciales del nombre real, sobre el acento suave de la variante
AssertionError: expected 'M' to be 'MP'

Tests  5 failed | 23 passed (28)
```

Restaurado a `2`. Confirma que tanto el test unitario como el de integración
(exactamente el mismo fallo que reportaba el estado real al arrancar) mueren
ante la regresión original.

**SABOTAJE B** — `.slice(0, PALABRAS_QUE_APORTAN_INICIAL)` a
`.slice(-PALABRAS_QUE_APORTAN_INICIAL)` (toma las DOS ÚLTIMAS palabras en vez
de las dos primeras: con un nombre de 4 palabras, iniciales del segundo
apellido en vez del primero):

```
FAIL Equipo-logica.test.ts > … > con dos apellidos, se queda solo con el nombre y el PRIMER apellido, no con el segundo
AssertionError: expected 'LG' to be 'AM'

Tests  1 failed | 8 passed (9)
```

Restaurado a `.slice(0, PALABRAS_QUE_APORTAN_INICIAL)`. Confirma que el caso
de frontera (dos apellidos) está mordido de verdad y no es redundante con los
otros tres casos.

Tras cada sabotaje se restauró el texto exacto con `Edit` (nunca `git`); la
suite volvió a 9/9 (unitario) y 28/28 (unitario + integración) en ambos
casos.

## 4. Verificación final

```
> pnpm vitest run src/components/Equipo.test.tsx src/components/Equipo-logica.test.ts
Test Files  2 passed (2)
     Tests  28 passed (28)

> pnpm exec oxlint --deny-warnings src/components/Equipo.tsx src/components/Equipo-logica.ts src/components/Equipo-logica.test.ts src/components/Equipo.test.tsx
OXLINT_EXIT=0

> pnpm run lint
LINT_EXIT=0

> pnpm exec tsc -b
src/components/Cabecera-logica.ts(54,22): error TS2552: Cannot find name 'DESTINO_TIENDA'. Did you mean 'esDestinoTienda'?
```

`git status --porcelain` confirma que `src/components/Cabecera-logica.ts` no
está en mi lista de ficheros y no fue tocado por mí en ningún momento de esta
sesión (nunca se abrió con `Read`/`Edit`/`Write`): es trabajo a medio ciclo
de otro artesano de la misma oleada, en paralelo, sobre el mismo árbol.
Ninguno de mis cuatro ficheros aparece citado en la salida de `tsc -b`.
`pnpm run lint` (oxlint global) sí da `0`.

## 5. Estado

- **Escenario cerrado**: el defecto de iniciales dentro de @s32 (avatar
  "MP"/"JH" en vez de "M"/"J") queda reparado con TDD real y sabotaje
  confirmado en dos niveles (lógica pura + integración).
- El resto de @s32 y @s33 seguían verdes al empezar y siguen verdes ahora,
  sin cambio de comportamiento ni de test.
- Ámbito respetado: únicamente `Equipo.tsx`, `Equipo-logica.ts`,
  `Equipo-logica.test.ts` y `Equipo.test.tsx`.
- No se ejecutó `pnpm run build`, `playwright`, `vite preview` ni
  `stryker run`, según lo pactado.
- Único hallazgo fuera de mi ámbito, no bloqueante para mi lote: `tsc -b`
  falla hoy por `Cabecera-logica.ts:54` (`DESTINO_TIENDA` no definida),
  fichero de otro artesano a medio ciclo en esta misma oleada. Queda anotado
  para el `craftsman_lead`.
