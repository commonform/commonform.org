var annotations = require('./annotations')
var classnames = require('classnames')
var clone = require('clone')
var deepEqual = require('deep-equal')
var get = require('keyarray-get')
var group = require('commonform-group-series')
var h = require('virtual-dom/h')
var heading = require('./heading')
var menu = require('./menu')
var paragraph = require('./paragraph')
var pick = require('object-pick')
var series = require('./series')

function form(state) {
  var root = state.path.length === 0
  var annotationsKey = ( root ? [ ] : [ 'form' ] )
  var annotationsHere = get(
    state.annotationsTree,
    annotationsKey.concat('annotations'))
  var hasHeading = ( !root && ( 'heading' in state.data ) )
  var formObject = ( root ? state.data : state.data.form )
  var isFocused = deepEqual(state.focused, state.path)
  var groups = group(clone(formObject))
  var offset = 0
  return h(
    'section',
    { className: classnames({
        conspicuous: ( 'conspicuous' in form ),
        focused: isFocused }),
      onclick: function(event) {
        event.stopPropagation()
        state.emit('focus', state.path) },
      attributes: {
        'data-digest': state.merkle.digest } },
    [ ( isFocused ? menu(state) : undefined ),
      ( hasHeading ?
          heading({
            digest: state.digest,
            depth: ( state.path.length / 2 ),
            emit: state.emit,
            data: state.data.heading }) :
          null ),
     groups
        .map(function(group) {
          var groupState = pick(state, [ 'digest', 'emit', 'focused' ])
          groupState.path = state.path.concat(annotationsKey)
          groupState.annotationsTree = (
            get(state.annotationsTree, annotationsKey) ||
            { } )
          groupState.data = group
          groupState.offset = offset
          var renderer
          if (group.type === 'series') {
            renderer = series
            groupState.merkle = state.merkle }
          else {
            renderer = paragraph }
          var result = renderer(groupState)
          offset += group.content.length
          return result }),
      ( annotationsHere ?
          annotations(annotationsHere) :
          null ) ]) }

module.exports = form
