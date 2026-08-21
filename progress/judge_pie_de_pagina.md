# Review — feature pie_de_pagina (id 13)

**Veredicto:** APPROVED

## Cobertura de escenarios (@s <-> test)

Verificado uno a uno contra el codigo real (PieDePagina.test.tsx,
PieDePagina-logica.test.ts), no solo contra la bitacora del tdd_craftsman.

- @s1: [x] cubierto (contentinfo unico, nombre y descripcion exactos, logo decorativo, cadenas prohibidas ausentes) — PieDePagina.test.tsx:14-35
- @s2: [x] cubierto (3 heading en orden, cada uno seguido de ul con 4 listitem y 1 link) — PieDePagina.test.tsx:37-57
- @s3: [x] cubierto (4 enlaces Clinica, destinos exactos, sin target) — PieDePagina.test.tsx:59-73
- @s4: [x] cubierto (4 enlaces Contenido, destinos exactos, sin target) — PieDePagina.test.tsx:75-89
- @s5: [x] cubierto (3 telefonos reales + Como llegar, digitos consistentes) — PieDePagina.test.tsx:98-118
- @s6: [x] cubierto (rotulo real, sin 24h, sin heading/banner de urgencias) — PieDePagina.test.tsx:120-139
- @s7: [x] cubierto (sin mailto, sin arroba, 4 enlaces intactos, ancla a datosNegocio.email real) — PieDePagina.test.tsx:141-163
- @s8: [x] cubierto (sin bloque de redes, ancla a datosNegocio.redesSociales real) — PieDePagina.test.tsx:165-191
- @s9: [x] cubierto (3 enlaces legales exactos) — PieDePagina.test.tsx:199-219
- @s10: [x] cubierto (target blank, rel seguro, sufijo de nombre) — PieDePagina.test.tsx:221-237
- @s11: [x] cubierto (2 paginas inyectadas, sin Privacidad) — PieDePagina.test.tsx:239-263
- @s12: [x] cubierto (logica pura + render) — PieDePagina-logica.test.ts:4-14 y PieDePagina.test.tsx:265-273
- @s13: [x] cubierto (logica pura + render) — PieDePagina-logica.test.ts:16-23 y PieDePagina.test.tsx:275-284
- @s14: [x] cubierto (barrido de texto y hrefs contra el prototipo heredado) — PieDePagina.test.tsx:301-318
- @s15: [x] cubierto (throw con el valor recibido, sin tel:+34 en el DOM) — PieDePagina.test.tsx:320-325

Los 15 escenarios quedan cubiertos, ninguno sin test.

## Puntos de atencion especificos del encargo

(a) @s7/@s8 guardan contra datosNegocio.email/redesSociales reales, no
contra un doble hardcodeado sin relacion con la fuente. Confirmado:
PieDePagina.test.tsx:143 (expect(datosNegocio.email).toBeUndefined()) y
PieDePagina.test.tsx:167 (expect(datosNegocio.redesSociales).toEqual([]))
importan datosNegocio de src/lib/site.ts (site.ts:68-70) y verifican la
premisa contra la fuente real antes de afirmar la ausencia en el DOM. Si la
fuente cambiara a declarar un email, este test fallaria de inmediato en vez
de seguir pasando por vacuidad. Nunca existio codigo de mailto/redes en
ningun ciclo (grep sobre PieDePagina.tsx y PieDePagina-logica.ts: cero
coincidencias de "mailto", "redes", "facebook"), asi que la ausencia es
estructural y no un "if" sin ejercitar.

(b) El calculo del ano de copyright es una funcion pura que recibe la fecha
como parametro, nunca Date.now() implicito. Confirmado en
PieDePagina-logica.ts:36-38:

    export function textoCopyright(fecha: Date, nombreComercial: string): string {
      return `(c) ${fecha.getFullYear()} ${nombreComercial}`
    }

grep -rn "Date.now|new Date()" src solo devuelve una coincidencia real:
PieDePagina.tsx:60 (textoCopyright(fecha ?? new Date(), ...)), que es el
borde de sistema correcto: el .tsx inyecta el valor por defecto, la logica
pura sigue recibiendo la fecha como dato explicito, testeada en
PieDePagina-logica.test.ts con fechas literales (new Date(2026, 7, 17) /
new Date(2027, 0, 1)), sin depender del reloj del entorno de test.

