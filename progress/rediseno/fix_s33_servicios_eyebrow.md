# TDD — Hallazgo 1 de la segunda revisión del `judge` (@s33 incumplido en Servicios)

Sesión encargada por `craftsman_lead` tras `progress/judge_rediseno_visual.md`
(segunda revisión, CHANGES_REQUESTED). Una oleada anterior ya había arreglado
el cintillo (`eyebrow`) de `Equipo`, `Faq` y `CampanasPortada`, pero dejó
`Servicios` sin tocar — ni producción ni test. Esta sesión cierra la cuarta
sección pendiente, siguiendo al pie de la letra el patrón ya verde de
`CampanasPortada.tsx`/`.module.scss`/`.test.tsx` y `Equipo.tsx`/`.module.scss`/`.test.tsx`.

## El defecto, tal y como lo dejó el judge

- `src/components/Servicios.tsx:56` abría directamente con `<h2>Servicios</h2>`,
  sin ningún `<p className={styles.eyebrow}>` delante.
- `src/components/Servicios.module.scss` no tenía ninguna regla `.eyebrow`.
- `src/components/Servicios.test.tsx` no mencionaba "eyebrow", "cintillo" ni
  "@s33" en ningún sitio: cero cobertura.
- `#servicios` es `styles.seccionAlterna` en `src/pages/Landing.tsx:54-56`
  (fondo de token, `--color-fondo-alterno`) — exactamente el tipo de sección
  al que `features/rediseno_visual.feature:529-540` (@s33) exige el cintillo,
  sin ambigüedad ni excepción (la única excepción del contrato es el Hero,
  por fondo de fotografía — no aplica aquí).

## Diferencia con el patrón de referencia: el mismo texto en cintillo y h2

A diferencia de `CampanasPortada` ("Prevención" / "Campañas de prevención") y
`Equipo` ("Nuestro equipo" / "Equipo"), la instrucción del `craftsman_lead`
fija el rótulo del cintillo de Servicios como el literal `"Servicios"` —
idéntico al texto del `<h2>`. Esto hace que el patrón de localización por
texto (`within(seccion).getByText(ETIQUETA_CINTILLO)`, usado en
`CampanasPortada.test.tsx`/`Equipo.test.tsx`) sea ambiguo aquí: matchearía
tanto el `<p>` como el `<h2>`, y `getByText` lanzaría por "multiple elements
found". El test de esta sesión localiza el cintillo por estructura (primer
hijo de la sección, comprobado por `tagName === 'P'`) en vez de por texto.

## Ciclo Rojo → Verde → Refactor

### ROJO

Añadí en `src/components/Servicios.test.tsx` (tras el describe `@s19`
existente) el bloque `describe('@s33 la sección de servicios abre con su
cintillo en versalitas', …)` con dos `it`:

1. "hay un único `<p>` de cintillo... antes del único `<h2>` Servicios" —
   localiza `seccion.firstElementChild`, exige `tagName === 'P'`,
   `textContent === 'Servicios'`, que no sea el mismo nodo que el `<h2>`, y
   que preceda al `<h2>` en el documento (`compareDocumentPosition`).
2. `".eyebrow" usa el mixin compartido, sin reescribir su color, versalitas
   ni espaciado entre letras` — lee `Servicios.module.scss` en crudo
   (`import.meta.glob(..., { query: '?raw' })`, mismo patrón que
   `CampanasPortada.test.tsx`/`Equipo.test.tsx`) y exige `@include eyebrow;`
   sin `color:`/`text-transform:`/`letter-spacing:` propios.

Ejecuté `pnpm exec vitest run src/components/Servicios.test.tsx` con la
producción sin tocar:

```
❯ src/components/Servicios.test.tsx (22 tests | 2 failed)
  × hay un único <p> de cintillo "Servicios" como primer hijo de la sección…
    AssertionError: expected 'H2' to be 'P'
    Expected: "P"
    Received: "H2"

  × ".eyebrow" usa el mixin compartido, sin reescribir su color…
    AssertionError: expected '' to contain '@include eyebrow;'
    - @include eyebrow;
```

