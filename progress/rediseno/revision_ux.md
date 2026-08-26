# Auditoría UX — accesibilidad, responsive y rendimiento

**Fecha:** 26/08/2026  
**Alcance:** lectura estática del React/SCSS actualmente presente, contrastada con
`features/rediseno_visual.feature` y el bundle versionado en
`docs/diseno-claude-design/`. No se ha editado producción, tests ni
`feature_list.json`.

## Método y límites

- **Hecho** significa que se puede comprobar directamente en los ficheros
  citados.  
- **Inferencia** significa una consecuencia técnica razonable que debe
  confirmarse en el navegador real antes de cerrar la feature.
- La inicialización del arnés terminó con lint y typecheck correctos antes de
  esta revisión. Esta auditoría no ha reconstruido ni ha modificado el
  artefacto `dist/`; por tanto no afirma métricas finales de CSS, LCP, CLS,
  axe ni reflow.

## Dictamen

La brecha es **estructural y de sistema**, no un re-skin limitado a variables
CSS. Los tokens existentes son una buena base para preservar accesibilidad,
pero el estado actual aún no implementa la geometría, las cinco variantes ni
las anatomías que el contrato aprobado exige. Reutilizar componentes y datos
reales es viable; intentar cerrar la brecha sólo retocando `_tokens.scss` no
lo es.

## Hallazgos verificables

| Prioridad | Área | Hallazgo | Evidencia |
| --- | --- | --- | --- |
| P0 | Sistema visual | Hay cuatro bloques de variante (`marca`, `lima`, `verde`, `noche`), no las cinco variantes de veinte tokens que exige el contrato. No existen `--color-acento`, `--color-urgencia` ni `--color-urgencia-suave`. | **Hecho:** `src/styles/_tokens.scss:59,85,115,151`; contrato @s1–@s12 y @s37. |
| P0 | Geometría | El contenedor compartido mantiene `max-width: 1024px`; el contrato fija 1220px para las seis rutas. | **Hecho:** `src/styles/_api.scss:133-148`; contrato @s17. |
| P0 | Tipografía y ritmo | La escala superior es fija (h1 de portada 48.83px) y el espaciado de secciones usa mayoritariamente 64px. El contrato exige los dos pasos altos fluidos y ritmo vertical alterno/fluidamente escalado. | **Hecho:** `src/styles/_api.scss:18-37`, `src/components/Hero.module.scss`, `src/pages/Landing.module.scss`; contrato @s19–@s22. |
| P0 | Portada | No hay barra fija de urgencias; `Cabecera` solo representa marca, navegación y menú. | **Hecho:** `src/components/Cabecera.tsx:77-115`; contrato @s27–@s28. |
| P0 | Portada | El hero es texto y enlaces; no renderiza imagen ni declara fondo visual. Las tarjetas de servicios tampoco renderizan imágenes ni una categoría visual. | **Hecho:** `src/components/Hero.tsx:39-58`, `src/components/Servicios.tsx:50-55`; contrato @s29–@s31. |
| P0 | Módulos | Equipo no tiene avatar de iniciales; ReservaChat no contiene el bloque editorial izquierdo ni la cabecera de conversación requerida; las secciones no incorporan de forma uniforme cintillos/eyebrows. | **Hecho:** `src/components/Equipo.tsx`, `src/components/ReservaChat.tsx:121-211`; contrato @s32–@s36. |
| P1 | Responsive | Solo existe un punto de corte dimensional explícito, 1024px, destinado a la cabecera. Las rejillas `auto-fit` previenen parte del colapso, pero no hay reglas de composición específicas para el diseño nuevo. | **Hecho:** único `@media (min-width: 1024px)` en `src/components/Cabecera.module.scss:67,111`; el resto de `@media` es de movimiento. **Inferencia:** serán necesarias reglas responsive de cada anatomía nueva, medidas a 320, 768, 1024 y 1440/1600px. |
| P1 | Controles | La base de área táctil es 24×24px. El contrato nuevo pide controles de formulario de 46px, por lo que el tamaño actual es insuficiente como objetivo visual, aunque el mínimo WCAG se conserva. | **Hecho:** `src/styles/_api.scss:81-85`; contrato @s25. |
| P1 | Semántica / navegación | La landing y la página 404 no crean un `<main>`; no hay enlace de salto a contenido en `src/`. Las tres subpáginas sí lo hacen. | **Hecho:** `<main>` aparece únicamente en `PaginaBlog.tsx:245`, `PaginaCampanas.tsx:254` y `PaginaTienda.tsx:309`; `App.tsx` y `Landing.tsx` no lo contienen. **Inferencia:** añadir un único `<main id="contenido-principal">` en el shell y un skip link reduce navegación repetitiva y cubre WCAG 2.4.1. |
| P1 | Formularios | El formulario marca campos inválidos mediante `aria-invalid`, pero al usar `noValidate` no muestra ni asocia mensajes concretos de error, ni mueve foco al primer error. | **Hecho:** `src/components/FormularioContacto.tsx` define `noValidate`, `aria-invalid` y no renderiza descripciones de error. **Inferencia:** usuarios de lector de pantalla reciben el estado, pero no la causa ni la corrección; implementar mensajes con `aria-describedby` y región `role="alert"`. |
| P1 | Pruebas a11y | La prueba axe actual recorre seis rutas, pero no itera las variantes. La feature exige 30 combinaciones (6×5) y cero violaciones. | **Hecho:** `tests/e2e/accesibilidad.spec.ts:20-44`; contrato @s45. |
| P1 | Reflow | Existe prueba de desborde a 320px en la suite heredada, pero la nueva feature aún necesita verificar las seis rutas con sus nuevos módulos. | **Hecho:** contrato @s44 y `tests/e2e/accesibilidad.spec.ts` contiene mediciones de viewport. **Inferencia:** no puede declararse conformidad de reflow al 200%/400% hasta ejecutar las pruebas sobre el CSS nuevo. |
| P2 | Rendimiento React | `App.tsx` importa de forma estática las tres subpáginas y la 404. La portada descarga el código de tienda, blog y campañas aunque el visitante no navegue a ellas. | **Hecho:** `src/App.tsx:7-10` usa imports estáticos. **Inferencia:** `React.lazy`/`Suspense` por ruta reducirá JS inicial; medir antes/después para confirmar el beneficio y mantener un fallback accesible. |
| P2 | Rendimiento en resize | El hook de ancho escucha cada evento `resize` y actualiza el estado del shell; esto re-renderiza el árbol de la ruta durante el arrastre de ventana. | **Hecho:** `src/App.tsx:22-33,76`. **Inferencia:** sustituirlo por CSS donde sea posible y, para la bifurcación necesaria, por `matchMedia` limitado al cruce de 1024px evita renders repetidos. |
| P2 | Imágenes nuevas | Las imágenes existentes que se renderizan ya reservan dimensiones, usan `loading="lazy"` y `decoding="async"`. El hero futuro será el candidato LCP y no debe heredar esa carga diferida. | **Hecho:** patrón actual en `Galeria.tsx`, `CampanasPortada.tsx` y `PaginaBlog.tsx`; el hero no tiene imagen. **Inferencia:** para el hero usar activo local, dimensiones o relación de aspecto reservada, `fetchpriority="high"` y carga no diferida; para el resto, `lazy` y dimensiones intrínsecas. |

