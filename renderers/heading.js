module.exports = heading

var h = require('virtual-dom/h')

function heading(heading) {
  return h('p.heading',
    { id: ( 'Heading ' + heading ) },
    heading) }
