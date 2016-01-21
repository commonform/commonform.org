module.exports = footer

var h = require('virtual-dom/h')

function footer() {
  return h('footer',
    [ h('p',
        [ h('a',
            { href: 'http://typographyforlawyers.com/equity.html' },
            'Equity'),
          ' and ',
          h('a',
            { href: 'http://practicaltypography.com/triplicate.html' },
            'Triplicate'),
          ' typefaces by ',
          h('a',
            { href: 'http://typographyforlawyers.com/about.html' },
            'Matthew Butterick'),
          '.' ]),
      h('p',
        [ h('a.openSource',
          { href: 'https://github.com/commonform',
            target: '_blank' },
          'Common Form is open-source software.') ]) ]) }
