import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url);
export const projectRoot = path.resolve(import.meta.dirname, '..');

// Test-only transpilation of trusted repository data modules, without a bundler.
export function loadTs(file, override) {
  const cache = new Map();
  function load(filename, sourceOverride) {
    const full = path.resolve(filename);
    if (cache.has(full)) return cache.get(full).exports;
    const loadedModule = { exports: {} };
    cache.set(full, loadedModule);
    const source = sourceOverride ?? fs.readFileSync(full, 'utf8');
    const compiled = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
      fileName: full,
    }).outputText;
    const localRequire = (specifier) => {
      if (!specifier.startsWith('.')) return require(specifier);
      const base = path.resolve(path.dirname(full), specifier);
      const candidate = [base, base + '.ts', path.join(base, 'index.ts')].find((p) => fs.existsSync(p) && fs.statSync(p).isFile());
      if (!candidate) throw new Error('Cannot resolve ' + specifier + ' from ' + full);
      if (candidate.endsWith('.json')) return JSON.parse(fs.readFileSync(candidate, 'utf8'));
      return load(candidate);
    };
    new Function('require', 'module', 'exports', compiled)(localRequire, loadedModule, loadedModule.exports);
    return loadedModule.exports;
  }
  return load(path.resolve(projectRoot, file), override);
}

export function proseSimilarity(left, right) {
  const grams = (text) => {
    const clean = text.replace(/[\s\p{P}\p{S}]/gu, '').toLowerCase();
    return new Set(Array.from({ length: Math.max(0, clean.length - 4) }, (_, i) => clean.slice(i, i + 5)));
  };
  const a = grams(left), b = grams(right);
  const common = [...a].filter((gram) => b.has(gram)).length;
  return common / Math.max(1, a.size + b.size - common);
}
