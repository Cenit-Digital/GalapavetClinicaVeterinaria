# Plan de pruebas — `rediseno_visual`

Fecha: 26/08/2026. Alcance de este documento: **solo planificación basada en
lectura**. No autoriza cambios en producción, contrato ni suites existentes.

## Principios de ejecución

- Cada escenario se talla en TDD estricto: un test rojo, el mínimo verde y
  refactor en verde. Los identificadores `@s` del contrato se conservan en el
  `describe`/nombre del test y después en `progress/tdd_rediseno_visual.md`.
- `Vitest` verifica modelos puros, invariantes de texto real (`?raw`) y la
  relación entre fuentes de verdad. `Playwright` verifica el `dist/` real, no
  el servidor de desarrollo, en las rutas de `tests/e2e/rutas.ts`.
- Las aserciones visuales deben medir propiedades computadas, rectángulos,
  recursos y peticiones; no snapshots de DOM ni comparaciones de píxeles sin
  umbral documentado. El contrato define medidas observables, no una imagen
  de referencia píxel a píxel.
- Las decisiones/derivaciones nuevas se extraerán a módulos puros bajo
  `src/lib/diseno/` o `src/components/*-logica.ts`; solo esos módulos pasan
  por Stryker. CSS y JSX se validan mediante sus pruebas de navegador y sus
  puertas estáticas.

## Mapa de trazabilidad de los 52 escenarios

