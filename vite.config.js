import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Tiny HTML include: <!-- @include partials/header.html -->
const htmlInclude = () => ({
  name: 'html-include',
  transformIndexHtml: {
    order: 'pre',
    handler: function include(html) {
      return html.replace(/<!--\s*@include\s+([\w./-]+)\s*-->/g, (_, file) =>
        include(readFileSync(resolve(import.meta.dirname, file), 'utf-8'))
      );
    },
  },
});

export default defineConfig({
  base: './',
  plugins: [htmlInclude()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        curtains: resolve(import.meta.dirname, 'curtains.html'),
        albinoni: resolve(import.meta.dirname, 'villa-albinoni.html'),
        outdoor: resolve(import.meta.dirname, 'outdoor.html'),
        showrooms: resolve(import.meta.dirname, 'showrooms.html'),
        showroomInteriors: resolve(import.meta.dirname, 'showroom-interiors.html'),
        showroomOutdoor: resolve(import.meta.dirname, 'showroom-outdoor.html'),
        professionals: resolve(import.meta.dirname, 'professionals.html'),
        projects: resolve(import.meta.dirname, 'projects.html'),
        contact: resolve(import.meta.dirname, 'contact.html'),
      },
    },
  },
});
