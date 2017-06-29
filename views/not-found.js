var assert = require('assert')
var collapsed = require('../html/collapsed')
var sidebar = require('./sidebar')

module.exports = function (send) {
  assert(typeof send === 'function')
  return collapsed`
    <div class=container>
      <article class=commonform>
        ${sidebar(null, send)}
        <p>Not found.</p>
      </article>
    </div>
  `
}
