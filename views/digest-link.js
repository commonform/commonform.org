var assert = require('assert')
var html = require('yo-yo')

module.exports = function (digest, send) {
  assert.equal(typeof digest, 'string')
  assert.equal(typeof send, 'function')
  return html`
    <a
        class=digest
        href="/forms/${digest}"
        onclick=${onClick}
      >${digest.slice(0, 32)}<wbr>${digest.slice(32)}</a>
  `
  function onClick (event) {
    event.preventDefault()
    event.stopPropagation()
    send('form:load form', digest)
  }
}

