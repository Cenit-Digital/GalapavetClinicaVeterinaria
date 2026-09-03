# Enmiendas de contrato — `fidelidad_contacto` (34)

Fecha: 03/09/2026. Redacta: `tdd_craftsman` de la feature 34 (ronda de
reparación 1, tras el veredicto del `judge` de las 19:52).

Regla aplicada (spec, «Fidelidad visual de la portada»): los contratos
vigentes se respetan o se enmiendan **por escrito, con el antes y el después
literales**. «Antes» = `git show 61556d8:<fichero>` (el `HEAD` de esta
oleada); «después» = el árbol de trabajo. Cada escenario tocado lleva en su
`.feature` la nota `# ENMENDADO el 03/09/2026 …` que remite a este fichero.

| # | Contrato | Escenario | Motivo |
| --- | --- | --- | --- |
| 1 | `informacion_contacto` | @s8 | Decisión 63: mapa estático local |
| 2 | `informacion_contacto` | @s9 | Decisión 63: cero terceros + atribución visible |
| 3 | `informacion_contacto` | @s10 | Decisión 63: carga diferida de una imagen local |
| 4 | `informacion_contacto` | @s14 | Decisión 63: sin dirección no hay imagen ni atribución |
| 5 | `datos_negocio` | @s18 | Decisión 63: la fuente única expone las coordenadas del nodo OSM |
| 6 | `rediseno_visual` @s36 (aserciones en `InformacionContacto.test.tsx`) | — | `fidelidad_contacto` @s3: banda roja sólida + píldora «Llamar ahora» |
| 7 | `informacion_contacto` | @s5, @s6 | `fidelidad_contacto` @s3: acción «Llamar ahora» con el número visible |

---

## Enmienda 1 — `informacion_contacto` @s8

**Motivo.** Decisión 63 (aprobada por Pablo el 03/09/2026): el marco externo
de OpenStreetMap (sandboxeado, se pintaba en blanco) se sustituye por
`public/img/mapa/galapagar.webp` con el pin en CSS. Procedencia y licencia en
`docs/mapa-estatico.md`.

### Antes (`git show 61556d8:features/informacion_contacto.feature`)

```gherkin
  @s8
  Scenario: El mapa se muestra con el título accesible del nombre real y encabeza el panel
    When el visitante recorre la región cuyo nombre accesible es "Información de contacto"
    Then hay exactamente 1 marco embebido
    And su nombre accesible es exactamente "Mapa de Galapavet"
    And su nombre accesible no contiene "La Sierra" ni "Miraflores"
    And ese marco aparece antes que los grupos de datos en el orden de lectura
```

### Después (árbol de trabajo)

```gherkin
  # ENMENDADO el 03/09/2026 con `fidelidad_contacto` (34), Decisión 63 (mapa estático local):
  # antes/después literal en `progress/fidelidad/enmiendas_fidelidad_contacto.md`.
  @s8
  Scenario: El mapa es una imagen local con el nombre accesible derivado y encabeza el panel
    When el visitante recorre la región cuyo nombre accesible es "Información de contacto"
    Then hay exactamente 1 imagen de mapa y ningún marco embebido
    And su texto alternativo es exactamente "Mapa con la ubicación de Galapavet en Carretera de Torrelodones, 11, 28260 Galapagar, Madrid", derivado del nombre comercial y de la dirección de la fuente única
    And su texto alternativo no contiene "La Sierra" ni "Miraflores"
    And la imagen declara ancho y alto, y lleva encima un pin decorativo cuya posición deriva de las coordenadas de la fuente única
    And esa imagen aparece antes que los grupos de datos en el orden de lectura
```

Tests: `InformacionContacto.test.tsx` «@s8 …» (2 casos) · `InformacionContacto-logica.test.ts` `posicionDelPin`/`describirMapa` · e2e `fidelidad-contacto.spec.ts` @s4.

---

## Enmienda 2 — `informacion_contacto` @s9

