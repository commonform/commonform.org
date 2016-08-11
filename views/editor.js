var assert = require('assert')
var footer = require('./footer')
var form = require('./form')
var header = require('./header')
var html = require('yo-yo')
var menu = require('./menu')
var modeButtons = require('./mode-buttons')
var settings = require('./settings')
var signaturePages = require('./signature-pages')

module.exports = function (state, send) {
  assert.equal(typeof state, 'object')
  assert.equal(typeof send, 'function')
  var mode = state.mode
  if (mode === 'save') {
    return html`
      <div class=container>
        <article class=commonform>
          ${modeButtons(state.mode, send)}
          ${menu(state, send)}
          ${footer()}
        </article>
      </div>
    `
  } else if (mode === 'settings') {
    return html`
      <div class=container>
        <article class=commonform>
          ${modeButtons(state.mode, send)}
          ${settings(state, send)}
          ${footer()}
        </article>
      </div>
    `
  } else {
    return html`
      <div class=container>
        <article class=commonform onclick=${onClick}>
          ${modeButtons(state.mode, send)}
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

  function onClick (event) {
    var target = event.target
    if (target.nodeName === 'A') {
      if (target.className === 'reference') {
        event.preventDefault()
        event.stopPropagation()
        var heading = document.getElementById(
          target.getAttribute('href').slice(1)
        )
        if (heading) {
          heading.scrollIntoView()
        }
      } else if (target.className === 'use') {
        event.preventDefault()
        event.stopPropagation()
        var definition = document.getElementById(
          target.getAttribute('href').slice(1)
        )
        if (definition) {
          definition.scrollIntoView()
        }
      }
    }
  }
}