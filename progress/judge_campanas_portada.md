# Review — feature campanas_portada (id 9)

## Ronda 1 — 2026-08-20

**Veredicto:** APPROVED

Verificación propia, no basada en el relato de `tdd_craftsman`: leídos línea a
línea `features/campanas_portada.feature` (21 `@s`), `progress/tdd_campanas_portada.md`,
`src/components/CampanasPortada.tsx`, `src/components/CampanasPortada-logica.ts`,
`src/components/CampanasPortada.test.tsx`, `src/components/CampanasPortada-logica.test.ts`
y `src/data/campanas.ts`. `node .harness/harness.mjs init` corrido dos veces
por mí (antes y después del sabotaje manual): verde, 213/213 tests, lint y
typecheck sin errores. Aplicados 6 sabotajes manuales propios sobre los
ficheros de producción (no reproduje los del `tdd_craftsman`, hice los míos),
cada uno revertido byte a byte (`diff` contra copia de respaldo confirma
igualdad exacta tras revertir):

1. `<span>Demostración</span>` a `<span>Demostración 49 € Hasta el 30 de
   septiembre Plazas limitadas SABOTAJE_TEMPORAL</span>` produce rojo exacto
   en @s3, @s6, @s7, @s8 y, como colateral esperado (mismo literal
   `getByText` exacto), @s14. Confirma que @s6/@s7/@s8 muerden contenido
   comercial real, no solo el caso feliz.
2. `href="/campanas"` de la tarjeta (línea 41) a `href="/campanas-sabotaje-temporal"`
   produce rojo exacto en @s11, nada más.
3. `href="/campanas"` del enlace de acción (línea 49) sabotajeado produce
   rojo exacto en @s12, nada más.
4. Ruta de imagen local del catálogo cambiada a una URL Pexels remota
   produce rojo exacto en @s13, nada más.
5. `if (modelo.length === 0)` cambiado a `if (false)` (guardián de vacuidad)
   produce rojo en @s15, @s17, @s18 y @s21 (más amplio que lo que
   documentaba la bitácora, que solo citaba @s15/@s17 para este sabotaje
   concreto, pero es el resultado correcto: los 4 escenarios dependen del
   mismo guardián).
6. El filtro de título vacío neutralizado a `catalogo.filter(() => true)`
   produce rojo en @s16, @s17, @s19, @s20.
7. `if (campana.vigencia !== undefined)` cambiado a `if (false && campana.vigencia !== undefined)`
   produce rojo exacto en @s10 y @s21, con @s9 (rama de precio) intacta —
   confirma que ambas ramas de fallo cerrado son independientes y están
   cada una bajo prueba.

Todos los sabotajes fueron revertidos antes de escribir este veredicto;
`node .harness/harness.mjs init` quedó verde de nuevo tras la restauración
(213/213).

## Cobertura de escenarios (@s ↔ test)

Verificado contra el fichero de test real, no contra la tabla de la
bitácora (aunque coincide con ella):

