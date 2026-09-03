import React, { useEffect, useState } from 'react'
import { VARIANTES_PALETA, type VariantePaleta } from '../data/variantesPaleta'
import { guardarVarianteElegida, leerVarianteAlmacenada, resolverVarianteInicial } from './SelectorPaleta-logica'
import styles from './SelectorPaleta.module.scss'

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
    <div className={styles.selector} data-selector-paleta>
      <button
        type="button"
        aria-label={NOMBRE_ACCESIBLE_BOTON}
        aria-expanded={abierto}
        onClick={() => setAbierto((valorPrevio) => !valorPrevio)}
      >
        <span aria-hidden="true" className={styles.disco} />
      </button>
      {abierto && (
        <fieldset aria-label={NOMBRE_ACCESIBLE_GRUPO} className={styles.panel}>
          <legend>Paleta de color</legend>
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
              <span aria-hidden="true" className={styles.muestras} data-muestra-variante={variante.id}>
                <span className={styles.muestra} />
                <span className={styles.muestra} />
                <span className={styles.muestra} />
              </span>
              {variante.nombre}
            </button>
          ))}
        </fieldset>
      )}
    </div>
  )
}
