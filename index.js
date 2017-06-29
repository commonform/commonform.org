var Clipboard = require('clipboard')
var EventEmitter = require('events').EventEmitter
var assert = require('assert')
var assign = require('object-assign')
var browserModel = require('./models/browser')
var compare = require('./views/compare')
var findLocalLinkAnchor = require('./utilities/find-local-link-anchor')
var formModel = require('./models/form')
var level = require('./level')
var loading = require('./views/loading')
var nanomorph = require('nanomorph')
var notFound = require('./views/not-found')
var parseJSON = require('json-parse-errback')
var pathOf = require('pathname-match')
var projects = require('./views/projects')
var publishers = require('./views/publishers')
var read = require('./views/read')
var runParallel = require('run-parallel')
var searchModel = require('./models/search')
var searchView = require('./views/search')
var showError = require('./views/error')

// State
var form = {}
var browser = {}
var search = {}
var state = {
  browser: browser,
  form: form,
  search: search
}

// Data Modeling

var actions = new EventEmitter()
  .on('error', function (error) {
    console.error(error)
    window.alert(error.toString())
  })

function action (/* variadic */) {
  assert(
    actions.listenerCount(arguments[0]) > 0,
    'no listeners for action ' + arguments[0]
  )
  actions.emit.apply(actions, arguments)
}

var reductions = new EventEmitter()
var initializers = {}

function useModel (scope, model) {
  model(initialize(scope), reduce(scope), handle(scope))

  function initialize (scope) {
    return function (initializer) {
      initializers[scope] = initializer
      assign(state[scope], initializer())
    }
  }

  function reduce (scope) {
    return function (event, handler) {
      event = scope + ':' + event
      assert.equal(typeof event, 'string', 'event is a string')
      assert(event.length !== 0, 'event is not empty')
      assert.equal(
        reductions.listenerCount(event), 0,
        'just one listener for ' + event
      )
      reductions.on(event, function (data) {
        assign(state[scope], handler(data, state[scope]))
      })
    }
  }

  function handle (scope) {
    return function (event, handler) {
      assert.equal(typeof event, 'string', 'event is a string')
      assert(event.length !== 0, 'event is not empty')
      event = scope + ':' + event
      assert.equal(
        actions.listenerCount(event), 0,
        'just one listener for ' + event
      )
      actions.on(event, function (data) {
        handler(data, state[scope], send, callback)
        function send (event, data) {
          event = scope + ':' + event
          assert(
            reductions.listenerCount(event) > 0,
            'no listeners for ' + event
          )
          reductions.emit(event, data)
        }
        function callback (error) {
          if (error) {
            action('error', error)
          }
          update()
        }
      })
    }
  }
}

function resetStates (scopes) {
  scopes.forEach(function (scope) {
    assign(state[scope], initializers[scope]())
  })
}

useModel('form', formModel)
useModel('browser', browserModel)
useModel('search', searchModel)

// Rendering

var rendered

function render () {
  var hasError = Object.keys(state).find(function (model) {
    return state[model].error
  })
  if (hasError) {
    // FIXME: Terrible hack
    var rendered = showError(state, hasError, action)
    state[hasError].error = null
    return rendered
  } else {
    var path = pathOf(window.location.href)
    var publisher
    var split
    if (path === '' || path === '/') {
      resetStates(['form', 'search'])
      return publishers(browser, action)
    } else if (startsWith('/forms/')) {
      resetStates(['browser', 'search'])
      var suffix = path.substring(7)
      split = suffix.split('/')
      var digest = split[0]
      if (split[1]) {
        return compare(digest, split[1], form, action)
      } else {
        return read(digest, form, action)
      }
    } else if (startsWith('/search')) {
      resetStates(['browser', 'form'])
      split = path.split('/')
      return searchView(
        decode(split[2]), decode(split[3]), search, action
      )
    } else if (path === '/publishers' || path === '/publishers') {
      resetStates(['form', 'search'])
      return publishers(browser, action)
    } else if (startsWith('/publishers/')) {
      resetStates(['form', 'search'])
      publisher = decodeURIComponent(path.substring(12))
      return projects(publisher, browser, action)
    } else if (startsWith('/publications/')) {
      resetStates(['form', 'search'])
      var match = new RegExp(
        '^' +
        '/publications' +
        '/([^/]+)' + // publisher
        '/([^/]+)' + // project
        '(/[^/]+)?' + // edition
        '$'
      ).exec(path)
      if (!match) {
        return notFound()
      } else {
        return loading(form.mode, function () {
          action('form:load publication', {
            publisher: decodeURIComponent(match[1]),
            project: decodeURIComponent(match[2]),
            edition: match[3]
              ? decodeURIComponent(match[3].substring(1))
              : 'current'
          })
        })
      }
    } else {
      return notFound()
    }
  }
  function startsWith (prefix) {
    return path.indexOf(prefix) === 0
  }
}

function decode (argument) {
  return argument ? decodeURIComponent(argument) : argument
}

function update () {
  nanomorph(rendered, render())
}

// History

// Trap hyperlinks.
window.addEventListener('click', function (event) {
  if (event.which === 2) {
    return
  }
  var node = findLocalLinkAnchor(event.target)
  if (node) {
    event.preventDefault()
    var path = pathOf(node.href)
    window.history.pushState({}, null, path)
    update()
  }
})

window.addEventListener('popstate', update)

// Copy Links

new Clipboard('.copy')
  .on('success', function (event) {
    window.alert('Copied')
    event.clearSelection()
  })

if (module.parent) {
  module.exports = render
} else {
  // Load Settings
  runParallel([
    function (done) {
      level.get('settings.annotators', function (error, data) {
        if (!error && data) {
          parseJSON(data, function (error, annotators) {
            if (error) {
              console.error(error)
            } else {
              reductions.emit('form:annotators', annotators)
            }
            done()
          })
        } else {
          done()
        }
      })
    },
    function (done) {
      level.get('settings.numbering', function (error, data) {
        if (!error && data) {
          parseJSON(data, function (error, name) {
            if (error) {
              console.error(error)
            } else {
              reductions.emit('form:numbering', {name: name})
            }
          })
        } else {
          done()
        }
      })
    }
  ], function () {
    rendered = render()
    document.body.appendChild(rendered)
  })
}
