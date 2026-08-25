import React from 'react'
import { CampanasPortada } from '../components/CampanasPortada'
import { Equipo } from '../components/Equipo'
import { Faq } from '../components/Faq'
import { FormularioContacto } from '../components/FormularioContacto'
import { Galeria } from '../components/Galeria'
import { Hero } from '../components/Hero'
import { InformacionContacto } from '../components/InformacionContacto'
import { MetadatosPagina } from '../components/MetadatosPagina'
import { ReservaChat } from '../components/ReservaChat'
import { Servicios } from '../components/Servicios'
import { DATOS_ESTRUCTURADOS_NEGOCIO } from '../lib/datosEstructuradosNegocio'
import { construirDatosEstructurados, METADATOS_INICIO } from '../lib/seo-logica'
import { datosNegocio } from '../lib/site'
import styles from './Landing.module.scss'

interface LandingProps {
  /**
   * Calle de la dirección postal. Por defecto, la de la fuente única.
   * Sustituible solo para la prueba de coherencia entre lo visible y el
   * bloque de datos estructurados (`seo_estructura.feature` @s11): cuando
   * cambia, tanto el texto visible como el bloque se recalculan a partir de
   * ella, nunca de forma independiente.
   */
  calleDireccion?: string
}

/**
 * Contenido de la ruta "/": compone los 12 componentes ya `done` en el orden
 * de trabajo de la Decisión 16 (`project-spec.md`). El `id` de cada ancla lo
 * asigna este fichero envolviendo el componente correspondiente — ninguno de
 * los 12 declara su propio `id` (Decisión 17): no se tocan.
 */
export function Landing({ calleDireccion = datosNegocio.direccion.calle }: LandingProps = {}): React.JSX.Element {
  const esLaCalleReal = calleDireccion === datosNegocio.direccion.calle
  const direccionVisible: readonly [string, string] = [calleDireccion, datosNegocio.direccion.lineas[1]]
  const datosEstructurados = esLaCalleReal
    ? DATOS_ESTRUCTURADOS_NEGOCIO
    : construirDatosEstructurados({
        nombreComercial: datosNegocio.identidad.nombreComercial,
        direccion: { ...datosNegocio.direccion, calle: calleDireccion },
        telefonoClinica: datosNegocio.telefonoClinica.textoVisible,
        horario: datosNegocio.horario,
        email: datosNegocio.email,
        redesSociales: datosNegocio.redesSociales,
      })

  return (
    <>
      <MetadatosPagina metadatos={METADATOS_INICIO} datosEstructurados={datosEstructurados} />
      <div id="inicio" className={styles.seccion}>
        <Hero />
      </div>
      <div id="servicios" className={styles.seccionAlterna}>
        <Servicios />
      </div>
      <CampanasPortada />
      <div id="equipo" className={styles.seccionAlterna}>
        <Equipo />
      </div>
      <div id="reservar" className={styles.seccion}>
        <ReservaChat />
      </div>
      <div id="galeria" className={styles.seccionAlterna}>
        <Galeria />
      </div>
      <div id="contacto" className={styles.seccion}>
        <FormularioContacto />
        <InformacionContacto direccion={direccionVisible} />
      </div>
      <div id="faq" className={styles.seccionAlterna}>
        <Faq />
      </div>
    </>
  )
}
