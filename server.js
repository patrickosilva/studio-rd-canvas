import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { join } from "node:path";

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

const server = createServer((req, res) => {
  try {
    // Tenta servir o arquivo solicitado
    let path = req.url === '/' ? '/index.html' : req.url;
    const content = readFileSync(join(process.cwd(), 'dist', path)).toString();
    
    // Define o tipo de conteúdo
    if (path.endsWith('.html')) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
    } else if (path.endsWith('.js')) {
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
    } else if (path.endsWith('.css')) {
      res.writeHead(200, { 'Content-Type': 'text/css' });
    } else {
      res.writeHead(200);
    }
    res.end(content);
  } catch (err) {
    // Fallback: serve o index.html para SPA (Single Page Application)
    try {
      const index = readFileSync(join(process.cwd(), 'dist', 'index.html'));
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(index);
    } catch (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 - Arquivo não encontrado');
    }
  }
});

server.listen(PORT, HOST, () => {
  console.log(`✅ Server running on http://${HOST}:${PORT}`);
  console.log(`📱 Acesse: http://localhost:${PORT}`);
});