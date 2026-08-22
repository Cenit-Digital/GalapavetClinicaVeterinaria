import { describe, expect, it } from 'vitest'
import {
  construirDatosEstructurados,
  METADATOS_PAGINAS,
  validarMetadatos,
  type DatosNegocioSeo,
  type MetadatosPagina,
} from './seo-logica'

/**
 * Fixture escrita a mano con los datos verificados de `docs/datos-galapavet.md`
 * (§1, §2, §3): nunca se compara contra la constante importada de `site.ts`
 * (patrón `doble-de-test-anclado-al-literal-no-al-simbolo`).
 */
const DATOS_SEO_BASE: DatosNegocioSeo = {
  nombreComercial: 'Galapavet',
  direccion: {
    calle: 'Carretera de Torrelodones, 11',
    codigoPostal: '28260',
    localidad: 'Galapagar',
    region: 'Madrid',
  },
  telefonoClinica: '91 082 92 67',
  horario: [
    { dias: 'Lunes a viernes', horas: '11:00 a 14:00 y 16:30 a 20:00' },
    { dias: 'Sábados', horas: '11:00 a 14:00' },
    { dias: 'Domingos', horas: 'Cerrado' },
  ],
  redesSociales: [],
}

/** Los 6 fragmentos exclusivos, en el mismo orden que exige @s4/@s5, y a qué página pertenecen. */
const FRAGMENTOS_POR_PAGINA: ReadonlyArray<{ clave: string; fragmento: string }> = [
  { clave: 'inicio', fragmento: 'Galapagar' },
  { clave: 'campanas', fragmento: 'prevención' },
  { clave: 'fichaCampana', fragmento: 'Ficha' },
  { clave: 'blog', fragmento: 'Blog' },
  { clave: 'articuloBlog', fragmento: 'Artículo' },
  { clave: 'tienda', fragmento: 'Tienda' },
]

describe('@s4 cada página publicada tiene un título propio, distinto y reconocible como suyo', () => {
  it('hay exactamente seis títulos, ninguno vacío, todos distintos y todos con "Galapavet"', () => {
    expect(METADATOS_PAGINAS).toHaveLength(6)

    const titulos = METADATOS_PAGINAS.map((pagina) => pagina.titulo)
    for (const titulo of titulos) {
      expect(titulo.trim()).not.toBe('')
      expect(titulo).toContain('Galapavet')
    }
    expect(new Set(titulos)).toHaveProperty('size', 6)
  })

  it('cada título contiene el fragmento exclusivo de su propia página y de ninguna otra', () => {
    for (const { clave, fragmento } of FRAGMENTOS_POR_PAGINA) {
      const pagina = METADATOS_PAGINAS.find((candidata) => candidata.clave === clave)
      expect(pagina).toBeDefined()
      expect(pagina?.titulo).toContain(fragmento)

      const otrasPaginas = METADATOS_PAGINAS.filter((candidata) => candidata.clave !== clave)
      for (const otra of otrasPaginas) {
        expect(otra.titulo).not.toContain(fragmento)
      }
    }
  })
})

describe('@s5 cada página publicada tiene una descripción propia, distinta y reconocible como suya', () => {
  it('hay exactamente seis descripciones, ninguna vacía y todas distintas', () => {
    expect(METADATOS_PAGINAS).toHaveLength(6)

    const descripciones = METADATOS_PAGINAS.map((pagina) => pagina.descripcion)
    for (const descripcion of descripciones) {
      expect(descripcion.trim()).not.toBe('')
    }
    expect(new Set(descripciones)).toHaveProperty('size', 6)
  })

  it('cada descripción contiene el fragmento exclusivo de su propia página y de ninguna otra', () => {
    for (const { clave, fragmento } of FRAGMENTOS_POR_PAGINA) {
      const pagina = METADATOS_PAGINAS.find((candidata) => candidata.clave === clave)
      expect(pagina).toBeDefined()
      expect(pagina?.descripcion).toContain(fragmento)

      const otrasPaginas = METADATOS_PAGINAS.filter((candidata) => candidata.clave !== clave)
      for (const otra of otrasPaginas) {
        expect(otra.descripcion).not.toContain(fragmento)
      }
    }
  })
})

const DOS_PAGINAS_CON_LA_MISMA_DESCRIPCION: readonly MetadatosPagina[] = [
  { clave: 'blog', titulo: 'Blog de prueba', descripcion: 'Descripción repetida de prueba' },
  { clave: 'tienda', titulo: 'Tienda de prueba', descripcion: 'Descripción repetida de prueba' },
]

