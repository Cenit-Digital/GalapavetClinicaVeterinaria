# Fix — `@s7` de `equipo.feature`: texto ACCESIBLE, no `textContent`

Ámbito cerrado: **un solo fichero tocado**, `src/components/Equipo.test.tsx`.
Cero cambios en producción (`src/components/Equipo.tsx` intacto, verificado con
`git status --porcelain`).

## 1. El diagnóstico que se confirma

El contrato heredado dice, literalmente (`features/equipo.feature:118`):

```
And el texto accesible de la tarjeta de "Joaquín Herranz" se limita a "Joaquín Herranz" y "Auxiliar"
```

**Texto accesible**, no `textContent`. La aserción escrita en su día comparaba
`tarjetaJoaquin?.textContent`, que es otra cosa: `textContent` incluye todo el
DOM, también los subárboles `aria-hidden="true"`, que por definición NO forman
parte de lo que anuncia un lector de pantalla.

Mientras la tarjeta no tuvo contenido decorativo, ambas magnitudes coincidían y
el desvío pasó desapercibido. El rediseño ha añadido el avatar de iniciales que
su propio contrato EXIGE (`features/rediseno_visual.feature`, `@s32`:
"cada tarjeta muestra un avatar con las iniciales del nombre real"), marcado
correctamente como decorativo:

```tsx
<span aria-hidden="true" className={styles.avatar}>
  {inicialesDe(profesional.nombre)}
</span>
```

Resultado: `textContent` pasó a ser `'JHJoaquín HerranzAuxiliar'` y el test cayó.
**El producto está bien; la aserción estaba mal escrita.** Ambos contratos son
compatibles entre sí: un avatar `aria-hidden` no añade ni una letra al texto
accesible. Lo que fallaba era el instrumento de medida.

## 2. Qué se ha cambiado

### 2.1 Ayudante `textoAccesibleDe` (nuevo, local al fichero de test)

```tsx
function textoAccesibleDe(elemento: HTMLElement): string {
  const copia = elemento.cloneNode(true) as HTMLElement
  for (const decorativo of copia.querySelectorAll('[aria-hidden="true"]')) {
    decorativo.remove()
  }
  return copia.textContent ?? ''
}
```

Clona la tarjeta (no muta el DOM bajo test), descuenta todo subárbol
`aria-hidden="true"` y devuelve lo que queda. Lleva encima un comentario que
explica el porqué y cita `features/equipo.feature:118` y el `aria-hidden` del
avatar, para que nadie vuelva a "arreglarlo" cambiándolo por `textContent`.

Vive en el propio fichero de test, como se pidió: no es utilidad de producción
ni se exporta.

### 2.2 Ayudante `obtenerTarjetaDe` (nuevo, local al fichero de test)

Simétrico al `obtenerSeccionEquipo` que ya existía: localiza el `<article>` de
un profesional desde su `h3` y **lanza** si no lo encuentra. Sustituye al par
`closest('article')` + `expect(...).not.toBeNull()` + acceso opcional `?.`, que
era lo que permitía que la aserción se evaluara sobre `undefined` sin ruido.

### 2.3 La aserción de `@s7`

Antes:

```tsx
const tarjetaJoaquin = screen.getByRole('heading', { level: 3, name: 'Joaquín Herranz' }).closest('article')
expect(tarjetaJoaquin).not.toBeNull()
expect(tarjetaJoaquin?.textContent).toBe('Joaquín HerranzAuxiliar')
```

Ahora:

```tsx
// Igualdad exacta, no `toContain`: si mañana la tarjeta colase un número de
// colegiado, un idioma o cualquier relleno anunciable, esta línea cae (@s2).
expect(textoAccesibleDe(obtenerTarjetaDe('Joaquín Herranz'))).toBe('Joaquín HerranzAuxiliar')
```

Sigue siendo `toBe` con la cadena exacta `'Joaquín HerranzAuxiliar'`: **no se ha
relajado a `toContain`**. Cualquier texto anunciable que se cuele en la tarjeta
—número de colegiado, idiomas, un claim de relleno— la rompe, que es justo lo
que `@s2` de este mismo contrato prohíbe. Lo único que deja de contar es lo que
el contrato nunca contó: lo oculto a la accesibilidad.

### 2.4 Aserción nueva que muerde el vínculo con `@s32` del rediseño

En el mismo `describe` de `@s7`:

```tsx
it('la tarjeta de Joaquín trae el avatar de iniciales con texto propio y oculto a la accesibilidad', () => {
  renderizarEquipo()

  const avatar = obtenerTarjetaDe('Joaquín Herranz').querySelector('[aria-hidden="true"]')

  expect(avatar).not.toBeNull()
  expect(avatar).toHaveAttribute('aria-hidden', 'true')
  expect(avatar?.textContent).toBe('JH')
})
```

Por qué importa: sin ella, la aserción de arriba podría quedarse verde por los
motivos equivocados. Las dos juntas cierran la pinza y hacen la prueba **no
vacua**:

