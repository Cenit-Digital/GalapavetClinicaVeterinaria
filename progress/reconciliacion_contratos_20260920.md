# Reconciliación de contratos — 20/09/2026, TERCERA y última tanda (F1–F3, G1–G2)

> Autor: `gherkin_author`. Fase: **Gherkin**, anterior a la puerta humana.
> No se ha tocado `src/`, ni los tests, ni `feature_list.json`, ni
> `project-spec.md`. Solo `features/*.feature` y este fichero.
>
> Las tres tandas del día se leen y se aprueban **de una vez**:
> `progress/cabecera_contrato_20260920.md` (D1–D4),
> `progress/contacto_pie_contrato_20260920.md` (E1–E5) y este.
> Esta tercera corrige por escrito afirmaciones de las dos anteriores (§2).

**Origen de las decisiones.** Pablo, 20/09/2026, tras ver mediciones e
imágenes. Corroboración de origen en la grabación de la reunión con Roberto
Alonso del 16/08/2026 (`2026-08-16 16-14-50.mkv`; transcripción literal con
marcas de tiempo en `progress/transcripcion_reunion_rober_20260816.txt`; tabla
en `progress/decisiones_reunion_rober_20260816.md`), puntos 3, 4, 8 y 9.

---

## 1. Qué se ha aplicado

### F1 — Fuera las dos filas huérfanas de la matriz de contraste

`src/lib/diseno/matrizDeContraste.ts:363` (`{sobre-primario, urgencia}`) y
`:388` (`{urgencia, sobre-primario}`). Pablo eligió **BORRAR**, no conservar,
para que la matriz vuelva a ser exactamente lo que el sitio pinta.
`SelectorPaleta` no las salva: pinta el rojo como relleno decorativo, sin tinta
encima, y la matriz es una lista de parejas (tinta, fondo).

Recuentos: **25 → 23 filas**, **25 → 23 claves únicas**, **125 → 115 parejas**.

**@s7 de `rediseno_visual` NO se retira: se REESCRIBE, y sigue mordiendo.** El
encargo obligaba a decidir entre reescribir o retirar. Se reescribe, y esta es
la razón: existe una puerta viva de @s7 que ninguna de las dos tandas
anteriores citó, `src/lib/diseno/tokensColor.test.ts:229-235` —un `it` rotulado
@s7 que lee `sobre-primario` y `urgencia` del texto real de `_tokens.scss` y
exige ratio ≥ 4,5 en las cinco variantes, **sin pasar por la matriz**—, y
sobrevive intacta. Con ella y con el segundo `it` de @s7
(`matrizDeContraste.test.ts:133-159`, que construye la pareja a mano y la
compara con el 2,77 del blanco del prototipo), @s7 pivota de «qué color se
pinta encima» a «el par sigue siendo **apto** aunque ya no se pinte», con dos
puertas existentes y verdes. **No queda aprobando por vacuidad.**

Además, @s7 gana dos cláusulas de **disparador**: el recuento de ficheros que
pintan tinta sobre urgencia y el de filas de la matriz que la declaran como
fondo tienen que ser **exactamente 0**, y si cualquiera deja de serlo la puerta
se pone roja. Volver a usar el rojo como señal exige volver a la puerta humana.

Ficheros tocados: `features/rediseno_visual.feature` (nota + escenario de @s7,
nota de @s11, tercera actualización de la nota de @s28),
`features/fidelidad_cabecera.feature` (corrección del número en la nota de @s7),
`features/fidelidad_contacto.feature` (dos notas que remitían a una puerta
humana ya resuelta).

### F2 — El sitio se queda sin ninguna animación

Verificado: las **únicas dos** declaraciones `animation:` de `src/` son los dos
pulsos de urgencias (`Cabecera.module.scss:188` + `@keyframes` de `:294`, que
borra D1; `InformacionContacto.module.scss:199` + `@keyframes` de `:267`, que
borra E1). `global.scss:341-342` es el **anulador** de
`prefers-reduced-motion: reduce`, no una animación.

