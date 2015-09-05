// Current versions of PhantomJS, the headless web browser used for automated
// testing, require a shim for Function.prototype.bind.
Function.prototype.bind = (
  Function.prototype.bind || require('function-bind') )

// Lots of imports.
var analyze = require('commonform-analyze')
var combineStrings = require('./combine-strings')
var critique = require('commonform-critique')
var downloadForm = require('./download-form')
var isSHA256 = require('is-sha-256-hex-digest')
var jsonClone = require('./json-clone')
var keyarray = require('keyarray')
var lint = require('commonform-lint')
var lru = require('lru-cache')
var merkleize = require('commonform-merkleize')
var persistedProperties = require('./persisted-properties.json')
var requestAnimationFrame = require('raf')
var treeify = require('commonform-treeify-annotations')

// Changes to application state are handled via syntheic events. This is the
// global event bus.
var bus = new (require('events').EventEmitter)

var loop

// Defualt content of various kinds, used as placeholder values.
var defaultTitle = 'Untitled Document'
var defaultForm = { form: { content: [ 'New form' ] } }
var defaultParagraph = 'New text'

// The application global's state. This is modified only on initialization and
// via event handlers on the global event bus.
var state = {

  // An array of string and number keys denoting the current position in the
  // tree of forms. This property is expanded as renderers descend down the
  // tree.
  path: [ ],

  // Fill-in-the-blank values.
  blanks: { },

  // The path of the currently focused form, if any.
  focused: null,

  // The root digest of the current form. Initially, this is empty, but it will
  // be set immediately when a form is loaded from the public library.
  digest: '',

  // The title of this project. Passed to to the .docx and other renderers on
  // export.
  title: defaultTitle,

  // The global event bus' emit function. Passing this down to renderers gives
  // them a way to emit events that alter the global state.
  emit: bus.emit.bind(bus),

  // The property that holds the tree of forms. This is just a default value to
  // render until we load the introductory message from the public library.
  data: { content: [ 'No content loaded' ] } }

// A size-bounded cache for past states of the form. Used to enable undo using
// the pushState.
var formCache = lru({
  max: 64 * 100,
  length: function() {
    return 64 },
  maxAge: Infinity })

window.addEventListener('popstate', function(event) {
  if (event.state) {
    var digest = event.state.digest
    var cached = formCache.get(digest)
    if (cached) {
      bus.emit('form', digest, cached, true) }
    else {
      downloadForm(digest, function(error, response) {
        if (error) {
          alert('Could not load') }
        else {
          bus.emit(digest, response.form, true) } }) } } })

// compute() does all of the analysis required whenever a change is made to the
// global state.
function compute() {
  // Create a tree of objects of the same shape as state.data that contains the
  // common form digests of each form.
  state.merkle = merkleize(state.data)

  // The root digest of the form tree.
  state.digest = state.merkle.digest

  // Create a tree of objects of the same shape as state.data that contains
  // lists of annotations at the same place in the tree as the forms they
  // pertain to. treeify() takes a list of of annotations.
  state.annotationsTree = treeify(

    // Run commonform-critique on the form.
    critique(state.data)

      // Run commonform-lint as well.
      .concat(lint(state.data))

      // Annotation paths are specific to individual content array elements,
      // but are displayed by containing forms, which are two keys up---like
      // ['content', X]---from the their content elements. Go ahead and slice
      // off the last two elements of each annotation's key array so its key is
      // the key of the containing form.
      .map(function(annotation) {
        annotation.path = annotation.path.slice(0, -2)
        return annotation }))

  // Run commonform-analyze on the form.
  state.analysis = analyze(state.data) }

// Since we've set an initial state, go ahead and run the computations.
compute()

var initialDigest

// Update window.location.hash with a new root digest.
function cacheForm(fromHistory) {

  // main-loop, which handles rerendering our interface with new global state,
  // uses requestAnimationFrame. This should ensure our callback is invoked
  // after the rendering pass.
  requestAnimationFrame(function() {

    // Cache the form
    formCache.set(state.merkle.digest, jsonClone(state.data))

    // Include the form digest in the push state.
    if (!fromHistory) {
      history.pushState(
        { digest: state.digest },
        null,
        '/form/' + state.digest) } }) }

