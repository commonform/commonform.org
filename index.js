Function.prototype.bind = (
  Function.prototype.bind || require('function-bind') )

var analyze = require('commonform-analyze')
var critique = require('commonform-critique')
var lint = require('commonform-lint')

var bus = new (require('events').EventEmitter)

var loop

var defaultTitle = 'Untitled Document'

var state = {
  path: [ ],
  blanks: { },
  title: defaultTitle,
  emit: bus.emit.bind(bus),
  data: require('./initial-data.json') }

state.annotations = [ ]
  .concat(lint(state.data))
  .concat(critique(state.data))

state.analysis = analyze(state.data)

bus
  .on('blank', function(blank, value) {
    if (!value || value.length === 0) {
      delete state.blanks[blank] }
    else {
      state.blanks[blank] = value }
    loop.update(state) })
  .on('title', function(newTitle) {
    if (!newTitle || newTitle.length === 0) {
      state.title = defaultTitle }
    else {
      state.title = newTitle }
    loop.update(state) })

loop = require('main-loop')(
  state,
  require('./renderers'),
  require('virtual-dom'))

document
  .querySelector('#browser')
  .appendChild(loop.target)