Se ha escrito **una sola nota canónica** en la sección D de
`features/accesibilidad.feature`, y el resto apunta a ella. Contiene: (a) que
era el pulso de urgencias y por qué se va; (b) la cita de la grabación **con su
minuto corregido** (ver §2.1); (c) que las animaciones de la galería son
**tarea aparte, con su propio contrato, y no de esta tanda**.

**El alcance era mayor que el que pedía el encargo: seis cláusulas en cuatro
escenarios, no dos.** Todas enmendadas:

| Escenario | Qué pasaba | Qué se ha hecho |
| --- | --- | --- |
| `@s19` cláusula 2 | «ninguna transición de aparición se ejecuta» — sin sujeto | Ampliada a «ninguna transición se ejecuta con duración efectiva perceptible: el techo es 0,01 ms», que sí tiene sujeto (13 transiciones) |
| `@s19` cláusula 4 | El recuento > 0 lo satisfacía el anulador global, no ninguna transición de módulo | Cláusula nueva que prohíbe obtener el recuento contando el documento entero bajo `reduce` |
| `@s20` cláusulas 1 y 2 | Cuantificadores universales sobre conjunto vacío | Ampliadas a «con movimiento —animación o transición—» |
| `@s20` cláusula 4 | «recuento de bloques animados > 0»: **no podía ponerse roja nunca** (su única puerta la alimenta un literal sintético del propio test) | Retirada con su texto literal; sustituida por «el inventario se lee del sitio real», «el recuento es exactamente 0 y la puerta lo declara» y un disparador |
| `@s21` cláusula 1 | «ninguna animación se reproduce» — sin sujeto | Ampliada a animación **y** transición |
| `@s22` entero | Afirmaba que existe una página con un elemento animado y que hay una animación en curso | **Pivotado**, no retirado: «sin la preferencia el sitio sí se mueve», con tres puertas vivas (`movimiento.spec.ts:117-120`, `accesibilidad-movimiento.test.ts:113-134`, `Equipo.test.tsx:498-507`) |

**No se ha afirmado que el sitio se quede quieto, porque es falso.** Quedan
**13 `transition:`** en todo `src/` —8 en 6 módulos (Cabecera:127 · Equipo:149 ·
Faq:58 y :80 · Galeria:67 · ReservaChat:294 · Servicios:50 y :181) y 5 en las
hojas compartidas (global.scss:326 · _api.scss:181, :235, :265, :308)— más el
desplazamiento suave. Lo que se pierde son las animaciones por fotogramas
clave, no el movimiento. Esa precisión es justo la diferencia entre lo que
Pablo ha decidido y lo que Roberto pidió en [06:38].

### F3 — El borde del acceso «Tienda» sí se suaviza

La nota de @s7 de `features/fidelidad_cabecera.feature` ofrecía dos caminos y
dejaba la elección abierta. Ahora dice **(a) APROBADO** —`color-mix(in srgb,
var(--color-borde-control) 88%, var(--color-fondo))`, con precedente en
producción y en verde en `Hero.module.scss:132`, `:55` y `:181`— y **(b)
CERRADO**: el artesano no puede tomar el camino del token nuevo sin volver a la
puerta humana. Verificado que la redacción del escenario no deja abierta ninguna
otra puerta: sus cinco cláusulas hablan de ratios, de «tokens que ya existen» y
de «ningún color literal», nunca de crear un rol nuevo.

### G1 — @s4 nacía ciego; reescrito sin la tolerancia que tapaba el defecto

**Confirmado y medido**, en Chromium real sobre `dist/` servido: `header` de
y=0 a y=65, `#root` reserva 64 px, `#inicio` arranca en y=64 → **solape de
1,00 px exacto**. La cláusula decía «con una tolerancia de 1 píxel»: el
escenario escrito para cazar ese defecto habría pasado **en verde con el
defecto dentro**.

