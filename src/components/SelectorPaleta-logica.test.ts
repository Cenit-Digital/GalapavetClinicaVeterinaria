import { describe, expect, it } from 'vitest'
// Import "?raw" de Vite: trae el contenido de `index.html` como cadena, sin
// tocar `node:fs` (este proyecto es una app de navegador, no un script de
// Node) y sin ejecutar el documento — jsdom no ejecuta scripts inline de
// `index.html`, así que este test lee el texto en vez de montarlo (@s10).
import htmlIndice from '../../index.html?raw'
import { VARIANTES_PALETA } from '../data/variantesPaleta'
import { CLAVE_ALMACENAMIENTO_VARIANTE, leerVarianteAlmacenada, resolverVarianteInicial } from './SelectorPaleta-logica'

/** Doble de `Storage` cuyo `getItem` lanza, como pide @s14. */
const ALMACENAMIENTO_QUE_LANZA_AL_LEER = {
  getItem(): string | null {
    throw new Error('almacenamiento no disponible')
  },
}

/** Un script `<script atributos>contenido</script>` extraído de `index.html`. */
interface ScriptEncontrado {
  readonly atributos: string
  readonly contenido: string
  readonly indice: number
}

/** Todos los `<script>` de `html`, en orden de aparición, con sus atributos crudos y su posición. */
function extraerScripts(html: string): readonly ScriptEncontrado[] {
  const patron = /<script([^>]*)>([\s\S]*?)<\/script>/g
  const encontrados: ScriptEncontrado[] = []
  for (const coincidencia of html.matchAll(patron)) {
    encontrados.push({
      atributos: coincidencia[1] ?? '',
      contenido: coincidencia[2] ?? '',
      indice: coincidencia.index,
    })
  }
  return encontrados
}

describe('@s9 la variante guardada se resuelve antes del primer pintado', () => {
  it('con "noche" guardado bajo la clave del selector, resuelve exactamente "noche" y ese valor es el que se escribiría en data-variante', () => {
    window.localStorage.setItem(CLAVE_ALMACENAMIENTO_VARIANTE, 'noche')

    const resuelto = resolverVarianteInicial(
      window.localStorage.getItem(CLAVE_ALMACENAMIENTO_VARIANTE),
      VARIANTES_PALETA,
    )

    expect(resuelto).toBe('noche')

    document.documentElement.setAttribute('data-variante', resuelto)
    expect(document.documentElement.getAttribute('data-variante')).toBe('noche')
  })
})

describe('@s10 el script de arranque precede al paquete de la aplicación', () => {
  it('el script en línea que escribe data-variante aparece antes que el módulo de la app, sin defer/async/src', () => {
    const scripts = extraerScripts(htmlIndice)

    const indiceModulo = htmlIndice.indexOf('<script type="module" src="/src/main.tsx">')
    expect(indiceModulo).toBeGreaterThan(-1)

    const scriptAntiDestello = scripts.find((script) => script.contenido.includes('data-variante'))

    expect(scriptAntiDestello).toBeDefined()
    expect(scriptAntiDestello?.indice).toBeLessThan(indiceModulo)
    expect(scriptAntiDestello?.atributos).not.toMatch(/\bdefer\b/)
    expect(scriptAntiDestello?.atributos).not.toMatch(/\basync\b/)
    expect(scriptAntiDestello?.atributos).not.toMatch(/\bsrc=/)
  })
})

describe('@s11 un identificador desconocido cae a la variante por defecto', () => {
  it('con "tech" guardado, resuelve exactamente "marca" y nunca "tech"', () => {
    const resuelto = resolverVarianteInicial('tech', VARIANTES_PALETA)

    expect(resuelto).toBe('marca')
    expect(resuelto).not.toBe('tech')
  })
})

describe('@s12 una preferencia vacía cae a la variante por defecto', () => {
  it('con cadena vacía guardada, resuelve exactamente "marca"', () => {
    const resuelto = resolverVarianteInicial('', VARIANTES_PALETA)

    expect(resuelto).toBe('marca')
  })
})

describe('@s13 un valor corrupto no llega nunca al atributo del documento', () => {
  it('con texto corrupto guardado, resuelve exactamente "marca", uno de los 4 identificadores del catálogo', () => {
    const resuelto = resolverVarianteInicial('{"tema":"noche', VARIANTES_PALETA)

    expect(resuelto).toBe('marca')
    expect(['marca', 'lima', 'verde', 'noche']).toContain(resuelto)
  })
})

describe('@s14 el almacenamiento que lanza al leer no impide cargar la página', () => {
  it('leerVarianteAlmacenada no propaga la excepción y resolverVarianteInicial resuelve "marca"', () => {
    let lanzado: unknown
    let bruto: string | null = 'valor no alcanzado'
    try {
      bruto = leerVarianteAlmacenada(ALMACENAMIENTO_QUE_LANZA_AL_LEER)
    } catch (error) {
      lanzado = error
    }

    expect(lanzado).toBeUndefined()
    expect(bruto).toBeNull()
    expect(resolverVarianteInicial(bruto, VARIANTES_PALETA)).toBe('marca')
  })
})
