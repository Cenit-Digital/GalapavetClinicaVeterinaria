# Contrato de contacto y pie — reescritura del 20/09/2026 (E1–E5)

> Autor: `gherkin_author`. Fase: **Gherkin**, anterior a la puerta humana.
> No se ha tocado `src/`, ni los tests, ni `feature_list.json`, ni
> `project-spec.md`. Solo `features/*.feature` y este fichero.
>
> **Segunda tanda del día.** La primera (`progress/cabecera_contrato_20260920.md`,
> D1–D4) reescribió los contratos de la CABECERA y sigue pendiente de la misma
> puerta humana. Las dos se aprueban JUNTAS: varias afirmaciones de la primera
> dejan de ser ciertas por culpa de la segunda, y están corregidas aquí (§5).

**Origen de la decisión.** Pablo, 20/09/2026, tras ver capturas de cada sitio,
corroborado en la grabación de la reunión con su socio Roberto Alonso del
16/08/2026 (`2026-08-16 16-14-50.mkv`; transcripción literal con marcas de
tiempo en `progress/transcripcion_reunion_rober_20260816.txt`, tabla en
`progress/decisiones_reunion_rober_20260816.md`), minutos **06:52-07:00**:

```
[06:52] La urgencia se va afuera.
[06:53] Esto es fuera, sí, esto de urgencia se va.
[06:55] Y el resto se queda como está.
[06:58] Vale, tu nombre y esto de dirección que está guapo.
[07:03] (del FAQ) Correcto, esto se ve como está. Está perfecto, sí.
```

- **E1** — fuera la tarjeta roja de urgencias de `InformacionContacto`.
- **E2** — fuera el enlace de urgencias del pie.
- **E3** — se quedan, intactos: FAQ, confirmación del formulario, paso de
  urgencia del chat y `datosNegocio.telefonoUrgencias`.
- **E4** — las puertas de PRESENCIA por ruta pasan a puertas de CORRECCIÓN.
- **E5** — reconciliación con lo que la tanda de la cabecera dejó escrito.

El criterio de Pablo, literal: **fuera la CARTELERÍA roja, se queda el TEXTO
útil**.

---

## 1. Qué escenarios he tocado y cómo

### `features/informacion_contacto.feature` (E1)

| Tag | Cambio | Qué he hecho |
| --- | ------ | ------------ |
| — | cabecera nueva | Bloque al inicio con la decisión, los minutos citados, qué se va y qué se queda, y la consecuencia medida (cero menciones estáticas en las seis rutas). |
| — | §2 del histórico | `ACTUALIZACIÓN`: la «SUSTITUCIÓN DECIDIDA» del 17/08/2026 queda **derogada**, con el recorrido completo (a) barra 24 h heredada → (b) cuarto bloque con rótulo real → (c) enmienda del 03/09/2026 que le devolvió el rojo y la píldora → (d) fuera del todo. Es lo que demuestra que Pablo **no cambia de criterio sobre el dato**, solo sobre la cartelería. |
| — | §5 del histórico | «3 enlaces `tel:` (2 en @s3, 1 en @s5)» → 2. Y aviso de que el precedente que cita (@s15 del pie) se reapunta en esta misma tanda. |
| `@s1` | título + 2 cláusulas | 4 grupos → **3**; nombres sin «Urgencias fuera de horario». Añadida la ausencia explícita de ese grupo, para que no vuelva por la puerta de atrás. |
| `@s5` | **ELIMINADO con nota** | Texto literal conservado en el comentario + porqué + dónde sigue vivo el dato + qué se pierde (los tres sitios que lo conservan exigen interacción previa). |
| `@s6` | **INVERTIDO, no borrado** | «existe exactamente una acción "Llamar ahora"» → **no existe ninguna**; «el número aparece exactamente una vez» → **ninguna**. Las cinco prohibiciones de reclamo se conservan intactas: son el corazón de @s6. Añadido «sin haber enviado el formulario» al When, porque la confirmación (E3) sí muestra el número dentro de esta misma sección. |
| `@s12` | **ELIMINADO con nota + cláusulas reubicadas** | Se queda sin sujeto (su Given inyectaba la única prop anulable, que E1 retira). Sus dos cláusulas únicas —«sin placeholder» y «sin `tel:` a medias»— se **copian a @s13**. Si el artesano borra @s12 sin escribirlas, E1 deja menos cobertura de la que había. |
| `@s13` | 3 cláusulas | Recuento y orden de los grupos restantes (3 → **2**) + las dos reubicadas de @s12. |

