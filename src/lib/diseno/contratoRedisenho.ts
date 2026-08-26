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

export function buscarAfirmacionesClinicasProhibidas(
  textos: readonly string[],
  afirmacionesProhibidas: readonly string[],
): readonly string[] {
  if (afirmacionesProhibidas.length === 0) {
    return ['La lista de afirmaciones prohibidas no puede estar vacía.']
  }

  const textoCompleto = textos.join('\n').toLocaleLowerCase()
  return afirmacionesProhibidas.filter((afirmacion) => textoCompleto.includes(afirmacion.toLocaleLowerCase()))
}
