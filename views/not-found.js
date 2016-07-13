const html = require('choo/html')

module.exports = function notFound () {
  html`
    <div class=container>
      <article class=commonform>
        <p>Not found.</p>
      </article>
    </div>
  `
}
