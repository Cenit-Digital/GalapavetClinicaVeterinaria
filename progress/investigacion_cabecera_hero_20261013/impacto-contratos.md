# impacto-contratos

# Inventario de impacto: hero reducido + cabecera transparente sobre la imagen + nav grande y blanco + animación de entrada

**Método y límites.** Solo lectura: Grep/Read y comandos de lectura sobre el repo (git limpio en `main`, 8f80dbe). NO he ejecutado Vitest, Playwright ni Stryker. Todo "se pondría rojo" es deducción del texto de los tests y contratos, no una corrida. Rutas relativas a la raíz del repo. Clasificación: SUPERADO = hay que reescribirlo o retirarlo; EN RIESGO = sigue siendo válido pero puede romperse; INDEPENDIENTE = no se ve afectado. El encargo cita valores de https://vetcruzverde.es/ (fadeInLeft 1,25 s, 150 ms, fadeIn 200 ms): NO ENCONTRADO en el repositorio (solo vienen del encargo) y no he consultado esa web.

## 0. Lo que más pesa (leer primero)

1. **La animación de entrada reabre una política con puerta humana.** `features/accesibilidad.feature:502-503` (@s20) fija que el recuento de bloques que aparecen con animación es exactamente 0 y que "reintroducir una animación de entrada exige pasar por la puerta humana". Lo repiten `features/retirada_carteleria_urgencias.feature:62-65` (F2: cero `animation:`, cero `@keyframes`) y `features/accesibilidad.feature:341-457`. Su puerta ejecutable es `src/lib/accesibilidad-movimiento.test.ts:255-261` (`recuentoDeBloquesQueAparecenAnimando` = 0).
2. **Un `@keyframes` legítimo se marca como "invisible sin animación".** `src/lib/accesibilidad-movimiento.ts:77,100-104` marca como invisibles todos los bloques animados de una hoja en cuanto esa hoja tiene una línea normalizada `opacity:0` o `visibility:hidden`. Eso incluye `from { opacity: 0 }` dentro de `@keyframes`. Lo exige `src/lib/accesibilidad-movimiento.test.ts:263-270`. Hay que enmendar la puerta, que es módulo puro en `src/lib` y por tanto mutable al 100 % (`stryker.config.json:12-17,27-31`).
3. **La escala de movimiento cierra en 150 y 300 ms.** `features/identidad_visual.feature:528-536` (@s16) y `src/lib/diseno/escalaMovimiento.ts:19,62` admiten solo 150, 300 y 0,01 ms. Dentro de un `animation:` en forma corta, `200ms` se señalaría como fuera de escala. Dos agujeros de la puerta: lee solo `ms` (`:58`), así que `1.25s` no se detecta, y `animation-delay` suelto se ignora (`:56`, `escalaMovimiento.test.ts:87-93`). La referencia contradice la letra del contrato aunque la puerta no lo vea todo.
4. **La cabecera es shell de las 6 rutas y solo "/" tiene foto.** `src/App.tsx:55-66` monta `Cabecera` fuera de `<Routes>`. Solo `Landing` renderiza `Hero` (`src/pages/Landing.tsx:51-53`). Las otras 5 rutas (`tests/e2e/rutas.ts:26-33`) tienen fondo claro `--color-fondo` (`src/styles/global.scss:120-126`). Enlaces blancos con cabecera transparente serían ilegibles en 5 de 6 rutas, y las 5 pasan por axe (`tests/e2e/accesibilidad.spec.ts:24-51`, `:529-570`). Hace falta un estado distinto por ruta y por scroll (también tras salir del hero en "/", por `features/rediseno_visual.feature:773`, "la cabecera se mantiene visible al desplazar"). Eso implica lógica nueva en `Cabecera-logica.ts`, que entra en mutación al 100 %.
5. **Puertas ciegas al contraste sobre foto.** `tests/e2e/accesibilidad.spec.ts:119-130` (`fondoSinFoco`) y `:181-197` (`colorPintadoEnPunto`) suben por los ancestros hasta el primer fondo no transparente. Con la cabecera transparente llegan a `body` (`--color-fondo`) y miden contra el fondo de página, no contra la imagen. Dan falso verde, o falso rojo si el anillo pasa a blanco. `src/styles/global.scss:277-286` ya documenta que sobre el velo el anillo global da 1,98:1.
6. **Matriz de contraste.** El texto blanco del nav y la marca sobre el velo no tiene fila de `texto normal`: solo existe `sobre-primario` sobre `tinta` con uso `componente de interfaz o borde de foco` (`src/lib/diseno/matrizDeContraste.ts:388`). Una segunda fila del mismo par choca con la unicidad por `rol sobre fondo`, que ignora `uso` (`src/lib/diseno/matrizDeContraste.test.ts:534-535`). Cambiarla de uso rompe `:526-530`. Añadir filas rompe los recuentos 23/115 (`:518,:535,:581,:603`). Ninguna puerta automática exige declarar el par: `ejecutarPuertaDeReconciliacionDeMatriz` solo corre sobre estilos reales en `matrizDeContraste.test.ts:229`, con matriz vacía y filtrando `urgencia`. Su heurística (`matrizDeContraste.ts:508-509,534-545`) exige `background-color: var(--color-X)` previo, que una cabecera transparente no tiene. Es un punto ciego: el par habría que declararlo a mano.
7. **Nav más grande contra el corte 1024.** Hoy el nav usa `paso-tipografico(-1)` = 12,8 px (`src/components/Cabecera.module.scss:138`, `src/styles/_api.scss`, escala). El corte 1024 está congelado (`features/cabecera_y_navegacion.feature:102-107`, `src/components/Cabecera-logica.ts:11`) y su propio PENDIENTE (`:80-85`) dice que es un valor provisional que se midió con la fila definitiva. Está atado a la escala tipográfica (`features/sistema_de_diseno_visual.feature:331-337`, @s14), a @s25/@s26/@s27 y a `features/fidelidad_responsive_integral.feature:32-38` (@s4). **Estimación mía, NO MEDIDA**: marca ≈250 px + fila ≈550 px a 12,8 px, ≈630 px a 16 px (paso 0) y ≈740 px a 20 px (paso 1), sobre 976 px útiles a 1024 (`global.scss:50`, sangrado 24 px). El paso 0 probablemente cabe; el paso 1 probablemente no. Hay que medirlo en navegador.
8. **`tests/e2e/tipografia.spec.ts:100-129` (@s23 de identidad_visual) usa `page.locator('p').first()`.** Hoy es la píldora (`Hero.tsx:58`, un `<p>`). Sin píldora pasa a ser el párrafo (`Hero.module.scss:92-98`, `max-width: 58ch`), cuyo salto de línea depende de `ch` y de la fuente, con tolerancia de 1 px. EN RIESGO.
9. **`tsc -b` incluye los tests y `noUnusedLocals` está activo** (`tsconfig.app.json:30,40`; `package.json` "build"/"typecheck"). Quitar props de `Hero` sin retirar sus tests (`Hero.test.tsx:144,155,167` pasan `telefono`/`horario`), o dejar imports huérfanos en `Hero.tsx:2-8`, rompe `pnpm run build`, `bin/harness init` y el CI. `oxlint --deny-warnings` también.
10. **El cliente retira lo que el contrato del hero llama "aprobado y se conserva".** `features/hero.feature:2-6` dice que la estructura (píldora, dos botones, franja inferior) está aprobada. Retirarla necesita puerta humana. El "dónde y cuándo" que `hero.feature:38,:76` y `feature_list.json:74` asignan al hero desaparece del primer pantallazo.

