# TDD — `fidelidad_campanas` (30) — ronda 2, tras el judge REJECTED

## Contrato, insumos y alcance

- Contrato humano aprobado: `features/fidelidad_campanas.feature` @s1–@s4.
- Veredicto a reparar: `progress/judge_fidelidad_campanas.md` (10 «Cambios requeridos»).
- Análisis: `progress/fidelidad/delta_campanas.md`; handoff T3; Decisiones 61–67 de `project-spec.md`.
- Ficheros propios: `src/components/CampanasPortada.{tsx,module.scss,-logica.ts,test.tsx,-logica.test.ts}`,
  `tests/e2e/fidelidad-campanas.spec.ts`. Compartidos con Edit mínimo: `src/lib/diseno/matrizDeContraste.ts` y su test.
- Sin Stryker ni `feature_list.json` (los gestiona el lead).

## Nota de concurrencia (sin ocultar)

Dos sesiones del mismo artesano trabajaron esta reparación: la **2a**
(19:58–20:03) dejó código, tests, enmienda y una primera bitácora y captura
(`fidelidad_campanas_final_*`) sin llegar a cerrar; la **2b** (esta,
20:01–20:22) la encontró en marcha, no tocó ningún fichero hasta comprobar
cinco minutos sin escrituras, auditó lo hecho contra los 10 puntos del judge y
completó los huecos por TDD. Ningún fichero se reescribió a ciegas.

## Trazabilidad: @s → test

| @s | Cláusula | Test concreto |
| --- | --- | --- |
| @s1 | dos columnas en la misma fila a 1440, tarjetas a la derecha, tolerancia 1 px | `fidelidad-campanas.spec.ts` › «a 1440px la presentación y la rejilla comparten fila…» (`TOLERANCIA_PX = 1`) |
| @s1 | el bloque de titular abre con su cintillo (12,8 px, `--color-acento-tinta`), sin que la cascada lo pise | `fidelidad-campanas.spec.ts` › «el cintillo abre la presentación con el tamaño y la tinta de acento del mixin eyebrow…»; `CampanasPortada.test.tsx` › «separa el aviso del cintillo, conserva el mixin compartido y no deja que un selector genérico lo pise» (`.aviso {` con `color`, `max-width: 52ch`, `paso-tipografico(0)`; prohibido `.presentacion > p {`); @s33 › «el cintillo existe, precede al h2…» (primer hijo de la región = presentación; primer hijo de la presentación = cintillo) |
| @s1 | composición con tokens, sin duplicar la hoja global | `CampanasPortada.test.tsx` › «usa la escala de espaciado para el hueco y no repite en local la tipografía global del h2» y «el h3 de cada tarjeta conserva solo escala, margen y tinta…» |
| @s2 | aviso íntegro y descripción accesible de la región | `CampanasPortada.test.tsx` @s4 (texto exacto + `aria-describedby`); E2E @s2 |
| @s2 | cada tarjeta: imagen, píldora «Demostración», título y línea de detalle derivada de contenido publicado | `CampanasPortada.test.tsx` › «la tarjeta de Vacunaciones conserva imagen, etiqueta, título y el detalle exacto en ese orden editorial» (orden `img → span → h3 → p`, texto EXACTO, un solo `<p>`); @s14 (sin `bloque` no hay `[data-detalle-campana]`); `CampanasPortada-logica.test.ts` @s2 (4 `it`: bloque publicado, `undefined`, cadena vacía, solo espacios); E2E @s2 (tres detalles exactos por tarjeta) |
| @s2 | sin precio, porcentaje ni vigencia | `CampanasPortada.test.tsx` @s6/@s7/@s8; E2E @s2 |
| @s3 | botón primario con nombre accesible exacto «Ver campañas» | E2E @s3 › «el CTA primario y las tres tarjetas…» (nombre y `href`); E2E @s3 › «el CTA es el botón primario relleno: fondo --color-primario y texto --color-sobre-primario»; `CampanasPortada.test.tsx` › «usa el botón primario compartido y la píldora compartida, sin reducirlos localmente» (`@include boton-primario;`, sin `boton-fantasma`, píldora sin `font-size`); @s12 |
| @s3 | el botón y cada tarjeta enlazan a la página de campañas | E2E @s3; `CampanasPortada.test.tsx` @s11 |
| @s4 | a 320 px el texto precede a las tarjetas y no hay desborde | E2E @s4 (`TOLERANCIA_PX = 1`) |

## Ciclos rojo → verde → refactor

### Ronda 2a (sesión anterior)

