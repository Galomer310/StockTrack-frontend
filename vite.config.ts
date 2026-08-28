import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  build: {
    // Pinned rather than left to esbuild's default, so the browsers this app
    // supports are a decision recorded here instead of a side effect of
    // whichever esbuild version happens to be installed.
    //
    // These mirror the floor in .browserslistrc, which drives autoprefixer.
    // The two are separate systems - browserslist prefixes the CSS, this
    // transpiles the JS - and they have to be moved together or the app ships
    // syntax that its own prefixed styles imply it supports.
    target: ['chrome109', 'edge109', 'firefox115', 'safari15.4'],
  },
});
