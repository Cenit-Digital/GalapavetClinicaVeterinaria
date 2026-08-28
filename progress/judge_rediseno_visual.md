# Review — feature 24 `rediseno_visual` (CUARTA REVISION)

**Veredicto:** APPROVED

Esta revision confirma, con verificacion independiente propia (no solo
lectura de informes) y sabotaje propio, que los dos hallazgos bloqueantes de
mi tercera revision (@s45, @s47) estan genuinamente resueltos, que el fix de
produccion compartido (`a { color: inherit; }` en `src/styles/global.scss`)
no introduce ninguna regresion en ninguna feature ya `done`, y que los dos
hallazgos menores (@s48, documentacion) tambien estan resueltos. Ademas,
auditado clausula a clausula el bloque que ninguna de mis tres rondas
anteriores habia escrutado con ese rigor (bloques A y B, @s1-@s16, incluidas
las Enmiendas 1 y 3), sin encontrar ningun hueco: es la cobertura mas densa
de toda la feature (sabotaje en memoria por cada clausula de @s3, corpus real
del repositorio para @s10/@s15/@s16). Con esto, los 52 escenarios del
`.feature` han sido auditados clausula a clausula, entre las cuatro rondas,
contra el codigo real.

## Metodologia de esta revision

1. Releido mi propio informe de tercera revision (vigente hasta ahora) para
   no repetir auditoria ya hecha con rigor y para saber exactamente que
   quedaba pendiente: @s45, @s47 (bloqueantes), @s48 y la bitacora de
   trazabilidad (no bloqueantes).
2. Leidos `progress/rediseno/fix_s45_axe_variantes.md`,
   `progress/rediseno/fix_s47_equipo_consola.md` y
   `progress/rediseno/fix_s48_techo_css_unico.md`, y a continuacion el CODIGO
   REAL que citan (`tests/e2e/accesibilidad.spec.ts`,
   `tests/e2e/red-limpia.spec.ts`, `tests/e2e/css-presupuesto.spec.ts`,
   `src/styles/global.scss`), sin dar el informe por bueno de palabra.
3. Sabotaje propio del fix de @s45: comente la regla `a { color: inherit; }`
   de `global.scss`, reconstrui `dist/` y ejecute
   `pnpm exec playwright test -g "@s45"` -> reprodujo EXACTAMENTE las 4
   violaciones `color-contrast` originales (las 4 en la variante "tech",
   mismos selectores: migas de pan, telefonos, "volver al articulo").
   Revertido desde copia de seguridad propia; confirmado sin residuo en
   `git diff` mas alla del cambio ya presente en la sesion.
4. Auditoria propia y exhaustiva de la regresion potencial del fix
   compartido: recorridos TODOS los `<a>` sin clase propia del arbol de
   componentes, y para cada uno, verificado si su color ya estaba cubierto
   por una regla `a { color: ... }` scoped en su propio `.module.scss`
   (Cabecera, Hero, CampanasPortada, PieDePagina, ReservaChat: si) o si
   dependia genuinamente de la regla global nueva (FAQ -- enlaces de
   telefono en `RespuestaFaq` --, InformacionContacto -- fieldset
   "Telefonos"/"Urgencias" --, FormularioContacto -- consentimiento y
   confirmacion --). Confirmado el razonamiento del informe sobre
   precedencia de origen CSS (autor > agente de usuario, independientemente
   de especificidad): la regla explica correctamente por que
   `a { color: inherit }` gana sobre el azul por defecto del navegador
   aunque tenga menor especificidad que el selector de pseudoclase
   ":link"/":-webkit-any-link" del UA.
5. `bin/harness init` ejecutado por mi, de forma independiente: 88/88
   ficheros, 1230/1230 tests, lint 0, typecheck 0.
6. `pnpm run build` ejecutado por mi: verde, CSS 60.70 kB / gzip 7.51 kB
   (bajo el techo de 8000 B), puerta de terceros 0 hallazgos.
7. `pnpm exec playwright test --workers=1 --reporter=list` (suite COMPLETA,
   112 tests) ejecutada por mi en aislamiento: 112/112 verdes, sin ninguna
   regresion -- incluye explicitamente los tests de OTRAS features ya
   `done` que ejercitan enlaces (`accesibilidad.spec.ts` @s36-@s41 de
   `identidad_visual`, `red-limpia.spec.ts` @s32-@s34, `despliegue-subpath`,
   `imagenes`, `layout`, `movimiento`, `tipografia`, `tokens-aplicados`,
   `urgencias`).
