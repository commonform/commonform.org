var assert = require('assert')
var h = require('hyperscript')

var TYPES = ['term', 'heading']

module.exports = function replaceScreen (state, send) {
  assert(typeof state === 'object')
  assert(typeof send === 'function')
  var type = state.mode.split(' ')[1]
  assert(TYPES.indexOf(state.renaming) !== -1)
  return h('div.menu',
    h('form.rename',
      {
        onsubmit: function (event) {
          event.preventDefault()
          event.stopPropagation()
          send('form:replace ' + type, {
            target: document.getElementById('target').value,
            replacement: document.getElementById('replacement').value
          })
        }
      },
      h('h1', type === 'term' ? 'Rename a Term' : 'Replace a Heading'),
      h('section',
        h('label',
          type === 'term' ? 'Rename: ' : 'Replace: ',
          h('input#target', {type: 'text'})
        ),
        ' ',
        h('label',
          type === 'term' ? 'To: ' : 'With: ',
          h('input#replacement', {type: 'text'})
        )
      ),
      h('button.cancel', {
        onclick: function (event) {
          event.preventDefault()
          event.stopPropagation()
          send('form:read')
        }
      }, 'Cancel'),
      h('button', {
        type: 'submit'
      }, type === 'term' ? 'Rename' : 'Replace')
    )
  )
}
