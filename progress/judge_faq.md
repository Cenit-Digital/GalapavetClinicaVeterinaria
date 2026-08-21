# Review — feature faq (id 12)

**Veredicto:** APPROVED

> Ronda 2 de esta puerta: revision completa del estado actual del repositorio
> tras el refuerzo de mutacion de tdd_craftsman (progress/tdd_faq.md,
> seccion "Ronda 2"), motivado por progress/mutation_faq.md (FAIL 82.22%,
> 16 mutantes no-killed sobre Faq-logica.ts). Se releyeron los 13
> escenarios contra el codigo real (no solo contra el resumen de la ronda 1
> de este mismo fichero) y se audito especificamente el fichero nuevo
> src/components/Faq-logica.test.ts (7 tests) que aporta esta ronda.

## Cobertura de escenarios (@s <-> test)

Verificado uno a uno contra src/components/Faq.test.tsx (lineas reales
releidas, no solo citadas de memoria):

- @s1: [x] describe "@s1 las cinco preguntas se muestran colapsadas por
  defecto" en Faq.test.tsx:34-47. h2 "Preguntas frecuentes", 5 nombres
  accesibles en orden exacto (toEqual, igualdad, no subcadena),
  aria-expanded=false en los 5, queryAllByRole(region) longitud 0.
- @s2: [x] Faq.test.tsx:49-66. aria-expanded=true tras el clic,
  aria-controls apuntando al id real de la region, los 3 tramos exactos
  del horario. Reforzado en ronda 2 por un test directo de textoHorario
  contra el literal completo con comas (Faq-logica.test.ts:14-24), que
  cierra el hueco real que dejaba el toContain fragmentado (mutante
  Faq-logica.ts:35, .join(", ") a .join(""), verificado a mano: con 3
  tramos produce texto pegado sin separador, y el test nuevo lo distingue
  porque compara el texto completo, no fragmentos sueltos).
- @s3: [x] Faq.test.tsx:68-86. 2 telefonos, 2 role=link con href
  exacto, guarda negativa de correo/formulario.
- @s4: [x] Faq.test.tsx:88-102. Los 5 titulos de SERVICIOS contados
  cada uno una vez, guarda negativa de servicios no publicados. Reforzado
  en ronda 2 por 2 tests directos de textoServicios (3 titulos y 1 titulo,
  Faq-logica.test.ts:27-36) que si verifican el formato espanol completo
  ("Uno, Dos y Tres." / "Unico.") - recalculado a mano contra
  enumerar/textoServicios tal cual estan en Faq-logica.ts:43-63 y coincide
  exactamente con el literal esperado en el test, no es un doble vacio.
- @s5: [x] Faq.test.tsx:104-125. Telefono real de urgencias como enlace,
  ausencia de "24 h", "24 horas", "365", "todos los dias del ano", "recargo".
- @s6: [x] Faq.test.tsx:127-151. Ausencia de digitos, telefono, simbolo
  euro, horas, palabras comerciales prohibidas y del nombre "Galapavet",
  con asercion positiva (toContain "vacun") que evita el verde-por-vacuidad
  ya detectado y corregido en ronda 1.
- @s7: [x] Faq.test.tsx:153-173. Tras abrir "horario" y pulsar
  "servicios": 1 boton expandido, 1 region.
- @s8: [x] Faq.test.tsx:175-191. Doble clic sobre "Como pido cita":
  aria-expanded=false, 0 expandidos, 0 regiones.
- @s9: [x] Faq.test.tsx:193-208. Foco + tecla Enter expande y conserva el
  foco (toHaveFocus antes y despues).
- @s10: [x] Faq.test.tsx:216-252. Abre las 5 preguntas reales, concatena
  el texto y exige ausencia de las clausulas prohibidas, con guarda positiva
  de que si aparecen numeros permitidos.
- @s11: [x] Faq.test.tsx:254-264. Catalogo vacio inyectado: sin h2, sin
  botones, sin marcadores de relleno.
- @s12: [x] Faq.test.tsx:266-294. 4 entradas (2 con hueco): exactamente 2
  controles, en el orden de las entradas validas.
