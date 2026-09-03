import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { InformacionContacto } from './InformacionContacto'

/** Centraliza el render de `InformacionContacto` bajo test. */
function renderizarInformacionContacto(
  props: React.ComponentProps<typeof InformacionContacto> = {},
): ReturnType<typeof render> {
  return render(<InformacionContacto {...props} />)
}

describe('@s1 el panel muestra exactamente los cuatro bloques de datos reales, en orden', () => {
  it('la región tiene 4 grupos con estos nombres accesibles, en este orden, y ninguno se llama "Email"', () => {
    renderizarInformacionContacto()

    const region = screen.getByRole('region', { name: 'Información de contacto' })
    const grupos = within(region).getAllByRole('group')

    expect(grupos).toHaveLength(4)
    expect(grupos.map((grupo) => grupo.getAttribute('aria-label'))).toEqual([
      'Dirección',
      'Teléfonos',
      'Horario',
      'Urgencias fuera de horario',
    ])
    expect(within(region).queryByRole('group', { name: 'Email' })).not.toBeInTheDocument()
  })
})

describe('@s2 el bloque de dirección muestra la dirección real de Galapagar', () => {
  it('contiene exactamente las 2 líneas reales y no contiene los datos del prototipo heredado', () => {
    renderizarInformacionContacto()

    const grupo = screen.getByRole('group', { name: 'Dirección' })
    expect(grupo).toHaveTextContent('Carretera de Torrelodones, 11')
    expect(grupo).toHaveTextContent('28260 Galapagar, Madrid')
    expect(grupo.textContent).not.toContain('Miraflores')
    expect(grupo.textContent).not.toContain('Ctra. de la Sierra')
    expect(grupo.textContent).not.toContain('28792')
  })
})

describe('@s3 el bloque de teléfonos ofrece los dos números publicados como enlaces de llamada', () => {
  it('hay exactamente 2 enlaces, con el nombre accesible y el destino exactos, y ninguno es un teléfono inventado', () => {
    renderizarInformacionContacto()

    const grupo = screen.getByRole('group', { name: 'Teléfonos' })
    const enlaces = within(grupo).getAllByRole('link')

    expect(enlaces).toHaveLength(2)
    expect(enlaces[0]).toHaveAccessibleName('91 082 92 67')
    expect(enlaces[0]).toHaveAttribute('href', 'tel:+34910829267')
    expect(enlaces[1]).toHaveAccessibleName('685 34 31 49')
    expect(enlaces[1]).toHaveAttribute('href', 'tel:+34685343149')

    const destinos = enlaces.map((enlace) => enlace.getAttribute('href'))
    expect(destinos).not.toContain('tel:+34918442160')
    expect(destinos).not.toContain('tel:+34640221190')
  })
})

describe('@s4 el bloque de horario muestra los tres tramos publicados y declara los domingos cerrados', () => {
  it('exactamente 3 tramos con sus días/horas exactos, sin mención a urgencias ni a 24 h', () => {
    renderizarInformacionContacto()

    const grupo = screen.getByRole('group', { name: 'Horario' })
    const rotulos = within(grupo).getAllByRole('term')
    expect(rotulos).toHaveLength(3)

    expect(within(grupo).getByText('Lunes a viernes').nextElementSibling).toHaveTextContent(
      '11:00 a 14:00 y 16:30 a 20:00',
    )
    expect(within(grupo).getByText('Sábados').nextElementSibling).toHaveTextContent('11:00 a 14:00')
    expect(within(grupo).getByText('Domingos').nextElementSibling).toHaveTextContent('Cerrado')

    expect(grupo.textContent).not.toContain('urgencias')
    expect(grupo.textContent).not.toContain('24')
  })
})

describe('@s5 el teléfono de urgencias aparece con el rótulo real de fuera de horario', () => {
  it('hay exactamente 1 enlace, con nombre y destino exactos, sin reclamo de 24 h, y el grupo se llama exactamente así', () => {
    renderizarInformacionContacto()

    const grupo = screen.getByRole('group', { name: 'Urgencias fuera de horario' })
    expect(grupo.getAttribute('aria-label')).toBe('Urgencias fuera de horario')

    const enlaces = within(grupo).getAllByRole('link')
    expect(enlaces).toHaveLength(1)
    expect(enlaces[0]).toHaveAccessibleName('91 851 13 93')
    expect(enlaces[0]).toHaveAttribute('href', 'tel:+34918511393')

    expect(grupo.textContent).not.toContain('24')
    expect(grupo.textContent).not.toContain('todos los días')
  })
})

