/**
 * Aserciones sobre el TEXTO REAL de la capa base (`src/styles/global.scss`) y
 * de su enganche desde `src/main.tsx`. Herramienta (b) del contrato de
 * `features/identidad_visual.feature`: lectura con `?raw` + Vitest, porque
 * jsdom desactiva los CSS Modules y solo ese texto es el que se compila de
 * verdad (`vite.config.ts:46-65`).
 */
import { describe, expect, it } from 'vitest'
import {
  FAMILIAS_DEL_RESET,
  RUTA_HOJA_GLOBAL,
  comprobarFamiliasDelReset,
  contarImportacionesDeHojaGlobal,
  declaracionesDelSelector,
  extraerReglas,
  selectoresDeDocumentoDeclarados,
  valorDeclarado,
  variablesCssUsadas,
} from '../lib/diseno/hojaGlobal'

const textoDeLaHojaGlobal = import.meta.glob('./global.scss', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>
const textoDelPuntoDeEntrada = import.meta.glob('../main.tsx', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>
const textoDeLosModulosDeCodigo = import.meta.glob('../**/*.{ts,tsx}', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>
const textoDeLaHojaDeLaCabecera = import.meta.glob('../components/Cabecera.module.scss', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>

/** `height`, `min-height`, `max-height` y sus equivalentes lógicos: cualquier forma de dimensionar la altura de la cabecera. */
const PATRON_PROPIEDAD_DE_ALTURA = /^(min-|max-)?(height|block-size): /

/** Un número de píxeles escrito a mano, que es justo lo que @s14 prohíbe repetir. */
const PATRON_NUMERO_DE_PIXELES = /\d+px/

const textoDeLosModulosDeEstilos = {
  ...(import.meta.glob('../components/*.module.scss', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>),
  ...(import.meta.glob('../pages/*.module.scss', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>),
}

function unicoTexto(ficheros: Record<string, string>, descripcion: string): string {
  const [texto] = Object.values(ficheros)
  if (texto === undefined) {
    throw new Error(`no se pudo leer el texto real de ${descripcion}`)
  }
  return texto
}

const hojaGlobal = (): string => unicoTexto(textoDeLaHojaGlobal, `"${RUTA_HOJA_GLOBAL}"`)
const puntoDeEntrada = (): string => unicoTexto(textoDelPuntoDeEntrada, '"src/main.tsx"')
const hojaDeLaCabecera = (): string => unicoTexto(textoDeLaHojaDeLaCabecera, '"src/components/Cabecera.module.scss"')

describe('@s12 existe una hoja global del documento y se importa exactamente una vez, desde el punto de entrada', () => {
  it('el fichero de la hoja global existe y tiene contenido', () => {
    expect(hojaGlobal().length).toBeGreaterThan(0)
  })

  it('"src/main.tsx" importa la hoja global exactamente una vez', () => {
    expect(contarImportacionesDeHojaGlobal(puntoDeEntrada(), RUTA_HOJA_GLOBAL)).toBe(1)
  })

  it('ningún otro fichero de "src/" importa la hoja global', () => {
    const otrosModulos = Object.entries(textoDeLosModulosDeCodigo).filter(([ruta]) => !ruta.endsWith('/main.tsx'))
    const importadores = otrosModulos.filter(([, texto]) => contarImportacionesDeHojaGlobal(texto, RUTA_HOJA_GLOBAL) > 0).map(([ruta]) => ruta)

    expect(otrosModulos.length).toBeGreaterThan(0)
    expect(importadores).toEqual([])
  })

  it('ningún fichero "<Nombre>.module.scss" declara reglas para "html", "body" ni "#root"', () => {
    const infractores = Object.entries(textoDeLosModulosDeEstilos)
      .map(([ruta, texto]) => ({ ruta, selectores: selectoresDeDocumentoDeclarados(texto) }))
      .filter(({ selectores }) => selectores.length > 0)

    expect(Object.keys(textoDeLosModulosDeEstilos).length).toBeGreaterThan(0)
    expect(infractores).toEqual([])
  })
})

describe('@s13 la capa base declara las nueve familias de reglas del reset, cada una justificada', () => {
  it('ninguna familia del inventario falta en el texto real de la hoja global', () => {
    const informe = comprobarFamiliasDelReset(hojaGlobal(), FAMILIAS_DEL_RESET)

    expect(informe.familiasAusentes.map((familia) => `${familia.numero}. ${familia.descripcion}`)).toEqual([])
  })

  it('el recuento de familias efectivamente comprobadas es exactamente 9', () => {
    expect(comprobarFamiliasDelReset(hojaGlobal(), FAMILIAS_DEL_RESET).familiasComprobadas).toBe(9)
  })

  it('no declara "text-wrap: pretty" sobre "body", por su coste de rendimiento', () => {
    expect(declaracionesDelSelector(hojaGlobal(), 'body')).not.toContain('text-wrap: pretty')
  })
})

describe('@s14 el desplazamiento hasta un ancla reserva sitio para la cabecera fija sin repetir su altura a mano', () => {
  /** Técnica suficiente C43 del W3C para SC 2.4.11 Focus Not Obscured (Minimum), nivel AA. No es una corrección cosmética. */
  const scrollPaddingTop = (): string => {
    const valor = valorDeclarado(hojaGlobal(), 'html', 'scroll-padding-top')
    if (valor === undefined) {
      throw new Error('"html" no declara "scroll-padding-top" en la hoja global')
    }
    return valor
  }

  const variableDeLaAlturaDeLaCabecera = (): string => {
    const [variable] = variablesCssUsadas(scrollPaddingTop())
    if (variable === undefined) {
      throw new Error(`el valor de "scroll-padding-top" no consume ninguna variable CSS: "${scrollPaddingTop()}"`)
    }
    return variable
  }

  const declaracionesDeAlturaDeLaCabecera = (): readonly string[] =>
    extraerReglas(hojaDeLaCabecera())
      .flatMap((regla) => regla.declaraciones)
      .filter((declaracion) => PATRON_PROPIEDAD_DE_ALTURA.test(declaracion))

  it('"html" declara "scroll-padding-top"', () => {
    expect(valorDeclarado(hojaGlobal(), 'html', 'scroll-padding-top')).toBeDefined()
  })

  it('su valor se calcula a partir de una variable, no de un número escrito a mano', () => {
    expect(scrollPaddingTop()).not.toMatch(PATRON_NUMERO_DE_PIXELES)
  })

  it('esa misma variable es la que la maquetación de la cabecera usa para su propia altura', () => {
    expect(declaracionesDeAlturaDeLaCabecera().length).toBeGreaterThan(0)
    expect(declaracionesDeAlturaDeLaCabecera().flatMap(variablesCssUsadas)).toContain(variableDeLaAlturaDeLaCabecera())
  })
})

describe('@s15 el desplazamiento suave se activa por opt-in y nunca se declara fuera de la consulta de movimiento', () => {
  const PATRON_NO_PREFERENCE = /prefers-reduced-motion:\s*no-preference/
  const PATRON_REDUCE = /prefers-reduced-motion:\s*reduce/
  const PATRON_DURACION = /-duration:/

  const reglasConScrollBehaviorSmooth = (): readonly ReturnType<typeof extraerReglas>[number][] =>
    extraerReglas(hojaGlobal()).filter((regla) => regla.declaraciones.includes('scroll-behavior: smooth'))

  it('toda declaración de "scroll-behavior: smooth" está contenida dentro de un bloque "@media (prefers-reduced-motion: no-preference)"', () => {
    const reglas = reglasConScrollBehaviorSmooth()

    expect(reglas.length).toBeGreaterThan(0)
    for (const regla of reglas) {
      expect(regla.ancestros.some((ancestro) => PATRON_NO_PREFERENCE.test(ancestro))).toBe(true)
    }
  })

  it('"scroll-behavior" se declara sobre "html" y no sobre "body"', () => {
    const reglas = reglasConScrollBehaviorSmooth()

    for (const regla of reglas) {
      expect(regla.selectores).toContain('html')
      expect(regla.selectores).not.toContain('body')
    }
  })

  it('el bloque "@media (prefers-reduced-motion: reduce)" anula la duración de animación y de transición con "0.01ms" y no con "0", para que "transitionend"/"animationend" sigan disparándose', () => {
    const declaracionesDeDuracionEnReduce = extraerReglas(hojaGlobal())
      .filter((regla) => regla.ancestros.some((ancestro) => PATRON_REDUCE.test(ancestro)))
      .flatMap((regla) => regla.declaraciones)
      .filter((declaracion) => PATRON_DURACION.test(declaracion))

    expect(declaracionesDeDuracionEnReduce.length).toBeGreaterThan(0)
    for (const declaracion of declaracionesDeDuracionEnReduce) {
      expect(declaracion).toContain('0.01ms')
    }
  })
})

describe('@s17 las dos familias se declaran con su fichero local, su rango de pesos y su subconjunto', () => {
  const bloquesFontFace = (): readonly ReturnType<typeof extraerReglas>[number][] => extraerReglas(hojaGlobal()).filter((regla) => regla.selectores.includes('@font-face'))

  const bloqueDeFamilia = (familia: string): ReturnType<typeof extraerReglas>[number] | undefined =>
    bloquesFontFace().find((regla) => regla.declaraciones.includes(`font-family: '${familia}'`))

  it('existe una "@font-face" para "Outfit" y otra para "DM Sans"', () => {
    expect(bloqueDeFamilia('Outfit')).toBeDefined()
    expect(bloqueDeFamilia('DM Sans')).toBeDefined()
  })

  it('ambas declaran "font-display: swap"', () => {
    for (const familia of ['Outfit', 'DM Sans']) {
      expect(bloqueDeFamilia(familia)?.declaraciones).toContain('font-display: swap')
    }
  })

  it('el origen de ambas es una ruta local que empieza por "/fuentes/" y termina en ".woff2", nunca una URL de "fonts.googleapis.com" ni de "fonts.gstatic.com"', () => {
    for (const familia of ['Outfit', 'DM Sans']) {
      const origen = bloqueDeFamilia(familia)?.declaraciones.find((declaracion) => declaracion.startsWith('src:'))

      expect(origen).toBeDefined()
      expect(origen).toMatch(/url\('\/fuentes\/[\w-]+\.woff2'\)/)
      expect(origen).not.toMatch(/fonts\.googleapis\.com|fonts\.gstatic\.com/)
    }
  })

  it('la de "Outfit" declara el rango de pesos "100 900" y la de "DM Sans" el rango "100 1000"', () => {
    expect(bloqueDeFamilia('Outfit')?.declaraciones).toContain('font-weight: 100 900')
    expect(bloqueDeFamilia('DM Sans')?.declaraciones).toContain('font-weight: 100 1000')
  })

  it('ambas declaran "unicode-range", aunque solo se sirva el subconjunto latino', () => {
    for (const familia of ['Outfit', 'DM Sans']) {
      expect(bloqueDeFamilia(familia)?.declaraciones.some((declaracion) => declaracion.startsWith('unicode-range:'))).toBe(true)
    }
  })

  it('la variable de tipografía de titulares nombra "Outfit" y la de texto nombra "DM Sans"', () => {
    expect(valorDeclarado(hojaGlobal(), ':root', '--fuente-titulares')).toMatch(/^'Outfit'/)
    expect(valorDeclarado(hojaGlobal(), ':root', '--fuente-texto')).toMatch(/^'DM Sans'/)
  })
})

describe('@s18 las dos familias de respaldo declaran las seis métricas ajustadas calculadas con Capsize', () => {
  const bloquesFontFace = (): readonly ReturnType<typeof extraerReglas>[number][] => extraerReglas(hojaGlobal()).filter((regla) => regla.selectores.includes('@font-face'))

  const bloqueDeFamilia = (familia: string): ReturnType<typeof extraerReglas>[number] | undefined =>
    bloquesFontFace().find((regla) => regla.declaraciones.includes(`font-family: '${familia}'`))

  it('la de respaldo de "Outfit" declara "size-adjust: 99.8204%", "ascent-override: 100.18%" y "descent-override: 26.0468%"', () => {
    const declaraciones = bloqueDeFamilia('Outfit Fallback')?.declaraciones ?? []

    expect(declaraciones).toContain('size-adjust: 99.8204%')
    expect(declaraciones).toContain('ascent-override: 100.18%')
    expect(declaraciones).toContain('descent-override: 26.0468%')
  })

  it('la de respaldo de "DM Sans" declara "size-adjust: 104.531%", "ascent-override: 94.9001%" y "descent-override: 29.6563%"', () => {
    const declaraciones = bloqueDeFamilia('DM Sans Fallback')?.declaraciones ?? []

    expect(declaraciones).toContain('size-adjust: 104.531%')
    expect(declaraciones).toContain('ascent-override: 94.9001%')
    expect(declaraciones).toContain('descent-override: 29.6563%')
  })

  it('ambas familias de respaldo declaran su origen con "local(...)", nunca una URL', () => {
    for (const familia of ['Outfit Fallback', 'DM Sans Fallback']) {
      const origen = bloqueDeFamilia(familia)?.declaraciones.find((declaracion) => declaracion.startsWith('src:'))

      expect(origen).toBeDefined()
      expect(origen).toMatch(/^src: local\(/)
      expect(origen).not.toContain('url(')
    }
  })

  it('ambas familias de respaldo aparecen en la pila de la variable de tipografía correspondiente, por detrás de la familia de marca', () => {
    const pilaDeTitulares = valorDeclarado(hojaGlobal(), ':root', '--fuente-titulares') ?? ''
    const pilaDeTexto = valorDeclarado(hojaGlobal(), ':root', '--fuente-texto') ?? ''

    expect(pilaDeTitulares.indexOf("'Outfit'")).toBeGreaterThanOrEqual(0)
    expect(pilaDeTitulares.indexOf("'Outfit Fallback'")).toBeGreaterThan(pilaDeTitulares.indexOf("'Outfit'"))
    expect(pilaDeTexto.indexOf("'DM Sans'")).toBeGreaterThanOrEqual(0)
    expect(pilaDeTexto.indexOf("'DM Sans Fallback'")).toBeGreaterThan(pilaDeTexto.indexOf("'DM Sans'"))
  })
})

describe('(paso 6 del plan) allowlist de familias tipográficas: solo las de marca, sus respaldos o un genérico CSS sin comillas', () => {
  /** Genéricos CSS reales (https://developer.mozilla.org/en-US/docs/Web/CSS/font-family#generic-name): el único identificador sin comillas que este proyecto admite. */
  const GENERICOS_CSS: readonly string[] = ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui']
  const FAMILIAS_CON_COMILLAS_PERMITIDAS: readonly string[] = ["'Outfit'", "'Outfit Fallback'", "'DM Sans'", "'DM Sans Fallback'", "'Arial'"]

  const identificadoresDeLasPilas = (): readonly string[] => {
    const pilaDeTitulares = valorDeclarado(hojaGlobal(), ':root', '--fuente-titulares') ?? ''
    const pilaDeTexto = valorDeclarado(hojaGlobal(), ':root', '--fuente-texto') ?? ''
    return [pilaDeTitulares, pilaDeTexto].flatMap((pila) => pila.split(',').map((identificador) => identificador.trim()))
  }

  it('las dos pilas tipográficas declaran al menos un identificador', () => {
    expect(identificadoresDeLasPilas().length).toBeGreaterThan(0)
  })

  it('todo identificador sin comillas de las pilas es un genérico CSS', () => {
    const sinComillas = identificadoresDeLasPilas().filter((identificador) => !identificador.startsWith("'"))

    expect(sinComillas.length).toBeGreaterThan(0)
    for (const identificador of sinComillas) {
      expect(GENERICOS_CSS).toContain(identificador)
    }
  })

  it('todo identificador entre comillas de las pilas está en la allowlist de familias de marca y respaldo', () => {
    const conComillas = identificadoresDeLasPilas().filter((identificador) => identificador.startsWith("'"))

    expect(conComillas.length).toBeGreaterThan(0)
    for (const identificador of conComillas) {
      expect(FAMILIAS_CON_COMILLAS_PERMITIDAS).toContain(identificador)
    }
  })

  it('un genérico real como "Georgia" escrito sin comillas se rechazaría por no estar en la lista de genéricos CSS', () => {
    expect(GENERICOS_CSS).not.toContain('Georgia')
  })
})

describe('(paso 6 del plan) el texto de "global.scss" nunca abre una @font-face de terceros', () => {
  it('no contiene "url(https:" en ningún @font-face', () => {
    expect(hojaGlobal()).not.toMatch(/url\(https:/)
  })

  it('no contiene ningún "@import url("', () => {
    expect(hojaGlobal()).not.toMatch(/@import\s+url\(/)
  })

  it('declara exactamente 4 bloques "@font-face" (2 familias de marca + 2 de respaldo)', () => {
    const bloques = extraerReglas(hojaGlobal()).filter((regla) => regla.selectores.includes('@font-face'))
    expect(bloques.length).toBe(4)
  })
})

describe('(paso 5 del plan) el anillo de foco global usa el token de color y nunca se anula sin sustituto', () => {
  const reglaDeFocoVisible = (): ReturnType<typeof extraerReglas>[number] | undefined =>
    extraerReglas(hojaGlobal()).find((regla) => regla.selectores.includes(':focus-visible'))

  it('declara ":focus-visible" con "outline" tomado de "var(--color-foco)"', () => {
    const regla = reglaDeFocoVisible()

    expect(regla).toBeDefined()
    expect(regla?.declaraciones.some((declaracion) => declaracion.startsWith('outline:') && declaracion.includes('var(--color-foco)'))).toBe(true)
  })

  it('nunca se declara "outline: none" ni "outline: 0" en la hoja global', () => {
    expect(hojaGlobal()).not.toMatch(/outline:\s*(none|0)\s*;/)
  })
})
