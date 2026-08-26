# Análisis de impacto del rediseño sobre la suite de tests

Fecha: 26/08/2026. Autor: subagente de análisis (solo lectura, ningún fichero de `src/` tocado).

Estado de partida declarado por el encargo: **79 ficheros, 1047 tests, verde**. Verificado el recuento de
ficheros: `find src -name "*.test.ts" -o -name "*.test.tsx" | wc -l` devuelve **79**. El recuento de 1047
tests NO se ha reejecutado en esta sesión (NO CONSTA EN LA FUENTE una corrida propia); se toma como dado.

La suite de navegador real (`tests/e2e/*.spec.ts`, script `test:e2e` en `package.json:22`) es una puerta
SEPARADA de `vitest run` (`package.json:20`) y no está incluida en esos 79 ficheros
(`vite.config.ts:50` limita el `include` de Vitest a `src/**`). Se analiza igualmente y se marca como tal.

Cambios analizados, tal y como los fija el encargo:
(a) paleta 4 → 5 variantes: `clinica` (nueva, por defecto), `calida`, `tech`, `eco` y `marca` (la actual).
(b) inventario de roles 17 → 20: entran `--color-acento`, `--color-urgencia`, `--color-urgencia-suave`.
(c) ancho máximo de contenedor 1024px → 1220px.
(d) radios, sombras, espaciados de sección y escala tipográfica realineados.
(e) los componentes ganan huecos de imagen, píldoras, cintillos y una barra de urgencias.

**Recuento de hallazgos: 53** — 27 roturas ciertas (tabla A), 16 roturas condicionales (tabla B),
8 huecos de cobertura (tabla C), 2 hallazgos colaterales (tabla D).

---

## 0. Los tres puntos de dolor, en una frase cada uno

1. **`src/lib/diseno/rolesDescartados.ts` es una puerta que PROHÍBE por nombre exactamente los tres roles
   que (b) quiere introducir.** Su regex `PATRON_TOKEN_DE_URGENCIA = /--[\w-]*urg[\w-]*/gi`
   (`src/lib/diseno/rolesDescartados.ts:30`) y `PATRON_ACENTO_A_SECAS = /--color-acento(?!-tinta|-suave)\b/`
   (`src/lib/diseno/rolesDescartados.ts:32`) casan literalmente con `--color-urgencia`,
   `--color-urgencia-suave` y `--color-acento`. No es una desalineación de números: es una contradicción
   frontal con un escenario ya `done` (`features/identidad_visual.feature:465-474`).

2. **Las variantes `lima`, `verde` y `noche` desaparecen del catálogo, y 9 tests las leen del texto real de
   `src/styles/_tokens.scss` con un lector que LANZA cuando el bloque no existe**
   (`src/lib/diseno/tokensColor.ts:114`: `throw new Error('no se encontró ningún bloque ...')`). Esos tests
   no fallan con un `expect` rojo: revientan con excepción.

3. **`(c) 1024 → 1220` no rompe NINGÚN test de Vitest.** El literal `1024` del ancho de contenedor
   (`src/styles/_api.scss:133`) no está cubierto por ninguna aserción — ver §2 y hueco C1. Es el cambio
   más silencioso de los cinco y por eso el más peligroso.

---

## 1. Tabla A — roturas CIERTAS

Roturas que se producen sí o sí con los cambios (a) y (b) tal y como están descritos.
"THROW" = el test no falla con un `expect` rojo, lanza una excepción y aborta.

