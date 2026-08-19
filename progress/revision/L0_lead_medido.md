# Hallazgos medidos por el craftsman_lead (no delegados)

> Medidos directamente sobre el repo el 18/08/2026, con las órdenes reproducibles
> anotadas. Entran en la misma verificación adversarial que los de los agentes.

## H-LEAD-1 · `wa.me` es una capacidad inventada sobre un teléfono real, y además nadie la consume

- **Fichero · ancla:** `features/datos_negocio.feature` @s5, @s6, @s12
- **Severidad:** grave
- **Lente:** fidelidad a la fuente primaria + herencia muerta

**Evidencia literal** (`features/datos_negocio.feature:95`):

```gherkin
Then el enlace es exactamente "https://wa.me/34685343149"
```

**Lo que dice la fuente primaria:** `docs/datos-galapavet.md` **no menciona
WhatsApp ni una sola vez**. Comprobado:

```
grep -niE "whatsapp|wa\.me|mensajer|m[oó]vil" docs/datos-galapavet.md   →  0 líneas
```

El §2 verifica `685 34 31 49` únicamente como **enlace `tel:` de la cabecera de
galapavet.com**. Que esa línea tenga WhatsApp es una **inferencia no verificada**
sobre el número de un negocio real — el mismo modo de fallo que la memoria
organizacional documenta como *cita fabricada* (la URL de Instagram construida a
partir de un handle que la fuente guardaba solo como texto).

**Y no hay ningún consumidor.** Barrido de `wa.me|whatsapp` sobre los 19 `.feature`:

| Fichero | Línea | Qué hace |
| --- | --- | --- |
| `datos_negocio.feature` | 95, 103 | **construye** el enlace |
| `datos_negocio.feature` | 149 | falla cerrado (bien) |
| `reserva_chat.feature` | 206, 216, 270, 271 | **prohíbe** WhatsApp en el widget y en toda la sección |

El flujo de reserva deriva a `tel:+34910829267` (@s11, @s12, @s18). Es decir: el
contrato **fabrica** un constructor de enlaces de WhatsApp y acto seguido
**prohíbe que aparezca en cualquier parte de la web**.

**Origen de la herencia** (`docs/contrato-heredado/reserva_chat.feature:13`):

```
#   y se envía al número +34640221190 vía enlace wa.me.
```

Es el teléfono FALSO del prototipo. La re-destilación corrigió el número y
prohibió el canal, pero **conservó el constructor**. Patrón
`herencia-del-repo-base-es-deuda-muerta-hasta-que-un-uso-la-justifica`.

**Consecuencia si no se repara:** `src/lib/site.ts` nacerá con una función
`enlaceMensajeria()` que afirma una capacidad no verificada del teléfono de un
cliente real, que ningún componente puede usar, y que arrastra su propia
superficie de mutación al 100 % para proteger un comportamiento que el contrato
prohíbe ejercer.

**Reparación propuesta:** eliminar @s5 y @s6 de `datos_negocio.feature`, y
reescribir @s12 para que el fallo-cerrado se pruebe sobre el normalizador de
teléfono (que sí tiene consumidores) en vez de sobre el enlace de mensajería.
Arrastra tres ediciones más, porque la exigencia no nace en el `.feature`:

- `project-spec.md:54` y `project-spec.md:126` — nombran `wa.me` como forma derivada.
- `feature_list.json` id 2 `description` — «deriva de él todas sus formas (texto visible, tel:, **wa.me**, JSON-LD)».

**Si el humano decide conservarlo**, el requisito previo es de datos, no de
código: confirmar con Galapavet que `685 34 31 49` atiende WhatsApp y anotarlo en
`docs/datos-galapavet.md` con su fuente. Hasta entonces es un dato inventado.

## H-LEAD-2 · 50 de 387 escenarios asertan SOLO en negativo

- **Severidad:** grave (sistémico, no puntual)
- **Lente:** verde por vacuidad

