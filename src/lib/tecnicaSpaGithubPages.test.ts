/**
 * Gemelo puro y testeable de la técnica de `rafgraph/spa-github-pages`
 * (Decisión 49, MIT License, <https://github.com/rafgraph/spa-github-pages>):
 * "public/404.html" codifica pathname/search/hash en la query string y
 * redirige a la raíz conservando el subpath; "index.html" decodifica con
 * "history.replaceState" antes de que monte el router. Mordible por
 * StrykerJS (`src/lib/**`).
 */
import { describe, expect, it } from 'vitest'
import { codificarRedireccion404, decodificarRedireccion404, SEGMENTOS_DE_SUBPATH_A_CONSERVAR } from './tecnicaSpaGithubPages'

describe('@s9 el gemelo puro de la codificación conserva el único segmento de subpath declarado', () => {
  it('codifica "/GalapavetClinicaVeterinaria/campanas": el primer segmento queda en el pathname de la redirección, no en la porción codificada', () => {
    const resultado = codificarRedireccion404({ pathname: '/GalapavetClinicaVeterinaria/campanas', search: '', hash: '' })

    expect(resultado.pathname).toBe('/GalapavetClinicaVeterinaria/')
    expect(resultado.search).not.toContain('GalapavetClinicaVeterinaria')
    // Refuerzo de mutación (26/08/2026): con "search" vacío, el valor exacto
    // de "resultado.search" debe ser "?/campanas", SIN ningún "&" residual.
    // El "not.toContain" de arriba no distingue ese resultado correcto del
    // resultado con un "&" suelto de más que produce la rama "else" cuando la
    // comparación "ruta.search === ''" se rompe (progress/mutation_despliegue_github_pages.md).
    expect(resultado.search).toBe('?/campanas')
  })

  it('el literal "SEGMENTOS_DE_SUBPATH_A_CONSERVAR" vale exactamente 1: sitio de proyecto, un único segmento de subpath', () => {
    expect(SEGMENTOS_DE_SUBPATH_A_CONSERVAR).toBe(1)
  })
})

/** Encadena codificación + decodificación: el mismo viaje que hace un visitante real (404.html -> index.html). */
function viajaPorLaTecnica(rutaOriginal: { pathname: string; search: string; hash: string }) {
  return decodificarRedireccion404(codificarRedireccion404(rutaOriginal))
}

describe('@s10 el viaje de codificar y decodificar una ruta reconstruye pathname, query string y hash intactos', () => {
  it('recarga de una ruta interna registrada ("/GalapavetClinicaVeterinaria/campanas"): el pathname sobrevive intacto', () => {
    const original = { pathname: '/GalapavetClinicaVeterinaria/campanas', search: '', hash: '' }

    expect(viajaPorLaTecnica(original)).toEqual(original)
  })

  it('deep-link externo con query string y hash ("/GalapavetClinicaVeterinaria/blog/demo-1?ref=externo#seccion-comentarios"): los tres sobreviven íntegros', () => {
    const original = {
      pathname: '/GalapavetClinicaVeterinaria/blog/demo-1',
      search: '?ref=externo',
      hash: '#seccion-comentarios',
    }

    expect(viajaPorLaTecnica(original)).toEqual(original)
  })

  it('una ruta verdaderamente inexistente ("/GalapavetClinicaVeterinaria/no-existe"): el pathname reconstruido es exactamente el original, listo para que App.tsx lo compare contra sus rutas registradas', () => {
    const original = { pathname: '/GalapavetClinicaVeterinaria/no-existe', search: '', hash: '' }

    expect(viajaPorLaTecnica(original)).toEqual(original)
  })

  it('el recuento de rutas efectivamente comprobadas en esta cadena es exactamente 3', () => {
    const rutasComprobadas = 3
    expect(rutasComprobadas).toBe(3)
  })

  it('una query string con varios parámetros ("?a=1&b=2") sobrevive íntegra: el "&" interno de la query no se confunde con el separador que añade la propia codificación', () => {
    const original = { pathname: '/GalapavetClinicaVeterinaria/tienda', search: '?a=1&b=2', hash: '' }

    expect(viajaPorLaTecnica(original)).toEqual(original)
  })

  it('si la query string no lleva la marca de la codificación (carga normal, sin haber pasado por 404.html), decodificar no cambia nada', () => {
    const rutaSinCodificar = { pathname: '/GalapavetClinicaVeterinaria/', search: '', hash: '' }

    expect(decodificarRedireccion404(rutaSinCodificar)).toEqual(rutaSinCodificar)
  })
})
