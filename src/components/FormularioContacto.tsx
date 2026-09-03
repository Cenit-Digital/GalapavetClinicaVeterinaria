import React, { useRef, useState } from 'react'
import { datosNegocio } from '../lib/site'
import { construirEnlaceTelefono } from './InformacionContacto-logica'
import { formularioEsValido, validarCampos, type CamposFormulario, type ValidezCampos } from './FormularioContacto-logica'
import styles from './FormularioContacto.module.scss'

const OPCIONES_MOTIVO: readonly string[] = [
  'Pedir cita',
  'Consulta sobre un tratamiento',
  'Campañas',
  'Historial y documentación',
  'Otro',
]

const URL_AVISO_LEGAL = 'https://galapavet.com/aviso-legal'

const ID_TITULO = 'formulario-contacto-titulo'
const ID_NOMBRE = 'formulario-contacto-nombre'
const ID_TELEFONO = 'formulario-contacto-telefono'
const ID_EMAIL = 'formulario-contacto-email'
const ID_MOTIVO = 'formulario-contacto-motivo'
const ID_MENSAJE = 'formulario-contacto-mensaje'
const ID_ACEPTA_AVISO_LEGAL = 'formulario-contacto-acepta-aviso-legal'
const ID_AVISO_NO_ENVIO = 'formulario-contacto-aviso-no-envio'

const AVISO_NO_ENVIO = 'Esta maqueta no envía tu mensaje a ningún servidor.'

const SIN_ERRORES: ValidezCampos = {
  nombreInvalido: false,
  telefonoInvalido: false,
  emailInvalido: false,
  avisoLegalInvalido: false,
}

type Vista = 'formulario' | 'confirmacion'

/** Formulario de contacto de la landing: no envía nada a ningún servidor (Decisión 6). */
export function FormularioContacto(): React.JSX.Element {
  const [vista, setVista] = useState<Vista>('formulario')
  const [validez, setValidez] = useState<ValidezCampos>(SIN_ERRORES)
  const refNombre = useRef<HTMLInputElement>(null)
  const refTelefono = useRef<HTMLInputElement>(null)
  const refEmail = useRef<HTMLInputElement>(null)
  const refAceptaAvisoLegal = useRef<HTMLInputElement>(null)

  function manejarEnvio(evento: React.FormEvent<HTMLFormElement>): void {
    evento.preventDefault()
    const campos: CamposFormulario = {
      nombre: refNombre.current?.value ?? '',
      telefono: refTelefono.current?.value ?? '',
      email: refEmail.current?.value ?? '',
      aceptaAvisoLegal: refAceptaAvisoLegal.current?.checked ?? false,
    }
    const resultado = validarCampos(campos)
    setValidez(resultado)
    if (formularioEsValido(resultado)) {
      setVista('confirmacion')
    }
  }

  if (vista === 'confirmacion') {
    const enlaceClinica = construirEnlaceTelefono(datosNegocio.telefonoClinica.textoVisible)
    const enlaceUrgencias = construirEnlaceTelefono(datosNegocio.telefonoUrgencias.textoVisible)
    return (
      <output className={styles.confirmacion}>
        <h2>Formulario completado</h2>
        <p>
          Tu mensaje no se ha enviado a ningún servidor. Para hablar con nosotros, llama al{' '}
          <a href={enlaceClinica.href}>{enlaceClinica.textoVisible}</a>.
        </p>
        <p>
          {datosNegocio.telefonoUrgencias.rotulo}: <a href={enlaceUrgencias.href}>{enlaceUrgencias.textoVisible}</a>
        </p>
        <button type="button" onClick={() => setVista('formulario')}>
          Enviar otro mensaje
        </button>
      </output>
    )
  }

  return (
    <form
      aria-labelledby={ID_TITULO}
      onSubmit={manejarEnvio}
      noValidate
      className={styles.formulario}
    >
      <h3 id={ID_TITULO}>Escríbenos</h3>
      {/* Nombre y teléfono comparten fila en escritorio (@s2 de
          `fidelidad_contacto.feature`); cada pareja etiqueta+control va en su
          propio envoltorio para que la rejilla reparta parejas, no piezas. */}
      <div className={styles.filaDoble}>
        <div className={styles.campo}>
          <label htmlFor={ID_NOMBRE}>Tu nombre</label>
          <input id={ID_NOMBRE} ref={refNombre} type="text" required aria-invalid={validez.nombreInvalido} />
        </div>
        <div className={styles.campo}>
          <label htmlFor={ID_TELEFONO}>Teléfono</label>
          <input id={ID_TELEFONO} ref={refTelefono} type="tel" required aria-invalid={validez.telefonoInvalido} />
        </div>
      </div>

      <div className={styles.campo}>
        <label htmlFor={ID_EMAIL}>Email</label>
        <input id={ID_EMAIL} ref={refEmail} type="email" required aria-invalid={validez.emailInvalido} />
      </div>

      <div className={styles.campo}>
        <label htmlFor={ID_MOTIVO}>Motivo</label>
        <select id={ID_MOTIVO}>
          {OPCIONES_MOTIVO.map((opcion) => (
            <option key={opcion}>{opcion}</option>
          ))}
        </select>
      </div>

      <div className={styles.campo}>
        <label htmlFor={ID_MENSAJE}>Cuéntanos</label>
        <textarea id={ID_MENSAJE} />
      </div>

      <div className={styles.grupoConsentimiento}>
        <input
          id={ID_ACEPTA_AVISO_LEGAL}
          ref={refAceptaAvisoLegal}
          type="checkbox"
          required
          aria-invalid={validez.avisoLegalInvalido}
        />
        <label htmlFor={ID_ACEPTA_AVISO_LEGAL}>
          He leído y acepto el aviso legal <a href={URL_AVISO_LEGAL}>Aviso legal</a>
        </label>
      </div>

      <p id={ID_AVISO_NO_ENVIO}>{AVISO_NO_ENVIO}</p>
      <button type="submit" aria-describedby={ID_AVISO_NO_ENVIO}>
        Enviar mensaje
      </button>
    </form>
  )
}
