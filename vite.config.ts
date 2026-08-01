import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

/* Version stamp for the dictionary manifest.
   Tier chunks are content-hashed and served immutable, but index.json is a
   fixed URL. It was once shipped with a one-year immutable header, so clients
   that loaded it then would never see a new dictionary. Appending this stamp
   to the request gives those clients a fresh URL to escape through. */
function dataVersion(): string {
  try {
    const mf = fs.readFileSync(path.resolve(__dirname, 'public/data/index.json'), 'utf8');
    let h = 0;
    for (let i = 0; i < mf.length; i++) h = (Math.imul(31, h) + mf.charCodeAt(i)) | 0;
    return Math.abs(h).toString(36);
  } catch {
    return 'dev';
  }
}

export default defineConfig(() => {
  return {
    define: {
      __DATA_VERSION__: JSON.stringify(dataVersion()),
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