**Motivo.** Con el mapa local ya no existe ninguna conexión con un tercero:
la sección pasa a exigir **cero** orígenes ajenos y la atribución visible que
impone la licencia ODbL. Un `<a>` a `openstreetmap.org/copyright` no es una
petición (`src/lib/diseno/puertaTerceros.ts` y `tools/puerta-terceros.ts`
prohíben peticiones, no enlaces).

### Antes

```gherkin
  @s9
  Scenario: El mapa es la única petición a un tercero de la página y se declara como tal
    When el visitante recorre la sección de contacto entera
    Then el único elemento que declara un origen ajeno al propio sitio es el marco del mapa
    And ninguna imagen ni script de la sección declara un origen ajeno al propio sitio
    And [Decisión 11 — verificado con navegador real (Claude in Chrome / skill browser-automation), fuera del gate de Vitest/Stryker] ninguna tipografía ni hoja de estilo de la sección declara un origen ajeno al propio sitio
    And la descripción accesible del marco del mapa es exactamente "El mapa lo sirve un proveedor externo. Es la única conexión con un tercero de esta web."
    And ese aviso existe como texto del documento dentro de la región "Información de contacto", no solo como valor de un atributo aria-label o aria-describedby
    And el elemento que contiene ese texto no declara el atributo "aria-hidden" a "true" ni el atributo "hidden"
```

### Después

```gherkin
  # ENMENDADO el 03/09/2026 con `fidelidad_contacto` (34), Decisión 63 (mapa estático local):
  # antes/después literal en `progress/fidelidad/enmiendas_fidelidad_contacto.md`.
  @s9
  Scenario: La sección no declara ningún origen ajeno y atribuye el mapa a OpenStreetMap de forma visible
    When el visitante recorre la sección de contacto entera
    Then ningún elemento con atributo "src" de la sección declara un origen ajeno al propio sitio, y no hay ningún marco embebido ni script
    And [Decisión 11 — verificado con navegador real (Playwright, `tests/e2e/red-limpia.spec.ts` @s32 y `tests/e2e/fidelidad-contacto.spec.ts` @s4), fuera del gate de Vitest/Stryker] la portada no realiza ninguna petición a un dominio externo
    And la atribución "© OpenStreetMap contributors" existe como texto del documento dentro de la región "Información de contacto", enlazada a "https://www.openstreetmap.org/copyright"
    And el elemento que contiene ese texto no declara el atributo "aria-hidden" a "true" ni el atributo "hidden"
```

Tests: `InformacionContacto.test.tsx` «@s9 …» · e2e @s4 (recoge todas las peticiones: 0 fuera del origen) · `red-limpia.spec.ts` @s32/@s34 y `despliegue-subpath.spec.ts` sin la excepción `openstreetmap.org`.

---

## Enmienda 3 — `informacion_contacto` @s10

### Antes

```gherkin
  @s10
  Scenario: El mapa no se solicita al tercero hasta que hace falta
    When el visitante abre la página con la sección de contacto todavía fuera de la ventana visible
    Then el marco del mapa declara carga diferida
    And [Decisión 11 — verificado con navegador real (Claude in Chrome / skill browser-automation), fuera del gate de Vitest/Stryker] no se ha solicitado nada al proveedor externo mientras el marco sigue fuera de la ventana visible
```

### Después

```gherkin
  # ENMENDADO el 03/09/2026 con `fidelidad_contacto` (34), Decisión 63 (mapa estático local):
  # antes/después literal en `progress/fidelidad/enmiendas_fidelidad_contacto.md`.
  @s10
  Scenario: La imagen del mapa no se descarga hasta que hace falta
    When el visitante abre la página con la sección de contacto todavía fuera de la ventana visible
    Then la imagen del mapa declara carga diferida
    And [Decisión 11 — verificado con navegador real (`tests/e2e/imagenes.spec.ts` @s30), fuera del gate de Vitest/Stryker] la imagen declara sus dimensiones y decodificación asíncrona, y la portada no desplaza contenido al cargarla
```

