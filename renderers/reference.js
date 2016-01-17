module.exports = reference

var h = require('virtual-dom/h')

function reference(state) {
  var heading = state.data.reference
  return h('a.reference',
    { title: ( 'Jump to "' + heading + '"' ),
      href: ( '#Heading ' + heading ) },
    heading) }
