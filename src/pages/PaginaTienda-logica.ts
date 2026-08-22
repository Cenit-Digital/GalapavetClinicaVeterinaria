import { CATEGORIAS_TIENDA, type ProductoDemo } from '../data/tienda'

/**
 * Lógica de decisión de `PaginaTienda`, mordible por mutación
 * (`stryker.config.json` muta `src/**\/*-logica.ts`). El componente `.tsx`
 * solo cablea esta lógica; nada aquí toca el DOM.
 */

function errorCategoriaNoPublicada(nombre: string, categoria: string): Error {
  return new Error(`El producto "${nombre}" declara la categoría no publicada "${categoria}"`)
}

function comprobarCategoriaPublicada(producto: ProductoDemo): void {
  if (!CATEGORIAS_TIENDA.includes(producto.categoria)) {
    throw errorCategoriaNoPublicada(producto.nombre, producto.categoria)
  }
}

function errorImporteInvalido(nombre: string, importeCentimos: number): Error {
  return new Error(`El producto "${nombre}" declara un importe inválido: "${importeCentimos}"`)
}

/** Válido solo si es un entero de céntimos mayor o igual que cero (@s17): ni negativo, ni fraccionario. */
function comprobarImporteValido(producto: ProductoDemo): void {
  if (!Number.isInteger(producto.importeCentimos) || producto.importeCentimos < 0) {
    throw errorImporteInvalido(producto.nombre, producto.importeCentimos)
  }
}

/**
 * Valida el catálogo completo (categoría publicada, importe válido). Falla
 * cerrado ante el primer producto inválido (@s16/@s17): no devuelve nada, así
 * que nada del catálogo llega a construirse para renderizar. Un producto con
 * el nombre vacío (o solo espacios) no es un dato inválido sino AUSENTE: se
 * descarta en silencio y el resto del catálogo se sigue mostrando (@s15).
 */
export function construirCatalogoTienda(catalogo: readonly ProductoDemo[]): ProductoDemo[] {
  for (const producto of catalogo) {
    comprobarCategoriaPublicada(producto)
    comprobarImporteValido(producto)
  }
  return catalogo.filter((producto) => producto.nombre.trim() !== '')
}

const CENTIMOS_POR_EURO = 100

/**
 * Formatea un importe en céntimos enteros a texto (@s33): siempre con
 * `Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })`, nunca
 * con una plantilla manual — es lo único que produce coma decimal, dos
 * decimales SIEMPRE, agrupación de millares con punto solo a partir de cinco
 * cifras enteras (regla CLDR es-ES "min2") y el espacio duro U+00A0 antes de
 * "€", verificado ejecutándolo (no asumido). La división a euros ocurre una
 * sola vez, al formatear — nunca se acumula en coma flotante.
 */
export function formatearImporte(centimos: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(centimos / CENTIMOS_POR_EURO)
}

/** El catálogo completo sin categoría seleccionada, o solo sus productos de esa categoría (@s9/@s10). */
export function filtrarProductosPorCategoria(catalogo: readonly ProductoDemo[], categoria: string | null): ProductoDemo[] {
  if (categoria === null) {
    return [...catalogo]
  }
  return catalogo.filter((producto) => producto.categoria === categoria)
}

/** Una línea de cesta: qué producto (por su nombre, único en el catálogo de demo) y cuántas unidades. */
export interface LineaCesta {
  readonly identificador: string
  readonly cantidad: number
}

/** El estado entero de la cesta: una lista de líneas, nunca dos líneas del mismo producto. */
export type EstadoCesta = readonly LineaCesta[]

/** Tope de unidades por línea (@s27/@s43): guarda de interfaz de este proyecto, no un dato de stock del cliente. */
export const TOPE_UNIDADES_POR_LINEA = 99

/** ¿Ha llegado esta línea al tope de unidades declarado (@s27)? Guarda de interfaz, no de stock. */
export function alcanzoTopeUnidades(cantidad: number): boolean {
  return cantidad >= TOPE_UNIDADES_POR_LINEA
}

function buscarLinea(estado: EstadoCesta, identificador: string): LineaCesta | undefined {
  return estado.find((linea) => linea.identificador === identificador)
}

/** Sustituye la cantidad de la línea del producto indicado (que ya existe en `estado`), dejando las demás intactas. */
function conCantidadFijada(estado: EstadoCesta, identificador: string, cantidad: number): EstadoCesta {
  return estado.map((linea) => (linea.identificador === identificador ? { ...linea, cantidad } : linea))
}

/** Añade una unidad del producto indicado, creando la línea si no existía. Nunca pasa de `TOPE_UNIDADES_POR_LINEA` (@s43): nunca lanza, clampa. */
export function anadirUnidad(estado: EstadoCesta, identificador: string): EstadoCesta {
  const existente = buscarLinea(estado, identificador)
  if (existente === undefined) {
    return [...estado, { identificador, cantidad: 1 }]
  }
  const cantidad = alcanzoTopeUnidades(existente.cantidad) ? existente.cantidad : existente.cantidad + 1
  return conCantidadFijada(estado, identificador, cantidad)
}

/** Quita una unidad del producto indicado. Si la línea llega a 0, desaparece entera (@s26): nunca queda una línea con cantidad 0. */
export function quitarUnidad(estado: EstadoCesta, identificador: string): EstadoCesta {
  const existente = buscarLinea(estado, identificador)
  if (existente === undefined) {
    return estado
  }
  if (existente.cantidad <= 1) {
    return estado.filter((linea) => linea.identificador !== identificador)
  }
  return conCantidadFijada(estado, identificador, existente.cantidad - 1)
}

function errorCantidadInvalida(cantidad: unknown): Error {
  return new Error(`cantidad inválida: "${String(cantidad)}"`)
}

