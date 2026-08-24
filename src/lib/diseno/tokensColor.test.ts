import { describe, expect, it } from 'vitest'
import { calcularRatioContraste, ejecutarPuertaDeContraste } from '../contraste'
import {
  comprobarInventarioDeTokens,
  declaraTokenEnVariante,
  ejecutarComprobacionDeContrasteDeVariantes,
  extraerVariantesDeTokens,
  INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR,
  leerDeclaracionDeVariante,
  leerTokenDeRaizSinAtributo,
  leerTokenDeVariante,
  MATRIZ_DE_USO_MARCA,
  resolverMatrizDeUso,
  type NombreDeToken,
  type RolDeColor,
} from './tokensColor'

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

describe('(paso 2 del plan) el ":root" sin atributo es la red de seguridad de los tokens sin JavaScript', () => {
  it('declara los mismos tres roles y los mismos valores que la variante "marca"', () => {
    for (const rol of ['fondo', 'texto', 'foco'] as const) {
      expect(leerTokenDeRaizSinAtributo(TEXTO_TOKENS_REAL, rol)).toBe(leerTokenDeVariante(TEXTO_TOKENS_REAL, 'marca', rol))
    }
  })

  it('no se cuenta como una quinta variante: el inventario de @s1 sigue siendo exactamente el de siempre', () => {
    expect(extraerVariantesDeTokens(TEXTO_TOKENS_REAL)).toEqual(['marca', 'lima', 'verde', 'noche'])
  })

  it('reconoce el ":root" sin atributo aunque no haya ningún espacio entre "root" y la llave de apertura', () => {
    const sinEspacio = ":root{ --color-fondo: #FFFFFF; }\n"

    expect(leerTokenDeRaizSinAtributo(sinEspacio, 'fondo')).toBe('#FFFFFF')
  })

  it('lanza con un mensaje que nombra el bloque cuando el texto no tiene ningún ":root" sin atributo', () => {
    const soloConVariantes = ":root[data-variante='marca'] { --color-fondo: #FFFFFF; }\n"

    expect(() => leerTokenDeRaizSinAtributo(soloConVariantes, 'fondo')).toThrow(/no se encontró ningún bloque ":root"/)
  })

  it('lanza con un mensaje que nombra el token cuando un rol falta dentro del ":root" sin atributo', () => {
    const rootSinRolDeTexto = ':root { --color-fondo: #FFFFFF; }\n'

    expect(() => leerTokenDeRaizSinAtributo(rootSinRolDeTexto, 'texto')).toThrow(/no se encontró el token "--color-texto" en el ":root" sin atributo/)
  })
})

