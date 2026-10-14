import { describe, expect, it } from 'vitest'
import { ejecutarPuertaDeEntradaSoloEnNoPreference, ejecutarPuertaDeMovimientoRespetuoso } from './movimientoRespetuoso'

describe('@s33 toda regla de animación o transición introducida vive dentro de la consulta prefers-reduced-motion', () => {
  it('los ficheros reales del inventario: cada transition/animation vive en no-preference o en reduce, y se comprobó más de 0 ficheros', () => {
    const ficherosReales = {
      ...import.meta.glob('../../components/*.module.scss', { eager: true, query: '?raw', import: 'default' }),
      ...import.meta.glob('../../pages/*.module.scss', { eager: true, query: '?raw', import: 'default' }),
    } as Record<string, string>
    const ficheros = Object.entries(ficherosReales).map(([ruta, contenido]) => ({ ruta, contenido }))

    const informe = ejecutarPuertaDeMovimientoRespetuoso(ficheros)

    expect(informe.ficherosComprobados).toBeGreaterThan(0)
    expect(informe.incumplimientos).toHaveLength(0)
    expect(informe.ficherosSinLecturaFiable).toEqual([])
    expect(informe.pasa).toBe(true)
  })

  it('una transición fuera de cualquier bloque prefers-reduced-motion se señala como incumplimiento', () => {
    const ficheroSinCobertura = {
      ruta: '/prueba/SinCobertura.module.scss',
      contenido: '.boton {\n  transition: color 150ms ease;\n}\n',
    }

    const informe = ejecutarPuertaDeMovimientoRespetuoso([ficheroSinCobertura])

    expect(informe.ficherosComprobados).toBe(1)
    expect(informe.incumplimientos).toEqual([{ ruta: '/prueba/SinCobertura.module.scss', linea: 2 }])
    expect(informe.pasa).toBe(false)
  })

  it('un bloque "reduce" cubre sus declaraciones, pero deja de cubrir una declaración posterior a su cierre', () => {
    const ficheroConReduce = {
      ruta: '/prueba/ConReduce.module.scss',
      contenido: [
        '.acordeon {',
        '  @media (prefers-reduced-motion: reduce) {',
        '    transition: none;',
        '    animation: none;',
        '  }',
        '  transition: color 1s;',
        '}',
        '',
      ].join('\n'),
    }

    const informe = ejecutarPuertaDeMovimientoRespetuoso([ficheroConReduce])

    // Las dos declaraciones dentro del bloque "reduce" están cubiertas; la de la línea 6, tras cerrarlo, no.
    expect(informe.incumplimientos).toEqual([{ ruta: '/prueba/ConReduce.module.scss', linea: 6 }])
    expect(informe.pasa).toBe(false)
  })

  it('un fichero sin ninguna declaración de movimiento no cuenta como comprobado, evaluado en solitario', () => {
    const ficheroSinMovimiento = {
      ruta: '/prueba/SinMovimiento.module.scss',
      contenido: '.tarjeta {\n  color: red;\n}\n',
    }

    const informe = ejecutarPuertaDeMovimientoRespetuoso([ficheroSinMovimiento])

    expect(informe.ficherosComprobados).toBe(0)
    expect(informe.incumplimientos).toHaveLength(0)
    expect(informe.pasa).toBe(false)
  })

  it('la palabra "transition:" en medio de una línea que no es una declaración real no se confunde con una', () => {
    const ficheroConComentario = {
      ruta: '/prueba/ConComentario.module.scss',
      contenido: '.a:hover { color: red; } // transition: fake\n',
    }

    const informe = ejecutarPuertaDeMovimientoRespetuoso([ficheroConComentario])

    expect(informe.ficherosComprobados).toBe(0)
    expect(informe.incumplimientos).toHaveLength(0)
    expect(informe.pasa).toBe(false)
  })

  it('un bloque "no-preference" sin espacio tras los dos puntos también se reconoce como cobertura', () => {
    const ficheroSinEspacio = {
      ruta: '/prueba/SinEspacio.module.scss',
      contenido: ['.a {', '  @media (prefers-reduced-motion:no-preference) {', '    transition: color 1s;', '  }', '}', ''].join('\n'),
    }

    const informe = ejecutarPuertaDeMovimientoRespetuoso([ficheroSinEspacio])

    expect(informe.incumplimientos).toHaveLength(0)
    expect(informe.pasa).toBe(true)
  })

  it('una propiedad larga real ("transition-duration") fuera de cualquier bloque prefers-reduced-motion también se señala como incumplimiento', () => {
    const ficheroFormaLarga = {
      ruta: '/prueba/FormaLarga.module.scss',
      contenido: '.boton {\n  transition-duration: 0.3s;\n}\n',
    }

    const informe = ejecutarPuertaDeMovimientoRespetuoso([ficheroFormaLarga])

    expect(informe.ficherosComprobados).toBe(1)
    expect(informe.incumplimientos).toEqual([{ ruta: '/prueba/FormaLarga.module.scss', linea: 2 }])
    expect(informe.pasa).toBe(false)
  })

  it('una propiedad larga real con un espacio antes de los dos puntos también se señala como incumplimiento', () => {
    const ficheroEspacioAntesDeDosPuntos = {
      ruta: '/prueba/EspacioAntesDeDosPuntos.module.scss',
      contenido: '.boton {\n  transition-duration : 0.3s;\n}\n',
    }

    const informe = ejecutarPuertaDeMovimientoRespetuoso([ficheroEspacioAntesDeDosPuntos])

    expect(informe.incumplimientos).toEqual([{ ruta: '/prueba/EspacioAntesDeDosPuntos.module.scss', linea: 2 }])
    expect(informe.pasa).toBe(false)
  })

  it('un bloque que abre y cierra en la MISMA línea no deja una llave abierta: una transición posterior, fuera de "no-preference", se señala', () => {
    const ficheroConBloqueEnUnaLinea = {
      ruta: '/prueba/BloqueEnUnaLinea.module.scss',
      contenido: [
        '@media (prefers-reduced-motion: no-preference) {',
        '  .a { color: red; }',
        '}',
        '.b {',
        '  transition: color 1s;',
        '}',
        '',
      ].join('\n'),
    }

    const informe = ejecutarPuertaDeMovimientoRespetuoso([ficheroConBloqueEnUnaLinea])

    expect(informe.incumplimientos).toEqual([{ ruta: '/prueba/BloqueEnUnaLinea.module.scss', linea: 5 }])
    expect(informe.pasa).toBe(false)
  })

  it('una interpolación "#{…}" dentro de un valor no desordena la pila de bloques', () => {
    const ficheroConInterpolacion = {
      ruta: '/prueba/ConInterpolacion.module.scss',
      contenido: [
        '@media (prefers-reduced-motion: no-preference) {',
        '  .a {',
        '    width: min(100% - #{espaciado(48)}, 900px);',
        '  }',
        '}',
        '.b {',
        '  transition: color 1s;',
        '}',
        '',
      ].join('\n'),
    }

    const informe = ejecutarPuertaDeMovimientoRespetuoso([ficheroConInterpolacion])

    expect(informe.incumplimientos).toEqual([{ ruta: '/prueba/ConInterpolacion.module.scss', linea: 7 }])
  })

  it('una propiedad que solo CONTIENE "transition" o "animation" en su nombre, por delante o por detrás, no es de movimiento', () => {
    const ficheroConNombresParecidos = {
      ruta: '/prueba/NombresParecidos.module.scss',
      contenido: '.a {\n  transitional: 1;\n  mi-animation: 2;\n}\n',
    }

    const informe = ejecutarPuertaDeMovimientoRespetuoso([ficheroConNombresParecidos])

    expect(informe.ficherosComprobados).toBe(0)
    expect(informe.incumplimientos).toEqual([])
  })

  it('un bloque "reduce" con dos espacios tras los dos puntos también se reconoce como cobertura', () => {
    const ficheroDosEspacios = {
      ruta: '/prueba/ReduceDosEspacios.module.scss',
      contenido: ['.a {', '  @media (prefers-reduced-motion:  reduce) {', '    animation: none;', '  }', '}', ''].join('\n'),
    }

    const informe = ejecutarPuertaDeMovimientoRespetuoso([ficheroDosEspacios])

    expect(informe.incumplimientos).toHaveLength(0)
    expect(informe.pasa).toBe(true)
  })
})

