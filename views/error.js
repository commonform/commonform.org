var html = require('../html')
var sidebar = require('./sidebar')

module.exports = function (state, hasError, send) {
  return html.collapseSpace`
    <div class=container>
      <article class=commonform>
        ${sidebar('none', send)}
        <p class=error>${state[hasError].error.message}</p>
      </article>
    </div>
  `
}
