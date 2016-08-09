var comparison = require('./comparison')
var editor = require('./editor')
var footer = require('./footer')
var header = require('./header')
var html = require('yo-yo')
var loading = require('./loading')
var menu = require('./menu')
var modeButtons = require('./mode-buttons')

module.exports = function read (digest, state, send) {
  var haveData = state.merkle && state.merkle.digest === digest
  if (!haveData) {
    return loading(function () {
      send('form:fetch', {digest: digest})
    })
  } else {
    if (state.diff) {
      return html`
        <div class=container>
          <article class=commonform>
            ${modeButtons(state.mode, send)}
            ${menu(state, send)}
            ${
              header(
                state.merkle.digest,
                state.publications,
                state.comparing.merkle.digest,
                state.comparing.publications,
                send
              )
            }
            ${comparison(state.diff, send)}
            ${footer()}
          </article>
        </div>
      `
    } else {
      return editor(state, send)
    }
  }
}