Tests: `InformacionContacto.test.tsx` «@s10 …» (`loading="lazy"`) y «@s8 …» (`width`/`height`/`decoding`) · e2e `imagenes.spec.ts` @s27/@s30.

---

## Enmienda 4 — `informacion_contacto` @s14

### Antes

```gherkin
  @s14
  Scenario: Sin dirección no se muestra el mapa, porque el mapa se centra por la dirección postal
    Given la fuente única no declara dirección postal
    When el visitante recorre la región cuyo nombre accesible es "Información de contacto"
    Then no hay ningún grupo cuyo nombre accesible sea "Dirección"
    And no hay ningún marco embebido
    And no se realiza ninguna petición a ningún proveedor externo
```

### Después

```gherkin
  # ENMENDADO el 03/09/2026 con `fidelidad_contacto` (34), Decisión 63 (mapa estático local):
  # antes/después literal en `progress/fidelidad/enmiendas_fidelidad_contacto.md`.
  @s14
  Scenario: Sin dirección no se muestra el mapa, porque el mapa describe y sitúa la dirección postal
    Given la fuente única no declara dirección postal
    When el visitante recorre la región cuyo nombre accesible es "Información de contacto"
    Then no hay ningún grupo cuyo nombre accesible sea "Dirección"
    And no hay ninguna imagen de mapa, ningún marco embebido ni la atribución del mapa
    And no se realiza ninguna petición a ningún proveedor externo
```

Tests: `InformacionContacto.test.tsx` «@s14 …».

---

## Enmienda 5 — `datos_negocio` @s18

**Motivo.** El pin se DERIVA de coordenadas; la fuente única (`src/lib/site.ts`,
`COORDENADAS`) las expone a partir de `docs/datos-galapavet.md` §2bis (nodo
público `amenity=veterinary` «Galapavet» de OpenStreetMap, ODbL). El JSON-LD
sigue sin `geo` (`seo_estructura` @s15/@s21 intactos).

### Antes (`git show 61556d8:features/datos_negocio.feature`)

```gherkin
  @s18
  Scenario: La fuente única no declara coordenadas geográficas porque el cliente no las publica
    Given docs/datos-galapavet.md §9 registra las coordenadas exactas como dato pendiente
    When se piden a la fuente única las coordenadas geográficas del negocio
    Then no se obtiene ningún valor de latitud ni de longitud
    And la dirección postal sigue estando disponible para centrar el mapa y el dato estructurado
```

### Después

```gherkin
  # ENMENDADO el 03/09/2026 con `fidelidad_contacto` (34), Decisión 63 (mapa estático local):
  # antes/después literal en `progress/fidelidad/enmiendas_fidelidad_contacto.md`.
  @s18
  Scenario: La fuente única declara las coordenadas del nodo público de OpenStreetMap citado en docs/datos-galapavet.md §2bis
    Given docs/datos-galapavet.md §2bis registra las coordenadas del nodo público de OpenStreetMap sobre la dirección verificada, con su licencia
    When se piden a la fuente única las coordenadas geográficas del negocio
    Then se obtiene exactamente latitud 40.5772872 y longitud -4.0004445
    And la dirección postal sigue estando disponible para describir el mapa y el dato estructurado
```

Tests: `src/lib/site.test.tsx` @s18.

---

## Enmienda 6 — aserciones @s36 de `rediseno_visual` en `InformacionContacto.test.tsx`

**Motivo.** @s36 de `rediseno_visual.feature` pide «una tarjeta con el color
de urgencia» y un botón de llamada; sus aserciones `?raw` habían
sobre-especificado ese color como fondo SUAVE + franja lateral y el enlace como
`boton-fantasma`. `fidelidad_contacto` @s3 (aprobado) pinta la banda roja
sólida del prototipo y la píldora blanca. El texto del `.feature` de
`rediseno_visual` no cambia; cambian solo estas aserciones (el propio test lleva
la nota «ENMIENDA (03/09/2026, `fidelidad_contacto` @s3 …)»).

### Antes (`git show 61556d8:src/components/InformacionContacto.test.tsx`, líneas 411-425)