**El punto exacto es `Cabecera.module.scss:33`, no la 13.** `.cabecera` (`:13`)
con `box-sizing: border-box` daría 64 exactos con su borde dentro; quien
desborda es `.interior`, que repite `min-height: var(--altura-cabecera)` dentro
de la caja de contenido: 64 + 1 = 65. Arreglo verificado inyectándolo en el
navegador: `min-height: calc(var(--altura-cabecera) - #{$ancho-borde-fino})`.
No toca ningún token y no escribe ningún número a mano. Comprobado que
`src/styles/hoja-global.test.ts:123-131` **no** se pone en rojo (el `calc` sigue
consumiendo `--altura-cabecera`) y que marca (40 px) y controles (48 px) caben
con 15 px de holgura en un interior de 63 px, también tras los 4 px de D3.

**Tolerancia que se deja: NINGUNA, y por qué.** Con el arreglo la diferencia es
0,00 y todo el cálculo vive en píxeles enteros a DPR 1. La segunda cláusula fija
el techo por si el artesano quiere red antisubpíxel: **estrictamente menor que
`$ancho-borde-fino`** (medio borde, 0,5 px) y **derivada del token**, jamás 1 px
—una tolerancia de 1 px en una comparación vertical puede absorber un borde
entero, que es el defecto de hoy—. La tercera cláusula (la del primer contenido)
también se ha reescrito con la exactitud **en su propio texto**, porque no
declaraba tolerancia y el spec del fichero ya tiene un `const TOLERANCIA = 1`
(`tests/e2e/fidelidad-cabecera.spec.ts:6`) que un test heredaría por inercia,
reabriendo el agujero por la puerta de al lado. El aviso está escrito en la nota.

**Cláusula añadida, y es deliberada**: «la igualdad se consigue sin mover el
token de altura de cabecera ni el hueco que el contenedor reserva». Sin ella,
un artesano podría poner @s4 en verde subiendo `#root` a 65 px, y los otros tres
consumidores seguirían descuadrados.

**Los otros tres consumidores NO se han convertido en cláusulas.** Medido, el
mismo arreglo de una línea los cuadra (`scroll-padding-top` 23 → 24 px;
`--desplazamiento-al-enfocar` 7 → 8 px; `.panelMovil` deja de quedar tapado por
el borde), y `posicionDeScrollParaAncla` es inmune porque mide el `bottom` real.
Están escritos en la nota de @s4 y en §5 de este informe, pero **no se contratan
comportamientos que Pablo no ha pedido**: es exactamente la lección de G2.

**@s4 llega a la puerta humana NACIENDO EN ROJO**, a propósito, y la nota lo
dice: Pablo tiene que aprobar un escenario que hoy falla.

### G2 — Retirada la cláusula de píldora del panel móvil en @s3

La cláusula decía literalmente: «And el acceso "Tienda" del panel se dibuja con
la misma píldora que en escritorio: mismo alto visible y mismo color de borde».
La añadió por su cuenta la **primera** tanda, presentándola como «decisión
explícita». Pablo no la pidió.

**La prueba es literal, no una interpretación**: en
`docs/diseno-claude-design/Veterinaria La Sierra.dc.html`, el enlace normal del
panel móvil (línea 110) y el «Tienda» del mismo panel (línea 112) llevan la
**misma cadena de estilo carácter a carácter** (`padding:13px 12px;
border-radius:12px; font-size:16px; font-weight:500; color:var(--ink);
min-height:46px; display:flex; align-items:center`). La píldora del prototipo
vive **solo** en escritorio (línea 97).

Retirada con nota que deja escrito: el texto literal, que el prototipo pinta ahí
una fila sin borde, y que **el panel móvil se queda HOY exactamente como está**
(48 px, borde de control, radio de píldora, peso 600, 16 px, relleno 24).
Acercarlo al prototipo es **tarea aparte** que Pablo no ha pedido. Las otras
cinco cláusulas de @s3 quedan **intactas**; en particular «exactamente los ocho
destinos y ningún enlace más», que es la **única** puerta de D1 sobre el panel.

---

