# Mutación — fidelidad_servicios (29)

La lógica verificable de la sección reside en `src/components/Servicios-logica.ts`. Tras añadir el resumen de tarjeta y ajustar la extracción de categoría, se ejecutó:

```powershell
pnpm exec stryker run --mutate src/components/Servicios-logica.ts --testFiles src/components/Servicios-logica.test.ts --plugins @stryker-mutator/vitest-runner
```

| Fichero | Mutantes | Eliminados | Supervivientes | Sin cobertura | Resultado |
| --- | ---: | ---: | ---: | ---: | --- |
| `Servicios-logica.ts` | 30 | 30 | 0 | 0 | 100% |

Las pruebas puras fijan texto cerrado/abierto, filtrado de vacíos, resumen de dos puntos, existencia de desglose, nombre accesible y categoría con espacios, tabuladores y cadena vacía. Playwright cubre el cableado DOM y los estados visuales que Stryker no muta en JSX o SCSS.
