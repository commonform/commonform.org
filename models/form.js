var annotate = require('../utilities/annotate')
var assert = require('assert')
var clone = require('../utilities/clone')
var diff = require('commonform-diff')
var deepEqual = require('deep-equal')
var downloadForm = require('../queries/form')
var downloadFormPublications = require('../queries/form-publications')
var fix = require('commonform-fix-strings')
var keyarray = require('keyarray')
var merkleize = require('commonform-merkleize')
var runParallel = require('run-parallel')
var welcome = require('../data/welcome')

var slice = Array.prototype.slice
var splice = Array.prototype.splice

module.exports = {
  namespace: 'form',

  state: {
    dynamic: false,
    mode: 'read',
    error: null,
    tree: welcome.tree,
    path: [],
    projects: [],
    blanks: [],
    annotations: welcome.annotations,
    publications: [],
    merkle: welcome.merkle,
    signaturePages: [],
    focused: null
  },

  reducers: {

    mode: function (action, state) {
      return action
    },

    blank: function (action, state) {
      var blank = action.path
      var value = action.value
      var index = state.blanks
      .findIndex(function (record) {
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
    },

    comparing: function (action, state) {
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
    },

    focus: function (action) {
      return {focused: action.path}
    },

    signatures: function (action, state) {
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
    },

    tree: function (action, state) {
      return {
        dynamic: action.dynamic || false,
        error: null,
        tree: action.tree,
        path: [],
        projects: [],
        blanks: [],
        annotations: annotate(action.tree),
        merkle: action.merkle || merkleize(action.tree),
        publications: action.publications,
        signaturePages: [],
        focused: null,
        diff: state.hasOwnProperty('comparing')
        ? diff(action.tree, state.comparing.tree)
        : null
      }
    },

    error: function (action) {
      return {error: action.error}
    }

  },

  effects: {

    modify: function (action, state, send, done) {
      action.dynamic = true
      var merkle = merkleize(action.tree)
      var root = merkle.digest
      var href = '/forms/' + root
      send('form:tree', action, function () {
        send('location:setLocation', {location: href}, done)
        window.history.pushState({}, '', href)
      })
    },

    child: function (action, state, send, done) {
      assert(Array.isArray(action.path))
      var path = action.path
      var newChild = {form: {content: ['...']}}
      var newTree = clone(state.tree)
      var array = keyarray.get(newTree, path.slice(0, -1))
      var index = path[path.length - 1]
      array.splice(index, 0, newChild)
      var payload = {
        tree: newTree,
        publications: [],
        dynamic: true
      }
      send('form:modify', payload, done)
    },

    splice: function (action, state, send, done) {
      assert(Array.isArray(action.path))
      var newTree = clone(state.tree)
      var path = action.path
      var array = keyarray.get(newTree, path.slice(0, -1))
      var index = path[path.length - 1]
      array.splice(index, 1)
      fix(newTree)
      var payload = {
        tree: newTree,
        publications: [],
        dynamic: true
      }
      send('form:modify', payload, done)
    },

    move: function (action, state, send, done) {
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
        var payload = {
          tree: newTree,
          publications: [],
          dynamic: true
        }
        send('form:modify', payload, done)
      }
    },

    heading: function (action, state, send, done) {
      var path = action.path
      var newHeading = action.heading
      var newTree = clone(state.tree)
      if (newHeading.length === 0) {
        keyarray.delete(newTree, path.concat('heading'))
      } else {
        keyarray.set(newTree, path.concat('heading'), newHeading)
      }
      var payload = {
        tree: newTree,
        publications: [],
        dynamic: true
      }
      send('form:modify', payload, done)
    },

    edit: function (action, state, send, done) {
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
      var payload = {
        tree: newTree,
        publications: [],
        dynamic: true
      }
      send('form:modify', payload, done)
    },

    fetch: function (action, state, send, done) {
      var digest = action.digest
      runParallel(
        [
          function (done) {
            downloadForm(digest, function (error, tree) {
              if (error) done(error)
              else done(null, tree)
            })
          },
          function (done) {
            downloadFormPublications(
              digest,
              function (error, publications) {
                if (error) done(null, [])
                else done(null, publications)
              }
            )
          }
        ],
        function (error, results) {
          if (error) done(error)
          else {
            var payload = {
              tree: results[0],
              publications: results[1]
            }
            var name = action.comparing
            ? 'form:comparing'
            : 'form:tree'
            send(name, payload, function (error) {
              if (error) done(error)
            })
          }
        }
      )
    }
  }
}
