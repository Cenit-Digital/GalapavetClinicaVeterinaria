import { describe, expect, it } from 'vitest'
import {
  type FicheroEstilos,
  ejecutarPuertaDeEscalaDeMovimiento,
  escalaDeMovimientoDeclarada,
} from './escalaMovimiento'

function ficheroDeEstilos(ruta: string, contenido: string): FicheroEstilos {
  return { ruta, contenido }
}

function leerHojas(hojas: Record<string, string>): FicheroEstilos[] {
  return Object.entries(hojas).map(([ruta, contenido]) => ficheroDeEstilos(ruta, contenido))
}

// El inventario FIJADO por identidad_visual @s16: 3 + 12 + 5. Es una invocación propia de esta puerta,
// distinta de los 17 módulos de `inventarioModulos.test.ts` y de las 3 hojas globales de `movimiento-global.test.ts`.
const HOJAS_GLOBALES = import.meta.glob('../../styles/*.scss', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>
const HOJAS_DE_COMPONENTES = import.meta.glob('../../components/*.module.scss', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>
const HOJAS_DE_PAGINAS = import.meta.glob('../../pages/*.module.scss', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>

const FICHEROS_REALES: readonly FicheroEstilos[] = [
  ...leerHojas(HOJAS_GLOBALES),
  ...leerHojas(HOJAS_DE_COMPONENTES),
  ...leerHojas(HOJAS_DE_PAGINAS),
]

describe('identidad_visual @s16 la escala de movimiento declara exactamente tres duraciones, tres retardos y una curva de salida', () => {
  it('la escala contiene exactamente 150, 300 y 700 ms de duración, 0, 120 y 240 ms de retardo, y la curva es exactamente "ease-out"', () => {
    // Literal escrito a mano — NO se obtiene de la escala que se comprueba (patrón doble-de-test-anclado-al-literal).
    const escalaAMano = { duraciones: [150, 300, 700], retardos: [0, 120, 240], curva: 'ease-out' }

    const escala = escalaDeMovimientoDeclarada()

    expect(escala.duracionesMs).toEqual(escalaAMano.duraciones)
    expect(escala.retardosMs).toEqual(escalaAMano.retardos)
    expect(escala.curva).toBe(escalaAMano.curva)
  })

  it('el inventario son exactamente 20 ficheros: 3 de src/styles, 12 de src/components y 5 de src/pages', () => {
    expect(Object.keys(HOJAS_GLOBALES).map((ruta) => ruta.split('/').pop())).toEqual(
      expect.arrayContaining(['_api.scss', '_tokens.scss', 'global.scss']),
    )
    expect(Object.keys(HOJAS_GLOBALES)).toHaveLength(3)
    expect(Object.keys(HOJAS_DE_COMPONENTES)).toHaveLength(12)
    expect(Object.keys(HOJAS_DE_PAGINAS)).toHaveLength(5)
    expect(FICHEROS_REALES).toHaveLength(20)
  })

  it('ninguna declaración de movimiento de los 20 ficheros reales usa una duración o un retardo fuera de la escala ni un valor no verificable', () => {
    const informe = ejecutarPuertaDeEscalaDeMovimiento(FICHEROS_REALES)

    expect(informe.ficherosInspeccionados).toBe(20)
    expect(informe.duracionesFueraDeEscala).toEqual([])
    expect(informe.retardosFueraDeEscala).toEqual([])
    expect(informe.valoresNoVerificables).toEqual([])
  })

  it('ninguna declaración real anima la palabra clave "all"', () => {
    const informe = ejecutarPuertaDeEscalaDeMovimiento(FICHEROS_REALES)

    expect(informe.usosDePalabraClaveAll).toEqual([])
    expect(informe.pasa).toBe(true)
  })

  it('con 0 ficheros la puerta falla cerrada, nunca "pasa" por vacuidad', () => {
    const informe = ejecutarPuertaDeEscalaDeMovimiento([])

    expect(informe.ficherosInspeccionados).toBe(0)
    expect(informe.pasa).toBe(false)
    expect(informe.duracionesFueraDeEscala).toEqual([])
    expect(informe.retardosFueraDeEscala).toEqual([])
    expect(informe.valoresNoVerificables).toEqual([])
    expect(informe.usosDePalabraClaveAll).toEqual([])
  })
})

/**
 * LA TABLA DEL CONTRATO (30 filas). Cada fila es una mutación o una regresión
 * del módulo: «fuera» = la puerta tiene que ponerse roja, y por la RAZÓN que dice
 * la fila (el tipo y el valor exacto del hallazgo, no solo `pasa = false`);
 * «dentro» = no puede dar un falso rojo contra lo que el hero declara de verdad.
 * Los valores se afirman exactos: son también lo que delataría una deriva de
 * coma flotante al pasar `0.15s` o `0.24s` a milisegundos.
 */
const RUTA_SINTETICA = '/prueba/tabla.scss'

interface Hallazgos {
  readonly duraciones: readonly number[]
  readonly retardos: readonly number[]
  readonly noVerificables: readonly string[]
}

const SIN_HALLAZGOS: Hallazgos = { duraciones: [], retardos: [], noVerificables: [] }

interface FilaDeLaTabla {
  /** La declaración sintética, tal como la escribe el contrato. */
  readonly fila: string
  /** La hoja que se construye: la declaración empieza SIEMPRE en la línea 2. */
  readonly lineas: readonly string[]
  readonly esperado: Hallazgos
  /** Para la fila del mixin de `_api.scss`. */
  readonly ruta?: string
}

function enUnaRegla(...lineasDeLaDeclaracion: readonly string[]): readonly string[] {
  return ['.x {', ...lineasDeLaDeclaracion, '}']
}

const TABLA_DE_FILAS: readonly FilaDeLaTabla[] = [
  { fila: 'transition: color 150ms ease-out', lineas: enUnaRegla('  transition: color 150ms ease-out;'), esperado: SIN_HALLAZGOS },
  {
    fila: 'animation: entrada 700ms ease-out backwards',
    lineas: enUnaRegla('  animation: entrada 700ms ease-out backwards;'),
    esperado: SIN_HALLAZGOS,
  },
  {
    fila: 'animation: entrada 0.7s ease-out 120ms both',
    lineas: enUnaRegla('  animation: entrada 0.7s ease-out 120ms both;'),
    esperado: SIN_HALLAZGOS,
  },
  { fila: 'animation-duration: 0.7s', lineas: enUnaRegla('  animation-duration: 0.7s;'), esperado: SIN_HALLAZGOS },
  { fila: 'animation-delay: 240ms', lineas: enUnaRegla('  animation-delay: 240ms;'), esperado: SIN_HALLAZGOS },
  { fila: 'animation-delay: 0s', lineas: enUnaRegla('  animation-delay: 0s;'), esperado: SIN_HALLAZGOS },
  {
    fila: 'animation-duration: 0.01ms (el corte por menos movimiento)',
    lineas: enUnaRegla('  animation-duration: 0.01ms;'),
    esperado: SIN_HALLAZGOS,
  },
  {
    fila: 'animation: entrada 1.25s ease-out backwards (duración de 1250 ms)',
    lineas: enUnaRegla('  animation: entrada 1.25s ease-out backwards;'),
    esperado: { ...SIN_HALLAZGOS, duraciones: [1250] },
  },
  {
    fila: 'animation-duration: 1.25s (duración de 1250 ms)',
    lineas: enUnaRegla('  animation-duration: 1.25s;'),
    esperado: { ...SIN_HALLAZGOS, duraciones: [1250] },
  },
  {
    fila: 'animation-delay: 200ms (retardo de 200 ms)',
    lineas: enUnaRegla('  animation-delay: 200ms;'),
    esperado: { ...SIN_HALLAZGOS, retardos: [200] },
  },
  {
    fila: 'animation-delay: 0.15s (150 es una duración de la escala, no un retardo)',
    lineas: enUnaRegla('  animation-delay: 0.15s;'),
    esperado: { ...SIN_HALLAZGOS, retardos: [150] },
  },
  {
    fila: 'animation: entrada 120ms ease-out 700ms both (duración de 120 y retardo de 700: los dos números en el papel cambiado)',
    lineas: enUnaRegla('  animation: entrada 120ms ease-out 700ms both;'),
    esperado: { ...SIN_HALLAZGOS, duraciones: [120], retardos: [700] },
  },
  {
    fila: 'animation-delay: -120ms (retardo negativo)',
    lineas: enUnaRegla('  animation-delay: -120ms;'),
    esperado: { ...SIN_HALLAZGOS, retardos: [-120] },
  },
  {
    fila: 'transition: color 300ms ease-out 400ms (retardo de 400 ms)',
    lineas: enUnaRegla('  transition: color 300ms ease-out 400ms;'),
    esperado: { ...SIN_HALLAZGOS, retardos: [400] },
  },
  {
    fila: 'la propiedad "animation:" sola en una línea y "entrada 1.25s ease-out backwards" en la línea siguiente',
    lineas: enUnaRegla('  animation:', '    entrada 1.25s ease-out backwards;'),
    esperado: { ...SIN_HALLAZGOS, duraciones: [1250] },
  },
  {
    fila: 'la propiedad "transition:" sola en una línea, y "transform 300ms ease-out," y "color 150ms ease-out" en las dos siguientes (como el módulo del equipo)',
    lineas: enUnaRegla('  transition:', '    transform 300ms ease-out,', '    color 150ms ease-out;'),
    esperado: SIN_HALLAZGOS,
  },
  {
    fila: 'transition: color 150ms ease-out, transform 300ms ease-out 400ms (retardo de 400 ms en la SEGUNDA entrada)',
    lineas: enUnaRegla('  transition: color 150ms ease-out, transform 300ms ease-out 400ms;'),
    esperado: { ...SIN_HALLAZGOS, retardos: [400] },
  },
  {
    fila: 'transition: color 150ms ease-out, transform 400ms ease-out (duración de 400 ms en la SEGUNDA entrada)',
    lineas: enUnaRegla('  transition: color 150ms ease-out, transform 400ms ease-out;'),
    esperado: { ...SIN_HALLAZGOS, duraciones: [400] },
  },
  {
    fila: '"transition:" sola y tres líneas de continuación donde la segunda o la tercera lleva un valor fuera de escala (dos declaraciones, una por caso)',
    lineas: [
      '.x {',
      '  transition:',
      '    color 150ms ease-out,',
      '    transform 400ms ease-out,',
      '    opacity 150ms ease-out;',
      '  transition:',
      '    color 150ms ease-out,',
      '    transform 300ms ease-out,',
      '    opacity 150ms ease-out 400ms;',
      '}',
    ],
    esperado: { ...SIN_HALLAZGOS, duraciones: [400], retardos: [400] },
  },
  {
    fila: 'transition-delay: 400ms (retardo de 400 ms)',
    lineas: enUnaRegla('  transition-delay: 400ms;'),
    esperado: { ...SIN_HALLAZGOS, retardos: [400] },
  },
  { fila: 'transition-delay: 120ms', lineas: enUnaRegla('  transition-delay: 120ms;'), esperado: SIN_HALLAZGOS },
  { fila: 'animation-delay: 0.24s (240 ms escritos en segundos)', lineas: enUnaRegla('  animation-delay: 0.24s;'), esperado: SIN_HALLAZGOS },
  { fila: 'transition-delay: 0.12s (120 ms escritos en segundos)', lineas: enUnaRegla('  transition-delay: 0.12s;'), esperado: SIN_HALLAZGOS },
  {
    fila: 'animation-duration: 120ms (120 es un retardo de la escala, no una duración)',
    lineas: enUnaRegla('  animation-duration: 120ms;'),
    esperado: { ...SIN_HALLAZGOS, duraciones: [120] },
  },
  {
    fila: 'animation-duration: .7s (sin cero inicial es el mismo 700 ms)',
    lineas: enUnaRegla('  animation-duration: .7s;'),
    esperado: SIN_HALLAZGOS,
  },
  {
    fila: 'animation-duration: .25s (duración de 250 ms)',
    lineas: enUnaRegla('  animation-duration: .25s;'),
    esperado: { ...SIN_HALLAZGOS, duraciones: [250] },
  },
  {
    fila: 'animation: entrada var(--duracion) ease-out backwards (no verificable: falla cerrada)',
    lineas: enUnaRegla('  animation: entrada var(--duracion) ease-out backwards;'),
    esperado: { ...SIN_HALLAZGOS, noVerificables: ['var(--duracion)'] },
  },
  {
    fila: 'animation: entrada $duracion-entrada ease-out backwards (no verificable: falla cerrada)',
    lineas: enUnaRegla('  animation: entrada $duracion-entrada ease-out backwards;'),
    esperado: { ...SIN_HALLAZGOS, noVerificables: ['$duracion-entrada'] },
  },
  {
    fila: 'transition: color calc(100ms + 50ms) ease-out (no verificable: ni 100 ni 50 se leen como literales)',
    lineas: enUnaRegla('  transition: color calc(100ms + 50ms) ease-out;'),
    esperado: { ...SIN_HALLAZGOS, noVerificables: ['calc(100ms + 50ms)'] },
  },
  {
    fila: 'transition: box-shadow 400ms ease-out, escrita dentro de un "@mixin" de "src/styles/_api.scss"',
    lineas: ['@mixin boton-primario {', '  transition: box-shadow 400ms ease-out;', '}'],
    esperado: { ...SIN_HALLAZGOS, duraciones: [400] },
    ruta: 'src/styles/_api.scss',
  },
]

function lineasDeLosHallazgos(fila: FilaDeLaTabla): readonly number[] {
  // Cada hallazgo se señala en la línea donde ARRANCA su declaración; solo la fila de dos declaraciones tiene dos.
  return fila.fila.startsWith('"transition:" sola y tres') ? [2, 6] : [2]
}

describe('identidad_visual @s16 (tabla de 30 filas del contrato): el veredicto de la puerta sobre cada declaración sintética', () => {
  it('la tabla tiene exactamente las 30 filas del contrato', () => {
    expect(TABLA_DE_FILAS).toHaveLength(30)
  })

  it.each(TABLA_DE_FILAS)('$fila', (fila) => {
    const ruta = fila.ruta ?? RUTA_SINTETICA
    const informe = ejecutarPuertaDeEscalaDeMovimiento([ficheroDeEstilos(ruta, [...fila.lineas, ''].join('\n'))])
    const [primeraLinea, segundaLinea = primeraLinea] = lineasDeLosHallazgos(fila)

    expect(informe.duracionesFueraDeEscala.map((hallazgo) => hallazgo.valorMs)).toEqual(fila.esperado.duraciones)
    expect(informe.retardosFueraDeEscala.map((hallazgo) => hallazgo.valorMs)).toEqual(fila.esperado.retardos)
    expect(informe.valoresNoVerificables.map((hallazgo) => hallazgo.valor)).toEqual(fila.esperado.noVerificables)
    expect(informe.usosDePalabraClaveAll).toEqual([])
    expect(informe.pasa).toBe(
      fila.esperado.duraciones.length + fila.esperado.retardos.length + fila.esperado.noVerificables.length === 0,
    )
    for (const hallazgo of [...informe.duracionesFueraDeEscala, ...informe.retardosFueraDeEscala, ...informe.valoresNoVerificables]) {
      expect(hallazgo.ruta).toBe(ruta)
      expect([primeraLinea, segundaLinea]).toContain(hallazgo.linea)
    }
  })
})

function informeDe(...lineasDeLaHoja: readonly string[]) {
  return ejecutarPuertaDeEscalaDeMovimiento([ficheroDeEstilos(RUTA_SINTETICA, [...lineasDeLaHoja, ''].join('\n'))])
}

describe('identidad_visual @s16: la lectura de los tiempos, más allá de la tabla', () => {
  it('el caso que fijaba que un "animation-delay" quedaba fuera del análisis se INVIERTE: un retardo fuera de escala se señala', () => {
    const informe = informeDe('body {', '  animation-delay: 500ms;', '}')

    expect(informe.retardosFueraDeEscala).toEqual([{ ruta: RUTA_SINTETICA, linea: 2, valorMs: 500 }])
    expect(informe.pasa).toBe(false)
  })

  it('señala una duración sintética de 400ms fuera de la escala, con su ruta y línea', () => {
    const informe = informeDe('body {', '  transition: color 400ms ease-out;', '}')

    expect(informe.duracionesFueraDeEscala).toEqual([{ ruta: RUTA_SINTETICA, linea: 2, valorMs: 400 }])
    expect(informe.pasa).toBe(false)
  })

  it('el corte de 0.01ms vale como duración y NUNCA como retardo', () => {
    const informe = informeDe('body {', '  animation-delay: 0.01ms;', '  transition-duration: 0.01ms;', '}')

    expect(informe.retardosFueraDeEscala).toEqual([{ ruta: RUTA_SINTETICA, linea: 2, valorMs: 0.01 }])
    expect(informe.duracionesFueraDeEscala).toEqual([])
  })

  it('una duración de 0 o igual a un retardo de la escala está fuera de la escala de duraciones', () => {
    const informe = informeDe('body {', '  animation-duration: 0s;', '  transition-duration: 240ms;', '}')

    expect(informe.duracionesFueraDeEscala).toEqual([
      { ruta: RUTA_SINTETICA, linea: 2, valorMs: 0 },
      { ruta: RUTA_SINTETICA, linea: 3, valorMs: 240 },
    ])
  })

  it('las propiedades que no llevan tiempos no se validan, ni siquiera con valores que la puerta no sabría leer', () => {
    const informe = informeDe(
      '@media (prefers-reduced-motion: reduce) {',
      '  * {',
      '    animation-iteration-count: 1;',
      '    animation-fill-mode: backwards;',
      '    animation-name: $nombre;',
      '    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);',
      '    transition-property: var(--propiedad);',
      '  }',
      '}',
    )

    expect(informe.duracionesFueraDeEscala).toEqual([])
    expect(informe.retardosFueraDeEscala).toEqual([])
    expect(informe.valoresNoVerificables).toEqual([])
    expect(informe.pasa).toBe(true)
  })

  it('un token que solo CONTIENE un tiempo (el nombre "fade400ms", la unidad "400msx") no es un tiempo', () => {
    const informe = informeDe('.x {', '  animation: fade400ms 300ms ease-out;', '  transition: color 400msx ease-out;', '}')

    expect(informe.duracionesFueraDeEscala).toEqual([])
    expect(informe.retardosFueraDeEscala).toEqual([])
    expect(informe.valoresNoVerificables).toEqual([])
  })

  it('una función de curva ("cubic-bezier") no se parte por sus comas: es UN valor no verificable, y la lista sigue leyéndose entrada a entrada', () => {
    const informe = informeDe('.x {', '  transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1), transform 400ms ease-out;', '}')

    expect(informe.valoresNoVerificables.map((valor) => valor.valor)).toEqual(['cubic-bezier(0.4, 0, 0.2, 1)'])
    expect(informe.duracionesFueraDeEscala.map((duracion) => duracion.valorMs)).toEqual([400])
    expect(informe.retardosFueraDeEscala).toEqual([])
  })

  it('los tiempos separados por tabuladores, por saltos de línea o por varios espacios se leen igual', () => {
    const informe = informeDe('.x {', '  transition: color\t400ms\tease-out;', '  animation: entrada\n    1.25s\n    ease-out;', '  animation-delay:  500ms;', '}')

    expect(informe.duracionesFueraDeEscala.map((duracion) => duracion.valorMs)).toEqual([400, 1250])
    expect(informe.retardosFueraDeEscala.map((retardo) => retardo.valorMs)).toEqual([500])
  })

  it('los paréntesis anidados se cierran bien: lo que va tras ellos se sigue leyendo', () => {
    const informe = informeDe('.x {', '  transition: color calc((1ms + 2ms) * 3) 400ms ease-out;', '}')

    expect(informe.valoresNoVerificables.map((valor) => valor.valor)).toEqual(['calc((1ms + 2ms) * 3)'])
    expect(informe.duracionesFueraDeEscala.map((duracion) => duracion.valorMs)).toEqual([400])
  })

  it('una interpolación de Sass en un tiempo falla cerrada', () => {
    const informe = informeDe('.x {', '  transition: color #{$duracion} ease-out;', '}')

    expect(informe.valoresNoVerificables.map((valor) => valor.valor)).toEqual(['#{$duracion}'])
  })

  it('"transition"/"animation" dentro de un comentario no cuenta como línea de movimiento', () => {
    const informe = informeDe('body {', '  /* antes: transition: 999ms */', '  // animation-delay: 999ms;', '}')

    expect(informe.duracionesFueraDeEscala).toEqual([])
    expect(informe.retardosFueraDeEscala).toEqual([])
  })

  it('una línea "transition" con un espacio antes de los dos puntos sigue contando como línea de movimiento', () => {
    const informe = informeDe('body {', '  transition : color 400ms;', '}')

    expect(informe.duracionesFueraDeEscala).toEqual([{ ruta: RUTA_SINTETICA, linea: 2, valorMs: 400 }])
  })

  it('con varios ficheros cada hallazgo lleva SU ruta y los de todos se suman', () => {
    const informe = ejecutarPuertaDeEscalaDeMovimiento([
      ficheroDeEstilos('/prueba/uno.scss', 'a {\n  transition: color 400ms;\n}\n'),
      ficheroDeEstilos('/prueba/dos.scss', 'a {\n  transition-delay: 500ms;\n  animation: x $d;\n  transition: all 150ms;\n}\n'),
    ])

    expect(informe.ficherosInspeccionados).toBe(2)
    expect(informe.duracionesFueraDeEscala).toEqual([{ ruta: '/prueba/uno.scss', linea: 2, valorMs: 400 }])
    expect(informe.retardosFueraDeEscala).toEqual([{ ruta: '/prueba/dos.scss', linea: 2, valorMs: 500 }])
    expect(informe.valoresNoVerificables).toEqual([{ ruta: '/prueba/dos.scss', linea: 3, valor: '$d' }])
    expect(informe.usosDePalabraClaveAll).toEqual([{ ruta: '/prueba/dos.scss', linea: 4 }])
  })

  it('una hoja con finales de línea de Windows se analiza igual que con LF', () => {
    const hoja = ['a {', '  transition:', '    color 150ms ease-out,', '    transform 400ms ease-out;', '}', ''].join('\r\n')

    const informe = ejecutarPuertaDeEscalaDeMovimiento([ficheroDeEstilos(RUTA_SINTETICA, hoja)])

    expect(informe.duracionesFueraDeEscala).toEqual([{ ruta: RUTA_SINTETICA, linea: 2, valorMs: 400 }])
  })
})

describe('identidad_visual @s16: ninguna declaración anima la palabra clave "all"', () => {
  it('señala una transición sintética que anima "all"', () => {
    const informe = informeDe('body {', '  transition: all 150ms ease-out;', '}')

    expect(informe.usosDePalabraClaveAll).toEqual([{ ruta: RUTA_SINTETICA, linea: 2 }])
    expect(informe.pasa).toBe(false)
  })

  it('"all" tras "transition" con un espacio antes de los dos puntos sigue detectándose', () => {
    const informe = informeDe('body {', '  transition : all 150ms;', '}')

    expect(informe.usosDePalabraClaveAll).toEqual([{ ruta: RUTA_SINTETICA, linea: 2 }])
  })

  it('"all" pegado a los dos puntos, sin ningún espacio, sigue detectándose', () => {
    const informe = informeDe('body {', '  transition:all 150ms;', '}')

    expect(informe.usosDePalabraClaveAll).toEqual([{ ruta: RUTA_SINTETICA, linea: 2 }])
  })

  it('"all" como uno más de una lista, sin espacio tras la coma', () => {
    const informe = informeDe('body {', '  transition: color 150ms,all 300ms;', '}')

    expect(informe.usosDePalabraClaveAll).toEqual([{ ruta: RUTA_SINTETICA, linea: 2 }])
  })

  it('"all" como uno más de una lista, con un espacio tras la coma', () => {
    const informe = informeDe('body {', '  transition: color 150ms, all 300ms;', '}')

    expect(informe.usosDePalabraClaveAll).toEqual([{ ruta: RUTA_SINTETICA, linea: 2 }])
  })

  it('"all" en una línea de continuación, y como valor de "transition-property"', () => {
    const informe = informeDe('body {', '  transition:', '    color 150ms ease-out,', '    all 300ms ease-out;', '  transition-property: opacity, all;', '}')

    expect(informe.usosDePalabraClaveAll).toEqual([
      { ruta: RUTA_SINTETICA, linea: 2 },
      { ruta: RUTA_SINTETICA, linea: 5 },
    ])
  })

  it('"all" detrás del tiempo y de la curva sigue siendo la propiedad animada: el orden dentro de una entrada de "transition" es libre', () => {
    const informe = informeDe('body {', '  transition: 150ms ease-out all;', '}')

    expect(informe.usosDePalabraClaveAll).toEqual([{ ruta: RUTA_SINTETICA, linea: 2 }])
  })

  it('una palabra que solo EMPIEZA por "all" ("all-caps") o una propiedad que no anima ("animation: all") no cuentan', () => {
    const informe = informeDe('body {', '  transition: all-caps 150ms;', '  transition-property: allow, opacity;', '  animation: all 150ms;', '}')

    expect(informe.usosDePalabraClaveAll).toEqual([])
  })
})
