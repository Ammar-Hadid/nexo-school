import { build } from 'esbuild';
import { mkdir, copyFile } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
await build({ entryPoints: ['public/client.mjs'], bundle: true, outfile: 'dist/client.js', platform: 'browser', format: 'esm', target: ['chrome120', 'safari17'], minify: true, sourcemap: false });
await Promise.all(['index.html', 'style.css'].map(file => copyFile(`public/${file}`, `dist/${file}`)));