- @s13: [x] Faq.test.tsx:296-311. telefonoUrgencias="900 000 000"
  inyectado: la region refleja el doble y ya no contiene el real.

13/13 escenarios cubiertos con test concreto. Los 7 tests nuevos de
src/components/Faq-logica.test.ts (ronda 2) no son escenarios nuevos: son
refuerzo de mutacion sobre textoHorario/textoServicios/segmentosDeRespuesta,
correctamente rotulados en sus propios describe como refuerzo de mutacion,
apoyo de @sN, y asi los trata este mapa - no se inventan @s14..@s20 que no
existen en features/faq.feature.

## Disciplina TDD

- Produccion sin test que la pida? NO. Confirmado con
  git status --short -- src/components/Faq.tsx src/components/Faq-logica.ts:
  ambos siguen sin trackear (nunca commiteados, feature in_progress), y su
  contenido leido integro en esta ronda coincide linea a linea con las citas
  de progress/mutation_faq.md (L35, L43-44, L48-49, L127-130, L132) - cero
  produccion tocada entre la medicion de mutacion (ronda 1) y esta revision.
  Cada funcion exportada de Faq-logica.ts tiene un ciclo documentado en
  progress/tdd_faq.md con su test que lo exige; no se encontro codigo sin
  cobertura directa o indirecta.
- Evidencia de Rojo-Verde-Refactor? SI, con doble evidencia:
  - Ronda 1 (progress/tdd_faq.md:56-273): ROJO confirmado con mensaje de
    fallo citado para @s4/@s5/@s6/@s8/@s11/@s12/@s13, y sabotaje manual
    verificando los "verde a la primera" de @s7/@s9/@s10 (revertidos byte a
    byte).
  - Ronda 2 (progress/tdd_faq.md:276-437): los 7 tests nuevos pasaron a la
    primera contra la produccion real (comportamiento correcto, hueco solo
    de asercion - no viola docs/tdd.md porque el "rojo" lo aporta el propio
    mutante del informe, no el estado inicial del test). Se verifico cada
    uno de los 16 mutantes aplicandolo a mano, confirmando que test(s) se
    ponian en rojo, y revirtiendo antes de continuar (tabla completa en
    progress/tdd_faq.md:342-359). Verificacion propia (no solo confiar en
    la tabla): recalcule a mano la salida esperada de los 7 tests nuevos
    contra la logica real de textoHorario/enumerar/textoServicios/
    segmentosDeRespuesta (incluida la recursion de segmentosDeRespuesta con
    2 apariciones del mismo numero) y los 7 literales coinciden exactamente
    con lo que la produccion sin sabotaje produce - no son dobles vacios ni
    tautologias ancladas al simbolo importado.
  - Ninguno de los dobles de test (enlace, horario, servicios) se reimporta
    de produccion para calcular el esperado: se construyen a mano
    (Faq-logica.test.ts:15-19,29,40), respetando el patron organizacional
    doble-de-test-anclado-al-literal-no-al-simbolo.

## Calidad

- Funciones cortas, un motivo por cambio: Faq-logica.ts son funciones
  puras de una responsabilidad cada una (textoTramo, textoHorario,
  textoCita, enumerar, textoServicios, textoUrgencias, entradasValidas,
  siguienteIndiceAbierto, segmentosDeRespuesta, enlacesDeContacto).
  Faq.tsx:50-96 es cableado puro (estado, construccion del catalogo,
  guarda, .map), consistente con el resto de componentes del repo.
- Nombres reveladores, sin numeros magicos: SEPARADOR_LISTA,
  CONECTOR_ULTIMO_ELEMENTO, CONECTOR_TRAMOS_SEPARADOS, HORAS_CERRADO
  nombran cada literal; no hay numeros magicos en los ficheros tocados.
- Sin duplicacion: reutiliza construirEnlaceTelefono/EnlaceTelefono/
  TramoHorario de InformacionContacto-logica.ts en vez de reimplementar la
  derivacion tel:; reutiliza SERVICIOS de src/data/servicios.ts para los 5
  titulos exactos de @s4 en vez de retipearlos.
