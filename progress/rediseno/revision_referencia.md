# Auditoría independiente de referencia — `rediseno_visual`

**Fecha:** 26/08/2026  
**Alcance:** solo lectura de `docs/diseno-claude-design/`, `src/`, las fuentes de datos y `features/rediseno_visual.feature`. No se ha editado producción, tests ni el listado de features.

## Dictamen

La diferencia no es una cuestión de cambiar tres colores. El código actual ya tiene una base de tokens y módulos SCSS, pero implementa una composición editorial distinta: contenedor de 1024 px, escalas fijas, tarjetas mayormente textuales y una cabecera mínima. El diseño de referencia incorpora una barra de urgencias, una cabecera translúcida rica, un hero fotográfico, cintillos, tarjetas con media, más geometrías y tres subpáginas con jerarquía editorial. Por tanto, el contrato aprobado requiere **reconstrucción visual sobre la lógica existente**, no un cambio cosmético de `_tokens.scss`.

El prototipo es referencia de lenguaje visual y estructura; **no es una fuente de datos de negocio**. Sus textos y cifras describen a «Veterinaria La Sierra», no a Galapavet.

## Hechos comprobados

| Área | Prototipo | Implementación actual | Consecuencia de diseño |
| --- | --- | --- | --- |
| Paletas | 4 temas importables: `clinica` implícita en `:root`, `calida`, `tech`, `eco` (`Veterinaria La Sierra.dc.html:18-49`) | 4 variantes distintas: `marca`, `lima`, `verde`, `noche` (`src/styles/_tokens.scss:59-175`) | Hay que sumar/renombrar el sistema según @s1-@s12, preservando `marca`, no «retocar» las cuatro existentes. |
| Roles | `bg`, `bg-2`, `card`, `surface`, tinta/texto, primario, acento, urgencia, sombras | 15 roles de color + 2 sombras; no existen `--color-acento`, `--color-urgencia`, `--color-urgencia-suave` | Los tres roles faltantes bloquean la barra, los CTA de urgencias y el acento saturado. |
| Ancho | 1220 px en cabecera, secciones y páginas (`Veterinaria…:78,143`; subpáginas:72) | `$ancho-maximo-contenedor: 1024px` (`src/styles/_api.scss:133`) | El sitio actual es 196 px más estrecho a desktop. |
| Tipografía | Titular hero fluido hasta 68 px, peso 600, tracking `-.02em` (`Veterinaria…:123`) | Paso 5 fijo de 48.83 px (`_api.scss:28-37`); numerosos encabezados heredan peso/line-height | La escala y el ritmo editorial no pueden coincidir sin actualizar API y reglas de titulares. |
| Espaciado | Secciones alternan `clamp(..., 104px)`, 90 px, etc. (`Veterinaria…:142,183`) | Landing usa 64 px planos (`src/pages/Landing.module.scss:18-35`) | Debe hacerse fluido y con variantes de sección. |
| Media | Hero a sangre y tarjetas de servicios, campañas, tienda y blog con imágenes | Hero y servicios no declaran imagen; campañas/blog/tienda sí usan rutas locales | Hace falta un inventario de activos locales nuevo, nunca URLs Pexels del prototipo. |

## Mapa de módulos: estructura objetivo, selectores actuales y límites de datos

