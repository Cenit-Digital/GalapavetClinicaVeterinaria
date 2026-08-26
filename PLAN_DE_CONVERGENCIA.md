# Plan de convergencia visual — Galapavet

## Resultado buscado

La web que se publica en GitHub Pages debe adoptar el lenguaje visual del
prototipo de Claude Design, conservando de forma estricta los datos y las
limitaciones reales de Galapavet. No se copiarán textos, recuentos, personas,
precios, disponibilidad ni promesas del prototipo.

## Estado verificado

El 26/08/2026 se contrastaron el prototipo y el sitio desplegado en navegador
real. La diferencia es estructural, no cosmética: el contenido útil medido es
976 px frente a 1220 px, el hero no tiene fotografía ni la banda de apertura,
los titulares son más pequeños y pesados, el ritmo de las secciones es plano
y faltan tres roles de color, seis formas y dos niveles de elevación.

La evidencia y las fuentes reproducibles están en:

- `progress/rediseno_mediciones_navegador.md`
- `progress/rediseno/medicion_sistema_visual.md`
- `progress/rediseno/matriz_delta.md`
- `docs/diseno-claude-design/`

## Límites innegociables

- Los datos de negocio salen únicamente de `src/lib/site.ts` y `src/data/`.
- El sitio no afirmará urgencias 24 h, atención todos los días del año ni
  disponibilidad continua.
- No se usarán fotos de stock como retratos de profesionales reales.
- Las nuevas imágenes se servirán desde `public/`; no se introducirán
  peticiones de terceros.
- Se mantienen las cinco variantes, la accesibilidad WCAG ya validada y las
  seis rutas publicadas.

## Ejecución prevista

1. Completar el sistema: 20 tokens por variante, geometría, tipografía fluida,
   radios, sombras, foco y controles de 44 px.
2. Rehacer la estructura visual de la portada: barra de urgencias con el dato
   real, cabecera, bienvenida con imagen local, cifras derivadas, servicios,
   equipo, reserva, galería, contacto y selector de paleta.
3. Aplicar el mismo sistema a tienda, campañas y blog sin cambiar sus datos ni
   sus advertencias de contenido de demostración.
4. Blindar la fidelidad en navegador real: tokens resueltos, imágenes, rutas
   estrechas, accesibilidad, consola, red y peso de CSS.

El orden de mayor impacto visual medido es: hero, ritmo vertical, ancho de
contenido, formas circulares, CTA/navegación, elevación, campañas y controles.

## Puertas de calidad

La definición ejecutable completa está en `features/rediseno_visual.feature`:
52 escenarios. Antes de cerrar se exigirán pruebas unitarias, navegador real
contra el `dist/`, cero violaciones de axe en 30 combinaciones ruta/variante,
cero errores o avisos de consola, cero peticiones externas, lint, typecheck,
build, mutación al umbral configurado y verificación independiente.

## Punto de control humano

La feature está en estado `spec_ready`. El contrato se debe aprobar de forma
explícita antes de editar producción, conforme a `docs/workflow.md`.
