var h = require('virtual-dom/h')

var URL_PREFIX = 'https://npmjs.com/packages/commonform-'
var SOURCE_URLS = [ 'archaic', 'critique', 'lint' ]
  .reduce(
    function(urls, module) {
      urls['commonform-' + module] = URL_PREFIX + module
      return urls },
    { })

function annotation(state) {
  var data = state.data
  var source = data.source
  return h(( 'p.' + data.level ), [
    ( data.url ?
      h('a', { href: data.url }, data.message) :
      data.message ),
    ' (',
    h('a', { href: SOURCE_URLS[source], target: '_blank' }, source),
    ')' ]) }

module.exports = annotation