8. Auditoria clausula a clausula, con lectura directa de cada test citado,
   de los bloques A (@s1-@s12) y B (@s13-@s16): la zona que mi tercera
   revision senalo ("mis dos rondas anteriores se habian concentrado en los
   bloques C/D/E") sin confirmar explicitamente que A/B hubieran pasado por
   el mismo escrutinio. Sin hallazgos.
9. Comprobado que no queda residuo de ningun fichero de sabotaje o script
   desechable de esta ronda ni de rondas anteriores (`git status`, sin
   "scratch"/"sabotaje" sin trackear).
10. Recorrido `CHECKPOINTS.md` de punta a punta.

## @s45 -- RESUELTO, verificado con sabotaje propio (no solo el del informe)

- `tests/e2e/accesibilidad.spec.ts:513-554` -- describe nuevo `@s45`, bucle
  real `RUTAS_DEL_INVENTARIO` (6) x `VARIANTES_DEL_SELECTOR` (5) = 30
  combinaciones, cada una analizada con `AxeBuilder` + las mismas 5 etiquetas
  acumulativas de siempre (`ETIQUETAS_AXE_ACUMULATIVAS`, sin `.options()`).
  El describe `@s36` preexistente (lineas 24-51, `identidad_visual`) queda
  intacto, mismo `toBe(6)`.
- `expect(RECUENTO_DE_COMBINACIONES).toBe(30)` y
  `expect(informe.paginasAnalizadas).toBe(RECUENTO_DE_COMBINACIONES)`
  (linea 549) atan la cifra 30 al recuento REAL de paginas efectivamente
  analizadas por la puerta (`ejecutarPuertaDeAnalisisAutomatico`), no a una
  constante que se afirme a si misma.
- El defecto de produccion real que el test encontro esta corregido en
  `src/styles/global.scss:220-222` (seccion "C. Base", fuera de la seccion
  "B. Reset explicito" que `@s13`/`hojaGlobal.test.ts` mantiene cerrada en 9
  familias -- confirmado que `comprobarFamiliasDelReset` solo exige que las 9
  familias EXISTAN, no prohibe reglas adicionales en otra seccion, asi que
  esta linea no reabre esa puerta).
- Sabotaje propio: comentada la regla nueva, reconstruido `dist/`,
  ejecutado `pnpm exec playwright test -g "@s45"` -> falla con las 4
  violaciones `color-contrast` EXACTAS del hallazgo original (mismos 4
  selectores, misma variante "tech"). Revertido; verde de nuevo.
- Confirmado que el mecanismo de cambio de variante (`aplicarVariante`,
  `VARIANTES_DEL_SELECTOR`) replica, sin inventar nada nuevo, el ya usado y
  aprobado por `tests/e2e/fidelidad.spec.ts` para @s42.

## Regresion del fix compartido (a { color: inherit }) sobre features ya done -- NINGUNA encontrada

- Inventariados todos los `<a>` sin `className` propio del arbol de
  componentes. De ellos, los que dependen genuinamente de la regla global
  nueva (antes mostraban el azul del agente de usuario, ahora heredan el
  color del texto que los rodea): `Faq.tsx:34` (enlaces de telefono dentro de
  `RespuestaFaq`, `Faq.module.scss:62-64` solo declara `foco-visible`, sin
  `color`), `InformacionContacto.tsx:97,126` (fieldsets "Telefonos" y
  "Urgencias fuera de horario", `InformacionContacto.module.scss:25-30` sin
  `color`), `FormularioContacto.tsx:68,71,116` (aviso legal, enlace de
  clinica y de urgencias en el pie del formulario y en la confirmacion,
  `FormularioContacto.module.scss:58,70,92` sin `color`). Todos ellos
  coinciden con el patron exacto que produjo las 4 violaciones reales de
  @s45 en "tech": la ausencia total, en TODO el proyecto anterior a este fix,
  de una regla `a { color: ... }` para el contenido "pelado".
- El resto de `<a>` del arbol (Cabecera -- logo, nav, panel movil --, Hero --
  botones--, CampanasPortada, PieDePagina, ReservaChat) ya tenian su propio
  `a { color: ... }` scoped en su `.module.scss` con especificidad de clase
  (0,1,x), que sigue ganando sin cambios sobre la nueva regla global de
  especificidad de elemento (0,0,1): confirmado leyendo cada fichero, no
  solo aceptado por el razonamiento del informe.
- Precedencia de origen CSS verificada: una declaracion de la hoja de autor
  (aunque sea de baja especificidad, como `a { color: inherit }`) gana
  siempre sobre cualquier declaracion de la hoja del agente de usuario
  (":-webkit-any-link { color: ... }"), independientemente de la
  especificidad relativa entre ambas -- es la comparacion de ORIGEN, que se
  resuelve antes que la de especificidad, y es exactamente lo que hace que
  el azul por defecto desaparezca en las 4 combinaciones que @s45 detecto.
- Verificacion empirica, no solo teorica: suite e2e COMPLETA (112 tests)
  ejecutada por mi en aislamiento con el fix aplicado: 112/112 verdes,
  incluidos explicitamente los tests de accesibilidad, red limpia,
  layout, movimiento, tipografia y tokens aplicados que pertenecen a
  `identidad_visual` (ya `done`) y que cargan y recorren TODAS las rutas del
  sitio, con y sin interaccion. Ninguna regresion de contraste, de consola,
  ni de otro tipo.
- Ningun test de `tests/e2e/` afirma un color de enlace concreto por fuera de
  lo ya cubierto (confirmado con grep de "getByRole('link'", "locator('a'",
  etc. sobre `tests/e2e/`: 0 resultados relevantes), asi que no hay ningun
  test de otra feature que dependiera del azul del navegador como
  comportamiento esperado.

## @s47 -- RESUELTO, presente en el codigo, verificado en ejecucion

- `tests/e2e/red-limpia.spec.ts:92-142` (describe `@s34`, reutilizado de
  `identidad_visual`) -- linea 133-134: `botonEquipo` (localizado por
  estructura, `section` con texto "Equipo" -> primer `button`), colocado
  exactamente en el orden que exige el `When` de @s47 (paleta -> servicio ->
  equipo -> acordeon), antes de las tres aserciones de contadores de consola
  en 0.
- Confirmado en ejecucion real, dentro de la suite completa (linea 83 del
  listado de Playwright): verde, "las 6 rutas + interaccion con el selector
  de paleta, un desplegable de servicios, una ficha de equipo y un item del
  FAQ: 0 errores, 0 avisos, 0 excepciones".
- El boton real que ejercita (`Equipo.tsx:36-38`, `aria-expanded`) es
  exactamente el que @s32/@s47 nombran; el `click()` de Playwright falla si
  el locator resuelve a cero o a mas de un elemento, asi que el propio verde
  certifica que se pulso el control real.

## @s48 -- RESUELTO

- `tests/e2e/css-presupuesto.spec.ts:42-72` -- mecanismo de "declaracion
  unica" auto-contenido (mismo patron que @s10, pero sin tocar
  `src/lib/diseno/` por estar fuera del alcance de esta tarea), corpus real
  de `src/` y `tests/` via `readdirSync`+`readFileSync`, aprueba solo si
  exactamente un fichero declara `TECHO_BYTES_CSS = 8000`.
