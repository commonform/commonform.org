var assert = require('assert')
var footer = require('./footer')
var html = require('yo-yo')
var isSHA256 = require('is-sha-256-hex-digest')
var loading = require('./loading')
var parseMarkup = require('commonform-markup-parse')
var publisherLink = require('./publisher-link')
var sidebar = require('./sidebar')

module.exports = function browse (state, send) {
  assert(typeof state === 'object')
  assert(typeof send === 'function')
  if (!state.publishers) {
    return loading('browse', function () {
      send('browser:get publishers')
    })
  } else {
    return html`
      <div class=container>
        <article class=commonform>
          ${sidebar('browse', send)}
          <h1>Common Forms</h1>
          <p>
            <button
                onclick=${function () {
                  send('form:new form')
                }}
            >Start a New Form from Scratch</button>
          </p>
          <p>
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
                  placeholder="Paste a digest here"
                  pattern="[a-z0-9]{64}"
                  type=text></input>
              <button type=submit>Fetch from commonform.org</button>
            </form>
          </p>
          <h2>Browse Publications by Publisher</h2>
          <ul>
            ${
              state.publishers.map(function (publisher) {
                return html`
                  <li>${publisherLink(publisher, send)}</li>
                `
              })
            }
          </ul>
          ${footer()}
        </article>
      </div>
    `
  }

  function fetchDigest (event) {
    event.preventDefault()
    var digest = event.target.elements.digest.value
    console.log(digest)
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
    var isJSON = file.type.match(/application\/json/)
    reader.onload = function (event) {
      var result = event.target.result
      var tree
      try {
        tree = isJSON
        ? JSON.parse(result)
        : parseMarkup(result).form
      } catch (error) { return }
      send('form:loaded', tree)
    }
    reader.readAsText(file, 'UTF-8')
    target.value = null
  }
}
