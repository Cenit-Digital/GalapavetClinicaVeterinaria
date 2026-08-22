# TDD — `seo_estructura` (id 15)

> Ronda 1, sesión única, TDD estricto desde cero. `features/seo_estructura.feature`
> (22 escenarios, @s1-@s22) leído completo antes de escribir nada, junto con
> `docs/datos-galapavet.md`, `project-spec.md` (Decisión 13, sección
> "Transversales → seo_estructura") y `src/lib/site.ts`.

## Diseño

No existe ningún precedente de SEO en el repo (grep confirmado: 0
coincidencias de `helmet`/`document.title`/`JSON-LD` fuera de este contrato).
Este proyecto no usa `react-helmet`. Diseño propio, en capas, siguiendo el
patrón ya validado del proyecto (`logica-de-decision-en-modulo-puro-no-en-el-jsx`):

```
src/lib/seo-logica.ts              ← módulo PURO, mordible por Stryker
  - METADATOS_PAGINAS               catálogo de las 6 páginas (título/descripción)
  - validarMetadatos()              detecta descripción duplicada (@s6)
  - construirDatosEstructurados()   construye el JSON-LD, omite lo ausente

src/lib/site.ts (AMPLIADO)          ← misma fuente única, Invariante 2
  - datosNegocio.direccion ahora expone también
    calle/codigoPostal/localidad/region, estructurados, de los que
    "lineas"/"unaLinea" (ya existentes) se siguen derivando —
    byte-idénticos a antes, verificado.

src/lib/datosEstructuradosNegocio.ts ← constante compartida
  - DATOS_ESTRUCTURADOS_NEGOCIO = construirDatosEstructurados(datosNegocio...)
    calculada UNA vez; la usan las 3 subpáginas que no necesitan override.

src/components/MetadatosPagina.tsx  ← ÚNICO punto de efectos sobre <head>
  - document.title, meta description, Open Graph (og:title/type/image/url/locale),
    <script type="application/ld+json"> — upsert por atributo/id, nunca duplica.
  - Componente que "solo cablea": no decide nada, no vive en el glob de Stryker
    de forma relevante (sin ramas de decisión propias).

src/pages/Landing.tsx, PaginaCampanas.tsx, PaginaBlog.tsx, PaginaTienda.tsx
  - cada uno monta <MetadatosPagina> con sus propios metadatos y el bloque
    JSON-LD. Landing es la única con override (`calleDireccion`, solo para @s11).
```

### Decisiones de diseño que no estaban en el contrato pero lo satisfacen

1. **@s1-@s3 (lang/charset/viewport) ya estaban correctos en `index.html`**
   desde `ensamblaje_landing`/`selector_paleta` (`<html lang="es-ES">`,
   `<meta charset="UTF-8">`, `<meta name="viewport" content="width=device-width,
   initial-scale=1.0">`). Cero producción nueva: solo se ancla con test que lee
   `index.html?raw` (mismo patrón que `SelectorPaleta-logica.test.ts` @s10).
   Verificado con sabotaje manual en los tres (no "verde-por-vacuidad").
2. **Tipo Schema.org exacto**: `["VeterinaryCare","LocalBusiness"]`, investigado
   contra el vocabulario real (jerarquía `Thing > Organization >
   MedicalOrganization > VeterinaryCare`, sin `openingHoursSpecification`/`geo`
   propios; `LocalBusiness` los aporta vía `Place`). Documentado en la cabecera
   del `.feature`, implementado literal.
3. **Horario → `OpeningHoursSpecification`**: en vez de re-tipear los tramos,
   `construirEspecificacionesHorario` PARSEA `datosNegocio.horario` (la misma
   fuente que ya usa `InformacionContacto`, con el comentario `(@s13, @s14)`
   ya presente en `site.ts` desde antes de esta sesión — señal explícita de
   que esta feature debía reutilizar exactamente ese array). Un diccionario
   `"Lunes a viernes"→5 días`/`"Sábados"→1 día` + una regex
   `/(\d{2}:\d{2}) a (\d{2}:\d{2})/g` sobre `horas` derivan 3
   `OpeningHoursSpecification` de los 3 `{dias,horas}` reales, sin duplicar
   ningún literal de hora. "Domingos"/"Cerrado" no produce ningún tramo (la
   regex no encuentra ningún rango horario en "Cerrado") — la omisión de
   domingo es estructural, no un `if` especial.
