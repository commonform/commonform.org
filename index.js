var merkleize = require('commonform-merkleize')
var loadInitialForm = require('./utility/load-initial-form')

var formPathPrefix = '/forms/'

var applicationState = {
  title: 'Untitled Document',
  path: [ ] }

var eventBus = new (require('events').EventEmitter)

eventBus.on('form', function(form) {
  applicationState.data = form
  computeDerivedState()
  mainLoop.update(applicationState)
  pushState() })

var mainLoop = require('main-loop')(
  applicationState,
  require('./renderers'),
  require('virtual-dom'))

function pushState() {
  var digest = applicationState.derived.merkle.digest
  history.pushState({ digest: digest }, null, ( formPathPrefix + digest )) }

function computeDerivedState() {
  applicationState.derived = { merkle: merkleize(applicationState.data) } }

document
  .querySelector('.container')
  .appendChild(mainLoop.target)

loadInitialForm(
  window.location.pathname,
  formPathPrefix,
  eventBus.emit.bind(eventBus, 'form'))
