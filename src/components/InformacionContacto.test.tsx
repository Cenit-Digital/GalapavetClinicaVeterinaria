import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CabeceraDeContacto, InformacionContacto } from './InformacionContacto'

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
    expect(enlaces[0]).toHaveAccessibleName('Llamar ahora')
    expect(enlaces[0]).toHaveAttribute('href', 'tel:+34918511393')
    expect(within(grupo).getByText('91 851 13 93')).toBeVisible()

    expect(grupo.textContent).not.toContain('24')
    expect(grupo.textContent).not.toContain('todos los días')
  })
})

describe('@s6 no existe ningún bloque ni reclamo que anuncie urgencias 24 h', () => {
  it('hay una única acción «Llamar ahora», sin "24 h/24h/24 horas" ni guardia falso, y el teléfono aparece 1 sola vez', () => {
    const { container } = renderizarInformacionContacto()

    expect(screen.getByRole('link', { name: 'Llamar ahora' })).toHaveAttribute('href', 'tel:+34918511393')

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

// ---------------------------------------------------------------------------
// ENMIENDA (03/09/2026, Decisión 63, `fidelidad_contacto` @s4; antes/después
// literal en `progress/fidelidad/enmiendas_fidelidad_contacto.md`): @s8, @s9,
// @s10 y @s14 de `informacion_contacto.feature` estaban escritos para un
// `<iframe>` de un proveedor externo. El mapa pasa a ser una IMAGEN LOCAL
// (`public/img/mapa/galapagar.webp`, `docs/mapa-estatico.md`) con el pin en
// CSS y la atribución visible de OpenStreetMap: cero peticiones a terceros.
// ---------------------------------------------------------------------------
const ALT_DEL_MAPA = 'Mapa con la ubicación de Galapavet en Carretera de Torrelodones, 11, 28260 Galapagar, Madrid'
const RUTA_DEL_MAPA = '/img/mapa/galapagar.webp'

describe('@s8 el mapa es una imagen local con el nombre accesible derivado del nombre y la dirección reales, y encabeza el panel', () => {
  it('hay exactamente 1 imagen de mapa y ningún marco embebido; su alt es el derivado, con dimensiones declaradas, y va antes que los grupos', () => {
    renderizarInformacionContacto()

    const region = screen.getByRole('region', { name: 'Información de contacto' })
    expect(region.querySelectorAll('iframe')).toHaveLength(0)
    const imagenes = region.querySelectorAll('img')
    expect(imagenes).toHaveLength(1)

    const mapa = imagenes[0] as HTMLImageElement
    expect(mapa.getAttribute('alt')).toBe(ALT_DEL_MAPA)
    expect(mapa.getAttribute('src')).toBe(RUTA_DEL_MAPA)
    expect(mapa.getAttribute('width')).toBe('1024')
    expect(mapa.getAttribute('height')).toBe('520')
    expect(mapa.getAttribute('decoding')).toBe('async')
    expect(mapa.getAttribute('alt')).not.toContain('La Sierra')
    expect(mapa.getAttribute('alt')).not.toContain('Miraflores')

    const primerGrupo = screen.getByRole('group', { name: 'Dirección' })
    expect(mapa.compareDocumentPosition(primerGrupo) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('el pin es decorativo y se coloca con los porcentajes derivados de las coordenadas de la fuente única (43,53 % / 50,06 %)', () => {
    renderizarInformacionContacto()

    const region = screen.getByRole('region', { name: 'Información de contacto' })
    const mapa = region.querySelector('img') as HTMLImageElement
    const pin = mapa.parentElement?.querySelector('[aria-hidden="true"]') as HTMLElement | null
    expect(pin).not.toBeNull()
    expect(pin?.textContent).toBe('')
    expect(pin?.style.left).toBe('43.53%')
    expect(pin?.style.top).toBe('50.06%')
  })
})

const AVISO_MAPA_TERCEROS_RETIRADO =
  'El mapa lo sirve un proveedor externo. Es la única conexión con un tercero de esta web.'

describe('@s9 la sección no declara ningún origen ajeno y atribuye el mapa a OpenStreetMap de forma visible', () => {
  it('ningún elemento con "src" de la región apunta fuera del propio sitio; la atribución existe como texto real, con enlace a la licencia, sin aria-hidden ni hidden', () => {
    renderizarInformacionContacto()

    const region = screen.getByRole('region', { name: 'Información de contacto' })
    for (const elemento of region.querySelectorAll('[src]')) {
      expect(elemento.getAttribute('src') ?? '').not.toMatch(/^(https?:)?\/\//)
    }
    expect(region.querySelectorAll('iframe, script')).toHaveLength(0)
    expect(screen.queryByText(AVISO_MAPA_TERCEROS_RETIRADO)).not.toBeInTheDocument()

    const atribucion = within(region).getByText('© OpenStreetMap contributors')
    expect(atribucion.getAttribute('aria-hidden')).not.toBe('true')
    expect(atribucion.closest('[hidden]')).toBeNull()
    const enlaceLicencia = within(region).getByRole('link', { name: '© OpenStreetMap contributors' })
    expect(enlaceLicencia).toHaveAttribute('href', 'https://www.openstreetmap.org/copyright')
  })
})

describe('@s10 la imagen del mapa no se descarga hasta que hace falta', () => {
  it('la imagen del mapa declara carga diferida', () => {
    renderizarInformacionContacto()

    const mapa = screen.getByRole('region', { name: 'Información de contacto' }).querySelector('img') as HTMLImageElement
    expect(mapa.getAttribute('loading')).toBe('lazy')
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

describe('@s14 sin dirección no se muestra el mapa, porque el mapa describe y sitúa la dirección postal', () => {
  it('sin dirección postal, no hay grupo "Dirección", ni imagen de mapa, ni marco embebido, ni atribución, y no queda ninguna petición externa', () => {
    renderizarInformacionContacto({ direccion: null })

    const region = screen.getByRole('region', { name: 'Información de contacto' })

    expect(within(region).queryByRole('group', { name: 'Dirección' })).not.toBeInTheDocument()
    expect(region.querySelectorAll('iframe, img')).toHaveLength(0)
    expect(within(region).queryByText(/OpenStreetMap/)).not.toBeInTheDocument()
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

  // ENMIENDA (03/09/2026, `fidelidad_contacto` @s3, `progress/fidelidad/enmiendas_fidelidad_contacto.md`):
  // @s36 de `rediseno_visual.feature` pide "una tarjeta con el color de
  // urgencia"; estas dos aserciones habían sobre-especificado ese color como
  // fondo SUAVE + franja lateral y el teléfono como "boton-fantasma". El
  // diseño aprobado pinta la banda roja sólida (fondo `--color-urgencia`,
  // tinta `--color-sobre-primario`, sin borde ni sombra de tarjeta) y el
  // teléfono como píldora blanca con la tinta de urgencia.
  it('la tarjeta de urgencias es una banda roja sólida: fondo de urgencia, tinta sobre-primario, sin franja lateral ni patrón tarjeta', () => {
    const cuerpoTarjetaUrgencia = cuerpoDelBloque(TEXTO_INFORMACION_CONTACTO_SCSS, "[data-tarjeta-de='urgencia'] {")

    expect(cuerpoTarjetaUrgencia).toContain('background-color: var(--color-urgencia);')
    expect(cuerpoTarjetaUrgencia).toContain('color: var(--color-sobre-primario);')
    expect(cuerpoTarjetaUrgencia).not.toContain('urgencia-suave')
    expect(cuerpoTarjetaUrgencia).not.toContain('border-inline-start')
    expect(cuerpoTarjetaUrgencia).not.toContain('@include tarjeta')
  })

  // Ronda de reparación 1 (judge, 03/09/2026): la píldora ya no es el número.
  // Anatomía del prototipo (`delta_contacto.md`, contacto-4): rótulo y número
  // apilados a la izquierda, píldora «Llamar ahora» pequeña a la derecha, en una
  // sola fila. El `fieldset` es una rejilla de dos columnas (1fr auto): rótulo y
  // número en la primera (filas 1 y 2), la píldora en la segunda abarcando ambas.
  it('la banda apila rótulo y número a la izquierda (rejilla 1fr auto) y el número es el elemento grande: titulares, paso 2', () => {
    const cuerpoTarjetaUrgencia = cuerpoDelBloque(TEXTO_INFORMACION_CONTACTO_SCSS, "[data-tarjeta-de='urgencia'] {")
    const cuerpoFieldset = cuerpoDelBloque(cuerpoTarjetaUrgencia, 'fieldset {')
    const cuerpoLegend = cuerpoDelBloque(cuerpoTarjetaUrgencia, 'legend {')
    const cuerpoNumero = cuerpoDelBloque(TEXTO_INFORMACION_CONTACTO_SCSS, "[data-tarjeta-de='urgencia'] p {")

    expect(cuerpoFieldset).toContain('display: grid;')
    expect(cuerpoFieldset).toMatch(/grid-template-columns:\s*1fr auto;/)
    expect(cuerpoLegend).toMatch(/grid-column:\s*1;/)
    expect(cuerpoLegend).toMatch(/grid-row:\s*1;/)
    expect(cuerpoNumero).toMatch(/grid-column:\s*1;/)
    expect(cuerpoNumero).toMatch(/grid-row:\s*2;/)
    expect(cuerpoNumero).toContain('font-family: var(--fuente-titulares);')
    expect(cuerpoNumero).toContain('font-size: paso-tipografico(2);')
    expect(TEXTO_INFORMACION_CONTACTO_SCSS).not.toContain('accionesUrgencia')
  })

  it('la píldora «Llamar ahora» es blanca, pequeña y en negrita, con altura de control media, a la derecha abarcando las dos filas', () => {
    const cuerpoEnlaceDeUrgencia = cuerpoDelBloque(
      TEXTO_INFORMACION_CONTACTO_SCSS,
      "[data-tarjeta-de='urgencia'] a {",
    )

    expect(cuerpoEnlaceDeUrgencia).toContain('background-color: var(--color-sobre-primario);')
    expect(cuerpoEnlaceDeUrgencia).toContain('color: var(--color-urgencia);')
    expect(cuerpoEnlaceDeUrgencia).toContain('border-radius: $radio-completo;')
    expect(cuerpoEnlaceDeUrgencia).toContain('min-height: $altura-control-media;')
    expect(cuerpoEnlaceDeUrgencia).toContain('font-size: paso-tipografico(0);')
    expect(cuerpoEnlaceDeUrgencia).toContain('font-weight: 700;')
    expect(cuerpoEnlaceDeUrgencia).not.toContain('--fuente-titulares')
    expect(cuerpoEnlaceDeUrgencia).toMatch(/grid-column:\s*2;/)
    expect(cuerpoEnlaceDeUrgencia).toMatch(/grid-row:\s*1 \/ span 2;/)
    expect(cuerpoEnlaceDeUrgencia).not.toContain('boton-fantasma')
  })

  // El prototipo pliega la banda con `flex-wrap` cuando no caben rótulo y
  // píldora en una fila. Aquí el plegado depende del ancho de la PROPIA banda
  // (consulta de contenedor), no de la ventana: la banda es estrecha tanto a
  // 320 px como en las columnas intermedias del escritorio.
  it('la banda estrecha se pliega por consulta de contenedor: una columna y la píldora en la tercera fila, sin @media de anchura', () => {
    const cuerpoTarjetaUrgencia = cuerpoDelBloque(TEXTO_INFORMACION_CONTACTO_SCSS, "[data-tarjeta-de='urgencia'] {")
    const cuerpoPlegado = cuerpoDelBloque(TEXTO_INFORMACION_CONTACTO_SCSS, '@container (max-width: 28rem) {')

    expect(cuerpoTarjetaUrgencia).toContain('container-type: inline-size;')
    expect(cuerpoDelBloque(cuerpoPlegado, 'fieldset {')).toMatch(/grid-template-columns:\s*1fr;/)
    expect(cuerpoDelBloque(cuerpoPlegado, 'a {')).toMatch(/grid-row:\s*3;/)
    expect(TEXTO_INFORMACION_CONTACTO_SCSS).not.toContain('@media (max-width')
  })

  it('el rótulo de urgencias lleva un punto decorativo pulsante que no cambia su texto, y su animación solo corre sin "reduce"', () => {
    renderizarInformacionContacto()

    const grupo = screen.getByRole('group', { name: 'Urgencias fuera de horario' })
    const rotulo = within(grupo).getByText('Urgencias fuera de horario')
    expect(rotulo.tagName).toBe('LEGEND')
    const punto = rotulo.querySelector('[aria-hidden="true"]')
    expect(punto).not.toBeNull()
    expect(punto?.textContent).toBe('')
    expect(rotulo.textContent).toBe('Urgencias fuera de horario')

    const cuerpoPulso = cuerpoDelBloque(TEXTO_INFORMACION_CONTACTO_SCSS, '.pulso {')
    const cuerpoSinReduce = cuerpoDelBloque(cuerpoPulso, '@media (prefers-reduced-motion: no-preference) {')
    expect(cuerpoSinReduce).toMatch(/animation:\s*pulso\b/)
    expect(cuerpoPulso.replace(cuerpoSinReduce, '')).not.toContain('animation')
  })

  it('la tarjeta de urgencias sube visualmente por encima de la de datos con "order", sin reordenar el DOM ya aprobado', () => {
    const cuerpoTarjetaUrgencia = cuerpoDelBloque(TEXTO_INFORMACION_CONTACTO_SCSS, "[data-tarjeta-de='urgencia'] {")

    expect(cuerpoTarjetaUrgencia).toMatch(/order:\s*-1\s*;/)
  })

  it('el wrapper de contacto de Landing.tsx se convierte en una rejilla de dos columnas sin depender de un id hasheado', () => {
    const cuerpoContacto = cuerpoDelBloque(TEXTO_LANDING_SCSS, '.seccionContacto > [data-contacto-contenido] {')

    expect(cuerpoContacto).toContain('display: grid')
    expect(cuerpoContacto).toMatch(/grid-template-columns:\s*repeat\(auto-fit/)

    // Ronda de reparación 1 (judge, menor 6): el mínimo de columna es "la
    // mitad del ancho menos medio hueco"; hueco y mínimo comparten la variable
    // `--hueco-contacto` en vez de retipear a mano la mitad del máximo del clamp.
    expect(cuerpoContacto).toMatch(/--hueco-contacto:\s*clamp\(/)
    expect(cuerpoContacto).toMatch(/gap:\s*var\(--hueco-contacto\)/)
    expect(cuerpoContacto).toContain('calc((100% - var(--hueco-contacto)) / 2)')
    expect(cuerpoContacto).not.toContain('17px')
  })
})

// ---------------------------------------------------------------------------
// `features/fidelidad_contacto.feature` (34): la cabecera de la sección de
// contacto. Vive en este fichero (y no en un módulo nuevo) para no ampliar el
// inventario de 18 módulos con estilos (`inventarioModulos.ts`).
// ---------------------------------------------------------------------------
describe('@s1 de fidelidad_contacto: la cabecera de la sección', () => {
  it('el cintillo "Contacto" es un párrafo, no un encabezado ni un landmark (ensamblaje_landing @s6)', () => {
    render(<CabeceraDeContacto />)

    const cintillo = screen.getByText('Contacto')
    expect(cintillo.tagName).toBe('P')
    expect(screen.queryByRole('heading', { name: 'Contacto' })).not.toBeInTheDocument()
    expect(document.querySelector('[aria-label="Contacto"]')).toBeNull()
  })

  it('el titular es un h2 derivado de la localidad real, y el párrafo no promete nada ni menciona urgencias', () => {
    const { container } = render(<CabeceraDeContacto />)

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Estamos en Galapagar')

    const texto = container.textContent ?? ''
    expect(texto.toLowerCase()).not.toContain('urgencias')
    for (const promesa of ['24 h', 'mismo día', 'guardia', 'paseo de casa', 'te contestamos']) {
      expect(texto).not.toContain(promesa)
    }
    const parrafos = container.querySelectorAll('p')
    expect(parrafos).toHaveLength(2)
    expect(parrafos[1]?.textContent?.length ?? 0).toBeGreaterThan(0)
  })
})

describe('@s4 de fidelidad_contacto: la tarjeta de datos usa un mapa local a sangre y bloques separados', () => {
  it('el mapa va a sangre dentro de la tarjeta (sin relleno de tarjeta, sin borde ni radio propios) y los bloques forman una rejilla auto-fit con relleno', () => {
    const cuerpoTarjetaDatos = cuerpoDelBloque(TEXTO_INFORMACION_CONTACTO_SCSS, "[data-tarjeta-de='datos'] {")
    expect(cuerpoTarjetaDatos).toContain('@include tarjeta')
    expect(cuerpoTarjetaDatos).toContain('padding: 0;')
    expect(TEXTO_INFORMACION_CONTACTO_SCSS).not.toContain('iframe')

    const cuerpoMapa = cuerpoDelBloque(TEXTO_INFORMACION_CONTACTO_SCSS, '.mapa {')
    expect(cuerpoMapa).toContain('position: relative;')
    const cuerpoImagen = cuerpoDelBloque(cuerpoMapa, 'img {')
    expect(cuerpoImagen).toContain('@include hueco-de-imagen(1024, 520)')
    expect(cuerpoImagen).toContain('border: 0;')
    expect(cuerpoImagen).toContain('border-radius: 0;')

    const cuerpoBloques = cuerpoDelBloque(TEXTO_INFORMACION_CONTACTO_SCSS, '.bloques {')
    expect(cuerpoBloques).toContain('display: grid;')
    expect(cuerpoBloques).toMatch(/grid-template-columns:\s*repeat\(auto-fit/)
    expect(cuerpoBloques).toMatch(/padding:\s*espaciado\(24\)/)
  })

  it('los tres bloques cuelgan del mismo envoltorio de rejilla, y los dos teléfonos van uno por línea (fieldset en columna, sin "space-between" ni bordes en el horario)', () => {
    renderizarInformacionContacto()

    const region = screen.getByRole('region', { name: 'Información de contacto' })
    const direccion = within(region).getByRole('group', { name: 'Dirección' })
    const telefonos = within(region).getByRole('group', { name: 'Teléfonos' })
    const horario = within(region).getByRole('group', { name: 'Horario' })
    expect(direccion.parentElement).toBe(telefonos.parentElement)
    expect(telefonos.parentElement).toBe(horario.parentElement)
    expect(direccion.parentElement).not.toBe(region)

    const cuerpoBloques = cuerpoDelBloque(TEXTO_INFORMACION_CONTACTO_SCSS, '.bloques {')
    const cuerpoFieldset = cuerpoDelBloque(cuerpoBloques, 'fieldset {')
    expect(cuerpoFieldset).toContain('display: flex;')
    expect(cuerpoFieldset).toContain('flex-direction: column;')
    const cuerpoDl = cuerpoDelBloque(cuerpoBloques, 'dl {')
    expect(cuerpoDl).not.toContain('space-between')
    expect(cuerpoDl).not.toContain('border-block-end')
  })
})
