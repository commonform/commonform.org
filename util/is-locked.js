var analyze = require('commonform-analyze')

module.exports = function (form) {
  var analysis = analyze(form)
  return analysis.components.every(function (element) {
    var component = element[0]
    return !component.hasOwnProperty('upgrade')
  })
}
