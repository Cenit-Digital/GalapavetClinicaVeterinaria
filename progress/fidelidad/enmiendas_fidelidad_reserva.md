# Enmiendas a contratos vigentes — feature 32 `fidelidad_reserva`

> Cada feature `fidelidad_*` respeta los contratos `done` que toca o los
> **enmienda por escrito**, con el antes y el después literal de cada cláusula
> (invariante de `project-spec.md`, «Fidelidad visual de la portada»). Este
> fichero recoge las de `fidelidad_reserva`. Ninguna renumera ni reordena
> escenarios; los tags `@sNN` se conservan.
>
> Origen: **Decisión 66** de `project-spec.md` (03/09/2026, Pablo): «el
> cliente confirmó que el móvil 685 34 31 49 atiende WhatsApp», registrado en
> `docs/datos-galapavet.md` §2bis. La decisión deroga expresamente la reserva
> de la Decisión 14 y «las cláusulas de `datos_negocio.feature` y
> `reserva_chat.feature` (@s12/@s18) que prohibían el canal hasta tener
> confirmación; ambas se enmiendan por escrito con la feature 32». Queda
> sujeta a la revisión del `judge`.

---

## Enmienda 1 — `features/reserva_chat.feature` @s18: la primera acción es «WhatsApp» (wa.me del móvil confirmado); la segunda, «Llamar a la clínica»

### Qué se midió

El prototipo (`docs/diseno-claude-design/Veterinaria La Sierra.dc.html`,
VLS:260-262) pone en la columna de texto UNA fila con un botón relleno
«WhatsApp» (`wa.me`) y un botón de contorno «Llamar a la clínica». La web
tenía dos píldoras de contorno apiladas, «Llamar a la clínica · 91 082 92 67»
y «Llamar al móvil · 685 34 31 49», porque el canal de mensajería estaba sin
confirmar. Con el dato confirmado, el enlace `wa.me` que la fuente única ya
derivaba (`datosNegocio.telefonoMovil.enlaceMensajeria()`,
`datos_negocio` @s5) pasa a la interfaz. El destino de voz del móvil sigue
publicado en cabecera, contacto y pie; en esta sección lo sustituye el canal
de mensajería que atiende ese mismo número.

### ANTES (literal)

```gherkin
  @s18
  Scenario: El visitante puede saltarse el chat y llamar directamente
    When el visitante mira la columna de texto de la sección "Reservar"
    Then existe un elemento con rol "link" cuyo nombre accesible es "Llamar a la clínica · 91 082 92 67" y cuyo destino es exactamente "tel:+34910829267"
    And existe un elemento con rol "link" cuyo nombre accesible es "Llamar al móvil · 685 34 31 49" y cuyo destino es exactamente "tel:+34685343149"
    And en toda la sección no existe ningún elemento con rol "link" cuyo destino contenga "wa.me" ni "whatsapp"
    And en toda la sección ningún nombre accesible contiene "WhatsApp"
    And en toda la sección no existe ningún elemento con rol "link" cuyo destino empiece por "mailto:"
```

### DESPUÉS (literal)

```gherkin
  @s18
  Scenario: El visitante puede saltarse el chat y escribir o llamar directamente
    When el visitante mira la columna de texto de la sección "Reservar"
    Then existe un elemento con rol "link" cuyo nombre accesible es "WhatsApp" y cuyo destino es exactamente "https://wa.me/34685343149"
    And existe un elemento con rol "link" cuyo nombre accesible es "Llamar a la clínica" y cuyo destino es exactamente "tel:+34910829267"
    And en toda la sección el único elemento con rol "link" cuyo destino contenga "wa.me" o "whatsapp" es ese enlace "WhatsApp" al móvil confirmado
    And en toda la sección no existe ningún elemento con rol "link" cuyo destino empiece por "mailto:"
```

