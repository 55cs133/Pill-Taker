import react from '@vitejs/plugin-react-swc';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendPort = env.VITE_BACKEND_PORT || '8080';

  return {
    plugins: [
      tsconfigPaths(),
      react(),
    ],
    css: {
      postcss: {
        plugins: [
          tailwindcss(),
          autoprefixer(),
        ],
      },
      devSourcemap: true,
    },
    server: {
      port: env.PORT ? parseInt(env.PORT, 10) : 3000,
      proxy: {
        '/login': `http://localhost:${backendPort}`,
        '/treatments': `http://localhost:${backendPort}`,
        '/user-info': `http://localhost:${backendPort}`,
        '/flash': `http://localhost:${backendPort}`,
        '/telegram': `http://localhost:${backendPort}`,
      },
    },
  };
});
