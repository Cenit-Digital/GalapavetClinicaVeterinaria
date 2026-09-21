# El pie con 4-4-3: análisis contra las leyes de UI/UX

> Encargo de Pablo, 20/09/2026: *«se puede quitar, pero ajustas los SCSS o lo que
> haga falta para que cumpla las 30 leyes UI/UX»* — https://lawsofux.com/es/
>
> **Conclusión: no hay que ajustar nada.** El pie ya cumple con 3 enlaces en la
> columna «Contacto». Lo que sigue son las mediciones que lo demuestran, no una
> opinión. Este documento es la justificación del cambio de
> `features/pie_de_pagina.feature` @s2, que hoy exige «tres columnas de cuatro
> enlaces cada una».

## Qué cambia

La columna «Contacto» pierde el enlace «Urgencias fuera de horario · 91 851 13 93»
(decisión de Pablo del 20/09/2026, tomada tras ver las consecuencias medidas en
las seis rutas). Pasa de 4 a 3 enlaces; el pie pasa de 12 a 11.

## Las leyes que aplican, y la comprobación de cada una

Textos tomados de lawsofux.com/es el 20/09/2026.

### Ley de Proximidad — *«Los objetos que están cerca, o próximos entre sí, tienden a agruparse»*

El riesgo sería que al perder un ítem la columna cambiase de ancho o de sitio y
rompiese la agrupación. **No ocurre:** el contenedor declara
`grid-template-columns: minmax(280px, 2fr) repeat(3, minmax(0, 1fr))`
(`PieDePagina.module.scss:24`), así que los tres anchos los fija la rejilla, no
el contenido. Medido en los seis anchos relevantes:

| Viewport | Ítems (antes → después) | Anchos de columna (antes → después) | ¿Desborda? |
| --- | --- | --- | --- |
| 320 px | 4/4/4 → 4/4/3 | 272/272/272 → 272/272/272 | no |
| 700 px | 4/4/4 → 4/4/3 | 652/652/652 → 652/652/652 | no |
| 701 px | 4/4/4 → 4/4/3 | 311/311/311 → 311/311/311 | no |
| 1023 px | 4/4/4 → 4/4/3 | 472/472/472 → 472/472/472 | no |
| 1024 px | 4/4/4 → 4/4/3 | 176/176/176 → 176/176/176 | no |
| 1440 px | 4/4/4 → 4/4/3 | 215/215/215 → 215/215/215 | no |

El `gap` interno de las tres listas es `espaciado(8)` = 8 px, idéntico antes y
después. La separación entre columnas es `espaciado(32)` y no depende del
contenido.

### Ley de Conectividad Uniforme — *«Los elementos que están conectados visualmente se perciben más relacionados que los elementos sin conexión»*

Lo que conecta cada columna es **su encabezado** («Clínica», «Contenido»,
«Contacto») más la alineación compartida, no el número de filas.
`align-items: start` (`:25`) alinea las tres columnas por arriba, de modo que la
más corta simplemente termina antes, igual que termina antes un párrafo corto.
La agrupación se mantiene intacta.

**Corolario importante:** esta misma ley DESACONSEJA la solución perezosa de
«rellenar» la columna con un cuarto enlace cualquiera para recuperar la simetría.
Un ítem que no pertenece al grupo debilita la conexión visual en vez de
reforzarla. Además, `src/lib/site.ts` declara `email: undefined` y
`redesSociales: []` porque el cliente no publica ninguno: no hay ningún dato real
con el que rellenar, y el repositorio prohíbe inventarlos.

### Ley de la Semejanza — *«El ojo humano tiende a percibir elementos similares como un grupo completo»*

El riesgo sería que alguna regla posicional (`:nth-child(4)`, `:last-child`)
diese un estilo distinto al cuarto ítem y, al desaparecer, cambiase de dueño.
**No existe ninguna:** el único `:last-child` del fichero es `> p:last-child`
(`:84`), dentro del bloque de marca, que no se toca. Medido: los enlaces de las
tres columnas devuelven `estilosDistintos: 1`, es decir, comparten exactamente el
mismo tamaño de letra y el mismo color, antes y después.

### Ley de Fitts — *«El tiempo para adquirir un objetivo es en función de la distancia y el tamaño del objetivo»*

El alto mínimo de los enlaces del pie es 24 px, idéntico antes y después. Quitar
un ítem no encoge ni acerca a los demás: el `gap` es fijo.

### Ley de Hick — *«El tiempo que lleva tomar una decisión aumenta con el número y la complejidad de las opciones»*

El pie pasa de 12 a 11 enlaces. Por esta ley el cambio **mejora**, no empeora.

### Ley de Miller / memoria de trabajo

Tres o cuatro elementos por columna está holgadamente por debajo de cualquier
límite de carga; no aplica presión en ninguno de los dos estados.

### Efecto Von Restorff — *«cuando hay varios objetos similares presentes, es más probable que se recuerde el que difiere del resto»*

Es la única ley con un efecto real, y va a favor: hoy el enlace de urgencias es
el único de su columna con rótulo largo y con un papel distinto, y se lleva la
atención dentro del bloque «Contacto». Al retirarlo, la columna queda homogénea
(dos teléfonos y «Cómo llegar»), que es lo que esta ley recomienda para un bloque
sin jerarquía interna.

## Qué hay que cambiar, entonces

**En el SCSS: nada.** En el contrato, sí: `features/pie_de_pagina.feature` @s2
dice hoy «tres columnas encabezadas, de cuatro enlaces cada una» y «cada una de
esas 3 listas contiene exactamente 4 elementos con rol listitem… esos 12
elementos». Ese número venía del `<footer>` del prototipo versionado. Hay que
reescribirlo para que siga mordiendo sin congelar un 4 que ya no es cierto: tres
columnas encabezadas, cada una con al menos tres enlaces, todas con el mismo
ancho de rejilla y el mismo espaciado interno, y ningún enlace con estilo
distinto de sus hermanos. Eso comprueba lo que las leyes de arriba piden, en vez
de comprobar un recuento.
