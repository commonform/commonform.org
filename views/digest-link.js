var assert = require('assert')
var html = require('yo-yo')

module.exports = function (digest) {
  assert(typeof digest === 'string')
  return html`
    <div>
      <a
          class=digest
          href="/forms/${digest}"
        >${digest.slice(0, 32)}<wbr>${digest.slice(32)}</a>
      <a
          title="Copy Digest"
          data-clipboard-text="${digest}"
          class=copy></a>
    </div>
  `
}

