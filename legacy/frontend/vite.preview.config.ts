import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  preview: {
    port: 3000,
    proxy: {
      '/login': 'http://localhost:8081',
      '/treatments': 'http://localhost:8081',
      '/user-info': 'http://localhost:8081',
      '/flash': 'http://localhost:8081',
      '/telegram': 'http://localhost:8081',
    },
  },
});
