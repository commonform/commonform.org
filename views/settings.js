var assert = require('assert')
var annotators = require('../annotators')
var find = require('array-find')
var html = require('yo-yo')

module.exports = function (state, send) {
  assert(typeof state === 'object')
  assert(typeof send === 'function')
  var flags = state.annotators
  return html`
    <section class=settings>
      <h1>Settings</h1>
      <section>
        <h2>Automatic Annotations</h2>
        <form onchange=${onChange}>
          ${Object.keys(flags).map(function (name) {
            return checkBox(
              find(annotators, function (annotator) {
                return annotator.name === name
              }),
              flags[name],
              send
            )
          })}
        </form>
      </section>
    </section>
  `
  function onChange (event) {
    event.stopPropagation()
    var target = event.target
    send('form:toggle annotator', {
      annotator: target.value,
      enabled: target.checked
    })
  }
}

function checkBox (annotator, enabled, send) {
  var name = annotator.name
  var id = 'checkbox:' + name
  return html`
    <fieldset>
      <input
          id=${id}
          type=checkbox
          ${enabled ? 'checked' : ''}
          value=${name}/>
        <label for=${id}>${name}: ${annotator.summary}</label>
    </fieldset>
  `
}
