/**
 * `hrefDeDestino(destino, base)`: función pura parametrizada por la base
 * (Decisión 48). Mordible por StrykerJS (`src/lib/**`, `stryker.config.json`).
 * @s2 confirma que `import.meta.env.BASE_URL` sigue siendo "/" fuera del
 * flag "vite build --base" (Decisión 47); @s4/@s5/@s6 cubren la función pura
 * en sí: concatenación, ausencia de doble barra y anclas sin prefijo.
 */
import { describe, expect, it } from 'vitest'
import { hrefDeDestino } from './hrefDeDestino'

describe('@s2 la suite de Vitest no necesita ningún cambio porque su BASE_URL sigue siendo la raíz', () => {
  it('import.meta.env.BASE_URL vale exactamente "/"', () => {
    expect(import.meta.env.BASE_URL).toBe('/')
  })

  it.each(['/campanas', '/blog', '/tienda'])(
    'hrefDeDestino("%s") con BASE_URL de test devuelve el mismo literal, sin prefijo',
    (destino) => {
      expect(hrefDeDestino(destino, import.meta.env.BASE_URL)).toBe(destino)
    },
  )
})

describe('@s4 hrefDeDestino concatena la base y un destino de ruta, en la base de producción y en la de test', () => {
  const BASE_PRODUCCION = '/GalapavetClinicaVeterinaria/'
  const BASE_TEST = '/'
  const DESTINOS = ['/campanas', '/blog', '/tienda'] as const

  it.each(DESTINOS)('con la base de producción, "%s" resuelve con el subpath por delante', (destino) => {
    expect(hrefDeDestino(destino, BASE_PRODUCCION)).toBe(`/GalapavetClinicaVeterinaria${destino}`)
  })

  it.each(DESTINOS)('con la base "/", "%s" resuelve exactamente igual que hoy', (destino) => {
    expect(hrefDeDestino(destino, BASE_TEST)).toBe(destino)
  })

  it('el recuento de pares (destino, base) efectivamente comprobados es exactamente 6', () => {
    expect(DESTINOS.length * 2).toBe(6)
  })
})

describe('@s5 la concatenación de base y destino nunca produce una doble barra', () => {
  it('hrefDeDestino("/campanas", "/GalapavetClinicaVeterinaria/") es exactamente "/GalapavetClinicaVeterinaria/campanas"', () => {
    const resultado = hrefDeDestino('/campanas', '/GalapavetClinicaVeterinaria/')

    expect(resultado).toBe('/GalapavetClinicaVeterinaria/campanas')
    expect(resultado).not.toContain('//')
  })

  // Refuerzo de mutación (26/08/2026): la suite entera, hasta este test,
  // solo pasa bases que EMPIEZAN y TERMINAN en "/". Con esos datos, "termina
  // en barra", "empieza por barra" y "siempre verdadero" son indistinguibles
  // para "sinBarraFinal" (progress/mutation_despliegue_github_pages.md). Esta
  // base empieza por "/" pero NO termina en "/": ejerce la rama "else" (no le
  // quites nada) y, con una igualdad EXACTA, distingue el comportamiento
  // correcto de los dos mutantes de esa condición.
  it('hrefDeDestino("/campanas", "/GalapavetClinicaVeterinaria") con una base que empieza pero NO termina en barra es exactamente "/GalapavetClinicaVeterinaria/campanas"', () => {
    const resultado = hrefDeDestino('/campanas', '/GalapavetClinicaVeterinaria')

    expect(resultado).toBe('/GalapavetClinicaVeterinaria/campanas')
  })
})

