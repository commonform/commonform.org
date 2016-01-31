var MobileDetect = require('mobile-detect')
var annotate = require('./utility/annotate')
var deepEqual = require('deep-equal')
var keyarray = require('keyarray')
var loadInitialForm = require('./utility/load-initial-form')
var merkleize = require('commonform-merkleize')

// The browser path prefix for specific Common Forms.
var formPathPrefix = require('./utility/constants').formPrefix

// An `EventEmitter` for sending and receiving changes to the global
// application state.
var eventBus = new (require('events').EventEmitter)

// The global application state.
var state = {

  // The Common Form to display.
  form: null,

  // Was `form` loaded from the API?
  fromAPI: false,

  // Values of fill-in-the-blanks in the form.
  // Matches the JSON Schema:
  // { "type": "array",
  //   "items": {
  //     "type": "object",
  //     "properties": {
  //       "blank": {
  //         "comment": "Array of keys locating the blank in the form.",
  //         "type": "array" },
  //       "value": {
  //         "comment": "String to insert into the form.",
  //         "type": "string" } } } }
  blanks: [ ],

  // A key array identifying the currently focused Common Form within the
  // Common Form to display, or null if no form is focused.
  focused: null,

  // The `emit` method of the global event bus, to be passed down and used in
  // event handlers to update the global state.
  emit: eventBus.emit.bind(eventBus),

  // Detect mobile user agents, so we can conditionally render user interface.
  mobile: new MobileDetect(window.navigator.userAgent).mobile(),

  // Signature page descriptions.
  signatures: [ ] }

// Global event bus event handlers. Event listeners bound to user interface
// elements fire these events to update the global state.
eventBus

  // Load a new Common Form.
  .on('form', function(form, fromAPI) {
    state.form = form
    state.fromAPI = fromAPI
    computeDerivedState()
    mainLoop.update(state)
    pushState() })

  // Assign or remove a value from a fill-in-the-blank.
  .on('blank', function(blank, value) {
    var index = state.blanks.findIndex(function(record) {
      return deepEqual(record.blank, blank) })
    if (value === undefined) {
      if (index > -1) {
        state.blanks.splice(index, 1)
        computeDerivedState()
        mainLoop.update(state)
        pushState() } }
    else {
      if (index < 0) {
        state.blanks.unshift({ blank: blank })
        index = 0 }
      state.blanks[index].value = value
      computeDerivedState()
      mainLoop.update(state) } })

  // Focus a Common Form.
  .on('focus', function(focused) {
    state.focused = focused
    computeDerivedState()
    mainLoop.update(state) })

  .on('signatures', function(operation, key, value) {
    var signatures = state.signatures
    var operand
    if (operation === 'push') {
      operand = (
        ( key.length === 0 ) ?
          signatures :
          keyarray.get(signatures, key) )
      operand.push(value) }
    else if (operation === 'splice') {
      operand = keyarray.get(signatures, key.slice(0, -1))
      operand.splice(key.slice(-1), 1) }
    else {
      keyarray[operation](signatures, key, value) }
    mainLoop.update(state) })

// The main loop that rerenders the user interface on global state change.
var mainLoop = require('main-loop')(
  state,
  require('./renderers'),
  require('virtual-dom'))

// Push a state of the application to the browser's `history`.
function pushState() {
  var digest = state.derived.merkle.digest
  history.pushState({ digest: digest }, null, ( formPathPrefix + digest )) }

// Compute various information about the displayed Common Form when it changes.
function computeDerivedState() {
  var form = state.form
  state.derived = {
    annotations: annotate(form),
    merkle: merkleize(form) } }

// Point the main rendering loop to an element on the page.
document
  .querySelector('.container')
  .appendChild(mainLoop.target)

// Load a form, either the default, "welcome" form, or the form indicated in
// the browser's location path.
loadInitialForm(
  window.location.pathname,
  formPathPrefix,
  eventBus.emit.bind(eventBus, 'form'))
