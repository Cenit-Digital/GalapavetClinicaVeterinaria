# Fix: sabotaje temporal en @s29 (Hero.test.tsx)

## Contexto

`src/components/Hero.test.tsx`, describe `@s29 el texto de la bienvenida
alcanza el mínimo de contraste de texto normal contra el velo, en las cinco
variantes`, tenía un umbral inflado a propósito, dejado a medias por una
sesión anterior de `tdd_craftsman` para comprobar que el test mordía de
verdad:

```ts
const UMBRAL_TEXTO_NORMAL = 20 // SABOTAJE TEMPORAL @s29: ningún ratio real llega a 20.
```

El propio comentario admitía que ningún ratio real llega a 20. El mínimo
real exigido por WCAG 2.2 AA para texto normal es 4.5, que es el valor que
pide la Enmienda 2 del contrato (comentario sobre `@s33` en
`features/rediseno_visual.feature`), y coincide con el código de producción
ya escrito en `src/components/Hero.module.scss:44-58`.

## Cambio (único fichero tocado: `src/components/Hero.test.tsx`)

```diff
- const UMBRAL_TEXTO_NORMAL = 20 // SABOTAJE TEMPORAL @s29: ningún ratio real llega a 20.
+ const UMBRAL_TEXTO_NORMAL = 4.5 // Mínimo WCAG 2.2 AA para texto normal (Enmienda 2 del contrato).
```

No se tocó ningún otro fichero (ni `Hero.tsx`, ni `Hero.module.scss`, ni
`Hero-logica.ts`, ni tokens).

## Verificación real

### Antes del cambio

```
pnpm exec vitest run src/components/Hero.test.tsx
```

```
❯ src/components/Hero.test.tsx (19 tests | 1 failed) 1187ms
   × "--color-sobre-primario" contra el velo de "--color-tinta" al 92 % supera 4,5 con la fotografía en sus dos extremos 19ms

FAIL  src/components/Hero.test.tsx > @s29 ... > "--color-sobre-primario" contra el velo ...
AssertionError: expected 17.602601737939132 to be greater than or equal to 20
 ❯ src/components/Hero.test.tsx:281:69

Test Files  1 failed (1)
     Tests  1 failed | 18 passed (19)
```

Confirma lo que decía el comentario: el ratio real más alto observado
(17.60) no llega a 20; el sabotaje mordía de verdad.

### Después del cambio

```
pnpm exec vitest run src/components/Hero.test.tsx
```

```
Test Files  1 passed (1)
     Tests  19 passed (19)
```

Las 19 pruebas del fichero pasan, no solo el test de `@s29` — se ejecutó el
fichero completo, no un test aislado.

## Trazabilidad

- `@s29` (contraste de texto normal contra el velo, 5 variantes × 2 extremos
  del velo) → test
  `"--color-sobre-primario" contra el velo de "--color-tinta" al 92 % supera 4,5 con la fotografía en sus dos extremos`
  en `src/components/Hero.test.tsx` — ahora en verde con el umbral WCAG 2.2
  AA correcto (4.5), sin inflarlo artificialmente.

## Alcance

Solo se editó `src/components/Hero.test.tsx` (una línea). No fue necesario
tocar producción: los ratios reales (~10.28 a ~17.60 en las 5 variantes × 2
extremos del velo, según el propio comentario del test) ya superan 4.5 con
el código existente en `Hero.module.scss`.
