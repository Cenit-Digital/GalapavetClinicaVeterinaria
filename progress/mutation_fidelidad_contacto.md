# Mutación — `fidelidad_contacto` (34)

Fecha: 03/09/2026.

## Superficie mutada

`src/components/InformacionContacto-logica.ts`: construcción canónica de
enlaces de llamada, titular derivado, proyección Web Mercator del pin y texto
alternativo del mapa. El JSX y el SCSS se verifican con unidades y Playwright;
no son superficie de Stryker en esta configuración.

## Comando

```powershell
pnpm exec stryker run --mutate src/components/InformacionContacto-logica.ts --testFiles src/components/InformacionContacto-logica.test.ts --concurrency 1
```

## Resultado

- 33 mutantes generados.
- 33 eliminados.
- 0 supervivientes, 0 sin cobertura y 0 timeouts.
- **Mutation score: 100 %.**

La ejecución inicial de 9 pruebas pasó antes de mutar. Los mutantes de
`construirEnlaceTelefono` quedan cubiertos explícitamente por los casos de
destino canónico y teléfono incompleto; los de la proyección y el alt quedan
cubiertos por valores exactos y casos de borde.

## Medición del lead (craftsman_lead, 03/09/2026 20:37) — PASS

```
pnpm exec stryker run --mutate src/components/InformacionContacto-logica.ts --testFiles src/components/InformacionContacto-logica.test.ts --plugins @stryker-mutator/vitest-runner
```

| Fichero | Mutantes | Eliminados | Supervivientes | Timeouts | Puntuación |
| --- | ---: | ---: | ---: | ---: | ---: |
| `InformacionContacto-logica.ts` | 33 | **33** | 0 | 0 | **100 %** (umbral 100 %) |

Leído de `reports/mutation/mutation.json` (recuento por estado: `{"Killed":33}`);
duración 2 min 23 s, `concurrency: 1`, exit 0. Corrida en serie: ninguna otra
instancia de Stryker activa durante la medición.