### `features/fidelidad_contacto.feature` (E1 en navegador real)

| Tag | Cambio | Qué he hecho |
| --- | ------ | ------------ |
| — | cabecera nueva | Este fichero es el que más pierde: su @s3 era la **única** puerta del proyecto que leía `--color-urgencia` resuelto por el navegador. |
| — | descripción | «distinguir el formulario, las urgencias fuera de horario y la ubicación» → sin urgencias. |
| `@s1` | cláusula añadida | La prohibición de reclamos que viajaba dentro de @s3 y se quedaría sin casa. Es la única comprobación **en navegador real** de los reclamos en esta sección. |
| `@s3` | **ELIMINADO con nota** | Texto literal + porqué + qué se reubica + qué se pierde. |
| `@s5` | cláusula reescrita + 2 añadidas | «el formulario precede a la columna de urgencias y datos» → «a la tarjeta de datos». Se conserva el recorrido por LISTA de tarjetas (ahora con una entrada) y su anti-vacuidad. Se pierde, entera, la comprobación del plegado de la banda estrecha. |

### `features/pie_de_pagina.feature` (E2)

| Tag | Cambio | Qué he hecho |
| --- | ------ | ------------ |
| — | cabecera nueva | Decisión, minutos, y el aviso de que **esto toca estructura aprobada, no un dato** (ver §2). |
| — | fuente (b) | «tres columnas… de cuatro enlaces» → nota: "Contacto" pasa a 3. |
| — | §2 del histórico | `ACTUALIZACIÓN`: el párrafo que celebraba «la columna sigue teniendo 4 enlaces porque el hueco lo ocupa el segundo teléfono real» deja de describir el pie. |
| — | Background | **No cambia** —la fuente única sigue declarando el teléfono— con nota para que nadie lea la retirada del enlace como retirada del dato. |
| `@s2` | título + 2 cláusulas → 4 | El recuento pasa a declararse **columna a columna** (4 / 4 / 3), porque un único número sería falso para unas u otras. Total de `listitem`: 12 → **11**. |
| `@s5` | 1 cláusula eliminada + 2 reescritas | Fuera el enlace de urgencias; «esos tres enlaces de llamada» → **dos**; añadido «son exactamente esos 3» para que la columna no admita relleno. |
| `@s6` | **ENMENDADO, no borrado** | Se retiran sus dos primeras cláusulas (con su texto literal en la nota) y se **conserva la tercera** —ningún heading ni banner del pie menciona urgencias—, que E2 no deroga y que es la que impide reintroducir la cartelería por la puerta de un encabezado. Se le añade la ausencia del propio enlace. |
| `@s7` | 1 cláusula | «sigue teniendo exactamente 4 enlaces» → **3**. |
| `@s15` | **REAPUNTADO, no retirado** | El modo de error (fallo cerrado ante teléfono que no normaliza) sigue vivo, pero E2 le quita el punto de inyección. El Given pasa al teléfono de la **clínica**. Dos caminos válidos para el artesano, escritos en la nota. |

### `features/rediseno_visual.feature`

