import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import express from 'express';
import {defineConfig, loadEnv, type Plugin} from 'vite';
import { handleChat } from './server/chat';

function localChat(env: Record<string, string | undefined>): Plugin {
  return {
    name: 'portfolio-chat-api',
    configureServer(server) {
      const app = express();
      app.use('/api/chat', express.text({ type: 'application/json', limit: '20kb' }));
      app.all('/api/chat', async (req, res) => {
        try {
          const headers = new Headers();
          for (const [key, value] of Object.entries(req.headers)) if (typeof value === 'string') headers.set(key, value);
          const request = new Request(`http://${req.headers.host}${req.originalUrl}`, { method: req.method, headers, ...(['GET', 'HEAD'].includes(req.method) ? {} : { body: req.body || '' }) });
          const result = await handleChat(request, { ...env, VERCEL: '0' });
          result.headers.forEach((value, key) => res.setHeader(key, value));
          res.status(result.status).send(await result.text());
        } catch { res.status(500).json({ error: 'The local chat server is unavailable.' }); }
      });
      app.use((error: { status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
        res.status(error.status === 413 ? 413 : 400).json({ error: 'Please send a shorter, valid request.' });
      });
      server.middlewares.use(app);
    },
  };
}

export default defineConfig(({ mode }) => {
  return {
    base: './',
    // loadEnv stays inside this Node config; never put it in define or client code.
    plugins: [react(), tailwindcss(), localChat({ ...loadEnv(mode, process.cwd(), ''), ...process.env })],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
