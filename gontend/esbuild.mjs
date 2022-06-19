import {build} from 'esbuild';
import {lessLoader} from 'esbuild-plugin-less';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const watch = process.argv.includes('--watch');
const minify = process.argv.includes('--minify');

build({
  entryPoints: [path.resolve(__dirname, 'src', 'index.tsx')],
  bundle: true,
  outfile: path.resolve(__dirname, 'static', 'gontend', 'gontend.js'),
  plugins: [lessLoader()],
  loader: {
    '.ts': 'ts',
    '.svg': 'dataurl',
  },
  minify,
  watch,
});
