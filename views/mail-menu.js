var assert = require('assert')
var fromElements = require('../utilities/from-elements')

module.exports = function mailMenu (form, send) {
  assert(typeof form === 'object')
  assert(typeof send === 'function')

  var div = document.createElement('div')

  var h1 = document.createElement('h1')
  h1.appendChild(document.createTextNode(
    'Receive E-Mail Updates for this Form'
  ))
  div.appendChild(h1)

  var htmlForm = document.createElement('form')
  htmlForm.onsubmit = function (event) {
    event.preventDefault()
    event.stopPropagation()
    send('form:subscribe', fromElements(event.target.elements, [
      'publisher', 'password'
    ]))
  }

  var p = document.createElement('')

  var publisher = document.createElement('input')
  publisher.type = 'text'
  publisher.required = true
  publisher.placeholder = 'Publisher Name'
  publisher.name = 'publisher'
  p.appendChild(publisher)

  var password = document.createElement('input')
  password.type = 'password'
  password.required = true
  password.placeholder = 'Password'
  password.name = 'password'
  p.appendChild(password)

  var button = document.createElement('button')
  button.type = 'submit'
  button.appendChild(document.createTextNode('Subscribe'))
  p.appendChild(button)

  htmlForm.appendChild(p)

  div.appendChild(htmlForm)

  var explanation = document.createElement('p')
  explanation.appendChild(document.createTextNode(
    'commonform.org will send you an e-mail when this form is' +
    'published in a project or a new comment is made to it.'
  ))
  div.appendChild(explanation)

  return div
}
