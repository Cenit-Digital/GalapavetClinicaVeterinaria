import React, { useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router'
import { CAMPANAS_DEMO, type CampanaDemo } from '../data/campanas'
import { MetadatosPagina } from '../components/MetadatosPagina'
import { DATOS_ESTRUCTURADOS_NEGOCIO } from '../lib/datosEstructuradosNegocio'
import { hrefDeDestino } from '../lib/hrefDeDestino'
import { METADATOS_CAMPANAS, METADATOS_FICHA_CAMPANA } from '../lib/seo-logica'
import { datosNegocio } from '../lib/site'
import {
  construirCatalogoCampanas,
  decidirComportamientoDesplazamiento,
  otrasCampanas,
  resolverVista,
  type CampanaValidada,
} from './PaginaCampanas-logica'
import styles from './PaginaCampanas.module.scss'

const TITULO_LISTADO = 'Campañas de prevención'

const AVISO_DEMOSTRACION =
  'Contenido de demostración. Galapavet no ha confirmado ninguna campaña: esta página muestra el formato sobre servicios que la clínica sí presta. Precio, vigencia, plazas y condiciones están pendientes de confirmar con la clínica.'

/** Migas de pan del listado: "Inicio" (enlace) → "Campañas" (actual, sin enlace). */
function RutaListado(): React.JSX.Element {
  return (
    <nav aria-label="Ruta">
      <ol>
        <li>
          <Link to="/">Inicio</Link>
        </li>
        <li aria-current="page">Campañas</li>
      </ol>
    </nav>
  )
}

interface TarjetaCampanaProps {
  campana: CampanaValidada
}

function TarjetaCampana({ campana }: TarjetaCampanaProps): React.JSX.Element {
  return (
    <li>
      {campana.imagen !== undefined && (
        <img src={hrefDeDestino(campana.imagen)} alt="" width={800} height={450} loading="lazy" decoding="async" />
      )}
      <span>Demostración</span>
      <p>Bloque de servicios: {campana.bloque}</p>
      <h2>{campana.titulo}</h2>
      <Link to={`/campanas?campana=${campana.id}`}>Ver la ficha de {campana.titulo}</Link>
    </li>
  )
}

const AVISO_CAMPANA_NO_ENCONTRADA = 'No encontramos esa campaña de demostración.'
const AVISO_CATALOGO_VACIO = 'No hay ninguna campaña de demostración que mostrar.'

interface VistaListadoProps {
  catalogo: readonly CampanaValidada[]
  /** Cuando el id de la URL no coincide con ninguna campaña del catálogo (@s27/@s28). */
  noEncontrada?: boolean
}

function VistaListado({ catalogo, noEncontrada = false }: VistaListadoProps): React.JSX.Element {
  return (
    <>
      <RutaListado />
      <h1>{TITULO_LISTADO}</h1>
      {noEncontrada && <output>{AVISO_CAMPANA_NO_ENCONTRADA}</output>}
      <p>{AVISO_DEMOSTRACION}</p>
      {catalogo.length === 0 ? (
        <p>{AVISO_CATALOGO_VACIO}</p>
      ) : (
        <ul aria-label="Listado de campañas">
          {catalogo.map((campana) => (
            <TarjetaCampana key={campana.titulo} campana={campana} />
          ))}
        </ul>
      )}
    </>
  )
}

interface RutaFichaProps {
  titulo: string
}

/** Migas de pan de la ficha: "Inicio" → "Campañas" (enlaces) → título actual (sin enlace). */
function RutaFicha({ titulo }: RutaFichaProps): React.JSX.Element {
  return (
    <nav aria-label="Ruta">
      <ol>
        <li>
          <Link to="/">Inicio</Link>
        </li>
        <li>
          <Link to="/campanas">Campañas</Link>
        </li>
        <li aria-current="page">{titulo}</li>
      </ol>
    </nav>
  )
}

/** Nivel de foco fuera del orden de tabulación: enfocable solo por programa (@s9). */
const FUERA_DEL_TAB_ORDER = -1

interface BloquePublicadoProps {
  campana: CampanaValidada
}

/**
 * Bloque "Qué publica la clínica": transcribe literalmente los puntos del
 * bloque de servicios de origen. Si el bloque no publica ningún punto, el
 * bloque entero se omite (@s38): ni encabezado ni lista vacía.
 */
function BloquePublicado({ campana }: BloquePublicadoProps): React.JSX.Element | null {
  if (campana.puntos.length === 0) {
    return null
  }

  return (
    <section className={styles.bloquePublicado}>
      <h2>Qué publica la clínica</h2>
      <p>
        «{campana.titulo}» es uno de los puntos que Galapavet publica dentro del bloque «{campana.bloque}».
      </p>
      <ul>
        {campana.puntos.map((punto) => (
          <li key={punto}>{punto}</li>
        ))}
      </ul>
    </section>
  )
}

const NOMBRE_PANEL_PENDIENTES = 'Datos pendientes de confirmar'
const VALOR_PENDIENTE = 'Pendiente de confirmar con la clínica'

/** Panel "Datos pendientes de confirmar": precio, vigencia y plazas, sin ninguna cifra (@s15). */
function PanelDatosPendientes(): React.JSX.Element {
  return (
    <section aria-label={NOMBRE_PANEL_PENDIENTES}>
      <h2>{NOMBRE_PANEL_PENDIENTES}</h2>
      <dl>
        <dt>Precio</dt>
        <dd>{VALOR_PENDIENTE}</dd>
        <dt>Vigencia</dt>
        <dd>{VALOR_PENDIENTE}</dd>
        <dt>Plazas</dt>
        <dd>{VALOR_PENDIENTE}</dd>
      </dl>
    </section>
  )
}

/** Llamadas a la acción de la ficha: llamar al teléfono real de la clínica (@s16). */
function LlamadasAAccion(): React.JSX.Element {
  return (
    <p className={styles.llamadasAAccion}>
      <a href={datosNegocio.telefonoClinica.enlaceLlamada}>Llamar al {datosNegocio.telefonoClinica.textoVisible}</a>
      <Link to="/#reservar">Reservar cita</Link>
    </p>
  )
}

interface OtraCampanaTarjetaProps {
  campana: CampanaValidada
}

/**
 * Tarjeta reducida del bloque "Otras campañas": mismo distintivo, título en
 * h3, un enlace directo a esa ficha. Su nombre accesible es solo el título
 * (no "Ver la ficha de…", reservado a las tarjetas del listado — @s7 exige
 * que ese prefijo desaparezca por completo al estar dentro de una ficha).
 */
function OtraCampanaTarjeta({ campana }: OtraCampanaTarjetaProps): React.JSX.Element {
  return (
    <li>
      <span>Demostración</span>
      <h3>
        <Link to={`/campanas?campana=${campana.id}`}>{campana.titulo}</Link>
      </h3>
    </li>
  )
}

interface BloqueOtrasCampanasProps {
  campanas: readonly CampanaValidada[]
}

/**
 * Bloque "Otras campañas": el resto del catálogo, nunca la campaña abierta
 * (@s19). Si no queda ninguna otra, el bloque entero se omite (@s39).
 */
function BloqueOtrasCampanas({ campanas }: BloqueOtrasCampanasProps): React.JSX.Element | null {
  if (campanas.length === 0) {
    return null
  }

  return (
    <section className={styles.otrasCampanas}>
      <h2>Otras campañas</h2>
      <ul>
        {campanas.map((campana) => (
          <OtraCampanaTarjeta key={campana.titulo} campana={campana} />
        ))}
      </ul>
    </section>
  )
}

interface VistaFichaProps {
  campana: CampanaValidada
  otras: readonly CampanaValidada[]
}

function VistaFicha({ campana, otras }: VistaFichaProps): React.JSX.Element {
  const encabezadoRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    encabezadoRef.current?.focus()
    window.scrollTo({ top: 0, behavior: decidirComportamientoDesplazamiento(window.matchMedia) })
  }, [campana.id])

  return (
    <>
      <RutaFicha titulo={campana.titulo} />
      <h1 ref={encabezadoRef} tabIndex={FUERA_DEL_TAB_ORDER}>
        {campana.titulo}
      </h1>
      <span>Demostración</span>
      <p>{AVISO_DEMOSTRACION}</p>
      <BloquePublicado campana={campana} />
      <PanelDatosPendientes />
      <LlamadasAAccion />
      <BloqueOtrasCampanas campanas={otras} />
    </>
  )
}

