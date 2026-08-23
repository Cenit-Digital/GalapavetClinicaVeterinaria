# Review — feature accesibilidad (id 19)

**Veredicto:** CHANGES_REQUESTED

> Ronda 1 de judge. Revision escenario por escenario contra el codigo real
> (no solo contra progress/tdd_accesibilidad.md), con 9 tandas de sabotaje
> manual propio e independiente del que documento tdd_craftsman (revertidas
> sin resto en todos los casos; pnpm run test confirmado en 667/667 antes y
> despues de cada tanda).

## Sabotaje manual propio (independiente del de tdd_craftsman)

Repetido en vivo, uno a uno, con revert inmediato y pnpm exec vitest run
antes/despues de cada uno:

1. INVENTARIO_DE_PAGINAS (quitar "Tienda") -> @s1 rojo (length 6 vs 5), y en
   cascada @s5/@s8 tambien rojo por el mismo cambio.
2. NIVELES_DE_CONFORMIDAD_EXIGIDOS (quitar "WCAG 2.2 AA") -> @s7 rojo
   (length 5 vs 4).
3. accesibilidad-analisis.ts:90 (guarda de informes.length === CERO ->
   if false) -> @s4 rojo, cae al mensaje de @s5 (confirma cascada
   independiente, no un solo if disfrazado de tres).
4. accesibilidad-analisis.ts:97 (guarda de cargadas.length === CERO ->
   if false) -> @s5 rojo (crash en toContain con motivo undefined), igual
   que documento tdd_craftsman.
5. accesibilidad-analisis.ts:101 (guarda de reglasAplicadas === CERO ->
   if false) -> @s6 rojo (aprobado en vez de suspenso).
6. AREA_TACTIL_MINIMA_PX = 24 -> 25 en accesibilidad-areaTactil.ts:15 ->
   @s9 rojo (expected 25 to be 24).
7. accesibilidad-areaTactil.ts:88 (guarda de inventario.length ===
   CERO_CONTROLES -> if false) -> @s15 rojo.
8. RATIO_MINIMO_POR_USO["texto normal"] = 4.5 -> 4.4 en contraste.ts:84 ->
   @s28 rojo (expected 4.4 to be 4.5).
9. ejecutarPuertaDeContrasteParaUso (contraste.ts:224, guarda de
   catalogo.length === CERO_PAREJAS -> if false) -> las TRES @s33/@s35/@s36
   rojas en la misma corrida, cada una con su propio expected true to be
   false sobre su propio array vacio -- confirma que la guarda compartida
   SI cubre a las tres entradas independientes, no solo a una.

Todos revertidos sin resto; git status --short y git diff --stat tras el
ultimo revert coinciden exactamente con el estado previo a empezar (4
ficheros modificados: progress/current.md, src/components/Cabecera.tsx,
src/lib/contraste.ts +111/-0, src/lib/contraste.test.ts +144/-0, mas los 8
ficheros nuevos sin trackear).

## Cobertura de escenarios (@s <-> test)

