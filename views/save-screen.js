var assert = require('assert')
var h = require('hyperscript')
var numberings = require('../numberings')

var types = {
  docx: docxScreen,
  project: projectScreen
}

module.exports = function saveScreen (state, send) {
  assert(typeof state === 'object')
  assert(typeof send === 'function')
  var type = state.mode.split(' ')[1]
  return types[type](state, send)
}

function docxScreen (state, send) {
  return h('div.menu',
    h('form.downloadDOCX',
      {
        onsubmit: function (event) {
          event.preventDefault()
          event.stopPropagation()
          send('form:download docx', {
            title: (
              document.getElementById('docxTitle').value ||
              'Untitled Document'
            ),
            numbering: document.getElementById('numbering').value,
            hash: document.getElementById('prependHash').checked,
            markFilled: document.getElementById('markFilled').checked
          })
        }
      },
      h('h1', 'Download a .docx file for Microsoft Word'),
      h('section',
        h('label',
          'Document Title',
          h('input#docxTitle.title', {
            type: 'text',
            placeholder: 'Untitled Document'
          })
        )
      ),
      h('section',
        h('label',
          'Numbering Style',
          h('select#numbering',
            numberings.map(function (numbering) {
              return h('option', {
                value: numbering.name
              }, numbering.summary)
            })
          )
        )
      ),
      h('section',
        h('label',
          h('input#prependHash', {
            type: 'checkbox'
          }),
          'Prepend Form Hash'
        )
      ),
      h('section',
        h('label',
          h('input#markFilled', {
            type: 'checkbox',
            checked: true
          }),
          'Mark Filled Blanks'
        )
      ),
      h('button.cancel', {
        onclick: function (event) {
          event.preventDefault()
          event.stopPropagation()
          send('form:read')
        }
      }, 'Cancel'),
      h('button', {
        type: 'submit',
        value: 'Download'
      }, 'Download')
    )
  )
}

function projectScreen (state, send) {
  return h('div.menu',
    h('form.downloadProject',
      {
        onsubmit: function (event) {
          event.preventDefault()
          event.stopPropagation()
          send('form:download project', {
            title: (
              document.getElementById('projectTitle').value ||
              'Untitled Project'
            )
          })
        }
      },
      h('h1', 'Download a Common Form Project File'),
      h('section',
        h('label',
          'Document Title',
          h('input#projectTitle.title', {
            type: 'text',
            placeholder: 'Untitled Project'
          })
        )
      ),
      h('button.cancel', {
        onclick: function (event) {
          event.preventDefault()
          event.stopPropagation()
          send('form:read')
        }
      }, 'Cancel'),
      h('button', {
        type: 'submit',
        value: 'Download'
      }, 'Download')
    )
  )
}
