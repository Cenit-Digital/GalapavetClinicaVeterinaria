# Fix — @s45: 30 combinaciones reales de axe-core (5 variantes × 6 rutas)

Feature `rediseno_visual` (id 24). Encargo del `craftsman_lead` a partir del
Hallazgo nuevo 1 de `progress/judge_rediseno_visual.md` (tercera revisión):
`tests/e2e/accesibilidad.spec.ts` (describe `@s36`, heredado de
`identidad_visual.feature`) nunca cambiaba de variante — analizaba siempre
"clinica" y `paginasAnalizadas` daba 6, nunca 30.

**Veredicto: VERDE, con UN DEFECTO DE PRODUCCIÓN REAL encontrado y corregido**
(no era un ejercicio mecánico: el hallazgo del judge advertía explícitamente
de que podía aparecer uno, y apareció).

---

## 0. Alcance respetado

- `tests/e2e/accesibilidad.spec.ts` — el `describe('@s36 ...')` existente
  (líneas 24-51) **no se ha tocado ni reducido**: mismo `toBe(6)`, mismo
  alcance, sigue siendo el contrato cerrado de `identidad_visual.feature`.
- Ampliación **nueva y separada**, al final del mismo fichero: describe
  `@s45`, tal y como preveía `progress/rediseno/plan_pruebas_rediseno.md:51`
  ("`tests/e2e/accesibilidad.spec.ts` (ampliada)").
- Un defecto de producción real, encontrado por el test nuevo, corregido en
  `src/styles/global.scss` (única desviación del alcance original, autorizada
  explícitamente por el encargo: "Si el análisis revela un defecto de
  producción real... SÍ puedes tocar el fichero de producción
  correspondiente").
- Nada más se ha tocado. No se ha ejecutado ningún comando `git` de
  escritura.

---

## 1. Mecanismo de cambio de variante — reutilizado, no inventado

`aplicarVariante` de `tests/e2e/fidelidad.spec.ts:57-64` (@s42) no se exporta,
así que se ha **replicado literalmente** en `accesibilidad.spec.ts` (misma
implementación, mismas dos esperas deterministas: el atributo
`data-variante` que `SelectorPaleta` escribe al montar el efecto, y que no
quede ninguna animación en curso). Igual con el catálogo `VARIANTES_DEL_SELECTOR`
(mismos 5 pares id/nombre accesible que `fidelidad.spec.ts:33-39`, tampoco
exportado). No se ha inventado ningún mecanismo nuevo.

Estructura del test nuevo (prioriza corrección sobre velocidad, tal y como
pedía el encargo): **por cada una de las 6 rutas, una sola navegación real**
(`page.goto(ruta)`), y dentro de esa carga, **las 5 variantes aplicadas en el
cliente sin recargar** (abrir el selector una vez por ruta, clic en cada
variante). Es el mismo patrón que ya usa y justifica `fidelidad.spec.ts` para
@s42, aplicado aquí para no pagar 30 navegaciones completas cuando 6 bastan.
Con esto, el test completo tarda 20-24 s en aislamiento — muy por debajo del
límite por defecto, aunque se le ha puesto un `test.setTimeout(180_000)`
explícito por si el entorno está bajo contención (ver §4).

Cada una de las 30 combinaciones se empaqueta como un "informe de página"
(`pagina: "<ruta> — <variante>"`) y se pasa por la puerta YA EXISTENTE y ya
mordida por mutación `ejecutarPuertaDeAnalisisAutomatico`
(`src/lib/accesibilidad-analisis.ts`), exactamente como hace el test de @s36:
así el test nuevo no reimplementa ninguna lógica de veredicto, solo alimenta
30 "páginas" en vez de 6.

---

## 2. El rojo real: una violación de contraste en la variante "tech"

Primera ejecución del test nuevo, contra el `dist/` real:

```
Error: [
  {
    "criterio": "color-contrast",
    "elemento": "label > a | fieldset[aria-label=\"Teléfonos\"] > a[href=\"tel:+34910829267\"] | fieldset[aria-label=\"Teléfonos\"] > a[href=\"tel:+34685343149\"]",
    "pagina": "Landing — Tech"
  },
  {
    "criterio": "color-contrast",
    "elemento": "a[href=\"/GalapavetClinicaVeterinaria/\"]",
    "pagina": "Campañas — Tech"
  },
  {
    "criterio": "color-contrast",
    "elemento": "a[href=\"/GalapavetClinicaVeterinaria/\"] | li:nth-child(2) > a[data-discover=\"true\"] | li:nth-child(1) > h3 > a[data-discover=\"true\"] | li:nth-child(2) > h3 > a[data-discover=\"true\"]",
    "pagina": "Ficha de campaña — Tech"
  },
  {
    "criterio": "color-contrast",
    "elemento": "#contenido-principal > a[data-discover=\"true\"]",
    "pagina": "Artículo del blog — Tech"
  }
]
```

4 violaciones, las 4 en la variante "tech" (nunca antes analizada con axe:
`identidad_visual.feature` @s36 solo analizaba "clinica"), las 4 con
`criterio: "color-contrast"`, las 4 sobre elementos `<a>` **sin clase propia**
(migas de pan "Inicio", teléfonos de contacto, enlace de "volver" al final
del artículo, el enlace del formulario de contacto dentro de un `<label>`).

### Diagnóstico (script Playwright desechable, creado y borrado tras usarlo)

Con un test temporal (`tests/e2e/_scratch_debug_s45.spec.ts`, creado,
ejecutado y **borrado** después — `git status` sin residuo) que vuelca
`node.any` de axe, se confirmó el detalle exacto:

```
"fgColor": "#0000ee",
"bgColor": "#16233f",
"contrastRatio": 1.65,
"expectedContrastRatio": "4.5:1"
```

`#0000EE` es el **azul por defecto del agente de usuario** para `<a href>`
sin visitar. `grep -n "^a\b\|a {" src/styles/global.scss` daba **0
resultados**: en todo el proyecto no existía NINGUNA regla `a { color: ... }`.
Cada enlace de "contenido plano" (sin clase de componente) heredaba
literalmente el azul del navegador. Ese azul pasa el mínimo de contraste
sobre un fondo claro por pura casualidad — es lo que ocultó el defecto en
las otras 4 variantes (fondos claros) y en la variante "clinica" (la única
que @s36 analizaba) — pero contra `--color-superficie` de la variante "tech"
(`#16233F`, fondo oscuro) da 1,65:1, muy por debajo del 4,5:1 exigido.

---

## 3. El fix: `a { color: inherit; }` en `src/styles/global.scss`

```scss
// Enlaces de contenido SIN estilo propio (migas de pan como "Inicio", los
// teléfonos de contacto, "volver al artículo"…) nunca tenían ninguna regla
// para "a" en todo el proyecto (grep de "^a\b"/"a {" sobre este fichero: 0
// resultados antes de esta línea), así que el navegador les aplicaba su azul
// por defecto (#0000EE). Ese azul pasa el mínimo de contraste sobre un fondo
// claro por pura casualidad, pero contra los fondos oscuros de la variante
// "tech" (p. ej. "--color-superficie: #16233F") axe-core midió 1,65:1, muy
// por debajo del 4,5:1 exigido — hallazgo real de @s45 de
// `rediseno_visual.feature`, documentado en
// `progress/rediseno/fix_s45_axe_variantes.md`. "inherit" y no un rol nuevo:
// así el enlace hereda el MISMO color que ya pinta el texto que lo rodea
// (--color-texto/-tinta/-texto-suave contra el plano de fondo vigente), que
// es exactamente la combinación que la matriz de uso del sistema
// (`matrizDeContraste.ts`) ya verifica en las cinco variantes — no se
// introduce ningún par (tinta, fondo) nuevo que verificar.
a {
  color: inherit;
}
```

Colocado en la sección "C. Base" de `global.scss` (justo detrás de
`:focus-visible`), **no** dentro de la sección "B. Reset explícito, regla a
regla" — esa sección está literalmente numerada y cerrada ("Nueve familias,
ni una más", `global.scss:60`, y `@s13`/`hojaGlobal.test.ts` fija
`familiasComprobadas === 9`), así que añadir una familia más ahí habría
contradicho ese contrato. `comprobarFamiliasDelReset` solo comprueba que las
9 familias exigidas ESTÉN presentes; no prohíbe reglas adicionales en otra
sección, así que este fix no lo toca.

