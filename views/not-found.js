var assert = require('assert')
var sidebar = require('./sidebar')

module.exports = function notFound (send) {
  assert(typeof send === 'function')
  var div = document.createElement('div')
  div.className = 'container'

  var article = document.createElement('article')
  article.className = 'commonform'

  article.appendChild(sidebar(null, send))

  var p = document.createElement('p')
  p.appendChild(document.createTextNode('Not found.'))
  article.appendChild(p)

  div.appendChild(article)

  return div
}
