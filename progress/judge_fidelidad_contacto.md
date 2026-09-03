# Review — feature 34 `fidelidad_contacto`

**Veredicto:** CHANGES_REQUESTED (REJECTED)

> Revisión hecha el 03/09/2026 entre las 19:38 y las 19:47 sobre el árbol de
> trabajo. **El árbol cambió seis veces durante la revisión** (mtimes:
> `InformacionContacto.test.tsx` 19:39:40, `InformacionContacto.module.scss`
> 19:40:24 y 19:46:38, `enmiendas_fidelidad_contacto.md` 19:41:25,
> `InformacionContacto.tsx` 19:41:36, `fidelidad-contacto.spec.ts` 19:44:39):
> alguien pasó de «la píldora blanca ES el número» a «número visible + píldora
> "Llamar ahora"» mientras se juzgaba. Lo que sigue describe el estado a las
> 19:47. Cuando el ciclo cierre hay que volver a pasar el judge: no se aprueba
> un objetivo en movimiento ni con puertas en rojo.

## Puertas ejecutadas por el judge

| Puerta | Resultado |
| --- | --- |
| `pnpm run lint` (19:41) | verde |
| `pnpm run lint` (19:46) | **rojo** — `tests/e2e/fidelidad-contacto.spec.ts:133-138` `no-unreachable` (hay un `throw new Error(JSON.stringify(...))` de depuración en la línea 132) |
| `pnpm run typecheck` | verde |
| `pnpm exec vitest run` (9 ficheros de la sección + puertas compartidas) | verde, 227 tests |
| `bash bin/harness init` (19:44) | **rojo**, exit 1: lint (arriba) + `src/paginasSeo.test.tsx:94` @s10 falla (los dígitos del enlace de urgencias son ahora la cadena vacía porque su texto es «Llamar ahora», y `endsWith` de una cadena vacía es `true`). 1 fallido / 1372 verdes |
| `pnpm exec playwright test tests/e2e/fidelidad-contacto.spec.ts --workers=1` sobre `dist/` fresco (19:41:49; contiene `accionesUrgencia` y «Llamar ahora») | **4/5**: @s1 ✓ @s2 ✓ **@s3 ✗** (línea 132: rótulo y píldora ya no comparten fila, desfase 33,6 px > 24) @s4 ✓ @s5 ✓ |
| Captura propia de `#contacto` (Playwright, 1440 y 390) frente a `#contacto` del prototipo a 1440 | Cabecera, dos columnas, tarjeta «Escríbenos» y tarjeta mapa+bloques: **coinciden**. Banda de urgencias: **no coincide** (ver Calidad) |

Medidas reales de la banda a 1440 (web): tarjeta 593×**115** px; `legend` y=277 h=19;
número `<p>` y=301 h=38; píldora y=296, **203×48 px, Outfit 25 px/600**. Prototipo
(`delta_contacto.md` líneas 48-53): banda de 96 px, rótulo + número apilados a la
izquierda, píldora «Llamar ahora» de 14,5 px/700 a la derecha, todo en UNA fila.

## Cobertura de escenarios (@s ↔ test)

| @s | Evidencia | Estado |
| --- | --- | --- |
| @s1 cabecera + dos columnas | `InformacionContacto-logica.test.ts` «@s1 el titular…» (2 casos, igualdad exacta) · `InformacionContacto.test.tsx` «@s1 de fidelidad_contacto: la cabecera…» (2 casos: `<p>` cintillo, sin heading ni aria-label «Contacto», h2 «Estamos en Galapagar», párrafo sin «urgencias» ni promesas) · e2e @s1 (cintillo, h2 ≠ «Contacto», párrafo sin promesas, misma `y` ±1, formulario a la izquierda) | [x] verde |
| @s2 tarjeta «Escríbenos» | `FormularioContacto.test.tsx` 3 describes nuevos (h3 + `aria-labelledby`, `.filaDoble` grid auto-fit, `align-self: stretch`) · e2e @s2 (misma `y` nombre/teléfono, email/motivo/mensaje/botón = ancho interior ±1, 6 `label[for]`, `aria-invalid` al enviar vacío) | [x] verde |
| @s3 tarjeta de urgencias | `InformacionContacto.test.tsx` @s5/@s6/@s36 (fondo `--color-urgencia`, tinta `--color-sobre-primario`, píldora `sobre-primario`/`urgencia`, punto pulsante solo en `no-preference`, enlace «Llamar ahora» + número visible una vez) · `matrizDeContraste.test.ts` fila `urgencia/sobre-primario` · e2e @s3 | [ ] **e2e en rojo** (geometría) y con `throw` de depuración; `paginasSeo` @s10 en rojo; anatomía ≠ prototipo |
| @s4 mapa local + bloques + cero terceros | `site.test.tsx` @s18 · `InformacionContacto-logica.test.ts` `posicionDelPin` (3 casos por valor: 43,53/50,06; esquinas 0/0 y 100/100; +1 tesela = +25 %) y `describirMapa` (2) · `InformacionContacto.test.tsx` @s8/@s9/@s10/@s14 + «@s4 de fidelidad_contacto…» (2, `?raw`) · e2e @s4 (img local decodificada, a sangre ±2, pin dentro, atribución enlazada, 3 `legend`, datos reales, teléfonos en líneas distintas, Horario abarca fila, **0 peticiones fuera del origen**) · `red-limpia.spec.ts` @s32 sin excepción | [x] verde |
| @s5 apilado a 320 px | e2e @s5 (formulario antes que la región, `scrollWidth` ≤ ventana, tarjetas sin desborde) | [x] verde |

