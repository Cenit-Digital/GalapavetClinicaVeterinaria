# Contrato de la cabecera — reescritura del 20/09/2026 (D1–D4)

> Autor: `gherkin_author`. Fase: **Gherkin**, anterior a la puerta humana.
> No se ha tocado `src/`, ni los tests, ni `feature_list.json`, ni
> `project-spec.md`. Solo `features/*.feature` y este fichero.

**Origen de la decisión.** Pablo, 20/09/2026, corroborado en la grabación de la
reunión con su socio Roberto Alonso del 16/08/2026 (`2026-08-16 16-14-50.mkv`;
tabla en `progress/decisiones_reunion_rober_20260816.md`, puntos 3, 4 y 9;
transcripción con marcas de tiempo en
`progress/transcripcion_reunion_rober_20260816.txt`), minutos **02:31**,
**03:02-03:05** y **06:52-07:00**.

- **D1** — la cabecera deja de tener cualquier control de urgencias.
- **D2** — la navegación de escritorio termina en el borde derecho de la
  columna de 1220 px, en espejo con la marca.
- **D3** — separación visible entre "Galapavet" y su descriptor (hoy 0,00 px).
- **D4** — el acceso "Tienda" como el del prototipo: píldora más baja, tinta
  fuerte, borde más suave, **sin** perder el objetivo de pulsación de 44×44.

El punto 9 de la reunión (urgencias fuera **también** en Contacto) queda
**fuera** de esta tanda, como pedía el encargo.

---

## 1. Qué escenarios he tocado y cómo

### `features/fidelidad_cabecera.feature` (reescrito entero)

| Tag | Cambio | Qué he hecho |
| --- | ------ | ------------ |
| — | cabecera del fichero | Bloque de comentario nuevo: decisión, minutos citados, D1–D4, por qué D1 es una **restauración** y no un contrato nuevo, y el ALCANCE (solo cabecera). |
| `@s1` | reescrito | **Eliminada con nota** la cláusula «su acceso a urgencias comunica exactamente el rótulo real… y su teléfono real» (D1). **Reescrita** la cláusula del «bloque compacto» de la marca: era prosa sin medida que hoy se cumple con 0,00 px, es decir, el contrato bendecía el defecto de D3. Ahora exige **exactamente el primer paso de la escala de espaciado (4 px)** entre la caja del nombre y la del descriptor. **Añadida** la cláusula de D2: el borde **derecho** de la navegación coincide (±1 px) con el borde derecho del contenido de las secciones, y se explicita el espejo con el borde izquierdo de la marca. |
| `@s2` | reescrito | **Eliminada con nota** «existe un botón "Urgencias"…» (D1). La cláusula de 44×44 **no se relaja**: se precisa que se mide el **objetivo de pulsación** de cada uno de los ocho enlaces. Añadida guarda anti-vacuidad («la medición recorre los ocho enlaces, nunca una lista vacía») y «ningún control de la fila tiene un destino que empiece por `tel:`». |
| `@s3` | reescrito | Título sin «y urgencias»; la cláusula de teclado habla solo de enlaces de navegación; el panel pasa a **exactamente ocho** destinos. **Decisión explícita** que el dosier pedía tomar: el acceso "Tienda" del panel móvil se dibuja con **la misma píldora** que en escritorio (mismo alto visible, mismo color de borde), para que móvil y escritorio no diverjan. |
| `@s4` | **nuevo** | La franja fija mide exactamente el hueco que el documento reserva bajo ella; el bloque de marca no lo supera; el primer contenido empieza justo debajo. Cubre el agujero que el incidente del 09/09/2026 dejó abierto (nada mide hoy la **altura** renderizada de la cabecera) y es la puerta que demuestra que los 4 px de D3 siguen cabiendo. |
| `@s5` | **nuevo** | D1 con cobertura ejecutable en las seis rutas: sin `tel:` en la cabecera, sin nombre accesible ni texto con "Urgencias", **y** —cláusula deliberada— en cada ruta sigue existiendo, **fuera** de la cabecera, un enlace de llamada con el rótulo real. Guarda anti-vacuidad incluida. |
| `@s6` | **nuevo** | D4, geometría: alto visible < 48 px (altura de control media), ≤ 36 px (24 + paso 12 de la escala), ≥ 24 px (SC 2.5.8), objetivo de pulsación ≥ 44×44, texto con la tinta fuerte, tamaño de letra de un paso existente de la escala. |
| `@s7` | **nuevo** | D4, color de borde: más suave que el borde de control en cada variante, pero **≥ 3:1** contra el fondo sobre el que se pinta en las cinco; los demás botones de contorno **no cambian ni un dígito**; una sola regla derivada de tokens existentes; ningún color literal en el módulo. |

