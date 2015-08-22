var h = require('virtual-dom/h')
var downloadForm = require('../download-form')
var isSHA256 = require('is-sha-256-hex-digest')

function searchBox(emit) {
  return h('div.search', [
    h('form',
        { onsubmit: function(event) {
            event.preventDefault()
            var form = event.target
            var input = form.getElementsByTagName('input')[0]
            var digest = input.value
            if (isSHA256(digest)) {
              downloadForm(digest, function(error, response) {
                if (error) {
                  alert(error.message) }
                else {
                  emit('form', response.digest, response.form) } }) }},
          pattern: '[a-f0-9]{64,64}' },
      [ h('input',
          { type: 'text', placeholder: 'Type a form fingerprint' }),
        ' ',
        h('input', { type: 'submit', value: 'Load' }) ]) ] ) }

module.exports = searchBox
