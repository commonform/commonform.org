var h = require('virtual-dom/h')

function fingerprintLink(state) {
  return h('a.fingerprint',
    { href: '/#' + state.digest,
      target: '_blank' },
    state.digest) }

module.exports = fingerprintLink