| Fichero de test | Escenario / `it` | Por qué se rompe | Qué hay que cambiar | Riesgo |
|---|---|---|---|---|
| A1. `src/lib/diseno/tokensColor.test.ts` | `@s1` (L36-49), `it` en L37 | L39 declara a mano `['marca','lima','verde','noche']` y L42-43 exigen `toHaveLength` + `toEqual` exacto contra `extraerVariantesDeTokens(TEXTO_TOKENS_REAL)`. Con 5 ids nuevos el `toEqual` falla. | Reescribir el literal a mano a los 5 ids nuevos, en el ORDEN de aparición en `_tokens.scss` (`toEqual` es sensible al orden). | alto |
| A2. `src/lib/diseno/tokensColor.test.ts` | `@s3` (L64-86) y `@s4` (L87-98) | Ambos llaman `leerTokenDeVariante(TEXTO_TOKENS_REAL, 'lima', …)` (L66-67, L89-90). Sin bloque `:root[data-variante='lima']`, `extraerBloqueDeVariante` lanza (`tokensColor.ts:114`). **THROW.** | Borrar los dos escenarios o reescribirlos contra una variante nueva, con su mezcla y su ratio recalculados. Los ratios 8.57 y 1.77 (L47, L59) son literales verificados: no se pueden "adaptar", hay que recalcularlos. | alto |
| A3. `src/lib/diseno/tokensColor.test.ts` | `@s5` (L99-120) | `leerTokenDeVariante(…, 'verde', …)` en L101-102. **THROW.** Además ancla `#F0F4F1`, la mezcla al 8% y el ratio 5.12. | Igual que A2. | alto |
| A4. `src/lib/diseno/tokensColor.test.ts` | `@s6` (L121-134), `@s7` (L135-148), `@s8` (L149-162) | Los tres leen la variante `'noche'` (L123-124, L137-138, L151-153). **THROW.** Anclan además el fondo `#000000`, el foco `#B4C718` y los ratios 21.00 / 11.12 / 2.30. | Si alguna de las 4 variantes nuevas es oscura, reescribir los tres escenarios sobre ella; si no, borrarlos. Con ellos se pierde la única cobertura de "el morado no vale sobre negro". | alto |
| A5. `src/lib/diseno/tokensColor.test.ts` | `@s9` (L163-177) | L130 itera `['marca','lima','verde']` y L136 exige `toEqual([9.13, 8.57, 8.22])`. **THROW** en `lima`. | Reescribir la lista de variantes claras y los 3 ratios exactos. | alto |
| A6. `src/lib/diseno/tokensColor.test.ts` | `@s10` (L178-189) | L149 itera `['marca','lima','verde']`. **THROW.** | Igual que A5. La aserción de L145-147 (lima 1.89 sobre blanco) sí sobrevive: es aritmética pura. | alto |
| A7. `src/lib/diseno/tokensColor.test.ts` | `(paso 2 del plan)`, `it` en L208 | L209 exige `toEqual(['marca','lima','verde','noche'])`. Duplica el literal de A1. | Mismo literal que A1. Ojo: es el mismo dato escrito en dos sitios del mismo fichero; hoy nada impide que diverjan. | alto |
| A8. `src/lib/diseno/tokensColor.test.ts` | `ejecutarComprobacionDeContrasteDeVariantes …`, `it` en L345 | L346 construye el catálogo desde `['marca','lima','verde','noche']` (**THROW**) y L355 exige `informe.variantesComprobadas).toBe(4)`. | 5 ids nuevos y `toBe(5)`. | alto |
| A9. `src/lib/diseno/tokensColor.test.ts` | `identidad_visual @s1`, `it` en L381 | L361-379 es el literal a mano de los 17 nombres; L382 exige `toHaveLength(LOS_17_NOMBRES_A_MANO.length)` contra `INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR`, que pasa a tener 20. | Ampliar el literal a los 20 nombres. Fuente del inventario: `src/lib/diseno/tokensColor.ts:70-73`, construido desde `ROLES_DE_COLOR` (`:43-59`) y `ROLES_DE_SOMBRA` (`:61`). | alto |
| A10. `src/lib/diseno/tokensColor.test.ts` | `identidad_visual @s1`, `it` en L391 | L395-396: `expect(rolesDeColor).toHaveLength(15)` y `rolesDeSombra` 2. Pasan a 18 y 2. | `toHaveLength(18)`. | alto |
| A11. `src/lib/diseno/tokensColor.test.ts` | `identidad_visual @s2`, `it` en L445 | L424-442 el literal de 17 tokens, L443 el de 4 variantes, L448 `expect(informe.paresComprobados).toBe(68)`. Con 20 tokens × 5 variantes son **100** pares. | Literales a 20 y a 5, y `toBe(100)`. Además `comprobarInventarioDeTokens` (`tokensColor.ts:213`) exige que CADA variante declare CADA token en su propio bloque: las 4 variantes nuevas tienen que declarar los 20, sin heredar. | alto |
| A12. `src/lib/diseno/tokensColor.test.ts` | `identidad_visual @s9`, `it` en L549 | L551 y L556-557 leen la variante `'noche'`. **THROW.** | Igual que A4. | alto |
| A13. `src/lib/diseno/rolesDescartados.test.ts` | `identidad_visual @s11`, `it` en L37 | L40 exige `informe.tokensDeUrgencia).toEqual([])` sobre el texto REAL de `_tokens.scss` + los `.module.scss` reales (L38). `--color-urgencia` y `--color-urgencia-suave` casan con `rolesDescartados.ts:30`. | El escenario `@s11` del contrato tiene que reabrirse. La puerta no se "ajusta": o se borra la mitad de urgencia o se INVIERTE (de "no existe" a "existe y se usa"). | alto |
| A14. `src/lib/diseno/rolesDescartados.test.ts` | `identidad_visual @s11`, `it` en L43 | L46 exige `tokenAcentoASecasEncontrado).toBe(false)`. `--color-acento` casa con `rolesDescartados.ts:32` (el lookahead solo exime `-tinta` y `-suave`). | Igual que A13. Decidir además si `--color-acento` convive con `--color-acento-tinta`/`-suave` o los sustituye: los tres comparten prefijo y el lector solo los distingue por los dos puntos (`tokensColor.ts:190`). | alto |
| A15. `src/lib/diseno/rolesDescartados.test.ts` | `identidad_visual @s11`, `it` en L49 | L54 exige `informe.pasa).toBe(true)`, y `pasa` es la conjunción de las cuatro condiciones (`rolesDescartados.ts:68-72`). Basta A13 o A14 para tumbarlo. | Igual que A13. | alto |
| A16. `src/components/SelectorPaleta-logica.test.ts` | `@s9`, `it` en L39 | L40 guarda `'noche'` y L47 exige `toBe('noche')`. Con `'noche'` fuera del catálogo, `resolverVarianteInicial` (`SelectorPaleta-logica.ts:63-68`) devuelve `VARIANTE_POR_DEFECTO`. | Cambiar el id guardado a uno del catálogo nuevo. | alto |
| A17. `src/components/SelectorPaleta-logica.test.ts` | `@s11`, `it` en L72 | **Colisión literal**: L73 usa `'tech'` como ejemplo de "identificador DESCONOCIDO" y L76 exige `not.toBe('tech')`. `tech` pasa a ser una variante REAL, así que `resolverVarianteInicial` la devolverá. El test se vuelve además semánticamente falso. | Elegir otro id inexistente (p. ej. `'inexistente'`) y cambiar el `toBe('marca')` de L75 por la nueva por defecto. | alto |
| A18. `src/components/SelectorPaleta-logica.test.ts` | `@s12`, `it` en L81 | L84 exige `toBe('marca')` para la cadena vacía. `VARIANTE_POR_DEFECTO` (`SelectorPaleta-logica.ts:16`) pasa a `'clinica'`. | `toBe('clinica')`. | alto |
| A19. `src/components/SelectorPaleta-logica.test.ts` | `@s13`, `it` en L89 | L92 `toBe('marca')` y L93 `expect(['marca','lima','verde','noche']).toContain(resuelto)`. Doble rotura. | Nueva por defecto + nuevo literal de 5 ids. | alto |
| A20. `src/components/SelectorPaleta-logica.test.ts` | `@s14`, `it` en L98 | L109 `expect(resolverVarianteInicial(bruto, VARIANTES_PALETA)).toBe('marca')`. | `toBe('clinica')`. | alto |
| A21. `src/components/SelectorPaleta.test.tsx` | `@s2`, `it` en L25 | L36 `expect(botonesDeVariante).toHaveLength(4)` y L39 el literal de los 4 nombres (`'Marca Galapavet'`, `'Lima de superficie'`, `'Verde profundo'`, `'Marca en oscuro'`). | `toHaveLength(5)` y los 5 nombres nuevos de `src/data/variantesPaleta.ts:24-29`. El propio `describe` ("exactamente las cuatro variantes de marca") hay que reescribirlo. | alto |
| A22. `src/components/SelectorPaleta.test.tsx` | `@s4`, `it` en L62 | L70 `toHaveLength(4)`, L72 los 4 nombres, y sobre todo L78: `expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(12)` — 4 variantes × 3 muestras. Con 5 son **15**. | `toHaveLength(5)` y `toHaveLength(15)`. Si además cada variante nueva lleva SUS propias muestras (hoy las 4 comparten `MUESTRAS_DE_MARCA`, `variantesPaleta.ts:18-22`), hay que decidir de dónde salen esos hexadecimales. | alto |
| A23. `src/components/SelectorPaleta.test.tsx` | `@s5`, `it` en L83 | L88 exige `data-variante` = `'marca'` sin preferencia guardada, L91 busca el botón `Marca Galapavet` presionado, L97 `expect(otros).toHaveLength(3)`. | La por defecto pasa a `clinica`: cambiar el atributo esperado, el botón presionado y `toHaveLength(4)`. | alto |
| A24. `src/components/SelectorPaleta.test.tsx` | `@s6` (L104-120), `@s7` (L122-134), `@s15` (L150-167) | Los tres pulsan `'Marca en oscuro'` (L111, L129, L160) y esperan `data-variante` = `'noche'` (L113, L162) o `localStorage` = `'noche'` (L131). Esa variante deja de existir: `getByRole` lanzará. | Sustituir por una variante del catálogo nuevo distinta de la por defecto. | alto |
| A25. `src/components/SelectorPaleta.test.tsx` | `@s8`, `it` en L137 | L138 guarda `'verde'`, L142 espera `data-variante='verde'`, L146 busca `Verde profundo`. | Igual que A24. | alto |
| A26. `src/components/SelectorPaleta.test.tsx` | `@s16`, `it` en L170 | L174 `expect(document.documentElement).toHaveAttribute('data-variante','marca')`. Con catálogo vacío el efecto de `SelectorPaleta.tsx:21-23` escribe `VARIANTE_POR_DEFECTO`. | `'clinica'`. | alto |
| A27. `tests/e2e/tokens-aplicados.spec.ts` (e2e, NO en los 79) | `@s25`, L41-95 | L42-47 declara a mano las 4 variantes con su nombre accesible, L58-59 lee sus tokens reales con `leerTokenDeVariante`, L94 `expect(variantesVerificadas).toBe(4)`. Rompe por las dos vías: nombres inexistentes en el DOM y `leerTokenDeVariante` lanzando. | 5 entradas y `toBe(5)`. Su `describe` (L41) cita "@s12 de sistema_de_diseno_visual.feature", escenario heredado que `escenariosHeredados.ts:10` exige que siga citado (ver F9). | alto |

