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
    expect(informe.ficherosSinLecturaFiable).toEqual([])
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

  it('un nombre que solo CONTIENE un tiempo ("fade400ms") no es un tiempo, y una unidad inventada ("400msx") ya no se ignora: falla cerrada', () => {
    const informe = informeDe('.x {', '  animation: fade400ms 300ms ease-out;', '  transition: color 400msx ease-out;', '}')

    expect(informe.duracionesFueraDeEscala).toEqual([])
    expect(informe.retardosFueraDeEscala).toEqual([])
    expect(informe.valoresNoVerificables).toEqual([{ ruta: RUTA_SINTETICA, linea: 3, valor: '400msx' }])
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

/**
 * OLA 4B de la feature 48 (revisión independiente): B3, B5 y el cierre CERRADO de
 * la lectura (B1). Cada caso se ejecuta con los dos finales de línea, el de Unix
 * y el de Windows, y los dos informes tienen que ser IDÉNTICOS.
 */
function informeConLfYCrlf(...lineasDeLaHoja: readonly string[]) {
  const conLf = ejecutarPuertaDeEscalaDeMovimiento([ficheroDeEstilos(RUTA_SINTETICA, [...lineasDeLaHoja, ''].join('\n'))])
  const conCrlf = ejecutarPuertaDeEscalaDeMovimiento([ficheroDeEstilos(RUTA_SINTETICA, [...lineasDeLaHoja, ''].join('\r\n'))])
  expect(conCrlf).toEqual(conLf)
  return conLf
}

describe('identidad_visual @s16 B3: todo lo que parece un tiempo se lee o falla cerrado, nunca se ignora', () => {
  it.each([
    ['0.9S', 900],
    ['900MS', 900],
    ['+900ms', 900],
    ['9e2ms', 900],
    ['9E2MS', 900],
    ['0.9e3ms', 900],
    ['9e-1s', 900],
    ['+.9s', 900],
    ['9e+2ms', 900],
    ['9e02ms', 900],
    ['9e-01s', 900],
    ['0.09e+04ms', 900],
  ])('"transition-duration: %s" es una duración de %i ms, fuera de la escala', (escrito, milisegundos) => {
    const informe = informeConLfYCrlf('.x {', `  transition-duration: ${escrito};`, '}')

    expect(informe.duracionesFueraDeEscala).toEqual([{ ruta: RUTA_SINTETICA, linea: 2, valorMs: milisegundos }])
    expect(informe.pasa).toBe(false)
  })

  it.each(['0.7S', '700MS', '+700ms', '7e2ms', '7E2ms', '0.07e1s', '7e-1s', '+.7s', '0.15S', '150MS', '300Ms', '0.3e0S', '0.01MS', '1e-5s'])(
    '"transition-duration: %s" es una duración de la escala y pasa',
    (escrito) => {
      const informe = informeConLfYCrlf('.x {', `  transition-duration: ${escrito};`, '}')

      expect(informe.duracionesFueraDeEscala).toEqual([])
      expect(informe.valoresNoVerificables).toEqual([])
      expect(informe.pasa).toBe(true)
    },
  )

  it.each(['+120ms', '0.12S', '1.2e2ms', '240MS', '0S', '0MS', '0e5ms', '+0s', '2.4e-1s'])(
    '"animation-delay: %s" es un retardo de la escala y pasa',
    (escrito) => {
      const informe = informeConLfYCrlf('.x {', `  animation-delay: ${escrito};`, '}')

      expect(informe.retardosFueraDeEscala).toEqual([])
      expect(informe.pasa).toBe(true)
    },
  )

  it.each(['900ms*2', '900ms/2', '#{900}ms', '400msx', '700msx', '1x', '10%', '0.7sx', '.5foo'])(
    '"%s", que empieza como un número y no es un tiempo literal, se declara no verificable',
    (token) => {
      const informe = informeConLfYCrlf('.x {', `  transition: color ${token} ease-out;`, '}')

      expect(informe.valoresNoVerificables).toEqual([{ ruta: RUTA_SINTETICA, linea: 2, valor: token }])
      expect(informe.duracionesFueraDeEscala).toEqual([])
      expect(informe.pasa).toBe(false)
    },
  )

  it('un paréntesis de cierre suelto tampoco se ignora: el token que lo lleva se declara no verificable', () => {
    const informe = informeConLfYCrlf('.x {', '  transition: color 900ms) ease-out;', '}')

    expect(informe.valoresNoVerificables).toEqual([{ ruta: RUTA_SINTETICA, linea: 2, valor: '900ms) ease-out' }])
    expect(informe.pasa).toBe(false)
  })

  it.each(['1', '0', '1.5', '.5', '-1', '+2', '3e2', '12', '120', '1.25', '.25', '3e12', '3e+2', '3e-2', '-12.5e+3'])('el número sin unidad "%s" (un contador de iteraciones, por ejemplo) no es un tiempo ni se declara', (numero) => {
    const informe = informeConLfYCrlf('.x {', `  animation: entrada 700ms ease-out ${numero};`, '}')

    expect(informe.valoresNoVerificables).toEqual([])
    expect(informe.duracionesFueraDeEscala).toEqual([])
    expect(informe.pasa).toBe(true)
  })

  it('un nombre que contiene dígitos o que empieza por un guion ("-webkit-transform", "fade400ms", "x2") no se confunde con un número', () => {
    const informe = informeConLfYCrlf('.x {', '  transition: -webkit-transform 150ms ease-out, fade400ms 300ms, x2 700ms;', '}')

    expect(informe.valoresNoVerificables).toEqual([])
    expect(informe.duracionesFueraDeEscala).toEqual([])
    expect(informe.pasa).toBe(true)
  })
})

describe('identidad_visual @s16 B3: "!important" no enmascara un tiempo ni una palabra clave', () => {
  it.each([
    ['transition-duration: 900ms!important'],
    ['transition-duration: 900ms !important'],
    ['transition-duration: 900ms  !  important'],
    ['transition-duration: 900ms !IMPORTANT'],
    ['transition: color 900ms ease-out !important'],
    ['animation: entrada 900ms ease-out backwards!important'],
  ])('"%s" sigue siendo una duración de 900 ms fuera de la escala', (declaracion) => {
    const informe = informeConLfYCrlf('.x {', `  ${declaracion};`, '}')

    expect(informe.duracionesFueraDeEscala).toEqual([{ ruta: RUTA_SINTETICA, linea: 2, valorMs: 900 }])
    expect(informe.valoresNoVerificables).toEqual([])
  })

  it('un retardo fuera de la escala con "!important" también se señala', () => {
    const informe = informeConLfYCrlf('.x {', '  animation-delay: 77ms!important;', '}')

    expect(informe.retardosFueraDeEscala).toEqual([{ ruta: RUTA_SINTETICA, linea: 2, valorMs: 77 }])
  })

  it('las duraciones de la escala con "!important" pasan', () => {
    const informe = informeConLfYCrlf('.x {', '  transition: color 150ms ease-out !important;', '  animation-delay: 120ms!important;', '}')

    expect(informe.pasa).toBe(true)
  })

  it.each(['transition: all!important', 'transition: all !important', 'transition-property: all!important'])(
    '"%s" sigue animando la palabra clave "all"',
    (declaracion) => {
      const informe = informeConLfYCrlf('.x {', `  ${declaracion};`, '}')

      expect(informe.usosDePalabraClaveAll).toEqual([{ ruta: RUTA_SINTETICA, linea: 2 }])
    },
  )

  it.each(['transition: ALL 150ms', 'transition: All 150ms', 'transition-property: opacity, ALL'])('"%s": la palabra clave "all" se reconoce con cualquier mayúscula', (declaracion) => {
    const informe = informeConLfYCrlf('.x {', `  ${declaracion};`, '}')

    expect(informe.usosDePalabraClaveAll).toEqual([{ ruta: RUTA_SINTETICA, linea: 2 }])
  })
})

describe('identidad_visual @s16 B5: las propiedades en mayúsculas o con prefijo de fabricante también se leen', () => {
  it.each([
    ['ANIMATION: x 900ms 77ms', [900], [77]],
    ['-webkit-animation: x 900ms 77ms', [900], [77]],
    ['-webkit-transition: color 900ms 77ms', [900], [77]],
    ['Transition-Duration: 900ms', [900], []],
    ['-moz-animation-duration: 900ms', [900], []],
    ['-WEBKIT-ANIMATION-DELAY: 77ms', [], [77]],
    ['-o-transition-delay: 77ms', [], [77]],
  ])('"%s" se lee como su propiedad sin prefijo', (declaracion, duraciones, retardos) => {
    const informe = informeConLfYCrlf('.x {', `  ${declaracion};`, '}')

    expect(informe.duracionesFueraDeEscala.map((hallazgo) => hallazgo.valorMs)).toEqual(duraciones)
    expect(informe.retardosFueraDeEscala.map((hallazgo) => hallazgo.valorMs)).toEqual(retardos)
  })

  it.each(['-webkit-transition: all 150ms', 'TRANSITION: all 150ms', '-moz-transition-property: all', 'Transition-Property: opacity, all'])(
    '"%s" también anima la palabra clave "all"',
    (declaracion) => {
      const informe = informeConLfYCrlf('.x {', `  ${declaracion};`, '}')

      expect(informe.usosDePalabraClaveAll).toEqual([{ ruta: RUTA_SINTETICA, linea: 2 }])
    },
  )

  it('una propiedad personalizada que se llama como una de movimiento ("--transition-duration") no se valida', () => {
    const informe = informeConLfYCrlf('.x {', '  --transition-duration: 900ms;', '}')

    expect(informe.duracionesFueraDeEscala).toEqual([])
    expect(informe.pasa).toBe(true)
  })
})

describe('identidad_visual @s16 B6: cada tiempo de una declaración corta ocupa su sitio, y los que sobran se ignoran', () => {
  it('el primer tiempo de una declaración corta es la duración y el segundo el retardo, en cada entrada de la lista', () => {
    const informe = informeConLfYCrlf('.x {', '  transition: color 400ms ease-out 500ms, transform 600ms ease-out 700ms;', '}')

    expect(informe.duracionesFueraDeEscala.map((hallazgo) => hallazgo.valorMs)).toEqual([400, 600])
    expect(informe.retardosFueraDeEscala.map((hallazgo) => hallazgo.valorMs)).toEqual([500, 700])
  })

  it('una declaración corta sin retardo no inventa uno, y una suelta de duración con dos tiempos solo lee el primero como duración', () => {
    const informe = informeConLfYCrlf('.x {', '  animation: entrada 700ms ease-out;', '  transition-duration: 400ms 500ms;', '}')

    expect(informe.retardosFueraDeEscala).toEqual([])
    expect(informe.duracionesFueraDeEscala.map((hallazgo) => hallazgo.valorMs)).toEqual([400])
  })
})

describe('identidad_visual @s16 B1: una hoja que el lector no puede leer entera hace fallar CERRADA la puerta', () => {
  const FICHERO_LIMPIO = ficheroDeEstilos('/prueba/limpio.scss', '.x {\n  transition: color 150ms ease-out;\n}\n')
  const RUTA_ROTA = '/prueba/rota.scss'

  it('el fichero limpio, solo, pasa y no declara ninguna hoja sin lectura fiable', () => {
    const informe = ejecutarPuertaDeEscalaDeMovimiento([FICHERO_LIMPIO])

    expect(informe.pasa).toBe(true)
    expect(informe.ficherosSinLecturaFiable).toEqual([])
  })

  it.each([
    ['una llave de apertura sin cerrar', '.a {\n  color: red;\n'],
    ['una llave de cierre de más', '.a {\n  color: red;\n}\n}\n'],
    ['un nombre de propiedad con interpolación', '.a {\n  #{$p}: 900ms;\n}\n'],
    ['una cadena sin cerrar', '.a {\n  content: "abc;\n}\n'],
  ])('%s: la hoja se nombra y la puerta no pasa, aunque no declare movimiento', (_caso, contenido) => {
    for (const final of ['\n', '\r\n']) {
      const informe = ejecutarPuertaDeEscalaDeMovimiento([FICHERO_LIMPIO, ficheroDeEstilos(RUTA_ROTA, contenido.replaceAll('\n', final))])

      expect(informe.ficherosSinLecturaFiable).toEqual([RUTA_ROTA])
      expect(informe.duracionesFueraDeEscala).toEqual([])
      expect(informe.retardosFueraDeEscala).toEqual([])
      expect(informe.valoresNoVerificables).toEqual([])
      expect(informe.usosDePalabraClaveAll).toEqual([])
      expect(informe.pasa).toBe(false)
    }
  })

  it('con 0 ficheros no hay ninguna hoja sin lectura fiable, y la puerta sigue sin pasar', () => {
    const informe = ejecutarPuertaDeEscalaDeMovimiento([])

    expect(informe.ficherosSinLecturaFiable).toEqual([])
    expect(informe.pasa).toBe(false)
  })

  it('una "//" pegada a un punto y coma no se traga la declaración de la línea siguiente', () => {
    const informe = informeConLfYCrlf('.m { color: red;// nota', '  animation: x 900ms 77ms; }')

    expect(informe.duracionesFueraDeEscala).toEqual([{ ruta: RUTA_SINTETICA, linea: 2, valorMs: 900 }])
    expect(informe.retardosFueraDeEscala).toEqual([{ ruta: RUTA_SINTETICA, linea: 2, valorMs: 77 }])
  })

  it('una "//" con blanco delante DENTRO de una cadena no se traga la declaración que la sigue', () => {
    const informe = informeConLfYCrlf('.m { content: " // "; animation: x 900ms 77ms; }')

    expect(informe.duracionesFueraDeEscala).toEqual([{ ruta: RUTA_SINTETICA, linea: 1, valorMs: 900 }])
    expect(informe.retardosFueraDeEscala).toEqual([{ ruta: RUTA_SINTETICA, linea: 1, valorMs: 77 }])
  })
})
