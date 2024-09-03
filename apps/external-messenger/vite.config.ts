/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import fs from "fs";
import path from "path";

const filePath1 = path.join(__dirname, '../../.ssl/beta.amsconnectapp.com.key.pem');
const filePath2 = path.join(__dirname, '../../.ssl/beta.amsconnectapp.com.crt.pem');

export default defineConfig({
  cacheDir: '../../node_modules/.vite/external-messenger',

  server: {
    https: {
      key: fs.readFileSync(filePath1),
      cert: fs.readFileSync(filePath2)
    },
    port: 5106,
    host: 'beta.amsconnectapp.com',
  },

  preview: {
    port: 5106,
    host: 'beta.amsconnectapp.com',
  },

  plugins: [react(), nxViteTsPaths()],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },

  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
