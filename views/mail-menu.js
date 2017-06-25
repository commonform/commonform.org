var assert = require('assert')
var fromElements = require('../utilities/from-elements')
var html = require('../html')

module.exports = function (form, send) {
  assert(typeof form === 'object')
  assert(typeof send === 'function')
  return html`
    <div class="menu">
      <h1>Receive E-Mail Updates for this Form</h1>
      <form onsubmit=${subscribe}>
        <p>
          <input
              type=text
              required
              placeholder="Publisher Name"
              name=publisher></input>
          <button type=submit>Subscribe</button>
        </p>
      </form>
      <p>
        commonform.org will send you an e-mail when this form is
        published in a project or a new comment is made to it.
      </ul>
    </div>
  `

  function subscribe (event) {
    event.preventDefault()
    event.stopPropagation()
    send('form:subscribe', fromElements(event.target.elements, [
      'publisher'
    ]))
  }
}
