import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'

const ID_ELEMENTO_RAIZ = 'root'

/** Mismo patrón que `errorTelefonoNoValido` (`src/lib/telefono.ts`): una función nombrada que construye el error, en vez de una aserción de tipos silenciosa (Decisión 21, `project-spec.md`). */
function errorElementoRaizAusente(): Error {
  return new Error(`No se encontró ningún elemento con id "${ID_ELEMENTO_RAIZ}" donde montar la aplicación.`)
}

function elementoRaiz(): HTMLElement {
  const elemento = document.getElementById(ID_ELEMENTO_RAIZ)
  if (elemento === null) {
    throw errorElementoRaizAusente()
  }
  return elemento
}

const arbol: React.JSX.Element = <App />

ReactDOM.createRoot(elementoRaiz()).render(arbol)
