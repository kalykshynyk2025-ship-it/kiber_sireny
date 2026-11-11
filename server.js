import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;
const distPath = path.resolve(__dirname, 'dist');
const publicPath = path.resolve(__dirname, 'public');

// Self-healing: if dist doesn't exist, build it synchronously on startup
if (!fs.existsSync(path.join(distPath, 'index.html'))) {
  console.log('dist/index.html not found, running build...');
  try {
    execSync('npx vite build', { stdio: 'inherit' });
  } catch (err) {
    console.error('Failed to run build during startup:', err);
  }
}

// Disable x-powered-by
app.disable('x-powered-by');

// Health check endpoint (for Cloud Run / container orchestration)
app.get(['/healthz', '/_health'], (_req, res) => {
  res.status(200).send('OK');
});

// Serve assets directory explicitly with long-lived cache
if (fs.existsSync(path.join(distPath, 'assets'))) {
  app.use('/assets', express.static(path.join(distPath, 'assets'), {
    maxAge: '1y',
    immutable: true,
  }));
}

// Serve public/assets as fallback
if (fs.existsSync(path.join(publicPath, 'assets'))) {
  app.use('/assets', express.static(path.join(publicPath, 'assets')));
}

// Serve root static assets (favicon, robots, etc.)
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, {
    index: false, // Handle index.html manually to avoid caching HTML
  }));
}

if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath, { index: false }));
}

// Static asset 404 handler: if a request looks like an asset (has file extension), don't return HTML
app.use((req, res, next) => {
  const ext = path.extname(req.path);
  if (ext && ext !== '.html') {
    return res.status(404).send('Asset not found');
  }
  next();
});

// SPA fallback: return index.html for all page routes with no-cache headers
app.get('*', (_req, res) => {
  const indexHtml = path.join(distPath, 'index.html');
  if (fs.existsSync(indexHtml)) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(indexHtml);
  } else {
    res.status(200).send(`
      <!doctype html>
      <html lang="ru">
        <head><title>Кибер-Сирены</title></head>
        <body style="background:#0b0516;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;">
          <div>Загрузка приложения...</div>
        </body>
      </html>
    `);
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${port}`);
});
