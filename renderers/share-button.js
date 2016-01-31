module.exports = shareButton

var h = require('virtual-dom/h')
var upload = require('commonform-upload')

function shareButton(state) {
  var emit = state.emit
  var form = state.form
  return h(
    'button',
    { onclick: function(event) {
        event.preventDefault()
        upload(form, function(error) {
          if (error) {
            alert('Failed to share form') }
          else {
            emit('form', form, true) } }) } },
    'Share this Form') }
