var assert = require('assert')

module.exports = function digestLink (digest) {
  assert(typeof digest === 'string')
  var div = document.createElement('div')
  // <a class=digest href=...>$digest</a>
  var link = document.createElement('a')
  link.className = 'digest'
  link.setAttribute('href', '/forms/' + digest)
  link.appendChild(document.createTextNode(digest.slice(0, 32)))
  link.appendChild(document.createElement('wbr'))
  link.appendChild(document.createTextNode(digest.slice(32)))
  div.appendChild(link)
  // <a class=copy ...></a>
  var copy = document.createElement('a')
  copy.title = 'Copy ID to clipboard.'
  copy.setAttribute('data-clipboard-text', digest)
  copy.className = 'copy'
  div.appendChild(copy)
  return div
}
