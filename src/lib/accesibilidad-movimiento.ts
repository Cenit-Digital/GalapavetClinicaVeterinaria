/**
 * Comprobación de visibilidad sin animación (Bloque D,
 * `features/accesibilidad.feature` @s20) — SC 2.3.3 / técnica C39. Evalúa un
 * inventario de bloques que en condiciones normales aparecen mediante una
 * animación de entrada, y falla si alguno queda invisible cuando esa animación
 * no se ejecuta (Invariante 4: `estado-base-visible-ssg-reduced-motion` — el
 * estado base en CSS es el estado final visible).
 *
 * La animación CSS en curso en sí (@s19) y el resto de @s21/@s22 exigen
 * interrogar el motor de animaciones con las hojas de estilo aplicadas: eso
 * es competencia del navegador real (Decisión 11, project-spec.md).
 */

import { leerEstilos, type DeclaracionLeida } from './diseno/lectorDeEstilos'

export interface BloqueQueApareceAnimando {
  readonly nombre: string
  /** Si el contenido de este bloque está en el DOM/visible incluso si su animación no llega a ejecutarse. */
  readonly visibleSinAnimacion: boolean
}

export interface InformeDeVisibilidadSinAnimacion {
  readonly pasa: boolean
  readonly bloquesComprobados: number
  readonly bloquesInvisibles: readonly string[]
}

/** Comprueba que ningún bloque animado queda invisible sin su animación (@s20). */
export function ejecutarComprobacionDeVisibilidadSinAnimacion(
  bloques: readonly BloqueQueApareceAnimando[],
): InformeDeVisibilidadSinAnimacion {
  const bloquesInvisibles = bloques.filter((bloque) => !bloque.visibleSinAnimacion).map((bloque) => bloque.nombre)

  return { pasa: bloquesInvisibles.length === 0, bloquesComprobados: bloques.length, bloquesInvisibles }
}

/**
 * EL INVENTARIO SE LEE DEL SITIO REAL (@s20 de `accesibilidad.feature`: «el
 * inventario de bloques que se recorre se lee del sitio real, nunca de una lista
 * escrita en el propio test»). Hasta la feature 39 la única puerta de @s20 se
 * alimentaba de un literal sintético de dos entradas escritas en el propio test,
 * que es justo lo que esa cláusula prohíbe: no podía ponerse roja ni antes ni
 * después de retirar las animaciones. Lo que sigue recorre el TEXTO REAL de las
 * hojas de estilo del sitio y devuelve, una por una, las apariciones animadas
 * que declaran.
 */
export interface HojaDeEstilos {
  readonly ruta: string
  readonly contenido: string
}

export interface InventarioDeAparicionesAnimadas {
  /** Al menos una aparición animada, todas de una hoja autorizada. */
  readonly pasa: boolean
  readonly hojasInspeccionadas: number
  readonly bloques: readonly BloqueQueApareceAnimando[]
  /** Se declara por escrito, en vez de darse por bueno en silencio sobre una lista vacía. */
  readonly recuentoDeBloquesQueAparecenAnimando: number
  /**
   * Las apariciones de cualquier hoja que NO es la del hero: la aprobación de
   * Pablo del 13/10/2026 cubre la entrada del hero y nada más, así que cualquier
   * otra animación de entrada exige su propia puerta humana.
   */
  readonly bloquesFueraDeLasHojasAutorizadas: readonly string[]
}

/**
 * Las hojas autorizadas a declarar una animación de entrada: SOLO la del hero.
 * Se casa por el final de la ruta, con la carpeta incluida: `import.meta.glob`
 * da `../components/Hero.module.scss`, y un `Hero.module.scss` de otra carpeta, o
 * un `PaginaHero.module.scss`, no es la del hero. El test lo contrasta con un
 * literal escrito a mano.
 */
export const HOJAS_AUTORIZADAS_A_ANIMAR_LA_ENTRADA: readonly string[] = ['/components/Hero.module.scss']

