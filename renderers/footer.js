module.exports = footer

var h = require('virtual-dom/h')

function footer() {
  return h('footer',
    h('a.openSource',
      { href: 'https://github.com/commonform',
        target: '_blank' },
      'Common Form is open-source software.')) }