// Enmienda (26/08/2026, Decisiones 52-55): las 24 rutas de imagen literales
// reales declaradas en "PieDePagina.tsx" (SRC_LOGO), "galeria.ts",
// "campanas.ts", "blog.ts" y "tienda.ts", más "RUTA_IMAGEN_OPEN_GRAPH" de
// "MetadatosPagina.tsx" — 25 en total (@s18). Escritas a mano, no importadas
// de la producción (patrón "doble-de-test-anclado-al-literal-no-al-simbolo",
// `feature_list.json` → `rules.notas`): comparar contra el símbolo importado
// no demostraría nada si el propio símbolo cambiara de valor a la vez que el
// test.
const RUTAS_DE_IMAGEN_REALES = [
  '/img/logo-galapavet.webp', // PieDePagina.tsx, SRC_LOGO
  '/img/galeria/nala-y-coco.webp',
  '/img/galeria/bruno.webp',
  '/img/galeria/luna.webp',
  '/img/galeria/toby.webp',
  '/img/galeria/milo.webp',
  '/img/galeria/kira.webp',
  '/img/campanas/vacunaciones.webp',
  '/img/campanas/chequeo.webp',
  '/img/campanas/odontologia.webp',
  '/img/blog/demo-1.webp',
  '/img/blog/demo-2.webp',
  '/img/blog/demo-3.webp',
  '/img/blog/demo-4.webp',
  '/img/blog/demo-5.webp',
  '/img/blog/demo-6.webp',
  '/img/tienda/pienso-perro-adulto.webp',
  '/img/tienda/pienso-gato-esterilizado.webp',
  '/img/tienda/arnes-talla-m.webp',
  '/img/tienda/correa-2m.webp',
  '/img/tienda/cama-talla-m.webp',
  '/img/tienda/manta-60x40.webp',
  '/img/tienda/mordedor-caucho.webp',
  '/img/tienda/pelota-con-sonido.webp',
  '/img/mapa/galapagar.webp', // src/data/mapa.ts, MAPA_ESTATICO (fidelidad_contacto, Decisión 63)
  '/img/og/galapavet.png', // MetadatosPagina.tsx, RUTA_IMAGEN_OPEN_GRAPH
] as const

describe('@s18 hrefDeDestino calcula igual para una ruta de imagen que para una ruta de enlace, en producción y en test', () => {
  const BASE_PRODUCCION = '/GalapavetClinicaVeterinaria/'
  const BASE_TEST = '/'

  it.each(RUTAS_DE_IMAGEN_REALES)('con la base de producción, "%s" resuelve con el subpath como único prefijo, sin "//"', (ruta) => {
    const resultado = hrefDeDestino(ruta, BASE_PRODUCCION)

    expect(resultado).toBe(`/GalapavetClinicaVeterinaria${ruta}`)
    expect(resultado).not.toContain('//')
  })

  it.each(RUTAS_DE_IMAGEN_REALES)('con la base "/" (Vitest), "%s" resuelve idéntica al literal crudo original', (ruta) => {
    expect(hrefDeDestino(ruta, BASE_TEST)).toBe(ruta)
  })

  it('el recuento de rutas efectivamente comprobadas es exactamente 26', () => {
    expect(RUTAS_DE_IMAGEN_REALES).toHaveLength(26)
  })
})

describe('@s6 un destino de tipo ancla nunca pasa por el prefijo de la base', () => {
  const DESTINOS_ANCLA = ['#servicios', '#equipo', '#contacto'] as const

  it.each(DESTINOS_ANCLA)('"%s" resuelve idéntico al destino original, con la base de producción y con "/"', (destino) => {
    expect(hrefDeDestino(destino, '/GalapavetClinicaVeterinaria/')).toBe(destino)
    expect(hrefDeDestino(destino, '/')).toBe(destino)
  })

  it('el recuento de destinos ancla efectivamente comprobados es exactamente 3', () => {
    expect(DESTINOS_ANCLA.length).toBe(3)
  })
})

// @s22 (Decisión 55): "DOMINIO_SITIO" y "RUTA_IMAGEN_OPEN_GRAPH" no se
// exportan de "MetadatosPagina.tsx" (son privados a ese módulo) — mismos
// literales escritos a mano aquí, verificados dígito a dígito contra el
// fichero real (mismo patrón que "RUTAS_DE_IMAGEN_REALES", arriba).
describe('@s22 og:image resuelve como URL absoluta con esquema, host y subpath en producción, y sigue siendo invisible en test', () => {
  const DOMINIO_SITIO = 'https://cenit-digital.github.io'
  const RUTA_IMAGEN_OPEN_GRAPH = '/img/og/galapavet.png'

  it('con la base de producción, compone exactamente "https://cenit-digital.github.io/GalapavetClinicaVeterinaria/img/og/galapavet.png"', () => {
    const imagenOpenGraph = `${DOMINIO_SITIO}${hrefDeDestino(RUTA_IMAGEN_OPEN_GRAPH, '/GalapavetClinicaVeterinaria/')}`

    expect(imagenOpenGraph).toBe('https://cenit-digital.github.io/GalapavetClinicaVeterinaria/img/og/galapavet.png')
  })

  it('con la base "/" (Vitest), compone exactamente "https://cenit-digital.github.io/img/og/galapavet.png", el mismo literal ya "done" de seo_estructura.feature', () => {
    const imagenOpenGraph = `${DOMINIO_SITIO}${hrefDeDestino(RUTA_IMAGEN_OPEN_GRAPH, '/')}`

    expect(imagenOpenGraph).toBe('https://cenit-digital.github.io/img/og/galapavet.png')
  })
})
