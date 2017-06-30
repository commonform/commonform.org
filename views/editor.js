var assert = require('assert')
var footer = require('./footer')
var form = require('./form')
var h = require('../h')
var header = require('./header')
var mailMenu = require('./mail-menu')
var menu = require('./menu')
var settings = require('./settings')
var sidebar = require('./sidebar')
var signaturePages = require('./signature-pages')

module.exports = function editor (state, send) {
  assert.equal(typeof state, 'object')
  assert.equal(typeof send, 'function')
  var mode = state.mode
  if (mode === 'save') {
    return h('div.container', [
      h('article.commonform', [
        sidebar(state.mode, send),
        menu(state, send),
        footer()
      ])
    ])
  } else if (mode === 'mail') {
    return h('div.container',
      h('article.commonform', [
        sidebar(state.mode, send),
        mailMenu(state, send),
        footer()
      ])
    )
  } else {
    return h('div.container',
      h('article.commonform',
        {
          onclick: function (event) {
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
        },
        [
          sidebar(state.mode, send),
          header(
            state.merkle.digest, state.publications, false, [], send
          ),
          form(state, send),
          signaturePages(state.signaturePages, send),
          settings(state, send),
          footer()
        ]
      )
    )
  }
}