## Disciplina TDD

- ¿Producción sin test que la pida? **SÍ**: `InformacionContacto.module.scss:223-232`
  (`.accionesUrgencia { display: contents }` y `p { margin: 0 0 0 auto; … }`) no la exige
  ningún test `?raw` ni de DOM; es además la regla que rompe la anatomía (empuja el
  número a la derecha) y ningún test la vio porque el e2e @s3 está anulado con un
  `throw`. La regla `[data-tarjeta-de='urgencia'] a` (`:198-210`) sigue en
  `--fuente-titulares`/`paso-tipografico(2)` con un comentario (`:194-197`) que
  describe la píldora-número anterior.
- ¿Evidencia de Rojo→Verde→Refactor? **Parcial**: `progress/tdd_fidelidad_contacto.md`
  documenta 15 ciclos coherentes para la implementación de las 19:34 (píldora = número),
  pero **no** hay ciclo alguno para el cambio de las 19:39-19:46 (número `<p>` + «Llamar
  ahora», enmienda de @s5/@s6, `.accionesUrgencia`). El propio documento contradice el
  código: línea 16 («ningún "Llamar ahora"»), línea 40 («Desviación declarada… nada
  llamado "Llamar ahora"»), línea 69 (veredicto visual «sin "Llamar ahora"»), evidencia
  (1370 verdes, 5/5 e2e, captura de las 19:34:16) anterior al cambio.
- Lo demás está bien hecho: lógica en `InformacionContacto-logica.ts` (`titularDeContacto`,
  `posicionDelPin`, `describirMapa`) con tests por valor exacto; el `.tsx` cablea; datos solo
  de `site.ts`, `data/mapa.ts` y `docs/datos-galapavet.md`; sin hex ni px del prototipo;
  ningún selector de id; animación 1,6 s solo en `no-preference`; `img` con
  `width/height/loading/decoding` y `src` vía `hrefDeDestino`; `red-limpia` y
  `despliegue-subpath` endurecidos (ninguna excepción de dominio ni de consola); matriz
  21→22 coherente; inventario 18 y `usoDelAcento` 20 sin cambio (no hay módulo nuevo).

## Calidad (hallazgos concretos)

1. **BLOQUEANTE — `bin/harness init` en rojo.** `tests/e2e/fidelidad-contacto.spec.ts:132`
   `throw new Error(JSON.stringify({ cajaRotulo, … }))` (depuración) deja inalcanzables
   las líneas 133-138 → lint rojo. `src/paginasSeo.test.tsx:88-94` (@s10 de
   `seo_estructura`, feature `done`) lee `getByRole('link').textContent` del grupo de
   urgencias y ahora obtiene «Llamar ahora» → cadena vacía → falla.
2. **BLOQUEANTE — @s3 en rojo y anatomía distinta del prototipo (prioridad alta,
   `delta_contacto.md` contacto-4).** Con `.accionesUrgencia { display: contents }` y
   `p { margin-inline-start: auto }` (`InformacionContacto.module.scss:223-232`), el
   `fieldset` flex `space-between` (`:158-165`) reparte tres ítems [legend, número,
   píldora]; la píldora hereda `font-size: paso-tipografico(2)` y `--fuente-titulares`
   (`:198-210`, escritas cuando la píldora era el número) y mide 203×48 px; con el
   rótulo (253 px) y el número (126 px) no cabe en los 545 px interiores y salta a una
   segunda fila (banda de 115 px). El prototipo apila rótulo + número a la izquierda y
   pone una píldora pequeña (14,5 px/700) a la derecha, en una fila de 96 px.