## 2. Afirmaciones de las tandas anteriores que ha habido que corregir

### 2.1 La cita del minuto que el encargo mandaba escribir estaba mal

El encargo pedía citar «el minuto **06:37** de la grabación, donde Roberto
Alonso pide animaciones para la galería». Leída la transcripción: **[06:37] dice
«Pase automáticamente y ya está.»**. La frase de las animaciones —«Que tenga un
par de animaciones, que si algo aquí se haga más grande, vale un par de
animaciones»— está en **[06:38]-[06:42]**. En el contrato se ha escrito el rango
honesto **06:34-06:42** (la tabla de decisiones lo registra como punto 8,
06:21-06:43), con las cuatro líneas transcritas literalmente y un aviso para que
nadie repita el 06:37. Se deja dicho además que la transcripción **no etiqueta
al hablante** en esas líneas: la atribución a Roberto Alonso viene de la tabla de
decisiones, no del audio. Escribir 06:37 habría metido en el contrato una
referencia que no dice lo que se afirma — el defecto exacto que estas notas
existen para evitar.

### 2.2 «10 `transition` en 7 módulos» era falso, y estaba publicado en un contrato

La segunda tanda lo dejó escrito en `features/accesibilidad.feature`. Medido
fichero a fichero: son **8 en 6 módulos** (13 en todo `src/` contando las hojas
compartidas). El error venía de no advertir que `InformacionContacto.module.scss`
**no tiene ninguna** `transition`: al perder su `animation` cae **entero** del
censo, así que el número de módulos **baja de 7 a 6**, no se queda en 7.
Corregido, con la corrección explicitada en la nota.

### 2.3 «El daño de F1 son cuatro recuentos en cuatro sitios» se quedaba corto

Medido ejecutando la **suite completa** con las filas borradas: **6 tests rojos
de 1415, todos en UN solo fichero** (`src/lib/diseno/matrizDeContraste.test.ts`).
Son **cinco aserciones** (`:114`, `:446`, `:509`, `:531`, `:738`) más un `it` que
se queda sin sujeto (`:743`). Y **`:463` también está mal pero queda
enmascarado** porque `:446` aborta el `it` antes: quien enmiende solo lo que le
enseñe el informe de fallos volverá a pasar por aquí. Corregido en la nota de
@s28 de `rediseno_visual`.

La parte cara de F1 **no eran los tests**: eran las notas de contrato que
afirmaban por escrito lo contrario de lo que F1 hace.

### 2.4 Tres notas que remitían a puertas humanas que Pablo ya había resuelto

- `rediseno_visual` @s7: «Esa disyuntiva es PUERTA HUMANA PROPIA. El artesano NO
  la decide» → resuelta, en sentido borrar, por Pablo el 20/09/2026.
- `rediseno_visual` @s11 y @s28: ídem, más la corrección de «cuatro sitios».
- `fidelidad_contacto`, cabecera y nota de @s3: «son decisión de la puerta
  humana, no del artesano» → decidido.
- `pie_de_pagina`, bloque de estructura y nota de @s2: «la puerta humana tiene
  que ratificar la asimetría o meter un cuarto dato real publicado» → ratificada:
  **la columna se queda en 3 y no se rellena**, con las mediciones de
  `progress/pie_4-4-3_leyes_uiux_20260920.md` (seis anchos, anchos de columna
  idénticos antes y después, sin desbordamiento; y la Ley de Conectividad
  Uniforme desaconseja expresamente rellenar). **El SCSS del pie no se toca.**
- `accesibilidad` @s22: «NO LO DECIDE ESTA TANDA» → lo decidió el mismo día.

### 2.5 La nota de @s7 de `fidelidad_cabecera` daba un número falso al artesano

Decía «la matriz de uso clavada en 25 filas y 125 parejas» dentro del camino (b).
Es la **única nota que el artesano va a leer al tocar el borde**. Corregida a 23
y 115 en el mismo paso que F3.

---

## 3. Cobertura que se pierde, sin maquillar

