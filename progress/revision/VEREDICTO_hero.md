# VEREDICTO — features/hero.feature (G2)

## Alegaciones recogidas

Solo dos alegaciones sobre `features/hero.feature` en los tres informes de lente:

- L1 (satisfacibilidad y mensurabilidad): `@s12` — grave.
- L2 (fidelidad a la fuente primaria): sin hallazgos en `hero.feature` (0/0).
- L3 (mutación y verde por vacuidad): `@s13` — bloqueante.

No hay solapamiento de ancla entre L1 y L3 (defectos distintos, escenarios distintos), así que no hay duplicados que colapsar.

## Tabla de veredictos

| ancla | severidad | veredicto | lentes originales | motivo (cita propia) |
| --- | --- | --- | --- | --- |
| `@s12` | grave | **CONFIRMADO** | L1 | El Given fija `"el visitante ha activado la preferencia de movimiento reducido en su sistema"` (línea 146), pero el Then que sigue (líneas 148-150) es literalmente la unión de aserciones que ya existen en `@s1`/`@s4`-`@s5`/`@s6` sin el Given: encabezado presente, 2 enlaces de acción, 3 entradas de horario. Ningún Then de `@s12` refiere a movimiento, animación, transición ni a ninguna propiedad que solo cambie bajo `prefers-reduced-motion`. Repasado el fichero completo (`@s1`-`@s13`), ninguna otra parte del contrato liga una rama de comportamiento a esa preferencia, así que no hay lógica alguna en `hero.feature` que este escenario esté verificando de forma distintiva: una implementación que ignore por completo `prefers-reduced-motion` pasa `@s12` exactamente igual que una que lo respete. No encontré una lectura razonable que salve el escenario como algo más que un smoke test duplicado bajo un Given irrelevante para sus propios Then. |
| `@s13` | bloqueante | **CONFIRMADO** | L3 | El Then de `@s13` (línea 155) dice textualmente: `Then ningún elemento de la sección declara un atributo "src" o "srcset" que empiece por "http"`, es decir, solo inspecciona atributos DOM. La propia cabecera del fichero, en la sección PENDIENTE (líneas 43-48), declara: `"Mientras no exista, ningún escenario de este fichero afirma nada sobre esa imagen salvo que no puede venir de un tercero (@s13)"` — o sea, el propio contrato asigna a `@s13` la responsabilidad de vetar un origen de tercero para la futura imagen de fondo. Confirmé además en `vite.config.ts` línea 49 que `test.css: false` está activo ("Vitest no procesa CSS por defecto... es deliberado"), lo que significa que si esa imagen de fondo llega como `background-image` en una hoja de estilos (el patrón más habitual para un fondo de sección), la CSS ni siquiera se evalúa en el test: ni el Then actual (que mira solo `src`/`srcset`) ni ninguna variante que mirase `style` inline la detectaría si viviera en una hoja de estilos externa. El vacío que L3 señala es real y coincide con el propio riesgo que el fichero se auto-documenta como pendiente. |

## Resumen

- totalAlegados: 2
- confirmados: 2
- refutados: 0
- duplicadosColapsados: 0
