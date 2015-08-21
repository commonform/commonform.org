Function.prototype.bind = (
  Function.prototype.bind || require('function-bind') )

var analyze = require('commonform-analyze')
var critique = require('commonform-critique')
var lint = require('commonform-lint')
var downloadForm = require('./download-form')
var isSHA256 = require('is-sha-256-hex-digest')

var bus = new (require('events').EventEmitter)

var loop

var defaultTitle = 'Untitled Document'

var state = {
  path: [ ],
  blanks: { },
  title: defaultTitle,
  emit: bus.emit.bind(bus),
  data: { content: [ 'No content loaded' ] } }

function compute() {
  state.errors = lint(state.data)
  state.critiques = critique(state.data)

  state.annotations = state.errors
    .concat(state.critiques)

  state.analysis = analyze(state.data) }

compute()

bus
  .on('form', function(form) {
    state.data = form
    compute()
    loop.update(state) })
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

var hash = window.location.hash

var initial = (
  ( hash && hash.length >= 65 && isSHA256(hash.slice(1, 65)) ) ?
  ( initial = hash.slice(1, 65) ) :
  require('./initial') )

downloadForm(initial, function(error, response) {
  if (error) {
    alert(error.message) }
  else {
    bus.emit('form', response.form) } })
