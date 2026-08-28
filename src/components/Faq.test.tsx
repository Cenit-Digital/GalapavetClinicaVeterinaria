import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Faq } from './Faq'

/** Centraliza el render de `Faq` bajo test. */
function renderizarFaq(props: React.ComponentProps<typeof Faq> = {}): ReturnType<typeof render> {
  return render(<Faq {...props} />)
}

/** Localiza la sección «Preguntas frecuentes» a partir de su encabezado de nivel 2. */
function obtenerSeccionFaq(): HTMLElement {
  const encabezado = screen.getByRole('heading', { level: 2, name: 'Preguntas frecuentes' })
  const seccion = encabezado.closest('section')
  if (seccion === null) {
    throw new Error('No se encontró el elemento <section> que envuelve el encabezado "Preguntas frecuentes"')
  }
  return seccion
}

/**
 * Los 5 nombres accesibles en el orden publicado. Literal escrito a mano (no
 * importado de producción): patrón `doble-de-test-anclado-al-literal-no-al-simbolo`.
 */
const PREGUNTAS_EN_ORDEN: readonly [string, string, string, string, string] = [
  '¿Qué horario tiene la clínica?',
  '¿Cómo pido cita?',
  '¿Qué servicios ofrecéis?',
  '¿Qué hago si mi animal necesita atención fuera del horario?',
  '¿Cada cuánto hay que vacunar a un perro o a un gato?',
]

describe('@s1 las cinco preguntas se muestran colapsadas por defecto', () => {
  it('hay un h2 "Preguntas frecuentes", 5 botones con esos nombres en orden y todos con aria-expanded "false"', () => {
    renderizarFaq()

    const seccion = obtenerSeccionFaq()
    const botones = within(seccion).getAllByRole('button')
    expect(botones.map((boton) => boton.textContent)).toEqual(PREGUNTAS_EN_ORDEN)
    for (const boton of botones) {
      expect(boton).toHaveAttribute('aria-expanded', 'false')
    }

    expect(within(seccion).queryAllByRole('region')).toHaveLength(0)
  })
})

describe('@s2 expandir una pregunta muestra su respuesta con el horario verificado', () => {
  it('pulsar "¿Qué horario tiene la clínica?" abre una región con ese nombre accesible y el horario real', async () => {
    const usuario = userEvent.setup()
    renderizarFaq()

    const boton = screen.getByRole('button', { name: '¿Qué horario tiene la clínica?' })
    expect(boton).toHaveAttribute('aria-expanded', 'false')

    await usuario.click(boton)

    expect(boton).toHaveAttribute('aria-expanded', 'true')
    const region = screen.getByRole('region', { name: '¿Qué horario tiene la clínica?' })
    expect(boton.getAttribute('aria-controls')).toBe(region.id)
    expect(region.textContent).toContain('de lunes a viernes de 11:00 a 14:00 y de 16:30 a 20:00')
    expect(region.textContent).toContain('sábados de 11:00 a 14:00')
    expect(region.textContent).toContain('domingos cerrado')
  })
})

describe('@s3 la respuesta sobre cómo pedir cita ofrece los dos teléfonos verificados', () => {
  it('la región contiene los dos teléfonos, un enlace por cada uno, y no menciona correo ni reserva online', async () => {
    const usuario = userEvent.setup()
    renderizarFaq()

    await usuario.click(screen.getByRole('button', { name: '¿Cómo pido cita?' }))

    const region = screen.getByRole('region', { name: '¿Cómo pido cita?' })
    expect(region.textContent).toContain('91 082 92 67')
    expect(region.textContent).toContain('685 34 31 49')

    const enlaces = within(region).getAllByRole('link')
    expect(enlaces.map((enlace) => enlace.textContent)).toEqual(['91 082 92 67', '685 34 31 49'])
    expect(enlaces[0]).toHaveAttribute('href', 'tel:+34910829267')
    expect(enlaces[1]).toHaveAttribute('href', 'tel:+34685343149')

    expect(region.textContent).not.toMatch(/correo|@|formulario|online/i)
  })
})