Los números de `@s6`/`@s7` **no son estéticos**: 48, 36 y 24 salen de
`_api.scss` (`$altura-control-media`, `$area-tactil-minima + espaciado(12)`,
`$area-tactil-minima`), y los ratios están **medidos** con la función de
contraste del propio repositorio (ver §4).

### `features/rediseno_visual.feature`

| Tag | Cambio | Qué he hecho |
| --- | ------ | ------------ |
| `@s26` | cláusula reescrita | «…con los dos botones nuevos ya presentes» → «…con el acceso a la tienda ya presente», con nota: el segundo botón era el CTA de urgencias. |
| `@s27` (nota de eliminación) | nota reescrita | Decía que el acceso a urgencias «vive en el CTA de la cabecera (@s28), en el pie y en la tarjeta de contacto». Con D1 **eso es falso**. Corregida a «vive en el pie y en la tarjeta de contacto» + `ACTUALIZACIÓN (20/09/2026)` explicando el porqué. Una nota de eliminación que documenta algo falso es justo el defecto que esas notas existen para evitar. |
| `@s28` | título reescrito + cláusula eliminada con nota | Título: «La cabecera lleva la navegación y el acceso a la tienda». Eliminada «muestra un control de urgencias con el color de urgencia de la variante activa». Se conservan íntegras las cláusulas de tienda (borde sin relleno), cabecera visible al desplazar y ancla calculada desde la altura real. La nota avisa de que la fila `sobre-primario`×`urgencia` de la matriz **no se borra** (la sigue pintando `InformacionContacto`): solo caduca su cita. |

### `features/cabecera_y_navegacion.feature`

**Ni una palabra del contrato tocada** (es `done` y ya exigía D1). Solo un
bloque de comentario sobre `@s13` dejando constancia de dos hechos: (1) `@s13`
no tiene ningún test desde el 25/08/2026 —puerta inerte—, y (2) estaba
**incumplido** desde el 03/09/2026. Es material para la puerta humana: Pablo no
cambia de opinión, vuelve al contrato que ya había aprobado.

### `features/pagina_blog.feature` — **no tocado**

Su `@s2` ya prohíbe las urgencias en la cabecera del blog. Lo que está mal es
su test (§2).

---

## 2. Puertas del dosier que quedan para el `tdd_craftsman`

### A. Vitest — **sí corren en CI** (`harness-ci.yml`)

1. `src/components/Cabecera.test.tsx:114` (@s7) — **invertir**:
   `expect(within(panel).queryAllByRole('link', { name: /Urgencias/i })).toHaveLength(0)`.
   Borrarlo sin más dejaría sin puerta la última cláusula de
   `cabecera_y_navegacion.feature:162`.
2. `src/components/Cabecera.test.tsx:109` — quitar el filtro de `href^="tel:"`
   (queda inerte y ocultaría una regresión) y afirmar directamente los 8
   enlaces del panel, con nombres y destinos en orden.
3. `src/components/Cabecera.test.tsx:223-237` — **convertir en el test de
   `@s13`**: las tres aserciones finales (8 enlaces, sin "24 h", "24h" ni
   "640 22 11 90") son literalmente lo que `@s13` pide; añadir «el texto de la
   cabecera no contiene "Urgencias"» y «ningún enlace de la cabecera empieza
   por `tel:`». Si se borra el describe sin reubicarlo, **el saldo neto de D1
   es menos cobertura de la que había**.
4. `src/components/Cabecera-logica.test.ts:19-63` + el import de la línea 4 —
   borrar **en el mismo paso** en que se borran `construirControlDeUrgencias`,
   `TelefonoDeUrgencias` y `ControlDeUrgencias` de `Cabecera-logica.ts:13-42`.
   `stryker.config.json` muta `src/**/*-logica.ts` con `break = 100`: función
   viva + tests borrados = mutantes supervivientes = mutación roja. Y hay que
   **volver a correr** `bin/harness mutate`: el denominador cambia.