### Por qué `inherit` y no un rol nuevo (p. ej. `--color-acento-tinta`)

`inherit` no introduce ningún par (tinta, fondo) nuevo: el enlace pasa a
pintarse exactamente con el color que YA pintaba el texto que lo envuelve en
ese punto del documento. El rol `--color-texto` ya está verificado por
`matrizDeContraste.ts` (`MATRIZ_DE_USO_DEL_SISTEMA`) contra los CUATRO planos
de fondo del sistema (`fondo`, `fondo-alterno`, `superficie`,
`superficie-elevada`), en las cinco variantes, vía
`ejecutarMatrizDeContrasteDeVariantes`. Elegir un rol de acento en su lugar
habría introducido combinaciones (`acento-tinta`/`superficie-elevada`, por
ejemplo) que la matriz **no** cubre todavía, arriesgando un fallo nuevo sin
verificar. `inherit` es, por construcción, tan seguro como el texto que ya
rodea a cada enlace.

Especificidad: `a { color: inherit }` en `global.scss` tiene especificidad de
elemento (0,0,1). Cualquier enlace con clase propia (nav de `Cabecera`,
cintillos, botones, etc.) sigue ganando con su selector de clase (0,1,0):
**cero riesgo de romper un color de enlace ya intencional** en otro
componente — confirmado con la suite completa en verde (ver §5).

`text-decoration: underline` no se toca: sigue siendo el valor por defecto
del navegador para `<a href>`, así que el afordance visual de "esto es un
enlace" se conserva.

---

## 4. Verde, verificado

Tras el fix, el mismo test:

