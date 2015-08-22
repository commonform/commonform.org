var h = require('virtual-dom/h')
var openFile = require('../open-file')

function openJSONButton(emit) {
  return h('button.openJSON',
    { href: '#',
      onclick: function(event) {
        openFile(function(content) {
          var state = JSON.parse(content)
          emit('state', state) }) } },
    'Open JSON') }

module.exports = openJSONButton