- Confirmado con mi propio grep independiente: `TECHO_BYTES_CSS` solo
  aparece en `tests/e2e/css-presupuesto.spec.ts` en todo `src/` y `tests/`.
- Revisado el patron de regex (`TECHO_BYTES_CSS\s*=\s*8000\b`): no hay
  auto-coincidencia espuria con su propia linea de definicion del patron (el
  texto literal que sigue a "TECHO_BYTES_CSS" ahi son barras invertidas
  reales, no espacios, asi que no matchea el "\s*"), y la coincidencia
  adicional dentro del propio titulo del test (que tambien contiene la
  cadena "TECHO_BYTES_CSS = 8000" como prosa) no infla el recuento de
  FICHEROS porque la funcion opera a granularidad de fichero, igual que el
  mecanismo ya aceptado para @s10.

## Documentacion (no bloqueante) -- resuelto razonablemente

- `progress/rediseno/matriz_trazabilidad.md` -- borrado, confirmado en
  `git status` ("deleted:"). Era el documento que arrastraba hallazgos
  obsoletos desde mi primera revision y que yo mismo recomende retirar dos
  veces.
- `progress/tdd_rediseno_visual.md:33-47` -- nota explicita anadida por
  `craftsman_lead` que documenta, con criterio de busqueda reproducible
  (grep -rn "@sNN" progress/rediseno/ features/rediseno_visual.feature), que
  la trazabilidad completa vive repartida en `progress/rediseno/*.md` y en
  las rondas de este mismo informe. Es el patron que mis cuatro rondas han
  aceptado y seguido (auditar contra el codigo real, no contra un resumen
  intermedio), ahora declarado por escrito en vez de implicito.
