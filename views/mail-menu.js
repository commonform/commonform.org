var assert = require('assert')
var fromElements = require('../utilities/from-elements')
var h = require('../h')

module.exports = function mailMenu (form, send) {
  assert(typeof form === 'object')
  assert(typeof send === 'function')
  return h('div', [
    h('h1', 'Receive E-Mail Updates for this Form'),
    h('form',
      {
        onsubmit: function (event) {
          event.preventDefault()
          event.stopPropagation()
          send('form:subscribe', fromElements(event.target.elements, [
            'publisher', 'password'
          ]))
        }
      },
      h('p', [
        h('input',
          {
            type: 'text',
            required: true,
            placeholder: 'Publisher Name',
            name: 'publisher'
          }
        ),
        h('input',
          {
            type: 'password',
            required: true,
            placeholder: 'Password',
            name: 'password'
          }
        ),
        h('button', {type: 'submit'}, 'Subscribe')
      ])
    ),
    h('p', [
      'commonform.org will send you an e-mail when this form is',
      'published in a project or a new comment is made to it.'
    ])
  ])
}
