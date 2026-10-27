import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Tiny HTML include: <!-- @include partials/header.html -->
// and a repeat over content data: <!-- @each content/file.json#list partials/item.html -->
// ({{field}} is replaced with the escaped value, {{n}} with the 01-based position).
const read = (file) => readFileSync(resolve(import.meta.dirname, file), 'utf-8');
const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const htmlInclude = () => ({
  name: 'html-include',
  transformIndexHtml: {
    order: 'pre',
    handler: function include(html) {
      return html
        .replace(/<!--\s*@each\s+([\w./-]+)#(\w+)\s+([\w./-]+)\s*-->/g, (_, json, key, tpl) => {
          const t = read(tpl);
          return JSON.parse(read(json))[key]
            .map((item, i) => t.replace(/\{\{(\w+)\}\}/g, (__, k) => (k === 'n' ? String(i + 1).padStart(2, '0') : esc(item[k]))))
            .join('');
        })
        .replace(/<!--\s*@include\s+([\w./-]+)\s*-->/g, (_, file) => include(read(file)));
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
        solutions: resolve(import.meta.dirname, 'solutions.html'),
      },
    },
  },
});
