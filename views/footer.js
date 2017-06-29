module.exports = function footer () {
  var footer = document.createElement('footer')
  footer.appendChild(fontsCredit())
  footer.appendChild(iconsCredit())
  footer.appendChild(openSource())
  return footer
}

function fontsCredit () {
  var p = document.createElement('p')

  var equity = document.createElement('a')
  equity.href = 'http://typographyforlawyers.com/equity.html'
  equity.appendChild(document.createTextNode('Equity'))
  p.appendChild(equity)

  p.appendChild(document.createTextNode(' and '))

  var triplicate = document.createElement('a')
  triplicate.href = 'http://typographyforlawyers.com/triplicate.html'
  triplicate.appendChild(document.createTextNode('Triplicate'))
  p.appendChild(triplicate)

  p.appendChild(document.createTextNode(' typefaces by '))

  var butterick = document.createElement('a')
  butterick.href = 'http://typographyforlawyers.com/about.html'
  butterick.appendChild(document.createTextNode('Matthew Butterick'))
  p.appendChild(butterick)

  p.appendChild(document.createTextNode('.'))

  return p
}

function iconsCredit () {
  var p = document.createElement('p')

  var linea = document.createElement('a')
  linea.href = 'http://www.linea.io'
  linea.appendChild(document.createTextNode('linea icons'))
  p.appendChild(linea)

  p.appendChild(document.createTextNode(' by Dario Ferrando.'))

  return p
}

function openSource () {
  var p = document.createElement('p')
  p.className = 'openSource'

  p.appendChild(document.createTextNode('Common Form is '))

  var open = document.createElement('a')
  open.href = 'https://github.com/commonform'
  open.appendChild(document.createTextNode('open-source software'))
  p.appendChild(open)

  return p
}
