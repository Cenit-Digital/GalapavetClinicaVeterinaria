import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { ESCALA_DE_ESPACIADO_PX } from './escalaEspaciado'

const RAIZ_DEL_REPOSITORIO = process.cwd()
const PATRON_DE_ESPACIADO_LITERAL = /espaciado\((\d+)\)/g

function rutasScssBajo(directorio: string): readonly string[] {
  return readdirSync(directorio, { withFileTypes: true }).flatMap((entrada) => {
    const ruta = `${directorio}/${entrada.name}`
    if (entrada.isDirectory()) return rutasScssBajo(ruta)
    return entrada.isFile() && ruta.endsWith('.scss') ? [ruta] : []
  })
}

function llamadasDeEspaciadoEnProduccion(): readonly { readonly ruta: string; readonly paso: number }[] {
  return rutasScssBajo(`${RAIZ_DEL_REPOSITORIO}/src`).flatMap((ruta) => {
    const sinComentarios = readFileSync(ruta, 'utf8').replaceAll(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')
    return [...sinComentarios.matchAll(PATRON_DE_ESPACIADO_LITERAL)].map((coincidencia) => ({
      ruta: ruta.replaceAll('\\', '/'),
      paso: Number(coincidencia[1]),
    }))
  })
}

describe('@s19 la escala de espaciado declara exactamente los 9 pasos de la rejilla de 8px de Material Design', () => {
  it('4, 8, 12, 16, 24, 32, 48, 64 y 96 píxeles, ni uno más ni uno menos', () => {
    // Literal escrito a mano, transcrito de la rejilla de Material Design — NO se obtiene de la escala que se comprueba.
    const pasosAMano = [4, 8, 12, 16, 24, 32, 48, 64, 96]

    expect(ESCALA_DE_ESPACIADO_PX).toHaveLength(pasosAMano.length)
    expect(ESCALA_DE_ESPACIADO_PX.toSorted((a, b) => a - b)).toEqual(pasosAMano)
    for (const paso of ESCALA_DE_ESPACIADO_PX) {
      expect(pasosAMano).toContain(paso)
    }
  })
})

describe('@s20 ningún paso de la escala de espaciado se aparta de la rejilla de 8px', () => {
  it('cada paso es múltiplo de 4, y ninguno es menor que 4 ni mayor que 96', () => {
    const MULTIPLO_DE_LA_REJILLA = 4
    const PASO_MINIMO = 4
    const PASO_MAXIMO = 96

    for (const paso of ESCALA_DE_ESPACIADO_PX) {
      expect(paso % MULTIPLO_DE_LA_REJILLA).toBe(0)
      expect(paso).toBeGreaterThanOrEqual(PASO_MINIMO)
      expect(paso).toBeLessThanOrEqual(PASO_MAXIMO)
    }
  })
})

describe('@s3 de fidelidad_lienzo: todo espaciado literal usado por producción existe en la escala', () => {
  it('cada llamada espaciado(n) de los estilos de producción usa uno de los nueve pasos aprobados', () => {
    const llamadas = llamadasDeEspaciadoEnProduccion()
    const pasosInvalidos = llamadas.filter(({ paso }) => !ESCALA_DE_ESPACIADO_PX.includes(paso))

    expect(llamadas.length).toBeGreaterThan(0)
    expect(pasosInvalidos).toEqual([])
  })
})
