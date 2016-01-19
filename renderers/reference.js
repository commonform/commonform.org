module.exports = reference

var h = require('virtual-dom/h')

function reference(heading) {
  return h('a.reference',
    { title: ( 'Jump to "' + heading + '"' ),
      href: ( '#Heading ' + heading ) },
    heading) }