| Escenarios | Suite prevista | Tipo | Cobertura / aserción principal |
| --- | --- | --- | --- |
| @s1–@s3 | `src/lib/diseno/tokensColor.test.ts` (reescrita) + nueva `src/lib/diseno/tokensPrototipo.test.ts` | Vitest, texto real | Inventario 20 (18 color + 2 sombra), 5×20=100 declaraciones propias y tabla explícita prototipo→rol; cambiar un hexadecimal del bundle debe fallar. |
| @s4–@s6 | `tokensColor.test.ts` + `mezclaDeColor.test.ts` (ampliada) | Vitest | Congela los 15 hex de `marca`, deriva los tres nuevos y recalcula el correctivo cálido con `contraste.ts`. |
| @s7–@s9 | Nueva `src/lib/diseno/usoColorRediseno.test.ts` | Vitest, texto real | Matriz no vacía por cada variante: tinta sobre urgencia, borde de control y foco; prohíbe blanco literal sobre urgencia. |
| @s10 | Nueva `src/lib/diseno/variantePorDefecto.test.ts` + ampliación `SelectorPaleta-logica.test.ts` | Vitest, texto real | Una única declaración de `clinica`; gemelo de `index.html`, selector y catálogo la consumen. |
| @s11–@s12 | `tokensColor.test.ts` (reescrita) | Vitest, texto real | Matriz por las 5 variantes, fallo cerrado con matriz vacía, y `:root` sin atributo igual a `clinica` sin contarlo como variante. |
| @s13 | Nueva `src/lib/diseno/afirmacionesProhibidas.test.ts` | Vitest + build fixture | Sustituye la puerta semántica de `rolesDescartados`: escanea `src` y `dist`, falla cerrada ante lista/ficheros vacíos y enumera hallazgos. |
| @s14 | Nueva `tests/e2e/rediseno-visual.spec.ts` | Playwright | En las 6 rutas, texto de urgencias, `tel:` y fuente única; exige el teléfono real y ningún rótulo alternativo. |
| @s15–@s16 | `rolesDescartados.test.ts` (reorientada) o nueva `usoTokensRediseno.test.ts` | Vitest, texto real | `--color-acento` aparece solo en fill; `--color-primario-fuerte` está declarado y usado; ambas puertas fallan si el inventario queda vacío. |
| @s17–@s19 | Nueva `tests/e2e/geometria-rediseno.spec.ts` | Playwright | A 1600: 6 contenedores=1220; bienvenida/FAQ más estrechos y distintos; padding vertical a 320/1440 es fluido, alternado y no 64 fijo. |
| @s20–@s22 | Nueva `tests/e2e/tipografia-rediseno.spec.ts` + ampliación `escalaTipografica.test.ts` | Playwright + Vitest | `clamp` de los dos pasos altos en ambos extremos, seis pasos bajos fijos, `font-weight:600`, tracking negativo y line-height propio menor que body. |
| @s23–@s25 | Nueva `tests/e2e/geometria-rediseno.spec.ts` + nueva `src/lib/diseno/escalaGeometrica.test.ts` | Playwright + Vitest | Radios usados y derivados, tres estados de elevación/hover y todos los controles ≥44px/alineación de checkbox/área táctil. |
| @s26 | `Cabecera-logica.test.ts`, `puntoDeCorte.test.ts`, `Cabecera.test.tsx` (ampliadas) + `geometria-rediseno.spec.ts` | Vitest + Playwright | Un valor fuente de corte, dos ramas en N/N−1 y sin solapamiento/desborde de barra+cabecera. |
| @s27–@s30 | Nueva `tests/e2e/portada-rediseno.spec.ts`; `Hero.test.tsx`, `Cabecera.test.tsx` y lógica de datos nueva | Playwright + Vitest | Barra fija real/reduced-motion; cabecera sticky y offset calculado; hero con recurso local, velo por tokens/contraste/reserva de espacio; píldora, CTAs y cuatro cifras derivadas. |
| @s31 | `Servicios.test.tsx` (actualizada) + `portada-rediseno.spec.ts` | Vitest + Playwright | Cinco tarjetas reales, imágenes locales 200 con dimensiones/aspecto, etiqueta derivada, pie separado y alineación por fila. |
| @s32 | `Equipo.test.tsx` (actualizada) + `portada-rediseno.spec.ts` | Vitest + Playwright | Sigue sin imágenes; avatar de iniciales, datos reales y regla de formación publicada. |
| @s33–@s36 | `ReservaChat.test.tsx`, `Galeria.test.tsx`, `FormularioContacto.test.tsx` (ampliadas) + `portada-rediseno.spec.ts` | Vitest + Playwright | Cintillos no heading, layout 2 columnas, chat con cabecera real y aviso, carrusel con snap/controles, y contacto sin email con tarjeta de urgencias/mapa. |
| @s37 | `SelectorPaleta.test.tsx`, `SelectorPaleta-logica.test.ts` (reescritas) + `tokens-aplicados.spec.ts` (reescrita) | Vitest + Playwright | Cinco opciones, muestras resueltas de cada tema y persistencia; no permite un listado de hexadecimales duplicado. |
| @s38–@s40 | `PaginaTienda.test.tsx`, `PaginaCampanas.test.tsx`, `PaginaBlog.test.tsx` (ampliadas) + nueva `tests/e2e/subpaginas-rediseno.spec.ts` | Vitest + Playwright | Cintillo/titular/tarjeta común, imágenes y proporción; preserva catálogo, avisos, ausencia de precio/plaza/vigencia y lectura de prosa. |
| @s41 | Nueva `src/lib/diseno/bundlePrototipo.test.ts` | Vitest, filesystem | Inventario exacto: 4 pantallas, motor y documento de procedencia. La identidad contra remoto no se puede demostrar solo con esos archivos: se añadirá checksum/manifest firmado únicamente si la fuente remota vuelve a estar disponible. |
| @s42 | `tests/e2e/tokens-aplicados.spec.ts` (reescrita) | Playwright + lectura `?raw` | Cada una de las 100 parejas resueltas equivale al SCSS, y `body` recibe fondo/texto del tema activo. |
| @s43 | `tests/e2e/imagenes.spec.ts` (ampliada) + nueva puerta de inventario | Playwright + Vitest | Natural size >0, origen propio, hero background 200 e inventario descubierto por glob (no lista manual). |
| @s44 | `tests/e2e/layout.spec.ts` (ampliada) | Playwright | A 320px, las 6 rutas sin scroll horizontal y ningún rect excede el viewport; contador exactamente 6. |
| @s45 | `tests/e2e/accesibilidad.spec.ts` (ampliada) | Playwright + axe | 6 rutas × 5 temas = 30 análisis, cero violaciones y las cinco etiquetas acumulativas; sin opciones de axe ad hoc. |
| @s46 | `tests/e2e/red-limpia.spec.ts`, `tools/puerta-terceros.ts` y su prueba | Playwright + build | Cero dominios prohibidos en navegación y build; nuevas fotos desde el origen propio. |
| @s47 | Nueva `tests/e2e/consola-rediseno.spec.ts` | Playwright | Captura listeners antes de navegar; 0 error/warning/pageerror tras selector, servicio, equipo y FAQ en las 6 rutas. |
| @s48 | `tests/e2e/css-presupuesto.spec.ts` (actualizada) | Playwright | Techo único, literal y >0; suma únicamente hojas cargadas. No se elevará el techo sin medición y decisión escrita. |
| @s49 | Nueva `src/lib/diseno/datosFicticiosProhibidos.test.ts` | Vitest + build fixture | Lista literal de clínica ficticia contra `src` y `dist`; recuento >0 y fallo cerrado. |
| @s50 | `Servicios.test.tsx`, `Equipo.test.tsx`, `Galeria.test.tsx` + `portada-rediseno.spec.ts` | Vitest + Playwright | Recuentos obtenidos de catálogos reales (5/2/galería real), nunca hints del editor. |
| @s51 | Nueva `src/components/Hero-logica.test.ts` (o módulo puro equivalente) | Vitest | Modelo de cuatro cifras derivado de `site.ts`/catálogo; fixture que cambia cada fuente y mata las cifras hardcodeadas. |
| @s52 | `afirmacionesProhibidas.test.ts` + `consola-rediseno.spec.ts`/ruta de texto | Vitest + Playwright | Texto de seis rutas sin afirmaciones 24h/365; la única promesa de urgencias procede de la fuente única. |

