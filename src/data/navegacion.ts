/**
 * Catálogo estático de los destinos de la navegación principal de `Cabecera`.
 * Fuente: `project-spec.md` §"Arquitectura" (páginas/secciones de este
 * proyecto) y `features/cabecera_y_navegacion.feature` @s4/@s5. El botón rojo
 * "Urgencias" del prototipo heredado NO se incluye (Decisión 2,
 * `project-spec.md`): la cabecera queda con 8 destinos, cero botones de
 * acción.
 */
export interface EnlaceNavegacion {
  readonly nombre: string
  readonly destino: string
}

export const ENLACES_NAVEGACION: readonly EnlaceNavegacion[] = [
  { nombre: 'Reservar', destino: '#reservar' },
  { nombre: 'Servicios', destino: '#servicios' },
  { nombre: 'Campañas', destino: '/campanas' },
  { nombre: 'Equipo', destino: '#equipo' },
  { nombre: 'Blog', destino: '/blog' },
  { nombre: 'Contacto', destino: '#contacto' },
  { nombre: 'FAQ', destino: '#faq' },
  { nombre: 'Tienda', destino: '/tienda' },
] as const satisfies readonly EnlaceNavegacion[]
