import { describe, expect, it } from 'vitest'
import {
  emailTieneFormatoValido,
  formularioEsValido,
  validarCampos,
  type CamposFormulario,
} from './FormularioContacto-logica'

/** Campos que `validarCampos` considera válidos por completo, para partir de una base limpia en cada test. */
const CAMPOS_VALIDOS: CamposFormulario = {
  nombre: 'Ana Martín',
  telefono: '600000000',
  email: 'ana@correo.es',
  aceptaAvisoLegal: true,
}

describe('@s9/@s10 la lógica pura decide si "Tu nombre" queda inválido, sin tocar el DOM', () => {
  it('vacío y solo espacios son inválidos; con contenido real es válido', () => {
    expect(validarCampos({ ...CAMPOS_VALIDOS, nombre: '' }).nombreInvalido).toBe(true)
    expect(validarCampos({ ...CAMPOS_VALIDOS, nombre: '   ' }).nombreInvalido).toBe(true)
    expect(validarCampos({ ...CAMPOS_VALIDOS, nombre: 'Ana Martín' }).nombreInvalido).toBe(false)
  })
})

describe('refuerzo mutación: la lógica pura decide si "Teléfono" queda inválido (ningún @s del contrato lo deja vacío, pero la rama debe morder)', () => {
  it('vacío y solo espacios son inválidos; con contenido real es válido', () => {
    expect(validarCampos({ ...CAMPOS_VALIDOS, telefono: '' }).telefonoInvalido).toBe(true)
    expect(validarCampos({ ...CAMPOS_VALIDOS, telefono: '   ' }).telefonoInvalido).toBe(true)
    expect(validarCampos({ ...CAMPOS_VALIDOS, telefono: '600000000' }).telefonoInvalido).toBe(false)
  })
})

describe('@s11 la lógica pura decide si "Email" tiene forma válida, sin tocar el DOM', () => {
  it('"ana@" (sin dominio) es inválido; "ana@correo.es" es válido', () => {
    expect(emailTieneFormatoValido('ana@')).toBe(false)
    expect(emailTieneFormatoValido('ana@correo.es')).toBe(true)
  })

  it('vacío, sin arroba y sin punto de dominio también son inválidos', () => {
    expect(emailTieneFormatoValido('')).toBe(false)
    expect(emailTieneFormatoValido('anacorreo.es')).toBe(false)
    expect(emailTieneFormatoValido('ana@correoes')).toBe(false)
  })

  it('refuerzo mutación (ancla de inicio): basura antes de un email por lo demás válido es inválido', () => {
    expect(emailTieneFormatoValido(' ana@correo.es')).toBe(false)
  })

  it('refuerzo mutación (ancla de fin): basura después de un email por lo demás válido es inválido', () => {
    expect(emailTieneFormatoValido('ana@correo.es basura')).toBe(false)
  })

  it('validarCampos combina vacío y formato: vacío inválido, con formato roto inválido, correcto válido', () => {
    expect(validarCampos({ ...CAMPOS_VALIDOS, email: '' }).emailInvalido).toBe(true)
    expect(validarCampos({ ...CAMPOS_VALIDOS, email: 'ana@' }).emailInvalido).toBe(true)
    expect(validarCampos({ ...CAMPOS_VALIDOS, email: 'ana@correo.es' }).emailInvalido).toBe(false)
  })
})

describe('@s12 la lógica pura decide si la casilla del aviso legal queda inválida, sin tocar el DOM', () => {
  it('sin marcar es inválida; marcada es válida', () => {
    expect(validarCampos({ ...CAMPOS_VALIDOS, aceptaAvisoLegal: false }).avisoLegalInvalido).toBe(true)
    expect(validarCampos({ ...CAMPOS_VALIDOS, aceptaAvisoLegal: true }).avisoLegalInvalido).toBe(false)
  })
})

describe('refuerzo mutación: formularioEsValido exige las 4 condiciones a la vez', () => {
  it('con los 4 campos válidos el formulario es válido', () => {
    expect(formularioEsValido(validarCampos(CAMPOS_VALIDOS))).toBe(true)
  })

  it('cualquier campo inválido por separado invalida el conjunto', () => {
    expect(formularioEsValido(validarCampos({ ...CAMPOS_VALIDOS, nombre: '' }))).toBe(false)
    expect(formularioEsValido(validarCampos({ ...CAMPOS_VALIDOS, telefono: '' }))).toBe(false)
    expect(formularioEsValido(validarCampos({ ...CAMPOS_VALIDOS, email: 'ana@' }))).toBe(false)
    expect(formularioEsValido(validarCampos({ ...CAMPOS_VALIDOS, aceptaAvisoLegal: false }))).toBe(false)
  })
})
