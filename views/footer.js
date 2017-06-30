var h = require('../h')

module.exports = function footer () {
  return h('footer',
    fontsCredit(),
    iconsCredit(),
    openSource()
  )
}

function fontsCredit () {
  return h('p', [
    h('a', {href: 'http://typographyforlawyers.com/equity.html'},
      'Equity'
    ),
    ' and ',
    h('a', {href: 'http://typographyforlawyers.com/triplicate.html'},
      'Triplicate'
    ),
    ' typefaces by ',
    h('a', {href: 'http://typographyforlawyers.com/about.html'},
      'Matthew Butterick'
    ),
    '.'
  ])
}

function iconsCredit () {
  return h('p', [
    h('a', {href: 'http://www.linea.io'},
      'linea icons'
    ),
    ' by Dario Ferrando.'
  ])
}

function openSource () {
  return h('p.openSource', [
    'Common Form is ',
    h('a', {href: 'https://github.com/commonform'},
      'open-source software'
    ),
    '.'
  ])
}
