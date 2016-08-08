var footer = require('./footer')
var html = require('yo-yo')
var loading = require('./loading')

module.exports = function browse (state, send) {
  if (!state.publishers) {
    return loading(function () {
      send('browser:get publishers')
    })
  } else {
    return html`
      <div class=container>
        <article class=commonform>
          <h1>Common Form Publishers</h1>
          <ul>
            ${
              state.publishers.map(function (publisher) {
                return publisherLink(publisher, send)
              })
            }
          </ul>
          ${footer()}
        </article>
      </div>
    `
  }
}

function publisherLink (publisher, send) {
  return html`
    <li>
      <a
          class=publisher
          href="/publishers/${encodeURIComponent(publisher)}"
        >${publisher}</a>
    </li>
  `
}