- @s1: [x] accesibilidad-analisis.test.ts:20-36 -- ancla a literal escrito a mano, sabotaje propio 1 lo detecta
- @s2: [x] parcial -- accesibilidad-analisis.test.ts:38-48 cubre la aritmetica del veredicto (0 violaciones + 6 paginas => aprobado) en jsdom. Pendiente, declarado: la regla target-size de axe-core (navegador real, Decision 11) -- sin mock ni aproximacion jsdom que finja medirla
- @s3: [x] accesibilidad-analisis.test.ts:50-67
- @s4: [x] accesibilidad-analisis.test.ts:69-77 -- guarda independiente, sabotaje propio 3
- @s5: [x] accesibilidad-analisis.test.ts:79-92 -- guarda independiente, sabotaje propio 4
- @s6: [x] accesibilidad-analisis.test.ts:94-101 -- guarda independiente, sabotaje propio 5
- @s7: [x] accesibilidad-analisis.test.ts:103-115 -- ancla a literal escrito a mano, sabotaje propio 2 lo detecta
- @s8: [x] accesibilidad-analisis.test.ts:117-131
- @s9: [x] accesibilidad-areaTactil.test.ts:9-17 -- ancla a literal escrito a mano, sabotaje propio 6 lo detecta
- @s10: [x] accesibilidad-areaTactil.test.ts:19-39
- @s11: [x] accesibilidad-areaTactil.test.ts:41-51
- @s12: [x] accesibilidad-areaTactil.test.ts:53-62
- @s13: [x] accesibilidad-areaTactil.test.ts:64-82 (2 tests, incluida la negativa "no aplica fuera de linea")
- @s14: [x] accesibilidad-areaTactil.test.ts:84-99
- @s15: [x] accesibilidad-areaTactil.test.ts:101-109 -- guarda independiente, sabotaje propio 7
- @s16: [x] src/accesibilidad-foco.test.tsx:28-49 -- cubre foco real + activeElement + ausencia de outline en linea. Nota de calidad no bloqueante mas abajo
- @s17: [x] parcial -- src/accesibilidad-foco.test.tsx:51-57 (una sola cabecera banner, sabotaje documentado por tdd_craftsman reproducible por lectura). Pendiente, declarado: geometria real de la cabecera fija vs. el control (navegador real)
- @s18: [x] parcial -- src/accesibilidad-foco.test.tsx:59-67 (umbral 3 anclado a mano via esAptoParaUso, reutiliza contraste.ts). Pendiente, declarado: area/contraste de pixeles renderizados (navegador real)
- @s19: [x] parcial -- accesibilidad-movimiento.test.ts:15-37 (reutiliza Galeria-logica.ts/desplazamiento.ts, ya mordidos al 100%). Pendiente, declarado: animacion CSS en curso (navegador real)
- @s20: [ ] INCOMPLETO -- accesibilidad-movimiento.test.ts:39-65 cubre 3 de las 4 clausulas del Then (contenido visible, ningun bloque invisible, recuento > 0) pero la clausula "el analisis automatico de accesibilidad de esa pagina sigue devolviendo 0 violaciones" no tiene ningun test (confirmado por grep: ninguna ocurrencia de violacion/violation en accesibilidad-movimiento.ts/.test.ts) y tampoco esta documentada como pendiente de navegador real en progress/tdd_accesibilidad.md -- a diferencia de @s21/@s22, cuyas clausulas no cubiertas SI estan explicitamente listadas en la seccion "Nota adicional" (lineas 204-217 de esa bitacora). Ver Cambios requeridos.
- @s21: [x] parcial -- accesibilidad-movimiento.test.ts:75-79 (prefiereMenosMovimiento(undefined), ya mordido en galeria). Resto documentado como pendiente
- @s22: [x] parcial -- accesibilidad-movimiento.test.ts:87-109. Resto documentado como pendiente
- @s23: [x] src/accesibilidad-teclado.test.tsx:29-52 -- recorrido exhaustivo de la Landing real via querySelectorAll
- @s24: [x] src/accesibilidad-teclado.test.tsx:54-71
- @s25: [x] src/accesibilidad-teclado.test.tsx:73-90 -- produccion nueva real en src/components/Cabecera.tsx (useEffect/useRef de Escape), exigida por test rojo
- @s26: [x] src/accesibilidad-teclado.test.tsx:92-109
- @s27: [x] src/accesibilidad-teclado.test.tsx:111-137
- @s28: [x] contraste.test.ts:155-171 -- 4 literales anclados a mano, sabotaje propio 8 detecta el de texto normal
- @s29: [x] contraste.test.ts:173-184
- @s30: [x] contraste.test.ts:186-206 (3 tests, incluidas las 4 fronteras de clasificacion)
- @s31: [x] contraste.test.ts:208-220 -- nota no bloqueante: el catalogo real (tokens.ts:28) solo tiene 1 pareja de uso "componente de interfaz", asi que la clausula "distingue activo de inactivo" queda cubierta por el chequeo generico, no por una pareja explicitamente etiquetada como estado; el catalogo es propiedad de tokens_marca (ya done), fuera del alcance de esta puerta segun el propio PENDIENTE de la cabecera del .feature
- @s32: [x] contraste.test.ts:222-234
- @s33: [x] contraste.test.ts:254-262 -- guarda independiente, sabotaje propio 9 (falla junto con @s35/@s36 en la misma corrida, cada una con su propio dato de entrada)
- @s34: [x] contraste.test.ts:236-252 (2 tests)
- @s35: [x] contraste.test.ts:264-272 -- guarda independiente, sabotaje propio 9
- @s36: [x] contraste.test.ts:274-282 -- guarda independiente, sabotaje propio 9

