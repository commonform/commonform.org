var addAboveButton = require('./add-above-button')
var addBelowButton = require('./add-below-button')
var addFormWithinButton = require('./add-form-within-button')
var addParagraphWithinButton = require('./add-paragraph-within-button')
var annotationsList = require('./annotations-list')
var classnames = require('classnames')
var deepEqual = require('deep-equal')
var get = require('keyarray').get
var group = require('commonform-group-series')
var h = require('virtual-dom/h')
var heading = require('./heading')
var jsonClone = require('../utility/json-clone')
var menu = require('./menu')
var paragraph = require('./paragraph')
var pathID = require('../utility/path-id')
var series = require('./series')

function form(state) {
  // State
  var annotations = state.derived.annotations
  var data = state.data
  var emit = state.emit
  var focused = state.focused
  var merkle = state.derived.merkle
  var path = state.path

  // Derivations
  var root = path.length === 0
  var annotationsKey = ( root ? [ ] : [ 'form' ] )
  var annotationsHere = get(
    annotations,
    annotationsKey.concat('annotations'))
  var formObject = ( root ? data : data.form )
  var isFocused = deepEqual(focused, path)
  var groups = group(jsonClone(formObject))
  var emitDataPath = { emit: emit, data: data, path: path }

  // Rendering
  var offset = 0
  return [
    ( isFocused ?
        addAboveButton({ emit: emit, path: path }) :
        undefined ),
    h('section',
      { id: ( 'path:' + pathID(path) ),
        className: classnames({
          conspicuous: ( 'conspicuous' in form ),
          focused: isFocused }),
        onclick: function(event) {
          event.stopPropagation()
          emit('focus', path) },
        attributes: { 'data-digest': merkle.digest } },
      [ ( isFocused ?
            menu({
              data: data,
              digest: merkle.digest,
              emit: emit,
              path: path }) :
            undefined ),
        heading({
          heading: data.heading,
          depth: ( path.length / 2 ),
          emit: emit,
          isFocused: isFocused,
          path: path }),
        ( annotationsHere ?
            annotationsList(annotationsHere) : undefined ),
        groups
          .map(function(group) {
            var groupState = { emit: emit, focused: focused }
            groupState.isFocused = isFocused
            groupState.path = path.concat(annotationsKey)
            groupState.derived = {
              annotations: (
                get(annotations, annotationsKey) ||
                { } ) }
            groupState.data = group
            groupState.offset = offset
            var renderer
            if (group.type === 'series') {
              renderer = series
              groupState.derived.merkle = merkle }
            else {
              renderer = paragraph }
            var result = renderer(groupState)
            offset += group.content.length
            return result }),
        ( isFocused ?
            [ addParagraphWithinButton(emitDataPath), ' ',
              addFormWithinButton(emitDataPath) ] :
            undefined ) ]),
    ( isFocused ?
        addBelowButton({ emit: emit, path: path }) :
        undefined ) ] }

module.exports = form
