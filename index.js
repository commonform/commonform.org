Function.prototype.bind = (
  Function.prototype.bind || require('function-bind') )

var analyze = require('commonform-analyze')
var critique = require('commonform-critique')
var lint = require('commonform-lint')
var downloadForm = require('./download-form')
var isSHA256 = require('is-sha-256-hex-digest')
var requestAnimationFrame = require('raf')

var bus = new (require('events').EventEmitter)

var loop

var defaultTitle = 'Untitled Document'

var state = {
  path: [ ],
  blanks: { },
  digest: 'f99a86c2e3318e9bd974c24a813d35ff493d1487e9b2ee1b2919027df8049ef6',
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

var initialDigest
var additionalHash

bus
  .on('form', function(digest, form) {
    state.digest = digest
    state.data = form
    compute()
    loop.update(state)
    requestAnimationFrame(function() {
      if (additionalHash) {
        window.location.hash = digest + additionalHash
        additionalHash = undefined }
      else {
        history.pushState(null, null, '#' + state.digest) } }) })
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

if ( hash && hash.length >= 65 && isSHA256(hash.slice(1, 65)) ) {
  initialDigest = hash.slice(1, 65)
  additionalHash = hash.slice(65) }
else {
  initialDigest = require('./initial') }

downloadForm(initialDigest, function(error, response) {
  if (error) {
    alert(error.message) }
  else {
    bus.emit('form', response.digest, response.form) } })