5. `src/pages/PaginaBlog.test.tsx:98-100` (@s2) — invertir a
   `queryAllByRole('link', { name: /Urgencias/i })` = 0 dentro del banner, y
   renombrar el `it` de la línea 80 («y la cabecera ofrece las urgencias
   reales»).
6. `src/components/Cabecera.test.tsx:319-336` — **no tocar**: `@include
   boton-fantasma` debe seguir presente en `.navPrincipal` y en `.panelMovil`.
   D4 son **overrides locales** después del `@include`, nunca abandonar el
   mixin (precedente en verde: `PaginaTienda.module.scss:164-166`).
7. `src/styles/hoja-global.test.ts:110-131` — no tocar, pero **re-correr** tras
   D1/D2/D3: es la puerta que roza el defecto tipo «franja vacía».

### B. Playwright — **no corren en CI**: hay que lanzarlos a mano

8. `tests/e2e/fidelidad-cabecera.spec.ts:41-43` (@s1) — eliminar el bloque del
   `tel:`. **Añadir** las tres aserciones nuevas: borde derecho del nav ≈ borde
   derecho de `#servicios > *` (D2, sin escribir 1330 a mano), separación de
   4 px entre nombre y descriptor (D3) y `header.height ≈
   getComputedStyle(#root).paddingBlockStart` (@s4).
9. `tests/e2e/fidelidad-cabecera.spec.ts:63/65/68/80` (@s2) — sacar `urgencias`
   del array `controles`; **conservar intacto el bucle 69-76** (es el 44×44 que
   D4 debe seguir pasando) y añadirle `expect(controles.length)
   .toBeGreaterThan(0)`.
10. `tests/e2e/fidelidad-cabecera.spec.ts:97-100` (@s3) — 9 → 8 enlaces y
    eliminar el bloque del `tel:`. Conservar `tabIndex >= 0` y el cierre al
    navegar. Añadir la comparación de píldora panel ↔ escritorio.
11. `tests/e2e/rediseno-visual.spec.ts:53,61` — eliminar la aserción
    `header a[href^="tel:"]` y renombrar el test. **Es el segundo reapuntado
    consecutivo de la misma aserción** (en septiembre se movió de
    `BarraUrgencias` al CTA de la cabecera): conviene que la nota diga que el
    acceso de urgencias ya no vive en el armazón de cabecera.
12. `tests/e2e/urgencias.spec.ts:110-112` — actualizar el comentario («el CTA
    de la cabecera y el pie…») y **verificar en verde**: tras D1 el único
    superviviente del armazón común es el pie
    (`App.tsx:67` → `PieDePagina-logica.ts:77`).
13. `tests/e2e/accesibilidad.spec.ts:374-431` — **defecto real, independiente
    de esta tanda**: `hijosVisiblesDe(header)` compara `header > *:visible`, y
    `header` tiene **un solo hijo** desde que existe `.interior`; el bucle de
    pares no compara nada. Reapuntar a `[data-cabecera-interior] > *:visible`.
    Es la puerta que detectaría un aterrizaje malo de D2 a 1024/1023 px.
14. `tests/e2e/fidelidad.spec.ts:148-150` — **conservar** la llamada a
    `emulateMedia({reducedMotion:'reduce'})` y reapuntar solo su comentario a
    `InformacionContacto.module.scss:199/267` (`@keyframes pulso`, viva).
    Quitarla «porque ya no hay animación infinita» dejaría `aplicarVariante`
    sin converger.
15. `tests/e2e/geometria-escalas.spec.ts:277-282` — no tocar los localizadores.
    **Aviso D3**: el representante del paso tipográfico −2 es literalmente el
    `<span>` del descriptor, así que el `gap` de D3 **no puede** tocar su
    `font-size` ni reestructurar el árbol `a > span > (strong, span)`.
    Opcional: limpiar la advertencia de 279-280, que queda sin objeto.
16. `tests/e2e/css-presupuesto.spec.ts` — verificar **después** de la oleada;
    D1 libera bytes y D4 añade pocos.
17. **Tests nuevos** para `@s4`, `@s5`, `@s6` y `@s7`.

### C. Código y comentarios que quedan apuntando al vacío

18. `src/lib/diseno/matrizDeContraste.ts:363` — reapuntar **solo el
    comentario** a `InformacionContacto.module.scss:153-159`. **Nunca borrar la
    fila**: `matrizDeContraste.test.ts:446/463` exige exactamente 25 filas y
    125 parejas, y `:110-113` exige que la única tinta sobre `urgencia` sea
    `sobre-primario`.
