import React from 'react'
import { MAPA_ESTATICO } from '../data/mapa'
import { hrefDeDestino } from '../lib/hrefDeDestino'
import { datosNegocio } from '../lib/site'
import {
  construirEnlaceTelefono,
  describirMapa,
  posicionDelPin,
  titularDeContacto,
  type TramoHorario,
} from './InformacionContacto-logica'
import styles from './InformacionContacto.module.scss'

/**
 * Texto de interfaz de la cabecera de la sección (@s1 de
 * `fidelidad_contacto.feature`). No es un dato de negocio: describe lo que
 * hay en la sección, sin plazos de respuesta ni disponibilidad. NO menciona
 * urgencias a propósito: desde la retirada de la tarjeta roja (20/09/2026,
 * `informacion_contacto.feature` @s6 invertido) este panel no habla de
 * urgencias en ningún sitio, y toda mención que volviera tendría que ir
 * seguida del cualificador real (`datos-reales.spec.ts` @s52).
 */
const INTRODUCCION_DE_CONTACTO =
  'Aquí tienes la dirección, los teléfonos y el horario de la clínica, y un formulario para escribirnos.'

/**
 * Cabecera de la sección de contacto: cintillo (un `<p>`, nunca un
 * encabezado ni un landmark llamado «Contacto», `ensamblaje_landing` @s6),
 * titular derivado de la localidad real y párrafo neutro. Vive en este
 * fichero, no en un módulo nuevo, para no ampliar el inventario de módulos
 * con estilos (`inventarioModulos.ts`).
 */
export function CabeceraDeContacto(): React.JSX.Element {
  return (
    <div className={styles.cabecera} data-contacto-cabecera>
      <p className={styles.cintillo}>Contacto</p>
      <h2>{titularDeContacto(datosNegocio.direccion.localidad)}</h2>
      <p>{INTRODUCCION_DE_CONTACTO}</p>
    </div>
  )
}

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
  /** Franjas horarias publicadas. Por defecto, las de la fuente única. Sin tramos: el bloque no se renderiza (@s13). */
  horario?: readonly TramoHorario[]
  /**
   * Líneas de la dirección postal. Por defecto, las de la fuente única.
   * `null`: la fuente única no la declara (@s14) — sin dirección no hay nada
   * que situar, así que tampoco se renderiza el mapa.
   */
  direccion?: readonly [string, string] | null
}

/** Panel de información de contacto de la landing: una tarjeta con el mapa local y los bloques de datos. */
export function InformacionContacto({
  telefonoClinica = datosNegocio.telefonoClinica.textoVisible,
  horario = datosNegocio.horario,
  direccion = datosNegocio.direccion.lineas,
}: InformacionContactoProps = {}): React.JSX.Element {
  const enlacesTelefono = [
    construirEnlaceTelefono(telefonoClinica),
    construirEnlaceTelefono(datosNegocio.telefonoMovil.textoVisible),
  ]
  const pin = posicionDelPin(datosNegocio.coordenadas, MAPA_ESTATICO.encuadre)
  const descripcionDelMapa = describirMapa(datosNegocio.identidad.nombreComercial, datosNegocio.direccion.unaLinea)

  return (
    <section aria-label="Información de contacto" className={styles.informacionContacto}>
      {/* La única tarjeta del panel (@s36, enmendado el 20/09/2026): el mapa y
          los tres bloques de datos que el cliente SÍ publica. El orden de
          lectura del DOM es el que fijó `informacion_contacto.feature` @s1
          (Dirección, Teléfonos, Horario). */}
      <div data-tarjeta-de="datos">
        {direccion !== null && (
          <>
            {/* Mapa estático LOCAL (Decisión 63, @s4 de `fidelidad_contacto`):
                una imagen del propio origen, a sangre dentro de la tarjeta,
                con el pin en CSS en la posición derivada de las coordenadas
                de la fuente única. Ni marco embebido ni petición a terceros. */}
            <div className={styles.mapa} data-mapa-de-contacto>
              <img
                src={hrefDeDestino(MAPA_ESTATICO.ruta)}
                alt={descripcionDelMapa}
                width={MAPA_ESTATICO.encuadre.ancho}
                height={MAPA_ESTATICO.encuadre.alto}
                loading="lazy"
                decoding="async"
              />
              <span className={styles.pin} aria-hidden="true" style={{ left: `${pin.x}%`, top: `${pin.y}%` }} />
            </div>
            {/* Atribución exigida por la licencia ODbL de los datos del mapa
                (`docs/mapa-estatico.md`): un enlace a un tercero NO es una
                petición; nada se carga de fuera del propio origen. */}
            <p className={styles.atribucion}>
              <a href={MAPA_ESTATICO.urlDeLicencia}>{MAPA_ESTATICO.atribucion}</a>
            </p>
          </>
        )}
        <div className={styles.bloques}>
          {direccion !== null && (
            <fieldset aria-label="Dirección">
              <legend>{ROTULO_DIRECCION}</legend>
              <p>{direccion[0]}</p>
              <p>{direccion[1]}</p>
            </fieldset>
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
      </div>
    </section>
  )
}
