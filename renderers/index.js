module.exports = renderers

var footer = require('./footer')
var form = require('./form')
var h = require('virtual-dom/h')
var header = require('./header')

function renderers(state) {
  var data = state.data
  if (!data) {
    return h('p', 'Loading ...') }
  else {
    var merkle = state.derived.merkle
    var path = state.path
    return h('article.commonform', [
      header({ digest: state.derived.merkle.digest }),
      form({
        data: data,
        path: path,
        derived: { merkle: merkle } }),
      footer() ]) } }