describe('@s6 dos páginas con la misma descripción hacen fallar la validación nombrando el duplicado', () => {
  it('devuelve inválido con un mensaje que nombra la descripción y las dos páginas que la comparten', () => {
    const resultado = validarMetadatos(DOS_PAGINAS_CON_LA_MISMA_DESCRIPCION)

    expect(resultado.valida).toBe(false)
    expect(resultado.mensaje).toContain('Descripción repetida de prueba')
    expect(resultado.mensaje).toContain('blog')
    expect(resultado.mensaje).toContain('tienda')
  })

  it('con las seis descripciones reales, que ya son todas distintas, la validación es válida', () => {
    const resultado = validarMetadatos(METADATOS_PAGINAS)

    expect(resultado.valida).toBe(true)
    expect(resultado.mensaje).toBeUndefined()
  })
})

/** El bloque, pasado por el mismo ida-y-vuelta de JSON que usa el `<script type="application/ld+json">` real (@s7). */
function comoJsonLd(datos: DatosNegocioSeo): Record<string, unknown> {
  return JSON.parse(JSON.stringify(construirDatosEstructurados(datos))) as Record<string, unknown>
}

describe('@s8 el bloque declara el tipo exacto de una clínica veterinaria y el que aporta horario', () => {
  it('declara el contexto de schema.org y el tipo ["VeterinaryCare","LocalBusiness"], y ningún otro', () => {
    const bloque = comoJsonLd(DATOS_SEO_BASE)

    expect(bloque['@context']).toBe('https://schema.org')
    expect(bloque['@type']).toEqual(['VeterinaryCare', 'LocalBusiness'])
  })
})

describe('@s9 la dirección se emite con las propiedades de dirección postal del vocabulario', () => {
  it('la dirección declara PostalAddress con las cinco propiedades exactas', () => {
    const bloque = comoJsonLd(DATOS_SEO_BASE)
    const direccion = bloque.address as Record<string, unknown>

    expect(direccion['@type']).toBe('PostalAddress')
    expect(direccion.streetAddress).toBe('Carretera de Torrelodones, 11')
    expect(direccion.postalCode).toBe('28260')
    expect(direccion.addressLocality).toBe('Galapagar')
    expect(direccion.addressRegion).toBe('Madrid')
    expect(direccion.addressCountry).toBe('ES')
  })
})

interface TramoAbierto {
  readonly '@type': string
  readonly dayOfWeek: readonly string[]
  readonly opens: string
  readonly closes: string
}

describe('@s13 el horario se emite como los tres tramos que el cliente publica', () => {
  it('hay exactamente tres tramos, cada uno OpeningHoursSpecification, con los días y horas exactos', () => {
    const bloque = comoJsonLd(DATOS_SEO_BASE)
    const tramos = bloque.openingHoursSpecification as TramoAbierto[]

    expect(tramos).toHaveLength(3)
    for (const tramo of tramos) {
      expect(tramo['@type']).toBe('OpeningHoursSpecification')
    }

    const lunesAViernesManana = tramos.find((tramo) => tramo.opens === '11:00' && tramo.closes === '14:00')
    expect(lunesAViernesManana?.dayOfWeek).toEqual(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])

    const lunesAViernesTarde = tramos.find((tramo) => tramo.opens === '16:30' && tramo.closes === '20:00')
    expect(lunesAViernesTarde?.dayOfWeek).toEqual(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])

    const sabado = tramos.find((tramo) => tramo.dayOfWeek.includes('Saturday'))
    expect(sabado?.opens).toBe('11:00')
    expect(sabado?.closes).toBe('14:00')
  })
})

describe('@s14 el bloque no declara ningún horario de domingo porque la clínica cierra', () => {
  it('ningún tramo incluye "Sunday" ni tiene apertura igual a cierre, y no hay ningún tramo cuarto', () => {
    const bloque = comoJsonLd(DATOS_SEO_BASE)
    const tramos = bloque.openingHoursSpecification as TramoAbierto[]

    expect(tramos).toHaveLength(3)
    for (const tramo of tramos) {
      expect(tramo.dayOfWeek).not.toContain('Sunday')
      expect(tramo.opens).not.toBe(tramo.closes)
    }
  })

  it('el JSON serializado no contiene la palabra "Sunday" bajo ninguna forma', () => {
    const crudo = JSON.stringify(construirDatosEstructurados(DATOS_SEO_BASE))

    expect(crudo).not.toContain('Sunday')
  })
})

