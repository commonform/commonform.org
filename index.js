var isSHA256 = require('is-sha-256-hex-digest')
var downloadForm = require('./utility/download-form')
var merkleize = require('commonform-merkleize')

var bus = new (require('events').EventEmitter)
var loop

var state = {
  title: 'Untitled Document',
  path: [ ] }

loop = require('main-loop')(
  state,
  require('./renderers'),
  require('virtual-dom'))

bus.on('form', function(form) {
  state.data = form
  computeDerivedState()
  loop.update(state)
  pushState() })

function pushState() {
  var digest = state.derived.merkle.digest
  history.pushState({ digest: digest }, null, ( forms + digest )) }

function computeDerivedState() {
  state.derived = { merkle: merkleize(state.data) } }

document
  .querySelector('.container')
  .appendChild(loop.target)

var path = window.location.pathname

var forms = '/forms/'
var formsLength = forms.length
var digestLength = 64

var initialDigest

if (
  path && ( path.length === ( digestLength + formsLength ) ) &&
  isSHA256(path.slice(formsLength, ( digestLength + formsLength ))) ) {
  initialDigest = path.slice(formsLength, ( digestLength + formsLength ))
  downloadForm(initialDigest, function(error, response) {
    if (error) {
      alert(error.message) }
    else {
      bus.emit('form', response.form) } }) }
else {
  bus.emit('form', require('commonform-welcome-form')) }
