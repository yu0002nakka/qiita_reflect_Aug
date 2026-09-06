import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub Pages supplies its public path during deployment.
  base: process.env.PAGES_BASE_PATH || '/',
});
