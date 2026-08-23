import { describe, expect, it } from 'vitest'
import { calcularRatioContraste } from '../contraste'
import { ejecutarComprobacionDeContrasteDeVariantes, extraerVariantesDeTokens, leerTokenDeVariante } from './tokensColor'

function ratioRedondeado(color: string, fondo: string): number {
  return Math.round(calcularRatioContraste(color, fondo) * 100) / 100
}

/**
 * El texto REAL de `src/styles/_tokens.scss`, leído crudo por Vite (mismo
 * patrón que `puertaTelefonoHardcodeado.test.ts`): cada escenario de este
 * bloque recalcula sus valores desde el fichero real, nunca desde un
 * hexadecimal duplicado a mano (patrón de memoria
 * `tokens/contraste-de-tokens-verificado-por-matriz-de-uso.md`).
 */
const TEXTO_TOKENS_REAL = Object.values(
  import.meta.glob('../../styles/_tokens.scss', { eager: true, query: '?raw', import: 'default' }) as Record<
    string,
    string
  >,
)[0] as string

describe('@s1 el inventario de variantes con tokens de color es exactamente el ya fijado por el selector de paleta', () => {
  it('el texto real de _tokens.scss declara exactamente marca, lima, verde y noche', () => {
    // Literal escrito a mano, NO obtenido del inventario que se comprueba (patrón doble-de-test-anclado-al-literal).
    const idsYaFijadosPorSelectorPaleta = ['marca', 'lima', 'verde', 'noche']

    const inventario = extraerVariantesDeTokens(TEXTO_TOKENS_REAL)

    expect(inventario).toHaveLength(idsYaFijadosPorSelectorPaleta.length)
    expect(inventario).toEqual(idsYaFijadosPorSelectorPaleta)
    for (const id of inventario) {
      expect(idsYaFijadosPorSelectorPaleta).toContain(id)
    }
  })
})

describe('@s2 la variante "marca" reutiliza el fondo blanco y el texto morado ya verificados', () => {
  it('fondo #FFFFFF, texto #77286B, ratio 9.13 >= 4.5', () => {
    const fondo = leerTokenDeVariante(TEXTO_TOKENS_REAL, 'marca', 'fondo')
    const texto = leerTokenDeVariante(TEXTO_TOKENS_REAL, 'marca', 'texto')

    expect(fondo).toBe('#FFFFFF')
    expect(texto).toBe('#77286B')
    const ratio = ratioRedondeado(texto, fondo)
    expect(ratio).toBe(9.13)
    expect(ratio).toBeGreaterThanOrEqual(4.5)
  })
})

describe('@s3 la variante "lima" deriva su fondo de una mezcla de blanco y lima dentro del rango decidido', () => {
  it('fondo #F8F9E8 (blanco + 10% lima, dentro de 8-15%), texto #77286B, ratio 8.57 >= 4.5', () => {
    const fondo = leerTokenDeVariante(TEXTO_TOKENS_REAL, 'lima', 'fondo')
    const texto = leerTokenDeVariante(TEXTO_TOKENS_REAL, 'lima', 'texto')

    expect(fondo).toBe('#F8F9E8')
    // Verificación de la mezcla canal a canal: blanco (#FFFFFF) + 10% de lima de marca (#B4C718).
    const PORCENTAJE_LIMA = 0.1
    const blanco = { r: 0xff, g: 0xff, b: 0xff }
    const lima = { r: 0xb4, g: 0xc7, b: 0x18 }
    const canal = (c: 'r' | 'g' | 'b') => Math.round(blanco[c] * (1 - PORCENTAJE_LIMA) + lima[c] * PORCENTAJE_LIMA)
    const mezclaEsperada = `#${[canal('r'), canal('g'), canal('b')].map((n) => n.toString(16).padStart(2, '0').toUpperCase()).join('')}`
    expect(fondo).toBe(mezclaEsperada)
    expect(PORCENTAJE_LIMA).toBeGreaterThanOrEqual(0.08)
    expect(PORCENTAJE_LIMA).toBeLessThanOrEqual(0.15)

    expect(texto).toBe('#77286B')
    const ratio = ratioRedondeado(texto, fondo)
    expect(ratio).toBe(8.57)
    expect(ratio).toBeGreaterThanOrEqual(4.5)
  })
})

