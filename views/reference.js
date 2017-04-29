var assert = require('assert')
var html = require('bel')

// HACK: Unmark link uses onmousedown events to prevent surrounding
// contenteditable elements from getting focus, and then triggering
// automatic use and reference detection on blur.

module.exports = function (heading, path, send) {
  assert(typeof heading === 'string')
  return html`
    <div class=referenceGroup data-heading=${heading}>
      <a  class=reference
          title="Jump to ${heading}."
          href="#Heading:${heading}"
          >${heading}</a>
      <a  class=unmarkReference
          title="Unmark as a reference."
          onmousedown=${unmark}
        ></a>
    </div>
  `
  function unmark (event) {
    event.preventDefault()
    event.stopPropagation()
    send('form:unmark reference', {
      path: path
    })
  }
}