Medido con `node /tmp/vacuidad.mjs` (clasifica cada línea del bloque `Then` como
positiva o negativa y marca los escenarios cuyo bloque entero es negativo):

```
Escenarios con bloque Then analizados: 387
Escenarios cuyos Then son TODOS negativos: 50
```

Un `Then` puramente negativo sobre un texto **derivado** («el texto de la sección
no contiene X») **pasa en verde si el extractor devuelve vacío**: 0 coincidencias
sobre 0 texto. Es literalmente el patrón `verde-por-vacuidad-en-puerta-de-verificacion`,
repetido 50 veces.

**No todos son defectos**, y la distinción importa:

- **Legítimos:** aquellos en los que el vacío es el **input controlado** del
  escenario, no el resultado de un extractor roto — `campanas_portada @s15`
  («con el catálogo de demo vacío no se renderiza la sección»), `equipo @s10`,
  `faq @s11`, `galeria @s15`, `servicios @s17`. Ahí «no se renderiza» ES la
  conducta contratada.
- **Sospechosos:** aquellos que leen «todo el texto de una sección» renderizada y
  solo comprueban ausencias — p. ej. `hero @s7` (7 aserciones, todas negativas) y
  `hero @s8`, `cabecera_y_navegacion @s13`, `pagina_tienda @s4`,
  `pie_de_pagina @s14`, `pagina_blog @s27`.

**Contraejemplo que demuestra que el autor SÍ conocía la defensa:** `servicios @s18`
cierra con un ancla positiva —«los únicos puntos listados son los 26 publicados en
docs/datos-galapavet.md §5»— y por eso no aparece en la lista. (Verificado: §5
suma 7+4+5+6+4 = **26**.) `informacion_contacto @s6` hace lo mismo con «el número
"91 851 13 93" aparece exactamente una vez en toda la sección».

**Reparación propuesta:** cada escenario sospechoso incorpora un ancla positiva
que fije que el sujeto extraído **existe y no está vacío** antes de aseverar la
ausencia. La clasificación escenario a escenario la resuelve la lente L3.

## Barridos que salieron limpios (declarados para que este informe no sea un verde por vacuidad)

| Barrido | Resultado |
| --- | --- |
| Hexadecimales no verificados en los 19 `.feature` | **0** |
| Teléfonos falsos del prototipo en posición afirmativa | **0** — las 18 apariciones son aserciones negativas o comentarios |
| «24 h» / «24h» / «24 horas» en posición afirmativa | **0** — las 31 apariciones prohíben el reclamo |
| `hola@veterinarialasierra.es` e `info@galapavet.com` en posición afirmativa | **0** — solo en `datos_negocio @s15` e `informacion_contacto @s7`, ambas negativas |
| URLs a terceros | solo los 3 enlaces legales de §11 (verificados) y el `wa.me` de H-LEAD-1 |
| Secuencias tipo teléfono no verificadas | 12, **todas** dobles de test deliberados (`600 000 000`, `900 000 000`, `123456789`, `33 1 23 45 67 89`) |

## H-LEAD-3 · Dos features no se ponen de acuerdo en qué es «una página»: las vistas de detalle no tienen contrato SEO

- **Ficheros · anclas:** `features/seo_estructura.feature` @s4, @s5 ⟷ `features/accesibilidad.feature` @s1
- **Severidad:** bloqueante
- **Lente:** colisión entre features

**Evidencia literal — `accesibilidad.feature:134` audita SEIS páginas:**

```gherkin
Given un literal escrito a mano en el propio escenario con seis nombres de página:
  "Landing", "Campañas", "Ficha de campaña", "Blog", "Artículo del blog" y "Tienda"
```

**Evidencia literal — `seo_estructura.feature:200` solo exige metadatos a CUATRO:**

```gherkin
Given las cuatro páginas publicadas: inicio, campañas, blog y tienda
Then obtengo exactamente cuatro títulos
```

**No se cubre en ningún otro sitio.** Barrido sobre el fichero entero:

```
grep -niE "ficha|art[íi]culo|detalle|/blog/|/campanas/|canonical|slug" features/seo_estructura.feature
  →  0 líneas
```

