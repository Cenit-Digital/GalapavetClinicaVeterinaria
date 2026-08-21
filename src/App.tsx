import React, { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { RUTAS_DE_SUBPAGINA } from './App-logica'
import { Cabecera } from './components/Cabecera'
import { PieDePagina } from './components/PieDePagina'
import { SelectorPaleta } from './components/SelectorPaleta'
import { Landing } from './pages/Landing'
import { PaginaNoEncontrada } from './pages/PaginaNoEncontrada'

/**
 * Ancho antes de que `window.innerWidth` se haya leído ni una sola vez
 * (@s11): cae en la rama móvil de `esMovil` (`Cabecera-logica.ts`) por
 * construcción — no se reimplementa esa regla aquí, solo se usa un valor que
 * la cumple.
 */
export const ANCHO_ANTES_DE_MEDIR = 0

/** Ancho real y vivo de `window.innerWidth`, actualizado en cada `resize` (Decisión 22). */
function useAnchoDeVentana(): number {
  const [ancho, setAncho] = useState(ANCHO_ANTES_DE_MEDIR)

  useEffect(() => {
    function leerAncho(): void {
      setAncho(window.innerWidth)
    }
    leerAncho()
    window.addEventListener('resize', leerAncho)
    return () => window.removeEventListener('resize', leerAncho)
  }, [])

  return ancho
}

/**
 * Shell común a todas las rutas (Decisión 15/19): `Cabecera` arriba,
 * enrutado en medio, `PieDePagina` y `SelectorPaleta` al cierre, fuera del
 * flujo de contenido de cada ruta.
 */
export function App(): React.JSX.Element {
  const ancho = useAnchoDeVentana()

  return (
    <BrowserRouter>
      <Cabecera ancho={ancho} />
      <Routes>
        <Route path="/" element={<Landing />} />
        {RUTAS_DE_SUBPAGINA.map((ruta) => (
          <Route key={ruta} path={ruta} element={<PaginaNoEncontrada />} />
        ))}
        <Route path="*" element={<PaginaNoEncontrada />} />
      </Routes>
      <PieDePagina />
      <SelectorPaleta />
    </BrowserRouter>
  )
}
