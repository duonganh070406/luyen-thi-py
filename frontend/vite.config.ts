import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '');
  const fPort = parseInt(env.FRONTEND_PORT || '3000');
  const bPort = env.BACKEND_PORT || '8000';
  const bHost = env.VITE_PROXY_HOST || '127.0.0.1';
  const bUrl = `http://${bHost}:${bPort}`;

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: fPort,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/api': {
          target: bUrl,
          changeOrigin: true,
        },
        '/health': {
          target: bUrl,
          changeOrigin: true,
        },
        '/data': {
          target: bUrl,
          changeOrigin: true,
        },
      },
    },
  };
});
