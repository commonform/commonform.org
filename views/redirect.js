var loading = require('./loading')

module.exports = function (state, prev, send) {
  var params = state.params
  return loading(function () {
    var data = {
      publisher: params.publisher,
      project: params.project,
      edition: params.edition || 'current'
    }
    send('redirect', data)
  })
}
