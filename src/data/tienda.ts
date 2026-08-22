/**
 * Catálogo de la tienda. Dos partes con orígenes distintos, a propósito:
 *
 * 1. `CATEGORIAS_TIENDA` — dato FIJO del cliente (`docs/datos-galapavet.md`
 *    §6): las cuatro categorías que Galapavet publica. A diferencia de
 *    `pagina_blog` (cuyas categorías derivan de `SERVICIOS`), aquí NO hay
 *    ninguna fuente de la que derivarlas: son un dominio distinto (categorías
 *    de tienda, no bloques clínicos), así que se declaran literales.
 * 2. `PRODUCTOS_DEMO` — contenido de catálogo bajo la Decisión 1(b) de
 *    `project-spec.md`: Galapavet no publica ni un producto ni un precio
 *    (`docs/datos-galapavet.md` §6/§9), así que estas ocho entradas son
 *    demostración, con "de ejemplo" en el propio nombre. Copiadas carácter a
 *    carácter de la tabla del Background de `features/pagina_tienda.feature`.
 *
 * `importeCentimos` se declara YA en céntimos enteros (nunca en euros/coma
 * flotante): es la única forma de que ningún cálculo posterior tenga que
 * parsear ni redondear un importe en euros. El comentario junto a cada valor
 * es la cifra en euros del Background, para trazabilidad humana.
 *
 * PENDIENTE (cabecera del `.feature`): las fotografías de producto son
 * rutas locales provisionales — el contrato solo exige que su origen sea
 * local (@s5); qué se ve en ellas queda a decisión de diseño, mismo
 * PENDIENTE que `src/data/campanas.ts`/`src/data/blog.ts`/`src/data/galeria.ts`.
 */
export interface ProductoDemo {
  readonly nombre: string
  readonly categoria: string
  readonly importeCentimos: number
  readonly imagen: string
}

export const CATEGORIAS_TIENDA: readonly string[] = ['Piensos', 'Paseo', 'Descanso', 'Juegos'] as const

export const PRODUCTOS_DEMO: readonly ProductoDemo[] = [
  {
    nombre: 'Pienso de ejemplo para perro adulto · 3 kg',
    categoria: 'Piensos',
    importeCentimos: 1250, // 12,50 €
    imagen: '/img/tienda/pienso-perro-adulto.webp',
  },
  {
    nombre: 'Pienso de ejemplo para gato esterilizado · 1,5 kg',
    categoria: 'Piensos',
    importeCentimos: 995, // 9,95 €
    imagen: '/img/tienda/pienso-gato-esterilizado.webp',
  },
  {
    nombre: 'Arnés de ejemplo talla M',
    categoria: 'Paseo',
    importeCentimos: 1875, // 18,75 €
    imagen: '/img/tienda/arnes-talla-m.webp',
  },
  {
    nombre: 'Correa de ejemplo de 2 m',
    categoria: 'Paseo',
    importeCentimos: 705, // 7,05 €
    imagen: '/img/tienda/correa-2m.webp',
  },
  {
    nombre: 'Cama de ejemplo talla M',
    categoria: 'Descanso',
    importeCentimos: 2499, // 24,99 €
    imagen: '/img/tienda/cama-talla-m.webp',
  },
  {
    nombre: 'Manta de ejemplo de 60 × 40 cm',
    categoria: 'Descanso',
    importeCentimos: 630, // 6,30 €
    imagen: '/img/tienda/manta-60x40.webp',
  },
  {
    nombre: 'Mordedor de ejemplo de caucho',
    categoria: 'Juegos',
    importeCentimos: 445, // 4,45 €
    imagen: '/img/tienda/mordedor-caucho.webp',
  },
  {
    nombre: 'Pelota de ejemplo con sonido',
    categoria: 'Juegos',
    importeCentimos: 315, // 3,15 €
    imagen: '/img/tienda/pelota-con-sonido.webp',
  },
] as const satisfies readonly ProductoDemo[]