---

## 2. El ancho: dónde está acoplado (grep de `1024` y de `PUNTO_DE_CORTE`)

### 2.1 Resultado del grep de `1024` en `src/`

| Fichero:línea | Qué es |
|---|---|
| `src/styles/_api.scss:133` | `$ancho-maximo-contenedor: 1024px;` — **la única declaración del ancho de contenedor** |
| `src/styles/_api.scss:19` | comentario: "Escala tipográfica fluida (Utopia, ratio 1.25, base 16px, 320-1024px)" |
| `src/components/Cabecera-logica.ts:10` | `export const PUNTO_DE_CORTE_NAVEGACION_PX = 1024` — fuente de verdad del punto de corte |
| `src/components/Cabecera-logica.test.ts:6` | `expect(PUNTO_DE_CORTE_NAVEGACION_PX).toBe(1024)` (y L7 `not.toBe(1120)`) |
| `src/components/Cabecera.module.scss:67` y `:111` | `@media (min-width: 1024px)` — las dos ramas de escritorio |
| `src/components/Cabecera.module.scss:5` y `:58` | comentarios que repiten el literal |
| `src/lib/diseno/escalaTipografica.test.ts:11` | `const viewportMaxAMano = 1024` |
| `src/lib/diseno/escalaTipografica.test.ts:64` | descripción del `it` (">1024px da el del máximo") |
| `src/lib/diseno/escalaTipografica.ts:4` | comentario "viewport 320-1024px" |
| `src/lib/diseno/puntoDeCorte.test.ts:14` y `:26` | descripción del `it` y `const anchoDePrueba = 1024` |
| `src/lib/diseno/puertaTerceros.test.ts:13` | dos `@media (width>=1024px)` DENTRO del CSS de `dist/` congelado como literal — inerte, ver F4 |