| Tag | Cambio | Qué he hecho |
| --- | ------ | ------------ |
| `@s7` | nota + 1 cláusula | Tras D1+E1 el When **no encuentra nada** en las hojas de estilo. No retiro el escenario: su puerta lee la MATRIZ, no el CSS. Añadida la cláusula que fija en **0** los ficheros que pintan tinta sobre ese fondo, para que no apruebe en silencio algo que ya no está en pantalla. La decisión de fondo va a puerta humana propia (§4). |
| `@s11` | nota | Su Given dice «lo que el sistema efectivamente PINTA»: cierto en 23 de 25 filas. Y **ninguna puerta lo detecta**: queda escrito que el verde es un hueco de la puerta, no una aprobación. |
| `@s14` | **reescrito con nota larga** | De presencia a corrección. Ver §3: es la enmienda que más cobertura quita. |
| `@s27` (nota) | corregida **dos veces** | «vive en el pie y en la tarjeta de contacto» → con E1+E2 no vive en ninguno. Segunda `ACTUALIZACIÓN` con dónde vive hoy el dato (tres sitios, los tres tras una interacción). |
| `@s28` (nota) | corregida | La frase que la tanda anterior escribió —«lo sigue pintando la tarjeta de `InformacionContacto`, así que la matriz conserva su fila y sus recuentos no se tocan»— es **falsa** tras E1. Sustituida por la redacción medida: el token sigue vivo y pintado, pero solo como muestra decorativa del selector de paleta; **las DOS filas** de urgencia quedan sin módulo que las respalde. |
| `@s36` | título + 1 cláusula | Fuera «la tarjeta de urgencias»; cuatro bloques → **tres**. Conservadas íntegras las otras cuatro cláusulas. |
| `@s52` | 1 cláusula enmendada + 1 añadida | De afirmativa («el único que aparece es el declarado») a negativa («no aparece ninguno distinto del declarado»), con la anti-vacuidad de rutas y cualificadores explícita. **No lo mencionaba el encargo y se ponía en rojo.** |

### `features/fidelidad_cabecera.feature` (E5 — reconciliación)

| Tag | Cambio | Qué he hecho |
| --- | ------ | ------------ |
| — | bloque ALCANCE | `ACTUALIZACIÓN DEL MISMO DÍA`: el punto 9 de la reunión **ya no está pendiente**, y dos frases del alcance quedan derogadas («esta tanda no toca… ni la tarjeta, ni el pie» y «el único acceso que vive en el armazón común es el PIE»). |
| `@s1` (nota) | corregida | «El acceso a urgencias NO se pierde: vive en el pie y en la tarjeta de contacto» → falso. Corregido a «el DATO no se pierde, pero deja de estar accesible sin interactuar». |
| `@s5` | última cláusula **sustituida por su inversa** | Decía «fuera de la cabecera sigue existiendo al menos un enlace de llamada con el rótulo real». E2 la vuelve falsa en cinco rutas y E1 en la sexta. La nota explica por qué se escribió esta mañana y por qué se retira esta tarde. La inversa **sigue mordiendo**: caza cualquier `tel:` de urgencias que vuelva al armazón común sin pasar por la puerta humana. |

### `features/seo_estructura.feature` — **nadie lo había citado y se ponía en rojo**

@s10 («lo que lee la máquina coincide con lo que lee la persona») localiza el
enlace de urgencias entrando en el grupo «Urgencias fuera de horario» y
pidiendo dentro «Llamar ahora»: los dos desaparecen con E1 y esa búsqueda
**lanza**, no falla suavemente. Cláusula enmendada para conservar la
comparación contra el SEGUNDO enlace visible —que es la que sigue demostrando
lo que el escenario quiere— y nota de lo que se pierde. Actualizada también la
tabla de datos de la cabecera del fichero.

### `features/accesibilidad.feature` — aviso, sin enmienda

Añadida una nota sobre `@s22` (y la última cláusula de `@s20`). Ver §6.4.

### Ficheros que he comprobado y **NO** he tocado

`datos_negocio.feature` (su «enlace `tel:` del pie» se refiere al pie de
**galapavet.com**, la procedencia del dato, no a nuestro pie: falsa alarma),
`faq.feature`, `formulario_contacto.feature`, `reserva_chat.feature`
(los tres conservan el dato, E3), `fidelidad_selector_paleta.feature` (es
quien salva el token), `fidelidad_responsive_integral.feature` (su Gherkin
**no cita** el número de enlaces: solo cambia su test),
`fidelidad_pie.feature`, `sistema_de_diseno_visual.feature`,
`pagina_campanas.feature`, `pagina_tienda.feature`, `hero.feature`.

---

## 2. Decisiones que necesitan **puerta humana propia**

