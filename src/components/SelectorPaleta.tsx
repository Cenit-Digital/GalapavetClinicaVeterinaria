import React, { useEffect, useState } from 'react'
import { VARIANTES_PALETA, type VariantePaleta } from '../data/variantesPaleta'
import { guardarVarianteElegida, leerVarianteAlmacenada, resolverVarianteInicial } from './SelectorPaleta-logica'

const NOMBRE_ACCESIBLE_BOTON = 'Cambiar paleta de color'
const NOMBRE_ACCESIBLE_GRUPO = 'Paleta de color'

interface SelectorPaletaProps {
  /** Catálogo de variantes a ofrecer. Por defecto, el catálogo real de la marca. */
  catalogo?: readonly VariantePaleta[]
}

/** Conmutador flotante entre las variantes de la paleta de marca (@s1/@s2/@s5/@s16). */
export function SelectorPaleta({ catalogo = VARIANTES_PALETA }: SelectorPaletaProps = {}): React.JSX.Element | null {
  const [abierto, setAbierto] = useState(false)
  const [activa, setActiva] = useState<string>(() =>
    resolverVarianteInicial(leerVarianteAlmacenada(window.localStorage), catalogo),
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-variante', activa)
  }, [activa])

  if (catalogo.length === 0) {
    return null
  }

  return (
    <div>
      <button type="button" aria-expanded={abierto} onClick={() => setAbierto((valorPrevio) => !valorPrevio)}>
        {NOMBRE_ACCESIBLE_BOTON}
      </button>
      {abierto && (
        <fieldset aria-label={NOMBRE_ACCESIBLE_GRUPO}>
          {catalogo.map((variante) => (
            <button
              key={variante.id}
              type="button"
              aria-pressed={variante.id === activa}
              onClick={() => {
                setActiva(variante.id)
                guardarVarianteElegida(window.localStorage, variante.id)
              }}
            >
              {variante.muestras.map((color) => (
                <span key={color} aria-hidden="true" style={{ backgroundColor: color }} />
              ))}
              {variante.nombre}
            </button>
          ))}
        </fieldset>
      )}
    </div>
  )
}
