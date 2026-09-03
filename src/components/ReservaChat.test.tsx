import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ReservaChat } from './ReservaChat'

/** Centraliza el render de `ReservaChat` bajo test. */
function renderizarReservaChat(): ReturnType<typeof render> {
  const elemento: React.JSX.Element = <ReservaChat />
  return render(elemento)
}

describe('@s1 el chat arranca en el primer paso con sus respuestas rápidas', () => {
  it('hay un grupo "Asistente de reserva de Galapavet" con un log de 1 mensaje y 6 respuestas rápidas, sin textbox', () => {
    renderizarReservaChat()

    const widget = screen.getByRole('group', { name: 'Asistente de reserva de Galapavet' })

    const historial = screen.getByRole('log')
    expect(widget).toContainElement(historial)
    expect(historial).toHaveAttribute('aria-live', 'polite')
    expect(historial.children).toHaveLength(1)
    expect(historial.children[0]).toHaveTextContent('Asistente: Hola, soy el asistente de Galapavet. ¿Qué necesita tu mascota?')

    const respuestasRapidas = screen.getByRole('group', { name: 'Respuestas rápidas' })
    const botones = screen.getAllByRole('button')
    expect(botones).toHaveLength(6)
    expect(botones.map((boton) => boton.textContent)).toEqual([
      'Cirugía y anestesia',
      'Diagnóstico de imagen',
      'Medicina general',
      'Análisis',
      'Especialidades',
      'Es una urgencia',
    ])
    expect(widget).toContainElement(respuestasRapidas)

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })
})

describe('@s2 elegir una respuesta rápida registra la respuesta y avanza al paso siguiente', () => {
  it('tras pulsar "Medicina general" el historial pasa a 3 mensajes, aparece el textbox y desaparece el grupo de respuestas rápidas', async () => {
    const usuario = userEvent.setup()
    renderizarReservaChat()

    await usuario.click(screen.getByRole('button', { name: 'Medicina general' }))

    const historial = screen.getByRole('log')
    expect(historial.children).toHaveLength(3)
    expect(historial.children[1]).toHaveTextContent('Tú: Medicina general')
    expect(historial.children[2]).toHaveTextContent('Asistente: Entendido. ¿Con qué animal vienes?')

    expect(screen.getByRole('textbox', { name: 'Tu respuesta' })).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Respuestas rápidas' })).not.toBeInTheDocument()
  })
})

describe('@s3 el chat no ofrece ningún servicio que el cliente no publica', () => {
  it('el texto recorrido contiene los 5 servicios reales, en las 5 primeras respuestas rápidas, y no contiene ningún servicio inventado', () => {
    const { container } = renderizarReservaChat()

    expect(container).not.toBeEmptyDOMElement()
    expect(container).toHaveTextContent('Cirugía y anestesia')

    const respuestasRapidas = screen.getAllByRole('button')
    expect(respuestasRapidas.slice(0, 5).map((boton) => boton.textContent)).toEqual([
      'Cirugía y anestesia',
      'Diagnóstico de imagen',
      'Medicina general',
      'Análisis',
      'Especialidades',
    ])

    for (const textoProhibido of ['Peluquería', 'Animales exóticos', 'Nutrición', '24 h', '24h']) {
      expect(container).not.toHaveTextContent(textoProhibido)
    }
  })
})

/** Responde el paso "servicio" y el paso "animal", dejando el chat en el paso "cuándo". */
async function responderServicioYAnimal(
  usuario: ReturnType<typeof userEvent.setup>,
  servicio: string,
  animal: string,
): Promise<void> {
  await usuario.click(screen.getByRole('button', { name: servicio }))
  await usuario.type(screen.getByRole('textbox', { name: 'Tu respuesta' }), animal)
  await usuario.click(screen.getByRole('button', { name: 'Enviar respuesta' }))
}

describe('@s4 el paso del cuándo solo ofrece momentos en los que la clínica abre', () => {
  it('hay 4 respuestas rápidas de horario real, ninguna domingo ni sábado por la tarde', async () => {
    const usuario = userEvent.setup()
    renderizarReservaChat()

    await responderServicioYAnimal(usuario, 'Medicina general', 'Una gata de 4 años')

    const historial = screen.getByRole('log')
    expect(historial.children[historial.children.length - 1]).toHaveTextContent('Asistente: Perfecto. ¿Cuándo te viene mejor?')

    const botones = within(screen.getByRole('group', { name: 'Respuestas rápidas' })).getAllByRole('button')
    expect(botones.map((boton) => boton.textContent)).toEqual([
      'Entre semana por la mañana',
      'Entre semana por la tarde',
      'El sábado por la mañana',
      'Lo antes posible',
    ])
    for (const boton of botones) {
      expect(boton.textContent ?? '').not.toMatch(/domingo/i)
    }
    expect(botones.some((boton) => /sábado por la tarde/i.test(boton.textContent ?? ''))).toBe(false)
  })
})

/** Responde los tres primeros pasos, dejando el chat en el paso "nombre". */
async function responderTresPrimerosPasos(
  usuario: ReturnType<typeof userEvent.setup>,
  servicio: string,
  animal: string,
  cuando: string,
): Promise<void> {
  await responderServicioYAnimal(usuario, servicio, animal)
  await usuario.click(screen.getByRole('button', { name: cuando }))
}