### 2.1 La simetría del pie: «tres columnas de CUATRO enlaces»

Viene del `<footer>` del prototipo versionado, y `pie_de_pagina.feature`
justifica por escrito por qué son cuatro. E2 deja la columna "Contacto" en
**tres**. He escrito el contrato en 3 porque es lo que la decisión de Pablo
produce, pero **no es un número de test: es estructura aprobada**. Pablo tiene
que decir: ¿columna asimétrica de 3, o entra un cuarto dato real ya publicado?
No hay tercer camino que no pase por inventar un enlace de relleno, que es lo
que @s7 prohíbe.

Recuentos que bajan, **todos localizados**: columna "Contacto" 4 → 3; total de
enlaces del pie 15 → **14** (en los cuatro anchos del barrido responsive, que
**no corre en CI**: si no se lanza a mano, se descubre en producción). **No**
bajan: número de columnas (3) ni enlaces legales (3).

### 2.2 Las DOS filas huérfanas de la matriz de contraste

No las he tocado, como se me pidió. Estado medido:

- Quedan huérfanas **dos**, no una: `{sobre-primario, urgencia}` y
  `{urgencia, sobre-primario}` (la píldora «Llamar ahora»). La tanda anterior
  solo vio la primera.
- `--color-urgencia` **no** queda huérfano: lo salva `SelectorPaleta`, que lo
  pinta como relleno decorativo. Pero no salva las parejas: la matriz es una
  lista de (tinta, fondo) y ahí no hay tinta encima.
- **Ninguna puerta detecta una fila huérfana.** La de reconciliación solo busca
  lo contrario —pintado y no declarado— y sus ocho invocaciones usan ficheros
  sintéticos, nunca los `.module.scss` reales.

| Camino | Coste exacto |
| ------ | ------------ |
| **Conservar** las dos filas (barato) | 25 filas, 25 claves únicas y 125 parejas **siguen en verde**, en los cuatro sitios que los clavan. Contrapartida: @s11 y @s7 pasan a cubrir una decisión de diseño que ya no está en pantalla, y la matriz deja de ser «lo que el sistema pinta de verdad» en 2 de 25 filas, **en silencio**. |
| **Borrar** las dos filas | 25 → **23** filas, 25 → **23** claves únicas, 125 → **115** parejas **en dos sitios**, @s7 se queda con `[]` y veredicto suspenso por vacuidad, y desaparece la guarda «ninguna fila sobre `urgencia-suave`». Es enmienda de contrato humano aprobado. |

**Recomendación**: conservar, reapuntar los comentarios de procedencia y
escribir en el contrato que pasan a ser «pareja prevista del rol de urgencia,
sin módulo que la pinte desde el 20/09/2026». Pero lo decide Pablo, no el
artesano.

### 2.3 ¿El sitio sigue publicando el teléfono de urgencias sin interactuar?

Es la decisión de fondo de toda la tanda. Ver §3.

---

## 3. Cobertura que se pierde, sin maquillar

### 3.1 @s14: de «presencia por ruta» a «corrección»

**Lo que exigía**: que CADA una de las seis rutas tuviera al menos una mención
textual de urgencias y al menos un enlace de llamada de urgencias, más dos
agregados globales.

**Lo que pasa, MEDIDO ruta por ruta**: tras D1 + E1 + E2 las **SEIS** se quedan
a cero. La premisa del encargo era falsa en dos puntos, y hay que decirlo:

1. El inventario **no tiene «dos rutas legales»**: son Landing, Campañas, Ficha
   de campaña, Blog, Artículo y Tienda. Las páginas legales son **externas**
   (galapavet.com, `target=_blank`).
2. **La portada tampoco sobrevive.** Ninguno de los tres componentes que E3
   conserva produce una mención **estática**: el FAQ dice «atención fuera del
   horario de la clínica» —sin la palabra— y el acordeón arranca cerrado; el
   chat ofrece «Es una urgencia», en **singular**, que el patrón no casa, y
   solo dice «urgencias fuera de horario» tras pulsar; la confirmación del
   formulario solo tras enviar.

