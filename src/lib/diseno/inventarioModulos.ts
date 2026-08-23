/**
 * Inventario de los módulos que deben tener su propio fichero de estilos
 * co-localizado (`<Nombre>.module.scss` junto a `<Nombre>.tsx`): los 12
 * componentes visuales de `src/components` y las 5 páginas de `src/pages`.
 * `MetadatosPagina` queda fuera a propósito: no tiene representación visual
 * (`return null`), solo escribe en `<head>`.
 */

export type CarpetaDeModulo = 'components' | 'pages'

export interface ModuloConEstilos {
  readonly nombre: string
  readonly carpeta: CarpetaDeModulo
}

const COMPONENTES: readonly string[] = [
  'Cabecera',
  'CampanasPortada',
  'Equipo',
  'Faq',
  'FormularioContacto',
  'Galeria',
  'Hero',
  'InformacionContacto',
  'PieDePagina',
  'ReservaChat',
  'SelectorPaleta',
  'Servicios',
]

const PAGINAS: readonly string[] = ['Landing', 'PaginaBlog', 'PaginaCampanas', 'PaginaNoEncontrada', 'PaginaTienda']

export const INVENTARIO_MODULOS_CON_ESTILOS: readonly ModuloConEstilos[] = [
  ...COMPONENTES.map((nombre) => ({ nombre, carpeta: 'components' as const })),
  ...PAGINAS.map((nombre) => ({ nombre, carpeta: 'pages' as const })),
]

const CERO_MODULOS = 0

export interface InformeCoLocalizacion {
  readonly pasa: boolean
  readonly modulosComprobados: number
  readonly faltantes: readonly string[]
  readonly motivo?: string
}

function motivoDeVacuidad(): string {
  return 'no se comprobó ningún módulo: el inventario está vacío'
}

function rutaEstiloDe(modulo: ModuloConEstilos): string {
  return `/${modulo.carpeta}/${modulo.nombre}.module.scss`
}

/**
 * Comprueba que cada módulo del inventario tenga su fichero
 * `<Nombre>.module.scss` entre `rutasDeEstilosExistentes` (las rutas reales
 * obtenidas con `import.meta.glob`, `@s22`), y falla cerrada con un
 * inventario vacío en vez de "pasar" por vacuidad (@s23).
 */
export function comprobarCoLocalizacion(
  inventario: readonly ModuloConEstilos[],
  rutasDeEstilosExistentes: readonly string[],
): InformeCoLocalizacion {
  if (inventario.length === CERO_MODULOS) {
    return { pasa: false, modulosComprobados: CERO_MODULOS, faltantes: [], motivo: motivoDeVacuidad() }
  }

  const faltantes = inventario
    .filter((modulo) => !rutasDeEstilosExistentes.some((ruta) => ruta.endsWith(rutaEstiloDe(modulo))))
    .map((modulo) => modulo.nombre)

  return { pasa: faltantes.length === CERO_MODULOS, modulosComprobados: inventario.length, faltantes }
}