- @s1: [x] `CampanasPortada.test.tsx:14` "@s1 la sección se anuncia como una región con su encabezado"
- @s2: [x] `CampanasPortada.test.tsx:27` "@s2 se muestra una tarjeta por cada campaña del catálogo de demo"
- @s3: [x] `CampanasPortada.test.tsx:47` "@s3 cada tarjeta muestra su estado..."
- @s4: [x] `CampanasPortada.test.tsx:64` "@s4 el aviso de contenido de demostración..."
- @s5: [x] `CampanasPortada.test.tsx:78` "@s5 el nombre accesible de cada tarjeta..."
- @s6: [x] `CampanasPortada.test.tsx:94` "@s6 ninguna tarjeta muestra un precio" — la cláusula "ninguna tarjeta expone un campo de precio" no tiene aserción DOM propia; queda cubierta por argumento estructural documentado en la bitácora (@s9 hace imposible que una entrada con precio sobreviva a construirModeloCampanas) y verificado por mí en el sabotaje 1: no hay ningún camino de código que pinte un campo de precio, así que una aserción adicional sería vacua. No bloqueante.
- @s7: [x] `CampanasPortada.test.tsx:121` "@s7 ninguna tarjeta muestra fecha ni periodo de vigencia" — misma nota que @s6, con @s10 como respaldo estructural.
- @s8: [x] `CampanasPortada.test.tsx:136` "@s8 ninguna tarjeta afirma disponibilidad..."
- @s9: [x] `CampanasPortada-logica.test.ts:5` "@s9 una campaña con precio hace fallar..."
- @s10: [x] `CampanasPortada-logica.test.ts:13` "@s10 una campaña con vigencia hace fallar..."
- @s11: [x] `CampanasPortada.test.tsx:149` "@s11 cada tarjeta entera enlaza..."
- @s12: [x] `CampanasPortada.test.tsx:166` "@s12 el enlace de acción de la sección..."
- @s13: [x] `CampanasPortada.test.tsx:177` "@s13 las imágenes de las tarjetas se sirven en local"
- @s14: [x] `CampanasPortada.test.tsx:194` "@s14 una campaña sin imagen sigue mostrando su tarjeta"
- @s15: [x] `CampanasPortada.test.tsx:213` "@s15 con el catálogo de demo vacío..."
- @s16: [x] `CampanasPortada.test.tsx:222` "@s16 una campaña sin título se descarta..."
- @s17: [x] `CampanasPortada.test.tsx:244` "@s17 si ninguna campaña del catálogo es válida..."
- @s18: [x] `CampanasPortada.test.tsx:253` "@s18 un dato de campaña inválido..."
- @s19: [x] `CampanasPortada-logica.test.ts:21` "@s19 el modelo de la sección de campañas descarta..."
- @s20: [x] `CampanasPortada-logica.test.ts:36` "@s20 el modelo de la sección de campañas queda vacío..."
- @s21: [x] `CampanasPortada.test.tsx:262` "@s21 una vigencia inválida..."

21/21 escenarios con test concreto que los verifica.

## Disciplina TDD

- ¿Producción sin test que la pida? NO. Revisadas línea a línea
  `CampanasPortada.tsx` (52 líneas) y `CampanasPortada-logica.ts` (33
  líneas): cada rama, cada guardián y cada literal tiene un @s que lo
  exige, confirmado por sabotaje propio (ver arriba) en los puntos de mayor
  riesgo (span de estado, hrefs, origen de imagen, guardián de vacuidad,
  filtro de título, rama de vigencia). El `<li key={campana.titulo}>` es
  boilerplate de React (evita warnings de lista), no comportamiento sin
  test.
- ¿Evidencia de Rojo→Verde→Refactor? SÍ. `progress/tdd_campanas_portada.md`
  documenta 21 ciclos con su rojo (fallo de import, getByText sin
  resultado, toThrowError recibiendo undefined, excepción no capturada
  reventando el árbol de React, etc.) y su verde mínimo. Para los 8 ciclos
  "verde a la primera" (@s6, @s7, @s8, @s11, @s13, @s17, @s19, @s20) la
  bitácora documenta sabotaje manual con el resultado exacto, y yo repetí
  6 de esos 8 sabotajes de forma independiente (ver arriba), con resultados
  compatibles (en el caso del guardián de vacuidad, más amplios de lo que
  la bitácora afirmaba, pero sin ninguna discrepancia negativa: ningún
  sabotaje mío pasó desapercibido). El único refactor (eliminar una
  aserción de tipo redundante en construirModeloCampanas) está documentado
  y no cambió comportamiento.
- Aviso de colisión de sesión documentado en la propia bitácora y en
  `progress/current.md`: no afecta al veredicto de esta ronda. El código
  final es el que se auditó, y el borrador huérfano de la sesión duplicada
  fue descartado íntegro antes del primer test, con verificación de que
  ningún otro módulo dependía de él.

## Calidad

