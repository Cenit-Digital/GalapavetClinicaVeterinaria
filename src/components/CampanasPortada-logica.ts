import type { CampanaDemo } from '../data/campanas'

/**
 * Lógica de decisión de `CampanasPortada`, mordible por mutación
 * (`stryker.config.json` muta `src/**\/*-logica.ts`). El componente `.tsx`
 * solo cablea esta lógica; nada aquí toca el DOM.
 */

function errorPrecioNoConfirmado(titulo: string, precio: string): Error {
  return new Error(`La campaña "${titulo}" declara un precio no confirmado: "${precio}"`)
}

function errorVigenciaNoConfirmada(titulo: string, vigencia: string): Error {
  return new Error(`La campaña "${titulo}" declara una vigencia no confirmada: "${vigencia}"`)
}

/**
 * Construye el modelo de la sección a partir del catálogo de demo.
 * Galapavet no ha confirmado ninguna campaña (`docs/datos-galapavet.md`
 * §7/§9): si una entrada declara `precio` (@s9) o `vigencia` (@s10), es un
 * dato inválido en la fuente y la construcción falla cerrado en vez de
 * publicarlo.
 */
export function construirModeloCampanas(catalogo: readonly CampanaDemo[]): CampanaDemo[] {
  for (const campana of catalogo) {
    if (campana.precio !== undefined) {
      throw errorPrecioNoConfirmado(campana.titulo, campana.precio)
    }
    if (campana.vigencia !== undefined) {
      throw errorVigenciaNoConfirmada(campana.titulo, campana.vigencia)
    }
  }
  return catalogo.filter((campana) => campana.titulo.trim() !== '')
}