Los dos fallan por la razón correcta: el primer hijo real de la sección es
el `<h2>` (no hay `<p>` de cintillo), y el bloque `.eyebrow` no existe en el
SCSS (regex devuelve cadena vacía).

### VERDE

1. `src/components/Servicios.tsx`: añadida la línea
   `<p className={styles.eyebrow}>Servicios</p>` inmediatamente antes de
   `<h2>Servicios</h2>` (dentro de `<section className={styles.servicios}
   data-contenedor-principal>`).
2. `src/components/Servicios.module.scss`: añadida la regla `.eyebrow {
   @include eyebrow; grid-column: 1 / -1; }` dentro de `.servicios` (el
   `grid-column: 1 / -1` es necesario porque `.servicios` es
   `display: grid` con `h2` ya declarado `grid-column: 1 / -1` — mismo
   mecanismo que `Equipo.module.scss`, cuyo `.equipo` es también una
   rejilla; sin él el cintillo quedaría encajado en la primera columna de la
   rejilla de tarjetas en vez de ocupar todo el ancho). Ningún override de
   color, versalitas ni espaciado — igual que en `CampanasPortada`, `Equipo`
   y `Faq`.

Reejecuté:

```
pnpm exec vitest run src/components/Servicios.test.tsx
Test Files  1 passed (1)
     Tests  22 passed (22)
```

### REFACTOR

Con la barra verde, revisé que el nuevo bloque de estilos siguiera
exactamente el mismo formato de comentario que `Equipo.module.scss` (mismo
razonamiento: fondo de token, sin excepción de la Enmienda 2 del Hero) —sin
más cambios, no había duplicación que limpiar.

## Mapa cláusula @s33 → test (para Servicios)

| Cláusula de @s33 | Test |
|---|---|
| "cada [sección con titular propio] lleva por delante un rótulo corto en mayúsculas con espaciado entre letras" | `Servicios.test.tsx` @s33, primer `it`: `<p>` precede al `<h2>`, `tagName === 'P'` |
| "en toda sección cuyo fondo es un rol de color del sistema ese rótulo usa el color de acento tinta" | `Servicios.test.tsx` @s33, segundo `it`: `.eyebrow` usa `@include eyebrow` sin override de `color:` (el mixin fija `--color-acento-tinta` por defecto) |
| "el rótulo no es un encabezado, para no romper la jerarquía de niveles" | primer `it`: `tagName === 'P'` (nunca `H1`-`H6`) + `getAllByRole('heading', {level:2, name:'Servicios'})` tiene longitud 1 (el `<p>` no se cuela como heading pese al mismo texto) |

`#servicios` no es la sección de bienvenida (Hero) ni pinta su fondo con la
fotografía a sangre de @s29: no aplica la excepción de `--color-sobre-primario`.

## Verificación

- `pnpm exec vitest run src/components/Servicios.test.tsx`: 22/22 verdes
  (20 preexistentes + 2 nuevos de @s33).
- `pnpm exec vitest run` (suite completa, tras este cambio y el del Hallazgo
  3 combinados): 1229 tests verdes en los ficheros de mi alcance — ver el
  detalle completo y la nota sobre el único fallo preexistente y ajeno en
  `progress/rediseno/tdd_geometria-escalas.md`.
- `pnpm run lint` / `pnpm run typecheck`: limpios.
- `pnpm run build`: verde, CSS 60.69 kB / gzip 7.50 kB.

## Ficheros tocados en esta sesión (Hallazgo 1)

- `src/components/Servicios.tsx` — `<p className={styles.eyebrow}>Servicios</p>`
  añadido delante del `<h2>`.
- `src/components/Servicios.module.scss` — regla `.eyebrow` añadida (este
  fichero también perdió su `padding-block: espaciado(64)` muerto en el
  mismo lote, por el Hallazgo 3 — ver `tdd_geometria-escalas.md`).
- `src/components/Servicios.test.tsx` — dos tests nuevos, describe `@s33`.

## Estado

Hallazgo 1: **resuelto**. Las cuatro secciones que el `judge` había marcado
con cintillo pendiente (Equipo, Faq, CampanasPortada de la oleada anterior; 
Servicios en esta) están ahora completas, cada una con su propio test que
exige la cláusula con ciclo Rojo→Verde real.
