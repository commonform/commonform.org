// Proxy HTTP requests to the local test API server on port 8081,
// modifying headers to enable CORS and prevent caching.
var corsify = require('corsify')
var doNotCache = require('do-not-cache')
var http = require('http')
var httpProxy = require('http-proxy')

var proxy = httpProxy.createProxyServer({})

http
.createServer(corsify(function (request, response) {
  var newHeaders = [
    ['Pragma', 'no-cache'],
    ['Expires', '0'],
    ['Cache-Control', 'no-cache, no-store, must-revalidate'],
    ['Access-Control-Allow-Origin', 'http://localhost:8000'],
    ['Access-Control-Allow-Credentials', 'true'],
    [
      'Access-Control-Allow-Headers', [
        'Cache-Control',
        'Content-Type',
        'DNT',
        'If-Modified-Since',
        'Keep-Alive',
        'User-Agent',
        'X-CustomHeader',
        'X-Requested-With'
      ].join(', ')
    ],
    ['Access-Control-Allow-Methods', http.METHODS.join(', ')],
    [
      'Access-Control-Expose-Headers', [
        'Content-Type',
        'Location'
      ].join()
    ]
  ]
  var oldWriteHead = response.writeHead
  response.writeHead = function (code, headers) {
    newHeaders.forEach(function (newHeader) {
      response.setHeader(newHeader[0], newHeader[1])
      if (headers && headers[newHeader[0]]) {
        delete headers[newHeader[0]]
      }
    })
    oldWriteHead.apply(response, arguments)
  }
  proxy.web(request, response, {
    target: process.env.TARGET || 'http://localhost:8081',
    secure: false
  })
}))
.listen(process.env.PORT || 8080)
