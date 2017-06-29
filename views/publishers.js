var assert = require('assert')
var collapsed = require('../html/collapsed')
var footer = require('./footer')
var isSHA256 = require('is-sha-256-hex-digest')
var literal = require('../html/literal')
var loading = require('./loading')
var publisherLink = require('./publisher-link')
var sidebar = require('./sidebar')

var MAILTO = (
  'mailto:kyle@kemitchell.com' +
  '?subject=CommonForm.org%20Publisher%20Account'
)

module.exports = function browse (state, send) {
  assert(typeof state === 'object')
  assert(typeof send === 'function')
  if (!state.publishers) {
    return loading('browse', function () {
      send('browser:get publishers')
    })
  } else {
    return literal`
      <div class=container>
        <article class=commonform>
          ${sidebar('browse', send)}
          <h1>Common Forms</h1>
          <p>
            commonform.org is a free, open respository of legal forms.
            Browse published forms by publisher name below, or create
            your own form online.  Click the lifesaver to the left
            for help.
          </p>
          <p>
            <button
                onclick=${function () {
                  send('form:new form')
                }}
            >Start a New Form from Scratch</button>
            <form class=fileInputTrick>
              <button>Open a File</button>
              <input
                  type=file
                  accept=".cform,.commonform,.json"
                  onchange=${selectFile}></input>
            </form>
          </p>
          <p>
            <form class=fetchDigest onsubmit=${fetchDigest}>
              <input
                  name=digest
                  required
                  placeholder="Paste a form ID here."
                  pattern="[a-z0-9]{64}"
                  type=text></input>
              <button type=submit>Fetch from commonform.org</button>
            </form>
          </p>
          <h2>Browse by Publisher</h2>
          <ul>
            ${
              state.publishers.map(function (publisher) {
                return collapsed`
                  <li>${publisherLink(publisher, send)}</li>
                `
              })
            }
          </ul>
          <p>
            If you would like to publish forms, e-mail
            <a href="${MAILTO}">Kyle Mitchell</a>.
          </p>
          ${footer()}
        </article>
      </div>
    `
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
