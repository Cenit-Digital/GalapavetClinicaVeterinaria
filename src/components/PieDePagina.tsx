import React from 'react'
import { PAGINAS_LEGALES, type PaginaLegal } from '../data/paginasLegales'
import { ENLACES_CLINICA, ENLACES_CONTENIDO, type EnlacePieDePagina } from '../data/pieDePaginaEnlaces'
import { hrefDeDestino } from '../lib/hrefDeDestino'
import { datosNegocio } from '../lib/site'
import { construirEnlacesContacto, construirEnlacesLegales, textoCopyright } from './PieDePagina-logica'
import styles from './PieDePagina.module.scss'

/**
 * PENDIENTE: el fichero de imagen local del logotipo no existe aún en el
 * repositorio — ruta provisional, mismo PENDIENTE que `src/data/galeria.ts`.
 */
const SRC_LOGO = '/img/logo-galapavet.webp'

interface ColumnaEnlacesProps {
  titulo: string
  enlaces: readonly EnlacePieDePagina[]
}

/**
 * Resuelve el "href" de ruta de cada enlace bajo la base de despliegue
 * vigente (Decisión 48). Solo se aplica a columnas de destino interno de
 * tipo ruta o ancla ("Clínica", "Contenido"): la columna "Contacto" mezcla
 * "tel:" ya resueltos con un ancla, y esos "tel:" no son un destino de tipo
 * ruta — no pasan por aquí (@s7).
 */
function resolverDestinos(enlaces: readonly EnlacePieDePagina[]): readonly EnlacePieDePagina[] {
  return enlaces.map((enlace) => ({ ...enlace, destino: hrefDeDestino(enlace.destino) }))
}

/** Una columna del pie: encabezado seguido de su lista de enlaces (@s2). */
function ColumnaEnlaces({ titulo, enlaces }: ColumnaEnlacesProps): React.JSX.Element {
  return (
    <div>
      <h3>{titulo}</h3>
      <ul>
        {enlaces.map((enlace) => (
          <li key={enlace.nombre}>
            <a href={enlace.destino}>{enlace.nombre}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}

interface PieDePaginaProps {
  /** Páginas legales de la barra inferior. Por defecto, el catálogo real (@s9/@s11). */
  paginasLegales?: readonly PaginaLegal[]
  /** Fecha usada para calcular el año del aviso de copyright. Por defecto, la fecha actual (@s12/@s13). */
  fecha?: Date
  /**
   * Teléfono legible de urgencias fuera de horario. Por defecto, el de la
   * fuente única. Un teléfono que no normaliza revienta el render entero,
   * sin `tel:` a medias (@s15).
   */
  telefonoUrgencias?: string
}

/** Pie de página de la landing: bloque de marca, columnas de enlaces y barra legal. */
export function PieDePagina({
  paginasLegales = PAGINAS_LEGALES,
  fecha,
  telefonoUrgencias = datosNegocio.telefonoUrgencias.textoVisible,
}: PieDePaginaProps = {}): React.JSX.Element {
  const enlacesContacto = construirEnlacesContacto({
    telefonoClinica: datosNegocio.telefonoClinica.textoVisible,
    telefonoMovil: datosNegocio.telefonoMovil.textoVisible,
    telefonoUrgencias,
    rotuloUrgencias: datosNegocio.telefonoUrgencias.rotulo,
  })
  const enlacesLegales = construirEnlacesLegales(paginasLegales)
  const copyright = textoCopyright(fecha ?? new Date(), datosNegocio.identidad.nombreComercial)

  return (
    <footer className={styles.pie}>
      <div className={styles.interior} data-contenedor-principal>
        <div className={styles.marca}>
          {/* alt vacío: el nombre accesible ya lo aporta el texto contiguo (@s1). */}
          <img src={hrefDeDestino(SRC_LOGO)} alt="" width={201} height={201} loading="lazy" decoding="async" />
          <p>{datosNegocio.identidad.nombreComercial}</p>
          <p>{datosNegocio.identidad.descriptorConLocalidad}</p>
        </div>
        <ColumnaEnlaces titulo="Clínica" enlaces={resolverDestinos(ENLACES_CLINICA)} />
        <ColumnaEnlaces titulo="Contenido" enlaces={resolverDestinos(ENLACES_CONTENIDO)} />
        <ColumnaEnlaces titulo="Contacto" enlaces={enlacesContacto} />
        <div className={styles.barraInferior}>
          <p>{copyright}</p>
          <ul aria-label="Enlaces legales">
            {enlacesLegales.map((enlace) => (
              <li key={enlace.destino}>
                <a href={enlace.destino} target="_blank" rel="noopener noreferrer">
                  {enlace.nombreAccesible}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
