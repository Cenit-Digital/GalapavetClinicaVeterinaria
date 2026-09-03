import { describe, expect, it } from 'vitest'
import { construirEnlaceTelefono, describirMapa, posicionDelPin, titularDeContacto } from './InformacionContacto-logica'

describe('los enlaces de teléfono del contacto', () => {
  it('conservan el texto publicado y derivan su destino canónico', () => {
    expect(construirEnlaceTelefono('91 082 92 67')).toEqual({
      textoVisible: '91 082 92 67',
      href: 'tel:+34910829267',
    })
  })

  it('rechazan un teléfono incompleto en vez de generar un enlace parcial', () => {
    expect(() => construirEnlaceTelefono('91 082 92')).toThrow('91 082 92')
  })
})

// @s1 de `features/fidelidad_contacto.feature`: el titular de la sección no
// se copia del prototipo («Estamos a un paseo de casa»); se DERIVA de la
// localidad real de la fuente única. Igualdad exacta, con la localidad real
// y con un doble, para que la plantilla no pueda mutar sin que se note.
describe('@s1 el titular de contacto deriva de la localidad', () => {
  it('con la localidad real: "Estamos en Galapagar"', () => {
    expect(titularDeContacto('Galapagar')).toBe('Estamos en Galapagar')
  })

  it('con un doble de localidad, la plantilla es la misma y el dato cambia', () => {
    expect(titularDeContacto('Villalba')).toBe('Estamos en Villalba')
  })
})

// @s4 de `fidelidad_contacto.feature` (Decisión 63): el pin se pinta en CSS
// sobre el mapa estático local, y su posición se DERIVA de las coordenadas de
// la fuente única y del encuadre con el que se compuso la imagen
// (`docs/mapa-estatico.md`: zoom 16, teselas x 32038–32041 e y 24671–24673,
// recorte de 1024×520 desde y = 198). Encuadre y resultados escritos a mano.
const ENCUADRE_DE_GALAPAGAR = { zoom: 16, teselaX: 32038, teselaY: 24671, recorteY: 198, ancho: 1024, alto: 520 }
const NODO_GALAPAVET = { latitud: 40.5772872, longitud: -4.0004445 }

describe('@s4 la posición del pin deriva de las coordenadas y del encuadre del mapa', () => {
  it('el nodo de Galapavet cae en el 43,53 % del ancho y el 50,06 % del alto del recorte (docs/mapa-estatico.md)', () => {
    expect(posicionDelPin(NODO_GALAPAVET, ENCUADRE_DE_GALAPAGAR)).toEqual({ x: 43.53, y: 50.06 })
  })

  it('la esquina superior izquierda del recorte cae en 0 % / 0 % y la inferior derecha en 100 % / 100 %', () => {
    expect(posicionDelPin({ latitud: 40.5815298791415, longitud: -4.010009765625 }, ENCUADRE_DE_GALAPAGAR)).toEqual({ x: 0, y: 0 })
    expect(posicionDelPin({ latitud: 40.573055060730084, longitud: -3.988037109375 }, ENCUADRE_DE_GALAPAGAR)).toEqual({ x: 100, y: 100 })
  })

  it('una tesela más al este (360° / 2^16) desplaza el pin exactamente 256 px, un cuarto del ancho', () => {
    const unaTesela = 360 / 2 ** 16
    expect(posicionDelPin({ ...NODO_GALAPAVET, longitud: NODO_GALAPAVET.longitud + unaTesela }, ENCUADRE_DE_GALAPAGAR)).toEqual({ x: 68.53, y: 50.06 })
  })
})

describe('@s4 el texto alternativo del mapa deriva del nombre y la dirección reales', () => {
  it('con los datos reales', () => {
    expect(describirMapa('Galapavet', 'Carretera de Torrelodones, 11, 28260 Galapagar, Madrid')).toBe(
      'Mapa con la ubicación de Galapavet en Carretera de Torrelodones, 11, 28260 Galapagar, Madrid',
    )
  })

  it('con dobles: la plantilla no lleva ningún dato retipeado', () => {
    expect(describirMapa('Clínica Doble', 'Calle Falsa, 1')).toBe('Mapa con la ubicación de Clínica Doble en Calle Falsa, 1')
  })
})
