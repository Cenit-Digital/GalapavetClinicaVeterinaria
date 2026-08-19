# Veredicto — features/informacion_contacto.feature (G2)

Verificador independiente. Fuentes primarias releídas: `features/informacion_contacto.feature`
(completo, cabecera incluida), `docs/datos-galapavet.md`, `project-spec.md`, `vite.config.ts`,
`stryker.config.json`, `src/test/setup.ts`, `features/pie_de_pagina.feature` (para contrastar la
cita de L3 sobre el escenario hermano de fail-closed).

Alegaciones recogidas sobre este fichero: **5** (L1: 3 — `@s9` bloqueante, `@s9` grave, `@s10`
bloqueante; L2: 0; L3: 2 — `@s10` bloqueante, `@s3` grave).

`@s10` bloqueante de L1 y `@s10` bloqueante de L3 señalan el mismo defecto de fondo (la cláusula
"no se ha solicitado nada al proveedor externo..." es vacuamente cierta en este stack de test) con
evidencia y redacción distintas → colapsados en un solo veredicto. **Duplicados colapsados: 1.**
Veredictos emitidos: **4**, los 4 confirmados.

## Tabla de veredictos

| ancla | severidad | veredicto | lentes | motivo (cita propia) |
| --- | --- | --- | --- | --- |
| `@s9` (línea 165) | bloqueante | **CONFIRMADO** | L1 | `vite.config.ts` línea 49 fija `css: false` con el comentario explícito "Vitest no procesa CSS por defecto: los CSS Modules devuelven un proxy". Con css desactivado, ningún `@font-face` ni `url()` de una hoja SCSS real llega jamás al DOM de jsdom durante el test — ni siquiera se inyecta un `<style>` o `<link>`. La cláusula "ninguna... tipografía, hoja de estilo... declara un origen ajeno" (línea 165 de `informacion_contacto.feature`) solo es mordible en su mitad DOM-observable (`img`/`script`); la mitad tipografía/hoja-de-estilo es estructuralmente inmune a cualquier implementación, incluida una que sirva la tipografía desde un CDN externo vía `@font-face`. Ninguna otra `.feature` del repo prueba origen de fuentes (grep `tipograf\|font` solo devuelve este fichero y `cabecera_y_navegacion.feature`, que no trata el tema), y la cabecera de este fichero no marca esta cláusula como verificación manual/build-time (a diferencia de cómo otras features sí anotan explícitamente qué se verifica "a ojo" en la puerta de accesibilidad). No hay lectura razonable que salve la mitad tipografía/CSS de la aserción. |
| `@s9` (línea 167) | grave | **CONFIRMADO** | L1 | La cláusula "ese aviso es texto visible" (línea 167) solo puede evaluarse en jsdom con `toBeVisible()` de jest-dom, que resuelve mediante `getComputedStyle()`. Como `css:false` (`vite.config.ts` línea 49) impide que cualquier SCSS real —incluida una clase `.sr-only` que oculte visualmente el aviso mientras lo deja accesible— se cargue en el DOM de test, un implementador que oculte el aviso con `.sr-only` seguiría viendo `toBeVisible()` en verde, porque esa clase nunca se resuelve en el entorno de test. El escenario dice exigir visibilidad visual real y no puede distinguirla de un elemento accesible pero invisible. |
| `@s10` (línea 172-173) | bloqueante | **CONFIRMADO** | L1, L3 | Confirmado con cita propia de dos fuentes primarias distintas a las que citó cada lente: (1) `vite.config.ts` líneas 38-41, `environmentOptions.jsdom` solo fija `{ url: 'http://localhost:3000' }` — no existe `resources: 'usable'`, así que jsdom nunca dispara una petición de red real por el `src` de un `<iframe>`, se implemente o no la carga diferida. (2) `src/test/setup.ts` líneas 52-67, `ObservadorInerte` sustituye a `IntersectionObserver` con `observe(): void {}` que no hace nada y nunca invoca el callback, así que ningún test puede simular "el marco sigue fuera de la ventana visible" disparando o no la carga real. La cláusula "no se ha solicitado nada al proveedor externo mientras el marco sigue fuera de la ventana visible" (línea 173) es cierta en cualquier build, correcto o roto, dentro de este stack — exactamente lo que L1 y L3 alegan, solo que con evidencia de configuración verificada aquí de forma independiente. (La primera línea del Then, "el marco del mapa declara carga diferida", sí es mordible como atributo `loading="lazy"` del DOM y no se objeta.) |
| `@s3` (líneas 112-118) | grave | **CONFIRMADO** | L3 | `project-spec.md` línea 73-74 fija como "Modo de error común" de todo el proyecto (no solo del pie): "Dato de negocio inválido en la fuente única (teléfono que no normaliza) → el normalizador **lanza**... Falla cerrado." `pie_de_pagina.feature` sí lo ejercita (línea 203-206: "Un teléfono que no valida hace fallar al pie..." / "Then la operación falla lanzando un error"). Grep de `falla\|error` sobre `informacion_contacto.feature` completo no devuelve ningún resultado: cero escenarios de este fichero ejercitan el camino en el que uno de los 3 enlaces `tel:` que renderiza este panel (2 en `@s3`, 1 en `@s5`) procede de un valor que no normaliza. `@s11` prueba sustitución con un valor VÁLIDO ("600 000 000") y `@s12` prueba AUSENCIA de dato, pero ninguno de los dos cubre el caso "presente pero inválido". Si el `.tsx` de este panel llama al normalizador con su propio manejo de errores (p. ej. atrapa la excepción y pinta un enlace con el valor crudo en vez de dejar que falle), ningún escenario de este fichero lo detectaría — y como StrykerJS no muta `.tsx` (`stryker.config.json` línea 3 y `mutate` en líneas 11-17), esa lógica de manejo de errores tampoco se prueba por mutación desde ningún otro fichero. Es una asimetría real y no un ruido de estilo. |

## Notas de arbitraje

- No se rechazó ninguna alegación por depender de un dato inventado por el propio agente: las
  cuatro se apoyan en citas verificables (el propio `.feature`, `vite.config.ts`, `src/test/setup.ts`,
  `project-spec.md`, `pie_de_pagina.feature`).
- Se buscó activamente una lectura que salvara cada alegación (cobertura por otro escenario del
  mismo fichero, verificación manual ya anotada en la cabecera, o mecanismo DOM alternativo) y no
  se encontró ninguna para las 4 supervivientes.
- L2 no aportó hallazgos sobre este fichero (0/0), consistente con su lente (fidelidad a la fuente
  primaria de datos de negocio): todos los datos de `@s1`-`@s15` trazan correctamente a
  `docs/datos-galapavet.md` §2 y §3, y no se objeta nada de esa lente aquí.