describe('@s4 la variante "lima" nunca declara el lima de marca como color de texto', () => {
  it('el texto no es #B4C718, y el lima de marca sobre el fondo de "lima" da 1.77 < 4.5', () => {
    const fondo = leerTokenDeVariante(TEXTO_TOKENS_REAL, 'lima', 'fondo')
    const texto = leerTokenDeVariante(TEXTO_TOKENS_REAL, 'lima', 'texto')

    expect(texto).not.toBe('#B4C718')
    const ratio = ratioRedondeado('#B4C718', fondo)
    expect(ratio).toBe(1.77)
    expect(ratio).toBeLessThan(4.5)
  })
})

describe('@s5 la variante "verde" deriva su fondo de una mezcla de blanco y verde profundo dentro del rango decidido', () => {
  it('fondo #F0F4F1 (blanco + 8% verde, dentro de 6-10%), texto #48704B, ratio 5.12 >= 4.5', () => {
    const fondo = leerTokenDeVariante(TEXTO_TOKENS_REAL, 'verde', 'fondo')
    const texto = leerTokenDeVariante(TEXTO_TOKENS_REAL, 'verde', 'texto')

    expect(fondo).toBe('#F0F4F1')
    const PORCENTAJE_VERDE = 0.08
    const blanco = { r: 0xff, g: 0xff, b: 0xff }
    const verde = { r: 0x48, g: 0x70, b: 0x4b }
    const canal = (c: 'r' | 'g' | 'b') => Math.round(blanco[c] * (1 - PORCENTAJE_VERDE) + verde[c] * PORCENTAJE_VERDE)
    const mezclaEsperada = `#${[canal('r'), canal('g'), canal('b')].map((n) => n.toString(16).padStart(2, '0').toUpperCase()).join('')}`
    expect(fondo).toBe(mezclaEsperada)
    expect(PORCENTAJE_VERDE).toBeGreaterThanOrEqual(0.06)
    expect(PORCENTAJE_VERDE).toBeLessThanOrEqual(0.1)

    expect(texto).toBe('#48704B')
    const ratio = ratioRedondeado(texto, fondo)
    expect(ratio).toBe(5.12)
    expect(ratio).toBeGreaterThanOrEqual(4.5)
  })
})

describe('@s6 la variante "noche" usa fondo negro puro y texto blanco con el ratio máximo ya verificado', () => {
  it('fondo #000000, texto #FFFFFF, ratio 21.00 idéntico al de tokens_marca.feature @s2', () => {
    const fondo = leerTokenDeVariante(TEXTO_TOKENS_REAL, 'noche', 'fondo')
    const texto = leerTokenDeVariante(TEXTO_TOKENS_REAL, 'noche', 'texto')

    expect(fondo).toBe('#000000')
    expect(texto).toBe('#FFFFFF')
    const ratio = ratioRedondeado(texto, fondo)
    expect(ratio).toBe(21)
    // El mismo literal que tokens_marca.feature @s2 (negro sobre blanco): no se reabre, se reutiliza.
    expect(ratio).toBe(ratioRedondeado('#000000', '#FFFFFF'))
  })
})

describe('@s7 la variante "noche" usa el lima de marca como color de foco, apto sobre fondo negro', () => {
  it('foco #B4C718, ratio 11.12 >= 3, idéntico al «negro sobre lima» de datos-galapavet.md §10.1', () => {
    const fondo = leerTokenDeVariante(TEXTO_TOKENS_REAL, 'noche', 'fondo')
    const foco = leerTokenDeVariante(TEXTO_TOKENS_REAL, 'noche', 'foco')

    expect(foco).toBe('#B4C718')
    const ratio = ratioRedondeado(foco, fondo)
    expect(ratio).toBe(11.12)
    expect(ratio).toBeGreaterThanOrEqual(3)
    // El ratio es simétrico: negro/lima (datos-galapavet.md §10.1) es el mismo par que lima/negro.
    expect(ratio).toBe(ratioRedondeado('#000000', '#B4C718'))
  })
})

describe('@s8 la variante "noche" nunca declara el morado de marca como texto ni como foco', () => {
  it('morado sobre fondo "noche" da 2.30 < 3, y ni texto ni foco valen #77286B', () => {
    const fondo = leerTokenDeVariante(TEXTO_TOKENS_REAL, 'noche', 'fondo')
    const texto = leerTokenDeVariante(TEXTO_TOKENS_REAL, 'noche', 'texto')
    const foco = leerTokenDeVariante(TEXTO_TOKENS_REAL, 'noche', 'foco')

    const ratio = ratioRedondeado('#77286B', fondo)
    expect(ratio).toBe(2.3)
    expect(ratio).toBeLessThan(3)
    expect(texto).not.toBe('#77286B')
    expect(foco).not.toBe('#77286B')
  })
})

