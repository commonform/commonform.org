var h = require('virtual-dom/h')
var pathID = require('../path-id')

function errorHeader(errors) {
  if (errors.length > 0) {
    return h('ul.errors', errors.map(function(error) {
      return h('li', [
        h('a',
          { href: '#' + pathID(error.path.slice(0, -1)) },
          error.message) ]) })) } }

module.exports = errorHeader