Lo que **no** cambia: la prohibición de `mailto:` (el cliente sigue sin
publicar email, `docs/datos-galapavet.md` §9) y los enlaces de llamada del
interior del widget (@s12, @s14), que conservan el patrón «etiqueta · número».

### Tests tocados

- `src/components/ReservaChat.test.tsx` › `@s18` reescrito con la
  justificación en el propio test; `@s2 de fidelidad_reserva` fija además
  `target="_blank"` + `rel` con `noopener` y el orden de los dos enlaces.
- `tests/e2e/fidelidad-reserva.spec.ts` › `@s2` (navegador real: nombres,
  destinos, misma fila, relleno lateral, ≥ 44 px, sin desborde).

---

## Enmienda 2 — `features/reserva_chat.feature` @s12: la cláusula «ni wa.me ni whatsapp» dentro del widget deja de ser una prohibición del canal

### Qué se midió

La cláusula existía solo como reserva del canal sin confirmar (cabecera del
contrato, «PENDIENTE: canal de mensajería»). Derogada la reserva, lo que se
fija es lo que el widget ofrece **de verdad** en su estado final: la llamada
con el resumen a la vista, como único enlace. El cierre por mensajería con el
resumen prellenado (`enlaceMensajeria(texto)`, `datos_negocio` @s6) que la
propia cabecera del contrato anticipaba «si algún día se resuelven (a) y (b)»
es una decisión de producto que **no** está en `fidelidad_reserva.feature`
(@s1-@s5) y no se implementa por adelantado: queda anotada para el lead.

### ANTES (literal) — cláusula 4 de @s12

```gherkin
    And dentro del widget no existe ningún elemento con rol "link" cuyo destino contenga "wa.me" ni "whatsapp"
```

### DESPUÉS (literal)

```gherkin
    And ese enlace de llamada es el único elemento con rol "link" dentro del widget: el canal de mensajería confirmado (Decisión 66) se ofrece en la columna de texto (@s18), no en el cierre del chat
```

### Tests tocados

- `src/components/ReservaChat.test.tsx` › `@s12`: `getAllByRole('link')`
  dentro del widget es exactamente `[enlace de llamada]` (más estricto que la
  cláusula anterior).

---

## Enmienda 3 — cabeceras de `reserva_chat.feature` (cambio 6 y PENDIENTE «canal de mensajería») y de `datos_negocio.feature` (PENDIENTE «el cliente NO publica canal de WhatsApp»)

Son notas de contexto, no escenarios. Se anotan como derogadas/resueltas,
citando la fuente (`docs/datos-galapavet.md` §2bis, Decisión 66), sin borrar
el razonamiento original.

### ANTES (literal) — `datos_negocio.feature`, cabecera

```
#   - PENDIENTE: el cliente NO publica canal de WhatsApp. El móvil 685 34 31 49 es el único móvil
#     publicado, pero que ese número atienda mensajería está SIN CONFIRMAR. Por eso @s5, @s6 y @s12
#     fijan el FORMATO de la derivación (contrato del módulo) y NO autorizan a publicar ningún
#     botón de mensajería en la UI: hasta que el cliente lo confirme, ninguna sección lo muestra.
```

### DESPUÉS (literal)

```
#   - RESUELTO el 03/09/2026 con `fidelidad_reserva` (32), Decisión 66 (docs/datos-galapavet.md
#     §2bis): el cliente confirmó que el móvil 685 34 31 49 atiende WhatsApp. @s5, @s6 y @s12 siguen
#     fijando el FORMATO de la derivación; la reserva «ninguna sección muestra botón de mensajería
#     hasta que el cliente lo confirme» queda derogada y la sección Reservar publica el enlace wa.me.
#     Antes/después literal en progress/fidelidad/enmiendas_fidelidad_reserva.md.
```

Los escenarios @s5/@s6/@s12 de `datos_negocio` (formato del enlace) no
cambian: son justo los que la interfaz consume ahora. El aviso de verificar el
host `wa.me` en dispositivo real sigue vigente.