describe('@s5 el último paso no ofrece botones, sino un campo de texto libre', () => {
  it('se ve la pregunta del nombre, el textbox con su marcador y el botón "Enviar respuesta", sin grupo de respuestas rápidas', async () => {
    const usuario = userEvent.setup()
    renderizarReservaChat()

    await responderTresPrimerosPasos(usuario, 'Medicina general', 'Una gata de 4 años', 'Entre semana por la mañana')

    const historial = screen.getByRole('log')
    expect(historial.children[historial.children.length - 1]).toHaveTextContent(
      'Asistente: Ya casi está. ¿Cómo os llamáis tu mascota y tú?',
    )
    expect(screen.queryByRole('group', { name: 'Respuestas rápidas' })).not.toBeInTheDocument()

    const textbox = screen.getByRole('textbox', { name: 'Tu respuesta' })
    expect(textbox).toHaveAttribute('placeholder', 'Ej. Nala y Ana Martín')
    expect(screen.getByRole('button', { name: 'Enviar respuesta' })).toBeInTheDocument()
  })
})

describe('@s6 no se puede enviar el campo de texto vacío', () => {
  it('pulsar "Enviar respuesta" con el campo vacío expone aria-disabled "true" y no cambia el historial', async () => {
    const usuario = userEvent.setup()
    renderizarReservaChat()
    await responderTresPrimerosPasos(usuario, 'Medicina general', 'Una gata de 4 años', 'Entre semana por la mañana')

    const boton = screen.getByRole('button', { name: 'Enviar respuesta' })
    await usuario.click(boton)

    expect(boton).toHaveAttribute('aria-disabled', 'true')
    const historial = screen.getByRole('log')
    expect(historial.children).toHaveLength(7)
    expect(historial.children[historial.children.length - 1]).toHaveTextContent(
      'Asistente: Ya casi está. ¿Cómo os llamáis tu mascota y tú?',
    )
    expect(screen.getByRole('group', { name: 'Asistente de reserva de Galapavet' })).not.toHaveTextContent('Anotado:')
  })
})

describe('@s7 una respuesta hecha solo de espacios en blanco tampoco avanza el guion', () => {
  it('con solo espacios en el paso del animal, "Enviar respuesta" expone aria-disabled "true" y no añade mensajes', async () => {
    const usuario = userEvent.setup()
    renderizarReservaChat()
    await usuario.click(screen.getByRole('button', { name: 'Medicina general' }))

    const historialAntes = screen.getByRole('log').children.length
    await usuario.type(screen.getByRole('textbox', { name: 'Tu respuesta' }), '   ')
    const boton = screen.getByRole('button', { name: 'Enviar respuesta' })
    await usuario.click(boton)

    expect(boton).toHaveAttribute('aria-disabled', 'true')
    const historial = screen.getByRole('log')
    expect(historial.children).toHaveLength(historialAntes)
    expect(historial.children[historial.children.length - 1]).toHaveTextContent('Asistente: Entendido. ¿Con qué animal vienes?')
  })
})

describe('@s8 pulsar Intro en el campo de texto equivale a pulsar enviar', () => {
  it('con "Nala y Ana Martín" escrito, Intro añade el mensaje del visitante y el mensaje final del asistente', async () => {
    const usuario = userEvent.setup()
    renderizarReservaChat()
    await responderTresPrimerosPasos(usuario, 'Medicina general', 'Una gata de 4 años', 'Entre semana por la mañana')

    const textbox = screen.getByRole('textbox', { name: 'Tu respuesta' })
    await usuario.type(textbox, 'Nala y Ana Martín{Enter}')

    const mensajes = [...screen.getByRole('log').children].map((elemento) => elemento.textContent)
    expect(mensajes).toContain('Tú: Nala y Ana Martín')
    expect(mensajes[mensajes.length - 1]).toMatch(/^Asistente: Gracias, Nala y Ana Martín\. Anotado:/)
  })
})

describe('@s9 pulsar Intro con el campo en blanco no hace nada', () => {
  it('el historial sigue en 7 mensajes, el campo sigue vacío y el chat sigue en el paso del nombre', async () => {
    const usuario = userEvent.setup()
    renderizarReservaChat()
    await responderTresPrimerosPasos(usuario, 'Medicina general', 'Una gata de 4 años', 'Entre semana por la mañana')

    const textbox = screen.getByRole('textbox', { name: 'Tu respuesta' })
    await usuario.type(textbox, '{Enter}')

    expect(screen.getByRole('log').children).toHaveLength(7)
    expect(textbox).toHaveValue('')
    expect(screen.getByRole('textbox', { name: 'Tu respuesta' })).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Respuestas rápidas' })).not.toBeInTheDocument()
  })
})

describe('@s10 la respuesta escrita se registra sin los espacios sobrantes', () => {
  it('con espacios de sobra alrededor, el mensaje añadido y el saludo final usan el nombre recortado', async () => {
    const usuario = userEvent.setup()
    renderizarReservaChat()
    await responderTresPrimerosPasos(usuario, 'Medicina general', 'Una gata de 4 años', 'Entre semana por la mañana')

    await usuario.type(screen.getByRole('textbox', { name: 'Tu respuesta' }), '  Nala y Ana Martín  ')
    await usuario.click(screen.getByRole('button', { name: 'Enviar respuesta' }))

    const mensajes = [...screen.getByRole('log').children].map((elemento) => elemento.textContent)
    expect(mensajes).toContain('Tú: Nala y Ana Martín')
    expect(mensajes[mensajes.length - 1]).toMatch(/^Asistente: Gracias, Nala y Ana Martín\./)
  })
})