Fuera de `src/`: `features/identidad_visual.feature:100`, `:182`, `:222`, `:877`, y
`tests/e2e/accesibilidad.spec.ts:8`, `:377-393` (documentación y e2e).

### 2.2 Resultado del grep de `PUNTO_DE_CORTE` en `src/`

Origen único: `src/components/Cabecera-logica.ts:10`. Lo consumen:

- `src/components/Cabecera-logica.ts:21` (`esMovil`)
- `src/lib/diseno/escalaTipografica.ts:10` (import) y `:28` (`viewportMaxPx: PUNTO_DE_CORTE_NAVEGACION_PX`)
- tests: `src/accesibilidad-foco.test.tsx:6,30`; `src/accesibilidad-teclado.test.tsx:7,32,57,76`;
  `src/components/Cabecera-logica.test.ts:2,6`; `src/components/Cabecera.test.tsx:6` y 11 usos más
  (L35-L232); `src/lib/diseno/escalaTipografica.test.ts:2,23,26`;
  `src/lib/diseno/puntoDeCorte.test.ts:2,14,19,25`; `src/pages/PaginaCampanas.test.tsx:8,63,74`.

### 2.3 Diagnóstico del acoplamiento

**El ancho de contenedor está acoplado al punto de corte SOLO por un comentario, no por código.**
`src/styles/_api.scss:127-132` afirma literalmente: *"el MISMO número que ya gobierna el techo de la
escala tipográfica y de espaciado fluidas (`PUNTO_DE_CORTE_NAVEGACION_PX`, `escalaTipografica.ts`)"*.
Pero `_api.scss:133` escribe `1024px` como literal duro: **no importa nada, no deriva de nada, y ningún
test compara `$ancho-maximo-contenedor` con `PUNTO_DE_CORTE_NAVEGACION_PX`**. Grep de
`ancho-maximo-contenedor` en `src/`: solo `_api.scss:133` (declaración) y `_api.scss:148` (uso dentro de
`@mixin contenedor`); cero ocurrencias en ficheros `.test.*`.

Dos ramas excluyentes:

- **Rama 1 (la del encargo): solo cambia el contenedor a 1220px; `PUNTO_DE_CORTE_NAVEGACION_PX` se queda
  en 1024.** No se rompe **ningún** test de Vitest ni de Playwright. `tests/e2e/layout.spec.ts:42-59`
  (`@s45`) mide el ancho real del contenedor pero solo exige que sea `< 1600` (L55) y que las 6 rutas
  compartan el mismo valor (L58): 1220 pasa igual que 1024. El precio es que el comentario de
  `_api.scss:127-132` pasa a ser falso y la invariante "un solo número" muere sin que nada lo señale
  → hueco **C1**.
- **Rama 2: se sincroniza moviendo `PUNTO_DE_CORTE_NAVEGACION_PX` a 1220.** Entonces rompen, como mínimo:
  `src/components/Cabecera-logica.test.ts:6`; `src/lib/diseno/puntoDeCorte.test.ts:19` (que exige que el
  único `@media` de `Cabecera.module.scss` valga lo mismo, luego hay que tocar `Cabecera.module.scss:67`
  y `:111`); `src/lib/diseno/escalaTipografica.test.ts:18`; y en e2e
  `tests/e2e/accesibilidad.spec.ts:377-393` (el par 1024/1023). Ver B8.

Los 8 puntos de consumo del ancho ya están correctamente centralizados en el mixin
(`_api.scss:135-151`): `CampanasPortada.module.scss:6`, `PieDePagina.module.scss:18`,
`Landing.module.scss:24` y `:34`, `PaginaBlog.module.scss:2`, `PaginaCampanas.module.scss:2`,
`PaginaNoEncontrada.module.scss:2`, `PaginaTienda.module.scss:2`. **Cambiar el número es tocar una sola
línea.** El problema no es el acoplamiento del ancho: es su ausencia de cobertura.

---

## 3. Tabla B — roturas CONDICIONALES

Dependen de decisiones de implementación que el encargo aún no fija. Cada fila dice de qué depende.