35/36 cubiertos con test genuino y verificado por sabotaje propio donde
aplicaba. @s20 queda incompleto (ver arriba).

## Disciplina TDD

- Produccion sin test que la pida? NO -- toda la logica de decision nueva
  vive en src/lib/accesibilidad-analisis.ts, src/lib/accesibilidad-areaTactil.ts,
  src/lib/accesibilidad-movimiento.ts y la extension de src/lib/contraste.ts
  (+111 lineas, confirmado con git diff --stat), todas bajo el glob de
  mutacion de stryker.config.json (src/lib/**/*.ts). El unico cambio en un
  .tsx (src/components/Cabecera.tsx, +16/-1) es wiring de evento (Escape)
  exigido por @s25, sin rama de decision propia sobre criterios WCAG.
- Evidencia de Rojo->Verde->Refactor? SI -- la bitacora documenta 7
  sabotajes manuales con confirmacion de rojo antes de revertir; reproduje 9
  tandas de forma completamente independiente (los 4 anclas + las 7 guardas
  de vacuidad, contando la guarda compartida de contraste como una sola
  tanda que afecta a 3 escenarios), con resultado identico al documentado.

## Calidad

- src/lib/accesibilidad-analisis.ts: funciones cortas, un solo motivo de
  cambio cada una (informeVacio, ejecutarPuertaDeAnalisisAutomatico),
  constantes con nombre (CERO, APROBADO, SUSPENSO), sin numeros magicos.
  Cascada de 3 guardas legible y en el orden del propio .feature.
- src/lib/accesibilidad-areaTactil.ts: excepcionAplicable aisla la unica
  rama con dos casos con nombre claro; el spread condicional es el mismo
  patron ya usado en seo-logica.ts/site.ts para exactOptionalPropertyTypes
  -- coherente con el resto del repo.
- src/lib/contraste.ts: extension sin tocar ni una linea previa (confirmado
  leyendo el fichero completo), reutiliza calcularRatioContraste y
  esAptoParaUso en las 3 puertas nuevas sin reimplementar el calculo de
  ratio -- cumple la instruccion explicita de reutilizacion. La guarda
  compartida ejecutarPuertaDeContrasteParaUso (privada, no exportada) con 3
  wrappers exportados es una decision de diseno razonable y verificada
  (sabotaje propio 9): la independencia exigida por la cabecera del
  .feature es sobre el dato de entrada, no sobre la implementacion.
- src/components/Cabecera.tsx (diff): minimo, sigue el patron ya usado por
  PanelCesta en pagina_tienda para su propio Escape (listener de document
  en useEffect, activo solo mientras abierto).
- Nota no bloqueante sobre @s16 (src/accesibilidad-foco.test.tsx:28-49): el
  Given habla de "el inventario de controles interactivos de las seis
  paginas", pero el test solo ejercita los role: link de Cabecera en
  aislamiento -- no botones (Faq, PaginaTienda), ni campos de formulario, ni
  las otras cinco paginas. La propiedad que verifica (ningun outline en
  linea) es cierta para todo src/ -- verificado por mi con grep -rn outline
  src (0 ocurrencias fuera del propio test) y Glob **/*.{scss,css} (0 hojas
  de estilo en el repo todavia) -- asi que no hay ningun componente real que
  pueda fallar este chequeo hoy. No bloquea, pero si se anade CSS real en
  una feature futura esta cobertura estrecha dejara de ser representativa
  del inventario completo.
- progress/tdd_accesibilidad.md es transparente y detallado en su
  documentacion de que queda pendiente de navegador real para
  @s2/@s17/@s18/@s19 y para las clausulas sueltas de @s21/@s22 -- el
  estandar que sigue en todos esos casos es el correcto. La unica
  inconsistencia real es @s20 (ver Cambios requeridos): mismo tipo de
  clausula dependiente de una ejecucion real de axe-core, pero sin la misma
  transparencia.

## Checkpoints

- C1: [x] Ficheros base presentes, node .harness/harness.mjs init verde (2
  corridas independientes: la mia sola y la del propio tdd_craftsman, 50/50
  ficheros, 667/667 tests, lint y typecheck limpios)
- C2: [x] Una sola feature in_progress (accesibilidad, confirmado leyendo
  feature_list.json); progress/current.md refleja la sesion activa
- C3: [x] Todo el codigo nuevo respeta la separacion logica pura (src/lib) /
  wiring (.tsx) que exige la cabecera del .feature (Invariante 6); sin
  dependencias nuevas; sin console.*/TODO sueltos (grep verificado en los 6
  ficheros nuevos + los 2 modificados)