describe('@s6 no existe ningún bloque ni reclamo que anuncie urgencias 24 h', () => {
  it('no hay "Llamar ahora", ni "24 h/24h/24 horas", ni el guardia falso, y el teléfono de urgencias aparece 1 sola vez', () => {
    const { container } = renderizarInformacionContacto()

    expect(screen.queryByText('Llamar ahora')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Llamar ahora' })).not.toBeInTheDocument()

    const texto = container.textContent ?? ''
    expect(texto).not.toContain('24 h')
    expect(texto).not.toContain('24h')
    expect(texto).not.toContain('24 horas')
    expect(texto).not.toContain('todos los días del año')
    expect(texto).not.toContain('siempre hay alguien de guardia')

    const ocurrencias = texto.split('91 851 13 93').length - 1
    expect(ocurrencias).toBe(1)
  })
})

describe('@s7 no existe bloque de email porque el cliente no publica ninguna dirección de correo', () => {
  it('no hay grupo "Email"/"Correo", ni enlace mailto:, ni ninguna dirección de correo en el texto', () => {
    renderizarInformacionContacto()

    const region = screen.getByRole('region', { name: 'Información de contacto' })

    expect(within(region).queryByRole('group', { name: 'Email' })).not.toBeInTheDocument()
    expect(within(region).queryByRole('group', { name: 'Correo' })).not.toBeInTheDocument()

    for (const enlace of within(region).queryAllByRole('link')) {
      expect(enlace.getAttribute('href')).not.toMatch(/^mailto:/)
    }

    const texto = region.textContent ?? ''
    expect(texto).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.-]+/)
    expect(texto).not.toContain('hola@veterinarialasierra.es')
    expect(texto).not.toContain('info@galapavet.com')
  })
})