| Rotura hipotética | Quién la caza |
| --- | --- |
| Se borra el avatar (se incumple `@s32` del rediseño) | el `it` nuevo: `avatar` es `null` |
| Al avatar se le quita el `aria-hidden` (deja de ser decorativo y ensucia el anuncio) | el `it` nuevo (atributo) **y** el de `@s7` (el texto accesible pasaría a ser `'JHJoaquín HerranzAuxiliar'`) |
| El avatar se queda sin iniciales | el `it` nuevo: `textContent` deja de ser `'JH'` |
| La tarjeta añade colegiado/idiomas/relleno anunciable | el `it` de `@s7`: `toBe` exacto |

Además, que el avatar tenga texto propio (`'JH'`) y que el texto accesible NO lo
incluya demuestra, entre las dos pruebas, que el descuento de `aria-hidden`
sucede de verdad y sobre contenido no vacío: el ayudante no es un `textContent`
disfrazado.

## 3. Trazabilidad de escenarios

| Escenario | Test que lo cubre |
| --- | --- |
| `equipo.feature` `@s7` | `@s7 … > 'la sección tiene exactamente 1 botón, el de Marcos Pérez, y la tarjeta de Joaquín se limita a su nombre y su rol'` |
| `equipo.feature` `@s7` (línea 118, texto accesible) + `rediseno_visual.feature` `@s32` (avatar decorativo) | `@s7 … > 'la tarjeta de Joaquín trae el avatar de iniciales con texto propio y oculto a la accesibilidad'` |

Ningún escenario se ha borrado ni debilitado. `@s7` pasa de 1 a 2 pruebas.

## 4. Comandos y salida literal

### ROJO de partida (antes del cambio)

```
$ pnpm exec vitest run src/components/Equipo.test.tsx

 ❯ src/components/Equipo.test.tsx (11 tests | 1 failed) 640ms
     × la sección tiene exactamente 1 botón, el de Marcos Pérez, y la tarjeta de Joaquín se limita a su nombre y su rol 26ms

 FAIL  src/components/Equipo.test.tsx > @s7 un profesional sin formación publicada no ofrece botón de desplegar > la sección tiene exactamente 1 botón, el de Marcos Pérez, y la tarjeta de Joaquín se limita a su nombre y su rol
AssertionError: expected 'JHJoaquín HerranzAuxiliar' to be 'Joaquín HerranzAuxiliar' // Object.is equality

Expected: "Joaquín HerranzAuxiliar"
Received: "JHJoaquín HerranzAuxiliar"

 ❯ src/components/Equipo.test.tsx:130:41

 Test Files  1 failed (1)
      Tests  1 failed | 10 passed (11)
```

### VERDE (después del cambio)

```
$ pnpm exec vitest run src/components/Equipo.test.tsx

 RUN  v4.1.10 C:/Users/vhurt/.../GalapavetClinicaVeterinaria

 Test Files  1 passed (1)
      Tests  12 passed (12)
   Start at  19:55:07
   Duration  6.55s (transform 1.28s, setup 943ms, import 1.51s, tests 582ms, environment 2.92s)
```

### Lint

```
$ pnpm run lint

> galapavet-web@0.0.0 lint C:\Users\vhurt\...\GalapavetClinicaVeterinaria
> oxlint --deny-warnings

LINT_EXIT=0
```

### Typecheck

```
$ pnpm run typecheck

> galapavet-web@0.0.0 typecheck C:\Users\vhurt\...\GalapavetClinicaVeterinaria
> tsc -b

TYPECHECK_EXIT=0
```

## 5. Aviso al lead: fallo AJENO y PREEXISTENTE en la suite completa

`pnpm run test` (suite completa) **sigue en rojo**, pero ya no por `Equipo`.
Fallan 5 escenarios de `src/accesibilidad-teclado.test.tsx` (`@s23`…`@s27`),
p. ej.:

```
AssertionError: expected [ <button …(3)></button>, …(4) ] to include <body><div>…(1)</div></body>
 ❯ src/accesibilidad-teclado.test.tsx:126:23
```

Queda **demostrado que no lo causa este cambio**:

1. Con la versión de `Equipo.test.tsx` **anterior** al fix (restaurada desde
   `git checkout --` y vuelta a poner después), la suite completa da
   `Tests 6 failed | 1001 passed (1007)`: los **mismos 5** de
   `accesibilidad-teclado` **más** el de `Equipo`. Es decir, ya fallaban antes.
2. Con el fix aplicado: `Tests 5 failed | 1003 passed (1008)` — desaparece el de
   `Equipo` y quedan exactamente los 5 preexistentes.
3. `src/accesibilidad-teclado.test.tsx` en solitario: `5 passed`. Junto con
   `Equipo.test.tsx`: `2 passed (2)` / `17 passed`. Solo cae dentro de la
   ejecución completa (comportamiento de carga/paralelismo, no de contenido).

Es otro frente del rediseño (orden de tabulación de la Landing completa) y cae
fuera del ámbito cerrado de esta tarea. Se reporta, no se toca.

## 6. Ficheros

- Modificado: `src/components/Equipo.test.tsx`
- Sin tocar: `src/components/Equipo.tsx`, `src/components/Equipo-logica.ts`,
  `src/data/equipo.ts`, `features/equipo.feature`, `features/rediseno_visual.feature`
