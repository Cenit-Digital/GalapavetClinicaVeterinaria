# Enmiendas a contratos vigentes — feature 31 `fidelidad_equipo`

> Cada feature `fidelidad_*` respeta los contratos `done` que toca o los
> **enmienda por escrito**, con el antes y el después literal de cada cláusula
> (invariante de `project-spec.md`, «Fidelidad visual de la portada»). Este
> fichero recoge las de `fidelidad_equipo`. Ninguna renumera ni reordena
> escenarios; los tags `@sNN` se conservan.
>
> Origen: conflicto **E1** de `progress/fidelidad/delta_equipo.md` (rótulos
> invertidos respecto al prototipo), recogido en la descripción registrada de
> la feature 31 en `feature_list.json` («cintillo «Equipo», titular «Nuestro
> equipo»») y en la instrucción del `craftsman_lead` al `tdd_craftsman`
> (03/09/2026). Queda sujeta a la revisión del `judge`.

---

## Enmienda 1 — `features/equipo.feature` @s1 y @s10: el h2 pasa a «Nuestro equipo»; la región sigue siendo «Equipo»

### Qué se midió

El prototipo (`docs/diseno-claude-design/Veterinaria La Sierra.dc.html`,
VLS:212-213) pone el **cintillo** «Equipo» y el **h2** «Nuestro equipo». La
web los tenía **al revés** (cintillo «Nuestro equipo», h2 «Equipo»), y son lo
primero que el cliente lee en la sección. Ambos son rótulos neutros: no son
datos de negocio ni afirman nada sobre Galapavet.

Lo que **no** cambia: la región conserva `aria-label="Equipo"`, así que
«existe una región cuyo nombre accesible es "Equipo"» (@s1) y el ancla
`#equipo` del menú siguen valiendo tal cual.

### ANTES (literal) — @s1, línea 66

```gherkin
    Then la sección tiene un encabezado de nivel 2 cuyo nombre accesible es "Equipo"
```

### DESPUÉS (literal) — @s1

```gherkin
    Then la sección tiene un encabezado de nivel 2 cuyo nombre accesible es "Nuestro equipo"
```

### ANTES (literal) — @s10, línea 141

```gherkin
    Then no existe ningún encabezado de nivel 2 cuyo nombre accesible sea "Equipo"
```

### DESPUÉS (literal) — @s10

```gherkin
    Then no existe ningún encabezado de nivel 2 cuyo nombre accesible sea "Nuestro equipo"
```

### Tests tocados por esta enmienda

- `src/components/Equipo.test.tsx`: `obtenerSeccionEquipo()`, @s1, @s10 y
  el literal `ROTULO_CINTILLO` de @s33 (`rediseno_visual`) cambian solo en esa
  palabra; la justificación va en el propio fichero, sobre
  `obtenerSeccionEquipo`.
- `features/rediseno_visual.feature` @s33 no cambia: sigue exigiendo un
  rótulo corto en versalitas con acento tinta antes del titular, sin fijar su
  texto.

---

## Contratos vigentes que esta feature RESPETA sin enmendar

| Contrato | Cláusula | Cómo se respeta |
| --- | --- | --- |
| `equipo.feature` @s2 | sin «Colegiad», «Idiomas», «nº» | el `dl` del prototipo no se porta; el resumen derivado no usa «nº» |
| `equipo.feature` @s7 | texto accesible de la tarjeta sin formación = nombre + rol | el resumen vive fuera de los `article`; el panel solo contiene el avatar `aria-hidden`; sin chips mientras no haya dato |
| `equipo.feature` @s11 y `rediseno_visual` @s32 | ninguna imagen; avatar de iniciales **sobre el acento suave** | el panel 4:3 es un `<div>` sin `<img>` en `--color-primario`; el círculo `.avatar` conserva `background-color: var(--color-acento-suave);` (el test lo lee en crudo). El mint que el prototipo muestra bajo la foto (VLS:220) solo aparece cuando la foto falla: no se porta como panel para no dejar el avatar invisible ni enmendar @s32 |
| `rediseno_visual` @s33 | cintillo con `@include eyebrow` y sin `color:` propio | el bloque `.eyebrow {}` solo añade `margin-block-end` |
| `rediseno_visual` @s19 | el relleno vertical lo pone solo el wrapper | `Equipo.module.scss` no declara `padding-block` |
| `rediseno_visual` @s23/@s24 | `#equipo span[aria-hidden]` primero = círculo 50 %; `#equipo article` primero con sombra de reposo | el avatar es el primer `aria-hidden` del `article`; el glifo «+» va después; la tarjeta sigue con `@include tarjeta` |
| `identidad_visual` (movimiento) | solo 150/300 ms `ease-out` bajo `no-preference` | transiciones del botón «+» dentro del `@media` |
| `datos_negocio` / `rediseno_visual` @s49/@s52 | ningún literal del prototipo ni «24 h»/«365» | el resumen deriva del recuento real y de `datosNegocio.identidad.nombreComercial` |
