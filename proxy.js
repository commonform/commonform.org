// Proxy HTTP requests to the local test API server on port 8081,
// modifying headers to enable CORS and prevent caching.
var corsify = require('corsify')
var doNotCache = require('do-not-cache')
var http = require('http')
var httpProxy = require('http-proxy')

var proxy = httpProxy.createProxyServer({})
.on('proxyRes', function (proxyResponse, request, response) {
  var headers = [
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
  headers.forEach(function (header) {
    response.setHeader(header[0], header[1])
  })
  doNotCache(response)
})

http
.createServer(corsify(function (request, response) {
  proxy.web(request, response, {
    target: 'http://localhost:8081'
  })
}))
.listen(process.env.PORT || 8080)