4. **Dirección estructurada en `site.ts`**: `crearDireccion` pasó de recibir
   `[calle, segundaLinea]` ya compuestas a recibir `{calle, codigoPostal,
   localidad, region}` y DERIVAR `lineas`/`unaLinea` de ahí (antes era al
   revés). Verificado que la salida de `lineas`/`unaLinea` es byte-idéntica
   a la anterior (`site.test.tsx` @s17/@s18, ya existentes, siguen en verde
   sin tocarlos). Evita duplicar "28260"/"Galapagar"/"Madrid" en dos sitios
   (Invariante 2, instrucción explícita del encargo).
5. **Teléfono del JSON-LD**: `normalizarTelefono` (`src/lib/telefono.ts`,
   ya `done`/100% mutado) sobre `telefonoClinica.textoVisible` → nunca se
   reescribe el teléfono a mano ni se inventa el prefijo `+34` (ya
   documentado como derivación, no dato nuevo, en la cabecera del `.feature`).
6. **`geo` no tiene NINGÚN camino de código que lo emita** (ni siquiera
   condicional): `datos.coordenadas` se acepta en el tipo de entrada
   (para que los fixtures de @s15/@s21/@s22 compilen) pero
   `construirDatosEstructurados` nunca lo lee. Es la lectura literal de
   "por qué geo se omite por completo hoy" del encargo: no hay ninguna cita
   verificada de coordenadas, así que no hay ninguna rama que las use.
   Verificado con sabotaje manual (ver más abajo) que @s21 SÍ habría cazado
   una implementación ingenua que solo comprobara `coordenadas !== undefined`
   sin comprobar `latitud`/`longitud` por separado.
7. **Metadatos de las 6 páginas**: copy nueva (no es un dato de negocio, es
   texto descriptivo de página, igual que los avisos de demostración ya
   existentes en `pagina_campanas`/`pagina_blog`/`pagina_tienda`), redactada
   con cuidado para que los 6 fragmentos exigidos por @s4/@s5 (Galapagar /
   prevención / Ficha / Blog / Artículo / Tienda) NUNCA aparezcan en el
   título/descripción de una página distinta a la suya (verificado por test,
   no solo a ojo).
8. **`calleDireccion` en `Landing`**: única prop nueva, mismo patrón ya
   usado en el proyecto (`catalogo` en `PaginaCampanas`/`PaginaBlog`/
   `PaginaTienda`) para poder sustituir un dato en un test sin tocar
   `site.ts` en tiempo de ejecución. Por defecto, `datosNegocio.direccion.calle`
   — en producción nunca se usa un valor distinto al real.

## Trazabilidad @s → test

