var assert = require('assert')
var fromElements = require('../utilities/from-elements')
var html = require('yo-yo')
var querystring = require('querystring')

module.exports = function (form, send) {
  assert(typeof form === 'object')
  assert(typeof send === 'function')
  return html`
    <div class="menu">
      <h1>Mail</h1>
      <p>
        <button onclick=${email}>E-Mail a Link</button>
      </p>

      <h2>Receive E-Mail Updates for this Form</h2>
      <form onsubmit=${subscribe}>
        <p>
          <input
              type=text
              required
              placeholder="Publisher Name"
              name=publisher></input>
          <input
              type=password
              required
              placeholder="Password"
              name=password></input>
          <button type=submit>Subscribe</button>
        </p>
      </form>
      <p>
        commonform.org will send you an e-mail when this form is
        published in a project or a new comment is made to it.
      </ul>
    </div>
  `

  function email (event) {
    event.preventDefault()
    window.location.href = 'mailto:?' + querystring.stringify({
      subject: 'Link to Common Form',
      body: 'https://commonform.org/forms/' + form.merkle.digest
    })
  }

  function subscribe (event) {
    event.preventDefault()
    event.stopPropagation()
    send('form:subscribe', fromElements(event.target.elements, [
      'publisher', 'password'
    ]))
  }
}
