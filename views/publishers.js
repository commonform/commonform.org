var assert = require('assert')
var footer = require('./footer')
var html = require('yo-yo')
var loading = require('./loading')
var modeButtons = require('./mode-buttons')
var publisherLink = require('./publisher-link')

module.exports = function browse (state, send) {
  assert(typeof state === 'object')
  assert(typeof send === 'function')
  if (!state.publishers) {
    return loading('browse', function () {
      send('browser:get publishers')
    })
  } else {
    return html`
      <div class=container>
        <article class=commonform>
          ${modeButtons('browse', send)}
          <h1>Common Form Publishers</h1>
          <ul>
            ${
              state.publishers.map(function (publisher) {
                return html`
                  <li>${publisherLink(publisher, send)}</li>
                `
              })
            }
          </ul>
          ${footer()}
        </article>
      </div>
    `
  }
}