- C4: [x] Cada modulo nuevo tiene su fichero de test; pnpm run test 667/667
- C5: [ ] No evaluado por mi (pendiente de cierre de sesion, fuera del
  alcance de esta ronda de judge)
- C6: [ ] 35/36 escenarios con cobertura genuina; @s20 incompleto (ver
  arriba) -- no se cumple integramente hasta que se resuelva
- C7: pendiente de mutation_tester (no evaluado en esta ronda, por diseno
  del pipeline)

## Cambios requeridos

1. @s20 -- clausula sin cubrir y sin documentar
   (features/accesibilidad.feature linea 357,
   progress/tdd_accesibilidad.md trazabilidad @s20,
   src/lib/accesibilidad-movimiento.test.ts:39-65): la clausula "Then ... el
   analisis automatico de accesibilidad de esa pagina sigue devolviendo 0
   violaciones" no tiene ningun test (confirmado por grep: cero
   ocurrencias de violacion/violation en
   accesibilidad-movimiento.ts/.test.ts) y tampoco aparece mencionada en la
   seccion "Nota adicional" de la bitacora que si documenta el resto de
   clausulas sueltas de @s19/@s21/@s22 como pendientes de navegador real.
   Resolver de una de estas dos formas, consistente con el resto de la
   feature:
   a) Anadir un test que reutilice ejecutarPuertaDeAnalisisAutomatico (ya
      existente, ya cubierto) con un ResultadoDeAnalisisAutomatico limpio
      en el contexto de esta pagina, dejando explicito en el comentario que
      solo prueba la aritmetica del veredicto, no una ejecucion real de
      axe-core sobre el DOM con la animacion desactivada; o
   b) Documentar explicitamente esta clausula como dependiente de navegador
      real (mismo criterio que @s2/@s17/@s18/@s19), anadiendola a la
      seccion "Nota adicional" o a la lista de Decision 11 si se considera
      que aplica tambien aqui, y dejar constancia en la trazabilidad
      @s -> test.

Todo lo demas revisado (arquitectura, reutilizacion de contraste.ts,
independencia de las 7 guardas de vacuidad, anclaje de los 4 literales, y
ausencia de mocks que finjan medir lo que el propio contrato declara no
medible en jsdom) pasa la verificacion adversarial sin hallazgos.

---

# Review — feature accesibilidad (id 19) — Ronda 2 (22/08/2026)

**Veredicto:** APPROVED

> Ronda 2 de judge, tras el CHANGES_REQUESTED de la Ronda 1 (unico hallazgo:
> @s20 sin cubrir la clausula de "0 violaciones"). Revision completa e
> independiente desde cero contra el codigo real (no solo la bitacora), con
> sabotaje manual propio (varias tandas, distintas en su mayoria de las de
> la Ronda 1) y node .harness/harness.mjs init propio.

## Verificacion del cambio requerido en la Ronda 1

`src/lib/accesibilidad-movimiento.test.ts:80-90` (dentro del `describe('@s20 ...')`)
anade el test que faltaba: construye un `ResultadoDeAnalisisAutomatico` limpio
para una pagina del inventario y reutiliza `ejecutarPuertaDeAnalisisAutomatico`
(ya existente, ya cubierta por `accesibilidad-analisis.test.ts` @s2/@s3) para
afirmar `violacionesTotales === 0` y `veredicto === 'aprobado'`. Cero
produccion nueva (confirmado: `src/lib/accesibilidad-analisis.ts` no cambio).
El comentario del test deja explicito que solo prueba la aritmetica del
veredicto, no una ejecucion real de axe-core -- mismo estandar que el resto
de la feature. **Resuelto.**

