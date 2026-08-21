# TDD — informacion_contacto (id 10)

> Bitácora ciclo a ciclo (Rojo → Verde → Refactor), un escenario del `.feature`
> a la vez. Mapa de trazabilidad @s → test al final.

## Confirmación previa

`node .harness/harness.mjs init`: **verde** antes de tocar nada — 216/216
tests, lint + typecheck limpios. No hay `pwsh` en esta máquina; se invoca con
`node .harness/harness.mjs <comando>`.

## Diseño previo a la escritura del primer test (arquitectura, no código)

- `src/components/InformacionContacto-logica.ts` — módulo puro (Invariante 6):
  `construirModeloContacto(fuente)` construye el modelo de los 4 bloques +
  mapa a partir de una `FuenteContacto` (valores legibles, no derivados
  todavía). Cada bloque es `undefined` si su dato de origen está ausente
  ("dato ausente → no se renderiza el bloque", `project-spec.md` → Modos de
  error comunes). Los enlaces `tel:` se derivan con `enlaceLlamada` de
  `src/lib/telefono.ts`, sin envolver en `try/catch`: si no normaliza, la
  construcción del modelo lanza y el `.tsx` no atrapa el error (mismo patrón
  que `Hero.tsx`, @s16).
- `src/components/InformacionContacto.tsx` — cablea: recibe props opcionales
  por dato (`telefonoClinica`, `telefonoMovil`, `telefonoUrgencias`,
  `horario`, `direccion`), cada una con su valor por defecto tomado de
  `datosNegocio` (`src/lib/site.ts`) y sentinela `null` para "la fuente única
  no declara este dato" (mismo patrón `string | null` con doble sentido que
  `Hero.tsx`: `undefined` = "usa el valor por defecto", `null` = "ausente de
  verdad"). Esto es lo que hace inyectable la fuente única para @s11 sin
  reescribir teléfonos a mano: el panel nunca compone un `tel:` literal, solo
  pasa el texto legible a `construirModeloContacto`, que llama a
  `enlaceLlamada`.
- Los 4 bloques se renderizan como `<fieldset aria-label="...">` (rol
  implícito "group", sin `<legend>` porque `aria-label` tiene prioridad en el
  cálculo del nombre accesible) — mismo patrón ya usado y documentado en
  `progress/tdd_reserva_chat.md` ciclo 1, porque `role="group"` explícito en
  un `<div>` dispara `jsx-a11y/prefer-tag-over-role` en oxlint.
- El rótulo "Urgencias fuera de horario" se declara como constante local en
  `InformacionContacto-logica.ts`, no se reimporta de `site.ts` (que no lo
  exporta como símbolo suelto, solo como campo `.rotulo` de un objeto
  `Telefono` con tipo `string | undefined`). Mismo precedente que
  `Hero.tsx:27-28` (`TITULAR`, `UBICACION` como copy local aunque solapen con
  datos de `datosNegocio`): el NÚMERO de teléfono siempre se deriva de la
  fuente única (Invariante 2); el RÓTULO de un bloque es copy de interfaz,
  no un dato de negocio que pueda divergir.
- El mapa: `<iframe title="Mapa de {nombreComercial}" src={SRC_MAPA_TERCERO}
  loading="lazy" aria-describedby="...">` + `<p id="...">` con el aviso
  exacto como texto real del documento. Existe solo si `direccion` está
  presente (@s14: sin dirección postal no hay por dónde centrar el mapa).
  `SRC_MAPA_TERCERO` es una constante (proveedor y formato de consulta
  PENDIENTES de confirmar — `features/informacion_contacto.feature` líneas
  93-96): ningún escenario fija su valor exacto, solo que declara un origen
  ajeno y que es el único elemento que lo hace (@s9).