interface PaginaCampanasProps {
  /** Catálogo de demo a mostrar. Por defecto, el catálogo real del proyecto. */
  catalogo?: readonly CampanaDemo[]
}

/** Subpágina "/campanas": listado de campañas de prevención y su ficha de detalle. */
export function PaginaCampanas({ catalogo: catalogoDemo = CAMPANAS_DEMO }: PaginaCampanasProps = {}): React.JSX.Element {
  const [searchParams] = useSearchParams()
  const catalogo = construirCatalogoCampanas(catalogoDemo)
  const vista = resolverVista(catalogo, searchParams.get('campana'))

  return (
    <main id="contenido-principal" className={styles.pagina} data-contenedor-principal>
      <MetadatosPagina
        metadatos={vista.tipo === 'ficha' ? METADATOS_FICHA_CAMPANA : METADATOS_CAMPANAS}
        datosEstructurados={DATOS_ESTRUCTURADOS_NEGOCIO}
      />
      {vista.tipo === 'ficha' ? (
        <VistaFicha campana={vista.campana} otras={otrasCampanas(catalogo, vista.campana.id)} />
      ) : (
        <VistaListado catalogo={catalogo} noEncontrada={vista.tipo === 'listado-no-encontrada'} />
      )}
    </main>
  )
}
