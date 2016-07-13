const html = require('choo/html')
const comparison = require('./comparison')
const footer = require('./footer')
const form = require('./form')
const header = require('./header')
const menu = require('./menu')
const signaturePages = require('./signature-pages')

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
            ${menu(state.form, send)}
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
            ${menu(state.form, send)}
            ${footer()}
          </article>
        </div>
      `
    }
  }
}
