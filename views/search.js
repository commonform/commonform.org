var assert = require('assert')
var digestLink = require('./digest-link')
var footer = require('./footer')
var headingLink = require('./heading-link')
var loading = require('./loading')
var sidebar = require('./sidebar')
var termLink = require('./term-link')

var ACTIONS = ['definitions', 'forms', 'headings', 'terms']

module.exports = function (action, value, state, send) {
  assert(typeof state === 'object')
  assert(typeof send === 'function')
  if (ACTIONS.indexOf(action) === -1) {
    action = undefined
  }
  var haveData = action === state.action && value === state.value
  if (action && !haveData) {
    return loading('search', function () {
      send('search:' + action, value)
    })
  } else {
    var div = document.createElement('div')
    div.className = 'container'
    var article = document.createElement('article')
    article.className = 'commonform'
    article.appendChild(sidebar('search', send))
    var h1 = document.createElement('h1')
    h1.appendChild(document.createTextNode('Search Common Forms'))
    article.appendChild(h1)
    article.appendChild(action ? results(state, send) : searchBox(send))
    article.appendChild(footer())
    div.appendChild(article)
    return div
  }
}

function searchBox (send) {
  var nextAction
  var data
  var div = document.createElement('div')
  div.className = 'search'

  var form = document.createElement('form')

  var input = document.createElement('input')
  input.id = 'searchQuery'
  input.className = 'invalid'
  input.setAttribute('placeholder', 'Enter a query and press return.')
  input.oninput = onInput
  input.setAttribute('type', 'search')
  input.setAttribute('autofocus', 'true')
  form.appendChild(input)

  div.appendChild(form)

  var section = document.createElement('section')
  section.className = 'hints'

  var p = document.createElement('p')
  p.appendChild(document.createTextNode('You can enter queries like:'))
  section.appendChild(p)

  var ul = document.createElement('ul')
  ul.className = 'examples'
  patterns.forEach(function (pattern) {
    ul.appendChild(hint(pattern))
  })
  section.appendChild(ul)

  div.appendChild(section)

  return div

  function onInput (event) {
    var value = normalizeQuery(event.target.value)
    var match
    var length = patterns.length
    for (var index = 0; index < length; index++) {
      var pattern = patterns[index]
      match = pattern.expression.exec(value)
      if (match) {
        nextAction = pattern.action
        data = match[pattern.group]
        event.target.className = 'valid'
        return
      }
    }
    event.target.className = 'invalid'
    match = null
    data = null
  }

  function onSubmit (event) {
    event.preventDefault()
    if (nextAction) {
      send(nextAction, data)
    }
  }
}

function hint (pattern) {
  var li = document.createElement('li')
  li.appendChild(document.createTextNode('“' + pattern.hint + '”'))
  return li
}

function results (state, send) {
  if (state.query) {
    var div = document.createElement('div')
    div.className = 'results'
    var p = document.createElement('p')
    p.className = 'query'
    p.appendChild(document.createTextNode(state.query))
    div.appendChild(resultList(state.results, send))
    div.appendChild(p)
    return div
  } else {
    return null
  }
}

function resultList (results, send) {
  if (results.length === 0) {
    var p = document.createElement('p')
    p.appendChild(document.createTextNode('No results'))
    return p
  } else {
    var ul = document.createElement('ul')
    results.forEach(function (r) {
      var li = document.createElement('li')
      li.appendChild(result(r, send))
      ul.appendChild(li)
    })
    return ul
  }
}

function result (result, send) {
  if (result.type === 'digest') {
    return digestLink(result.value)
  } else if (result.type === 'term') {
    return termLink(result.value)
  } else if (result.type === 'heading') {
    return headingLink(result.value)
  } else {
    var span = document.createElement('span')
    span.appendChild(document.createTextNode(result))
    return span
  }
}

var patterns = [
  {
    hint: 'define involuntary transfer',
    expression: /^(define|d) (.+)$/,
    action: 'search:definitions',
    group: 2
  },
  {
    hint: 'defined terms starting with allowed',
    expression: /^(defined terms starting with|t) (.+)$/,
    action: 'search:terms',
    group: 2
  },
  {
    hint: 'headings starting with indem',
    expression: /^(headings starting with|h) (.+)$/,
    action: 'search:headings',
    group: 2
  },
  {
    hint: 'forms under indemnification',
    expression: /^(forms under|f) (.+)$/,
    action: 'search:forms',
    group: 2
  }
]

function normalizeQuery (string) {
  return string
    .toLowerCase()
    .replace(/[^a-z0-9 '-]/g, '')
}
