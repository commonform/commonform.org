var assert = require('assert')
var html = require('../html')
var sidebar = require('./sidebar')

module.exports = function (mode, onLoadEvent) {
  assert(typeof mode === 'string')
  assert(typeof onLoadEvent === 'function')
  onLoadEvent()
  return html`
    <div class=container>
      <article class=commonform>
        ${sidebar(mode, function () {})}
        Loading…
      </article>
    </div>
  `
}
