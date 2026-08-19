# Reparación de features/pie_de_pagina.feature — hallazgos CONFIRMADOS de VEREDICTO_pie_de_pagina.md

Fuente del veredicto: `progress/revision/VEREDICTO_pie_de_pagina.md`. Se repararon
los 2 hallazgos marcados CONFIRMADO. El hallazgo `@s13` está REFUTADO en el
propio veredicto (motivo ya justificado allí: cubierto por el Invariante 6
general del proyecto) y no se toca.

## @s1 (grave, L1) — cláusula negativa abierta sin anclar a literales

**Línea original ~90**: `And en todo el pie no aparece "desde 2013", ni "2013",
ni ninguna otra cifra de antigüedad, volumen o reputación` — la coletilla
"ninguna otra cifra de antigüedad, volumen o reputación" no ancla a ningún
literal, tal como señala el veredicto.

**Cambio**: líneas 90-91. Sustituida la coletilla abierta por los literales
concretos ya usados como precedente organizacional en `features/hero.feature`
(@s7, líneas 105-113) y `features/informacion_contacto.feature` (línea 213)
para el mismo tipo de cláusula "no aparece ninguna cifra de antigüedad/volumen/
reputación" sobre este mismo negocio:

```
And en todo el pie no aparece "desde 2013", ni "2013", ni "12 años", ni "8.400", ni "327"
And en todo el pie no aparece "4,9", ni "4,6", ni "reseñas", ni el carácter "★"
```

Los literales `"12 años"`, `"8.400"`, `"327"`, `"4,9"` son los mismos que fija
`hero.feature` @s7 para las mismas cifras inventadas del prototipo (§7 de
`docs/datos-galapavet.md`: «+12 años cuidando la sierra», «8.400 mascotas en
ficha», «4,9 ★ · 327 reseñas»). Se añade también `"4,6"`, `"reseñas"` y el
carácter `"★"` porque el propio `project-spec.md` deja fuera de alcance
también la cifra REAL de reputación (§8: 4,6 ★ · 189 reseñas) para el pie —
"la valoración de Google (§8) es un dato vivo y el pie no la muestra" (línea
71 del propio `.feature`) —, igual que ya hace `hero.feature` @s7 al excluir
tanto la cifra falsa como la real. Ahora dos implementadores no pueden elegir
listas de literales distintas: la lista está fijada y es la misma que ya usa
el resto del proyecto.

## @s11 (grave, L3) — el escenario del caso "2 páginas legales" no ancla identidad de los 2 enlaces que sobreviven

**Líneas originales ~172-176**: solo comprobaba el conteo (2 enlaces), dos
negativos genéricos y la ausencia del rótulo obsoleto "Privacidad". Ningún
`Then` fijaba qué dos páginas concretas sobreviven ni sus destinos, así que un
mutante que invirtiera la lógica de selección (omitir la página equivocada)
sobrevivía sin que ningún `Then` lo detectara.

**Cambio**: líneas 172-178.
1. El `Given` ahora nombra explícitamente cuáles son las dos páginas
   presentes y cuál falta: `"Aviso legal" y "Política de cookies", porque
   "Personalizar cookies" no está publicada` — en vez de la formulación
   genérica "la tercera" que no fijaba cuál.
2. Se añaden dos `And` que anclan nombre accesible exacto y destino exacto de
   cada uno de los 2 enlaces que sobreviven, con el mismo patrón y los mismos
   literales de dominio que ya usa @s9 (líneas 156-157 del propio fichero):
   `"https://galapavet.com/aviso-legal"` y
   `"https://galapavet.com/politica-de-cookies"`.

Con esto un mutante que invierta qué página se omite deja de sobrevivir: el
conteo seguiría en 2, pero el nombre/destino del segundo enlace ya no
coincidiría con "Política de cookies" → `.../politica-de-cookies`.

## Hallazgos no tocados

- `@s13` (menor, L3): REFUTADO en el propio veredicto con justificación
  explícita (Invariante 6 de `project-spec.md` ya cubre el cálculo puro del
  año de copyright sin necesidad de repetirlo en la cabecera de cada
  `.feature`). No se modifica nada.