---

## Enmienda 4 — `features/rediseno_visual.feature` @s34: «lista de ventajas» → «lista con marcas de verificación cuyos ítems son los tramos de horario reales»

### Qué se midió

Leída al pie de la letra, «una lista de ventajas» pediría copiar las tres
promesas del prototipo (VLS:752-756: plazo de confirmación, recordatorio,
cancelación sin coste), que `reserva_chat` @s19 prohíbe porque el cliente no
las publica. La forma (marca «✓» en círculo) se conserva; los ítems son el
horario real, que ya exigía @s19.

### ANTES (literal)

```gherkin
    Then a la izquierda hay un texto con su cintillo, su titular y una lista de ventajas con marcas de verificación
```

### DESPUÉS (literal)

```gherkin
    Then a la izquierda hay un texto con su cintillo, su titular y una lista con marcas de verificación cuyos ítems son los tramos de horario reales que fija reserva_chat @s19
```

---

## Contratos vigentes que esta feature RESPETA sin enmendar

| Contrato | Cláusula | Cómo se respeta |
| --- | --- | --- |
| `reserva_chat` @s1-@s11, @s13-@s16 | guion, nombres accesibles, `aria-disabled`, enlaces del estado final y de urgencia | sin cambios de comportamiento; `FilaDeTexto` conserva `aria-label="Enviar respuesta"` y el glifo «→» va en un `span aria-hidden` |
| `reserva_chat` @s17 | aviso de demostración en todos los estados; nunca «en línea» | `<p class="aviso">` fijo al final del pie; el estado sigue siendo «Disponible» |
| `reserva_chat` @s19 | exactamente 3 `listitem` con los tramos reales; sin promesas | la marca «✓» va en `li::before` con `content: '✓' / ''` (fuera del `textContent` y del árbol accesible) |
| `reserva_chat` @s20 | cada mensaje empieza por «Asistente:»/«Tú:» | `rotularMensaje()` en `ReservaChat-logica.ts`; `data-autor` solo AÑADE lado y color |
| `rediseno_visual` @s24 (`geometria-escalas` e2e) | la tarjeta del chat es una de las «en reposo» | `@include tarjeta` + `&:hover { box-shadow: var(--sombra-reposo) }`; la elevada del prototipo (VLS:273) es desviación declarada |
| `rediseno_visual` @s25 (`geometria-escalas` e2e + test `?raw`) | chips, campo y botón ≥ 44 px; bloque literal `[aria-label='Respuestas rápidas'] button {` con `min-height: $altura-control-media;` | conservado; el botón redondo mide `$altura-control-media` (48 px) |
| `rediseno_visual` @s15 (`usoDelAcento`) | `--color-acento` solo como relleno | solo el punto de «Disponible» |
| `rediseno_visual` @s11 (matriz de contraste) | todo par (tinta, fondo) del módulo está en la matriz | pares usados: tinta/superficie, texto-suave/superficie, acento-tinta/superficie, sobre-primario/primario, sobre-primario/primario-fuerte, acento-tinta/acento-suave; ninguno nuevo |
| `identidad_visual` (movimiento) | solo 150/300 ms `ease-out` bajo `no-preference` | la única transición nueva (botón redondo, 150 ms) va dentro del `@media` |
| `datos_negocio` @s19 / `puertaTelefonoHardcodeado` | ningún teléfono a mano | todo sale de `datosNegocio`; el avatar deriva de `inicialesDe(identidad.nombreComercial)` |
| `urgencias` @s14 (e2e) | todo `aria-label` con «urgencias» es el rótulo real | esta sección no añade ningún `aria-label` con esa palabra |
| `datos-reales` @s49/@s52, `rolesDescartados` | ningún literal del prototipo; sin «24 h»/«365» | el copy de cintillo/titular/párrafo se conserva; el prototipo se cita solo como `VLS:<línea>` |