| @s | Escenario | Test |
| --- | --- | --- |
| @s1 | `lang="es-ES"`, BCP 47 | `src/documento.test.ts` → `@s1 …` (2 tests) |
| @s2 | UTF-8 antes del `<body>` | `src/documento.test.ts` → `@s2 …` |
| @s3 | viewport adaptable, sin bloquear zoom | `src/documento.test.ts` → `@s3 …` |
| @s4 | 6 títulos propios/únicos | `src/lib/seo-logica.test.ts` → `@s4 …` (2 tests) + `src/paginasSeo.test.tsx` → `@s4/@s5 (integración) …` (7 tests) |
| @s5 | 6 descripciones propias/únicas | `src/lib/seo-logica.test.ts` → `@s5 …` (2 tests) |
| @s6 | descripción duplicada falla nombrando | `src/lib/seo-logica.test.ts` → `@s6 …` (2 tests) |
| @s7 | 1 bloque, JSON válido, objeto | `src/lib/seo-logica.test.ts` → `@s7 …` + `src/components/MetadatosPagina.test.tsx` → `@s7 …` (2 tests, incl. no-duplicación al navegar) |
| @s8 | tipo `["VeterinaryCare","LocalBusiness"]` exacto | `src/lib/seo-logica.test.ts` → `@s8 …` |
| @s9 | `PostalAddress` con 5 propiedades exactas | `src/lib/seo-logica.test.ts` → `@s9 …` + `src/lib/site.test.tsx` → `seo_estructura @s9 …` |
| @s10 | máquina y persona coinciden (portada) | `src/paginasSeo.test.tsx` → `@s10 …` |
| @s11 | cambiar la fuente mueve visible + JSON-LD | `src/paginasSeo.test.tsx` → `@s11 …` |
| @s12 | mismo negocio en las 6 páginas | `src/paginasSeo.test.tsx` → `@s12 …` + `src/lib/datosEstructuradosNegocio.test.ts` |
| @s13 | 3 tramos exactos, `OpeningHoursSpecification` | `src/lib/seo-logica.test.ts` → `@s13 …` |
| @s14 | domingo nunca aparece, ninguna forma | `src/lib/seo-logica.test.ts` → `@s14 …` (2 tests) |
| @s15 | sin coordenadas, `geo` se omite entero | `src/lib/seo-logica.test.ts` → `@s15 …` |
| @s16 | sin email/redes, se omiten sus propiedades | `src/lib/seo-logica.test.ts` → `@s16 …` |
| @s17 | horario vacío omite la propiedad entera | `src/lib/seo-logica.test.ts` → `@s17 …` |
| @s18 | sin valoración/registro/fundación | `src/lib/seo-logica.test.ts` → `@s18 …` |
| @s19 | sin "24 h"/7 días en horario ni copy | `src/lib/seo-logica.test.ts` → `@s19 …` (2 tests) |
| @s20 | Open Graph, `es_ES` con guion bajo | `src/components/MetadatosPagina.test.tsx` → `@s20 …` |
| @s21 | solo latitud → `geo` se sigue omitiendo | `src/lib/seo-logica.test.ts` → `@s21 …` |
| @s22 | email presente no fuerza redes | `src/lib/seo-logica.test.ts` → `@s22 …` |

Las 22 `@s` tienen al menos un test concreto. Además, dos tests de soporte sin
`@s` propio (el teléfono del JSON-LD coincide en dígitos con el real; ambos
citados como refuerzo directo de @s10 en sus propios `describe`).

## Ciclos Rojo-Verde-Refactor (resumen; orden real de ejecución)

1. **@s4/@s5/@s6** — Rojo: import de `seo-logica` inexistente (no compila).
   Verde: `METADATOS_PAGINAS` (6 literales) + `validarMetadatos`.
2. **@s8/@s9** — Rojo: `construirDatosEstructurados` no existe. Verde: función
   mínima con `@context`/`@type`/`name`/`address`.
3. **@s13/@s14** — Rojo: `openingHoursSpecification` no está en el bloque.
   Verde: diccionario de días + regex de tramos + `flatMap`.
   Sabotaje manual: forzar `openingHoursSpecification` siempre presente
   (quitar la guarda `.length > 0`) → @s17 cae en rojo → revertido, 13/13 verde.
4. **@s7/@s17** — Verdes a la primera con lo ya construido (generalización
   natural del paso 3). Verificado con sabotaje del paso 3 (mismo commit
   lógico) que @s17 sí muerde.
5. **Teléfono (soporte @s10) + @s15/@s16/@s18/@s19/@s21/@s22** — Rojo:
   `telephone`/`email`/`sameAs` no existen todavía (2 tests en rojo:
   teléfono y @s22). Verde: `normalizarTelefono`, `email`/`sameAs`
   condicionales. @s15/@s16/@s18/@s19/@s21 ya estaban verdes (nunca hubo
   código de `geo`/valoración/registro): verificados con sabotaje manual
   —añadir a mano una rama `geo` que solo comprobara `coordenadas !==
   undefined`— @s21 cae en rojo (latitud sin longitud emitía `geo` con
   `longitude` colada); revertido, 20/20 verde. Confirma que la ausencia de
   código de `geo` está genuinamente probada, no es hueco sin cubrir.
