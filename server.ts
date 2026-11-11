import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;
const distPath = path.resolve(__dirname, 'dist');
const publicPath = path.resolve(__dirname, 'public');

// Serve static assets from dist
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Also serve public folder
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
}

// Health check endpoint
app.get('/healthz', (_req, res) => {
  res.status(200).send('OK');
});

// SPA fallback: return index.html for any route
app.get('*', (_req, res) => {
  const indexHtml = path.join(distPath, 'index.html');
  if (fs.existsSync(indexHtml)) {
    res.sendFile(indexHtml);
  } else {
    res.status(200).send(`
      <!doctype html>
      <html>
        <head><title>Loading...</title></head>
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