19. `src/components/Hero.test.tsx:330` — reapuntar el comentario que cita «el
    CTA de urgencias de `Cabecera.module.scss` sobre su rojo».
20. `src/components/Cabecera.module.scss` — borrar `.urgenciasEscritorio`,
    `.urgenciasMovil`, `.puntoUrgencias`, `.rotuloUrgencias` y
    `@keyframes pulso-urgencias`; **añadir** `gap: espaciado(4)` en el bloque
    `.marca > span` **ya existente** (D3, nunca un `margin` a mano); overrides
    de D4 dentro de `a[data-enlace-tienda]`.
21. `src/components/Cabecera.tsx` — retirar `EnlaceUrgencias` y sus dos usos.
    Ojo: `datosNegocio` **se sigue usando** (nombre comercial y descriptor).

### D. Lo que el dosier confirma que **no** hay que tocar

`inventarioModulos.ts:17`, `rolesDescartados.test.ts:246`,
`usoDelAcento.test.ts:322` (anclan al **fichero** `Cabecera.module.scss`, que
sobrevive: los censos 17/17/19 siguen cuadrando), `puntoDeCorte.test.ts`,
`movimientoRespetuoso.test.ts`, `puertaTerceros.test.ts`,
`escenariosHeredados.ts`, `accesibilidad.spec.ts:74` (@s37) y axe
(`target-size`, 24 px), `geometria-escalas.spec.ts:565` (@s25, no alcanza a la
cabecera), `_api.scss` (mixin `boton-fantasma` — **10 `@include` en 6
ficheros**) y `_tokens.scss` (`--color-borde-control` congelado).

---

## 3. Contradicciones encontradas

1. **Dos tests contradicen hoy a su propio contrato.**
   `Cabecera.test.tsx:114` se presenta como `@s7` y exige el enlace de
   urgencias que `cabecera_y_navegacion.feature:162` **prohíbe**;
   `PaginaBlog.test.tsx:98` se presenta como `@s2` y exige el que
   `pagina_blog.feature:191` **prohíbe**. Hay que **invertirlos**, no borrarlos.
2. **`fidelidad_cabecera` (03/09/2026) contra `cabecera_y_navegacion` @s13/@s7
   (25/08/2026).** Contradicción frontal entre contratos aprobados, viva desde
   hace 17 días. **D1 la resuelve**, y esta reescritura la documenta en los dos
   ficheros. Para la puerta humana: Pablo **no** está cambiando de criterio.
3. **`@s13` es una puerta inerte.** Aprobada el 25/08/2026 y **sin un solo
   test** desde entonces. Si el artesano borra `Cabecera.test.tsx:223-237` sin
   reubicarlo, D1 deja **menos** cobertura de la que había.
4. **La nota de `@s27` documentaba algo que D1 vuelve falso.** Corregida.
5. **El patrón estándar de SC 2.5.8 NO pasa la puerta de 44×44.**
   `fidelidad-cabecera.spec.ts:70-76` mide `getBoundingClientRect()` del propio
   `<a>`; un `::before` que extiende el objetivo **no cambia ese rect**. El
   contrato adopta la vía inversa —enlace de 44 px, píldora de ~35 px dibujada
   dentro—, que es la única que **no** abre otra puerta de aprobación humana.
6. **El borde suave no puede salir de `--color-borde-control`.** Está congelado
   hexadecimal a hexadecimal por `rediseno_visual` @s8 (Enmienda 3) y @s4 y por
   `identidad_visual` @s3:379; tocarlo pone en rojo 5+ `it`. **Ningún token
   existente sirve** (medido: `--color-borde` da 1,20-1,56:1;
   `--color-texto-suave` no es más suave). Quedan dos caminos y **solo uno es
   barato** (§4).
7. **`urgencias.spec.ts` pasa a depender de un único punto** (el pie), y no
   corre en CI. El contrato lo asume por escrito en `@s5`, última cláusula, en
   vez de dejarlo a la suerte.
8. **`identidad_visual.feature:415-423` (@s6) publica ratios sin test vivo**
   (4,23 y 3,70 del borde de control de `marca`): su implementación se retiró
   como código huérfano. Hoy los números siguen siendo ciertos; si alguien
   tocara el token, el contrato mentiría **en silencio**. Esta tanda no lo toca.
