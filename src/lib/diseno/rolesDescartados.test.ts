import { describe, expect, it } from 'vitest'
import {
  AFIRMACIONES_CLINICAS_PROHIBIDAS,
  ejecutarPuertaDeAfirmacionesFalsas,
  ejecutarPuertaDePrimarioFuerte,
  textoVisibleDe,
  type FicheroDeTexto,
} from './rolesDescartados'

describe('@s13 el literal de afirmaciones prohibidas', () => {
  it('declara exactamente las cinco afirmaciones que el contrato escribe a mano', () => {
    // Literal escrito A MANO en el test, tomado de `features/rediseno_visual.feature:262-263`
    // (y de la cabecera del contrato, :54-57). NO se deriva de la lista de producción:
    // patrón `doble-de-test-anclado-al-literal`.
    const afirmacionesAMano = ['24 h', '24h', '365', 'todos los días del año', 'siempre hay alguien de guardia']

    expect(AFIRMACIONES_CLINICAS_PROHIBIDAS).toEqual(afirmacionesAMano)
  })

  it('señala cada afirmación falsa nombrando el fichero, y deja pasar el vocabulario visual', () => {
    const ficheros: readonly FicheroDeTexto[] = [
      { ruta: 'src/styles/_tokens.scss', contenido: '--color-urgencia: #DC2626; --color-acento: #B4C718;' },
      { ruta: 'src/components/Hero.tsx', contenido: '<p>Atención 24 h, 365 días</p>' },
      { ruta: 'dist/index.html', contenido: '<title>Galapavet</title>' },
    ]

    const informe = ejecutarPuertaDeAfirmacionesFalsas(ficheros, AFIRMACIONES_CLINICAS_PROHIBIDAS)

    expect(informe.hallazgos).toEqual([
      { ruta: 'src/components/Hero.tsx', afirmacion: '24 h' },
      { ruta: 'src/components/Hero.tsx', afirmacion: '365' },
    ])
    expect(informe.ficherosInspeccionados).toBe(3)
    expect(informe.pasa).toBe(false)
  })

  it('no se le escapa la misma afirmación escrita con otras mayúsculas', () => {
    const ficheros: readonly FicheroDeTexto[] = [
      { ruta: 'src/components/Hero.tsx', contenido: '<p>Atención 24 H</p>' },
      { ruta: 'src/components/Faq.tsx', contenido: '<p>Abierto Todos Los Días Del Año</p>' },
    ]

    const informe = ejecutarPuertaDeAfirmacionesFalsas(ficheros, AFIRMACIONES_CLINICAS_PROHIBIDAS)

    expect(informe.hallazgos).toEqual([
      { ruta: 'src/components/Hero.tsx', afirmacion: '24 h' },
      { ruta: 'src/components/Faq.tsx', afirmacion: 'todos los días del año' },
    ])
    expect(informe.pasa).toBe(false)
  })

  it('no confunde un hexadecimal de color con la afirmación "365": "#273650" no es "los 365 días"', () => {
    // Texto REAL, copiado tal cual de `src/styles/_tokens.scss:126` (variante
    // `tech`, Enmienda 1 al contrato): "365" es una subcadena cruda de
    // "273650", el hexadecimal derivado de `--color-borde`. No es un literal
    // inventado para el test: es la declaración exacta que hoy delata la
    // puerta como falso positivo.
    const ficheros: readonly FicheroDeTexto[] = [
      { ruta: 'src/styles/_tokens.scss', contenido: "  --color-borde: #273650;" },
    ]

    const informe = ejecutarPuertaDeAfirmacionesFalsas(ficheros, AFIRMACIONES_CLINICAS_PROHIBIDAS)

    expect(informe.hallazgos).toEqual([])
    expect(informe.pasa).toBe(true)
  })

  it('SIGUE detectando "365" como palabra suelta en prosa real, con o sin puntuación, en mayúsculas y a final de fichero', () => {
    // La corrección del falso positivo de "#273650" no puede esconder una
    // afirmación real: "365" tiene que seguir delatándose seguida de una
    // palabra (espacio), con punto detrás, en mayúsculas, y también cuando
    // no hay NINGÚN carácter detrás (fin del propio contenido del fichero).
    const ficheros: readonly FicheroDeTexto[] = [
      { ruta: 'src/components/Uno.tsx', contenido: '<p>Atención los 365 días</p>' },
      { ruta: 'src/components/Dos.tsx', contenido: '<p>Urgencias 365.</p>' },
      { ruta: 'src/components/Tres.tsx', contenido: '<p>URGENCIAS 365</p>' },
      { ruta: 'src/components/Cuatro.tsx', contenido: 'urgencias 365' },
    ]

    const informe = ejecutarPuertaDeAfirmacionesFalsas(ficheros, AFIRMACIONES_CLINICAS_PROHIBIDAS)

    expect(informe.hallazgos).toEqual([
      { ruta: 'src/components/Uno.tsx', afirmacion: '365' },
      { ruta: 'src/components/Dos.tsx', afirmacion: '365' },
      { ruta: 'src/components/Tres.tsx', afirmacion: '365' },
      { ruta: 'src/components/Cuatro.tsx', afirmacion: '365' },
    ])
    expect(informe.pasa).toBe(false)
  })

  it('con la lista de afirmaciones vacía falla cerrada, en vez de dar cero hallazgos por bueno', () => {
    const informe = ejecutarPuertaDeAfirmacionesFalsas([{ ruta: 'src/App.tsx', contenido: 'Atención 24 h' }], [])

    expect(informe.pasa).toBe(false)
    expect(informe.motivo).toBe('la lista de afirmaciones prohibidas está vacía: no se comprobó ninguna')
    expect(informe.hallazgos).toEqual([])
  })

  it('sin un solo fichero que inspeccionar falla cerrada, con el recuento en cero', () => {
    const informe = ejecutarPuertaDeAfirmacionesFalsas([], AFIRMACIONES_CLINICAS_PROHIBIDAS)

    expect(informe.pasa).toBe(false)
    expect(informe.ficherosInspeccionados).toBe(0)
    expect(informe.motivo).toBe('no se inspeccionó ningún fichero: el corpus está vacío')
    expect(informe.hallazgos).toEqual([])
  })
})

