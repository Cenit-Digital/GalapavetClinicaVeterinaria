/**
 * Lógica de decisión de `Cabecera`, mordible por mutación
 * (`stryker.config.json` muta `src/**\/*-logica.ts`). El componente `.tsx`
 * solo cablea esta lógica; nada aquí toca el DOM.
 *
 * El punto de corte se mide para ESTE diseño (logotipo + descriptor + 8
 * enlaces), no se hereda del prototipo ajeno (1120px, ver
 * `docs/contrato-heredado/cabecera_y_navegacion.feature`).
 */
import { DESTINO_TIENDA } from '../data/navegacion'
export const PUNTO_DE_CORTE_NAVEGACION_PX = 1024

/**
 * Rama móvil si el ancho es estrictamente menor que el punto de corte, o si
 * el ancho todavía no es un número positivo medible (@s14: cae cerrado a
 * móvil en vez de asumir escritorio).
 */
export function esMovil(anchoVentana: number): boolean {
  if (!(anchoVentana > 0)) {
    return true
  }
  return anchoVentana < PUNTO_DE_CORTE_NAVEGACION_PX
}

/**
 * Un destino ancla (p. ej. "#servicios") navega dentro del propio documento:
 * jsdom sí implementa ese caso (`lib/jsdom/living/window/navigation.js`,
 * `navigateToFragment`) y el navegador real lo hace de forma nativa. Un
 * destino de subpágina (p. ej. "/tienda") exige interceptar el clic, porque
 * un `<a>` real disparando una navegación completa no está implementado en
 * jsdom (`navigateFetch` → `notImplemented(window, "navigation to another
 * Document")`).
 */
export function esAncla(destino: string): boolean {
  return destino.startsWith('#')
}

/**
 * ¿Es este destino de navegación el de la ruta activa? Solo aplica a
 * destinos de subpágina: un ancla (p. ej. "#servicios") nunca es "la página
 * actual" en este sentido, navega dentro de la misma página
 * (`pagina_campanas.feature` @s1).
 */
export function esPaginaActual(destino: string, rutaActual: string): boolean {
  return !esAncla(destino) && destino === rutaActual
}

/**
 * ¿Es este el destino de la Tienda? `Cabecera.tsx` la usa para dar al enlace
 * de Tienda un estilo de "borde y sin relleno" (@s28 de
 * `rediseno_visual.feature`), derivado del propio destino — nunca de una
 * prop nueva "es-tienda" que pudiera divergir de `ENLACES_NAVEGACION`.
 */
export function esDestinoTienda(destino: string): boolean {
  return destino === DESTINO_TIENDA
}

/**
 * Nueva posición absoluta de scroll para que un elemento de destino quede
 * justo debajo de la franja fija (barra de urgencias + cabecera) al saltar a
 * una sección (@s28 de `rediseno_visual.feature`). Los tres números SIEMPRE
 * se miden en el momento del clic (`Cabecera.tsx`, con
 * `getBoundingClientRect()`/`window.scrollY`): esta función nunca ve ni
 * produce un número escrito a mano, solo combina los que recibe.
 *
 * @param desplazamientoActual `window.scrollY` en el momento del clic.
 * @param distanciaAlElemento distancia del elemento de destino al borde
 *   superior de la ventana (`elemento.getBoundingClientRect().top`).
 * @param alturaFijaReal altura real de la franja fija —barra de urgencias
 *   más cabecera— medida con `getBoundingClientRect().bottom` de la propia
 *   cabecera, que arranca justo debajo de la barra.
 */
export function posicionDeScrollParaAncla(
  desplazamientoActual: number,
  distanciaAlElemento: number,
  alturaFijaReal: number,
): number {
  return desplazamientoActual + distanciaAlElemento - alturaFijaReal
}
