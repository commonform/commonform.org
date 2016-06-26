var annotate = require('./utility/annotate')
var choo = require('choo')
var clone = require('./clone')
var keyarray = require('keyarray')
var merkleize = require('commonform-merkleize')
var welcome = require('commonform-welcome-form')

var form = require('./views/form')
var menu = require('./views/menu')
var footer = require('./views/footer')
var signaturePages = require('./views/signature-pages')

var app = choo()
app.model(
  { namespace: 'form',
    state:
      { tree: welcome,
        path: [ ],
        projects: [ ],
        blanks: [ ],
        annotations: annotate(welcome),
        merkle: merkleize(welcome),
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
          return { signaturePages: pages } } },
    effects: { } })

app.router((route) => [ route('/', formView) ])

if (module.parent) module.exports = app
else document.body.appendChild(app.start())

function formView(params, state, send) {
  return choo.view`
    <div class=container>
      <article class=commonform>
        ${menu(state.form, send)}
        ${form(state.form, send)}
        ${signaturePages(state.form.signaturePages, send)}
        ${menu(state.form, send)}
        ${footer()}
      </article>
    </div>` }
