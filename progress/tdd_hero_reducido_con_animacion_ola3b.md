# TDD feature 48 `hero_reducido_con_animacion` — ola 3b: comentarios que han quedado falsos

Alcance: SOLO comentarios. Ninguna línea de código ejecutable, selector, valor ni nombre de test ha cambiado.
No hay ciclo Rojo-Verde-Refactor en esta ola (no se escribe producción ni test): es una limpieza de documentación
dentro del código, verificada con las puertas existentes.

## 1. Comentarios reescritos (antes -> después, una línea cada uno)

| Fichero | Antes | Después |
| --- | --- | --- |
| `src/components/ReservaChat.module.scss` (sobre `.acciones`) | «Misma altura para las dos, como la fila de acciones del Hero (`Hero.module.scss`, `.acciones a`).» (el hero ya no tiene fila de dos botones) | «Misma altura para las dos: `boton-primario` trae la grande y `boton-fantasma` la media, así que la de contorno se iguala abajo.» (verificado en `_api.scss`: `$altura-control-grande` frente a `$altura-control-media`) |
| `src/components/Equipo.module.scss` (`.cabecera`) | «del mismo tipo que `Faq.module.scss` (860px) o `Hero.module.scss` (720px)» | «del mismo tipo que el de `Faq.module.scss` (860px, `.faq`)» (el 720 px que quedaba en el hero es el ancho del titular, no una medida de composición de sección; no se cita) |
| `src/components/Equipo.module.scss` (`.cabecera .eyebrow`) | «sin la excepción de la Enmienda 2 (solo del Hero)» (daba a entender que la excepción sigue viva) | «sin excepción de color: la de la Enmienda 2 (un cintillo propio del Hero) la derogó la feature 48, que lo retiró» (coincide con lo que ya dicen `Equipo.test.tsx` y `Servicios.test.tsx`) |
| `src/pages/PaginaTienda.module.scss` (`.cintillo`) | «mismo mecanismo que "Hero.module.scss:55-59" y "ReservaChat.module.scss:33-34"» (el hero ya no tiene cintillo; las dos citas eran por número de línea y la de ReservaChat tampoco apuntaba ya a su sitio) | «mismo mecanismo (el mixin "eyebrow" de `_api.scss`) que `.informacion .eyebrow` de "ReservaChat.module.scss"» |
| `src/pages/PaginaCampanas.module.scss` (`.cintillo`) | «mismo mecanismo que "PaginaTienda.module.scss" y "Hero.module.scss".» | «mismo mecanismo (el mixin "eyebrow" de `_api.scss`) que "PaginaTienda.module.scss".» |
| `src/lib/diseno/contratoRedisenho.ts` (JSDoc de `declaraElIdentificadorComoLiteral`) | «(`src/components/Hero.tsx:48`)» | «(la imagen de `src/components/Hero.tsx` es ese caso)» |
| `src/lib/diseno/contratoRedisenho.test.ts` (@s10, caso `imagen.ts`) | «(`src/components/Hero.tsx:48` es exactamente este caso)» | «(la imagen de `src/components/Hero.tsx` es exactamente este caso)» |
| `src/lib/diseno/movimientoRespetuoso.test.ts` (JSDoc de `HOJAS_REALES_DEL_INVENTARIO`) | «LAS GUARDAS "MAYOR QUE 0" ... NO están aquí todavía: hoy ninguna hoja real declara la animación del hero y esas guardas no pueden pasar sin la hoja de la ola 2» (FALSO: la ola 2 está hecha y el `it` de debajo ya las afirma) | «... SÍ están, en el test de abajo: la hoja del hero declara su entrada animada desde la feature 48 ... Sin ellas la puerta daría el verde por vacuidad si alguien retirara la animación» |
| `tests/e2e/geometria-escalas.spec.ts` (cabecera) | «(Hero/Faq y Cabecera respectivamente)» | «(Faq y Cabecera respectivamente; desde la feature 48 @s18 ya no incluye el hero)» (el @s18 de `rediseno_visual` quedó solo con el FAQ) |
| `tests/e2e/geometria-escalas.spec.ts` (@s20) | «paso 5 (h1 de portada, `Hero.module.scss:66`)» | «paso 5 (h1 de portada, `Hero.module.scss`, `.contenido h1`)» |
| `tests/e2e/geometria-escalas.spec.ts` (@s22) | «que declara el suyo propio en `Hero.module.scss:69` (`line-height: 1.05;`,» | «que declara el suyo propio en `Hero.module.scss` (`.contenido h1`, `line-height: 1.05;`,» |
| `tests/e2e/fidelidad.spec.ts` (JSDoc de `urlsDeFondoDeLaBienvenida`) | «(`Hero.module.scss:23-31`:» | «(`Hero.module.scss`, `.hero > img`:» |
| `tests/e2e/imagenes.spec.ts` (imagen de cubierta) | «cuya altura la fija el contenido (`min-height` fluido, `fidelidad_hero` @s2)» (describía el `clamp(560px, 84svh, 784px)` retirado) | «cuya altura la fijan la ventana y el contenido (`min-height: 100svh`, `hero_reducido_con_animacion` @s12)» |

13 comentarios en 10 ficheros. Ningún comentario nuevo contiene número de línea, color literal, cifra de nueve dígitos,
palabra de regla de movimiento, ni `clinica` entre comillas o acentos graves (la puerta @s10 de `contratoRedisenho`
cuenta declaraciones literales de ese identificador y habría contado mi comentario).

## 2. Comprobación mecánica de «solo comentarios»

Por fichero, `git diff -U0 -- <ruta>` filtrado: toda línea `+`/`-` casa con `^[+-]\s*(//|/\*|\*|\*/|$)`. Resultado: ninguna
línea que no sea comentario en los 10 ficheros. Recuento `+/-` por fichero: ReservaChat 2/2, Equipo 6/5, PaginaTienda 2/2,
PaginaCampanas 1/1, contratoRedisenho.ts 1/1, contratoRedisenho.test.ts 1/1, movimientoRespetuoso.test.ts 4/4,
geometria-escalas 4/4, fidelidad.spec 1/1, imagenes.spec 3/3. Los bloques reescritos conservan su número de líneas salvo
Equipo (un comentario ganó una línea; no lo cita nadie por número) para no desplazar las citas por línea que otros
ficheros hacen a `contratoRedisenho.ts`, `fidelidad.spec.ts` y `PaginaCampanas.module.scss`.

## 3. Estado de las puertas (MEDIDO en esta sesión)

- Línea base ANTES de editar: `vitest run src/lib src/styles` -> 42 ficheros, 881 tests, verde.
- Tras editar: `vitest run src/lib src/styles src/components/ReservaChat.test.tsx src/components/Equipo.test.tsx src/pages` -> 51 ficheros, 1211 tests, verde.
- `pnpm run lint` (oxlint --deny-warnings): salida 0. `pnpm run typecheck` (tsc -b): salida 0. `pnpm exec tsc -p tsconfig.e2e.json --noEmit`: salida 0.
- `pnpm test` completo, SEGUNDA ejecución: 90 ficheros, 1748 tests, verde.
- `pnpm test` completo, PRIMERA ejecución: 89 ficheros verdes y 1 rojo, `src/accesibilidad-teclado.test.tsx` (5 fallos: el
  tabulador acababa en `body`). Ese fichero NO es mío ni lo toca ningún cambio de esta ola (solo comentarios, y ese test no lee
  ninguno de los ficheros editados). Repetido solo: 5/5 verdes; repetido dentro de la suite completa: verde. Lo atribuyo a
  carga de la máquina (el otro agente medía el LCP en paralelo), pero no he podido demostrar la causa: queda como intermitencia
  observada, no explicada. Si reaparece en el cierre, conviene investigarlo aparte.
- No se ha ejecutado Playwright, `pnpm run build` ni Stryker. Ningún proceso mío escucha en 4173 (comprobado con `netstat` al terminar: libre); sin procesos node míos abiertos.
- Los tres specs de `tests/e2e` editados (`fidelidad.spec.ts`, `imagenes.spec.ts`, `geometria-escalas.spec.ts`) no se han
  ejecutado en navegador (solo comentarios); sí pasan `tsc -p tsconfig.e2e.json` y la comprobación estática de
  `medicionEstableSpecsReales.test.ts` (lee el texto de TODOS los `tests/e2e/*.spec.ts`, comentarios incluidos).

## 4. Revisado y CONSERVADO (cierto hoy o histórico explícito)

- `Hero.module.scss` y `Hero.tsx`: no se tocan (`accesibilidad-movimiento` nombra hoja y línea del bloque del hero, y son de las olas 1-2). El `width: min(100%, 720px)` del titular sigue ahí y su comentario es cierto.
- `matrizDeContraste.ts` (filas del anillo de foco del hero: `.acciones a` bajo `&:focus-visible` sigue existiendo, y ya dice «desde la feature 48 es el único del hero»), `matrizDeContraste.test.ts` (relato histórico fechado), `global.scss` y `hoja-global.test.ts` (el velo oscuro `--color-tinta` del hero sigue existiendo), `Galeria.test.tsx`, `Faq.test.tsx`, `Equipo.test.tsx`, `Servicios.test.tsx`, `tipografia.spec.ts`, `fidelidad-hero.spec.ts`, `movimiento.spec.ts`, `hero-entrada-cls.spec.ts`, `entrada-del-hero.ts`, `accesibilidad.spec.ts`: ya reescritos por las olas 1-2 y ciertos.
- `imagenes.spec.ts` «Las rutas de subpágina no tienen imagen hero» y `usoDelAcento.test.ts` (lista de hojas): ciertos.
- `PLAN_DE_CONVERGENCIA.md` («el 26/08/2026 se contrastaron...»): documento fechado, es historia.
- `docs/contrato-heredado/*`, `docs/diseno-claude-design/*` (incluida la fila `Hero (landing) | WebEmpresa: src/components/Hero.module.scss` de `github.md`, que apunta al repo WebEmpresa y no a este), `.memoria-cache/*`, `reports/*`: históricos o ajenos.
- `AGENTS.md`, `README.md`, `docs/*.md` propios (workflow, tdd, architecture, conventions...): no mencionan el hero ni nada de lo retirado (las coincidencias de «hero» eran «fichero»).
- `feature_list.json`, `features/`, `progress/`, `project-spec.md`: fuera de alcance por instrucción.
- Las menciones a `Hero-logica`, `digitosDe`, `extraerFragmento`, `clamp(560px, 84svh, 784px)`, la regla de 560 px, la píldora, el botón de llamada, la franja y las cifras que quedan en `Hero.test.tsx` y `hero-reducido.spec.ts` son las pruebas de que se retiraron (ya cuentan por qué).

## 5. Observado y NO tocado (fuera de alcance: no lo causa la feature 48)

- `src/components/Hero.test.tsx`, comentario del `it` de contraste de @s29: «El h1 y el párrafo heredan la tinta de ".hero" con "color: inherit"». Solo el `h1` hace `color: inherit`; el párrafo (`.subtitulo`) declara `color-mix(... 90% ...)`. Es anterior a la 48 (la regla ya era así) y afecta a lo que mide ese test, no a algo retirado. Lo dejo al lead.
- Citas por número de línea que no son del hero y siguen en el repo: `_api.scss:28-37`, `_api.scss:281-282`, `_api.scss:330-331`, `_api.scss:246-255`, `_api.scss:75`, `_api.scss:133` y `Servicios.module.scss:52`, `FormularioContacto.module.scss:31-33`, `PieDePagina.module.scss:12 + :42-43` (en `matrizDeContraste.ts`, `geometria-escalas.spec.ts`, `Faq.test.tsx`), `global.scss:122/176/178`, `Landing.tsx:58-60` (en `Equipo.test.tsx`), `contratoRedisenho.ts:1/14-16/24/26`, `fidelidadPrototipo.ts:*`, `fidelidad.spec.ts:33-39 / 57-64` (en `accesibilidad.spec.ts`). No bloquean y ninguna depende de la 48; el repo dice citar por nombre.
- `geometria-escalas.spec.ts` cita `PaginaCampanas.module.scss:14` como el h2 «Datos pendientes de confirmar»: la línea 14 de esa hoja es hoy una declaración del `h1`. Estaba así antes de esta ola (no cambié el número de líneas de esa hoja); es una cita por línea ya desplazada por otra feature.

## 6. Ficheros tocados

`src/components/ReservaChat.module.scss`, `src/components/Equipo.module.scss`, `src/pages/PaginaTienda.module.scss`,
`src/pages/PaginaCampanas.module.scss`, `src/lib/diseno/contratoRedisenho.ts`, `src/lib/diseno/contratoRedisenho.test.ts`,
`src/lib/diseno/movimientoRespetuoso.test.ts`, `tests/e2e/geometria-escalas.spec.ts`, `tests/e2e/fidelidad.spec.ts`,
`tests/e2e/imagenes.spec.ts`, y este informe.

Ficheros que aparecen modificados o sin seguimiento en el árbol y NO son de esta ola (no meterlos en el commit de la 3b):
`features/identidad_visual.feature`, `project-spec.md` (modificados), `progress/tdd_hero_reducido_con_animacion_ola3a.md`,
`progress/lcp_hero_despues_20261014.md` y `tests/e2e/lcp-hero.spec.ts` (sin seguimiento; los dos últimos del otro agente).

## 7. Desvíos del contrato

Ninguno: la ola no toca comportamiento. Nada que dependa de documentación oficial.
