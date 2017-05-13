var html = require('bel')
var sidebar = require('./sidebar')

module.exports = function (state, hasError, send) {
  return html`
    <div class=container>
      <article class=commonform>
        ${sidebar('none', send)}
        <p class=error>${state[hasError].error.message}</p>
      </article>
    </div>
  `
}