**Lo que se pierde exactamente**: la garantía de que el teléfono de urgencias
está publicado y alcanzable **sin interactuar**. Eso ya no lo vigila nadie.

**Lo que se conserva**: la corrección íntegra (rótulo real, `tel:` derivado sin
retipear, ni el teléfono de la clínica ni el móvil, ningún rótulo accesible con
palabras añadidas) y **dos** anti-vacuidades que siguen siendo ciertas: el
recorrido de las seis rutas y la distinción de los tres números en la fuente
única.

**El remedio que proponía el encargo NO funciona.** El agregado global
`mencionesTotales > 0` **ya existe** y se pone rojo igual, junto con su gemelo
de enlaces. Hoy pasan gracias al pie. Los tres caminos:

| Camino | Coste medido |
| ------ | ------------ |
| (i) retirar la anti-vacuidad global | La puerta queda puramente condicional: no avisa de nada si el dato desaparece. |
| (ii) llevar el barrido a los estados interactivos | **No es gratis, y esto no lo había visto nadie**: el texto del chat es «Llamar a **u**rgencias fuera de horario · 91 851 13 93», con la **u minúscula**, y la comprobación del rótulo compara distinguiendo mayúsculas. Habría que enmendar también esa comparación o el texto del chat. Además, la confirmación del formulario aporta la mención de texto pero **no** un enlace que el recolector reconozca como de urgencias. |
| (iii) aceptar que el dato deja de publicarse estáticamente **y decirlo con un número** | Es lo que he escrito: la última cláusula fija el recuento en **0** y lo convierte en un **disparador**. Si alguien vuelve a publicar el rótulo en el armazón común, la puerta se pone roja y obliga a volver a la puerta humana en vez de cambiar de política en silencio. |

**Pablo tiene que aprobar (iii) explícitamente, o elegir otro.**

### 3.2 Otras pérdidas netas, una por una

1. **La última lectura en navegador real de `--color-urgencia`** desaparece con
   @s3 de `fidelidad_contacto`. Ningún test en navegador comprueba ya que ese
   rojo se pinte en pantalla.
2. **El plegado de la banda estrecha** (número encima, píldora debajo,
   alineados por la izquierda, a 320 px) se pierde entero: no queda banda.
3. **El patrón «dato ausente → bloque desaparece» deja de ejercitarse sobre un
   TELÉFONO** en el panel de contacto. Sobreviven `horario: []` y
   `direccion: null`. El modo «teléfono presente pero inválido» sí sigue
   ejercitado (@s16, con el de la clínica).
4. **La comprobación de que `telephone` del schema.org no coincide con el de
   urgencias** (@s10 de `seo_estructura`) se pierde: el enlace ya no está en la
   página. Se conserva la comparación contra el segundo enlace visible.
5. **Un `for` que nunca entra**: la comprobación de que todo `aria-label` con
   «urgencias» es exactamente el rótulo real recorría un único elemento —el
   `fieldset` de la tarjeta— y tras E1 recorre la lista vacía en las seis
   rutas. **No falla, pasa a ser vacua.** Hay que conservarla (es corrección
   pura) y dejarlo escrito, o queda un bucle que no entra nunca.

---

## 4. Puertas que quedan para el `tdd_craftsman`

> **Nada de esto se ejecuta hasta que Pablo apruebe.** Orden obligatorio:
> borrado de SCSS y su test **en el mismo commit** (ver aviso 4.D.1).

### A. Vitest — **sí corren en CI**

1. `src/components/InformacionContacto.tsx` — borrar el bloque de la tarjeta
   (comentario incluido), la constante `enlaceUrgencias`, el parámetro
   `telefonoUrgencias`, la prop de la interfaz y actualizar el JSDoc del
   componente. **No tocar** `construirEnlaceTelefono`: lo siguen usando los dos
   teléfonos de la clínica.
2. `src/components/InformacionContacto.module.scss` — borrar los **seis**
   bloques de la tarjeta (`[data-tarjeta-de='urgencia']`, `.pulso`, su `p`, su
   `a`, el `@container` y `@keyframes pulso`) y corregir el comentario de
   cabecera del fichero.
