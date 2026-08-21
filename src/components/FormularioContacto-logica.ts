/**
 * Lógica de decisión de `FormularioContacto`, mordible por mutación
 * (`stryker.config.json` muta `src/**\/*-logica.ts`). El componente `.tsx`
 * solo cablea esta lógica; nada aquí toca el DOM.
 */

export interface CamposFormulario {
  readonly nombre: string
  readonly telefono: string
  readonly email: string
  readonly aceptaAvisoLegal: boolean
}

export interface ValidezCampos {
  readonly nombreInvalido: boolean
  readonly telefonoInvalido: boolean
  readonly emailInvalido: boolean
  readonly avisoLegalInvalido: boolean
}

/** Un texto hecho solo de espacios cuenta como vacío (@s10). */
function esTextoVacio(valor: string): boolean {
  return valor.trim().length === 0
}

/** Exige "local@dominio.tld": sin dominio ("ana@") no es una forma válida de email (@s11). */
const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function emailTieneFormatoValido(valor: string): boolean {
  return PATRON_EMAIL.test(valor)
}

/** Decide qué controles quedan marcados inválidos: vacíos/solo-espacios (@s9/@s10) o, en Email, con formato incorrecto (@s11). */
export function validarCampos(campos: CamposFormulario): ValidezCampos {
  return {
    nombreInvalido: esTextoVacio(campos.nombre),
    telefonoInvalido: esTextoVacio(campos.telefono),
    emailInvalido: esTextoVacio(campos.email) || !emailTieneFormatoValido(campos.email),
    avisoLegalInvalido: !campos.aceptaAvisoLegal,
  }
}

/** El formulario puede completarse si ningún campo obligatorio quedó marcado inválido. */
export function formularioEsValido(validez: ValidezCampos): boolean {
  return !validez.nombreInvalido && !validez.telefonoInvalido && !validez.emailInvalido && !validez.avisoLegalInvalido
}