describe('@s13 "texto visible": un comentario del código fuente no es una afirmación', () => {
  it('descarta el comentario de bloque y el de línea completa, y conserva el resto del código', () => {
    // El Then de @s13 (`features/rediseno_visual.feature:262`) dice "en ningún
    // TEXTO VISIBLE". Un comentario nunca llega al usuario —el artefacto de
    // producción los borra— y varios comentarios legítimos del repositorio
    // CITAN la afirmación prohibida justo para explicar que está prohibida
    // (p. ej. `src/pages/PaginaBlog-logica.ts:62`).
    const fuente = `/** Prohibido prometer 24 h en el sitio. */
  // Nota: nunca 365 días.
const rotulo = 'Urgencias fuera de horario'`

    const visible = textoVisibleDe(fuente)

    expect(visible).not.toContain('24 h')
    expect(visible).not.toContain('365')
    expect(visible).toContain("const rotulo = 'Urgencias fuera de horario'")
  })

  it('sustituye el comentario recortado por nada, no por un texto de relleno', () => {
    // No basta con comprobar que la afirmación prohibida desaparece: hay que
    // comprobar el CONTENIDO exacto que queda tras el recorte. Si el
    // comentario se sustituyera por un texto de relleno en vez de por nada,
    // los dos tests de arriba seguirían en verde (ninguno contiene "24 h" ni
    // "365") sin que este defecto se notara.
    const fuente = '// nota: nunca 365 días\nconst x = 1'

    const visible = textoVisibleDe(fuente)

    expect(visible).toBe('\nconst x = 1')
  })

  it('NO recorta lo que sigue a una barra doble que va dentro de una línea de código', () => {
    // `enlaceMensajeria` (src/lib/telefono.ts:44) escribe 'https://wa.me/': un
    // recorte ingenuo por "//" borraría el resto de la línea y podría ESCONDER
    // una afirmación falsa escrita detrás. La puerta recorta de MENOS a
    // propósito: recortar de menos solo produce falsos positivos, nunca falsos
    // permisos.
    const visible = textoVisibleDe("const base = 'https://wa.me/34685343149' // atención 24 h")

    expect(visible).toContain('https://wa.me/34685343149')
    expect(visible).toContain('24 h')
  })
})

