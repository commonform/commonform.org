Function.prototype.bind = (
  Function.prototype.bind || require('function-bind') )

var analyze = require('commonform-analyze')
var lint = require('commonform-lint')

var loop

function deriveData(state) {
  state.annotations = lint(state.data)
  state.analysis = analyze(state.data) }

var state = {
  path: [ ],
  blanks: { },
  title: 'Agreement',
  update: function(mutation) {
    mutation(state)
    deriveData(state)
    loop.update(state) },
  data: require('./initial-data.json') }

deriveData(state)

loop = require('main-loop')(
  state, require('./renderers'), require('virtual-dom'))

document
  .querySelector('#browser')
  .appendChild(loop.target)
