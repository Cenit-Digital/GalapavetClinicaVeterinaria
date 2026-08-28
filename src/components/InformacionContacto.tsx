import React from 'react'
import { datosNegocio } from '../lib/site'
import { construirEnlaceTelefono, type TramoHorario } from './InformacionContacto-logica'
import styles from './InformacionContacto.module.scss'

/**
 * Proveedor del mapa embebido: la ÚNICA petición a un tercero admitida en
 * toda la página (`project-spec.md` → Decisión 9, Invariante 3). El proveedor
 * concreto y el formato de consulta exacto están PENDIENTES de confirmar con
 * el cliente (`features/informacion_contacto.feature` líneas 93-96); ningún
 * escenario fija su valor exacto, solo que declara un origen ajeno y que es
 * el único elemento que lo hace (@s9).
 */
const SRC_MAPA_TERCERO = 'https://www.openstreetmap.org/export/embed.html?layer=mapnik'

const ID_AVISO_MAPA = 'informacion-contacto-aviso-mapa'
const AVISO_MAPA_TERCEROS = 'El mapa lo sirve un proveedor externo. Es la única conexión con un tercero de esta web.'

/**
 * Rótulos visibles de los tres bloques que el cliente SÍ publica (@s36 de
 * `rediseno_visual.feature`): son categorías fijas del panel, no un dato de
 * negocio, así que se declaran una sola vez aquí (no en `src/lib/site.ts`) e
 * idénticos, carácter a carácter, al `aria-label` de cada `<fieldset>` que ya
 * fijó `informacion_contacto.feature` @s1 — para que el nombre accesible
 * (`aria-label`) y el rótulo VISIBLE (`<legend>`) nunca diverjan.
 */
const ROTULO_DIRECCION = 'Dirección'
const ROTULO_TELEFONOS = 'Teléfonos'
const ROTULO_HORARIO = 'Horario'

interface InformacionContactoProps {
  /** Teléfono legible de la clínica. Por defecto, el de la fuente única (@s11). */
  telefonoClinica?: string
  /**
   * Teléfono legible de urgencias fuera de horario. Por defecto, el de la
   * fuente única. `null`: la fuente única no lo declara (@s12) — el bloque
   * no se renderiza, sin placeholder.
   */
  telefonoUrgencias?: string | null
  /** Franjas horarias publicadas. Por defecto, las de la fuente única. Sin tramos: el bloque no se renderiza (@s13). */
  horario?: readonly TramoHorario[]
  /**
   * Líneas de la dirección postal. Por defecto, las de la fuente única.
   * `null`: la fuente única no la declara (@s14) — sin dirección no hay por
   * dónde centrar el mapa, así que tampoco se renderiza el marco.
   */
  direccion?: readonly [string, string] | null
}

/** Panel de información de contacto de la landing: mapa + bloques de datos. */
export function InformacionContacto({
  telefonoClinica = datosNegocio.telefonoClinica.textoVisible,
  telefonoUrgencias = datosNegocio.telefonoUrgencias.textoVisible,
  horario = datosNegocio.horario,
  direccion = datosNegocio.direccion.lineas,
}: InformacionContactoProps = {}): React.JSX.Element {
  const enlacesTelefono = [
    construirEnlaceTelefono(telefonoClinica),
    construirEnlaceTelefono(datosNegocio.telefonoMovil.textoVisible),
  ]
  const enlaceUrgencias = telefonoUrgencias !== null ? construirEnlaceTelefono(telefonoUrgencias) : null
  const tituloMapa = `Mapa de ${datosNegocio.identidad.nombreComercial}`

  return (
    <section aria-label="Información de contacto" className={styles.informacionContacto}>
      {/* La tarjeta "debajo" (@s36): el mapa y los bloques de datos que el
          cliente SÍ publica. El orden de lectura del DOM es el mismo que ya
          fijó `informacion_contacto.feature` @s1 (Dirección, Teléfonos,
          Horario) — este contrato no lo reabre, solo añade el rótulo VISIBLE
          de cada bloque y el envoltorio de tarjeta. */}
      <div data-tarjeta-de="datos">
        {direccion !== null && (
          <>
            {/* `sandbox` vacío: el mapa no necesita ni script ni formularios ni
                navegar la página desde dentro del marco — el permiso más
                restrictivo que sigue mostrando el mapa (exigido por el linter
                del proyecto, `react/iframe-missing-sandbox`; ningún escenario
                del contrato fija su valor). */}
            <iframe
              title={tituloMapa}
              src={SRC_MAPA_TERCERO}
              aria-describedby={ID_AVISO_MAPA}
              loading="lazy"
              sandbox=""
            />
            <p id={ID_AVISO_MAPA}>{AVISO_MAPA_TERCEROS}</p>
            <fieldset aria-label="Dirección">
              <legend>{ROTULO_DIRECCION}</legend>
              <p>{direccion[0]}</p>
              <p>{direccion[1]}</p>
            </fieldset>
          </>
        )}
        <fieldset aria-label="Teléfonos">
          <legend>{ROTULO_TELEFONOS}</legend>
          {enlacesTelefono.map((enlace) => (
            <a key={enlace.href} href={enlace.href}>
              {enlace.textoVisible}
            </a>
          ))}
        </fieldset>
        {horario.length > 0 && (
          <fieldset aria-label="Horario">
            <legend>{ROTULO_HORARIO}</legend>
            <dl>
              {horario.map((tramo) => (
                <div key={tramo.dias}>
                  <dt>{tramo.dias}</dt>
                  <dd>{tramo.horas}</dd>
                </div>
              ))}
            </dl>
          </fieldset>
        )}
      </div>
      {/* La tarjeta "a la derecha" (@s36): el color de urgencia, el rótulo
          real (derivado de la fuente única, nunca retipeado) y un botón de
          llamada. Sigue en último lugar en el DOM (igual que antes de este
          contrato); la maquetación la sube visualmente por encima de la
          tarjeta de datos con "order", sin tocar el orden de lectura ya
          aprobado. */}
      {enlaceUrgencias !== null && (
        <div data-tarjeta-de="urgencia">
          <fieldset aria-label="Urgencias fuera de horario">
            <legend>{datosNegocio.telefonoUrgencias.rotulo}</legend>
            <a href={enlaceUrgencias.href}>{enlaceUrgencias.textoVisible}</a>
          </fieldset>
        </div>
      )}
    </section>
  )
}