| Fichero de test | Escenario / `it` | Condición que la dispara | Por qué se rompe | Riesgo |
|---|---|---|---|---|
| B1. `src/lib/diseno/tokensColor.test.ts` | `(paso 2 del plan)`, `it` en L202 | Si el `:root` sin atributo (`src/styles/_tokens.scss:50-54`) pasa a espejar la nueva por defecto `clinica` en vez de `marca`. | L203-204 compara `leerTokenDeRaizSinAtributo` contra `leerTokenDeVariante(…, 'marca', rol)` para `fondo`, `texto` y `foco`. Si el `:root` espeja `clinica`, los tres valores dejan de coincidir. | alto |
| B2. `src/lib/diseno/tokensColor.test.ts` | `identidad_visual @s5/@s6`, `it` en L498 | Si los 3 roles nuevos entran en `MATRIZ_DE_USO_MARCA` (`tokensColor.ts:261-273`), que es lo correcto: `--color-urgencia` va a llevar texto encima. | L502-503 exigen exactamente 9 filas de "texto normal" y 2 de "componente de interfaz". Cualquier fila nueva rompe. Rompería también el `it` de L475 si algún par nuevo no llega a su mínimo WCAG. | alto |
| B3. `src/lib/diseno/inventarioModulos.test.ts` | `@s21` L26, `@s22` L89, `@s51` L104, `@s24` L131 | Si (e) crea un componente nuevo, p. ej. `BarraUrgencias.tsx` + `BarraUrgencias.module.scss`. | L28-46 es el literal a mano de 17 nombres; L97 `toBe(17)`; L112 `toBe(17)`; L142 `toBe(17)`. El glob de L16-19 descubre el `.tsx` real y `comprobarInventarioCompleto` (`inventarioModulos.ts:101`) lo señalaría como ausente del inventario. | alto |
| B4. `src/lib/tokens.test.ts` | `@s1`, `it` en L12 | Si las 4 paletas nuevas necesitan colores rectores propios declarados en `src/lib/tokens.ts:8-12`. | L13 `expect(Object.keys(coloresDeMarca)).toHaveLength(3)`. | medio |
| B5. `src/lib/tokens.test.ts` | `@s16`, `it` en L46 | Si el catálogo del proyecto (`tokens.ts:23-29`) gana parejas de las paletas nuevas. | L50-52 exigen exactamente 3 / 1 / 1 parejas por uso. | medio |
| B6. `src/lib/diseno/escalaEspaciado.test.ts` | `@s19` L5 y `@s20` L18 | Si (d) añade pasos de espaciado para las secciones nuevas (p. ej. 80, 120, 160). | L7 es el literal a mano de los 9 pasos y L9 `toHaveLength(pasosAMano.length)`; L26 exige que ningún paso supere 96. Un paso de 120 rompe los dos. | medio |
| B7. `src/lib/diseno/escalaTipografica.test.ts` | `@s13` L6, `@s15` L31, `@s16` L41, `@s17` L52, y el `it` de L79 | Si (d) cambia el ratio 1.25, la base 16px o el conjunto de 8 pasos. | L8-9 anclan ratio y base a mano; L35-36 anclan 16px para el paso 0; L53-58 exigen monotonía estricta; L81-87 ancla el paso -2 y el ancho 672. | medio |
| B8. `src/components/Cabecera-logica.test.ts` L6 + `src/lib/diseno/puntoDeCorte.test.ts` L14 + `src/lib/diseno/escalaTipografica.test.ts` L23 | los tres | **Solo en la rama 2 de §2.3**: si el ancho se sincroniza moviendo `PUNTO_DE_CORTE_NAVEGACION_PX`. | Ver §2.3. `puntoDeCorte.test.ts:18` exige además que `Cabecera.module.scss` declare **un único** punto de corte (`new Set(puntosDeCorte).size).toBe(1)`): si el rediseño añade un segundo `@media` a la cabecera, rompe aunque el número no cambie. | alto |
| B9. `src/styles/hoja-global.test.ts` | `@s13`, `it` en L77 y L83 | Si (d) toca el `body` de `src/styles/global.scss` (interlineado, familia, fondo). | `comprobarFamiliasDelReset` exige que la familia 6 (`src/lib/diseno/hojaGlobal.ts:114-119`) encuentre en la MISMA regla `min-height: 100svh`, `line-height: 1.5`, `background-color: var(--color-fondo)`, `color: var(--color-texto)` y `font-family: var(--fuente-texto)`. Cambiar `1.5` a cualquier otro valor rompe L80 y L84 sin tocar el test. | alto |
| B10. `src/components/Servicios.test.tsx` L399, `src/components/Equipo.test.tsx` L181, `src/components/PieDePagina.test.tsx` L18, `src/pages/PaginaBlog.test.tsx` L160 | `@s19`, `@s11`, `@s1`, `@s6` respectivamente | Si (e) mete huecos de imagen en esos módulos concretos. | Los cuatro exigen CERO imágenes: `Servicios.test.tsx:402` `querySelectorAll('img')).toHaveLength(0)`; `Equipo.test.tsx:184` `queryAllByRole('img')).toHaveLength(0)`; `PieDePagina.test.tsx:28` ídem dentro del pie; `PaginaBlog.test.tsx:164` ídem en `main`. **No son aserciones cosméticas**: `Equipo @s11` dice "sin retratos verificados ninguna tarjeta muestra una fotografía del profesional" — es una decisión de contenido del contrato, no de diseño. Meter imágenes ahí exige reabrir esas features. | alto |
| B11. `src/lib/diseno/inventarioActivosPublicos.test.ts` | `(paso 8 del plan)`, `it` en L131 | Si los huecos de imagen nuevos declaran rutas `/img/…` sin fichero real en `public/img/`. | L134-135 exigen `rutasFaltantes).toEqual([])` y `pasa).toBe(true)` comparando lo declarado en `src/data/*.ts` + `MetadatosPagina.tsx` + `PieDePagina.tsx` (L118) contra el árbol real de `public/` (L120). | medio |
| B12. `src/lib/diseno/escalaMovimiento.test.ts` | `@s16`, `it` en L44 y L53 | Si los cintillos / la barra de urgencias traen una duración fuera de `{150, 300, 0.01}` ms o animan `all`. | L50 `duracionesFueraDeEscala).toEqual([])`, L56 `usosDePalabraClaveAll).toEqual([])`. El glob (L12-31) recoge automáticamente cualquier `.module.scss` nuevo, así que la puerta SÍ vigila lo que se añada. | bajo |
| B13. `src/lib/diseno/inventarioModulos.test.ts` | `@s24`, `it` en L131 | Si cualquier `.module.scss` nuevo o retocado escribe un color literal. | `ejecutarPuertaDeLiteralesColor` señala hex, `rgb()/hsl()` y los 16 nombres CSS de `src/lib/puertaLiteralesColor.ts:38-55`, **línea a línea y también dentro de comentarios** (`puertaLiteralesColor.ts:71-77` no filtra comentarios). Un comentario que cite `#77286B` o la palabra `green` para explicar una paleta nueva tumba la puerta. | medio |
| B14. `tests/e2e/css-presupuesto.spec.ts` (e2e) | `@s49`, `it` en L22 | Si 5 variantes × 20 tokens + los componentes nuevos empujan el CSS servido por encima de 8000 B. | L19 `const TECHO_BYTES_CSS = 8000`, escrito a mano; L35 `expect(bytesTotales).toBeLessThanOrEqual(TECHO_BYTES_CSS)`. La cabecera del fichero (L7-18) declara la medida actual: **5791 B**, con un margen del ~38%. Pasar de 68 a 100 declaraciones de token y añadir componentes come ese margen. | medio |
| B15. `tests/e2e/layout.spec.ts` (e2e) | `@s47`, L104-148 | Si (d) mete una altura fija en el patrón de tarjeta. | L145-147 lee el texto real de `_api.scss`, extrae el cuerpo de `@mixin tarjeta` y exige que no case `/(?<!min-\|max-)\bheight:\s*\d/`. Ojo: la regex `@mixin tarjeta \{([^}]*)\}` (L146) se corta en la primera `}`, así que **hoy solo inspecciona hasta `_api.scss:180`** (donde abre el `@media`): el `&:hover` de `:184-186` ya queda fuera. Es un falso verde latente. | medio |
| B16. `src/styles/tokens-api.test.ts` | `(paso 3 del plan)`, `it` en L49 | Si el rediseño mete una función Sass en `_tokens.scss` (p. ej. un helper de mezcla para generar 5 paletas). | L50 `expect(textoDeTokens()).not.toMatch(PATRON_FUNCION_O_MIXIN_SASS)` (L43). El motivo declarado (L1-13) sigue vigente: `_tokens.scss` emite CSS y se inyectaría 17 veces. | bajo |

