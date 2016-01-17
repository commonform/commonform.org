module.exports = heading

var h = require('virtual-dom/h')

function heading(state) {
  var heading = state.heading
  if (heading) {
    return h('p.heading',
      { id: ( 'Heading ' + heading ) },
      heading) } }
