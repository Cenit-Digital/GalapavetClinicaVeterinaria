# Enmiendas de `fidelidad_galeria` (33) — 03/09/2026

Contratos vigentes que esta feature roza. Ninguna cláusula de un `.feature`
`done` cambia de texto: se respetan todas. Lo que se enmienda son **tests** que
daban por hecho un detalle de implementación no exigido por su contrato, la
**constante** de separación que el propio contrato preveía re-medir, y la
**matriz de contraste**, que gana un par que antes nadie pintaba.

## 1. `galeria.feature` @s4 — `src/components/Galeria.test.tsx`

Contrato (sin cambios): «When el visitante mueve el foco por teclado hasta la
pista de fotografías · Then la pista de fotografías recibe el foco».

El test asumía que la pista era la **segunda** parada del tabulador (un botón
delante y otro detrás). Con los dos controles juntos en la cabecera, delante
de la pista (prototipo y `fidelidad_galeria` @s1), la segunda parada es «Foto
siguiente».

Antes:

```ts
await usuario.tab()
expect(screen.getByRole('button', { name: 'Foto anterior' })).toHaveFocus()

await usuario.tab()

const pista = document.activeElement
expect(pista).not.toBeNull()
expect(pista?.tagName).not.toBe('BUTTON')
expect(pista).not.toBe(screen.getByRole('button', { name: 'Foto siguiente' }))
expect(pista?.getAttribute('aria-label')?.length).toBeGreaterThan(0)
```

Después:

```ts
await usuario.tab()
expect(screen.getByRole('button', { name: 'Foto anterior' })).toHaveFocus()
await usuario.tab()
expect(screen.getByRole('button', { name: 'Foto siguiente' })).toHaveFocus()

await usuario.tab()

const pista = document.activeElement
expect(pista).not.toBeNull()
expect(pista?.tagName).not.toBe('BUTTON')
expect(pista).toBe(screen.getByRole('group', { name: /Fotografías/ }))
expect(pista?.getAttribute('aria-label')?.length).toBeGreaterThan(0)
```

El orden de foco (anterior → siguiente → pista) coincide con el orden visual,
así que `accesibilidad.feature` @s23 sigue cumpliéndose
(`src/accesibilidad-teclado.test.tsx` deriva sus expectativas del DOM).

## 2. `galeria.feature` @s17 — `src/components/Galeria.test.tsx`

Contrato (sin cambios): «And las otras dos entradas se muestran con su nombre
y su pie». No fija el formato «nombre · pie» en una sola cadena.

Antes:

```ts
expect(screen.getByText('Nala y Coco · Primera vacunación')).toBeInTheDocument()
expect(screen.getByText('Bruno · Alta tras cirugía de rodilla')).toBeInTheDocument()
```

Después:

```ts
const entradasVisibles: readonly (readonly [nombre: string, pie: string])[] = [
  ['Nala y Coco', 'Primera vacunación'],
  ['Bruno', 'Alta tras cirugía de rodilla'],
]
for (const [nombre, pie] of entradasVisibles) {
  const figura = screen.getByRole('img', { name: nombre }).closest('figure')
  if (figura === null) {
    throw new Error(`No hay figura para "${nombre}"`)
  }
  expect(within(figura).getByText(nombre)).toBeInTheDocument()
  expect(within(figura).getByText(pie)).toBeInTheDocument()
}
```

## 3. `galeria.feature` cabecera, PENDIENTE 3 — `SEPARACION_ENTRE_TARJETAS_PX`

Contrato (sin cambios): «la separación exacta entre tarjetas (18 px en el
prototipo) se re-mide en la feature tokens_marca. Este contrato solo exige que
el paso de desplazamiento sea "ancho de tarjeta + separación efectiva", nunca
un literal». La separación efectiva de la pista es `gap: espaciado(16)` (18 no
existe en la escala de 8), así que la constante se iguala al `gap`.

Antes (`Galeria-logica.ts` / `Galeria-logica.test.ts`):

```ts
export const SEPARACION_ENTRE_TARJETAS_PX = 18
// ...
expect(SEPARACION_ENTRE_TARJETAS_PX).toBe(18)
```

Después:

```ts
export const SEPARACION_ENTRE_TARJETAS_PX = 16
// ...
expect(SEPARACION_ENTRE_TARJETAS_PX).toBe(16)
```

Además, `Galeria.test.tsx` (@s3 de `fidelidad_galeria`) ancla el `gap` real
del bloque `.pista` a `espaciado(16)` y la constante a `16`, para que los dos
lados no vuelvan a divergir; `tests/e2e/fidelidad-galeria.spec.ts` @s3 mide en
navegador que un clic desplaza exactamente `ancho de tarjeta + columnGap`.

## 4. `identidad_visual.feature` @s8/@s11 — `MATRIZ_DE_USO_DEL_SISTEMA`

Los controles circulares llevan `border: $ancho-borde-control solid
var(--color-borde-control)` sobre `background-color: var(--color-superficie)`:
un par (rol, fondo) que ningún módulo pintaba. Se añade a la matriz para que
la puerta de contraste lo mida en las cinco variantes (SC 1.4.11). El
prototipo bordea estos botones con su `--border` decorativo (≈ 1,3:1); la web
mantiene `--color-borde-control`, como exige @s8.

Antes (`matrizDeContraste.ts`, 21 filas; `matrizDeContraste.test.ts`
`toHaveLength(21)`, `parejasComprobadas` 105):

```ts
{ rol: 'borde-control', fondo: 'fondo-alterno', uso: 'componente de interfaz o borde de foco' }, // `Galeria.module.scss:27-28` en sección alterna
```

Después (22 filas; `toHaveLength(22)`, `parejasComprobadas` 110):

```ts
{ rol: 'borde-control', fondo: 'fondo-alterno', uso: 'componente de interfaz o borde de foco' }, // `ReservaChat.module.scss:28` (`boton-fantasma`) dentro de `Landing.tsx` `.seccionAlterna`
{ rol: 'borde-control', fondo: 'superficie', uso: 'componente de interfaz o borde de foco' }, // `Galeria.module.scss` (`.controles button`: borde de control sobre su propio relleno de superficie)
```

La cita de la fila `fondo-alterno` estaba obsoleta: la galería ya no es banda
alterna (feature 26) ni usa `boton-fantasma`; el par lo sigue pintando el
botón «Llamar a la clínica» de Reserva.

## 5. `identidad_visual.feature` @s45 / `rediseno_visual.feature` @s17 — `data-contenedor-principal`

Contratos sin cambios («un único ancho máximo de contenedor»). El atributo
pasa de la `<section>` (que ahora va a sangre) al `div` de cabecera, que es
el que mide 1220 px en escritorio. Los E2E (`geometria-escalas.spec.ts` @s17,
`layout.spec.ts` @s45) miden el primero del DOM (el Hero) y no cambian.

## No enmendado

- `galeria.feature` @s12 (aviso literal) y @s13 (sin «pacientes reales» ni
  «con permiso de sus familias»): se respetan tal cual; el titular es
  «Galería» a secas, nunca el sufijo del prototipo.
- `rediseno_visual.feature` @s35 (`.pista {` con `overflow-x`,
  `scroll-snap-type` y `scroll-snap-align`, sin `flex-direction: column`
  literal): se respeta; la tarjeta usa `@include tarjeta;` anidada en `.pista`.
