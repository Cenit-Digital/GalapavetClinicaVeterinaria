import React, { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router'
import { CATEGORIAS_TIENDA, PRODUCTOS_DEMO, type ProductoDemo } from '../data/tienda'
import {
  alcanzoTopeUnidades,
  anadirUnidad,
  calcularResumenCesta,
  construirCatalogoTienda,
  elementoTrasAtraparFoco,
  eliminarLinea,
  filtrarProductosPorCategoria,
  formatearContadorArticulos,
  formatearImporte,
  nombreAccesibleBotonAnadir,
  quitarUnidad,
  rotuloBotonAnadir,
  vaciarCesta,
  type EstadoCesta,
  type ResumenCesta,
} from './PaginaTienda-logica'

/**
 * Construye el catálogo sin dejar que un dato inválido (categoría no
 * publicada, importe inválido) reviente el árbol de render: falla cerrado a
 * "sin productos" en vez de propagar la excepción hacia arriba (@s16/@s17),
 * mismo patrón que `CampanasPortada.tsx`.
 */
function construirCatalogoSeguro(catalogo: readonly ProductoDemo[]): ProductoDemo[] {
  try {
    return construirCatalogoTienda(catalogo)
  } catch {
    return []
  }
}

const AVISO_DEMOSTRACION =
  'Demostración: los productos y los precios de esta tienda son de ejemplo, no reales. Galapavet no publica todavía su catálogo ni sus precios. Esta página no procesa ningún pago, no envía ningún pedido y la cesta se borra al recargar.'
const AVISO_CATEGORIA_VACIA = 'No hay productos de ejemplo en esta categoría.'
const AVISO_CATALOGO_VACIO = 'No hay ningún producto de ejemplo en el catálogo.'

/**
 * Ningún importe de esta página se rotula como precio real (@s3): todo
 * importe visible empieza literalmente por uno de estos tres prefijos.
 */
const PREFIJO_IMPORTE = 'Importe de ejemplo'
const PREFIJO_SUBTOTAL = 'Subtotal de ejemplo'
const PREFIJO_TOTAL = 'Total de ejemplo'

/** Etiqueta de importe con su prefijo de demostración: `"<prefijo>: <importe formateado>"`. */
function etiquetaImporte(prefijo: string, centimos: number): string {
  return `${prefijo}: ${formatearImporte(centimos)}`
}

const ETIQUETA_TODOS = 'Todos'
const NOMBRES_FILTROS: readonly string[] = [ETIQUETA_TODOS, ...CATEGORIAS_TIENDA]

interface FiltroCategoriasProps {
  categoriaActiva: string | null
  onSeleccionar: (categoria: string | null) => void
}

function FiltroCategorias({ categoriaActiva, onSeleccionar }: FiltroCategoriasProps): React.JSX.Element {
  return (
    <fieldset aria-label="Filtrar por categoría">
      {NOMBRES_FILTROS.map((nombre) => {
        const categoria = nombre === ETIQUETA_TODOS ? null : nombre
        return (
          <button
            key={nombre}
            type="button"
            aria-pressed={categoriaActiva === categoria}
            onClick={() => onSeleccionar(categoria)}
          >
            {nombre}
          </button>
        )
      })}
    </fieldset>
  )
}

interface TarjetaProductoProps {
  producto: ProductoDemo
  cantidadEnCesta: number
  onAnadir: (identificador: string) => void
}

function TarjetaProducto({ producto, cantidadEnCesta, onAnadir }: TarjetaProductoProps): React.JSX.Element {
  return (
    <li>
      <img src={producto.imagen} alt="" />
      <h2>{producto.nombre}</h2>
      <p>{producto.categoria}</p>
      <p>{etiquetaImporte(PREFIJO_IMPORTE, producto.importeCentimos)}</p>
      <button
        type="button"
        aria-label={nombreAccesibleBotonAnadir(producto.nombre, cantidadEnCesta)}
        onClick={() => onAnadir(producto.nombre)}
      >
        {rotuloBotonAnadir(cantidadEnCesta)}
      </button>
    </li>
  )
}

interface RejillaProductosProps {
  productos: readonly ProductoDemo[]
  catalogoVacio: boolean
  cesta: EstadoCesta
  onAnadir: (identificador: string) => void
}

function RejillaProductos({ productos, catalogoVacio, cesta, onAnadir }: RejillaProductosProps): React.JSX.Element {
  if (catalogoVacio) {
    return <p>{AVISO_CATALOGO_VACIO}</p>
  }
  if (productos.length === 0) {
    return <p>{AVISO_CATEGORIA_VACIA}</p>
  }
  return (
    <ul>
      {productos.map((producto) => {
        const linea = cesta.find((candidata) => candidata.identificador === producto.nombre)
        return (
          <TarjetaProducto
            key={producto.nombre}
            producto={producto}
            cantidadEnCesta={linea?.cantidad ?? 0}
            onAnadir={onAnadir}
          />
        )
      })}
    </ul>
  )
}

const NOMBRE_DIALOGO_CESTA = 'Tu cesta'
const AVISO_CESTA_VACIA =
  'Todavía no has añadido nada. Elige productos del catálogo y aquí verás el resumen para consultarlo en la clínica.'
const DESTINO_CONSULTA_CLINICA = '/#contacto'

/** Los dos tipos de control focusable que existen dentro de `PanelCesta` (@s39/@s40, atrapa-foco). */
const SELECTOR_ENFOCABLE_DEL_DIALOGO = 'button, a[href]'

interface PanelCestaProps {
  resumen: ResumenCesta
  onCerrar: () => void
  onAnadirUnaUnidad: (identificador: string) => void
  onQuitarUnaUnidad: (identificador: string) => void
  onEliminarLinea: (identificador: string) => void
  onVaciar: () => void
}

function PanelCesta({
  resumen,
  onCerrar,
  onAnadirUnaUnidad,
  onQuitarUnaUnidad,
  onEliminarLinea,
  onVaciar,
}: PanelCestaProps): React.JSX.Element {
  const idTitulo = useId()
  const refDialogo = useRef<HTMLDialogElement>(null)
  const cestaVacia = resumen.lineas.length === 0

  useEffect(() => {
    refDialogo.current?.focus()

    function alPulsarTecla(evento: KeyboardEvent): void {
      if (evento.key === 'Escape') {
        onCerrar()
        return
      }
      const dialogo = refDialogo.current
      if (evento.key === 'Tab' && dialogo !== null) {
        const elementosFocusables = Array.from(dialogo.querySelectorAll<HTMLElement>(SELECTOR_ENFOCABLE_DEL_DIALOGO))
        const destino = elementoTrasAtraparFoco(elementosFocusables, document.activeElement, evento.shiftKey)
        if (destino !== null) {
          evento.preventDefault()
          destino.focus()
        }
      }
    }
    document.addEventListener('keydown', alPulsarTecla)
    return () => document.removeEventListener('keydown', alPulsarTecla)
  }, [onCerrar])

  return (
    <dialog open aria-modal="true" aria-labelledby={idTitulo} tabIndex={-1} ref={refDialogo}>
      <h2 id={idTitulo}>{NOMBRE_DIALOGO_CESTA}</h2>
      {cestaVacia ? (
        <p>{AVISO_CESTA_VACIA}</p>
      ) : (
        <ul>
          {resumen.lineas.map((linea) => (
            <li key={linea.identificador}>
              <p>{linea.nombre}</p>
              <p>{linea.cantidad}</p>
              <p>{etiquetaImporte(PREFIJO_SUBTOTAL, linea.subtotalCentimos)}</p>
              <button
                type="button"
                aria-label={`Quitar una unidad de ${linea.nombre}`}
                onClick={() => onQuitarUnaUnidad(linea.identificador)}
              >
                −
              </button>
              <button
                type="button"
                aria-label={`Añadir una unidad de ${linea.nombre}`}
                aria-disabled={alcanzoTopeUnidades(linea.cantidad)}
                onClick={() => onAnadirUnaUnidad(linea.identificador)}
              >
                +
              </button>
              <button
                type="button"
                aria-label={`Eliminar ${linea.nombre} de la cesta`}
                onClick={() => onEliminarLinea(linea.identificador)}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
      {!cestaVacia && (
        <button type="button" onClick={onVaciar}>
          Vaciar la cesta
        </button>
      )}
      <p>{etiquetaImporte(PREFIJO_TOTAL, resumen.totalCentimos)}</p>
      <Link to={DESTINO_CONSULTA_CLINICA} aria-disabled={cestaVacia}>
        Consultar disponibilidad en la clínica
      </Link>
    </dialog>
  )
}

interface BotonCestaProps {
  numeroDeArticulos: number
  onClick: () => void
}

const BotonCesta = React.forwardRef<HTMLButtonElement, BotonCestaProps>(function BotonCesta(
  { numeroDeArticulos, onClick },
  ref,
) {
  const contador = formatearContadorArticulos(numeroDeArticulos)
  return (
    <>
      <output>{contador}</output>
      <button type="button" ref={ref} onClick={onClick}>
        {`Ver la cesta, ${contador}`}
      </button>
    </>
  )
})

interface PaginaTiendaProps {
  /** Catálogo de demo a mostrar. Por defecto, el catálogo real del proyecto. */
  catalogo?: readonly ProductoDemo[]
}

/** Subpágina "/tienda": catálogo de demostración, filtros por categoría real y cesta local. */
export function PaginaTienda({ catalogo: catalogoDemo = PRODUCTOS_DEMO }: PaginaTiendaProps = {}): React.JSX.Element {
  const idAviso = useId()
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null)
  const [cesta, setCesta] = useState<EstadoCesta>([])
  const [panelAbierto, setPanelAbierto] = useState(false)
  const refBotonCesta = useRef<HTMLButtonElement>(null)
  const catalogo = construirCatalogoSeguro(catalogoDemo)
  const productosFiltrados = filtrarProductosPorCategoria(catalogo, categoriaActiva)
  const resumen = calcularResumenCesta(cesta, catalogo)

  function anadirProducto(identificador: string): void {
    setCesta((estadoPrevio) => anadirUnidad(estadoPrevio, identificador))
  }

  function quitarProducto(identificador: string): void {
    setCesta((estadoPrevio) => quitarUnidad(estadoPrevio, identificador))
  }

  function eliminarProducto(identificador: string): void {
    setCesta((estadoPrevio) => eliminarLinea(estadoPrevio, identificador))
  }

  function vaciarProductos(): void {
    setCesta(vaciarCesta())
  }

  function cerrarPanel(): void {
    setPanelAbierto(false)
    refBotonCesta.current?.focus()
  }

  return (
    <main>
      <h1>Tienda</h1>
      <p id={idAviso}>{AVISO_DEMOSTRACION}</p>
      <section aria-label="Catálogo" aria-describedby={idAviso}>
        <FiltroCategorias categoriaActiva={categoriaActiva} onSeleccionar={setCategoriaActiva} />
        <RejillaProductos
          productos={productosFiltrados}
          catalogoVacio={catalogo.length === 0}
          cesta={cesta}
          onAnadir={anadirProducto}
        />
      </section>
      <BotonCesta ref={refBotonCesta} numeroDeArticulos={resumen.numeroDeArticulos} onClick={() => setPanelAbierto(true)} />
      {panelAbierto && (
        <PanelCesta
          resumen={resumen}
          onCerrar={cerrarPanel}
          onAnadirUnaUnidad={anadirProducto}
          onQuitarUnaUnidad={quitarProducto}
          onEliminarLinea={eliminarProducto}
          onVaciar={vaciarProductos}
        />
      )}
    </main>
  )
}
