var h = require('virtual-dom/h')

var SOURCE_URLS = {
  'commonform-critique': 'https://npmjs.com/packages/commonform-critique',
  'commonform-lint': 'https://npmjs.com/packages/commonform-lint' }

function annotation(state) {
  var data = state.data
  var source = data.source
  return h('div.annotation', [
    ( data.url ?
      h('a', { href: data.url }, data.message) :
      data.message ),
    ' (',
    h('a', { href: SOURCE_URLS[source], target: '_blank' }, source),
    ')' ]) }

module.exports = annotation
