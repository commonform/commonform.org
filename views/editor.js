var footer = require('./footer')
var form = require('./form')
var header = require('./header')
var html = require('choo/html')
var menu = require('./menu')
var modeButtons = require('./mode-buttons')
var signaturePages = require('./signature-pages')

module.exports = function (state, send) {
  return html`
    <div class=container>
      <article class=commonform>
        ${modeButtons(state.form.mode, send)}
        ${menu(state.form, send)}
        ${
          header(
            state.form.merkle.digest,
            state.form.publications,
            false,
            [],
            send
          )
        }
        ${form(state.form, send)}
        ${signaturePages(state.form.signaturePages, send)}
        ${footer()}
      </article>
    </div>
  `
  
}
