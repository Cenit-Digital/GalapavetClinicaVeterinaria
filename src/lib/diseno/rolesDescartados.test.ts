import { describe, expect, it } from 'vitest'
import { ejecutarPuertaDeRolesDescartados, type FicheroDeTexto } from './rolesDescartados'

const TOKENS: FicheroDeTexto = { ruta: 'tokens.scss', contenido: '--color-primario-fuerte: #000000;' }
const ESTILOS = [{ ruta: 'boton.scss', contenido: '.boton { background: var(--color-primario-fuerte); }' }]

describe('puerta de afirmaciones clínicas', () => {
  it('@s13 permite los tokens semánticos y rechaza una afirmación clínica falsa', () => {
    const informe = ejecutarPuertaDeRolesDescartados(
      { ruta: 'tokens.scss', contenido: '--color-urgencia: #000000; --color-acento: #000000; --color-primario-fuerte: #000000;' },
      [...ESTILOS, { ruta: 'contenido.tsx', contenido: 'Atención 24 h' }],
    )

    expect(informe.tokensDeUrgencia).toEqual(['24 h'])
    expect(informe.pasa).toBe(false)
  })

  it('acepta el vocabulario visual cuando el texto no promete una disponibilidad falsa', () => {
    const informe = ejecutarPuertaDeRolesDescartados(TOKENS, ESTILOS)

    expect(informe.tokensDeUrgencia).toEqual([])
    expect(informe.primarioFuerteDeclarado).toBe(true)
    expect(informe.primarioFuerteUsado).toBe(true)
    expect(informe.pasa).toBe(true)
  })

  it('sigue fallando si el primario fuerte se declara pero no se usa', () => {
    const informe = ejecutarPuertaDeRolesDescartados(TOKENS, [])

    expect(informe.primarioFuerteDeclarado).toBe(true)
    expect(informe.primarioFuerteUsado).toBe(false)
    expect(informe.pasa).toBe(false)
  })
})
