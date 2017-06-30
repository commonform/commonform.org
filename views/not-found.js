var assert = require('assert')
var h = require('../h')
var sidebar = require('./sidebar')

module.exports = function notFound (send) {
  assert(typeof send === 'function')
  return h('div.container', [
    h('article.commonform',
      sidebar(null, send)
    ),
    h('p', 'Not found.')
  ])
}
