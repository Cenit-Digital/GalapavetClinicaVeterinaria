/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const estilos = fileURLToPath(new URL('./src/styles', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@styles': estilos,
    },
  },

  css: {
    preprocessorOptions: {
      scss: {
        // NO se declara `api`: Vite 7 eliminó el soporte de la API legacy de Sass y en
        // Vite 8 la moderna es la única, así que el warning "legacy JS API is deprecated"
        // es imposible por construcción. https://v7.vite.dev/guide/migration
        //
        // `loadPaths` (API moderna), NO `includePaths` (esa era la legacy).
        loadPaths: [estilos],
        // Silencia deprecaciones que nacen DENTRO de node_modules —las que no podemos
        // arreglar—. No silencia nada de nuestro código.
        quietDeps: true,
        additionalData: '@use "tokens" as *;\n',
      },
    },
  },

  test: {
    environment: 'jsdom',
    environmentOptions: {
      // Origen real: sin él, localStorage lanza SecurityError en jsdom.
      jsdom: { url: 'http://localhost:3000' },
    },
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],

    // Vitest no procesa CSS por defecto: los CSS Modules devuelven un proxy. Es
    // deliberado — el contrato de este repo prohíbe aseverar sobre clases CSS, así
    // que el estado condicional vive en atributos ARIA y no en nombres de clase.
    // Verificado en vivo (`sistema_de_diseno_visual.feature`): activar la
    // transformación real de CSS para las importaciones NORMALES de un
    // `.module.scss` inyecta hojas de estilo reales en jsdom, y jsdom SÍ
    // aplica `display: none` fuera de un `@media` que no evalúa como
    // verdadero — rompiendo `getByRole` de Testing Library en componentes que
    // React ya oculta/muestra por lógica (p. ej. `Cabecera`). Por eso el
    // `include` de abajo se ancla a la QUERY `?raw`, no a la extensión: Vitest
    // matchea `css.include` contra el id COMPLETO, con query
    // (`CSSEnablerPlugin`, verificado leyendo el código fuente real de Vitest
    // 4.1.10) — así que `import styles from './X.module.scss'` (sin query)
    // sigue devolviendo el proxy de siempre, y solo
    // `import.meta.glob(..., { query: '?raw' })` (usado por las puertas de
    // verificación del Bloque A/D/E/H para leer el texto REAL de
    // `_tokens.scss`/`<X>.module.scss`, patrón
    // `tokens/contraste-de-tokens-verificado-por-matriz-de-uso.md`) recibe
    // contenido real.
    css: { include: [/\?raw/] },

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      reportsDirectory: './coverage',
      // Obligatorio en Vitest 4: ya no existe `coverage.all`.
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/test/**',
        'src/main.tsx',
      ],
      reportOnFailure: true,
    },

    restoreMocks: true,
    unstubGlobals: true,
  },
})
