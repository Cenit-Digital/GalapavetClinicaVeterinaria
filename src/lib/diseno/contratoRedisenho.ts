export const ROLES_DE_COLOR_REDISENO = [
  '--color-fondo',
  '--color-fondo-alterno',
  '--color-superficie',
  '--color-superficie-elevada',
  '--color-borde',
  '--color-borde-control',
  '--color-tinta',
  '--color-texto',
  '--color-texto-suave',
  '--color-primario',
  '--color-primario-fuerte',
  '--color-sobre-primario',
  '--color-acento',
  '--color-acento-tinta',
  '--color-acento-suave',
  '--color-urgencia',
  '--color-urgencia-suave',
  '--color-foco',
] as const

export const ROLES_DE_SOMBRA_REDISENO = ['--sombra-reposo', '--sombra-elevada'] as const

export const VARIANTES_REDISENO = ['clinica', 'calida', 'tech', 'eco', 'marca'] as const

export const VARIANTE_PREDETERMINADA = VARIANTES_REDISENO[0]

/** Un fichero del corpus que la puerta de declaración única inspecciona (@s10). */
export interface FuenteDeProyecto {
  readonly ruta: string
  readonly texto: string
}

export interface InformeDeDeclaracionUnica {
  readonly ficherosInspeccionados: number
  readonly ficherosQueDeclaran: readonly string[]
  readonly pasa: boolean
  readonly motivo?: string
}

const SIN_ELEMENTOS = 0
const UNA_SOLA_DECLARACION = 1

/** Las tres comillas con las que JavaScript, TypeScript y HTML escriben una cadena. */
const COMILLAS_DE_CADENA = ["'", '"', '`'] as const

/**
 * Si `texto` escribe `identificador` como literal de cadena ENTERO. Se compara
 * con las comillas incluidas a propósito: `'/img/hero/clinica.webp'` contiene
 * la palabra pero no declara el identificador, y confundirlos convertiría la
 * puerta en ruido (`src/components/Hero.tsx:48`).
 */
function declaraElIdentificadorComoLiteral(texto: string, identificador: string): boolean {
  return COMILLAS_DE_CADENA.some((comilla) => texto.includes(`${comilla}${identificador}${comilla}`))
}

/**
 * Qué ficheros del corpus declaran `identificador` como literal de cadena
 * (@s10: «el identificador aparece declarado una sola vez en todo el
 * proyecto»). Aprueba solo si lo declara EXACTAMENTE uno: cero significaría
 * que la fuente única ha desaparecido, y dos o más, que alguien ha vuelto a
 * copiarla.
 *
 * Falla cerrada ante un corpus vacío o un identificador vacío, en vez de dar
 * "cero hallazgos" por bueno (patrón
 * `verde-por-vacuidad-en-puerta-de-verificacion`).
 */
export function buscarDeclaracionesLiteralesDelIdentificador(
  fuentes: readonly FuenteDeProyecto[],
  identificador: string,
): InformeDeDeclaracionUnica {
  if (fuentes.length === SIN_ELEMENTOS) {
    return {
      ficherosInspeccionados: SIN_ELEMENTOS,
      ficherosQueDeclaran: [],
      pasa: false,
      motivo: 'el corpus de ficheros está vacío: no se inspeccionó ninguno',
    }
  }

  if (identificador.length === SIN_ELEMENTOS) {
    return {
      ficherosInspeccionados: fuentes.length,
      ficherosQueDeclaran: [],
      pasa: false,
      motivo: 'el identificador que se busca está vacío',
    }
  }

  const ficherosQueDeclaran = fuentes
    .filter(({ texto }) => declaraElIdentificadorComoLiteral(texto, identificador))
    .map(({ ruta }) => ruta)

  return {
    ficherosInspeccionados: fuentes.length,
    ficherosQueDeclaran,
    pasa: ficherosQueDeclaran.length === UNA_SOLA_DECLARACION,
  }
}