La `Ficha de campaña` y el `Artículo del blog` **no aparecen ni una vez** en el
contrato de SEO: ni título, ni descripción, ni canonical.

**Por qué es bloqueante y no menor.** No es una omisión cosmética: son rutas
reales con contenido propio, y el contrato de las subpáginas las trata como tales.
`pagina_blog.feature:256` y `:393` fijan destinos distintos por artículo:

```gherkin
Then quedan exactamente 2 enlaces de artículo, con destinos "/blog/demo-4?categoria=An%C3%A1lisis" y "/blog/demo-5?categoria=An%C3%A1lisis"
And bajo él hay exactamente 2 enlaces, con destinos "/blog/demo-2" y "/blog/demo-3"
```

Contando lo que el contrato publica: `/` · `/campanas` · 3 fichas de campaña ·
`/blog` · 6 artículos · `/tienda` = **13 URLs**, de las cuales **4** tienen
título y descripción propios. Las otras 9 quedan sin contrato.

Y choca de frente con el propósito declarado del proyecto
(`project-spec.md`): atacar el **«SEO inexistente»** de la web vigente. Publicar
nueve URLs sin metadatos propios reproduce el defecto que el proyecto existe para
corregir. El criterio de aceptación de la feature 15 dice literalmente «Cada
página tiene título y descripción propios y únicos» — y el contrato lo incumple
para 9 de 13.

**Consecuencia si no se repara:** la puerta de SEO cerrará en verde habiendo
validado 4 de 13 páginas. Es el mismo defecto de forma que
`verde-por-vacuidad`: la puerta concluye sobre un conjunto derivado más pequeño
que el real, y su exit 0 se lee como «el sitio tiene SEO».

**Reparación propuesta:** decidir explícitamente y escribirlo en el contrato.
Dos salidas legítimas, y la elección es del humano:

1. **Extender.** `seo_estructura` pasa a exigir título y descripción propios a las
   vistas de detalle, derivados del artículo o de la campaña. Requiere además
   contratar el `canonical` de `/blog/demo-4?categoria=Análisis` → `/blog/demo-4`,
   porque el filtro de categoría genera **la misma página bajo dos URLs**
   (`pagina_blog @s14`), que es contenido duplicado de manual.
2. **Acotar.** Se declara que las vistas de detalle no son páginas indexables y se
   contrata `noindex` en ellas. Entonces `accesibilidad @s1` sigue auditándolas
   (correcto: la accesibilidad no depende de la indexación) y `seo_estructura`
   declara **por qué** son 4 y no 6, en vez de callarlo.

Hoy el contrato no elige ninguna de las dos: simplemente no las nombra.

## Comprobaciones cruzadas que salieron correctas

Se declaran para que este informe no sea, él mismo, un verde por vacuidad:

| Comprobación | Resultado |
| --- | --- |
| `servicios @s18` «los 26 puntos publicados en §5» | ✅ §5 suma 7+4+5+6+4 = **26** |
| `accesibilidad @s7` área táctil mínima 24×24 px | ✅ WCAG 2.2 SC 2.5.8 (Target Size Minimum) = 24×24 |
| `accesibilidad @s16` umbrales 4.5 / 3 y texto grande 24 px / 18.66 px negrita | ✅ WCAG 2.2 SC 1.4.3 |
| Los 9 ratios de contraste de `tokens_marca` | ✅ recalculados con la fórmula oficial; coinciden con §10.1 |
| Breakpoint 1024 px | ✅ el contrato lo declara **provisional** en su bloque PENDIENTE y lo aísla en un único literal (@s1); todo lo demás deriva de «el valor declarado» |
| `accesibilidad @s1` ancla el inventario a un literal escrito a mano | ✅ aplica `doble-de-test-anclado-al-literal-no-al-simbolo` explícitamente |
| `accesibilidad @s2` «páginas efectivamente analizadas es exactamente 6» | ✅ guarda anti-vacuidad correcta |
