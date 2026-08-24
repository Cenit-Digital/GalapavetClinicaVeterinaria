/**
 * Escisión del API de Sass (`_tokens.scss` / `_api.scss`), paso 3 de
 * `progress/plan_adaptacion_scss.md` §5. Medido (M-2/M-3 del plan): con el
 * `additionalData` inyectando `_tokens.scss` en cada uno de los 17
 * `.module.scss`, cada compilación independiente emite los 4 bloques
 * `:root[data-variante]` de nuevo — 68 bloques en el CSS intermedio, que hoy
 * solo colapsa a 4 porque Lightning CSS los deduplica en el minificado. En
 * cuanto los tokens crezcan de 3 a 17 roles, ese coste deja de ser
 * anecdótico. La solución: `_tokens.scss` declara SOLO custom properties (se
 * `@use`a una vez, desde `global.scss`); `_api.scss` declara SOLO funciones y
 * mixins de Sass, que no emiten CSS, así que inyectarlo 17 veces cuesta 0
 * bytes.
 */
import { describe, expect, it } from 'vitest'

function unicoTexto(ficheros: Record<string, string>, descripcion: string): string {
  const [texto] = Object.values(ficheros)
  if (texto === undefined) {
    throw new Error(`no se pudo leer el texto real de ${descripcion}`)
  }
  return texto
}

const textoDeTokens = (): string =>
  unicoTexto(
    import.meta.glob('./_tokens.scss', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>,
    '"src/styles/_tokens.scss"',
  )

const textoDeApi = (): string =>
  unicoTexto(
    import.meta.glob('./_api.scss', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>,
    '"src/styles/_api.scss"',
  )

const textoDeViteConfig = (): string =>
  unicoTexto(
    import.meta.glob('../../vite.config.ts', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>,
    '"vite.config.ts"',
  )

/** Declaración de una función o un mixin de Sass, en cualquiera de las dos formas. */
const PATRON_FUNCION_O_MIXIN_SASS = /@(?:function|mixin)\s+[\w-]+/

/** Los cuatro nombres que `_tokens.scss` declaraba y que este paso muda a `_api.scss`. */
const NOMBRES_DEL_API: readonly string[] = ['paso-tipografico', 'espaciado', 'foco-visible', 'area-tactil-minima']

describe('(paso 3 del plan) "_tokens.scss" deja de declarar funciones y mixins de Sass', () => {
  it('no declara ningún "@function" ni "@mixin": solo custom properties CSS', () => {
    expect(textoDeTokens()).not.toMatch(PATRON_FUNCION_O_MIXIN_SASS)
  })
})

describe('(paso 3 del plan) "_api.scss" concentra las funciones y los mixins de Sass', () => {
  it.each(NOMBRES_DEL_API)('declara "%s"', (nombre) => {
    expect(textoDeApi()).toMatch(new RegExp(`@(?:function|mixin)\\s+${nombre}\\b`))
  })
})

describe('(paso 3 del plan) "vite.config.ts" inyecta el "@use" del API como LITERAL, nunca vía variable', () => {
  it('additionalData es exactamente el literal \'@use "api" as *;\\n\'', () => {
    expect(textoDeViteConfig()).toContain('additionalData: \'@use "api" as *;\\n\',')
  })

  it('ya no inyecta "tokens" directamente como additionalData', () => {
    expect(textoDeViteConfig()).not.toContain('additionalData: \'@use "tokens" as *;\\n\',')
  })
})
