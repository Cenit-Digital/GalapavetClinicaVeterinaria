import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { BloqueServicio } from '../data/servicios'
import { Servicios } from './Servicios'

/** Centraliza el render de `Servicios` bajo test. */
function renderizarServicios(props: React.ComponentProps<typeof Servicios> = {}): ReturnType<typeof render> {
  return render(<Servicios {...props} />)
}

/**
 * Los 5 títulos de bloque en el orden publicado por el cliente. Literal
 * escrito a mano (no importado de `src/data/servicios.ts`): patrón
 * `doble-de-test-anclado-al-literal-no-al-simbolo`.
 */
const TITULOS_EN_ORDEN = ['Cirugía y anestesia', 'Diagnóstico de imagen', 'Medicina general', 'Análisis', 'Especialidades']

/** Los 26 puntos reales, en el orden de los 5 bloques (@s4-@s8), tal y como los exige @s18. */
const TODOS_LOS_PUNTOS_EN_ORDEN = [
  'Cirugía de tejidos blandos',
  'Esterilizaciones',
  'Cirugía oncológica',
  'Cirugía digestiva',
  'Odontología',
  'Anestesia inhalatoria',
  'Monitorización',
  'Servicios de radiología y ecografía propios',
  'Ecografía',
  'Eco-cardiografía',
  'Endoscopia',
  'Preventiva',
  'Vacunaciones',
  'Desparasitaciones',
  'Chequeo',
  'Identificación con microchip',
  'Laboratorio de análisis clínicos propio',
  'Perfiles generales',
  'Enfermedades infecciosas y parasitarias (leishmania, leucemia felina…)',
  'Cultivos',
  'Biopsia y citología',
  'Hormonales',
  'Odontología',
  'Oftalmología',
  'Traumatología',
  'Endoscopia',
]

/** Localiza la sección «Servicios» a partir de su encabezado de nivel 2. */
function obtenerSeccionServicios(): HTMLElement {
  const encabezado = screen.getByRole('heading', { level: 2, name: 'Servicios' })
  const seccion = encabezado.closest('section')
  if (seccion === null) {
    throw new Error('No se encontró el elemento <section> que envuelve el encabezado "Servicios"')
  }
  return seccion
}

/** Localiza la tarjeta de un bloque a partir de su encabezado de nivel 3. */
function obtenerTarjeta(titulo: string): HTMLElement {
  const encabezado = screen.getByRole('heading', { level: 3, name: titulo })
  const tarjeta = encabezado.closest('article')
  if (tarjeta === null) {
    throw new Error(`No se encontró el elemento <article> que envuelve la tarjeta "${titulo}"`)
  }
  return tarjeta
}

/** Pulsa el botón de desplegar/plegar de la tarjeta de un bloque. */
async function pulsarBoton(usuario: ReturnType<typeof userEvent.setup>, titulo: string): Promise<void> {
  const boton = within(obtenerTarjeta(titulo)).getByRole('button')
  await usuario.click(boton)
}

/**
 * Catálogo mínimo de 5 bloques (mismos 5 títulos, contenido arbitrario) para
 * probar el caso límite de un desglose vacío en «Especialidades» (@s15). No
 * usa `SERVICIOS`: es un literal propio del test.
 */
const CATALOGO_CON_UN_BLOQUE_VACIO: readonly BloqueServicio[] = [
  { titulo: 'Cirugía y anestesia', puntos: ['Punto A'] },
  { titulo: 'Diagnóstico de imagen', puntos: ['Punto B'] },
  { titulo: 'Medicina general', puntos: ['Punto C'] },
  { titulo: 'Análisis', puntos: ['Punto D'] },
  { titulo: 'Especialidades', puntos: [] },
]

describe('@s1 la sección muestra exactamente los cinco bloques publicados, en orden', () => {
  it('hay un h2 "Servicios" y, dentro de su sección, exactamente 5 h3 con estos nombres en este orden', () => {
    renderizarServicios()

    const seccion = obtenerSeccionServicios()
    const encabezados = within(seccion).getAllByRole('heading', { level: 3 })

    expect(encabezados.map((encabezado) => encabezado.textContent)).toEqual(TITULOS_EN_ORDEN)
  })
})

describe('@s2 al cargar la página las cinco tarjetas están colapsadas', () => {
  it('hay exactamente 5 botones, todos con aria-expanded "false", rótulo "Ver qué incluye" y sin ningún elemento de lista', () => {
    renderizarServicios()

    const botones = screen.getAllByRole('button')
    expect(botones).toHaveLength(5)
    for (const boton of botones) {
      expect(boton).toHaveAttribute('aria-expanded', 'false')
      expect(boton.textContent).toBe('Ver qué incluye')
    }
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })
})

