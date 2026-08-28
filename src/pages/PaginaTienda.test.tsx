import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ProductoDemo } from '../data/tienda'
import { PRODUCTOS_DEMO } from '../data/tienda'
import { PaginaTienda } from './PaginaTienda'

// TEXTO REAL de los dos ficheros que las pruebas de "rediseno_visual @s38" leen
// con "?raw" (patrón ya establecido en `src/lib/diseno/tokensColor.test.ts`):
// nunca se aserta contra el símbolo importado de producción, sino contra el
// contenido del fichero tal cual está en disco (doble anclaje).
const TEXTO_MODULO_TIENDA = Object.values(
  import.meta.glob('./PaginaTienda.module.scss', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>,
)[0] as string

const TEXTO_DATOS_TIENDA = Object.values(
  import.meta.glob('../data/tienda.ts', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>,
)[0] as string

/**
 * Extrae el contenido (sin llaves) del primer bloque `selector { ... }` que
 * aparece en `texto`. Solo sirve para bloques SIN llaves anidadas dentro
 * (ningún selector de "PaginaTienda.module.scss" que estas pruebas inspeccionan
 * anida un segundo nivel): busca la primera `{` tras el selector y la primera
 * `}` tras esa apertura.
 */
function contenidoDelBloque(texto: string, selector: string): string {
  const indiceSelector = texto.indexOf(selector)
  if (indiceSelector === -1) {
    throw new Error(`No se encontró el selector "${selector}" en el texto real`)
  }
  const indiceApertura = texto.indexOf('{', indiceSelector)
  const indiceCierre = texto.indexOf('}', indiceApertura)
  return texto.slice(indiceApertura + 1, indiceCierre)
}

interface ProductoLiteral {
  readonly nombre: string
  readonly categoria: string
  readonly importeCentimos: number
}

/**
 * Extrae, EN ORDEN, los tres campos de cada producto del TEXTO REAL de
 * "../data/tienda.ts" (doble anclaje: no importa `PRODUCTOS_DEMO`, relee el
 * fichero fuente carácter a carácter).
 */
function productosDeclaradosEnElTexto(textoFuente: string): ProductoLiteral[] {
  const patronProducto = /nombre:\s*'([^']*)',\s*categoria:\s*'([^']*)',\s*importeCentimos:\s*(\d+),/g
  const productos: ProductoLiteral[] = []
  let coincidencia = patronProducto.exec(textoFuente)
  while (coincidencia !== null) {
    productos.push({
      nombre: coincidencia[1] as string,
      categoria: coincidencia[2] as string,
      importeCentimos: Number(coincidencia[3]),
    })
    coincidencia = patronProducto.exec(textoFuente)
  }
  return productos
}

/** Formatea céntimos a "X,YY €", escrito a mano en el test (nunca `formatearImporte` de producción). */
function formatearImporteLiteral(centimos: number): string {
  const euros = Math.floor(centimos / 100)
  const centavosDeRelleno = 2
  const centavos = String(centimos % 100).padStart(centavosDeRelleno, '0')
  return `${euros},${centavos} €`
}

interface RenderizarPaginaTiendaOpciones {
  catalogo?: readonly ProductoDemo[]
}

/** Monta `PaginaTienda` en aislamiento, con el `BrowserRouter` que sus enlaces internos necesitan. */
function renderizarPaginaTienda(opciones: RenderizarPaginaTiendaOpciones = {}): ReturnType<typeof render> {
  const arbol: React.JSX.Element = (
    <BrowserRouter>{opciones.catalogo === undefined ? <PaginaTienda /> : <PaginaTienda catalogo={opciones.catalogo} />}</BrowserRouter>
  )
  return render(arbol)
}

/** El catálogo real, con el nombre del producto indicado vaciado (mismo resto de campos). Mismo patrón que `PaginaCampanas.test.tsx`. */
function catalogoConNombreVaciado(nombreAVaciar: string): ProductoDemo[] {
  return PRODUCTOS_DEMO.map((producto) => (producto.nombre === nombreAVaciar ? { ...producto, nombre: '' } : producto))
}

const AVISO_DEMOSTRACION =
  'Demostración: los productos y los precios de esta tienda son de ejemplo, no reales. Galapavet no publica todavía su catálogo ni sus precios. Esta página no procesa ningún pago, no envía ningún pedido y la cesta se borra al recargar.'

beforeEach(() => {
  window.history.pushState(null, '', '/tienda')
})

const CADENAS_DE_PAGO_PROHIBIDAS = ['Pagar', 'Comprar', 'Finalizar compra', 'Tramitar pedido', 'Pasarela', 'Tarjeta', 'PayPal', 'Redsys', 'Stripe']

describe('@s2 no hay pasarela de pago ni forma alguna de comprar', () => {
  it('sin formularios, sin campos de tarjeta, sin cadenas de pago y sin controles "pagar"/"comprar"', () => {
    renderizarPaginaTienda()

    expect(document.querySelectorAll('form')).toHaveLength(0)
    expect(document.querySelectorAll('input')).toHaveLength(0)

    const texto = document.body.textContent ?? ''
    for (const cadena of CADENAS_DE_PAGO_PROHIBIDAS) {
      expect(texto).not.toContain(cadena)
    }

    const controles = [...screen.queryAllByRole('button'), ...screen.queryAllByRole('link')]
    for (const control of controles) {
      const nombre = (control.getAttribute('aria-label') ?? control.textContent ?? '').toLowerCase()
      expect(nombre).not.toContain('pagar')
      expect(nombre).not.toContain('comprar')
    }
  })
})

describe('@s6 los filtros son las cuatro categorías publicadas por el cliente, más el control "Todos"', () => {
  it('el grupo "Filtrar por categoría" contiene exactamente 5 controles, en este orden', () => {
    renderizarPaginaTienda()

    const grupo = screen.getByRole('group', { name: 'Filtrar por categoría' })
    const controles = within(grupo).getAllByRole('button')
    expect(controles).toHaveLength(5)
    expect(controles.map((control) => control.textContent)).toEqual(['Todos', 'Piensos', 'Paseo', 'Descanso', 'Juegos'])
  })
})

const CATEGORIAS_INVENTADAS_DEL_PROTOTIPO = ['Alimentación', 'Dietas veterinarias', 'Antiparasitarios', 'Higiene', 'Accesorios']

describe('@s7 ninguna categoría inventada por el prototipo sobrevive', () => {
  it('el texto no contiene ninguna categoría inventada y no hay ningún filtro con nombre distinto de los 5', () => {
    renderizarPaginaTienda()

    const texto = document.body.textContent ?? ''
    for (const cadena of CATEGORIAS_INVENTADAS_DEL_PROTOTIPO) {
      expect(texto).not.toContain(cadena)
    }

    const grupo = screen.getByRole('group', { name: 'Filtrar por categoría' })
    const nombres = within(grupo)
      .getAllByRole('button')
      .map((control) => control.textContent)
    for (const nombre of nombres) {
      expect(['Todos', 'Piensos', 'Paseo', 'Descanso', 'Juegos']).toContain(nombre)
    }
  })
})

describe('@s8 al cargar la página el filtro activo es "Todos" y se ven las ocho tarjetas', () => {
  it('aria-pressed "true" en Todos, "false" en el resto, y 8 tarjetas en la rejilla', () => {
    renderizarPaginaTienda()

    const grupo = screen.getByRole('group', { name: 'Filtrar por categoría' })
    expect(within(grupo).getByRole('button', { name: 'Todos' })).toHaveAttribute('aria-pressed', 'true')
    for (const nombre of ['Piensos', 'Paseo', 'Descanso', 'Juegos']) {
      expect(within(grupo).getByRole('button', { name: nombre })).toHaveAttribute('aria-pressed', 'false')
    }

    expect(screen.getAllByRole('listitem')).toHaveLength(8)
  })
})

describe('@s9 filtrar por una categoría reduce la rejilla a esa categoría', () => {
  it('pulsar "Descanso" deja 2 tarjetas, marca aria-pressed y desmarca las demás', async () => {
    const usuario = userEvent.setup()
    renderizarPaginaTienda()

    const grupo = screen.getByRole('group', { name: 'Filtrar por categoría' })
    await usuario.click(within(grupo).getByRole('button', { name: 'Descanso' }))

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getAllByRole('heading', { level: 2 }).map((encabezado) => encabezado.textContent)).toEqual([
      'Cama de ejemplo talla M',
      'Manta de ejemplo de 60 × 40 cm',
    ])
    expect(within(grupo).getByRole('button', { name: 'Descanso' })).toHaveAttribute('aria-pressed', 'true')
    for (const nombre of ['Todos', 'Piensos', 'Paseo', 'Juegos']) {
      expect(within(grupo).getByRole('button', { name: nombre })).toHaveAttribute('aria-pressed', 'false')
    }
  })
})

describe('@s13 cada tarjeta declara su producto y su categoría real', () => {
  it('8 encabezados h2 con el nombre del producto y los pares producto/categoría en orden', () => {
    renderizarPaginaTienda()

    const encabezados = screen.getAllByRole('heading', { level: 2 })
    expect(encabezados.map((encabezado) => encabezado.textContent)).toEqual([
      'Pienso de ejemplo para perro adulto · 3 kg',
      'Pienso de ejemplo para gato esterilizado · 1,5 kg',
      'Arnés de ejemplo talla M',
      'Correa de ejemplo de 2 m',
      'Cama de ejemplo talla M',
      'Manta de ejemplo de 60 × 40 cm',
      'Mordedor de ejemplo de caucho',
      'Pelota de ejemplo con sonido',
    ])

    const tarjetas = screen.getAllByRole('listitem')
    const categoriasMostradas = tarjetas.map((tarjeta) => within(tarjeta).getByText(/Piensos|Paseo|Descanso|Juegos/).textContent)
    expect(categoriasMostradas).toEqual(['Piensos', 'Piensos', 'Paseo', 'Paseo', 'Descanso', 'Descanso', 'Juegos', 'Juegos'])

    for (const encabezado of encabezados) {
      expect(encabezado.textContent).toContain('de ejemplo')
    }
  })
})

describe('@s14 cada tarjeta muestra su importe de ejemplo con el formato fijado', () => {
  it('los ocho nombres accesibles de importe son, en este orden, "Importe de ejemplo: X €"', () => {
    renderizarPaginaTienda()

    const importes = screen.getAllByText(/^Importe de ejemplo: /)
    expect(importes.map((elemento) => elemento.textContent)).toEqual([
      'Importe de ejemplo: 12,50 €',
      'Importe de ejemplo: 9,95 €',
      'Importe de ejemplo: 18,75 €',
      'Importe de ejemplo: 7,05 €',
      'Importe de ejemplo: 24,99 €',
      'Importe de ejemplo: 6,30 €',
      'Importe de ejemplo: 4,45 €',
      'Importe de ejemplo: 3,15 €',
    ])
  })
})

describe('@s5 ninguna imagen de la página se pide a un tercero', () => {
  it('exactamente 8 imágenes de producto, origen local, sin "pexels" y con alt vacío', () => {
    renderizarPaginaTienda()

    const imagenes = document.querySelectorAll('img')
    expect(imagenes).toHaveLength(8)
    for (const imagen of imagenes) {
      const origen = imagen.getAttribute('src') ?? ''
      expect(origen).not.toContain('http://')
      expect(origen).not.toContain('https://')
      expect(origen).not.toContain('pexels')
      expect(imagen).toHaveAttribute('alt', '')
    }
  })
})

describe('@s15 un producto de demostración sin nombre se descarta y el resto se sigue mostrando', () => {
  it('quedan 7 tarjetas, ninguna con nombre accesible vacío ni importe sin nombre de producto', () => {
    renderizarPaginaTienda({ catalogo: catalogoConNombreVaciado('Cama de ejemplo talla M') })

    const tarjetas = screen.getAllByRole('listitem')
    expect(tarjetas).toHaveLength(7)

    const encabezados = screen.getAllByRole('heading', { level: 2 })
    expect(encabezados).toHaveLength(7)
    for (const encabezado of encabezados) {
      expect(encabezado.textContent).not.toBe('')
    }

    for (const tarjeta of tarjetas) {
      const encabezado = within(tarjeta).getByRole('heading', { level: 2 })
      expect(encabezado.textContent).not.toBe('')
    }
  })
})

/** Localiza la tarjeta de un producto por el texto de su h2. */
function tarjetaDelProducto(nombreProducto: string): HTMLElement {
  const encabezado = screen.getByRole('heading', { level: 2, name: nombreProducto })
  return encabezado.closest('li') as HTMLElement
}

/** Localiza la línea de cesta de un producto, dentro del panel, por su texto. */
function lineaDeCesta(panel: HTMLElement, nombreProducto: string): HTMLElement {
  const texto = within(panel).getByText(nombreProducto)
  return texto.closest('li') as HTMLElement
}

describe('@s19 añadir un producto crea su línea con una unidad y actualiza el total', () => {
  it('pulsar "Añadir" en una tarjeta actualiza el contador del botón de la cesta, y no abre ningún diálogo', async () => {
    const usuario = userEvent.setup()
    renderizarPaginaTienda()

    const tarjeta = tarjetaDelProducto('Cama de ejemplo talla M')
    await usuario.click(within(tarjeta).getByRole('button', { name: 'Añadir Cama de ejemplo talla M a la cesta' }))

    expect(screen.getByRole('button', { name: 'Ver la cesta, 1 artículo' })).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

/** Abre el panel de la cesta pulsando su botón (nombre accesible variable según el contador). */
async function abrirPanelDeCesta(usuario: ReturnType<typeof userEvent.setup>): Promise<HTMLElement> {
  await usuario.click(screen.getByRole('button', { name: /^Ver la cesta,/ }))
  return screen.getByRole('dialog', { name: 'Tu cesta' })
}

/** Pulsa "Añadir" (o "Añadir otra unidad...") en la tarjeta del producto indicado, tantas veces como `veces`. */
async function anadirDesdeLaTarjeta(usuario: ReturnType<typeof userEvent.setup>, nombreProducto: string, veces: number): Promise<void> {
  const tarjeta = tarjetaDelProducto(nombreProducto)
  for (let contador = 0; contador < veces; contador += 1) {
    // eslint-disable-next-line no-await-in-loop -- las unidades se añaden en serie a propósito, cada clic depende del estado dejado por el anterior
    await usuario.click(within(tarjeta).getByRole('button', { name: new RegExp(`^Añadir`) }))
  }
}

describe('@s21 el total de varias líneas es la suma de todos los subtotales', () => {
  it('3 líneas, con sus 3 subtotales y el total correctos, y el contador del botón de la cesta', async () => {
    const usuario = userEvent.setup()
    renderizarPaginaTienda()

    await anadirDesdeLaTarjeta(usuario, 'Pienso de ejemplo para perro adulto · 3 kg', 3)
    await anadirDesdeLaTarjeta(usuario, 'Mordedor de ejemplo de caucho', 2)
    await anadirDesdeLaTarjeta(usuario, 'Manta de ejemplo de 60 × 40 cm', 1)

    const panel = await abrirPanelDeCesta(usuario)

    expect(within(panel).getAllByRole('listitem')).toHaveLength(3)
    expect(within(panel).getByText('Subtotal de ejemplo: 37,50 €', { collapseWhitespace: false })).toBeInTheDocument()
    expect(within(panel).getByText('Subtotal de ejemplo: 8,90 €', { collapseWhitespace: false })).toBeInTheDocument()
    expect(within(panel).getByText('Subtotal de ejemplo: 6,30 €', { collapseWhitespace: false })).toBeInTheDocument()
    expect(within(panel).getByText('Total de ejemplo: 52,70 €', { collapseWhitespace: false })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ver la cesta, 6 artículos' })).toBeInTheDocument()
  })
})

describe('@s24 aumentar una unidad recalcula el subtotal de la línea y el total', () => {
  it('pulsar "Añadir una unidad de..." sube la cantidad, su subtotal y el total, sin tocar la otra línea', async () => {
    const usuario = userEvent.setup()
    renderizarPaginaTienda()

    await anadirDesdeLaTarjeta(usuario, 'Correa de ejemplo de 2 m', 2)
    await anadirDesdeLaTarjeta(usuario, 'Cama de ejemplo talla M', 1)

    const panel = await abrirPanelDeCesta(usuario)
    await usuario.click(within(panel).getByRole('button', { name: 'Añadir una unidad de Correa de ejemplo de 2 m' }))

    const lineaCorrea = lineaDeCesta(panel, 'Correa de ejemplo de 2 m')
    expect(within(lineaCorrea).getByText('3')).toBeInTheDocument()
    expect(within(lineaCorrea).getByText('Subtotal de ejemplo: 21,15 €', { collapseWhitespace: false })).toBeInTheDocument()
    expect(within(panel).getByText('Subtotal de ejemplo: 24,99 €', { collapseWhitespace: false })).toBeInTheDocument()
    expect(within(panel).getByText('Total de ejemplo: 46,14 €', { collapseWhitespace: false })).toBeInTheDocument()
  })
})

describe('@s25 quitar una unidad recalcula el subtotal de la línea y el total', () => {
  it('pulsar "Quitar una unidad de..." baja la cantidad, el subtotal y el total, sin eliminar la línea', async () => {
    const usuario = userEvent.setup()
    renderizarPaginaTienda()

    await anadirDesdeLaTarjeta(usuario, 'Correa de ejemplo de 2 m', 3)
    await anadirDesdeLaTarjeta(usuario, 'Cama de ejemplo talla M', 1)

    const panel = await abrirPanelDeCesta(usuario)
    await usuario.click(within(panel).getByRole('button', { name: 'Quitar una unidad de Correa de ejemplo de 2 m' }))

    const lineaCorrea = lineaDeCesta(panel, 'Correa de ejemplo de 2 m')
    expect(within(lineaCorrea).getByText('2')).toBeInTheDocument()
    expect(within(lineaCorrea).getByText('Subtotal de ejemplo: 14,10 €', { collapseWhitespace: false })).toBeInTheDocument()
    expect(within(panel).getByText('Total de ejemplo: 39,09 €', { collapseWhitespace: false })).toBeInTheDocument()
    expect(within(panel).getAllByRole('listitem')).toHaveLength(2)
  })
})

describe('@s26 quitar una unidad cuando solo queda una elimina la línea entera', () => {
  it('la línea desaparece del todo, la otra sigue intacta y ninguna línea muestra cantidad 0', async () => {
    const usuario = userEvent.setup()
    renderizarPaginaTienda()

    await anadirDesdeLaTarjeta(usuario, 'Mordedor de ejemplo de caucho', 1)
    await anadirDesdeLaTarjeta(usuario, 'Manta de ejemplo de 60 × 40 cm', 2)

    const panel = await abrirPanelDeCesta(usuario)
    await usuario.click(within(panel).getByRole('button', { name: 'Quitar una unidad de Mordedor de ejemplo de caucho' }))

    expect(within(panel).getAllByRole('listitem')).toHaveLength(1)
    expect(within(panel).queryByText('Mordedor de ejemplo de caucho')).not.toBeInTheDocument()
    expect(within(panel).queryByText('0')).not.toBeInTheDocument()
    expect(within(panel).getByText('Total de ejemplo: 12,60 €', { collapseWhitespace: false })).toBeInTheDocument()
  })
})

describe('@s27 la cantidad por línea no pasa de 99', () => {
  it('en el tope, "Añadir una unidad" queda aria-disabled y la cantidad se queda en 99', async () => {
    // delay: null evita la espera artificial entre pulsaciones de userEvent: aquí se
    // simulan 99 clics reales, uno a uno, y el test debe terminar en tiempo razonable.
    const usuario = userEvent.setup({ delay: null })
    renderizarPaginaTienda()

    await anadirDesdeLaTarjeta(usuario, 'Pienso de ejemplo para perro adulto · 3 kg', 99)

    const panel = await abrirPanelDeCesta(usuario)
    const botonAnadir = within(panel).getByRole('button', { name: 'Añadir una unidad de Pienso de ejemplo para perro adulto · 3 kg' })
    await usuario.click(botonAnadir)

    const linea = lineaDeCesta(panel, 'Pienso de ejemplo para perro adulto · 3 kg')
    expect(within(linea).getByText('99')).toBeInTheDocument()
    expect(within(linea).getByText('Subtotal de ejemplo: 1237,50 €', { collapseWhitespace: false })).toBeInTheDocument()
    expect(within(panel).getByText('Total de ejemplo: 1237,50 €', { collapseWhitespace: false })).toBeInTheDocument()
    expect(botonAnadir).toHaveAttribute('aria-disabled', 'true')
  }, 20000)
})

describe('@s28 los controles de cantidad identifican su producto y no se repiten entre líneas', () => {
  it('sin dos controles con el mismo nombre accesible, y con el nombre del producto en cada uno', async () => {
    const usuario = userEvent.setup()
    renderizarPaginaTienda()

    await anadirDesdeLaTarjeta(usuario, 'Arnés de ejemplo talla M', 1)
    await anadirDesdeLaTarjeta(usuario, 'Correa de ejemplo de 2 m', 1)

    const panel = await abrirPanelDeCesta(usuario)
    const controles = within(panel).getAllByRole('button')
    const nombres = controles.map((control) => control.getAttribute('aria-label') ?? control.textContent)
    expect(new Set(nombres).size).toBe(nombres.length)

    expect(
      within(panel).getByRole('button', { name: 'Quitar una unidad de Arnés de ejemplo talla M' }),
    ).toBeInTheDocument()
    expect(
      within(panel).getByRole('button', { name: 'Añadir una unidad de Arnés de ejemplo talla M' }),
    ).toBeInTheDocument()
  })
})

describe('@s29 eliminar una línea la saca entera y deja intactas las demás', () => {
  it('la línea eliminada desaparece, la otra sigue, el total y el contador se actualizan', async () => {
    const usuario = userEvent.setup()
    renderizarPaginaTienda()

    await anadirDesdeLaTarjeta(usuario, 'Pelota de ejemplo con sonido', 4)
    await anadirDesdeLaTarjeta(usuario, 'Cama de ejemplo talla M', 1)

    const panel = await abrirPanelDeCesta(usuario)
    await usuario.click(within(panel).getByRole('button', { name: 'Eliminar Pelota de ejemplo con sonido de la cesta' }))

    expect(within(panel).getAllByRole('listitem')).toHaveLength(1)
    expect(within(panel).getByText('Subtotal de ejemplo: 24,99 €', { collapseWhitespace: false })).toBeInTheDocument()
    expect(within(panel).getByText('Total de ejemplo: 24,99 €', { collapseWhitespace: false })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ver la cesta, 1 artículo' })).toBeInTheDocument()
  })
})

describe('@s30 eliminar la única línea devuelve la cesta a su estado vacío', () => {
  it('0 líneas, aviso de cesta vacía, total 0,00 € y salida deshabilitada', async () => {
    const usuario = userEvent.setup()
    renderizarPaginaTienda()

    await anadirDesdeLaTarjeta(usuario, 'Manta de ejemplo de 60 × 40 cm', 5)

    const panel = await abrirPanelDeCesta(usuario)
    await usuario.click(within(panel).getByRole('button', { name: 'Eliminar Manta de ejemplo de 60 × 40 cm de la cesta' }))

    expect(within(panel).queryAllByRole('listitem')).toHaveLength(0)
    expect(
      within(panel).getByText(
        'Todavía no has añadido nada. Elige productos del catálogo y aquí verás el resumen para consultarlo en la clínica.',
      ),
    ).toBeInTheDocument()
    expect(within(panel).getByText('Total de ejemplo: 0,00 €', { collapseWhitespace: false })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ver la cesta, 0 artículos' })).toBeInTheDocument()
    expect(within(panel).getByRole('link', { name: 'Consultar disponibilidad en la clínica' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
  })
})

describe('@s31 vaciar la cesta borra todas las líneas de una vez', () => {
  it('0 líneas, total 0,00 €, sin "Vaciar la cesta" y el rótulo de las tarjetas vuelve a "Añadir"', async () => {
    const usuario = userEvent.setup()
    renderizarPaginaTienda()

    await anadirDesdeLaTarjeta(usuario, 'Pelota de ejemplo con sonido', 4)
    await anadirDesdeLaTarjeta(usuario, 'Cama de ejemplo talla M', 3)
    await anadirDesdeLaTarjeta(usuario, 'Arnés de ejemplo talla M', 2)

    const panel = await abrirPanelDeCesta(usuario)
    await usuario.click(within(panel).getByRole('button', { name: 'Vaciar la cesta' }))

    expect(within(panel).queryAllByRole('listitem')).toHaveLength(0)
    expect(within(panel).getByText('Total de ejemplo: 0,00 €', { collapseWhitespace: false })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ver la cesta, 0 artículos' })).toBeInTheDocument()
    expect(within(panel).queryByRole('button', { name: 'Vaciar la cesta' })).not.toBeInTheDocument()
    expect(within(tarjetaDelProducto('Pelota de ejemplo con sonido')).getByText('Añadir')).toBeInTheDocument()
  })
})

describe('@s18 la cesta arranca vacía, con su total a cero y sin acciones que no procedan', () => {
  it('mensaje de cesta vacía, 0 líneas, total "0,00 €", sin "Vaciar la cesta" y salida deshabilitada', async () => {
    const usuario = userEvent.setup()
    renderizarPaginaTienda()

    const panel = await abrirPanelDeCesta(usuario)

    expect(
      within(panel).getByText(
        'Todavía no has añadido nada. Elige productos del catálogo y aquí verás el resumen para consultarlo en la clínica.',
      ),
    ).toBeInTheDocument()
    expect(within(panel).queryAllByRole('listitem')).toHaveLength(0)
    expect(within(panel).getByText('Total de ejemplo: 0,00 €', { collapseWhitespace: false })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ver la cesta, 0 artículos' })).toBeInTheDocument()
    expect(within(panel).queryByRole('button', { name: 'Vaciar la cesta' })).not.toBeInTheDocument()
    expect(within(panel).getByRole('link', { name: 'Consultar disponibilidad en la clínica' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
  })
})

describe('@s20 añadir dos veces el mismo producto suma unidades en una sola línea', () => {
  it('el rótulo visible del botón pasa a contar las unidades, y el nombre accesible dice "otra unidad"', async () => {
    const usuario = userEvent.setup()
    renderizarPaginaTienda()

    const tarjeta = tarjetaDelProducto('Pienso de ejemplo para gato esterilizado · 1,5 kg')
    await usuario.click(
      within(tarjeta).getByRole('button', { name: 'Añadir Pienso de ejemplo para gato esterilizado · 1,5 kg a la cesta' }),
    )
    await usuario.click(
      within(tarjeta).getByRole('button', { name: 'Añadir otra unidad de Pienso de ejemplo para gato esterilizado · 1,5 kg, 1 en la cesta' }),
    )

    expect(within(tarjeta).getByText('En la cesta · 2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ver la cesta, 2 artículos' })).toBeInTheDocument()
  })
})

describe('@s22 el botón de la tarjeta refleja cuántas unidades hay ya en la cesta', () => {
  it('sin unidades, rótulo "Añadir"; con 1 unidad, rótulo "En la cesta · 1" y nombre accesible con "otra unidad"', async () => {
    const usuario = userEvent.setup()
    renderizarPaginaTienda()

    const tarjetaArnes = tarjetaDelProducto('Arnés de ejemplo talla M')
    await usuario.click(within(tarjetaArnes).getByRole('button', { name: 'Añadir Arnés de ejemplo talla M a la cesta' }))

    expect(within(tarjetaArnes).getByText('En la cesta · 1')).toBeInTheDocument()
    expect(
      within(tarjetaArnes).getByRole('button', { name: 'Añadir otra unidad de Arnés de ejemplo talla M, 1 en la cesta' }),
    ).toBeInTheDocument()

    const tarjetaCorrea = tarjetaDelProducto('Correa de ejemplo de 2 m')
    expect(within(tarjetaCorrea).getByText('Añadir')).toBeInTheDocument()
    expect(within(tarjetaCorrea).getByRole('button', { name: 'Añadir Correa de ejemplo de 2 m a la cesta' })).toBeInTheDocument()
  })
})

describe('@s23 el contador de la cesta se anuncia y singulariza correctamente', () => {
  it('una región de estado con "1 artículo" y el botón de la cesta también en singular', async () => {
    const usuario = userEvent.setup()
    renderizarPaginaTienda()

    const tarjeta = tarjetaDelProducto('Pelota de ejemplo con sonido')
    await usuario.click(within(tarjeta).getByRole('button', { name: 'Añadir Pelota de ejemplo con sonido a la cesta' }))

    const region = screen.getByRole('status')
    expect(region).toHaveTextContent('1 artículo')
    expect(region.textContent).not.toBe('1 artículos')
    expect(screen.getByRole('button', { name: 'Ver la cesta, 1 artículo' })).toBeInTheDocument()
  })
})

describe('@s10 una categoría real sin ningún producto de demostración muestra un estado vacío', () => {
  it('sin productos de "Juegos", pulsar ese filtro deja la rejilla vacía con el aviso exacto', async () => {
    const usuario = userEvent.setup()
    const catalogoSinJuegos = PRODUCTOS_DEMO.filter((producto) => producto.categoria !== 'Juegos')
    renderizarPaginaTienda({ catalogo: catalogoSinJuegos })

    const grupo = screen.getByRole('group', { name: 'Filtrar por categoría' })
    await usuario.click(within(grupo).getByRole('button', { name: 'Juegos' }))

    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    expect(screen.getByText('No hay productos de ejemplo en esta categoría.')).toBeInTheDocument()
    expect(within(grupo).getByRole('button', { name: 'Juegos' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(grupo).getAllByRole('button')).toHaveLength(5)
  })
})

describe('@s11 con el catálogo de demostración vacío se siguen ofreciendo las cuatro categorías del cliente', () => {
  it('rejilla vacía, aviso de catálogo vacío, 5 filtros y "Ver la cesta, 0 artículos"', () => {
    renderizarPaginaTienda({ catalogo: [] })

    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    expect(screen.getByText('No hay ningún producto de ejemplo en el catálogo.')).toBeInTheDocument()

    const grupo = screen.getByRole('group', { name: 'Filtrar por categoría' })
    expect(within(grupo).getAllByRole('button')).toHaveLength(5)

    expect(screen.getByRole('button', { name: 'Ver la cesta, 0 artículos' })).toBeInTheDocument()
  })
})

describe('@s16 un producto en una categoría no publicada hace fallar la construcción y no se renderiza ninguna tarjeta', () => {
  it('con un producto de categoría inválida, la rejilla no muestra ninguna tarjeta', () => {
    const catalogoCorrupto: ProductoDemo[] = [
      { nombre: 'Producto inválido', categoria: 'Antiparasitarios', importeCentimos: 100, imagen: '/img/x.webp' },
      ...PRODUCTOS_DEMO,
    ]

    renderizarPaginaTienda({ catalogo: catalogoCorrupto })

    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })
})

describe('@s17 un importe inválido en el catálogo hace fallar la construcción y no se renderiza ninguna tarjeta', () => {
  it('con un producto de importe negativo, la rejilla no muestra ninguna tarjeta', () => {
    const catalogoCorrupto: ProductoDemo[] = [
      { nombre: 'Producto inválido', categoria: 'Piensos', importeCentimos: -100, imagen: '/img/x.webp' },
      ...PRODUCTOS_DEMO,
    ]

    renderizarPaginaTienda({ catalogo: catalogoCorrupto })

    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })
})

describe('@s3 ningún importe de la página se presenta como un precio real', () => {
  it('todo importe visible empieza por "Importe/Subtotal/Total de ejemplo", sin "%" ni cadenas de precio real', async () => {
    const usuario = userEvent.setup()
    renderizarPaginaTienda()

    await anadirDesdeLaTarjeta(usuario, 'Cama de ejemplo talla M', 1)
    await abrirPanelDeCesta(usuario)

    const elementosConImporte = [...document.querySelectorAll('p')].filter((elemento) => elemento.textContent?.includes('€'))
    expect(elementosConImporte.length).toBeGreaterThan(0)
    for (const elemento of elementosConImporte) {
      const texto = elemento.textContent ?? ''
      const empiezaBien =
        texto.startsWith('Importe de ejemplo') || texto.startsWith('Subtotal de ejemplo') || texto.startsWith('Total de ejemplo')
      expect(empiezaBien).toBe(true)
    }

    const textoPagina = document.body.textContent ?? ''
    for (const cadena of ['Precio', 'PVP', 'Precio final', 'Total a pagar']) {
      expect(textoPagina).not.toContain(cadena)
    }
    expect(textoPagina).not.toContain('%')
    for (const cadena of ['Oferta', 'Descuento', 'Rebaja', 'IVA', 'gastos de envío']) {
      expect(textoPagina).not.toContain(cadena)
    }
  })
})

describe('@s4 la página no repite ninguna afirmación del prototipo heredado', () => {
  it('sin "24 h", sin reclamos comerciales ni de stock, con el panel de la cesta abierto', async () => {
    const usuario = userEvent.setup()
    renderizarPaginaTienda()

    await abrirPanelDeCesta(usuario)

    const texto = document.body.textContent ?? ''
    expect(texto).not.toContain('24 h')
    for (const cadena of ['Urgencias', 'Más vendido', 'Con receta', 'Campaña', 'Solo bajo prescripción']) {
      expect(texto).not.toContain(cadena)
    }
    for (const cadena of ['Solo vendemos lo que recetamos', 'Elegido por el equipo clínico', 'Envío gratuito', 'sin coste', 'Recogida en clínica']) {
      expect(texto).not.toContain(cadena)
    }
    for (const cadena of ['en stock', 'últimas unidades', 'plazo de entrega']) {
      expect(texto).not.toContain(cadena)
    }
  })
})

describe('@s12 cambiar de filtro no toca la cesta', () => {
  it('la rejilla cambia, pero la cesta y su total y contador siguen igual', async () => {
    const usuario = userEvent.setup()
    renderizarPaginaTienda()

    await anadirDesdeLaTarjeta(usuario, 'Pienso de ejemplo para perro adulto · 3 kg', 3)

    const grupo = screen.getByRole('group', { name: 'Filtrar por categoría' })
    await usuario.click(within(grupo).getByRole('button', { name: 'Juegos' }))

    expect(screen.getAllByRole('listitem')).toHaveLength(2)

    const panel = await abrirPanelDeCesta(usuario)
    expect(within(panel).getAllByRole('listitem')).toHaveLength(1)
    expect(within(panel).getByText('Total de ejemplo: 37,50 €', { collapseWhitespace: false })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ver la cesta, 3 artículos' })).toBeInTheDocument()
  })
})

describe('@s39 el panel de la cesta se abre como un diálogo modal con nombre accesible', () => {
  it('rol de diálogo, nombre "Tu cesta", aria-modal true, h2 "Tu cesta" y el foco dentro del diálogo', async () => {
    const usuario = userEvent.setup()
    renderizarPaginaTienda()

    await usuario.click(screen.getByRole('button', { name: 'Ver la cesta, 0 artículos' }))

    const dialogo = screen.getByRole('dialog', { name: 'Tu cesta' })
    expect(dialogo).toHaveAttribute('aria-modal', 'true')
    expect(within(dialogo).getByRole('heading', { level: 2 })).toHaveTextContent('Tu cesta')
    expect(dialogo).toContainElement(document.activeElement as HTMLElement)
  })
})

describe('@s39 refuerzo: el foco queda atrapado dentro del diálogo al tabular (patrón Modal Dialog WAI-ARIA APG)', () => {
  it('tabular repetidamente hacia delante y hacia atrás nunca saca el foco del diálogo', async () => {
    const usuario = userEvent.setup()
    renderizarPaginaTienda()

    await anadirDesdeLaTarjeta(usuario, 'Cama de ejemplo talla M', 1)
    const panel = await abrirPanelDeCesta(usuario)

    const numeroDeControlesFocusables = within(panel).getAllByRole('button').length + within(panel).getAllByRole('link').length
    const vueltasDeSobra = 2
    const numeroDeTabulaciones = numeroDeControlesFocusables + vueltasDeSobra

    for (let contador = 0; contador < numeroDeTabulaciones; contador += 1) {
      // eslint-disable-next-line no-await-in-loop -- cada tabulación depende del foco dejado por la anterior
      await usuario.tab()
      expect(panel).toContainElement(document.activeElement as HTMLElement)
    }

    for (let contador = 0; contador < numeroDeTabulaciones; contador += 1) {
      // eslint-disable-next-line no-await-in-loop -- cada tabulación depende del foco dejado por la anterior
      await usuario.tab({ shift: true })
      expect(panel).toContainElement(document.activeElement as HTMLElement)
    }
  })
})

describe('@s40 la tecla Escape cierra el panel y devuelve el foco al botón de la cesta', () => {
  it('el diálogo desaparece, el foco vuelve al botón, y su nombre accesible sigue anunciando lo mismo', async () => {
    const usuario = userEvent.setup()
    renderizarPaginaTienda()

    await anadirDesdeLaTarjeta(usuario, 'Cama de ejemplo talla M', 1)
    const botonCesta = screen.getByRole('button', { name: 'Ver la cesta, 1 artículo' })
    await usuario.click(botonCesta)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await usuario.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.activeElement).toBe(botonCesta)
    expect(screen.getByRole('button', { name: 'Ver la cesta, 1 artículo' })).toBeInTheDocument()
  })
})

describe('@s41 la única salida de la cesta es consultar en la clínica, y no envía nada', () => {
  it('destino exacto "/#contacto", aria-disabled "false" con cesta no vacía y ningún otro control de salida', async () => {
    const usuario = userEvent.setup()
    renderizarPaginaTienda()

    await anadirDesdeLaTarjeta(usuario, 'Mordedor de ejemplo de caucho', 2)
    const panel = await abrirPanelDeCesta(usuario)

    const enlace = within(panel).getByRole('link', { name: 'Consultar disponibilidad en la clínica' })
    expect(enlace).toHaveAttribute('aria-disabled', 'false')
    expect(enlace).toHaveAttribute('href', '/#contacto')

    expect(within(panel).getAllByRole('link')).toHaveLength(1)
  })
})

describe('@s42 la cesta no persiste y el aviso lo dice antes de que ocurra', () => {
  it('tras "recargar" (remontar la página), la cesta vuelve a 0 y no se escribió nada en el almacenamiento', async () => {
    const usuario = userEvent.setup()
    const espiaEscritura = vi.spyOn(Storage.prototype, 'setItem')
    const primeraVista = renderizarPaginaTienda()

    await anadirDesdeLaTarjeta(usuario, 'Pienso de ejemplo para perro adulto · 3 kg', 3)
    await anadirDesdeLaTarjeta(usuario, 'Mordedor de ejemplo de caucho', 2)
    expect(screen.getByRole('button', { name: 'Ver la cesta, 5 artículos' })).toBeInTheDocument()

    primeraVista.unmount()
    renderizarPaginaTienda()

    expect(screen.getByRole('button', { name: 'Ver la cesta, 0 artículos' })).toBeInTheDocument()
    expect(screen.getByText(AVISO_DEMOSTRACION)).toHaveTextContent('la cesta se borra al recargar')
    expect(espiaEscritura).not.toHaveBeenCalled()

    espiaEscritura.mockRestore()
  })
})

describe('@s1 la página se anuncia con su encabezado y lleva el aviso de demostración', () => {
  it('h1 "Tienda", región "Catálogo" con el aviso exacto como descripción accesible', () => {
    renderizarPaginaTienda()

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Tienda')

    const region = screen.getByRole('region', { name: 'Catálogo' })
    expect(region).toBeInTheDocument()

    expect(screen.getByText(AVISO_DEMOSTRACION)).toBeInTheDocument()

    const idDescripcion = region.getAttribute('aria-describedby')
    expect(idDescripcion).not.toBeNull()
    const descripcion = document.getElementById(idDescripcion as string)
    expect(descripcion).toHaveTextContent(AVISO_DEMOSTRACION)
  })
})

// =============================================================================
// rediseno_visual @s38 — "La tienda adopta el lenguaje visual del diseño sin
// cambiar su catálogo" (features/rediseno_visual.feature:585-592).
// =============================================================================

describe('rediseno_visual @s38 el encabezado de página lleva su cintillo delante del titular', () => {
  it('un párrafo "Catálogo" (no un encabezado) es el elemento inmediatamente anterior al "h1 Tienda"', () => {
    renderizarPaginaTienda()

    const encabezado = screen.getByRole('heading', { level: 1, name: 'Tienda' })
    const cintillo = screen.getByText('Catálogo')

    expect(cintillo.tagName).toBe('P')
    expect(screen.queryByRole('heading', { name: 'Catálogo' })).not.toBeInTheDocument()
    expect(encabezado.previousElementSibling).toBe(cintillo)
  })
})

describe('rediseno_visual @s38 el cintillo y el titular usan las escalas y mixins del sistema, con el ritmo del sistema', () => {
  it('el bloque ".cintillo", leído del TEXTO REAL de "PaginaTienda.module.scss", incluye "@include eyebrow;"', () => {
    const bloqueCintillo = contenidoDelBloque(TEXTO_MODULO_TIENDA, '.cintillo {')
    expect(bloqueCintillo).toContain('@include eyebrow;')
  })

  it('el bloque "h1", leído del TEXTO REAL de "PaginaTienda.module.scss", usa la fuente y el paso de la escala tipográfica del sistema', () => {
    const bloqueH1 = contenidoDelBloque(TEXTO_MODULO_TIENDA, 'h1 {')
    expect(bloqueH1).toContain('font-family: var(--fuente-titulares);')
    expect(bloqueH1).toContain('font-size: paso-tipografico(5);')
  })
})

describe('rediseno_visual @s38 cada tarjeta de producto usa el mismo patrón de tarjeta que la portada', () => {
  it('el bloque "li" del catálogo, leído del TEXTO REAL de "PaginaTienda.module.scss", incluye "@include tarjeta;"', () => {
    const bloqueLi = contenidoDelBloque(TEXTO_MODULO_TIENDA, 'li {')
    expect(bloqueLi).toContain('@include tarjeta;')
  })
})

describe('rediseno_visual @s38 la imagen de cada producto conserva su relación de aspecto y sus dimensiones declaradas', () => {
  it('el bloque "img" del catálogo, leído del TEXTO REAL de "PaginaTienda.module.scss", fija la relación de aspecto 4/3 con el mecanismo del sistema', () => {
    const bloqueImg = contenidoDelBloque(TEXTO_MODULO_TIENDA, 'img {')
    expect(bloqueImg).toContain('@include hueco-de-imagen(4, 3);')
  })

  it('las ocho imágenes del catálogo declaran 800×600 en el marcado real', () => {
    renderizarPaginaTienda()

    const imagenes = document.querySelectorAll('img')
    expect(imagenes).toHaveLength(8)
    for (const imagen of imagenes) {
      expect(imagen).toHaveAttribute('width', '800')
      expect(imagen).toHaveAttribute('height', '600')
    }
  })
})

describe('rediseno_visual @s38 el rótulo de precio de ejemplo sigue siendo inequívoco', () => {
  it('cada importe visible empieza literalmente por "Importe de ejemplo: ", nunca solo "Importe:"', () => {
    renderizarPaginaTienda()

    const importes = screen.getAllByText(/€/)
    expect(importes.length).toBeGreaterThan(0)
    for (const importe of importes) {
      expect(importe.textContent).toMatch(/^Importe de ejemplo: \d/)
    }
  })
})

const CATALOGO_ANTES_DEL_REDISENO: readonly ProductoLiteral[] = [
  { nombre: 'Pienso de ejemplo para perro adulto · 3 kg', categoria: 'Piensos', importeCentimos: 1250 },
  { nombre: 'Pienso de ejemplo para gato esterilizado · 1,5 kg', categoria: 'Piensos', importeCentimos: 995 },
  { nombre: 'Arnés de ejemplo talla M', categoria: 'Paseo', importeCentimos: 1875 },
  { nombre: 'Correa de ejemplo de 2 m', categoria: 'Paseo', importeCentimos: 705 },
  { nombre: 'Cama de ejemplo talla M', categoria: 'Descanso', importeCentimos: 2499 },
  { nombre: 'Manta de ejemplo de 60 × 40 cm', categoria: 'Descanso', importeCentimos: 630 },
  { nombre: 'Mordedor de ejemplo de caucho', categoria: 'Juegos', importeCentimos: 445 },
  { nombre: 'Pelota de ejemplo con sonido', categoria: 'Juegos', importeCentimos: 315 },
] as const

describe('rediseno_visual @s38 el catálogo tiene exactamente los mismos productos que antes de este rediseño', () => {
  it('los ocho productos declarados en el TEXTO REAL de "src/data/tienda.ts" coinciden, en orden, con el literal fijado antes de tocar ningún fichero de este rediseño', () => {
    const productosReales = productosDeclaradosEnElTexto(TEXTO_DATOS_TIENDA)

    expect(productosReales).toHaveLength(8)
    expect(productosReales).toEqual(CATALOGO_ANTES_DEL_REDISENO)
  })

  it('el listado renderizado muestra exactamente esos ocho productos, con su categoría y su importe de ejemplo, en el mismo orden', () => {
    renderizarPaginaTienda()

    const tarjetas = screen.getAllByRole('listitem')
    expect(tarjetas).toHaveLength(CATALOGO_ANTES_DEL_REDISENO.length)

    CATALOGO_ANTES_DEL_REDISENO.forEach((productoEsperado, indice) => {
      const tarjeta = tarjetas[indice] as HTMLElement
      expect(within(tarjeta).getByRole('heading', { level: 2 })).toHaveTextContent(productoEsperado.nombre)
      expect(within(tarjeta).getByText(productoEsperado.categoria)).toBeInTheDocument()
      expect(
        within(tarjeta).getByText(`Importe de ejemplo: ${formatearImporteLiteral(productoEsperado.importeCentimos)}`),
      ).toBeInTheDocument()
    })
  })

  it('si el texto real cambiara un solo dato, la comparación literal lo señalaría (verificación en memoria, sin tocar "src/data/tienda.ts", fuera de mi ámbito)', () => {
    const textoSaboteado = TEXTO_DATOS_TIENDA.replace('importeCentimos: 1250,', 'importeCentimos: 9999,')
    expect(textoSaboteado).not.toBe(TEXTO_DATOS_TIENDA)

    const productosSaboteados = productosDeclaradosEnElTexto(textoSaboteado)

    expect(productosSaboteados).not.toEqual(CATALOGO_ANTES_DEL_REDISENO)
    expect(productosSaboteados[0]?.importeCentimos).toBe(9999)
  })
})
