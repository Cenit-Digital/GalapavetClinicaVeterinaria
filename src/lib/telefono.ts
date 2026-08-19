/**
 * Normalización de teléfono español: convierte cualquier escritura legible
 * en el mismo número internacional. Falla cerrado ante cualquier valor que
 * no normalice (ver `project-spec.md` → Modos de error comunes).
 */

const PREFIJO_INTERNACIONAL_ESPANOL = '+34'
const LONGITUD_NUMERO_NACIONAL = 9
const PATRON_NUMERO_NACIONAL = /^\d{9}$/

/** Quita todo espacio en blanco de la escritura recibida. */
function sinEspacios(valor: string): string {
  return valor.replace(/\s+/g, '')
}

function errorTelefonoNoValido(valorOriginal: string, motivo: string): Error {
  return new Error(`Teléfono no válido: "${valorOriginal}" ${motivo}`)
}

/** Normaliza una escritura legible de teléfono al formato internacional español "+34XXXXXXXXX". */
export function normalizarTelefono(valor: string): string {
  const compacto = sinEspacios(valor)

  if (compacto === '') {
    throw errorTelefonoNoValido(valor, 'está vacío')
  }

  const digitos = compacto.startsWith(PREFIJO_INTERNACIONAL_ESPANOL)
    ? compacto.slice(PREFIJO_INTERNACIONAL_ESPANOL.length)
    : compacto

  if (!PATRON_NUMERO_NACIONAL.test(digitos)) {
    throw errorTelefonoNoValido(valor, `no tiene ${LONGITUD_NUMERO_NACIONAL} dígitos`)
  }

  return PREFIJO_INTERNACIONAL_ESPANOL + digitos
}

/** Deriva el enlace `tel:` de una escritura legible de teléfono; lanza si no normaliza (falla cerrado). */
export function enlaceLlamada(valor: string): string {
  return 'tel:' + normalizarTelefono(valor)
}

const PREFIJO_ENLACE_MENSAJERIA = 'https://wa.me/'

/** Convierte "+34XXXXXXXXX" en "34XXXXXXXXX" (wa.me no usa el símbolo "+"). */
function sinSimboloMasInternacional(numeroInternacional: string): string {
  return numeroInternacional.slice(1)
}

/**
 * Deriva el enlace de mensajería (wa.me) de una escritura legible de
 * teléfono, con texto previo codificado si se indica; lanza si no normaliza
 * (falla cerrado, igual que `enlaceLlamada`).
 */
export function enlaceMensajeria(valor: string, texto?: string): string {
  const numero = sinSimboloMasInternacional(normalizarTelefono(valor))
  const base = PREFIJO_ENLACE_MENSAJERIA + numero
  return texto === undefined ? base : `${base}?text=${encodeURIComponent(texto)}`
}
