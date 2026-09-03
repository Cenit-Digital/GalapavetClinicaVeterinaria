import type { EncuadreDeMapa } from '../data/mapa'
import { enlaceLlamada } from '../lib/telefono'

/**
 * Lógica de decisión de `InformacionContacto`, mordible por mutación
 * (`stryker.config.json` muta `src/**\/*-logica.ts`). El componente `.tsx`
 * solo cablea esta lógica; nada aquí toca el DOM.
 */

/** Mismo tipo que las entradas de `datosNegocio.horario` (`src/lib/site.ts`). */
export interface TramoHorario {
  readonly dias: string
  readonly horas: string
}

export interface EnlaceTelefono {
  readonly textoVisible: string
  readonly href: string
}

/**
 * Deriva un enlace de llamada a partir de un teléfono legible: nunca se
 * escribe un `tel:` a mano (Invariante 2), siempre se deriva con
 * `enlaceLlamada`, que falla cerrado si el valor no normaliza (@s16).
 */
export function construirEnlaceTelefono(textoVisible: string): EnlaceTelefono {
  return { textoVisible, href: enlaceLlamada(textoVisible) }
}

/**
 * Titular de la sección de contacto (@s1 de `fidelidad_contacto.feature`):
 * el prototipo decía «Estamos a un paseo de casa», una frase que no se copia
 * (`PLAN_DE_CONVERGENCIA.md`); aquí se deriva de la localidad real, sin
 * afirmar nada que el cliente no publique.
 */
export function titularDeContacto(localidad: string): string {
  return `Estamos en ${localidad}`
}

/** Coordenadas geográficas en grados decimales (mismo tipo que `datosNegocio.coordenadas`). */
export interface Coordenadas {
  readonly latitud: number
  readonly longitud: number
}

/** Posición del pin dentro del mapa, en porcentaje del ancho (`x`) y del alto (`y`). */
export interface PosicionDelPin {
  readonly x: number
  readonly y: number
}

const LADO_DE_TESELA_PX = 256
const GRADOS_DE_MEDIA_VUELTA = 180
const GRADOS_DE_VUELTA_COMPLETA = 360
const DECIMALES_DEL_PORCENTAJE = 100
const CIEN_POR_CIENTO = 100

function aRadianes(grados: number): number {
  return (grados * Math.PI) / GRADOS_DE_MEDIA_VUELTA
}

function redondearPorcentaje(valor: number): number {
  return Math.round(valor * DECIMALES_DEL_PORCENTAJE) / DECIMALES_DEL_PORCENTAJE
}

/**
 * Proyección Web Mercator de las teselas de OpenStreetMap (@s4 de
 * `fidelidad_contacto.feature`, Decisión 63): la posición del pin se DERIVA
 * de las coordenadas de la fuente única y del encuadre con el que se compuso
 * la imagen, nunca se retipea a mano.
 */
export function posicionDelPin(coordenadas: Coordenadas, encuadre: EncuadreDeMapa): PosicionDelPin {
  const ladoDelMundoPx = LADO_DE_TESELA_PX * 2 ** encuadre.zoom
  const latitud = aRadianes(coordenadas.latitud)

  const xEnElMundo = ((coordenadas.longitud + GRADOS_DE_MEDIA_VUELTA) / GRADOS_DE_VUELTA_COMPLETA) * ladoDelMundoPx
  const yEnElMundo = ((1 - Math.log(Math.tan(latitud) + 1 / Math.cos(latitud)) / Math.PI) / 2) * ladoDelMundoPx

  const xEnElRecorte = xEnElMundo - encuadre.teselaX * LADO_DE_TESELA_PX
  const yEnElRecorte = yEnElMundo - encuadre.teselaY * LADO_DE_TESELA_PX - encuadre.recorteY

  return {
    x: redondearPorcentaje((xEnElRecorte / encuadre.ancho) * CIEN_POR_CIENTO),
    y: redondearPorcentaje((yEnElRecorte / encuadre.alto) * CIEN_POR_CIENTO),
  }
}

/** Texto alternativo del mapa estático: derivado del nombre comercial y de la dirección en una línea (@s4). */
export function describirMapa(nombreComercial: string, direccionEnUnaLinea: string): string {
  return `Mapa con la ubicación de ${nombreComercial} en ${direccionEnUnaLinea}`
}
