import type { ArticuloDemo, BloqueDeCuerpo } from '../data/blog'
import { SERVICIOS } from '../data/servicios'

/**
 * Lógica de decisión de `PaginaBlog`, mordible por mutación
 * (`stryker.config.json` muta `src/**\/*-logica.ts`). El componente `.tsx`
 * solo cablea esta lógica; nada aquí toca el DOM.
 */

/**
 * Las categorías admitidas son, literalmente, los cinco bloques de servicio
 * publicados por el cliente, en su orden (cabecera del `.feature`, @s7): se
 * derivan de `SERVICIOS`, nunca se retipean a mano.
 */
export const CATEGORIAS_PUBLICADAS: readonly string[] = SERVICIOS.map((bloque) => bloque.titulo)

/**
 * Resuelve el parámetro "categoria" de la URL a una categoría válida, o a
 * `null` ("Todos"). Cualquier valor ausente, en blanco o que no coincida
 * exactamente con una categoría publicada cae cerrado a "Todos" (@s9/@s10/@s12):
 * un valor corrupto nunca se refleja en el estado del filtro.
 */
export function normalizarCategoriaSeleccionada(
  categoriaParam: string | null,
  categoriasValidas: readonly string[] = CATEGORIAS_PUBLICADAS,
): string | null {
  const valor = (categoriaParam ?? '').trim()
  return categoriasValidas.includes(valor) ? valor : null
}

/** El catálogo completo sin categoría seleccionada, o solo sus artículos (@s8/@s9/@s10/@s11). */
export function filtrarPorCategoria(catalogo: readonly ArticuloDemo[], categoria: string | null): ArticuloDemo[] {
  if (categoria === null) {
    return [...catalogo]
  }
  return catalogo.filter((articuloDemo) => articuloDemo.categoria === categoria)
}

const CAMPOS_DE_AUTORIA_PROHIBIDOS = ['autor', 'firma', 'iniciales'] as const

function errorCampoDeAutoriaProhibido(identificador: string, campo: string): Error {
  return new Error(`El artículo "${identificador}" declara el campo prohibido "${campo}"`)
}

/**
 * R1 (cabecera del `.feature`): ningún artículo declara autor, firma ni
 * iniciales (@s25). `ArticuloDemo` no declara ese campo en absoluto, pero un
 * valor corrupto puede llevarlo igualmente (en tiempo de ejecución no hay
 * frontera de tipos): se comprueba con `in`, no con acceso tipado.
 */
function comprobarSinCamposDeAutoria(articuloDemo: ArticuloDemo): void {
  for (const campo of CAMPOS_DE_AUTORIA_PROHIBIDOS) {
    if (campo in articuloDemo) {
      throw errorCampoDeAutoriaProhibido(articuloDemo.identificador, campo)
    }
  }
}

/**
 * R3 (cabecera del `.feature`): patrones de contenido prohibidos en el
 * cuerpo de cualquier artículo — precio, teléfono, porcentaje de eficacia,
 * promesa de resultado y reclamo de urgencias 24 h. Exactamente estos 5, ni
 * uno más (@s26).
 */
export const PATRONES_PROHIBIDOS_DE_CONTENIDO: readonly RegExp[] = [
  /\d+\s?€/,
  /\d{2,3}[\s.]?\d{2}[\s.]?\d{2}[\s.]?\d{2}/,
  /\d+\s?%/,
  /garantiza/i,
  /24\s?h\b/i,
]

function textoCompleto(cuerpo: readonly BloqueDeCuerpo[]): string {
  return cuerpo.map((bloque) => bloque.texto).join(' ')
}

function errorTextoProhibido(identificador: string, textoEncontrado: string): Error {
  return new Error(`El artículo "${identificador}" contiene el texto prohibido "${textoEncontrado}"`)
}

function comprobarSinTextosProhibidos(articuloDemo: ArticuloDemo): void {
  const texto = textoCompleto(articuloDemo.cuerpo)
  for (const patron of PATRONES_PROHIBIDOS_DE_CONTENIDO) {
    const coincidencia = texto.match(patron)
    if (coincidencia !== null) {
      throw errorTextoProhibido(articuloDemo.identificador, coincidencia[0])
    }
  }
}

/**
 * Valida el catálogo completo (R1 + R3) y lo devuelve intacto si pasa.
 * Falla cerrado ante el primer artículo inválido: no devuelve nada, así que
 * nada del catálogo llega a construirse para renderizar (@s25/@s26).
 */
export function construirCatalogoBlog(catalogo: readonly ArticuloDemo[]): ArticuloDemo[] {
  for (const articuloDemo of catalogo) {
    comprobarSinCamposDeAutoria(articuloDemo)
    comprobarSinTextosProhibidos(articuloDemo)
  }
  return [...catalogo]
}

/** Velocidad de lectura declarada por este contrato (@s18), no un dato del cliente ni una medición. */
export const VELOCIDAD_LECTURA_PPM = 200

function contarPalabras(cuerpo: readonly BloqueDeCuerpo[]): number {
  const texto = textoCompleto(cuerpo).trim()
  if (texto === '') {
    return 0
  }
  return texto.split(/\s+/).length
}

/** Minutos de lectura calculados del cuerpo, o `null` sin ninguna palabra (@s19): nunca procede de un valor del catálogo. */
export function calcularTiempoDeLectura(cuerpo: readonly BloqueDeCuerpo[]): number | null {
  const palabras = contarPalabras(cuerpo)
  if (palabras === 0) {
    return null
  }
  return Math.ceil(palabras / VELOCIDAD_LECTURA_PPM)
}

export function formatearTiempoDeLectura(minutos: number): string {
  return `${minutos} min`
}

/** Localiza un artículo por su identificador exacto de ruta; `undefined` si no hay identificador o no existe (@s21). */
export function resolverArticulo(catalogo: readonly ArticuloDemo[], identificador: string | undefined): ArticuloDemo | undefined {
  if (identificador === undefined) {
    return undefined
  }
  return catalogo.find((articuloDemo) => articuloDemo.identificador === identificador)
}

/** Como mucho 3 artículos relacionados en el bloque "Sigue leyendo" (@s22/@s23/@s30). */
export const MAXIMO_ARTICULOS_RELACIONADOS = 3

/** Artículos de la misma categoría que el actual, nunca el propio, como mucho `MAXIMO_ARTICULOS_RELACIONADOS`, en el orden del catálogo. */
export function articulosRelacionados(catalogo: readonly ArticuloDemo[], articuloActual: ArticuloDemo): ArticuloDemo[] {
  return catalogo
    .filter(
      (articuloDemo) =>
        articuloDemo.categoria === articuloActual.categoria && articuloDemo.identificador !== articuloActual.identificador,
    )
    .slice(0, MAXIMO_ARTICULOS_RELACIONADOS)
}