- Fuera del gate de Vitest/Stryker, por Decisión 11 (declarado en el propio
  `.feature`, no oculto):
  - @s9, penúltima cláusula: origen real de tipografía/hoja de estilo
    (`test.css:false` en `vite.config.ts` no permite medirlo).
  - @s10, última cláusula: que no se solicite nada al proveedor mientras el
    marco sigue fuera de la ventana visible (jsdom no dispara peticiones de
    red reales ni tiene `IntersectionObserver` funcional — `ObservadorInerte`
    en `src/test/setup.ts`).
  Ambas quedan como verificación pendiente en navegador real
  (Claude in Chrome / skill `browser-automation`), no bloqueante para cerrar
  esta ronda de TDD.
- **Interpretación de alcance para @s6 y @s15** ("la sección de contacto
  entera"): `formulario_contacto` (id 11) todavía no existe (`spec_ready`,
  no implementado). Hoy "la sección de contacto" solo puede ejercitarse como
  el árbol de render de `InformacionContacto` en solitario — es todo lo que
  esta feature controla. Se documenta explícitamente aquí para que no se lea
  como un hueco de cobertura silencioso.

## Ciclos

### Ciclo 1 — @s1 (4 bloques, en orden, sin "Email")

- ROJO: `InformacionContacto.test.tsx` importa `./InformacionContacto`, que no
  existe → falla al resolver el módulo.
- VERDE: `InformacionContacto.tsx` mínimo — 4 `<fieldset aria-label>` vacíos
  en el orden fijo (`NOMBRES_GRUPOS` en `-logica.ts`), dentro de
  `<section aria-label="Información de contacto">`.
- REFACTOR: ninguno necesario.

### Ciclo 2 — @s2 (dirección real)

- ROJO: nuevo test exige las 2 líneas exactas de la dirección real dentro del
  grupo "Dirección" → falla, el grupo estaba vacío.
- VERDE: el bloque "Dirección" pasa a leer `datosNegocio.direccion.lineas`
  (2 `<p>`, una línea cada uno). `NOMBRES_GRUPOS` deja de usarse para este
  bloque; se retira de `-logica.ts` (queda vacío, `export {}`, a la espera
  del primer ciclo que necesite lógica de verdad).
- REFACTOR: ninguno necesario.

### Ciclo 3 — @s3 (2 enlaces de llamada en "Teléfonos")

- ROJO: nuevo test exige 2 `role="link"` con nombre/destino exactos dentro
  del grupo "Teléfonos" → falla, `getAllByRole('link')` no encuentra nada.
- VERDE: `InformacionContacto-logica.ts` gana `construirEnlaceTelefono`
  (deriva `{ textoVisible, href }` con `enlaceLlamada` de `src/lib/telefono.ts`
  — nunca se escribe un `tel:` a mano). El `.tsx` cablea 2 enlaces
  (`telefonoClinica`, `telefonoMovil`) desde `datosNegocio`.
- REFACTOR: ninguno necesario.

### Ciclo 4 — @s4 (3 tramos de horario)

- ROJO: nuevo test exige 3 `role="term"` con sus pares días/horas dentro del
  grupo "Horario" → falla, `getAllByRole('term')` no encuentra nada.
- VERDE: el bloque "Horario" pasa a un `<dl>` con un `<dt>/<dd>` por tramo de
  `datosNegocio.horario` (mismo patrón que `Hero.tsx`).
- REFACTOR: ninguno necesario.

### Ciclo 5 — @s5 (urgencias con rótulo real)

- ROJO: nuevo test exige 1 enlace dentro del grupo "Urgencias fuera de
  horario" con nombre/destino exactos → falla, el grupo estaba vacío.
- VERDE: el bloque se rellena con `construirEnlaceTelefono` sobre
  `datosNegocio.telefonoUrgencias.textoVisible`, primero con un IIFE inline
  (mínimo para pasar).
- REFACTOR (en verde): el IIFE se hoistea a una variable `enlaceUrgencias`
  junto al resto de enlaces derivados, más legible. Verificado en verde tras
  el cambio.

### Ciclo 6 — @s6 (guarda anti "24 h" / "Llamar ahora")