describe('@s11 completar el guion genera el resumen final con las respuestas dadas', () => {
  it('el último mensaje es exactamente el saludo con el resumen y el teléfono real, sin WhatsApp ni promesa de plazo', async () => {
    const usuario = userEvent.setup()
    renderizarReservaChat()
    await responderTresPrimerosPasos(usuario, 'Medicina general', 'Una gata de 4 años', 'Entre semana por la mañana')

    await usuario.type(screen.getByRole('textbox', { name: 'Tu respuesta' }), 'Nala y Ana Martín')
    await usuario.click(screen.getByRole('button', { name: 'Enviar respuesta' }))

    const historial = screen.getByRole('log')
    const ultimoMensaje = historial.children[historial.children.length - 1]
    expect(ultimoMensaje).toHaveTextContent(
      'Asistente: Gracias, Nala y Ana Martín. Anotado: Medicina general · Una gata de 4 años · Entre semana por la mañana. Para cerrar la cita, llámanos al 91 082 92 67 y dinos estos datos.',
    )

    const texto = ultimoMensaje?.textContent ?? ''
    const telefonos = texto.match(/\d[\d ]+\d/g) ?? []
    expect(telefonos.every((telefono) => telefono === '91 082 92 67')).toBe(true)
    expect(texto).not.toContain('WhatsApp')
    expect(texto).not.toContain('2 horas')
  })
})

/** Responde los 4 pasos completos, dejando el chat en el estado final. */
async function completarGuion(
  usuario: ReturnType<typeof userEvent.setup>,
  servicio: string,
  animal: string,
  cuando: string,
  nombre: string,
): Promise<void> {
  await responderTresPrimerosPasos(usuario, servicio, animal, cuando)
  await usuario.type(screen.getByRole('textbox', { name: 'Tu respuesta' }), nombre)
  await usuario.click(screen.getByRole('button', { name: 'Enviar respuesta' }))
}

describe('@s12 al terminar el guion se ofrece la llamada con el resumen a la vista', () => {
  it('hay un resumen de 4 líneas, un enlace de llamada, un botón "Pedir otra cita" y ni textbox ni WhatsApp', async () => {
    const usuario = userEvent.setup()
    renderizarReservaChat()
    await completarGuion(usuario, 'Medicina general', 'Una gata de 4 años', 'Entre semana por la mañana', 'Nala y Ana Martín')

    const widget = screen.getByRole('group', { name: 'Asistente de reserva de Galapavet' })
    const resumen = within(widget).getByRole('group', { name: 'Resumen de tu solicitud' })
    const lineas = within(resumen)
      .getAllByRole('listitem')
      .map((elemento) => elemento.textContent)
    expect(lineas).toEqual([
      'Servicio: Medicina general',
      'Animal: Una gata de 4 años',
      'Cuándo: Entre semana por la mañana',
      'Nombre: Nala y Ana Martín',
    ])

    const enlace = within(widget).getByRole('link', { name: 'Llamar para cerrar la cita · 91 082 92 67' })
    expect(enlace).toHaveAttribute('href', 'tel:+34910829267')
    expect(within(widget).getByRole('button', { name: 'Pedir otra cita' })).toBeInTheDocument()

    // ENMENDADO el 03/09/2026 con `fidelidad_reserva` (32), Decisión 66: la
    // cláusula "ningún enlace wa.me dentro del widget" era la reserva del canal
    // sin confirmar, hoy derogada. Lo que se fija ahora es lo que el widget
    // ofrece de verdad: la llamada es su ÚNICO enlace de cierre; el canal de
    // mensajería confirmado vive en la columna de texto (@s18). Antes/después en
    // `progress/fidelidad/enmiendas_fidelidad_reserva.md`.
    expect(within(widget).getAllByRole('link')).toEqual([enlace])
    expect(within(widget).queryByRole('textbox')).not.toBeInTheDocument()
    expect(within(widget).queryByRole('group', { name: 'Respuestas rápidas' })).not.toBeInTheDocument()
  })
})

describe('@s13 "Pedir otra cita" reinicia el chat desde el primer paso', () => {
  it('el historial vuelve a 1 mensaje, vuelven las 6 respuestas rápidas y desaparecen el resumen y cualquier enlace', async () => {
    const usuario = userEvent.setup()
    renderizarReservaChat()
    await completarGuion(usuario, 'Medicina general', 'Una gata de 4 años', 'Entre semana por la mañana', 'Nala y Ana Martín')

    await usuario.click(screen.getByRole('button', { name: 'Pedir otra cita' }))

    const widget = screen.getByRole('group', { name: 'Asistente de reserva de Galapavet' })
    const historial = screen.getByRole('log')
    expect(historial.children).toHaveLength(1)
    expect(historial.children[0]).toHaveTextContent('Asistente: Hola, soy el asistente de Galapavet. ¿Qué necesita tu mascota?')

    const respuestasRapidas = within(widget).getByRole('group', { name: 'Respuestas rápidas' })
    expect(within(respuestasRapidas).getAllByRole('button')).toHaveLength(6)
    expect(within(widget).queryByRole('group', { name: 'Resumen de tu solicitud' })).not.toBeInTheDocument()
    expect(within(widget).queryAllByRole('link')).toHaveLength(0)
  })
})

