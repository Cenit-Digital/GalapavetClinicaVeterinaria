/**
 * Catálogo de demostración del blog. Contenido editorial de demo bajo la
 * Decisión 1(b) de `project-spec.md`: Galapavet no ha escrito ningún
 * artículo (`docs/datos-galapavet.md` §7), así que estas seis entradas son
 * texto de ejemplo genérico, sin firma, sin fecha y sin ninguna afirmación
 * sobre el negocio (`features/pagina_blog.feature`, reglas R1/R2/R3 de la
 * cabecera). El modelo de datos NO declara ningún campo de autor, firma ni
 * iniciales (R1): no hay nada que omitir, la forma del tipo ya lo impide.
 *
 * Las categorías son, literalmente, los cinco bloques de servicio publicados
 * (`src/data/servicios.ts`), y el orden/identificador/título/categoría de
 * las seis entradas reproduce carácter a carácter la tabla del Background de
 * `features/pagina_blog.feature`.
 *
 * PENDIENTE (cabecera del `.feature`): el texto editorial final y las
 * fotografías reales quedan pendientes de una revisión veterinaria que este
 * arnés no puede dar; estas rutas de imagen son provisionales, mismo
 * PENDIENTE que `src/data/galeria.ts`/`src/data/campanas.ts`.
 */
export interface BloqueParrafo {
  readonly tipo: 'parrafo'
  readonly texto: string
}

export interface BloqueEncabezado {
  readonly tipo: 'encabezado'
  readonly texto: string
}

export interface BloqueCita {
  readonly tipo: 'cita'
  readonly texto: string
}

/** Los tres tipos de bloque que admite el cuerpo de un artículo (@s16): párrafo, encabezado y cita. */
export type BloqueDeCuerpo = BloqueParrafo | BloqueEncabezado | BloqueCita

/**
 * R1 (cabecera del `.feature`): este tipo NO declara `autor`, `firma` ni
 * `iniciales` — ni siquiera como campo opcional. `construirCatalogoBlog`
 * (`PaginaBlog-logica.ts`) rechaza cualquier valor que sí los declare.
 */
export interface ArticuloDemo {
  readonly identificador: string
  readonly titulo: string
  readonly categoria: string
  readonly imagen: string
  readonly textoAlternativoImagen: string
  readonly cuerpo: readonly BloqueDeCuerpo[]
}

function parrafo(texto: string): BloqueParrafo {
  return { tipo: 'parrafo', texto }
}

export const ARTICULOS_DEMO: readonly ArticuloDemo[] = [
  {
    identificador: 'demo-1',
    titulo: 'Artículo de demostración 1',
    categoria: 'Medicina general',
    imagen: '/img/blog/demo-1.webp',
    textoAlternativoImagen: 'Fotografía de un perro tumbado sobre una manta en una sala de consulta.',
    cuerpo: [
      parrafo(
        'Un chequeo periódico ayuda a detectar cambios en la salud de un animal antes de que se conviertan en un problema mayor.',
      ),
      parrafo(
        'Llevar un registro del peso, el apetito y el comportamiento facilita la conversación con cualquier profesional veterinario.',
      ),
    ],
  },
  {
    identificador: 'demo-2',
    titulo: 'Artículo de demostración 2',
    categoria: 'Medicina general',
    imagen: '/img/blog/demo-2.webp',
    textoAlternativoImagen: 'Fotografía de un gato sentado junto a una ventana.',
    cuerpo: [
      parrafo('La calidad de vida de un animal doméstico depende en buena parte de la rutina diaria que lleva en casa.'),
      parrafo('Pequeños cambios en la alimentación o el ejercicio pueden notarse en pocas semanas.'),
    ],
  },
  {
    identificador: 'demo-3',
    titulo: 'Artículo de demostración 3',
    categoria: 'Medicina general',
    imagen: '/img/blog/demo-3.webp',
    textoAlternativoImagen: 'Fotografía de un cachorro jugando con una pelota en un jardín.',
    cuerpo: [
      parrafo(
        'Los primeros meses de un cachorro son una etapa de aprendizaje constante, tanto para él como para su familia.',
      ),
      parrafo('Establecer rutinas claras desde el principio suele facilitar la convivencia más adelante.'),
    ],
  },
  {
    identificador: 'demo-4',
    titulo: 'Artículo de demostración 4',
    categoria: 'Análisis',
    imagen: '/img/blog/demo-4.webp',
    textoAlternativoImagen: 'Fotografía de un tubo de muestra sobre una mesa de laboratorio.',
    cuerpo: [
      parrafo('Una analítica ofrece una fotografía del estado interno de un animal en un momento concreto.'),
      parrafo(
        'Comparar varios resultados a lo largo del tiempo suele aportar más información que una sola medición aislada.',
      ),
    ],
  },
  {
    identificador: 'demo-5',
    titulo: 'Artículo de demostración 5',
    categoria: 'Análisis',
    imagen: '/img/blog/demo-5.webp',
    textoAlternativoImagen: 'Fotografía de un microscopio sobre una mesa de trabajo.',
    cuerpo: [
      parrafo('Algunos cambios en el organismo de un animal no se aprecian a simple vista y solo aparecen en un análisis.'),
      parrafo('Por eso conviene describir cualquier síntoma, por pequeño que parezca, antes de interpretar un resultado.'),
    ],
  },
  {
    identificador: 'demo-6',
    titulo: 'Artículo de demostración 6',
    categoria: 'Especialidades',
    imagen: '/img/blog/demo-6.webp',
    textoAlternativoImagen: 'Fotografía de una radiografía sobre una pantalla iluminada.',
    cuerpo: [
      parrafo('Algunas dolencias requieren una mirada más especializada que la de una consulta general.'),
      parrafo('Contar con varias disciplinas dentro del mismo centro facilita el seguimiento de un caso concreto.'),
    ],
  },
] as const satisfies readonly ArticuloDemo[]