describe('@s4 la respuesta sobre servicios enumera los cinco bloques publicados', () => {
  it('la región contiene, cada uno una vez, los cinco títulos de SERVICIOS y no menciona servicios no publicados', async () => {
    const usuario = userEvent.setup()
    renderizarFaq()

    await usuario.click(screen.getByRole('button', { name: '¿Qué servicios ofrecéis?' }))

    const region = screen.getByRole('region', { name: '¿Qué servicios ofrecéis?' })
    const titulos = ['Cirugía y anestesia', 'Diagnóstico de imagen', 'Medicina general', 'Análisis', 'Especialidades']
    for (const titulo of titulos) {
      expect(region.textContent?.split(titulo).length).toBe(2)
    }
    expect(region.textContent).not.toMatch(/peluquería|exóticos|etología/i)
  })
})

describe('@s5 la respuesta sobre atención fuera del horario da el teléfono real de urgencias', () => {
  it('la región contiene el teléfono real como enlace y no promete disponibilidad permanente ni recargo', async () => {
    const usuario = userEvent.setup()
    renderizarFaq()

    await usuario.click(
      screen.getByRole('button', { name: '¿Qué hago si mi animal necesita atención fuera del horario?' }),
    )

    const region = screen.getByRole('region', {
      name: '¿Qué hago si mi animal necesita atención fuera del horario?',
    })
    expect(region.textContent).toContain('91 851 13 93')
    const enlace = within(region).getByRole('link')
    expect(enlace.textContent).toContain('91 851 13 93')

    for (const marcador of ['24 h', '24 horas', '365', 'todos los días del año']) {
      expect(region.textContent).not.toContain(marcador)
    }
    expect(region.textContent?.toLowerCase()).not.toContain('recargo')
  })
})

describe('@s6 la pregunta divulgativa no afirma nada específico sobre la clínica', () => {
  it('el texto no contiene teléfonos, euros, horas ni las palabras comerciales prohibidas, ni el nombre "Galapavet"', async () => {
    const usuario = userEvent.setup()
    renderizarFaq()

    await usuario.click(
      screen.getByRole('button', { name: '¿Cada cuánto hay que vacunar a un perro o a un gato?' }),
    )

    const region = screen.getByRole('region', {
      name: '¿Cada cuánto hay que vacunar a un perro o a un gato?',
    })
    const texto = region.textContent ?? ''

    expect(texto.toLowerCase()).toContain('vacun')
    expect(texto).not.toMatch(/\d{9}/)
    expect(texto).not.toMatch(/\d[\d ]{7,}\d/)
    expect(texto).not.toContain('€')
    expect(texto).not.toMatch(/\d{1,2}:\d{2}/)
    for (const palabra of ['incluido', 'gratis', 'descuento', 'plan']) {
      expect(texto.toLowerCase()).not.toContain(palabra)
    }
    expect(texto).not.toContain('Galapavet')
  })
})