| Módulo/página | Estructura visual de referencia que debe llegar | Selectores/ruta actual | Datos reales que no se pueden alterar | Riesgo de implementación |
| --- | --- | --- | --- | --- |
| Sistema global | Cinco variantes × 20 roles; tres elevaciones; radios de tarjeta, campo, etiqueta, píldora y círculo; tipografía fluida solo en niveles altos | `_tokens.scss`, `_api.scss`, `global.scss`; tokens actuales `marca/lima/verde/noche` | Los 15 hexadecimales existentes de `marca` son contrato previo; fuente de negocio no vive aquí | `rolesDescartados.ts` prohíbe hoy por nombre urgencia y acento; hay que sustituir esa puerta por una que prohíba afirmaciones falsas, no eliminar la protección. |
| Cabecera | Barra superior de urgencias; cabecera sticky/translúcida; marca con icono, navegación, CTA de urgencia y enlace secundario a tienda; panel móvil equivalente | `Cabecera.tsx:77-115`; `.cabecera`, `.navPrincipal`, `.botonMenu`, `.panelMovil` | Nombre `Galapavet`, descriptor, enlaces del catálogo; teléfono/rótulo de urgencias de `datosNegocio` | No copiar «24 h», «todos los días» ni la clínica ficticia. La altura para anclas debe derivarse de barra + cabecera, no de un literal. |
| Landing | Alternancia de fondos y secciones, siempre bajo una retícula de 1220 px; hero y FAQ tienen ancho especial | `Landing.tsx:51-72`; `.seccion`, `.seccionAlterna` | Orden de secciones y anclas actuales | `CampanasPortada` es hoy hijo directo, no envuelto por una clase de sección: debe recibir su propio ritmo/fondo. |
| Hero | Foto de fondo local + velo por tokens, píldora «Galapagar · Madrid», h1 centrado, dos CTAs y banda inferior de cuatro cifras | `Hero.tsx:39-56`; `.hero`, `h1`, `dl` | Localidad/provincia, teléfonos, horarios, servicios; las cuatro cifras deben derivarse, no escribirse | Imagen del prototipo es remota y de otra clínica: no reutilizable. El velo no puede introducir hexadecimales en módulos. |
| Servicios | Cintillo, titular, introducción y grid de 5 tarjetas; cada tarjeta: imagen 16:10, categoría derivada del título, descripción, detalle y pie alineado | `Servicios.tsx:21-55`; `.servicios`, `.tarjeta` | Exactamente los 5 bloques y puntos de `src/data/servicios.ts` | Las fotos requieren activos locales 200; no se puede inventar especialidades, descripciones clínicas ni un sexto servicio. |
| Campañas portada | Bloque a dos columnas sobre fondo alterno: editorial + CTA y tres tarjetas visuales | `CampanasPortada.tsx`; `.campanasPortada`, `ul`, `li` | Las tres campañas demo, sin precio ni vigencia; aviso de demostración | El prototipo enseña precios/vigencias: no se copian. Las imágenes demo siguen teniendo que advertirse. |
| Equipo | Cintillo y grid; tarjeta con avatar de iniciales sobre acento suave, datos reales y detalle solo si existe formación | `Equipo.tsx:21-44`; `.equipo`, `.tarjeta` | Dos profesionales, nombre, rol y formación publicada | El prototipo usa retratos, colegiados e idiomas. Prohibido poner fotos de stock bajo personas reales o inventar credenciales. |
| Reserva por chat | Dos columnas: izquierda con cintillo/titular/ventajas; derecha panel de conversación con avatar, nombre, disponibilidad y sombra | `ReservaChat.tsx:121-210`; `.reservaChat`, `fieldset`, `[role=log]` | Flujo de reserva, teléfonos, horario y aviso de demo sin envío a servidor | No transformar el widget en envío real ni prometer disponibilidad; debe mantenerse su comportamiento y foco. |
| Galería | Cintillo, cabecera y carrusel horizontal snap con controles prev/sig | `Galeria.tsx`; `.galeria`, `.pista`, `figure`, `figcaption` | Seis entradas demo y aviso; no presentar fotos como pacientes reales | Mantener aviso de demostración y consentimiento pendiente. Las imágenes deben ser locales, no Pexels. |
| Formulario/contacto | Desktop: tarjeta de formulario a la izquierda; a la derecha tarjeta de urgencia y, bajo ella, mapa + cuatro bloques; versalitas de rótulo | `FormularioContacto.tsx`, `InformacionContacto.tsx:52-99`; `.formulario`, `.confirmacion`, `.informacionContacto` | Sin email ni redes; dirección, tres teléfonos, horario y rótulo real de urgencias | El iframe de OpenStreetMap es la excepción existente de tercero: @s46 exige definir si la puerta lo permite; no puede aparecer correo ni coordenadas inventadas. |
| FAQ | Cabecera editorial estrecha, cintillo y acordeón; conservar el comportamiento accesible | `Faq.tsx`; `.faq`, `button`, `section` | Preguntas y respuestas aprobadas | No crear textos de respuesta propios ni degradar teclado/aria-expanded. |
| Selector | Cinco variantes, muestras tomadas del token resuelto y persistencia | `SelectorPaleta.tsx`; `.selector`, `.panel`, `.muestra` | Preferencia persistida es comportamiento existente | Catálogo y variante por defecto están duplicados actualmente entre datos, lógica y `index.html`; hay que centralizarlos para @s10/@s37. |
| Pie | Pie sobrio de retícula 1220, marca, enlaces y datos reales | `PieDePagina.tsx`; `.pie`, `.interior`, `.marca`, `.barraInferior` | Logo, enlaces legales, contacto y ausencia de redes | No sustituir logo por el icono ficticio del prototipo ni añadir redes/email. |
| Tienda | Cabecera de página con cintillo; filtros; tarjetas media + etiqueta + precio demo; cesta visualmente elevada | `PaginaTienda.tsx`; `.pagina`, catálogo, `.dialogoCesta` | Catálogo, categorías, imágenes, precios marcados como ejemplo y comportamiento de cesta | No cambiar productos/categorías/semántica de precios. Las imágenes existentes deben conservar dimensiones y ruta bajo base GitHub Pages. |
| Campañas | Encabezado editorial, grid de fichas; detalle de una campaña con tarjeta/CTA sin precio/plaza/vigencia | `PaginaCampanas.tsx`; `.pagina`, `.llamadasAAccion`, `.otrasCampanas` | Campañas demo, puntos derivados de servicios y aviso | El detalle del prototipo es comercial y no es trasladable; no introducir precio, ahorro, duración ni plazas. |
| Blog | Header/cintillo, filtros, destacado y grid con imagen/categoría; artículo con ancho de lectura, imagen y CTA | `PaginaBlog.tsx`; `.pagina`, `.cierreArticulo`, `.sigueLeyendo` | Seis artículos demo, prosa/aviso y ausencia de autor, firma, fecha o iniciales | El prototipo tiene autoría y artículos clínicos de otra entidad: no se copia. El actual listado no pinta imágenes: se deben incorporar sin alterar el tipo/aviso. |

