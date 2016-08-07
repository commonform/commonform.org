var html = require('choo/html')

module.exports = function (onLoad) {
  return html`
    <div class=container>
      <article class=commonform onload=${onLoad}>
        Loading...
      </article>
    </div>
  `
}
