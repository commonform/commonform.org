var assert = require('assert')
var h = require('../h')

module.exports = function digestLink (digest) {
  assert(typeof digest === 'string')
  return h('div', [
    h('a.digest', {href: '/forms/' + digest}, [
      digest.slice(0, 32),
      h('wbr'),
      digest.slice(32)
    ]),
    h('a.copy', {
      title: 'Copy ID to clipboard.',
      'data-clipboard-text': digest
    })
  ])
}
