import type { PaginaLegal } from '../data/paginasLegales'
import type { EnlacePieDePagina } from '../data/pieDePaginaEnlaces'
import { construirEnlaceTelefono } from './InformacionContacto-logica'

/**
 * Lógica de decisión de `PieDePagina`, mordible por mutación
 * (`stryker.config.json` muta `src/**\/*-logica.ts`). El componente `.tsx`
 * solo cablea esta lógica; nada aquí toca el DOM.
 */

const SUFIJO_VENTANA_NUEVA = ' (se abre en una ventana nueva)'

export interface EnlaceLegalRenderable {
  readonly nombreVisible: string
  readonly nombreAccesible: string
  readonly destino: string
}

/**
 * Deriva el nombre accesible y el destino de cada enlace legal a partir del
 * catálogo, anunciando en el propio nombre que se abre en una ventana nueva
 * (@s9/@s10/@s11): abrir sin avisar es una trampa de usabilidad
 * (`project-spec.md` → cabecera de `features/pie_de_pagina.feature`).
 */
export function construirEnlacesLegales(paginas: readonly PaginaLegal[]): readonly EnlaceLegalRenderable[] {
  return paginas.map((pagina) => ({
    nombreVisible: pagina.nombre,
    nombreAccesible: `${pagina.nombre}${SUFIJO_VENTANA_NUEVA}`,
    destino: pagina.destino,
  }))
}

/**
 * Calcula el texto del aviso de copyright a partir de la fecha vigente, sin
 * ningún número de registro no verificado (@s12) y sin dejar el año
 * horneado: se deriva de `fecha`, nunca de `Date.now()` implícito (@s13).
 */
export function textoCopyright(fecha: Date, nombreComercial: string): string {
  return `© ${fecha.getFullYear()} ${nombreComercial}`
}

const SEPARADOR_ROTULO = ' · '
const NOMBRE_COMO_LLEGAR = 'Cómo llegar'
const DESTINO_COMO_LLEGAR = '#contacto'

/** El nombre accesible del enlace de urgencias lleva el rótulo real del cliente, cuando la fuente lo declara (@s5/@s6). */
function nombreEnlaceUrgencias(rotulo: string | undefined, textoVisible: string): string {
  return rotulo !== undefined ? `${rotulo}${SEPARADOR_ROTULO}${textoVisible}` : textoVisible
}

export interface DatosContactoPie {
  readonly telefonoClinica: string
  readonly telefonoMovil: string
  readonly telefonoUrgencias: string
  readonly rotuloUrgencias: string | undefined
}

/**
 * Construye los 4 enlaces de la columna "Contacto" a partir de la fuente
 * única (@s5). `construirEnlaceTelefono` falla cerrado: un teléfono que no
 * normaliza revienta esta construcción en vez de producir un `tel:` a
 * medias (@s15).
 */
export function construirEnlacesContacto({
  telefonoClinica,
  telefonoMovil,
  telefonoUrgencias,
  rotuloUrgencias,
}: DatosContactoPie): readonly EnlacePieDePagina[] {
  const enlaceClinica = construirEnlaceTelefono(telefonoClinica)
  const enlaceMovil = construirEnlaceTelefono(telefonoMovil)
  const enlaceUrgencias = construirEnlaceTelefono(telefonoUrgencias)

  return [
    { nombre: enlaceClinica.textoVisible, destino: enlaceClinica.href },
    { nombre: enlaceMovil.textoVisible, destino: enlaceMovil.href },
    { nombre: nombreEnlaceUrgencias(rotuloUrgencias, enlaceUrgencias.textoVisible), destino: enlaceUrgencias.href },
    { nombre: NOMBRE_COMO_LLEGAR, destino: DESTINO_COMO_LLEGAR },
  ]
}