/**
 * El corpus REAL de `src/`, leído con `?raw` (texto de verdad, no un proxy de
 * CSS Modules: `vite.config.ts` → `test.css.include: [/\?raw/]`).
 *
 * Tres exclusiones, todas declaradas:
 *  - `*.test.*` / `*.spec.*` / `src/test/**`: no se sirven al usuario, y
 *    varios de ellos escriben la afirmación prohibida justo para comprobar
 *    que NO aparece (p. ej. `src/components/InformacionContacto.test.tsx`).
 *  - `rolesDescartados.ts`: es el fichero que DECLARA la prohibición. Sus
 *    literales son la lista de lo prohibido, no una afirmación; incluirlo
 *    haría que la puerta no pudiera pasar jamás. Tampoco llega a producción
 *    (solo lo importan tests): medido, `dist/` no contiene ninguna de las
 *    cinco cadenas.
 */
const FICHEROS_REALES_DE_SRC = import.meta.glob(
  [
    '../../**/*.{ts,tsx,scss,css}',
    '!../../**/*.test.{ts,tsx}',
    '!../../**/*.spec.{ts,tsx}',
    '!../../test/**',
    '!../../lib/diseno/rolesDescartados.ts',
  ],
  { eager: true, query: '?raw', import: 'default' },
) as Record<string, string>

/**
 * El artefacto de producción REAL, tal y como GitHub Pages lo sirve: el HTML,
 * el CSS y el JavaScript ya compilados y minificados por Vite. Es la mitad
 * del Given de @s13 (`features/rediseno_visual.feature:259`) y la única
 * prueba de lo que de verdad lee un navegador.
 */