---

## 4. Ficheros que NO se rompen aunque lo parezca

| Fichero | Por qué parece que se rompe | Por qué NO se rompe |
|---|---|---|
| F1. `src/lib/contraste.ts` y `src/lib/contraste.test.ts` | Es el corazón del sistema de color y el rediseño cambia toda la paleta. | El módulo es aritmética pura (`contraste.ts:63-72`) y el test **nunca lee `_tokens.scss`**: todos sus colores son literales escritos en el propio test (`contraste.test.ts:20,35,57,68,77,188,237,251,302`). Lo único que importa de `tokens.ts` es `catalogoDeContraste` (L16), usado solo con `.filter(...)` y `toBeGreaterThan(0)` (L176-183, L201-207): sobrevive a que el catálogo crezca. |
| F2. `src/lib/diseno/mezclaDeColor.ts` y su `.test.ts` | `@s4` (L9-20) ancla 8 hexadecimales derivados. | Las 8 mezclas son todas derivaciones de la variante **`marca`** (blanco/negro con `#77286B` y `#B4C718`), y el encargo dice que `marca` se conserva. Mientras `src/styles/_tokens.scss:59-79` no cambie, `#F4EEF3`, `#FAF6F9`, `#531C4B`, `#925389`, `#6B2460`, `#F6F8E3`, `#A06997` y `#DDC9DA` siguen siendo los mismos. El resto del fichero (L22-56) es validación y extremos: puro. |
| F3. `src/lib/puertaLiteralesColor.ts` y `src/lib/puertaLiteralesColor.test.ts` | Es la puerta que vigila los colores de los `.module.scss`, y todos van a cambiar. | El `.test.ts` es **100% sintético**: los 7 `it` construyen sus ficheros a mano (L6-10, L22, L34-37, L48, L57, L68, L79-80). No hace ni un `import.meta.glob`. La ejecución sobre los ficheros REALES no vive aquí, vive en `inventarioModulos.test.ts:131-145` (ver B13). |
| F4. `src/lib/diseno/puertaTerceros.ts` y `src/lib/diseno/puertaTerceros.test.ts` | `puertaTerceros.test.ts:13` contiene **todo el CSS minificado de `dist/` pegado como literal**, incluidas las 4 variantes con sus hexadecimales viejos y dos `@media (width>=1024px)`. Parece un snapshot que caducará. | No es un snapshot: es solo el **argumento de entrada** de `ejecutarPuertaDeTerceros`, que únicamente hace `.includes(dominio)` de los 3 dominios de `puertaTerceros.ts:40` (`puertaTerceros.ts:53`). Nada compara ese literal con el `dist/` real. Sigue verde para siempre. El precio es que envejece en silencio → hueco C8. |
| F5. `src/lib/diseno/puntoDeCorte.ts` | El nombre sugiere que gobierna el ancho. | Es un extractor genérico de `@media (min\|max-width: Npx)` (`puntoDeCorte.ts:6-10`), sin ningún número propio. El literal 1024 vive en `Cabecera-logica.ts:10`, no aquí. El cambio (c) no lo toca en la rama 1 de §2.3. Sus 2 últimos `it` (L34, L40) son sintéticos con 500px. |
| F6. `src/styles/tokens-api.test.ts` | Se llama "tokens-api" y el rediseño reescribe los tokens. | Solo comprueba **estructura**, nunca valores: que `_tokens.scss` no declare `@function`/`@mixin` (L50), que `_api.scss` declare 4 nombres (L55-57) y que `vite.config.ts:37` tenga el `additionalData` literal (L62, L66). Pasar de 4 a 5 variantes y de 17 a 20 roles le es invisible. Ver B16 para la única condición que lo tumbaría. |
| F7. `src/lib/diseno/hojaGlobal.ts` y `src/lib/diseno/hojaGlobal.test.ts` | Es el módulo que valida la capa base, que (d) va a tocar. | El módulo es un troceador de SCSS puro (`hojaGlobal.ts:184-215`) más un comparador (`:238-247`); no conoce ningún valor de diseño salvo los declarados en `FAMILIAS_DEL_RESET` (`:85-139`). Su `.test.ts` usa exclusivamente SCSS sintético. El que sí puede romper es `src/styles/hoja-global.test.ts` (ver B9). |
| F8. `src/lib/diseno/movimientoRespetuoso.test.ts` y `src/styles/movimiento-global.test.ts` | Todos los `.module.scss` cambian y aparecen componentes nuevos. | El primero usa `ficherosComprobados).toBeGreaterThan(0)` (`movimientoRespetuoso.test.ts:14`), sin recuento fijo, y su glob recoge lo nuevo solo. El segundo fija `toHaveLength(3)` (`movimiento-global.test.ts:27`), pero son las 3 hojas globales (`global.scss`, `_api.scss`, `_tokens.scss`), que no cambian de número. |
| F9. `src/lib/diseno/escenariosHeredados.ts` y su `.test.ts` | Cuenta 12 escenarios heredados citados en `tests/e2e/`. | Solo exige que las cadenas `@s12`, `@s27`… aparezcan en ALGÚN texto de `tests/e2e/*.spec.ts` (`escenariosHeredados.ts:46-59`). Mientras no se borre un `describe` que las cita, sobrevive. **Aviso**: si al reescribir `tokens-aplicados.spec.ts` (A27) se pierde la cita de `@s12` de su L41, sí rompe `escenariosHeredados.test.ts:42-48`. |
| F10. `tests/e2e/layout.spec.ts` `@s45` (L42-59) | Es literalmente el test del ancho máximo de contenedor. | Nunca escribe 1024 ni ningún ancho esperado: exige `< 1600` (L55) y que los 6 anchos medidos sean idénticos (L58). 1220 pasa igual. |
| F11. `src/documento*.test.ts` (5 ficheros) | `index.html:33-45` lleva el catálogo de variantes duplicado a mano (`IDS_DEL_CATALOGO` en L34, `VARIANTE_POR_DEFECTO` en L35). | Ningún test compara ese literal con `VARIANTES_PALETA`. `SelectorPaleta-logica.test.ts:54-69` (`@s10`) solo comprueba la POSICIÓN del script y que no lleve `defer`/`async`/`src`. `documento-base-url.test.ts:64` cuenta 5 referencias a `public/`, ajenas a la paleta. Se rompe la coherencia sin que se rompa ningún test → hueco C2. |
| F12. Los valores de sombra, radio y ancho de borde | (d) los realinea explícitamente. | `--sombra-reposo`/`--sombra-elevada` solo se comprueban por PRESENCIA (`comprobarInventarioDeTokens`, A11), nunca por valor: los únicos `it` que leen un valor de sombra usan texto sintético (`tokensColor.test.ts:244`, `:309`). Los `$radio-*` (`_api.scss:106-110`), `$ancho-borde-*` (`:117-118`) y `$altura-control-*` (`:123-125`) no aparecen en ningún `.test.*` → hueco C5. |

