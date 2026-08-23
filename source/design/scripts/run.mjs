// Transpiles a .jsx build script with esbuild (JSX -> React.createElement) and runs it.
// Usage: node source/design/scripts/run.mjs source/design/scripts/build-prototype.jsx
import * as esbuild from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const entry = process.argv[2];
if (!entry) {
  console.error('Usage: node run.mjs <entry.jsx>');
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const entryAbs = path.resolve(process.cwd(), entry);
const outfile = path.join(__dirname, '.build', path.basename(entry).replace(/\.jsx$/, '.mjs'));

await esbuild.build({
  entryPoints: [entryAbs],
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  jsx: 'automatic',
  jsxImportSource: 'react',
  outfile,
  logLevel: 'warning',
});

await import(`file://${outfile}?t=${Date.now()}`);