- El test se escribió y **pasó a la primera** (nada en el componente afirma
  eso hoy). Por `docs/tdd.md`, un verde a la primera no demuestra nada:
  sabotaje manual — se añadió un segundo enlace `"Llamar ahora — 24 h"` al
  bloque de urgencias. Resultado: **2 tests se pusieron en rojo** (@s5, por
  el conteo de enlaces, y @s6, por el texto prohibido) — confirma que ambos
  tests muerden de verdad. Revertido el sabotaje, vuelta a 6/6 verdes. Cero
  producción tocada por este ciclo (ya cubierto por ciclos anteriores).

### Ciclo 7 — @s7 (sin bloque de email)

- El test se escribió y **pasó a la primera** (el componente nunca ha tenido
  ningún dato de email). Sabotaje manual: se añadió un quinto
  `<fieldset aria-label="Email">` con un `mailto:` real. Resultado: **2 tests
  en rojo** (@s1, por el conteo de 4 grupos, y @s7, por el grupo "Email" y el
  `mailto:`). Revertido. Cero producción tocada.

### Ciclo 8 — @s8 (mapa: 1 marco, título real, antes de los grupos)

- ROJO: nuevo test exige exactamente 1 `<iframe>` dentro de la región, con
  `title` exacto "Mapa de Galapavet" y posición anterior al grupo "Dirección"
  → falla, no había ningún `<iframe>`.
- VERDE: se añade `<iframe title={... Mapa de ${nombreComercial}} src={SRC_MAPA_TERCERO}>`
  antes de los bloques. `SRC_MAPA_TERCERO` es una constante (proveedor
  PENDIENTE, ver diseño previo) — solo declara un origen ajeno, ningún
  escenario fija su valor.
- REFACTOR: ninguno necesario.

### Ciclo 9 — @s9 (única petición a terceros, declarada como texto real)

- ROJO: nuevo test exige `aria-describedby` del marco apuntando a un
  elemento con el texto exacto del aviso, dentro de la región, sin
  `aria-hidden`/`hidden` → falla, no existía `aria-describedby` ni el aviso.
- VERDE: se añade `aria-describedby="informacion-contacto-aviso-mapa"` al
  `<iframe>` y un `<p id="...">` con el texto exacto del aviso, como
  hermanos dentro de la región. La cláusula de origen real de
  tipografía/hoja de estilo (Decisión 11) queda declarada en el test como
  fuera del gate, no se intenta medir en jsdom.
- REFACTOR: ninguno necesario.

### Ciclo 10 — @s10 (carga diferida del mapa)

- ROJO: nuevo test exige `loading="lazy"` en el `<iframe>` → falla, el
  atributo no existía.
- VERDE: se añade `loading="lazy"` al `<iframe>`. La cláusula de que no se
  solicite nada mientras el marco está fuera de la ventana visible
  (Decisión 11) queda declarada como fuera del gate.
- REFACTOR: ninguno necesario.

### Ciclo 11 — @s11 (fuente única inyectable, doble de test)

- ROJO: nuevo test pasa `{ telefonoClinica: '600 000 000' }` como prop y
  exige que el primer enlace de "Teléfonos" refleje el doble → falla,
  `InformacionContacto` no aceptaba props todavía (el componente ignoraba
  cualquier prop y seguía usando `datosNegocio` fijo).
- VERDE: se introduce `InformacionContactoProps` con `telefonoClinica?: string`,
  valor por defecto `datosNegocio.telefonoClinica.textoVisible` (mismo
  patrón `Hero.tsx`). El bloque "Teléfonos" pasa a derivar del parámetro, no
  de `datosNegocio` directamente — esto es lo que hace posible inyectar un
  doble de test sin reescribir el teléfono a mano.
- REFACTOR: ninguno necesario.

### Ciclo 12 — @s12 (ausencia de teléfono de urgencias, falla cerrado sin placeholder)

- ROJO: nuevo test pasa `{ telefonoUrgencias: null }` y exige que el grupo
  desaparezca, que los 3 restantes conserven nombre y orden, y que no
  aparezca ningún marcador de relleno ("—", "Próximamente", "Consultar",
  "Pendiente") → falla, el grupo seguía apareciendo con el teléfono real.
