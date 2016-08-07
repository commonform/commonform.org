var footer = require('./footer')
var html = require('choo/html')
var loading = require('./loading')
var showError = require('./error')

module.exports = function browse (state, previous, send) {
  if (!state.browser.publishers) {
    return loading(function () {
      send('browser:fetch', {
        type: 'publishers'
      })
    })
  } else if (state.browser.error) {
    return showError(state.browser.error)
  } else {
    return html`
      <div class=container>
        <article class=commonform>
          <h1>Common Form Publishers</h1>
          <ul>
            ${
              state.browser.publishers.map(function (publisher) {
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
          onclick=${function () {
            var payload = {
              type: 'publisher',
              publisher: publisher
            }
            send('browser:fetch', payload)
          }}
        >${publisher}</a>
    </li>
  `
}