---

## 5. Tabla C — huecos de cobertura: cambios que NINGÚN test detecta

Son el riesgo real del rediseño: se pueden hacer mal y la suite seguirá en verde.

| # | Hueco | Evidencia | Riesgo |
|---|---|---|---|
| C1 | `$ancho-maximo-contenedor` (`src/styles/_api.scss:133`) no está cubierto por ninguna aserción, ni de valor ni de coherencia con `PUNTO_DE_CORTE_NAVEGACION_PX`. El comentario de `_api.scss:127-132` afirma que son "el MISMO número" y nada lo garantiza. | grep de `ancho-maximo-contenedor` en `src/`: solo `_api.scss:133` y `_api.scss:148`. Cero en ficheros `.test.*`. | alto |
| C2 | El catálogo de variantes está **duplicado a mano en 3 sitios** y nada los ata: `src/data/variantesPaleta.ts:24-29`, `index.html:34` y los bloques de `src/styles/_tokens.scss:59,85,115,151`. La variante por defecto está en 2: `SelectorPaleta-logica.ts:16` e `index.html:35`. | Ver F11. Un rediseño que actualice dos de los tres deja un destello (FOUC) o una variante inaplicable, en verde. | alto |
| C3 | La escala tipográfica está duplicada: el mapa Sass `$escala-tipografica` (`src/styles/_api.scss:28-37`) y la función TS `calcularTamanoDePaso` (`src/lib/diseno/escalaTipografica.ts:59-63`). Ningún test compara los 8 valores del mapa con los 8 que produce la función. | `escalaTipografica.test.ts` nunca lee `_api.scss`; `tokens-api.test.ts` solo mira nombres de `@function`. | alto |
| C4 | Lo mismo con el espaciado: `$escala-espaciado` (`_api.scss:46-56`) y `ESCALA_DE_ESPACIADO_PX` (`src/lib/diseno/escalaEspaciado.ts:6`). Los 9 valores coinciden hoy por disciplina, no por test. | `escalaEspaciado.test.ts` solo mira el array de TS. Y ver D1: precisamente ahí hay ya un desajuste real. | alto |
| C5 | Radios (`_api.scss:106-110`), anchos de borde (`:117-118`), alturas de control (`:123-125`) y valores de sombra: ningún test comprueba su valor. (d) los realinea sin red. | Ver F12. | medio |
| C6 | `src/imagenes-hrefDeDestino.test.ts:46-53` es un **inventario escrito a mano de 6 ficheros** que pintan imágenes, con `toHaveLength(6)` en L78. Un componente nuevo con hueco de imagen no entra en él: no rompe nada y queda fuera de la puerta `hrefDeDestino`, es decir, dará 404 bajo el subpath de GitHub Pages. | Contraste con `inventarioModulos.test.ts:14-23`, que sí descubre el árbol real con `import.meta.glob`. | alto |
| C7 | `PATRON_SELECTOR_VARIANTE = /:root\[data-variante=['"]([a-z]+)['"]\]/g` (`src/lib/diseno/tokensColor.ts:75`) solo acepta **letras minúsculas ASCII**. Un id con tilde (`'cálida'`), con guion (`'eco-suave'`) o con dígito quedaría fuera del inventario **en silencio**, y `comprobarInventarioDeTokens` no comprobaría sus 20 tokens. Los 4 ids del encargo (`clinica`, `calida`, `tech`, `eco`) pasan, pero la trampa queda armada. | `tokensColor.ts:75`, `:81-90`. | medio |
| C8 | `src/lib/diseno/puertaTerceros.test.ts:13` congela el CSS de `dist/` como literal que ya no corresponderá al `dist/` generado. Envejece sin avisar. | Ver F4. | bajo |

