import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { FormularioContacto } from './FormularioContacto'

/** Centraliza el render de `FormularioContacto` bajo test. */
function renderizarFormularioContacto(): ReturnType<typeof render> {
  const elemento: React.JSX.Element = <FormularioContacto />
  return render(elemento)
}

/** Rellena los 3 cuadros de texto obligatorios y marca la casilla del aviso legal. */
async function completarCamposObligatorios(
  usuario: ReturnType<typeof userEvent.setup>,
  nombre: string,
  telefono: string,
  email: string,
): Promise<void> {
  await usuario.type(screen.getByRole('textbox', { name: 'Tu nombre' }), nombre)
  await usuario.type(screen.getByRole('textbox', { name: 'Teléfono' }), telefono)
  await usuario.type(screen.getByRole('textbox', { name: 'Email' }), email)
  await usuario.click(screen.getByRole('checkbox'))
}

describe('@s1 el formulario se muestra por defecto y la confirmación no está presente', () => {
  it('hay un formulario "Escríbenos" con un botón "Enviar mensaje", sin encabezado "Formulario completado"', () => {
    renderizarFormularioContacto()

    const formulario = screen.getByRole('form', { name: 'Escríbenos' })
    expect(within(formulario).getByRole('button', { name: 'Enviar mensaje' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Formulario completado' })).not.toBeInTheDocument()
  })
})

describe('@s2 cada campo se localiza por su etiqueta', () => {
  it('los 6 controles y el enlace "Aviso legal" existen con su nombre accesible exacto', () => {
    renderizarFormularioContacto()

    const formulario = screen.getByRole('form', { name: 'Escríbenos' })
    expect(within(formulario).getByRole('textbox', { name: 'Tu nombre' })).toBeInTheDocument()
    expect(within(formulario).getByRole('textbox', { name: 'Teléfono' })).toBeInTheDocument()
    expect(within(formulario).getByRole('textbox', { name: 'Email' })).toBeInTheDocument()
    expect(within(formulario).getByRole('combobox', { name: 'Motivo' })).toBeInTheDocument()
    expect(within(formulario).getByRole('textbox', { name: 'Cuéntanos' })).toBeInTheDocument()

    const casilla = within(formulario).getByRole('checkbox')
    expect(casilla).toHaveAccessibleName(expect.stringContaining('acepto el aviso legal'))

    const enlace = within(formulario).getByRole('link', { name: 'Aviso legal' })
    expect(enlace).toHaveAttribute('href', 'https://galapavet.com/aviso-legal')
  })
})

const AVISO_NO_ENVIO = 'Esta maqueta no envía tu mensaje a ningún servidor'

describe('@s3 el formulario avisa de que no envía nada a ningún servidor', () => {
  it('el texto se ve y es también la descripción accesible del botón "Enviar mensaje"', () => {
    renderizarFormularioContacto()

    const formulario = screen.getByRole('form', { name: 'Escríbenos' })
    expect(formulario).toHaveTextContent(AVISO_NO_ENVIO)

    const boton = within(formulario).getByRole('button', { name: 'Enviar mensaje' })
    const idDescripcion = boton.getAttribute('aria-describedby')
    expect(idDescripcion).toBeTruthy()
    const descripcion = document.getElementById(idDescripcion ?? '')
    expect(descripcion).not.toBeNull()
    expect(descripcion?.textContent ?? '').toContain(AVISO_NO_ENVIO)
  })
})

describe('@s4 el desplegable Motivo ofrece exactamente cinco opciones', () => {
  it('las opciones son exactamente las 5 reales, en este orden, sin "y precios"', () => {
    renderizarFormularioContacto()

    const desplegable = screen.getByRole('combobox', { name: 'Motivo' })
    const opciones = within(desplegable)
      .getAllByRole('option')
      .map((opcion) => opcion.textContent)

    expect(opciones).toEqual([
      'Pedir cita',
      'Consulta sobre un tratamiento',
      'Campañas',
      'Historial y documentación',
      'Otro',
    ])
  })
})

describe('@s5 solo el nombre, el teléfono, el email y la casilla se anuncian como obligatorios', () => {
  it('4 controles están marcados obligatorios y 2 no lo están', () => {
    renderizarFormularioContacto()

    expect(screen.getByRole('textbox', { name: 'Tu nombre' })).toBeRequired()
    expect(screen.getByRole('textbox', { name: 'Teléfono' })).toBeRequired()
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeRequired()
    expect(screen.getByRole('checkbox')).toBeRequired()

    expect(screen.getByRole('combobox', { name: 'Motivo' })).not.toBeRequired()
    expect(screen.getByRole('textbox', { name: 'Cuéntanos' })).not.toBeRequired()
  })
})

describe('@s6 se puede enviar dejando vacíos los campos no obligatorios', () => {
  it('con Motivo en su opción inicial y Cuéntanos vacío, enviar muestra la confirmación y el formulario desaparece', async () => {
    const usuario = userEvent.setup()
    renderizarFormularioContacto()

    await completarCamposObligatorios(usuario, 'Ana Martín', '600000000', 'ana@correo.es')
    await usuario.click(screen.getByRole('button', { name: 'Enviar mensaje' }))

    expect(screen.getByRole('heading', { name: 'Formulario completado' })).toBeInTheDocument()
    expect(screen.queryByRole('form', { name: 'Escríbenos' })).not.toBeInTheDocument()
  })
})

/** Envía el formulario con los 3 campos de texto obligatorios rellenos y la casilla marcada. */
async function enviarFormularioValido(
  usuario: ReturnType<typeof userEvent.setup>,
  nombre = 'Ana Martín',
  telefono = '600000000',
  email = 'ana@correo.es',
): Promise<void> {
  await completarCamposObligatorios(usuario, nombre, telefono, email)
  await usuario.click(screen.getByRole('button', { name: 'Enviar mensaje' }))
}

describe('@s7 la confirmación declara que nada se ha enviado y ofrece los canales reales', () => {
  it('rol de estado, texto de no-envío, los 2 enlaces de teléfono reales y el botón de reinicio', async () => {
    const usuario = userEvent.setup()
    renderizarFormularioContacto()

    await enviarFormularioValido(usuario)

    const confirmacion = screen.getByRole('status')
    expect(confirmacion).toHaveTextContent('Tu mensaje no se ha enviado a ningún servidor')

    const enlaceClinica = within(confirmacion).getByRole('link', { name: '91 082 92 67' })
    expect(enlaceClinica).toHaveAttribute('href', 'tel:+34910829267')

    expect(confirmacion).toHaveTextContent('Urgencias fuera de horario')
    const enlaceUrgencias = within(confirmacion).getByRole('link', { name: '91 851 13 93' })
    expect(enlaceUrgencias).toHaveAttribute('href', 'tel:+34918511393')

    expect(within(confirmacion).getByRole('button', { name: 'Enviar otro mensaje' })).toBeInTheDocument()
  })
})

describe('@s8 la confirmación no promete recepción, ni plazo de respuesta, ni urgencias 24 h', () => {
  it('no contiene ninguna de las 4 frases prohibidas y solo aparecen los 2 teléfonos reales', async () => {
    const usuario = userEvent.setup()
    renderizarFormularioContacto()

    await enviarFormularioValido(usuario)

    const confirmacion = screen.getByRole('status')
    const texto = confirmacion.textContent ?? ''

    expect(texto).not.toContain('24 h')
    expect(texto).not.toContain('Mensaje recibido')
    expect(texto).not.toContain('hoy mismo')
    expect(texto).not.toContain('Te responderemos')

    const numeros = texto.match(/\d[\d ]{6,}\d/g) ?? []
    for (const numero of numeros) {
      expect(['91 082 92 67', '91 851 13 93']).toContain(numero)
    }
  })
})

describe('@s9 enviar con el nombre vacío no completa el formulario', () => {
  it('no aparece la confirmación, el formulario sigue mostrándose y "Tu nombre" queda inválido', async () => {
    const usuario = userEvent.setup()
    renderizarFormularioContacto()

    await usuario.type(screen.getByRole('textbox', { name: 'Teléfono' }), '600000000')
    await usuario.type(screen.getByRole('textbox', { name: 'Email' }), 'ana@correo.es')
    await usuario.click(screen.getByRole('checkbox'))
    await usuario.click(screen.getByRole('button', { name: 'Enviar mensaje' }))

    expect(screen.queryByRole('heading', { name: 'Formulario completado' })).not.toBeInTheDocument()
    expect(screen.getByRole('form', { name: 'Escríbenos' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Tu nombre' })).toHaveAttribute('aria-invalid', 'true')
  })
})

describe('@s10 un nombre formado solo por espacios no completa el formulario', () => {
  it('con "   " en "Tu nombre" no aparece la confirmación y el control queda inválido', async () => {
    const usuario = userEvent.setup()
    renderizarFormularioContacto()

    await usuario.type(screen.getByRole('textbox', { name: 'Tu nombre' }), '   ')
    await usuario.type(screen.getByRole('textbox', { name: 'Teléfono' }), '600000000')
    await usuario.type(screen.getByRole('textbox', { name: 'Email' }), 'ana@correo.es')
    await usuario.click(screen.getByRole('checkbox'))
    await usuario.click(screen.getByRole('button', { name: 'Enviar mensaje' }))

    expect(screen.queryByRole('heading', { name: 'Formulario completado' })).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Tu nombre' })).toHaveAttribute('aria-invalid', 'true')
  })
})

describe('@s11 un email con formato inválido no completa el formulario', () => {
  it('con "ana@" en "Email" no aparece la confirmación, "Email" queda inválido y "Tu nombre"/"Teléfono" no', async () => {
    const usuario = userEvent.setup()
    renderizarFormularioContacto()

    await usuario.type(screen.getByRole('textbox', { name: 'Tu nombre' }), 'Ana Martín')
    await usuario.type(screen.getByRole('textbox', { name: 'Teléfono' }), '600000000')
    await usuario.type(screen.getByRole('textbox', { name: 'Email' }), 'ana@')
    await usuario.click(screen.getByRole('checkbox'))
    await usuario.click(screen.getByRole('button', { name: 'Enviar mensaje' }))

    expect(screen.queryByRole('heading', { name: 'Formulario completado' })).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('textbox', { name: 'Tu nombre' })).toHaveAttribute('aria-invalid', 'false')
    expect(screen.getByRole('textbox', { name: 'Teléfono' })).toHaveAttribute('aria-invalid', 'false')
  })
})

describe('@s12 enviar sin marcar la casilla del aviso legal no completa el formulario', () => {
  it('sin marcar la casilla no aparece la confirmación y la casilla queda inválida', async () => {
    const usuario = userEvent.setup()
    renderizarFormularioContacto()

    await usuario.type(screen.getByRole('textbox', { name: 'Tu nombre' }), 'Ana Martín')
    await usuario.type(screen.getByRole('textbox', { name: 'Teléfono' }), '600000000')
    await usuario.type(screen.getByRole('textbox', { name: 'Email' }), 'ana@correo.es')
    await usuario.click(screen.getByRole('button', { name: 'Enviar mensaje' }))

    expect(screen.queryByRole('heading', { name: 'Formulario completado' })).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true')
  })
})

describe('@s13 "Enviar otro mensaje" devuelve un formulario limpio', () => {
  it('tras reiniciar, "Escríbenos" reaparece con los 4 controles vacíos, la casilla desmarcada y sin el encabezado de confirmación', async () => {
    const usuario = userEvent.setup()
    renderizarFormularioContacto()

    await usuario.type(screen.getByRole('textbox', { name: 'Tu nombre' }), 'Ana Martín')
    await usuario.type(screen.getByRole('textbox', { name: 'Teléfono' }), '600000000')
    await usuario.type(screen.getByRole('textbox', { name: 'Email' }), 'ana@correo.es')
    await usuario.type(screen.getByRole('textbox', { name: 'Cuéntanos' }), 'Mi perra cojea')
    await usuario.click(screen.getByRole('checkbox'))
    await usuario.click(screen.getByRole('button', { name: 'Enviar mensaje' }))
    expect(screen.getByRole('heading', { name: 'Formulario completado' })).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'Enviar otro mensaje' }))

    expect(screen.getByRole('form', { name: 'Escríbenos' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Tu nombre' })).toHaveValue('')
    expect(screen.getByRole('textbox', { name: 'Teléfono' })).toHaveValue('')
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveValue('')
    expect(screen.getByRole('textbox', { name: 'Cuéntanos' })).toHaveValue('')
    expect(screen.getByRole('checkbox')).not.toBeChecked()
    expect(screen.queryByRole('heading', { name: 'Formulario completado' })).not.toBeInTheDocument()
  })
})

describe('@s14 el bloque del formulario no publica ninguna dirección de correo', () => {
  it('no hay ningún enlace "mailto:" ni ningún texto con arroba entre palabras, ni antes ni después de escribir en "Email"', async () => {
    const usuario = userEvent.setup()
    const { container } = renderizarFormularioContacto()

    for (const enlace of screen.queryAllByRole('link')) {
      expect(enlace.getAttribute('href') ?? '').not.toMatch(/^mailto:/)
    }
    expect(container.textContent ?? '').not.toMatch(/\w@\w/)

    await usuario.type(screen.getByRole('textbox', { name: 'Email' }), 'ana@correo.es')
    expect(container.textContent ?? '').not.toMatch(/\w@\w/)

    await usuario.type(screen.getByRole('textbox', { name: 'Tu nombre' }), 'Ana Martín')
    await usuario.type(screen.getByRole('textbox', { name: 'Teléfono' }), '600000000')
    await usuario.click(screen.getByRole('checkbox'))
    await usuario.click(screen.getByRole('button', { name: 'Enviar mensaje' }))

    for (const enlace of screen.queryAllByRole('link')) {
      expect(enlace.getAttribute('href') ?? '').not.toMatch(/^mailto:/)
    }
    expect(document.body.textContent ?? '').not.toMatch(/\w@\w/)
  })
})
