var annotate = require('./utility/annotate')
var choo = require('choo')
var clone = require('./clone')
var downloadForm = require('./download-form')
var keyarray = require('keyarray')
var merkleize = require('commonform-merkleize')

var form = require('./views/form')
var menu = require('./views/menu')
var footer = require('./views/footer')
var signaturePages = require('./views/signature-pages')

var app = choo()

var welcomeTree = require('commonform-welcome-form')
var welcome =
  { tree: welcomeTree,
    annotations: annotate(welcomeTree),
    merkle: merkleize(welcomeTree) }
welcome.digest = welcome.merkle.digest

app.model(
  { namespace: 'form',
    state:
      { error: null,
        tree: welcome.tree,
        path: [ ],
        projects: [ ],
        blanks: [ ],
        annotations: welcome.annotations,
        merkle: welcome.merkle,
        signaturePages: [ ],
        focused: null },

    reducers:
      { focus: (action) => ({ focused: action.path }),
        signatures: function(action, state) {
          var pages = clone(state.signaturePages)
          var operand
          if (action.operation === 'push') {
            operand = (
              ( action.key.length === 0 )
                ? pages
                : keyarray.get(pages, action.key) )
            operand.push(action.value) }
          else if (action.operation === 'splice') {
            operand = keyarray.get(pages, action.key.slice(0, -1))
            operand.splice(action.key.slice(-1), 1) }
          else {
            keyarray[action.operation](pages, action.key, action.value) }
          return { signaturePages: pages } },
        tree: (action) =>
          ({  error: null,
              tree: action.tree,
              path: [ ],
              projects: [ ],
              blanks: [ ],
              annotations: annotate(action.tree),
              merkle: merkleize(action.tree),
              signaturePages: [ ],
              focused: null }),
        load: () => ({ loading: true }) },

    effects:
      { 'fetch': function(action, state, send) {
          if (action.digest === welcome.digest) {
            send('form:tree', { tree: welcome.tree }) }
          else {
            downloadForm(action.digest, function(error, tree) {
              if (error) { send('form:error', { error: error }) }
              else { send('form:tree', { tree: tree }) } }) } } } })

app.router((route) =>
  [ route('/', formView),
    route('/forms',
      [ route('/:digest', formView) ]) ])

if (module.parent) module.exports = app
else document.body.appendChild(app.start())

function formView(params, state, send) {
  var digest = params.digest || welcome.digest
  if (state.form.error) {
    return choo.view`
      <div class=container>
        <article class=commonform>
          <p class=error>${state.form.error}</p>
        </article>
      </div>` }
  else if (!state.form.merkle || digest !== state.form.merkle.digest) {
    send('form:fetch', { digest: digest })
    return choo.view`
      <div class=container>
        <article class=commonform>
          Loading...
        </article>
      </div>` }
  else {
    return choo.view`
      <div class=container>
        <article class=commonform>
          ${menu(state.form, send)}
          ${form(state.form, send)}
          ${signaturePages(state.form.signaturePages, send)}
          ${menu(state.form, send)}
          ${footer()}
        </article>
      </div>` } }