(c) @s15 depende del mismo enlaceLlamada que falla cerrado en el resto del
proyecto, sin duplicar esa validacion. Confirmado el camino completo:
PieDePagina.tsx:53-58 pasa telefonoUrgencias sin try/catch a
construirEnlacesContacto (PieDePagina-logica.ts:62-78), que llama a
construirEnlaceTelefono (InformacionContacto-logica.ts:25-27, la misma
funcion que ya usan informacion_contacto y formulario_contacto), que llama a
enlaceLlamada/normalizarTelefono (src/lib/telefono.ts:21-42, la unica
implementacion del proyecto). No hay ninguna regex ni validacion de digitos
redeclarada en PieDePagina-logica.ts. El error se propaga sin capturarse
hasta el test (PieDePagina.test.tsx:322, toThrow('91 851 13')), consistente
con el modo de error "falla cerrado" de project-spec.md y con el precedente
de Hero.tsx/InformacionContacto.tsx (sin try/catch alrededor del telefono).

Nota menor, no bloqueante: el Given de @s15 en
features/pie_de_pagina.feature:207 describe el valor "91 851 13" como "que
tiene ocho digitos"; en realidad tiene 7 (9,1,8,5,1,1,3). No afecta la
cobertura ni el comportamiento (ninguna clausula Then del escenario verifica
el conteo de digitos, solo el literal exacto, que si coincide byte a byte
con el test), pero conviene corregir la prosa del .feature en una proxima
pasada de gherkin_author.

## Disciplina TDD

- Produccion sin test que la pida? NO. Revisados PieDePagina.tsx,
  PieDePagina-logica.ts, src/data/pieDePaginaEnlaces.ts y
  src/data/paginasLegales.ts linea a linea contra los 15 escenarios: cada
  rama, constante y prop esta pedida por al menos un test. La rama
  "rotulo === undefined" de nombreEnlaceUrgencias (PieDePagina-logica.ts:45-47)
  no la ejercita ningun @s (la fuente real siempre declara rotulo de
  urgencias), pero es necesaria por el tipo "rotuloUrgencias: string |
  undefined" del propio datosNegocio (otros telefonos sin rotulo usan la
  misma funcion crearTelefono de site.ts), y el tdd_craftsman la cubrio con
  un test de refuerzo explicitamente rotulado como tal
  (PieDePagina-logica.test.ts:25-36), no oculto ni disfrazado de escenario.
  No hay id/aria-*/atributos sin test, ni helpers muertos.
