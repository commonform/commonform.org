var h = require('virtual-dom/h')
var deepEqual = require('deep-equal')

function childButton(state) {
  return h('a.childButton',
    { href: '#',
      title: 'Focus on this form',
      onclick: function(event) {
        event.preventDefault()
          if (deepEqual(state.focused, state.path)) {
            state.emit('unfocus') }
          else {
            state.emit('focus', state.path) } } },
      '§') }

module.exports = childButton
