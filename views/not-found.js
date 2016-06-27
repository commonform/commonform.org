const choo = require('choo')

module.exports = function notFound () {
  choo.view`
    <div class=container>
      <article class=commonform>
        <p>Not found.</p>
      </article>
    </div>
  `
}

