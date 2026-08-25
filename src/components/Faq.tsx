import React, { useState } from 'react'
import { SERVICIOS } from '../data/servicios'
import { datosNegocio } from '../lib/site'
import {
  construirCatalogoFaq,
  enlacesDeContacto,
  entradasValidas,
  segmentosDeRespuesta,
  siguienteIndiceAbierto,
  type EntradaFaq,
} from './Faq-logica'
import type { EnlaceTelefono } from './InformacionContacto-logica'
import styles from './Faq.module.scss'

/** Identificador de la región de respuesta de la entrada situada en `indice`. */
function idRegion(indice: number): string {
  return `faq-respuesta-${indice}`
}

interface RespuestaFaqProps {
  entrada: EntradaFaq
  indice: number
  enlaces: readonly EnlaceTelefono[]
}

/** Renderiza el texto de una respuesta, con enlace `tel:` donde el texto cita un teléfono conocido (@s3/@s5). */
function RespuestaFaq({ entrada, indice, enlaces }: RespuestaFaqProps): React.JSX.Element {
  return (
    <section id={idRegion(indice)} aria-label={entrada.pregunta}>
      {segmentosDeRespuesta(entrada.respuesta, enlaces).map((segmento) =>
        typeof segmento === 'string' ? (
          segmento
        ) : (
          <a key={segmento.href} href={segmento.href}>
            {segmento.textoVisible}
          </a>
        ),
      )}
    </section>
  )
}

interface FaqProps {
  /** Catálogo completo a mostrar. Por defecto, el catálogo real de la clínica (@s11/@s12). */
  catalogo?: readonly EntradaFaq[]
  /** Teléfono legible de urgencias fuera de horario. Por defecto, el de la fuente única (@s13). */
  telefonoUrgencias?: string
}

/** Sección de preguntas frecuentes de la landing: acordeón excluyente (@s1/@s7/@s8/@s9). Catálogo y teléfono de urgencias inyectables (@s11/@s12/@s13). */
export function Faq({
  catalogo,
  telefonoUrgencias = datosNegocio.telefonoUrgencias.textoVisible,
}: FaqProps = {}): React.JSX.Element | null {
  const [indiceAbierto, setIndiceAbierto] = useState<number | null>(null)
  const catalogoCompleto =
    catalogo ??
    construirCatalogoFaq({
      horario: datosNegocio.horario,
      telefonoClinica: datosNegocio.telefonoClinica.textoVisible,
      telefonoMovil: datosNegocio.telefonoMovil.textoVisible,
      telefonoUrgencias,
      servicios: SERVICIOS,
    })
  const enlaces = enlacesDeContacto(
    datosNegocio.telefonoClinica.textoVisible,
    datosNegocio.telefonoMovil.textoVisible,
    telefonoUrgencias,
  )
  const validas = entradasValidas(catalogoCompleto)

  if (validas.length === 0) {
    return null
  }

  return (
    <section aria-label="Preguntas frecuentes" className={styles.faq} data-contenedor-principal>
      <h2>Preguntas frecuentes</h2>
      {validas.map((entrada, indice) => {
        const abierto = indiceAbierto === indice
        return (
          <React.Fragment key={entrada.pregunta}>
            <button
              type="button"
              aria-expanded={abierto}
              aria-controls={idRegion(indice)}
              onClick={() => setIndiceAbierto((actual) => siguienteIndiceAbierto(actual, indice))}
            >
              {entrada.pregunta}
            </button>
            {abierto && <RespuestaFaq entrada={entrada} indice={indice} enlaces={enlaces} />}
          </React.Fragment>
        )
      })}
    </section>
  )
}
