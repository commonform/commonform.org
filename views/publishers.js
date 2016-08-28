var assert = require('assert')
var footer = require('./footer')
var html = require('yo-yo')
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
          <h2>From Your Computer</h2>
          <form class=fileInputTrick>
            <button>Open File</button>
            <input
                type=file
                accept=".cform,.commonform,.json"
                onchange=${selectFile}></input>
          </form>
          <h2>By Publisher</h2>
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
