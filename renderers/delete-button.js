var h = require('virtual-dom/h')

function deleteButton(state) {
  var emit = state.emit
  var path = state.path
  return h('button.delete',
    { onclick: function() {
        emit('remove', path) } },
    'Delete this §') }

module.exports = deleteButton