const FICHEROS_REALES_DE_DIST = import.meta.glob('../../../dist/**/*.{html,css,js}', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

/** Carpeta de ESTE fichero: las claves de `import.meta.glob` son relativas a ella. */
const CARPETA_DE_ESTE_TEST = ['src', 'lib', 'diseno']

/**
 * Convierte la clave relativa que devuelve `import.meta.glob`
 * (p. ej. "../site.ts") en la ruta del repositorio ("src/lib/site.ts"), para
 * que un hallazgo nombre el fichero con el que se puede ir a corregirlo.
 */
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

function comoFicherosDeTexto(modulos: Record<string, string>): readonly FicheroDeTexto[] {
  return Object.entries(modulos).map(([clave, contenido]) => ({ ruta: rutaDeRepositorio(clave), contenido }))
}

function rutas(ficheros: readonly FicheroDeTexto[]): readonly string[] {
  return ficheros.map((fichero) => fichero.ruta)
}

describe('@s13 la puerta corre sobre el corpus real de "src" y sobre el artefacto de producción', () => {
  const ficherosDeSrc = comoFicherosDeTexto(FICHEROS_REALES_DE_SRC)
  const ficherosDeDist = comoFicherosDeTexto(FICHEROS_REALES_DE_DIST)
  const corpusReal = [...ficherosDeSrc, ...ficherosDeDist]

  it('el corpus alcanza de verdad el árbol de "src" y el "dist" servido', () => {
    // Anclas concretas: sin ellas, un patrón de glob mal escrito daría un
    // corpus pequeño y la puerta pasaría por no haber mirado casi nada.
    expect(rutas(ficherosDeSrc)).toEqual(
      expect.arrayContaining([
        'src/App.tsx',
        'src/lib/site.ts',
        'src/pages/Landing.tsx',
        'src/styles/_tokens.scss',
        'src/components/BarraUrgencias.module.scss',
      ]),
    )
    expect(rutas(ficherosDeSrc)).not.toEqual(expect.arrayContaining([expect.stringContaining('.test.')]))
    expect(rutas(ficherosDeSrc)).not.toContain('src/lib/diseno/rolesDescartados.ts')
    expect(rutas(ficherosDeDist)).toEqual(
      expect.arrayContaining([
        'dist/index.html',
        expect.stringMatching(/^dist\/assets\/.+\.css$/),
        expect.stringMatching(/^dist\/assets\/.+\.js$/),
      ]),
    )
  })

  it('ninguna de las cinco afirmaciones falsas aparece en el texto visible de "src" ni en "dist"', () => {
    const informe = ejecutarPuertaDeAfirmacionesFalsas(corpusReal, AFIRMACIONES_CLINICAS_PROHIBIDAS)

    expect(informe.hallazgos).toEqual([])
    expect(informe.ficherosInspeccionados).toBe(corpusReal.length)
    expect(informe.ficherosInspeccionados).toBeGreaterThan(0)
    expect(informe.pasa).toBe(true)
  })

  it('una sola afirmación colada en el corpus real la delata: la puerta no está inerte', () => {
    for (const afirmacion of AFIRMACIONES_CLINICAS_PROHIBIDAS) {
      const envenenado: FicheroDeTexto = { ruta: 'src/components/Inventado.tsx', contenido: `<p>Atención ${afirmacion}</p>` }

      const informe = ejecutarPuertaDeAfirmacionesFalsas([...corpusReal, envenenado], AFIRMACIONES_CLINICAS_PROHIBIDAS)

      expect(informe.hallazgos).toEqual([{ ruta: 'src/components/Inventado.tsx', afirmacion }])
      expect(informe.pasa).toBe(false)
    }
  })
})

/**
 * Los ficheros de estilos con los que se compila cada módulo del inventario:
 * los 18 `<Modulo>.module.scss` (`src/lib/diseno/inventarioModulos.ts:34`) Y
 * las hojas compartidas de `src/styles`. Las compartidas NO son un añadido de
 * conveniencia: `vite.config.ts` → `css.preprocessorOptions.scss.additionalData`
 * inyecta literalmente `@use "api" as *;` en CADA `.module.scss`, así que
 * `_api.scss` forma parte del texto con el que TODOS ellos se compilan. Leer
 * solo los 18 daría un falso negativo con cualquier declaración que viva en
 * un `@mixin` compartido, que es justo como este repositorio escribe los
 * botones (`_api.scss` → `@mixin boton-primario`).
 */
const ESTILOS_REALES_DEL_INVENTARIO = {
  ...import.meta.glob('../../components/*.module.scss', { eager: true, query: '?raw', import: 'default' }),
  ...import.meta.glob('../../pages/*.module.scss', { eager: true, query: '?raw', import: 'default' }),
  ...import.meta.glob('../../styles/{_api,global}.scss', { eager: true, query: '?raw', import: 'default' }),
} as Record<string, string>

const TEXTO_REAL_DE_TOKENS = Object.values(
  import.meta.glob('../../styles/_tokens.scss', { eager: true, query: '?raw', import: 'default' }) as Record<
    string,
    string
  >,
)[0] as string

/** Literal escrito a mano: las cinco variantes de `features/rediseno_visual.feature:159`. */
const VARIANTES_A_MANO = ['clinica', 'calida', 'tech', 'eco', 'marca']

const RUTA_DE_TOKENS = 'src/styles/_tokens.scss'
const DECLARACION_DE_PRIMARIO_FUERTE = '--color-primario-fuerte:'
const NO_ENCONTRADA = -1

function declaracionesDePrimarioFuerte(textoScss: string): number {
  return textoScss.split(DECLARACION_DE_PRIMARIO_FUERTE).length - 1
}

/**
 * Sabotaje quirúrgico para el doble de prueba: borra la ÚNICA línea
 * `--color-primario-fuerte:` que vive dentro del bloque de `variante`, sin
 * tocar las de las otras cuatro ni la del `:root` de emergencia. No se
 * escribe el hexadecimal a mano: si otra sesión cambia el valor, el sabotaje
 * sigue funcionando.
 */
function sinLaDeclaracionDePrimarioFuerteDe(textoScss: string, variante: string): string {
  const lineas = textoScss.split('\n')
  const inicioDelBloque = lineas.findIndex((linea) => linea.includes(`data-variante='${variante}'`))
  const declaracion = lineas.findIndex(
    (linea, indice) => indice > inicioDelBloque && linea.includes(DECLARACION_DE_PRIMARIO_FUERTE),
  )
  if (inicioDelBloque === NO_ENCONTRADA || declaracion === NO_ENCONTRADA) {
    throw new Error(`no se encontró la declaración de "${DECLARACION_DE_PRIMARIO_FUERTE}" en la variante "${variante}"`)
  }
  return lineas.filter((_, indice) => indice !== declaracion).join('\n')
}

describe('@s16 el primario fuerte está declarado en las cinco variantes y además se usa', () => {
  const tokensReales: FicheroDeTexto = { ruta: RUTA_DE_TOKENS, contenido: TEXTO_REAL_DE_TOKENS }
  const estilosReales = comoFicherosDeTexto(ESTILOS_REALES_DEL_INVENTARIO)

  it('las cinco variantes lo declaran en su propio bloque, leído del texto real de "_tokens.scss"', () => {
    const informe = ejecutarPuertaDePrimarioFuerte(tokensReales, VARIANTES_A_MANO, estilosReales)

    expect(informe.variantesSinDeclararlo).toEqual([])
    expect(informe.variantesComprobadas).toBe(5)
    expect(informe.variantesComprobadas).toBeGreaterThan(0)
  })

  it('se usa al menos una vez en los ficheros de estilos con los que se compila el inventario', () => {
    const informe = ejecutarPuertaDePrimarioFuerte(tokensReales, VARIANTES_A_MANO, estilosReales)

    expect(informe.ficherosQueLoUsan).toContain('src/styles/_api.scss')
    expect(informe.ficherosDeEstiloInspeccionados).toBe(20)
    expect(informe.ficherosDeEstiloInspeccionados).toBeGreaterThan(0)
    expect(informe.pasa).toBe(true)
  })

  it('reconoce el uso aunque haya espacios dentro de "var( ... )"', () => {
    // El patrón usa `\s*` a ambos lados del token a propósito: tiene que
    // tolerar el espacio, no solo el formato compacto que escribe hoy el
    // repositorio.
    const informe = ejecutarPuertaDePrimarioFuerte(tokensReales, VARIANTES_A_MANO, [
      { ruta: 'src/components/Boton.module.scss', contenido: '.boton { background: var( --color-primario-fuerte ); }' },
    ])

    expect(informe.ficherosQueLoUsan).toEqual(['src/components/Boton.module.scss'])
    expect(informe.pasa).toBe(true)
  })

  it('no basta con declararlo: si ningún fichero de estilos lo usa, la puerta suspende', () => {
    const informe = ejecutarPuertaDePrimarioFuerte(tokensReales, VARIANTES_A_MANO, [
      { ruta: 'src/components/Boton.module.scss', contenido: '.boton { background: var(--color-primario); }' },
    ])

    expect(informe.variantesSinDeclararlo).toEqual([])
    expect(informe.ficherosQueLoUsan).toEqual([])
    expect(informe.pasa).toBe(false)
  })

  it('una variante que no lo declara en su propio bloque suspende, y se la nombra', () => {
    const contenidoMutilado = sinLaDeclaracionDePrimarioFuerteDe(TEXTO_REAL_DE_TOKENS, 'tech')
    // El doble se verifica a sí mismo: si el sabotaje no hubiera quitado nada,
    // este test daría verde sin haber probado nada.
    expect(declaracionesDePrimarioFuerte(contenidoMutilado)).toBe(declaracionesDePrimarioFuerte(TEXTO_REAL_DE_TOKENS) - 1)

    const informe = ejecutarPuertaDePrimarioFuerte(
      { ruta: RUTA_DE_TOKENS, contenido: contenidoMutilado },
      VARIANTES_A_MANO,
      estilosReales,
    )

    expect(informe.variantesSinDeclararlo).toEqual(['tech'])
    expect(informe.variantesComprobadas).toBe(5)
    expect(informe.pasa).toBe(false)
  })

  it('sin variantes que comprobar falla cerrada, en vez de dar "cinco de cinco" por vacuidad', () => {
    const informe = ejecutarPuertaDePrimarioFuerte(tokensReales, [], estilosReales)

    expect(informe.pasa).toBe(false)
    expect(informe.variantesComprobadas).toBe(0)
    expect(informe.motivo).toBe('no se comprobó ninguna variante: el catálogo está vacío')
    // La vacuidad no se disfraza de "nada que reportar": los dos listados van
    // vacíos de verdad, no con un relleno que pasara desapercibido.
    expect(informe.variantesSinDeclararlo).toEqual([])
    expect(informe.ficherosQueLoUsan).toEqual([])
  })

  it('sin un solo fichero de estilos falla cerrada, en vez de dar el token por usado', () => {
    const informe = ejecutarPuertaDePrimarioFuerte(tokensReales, VARIANTES_A_MANO, [])

    expect(informe.pasa).toBe(false)
    expect(informe.ficherosDeEstiloInspeccionados).toBe(0)
    expect(informe.motivo).toBe('no se inspeccionó ningún fichero de estilos: el inventario está vacío')
    // Mismo patrón: la falla cerrada no puede esconder un listado con relleno.
    expect(informe.variantesSinDeclararlo).toEqual([])
    expect(informe.ficherosQueLoUsan).toEqual([])
  })
})
