var h = require('virtual-dom/h')

function fingerprintLink(state) {
  return h('a.digest',
    { href: ( '/forms/' + state.digest ),
      target: '_blank' },
    state.digest) }

module.exports = fingerprintLink