## 1. (a) Contenido del hero

### 1.1 Contratos Gherkin

| Ubicación | Qué afirma | Clasificación |
|---|---|---|
| `features/hero.feature:82` @s1 (`Hero.test.tsx:46-56`) | h1 exacto; "Galapagar · Madrid"; sin "Miraflores" | h1 y "Miraflores": INDEPENDIENTE. Cláusula "Galapagar · Madrid" (píldora): SUPERADO |
| `hero.feature:89` @s2 (`Hero.test.tsx:58-74`) | Párrafo con 5 servicios, sin "urgencias" ni "24 h" | INDEPENDIENTE (pasa a EN RIESGO solo si el cliente cambia el texto del párrafo) |
| `hero.feature:100` @s3 (`Hero.test.tsx:76-82`) | "Reservar cita" apunta a `#reservar` | INDEPENDIENTE |
| `hero.feature:105` @s4 (`Hero.test.tsx:84-90`) | Botón "Llamar 91 082 92 67" a `tel:+34910829267` | SUPERADO |
| `hero.feature:110` @s5 (`Hero.test.tsx:92-103`) | Dígitos visibles = dígitos del destino | SUPERADO |
| `hero.feature:116` @s6 (`Hero.test.tsx:105-118`) | Franja de 3 entradas de horario | SUPERADO |
| `hero.feature:124` @s7 (`Hero.test.tsx:120-128`) | Sin cifras de reputación, antigüedad o volumen | INDEPENDIENTE (guarda negativa que sigue cierta) |
| `hero.feature:135` @s8 (`Hero.test.tsx:130-140`) | Sin "24 h", "Urgencias" ni `tel:` de urgencias | INDEPENDIENTE |
| `hero.feature:142` @s9 (`Hero.test.tsx:142-151`) | Sin teléfono en la fuente no hay botón de llamada | SUPERADO (la prop `telefono` desaparece; su segunda cláusula "sigue existiendo Reservar cita" ya vive en @s3) |
| `hero.feature:149` @s10 (`Hero.test.tsx:153-163`) | Sin horario no hay franja | SUPERADO |
| `hero.feature:157` @s11 (`Hero.test.tsx:165-170`) | Teléfono no normalizable revienta el render | SUPERADO. El fail-closed de `enlaceLlamada` sigue cubierto en `src/lib/telefono.test.ts:18-75`, `InformacionContacto.test.tsx:286-289` y `PieDePagina.test.tsx:353-355` |
| `hero.feature:164` @s13 (`Hero.test.tsx:183-196`) | Sin `src/srcset` a http; todo destino empieza por `#` o `tel:` | INDEPENDIENTE; la alternativa `tel:` queda sin sujeto y conviene apretarla a solo `#` |
| `hero.feature:170` @s14 | Sin fondo de imagen de terceros (navegador real) | INDEPENDIENTE. Spec literal que ejecute @s14: NO ENCONTRADO. Lo más cercano es `tests/e2e/fidelidad.spec.ts:239-292` |
| `features/fidelidad_hero.feature:5` @s1 (`tests/e2e/fidelidad-hero.spec.ts:27-58`) | Todo centrado; píldora; 2 botones (`:47-49` exige 2 y `href ^tel:`) | SUPERADO |
| `fidelidad_hero.feature:14` @s2 (`fidelidad-hero.spec.ts:60-79`; `Hero.test.tsx:221-230`) | 4 cifras derivadas visibles; "el hero no recorta contenido" | Cifras: SUPERADO. "No recorta" (`spec:77`, `scrollHeight <= clientHeight`): INDEPENDIENTE, conservar |
| `fidelidad_hero.feature:22` @s3 (`fidelidad-hero.spec.ts:81-103`) | A 320 px píldora, titular, acciones y banda visibles, sin desborde | Píldora y banda: SUPERADO. Titular, acciones y "sin desbordamiento": INDEPENDIENTE (EN RIESGO por la animación, ver §4) |
| `features/rediseno_visual.feature:785` @s30 (`Hero.test.tsx:172-181,221-230,296-319`) | Píldora de localidad, dos botones, banda separada por línea con 4 cifras | SUPERADO |
| `rediseno_visual.feature:1032` @s51 (`src/components/Hero-logica.test.ts:25-102`) | Cifras derivadas de la fuente única | SUPERADO |
| `rediseno_visual.feature:836-845` @s33 (Enmienda 2) | Cada sección abre con cintillo; el hero queda exceptuado y su cintillo usa `--color-sobre-primario` | SUPERADO en lo que toca al hero. Lectura mía: `.ubicacion` (`Hero.module.scss:49-67`, `uppercase` + `letter-spacing: 0.1em`) es el único rótulo corto del hero, y es lo que las notas de `Equipo.test.tsx:335-339` y `Servicios.test.tsx:515-518` llaman "cintillo del Hero". Las otras secciones: INDEPENDIENTE. El contraste del texto del hero (`Hero.test.tsx:257-285`) sigue válido |
| `rediseno_visual.feature:567` @s18 (`Hero.test.tsx:232-246`; `Faq.test.tsx:350-366`) | Hero con ancho propio < 1220 y distinto del FAQ (860) | EN RIESGO si el hero alineado a la izquierda cambia `.contenido` (`Hero.module.scss:36-47`, 900 px). `Faq.test.tsx:359` compara con un 900 escrito a mano, no con el scss |
| `rediseno_visual.feature:582-605` @s20/@s21/@s22 (`tests/e2e/geometria-escalas.spec.ts:239-253,:362-393,:411-430`) | h1 33→68 px (`clamp(33px, 6.4vw, 68px)`), tracking −0,02 em, interlineado 1,05 | INDEPENDIENTE mientras el h1 conserve esos tres valores (`Hero.module.scss:77-91`) |
| `rediseno_visual.feature:776` @s29 (`Hero.test.tsx:248-285`) | Imagen 200, velo con tokens, texto ≥4,5 contra el velo | EN RIESGO si cambia el velo (ahora cubriría la cabecera) o si hay texto nuevo sobre él |
| `features/ensamblaje_landing.feature:153-167,169-175` @s3/@s4 (`src/pages/Landing.test.tsx:65,130-137`) | `#inicio` primero; el id lo pone `Landing`; `inicio.firstElementChild` lleva `data-a-sangre` | INDEPENDIENTE si el hero mantiene `<section data-a-sangre>` dentro de `#inicio` |
| `features/fidelidad_responsive_integral.feature:5` @s1 (`tests/e2e/fidelidad-responsive-integral.spec.ts:48-94`) | Bienvenida visible sin recorte a 320-414 px. Los "dos canales de reserva" son `[data-reserva-acciones]` (`:57,:86`), no los botones del hero | EN RIESGO (animación, §4); esa cláusula de reserva: INDEPENDIENTE |
| `fidelidad_responsive_integral.feature:48` @s6 (`spec:238-285`) | Barrido cada 16 px sin elementos fuera de ventana | EN RIESGO alto con `fadeInLeft` (§4) y por el nav (§3) |
| `features/fidelidad_lienzo.feature:6` @s1 (`tests/e2e/fidelidad-lienzo.spec.ts:39-43,:65`) | `#inicio` ocupa la ventana; `[data-a-sangre]` = 1 | INDEPENDIENTE |
| `retirada_carteleria_urgencias.feature:402-409` @s1 | Rótulos accesibles con "urgencias" = 0 | INDEPENDIENTE (congelado, `:127-133`) |

