/**
 * Catálogo estático de los destinos de la navegación principal de `Cabecera`.
 * Fuente: `project-spec.md` §"Arquitectura" (páginas/secciones de este
 * proyecto) y `features/cabecera_y_navegacion.feature` @s4/@s5. El botón rojo
 * "Urgencias" del prototipo heredado NO se incluye como TEXTO (Decisión 2,
 * `project-spec.md`; `Cabecera.test.tsx` sigue vigilando que no aparezca la
 * palabra "Urgencias" visible): el contrato posterior `rediseno_visual.feature`
 * @s28 sí añade un CONTROL de urgencias (sin texto visible, ver
 * `Cabecera.tsx`) y distingue el acceso a la Tienda con un estilo propio.
 */
export interface EnlaceNavegacion {
  readonly nombre: string
  readonly destino: string
}

/**
 * El destino real del enlace de Tienda, para que `Cabecera` derive su estilo
 * de "borde y sin relleno" (@s28 de `rediseno_visual.feature`) del propio
 * dato, en vez de una prop nueva de "es-tienda": los dos usos leen esta
 * MISMA constante, así que no pueden divergir.
 */
export const DESTINO_TIENDA = '/tienda'

export const ENLACES_NAVEGACION: readonly EnlaceNavegacion[] = [
  { nombre: 'Reservar', destino: '#reservar' },
  { nombre: 'Servicios', destino: '#servicios' },
  { nombre: 'Campañas', destino: '/campanas' },
  { nombre: 'Equipo', destino: '#equipo' },
  { nombre: 'Blog', destino: '/blog' },
  { nombre: 'Contacto', destino: '#contacto' },
  { nombre: 'FAQ', destino: '#faq' },
  { nombre: 'Tienda', destino: DESTINO_TIENDA },
] as const satisfies readonly EnlaceNavegacion[]
