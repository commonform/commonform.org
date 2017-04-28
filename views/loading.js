var assert = require('assert')
var html = require('bel')
var sidebar = require('./sidebar')

module.exports = function (mode, onLoad) {
  assert(typeof mode === 'string')
  assert(typeof onLoad === 'function' || onLoad === undefined)
  onLoad = onLoad || function () { }
  return html`
    <div class=container>
      <article class=commonform onload=${onLoad}>
        ${sidebar(mode, function () {})}
        Loading…
      </article>
    </div>
  `
}