/**
 * hero_reducido_con_animacion @s8 — «las declaraciones de entrada solo existen
 * dentro de `no-preference`». Esta puerta NO sustituye a @s33 de
 * `sistema_de_diseno_visual.feature` (la de arriba): la AMPLÍA. Cada fila de la
 * tabla del escenario es una mutación (o un falso rojo que debe evitarse) y se
 * ejecuta aquí contra el módulo real, con el veredicto SIN las guardas
 * "mayor que 0", que solo se aplican al conjunto de las hojas reales.
 */
const RUTA_SINTETICA = '/prueba/Hero.module.scss'

function hojaSintetica(lineas: readonly string[]): { ruta: string; contenido: string } {
  return { ruta: RUTA_SINTETICA, contenido: [...lineas, ''].join('\n') }
}

interface FilaDeLaTabla {
  /** Redacción de la fila, tal como la escribe el contrato. */
  readonly fila: string
  readonly lineas: readonly string[]
  readonly veredicto: 'pasa' | 'incumple'
  /** Lo que la puerta señala: línea y propiedad (o "@keyframes"). Vacío si pasa. */
  readonly señalados: readonly { readonly linea: number; readonly propiedad: string }[]
  readonly fotogramas: number
  readonly declaracionesDeEntradaEnNoPreference: number
}

const BLOQUE_NO_PREFERENCE = '@media (prefers-reduced-motion: no-preference) {'
const BLOQUE_REDUCE = '@media (prefers-reduced-motion: reduce) {'
const BLOQUE_OTRA_CONSULTA = '@media (max-width: 560px) {'

const FOTOGRAMAS_EN_VARIAS_LINEAS = [
  '  @keyframes entrada {',
  '    from {',
  '      opacity: 0;',
  '    }',
  '    to {',
  '      opacity: 1;',
  '    }',
  '  }',
]