---

## 6. Tabla D — hallazgos colaterales encontrados leyendo

| # | Hallazgo | Evidencia | Riesgo |
|---|---|---|---|
| D1 | **Bug real en producción, hoy, sin ningún test que lo vea.** `src/styles/_api.scss:254` escribe `padding-inline: espaciado(20);` dentro de `@mixin boton-fantasma`, pero **la clave `20` no existe** en `$escala-espaciado` (`_api.scss:46-56`, claves 4/8/12/16/24/32/48/64/96). `map.get` devuelve `null` y **Sass omite la declaración entera**. Verificado empíricamente en esta sesión compilando con `sass-embedded` 1.102.0 un caso mínimo equivalente: `.x { padding-inline: espaciado(20); color: red; }` emite `.x { color: red; }`. Resultado: los **10 usos** de `boton-fantasma` (`Cabecera.module.scss:109`, `CampanasPortada.module.scss:63`, `FormularioContacto.module.scss:75`, `Galeria.module.scss:28`, `Hero.module.scss:61`, `ReservaChat.module.scss:23`, `PaginaCampanas.module.scss:89` y `:128`, `PaginaTienda.module.scss:155` y `:163`) se pintan **sin relleno horizontal**. Compárese con `boton-primario`, que sí usa una clave existente (`_api.scss:224`, `espaciado(24)`). | `_api.scss:254` vs `_api.scss:46-56`; compilación de verificación. | alto |
| D2 | **Contradicción de contrato, no de código.** El cambio (b) exige introducir los tres roles que `features/identidad_visual.feature:465-474` (`@s11`, feature `done` según `feature_list.json:354`) prohíbe expresamente, con motivo razonado: *"un color de urgencias reintroduciría por la puerta de atrás el servicio de urgencias 24 h que la Decisión 2 suprimió y que Galapavet no presta"* (`identidad_visual.feature:474`). El mismo motivo está en la cabecera del módulo (`src/lib/diseno/rolesDescartados.ts:1-11`). El encargo (e) además pide literalmente "una barra de urgencias". **Esto no se resuelve tocando tests**: exige que el humano decida si Galapavet presta urgencias, y reabrir la Decisión 2 y el escenario `@s11` antes de que ningún `tdd_craftsman` toque nada. | `features/identidad_visual.feature:465-474`; `src/lib/diseno/rolesDescartados.ts:1-11`, `:30`, `:32`. | alto |

---

## 7. Orden de ataque sugerido

1. **Antes de tocar código**: resolver D2 con el humano (urgencias sí/no) y decidir la rama de §2.3
   (¿1220 se desacopla de 1024, o se sincronizan?). Las dos decisiones cambian el alcance de todo lo demás.
2. Reescribir `src/styles/_tokens.scss` con las 5 variantes × 20 roles, y con ello A1-A12 y A27.
3. Decidir el destino de `src/lib/diseno/rolesDescartados.ts` (A13-A15): borrar, invertir o partir en dos.
4. Tocar `src/data/variantesPaleta.ts` + `SelectorPaleta-logica.ts:16` + `index.html:34-35` **a la vez**
   (C2), y con ello A16-A26.
5. Cerrar los huecos C1, C3 y C4 con tests nuevos **antes** de mover los números de (c) y (d): son
   exactamente los valores que el rediseño va a tocar y hoy nadie los vigila.
6. D1 es independiente del rediseño y se puede arreglar ya, con su test.
