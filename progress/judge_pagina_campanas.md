# Review — feature pagina_campanas (id 16)

Revision ronda 2 (post refuerzo de mutacion). Sustituye la ronda 1 de este
mismo fichero (conservada en el historial de git); esta ronda repite el
protocolo completo desde cero, no solo el punto corregido, mismo criterio ya
establecido en este proyecto (equipo, cabecera_y_navegacion,
ensamblaje_landing...).

Contexto de la ronda: mutation_tester ronda 1 dio FAIL (120/128 = 93.75%
sobre no-equivalentes, progress/mutation_pagina_campanas.md). tdd_craftsman
respondio con 5 tests de refuerzo (0 cambios de produccion, confirmado por
git diff --stat). Pendiente de que mutation_tester vuelva a medir tras este
refuerzo (fuera del alcance de esta puerta).

Verificacion propia en esta revision (no delegada al resumen de ningun
subagente): lectura completa de features/pagina_campanas.feature (541
lineas, cabecera + 41 escenarios), project-spec.md (secciones Ensamblaje,
Subpaginas, PREGUNTA ABIERTA), progress/tdd_pagina_campanas.md (bitacora
completa, rondas 1 y 2), src/pages/PaginaCampanas.tsx,
PaginaCampanas-logica.ts, PaginaCampanas.test.tsx (804 lineas),
PaginaCampanas-logica.test.ts (216 lineas), src/data/campanas.ts,
src/data/servicios.ts, src/App.tsx, src/App-logica.ts, src/App.test.tsx,
src/App-logica.test.ts, src/components/Cabecera.tsx, Cabecera-logica.ts,
Cabecera-logica.test.ts, src/data/navegacion.ts,
features/ensamblaje_landing.feature, features/campanas_portada.feature
(coherencia de literales), progress/mutation_pagina_campanas.md,
progress/gherkin_repair_pagina_campanas.md. Ejecucion propia e independiente
de: node .harness/harness.mjs init (verde, 406/406 tests, lint+typecheck
limpios), pnpm exec vitest run acotado a CampanasPortada.test.tsx +
CampanasPortada-logica.test.ts (regresion, 24/24, cero ficheros de esa
feature tocados), a App.test.tsx + App-logica.test.ts + Cabecera.test.tsx +
Cabecera-logica.test.ts (regresion, 69/69 combinado con los dos anteriores),
git status --porcelain / git diff --stat completo sobre los 9 ficheros
tocados/nuevos, y git diff linea a linea de src/App.tsx, src/App.test.tsx y
src/data/campanas.ts para confirmar que el diff real coincide con lo
declarado en la bitacora.

Veredicto: APPROVED

## Cobertura de escenarios (@s <-> test)

- @s1: [x] PaginaCampanas.test.tsx:77 (banner/contentinfo/main exactamente
  1, nav "Navegacion principal" 8 enlaces, aria-current="page" solo en
  "Campanas"). Soporte de mutacion: Cabecera-logica.test.ts:38-49
  (esPaginaActual, 3 tests directos sobre la funcion pura).
- @s2: [x] PaginaCampanas.test.tsx:102
- @s3: [x] PaginaCampanas.test.tsx:118 (titulos verificados contra
  SERVICIOS real importado, no un doble de test)
- @s4: [x] PaginaCampanas.test.tsx:139
- @s5: [x] PaginaCampanas.test.tsx:164 (orden verificado con
  compareDocumentPosition)
- @s6: [x] PaginaCampanas.test.tsx:180
- @s7: [x] PaginaCampanas.test.tsx:206
- @s8: [x] PaginaCampanas.test.tsx:226
- @s9: [x] PaginaCampanas.test.tsx:239 -
  expect(document.activeElement).toBe(h1) (equivalente exacto a
  toHaveFocus: ambos comparan contra document.activeElement; no es una
  comprobacion de mera presencia del nodo) + toHaveAttribute("tabIndex",
  "-1") para "no entra en el orden de tabulacion". Ver punto (f) mas abajo.
- @s10: [x] PaginaCampanas.test.tsx:253
- @s11: [x] PaginaCampanas.test.tsx:267
- @s12: [x] PaginaCampanas.test.tsx:286 - parrafo introductorio exacto + 5
  puntos verificados literalmente en orden. Ver punto (d).
- @s13: [x] PaginaCampanas.test.tsx:312 + verificacion cruzada contra
  SERVICIOS.flatMap(...) real
