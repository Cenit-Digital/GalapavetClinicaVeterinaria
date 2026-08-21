/**
 * Catálogo de demostración de la galería de fotografías. Contenido editorial
 * de catálogo bajo la Decisión 1(b) de `project-spec.md`: Galapavet no ha
 * cedido ninguna fotografía real ni consta consentimiento de las familias
 * fotografiadas (PENDIENTE, ver cabecera de `features/galeria.feature`), así
 * que estas entradas son ficticias y la sección las rotula como
 * demostración (`@s12`). Ninguna menciona un servicio que el cliente no
 * publique (`@s14`) ni afirma que sean pacientes reales (`@s13`).
 *
 * PENDIENTE: los ficheros de imagen locales concretos (`src`) no existen aún
 * en el repositorio — rutas provisionales, deben sustituirse antes de
 * publicar (mismo PENDIENTE que la cabecera del `.feature`).
 */
export interface EntradaGaleria {
  readonly nombre: string
  readonly pie: string
  readonly src: string
}

export const GALERIA: readonly EntradaGaleria[] = [
  { nombre: 'Nala y Coco', pie: 'Primera vacunación', src: '/img/galeria/nala-y-coco.webp' },
  { nombre: 'Bruno', pie: 'Alta tras cirugía de rodilla', src: '/img/galeria/bruno.webp' },
  { nombre: 'Luna', pie: 'Revisión anual', src: '/img/galeria/luna.webp' },
  { nombre: 'Toby', pie: 'Chequeo geriátrico', src: '/img/galeria/toby.webp' },
  { nombre: 'Milo', pie: 'Cita de esterilización', src: '/img/galeria/milo.webp' },
  { nombre: 'Kira', pie: 'Curas tras una intervención', src: '/img/galeria/kira.webp' },
] as const satisfies readonly EntradaGaleria[]