6. **@s1/@s2/@s3** — Verdes a la primera (`index.html` ya correcto de
   sesiones previas). Sabotaje manual en los tres: `lang="es_ES"` → rojo;
   `initial-scale`+`user-scalable=no` → rojo. Revertidos ambos, `git diff
   --stat index.html` vacío tras cada uno.
7. **`site.ts` estructurado (soporte @s9/@s11)** — Rojo: `direccion.calle`
   no existe (`site.test.tsx`, nuevo describe `seo_estructura @s9 …`). Verde:
   `crearDireccion` recibe la forma estructurada y deriva `lineas`/`unaLinea`
   (verificado byte-idéntico a los literales ya anclados en @s17/@s18 de
   `datos_negocio`, sin tocar esos tests).
8. **`MetadatosPagina` (soporte @s7 a nivel DOM, @s20)** — Rojo: import
   inexistente. Verde: componente con upsert por `querySelector`/`id`.
   Sabotaje manual: forzar creación de un `<script>` nuevo en cada montaje
   (quitar el check de existencia) → el test "sigue habiendo exactamente un
   script tras navegar" cae en rojo (4 scripts en vez de 1) → revertido,
   4/4 verde.
9. **`datosEstructuradosNegocio.ts`** — Rojo: import inexistente. Verde:
   constante calculada desde `datosNegocio` real.
10. **Cableado en las 4 páginas** (`Landing`/`PaginaCampanas`/`PaginaBlog`/
    `PaginaTienda`) + **`src/paginasSeo.test.tsx`** (@s4/@s5 en integración,
    @s10, @s11, @s12) — Rojo: 9/10 tests fallan (títulos vacíos, `bloque.name`
    `undefined`, texto nuevo ausente). Verde: `<MetadatosPagina>` en las 4
    páginas + prop `calleDireccion` en `Landing`. Sabotaje manual: forzar que
    `Landing` use siempre `DATOS_ESTRUCTURADOS_NEGOCIO` (ignorar el override)
    → @s11 cae en rojo (calle nueva no llega al JSON-LD) → revertido, 10/10
    verde.

## Verificación final

- `pnpm run typecheck` — limpio (incluida una vuelta previa por
  `exactOptionalPropertyTypes`: `DatosNegocioSeo.email`/`coordenadas`
  necesitaron `| undefined` explícito para aceptar `datosNegocio.email`,
  que es `string | undefined`, no solo opcional).
- `pnpm run lint` (`oxlint --deny-warnings`) — limpio (incluida una vuelta
  previa por `react-in-jsx-scope` en los ficheros de test con JSX: mismo
  patrón que `PieDePagina.test.tsx`, `React` se mantiene en el ámbito vía
  un `render*(props: React.ComponentProps<typeof X>)`).
- `pnpm run test` — **621/621**, 46 ficheros (baseline de la sesión: 580/40).
- `node .harness/harness.mjs init` — **verde de punta a punta** (lint,
  typecheck y test), sin timeouts de worker en esta corrida.
- Sabotajes manuales documentados arriba (6 en total): guarda de horario
  vacío, rama `geo` ingenua, `lang` con guion bajo, viewport con
  `user-scalable=no`, upsert de `<script>` desactivado, override de
  `Landing` ignorado. Los seis reprodujeron rojo y se revirtieron sin dejar
  ningún resto (`git diff --stat` vacío sobre `index.html`; ficheros nuevos
  restaurados byte a byte desde la copia de seguridad antes de continuar).

## Ficheros

**Nuevos:**
- `src/lib/seo-logica.ts` / `src/lib/seo-logica.test.ts`
- `src/lib/datosEstructuradosNegocio.ts` / `.test.ts`
- `src/components/MetadatosPagina.tsx` / `.test.tsx`
- `src/documento.test.ts`
- `src/paginasSeo.test.tsx`

**Modificados:**
- `src/lib/site.ts` (dirección estructurada, Invariante 2)
- `src/lib/site.test.tsx` (nuevo describe `seo_estructura @s9 …`, resto intacto)
- `src/pages/Landing.tsx` (prop `calleDireccion`, `<MetadatosPagina>`, `InformacionContacto` con `direccion` explícita)
- `src/pages/PaginaCampanas.tsx`, `src/pages/PaginaBlog.tsx`, `src/pages/PaginaTienda.tsx` (`<MetadatosPagina>` cableado)

