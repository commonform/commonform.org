var html = require('yo-yo')
var modeButtons = require('./mode-buttons')

module.exports = function (send) {
  return html`
    <div class=container>
      <article class=commonform>
        ${modeButtons(null, send)}
        <p>Not found.</p>
      </article>
    </div>
  `
}
