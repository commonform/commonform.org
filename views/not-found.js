var assert = require('assert')
var html = require('yo-yo')
var modeButtons = require('./mode-buttons')

module.exports = function (send) {
  assert(typeof send === 'function')
  return html`
    <div class=container>
      <article class=commonform>
        ${modeButtons(null, send)}
        <p>Not found.</p>
      </article>
    </div>
  `
}
