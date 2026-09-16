// Local equivalent of the production /r mount. Run Next on 3010 first.
import http from 'node:http'

const upstreamPort = Number(process.env.PREVIEW_UPSTREAM_PORT || 3010)
const port = Number(process.env.PREVIEW_PORT || 3011)
http.createServer((request, response) => {
  if (request.url === '/r' || request.url === '/r//') {
    response.writeHead(308, { Location: `http://localhost:${port}/r/` })
    response.end()
    return
  }
  const path = request.url.replace(/^\/r(?=\/|\?|$)/, '') || '/'
  const upstream = http.request({
    hostname: '127.0.0.1', port: upstreamPort,
    method: request.method, path: path.startsWith('?') ? `/${path}` : path,
    headers: { ...request.headers, host: `localhost:${upstreamPort}` }
  }, (result) => {
    const headers = { ...result.headers }
    if (headers.location?.startsWith('/') && !/^\/r(?:\/|\?|$)/.test(headers.location)) {
      headers.location = `/r${headers.location}`
    }
    response.writeHead(result.statusCode, headers)
    result.pipe(response)
  })
  upstream.on('error', () => {
    response.writeHead(502, { 'Content-Type': 'text/plain' })
    response.end('Start the Next.js server on the preview upstream port first.')
  })
  request.pipe(upstream)
}).listen(port, '127.0.0.1', () => {
  console.log(`Local preview: http://localhost:${port}/r/`)
})
