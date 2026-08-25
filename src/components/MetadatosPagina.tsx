import { useEffect } from 'react'
import type { MetadatosPagina as DatosMetadatosPagina } from '../lib/seo-logica'

/**
 * Único punto del proyecto que toca `<head>`: `document.title`, la meta
 * description, Open Graph y el bloque `application/ld+json`. Este proyecto no
 * usa react-helmet (no hay precedente en el repo) — la construcción del
 * bloque y la validación de metadatos viven en `seo-logica.ts`, mordible por
 * mutación; este componente solo cablea (Invariante 6).
 *
 * `og:locale` usa GUION BAJO ("es_ES"), a diferencia del atributo `lang` del
 * documento ("es-ES", con guion) — ogp.me define ese formato con guion bajo,
 * no es el mismo separador que BCP 47 (@s20).
 */
const LOCALE_OPEN_GRAPH = 'es_ES'
const TIPO_OPEN_GRAPH = 'website'
/**
 * ogp.me define `og:image` con tipo `URL`, que la propia especificación
 * aclara ABSOLUTA (enmienda del 25/08/2026 a `@s20` de
 * `seo_estructura.feature`, PENDIENTE 7 de `identidad_visual.feature`). El
 * dominio es el real de publicación: GitHub Pages del repositorio
 * `Cenit-Digital/GalapavetClinicaVeterinaria`, verificado con
 * `gh api repos/Cenit-Digital/GalapavetClinicaVeterinaria` — el host de una
 * Page de organización es siempre el owner en minúsculas.
 *
 * Aquí solo se declara el ORIGEN (esquema + host), sin el subpath
 * "/GalapavetClinicaVeterinaria" que tendrá la Page de proyecto: ese subpath
 * es un problema de despliegue APARTE, todavía sin resolver
 * (`vite.config.ts` no declara "base" y `App.tsx` no tiene "basename" — el
 * resto de rutas absolutas del sitio, como esta misma imagen, se sigue
 * sirviendo hoy desde la raíz de `dist/`). Anteponer aquí un subpath que el
 * resto del sitio no tiene todavía rompería `tests/e2e/imagenes.spec.ts`
 * (@s29 de `identidad_visual.feature`, ya `done`), que pide el fichero
 * contra el `dist/` real servido en local.
 */
const DOMINIO_SITIO = 'https://cenit-digital.github.io'
/**
 * PNG y no WebP (@s29 de `identidad_visual.feature`): la documentación oficial
 * de Meta no declara qué formatos acepta, así que WebP queda NO VERIFICADO en
 * sus rastreadores. Compuesta con el logotipo real sobre el morado de marca,
 * nunca una foto de banco (`progress/plan_imagenes.md` §4.3 «Open Graph»).
 */
const RUTA_IMAGEN_OPEN_GRAPH = '/img/og/galapavet.png'
const IMAGEN_OPEN_GRAPH = `${DOMINIO_SITIO}${RUTA_IMAGEN_OPEN_GRAPH}`

const ID_SCRIPT_DATOS_ESTRUCTURADOS = 'datos-estructurados-pagina'

/** Actualiza el `content` de un `<meta>` existente, o lo crea si es la primera vez que se pide (nunca duplica, @s7). */
function fijarMeta(atributo: 'name' | 'property', valor: string, contenido: string): void {
  let etiqueta = document.head.querySelector<HTMLMetaElement>(`meta[${atributo}="${valor}"]`)
  if (etiqueta === null) {
    etiqueta = document.createElement('meta')
    etiqueta.setAttribute(atributo, valor)
    document.head.appendChild(etiqueta)
  }
  etiqueta.setAttribute('content', contenido)
}

/** El `<script type="application/ld+json">` de la página, creado una única vez y actualizado en cada cambio (@s7). */
function fijarDatosEstructurados(datosEstructurados: Record<string, unknown>): void {
  let script = document.getElementById(ID_SCRIPT_DATOS_ESTRUCTURADOS)
  if (script === null) {
    script = document.createElement('script')
    script.id = ID_SCRIPT_DATOS_ESTRUCTURADOS
    script.setAttribute('type', 'application/ld+json')
    document.head.appendChild(script)
  }
  script.textContent = JSON.stringify(datosEstructurados)
}

interface MetadatosPaginaProps {
  /** Título y descripción propios de la página activa (@s4/@s5). */
  readonly metadatos: DatosMetadatosPagina
  /** Bloque de datos estructurados ya construido por `construirDatosEstructurados` (@s7-@s9, @s12-@s22). */
  readonly datosEstructurados: Record<string, unknown>
}

/** Componente sin representación visual: solo cablea metadatos y JSON-LD sobre el documento activo. */
export function MetadatosPagina({ metadatos, datosEstructurados }: MetadatosPaginaProps): null {
  useEffect(() => {
    document.title = metadatos.titulo
    fijarMeta('name', 'description', metadatos.descripcion)
    fijarMeta('property', 'og:title', metadatos.titulo)
    fijarMeta('property', 'og:type', TIPO_OPEN_GRAPH)
    fijarMeta('property', 'og:image', IMAGEN_OPEN_GRAPH)
    fijarMeta('property', 'og:url', window.location.href)
    fijarMeta('property', 'og:locale', LOCALE_OPEN_GRAPH)
    fijarDatosEstructurados(datosEstructurados)
  }, [metadatos, datosEstructurados])

  return null
}