/**
 * Las dos ÚNICAS propiedades que hacen que un bloque "aparezca mediante una
 * animación". Se exige la propiedad COMPLETA, nunca un prefijo suelto: el
 * anulador de `global.scss` declara `animation-duration` y
 * `animation-iteration-count` bajo `prefers-reduced-motion: reduce`, y esas
 * apagan el movimiento en vez de crearlo — contarlas dejaría esta puerta
 * permanentemente roja sobre su propia red de seguridad.
 */
const PROPIEDADES_DE_APARICION_ANIMADA: ReadonlySet<string> = new Set(['animation', 'animation-name'])

/**
 * El estado base que delataría una entrada animada que NO cumple el Invariante
 * 4: una propiedad y el valor con el que deja el contenido invisible. Solo cuenta
 * FUERA de un `@keyframes`: el estado de PARTIDA de la animación (`from {
 * opacity: 0 }`) es oculto por naturaleza y no es un estado base. Se busca en la
 * hoja ENTERA, no en la regla exacta que declara la animación: emparejar
 * declaración y regla exige la cascada real, que es competencia del navegador
 * (Decisión 11, `project-spec.md`). El sesgo es deliberadamente hacia el rojo —
 * una hoja que a la vez anime y oculte se marca para revisión humana en lugar de
 * aprobarse en silencio.
 */
const VALOR_QUE_OCULTA_POR_PROPIEDAD: ReadonlyMap<string, string> = new Map([
  ['opacity', '0'],
  ['visibility', 'hidden'],
])

const SEPARADOR_DE_DECLARACION = ':'
const SIN_APARICIONES = 0

function esUnaAparicionAnimada(declaracion: DeclaracionLeida): boolean {
  return PROPIEDADES_DE_APARICION_ANIMADA.has(declaracion.propiedad)
}

function dejaElEstadoBaseOculto(declaracion: DeclaracionLeida): boolean {
  return (
    !declaracion.bloques.includes('keyframes') &&
    VALOR_QUE_OCULTA_POR_PROPIEDAD.get(declaracion.propiedad) === declaracion.valor
  )
}

function aparicionesAnimadasDe(hoja: HojaDeEstilos): readonly BloqueQueApareceAnimando[] {
  const { declaraciones } = leerEstilos(hoja.contenido)
  const visibleSinAnimacion = !declaraciones.some(dejaElEstadoBaseOculto)

  return declaraciones
    .filter(esUnaAparicionAnimada)
    .map((declaracion) => ({ nombre: `${hoja.ruta}${SEPARADOR_DE_DECLARACION}${declaracion.linea}`, visibleSinAnimacion }))
}

function estaAutorizada(hoja: HojaDeEstilos): boolean {
  return HOJAS_AUTORIZADAS_A_ANIMAR_LA_ENTRADA.some((autorizada) => hoja.ruta.endsWith(autorizada))
}

/**
 * Recorre el texto real de las hojas del sitio y devuelve el inventario de los
 * bloques que aparecen mediante una animación. Desde el 13/10/2026 hay al menos
 * uno (la entrada del hero) y la puerta lo declara por escrito; si el recuento
 * baja a 0 la puerta falla, y si una hoja que no es la del hero aparece en el
 * inventario también.
 */
export function inventariarBloquesQueAparecenAnimando(
  hojas: readonly HojaDeEstilos[],
): InventarioDeAparicionesAnimadas {
  const porHoja = hojas.map((hoja) => ({ hoja, bloques: aparicionesAnimadasDe(hoja) }))
  const bloques = porHoja.flatMap((aparicion) => aparicion.bloques)
  const bloquesFueraDeLasHojasAutorizadas = porHoja
    .filter((aparicion) => !estaAutorizada(aparicion.hoja))
    .flatMap((aparicion) => aparicion.bloques.map((bloque) => bloque.nombre))

  return {
    pasa: bloques.length > SIN_APARICIONES && bloquesFueraDeLasHojasAutorizadas.length === SIN_APARICIONES,
    hojasInspeccionadas: hojas.length,
    bloques,
    recuentoDeBloquesQueAparecenAnimando: bloques.length,
    bloquesFueraDeLasHojasAutorizadas,
  }
}
