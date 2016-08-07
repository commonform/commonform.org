var comparison = require('./comparison')
var editor = require('./editor')
var footer = require('./footer')
var header = require('./header')
var html = require('choo/html')
var loading = require('./loading')
var menu = require('./menu')
var modeButtons = require('./mode-buttons')

module.exports = function read (state, prev, send) {
  var haveData = (
    state.form.merkle &&
    state.form.merkle.digest === state.params.digest
  )
  if (state.form.error) {
    return html`
      <div class=container>
        <article class=commonform>
          <p class=error>${state.form.error.message}</p>
        </article>
      </div>
    `
  } else if (!haveData) {
    return loading(function () {
      var params = state.params
      var payload = {}
      if (params.publisher) {
        payload.publisher = params.publisher
        payload.project = params.project
        payload.edition = params.edition || 'current'
      } else {
        payload.digest = params.digest
      }
      send('form:fetch', payload)
    })
  } else {
    if (state.form.diff) {
      return html`
        <div class=container>
          <article class=commonform>
            ${modeButtons(state.form.mode, send)}
            ${menu(state.form, send)}
            ${
              header(
                state.form.merkle.digest,
                state.form.publications,
                state.form.comparing.merkle.digest,
                state.form.comparing.publications,
                send
              )
            }
            ${comparison(state.form.diff, send)}
            ${footer()}
          </article>
        </div>
      `
    } else {
      return editor(state, send)
    }
  }
}
