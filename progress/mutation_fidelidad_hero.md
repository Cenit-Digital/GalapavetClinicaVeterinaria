# Mutación — fidelidad_hero (28)

La derivación de cifras vive en `src/components/Hero-logica.ts`; el componente solo cablea sus cuatro fuentes. Se volvió a ejecutar la mutación de esa lógica tras corregir el orden de llamada en `Hero.tsx`.

```powershell
pnpm exec stryker run --mutate src/components/Hero-logica.ts --testFiles src/components/Hero-logica.test.ts --plugins @stryker-mutator/vitest-runner
```

| Fichero | Mutantes | Eliminados | Supervivientes | Sin cobertura | Resultado |
| --- | ---: | ---: | ---: | ---: | --- |
| `Hero-logica.ts` | 10 | 10 | 0 | 0 | 100% |

Además de la prueba pura, `Hero.test.tsx` fija el orden integrado 5/2/6/3 y `fidelidad-hero.spec.ts` lo mide en la página construida. Así la mutación verifica la derivación y el test de componente evita que vuelva a cruzarse su cableado JSX.
