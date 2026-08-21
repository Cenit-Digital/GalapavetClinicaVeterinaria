import { prefiereMenosMovimiento } from '../components/Galeria-logica'

/**
 * Comportamiento de desplazamiento compartido por cualquier subpágina que
 * cambie de vista sin recargar (`pagina_blog.feature` @s29). Envuelve
 * `prefiereMenosMovimiento` (`Galeria-logica.ts`), que ya falla cerrado a
 * "prefiere menos movimiento" cuando la consulta no está disponible — mismo
 * patrón que `decidirComportamientoDesplazamiento` de `PaginaCampanas-logica.ts`,
 * extraído aquí para no triplicarlo literalmente en una tercera página.
 */
export type ComportamientoDesplazamiento = 'auto' | 'smooth'

export function decidirComportamientoDesplazamiento(
  consultarMedios: typeof window.matchMedia | undefined,
): ComportamientoDesplazamiento {
  return prefiereMenosMovimiento(consultarMedios) ? 'auto' : 'smooth'
}