- @s14: [x] PaginaCampanas.test.tsx:338
- @s15: [x] PaginaCampanas.test.tsx:364
- @s16: [x] PaginaCampanas.test.tsx:383
- @s17: [x] PaginaCampanas.test.tsx:403
- @s18: [x] PaginaCampanas.test.tsx:415
- @s19: [x] PaginaCampanas.test.tsx:436
- @s20: [x] PaginaCampanas.test.tsx:463
- @s21: [x] PaginaCampanas.test.tsx:481
- @s22: [x] PaginaCampanas.test.tsx:495
- @s23: [x] PaginaCampanas.test.tsx:509
- @s24: [x] PaginaCampanas.test.tsx:540
- @s25: [x] PaginaCampanas.test.tsx:594
- @s26: [x] PaginaCampanas.test.tsx:623 (it.each de las 4 vistas)
- @s27: [x] PaginaCampanas.test.tsx:650
- @s28: [x] PaginaCampanas.test.tsx:665
- @s29: [x] PaginaCampanas.test.tsx:681
- @s30: [x] PaginaCampanas.test.tsx:694
- @s31: [x] PaginaCampanas.test.tsx:710
- @s32: [x] PaginaCampanas.test.tsx:726
- @s33: [x] PaginaCampanas-logica.test.ts:10 (mensaje contiene +
  toBeInstanceOf(Error) con mensaje exacto)
- @s34: [x] PaginaCampanas-logica.test.ts:33
- @s35: [x] PaginaCampanas-logica.test.ts:58
- @s36: [x] PaginaCampanas-logica.test.ts:81 - en esta ronda gana un
  segundo test (linea 91, toBeInstanceOf(Error) + mensaje exacto), el mismo
  refuerzo que ya tenian @s33/@s34/@s35/@s40, cerrando el hueco real que
  mutation_tester ronda 1 encontro en errorPuntoNoPublicado (mutante "body
  emptied" sobrevivia porque toThrowError(regex) no distingue throw
  undefined de throw new Error(...)).
- @s37: [x] PaginaCampanas.test.tsx:753
- @s38: [x] PaginaCampanas.test.tsx:771
- @s39: [x] PaginaCampanas.test.tsx:791
- @s40: [x] PaginaCampanas-logica.test.ts:110
- @s41: [x] PaginaCampanas-logica.test.ts:203 - 3 tests directos, uno por
  fila de la tabla del escenario, sobre decidirComportamientoDesplazamiento
  como funcion pura exportada de PaginaCampanas-logica.ts (no inline en el
  .tsx). Ver punto (e).

41/41 escenarios cubiertos, incluidos los 5 refuerzos de mutacion de ronda 2
(PaginaCampanas-logica.test.ts, describes "refuerzo de mutacion...", lineas
135-215), que no anaden escenario nuevo sino que cierran huecos de
asercion sobre @s3/@s4/@s6/@s7/@s8/@s10/@s20/@s29/@s31/@s32 ya cubiertos.

## Disciplina TDD

- Produccion sin test que la pida? NO. src/pages/PaginaCampanas-logica.ts
  releido integro (140 lineas): cada rama de
  comprobarDatosPendientesNoDeclarados tiene su guarda exacta pedida por
  @s33/@s34/@s35/@s40; comprobarPuntosPublicados y puntosNoVacios por
  @s36/@s37; normalizarCampana por @s3/@s4/@s6/@s20 y reforzada por el
  refuerzo de mutacion; resolverVista por @s7-@s11/@s27/@s29;
  otrasCampanas por @s19/@s39; decidirComportamientoDesplazamiento por
  @s21-@s23/@s41. Ronda 2 confirmada de cero cambios de produccion: el
  fichero, releido completo, no contiene ninguna rama, condicion ni literal
  que no este justificado por al menos un test ya citado arriba.
- Evidencia de Rojo->Verde->Refactor? SI. 41 ciclos documentados en
  progress/tdd_pagina_campanas.md con su ROJO/VERDE explicito (o "paso a la
  primera" razonado como generalizacion directa de un ciclo anterior sin
  produccion nueva: @s13, @s22, @s23, @s28, @s29, @s32). Al menos 2
  verificaciones por sabotaje manual documentadas con reversion (@s8: href
  fijo a "OTRA"; ronda 2: 7 sabotajes, uno por mutante reforzado, cada uno
  con el mutante citado literalmente del informe oficial, confirmado en
  rojo exactamente el test nuevo y ninguno mas, revertido byte a byte). Dos
  refactors en verde documentados (extraccion de TarjetaCampana/
  VistaListado; extraccion de decidirComportamientoDesplazamiento en @s41)
  confirmados por la suite completa en verde antes/despues. Desviacion de
  orden documentada honestamente (@s37-@s39 despues de @s40), sin perder
  ningun ciclo Rojo->Verde dedicado.