- VERDE: se añade `telefonoUrgencias?: string | null` (sentinela `null` =
  "la fuente única no lo declara", mismo patrón `Hero.tsx`). El bloque se
  envuelve en `{enlaceUrgencias !== null && (...)}`.
- REFACTOR: ninguno necesario.

### Ciclo 13 — @s13 (horario sin tramos, sin lista vacía)

- ROJO: nuevo test pasa `{ horario: [] }` y exige que el grupo "Horario"
  desaparezca, que los demás conserven nombre/orden, y que no quede ningún
  `<dl>` en el documento → falla, el `<dl>` se seguía renderizando vacío.
- VERDE: se añade la prop `horario?: readonly TramoHorario[]` (tipo
  reexportado desde `-logica.ts`) y se envuelve el bloque en
  `{horario.length > 0 && (...)}`.
- REFACTOR: ninguno necesario.

### Ciclo 14 — @s14 (sin dirección no hay mapa)

- ROJO: nuevo test pasa `{ direccion: null }` y exige que el grupo
  "Dirección" desaparezca, que no exista ningún `<iframe>`, y que ningún
  elemento declare un `src` externo → falla, el grupo y el mapa se seguían
  renderizando.
- VERDE: se añade `direccion?: readonly [string, string] | null`
  (sentinela `null`). El mapa y el bloque "Dirección" se envuelven en un único
  `{direccion !== null && (...)}` (el mapa se centra por la dirección postal:
  sin dirección no hay por dónde centrarlo, @s14 lo pide explícitamente).
- REFACTOR (en verde): los dos condicionales `direccion !== null` del ciclo
  original (uno para el mapa+aviso, otro para el bloque) se fusionan en uno
  solo con un fragmento `<>...</>`. Verificado en verde tras el cambio.

### Ciclo 15 — @s15 (sin cifras ni credenciales no publicadas)

- El test se escribió y **pasó a la primera** (el panel nunca ha tenido
  valoración, registro, antigüedad ni precios). Sabotaje manual: se insertó
  un `<p>` con "★ 4,9 · 327 reseñas · registro 28/0791 · desde 2013 ·
  +12 años · 1200 mascotas en ficha · 15 €" al principio del panel.
  Resultado: **rojo confirmado** en la primera aserción que evalúa el
  `expect` (`toContain('★')`); el resto de aserciones de la misma cadena
  habrían caído igual de haber llegado a evaluarse. Revertido. Cero
  producción tocada.

### Ciclo 16 — @s16 (teléfono inválido falla cerrado)

- El test se escribió y **pasó a la primera**: `construirEnlaceTelefono` ya
  llama a `enlaceLlamada` sin `try/catch` desde el ciclo 3, así que un
  teléfono que no normaliza ya haría lanzar al render completo (mismo patrón
  `Hero.tsx` @s11). Sabotaje manual: se envolvió la derivación del teléfono
  de clínica en un `try/catch` que la sustituía por un enlace vacío en caso
  de error (simulando "tragarse" el fallo). Resultado: **rojo confirmado**
  (`expect(...).toThrow(...)` esperaba una excepción que ya no llegaba).
  Revertido. Cero producción tocada.

## Fix de configuración tras el ciclo 16 (no es comportamiento nuevo)

