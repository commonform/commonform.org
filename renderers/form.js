var annotationsList = require('./annotations-list')
var classnames = require('classnames')
var jsonClone = require('../utility/json-clone')
var deepEqual = require('deep-equal')
var get = require('keyarray').get
var group = require('commonform-group-series')
var h = require('virtual-dom/h')
var heading = require('./heading')
var menu = require('./menu')
var paragraph = require('./paragraph')
var pathID = require('../utility/path-id')
var series = require('./series')

function form(state) {
  // State properties
  var annotations = state.derived.annotations
  var data = state.data
  var emit = state.emit
  var focused = state.focused
  var merkle = state.derived.merkle
  var path = state.path
  // Derivations from state
  var root = path.length === 0
  var annotationsKey = ( root ? [ ] : [ 'form' ] )
  var annotationsHere = get(
    annotations,
    annotationsKey.concat('annotations'))
  var formObject = ( root ? data : data.form )
  var isFocused = deepEqual(focused, path)
  var groups = group(jsonClone(formObject))
  var offset = 0
  return h(
    'section',
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
        data: data.heading,
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
          return result }) ]) }

module.exports = form
