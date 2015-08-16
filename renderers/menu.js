var h = require('virtual-dom/h')
var kaDelete = require('keyarray-delete')

function formMenu(state) {
  return h('div.menu', [
    h('a.delete',
      { href: '#',
        onclick: function(e) {
          e.preventDefault()
          state.update(function(currentState) {
            kaDelete(currentState.data, state.path)
            return currentState }) } },
      'Delete') ]) }

module.exports = formMenu
