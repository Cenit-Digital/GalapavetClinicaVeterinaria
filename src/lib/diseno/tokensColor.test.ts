import { describe, expect, it } from 'vitest'
import { calcularRatioContraste } from '../contraste'
import {
  comprobarInventarioDeTokens,
  extraerVariantesDeTokens,
  INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR,
  leerDeclaracionDeVariante,
  leerTokenDeRaizSinAtributo,
  leerTokenDeVariante,
} from './tokensColor'

const TEXTO_TOKENS = Object.values(
  import.meta.glob('../../styles/_tokens.scss', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>,
)[0] as string

const VARIANTES = ['clinica', 'calida', 'tech', 'eco', 'marca']

function ratio(color: string, fondo: string): number {
  return calcularRatioContraste(color, fondo)
}

describe('tokens del rediseño', () => {
  it('@s1 inventaría exactamente dieciocho colores y dos sombras', () => {
    expect(INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR).toHaveLength(20)
    expect(INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR.filter((token) => token.startsWith('--color-'))).toHaveLength(18)
    expect(INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR.filter((token) => token.startsWith('--sombra-'))).toHaveLength(2)
    expect(INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR).toEqual(
      expect.arrayContaining(['--color-acento', '--color-urgencia', '--color-urgencia-suave']),
    )
  })

  it('@s2 declara los veinte tokens dentro de cada una de las cinco variantes', () => {
    expect(extraerVariantesDeTokens(TEXTO_TOKENS)).toEqual(VARIANTES)
    const informe = comprobarInventarioDeTokens(TEXTO_TOKENS, VARIANTES, INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR)
    expect(informe.paresComprobados).toBe(100)
    expect(informe.faltantes).toEqual([])
    expect(informe.pasa).toBe(true)
  })

  it('@s4 preserva los quince colores ya aprobados de marca', () => {
    expect(leerTokenDeVariante(TEXTO_TOKENS, 'marca', 'fondo')).toBe('#FFFFFF')
    expect(leerTokenDeVariante(TEXTO_TOKENS, 'marca', 'texto')).toBe('#77286B')
    expect(leerTokenDeVariante(TEXTO_TOKENS, 'marca', 'primario')).toBe('#77286B')
    expect(leerTokenDeVariante(TEXTO_TOKENS, 'marca', 'acento-tinta')).toBe('#48704B')
    expect(leerTokenDeVariante(TEXTO_TOKENS, 'marca', 'foco')).toBe('#77286B')
  })

  it('@s5 añade al tema de marca el acento y los colores semánticos de urgencia', () => {
    expect(leerTokenDeVariante(TEXTO_TOKENS, 'marca', 'acento')).toBe('#B4C718')
    expect(leerTokenDeVariante(TEXTO_TOKENS, 'marca', 'urgencia')).toBe('#DC2626')
    expect(leerTokenDeVariante(TEXTO_TOKENS, 'marca', 'urgencia-suave')).toBe('#FDE9E9')
  })

  it('@s7 mantiene contraste de texto sobre urgencia en los cinco temas', () => {
    for (const variante of VARIANTES) {
      const encima = leerTokenDeVariante(TEXTO_TOKENS, variante, 'sobre-primario')
      const urgencia = leerTokenDeVariante(TEXTO_TOKENS, variante, 'urgencia')
      expect(ratio(encima, urgencia)).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('@s12 deja clínica como red de seguridad sin JavaScript', () => {
    for (const rol of ['fondo', 'texto', 'foco'] as const) {
      expect(leerTokenDeRaizSinAtributo(TEXTO_TOKENS, rol)).toBe(leerTokenDeVariante(TEXTO_TOKENS, 'clinica', rol))
    }
  })

  it('lee las sombras sin reinterpretar su valor CSS', () => {
    expect(leerDeclaracionDeVariante(TEXTO_TOKENS, 'tech', '--sombra-elevada')).toContain('rgba(0, 0, 0, 0.45)')
  })
})
