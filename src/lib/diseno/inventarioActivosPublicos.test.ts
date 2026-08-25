import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { compararRutasDeclaradasConFicherosReales, extraerRutasDeFuenteDeclaradas, extraerRutasDeImagenDeclaradas } from './inventarioActivosPublicos'

describe('extraerRutasDeImagenDeclaradas', () => {
  it('extrae una ruta "/img/…" entre comillas simples', () => {
    expect(extraerRutasDeImagenDeclaradas(["imagen: '/img/campanas/vacunaciones.webp',"])).toEqual(['/img/campanas/vacunaciones.webp'])
  })

  it('extrae una ruta "/img/…" entre comillas dobles', () => {
    expect(extraerRutasDeImagenDeclaradas(['const SRC_LOGO = "/img/logo-galapavet.webp"'])).toEqual(['/img/logo-galapavet.webp'])
  })

  it('no repite una ruta que aparece más de una vez en el mismo texto', () => {
    const texto = "a: '/img/tienda/manta-60x40.webp', b: '/img/tienda/manta-60x40.webp'"
    expect(extraerRutasDeImagenDeclaradas([texto])).toEqual(['/img/tienda/manta-60x40.webp'])
  })

  it('junta las rutas de varios textos, ordenadas', () => {
    const rutas = extraerRutasDeImagenDeclaradas(["b: '/img/b.png'", "a: '/img/a.webp'"])
    expect(rutas).toEqual(['/img/a.webp', '/img/b.png'])
  })

  it('extrae una ruta "/img/…" con extensión ".jpg" (sin "e"), la mitad corta de la alternancia "jpe?g"', () => {
    expect(extraerRutasDeImagenDeclaradas(["dato: '/img/galeria/ejemplo.jpg'"])).toEqual(['/img/galeria/ejemplo.jpg'])
  })

  it('extrae una ruta "/img/…" con extensión ".jpeg" (con "e"), la mitad larga de la misma alternancia', () => {
    expect(extraerRutasDeImagenDeclaradas(["dato: '/img/galeria/ejemplo.jpeg'"])).toEqual(['/img/galeria/ejemplo.jpeg'])
  })

  it('ignora una cadena que no empieza por "/img/"', () => {
    expect(extraerRutasDeImagenDeclaradas(["href: '/blog/demo-1'", "otra: '/favicon.svg'"])).toEqual([])
  })

  it('ignora una cadena "/img/…" con una extensión que no es de imagen', () => {
    expect(extraerRutasDeImagenDeclaradas(["dato: '/img/campanas/vacunaciones.txt'"])).toEqual([])
  })

  it('con una lista de textos vacía no encuentra ninguna ruta', () => {
    expect(extraerRutasDeImagenDeclaradas([])).toEqual([])
  })
})

describe('extraerRutasDeFuenteDeclaradas', () => {
  it('extrae una ruta "/fuentes/….woff2" de un "url(...)"', () => {
    const texto = "src: url('/fuentes/outfit-latin-wght-normal.woff2') format('woff2-variations');"
    expect(extraerRutasDeFuenteDeclaradas(texto)).toEqual(['/fuentes/outfit-latin-wght-normal.woff2'])
  })

  it('no confunde un "local(...)" de una familia de respaldo con una ruta de fuente', () => {
    expect(extraerRutasDeFuenteDeclaradas("src: local('Arial'), local('ArialMT');")).toEqual([])
  })

  it('junta las rutas de varios "@font-face" del mismo texto, ordenadas', () => {
    const texto = "src: url('/fuentes/dm-sans-latin-wght-normal.woff2') format('x'); src: url('/fuentes/outfit-latin-wght-normal.woff2') format('x');"
    expect(extraerRutasDeFuenteDeclaradas(texto)).toEqual(['/fuentes/dm-sans-latin-wght-normal.woff2', '/fuentes/outfit-latin-wght-normal.woff2'])
  })

  it('con un texto vacío no encuentra ninguna ruta', () => {
    expect(extraerRutasDeFuenteDeclaradas('')).toEqual([])
  })
})