## Datos que son inmutables durante el rediseño

- `src/lib/site.ts`: identidad, dirección en Galapagar, teléfonos `91 082 92 67`, `685 34 31 49`, `91 851 13 93`, horario y rótulo exacto «Urgencias fuera de horario»; email, redes y coordenadas permanecen ausentes.
- `src/data/servicios.ts`: cinco servicios, no los doce del prototipo.
- `src/data/equipo.ts`: Marcos Pérez y Joaquín Herranz; solo la formación publicada; nunca fotos, idiomas ni colegiaciones inventadas.
- `src/data/campanas.ts`, `galeria.ts`, `blog.ts`, `tienda.ts`: catálogos y avisos de demostración; campañas sin precio/vigencia/plazas, blog sin autoría atribuida, fotos de galería sin pretender que sean pacientes reales.
- El bundle de referencia contiene datos prohibidos para producción: «Veterinaria La Sierra», Miraflores, sus teléfonos, email, 24 h/365, 12 servicios, 6 profesionales y nueve fotos. Son datos de comparación, nunca contenido a reutilizar.

## Riesgos y contradicciones por escenario

| Escenarios | Riesgo/contradicción que el implementador debe resolver o preservar |
| --- | --- |
| @s1-@s3 | Cambio estructural del inventario: pasar de 17 a 20 roles y de cuatro variantes actuales a cinco nuevas. Los valores importados deben leerse del HTML versionado, no copiarse a mano desde una captura. |
| @s4-@s5 | `marca` tiene que conservar sus quince hexadecimales; los tres roles nuevos deben tener derivación demostrable. «Rojo semántico» de @s5 no autoriza convertir la marca de Galapavet en roja. |
| @s6-@s9 | `calida` necesita corregir contraste; `tech` no puede usar blanco sobre urgencia; borde-control y foco no existen en el prototipo y deben derivarse WCAG. Es una adaptación deliberada, no una copia literal. |
| @s10-@s12 | Hay duplicación actual de la variante por defecto/catálogo y el `:root` de emergencia solo espeja tres tokens de `marca`. Debe pasar a `clinica` completo sin crear una sexta variante. |
| @s13-@s16 | Contradicción explícita con `identidad_visual`: `rolesDescartados.ts` prohíbe los nuevos nombres. La enmienda debe detectar las afirmaciones falsas, mantener el único rótulo/telefono real y validar que el acento no sea tinta/borde. |
| @s17-@s19 | El ancho 1220, los máximos estrechos y espaciado fluido contradicen el contenedor 1024 y padding 64 actuales. El ancho y las escalas Sass/TS requieren pruebas de sincronía: hoy no están acoplados por test. |
| @s20-@s22 | Los pasos altos deben ser `clamp` y encabezados peso 600/tracking/line-height propio. No tocar los seis pasos bajos ni el interlineado de prosa del artículo. |
| @s23-@s25 | Se necesitan radios/sombras/controles reales medibles. Existe además un defecto actual: `espaciado(20)` se usa en `@mixin boton-fantasma`, pero 20 no existe en la escala de `_api.scss`; Sass omite ese padding. |
| @s26 | El breakpoint actual es 1024 en CSS y TS. El rediseño lo eleva; cualquier cambio debe modificar ambos y probar la cabecera completa, con barra y dos acciones, sin solapamiento. |
| @s27-@s28 | La anatomía de barra + CTA urgencias no existe. Debe usar el dato real y respetar reduced motion; la cabecera actual no contiene tienda/urgencias ni mide su altura compuesta. |
| @s29-@s31 | Hero y servicios no tienen media. Cada activo nuevo requiere inventario, dimensiones, carga, `hrefDeDestino`, origen propio y alternativas de texto correctas. No usar URLs Pexels del prototipo. |
| @s32 | El objetivo es avatar de iniciales, no retratos; protege el escenario previo que exige cero imágenes en el equipo. |
| @s33-@s36 | Cintillos, dos columnas de chat y composición de contacto son cambios de DOM/SCSS, no solo tokens. Se deben conservar FAQ/chat/formulario y sus contratos de accesibilidad, aviso demo, no-email y único teléfono de urgencia. |
| @s37 | El selector actual ofrece cuatro variantes de otra taxonomía. Sus muestras están construidas desde una lista de colores inline, por lo que deberá pasar a tokens sin romper localStorage. |
| @s38 | Reutilizar el catálogo y conducta de cesta; la referencia de tienda incluye contenido y promesas diferentes. |
| @s39 | La referencia muestra precios, ahorro, plazas y vigencia; el contrato de Galapavet los prohíbe. Solo se porta la jerarquía visual de ficha/tarjeta. |
| @s40 | El prototipo atribuye artículos a personal y muestra fechas/iniciales; el contrato actual lo impide. Imagen/categoría/retícula se portan, autoría no. |
| @s41 | La prueba debe verificar exactamente cuatro pantallas más motor/documentación; no depender de `hint-placeholder-count`, que no representa datos reales. |
| @s42 | Verificar valores computados en navegador para las cinco variantes, no solo la sintaxis de Sass. |
| @s43-@s44 | Todo medio nuevo debe ser local y todas las seis rutas deben seguir sin 404 ni desbordamiento a 320 px; imágenes de fondo también cuentan. |
| @s45-@s47 | Matriz exigente: 30 combinaciones axe, seis rutas, interacciones y consola limpia. El mapa OpenStreetMap existente debe quedar explícitamente excluido/permitido de forma coherente para no producir un falso incumplimiento de @s46. |
| @s48 | El CSS actual tenía margen limitado frente a 8000 B; los cinco temas y nuevos módulos pueden agotarlo. El techo debe permanecer en un único test/configuración. |
| @s49-@s50 | Barrido anti-clínica ficticia y recuentos reales: cinco servicios, dos personas, seis fotos. No usar conteos de placeholders del editor. |
| @s51 | Las cuatro cifras son nueva lógica derivada, no copy. Debe decidirse de qué datos verificables proceden; si un dato no existe, no se sustituye por una cifra plausible. |
| @s52 | Cierre semántico: no 24 h, 365 ni disponibilidad continua. Es compatible con «Urgencias fuera de horario» y su teléfono, no con el texto del prototipo. |