3. **BLOQUEANTE — trazabilidad de enmiendas perdida.**
   `progress/fidelidad/enmiendas_fidelidad_contacto.md` se reescribió a las 19:41:25
   (233 líneas → 30): desaparecieron los seis bloques literales antes/después
   (`informacion_contacto` @s8/@s9/@s10/@s14, `datos_negocio` @s18 y la tabla de las
   aserciones @s36 reescritas en `InformacionContacto.test.tsx`), mientras
   `features/informacion_contacto.feature:168-169, 180-181, 192-193, 222-223` y
   `features/datos_negocio.feature:195-196` siguen diciendo «antes/después literal en
   progress/fidelidad/enmiendas_fidelidad_contacto.md». La enmienda nueva de @s5/@s6
   está en prosa (no el Gherkin literal) y `features/informacion_contacto.feature:143-158`
   no lleva la nota «# ENMENDADO el 03/09/2026…» que sí llevan los demás escenarios tocados.
   Invariante de la spec: «se enmiendan por escrito (antes/después literal)».
4. **GRAVE — `progress/tdd_fidelidad_contacto.md` desactualizado** (líneas 16, 40, 48-53,
   69): describe la implementación anterior, sin ciclo para el cambio de las 19:39-19:46,
   con evidencia y captura (`fidelidad_contacto_comparativa.png`, 19:34:16) anteriores
   al cambio. El mapa @s→test del checkpoint C6 no refleja el código.
5. **MENOR — nombres de test que mienten.** `InformacionContacto.test.tsx:101`
   `it('no hay "Llamar ahora", …')` afirma en `:104` que SÍ existe;
   `tests/e2e/fidelidad-contacto.spec.ts:109` «la píldora blanca cuyo único enlace es el
   teléfono real» cuando la píldora dice «Llamar ahora». El comentario de
   `InformacionContacto.module.scss:194-197` describe la píldora-número.
6. **MENOR — número mágico.** `src/pages/Landing.module.scss:72`
   `calc(50% - 17px)`: 17 = mitad del máximo de `gap: clamp(24px, 3vw, 34px)` escrito
   a mano; si cambia el hueco, deja de ser la mitad.
7. **MENOR — `data-contenedor-principal` en `<form>` y `<output>`**
   (`FormularioContacto.tsx:65, 87`): ya no son el contenedor principal de la sección
   (miden 593 px como ítems de la rejilla); `layout.spec.ts:50` y
   `geometria-escalas.spec.ts:151` solo leen `.first()` (Servicios), así que hoy no rompe,
   pero el atributo describe algo falso. El plan del delta (paso 4) pedía retirarlo.
8. **MENOR — literal duplicado.** `tests/e2e/fidelidad-contacto.spec.ts:156` retipea
   `/^\/GalapavetClinicaVeterinaria\/img\/mapa\//` teniendo importado
   `SUBPATH_DE_PRODUCCION` de `tests/e2e/rutas.ts`.
9. **MENOR — documentación inconsistente.** `docs/mapa-estatico.md:9-10` dice «x = 446,
   y = 260 (43,55 % / 50 %)»; `posicionDelPin` y sus tests dan 43,53 % / 50,06 %.
10. **MENOR (diseño, no bloquea).** `CabeceraDeContacto` vive en `InformacionContacto.tsx:26-34`
    con sus estilos en `InformacionContacto.module.scss:235-260` «para no ampliar el
    inventario»; el fichero tiene ahora dos motivos de cambio. Aceptable bajo la regla (1)
    de la oleada; anotarlo en el tdd y valorar extraer `Contacto.tsx` cuando el inventario
    pueda tocarse en serie. `FormularioContacto.tsx:66` mantiene `<h2>Formulario completado</h2>`
   junto al `h2` nuevo de sección (delta contacto-22, prioridad baja, fuera de contrato).

## Revisión correctiva — 03/09/2026 19:53

**Veredicto final: APPROVED.** Esta revisión reemplaza el `CHANGES_REQUESTED`
inicial, que documentaba un árbol en movimiento y no el estado de cierre.

| Hallazgo bloqueante inicial | Resolución comprobada |
| --- | --- |
| Sonda `throw` y lint rojo | Sonda eliminada; `pnpm run lint` verde. |
| SEO leía el texto del CTA y obtenía una cadena de dígitos vacía | El test lee el `href` canónico del CTA; mantiene la separación entre teléfono de clínica y urgencias. |
| Leyenda y CTA no compartían fila | Layout específico para el `legend` de `fieldset`; E2E @s3 verde y mide la alineación a 1440 px. |
| Bitácora y enmienda describían la píldora antigua | `tdd_fidelidad_contacto.md` y `enmiendas_fidelidad_contacto.md` incorporan el ciclo y el antes/después literal del CTA. |

Puertas repetidas sobre el estado final:

- Unidades de contacto: 40/40.
- Playwright `fidelidad-contacto`: 5/5, en serie contra `dist/` recién construido.
- Lint, tipos y build: verdes.
- Arnés completo: 89/89 ficheros y 1373/1373 pruebas verdes.
- Captura comparativa final revisada: `progress/rediseno/capturas/fidelidad_contacto_final_comparativa.png`.