- `src/components/CampanasPortada-logica.ts`: módulo puro, sin tocar el DOM,
  dos funciones de error nombradas (errorPrecioNoConfirmado:9,
  errorVigenciaNoConfirmada:13) y una función de construcción de modelo
  (construirModeloCampanas:24) con un único motivo de cambio. Cumple el
  patrón arquitectura/logica-de-decision-en-modulo-puro-no-en-el-jsx: la
  decisión de fallar cerrado ante precio/vigencia y de descartar títulos
  vacíos vive aquí, no en el .tsx, y el fichero cae dentro del glob mordible
  de Stryker (src/**/*-logica.ts).
- `src/components/CampanasPortada.tsx`: solo cablea. Construye el modelo
  con construirModeloSeguro (try/catch, líneas 15-21, mismo modo de error
  "dato ausente → no se renderiza el bloque" que Servicios/Equipo/Galeria),
  aplica el guardián de vacuidad (línea 26) y pinta. Sin ternarios de
  decisión de negocio enterrados en JSX; la única condicional del JSX
  (campana.imagen !== undefined && <img.../>, línea 42) es presencia de
  dato, no una decisión de negocio, y es observable directamente en el DOM
  (no depende de css:false), así que no hace falta extraerla al módulo
  puro.
- Nombres reveladores (construirModeloCampanas, construirModeloSeguro,
  errorPrecioNoConfirmado), sin números mágicos, sin duplicación entre
  .tsx y -logica.ts.
- Contrato de errores: construirModeloCampanas lanza Error con mensaje que
  contiene exactamente "precio no confirmado" / "vigencia no confirmada"
  (@s9/@s10), verificado con toThrowError. El .tsx convierte esa excepción
  en "no renderizar nada" en vez de dejarla propagarse al árbol de React,
  consistente con el resto del proyecto.
- Patrón testing/doble-de-test-anclado-al-literal-no-al-simbolo aplicado
  correctamente: AVISO_DEMOSTRACION (CampanasPortada.test.tsx:61-62) está
  escrito a mano en el test, no importado de producción (CampanasPortada.tsx
  no exporta ese literal). Los catálogos de prueba de casos límite
  (CampanasPortada-logica.test.ts:7,15,24,38; CampanasPortada.test.tsx:196,225,246,255,265)
  se construyen con literales propios del test, sin reimportar CAMPANAS_DEMO
  para fabricar el doble.
- Patrón testing/verde-por-vacuidad-en-puerta-de-verificacion: no aplica
  literalmente (esto no es una puerta de build que derive un conjunto y
  concluya "protegido" de él), pero el caso análogo más cercano, el
  guardián modelo.length === 0, está probado explícitamente en ambos
  sentidos: catálogo vacío por construcción (@s15), catálogo no vacío pero
  sin entradas válidas tras el filtro (@s17) y sin entradas válidas tras un
  fallo cerrado (@s18/@s21). No hay hueco de "conjunto vacío = verde sin
  mirar" sin cubrir.

## Checkpoints

- C1: [x] Ficheros base presentes, `node .harness/harness.mjs init` verde (verificado por mí, dos corridas).
- C2: [x] Única feature in_progress (campanas_portada, id 9, confirmado con feature_list.json); progress/current.md describe la sesión activa (incluye notas de colisión, no basura de sesiones cerradas).
- C3: [x] src/ solo añade los módulos previstos (CampanasPortada.tsx, CampanasPortada-logica.ts, src/data/campanas.ts + tests); sin dependencias nuevas (package.json/pnpm-lock.yaml sin tocar); sin TODOs ni logs de depuración (grep sin resultados).
- C4: [x] Un test por módulo (CampanasPortada.test.tsx, CampanasPortada-logica.test.ts); Testing Library + jsdom real, sin mocks de sistema de ficheros; vitest sobre ambos ficheros da 21/21.
- C5: pendiente de cierre de sesión (no bloqueante a mitad de sesión, mismo criterio aplicado a features previas de este proyecto, ver progress/judge_tokens_marca.md).
- C6: [x] .feature con "sdd": true, 21 @s medibles, mapa @s → test completo en progress/tdd_campanas_portada.md y verificado por mí contra el código real; sin producción sin test que la exija.
- C7: pendiente, corresponde a mutation_tester (umbral 1.0), no a esta puerta.

## Cambios requeridos