`node .harness/harness.mjs init` con los 16 escenarios en verde detectó 2
errores de lint que ningún `@s` pide arreglar como comportamiento, pero que
son gate duro del proyecto (`docs/conventions.md` → "el linter no da
avisos"):

1. `react/iframe-missing-sandbox` en `InformacionContacto.tsx` — se añade
   `sandbox=""` (el permiso más restrictivo que sigue mostrando el mapa;
   ningún escenario fija qué permisos necesita el proveedor real, así que no
   se concede ninguno por adelantado).
2. `vitest/no-conditional-expect` en el test de @s12 (un `expect` dentro de
   un `if` dentro de un `for`) — se reescribe filtrando primero los destinos
   `tel:` y afirmando después sobre la lista ya filtrada, mismo resultado,
   sin `expect` condicional.

`node .harness/harness.mjs init`: **verde** — 232/232 tests, lint y
typecheck limpios.

## Trazabilidad @s → test

- @s1 (4 bloques, en orden, sin "Email") → `InformacionContacto.test.tsx`
  `@s1 el panel muestra exactamente los cuatro bloques...`
- @s2 (dirección real) → `@s2 el bloque de dirección muestra la dirección
  real de Galapagar`
- @s3 (2 enlaces de teléfono) → `@s3 el bloque de teléfonos ofrece los dos
  números publicados...`
- @s4 (3 tramos de horario) → `@s4 el bloque de horario muestra los tres
  tramos publicados...`
- @s5 (urgencias, rótulo real) → `@s5 el teléfono de urgencias aparece con
  el rótulo real de fuera de horario`
- @s6 (sin reclamo 24 h) → `@s6 no existe ningún bloque ni reclamo que
  anuncie urgencias 24 h` (verde a la primera, sabotaje verificado)
- @s7 (sin bloque de email) → `@s7 no existe bloque de email...` (verde a
  la primera, sabotaje verificado)
- @s8 (mapa: 1 marco, título real, orden) → `@s8 el mapa se muestra con el
  título accesible del nombre real y encabeza el panel`
- @s9 (única petición a terceros, declarada) → `@s9 el mapa es la única
  petición a un tercero de la página y se declara como tal` (penúltima
  cláusula —origen real de tipografía/hoja de estilo— fuera del gate,
  Decisión 11, declarado en el propio test)
- @s10 (carga diferida) → `@s10 el mapa no se solicita al tercero hasta que
  hace falta` (última cláusula —petición real diferida— fuera del gate,
  Decisión 11, declarado en el propio test)
- @s11 (fuente única inyectable) → `@s11 el panel no reescribe a mano
  ningún teléfono, lo deriva de la fuente única`
- @s12 (ausencia de urgencias, sin placeholder) → `@s12 un dato de contacto
  ausente hace desaparecer su bloque, sin rellenarlo con nada`
- @s13 (horario sin tramos) → `@s13 un horario sin ningún tramo hace
  desaparecer el bloque de horario`
- @s14 (sin dirección, sin mapa) → `@s14 sin dirección no se muestra el
  mapa, porque el mapa se centra por la dirección postal`
- @s15 (sin cifras ni credenciales) → `@s15 el panel no muestra ninguna
  cifra ni credencial que el cliente no publique` (verde a la primera,
  sabotaje verificado)
- @s16 (teléfono inválido falla cerrado) → `@s16 un teléfono que no valida
  hace fallar al panel en vez de pintar un enlace a medias` (verde a la
  primera, sabotaje verificado)

16/16 escenarios con al menos un test concreto. `node .harness/harness.mjs
init`: verde, 232/232 tests (216 previos + 16 nuevos), lint + typecheck
limpios.

## Entregables

- `src/components/InformacionContacto-logica.ts` — `TramoHorario`,
  `EnlaceTelefono`, `construirEnlaceTelefono` (deriva `tel:` con
  `enlaceLlamada` de `src/lib/telefono.ts`, falla cerrado).
- `src/components/InformacionContacto.tsx` — panel con mapa + 4 bloques,
  props inyectables con sentinela `null`/valor por defecto de
  `datosNegocio` (`src/lib/site.ts`).
- `src/components/InformacionContacto.test.tsx` — 16 `describe`, uno por
  `@s`, más las guardas de conteo/orden que exige cada escenario.

## Pendiente, no bloqueante para cerrar esta ronda

Verificación en navegador real (Claude in Chrome / skill
`browser-automation`), Decisión 11:

- @s9, penúltima cláusula: que ninguna tipografía ni hoja de estilo de la
  sección declare un origen ajeno (no medible con `test.css: false`).
- @s10, última cláusula: que no se solicite nada al proveedor externo
  mientras el marco sigue fuera de la ventana visible (jsdom no dispara
  peticiones de red reales).

No es un hueco de cobertura oculto: ambas quedan declaradas explícitamente
en el propio `.feature` (líneas 180, 189) y en los tests correspondientes.