3. `InformacionContacto.test.tsx` — @s1: 3 grupos y tres nombres. @s5: borrar
   el describe entero. @s6: **invertir**, no borrar, conservando las siete
   prohibiciones de reclamo. @s12: borrar **y** escribir sus dos cláusulas en
   @s13. @s13: dos nombres. @s36: borrar los `it` de rótulo, rejilla, píldora,
   `@container`, punto pulsante y `order: -1`; reducir el de orden de lectura a
   tres bloques y renombrarlo.
4. **DOS GUARDAS VIAJAN DE POLIZÓN y hay que REUBICARLAS, no borrarlas**:
   `not.toContain('@media (max-width')` —única guarda de «este módulo no
   maqueta por anchura de ventana», nada que ver con la tarjeta— y
   `not.toContain('accionesUrgencia')` —antirregresión de un nombre de clase ya
   retirado—.
5. `src/components/PieDePagina-logica.ts` — borrar `nombreEnlaceUrgencias`, los
   dos campos de la interfaz, su desestructuración, la construcción del enlace,
   la tercera entrada del array, y **la constante `SEPARADOR_ROTULO`**
   (huérfana: Stryker muta `' · '` a `""` y sin referencias nadie lo mata →
   mutante superviviente con umbral 100). Actualizar el docblock de «4
   enlaces» a 3.
6. `src/components/PieDePagina-logica.test.ts` — borrar **solo** el describe de
   refuerzo de cobertura, en el **mismo paso** que la función. **No tocar** los
   otros tres describes (enlaces legales y copyright) ni el import de
   `construirEnlacesLegales`/`textoCopyright`.
7. `src/components/PieDePagina.tsx` — retirar la prop `telefonoUrgencias`, su
   valor por defecto y los dos argumentos. **Decidir su sustituto ANTES de
   borrarla**: es el único punto de inyección de @s15 (ver 4.A.9).
8. `PieDePagina.test.tsx` — @s5: quitar la entrada de urgencias del mapa y del
   array de nombres de llamada; **conservar** el bucle de consistencia
   dígitos-nombre/dígitos-destino con los dos restantes. @s6: **no borrar el
   describe**; las aserciones de ausencia de heading/banner siguen siendo
   verdad y hay que reubicarlas. @s7: 4 → 3 y array sin urgencias. @s2: la
   columna "Contacto" pasa a 3 (dejar de exigir el mismo número a las tres).
9. `PieDePagina.test.tsx` @s15 — **reubicar, no borrar**. Dos caminos: dar al
   componente una prop `telefonoClinica`, o llevar el escenario a la lógica
   pura con un teléfono inválido. `informacion_contacto.feature` cita este @s15
   como **precedente**: perderlo tiene efecto colateral en otro contrato.
10. `src/paginasSeo.test.tsx` — **nadie lo había citado y ROMPE** (la búsqueda
    del grupo lanza). Borrar el bloque del enlace de urgencias y su
    comparación, conservando la del segundo enlace.

### B. Playwright — **no corren en CI**: hay que lanzarlos a mano

11. `tests/e2e/fidelidad-contacto.spec.ts` — @s3: borrar el describe.
    **Conservar reubicada** la aserción de reclamos prohibidos sobre la sección
    (es la única en navegador real). @s5: dejar el bucle de desbordamiento con
    una sola entrada —**conservar el bucle**, no sustituirlo por una aserción
    suelta— y borrar el bloque del plegado de la banda.
12. `tests/e2e/urgencias.spec.ts` — retirar las **dos** exigencias de presencia
    por ruta y sustituir el comentario que las justificaba. **Conservar
    íntegros**: el primer test (anti-vacuidad sobre la fuente única, no sobre
    el sitio), el recorrido de las seis rutas, y los bucles de corrección
    (rótulo real, no-clínica, no-móvil, `href` derivado). Los dos agregados
    globales dependen de la decisión de §3.1.
13. `tests/e2e/datos-reales.spec.ts` (@s52) — enmendar **en el mismo paso**.
    **CUIDADO**: `informe.pasa` viene de lógica pura que Stryker muta con
    umbral 100. Relajar la condición obliga a tocar la función y sus tests
    unitarios, no solo el spec.
