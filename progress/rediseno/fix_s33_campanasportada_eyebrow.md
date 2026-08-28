# Fix @s33 — `.eyebrow` ausente en `CampanasPortada.module.scss`

## Contexto

`src/components/CampanasPortada.tsx` ya renderizaba correctamente
`<p className={styles.eyebrow}>Prevención</p>` delante del `<h2>`, y ese
comportamiento ya tenía test verde (@s33, primer `it`, "el cintillo existe,
precede al h2 y no es un encabezado").

Lo que faltaba era la regla real `.eyebrow { ... }` en
`CampanasPortada.module.scss`: el fichero solo tenía un comentario
(líneas 17-22) que explicaba la intención (usar el mixin compartido
`eyebrow` de `src/styles/_api.scss:324-332`, que fija
`color: var(--color-acento-tinta)`, `text-transform: uppercase` y
`letter-spacing: 0.12em`) pero nunca escribía la clase.

## Test que fallaba (antes del fix)

`src/components/CampanasPortada.test.tsx`, describe
`@s33 la sección abre con su cintillo en versalitas, delante del h2`, it
`".eyebrow" usa el mixin compartido, sin reescribir su color, versalitas ni
espaciado entre letras`:

- Extrae con `/\.eyebrow\s*\{([^}]*)\}/` el bloque `.eyebrow{...}` del texto
  real (`?raw`) del `.module.scss`.
- Exigía que el bloque existiera (`bloqueDelCintillo` no nulo) — fallaba
  porque no había ningún `.eyebrow {}` en el fichero, solo el comentario.

## Cambio aplicado

Único fichero tocado: `src/components/CampanasPortada.module.scss`.

Se añadió, dentro de `.campanasPortada { ... }`, justo después del bloque de
comentario que ya explicaba la intención (líneas 17-22) y antes de la regla
`h2 { ... }`:

```scss
.eyebrow {
  @include eyebrow;
}
```

Sin ningún `color:`, `text-transform:` ni `letter-spacing:` propio, tal como
exige el test: el mixin compartido ya fija esos tres valores con la tinta de
acento por defecto (`--color-acento-tinta`), el rol correcto para esta
sección porque su fondo es un token del sistema (`--color-fondo`), no una
fotografía (a diferencia del Hero, que sí sobrescribe el color por ir sobre
una foto — Enmienda 2).

No se tocó `CampanasPortada.tsx` (ya correcto) ni `_api.scss` (el mixin ya
existía y estaba bien; solo faltaba usarlo aquí).

## Verificación

```
pnpm exec vitest run src/components/CampanasPortada.test.tsx
```

Resultado: **22/22 tests pasan** (1 test file, verde de punta a punta),
incluidos los dos `it` de `@s33` y el resto de escenarios (@s1-@s21, @s19,
etc.) que ya pasaban antes y no se vieron afectados por el cambio.

## Trazabilidad

| Escenario | Test | Estado |
|---|---|---|
| @s33 (cláusula "cintillo existe, precede al h2") | `it('el cintillo existe, precede al h2 y no es un encabezado')` | Ya pasaba antes (TSX correcto) |
| @s33 (cláusula "`.eyebrow` usa el mixin compartido") | `it('".eyebrow" usa el mixin compartido, sin reescribir su color, versalitas ni espaciado entre letras')` | Rojo → Verde con este fix |

No se requirió ningún otro cambio: el único gap era la ausencia de la regla
CSS, tal como describía la tarea.
