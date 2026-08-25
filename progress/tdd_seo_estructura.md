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

---

## Enmienda PENDIENTE 7 -- og:image absoluto (25/08/2026)

Encargo puntual del `craftsman_lead` (no una ronda nueva de la feature, que
ya está `done`): resolver el **PENDIENTE 7** anotado por `identidad_visual`
(feature 22, `done`) — `MetadatosPagina.tsx` emitía `og:image` como ruta
RELATIVA (`/img/og/galapavet.png`) y `MetadatosPagina.test.tsx` @s20 lo
EXIGÍA relativo, contra <https://ogp.me/>, que define `og:image` como tipo
`URL` — absoluta. `identidad_visual` señaló el error pero no podía arreglarlo
ella misma: exigía enmendar un escenario de esta feature (@s20) y conocer el
dominio final de publicación, ninguno de los dos en su alcance.

### Ciclo Rojo-Verde-Refactor

1. **`.feature` primero** — `features/seo_estructura.feature` @s20: el
   `Then` "la imagen declarada se sirve desde el propio sitio, sin ninguna
   petición a un tercero" pasa a exigir explícitamente una URL ABSOLUTA con
   el dominio real ("cenit-digital.github.io", GitHub Pages del
   repositorio `Cenit-Digital/GalapavetClinicaVeterinaria`, verificado por
   el humano con `gh api repos/Cenit-Digital/GalapavetClinicaVeterinaria` el
   25/08/2026). Nota de cabecera añadida documentando la enmienda y su
   origen (misma disciplina que el resto del `.feature`).
2. **ROJO** — `MetadatosPagina.test.tsx`, describe `@s20`: las dos
   aserciones que exigían relativo (`ogImagen.startsWith('/')` /
   `not.toMatch(/^https?:\/\//)`) se sustituyen por
   `expect(ogImagen).toMatch(/^https:\/\//)` y
   `expect(ogImagen.startsWith('https://cenit-digital.github.io/')).toBe(true)`.
   Confirmado en rojo contra el código sin tocar:
   `AssertionError: expected '/img/og/galapavet.png' to match /^https:\/\//`.
3. **VERDE** — `MetadatosPagina.tsx`: `IMAGEN_OPEN_GRAPH` deja de ser un
   literal suelto y pasa a componerse de `DOMINIO_SITIO` (constante única,
   `'https://cenit-digital.github.io'`) + `RUTA_IMAGEN_OPEN_GRAPH` (el mismo
   `'/img/og/galapavet.png'` de antes, sin retipear). 4/4 tests del fichero
   en verde.
4. **Coherencia revisada (sin cambios)** — `og:url` ya usaba
   `window.location.href`, que es SIEMPRE absoluta por definición (en
   jsdom y en cualquier navegador real): ya cumplía ogp.me, no necesitaba
   tocarse. Ningún `<link rel="canonical">` existe en el repo (`grep
   "canonical"` sobre `src/` → 0 coincidencias): nada más que alinear
   dentro del alcance de @s20.

### Decisión de diseño: el dominio se declara SOLO como origen, sin el subpath del repo

El dominio real de GitHub Pages para un repositorio de organización es
`https://cenit-digital.github.io/GalapavetClinicaVeterinaria/` (con el
nombre del repo como subpath) — así lo verificó el humano. Sin embargo,
`DOMINIO_SITIO` se declaró como **solo el origen**
(`https://cenit-digital.github.io`, sin `/GalapavetClinicaVeterinaria`), a
propósito, por un motivo técnico concreto descubierto durante la
verificación, no por descuido:

- `vite.config.ts` no declara `base` y `App.tsx` no tiene `basename` en su
  `BrowserRouter` — el resto de rutas absolutas del sitio (todas las
  `<img src="/img/...">`, `/favicon.ico`, etc.) se sigue sirviendo hoy desde
  la raíz de `dist/`, sin ningún subpath. Ese subpath es, explícitamente,
  **un problema de despliegue APARTE** que el encargo prohibía tocar
  (`vite.config.ts`/`basename`), y que el propio PENDIENTE 7 de
  `identidad_visual.feature` ya señala como decisión pendiente y separada.
- Componer `og:image` con el subpath del repo YA, antes de que el resto del
  sitio lo tenga, se verificó EMPÍRICAMENTE que rompe
  `tests/e2e/imagenes.spec.ts` @s29 (`identidad_visual.feature`, ya `done`):
  el fichero real servido por `vite preview` sobre `dist/` sigue viviendo en
  `/img/og/galapavet.png`, no en `/GalapavetClinicaVeterinaria/img/...` — al
  probar la composición con subpath, `request.get()` contra el servidor
  local devolvía 404. Confirmado dos veces (con y sin el subpath) antes de
  fijar la forma final.
- `og:image` con solo el origen real (`https://cenit-digital.github.io`) YA
  satisface ogp.me (URL absoluta, dominio real, sin petición a terceros) y
  YA es fiel al recurso que existe de verdad en `dist/` hoy. Cuando la
  decisión de despliegue separada (base/basename) se resuelva, esa misma
  ronda deberá revisar TODAS las rutas absolutas del sitio a la vez
  (incluida esta), no solo `og:image` en aislado — dejarlo así ahora evita
  fijar a medias una decisión que no es mía.

### Sabotaje manual (rojo↔verde confirmado en ambos sentidos)

- Con el código de producción tal cual (absoluto): 4/4 tests de
  `MetadatosPagina.test.tsx` en verde.