### 1.2 Tests unitarios y e2e del hero

- `src/components/Hero.test.tsx` (367 líneas): @s4 (`:84-118`), @s9-@s11 (`:142-170`), los tres `@s30` (`:172-181,:221-230,:296-319`), el `@s1` en su cláusula de la píldora (`:53`) y la cláusula `tel:` de @s13 (`:193`) son SUPERADOS. En `:336-345` (`@s38/@s39 de accesibilidad`) el `it` lee los bloques `a:first-child {` y `a:not(:first-child) {` de `.acciones`. Quitar el segundo bloque hace que `extraerBloqueCss` LANCE ("no se encontró…", `:205-209`): rojo por excepción, no por `expect`. Cabe reescribirlo para un único botón. `:347-366` (contraste del anillo contra el velo) es INDEPENDIENTE. `:287-294` (`min-height: clamp(560px, 84svh, 784px)`) es EN RIESGO si el alto del hero crece para incluir la cabecera.
- `src/components/Hero-logica.test.ts` entero: SUPERADO. Es el único consumidor de `extraerFragmento` y `digitosDe` (`datosDelSitio.ts:255,264`).
- `tests/e2e/fidelidad-hero.spec.ts`: casi entero SUPERADO. Usa `data-hero-contenido|ubicacion|subtitulo|acciones|cifras` (`:24,31,33,34,64,86-89`). Reescribir.
- `tests/e2e/tipografia.spec.ts:100-129`: EN RIESGO (§0.8).
- INDEPENDIENTES verificados: `tests/e2e/rediseno-visual.spec.ts:60-74` (`#inicio img` = 1, h1 peso 600), `tests/e2e/imagenes.spec.ts:160-186` (la imagen del hero es `eager` y `fetchpriority="high"`, se localiza con `#inicio img`), `tests/e2e/fidelidad.spec.ts:239-292` (busca una `section` con `h1` y una `<img>` absoluta con z-index negativo; fallaría si la foto saliera de esa `<section>`), `tests/e2e/layout.spec.ts:50`, `Landing.test.tsx`.

