import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

// Thu muc root cua repo (chua .env + .env.sample dung chung cho ca du an).
const ROOT = path.resolve(__dirname, '..');

/** Parse noi dung kieu dotenv thanh dict (khong phu thuoc thu vien ngoai). */
function parseEnvFile(file: string): Record<string, string> {
  const out: Record<string, string> = {};
  let content: string;
  try {
    content = fs.readFileSync(file, 'utf-8');
  } catch {
    return out;
  }
  for (const rawLine of content.split(/\r?\n/)) {
    let line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    if (line.startsWith('export ')) line = line.slice(7).trim();
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (val.length >= 2 && ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))) {
      val = val.slice(1, -1);
    }
    if (key) out[key] = val;
  }
  return out;
}

export default defineConfig(({mode}) => {
  // Thu tu uu tien (cao -> thap):
  //   1. Bien moi truong that (export / Docker environment)
  //   2. File `.env` (.local / theo mode) o root
  //   3. File `.env.sample` o root (mac dinh chung, duoc commit)
  // Vite tu than khong doc `.env.sample`, nen nap tay lam fallback.
  const sample = parseEnvFile(path.join(ROOT, '.env.sample'));
  const files = loadEnv(mode, ROOT, '');
  const merged = {...sample, ...files};
  for (const [k, v] of Object.entries(merged)) {
    if (process.env[k] === undefined) process.env[k] = v;
  }
  // Map APP_* -> VITE_APP_* cho phia client khi chua dat VITE_* rieng.
  if (process.env.VITE_APP_NAME === undefined && process.env.APP_NAME !== undefined) {
    process.env.VITE_APP_NAME = process.env.APP_NAME;
  }
  if (process.env.VITE_APP_VERSION === undefined && process.env.APP_VERSION !== undefined) {
    process.env.VITE_APP_VERSION = process.env.APP_VERSION;
  }

  const get = (k: string, d: string) => process.env[k] || merged[k] || d;
  const fPort = parseInt(get('FRONTEND_PORT', '3000'));
  const bPort = get('BACKEND_PORT', '8000');
  const bHost = get('VITE_PROXY_HOST', '127.0.0.1');
  const bUrl = `http://${bHost}:${bPort}`;

  return {
    // Doc env phia client (import.meta.env.VITE_*) tu root thay vi frontend/,
    // de 1 file `.env` duy nhat dieu khien ca backend + frontend.
    envDir: ROOT,
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
