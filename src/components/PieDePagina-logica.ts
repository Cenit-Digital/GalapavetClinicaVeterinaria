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

const NOMBRE_COMO_LLEGAR = 'Cómo llegar'
const DESTINO_COMO_LLEGAR = '#contacto'

export interface DatosContactoPie {
  readonly telefonoClinica: string
  readonly telefonoMovil: string
}

/**
 * Construye los 3 enlaces de la columna "Contacto" a partir de la fuente
 * única (@s5): los dos teléfonos de la clínica y el ancla de "Cómo llegar".
 * El enlace de urgencias se retiró el 20/09/2026 (E2) y con él el rótulo
 * compuesto, así que aquí ya no se separa nada (@s6).
 * `construirEnlaceTelefono` falla cerrado: un teléfono que no normaliza
 * revienta esta construcción en vez de producir un `tel:` a medias (@s15).
 */
export function construirEnlacesContacto({
  telefonoClinica,
  telefonoMovil,
}: DatosContactoPie): readonly EnlacePieDePagina[] {
  const enlaceClinica = construirEnlaceTelefono(telefonoClinica)
  const enlaceMovil = construirEnlaceTelefono(telefonoMovil)

  return [
    { nombre: enlaceClinica.textoVisible, destino: enlaceClinica.href },
    { nombre: enlaceMovil.textoVisible, destino: enlaceMovil.href },
    { nombre: NOMBRE_COMO_LLEGAR, destino: DESTINO_COMO_LLEGAR },
  ]
}
