# Review — feature 30 `fidelidad_campanas`

**Veredicto:** CHANGES_REQUESTED (REJECTED)

Fecha: 03/09/2026. Juez independiente. Base revisada: `features/fidelidad_campanas.feature` (@s1–@s4),
`progress/fidelidad/delta_campanas.md`, `project-spec.md` («Fidelidad visual de la portada», invariantes y
Decisiones 61–67), commit `61556d8` (único con cambios de la sección; el árbol está limpio), los cinco ficheros
de la sección, `tests/e2e/fidelidad-campanas.spec.ts`, la captura `progress/rediseno/capturas/fidelidad_campanas_comparativa.png`
y una sonda propia de estilos computados contra `dist/` servido en `:4173` a 1440 px.
No existe `progress/tdd_fidelidad_campanas.md` (la sesión que implementó murió antes de escribirlo): se juzga por código, tests y captura.

## Puertas ejecutadas

| Puerta | Resultado |
| --- | --- |
| `pnpm run lint` | verde |
| `pnpm run typecheck` | verde |
| `pnpm exec vitest run` (CampanasPortada x2, Landing, hrefDeDestino x2) | 81/81 verde |
| `node .harness/harness.mjs init` | **ROJO**: «Hay 4 features en in_progress (máximo 1)». Lint y 1310/1310 tests verdes; el fallo es de estado de `feature_list.json`, no del código de esta sección |
| `playwright test tests/e2e/fidelidad-campanas.spec.ts --workers=1` | 4/4 verde |
| Transversales (tokens-aplicados, imagenes, layout, css-presupuesto, datos-reales, geometria-escalas, rediseno-visual, urgencias) | 65/68: 3 rojos, **ninguno atribuible a campañas** (ver «Fuera de ámbito») |
| `playwright test tests/e2e/accesibilidad.spec.ts` | 13/15: @s38/@s39 rojos por el anillo de foco sobre el velo del hero (`Hero.module.scss:7`), no por campañas |
| CSS servido | `dist/assets/index-DmPJ7L4R.css` 66 963 B crudo, 8 779 B gzip local (techo 12 000 B; `css-presupuesto` verde) |

## Medida en pantalla (sonda a 1440 px contra `dist/`)

