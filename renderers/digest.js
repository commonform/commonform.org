var h = require('virtual-dom/h')

function fingerprintLink(state) {
  var digest = state.digest
  return h('a.digest',
    { href: ( '/forms/' + digest ),
      target: '_blank' },
    [ digest.slice(0, 16),
      h('wbr'),
      digest.slice(16, 32),
      h('wbr'),
      digest.slice(32, 48),
      h('wbr'),
      digest.slice(48) ]) }

module.exports = fingerprintLink