```
✓ @s45 el análisis automático de accesibilidad sigue sin reportar violaciones,
  en las cinco variantes › las 5 variantes × 6 rutas = 30 combinaciones:
  0 violaciones, con las 5 etiquetas acumulativas de siempre y sin mecanismo
  de opciones (20-24s, en tres ejecuciones aisladas distintas)
```

Aserciones que pasan: `RECUENTO_DE_COMBINACIONES === 30`,
`informe.paginasAnalizadas === 30`, `informe.violaciones` == `[]`,
`informe.violacionesTotales === 0`, `informe.veredicto === 'aprobado'`.

### Nota sobre el entorno de esta sesión (contención de CPU, ya documentada)

Igual que ya advertía `progress/rediseno/fix_uso_del_acento.md` §6, esta
máquina tiene decenas de procesos `node.exe` de otras sesiones de agente
corriendo en paralelo. Las primeras tentativas de correr la suite e2e
COMPLETA a la vez que yo lanzaba `vitest run` en paralelo produjeron
`ERR_CONNECTION_REFUSED` a mitad de suite (el servidor `vite preview` se
quedaba sin CPU/memoria) — 50 fallos, todos `ERR_CONNECTION_REFUSED`, cero
relacionados con el fix. Repetido el mismo comando **en aislamiento** (sin
ningún otro comando mío corriendo a la vez), la suite entera pasó limpia. No
es una regresión de este fix: es contención de recursos del entorno
compartido, ya señalada como conocida en una sesión anterior.

### Comandos y resultados (ejecuciones aisladas, limpias)

```
$ pnpm run build
✓ built in 748ms
dist/assets/index-CCVUwotx.css   60.70 kB │ gzip:  7.51 kB   (antes: 60.69 kB / 7.50 kB)
✓ Puerta de terceros: 0 hallazgos

$ pnpm exec playwright test --workers=1 --reporter=list -g "@s45" tests/e2e/accesibilidad.spec.ts
1 passed (27.3s)

$ pnpm exec playwright test --workers=1 --reporter=list tests/e2e/accesibilidad.spec.ts
15 passed (40.1s)   [incluye @s36 intacto (4.0s) y @s45 nuevo (21.3s)]

$ pnpm exec playwright test --workers=1 --reporter=list   (suite e2e COMPLETA)
112 passed (1.7m)   — sin ninguna regresión

$ pnpm exec vitest run
Test Files  88 passed (88)
     Tests  1230 passed (1230)

$ pnpm run lint
codigo de salida: 0 (oxlint --deny-warnings, sin salida = sin hallazgos)

$ pnpm run typecheck
codigo de salida: 0 (tsc -b)
```

Una única inestabilidad intermitente detectada durante la verificación,
**ajena a este fix**: `src/accesibilidad-teclado.test.tsx` (3 tests) falló
por `Test timed out in 5000ms` en una pasada de `vitest run` ejecutada EN
PARALELO con otros comandos míos (contención de CPU, mismo patrón que
`fix_uso_del_acento.md` §6 ya documentó). Re-ejecutado en aislamiento: 5/5
verde. Re-ejecutada la suite completa de Vitest en aislamiento justo después:
88/88 ficheros, 1230/1230 tests, verde. Este fichero no se ha tocado en
ningún momento de esta sesión.

---

## 5. Trazabilidad @s45

| Cláusula del `Then` (`features/rediseno_visual.feature:650-656`) | Cubierta por |
|---|---|
| "el análisis... se ejecuta sobre las 6 rutas con cada una de las 5 variantes" | `tests/e2e/accesibilidad.spec.ts`, describe `@s45`, bucle `RUTAS_DEL_INVENTARIO` × `VARIANTES_DEL_SELECTOR` |
| "el recuento de violaciones es 0 en todas las combinaciones" | `expect(informe.violaciones).toEqual([])` + `expect(informe.violacionesTotales).toBe(0)` |
| "el recuento de combinaciones efectivamente analizadas es exactamente 30" | `expect(RECUENTO_DE_COMBINACIONES).toBe(30)` + `expect(informe.paginasAnalizadas).toBe(RECUENTO_DE_COMBINACIONES)` |
| "se usan las 5 etiquetas acumulativas de siempre, sin mecanismo de opciones" | Ya cubierta aparte por `src/lib/diseno/analisisAutomaticoAxe.test.ts` (sin tocar); reforzada aquí porque el test nuevo también llama `withTags([...ETIQUETAS_AXE_ACUMULATIVAS])`, nunca `.options()` |

---

## 6. Resumen para el `craftsman_lead`

| # | Fichero | Cambio | Motivo |
|---|---|---|---|
| 1 | `tests/e2e/accesibilidad.spec.ts` | Describe nuevo `@s45` (30 combinaciones reales), `@s36` intacto | Cierra el Hallazgo nuevo 1 de la 3ª revisión del judge |
| 2 | `src/styles/global.scss` | `a { color: inherit; }` en la sección "C. Base" | Defecto de producción real encontrado por el test nuevo: 4 enlaces sin clase propia heredaban el azul del agente de usuario, insuficiente contraste en la variante "tech" |

Ningún otro fichero tocado. Sin comandos `git` de escritura ejecutados.
