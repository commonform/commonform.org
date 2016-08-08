var html = require('yo-yo')

module.exports = function (onLoad) {
  onLoad = onLoad || function () { }
  return html`
    <div class=container>
      <article class=commonform onload=${onLoad}>
        Loading…
      </article>
    </div>
  `
}