## 2. (b) Cabecera sólida y su hueco

Estado actual: `Cabecera.module.scss:19-34` (fixed, `min-height: var(--altura-cabecera)`, `z-index: 10`, fondo `--color-fondo`, borde inferior 1 px `--color-borde`, 88 % translúcido con `backdrop-filter`), `:45` (interior descuenta el borde), `:259` (panel móvil bajo `--altura-cabecera`). `global.scss:49` (token 64 px), `:146-152` (`#root` con `padding-block-start`), `:246` (`--desplazamiento-al-enfocar`), `:313` (`scroll-padding-top` 64+24).

| Ubicación | Qué afirma | Clasificación |
|---|---|---|
| `features/fidelidad_cabecera.feature:364-371` @s4 (`tests/e2e/fidelidad-cabecera.spec.ts:176-236`, `Cabecera.test.tsx:369-381`) | Alto de cabecera = relleno de `#root` sin tolerancia; **el primer contenido arranca justo en el borde inferior** (`spec:221-224`); sin mover token ni hueco (`spec:230-232`); la marca cabe | Cláusula del primer contenido en "/" SUPERADA (el hero quedaría en y=0 bajo la cabecera). Las demás: EN RIESGO. Siguen en verde si `#root` conserva su relleno y el solape lo hace el hero con margen negativo; rojas si se quita el relleno. `Cabecera.test.tsx:374` exige literalmente `border-block-end: $ancho-borde-fino solid var(--color-borde);` y `spec:215` exige `grosorDelBordeFino > 0`: SUPERADOS si el estado transparente quita el borde |
| `fidelidad_cabecera.feature:154-163` @s1 (`spec:58-112`) | Columna de 1220; cabecera en y=0; marca y nav alineadas a los bordes del contenido; 4 px entre nombre y descriptor | INDEPENDIENTE; "borde derecho del nav" EN RIESGO si el nav crece |
| `fidelidad_cabecera.feature:177-185` @s2 (`spec:114-149`) | Ocho enlaces en una fila, 44×44 cada uno, sin desborde a 1024 (`:145-147`) | EN RIESGO alto con nav más grande |
| `fidelidad_cabecera.feature:249-257` @s3 (`spec:151-174`) | Panel móvil con 8 enlaces | INDEPENDIENTE (G2, `:224-233`: el panel móvil queda como está) |
| `fidelidad_cabecera.feature:398-406` @s5 | Sin `tel:` ni "Urgencias" en la cabecera | INDEPENDIENTE |
| `fidelidad_cabecera.feature:416-425` @s6 (`spec:297-347`; `Cabecera.test.tsx:398-449`) | Tienda: píldora ≤36 y ≥24 px; **texto = `--color-tinta` y distinto de `--color-texto`** (`spec:342-343`, `Cabecera.test.tsx:437`); `font-size: paso-tipografico(-1)` (`Cabecera.test.tsx:433`) | Color del texto: SUPERADO sobre la foto. Estructura (`::before` interior, 44×44): INDEPENDIENTE. Tamaño de letra: EN RIESGO (`spec:27,345` admite 16/20/25, pero `Cabecera.test.tsx:433` congela -1) |
| `fidelidad_cabecera.feature:467-475` @s7 (`spec:349-418`; `Cabecera.test.tsx:440-444`) | Borde de Tienda ≥3:1 contra `--color-fondo` (`spec:382-408`) en 5 variantes | SUPERADO sobre la foto (el fondo real es la imagen); válido en estado sólido |
| `features/cabecera_y_navegacion.feature:102-244` (15 escenarios) | Presencia y ramas (8 enlaces, menú, logo); no contrata posición ni color (`:90-92`) | INDEPENDIENTE, salvo @s1 (`:102-107`, 1024): EN RIESGO por el nav |
| `features/rediseno_visual.feature:767-774` @s28 (`Cabecera.test.tsx:278-353,499-570`) | Nav + Tienda "con borde y sin relleno"; visible al desplazar; salto calculado con la altura real | Tienda y "visible al desplazar": EN RIESGO. El salto es INDEPENDIENTE (`Cabecera-logica.ts:73-79` mide `bottom` real, y `fidelidad_cabecera.feature:324-326` lo confirma) |
| `rediseno_visual.feature:636-643` @s26; `sistema_de_diseno_visual.feature:432-457` @s25-@s27; `fidelidad_responsive_integral.feature:32-38` @s4 (`spec:148-183`, `accesibilidad.spec.ts:400-440`) | Corte 1024/1023 sin solapes ni desbordes | EN RIESGO (§0.7) |
| `features/identidad_visual.feature:508-516` @s14 (`src/styles/hoja-global.test.ts:92-131`) | `scroll-padding-top` consume solo `--altura-cabecera`; la hoja de la cabecera tiene `inset-block-start: 0` y consume el token | INDEPENDIENTE (EN RIESGO si se cambia el token o se suma otra variable) |
| `identidad_visual.feature:811-820` @s40, `accesibilidad.feature:318-325` @s17, `sistema_de_diseno_visual.feature:499-505` @s32 (`accesibilidad.spec.ts:271-340`) | Ningún control enfocado queda tapado por la cabecera fija | INDEPENDIENTE |
| `identidad_visual.feature:787-809` @s38/@s39, `accesibilidad.feature:327-335` @s18, `sistema_de_diseno_visual.feature:482-497` @s30/@s31 (`accesibilidad.spec.ts:97-170,217-269`) | Anillo de foco ≥3:1 contra su fondo y su superficie, sobre los 20 primeros controles (`:108,:231`) | EN RIESGO alto: la cabecera entra en esos 20 y la puerta es ciega a la foto (§0.5) |
| `ensamblaje_landing.feature:192-244` @s7/@s9/@s10/@s11 | Cabecera común y por ancho | INDEPENDIENTE |
| `retirada_carteleria_urgencias.feature:68-69` (G1), `:171-190` (índice B, criterio 5), `:143-162` (índice A) | Alto de cabecera = hueco; filas de trazabilidad | EN RIESGO. Su regla de oro (`:31-35`) obliga a actualizar el índice en el mismo paso |

