var html = require('yo-yo')

module.exports = function (error) {
  return html`
    <div class=container>
      <article class=commonform>
        <p class=error>${error.message}</p>
      </article>
    </div>
  `
}
