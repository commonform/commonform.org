var assert = require('assert')
var digestLink = require('./digest-link')
var footer = require('./footer')
var headingLink = require('./heading-link')
var html = require('bel')
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
    return html`
      <div class=container>
        <article class=commonform>
          ${sidebar('search', send)}
          <h1>Search Common Forms</h1>
          ${action ? null : searchBox(send)}
          ${action ? results(state, send) : null}
          ${footer()}
        </article>
      </div>
    `
  }
}

function searchBox (send) {
  var nextAction
  var data
  return html`
    <div class=search>
      <form onsubmit=${onSubmit}>
        <input
            id=searchQuery
            class=invalid
            placeholder="Enter a query and press return."
            oninput=${onInput}
            type=search></input>
      </form>
      <section class=hints>
        <p>You can enter queries like:</p>
        <ul class=examples>
          ${patterns.map(hint)}
        </ul>
      </section>
    </div>
  `

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
  return html`<li>“${pattern.hint}”</li>`
}

function results (state, send) {
  if (state.query) {
    return html`
      <div class=results>
        <p class=query>${state.query}:</p>
        ${resultList(state.results, send)}
      </div>
    `
  } else {
    return null
  }
}

function resultList (results, send) {
  if (results.length === 0) {
    return html`<p>No results</p>`
  } else {
    return html`
      <ul class=results>
        ${results.map(function (r) {
          return html`<li>${result(r, send)}</li>`
        })}
      </ul>
    `
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
    return html`<span>${result}</span>`
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