## Suites nuevas y objetivo de mutación

| Superficie nueva o modificada | Prueba unitaria | Objetivo Stryker | Mutantes que debe matar |
| --- | --- | --- | --- |
| Inventario/lectura de 20 tokens y tabla prototipo | `tokensPrototipo.test.ts`, `tokensColor.test.ts` | `src/lib/diseno/tokensColor.ts` | cambio de recuentos, omisión de una variante/token, lectura heredada, comparación hexadecimal debilitada, aprobación vacía. |
| Puertas semánticas de urgencia, uso de acento y datos ficticios | `afirmacionesProhibidas.test.ts`, `usoTokensRediseno.test.ts`, `datosFicticiosProhibidos.test.ts` | módulo puro nuevo que sustituya/parta `rolesDescartados.ts` | negación de patrones, `some/every`, lista vacía, recuento de archivos y exclusiones permitidas. |
| Fuente única de variante y selector | `variantePorDefecto.test.ts`, `SelectorPaleta-logica.test.ts` | `src/components/SelectorPaleta-logica.ts` y módulo puro de catálogo si se crea | fallback de `clinica`, validación de id, persistencia y orden de catálogo. |
| Escalas Sass/TS y medidas compartidas | `escalaGeometrica.test.ts`, `escalaTipografica.test.ts`, `escalaEspaciado.test.ts`, `puntoDeCorte.test.ts` | módulos puros nuevos de escala y `src/lib/diseno/{escalaTipografica,escalaEspaciado,puntoDeCorte}.ts` tocados | cambio de extremos, desigualdades 320/1220, coherencia Sass↔TS, valor de corte N/N−1 y vacuidad. |
| Modelo de cifras Hero, categorías y assets | `Hero-logica.test.ts`, `inventarioActivosPublicos.test.ts` ampliada | `src/components/Hero-logica.ts` (si se crea) e inventario puro nuevo | cifras constantes, cambio de fuente, filtro de elementos, omisión de ruta nueva y comparación de inventario. |

La corrida de mutación debe limitarse a los módulos **tocados por la feature**,
en series separadas y con `concurrency: 1`; se exige 100% y `# timeout: 0`.
No se reportará mutación de JSX/SCSS como cobertura de diseño: Stryker no
muta de forma representativa sus atributos/estilos según el propio
`stryker.config.json`.

## Tests existentes que necesariamente cambiarán

