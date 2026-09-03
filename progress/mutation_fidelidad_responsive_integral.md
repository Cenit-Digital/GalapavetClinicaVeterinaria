# Mutación — fidelidad_responsive_integral (feature 38)

## Resultado

La parte visual de la feature toca módulos `.module.scss`, que StrykerJS no
muta. Al ejecutar la mutación global, la instrumentación introdujo IDs como
`"365"`; la puerta de afirmaciones clínicas los confundía con contenido de
cliente y fallaba durante el *dry run*. Se reparó en
`rolesDescartados.ts`, con prueba específica que sigue detectando `24 h` real.

La ejecución global completa no es proporcional en esta máquina: 3.260
mutantes con un único runner y una estimación inicial superior a ocho horas.
Una prueba dirigida a todo `rolesDescartados.ts` mostró 61,82 % por mutantes
históricos ajenos a este cambio; no se ha atribuido esa deuda a la feature.

Se ejecutó mutación sobre el bloque dinámico modificado:

```text
pnpm exec stryker run --mutate "src/lib/diseno/rolesDescartados.ts:104:1-109:2" \
  --testFiles src/lib/diseno/rolesDescartados.test.ts
```

Resultado: **1 mutante, 1 eliminado, 0 supervivientes, 100 %**, por encima del
umbral configurado. El cambio responsive continúa cubierto por sus ocho pruebas
de navegador y su barrido de 81 anchos.