- Reutilizacion correcta en vez de reimplementacion, verificada:
  puntosDelBloque (src/data/campanas.ts:52-58) deriva de SERVICIOS real
  (import linea 17); decidirComportamientoDesplazamiento reutiliza
  prefiereMenosMovimiento de Galeria-logica.ts en vez de reimplementar el
  fallo cerrado de 3 vias - confirmado que @s22/@s23 "pasaron a la primera"
  precisamente por esta reutilizacion, sin codigo nuevo.

## Calidad

- src/pages/PaginaCampanas-logica.ts: funciones cortas, un solo motivo de
  cambio cada una; constructores de error nombrados por caso
  (errorPrecioNoConfirmado, errorVigenciaNoConfirmada,
  errorPlazasNoConfirmadas, errorDuracionNoConfirmada,
  errorPuntoNoPublicado), sin duplicacion entre los 4 casos de datos
  pendientes gracias a comprobarDatosPendientesNoDeclarados; sin numeros
  magicos sueltos.
- src/pages/PaginaCampanas.tsx: el .tsx solo cablea (patron
  logica-de-decision-en-modulo-puro-no-en-el-jsx respetado: la unica rama
  inline es el ensamblado "vista.tipo === 'ficha' ? ... : ...", que es
  cableado, no decision de negocio); componentes pequenos de
  responsabilidad unica (TarjetaCampana, VistaListado, RutaListado,
  RutaFicha, BloquePublicado, PanelDatosPendientes, LlamadasAAccion,
  OtraCampanaTarjeta, BloqueOtrasCampanas, VistaFicha).
- Contrato de errores: construirCatalogoCampanas siempre lanza una
  instancia real de Error con mensaje que nombra la campana y el motivo -
  confirmado explicitamente por los 5 tests de instancia exacta
  (toBeInstanceOf(Error) + mensaje exacto) en @s33/@s34/@s35/@s36/@s40, el
  ultimo anadido en esta ronda.
- Sin console.*, .only/.skip, TODO/FIXME en ningun fichero nuevo o tocado
  de esta feature (grep propio en src/pages/, cero coincidencias).
- Fuente unica respetada: telefono (datosNegocio.telefonoClinica,
  src/lib/site.ts), puntos de servicio (SERVICIOS), preferencia de
  movimiento (prefiereMenosMovimiento, Galeria-logica.ts), rutas de
  navegacion (ENLACES_NAVEGACION, via RUTAS_DE_SUBPAGINA) - ninguno
  retipeado a mano en produccion.

### (a) Cambio de rutas en App.tsx / App-logica.ts / App.test.tsx / App-logica.test.ts

git diff linea a linea revisado: AppInterior se extrae dentro de
BrowserRouter solo para poder llamar useLocation() y pasarle rutaActual a
Cabecera; el orden Cabecera -> Routes -> PieDePagina -> SelectorPaleta no
cambia. RUTAS_YA_CON_PAGINA_PROPIA (Set(["/campanas"]), App-logica.ts:11)
excluye "/campanas" de RUTAS_DE_SUBPAGINA sin retipear la ruta (sigue
derivando de ENLACES_NAVEGACION via esAncla, Decision 20 respetada).
Ejecute yo mismo "pnpm exec vitest run src/App.test.tsx
src/App-logica.test.ts src/components/Cabecera.test.tsx
src/components/Cabecera-logica.test.ts" junto con CampanasPortada*: 69/69
verde combinado.

Corri mentalmente y en codigo real los 3 escenarios de
features/ensamblaje_landing.feature que citan /campanas, /blog o /tienda:

- @s7 ("shell comun a todas las rutas"): sigue siendo cierto para las 4
  rutas, /campanas incluida - App.test.tsx:48-65 (it.each de "/",
  "/campanas", "/blog", "/tienda") intacto y en verde; PaginaCampanas se
  renderiza dentro del mismo AppInterior que Cabecera/PieDePagina/
  SelectorPaleta. Sin cambios, sin regresion.