const TABLA_DE_FILAS: readonly FilaDeLaTabla[] = [
  {
    fila: '"animation" con un nombre de fotogramas, dentro de "no-preference"',
    lineas: [BLOQUE_NO_PREFERENCE, '  .titular {', '    animation: entrada 700ms ease-out backwards;', '  }', '}'],
    veredicto: 'pasa',
    señalados: [],
    fotogramas: 0,
    declaracionesDeEntradaEnNoPreference: 1,
  },
  {
    fila: '"animation-name" dentro de "no-preference"',
    lineas: ['.titular {', `  ${BLOQUE_NO_PREFERENCE}`, '    animation-name: entrada;', '  }', '}'],
    veredicto: 'pasa',
    señalados: [],
    fotogramas: 0,
    declaracionesDeEntradaEnNoPreference: 1,
  },
  {
    fila: '"animation-delay: 120ms" dentro de "no-preference"',
    lineas: ['.parrafo {', `  ${BLOQUE_NO_PREFERENCE}`, '    animation-delay: 120ms;', '  }', '}'],
    veredicto: 'pasa',
    señalados: [],
    fotogramas: 0,
    declaracionesDeEntradaEnNoPreference: 1,
  },
  {
    fila: '"animation" con un nombre de fotogramas, en la raíz del fichero',
    lineas: ['.titular {', '  animation: entrada 700ms ease-out backwards;', '}'],
    veredicto: 'incumple',
    señalados: [{ linea: 2, propiedad: 'animation' }],
    fotogramas: 0,
    declaracionesDeEntradaEnNoPreference: 0,
  },
  {
    fila: '"animation-name" en la raíz del fichero',
    lineas: ['.titular {', '  animation-name: entrada;', '}'],
    veredicto: 'incumple',
    señalados: [{ linea: 2, propiedad: 'animation-name' }],
    fotogramas: 0,
    declaracionesDeEntradaEnNoPreference: 0,
  },
  {
    fila: '"animation-delay: 120ms" en la raíz del fichero',
    lineas: ['.parrafo {', '  animation-delay: 120ms;', '}'],
    veredicto: 'incumple',
    señalados: [{ linea: 2, propiedad: 'animation-delay' }],
    fotogramas: 0,
    declaracionesDeEntradaEnNoPreference: 0,
  },
  {
    fila: '"animation: none" en la raíz del fichero',
    lineas: ['.titular {', '  animation: none;', '}'],
    veredicto: 'pasa',
    señalados: [],
    fotogramas: 0,
    declaracionesDeEntradaEnNoPreference: 0,
  },
  {
    fila: '"animation" con un nombre de fotogramas, dentro de "reduce"',
    lineas: [BLOQUE_REDUCE, '  .titular {', '    animation: entrada 700ms ease-out backwards;', '  }', '}'],
    veredicto: 'incumple',
    señalados: [{ linea: 3, propiedad: 'animation' }],
    fotogramas: 0,
    declaracionesDeEntradaEnNoPreference: 0,
  },
  {
    fila: '"animation-name" con un nombre de fotogramas, dentro de "reduce"',
    lineas: [BLOQUE_REDUCE, '  .titular {', '    animation-name: entrada;', '  }', '}'],
    veredicto: 'incumple',
    señalados: [{ linea: 3, propiedad: 'animation-name' }],
    fotogramas: 0,
    declaracionesDeEntradaEnNoPreference: 0,
  },
  {
    fila: '"animation-name: none" dentro de "reduce"',
    lineas: [BLOQUE_REDUCE, '  .titular {', '    animation-name: none;', '  }', '}'],
    veredicto: 'incumple',
    señalados: [{ linea: 3, propiedad: 'animation-name' }],
    fotogramas: 0,
    declaracionesDeEntradaEnNoPreference: 0,
  },
  {
    fila: '"animation-delay: 0s" dentro de "reduce"',
    lineas: [BLOQUE_REDUCE, '  .titular {', '    animation-delay: 0s;', '  }', '}'],
    veredicto: 'incumple',
    señalados: [{ linea: 3, propiedad: 'animation-delay' }],
    fotogramas: 0,
    declaracionesDeEntradaEnNoPreference: 0,
  },
  {
    fila: '"animation: none" dentro de "reduce"',
    lineas: [BLOQUE_REDUCE, '  .titular {', '    animation: none;', '  }', '}'],
    veredicto: 'pasa',
    señalados: [],
    fotogramas: 0,
    declaracionesDeEntradaEnNoPreference: 0,
  },
  {
    fila: '"animation-duration: 0.01ms" y "animation-iteration-count: 1" dentro de "reduce", como la regla global',
    lineas: [
      BLOQUE_REDUCE,
      '  *,',
      '  *::before,',
      '  *::after {',
      '    animation-duration: 0.01ms;',
      '    animation-iteration-count: 1;',
      '  }',
      '}',
    ],
    veredicto: 'pasa',
    señalados: [],
    fotogramas: 0,
    declaracionesDeEntradaEnNoPreference: 0,
  },
  {
    fila: '"animation" con un nombre de fotogramas, dentro de "@media (max-width: 560px)"',
    lineas: [BLOQUE_OTRA_CONSULTA, '  .titular {', '    animation: entrada 700ms ease-out backwards;', '  }', '}'],
    veredicto: 'incumple',
    señalados: [{ linea: 3, propiedad: 'animation' }],
    fotogramas: 0,
    declaracionesDeEntradaEnNoPreference: 0,
  },
  {
    fila: '"animation-name" con un nombre de fotogramas, dentro de "@media (max-width: 560px)"',
    lineas: [BLOQUE_OTRA_CONSULTA, '  .titular {', '    animation-name: entrada;', '  }', '}'],
    veredicto: 'incumple',
    señalados: [{ linea: 3, propiedad: 'animation-name' }],
    fotogramas: 0,
    declaracionesDeEntradaEnNoPreference: 0,
  },
  {
    fila: '"animation-delay: 120ms" dentro de "@media (max-width: 560px)"',
    lineas: [BLOQUE_OTRA_CONSULTA, '  .parrafo {', '    animation-delay: 120ms;', '  }', '}'],
    veredicto: 'incumple',
    señalados: [{ linea: 3, propiedad: 'animation-delay' }],
    fotogramas: 0,
    declaracionesDeEntradaEnNoPreference: 0,
  },
  {
    fila: '"@keyframes" y su "animation", ambos dentro de "no-preference"',
    lineas: [
      BLOQUE_NO_PREFERENCE,
      ...FOTOGRAMAS_EN_VARIAS_LINEAS,
      '  .titular {',
      '    animation: entrada 700ms ease-out backwards;',
      '  }',
      '}',
    ],
    veredicto: 'pasa',
    señalados: [],
    fotogramas: 1,
    declaracionesDeEntradaEnNoPreference: 1,
  },
  {
    fila: '"@keyframes" en la raíz del fichero y su "animation" dentro de "no-preference"',
    lineas: [
      ...FOTOGRAMAS_EN_VARIAS_LINEAS.map((linea) => linea.slice(2)),
      BLOQUE_NO_PREFERENCE,
      '  .titular {',
      '    animation: entrada 700ms ease-out backwards;',
      '  }',
      '}',
    ],
    veredicto: 'pasa',
    señalados: [],
    fotogramas: 1,
    declaracionesDeEntradaEnNoPreference: 1,
  },
  {
    fila: '"@keyframes" dentro de "reduce", en una hoja que además lleva una animación legítima con sus fotogramas dentro de "no-preference"',
    lineas: [
      BLOQUE_NO_PREFERENCE,
      ...FOTOGRAMAS_EN_VARIAS_LINEAS,
      '  .titular {',
      '    animation: entrada 700ms ease-out backwards;',
      '  }',
      '}',
      BLOQUE_REDUCE,
      '  @keyframes salida {',
      '    to {',
      '      opacity: 0;',
      '    }',
      '  }',
      '}',
    ],
    veredicto: 'incumple',
    señalados: [{ linea: 15, propiedad: '@keyframes' }],
    fotogramas: 2,
    declaracionesDeEntradaEnNoPreference: 1,
  },
  {
    fila: '"@keyframes" dentro de "@media (max-width: 560px)", en una hoja que además lleva una animación legítima con sus fotogramas dentro de "no-preference"',
    lineas: [
      BLOQUE_NO_PREFERENCE,
      ...FOTOGRAMAS_EN_VARIAS_LINEAS,
      '  .titular {',
      '    animation: entrada 700ms ease-out backwards;',
      '  }',
      '}',
      BLOQUE_OTRA_CONSULTA,
      '  @keyframes salida {',
      '    to {',
      '      opacity: 0;',
      '    }',
      '  }',
      '}',
    ],
    veredicto: 'incumple',
    señalados: [{ linea: 15, propiedad: '@keyframes' }],
    fotogramas: 2,
    declaracionesDeEntradaEnNoPreference: 1,
  },
  {
    fila: 'fotogramas con sus bloques "from" y "to" escritos cada uno en una sola línea, dentro de "no-preference"',
    lineas: [BLOQUE_NO_PREFERENCE, '  @keyframes entrada {', '    from { opacity: 0; }', '    to { opacity: 1; }', '  }', '}'],
    veredicto: 'pasa',
    señalados: [],
    fotogramas: 1,
    declaracionesDeEntradaEnNoPreference: 0,
  },
  {
    fila: 'lo anterior, seguido de una "animation" con un nombre de fotogramas escrita DESPUÉS del cierre de "no-preference", en la raíz',
    lineas: [
      BLOQUE_NO_PREFERENCE,
      '  @keyframes entrada {',
      '    from { opacity: 0; }',
      '    to { opacity: 1; }',
      '  }',
      '}',
      '.titular {',
      '  animation: entrada 700ms ease-out backwards;',
      '}',
    ],
    veredicto: 'incumple',
    señalados: [{ linea: 8, propiedad: 'animation' }],
    fotogramas: 1,
    declaracionesDeEntradaEnNoPreference: 0,
  },
]

