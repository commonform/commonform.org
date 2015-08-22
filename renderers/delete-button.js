var h = require('virtual-dom/h')

function deleteButton(state) {
  return h('button.delete',
    { onclick: function(event) {
        state.emit('remove', state.path) } },
    'Delete this §') }

module.exports = deleteButton
