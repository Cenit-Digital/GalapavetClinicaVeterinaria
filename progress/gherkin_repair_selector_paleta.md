# Reparación — features/selector_paleta.feature

Fuente: `progress/revision/VEREDICTO_selector_paleta.md` (grupo G1). Se
repararon los 3 hallazgos marcados **CONFIRMADO**; el hallazgo sobre @s10
(línea 141) está **REFUTADO** en el veredicto y no se tocó.

## 1. CABECERA, fila `lima` / @s2 (grave) — REPARADO

- **Líneas ~27-38** (bloque "1. DATOS", tabla de variantes y párrafo
  siguiente). Renombrado `lima` de `Lima protagonista` → `Lima de superficie`,
  y su nota de `Lima sobre claro` → `Superficie lima, texto oscuro encima`,
  para que ni el nombre ni la nota puedan leerse como el uso prohibido (lima
  como texto o borde sobre claro). Se añadió un párrafo explícito que cita
  `docs/datos-galapavet.md` §10.1 (1,89:1 no apto para texto/borde; 11,12:1
  negro sobre lima si es superficie) y explica por qué se descarta la palabra
  "protagonista".
- **Línea ~113** (@s2, `Then sus nombres accesibles contienen...`). Cambiado
  el literal `"Lima protagonista"` → `"Lima de superficie"` para que el
  escenario ejecutable use el mismo nombre ya corregido en la cabecera (un
  doble de test anclado al literal escrito a mano, coherente en todo el
  fichero).

## 2. CABECERA, fila `noche` (grave) — REPARADO

- **Línea ~31** (tabla de variantes). Nota de `noche` cambiada de `Morado y
  lima sobre oscuro` (que implicaba que el morado actúa como color legible
  sobre el fondo oscuro, matemáticamente imposible) a `Marca sobre fondo
  oscuro (roles y tokens exactos: PENDIENTE, ver abajo)`: ya no afirma qué
  color hace de texto y cuál de fondo.
- **Líneas ~70-88** (sección PENDIENTE). Reescrito el primer punto para que la
  remisión a `tokens_marca` sea de una sola dirección (`selector_paleta` →
  `tokens_marca`, nunca al revés), rompiendo la referencia circular con
  `tokens_marca.feature` líneas 64-66 (ese fichero no se tocó: está fuera del
  alcance de esta reparación). Se añadió un punto PENDIENTE nuevo que fija,
  como consecuencia mecánica de la aritmética ya verificada en el veredicto
  (ratio máximo del morado `#77286B` contra negro puro = 2,30:1, por debajo
  de 3:1), que la variante "noche" NO puede usar el morado como texto ni
  como borde legible sobre el fondo oscuro — solo como fondo o superficie —,
  sin fijar ningún hexadecimal nuevo (eso lo sigue haciendo `tokens_marca`
  @s16).

## 3. CABECERA general (líneas 2-9, 15-17 originales) — REPARADO

- **Líneas ~1-16** (bloque "FUENTE DEL COMPORTAMIENTO"). La cita de origen
  pasa de un `.dc.html` que no existe en el repositorio a
  `docs/contrato-heredado/selector_paleta.feature`, que sí es el artefacto
  archivado y legible. Se corrigió la descripción de la interacción heredada
  para que cite con precisión ese fichero (`@s1` línea 23: "un botón circular
  flotante ... para cambiar de paleta"; `@s3` línea 35: panel rotulado
  "Paleta de color") y se dejó explícito que el nombre accesible «Cambiar
  paleta de color» del botón flotante es NUEVO de este contrato, no heredado
  (el destilado heredado no fija un nombre accesible formal para ese botón).
- **Líneas ~22-24** (bloque "1. DATOS"). Quitados los descriptores de color
  inventados de las 4 paletas heredadas (`azul cobalto`, `terracota`, `cian
  neón`, `esmeralda`), que no aparecen en ningún artefacto del repositorio.
  Se sustituyen por una cita exacta a `docs/contrato-heredado/selector_paleta.feature`
  `@s3` (líneas 36-37), donde constan los 4 nombres de paleta sin matiz de
  color asociado, y se deja explícito que ese destilado no fija ningún matiz.

## No se tocó

- **@s10** (script de arranque precede al paquete de la aplicación, línea
  ~167-173 tras la reparación): el veredicto lo marca **REFUTADO**, con
  justificación propia de por qué el contrato es satisfacible contra el
  `index.html` fuente sin necesidad de una build real. No se modifica.
- **`tokens_marca.feature`**: fuera del alcance de esta tarea (solo
  `features/selector_paleta.feature`). La referencia circular se resolvió
  desde este lado (una sola dirección hacia `tokens_marca`); si se quiere
  cerrar también del otro lado, requiere una reparación separada sobre
  `tokens_marca.feature`.

## Corrección posterior (verificación de solo lectura): circularidad cerrada también en tokens_marca.feature

Una verificación de solo lectura posterior a esta reparación detectó que la
circularidad solo se había cerrado por un lado (ver punto "No se tocó" justo
arriba): `selector_paleta.feature` ya afirmaba que la referencia era de una
sola dirección hacia `tokens_marca`, pero `tokens_marca.feature` (líneas
69-71, sin tocar hasta ahora) seguía afirmando lo contrario — que "la
variante oscura de la Decisión 8 se contrata en la feature `selector_paleta`"
— es decir, cada fichero remitía la decisión al otro. Contradicción literal
entre dos ficheros del mismo proyecto.

Se corrigió **únicamente** `features/tokens_marca.feature`, líneas 69-71 (el
último punto del bloque PENDIENTE, antes de la línea `Feature: Tokens de
marca...`). El punto pasa de "la variante oscura se contrata en
`selector_paleta`" a fijar explícitamente que los tokens exactos de la
variante oscura (fondo, superficies y qué color hace de texto) se fijan
ÚNICAMENTE en `tokens_marca.feature`, y que `selector_paleta` solo fija
identificadores, rótulos y comportamiento de conmutación, sin proponer ni
remitir ningún valor de color de vuelta a este fichero. Se incorporó también
el mismo hecho aritmético ya citado en el punto 2 de esta reparación y en
`docs/datos-galapavet.md` §10.1: el morado `#77286B` no alcanza 3:1 de
contraste contra ningún fondo más oscuro que él mismo (2,30:1 máximo contra
negro puro), así que la variante "noche" no puede usar el morado como texto
ni como borde legible sobre el fondo oscuro — solo como fondo o superficie,
igual que el lima.

Verificado con `grep "selector_paleta" features/tokens_marca.feature`: la
única mención restante es la nueva frase ("no en `selector_paleta`"), que no
remite ningún valor de color de vuelta. Ambos ficheros dicen ahora lo mismo:
`tokens_marca` es el dueño único de los tokens exactos; `selector_paleta` no
fija ni espera que se le remita ningún color. No se tocó
`features/selector_paleta.feature` ni ningún otro fichero.
