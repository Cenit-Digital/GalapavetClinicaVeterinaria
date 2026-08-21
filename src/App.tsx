import React, { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router'
import { RUTAS_DE_SUBPAGINA } from './App-logica'
import { Cabecera } from './components/Cabecera'
import { PieDePagina } from './components/PieDePagina'
import { SelectorPaleta } from './components/SelectorPaleta'
import { Landing } from './pages/Landing'
import { PaginaCampanas } from './pages/PaginaCampanas'
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

interface AppInteriorProps {
  ancho: number
}

/**
 * Contenido del shell que sí es descendiente de `<BrowserRouter>`: solo aquí
 * puede leerse la ruta activa con `useLocation()`, para dársela a `Cabecera`
 * (mismo patrón que `ancho`, Decisión 22) y que marque el enlace de
 * navegación actual con `aria-current="page"` (`pagina_campanas.feature` @s1).
 */
function AppInterior({ ancho }: AppInteriorProps): React.JSX.Element {
  const { pathname } = useLocation()

  return (
    <>
      <Cabecera ancho={ancho} rutaActual={pathname} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/campanas" element={<PaginaCampanas />} />
        {RUTAS_DE_SUBPAGINA.map((ruta) => (
          <Route key={ruta} path={ruta} element={<PaginaNoEncontrada />} />
        ))}
        <Route path="*" element={<PaginaNoEncontrada />} />
      </Routes>
      <PieDePagina />
      <SelectorPaleta />
    </>
  )
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
      <AppInterior ancho={ancho} />
    </BrowserRouter>
  )
}