```ts
  it('la tarjeta de urgencias lleva el color de urgencia como fondo suave y como acento de borde', () => {
    const cuerpoTarjetaUrgencia = cuerpoDelBloque(TEXTO_INFORMACION_CONTACTO_SCSS, "[data-tarjeta-de='urgencia'] {")

    expect(cuerpoTarjetaUrgencia).toContain('background-color: var(--color-urgencia-suave)')
    expect(cuerpoTarjetaUrgencia).toMatch(/border-inline-start:.*var\(--color-urgencia\)/)
  })

  it('el teléfono de la tarjeta de urgencias se maqueta como un botón real ("boton-fantasma"), no como un enlace pelado', () => {
    const cuerpoEnlaceDeUrgencia = cuerpoDelBloque(
      TEXTO_INFORMACION_CONTACTO_SCSS,
      "[data-tarjeta-de='urgencia'] a {",
    )

    expect(cuerpoEnlaceDeUrgencia).toContain('@include boton-fantasma')
  })
```

### Después (árbol de trabajo, cuatro aserciones)

```ts
  it('la tarjeta de urgencias es una banda roja sólida: fondo de urgencia, tinta sobre-primario, sin franja lateral ni patrón tarjeta', () => {
    const cuerpoTarjetaUrgencia = cuerpoDelBloque(TEXTO_INFORMACION_CONTACTO_SCSS, "[data-tarjeta-de='urgencia'] {")

    expect(cuerpoTarjetaUrgencia).toContain('background-color: var(--color-urgencia);')
    expect(cuerpoTarjetaUrgencia).toContain('color: var(--color-sobre-primario);')
    expect(cuerpoTarjetaUrgencia).not.toContain('urgencia-suave')
    expect(cuerpoTarjetaUrgencia).not.toContain('border-inline-start')
    expect(cuerpoTarjetaUrgencia).not.toContain('@include tarjeta')
  })

  it('la banda apila rótulo y número a la izquierda (rejilla 1fr auto) y el número es el elemento grande: titulares, paso 2', () => {
    const cuerpoTarjetaUrgencia = cuerpoDelBloque(TEXTO_INFORMACION_CONTACTO_SCSS, "[data-tarjeta-de='urgencia'] {")
    const cuerpoFieldset = cuerpoDelBloque(cuerpoTarjetaUrgencia, 'fieldset {')
    const cuerpoLegend = cuerpoDelBloque(cuerpoTarjetaUrgencia, 'legend {')
    const cuerpoNumero = cuerpoDelBloque(TEXTO_INFORMACION_CONTACTO_SCSS, "[data-tarjeta-de='urgencia'] p {")

    expect(cuerpoFieldset).toContain('display: grid;')
    expect(cuerpoFieldset).toMatch(/grid-template-columns:\s*1fr auto;/)
    expect(cuerpoLegend).toMatch(/grid-column:\s*1;/)
    expect(cuerpoLegend).toMatch(/grid-row:\s*1;/)
    expect(cuerpoNumero).toMatch(/grid-column:\s*1;/)
    expect(cuerpoNumero).toMatch(/grid-row:\s*2;/)
    expect(cuerpoNumero).toContain('font-family: var(--fuente-titulares);')
    expect(cuerpoNumero).toContain('font-size: paso-tipografico(2);')
    expect(TEXTO_INFORMACION_CONTACTO_SCSS).not.toContain('accionesUrgencia')
  })

  it('la píldora «Llamar ahora» es blanca, pequeña y en negrita, con altura de control media, a la derecha abarcando las dos filas', () => {
    const cuerpoEnlaceDeUrgencia = cuerpoDelBloque(
      TEXTO_INFORMACION_CONTACTO_SCSS,
      "[data-tarjeta-de='urgencia'] a {",
    )

    expect(cuerpoEnlaceDeUrgencia).toContain('background-color: var(--color-sobre-primario);')
    expect(cuerpoEnlaceDeUrgencia).toContain('color: var(--color-urgencia);')
    expect(cuerpoEnlaceDeUrgencia).toContain('border-radius: $radio-completo;')
    expect(cuerpoEnlaceDeUrgencia).toContain('min-height: $altura-control-media;')
    expect(cuerpoEnlaceDeUrgencia).toContain('font-size: paso-tipografico(0);')
    expect(cuerpoEnlaceDeUrgencia).toContain('font-weight: 700;')
    expect(cuerpoEnlaceDeUrgencia).not.toContain('--fuente-titulares')
    expect(cuerpoEnlaceDeUrgencia).toMatch(/grid-column:\s*2;/)
    expect(cuerpoEnlaceDeUrgencia).toMatch(/grid-row:\s*1 \/ span 2;/)
    expect(cuerpoEnlaceDeUrgencia).not.toContain('boton-fantasma')
  })

  it('la banda estrecha se pliega por consulta de contenedor: una columna y la píldora en la tercera fila, sin @media de anchura', () => {
    const cuerpoTarjetaUrgencia = cuerpoDelBloque(TEXTO_INFORMACION_CONTACTO_SCSS, "[data-tarjeta-de='urgencia'] {")
    const cuerpoPlegado = cuerpoDelBloque(TEXTO_INFORMACION_CONTACTO_SCSS, '@container (max-width: 28rem) {')

    expect(cuerpoTarjetaUrgencia).toContain('container-type: inline-size;')
    expect(cuerpoDelBloque(cuerpoPlegado, 'fieldset {')).toMatch(/grid-template-columns:\s*1fr;/)
    expect(cuerpoDelBloque(cuerpoPlegado, 'a {')).toMatch(/grid-row:\s*3;/)
    expect(TEXTO_INFORMACION_CONTACTO_SCSS).not.toContain('@media (max-width')
  })
```

