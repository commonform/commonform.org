Function.prototype.bind = (
  Function.prototype.bind || require('function-bind') )

var analyze = require('commonform-analyze')
var lint = require('commonform-lint')

var bus = new (require('events').EventEmitter)

var loop

var state = {
  path: [ ],
  blanks: { },
  title: 'Agreement',
  emit: bus.emit.bind(bus),
  data: require('./initial-data.json') }

state.annotations = lint(state.data)
state.analysis = analyze(state.data)

bus
  .on('blank', function(blank, value) {
    if (!value || value.length === 0) {
      delete state.blanks[blank] }
    else {
      state.blanks[blank] = value }
    loop.update(state) })

loop = require('main-loop')(
  state,
  require('./renderers'),
  require('virtual-dom'))

document
  .querySelector('#browser')
  .appendChild(loop.target)