**Los cuatro consumidores del hueco de 64 px** (`fidelidad_cabecera.feature:312-326`: `#root`, `scroll-padding-top`, `--desplazamiento-al-enfocar`, `.panelMovil`) siguen haciendo falta en las 5 subpáginas. Dato de diseño, no mío: conservar el relleno de `#root` y dar al `.seccionHero` de `Landing.module.scss:31-39` un margen negativo tiene la menor superficie rota (queda roja solo la cláusula del primer contenido de @s4). Quitar el relleno global rompe `fidelidad-cabecera.spec.ts:218-232` y obliga a recolocar las subpáginas. `src/styles/global.scss:241-244` (nota "y=0…65, no hay solape") ya está señalada como inexacta por `fidelidad_cabecera.feature:351-358`.

## 3. (c) Tamaño y contraste del nav

- **Estado actual**: `Cabecera.module.scss:129-155`: `font-size: paso-tipografico(-1)` (12,8 px), `min-width/min-height: $altura-control-media` (48 px), `padding-inline: espaciado(8)`, `color: inherit` del `.cabecera` (`:26`, `--color-texto`), `hover` en `--color-acento-suave`/`--color-acento-tinta` (`:147-150`), `aria-current` en `--color-primario` (`:152-154`). La marca usa `--color-tinta` (`:60`) y el descriptor `--color-texto-suave` a 10,24 px (`:93-102`): ilegibles sobre el velo oscuro, que se pinta con la propia `--color-tinta` (`Hero.module.scss:11-22`).
- **Pasos sin tocar tokens**: la escala (`_api.scss`, `$escala-tipografica`) ya trae 16 px (paso 0), 20 y 25, así que "más grande" no abre inventario nuevo.
- **Pares nuevos**: nav, marca y descriptor en `--color-sobre-primario` sobre el velo (§0.6). `Hero.test.tsx:248-285` mide ese texto contra la parada del 76 % (la más clara). Inferencia mía, no medida: la parada 0 % (88 %) es más oscura, así que ese test acota por abajo también la zona de la cabecera.
- **`aria-current` y hover**: la fila `acento-tinta` sobre `acento-suave` (`matrizDeContraste.ts:371`) cubre el hover, que pinta fondo opaco. `--color-primario` sobre el velo no tiene fila (hueco previo: la heurística no ve `color` bajo `.navPrincipal`, que no declara fondo).
- **Objetivo táctil**: `fidelidad_cabecera.feature:177-185` @s2 (44×44) y `accesibilidad.spec.ts:74-93` (24×24) se cumplen con `min-width/min-height: 48`. INDEPENDIENTE.
- **Features pendientes**: la 46 (`feature_list.json`, "ritmo del nav", PUERTA HUMANA) mide huecos a 12,8 px ("Blog" 25,53 px, "FAQ" 24,13 px, huecos 20/26,47/35,88). Esos números quedan obsoletos con otro tamaño: SUPERADA o a rehacer. La 41 (panel móvil) es INDEPENDIENTE.

## 4. Animación de entrada (puertas de movimiento)

