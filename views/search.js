var footer = require('./footer')
var html = require('yo-yo')
var modeButtons = require('./mode-buttons')

module.exports = function (state, send) {
  return html`
    <div class=container>
      <article class=commonform>
        ${modeButtons('search', send)}
        <h1>Search Common Forms</h1>
        ${footer()}
      </article>
    </div>
  `
}
