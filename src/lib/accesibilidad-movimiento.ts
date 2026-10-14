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

import {
  leerFicheros,
  nombreCanonicoDeLaPropiedad,
  rutasSinLecturaFiable,
  valorNormalizado,
  type DeclaracionLeida,
  type FicheroEstilos,
  type FicheroLeido,
} from './diseno/lectorDeEstilos'

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
export type HojaDeEstilos = FicheroEstilos

export interface InventarioDeAparicionesAnimadas {
  /** Al menos una aparición animada, todas de una hoja autorizada, y todas las hojas leídas enteras. */
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
  /** Las hojas que el lector no pudo leer entera: con una sola, la puerta no pasa. */
  readonly hojasSinLecturaFiable: readonly string[]
}

/**
 * La ÚNICA hoja autorizada a declarar una animación de entrada: la del hero. Se
 * casa por el final de la ruta, con la carpeta incluida: `import.meta.glob` da
 * `../components/Hero.module.scss`, y un `Hero.module.scss` de otra carpeta, o un
 * `PaginaHero.module.scss`, no es la del hero. El test lo contrasta con un literal
 * escrito a mano. Es una sola, y no una lista, porque con una lista de un único
 * elemento el `.some` y el `.every` darían lo mismo y la lógica no se podría morder.
 */
export const HOJA_AUTORIZADA_A_ANIMAR_LA_ENTRADA = '/components/Hero.module.scss'

/**
 * Las dos ÚNICAS propiedades que hacen que un bloque "aparezca mediante una
 * animación". Se exige la propiedad COMPLETA, nunca un prefijo suelto: el
 * anulador de `global.scss` declara `animation-duration` y
 * `animation-iteration-count` bajo `prefers-reduced-motion: reduce`, y esas
 * apagan el movimiento en vez de crearlo — contarlas dejaría esta puerta
 * permanentemente roja sobre su propia red de seguridad. Tampoco cuenta una que
 * vale `none` (`animation: none`, `animation-name: none`): no hace aparecer
 * nada, e inflaría la guarda "el recuento es mayor que 0" con una hoja del hero
 * que ya perdió su animación. (`movimientoRespetuoso.ts` da por entrada
 * `animation-name: none` porque su fila firmada lo exige: allí lo que importa es
 * que ningún NOMBRE de fotogramas viva fuera de `no-preference`.)
 */
const PROPIEDADES_DE_APARICION_ANIMADA: ReadonlySet<string> = new Set(['animation', 'animation-name'])
const VALOR_SIN_ANIMACION = 'none'

/**
 * El estado base que delataría una entrada animada que NO cumple el Invariante
 * 4: una propiedad y el criterio con el que su valor deja el contenido invisible.
 * Solo cuenta FUERA de un `@keyframes`: el estado de PARTIDA de la animación
 * (`from { opacity: 0 }`) es oculto por naturaleza y no es un estado base. Se
 * busca en la hoja ENTERA, no en la regla exacta que declara la animación:
 * emparejar declaración y regla exige la cascada real, que es competencia del
 * navegador (Decisión 11, `project-spec.md`). El sesgo es deliberadamente hacia el
 * rojo — una hoja que a la vez anime y oculte se marca para revisión humana en
 * lugar de aprobarse en silencio — y por eso el valor se compara normalizado: `0`
 * se lee escrito `0.0`, `0%` o `0 !important`, y `hidden` en mayúsculas.
 */
const CRITERIO_DE_OCULTACION_POR_PROPIEDAD: ReadonlyMap<string, (valor: string) => boolean> = new Map([
  ['opacity', (valor: string) => Number.parseFloat(valor) === 0],
  ['visibility', (valor: string) => valor === 'hidden'],
])

const SEPARADOR_DE_DECLARACION = ':'
const SIN_APARICIONES = 0

function esUnaAparicionAnimada(declaracion: DeclaracionLeida): boolean {
  return (
    PROPIEDADES_DE_APARICION_ANIMADA.has(nombreCanonicoDeLaPropiedad(declaracion.propiedad)) &&
    valorNormalizado(declaracion.valor) !== VALOR_SIN_ANIMACION
  )
}

function dejaElEstadoBaseOculto(declaracion: DeclaracionLeida): boolean {
  const oculta = CRITERIO_DE_OCULTACION_POR_PROPIEDAD.get(nombreCanonicoDeLaPropiedad(declaracion.propiedad))
  return !declaracion.bloques.includes('keyframes') && oculta !== undefined && oculta(valorNormalizado(declaracion.valor))
}

function aparicionesAnimadasDe(hoja: FicheroLeido): readonly BloqueQueApareceAnimando[] {
  const { declaraciones } = hoja.estilos
  const visibleSinAnimacion = !declaraciones.some(dejaElEstadoBaseOculto)

  return declaraciones
    .filter(esUnaAparicionAnimada)
    .map((declaracion) => ({ nombre: `${hoja.ruta}${SEPARADOR_DE_DECLARACION}${declaracion.linea}`, visibleSinAnimacion }))
}

function estaAutorizada(hoja: FicheroLeido): boolean {
  return hoja.ruta.endsWith(HOJA_AUTORIZADA_A_ANIMAR_LA_ENTRADA)
}

/**
 * Recorre el texto real de las hojas del sitio y devuelve el inventario de los
 * bloques que aparecen mediante una animación. Desde el 13/10/2026 hay al menos
 * uno (la entrada del hero) y la puerta lo declara por escrito; si el recuento
 * baja a 0 la puerta falla, si una hoja que no es la del hero aparece en el
 * inventario también, y también si el lector no pudo leer una hoja entera.
 */
export function inventariarBloquesQueAparecenAnimando(
  hojas: readonly HojaDeEstilos[],
): InventarioDeAparicionesAnimadas {
  const leidas = leerFicheros(hojas)
  const porHoja = leidas.map((hoja) => ({ hoja, bloques: aparicionesAnimadasDe(hoja) }))
  const bloques = porHoja.flatMap((aparicion) => aparicion.bloques)
  const bloquesFueraDeLasHojasAutorizadas = porHoja
    .filter((aparicion) => !estaAutorizada(aparicion.hoja))
    .flatMap((aparicion) => aparicion.bloques.map((bloque) => bloque.nombre))
  const hojasSinLecturaFiable = rutasSinLecturaFiable(leidas)

  return {
    pasa:
      bloques.length > SIN_APARICIONES &&
      bloquesFueraDeLasHojasAutorizadas.length === SIN_APARICIONES &&
      hojasSinLecturaFiable.length === SIN_APARICIONES,
    hojasInspeccionadas: hojas.length,
    bloques,
    recuentoDeBloquesQueAparecenAnimando: bloques.length,
    bloquesFueraDeLasHojasAutorizadas,
    hojasSinLecturaFiable,
  }
}
