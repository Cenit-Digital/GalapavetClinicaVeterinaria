# Fix: conteo de hrefDeDestino en PaginaBlog.tsx (regresión cruzada con @s19 de despliegue_github_pages)

## Contexto

`rediseno_visual` (id 24, @s40) añadió legítimamente una tercera llamada real
a `hrefDeDestino(...)` en `src/pages/PaginaBlog.tsx`: la tarjeta del listado
del blog ahora también pinta `articulo.imagen` con `src={hrefDeDestino(...)}`,
además de los dos puntos ya existentes ("Sigue leyendo" y la cabecera del
artículo abierto). Este cambio de producción ya está verificado en verde por
su propia feature (ver `progress/rediseno/fix_s40_paginablog_tarjetas.md`).

Esto dejó en rojo un test de otra feature ya `done`
(`despliegue_github_pages`, id 23), en
`src/imagenes-hrefDeDestino.test.ts`, `@s19`: el test contaba con regex las
apariciones de `src={hrefDeDestino(` en el texto real de `PaginaBlog.tsx` y
exigía `toBe(2)`. Confirmado en rojo antes de tocar nada:

```
AssertionError: expected 3 to be 2
```

## Cambio

Único fichero tocado: `src/imagenes-hrefDeDestino.test.ts`.

- `expect(llamadas.length).toBe(2)` → `expect(llamadas.length).toBe(3)`.
- Nombre del test actualizado de "sus dos puntos de renderizado de imagen:
  'Sigue leyendo' y la cabecera del artículo" a "sus tres puntos de
  renderizado de imagen: 'Sigue leyendo', la cabecera del artículo y la
  tarjeta del listado".

No se tocó `PaginaBlog.tsx` ni ningún otro fichero. El resto de `it`/`describe`
de `@s19`/`@s20` no necesitaron cambios.

## Verificación

- `pnpm exec vitest run src/imagenes-hrefDeDestino.test.ts` → 24/24 tests
  pasan (fichero completo, no solo el test tocado).
- `pnpm exec vitest run` → suite completa: 88 ficheros, 1230 tests, todo en
  verde. Sin ninguna otra regresión.
- `pnpm run lint` → limpio (oxlint --deny-warnings, sin salida).
- `pnpm run typecheck` → limpio (tsc -b, sin salida).