describe('@s9 el color de foco de cada variante clara alcanza el mínimo de componente de interfaz contra su propio fondo', () => {
  it('marca 9.13, lima 8.57, verde 8.22, los tres >= 3', () => {
    const ratios = (['marca', 'lima', 'verde'] as const).map((variante) => {
      const fondo = leerTokenDeVariante(TEXTO_TOKENS_REAL, variante, 'fondo')
      const foco = leerTokenDeVariante(TEXTO_TOKENS_REAL, variante, 'foco')
      return ratioRedondeado(foco, fondo)
    })

    expect(ratios).toEqual([9.13, 8.57, 8.22])
    for (const ratio of ratios) {
      expect(ratio).toBeGreaterThanOrEqual(3)
    }
  })
})

describe('@s10 el lima de marca no sirve como color de foco sobre un fondo blanco puro', () => {
  it('ratio 1.89 < 3, y ningún token de foco de ninguna variante clara vale #B4C718', () => {
    const ratio = ratioRedondeado('#B4C718', '#FFFFFF')
    expect(ratio).toBe(1.89)
    expect(ratio).toBeLessThan(3)

    for (const variante of ['marca', 'lima', 'verde'] as const) {
      expect(leerTokenDeVariante(TEXTO_TOKENS_REAL, variante, 'foco')).not.toBe('#B4C718')
    }
  })
})

describe('@s11 con el catálogo de variantes de color vacío la comprobación de contraste falla cerrada', () => {
  it('0 variantes comprobadas, veredicto suspenso, nunca "aprobado" por vacuidad', () => {
    const informe = ejecutarComprobacionDeContrasteDeVariantes([])

    expect(informe.variantesComprobadas).toBe(0)
    expect(informe.veredicto).toBe('suspenso')
    expect(informe.motivo).toMatch(/no se comprobó ninguna variante/i)
    expect(informe.veredicto).not.toBe('aprobado')
  })
})

describe('extraerVariantesDeTokens no duplica una variante declarada dos veces en el texto', () => {
  it('un texto sintético con ":root[data-variante=\'marca\']" repetido da un único id "marca"', () => {
    const textoConDuplicado =
      ":root[data-variante='marca'] { --color-fondo: #FFFFFF; }\n:root[data-variante='marca'] { --color-texto: #000000; }\n"

    expect(extraerVariantesDeTokens(textoConDuplicado)).toEqual(['marca'])
  })
})

describe('leerTokenDeVariante falla con un mensaje claro cuando la variante o el token no existen', () => {
  it('una variante inexistente lanza un error que nombra el bloque no encontrado', () => {
    expect(() => leerTokenDeVariante(TEXTO_TOKENS_REAL, 'inexistente', 'fondo')).toThrow(/no se encontró ningún bloque/i)
  })

  it('un rol de color ausente en un bloque real lanza un error que nombra el token no encontrado', () => {
    const textoSinRolDeTexto = ":root[data-variante='prueba'] { --color-fondo: #FFFFFF; }\n"

    expect(() => leerTokenDeVariante(textoSinRolDeTexto, 'prueba', 'texto')).toThrow(/no se encontró el token/i)
  })
})

describe('ejecutarComprobacionDeContrasteDeVariantes con un catálogo no vacío delega en la puerta de contraste ya done', () => {
  it('las 4 variantes reales (texto/fondo) dan veredicto "aprobado" con las 4 parejas comprobadas', () => {
    const catalogo = (['marca', 'lima', 'verde', 'noche'] as const).map((variante) => ({
      color: leerTokenDeVariante(TEXTO_TOKENS_REAL, variante, 'texto'),
      fondo: leerTokenDeVariante(TEXTO_TOKENS_REAL, variante, 'fondo'),
      uso: 'texto normal' as const,
    }))

    const informe = ejecutarComprobacionDeContrasteDeVariantes(catalogo)

    expect(informe.veredicto).toBe('aprobado')
    expect(informe.variantesComprobadas).toBe(4)
  })
})
