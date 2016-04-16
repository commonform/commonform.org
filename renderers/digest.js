module.exports = digest

var h = require('virtual-dom/h')
var formPrefix = require('../utility/constants').formPrefix

function digest(digest) {
  return h('a.digest',
    { target: '_blank',
      href: ( formPrefix + digest ) },
    [ digest.slice(0, 32),
      h('wbr'),
      digest.slice(32) ]) }