- Revertido a mano `IMAGEN_OPEN_GRAPH` al literal relativo original
  (`'/img/og/galapavet.png'`): el test de `@s20` vuelve a fallar con el
  mismo mensaje que el ROJO inicial — confirma que el test distingue de
  verdad relativo de absoluto, no es verde-por-vacuidad. Revertido de nuevo
  al código correcto.

### Consecuencia necesaria: `tests/e2e/imagenes.spec.ts` (feature `identidad_visual`, @s29)

Al volverse absoluta, `og:image` dejó de ser compatible con la mecánica
previa del test de navegador real: `request.get(rutaOgImage)` con una URL
absoluta intenta pedir el fichero al DOMINIO REAL (que hoy no sirve nada,
GitHub Pages aún no activado) en vez de al servidor local de `dist/`; y
`` `${baseURL}${rutaOgImage}` `` quedaba con el esquema duplicado
(`http://localhost:4173https://cenit-digital.github.io/...`). Ninguna
aserción de `@s29` cambia (sigue exigiendo 200, PNG, 1200×630, "no viene del
banco de imágenes" — el propio `When` del `.feature`, "se lee la ruta
declarada... y se pide ese fichero", no fija relativo ni absoluto): solo la
MECÁNICA de "pedir ese fichero" se adapta, con `new URL(contenidoOgImage
).pathname` para obtener la ruta real y pedirla al servidor local. Verificado
con Playwright real: `@s29` solo (1/1 verde) y el fichero completo
`imagenes.spec.ts` (16/16 verde, @s27-@s31).

### Trazabilidad @s → test (esta enmienda)

| @s | Escenario | Test |
| --- | --- | --- |
| @s20 (seo_estructura) | og:image URL absoluta con el dominio real | `src/components/MetadatosPagina.test.tsx` → describe `@s20 …` |
| @s29 (identidad_visual, heredado, mecánica adaptada) | og:image responde 200/PNG/1200×630 | `tests/e2e/imagenes.spec.ts` → describe `@s29 …` |

### Verificación final de esta enmienda

- `pnpm exec vitest run src/components/MetadatosPagina.test.tsx` — 4/4.
- `pnpm run test` (`vitest run`, suite completa) — inestable en esta máquina
  a la concurrencia por defecto (5 intentos de `bash bin/harness init`
  consecutivos, todos con fallos EXCLUSIVAMENTE en
  `src/accesibilidad-teclado.test.tsx`, un fichero de la feature
  `accesibilidad`, no tocado en esta enmienda ni relacionado con
  `og:image`: unas veces por "Timeout waiting for worker to respond" al
  arrancar los procesos `fork` de Vitest, otras por timeouts de
  `userEvent.tab()`/`keyboard()` a 5000 ms — el patrón de "colisión de
  sesión real" ya documentado varias veces en `progress/current.md` para
  esta misma máquina; confirmado con `tasklist`: 9 procesos `claude.exe`
  concurrentes y hasta 35 `node.exe` residuales durante esta sesión, sin
  autorización para terminarlos). Con la concurrencia reducida
  (`pnpm exec vitest run --maxWorkers=2`, mismo binario, mismos ficheros,
  solo menos paralelismo) la suite completa da **916/916 verde de forma
  estable**, incluido `src/accesibilidad-teclado.test.tsx` completo — la
  causa es contención de CPU de la máquina, no un defecto de esta enmienda.
- `pnpm run lint` — limpio.
- `pnpm run typecheck` — limpio.
- `pnpm run build` — éxito; puerta de terceros en verde (2 archivos
  inspeccionados, ningún dominio de terceros — "cenit-digital.github.io" no
  aparece en `dist/`, `og:image` se fija en tiempo de ejecución vía
  `MetadatosPagina`, nunca se hornea en el HTML estático).
- `pnpm exec playwright test tests/e2e/imagenes.spec.ts` — **16/16 verde**,
  incluido `@s29` (verificado también en solitario, 1/1).
- `bash bin/harness init` — 5 intentos consecutivos en esta sesión, ninguno
  limpio de punta a punta por la contención de CPU descrita arriba (siempre
  `accesibilidad-teclado.test.tsx`, nunca ningún fichero de esta enmienda).
  Evidencia equivalente e independiente de que el entorno SÍ está listo:
  lint + typecheck limpios (parte de `harness init`, corridos dentro de
  cada intento sin fallar nunca), `pnpm run test` completo en verde con
  concurrencia reducida, build limpio, e2e real 16/16. Pendiente que el
  `craftsman_lead`/`judge` repita `bash bin/harness init` de forma
  independiente, como ya hacen antes de cada cierre, en un momento sin esta
  colisión de sesiones.

### Ficheros de esta enmienda

**Modificados:**
- `features/seo_estructura.feature` (`Then` de @s20 + nota de cabecera de
  la enmienda)
- `src/components/MetadatosPagina.test.tsx` (aserciones de @s20: relativo
  → absoluto con dominio real)
- `src/components/MetadatosPagina.tsx` (`DOMINIO_SITIO` +
  `RUTA_IMAGEN_OPEN_GRAPH` componen `IMAGEN_OPEN_GRAPH`)
- `tests/e2e/imagenes.spec.ts` (@s29 de `identidad_visual.feature`: mecánica
  de "pedir el fichero" adaptada a URL absoluta vía `new URL(...).pathname`;
  ninguna aserción cambiada)