## Lo que ya es una base sólida

- El foco visible es global y usa un token por variante:
  `src/styles/global.scss` y `src/styles/_api.scss`.
- Los controles existentes se construyen sobre un mínimo de 24px y los
  botones/iconos tienen nombres accesibles en los casos inspeccionados.
- Las imágenes de contenido ya siguen un patrón de dimensiones, carga
  diferida y decodificación asíncrona; el rediseño debe reutilizarlo.
- Las rejillas con `auto-fit` y `minmax(min(..., 100%), 1fr)` son una buena
  defensa inicial frente a desborde. No sustituyen las pruebas de layout del
  nuevo contrato.
- Se respeta `prefers-reduced-motion` en el CSS actual y la galería consulta
  la preferencia antes de hacer scroll suave.

## Plan de implementación recomendado

1. **Primero, infraestructura contractual.** Sustituir el inventario por las
   cinco variantes × veinte roles, actualizar el selector y las puertas que
   aún prohíben los nuevos tokens. Añadir los tests puros antes de consumir
   los tokens.
2. **Después, geometría y shell.** Definir en tokens la anchura 1220px,
   escalas fluidas limitadas a los dos pasos altos, radios/sombras y alturas
   de control. Crear la barra de urgencias y recalcular desde su altura las
   reservas de scroll/foco.
3. **Reconstruir la portada por anatomías, no por parches.** Hero fotográfico
   local, píldora y CTAs; servicios con fotografía y categoría; equipo con
   avatar de iniciales; reserva en dos columnas; carrusel, contacto y
   cintillos. Conservar estrictamente los datos de `src/lib/site.ts` y
   `src/data/`.
4. **Portar el lenguaje a tienda, campañas y blog.** Aplicar el mismo shell,
   encabezado, tarjetas y jerarquía sin importar textos, precios ni datos
   ficticios del prototipo.
5. **Cerrar las brechas a11y durante cada módulo.** Un `<main>` único y skip
   link, mensajes de error accionables, foco no oculto tras la barra fija,
   targets de 46px para formulario y teclado probado en los nuevos controles.
6. **Medir el artefacto final.** Playwright a 320/768/1024/1440/1600px,
   reflow a zoom, 30 análisis axe (6 rutas × 5 variantes), errores/consola,
   recursos locales, CSS servido y carga de imagen LCP. No sustituir estas
   mediciones con inspección de jsdom.
7. **Optimizar sólo con medida.** Tras el build, comparar peso/tiempos antes
   y después de carga diferida por ruta y de cualquier cambio en el listener
   de resize. Mantener los activos locales y el presupuesto CSS del contrato.

## Referencias de accesibilidad

Las recomendaciones de foco, bypass de bloques, navegación por teclado,
reflow, contraste, etiquetas y tamaños de objetivo se alinean con la
[referencia rápida WCAG 2.2 de W3C](https://www.w3.org/WAI/WCAG22/quickref/),
en particular SC 2.4.1, 2.4.7/2.4.11, 2.5.8, 3.3.1–3.3.3 y 4.1.3.

