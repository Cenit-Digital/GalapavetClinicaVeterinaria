# Verificación final responsive — 03/09/2026

## Matriz ejecutada

- Teléfonos: 320, 360, 375, 390 y 414 px.
- Intermedios y tabletas: 480, 600, 768, 820 y 900 px.
- Bordes: pie en 700/701/1023/1024 px; cabecera en 1023/1024 px.
- Escritorio: 1280, 1440 y 1600 px.
- Barrido adicional: cada 16 px de 320 a 1600 (81 anchos).

En todos los casos Playwright comprobó ausencia de overflow de documento y de
errores de consola; ningún elemento visible salió de la ventana salvo la pista
de galería, que es un scroll horizontal intencional y focalizable.

## Capturas

- `../rediseno/capturas/responsive_integral_390.png`: teléfono, orden y lectura.
- `../rediseno/capturas/responsive_integral_1440.png`: composición de escritorio.
- `../rediseno/capturas/responsive_integral_comparativa.png`: referencia a la
  izquierda y producción a la derecha; conserva tono, jerarquía y bandas, con
  los datos reales de Galapavet en vez de los números ficticios del prototipo.

## Puertas finales

- Playwright: 167/167.
- Harness: 89 archivos, 1.416 pruebas, lint y TypeScript.
- Build: 10,41 kB CSS gzip de 12 kB permitidos; sin terceros.
