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

/** Localiza la sección por el encabezado editorial real de nivel 2. */
function obtenerSeccionServicios(): HTMLElement {
  const encabezado = screen.getByRole('heading', { level: 2, name: /Servicios veterinarios/ })
  const seccion = encabezado.closest('section')
  if (seccion === null) {
    throw new Error('No se encontró el elemento <section> que envuelve el encabezado de servicios')
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
  it('hay un h2 editorial de servicios y, dentro de su sección, exactamente 5 h3 con estos nombres en este orden', () => {
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

describe('@s3 la tarjeta colapsada presenta el bloque sin inventar prestaciones', () => {
  it('identifica la categoría visual (derivada del propio título, @s31) y conserva el título y el rótulo de su botón', () => {
    renderizarServicios()

    const tarjeta = obtenerTarjeta('Medicina general')

    // Literal escrito a mano: primera palabra significativa de "Medicina
    // general", el título real del bloque -- nunca un literal fijo ajeno al
    // título como el defecto original ("Atención veterinaria" en las 5 tarjetas).
    expect(tarjeta).toHaveTextContent('Medicina')
    expect(tarjeta).toHaveTextContent('Medicina general')
    expect(tarjeta).toHaveTextContent('Ver qué incluye')
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

    expect(screen.queryByRole('heading', { level: 2, name: /Servicios veterinarios/ })).not.toBeInTheDocument()
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

describe('@s31 sobre la imagen hay una píldora de categoría derivada del propio título del bloque', () => {
  it('la píldora de cada una de las 5 tarjetas es la primera palabra de SU título, nunca un literal fijo compartido', () => {
    renderizarServicios()

    // Literales escritos a mano (doble anclaje): la primera palabra
    // significativa de cada uno de los 5 títulos reales publicados.
    const categoriaEsperadaPorTitulo: Record<string, string> = {
      'Cirugía y anestesia': 'Cirugía',
      'Diagnóstico de imagen': 'Diagnóstico',
      'Medicina general': 'Medicina',
      Análisis: 'Análisis',
      Especialidades: 'Especialidades',
    }

    for (const titulo of TITULOS_EN_ORDEN) {
      const tarjeta = obtenerTarjeta(titulo)
      const pildora = tarjeta.querySelector('span')
      if (pildora === null) {
        throw new Error(`No se encontró el elemento <span> de píldora de categoría de la tarjeta "${titulo}"`)
      }
      expect(pildora.textContent).toBe(categoriaEsperadaPorTitulo[titulo])
    }

    // Si la píldora fuera un literal fijo compartido (el defecto original,
    // "Atención veterinaria" en las 5 tarjetas), este contraste también lo
    // detectaría aunque el mapa de arriba se equivocara.
    const pildoraCirugia = obtenerTarjeta('Cirugía y anestesia').querySelector('span')?.textContent
    const pildoraAnalisis = obtenerTarjeta('Análisis').querySelector('span')?.textContent
    expect(pildoraCirugia).not.toBe(pildoraAnalisis)
  })
})

describe('@s19 la sección usa únicamente imágenes locales decorativas, sin alterar el contenido clínico', () => {
  it('cada bloque tiene una imagen local decorativa, sin host externo ni un alt que suplante un servicio', () => {
    const { container } = renderizarServicios()

    const imagenes = container.querySelectorAll('img')
    expect(imagenes).toHaveLength(5)

    for (const elemento of container.querySelectorAll('[src], [srcset]')) {
      expect(elemento.getAttribute('src') ?? '').not.toMatch(/^https?:\/\//)
      expect(elemento.getAttribute('srcset') ?? '').not.toMatch(/^https?:\/\//)
    }

    const nombresProhibidos = [...TITULOS_EN_ORDEN, ...TODOS_LOS_PUNTOS_EN_ORDEN]
    for (const imagen of imagenes) {
      expect(imagen.getAttribute('src')).toMatch(/^\/img\/servicios\//)
      const alt = imagen.getAttribute('alt') ?? ''
      expect(alt).toBe('')
      for (const nombre of nombresProhibidos) {
        expect(alt).not.toContain(nombre)
      }
    }
  })
})

/**
 * `features/rediseno_visual.feature` @s33 (bloque D), añadido tras el
 * segundo rechazo del `judge` (`progress/judge_rediseno_visual.md`,
 * hallazgo 1 de la segunda revisión): "Servicios sigue sin cintillo, sin
 * ningún test que lo exija". Mismo patrón que `Equipo.test.tsx`/
 * `CampanasPortada.test.tsx`, adaptado porque aquí el rótulo del cintillo
 * ("Servicios") coincide con el texto del propio `<h2>` — así que, a
 * diferencia de esos dos ficheros, no se puede localizar el cintillo con
 * `getByText` (ambiguo: matchearía los dos). Se localiza por estructura:
 * primer hijo de la sección, con etiqueta `<p>`.
 */

/** El texto REAL de la hoja de estilos de `Servicios`, leído en crudo por Vite (nunca el símbolo `styles` importado: ese es un proxy en jsdom, `vite.config.ts:61-79`). */
const TEXTO_REAL_DE_SERVICIOS_SCSS = (
  import.meta.glob('./Servicios.module.scss', { eager: true, query: '?raw', import: 'default' }) as Record<
    string,
    string
  >
)['./Servicios.module.scss'] as string

describe('@s33 la sección de servicios abre con su cintillo en versalitas', () => {
  it('hay un único cintillo "Lo que hacemos" dentro de la cabecera de sección, antes del h2 editorial', () => {
    renderizarServicios()

    const seccion = obtenerSeccionServicios()
    const encabezados = screen.getAllByRole('heading', { level: 2, name: /Servicios veterinarios/ })
    expect(encabezados).toHaveLength(1)
    const encabezado = encabezados[0]!

    const cabecera = seccion.querySelector('[data-servicios-cabecera]')
    if (cabecera === null) {
      throw new Error('la sección de servicios no contiene cabecera editorial')
    }

    const cintillo = cabecera.firstElementChild
    if (cintillo === null) {
      throw new Error('la cabecera de servicios no tiene ningún primer hijo')
    }

    // El cintillo es un <p>, nunca un encabezado.
    expect(cintillo.tagName).toBe('P')
    expect(cintillo.textContent).toBe('Lo que hacemos')
    expect(cintillo).not.toBe(encabezado)

    // El cintillo "abre" la sección: precede al h2 en el DOM.
    const posicionRelativa = cintillo.compareDocumentPosition(encabezado)
    // eslint-disable-next-line no-bitwise -- API estándar de DOM (`Node.compareDocumentPosition`).
    expect(posicionRelativa & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('".eyebrow" usa el mixin compartido, sin reescribir su color, versalitas ni espaciado entre letras', () => {
    expect(TEXTO_REAL_DE_SERVICIOS_SCSS.length).toBeGreaterThan(0)

    const bloqueEyebrow = /\.eyebrow\s*\{([^}]*)\}/.exec(TEXTO_REAL_DE_SERVICIOS_SCSS)?.[1] ?? ''
    // El fondo de "Servicios" es un rol de color del sistema
    // (`src/pages/Landing.tsx:54-56`, `.seccionAlterna` -> `--color-fondo-alterno`),
    // no una fotografía a sangre como el Hero: @s33 exige aquí el
    // "--color-acento-tinta" POR DEFECTO del mixin "eyebrow"
    // (`src/styles/_api.scss:324-332`), sin la excepción medida de la
    // Enmienda 2 que solo aplica al Hero (`Hero.module.scss:43-58`).
    expect(bloqueEyebrow).toContain('@include eyebrow;')
    expect(bloqueEyebrow).not.toContain('color:')
    expect(bloqueEyebrow).not.toContain('text-transform:')
    expect(bloqueEyebrow).not.toContain('letter-spacing:')
  })
})

/**
 * Reparación del 03/09/2026 (oleada B, `progress/tdd_regresiones_27_28_29.md`):
 * el titular pintaba «Servicios veterinarios de principio a fin en Galapagar».
 * «de principio a fin» es copy del prototipo (`Veterinaria La Sierra.dc.html`,
 * sección servicios): una promesa de cobertura integral que Galapavet no
 * publica. La Decisión 65 fija «Servicios veterinarios» + «en <localidad>»,
 * con la localidad derivada de `datosNegocio.direccion.localidad`. Ni
 * `@s1` (regex `/Servicios veterinarios/`) ni el E2E lo atrapaban: este test
 * fija el texto EXACTO del h2 y prohíbe la frase.
 */
describe('@s1 de fidelidad_servicios (Decisión 65): la segunda parte del titular es la localidad real, sin copy del prototipo', () => {
  it('el h2 dice exactamente "Servicios veterinarios en Galapagar", su <em> solo "en Galapagar", y nunca "de principio a fin"', () => {
    renderizarServicios()

    // Literal escrito a mano (doble anclaje): la localidad real publicada,
    // nunca leída de `datosNegocio` desde el test.
    const encabezado = screen.getByRole('heading', { level: 2, name: 'Servicios veterinarios en Galapagar' })
    const enfasis = encabezado.querySelector('em')
    if (enfasis === null) {
      throw new Error('el titular de servicios no tiene la segunda parte en <em>')
    }

    expect(enfasis.textContent).toBe('en Galapagar')
    expect(encabezado).not.toHaveTextContent('de principio a fin')
  })
})

/**
 * Reparación del 03/09/2026 (oleada B): `geometria-escalas.spec.ts` @s22 de
 * `rediseno_visual` mide que `#servicios article h3` computa 1,08 de
 * interlineado (el que `global.scss` da a `h1..h6`), y la tarjeta lo pisaba
 * con `line-height: 1.15` (copiado del prototipo, `delta_servicios.md`
 * servicios-14: «manda la escala del repo»). El h3 no redeclara interlineado.
 */
describe('@s22 de rediseno_visual: el h3 de la tarjeta hereda el interlineado de titular de la hoja global', () => {
  it('".cuerpo h3" no declara "line-height" (lo da "global.scss" a h1..h6: 1.08)', () => {
    const bloqueH3 = /\.cuerpo h3\s*\{([^}]*)\}/.exec(TEXTO_REAL_DE_SERVICIOS_SCSS)?.[1]
    if (bloqueH3 === undefined) {
      throw new Error('no se encontró el bloque ".cuerpo h3 {" en el texto real de Servicios.module.scss')
    }

    expect(bloqueH3).not.toMatch(/line-height\s*:/)
  })
})

/**
 * El cuerpo (sin las llaves que lo delimitan) del bloque cuya cabecera literal
 * es `encabezadoDelBloque`, casando llaves anidadas — mismo ayudante que
 * `Cabecera.test.tsx` e `InformacionContacto.test.tsx`. La regex de arriba
 * (`[^}]*`) no sirve aquí porque `.imagen {` anida un bloque `img {`.
 */
function cuerpoDelBloque(texto: string, encabezadoDelBloque: string): string {
  const indiceDeCabecera = texto.indexOf(encabezadoDelBloque)
  if (indiceDeCabecera === -1) {
    throw new Error(`no se encontró la cabecera "${encabezadoDelBloque}" en el texto real de Servicios.module.scss`)
  }
  const indiceDeAperturaLlave = indiceDeCabecera + encabezadoDelBloque.length - 1
  let profundidad = 1
  let indice = indiceDeAperturaLlave + 1
  while (profundidad > 0) {
    if (texto[indice] === '{') profundidad++
    if (texto[indice] === '}') profundidad--
    indice++
  }
  return texto.slice(indiceDeAperturaLlave + 1, indice - 1)
}

/**
 * Reparación del 03/09/2026 (oleada B): `imagenes.spec.ts` @s31 de
 * `identidad_visual` bloquea `/img/**` y exige que cada `<img>` pinte su
 * hueco con `--color-fondo-alterno` EN EL PROPIO `<img>`. Las cinco de
 * servicios lo pintaban en el `<div>` envolvente y el `<img>` quedaba
 * transparente. El mixin `hueco-de-imagen` (`_api.scss`) es la única forma
 * del sistema de reservar un hueco (Galería, Campañas, Pie, Contacto).
 */
describe('@s31 de identidad_visual: cada imagen de servicio reserva su hueco 8/5 con el mixin compartido', () => {
  it('el bloque "img" dentro de ".imagen" incluye "hueco-de-imagen(8, 5)"', () => {
    const cuerpoImagen = cuerpoDelBloque(TEXTO_REAL_DE_SERVICIOS_SCSS, '.imagen {')
    const cuerpoImg = cuerpoDelBloque(cuerpoImagen, 'img {')

    expect(cuerpoImg).toContain('@include hueco-de-imagen(8, 5);')
  })
})