## Pendiente para el `judge`/`mutation_tester`

- Ninguna implementación de `geo`, valoración agregada, registro sanitario
  ni redes sociales reales: por diseño (§9/§8/§7 de `docs/datos-galapavet.md`),
  no por omisión accidental — documentado en el punto 6 del diseño arriba.
- `og:image` usa una ruta local provisional (`/img/og/galapavet.webp`, fichero
  aún no existe) — mismo criterio ya aceptado en `src/data/galeria.ts`
  (`PENDIENTE: los ficheros de imagen locales concretos no existen aún`).
- No he ejecutado Stryker en esta ronda (responsabilidad del
  `mutation_tester`); el diseño evita ramas especulativas sin test que las
  pida, pero es esperable que aparezcan supervivientes en la regex de
  tramos horarios o en el diccionario de días, como ha ocurrido en rondas de
  refuerzo de otras features de este proyecto.

---

## Ronda 2 — Refuerzo de mutación (22/08/2026, tras `mutation_tester` FAIL)

`progress/mutation_seo_estructura.md` (Ronda 1) reportó FAIL: 133/140 = 95.00 %,
7 no matados en `src/lib/seo-logica.ts` (5 survived + 2 no cov), los 3 restantes
ficheros del alcance (`datosEstructuradosNegocio.ts`, `site.ts`) ya al 100 %.
El propio informe verificó empíricamente que los 7 son huecos reales (ninguno
equivalente) y dejó un "Resumen de huecos para tdd_craftsman" con 3 tests
concretos a escribir. Esta ronda ejecuta exactamente esos 3, sin código de
producción nuevo: los 7 mutantes revelan falta de tests, no un bug de
comportamiento (verificado abajo caso por caso).

### Regla seguida en esta ronda

Para cada test nuevo: (1) escribirlo, (2) correrlo contra el código de
producción tal cual (correcto) y confirmar que pasa, (3) sabotear el fichero
con el diff EXACTO del mutante reportado por Stryker, (4) correr solo ese
test y confirmar que falla (mata al mutante), (5) revertir el sabotaje byte
a byte y confirmar restauración exacta antes de continuar con el siguiente.
Ningún test se da por bueno sin haber matado su mutante exacto.

### Grupo A (2 supervivientes, `seo-logica.ts:157`) — guarda de etiqueta de día desconocida

Test nuevo en `src/lib/seo-logica.test.ts`, describe
`@s14 refuerzo mutación: una etiqueta de día no reconocida con horas
parseables no aporta tramo ni lanza`: fixture con una entrada de horario
extra `{ dias: 'Festivos', horas: '10:00 a 12:00' }` (etiqueta fuera de
`DIAS_SEMANA_POR_ETIQUETA`, con horas sí parseables) añadida a los 3 tramos
reales. Verifica que `construirDatosEstructurados` no lanza y que el bloque
sigue teniendo exactamente 3 tramos (ninguno con `10:00`/`12:00`).

- Contra producción real: verde (22/22 en el fichero).
- Sabotaje 1 (`ConditionalExpression`, `if (diasSemana === undefined)` →
  `if (false)`): el test falla — `TypeError: diasSemana is not iterable`
  capturado por `expect(...).not.toThrow()`. Mata el mutante exacto.
- Revertido. Sabotaje 2 (`BlockStatement`, cuerpo del `if` vaciado a `{}`):
  mismo test, mismo fallo — `TypeError: diasSemana is not iterable`. Mata el
  segundo mutante exacto.
- Revertido, `seo-logica.ts:153-167` confirmado byte-idéntico al original
  tras cada sabotaje (releído íntegro).

### Grupo B (1 superviviente, `seo-logica.ts:189`) — email siempre incluido

Test nuevo, describe `@s16 refuerzo mutación: sin email, la clave "email"
está ausente incluso sin pasar por JSON.stringify/parse`: llama a
`construirDatosEstructurados(DATOS_SEO_SIN_EMAIL_NI_REDES)` DIRECTAMENTE
(sin el helper `comoJsonLd`, que enmascaraba el hueco al eliminar claves
`undefined` en el `JSON.stringify`/`JSON.parse`) y comprueba
`'email' in bloque === false`.

