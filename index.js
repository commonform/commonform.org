Function.prototype.bind = (
  Function.prototype.bind || require('function-bind') )

var analyze = require('commonform-analyze')
var critique = require('commonform-critique')
var downloadForm = require('./download-form')
var hash = require('commonform-hash')
var isSHA256 = require('is-sha-256-hex-digest')
var keyarray = require('keyarray')
var lint = require('commonform-lint')
var persistedProperties = require('./persisted-properties')
var requestAnimationFrame = require('raf')

var bus = new (require('events').EventEmitter)

var loop

var defaultTitle = 'Untitled Document'

var state = {
  path: [ ],
  blanks: { },
  focused: null,
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

function updateHash() {
  // main-loop uses raf. This should ensure our callback is invoked
  // after the rendering pass.
  requestAnimationFrame(function() {
    if (additionalHash) {
      window.location.hash = state.digest + additionalHash
      additionalHash = undefined }
    else {
      history.pushState(null, null, '#' + state.digest) } }) }

var defaultForm = { form: { content: [ 'New form' ] } }

bus
  .on('form', function(digest, form) {
    state.digest = digest
    state.data = form
    compute()
    loop.update(state)
    updateHash() })

  .on('state', function(newState) {
    persistedProperties.forEach(function(key) {
      state[key] = newState[key] })
    compute()
    loop.update(state)
    updateHash() })

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

  .on('set', function(path, value) {
    keyarray.set(state.data, path, value)
    state.digest = hash(state.data)
    state.focused = null
    compute()
    loop.update(state)
    updateHash() })

  .on('remove', function(path) {
    var containing = keyarray.get(state.data, path.slice(0, -1))
    containing.splice(path[path.length - 1], 1)
    if (containing.length === 0) {
      containing.push(defaultForm) }
    state.digest = hash(state.data)
    state.focused = null
    compute()
    loop.update(state)
    updateHash() })

  .on('delete', function(path) {
    keyarray.delete(state.data, path)
    state.digest = hash(state.data)
    state.focused = null
    compute()
    loop.update(state)
    updateHash() })

  .on('insert', function(path) {
    var containingPath = path.slice(0, -1)
    var containing = keyarray.get(state.data, containingPath)
    var offset = path[path.length - 1]
    containing.splice(offset, 0, defaultForm)
    state.focused = null
    compute()
    loop.update(state)
    updateHash() })

  .on('focus', function(path) {
    state.focused = path
    loop.update(state) })

  .on('unfocus', function(path) {
    state.focused = null
    loop.update(state) })

loop = require('main-loop')(
  state,
  require('./renderers'),
  require('virtual-dom'))

document
  .querySelector('.container')
  .appendChild(loop.target)

var windowHash = window.location.hash

if (
  windowHash && windowHash.length >= 65 &&
  isSHA256(windowHash.slice(1, 65)) )
{ initialDigest = windowHash.slice(1, 65)
  additionalHash = windowHash.slice(65) }
else {
  initialDigest = require('./initial') }

downloadForm(initialDigest, function(error, response) {
  if (error) {
    alert(error.message) }
  else {
    bus.emit('form', response.digest, response.form) } })