9. **No hay dónde registrar esta tanda.** Las 38 features de
   `feature_list.json` están `done` y no hay ninguna `pending`: no he podido
   poner nada en `spec_ready` sin salirme del alcance que se me dio
   (`features/` y `progress/`). **Decisión para el `craftsman_lead`**: abrir
   una feature nueva (p. ej. `39 cabecera_sin_urgencias`, `sdd: true`,
   `spec_ready`) o registrar esto como enmienda de la 27.
10. **`project-spec.md:1055` queda desactualizado**: describe la feature 27 como
    «barra de urgencias y cabecera… botón rojo de urgencias con el rótulo
    real». No lo he editado (fuera de mi alcance en esta fase).
11. **Sin choque con `accesibilidad.feature`**: su Decisión 2 y su `@s17` solo
    exigen que **no** exista barra superior de urgencias; D1 va en la misma
    dirección. Y **sin choque con `rediseno_visual` @s14**: el rótulo real
    sigue apareciendo en las seis rutas —ahora desde el pie—, que es
    exactamente lo que `@s5` blinda.

---

## 4. Medidas hechas para no contratar a ojo

Calculado con la fórmula de contraste del propio repositorio sobre
`src/styles/_tokens.scss`, contra los **cuatro** planos de fondo del sistema
(`fondo`, `fondo-alterno`, `superficie`, `superficie-elevada`) en las **cinco**
variantes:

| Variante | `--color-borde-control` | ratios actuales (4 planos) |
| -------- | ----------------------- | -------------------------- |
| clinica | `#5E6E88` | 4,94 / 4,60 / 5,17 / 5,07 |
| calida | `#8A6C45` | 4,72 / 4,37 / 4,79 / 4,79 |
| tech | `#94C5FF` | 9,94 / 8,73 / 8,68 / 9,43 |
| eco | `#557368` | 5,20 / 4,97 / 5,20 / 5,08 |
| marca | `#A06997` | 4,23 / 3,70 / 4,23 / 3,95 |

El borde del prototipo (`#D7E9E4`) da **1,20:1** contra `#F8FAFC`: **no cumple**
SC 1.4.11 y por eso no se copia.

**Punto de suavidad máxima que todavía cumple 3:1 en las cinco variantes y
contra los cuatro planos**: mezclar un **12 %** del fondo de la variante dentro
del borde de control → peores casos **3,61 / 3,48 / 6,92 / 3,87 / 3,01**.
`marca` es la que manda: al 16 % ya suspende (2,81) y al 20 % cae a 2,63.

**Hallazgo que abarata D4 (y que el dosier daba por imposible).** No hace falta
un token nuevo: `color-mix(in srgb, var(--color-borde-control) 88%,
var(--color-fondo))` **no es un literal de color** —`puertaLiteralesColor`
persigue `#hex`, `rgb()/hsl()` y los 16 nombres CSS—, y el patrón **ya está en
producción y en verde**, incluso para un `border-color`
(`Hero.module.scss:132`, `:55`, `:181`). Por ese camino **no se toca** el
inventario congelado de 20 tokens (`rediseno_visual` @s1/@s2), ni las 25 filas
/ 125 parejas de la matriz, ni `contratoRedisenho`, ni `tokensColor`, ni
`fidelidadPrototipo`. El camino del token nuevo costaría enmendar 20→21, 18→19,
100→105 y 25→29, 125→145: **segunda puerta de aprobación humana** y, como decía
el barrido, su propia feature pequeña.

**D3 es seguro, con la cuenta hecha**: 21 px (nombre) + 4 px (`espaciado(4)`) +
10,752 px (descriptor) = **35,752 px**, y la altura de la marca la sigue
mandando el logotipo de 40 px (`$altura-control-pequena`). `--altura-cabecera`
se queda en 64 px: ni `#root`, ni `scroll-padding-top`, ni
`posicionDeScrollParaAncla` se mueven. La holgura baja de 8,25 a 4,25 px, y
`@s4` es la puerta que lo vigila a partir de ahora.

---

## 5. Estado

`features/fidelidad_cabecera.feature` (7 escenarios), más las enmiendas de
`rediseno_visual.feature` (@s26, nota de @s27, @s28) y la nota de
`cabecera_y_navegacion.feature` (@s13), quedan **a la espera de la puerta
humana**. No se lanza al `tdd_craftsman` hasta que Pablo apruebe.