describe('compararRutasDeclaradasConFicherosReales', () => {
  it('pasa cuando cada ruta declarada tiene su fichero real', () => {
    const informe = compararRutasDeclaradasConFicherosReales(['/img/a.webp', '/img/b.webp'], ['/img/a.webp', '/img/b.webp', '/img/c.webp'])

    expect(informe.pasa).toBe(true)
    expect(informe.rutasDeclaradas).toBe(2)
    expect(informe.rutasFaltantes).toEqual([])
  })

  it('detecta y nombra una ruta declarada sin fichero real', () => {
    const informe = compararRutasDeclaradasConFicherosReales(['/img/a.webp', '/img/b.webp'], ['/img/a.webp'])

    expect(informe.pasa).toBe(false)
    expect(informe.rutasFaltantes).toEqual(['/img/b.webp'])
  })

  it('falla cerrado con la lista de rutas declaradas vacía, aunque los ficheros reales no falten ninguno', () => {
    const informe = compararRutasDeclaradasConFicherosReales([], ['/img/a.webp'])

    expect(informe.pasa).toBe(false)
  })

  it('falla cerrado con la lista de ficheros reales vacía, aunque haya rutas declaradas', () => {
    const informe = compararRutasDeclaradasConFicherosReales(['/img/a.webp'], [])

    expect(informe.pasa).toBe(false)
    expect(informe.rutasFaltantes).toEqual(['/img/a.webp'])
  })
})

// ----------------------------------------------------------------------------
// (paso 6 y paso 8 del plan) la comprobación real sobre el árbol del repositorio
// ----------------------------------------------------------------------------

const textoDeLaHojaGlobal = import.meta.glob('../../styles/global.scss', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>
const textosDeDatos = import.meta.glob('../../data/*.ts', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>
const textoDeMetadatosPagina = import.meta.glob('../../components/MetadatosPagina.tsx', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>
const textoDePieDePagina = import.meta.glob('../../components/PieDePagina.tsx', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>

const DIRECTORIO_PUBLIC = join(process.cwd(), 'public')

function ficherosRealesBajo(subcarpeta: string, extensionesPermitidas: RegExp): readonly string[] {
  const directorio = join(DIRECTORIO_PUBLIC, subcarpeta)
  if (!existsSync(directorio)) {
    return []
  }
  return (readdirSync(directorio, { recursive: true }) as string[])
    .filter((ruta) => extensionesPermitidas.test(ruta))
    .map((ruta) => `/${subcarpeta}/${ruta.split('\\').join('/')}`)
}

const rutasDeImagenDeclaradas = (): readonly string[] =>
  extraerRutasDeImagenDeclaradas([...Object.values(textosDeDatos), ...Object.values(textoDeMetadatosPagina), ...Object.values(textoDePieDePagina)])

const rutasDeImagenReales = (): readonly string[] => ficherosRealesBajo('img', /\.(webp|png|jpe?g|svg)$/)

const rutasDeFuenteDeclaradas = (): readonly string[] => extraerRutasDeFuenteDeclaradas(Object.values(textoDeLaHojaGlobal).join('\n'))

const rutasDeFuenteReales = (): readonly string[] => ficherosRealesBajo('fuentes', /\.woff2$/)

describe('(paso 8 del plan) las rutas de imagen declaradas en "src/data", "MetadatosPagina.tsx" y "PieDePagina.tsx" existen de verdad en "public/img/"', () => {
  it('el recuento de rutas declaradas efectivamente comprobadas es mayor que 0', () => {
    expect(rutasDeImagenDeclaradas().length).toBeGreaterThan(0)
  })

  it('ninguna ruta declarada carece de fichero real', () => {
    const informe = compararRutasDeclaradasConFicherosReales(rutasDeImagenDeclaradas(), rutasDeImagenReales())

    expect(informe.rutasFaltantes).toEqual([])
    expect(informe.pasa).toBe(true)
  })
})

describe('(paso 6 del plan) las rutas de fuente declaradas en "src/styles/global.scss" existen de verdad en "public/fuentes/"', () => {
  it('el recuento de rutas de fuente declaradas es exactamente 2', () => {
    expect(rutasDeFuenteDeclaradas().length).toBe(2)
  })

  it('ninguna ruta de fuente declarada carece de fichero real', () => {
    const informe = compararRutasDeclaradasConFicherosReales(rutasDeFuenteDeclaradas(), rutasDeFuenteReales())

    expect(informe.rutasFaltantes).toEqual([])
    expect(informe.pasa).toBe(true)
  })
})
