import { act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * `src/main.tsx` es el punto de entrada real: ejecuta efectos secundarios
 * (monta la app) en el momento en que se importa. Cada test necesita una
 * copia fresca del módulo, así que se resetea el registro de módulos y se
 * importa dinámicamente dentro del propio test (@s1/@s2).
 */
beforeEach(() => {
  vi.resetModules()
  document.body.innerHTML = ''
})

describe('@s1 el punto de entrada monta la aplicación en el elemento #root', () => {
  it('el elemento con id "root" deja de estar vacío tras ejecutar main.tsx', async () => {
    const raiz = document.createElement('div')
    raiz.id = 'root'
    document.body.append(raiz)

    await act(async () => {
      await import('./main')
    })

    expect(raiz.childElementCount).toBeGreaterThan(0)
  })
})

describe('@s2 sin #root en el documento, el punto de entrada falla con una excepción nombrada', () => {
  it('lanza una excepción cuyo mensaje menciona "root" y no monta nada en el documento', async () => {
    document.body.innerHTML = ''

    const promesaMain = import('./main')

    await expect(promesaMain).rejects.toThrow(/root/)
    // Refuerzo de mutación: `assertThrows` de chai solo compara el mensaje
    // contra el regex si el valor capturado es truthy. Un `throw undefined`
    // (o cualquier valor falsy) satisface `rejects.toThrow(/root/)` sin decir
    // nada sobre el mensaje, así que se exige además que lo rechazado sea una
    // instancia real de `Error`.
    await expect(promesaMain).rejects.toBeInstanceOf(Error)

    expect(document.body.childElementCount).toBe(0)
  })
})
