import { prefiereMenosMovimiento } from '../components/Galeria-logica'
import type { CampanaDemo } from '../data/campanas'
import { SERVICIOS } from '../data/servicios'

/**
 * Lógica de decisión de `PaginaCampanas`, mordible por mutación
 * (`stryker.config.json` muta `src/**\/*-logica.ts`). El componente `.tsx`
 * solo cablea esta lógica; nada aquí toca el DOM.
 */

const PUNTOS_PUBLICADOS: ReadonlySet<string> = new Set(SERVICIOS.flatMap((bloque) => bloque.puntos))

/** Campaña con todos sus campos de identidad resueltos (nunca `undefined`), lista para construir la ficha. */
export interface CampanaValidada {
  readonly id: string
  readonly titulo: string
  readonly imagen?: string
  readonly bloque: string
  readonly puntos: readonly string[]
}

function errorPrecioNoConfirmado(titulo: string, precio: string): Error {
  return new Error(`La campaña "${titulo}" declara un precio no confirmado: "${precio}"`)
}

function errorVigenciaNoConfirmada(titulo: string, vigencia: string): Error {
  return new Error(`La campaña "${titulo}" declara una vigencia no confirmada: "${vigencia}"`)
}

function errorPlazasNoConfirmadas(titulo: string, plazas: string): Error {
  return new Error(`La campaña "${titulo}" declara unas plazas no confirmadas: "${plazas}"`)
}

function errorDuracionNoConfirmada(titulo: string, duracion: string): Error {
  return new Error(`La campaña "${titulo}" declara una duración no confirmada: "${duracion}"`)
}

/** Guarda de fallo cerrado sobre datos pendientes de confirmar (@s33/@s34/@s35/@s40): lanza si alguno está declarado. */
function comprobarDatosPendientesNoDeclarados(campana: CampanaDemo): void {
  if (campana.precio !== undefined) {
    throw errorPrecioNoConfirmado(campana.titulo, campana.precio)
  }
  if (campana.vigencia !== undefined) {
    throw errorVigenciaNoConfirmada(campana.titulo, campana.vigencia)
  }
  if (campana.plazas !== undefined) {
    throw errorPlazasNoConfirmadas(campana.titulo, campana.plazas)
  }
  if (campana.duracion !== undefined) {
    throw errorDuracionNoConfirmada(campana.titulo, campana.duracion)
  }
}

function errorPuntoNoPublicado(titulo: string, punto: string): Error {
  return new Error(
    `La campaña "${titulo}" declara el punto no publicado "${punto}", que no aparece en el catálogo de servicios publicado por el cliente`,
  )
}

/** Descarta los puntos en blanco (@s37): no identifican ningún servicio real y no deben pintar un elemento vacío. */
function puntosNoVacios(puntos: readonly string[] | undefined): string[] {
  return (puntos ?? []).filter((punto) => punto.trim() !== '')
}

/** Cada punto no vacío declarado debe existir literalmente en el catálogo publicado (@s36). */
function comprobarPuntosPublicados(titulo: string, puntos: readonly string[]): void {
  for (const punto of puntos) {
    if (!PUNTOS_PUBLICADOS.has(punto)) {
      throw errorPuntoNoPublicado(titulo, punto)
    }
  }
}

/** Resuelve una `CampanaDemo` (campos opcionales) a `CampanaValidada` (campos concretos, puntos ya sin blancos). */
function normalizarCampana(campana: CampanaDemo): CampanaValidada {
  const validada: CampanaValidada = {
    id: campana.id ?? '',
    titulo: campana.titulo,
    bloque: campana.bloque ?? '',
    puntos: puntosNoVacios(campana.puntos),
  }
  if (campana.imagen === undefined) {
    return validada
  }
  return { ...validada, imagen: campana.imagen }
}

/**
 * Normaliza el catálogo de demo a `CampanaValidada[]`. `id`/`bloque`/`puntos`
 * son opcionales en `CampanaDemo` (compartido con `campanas_portada`, que no
 * los declara); aquí se resuelven a un valor concreto.
 */
export function construirCatalogoCampanas(catalogo: readonly CampanaDemo[]): CampanaValidada[] {
  for (const campana of catalogo) {
    comprobarDatosPendientesNoDeclarados(campana)
    comprobarPuntosPublicados(campana.titulo, puntosNoVacios(campana.puntos))
  }
  return catalogo.filter((campana) => campana.titulo.trim() !== '').map(normalizarCampana)
}

export type VistaCampanas =
  | { readonly tipo: 'listado' }
  | { readonly tipo: 'listado-no-encontrada' }
  | { readonly tipo: 'ficha'; readonly campana: CampanaValidada }

/**
 * Resuelve qué vista mostrar a partir del catálogo ya validado y el
 * parámetro "campana" de la URL: sin parámetro (o en blanco) es el listado
 * (@s29); un id que no existe en el catálogo es el listado con aviso de "no
 * encontrada" (@s27/@s28); un id que sí existe es la ficha.
 */
export function resolverVista(catalogo: readonly CampanaValidada[], idParam: string | null): VistaCampanas {
  const id = (idParam ?? '').trim()
  if (id === '') {
    return { tipo: 'listado' }
  }
  const campana = catalogo.find((entrada) => entrada.id === id)
  return campana === undefined ? { tipo: 'listado-no-encontrada' } : { tipo: 'ficha', campana }
}

/** Las demás campañas del catálogo, excluyendo siempre la que está abierta (@s19). */
export function otrasCampanas(catalogo: readonly CampanaValidada[], idCampanaAbierta: string): CampanaValidada[] {
  return catalogo.filter((campana) => campana.id !== idCampanaAbierta)
}

export type ComportamientoDesplazamiento = 'auto' | 'smooth'

/**
 * Decide si el desplazamiento al abrir una ficha se suaviza, en función de
 * la preferencia de movimiento del visitante (@s21/@s22/@s23/@s41). Nunca
 * pide "smooth" sin haber consultado antes esa preferencia: reutiliza
 * `prefiereMenosMovimiento` (`Galeria-logica.ts`), que ya falla cerrado a
 * "prefiere menos movimiento" cuando la consulta no está disponible.
 */
export function decidirComportamientoDesplazamiento(
  consultarMedios: typeof window.matchMedia | undefined,
): ComportamientoDesplazamiento {
  return prefiereMenosMovimiento(consultarMedios) ? 'auto' : 'smooth'
}
