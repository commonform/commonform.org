var annotators = require('../annotators')
var assert = require('assert')
var find = require('array-find')
var h = require('../h')
var numberings = require('../numberings')

module.exports = function settings (state, send) {
  assert(typeof state === 'object')
  assert(typeof send === 'function')
  var flags = state.annotators
  return h('section.settings', [
    h('p', annotatorCheckBoxes(flags, send)),
    h('p', numbering(state.numbering, send))
  ])
}

function annotatorCheckBoxes (flags, send) {
  return h('form',
    {
      onchange: function (event) {
        event.stopPropagation()
        var target = event.target
        send('form:toggle annotator', {
          annotator: target.value,
          enabled: target.checked
        })
      }
    },
    [
      'Annotate:',
      Object.keys(flags).map(function (name) {
        return checkBox(
          find(annotators, function (annotator) {
            return annotator.name === name
          }),
          flags[name],
          send
        )
      })
    ]
  )
}

function checkBox (annotator, enabled, send) {
  return h('label',
    h('input', {
      type: 'checkbox',
      checked: enabled,
      value: annotator.name
    }),
    annotator.summary
  )
}

function numbering (selected, send) {
  assert(typeof selected === 'string')
  return h('form',
    {
      onchange: function (event) {
        event.stopPropagation()
        send('form:numbering', event.target.value)
      }
    },
    [
      'Word File Numbering:',
      h('select',
        numberings.map(function (numbering) {
          return h('option', {
            selected: selected === numbering.name,
            value: numbering.name
          }, numbering.summary)
        })
      )
    ]
  )
}