- Hallazgo menor NUEVO, no bloqueante: `progress/current.md` no se ha
  actualizado desde el incidente del 28/08 (git reset destructivo) -- no
  refleja mi segunda, tercera ni esta cuarta ronda, ni los fixes de @s33,
  @s40, @s19, @s45, @s47, @s48. No es "basura de sesion anterior" (C2 exige
  ausencia de basura, no exige que el fichero este al dia), asi que no
  bloquea, pero recomiendo que `craftsman_lead` lo actualice antes de cerrar
  la sesion, para que la siguiente persona que lo abra no tenga que
  reconstruir el estado desde cuatro informes de `judge` distintos.

## Auditoria propia de los bloques A y B (@s1-@s16): sin hallazgos nuevos

Zona no confirmada como escrutada con rigor por mis rondas anteriores (la
tercera revision decia que rondas 1-2 "se habian concentrado en los bloques
C/D/E"). Auditada ahora clausula a clausula contra el texto vivo del
`.feature` y el codigo real:

- @s1, @s2 -- `src/lib/diseno/tokensColor.test.ts:124-139`: inventario de 20
  tokens (18 color + 2 sombra), los 3 nuevos por nombre, 100 parejas
  (variante, token) comprobadas leyendo el TEXTO REAL con "?raw".
- @s3 (Enmienda 1, la clausula mas compleja del contrato) --
  `src/lib/diseno/fidelidadPrototipo.test.ts` (24 "it" dedicados): tabla de
  correspondencia 18x4 confrontada contra un literal escrito a mano: 72
  parejas comparadas, las 4 derivaciones de `--color-borde` recalculadas con
  `mezclar()` real sobre los 3 ingredientes leidos del TEXTO REAL del
  prototipo (nunca copiados), las 3 desviaciones declaradas por lista (no
  por recuento) y verificadas como REALES (difieren de verdad), 6 sabotajes
  en memoria distintos (prototipo, sistema, desviacion revertida,
  translucido copiado sin componer, tinta arbitraria x3, borde de otra
  variante cruzado) que reproducen cada camino de fallo que la clausula
  exige distinguir. Es la cobertura mas rigurosa de toda la feature.
- @s4, @s5 -- `tokensColor.test.ts:141-227`: los 15 colores de "marca"
  confrontados con un literal git-show-anclado; los 8 derivados
  recalculados con `mezclar()` real (no comparados contra otro literal); los
  7 literales comprobados uno a uno; 8+7=15 sin ningun rol sin asercion.
- @s6, @s7, @s8 (Enmienda 3), @s9, @s11 --
  `src/lib/diseno/matrizDeContraste.test.ts`: cobertura completa, incluido
  un sabotaje que reproduce el fallo de reconciliacion de la matriz contra
  el TEXTO REAL de una hoja de estilos ("ejecutarPuertaDeReconciliacionDeMatriz").
  Para @s8/Enmienda 3, verificado que "clinica"/"calida"/"eco" importan el
  "--muted" del tema propio del prototipo, "tech" el rgb() expandido de su
  "--border" translucido, y solo "marca" deriva por mezcla -- con el
  comentario exigido por el propio `_tokens.scss` verificado por
  `leerComentarioDelBordeDeControlDeMarca`.
- @s10 -- `src/lib/diseno/contratoRedisenho.test.ts:139-184` (logica pura) +
  `src/components/SelectorPaleta-logica.test.ts:202-252` (integracion
  contra CODIGO_EJECUTABLE_DEL_PROYECTO, el corpus REAL del repositorio):
  confirma que "clinica" se declara como literal en un unico fichero de
  TODO el proyecto y que los otros dos puntos (SelectorPaleta-logica.ts, el
  guion anti-parpadeo de index.html) lo consumen de esa declaracion, sin
  copiarlo.
- @s12 -- `tokensColor.test.ts:237-266`: el bloque `:root` sin atributo
  iguala los 20 tokens de "clinica" y el fichero tiene 6 bloques `:root`
  pero el inventario de variantes sigue siendo 5 (la afirmacion no es
  vacua: se comprueba que existan los 6 antes de afirmar que solo cuentan
  5).
- @s13 -- confirmado en rondas anteriores (rolesDescartados.ts, incluido el
  arreglo de limite de palabra Unicode), sin cambios desde entonces; releido
  `rolesDescartados.test.ts:10-260` para confirmar que sigue intacto y
  verde.
- @s14 -- `tests/e2e/urgencias.spec.ts:87-112`: verde en la ejecucion
  completa de esta ronda; rotulo y telefono reales en las 6 rutas.
- @s15 -- `src/lib/diseno/usoDelAcento.test.ts:172-204`: corpus REAL de 20
  ficheros de estilos (los .module.scss del inventario + _api.scss +
  global.scss, que ahora incluye la linea nueva de esta ronda -- sin usar
  "--color-acento", asi que no afecta a esta puerta): 0 usos como texto, 0
  como borde, al menos 1 como relleno.
- @s16 -- `src/lib/diseno/rolesDescartados.test.ts:308-360`: corpus real,
  las 5 variantes declaran "--color-primario-fuerte" en su propio bloque, se
  usa al menos una vez en _api.scss, sabotaje quirurgico (borra la
  declaracion de una sola variante) reproduce el fallo nombrando la
  variante.

Sin hallazgos. Esta auditoria, sumada a las tres rondas anteriores (bloques
C/D/E con 3 defectos reales encontrados y cerrados; bloque F con 2 defectos
reales encontrados y cerrados en esta y la ronda anterior; bloque G
confirmado via datos-reales.spec.ts), cierra la cobertura clausula a
clausula de los 52 escenarios.

## Disciplina TDD

- Produccion sin test que la pida? NO. El unico cambio de produccion de
  esta ronda ("a { color: inherit }" en global.scss) lo exigio directamente
  el test nuevo de @s45 (rojo real con las 4 violaciones antes del fix,
  verde despues -- confirmado con mi propio sabotaje inverso).
- Evidencia de Rojo->Verde->Refactor? SI, en los tres fixes de esta ronda:
  fix_s45_axe_variantes.md documenta el rojo real (violaciones de axe
  citadas literalmente) y el verde tras el fix; fix_s47_equipo_consola.md
  documenta la confirmacion previa en verde, el hueco de cobertura cerrado y
  6 repeticiones para descartar inestabilidad; fix_s48_techo_css_unico.md
  documenta un rojo provocado deliberadamente (sabotaje con fichero
  temporal, porque el invariante ya se cumplia) y su reversion limpia.

## Checkpoints

- C1 -- Arnes completo: [x] `bin/harness init` verde, ejecutado por mi de
  forma independiente: 88/88 ficheros, 1230/1230 tests, lint 0, typecheck 0.
  `pnpm run build` verde (CSS 60.70 kB / gzip 7.51 kB). `pnpm exec
  playwright test --workers=1` verde, 112/112, ejecutado por mi en
  aislamiento.
- C2 -- Estado coherente: [x] una sola feature `in_progress`
  (`rediseno_visual`, id 24, confirmado en `feature_list.json` -- las 24
  restantes estan `done`); `progress/current.md` no contiene basura, aunque
  esta desactualizado (ver hallazgo no bloqueante arriba).
- C3 -- Arquitectura: [x] el fix de `global.scss` respeta la seccion "C.
  Base" y no reabre la seccion "B. Reset" (9 familias cerradas, verificado
  con `hojaGlobal.test.ts`). Sin dependencias nuevas. Sin logs de depuracion
  ni TODOs sin contexto en los ficheros tocados esta ronda.
