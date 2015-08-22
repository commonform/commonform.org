var h = require('virtual-dom/h')
var pathID = require('../path-id')

function errorHeader(digest, errors) {
  if (errors.length > 0) {
    return h('div.errors', [
      h('ul', errors.map(function(error) {
        return h('li', [
          h('a',
            { href: '/#' + pathID(digest, error.path.slice(0, -1)) },
            error.message) ]) })) ]) } }

module.exports = errorHeader