1. **La pareja `(sobre-primario, urgencia)` deja de estar DECLARADA en la matriz
   de uso** y de resolverse contra las cinco variantes por la misma maquinaria
   que las demás. Lo que queda es el contraste de los dos **tokens**
   (`tokensColor.test.ts:229-235` y `matrizDeContraste.test.ts:133-159`), que es
   lo que protegerá al visitante el día que el rojo vuelva a usarse.
2. **Que una animación por fotogramas clave llegue a estar EN CURSO en el
   navegador**, y que el contenido siga visible al terminar esa animación. A
   partir de hoy nadie lo comprueba, porque no hay ninguna animación. Si se
   implementan las animaciones de la galería (punto 8 de la reunión), @s22 es el
   sitio donde vuelve.
3. **La cláusula «ningún fichero de estilos escribe blanco literal sobre el color
   de urgencia»** de @s7. No es pérdida neta: la cláusula nueva del recuento 0 la
   subsume, y a diferencia de aquella no puede cumplirse en silencio sobre un
   conjunto vacío.
4. **La cláusula «el recuento de bloques animados es mayor que 0»** de @s20. No
   es pérdida neta tampoco: no podía ponerse roja **nunca**, porque su única
   puerta la alimenta un literal sintético del propio test. Lo que cambia hoy no
   es el hecho, es que alguien lo ha mirado.
5. **Nada se pierde con G2**: la cláusula retirada aún no se había implementado,
   y las cinco que quedan en @s3 son toda su cobertura.

---

## 4. Qué queda para el `tdd_craftsman`

> **Nada de esto se ejecuta hasta que Pablo apruebe.** Esta lista es **adicional**
> a las de los dos informes anteriores, que siguen vigentes salvo donde §2 las
> corrige.

### A. F1 — la matriz (todo en Vitest, corre en CI)

1. `src/lib/diseno/matrizDeContraste.ts` — borrar la fila de `:363` con su cita,
   y la de `:388` con su bloque de comentario de procedencia (`:385-387`).
2. `matrizDeContraste.ts:359` — **reescribir** el comentario de sección: «El rojo
   de urgencia entra AQUÍ, nunca con blanco literal (@s7)» deja de ser cierto.
3. `matrizDeContraste.ts:6` — revisar el docblock: este módulo ya **no** cubre
   @s7.
4. `matrizDeContraste.test.ts:446` → 23 y `:463` → 23 **en el mismo paso** (el
   segundo está hoy enmascarado por el primero).
5. `matrizDeContraste.test.ts:509` y `:531` → **115**, y corregir el comentario a
   «23 pares x 5 variantes». La lista de suspensos esperada del test de sabotaje
   **no cambia**: ninguna de las dos filas borradas suspendía.
6. `matrizDeContraste.test.ts:110-131` (@s7) — **reescribir el `it` entero** para
   que muerda sobre los tokens. **TRAMPA**: cambiarlo a `.toEqual([])` deja el
   escenario sin afirmar nada sobre contraste. No hacerlo.
7. `matrizDeContraste.test.ts:732-747` — el título del `describe` se vuelve falso
   en su primera mitad. **Borrar el `it` de `:743` con nota** (no reescribirlo:
   «repararlo» a 0/'suspenso' duplicaría la guarda que ya prueban `:481-500`).
8. `matrizDeContraste.test.ts:739` — **conservar**, pero escribir que es una
   antirregresión **trivial**: `urgencia-suave` no tiene ni ha tenido fila.
9. `matrizDeContraste.test.ts:436` — **añadir** la entrada del 20/09/2026 al
   histórico del recuento: 25 → 23, con la decisión de Pablo y su motivo.
10. `matrizDeContraste.test.ts:594` y `:622` — siguen **verdes** (usan matriz
    sintética), pero pasan a **ilustrar** una pareja que el sistema ya no
    declara. Reanclar el ejemplo a una pareja viva (p. ej. `sobre-primario` sobre
    `primario`) o dejar nota.
