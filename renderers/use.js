module.exports = use

var h = require('virtual-dom/h')

function use(term) {
  return h('a.use',
    { title: ( 'Jump to definition of "' + term + '"' ),
      href: ( '#Definition of ' + term ) },
    term) }