Ninguno.

## Ronda 2 — 2026-08-20 (re-revisión tras refuerzo de mutación)

**Veredicto:** APPROVED

**Contexto:** el `mutation_tester` (ronda 1, `progress/mutation_campanas_portada.md`)
midió **FAIL** sobre `src/components/CampanasPortada-logica.ts`: 18/21 =
85.71%, 3 supervivientes no equivalentes (dos por `toThrowError(regex)` sin
verificar `instanceof Error`, uno por ausencia de un caso "título solo
espacios" para `.trim()`). El `tdd_craftsman` reforzó en
`progress/tdd_campanas_portada.md` § "Ronda 3" con 3 tests nuevos en
`CampanasPortada-logica.test.ts`, **cero cambios de producción**. Esta ronda
verifica ese refuerzo de forma independiente, sin fiarme del relato.

### Verificación propia (sabotaje manual sobre los 3 mutantes exactos)

Aplicados los 3 mutantes citados en `progress/mutation_campanas_portada.md`
uno a uno sobre `src/components/CampanasPortada-logica.ts`, cada uno
revertido byte a byte antes del siguiente (confirmado con `diff` contra una
copia de respaldo: `IDENTICAL` tras cada reversión, y de nuevo al final).
`node .harness/harness.mjs init` corrido antes y después de la ronda de
sabotaje: verde, 216/216, lint y typecheck sin errores.

1. **Mutante id 0** (`errorPrecioNoConfirmado` → cuerpo vacío, `throw
   undefined`): `pnpm exec vitest run CampanasPortada-logica.test.ts
   CampanasPortada.test.tsx` → **1/24 en rojo**, exactamente
   `@s9 > lo lanzado es una instancia real de Error con el mensaje exacto, no
   un valor vacío` (`expected undefined to be an instance of Error`). Ningún
   otro test se mueve.
2. **Mutante id 2** (`errorVigenciaNoConfirmada` → cuerpo vacío): mismo
   resultado, exactamente `@s10 > lo lanzado es una instancia real de Error
   con el mensaje exacto, no un valor vacío` en rojo, 23/24 en verde.
3. **Mutante id 19** (`catalogo.filter(titulo.trim() !== '')` →
   `catalogo.filter(titulo !== '')`, quita `.trim()`): exactamente
   `@s19 > descarta también un título compuesto solo por espacios en blanco,
   no solo la cadena vacía` en rojo (`expected length 2 but got 3`), 23/24 en
   verde.

Los 3 mutantes que motivaron el refuerzo mueren exactamente con los 3 tests
nuevos, sin colaterales inesperados y sin dejar ningún hallazgo del informe
de mutación sin atender.

### Cobertura de escenarios (@s ↔ test) — releída completa

Sin cambios respecto a la ronda 1: el refuerzo añade aserciones dentro de
`describe` ya existentes (`@s9`, `@s10`, `@s19` en
`CampanasPortada-logica.test.ts`), no añade ni retira ningún escenario.
Releído `CampanasPortada.test.tsx` completo (272 líneas) y confirmado que
sigue teniendo exactamente los mismos 17 `describe` de la ronda 1 (@s1-@s8,
@s11-@s18, @s21), sin tocar. **21/21 escenarios siguen con test concreto que
los verifica** — ver tabla de la ronda 1, no repetida aquí por no haber
cambiado.

### Disciplina TDD

- ¿Producción sin test que la pida? **NO.** `src/components/CampanasPortada-logica.ts`
  releído línea a línea: idéntico al que aprobó la ronda 1 (33 líneas, mismas
  funciones `errorPrecioNoConfirmado`/`errorVigenciaNoConfirmada`/
  `construirModeloCampanas`). Confirmado con evidencia de timestamps de
  filesystem que durante la ronda de refuerzo **solo**
  `src/components/CampanasPortada-logica.test.ts` cambió de fecha de
  modificación (20:46) frente a `CampanasPortada.tsx` (20:22),
  `src/data/campanas.ts` (20:21) y el propio `-logica.ts` (sin tocar hasta mi
  propio sabotaje-y-reversión de esta ronda) — coincide exactamente con lo
  que documenta `progress/tdd_campanas_portada.md` § "Verificación final de
  la ronda" (`git diff` vacío sobre el fichero de producción).
- ¿Tests vacuos? **NO.** Los 3 tests nuevos no son tautológicos ni redundantes
  con los ya existentes: cada uno falla si y solo si se reintroduce el
  mutante exacto que lo motivó (verificado arriba de forma independiente,
  sin colaterales), y ninguno reimporta una constante de producción para
  fabricar el valor esperado (comparan contra literales escritos a mano:
  `'La campaña "Vacunaciones" declara un precio no confirmado: "49 €"'`,
  etc. — patrón `doble-de-test-anclado-al-literal-no-al-simbolo` respetado).
- ¿Evidencia de Rojo→Verde→Refactor? **SÍ**, para el refuerzo:
  `progress/tdd_campanas_portada.md` § "Ronda 3" documenta, para cada uno de
  los 3 tests, un ciclo sabotaje→rojo exacto→reversión antes de dejarlo en
  el fichero final, mismo patrón que las rondas anteriores del proyecto
  (`datos_negocio`, `galeria`). No hay refactor adicional en esta ronda (no
  hacía falta: los 3 tests son cortos y no duplican los ya existentes en el
  mismo `describe`).

### Calidad — foco en lo que cambió

- `CampanasPortada-logica.test.ts:12-24` y `:34-48`: capturan el valor
  lanzado con `try/catch` en vez de depender solo de `toThrowError(regex)` —
  exactamente la causa raíz que documentó `mutation_tester` (el matcher no
  distingue "lanzó `Error`" de "lanzó `undefined`" cuando el valor es
  falsy). Nombres de test descriptivos, sin números mágicos nuevos, sin
  duplicación de lógica de aserción entre los dos bloques (misma forma,
  literales distintos, aceptable — no hay abstracción que valga la pena para
  2 casos).
- `CampanasPortada-logica.test.ts:65-76`: extiende el `describe` de `@s19`
  con un catálogo de 3 entradas (título con espacios en medio de dos
  válidos), reutilizando el mismo patrón de aserción
  (`toHaveLength`/`.map(...).toEqual(...)`) que el test hermano de la línea
  52-63. Ningún número mágico: `'   '` es el propio caso de negocio bajo
  prueba, no una constante que debiera nombrarse.
- No se tocó ningún otro fichero de producción ni de test (`CampanasPortada.tsx`,
  `CampanasPortada.test.tsx`, `src/data/campanas.ts`) — confirmado por
  timestamps y por relectura completa, coincide con lo declarado.

### Checkpoints

- C1: [x] `node .harness/harness.mjs init` verde (verificado por mí, dos
  corridas: antes y después de mi ronda de sabotaje-y-reversión), 216/216.
- C2: [x] `campanas_portada` sigue siendo la única `in_progress` en
  `feature_list.json`.
- C3: [x] Sin ficheros nuevos fuera de lo previsto; sin dependencias nuevas;
  sin TODOs ni logs de depuración en el fichero de test reforzado.
- C4: [x] `CampanasPortada-logica.test.ts` sigue siendo un test por módulo,
  ahora 7 casos (antes 4); Testing Library + jsdom real, sin mocks de
  sistema de ficheros.
- C5: pendiente de cierre de sesión (no bloqueante a mitad de sesión, mismo
  criterio que rondas anteriores).
- C6: [x] 21/21 `@s` con test concreto, mapa sin cambios respecto a la ronda
  1 y releído contra el código real; sin producción sin test que la exija.
- C7: pendiente — corresponde a que `mutation_tester` repita la medición
  oficial sobre `src/components/CampanasPortada-logica.ts` y confirme
  21/21 = 100 %. Esta ronda del `judge` da señal fuerte de que debería
  cerrar (los 3 mutantes exactos mueren, verificado de forma independiente),
  pero la medición formal de Stryker sigue siendo responsabilidad del
  `mutation_tester`, no de esta puerta.

### Cambios requeridos

Ninguno.