## Sabotaje manual propio (independiente del de tdd_craftsman y del de la Ronda 1 de judge)

Reproducido en vivo con `pnpm exec vitest run <fichero>` antes/despues de
cada tanda, revertido sin resto en todos los casos (los ficheros nuevos
--no trackeados por git-- se restauraron a mano byte a byte desde el
contenido ya leido; los ficheros trackeados se verificaron con
`git diff --stat` identico al estado previo a esta ronda:
progress/current.md, src/components/Cabecera.tsx +19/-1,
src/lib/contraste.ts +111, src/lib/contraste.test.ts +144, sin cambios):

1. accesibilidad-analisis.ts, guarda `resultado.informes.length === CERO`
   (@s4) -> `if (false)`: rojo SOLO en el test de @s4 (mensaje esperado
   "vacio" no coincide), los otros 7 tests del fichero siguen verdes --
   confirma guarda independiente. Revertido, 8/8 verde.
2. accesibilidad-analisis.ts, guarda `cargadas.length === CERO` (@s5): un
   intento de revertir la tanda 1 con `git checkout` fallo porque el
   fichero no esta trackeado (incidente de tooling propio, sin impacto en
   el veredicto -- ver nota abajo). Se detecto de inmediato porque la
   siguiente tanda mostro 2 fallos en vez de 1, y se corrigio restaurando
   el fichero completo antes de continuar.
3. accesibilidad-analisis.ts, guarda `resultado.reglasAplicadas === CERO`
   (@s6) -> `if (false)`: rojo SOLO en @s6 (aprobado en vez de suspenso),
   7/8 verdes. Revertido, 8/8 verde.
4. accesibilidad-areaTactil.ts, guarda `inventario.length ===
   CERO_CONTROLES` (@s15) -> `if (false)`: rojo SOLO en @s15, 7/8 verdes.
   Revertido, 8/8 verde.
5. contraste.ts, guarda compartida `catalogo.length === CERO_PAREJAS`
   dentro de `ejecutarPuertaDeContrasteParaUso` -> `if (false)`: las TRES
   @s33/@s35/@s36 rojas en la misma corrida (3 failed, 29 passed), cada una
   con su propio array vacio -- confirma que la independencia exigida por
   la cabecera del .feature es sobre el DATO de entrada, no sobre la
   implementacion. Revertido, 32/32 verde.
6. accesibilidad-analisis.ts, INVENTARIO_DE_PAGINAS (quitar "Tienda"):
   rojo en 5/8 tests, incluido @s1 mismo -- confirma que @s1 compara contra
   un literal escrito a mano y detecta el sabotaje de la constante de
   produccion reimportada, no una tautologia. Revertido, 8/8 verde.
7. contraste.ts, RATIO_MINIMO_POR_USO de "texto normal" 4.5 -> 4.4: rojo en
   @s28 y en cascada @s10/@s32 (3 failed, 29 passed) -- confirma que @s28
   esta anclado al literal 4.5 escrito a mano, no a `umbralesDeContraste()`
   reimportada tautologicamente. Revertido, 32/32 verde.
8. accesibilidad-areaTactil.ts, AREA_TACTIL_MINIMA_PX 24 -> 25: rojo en 5/8
   tests, incluido @s9 -- confirma ancla al literal 24 escrito a mano.
   Revertido, 8/8 verde.
9. `pnpm run test` completo tras el conjunto de tandas: 668/668 verde,
   `git diff --stat` identico al estado previo al inicio de esta ronda.

Nota operativa sobre la tanda 2: un intento de `git checkout` sobre un
fichero NO trackeado no revierte nada (a diferencia de los ficheros ya
trackeados de rondas anteriores). Detectado de inmediato por el propio
resultado de los tests (2 fallos en vez de 1 en la siguiente tanda),
corregido restaurando el fichero completo desde el contenido ya leido, y
reverificado en verde antes de continuar. No afecta el veredicto: cada
guarda quedo, al final, verificada de forma aislada y revertida sin resto.

## Cobertura de escenarios (@s <-> test)

