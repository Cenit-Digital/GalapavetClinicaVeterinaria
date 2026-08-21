# Review — feature formulario_contacto (id 11), ronda 1

**Veredicto:** APPROVED

## Cobertura de escenarios (@s ↔ test)
- @s1: [x] FormularioContacto.test.tsx:26-34
- @s2: [x] FormularioContacto.test.tsx:36-53
- @s3: [x] FormularioContacto.test.tsx:57-71
- @s4: [x] FormularioContacto.test.tsx:73-90
- @s5: [x] FormularioContacto.test.tsx:92-104
- @s6: [x] FormularioContacto.test.tsx:106-117
- @s7: [x] FormularioContacto.test.tsx:130-149
- @s8: [x] FormularioContacto.test.tsx:151-171
- @s9: [x] FormularioContacto.test.tsx:173-187
- @s10: [x] FormularioContacto.test.tsx:189-203
- @s11: [x] FormularioContacto.test.tsx:205-221 (unica independencia cruzada explicita del contrato: "Tu nombre"/"Telefono" no marcados)
- @s12: [x] FormularioContacto.test.tsx:223-236
- @s13: [x] FormularioContacto.test.tsx:238-261
- @s14: [x] FormularioContacto.test.tsx:263-286

Los 14/14 escenarios tienen test concreto y las aserciones del test corresponden
literalmente a cada Then del .feature. Refuerzo adicional (no exigido por
ningun @s, pero justificado por mutacion) en FormularioContacto-logica.test.ts
para telefonoInvalido (ningun escenario deja "Telefono" vacio en el DOM).

## Disciplina TDD
- Produccion sin test que la pida: NO. Cada rama de ValidezCampos
  (FormularioContacto-logica.ts:34-41) esta exigida por al menos un @s
  (nombre: @s9/@s10; telefono: refuerzo directo en -logica.test.ts:25-31;
  email: @s11; aviso legal: @s12). No hay atributo, opcion de "Motivo" ni
  texto que no tenga un Then que lo pida.
- Evidencia de Rojo-Verde-Refactor: SI. progress/tdd_formulario_contacto.md
  documenta 14 ciclos con su ROJO/VERDE explicito o, cuando el test "paso a la
  primera", con sabotaje manual descrito paso a paso y su reversion (Ciclos 4,
  8, 10, 12, 13, 14). Un unico REFACTOR real (Ciclo 7: div role=status a
  output por jsx-a11y/prefer-tag-over-role), documentado y sin tocar
  ningun test.

## Verificacion propia (no me fio del relato)

Reproduje 5 sabotajes manuales independientes contra el codigo real (no los
relatados en el tdd_, ejercicios propios), todos con revert verificado por
hash SHA-256 identico al original tras cada uno:

1. Independencia real exigida por @s11: cambie nombreInvalido para depender
   tambien de emailTieneFormatoValido(campos.email) (bleed email->nombre) ->
   capturado exactamente por el test de @s11
   (FormularioContacto.test.tsx:218, aria-invalid esperado "false" recibido
   "true"). Confirma que la independencia que el contrato SI exige (@s11) esta
   realmente verificada.