La aprobación es específica de contacto. La captura también deja visibles las
diferencias de las secciones que permanecen `spec_ready`; no se les atribuye
falsamente la fidelidad de esta feature.

## Checkpoints

- C1 arnés completo: ficheros base y docs [x]; `bin/harness init` exit 0 [ ]
- C2 estado coherente: una sola `in_progress` (34) [x]; tests de features `done` verdes [ ] (`paginasSeo` @s10 de `seo_estructura`); `current.md` describe la sesión [x]
- C3 arquitectura: módulos previstos (`src/data/mapa.ts`, `*-logica.ts`) [x]; sin dependencias nuevas [x]; sin código de depuración [ ] (`fidelidad-contacto.spec.ts:132`)
- C4 verificación real: test por módulo [x]; `bin/harness test` todo verde [ ] (1 fallido)
- C5 sesión cerrada: sin ficheros sin trackear sospechosos [ ] (`progress/rediseno/capturas/codex_*.png`, ajenos a esta feature); `history.md` (n/a, sesión abierta); estado de la feature correcto [x]
- C6 contrato Gherkin: `.feature` + sección en spec [x]; `@s` medibles [x]; mapa `@s → test` fiel [ ] (@s3 desactualizado); producción sin test [ ] (`.accionesUrgencia`)
- C7 mutación: pendiente (corre tras el judge) [ ]

## Cambios requeridos

1. Quitar el `throw` de `tests/e2e/fidelidad-contacto.spec.ts:132`; corregir
   `src/paginasSeo.test.tsx:88-90` para leer los dígitos del número visible del grupo
   (`within(grupo).getByText(/\d{2} \d{3} \d{2} \d{2}/)`) o del `href` del enlace, citando
   la enmienda de @s5/@s6 en el propio test. `pnpm run lint` y `bash bin/harness init`
   en verde antes de volver a pedir judge.
2. Rehacer la banda de urgencias con test rojo primero (e2e @s3 + `?raw`): rótulo y
   número apilados a la izquierda, píldora a la derecha, una sola fila a 1440.
   Sugerencia: `fieldset { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: espaciado(4) espaciado(16) }`,
   `legend` y `p` en la columna 1 (filas 1 y 2), `a { grid-row: 1 / span 2; grid-column: 2 }`;
   píldora en `paso-tipografico(0)`/700 sin `--fuente-titulares`, `min-height: $altura-control-media`;
   número en `--fuente-titulares`/`paso-tipografico(2)`. Retirar `.accionesUrgencia`
   (`display: contents` + `margin-inline-start: auto`) o convertirla en lo anterior; actualizar
   el comentario `:194-197`. Aserciones e2e: `cajaNumero.y > cajaRotulo.y`, `cajaNumero.x` = `cajaRotulo.x` ±1,
   píldora a la derecha del número, altura de banda ≤ altura de píldora + 2·espaciado(24),
   `font-size` de la píldora < la del número.
3. Reconstruir `progress/fidelidad/enmiendas_fidelidad_contacto.md` con los bloques
   literales antes/después de las 6 enmiendas anteriores (antes = `git show HEAD:features/informacion_contacto.feature`,
   `git show HEAD:features/datos_negocio.feature`, `git show HEAD:src/components/InformacionContacto.test.tsx`
   líneas 842-856; después = árbol de trabajo) y añadir la Enmienda 7 (@s5/@s6) con el
   Gherkin literal; poner la nota «# ENMENDADO el 03/09/2026…» sobre @s5 y @s6 en
   `features/informacion_contacto.feature`. Si la decisión de honrar «Llamar ahora»
   la tomó el lead, dejarlo escrito ahí (quién y cuándo).
4. Actualizar `progress/tdd_fidelidad_contacto.md`: trazabilidad @s3, ciclos del cambio
   (rojo → verde → refactor), evidencia nueva (`pnpm run test` completo, e2e 5/5,
   CSS servido) y veredicto visual; regenerar la captura con
   `node tools/captura-comparativa.mjs fidelidad_contacto --sin-build` tras el build y
   mirarla.
5. Renombrar los tests de `InformacionContacto.test.tsx:101` y `fidelidad-contacto.spec.ts:109`
   para que digan lo que afirman.
6. Menores 6-9: variable `--hueco-contacto` en `Landing.module.scss`; retirar
   `data-contenedor-principal` de `FormularioContacto.tsx:65, 87`; regex de `:156` a partir
   de `SUBPATH_DE_PRODUCCION`; alinear `docs/mapa-estatico.md` con 43,53 % / 50,06 %.