Mismo mapeo verificado linea a linea que la Ronda 1 (sigue siendo exacto
contra el codigo actual), con @s20 ahora completo:

- @s1-@s19: [x] sin cambios desde la Ronda 1 (ver tabla de esa ronda), todos
  reverificados contra el fichero real en esta ronda
- @s20: [x] COMPLETO -- accesibilidad-movimiento.test.ts:41-53 (visible sin
  animacion), :55-65 (bloque invisible se nombra), :80-90 (0 violaciones,
  test nuevo de esta ronda). Las 4 clausulas del Then tienen test.
- @s21-@s36: [x] sin cambios desde la Ronda 1, todos reverificados

Para los 4 escenarios de navegador real (Decision 11), que SI se cubrio en
jsdom y que queda PENDIENTE de navegador real:

- @s2 (arrastra @s7 target-size): SI cubierto en jsdom -- aritmetica del
  veredicto (0 violaciones + 6 paginas => aprobado,
  accesibilidad-analisis.test.ts:38-48); la funcion nunca lee un codigo de
  salida de proceso. PENDIENTE navegador real: la regla target-size de
  axe-core (layout real, imposible en jsdom).
- @s17: SI cubierto en jsdom -- una sola cabecera "banner", sin barra
  superior adicional (src/accesibilidad-foco.test.tsx:51-57, contra <App />
  real). PENDIENTE navegador real: geometria de la cabecera fija vs. el
  control enfocado (getBoundingClientRect real).
- @s18: SI cubierto en jsdom -- el umbral 3 anclado a mano via
  esAptoParaUso (src/accesibilidad-foco.test.tsx:59-67), reutilizando
  contraste.ts. PENDIENTE navegador real: area/contraste de pixeles
  efectivamente renderizados en dos estados.
