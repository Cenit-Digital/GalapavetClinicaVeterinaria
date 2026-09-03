# Enmienda de contrato — `fidelidad_campanas`

Fecha: 03/09/2026. Afecta solo a la aserción de estructura de
`rediseno_visual` @s33; no modifica el contenido ni el orden de lectura de la
sección.

## Antes

La prueba heredada suponía que el cintillo era el primer hijo directo de toda
la región:

```ts
expect(region.firstElementChild).toBe(cintillo)
```

## Después

La composición aprobada tiene dos columnas hermanas: la presentación y la
rejilla. El cintillo abre la **presentación**, que conserva la precedencia
editorial y de lectura sobre la rejilla:

```ts
const presentacion = region.querySelector('[data-campanas-presentacion]')
expect(presentacion?.firstElementChild).toBe(cintillo)
```

El contrato resultante sigue comprobando que el cintillo no es un heading y
precede al h2. Esta precisión evita confundir la anatomía de dos columnas con
un cambio de jerarquía semántica.

## Ronda 2 (03/09/2026, tras el judge REJECTED) — precisiones y enmiendas añadidas

### 1bis. `rediseno_visual` @s33 — comentario en el propio test

El punto 3 del judge pedía, además del antes/después anterior, la
justificación **en el propio test**. `CampanasPortada.test.tsx` (@s33, «el
cintillo existe, precede al h2 y no es un encabezado») lleva ahora el
comentario con el antes literal, el porqué (anatomía de dos columnas de
`fidelidad_campanas` @s1) y el precedente (`ReservaChat` @s34,
`> div:first-child`), y fija además que el primer hijo de la región es la
columna de presentación:

```ts
expect(region.firstElementChild).toBe(presentacion)
expect(presentacion?.firstElementChild).toBe(cintillo)
```

### 2. `identidad_visual` @s11 — `MATRIZ_DE_USO_DEL_SISTEMA`

Desde `fidelidad_lienzo` (26) la sección vive en la banda alterna de
`Landing` (`.seccionAlterna`, `--color-fondo-alterno`) y pinta sobre ella dos
roles que la matriz no daba de alta: `tinta` (h2, `color: var(--color-tinta)`)
y `acento-tinta` (cintillo, mixin `eyebrow`). La matriz es «lo que se pinta de
verdad» (@s11), así que entran las dos filas.

Antes (22 filas; `toHaveLength(22)`, `parejasComprobadas` 110):

```ts
{ rol: 'tinta', fondo: 'superficie', uso: 'texto normal' }, // `PieDePagina.module.scss:12` + `:29`
// …
{ rol: 'acento-tinta', fondo: 'superficie', uso: 'texto normal' }, // `Servicios.module.scss:52` dentro de `tarjeta`
```

Después (24 filas desde campañas; `toHaveLength(24)`, `parejasComprobadas`
120 — el recuento sigue vivo en `matrizDeContraste.test.ts`, otras
reparaciones de la oleada lo han subido después):

```ts
{ rol: 'tinta', fondo: 'fondo-alterno', uso: 'texto normal' }, // `CampanasPortada.module.scss` dentro de `Landing.tsx` `.seccionAlterna`
{ rol: 'acento-tinta', fondo: 'fondo-alterno', uso: 'texto normal' }, // `CampanasPortada.module.scss` (`.eyebrow`) dentro de `Landing.tsx` `.seccionAlterna`
```

Las dos filas aprueban 4,5:1 en las cinco variantes (la puerta @s11 sigue en
verde).

### 3. `campanas_portada` @s5 — nombre accesible de la tarjeta (informativo)

Contrato (sin cambios): «el nombre accesible del enlace-tarjeta contiene el
título y "Demostración"». Con la línea de detalle dentro del `<a>` (la tarjeta
entera sigue siendo el enlace, @s11) el nombre pasa a ser
«Demostración Vacunaciones Bloque de servicios: Medicina general». Cumple
«contiene»; ningún test cambia.

### No enmendado

- `fidelidad_campanas` @s1 («tolerancia de 1 píxel»): el spec llevaba
  `TOLERANCIA_PX = 2`; se corrige a `1`, no se enmienda el contrato.
- `campanas_portada` @s12 («Ver campañas», sin «activas» ni «→») y
  @s6/@s7/@s8 (sin precio, vigencia ni lenguaje comercial): respetados tal
  cual; la línea de detalle no introduce ninguna de esas cadenas.
- `rediseno_visual` @s19 (`padding-block: var(--ritmo-seccion-compacto);` y
  ningún `padding-block: espaciado(`): respetado; el cuerpo de la tarjeta usa
  el atajo `padding: espaciado(16)`.
