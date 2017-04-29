var assert = require('assert')
var html = require('bel')

module.exports = function (term, path, send) {
  assert(typeof term === 'string')
  return html`
    <span class=useGroup data-term=${term}>
      <a  class=use
          title="Jump to definition of ${term}."
          href="#Definition:${term}"
        >${term}</a>
      <a  class=notAUse
          title="Unmark as a defined term."
          onclick=${unmarkUse}
        ></a>
    </span>
  `
  function unmarkUse () {
    send('form:unmark use', {
      path: path
    })
  }
}
