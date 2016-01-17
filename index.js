var isSHA256 = require('is-sha-256-hex-digest')
var downloadForm = require('./utility/download-form')
var merkleize = require('commonform-merkleize')
var welcome = require('commonform-welcome-form')

var welcomeDigest = merkleize(welcome).digest

var eventBus = new (require('events').EventEmitter)

var applicationState = {
  title: 'Untitled Document',
  path: [ ] }

var mainLoop = require('main-loop')(
  applicationState,
  require('./renderers'),
  require('virtual-dom'))

eventBus.on('form', function(form) {
  applicationState.data = form
  computeDerivedState()
  mainLoop.update(applicationState)
  pushState() })

function pushState() {
  var digest = applicationState.derived.merkle.digest
  history.pushState({ digest: digest }, null, ( forms + digest )) }

function computeDerivedState() {
  applicationState.derived = { merkle: merkleize(applicationState.data) } }

document
  .querySelector('.container')
  .appendChild(mainLoop.target)

var path = window.location.pathname

var forms = '/forms/'
var formsLength = forms.length
var digestLength = 64

var initialDigest

if (
  path && ( path.length === ( digestLength + formsLength ) ) &&
  isSHA256(path.slice(formsLength, ( digestLength + formsLength ))) ) {
  initialDigest = path.slice(formsLength, ( digestLength + formsLength ))
  if (initialDigest === welcomeDigest) {
    eventBus.emit('form', welcome) }
  else {
    downloadForm(initialDigest, function(error, response) {
      if (error) {
        alert(error.message) }
      else {
        eventBus.emit('form', response.form) } }) } }
else {
  eventBus.emit('form', welcome) }