- @s12 ("las rutas /campanas, /blog y /tienda... sirven el catch-all"): el
  texto literal de este escenario, tal como esta hoy en disco en
  features/ensamblaje_landing.feature:216-222, YA NO ES CIERTO para
  /campanas - visitar /campanas muestra la ficha/listado real de
  PaginaCampanas (h1 "Campanas de prevencion" o el titulo de la campana),
  no el encabezado "Pagina no encontrada". Verificado en vivo: el render de
  /campanas no produce ese encabezado. El cambio esta anticipado y cerrado
  por el humano a nivel de contrato de mas alto nivel: la propia cabecera
  PENDIENTE de ensamblaje_landing.feature dice literalmente "hasta que sus
  propias features (16, 17, 18) aterricen su propia Route" (linea 97), la
  PREGUNTA ABIERTA 2 de project-spec.md (lineas 245-254) recomienda
  exactamente este comportamiento y dice "cubre las tres HASTA QUE sus
  propias features (16, 17, 18)... anadan su propia Route por encima", y el
  criterio de aceptacion de ensamblaje_landing en feature_list.json:303
  (feature ya done, aprobada por el humano con ese texto) dice literalmente
  "muestran un catch-all accesible... hasta que sus propias features las
  implementen". El test correspondiente (App.test.tsx, describe @s12) se
  estrecho de it.each(["/campanas","/blog","/tienda"]) a
  it.each(["/blog","/tienda"]), con un comentario que documenta el motivo -
  no hay test rojo ignorado ni regresion de comportamiento oculta
  (App.test.tsx sigue en verde, verificado por mi). Pero el propio fichero
  .feature (el "contrato firmado" segun docs/workflow.md) NO SE ACTUALIZO
  para reflejar que /campanas ya no forma parte del catch-all: su Gherkin
  ejecutable, leido literalmente, sigue afirmando algo que el codigo ya no
  cumple. Esto es una divergencia real entre contrato-en-texto y
  contrato-en-codigo, aunque la intencion ya estaba pre-aprobada a nivel de
  spec/criterio-de-aceptacion. No bloquea esta puerta (ver razonamiento
  abajo) pero se registra como cambio requerido de seguimiento.
- @s13 ("cualquier otra ruta no registrada recibe el mismo catch-all"):
  sigue siendo cierto - /campanas ahora SI esta registrada (ya no aplica
  "no registrada"), asi que @s13 no la menciona ni la necesita;
  App.test.tsx:198-208 (/esto-no-existe) intacto y en verde.

Por que esto no bloquea pagina_campanas (esta feature): el hallazgo es
sobre un .feature AJENO (ensamblaje_landing, ya done), no sobre
pagina_campanas.feature. Los 41/41 escenarios de esta feature estan
cubiertos, la intencion del cambio estaba explicitamente pre-aprobada por
el humano a dos niveles (PREGUNTA ABIERTA 2 de project-spec.md y el
criterio de aceptacion de feature_list.json para la feature 20), y el
codigo/tests reflejan fielmente esa intencion aprobada. Lo que falta es una
pasada mecanica de gherkin_author sobre el TEXTO de
ensamblaje_landing.feature para que el contrato en disco deje de
contradecir al codigo - trabajo fuera del mandato de tdd_craftsman sobre
esta feature, y no una regresion de comportamiento no autorizada.

### (b) Regresion de campanas_portada

git diff --stat sobre CampanasPortada.tsx, CampanasPortada-logica.ts,
CampanasPortada.test.tsx y CampanasPortada-logica.test.ts: sin
diferencias, ningun fichero tocado. Ejecute yo mismo "pnpm exec vitest run
src/components/CampanasPortada.test.tsx
src/components/CampanasPortada-logica.test.ts": 24/24 verde (17 + 7). Nota
cosmetica, no bloqueante, ya senalada en ronda 1: la bitacora
(progress/tdd_pagina_campanas.md, "Verificacion final") cita "28 tests"
para esta regresion; el recuento real medido de forma independiente por mi
es 24. Ficheros intactos y en verde, no es un defecto de codigo.

### (c) Precio/vigencia/plazas/duracion

Contenido: @s24/@s25 verifican ausencia de lenguaje de precio/fecha en las
4 vistas (listado + 3 fichas) con it.each, con la unica excepcion razonada
y verificada (las etiquetas "Precio"/"Vigencia"/"Plazas" del panel "Datos
pendientes de confirmar", nunca como afirmacion de negocio: siempre
"Pendiente de confirmar con la clinica", verificado con valorDelTermino).
@s26 confirma ausencia de "24 h"/"Urgencias"/datos del prototipo ajeno
("Veterinaria La Sierra", "918 44 21 60", etc.) y que el unico span con
texto no vacio dentro de main es "Demostracion".

