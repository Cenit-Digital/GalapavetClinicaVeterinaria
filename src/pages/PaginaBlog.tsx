import React, { useEffect } from 'react'
import { Link, useParams, useSearchParams, type SetURLSearchParams, type URLSearchParamsInit } from 'react-router'
import { MetadatosPagina } from '../components/MetadatosPagina'
import { ARTICULOS_DEMO, type ArticuloDemo, type BloqueDeCuerpo } from '../data/blog'
import { DATOS_ESTRUCTURADOS_NEGOCIO } from '../lib/datosEstructuradosNegocio'
import { decidirComportamientoDesplazamiento } from '../lib/desplazamiento'
import { hrefDeDestino } from '../lib/hrefDeDestino'
import { METADATOS_ARTICULO_BLOG, METADATOS_BLOG } from '../lib/seo-logica'
import {
  articulosRelacionados,
  calcularTiempoDeLectura,
  CATEGORIAS_PUBLICADAS,
  construirCatalogoBlog,
  filtrarPorCategoria,
  formatearTiempoDeLectura,
  normalizarCategoriaSeleccionada,
  resolverArticulo,
} from './PaginaBlog-logica'
import styles from './PaginaBlog.module.scss'

const AVISO_DEMOSTRACION =
  'Contenido de demostración. Galapavet no ha escrito ninguno de estos artículos: son textos de ejemplo para enseñar el formato. No son consejo veterinario ni comprometen a la clínica.'
const AVISO_CATEGORIA_SIN_ARTICULOS = 'No hay artículos de demostración en esta categoría.'
const AVISO_CATALOGO_VACIO = 'Todavía no hay ningún artículo de demostración que mostrar.'
const AVISO_ARTICULO_NO_ENCONTRADO = 'No hemos encontrado ese artículo.'
const DISTINTIVO_DEMOSTRACION = 'Demostración'
const ETIQUETA_TODOS = 'Todos'
const TEXTO_VOLVER_AL_LISTADO = 'Volver al listado del blog'
const TITULO_CIERRE = '¿Tienes una duda con tu animal?'
const TITULO_SIGUE_LEYENDO = 'Sigue leyendo'

/** El sufijo "?categoria=…" cuando hay una categoría activa, o cadena vacía sin ella. */
function parametroCategoria(categoria: string | null): string {
  return categoria !== null ? `?categoria=${encodeURIComponent(categoria)}` : ''
}

/** Destino de un artículo desde el listado, conservando el filtro activo si lo hay (@s4/@s8). */
function destinoArticulo(identificador: string, categoriaActiva: string | null): string {
  return `/blog/${identificador}${parametroCategoria(categoriaActiva)}`
}

/** Destino de vuelta al listado desde un artículo, conservando el filtro con el que se llegó (@s20). */
function destinoListado(categoria: string | null): string {
  return `/blog${parametroCategoria(categoria)}`
}

interface TarjetaArticuloProps {
  articulo: ArticuloDemo
  categoriaActiva: string | null
}

function TarjetaArticulo({ articulo, categoriaActiva }: TarjetaArticuloProps): React.JSX.Element {
  return (
    <li>
      <Link to={destinoArticulo(articulo.identificador, categoriaActiva)}>
        <span>{DISTINTIVO_DEMOSTRACION}</span>
        <h2>{articulo.titulo}</h2>
      </Link>
    </li>
  )
}

interface FiltroCategoriasProps {
  categoriaActiva: string | null
  onSeleccionar: (categoria: string | null) => void
}

function FiltroCategorias({ categoriaActiva, onSeleccionar }: FiltroCategoriasProps): React.JSX.Element {
  return (
    <fieldset aria-label="Filtrar por categoría">
      <button type="button" aria-pressed={categoriaActiva === null} onClick={() => onSeleccionar(null)}>
        {ETIQUETA_TODOS}
      </button>
      {CATEGORIAS_PUBLICADAS.map((categoria) => (
        <button
          key={categoria}
          type="button"
          aria-pressed={categoriaActiva === categoria}
          onClick={() => onSeleccionar(categoria)}
        >
          {categoria}
        </button>
      ))}
    </fieldset>
  )
}

interface VistaListadoProps {
  catalogo: readonly ArticuloDemo[]
  searchParams: URLSearchParams
  setSearchParams: SetURLSearchParams
}

function VistaListado({ catalogo, searchParams, setSearchParams }: VistaListadoProps): React.JSX.Element {
  const categoriaActiva = normalizarCategoriaSeleccionada(searchParams.get('categoria'))
  const articulosFiltrados = filtrarPorCategoria(catalogo, categoriaActiva)

  function seleccionarCategoria(categoria: string | null): void {
    const siguiente: URLSearchParamsInit = categoria === null ? {} : { categoria }
    setSearchParams(siguiente)
  }

  return (
    <>
      <h1>Blog</h1>
      <p>{AVISO_DEMOSTRACION}</p>
      {catalogo.length === 0 ? (
        <p>{AVISO_CATALOGO_VACIO}</p>
      ) : (
        <>
          <FiltroCategorias categoriaActiva={categoriaActiva} onSeleccionar={seleccionarCategoria} />
          {articulosFiltrados.length === 0 ? (
            <p>{AVISO_CATEGORIA_SIN_ARTICULOS}</p>
          ) : (
            <ul aria-label="Listado de artículos">
              {articulosFiltrados.map((articulo) => (
                <TarjetaArticulo key={articulo.identificador} articulo={articulo} categoriaActiva={categoriaActiva} />
              ))}
            </ul>
          )}
        </>
      )}
    </>
  )
}