describe('hero_reducido_con_animacion @s8 (tabla de 22 filas del contrato): el veredicto de cada hoja sintética, SIN las guardas "mayor que 0"', () => {
  it('la tabla tiene exactamente las 22 filas del contrato', () => {
    expect(TABLA_DE_FILAS).toHaveLength(22)
  })

  it.each(TABLA_DE_FILAS)(
    '$veredicto: $fila',
    ({ lineas, veredicto, señalados, fotogramas, declaracionesDeEntradaEnNoPreference }) => {
      const informe = ejecutarPuertaDeEntradaSoloEnNoPreference([hojaSintetica(lineas)])

      expect(informe.incumplimientos).toEqual(señalados.map((señalado) => ({ ruta: RUTA_SINTETICA, ...señalado })))
      expect(informe.pasa).toBe(veredicto === 'pasa')
      expect(informe.ficherosLeidos).toBe(1)
      expect(informe.recuentoDeFotogramas).toBe(fotogramas)
      expect(informe.recuentoDeDeclaracionesDeEntradaEnNoPreference).toBe(declaracionesDeEntradaEnNoPreference)
    },
  )
})

describe('hero_reducido_con_animacion @s8: el análisis, más allá de la tabla', () => {
  it('"animation" con el valor en la línea siguiente sigue siendo una animación con nombre; con "none" en la siguiente, no', () => {
    const informe = ejecutarPuertaDeEntradaSoloEnNoPreference([
      hojaSintetica(['.a {', '  animation:', '    entrada 700ms ease-out;', '}', '.b {', '  animation:', '    none;', '}']),
    ])

    expect(informe.incumplimientos).toEqual([{ ruta: RUTA_SINTETICA, linea: 2, propiedad: 'animation' }])
  })

  it('las demás propiedades "animation-*" (duración, iteraciones, relleno, curva) no son de entrada y pasan en cualquier sitio', () => {
    const informe = ejecutarPuertaDeEntradaSoloEnNoPreference([
      hojaSintetica([
        '.a {',
        '  animation-duration: 0.7s;',
        '  animation-iteration-count: 1;',
        '  animation-fill-mode: backwards;',
        '  animation-timing-function: ease-out;',
        '  transition-delay: 120ms;',
        '}',
      ]),
    ])

    expect(informe.incumplimientos).toEqual([])
    expect(informe.pasa).toBe(true)
  })

  it('con varias hojas señala cada incumplimiento con SU ruta y suma los recuentos de todas', () => {
    const hojaConEntradaLegitima = {
      ruta: '/prueba/Legitima.module.scss',
      contenido: [BLOQUE_NO_PREFERENCE, ...FOTOGRAMAS_EN_VARIAS_LINEAS, '  .a {', '    animation: entrada 700ms;', '  }', '}', ''].join('\n'),
    }
    const hojaConUnaInfractora = {
      ruta: '/prueba/Infractora.module.scss',
      contenido: ['.b {', '  animation-delay: 120ms;', '}', BLOQUE_NO_PREFERENCE, '  .c {', '    animation-name: otra;', '  }', '}', ''].join('\n'),
    }

    const informe = ejecutarPuertaDeEntradaSoloEnNoPreference([hojaConEntradaLegitima, hojaConUnaInfractora])

    expect(informe.ficherosLeidos).toBe(2)
    expect(informe.incumplimientos).toEqual([{ ruta: '/prueba/Infractora.module.scss', linea: 2, propiedad: 'animation-delay' }])
    expect(informe.recuentoDeFotogramas).toBe(1)
    expect(informe.recuentoDeDeclaracionesDeEntradaEnNoPreference).toBe(2)
    expect(informe.pasa).toBe(false)
  })

  it('una hoja con una declaración y un @keyframes fuera de sitio señala las dos cosas', () => {
    const informe = ejecutarPuertaDeEntradaSoloEnNoPreference([
      hojaSintetica(['.a {', '  animation-name: x;', '}', BLOQUE_REDUCE, '  @keyframes y {', '    to { opacity: 1; }', '  }', '}']),
    ])

    expect(informe.incumplimientos).toEqual([
      { ruta: RUTA_SINTETICA, linea: 2, propiedad: 'animation-name' },
      { ruta: RUTA_SINTETICA, linea: 5, propiedad: '@keyframes' },
    ])
  })

  it('una "@media" ajena no cubre aunque contenga a "no-preference" fuera de su alcance: solo cubre estar DENTRO de "no-preference"', () => {
    const informe = ejecutarPuertaDeEntradaSoloEnNoPreference([
      hojaSintetica([BLOQUE_OTRA_CONSULTA, '  .a {', '    animation: x 1s;', '  }', '}', BLOQUE_NO_PREFERENCE, '  .b {', '    animation: y 1s;', '  }', '}']),
    ])

    expect(informe.incumplimientos).toEqual([{ ruta: RUTA_SINTETICA, linea: 3, propiedad: 'animation' }])
    expect(informe.recuentoDeDeclaracionesDeEntradaEnNoPreference).toBe(1)
  })

  it('una "@media" ajena que envuelve a "no-preference" no le quita la cobertura', () => {
    const informe = ejecutarPuertaDeEntradaSoloEnNoPreference([
      hojaSintetica([BLOQUE_OTRA_CONSULTA, `  ${BLOQUE_NO_PREFERENCE}`, '    .a {', '      animation: x 1s;', '    }', '  }', '}']),
    ])

    expect(informe.incumplimientos).toEqual([])
  })

  it('con 0 ficheros la puerta falla cerrada: no "pasa" por vacuidad', () => {
    const informe = ejecutarPuertaDeEntradaSoloEnNoPreference([])

    expect(informe.ficherosLeidos).toBe(0)
    expect(informe.incumplimientos).toEqual([])
    expect(informe.pasa).toBe(false)
  })
})

