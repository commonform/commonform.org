module.exports = heading

var h = require('virtual-dom/h')

function heading(heading) {
  var properties = { id: ( 'Heading ' + heading ) }
  return h('p.heading', properties, heading) }
