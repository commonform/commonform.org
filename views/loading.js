var assert = require('assert')
var collapsed = require('../html/collapsed')
var sidebar = require('./sidebar')

module.exports = function (mode, onLoadEvent) {
  assert(typeof mode === 'string')
  assert(typeof onLoadEvent === 'function')
  onLoadEvent()
  return collapsed`
    <div class=container>
      <article class=commonform>
        ${sidebar(mode, function () {})}
        Loading…
      </article>
    </div>
  `
}