describe('@s8 el mapa se muestra con el título accesible del nombre real y encabeza el panel', () => {
  it('hay exactamente 1 marco embebido, con el título exacto, y aparece antes que los grupos de datos', () => {
    renderizarInformacionContacto()

    const region = screen.getByRole('region', { name: 'Información de contacto' })
    const marcos = region.querySelectorAll('iframe')
    expect(marcos).toHaveLength(1)

    const marco = marcos[0] as HTMLIFrameElement
    expect(marco.title).toBe('Mapa de Galapavet')
    expect(marco.title).not.toContain('La Sierra')
    expect(marco.title).not.toContain('Miraflores')

    const primerGrupo = screen.getByRole('group', { name: 'Dirección' })
    expect(marco.compareDocumentPosition(primerGrupo) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})

const AVISO_MAPA_TERCEROS =
  'El mapa lo sirve un proveedor externo. Es la única conexión con un tercero de esta web.'

// Decisión 11 (project-spec.md): el origen real de una hoja de estilo o
// tipografía no es medible con `test.css: false` en `vite.config.ts`. Esa
// cláusula de @s9 se verifica con navegador real, fuera de este gate.
describe('@s9 el mapa es la única petición a un tercero de la página y se declara como tal', () => {
  it('ninguna imagen ni script de la región declara un origen ajeno, y el aviso existe como texto real, sin aria-hidden ni hidden', () => {
    renderizarInformacionContacto()

    const region = screen.getByRole('region', { name: 'Información de contacto' })
    for (const elemento of region.querySelectorAll('img, script')) {
      const src = elemento.getAttribute('src') ?? ''
      expect(src).not.toMatch(/^https?:\/\//)
    }

    const marco = region.querySelector('iframe') as HTMLIFrameElement
    const idDescripcion = marco.getAttribute('aria-describedby')
    expect(idDescripcion).toBeTruthy()

    const aviso = document.getElementById(idDescripcion ?? '')
    expect(aviso).not.toBeNull()
    expect(aviso).toBe(screen.getByText(AVISO_MAPA_TERCEROS))
    expect(region.contains(aviso)).toBe(true)
    expect(aviso?.getAttribute('aria-hidden')).not.toBe('true')
    expect(aviso?.hasAttribute('hidden')).toBe(false)
  })
})

// Decisión 11 (project-spec.md): que no se haya solicitado nada al proveedor
// mientras el marco sigue fuera de la ventana visible no es medible en jsdom
// (no dispara peticiones de red reales; `IntersectionObserver` es un
// observador inerte en `src/test/setup.ts`). Esa cláusula de @s10 se
// verifica con navegador real, fuera de este gate. Aquí solo se cubre lo
// medible: el atributo de carga diferida declarado en el marco.
describe('@s10 el mapa no se solicita al tercero hasta que hace falta', () => {
  it('el marco del mapa declara carga diferida', () => {
    renderizarInformacionContacto()

    const marco = screen
      .getByRole('region', { name: 'Información de contacto' })
      .querySelector('iframe') as HTMLIFrameElement
    expect(marco.getAttribute('loading')).toBe('lazy')
  })
})

describe('@s11 el panel no reescribe a mano ningún teléfono, lo deriva de la fuente única', () => {
  it('con un doble de test inyectado, el primer enlace de "Teléfonos" refleja el doble, y el real ya no aparece', () => {
    renderizarInformacionContacto({ telefonoClinica: '600 000 000' })

    const region = screen.getByRole('region', { name: 'Información de contacto' })
    const grupo = within(region).getByRole('group', { name: 'Teléfonos' })
    const enlaces = within(grupo).getAllByRole('link')

    expect(enlaces[0]).toHaveAccessibleName('600 000 000')
    expect(enlaces[0]).toHaveAttribute('href', 'tel:+34600000000')

    const texto = region.textContent ?? ''
    expect(texto).not.toContain('91 082 92 67')
    for (const enlace of within(region).getAllByRole('link')) {
      expect(enlace.getAttribute('href')).not.toBe('tel:+34910829267')
    }
  })
})

describe('@s12 un dato de contacto ausente hace desaparecer su bloque, sin rellenarlo con nada', () => {
  it('sin teléfono de urgencias en la fuente, el bloque desaparece y quedan los otros 3 en orden, sin placeholder', () => {
    renderizarInformacionContacto({ telefonoUrgencias: null })

    const region = screen.getByRole('region', { name: 'Información de contacto' })

    expect(within(region).queryByRole('group', { name: 'Urgencias fuera de horario' })).not.toBeInTheDocument()

    const grupos = within(region).getAllByRole('group')
    expect(grupos.map((grupo) => grupo.getAttribute('aria-label'))).toEqual(['Dirección', 'Teléfonos', 'Horario'])

    const texto = region.textContent ?? ''
    for (const marcador of ['—', 'Próximamente', 'Consultar', 'Pendiente']) {
      expect(texto).not.toContain(marcador)
    }

    const destinosTelefono = within(region)
      .getAllByRole('link')
      .map((enlace) => enlace.getAttribute('href') ?? '')
      .filter((destino) => destino.startsWith('tel:'))
    for (const destino of destinosTelefono) {
      expect(destino).toMatch(/^tel:\+34\d{9}$/)
    }
  })
})

describe('@s13 un horario sin ningún tramo hace desaparecer el bloque de horario', () => {
  it('sin tramos, el grupo "Horario" no existe, los demás conservan nombre y orden, y no queda ninguna lista vacía', () => {
    renderizarInformacionContacto({ horario: [] })

    const region = screen.getByRole('region', { name: 'Información de contacto' })

    expect(within(region).queryByRole('group', { name: 'Horario' })).not.toBeInTheDocument()

    const grupos = within(region).getAllByRole('group')
    expect(grupos.map((grupo) => grupo.getAttribute('aria-label'))).toEqual([
      'Dirección',
      'Teléfonos',
      'Urgencias fuera de horario',
    ])

    expect(region.querySelectorAll('dl')).toHaveLength(0)
  })
})

describe('@s14 sin dirección no se muestra el mapa, porque el mapa se centra por la dirección postal', () => {
  it('sin dirección postal, no hay grupo "Dirección" ni ningún marco embebido, y no queda ninguna petición externa', () => {
    renderizarInformacionContacto({ direccion: null })

    const region = screen.getByRole('region', { name: 'Información de contacto' })

    expect(within(region).queryByRole('group', { name: 'Dirección' })).not.toBeInTheDocument()
    expect(region.querySelectorAll('iframe')).toHaveLength(0)
    for (const elemento of region.querySelectorAll('[src]')) {
      expect(elemento.getAttribute('src') ?? '').not.toMatch(/^https?:\/\//)
    }
  })
})

describe('@s15 el panel no muestra ninguna cifra ni credencial que el cliente no publique', () => {
  it('el texto no contiene valoración, número de registro, antigüedad, aforo ni ningún precio', () => {
    const { container } = renderizarInformacionContacto()
    const texto = container.textContent ?? ''

    expect(texto).not.toContain('★')
    expect(texto).not.toMatch(/\d[.,]\d\s*(estrellas|reseñas)?/i)
    expect(texto).not.toContain('reseñas')
    expect(texto).not.toContain('registro')
    expect(texto).not.toContain('28/0791')
    expect(texto).not.toContain('desde 2013')
    expect(texto).not.toContain('+12 años')
    expect(texto).not.toContain('mascotas en ficha')
    expect(texto).not.toMatch(/\d+([.,]\d+)?\s*€|€\s*\d+/)
  })
})

describe('@s16 un teléfono que no valida hace fallar al panel en vez de pintar un enlace a medias', () => {
  it('renderizar con "91 082 92" (siete dígitos) lanza con el valor recibido, y no llega a existir ningún enlace "tel:+34"', () => {
    expect(() => renderizarInformacionContacto({ telefonoClinica: '91 082 92' })).toThrow('91 082 92')
    expect(document.querySelector('a[href^="tel:+34"]')).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// @s36 de `features/rediseno_visual.feature` (bloque D, "ANATOMÍA DE LOS
// MÓDULOS DE LA PORTADA"): "la sección de contacto lleva el formulario, la
// tarjeta de urgencias y el mapa con los cuatro bloques de datos". El bloque
// D no lleva anotación de "Herramienta" (a diferencia del bloque C, que sí
// dice "navegador real"): `vite.config.ts:76-79` deja escrito que las puertas
// de los bloques A/D/E/H leen el TEXTO REAL de los `.module.scss` con
// `?raw` — el mismo patrón que ya usa el resto de `src/lib/diseno/*.test.ts`.
// Así se verifica aquí lo que no es DOM (la maquetación de las dos tarjetas),
// sin Playwright (fuera del ámbito de este lote, ver el informe).
// ---------------------------------------------------------------------------
const TEXTO_LANDING_SCSS = Object.values(
  import.meta.glob('../pages/Landing.module.scss', {
    eager: true,
    query: '?raw',
    import: 'default',
  }) as Record<string, string>,
)[0] as string

const TEXTO_INFORMACION_CONTACTO_SCSS = Object.values(
  import.meta.glob('./InformacionContacto.module.scss', {
    eager: true,
    query: '?raw',
    import: 'default',
  }) as Record<string, string>,
)[0] as string

/**
 * El cuerpo (sin las llaves que lo delimitan) del bloque cuya cabecera
 * literal es `encabezadoDelBloque` (p. ej. `"[data-tarjeta-de='datos'] {"`),
 * casando llaves anidadas. Falla con un mensaje que nombra la cabecera
 * buscada si no la encuentra, en vez de devolver un fragmento a medias.
 */
function cuerpoDelBloque(texto: string, encabezadoDelBloque: string): string {
  const indiceDeCabecera = texto.indexOf(encabezadoDelBloque)
  if (indiceDeCabecera === -1) {
    throw new Error(`no se encontró la cabecera "${encabezadoDelBloque}" en el texto`)
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

describe('@s36 la sección de contacto reparte su contenido en la tarjeta de datos (con el mapa) y la tarjeta de urgencias', () => {
  it('los tres bloques que el cliente sí publica muestran su rótulo real y visible, en un <legend> (no solo en el aria-label)', () => {
    renderizarInformacionContacto()

    const region = screen.getByRole('region', { name: 'Información de contacto' })
    const casos = [
      [within(region).getByRole('group', { name: 'Dirección' }), 'Dirección'],
      [within(region).getByRole('group', { name: 'Teléfonos' }), 'Teléfonos'],
      [within(region).getByRole('group', { name: 'Horario' }), 'Horario'],
    ] as const

    for (const [grupo, textoRotuloEscritoAMano] of casos) {
      const rotulo = within(grupo).getByText(textoRotuloEscritoAMano)
      expect(rotulo.tagName).toBe('LEGEND')
      expect(rotulo.getAttribute('aria-hidden')).not.toBe('true')
    }
  })

  it('la tarjeta de urgencias muestra el rótulo real derivado de la fuente única, no un literal retipeado', () => {
    renderizarInformacionContacto()

    const grupo = screen.getByRole('group', { name: 'Urgencias fuera de horario' })
    // Literal escrito a mano —el mismo que ya usa @s5 de
    // `informacion_contacto.feature` para el "aria-label"—, nunca contra el
    // símbolo importado de producción: doble anclaje.
    const rotulo = within(grupo).getByText('Urgencias fuera de horario')
    expect(rotulo.tagName).toBe('LEGEND')
  })

  it('el orden de lectura del DOM sigue siendo el que ya fijó "informacion_contacto.feature" @s1: los tres bloques de datos antes que urgencias', () => {
    renderizarInformacionContacto()

    const region = screen.getByRole('region', { name: 'Información de contacto' })
    const grupos = within(region).getAllByRole('group')
    expect(grupos.map((grupo) => grupo.getAttribute('aria-label'))).toEqual([
      'Dirección',
      'Teléfonos',
      'Horario',
      'Urgencias fuera de horario',
    ])
  })

  it('sigue sin aparecer ningún bloque de correo (ya cubierto por @s7 de "informacion_contacto.feature"; se repite por trazabilidad de @s36)', () => {
    renderizarInformacionContacto()

    const region = screen.getByRole('region', { name: 'Información de contacto' })
    expect(within(region).queryByRole('group', { name: 'Email' })).not.toBeInTheDocument()
    expect(within(region).queryByRole('group', { name: 'Correo' })).not.toBeInTheDocument()
    expect(region.textContent ?? '').not.toMatch(/[\w.+-]+@[\w-]+\.[\w.-]+/)
  })

  it('cada rótulo de los tres bloques de datos usa el mixin "eyebrow" (versalitas + color de acento tinta)', () => {
    const cuerpoTarjetaDatos = cuerpoDelBloque(TEXTO_INFORMACION_CONTACTO_SCSS, "[data-tarjeta-de='datos'] {")
    const cuerpoLegendDeDatos = cuerpoDelBloque(cuerpoTarjetaDatos, 'legend {')

    expect(cuerpoLegendDeDatos).toContain('@include eyebrow')
  })

  it('la tarjeta de urgencias lleva el color de urgencia como fondo suave y como acento de borde', () => {
    const cuerpoTarjetaUrgencia = cuerpoDelBloque(TEXTO_INFORMACION_CONTACTO_SCSS, "[data-tarjeta-de='urgencia'] {")

    expect(cuerpoTarjetaUrgencia).toContain('background-color: var(--color-urgencia-suave)')
    expect(cuerpoTarjetaUrgencia).toMatch(/border-inline-start:.*var\(--color-urgencia\)/)
  })

  it('el teléfono de la tarjeta de urgencias se maqueta como un botón real ("boton-fantasma"), no como un enlace pelado', () => {
    const cuerpoEnlaceDeUrgencia = cuerpoDelBloque(
      TEXTO_INFORMACION_CONTACTO_SCSS,
      "[data-tarjeta-de='urgencia'] a {",
    )

    expect(cuerpoEnlaceDeUrgencia).toContain('@include boton-fantasma')
  })

  it('la tarjeta de urgencias sube visualmente por encima de la de datos con "order", sin reordenar el DOM ya aprobado', () => {
    const cuerpoTarjetaUrgencia = cuerpoDelBloque(TEXTO_INFORMACION_CONTACTO_SCSS, "[data-tarjeta-de='urgencia'] {")

    expect(cuerpoTarjetaUrgencia).toMatch(/order:\s*-1\s*;/)
  })

  it('el wrapper de contacto de Landing.tsx se convierte en una rejilla de dos columnas sin depender de un id hasheado', () => {
    const cuerpoContacto = cuerpoDelBloque(TEXTO_LANDING_SCSS, '.seccionContacto > [data-contacto-contenido] {')

    expect(cuerpoContacto).toContain('display: grid')
    expect(cuerpoContacto).toMatch(/grid-template-columns:\s*repeat\(auto-fit/)
  })
})