// Event bus handlers
bus

  // When a new form is loaded, say from the public library.
  .on('form', function(digest, form, fromHistory) {
    state.data = form
    compute()

    // Have main-loop rerender the interface.
    loop.update(state)

    // Update window.location.hash.
    cacheForm(fromHistory) })

  // When an entirely new state object is loaded, say when the user loads a
  // saved JSON project.
  .on('state', function(newState) {
    persistedProperties.forEach(function(key) {
      state[key] = newState[key] })
    compute()
    loop.update(state)
    cacheForm() })

  // When the value of a fill-in-the-blank changes.
  .on('blank', function(blank, value) {
    if (!value || value.length === 0) {
      delete state.blanks[blank] }
    else {
      state.blanks[blank] = value }
    loop.update(state) })

  // When the title of the project changes.
  .on('title', function(newTitle) {
    if (!newTitle || newTitle.length === 0) {
      state.title = defaultTitle }
    else {
      state.title = newTitle }
    loop.update(state) })

  // Some direct state mutation by key array.
  .on('set', function(path, value) {
    keyarray.set(state.data, path, value)
    compute()
    loop.update(state)
    cacheForm() })

  // Remove a content element from a content array.
  .on('remove', function(path) {
    var containing = keyarray.get(state.data, path.slice(0, -2))
    containing.content.splice(path[path.length - 1], 1)

    // By deleting a content, we may end up with a content array that has
    // contiguous strings. Common forms cannot have contiguous strings, so we
    // need to combine them.
    combineStrings(containing)

    // We might also end up with an empty content array. If so, throw in a
    // placehodler form.
    if (containing.content.length === 0) {
      containing.content.push(jsonClone(defaultForm))}
    compute()
    loop.update(state)
    cacheForm() })

  // Directly delete some part of the global state by key array.
  .on('delete', function(path) {
    keyarray.delete(state.data, path)
    compute()
    loop.update(state)
    cacheForm() })

  // Insert a child form somewhere in the tree.
  .on('insertForm', function(path) {

    // Splice it in.
    var containingPath = path.slice(0, -1)
    var containing = keyarray.get(state.data, containingPath)
    var offset = path[path.length - 1]
    containing.splice(offset, 0, jsonClone(defaultForm))
    compute()
    loop.update(state)
    cacheForm() })

  // Insert a new bit of text somewhere in the tree.
  .on('insertParagraph', function(path) {
    var containingPath = path.slice(0, -1)
    var containing = keyarray.get(state.data, containingPath)
    var offset = path[path.length - 1]
    containing.splice(offset, 0, defaultParagraph)
    compute()
    loop.update(state)
    cacheForm() })

  // Focus a particular form, by path.
  .on('focus', function(path) {
    state.focused = path
    loop.update(state) })

// The main application loop. main-loop handles rerendering on calls to
// loop.update(state).
loop = require('main-loop')(

  // Use the global state object.
  state,

  // Use the root renderer function
  require('./renderers'),

  // The JavaScript virtual DOM implementation.
  require('virtual-dom'))

// Hook main-loop's rendering up to the DOM.
document

  // The element to shadow and rerender.
  .querySelector('.container')
  .appendChild(loop.target)

var path = window.location.pathname

// On load, check if we have a digest in window.location.hash. If we do, load
// it from the public library.
if (
  path && ( path.length === ( 64 + 6 ) ) &&
  isSHA256(path.slice(6, ( 64 + 6 ))) )
{ initialDigest = path.slice(6, ( 64 + 6 )) }

// Otherwise, load a default form.
else {
  initialDigest = require('./initial.json') }

// Download from the public library.
downloadForm(initialDigest, function(error, response) {
  if (error) {
    alert(error.message) }
  else {
    bus.emit('form', response.digest, response.form) } })
