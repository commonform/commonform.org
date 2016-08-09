var html = require('yo-yo')
var modeButtons = require('./mode-buttons')

module.exports = function (mode, onLoad) {
  onLoad = onLoad || function () { }
  return html`
    <div class=container>
      <article class=commonform onload=${onLoad}>
        ${modeButtons(mode, function () {})}
        Loading…
      </article>
    </div>
  `
}
