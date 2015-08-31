var h = require('virtual-dom/h')

function addAboveButton(state) {
  var emit = state.emit
  var path = state.path
  return h('button.addAbove',
    { onclick: function() {
        emit('insert', path) } },
    'Add § Above') }

module.exports = addAboveButton
