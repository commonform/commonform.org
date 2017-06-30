var assert = require('assert')
var footer = require('./footer')
var h = require('../h')
var isSHA256 = require('is-sha-256-hex-digest')
var loading = require('./loading')
var publisherLink = require('./publisher-link')
var sidebar = require('./sidebar')

var MAILTO = (
  'mailto:kyle@kemitchell.com' +
  '?subject=CommonForm.org%20Publisher%20Account'
)

module.exports = function publishers (state, send) {
  assert(typeof state === 'object')
  assert(typeof send === 'function')
  if (!state.publishers) {
    return loading('browse', function () {
      send('browser:get publishers')
    })
  } else {
    return h('div.container', [
      h('article.commonform', [
        sidebar('browse', send),
        h('h1', 'Common Forms'),
        h('p', [
          'commonform.org is a free, open repository of legal forms.',
          'Browse published forms by publisher name below, or create',
          'your own form online.  Click the lifesaver to the left',
          'for help.'
        ]),
        h('p', [
          h('button', {
            onclick: function () {
              send('form:new form')
            }
          }, 'Start a New Form from Scratch'),
          h('form.fileInputTrick',
            h('button', 'Open a File'),
            h('input', {
              type: 'file',
              accept: '.cform,.commonform,.json',
              onchange: selectFile
            })
          )
        ]),
        h('p', [
          h('form.fetchDigest', {onsubmit: fetchDigest},
            h('input', {
              name: 'digest',
              required: true,
              placeholder: 'Past a form ID here.',
              pattern: '[a-z0-9]{64}',
              type: 'text'
            }),
            h('button', {type: 'submit'}, 'Fetch from commonform.org')
          )
        ]),
        h('h2', 'Browse by Publisher'),
        h('ul', state.publishers.map(function (publisher) {
          return h('li', publisherLink(publisher, send))
        })),
        h('p', [
          'If you would like to publish forms, e-mail ',
          h('a', {href: MAILTO}, 'Kyle Mitchell'),
          '.'
        ]),
        footer()
      ])
    ])
  }

  function fetchDigest (event) {
    event.preventDefault()
    var digest = event.target.elements.digest.value
    if (isSHA256(digest)) {
      var path = '/forms/' + digest
      window.history.pushState({}, null, path)
      send('form:mode', 'view')
    }
  }

  function selectFile (event) {
    event.preventDefault()
    var target = event.target
    var file = target.files[0]
    var reader = new window.FileReader()
    reader.onload = function (event) {
      var result = event.target.result
      var json
      try {
        json = JSON.parse(result)
      } catch (error) {
        window.alert(error.message)
        return
      }
      if (json.hasOwnProperty('content')) {
        send('form:loaded', json)
      } else if (json.hasOwnProperty('tree')) {
        send('form:loaded', json.tree)
      } else {
        window.alert('Not a Common Form project file.')
      }
    }
    reader.readAsText(file, 'UTF-8')
    target.value = null
  }
}
