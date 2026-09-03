# TDD — `fidelidad_pie` (36)

Contrato: `features/fidelidad_pie.feature`.

La prueba de navegador nació roja por falta de las marcas de composición.
El verde añade una cuadrícula superior de marca + tres columnas, la fila
logo/nombre, enlaces sin subrayado y una barra legal horizontal. El aviso de
nueva ventana se separó en `nombreVisible` y `nombreAccesible`: permanece en
el árbol accesible y queda recortado visualmente.

Evidencia: unidades Pie 19/19, Playwright 3/3, build verde y Stryker sobre
`PieDePagina-logica.ts`: 21/21 eliminados, 100 %, sin timeouts.