| Ubicación | Qué afirma | Clasificación |
|---|---|---|
| `accesibilidad.feature:494-503` @s20; `accesibilidad-movimiento.test.ts:236-270` | Recuento de entradas animadas = 0; visibilidad sin animación | SUPERADO (puerta humana explícita en `:502-503`) |
| `accesibilidad.feature:558-566` @s22 | Sin preferencia el sitio sí se mueve | SUPERADO en su sujeto: pasaría a tener animación en curso. `:541-557` lo anticipa ("este escenario es el sitio donde vuelve") |
| `accesibilidad.feature:468-477` @s19, `:513-520` @s21 | Con `reduce` no hay animación; sin consulta posible se asume `reduce` | EN RIESGO (comentarios y recuentos) |
| `accesibilidad.feature:341-457` | Nota de política "sin ninguna animación por fotogramas clave" | SUPERADA |
| `retirada_carteleria_urgencias.feature:62-65`, `:162` | 0 `animation:`, 0 `@keyframes`, 13 `transition:` | SUPERADA como estado medido |
| `identidad_visual.feature:528-536` @s16 (`escalaMovimiento.ts:19,56-62`) | Solo 150/300 ms y `ease-out` | SUPERADO en la letra (§0.3) |
| `sistema_de_diseno_visual.feature:511-517` @s33 (`movimientoRespetuoso.ts:19-21,38-54`; `movimientoRespetuoso.test.ts:5-17`) | Toda `animation`/`transition` dentro de `@media (prefers-reduced-motion: no-preference|reduce)` | INDEPENDIENTE si se declara dentro de `no-preference` (patrón ya usado en `global.scss:320-330`) |
| `identidad_visual.feature:837-847` @s42 (`tests/e2e/movimiento.spec.ts:44-194`), `sistema_de_diseno_visual.feature:518-526` @s34 | Con `reduce`, 0 animaciones en curso | INDEPENDIENTE si la animación solo se declara bajo `no-preference`. Comentarios obsoletos: `movimiento.spec.ts:58-68,102-114`, `accesibilidad.spec.ts:306-308,517-526`, `fidelidad.spec.ts:58-68,156-160` |
| `global.scss:337-345` | Anulador `reduce` (`animation-duration: 0.01ms`) | INDEPENDIENTE |

**Specs que miden la portada recién cargada sin emular `reduce`: EN RIESGO por carrera temporal (NO VERIFICADO, no corrí nada):**
- `fidelidad-responsive-integral.spec.ts:245-281` (@s6) usa `body *` con `caja.left < -1`. Un h1 con `fadeInLeft` parte fuera de pantalla y la primera medición es a 320 px recién cargada.
- `accesibilidad.spec.ts:24-51` (axe en @s36), `:97-170`, `:217-269`, `fidelidad-hero.spec.ts:21-25` y `tipografia.spec.ts:100-129`. Si axe calcula contraste con la opacidad efectiva del elemento a mitad de fundido es hipótesis mía sin fuente leída.
- Mitigaciones: emular `reduce` en esos specs (cambia el contrato de su Given) o animar solo opacidad y un desplazamiento pequeño.
- La feature 40 (`animaciones_galeria`, pending) tiene como criterio 3 devolver sujeto a @s22 (`feature_list.json`): solapa con esta política y conviene decidirlas juntas.

## 5. (d) Código muerto si se retiran píldora, Llamar, horario y cifras

| Elemento | Dónde | Estado |
|---|---|---|
| `Hero-logica.ts` entero (`construirCifrasBienvenida`, `CifraBienvenida`) | `src/components/Hero-logica.ts:1-18` | Muerto. Es el único fichero de Hero en la superficie de mutación (`stryker.config.json:12-17`, glob `src/**/*-logica.ts`; `feature_list.json` anota "Stryker Hero-logica.ts 10/10"). **No hay lista de ficheros que editar**: `harness.config.json:21-24` tiene `targets: []` y `integridad_puerta_mutacion.feature:2-9` fija los patrones |
| `Hero-logica.test.ts` entero | `src/components/Hero-logica.test.ts` | Muerto |
| Props `telefono`, `horario`, interfaz `FranjaHorario`, `UBICACION` | `Hero.tsx:11-15,17-33,35`; llamada `:44` | Muertas |
| Imports `enlaceLlamada`, `EQUIPO`, `GALERIA`, `SERVICIOS`, `construirCifrasBienvenida` (y `datosNegocio` si el párrafo no lo usa) | `Hero.tsx:2,3,5-8` | Dejarían errores de `noUnusedLocals` |
| JSX: `<p ubicacion>`, 2.º `<a>`, `<dl>`, `<ul cifras>` | `Hero.tsx:58-62,68,71-79,80-88` | Muertos |
| Atributos `data-hero-ubicacion`, `data-hero-cifras` | `Hero.tsx:58,80` | Solo los consume `fidelidad-hero.spec.ts` |
| SCSS: `.ubicacion`, `.puntoUbicacion`, `a:not(:first-child)`, `.contenido dl`, `.cifras` y los dos `@media` | `Hero.module.scss:49-75,130-144,146-170,172-202,204-241` (el `@media` de `:214-216` toca `.ubicacion`; el de `:230` solo `.cifras`) | Muertos |
| `text-align: center`, `align-items: center`, `justify-content: center` | `Hero.module.scss:41,46,103` | Cambian por la alineación a la izquierda; el centrado lo afirman `fidelidad_hero.feature:5` y `spec:40-45` |
| `.puntoUbicacion` es uno de los 3 usos de `var(--color-acento)` como relleno | `Hero.module.scss:74`; otros: `SelectorPaleta.module.scss:79,100`, `ReservaChat.module.scss:189` | `rediseno_visual.feature:537-544` @s15 (`usoDelAcento.test.ts`, "al menos una vez como relleno") sigue en verde: INDEPENDIENTE |
| Fila de matriz `sobre-primario`/`tinta` (foco) citando `.acciones a … &:focus-visible` | `matrizDeContraste.ts:385-388` | Sigue válida con un botón; su comentario de procedencia cambia |
| `digitosDe`, `extraerFragmento` (exports) | `src/lib/diseno/datosDelSitio.ts:255,264` (tests propios en `datosDelSitio.test.ts:386-388`, con un ejemplo `{cifra.valor}` que queda obsoleto) | Sin consumidor real tras borrar `Hero-logica.test.ts` |

