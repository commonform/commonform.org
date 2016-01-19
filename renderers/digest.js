module.exports = digest

var h = require('virtual-dom/h')

function digest(digest) {
  return h('span.digest',
    { title: ( 'The fingerprint of this Common Form') },
    [ digest.slice(0, 32),
      h('wbr'),
      digest.slice(32) ]) }
