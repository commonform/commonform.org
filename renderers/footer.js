var h = require('virtual-dom/h')

function footer() {
  return h('footer',
    [ h('ul',
        [ h('li',
            h('a.about',
              { href: 'https://commonform.github.io',
                target: '_blank' },
              'About Common Form')),
          h('li',
            h('a.openSource',
              { href: 'https://github.com/commonform',
                target: '_blank' },
              'Common Form is open-source software.')) ]) ]) }

module.exports = footer