11. `src/components/Hero.test.tsx:330` — reapuntar el comentario que cita «el CTA
    de urgencias de `Cabecera.module.scss` sobre su rojo»: con F1 el precedente
    desaparece **también** de la matriz.
12. **NO TOCAR** (verificado): `matrizDeContraste.test.ts:466` (recorre 23, sin
    vacuidad), `:476` (los dos usos sobreviven), `:133-159` (segundo `it` de @s7,
    sobrevive y muerde), `tokensColor.test.ts:229-235`.

### B. F2 — el movimiento

13. `src/components/InformacionContacto.test.tsx:496-511` — **borrar en el mismo
    commit que el SCSS**. Es el único test que afirma que existe una
    `animation:`, y **lanza** cuando el bloque desaparece.
14. `tests/e2e/movimiento.spec.ts:79-94` — **defecto real, independiente de esta
    tanda**: el contador de «elementos con transición efectivamente
    inspeccionados» se mide bajo `reducedMotion: 'reduce'`, y bajo `reduce` el
    anulador global pone `transition-duration: 0.01ms` sobre `*`: devuelve el
    documento entero, siempre. Reapuntar a un recuento sin la emulación, o
    acotado a los elementos de los 6 módulos que sí la declaran. Igual con
    `transicionesFueraDeEscala`.
15. `movimiento.spec.ts:21`, `:54`, `accesibilidad.spec.ts:305`, `:510`,
    `fidelidad.spec.ts:63` — **conservar** las cinco esperas
    `getAnimations().every(...)`: como esperas son inofensivas y
    `fidelidad.spec.ts:152` depende del `reduce` para que `aplicarVariante`
    converja. **Reescribir sus comentarios**: ya no asientan lo que prometen, y
    varios citan `global.scss:290`/`:301`, que hoy son `:326` y `:339`.
16. `tests/e2e/fidelidad.spec.ts:148-150` — el punto 14 del contrato de la
    primera tanda **nace caducado** (reapuntaba a `@keyframes pulso`, que E1
    borra). Texto verdadero: no queda ninguna `animation:` en `src/`; el `reduce`
    se conserva porque el `body` transiciona `background-color`/`color`
    (`global.scss:326`) y porque la sonda de `medirTokensResueltos` depende de
    ese bloque.
17. `tests/e2e/movimiento.spec.ts:23` — sigue verde, **sin sujeto posible**. No
    hay que tocarlo, pero la nota de @s42/@s19 debería decir que ese 0 ya no
    demuestra que el anulador funcione: demuestra que no hay nada que anular.
18. **Tests nuevos** para el @s22 reescrito (las tres puertas ya existen: basta
    con rotularlas y cerrar el hueco del «recuento de módulos leído del texto
    real») y para las cláusulas nuevas de @s19 y @s20.
19. **NO TOCAR** (verificado): `movimientoRespetuoso.test.ts` (censo 7 → 6
    ficheros, anti-vacuidad con margen), `movimiento-global.test.ts` (intacto),
    `Equipo.test.tsx:498-507`, `accesibilidad-movimiento.test.ts:102-104` y
    `:113-134`, `movimiento.spec.ts:117-120`, `global.scss:339-344`.

### C. G1 — la altura de la cabecera

20. `src/components/Cabecera.module.scss:33` — `min-height:
    calc(var(--altura-cabecera) - #{$ancho-borde-fino})`. **Una línea.**
21. `src/styles/global.scss:241-244` — reapuntar el comentario **en el mismo
    paso**: hoy afirma «64px + 8px = 72px» (el hueco real es 7) y «no hay
    solape» (falso de `#inicio`).
22. `tests/e2e/fidelidad-cabecera.spec.ts` — el test de @s4 **no** debe reutilizar
    el `const TOLERANCIA = 1` de `:6`. Que declare el suyo, derivado del grosor
    del borde fino, con el porqué escrito.
23. `src/styles/hoja-global.test.ts:123-131` — **no hay que tocarla**, pero hay
    que **re-correrla**.

