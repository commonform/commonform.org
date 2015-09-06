var h = require('virtual-dom/h')
var openFile = require('../utility/open-file')

function openJSONButton(state) {
  var emit = state.emit
  return h('button.openJSON',
    { href: '/#',
      onclick: function() {
        openFile(function(content) {
          var state = JSON.parse(content)
          emit('state', state) }) } },
    'Open JSON') }

module.exports = openJSONButton