1. **Cintillo pisado por la cascada.** Rojo: el test `?raw` exigió el bloque `.aviso {` y prohibió `.presentacion > p {`. Verde: `className={styles.aviso}` en el `<p id="campanas-aviso-demostracion">` y regla `.aviso` propia; `.eyebrow` queda solo con `@include eyebrow` + `margin-block-end: espaciado(12)`.
2. **Píldora.** Rojo: prohibido `font-size:` dentro de `.cuerpo span {`. Verde: fuera el `paso-tipografico(-2)`; una sola píldora en el sistema (Decisión 24).
3. **Gap con tokens y h2 sin duplicados.** Rojo: exigido `gap: clamp(espaciado(24), 4vw, espaciado(48));` y prohibidos `font-weight`/`letter-spacing`/`line-height` en `.presentacion h2 {`. Verde: SCSS reducido.
4. **Matriz de contraste.** Rojo: `toHaveLength(24)` + `toContainEqual` de los dos pares. Verde: filas `tinta / fondo-alterno` y `acento-tinta / fondo-alterno` citando `CampanasPortada.module.scss` dentro de `Landing.tsx` `.seccionAlterna`; `parejasComprobadas` 120.
5. **Detalle mordible.** `CampanasPortada-logica.test.ts`: los casos `undefined`, cadena vacía y solo espacios pasan a `it` propios; test DOM del detalle por valor; @s14 extendido (sin `bloque`, sin `<p>`).
6. **`TOLERANCIA_PX = 1`** en el spec (el contrato dice 1 px; no se enmienda el contrato).

### Ronda 2b (verificación y cierre)

7. **h2 en tinta (desviación justificada del punto 8 del judge) y h3 sin duplicados.** El ciclo 3 había retirado también `color: var(--color-tinta)` del h2, pero `global.scss` (bloque `h1…h6`, líneas 168-180) da familia, peso, `letter-spacing` e interlineado y **no** el color: el h2 heredaba `--color-texto` (`#3C4C66`) del cuerpo y de `.seccionAlterna`, no la tinta del prototipo (`--ink`) ni la de los h2 de Servicios/Equipo, y la fila `tinta / fondo-alterno` recién dada de alta citaba un módulo que ya no la pintaba. Rojo (2 fallos): el test del h2 exige `color: var(--color-tinta);` y el nuevo test del `.cuerpo h3 {` prohíbe `font-weight`/`letter-spacing`/`line-height`. Verde: una línea añadida al h2, dos retiradas del h3. Medido: h2 `rgb(11,27,51)`; h3 con interlineado 1,08 como el resto de titulares.
8. **Detalle por valor y en orden (caracterización con mordida comprobada).** El test de la tarjeta pasa a comprobar orden (`img → span → h3 → p` por `compareDocumentPosition`), texto exacto (`textContent`, no subcadena) y un único `<p>` dentro del `<a>`. Sabotaje: `detalleDeCampana(campana.titulo)` en vez de `campana.bloque` → 2 rojos (este test y @s14) → restaurado → 27/27.
9. **Punto 3 del judge: comentario en el propio test.** @s33 lleva ahora el antes literal (`expect(region.firstElementChild).toBe(cintillo)`), el porqué (dos columnas de @s1) y el precedente (`ReservaChat` @s34), y fija además `region.firstElementChild === presentacion`. El comentario del test de `.eyebrow` pasa de `--color-fondo` a `--color-fondo-alterno` (banda que `Landing` da a campañas desde la 26) y documenta la causa del defecto (especificidad 0,1,1 frente a 0,1,0).
10. **E2E por valor.** Rojo genuino contra el `dist` anterior: «element(s) not found» para `[data-campanas-presentacion] > [data-campanas-cintillo]:first-child`. Verde mínimo: atributo `data-campanas-cintillo` en el `<p>` del cintillo; build; 6/6. Aserciones nuevas: cintillo `font-size` `12.8px` (literal a mano: `paso-tipografico(-1)` = 16 × 0,8) y `color` = `--color-acento-tinta` leído del `:root` con sonda; CTA `background-color` = `--color-primario` y `color` = `--color-sobre-primario`; los tres detalles exactos tarjeta a tarjeta (`toHaveText`, no `toContainText`).
11. **Aviso a `paso-tipografico(0)`.** El texto intro del prototipo va a 16,5 px / 1.7 (delta campanas-7) y el boceto del judge para `.aviso` no llevaba `font-size`; el paso 1 (20 px) pesaba más que el ritmo del h2 y partía el aviso en cuatro líneas. Rojo: el test exige `font-size: paso-tipografico(0);` y `max-width: 52ch;` en `.aviso {`. Verde: dos líneas en el SCSS. Medido: 16 px / 27,2 px, tres líneas a 569 px.
12. **Matriz (fichero compartido, Edit mínimo).** Solo el comentario del recuento en `matrizDeContraste.test.ts` («24 desde fidelidad_campanas…»); el recuento vivo es 25 porque la reparación del hero añadió su fila después. Las dos filas de campañas aprueban 4,5:1 en las cinco variantes (puerta @s11 verde).

## Cambios requeridos del judge → estado

