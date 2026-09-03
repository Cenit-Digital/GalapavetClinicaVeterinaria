# TDD — feature 26 `fidelidad_lienzo`

Fecha: 03/09/2026. Contrato humano: `features/fidelidad_lienzo.feature`.

## Ciclos rojo → verde

1. **Escala de espaciado (@s3).** Se añadió primero el inventario que recorre
   los SCSS de producción y compara cada `espaciado(n)` contra
   `ESCALA_DE_ESPACIADO_PX`. Dio rojo al encontrar 22 usos de `espaciado(20)`,
   un paso inexistente. Se sustituyeron por los pasos válidos más próximos
   según el control (16 o 24 px); el test quedó verde.
2. **Estructura de bandas (@s1).** Se añadió el test de `Landing` que exige
   hero marcado a sangre y un único wrapper semánticamente neutro para los dos
   paneles de contacto. Dio rojo porque el marcado no existía. Se introdujo el
   wrapper y las clases de banda; quedó verde.
3. **Alineación de cabecera (@s1).** Se añadió el test que exige un único
   contenedor interior de cabecera con marca y navegación. Dio rojo porque la
   cabecera no tenía esa caja. Se añadió `data-cabecera-interior` y el
   contenedor de 1220 px; quedó verde.
4. **Contrato visual ejecutable (@s1–@s4).** `tests/e2e/fidelidad-lienzo.spec.ts`
   mide navegador y build reales: bandas, anchos, fondo computado, selectores
   de id y móvil. El primer intento leyó un `dist/` antiguo reutilizado; tras
   construir, los cuatro escenarios quedaron verdes. La prueba incluye el pie
   en la alineación exigida por @s1.

## Trazabilidad de escenarios

| Escenario | Pruebas que lo muerden |
| --- | --- |
| @s1 | `Landing.test.tsx`, `Cabecera.test.tsx`, `fidelidad-lienzo.spec.ts` |
| @s2 | `fidelidad-lienzo.spec.ts` (fondos computados de las siete bandas) |
| @s3 | `escalaEspaciado.test.ts`, `fidelidad-lienzo.spec.ts` |
| @s4 | `fidelidad-lienzo.spec.ts` y puerta de build/CSS |

No se ha modificado todavía la anatomía del hero ni de las secciones: cada una
tiene contrato propio posterior para evitar que el cimiento oculte cambios de
contenido.
