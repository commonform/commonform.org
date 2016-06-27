const annotate = require('./annotate')
const choo = require('choo')
const clone = require('./clone')
const downloadForm = require('./download-form')
const downloadFormPublications = require('./download-form-publications')
const downloadPublication = require('./download-publication')
const footer = require('./views/footer')
const form = require('./views/form')
const header = require('./views/header')
const keyarray = require('keyarray')
const menu = require('./views/menu')
const merkleize = require('commonform-merkleize')
const runParallel = require('run-parallel')
const signaturePages = require('./views/signature-pages')

const app = choo()

const welcomeTree = require('commonform-welcome-form')
const welcome = {
  tree: welcomeTree,
  annotations: annotate(welcomeTree),
  merkle: merkleize(welcomeTree)
}
welcome.digest = welcome.merkle.digest

app.model({
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
    tree: (action) => ({
      error: null,
      tree: action.tree,
      path: [],
      projects: [],
      blanks: [],
      annotations: annotate(action.tree),
      merkle: merkleize(action.tree),
      publications: action.publications,
      signaturePages: [],
      focused: null
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
          else send('form:tree', {tree: results[0], publications: results[1]})
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
})

app.router('/notFound', (route) => [
  route('/', formView),
  route('/notFound', notFound),
  route('/forms', [
    route('/:digest', formView)
  ]),
  route('/publications', [
    route('/:publisher', [
      route('/:project', redirectToForm, [
        route('/:edition', redirectToForm)
      ])
    ])
  ])
])

if (module.parent) module.exports = app
else document.body.appendChild(app.start())

function notFound () {
  choo.view`
    <div class=container>
      <article class=commonform>
        <p>Not found.</p>
      </article>
    </div>
  `
}

function redirectToForm (params, state, send) {
  send('form:redirectToForm', params)
  return choo.view`
    <div class=container>
      <article class=commonform>
        Loading...
      </article>
    </div>
  `
}

function formView (params, state, send) {
  if (Object.keys(params).length === 0) params.digest = welcome.digest
  if (state.form.error) {
    return choo.view`
      <div class=container>
        <article class=commonform>
          <p class=error>${state.form.error.message}</p>
        </article>
      </div>
    `
  } else if (!state.form.merkle) {
    send('form:fetch', params)
    return choo.view`
      <div class=container>
        <article class=commonform>
          Loading...
        </article>
      </div>
    `
  } else {
    return choo.view`
      <div class=container>
        <article class=commonform>
          ${menu(state.form, send)}
          ${header(state.form.merkle.digest, state.form.publications)}
          ${form(state.form, send)}
          ${signaturePages(state.form.signaturePages, send)}
          ${menu(state.form, send)}
          ${footer()}
        </article>
      </div>
    `
  }
}