describe('(paso 4 del plan, PENDIENTE 12 del contrato) el lector gana hermanos para leer CUALQUIER declaración, sin relajar el existente', () => {
  const dosVariantes = [
    ":root[data-variante='marca'] {",
    '  --color-fondo: #FFFFFF;',
    '  --sombra-reposo: 0 6px 18px rgba(83, 28, 75, 0.07);',
    '}',
    '',
    ":root[data-variante='noche'] {",
    '  --color-fondo: #000000;',
    '}',
    '',
  ].join('\n')

  it('leerDeclaracionDeVariante lee un valor con "rgba()" y comas, tal cual, recortado de espacios', () => {
    expect(leerDeclaracionDeVariante(dosVariantes, 'marca', '--sombra-reposo')).toBe('0 6px 18px rgba(83, 28, 75, 0.07)')
  })

  it('leerDeclaracionDeVariante lanza con un mensaje que nombra el token cuando no está en el bloque', () => {
    expect(() => leerDeclaracionDeVariante(dosVariantes, 'noche', '--sombra-reposo')).toThrow(/no se encontró el token "--sombra-reposo"/)
  })

  it('declaraTokenEnVariante distingue presencia de ausencia, sin heredar entre bloques', () => {
    expect(declaraTokenEnVariante(dosVariantes, 'marca', '--sombra-reposo')).toBe(true)
    expect(declaraTokenEnVariante(dosVariantes, 'noche', '--sombra-reposo')).toBe(false)
  })

  it('no confunde "--color-primario" con "--color-primario-fuerte" en ningún sentido', () => {
    const texto = ":root[data-variante='marca'] {\n  --color-primario-fuerte: #6B2460;\n}\n"

    expect(declaraTokenEnVariante(texto, 'marca', '--color-primario')).toBe(false)
    expect(declaraTokenEnVariante(texto, 'marca', '--color-primario-fuerte')).toBe(true)
  })

  it('lee el cuerpo COMPLETO de un bloque que contiene un bloque anidado, sin cortarse en la primera llave de cierre', () => {
    const conBloqueAnidado = [
      ":root[data-variante='marca'] {",
      '  --color-fondo: #FFFFFF;',
      '  // un bloque anidado, a propósito, para forzar el conteo de llaves:',
      '  @media (min-width: 1px) { --ruido: 1; }',
      '  --color-texto: #77286B;',
      '}',
      '',
    ].join('\n')

    expect(leerDeclaracionDeVariante(conBloqueAnidado, 'marca', '--color-texto')).toBe('#77286B')
  })

  it('no se traga el bloque siguiente cuando hay dos bloques de variante consecutivos', () => {
    const dosBloquesSeguidos = ":root[data-variante='marca'] { --color-fondo: #FFFFFF; }\n:root[data-variante='lima'] { --color-fondo: #F8F9E8; }\n"

    expect(leerDeclaracionDeVariante(dosBloquesSeguidos, 'marca', '--color-fondo')).toBe('#FFFFFF')
    expect(leerDeclaracionDeVariante(dosBloquesSeguidos, 'lima', '--color-fondo')).toBe('#F8F9E8')
  })

  it('localiza el bloque cuando su encabezado empieza en el índice 0 del texto', () => {
    const desdeElInicio = ":root[data-variante='marca'] { --color-fondo: #FFFFFF; }\n"

    expect(declaraTokenEnVariante(desdeElInicio, 'marca', '--color-fondo')).toBe(true)
  })

  it('lanza con un mensaje que nombra la variante cuando el bloque no se cierra', () => {
    const sinCierre = ":root[data-variante='marca'] {\n  --color-fondo: #FFFFFF;\n"

    expect(() => leerDeclaracionDeVariante(sinCierre, 'marca', '--color-fondo')).toThrow(/no se cierra/)
  })

  it('leerTokenDeVariante sigue rechazando un valor que no sea un hexadecimal de 6 dígitos: el lector estricto no se relaja', () => {
    const conSombraDisfrazadaDeColor = ":root[data-variante='marca'] { --color-fondo: rgba(1, 2, 3, 0.5); }\n"

    expect(() => leerTokenDeVariante(conSombraDisfrazadaDeColor, 'marca', 'fondo')).toThrow(/no se encontró el token/)
  })

  it('lanza con un mensaje que nombra el bloque no encontrado cuando la cabecera de la variante existe pero nunca abre ningún bloque', () => {
    const cabeceraSinLlave = ":root[data-variante='marca']"

    expect(() => leerTokenDeVariante(cabeceraSinLlave, 'marca', 'fondo')).toThrow(/no se encontró ningún bloque/)
  })

  it('recorta el valor devuelto por "leerDeclaracionDeVariante" cuando hay un espacio antes del ";" de cierre', () => {
    const conEspacioAntesDelPuntoYComa = ":root[data-variante='marca'] {\n  --sombra-reposo: 0 6px 18px rgba(83, 28, 75, 0.07) ;\n}\n"

    expect(leerDeclaracionDeVariante(conEspacioAntesDelPuntoYComa, 'marca', '--sombra-reposo')).toBe('0 6px 18px rgba(83, 28, 75, 0.07)')
  })

  it('no se traga el bloque siguiente cuando se pide un token AUSENTE en el bloque propio pero PRESENTE en el bloque siguiente', () => {
    const dosBloquesConTokenSoloEnElSegundo =
      ":root[data-variante='marca'] { --color-fondo: #FFFFFF; }\n:root[data-variante='lima'] { --color-fondo: #F8F9E8; --color-texto: #000000; }\n"

    expect(declaraTokenEnVariante(dosBloquesConTokenSoloEnElSegundo, 'marca', '--color-texto')).toBe(false)
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

describe('identidad_visual @s1 el inventario de roles del sistema de color es exactamente los 17 tokens enumerados', () => {
  // Literal escrito a mano — NO se obtiene del inventario que se comprueba (@s1: "ese literal está escrito a mano").
  const LOS_17_NOMBRES_A_MANO: readonly string[] = [
    '--color-fondo',
    '--color-fondo-alterno',
    '--color-superficie',
    '--color-superficie-elevada',
    '--color-tinta',
    '--color-texto',
    '--color-texto-suave',
    '--color-primario',
    '--color-primario-fuerte',
    '--color-sobre-primario',
    '--color-acento-tinta',
    '--color-acento-suave',
    '--color-borde-control',
    '--color-borde',
    '--color-foco',
    '--sombra-reposo',
    '--sombra-elevada',
  ]

  it('el inventario contiene exactamente esos 17 nombres y ninguno más', () => {
    expect(INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR).toHaveLength(LOS_17_NOMBRES_A_MANO.length)
    for (const nombre of INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR) {
      expect(LOS_17_NOMBRES_A_MANO).toContain(nombre)
    }
    for (const nombre of LOS_17_NOMBRES_A_MANO) {
      expect(INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR).toContain(nombre)
    }
  })

  it('el recuento de roles de color es exactamente 15 y el de roles de sombra exactamente 2', () => {
    const rolesDeColor = INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR.filter((nombre) => nombre.startsWith('--color-'))
    const rolesDeSombra = INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR.filter((nombre) => nombre.startsWith('--sombra-'))

    expect(rolesDeColor).toHaveLength(15)
    expect(rolesDeSombra).toHaveLength(2)
  })
})

describe('identidad_visual @s3 los 12 roles nuevos de la variante "marca" valen exactamente los hexadecimales derivados y verificados', () => {
  it('cada rol nuevo vale el hexadecimal de la tabla de derivaciones, y los tres roles ya fijados no se retocan', () => {
    expect(leerTokenDeVariante(TEXTO_TOKENS_REAL, 'marca', 'fondo-alterno')).toBe('#F4EEF3')
    expect(leerTokenDeVariante(TEXTO_TOKENS_REAL, 'marca', 'superficie')).toBe('#FFFFFF')
    expect(leerTokenDeVariante(TEXTO_TOKENS_REAL, 'marca', 'superficie-elevada')).toBe('#FAF6F9')
    expect(leerTokenDeVariante(TEXTO_TOKENS_REAL, 'marca', 'tinta')).toBe('#531C4B')
    expect(leerTokenDeVariante(TEXTO_TOKENS_REAL, 'marca', 'texto-suave')).toBe('#925389')
    expect(leerTokenDeVariante(TEXTO_TOKENS_REAL, 'marca', 'primario')).toBe('#77286B')
    expect(leerTokenDeVariante(TEXTO_TOKENS_REAL, 'marca', 'primario-fuerte')).toBe('#6B2460')
    expect(leerTokenDeVariante(TEXTO_TOKENS_REAL, 'marca', 'sobre-primario')).toBe('#FFFFFF')
    expect(leerTokenDeVariante(TEXTO_TOKENS_REAL, 'marca', 'acento-tinta')).toBe('#48704B')
    expect(leerTokenDeVariante(TEXTO_TOKENS_REAL, 'marca', 'acento-suave')).toBe('#F6F8E3')
    expect(leerTokenDeVariante(TEXTO_TOKENS_REAL, 'marca', 'borde-control')).toBe('#A06997')
    expect(leerTokenDeVariante(TEXTO_TOKENS_REAL, 'marca', 'borde')).toBe('#DDC9DA')

    // Los tres roles ya fijados por sistema_de_diseno_visual.feature @s2 no se retocan.
    expect(leerTokenDeVariante(TEXTO_TOKENS_REAL, 'marca', 'fondo')).toBe('#FFFFFF')
    expect(leerTokenDeVariante(TEXTO_TOKENS_REAL, 'marca', 'texto')).toBe('#77286B')
    expect(leerTokenDeVariante(TEXTO_TOKENS_REAL, 'marca', 'foco')).toBe('#77286B')
  })
})

describe('identidad_visual @s2 los 17 tokens están declarados en las 4 variantes y ninguno se hereda', () => {
  // Literal escrito a mano — NO se obtiene del inventario que se comprueba (patrón doble-de-test-anclado-al-literal).
  const LOS_17_TOKENS: readonly NombreDeToken[] = [
    '--color-fondo',
    '--color-fondo-alterno',
    '--color-superficie',
    '--color-superficie-elevada',
    '--color-tinta',
    '--color-texto',
    '--color-texto-suave',
    '--color-primario',
    '--color-primario-fuerte',
    '--color-sobre-primario',
    '--color-acento-tinta',
    '--color-acento-suave',
    '--color-borde-control',
    '--color-borde',
    '--color-foco',
    '--sombra-reposo',
    '--sombra-elevada',
  ]
  const LAS_4_VARIANTES: readonly string[] = ['marca', 'lima', 'verde', 'noche']

  it('los 17 tokens están declarados en las 4 variantes, con el recuento de 68 pares efectivamente comprobados', () => {
    const informe = comprobarInventarioDeTokens(TEXTO_TOKENS_REAL, LAS_4_VARIANTES, LOS_17_TOKENS)

    expect(informe.paresComprobados).toBe(68)
    expect(informe.faltantes).toEqual([])
    expect(informe.pasa).toBe(true)
  })

  it('un token declarado en "marca" y ausente en "noche" hace fallar la comprobación, en vez de heredarse en silencio, y el informe lo nombra', () => {
    const textoSinteticoIncompleto = [
      ":root[data-variante='marca'] { --color-fondo: #FFFFFF; }",
      ":root[data-variante='noche'] { --color-texto: #FFFFFF; }",
      '',
    ].join('\n')

    const informe = comprobarInventarioDeTokens(textoSinteticoIncompleto, ['marca', 'noche'], ['--color-fondo'])

    expect(informe.pasa).toBe(false)
    expect(informe.faltantes).toEqual([{ variante: 'noche', token: '--color-fondo' }])
  })

  it('con el catálogo de tokens o de variantes vacío la comprobación falla cerrada, nunca "0 de 0" en verde', () => {
    const informe = comprobarInventarioDeTokens(TEXTO_TOKENS_REAL, [], [])

    expect(informe.paresComprobados).toBe(0)
    expect(informe.pasa).toBe(false)
  })
})

describe('identidad_visual @s5 la matriz de uso de la variante "marca" alcanza su mínimo WCAG en todos sus pares', () => {
  it('cada par resuelto desde el texto real da el ratio exacto de la tabla, y ninguno queda por debajo de su mínimo', () => {
    const catalogoResuelto = resolverMatrizDeUso(TEXTO_TOKENS_REAL, 'marca', MATRIZ_DE_USO_MARCA)
    const ratioDe = (rol: RolDeColor, fondo: RolDeColor): number =>
      ratioRedondeado(leerTokenDeVariante(TEXTO_TOKENS_REAL, 'marca', rol), leerTokenDeVariante(TEXTO_TOKENS_REAL, 'marca', fondo))

    expect(ratioDe('tinta', 'fondo')).toBe(12.84)
    expect(ratioDe('tinta', 'fondo-alterno')).toBe(11.23)
    expect(ratioDe('texto', 'fondo-alterno')).toBe(7.99)
    expect(ratioDe('texto-suave', 'fondo')).toBe(5.5)
    expect(ratioDe('texto-suave', 'fondo-alterno')).toBeGreaterThanOrEqual(4.5)
    expect(ratioDe('texto-suave', 'fondo-alterno')).toBe(4.81)
    expect(ratioDe('texto', 'superficie-elevada')).toBe(8.53)
    expect(ratioDe('sobre-primario', 'primario')).toBe(9.13)
    expect(ratioDe('acento-tinta', 'acento-suave')).toBe(5.27)
    expect(ratioDe('acento-tinta', 'fondo-alterno')).toBe(4.97)

    const informe = ejecutarPuertaDeContraste(catalogoResuelto)
    expect(informe.pasa).toBe(true)
    expect(informe.parejasEvaluadas).toBeGreaterThan(0)
  })
})

describe('identidad_visual @s5/@s6 la matriz de uso declara el "uso" WCAG exacto de sus 11 filas', () => {
  it('nueve filas son "texto normal" y dos son "componente de interfaz o borde de foco", sin ninguna otra combinación', () => {
    const textoNormal = MATRIZ_DE_USO_MARCA.filter((fila) => fila.uso === 'texto normal')
    const componenteDeInterfaz = MATRIZ_DE_USO_MARCA.filter((fila) => fila.uso === 'componente de interfaz o borde de foco')

    expect(textoNormal).toHaveLength(9)
    expect(componenteDeInterfaz).toHaveLength(2)
    expect(textoNormal.length + componenteDeInterfaz.length).toBe(MATRIZ_DE_USO_MARCA.length)
  })
})

describe('identidad_visual @s6 el borde de control alcanza 3:1 contra las dos superficies sobre las que se dibuja', () => {
  it('ratio contra el fondo 4.23 y contra el fondo alterno 3.70, los dos por encima del umbral 3', () => {
    const UMBRAL_ESCRITO_A_MANO = 3
    const bordeControl = leerTokenDeVariante(TEXTO_TOKENS_REAL, 'marca', 'borde-control')
    const fondo = leerTokenDeVariante(TEXTO_TOKENS_REAL, 'marca', 'fondo')
    const fondoAlterno = leerTokenDeVariante(TEXTO_TOKENS_REAL, 'marca', 'fondo-alterno')

    expect(ratioRedondeado(bordeControl, fondo)).toBe(4.23)
    expect(ratioRedondeado(bordeControl, fondoAlterno)).toBe(3.7)
    expect(ratioRedondeado(bordeControl, fondo)).toBeGreaterThanOrEqual(UMBRAL_ESCRITO_A_MANO)
    expect(ratioRedondeado(bordeControl, fondoAlterno)).toBeGreaterThanOrEqual(UMBRAL_ESCRITO_A_MANO)
  })
})

describe('identidad_visual @s7 el borde decorativo nunca se declara como identificador de un control', () => {
  it('ratio 1.56 < 3, y ningún par de la matriz de uso declara "--color-borde" con el uso de componente de interfaz', () => {
    const borde = leerTokenDeVariante(TEXTO_TOKENS_REAL, 'marca', 'borde')
    const fondo = leerTokenDeVariante(TEXTO_TOKENS_REAL, 'marca', 'fondo')

    expect(ratioRedondeado(borde, fondo)).toBe(1.56)
    expect(ratioRedondeado(borde, fondo)).toBeLessThan(3)
    expect(MATRIZ_DE_USO_MARCA.filter((entrada) => entrada.rol === 'borde' && entrada.uso === 'componente de interfaz o borde de foco')).toEqual([])
  })
})

describe('identidad_visual @s8 el estado de reposo del botón primario oscurece al pasar el puntero y por tanto mejora el contraste', () => {
  it('9.13 en reposo, 10.26 con el puntero encima, el segundo estrictamente mayor', () => {
    const sobrePrimario = leerTokenDeVariante(TEXTO_TOKENS_REAL, 'marca', 'sobre-primario')
    const primario = leerTokenDeVariante(TEXTO_TOKENS_REAL, 'marca', 'primario')
    const primarioFuerte = leerTokenDeVariante(TEXTO_TOKENS_REAL, 'marca', 'primario-fuerte')

    const ratioReposo = ratioRedondeado(sobrePrimario, primario)
    const ratioConElPunteroEncima = ratioRedondeado(sobrePrimario, primarioFuerte)

    expect(ratioReposo).toBe(9.13)
    expect(ratioConElPunteroEncima).toBe(10.26)
    expect(ratioConElPunteroEncima).toBeGreaterThan(ratioReposo)
  })
})

describe('identidad_visual @s9 en la variante "noche" el morado de marca no hace de texto, ni de borde de control, ni de foco', () => {
  it('el ratio del morado contra el fondo de "noche" es 2.30 < 3, y ningún rol de texto/borde/foco vale "#77286B"', () => {
    const MORADO_DE_MARCA = '#77286B'
    const fondoNoche = leerTokenDeVariante(TEXTO_TOKENS_REAL, 'noche', 'fondo')

    expect(ratioRedondeado(MORADO_DE_MARCA, fondoNoche)).toBe(2.3)
    expect(ratioRedondeado(MORADO_DE_MARCA, fondoNoche)).toBeLessThan(3)

    for (const rol of ['texto', 'tinta', 'texto-suave', 'borde-control', 'foco'] as const) {
      expect(leerTokenDeVariante(TEXTO_TOKENS_REAL, 'noche', rol)).not.toBe(MORADO_DE_MARCA)
    }
  })
})

describe('identidad_visual @s10 con la matriz de uso vacía la puerta de contraste del sistema de color falla cerrada', () => {
  it('0 pares evaluados, suspenso, informe que declara que no se evaluó nada, incluso con 0 pares incumplidos', () => {
    const informe = ejecutarPuertaDeContraste([])

    expect(informe.parejasEvaluadas).toBe(0)
    expect(informe.pasa).toBe(false)
    expect(informe.motivo).toMatch(/vacío|0 parejas/i)
  })
})