- Evidencia de Rojo-Verde-Refactor? SI. progress/tdd_pie_de_pagina.md
  documenta 15 ciclos en orden estricto, con la "trampa legitima" declarada
  en @s2 (placeholder ENLACES_PROVISIONALES, sustituido en @s3/@s4 cuando un
  test rojo real lo exigio) y verificacion por sabotaje manual + reversion en
  los puntos de mayor riesgo de "verde a la primera" (@s6, mitad logica de
  @s13). Para @s7/@s8/@s14 el razonamiento de por que no hacia falta
  sabotaje (nunca existio la rama contraria) es valido y verificable de
  forma independiente por grep (sin resultados de "mailto"/"redes
  sociales"/cadenas heredadas en la produccion antes de esta ronda). Refactor
  documentado y verificado en verde: extraccion de logica del .tsx al
  -logica.ts (Invariante 6 de project-spec.md), unificacion del tipo de
  enlace de columna, fix de lint sobre el valor por defecto de fecha.

## Calidad

- Funciones cortas, un solo motivo para cambiar. PieDePagina-logica.ts:
  construirEnlacesLegales, textoCopyright, nombreEnlaceUrgencias (privada) y
  construirEnlacesContacto -- cada una hace una sola cosa, ninguna pasa de
  ~10 lineas. PieDePagina.tsx solo cablea: arma props, llama a la logica
  pura, renderiza; ColumnaEnlaces es el unico subcomponente y es trivial.
- Nombres reveladores. SUFIJO_VENTANA_NUEVA, SEPARADOR_ROTULO,
  NOMBRE_COMO_LLEGAR, DESTINO_COMO_LLEGAR -- constantes con nombre, sin
  literales magicos sueltos en el cuerpo de las funciones.
- Sin duplicacion. construirEnlaceTelefono se reutiliza de
  InformacionContacto-logica.ts (no hay una segunda implementacion de
  "formatear telefono a enlace" en el pie); EnlacePieDePagina es un unico
  tipo compartido entre src/data/pieDePaginaEnlaces.ts, PieDePagina-logica.ts
  y PieDePagina.tsx (confirmado: grep de "EnlacePieColumna" sin resultados,
  el refactor citado en la bitacora elimino la interfaz duplicada).
  ENLACES_CLINICA/ENLACES_CONTENIDO siguen el mismo patron de catalogo
  readonly que navegacion.ts/servicios.ts/equipo.ts, ya aprobado en features
  previas.
- Sin numeros magicos. No se detectan literales numericos sin nombrar en
  los ficheros tocados (aparte de getFullYear(), que es una llamada de API,
  no un numero magico).
- Contrato de errores correcto. enlaceLlamada/normalizarTelefono lanzan
  Error con el valor original en el mensaje (telefono.ts:16-18);
  PieDePagina.tsx no lo intercepta, deja que el render falle -- consistente
  con "dato invalido -> falla cerrado" de project-spec.md y con el patron ya
  usado en Hero.tsx/InformacionContacto.tsx (a diferencia del patron
  distinto y tambien valido de CampanasPortada.tsx, que si envuelve en
  try/catch porque su contrato es "dato ausente/invalido -> no se renderiza
  el bloque"; aqui el escenario @s15 exige explicitamente que la operacion
  "falla lanzando un error", asi que el patron elegido es el correcto para
  este contrato).
- Respeta docs/architecture.md y los patrones ya establecidos del proyecto.
  Logica de decision en modulo puro (*-logica.ts), dato de negocio derivado
  de la fuente unica (datosNegocio de src/lib/site.ts), catalogos estaticos
  fuera de datosNegocio siguiendo el precedente ya aprobado de
  servicios.ts/equipo.ts/navegacion.ts (paginas legales y anclas internas no
  son "datos de negocio" en el sentido de la Invariante 2, son contenido de
  contrato fijo del propio .feature, mismo criterio usado y aprobado en
  features anteriores). stryker.config.json:11-17 confirma que
  PieDePagina-logica.ts cae dentro del glob mutable (src/**/*-logica.ts) y
  que los catalogos de datos y el .tsx quedan fuera, por diseno.
- Citas de project-spec.md verificadas contra la fuente, no solo contra la
  cabecera del .feature: Decision 7 (project-spec.md:88, enlaces legales
  reales) e Invariante 2 (project-spec.md:53-55, dato de negocio unica
  fuente) existen tal cual se citan en features/pie_de_pagina.feature:7-9.

## Checkpoints

- C1: [x] Ficheros base presentes; `node .harness/harness.mjs init` -> verde
  de punta a punta (lint limpio, typecheck limpio, 294/294 tests).
- C2: [x] Una sola feature in_progress (pie_de_pagina, id 13, confirmado en
  feature_list.json); toda feature done conserva sus tests en verde (294/294
  incluye las 11 features done previas); progress/current.md describe la
  sesion activa, no basura.
- C3: [x] src/ solo anade los modulos previstos por el propio diseno
  (PieDePagina.tsx, PieDePagina-logica.ts, dos catalogos de datos); sin
  dependencias externas nuevas; sin console.*/TODO/FIXME/debugger en los
  ficheros tocados (grep sin resultados).
- C4: [x] Hay tests por modulo (PieDePagina.test.tsx,
  PieDePagina-logica.test.ts); usan DOM real via Testing Library/jsdom, sin
  mocks de sistema de ficheros; `pnpm run test` -> 294/294 verde.
- C5: [~] `git status` solo muestra los ficheros nuevos esperados de esta
  feature mas progress/current.md; no hay temporales sospechosos. Pendiente
  de cierre de sesion (no bloqueante a mitad de sesion, mismo criterio que
  features previas).
- C6: [x] .feature con "sdd": true, escenarios @s1..@s15 cada uno con un
  Then medible; mapa @s -> test completo en progress/tdd_pie_de_pagina.md;
  sin produccion no pedida por un test (ver seccion de disciplina TDD).
- C7: [ ] Pendiente -- corresponde a mutation_tester (umbral 1.0 en
  harness.config.json), puerta posterior a esta.

## Cambios requeridos (si aplica)

Ninguno. La unica observacion (prosa "ocho digitos" en
features/pie_de_pagina.feature:207) es cosmetica, no afecta cobertura ni
comportamiento, y no bloquea esta puerta.