| Fichero | Cambio requerido |
| --- | --- |
| `src/lib/diseno/tokensColor.test.ts` | Sustituir 4 variantes/17 roles/68 pares por 5/20/100; retirar los casos `lima`, `verde`, `noche` y anclar valores/ratios del contrato nuevo. |
| `src/lib/diseno/rolesDescartados.test.ts` | Ya no puede prohibir nombres de token que el contrato habilita; debe cubrir la nueva puerta de afirmaciones y uso seguro. |
| `src/components/SelectorPaleta-logica.test.ts` | `marca`→`clinica` como fallback; `tech` deja de ser dato inválido; reemplazar ids retirados. |
| `src/components/SelectorPaleta.test.tsx` | 4→5 botones y 12→15 muestras; etiquetas nuevas, tema por defecto y persistencia sobre ids válidos. |
| `tests/e2e/tokens-aplicados.spec.ts` | 4→5 variantes, 100 tokens y nuevos nombres accesibles; mantener la cita heredada que exige `escenariosHeredados.test.ts`. |
| `src/lib/diseno/inventarioModulos.test.ts` | Si nace `BarraUrgencias` u otro módulo, ampliar inventario/recuentos y mantener co-localización/sin colores literales. |
| `src/lib/diseno/escala{Espaciado,Tipografica}.test.ts`, `src/styles/hoja-global.test.ts` | Reanclar valores solo tras medirlos; cubrir coherencia TS↔Sass antes de modificarlos. |
| `src/components/Cabecera-logica.test.ts`, `src/lib/diseno/puntoDeCorte.test.ts`, `src/components/Cabecera.test.tsx` | Nuevo corte y la única media query; N/N−1, cabecera con los dos accesos nuevos. |
| `src/{components/Servicios,components/Equipo,components/ReservaChat,components/Galeria,components/FormularioContacto,pages/PaginaTienda,pages/PaginaCampanas,pages/PaginaBlog}.test.tsx` | Conservar todos los datos/lógica ya aprobados y añadir semántica/anatomía; no eliminar aserciones de datos reales. |
| `tests/e2e/{layout,imagenes,accesibilidad,red-limpia,css-presupuesto}.spec.ts` | Endurecer métricas del contrato nuevo: 1220, imágenes descubiertas, 30 auditorías, origen propio y techo medido. |

No se deben “arreglar” por mera estética las guardas de `Equipo.test.tsx`
(sin retratos), `PieDePagina.test.tsx` (sin imagen no aprobada) ni las de
datos de campaña/blog. Si el rediseño las contradijera, sería un cambio de
contrato fuera de esta feature.

## Validaciones de máximo riesgo

1. **Transición de roles prohibidos a semántica verdadera (@s13–@s16).** La
   puerta actual prohíbe literalmente los tres tokens nuevos. Ejecutar primero
   su test rojo y el de afirmaciones visibles; no silenciar ni borrar la
   protección de urgencias.
2. **Tres fuentes de verdad de variante (@s2, @s10, @s37, @s42).** `_tokens.scss`,
   `variantesPaleta.ts` e `index.html` pueden divergir y producir FOUC en
   verde. La nueva prueba de integridad debe leer las tres.
3. **Fidelidad de `dist/`, no jsdom (@s17–@s48).** Todas las geometrías,
   fuentes, recursos, layout, axe, red y consola corren tras `pnpm run build`
   con el subpath real. Nunca sustituir por render de Testing Library.
4. **Imágenes nuevas (@s29, @s31, @s38, @s40, @s43).** El inventario actual
   de `imagenes-hrefDeDestino.test.ts` es manual y puede dejar una imagen sin
   prefijo de GitHub Pages. La puerta nueva debe descubrir consumidores y
   comprobar URL, respuesta, `naturalWidth` y mismo origen.
5. **Costo/estabilidad (@s45, @s47, @s48).** Axe son 30 navegaciones y la
   consola exige listeners previos. Mantener `retries: 0`, secuencialidad
   explícita donde haya estado local y el techo CSS como decisión medible, no
   acomodarlo para dejar la suite verde.
6. **Mutación honesta.** No aceptar un score con timeouts; los equivalentes se
   justificarán uno por uno en `progress/mutation_rediseno_visual.md`.

## Orden de pruebas durante TDD

1. @s1–@s16 (tokens, contraste, fuentes únicas y puertas semánticas).
2. @s17–@s26 (escalas y geometría compartida), primero la coherencia TS↔Sass.
3. @s27–@s37 (módulos de portada), una anatomía a la vez.
4. @s38–@s40 (subpáginas), preservando datos/avisos ya contratados.
5. @s41–@s52 (puertas de fidelidad, recursos, a11y, red, consola y datos).
6. Al final: `pnpm run test`, `pnpm run test:e2e`, `pnpm run lint`,
   `pnpm run typecheck`, `pnpm run build`, mutación acotada de los módulos
   modificados y `bin/harness init`. El cierre requiere los resultados y la
   trazabilidad real, no este plan.