**NO es código muerto** (se sigue usando fuera del hero): `enlaceLlamada` (`src/lib/site.ts:8,22`, `InformacionContacto-logica.ts:2`), `datosNegocio.horario` (`Faq.tsx:59`, `InformacionContacto.tsx:71`, `ReservaChat.tsx:182-183`, `Landing.tsx:43`, `datosEstructuradosNegocio.ts:16`), `datosNegocio.telefonoClinica` y `direccion.localidad/region` (`seo-logica.ts`), y los catálogos `SERVICIOS`/`EQUIPO`/`GALERIA` (sus componentes).

## 6. Documentación y notas que se vuelven falsas

- `feature_list.json`: `acceptance` de la feature 4 (localidad y botón secundario), de la 28 ("contenido centrado", píldora de localidad, "cuatro cifras", banda dentro de la sección), de la 27 (nav) y notas con "Stryker Hero-logica.ts".
- `project-spec.md:1065-1068` (resumen de la feature 28: centrado, píldora, dos botones, banda de cifras con `Hero-logica.ts`).
- `features/hero.feature:2-6,38,76` y `features/fidelidad_hero.feature` (toda la cabecera de intención). `src/components/Galeria.test.tsx:364` solo cita `Hero-logica.test.ts` como patrón (comentario).
- `Equipo.test.tsx:335-339` y `Servicios.test.tsx:518`: comentarios que citan `Hero.module.scss:43-58` para la Enmienda 2.
- `docs/contrato-heredado/hero.feature` y `cabecera_y_navegacion.feature`: ningún test los lee (`grep contrato-heredado`, solo un comentario en `Cabecera-logica.ts:8`): INDEPENDIENTES. El prototipo `docs/diseno-claude-design/Veterinaria La Sierra.dc.html` (nav a 14 px con relleno 9×11, hero con píldora, dos botones y cifras) está atado a `rediseno_visual.feature:944` @s41 (versionado idéntico al remoto): no tocarlo, decidir si queda como histórico.

## 7. Propuesta de división en 2 features pequeñas

**Reglas del arnés que condicionan.** `pending` no exige `.feature` (`.harness/harness.mjs:68-69,387-410`); `spec_ready`, `in_progress` y `done` sí. Un `spec_ready` sin su fichero deja `bin/harness init` y el CI en rojo (`retirada_carteleria_urgencias.feature:16-21`). Solo una feature puede estar `in_progress` (`harness.mjs:341-343`), así que van en secuencia. Registrarlas ya como `pending` (ids 48 y 49) es seguro. Al pasar a `spec_ready` hace falta su `features/<name>.feature` y la aprobación humana. Seguir el patrón de la 39: enmendar cada escenario en su propio fichero con nota y dejar en el `.feature` nuevo solo un índice y los escenarios genuinamente nuevos (`retirada_carteleria_urgencias.feature:31-35`).

**Feature A: `hero_reducido_con_animacion`** (todo dentro de `Hero`, más la política de movimiento).
- Supera: `hero.feature` @s4, @s5, @s6, @s9, @s10, @s11, @s1 (cláusula "Galapagar · Madrid") y @s13 (cláusula `tel:`); `fidelidad_hero.feature` @s1, @s2 (cifras), @s3 (píldora y banda); `rediseno_visual.feature` @s30, @s51 y @s33 en lo del hero; revisa @s18, @s29.
- Conserva `hero.feature` @s2, @s3, @s7, @s8, @s14 y las cláusulas "no recorta" y "sin desborde". Cierra la feature 47 como sin sujeto (un solo botón).
- Código: borra `Hero-logica.ts` y su test, retira props, JSX y SCSS (§5) y reescribe `fidelidad-hero.spec.ts` y `Hero.test.tsx`.
- **Bloque de animación (separable)**: supera `accesibilidad.feature` @s20, @s22 y revisa @s19, @s21. Enmienda `identidad_visual.feature` @s16 y la nota F2. Obliga a cambiar `accesibilidad-movimiento.ts` (módulo mutable) y a decidir la escala. Si Pablo no aprueba la política, este bloque se corta sin impedir cerrar el resto: @s20 sigue en 0.
- Orden recomendado: primero, porque es retirada pura, no depende de decisiones abiertas y desatasca la limpieza.

