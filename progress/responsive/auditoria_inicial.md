# Auditoría responsive inicial — 03/09/2026

## Método

Se sirvió `dist/` mediante un servidor estático que conserva el subpath de
producción `/GalapavetClinicaVeterinaria/`; `vite preview` no se usó como
evidencia porque no monta dicho subpath y devuelve el JavaScript con 404.

Se inspeccionaron 320, 360, 375, 390, 414, 480, 600, 700, 768, 820, 900,
1023, 1024, 1280, 1440 y 1600 px con Chromium. En todos, `scrollWidth` fue
igual a `clientWidth` y la consola no emitió errores.

## Hallazgo

El pie actual usa cuatro columnas hasta `max-width: 700px`. En 768–1023 px no
desborda, pero cada columna queda visualmente comprimida. Es un defecto de
composición de tableta, no de overflow. La feature 38 define tres regímenes:
una columna hasta 700, dos entre 701 y 1023 y cuatro desde 1024.

## Estado

Contrato redactado en `features/fidelidad_responsive_integral.feature`.
No se ha modificado código de producción: falta la puerta humana.
