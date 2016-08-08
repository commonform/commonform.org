var assert = require('assert')
var footer = require('./footer')
var form = require('./form')
var header = require('./header')
var html = require('yo-yo')
var menu = require('./menu')
var modeButtons = require('./mode-buttons')
var signaturePages = require('./signature-pages')

module.exports = function (state, send) {
  assert.equal(typeof state, 'object')
  assert.equal(typeof send, 'function')
  return html`
    <div class=container>
      <article class=commonform>
        ${modeButtons(state.mode, send)}
        ${menu(state, send)}
        ${
          header(
            state.merkle.digest,
            state.publications,
            false,
            [],
            send
          )
        }
        ${form(state, send)}
        ${signaturePages(state.signaturePages, send)}
        ${footer()}
      </article>
    </div>
  `
}
