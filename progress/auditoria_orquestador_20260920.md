# Auditoría del craftsman_lead sobre los contratos de las tandas 1 y 2

> 20/09/2026. El orquestador revisa lo que escribieron los `gherkin_author` y
> comprueba en Chrome cada afirmación medible antes de llevarlas a la puerta
> humana. Lo de abajo son defectos ENCONTRADOS, no sugerencias de estilo.

## A-1 (tanda 1) — @s4 de `fidelidad_cabecera` nacía ciego · YA EN CURSO

Medido sobre `dist/` servido, viewport 1440: `header` ocupa de y=0 a y=65
(`min-height: 64px` de `.interior` MÁS `border-block-end: 1px`), `#root` reserva
`64px` y `#inicio` empieza en `y=64`. **Solape de 1 px.** @s4 se escribió «con
una tolerancia de 1 píxel», que absorbe exactamente ese defecto. Corrección en
curso en la tanda de reconciliación (G1).

## A-2 (tanda 1) — @s3 ampliaba el alcance contra el prototipo · YA EN CURSO

La cláusula «el acceso Tienda del panel se dibuja con la misma píldora que en
escritorio» no la pidió Pablo, y el prototipo pinta ahí una FILA NORMAL
(`padding:13px 12px; border-radius:12px; font-size:16px; font-weight:500;
min-height:46px`, sin borde). Corrección en curso (G2).

## A-3 (tanda 2) — @s14 de `rediseno_visual` contiene un ERROR DE HECHO

Su última cláusula dice que el rótulo «solo aparece tras abrir la pregunta del
FAQ, enviar el formulario de contacto o elegir la urgencia en el chat de
reserva». **Dos de esas tres afirmaciones son falsas.** Medido en Chrome sobre
el estado final simulado (D1+E1+E2), contando sobre `document.body.innerText`:

| Estado | palabra `urgencias` | rótulo `Urgencias fuera de horario` | enlaces `tel:+34918511393` |
| --- | --- | --- | --- |
| Sin interactuar | 0 | 0 | 0 |
| Tras abrir la pregunta del FAQ | **0** | **0** | 1 |
| Tras elegir la urgencia en el chat | 2 | **0** | 2 |
| Tras enviar el formulario | 1 | **1** | 1 |

- El **FAQ** no muestra ni la palabra: su respuesta dice «atención fuera del
  horario de la clínica» (`Faq-logica.ts:67`). Lo que sí aporta es el teléfono
  como enlace de llamada.
- El **chat** dice «urgencias» dos veces, pero nunca el rótulo exacto.
- **Solo la confirmación del formulario** (`FormularioContacto.tsx:72`) pinta el
  rótulo completo.

**Redacción correcta:** «…porque tras la retirada el teléfono de urgencias solo
reaparece de tres formas distintas y ninguna coincide con las otras: como enlace
de llamada al abrir la pregunta del FAQ, SIN el rótulo ni la palabra; como la
palabra "urgencias" al elegir la urgencia en el chat de reserva, SIN el rótulo;
y como rótulo completo únicamente en la confirmación del formulario de
contacto.»

## A-4 (tanda 2) — @s2 del pie registra la asimetría pero no protege lo que la hace aceptable

El escenario nuevo congela los recuentos (4 / 4 / 3 y 11 `listitem`). Eso muerde,
pero NO comprueba nada de lo que hace que un pie 4-4-3 sea correcto, que es
justamente lo que `progress/pie_4-4-3_leyes_uiux_20260920.md` demuestra con
mediciones. Si mañana alguien «arregla» la asimetría estrechando la columna o
dándole otro estilo a los tres enlaces que quedan, los recuentos siguen en verde.

**Cláusulas que faltan**, derivadas de las leyes y ya medidas en los seis anchos
(320 / 700 / 701 / 1023 / 1024 / 1440):

- **Ley de Proximidad y de Conectividad Uniforme** — las tres columnas conservan
  el MISMO ancho entre sí, fijado por la rejilla y no por su contenido, y el
  mismo espaciado interno entre enlaces, en todos los puntos de corte del pie.
- **Ley de la Semejanza** — los enlaces de las tres columnas comparten el mismo
  tamaño de letra y el mismo color; ninguno recibe un estilo distinto por su
  posición.
- **Ley de Fitts** — el alto mínimo de los enlaces del pie no baja al perder un
  ítem.

Con esas tres, el contrato deja de congelar un número y pasa a exigir lo que de
verdad importa, sin perder mordiente.
