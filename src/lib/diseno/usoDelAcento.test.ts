import { describe, expect, it } from 'vitest'
import type { FicheroDeTexto } from './rolesDescartados'
import { ejecutarPuertaDeUsoDelAcento } from './usoDelAcento'

describe('@s15 el acento saturado clasificado por la propiedad CSS que lo pinta', () => {
  it('separa el uso como texto, como borde y como relleno, y nombra fichero y línea', () => {
    const estilos: readonly FicheroDeTexto[] = [
      {
        ruta: 'src/components/Uno.module.scss',
        contenido: ['.rotulo {', '  color: var(--color-acento);', '}'].join('\n'),
      },
      {
        ruta: 'src/components/Dos.module.scss',
        contenido: ['.caja {', '  border-color: var(--color-acento);', '  border: 1px solid var(--color-acento);', '}'].join(
          '\n',
        ),
      },
      {
        ruta: 'src/components/Tres.module.scss',
        contenido: ['.muestra {', '  background-color: var(--color-acento);', '}'].join('\n'),
      },
    ]

    const informe = ejecutarPuertaDeUsoDelAcento(estilos)

    expect(informe.comoTexto).toEqual([
      { ruta: 'src/components/Uno.module.scss', linea: 2, declaracion: 'color: var(--color-acento);' },
    ])
    expect(informe.comoBorde).toEqual([
      { ruta: 'src/components/Dos.module.scss', linea: 2, declaracion: 'border-color: var(--color-acento);' },
      { ruta: 'src/components/Dos.module.scss', linea: 3, declaracion: 'border: 1px solid var(--color-acento);' },
    ])
    expect(informe.comoRelleno).toEqual([
      { ruta: 'src/components/Tres.module.scss', linea: 2, declaracion: 'background-color: var(--color-acento);' },
    ])
    expect(informe.ficherosInspeccionados).toBe(3)
    expect(informe.pasa).toBe(false)
  })

  it('reconoce el uso aunque haya espacios dentro de "var( ... )"', () => {
    // El patrón usa `\s*` a ambos lados del token a propósito: tiene que
    // tolerar el espacio, no solo el formato compacto que escribe hoy el
    // repositorio.
    const estilos: readonly FicheroDeTexto[] = [
      { ruta: 'src/components/Uno.module.scss', contenido: '.muestra { background-color: var( --color-acento ); }' },
    ]

    const informe = ejecutarPuertaDeUsoDelAcento(estilos)

    expect(informe.comoRelleno).toHaveLength(1)
    expect(informe.usosTotales).toBe(1)
  })

  it('clasifica "fill" como relleno igual que las propiedades "background*"', () => {
    // La cláusula es `startsWith('background') || propiedad === 'fill'`: sin
    // un caso con la propiedad exacta "fill", el operando derecho del OR
    // podría romperse sin que ningún test lo notara.
    const estilos: readonly FicheroDeTexto[] = [
      { ruta: 'src/components/Icono.module.scss', contenido: '.icono { fill: var(--color-acento); }' },
    ]

    const informe = ejecutarPuertaDeUsoDelAcento(estilos)

    expect(informe.comoRelleno).toEqual([
      { ruta: 'src/components/Icono.module.scss', linea: 1, declaracion: '.icono { fill: var(--color-acento); }' },
    ])
    expect(informe.pasa).toBe(true)
  })

  it('clasifica el acento de un conic-gradient multilínea como relleno', () => {
    const estilos: readonly FicheroDeTexto[] = [
      {
        ruta: 'src/components/SelectorPaleta.module.scss',
        contenido: [
          '.disco {',
          '  background: conic-gradient(',
          '    var(--color-primario) 0 33.333%,',
          '    var(--color-acento) 33.333% 66.666%,',
          '    var(--color-urgencia) 66.666% 100%',
          '  );',
          '}',
        ].join('\n'),
      },
    ]

    const informe = ejecutarPuertaDeUsoDelAcento(estilos)

    expect(informe.comoRelleno).toEqual([
      {
        ruta: 'src/components/SelectorPaleta.module.scss',
        linea: 4,
        declaracion: 'var(--color-acento) 33.333% 66.666%,',
      },
    ])
    expect(informe.sinClasificar).toEqual([])
    expect(informe.pasa).toBe(true)
  })

  it('no arrastra una propiedad terminada a una línea posterior sin declaración', () => {
    const estilos: readonly FicheroDeTexto[] = [
      {
        ruta: 'src/components/SelectorPaleta.module.scss',
        contenido: [
          '.disco {',
          '  background: var(--color-primario);',
          '  var(--color-acento)',
          '}',
        ].join('\n'),
      },
    ]

    const informe = ejecutarPuertaDeUsoDelAcento(estilos)

    expect(informe.sinClasificar).toEqual([
      {
        ruta: 'src/components/SelectorPaleta.module.scss',
        linea: 3,
        declaracion: 'var(--color-acento)',
      },
    ])
    expect(informe.comoRelleno).toEqual([])
  })

  it('una declaración sin dos puntos tras la última llave no se clasifica por accidente', () => {
    // Sin separador, el rol queda vacío y por tanto "sin clasificar". El
    // texto se elige a propósito: leer mal "sin separador" (confundirlo con
    // "el separador está en la posición -1 de la cadena", o tomar el
    // camino equivocado del condicional) recortaría el último carácter del
    // resto de la línea y daría "color", clasificándolo como texto por error.
    const estilos: readonly FicheroDeTexto[] = [
      { ruta: 'src/components/Uno.module.scss', contenido: 'var(--color-acento) { colorX' },
    ]

    const informe = ejecutarPuertaDeUsoDelAcento(estilos)

    expect(informe.sinClasificar).toEqual([
      { ruta: 'src/components/Uno.module.scss', linea: 1, declaracion: 'var(--color-acento) { colorX' },
    ])
    expect(informe.comoTexto).toEqual([])
  })

  it('no confunde el acento a secas con "--color-acento-tinta" ni con "--color-acento-suave"', () => {
    // Son TRES roles distintos del inventario (`contratoRedisenho.ts:14-16`).
    // La tinta (#48704B en la marca) sí puede llevar texto y de hecho lo lleva
    // en nueve sitios del repositorio; si la puerta casara por prefijo, los
    // señalaría todos y sería inútil.
    const estilos: readonly FicheroDeTexto[] = [
      {
        ruta: 'src/components/Equipo.module.scss',
        contenido: [
          '.avatar {',
          '  background-color: var(--color-acento-suave);',
          '  color: var(--color-acento-tinta);',
          '  border-color: var(--color-acento-tinta);',
          '}',
        ].join('\n'),
      },
    ]

    const informe = ejecutarPuertaDeUsoDelAcento(estilos)

    expect(informe.usosTotales).toBe(0)
    expect(informe.comoTexto).toEqual([])
    expect(informe.comoBorde).toEqual([])
    expect(informe.comoRelleno).toEqual([])
  })

  it('lee la propiedad de una regla anidada escrita en una sola línea', () => {
    const estilos: readonly FicheroDeTexto[] = [
      { ruta: 'src/components/Uno.module.scss', contenido: '.enlace { &:hover { color: var(--color-acento); } }' },
    ]

    const informe = ejecutarPuertaDeUsoDelAcento(estilos)

    expect(informe.comoTexto).toEqual([
      {
        ruta: 'src/components/Uno.module.scss',
        linea: 1,
        declaracion: '.enlace { &:hover { color: var(--color-acento); } }',
      },
    ])
    expect(informe.sinClasificar).toEqual([])
  })

  it('señala como sin clasificar cualquier propiedad que no sea texto, borde ni relleno', () => {
    // Ni el escenario ni la medición de contraste dicen nada de, por ejemplo,
    // `outline-color`. La puerta no se lo inventa: lo aparta para que lo
    // decida una persona, y suspende mientras tanto.
    const estilos: readonly FicheroDeTexto[] = [
      { ruta: 'src/components/Uno.module.scss', contenido: '.foco { outline-color: var(--color-acento); }' },
      { ruta: 'src/components/Dos.module.scss', contenido: '.caja { background: var(--color-acento); }' },
    ]

    const informe = ejecutarPuertaDeUsoDelAcento(estilos)

    expect(informe.sinClasificar).toEqual([
      { ruta: 'src/components/Uno.module.scss', linea: 1, declaracion: '.foco { outline-color: var(--color-acento); }' },
    ])
    expect(informe.comoRelleno).toHaveLength(1)
    expect(informe.pasa).toBe(false)
  })

  it('aprueba cuando el acento solo rellena, y solo entonces', () => {
    const estilos: readonly FicheroDeTexto[] = [
      { ruta: 'src/components/Uno.module.scss', contenido: '.muestra { background-color: var(--color-acento); }' },
    ]

    const informe = ejecutarPuertaDeUsoDelAcento(estilos)

    expect(informe.comoRelleno).toHaveLength(1)
    expect(informe.usosTotales).toBe(1)
    expect(informe.pasa).toBe(true)
  })

  it('suspende con un uso ilegal como texto aunque no haya ni un solo uso como borde', () => {
    // Distingue el `&&` de un `||` entre "sin usos como texto" y "sin usos
    // como borde": con solo el texto violado, un `||` daría la mitad de la
    // condición por satisfecha (basta con que borde esté limpio) y aprobaría
    // por error.
    const estilos: readonly FicheroDeTexto[] = [
      { ruta: 'src/components/Uno.module.scss', contenido: '.rotulo { color: var(--color-acento); }' },
      { ruta: 'src/components/Dos.module.scss', contenido: '.muestra { background-color: var(--color-acento); }' },
    ]

    const informe = ejecutarPuertaDeUsoDelAcento(estilos)

    expect(informe.comoTexto).toHaveLength(1)
    expect(informe.comoBorde).toEqual([])
    expect(informe.pasa).toBe(false)
  })

  it('suspende con un uso ilegal como borde aunque no haya ni un solo uso como texto', () => {
    // Mismo distingo que el caso anterior, visto desde el lado contrario.
    const estilos: readonly FicheroDeTexto[] = [
      { ruta: 'src/components/Uno.module.scss', contenido: '.caja { border-color: var(--color-acento); }' },
      { ruta: 'src/components/Dos.module.scss', contenido: '.muestra { background-color: var(--color-acento); }' },
    ]

    const informe = ejecutarPuertaDeUsoDelAcento(estilos)

    expect(informe.comoTexto).toEqual([])
    expect(informe.comoBorde).toHaveLength(1)
    expect(informe.pasa).toBe(false)
  })

  it('suspende si nadie usa el acento como relleno, aunque no haya ni un uso ilegal', () => {
    const estilos: readonly FicheroDeTexto[] = [
      { ruta: 'src/components/Uno.module.scss', contenido: '.caja { background: var(--color-superficie); }' },
    ]

    const informe = ejecutarPuertaDeUsoDelAcento(estilos)

    expect(informe.comoTexto).toEqual([])
    expect(informe.comoBorde).toEqual([])
    expect(informe.comoRelleno).toEqual([])
    expect(informe.pasa).toBe(false)
  })

  it('sin un solo fichero de estilos falla cerrada, con el recuento en cero', () => {
    const informe = ejecutarPuertaDeUsoDelAcento([])

    expect(informe.pasa).toBe(false)
    expect(informe.ficherosInspeccionados).toBe(0)
    expect(informe.usosTotales).toBe(0)
    expect(informe.motivo).toBe('no se inspeccionó ningún fichero de estilos: el inventario está vacío')
    // La falla cerrada no puede esconder un listado con relleno: los cuatro
    // van vacíos de verdad.
    expect(informe.comoTexto).toEqual([])
    expect(informe.comoBorde).toEqual([])
    expect(informe.comoRelleno).toEqual([])
    expect(informe.sinClasificar).toEqual([])
  })
})