describe('@s3 la tarjeta colapsada solo afirma el título del bloque', () => {
  it('el texto completo de la tarjeta "Medicina general" es exactamente su título y el rótulo de su botón', () => {
    renderizarServicios()

    const tarjeta = obtenerTarjeta('Medicina general')

    expect(tarjeta.textContent).toBe('Medicina generalVer qué incluye')
  })
})

describe('@s4 desplegar «Cirugía y anestesia» lista sus 7 puntos publicados', () => {
  it('la lista tiene exactamente estos 7 nombres accesibles en orden, sin marca de verificación', async () => {
    const usuario = userEvent.setup()
    renderizarServicios()

    await pulsarBoton(usuario, 'Cirugía y anestesia')

    const puntos = within(obtenerTarjeta('Cirugía y anestesia'))
      .getAllByRole('listitem')
      .map((elemento) => elemento.textContent)

    expect(puntos).toEqual([
      'Cirugía de tejidos blandos',
      'Esterilizaciones',
      'Cirugía oncológica',
      'Cirugía digestiva',
      'Odontología',
      'Anestesia inhalatoria',
      'Monitorización',
    ])
    expect(puntos.every((nombre) => !(nombre ?? '').includes('✓'))).toBe(true)
  })
})

describe('@s5 desplegar «Diagnóstico de imagen» lista sus 4 puntos publicados', () => {
  it('la lista tiene exactamente estos 4 nombres accesibles en orden', async () => {
    const usuario = userEvent.setup()
    renderizarServicios()

    await pulsarBoton(usuario, 'Diagnóstico de imagen')

    const puntos = within(obtenerTarjeta('Diagnóstico de imagen'))
      .getAllByRole('listitem')
      .map((elemento) => elemento.textContent)

    expect(puntos).toEqual(['Servicios de radiología y ecografía propios', 'Ecografía', 'Eco-cardiografía', 'Endoscopia'])
  })
})

describe('@s6 desplegar «Medicina general» lista sus 5 puntos publicados', () => {
  it('la lista tiene exactamente estos 5 nombres accesibles en orden', async () => {
    const usuario = userEvent.setup()
    renderizarServicios()

    await pulsarBoton(usuario, 'Medicina general')

    const puntos = within(obtenerTarjeta('Medicina general'))
      .getAllByRole('listitem')
      .map((elemento) => elemento.textContent)

    expect(puntos).toEqual(['Preventiva', 'Vacunaciones', 'Desparasitaciones', 'Chequeo', 'Identificación con microchip'])
  })
})

describe('@s7 desplegar «Análisis» lista sus 6 puntos publicados', () => {
  it('la lista tiene exactamente estos 6 nombres accesibles en orden', async () => {
    const usuario = userEvent.setup()
    renderizarServicios()

    await pulsarBoton(usuario, 'Análisis')

    const puntos = within(obtenerTarjeta('Análisis'))
      .getAllByRole('listitem')
      .map((elemento) => elemento.textContent)

    expect(puntos).toEqual([
      'Laboratorio de análisis clínicos propio',
      'Perfiles generales',
      'Enfermedades infecciosas y parasitarias (leishmania, leucemia felina…)',
      'Cultivos',
      'Biopsia y citología',
      'Hormonales',
    ])
  })
})

describe('@s8 desplegar «Especialidades» lista sus 4 puntos publicados', () => {
  it('la lista tiene exactamente estos 4 nombres accesibles en orden', async () => {
    const usuario = userEvent.setup()
    renderizarServicios()

    await pulsarBoton(usuario, 'Especialidades')

    const puntos = within(obtenerTarjeta('Especialidades'))
      .getAllByRole('listitem')
      .map((elemento) => elemento.textContent)

    expect(puntos).toEqual(['Odontología', 'Oftalmología', 'Traumatología', 'Endoscopia'])
  })
})

describe('@s9 el estado de expansión se comunica con aria-expanded', () => {
  it('pulsar el botón de "Análisis" cambia su aria-expanded de "false" a "true"', async () => {
    const usuario = userEvent.setup()
    renderizarServicios()

    const boton = within(obtenerTarjeta('Análisis')).getByRole('button')
    expect(boton).toHaveAttribute('aria-expanded', 'false')

    await usuario.click(boton)

    expect(boton).toHaveAttribute('aria-expanded', 'true')
  })
})