- @s19: SI cubierto en jsdom -- la clausula de desplazamiento no suavizado
  (accesibilidad-movimiento.test.ts:16-38), reutilizando
  Galeria-logica.ts/desplazamiento.ts ya done/100% mutados. PENDIENTE
  navegador real: animacion CSS en curso, transicion de aparicion, recuento
  de elementos comprobados -- no existe ninguna hoja SCSS en el repo
  todavia (verificado: Glob **/*.scss -> 0 resultados).

En los 4 casos, confirmado por lectura directa de los test files: ningun
mock ni aproximacion jsdom finge medir la parte declarada pendiente (grep
propio sobre src/ confirma que los unicos usos de
matchMedia/getBoundingClientRect del repo son de features anteriores ya
done, reutilizados legitimamente via las funciones puras que ya existian,
no mocks nuevos que aproximen lo que esta feature declara no medible aqui).

36/36 escenarios con test genuino.

## Disciplina TDD

- Produccion sin test que la pida? NO -- reverificado: los 4 modulos
  src/lib/accesibilidad-*.ts, la extension de src/lib/contraste.ts (+111
  lineas, sin tocar ninguna linea previa) y el useEffect/useRef de Escape
  en src/components/Cabecera.tsx (+19/-1) son la unica produccion nueva; el
  fix de esta ronda es solo un test nuevo, cero produccion.
- Evidencia de Rojo->Verde->Refactor? SI -- progress/tdd_accesibilidad.md
  documenta el diagnostico del hallazgo (sabotaje manual del defecto exacto
  ANTES del fix, confirmando que ningun test del fichero lo detectaba), el
  fix minimo, y el mismo sabotaje reproducido DESPUES del fix
  (AssertionError: expected 1 to be +0, revertido). Reproduje de forma
  independiente el patron de guarda cascada (@s4/@s5/@s6) y las guardas de
  vacuidad de Bloque B/F con resultado identico al documentado.

## Calidad

- Todo lo senalado como correcto en la Ronda 1 (arquitectura src/lib,
  reutilizacion de contraste.ts sin reimplementar el ratio, guarda
  compartida vs. independencia del dato de entrada en Bloque F,
  Cabecera.tsx con wiring minimo sin rama de decision WCAG propia) se
  reverifica sin cambios en esta ronda -- ningun fichero de produccion se
  toco salvo el ya aprobado en Ronda 1.
- El unico diff de esta ronda, src/lib/accesibilidad-movimiento.test.ts
  (lineas 67-90), es proporcionado: un test, un import adicional
  (ejecutarPuertaDeAnalisisAutomatico, ResultadoDeAnalisisAutomatico),
  comentario que documenta honestamente el alcance real de lo que prueba
  (aritmetica, no ejecucion real de axe-core).
- Notas no bloqueantes de la Ronda 1 (cobertura estrecha de @s16 sin CSS
  real todavia; @s31 con una sola pareja "componente de interfaz" en el
  catalogo real) siguen vigentes sin cambio, correctamente no bloqueantes.

## Checkpoints

- C1: [x] Ficheros base presentes; node .harness/harness.mjs init verde,
  corrida propia independiente: 50 ficheros de test, 668/668 tests, lint y
  typecheck limpios
- C2: [x] Una sola feature in_progress (accesibilidad, confirmado
  programaticamente contra feature_list.json)
- C3: [x] Sin console.*/TODO sueltos en los ficheros nuevos (grep propio, 0
  coincidencias); toda la logica bajo src/lib o *-logica.ts, dentro del
  glob de mutacion de stryker.config.json (confirmado leyendo el fichero:
  "mutate": ["src/lib/**/*.ts", "src/**/*-logica.ts", ...])
- C4: [x] Cada modulo nuevo tiene su fichero de test; pnpm run test
  668/668
- C5: [ ] No evaluado por mi (pendiente de cierre de sesion, fuera del
  alcance de esta ronda)
- C6: [x] 36/36 escenarios con cobertura genuina, incluido @s20 ya completo
- C7: pendiente de mutation_tester (no evaluado en esta ronda, por diseno
  del pipeline)

## Cambios requeridos (si aplica)

Ninguno. La feature esta lista para mutation_tester.

---

# Review — feature accesibilidad (id 19) — Ronda 3 (verificación de refuerzo de mutación, 22/08/2026)

**Veredicto:** APPROVED

> Ronda focalizada: verifica exclusivamente el refuerzo de tests que
> `tdd_craftsman` añadió en respuesta al FAIL de `mutation_tester`
> (`progress/mutation_accesibilidad.md`, 210/224 = 93.75%, 14 huecos), según
> lo documentado en la "Ronda 3" de `progress/tdd_accesibilidad.md`
> (líneas 445-522). No repite la revisión completa de escenarios/diseño ya
> aprobada en Ronda 1 (CHANGES_REQUESTED, resuelto) y Ronda 2 (APPROVED)
> de este mismo fichero.

## Verificación de "cero producción nueva" (git diff --stat)

`git diff --stat` contra `HEAD` (012dfce, sin commits de esta feature
todavía) muestra exactamente 4 ficheros trackeados modificados:
`progress/current.md`, `src/components/Cabecera.tsx` (+18/-1),
`src/lib/contraste.test.ts` (+173/-1), `src/lib/contraste.ts` (+111/-0).

- `src/lib/contraste.ts`: diff íntegro leído línea a línea — **idéntico
  byte a byte** al que ya revisé y aprobé en Ronda 1/2 (mismas +111 líneas,
  mismas funciones: `umbralesDeContraste`, `esTextoGrande`,
  `formularVeredictoDePareja`, `evaluarParDeContraste`,
  `ejecutarPuertaDeContrasteParaUso` + 3 wrappers). Cero línea nueva desde
  Ronda 2.
- `src/components/Cabecera.tsx`: +18/-1, mismo tamaño que el ya aprobado en
  Ronda 1/2 (+19/-1 en el conteo de esa ronda incluye la línea de cabecera
  del diff; contenido sin cambios).
- `src/lib/contraste.test.ts`: el único fichero con contenido nuevo desde
  Ronda 2 (144 → 173 inserciones netas). Todo el contenido añadido son
  `describe`/`it` y aserciones nuevas (`@s29` catálogo mixto,
  `evaluarParDeContraste` composición real, aserciones `.toEqual([])`
  añadidas a `@s33`/`@s35`/`@s36`) — cero rama de decisión de producción.
- Ficheros no trackeados (`accesibilidad-analisis.ts`,
  `accesibilidad-areaTactil.ts`, `accesibilidad-movimiento.ts`, y sus
  `.test.ts`): leídos en su totalidad. Los números de línea de los 3
  mutantes de `accesibilidad-analisis.ts` (69, 74, 106) y los 5 de
  `accesibilidad-areaTactil.ts` (41, 64, 65, 92, 98/100) citados en
  `progress/mutation_accesibilidad.md` coinciden exactamente con el
  contenido actual del fichero — no hay línea añadida, movida ni
  reescrita. `grep -rn "Stryker was here" src/lib` → 0 coincidencias, sin
  resto de sabotaje.
- `accesibilidad-analisis.test.ts` y `accesibilidad-areaTactil.test.ts`
  leídos completos: las nuevas aserciones (`paginasNoCargadas`,
  `violaciones` en `@s4`/`@s5`/`@s6`, control mixto en `@s11`,
  `Object.hasOwn` en `@s12`, guarda de vacuidad en `@s15`) están presentes
  y corresponden exactamente a lo que pide cada mutante superviviente del
  informe de mutación.

**Conclusión:** ningún fichero de producción fue tocado en esta ronda de
refuerzo. No aplica la excepción de "bug real documentado" — no hay ninguna
justificada, ni hacía falta.

## Sabotaje manual independiente (2 de los tests nuevos, sesión propia)

1. **`accesibilidad-areaTactil.ts:41`** (`alcanzaElMinimo`) →
   `control.anchoPx >= AREA_TACTIL_MINIMA_PX && true`: `pnpm exec vitest run
   src/lib/accesibilidad-areaTactil.test.ts` pasa de 10/10 verde a **1
   fallo** exacto en el test nuevo "refuerzo mutación: ancho suficiente
   pero alto insuficiente también suspende" (`expected 'aprobado' to be
   'suspenso'`), los otros 9 siguen verdes. Revertido con
   `Set-Content -NoNewline`; `pnpm exec vitest run` vuelve a 10/10 verde;
   `git diff --stat -- src/lib/accesibilidad-areaTactil.ts` no aplica
   (fichero no trackeado) pero el contenido quedó restaurado exacto
   (verificado por `grep -n alcanzaElMinimo -A2`).
2. **`contraste.ts:229`** (`ejecutarPuertaDeContrasteParaUso`) →
   `parejas.every(...)` a `parejas.some(...)`: `pnpm exec vitest run
   src/lib/contraste.test.ts` pasa de 34/34 verde a **1 fallo** exacto en
   "refuerzo mutación: un catálogo con una pareja apta y otra no apta
   suspende la puerta completa" (`expected true to be false`), los otros 33
   siguen verdes. Revertido; `pnpm exec vitest run` vuelve a 34/34 verde;
   `git diff --stat -- src/lib/contraste.ts` idéntico al estado previo al
   sabotaje (+111/-0, sin resto).

Ambos mutantes, tomados de `progress/mutation_accesibilidad.md` (huecos #4
y #10 de la tabla de `tdd_craftsman`), quedan muertos por exactamente el
test que la bitácora dice que los mata, sin falsos positivos en el resto
de la suite.

## `node .harness/harness.mjs init` (corrida propia, independiente)

Verde de punta a punta: lint limpio, typecheck limpio, **672/672 tests, 50
ficheros**. Coincide con lo reportado por `tdd_craftsman`
(668 → 672, +4 tests de esta ronda).

## Checkpoints (alcance de esta ronda)

- C1: [x] `node .harness/harness.mjs init` verde, corrida propia
- C4: [x] Cada mutante superviviente citado por `mutation_tester` tiene
  ahora al menos una aserción que lo detecta (verificado por lectura +
  sabotaje propio de 2/14)
- C6: [x] Sin regresión de cobertura de escenarios — el refuerzo es
  puramente de aserciones dentro de `describe`s ya existentes, ningún
  `@s` perdió su test
- C7: pendiente de la re-corrida de `mutation_tester` sobre los 3 ficheros
  (fuera del alcance de esta ronda de `judge`, por diseño del pipeline)

## Cambios requeridos

Ninguno. La feature está lista para que `mutation_tester` reintente la
puerta de mutación sobre `src/lib/accesibilidad-analisis.ts`,
`src/lib/accesibilidad-areaTactil.ts` y `src/lib/contraste.ts`.
