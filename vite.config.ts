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

    rollupOptions: {
      output: {
        // Split the dependencies that never change away from the application
        // code that changes on every deploy.
        //
        // Without this, one edit to a page invalidates a single bundle that
        // also contains React, Redux and the router, so a returning visitor
        // re-downloads all of it. Split, the vendor chunks keep their content
        // hash across deploys and come from cache.
        //
        // Charting is its own chunk rather than part of vendor: it is the
        // heaviest dependency and only four screens use it, so it should be
        // fetched when one of those screens is opened and not before. The
        // lazy routes in App.tsx are what make that possible - this only
        // decides where the code lands once it is no longer in the entry.
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-state': ['@reduxjs/toolkit', 'react-redux'],
          charts: ['chart.js', 'react-chartjs-2'],
        },
      },
    },
  },
});
