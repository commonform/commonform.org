var assert = require('assert')
var fromElements = require('../utilities/from-elements')
var h = require('hyperscript')

var GUIDE = 'https://github.com/commonform/new-publisher-guide'

module.exports = function menu (form, send) {
  assert(typeof form === 'object')
  assert(typeof send === 'function')
  return h('div.menu',
    h('section.dangerZone',
      safety(),
      saveUI(send),
      publishUI(send)
    )
  )
}

function safety (send) {
  return h('form', {onchange: checkSafety},
    h('p', 'Before clicking any buttons down here:'),
    h('p',
      h('label',
        h('input', {type: 'checkbox'}),
        ' Read the ',
        h('a', {href: GUIDE}, 'New Publisher Guide'),
        '.',
        'Saving and publishing are ',
        h('em', 'irreversible'),
        '.'
      )
    ),
    h('p',
      h('label',
        h('input', {type: 'checkbox'}),
        ' Take a break, then review the form again with fresh eyes.'
      )
    ),
    h('p',
      h('label',
        h('input', {type: 'checkbox'}),
        ' This ain’t no Twitter /',
        'This ain’t no Facebook /',
        'This ain’t no foolin’ around.'
      )
    )
  )

  function checkSafety (event) {
    event.preventDefault()
    var allChecked = Array.prototype.slice
      .call(event.target.form.elements)
      .every(function (element) {
        return element.checked
      })
    var forms = document.forms.length
    for (var formIndex = 0; formIndex < forms; formIndex++) {
      var form = document.forms[formIndex]
      var filter = (
        form.className.indexOf('save') !== -1 ||
        form.className.indexOf('publish') !== -1
      )
      if (filter) {
        var elements = form.elements.length
        for (var index = 0; index < elements; index++) {
          var element = form.elements[index]
          element.disabled = !allChecked
        }
      }
    }
  }
}

function saveUI (send) {
  return h('form.save', {onsubmit: save},
    h('h2', 'Save to commonform.org'),
    h('p',
      publisherAndPassword(),
      h('button', {type: 'submit'}, 'Save Form')
    ),
    h('p',
      h('em',
        'Make damn sure there isn’t any confidential information',
        'in the form first.  Deal-specific details like price,',
        'due dates, party names, and product descriptions should be',
        'made fill-in-the-blanks.  Replace any defined terms based',
        'on real party names with more generic terms.  If parts of',
        'a form are unavoidably confidential, consider sharing just',
        'the more generic parts.'
      )
    )
  )

  function save (event) {
    event.preventDefault()
    event.stopPropagation()
    send('form:save', fromElements(event.target.elements, [
      'publisher', 'password'
    ]))
  }
}

function publishUI (send) {
  return h('form.publish', {onsubmit: publishForm},
    h('h2', 'Publish to commonform.org'),
    h('p', publisherAndPassword()),
    h('p',
      h('input', {
        type: 'text',
        required: true,
        disabled: true,
        placeholder: 'Project Name',
        name: 'project'
      }),
      h('input', {
        type: 'text',
        required: true,
        disabled: true,
        placeholder: 'Reviewers Edition',
        name: 'edition'
      }),
      h('button', {type: 'submit'}, 'Publish Form')
    ),
    h('p',
      h('em',
        '“Publish Form” is the most powerful button',
        'on this website.  With awesome power comes awesome',
        'don’t-blow-your-head-off responsibility.  Read your form',
        'again and make sure you’re willing to associate yourself',
        'with it indefinitely.'
      )
    )
  )

  function publishForm (event) {
    event.preventDefault()
    event.stopPropagation()
    send('form:publish', fromElements(event.target.elements, [
      'publisher', 'password', 'project', 'edition'
    ]))
  }
}

function publisherAndPassword () {
  return [
    h('input', {
      type: 'text',
      required: true,
      disabled: true,
      placeholder: 'Publisher Name',
      name: 'publisher'
    }),
    h('input', {
      type: 'password',
      required: true,
      disabled: true,
      placeholder: 'Password',
      name: 'password'
    })
  ]
}
