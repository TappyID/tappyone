const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8082;
const uploadsPath = path.join(__dirname, 'backend', 'uploads');

// MIME types
const mimeTypes = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.oga': 'audio/ogg',
  '.ogg': 'audio/ogg',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4'
};

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url);
  const pathname = parsedUrl.pathname;

  console.log(`[${new Date().toISOString()}] ${req.method} ${pathname}`);

  // Health check
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', message: 'Media Server Running' }));
    return;
  }

  // Servir arquivos de mídia
  if (pathname.startsWith('/media/')) {
    const filePath = pathname.replace('/media/', '');
    const fullPath = path.join(uploadsPath, filePath);

    // Verificar se o arquivo existe
    fs.access(fullPath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error(`Arquivo não encontrado: ${fullPath}`);
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File not found');
        return;
      }

      // Determinar MIME type
      const ext = path.extname(fullPath).toLowerCase();
      const mimeType = mimeTypes[ext] || 'application/octet-stream';

      // Ler e servir o arquivo
      fs.readFile(fullPath, (err, data) => {
        if (err) {
          console.error(`Erro ao ler arquivo: ${err}`);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
          return;
        }

        res.writeHead(200, { 
          'Content-Type': mimeType,
          'Content-Length': data.length
        });
        res.end(data);
      });
    });
    return;
  }

  // 404 para outras rotas
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`🎬 Media Server rodando na porta ${PORT}`);
  console.log(`📁 Servindo arquivos de: ${uploadsPath}`);
  console.log(`🌐 Acesse: http://localhost:${PORT}/media/`);
});
