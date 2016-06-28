const annotate = require('../annotate')
const clone = require('../clone')
const diff = require('commonform-diff')
const downloadForm = require('../queries/form')
const downloadFormPublications = require('../queries/form-publications')
const downloadPublication = require('../queries/publication')
const keyarray = require('keyarray')
const merkleize = require('commonform-merkleize')
const runParallel = require('run-parallel')

module.exports = {
  namespace: 'form',

  state: {
    error: null,
    tree: null,
    path: [],
    projects: [],
    blanks: [],
    annotations: null,
    merkle: null,
    signaturePages: [],
    focused: null
  },

  reducers: {
    comparing: (action, state) => ({
      comparing: {
        tree: action.tree,
        merkle: merkleize(action.tree),
        publications: action.publications
      },
      diff: state.hasOwnProperty('tree')
        ? diff(state.tree, action.tree)
        : null
    }),
    focus: (action) => ({focused: action.path}),
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
    tree: (action, state) => ({
      error: null,
      tree: action.tree,
      path: [],
      projects: [],
      blanks: [],
      annotations: annotate(action.tree),
      merkle: merkleize(action.tree),
      publications: action.publications,
      signaturePages: [],
      focused: null,
      diff: state.hasOwnProperty('comparing')
        ? diff(action.tree, state.comparing.tree)
        : null
    }),
    error: (action) => ({error: action.error}),
    load: () => ({tree: null, annotations: null, merkle: null})},

  effects: {
    fetch: function (action, state, send) {
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
            downloadFormPublications(digest, function (error, publications) {
              if (error) done(null, [])
              else done(null, publications)
            })
          }
        ],
        function (error, results) {
          if (error) send('form:error', {error: error})
          else {
            const payload = {tree: results[0], publications: results[1]}
            const name = action.comparing ? 'form:comparing' : 'form:tree'
            send(name, payload)
          }
        })
    },
    redirectToForm: function (action, state, send) {
      action.edition = action.edition || 'current'
      downloadPublication(action, function (error, digest) {
        if (error) send('form:error', {error: error})
        else window.location = '/forms/' + digest
      })
    }
  }
}
