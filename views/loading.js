var assert = require('assert')
var h = require('../h')
var sidebar = require('./sidebar')

module.exports = function loading (mode, onLoadEvent) {
  assert(typeof mode === 'string')
  assert(typeof onLoadEvent === 'function')
  onLoadEvent()
  return h('div.container', [
    h('article.commonform',
      sidebar(mode, function () { }),
      'Loading…'
    )
  ])
}
