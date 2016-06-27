const choo = require('choo')
const comparison = require('./comparison')
const footer = require('./footer')
const form = require('./form')
const header = require('./header')
const menu = require('./menu')
const signaturePages = require('./signature-pages')

module.exports = function read (params, state, send) {
  if (state.form.error) {
    return choo.view`
      <div class=container>
        <article class=commonform>
          <p class=error>${state.form.error.message}</p>
        </article>
      </div>
    `
  } else if (!state.form.merkle) {
    // asap(() => send('form:fetch', params))
    return choo.view`
      <div class=container>
        <article class=commonform>
          Loading...
        </article>
      </div>
    `
  } else {
    if (state.form.diff) {
      return choo.view`
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
      return choo.view`
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
