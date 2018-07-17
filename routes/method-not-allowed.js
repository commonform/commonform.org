module.exports = function (request, response) {
  response.statusCode = 405
  response.end()
}
