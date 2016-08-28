var assert = require('assert')
var html = require('yo-yo')
var sidebar = require('./sidebar')

module.exports = function (send) {
  assert(typeof send === 'function')
  return html`
    <div class=container>
      <article class=commonform>
        ${sidebar(null, send)}
        <p>Not found.</p>
      </article>
    </div>
  `
}
