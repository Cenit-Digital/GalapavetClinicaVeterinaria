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

    for (const enlaceWidget of within(widget).queryAllByRole('link')) {
      const destino = enlaceWidget.getAttribute('href') ?? ''
      expect(destino).not.toMatch(/wa\.me|whatsapp/i)
    }
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

describe('@s18 el visitante puede saltarse el chat y llamar directamente', () => {
  it('hay enlaces a la clínica y al móvil, y en toda la sección no hay WhatsApp ni mailto', () => {
    const { container } = renderizarReservaChat()

    expect(screen.getByRole('link', { name: 'Llamar a la clínica · 91 082 92 67' })).toHaveAttribute(
      'href',
      'tel:+34910829267',
    )
    expect(screen.getByRole('link', { name: 'Llamar al móvil · 685 34 31 49' })).toHaveAttribute(
      'href',
      'tel:+34685343149',
    )

    for (const enlace of screen.getAllByRole('link')) {
      const destino = enlace.getAttribute('href') ?? ''
      expect(destino).not.toMatch(/wa\.me|whatsapp/i)
      expect(destino).not.toMatch(/^mailto:/)
      expect(enlace).not.toHaveAccessibleName(/WhatsApp/i)
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
