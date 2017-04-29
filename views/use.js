var assert = require('assert')
var html = require('bel')

// HACK: Unmark link uses onmousedown events to prevent surrounding
// contenteditable elements from getting focus, and then triggering
// automatic use and reference detection on blur.

module.exports = function (term, path, send) {
  assert(typeof term === 'string')
  return html`
    <div class=useGroup data-term=${term}>
      <a  class=use
          title="Jump to definition of ${term}."
          href="#Definition:${term}"
          >${term}</a>
      <a  class=unmarkUse
          title="Unmark as a defined term."
          onmousedown=${unmarkUse}
        ></a>
    </div>
  `
  function unmarkUse (event) {
    event.preventDefault()
    event.stopPropagation()
    send('form:unmark use', {
      path: path
    })
  }
}
