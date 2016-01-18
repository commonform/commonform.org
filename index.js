var critique = require('commonform-critique')
var deepEqual = require('deep-equal')
var lint = require('commonform-lint')
var loadInitialForm = require('./utility/load-initial-form')
var merkleize = require('commonform-merkleize')
var treeify = require('commonform-treeify-annotations')

var formPathPrefix = '/forms/'

var eventBus = new (require('events').EventEmitter)

var applicationState = {
  blanks: [ ],
  path: [ ],
  focused: null,
  emit: eventBus.emit.bind(eventBus) }

eventBus
  .on('form', function(form) {
    applicationState.form = form
    computeDerivedState()
    mainLoop.update(applicationState)
    pushState() })
  .on('blank', function(blank, value) {
    var index = applicationState.blanks.findIndex(function(record) {
      return deepEqual(record.blank, blank) })
    if (value === undefined) {
      if (index > -1) {
        applicationState.blanks.splice(index, 1)
        computeDerivedState()
        mainLoop.update(applicationState)
        pushState() } }
    else {
      if (index < 0) {
        applicationState.blanks.unshift({ blank: blank })
        index = 0 }
      applicationState.blanks[index].value = value
      computeDerivedState()
      mainLoop.update(applicationState) } })
  .on('focus', function(focused) {
    applicationState.focused = focused
    computeDerivedState()
    mainLoop.update(applicationState) })

var mainLoop = require('main-loop')(
  applicationState,
  require('./renderers'),
  require('virtual-dom'))

function pushState() {
  var digest = applicationState.derived.merkle.digest
  history.pushState({ digest: digest }, null, ( formPathPrefix + digest )) }

function computeDerivedState() {
  var form = applicationState.form
  applicationState.derived = {
    annotations: treeify(
      [ ]
        .concat(critique(form))
        .concat(lint(form))
        .map(function(annotation) {
          annotation.path = annotation.path.slice(0, -2)
          return annotation })),
    merkle: merkleize(form) } }

document
  .querySelector('.container')
  .appendChild(mainLoop.target)

loadInitialForm(
  window.location.pathname,
  formPathPrefix,
  eventBus.emit.bind(eventBus, 'form'))