interface CuerpoArticuloProps {
  cuerpo: readonly BloqueDeCuerpo[]
}

function CuerpoArticulo({ cuerpo }: CuerpoArticuloProps): React.JSX.Element {
  return (
    <>
      {cuerpo.map((bloque) => {
        const clave = `${bloque.tipo}-${bloque.texto}`
        if (bloque.tipo === 'encabezado') {
          return <h2 key={clave}>{bloque.texto}</h2>
        }
        if (bloque.tipo === 'cita') {
          return <blockquote key={clave}>{bloque.texto}</blockquote>
        }
        return <p key={clave}>{bloque.texto}</p>
      })}
    </>
  )
}

/** Cierre del artículo: invita a reservar cita sin prometer nada (@s24). */
function CierreArticulo(): React.JSX.Element {
  return (
    <section className={styles.cierreArticulo}>
      <h2>{TITULO_CIERRE}</h2>
      <Link to="/#reservar">Reservar cita</Link>
    </section>
  )
}

interface BloqueSigueLeyendoProps {
  relacionados: readonly ArticuloDemo[]
}

/** Bloque "Sigue leyendo": artículos de la misma categoría, nunca el actual. Si no hay ninguno, no existe (@s22/@s23). */
function BloqueSigueLeyendo({ relacionados }: BloqueSigueLeyendoProps): React.JSX.Element | null {
  if (relacionados.length === 0) {
    return null
  }
  return (
    <section className={styles.sigueLeyendo}>
      <h2>{TITULO_SIGUE_LEYENDO}</h2>
      <ul>
        {relacionados.map((articulo) => (
          <li key={articulo.identificador}>
            <Link to={`/blog/${articulo.identificador}`}>
              <img src={hrefDeDestino(articulo.imagen)} alt="" width={1600} height={900} loading="lazy" decoding="async" />
              {articulo.titulo}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

interface VistaArticuloProps {
  catalogo: readonly ArticuloDemo[]
  identificador: string
  categoriaParam: string | null
}

function VistaArticulo({ catalogo, identificador, categoriaParam }: VistaArticuloProps): React.JSX.Element {
  const articulo = resolverArticulo(catalogo, identificador)
  const destinoVolver = destinoListado(normalizarCategoriaSeleccionada(categoriaParam))

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: decidirComportamientoDesplazamiento(window.matchMedia) })
  }, [identificador])

  if (articulo === undefined) {
    return (
      <>
        <p>{AVISO_ARTICULO_NO_ENCONTRADO}</p>
        <Link to="/blog">{TEXTO_VOLVER_AL_LISTADO}</Link>
      </>
    )
  }

  const relacionados = articulosRelacionados(catalogo, articulo)
  const minutos = calcularTiempoDeLectura(articulo.cuerpo)

  return (
    <>
      <Link to={destinoVolver}>{TEXTO_VOLVER_AL_LISTADO}</Link>
      <p>{AVISO_DEMOSTRACION}</p>
      <article>
        <h1>{articulo.titulo}</h1>
        <img
          src={hrefDeDestino(articulo.imagen)}
          alt={articulo.textoAlternativoImagen}
          width={1600}
          height={900}
          loading="lazy"
          decoding="async"
        />
        {minutos !== null && <div>{formatearTiempoDeLectura(minutos)}</div>}
        <CuerpoArticulo cuerpo={articulo.cuerpo} />
      </article>
      <CierreArticulo />
      <BloqueSigueLeyendo relacionados={relacionados} />
    </>
  )
}

interface PaginaBlogProps {
  /** Catálogo de demo a mostrar. Por defecto, el catálogo real del proyecto. */
  catalogo?: readonly ArticuloDemo[]
}

/** Subpágina "/blog": listado filtrable por categoría y vista de artículo en "/blog/:identificador". */
export function PaginaBlog({ catalogo: catalogoDemo = ARTICULOS_DEMO }: PaginaBlogProps = {}): React.JSX.Element {
  const catalogo = construirCatalogoBlog(catalogoDemo)
  const { identificador } = useParams<{ identificador?: string }>()
  const [searchParams, setSearchParams] = useSearchParams()

  return (
    <main id="contenido-principal" className={styles.pagina} data-contenedor-principal>
      <MetadatosPagina
        metadatos={identificador === undefined ? METADATOS_BLOG : METADATOS_ARTICULO_BLOG}
        datosEstructurados={DATOS_ESTRUCTURADOS_NEGOCIO}
      />
      {identificador === undefined ? (
        <VistaListado catalogo={catalogo} searchParams={searchParams} setSearchParams={setSearchParams} />
      ) : (
        <VistaArticulo catalogo={catalogo} identificador={identificador} categoriaParam={searchParams.get('categoria')} />
      )}
    </main>
  )
}