14. `tests/e2e/fidelidad-responsive-integral.spec.ts` — 15 → **14** enlaces del
    pie, en los cuatro anchos del bucle.
15. `tests/e2e/fidelidad.spec.ts` **y** `tests/e2e/accesibilidad.spec.ts` —
    **conservar** `emulateMedia({reducedMotion:'reduce'})` en los dos (las
    transiciones siguen entrando en el motor de animaciones) y **reescribir su
    comentario** en los **dos**: el punto 14 del contrato de la tanda anterior
    reapunta ese comentario a `@keyframes pulso`, que E1 borra, así que **nace
    caducado**. La verdad nueva: tras D1+E1 no queda ninguna `animation` en
    `src/`; la llamada se conserva como red de las transiciones.

### C. Mutación

16. **E1 no mueve el denominador de Stryker**: `InformacionContacto-logica.ts`
    no pierde ningún export. **E2 sí**: se lleva `nombreEnlaceUrgencias` y
    `SEPARADOR_ROTULO`. Hay que **volver a correr** `bin/harness mutate`.
17. Tras borrar el describe de refuerzo, `construirEnlacesContacto` se queda
    sin test en su fichero `-logica`, pero **sigue mordida** por
    `PieDePagina.test.tsx` (Stryker corre toda la suite de Vitest).

### D. Avisos de ejecución

18. **Los siete tests de SCSS de `InformacionContacto.test.tsx` NO fallan
    suavemente**: su ayudante **lanza** `Error: no se encontró la cabecera…`.
    Si se borra el SCSS antes que los tests, la suite revienta con un error de
    infraestructura en vez de un fallo legible. **Mismo commit.**
19. **No tocar** (verificado uno por uno): el censo de 17/17/19 módulos —anclan
    al **fichero** `InformacionContacto.module.scss`, que sobrevive—, la puerta
    de movimiento respetuoso —sigue en verde: quedan 10 `transition` en 7
    módulos—, `src/lib/site.ts`, los fixtures de `datosDelSitio.test.ts`,
    `site.test.tsx`, `site.reimportacion.test.ts`, `fidelidad-pie.spec.ts`
    (cuenta columnas y legales), `PaginaCampanas.test.tsx` (acotado a `main`) y
    `App.test.tsx`.

---

## 5. Reconciliación con la tanda de la cabecera (E5)

Tres cosas que la primera tanda dejó escritas **esta misma mañana** y que esta
segunda vuelve falsas. Las tres están corregidas en el mismo paso:

1. **`fidelidad_cabecera` @s5, última cláusula.** Se escribió a propósito para
   que la cobertura de urgencias no quedara a la suerte del pie. E2 la vuelve
   falsa en las cinco rutas que no son la portada, y E1 en la portada:
   **las seis**. Sustituida por su inversa medida, que sigue mordiendo.
2. **`fidelidad_cabecera`, bloque ALCANCE.** Declaraba «esta tanda NO toca… ni
   la tarjeta de `InformacionContacto`, ni el pie» y «el único acceso que vive
   en el armazón común es el PIE». Lo primero sigue siendo cierto de la tanda;
   lo segundo ya no lo es del sitio. `ACTUALIZACIÓN` añadida.
3. **`rediseno_visual`, notas de @s27 y @s28.** La de @s27 («vive en el pie y
   en la tarjeta de contacto») y la de @s28 («lo sigue pintando la tarjeta de
   `InformacionContacto`, así que la matriz conserva su fila y sus recuentos no
   se tocan») son las dos falsas. Corregidas, con la redacción medida.

Además, el **punto 14** del contrato de la cabecera (reapuntar el comentario de
`fidelidad.spec.ts` a `InformacionContacto.module.scss`) **nace caducado**: E1
borra justo eso. Y el **punto 18** (reapuntar el comentario de la fila de la
matriz a `InformacionContacto.module.scss:153-159`) reapunta a un fichero que
en esa línea ya no pintará nada.

---

## 6. Contradicciones encontradas

