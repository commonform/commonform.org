module.exports = eMailButton

var h = require('virtual-dom/h')
var querystring = require('querystring')

function eMailButton(state) {
  var digest = state.derived.merkle.digest
  return h('button',
    { onclick: function(event) {
        event.preventDefault()
        window.location.href = (
          'mailto:?' +
            querystring.stringify({
              subject: 'Link to Common Form',
              body: (
                'https://commonform.org/forms/' +
                digest ) }) ) } },
    [ 'E-Mail' ]) }
