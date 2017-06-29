var assert = require('assert')
var sidebar = require('./sidebar')

module.exports = function (mode, onLoadEvent) {
  assert(typeof mode === 'string')
  assert(typeof onLoadEvent === 'function')
  onLoadEvent()
  var div = document.createElement('div')
  div.className = 'container'
  var article = document.createElement('article')
  article.className = 'commonform'
  article.appendChild(sidebar(mode, function () { }))
  article.appendChild(document.createTextNode('Loading…'))
  div.appendChild(article)
  return div
}
