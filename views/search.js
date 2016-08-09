var digestLink = require('./digest-link')
var footer = require('./footer')
var headingLink = require('./heading-link')
var html = require('yo-yo')
var loading = require('./loading')
var modeButtons = require('./mode-buttons')
var termLink = require('./term-link')

var ACTIONS = ['definitions', 'forms', 'headings', 'terms']

module.exports = function (action, value, state, send) {
  if (ACTIONS.indexOf(action) === -1) {
    action = undefined
  }
  var haveData = action === state.action && value === state.value
  if (action && !haveData) {
    send('search:' + action, value)
    return loading()
  } else {
    var nextAction
    var data
    return html`
      <div class=container>
        <article class=commonform>
          ${modeButtons('search', send)}
          <h1>Search Common Forms</h1>
          <form onsubmit=${onSubmit} class=search>
            <input
                class=invalid
                oninput=${onInput}
                type=search></input>
          </form>
          ${hints(action)}
          ${action ? results(state, send) : null}
          ${footer()}
        </article>
      </div>
    `
  }
  function onInput (event) {
    var value = event.target.value.toLowerCase()
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

function hints (query) {
  if (query) {
    return null
  } else {
    return html`
      <section class=hints>
        <p>You can try searches like:</p>
        <ul class=examples>
          ${patterns.map(hint)}
        </ul>
      </section>
    `
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
    return digestLink(result.value, send)
  } else if (result.type === 'term') {
    return termLink(result.value, send)
  } else if (result.type === 'heading') {
    return headingLink(result.value, send)
  } else {
    return html`<span>${result}</span>`
  }
}

var patterns = [
  {
    hint: 'definitions of involuntary transfer',
    expression: /^(definitions of|d) (.+)$/,
    action: 'search:definitions',
    group: 2
  },
  {
    hint: 'defined terms starting with seller',
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
    hint: 'forms with the heading indemnification',
    expression: /^(forms with the heading|f) (.+)$/,
    action: 'search:forms',
    group: 2
  }
]
