module.exports = function (configuration, request, response) {
  response.statusCode = 405
  response.end()
}
