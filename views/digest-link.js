var assert = require('assert')
var html = require('bel')

module.exports = function (digest) {
  assert(typeof digest === 'string')
  return html`
    <div>
      <a
          class=digest
          href="/forms/${digest}"
        >${digest.slice(0, 32)}<wbr>${digest.slice(32)}</a>
      <a
          title="Copy ID to clipboard."
          data-clipboard-text="${digest}"
          class=copy></a>
    </div>
  `
}
