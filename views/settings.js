var annotators = require('../annotators')
var assert = require('assert')
var find = require('array-find')
var html = require('../html')
var numberings = require('../numberings')

module.exports = function (state, send) {
  assert(typeof state === 'object')
  assert(typeof send === 'function')
  var flags = state.annotators
  return html`
    <section class=settings>
      <p>${annotatorCheckBoxes(flags, send)}</p>
      <p>${numbering(state.numbering, send)}</p>
    </section>
  `
}

function annotatorCheckBoxes (flags, send) {
  return html`
    <form onchange=${onChange}>
      Annotate:
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
  return html`
    <label>
      <input
          type=checkbox
          ${enabled ? 'checked' : ''}
          value=${annotator.name}/>
      ${annotator.summary}
    </label>
  `
}

function numbering (selected, send) {
  assert(typeof selected === 'string')
  return html`
    <form onchange=${onChange}>
      Word File Numbering:
      <select>
        ${numberings.map(function (numbering) {
          var name = numbering.name
          return html`
            <option
                ${selected === name ? 'selected' : ''}
                value=${name}>
              ${numbering.summary}
            </option>
          `
        })}
      </select>
    </form>
  `

  function onChange (event) {
    event.stopPropagation()
    send('form:numbering', event.target.value)
  }
}
