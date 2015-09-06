var h = require('virtual-dom/h')

function reference(state) {
  var heading = state.data.reference
  return h('a.reference',
    { title: ( 'Jump to "' + heading + '"' ),
      href: ( '#heading:' + heading ) },
    heading) }

module.exports = reference
