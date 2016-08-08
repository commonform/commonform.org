var annotate = require('../utilities/annotate')
var assert = require('assert')
var cache = require('../cache')
var clone = require('../utilities/clone')
var deepEqual = require('deep-equal')
var diff = require('commonform-diff')
var fix = require('commonform-fix-strings')
var getForm = require('../queries/form')
var getFormPublications = require('../queries/form-publications')
var getPublication = require('../queries/publication')
var keyarray = require('keyarray')
var merkleize = require('commonform-merkleize')
var runParallel = require('run-parallel')

var slice = Array.prototype.slice
var splice = Array.prototype.splice

module.exports = function (initialize, reduction, handler) {
  initialize({
    annotations: null,
    blanks: [],
    diff: null,
    error: null,
    focused: null,
    merkle: null,
    mode: 'read',
    path: [],
    projects: [],
    publications: [],
    signaturePages: [],
    tree: null
  })

  reduction('mode', function (mode) {
    return {mode: mode}
  })

  handler('mode', function (mode, state, reduce, done) {
    reduce('mode', mode)
    done()
  })

  reduction('blank', function (action, state) {
    var blank = action.path
    var value = action.value
    var index = state.blanks.findIndex(function (record) {
      return deepEqual(record.blank, blank)
    })
    var newBlanks = clone(state.blanks)
    if (value === null) {
      if (index > -1) {
        newBlanks.splice(index, 1)
        return {blanks: newBlanks}
      }
    } else {
      if (index < 0) {
        newBlanks.unshift({blank: blank})
        index = 0
      }
      newBlanks[index].value = value
      return {blanks: newBlanks}
    }
  })

  handler('blank', function (action, state, reduce, done) {
    reduce('blank', action)
    done()
  })

  reduction('comparing', function (action, state) {
    return {
      comparing: {
        tree: action.tree,
        merkle: merkleize(action.tree),
        publications: action.publications
      },
      diff: state.hasOwnProperty('tree')
      ? diff(state.tree, action.tree)
      : null
    }
  })

  reduction('focus', function (path) {
    return {focused: path}
  })

  handler('focus', function (path, state, reduce, done) {
    reduce('focus', path)
    done()
  })

  reduction('signatures', function (action, state) {
    var pages = clone(state.signaturePages)
    var operand
    if (action.operation === 'push') {
      operand = action.key.length === 0
      ? pages
      : keyarray.get(pages, action.key)
      operand.push(action.value)
    } else if (action.operation === 'splice') {
      operand = keyarray.get(pages, action.key.slice(0, -1))
      operand.splice(action.key.slice(-1), 1)
    } else {
      keyarray[action.operation](pages, action.key, action.value)
    }
    return {signaturePages: pages}
  })

  handler('signatures', function (action, state, reduce, done) {
    reduce('signatures', action)
    done()
  })

  reduction('tree', function (action, state) {
    return {
      dynamic: action.dynamic || false,
      error: null,
      tree: action.tree,
      path: [],
      projects: [],
      blanks: [],
      annotations: annotate(action.tree),
      merkle: action.merkle || merkleize(action.tree),
      publications: action.publications || [],
      signaturePages: [],
      focused: null,
      diff: state.hasOwnProperty('comparing')
      ? diff(action.tree, state.comparing.tree)
      : null
    }
  })

  function pushEditedTree (data, reduce, callback) {
    var merkle = data.merkle = merkleize(data.tree)
    var root = merkle.digest
    var path = formPath(root)
    var json = JSON.stringify(data.tree)
    cache.put(root, json, onError(callback, function () {
      window.history.pushState(data, '', path)
      reduce('tree', data)
      callback()
    }))
  }

  handler('child', function (action, state, reduce, done) {
    assert(Array.isArray(action.path))
    var path = action.path
    var newChild = {form: {content: ['...']}}
    var newTree = clone(state.tree)
    var array = keyarray.get(newTree, path.slice(0, -1))
    var index = path[path.length - 1]
    array.splice(index, 0, newChild)
    pushEditedTree({tree: newTree}, reduce, done)
  })

  handler('splice', function (action, state, reduce, done) {
    assert(Array.isArray(action.path))
    var newTree = clone(state.tree)
    var path = action.path
    var array = keyarray.get(newTree, path.slice(0, -1))
    var index = path[path.length - 1]
    array.splice(index, 1)
    fix(newTree)
    pushEditedTree({tree: newTree}, reduce, done)
  })

  handler('move', function (action, state, reduce, done) {
    assert(Array.isArray(action.path))
    assert(Array.isArray(state.focused))
    var fromPath = state.focused
    var toPath = action.path
    // Do not move forms within themselves.
    if (deepEqual(fromPath, toPath.slice(0, fromPath.length))) {
      done()
    } else {
      var newTree = clone(state.tree)
      var hasMoving = keyarray.get(newTree, fromPath.slice(0, -1))
      var moving = keyarray.get(newTree, fromPath)
      var hasTarget = keyarray.get(newTree, toPath.slice(0, -1))
      var fromIndex = fromPath[fromPath.length - 1]
      var toIndex = toPath[toPath.length - 1]
      hasTarget.splice(toIndex, 0, moving)
      var oldIndex = toIndex > fromIndex
      ? hasMoving.indexOf(moving)
      : hasMoving.lastIndexOf(moving)
      hasMoving.splice(oldIndex, 1)
      pushEditedTree({tree: newTree}, reduce, done)
    }
  })

  handler('heading', function (action, state, reduce, done) {
    var path = action.path
    var newHeading = action.heading
    var newTree = clone(state.tree)
    if (newHeading.length === 0) {
      keyarray.delete(newTree, path.concat('heading'))
    } else {
      keyarray.set(newTree, path.concat('heading'), newHeading)
    }
    pushEditedTree({tree: newTree}, reduce, done)
  })

  handler('edit', function (action, state, reduce, done) {
    assert(action.element)
    assert(Array.isArray(action.context))
    assert(Number.isInteger(action.offset))
    assert(Number.isInteger(action.count))
    var element = action.element
    var children = slice.call(element.childNodes)
    var elements = children.map(function (element) {
      var nodeType = element.nodeType
      var tagName = element.tagName
      var className = element.className
      // Handle nodes our renderer generates for valid form content.
      // span.string
      if (tagName === 'SPAN' && className === 'string') {
        return element.textContent
      // dfn
      } else if (tagName === 'DFN') {
        return {definition: element.textContent}
      // a.use
      } else if (tagName === 'A' && className === 'use') {
        return {use: element.textContent}
      // a.reference
      } else if (tagName === 'A' && className === 'reference') {
        return {reference: element.textContent}
      // input.blank
      } else if (tagName === 'INPUT' && className === 'blank') {
        return {blank: ''}
      // Handle nodes our rendered does _not_ generate.  These come
      // from user input and copy-and-paste.
      } else if (nodeType === window.Node.TEXT_NODE) {
        return element.textContent
      } else if (nodeType === window.Node.ELEMENT_NODE) {
        return element.textContent
      // Return an empty string for anything else.
      // commonform-fix-strings will make sure we end up with valid
      // form content.
      } else {
        return ''
      }
    })
    // TODO: Automatically mark new term uses.
    // TODO: Automatically mark new definitions.
    // TODO: Automatically mark new references.
    // TODO: Automatically mark new blanks.
    var newTree = clone(state.tree)
    var context = keyarray.get(newTree, action.context)
    var offset = action.offset
    var count = action.count
    splice.apply(context, [offset, count].concat(elements))
    fix(newTree)
    pushEditedTree({tree: newTree}, reduce, done)
  })

  handler('fetch', function (data, state, reduce, done) {
    var digest = data.digest
    loadForm(digest, onError(done, function (result) {
      reduce(data.comapring ? 'comparing' : 'tree', result)
      done()
    }))
  })

  handler('load form', function (digest, state, reduce, done) {
    loadForm(digest, onError(done, function (data) {
      reduce('tree', data)
      window.history.pushState(data, '', formPath(digest))
      done()
    }))
  })

  handler('load publication', function (data, state, reduce, done) {
    getPublication(data, onError(done, function (digest) {
      loadForm(digest, onError(done, function (data) {
        reduce('tree', data)
        window.history.pushState(data, '', formPath(digest))
        done()
      }))
    }))
  })
}

function formPath (digest) {
  return '/forms/' + digest
}

function loadForm (digest, callback) {
  runParallel(
    [
      function (done) {
        getForm(digest, function (error, tree) {
          if (error) {
            done(error)
          } else {
            done(null, tree)
          }
        })
      },
      function (done) {
        getFormPublications(
          digest,
          function (error, publications) {
            if (error) {
              done(null, [])
            } else {
              done(null, publications)
            }
          }
        )
      }
    ],
    function (error, results) {
      if (error) {
        callback(error)
      } else {
        callback(null, {
          tree: results[0],
          publications: results[1]
        })
      }
    }
  )
}

function onError (onError, onSuccess) {
  return function () {
    var error = arguments[0]
    if (error) {
      onError(error)
    } else {
      onSuccess.apply(null, slice.call(arguments, 1))
    }
  }
}
