import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function leerJsonDeProyecto(nombre) {
  return JSON.parse(readFileSync(new URL(`../../${nombre}`, import.meta.url), 'utf8'));
}

test('@s1 configuracion: la mutacion global delega la superficie a Stryker sin argumentos vacios', () => {
  const harness = leerJsonDeProyecto('harness.config.json');

  assert.deepEqual(harness.mutation.targets, []);
  assert.equal(harness.commands.mutate, 'pnpm exec stryker run');
  assert.ok(!harness.commands.mutate.includes('--mutate'));
  assert.ok(!harness.commands.mutate.includes('{{target}}'));
});

test('@s2/@s6 configuracion: la superficie efectiva conserva sus inclusiones y solo exclusiones efectivas', () => {
  const stryker = leerJsonDeProyecto('stryker.config.json');

  assert.deepEqual(stryker.mutate, [
    'src/lib/**/*.ts',
    'src/**/*-logica.ts',
    '!src/**/*.test.ts',
    '!src/**/*.test.tsx',
  ]);
  assert.equal(stryker.thresholds.break, 100);
});

test('@s5 configuracion: carga explicitamente el runner de Vitest', () => {
  const stryker = leerJsonDeProyecto('stryker.config.json');

  assert.equal(stryker.testRunner, 'vitest');
  assert.deepEqual(stryker.plugins, ['@stryker-mutator/vitest-runner']);
});

test('@s6 configuracion: elimina las dos fuentes conocidas de avisos', () => {
  const stryker = leerJsonDeProyecto('stryker.config.json');

  assert.ok(!Object.hasOwn(stryker, '_comment_concurrency'));
  assert.ok(!stryker.mutate.includes('!src/**/*.d.ts'));
});

test('@s7 configuracion: conserva limites y umbrales exactos', () => {
  const stryker = leerJsonDeProyecto('stryker.config.json');

  assert.deepEqual(stryker.thresholds, { high: 100, low: 100, break: 100 });
  assert.equal(stryker.concurrency, 1);
  assert.equal(stryker.timeoutMS, 60000);
});
