# Gherkin — Veterinaria La Sierra

**Origen:** Claude Design, proyecto `ClinicaVeterinariaGalapavet.zip` → fichero `Veterinaria La Sierra.dc.html` (+ `support.js` como motor de renderizado, sin lógica de negocio propia).
**Fecha de conversión:** 17/08/2026.
**Resultado:** 13 ficheros `.feature`, 68 escenarios, validados con el parser oficial de Cucumber (`gherkin-official`) → **0 errores de sintaxis**.

## ⚠️ Discrepancia de nombre a confirmar

El zip subido se llama `ClinicaVeterinariaGalapavet`, pero **todo el contenido real del diseño** (título, meta, copyright, avatar del chat, dirección) es **"Veterinaria La Sierra"**, en **Miraflores de la Sierra** — no Galapagar. He nombrado los ficheros y el paquete según el contenido real verificado. Si "Galapavet" es el nombre de trabajo de otro cliente distinto (hay una Clínica Veterinaria San Antón real en Colmenarejo en tu estudio de prospección), avísame para no mezclar los dos proyectos.

## Ficheros generados (uno por componente)

| Fichero | Escenarios | Cubre |
|---|---|---|
| `barra_urgencias.feature` | 4 | Barra superior de urgencias 24h |
| `cabecera_y_navegacion.feature` | 7 | Header, nav 7 enlaces, menú móvil (corte en 1120px) |
| `hero.feature` | 4 | Sección de bienvenida, CTAs, 4 cifras |
| `servicios.feature` | 6 | 12 tarjetas de servicio expandibles (estado independiente) |
| `campanas.feature` | 5 | 3 campañas activas |
| `equipo.feature` | 5 | 6 profesionales, bios expandibles (estado independiente) |
| `reserva_chat.feature` | 11 | Flujo guiado de 5 pasos → WhatsApp (la pieza más crítica) |
| `galeria.feature` | 3 | Carrusel de 9 fotografías (scroll físico, no por índice) |
| `formulario_contacto.feature` | 6 | Formulario de contacto (validación nativa HTML5) |
| `informacion_contacto.feature` | 3 | Mapa + 4 bloques de datos + aviso de urgencias |
| `faq.feature` | 4 | 6 preguntas, acordeón **excluyente** (`<details name="faq">`) |
| `pie_de_pagina.feature` | 4 | 3 columnas × 4 enlaces + legal |
| `selector_paleta.feature` | 6 | 4 paletas conmutables, persistidas en `localStorage` |

## Cosas que el editor de diseño "decía" y el código real desmentía

El atributo `hint-placeholder-count` de las listas del `.dc.html` es solo una pista de vista previa del editor — **no es el contenido final**. Se ha verificado cada conteo contra el array de datos real:

- Servicios: el hint decía 6 → **son 12** (coincide con el copy "Doce especialidades").
- Galería: el hint decía 5 → **son 9**.
- FAQ: el hint decía 5 → **son 6**.

Si hubiera tomado el hint como referencia, las specs habrían sido incorrectas. Todos los conteos en los `.feature` están sacados del array de datos, no del hint.

## 3 incoherencias de comportamiento detectadas (documentadas, no "corregidas")

Están marcadas con un bloque `ADVERTENCIA` en el propio fichero `.feature` correspondiente, y el escenario describe el comportamiento **tal cual está implementado**, no el que "debería" ser:

1. **`reserva_chat.feature` (@s9)** — Elegir "Es una urgencia" en el primer paso del chat no cambia el guion: sigue preguntando qué día y franja horaria prefieres, igual que para una cita normal. Probablemente no es el comportamiento deseado en producción.
2. **`formulario_contacto.feature`** — El chat de reserva sí avisa de que "la solicitud no se envía a ningún servidor hasta que pulsas WhatsApp"; el formulario de contacto hace exactamente lo mismo (no hay backend real) pero **no tiene ningún aviso equivalente**. Antes de implementar hay que decidir entre añadir el aviso o conectar el formulario a un envío real.
3. **`pie_de_pagina.feature` (@s3)** — Los tres enlaces legales (Aviso legal / Privacidad / Cookies) apuntan los tres a `#faq` como marcador de posición.

También sin verificar con certeza (documentado como tal, sin inventar la respuesta): si al pulsar "Enviar otro mensaje" el formulario recupera los valores ya escritos o aparece vacío — el código del prototipo solo cambia el estado de "enviado", no toca los campos.

## Siguiente paso en vuestro pipeline SDD

Estas specs son el resultado de `spec_partner` + `gherkin_author`. Falta el **gate de aprobación humana** antes de pasar a `tdd_craftsman`. Si me das luz verde (con o sin cambios sobre las 3 incoherencias de arriba), sigo con la implementación siguiendo el stack de `WebEmpresa` (Vite 7 + React 19 + TS + SCSS Modules), del que esta plantilla ya toma prestados los patrones de `Servicios.module.scss` y `Paquetes.module.scss` según `github.md`.
