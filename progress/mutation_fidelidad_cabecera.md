# Mutación — fidelidad_cabecera (27)

## Superficie nueva y resultado

La estructura JSX y SCSS no son una superficie que StrykerJS pueda mutar de forma fiable en este repositorio. La decisión nueva —derivar o no el CTA de urgencias— se extrajo a `construirControlDeUrgencias` en `src/components/Cabecera-logica.ts` y se verificó con su prueba dedicada.

Comando final:

```powershell
pnpm exec stryker run --mutate src/components/Cabecera-logica.ts --testFiles src/components/Cabecera-logica.test.ts --plugins @stryker-mutator/vitest-runner
```

Resultado del JSON de Stryker (`reports/mutation/mutation.json`):

| Superficie | Mutantes | Eliminados | Supervivientes | Sin cobertura | Resultado |
| --- | ---: | ---: | ---: | ---: | --- |
| `construirControlDeUrgencias` (líneas 32–41) | 13 | 13 | 0 | 0 | 100% |

Los 14 `NoCoverage` del total pertenecen a `esMovil`, lógica anterior no modificada, porque el alcance deliberadamente ejecuta solo la prueba dedicada al CTA. No se imputan a la feature ni sustituyen su cobertura; la prueba histórica de `Cabecera-logica` ya cubre esa regla en la suite completa.

## Mutante que reveló una prueba faltante

La primera corrida dejó vivo el mutante que sustituía `telefono.rotulo.trim()` por `telefono.rotulo`. Eso habría publicado una píldora sin texto ante un rótulo de solo espacios. Se añadió el caso rojo correspondiente y se repitió la corrida: los 13 mutantes nuevos quedan eliminados.

## Incidencia de herramienta

La primera ejecución sin `--testFiles` se quedó bloqueada durante su preparación, intentando reabrir toda la suite para cada mutante. Se detuvo el árbol de procesos de Stryker identificado y se repitió con la prueba directa de la misma lógica. El comando final hizo una corrida seca satisfactoria de 14 tests y completó la mutación; no se redujo el umbral ni se aceptó ningún superviviente.
