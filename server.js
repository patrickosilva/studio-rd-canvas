import { readFileSync } from 'fs'
import { createServer } from 'http'

const PORT = process.env.PORT || 3000

const server = createServer((req, res) => {
  try {
    let path = req.url === '/' ? '/index.html' : req.url
    const content = readFileSync(`./dist${path}`)
    res.writeHead(200)
    res.end(content)
  } catch {
    const index = readFileSync('./dist/index.html')
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(index)
  }
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`)
})