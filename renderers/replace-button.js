var downloadForm = require('../utility/download-form')
var h = require('virtual-dom/h')
var isSHA256 = require('is-sha-256-hex-digest')

module.exports = replaceButton

function replaceButton(state) {
  // State
  var path = state.path
  var emit = state.emit
  // Derivations
  var formKeys = ( path.length === 0 ? [ ] : [ 'form' ] )
  return h('button.replace',
    { onclick: function(event) {
        event.stopPropagation()
        var digest = window.prompt('Enter a form fingerprint.')
        if (digest && isSHA256(digest)) {
          downloadForm(digest, function(error, response) {
            if (error) {
              alert('Could not load that form') }
            else {
              emit('set', path.concat(formKeys), response.form) } }) } } },
    'Replace') }