Colateral: `src/lib/diseno/matrizDeContraste.ts` deja de listar la pareja
`urgencia/urgencia-suave` (ya no se pinta) e incorpora `urgencia/sobre-primario`
(4,83 · 5,18 · 6,04 · 4,83 · 4,83 en las cinco variantes; test en
`matrizDeContraste.test.ts`).

---

## Enmienda 7 — `informacion_contacto` @s5 y @s6 («Llamar ahora»)

**Quién lo decidió y cuándo.**

- El contrato `fidelidad_contacto` @s3 («existe un botón blanco "Llamar ahora"
  que apunta al "tel:" de urgencias») y el contorno de la feature 34 en
  `project-spec.md` («tarjeta roja de urgencias con el rótulo real, teléfono
  grande y "Llamar ahora"») los aprobó **Pablo** (cliente) el 03/09/2026 en la
  puerta humana conjunta de los doce contratos.
- El `craftsman_lead`, al lanzar la feature, pidió respetar @s5/@s6 vigentes
  (píldora = número, sin «Llamar ahora») y anotar la desviación. Así se
  implementó y documentó a las 19:34 (tdd, ciclo 7).
- Entre las 19:39 y las 19:46, durante la revisión del `judge`, **una sesión
  paralela ajena a este artesano** cambió el árbol a «número visible + píldora
  "Llamar ahora"» y reescribió @s5/@s6 (en prosa, sin el literal).
- El `judge` (19:52, `progress/judge_fidelidad_contacto.md`, cambio requerido
  2) y el `craftsman_lead` en la **ronda de reparación 1** (instrucción que
  remite ese «como_arreglar»: píldora «Llamar ahora» en `paso-tipografico(0)`
  y número en `--fuente-titulares`/`paso-tipografico(2)`) ratificaron esa
  dirección, que es la del contrato @s3 y de la spec aprobados. Este artesano
  la asume, la implementa por TDD y la deja aquí por escrito; no la decidió él.

**Qué se conserva de la decisión original de @s5/@s6** (retirar el reclamo
falso «Urgencias 24 h»): un único enlace en el grupo; su destino derivado
(`tel:+34918511393`); el número «91 851 13 93» exactamente una vez en toda la
sección; el nombre accesible del grupo intacto; ninguna cadena «24 h», «24h»,
«24 horas», «todos los días del año» ni «siempre hay alguien de guardia».
«Llamar ahora» no afirma disponibilidad: nombra la acción del enlace.