describe('@s10 el rótulo del botón cambia al desplegar', () => {
  it('pulsar el botón de "Especialidades" cambia su rótulo de "Ver qué incluye" a "Ocultar detalle"', async () => {
    const usuario = userEvent.setup()
    renderizarServicios()

    const boton = within(obtenerTarjeta('Especialidades')).getByRole('button')
    expect(boton.textContent).toBe('Ver qué incluye')

    await usuario.click(boton)

    expect(boton.textContent).toBe('Ocultar detalle')
  })
})

describe('@s11 plegar una tarjeta desplegada vuelve a ocultar su desglose', () => {
  it('tras plegar "Diagnóstico de imagen", aria-expanded vuelve a "false", el rótulo vuelve y sus 4 puntos dejan de ser consultables', async () => {
    const usuario = userEvent.setup()
    renderizarServicios()

    await pulsarBoton(usuario, 'Diagnóstico de imagen')
    await pulsarBoton(usuario, 'Diagnóstico de imagen')

    const tarjeta = obtenerTarjeta('Diagnóstico de imagen')
    const boton = within(tarjeta).getByRole('button')

    expect(boton).toHaveAttribute('aria-expanded', 'false')
    expect(boton.textContent).toBe('Ver qué incluye')
    expect(within(tarjeta).queryAllByRole('listitem')).toHaveLength(0)
  })
})

describe('@s12 desplegar una tarjeta no despliega ninguna de las otras cuatro', () => {
  it('tras desplegar "Medicina general", las otras 4 siguen con aria-expanded "false" y sin puntos consultables', async () => {
    const usuario = userEvent.setup()
    renderizarServicios()

    await pulsarBoton(usuario, 'Medicina general')

    expect(within(obtenerTarjeta('Medicina general')).getByRole('button')).toHaveAttribute('aria-expanded', 'true')
    for (const titulo of TITULOS_EN_ORDEN.filter((t) => t !== 'Medicina general')) {
      const tarjeta = obtenerTarjeta(titulo)
      expect(within(tarjeta).getByRole('button')).toHaveAttribute('aria-expanded', 'false')
      expect(within(tarjeta).queryAllByRole('listitem')).toHaveLength(0)
    }
  })
})

describe('@s13 desplegar una segunda tarjeta no pliega la primera', () => {
  it('con "Cirugía y anestesia" ya desplegada, desplegar "Especialidades" deja ambas abiertas con sus propios puntos', async () => {
    const usuario = userEvent.setup()
    renderizarServicios()

    await pulsarBoton(usuario, 'Cirugía y anestesia')
    await pulsarBoton(usuario, 'Especialidades')

    expect(within(obtenerTarjeta('Cirugía y anestesia')).getByRole('button')).toHaveAttribute('aria-expanded', 'true')
    expect(within(obtenerTarjeta('Especialidades')).getByRole('button')).toHaveAttribute('aria-expanded', 'true')
    expect(within(obtenerTarjeta('Cirugía y anestesia')).getAllByRole('listitem')).toHaveLength(7)
    expect(within(obtenerTarjeta('Especialidades')).getAllByRole('listitem')).toHaveLength(4)
  })
})

describe('@s14 cada botón de la sección tiene un nombre accesible distinto', () => {
  it('cada uno de los 5 títulos identifica, por nombre accesible, exactamente un botón (visible siempre "Ver qué incluye")', () => {
    renderizarServicios()

    for (const titulo of TITULOS_EN_ORDEN) {
      const boton = screen.getByRole('button', { name: new RegExp(titulo) })
      expect(boton.textContent).toBe('Ver qué incluye')
    }
  })
})

describe('@s15 caso límite — un bloque con el desglose vacío no ofrece botón de desplegar', () => {
  it('"Especialidades" muestra su título sin botón ni lista, y las otras 4 conservan su botón', () => {
    renderizarServicios({ catalogo: CATALOGO_CON_UN_BLOQUE_VACIO })

    const tarjetaVacia = obtenerTarjeta('Especialidades')
    expect(within(tarjetaVacia).queryByRole('button')).not.toBeInTheDocument()
    expect(within(tarjetaVacia).queryByRole('list')).not.toBeInTheDocument()

    for (const titulo of ['Cirugía y anestesia', 'Diagnóstico de imagen', 'Medicina general', 'Análisis']) {
      expect(within(obtenerTarjeta(titulo)).getByRole('button')).toBeInTheDocument()
    }
  })
})

