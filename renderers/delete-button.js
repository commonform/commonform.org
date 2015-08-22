var h = require('virtual-dom/h')

function deleteButton(state) {
  return h('button.delete',
    { onclick: function(event) {
        state.emit('delete', state.path) } },
    'Delete this §') }

module.exports = deleteButton