### Antes (`git show 61556d8:features/informacion_contacto.feature`)

```gherkin
  @s5
  Scenario: El teléfono de urgencias aparece con el rótulo real de fuera de horario
    When el visitante lee el grupo cuyo nombre accesible es "Urgencias fuera de horario"
    Then dentro de ese grupo hay exactamente 1 enlace
    And ese enlace tiene el nombre accesible exacto "91 851 13 93" y su destino es exactamente "tel:+34918511393"
    And el texto del grupo no contiene "24" ni "todos los días"
    And el nombre accesible del grupo es exactamente "Urgencias fuera de horario", sin ninguna palabra añadida

  @s6
  Scenario: No existe ningún bloque ni reclamo que anuncie urgencias 24 h
    When el visitante recorre la sección de contacto entera
    Then no hay ningún elemento cuyo nombre accesible sea "Llamar ahora"
    And el texto de la sección no contiene "24 h" ni "24h" ni "24 horas"
    And el texto de la sección no contiene "todos los días del año" ni "siempre hay alguien de guardia"
    And el número "91 851 13 93" aparece exactamente una vez en toda la sección
```

### Después (árbol de trabajo)

```gherkin
  # ENMENDADO el 03/09/2026 con `fidelidad_contacto` (34): la acción visual
  # aprobada no implica disponibilidad 24 h. Antes/después literal en
  # `progress/fidelidad/enmiendas_fidelidad_contacto.md`.
  @s5
  Scenario: El teléfono de urgencias aparece con el rótulo real de fuera de horario
    When el visitante lee el grupo cuyo nombre accesible es "Urgencias fuera de horario"
    Then dentro de ese grupo hay exactamente 1 enlace
    And ese enlace tiene el nombre accesible exacto "Llamar ahora" y su destino es exactamente "tel:+34918511393"
    And el número real "91 851 13 93" se muestra junto a la acción de llamada
    And el texto del grupo no contiene "24" ni "todos los días"
    And el nombre accesible del grupo es exactamente "Urgencias fuera de horario", sin ninguna palabra añadida

  # ENMENDADO el 03/09/2026 con `fidelidad_contacto` (34): se permite una
  # única acción de llamada, pero no ningún reclamo de disponibilidad continua.
  # Antes/después literal en `progress/fidelidad/enmiendas_fidelidad_contacto.md`.
  @s6
  Scenario: No existe ningún bloque ni reclamo que anuncie urgencias 24 h
    When el visitante recorre la sección de contacto entera
    Then existe exactamente una acción cuyo nombre accesible es "Llamar ahora" y apunta al teléfono real de urgencias fuera de horario
    And el texto de la sección no contiene "24 h" ni "24h" ni "24 horas"
    And el texto de la sección no contiene "todos los días del año" ni "siempre hay alguien de guardia"
    And el número "91 851 13 93" aparece exactamente una vez en toda la sección
```

Tests: `InformacionContacto.test.tsx` @s5 y @s6 · e2e `fidelidad-contacto.spec.ts` @s3 (un solo enlace «Llamar ahora», número visible en `<p>`, ninguna cadena de 24 h en `#contacto`).

**Colateral en un test de una feature `done`** (`seo_estructura` @s10,
`src/paginasSeo.test.tsx`): el escenario exige que el teléfono declarado en el
JSON-LD «nunca coincida … con el enlace de teléfono de urgencias»; el test leía
los dígitos del TEXTO de ese enlace (que ahora es «Llamar ahora», es decir,
cadena vacía, y `endsWith('')` es siempre `true`). Ahora los lee del destino
`tel:` del enlace, comprueba que no están vacíos y que coinciden con el número
visible del grupo. El texto de `seo_estructura.feature` no cambia; el test cita
esta enmienda en un comentario.
