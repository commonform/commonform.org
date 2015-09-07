var ecstatic = require('ecstatic')({ root: __dirname + '/public', cache: 0 })
var fs = require('fs')
var http = require('http')
var replace = require('stream-replace')
var url = require('url')

http
  .createServer(function(request, response) {
    response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.setHeader('Pragma', 'no-cache')
    response.setHeader('Expires', '0')
    if (url.parse(request.url).pathname.slice(0, 7) === '/forms/') {
      response.setHeader('Content-Type', 'text/html')
      fs.createReadStream('public/index.html')
        .pipe(replace('<head>', '<head><base href="/">'))
        .pipe(response) }
    else {
      ecstatic(request, response) } })
  .listen(process.env.PORT || 8000)