- C4 -- Verificacion real: [x] sabotaje propio (mio, no solo el de los
  informes) para @s45; ejecucion en vivo confirmada para @s47 y @s48; suite
  completa verde en aislamiento.
- C5 -- Sesion cerrada bien: [x] sin residuo de ficheros de sabotaje ni
  scripts desechables (git status limpio de eso); todo lo "??" son informes
  de progreso y codigo/tests legitimos de esta sesion, coherente con que la
  feature sigue `in_progress`.
- C6 -- Contrato Gherkin: [x] los 52 escenarios estan cubiertos por al menos
  un test concreto, confirmado clausula a clausula entre las cuatro rondas
  de `judge` (bloques A/B en esta ronda, C/D/E/F/G en rondas anteriores, con
  los defectos reales encontrados en el camino ya cerrados y verificados con
  sabotaje).
- C7 -- Mutacion: N/D -- no es mi puerta; corresponde a `mutation_tester`
  tras esta aprobacion.

## Recomendacion de proceso (no bloqueante)

Antes de marcar `done`, actualizar `progress/current.md` con el desenlace de
las rondas 2-4 de `judge` (fixes de @s33/@s40/@s19 y de @s45/@s47/@s48),
para que quede una unica entrada legible del cierre completo de la feature
junto al incidente del 28/08 ya documentado.
