import {esbuildPlugin} from '@web/dev-server-esbuild';
import {conPlugin} from './tools/index.js';

export default {
  mimeTypes: {
    '**/*.con': 'js',
  },
  plugins: [
    esbuildPlugin({ts: true}),
    conPlugin(),
  ],
  rootDir: 'src',
};