describe('@s7 abrir una pregunta nueva cierra automáticamente la que estuviera abierta', () => {
  it('tras abrir "horario" y pulsar "servicios", solo "servicios" queda expandido y solo hay 1 región', async () => {
    const usuario = userEvent.setup()
    renderizarFaq()

    await usuario.click(screen.getByRole('button', { name: '¿Qué horario tiene la clínica?' }))
    await usuario.click(screen.getByRole('button', { name: '¿Qué servicios ofrecéis?' }))

    const seccion = obtenerSeccionFaq()
    expect(screen.getByRole('button', { name: '¿Qué servicios ofrecéis?' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByRole('button', { name: '¿Qué horario tiene la clínica?' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(within(seccion).getAllByRole('button', { expanded: true })).toHaveLength(1)
    expect(within(seccion).getAllByRole('region')).toHaveLength(1)
  })
})

describe('@s8 cerrar la pregunta que ya estaba abierta deja el acordeón sin ninguna expandida', () => {
  it('pulsar dos veces "¿Cómo pido cita?" la cierra, sin ningún control expandido ni ninguna región', async () => {
    const usuario = userEvent.setup()
    renderizarFaq()

    const boton = screen.getByRole('button', { name: '¿Cómo pido cita?' })
    await usuario.click(boton)
    expect(boton).toHaveAttribute('aria-expanded', 'true')

    await usuario.click(boton)

    expect(boton).toHaveAttribute('aria-expanded', 'false')
    const seccion = obtenerSeccionFaq()
    expect(within(seccion).queryAllByRole('button', { expanded: true })).toHaveLength(0)
    expect(within(seccion).queryAllByRole('region')).toHaveLength(0)
  })
})

describe('@s9 la pregunta se despliega con el teclado', () => {
  it('con el foco en "servicios" y aria-expanded false, pulsar Enter la expande y conserva el foco', async () => {
    const usuario = userEvent.setup()
    renderizarFaq()

    const boton = screen.getByRole('button', { name: '¿Qué servicios ofrecéis?' })
    boton.focus()
    expect(boton).toHaveAttribute('aria-expanded', 'false')
    expect(boton).toHaveFocus()

    await usuario.keyboard('{Enter}')

    expect(boton).toHaveAttribute('aria-expanded', 'true')
    expect(boton).toHaveFocus()
  })
})

/** Abre la pregunta indicada y devuelve el texto de su región (@s10: recorre el catálogo completo). */
async function abrirYLeerRespuesta(usuario: ReturnType<typeof userEvent.setup>, pregunta: string): Promise<string> {
  await usuario.click(screen.getByRole('button', { name: pregunta }))
  return screen.getByRole('region', { name: pregunta }).textContent ?? ''
}

describe('@s10 ninguna respuesta publicada afirma precios, planes ni servicios no publicados', () => {
  it('el texto de las 5 respuestas del catálogo publicado no contiene ninguna cláusula prohibida', async () => {
    const usuario = userEvent.setup()
    renderizarFaq()

    const [preguntaHorario, preguntaCita, preguntaServicios, preguntaUrgencias, preguntaDivulgativa] =
      PREGUNTAS_EN_ORDEN

    const textosDeLasRespuestas = [
      await abrirYLeerRespuesta(usuario, preguntaHorario),
      await abrirYLeerRespuesta(usuario, preguntaCita),
      await abrirYLeerRespuesta(usuario, preguntaServicios),
      await abrirYLeerRespuesta(usuario, preguntaUrgencias),
      await abrirYLeerRespuesta(usuario, preguntaDivulgativa),
    ]

    const textoCompleto = textosDeLasRespuestas.join(' ')

    expect(textoCompleto).not.toContain('€')
    for (const palabra of ['financiación', 'cuotas', 'sin intereses', 'plan anual', 'tarifa']) {
      expect(textoCompleto.toLowerCase()).not.toContain(palabra)
    }
    expect(textoCompleto).not.toContain('24 h')
    expect(textoCompleto).not.toContain('24 horas')
    expect(textoCompleto).not.toContain('urgencias 24')
    for (const palabra of ['peluquería', 'exóticos', 'etología']) {
      expect(textoCompleto.toLowerCase()).not.toContain(palabra)
    }

    const numerosPermitidos = ['91 082 92 67', '685 34 31 49', '91 851 13 93']
    const numerosEncontrados = textoCompleto.match(/\d{2,3}(?: \d{2,3}){2,3}/g) ?? []
    for (const numero of numerosEncontrados) {
      expect(numerosPermitidos).toContain(numero)
    }
    expect(numerosEncontrados.length).toBeGreaterThan(0)
  })
})

describe('@s11 un catálogo de preguntas vacío no renderiza la sección', () => {
  it('con catálogo vacío no hay encabezado, ni controles, ni ningún texto de relleno', () => {
    renderizarFaq({ catalogo: [] })

    expect(screen.queryByRole('heading', { level: 2, name: 'Preguntas frecuentes' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    for (const marcador of ['—', 'Próximamente', 'Consultar', 'Pendiente']) {
      expect(screen.queryByText(marcador)).not.toBeInTheDocument()
    }
  })
})

describe('@s12 una entrada con pregunta o respuesta vacía se omite del acordeón', () => {
  it('de las 4 entradas, solo quedan 2 controles, en el orden de las entradas válidas', () => {
    const catalogoConHuecos = [
      {
        pregunta: '¿Qué horario tiene la clínica?',
        respuesta: 'de lunes a viernes de 11:00 a 14:00 y de 16:30 a 20:00',
      },
      { pregunta: '¿Cómo pido cita?', respuesta: '' },
      {
        pregunta: '',
        respuesta: 'Cirugía y anestesia, Diagnóstico de imagen, Medicina general, Análisis y Especialidades',
      },
      {
        pregunta: '¿Qué hago si mi animal necesita atención fuera del horario?',
        respuesta: '91 851 13 93',
      },
    ]

    renderizarFaq({ catalogo: catalogoConHuecos })

    const seccion = obtenerSeccionFaq()
    const botones = within(seccion).getAllByRole('button')
    expect(botones).toHaveLength(2)
    expect(botones.map((boton) => boton.textContent)).toEqual([
      '¿Qué horario tiene la clínica?',
      '¿Qué hago si mi animal necesita atención fuera del horario?',
    ])
  })
})

describe('@s13 el teléfono de urgencias de la respuesta procede de la fuente única de datos', () => {
  it('con un doble de test inyectado, la región de urgencias refleja el doble y el real ya no aparece', async () => {
    const usuario = userEvent.setup()
    renderizarFaq({ telefonoUrgencias: '900 000 000' })

    await usuario.click(
      screen.getByRole('button', { name: '¿Qué hago si mi animal necesita atención fuera del horario?' }),
    )

    const region = screen.getByRole('region', {
      name: '¿Qué hago si mi animal necesita atención fuera del horario?',
    })
    expect(region.textContent).toContain('900 000 000')
    expect(region.textContent).not.toContain('91 851 13 93')
  })
})

describe('@s33 (rediseno_visual) la sección abre con su cintillo en versalitas, delante del titular', () => {
  it('hay un párrafo con el texto "FAQ" (el rótulo del prototipo, docs/diseno-claude-design/Veterinaria La Sierra.dc.html:427) inmediatamente antes del h2, y no es un encabezado', () => {
    renderizarFaq()

    const seccion = obtenerSeccionFaq()
    const encabezado = within(seccion).getByRole('heading', { level: 2, name: 'Preguntas frecuentes' })
    const cintillo = within(seccion).getByText('FAQ')

    // Es un párrafo, no un encabezado: @s33 exige que el rótulo "no rompa la
    // jerarquía de niveles" (no debe existir un h-algo adicional con ese texto).
    expect(cintillo.tagName).toBe('P')
    expect(within(seccion).queryByRole('heading', { name: 'FAQ' })).not.toBeInTheDocument()

    // "Por delante del titular": el cintillo precede al <h2> en el orden del documento.
    const posicionRelativa = cintillo.compareDocumentPosition(encabezado)
    expect(Boolean(posicionRelativa & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true)
  })
})

/** El texto REAL de la hoja de estilos de `Faq`, leído en crudo por Vite (nunca el símbolo `styles` importado: ese es un proxy en jsdom, `vite.config.ts:61-79`). */
const TEXTO_REAL_DE_FAQ_SCSS = (
  import.meta.glob('./Faq.module.scss', { eager: true, query: '?raw', import: 'default' }) as Record<
    string,
    string
  >
)['./Faq.module.scss'] as string

/**
 * Ancho máximo general del contenedor compartido por las 6 rutas
 * (`src/styles/_api.scss:133`, `$ancho-maximo-contenedor: 1220px;`). Literal
 * escrito a mano, no importado: `_tokens-api.scss` no exporta esta variable
 * SCSS a JS/TS, y el doble de test se compara contra el literal, nunca contra
 * el símbolo de producción.
 */
const ANCHO_MAXIMO_CONTENEDOR_GENERAL_PX = 1220

/**
 * Ancho máximo de la sección de bienvenida (Hero), leído SOLO por lectura de
 * `src/components/Hero.module.scss:39` (`width: min(100% - #{espaciado(48)},
 * 900px)`), sin editar ese fichero: @s18 pide que Faq declare "su propio
 * ancho máximo, distinto del general y distinto entre sí" (Hero lo cierra
 * OTRO artesano en paralelo).
 */
const ANCHO_MAXIMO_HERO_PX = 900

describe('@s18 (rediseno_visual) la sección de preguntas frecuentes declara su propio ancho máximo, distinto del general y del de la sección de bienvenida', () => {
  it('el texto real de Faq.module.scss fija max-width en un valor propio, menor que el general y distinto del de Hero', () => {
    // Solo las declaraciones DIRECTAS de ".faq" (hasta la primera llave
    // anidada): así "max-width: 70ch" de la sub-región de respuesta (más
    // abajo en el fichero) nunca se confunde con el ancho de la sección.
    const bloquePropioDeFaq = TEXTO_REAL_DE_FAQ_SCSS.match(/\.faq\s*\{([^{]*)/)?.[1] ?? ''
    const declaracion = bloquePropioDeFaq.match(/max-width:\s*(\d+)px/)

    expect(declaracion, `bloque propio de ".faq" leído: ${JSON.stringify(bloquePropioDeFaq)}`).not.toBeNull()
    const anchoDeclarado = Number(declaracion?.[1])

    expect(anchoDeclarado).toBe(860)
    expect(anchoDeclarado).toBeLessThan(ANCHO_MAXIMO_CONTENEDOR_GENERAL_PX)
    expect(anchoDeclarado).not.toBe(ANCHO_MAXIMO_HERO_PX)
  })
})
