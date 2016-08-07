var loading = require('./loading')

module.exports = function redirectToForm (state, prev, send) {
  var params = state.params
  return loading(function () {
    send('form:redirectToForm', params)
  })
}
