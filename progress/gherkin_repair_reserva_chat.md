# Reparación de features/reserva_chat.feature — hallazgos CONFIRMADOS

Fuente: `progress/revision/VEREDICTO_reserva_chat.md` (6 CONFIRMADO, 2 REFUTADO,
estos últimos no se tocan). Directiva del humano aplicada para el hallazgo de
WhatsApp: Decisión 14 de `project-spec.md` (confirma WhatsApp como canal
humano de cierre, pero exige separar las dos incógnitas: si el cliente lo usa,
y en caso afirmativo, qué número).

## 1. CABECERA — PENDIENTE WhatsApp (grave, L2)

Líneas ~97-106 (antes 92-96). Reescrito el bloque `PENDIENTE: canal de
mensajería` para separar explícitamente las dos incógnitas de la Decisión 14:
(a) si el cliente usa WhatsApp en absoluto, (b) en caso afirmativo, si el
685 34 31 49 (hoy solo número de voz verificado, §2) es también el número de
WhatsApp — sin darlo por bueno. Se cita la Decisión 14 por nombre. No se tocó
ningún escenario: @s12 y @s18 ya exigían correctamente la AUSENCIA de
`wa.me`/"WhatsApp", así que su comportamiento exigido no cambia.

## 2. @s14 — teléfono de clínica sin enlace (grave, L2)

Línea ~246 (antes 234). Añadido un `And` que exige un segundo elemento con rol
"link", nombre accesible "Llamar a la clínica · 91 082 92 67" (rótulo ya
usado en @s18 de este mismo fichero) con destino "tel:+34910829267", junto al
enlace de urgencias que ya existía. Así el mensaje de urgencia deja los dos
teléfonos citados como enlaces pulsables, no solo el de fuera de horario.

## 3. CABECERA — Invariante 6 sin `Then` de lógica pura (grave, L3)

Añadidos tres escenarios nuevos al final del fichero, `@s21` `@s22` `@s23`
(líneas ~302-320), que ejercitan directamente el módulo `*-logica.ts` sin DOM,
siguiendo el mismo estilo que `datos_negocio.feature`:
- `@s21` — guarda de envío + recorte de espacios (respuesta solo de espacios
  se rechaza; espacios sobrantes se recortan al aceptar).
- `@s22` — composición del resumen "A · B · C" a partir de las tres primeras
  respuestas.
- `@s23` — corte de guion al elegir "Es una urgencia": el paso siguiente es el
  estado de derivación, y desde ahí no hay paso de animal/cuándo/nombre.

Se documentó el añadido como punto 13 de "AÑADIDOS QUE IMPONE EL CONTRATO DE
ESTE REPOSITORIO" (línea ~84-87), explicando que @s1-@s20 solo observan el DOM
y estos tres dan superficie de test directa para que la mutación en
`*-logica.ts` sea matable. No se reescribió ningún escenario existente.

## 4. @s3 — extractor sin control positivo (grave, L3)

Línea ~147 (antes 137). Añadido un `Then` previo, anclado al mismo extractor
que fija el `When` ("se recorre todo el texto visible del widget de
reserva"): `Then ese texto recorrido no está vacío y contiene "Cirugía y
anestesia"`. Antes del cambio, las cuatro negaciones posteriores pasaban en
verde aunque el extractor devolviese cadena vacía; ahora hay un control
positivo sobre el mismo texto que las negaciones niegan.

## 5. CABECERA — "4 opciones son ventanas... (§3)" vs @s4 (menor, L2)

Líneas ~45-51. Reescrita la frase para no afirmar que las 4 opciones son
ventanas horarias reales: ahora dice que las TRES primeras lo son (§3) y que
la cuarta, "Lo antes posible", es la opción sin preferencia horaria, no una
ventana. No se tocó @s4: sus 4 nombres accesibles ya eran correctos: el
defecto estaba solo en la prosa de la cabecera, no en el escenario.

## 6. @s20 — inciso de color redundante (menor, L1)

Línea ~300 (antes 289). Eliminado el inciso final "sin recurrir a su color ni
a su posición" del último `And`, porque no añadía ninguna aserción
independiente comprobable en jsdom (CSS desactivado, ver `vite.config.ts`) y
duplicaba la garantía que ya cierran las dos líneas anteriores (cada mensaje
empieza por su autor + recuento exacto 2/1). El resto del `Then`/`And` de esa
escena queda igual.

## Hallazgos REFUTADO — no tocados

- `@s17` — "La cita se cierra por teléfono": refutado en el veredicto (lectura
  razonable como aviso de demo, no afirmación de proceso de negocio). Sin
  cambios.
- `@s18`/`@s12`/`@s14` — notación `(§2)` en los hrefs derivados: refutado
  (abreviatura razonable, ya amparada por `datos_negocio.feature` @s1/@s2/@s7
  y el Invariante 2). Sin cambios.
