# Fix @s39 — cintillo del listado de campañas (PaginaCampanas.tsx)

## Contexto
Feature `rediseno_visual` (id 24, in_progress). Test rojo:
`src/pages/PaginaCampanas.test.tsx` → describe
`rediseno_visual @s39 el encabezado de página lleva su cintillo delante del titular`,
it `un párrafo "Campañas" (no un encabezado) es el elemento inmediatamente
anterior al "h1 Campañas de prevención"` (líneas ~836-849).

`PaginaCampanas.module.scss` ya declaraba `.cintillo { @include eyebrow; }`
pero `VistaListado` en `PaginaCampanas.tsx` nunca renderizaba ese párrafo.

## Diagnóstico (RED confirmado)
Ejecuté primero:
```
pnpm exec vitest run src/pages/PaginaCampanas.test.tsx -t "el encabezado de página lleva su cintillo delante del titular"
```
Falló con `TestingLibraryElementError: Unable to find an element with the
text: Campañas` (selector `p`) — no existía ningún `<p>` con ese texto antes
del `<h1>`.

## Cambio mínimo (VERDE)
Único fichero tocado: `src/pages/PaginaCampanas.tsx`.

En `VistaListado` (función que renderiza el listado), se añadió el párrafo
cintillo entre `<RutaListado />` y `<h1>{TITULO_LISTADO}</h1>`:

```tsx
<RutaListado />
<p className={styles.cintillo}>Campañas</p>
<h1>{TITULO_LISTADO}</h1>
```

`styles` ya estaba importado en el fichero (`import styles from
'./PaginaCampanas.module.scss'`), así que no hizo falta tocar el import.
No se tocó `PaginaCampanas.module.scss` (ya tenía `.cintillo` correcto) ni
`PaginaCampanas-logica.ts`.

`RutaListado` sigue precediendo al párrafo cintillo, por lo que el
`previousElementSibling` del `<h1>` es exactamente el `<p>` (no `<nav>`),
que es lo que el test exige.

## Verificación
```
pnpm exec vitest run src/pages/PaginaCampanas.test.tsx
```
Resultado: **49 passed (49)** — el fichero completo en verde, sin
regresiones en los escenarios previos (@s16-@s38 y el resto de @s39) que
tocan la estructura de `VistaListado` (breadcrumb, aviso de demostración,
catálogo vacío, tarjetas, etc.).

También corrí:
```
pnpm exec oxlint --deny-warnings src/pages/PaginaCampanas.tsx
```
Sin salida — lint limpio.

## Alcance
Solo se modificó `src/pages/PaginaCampanas.tsx` (una línea añadida). No se
tocó `PaginaCampanas.module.scss` ni `PaginaCampanas-logica.ts`, tal como se
pidió. No se ejecutó ningún comando git de escritura.