| # | Cambio | Estado |
| --- | --- | --- |
| 1 | Cintillo pisado: clase `.aviso`, `.eyebrow` solo con el mixin; fijado por valor | Hecho: `?raw` (ciclo 1) + E2E por valor (ciclo 10); medido 12,8 px `rgb(4,120,87)` |
| 2 | Bitácora TDD | Este fichero |
| 3 | Enmienda escrita de @s33 + comentario en el test | `progress/fidelidad/enmiendas_fidelidad_campanas.md` (antes/después literal + ronda 2) y comentario en @s33 (ciclo 9) |
| 4 | Test de «botón primario» (@s3) | `?raw` (`@include boton-primario;`, sin `boton-fantasma`) + E2E por valor (fondo `rgb(30,64,175)`, texto blanco) |
| 5 | Línea de detalle fijada en el DOM por valor y omitida sin `bloque`; casos de `trim` en `it` propios | Ciclos 5 y 8 (orden + texto exacto + un solo `<p>`; @s14; 4 `it` en la lógica) |
| 6 | `TOLERANCIA_PX = 1` | Hecho (@s1 y @s4) |
| 7 | Píldora sin `font-size` local | Hecho (ciclo 2), test por ausencia |
| 8 | h2 sin lo que ya da `global.scss` | Hecho con matiz: fuera `font-weight`/`letter-spacing`/`line-height`; se conserva `color: var(--color-tinta)` porque la hoja global no lo da (ciclo 7). Mismo criterio aplicado al h3 de tarjeta |
| 9 | `gap` con tokens | `clamp(espaciado(24), 4vw, espaciado(48))` (variante fluida admitida por el judge); computa 48 px a 1440 |
| 10 | Matriz: `acento-tinta / fondo-alterno` y `tinta / fondo-alterno` | Hecho (ciclo 4); comentario del recuento (ciclo 12) |

## Evidencia

- Vitest de la sección: `CampanasPortada.test.tsx` 27/27, `CampanasPortada-logica.test.ts` 11/11 (38/38); con matriz + `hrefDeDestino` 117/117.
- Suite completa: **1410/1411**. El único rojo, `src/styles/hoja-global.test.ts` @s39, es de `global.scss`/`Hero.*` en edición por la reparación 27-29 (otro artesano). Un fallo transitorio de `src/pages/PaginaCampanas.test.tsx` @s11 bajo concurrencia de la suite: aislado, 49/49 dos veces.
- `oxlint --deny-warnings` sobre los ficheros de campañas: limpio. `pnpm run lint` completo: rojo solo en `ReservaChat.test.tsx` (feature 32 en curso). `pnpm run typecheck`: 0 errores en la última pasada (una lectura intermedia recogió 3 errores transitorios de `ReservaChat-logica.ts`, ajenos).
- Build: verde; CSS servido `dist/assets/index-BPgGRjFg.css` **75,25 kB crudo / 9,92 kB gzip** (techo 12 000 B; `css-presupuesto` 2/2).
- Playwright: `tests/e2e/fidelidad-campanas.spec.ts` **6/6**; transversales `css-presupuesto` + `tokens-aplicados` + `layout` + `imagenes` + `datos-reales` **44/44**.
- Medida en pantalla a 1440 (sonda propia contra `dist/`): cintillo 12,8 px `rgb(4,120,87)`, margen 0 0 12; h2 46 px `rgb(11,27,51)`; aviso 16 px / 27,2 px `rgb(94,110,136)`, margen 16 0 24, 569 px (52ch); CTA 160 px, fondo `rgb(30,64,175)`, texto `rgb(255,255,255)`; h3 20 px en tinta, interlineado 21,6 px; `gap` 48 px; columnas 586 + 586 px.
- Capturas: `progress/rediseno/capturas/fidelidad_campanas_{1440,390,comparativa}.png` (20:20). Las `fidelidad_campanas_final_*` (20:03) son de la ronda 2a, anteriores a los ciclos 7-11.

## Veredicto visual propio

Comparada a escala real la banda de campañas de la web con `#campanas` del
prototipo (1440 px): dos columnas centradas verticalmente, cintillo pequeño en
versalitas y tinta de acento, titular grande en tinta, párrafo secundario a
52ch en tres líneas, botón primario relleno en píldora, rejilla compacta 2 + 1
con la cuarta celda vacía, tarjetas con foto 16/9, píldora, título y línea de
detalle. Diferencias deliberadas y aprobadas: radio 24 px de la tarjeta (mixin
único), píldora del sistema (12,8 px), sin vigencia ni precio (huecos honestos),
h2 a `paso-tipografico(4)`. Se parece.

## Pendiente para el lead

- Stryker sobre `src/components/CampanasPortada-logica.ts` (`detalleDeCampana`: literal, condición y `trim`, ahora con 4 `it` separados).
- `judge` de la ronda 2.
- Fuera de ámbito, no tocado: el comentario de `Landing.module.scss:9-10` sigue diciendo que campañas cablea su propio `--color-fondo` (ámbito 26).