describe('@s14 elegir "Es una urgencia" corta el guion y deriva al teléfono de urgencias', () => {
  it('el historial registra la urgencia y hay enlaces a urgencias y a la clínica, sin ningún "24 h"', async () => {
    const usuario = userEvent.setup()
    renderizarReservaChat()

    await usuario.click(screen.getByRole('button', { name: 'Es una urgencia' }))

    const widget = screen.getByRole('group', { name: 'Asistente de reserva de Galapavet' })
    const historial = screen.getByRole('log')
    expect(historial.children[1]).toHaveTextContent('Tú: Es una urgencia')
    expect(historial.children[2]).toHaveTextContent(
      'Asistente: Si es una urgencia, no esperes: llama al 91 851 13 93, el teléfono de urgencias fuera de horario. Dentro del horario de clínica, llama al 91 082 92 67.',
    )

    const enlaceUrgencias = within(widget).getByRole('link', { name: 'Llamar a urgencias fuera de horario · 91 851 13 93' })
    expect(enlaceUrgencias).toHaveAttribute('href', 'tel:+34918511393')
    const enlaceClinica = within(widget).getByRole('link', { name: 'Llamar a la clínica · 91 082 92 67' })
    expect(enlaceClinica).toHaveAttribute('href', 'tel:+34910829267')

    for (const textoProhibido of ['24 h', '24h', 'todos los días']) {
      expect(widget).not.toHaveTextContent(textoProhibido)
    }
  })
})

describe('@s15 tras derivar a urgencias el chat ya no pregunta el animal, el cuándo ni el nombre', () => {
  it('el historial se queda en 3 mensajes y no quedan ni preguntas posteriores ni respuestas rápidas ni textbox ni resumen', async () => {
    const usuario = userEvent.setup()
    renderizarReservaChat()
    await usuario.click(screen.getByRole('button', { name: 'Es una urgencia' }))

    const widget = screen.getByRole('group', { name: 'Asistente de reserva de Galapavet' })
    expect(screen.getByRole('log').children).toHaveLength(3)
    expect(widget).not.toHaveTextContent('¿Con qué animal vienes?')
    expect(widget).not.toHaveTextContent('¿Cuándo te viene mejor?')
    expect(widget).not.toHaveTextContent('¿Cómo os llamáis')
    expect(within(widget).queryByRole('group', { name: 'Respuestas rápidas' })).not.toBeInTheDocument()
    expect(within(widget).queryByRole('textbox')).not.toBeInTheDocument()
    expect(within(widget).queryByRole('group', { name: 'Resumen de tu solicitud' })).not.toBeInTheDocument()
  })
})

describe('@s16 "Empezar de nuevo" desde la derivación de urgencias devuelve al primer paso', () => {
  it('el historial vuelve a 1 mensaje, vuelven las 6 respuestas rápidas y desaparece el enlace de urgencias', async () => {
    const usuario = userEvent.setup()
    renderizarReservaChat()
    await usuario.click(screen.getByRole('button', { name: 'Es una urgencia' }))

    await usuario.click(screen.getByRole('button', { name: 'Empezar de nuevo' }))

    const widget = screen.getByRole('group', { name: 'Asistente de reserva de Galapavet' })
    const historial = screen.getByRole('log')
    expect(historial.children).toHaveLength(1)
    expect(historial.children[0]).toHaveTextContent('Asistente: Hola, soy el asistente de Galapavet. ¿Qué necesita tu mascota?')

    const respuestasRapidas = within(widget).getByRole('group', { name: 'Respuestas rápidas' })
    expect(within(respuestasRapidas).getAllByRole('button')).toHaveLength(6)

    expect(within(widget).queryAllByRole('link')).toHaveLength(0)
    expect(
      within(widget).queryByRole('link', { name: 'Llamar a urgencias fuera de horario · 91 851 13 93' }),
    ).not.toBeInTheDocument()
  })
})

const AVISO_DEMO = 'Demostración: esta solicitud no se envía a ningún servidor. La cita se cierra por teléfono.'

describe('@s17 el aviso de que nada se envía a ningún servidor se ve en todos los estados del chat', () => {
  it('el aviso se ve en el paso servicio, en el estado final y en la derivación a urgencias, y no hay indicador "en línea"', async () => {
    const usuario = userEvent.setup()
    renderizarReservaChat()

    const widget = screen.getByRole('group', { name: 'Asistente de reserva de Galapavet' })
    expect(widget).toHaveTextContent(AVISO_DEMO)
    expect(widget).not.toHaveTextContent('en línea')

    await completarGuion(usuario, 'Medicina general', 'Una gata de 4 años', 'Entre semana por la mañana', 'Nala y Ana Martín')
    expect(widget).toHaveTextContent(AVISO_DEMO)

    await usuario.click(screen.getByRole('button', { name: 'Pedir otra cita' }))
    await usuario.click(screen.getByRole('button', { name: 'Es una urgencia' }))
    expect(widget).toHaveTextContent(AVISO_DEMO)
    expect(widget).not.toHaveTextContent('en línea')
  })
})

