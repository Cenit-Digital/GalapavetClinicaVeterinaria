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
    css: false,

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