/**
 * Los ficheros de estilos REALES con los que se compila cada módulo del
 * inventario (`src/lib/diseno/inventarioModulos.ts:34`): los 18
 * `<Modulo>.module.scss` MÁS las hojas compartidas de `src/styles`.
 *
 * Las compartidas entran porque `vite.config.ts` →
 * `css.preprocessorOptions.scss.additionalData` inyecta literalmente
 * `@use "api" as *;` en CADA `.module.scss`: `_api.scss` es parte del texto con
 * el que todos ellos se compilan, y un uso del acento escondido en un `@mixin`
 * compartido pintaría exactamente igual en pantalla. Ampliar el corpus solo
 * puede AÑADIR hallazgos, nunca ocultarlos.
 *
 * `_tokens.scss` queda fuera a propósito: ahí el acento se DECLARA
 * (`--color-acento: #B4C718;`), no se usa, y declararlo es justo lo que la
 * enmienda vuelve a permitir.
 */
const ESTILOS_REALES = {
  ...import.meta.glob('../../components/*.module.scss', { eager: true, query: '?raw', import: 'default' }),
  ...import.meta.glob('../../pages/*.module.scss', { eager: true, query: '?raw', import: 'default' }),
  ...import.meta.glob('../../styles/{_api,global}.scss', { eager: true, query: '?raw', import: 'default' }),
} as Record<string, string>