## Orden técnico recomendado para quien implemente

1. Añadir primero pruebas de coherencia hoy ausentes: catálogo/default de variantes, escalas Sass/TS y ancho de contenedor.
2. Resolver @s1-@s16 como una unidad: tokens, default, contraste y puerta semántica de urgencias.
3. Reparar la API geométrica y aplicar @s17-@s26 antes de reconstruir módulos.
4. Reestructurar landing por módulos, con nuevos activos locales inventariados, conservando datos y contratos de cada componente.
5. Aplicar el mismo patrón de tarjeta/cintillo a tienda, campañas y blog sin importar datos editoriales del prototipo.
6. Cerrar con las puertas de navegador @s41-@s52: fidelidad, red, consola, accesibilidad, peso y datos reales.

## Conclusión operativa

El contrato es viable sobre el repositorio actual porque sus componentes y la lógica de negocio ya están separados de los estilos. No es viable como «solo tokens»: al menos cabecera, hero, servicios, reserva, contacto y los listados de subpágina requieren DOM y SCSS nuevos. La frontera segura es clara: se puede portar la composición, geometría, paleta y patrones de interacción; no se pueden portar nombres, teléfonos, promesas de disponibilidad, cifras, autorías, precios no confirmados ni imágenes remotas del prototipo.
