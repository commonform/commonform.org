var assert = require('assert')
var html = require('bel')

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
          onclick=${unmark}
        ></a>
    </div>
  `
  function unmark () {
    send('form:unmark reference', {
      path: path
    })
  }
}
