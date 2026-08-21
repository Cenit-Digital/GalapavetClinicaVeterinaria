import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Equipo } from '../components/Equipo'
import { Faq } from '../components/Faq'
import { FormularioContacto } from '../components/FormularioContacto'
import { Galeria } from '../components/Galeria'
import { Hero } from '../components/Hero'
import { InformacionContacto } from '../components/InformacionContacto'
import { ReservaChat } from '../components/ReservaChat'
import { Servicios } from '../components/Servicios'
import { Landing } from './Landing'

const IDS_DE_ANCLA = ['inicio', 'servicios', 'equipo', 'reservar', 'galeria', 'contacto', 'faq']

/** Centraliza el render de `Landing` bajo test y usa `React` en posición de tipo. */
function renderizarLanding(): ReturnType<typeof render> {
  const arbol: React.JSX.Element = <Landing />
  return render(arbol)
}

/** `true` si `anterior` aparece antes que `siguiente` en el orden real del documento. */
function apareceAntes(anterior: Element, siguiente: Element): boolean {
  return (anterior.compareDocumentPosition(siguiente) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
}

/** Los 8 marcadores de sección de la landing, en el orden de trabajo fijado por la Decisión 16. */
function marcadoresDeSeccionEnOrden(): Element[] {
  return [
    document.getElementById('inicio'),
    document.getElementById('servicios'),
    screen.getByRole('region', { name: 'Campañas de prevención' }),
    document.getElementById('equipo'),
    document.getElementById('reservar'),
    document.getElementById('galeria'),
    document.getElementById('contacto'),
    document.getElementById('faq'),
  ].map((elemento) => {
    expect(elemento).not.toBeNull()
    return elemento as Element
  })
}

describe('@s3 las 8 secciones siguen el orden de trabajo y las 7 anclas existen una única vez', () => {
  it('los 8 marcadores aparecen en el documento en el orden exacto de la Decisión 16', () => {
    renderizarLanding()

    const marcadores = marcadoresDeSeccionEnOrden()
    for (let indice = 0; indice < marcadores.length - 1; indice += 1) {
      expect(apareceAntes(marcadores[indice] as Element, marcadores[indice + 1] as Element)).toBe(true)
    }
  })

  it('cada uno de los 7 id existe exactamente una vez, sin duplicados ni ausencias', () => {
    renderizarLanding()

    for (const id of IDS_DE_ANCLA) {
      expect(document.querySelectorAll(`#${id}`)).toHaveLength(1)
    }
  })
})

/** Los 8 componentes con ancla contratada, cada uno aislado exactamente como en su propio archivo de test aprobado. */
const COMPONENTES_CON_ANCLA: ReadonlyArray<readonly [string, React.JSX.Element]> = [
  ['Hero', <Hero key="Hero" />],
  ['Servicios', <Servicios key="Servicios" />],
  ['Equipo', <Equipo key="Equipo" />],
  ['ReservaChat', <ReservaChat key="ReservaChat" />],
  ['Galeria', <Galeria key="Galeria" />],
  ['FormularioContacto', <FormularioContacto key="FormularioContacto" />],
  ['InformacionContacto', <InformacionContacto key="InformacionContacto" />],
  ['Faq', <Faq key="Faq" />],
]

describe('@s4 el id de cada ancla lo asigna Landing.tsx, nunca los propios componentes de sección', () => {
  it.each(COMPONENTES_CON_ANCLA)('%s aislado no contiene ninguno de los 7 id de ancla', (_nombre, elemento) => {
    const { unmount } = render(elemento)
    for (const id of IDS_DE_ANCLA) {
      expect(document.querySelectorAll(`#${id}`)).toHaveLength(0)
    }
    unmount()
  })

  it('al montar la ruta "/" completa, esos mismos 7 id sí existen', () => {
    renderizarLanding()
    for (const id of IDS_DE_ANCLA) {
      expect(document.querySelectorAll(`#${id}`)).toHaveLength(1)
    }
  })
})

describe('@s5 CampanasPortada se renderiza sin ancla propia y sigue enlazando a la página de campañas', () => {
  it('no existe ningún id "campanas" y sus tarjetas y su enlace "Ver campañas" apuntan a "/campanas"', () => {
    renderizarLanding()

    expect(document.querySelectorAll('#campanas')).toHaveLength(0)

    const region = screen.getByRole('region', { name: 'Campañas de prevención' })
    const enlaces = within(region).getAllByRole('link')
    expect(enlaces.length).toBeGreaterThan(0)
    for (const enlace of enlaces) {
      expect(enlace).toHaveAttribute('href', '/campanas')
    }
  })
})

describe('@s6 la sección Contacto agrupa el formulario y el panel de información sin nombre accesible propio', () => {
  it('primero "Escríbenos" y después "Información de contacto", sin aria-label/aria-labelledby en el contenedor', () => {
    renderizarLanding()

    const contenedor = document.getElementById('contacto')
    expect(contenedor).not.toBeNull()
    const formulario = within(contenedor as HTMLElement).getByRole('form', { name: 'Escríbenos' })
    const informacion = within(contenedor as HTMLElement).getByRole('region', { name: 'Información de contacto' })
    expect(apareceAntes(formulario, informacion)).toBe(true)

    expect(contenedor).not.toHaveAttribute('aria-label')
    expect(contenedor).not.toHaveAttribute('aria-labelledby')
  })

  it('no existe en todo el documento ninguna región, landmark ni encabezado adicional llamado "Contacto"', () => {
    renderizarLanding()

    expect(screen.queryByRole('heading', { name: 'Contacto' })).not.toBeInTheDocument()
    expect(document.querySelector('[aria-label="Contacto"]')).toBeNull()
  })
})