2. Independencia NO exigida por el contrato (checkbox->nombre y
   nombre->telefono): sabotee nombreInvalido para depender de
   aceptaAvisoLegal, y por separado telefonoInvalido para depender de
   esTextoVacio(campos.nombre) -> 22/22 verdes en ambos casos, ningun test lo
   detecta. Leido el codigo real (sin sabotaje), cada XInvalido depende unica
   y exclusivamente de su propio campo (FormularioContacto-logica.ts:36-39),
   asi que el comportamiento en produccion es correcto; lo que falta es una
   asercion redundante analoga a la de @s11 para los otros 3 campos. No lo
   trato como bloqueante: ningun @s del .feature (@s9/@s10/@s12) exige esa
   asercion cruzada -- es una decision de diseno del gherkin_author (un unico
   escenario testigo, @s11, para el invariante "marca el control culpable",
   ya aprobado en puerta humana) -- y stryker.config.json (mutate) solo muta
   *-logica.ts con los mutadores estandar de Stryker, que no generan
   sustituciones cruzadas de propiedad (campos.nombre por campos.telefono),
   asi que tampoco es un hueco que la puerta de mutacion vaya a exponer.
   Coherente con la disciplina de este proyecto ("no se toca lo que ningun
   test pide", tdd_formulario_contacto.md Ciclo 5) y con el patron
   .memoria-cache/patterns/testing/superviviente-de-mutacion-en-guarda-defensiva-es-hueco-del-contrato.md
   (un hueco de TEST sobre comportamiento YA especificado se cierra reforzando,
   no bloquea la puerta si ningun mutante real lo expone). Queda anotado para
   quien toque validarCampos en el futuro: un test directo tipo "cambiar
   aceptaAvisoLegal no debe mover nombreInvalido/telefonoInvalido/
   emailInvalido" cerraria el hueco sin coste.
3. Reseteo @s13: puse defaultValue="persistente" en el input de "Tu nombre"
   -> capturado por 3 tests (@s9, @s10 y @s13, FormularioContacto.test.tsx:254
   con "Received: persistente"), confirmando que el mecanismo de remonte por
   ref no controlado realmente depende de que ningun campo lleve
   value/defaultValue/defaultChecked persistido -- no es una tautologia.
4. Telefonos @s7/@s8: confirmado por lectura, no por sabotaje adicional --
   FormularioContacto.tsx:60-61 deriva enlaceClinica/enlaceUrgencias con
   construirEnlaceTelefono (InformacionContacto-logica.ts:25-27), que a su
   vez llama a enlaceLlamada (src/lib/telefono.ts:40-42, falla cerrado si no
   normaliza). Ningun tel: escrito a mano en el componente. Los numeros
   "91 082 92 67" / "91 851 13 93" y el rotulo "Urgencias fuera de horario"
   vienen de src/lib/site.ts:10-13,60,65 y coinciden byte a byte con
   docs/datos-galapavet.md:27,29.
5. Mailto @s14: inyecte un enlace mailto:info@galapavet.com junto al enlace
   "Aviso legal" (FormularioContacto.tsx:108) -> capturado por el test de
   @s14 (FormularioContacto.test.tsx:269, not.toMatch(/^mailto:/) falla con
   el valor inyectado). El check de arroba (/\w@\w/ sobre textContent) es
   correcto porque el valor tecleado en "Email" vive en el atributo value del
   input, no en textContent (confirmado leyendo el DOM: input no expone su
   value como hijo de texto).

Todos los ficheros tocados para sabotaje se restauraron y se verificaron por
hash SHA-256 identico al original antes de cerrar esta revision; git status
solo muestra los 4 ficheros nuevos esperados (sin diffs residuales; al ser
ficheros no trackeados se verifico por checksum en vez de git diff).

## Calidad
- FormularioContacto-logica.ts es modulo puro (Invariante 6), sin tocar el
  DOM, con 5 funciones de una sola responsabilidad cada una y nombres
  reveladores (esTextoVacio, emailTieneFormatoValido, validarCampos,
  formularioEsValido). Sin numeros magicos.
- FormularioContacto.tsx:44-57 (manejarEnvio) es corta y de un solo motivo de
  cambio: lee refs, valida, decide vista. Ningun ternario de decision
  enterrado en el JSX mas alla de aria-invalid={validez.campoInvalido}, que es
  estado de UI legitimo en atributo ARIA (Invariante 5), no derivacion --
  coherente con .memoria-cache/patterns/arquitectura/estado-condicional-en-atributo-aria-no-en-clase-css.md
  y con logica-de-decision-en-modulo-puro-no-en-el-jsx.md ("Cuando NO
  aplica").
- Reutilizacion correcta de datosNegocio (src/lib/site.ts) y
  construirEnlaceTelefono (InformacionContacto-logica.ts): coincide con el
  patron dato-de-negocio-en-fuente-unica-canonica.md del repo (dato escrito
  una sola vez, enlaces derivados, nunca reescritos a mano).
- Contrato de errores: enlaceLlamada/normalizarTelefono
  (src/lib/telefono.ts:21-42) fallan cerrado ante telefonos no normalizables
  -- coherente con el resto del repo; no aplica aqui un canal de error de
  proceso porque no hay envio real (Decision 6), asi que no hay codigo de
  salida que evaluar en esta feature.
- URL_AVISO_LEGAL apunta a https://galapavet.com/aviso-legal, coincide con
  docs/datos-galapavet.md parrafo 11 (enlaces legales reales) y con @s2.
- Sin console.*, debugger, .only/.skip, TODO ni restos de "SABOTAJE" en los 4
  ficheros (verificado con grep propio).
- Unico hallazgo no bloqueante: falta de aserciones cruzadas redundantes para
  @s9/@s12 analogas a las de @s11 (ver punto 2 de la verificacion). No
  bloquea esta ronda por las razones expuestas (fuera del alcance literal del
  contrato, fuera del espacio de mutadores de Stryker, y contrario a la
  disciplina minimalista ya practicada en este mismo ciclo). Recomendado
  como mejora futura si se vuelve a tocar validarCampos.

## Checkpoints
- C1: [x] bin/harness init (node .harness/harness.mjs init) termina verde:
  lint sin errores, typecheck sin errores, 254/254 tests verdes.
- C2: [x] Una sola feature in_progress (formulario_contacto,
  feature_list.json).
- C3: [x] src/ solo contiene los modulos previstos (componente + logica +
  tests co-locados); sin dependencias externas nuevas.
- C4: [x] Test por modulo (FormularioContacto.test.tsx +
  FormularioContacto-logica.test.ts); pnpm run test reporta 254 tests
  verdes, > 0.
- C5: [x] Sin archivos sospechosos sin trackear (solo los 4 ficheros nuevos
  de la feature); feature_list.json sigue con formulario_contacto en
  in_progress (correcto, a la espera de mutacion -- no le corresponde al
  judge marcar done).
- C6: [x] features/formulario_contacto.feature existe con 14 @s tagueados,
  cada Then es medible, mapa @s -> test presente en
  progress/tdd_formulario_contacto.md y verificado uno a uno contra el
  fichero real de test (ver seccion de cobertura arriba). Sin produccion sin
  test que la exija.
- C7: [ ] Pendiente -- corresponde al mutation_tester, no a esta revision.

## Cambios requeridos (si aplica)
Ninguno. Aprobado.

---

# Review -- feature formulario_contacto (id 11), ronda 2

**Veredicto:** APPROVED

## Contexto

Tras la ronda 1 (APPROVED, sin cambios requeridos), mutation_tester reporto
FAIL: 34/36 = 94.44% (progress/mutation_formulario_contacto.md), con 2
mutantes sobrevivientes en src/components/FormularioContacto-logica.ts:27,
ambos sobre el literal PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/: uno
elimina el ancla de inicio (mutante id 5), otro la de fin (mutante id 6). El
tdd_craftsman documenta en progress/tdd_formulario_contacto.md ("Ronda 2 --
refuerzo tras mutacion", Ciclo 15) la respuesta: 2 tests nuevos directos en
FormularioContacto-logica.test.ts, sin tocar ningun fichero de produccion.

## Cobertura de escenarios (@s <-> test)

Sin cambios respecto a la ronda 1 (14/14 escenarios cubiertos, ver review de
ronda 1 arriba). El diff de esta ronda no anade ni modifica ningun @s; el
.feature no cambio. Ambos tests nuevos son refuerzo de mutacion sobre @s11
(FormularioContacto-logica.test.ts:45-47 y :49-51), no escenarios nuevos.

## Disciplina TDD

- Produccion sin test que la pida: NO. FormularioContacto-logica.ts y
  FormularioContacto.tsx quedan byte a byte identicos al cierre de la ronda 1
  (confirmado por hash SHA-256 propio antes/despues de mis sabotajes, ver
  abajo); esta ronda solo anade 2 tests.
- Evidencia de Rojo-Verde-Refactor: SI. progress/tdd_formulario_contacto.md
  documenta que ambos tests "pasaron a la primera" (el PATRON_EMAIL real ya
  era correcto) y describe el sabotaje manual de verificacion, uno por
  mutante, con resultado exacto (9/10 verdes, 1 rojo cada vez) y reversion.

## Verificacion propia (no me fio del relato) -- reproduccion independiente

Reproduje los 2 sabotajes exactos del informe de mutacion contra el codigo
real (no contra el relato), con checksum SHA-256 identico al original tras
cada reversion:

1. Mutante 5 (elimina ^ inicial): PATRON_EMAIL a /[^\s@]+@[^\s@]+\.[^\s@]+$/
   -> pnpm exec vitest run FormularioContacto-logica.test.ts: exactamente
   1/10 rojo (test "refuerzo mutacion (ancla de inicio)..."), 9/10 verdes.
   Revertido, checksum identico al original
   (4a4e56e2a31331bf0dbf5cd71403041cc446d3a529702b787bc970e69795c895).
2. Mutante 6 (elimina $ final): PATRON_EMAIL a /^[^\s@]+@[^\s@]+\.[^\s@]+/
   -> exactamente 1/10 rojo (test "refuerzo mutacion (ancla de fin)..."),
   9/10 verdes. Revertido, mismo checksum.

Ambos mutantes que sobrevivieron en la medicion previa quedan muertos por los
2 tests nuevos. Confirma con evidencia propia (no solo el relato del
tdd_craftsman) que el refuerzo de esta ronda es real.

### Verificacion adicional de los 4 puntos senalados por el orquestador (sabotajes propios, independientes de los relatados en tdd_)

3. Independencia de la marca de invalidez entre campos (@s9/@s11/@s12):
   sabotee nombreInvalido para que tambien dependiera de
   !campos.aceptaAvisoLegal (bleed casilla->nombre) ->
   FormularioContacto.test.tsx + -logica.test.ts: 24/24 verdes, ningun test
   lo detecta. Confirma que el hallazgo no bloqueante ya documentado en la
   ronda 1 (punto 2 de su "Verificacion propia") sigue siendo exacto: el
   .feature solo exige independencia cruzada explicita en @s11 (linea 204:
   "los controles Tu nombre y Telefono no quedan marcados como invalidos");
   ni @s9 ni @s12 piden una asercion analoga, y el codigo real (leido sin
   sabotaje, FormularioContacto-logica.ts:36-39) si mantiene cada xInvalido
   dependiendo unica y exclusivamente de su propio campo. No es un hallazgo
   nuevo de esta ronda ni parte del diff (validarCampos no se toco en la
   ronda 2); sigue sin ser bloqueante por las mismas razones ya argumentadas
   en la ronda 1 (fuera del alcance literal del contrato, fuera del espacio
   de mutadores estandar de Stryker -- swap de propiedad entre variables, no
   literal). Revertido, checksum identico al original.
4. Reseteo @s13: a diferencia del sabotaje ya relatado en
   tdd_formulario_contacto.md (que tocaba "Tu nombre"), probe un campo
   distinto: anadi defaultValue="persistente" al textarea de "Cuentanos"
   (FormularioContacto.tsx:98) -> capturado exactamente por el test de @s13
   (FormularioContacto.test.tsx:257, "Received: persistente"), 13/14 verdes.
   Confirma que el mecanismo de remonte por refs no controlados protege el
   reseteo de cualquier campo, no solo el que el propio tdd_craftsman probo.
   Revertido, checksum identico.
5. Telefonos @s7/@s8 sin reescritura a mano: reescribi a mano el href del
   enlace de urgencias (tel:+34600000000, ignorando enlaceUrgencias.href
   derivado de construirEnlaceTelefono) -> capturado exactamente por el test
   de @s7 (FormularioContacto.test.tsx:145), 13/14 verdes. Confirma que el
   test depende del dato real derivado, no de una coincidencia. Revertido,
   checksum identico.
6. Ausencia de mailto/email @s14: inyecte
   <a href="mailto:info@galapavet.com"> dentro de la vista de confirmacion
   (<output>, ubicacion distinta a la probada en el relato del tdd_, que
   insertaba junto al enlace "Aviso legal" del formulario) -> capturado
   exactamente por el test de @s14 (FormularioContacto.test.tsx:282), 13/14
   verdes. Confirma que la guarda recorre todo el bloque (formulario +
   confirmacion), no solo la vista donde el tdd_craftsman probo. Revertido,
   checksum identico.

Los 4 ficheros tocados (FormularioContacto.tsx, FormularioContacto-logica.ts,
FormularioContacto.test.tsx, FormularioContacto-logica.test.ts) quedan con
checksum SHA-256 identico al estado previo a mis sabotajes; git status
muestra unicamente los 4 ficheros nuevos ya esperados, sin diffs residuales.

## Calidad

Sin cambios de produccion en esta ronda; el veredicto de calidad de la ronda
1 (FormularioContacto-logica.ts como modulo puro de una sola responsabilidad
por funcion, sin numeros magicos, sin logica de decision en el JSX,
reutilizacion correcta de datosNegocio/construirEnlaceTelefono, Invariante 5
respetada) sigue vigente. Los 2 tests nuevos
(FormularioContacto-logica.test.ts:45-51) son cortos, nombrados por lo que
verifican ("refuerzo mutacion (ancla de inicio/fin)") y con el comentario del
mutante exacto que atacan documentado en progress/tdd_formulario_contacto.md
Ciclo 15 -- no en el propio test (correcto: el test se lee solo por su
nombre y asercion, sin depender del changelog para entenderse).

## Checkpoints

- C1: [x] node .harness/harness.mjs init verde: lint sin errores, typecheck
  sin errores, 256/256 tests verdes (254 previos + 2 nuevos de esta ronda).
- C2: [x] Una sola feature in_progress (formulario_contacto,
  feature_list.json:177).
- C3: [x] src/ solo contiene los modulos previstos; sin dependencias
  externas nuevas.
- C4: [x] Test por modulo; pnpm run test reporta 256 tests verdes.
- C5: [x] Sin archivos sospechosos sin trackear (solo los 4 ficheros ya
  conocidos de la feature); feature_list.json sigue con formulario_contacto
  en in_progress (correcto -- no le corresponde al judge marcarla done, eso
  es tras mutation_tester).
- C6: [x] features/formulario_contacto.feature con 14 @s, mapa @s -> test
  verificado uno a uno; sin produccion sin test que la exija.
- C7: [ ] Pendiente -- corresponde a mutation_tester repetir la medicion
  sobre FormularioContacto-logica.ts con los 2 tests nuevos.

## Cambios requeridos (si aplica)

Ninguno. Aprobado. Queda a la espera de que mutation_tester repita la
medicion y confirme que los 2 mutantes supervivientes de la ronda 1 quedan
muertos (mi reproduccion independiente de ambos sabotajes ya lo confirma con
evidencia propia, pero C7 formalmente lo cierra mutation_tester, no judge).