// ENMENDADO el 03/09/2026 con `fidelidad_reserva` (32), Decisión 66: el cliente
// confirmó que el móvil 685 34 31 49 atiende WhatsApp (`docs/datos-galapavet.md`
// §2bis), lo que deroga la prohibición del canal que este escenario fijaba
// mientras el dato estuviera sin confirmar. Antes/después literal en
// `progress/fidelidad/enmiendas_fidelidad_reserva.md`. Se conserva la
// prohibición de `mailto:` (el cliente sigue sin publicar email) y se exige
// que el ÚNICO enlace de mensajería sea el del móvil confirmado.
describe('@s18 el visitante puede saltarse el chat y escribir o llamar directamente', () => {
  it('hay un enlace "WhatsApp" al móvil confirmado y otro "Llamar a la clínica"; ningún otro wa.me y ningún mailto en la sección', () => {
    const { container } = renderizarReservaChat()

    expect(screen.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute('href', 'https://wa.me/34685343149')
    expect(screen.getByRole('link', { name: 'Llamar a la clínica' })).toHaveAttribute('href', 'tel:+34910829267')

    const enlaces = screen.getAllByRole('link')
    const enlacesDeMensajeria = enlaces.filter((enlace) => /wa\.me|whatsapp/i.test(enlace.getAttribute('href') ?? ''))
    expect(enlacesDeMensajeria).toHaveLength(1)
    for (const enlace of enlacesDeMensajeria) {
      expect(enlace.getAttribute('href')).toBe('https://wa.me/34685343149')
      expect(enlace).toHaveAccessibleName('WhatsApp')
    }
    for (const enlace of enlaces) {
      const destino = enlace.getAttribute('href') ?? ''
      expect(destino).not.toMatch(/^mailto:/)
    }
    expect(container).toHaveTextContent('Llamar a la clínica')
  })
})

describe('@s19 la sección informa del horario real y no promete ningún plazo de respuesta', () => {
  it('se ven exactamente los 3 tramos de horario reales y no aparece ninguna promesa no publicada', () => {
    const { container } = renderizarReservaChat()

    expect(screen.getAllByRole('listitem').map((elemento) => elemento.textContent)).toEqual([
      'Lunes a viernes: 11:00 a 14:00 y 16:30 a 20:00',
      'Sábados: 11:00 a 14:00',
      'Domingos: Cerrado',
    ])

    for (const textoProhibido of ['en menos de 2 horas', 'Recordatorio', 'sin coste', '24 h', '24h']) {
      expect(container).not.toHaveTextContent(textoProhibido)
    }
  })
})

describe('@s20 cada mensaje del historial dice quién lo dice, sin depender del color', () => {
  it('cada mensaje empieza por "Asistente:" o "Tú:", con exactamente 2 y 1 de cada uno', async () => {
    const usuario = userEvent.setup()
    renderizarReservaChat()
    await usuario.click(screen.getByRole('button', { name: 'Medicina general' }))

    const mensajes = [...screen.getByRole('log').children].map((elemento) => elemento.textContent ?? '')
    for (const mensaje of mensajes) {
      expect(mensaje.startsWith('Asistente:') || mensaje.startsWith('Tú:')).toBe(true)
    }
    expect(mensajes.filter((mensaje) => mensaje.startsWith('Asistente:'))).toHaveLength(2)
    expect(mensajes.filter((mensaje) => mensaje.startsWith('Tú:'))).toHaveLength(1)
  })
})

// ---------------------------------------------------------------------------
// @s34 de `features/rediseno_visual.feature:542-549`: "La reserva por chat se
// presenta en dos columnas, con la cabecera de conversación del diseño". Este
// fichero solo puede verificar la ANATOMÍA (presencia real de cada pieza en
// el DOM, con doble anclaje de literales a mano); la disposición en dos
// columnas a partir del punto de corte y las medidas geométricas reales
// (esquina redondeada, sombra, circularidad del avatar en píxeles) exigen
// navegador real (Playwright) y quedan fuera del ámbito cerrado de este lote
// (ningún fichero de `tests/e2e/` está en la lista de ficheros tocables) —
// documentado en el informe del lote, `progress/rediseno/tdd_reserva-chat-anatomia.md`.
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// @s25 de `features/rediseno_visual.feature:428-434`: "Los controles de
// formulario alcanzan la altura del diseño". La medida real en píxeles del
// alto renderizado exige navegador real (Playwright, fuera del ámbito de
// este fichero); aquí se blinda la REGLA fuente que produce esa altura,
// leyendo el texto real del `.module.scss` con `?raw` — el mismo patrón que
// ya usa `InformacionContacto.test.tsx` (@s36) y el resto de
// `src/lib/diseno/*.test.ts`.
// ---------------------------------------------------------------------------
const TEXTO_RESERVA_CHAT_SCSS = Object.values(
  import.meta.glob('./ReservaChat.module.scss', {
    eager: true,
    query: '?raw',
    import: 'default',
  }) as Record<string, string>,
)[0] as string

/**
 * El cuerpo (sin las llaves que lo delimitan) del bloque cuya cabecera
 * literal es `encabezadoDelBloque` (p. ej. `"[aria-label='Respuestas rápidas'] button {"`),
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

describe('@s25 los botones de "Respuestas rápidas" alcanzan la altura mínima de control (44px)', () => {
  it('el bloque `[aria-label="Respuestas rápidas"] button` fija min-height al mismo token de altura que ya usa `input` en este fichero', () => {
    const cuerpo = cuerpoDelBloque(TEXTO_RESERVA_CHAT_SCSS, "[aria-label='Respuestas rápidas'] button {")

    expect(cuerpo).toContain('min-height: $altura-control-media;')
  })
})

describe('@s34 el panel de conversación abre con una cabecera identificable, con avatar y nombre real', () => {
  it('la cabecera del chat es un grupo localizable que contiene el avatar decorativo y el nombre comercial real "Galapavet"', () => {
    renderizarReservaChat()

    const widget = screen.getByRole('group', { name: 'Asistente de reserva de Galapavet' })
    const cabecera = within(widget).getByRole('group', { name: 'Cabecera del chat' })

    // Doble anclaje: el literal "Galapavet" se escribe aquí a mano (no se
    // importa `datosNegocio.identidad.nombreComercial` de producción), y se
    // confronta contra el texto REAL que la cabecera renderiza.
    expect(within(cabecera).getByText('Galapavet')).toBeInTheDocument()
    expect(within(cabecera).getByText('G', { selector: '[aria-hidden="true"]' })).toBeInTheDocument()
  })

  it('la cabecera lleva un indicador de disponibilidad, sin repetir la promesa "en línea" que @s17 prohíbe', () => {
    renderizarReservaChat()

    const widget = screen.getByRole('group', { name: 'Asistente de reserva de Galapavet' })
    const cabecera = within(widget).getByRole('group', { name: 'Cabecera del chat' })

    // Doble anclaje: el literal "Disponible" se escribe aquí a mano y se
    // confronta contra el texto REAL de la cabecera. No es "en línea": esa
    // palabra la prohíbe @s17 (más abajo, línea ~390) porque el asistente es
    // un guion que corre en el propio navegador, no una persona conectada.
    expect(within(cabecera).getByText('Disponible')).toBeInTheDocument()
    expect(cabecera).not.toHaveTextContent('en línea')
  })
})

// ---------------------------------------------------------------------------
// `features/fidelidad_reserva.feature` (feature 32). Igual que @s25/@s34 de
// arriba: la GEOMETRÍA pintada (dos columnas, 470 px, 44 px, apilado a 320 px)
// se mide en navegador real en `tests/e2e/fidelidad-reserva.spec.ts`; aquí se
// blindan la anatomía del DOM (con doble anclaje de literales a mano) y las
// reglas fuente del `.module.scss`, leídas con `?raw` por cabecera literal.
// ---------------------------------------------------------------------------
describe('@s1 de fidelidad_reserva: información y chat como dos columnas equilibradas', () => {
  it('el bloque informativo precede a la tarjeta del chat como hermanos directos de la rejilla', () => {
    renderizarReservaChat()

    const widget = screen.getByRole('group', { name: 'Asistente de reserva de Galapavet' })
    const informacion = widget.previousElementSibling

    expect(informacion).not.toBeNull()
    expect(informacion).toHaveAttribute('data-reserva-informacion')
    expect(within(informacion as HTMLElement).getByRole('heading', { level: 2 })).toBeInTheDocument()
    expect(widget.parentElement).toBe(informacion?.parentElement)
  })

  it('la rejilla centra verticalmente sus dos columnas y la tarjeta declara una altura mínima con la sombra de reposo fija', () => {
    const rejilla = cuerpoDelBloque(TEXTO_RESERVA_CHAT_SCSS, '.reservaChat {')
    expect(rejilla).toContain('grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));')
    expect(rejilla).toContain('align-items: center;')

    // La tarjeta mantiene la sombra de reposo también con el puntero encima:
    // `geometria-escalas.spec.ts` @s24 la cuenta entre las tarjetas "en reposo".
    const tarjeta = cuerpoDelBloque(TEXTO_RESERVA_CHAT_SCSS, '.tarjeta {')
    expect(tarjeta).toContain('@include tarjeta;')
    expect(cuerpoDelBloque(tarjeta, '&:hover {')).toContain('box-shadow: var(--sombra-reposo);')
    // La altura mínima vive en el interior de la tarjeta: la caja anónima de un
    // `fieldset` no hereda `min-height`, y sin ella el pie no se anclaría abajo.
    const interior = cuerpoDelBloque(TEXTO_RESERVA_CHAT_SCSS, '.interior {')
    expect(interior).toContain('flex-direction: column;')
    expect(interior).toMatch(/min-height: [^;]+;/)
  })
})

describe('@s2 de fidelidad_reserva: los dos canales confirmados de la fuente única, en una fila', () => {
  it('el primer enlace es exactamente "WhatsApp" hacia el wa.me del móvil confirmado y el segundo "Llamar a la clínica" hacia el tel: de la clínica', () => {
    const { container } = renderizarReservaChat()

    const acciones = container.querySelector('[data-reserva-acciones]')
    expect(acciones).not.toBeNull()
    const enlaces = within(acciones as HTMLElement).getAllByRole('link')
    expect(enlaces).toHaveLength(2)

    // Doble anclaje: destino y nombre tecleados a mano (Decisión 66,
    // `docs/datos-galapavet.md` §2bis: el 685 34 31 49 atiende WhatsApp).
    expect(enlaces[0]).toHaveAccessibleName('WhatsApp')
    expect(enlaces[0]).toHaveAttribute('href', 'https://wa.me/34685343149')
    expect(enlaces[0]).toHaveAttribute('target', '_blank')
    expect(enlaces[0]).toHaveAttribute('rel', expect.stringContaining('noopener'))
    expect(enlaces[1]).toHaveAccessibleName('Llamar a la clínica')
    expect(enlaces[1]).toHaveAttribute('href', 'tel:+34910829267')

    // La fila de acciones va dentro del bloque informativo, tras el titular.
    const informacion = container.querySelector('[data-reserva-informacion]') as HTMLElement
    const titular = within(informacion).getByRole('heading', { level: 2 })
    expect(informacion).toContainElement(acciones as HTMLElement)
    expect(titular.compareDocumentPosition(acciones as Node) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('la fila de acciones es flex con salto de línea y viste el primer enlace como botón primario y el resto como fantasma', () => {
    const fila = cuerpoDelBloque(TEXTO_RESERVA_CHAT_SCSS, '.acciones {')

    expect(fila).toContain('display: flex;')
    expect(fila).toContain('flex-wrap: wrap;')
    expect(cuerpoDelBloque(fila, 'a:first-child {')).toContain('@include boton-primario;')
    expect(cuerpoDelBloque(fila, 'a:not(:first-child) {')).toContain('@include boton-fantasma;')
    // El paso 20 no existe en la escala: Sass lo descartaba y dejaba las píldoras sin relleno lateral.
    expect(TEXTO_RESERVA_CHAT_SCSS).not.toContain('espaciado(20)')
  })
})

describe('@s3 de fidelidad_reserva: la lista con marcas son los tres tramos de horario reales', () => {
  it('la lista va bajo las acciones, cada tramo es texto plano sin nodos de marca y no hay promesas de plazo ni disponibilidad', () => {
    const { container } = renderizarReservaChat()

    const lista = container.querySelector('[data-reserva-horario]')
    expect(lista).not.toBeNull()
    const acciones = container.querySelector('[data-reserva-acciones]') as HTMLElement
    expect(acciones.compareDocumentPosition(lista as Node) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

    const tramos = within(lista as HTMLElement).getAllByRole('listitem')
    expect(tramos.map((tramo) => tramo.textContent)).toEqual([
      'Lunes a viernes: 11:00 a 14:00 y 16:30 a 20:00',
      'Sábados: 11:00 a 14:00',
      'Domingos: Cerrado',
    ])
    // La marca "✓" es decorativa y vive en CSS: ningún nodo hijo, ningún texto extra.
    for (const tramo of tramos) {
      expect(tramo.children).toHaveLength(0)
    }
    for (const promesa of ['Confirmamos', 'en menos de', 'Recordatorio', 'sin coste', 'en línea']) {
      expect(container).not.toHaveTextContent(promesa)
    }
  })

  it('el bloque `.horario` quita las viñetas y pinta la marca en `li::before` con texto alternativo vacío, sobre el acento suave', () => {
    const horario = cuerpoDelBloque(TEXTO_RESERVA_CHAT_SCSS, '.horario {')
    expect(horario).toContain('list-style: none;')

    const marca = cuerpoDelBloque(horario, 'li::before {')
    // La alternativa vacía (`/ ''`) deja el glifo fuera del árbol accesible: el
    // `textContent` de @s19 y el nombre accesible de cada tramo no cambian.
    expect(marca).toContain("content: '✓' / '';")
    expect(marca).toContain('border-radius: $radio-circulo;')
    expect(marca).toContain('background-color: var(--color-acento-suave);')
    expect(marca).toContain('color: var(--color-acento-tinta);')
  })
})

describe('@s4 de fidelidad_reserva: la tarjeta conserva sus tres bandas y sus controles accesibles', () => {
  it('la cabecera abre con el avatar de iniciales, luego el nombre comercial y el estado "Disponible" con su punto decorativo', () => {
    renderizarReservaChat()

    const widget = screen.getByRole('group', { name: 'Asistente de reserva de Galapavet' })
    const cabecera = within(widget).getByRole('group', { name: 'Cabecera del chat' })
    const avatar = within(cabecera).getByText('G', { selector: '[aria-hidden="true"]' })
    const nombre = within(cabecera).getByText('Galapavet')
    const estado = within(cabecera).getByText('Disponible')

    expect(cabecera.firstElementChild).toBe(avatar)
    expect(avatar.compareDocumentPosition(nombre) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(nombre.compareDocumentPosition(estado) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(estado.querySelector('[aria-hidden="true"]')).not.toBeNull()
  })

  it('cada burbuja del historial declara su autor en `data-autor`, además del rótulo del propio texto', async () => {
    const usuario = userEvent.setup()
    renderizarReservaChat()
    await usuario.click(screen.getByRole('button', { name: 'Medicina general' }))

    const burbujas = [...screen.getByRole('log').children]
    expect(burbujas.map((burbuja) => burbuja.getAttribute('data-autor'))).toEqual(['asistente', 'visitante', 'asistente'])
    expect(burbujas.map((burbuja) => burbuja.textContent)).toEqual([
      'Asistente: Hola, soy el asistente de Galapavet. ¿Qué necesita tu mascota?',
      'Tú: Medicina general',
      'Asistente: Entendido. ¿Con qué animal vienes?',
    ])
  })

  it('el pie agrupa las respuestas rápidas y el aviso de demostración, fuera del historial y dentro del widget', () => {
    const { container } = renderizarReservaChat()

    const widget = screen.getByRole('group', { name: 'Asistente de reserva de Galapavet' })
    const pie = container.querySelector('[data-reserva-pie]')
    expect(pie).not.toBeNull()
    expect(widget).toContainElement(pie as HTMLElement)
    expect(pie).not.toContainElement(screen.getByRole('log'))
    expect(within(pie as HTMLElement).getByRole('group', { name: 'Respuestas rápidas' })).toBeInTheDocument()
    expect(pie).toHaveTextContent(AVISO_DEMO)
  })

  it('en el paso de texto libre, "Enviar respuesta" es el botón redondo "→" en la misma fila que el campo, con su nombre en aria-label', async () => {
    const usuario = userEvent.setup()
    renderizarReservaChat()
    await usuario.click(screen.getByRole('button', { name: 'Medicina general' }))

    const campo = screen.getByRole('textbox', { name: 'Tu respuesta' })
    const boton = screen.getByRole('button', { name: 'Enviar respuesta' })
    expect(boton).toHaveAttribute('aria-label', 'Enviar respuesta')
    expect(boton.querySelector('[aria-hidden="true"]')).toHaveTextContent('→')
    expect(boton.parentElement).toBe(campo.parentElement)
    expect(boton.parentElement).toHaveAttribute('data-reserva-fila-de-texto')
  })

  it('las reglas fuente de las tres bandas: avatar primario de 40px, burbujas por autor, pie con borde superior, chips en fila y botón redondo de 48px', () => {
    const cabecera = cuerpoDelBloque(TEXTO_RESERVA_CHAT_SCSS, '.cabeceraChat {')
    expect(cabecera).toContain('border-block-end: $ancho-borde-fino solid var(--color-borde);')
    const avatar = cuerpoDelBloque(cabecera, '> span {')
    expect(avatar).toContain('width: $altura-control-pequena;')
    expect(avatar).toContain('border-radius: $radio-circulo;')
    expect(avatar).toContain('background-color: var(--color-primario);')
    expect(avatar).toContain('color: var(--color-sobre-primario);')

    const historial = cuerpoDelBloque(TEXTO_RESERVA_CHAT_SCSS, "[role='log'] {")
    expect(historial).toContain('flex: 1;')
    expect(historial).toContain('background-color: var(--color-fondo);')
    const visitante = cuerpoDelBloque(historial, "&[data-autor='visitante'] {")
    expect(visitante).toContain('align-self: flex-end;')
    expect(visitante).toContain('background-color: var(--color-primario);')
    expect(visitante).toContain('color: var(--color-sobre-primario);')

    expect(cuerpoDelBloque(TEXTO_RESERVA_CHAT_SCSS, '.pie {')).toContain(
      'border-block-start: $ancho-borde-fino solid var(--color-borde);',
    )
    expect(cuerpoDelBloque(TEXTO_RESERVA_CHAT_SCSS, "[aria-label='Respuestas rápidas'] {")).toContain('flex-wrap: wrap;')

    const fila = cuerpoDelBloque(TEXTO_RESERVA_CHAT_SCSS, '.filaDeTexto {')
    const campo = cuerpoDelBloque(fila, 'input {')
    expect(campo).toContain('border-radius: $radio-completo;')
    expect(campo).toContain('min-height: $altura-control-media;')
    const boton = cuerpoDelBloque(fila, 'button {')
    expect(boton).toContain('width: $altura-control-media;')
    expect(boton).toContain('height: $altura-control-media;')
    expect(boton).toContain('border-radius: $radio-circulo;')

    expect(cuerpoDelBloque(TEXTO_RESERVA_CHAT_SCSS, '.aviso {')).toContain('color: var(--color-texto-suave);')
  })
})

describe('@s5 de fidelidad_reserva: la reserva se apila en móvil sin perder los canales ni el chat', () => {
  it('en el orden de lectura las acciones preceden a la tarjeta, y las reglas fuente evitan el desborde: sin ancho mínimo intrínseco de fieldset y campo encogible', () => {
    const { container } = renderizarReservaChat()

    const acciones = container.querySelector('[data-reserva-acciones]') as HTMLElement
    const widget = screen.getByRole('group', { name: 'Asistente de reserva de Galapavet' })
    expect(acciones.compareDocumentPosition(widget) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

    // El `fieldset` del agente de usuario trae `min-inline-size: min-content`:
    // con un chip largo, la tarjeta (y los grupos anidados) serían más anchos
    // que una ventana de 320 px. El campo de texto, como ítem flex, necesita
    // `min-width: 0` para poder encoger por debajo de su ancho intrínseco.
    expect(cuerpoDelBloque(TEXTO_RESERVA_CHAT_SCSS, '.tarjeta {')).toContain('min-inline-size: 0;')
    expect(cuerpoDelBloque(TEXTO_RESERVA_CHAT_SCSS, '.tarjeta fieldset {')).toContain('min-inline-size: 0;')
    const campo = cuerpoDelBloque(cuerpoDelBloque(TEXTO_RESERVA_CHAT_SCSS, '.filaDeTexto {'), 'input {')
    expect(campo).toContain('min-width: 0;')
  })
})