Catalogo: @s33/@s34/@s35/@s40 fallan cerrado con mensaje y nombre de
campana, verificado con instancia real de Error y mensaje exacto - no hay
forma de que un dato de este tipo entre al catalogo sin lanzar. Verificado
tambien en PaginaCampanas-logica.ts:38-52: las 4 clausulas comprueban
"!== undefined" (no truthy/falsy laxo), asi que una cadena vacia declarada
explicitamente tambien lanzaria.

### (d) Puntos transcritos en la ficha

CAMPANAS_DEMO (src/data/campanas.ts:63-85) usa "puntos:
puntosDelBloque(BLOQUE_MEDICINA_GENERAL)" / "puntosDelBloque(BLOQUE_ESPECIALIDADES)".
puntosDelBloque (src/data/campanas.ts:52-58) busca el bloque en SERVICIOS
(import { SERVICIOS } from "./servicios", linea 17) y devuelve
encontrado.puntos tal cual, sin transformacion ni retipeo. Verificado
literal por literal contra src/data/servicios.ts: los 5 puntos de
"Medicina general" (servicios.ts:35: Preventiva, Vacunaciones,
Desparasitaciones, Chequeo, Identificacion con microchip) coinciden
exactamente, en el mismo orden, con la tabla de @s12 y con el array
esperado en PaginaCampanas.test.tsx:302-308; los 4 de "Especialidades"
(servicios.ts:50: Odontologia, Oftalmologia, Traumatologia, Endoscopia)
coinciden con @s13 y con PaginaCampanas.test.tsx:329. puntosDelBloque lanza
si el bloque no existe (error de programacion, no de dato de negocio) - no
hay ninguna ruta por la que un punto llegue a la ficha sin pasar por
SERVICIOS.

### (e) Las 3 ramas de scroll con reduced-motion como funcion pura

decidirComportamientoDesplazamiento (PaginaCampanas-logica.ts:135-139) es
una funcion exportada de una sola expresion
(prefiereMenosMovimiento(consultarMedios) ? "auto" : "smooth"), sin tocar
el DOM, con sus 3 ramas cubiertas por 3 tests directos en
PaginaCampanas-logica.test.ts:203-215 (uno por fila exacta de la tabla de
@s41), usando un doble minimo de matchMedia escrito a mano (no importado
de produccion - patron doble-de-test-anclado-al-literal-no-al-simbolo
respetado). VistaFicha (PaginaCampanas.tsx:216) solo la invoca dentro de
useEffect, no reimplementa ninguna rama en el .tsx. Al vivir en
*-logica.ts, queda dentro del glob de mutacion de Stryker
(stryker.config.json: src/**/*-logica.ts), a diferencia de si hubiera
quedado inline en el .tsx - exactamente el motivo declarado en el punto 11
de la cabecera del .feature. Confirmado tambien que reutiliza
prefiereMenosMovimiento de Galeria-logica.ts en vez de reimplementar el
fallo cerrado de la 3a rama (preferencia no consultable -> true), ya
probado en su feature de origen.

### (f) Gestion de foco

PaginaCampanas.test.tsx:239-251 usa
"expect(document.activeElement).toBe(h1)" - comprobacion equivalente
exacta a toHaveFocus() de @testing-library/jest-dom (ambos matchers
comparan contra document.activeElement internamente), no una comprobacion
de mera presencia del elemento en el DOM. Complementado con
toHaveAttribute("tabIndex", "-1") para la clausula "no entra en el orden de
tabulacion". La produccion (PaginaCampanas.tsx:212-217) usa useRef +
useEffect(() => encabezadoRef.current?.focus(), [campana.id]), con
campana.id como dependencia - el foco se re-dispara en cada cambio de
campana (navegacion entre fichas sin recarga), no solo al montar la
primera vez. FUERA_DEL_TAB_ORDER = -1 (PaginaCampanas.tsx:99) es una
constante nombrada, no un numero magico suelto en el JSX.

## Checkpoints

- C1: [x] ficheros base y docs presentes; "node .harness/harness.mjs init"
  ejecutado de forma independiente en esta revision: verde (lint +
  typecheck + 406/406 tests, 35 ficheros).