const CARPETA_DE_ESTE_TEST = ['src', 'lib', 'diseno']

function rutaDeRepositorio(clave: string): string {
  const segmentos = [...CARPETA_DE_ESTE_TEST]
  for (const parte of clave.split('/')) {
    if (parte === '..') {
      segmentos.pop()
    } else if (parte !== '.') {
      segmentos.push(parte)
    }
  }
  return segmentos.join('/')
}

describe('@s15 la puerta corre sobre el texto real de los ficheros de estilos', () => {
  const estilosReales: readonly FicheroDeTexto[] = Object.entries(ESTILOS_REALES).map(([clave, contenido]) => ({
    ruta: rutaDeRepositorio(clave),
    contenido,
  }))

  it('el corpus alcanza de verdad los módulos del inventario y la API compartida', () => {
    const rutas = estilosReales.map((fichero) => fichero.ruta)

    expect(rutas).toEqual(
      expect.arrayContaining([
        'src/components/BarraUrgencias.module.scss',
        'src/components/Hero.module.scss',
        'src/components/SelectorPaleta.module.scss',
        'src/pages/PaginaTienda.module.scss',
        'src/styles/_api.scss',
      ]),
    )
    expect(rutas).toHaveLength(20)
  })

  it('el acento no se pinta como texto ni como borde, y sí se pinta al menos una vez como relleno', () => {
    const informe = ejecutarPuertaDeUsoDelAcento(estilosReales)

    expect(informe.comoTexto).toEqual([])
    expect(informe.comoBorde).toEqual([])
    expect(informe.sinClasificar).toEqual([])
    expect(informe.comoRelleno.length).toBeGreaterThan(0)
    expect(informe.ficherosInspeccionados).toBe(20)
    expect(informe.ficherosInspeccionados).toBeGreaterThan(0)
    expect(informe.pasa).toBe(true)
  })
})
