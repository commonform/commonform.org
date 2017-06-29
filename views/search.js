var assert = require('assert')
var digestLink = require('./digest-link')
var footer = require('./footer')
var h = require('hyperscript')
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
    return h('div.container',
      h('article.commonform',
        sidebar('search', send),
        h('h1', 'Search Common Forms'),
        action ? results(state, send) : searchBox(send),
        footer()
      )
    )
  }
}

function searchBox (send) {
  var nextAction
  var data
  return h('div.search',
    h('form',
      {
        onsubmit: function (event) {
          event.preventDefault()
          if (nextAction) {
            send(nextAction, data)
          }
        }
      },
      h('input.invalid#searchQuery', {
        type: 'search',
        autofocus: true,
        placeholder: 'Enter a query and press Return.',
        oninput: function (event) {
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
      })
    ),
    h('section.hints',
      h('p', 'You can enter queries like:'),
      h('ul.examples',
        patterns.forEach(function (pattern) {
          return hint(pattern)
        })
      )
    )
  )
}

function hint (pattern) {
  return h('li', '“' + pattern.hint + '”')
}

function results (state, send) {
  if (state.query) {
    return h('div.results',
      h('p.query', state.query),
      resultList(state.results, send)
    )
  } else {
    return null
  }
}

function resultList (results, send) {
  if (results.length === 0) {
    return h('p', 'No results')
  } else {
    return h('ul',
      results.map(function (r) {
        h('li', results(r, send))
      })
    )
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
    return h('span', result)
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
