var sidebar = require('./sidebar')

module.exports = function error (state, hasError, send) {
  var div = document.createElement('div')
  div.className = 'container'

  var article = document.createElement('article')
  article.className = 'commonform'
  article.appendChild(sidebar('none', send))

  var p = document.createElement('p')
  p.className = 'error'
  p.appendChild(document.createTextNode(state[hasError].error.message))

  article.appendChild(p)

  div.appendChild(article)

  return div
}
