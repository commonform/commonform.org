var html = require('yo-yo')
var sidebar = require('./sidebar')

module.exports = function (message, send) {
  return html`
    <div class=container>
      <article class=commonform onload=${onLoad}>
        ${sidebar('error', send)}
        <p class=error>${message}</p>
      </article>
    </div>
  `
  function onLoad () {
    send('form:clear error')
  }
}