### D. G2 — el panel móvil

24. `src/components/Cabecera.test.tsx:331` — **no tocar en esta tanda**. Dejar
    escrito que ese `it` va más allá de su Gherkin: se rotula @s28 de
    `rediseno_visual`, cuyo Given acota a escritorio. La píldora del panel móvil
    nunca ha tenido contrato detrás.

### E. Mutación

25. F1 no toca ningún export de `src/**/*-logica.ts`, así que **no mueve el
    denominador de Stryker**. F2 y G1 tampoco. Los que sí lo mueven son D1 y E2,
    ya apuntados en sus informes. Hay que **volver a correr** `bin/harness
    mutate` de todas formas, porque el `break = 100` se evalúa sobre la suite
    completa.

---

## 5. Tareas abiertas para otra sesión

1. **Animaciones de la galería «nuestros amiguetes»** — punto 8 de la reunión del
   16/08/2026, minutos 06:21-06:43: que pase automáticamente y «que tenga un par
   de animaciones, que si algo aquí se haga más grande». Nunca implementadas.
   **Su propio contrato, su propia feature.** Esta tanda solo deja registrado que
   el sitio se queda al otro lado de lo que el socio pidió.
2. **Acercar el panel móvil al prototipo** — Pablo no lo ha pedido. Divergencias
   medidas contra `Veterinaria La Sierra.dc.html:110`: borde de 1 px donde el
   prototipo no tiene, radio 999 contra 12, peso 600 contra 500, relleno lateral
   24 contra 12 y tinta `--color-texto` (#3C4C66) contra la tinta (#0B1B33) que
   usan sus siete hermanas y el prototipo. El alto (48 contra 46) es la única
   cifra que hoy está bien. Retirar `Cabecera.test.tsx:331` **no** abrirá una
   segunda puerta humana sobre @s28.
3. **Blindar los tres consumidores de `--altura-cabecera` que hoy no mide nadie**
   — `scroll-padding-top`, `--desplazamiento-al-enfocar` y `.panelMovil`. El
   arreglo de G1 los cuadra, pero ninguna puerta lo vigilaría después.
4. **`--color-urgencia-suave` se queda huérfano** — tras E1 ningún fichero de
   `src/` lo pinta. Sigue declarado en las cinco variantes y congelado por
   `rediseno_visual` @s1/@s2, `contratoRedisenho.ts` y el mapeo `--urg-soft` de
   `fidelidadPrototipo.ts`. Por la misma lógica de Pablo —que lo declarado sea lo
   que el sitio pinta— es el siguiente hilo. **No se toca aquí.**
5. **La puerta de reconciliación de la matriz sigue sin detectar filas huérfanas**
   — solo busca el caso contrario, y sus ocho invocaciones usan ficheros
   sintéticos. F1 no cierra ese agujero: solo retira lo que había caído dentro.
6. **`escalaMovimiento.test.ts:43`** — su anti-vacuidad cuenta **ficheros**, no
   declaraciones, así que seguiría en verde aunque el proyecto se quedara con
   cero movimiento. No lo rompe F2, pero es el único sitio donde falta la guarda
   de «declaraciones inspeccionadas > 0».
7. **`tests/e2e/accesibilidad.spec.ts:374-431`** — `hijosVisiblesDe(header)`
   compara `header > *:visible` y `header` tiene un solo hijo desde que existe
   `.interior`: el bucle de pares no compara nada. Señalado por la primera tanda,
   sigue abierto.
8. **`identidad_visual.feature` @s5/@s7/@s10** publican ratios de una «matriz de
   uso de la variante marca» (12.84, 11.23, 9.13, 5.27) que **no tiene
   implementación**: no aparecen en ningún test ni módulo. No chocan con F1 —es
   otra matriz, sin parejas de urgencia— pero es el mismo defecto que la primera
   tanda señaló en @s6: contrato que publica números sin puerta viva.
9. **`identidad_visual.feature`** sigue diciendo «no existe ningún token cuyo
   nombre contenga "urgencia" ni "urg"», derogado **de hecho** por
   `rediseno_visual` @s13. Preexistente; conviene resolverlo en la misma sesión
   de puerta.
10. **`project-spec.md` queda desactualizado** en lo que describe de la feature 27
    (cabecera), de la sección de contacto y del pie. No se ha editado: fuera del
    alcance de esta fase.

---

## 6. Contradicciones y avisos para la puerta humana

1. **@s4 llega a la puerta NACIENDO EN ROJO.** Es deliberado y está escrito en su
   nota. Pablo aprueba un escenario que hoy falla; el arreglo es una línea de
   SCSS ya verificada en navegador.
2. **El 1 px ya estaba escrito, medido y firmado en el repositorio.**
   `src/styles/global.scss:243-244` dice «la cabecera fija `y = 0 … 65` (64 de
   altura más su borde fino)» y concluye «no hay solape». Alguien midió el
   defecto, lo anotó y lo leyó como si no fuera uno. El 32 px del 09/09/2026 lo
   cazó un humano mirando Chrome; este 1 px llevaba semanas escrito en el propio
   comentario que lo negaba.
3. **Ningún test del proyecto mide hoy la altura renderizada de la cabecera.**
   Rastreado `tests/e2e/*.ts`: cero resultados. El agujero que dejó el incidente
   del 09/09/2026 sigue abierto entero, y @s4 —ya sin la tolerancia que lo
   tapaba— sería la primera puerta que lo cierra.
4. **Tercer caso del mismo patrón en el mismo día: un test que va más allá de su
   Gherkin.** La primera tanda encontró dos tests que **contradecían** su
   contrato (`Cabecera.test.tsx:114`, `PaginaBlog.test.tsx:98`). Aquí hay un
   tercero, distinto: `Cabecera.test.tsx:331` congela la píldora del panel móvil
   bajo un rótulo que solo habla de escritorio.
5. **Una cláusula de contrato que no podía ponerse roja nunca.** La última de
   @s20. Retirada con nota. Es la vacuidad de fondo que F2 deja al descubierto,
   y no la crea F2.
6. **Sigue sin haber dónde registrar estas tres tandas.** Las **38** features de
   `feature_list.json` están todas en `done` y no hay ninguna `pending`: no se ha
   podido poner nada en `spec_ready` sin salirse del alcance dado
   (`features/` y `progress/`). **Decisión para el `craftsman_lead`**, ya
   planteada por las dos tandas anteriores y todavía sin resolver: abrir una
   feature nueva (`39 cabecera_sin_urgencias`, `40 urgencias_fuera_de_contacto_y_pie`,
   `41 reconciliacion_matriz_y_movimiento`, `sdd: true`, `spec_ready`) o registrar
   todo como enmienda de las features 10, 13 y 27.
7. **Queda una decisión de la segunda tanda SIN ratificar explícitamente**, y no
   se ha dado por aprobada aquí: la de `progress/contacto_pie_contrato_20260920.md`
   §3.1 — aceptar que el teléfono de urgencias **deje de publicarse de forma
   estática** en las seis rutas, con el recuento fijado en 0 como disparador
   (camino iii). El ALCANCE FINAL del encargo de esta tanda es coherente con ese
   camino, pero **eso no es una aprobación**: tiene que decirlo Pablo en la
   puerta.

---

## 7. Estado

Los **ocho** ficheros de `features/` tocados en las tres tandas quedan
**coherentes y a la espera de la puerta humana**, y se leen de una pieza:

`features/accesibilidad.feature` · `features/cabecera_y_navegacion.feature` ·
`features/fidelidad_cabecera.feature` · `features/fidelidad_contacto.feature` ·
`features/informacion_contacto.feature` · `features/pie_de_pagina.feature` ·
`features/rediseno_visual.feature` · `features/seo_estructura.feature`

No se lanza al `tdd_craftsman` hasta que Pablo apruebe, y con él las decisiones
de §6.6 y §6.7.