const DATOS_SEO_CON_ETIQUETA_NO_RECONOCIDA: DatosNegocioSeo = {
  ...DATOS_SEO_BASE,
  horario: [...DATOS_SEO_BASE.horario, { dias: 'Festivos', horas: '10:00 a 12:00' }],
}

describe('@s14 refuerzo mutación: una etiqueta de día no reconocida con horas parseables no aporta tramo ni lanza', () => {
  it('el bloque se construye sin lanzar y solo tiene los tramos de las etiquetas reconocidas', () => {
    expect(() => construirDatosEstructurados(DATOS_SEO_CON_ETIQUETA_NO_RECONOCIDA)).not.toThrow()

    const bloque = comoJsonLd(DATOS_SEO_CON_ETIQUETA_NO_RECONOCIDA)
    const tramos = bloque.openingHoursSpecification as TramoAbierto[]

    expect(tramos).toHaveLength(3)
    expect(tramos.some((tramo) => tramo.opens === '10:00' && tramo.closes === '12:00')).toBe(false)
  })
})

describe('@s7 cada página publica un único bloque de datos estructurados y es JSON válido', () => {
  it('el bloque serializa a JSON válido y el resultado del parseo es un objeto, no una cadena ni una lista', () => {
    const crudo = JSON.stringify(construirDatosEstructurados(DATOS_SEO_BASE))

    const analizar = (): unknown => JSON.parse(crudo)
    expect(analizar).not.toThrow()

    const analizado = analizar()
    expect(typeof analizado).toBe('object')
    expect(analizado).not.toBeNull()
    expect(Array.isArray(analizado)).toBe(false)
  })
})

const DATOS_SEO_SIN_HORARIO: DatosNegocioSeo = { ...DATOS_SEO_BASE, horario: [] }

describe('@s17 una lista de tramos de horario vacía omite la propiedad entera', () => {
  it('sin ningún tramo de horario, la propiedad "openingHoursSpecification" no existe, y el nombre y la dirección siguen presentes', () => {
    const bloque = comoJsonLd(DATOS_SEO_SIN_HORARIO)

    expect('openingHoursSpecification' in bloque).toBe(false)
    expect(bloque.name).toBe('Galapavet')
    expect(bloque.address).toBeDefined()
  })
})

describe('el teléfono declarado tiene los mismos dígitos que el teléfono legible de la clínica (soporte de @s10)', () => {
  it('el teléfono declarado, sin espacios ni signo "+", termina en los mismos 9 dígitos que "91 082 92 67"', () => {
    const bloque = comoJsonLd(DATOS_SEO_BASE)

    expect(bloque.telephone).toBeDefined()
    const soloDigitos = String(bloque.telephone).replace(/\D/g, '')
    expect(soloDigitos.endsWith('910829267')).toBe(true)
  })
})

const DATOS_SEO_SIN_COORDENADAS: DatosNegocioSeo = DATOS_SEO_BASE

describe('@s15 sin coordenadas verificadas la geolocalización se omite en vez de emitirse a cero', () => {
  it('sin "coordenadas" en la fuente, no hay "geo", ni latitud, ni longitud, ni valores a cero o vacíos', () => {
    const bloque = comoJsonLd(DATOS_SEO_SIN_COORDENADAS)

    expect('geo' in bloque).toBe(false)
    expect(JSON.stringify(bloque)).not.toContain('latitude')
    expect(JSON.stringify(bloque)).not.toContain('longitude')
    expect(bloque.address).toBeDefined()
  })
})

const DATOS_SEO_SIN_EMAIL_NI_REDES: DatosNegocioSeo = { ...DATOS_SEO_BASE, redesSociales: [] }

/** Recorre el árbol y lista toda cadena vacía, lista vacía o `null` que encuentre — nunca en producción, solo en el test (@s16). */
function valoresVaciosOnulos(valor: unknown): unknown[] {
  if (valor === null) {
    return [valor]
  }
  if (Array.isArray(valor)) {
    return valor.length === 0 ? [valor] : valor.flatMap(valoresVaciosOnulos)
  }
  if (typeof valor === 'string') {
    return valor === '' ? [valor] : []
  }
  if (typeof valor === 'object') {
    return Object.values(valor as Record<string, unknown>).flatMap(valoresVaciosOnulos)
  }
  return []
}

describe('@s16 un dato opcional ausente en la fuente única omite su propiedad en vez de emitirla vacía', () => {
  it('sin email ni redes sociales, no hay "email" ni "sameAs", y ninguna propiedad vale cadena vacía, lista vacía o null', () => {
    const bloque = comoJsonLd(DATOS_SEO_SIN_EMAIL_NI_REDES)

    expect('email' in bloque).toBe(false)
    expect('sameAs' in bloque).toBe(false)
    expect(valoresVaciosOnulos(bloque)).toEqual([])
  })
})

