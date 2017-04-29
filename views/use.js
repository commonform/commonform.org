var assert = require('assert')
var html = require('bel')

module.exports = function (term, path, send) {
  assert(typeof term === 'string')
  return html`
    <div class=useGroup data-term=${term}>
      <span class=use>${term}</span>
      <a  class=jumpToDefinition
          title="Jump to definition of ${term}."
          href="#Definition:${term}"
          ></a>
      <a  class=unmarkUse
          title="Unmark as a defined term."
          onclick=${unmarkUse}
        ></a>
    </div>
  `
  function unmarkUse () {
    send('form:unmark use', {
      path: path
    })
  }
}
