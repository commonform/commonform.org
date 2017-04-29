var assert = require('assert')
var html = require('bel')

module.exports = function (heading, path, send) {
  assert(typeof heading === 'string')
  return html`
    <div class=referenceGroup data-heading=${heading}>
      <span class=reference>${heading}</span>
      <a  class=jumpToHeading
          title="Jump to ${heading}."
          href="#Heading:${heading}"
          ></a>
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