- C2: [x] una sola feature in_progress (pagina_campanas, id 16,
  feature_list.json:248 - confirmado con grep sobre todo el fichero:
  unica coincidencia de "in_progress"); toda feature done conserva sus
  tests en verde (confirmado con las corridas acotadas de
  campanas_portada y cabecera_y_navegacion/ensamblaje_landing);
  progress/current.md describe la sesion activa.
- C3: [x] src/ solo contiene los modulos previstos (nuevo
  src/pages/PaginaCampanas*, extension aditiva de
  App.tsx/App-logica.ts/Cabecera.tsx/Cabecera-logica.ts/campanas.ts,
  confirmado con git diff linea a linea de los 3 primeros); sin
  dependencias nuevas no justificadas (react-router ya declarado desde
  ensamblaje_landing); sin logs de debug ni TODOs.
- C4: [x] hay test por modulo nuevo (PaginaCampanas.test.tsx,
  PaginaCampanas-logica.test.ts); aislamiento real (jsdom + window/document
  reales, sin mocks de sistema de ficheros); pnpm run test muestra 406 > 0
  tests, todos verdes.
- C5: [x] git status --porcelain solo muestra los ficheros esperados de
  esta feature (9 modificados + 7 nuevos, todos justificados y
  enumerados arriba); ningun fichero temporal ni cache sin trackear.
- C6: [x] para pagina_campanas.feature en si: 41/41 escenarios con Then
  medible y test concreto, seccion propia en project-spec.md, mapa @s ->
  test completo en progress/tdd_pagina_campanas.md, sin produccion sin
  test que la pida. Matiz sobre ensamblaje_landing.feature (otra feature,
  ya done): su @s12, tal como esta escrito hoy en disco, ya no es
  literalmente cierto para /campanas - cambio de comportamiento
  pre-aprobado por el humano a nivel de spec/criterio de aceptacion, pero
  el texto Gherkin no se actualizo. Ver "Cambios requeridos".
- C7: [ ] pendiente de medicion por mutation_tester sobre el refuerzo de
  esta ronda (umbral 1.0, harness.config.json). Ronda 1 dio FAIL 93.75%;
  los 8 mutantes supervivientes documentados en
  progress/mutation_pagina_campanas.md tienen su test de refuerzo
  correspondiente en PaginaCampanas-logica.test.ts (verificado uno a uno
  contra la tabla "mutante -> test" del propio informe), cada uno con
  sabotaje manual documentado en progress/tdd_pagina_campanas.md
  ("Ronda 2"). Esta puerta (judge) no mide mutacion - la aprobacion de
  diseno/cobertura no depende de C7.

## Cambios requeridos (si aplica)

Ninguno bloquea el cierre de esta puerta (pagina_campanas): sus 41
escenarios estan cubiertos, la disciplina TDD es solida (incluida la ronda
de refuerzo de mutacion, cero produccion tocada), la calidad es alta, y las
regresiones de campanas_portada/cabecera_y_navegacion/ensamblaje_landing
estan verificadas en verde de forma independiente por mi. Quedan 2 acciones
de seguimiento, ninguna a cargo de tdd_craftsman sobre pagina_campanas:

1. (No bloqueante para esta feature, si urgente antes de repetir el
   patron) Programar una pasada pequena de gherkin_author sobre
   features/ensamblaje_landing.feature (@s12 y su nota PENDIENTE de
   cabecera, lineas 97 y 216-222) para retirar /campanas de la lista de
   rutas que "sirven el catch-all", ya que pagina_campanas le dio su
   propia Route real. El codigo y los tests ya reflejan la realidad
   (App.test.tsx verde) y la intencion ya estaba pre-aprobada por el
   humano (PREGUNTA ABIERTA 2 de project-spec.md + criterio de aceptacion
   de la feature 20 en feature_list.json); lo que queda desactualizado es
   el TEXTO del propio .feature, que este proyecto trata explicitamente
   como "el contrato firmado por el humano" (docs/workflow.md). Conviene
   resolverlo antes de que pagina_blog/pagina_tienda (features 17/18)
   repitan el mismo patron sobre las otras dos rutas y amplien la
   divergencia sobre el mismo escenario.
2. (Cosmetico) Corregir el recuento "28 tests" de la regresion de
   campanas_portada en progress/tdd_pagina_campanas.md (seccion
   "Verificacion final") a 24 (17 + 7), el valor real medido de forma
   independiente en esta revision.

No se marca done en feature_list.json: falta mutation_tester sobre el
refuerzo de esta ronda (C7).
