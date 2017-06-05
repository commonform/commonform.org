var assert = require('assert')
var footer = require('./footer')
var form = require('./form')
var header = require('./header')
var html = require('../html')
var mailMenu = require('./mail-menu')
var menu = require('./menu')
var settings = require('./settings')
var sidebar = require('./sidebar')
var signaturePages = require('./signature-pages')

module.exports = function (state, send) {
  assert.equal(typeof state, 'object')
  assert.equal(typeof send, 'function')
  var mode = state.mode
  if (mode === 'save') {
    return html.collapseSpace`
      <div class=container>
        <article class=commonform>
          ${sidebar(state.mode, send)}
          ${menu(state, send)}
          ${footer()}
        </article>
      </div>
    `
  } else if (mode === 'mail') {
    return html.collapseSpace`
      <div class=container>
        <article class=commonform>
          ${sidebar(state.mode, send)}
          ${mailMenu(state, send)}
          ${footer()}
        </article>
      </div>
    `
  } else {
    return html.collapseSpace`
      <div class=container>
        <article class=commonform onclick=${onClick}>
          ${sidebar(state.mode, send)}
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
          ${settings(state, send)}
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