/**
 * El inventario REAL de la puerta: los 20 ficheros de estilos —3 de `src/styles`,
 * 12 de `src/components` y 5 de `src/pages`—. Es una invocación PROPIA: no
 * amplía el glob de los 17 módulos (`inventarioModulos.test.ts`) ni cambia las
 * 3 hojas globales que pasa `movimiento-global.test.ts` por @s33.
 *
 * LAS GUARDAS "MAYOR QUE 0" (hay al menos un `@keyframes` y al menos una
 * declaración de entrada dentro de `no-preference` en el CONJUNTO de las 20)
 * SÍ están, en el test de abajo: la hoja del hero declara su entrada animada
 * desde la feature 48, así que se afirman junto con el recuento de ficheros y
 * con que NINGUNA hoja real incumple. Sin ellas la puerta daría el verde por
 * vacuidad si alguien retirara la animación.
 */
const HOJAS_REALES_DEL_INVENTARIO = {
  estilos: import.meta.glob('../../styles/*.scss', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>,
  componentes: import.meta.glob('../../components/*.module.scss', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>,
  paginas: import.meta.glob('../../pages/*.module.scss', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>,
}

function aFicheros(hojas: Record<string, string>): { ruta: string; contenido: string }[] {
  return Object.entries(hojas).map(([ruta, contenido]) => ({ ruta, contenido }))
}

describe('hero_reducido_con_animacion @s8 sobre las 20 hojas reales del inventario', () => {
  it('lee exactamente 20 ficheros (3 + 12 + 5) y ninguno declara entrada fuera de "no-preference" ni fotogramas fuera de sitio', () => {
    expect(Object.keys(HOJAS_REALES_DEL_INVENTARIO.estilos).map((ruta) => ruta.split('/').pop()).toSorted()).toEqual([
      '_api.scss',
      '_tokens.scss',
      'global.scss',
    ])
    expect(Object.keys(HOJAS_REALES_DEL_INVENTARIO.componentes)).toHaveLength(12)
    expect(Object.keys(HOJAS_REALES_DEL_INVENTARIO.paginas)).toHaveLength(5)
    const ficheros = [
      ...aFicheros(HOJAS_REALES_DEL_INVENTARIO.estilos),
      ...aFicheros(HOJAS_REALES_DEL_INVENTARIO.componentes),
      ...aFicheros(HOJAS_REALES_DEL_INVENTARIO.paginas),
    ]

    const informe = ejecutarPuertaDeEntradaSoloEnNoPreference(ficheros)

    expect(informe.ficherosLeidos).toBe(20)
    expect(informe.incumplimientos).toEqual([])
    expect(informe.ficherosSinLecturaFiable).toEqual([])
    expect(informe.pasa).toBe(true)
    // Las dos guardas anti-vacuidad del contrato, sobre el CONJUNTO de las hojas reales: que la puerta haya
    // encontrado algo que comprobar (los fotogramas y las declaraciones de entrada de la hoja del hero).
    expect(informe.recuentoDeFotogramas).toBeGreaterThan(0)
    expect(informe.recuentoDeDeclaracionesDeEntradaEnNoPreference).toBeGreaterThan(0)
  })
})

/**
 * OLA 4B de la feature 48 (revisión independiente): lo que el lector mejorado
 * (B1, B2, B5) cambia para las dos puertas de este módulo, y los cierres de B6
 * y B7. Cada comportamiento nuevo se prueba también con los finales de línea de
 * Windows, que tienen que dar el MISMO informe.
 */
const FIN_DE_LINEA_DE_WINDOWS = '\r\n'

function enCrlf(fichero: { ruta: string; contenido: string }): { ruta: string; contenido: string } {
  return { ruta: fichero.ruta, contenido: fichero.contenido.replaceAll('\n', FIN_DE_LINEA_DE_WINDOWS) }
}

describe('hero_reducido_con_animacion @s8: CRLF y LF dan el mismo informe en cada fila de la tabla', () => {
  it.each(TABLA_DE_FILAS)('$veredicto: $fila', ({ lineas }) => {
    const conLf = ejecutarPuertaDeEntradaSoloEnNoPreference([hojaSintetica(lineas)])
    const conCrlf = ejecutarPuertaDeEntradaSoloEnNoPreference([enCrlf(hojaSintetica(lineas))])

    expect(conCrlf).toEqual(conLf)
  })
})

describe('@s33 con finales de línea de Windows: el mismo informe que con LF', () => {
  it('una transición sin cubrir se señala igual y en la misma línea', () => {
    const hoja = { ruta: '/prueba/Crlf.module.scss', contenido: '.a {\n  color: red;\n  transition: color 1s;\n}\n' }

    expect(ejecutarPuertaDeMovimientoRespetuoso([enCrlf(hoja)])).toEqual(ejecutarPuertaDeMovimientoRespetuoso([hoja]))
    expect(ejecutarPuertaDeMovimientoRespetuoso([hoja]).incumplimientos).toEqual([{ ruta: '/prueba/Crlf.module.scss', linea: 3 }])
  })
})

describe('B5: las propiedades en mayúsculas o con prefijo de fabricante también son de movimiento', () => {
  it.each(['ANIMATION: x 900ms 77ms', '-webkit-animation: x 900ms 77ms', 'Transition-Delay: 77ms', '-webkit-transition: color 900ms', '-moz-animation-duration: 900ms'])(
    '@s33: "%s" fuera de cualquier consulta de movimiento se señala',
    (declaracion) => {
      const hoja = { ruta: '/prueba/Fabricante.module.scss', contenido: `.m {\n  ${declaracion};\n}\n` }

      const informe = ejecutarPuertaDeMovimientoRespetuoso([hoja])
      const informeConCrlf = ejecutarPuertaDeMovimientoRespetuoso([enCrlf(hoja)])

      expect(informe.ficherosComprobados).toBe(1)
      expect(informe.incumplimientos).toEqual([{ ruta: '/prueba/Fabricante.module.scss', linea: 2 }])
      expect(informe.pasa).toBe(false)
      expect(informeConCrlf).toEqual(informe)
    },
  )

  it.each([
    ['ANIMATION: x 900ms 77ms', 'ANIMATION'],
    ['-webkit-animation: x 900ms 77ms', '-webkit-animation'],
    ['-webkit-animation-name: x', '-webkit-animation-name'],
    ['Animation-Delay: 77ms', 'Animation-Delay'],
    ['-moz-animation-delay: 77ms', '-moz-animation-delay'],
  ])('@s8: "%s" en la raíz se señala, con el nombre tal como está escrito', (declaracion, propiedad) => {
    const hoja = hojaSintetica(['.m {', `  ${declaracion};`, '}'])

    const informe = ejecutarPuertaDeEntradaSoloEnNoPreference([hoja])

    expect(informe.incumplimientos).toEqual([{ ruta: RUTA_SINTETICA, linea: 2, propiedad }])
    expect(ejecutarPuertaDeEntradaSoloEnNoPreference([enCrlf(hoja)])).toEqual(informe)
  })

  it('@s8: la entrada con prefijo o en mayúsculas DENTRO de "no-preference" pasa y se cuenta', () => {
    const informe = ejecutarPuertaDeEntradaSoloEnNoPreference([
      hojaSintetica([BLOQUE_NO_PREFERENCE, '  .m {', '    -webkit-animation: x 700ms;', '    ANIMATION-DELAY: 120ms;', '  }', '}']),
    ])

    expect(informe.incumplimientos).toEqual([])
    expect(informe.recuentoDeDeclaracionesDeEntradaEnNoPreference).toBe(2)
  })
})

describe('B4/B6: "animation: none" no es una entrada, escrita como se escriba', () => {
  it.each(['animation: none', 'animation: NONE', 'animation: none !important', 'animation: None!important', '-webkit-animation: none'])(
    '"%s" en la raíz pasa @s8',
    (declaracion) => {
      const informe = ejecutarPuertaDeEntradaSoloEnNoPreference([hojaSintetica(['.m {', `  ${declaracion};`, '}'])])

      expect(informe.incumplimientos).toEqual([])
      expect(informe.pasa).toBe(true)
    },
  )

  it('"animation: entrada 700ms !important" en la raíz se señala: el !important no la disfraza', () => {
    const informe = ejecutarPuertaDeEntradaSoloEnNoPreference([hojaSintetica(['.m {', '  animation: entrada 700ms !important;', '}'])])

    expect(informe.incumplimientos).toEqual([{ ruta: RUTA_SINTETICA, linea: 2, propiedad: 'animation' }])
  })

  it('"animation-name: none" SÍ cuenta como entrada (fila firmada de @s8: dentro de "reduce" incumple)', () => {
    const informe = ejecutarPuertaDeEntradaSoloEnNoPreference([hojaSintetica(['.m {', '  animation-name: none;', '}'])])

    expect(informe.incumplimientos).toEqual([{ ruta: RUTA_SINTETICA, linea: 2, propiedad: 'animation-name' }])
  })
})

describe('B2: una consulta que también se cumple con movimiento reducido no cubre la entrada', () => {
  it.each([
    '@media not (prefers-reduced-motion: no-preference)',
    '@media (prefers-reduced-motion: no-preference), (max-width: 560px)',
    '@media (prefers-reduced-motion: no-preference) or (min-width: 0)',
    '@media (prefers-reduced-motion: no-preference) and (prefers-reduced-motion: reduce)',
    '@media not all and (prefers-reduced-motion: no-preference)',
  ])('@s8: una animación dentro de "%s" se señala', (consulta) => {
    const hoja = hojaSintetica([`${consulta} {`, '  .m {', '    animation: x 900ms 77ms;', '  }', '}'])

    const informe = ejecutarPuertaDeEntradaSoloEnNoPreference([hoja])

    expect(informe.incumplimientos).toEqual([{ ruta: RUTA_SINTETICA, linea: 3, propiedad: 'animation' }])
    expect(informe.recuentoDeDeclaracionesDeEntradaEnNoPreference).toBe(0)
    expect(ejecutarPuertaDeEntradaSoloEnNoPreference([enCrlf(hoja)])).toEqual(informe)
  })

  it('@s33: una transición dentro de "@media not (prefers-reduced-motion: reduce)" ya no se da por cubierta por "reduce"', () => {
    const hoja = { ruta: '/prueba/Invertida.module.scss', contenido: '@media not (prefers-reduced-motion: reduce) {\n  .m {\n    transition: color 1s;\n  }\n}\n' }

    const informe = ejecutarPuertaDeMovimientoRespetuoso([hoja])

    expect(informe.incumplimientos).toEqual([{ ruta: '/prueba/Invertida.module.scss', linea: 3 }])
    expect(ejecutarPuertaDeMovimientoRespetuoso([enCrlf(hoja)])).toEqual(informe)
  })

  it.each(['@-webkit-keyframes', '@KEYFRAMES'])('@s8: "%s" dentro de "reduce" se señala y cuenta como fotogramas', (arranque) => {
    const hoja = hojaSintetica([BLOQUE_REDUCE, `  ${arranque} salida {`, '    to { opacity: 0; }', '  }', '}'])

    const informe = ejecutarPuertaDeEntradaSoloEnNoPreference([hoja])

    expect(informe.incumplimientos).toEqual([{ ruta: RUTA_SINTETICA, linea: 2, propiedad: '@keyframes' }])
    expect(informe.recuentoDeFotogramas).toBe(1)
  })
})

describe('B1: una hoja que el lector no puede leer entera hace fallar CERRADAS las dos puertas', () => {
  const FICHERO_LIMPIO = {
    ruta: '/prueba/Limpio.module.scss',
    contenido: [BLOQUE_NO_PREFERENCE, '  .a {', '    animation: entrada 700ms ease-out backwards;', '  }', '}', ''].join('\n'),
  }
  const RUTA_ROTA = '/prueba/Rota.module.scss'

  it('el fichero limpio, solo, pasa las dos puertas y no declara ninguna hoja sin lectura fiable', () => {
    const deMovimiento = ejecutarPuertaDeMovimientoRespetuoso([FICHERO_LIMPIO])
    const deEntrada = ejecutarPuertaDeEntradaSoloEnNoPreference([FICHERO_LIMPIO])

    expect(deMovimiento.pasa).toBe(true)
    expect(deMovimiento.ficherosSinLecturaFiable).toEqual([])
    expect(deEntrada.pasa).toBe(true)
    expect(deEntrada.ficherosSinLecturaFiable).toEqual([])
  })

  it.each([
    ['una llave de apertura sin cerrar', '.a {\n  color: red;\n'],
    ['una llave de cierre de más', '.a {\n  color: red;\n}\n}\n'],
    ['un nombre de propiedad con interpolación', '.a {\n  #{$p}: 900ms;\n}\n'],
    ['una cadena sin cerrar', '.a {\n  content: "abc;\n}\n'],
  ])('%s: la hoja se nombra y ninguna de las dos pasa, aunque no declare movimiento', (_caso, contenido) => {
    const rota = { ruta: RUTA_ROTA, contenido }

    for (const ficheros of [
      [FICHERO_LIMPIO, rota],
      [FICHERO_LIMPIO, enCrlf(rota)],
    ]) {
      const deMovimiento = ejecutarPuertaDeMovimientoRespetuoso(ficheros)
      const deEntrada = ejecutarPuertaDeEntradaSoloEnNoPreference(ficheros)

      expect(deMovimiento.ficherosSinLecturaFiable).toEqual([RUTA_ROTA])
      expect(deMovimiento.incumplimientos).toEqual([])
      expect(deMovimiento.pasa).toBe(false)
      expect(deEntrada.ficherosSinLecturaFiable).toEqual([RUTA_ROTA])
      expect(deEntrada.incumplimientos).toEqual([])
      expect(deEntrada.pasa).toBe(false)
    }
  })

  it('con varias hojas sin lectura fiable se nombran todas, en el orden en que llegan', () => {
    const ficheros = [
      { ruta: '/prueba/UnoRota.module.scss', contenido: '.a {\n' },
      FICHERO_LIMPIO,
      { ruta: '/prueba/DosRota.module.scss', contenido: '}\n' },
    ]

    expect(ejecutarPuertaDeMovimientoRespetuoso(ficheros).ficherosSinLecturaFiable).toEqual(['/prueba/UnoRota.module.scss', '/prueba/DosRota.module.scss'])
    expect(ejecutarPuertaDeEntradaSoloEnNoPreference(ficheros).ficherosSinLecturaFiable).toEqual(['/prueba/UnoRota.module.scss', '/prueba/DosRota.module.scss'])
  })

  it('la llave dentro de una cadena ya no desordena la pila: una animación posterior se señala donde está', () => {
    const hoja = hojaSintetica([BLOQUE_NO_PREFERENCE, '  .b::before { content: "{"; }', '}', '.m { animation: x 900ms 77ms; }'])

    const informe = ejecutarPuertaDeEntradaSoloEnNoPreference([hoja])

    expect(informe.incumplimientos).toEqual([{ ruta: RUTA_SINTETICA, linea: 4, propiedad: 'animation' }])
    expect(informe.ficherosSinLecturaFiable).toEqual([])
  })

  it('una "//" pegada a un punto y coma ya no se traga la animación de la línea siguiente', () => {
    const hoja = hojaSintetica(['.m { color: red;// nota', '  animation: x 900ms 77ms; }'])

    const informe = ejecutarPuertaDeEntradaSoloEnNoPreference([hoja])
    const deMovimiento = ejecutarPuertaDeMovimientoRespetuoso([hoja])

    expect(informe.incumplimientos).toEqual([{ ruta: RUTA_SINTETICA, linea: 2, propiedad: 'animation' }])
    expect(deMovimiento.incumplimientos).toEqual([{ ruta: RUTA_SINTETICA, linea: 2 }])
  })
})
