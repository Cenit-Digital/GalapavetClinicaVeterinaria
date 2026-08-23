/**
 * Puerta de área táctil mínima (Bloque B, `features/accesibilidad.feature`
 * @s9-@s15) — SC 2.5.8 Target Size (Minimum), nivel AA: «at least 24 by 24
 * CSS pixels». De las cinco excepciones citadas en la cabecera del
 * `.feature`, este módulo solo implementa (a) Spacing y (c) Inline; el resto
 * no tiene rama de decisión propia (evita superficie mutable sin escenario
 * que la ejercite).
 *
 * El área de cada control es un valor DECLARADO (Invariante 6,
 * project-spec.md), nunca una medición del render: este módulo solo evalúa
 * el inventario que se le pasa.
 */

/** Mínimo exigido en ambos lados, transcrito literalmente de SC 2.5.8 (@s9). */
export const AREA_TACTIL_MINIMA_PX = 24

export interface ControlInteractivo {
  readonly nombre: string
  readonly anchoPx: number
  readonly altoPx: number
  /** Excepción (c) Inline: el control está en una frase de texto corrido (@s13). */
  readonly enLinea?: boolean
  /** Excepción (a) Spacing: un círculo de 24px centrado en su rectángulo no interseca a otro control (@s14). */
  readonly cumpleExcepcionEspaciado?: boolean
}

export type ExcepcionAreaTactil = 'en línea' | 'espaciado'
export type VeredictoDeControl = 'aprobado' | 'suspenso'

export interface VeredictoAreaTactil {
  readonly veredicto: VeredictoDeControl
  readonly anchoMedido: number
  readonly altoMedido: number
  readonly exigido: number
  readonly excepcionAplicada?: ExcepcionAreaTactil
  /** Solo presente cuando se aplica la excepción de espaciado (@s14). */
  readonly diametroEmpleadoPx?: number
}

function alcanzaElMinimo(control: ControlInteractivo): boolean {
  return control.anchoPx >= AREA_TACTIL_MINIMA_PX && control.altoPx >= AREA_TACTIL_MINIMA_PX
}

function excepcionAplicable(control: ControlInteractivo): ExcepcionAreaTactil | undefined {
  if (control.enLinea) {
    return 'en línea'
  }
  if (control.cumpleExcepcionEspaciado) {
    return 'espaciado'
  }
  return undefined
}

/** Evalúa un único control contra el criterio de área táctil mínima (@s11/@s12/@s13/@s14). */
export function evaluarAreaTactil(control: ControlInteractivo): VeredictoAreaTactil {
  const cumpleMinimo = alcanzaElMinimo(control)
  const excepcion = cumpleMinimo ? undefined : excepcionAplicable(control)

  return {
    veredicto: cumpleMinimo || excepcion !== undefined ? 'aprobado' : 'suspenso',
    anchoMedido: control.anchoPx,
    altoMedido: control.altoPx,
    exigido: AREA_TACTIL_MINIMA_PX,
    ...(excepcion !== undefined && { excepcionAplicada: excepcion }),
    ...(excepcion === 'espaciado' && { diametroEmpleadoPx: AREA_TACTIL_MINIMA_PX }),
  }
}

export interface ControlSuspenso {
  readonly control: ControlInteractivo
  readonly veredicto: VeredictoAreaTactil
}

export interface InformePuertaDeAreaTactil {
  readonly pasa: boolean
  readonly controlesMedidos: number
  readonly suspensos: readonly ControlSuspenso[]
  readonly motivo?: string
}

const CERO_CONTROLES = 0

/**
 * Puerta de área táctil: mide todo el inventario (ninguno se descarta por
 * tipo) y falla cerrada si está vacío (@s15).
 */
export function ejecutarPuertaDeAreaTactil(inventario: readonly ControlInteractivo[]): InformePuertaDeAreaTactil {
  if (inventario.length === CERO_CONTROLES) {
    return {
      pasa: false,
      controlesMedidos: CERO_CONTROLES,
      suspensos: [],
      motivo: 'no se midió ningún control interactivo: el inventario está vacío',
    }
  }

  const evaluados = inventario.map((control) => ({ control, veredicto: evaluarAreaTactil(control) }))
  const suspensos = evaluados.filter((evaluado) => evaluado.veredicto.veredicto === 'suspenso')

  return { pasa: suspensos.length === CERO_CONTROLES, controlesMedidos: evaluados.length, suspensos }
}