describe('@s16 refuerzo mutación: sin email, la clave "email" está ausente incluso sin pasar por JSON.stringify/parse', () => {
  it('el objeto devuelto directamente por construirDatosEstructurados no tiene la clave "email"', () => {
    const bloque = construirDatosEstructurados(DATOS_SEO_SIN_EMAIL_NI_REDES)

    expect('email' in bloque).toBe(false)
  })
})

const DATOS_SEO_CON_REDES_SOCIALES: DatosNegocioSeo = {
  ...DATOS_SEO_BASE,
  redesSociales: ['https://facebook.com/ejemplo-prueba', 'https://instagram.com/ejemplo-prueba'],
}

describe('@s16 refuerzo mutación: con redes sociales presentes, "sameAs" declara exactamente esa lista', () => {
  it('sameAs contiene las mismas URLs, en el mismo orden, ni vacía ni ausente', () => {
    const bloque = comoJsonLd(DATOS_SEO_CON_REDES_SOCIALES)

    expect(bloque.sameAs).toEqual(['https://facebook.com/ejemplo-prueba', 'https://instagram.com/ejemplo-prueba'])
  })
})

describe('@s18 la valoración de Google no se hornea en el bloque por ser un dato vivo', () => {
  it('no hay ninguna propiedad de valoración agregada, ni puntuación, ni recuento de reseñas, ni registro sanitario ni fundación', () => {
    const bloque = comoJsonLd(DATOS_SEO_BASE)
    const crudo = JSON.stringify(bloque)

    expect('aggregateRating' in bloque).toBe(false)
    expect(crudo).not.toContain('ratingValue')
    expect(crudo).not.toContain('reviewCount')
    expect(crudo.toLowerCase()).not.toContain('registro')
    expect(crudo.toLowerCase()).not.toContain('fund')
  })
})

describe('@s19 ningún tramo de horario del bloque cubre las 24 horas ni los 7 días de la semana', () => {
  it('ningún tramo del bloque real cubre el día completo ni la semana completa', () => {
    const bloque = comoJsonLd(DATOS_SEO_BASE)
    const tramos = bloque.openingHoursSpecification as TramoAbierto[]

    for (const tramo of tramos) {
      expect(tramo.opens === '00:00' && tramo.closes === '00:00').toBe(false)
      expect(tramo.dayOfWeek.length).toBeLessThan(7)
    }
  })

  it('ningún título ni ninguna descripción de las seis páginas contiene ningún reclamo del prototipo descartado', () => {
    const EXPRESIONES_PROHIBIDAS: readonly string[] = ['24 h', '24 horas', 'todos los días del año', 'desde 2013']

    for (const pagina of METADATOS_PAGINAS) {
      for (const expresion of EXPRESIONES_PROHIBIDAS) {
        expect(pagina.titulo).not.toContain(expresion)
        expect(pagina.descripcion).not.toContain(expresion)
      }
    }
  })
})

const DATOS_SEO_SOLO_LATITUD: DatosNegocioSeo = { ...DATOS_SEO_BASE, coordenadas: { latitud: 40.633 } }

describe('@s21 con una sola de las dos coordenadas verificada la geolocalización se sigue omitiendo entera', () => {
  it('con solo la latitud, sin longitud, tampoco hay "geo", ni latitud ni longitud, y la dirección se emite completa', () => {
    const bloque = comoJsonLd(DATOS_SEO_SOLO_LATITUD)

    expect('geo' in bloque).toBe(false)
    expect(JSON.stringify(bloque)).not.toContain('latitude')
    expect(JSON.stringify(bloque)).not.toContain('longitude')
    expect(bloque.address).toBeDefined()
  })
})

const DATOS_SEO_CON_EMAIL_SIN_REDES: DatosNegocioSeo = {
  ...DATOS_SEO_BASE,
  email: 'contacto@ejemplo-de-prueba.test',
  redesSociales: [],
}

describe('@s22 un dato opcional presente no impide omitir otro dato opcional que sigue ausente', () => {
  it('con email pero sin redes sociales, "email" está presente con su valor y "sameAs" no existe', () => {
    const bloque = comoJsonLd(DATOS_SEO_CON_EMAIL_SIN_REDES)

    expect(bloque.email).toBe('contacto@ejemplo-de-prueba.test')
    expect('sameAs' in bloque).toBe(false)
    expect(valoresVaciosOnulos(bloque)).toEqual([])
  })
})
