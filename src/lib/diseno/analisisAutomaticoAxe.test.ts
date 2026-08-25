import { describe, expect, it } from 'vitest'
import { NIVELES_DE_CONFORMIDAD_EXIGIDOS } from '../accesibilidad-analisis'
import {
  ETIQUETAS_AXE_ACUMULATIVAS,
  configuracionDeAnalisisAxeDeclarada,
  etiquetasIncluyenLaQueActivaAreaTactil,
} from './analisisAutomaticoAxe'

function unicoTexto(ficheros: Record<string, string>, descripcion: string): string {
  const [texto] = Object.values(ficheros)
  if (texto === undefined) {
    throw new Error(`no se pudo leer el texto real de ${descripcion}`)
  }
  return texto
}

const textoDeAccesibilidadSpec = (): string =>
  unicoTexto(
    import.meta.glob('../../../tests/e2e/accesibilidad.spec.ts', {
      eager: true,
      query: '?raw',
      import: 'default',
    }) as Record<string, string>,
    '"tests/e2e/accesibilidad.spec.ts"',
  )

describe('identidad_visual @s35 el análisis automático se configura con las cinco etiquetas acumulativas y sin opciones que las anulen', () => {
  it('la configuración declara exactamente las cinco etiquetas de la Decisión 39', () => {
    // Literal escrito a mano — NO se obtiene de la constante que se comprueba (patrón doble-de-test-anclado-al-literal).
    const etiquetasAMano = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

    const configuracion = configuracionDeAnalisisAxeDeclarada()

    expect(configuracion.etiquetas).toEqual(etiquetasAMano)
    expect(ETIQUETAS_AXE_ACUMULATIVAS).toEqual(etiquetasAMano)
  })

  it('no declara ninguna etiqueta que no esté en el literal', () => {
    const etiquetasAMano = new Set(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])

    for (const etiqueta of configuracionDeAnalisisAxeDeclarada().etiquetas) {
      expect(etiquetasAMano.has(etiqueta)).toBe(true)
    }
  })

  it('la configuración no usa el mecanismo de opciones', () => {
    expect(configuracionDeAnalisisAxeDeclarada().usaOpciones).toBe(false)
  })

  it('el fichero real de pruebas de navegador usa "withTags" con esas etiquetas y nunca ".options("', () => {
    const texto = textoDeAccesibilidadSpec()

    expect(texto).toContain('withTags([...ETIQUETAS_AXE_ACUMULATIVAS])')
    expect(texto).not.toContain('.options(')
  })

  it('las cinco etiquetas se corresponden con los cinco niveles de conformidad de accesibilidad.feature @s7', () => {
    expect(ETIQUETAS_AXE_ACUMULATIVAS).toHaveLength(NIVELES_DE_CONFORMIDAD_EXIGIDOS.length)
    expect(ETIQUETAS_AXE_ACUMULATIVAS).toHaveLength(5)
  })

  it('"wcag22aa" está presente: es la única etiqueta que trae la regla de área táctil', () => {
    expect(etiquetasIncluyenLaQueActivaAreaTactil()).toBe(true)
  })
})