/**
 * Fija la cantidad exacta de una línea. 0 elimina la línea (@s34). Cualquier
 * valor negativo, fraccionario o no numérico se RECHAZA lanzando (@s35/@s36):
 * nunca clampa a 0 y nunca almacena una cantidad inválida — el estado
 * recibido no se toca porque la función lanza antes de construir nada nuevo.
 */
export function fijarCantidad(estado: EstadoCesta, identificador: string, cantidad: number): EstadoCesta {
  if (!Number.isInteger(cantidad) || cantidad < 0) {
    throw errorCantidadInvalida(cantidad)
  }
  if (cantidad === 0) {
    return estado.filter((linea) => linea.identificador !== identificador)
  }
  if (buscarLinea(estado, identificador) === undefined) {
    return [...estado, { identificador, cantidad }]
  }
  return conCantidadFijada(estado, identificador, cantidad)
}

/** Saca una línea entera de la cesta, sin importar su cantidad (@s29/@s30). */
export function eliminarLinea(estado: EstadoCesta, identificador: string): EstadoCesta {
  return estado.filter((linea) => linea.identificador !== identificador)
}

/** Vacía la cesta entera de una vez (@s31). */
export function vaciarCesta(): EstadoCesta {
  return []
}

/** Una línea ya resuelta contra el catálogo: nombre y subtotal en céntimos enteros. */
export interface LineaResumen {
  readonly identificador: string
  readonly nombre: string
  readonly cantidad: number
  readonly subtotalCentimos: number
}

/** El resumen completo de la cesta: sus líneas resueltas, el total y el número de artículos, todo en céntimos enteros. */
export interface ResumenCesta {
  readonly lineas: readonly LineaResumen[]
  readonly totalCentimos: number
  readonly numeroDeArticulos: number
}

/**
 * Resuelve cada línea del estado contra el catálogo y calcula el total y el
 * número de artículos SUMANDO CÉNTIMOS ENTEROS (nunca euros en coma
 * flotante), para que el total nunca descuadre un céntimo respecto a la
 * suma de los subtotales mostrados (@s32). Una línea cuyo identificador no
 * existe en el catálogo se descarta sin lanzar y sin contar sus unidades
 * (@s37). Un estado sin líneas da un resumen en cero, nunca `NaN` (@s38).
 */
export function calcularResumenCesta(estado: EstadoCesta, catalogo: readonly ProductoDemo[]): ResumenCesta {
  const lineas: LineaResumen[] = []
  for (const linea of estado) {
    const producto = catalogo.find((candidato) => candidato.nombre === linea.identificador)
    if (producto === undefined) {
      continue
    }
    lineas.push({
      identificador: linea.identificador,
      nombre: producto.nombre,
      cantidad: linea.cantidad,
      subtotalCentimos: producto.importeCentimos * linea.cantidad,
    })
  }
  const totalCentimos = lineas.reduce((suma, linea) => suma + linea.subtotalCentimos, 0)
  const numeroDeArticulos = lineas.reduce((suma, linea) => suma + linea.cantidad, 0)
  return { lineas, totalCentimos, numeroDeArticulos }
}

const NUMERO_SINGULAR = 1

/** Contador de artículos de la cesta, singularizado solo en 1 (@s23/@s44). */
export function formatearContadorArticulos(numeroDeArticulos: number): string {
  return numeroDeArticulos === NUMERO_SINGULAR ? '1 artículo' : `${numeroDeArticulos} artículos`
}

/** Rótulo visible del botón de añadir de una tarjeta: cuenta si ya hay unidades en la cesta (@s22). */
export function rotuloBotonAnadir(cantidadEnCesta: number): string {
  return cantidadEnCesta === 0 ? 'Añadir' : `En la cesta · ${cantidadEnCesta}`
}

/** Nombre accesible del botón de añadir de una tarjeta: distinto según ya haya o no unidades en la cesta (@s22). */
export function nombreAccesibleBotonAnadir(nombreProducto: string, cantidadEnCesta: number): string {
  return cantidadEnCesta === 0
    ? `Añadir ${nombreProducto} a la cesta`
    : `Añadir otra unidad de ${nombreProducto}, ${cantidadEnCesta} en la cesta`
}

/**
 * Atrapa-foco del diálogo modal (patrón Modal Dialog de la WAI-ARIA APG,
 * cabecera del .feature punto 12, @s39/@s40): dado el elemento activo y la
 * lista ORDENADA de elementos enfocables del diálogo, decide a qué elemento
 * saltar cuando Tab/Shift+Tab intentaría sacar el foco fuera de esos
 * límites. Solo interviene en los dos bordes (última tabulación hacia
 * delante, primera tabulación hacia atrás, o Shift+Tab desde el propio
 * contenedor del diálogo antes de la primera tabulación); el resto de
 * tabulaciones, estrictamente dentro del diálogo, ya se resuelven solas.
 * Devuelve `null` cuando no hace falta intervenir.
 */
export function elementoTrasAtraparFoco(
  elementosFocusables: readonly HTMLElement[],
  elementoActivo: Element | null,
  retroceder: boolean,
): HTMLElement | null {
  if (elementosFocusables.length === 0) {
    return null
  }
  const primero = elementosFocusables[0] ?? null
  const ultimo = elementosFocusables[elementosFocusables.length - 1] ?? null
  const elementoActivoDentroDelDialogo = elementosFocusables.includes(elementoActivo as HTMLElement)
  if (retroceder && (elementoActivo === primero || !elementoActivoDentroDelDialogo)) {
    return ultimo
  }
  if (!retroceder && elementoActivo === ultimo) {
    return primero
  }
  return null
}