1. **La premisa del encargo era falsa en dos puntos** (inventario sin «dos
   rutas legales»; la portada tampoco sobrevive). §3.1.
2. **El remedio que el encargo daba por salvado no salva nada**: el agregado
   global ya existía y se pone rojo igual. §3.1.
3. **Dos puertas se ponen rojas y el encargo no las anticipaba**: @s52 de
   `datos-reales.spec.ts` y @s10 de `seo_estructura` vía `paginasSeo.test.tsx`.
   Las dos enmendadas aquí.
4. **`accesibilidad.feature` @s22 y la última cláusula de @s20 dejan de ser
   ciertas sobre el sitio.** @s22 afirma que existe «la página del inventario
   que contiene un elemento animado» y que el recuento de elementos con
   animación en curso es mayor que 0; @s20 exige que el recuento de bloques que
   aparecen animándose sea mayor que 0. Tras D1 + E1 **no queda ni una
   declaración `animation:` en todo `src/`**. Ninguno de los dos tiene puerta
   automática sobre el sitio real, y el que sí corre (@s19) sigue verde porque
   cuenta transiciones. **No los he enmendado**: decidir si el sitio debe
   conservar alguna animación de entrada es una decisión de diseño que Pablo no
   ha tomado, y las retiradas de esta tanda son de cartelería, no de
   movimiento. **Necesita su propia puerta.** Nota añadida al fichero.
5. **«Cuatro enlaces por columna» es estructura aprobada, no un número de
   test.** §2.1.
6. **Ninguna puerta detecta una fila declarada y ya no pintada.** El verde de
   25/125 es un hueco de la puerta, no una aprobación. §2.2.
7. **Contradicción preexistente que esta tanda roza pero no abre**:
   `identidad_visual.feature` @s… sigue diciendo «no existe ningún token cuyo
   nombre contenga "urgencia" ni "urg"», derogado **de hecho** por
   `rediseno_visual` @s13 y por la puerta de roles descartados, que ya no
   vigila el NOMBRE de ningún token. Vive escrito desde entonces. No es de esta
   tanda; conviene resolverlo en la misma sesión de puerta.
8. **La descripción de E1 no cuadraba con el código**: `InformacionContacto`
   **no tiene** bloque «cómo llegar». Sus bloques son tres fieldsets
   (Dirección, Teléfonos, Horario) y el «cuarto bloque» que el contrato exigía
   por nombre accesible **era** la tarjeta que E1 retira. «Cómo llegar» es un
   enlace del **pie**, y ese se queda. Queda dicho en la nota de @s36.
9. **Falsa alarma verificada**: el «(enlace `tel:` del pie…)» de
   `datos_negocio.feature` se refiere al pie de **galapavet.com** —la
   procedencia del dato—, no a nuestro pie. No se toca.
10. **Sigue sin haber dónde registrar esta tanda.** Las 38 features de
    `feature_list.json` están `done` y no hay ninguna `pending`: no he podido
    poner nada en `spec_ready` sin salirme del alcance que se me dio
    (`features/` y `progress/`). **Decisión para el `craftsman_lead`**, la
    misma que dejó abierta la tanda anterior: abrir una feature nueva (p. ej.
    `40 urgencias_fuera_de_contacto_y_pie`, `sdd: true`, `spec_ready`) o
    registrar E1–E5 como enmienda de la 10 y la 13.
11. **`project-spec.md` queda desactualizado** en lo que describe de la sección
    de contacto y del pie. No lo he editado (fuera de mi alcance en esta fase).

---

## 7. Estado

`features/informacion_contacto.feature`, `features/fidelidad_contacto.feature`,
`features/pie_de_pagina.feature`, `features/rediseno_visual.feature`,
`features/fidelidad_cabecera.feature`, `features/seo_estructura.feature` y
`features/accesibilidad.feature` quedan **a la espera de la puerta humana**,
**junto con** los de la tanda de la cabecera: las dos se leen y se aprueban de
una vez, porque la segunda corrige afirmaciones de la primera.

No se lanza al `tdd_craftsman` hasta que Pablo apruebe, y con él las tres
decisiones de §2 y la de §3.1.