- Banda: `div._seccionAlterna` con fondo `rgb(237,242,249)` = `--color-fondo-alterno` (alternancia del prototipo, OK).
- Sección: `display: grid`, columnas `586px 586px`, `gap: 48px`, `align-items: center`, ancho 1220 px, `padding-block` 103,68 px.
- Columna izquierda 569 px (52ch); CTA `background rgb(30,64,175)` = `--color-primario`, texto blanco, 160x56 px, `padding-inline` 24 px, radio 999 px.
- Rejilla: `285px 285px`, `gap: 16px`; 3 tarjetas de 285x276 px en 2 + 1 (cuarta celda vacía, como el prototipo); tarjeta radio 24 px, superficie, sombra reposo.
- Píldora 10,24 px sobre `--color-acento-suave`; h3 20 px/600; detalle 12,8 px `--color-texto-suave`; textos: «Bloque de servicios: Medicina general» x2, «Bloque de servicios: Especialidades».
- **Cintillo «Prevención»: `font-size: 20px`, `color: rgb(94,110,136)` (= `--color-texto-suave`), `margin: 16px 0 24px`, `line-height: 34px`.** El mixin `eyebrow` pide 12,8 px, `--color-acento-tinta` (#047857) y `margin-block-end: 4px` (+12 px locales). La regla `.presentacion > p` (`CampanasPortada.module.scss:30-35`, especificidad 0,1,1) pisa a `.eyebrow` (0,1,0) en `color`, `font-size`, `margin` y `line-height`. En la comparativa se ve: el cintillo sale gris y grande, no en tinta de acento como en el prototipo (12 px, `--accent-ink`) ni como en Servicios/Equipo.

Veredicto visual: la anatomía de prioridad alta del delta (campanas-1 dos columnas centradas, campanas-2 rejilla compacta 2x2 anidada,
campanas-3 CTA primario relleno, campanas-4 relleno lateral del botón) **sí** coincide con el prototipo. El cintillo no.

## Cobertura de escenarios (@s <-> test)

| @s | Cláusula | Evidencia | Estado |
| --- | --- | --- | --- |
| @s1 | dos columnas en la misma fila a 1440, tarjetas a la derecha | `tests/e2e/fidelidad-campanas.spec.ts:14-26` (centros verticales y `derecha.x > izquierda.right`) | [x] con reserva: el contrato dice «tolerancia de 1 píxel» y el spec usa `TOLERANCIA_PX = 2` (`:5`, `:24`) |
| @s2 | aviso íntegro + descripción accesible | `src/components/CampanasPortada.test.tsx:64-76` (texto exacto + `aria-describedby`), e2e `:32-34` | [x] |
| @s2 | cada tarjeta: imagen, píldora «Demostración», título, **línea de detalle derivada de contenido publicado** | e2e `:37-44` solo `toContainText('Bloque de servicios:')`; `CampanasPortada-logica.test.ts:5-11` fija `detalleDeCampana` por valor pero **ningún test fija el `<p data-detalle-campana>` del DOM por valor** ni su omisión cuando `bloque` falta (`{ titulo: 'Vacunaciones' }`; @s14 no lo comprueba). Cablear `campana.titulo` en vez de `campana.bloque` (`CampanasPortada.tsx:47`) seguiría en verde | [ ] parcial |
| @s2 | sin precio, porcentaje ni vigencia | unit @s6/@s7/@s8 (`:94-147`), e2e `:35` | [x] |
| @s3 | nombre accesible exacto «Ver campañas» + destino | e2e `:51-52`, unit @s12 (`:166-175`) | [x] |
| @s3 | **«botón primario»** | ningún test: ni `@include boton-primario;` en el texto del SCSS ni `background-color` computado = `--color-primario` en E2E (el delta, paso 3, pedía además `not.toContain('boton-fantasma')`) | [ ] |
| @s3 | cada tarjeta enlaza a la página de campañas | e2e `:53-55`, unit @s11 (`:149-164`) | [x] |
| @s4 | a 320 px el texto precede a las tarjetas y no hay desborde | e2e `:60-71` | [x] |

## Disciplina TDD

- ¿Evidencia de Rojo -> Verde -> Refactor? **NO**: no existe `progress/tdd_fidelidad_campanas.md` (mapa @s -> test, ciclos, enmiendas,
  medida del CSS, veredicto visual). Exigido por `docs/tdd.md` («Trazabilidad obligatoria»), CHECKPOINTS C6 y la regla 7 de la oleada.
- ¿Producción sin test que la pida? **SÍ**:
  - `CampanasPortada.module.scss:30-35` (`.presentacion > p`: margen, color, `paso-tipografico(1)`, `line-height 1.7`): nadie lo pide y es la causa del defecto del cintillo.
  - `CampanasPortada.module.scss:20-28` (`.presentacion h2`: `color`, `font-weight: 600`, `letter-spacing: -0.015em`, `line-height: 1.08`): duplica lo que `global.scss` ya da a todo `h2` (así lo documenta el propio delta, tabla «CSS real servido»); bytes de CSS sin test.
  - `CampanasPortada.module.scss:79` (`font-size: paso-tipografico(-2)` sobre la píldora): contradice campanas-15 del delta («se mantiene el mixin: una sola píldora en el sistema») y la Decisión 24 (no portar el 10 px del prototipo).
  - `CampanasPortada.module.scss:37-39` (`.cta { @include boton-primario }`): es lo que pide @s3, pero ningún test lo fija (ver cobertura).
- Lógica en `*-logica.ts`: **SÍ** (`detalleDeCampana`, `CampanasPortada-logica.ts:17-21`, sin DOM; el `.tsx` cablea).

## Contratos vigentes y enmiendas

- `rediseno_visual` @s33: el escenario se respeta (el cintillo sigue precediendo al h2), pero la **aserción** `expect(region.firstElementChild).toBe(cintillo)`
  se cambió por `presentacion?.firstElementChild` (`CampanasPortada.test.tsx:354-356`) **sin justificación en el propio test y sin
  `progress/fidelidad/enmiendas_fidelidad_campanas.md`** (antes/después literal). Invariante de `project-spec.md` («Contratos vigentes») incumplido.
- `campanas_portada` @s5/@s11/@s12/@s14-@s18/@s21, `ensamblaje_landing` @s5, `rediseno_visual` @s19/@s26/@s30/@s31/@s44/@s45/@s47: respetados (verificado en unit + E2E).
- Nombre accesible de la tarjeta ahora «DemostraciónVacunacionesBloque de servicios: Medicina general» (contiene título y «Demostración»: cumple @s5; el delta lo dio por aceptable). Informativo.

## Calidad (lente de artesano)

- Datos: solo `src/data/campanas.ts` (`titulo`, `imagen`, `bloque`) y textos propios; ningún literal del prototipo; sin «€», «%», meses ni «24 h»; la palabra «urgencias» no aparece en la sección. OK.
- Imágenes: `src` vía `hrefDeDestino` (2 llamadas), `alt=""`, `width/height/loading/decoding`, fondo de reserva `--color-fondo-alterno` medido en las 3 (`imagenes` @s31 falla por Servicios y el logotipo, no por campañas). OK.
- SCSS: sin colores literales, sin selectores de id, `espaciado()` solo con pasos de la escala (4/8/12/16/24), transiciones solo las de los mixins (150/300 ms bajo `no-preference`). OK.
- `gap: clamp(24px, 4vw, 48px)` (`:7`): px crudos en vez de `espaciado(48)` que prescribía el delta; hay precedente en Hero/Servicios/Landing, así que es menor.
- Matriz de contraste (`matrizDeContraste.ts:341-372`, 21 pares): la sección pasa de `--color-fondo` a la banda alterna y usa `acento-tinta` (cintillo, cuando se arregle) y `tinta` (h2) sobre `fondo-alterno`; esos dos pares **no están dados de alta** (solo `acento-tinta` sobre fondo/superficie/acento-suave y `tinta` sobre fondo/superficie). La reconciliación no es automática (`inventario_red_seguridad.md` §2). ReservaChat ya tiene el mismo hueco; aquí se añaden dos usos más. Menor.
- Inventario 18 / usoDelAcento 20: sin módulo nuevo, sin cambio necesario. OK.
- `Landing.module.scss:9-10`: el comentario sigue diciendo que CampanasPortada «cablea su propio --color-fondo»; obsoleto desde `fidelidad_lienzo`. Menor, ámbito 26.

## Checkpoints

- C1: [ ] `bin/harness init` rojo (4 features `in_progress`; ficheros base OK).
- C2: [ ] 4 features en `in_progress` (diseño de la oleada del lead; el arnés lo rechaza).
- C3: [x] sin dependencias nuevas, sin logs ni TODOs.
- C4: [x] 88 ficheros / 1310 tests verdes; test por módulo.
- C5: [ ] sin bitácora TDD de la feature; cierre pendiente.
- C6: [ ] contrato y spec existen; **falta el mapa @s -> test** y hay producción sin test (arriba).
- C7: [ ] mutación pendiente (corre tras esta puerta; objetivo nuevo: `detalleDeCampana`).

## Cambios requeridos

1. **Cintillo pisado por la cascada**: `src/components/CampanasPortada.module.scss:30-35`. Dar al aviso su propia clase (p. ej. `.aviso` en el `<p id="campanas-aviso-demostracion">`, `CampanasPortada.tsx:37`) y estilizar `.aviso { max-width: 52ch; color: var(--color-texto-suave); margin: espaciado(16) 0 espaciado(24); }` en vez de `.presentacion > p`; dejar `.eyebrow` solo con `@include eyebrow` (+ `margin-block-end: espaciado(12)` si se quiere el ritmo del prototipo). Fijarlo por valor: aserción E2E en `tests/e2e/fidelidad-campanas.spec.ts` de que el cintillo computa `font-size` 12,8 px y `color` = `--color-acento-tinta` (leído del `:root`), o al menos un test `?raw` en `CampanasPortada.test.tsx` que prohíba `.presentacion > p {` y exija el bloque `.aviso {`.
2. **Bitácora TDD**: crear `progress/tdd_fidelidad_campanas.md` con mapa @s -> test, ciclos rojo -> verde, enmiendas, medida del CSS servido (8 779 B gzip) y veredicto visual propio, como `progress/tdd_fidelidad_servicios.md`.
3. **Enmienda por escrito**: `progress/fidelidad/enmiendas_fidelidad_campanas.md` con el antes/después literal de `CampanasPortada.test.tsx:354-356` (@s33 de `rediseno_visual`) y un comentario en el propio test explicando por qué el primer hijo de la región pasa a ser la columna de presentación (precedente: `ReservaChat` @s34).
4. **@s3 «botón primario» sin test**: en `CampanasPortada.test.tsx` (patrón `?raw` ya presente) exigir `@include boton-primario;` dentro del bloque `.cta {` y `not.toContain('boton-fantasma')`; o en E2E comprobar `background-color` computado del `[data-campanas-cta]` = `--color-primario` del `:root`.
5. **@s2 línea de detalle sin fijar en el DOM**: en `CampanasPortada.test.tsx`: (a) el `<a>` de «Vacunaciones» contiene, en orden, `img`, `span` «Demostración», `h3` y un `<p>` con texto exacto «Bloque de servicios: Medicina general»; (b) con `catalogo: [{ titulo: 'Vacunaciones' }]` no existe ningún `<p>` dentro del `<a>` (extiende @s14). Separar en `CampanasPortada-logica.test.ts:5-11` los casos `undefined`, cadena vacía y cadena de espacios en `it` propios (mordida de mutación de `trim`).
6. **Tolerancia @s1**: `tests/e2e/fidelidad-campanas.spec.ts:5`: `TOLERANCIA_PX = 1` como dice el contrato (o enmendar el contrato por escrito).
7. **Píldora**: `CampanasPortada.module.scss:79`: quitar `font-size: paso-tipografico(-2)` (una sola píldora en el sistema; delta campanas-15, Decisión 24), o enmendar por escrito con motivo.
8. **h2 duplicado**: `CampanasPortada.module.scss:20-28`: dejar solo `font-family`, `font-size: paso-tipografico(4)` y `margin`; el resto ya lo da `global.scss`.
9. **Gap con px crudos**: `CampanasPortada.module.scss:7`: `gap: espaciado(48)` como prescribía el delta (o un `clamp` compuesto con tokens si se quiere fluido).
10. **Matriz de contraste**: dar de alta `{ rol: 'acento-tinta', fondo: 'fondo-alterno' }` y `{ rol: 'tinta', fondo: 'fondo-alterno' }` en `src/lib/diseno/matrizDeContraste.ts:341` (citando `CampanasPortada.module.scss` dentro de `Landing.tsx:57`) y subir `toHaveLength(21)` a 23 en `matrizDeContraste.test.ts:437`. Edición pequeña con Edit (fichero compartido).

## Fuera del ámbito de campañas (para `craftsman_lead`)

- **`fidelidad_servicios` (29), titular**: `src/components/Servicios.tsx:92` pinta «Servicios veterinarios *de principio a fin en Galapagar*». «de principio a fin» es copy del prototipo (`Veterinaria La Sierra.dc.html`, sección servicios); la Decisión 65 fija «Servicios veterinarios» + «en Galapagar» derivado de `datosNegocio.direccion.localidad`. Ni `Servicios.test.tsx:52` (regex `/Servicios veterinarios/`) ni `tests/e2e/fidelidad-servicios.spec.ts` lo atrapan; la puerta `datosDelSitio` tampoco. Defecto de la 29.
- **`fidelidad_servicios` (29)**: `geometria-escalas.spec.ts` @s22 rojo: `#servicios article h3` computa interlineado/tamaño 1,15 (esperado 1,08). `imagenes.spec.ts` @s31 rojo: las 5 `#servicios img` (`/img/servicios/*.webp`) no tienen `background-color: --color-fondo-alterno` (medido `rgba(0,0,0,0)`); también el logotipo de la cabecera (`/img/logo-galapavet.webp`, feature 27).
- **`fidelidad_hero` (28)**: `accesibilidad.spec.ts` @s38/@s39 rojos en la portada: anillo de foco con ratio 1,98 (< 3) contra el píxel pintado bajo el control, `rgb(11,27,51)` = `--color-tinta` (`Hero.module.scss:7`).
- **`fidelidad_contacto` (34)**: `rediseno-visual.spec.ts` «Landing: no emite errores de consola» rojo por el iframe de OpenStreetMap con `sandbox=""` (conocido, documentado en `feature_list.json`).
- **Estado del arnés**: `feature_list.json` tiene 4 features `in_progress` (30, 31, 33, 34) y `.harness/harness.mjs:341-343` lo rechaza; ninguna feature podrá cerrar con `init` en verde hasta serializar el estado (o dejar una sola `in_progress` al cerrar cada una).

## Revisión correctiva — APPROVED

Los diez cambios requeridos de esta revisión están presentes en el árbol actual:

- El cintillo tiene una clase propia, conserva el mixin `eyebrow` y se comprueba en navegador a 12,8 px con `--color-acento-tinta`.
- Las pruebas fijan el detalle publicado por valor y en el DOM, el CTA primario relleno, la tolerancia de 1 px y el uso de tokens en el hueco.
- La bitácora TDD y la enmienda del contrato heredado existen y la matriz incluye los pares de contraste de la banda alterna.

Evidencia repetida el 03/09/2026: unidades de Campañas 38/38 y Playwright
`fidelidad-campanas` 6/6, además de la captura actual de la portada. La
mutación de `CampanasPortada-logica.ts` queda 33/33 eliminados (100 %), según
la ejecución final documentada en `progress/mutation_fidelidad_campanas.md`.

**Veredicto final: APPROVED.**
