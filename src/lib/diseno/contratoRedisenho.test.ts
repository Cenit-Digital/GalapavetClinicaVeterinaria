import { describe, expect, it } from 'vitest'
import {
  ROLES_DE_COLOR_REDISENO,
  ROLES_DE_SOMBRA_REDISENO,
  VARIANTES_REDISENO,
  VARIANTE_PREDETERMINADA,
  buscarAfirmacionesClinicasProhibidas,
} from './contratoRedisenho'

describe('contrato del rediseño visual', () => {
  it('@s1 declara los dieciocho roles de color y los dos de sombra', () => {
    expect(ROLES_DE_COLOR_REDISENO).toHaveLength(18)
    expect(ROLES_DE_SOMBRA_REDISENO).toHaveLength(2)
    expect([...ROLES_DE_COLOR_REDISENO, ...ROLES_DE_SOMBRA_REDISENO]).toEqual(
      expect.arrayContaining(['--color-acento', '--color-urgencia', '--color-urgencia-suave']),
    )
  })

  it('@s10 fija clínica como variante predeterminada dentro del catálogo de cinco', () => {
    expect(VARIANTE_PREDETERMINADA).toBe('clinica')
    expect(VARIANTES_REDISENO).toEqual(['clinica', 'calida', 'tech', 'eco', 'marca'])
  })

  it('@s13 encuentra afirmaciones clínicas prohibidas y falla cerrada ante una lista vacía', () => {
    expect(buscarAfirmacionesClinicasProhibidas(['Urgencias 24 h'], ['24 h'])).toEqual(['24 h'])
    expect(buscarAfirmacionesClinicasProhibidas(['texto sin promesas'], [])).toEqual([
      'La lista de afirmaciones prohibidas no puede estar vacía.',
    ])
  })
})