- Contra producción real: verde.
- Sabotaje (`ConditionalExpression`, `datos.email !== undefined` → `true`):
  el test falla — `expected true to be false` (el mutante añade la clave
  `email` con valor `undefined` al objeto sin serializar). Mata el mutante
  exacto. Confirmado además que el test nuevo de Grupo C (ver abajo) sigue
  en verde durante este sabotaje — no hay solape.
- Revertido, línea 189 confirmada byte-idéntica al original.

### Grupo C (4 no matados, `seo-logica.ts:190`) — `sameAs` con `redesSociales` no vacío

Test nuevo, describe `@s16 refuerzo mutación: con redes sociales presentes,
"sameAs" declara exactamente esa lista`: fixture con `redesSociales` de 2
URLs de ejemplo (ninguna es un dato real de negocio, mismo criterio que
`contacto@ejemplo-de-prueba.test` ya usado en @s22). Verifica
`bloque.sameAs` igual (mismo orden, mismos valores) a esa lista.

- Contra producción real: verde.
- Sabotaje 1 (`ConditionalExpression`, expresión completa → `...(true)`):
  falla — `sameAs` queda `undefined` (spread de un booleano no aporta
  propiedades). Mata el mutante.
- Revertido. Sabotaje 2 (expresión completa → `...(false)`): mismo fallo,
  mismo motivo. Mata el mutante.
- Revertido. Sabotaje 3 (`ObjectLiteral`, `{ sameAs: [...] }` → `{}`): falla
  — `sameAs` queda `undefined`. Mata el mutante.
- Revertido. Sabotaje 4 (`ArrayDeclaration`, `[...datos.redesSociales]` →
  `[]`): falla — `sameAs` queda `[]` en vez de las 2 URLs reales. Mata el
  mutante.
- Revertido, línea 190 confirmada byte-idéntica al original tras cada uno de
  los 4 sabotajes (releída íntegra al final).

### Decisión sobre producción

Cero cambios de producción en esta ronda. Los 7 mutantes eran huecos de
cobertura, no bugs: en los tres casos el comportamiento correcto ya existía
(guarda de etiqueta desconocida, omisión de `email` ausente, inclusión de
`sameAs` con redes reales) y solo faltaba un test que lo ejerciera con un
input que ningún fixture anterior construía. `git diff src/lib/seo-logica.ts`
tras esta ronda está vacío salvo por los tests añadidos en
`seo-logica.test.ts` (el `.ts` de producción es idéntico al de la Ronda 1).

### Trazabilidad — refuerzo de mutación

| Mutante(s) | @s | Test |
| --- | --- | --- |
| `seo-logica.ts:157` ConditionalExpression + BlockStatement (2) | @s14 | `src/lib/seo-logica.test.ts` → `@s14 refuerzo mutación: …` |
| `seo-logica.ts:189` ConditionalExpression (1) | @s16 | `src/lib/seo-logica.test.ts` → `@s16 refuerzo mutación: sin email, la clave "email" está ausente …` |
| `seo-logica.ts:190` ConditionalExpression×2 + ObjectLiteral + ArrayDeclaration (4) | @s16 | `src/lib/seo-logica.test.ts` → `@s16 refuerzo mutación: con redes sociales presentes, "sameAs" …` |

Los 7 no matados de la Ronda 1 quedan con un test que reproduce, exacto, cada
sabotaje reportado por Stryker.

### Verificación final de esta ronda

- `pnpm exec vitest run src/lib/seo-logica.test.ts` — 24/24 (21 → 24, +3).
- `node .harness/harness.mjs init` — verde de punta a punta: lint
  (`oxlint --deny-warnings`) limpio, `tsc -b` limpio, **624/624** tests en 45
  ficheros (621/46 → 624/45; el cambio de 46→45 ficheros es de otra sesión
  en curso sobre `pagina_tienda`, no de esta ronda — ningún fichero de esta
  feature fue eliminado).
- Pendiente: nueva medición de `mutation_tester` sobre `src/lib/seo-logica.ts`
  para confirmar 101/101 = 100 %.
