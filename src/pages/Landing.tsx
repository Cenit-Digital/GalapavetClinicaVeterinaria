import React from 'react'
import { CampanasPortada } from '../components/CampanasPortada'
import { Equipo } from '../components/Equipo'
import { Faq } from '../components/Faq'
import { FormularioContacto } from '../components/FormularioContacto'
import { Galeria } from '../components/Galeria'
import { Hero } from '../components/Hero'
import { InformacionContacto } from '../components/InformacionContacto'
import { ReservaChat } from '../components/ReservaChat'
import { Servicios } from '../components/Servicios'

/**
 * Contenido de la ruta "/": compone los 12 componentes ya `done` en el orden
 * de trabajo de la Decisión 16 (`project-spec.md`). El `id` de cada ancla lo
 * asigna este fichero envolviendo el componente correspondiente — ninguno de
 * los 12 declara su propio `id` (Decisión 17): no se tocan.
 */
export function Landing(): React.JSX.Element {
  return (
    <>
      <div id="inicio">
        <Hero />
      </div>
      <div id="servicios">
        <Servicios />
      </div>
      <CampanasPortada />
      <div id="equipo">
        <Equipo />
      </div>
      <div id="reservar">
        <ReservaChat />
      </div>
      <div id="galeria">
        <Galeria />
      </div>
      <div id="contacto">
        <FormularioContacto />
        <InformacionContacto />
      </div>
      <div id="faq">
        <Faq />
      </div>
    </>
  )
}