- Contrato de errores: no se introduce superficie de error nueva; los
  telefonos ya llegan validados desde datos_negocio/informacion_contacto
  (falla cerrado en enlaceLlamada); ningun @s de faq.feature exige un
  telefono invalido inyectado, asi que no anadir un try/catch respeta la
  Ley 3.
- Arquitectura: respeta el patron .tsx cablea / *-logica.ts mordible por
  mutacion (project-spec.md:65,
  arquitectura/logica-de-decision-en-modulo-puro-no-en-el-jsx). El estado
  condicional vive en aria-expanded, no en clase CSS. El fichero nuevo de
  ronda 2 (Faq-logica.test.ts) sigue exactamente el mismo patron ya
  aprobado en Galeria-logica.test.ts/CampanasPortada-logica.test.ts (import
  directo de las funciones puras, sin pasar por el DOM) - resuelve la
  observacion no bloqueante que dejo la ronda 1 de este mismo judge.
- Sin TODOs sin contexto ni logs de depuracion: grep sobre los 4 ficheros
  de faq (TODO, FIXME, console., debugger, .only(, .skip() sin
  coincidencias. El unico comentario "PENDIENTE" (Faq-logica.ts:70-76,
  revision veterinaria del texto divulgativo) esta acotado y referenciado
  en la cabecera de features/faq.feature, no bloquea ningun @s.

## Checkpoints

- C1: [x] Ficheros base y docs presentes; node .harness/harness.mjs init
  termino en verde: lint (oxlint --deny-warnings) sin errores, tsc -b sin
  errores, 276/276 tests (269 + 7 de la ronda de refuerzo).
- C2: [x] Una sola feature in_progress (faq, id 12) en feature_list.json;
  toda feature done conserva sus tests en verde; progress/current.md
  describe la sesion activa.
- C3: [x] src/ respeta las capas del proyecto (paginas -> componentes ->
  logica pura -> datos/fuente unica); sin dependencias nuevas; sin TODOs
  huerfanos ni logs de depuracion en los ficheros tocados.
- C4: [x] Cada modulo tiene al menos un test: Faq.tsx via Faq.test.tsx, y
  ahora tambien Faq-logica.ts via un Faq-logica.test.ts dedicado (cierra la
  observacion de ronda 1); bin/harness test muestra 276 tests, todos
  verdes.
- C5: [~] No bloqueante a mitad de sesion: los ficheros de faq siguen sin
  trackear porque la feature esta in_progress, estado esperado antes del
  cierre de sesion.
- C6: [x] features/faq.feature con 13 escenarios @s1..@s13, cada Then mide
  algo consultable (rol/nombre accesible, aria-expanded, contenido de
  texto exacto o guardas negativas); mapa @s -> test completo en
  progress/tdd_faq.md; no hay produccion sin test que la pida.
- C7: [ ] Pendiente: corresponde al mutation_tester, que debe repetir la
  medicion oficial sobre Faq-logica.ts tras esta ronda de refuerzo (la
  medicion vigente en progress/mutation_faq.md, 82.22%, es del estado
  anterior a los 7 tests nuevos evaluados aqui y no representa el estado
  actual). Del analisis propio de este judge (recalculo manual de los 7
  tests contra los 16 mutantes citados), 15/16 quedarian Killed y 1/16
  (Faq-logica.ts:49, StringLiteral dentro de la rama elementos.length <= 1)
  es equivalente genuino verificado matematicamente (join de un array vacio
  da cadena vacia y join de un array de un elemento da ese elemento sin
  importar el separador, propiedad del lenguaje) - pero esto no sustituye
  la medicion oficial de Stryker, que sigue siendo la puerta C7.

## Cambios requeridos (si aplica)

Ninguno. La feature puede pasar a mutation_tester para que repita la
medicion oficial sobre src/components/Faq-logica.ts; si confirma el 100%
(o documenta el mutante Faq-logica.ts:49 como equivalente con el mismo
protocolo ya aplicado a telefono.ts:13 y contraste.ts:36), la feature queda
lista para que craftsman_lead la marque done.