**Feature B: `cabecera_sobre_el_hero`** (shell, matriz y nav).
- Supera: `fidelidad_cabecera.feature` @s4 (cláusula del primer contenido), @s6 (color del texto) y @s7 (contraste del borde contra `--color-fondo`); revisa @s1, @s2, @s6 (tamaño de letra) y G1 / criterio 5 de `retirada_carteleria_urgencias`. En `rediseno_visual.feature`: @s28 y @s26. Revisa `cabecera_y_navegacion.feature` @s1 (1024) y `features/fidelidad_responsive_integral.feature` @s4 y @s6.
- Reescribe las puertas ciegas (`accesibilidad.spec.ts:119-130,181-197`) para medir el color pintado incluyendo la imagen. Toca la matriz (filas y recuentos 23/115, o cambio de uso), `Cabecera.module.scss`, `global.scss`, `Landing.module.scss` y, si hay estado por ruta o scroll, `Cabecera-logica.ts` con su mutación al 100 %. Cierra o rehace la feature 46.
- Va después de A: tiene todas las decisiones humanas abiertas y la mayor superficie.

## 8. NO ENCONTRADO

- Valores de https://vetcruzverde.es/ (animación, nav, cabecera) en cualquier fichero del repo.
- Spec de navegador que ejecute literalmente `hero.feature` @s14.
- Contrato que fije el color o la transparencia de la cabecera: solo comentarios (`identidad_visual.feature:288-293`, que la llama "translúcida" y deja sin fijar el parque de navegadores para `backdrop-filter`).
- Test que obligue a que `ejecutarPuertaDeReconciliacionDeMatriz` pase sobre las hojas reales con la matriz real.
- Medida real del ancho de la fila del nav con tamaños mayores (la de §0.7 es estimación).

## DUDAS DEL AGENTE
- ¿Aprueba Pablo reintroducir una animación de entrada? accesibilidad.feature:502-503 la sujeta a puerta humana y retirada_carteleria_urgencias.feature:62-65 la dejó en cero a propósito. Sin su aprobación el bloque de animación no puede llegar a spec_ready.
- Si se aprueba: ¿se amplía la escala de movimiento de identidad_visual @s16 (hoy 150/300 ms, ease-out) para admitir 1,25 s y 200 ms, o se adaptan los tiempos de la referencia a la escala? Los valores de vetcruzverde.es salen solo del encargo, no están en el repo y no he consultado la web.
- ¿La cabecera transparente se limita a la ruta '/' en su posición inicial? ¿Cómo se ve la cabecera tras salir del hero en '/' y en las 5 subpáginas sin foto (sólida, translúcida, otra paleta)? rediseno_visual @s28 exige que siga visible al desplazar y los enlaces blancos son ilegibles sobre --color-fondo.
- ¿Cómo se garantiza y se mide en navegador el contraste de texto y anillo de foco blancos sobre la foto? Las puertas actuales (accesibilidad.spec.ts:119-130,181-197) miden contra body. Hay que decidir el método y las filas nuevas de la matriz (uso 'texto normal' para sobre-primario sobre tinta choca con la unicidad por rol sobre fondo).
- ¿Qué paso de la escala tipográfica toma el nav (16 px = paso 0, o 20 px = paso 1) y se mantiene el corte 1024? Necesita medición real; mi estimación de anchos no está medida. Tienda debe decidir si hereda el tamaño (Cabecera.test.tsx:433 lo congela en -1).
- ¿Se acepta que el hero pierda el 'dónde y cuándo' (ubicación y horario) que hero.feature:38,:76 y feature_list.json:74 le asignan? Ambos datos siguen en Contacto, ReservaChat, FAQ y pie.
- ¿Se conserva exactamente el párrafo actual del hero (hero.feature @s2) o el cliente lo cambia? Y la alineación a la izquierda: ¿debe coincidir con la columna de 1220 px de la marca (afecta al ancho de 900 px de rediseno_visual @s18 y a Faq.test.tsx:359)?
- Hueco bajo la cabecera: ¿conservar el relleno de #root y solapar con margen negativo en el hero (menor superficie rota) o quitarlo globalmente? Decisión de diseño de quien implemente, con puerta humana sobre fidelidad_cabecera @s4.
- Features pendientes: 47 (igualdad de botones del hero) queda sin sujeto con un solo botón; 46 (ritmo del nav, PUERTA HUMANA) hay que rehacerla con el nuevo tamaño; 40 (animaciones de la galería) comparte con esta petición la política de movimiento y conviene decidirlas juntas.
- ¿Se actualiza o se deja como histórico el prototipo versionado (docs/diseno-claude-design/Veterinaria La Sierra.dc.html), cuyo hero la propia hero.feature:2-6 declara 'aprobado y se conserva'? rediseno_visual @s41 exige que sea idéntico al proyecto remoto.
- No verificado por no ejecutar nada: la carrera temporal entre la animación y los e2e que miden la portada recién cargada (fidelidad-responsive-integral @s6, axe @s36, fidelidad-hero). Tampoco verifiqué si axe-core computa el contraste con la opacidad efectiva a mitad de fundido: es hipótesis mía sin fuente oficial leída.
- Parque de navegadores sin fijar para backdrop-filter (identidad_visual.feature:288-293): relevante si la cabecera transparente conserva el desenfoque sobre la imagen.
