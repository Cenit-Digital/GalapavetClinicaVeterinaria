/**
 * Comprobación de visibilidad sin animación (Bloque D,
 * `features/accesibilidad.feature` @s20) — SC 2.3.3 / técnica C39. Evalúa un
 * inventario DECLARADO de bloques que en condiciones normales aparecen
 * mediante una animación de entrada, y falla si alguno queda invisible
 * cuando esa animación no se ejecuta (Invariante 4:
 * `estado-base-visible-ssg-reduced-motion` — el estado base en CSS es el
 * estado final visible).
 *
 * La animación CSS en curso en sí (@s19) y el resto de @s21/@s22 exigen
 * interrogar el motor de animaciones con las hojas de estilo aplicadas: eso
 * es competencia del navegador real (Decisión 11, project-spec.md).
 */

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
 * EL INVENTARIO SE LEE DEL SITIO REAL (`features/accesibilidad.feature:501-503`,
 * @s20, aprobado el 20/09/2026). Hasta la feature 39 la única puerta de @s20 se
 * alimentaba de un literal sintético de dos entradas escritas en el propio
 * test, que es justo lo que `:501` prohíbe: no podía ponerse roja ni antes ni
 * después de retirar las animaciones. Lo que sigue recorre el TEXTO REAL de las
 * hojas de estilo del sitio y devuelve, una por una, las apariciones animadas
 * que declaran.
 */
export interface HojaDeEstilos {
  readonly ruta: string
  readonly contenido: string
}

export interface InventarioDeAparicionesAnimadas {
  readonly pasa: boolean
  readonly hojasInspeccionadas: number
  readonly bloques: readonly BloqueQueApareceAnimando[]
  /** Se declara por escrito, en vez de darse por bueno en silencio sobre una lista vacía (`:502`). */
  readonly recuentoDeBloquesQueAparecenAnimando: number
}

/**
 * Las dos ÚNICAS propiedades que hacen que un bloque "aparezca mediante una
 * animación". Se exige la propiedad COMPLETA seguida de sus dos puntos, nunca
 * un prefijo suelto: el anulador de `global.scss` declara `animation-duration`
 * y `animation-iteration-count` bajo `prefers-reduced-motion: reduce`, y esas
 * apagan el movimiento en vez de crearlo — contarlas dejaría esta puerta
 * permanentemente roja sobre su propia red de seguridad.
 */
const PROPIEDADES_DE_APARICION_ANIMADA: readonly string[] = ['animation', 'animation-name']

/**
 * El estado base que delataría una entrada animada que NO cumple el Invariante
 * 4 (`estado-base-visible-ssg-reduced-motion`). Se busca en la hoja ENTERA, no
 * en la regla exacta que declara la animación: emparejar declaración y regla
 * exige un parser de SCSS y la cascada real, que son competencia del navegador
 * (Decisión 11, `project-spec.md`). El sesgo es deliberadamente hacia el rojo —
 * una hoja que a la vez anime y oculte se marca para revisión humana en lugar
 * de aprobarse en silencio.
 */
const DECLARACIONES_DE_ESTADO_BASE_OCULTO: ReadonlySet<string> = new Set(['opacity:0', 'visibility:hidden'])

const SEPARADOR_DE_DECLARACION = ':'
const FIN_DE_DECLARACION = ';'
const SALTO_DE_LINEA = '\n'
const ESPACIO = ' '
const SIN_ESPACIO = ''
const PRIMERA_LINEA = 1
const SIN_APARICIONES = 0
const NINGUNA_HOJA = 0

/** `  animation : aparecer 300ms ;` → `animation:aparecer300ms`. */
function declaracionNormalizadaEn(linea: string): string {
  return linea.trim().replaceAll(ESPACIO, SIN_ESPACIO).replaceAll(FIN_DE_DECLARACION, SIN_ESPACIO)
}

function declaraUnaAparicionAnimada(linea: string): boolean {
  const declaracion = declaracionNormalizadaEn(linea)
  return PROPIEDADES_DE_APARICION_ANIMADA.some((propiedad) =>
    declaracion.startsWith(`${propiedad}${SEPARADOR_DE_DECLARACION}`),
  )
}

function declaraUnEstadoBaseOculto(hoja: HojaDeEstilos): boolean {
  return hoja.contenido
    .split(SALTO_DE_LINEA)
    .some((linea) => DECLARACIONES_DE_ESTADO_BASE_OCULTO.has(declaracionNormalizadaEn(linea)))
}

function aparicionesAnimadasDe(hoja: HojaDeEstilos): readonly BloqueQueApareceAnimando[] {
  const visibleSinAnimacion = !declaraUnEstadoBaseOculto(hoja)

  return hoja.contenido
    .split(SALTO_DE_LINEA)
    .map((linea, indice) => ({ linea, numero: indice + PRIMERA_LINEA }))
    .filter(({ linea }) => declaraUnaAparicionAnimada(linea))
    .map(({ numero }) => ({ nombre: `${hoja.ruta}${SEPARADOR_DE_DECLARACION}${numero}`, visibleSinAnimacion }))
}

/**
 * Recorre el texto real de las hojas del sitio y devuelve el inventario de los
 * bloques que aparecen mediante una animación. Hoy vale 0 y la puerta lo afirma
 * por escrito (`:502`); si alguien reintroduce una animación de entrada, el
 * recuento sube y la puerta lo caza (`:503`).
 */
export function inventariarBloquesQueAparecenAnimando(
  hojas: readonly HojaDeEstilos[],
): InventarioDeAparicionesAnimadas {
  const bloques = hojas.flatMap(aparicionesAnimadasDe)

  return {
    pasa: hojas.length > NINGUNA_HOJA && bloques.length === SIN_APARICIONES,
    hojasInspeccionadas: hojas.length,
    bloques,
    recuentoDeBloquesQueAparecenAnimando: bloques.length,
  }
}
