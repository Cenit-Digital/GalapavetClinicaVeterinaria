# Reparación de features/servicios.feature — hallazgos CONFIRMADO de VEREDICTO_servicios.md

Fuente: `progress/revision/VEREDICTO_servicios.md`. Se atienden los 6 hallazgos
marcados **CONFIRMADO**; los 2 **REFUTADO** (`@s2`/`@s3`/`@s10` rótulo visible,
y el Given de `@s16`) no se tocan, tal y como exige su propia justificación en
el veredicto.

## 1. `@s2` (línea ~105) — grave, CONFIRMADO L1

**Antes:** `And ningún punto de desglose es consultable en el árbol de accesibilidad`
(sin acotar a las tarjetas de Servicios; el Background monta la landing
completa y `campanas_portada.feature` tiene tarjetas tituladas «Vacunaciones»
y «Chequeo» que coinciden con puntos reales del desglose de «Medicina
general»).

**Cambio (línea 105):** se acota explícitamente a las 5 tarjetas de la
sección → `And ningún punto de desglose de ninguna de las 5 tarjetas de
Servicios es consultable en el árbol de accesibilidad`. Mismo estilo que
`@s11` (línea 194) y `@s12` (línea 202), que ya acotaban correctamente.

## 2. `@s19` (líneas ~259-261, ahora ~261-267) — grave, CONFIRMADO L1

**Antes:** tres líneas vacuamente ciertas hoy (0 imágenes, según la propia
cabecera §PENDIENTE) y una tercera línea («describe la fotografía, no un
servicio») sin procedimiento determinista de verificación, ni hoy ni cuando
existan imágenes.

**Cambio (bloque completo del escenario, ~línea 261-267):**
- Se añade `Then el número de imágenes de la sección es 0` como primera
  aserción: hace explícita y honesta la vacuidad de hoy en vez de dejarla
  escondida detrás de aserciones universales silenciosamente vacías (mismo
  criterio que el patrón `verde-por-vacuidad-en-puerta-de-verificacion`
  citado en `accesibilidad.feature:74-94`).
- Se sustituye el juicio semántico «describe la fotografía, no un servicio»
  por una lista negra cerrada y medible: «el texto alternativo... no
  contiene el nombre de ninguno de los cinco bloques de servicio ni de
  ninguno de sus puntos publicados» — reutiliza los rótulos de bloque y de
  punto ya fijados en `@s1` y `@s4`-`@s8` del propio fichero, sin inventar
  contenido nuevo.
- Título del escenario actualizado para reflejar que cubre el estado de hoy
  (0 imágenes) y la garantía a futuro, en una sola pasada.

## 3. `@s18`, línea "plazo/cifra de volumen" (línea ~253) — grave, CONFIRMADO L1

**Antes:** `And el texto de la sección no contiene ninguna promesa de plazo
ni cifra de volumen` — rompía el patrón de lista negra literal de las 8
líneas hermanas (categoría de mundo abierto, sin literal que la cierre).

**Cambio:** línea eliminada. No existe en `docs/datos-galapavet.md` ni en
ningún otro `.feature` del proyecto un literal concreto de "promesa de
plazo" o "cifra de volumen" propio de la sección Servicios que se pueda
citar sin inventar contenido nuevo (los candidatos de volumen/antigüedad
—"12 años", "8.400", "327", "4,9"/"4,6"— ya están protegidos en
`hero.feature` e `informacion_contacto.feature`, no son propios de este
fichero). Las 8 líneas de lista negra restantes (Urgencias 24 h, 24 h,
Peluquería canina, Animales exóticos, Nutrición y etología, Microchip y
viajes, Doce especialidades, símbolo €) siguen cubriendo el criterio de
aceptación 4 de `feature_list.json` («sin añadidos») junto con el resto del
escenario.

## 4. `@s18`, línea "26 publicados en doc externo" (línea ~254) — grave, CONFIRMADO L3

**Antes:** `And los únicos puntos listados son los 26 publicados en
docs/datos-galapavet.md §5` — remitía a un documento externo en vez de fijar
una comprobación de conjunto positiva contra las tablas literales que el
propio fichero ya fija.

**Cambio (línea ~259, misma pasada que el punto 3):** se sustituye por una
cita interna: `And el conjunto de los 26 puntos mostrados en las cinco
tarjetas es exactamente la unión de las cinco listas fijadas en @s4, @s5,
@s6, @s7 y @s8 de este mismo fichero, con "Odontología" y "Endoscopia"
apareciendo cada una en sus dos bloques publicados y ningún otro punto
añadido, omitido ni repetido`. Ancla contra las tablas literales ya
existentes en el propio `.feature` (no contra el documento externo) y deja
explícita la excepción de los dos puntos que la fuente del cliente publica
duplicados a propósito (documentada en la cabecera, líneas 57-61), evitando
que la reparación contradiga un comportamiento correcto.

## 5. `@s16`, Then (líneas ~231-232) — grave, CONFIRMADO L3

**Antes:** `Then la tarjeta "Análisis" muestra una lista con exactamente 5
elementos / And ningún elemento de esa lista tiene el nombre accesible
vacío` — solo contaba y negaba vacío; un mutante que reordene, duplique o
sustituya uno de los 5 puntos supervivientes sobrevivía.

**Cambio (líneas ~232-238):** se inserta la tabla ordenada de los 5 nombres
accesibles supervivientes (los 6 puntos reales de «Análisis» fijados en
`@s7`, líneas 158-163, menos el sexto — «Hormonales» — sustituido por la
cadena en blanco del Given, consistente con la lectura ya arbitrada como
correcta en el propio veredicto para ese Given). No se inventa contenido: es
la misma tabla de `@s7` menos su último elemento.

## 6. CABECERA (líneas ~51-53) — menor, CONFIRMADO L3

**Antes:** «Casos límite nuevos... bloque con desglose vacío (@s14), punto en
blanco dentro del desglose (@s15) y catálogo vacío (@s16).» — desfase de uno:
`@s14` real es un escenario de accesibilidad, no un caso límite.

**Cambio (líneas 51-53):** corregidas las referencias a `@s15` (desglose
vacío), `@s16` (punto en blanco) y `@s17` (catálogo vacío), que son las
etiquetas reales de esos tres escenarios en el fichero.

## No tocado (REFUTADO, según el propio veredicto)

- `@s2`/`@s3`/`@s10`, "rótulo visible" — el veredicto demuestra que rótulo
  visible y nombre accesible son observables distintos y bien soportados
  bajo `css: false`; no hay ambigüedad real. Sin cambios.
- `@s16`, Given (línea 229) — el veredicto demuestra que solo la lectura
  "se sustituye el 6º punto real por una cadena en blanco" es aritméticamente
  compatible con el propio Then del mismo escenario (ahora reforzado por el
  punto 5 de arriba). Sin cambios en el Given.
