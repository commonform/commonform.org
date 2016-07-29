var html = require('choo/html')
var comparison = require('./comparison')
var footer = require('./footer')
var form = require('./form')
var header = require('./header')
var menu = require('./menu')
var signaturePages = require('./signature-pages')

module.exports = function read (state, prev, send) {
  if (state.form.error) {
    return html`
      <div class=container>
        <article class=commonform>
          <p class=error>${state.form.error.message}</p>
        </article>
      </div>
    `
  } else if (!state.form.merkle) {
    return html`
      <div class=container>
        <article class=commonform>
          Loading...
        </article>
      </div>
    `
  } else {
    if (state.form.diff) {
      return html`
        <div class=container>
          <article class=commonform>
            ${menu(state.form, send)}
            ${
              header(
                state.form.merkle.digest,
                state.form.publications,
                state.form.comparing.merkle.digest,
                state.form.comparing.publications
              )
            }
            ${comparison(state.form.diff, send)}
            ${footer()}
          </article>
        </div>
      `
    } else {
      return html`
        <div class=container>
          <article class=commonform>
            ${menu(state.form, send)}
            ${header(state.form.merkle.digest, state.form.publications)}
            ${form(state.form, send)}
            ${signaturePages(state.form.signaturePages, send)}
            ${footer()}
          </article>
        </div>
      `
    }
  }
}
