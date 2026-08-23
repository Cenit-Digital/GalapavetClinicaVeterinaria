/**
 * Puerta de análisis automático de accesibilidad (Bloque A,
 * `features/accesibilidad.feature` @s1-@s8). Evalúa el RESULTADO
 * estructurado de un análisis (páginas cargadas, violaciones, reglas
 * aplicadas) contra el inventario fijo de páginas de este proyecto, y falla
 * cerrada si no llegó a analizar nada de verdad.
 *
 * La regla `target-size` de axe-core (que exige layout real) y, en general,
 * la ejecución real de axe-core sobre cada página, NO ocurren aquí: eso es
 * competencia del navegador real (Decisión 11, project-spec.md). Este módulo
 * solo sabe LEER el resultado ya producido y decidir el veredicto.
 */

/** Los seis nombres de página que esta puerta audita, en el orden del contrato (@s1). */
export const INVENTARIO_DE_PAGINAS: readonly string[] = [
  'Landing',
  'Campañas',
  'Ficha de campaña',
  'Blog',
  'Artículo del blog',
  'Tienda',
]

/** Los cinco niveles de conformidad que el análisis debe aplicar (@s7). */
export const NIVELES_DE_CONFORMIDAD_EXIGIDOS: readonly string[] = [
  'WCAG 2.0 A',
  'WCAG 2.0 AA',
  'WCAG 2.1 A',
  'WCAG 2.1 AA',
  'WCAG 2.2 AA',
]

export interface ViolacionDeAccesibilidad {
  readonly criterio: string
  readonly elemento: string
}

export interface InformeDePagina {
  readonly pagina: string
  /** Si la página llegó a cargarse. Una página no cargada no cuenta como analizada ni como limpia (@s8). */
  readonly cargo: boolean
  readonly violaciones: readonly ViolacionDeAccesibilidad[]
}

export interface ResultadoDeAnalisisAutomatico {
  readonly reglasAplicadas: number
  readonly informes: readonly InformeDePagina[]
}

export interface ViolacionLocalizada extends ViolacionDeAccesibilidad {
  readonly pagina: string
}

export type VeredictoDeAccesibilidad = 'aprobado' | 'suspenso'

export interface InformePuertaDeAnalisisAutomatico {
  readonly veredicto: VeredictoDeAccesibilidad
  readonly paginasAnalizadas: number
  readonly violacionesTotales: number
  readonly violaciones: readonly ViolacionLocalizada[]
  readonly paginasNoCargadas: readonly string[]
  readonly motivo?: string
}

const CERO = 0
const APROBADO: VeredictoDeAccesibilidad = 'aprobado'
const SUSPENSO: VeredictoDeAccesibilidad = 'suspenso'

function informeVacio(motivo: string, paginasNoCargadas: readonly string[] = []): InformePuertaDeAnalisisAutomatico {
  return {
    veredicto: SUSPENSO,
    paginasAnalizadas: CERO,
    violacionesTotales: CERO,
    violaciones: [],
    paginasNoCargadas,
    motivo,
  }
}

/**
 * Puerta de análisis automático: falla cerrada si el inventario está vacío
 * (@s4), si ninguna página cargó (@s5) o si no se aplicó ninguna regla
 * (@s6). Con al menos una página analizada, suspende ante cualquier
 * violación o página no cargada (@s3/@s8), y aprueba solo si ambas listas
 * están limpias (@s2).
 */
export function ejecutarPuertaDeAnalisisAutomatico(
  resultado: ResultadoDeAnalisisAutomatico,
): InformePuertaDeAnalisisAutomatico {
  if (resultado.informes.length === CERO) {
    return informeVacio('el inventario de páginas está vacío: no hay nada que auditar')
  }

  const cargadas = resultado.informes.filter((informe) => informe.cargo)
  const noCargadas = resultado.informes.filter((informe) => !informe.cargo).map((informe) => informe.pagina)

  if (cargadas.length === CERO) {
    return informeVacio(`se analizaron 0 páginas de las ${resultado.informes.length} esperadas`, noCargadas)
  }

  if (resultado.reglasAplicadas === CERO) {
    return {
      veredicto: SUSPENSO,
      paginasAnalizadas: cargadas.length,
      violacionesTotales: CERO,
      violaciones: [],
      paginasNoCargadas: noCargadas,
      motivo: 'no se aplicó ninguna regla de conformidad',
    }
  }

  const violaciones = cargadas.flatMap((informe) =>
    informe.violaciones.map((violacion) => ({ ...violacion, pagina: informe.pagina })),
  )
  const hayIncidencias = violaciones.length > CERO || noCargadas.length > CERO

  return {
    veredicto: hayIncidencias ? SUSPENSO : APROBADO,
    paginasAnalizadas: cargadas.length,
    violacionesTotales: violaciones.length,
    violaciones,
    paginasNoCargadas: noCargadas,
  }
}
