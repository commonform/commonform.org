module.exports = form

var classnames = require('classnames')
var deepEqual = require('deep-equal')
var get = require('keyarray').get
var group = require('commonform-group-series')
var h = require('virtual-dom/h')
var jsonClone = require('../utility/json-clone')
var renderAnnotations = require('./annotations')
var renderDigest = require('./digest')
var renderHeading = require('./heading')
var renderParagraph = require('./paragraph')
var renderSeries = require('./series')

function form(state) {
  // State
  var annotations = state.derived.annotations
  var blanks = state.blanks
  var form = state.form
  var emit = state.emit
  var focused = state.focused
  var merkle = state.derived.merkle
  var path = state.path

  // Derivations
  var root = path.length === 0
  var formKey = ( root ? [ ] : [ 'form' ] )
  var formObject = ( root ? form : form.form )
  var groups = group(jsonClone(formObject))
  var isFocused = deepEqual(focused, path)
  var annotationsHere = get(
    annotations,
    formKey.concat('annotations'),
    [ ])

  // Rendering
  var offset = 0
  return [
    h('section',
      { className: classnames({
          conspicuous: ( 'conspicuous' in formObject ),
          focused: isFocused }),
        attributes: { 'data-digest': merkle.digest },
        ondblclick: function(event) {
          event.stopPropagation()
          emit('focus', path) } },
      [ renderHeading({ heading: form.heading, path: path }),
        ( isFocused ?
            h('p.details',
              [ renderDigest({ digest: merkle.digest }),
                renderAnnotations(annotationsHere) ]) :
            undefined ),
        ( annotationsHere.some(function(annotation) {
            return annotation.level === 'error' }) ?
            h('a.flag', { title: 'Error' }, '⚠') :
            undefined ),
        ( annotationsHere.some(function(annotation) {
            return annotation.level !== 'error' }) ?
            h('a.flag', { title: 'Notes' }, '⚐') :
            undefined ),
        groups
          .map(function(group) {
            var groupState = {
              blanks: blanks,
              data: group,
              derived: {
                annotations: get(annotations, formKey, { }) },
              emit: emit,
              focused: focused,
              offset: offset,
              path: path.concat(formKey) }
            var renderer
            if (group.type === 'series') {
              renderer = renderSeries
              groupState.derived.merkle = merkle }
            else {
              renderer = renderParagraph }
            var result = renderer(groupState)
            offset += group.content.length
            return result }) ]) ] }
