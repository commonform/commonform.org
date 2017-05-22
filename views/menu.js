var assert = require('assert')
var fromElements = require('../utilities/from-elements')
var html = require('../html')

var GUIDE = 'https://github.com/commonform/new-publisher-guide'

module.exports = function (form, send) {
  assert(typeof form === 'object')
  assert(typeof send === 'function')
  return html`
    <div class="menu">
      <section class=dangerZone>
        <form onchange=${checkSafety}>
          <p>Before clicking any buttons down here:</p>
          <p>
            <label>
              <input type=checkbox></input>
              Read the <a href=${GUIDE}>New Publisher Guide</a>.
              Saving and publishing are <em>irreversible</em>.
            </label>
          </p>
          <p>
            <label>
              <input type=checkbox></input>
              Take a break, then review the form again with fresh eyes.
            </label>
          </p>
          <p>
            <label>
              <input type=checkbox></input>
              This ain’t no Twitter /
              This ain’t no Facebook /
              This ain’t no foolin’ around.
            </label>
          </p>
        </form>

        <form class=save onsubmit=${saveForm}>
          <h2>Save to commonform.org</h2>
          <p>
            <input
                type=text
                required
                disabled=true
                placeholder="Publisher Name"
                name=publisher></input>
            <input
                type=password
                required
                disabled=true
                placeholder="Password"
                name=password></input>
            <button type=submit>Save Form</button>
          </p>
          <p>
            <em>
              Make damn sure there isn’t any confidential information
              in the form first.  Deal-specific details like price,
              due dates, party names, and product descriptions should be
              made fill-in-the-blanks.  Replace any defined terms based
              on real party names with more generic terms.  If parts of
              a form are unavoidably confidential, consider sharing just
              the more generic parts.
            </em>
          </p>
        </form>

        <form class=publish onsubmit=${publishForm}>
          <h2>Publish to commonform.org</h2>
          <p>
            <input
                type=text
                required
                disabled=true
                placeholder="Publisher Name"
                name=publisher></input>
            <input
                type=password
                required
                disabled=true
                placeholder="Password"
                name=password></input>
          </p>
          <p>
            <input
                type=text
                required
                disabled=true
                placeholder="Project Name"
                name=project></input>
            <input
                type=text
                required
                disabled=true
                placeholder="Reviewers Edition"
                name=edition></input>
            <button type=submit>Publish Form</button>
          </p>
          <p>
            <em>
              “Publish Form” is the most powerful button
              on this website.  With awesome power comes awesome
              don’t-blow-your-head-off responsibility.  Read your form
              again and make sure you're willing to associate yourself
              with it indefinitely.
            </em>
          </p>
        </form>
      </section>
    </div>
  `

  function checkSafety (event) {
    event.preventDefault()
    var allChecked = Array.prototype.slice
      .call(event.target.form.elements)
      .every(function (element) {
        return element.checked
      })
    var forms = document.forms.length
    for (var formIndex = 0; formIndex < forms; formIndex++) {
      var form = document.forms[formIndex]
      var filter = (
        form.className.indexOf('save') !== -1 ||
        form.className.indexOf('publish') !== -1
      )
      if (filter) {
        var elements = form.elements.length
        for (var index = 0; index < elements; index++) {
          var element = form.elements[index]
          element.disabled = !allChecked
        }
      }
    }
  }

  function saveForm (event) {
    event.preventDefault()
    event.stopPropagation()
    send('form:save', fromElements(event.target.elements, [
      'publisher', 'password'
    ]))
  }

  function publishForm (event) {
    event.preventDefault()
    event.stopPropagation()
    send('form:publish', fromElements(event.target.elements, [
      'publisher', 'password', 'project', 'edition'
    ]))
  }
}
