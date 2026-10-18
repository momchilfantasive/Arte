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
  plugins: [htmlInclude()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        about: resolve(import.meta.dirname, 'about.html'),
        projects: resolve(import.meta.dirname, 'projects.html'),
        contact: resolve(import.meta.dirname, 'contact.html'),
      },
    },
  },
});
