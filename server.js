import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

const server = createServer((req, res) => {
  console.log(`📥 Requisição: ${req.method} ${req.url}`);
  
  try {
    // Determina o caminho do arquivo
    let path = req.url === '/' ? '/index.html' : req.url;
    
    // Constrói o caminho absoluto para a pasta dist
    const filePath = join(__dirname, 'dist', path);
    
    // Lê o arquivo
    const content = readFileSync(filePath);
    
    // Define o tipo de conteúdo
    let contentType = 'text/html';
    if (path.endsWith('.js')) contentType = 'application/javascript';
    else if (path.endsWith('.css')) contentType = 'text/css';
    else if (path.endsWith('.json')) contentType = 'application/json';
    else if (path.endsWith('.png')) contentType = 'image/png';
    else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) contentType = 'image/jpeg';
    else if (path.endsWith('.svg')) contentType = 'image/svg+xml';
    else if (path.endsWith('.ico')) contentType = 'image/x-icon';
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
    console.log(`✅ Arquivo servido: ${path}`);
    
  } catch (err) {
    console.log(`❌ Erro ao servir ${req.url}:`, err.message);
    
    // Tenta servir o index.html (para SPA)
    try {
      const indexPath = join(__dirname, 'dist', 'index.html');
      const index = readFileSync(indexPath);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(index);
      console.log(`✅ Fallback: index.html servido`);
    } catch (error) {
      console.log(`❌ ERRO CRÍTICO: index.html também não encontrado!`);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Erro interno: ${error.message}`);
    }
  }
});

server.listen(PORT, HOST, () => {
  console.log(`✅ Server rodando em http://${HOST}:${PORT}`);
  console.log(`📂 Servindo arquivos de: ${join(__dirname, 'dist')}`);
});