describe('@s16 caso límite — un punto en blanco no pinta un elemento de lista vacío', () => {
  it('con un sexto punto en blanco en "Análisis", la lista sigue teniendo exactamente los 5 puntos reales, ninguno vacío', async () => {
    const usuario = userEvent.setup()
    const catalogoConPuntoEnBlanco: readonly BloqueServicio[] = [
      { titulo: 'Cirugía y anestesia', puntos: ['Punto A'] },
      { titulo: 'Diagnóstico de imagen', puntos: ['Punto B'] },
      { titulo: 'Medicina general', puntos: ['Punto C'] },
      {
        titulo: 'Análisis',
        puntos: [
          'Laboratorio de análisis clínicos propio',
          'Perfiles generales',
          'Enfermedades infecciosas y parasitarias (leishmania, leucemia felina…)',
          'Cultivos',
          'Biopsia y citología',
          '   ',
        ],
      },
      { titulo: 'Especialidades', puntos: ['Punto D'] },
    ]
    renderizarServicios({ catalogo: catalogoConPuntoEnBlanco })

    await pulsarBoton(usuario, 'Análisis')

    const puntos = within(obtenerTarjeta('Análisis'))
      .getAllByRole('listitem')
      .map((elemento) => elemento.textContent)

    expect(puntos).toEqual([
      'Laboratorio de análisis clínicos propio',
      'Perfiles generales',
      'Enfermedades infecciosas y parasitarias (leishmania, leucemia felina…)',
      'Cultivos',
      'Biopsia y citología',
    ])
    expect(puntos.every((nombre) => (nombre ?? '').trim().length > 0)).toBe(true)
  })
})

describe('@s17 caso límite — un catálogo vacío no renderiza la sección', () => {
  it('no hay sección "Servicios", ni encabezados, ni botones, ni ningún texto de relleno', () => {
    const { container } = renderizarServicios({ catalogo: [] })

    expect(screen.queryByRole('heading', { level: 2, name: 'Servicios' })).not.toBeInTheDocument()
    expect(screen.queryAllByRole('heading')).toHaveLength(0)
    expect(screen.queryAllByRole('button')).toHaveLength(0)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('@s18 la sección no afirma ningún servicio que el cliente no publique', () => {
  it('con las 5 tarjetas desplegadas, no aparece ningún texto prohibido y el conjunto de puntos es exactamente el esperado', async () => {
    const usuario = userEvent.setup()
    const { container } = renderizarServicios()

    // Los 5 clics son independientes (una tarjeta no depende del estado de otra, @s12/@s13),
    // pero se hacen en secuencia explícita: un usuario real no pulsa 5 botones a la vez.
    await pulsarBoton(usuario, 'Cirugía y anestesia')
    await pulsarBoton(usuario, 'Diagnóstico de imagen')
    await pulsarBoton(usuario, 'Medicina general')
    await pulsarBoton(usuario, 'Análisis')
    await pulsarBoton(usuario, 'Especialidades')

    for (const textoProhibido of [
      'Urgencias 24 h',
      '24 h',
      'Peluquería canina',
      'Animales exóticos',
      'Nutrición y etología',
      'Microchip y viajes',
      'Doce especialidades',
      '€',
    ]) {
      expect(container).not.toHaveTextContent(textoProhibido)
    }

    const puntosMostrados = screen.getAllByRole('listitem').map((elemento) => elemento.textContent)
    expect(puntosMostrados).toHaveLength(26)
    expect(puntosMostrados).toEqual(TODOS_LOS_PUNTOS_EN_ORDEN)
  })
})

describe('@s19 hoy la sección no publica ninguna imagen; si en el futuro se añade alguna no se pide a un tercero ni suplanta un servicio', () => {
  it('no hay ninguna imagen, y ningún elemento con "src"/"srcset" apunta a un host externo ni su alt nombra un servicio', () => {
    const { container } = renderizarServicios()

    expect(container.querySelectorAll('img')).toHaveLength(0)

    for (const elemento of container.querySelectorAll('[src], [srcset]')) {
      expect(elemento.getAttribute('src') ?? '').not.toMatch(/^https?:\/\//)
      expect(elemento.getAttribute('srcset') ?? '').not.toMatch(/^https?:\/\//)
    }

    const nombresProhibidos = [...TITULOS_EN_ORDEN, ...TODOS_LOS_PUNTOS_EN_ORDEN]
    for (const imagen of container.querySelectorAll('img')) {
      const alt = imagen.getAttribute('alt') ?? ''
      for (const nombre of nombresProhibidos) {
        expect(alt).not.toContain(nombre)
      }
    }
  })
})
