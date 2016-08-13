var comparison = require('./comparison')
var footer = require('./footer')
var header = require('./header')
var html = require('yo-yo')
var loading = require('./loading')
var modeButtons = require('./mode-buttons')

module.exports = function compare (a, b, state, send) {
  var haveData = state.merkle && state.diff
  if (!haveData) {
    return loading(state.mode, function () {
      send('form:compare', [a, b])
    })
  } else {
    return html`
      <div class=container>
        <article class=commonform>
          ${modeButtons(state.mode, send)}
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
  }
}
